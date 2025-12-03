import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AuthPage from "../pages/AuthPage.jsx";
import { vi } from "vitest";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

// axios working mock
vi.mock("axios", () => {
  const post = vi.fn();
  const create = vi.fn(() => ({ post }));

  return {
    default: { create, post },
    create,
    post
  };
});

//   MOCK AuthContext
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

// Render helper
const renderUI = () =>
  render(
    <BrowserRouter>
      <AuthPage />
    </BrowserRouter>
  );

// TESTS
describe("AuthPage Tests", () => {
  let mockLoginFn;

  beforeEach(() => {
    mockLoginFn = vi.fn();
    useAuth.mockReturnValue({ login: mockLoginFn });

    axios.create.mockClear?.();
    axios.post.mockReset?.();
  });


  test("loads login form by default", () => {
    renderUI();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  test("switches to signup view", () => {
    renderUI();
    fireEvent.click(screen.getByText("Sign up"));
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  test("successful login calls login()", async () => {
    renderUI();

    axios.post.mockResolvedValueOnce({
      data: { user: { role: "Admin" }, token: "abc" }
    });

    // scope to the login slide to avoid matching signup inputs
    const loginHeading = screen.getByText("Log In");
    const loginSlide = loginHeading.closest(".slide");
    const loginWithin = within(loginSlide);

    fireEvent.change(loginWithin.getByPlaceholderText("Email"), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(loginWithin.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    fireEvent.click(loginWithin.getByRole("button", { name: /Log in/i }));

    await waitFor(() => {
      expect(mockLoginFn).toHaveBeenCalled();
    });
  });

  test("login error shows alert", async () => {
    renderUI();
    window.alert = vi.fn();

    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } }
    });

    // scope to the login slide to avoid matching signup inputs
    const loginHeading = screen.getByText("Log In");
    const loginSlide = loginHeading.closest(".slide");
    const loginWithin = within(loginSlide);

    fireEvent.change(loginWithin.getByPlaceholderText("Email"), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(loginWithin.getByPlaceholderText("Password"), {
      target: { value: "wrongpw" },
    });

    fireEvent.click(loginWithin.getByRole("button", { name: /Log in/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  test("signup success shows alert", async () => {
    renderUI();
    window.alert = vi.fn();

    fireEvent.click(screen.getByText("Sign up"));

    // scope queries to the signup slide to avoid ambiguous duplicate placeholders
    const signupHeading = screen.getByText("Sign Up");
    const signupSlide = signupHeading.closest(".slide");
    const signupWithin = within(signupSlide);

    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    // Target the SIGNUP inputs inside the signup slide
    fireEvent.change(signupWithin.getByPlaceholderText("Full name"), {
      target: { value: "Mahek" },
    });

    fireEvent.change(signupWithin.getByPlaceholderText("Email"), {
      target: { value: "mahek@test.com" },
    });

    fireEvent.change(signupWithin.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    fireEvent.change(signupWithin.getByPlaceholderText("Confirm password"), {
      target: { value: "123456" },
    });

    fireEvent.change(signupWithin.getByPlaceholderText("Company name"), {
      target: { value: "My Company" },
    });

    fireEvent.click(signupWithin.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Signup successful! Please login.");
    });
  });

  test("Remember me checkbox toggles", () => {
    renderUI();
    const checkbox = screen.getByLabelText("Remember me");

    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });
});