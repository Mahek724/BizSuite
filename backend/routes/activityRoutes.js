import express from "express";
import Activity from "../models/Activity.js";
import { authenticate } from "../middleware/auth.js"; // ✅ make sure this exists

const router = express.Router();

router.get("/stats/summary", authenticate, async (req, res) => {
  try {
    const filter =
      req.user.role === "Admin" ? {} : { user: req.user._id };

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayLeads = await Activity.countDocuments({
      ...filter,
      type: "Lead",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const closedDeals = await Activity.countDocuments({
      ...filter,
      type: "Deal",
    });

    const tasksCompleted = await Activity.countDocuments({
      ...filter,
      type: "Task",
    });

    const totalActivities = await Activity.countDocuments(filter);

    res.status(200).json({
      todayLeads,
      closedDeals,
      tasksCompleted,
      totalActivities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/* ======================================================
   ✅ GET All Activities (Admin → all, Staff → own only)
====================================================== */
router.get("/", authenticate, async (req, res) => {
  try {
    const filter = req.user.role === "Admin" ? {} : { user: req.user._id };

    const activities = await Activity.find(filter)
      .populate("user", "fullName name color email role")
      .populate("comments.user", "fullName name email role")
      .sort({ createdAt: -1 });

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
      // compute isPinned for the requesting user only
      isPinned: Array.isArray(a.pinnedBy) ? a.pinnedBy.some((id) => id.equals(userId)) : false,
      user: a.user ?? null,
    }));

    return res.status(200).json({ activities: formatted });
  } catch (error) {
    console.error("GET /activities error:", error);
    return res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   ✅ UPDATE Activity (Admin or Owner only)
====================================================== */
router.put("/:id", authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    // Only admin or creator can update
    if (
      req.user.role !== "Admin" &&
      activity.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   ✅ DELETE Activity (Admin or Owner only)
====================================================== */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    if (
      req.user.role !== "Admin" &&
      activity.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await activity.deleteOne();
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/* ======================================================
   💬 ADD Comment to an Activity
====================================================== */
router.post("/:id/comments", authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const activity = await Activity.findById(req.params.id);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    activity.comments.push({
      user: req.user._id,
      text,
    });

    await activity.save();

    const populated = await Activity.findById(activity._id).populate(
      "comments.user",
      "fullName email role"
    );

    res.status(201).json(populated.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   📌 PIN / UNPIN Activity (Admin or Owner only)
====================================================== */
router.patch("/:id/pin", authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const userId = req.user._id;

    // Ensure pinnedBy array exists
    if (!Array.isArray(activity.pinnedBy)) activity.pinnedBy = [];

    const alreadyPinned = activity.pinnedBy.some((id) => id.equals(userId));

    if (alreadyPinned) {
      // unpin for this user
      activity.pinnedBy = activity.pinnedBy.filter((id) => !id.equals(userId));
    } else {
      // pin for this user
      activity.pinnedBy.push(userId);
    }

    await activity.save();

    return res.status(200).json({ success: true, isPinned: !alreadyPinned });
  } catch (error) {
    console.error("PATCH /:id/pin error:", error);
    return res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   👍 LIKE / UNLIKE Activity
====================================================== */
router.patch("/:id/like", authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate(
      "user",
      "fullName name color"
    );

    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    const userId = req.user._id;
    const alreadyLiked = Array.isArray(activity.likes)
      ? activity.likes.some((id) => id.equals(userId))
      : false;

    if (alreadyLiked) {
      // Unlike
      activity.likes = activity.likes.filter((id) => !id.equals(userId));
    } else {
      // Like
      activity.likes.push(userId);
    }

    await activity.save();

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

    return res.status(200).json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error("Like route error:", error);
    return res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   📊 SUMMARY STATS (for Top Dashboard Cards)
====================================================== */

export default router;
