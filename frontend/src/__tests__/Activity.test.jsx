import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";


vi.mock("axios", () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPatch = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  globalThis.__mockAxios = { mockGet, mockPost, mockPatch, mockPut, mockDelete };

  return {
    default: {
      create: vi.fn(() => ({
        get: mockGet,
        post: mockPost,
        patch: mockPatch,
        put: mockPut,
        delete: mockDelete,
      })),
    },
    __esModule: true,
  };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import Activity from "../pages/Activity.jsx";
import { useAuth } from "../context/AuthContext";
import { SearchProvider } from "../context/SearchContext"; 


//   TESTS
describe("Activity page (frontend)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const { mockGet, mockPost, mockPatch, mockPut, mockDelete } = globalThis.__mockAxios || {};
    useAuth.mockReturnValue({
      user: { _id: "u1", role: "admin", fullName: "Admin", token: "t" },
    });

    mockGet.mockImplementation((url) => {
      if (url.includes("/activities/stats/summary")) {
        return Promise.resolve({
          data: {
            todayLeads: 2,
            closedDeals: 1,
            tasksCompleted: 3,
            totalActivities: 5,
          },
        });
      }
      if (url.includes("pinned=true")) {
        return Promise.resolve({
          data: {
            activities: [
              {
                _id: "p1",
                title: "Pinned A",
                description: "Pinned desc",
                type: "Lead",
                likesCount: 1,
                isLikedByUser: false,
                comments: [],
                isPinned: true,
                user: { fullName: "Admin", color: "#000" },
              },
            ],
            pagination: { currentPage: 1, totalPages: 1 },
          },
        });
      }
      if (url.includes("pinned=false")) {
        return Promise.resolve({
          data: {
            activities: [
              {
                _id: "r1",
                title: "Recent A",
                description: "Recent desc",
                type: "Task",
                likesCount: 0,
                isLikedByUser: false,
                comments: [],
                isPinned: false,
                user: { fullName: "Other", color: "#111" },
              },
            ],
            pagination: { currentPage: 1, totalPages: 1 },
          },
        });
      }

      return Promise.resolve({ data: { activities: [], pagination: {} } });
    });

    mockPost.mockResolvedValue({ data: {} });
    mockPatch.mockResolvedValue({ data: {} });
    mockPut.mockResolvedValue({ data: {} });
    mockDelete.mockResolvedValue({ data: {} });
  });

  test("fetches and displays summary cards on mount", async () => {
    render(
      <SearchProvider>
        <BrowserRouter>
          <Activity />
        </BrowserRouter>
      </SearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Today's Leads")).toBeInTheDocument();
    });

    expect(screen.getByText("2")).toBeInTheDocument();

    const ones = screen.getAllByText("1");
    expect(ones.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    expect(globalThis.__mockAxios.mockGet).toHaveBeenCalledWith(
      "/activities/stats/summary",
      { headers: { Authorization: "Bearer t" } }
    );
  });

  test("renders pinned and recent items", async () => {
    render(
      <SearchProvider>
        <BrowserRouter>
          <Activity />
        </BrowserRouter>
      </SearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Pinned A")).toBeInTheDocument();
    });

    expect(screen.getByText("Recent A")).toBeInTheDocument();
  });
});