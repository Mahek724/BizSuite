import { useNavigate } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, '')}/api`,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthCtx = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Add this

  // ✅ Fetch latest user data
  const fetchUser = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get("/profile");
      if (res.data) {
        setUser({
          ...res.data,
          role: res.data.role?.toLowerCase(),
        });
      }
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData, token, remember) => {
    const normalizedUser = {
      ...userData,
      role: userData.role?.toLowerCase(),
    };

    if (remember) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(normalizedUser));
    }
    setUser(normalizedUser);
  };

  // ✅ Updated logout with redirect
  const logout = (showToast) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  setUser(null);

  if (window.google && window.google.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }

  // small delay before redirect to allow toast animation
  setTimeout(() => {
    navigate("/login", { replace: true });
  }, showToast ? 800 : 0);
};


  const refreshUser = () => fetchUser();

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, refreshUser, api }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export default AuthProvider;
