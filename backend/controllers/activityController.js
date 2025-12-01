import Activity from "../models/Activity.js";
import Lead from "../models/Lead.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/sendNotification.js";

// ─── GET Stats Summary ───
export const getStatsSummary = async (req, res) => {
  try {
    const filter = req.user.role === "Admin" ? {} : { assignedTo: req.user.email };
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayLeads = await Lead.countDocuments({
      ...filter,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const closedDeals = await Lead.countDocuments({
      ...filter,
      stage: { $in: ["Won", "Lost"] },
    });

    const tasksCompleted = await Task.countDocuments({
      ...filter,
      status: { $regex: /^completed$/i },
    });

    const totalActivities = await Activity.countDocuments(
      req.user.role === "Admin" ? {} : { user: req.user._id }
    );

    res.status(200).json({ todayLeads, closedDeals, tasksCompleted, totalActivities });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET All Activities ───
export const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, pinned } = req.query;
    const filter = req.user.role === "Admin" ? {} : { user: req.user._id };

    // Add pinned filter if specified
    if (pinned !== undefined) {
      const isPinned = pinned === 'true';
      filter.pinnedBy = isPinned ? { $in: [req.user._id] } : { $nin: [req.user._id] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await Activity.find(filter)
      .populate("user", "fullName name color email role")
      .populate("comments.user", "fullName name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(filter);

    const userId = req.user._id;
    const formatted = activities.map((a) => ({
      _id: a._id,
      title: a.title,
      description: a.description,
      type: a.type,
      timestamp: a.timestamp ?? a.createdAt,
      likesCount: Array.isArray(a.likes) ? a.likes.length : 0,
      isLikedByUser: Array.isArray(a.likes) ? a.likes.some((id) => id.equals(userId)) : false,
      comments: a.comments ?? [],
      isPinned: Array.isArray(a.pinnedBy) ? a.pinnedBy.some((id) => id.equals(userId)) : false,
      user: a.user ?? null,
    }));

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    };

    res.status(200).json({ activities: formatted, pagination });
  } catch (error) {
    console.error("GET /activities error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── CREATE Activity ───
export const createActivity = async (req, res) => {
  try {
    const { type, title, description, stage, status } = req.body;
    if (!type || !title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newActivity = new Activity({
      type,
      title,
      description,
      stage: stage || "New",
      status: status || "Open",
      user: req.user._id,
    });

    await newActivity.save();

    if (req.user.role === "Staff") {
      const admins = await User.find({ role: "Admin" });
      await sendNotification({
        sender: req.user._id,
        receivers: admins.map((a) => a._id),
        type: "ActivityCreated",
        message: `${req.user.fullName} created a new activity "${newActivity.title}"`,
        relatedId: newActivity._id,
        onModel: "Activity",
      });
    }

    res.status(201).json({ message: "Activity created successfully", activity: newActivity });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE Activity ───
export const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    if (req.user.role !== "Admin" && activity.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updatedActivity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE Activity ───
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    if (req.user.role !== "Admin" && activity.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await activity.deleteOne();
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADD Comment ───
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    activity.comments.push({ user: req.user._id, text });
    await activity.save();

    if (String(activity.user) !== String(req.user._id)) {
      await sendNotification({
        sender: req.user._id,
        receiver: activity.user,
        type: "ActivityInteraction",
        message: `${req.user.fullName} commented on your activity "${activity.title}"`,
        relatedId: activity._id,
        onModel: "Activity",
      });
    }

    const populated = await Activity.findById(activity._id).populate(
      "comments.user",
      "fullName email role"
    );

    res.status(201).json(populated.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PIN / UNPIN ───
export const togglePin = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const userId = req.user._id;
    if (!Array.isArray(activity.pinnedBy)) activity.pinnedBy = [];

    const alreadyPinned = activity.pinnedBy.some((id) => id.equals(userId));
    if (alreadyPinned) activity.pinnedBy = activity.pinnedBy.filter((id) => !id.equals(userId));
    else activity.pinnedBy.push(userId);

    await activity.save();
    res.status(200).json({ success: true, isPinned: !alreadyPinned });
  } catch (error) {
    console.error("PATCH /:id/pin error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── LIKE / UNLIKE ───
export const toggleLike = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate("user", "fullName name color");
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const userId = req.user._id;
    const alreadyLiked = Array.isArray(activity.likes) ? activity.likes.some((id) => id.equals(userId)) : false;

    if (alreadyLiked) activity.likes = activity.likes.filter((id) => !id.equals(userId));
    else activity.likes.push(userId);

    await activity.save();

    if (!alreadyLiked && String(activity.user._id) !== String(req.user._id)) {
      await sendNotification({
        sender: req.user._id,
        receiver: activity.user._id,
        type: "ActivityInteraction",
        message: `${req.user.fullName} liked your activity "${activity.title}"`,
        relatedId: activity._id,
        onModel: "Activity",
      });
    }

    const updatedActivity = {
      _id: activity._id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      timestamp: activity.timestamp ?? activity.createdAt,
      user: activity.user,
      likesCount: Array.isArray(activity.likes) ? activity.likes.length : 0,
      isLikedByUser: !alreadyLiked,
      comments: activity.comments ?? [],
      isPinned: !!activity.isPinned,
    };

    res.status(200).json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error("Like route error:", error);
    res.status(500).json({ message: error.message });
  }
};