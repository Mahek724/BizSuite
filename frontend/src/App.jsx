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

// Converted App to named export
export function App() {
  const { user, loading } = useAuth();

  if (loading) return <h3>Loading...</h3>;

  return (
    <BrowserRouter>
      <Routes>
        {/* If no user → show AuthPage */}
        {!user && <Route path="/*" element={<AuthPage />} />}

        {/* TODO: Add a home or protected route later */}
        {user && <Route path="/*" element={<h2>Welcome!</h2>} />}

        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/activity" element={<Activity />} />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

