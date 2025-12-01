import Client from "../models/Client.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/sendNotification.js";

// Get all clients with pagination and filtering
export const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 8, search = "", tag = "All Tags" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    let filterQuery = {};
    if (req.user.role !== "Admin") {
      filterQuery.assignedTo = req.user._id;
    }

    // Add search filter
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } }
      ];
    }

    // Add tag filter
    if (tag && tag !== "All Tags") {
      filterQuery.tags = { $in: [tag] };
    }

    // Get total count for pagination
    const total = await Client.countDocuments(filterQuery);

    // Get paginated clients
    const clients = await Client.find(filterQuery)
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      clients,
      total,
      page: pageNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

// Get single client by ID
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate(
      "assignedTo",
      "fullName email"
    );
    if (!client) return res.status(404).json({ message: "Client not found" });

    if (req.user.role !== "Admin" && String(client.assignedTo._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ client });
  } catch (err) {
    res.status(500).json({ message: "Error fetching client" });
  }
};

// Create a new client
export const createClient = async (req, res) => {
  try {
    const { name, email, phone, company, tags, assignedTo } = req.body;
    if (!name || !email || !phone || !company || !assignedTo)
      return res.status(400).json({ message: "Missing fields" });

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) return res.status(400).json({ message: "Assigned user not found" });

    const client = await Client.create({
      name,
      email,
      phone,
      company,
      tags: tags || [],
      assignedTo,
      createdBy: req.user._id,
    });

    // Notify assigned user
    await sendNotification({
      sender: req.user._id,
      receiver: assignedTo,
      type: "ClientAssigned",
      message: `A new client "${client.name}" has been assigned to you.`,
      relatedId: client._id,
      onModel: "Client",
    });

    res.status(201).json({ client });
  } catch (err) {
    res.status(500).json({ message: "Error creating client" });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json({ client });
  } catch (err) {
    res.status(500).json({ message: "Error updating client" });
  }
};

// Delete client
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting client" });
  }
};

// Get tags used by assigned clients
export const getAssignedTags = async (req, res) => {
  try {
    let clients;
    if (req.user.role === "Admin") {
      clients = await Client.find();
    } else {
      clients = await Client.find({ assignedTo: req.user._id });
    }
    const tags = [...new Set(clients.flatMap(c => c.tags))];
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ message: "Error fetching tags" });
  }
};
