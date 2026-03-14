/**
 * Central Configuration Loader
 * Tải cấu hình từ biến môi trường (.env)
 */

require('dotenv').config();

const config = {
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sosanh_lq_vg',
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },

  // S3 Storage Configuration (Cloudfly)
  s3: {
    endpoint: process.env.S3_ENDPOINT || 'https://s3.cloudfly.vn',
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET || 'sosanh-lq-vg',
    region: process.env.S3_REGION || 'us-east-1',
  },

  // Authentication Configuration
  auth: {
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    jwtSecret: process.env.JWT_SECRET || 'sosanh_lq_vg_jwt_secret_2026',
    jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  },

  // Game Constants
  games: {
    VG: 'vg', // Vương Giả Vinh Diệu (Honor of Kings)
    LQ: 'lq', // Liên Quân Mobile (Arena of Valor Vietnam)
  },

  // Hero Roles
  heroRoles: [
    'Sát Thủ', // Assassin
    'Tấn Công', // ADC / Marksman
    'Hỗ Trợ', // Support
    'Pháp Sư', // Mage
    'Chiến Binh', // Warrior
    'Bộ Binh', // Fighter / Tank
  ],

  // Item Categories
  itemCategories: [
    'Vũ Khí', // Weapon
    'Giáp Cứng', // Armor
    'Phép Thuật', // Magic
    'Tránh Né', // Dodge
    'Di Chuyển', // Movement
    'Hỗ Trợ', // Support
    'Không Phân Loại', // Miscellaneous
  ],

  // Rune Tiers
  runeTiers: ['S', 'A', 'B', 'C'],

  // Rune Categories
  runeCategories: [
    'Sức Mạnh', // Power
    'Lưỡng Tính', // Hybrid
    'Phòng Thủ', // Defense
    'Tốc Độ', // Speed
    'Công Thêm', // Extra Damage
  ],

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};

/**
 * Kiểm tra cấu hình bắt buộc
 */
const validateConfig = () => {
  const requiredEnvVars = ['MONGODB_URI'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Cảnh báo: Biến môi trường ${envVar} không được thiết lập`);
    }
  }
};

validateConfig();

module.exports = config;
