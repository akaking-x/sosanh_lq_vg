/**
 * Script: Add Missing LQ Heroes + Update Mappings
 * Bổ sung tướng Liên Quân thiếu và cập nhật lại mapping
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sosanh_lq_vg';

function createSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj').replace(/Đ/g, 'Dj')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * All LQ heroes with roles
 * Source: bietwiki.com, lienquan.garena.vn
 */
const ALL_LQ_HEROES = [
  // Pháp Sư (Mage)
  { name_vi: 'Aleister', roles: ['Pháp Sư'], difficulty: 3 },
  { name_vi: "Azzen'Ka", roles: ['Pháp Sư'], difficulty: 2 },
  { name_vi: "D'Arcy", roles: ['Pháp Sư'], difficulty: 4 },
  { name_vi: 'Điêu Thuyền', roles: ['Pháp Sư'], difficulty: 3 },
  { name_vi: 'Dirak', roles: ['Pháp Sư'], difficulty: 3 },
  { name_vi: 'Flash', roles: ['Pháp Sư'], difficulty: 4 },
  { name_vi: 'Gildur', roles: ['Pháp Sư', 'Đỡ Đòn'], difficulty: 3 },
  { name_vi: 'Iggy', roles: ['Pháp Sư'], difficulty: 3 },
  { name_vi: 'Ignis', roles: ['Pháp Sư'], difficulty: 3 },
  { name_vi: 'Ilumia', roles: ['Pháp Sư'], difficulty: 3 },
  { name_vi: 'Ishar', roles: ['Pháp Sư', 'Hỗ Trợ'], difficulty: 3 },
  { name_vi: 'Jinna', roles: ['Pháp Sư'], difficulty: 2 },
  { name_vi: 'Kahlii', roles: ['Pháp Sư'], difficulty: 2 },
  { name_vi: 'Krixi', roles: ['Pháp Sư'], difficulty: 2 },
  { name_vi: 'Lauriel', roles: ['Pháp Sư'], difficulty: 4 },
  { name_vi: 'Liliana', roles: ['Pháp Sư'], difficulty: 4 },
  { name_vi: 'Lorion', roles: ['Pháp Sư'], difficulty: 4 },
  { name_vi: 'Marja', roles: ['Pháp Sư', 'Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Mganga', roles: ['Pháp Sư'], difficulty: 2 },
  { name_vi: 'Natalya', roles: ['Pháp Sư'], difficulty: 3 },
  { name_vi: 'Preyta', roles: ['Pháp Sư'], difficulty: 2 },
  { name_vi: 'Raz', roles: ['Pháp Sư'], difficulty: 4 },
  { name_vi: 'Sephera', roles: ['Pháp Sư', 'Hỗ Trợ'], difficulty: 3 },
  { name_vi: 'Tulen', roles: ['Pháp Sư'], difficulty: 4 },
  { name_vi: 'Veera', roles: ['Pháp Sư'], difficulty: 1 },
  { name_vi: 'Zata', roles: ['Pháp Sư', 'Sát Thủ'], difficulty: 5 },
  { name_vi: 'Zill', roles: ['Pháp Sư', 'Sát Thủ'], difficulty: 4 },
  { name_vi: 'Yue', roles: ['Pháp Sư'], difficulty: 4 },
  { name_vi: 'Jinnar', roles: ['Pháp Sư'], difficulty: 2 },

  // Sát Thủ (Assassin)
  { name_vi: 'Airi', roles: ['Sát Thủ', 'Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Butterfly', roles: ['Sát Thủ'], difficulty: 2 },
  { name_vi: 'Enzo', roles: ['Sát Thủ'], difficulty: 5 },
  { name_vi: 'Keera', roles: ['Sát Thủ'], difficulty: 4 },
  { name_vi: 'Kriknak', roles: ['Sát Thủ'], difficulty: 3 },
  { name_vi: 'Murad', roles: ['Sát Thủ'], difficulty: 5 },
  { name_vi: 'Nakroth', roles: ['Sát Thủ'], difficulty: 5 },
  { name_vi: 'Paine', roles: ['Sát Thủ', 'Pháp Sư'], difficulty: 4 },
  { name_vi: 'Quillen', roles: ['Sát Thủ'], difficulty: 4 },
  { name_vi: 'Ryoma', roles: ['Sát Thủ', 'Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Sinestrea', roles: ['Sát Thủ'], difficulty: 5 },
  { name_vi: 'Zephys', roles: ['Sát Thủ', 'Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Kaine', roles: ['Sát Thủ'], difficulty: 4 },
  { name_vi: 'Batman', roles: ['Sát Thủ'], difficulty: 3 },
  { name_vi: 'Joker', roles: ['Sát Thủ'], difficulty: 3 },
  { name_vi: 'Bright', roles: ['Sát Thủ'], difficulty: 3 },

  // Đấu Sĩ (Warrior/Fighter)
  { name_vi: 'Allain', roles: ['Đấu Sĩ'], difficulty: 4 },
  { name_vi: 'Amily', roles: ['Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Arthur', roles: ['Đấu Sĩ', 'Đỡ Đòn'], difficulty: 1 },
  { name_vi: 'Astrid', roles: ['Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Errol', roles: ['Đấu Sĩ'], difficulty: 4 },
  { name_vi: 'Florentino', roles: ['Đấu Sĩ'], difficulty: 5 },
  { name_vi: "Kil'Groth", roles: ['Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Lữ Bố', roles: ['Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Maloch', roles: ['Đấu Sĩ', 'Đỡ Đòn'], difficulty: 3 },
  { name_vi: 'Max', roles: ['Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Ngộ Không', roles: ['Đấu Sĩ', 'Sát Thủ'], difficulty: 3 },
  { name_vi: 'Omen', roles: ['Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Qi', roles: ['Đấu Sĩ'], difficulty: 4 },
  { name_vi: 'Richter', roles: ['Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Skud', roles: ['Đấu Sĩ', 'Đỡ Đòn'], difficulty: 2 },
  { name_vi: 'Superman', roles: ['Đấu Sĩ', 'Đỡ Đòn'], difficulty: 4 },
  { name_vi: 'Tachi', roles: ['Đấu Sĩ'], difficulty: 4 },
  { name_vi: 'Triệu Vân', roles: ['Đấu Sĩ'], difficulty: 2 },
  { name_vi: 'Veres', roles: ['Đấu Sĩ'], difficulty: 4 },
  { name_vi: 'Volkath', roles: ['Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Wonder Woman', roles: ['Đấu Sĩ', 'Đỡ Đòn'], difficulty: 3 },
  { name_vi: 'Yena', roles: ['Đấu Sĩ', 'Sát Thủ'], difficulty: 4 },
  { name_vi: 'Zuka', roles: ['Đấu Sĩ', 'Sát Thủ'], difficulty: 4 },
  { name_vi: 'Wiro', roles: ['Đấu Sĩ', 'Đỡ Đòn'], difficulty: 2 },
  { name_vi: 'Dextra', roles: ['Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Taara', roles: ['Đấu Sĩ', 'Đỡ Đòn'], difficulty: 2 },
  { name_vi: 'Roxie', roles: ['Đấu Sĩ', 'Đỡ Đòn'], difficulty: 3 },

  // Đỡ Đòn (Tank)
  { name_vi: 'Arduin', roles: ['Đỡ Đòn', 'Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Arum', roles: ['Đỡ Đòn'], difficulty: 3 },
  { name_vi: 'Ata', roles: ['Đỡ Đòn', 'Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Baldum', roles: ['Đỡ Đòn', 'Hỗ Trợ'], difficulty: 2 },
  { name_vi: 'Chaugnar', roles: ['Đỡ Đòn', 'Hỗ Trợ'], difficulty: 2 },
  { name_vi: 'Cresht', roles: ['Đỡ Đòn'], difficulty: 3 },
  { name_vi: 'Grakk', roles: ['Đỡ Đòn'], difficulty: 3 },
  { name_vi: 'Lumburr', roles: ['Đỡ Đòn'], difficulty: 2 },
  { name_vi: 'Mina', roles: ['Đỡ Đòn'], difficulty: 1 },
  { name_vi: 'Omega', roles: ['Đỡ Đòn'], difficulty: 2 },
  { name_vi: 'Ormarr', roles: ['Đỡ Đòn', 'Đấu Sĩ'], difficulty: 2 },
  { name_vi: 'Thane', roles: ['Đỡ Đòn', 'Hỗ Trợ'], difficulty: 2 },
  { name_vi: 'Toro', roles: ['Đỡ Đòn'], difficulty: 2 },
  { name_vi: 'Xeniel', roles: ['Đỡ Đòn', 'Hỗ Trợ'], difficulty: 3 },
  { name_vi: "Y'bneth", roles: ['Đỡ Đòn', 'Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Zip', roles: ['Đỡ Đòn', 'Hỗ Trợ'], difficulty: 3 },

  // Xạ Thủ (Marksman)
  { name_vi: 'Capheny', roles: ['Xạ Thủ'], difficulty: 2 },
  { name_vi: 'Elsu', roles: ['Xạ Thủ'], difficulty: 5 },
  { name_vi: "Eland'orr", roles: ['Xạ Thủ'], difficulty: 4 },
  { name_vi: 'Fennik', roles: ['Xạ Thủ'], difficulty: 2 },
  { name_vi: 'Hayate', roles: ['Xạ Thủ'], difficulty: 4 },
  { name_vi: 'Laville', roles: ['Xạ Thủ'], difficulty: 3 },
  { name_vi: 'Lindis', roles: ['Xạ Thủ'], difficulty: 3 },
  { name_vi: 'Moren', roles: ['Xạ Thủ'], difficulty: 2 },
  { name_vi: 'Rourke', roles: ['Xạ Thủ', 'Đấu Sĩ'], difficulty: 3 },
  { name_vi: 'Slimz', roles: ['Xạ Thủ'], difficulty: 3 },
  { name_vi: "Tel'Annas", roles: ['Xạ Thủ'], difficulty: 2 },
  { name_vi: 'Thorne', roles: ['Xạ Thủ'], difficulty: 4 },
  { name_vi: 'Valhein', roles: ['Xạ Thủ'], difficulty: 1 },
  { name_vi: 'Violet', roles: ['Xạ Thủ'], difficulty: 3 },
  { name_vi: 'Wisp', roles: ['Xạ Thủ'], difficulty: 2 },
  { name_vi: 'Yorn', roles: ['Xạ Thủ'], difficulty: 1 },
  { name_vi: 'Celica', roles: ['Xạ Thủ'], difficulty: 3 },

  // Trợ Thủ (Support)
  { name_vi: 'Alice', roles: ['Hỗ Trợ'], difficulty: 2 },
  { name_vi: 'Annette', roles: ['Hỗ Trợ'], difficulty: 3 },
  { name_vi: 'Aya', roles: ['Hỗ Trợ'], difficulty: 3 },
  { name_vi: 'Krizzix', roles: ['Hỗ Trợ'], difficulty: 3 },
  { name_vi: 'Payna', roles: ['Hỗ Trợ'], difficulty: 2 },
  { name_vi: 'Rouie', roles: ['Hỗ Trợ'], difficulty: 4 },
  { name_vi: 'TeeMee', roles: ['Hỗ Trợ', 'Đỡ Đòn'], difficulty: 3 },
  { name_vi: 'Aoi', roles: ['Sát Thủ', 'Đấu Sĩ'], difficulty: 4 },
];

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Add Missing LQ Heroes & Fix Mappings   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected\n');
    const db = mongoose.connection.db;

    // ============================
    // Phase 1: Add Missing LQ Heroes
    // ============================
    console.log('=== Phase 1: Adding Missing LQ Heroes ===');
    let addedCount = 0;

    for (const hero of ALL_LQ_HEROES) {
      const existing = await db.collection('heroes').findOne({
        game: 'lq',
        name_vi: hero.name_vi,
      });

      if (!existing) {
        const slug = createSlug(hero.name_vi) + '-lq';
        // Check if slug already exists
        const slugExists = await db.collection('heroes').findOne({ slug });
        if (slugExists) continue;

        await db.collection('heroes').insertOne({
          name_vi: hero.name_vi,
          name_cn: '',
          title_vi: '',
          title_cn: '',
          slug,
          game: 'lq',
          roles: hero.roles,
          difficulty: hero.difficulty,
          skills: [],
          stats: {},
          avatar_url: '',
          skins: [],
          recommended_runes: [],
          supported_languages: ['vi'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        addedCount++;
        console.log(`  + ${hero.name_vi} (${hero.roles.join(', ')})`);
      }
    }
    console.log(`Added ${addedCount} new LQ heroes\n`);

    // ============================
    // Phase 2: Add Missing VG Heroes
    // ============================
    console.log('=== Phase 2: Adding Missing VG Heroes ===');
    const missingVgHeroes = [
      { name_vi: 'Can Tương Mạc Gia', name_cn: '干将莫邪', roles: ['Pháp Sư'], difficulty: 4 },
      { name_vi: 'Nakoruru', name_cn: 'ナコルル', roles: ['Sát Thủ'], difficulty: 4 },
      { name_vi: 'Miyamoto Musashi', name_cn: '宫本武蔵', roles: ['Đấu Sĩ', 'Sát Thủ'], difficulty: 4 },
      { name_vi: 'Na Tra', name_cn: '哪吒', roles: ['Đấu Sĩ'], difficulty: 3 },
      { name_vi: 'Dương Tiễn', name_cn: '杨戬', roles: ['Đấu Sĩ'], difficulty: 3 },
      { name_vi: 'Thành Cát Tư Hãn', name_cn: '成吉思汗', roles: ['Xạ Thủ'], difficulty: 3 },
      { name_vi: 'Lưu Bị', name_cn: '刘备', roles: ['Đấu Sĩ', 'Xạ Thủ'], difficulty: 3 },
      { name_vi: 'Hậu Nghệ', name_cn: '后羿', roles: ['Xạ Thủ'], difficulty: 2 },
      { name_vi: 'Trương Phi', name_cn: '张飞', roles: ['Đỡ Đòn', 'Hỗ Trợ'], difficulty: 3 },
      { name_vi: 'Tôn Sách', name_cn: '孙策', roles: ['Đấu Sĩ', 'Đỡ Đòn'], difficulty: 3 },
      { name_vi: 'Hằng Nga', name_cn: '嫦娥', roles: ['Pháp Sư'], difficulty: 3 },
      { name_vi: 'Mã Siêu', name_cn: '马超', roles: ['Đấu Sĩ'], difficulty: 5 },
      { name_vi: 'Kính', name_cn: '镜', roles: ['Sát Thủ'], difficulty: 5 },
    ];

    let addedVgCount = 0;
    for (const hero of missingVgHeroes) {
      const existing = await db.collection('heroes').findOne({
        game: 'vg',
        name_cn: hero.name_cn,
      });

      if (!existing) {
        const slug = createSlug(hero.name_vi) + '-vg';
        const slugExists = await db.collection('heroes').findOne({ slug });
        if (slugExists) continue;

        await db.collection('heroes').insertOne({
          name_vi: hero.name_vi,
          name_cn: hero.name_cn,
          title_vi: '',
          title_cn: '',
          slug,
          game: 'vg',
          roles: hero.roles,
          difficulty: hero.difficulty,
          skills: [],
          stats: {},
          avatar_url: '',
          skins: [],
          recommended_runes: [],
          supported_languages: ['vi', 'cn'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        addedVgCount++;
        console.log(`  + ${hero.name_vi} / ${hero.name_cn}`);
      }
    }
    console.log(`Added ${addedVgCount} new VG heroes\n`);

    // ============================
    // Phase 3: Recreate ALL Mappings
    // ============================
    console.log('=== Phase 3: Recreating Hero Mappings ===');

    // Delete old mappings
    await db.collection('heromappings').deleteMany({});

    const MAPPINGS = [
      // Pháp Sư
      { vg: 'Điêu Thuyền', lq: 'Lauriel', sim: 85 },
      { vg: 'Mai Shiranui', lq: 'Raz', sim: 80 },
      { vg: 'Gia Cát Lượng', lq: 'Tulen', sim: 85 },
      { vg: 'Chân Cơ', lq: "Azzen'Ka", sim: 75 },
      { vg: 'Vương Chiêu Quân', lq: 'Điêu Thuyền', sim: 80 },
      { vg: 'Trương Lương', lq: 'Aleister', sim: 80 },
      { vg: 'Mặc Tử', lq: 'Gildur', sim: 75 },
      { vg: 'Chu Du', lq: 'Ignis', sim: 80 },
      { vg: 'An Kỳ Lạp', lq: 'Natalya', sim: 85 },
      { vg: 'Tiểu Kiều', lq: 'Krixi', sim: 80 },
      { vg: 'Can Tương Mạc Gia', lq: 'Yue', sim: 70 },
      { vg: 'Mị Nguyệt', lq: 'Marja', sim: 75 },
      { vg: 'Biển Thước', lq: 'Mganga', sim: 80 },
      { vg: 'Tư Mã Ý', lq: 'Paine', sim: 70 },
      { vg: 'Tần Thủy Hoàng', lq: 'Kahlii', sim: 75 },
      { vg: 'Cao Tiệm Ly', lq: 'Jinna', sim: 80 },
      { vg: 'Đát Kỷ', lq: 'Veera', sim: 85 },
      { vg: 'Thượng Quan Uyển Nhi', lq: 'Zata', sim: 75 },
      { vg: 'Khương Tử Nha', lq: 'Preyta', sim: 70 },
      { vg: 'Thẩm Mộng Khê', lq: 'Iggy', sim: 75 },
      // Sát Thủ / Đấu Sĩ
      { vg: 'Miyamoto Musashi', lq: 'Airi', sim: 80 },
      { vg: 'Triệu Vân', lq: 'Zephys', sim: 85 },
      { vg: 'Tôn Ngộ Không', lq: 'Ngộ Không', sim: 90 },
      { vg: 'A Kha', lq: 'Quillen', sim: 80 },
      { vg: 'Lan Lăng Vương', lq: 'Kaine', sim: 75 },
      { vg: 'Lý Bạch', lq: 'Murad', sim: 85 },
      { vg: 'Hàn Tín', lq: 'Nakroth', sim: 85 },
      { vg: 'Nakoruru', lq: 'Kriknak', sim: 75 },
      { vg: 'Bách Lý Huyền Sách', lq: 'Enzo', sim: 75 },
      { vg: 'Điển Vi', lq: 'Triệu Vân', sim: 70 },
      { vg: 'Ukyo Tachibana', lq: 'Ryoma', sim: 80 },
      // Đỡ Đòn
      { vg: 'Trang Chu', lq: 'Chaugnar', sim: 80 },
      { vg: 'Trương Phi', lq: 'Cresht', sim: 75 },
      { vg: 'Lưu Thiện', lq: 'Omega', sim: 80 },
      { vg: 'Bạch Khởi', lq: 'Mina', sim: 80 },
      { vg: 'Chung Quỳ', lq: 'Grakk', sim: 85 },
      { vg: 'Trư Bát Giới', lq: 'Ata', sim: 75 },
      { vg: 'Đông Hoàng Thái Nhất', lq: 'Arum', sim: 80 },
      { vg: 'Hạng Vũ', lq: 'Thane', sim: 80 },
      { vg: 'Liêm Pha', lq: 'Toro', sim: 85 },
      { vg: 'Tô Liệt', lq: 'Wiro', sim: 75 },
      { vg: 'Lưu Bang', lq: 'Xeniel', sim: 80 },
      { vg: 'Hạ Hầu Đôn', lq: 'Arduin', sim: 80 },
      { vg: 'Chung Vô Diệm', lq: 'Ormarr', sim: 75 },
      { vg: 'Thuẫn Sơn', lq: 'Lumburr', sim: 75 },
      // Trợ Thủ
      { vg: 'Quỷ Cốc Tử', lq: 'Krizzix', sim: 80 },
      { vg: 'Đại Kiều', lq: 'Rouie', sim: 85 },
      { vg: 'Dao', lq: 'Aya', sim: 80 },
    ];

    let mappingCount = 0;
    let notFound = [];

    for (const m of MAPPINGS) {
      const vgHero = await db.collection('heroes').findOne({ game: 'vg', name_vi: m.vg });
      const lqHero = await db.collection('heroes').findOne({ game: 'lq', name_vi: m.lq });

      if (!vgHero) { notFound.push(`VG: ${m.vg}`); continue; }
      if (!lqHero) { notFound.push(`LQ: ${m.lq}`); continue; }

      await db.collection('heromappings').insertOne({
        vg_hero: vgHero._id,
        lq_hero: lqHero._id,
        similarity_score: m.sim,
        skill_comparison: [],
        notes: `${m.vg} (VG) ↔ ${m.lq} (LQ)`,
        is_verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mappingCount++;
      console.log(`  ✓ ${m.vg} ↔ ${m.lq} (${m.sim}%)`);
    }

    console.log(`\nCreated ${mappingCount} mappings`);
    if (notFound.length > 0) {
      console.log(`Not found (${notFound.length}):`, notFound.join(', '));
    }

    // Stats
    console.log('\n=== Final Stats ===');
    const stats = {
      vg: await db.collection('heroes').countDocuments({ game: 'vg' }),
      lq: await db.collection('heroes').countDocuments({ game: 'lq' }),
      mappings: await db.collection('heromappings').countDocuments({}),
    };
    console.log(`VG Heroes: ${stats.vg}`);
    console.log(`LQ Heroes: ${stats.lq}`);
    console.log(`Mappings: ${stats.mappings}`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
