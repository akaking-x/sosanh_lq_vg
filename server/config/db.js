/**
 * MongoDB Database Connection Configuration
 * Cấu hình kết nối MongoDB
 */

const mongoose = require('mongoose');

/**
 * Kết nối đến MongoDB sử dụng Mongoose
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sosanh_lq_vg';

    await mongoose.connect(mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB đã kết nối thành công');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Port: ${mongoose.connection.port}`);

    // Lắng nghe các sự kiện kết nối
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB đã mất kết nối');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Lỗi kết nối MongoDB:', err);
    });

    return mongoose.connection;
  } catch (error) {
    console.error('Không thể kết nối MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Ngắt kết nối MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB đã ngắt kết nối');
  } catch (error) {
    console.error('Lỗi khi ngắt kết nối MongoDB:', error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  mongoose,
};
