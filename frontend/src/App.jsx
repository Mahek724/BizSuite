import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Leads from "./pages/Leads";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";

export function App() {
  const { user, loading } = useAuth();

  if (loading) return <h3>Loading...</h3>;

  // normalize and compute role flags once
  const isAdmin = !!user && String(user.role || "").toLowerCase() === "admin";

  return (
    <BrowserRouter>
      <Routes>
        {/* No user: AuthPage only */}
        {!user && (
          <>
            <Route path="/*" element={<AuthPage />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {/* User is logged in: protect routes */}
        {user && (
          <>
            {/* Admin only */}
            <Route
              path="/dashboard"
              element={isAdmin ? <Dashboard /> : <Navigate to="/clients" />}
            />
            <Route
              path="/settings"
              element={isAdmin ? <Settings /> : <Navigate to="/clients" />}
            />

            {/* Accessible to both roles */}
            <Route path="/clients" element={<Clients />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/activity" element={<Activity />} />

            {/* Password routes for logged-in users (optional, or restrict) */}
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Fallback: go to home (Admin -> dashboard, Staff -> clients) */}
            <Route
              path="*"
              element={isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/clients" />}
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
export default App;