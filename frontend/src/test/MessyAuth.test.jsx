
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import MessyAuth from "./authPage_messy";

vi.mock("axios");

describe("MessyAuth", () => {
  it("logs in successfully", async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: "abc123", user: { email: "test@demo.com" } },
    });

    render(<MessyAuth />);
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "test@demo.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(screen.getByText(/Logged in as test@demo.com/)).toBeInTheDocument()
    );
  });

  it("shows error when login fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("bad creds"));

    render(<MessyAuth />);
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "wrong@demo.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "bad" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(screen.getByText(/login failed/)).toBeInTheDocument()
    );
  });
});


https://github.com/gamekeepers/snake-cli
git remote add upstream https://github.com/gamekeepers/snake-cli.git
