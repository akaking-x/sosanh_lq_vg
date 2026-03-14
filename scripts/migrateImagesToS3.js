/**
 * Script: Migrate Images to S3
 * Tải ảnh từ CDN gốc (game.gtimg.cn, pvp.qq.com, lienquan.garena.vn)
 * lên S3 (s3.cloudfly.vn) và cập nhật URL trong MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const { s3Client } = require('../server/config/s3');
const {
  uploadFromUrl,
  ensureBucketExists,
  generateHeroImageKey,
  generateItemImageKey,
  getPublicUrl,
} = require('../server/services/s3Service');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sosanh_lq_vg';
const S3_BUCKET = process.env.S3_BUCKET || 'sosanh-lq-vg';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://s3.cloudfly.vn';

// Concurrency control
const CONCURRENCY = 5;
const RETRY_MAX = 3;
const RETRY_DELAY = 2000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Download image with retries
 */
async function downloadImage(url, retries = RETRY_MAX) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': url.includes('gtimg.cn') ? 'https://pvp.qq.com/' :
                     url.includes('garena') ? 'https://lienquan.garena.vn/' : '',
        },
      });
      return {
        buffer: Buffer.from(response.data),
        contentType: response.headers['content-type'] || 'image/png',
      };
    } catch (err) {
      if (i < retries - 1) {
        console.log(`  Retry ${i + 1}/${retries} for ${url}: ${err.message}`);
        await sleep(RETRY_DELAY * (i + 1));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Upload buffer to S3
 */
async function uploadToS3(buffer, key, contentType = 'image/png') {
  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }));
  return `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
}

/**
 * Process items in batches with concurrency
 */
async function processBatch(items, processFn) {
  const results = { success: 0, failed: 0, skipped: 0 };

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const promises = batch.map(async (item) => {
      try {
        const result = await processFn(item);
        if (result === 'skipped') {
          results.skipped++;
        } else {
          results.success++;
        }
      } catch (err) {
        results.failed++;
        console.error(`  FAILED: ${item.name_vi || item._id}: ${err.message}`);
      }
    });
    await Promise.all(promises);

    if (i + CONCURRENCY < items.length) {
      process.stdout.write(`  Progress: ${Math.min(i + CONCURRENCY, items.length)}/${items.length}\r`);
    }
  }

  console.log(`  Done: ${results.success} success, ${results.failed} failed, ${results.skipped} skipped`);
  return results;
}

/**
 * Check if URL is already on S3
 */
function isS3Url(url) {
  return url && (url.includes('s3.cloudfly.vn') || url.includes(S3_BUCKET));
}

/**
 * Migrate hero avatars
 */
async function migrateHeroAvatars(db) {
  console.log('\n=== Migrating Hero Avatars ===');

  const heroes = await db.collection('heroes').find({
    avatar_url: { $exists: true, $ne: '' }
  }).toArray();

  console.log(`Found ${heroes.length} heroes with avatars`);

  await processBatch(heroes, async (hero) => {
    if (isS3Url(hero.avatar_url)) {
      return 'skipped';
    }

    const key = `heroes/${hero.game}/${hero.slug}.jpg`;
    const { buffer, contentType } = await downloadImage(hero.avatar_url);
    const newUrl = await uploadToS3(buffer, key, contentType);

    await db.collection('heroes').updateOne(
      { _id: hero._id },
      { $set: { avatar_url: newUrl } }
    );

    console.log(`  ✓ ${hero.name_vi} (${hero.game}) → ${key}`);
  });
}

/**
 * Migrate hero skill icons
 */
async function migrateHeroSkillIcons(db) {
  console.log('\n=== Migrating Hero Skill Icons ===');

  const heroes = await db.collection('heroes').find({
    'skills.icon_url': { $exists: true }
  }).toArray();

  console.log(`Found ${heroes.length} heroes with skills`);
  let totalSkills = 0;
  let migratedSkills = 0;
  let failedSkills = 0;

  for (const hero of heroes) {
    if (!hero.skills || hero.skills.length === 0) continue;

    let updated = false;
    const updatedSkills = [...hero.skills];

    for (let i = 0; i < updatedSkills.length; i++) {
      const skill = updatedSkills[i];
      totalSkills++;

      if (!skill.icon_url || skill.icon_url === '' || isS3Url(skill.icon_url)) {
        continue;
      }

      try {
        const key = `heroes/${hero.game}/${hero.slug}/skill-${i}.jpg`;
        const { buffer, contentType } = await downloadImage(skill.icon_url);
        const newUrl = await uploadToS3(buffer, key, contentType);
        updatedSkills[i] = { ...skill, icon_url: newUrl };
        updated = true;
        migratedSkills++;
      } catch (err) {
        failedSkills++;
        // Keep original URL if download fails
      }
    }

    if (updated) {
      await db.collection('heroes').updateOne(
        { _id: hero._id },
        { $set: { skills: updatedSkills } }
      );
    }
  }

  console.log(`  Skills: ${migratedSkills} migrated, ${failedSkills} failed, ${totalSkills} total`);
}

/**
 * Migrate hero skin images
 */
async function migrateHeroSkins(db) {
  console.log('\n=== Migrating Hero Skin Images ===');

  const heroes = await db.collection('heroes').find({
    'skins.0': { $exists: true }
  }).toArray();

  console.log(`Found ${heroes.length} heroes with skins`);
  let totalSkins = 0;
  let migratedSkins = 0;
  let failedSkins = 0;

  for (const hero of heroes) {
    if (!hero.skins || hero.skins.length === 0) continue;

    let updated = false;
    const updatedSkins = [...hero.skins];

    for (let i = 0; i < updatedSkins.length; i++) {
      const skin = updatedSkins[i];
      totalSkins++;

      if (!skin.image_url || skin.image_url === '' || isS3Url(skin.image_url)) {
        continue;
      }

      try {
        const ext = skin.image_url.split('.').pop().split('?')[0] || 'jpg';
        const key = `heroes/${hero.game}/${hero.slug}/skin-${i}.${ext}`;
        const { buffer, contentType } = await downloadImage(skin.image_url);
        const newUrl = await uploadToS3(buffer, key, contentType);
        updatedSkins[i] = { ...skin, image_url: newUrl };
        updated = true;
        migratedSkins++;
      } catch (err) {
        failedSkins++;
      }
    }

    if (updated) {
      await db.collection('heroes').updateOne(
        { _id: hero._id },
        { $set: { skins: updatedSkins } }
      );
    }
  }

  console.log(`  Skins: ${migratedSkins} migrated, ${failedSkins} failed, ${totalSkins} total`);
}

/**
 * Migrate item icons
 */
async function migrateItemIcons(db) {
  console.log('\n=== Migrating Item Icons ===');

  const items = await db.collection('items').find({
    icon_url: { $exists: true, $ne: '' }
  }).toArray();

  console.log(`Found ${items.length} items with icons`);

  await processBatch(items, async (item) => {
    if (isS3Url(item.icon_url)) {
      return 'skipped';
    }

    const ext = item.icon_url.split('.').pop().split('?')[0] || 'png';
    const key = `items/${item.game}/${item.slug}.${ext}`;
    const { buffer, contentType } = await downloadImage(item.icon_url);
    const newUrl = await uploadToS3(buffer, key, contentType);

    await db.collection('items').updateOne(
      { _id: item._id },
      { $set: { icon_url: newUrl } }
    );

    console.log(`  ✓ ${item.name_vi} (${item.game}) → ${key}`);
  });
}

/**
 * Migrate rune icons
 */
async function migrateRuneIcons(db) {
  console.log('\n=== Migrating Rune Icons ===');

  const runes = await db.collection('runes').find({
    icon_url: { $exists: true, $ne: '' }
  }).toArray();

  console.log(`Found ${runes.length} runes with icons`);

  if (runes.length === 0) {
    console.log('  No rune icons to migrate');
    return;
  }

  await processBatch(runes, async (rune) => {
    if (isS3Url(rune.icon_url)) {
      return 'skipped';
    }

    const ext = rune.icon_url.split('.').pop().split('?')[0] || 'png';
    const key = `runes/${rune.game}/${rune.slug}.${ext}`;
    const { buffer, contentType } = await downloadImage(rune.icon_url);
    const newUrl = await uploadToS3(buffer, key, contentType);

    await db.collection('runes').updateOne(
      { _id: rune._id },
      { $set: { icon_url: newUrl } }
    );

    console.log(`  ✓ ${rune.name_vi} (${rune.game}) → ${key}`);
  });
}

/**
 * Migrate summoner skill icons
 */
async function migrateSummonerSkillIcons(db) {
  console.log('\n=== Migrating Summoner Skill Icons ===');

  const skills = await db.collection('summonerskills').find({
    icon_url: { $exists: true, $ne: '' }
  }).toArray();

  console.log(`Found ${skills.length} summoner skills with icons`);

  if (skills.length === 0) {
    console.log('  No summoner skill icons to migrate');
    return;
  }

  await processBatch(skills, async (skill) => {
    if (isS3Url(skill.icon_url)) {
      return 'skipped';
    }

    const ext = skill.icon_url.split('.').pop().split('?')[0] || 'png';
    const key = `summoner-skills/${skill.game}/${skill.slug}.${ext}`;
    const { buffer, contentType } = await downloadImage(skill.icon_url);
    const newUrl = await uploadToS3(buffer, key, contentType);

    await db.collection('summonerskills').updateOne(
      { _id: skill._id },
      { $set: { icon_url: newUrl } }
    );

    console.log(`  ✓ ${skill.name_vi} (${skill.game}) → ${key}`);
  });
}

/**
 * Main
 */
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   S3 Image Migration Script              ║');
  console.log('║   CDN → s3.cloudfly.vn                   ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\nS3 Endpoint: ${S3_ENDPOINT}`);
  console.log(`S3 Bucket: ${S3_BUCKET}`);
  console.log(`MongoDB: ${MONGODB_URI}\n`);

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected');

    const db = mongoose.connection.db;

    // Ensure S3 bucket exists
    await ensureBucketExists();
    console.log('✓ S3 bucket ready');

    // Migrate all image types
    await migrateHeroAvatars(db);
    await migrateItemIcons(db);
    await migrateRuneIcons(db);
    await migrateSummonerSkillIcons(db);
    await migrateHeroSkillIcons(db);
    await migrateHeroSkins(db);

    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   Migration Complete!                     ║');
    console.log('╚══════════════════════════════════════════╝');

  } catch (error) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB disconnected');
  }
}

main();
