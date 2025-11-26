import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  clearNotifications,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// Routes
router.get("/", authenticate, getNotifications);
router.put("/:id/read", authenticate, markAsRead);
router.delete("/clear", authenticate, clearNotifications);
router.put("/read-all", authenticate, markAllAsRead);

export default router;
