/**
 * SummonerSkill Model / Mô hình Kỹ năng Thuật Sư (Summoner Skill / Battle Spell)
 * Lưu trữ thông tin về các kỹ năng phụ mà người chơi có thể sử dụng trong trận đấu
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Schema chính cho SummonerSkill
 */
const summonerSkillSchema = new mongoose.Schema(
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

    // Mô tả chi tiết
    description_vi: {
      type: String,
      required: true,
      trim: true,
    },
    description_cn: {
      type: String,
      trim: true,
    }, // Chỉ cho VG

    // Cooldown (giây)
    cooldown: {
      type: Number,
      required: true,
    },

    // Cấp độ khóa (cần đạt cấp độ bao nhiêu để sử dụng)
    unlock_level: {
      type: Number,
      default: 1,
    },

    // Hình ảnh/Icon
    icon_url: String,

    // Loại kỹ năng
    type: {
      type: String,
      enum: ['Offensive', 'Defensive', 'Utility', 'Support'],
      default: 'Utility',
    },

    // Mức độ khó sử dụng
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 2,
    },

    // Tình trạng (được phát hành hay chưa)
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Ghi chú hoặc mẹo sử dụng
    tips: {
      type: String,
      trim: true,
    },

    // Combo hoặc kỹ năng tương thích
    compatible_with: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SummonerSkill',
      },
    ],

    // Ngôn ngữ được hỗ trợ
    supported_languages: {
      type: [String],
      enum: ['vi', 'cn', 'en'],
      default: ['vi'],
    },
  },
  {
    timestamps: true,
    collection: 'summoner_skills',
  }
);

// Tạo chỉ số (index) để tăng tốc độ truy vấn
summonerSkillSchema.index({ game: 1, name_vi: 1 });
summonerSkillSchema.index({ game: 1, slug: 1 });
summonerSkillSchema.index({ type: 1 });
summonerSkillSchema.index({ game: 1, type: 1 });
summonerSkillSchema.index({ game: 1, unlock_level: 1 });

// Text index để tìm kiếm toàn văn bản
summonerSkillSchema.index({ name_vi: 'text', description_vi: 'text' });

/**
 * Middleware: Chuẩn bị dữ liệu trước khi lưu
 */
summonerSkillSchema.pre('save', async function (next) {
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
 * Method: Chuyển đổi sang JSON
 */
summonerSkillSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

/**
 * Static Method: Tìm kỹ năng theo slug
 */
summonerSkillSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

/**
 * Static Method: Tìm kỹ năng theo game
 */
summonerSkillSchema.statics.findByGame = function (game) {
  return this.find({ game, isActive: true });
};

/**
 * Static Method: Tìm kỹ năng theo loại
 */
summonerSkillSchema.statics.findByType = function (type, game = null) {
  const query = { type, isActive: true };
  if (game) {
    query.game = game;
  }
  return this.find(query);
};

/**
 * Static Method: Tìm kỹ năng có thể mở khóa ở cấp độ nhất định
 */
summonerSkillSchema.statics.findUnlockedAtLevel = function (level, game = null) {
  const query = { unlock_level: { $lte: level }, isActive: true };
  if (game) {
    query.game = game;
  }
  return this.find(query).sort({ unlock_level: 1 });
};

/**
 * Static Method: Tìm kỹ năng tương thích với một kỹ năng khác
 */
summonerSkillSchema.statics.findCompatibleWith = function (skillId) {
  return this.find({ compatible_with: skillId, isActive: true });
};

module.exports = mongoose.model('SummonerSkill', summonerSkillSchema);
