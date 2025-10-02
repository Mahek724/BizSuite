import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },           // optional for Google-only users
    role: { type: String, enum: ["Admin", "Staff"], default: "Staff" },
    companyName: { type: String, default: "" },
    googleId: { type: String, default: null },
    avatar: { type: String, default: "" },
    resetToken: { type: String, default: null }

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
