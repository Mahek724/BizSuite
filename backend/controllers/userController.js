import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Lead from "../models/Lead.js";
import Task from "../models/Task.js";
import Client from "../models/Client.js";
import { sendNotification } from "../utils/sendNotification.js";

/* ============================
   📌 USER CONTROLLER
============================ */

// Get all users (Admin only) with dynamic workSummary and pagination
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    // .lean() to get plain objects that we can modify
    const users = await User.find().select("-passwordHash").skip(skip).limit(limit).lean();

    const usersWithSummary = await Promise.all(
      users.map(async (user) => {
        const [leadCount, taskCount, clientCount] = await Promise.all([
          Lead.countDocuments({ assignedTo: user.fullName }),
          Task.countDocuments({ assignedTo: user.fullName }),
          Client.countDocuments({ assignedTo: user._id }),
        ]);

        // normalize company field so frontends have a consistent `company` property
        const company = user.companyName ?? user.company ?? "";

        return {
          ...user,
          company, // explicit company prop (uses companyName if that's what is stored)
          workSummary: {
            leads: leadCount,
            tasks: taskCount,
            clients: clientCount,
          },
        };
      })
    );

    res.status(200).json({ users: usersWithSummary, total });
  } catch (err) {
    console.error("Error fetching users with summary:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Add new user (Admin)
export const addUser = async (req, res) => {
  try {
    const { fullName, email, password, role, company } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      passwordHash: hashed,
      role: role || "Staff",
      companyName: company || "",
    });

    const admins = await User.find({ role: "Admin", _id: { $ne: req.user._id } });

    await sendNotification({
      sender: req.user._id,
      receivers: admins.map((a) => a._id),
      type: "UserAddedOrRemoved",
      message: `New staff member "${user.fullName}" was added by ${req.user.fullName}`,
      relatedId: user._id,
      onModel: "User",
    });

    res.status(201).json({ message: "User added successfully", user });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ message: "Failed to add user", error: err.message });
  }
};

// Update user (Admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, status, company } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { fullName, email, role, status, companyName: company },
      { new: true }
    ).select("-passwordHash");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user: updated });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
};

// Delete user (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();

    const admins = await User.find({ role: "Admin", _id: { $ne: req.user._id } });

    await sendNotification({
      sender: req.user._id,
      receivers: admins.map((a) => a._id),
      type: "UserAddedOrRemoved",
      message: `${req.user.fullName} removed user "${user.fullName}"`,
      relatedId: user._id,
      onModel: "User",
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};
