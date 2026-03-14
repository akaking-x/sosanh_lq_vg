/**
 * Admin Model / Mô hình Quản Trị Viên
 * Lưu trữ thông tin tài khoản quản trị viên với mật khẩu được mã hóa
 */

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

/**
 * Schema chính cho Admin
 */
const adminSchema = new mongoose.Schema(
  {
    // Thông tin đăng nhập
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Thông tin cá nhân (tùy chọn)
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
    },

    // Vai trò / Quyền hạn
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'editor',
      index: true,
    },

    // Tình trạng hoạt động
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Lần đăng nhập cuối cùng
    lastLogin: {
      type: Date,
      default: null,
    },

    // IP address lần đăng nhập cuối (tùy chọn)
    lastLoginIP: String,

    // Số lần cố gắng đăng nhập thất bại
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    // Thời gian khóa tài khoản (nếu vượt quá số lần cố gắng)
    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'admins',
  }
);

// Tạo chỉ số (index) để tăng tốc độ truy vấn
adminSchema.index({ username: 1, isActive: 1 });
adminSchema.index({ email: 1 });

/**
 * Middleware: Mã hóa mật khẩu trước khi lưu
 */
adminSchema.pre('save', async function (next) {
  // Nếu mật khẩu không được sửa đổi, bỏ qua
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Sinh salt và mã hóa mật khẩu
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method: So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa
 * @param {string} inputPassword - Mật khẩu người dùng nhập
 * @returns {Promise<boolean>} - True nếu khớp, False nếu không khớp
 */
adminSchema.methods.comparePassword = async function (inputPassword) {
  return await bcryptjs.compare(inputPassword, this.password);
};

/**
 * Method: Cập nhật thời gian đăng nhập cuối cùng
 * @param {string} ip - IP address của người dùng
 * @returns {Promise<void>}
 */
adminSchema.methods.updateLastLogin = async function (ip = null) {
  this.lastLogin = new Date();
  if (ip) {
    this.lastLoginIP = ip;
  }
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  return this.save();
};

/**
 * Method: Ghi lại lần cố gắng đăng nhập thất bại
 * @returns {Promise<void>}
 */
adminSchema.methods.recordFailedLogin = async function () {
  this.failedLoginAttempts += 1;

  // Khóa tài khoản nếu vượt quá 5 lần cố gắng
  if (this.failedLoginAttempts >= 5) {
    // Khóa trong 30 phút
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }

  return this.save();
};

/**
 * Method: Kiểm tra tài khoản có bị khóa không
 * @returns {boolean} - True nếu bị khóa, False nếu không
 */
adminSchema.methods.isLocked = function () {
  if (this.lockedUntil && this.lockedUntil > new Date()) {
    return true;
  }
  return false;
};

/**
 * Method: Chuyển đổi sang JSON (bỏ đi mật khẩu)
 */
adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

/**
 * Static Method: Tìm admin theo username
 */
adminSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: username.toLowerCase() });
};

/**
 * Static Method: Tìm admin theo email
 */
adminSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Static Method: Tìm tất cả admin hoạt động
 */
adminSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
