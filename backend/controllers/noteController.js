import Note from "../models/Note.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/sendNotification.js";

/* ============================
   📌 NOTE CONTROLLER
============================ */

// ✅ Get all notes (Admin → all, Staff → only their own)
export const getNotes = async (req, res) => {
  try {
    let notes;

    if (req.user.role === "Admin") {
      notes = await Note.find().populate("createdBy", "fullName email role");
    } else {
      notes = await Note.find({ createdBy: req.user._id })
        .populate("createdBy", "fullName email role");
    }

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create a new note
export const createNote = async (req, res) => {
  const { title, content, category, color, isPinned } = req.body;

  try {
    const note = await Note.create({
      title,
      content,
      category,
      color,
      isPinned,
      createdBy: req.user._id,
    });

    const populatedNote = await note.populate("createdBy", "fullName role email");

    if (req.user.role === "Staff") {
      const admins = await User.find({ role: "Admin" });
      await sendNotification({
        sender: req.user._id,
        receivers: admins.map((a) => a._id),
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
};

// ✅ Update a note (Admin or owner only)
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (req.user.role !== "Admin" && note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete a note (Admin or owner only)
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (req.user.role !== "Admin" && note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await note.deleteOne();
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Toggle pin (Admin or owner only)
export const togglePinNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (req.user.role !== "Admin" && note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userId = req.user._id;
    const isPinnedByUser = note.pinnedBy.some((id) => id.equals(userId));

    if (isPinnedByUser) {
      note.pinnedBy = note.pinnedBy.filter((id) => !id.equals(userId));
    } else {
      note.pinnedBy.push(userId);
    }

    await note.save();

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
};
