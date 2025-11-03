import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // get api via hook
import "../assets/css/forgotPassword.css";

export default function ResetPassword() {
  const { api } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword: password });
      alert("Password updated successfully! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="forgot-wrap">
      <h2>Reset Password</h2>
      <p>Set a new password for your account.</p>
      <form onSubmit={onSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
      <div className="back-link">
        <a href="/login">Back to login</a>
      </div>
    </div>
  );
}
