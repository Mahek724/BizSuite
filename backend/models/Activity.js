import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "Lead",
        "Deal",
        "Task",
        "Email",
        "Call",
        "Meeting",
        "Document",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },

    // ✅ NEW: status for tracking completion or progress
    status: {
      type: String,
      enum: [
        "Open",
        "In Progress",
        "Won",        // For Leads/Deals
        "Lost",       // For Leads/Deals
        "Completed",  // For Tasks
        "Pending",    // Optional, for Tasks or general
      ],
      default: "Open",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stage: {
      type: String,
      enum: ["New", "Contacted", "Deal", "Won", "Lost"],
      default: "New",
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],

    isPinned: { type: Boolean, default: false },
    pinnedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
