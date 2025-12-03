import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import app from "../server.js";
import User from "../models/User.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

jest.mock("../models/User.js");
jest.mock("jsonwebtoken");

describe("=== AUTH MODULE TEST SUITE ===", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    User.findOne = jest.fn();
    User.create = jest.fn();

    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    jwt.verify = jest.fn();
    jwt.sign = jest.fn();
  });

  // AUTH CONTROLLER: SIGNUP
  describe("Signup Controller", () => {
    test("Signup → SUCCESS", async () => {
      User.findOne.mockResolvedValue(null);

      User.create.mockResolvedValue({
        _id: "123",
        fullName: "Mahek",
        email: "mahek@test.com",
        role: "Staff",
      });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Mahek",
          email: "mahek@test.com",
          password: "123456",
          confirmPassword: "123456",
          role: "Staff",
          companyName: "BizSuite",
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("mahek@test.com");
    });

    test("Signup → Email already used", async () => {
      User.findOne.mockResolvedValue({ email: "exists@test.com" });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Test",
          email: "exists@test.com",
          password: "123456",
          confirmPassword: "123456",
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Email already registered");
    });
  });

  // AUTH CONTROLLER: LOGIN
  describe("Login Controller", () => {
    test("Login → SUCCESS", async () => {
      User.findOne.mockResolvedValue({
        _id: "123",
        email: "admin@test.com",
        fullName: "Admin",
        role: "Admin",
        passwordHash: "$2a$10$fakehash",
      });

      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      jwt.sign.mockReturnValue("mock-token");

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@test.com",
          password: "123456",
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("mock-token");
    });

    test("Login → user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "none@test.com",
          password: "123456",
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User does not exist. Please sign up first.");
    });

    test("Login → invalid password", async () => {
      User.findOne.mockResolvedValue({
        passwordHash: "$2a$10$fakehash",
      });

      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@test.com",
          password: "wrong",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  // AUTH CONTROLLER: /me CURRENT USER
  describe("GET /me", () => {
    test("No token → user:null", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.body.user).toBe(null);
    });
  });

  // MIDDLEWARE (authenticate & requireAdmin)
  describe("Auth Middleware Tests", () => {
    test("No Authorization Header → 401", async () => {
      const req = { headers: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await authenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    });

    test("Invalid Token → 401", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("invalid");
      });

      const req = { headers: { authorization: "Bearer abc" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await authenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("User Not Found → 401", async () => {
      // jwt.verify should return decoded payload
      jwt.verify.mockReturnValue({ id: "123" });

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = { headers: { authorization: "Bearer valid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await authenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("requireAdmin blocks Staff", () => {
      const req = { user: { role: "Staff" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Admin access only" });
    });
  });

  // ROUTES TESTS
  describe("Auth Routes Tests", () => {
    test("Route /signup exists", async () => {
      const res = await request(app).post("/api/auth/signup");
      expect(res.status).not.toBe(404);
    });

    test("Route /login exists", async () => {
      const res = await request(app).post("/api/auth/login");
      expect(res.status).not.toBe(404);
    });

    test("GET /me returns user:null without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.body.user).toBe(null);
    });
  });
});
