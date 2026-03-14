/**
 * Rune Model / Mô hình Rune (Chứng chỉ / Inscription)
 * Lưu trữ thông tin về các rune hoặc inscription trong hai trò chơi
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Schema chính cho Rune
 */
const runeSchema = new mongoose.Schema(
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

    // Cấp bậc (S, A, B, C)
    tier: {
      type: String,
      enum: ['S', 'A', 'B', 'C'],
      required: true,
      index: true,
    },

    // Danh mục rune
    category: {
      type: String,
      enum: [
        'Sức Mạnh',
        'Lưỡng Tính',
        'Phòng Thủ',
        'Tốc Độ',
        'Công Thêm',
        'Không Phân Loại',
      ],
      required: true,
      index: true,
    },

    // Thống kê cung cấp
    stats: {
      // Tấn công
      attackPower: { type: Number, default: 0 },
      // Phòng thủ
      armor: { type: Number, default: 0 },
      // Kháng phép
      magicResistance: { type: Number, default: 0 },
      // Máu
      hp: { type: Number, default: 0 },
      // Mana
      mana: { type: Number, default: 0 },
      // Tốc độ tấn công
      attackSpeed: { type: Number, default: 0 },
      // Tốc độ di chuyển
      moveSpeed: { type: Number, default: 0 },
      // Hút máu
      lifeSteal: { type: Number, default: 0 },
      // Hút mana
      manaSteal: { type: Number, default: 0 },
      // Lãi suất phục hồi
      hpRegen: { type: Number, default: 0 },
      manaRegen: { type: Number, default: 0 },
      // Khả năng chịu đựng
      toughness: { type: Number, default: 0 },
      // Giảm cooldown
      cooldownReduction: { type: Number, default: 0 },
      // Xác suất chí mạng
      criticalChance: { type: Number, default: 0 },
    },

    // Mô tả hiệu ứng
    description_vi: {
      type: String,
      trim: true,
    },
    description_cn: {
      type: String,
      trim: true,
    }, // Chỉ cho VG

    // Hình ảnh rune
    icon_url: String,

    // Tương thích với các hero (tùy chọn)
    compatible_heroes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hero',
      },
    ],

    // Ghi chú về lợi dụng hoặc điểm yếu
    notes: {
      type: String,
      trim: true,
    },

    // Ngôn ngữ được hỗ trợ
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

    // Cấp độ khóa (nếu có)
    unlockLevel: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: 'runes',
  }
);

// Tạo chỉ số (index) để tăng tốc độ truy vấn
runeSchema.index({ game: 1, name_vi: 1 });
runeSchema.index({ game: 1, slug: 1 });
runeSchema.index({ tier: 1 });
runeSchema.index({ category: 1 });
runeSchema.index({ game: 1, tier: 1 });
runeSchema.index({ game: 1, category: 1 });

// Text index để tìm kiếm toàn văn bản
runeSchema.index({ name_vi: 'text', description_vi: 'text' });

/**
 * Middleware: Chuẩn bị dữ liệu trước khi lưu
 */
runeSchema.pre('save', async function (next) {
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
runeSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

/**
 * Static Method: Tìm rune theo slug
 */
runeSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

/**
 * Static Method: Tìm rune theo game
 */
runeSchema.statics.findByGame = function (game) {
  return this.find({ game, isActive: true });
};

/**
 * Static Method: Tìm rune theo tier
 */
runeSchema.statics.findByTier = function (tier, game = null) {
  const query = { tier, isActive: true };
  if (game) {
    query.game = game;
  }
  return this.find(query).sort({ category: 1 });
};

/**
 * Static Method: Tìm rune theo category
 */
runeSchema.statics.findByCategory = function (category, game = null) {
  const query = { category, isActive: true };
  if (game) {
    query.game = game;
  }
  return this.find(query).sort({ tier: 1 });
};

/**
 * Static Method: Tìm rune khuyến nghị cho một hero
 */
runeSchema.statics.findForHero = function (heroId) {
  return this.find({ compatible_heroes: heroId, isActive: true });
};

module.exports = mongoose.model('Rune', runeSchema);
