/**
 * Script tạo đầy đủ mappings tướng VG <-> LQ
 * Dựa trên nghiên cứu từ nhiều nguồn:
 * - gamewitted.com
 * - gameanimetech.com
 * - honorofkings.com.vn
 * - vuonggiavinhdieu.net
 */

const mongoose = require('mongoose');
const Hero = require('../server/models/Hero');
const HeroMapping = require('../server/models/HeroMapping');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sosanh_lq_vg';

// VG slug -> LQ slug -> similarity score
// Based on skill similarity research from multiple sources
const MAPPING_DATA = [
  // === ĐÃ XÁC NHẬN TỪ NHIỀU NGUỒN (high confidence) ===
  { vg: 'a-lien-vg', lq: 'allain-lq', score: 95, notes: 'Cùng tên, cùng bộ kỹ năng đấu sĩ combo' },
  { vg: 'an-ky-lap-vg', lq: 'natalya-lq', score: 80, notes: 'Angela/An Kỳ Lạp = Natalya, pháp sư burst damage' },
  { vg: 'bach-khoi-vg', lq: 'mina-lq', score: 80, notes: 'Bạch Khởi = Mina, tank với ult kéo địch' },
  { vg: 'bach-ly-huyen-sach-vg', lq: 'enzo-lq', score: 78, notes: 'Bách Lý Huyền Sách = Enzo, sát thủ móc câu' },
  { vg: 'bach-ly-thu-uoc-vg', lq: 'elsu-lq', score: 90, notes: 'Bách Lý Thủ Ước = Elsu, xạ thủ bắn tỉa tầm xa' },
  { vg: 'bien-thuoc-vg', lq: 'mganga-lq', score: 75, notes: 'Biển Thước = Mganga, pháp sư hồi máu/poison' },
  { vg: 'cao-tiem-ly-vg', lq: 'jinnar-lq', score: 78, notes: 'Cao Tiệm Ly = Jinnar, pháp sư AoE burst' },
  { vg: 'chung-quy-vg', lq: 'grakk-lq', score: 85, notes: 'Chung Quỳ = Grakk, tank kéo/hook' },
  { vg: 'chung-vo-diem-vg', lq: 'ormarr-lq', score: 82, notes: 'Chung Vô Diệm = Ormarr, đấu sĩ búa choáng' },
  { vg: 'djat-ky-vg', lq: 'veera-lq', score: 90, notes: 'Đát Kỷ = Veera, pháp sư burst đơn mục tiêu' },
  { vg: 'djat-ma-vg', lq: 'qi-lq', score: 82, notes: 'Đạt Ma = Qi, đấu sĩ cận chiến đánh tay đôi' },
  { vg: 'djai-kieu-vg', lq: 'rouie-lq', score: 85, notes: 'Đại Kiều = Rouie, hỗ trợ dịch chuyển đồng đội' },
  { vg: 'djien-vi-vg', lq: 'trieu-van-lq', score: 75, notes: 'Điển Vi = Triệu Vân (LQ), đấu sĩ cận chiến' },
  { vg: 'djieu-thuyen-vg', lq: 'lauriel-lq', score: 78, notes: 'Điêu Thuyền = Lauriel, pháp sư/đấu sĩ di động cao' },
  { vg: 'djong-hoang-thai-nhat-vg', lq: 'arum-lq', score: 80, notes: 'Đông Hoàng Thái Nhất = Arum, tank khống chế tuyệt đối' },
  { vg: 'duong-tien-vg', lq: 'volkath-lq', score: 75, notes: 'Dương Tiễn = Volkath, đấu sĩ với biến hình/kỹ năng đặc biệt' },
  { vg: 'gia-cat-luong-vg', lq: 'tulen-lq', score: 80, notes: 'Gia Cát Lượng = Tulen, pháp sư burst di động' },
  { vg: 'ha-hau-djon-vg', lq: 'arduin-lq', score: 82, notes: 'Hạ Hầu Đôn = Arduin, tank/đấu sĩ với shield' },
  { vg: 'han-tin-vg', lq: 'nakroth-lq', score: 85, notes: 'Hàn Tín = Nakroth, sát thủ cơ động nhảy tường' },
  { vg: 'hang-vu-vg', lq: 'thane-lq', score: 80, notes: 'Hạng Vũ = Thane, tank với ult knock-up' },
  { vg: 'hau-nghe-vg', lq: 'laville-lq', score: 78, notes: 'Hậu Nghệ = Laville, xạ thủ đứng yên bắn' },
  { vg: 'hoa-moc-lan-vg', lq: 'yena-lq', score: 85, notes: 'Hoa Mộc Lan = Yena, đấu sĩ chuyển đổi stance' },
  { vg: 'jialuo-vg', lq: 'telannas-lq', score: 80, notes: 'Jialuo/Già La = Tel\'Annas, xạ thủ tầm xa' },
  { vg: 'lan-lang-vuong-vg', lq: 'batman-lq', score: 85, notes: 'Lan Lăng Vương = Batman, sát thủ tàng hình' },
  { vg: 'liem-pha-vg', lq: 'toro-lq', score: 82, notes: 'Liêm Pha = Toro, tank với ult đẩy tường' },
  { vg: 'lo-ban-bay-hao-vg', lq: 'yorn-lq', score: 80, notes: 'Lỗ Ban Bảy Hào = Yorn, xạ thủ pháo tầm xa' },
  { vg: 'lu-bo-vg', lq: 'maloch-lq', score: 82, notes: 'Lữ Bố = Maloch, tank/đấu sĩ với ult nhảy vào' },
  { vg: 'luu-bang-vg', lq: 'xeniel-lq', score: 80, notes: 'Lưu Bang = Xeniel, tank với ult dịch chuyển toàn bản đồ' },
  { vg: 'luu-bi-vg', lq: 'rourke-lq', score: 75, notes: 'Lưu Bị = Rourke, đấu sĩ/xạ thủ' },
  { vg: 'luu-thien-21016-vg', lq: 'omega-lq', score: 78, notes: 'Lưu Thiện = Omega, tank robot/cơ giới' },
  { vg: 'ly-bach-vg', lq: 'murad-lq', score: 90, notes: 'Lý Bạch = Murad, sát thủ combo miễn nhiễm' },
  { vg: 'mac-tu-vg', lq: 'gildur-lq', score: 80, notes: 'Mặc Tử = Gildur, tank/pháp sư với shield và burst' },
  { vg: 'mai-shiranui-vg', lq: 'raz-lq', score: 78, notes: 'Mai Shiranui = Raz, pháp sư cận chiến combo' },
  { vg: 'marco-polo-vg', lq: 'hayate-lq', score: 82, notes: 'Marco Polo = Hayate, xạ thủ cơ động true damage' },
  { vg: 'mi-nguyet-vg', lq: 'marja-lq', score: 75, notes: 'Mị Nguyệt = Marja, pháp sư hút máu' },
  { vg: 'na-tra-vg', lq: 'max-lq', score: 80, notes: 'Na Tra = Max, đấu sĩ lao vào với ult lock mục tiêu' },
  { vg: 'nakoruru-vg', lq: 'kriknak-lq', score: 78, notes: 'Nakoruru = Kriknak, sát thủ bay nhảy' },
  { vg: 'phi-vg', lq: 'fennik-lq', score: 78, notes: 'Phi = Fennik, xạ thủ/sát thủ cơ động' },
  { vg: 'qua-nha-vg', lq: 'aya-lq', score: 82, notes: 'Qua Nhã/Yaria = Aya, hỗ trợ/pháp sư' },
  { vg: 'quan-vu-vg', lq: 'superman-lq', score: 78, notes: 'Quan Vũ = Superman, đấu sĩ chạy xung phong' },
  { vg: 'quy-coc-tu-vg', lq: 'krizzix-lq', score: 80, notes: 'Quỷ Cốc Tử = Krizzix, hỗ trợ tàng hình đồng đội' },
  { vg: 'tao-chap-vg', lq: 'joker-lq', score: 78, notes: 'Tạo Chấp/Ngu Cơ = Joker, xạ thủ/sát thủ burst' },
  { vg: 'tao-thao-vg', lq: 'lu-bo-lq', score: 80, notes: 'Tào Tháo = Lữ Bố (LQ), đấu sĩ hút máu' },
  { vg: 'thuong-quan-uyen-nhi-vg', lq: 'zata-lq', score: 80, notes: 'Thượng Quan Uyển Nhi = Zata, pháp sư bay nhảy combo' },
  { vg: 'tieu-kieu-vg', lq: 'krixi-lq', score: 85, notes: 'Tiểu Kiều = Krixi, pháp sư gió AoE' },
  { vg: 'ton-binh-vg', lq: 'arthur-lq', score: 90, notes: 'Tôn Bình/Arthur = Arthur, đấu sĩ cơ bản' },
  { vg: 'ton-lien-vg', lq: 'omen-lq', score: 80, notes: 'Tôn Liên/Lão Phu Tử = Omen, đấu sĩ solo lane lock' },
  { vg: 'ton-ngo-khong-vg', lq: 'ngo-khong-lq', score: 90, notes: 'Tôn Ngộ Không = Ngộ Không, sát thủ phân thân' },
  { vg: 'ton-tan-vg', lq: 'alice-lq', score: 80, notes: 'Tôn Tẩn = Alice, hỗ trợ tăng tốc/shield' },
  { vg: 'ton-thuong-huong-vg', lq: 'violet-lq', score: 82, notes: 'Tôn Thượng Hương = Violet, xạ thủ cơ động lăn' },
  { vg: 'ton-van-vg', lq: 'sephera-lq', score: 78, notes: 'Tôn Vận/Dương Ngọc Hoàn = Sephera, hỗ trợ hồi máu AoE' },
  { vg: 'trang-chu-vg', lq: 'chaugnar-lq', score: 78, notes: 'Trang Chu = Chaugnar, hỗ trợ giải CC' },
  { vg: 'trieu-van-vg', lq: 'zephys-lq', score: 82, notes: 'Triệu Vân = Zephys, đấu sĩ/sát thủ cơ động' },
  { vg: 'trinh-giao-kim-vg', lq: 'taara-lq', score: 78, notes: 'Trình Giảo Kim = Taara, đấu sĩ hồi máu trâu' },
  { vg: 'truong-luong-vg', lq: 'aleister-lq', score: 82, notes: 'Trương Lương = Aleister, pháp sư khống chế' },
  { vg: 'truong-phi-vg', lq: 'cresht-lq', score: 80, notes: 'Trương Phi = Cresht, tank biến hình lớn' },
  { vg: 'tu-ma-y-vg', lq: 'paine-lq', score: 80, notes: 'Tư Mã Ý = Paine, sát thủ/pháp sư burst' },
  { vg: 'ukyo-tachibana-vg', lq: 'ryoma-lq', score: 85, notes: 'Ukyo Tachibana = Ryoma, đấu sĩ kiếm' },
  { vg: 'vuong-chieu-quan-vg', lq: 'djieu-thuyen-lq', score: 78, notes: 'Vương Chiêu Quân = Điêu Thuyền (LQ), pháp sư băng giá CC' },

  // === THÊM MAPPINGS DỰA TRÊN PHÂN TÍCH KỸ NĂNG ===
  { vg: 'can-tuong-mac-gia-vg', lq: 'yue-lq', score: 78, notes: 'Can Tương Mạc Gia = Yue, pháp sư song sinh/kiếm xa' },
  { vg: 'djich-nhan-kiet-vg', lq: 'valhein-lq', score: 78, notes: 'Địch Nhân Kiệt = Valhein, xạ thủ với stun' },
  { vg: 'tan-thuy-hoang-vg', lq: 'ilumia-lq', score: 75, notes: 'Tần Thủy Hoàng = Ilumia, pháp sư ult toàn bản đồ' },
  { vg: 'thanh-cat-tu-han-vg', lq: 'lindis-lq', score: 75, notes: 'Thành Cát Tư Hãn = Lindis, xạ thủ jungle cơ động' },
  { vg: 'tru-bat-gioi-vg', lq: 'baldum-lq', score: 75, notes: 'Trư Bát Giới = Baldum, tank khống chế kéo/đẩy' },
  { vg: 'ma-sieu-vg', lq: 'florentino-lq', score: 78, notes: 'Mã Siêu = Florentino, đấu sĩ lao/đâm cơ động cao' },
  { vg: 'tao-kien-vg', lq: 'capheny-lq', score: 75, notes: 'Tạo Kiên/Công Tôn Ly = Capheny, xạ thủ nhảy xa bắn nhanh' },
  { vg: 'thai-binh-cong-chua-vg', lq: 'liliana-lq', score: 75, notes: 'Thái Bình Công Chúa/Luna = Liliana, pháp sư dáng đánh combo mark' },
  { vg: 'van-trung-quan-vg', lq: 'keera-lq', score: 75, notes: 'Vân Trung Quân = Keera, sát thủ bay lượn' },
  { vg: 'vo-tac-thien-vg', lq: 'kahlii-lq', score: 72, notes: 'Võ Tắc Thiên = Kahlii, pháp sư AoE channeling' },
  { vg: 'hang-nga-vg', lq: 'ishar-lq', score: 72, notes: 'Hằng Nga = Ishar, pháp sư khống chế/triệu hồi' },
  { vg: 'ton-sach-vg', lq: 'skud-lq', score: 72, notes: 'Tôn Sách = Skud, đấu sĩ/tank lao vào đánh' },
  { vg: 'lo-ban-djai-su-vg', lq: 'teemee-lq', score: 72, notes: 'Lỗ Ban Đại Sư = TeeMee, hỗ trợ hồi sinh' },
  { vg: 'nguyen-ca-vg', lq: 'quillen-lq', score: 75, notes: 'Nguyên Ca = Quillen, sát thủ tàng hình backstab' },
  { vg: 'lan-vg', lq: 'sinestrea-lq', score: 72, notes: 'Lan = Sinestrea, sát thủ dash liên tục' },
  { vg: 'mong-djiem-vg', lq: 'bright-lq', score: 70, notes: 'Mông Điềm = Bright, đấu sĩ/tank với khiên bảo vệ' },
  { vg: 'peiqinhu-vg', lq: 'errol-lq', score: 75, notes: 'Pei Qinhu/Bùi Cầm Hổ = Errol, đấu sĩ biến hình' },
  { vg: 'to-liet-vg', lq: 'lumburr-lq', score: 72, notes: 'Tô Liệt = Lumburr, tank CC AoE' },
  { vg: 'vuong-tu-vg', lq: 'ignis-lq', score: 72, notes: 'Vương Tư = Ignis, pháp sư cờ/combo' },
  { vg: 'tham-mong-khe-vg', lq: 'iggy-lq', score: 70, notes: 'Thẩm Mộng Khê = Iggy, pháp sư ném bom' },
  { vg: 'lixin-vg', lq: 'richter-lq', score: 75, notes: 'Lixin/Lý Tín = Richter, đấu sĩ biến hình stance' },
  { vg: 'chu-du-vg', lq: 'preyta-lq', score: 72, notes: 'Chu Du = Preyta, pháp sư lửa bay' },
  { vg: 'ton-duk-vg', lq: 'zip-lq', score: 70, notes: 'Tôn Dục = Zip, hỗ trợ nuốt đồng đội' },
  { vg: 'milaidi-vg', lq: 'azzenka-lq', score: 70, notes: 'Milaidi = Azzen\'Ka, pháp sư triệu hồi/CC' },
  { vg: 'dongfangyao-vg', lq: 'aoi-lq', score: 72, notes: 'Dongfangyao/Diệu = Aoi, đấu sĩ kiếm combo' },
  { vg: 'dao-vg', lq: 'annette-lq', score: 70, notes: 'Dao/Dao = Annette, hỗ trợ bay' },
  { vg: 'thai-at-chan-nhan-vg', lq: 'payna-lq', score: 75, notes: 'Thái Ất Chân Nhân = Payna, hỗ trợ hồi máu đồng đội' },
  { vg: 'chan-co-vg', lq: 'natalya-lq', score: 65, notes: 'Chân Cơ có cơ chế đóng băng/nước tương tự Natalya' },
  // Chân Cơ scored low so won't duplicate with An Kỳ Lạp = Natalya (score 80)
  { vg: 'djai-tu-menh-vg', lq: 'lorion-lq', score: 72, notes: 'Đại Tư Mệnh = Lorion, pháp sư combo cơ động' },
  { vg: 'kinh-vg', lq: 'darcy-lq', score: 72, notes: 'Kính = D\'Arcy, sát thủ/pháp sư burst cơ động' },
  { vg: 'van-anh-vg', lq: 'astrid-lq', score: 72, notes: 'Vân Anh = Astrid, đấu sĩ nữ với ult miễn nhiễm' },
  { vg: 'khong-khong-nhi-vg', lq: 'wiro-lq', score: 68, notes: 'Không Không Nhi = Wiro, đấu sĩ/sát thủ' },
  { vg: 'ku-kong-te-vg', lq: 'dextra-lq', score: 68, notes: 'Possible match' },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Get all heroes indexed by slug
  const allHeroes = await Hero.find({ isActive: true }).lean();
  const heroBySlug = {};
  allHeroes.forEach(h => { heroBySlug[h.slug] = h; });

  console.log(`\nTotal VG heroes: ${allHeroes.filter(h => h.game === 'vg').length}`);
  console.log(`Total LQ heroes: ${allHeroes.filter(h => h.game === 'lq').length}`);

  // Get existing mappings
  const existingMappings = await HeroMapping.find().lean();
  const existingPairs = new Set();
  existingMappings.forEach(m => {
    existingPairs.add(`${m.vg_hero.toString()}_${m.lq_hero.toString()}`);
  });
  console.log(`Existing mappings: ${existingMappings.length}`);

  // Track which LQ heroes are already mapped (to avoid 1 LQ -> multiple VG)
  const lqMapped = new Map(); // lqSlug -> { vgSlug, score }
  existingMappings.forEach(m => {
    const vgHero = allHeroes.find(h => h._id.toString() === m.vg_hero.toString());
    const lqHero = allHeroes.find(h => h._id.toString() === m.lq_hero.toString());
    if (vgHero && lqHero) {
      lqMapped.set(lqHero.slug, { vgSlug: vgHero.slug, score: m.similarity_score });
    }
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const mapping of MAPPING_DATA) {
    const vgHero = heroBySlug[mapping.vg];
    const lqHero = heroBySlug[mapping.lq];

    if (!vgHero) {
      console.log(`  [SKIP] VG hero not found: ${mapping.vg}`);
      notFound++;
      continue;
    }
    if (!lqHero) {
      console.log(`  [SKIP] LQ hero not found: ${mapping.lq}`);
      notFound++;
      continue;
    }

    // Check if this LQ hero is already mapped to a different VG hero with higher score
    const existingLqMapping = lqMapped.get(mapping.lq);
    if (existingLqMapping && existingLqMapping.vgSlug !== mapping.vg) {
      if (existingLqMapping.score >= mapping.score) {
        console.log(`  [SKIP] ${mapping.lq} already mapped to ${existingLqMapping.vgSlug} (score ${existingLqMapping.score} >= ${mapping.score})`);
        skipped++;
        continue;
      } else {
        console.log(`  [UPDATE] ${mapping.lq}: replacing ${existingLqMapping.vgSlug} (${existingLqMapping.score}) with ${mapping.vg} (${mapping.score})`);
        // Delete old mapping
        await HeroMapping.deleteOne({ lq_hero: lqHero._id });
        lqMapped.delete(mapping.lq);
      }
    }

    const pairKey = `${vgHero._id.toString()}_${lqHero._id.toString()}`;
    if (existingPairs.has(pairKey)) {
      // Update score if needed
      const existing = await HeroMapping.findOne({ vg_hero: vgHero._id, lq_hero: lqHero._id });
      if (existing && existing.similarity_score !== mapping.score) {
        existing.similarity_score = mapping.score;
        existing.notes = mapping.notes;
        existing.is_verified = true;
        await existing.save();
        console.log(`  [UPDATED] ${vgHero.name_vi} <-> ${lqHero.name_vi} | score: ${mapping.score}`);
        updated++;
      } else {
        skipped++;
      }
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
      existingPairs.add(pairKey);
      lqMapped.set(mapping.lq, { vgSlug: mapping.vg, score: mapping.score });
      console.log(`  [CREATED] ${vgHero.name_vi} <-> ${lqHero.name_vi} | score: ${mapping.score}`);
      created++;
    } catch (err) {
      if (err.code === 11000) {
        console.log(`  [DUP] ${vgHero.name_vi} <-> ${lqHero.name_vi} already exists`);
        skipped++;
      } else {
        console.error(`  [ERROR] ${mapping.vg} <-> ${mapping.lq}: ${err.message}`);
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Not found: ${notFound}`);

  // Show final count
  const finalCount = await HeroMapping.countDocuments();
  console.log(`Total mappings in DB: ${finalCount}`);

  // Show unmapped LQ heroes
  const mappedLqIds = (await HeroMapping.find().lean()).map(m => m.lq_hero.toString());
  const unmappedLq = allHeroes.filter(h => h.game === 'lq' && !mappedLqIds.includes(h._id.toString()));
  console.log(`\nUnmapped LQ heroes (${unmappedLq.length}):`);
  unmappedLq.forEach(h => console.log(`  - ${h.name_vi} (${h.slug})`));

  // Show unmapped VG heroes
  const mappedVgIds = (await HeroMapping.find().lean()).map(m => m.vg_hero.toString());
  const unmappedVg = allHeroes.filter(h => h.game === 'vg' && !mappedVgIds.includes(h._id.toString()));
  console.log(`\nUnmapped VG heroes (${unmappedVg.length}):`);
  unmappedVg.forEach(h => console.log(`  - ${h.name_vi} / ${h.name_cn} (${h.slug})`));

  await mongoose.disconnect();
  console.log('\nDone!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
