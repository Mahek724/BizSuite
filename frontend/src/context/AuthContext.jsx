import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api",
});

// attach token automatically if present
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("bizsuite_token") ||
    sessionStorage.getItem("bizsuite_token");
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
  const token =
    localStorage.getItem("bizsuite_token") ||
    sessionStorage.getItem("bizsuite_token");
  if (!token) {
    setLoading(false);
    return;
  }

  api
    .get("/auth/me")
    .then((r) =>
      setUser({
        ...r.data.user,
        role: r.data.user.role?.toLowerCase(),
      })
    )
    .catch(() => {
      localStorage.removeItem("bizsuite_token");
      sessionStorage.removeItem("bizsuite_token");
      setUser(null);
    })
    .finally(() => setLoading(false));
}, []);


 const login = (userData, token, remember) => {
  const normalizedUser = {
    ...userData,
    role: userData.role?.toLowerCase(),
  };

  if (remember) {
    localStorage.setItem("bizsuite_token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  } else {
    sessionStorage.setItem("bizsuite_token", token);
    sessionStorage.setItem("user", JSON.stringify(normalizedUser));
  }
  setUser(normalizedUser);
};



const logout = () => {
  localStorage.removeItem("bizsuite_token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("bizsuite_token");
  sessionStorage.removeItem("user");
  setUser(null);

  if (window.google && window.google.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
};


  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, api }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

export default AuthProvider;
