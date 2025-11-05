import express from "express";
import bcrypt from "bcryptjs";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import Lead from "../models/Lead.js";
import Task from "../models/Task.js";
import Client from "../models/Client.js";

const router = express.Router();

// ✅ Get all users (Admin only) — now includes dynamic workSummary
router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").lean();

    const usersWithSummary = await Promise.all(
      users.map(async (user) => {
        const [leadCount, taskCount, clientCount] = await Promise.all([
          Lead.countDocuments({ assignedTo: user.fullName }),
          Task.countDocuments({ assignedTo: user.fullName }),
          Client.countDocuments({ assignedTo: user._id })

        ]);

        return {
          ...user,
          workSummary: {
            leads: leadCount,
            tasks: taskCount,
            clients: clientCount,
          },
        };
      })
    );

    res.status(200).json(usersWithSummary);
  } catch (err) {
    console.error("Error fetching users with summary:", err);
    res.status(500).json({
      message: "Error fetching users",
      error: err.message,
    });
  }
});

// ✅ Add new user (Admin)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      passwordHash: hashed,
      role: role || "Staff",
    });

    res.status(201).json({
      message: "User added successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add user",
      error: err.message,
    });
  }
});

// ✅ Update user (Admin)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, status } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { fullName, email, role, status },
      { new: true }
    ).select("-passwordHash");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updated,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating user",
      error: err.message,
    });
  }
});

// ✅ Delete user (Admin)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting user",
      error: err.message,
    });
  }
});

export default router;
