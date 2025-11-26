import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getActivitySummary,
  updateNotificationPrefs,
  upload,
} from "../controllers/profileController.js";

const router = express.Router();

// Routes
router.get("/", authenticate, getProfile);
router.put("/update", authenticate, updateProfile);
router.post("/avatar", authenticate, upload.single("avatar"), uploadAvatar);
router.put("/change-password", authenticate, changePassword);
router.get("/activity-summary", authenticate, getActivitySummary);
router.put("/notifications", authenticate, updateNotificationPrefs);

export default router;
