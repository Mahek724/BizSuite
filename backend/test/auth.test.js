import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../server.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth API", () => {
  test("POST /api/auth/signup should create user", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      fullName: "Test User",
      email: "test@example.com",
      password: "123456",
      confirmPassword: "123456",
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
  });

  test("POST /api/auth/login should login existing user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "123456",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
