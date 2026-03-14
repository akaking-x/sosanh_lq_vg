/**
 * HeroMapping Model / Mô hình Ánh xạ Nhân vật
 * Lưu trữ ánh xạ giữa các nhân vật tương tự trong hai trò chơi
 */

const mongoose = require('mongoose');

/**
 * Schema cho so sánh kỹ năng
 */
const skillComparisonSchema = new mongoose.Schema(
  {
    vg_skill: String,
    lq_skill: String,
    similarity_note: String,
  },
  { _id: true }
);

/**
 * Schema chính cho HeroMapping
 */
const heroMappingSchema = new mongoose.Schema(
  {
    // Nhân vật Vương Giả Vinh Diệu
    vg_hero: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hero',
      required: true,
      index: true,
    },

    // Nhân vật Liên Quân Mobile
    lq_hero: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hero',
      required: true,
      index: true,
    },

    // Độ tương đồng (0-100)
    similarity_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
      required: true,
    },

    // So sánh kỹ năng
    skill_comparison: [skillComparisonSchema],

    // Ghi chú về sự tương đồng
    notes: {
      type: String,
      trim: true,
    },

    // Các khía cạnh so sánh chi tiết
    comparison: {
      gameplay_vi: {
        type: String,
        trim: true,
      },
      gameplay_cn: {
        type: String,
        trim: true,
      },
      strengths_vi: {
        type: String,
        trim: true,
      },
      strengths_cn: {
        type: String,
        trim: true,
      },
      weaknesses_vi: {
        type: String,
        trim: true,
      },
      weaknesses_cn: {
        type: String,
        trim: true,
      },
      build_recommendation_vi: {
        type: String,
        trim: true,
      },
      build_recommendation_cn: {
        type: String,
        trim: true,
      },
    },

    // Vật phẩm tương ứng
    item_mappings: [
      {
        vg_item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
        },
        lq_item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
        },
      },
    ],

    // Rune tương ứng
    rune_mappings: [
      {
        vg_rune: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Rune',
        },
        lq_rune: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Rune',
        },
      },
    ],

    // Đã xác minh bởi quản trị viên
    is_verified: {
      type: Boolean,
      default: false,
      index: true,
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
    collection: 'hero_mappings',
  }
);

// Tạo chỉ số (index) để tăng tốc độ truy vấn
heroMappingSchema.index({ vg_hero: 1, lq_hero: 1 }, { unique: true });
heroMappingSchema.index({ vg_hero: 1 });
heroMappingSchema.index({ lq_hero: 1 });
heroMappingSchema.index({ similarity_score: -1 });
heroMappingSchema.index({ is_verified: 1 });

/**
 * Middleware: Chuẩn bị dữ liệu trước khi lưu
 */
heroMappingSchema.pre('save', async function (next) {
  // Đảm bảo vg_hero và lq_hero luôn được gán theo thứ tự đúng
  // Có thể thêm validate logic ở đây nếu cần
  next();
});

/**
 * Method: Chuyển đổi sang JSON
 */
heroMappingSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

/**
 * Static Method: Tìm mapping theo hero Vương Giả
 */
heroMappingSchema.statics.findByVGHero = function (heroId) {
  return this.findOne({ vg_hero: heroId })
    .populate('vg_hero')
    .populate('lq_hero');
};

/**
 * Static Method: Tìm mapping theo hero Liên Quân
 */
heroMappingSchema.statics.findByLQHero = function (heroId) {
  return this.findOne({ lq_hero: heroId })
    .populate('vg_hero')
    .populate('lq_hero');
};

/**
 * Static Method: Tìm tất cả mapping đã xác minh
 */
heroMappingSchema.statics.findVerified = function () {
  return this.find({ is_verified: true, isActive: true })
    .populate('vg_hero')
    .populate('lq_hero')
    .sort({ similarity_score: -1 });
};

/**
 * Static Method: Tìm mapping theo khoảng độ tương đồng
 */
heroMappingSchema.statics.findBySimilarityRange = function (
  minScore,
  maxScore
) {
  return this.find({
    similarity_score: { $gte: minScore, $lte: maxScore },
    isActive: true,
  })
    .populate('vg_hero')
    .populate('lq_hero')
    .sort({ similarity_score: -1 });
};

const HeroMapping = mongoose.model('HeroMapping', heroMappingSchema);

module.exports = HeroMapping;
