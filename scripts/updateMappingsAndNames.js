/**
 * Script: Update Hero Names & Mappings
 * - Cập nhật tên Việt hóa chuẩn cho tướng VG từ vuonggiavinhdieu.net
 * - Thêm đủ 48 cặp mapping tương đồng VG ↔ LQ (từ honorofkings.com.vn)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sosanh_lq_vg';

/**
 * Chuẩn tên Việt hóa cho VG heroes
 * Nguồn: vuonggiavinhdieu.net + honorofkings.com.vn
 * Key: tên Trung / tên cũ sai → Value: tên Việt chuẩn
 */
const VG_NAME_CORRECTIONS = {
  // Tên cũ → Tên Việt chuẩn
  '廉颇': 'Liêm Pha',
  '小乔': 'Tiểu Kiều',
  '赵云': 'Triệu Vân',
  '墨子': 'Mặc Tử',
  '妲己': 'Đát Kỷ',
  '嬴政': 'Tần Thủy Hoàng',
  '孙膑': 'Tôn Tẩn',
  '鲁班七号': 'Lỗ Ban Bảy Hào',
  '庄周': 'Trang Chu',
  '刘禅': 'Lưu Thiện',
  '高渐离': 'Cao Tiệm Ly',
  '阿轲': 'A Kha',
  '钟无艳': 'Chung Vô Diệm',
  '孙尚香': 'Tôn Thượng Hương',
  '吕布': 'Lữ Bố',
  '周瑜': 'Chu Du',
  '元歌': 'Nguyên Ca',
  '花木兰': 'Hoa Mộc Lan',
  '兰陵王': 'Lan Lăng Vương',
  '韩信': 'Hàn Tín',
  '王昭君': 'Vương Chiêu Quân',
  '甄姬': 'Chân Cơ',
  '曹操': 'Tào Tháo',
  '典韦': 'Điển Vi',
  '武则天': 'Võ Tắc Thiên',
  '项羽': 'Hạng Vũ',
  '达摩': 'Đạt Ma',
  '狄仁杰': 'Địch Nhân Kiệt',
  '白起': 'Bạch Khởi',
  '芈月': 'Mị Nguyệt',
  '刘备': 'Lưu Bị',
  '关羽': 'Quan Vũ',
  '貂蝉': 'Điêu Thuyền',
  '后羿': 'Hậu Nghệ',
  '诸葛亮': 'Gia Cát Lượng',
  '黄忠': 'Hoàng Trung',
  '扁鹊': 'Biển Thước',
  '孙悟空': 'Tôn Ngộ Không',
  '马可波罗': 'Marco Polo',
  '哪吒': 'Na Tra',
  '杨戬': 'Dương Tiễn',
  '夏侯惇': 'Hạ Hầu Đôn',
  '大乔': 'Đại Kiều',
  '东皇太一': 'Đông Hoàng Thái Nhất',
  '成吉思汗': 'Thành Cát Tư Hãn',
  '钟馗': 'Chung Quỳ',
  '张良': 'Trương Lương',
  '张飞': 'Trương Phi',
  '司马懿': 'Tư Mã Ý',
  '太乙真人': 'Thái Ất Chân Nhân',
  '猪八戒': 'Trư Bát Giới',
  '姜子牙': 'Khương Tử Nha',
  '安琪拉': 'An Kỳ Lạp',
  '盾山': 'Thuẫn Sơn',
  '程咬金': 'Trình Giảo Kim',
  '苏烈': 'Tô Liệt',
  '刘邦': 'Lưu Bang',
  '干将莫邪': 'Can Tương Mạc Gia',
  '百里玄策': 'Bách Lý Huyền Sách',
  '百里守约': 'Bách Lý Thủ Ước',
  '孙策': 'Tôn Sách',
  '明世隐': 'Minh Thế Ẩn',
  '李白': 'Lý Bạch',
  '鬼谷子': 'Quỷ Cốc Tử',
  '瑶': 'Dao',
  '上官婉儿': 'Thượng Quan Uyển Nhi',
  '云中君': 'Vân Trung Quân',
  '盘古': 'Bàn Cổ',
  '嫦娥': 'Hằng Nga',
  '西施': 'Tây Thi',
  '马超': 'Mã Siêu',
  '蒙恬': 'Mông Điềm',
  '鲁班大师': 'Lỗ Ban Đại Sư',
  '沈梦溪': 'Thẩm Mộng Khê',
  '澜': 'Lan',
  '镜': 'Kính',
  '蒙犽': 'Mông Nha',
  '司空震': 'Tư Không Chấn',
  '金蝉': 'Kim Thiền',
  '云缨': 'Vân Anh',
  '暃': 'Phi',
  '桑启': 'Tang Khải',
  '海月': 'Hải Nguyệt',
  '赵怀真': 'Triệu Hoài Chân',
  '戈娅': 'Qua Nhã',
  '莱希奥': 'Lai Hi Áo',
  '姬小满': 'Cơ Tiểu Mãn',
  '亚连': 'Á Liên',
  '海诺': 'Hải Nặc',
  '敖隐': 'Ngao Ẩn',
  '回音': 'Hồi Âm',
  '大司命': 'Đại Tư Mệnh',
  '少司缘': 'Thiếu Tư Duyên',
  '太华': 'Thái Hoa',
  '空空儿': 'Không Không Nhi',
  '朱绰': 'Chu Chước',
  '不知火舞': 'Mai Shiranui',
  'ナコルル': 'Nakoruru',
  '宫本武蔵': 'Miyamoto Musashi',
  '橘右京': 'Ukyo Tachibana',
};

