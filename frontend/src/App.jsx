import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
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

  const isAdmin = !!user && String(user.role || "").toLowerCase() === "admin";

  return (
    <SearchProvider>
      <Routes>
      {!user && (
        <>
          <Route path="/*" element={<AuthPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}

      {user && (
        <>
          <Route
            path="/dashboard"
            element={isAdmin ? <Dashboard /> : <Navigate to="/clients" />}
          />
          <Route
            path="/settings"
            element={isAdmin ? <Settings /> : <Navigate to="/clients" />}
          />
          <Route path="/clients" element={<Clients />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="*"
            element={isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/clients" />}
          />
        </>
      )}
      </Routes>
    </SearchProvider>
  );
}

export default App;
