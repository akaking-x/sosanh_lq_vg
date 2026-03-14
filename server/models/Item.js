/**
 * Item Model / Mô hình Vật phẩm (Trang bị)
 * Lưu trữ thông tin về các vật phẩm/trang bị trong hai trò chơi
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Schema chính cho Item
 */
const itemSchema = new mongoose.Schema(
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

    // Danh mục vật phẩm
    category: {
      type: String,
      enum: [
        'Vũ Khí',
        'Giáp Cứng',
        'Phép Thuật',
        'Tránh Né',
        'Di Chuyển',
        'Hỗ Trợ',
        'Không Phân Loại',
      ],
      required: true,
      index: true,
    },

    // Giá vật phẩm
    price: {
      type: Number,
      required: true,
    },

    // Thống kê cơ bản
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
      // Kiên nhẫn / Critical Resistance
      toughness: { type: Number, default: 0 },
      // Chỉ số khác
      cooldownReduction: { type: Number, default: 0 },
      criticalChance: { type: Number, default: 0 },
    },

    // Hiệu ứng thụ động (Passive effect)
    passive_vi: String,
    passive_cn: String, // Chỉ cho VG

    // Hiệu ứng chủ động (Active effect)
    active_vi: String,
    active_cn: String, // Chỉ cho VG

    // Vật phẩm cấu thành (Tạo thành từ những vật phẩm nào)
    components: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
      },
    ],

    // Hình ảnh vật phẩm
    icon_url: String,

    // Mô tả chi tiết
    description: {
      type: String,
      trim: true,
    },

    // Ngôn ngữ được hỗ trợ
    supported_languages: {
      type: [String],
      enum: ['vi', 'cn', 'en'],
      default: ['vi'],
    },

    // Hiệu quả cao / Đánh giá độ mạnh
    tier: {
      type: String,
      enum: ['S', 'A', 'B', 'C', 'D'],
      default: 'B',
    },

    // Tình trạng (được phát hành hay chưa)
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'items',
  }
);

// Tạo chỉ số (index) để tăng tốc độ truy vấn
itemSchema.index({ game: 1, name_vi: 1 });
itemSchema.index({ game: 1, slug: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ game: 1, category: 1 });
itemSchema.index({ game: 1, tier: 1 });

// Text index để tìm kiếm toàn văn bản
itemSchema.index({ name_vi: 'text', description: 'text' });

/**
 * Middleware: Chuẩn bị dữ liệu trước khi lưu
 */
itemSchema.pre('save', async function (next) {
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
itemSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

/**
 * Static Method: Tìm vật phẩm theo slug
 */
itemSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

/**
 * Static Method: Tìm vật phẩm theo game
 */
itemSchema.statics.findByGame = function (game) {
  return this.find({ game, isActive: true });
};

/**
 * Static Method: Tìm vật phẩm theo category
 */
itemSchema.statics.findByCategory = function (category, game = null) {
  const query = { category, isActive: true };
  if (game) {
    query.game = game;
  }
  return this.find(query);
};

/**
 * Static Method: Tìm vật phẩm theo tier
 */
itemSchema.statics.findByTier = function (tier, game = null) {
  const query = { tier, isActive: true };
  if (game) {
    query.game = game;
  }
  return this.find(query);
};

module.exports = mongoose.model('Item', itemSchema);
