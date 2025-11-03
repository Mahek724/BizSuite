import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    category: {
      type: String,
      default: "Personal",
    },
    color: {
      type: String,
      default: "#FFE5E5",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },

    // 👇 New field: track the user who created the note
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Note", noteSchema);
