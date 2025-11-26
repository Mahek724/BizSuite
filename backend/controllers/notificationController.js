import Notification from "../models/Notification.js";

/* ============================
   📌 NOTIFICATION CONTROLLER
============================ */

// ✅ Get all notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .populate("sender", "fullName email role")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

// ✅ Mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

// ✅ Clear all notifications for logged-in user
export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ receiver: req.user._id });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};

// ✅ Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Read-all error:", err);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};
