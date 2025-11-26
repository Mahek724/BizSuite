import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/sendNotification.js";

/* ============================
   📌 LEAD CONTROLLER
============================ */

// ➕ Create lead (Admin only)
export const createLead = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const lead = await Lead.create(req.body);

    if (req.body.assignedTo) {
      const staff = await User.findOne({ fullName: req.body.assignedTo });
      if (staff) {
        await sendNotification({
          sender: req.user._id,
          receiver: staff._id,
          type: "LeadAssigned",
          message: `A new lead "${req.body.name}" has been assigned to you.`,
          relatedId: lead._id,
          onModel: "Lead",
        });
      }
    }

    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📋 Get leads — Admin gets all; Staff gets only assigned leads
export const getLeads = async (req, res) => {
  try {
    const { stage, source, assignedTo } = req.query;
    const filter = {};

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (req.user.role !== "Admin") {
      filter.assignedTo = req.user.fullName || req.user._id;
    } else {
      if (assignedTo && assignedTo !== "All Staff") {
        filter.assignedTo = assignedTo;
      }
    }

    if (stage && stage !== "All Stages") filter.stage = stage;
    if (source && source !== "All Sources") filter.source = source;

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📄 Get single lead by ID — Staff only if assigned to them
export const getLeadById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid id" });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (req.user.role !== "Admin") {
      const assignedVal = String(lead.assignedTo || "");
      const userVal = req.user.fullName || String(req.user._id);
      if (assignedVal !== String(userVal)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update lead (Admin or Staff)
export const updateLead = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Staff restrictions
    if (req.user.role !== "Admin") {
      const assignedVal = String(lead.assignedTo || "");
      const userVal = req.user.fullName || String(req.user._id);
      if (assignedVal !== String(userVal)) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Only allow stage update
      if (!req.body.stage || Object.keys(req.body).some((k) => k !== "stage")) {
        return res.status(403).json({ message: "Staff can only update stage" });
      }

      lead.stage = req.body.stage;
      await lead.save();

      if (["Won", "Lost"].includes(lead.stage)) {
        const admins = await User.find({ role: "Admin" });
        await sendNotification({
          sender: req.user._id,
          receivers: admins.map((a) => a._id),
          type: "LeadStageChanged",
          message: `${req.user.fullName} moved lead "${lead.name}" to ${lead.stage}`,
          relatedId: lead._id,
          onModel: "Lead",
        });
      }

      return res.json(lead);
    }

    // Admin path
    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Delete lead — Admin only
export const deleteLead = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Get distinct sources for a user
export const getLeadSources = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const match = {};
    if (req.user.role !== "Admin") {
      match.assignedTo = req.user.fullName || String(req.user._id);
    }

    const sources = await Lead.aggregate([
      { $match: match },
      { $group: { _id: "$source" } },
      { $sort: { _id: 1 } },
      { $project: { source: "$_id", _id: 0 } },
    ]);

    res.json(sources.map((s) => s.source));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
