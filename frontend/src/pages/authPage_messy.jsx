import { useState } from "react";
import axios from "axios";

export default function MessyAuth() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const r = await axios.post("http://localhost:5000/api/auth/login", {
        email: email,
        password: pass,
      });
      localStorage.setItem("token", r.data.token);
      setMsg("Logged in as " + r.data.user.email);
    } catch (e) {
      setMsg("login failed");
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="password"
        />
        <button>Login</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
