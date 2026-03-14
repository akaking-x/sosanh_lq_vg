/**
 * Script: Fetch LQ Hero Images
 * Tải ảnh tướng Liên Quân từ nhiều nguồn khác nhau lên S3
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const { s3Client } = require('../server/config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sosanh_lq_vg';
const S3_BUCKET = process.env.S3_BUCKET || 'sosanh-lq-vg';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://s3.cloudfly.vn';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * LQ hero image URL patterns to try
 */
function getLQImageUrls(heroName) {
  const slug = heroName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]/g, '')
    .trim();

  // Original name for garena URLs
  const garenaName = heroName.toLowerCase().replace(/\s+/g, '-')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9-]/g, '');

  return [
    // Garena CDN patterns
    `https://lienquan.garena.vn/wp-content/uploads/2024/05/${garenaName}.jpg`,
    `https://lienquan.garena.vn/wp-content/uploads/2023/11/${garenaName}.jpg`,
    `https://lienquan.garena.vn/wp-content/uploads/2024/01/${garenaName}.jpg`,
    `https://lienquan.garena.vn/wp-content/uploads/2023/05/${garenaName}.jpg`,
    // AOV wiki patterns
    `https://static.wikia.nocookie.net/arena-of-valor/images/${slug[0]}/${slug.substring(0,2)}/${heroName}_Portrait.png`,
    // Alternative garena format
    `https://lienquan.garena.vn/wp-content/uploads/2024/05/${heroName.toLowerCase().replace(/['\s]/g, '')}.jpg`,
    `https://lienquan.garena.vn/wp-content/uploads/2024/05/${heroName.toLowerCase().replace(/['\s]/g, '-')}.jpg`,
  ];
}

async function downloadImage(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    validateStatus: (status) => status === 200,
  });
  return {
    buffer: Buffer.from(response.data),
    contentType: response.headers['content-type'] || 'image/jpeg',
  };
}

async function uploadToS3(buffer, key, contentType) {
  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }));
  return `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
}

async function main() {
  console.log('=== Fetching LQ Hero Images ===\n');

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // Get all LQ heroes without S3 images
  const heroes = await db.collection('heroes').find({
    game: 'lq',
    $or: [
      { avatar_url: '' },
      { avatar_url: { $exists: false } },
      { avatar_url: null },
      { avatar_url: { $not: /s3\.cloudfly/ } },
    ],
  }).toArray();

  console.log(`Found ${heroes.length} LQ heroes needing images\n`);

  let success = 0, failed = 0;

  for (const hero of heroes) {
    const urls = getLQImageUrls(hero.name_vi);
    let downloaded = false;

    for (const url of urls) {
      try {
        const { buffer, contentType } = await downloadImage(url);
        if (buffer.length < 1000) continue; // Skip tiny/empty responses

        const ext = contentType.includes('png') ? 'png' : 'jpg';
        const key = `heroes/lq/${hero.slug}.${ext}`;
        const s3Url = await uploadToS3(buffer, key, contentType);

        await db.collection('heroes').updateOne(
          { _id: hero._id },
          { $set: { avatar_url: s3Url } }
        );

        console.log(`  ✓ ${hero.name_vi} → ${key}`);
        success++;
        downloaded = true;
        break;
      } catch (e) {
        // Try next URL
      }
    }

    if (!downloaded) {
      console.log(`  ✗ ${hero.name_vi} - no image found`);
      failed++;
    }

    await sleep(200); // Be nice to servers
  }

  console.log(`\nDone: ${success} downloaded, ${failed} not found`);

  const withImage = await db.collection('heroes').countDocuments({
    game: 'lq', avatar_url: { $regex: /s3\.cloudfly/ }
  });
  const withoutImage = await db.collection('heroes').countDocuments({
    game: 'lq', $or: [{ avatar_url: '' }, { avatar_url: null }, { avatar_url: { $exists: false } }]
  });
  console.log(`LQ heroes with S3 image: ${withImage}`);
  console.log(`LQ heroes without image: ${withoutImage}`);

  await mongoose.disconnect();
}

main().catch(console.error);
