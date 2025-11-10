import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../server.js";
import User from "../../models/User.js";
import Notification from "../../models/Notification.js";
import jwt from "jsonwebtoken";

let mongoServer;
let admin, token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  admin = await User.create({
    fullName: "Admin",
    email: "admin@test.com",
    passwordHash: "hash",
    role: "Admin",
  });

  const secret = process.env.JWT_SECRET || "secret";
  token = jwt.sign({ id: admin._id, role: "Admin" }, secret);

  await Notification.create({
    sender: admin._id,
    receiver: admin._id,
    type: "NoteCreated",
    message: "Test notification",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("GET /api/notifications returns list", async () => {
  const res = await request(app)
    .get("/api/notifications")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("PUT /api/notifications/:id/read marks read", async () => {
  const notif = await Notification.findOne();
  const res = await request(app)
    .put(`/api/notifications/${notif._id}/read`)
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(res.body.isRead).toBe(true);
});
