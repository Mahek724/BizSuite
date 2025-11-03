import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String, required: true },
    tags: [{ type: String }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // assigned user
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who added client
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);