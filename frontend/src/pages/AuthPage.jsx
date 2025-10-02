import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import "../assets/css/auth.css";
import { useNavigate, Link } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api",
});

function AuthPage() {
  const { login } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- GOOGLE LOGIN (Popup Flow) ---
  

  // --- GOOGLE LOGIN (Redirect Flow) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            login(data.user, token, true);
            navigate("/");
          }
        })
        .catch(() => navigate("/login"));
    }
  }, []);

  // signup state
  const [su, setSu] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Staff",
    companyName: "",
  });

  // login state
  const [li, setLi] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const onSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/signup", su);
      alert("Signup successful! Please login.");
      setShowLogin(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/auth/login", li);
      login(r.data.user, r.data.token, li.remember);
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="panel left d-flex flex-column justify-content-center align-items-center text-center">
        <div>
          <h2 className="fw-bold mb-3">
            {showLogin ? "Welcome Back" : "Join BizSuite"}
          </h2>
          <p className="small-note">
            {showLogin
              ? "Access your workspace, manage clients, and grow smarter every day."
              : "Sign up to simplify your business—team, clients & tasks all in one place."}
          </p>
        </div>

        <div className="switcher mt-4">
          {showLogin ? (
            <button className="btn-pill" onClick={() => setShowLogin(false)}>
              Sign up
            </button>
          ) : (
            <button className="btn-pill" onClick={() => setShowLogin(true)}>
              Log in
            </button>
          )}
        </div>
      </div>

      <div className="panel right">
        <div className={`slide-container ${showLogin ? "show-login" : ""}`}>
          {/* SIGNUP */}
          <div className="slide">
            <h2 className="auth-header">Sign Up</h2>
            <form onSubmit={onSignup} className="row g-3">
              <div className="col-12">
                <input
                  required
                  placeholder="Full name"
                  className="form-control"
                  value={su.fullName}
                  onChange={(e) => setSu({ ...su, fullName: e.target.value })}
                />
              </div>
              <div className="col-12">
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="form-control"
                  value={su.email}
                  onChange={(e) => setSu({ ...su, email: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <input
                  required
                  type="password"
                  placeholder="Password"
                  className="form-control"
                  value={su.password}
                  onChange={(e) => setSu({ ...su, password: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <input
                  required
                  type="password"
                  placeholder="Confirm password"
                  className="form-control"
                  value={su.confirmPassword}
                  onChange={(e) =>
                    setSu({ ...su, confirmPassword: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={su.role}
                  onChange={(e) => setSu({ ...su, role: e.target.value })}
                >
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="col-md-6">
                <input
                  placeholder="Company name"
                  className="form-control"
                  value={su.companyName}
                  onChange={(e) =>
                    setSu({ ...su, companyName: e.target.value })
                  }
                />
              </div>
              <div className="col-12 d-grid">
                <button disabled={loading} className="btn btn-primary">
                  Create account
                </button>
              </div>
              <div className="col-12 text-center">
                <span className="small-note">
                  Already have an account?{" "}
                  <a
                    className="link"
                    href="#login"
                    onClick={() => setShowLogin(true)}
                  >
                    Log in
                  </a>
                </span>
              </div>
            </form>
          </div>

          {/* LOGIN */}
          <div className="slide">
            <h2 className="auth-header">Log In</h2>
            <form onSubmit={onLogin} className="row g-3">
              <div className="col-12">
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="form-control"
                  value={li.email}
                  onChange={(e) => setLi({ ...li, email: e.target.value })}
                />
              </div>
              <div className="col-12">
                <input
                  required
                  type="password"
                  placeholder="Password"
                  className="form-control"
                  value={li.password}
                  onChange={(e) => setLi({ ...li, password: e.target.value })}
                />
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="remember"
                    checked={li.remember}
                    onChange={(e) =>
                      setLi({ ...li, remember: e.target.checked })
                    }
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Remember me
                  </label>
                </div>
                <Link className="link" to="/forgotpassword">
                  Forgot password?
                </Link>
              </div>
              <div className="col-12 d-grid">
                <button disabled={loading} className="btn btn-primary">
                  Log in
                </button>
              </div>

              {/* GOOGLE LOGIN OPTIONS */}
              <div className="col-12">
                <div className="text-center my-2 small-note">Or continue with</div>

                {/* Popup flow */}
                <div id="googleDiv" className="d-flex justify-content-center"></div>

                {/* Redirect fallback */}
                <a
  href={`${import.meta.env.VITE_API_BASE}/api/auth/google`}
  className="google-btn d-flex align-items-center justify-content-center gap-2 mt-2"
>
  <img
    src="images/google-icon.svg"
    alt="Google"
    style={{ width: 20, height: 20 }}
  />
  Continue with Google
</a>

              </div>

              <div className="col-12 text-center">
                <span className="small-note">
                  New here?{" "}
                  <a
                    className="link"
                    href="#signup"
                    onClick={() => setShowLogin(false)}
                  >
                    Create an account
                  </a>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
