import Lead from "../models/Lead.js";
import Client from "../models/Client.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";


const pctChange = (current, prev) =>
  prev === 0 ? 100 : (((current - prev) / prev) * 100).toFixed(1);

// Summary cards
export const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const userIdStr = String(userId);

    const leadFilter = req.user.role === "Admin" ? {} : { assignedTo: userIdStr };
    const taskFilter = req.user.role === "Admin" ? {} : { assignedTo: userIdStr };
    const clientFilter =
      req.user.role === "Admin"
        ? {}
        : { assignedTo: { $in: [userId, userIdStr] } };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalLeads = await Lead.countDocuments(leadFilter);
    const activeClients = await Client.countDocuments(clientFilter);
    const pendingTasks = await Task.countDocuments({
      ...taskFilter,
      status: { $in: ["pending", "in-progress"] },
    });
    const wonLeads = await Lead.countDocuments({ ...leadFilter, stage: "Won" });

    const conversionRate = totalLeads
      ? ((wonLeads / totalLeads) * 100).toFixed(1)
      : 0;

    const lastMonthLeads = await Lead.countDocuments({
      ...leadFilter,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const lastMonthClients = await Client.countDocuments({
      ...clientFilter,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const lastMonthTasks = await Task.countDocuments({
      ...taskFilter,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    res.json({
      totalLeads,
      activeClients,
      pendingTasks,
      conversionRate: `${conversionRate}%`,
      changes: {
        leadsChange: pctChange(totalLeads, lastMonthLeads),
        clientsChange: pctChange(activeClients, lastMonthClients),
        tasksChange: pctChange(pendingTasks, lastMonthTasks),
      },
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ message: "Error fetching summary", error: err.message });
  }
};

// GET Leads by Stage (Pie chart)
export const getLeadsByStage = async (req, res) => {
  try {
    const filter = req.user.role === "Admin" ? {} : { createdBy: req.user._id };
    const stages = await Lead.distinct("stage", filter);
    const stageList = stages.length ? stages : ["New", "Contacted", "Deal", "Won", "Lost"];

    const counts = await Promise.all(
      stageList.map(async (stage) => {
        const value = await Lead.countDocuments({
          ...filter,
          stage: new RegExp(`^${stage}$`, "i"),
        });
        return { name: stage, value };
      })
    );

    res.json(counts);
  } catch (err) {
    console.error("Error in /leads-by-stage:", err);
    res.status(500).json({ message: "Error fetching lead stage data", error: err.message });
  }
};

// GET Leads by Source (Bar chart)
export const getLeadsBySource = async (req, res) => {
  try {
    const filter = req.user.role === "Admin" ? {} : { createdBy: req.user._id };
    const distinctSources = await Lead.distinct("source", filter);
    const sources = distinctSources.length
      ? distinctSources
      : ["Website", "Social Media", "Cold Call", "Referral", "Other"];

    const data = await Promise.all(
      sources.map(async (src) => ({
        name: src,
        value: await Lead.countDocuments({
          ...filter,
          source: new RegExp(`^${src}$`, "i"),
        }),
      }))
    );

    res.json(data);
  } catch (err) {
    console.error("Error in /leads-by-source:", err);
    res.status(500).json({ message: "Error fetching lead sources", error: err.message });
  }
};

// GET Sales Trend (Line chart)
export const getSalesTrend = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const filter = req.user.role === "Admin" ? {} : { createdBy: req.user._id };
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun","July","Aug","Sept","Oct","Nov","Dec"
    ];

    const data = await Promise.all(
      months.map(async (_m, i) => {
        const start = new Date(year, i, 1);
        const end = new Date(year, i + 1, 1);
        const value = await Lead.countDocuments({
          ...filter,
          stage: { $regex: /^won$/i },
          createdAt: { $gte: start, $lt: end },
        });
        return { name: months[i], value };
      })
    );

    res.json(data);
  } catch (err) {
    console.error("Sales trend error:", err);
    res.status(500).json({ message: "Error fetching sales trend", error: err.message });
  }
};

// GET Recent Activity timeline
export const getRecentActivity = async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query; // default 6 items per page
    const skip = (page - 1) * limit;

    const filter = req.user.role === "Admin" ? {} : { user: req.user._id };

    const total = await Activity.countDocuments(filter);

    const activities = await Activity.find(filter)
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const recent = activities.map((a) => ({
      name: a.user?.fullName || "Unknown",
      action: a.type || "performed activity",
      target: a.title || "",
      time: a.createdAt,
    }));

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      recent,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching activity", error: err.message });
  }
};

