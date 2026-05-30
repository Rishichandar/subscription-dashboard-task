import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    features: {
      type: [String],
      required: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stripePriceId: {
      type: String,
      default: null,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
