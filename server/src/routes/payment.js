import express from "express";
import Stripe from "stripe";
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_your_stripe_secret_key") return null;
  return new Stripe(key);
};

router.post("/create-intent", authenticate, async (req, res) => {
  try {
    const stripe = getStripe();
    console.log(stripe, "stripe");
    if (!stripe) {
      return res.status(400).json({
        success: false,
        message: "Stripe is not configured. Using free subscription mode.",
      });
    }

    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    console.log(plan, "plan");
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });

    if (plan.price === 0) {
      return res.json({ success: true, free: true });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100),
      currency: "usd",
      metadata: {
        planId: plan._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: plan.price,
        planName: plan.name,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/confirm", authenticate, async (req, res) => {
  try {
    const stripe = getStripe();
    const { paymentIntentId, planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });

    let verified = true;
    if (stripe && paymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      verified = intent.status === "succeeded";
    }

    if (!verified) {
      return res
        .status(400)
        .json({ success: false, message: "Payment not confirmed" });
    }

    await Subscription.updateMany(
      { user_id: req.user._id, status: "active" },
      { status: "cancelled" },
    );

    const end_date = new Date();
    end_date.setDate(end_date.getDate() + plan.duration);

    const subscription = await Subscription.create({
      user_id: req.user._id,
      plan_id: plan._id,
      start_date: new Date(),
      end_date,
      status: "active",
      stripePaymentIntentId: paymentIntentId || null,
      amount_paid: plan.price,
    });

    res.json({
      success: true,
      message: "Payment confirmed and subscription activated",
      data: subscription,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
