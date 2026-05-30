import express from "express";
import Plan from "../models/Plan.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
