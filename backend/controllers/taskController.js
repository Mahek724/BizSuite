import Task from "../models/Task.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/sendNotification.js";

/* ============================
   📌 TASK CONTROLLER
============================ */

// Get all tasks with pagination
export const getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    let query = {};
    const userRole = req.user?.role?.toLowerCase();

    // Filter tasks based on user role
    if (userRole === "staff") {
      query.assignedTo = req.user.fullName;
    }

    // Get total count for pagination based on filtered query
    const totalTasks = await Task.countDocuments(query);

    // Get paginated tasks
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalTasks / limit);

    res.status(200).json({
      tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
};

// Get a single task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task", error });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const newTask = await Task.create(req.body);

    // notify assigned staff if present
    if (req.body.assignedTo) {
      try {
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
      } catch (notifyErr) {
        console.error("Error sending assignment notification:", notifyErr);
      }
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("POST /tasks error:", error);
    res.status(400).json({ message: "Error creating task", error: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    // If a staff (not admin) changes status, notify all admins
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

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(400).json({ message: "Error updating task", error });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
};
