import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../server.js";
import User from "../../models/User.js";
import Task from "../../models/Task.js";
import Notification from "../../models/Notification.js";
import jwt from "jsonwebtoken";

let mongoServer;
let admin, staff, adminToken, staffToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  admin = await User.create({
    fullName: "Admin",
    email: "admin@test.com",
    passwordHash: "hash",
    role: "Admin",
  });

  staff = await User.create({
    fullName: "Staff",
    email: "staff@test.com",
    passwordHash: "hash",
    role: "Staff",
  });

  const secret = process.env.JWT_SECRET || "secret";
  adminToken = jwt.sign({ id: admin._id, role: "Admin" }, secret);
  staffToken = jwt.sign({ id: staff._id, role: "Staff" }, secret);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("Admin assigns task → Staff receives notification", async () => {
  const res = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      title: "Test Task",
      description: "Complete CRM module",
      assignedTo: staff._id,
      priority: "High",
      dueDate: new Date(),
    });

  expect(res.status).toBe(201);

  const notifs = await Notification.find({ receiver: staff._id, type: "TaskAssigned" });
  expect(notifs.length).toBeGreaterThan(0);
  expect(notifs[0].message).toContain("assigned you a new task");
});

test("Staff updates task status → Admin receives notification", async () => {
  const task = await Task.findOne({ title: "Test Task" });
  const res = await request(app)
    .put(`/api/tasks/${task._id}`)
    .set("Authorization", `Bearer ${staffToken}`)
    .send({ status: "In Progress" });

  expect(res.status).toBe(200);

  const notifs = await Notification.find({ type: "TaskStatusChanged" });
  expect(notifs.length).toBeGreaterThan(0);
  expect(notifs[0].message).toContain("updated task status");
});
