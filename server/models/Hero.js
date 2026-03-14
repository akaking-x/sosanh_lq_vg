/**
 * Hero Model / Mô hình Nhân vật
 * Lưu trữ thông tin về các nhân vật trong hai trò chơi
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Schema cho Skill (Kỹ năng)
 * Các kỹ năng của nhân vật (Passive, Q, W, E, R, v.v.)
 */
const skillSchema = new mongoose.Schema(
  {
    // Tên kỹ năng
    name_vi: { type: String, required: true },
    name_cn: String, // Chỉ cho VG

    // Mô tả
    description_vi: { type: String, required: true },
    description_cn: String, // Chỉ cho VG

    // Loại kỹ năng
    type: {
      type: String,
      enum: ['Passive', 'Q', 'W', 'E', 'R', 'Skill1', 'Skill2', 'Skill3', 'Skill4'],
      required: true,
    },

    // Hình ảnh
    icon_url: String,

    // Cooldown (giây)
    cooldown: Number,

    // Chi phí mana/energy
    manaCost: Number,
  },
  { _id: true }
);

/**
 * Schema cho trang phục (Skin)
 */
const skinSchema = new mongoose.Schema(
  {
    name_vi: { type: String, required: true },
    name_cn: String,
    icon_url: String,
    rarity: {
      type: String,
      enum: ['Common', 'Rare', 'Epic', 'Legendary'],
      default: 'Common',
    },
  },
  { _id: true }
);

/**
 * Schema chính cho Hero
 */
const heroSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name_vi: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    name_cn: {
      type: String,
      index: true,
      sparse: true, // Chỉ yêu cầu cho VG
      trim: true,
    },

    // Danh hiệu / Tiêu đề
    title_vi: {
      type: String,
      required: true,
      trim: true,
    },
    title_cn: {
      type: String,
      trim: true,
    }, // Chỉ cho VG

    // Slug để tạo URL thân thiện
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    // Game: vg (Vương Giả) hoặc lq (Liên Quân)
    game: {
      type: String,
      enum: ['vg', 'lq'],
      required: true,
      index: true,
    },

    // Vai trò / Vị trí chơi
    roles: [
      {
        type: String,
        enum: [
          'Sát Thủ',
          'Tấn Công',
          'Hỗ Trợ',
          'Pháp Sư',
          'Chiến Binh',
          'Bộ Binh',
        ],
      },
    ],

    // Độ khó chơi (1-5)
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    // Kỹ năng
    skills: [skillSchema],

    // Thống kê cơ bản
    stats: {
      // Máu cấp độ 1
      hp: Number,
      // Tấn công
      attackPower: Number,
      // Phòng thủ
      armor: Number,
      // Kháng phép
      magicResistance: Number,
      // Tốc độ di chuyển
      moveSpeed: Number,
      // Lãi suất tăng máu
      hpRegenPerSecond: Number,
    },

    // Rune được khuyến nghị
    recommended_runes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rune',
      },
    ],

    // Hình ảnh đại diện
    avatar_url: String,

    // Trang phục / Skin
    skins: [skinSchema],

    // Mô tả chi tiết
    description: {
      type: String,
      trim: true,
    },

    // Ngôn ngữ cấu hình (vg, lq, hoặc cả hai)
    supported_languages: {
      type: [String],
      enum: ['vi', 'cn', 'en'],
      default: ['vi'],
    },

    // Tình trạng (được phát hành hay chưa)
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    // Tự động thêm createdAt và updatedAt
    timestamps: true,
    // Tên bộ sưu tập
    collection: 'heroes',
  }
);

// Tạo chỉ số (index) để tăng tốc độ truy vấn
heroSchema.index({ game: 1, name_vi: 1 });
heroSchema.index({ game: 1, slug: 1 });
heroSchema.index({ roles: 1 });
heroSchema.index({ game: 1, difficulty: 1 });

// Text index để tìm kiếm toàn văn bản
heroSchema.index({ name_vi: 'text', title_vi: 'text', description: 'text' });

/**
 * Middleware: Chuẩn bị dữ liệu trước khi lưu
 */
heroSchema.pre('save', async function (next) {
  // Nếu name_cn không được set nhưng game là 'vg', đặt nó bằng name_vi
  if (this.game === 'vg' && !this.name_cn) {
    this.name_cn = this.name_vi;
  }

  // Tự động tạo slug từ name_vi nếu chưa có
  if (!this.slug || this.isModified('name_vi')) {
    this.slug = slugify(`${this.name_vi}-${this.game}`, {
      lower: true,
      strict: true,
    });
  }

  next();
});

/**
 * Method: Lấy toàn bộ thông tin hero
 */
heroSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

/**
 * Static Method: Tìm hero theo slug
 */
heroSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

/**
 * Static Method: Tìm tất cả hero theo game
 */
heroSchema.statics.findByGame = function (game) {
  return this.find({ game, isActive: true });
};

/**
 * Static Method: Tìm hero theo role
 */
heroSchema.statics.findByRole = function (role) {
  return this.find({ roles: role, isActive: true });
};

// Xóa toàn bộ mappings khi xóa hero
heroSchema.post(
  'deleteOne',
  { document: true },
  async function (next) {
    try {
      const HeroMapping = mongoose.model('HeroMapping');
      await HeroMapping.deleteMany({
        $or: [
          { vg_hero: this._id },
          { lq_hero: this._id },
        ],
      });
      next();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = mongoose.model('Hero', heroSchema);
