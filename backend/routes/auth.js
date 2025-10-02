import express from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import Joi from "joi";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

// JWT helper
const signToken = (payload, long = false) => {
  const expiresIn = long ? process.env.JWT_EXPIRES_LONG : process.env.JWT_EXPIRES;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Validators
const signupSchema = Joi.object({
  fullName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.ref("password"),
  role: Joi.string().valid("Admin", "Staff").default("Staff"),
  companyName: Joi.string().allow(""),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  remember: Joi.boolean().default(false),
});

// ---------- Routes ----------

// signup
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, role, companyName } =
      await signupSchema.validateAsync(req.body);

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const finalRole = role === "Admin" ? "Admin" : "Staff";

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role: finalRole,
      companyName,
    });

    const token = signToken({ id: user._id, role: user.role, name: user.fullName });

    res.status(201).json({
      user: {
        id: user._id,
        fullName,
        email,
        role: user.role,
        companyName,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Invalid data" });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password, remember } = await loginSchema.validateAsync(req.body);
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id, role: user.role, name: user.fullName }, remember);

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Invalid data" });
  }
});

// me
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.json({ user: null });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.json({ user: null });
    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
    });
  } catch {
    res.json({ user: null });
  }
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = signToken({
      id: req.user._id,
      role: req.user.role,
      name: req.user.fullName,
    });
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

// logout (frontend just deletes token from storage)
router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out (client should remove token)" });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    user.resetToken = resetToken;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("Sending password reset email to:", email, "URL:", resetUrl);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        to: email,
        subject: "Password Reset",
        text: `Click here to reset your password: ${resetUrl}`,
      });
    } catch (mailErr) {
      console.error("Nodemailer error:", mailErr);
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error while sending email" });
  }
});



// reset password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

export default router;
