/**
 * Hero Controller - Điều khiển các thao tác liên quan đến tướng
 * Đã đồng bộ với Hero model (name_vi, name_cn, title_vi, title_cn)
 */

const Hero = require('../models/Hero');

/**
 * Lấy danh sách tướng với bộ lọc
 * GET /api/heroes?game=vg&role=...&search=...&page=1&limit=20
 */
const getHeroes = async (req, res) => {
  try {
    const { game, role, search, page = 1, limit = 500 } = req.query;

    let query = { isActive: true };

    if (game && ['vg', 'lq'].includes(game)) {
      query.game = game;
    }

    if (role) {
      query.roles = role;
    }

    if (search) {
      query.$or = [
        { name_vi: { $regex: search, $options: 'i' } },
        { name_cn: { $regex: search, $options: 'i' } },
        { title_vi: { $regex: search, $options: 'i' } },
        { title_cn: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const maxLimit = Math.min(parseInt(limit), 500);

    const [heroes, total] = await Promise.all([
      Hero.find(query)
        .select('-skills.description_cn -skills.description_vi')
        .limit(maxLimit)
        .skip(skip)
        .sort({ name_vi: 1 }),
      Hero.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: heroes,
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
      message: 'Lỗi khi lấy danh sách tướng',
      error: error.message,
    });
  }
};

/**
 * Lấy tướng theo slug
 * GET /api/heroes/:slug
 */
const getHeroBySlug = async (req, res) => {
  try {
    const hero = await Hero.findOne({
      slug: req.params.slug.toLowerCase(),
      isActive: true,
    });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tướng',
      });
    }

    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin tướng',
      error: error.message,
    });
  }
};

/**
 * Lấy tướng theo ID
 * GET /api/heroes/id/:id
 */
const getHeroById = async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tướng',
      });
    }
    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin tướng',
      error: error.message,
    });
  }
};

/**
 * Tạo tướng mới (Admin)
 * POST /api/heroes
 */
const createHero = async (req, res) => {
  try {
    const {
      game, name_vi, name_cn, title_vi, title_cn,
      roles, difficulty, skills, stats,
      avatar_url, skins, description,
      recommended_runes, supported_languages,
    } = req.body;

    if (!game || !name_vi || !title_vi || !roles || !Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu bắt buộc: game, name_vi, title_vi, roles',
      });
    }

    if (!['vg', 'lq'].includes(game)) {
      return res.status(400).json({
        success: false,
        message: 'Game không hợp lệ, phải là "vg" hoặc "lq"',
      });
    }

    const hero = new Hero({
      game, name_vi, name_cn, title_vi, title_cn,
      roles, difficulty,
      skills: skills || [],
      stats: stats || {},
      avatar_url, skins: skins || [],
      description,
      recommended_runes: recommended_runes || [],
      supported_languages: supported_languages || (game === 'vg' ? ['vi', 'cn'] : ['vi']),
    });

    await hero.save();

    res.status(201).json({
      success: true,
      message: 'Tạo tướng thành công',
      data: hero,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tướng đã tồn tại',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo tướng',
      error: error.message,
    });
  }
};

/**
 * Cập nhật tướng (Admin)
 * PUT /api/heroes/:id
 */
const updateHero = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.game; // Không cho phép đổi game

    const hero = await Hero.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tướng',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật tướng thành công',
      data: hero,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật tướng',
      error: error.message,
    });
  }
};

/**
 * Xóa tướng (Admin)
 * DELETE /api/heroes/:id
 */
const deleteHero = async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tướng',
      });
    }

    await hero.deleteOne();

    res.json({
      success: true,
      message: 'Xóa tướng thành công',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tướng',
      error: error.message,
    });
  }
};

module.exports = {
  getHeroes,
  getHeroBySlug,
  getHeroById,
  createHero,
  updateHero,
  deleteHero,
};
