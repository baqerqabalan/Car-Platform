const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    audios: {
      horn: {
        type: String,
      },
      engine: {
        type: String,
      },
      boost: {
        type: String,
      },
    },
    features: {
      engine: { type: String },
      interior: { type: String },
      safety: { type: String },
    },
    status: {
      type: String,
      enum: ["published", "unpublished", "hasPublished"],
      default: "unpublished",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    startPublishDate: {
      type:Date,
      required: true
    },
    endPublishDate: {
      type:Date,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Advertisement', advertisementSchema);