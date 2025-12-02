import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      console.warn("authenticate: no Authorization header");
      return res.status(401).json({ message: "No token provided" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.warn("authenticate: malformed Authorization header:", authHeader);
      return res.status(401).json({ message: "Invalid Authorization header format" });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("authenticate: JWT_SECRET not set in environment");
      return res.status(500).json({ message: "Server auth misconfiguration" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyErr) {
      console.warn("authenticate: token verification failed:", verifyErr.name, verifyErr.message);
      if (verifyErr.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!decoded?.id) {
      console.warn("authenticate: token missing id claim:", decoded);
      return res.status(401).json({ message: "Invalid token payload" });
    }

    let user;
    try {
      user = await User.findById(decoded.id).select("-passwordHash");
    } catch (dbErr) {
      console.error("authenticate: DB error when finding user:", dbErr);
      return res.status(500).json({ message: "Server error while validating user" });
    }

    if (!user) {
      console.warn("authenticate: user not found, id:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("authenticate: unexpected error:", err);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};