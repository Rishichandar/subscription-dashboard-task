import mongoose from "mongoose";
import dotenv from "dotenv";
import Plan from "./models/Plan.js";
import User from "./models/User.js";

dotenv.config();

const plans = [
  {
    name: "Starter",
    price: 0,
    features: [
      "1 Project",
      "5GB Storage",
      "Basic Analytics",
      "Email Support",
      "API Access",
    ],
    duration: 30,
    popular: false,
    color: "#64748b",
  },
  {
    name: "Pro",
    price: 29,
    features: [
      "10 Projects",
      "50GB Storage",
      "Advanced Analytics",
      "Priority Email Support",
      "API Access",
      "Custom Domains",
      "Team Collaboration",
    ],
    duration: 30,
    popular: true,
    color: "#6366f1",
  },
  {
    name: "Business",
    price: 79,
    features: [
      "Unlimited Projects",
      "500GB Storage",
      "Full Analytics Suite",
      "24/7 Phone Support",
      "API Access",
      "Custom Domains",
      "Team Collaboration",
      "SSO Integration",
      "SLA Guarantee",
    ],
    duration: 30,
    popular: false,
    color: "#0ea5e9",
  },
  {
    name: "Enterprise",
    price: 199,
    features: [
      "Unlimited Everything",
      "5TB Storage",
      "Custom Analytics",
      "Dedicated Account Manager",
      "Unlimited API Access",
      "Custom Domains",
      "Enterprise SSO",
      "Custom SLA",
      "On-premise Option",
      "White Labeling",
    ],
    duration: 365,
    popular: false,
    color: "#f59e0b",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/subscription_dashboard",
    );
    console.log("Connected to MongoDB");

    await Plan.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data");

    await Plan.insertMany(plans);
    console.log("Plans seeded");

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });
    console.log("Admin user created: admin@example.com / admin123");

    const user = await User.create({
      name: "John Doe",
      email: "user@example.com",
      password: "user1234",
      role: "user",
    });
    console.log("Regular user created: user@example.com / user1234");

    console.log("\n Seeding complete!");
    console.log("Admin: admin@example.com | admin123");
    console.log("User:  user@example.com  | user1234");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err.message);
    process.exit(1);
  }
};

seed();
