import { jest } from "@jest/globals";

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

jest.mock("../models/Activity.js");
jest.mock("../models/Lead.js");
jest.mock("../models/Task.js");
jest.mock("../models/User.js");
jest.mock("../utils/sendNotification.js", () => ({
  sendNotification: jest.fn().mockResolvedValue(undefined),
}));

import request from "supertest";
import app from "../server.js";

import Activity from "../models/Activity.js";
import Lead from "../models/Lead.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
// import the (mocked) sendNotification module as a namespace so we can assert calls
import * as sendNotificationModule from "../utils/sendNotification.js";

beforeEach(() => {
  jest.clearAllMocks();

  // defaults
  Lead.countDocuments = jest.fn().mockResolvedValue(0);
  Task.countDocuments = jest.fn().mockResolvedValue(0);
  Activity.countDocuments = jest.fn().mockResolvedValue(0);

  // chainable find() mock
  const chainable = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  };
  Activity.find = jest.fn().mockReturnValue(chainable);

  Activity.findById = jest.fn().mockResolvedValue(null);

  if (typeof Activity.mockImplementation === "function") {
    Activity.mockImplementation(function (data) {
      const doc = { ...data, _id: "act_" + Math.random().toString(36).slice(2) };
      doc.save = jest.fn().mockResolvedValue(doc);
      doc.deleteOne = jest.fn().mockResolvedValue(true);
      return doc;
    });
  }

  User.find = jest.fn().mockResolvedValue([]);
  Activity.countDocuments = jest.fn().mockResolvedValue(0);
});

describe("Activity routes", () => {
  test("GET /api/activities returns formatted activities and pagination", async () => {
    const userId = "u1";
    const activityDocs = [
      {
        _id: "a1",
        title: "Test 1",
        description: "Desc 1",
        type: "Lead",
        createdAt: new Date().toISOString(),
        likes: [{ equals: (id) => id === userId }],
        comments: [{ user: { fullName: "C1" }, text: "nice" }],
        pinnedBy: [{ equals: (id) => false }],
        user: { _id: userId, fullName: "Admin", name: "Admin", color: "#fff" },
      },
      {
        _id: "a2",
        title: "Test 2",
        description: "Desc 2",
        type: "Task",
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        pinnedBy: [],
        user: { _id: "u2", fullName: "Other", name: "Other", color: "#000" },
      },
    ];

    const chain = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(activityDocs),
    };
    Activity.find = jest.fn().mockReturnValue(chain);
    Activity.countDocuments = jest.fn().mockResolvedValue(activityDocs.length);

    const res = await request(app).get("/api/activities").expect(200);

    expect(Array.isArray(res.body.activities)).toBe(true);
    expect(res.body.activities.length).toBe(2);
    const first = res.body.activities[0];
    expect(first).toHaveProperty("_id", "a1");
    expect(first).toHaveProperty("likesCount", 1);
    expect(first).toHaveProperty("isLikedByUser", true);
    expect(res.body.pagination).toHaveProperty("totalItems", 2);
  });

  test("GET /api/activities/stats/summary returns counts", async () => {
    Lead.countDocuments = jest.fn((query) => {
      if (query && query.stage) return Promise.resolve(2); // closedDeals
      if (query && query.createdAt) return Promise.resolve(5); // todayLeads
      return Promise.resolve(0);
    });

    Task.countDocuments = jest.fn().mockResolvedValue(7);
    Activity.countDocuments = jest.fn().mockResolvedValue(12);

    const res = await request(app).get("/api/activities/stats/summary").expect(200);
    expect(res.body).toHaveProperty("todayLeads");
    expect(typeof res.body.todayLeads).toBe("number");
    expect(res.body).toHaveProperty("closedDeals");
    expect(res.body).toHaveProperty("tasksCompleted");
    expect(res.body).toHaveProperty("totalActivities");
  });

  test("POST /api/activities creates activity and notifies admins when Staff creates", async () => {
    currentUser = { _id: "u_staff", role: "Staff", email: "staff@test", fullName: "Staffy" };

    User.find = jest.fn().mockResolvedValue([{ _id: "admin1" }, { _id: "admin2" }]);

    const payload = { type: "Lead", title: "New", description: "New desc" };

    const res = await request(app).post("/api/activities").send(payload).expect(201);

    expect(res.body).toHaveProperty("message", "Activity created successfully");
    expect(res.body.activity).toHaveProperty("title", "New");

    expect(sendNotificationModule.sendNotification).toHaveBeenCalledTimes(1);

    currentUser = { _id: "u1", role: "Admin", email: "admin@test.com", fullName: "Admin" };
  });

  test("PATCH /api/activities/:id/like toggles like and returns updated activity", async () => {
    const activityDoc = {
      _id: "act_like",
      title: "LikeMe",
      description: "desc",
      type: "Lead",
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      pinnedBy: [],
      user: { _id: "other", fullName: "Other" },
      save: jest.fn().mockResolvedValue(true),
    };
    Activity.findById = jest.fn().mockResolvedValue(activityDoc);

    const res = await request(app).patch("/api/activities/act_like/like").expect(200);

    expect(res.body).toHaveProperty("success", true);
    expect(res.body.activity).toHaveProperty("likesCount");
    expect(typeof res.body.activity.likesCount).toBe("number");
  });

  test("PATCH /api/activities/:id/pin toggles pin state", async () => {
    const activityDoc = {
      _id: "act_pin",
      pinnedBy: [],
      save: jest.fn().mockResolvedValue(true),
    };
    Activity.findById = jest.fn().mockResolvedValue(activityDoc);

    const res = await request(app).patch("/api/activities/act_pin/pin").expect(200);
    expect(res.body).toHaveProperty("success", true);
    expect(typeof res.body.isPinned).toBe("boolean");
  });

  test("POST /api/activities/:id/comments adds a comment and returns populated comments", async () => {
    const activityDoc = {
      _id: "act_comm",
      title: "HasComments",
      comments: [],
      user: "otherUserId",
      save: jest.fn().mockResolvedValue(true),
    };

    const populatedDoc = {
      comments: [{ user: { fullName: "Staffy", email: "s@test" }, text: "Hello" }],
    };

    const findByIdMock = jest.fn()
      .mockResolvedValueOnce(activityDoc) // initial findById in addComment
      .mockResolvedValueOnce(populatedDoc); // findById(...).populate(...) final
    Activity.findById = findByIdMock;

    const res = await request(app)
      .post("/api/activities/act_comm/comments")
      .send({ text: "Hello" })
      .expect(201);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("text", "Hello");
  });
});