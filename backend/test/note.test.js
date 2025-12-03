import { jest } from "@jest/globals";
import request from "supertest";

let currentUser = { _id: "u1", role: "Admin", fullName: "Admin", email: "admin@test.com" };

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

jest.mock("../models/Note.js");
jest.mock("../models/User.js");
jest.mock("../utils/sendNotification.js", () => ({
  sendNotification: jest.fn().mockResolvedValue(undefined),
}));

import app from "../server.js";

import Note from "../models/Note.js";
import User from "../models/User.js";
import * as sendNotificationModule from "../utils/sendNotification.js";

beforeEach(() => {
  jest.clearAllMocks();

  Note.countDocuments = jest.fn().mockResolvedValue(0);

  const chainable = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  };
  Note.find = jest.fn().mockReturnValue(chainable);

  Note.create = jest.fn().mockResolvedValue({
    _id: "note_new",
    title: "New Note",
    content: "Content",
    createdBy: currentUser._id,
    pinnedBy: [],
    populate: jest.fn().mockResolvedValue({
      _id: "note_new",
      title: "New Note",
      content: "Content",
      createdBy: { _id: currentUser._id, fullName: currentUser.fullName },
    }),
  });

  Note.findById = jest.fn().mockResolvedValue(null);
  Note.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
  Note.findByIdAndDelete = jest.fn().mockResolvedValue(null);

  User.find = jest.fn().mockResolvedValue([{ _id: "admin1" }]);
});

