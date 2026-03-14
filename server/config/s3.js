/**
 * AWS S3 Client Configuration
 * Cấu hình AWS S3 Client cho lưu trữ hình ảnh
 */

const { S3Client } = require('@aws-sdk/client-s3');

/**
 * Tạo và cấu hình S3 Client
 * Sử dụng S3 Compatible Storage từ Cloudfly
 */
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || 'https://s3.cloudfly.vn',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  // Tùy chọn bổ sung cho S3 compatible storage
  forcePathStyle: true,
  signatureVersion: 'v4',
});

/**
 * Xác minh cấu hình S3
 */
const validateS3Config = () => {
  const requiredEnvVars = [
    'S3_ENDPOINT',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'S3_BUCKET',
    'S3_REGION',
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.warn(
      `Cảnh báo: Các biến môi trường S3 chưa được thiết lập: ${missingVars.join(', ')}`
    );
  }
};

// Gọi xác minh cấu hình khi module được load
validateS3Config();

module.exports = {
  s3Client,
  validateS3Config,
};
