import express from "express";
import passport from "passport";
import { authenticate } from "../middleware/auth.js";
import {
  signup,
  login,
  me,
  forgotPassword,
  resetPassword,
  getStaffUsers,
} from "../controllers/authController.js";

const router = express.Router();

// Signup & Login
router.post("/signup", signup);
router.post("/login", login);

// Current user
router.get("/me", me);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({
      id: req.user._id,
      role: req.user.role,
      name: req.user.fullName,
    }, process.env.JWT_SECRET);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

// Logout
router.post("/logout", (_req, res) => res.json({ message: "Logged out (client should remove token)" }));

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Get staff users
router.get("/staff", authenticate, getStaffUsers);

export default router;