/**
 * 48 cặp tướng tương đồng VG ↔ LQ
 * Nguồn: honorofkings.com.vn
 */
const HERO_MAPPINGS = [
  // Pháp Sư
  { vg_name: 'Điêu Thuyền', lq_name: 'Lauriel', similarity: 85 },
  { vg_name: 'Mai Shiranui', lq_name: 'Raz', similarity: 80 },
  { vg_name: 'Gia Cát Lượng', lq_name: 'Tulen', similarity: 85 },
  { vg_name: 'Chân Cơ', lq_name: "Azzen'Ka", similarity: 75 },
  { vg_name: 'Vương Chiêu Quân', lq_name: 'Điêu Thuyền', similarity: 80 },
  { vg_name: 'Trương Lương', lq_name: 'Aleister', similarity: 80 },
  { vg_name: 'Mặc Tử', lq_name: 'Gildur', similarity: 75 },
  { vg_name: 'Chu Du', lq_name: 'Ignis', similarity: 80 },
  { vg_name: 'An Kỳ Lạp', lq_name: 'Natalya', similarity: 85 },
  { vg_name: 'Tiểu Kiều', lq_name: 'Krixi', similarity: 80 },
  { vg_name: 'Can Tương Mạc Gia', lq_name: 'Yue', similarity: 70 },
  { vg_name: 'Mị Nguyệt', lq_name: 'Marja', similarity: 75 },
  { vg_name: 'Biển Thước', lq_name: 'Mganga', similarity: 80 },
  { vg_name: 'Tư Mã Ý', lq_name: 'Paine', similarity: 70 },
  { vg_name: 'Tần Thủy Hoàng', lq_name: 'Kahlii', similarity: 75 },
  { vg_name: 'Cao Tiệm Ly', lq_name: 'Jinna', similarity: 80 },
  { vg_name: 'Đát Kỷ', lq_name: 'Veera', similarity: 85 },
  { vg_name: 'Thượng Quan Uyển Nhi', lq_name: 'Zata', similarity: 75 },
  { vg_name: 'Khương Tử Nha', lq_name: 'Preyta', similarity: 70 },
  { vg_name: 'Thẩm Mộng Khê', lq_name: 'Iggy', similarity: 75 },

  // Sát Thủ / Đấu Sĩ
  { vg_name: 'Miyamoto Musashi', lq_name: 'Airi', similarity: 80 },
  { vg_name: 'Triệu Vân', lq_name: 'Zephys', similarity: 85 },
  { vg_name: 'Tôn Ngộ Không', lq_name: 'Ngộ Không', similarity: 90 },
  { vg_name: 'A Kha', lq_name: 'Quillen', similarity: 80 },
  { vg_name: 'Lan Lăng Vương', lq_name: 'Kaine', similarity: 75 },
  { vg_name: 'Lý Bạch', lq_name: 'Murad', similarity: 85 },
  { vg_name: 'Hàn Tín', lq_name: 'Nakroth', similarity: 85 },
  { vg_name: 'Nakoruru', lq_name: 'Kriknak', similarity: 75 },
  { vg_name: 'Bách Lý Huyền Sách', lq_name: 'Enzo', similarity: 75 },
  { vg_name: 'Điển Vi', lq_name: 'Triệu Vân', similarity: 70 },
  { vg_name: 'Ukyo Tachibana', lq_name: 'Ryoma', similarity: 80 },

  // Đỡ Đòn / Tank
  { vg_name: 'Trang Chu', lq_name: 'Chaugnar', similarity: 80 },
  { vg_name: 'Trương Phi', lq_name: 'Cresht', similarity: 75 },
  { vg_name: 'Lưu Thiện', lq_name: 'Omega', similarity: 80 },
  { vg_name: 'Bạch Khởi', lq_name: 'Mina', similarity: 80 },
  { vg_name: 'Chung Quỳ', lq_name: 'Grakk', similarity: 85 },
  { vg_name: 'Trư Bát Giới', lq_name: 'Ata', similarity: 75 },
  { vg_name: 'Đông Hoàng Thái Nhất', lq_name: 'Arum', similarity: 80 },
  { vg_name: 'Hạng Vũ', lq_name: 'Thane', similarity: 80 },
  { vg_name: 'Liêm Pha', lq_name: 'Toro', similarity: 85 },
  { vg_name: 'Tô Liệt', lq_name: 'Wiro', similarity: 75 },
  { vg_name: 'Lưu Bang', lq_name: 'Xeniel', similarity: 80 },
  { vg_name: 'Hạ Hầu Đôn', lq_name: 'Arduin', similarity: 80 },
  { vg_name: 'Chung Vô Diệm', lq_name: 'Ormarr', similarity: 75 },
  { vg_name: 'Thuẫn Sơn', lq_name: 'Lumburr', similarity: 75 },

  // Trợ Thủ / Hỗ Trợ
  { vg_name: 'Quỷ Cốc Tử', lq_name: 'Krizzix', similarity: 80 },
  { vg_name: 'Đại Kiều', lq_name: 'Rouie', similarity: 85 },
  { vg_name: 'Dao', lq_name: 'Aya', similarity: 80 },
];

