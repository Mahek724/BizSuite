import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String, required: true },
    tags: [{ type: String }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);