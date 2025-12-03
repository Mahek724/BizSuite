import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("axios", () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockPatch = vi.fn();
  const mockDelete = vi.fn();

  globalThis.__mockAxios = { mockGet, mockPost, mockPut, mockPatch, mockDelete };

  return {
    default: {
      create: vi.fn(() => ({
        get: mockGet,
        post: mockPost,
        put: mockPut,
        patch: mockPatch,
        delete: mockDelete,
      })),
    },
    __esModule: true,
  };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import Notes from "../pages/Notes.jsx"; 
import { useAuth } from "../context/AuthContext";
import { SearchProvider } from "../context/SearchContext";

describe("Notes page (frontend)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      user: { _id: "u1", role: "admin", fullName: "Admin", token: "token123" },
    });

    const { mockGet, mockPost, mockPatch, mockDelete } = globalThis.__mockAxios || {};

    mockGet.mockImplementation((url, opts) => {
      if (url.includes("/notes/pinned")) {
        return Promise.resolve({
          data: {
            notes: [
              {
                _id: "p1",
                title: "Pinned Note",
                content: "Pinned content",
                color: "#FFE5E5",
                createdBy: { fullName: "Admin", role: "admin" },
                createdAt: new Date().toISOString(),
                pinnedBy: ["u1"],
                category: "Ideas",
              },
            ],
            pagination: { currentPage: 1, totalPages: 1, totalNotes: 1 },
          },
        });
      }
      if (url.includes("/notes/unpinned")) {
        return Promise.resolve({
          data: {
            notes: [
              {
                _id: "u1",
                title: "Unpinned Note",
                content: "Unpinned content",
                color: "#FFF4E5",
                createdBy: { fullName: "Admin", role: "admin" },
                createdAt: new Date().toISOString(),
                pinnedBy: [],
                category: "Personal",
              },
            ],
            pagination: { currentPage: 1, totalPages: 1, totalNotes: 1 },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    mockPost.mockResolvedValue({ data: { _id: "created", title: "Created", content: "c" } });
    mockPatch.mockResolvedValue({ data: {} });
    mockDelete.mockResolvedValue({ data: {} });
  });

  test("loads and displays pinned and unpinned notes on mount", async () => {
    render(
      <SearchProvider>
        <BrowserRouter>
          <Notes />
        </BrowserRouter>
      </SearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Pinned Note")).toBeInTheDocument();
    });

    expect(screen.getByText("Unpinned Note")).toBeInTheDocument();

    const calls = globalThis.__mockAxios.mockGet.mock.calls.map(c => c[0]);
    expect(calls.some(c => c.includes("/notes/pinned"))).toBeTruthy();
    expect(calls.some(c => c.includes("/notes/unpinned"))).toBeTruthy();
  });

  test("opens Add Note modal and posts new note (disambiguated selectors)", async () => {
    render(
      <SearchProvider>
        <BrowserRouter>
          <Notes />
        </BrowserRouter>
      </SearchProvider>
    );

    await waitFor(() => expect(screen.getByText("Pinned Note")).toBeInTheDocument());

    const addNoteButtons = screen.getAllByText(/Add Note/i);
    const headerAddBtn = addNoteButtons.find((btn) => btn.closest("form") === null);
    expect(headerAddBtn).toBeDefined();
    fireEvent.click(headerAddBtn);

    await waitFor(() => expect(screen.getByText("Add New Note")).toBeInTheDocument());

const modalHeader = screen.getByText("Add New Note");

const modalBox = modalHeader.closest(".bg-white") || modalHeader.parentElement.parentElement;

const titleInput = within(modalBox).getByPlaceholderText("Enter note title");
const contentTextarea = within(modalBox).getByPlaceholderText("Enter note content");

fireEvent.change(titleInput, { target: { value: "My Test Note" } });
fireEvent.change(contentTextarea, { target: { value: "Some content" } });

const saveBtn = within(modalBox).getByRole("button", { name: /Add Note/i });
fireEvent.click(saveBtn);


    await waitFor(() => {
      expect(globalThis.__mockAxios.mockPost).toHaveBeenCalled();
      const firstCallUrl = globalThis.__mockAxios.mockPost.mock.calls[0][0];
      expect(firstCallUrl).toEqual("/notes");
    });
  });

  test("toggle pin via note's pin button triggers patch and reloads lists", async () => {
    render(
      <SearchProvider>
        <BrowserRouter>
          <Notes />
        </BrowserRouter>
      </SearchProvider>
    );

    await waitFor(() => expect(screen.getByText("Pinned Note")).toBeInTheDocument());
    expect(screen.getByText("Unpinned Note")).toBeInTheDocument();

    const unpinnedCard = screen.getByText("Unpinned Note").closest("div");
    expect(unpinnedCard).toBeTruthy();

    const { getAllByRole } = within(unpinnedCard);
    const buttons = getAllByRole("button");
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(globalThis.__mockAxios.mockPatch).toHaveBeenCalled();
      const patchUrl = globalThis.__mockAxios.mockPatch.mock.calls[0][0];
      expect(patchUrl).toContain("/notes/");
      expect(patchUrl).toContain("/pin");
    });

    expect(globalThis.__mockAxios.mockGet).toHaveBeenCalled();
  });

  test("export notes shows alert when there are no notes", async () => {
    globalThis.__mockAxios.mockGet.mockImplementation((url) => {
      if (url.includes("/notes/pinned") || url.includes("/notes/unpinned")) {
        return Promise.resolve({ data: { notes: [], pagination: { totalPages: 1 } } });
      }
      return Promise.resolve({ data: {} });
    });

    global.alert = vi.fn();

    render(
      <SearchProvider>
        <BrowserRouter>
          <Notes />
        </BrowserRouter>
      </SearchProvider>
    );

    await waitFor(() => {
      expect(globalThis.__mockAxios.mockGet).toHaveBeenCalled();
    });

    const exportBtn = screen.getByText("Export CSV");
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("No notes available to export.");
    });
  });
});