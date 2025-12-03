import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

import Clients from "../pages/Clients.jsx"; 
import { useAuth } from "../context/AuthContext";
import { SearchProvider } from "../context/SearchContext";

describe("Clients page (frontend)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { _id: "u1", role: "Admin", fullName: "Admin", token: "t_token" },
    });

    const { mockGet, mockPost, mockPut, mockDelete } = globalThis.__mockAxios || {};

    mockGet.mockImplementation((url) => {
      if (url.includes("/notifications")) {
        return Promise.resolve({ data: [] });
      }

      if (url.includes("/auth/staff")) {
        return Promise.resolve({
          data: {
            staff: [
              { _id: "u1", fullName: "Admin" },
              { _id: "u2", fullName: "Other" }
            ],
          },
        });
      }

      if (url.includes("/clients")) {
        return Promise.resolve({
          data: {
            clients: [
              {
                _id: "c1",
                name: "Client One",
                email: "one@test",
                phone: "111",
                company: "Company1",
                tags: ["VIP"],
                assignedTo: { _id: "u1", fullName: "Admin" },
              },
            ],
            total: 1,
            page: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }

      return Promise.resolve({ data: {} });
    });

    mockPost.mockResolvedValue({ data: {} });
    mockPut.mockResolvedValue({ data: {} });
    mockDelete.mockResolvedValue({ data: {} });
  });

  test("loads and displays clients and summary UI", async () => {
    render(
      <SearchProvider>
        <BrowserRouter>
          <Clients />
        </BrowserRouter>
      </SearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Client One")).toBeInTheDocument();
    });

    expect(screen.getByText("Export CSV")).toBeInTheDocument();
    expect(screen.getByText("Add Client")).toBeInTheDocument();

    expect(globalThis.__mockAxios.mockGet).toHaveBeenCalled();

    expect(screen.getByText("Company1")).toBeInTheDocument();
    expect(screen.getByText("one@test")).toBeInTheDocument();
  });

  test("opens add form and fetches staff list when Add Client clicked", async () => {
    render(
      <SearchProvider>
        <BrowserRouter>
          <Clients />
        </BrowserRouter>
      </SearchProvider>
    );

    await waitFor(() => expect(screen.getByText("Client One")).toBeInTheDocument());

    const addBtn = screen.getByText("Add Client");
    fireEvent.click(addBtn);

    const calls = globalThis.__mockAxios.mockGet.mock.calls.map(args => args[0]);
    const foundStaffCall = calls.find(c => c.includes("/auth/staff"));
    expect(foundStaffCall).toBeTruthy();

    await waitFor(() => expect(screen.getByText("Add New Client")).toBeInTheDocument());
  });

  test("handles export CSV when no clients (graceful, no download attempted)", async () => {
    globalThis.__mockAxios.mockGet.mockImplementation((url) => {
      if (url.includes("/clients")) {
        return Promise.resolve({
          data: { clients: [], total: 0, page: 1, totalPages: 1 },
        });
      }
      if (url.includes("/auth/staff")) {
        return Promise.resolve({ data: { staff: [] } });
      }
      if (url.includes("/notifications")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });

    const createObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;

    const appendChildSpy = vi.spyOn(document.body, "appendChild");

    render(
      <SearchProvider>
        <BrowserRouter>
          <Clients />
        </BrowserRouter>
      </SearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No clients found/i)).toBeInTheDocument();
    });

    const exportBtn = screen.getByText("Export CSV");
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(createObjectURL).not.toHaveBeenCalled();
    });

    expect(appendChildSpy).not.toHaveBeenCalledWith(expect.objectContaining({ download: expect.any(String) }));

    appendChildSpy.mockRestore();
  });
});