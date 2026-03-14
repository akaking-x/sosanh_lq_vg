/**
 * Item Controller - Điều khiển các thao tác liên quan đến vật phẩm
 */

const Item = require('../models/Item');

/**
 * Lấy danh sách vật phẩm với bộ lọc
 * GET /api/items?game=vg&category=weapon&search=...&page=1&limit=20
 */
const getItems = async (req, res) => {
  try {
    const { game, category, search, page = 1, limit = 20, isActive = true } = req.query;

    // Xây dựng query
    let query = {};

    if (game) {
      query.game = game;
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
    const maxLimit = Math.min(limit, 100);

    // Thực hiện query
    const items = await Item.find(query)
      .limit(maxLimit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Item.countDocuments(query);

    res.json({
      success: true,
      data: items,
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
      message: 'Lỗi khi lấy danh sách vật phẩm',
      error: error.message,
    });
  }
};

/**
 * Lấy vật phẩm theo slug
 * GET /api/items/:slug
 */
const getItemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const item = await Item.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vật phẩm',
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin vật phẩm',
      error: error.message,
    });
  }
};

/**
 * Lấy vật phẩm theo ID
 * GET /api/items/id/:id
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vật phẩm',
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin vật phẩm',
      error: error.message,
    });
  }
};

/**
 * Tạo vật phẩm mới (Admin)
 * POST /api/items
 */
const createItem = async (req, res) => {
  try {
    const {
      game,
      name,
      category,
      imageUrl,
      price,
      stats,
      description,
      effect,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!game || !name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu bắt buộc: game, name, category',
      });
    }

    // Kiểm tra game có hợp lệ không
    if (!['vg', 'lq'].includes(game)) {
      return res.status(400).json({
        success: false,
        message: 'Game không hợp lệ, phải là "vg" hoặc "lq"',
      });
    }

    // Tạo vật phẩm mới
    const item = new Item({
      game,
      name,
      category,
      imageUrl,
      price,
      stats: stats || {},
      description,
      effect,
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Tạo vật phẩm thành công',
      data: item,
    });
  } catch (error) {
    // Kiểm tra lỗi duplicate slug
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên vật phẩm đã tồn tại',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo vật phẩm',
      error: error.message,
    });
  }
};

/**
 * Cập nhật vật phẩm (Admin)
 * PUT /api/items/:id
 */
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Không cho phép cập nhật game
    delete updateData.game;

    const item = await Item.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vật phẩm',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật vật phẩm thành công',
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật vật phẩm',
      error: error.message,
    });
  }
};

/**
 * Xóa vật phẩm (Admin)
 * DELETE /api/items/:id
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vật phẩm',
      });
    }

    res.json({
      success: true,
      message: 'Xóa vật phẩm thành công',
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa vật phẩm',
      error: error.message,
    });
  }
};

module.exports = {
  getItems,
  getItemBySlug,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
