import express from "express";
import Note from "../models/Note.js";
import { authenticate } from "../middleware/auth.js"; // ✅ make sure this exists

const router = express.Router();

// ✅ Get all notes (Admin → all, Staff → only their own)
router.get("/", authenticate, async (req, res) => {
  try {
    let notes;

    if (req.user.role === "Admin") {
      // Admin can view all notes
      notes = await Note.find().populate("createdBy", "name email role");
    } else {
      // Staff can only view their own notes
      notes = await Note.find({ createdBy: req.user._id });
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
      createdBy: req.user._id, // ✅ link note to current user
    });

    res.status(201).json(note);
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
router.patch("/:id/pin", authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (req.user.role !== "Admin" && note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    note.isPinned = !note.isPinned;
    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
