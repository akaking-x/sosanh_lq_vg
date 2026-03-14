/**
 * Script thêm mappings bổ sung cho tướng chưa có mapping
 */
const mongoose = require('mongoose');
const Hero = require('../server/models/Hero');
const HeroMapping = require('../server/models/HeroMapping');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sosanh_lq_vg';

const ADDITIONAL_MAPPINGS = [
  // === CONFIRMED MATCHES ===
  { vg: 'a-kha-vg', lq: 'butterfly-lq', score: 90, notes: 'A Kha (阿轲) = Butterfly, sát thủ tàng hình reset kỹ năng khi hạ gục' },
  { vg: 'cung-ban-vu-tang-vg', lq: 'zuka-lq', score: 80, notes: 'Cung Bản Vũ Tạng (宫本武藏) = Zuka, đấu sĩ kiếm cơ động' },
  { vg: 'ton-duc-vg', lq: 'zip-lq', score: 75, notes: 'Tôn Dục (梦奇) = Zip, hỗ trợ nuốt/bảo vệ đồng đội' },
  { vg: 'ton-quan-vg', lq: 'moren-lq', score: 75, notes: 'Tôn Quân (李元芳) = Moren, xạ thủ jungle với AoE' },

  // === SKILL-BASED MATCHES ===
  { vg: 'luc-bo-vg', lq: 'dirak-lq', score: 72, notes: 'Lục Bố (女娲/Nữ Oa) = Dirak, pháp sư tạo tường/barrier zoning' },
  { vg: 'kuangtie-vg', lq: 'amily-lq', score: 72, notes: 'Kuangtie (狂铁) = Amily, đấu sĩ solo lane cận chiến' },
  { vg: 'xialuote-vg', lq: 'veres-lq', score: 72, notes: 'Xialuote (夏洛特/Charlotte) = Veres, đấu sĩ nữ combo hút máu' },
  { vg: 'tay-thi-vg', lq: 'jinna-lq', score: 68, notes: 'Tây Thi (西施) = Jinna, pháp sư CC sleep/stun' },
  { vg: 'ban-co-vg', lq: 'kilgroth-lq', score: 68, notes: 'Bàn Cổ (盘古) = Kil\'Groth, đấu sĩ cận chiến trâu bò' },
  { vg: 'thuan-son-vg', lq: 'roxie-lq', score: 65, notes: 'Thuẫn Sơn (盾山) = Roxie, tank với cơ chế đặc biệt/wall' },
  { vg: 'mong-nha-vg', lq: 'slimz-lq', score: 65, notes: 'Mông Nha (蒙犽) = Slimz, jungle xạ thủ cơ động' },
  { vg: 'minh-the-an-vg', lq: 'elandorr-lq', score: 68, notes: 'Minh Thế Ẩn (明世隐) ≈ Eland\'orr, hỗ trợ/xạ thủ cơ chế buff' },
  { vg: 'aguduo-vg', lq: 'ybneth-lq', score: 65, notes: 'Aguduo (阿古朵) = Y\'bneth, tank/hỗ trợ thiên nhiên' },
  { vg: 'khuong-tu-nha-vg', lq: 'flash-lq', score: 65, notes: 'Khương Tử Nha (姜子牙) = Flash, pháp sư hỗ trợ buff team' },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const allHeroes = await Hero.find({ isActive: true }).lean();
  const heroBySlug = {};
  allHeroes.forEach(h => { heroBySlug[h.slug] = h; });

  // Get already mapped hero IDs
  const existingMappings = await HeroMapping.find().lean();
  const mappedLqIds = new Set(existingMappings.map(m => m.lq_hero.toString()));
  const mappedVgIds = new Set(existingMappings.map(m => m.vg_hero.toString()));

  let created = 0;
  let skipped = 0;

  for (const mapping of ADDITIONAL_MAPPINGS) {
    const vgHero = heroBySlug[mapping.vg];
    const lqHero = heroBySlug[mapping.lq];

    if (!vgHero) {
      console.log(`  [SKIP] VG hero not found: ${mapping.vg}`);
      skipped++;
      continue;
    }
    if (!lqHero) {
      console.log(`  [SKIP] LQ hero not found: ${mapping.lq}`);
      skipped++;
      continue;
    }

    // Skip if either hero is already mapped
    if (mappedLqIds.has(lqHero._id.toString())) {
      console.log(`  [SKIP] LQ hero ${lqHero.name_vi} already mapped`);
      skipped++;
      continue;
    }
    if (mappedVgIds.has(vgHero._id.toString())) {
      console.log(`  [SKIP] VG hero ${vgHero.name_vi} already mapped`);
      skipped++;
      continue;
    }

    try {
      const newMapping = new HeroMapping({
        vg_hero: vgHero._id,
        lq_hero: lqHero._id,
        similarity_score: mapping.score,
        notes: mapping.notes,
        is_verified: true,
      });
      await newMapping.save();
      mappedLqIds.add(lqHero._id.toString());
      mappedVgIds.add(vgHero._id.toString());
      console.log(`  [CREATED] ${vgHero.name_vi} <-> ${lqHero.name_vi} | score: ${mapping.score}`);
      created++;
    } catch (err) {
      console.error(`  [ERROR] ${mapping.vg} <-> ${mapping.lq}: ${err.message}`);
    }
  }

  const finalCount = await HeroMapping.countDocuments();
  console.log(`\n=== Summary ===`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total mappings: ${finalCount}`);

  // Remaining unmapped
  const allMappings = await HeroMapping.find().lean();
  const allMappedLq = new Set(allMappings.map(m => m.lq_hero.toString()));
  const allMappedVg = new Set(allMappings.map(m => m.vg_hero.toString()));

  const unmappedLq = allHeroes.filter(h => h.game === 'lq' && !allMappedLq.has(h._id.toString()));
  const unmappedVg = allHeroes.filter(h => h.game === 'vg' && !allMappedVg.has(h._id.toString()));
  console.log(`\nRemaining unmapped LQ: ${unmappedLq.length}`);
  unmappedLq.forEach(h => console.log(`  - ${h.name_vi} (${h.slug})`));
  console.log(`\nRemaining unmapped VG: ${unmappedVg.length}`);
  unmappedVg.forEach(h => console.log(`  - ${h.name_vi} / ${h.name_cn} (${h.slug})`));

  await mongoose.disconnect();
  console.log('\nDone!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
