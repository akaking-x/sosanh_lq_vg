/**
 * Seed Database Script
 * Import dữ liệu từ JSON files vào MongoDB
 * Usage: node scripts/seedDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

// Models
const Hero = require('../server/models/Hero');
const Item = require('../server/models/Item');
const Rune = require('../server/models/Rune');
const SummonerSkill = require('../server/models/SummonerSkill');
const HeroMapping = require('../server/models/HeroMapping');
const Admin = require('../server/models/Admin');

// ============================================
// Mapping role tiếng Anh → tiếng Việt
// ============================================
const ROLE_MAP = {
  'fighter': 'Chiến Binh',
  'warrior': 'Chiến Binh',
  'tank': 'Bộ Binh',
  'mage': 'Pháp Sư',
  'assassin': 'Sát Thủ',
  'marksman': 'Tấn Công',
  'adc': 'Tấn Công',
  'support': 'Hỗ Trợ',
  // Vietnamese roles (nếu data đã là tiếng Việt)
  'sát thủ': 'Sát Thủ',
  'tấn công': 'Tấn Công',
  'hỗ trợ': 'Hỗ Trợ',
  'pháp sư': 'Pháp Sư',
  'chiến binh': 'Chiến Binh',
  'bộ binh': 'Bộ Binh',
};

// Mapping skill type
const SKILL_TYPE_MAP = {
  'passive': 'Passive',
  'skill1': 'Skill1',
  'skill2': 'Skill2',
  'skill3': 'Skill3',
  'ultimate': 'R',
  'skill_1': 'Skill1',
  'skill_2': 'Skill2',
  'skill_3': 'Skill3',
  'skill_4': 'Skill4',
};

// Mapping item category
const ITEM_CATEGORY_MAP = {
  'attack': 'Vũ Khí',
  'weapon': 'Vũ Khí',
  'defense': 'Giáp Cứng',
  'armor': 'Giáp Cứng',
  'magic': 'Phép Thuật',
  'movement': 'Di Chuyển',
  'jungle': 'Không Phân Loại',
  'support': 'Hỗ Trợ',
  'utility': 'Hỗ Trợ',
};

// ============================================
// Helper Functions
// ============================================
function loadJSON(filename) {
  const filePath = path.join(__dirname, '..', 'data', filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File không tồn tại: ${filename}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function mapRoles(roles) {
  if (!roles || !Array.isArray(roles)) return ['Chiến Binh'];
  return [...new Set(roles.map(r => {
    const mapped = ROLE_MAP[r.toLowerCase()];
    return mapped || 'Chiến Binh';
  }))];
}

function mapSkillType(type) {
  if (!type) return 'Skill1';
  return SKILL_TYPE_MAP[type.toLowerCase()] || 'Skill1';
}

function mapItemCategory(cat) {
  if (!cat) return 'Không Phân Loại';
  return ITEM_CATEGORY_MAP[cat.toLowerCase()] || 'Không Phân Loại';
}

function makeSlug(name, game) {
  return slugify(`${name}-${game}`, { lower: true, strict: true });
}

// ============================================
// Seed Functions
// ============================================

async function seedAdmin() {
  console.log('\n🔐 Seeding admin...');

  const existing = await Admin.findOne({ username: 'admin' });
  if (existing) {
    console.log('   Admin đã tồn tại, bỏ qua');
    return;
  }

  const admin = new Admin({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    email: 'admin@sosanh.vn',
    fullName: 'System Admin',
    role: 'admin',
    isActive: true,
  });

  await admin.save();
  console.log('   ✅ Admin đã được tạo: admin / admin123');
}

async function seedVGHeroes() {
  console.log('\n🎮 Seeding Vương Giả Vinh Diệu heroes...');

  const data = loadJSON('vg_heroes.json');
  if (!data || !data.heroes) return 0;

  let count = 0;
  for (const hero of data.heroes) {
    try {
      const slug = makeSlug(hero.name_vi || hero.name_cn, 'vg');

      // Kiểm tra đã tồn tại chưa
      const existing = await Hero.findOne({ slug });
      if (existing) continue;

      const skills = (hero.skills || []).map(s => ({
        name_vi: s.name_vi || s.name_cn || 'Chưa dịch',
        name_cn: s.name_cn || '',
        description_vi: s.description_vi || s.description_cn || 'Chưa dịch',
        description_cn: s.description_cn || '',
        type: mapSkillType(s.type),
        icon_url: s.icon_url || '',
        cooldown: typeof s.cooldown === 'number' ? s.cooldown : 0,
        manaCost: typeof s.mana_cost === 'number' ? s.mana_cost : 0,
      }));

      const skins = (hero.skins || []).map(s => {
        if (typeof s === 'string') {
          return { name_vi: s, name_cn: s };
        }
        return {
          name_vi: s.name_vi || s.name || s,
          name_cn: s.name_cn || '',
          icon_url: s.icon_url || '',
        };
      });

      await Hero.create({
        name_vi: hero.name_vi || hero.name_cn,
        name_cn: hero.name_cn || '',
        title_vi: hero.title_vi || hero.title_cn || hero.name_vi || 'Tướng',
        title_cn: hero.title_cn || '',
        slug,
        game: 'vg',
        roles: mapRoles(hero.roles),
        difficulty: Math.min(5, Math.max(1, Math.ceil((hero.difficulty || 5) / 2))),
        skills,
        stats: {
          hp: hero.stats?.hp || 0,
          attackPower: hero.stats?.attack || 0,
          armor: hero.stats?.defense || 0,
          magicResistance: hero.stats?.ability || 0,
        },
        avatar_url: hero.avatar_url || '',
        skins,
        description: hero.runes_vi || '',
        supported_languages: ['vi', 'cn'],
        isActive: true,
      });

      count++;
    } catch (err) {
      if (err.code !== 11000) {
        console.warn(`   ⚠️  Lỗi khi import VG hero ${hero.name_vi}: ${err.message}`);
      }
    }
  }

  console.log(`   ✅ Đã import ${count} tướng VG`);
  return count;
}

async function seedLQHeroes() {
  console.log('\n🎮 Seeding Liên Quân Mobile heroes...');

  const data = loadJSON('lq_heroes.json');
  if (!data || !data.heroes) return 0;

  let count = 0;
  for (const hero of data.heroes) {
    try {
      const slug = makeSlug(hero.name_vi, 'lq');

      const existing = await Hero.findOne({ slug });
      if (existing) continue;

      const skills = (hero.skills || []).map(s => ({
        name_vi: s.name_vi || 'Chưa có tên',
        description_vi: s.description_vi || 'Chưa có mô tả',
        type: mapSkillType(s.type),
        icon_url: s.icon_url || '',
        cooldown: typeof s.cooldown === 'number' ? s.cooldown : 0,
        manaCost: typeof s.mana_cost === 'number' ? s.mana_cost : 0,
      }));

      const skins = (hero.skins || []).map(s => {
        if (typeof s === 'string') return { name_vi: s };
        return { name_vi: s.name_vi || s.name || s, icon_url: s.icon_url || '' };
      });

      await Hero.create({
        name_vi: hero.name_vi,
        title_vi: hero.title_vi || hero.name_vi,
        slug,
        game: 'lq',
        roles: mapRoles(hero.roles),
        difficulty: Math.min(5, Math.max(1, Math.ceil((hero.difficulty || 5) / 2))),
        skills,
        stats: {
          hp: hero.stats?.hp || 0,
          attackPower: hero.stats?.attack || 0,
          armor: hero.stats?.defense || 0,
          magicResistance: hero.stats?.ability || 0,
        },
        avatar_url: hero.avatar_url || '',
        skins,
        description: hero.recommended_runes || '',
        supported_languages: ['vi'],
        isActive: true,
      });

      count++;
    } catch (err) {
      if (err.code !== 11000) {
        console.warn(`   ⚠️  Lỗi khi import LQ hero ${hero.name_vi}: ${err.message}`);
      }
    }
  }

  console.log(`   ✅ Đã import ${count} tướng LQ`);
  return count;
}

async function seedVGItems() {
  console.log('\n🗡️  Seeding Vương Giả Vinh Diệu items...');

  const data = loadJSON('vg_items.json');
  if (!data || !data.items) return 0;

  let count = 0;
  for (const item of data.items) {
    try {
      const name = item.name_vi || item.name_cn || `Item_${item.id}`;
      const slug = makeSlug(name, 'vg');

      const existing = await Item.findOne({ slug });
      if (existing) continue;

      await Item.create({
        name_vi: name,
        name_cn: item.name_cn || '',
        slug,
        game: 'vg',
        category: mapItemCategory(item.category),
        price: item.price || 0,
        stats: {
          attackPower: item.stats?.physical_attack || item.stats?.attackPower || 0,
          armor: item.stats?.armor || 0,
          magicResistance: item.stats?.magic_resistance || 0,
          hp: item.stats?.max_hp || item.stats?.hp || 0,
          mana: item.stats?.max_mana || item.stats?.mana || 0,
          attackSpeed: item.stats?.attack_speed || item.stats?.attackSpeed || 0,
          critChance: item.stats?.crit_chance || item.stats?.critChance || 0,
          lifeSteal: item.stats?.lifesteal || item.stats?.lifeSteal || 0,
          moveSpeed: item.stats?.movement_speed || item.stats?.moveSpeed || 0,
          cooldownReduction: item.stats?.cooldown_reduction || item.stats?.cooldownReduction || 0,
          spellPower: item.stats?.spell_power || item.stats?.spellPower || 0,
        },
        passive_vi: item.passive || '',
        passive_cn: item.passive || '',
        active_vi: item.active || '',
        active_cn: item.active || '',
        icon_url: item.icon_url || '',
        isActive: true,
      });

      count++;
    } catch (err) {
      if (err.code !== 11000) {
        console.warn(`   ⚠️  Lỗi khi import VG item: ${err.message}`);
      }
    }
  }

  console.log(`   ✅ Đã import ${count} trang bị VG`);
  return count;
}

async function seedLQItems() {
  console.log('\n🗡️  Seeding Liên Quân Mobile items...');

  const data = loadJSON('lq_items.json');
  if (!data || !data.items) return 0;

  let count = 0;
  for (const item of data.items) {
    try {
      const name = item.name_vi || `Item_${item.id}`;
      const slug = makeSlug(name, 'lq');

      const existing = await Item.findOne({ slug });
      if (existing) continue;

      await Item.create({
        name_vi: name,
        slug,
        game: 'lq',
        category: mapItemCategory(item.category),
        price: item.price || 0,
        stats: {
          attackPower: item.stats?.physical_attack || item.stats?.attackPower || 0,
          armor: item.stats?.armor || 0,
          magicResistance: item.stats?.magic_resistance || 0,
          hp: item.stats?.max_hp || item.stats?.hp || 0,
          attackSpeed: item.stats?.attack_speed || item.stats?.attackSpeed || 0,
          moveSpeed: item.stats?.movement_speed || item.stats?.moveSpeed || 0,
          spellPower: item.stats?.spell_power || item.stats?.spellPower || 0,
        },
        passive_vi: item.passive || '',
        active_vi: item.active || '',
        icon_url: item.icon_url || '',
        isActive: true,
      });

      count++;
    } catch (err) {
      if (err.code !== 11000) {
        console.warn(`   ⚠️  Lỗi khi import LQ item: ${err.message}`);
      }
    }
  }

  console.log(`   ✅ Đã import ${count} trang bị LQ`);
  return count;
}

async function seedRunes() {
  console.log('\n💎 Seeding runes/ngọc...');

  let count = 0;

  for (const [game, filename] of [['vg', 'vg_runes.json'], ['lq', 'lq_runes.json']]) {
    const data = loadJSON(filename);
    if (!data || !data.runes) continue;

    for (const rune of data.runes) {
      try {
        const name = rune.name_vi || rune.name_cn || rune.name_en || `Rune_${rune.id}`;
        const slug = makeSlug(name, game);

        const existing = await Rune.findOne({ slug });
        if (existing) continue;

        await Rune.create({
          name_vi: name,
          name_cn: rune.name_cn || '',
          slug,
          game,
          tier: rune.tier || 'A',
          category: rune.category || 'Sức Mạnh',
          stats: rune.stats || {},
          description_vi: rune.description_vi || rune.description || '',
          description_cn: rune.description_cn || '',
          icon_url: rune.icon_url || '',
          isActive: true,
        });

        count++;
      } catch (err) {
        if (err.code !== 11000) {
          console.warn(`   ⚠️  Lỗi khi import rune: ${err.message}`);
        }
      }
    }
  }

  console.log(`   ✅ Đã import ${count} ngọc/minh văn`);
  return count;
}

async function seedSummonerSkills() {
  console.log('\n⚡ Seeding summoner skills/phép bổ trợ...');

  let count = 0;

  for (const [game, filename] of [['vg', 'vg_summoner_skills.json'], ['lq', 'lq_summoner_skills.json']]) {
    const data = loadJSON(filename);
    if (!data || !data.summoner_skills) continue;

    for (const skill of data.summoner_skills) {
      try {
        const name = skill.name_vi || skill.name_cn || skill.name_en || `Skill_${skill.id}`;
        const slug = makeSlug(name, game);

        const existing = await SummonerSkill.findOne({ slug });
        if (existing) continue;

        await SummonerSkill.create({
          name_vi: name,
          name_cn: skill.name_cn || '',
          slug,
          game,
          description_vi: skill.description_vi || skill.description || '',
          description_cn: skill.description_cn || '',
          cooldown: skill.cooldown_seconds || skill.cooldown || 0,
          unlock_level: skill.unlock_level || 1,
          icon_url: skill.icon_url || '',
          isActive: true,
        });

        count++;
      } catch (err) {
        if (err.code !== 11000) {
          console.warn(`   ⚠️  Lỗi khi import summoner skill: ${err.message}`);
        }
      }
    }
  }

  console.log(`   ✅ Đã import ${count} phép bổ trợ`);
  return count;
}

async function seedHeroMappings() {
  console.log('\n🔗 Seeding hero mappings...');

  const data = loadJSON('hero_mapping.json');
  if (!data || !data.mappings) return 0;

  let count = 0;
  for (const mapping of data.mappings) {
    try {
      // Tìm hero VG bằng tên
      const vgName = mapping.hok_name_vi || mapping.vg_name_vi;
      const lqName = mapping.aov_name_vi || mapping.lq_name_vi;

      if (!vgName || !lqName) continue;

      const vgHero = await Hero.findOne({
        game: 'vg',
        $or: [
          { name_vi: { $regex: new RegExp(`^${vgName}$`, 'i') } },
          { name_cn: { $regex: new RegExp(`^${mapping.hok_name_cn || mapping.vg_name_cn}$`, 'i') } },
        ],
      });

      const lqHero = await Hero.findOne({
        game: 'lq',
        name_vi: { $regex: new RegExp(`^${lqName}$`, 'i') },
      });

      if (!vgHero || !lqHero) {
        console.log(`   ⏭  Bỏ qua mapping: ${vgName} ↔ ${lqName} (không tìm thấy tướng)`);
        continue;
      }

      // Kiểm tra đã tồn tại chưa
      const existing = await HeroMapping.findOne({
        vg_hero: vgHero._id,
        lq_hero: lqHero._id,
      });
      if (existing) continue;

      // Chuyển đổi skill comparison
      const skillComparison = (mapping.skill_comparison || []).map(sc => ({
        vg_skill: sc.hok_skill_vi || sc.vg_skill || '',
        lq_skill: sc.aov_skill_vi || sc.lq_skill || '',
        similarity_note: [
          sc.similarity || '',
          sc.difference ? `Khác biệt: ${sc.difference}` : '',
        ].filter(Boolean).join('. '),
      }));

      await HeroMapping.create({
        vg_hero: vgHero._id,
        lq_hero: lqHero._id,
        similarity_score: mapping.similarity_score || 50,
        skill_comparison: skillComparison,
        notes: mapping.overall_notes || mapping.notes || '',
        is_verified: false,
      });

      count++;
      console.log(`   ✅ ${vgHero.name_vi} (VG) ↔ ${lqHero.name_vi} (LQ) - ${mapping.similarity_score}%`);
    } catch (err) {
      console.warn(`   ⚠️  Lỗi mapping: ${err.message}`);
    }
  }

  console.log(`   ✅ Đã import ${count} ánh xạ tướng`);
  return count;
}

// ============================================
// Main Seed Function
// ============================================
async function seed() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     SEED DATABASE - So Sánh LQ & VG     ║');
  console.log('╚══════════════════════════════════════════╝');

  try {
    // Kết nối MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sosanh_lq_vg';
    console.log(`\n📡 Đang kết nối MongoDB: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('✅ Đã kết nối MongoDB thành công');

    // Kiểm tra flag --fresh để xóa toàn bộ dữ liệu
    if (process.argv.includes('--fresh')) {
      console.log('\n🗑️  Xóa toàn bộ dữ liệu cũ...');
      await Promise.all([
        Hero.deleteMany({}),
        Item.deleteMany({}),
        Rune.deleteMany({}),
        SummonerSkill.deleteMany({}),
        HeroMapping.deleteMany({}),
      ]);
      console.log('   ✅ Đã xóa xong');
    }

    // Seed theo thứ tự
    await seedAdmin();

    const results = {
      vgHeroes: await seedVGHeroes(),
      lqHeroes: await seedLQHeroes(),
      vgItems: await seedVGItems(),
      lqItems: await seedLQItems(),
      runes: await seedRunes(),
      summonerSkills: await seedSummonerSkills(),
      mappings: await seedHeroMappings(),
    };

    // Tóm tắt kết quả
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║            KẾT QUẢ SEED                 ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Tướng VG:        ${String(results.vgHeroes).padStart(6)}               ║`);
    console.log(`║  Tướng LQ:        ${String(results.lqHeroes).padStart(6)}               ║`);
    console.log(`║  Trang bị VG:     ${String(results.vgItems).padStart(6)}               ║`);
    console.log(`║  Trang bị LQ:     ${String(results.lqItems).padStart(6)}               ║`);
    console.log(`║  Ngọc/Minh văn:   ${String(results.runes).padStart(6)}               ║`);
    console.log(`║  Phép bổ trợ:     ${String(results.summonerSkills).padStart(6)}               ║`);
    console.log(`║  Ánh xạ tướng:    ${String(results.mappings).padStart(6)}               ║`);
    console.log('╚══════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n❌ Lỗi seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

// Chạy seed
seed();
