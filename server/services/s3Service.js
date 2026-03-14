/**
 * S3 Service for Image Management
 * Dịch vụ S3 để quản lý hình ảnh
 */

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const axios = require('axios');
const { s3Client } = require('../config/s3');

const S3_BUCKET = process.env.S3_BUCKET || 'sosanh-lq-vg';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://s3.cloudfly.vn';

/**
 * Tạo khóa S3 cho hình ảnh hero
 * @param {string} slug - Slug của hero
 * @param {string} game - Tên game (vg, lq)
 * @returns {string} Khóa S3
 */
const generateHeroImageKey = (slug, game = 'vg') => {
  return `heroes/${game}/${slug}.png`;
};

/**
 * Tạo khóa S3 cho hình ảnh item
 * @param {string} slug - Slug của item
 * @param {string} game - Tên game (vg, lq)
 * @returns {string} Khóa S3
 */
const generateItemImageKey = (slug, game = 'lq') => {
  return `items/${game}/${slug}.png`;
};

/**
 * Tạo URL công khai cho hình ảnh từ khóa S3
 * @param {string} key - Khóa S3
 * @returns {string} URL công khai
 */
const getPublicUrl = (key) => {
  return `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
};

/**
 * Kiểm tra và tạo bucket nếu chưa tồn tại
 * @returns {Promise<void>}
 */
const ensureBucketExists = async () => {
  try {
    // Kiểm tra bucket đã tồn tại
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: S3_BUCKET,
      })
    );
    console.log(`Bucket S3 "${S3_BUCKET}" đã tồn tại`);
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      try {
        // Tạo bucket nếu chưa tồn tại
        await s3Client.send(
          new CreateBucketCommand({
            Bucket: S3_BUCKET,
          })
        );
        console.log(`Bucket S3 "${S3_BUCKET}" đã được tạo thành công`);
      } catch (createError) {
        console.error(`Lỗi khi tạo bucket S3: ${createError.message}`);
        throw createError;
      }
    } else {
      console.error(`Lỗi khi kiểm tra bucket S3: ${error.message}`);
      throw error;
    }
  }
};

/**
 * Tải lên hình ảnh lên S3
 * @param {Buffer} buffer - Nội dung file hình ảnh
 * @param {string} key - Khóa S3
 * @param {string} contentType - Loại MIME của file
 * @returns {Promise<{url: string, key: string}>} URL công khai
 */
const uploadImage = async (buffer, key, contentType = 'image/png') => {
  try {
    if (!buffer) {
      throw new Error('Buffer không hợp lệ');
    }

    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    await s3Client.send(new PutObjectCommand(params));

    const url = getPublicUrl(key);
    console.log(`Hình ảnh đã được tải lên: ${key}`);

    return {
      url,
      key,
    };
  } catch (error) {
    console.error(`Lỗi khi tải lên hình ảnh: ${error.message}`);
    throw error;
  }
};

/**
 * Tải hình ảnh từ URL và tải lên S3
 * @param {string} imageUrl - URL của hình ảnh
 * @param {string} key - Khóa S3
 * @returns {Promise<{url: string, key: string}>} URL công khai
 */
const uploadFromUrl = async (imageUrl, key) => {
  try {
    if (!imageUrl) {
      throw new Error('URL hình ảnh không hợp lệ');
    }

    // Tải hình ảnh từ URL
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const buffer = Buffer.from(response.data, 'binary');
    const contentType = response.headers['content-type'] || 'image/png';

    return await uploadImage(buffer, key, contentType);
  } catch (error) {
    console.error(`Lỗi khi tải hình ảnh từ URL: ${error.message}`);
    throw error;
  }
};

/**
 * Xóa hình ảnh từ S3
 * @param {string} key - Khóa S3
 * @returns {Promise<void>}
 */
const deleteImage = async (key) => {
  try {
    if (!key) {
      throw new Error('Khóa S3 không hợp lệ');
    }

    const params = {
      Bucket: S3_BUCKET,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`Hình ảnh đã được xóa: ${key}`);
  } catch (error) {
    console.error(`Lỗi khi xóa hình ảnh: ${error.message}`);
    throw error;
  }
};

/**
 * Lấy signed URL cho các object private
 * @param {string} key - Khóa S3
 * @param {number} expiresIn - Thời gian hết hạn (giây), mặc định 3600 giây (1 giờ)
 * @returns {Promise<string>} Signed URL
 */
const getSignedUrlForKey = async (key, expiresIn = 3600) => {
  try {
    if (!key) {
      throw new Error('Khóa S3 không hợp lệ');
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error(`Lỗi khi lấy signed URL: ${error.message}`);
    throw error;
  }
};

/**
 * Liệt kê hình ảnh theo tiền tố
 * @param {string} prefix - Tiền tố (ví dụ: 'heroes/vg/', 'items/lq/')
 * @returns {Promise<Array>} Danh sách các object
 */
const listImages = async (prefix = '') => {
  try {
    const params = {
      Bucket: S3_BUCKET,
      Prefix: prefix,
    };

    const command = new ListObjectsV2Command(params);
    const response = await s3Client.send(command);

    if (!response.Contents) {
      return [];
    }

    return response.Contents.map((item) => ({
      key: item.Key,
      url: getPublicUrl(item.Key),
      size: item.Size,
      lastModified: item.LastModified,
    }));
  } catch (error) {
    console.error(`Lỗi khi liệt kê hình ảnh: ${error.message}`);
    throw error;
  }
};

module.exports = {
  uploadImage,
  uploadFromUrl,
  deleteImage,
  getSignedUrlForKey,
  listImages,
  ensureBucketExists,
  generateHeroImageKey,
  generateItemImageKey,
  getPublicUrl,
};
