import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Joi from "joi";
import User from "../models/User.js";

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

// ---------- Controller Functions ----------

// Signup
export const signup = async (req, res) => {
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
        companyName: user.companyName,
        avatar: user.avatar
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Invalid data" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password, remember } = await loginSchema.validateAsync(req.body);

    let user = await User.findOne({ email });

    if (!user) {
      const hashed = await bcrypt.hash(password, 10);
      user = await User.create({
        fullName: email.split("@")[0],
        email,
        passwordHash: hashed,
        role: "Staff",
      });
    }

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
        avatar: user.avatar,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Invalid data" });
  }
};

// Get current user
export const me = async (req, res) => {
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
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    user.resetToken = resetToken;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      text: `Click here to reset your password: ${resetUrl}`,
    });

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error while sending email" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
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
};

// Get all staff users
export const getStaffUsers = async (req, res) => {
  try {
    const staffUsers = await User.find({ role: { $regex: /^staff$/i } }, "fullName _id email").lean();
    res.json({ staff: staffUsers });
  } catch (err) {
    console.error("Failed to get staff users:", err);
    res.status(500).json({ message: "Failed to get staff users" });
  }
};
