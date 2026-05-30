import express from "express";
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/subscribe/:planId", authenticate, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan || !plan.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    await Subscription.updateMany(
      { user_id: req.user._id, status: "active" },
      { status: "cancelled" },
    );

    const start_date = new Date();
    const end_date = new Date();
    end_date.setDate(end_date.getDate() + plan.duration);

    const subscription = await Subscription.create({
      user_id: req.user._id,
      plan_id: plan._id,
      start_date,
      end_date,
      status: "active",
      amount_paid: plan.price,
    });

    const populated = await Subscription.findById(subscription._id);

    res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${plan.name}`,
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/my-subscription", authenticate, async (req, res) => {
  try {
    await Subscription.updateMany(
      {
        user_id: req.user._id,
        status: "active",
        end_date: { $lt: new Date() },
      },
      { status: "expired" },
    );

    const subscription = await Subscription.findOne({
      user_id: req.user._id,
      status: "active",
    });

    res.json({
      success: true,
      data: subscription || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/my-subscription/history", authenticate, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user_id: req.user._id,
    }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: subscriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/cancel-subscription", authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { user_id: req.user._id, status: "active" },
      { status: "cancelled" },
      { new: true },
    );

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "No active subscription found" });
    }

    res.json({
      success: true,
      message: "Subscription cancelled",
      data: subscription,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
