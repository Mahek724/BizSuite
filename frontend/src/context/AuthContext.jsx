import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api",
});

// attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bizsuite_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthCtx = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bizsuite_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => {
        // invalid token → remove
        localStorage.removeItem("bizsuite_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

 const login = (userData, token, remember) => {
  if (remember) {
    localStorage.setItem("bizsuite_token", token);
  } else {
    sessionStorage.setItem("bizsuite_token", token);
  }
  setUser(userData);
};

const logout = () => {
  localStorage.removeItem("bizsuite_token");
  sessionStorage.removeItem("bizsuite_token");
  setUser(null);

  // Reset Google auto-login
  if (window.google && window.google.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
};



useEffect(() => {
  const token =
    localStorage.getItem("bizsuite_token") ||
    sessionStorage.getItem("bizsuite_token");
  if (!token) {
    setLoading(false);
    return;
  }

  api
    .get("/auth/me")
    .then((r) => setUser(r.data.user))
    .catch(() => {
      localStorage.removeItem("bizsuite_token");
      sessionStorage.removeItem("bizsuite_token");
      setUser(null);
    })
    .finally(() => setLoading(false));
}, []);


  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, api }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

export default AuthProvider;
