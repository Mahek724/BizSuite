import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../server.js";
import User from "../../models/User.js";
import Lead from "../../models/Lead.js";
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

test("Admin assigns lead → Staff receives notification", async () => {
  const res = await request(app)
    .post("/api/leads")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Test Lead",
      email: "lead@test.com",
      assignedTo: staff._id,
      stage: "New",
      source: "Website",
    });

  expect(res.status).toBe(201);

  const notifs = await Notification.find({ receiver: staff._id, type: "LeadAssigned" });
  expect(notifs.length).toBeGreaterThan(0);
  expect(notifs[0].message).toContain("assigned you a new lead");
});

test("Staff changes lead stage → Admin receives notification", async () => {
  const lead = await Lead.findOne({ name: "Test Lead" });
  const res = await request(app)
    .put(`/api/leads/${lead._id}`)
    .set("Authorization", `Bearer ${staffToken}`)
    .send({ stage: "Won" });

  expect(res.status).toBe(200);

  const notifs = await Notification.find({ type: "LeadStageChanged" });
  expect(notifs.length).toBeGreaterThan(0);
  expect(notifs[0].message).toContain("changed lead stage");
});
