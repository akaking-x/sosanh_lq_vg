/**
 * Middleware xác thực - Kiểm tra JWT token
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware xác thực JWT token
 * Kiểm tra token trong header Authorization
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực',
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.auth.jwtSecret);
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
    });
  }
};

/**
 * Middleware kiểm tra quyền admin
 */
const authorize = (allowedRoles = ['admin']) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập',
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền để thực hiện thao tác này',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
