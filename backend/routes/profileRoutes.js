import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getActivitySummary,
  upload,
} from "../controllers/profileController.js";

const router = express.Router();

// Routes
router.get("/", authenticate, getProfile);
router.put("/update", authenticate, updateProfile);
router.post("/avatar", authenticate, upload.single("avatar"), uploadAvatar);
router.put("/change-password", authenticate, changePassword);
router.get("/activity-summary", authenticate, getActivitySummary);

export default router;
