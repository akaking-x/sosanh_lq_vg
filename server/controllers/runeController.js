/**
 * Rune Controller - Điều khiển các thao tác liên quan đến rune
 */

const Rune = require('../models/Rune');

/**
 * Lấy danh sách rune với bộ lọc
 * GET /api/runes?game=vg&tier=S&category=power&search=...&page=1&limit=20
 */
const getRunes = async (req, res) => {
  try {
    const { game, tier, category, search, page = 1, limit = 500, isActive = true } = req.query;

    // Xây dựng query
    let query = {};

    if (game) {
      query.game = game;
    }

    if (tier) {
      query.tier = tier.toUpperCase();
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name_vi: { $regex: search, $options: 'i' } },
        { name_cn: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== 'false') {
      query.isActive = true;
    }

    // Tính toán pagination
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 500);

    // Thực hiện query
    const runes = await Rune.find(query)
      .limit(maxLimit)
      .skip(skip)
      .sort({ tier: 1, createdAt: -1 });

    const total = await Rune.countDocuments(query);

    res.json({
      success: true,
      data: runes,
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
      message: 'Lỗi khi lấy danh sách rune',
      error: error.message,
    });
  }
};

/**
 * Lấy rune theo ID
 * GET /api/runes/:id
 */
const getRuneById = async (req, res) => {
  try {
    const { id } = req.params;

    const rune = await Rune.findById(id);

    if (!rune) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rune',
      });
    }

    res.json({
      success: true,
      data: rune,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin rune',
      error: error.message,
    });
  }
};

/**
 * Tạo rune mới (Admin)
 * POST /api/runes
 */
const createRune = async (req, res) => {
  try {
    const {
      game,
      name,
      tier,
      category,
      imageUrl,
      stats,
      description,
      effect,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!game || !name || !tier || !category) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu bắt buộc: game, name, tier, category',
      });
    }

    // Kiểm tra game có hợp lệ không
    if (!['vg', 'lq'].includes(game)) {
      return res.status(400).json({
        success: false,
        message: 'Game không hợp lệ, phải là "vg" hoặc "lq"',
      });
    }

    // Kiểm tra tier có hợp lệ không
    if (!['S', 'A', 'B', 'C'].includes(tier.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Tier không hợp lệ, phải là S, A, B, hoặc C',
      });
    }

    // Tạo rune mới
    const rune = new Rune({
      game,
      name,
      tier: tier.toUpperCase(),
      category,
      imageUrl,
      stats: stats || {},
      description,
      effect,
    });

    await rune.save();

    res.status(201).json({
      success: true,
      message: 'Tạo rune thành công',
      data: rune,
    });
  } catch (error) {
    // Kiểm tra lỗi duplicate slug
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên rune đã tồn tại',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo rune',
      error: error.message,
    });
  }
};

/**
 * Cập nhật rune (Admin)
 * PUT /api/runes/:id
 */
const updateRune = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Không cho phép cập nhật game
    delete updateData.game;

    // Chuẩn hóa tier nếu được cập nhật
    if (updateData.tier) {
      updateData.tier = updateData.tier.toUpperCase();
    }

    const rune = await Rune.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!rune) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rune',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật rune thành công',
      data: rune,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật rune',
      error: error.message,
    });
  }
};

/**
 * Xóa rune (Admin)
 * DELETE /api/runes/:id
 */
const deleteRune = async (req, res) => {
  try {
    const { id } = req.params;

    const rune = await Rune.findByIdAndDelete(id);

    if (!rune) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rune',
      });
    }

    res.json({
      success: true,
      message: 'Xóa rune thành công',
      data: rune,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa rune',
      error: error.message,
    });
  }
};

module.exports = {
  getRunes,
  getRuneById,
  createRune,
  updateRune,
  deleteRune,
};
