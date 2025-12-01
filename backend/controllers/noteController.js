import Note from "../models/Note.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/sendNotification.js";
import mongoose from "mongoose";


/* ============================
   📌 NOTE CONTROLLER
============================ */

// ✅ Get all notes with pagination (Admin → all, Staff → only their own)
export const getNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== "Admin") {
      query.createdBy = req.user._id;
    }

    // Get total count for pagination
    const totalNotes = await Note.countDocuments(query);

    // Get paginated notes
    const notes = await Note.find(query)
      .populate("createdBy", "fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalNotes / limit);

    res.status(200).json({
      notes,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
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

// ✅ Get pinned notes with pagination
export const getPinnedNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    let query = { pinnedBy: req.user._id };
    if (req.user.role !== "Admin") {
      query.createdBy = req.user._id;
    }

    // Get total count for pagination
    const totalNotes = await Note.countDocuments(query);

    // Get paginated pinned notes
    const notes = await Note.find(query)
      .populate("createdBy", "fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalNotes / limit);

    res.status(200).json({
      notes,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get unpinned notes with pagination
export const getUnpinnedNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    let query = { pinnedBy: { $ne: req.user._id } };
    if (req.user.role !== "Admin") {
      query.createdBy = req.user._id;
    }

    // Get total count for pagination
    const totalNotes = await Note.countDocuments(query);

    // Get paginated unpinned notes
    const notes = await Note.find(query)
      .populate("createdBy", "fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalNotes / limit);

    res.status(200).json({
      notes,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Toggle pin (Admin or owner only)
export const togglePinNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (
      req.user.role !== "Admin" &&
      note.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Ensure pinnedBy is an array
    if (!Array.isArray(note.pinnedBy)) {
      note.pinnedBy = [];
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 🔥 Convert all IDs inside pinnedBy to ObjectId safely
    note.pinnedBy = note.pinnedBy.map(id => typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);

    const isPinned = note.pinnedBy.some(id => id.equals(userId));

    if (isPinned) {
      note.pinnedBy = note.pinnedBy.filter(id => !id.equals(userId));
    } else {
      note.pinnedBy.push(userId);
    }

    await note.save();

    const populated = await Note.findById(note._id).populate(
      "createdBy",
      "fullName email role"
    );

    res.status(200).json({
      ...populated.toObject(),
      isPinnedByUser: !isPinned,
    });
  } catch (error) {
    console.error("Toggle Pin Error:", error);
    res.status(500).json({ message: error.message });
  }
};



