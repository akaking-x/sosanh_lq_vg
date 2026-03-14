/**
 * Multer Upload Middleware
 * Middleware để xử lý tải lên hình ảnh
 */

const multer = require('multer');
const path = require('path');

// Cấu hình bộ nhớ cho multer
const storage = multer.memoryStorage();

/**
 * Kiểm tra loại file
 * @param {object} file - File object
 * @returns {boolean} Có phải loại file hợp lệ
 */
const fileFilter = (req, file, cb) => {
  // Các loại MIME được phép
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/x-icon',
  ];

  // Các extension được phép
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.ico'];

  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Loại file không được hỗ trợ. Cho phép: ${allowedExtensions.join(', ')}`
      ),
      false
    );
  }
};

/**
 * Cấu hình multer cho upload hình ảnh
 */
const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Middleware xử lý lỗi upload
 * @param {object} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next middleware
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE' || err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Kích thước file vượt quá giới hạn 5MB',
        error: 'FILE_TOO_LARGE',
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Số lượng file vượt quá giới hạn',
        error: 'LIMIT_FILE_COUNT',
      });
    }

    return res.status(400).json({
      success: false,
      message: `Lỗi upload: ${err.message}`,
      error: err.code,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Lỗi upload hình ảnh',
      error: 'UPLOAD_ERROR',
    });
  }

  next();
};

/**
 * Middleware kiểm tra xem có file được upload không
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next middleware
 */
const checkFileExists = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn một hình ảnh để tải lên',
      error: 'NO_FILE',
    });
  }

  next();
};

module.exports = {
  uploadImage,
  handleUploadError,
  checkFileExists,
};