/**
 * Tạo slug từ tên
 */
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

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Update Hero Names & Mappings           ║');
  console.log('╚══════════════════════════════════════════╝\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected\n');
    const db = mongoose.connection.db;

    // ============================
    // Phase 1: Fix VG Hero Names
    // ============================
    console.log('=== Phase 1: Fixing VG Hero Names ===');
    let fixedCount = 0;

    for (const [name_cn, correct_vi] of Object.entries(VG_NAME_CORRECTIONS)) {
      const hero = await db.collection('heroes').findOne({
        game: 'vg',
        name_cn: name_cn,
      });

      if (hero && hero.name_vi !== correct_vi) {
        const newSlug = createSlug(correct_vi) + '-vg';
        await db.collection('heroes').updateOne(
          { _id: hero._id },
          { $set: { name_vi: correct_vi, slug: newSlug } }
        );
        console.log(`  ✓ ${hero.name_vi} → ${correct_vi} (${name_cn})`);
        fixedCount++;
      }
    }
    console.log(`Fixed ${fixedCount} hero names\n`);

    // ============================
    // Phase 2: Update Hero Mappings
    // ============================
    console.log('=== Phase 2: Updating Hero Mappings ===');

    // Clear old mappings
    const deleteResult = await db.collection('heromappings').deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} old mappings`);

    let mappingCount = 0;
    let notFoundPairs = [];

    for (const mapping of HERO_MAPPINGS) {
      // Find VG hero by name_vi (after correction)
      const vgHero = await db.collection('heroes').findOne({
        game: 'vg',
        name_vi: mapping.vg_name,
      });

      // Find LQ hero by name_vi
      const lqHero = await db.collection('heroes').findOne({
        game: 'lq',
        name_vi: mapping.lq_name,
      });

      if (!vgHero) {
        // Try partial match
        const vgHeroPartial = await db.collection('heroes').findOne({
          game: 'vg',
          name_vi: { $regex: mapping.vg_name.split(' ')[0], $options: 'i' },
        });
        if (!vgHeroPartial) {
          notFoundPairs.push(`VG: ${mapping.vg_name}`);
          continue;
        }
      }

      if (!lqHero) {
        notFoundPairs.push(`LQ: ${mapping.lq_name}`);
        continue;
      }

      const vgId = vgHero ? vgHero._id : null;
      if (!vgId) continue;

      try {
        await db.collection('heromappings').insertOne({
          vg_hero: vgId,
          lq_hero: lqHero._id,
          similarity_score: mapping.similarity,
          skill_comparison: [],
          notes: `${mapping.vg_name} (VG) ↔ ${mapping.lq_name} (LQ)`,
          is_verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        mappingCount++;
        console.log(`  ✓ ${mapping.vg_name} ↔ ${mapping.lq_name} (${mapping.similarity}%)`);
      } catch (err) {
        console.log(`  ✗ ${mapping.vg_name} ↔ ${mapping.lq_name}: ${err.message}`);
      }
    }

    console.log(`\nCreated ${mappingCount} mappings`);
    if (notFoundPairs.length > 0) {
      console.log(`\nNot found (${notFoundPairs.length}):`);
      notFoundPairs.forEach(p => console.log(`  - ${p}`));
    }

    // ============================
    // Phase 3: Stats
    // ============================
    console.log('\n=== Final Stats ===');
    const stats = {
      vgHeroes: await db.collection('heroes').countDocuments({ game: 'vg' }),
      lqHeroes: await db.collection('heroes').countDocuments({ game: 'lq' }),
      mappings: await db.collection('heromappings').countDocuments({}),
      items: await db.collection('items').countDocuments({}),
      runes: await db.collection('runes').countDocuments({}),
    };
    console.log(`VG Heroes: ${stats.vgHeroes}`);
    console.log(`LQ Heroes: ${stats.lqHeroes}`);
    console.log(`Mappings: ${stats.mappings}`);
    console.log(`Items: ${stats.items}`);
    console.log(`Runes: ${stats.runes}`);

    console.log('\n✓ Done!');
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
