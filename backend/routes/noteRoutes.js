import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  getPinnedNotes,
  getUnpinnedNotes,
} from "../controllers/noteController.js";

const router = express.Router();

// Routes
router.get("/", authenticate, getNotes);
router.get("/pinned", authenticate, getPinnedNotes);
router.get("/unpinned", authenticate, getUnpinnedNotes);
router.post("/", authenticate, createNote);
router.put("/:id", authenticate, updateNote);
router.delete("/:id", authenticate, deleteNote);
router.patch("/:id/pin", authenticate, togglePinNote);

export default router;
