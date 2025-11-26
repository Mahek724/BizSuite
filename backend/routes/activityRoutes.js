import express from "express";
import {
  getStatsSummary,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  addComment,
  togglePin,
  toggleLike,
} from "../controllers/activityController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Activity routes
router.get("/stats/summary", authenticate, getStatsSummary);
router.get("/", authenticate, getActivities);
router.post("/", authenticate, createActivity);
router.put("/:id", authenticate, updateActivity);
router.delete("/:id", authenticate, deleteActivity);
router.post("/:id/comments", authenticate, addComment);
router.patch("/:id/pin", authenticate, togglePin);
router.patch("/:id/like", authenticate, toggleLike);

export default router;
