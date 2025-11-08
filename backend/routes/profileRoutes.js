import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import path from "path";
import User from "../models/User.js";
import Lead from "../models/Lead.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/* ================================
   🧩 PROFILE MANAGEMENT ROUTES
   Works for Admin + Staff
================================ */

// ⚙️ Multer config for avatar upload
const uploadDir = "uploads/avatars";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

/* ---------------------------
   1️⃣ GET - My Profile
---------------------------- */
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-passwordHash -resetToken")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});

/* ---------------------------
   2️⃣ PUT - Update Profile Info
---------------------------- */
router.put("/update", authenticate, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    if (!fullName || !email)
      return res.status(400).json({ message: "Full name and email required" });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, email },
      { new: true }
    ).select("-passwordHash -resetToken");

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});

/* ---------------------------
   3️⃣ POST - Upload Avatar
---------------------------- */
router.post("/avatar", authenticate, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const avatarPath = `/${uploadDir}/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user._id, { avatar: avatarPath });

    res.json({ message: "Avatar updated successfully", avatar: avatarPath });
  } catch (err) {
    res.status(500).json({ message: "Error uploading avatar", error: err.message });
  }
});

/* ---------------------------
   4️⃣ PUT - Change Password
---------------------------- */
router.put("/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect current password" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password", error: err.message });
  }
});

/* ---------------------------
   5️⃣ GET - Activity Summary
---------------------------- */
router.get("/activity-summary", authenticate, async (req, res) => {
  try {
    const leadsHandled = await Lead.countDocuments({ createdBy: req.user._id });
    const tasksCompleted = await Task.countDocuments({
      assignedTo: req.user._id,
      status: /completed/i,
    });
    const notesAdded = await Note.countDocuments({ createdBy: req.user._id });

    res.json({
      leadsHandled,
      tasksCompleted,
      notesAdded,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching activity summary", error: err.message });
  }
});

/* ---------------------------
   6️⃣ PUT - Notification Preferences
---------------------------- */
router.put("/notifications", authenticate, async (req, res) => {
  try {
    const { taskAssignment, leadUpdates, deadlineReminders, emailAlerts } = req.body;

    const prefs = {
      notifications: {
        taskAssignment: !!taskAssignment,
        leadUpdates: !!leadUpdates,
        deadlineReminders: !!deadlineReminders,
        emailAlerts: !!emailAlerts,
      },
    };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, prefs, {
      new: true,
    }).select("-passwordHash -resetToken");

    res.json({
      message: "Notification preferences updated",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications", error: err.message });
  }
});

export default router;
