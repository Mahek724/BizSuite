import express from "express";
import Note from "../models/Note.js";
import { authenticate } from "../middleware/auth.js"; // ✅ make sure this exists
import { sendNotification } from "../utils/sendNotification.js";
import User from "../models/User.js"; // if not already imported


const router = express.Router();

// ✅ Get all notes (Admin → all, Staff → only their own)
router.get("/", authenticate, async (req, res) => {
  try {
    let notes;

    if (req.user.role === "Admin") {
      // Admin can view all notes
      notes = await Note.find().populate("createdBy", "fullName email role");
    } else {
      // Staff can only view their own notes
      notes = await Note.find({ createdBy: req.user._id })
                        .populate("createdBy", "fullName email role"); // ✅ add this
    }

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Create a new note (attaches logged-in user)
router.post("/", authenticate, async (req, res) => {
  const { title, content, category, color, isPinned } = req.body;

  try {
    const note = await Note.create({
      title,
      content,
      category,
      color,
      isPinned,
      createdBy: req.user._id, // ✅ correct link
    });

    // ✅ populate user details before sending response
    const populatedNote = await note.populate("createdBy", "fullName role email");
    if (req.user.role === "Staff") {
  const admins = await User.find({ role: "Admin" });
  await sendNotification({
    sender: req.user._id,
    receivers: admins.map(a => a._id),
    type: "NoteCreated",
    message: `${req.user.fullName} added a new note: "${note.title}"`,
    relatedId: note._id,
    onModel: "Note",
  });
}


    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// ✅ Update a note (Admin or owner only)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Staff can only edit their own notes
    if (req.user.role !== "Admin" && note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete a note (Admin or owner only)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Staff can only delete their own notes
    if (req.user.role !== "Admin" && note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await note.deleteOne();
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Toggle pin (Admin or owner only)
// ✅ Toggle pin (Admin or owner only)
router.patch("/:id/pin", authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Only Admin or owner can toggle pin
    if (
      req.user.role !== "Admin" &&
      note.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userId = req.user._id;
    const isPinnedByUser = note.pinnedBy.some((id) =>
      id.equals(userId)
    );

    if (isPinnedByUser) {
      // If already pinned by this user, unpin it
      note.pinnedBy = note.pinnedBy.filter((id) => !id.equals(userId));
    } else {
      // Otherwise, pin it for this user
      note.pinnedBy.push(userId);
    }

    await note.save();

    // ✅ Populate user info for frontend
    const populatedNote = await Note.findById(note._id).populate(
      "createdBy",
      "fullName email role"
    );

    res.status(200).json({
      ...populatedNote.toObject(),
      isPinnedByUser: !isPinnedByUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
