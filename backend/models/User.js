import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["Admin", "Staff"], default: "Staff" },
    companyName: { type: String, default: "" },
    googleId: { type: String, default: null },
    avatar: { type: String, default: "" },
    resetToken: { type: String, default: null },

    // ✅ For account status
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // ✅ Activity summary (used in Profile.jsx)
    workSummary: {
      leads: { type: Number, default: 0 },
      tasks: { type: Number, default: 0 },
      clients: { type: Number, default: 0 },
    },

    // ⚡ New additions
    lastLogin: { type: Date, default: null },
    notifications: {
      taskAssignment: { type: Boolean, default: true },
      leadUpdates: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