describe("Notes routes", () => {
  test("GET /api/notes returns notes with pagination", async () => {
    const notes = [
      { _id: "n1", title: "One", createdBy: { _id: "u1", fullName: "A" } },
      { _id: "n2", title: "Two", createdBy: { _id: "u2", fullName: "B" } },
    ];
    const chain = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(notes),
    };
    Note.find = jest.fn().mockReturnValue(chain);
    Note.countDocuments = jest.fn().mockResolvedValue(notes.length);

    const res = await request(app).get("/api/notes").expect(200);

    expect(Array.isArray(res.body.notes)).toBe(true);
    expect(res.body.notes.length).toBe(2);
    expect(res.body.pagination).toHaveProperty("currentPage");
    expect(res.body.pagination).toHaveProperty("totalPages");
    expect(Note.find).toHaveBeenCalled();
  });

  test("POST /api/notes creates note and notifies admins when Staff creates", async () => {
    currentUser = { _id: "staff1", role: "Staff", fullName: "Staffy", email: "s@test" };

    User.find = jest.fn().mockResolvedValue([{ _id: "admin1" }, { _id: "admin2" }]);

    const createdNote = {
      _id: "ncreated",
      title: "Staff Note",
      content: "content",
      createdBy: currentUser._id,
      populate: jest.fn().mockResolvedValue({
        _id: "ncreated",
        title: "Staff Note",
        content: "content",
        createdBy: { _id: currentUser._id, fullName: currentUser.fullName },
      }),
    };
    Note.create = jest.fn().mockResolvedValue(createdNote);

    const payload = { title: "Staff Note", content: "content", category: "Ideas" };
    const res = await request(app).post("/api/notes").send(payload).expect(201);

    expect(res.body).toHaveProperty("_id", "ncreated");
    expect(Note.create).toHaveBeenCalledWith(expect.objectContaining({
      title: "Staff Note",
      content: "content",
      createdBy: currentUser._id,
    }));

    expect(sendNotificationModule.sendNotification).toHaveBeenCalledTimes(1);

    currentUser = { _id: "u1", role: "Admin", fullName: "Admin" };
  });

  test("PUT /api/notes/:id enforces ownership and allows owner/admin", async () => {
    const noteDoc = {
      _id: "nup",
      title: "Old",
      content: "old",
      createdBy: "ownerId",
    };
    Note.findById = jest.fn().mockResolvedValue(noteDoc);

    currentUser = { _id: "someone", role: "Staff" };
    let res = await request(app).put("/api/notes/nup").send({ title: "New" }).expect(403);
    expect(res.body).toHaveProperty("message", "Not authorized");

    currentUser = { _id: "ownerId", role: "Staff" };
    const updated = { _id: "nup", title: "New", content: "new" };
    Note.findById = jest.fn().mockResolvedValue({ ...noteDoc, createdBy: currentUser._id });
    Note.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

    res = await request(app).put("/api/notes/nup").send({ title: "New" }).expect(200);
    expect(res.body).toHaveProperty("title", "New");

    currentUser = { _id: "u1", role: "Admin" };
  });

  test("DELETE /api/notes/:id enforces ownership and deletes", async () => {
    const noteDoc = { _id: "ndel", createdBy: "ownerX" };
    Note.findById = jest.fn().mockResolvedValue(noteDoc);

    currentUser = { _id: "someoneelse", role: "Staff" };
    let res = await request(app).delete("/api/notes/ndel").expect(403);
    expect(res.body).toHaveProperty("message", "Not authorized");

    currentUser = { _id: "ownerX", role: "Staff" };
    Note.findById = jest.fn().mockResolvedValue({ ...noteDoc, createdBy: currentUser._id });
    const noteWithDelete = { ...noteDoc, deleteOne: jest.fn().mockResolvedValue(true) };
    Note.findById = jest.fn().mockResolvedValue(noteWithDelete);

    res = await request(app).delete("/api/notes/ndel").expect(200);
    expect(res.body).toHaveProperty("message", "Note deleted successfully");

    currentUser = { _id: "u1", role: "Admin" };
  });

  test("PATCH /api/notes/:id/pin toggles pin and returns populated note with isPinnedByUser", async () => {
    const rawNote = {
      _id: "npin",
      title: "PinMe",
      createdBy: "owner",
      pinnedBy: [],
      save: jest.fn().mockResolvedValue(true),
    };

    const populated = {
      _id: "npin",
      title: "PinMe",
      createdBy: { _id: "owner", fullName: "Owner" },
      pinnedBy: [],
      toObject: function () { return { _id: this._id, title: this.title, pinnedBy: this.pinnedBy }; },
    };

    Note.findById = jest.fn()
      .mockResolvedValueOnce(rawNote)
      .mockResolvedValueOnce(populated); 

    currentUser = { _id: "uTog", role: "Admin" };

    const res = await request(app).patch("/api/notes/npin/pin").expect(200);
    expect(res.body).toHaveProperty("_id", "npin");
    expect(res.body).toHaveProperty("isPinnedByUser");
    expect(typeof res.body.isPinnedByUser).toBe("boolean");

    const alreadyPinnedRaw = {
      _id: "npin",
      pinnedBy: [{ equals: (id) => id.toString() === currentUser._id.toString(), toString() { return currentUser._id; } }],
      save: jest.fn().mockResolvedValue(true),
    };
    const populated2 = {
      _id: "npin",
      pinnedBy: [],
      toObject: function () { return { _id: this._id, pinnedBy: this.pinnedBy }; },
    };
    Note.findById = jest.fn().mockResolvedValueOnce(alreadyPinnedRaw).mockResolvedValueOnce(populated2);

    const res2 = await request(app).patch("/api/notes/npin/pin").expect(200);
    expect(res2.body).toHaveProperty("isPinnedByUser");
  });

  test("GET /api/notes/pinned and /api/notes/unpinned return lists", async () => {
    // pinned
    const pinned = [{ _id: "p1", title: "P1" }];
    const chainPinned = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(pinned),
    };
    Note.find = jest.fn().mockReturnValue(chainPinned);
    Note.countDocuments = jest.fn().mockResolvedValue(pinned.length);

    let res = await request(app).get("/api/notes/pinned").expect(200);
    expect(res.body).toHaveProperty("notes");
    expect(Array.isArray(res.body.notes)).toBe(true);

    // unpinned
    const unpinned = [{ _id: "u1", title: "U1" }];
    const chainUnpinned = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(unpinned),
    };
    Note.find = jest.fn().mockReturnValue(chainUnpinned);
    Note.countDocuments = jest.fn().mockResolvedValue(unpinned.length);

    res = await request(app).get("/api/notes/unpinned").expect(200);
    expect(res.body).toHaveProperty("notes");
    expect(Array.isArray(res.body.notes)).toBe(true);
  });
});