import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "ClientAssigned",
        "LeadAssigned",
        "LeadStageChanged",
        "TaskAssigned",
        "TaskStatusChanged",
        "NoteCreated",
        "ActivityCreated",
        "ActivityInteraction",
        "UserAddedOrRemoved",
      ],
      required: true,
    },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: "onModel" },
    onModel: { type: String }, // can be 'Lead', 'Task', 'Activity', etc.
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    link: { type: String, default: "" },

  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
