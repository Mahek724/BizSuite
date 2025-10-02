import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // get api via hook
import "../assets/css/forgotPassword.css";

export default function ForgotPassword() {
  const { api } = useAuth(); // get api instance
  const [email, setEmail] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      alert("Password reset link sent to your email");
    } catch (err) {
      alert(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="forgot-wrap">
      <h2>Forgot Password</h2>
      <p>Enter your registered email and we’ll send you a reset link.</p>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      <div className="back-link">
        <a href="/login">Back to login</a>
      </div>
    </div>
  );
}
