/**
 * Admin Controller - Điều khiển các thao tác quản trị
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const Admin = require('../models/Admin');
const Hero = require('../models/Hero');
const Item = require('../models/Item');
const Rune = require('../models/Rune');
const Mapping = require('../models/Mapping');

/**
 * Đăng nhập admin
 * POST /api/admin/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp username và password',
      });
    }

    // Tìm admin
    const admin = await Admin.findOne({
      username: username.toLowerCase(),
      isActive: true,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác',
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác',
      });
    }

    // Cập nhật lastLogin
    admin.lastLogin = new Date();
    await admin.save();

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      config.auth.jwtSecret,
      {
        expiresIn: config.auth.jwtExpiration,
      }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng nhập',
      error: error.message,
    });
  }
};

/**
 * Lấy thông tin profile admin
 * GET /api/admin/profile
 */
const getProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const admin = await Admin.findById(adminId).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy admin',
      });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin profile',
      error: error.message,
    });
  }
};

/**
 * Lấy dashboard stats
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    // Thực hiện các query song song
    const [heroCount, itemCount, runeCount, mappingCount, skillCount] = await Promise.all([
      Hero.countDocuments({ isActive: true }),
      Item.countDocuments({ isActive: true }),
      Rune.countDocuments({ isActive: true }),
      Mapping.countDocuments({ isActive: true }),
      require('../models/SummonerSkill').countDocuments({ isActive: true }),
    ]);

    // Thống kê theo game
    const [vgHeroes, lqHeroes] = await Promise.all([
      Hero.countDocuments({ game: 'vg', isActive: true }),
      Hero.countDocuments({ game: 'lq', isActive: true }),
    ]);

    res.json({
      success: true,
      data: {
        heroes: {
          total: heroCount,
          vg: vgHeroes,
          lq: lqHeroes,
        },
        items: itemCount,
        runes: runeCount,
        summonerSkills: skillCount,
        mappings: mappingCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu dashboard',
      error: error.message,
    });
  }
};

/**
 * Đổi mật khẩu admin
 * POST /api/admin/change-password
 */
const changePassword = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin',
      });
    }

    // Kiểm tra mật khẩu mới và xác nhận
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới không khớp',
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
    }

    // Lấy admin từ database
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy admin',
      });
    }

    // Kiểm tra mật khẩu cũ
    const isOldPasswordValid = await admin.comparePassword(oldPassword);

    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu cũ không chính xác',
      });
    }

    // Cập nhật mật khẩu mới
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đổi mật khẩu',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  getProfile,
  getDashboard,
  changePassword,
};
