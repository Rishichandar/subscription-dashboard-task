import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    end_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'active',
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    amount_paid: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-update expired subscriptions on query
subscriptionSchema.pre(/^find/, function (next) {
  this.populate('plan_id').populate('user_id', 'name email role');
  next();
});

export default mongoose.model('Subscription', subscriptionSchema);
