import express from "express";
import Task from "../models/Task.js";
import { sendNotification } from "../utils/sendNotification.js";
import User from "../models/User.js"; // if not already imported
import { authenticate } from "../middleware/auth.js"; // ✅ make sure this exists



const router = express.Router();

// ✅ Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
});

// ✅ Get a single task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task", error });
  }
});

// ✅ Create a new task
router.post("/", async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    // inside POST route
if (req.body.assignedTo) {
  const staff = await User.findOne({ fullName: req.body.assignedTo });
  if (staff) {
    await sendNotification({
      sender: req.user._id,
      receiver: staff._id,
      type: "TaskAssigned",
      message: `A new task "${newTask.title}" has been assigned to you.`,
      relatedId: newTask._id,
      onModel: "Task",
    });
  }
}
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: "Error creating task", error });
  }
});

// ✅ Update a task
router.put("/:id", authenticate, async (req, res) => {
  try {
    // 1️⃣ Update the task
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2️⃣ If a staff (not admin) changes status, notify all admins
    if (req.body.status && req.user.role !== "Admin") {
      const admins = await User.find({ role: "Admin" });
      await sendNotification({
        sender: req.user._id,
        receivers: admins.map((a) => a._id),
        type: "TaskStatusChanged",
        message: `${req.user.fullName} updated task "${updatedTask.title}" to ${req.body.status}`,
        relatedId: updatedTask._id,
        onModel: "Task",
      });
    }

    // 3️⃣ Respond to client
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(400).json({ message: "Error updating task", error });
  }
});

// ✅ Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask)
      return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
});

export default router;
