import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String },
    value: { type: Number, default: 0 },
    stage: {
      type: String,
      enum: ["New", "Contacted", "Deal", "Won", "Lost"],
      default: "New",
    },
    source: {
      type: String,
      enum: ["Website", "Referral", "Social Media", "Cold Call", "Other"],
      default: "Website",
    },
    assignedTo: { type: String, required: true },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
