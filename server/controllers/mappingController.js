/**
 * Mapping Controller - Điều khiển các thao tác liên quan đến ánh xạ tướng
 * Đã đồng bộ với HeroMapping model (vg_hero, lq_hero, similarity_score)
 */

const HeroMapping = require('../models/HeroMapping');
const Hero = require('../models/Hero');

/**
 * Lấy danh sách ánh xạ
 * GET /api/mappings?page=1&limit=20
 */
const getMappings = async (req, res) => {
  try {
    const { page = 1, limit = 20, verified } = req.query;

    let query = {};
    if (verified === 'true') query.is_verified = true;
    if (verified === 'false') query.is_verified = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const maxLimit = Math.min(parseInt(limit), 100);

    const [mappings, total] = await Promise.all([
      HeroMapping.find(query)
        .populate('vg_hero', 'name_vi name_cn slug game roles avatar_url')
        .populate('lq_hero', 'name_vi slug game roles avatar_url')
        .limit(maxLimit)
        .skip(skip)
        .sort({ similarity_score: -1 }),
      HeroMapping.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: mappings,
      pagination: {
        page: parseInt(page),
        limit: maxLimit,
        total,
        pages: Math.ceil(total / maxLimit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách ánh xạ',
      error: error.message,
    });
  }
};

/**
 * Lấy ánh xạ theo ID
 * GET /api/mappings/:id
 */
const getMappingById = async (req, res) => {
  try {
    const mapping = await HeroMapping.findById(req.params.id)
      .populate('vg_hero')
      .populate('lq_hero');

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ánh xạ',
      });
    }

    res.json({ success: true, data: mapping });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin ánh xạ',
      error: error.message,
    });
  }
};

/**
 * Lấy ánh xạ dựa trên slug của hero
 * GET /api/mappings/hero/:slug?game=vg
 */
const getComparisonByHeroSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { game = 'vg' } = req.query;

    const hero = await Hero.findOne({
      slug: slug.toLowerCase(),
      game,
      isActive: true,
    });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tướng',
      });
    }

    const query = game === 'vg' ? { vg_hero: hero._id } : { lq_hero: hero._id };

    const mapping = await HeroMapping.findOne(query)
      .populate('vg_hero')
      .populate('lq_hero');

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ánh xạ so sánh cho tướng này',
      });
    }

    res.json({ success: true, data: mapping });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin so sánh',
      error: error.message,
    });
  }
};

/**
 * Tạo ánh xạ mới (Admin)
 * POST /api/mappings
 */
const createMapping = async (req, res) => {
  try {
    const {
      vg_hero, lq_hero, similarity_score,
      skill_comparison, notes, is_verified,
    } = req.body;

    if (!vg_hero || !lq_hero) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu bắt buộc: vg_hero, lq_hero',
      });
    }

    const [hero1, hero2] = await Promise.all([
      Hero.findById(vg_hero),
      Hero.findById(lq_hero),
    ]);

    if (!hero1 || !hero2) {
      return res.status(400).json({
        success: false,
        message: 'Một trong các tướng không tồn tại',
      });
    }

    if (hero1.game !== 'vg' || hero2.game !== 'lq') {
      return res.status(400).json({
        success: false,
        message: 'vg_hero phải là tướng VG và lq_hero phải là tướng LQ',
      });
    }

    const mapping = new HeroMapping({
      vg_hero, lq_hero,
      similarity_score: similarity_score || 50,
      skill_comparison: skill_comparison || [],
      notes,
      is_verified: is_verified || false,
    });

    await mapping.save();
    await mapping.populate('vg_hero lq_hero');

    res.status(201).json({
      success: true,
      message: 'Tạo ánh xạ thành công',
      data: mapping,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ánh xạ cho cặp tướng này đã tồn tại',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo ánh xạ',
      error: error.message,
    });
  }
};

/**
 * Cập nhật ánh xạ (Admin)
 * PUT /api/mappings/:id
 */
const updateMapping = async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Không cho phép đổi hero
    delete updateData.vg_hero;
    delete updateData.lq_hero;

    const mapping = await HeroMapping.findByIdAndUpdate(
      req.params.id, updateData, { new: true, runValidators: true }
    ).populate('vg_hero lq_hero');

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ánh xạ',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật ánh xạ thành công',
      data: mapping,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật ánh xạ',
      error: error.message,
    });
  }
};

/**
 * Xóa ánh xạ (Admin)
 * DELETE /api/mappings/:id
 */
const deleteMapping = async (req, res) => {
  try {
    const mapping = await HeroMapping.findByIdAndDelete(req.params.id);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ánh xạ',
      });
    }

    res.json({
      success: true,
      message: 'Xóa ánh xạ thành công',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa ánh xạ',
      error: error.message,
    });
  }
};

module.exports = {
  getMappings,
  getMappingById,
  getComparisonByHeroSlug,
  createMapping,
  updateMapping,
  deleteMapping,
};
