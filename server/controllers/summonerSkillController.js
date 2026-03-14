/**
 * Summoner Skill Controller - Điều khiển các thao tác liên quan đến Kỹ năng Pháp Sư
 */

const SummonerSkill = require('../models/SummonerSkill');

/**
 * Lấy danh sách kỹ năng với bộ lọc
 * GET /api/summoner-skills?game=vg&search=...&page=1&limit=20
 */
const getSkills = async (req, res) => {
  try {
    const { game, search, page = 1, limit = 500, isActive = true } = req.query;

    // Xây dựng query
    let query = {};

    if (game) {
      query.game = game;
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
    const skills = await SummonerSkill.find(query)
      .limit(maxLimit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await SummonerSkill.countDocuments(query);

    res.json({
      success: true,
      data: skills,
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
      message: 'Lỗi khi lấy danh sách kỹ năng',
      error: error.message,
    });
  }
};

/**
 * Lấy kỹ năng theo ID
 * GET /api/summoner-skills/:id
 */
const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await SummonerSkill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kỹ năng',
      });
    }

    res.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin kỹ năng',
      error: error.message,
    });
  }
};

/**
 * Tạo kỹ năng mới (Admin)
 * POST /api/summoner-skills
 */
const createSkill = async (req, res) => {
  try {
    const {
      game,
      name,
      imageUrl,
      cooldown,
      castTime,
      range,
      description,
      effect,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!game || !name) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu bắt buộc: game, name',
      });
    }

    // Kiểm tra game có hợp lệ không
    if (!['vg', 'lq'].includes(game)) {
      return res.status(400).json({
        success: false,
        message: 'Game không hợp lệ, phải là "vg" hoặc "lq"',
      });
    }

    // Tạo kỹ năng mới
    const skill = new SummonerSkill({
      game,
      name,
      imageUrl,
      cooldown,
      castTime,
      range,
      description,
      effect,
    });

    await skill.save();

    res.status(201).json({
      success: true,
      message: 'Tạo kỹ năng thành công',
      data: skill,
    });
  } catch (error) {
    // Kiểm tra lỗi duplicate slug
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên kỹ năng đã tồn tại',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo kỹ năng',
      error: error.message,
    });
  }
};

/**
 * Cập nhật kỹ năng (Admin)
 * PUT /api/summoner-skills/:id
 */
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Không cho phép cập nhật game
    delete updateData.game;

    const skill = await SummonerSkill.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kỹ năng',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật kỹ năng thành công',
      data: skill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật kỹ năng',
      error: error.message,
    });
  }
};

/**
 * Xóa kỹ năng (Admin)
 * DELETE /api/summoner-skills/:id
 */
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await SummonerSkill.findByIdAndDelete(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kỹ năng',
      });
    }

    res.json({
      success: true,
      message: 'Xóa kỹ năng thành công',
      data: skill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa kỹ năng',
      error: error.message,
    });
  }
};

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
};
