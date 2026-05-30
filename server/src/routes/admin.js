import express from "express";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/subscriptions",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (status) filter.status = status;

      const total = await Subscription.countDocuments(filter);
      const subscriptions = await Subscription.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      res.json({
        success: true,
        data: subscriptions,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

router.get("/stats", authenticate, authorize("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeSubscriptions = await Subscription.countDocuments({
      status: "active",
    });
    const expiredSubscriptions = await Subscription.countDocuments({
      status: "expired",
    });
    const cancelledSubscriptions = await Subscription.countDocuments({
      status: "cancelled",
    });

    const revenueResult = await Subscription.aggregate([
      { $match: { status: { $in: ["active", "expired"] } } },
      { $group: { _id: null, total: { $sum: "$amount_paid" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const recentSubscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        totalRevenue,
        recentSubscriptions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/users", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
