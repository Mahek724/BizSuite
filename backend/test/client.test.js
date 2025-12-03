import { jest } from "@jest/globals";
import request from "supertest";

let currentUser = { _id: "u1", role: "Admin", email: "admin@test.com", fullName: "Admin" };

jest.mock("../middleware/auth.js", () => ({
  authenticate: (req, res, next) => {
    req.user = currentUser;
    return next();
  },
  requireAdmin: (req, res, next) => {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    next();
  },
}));

jest.mock("../models/Client.js");
jest.mock("../models/User.js");
jest.mock("../utils/sendNotification.js", () => ({
  sendNotification: jest.fn().mockResolvedValue(undefined),
}));

import app from "../server.js";
import Client from "../models/Client.js";
import User from "../models/User.js";
import * as sendNotificationModule from "../utils/sendNotification.js";

beforeEach(() => {
  jest.clearAllMocks();

  Client.countDocuments = jest.fn().mockResolvedValue(0);

  const chainable = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  };
  Client.find = jest.fn().mockReturnValue(chainable);

  Client.findById = jest.fn().mockResolvedValue(null);
  Client.create = jest.fn().mockImplementation(async (data) => ({ ...data, _id: "newclient" }));
  Client.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
  Client.findByIdAndDelete = jest.fn().mockResolvedValue(null);

  User.findById = jest.fn().mockResolvedValue({ _id: "u2", fullName: "Assigned" });
});

describe("Clients routes", () => {
  test("GET /api/clients returns clients with pagination", async () => {
    const clientsArr = [
      { _id: "c1", name: "Alice", email: "a@test", company: "Acme", tags: ["A"], assignedTo: "u1" },
      { _id: "c2", name: "Bob", email: "b@test", company: "Beta", tags: ["B"], assignedTo: "u2" },
    ];

    const chain = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(clientsArr),
    };
    Client.find = jest.fn().mockReturnValue(chain);
    Client.countDocuments = jest.fn().mockResolvedValue(clientsArr.length);

    const res = await request(app).get("/api/clients").expect(200);

    expect(Array.isArray(res.body.clients)).toBe(true);
    expect(res.body.clients.length).toBe(2);
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("page");
    expect(res.body).toHaveProperty("totalPages");
  });

  test("GET /api/clients/:id returns client when allowed and denies when not assigned", async () => {
    const clientDoc = {
      _id: "c3",
      name: "Charlie",
      assignedTo: { _id: "u2", fullName: "Other" },
      email: "c@test",
    };
    Client.findById = jest.fn().mockResolvedValue(clientDoc);

    currentUser = { _id: "u1", role: "Admin" };
    let res = await request(app).get("/api/clients/c3").expect(200);
    expect(res.body).toHaveProperty("client");
    expect(res.body.client).toHaveProperty("name", "Charlie");

    currentUser = { _id: "u_non", role: "Staff" };
    res = await request(app).get("/api/clients/c3").expect(403);
    expect(res.body).toHaveProperty("message", "Access denied");

    currentUser = { _id: "u1", role: "Admin" };
  });

  test("POST /api/clients creates client and notifies assigned user", async () => {
    currentUser = { _id: "creator", role: "Admin", email: "creator@test" };

    Client.create = jest.fn().mockResolvedValue({
      _id: "created1",
      name: "New Client",
      assignedTo: "u2",
    });

    User.findById = jest.fn().mockResolvedValue({ _id: "u2", fullName: "Assigned" });

    const payload = {
      name: "New Client",
      email: "n@test",
      phone: "123456",
      company: "NewCo",
      assignedTo: "u2",
      tags: ["A"],
    };

    const res = await request(app).post("/api/clients").send(payload).expect(201);

    expect(res.body).toHaveProperty("client");
    expect(res.body.client).toHaveProperty("name", "New Client");
    expect(Client.create).toHaveBeenCalledWith(expect.objectContaining({
      name: "New Client",
      email: "n@test",
      assignedTo: "u2",
    }));

    expect(sendNotificationModule.sendNotification).toHaveBeenCalledTimes(1);
    currentUser = { _id: "u1", role: "Admin", email: "admin@test.com" };
  });

  test("PUT /api/clients/:id updates and returns updated client", async () => {
    const updated = { _id: "cupd", name: "Updated" };
    Client.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

    const res = await request(app).put("/api/clients/cupd").send({ name: "Updated" }).expect(200);
    expect(res.body).toHaveProperty("client");
    expect(res.body.client).toHaveProperty("name", "Updated");
  });

  test("DELETE /api/clients/:id deletes and returns message", async () => {
    Client.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: "cdel" });

    const res = await request(app).delete("/api/clients/cdel").expect(200);
    expect(res.body).toHaveProperty("message", "Deleted");
  });

  test("GET /api/clients/tags/assigned returns tags for admin and staff", async () => {
    const clients = [
      { tags: ["A", "B"] },
      { tags: ["B", "C"] },
    ];
    Client.find = jest.fn().mockResolvedValue(clients);
    currentUser = { _id: "admin1", role: "Admin" };

    let res = await request(app).get("/api/clients/tags/assigned").expect(200);
    expect(res.body).toHaveProperty("tags");
    expect(Array.isArray(res.body.tags)).toBe(true);
    expect(res.body.tags.sort()).toEqual(["A", "B", "C"].sort());

    Client.find = jest.fn().mockResolvedValue([{ tags: ["X"] }]);
    currentUser = { _id: "staff1", role: "Staff" };

    res = await request(app).get("/api/clients/tags/assigned").expect(200);
    expect(res.body.tags).toEqual(["X"]);

    currentUser = { _id: "u1", role: "Admin" };
  });
});