import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CheckSquare,
  StickyNote,
  Activity,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading || !user) return null;

  const role = String(user?.role || "").toLowerCase();

  let menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { name: "Clients", icon: <Users size={18} />, path: "/clients" },
    { name: "Leads", icon: <UserPlus size={18} />, path: "/leads" },
    { name: "Tasks", icon: <CheckSquare size={18} />, path: "/tasks" },
    { name: "Notes", icon: <StickyNote size={18} />, path: "/notes" },
    { name: "Activity", icon: <Activity size={18} />, path: "/activity" },
    { name: "Settings", icon: <Settings size={18} />, path: "/settings" },
  ];

  if (role === "staff") {
    menuItems = menuItems.filter(
      (item) => item.name !== "Dashboard" && item.name !== "Settings"
    );
  }

  const handleNavigation = (path) => navigate(path);

  return (
    <aside
      className="sticky top-0 left-0 h-screen w-64 bg-rose-300 text-white flex flex-col p-5 shadow-lg z-40"
      style={{ position: "sticky" }}
    >
      {/* Logo Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold leading-tight">BizSuite</h1>
        <p className="text-sm text-rose-100">Mini CRM</p>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col space-y-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.path)}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-base font-medium transition-all duration-200
              ${
                location.pathname === item.path
                  ? "bg-white text-rose-600 shadow-md"
                  : "bg-transparent text-white hover:bg-white/25 hover:text-white hover:shadow-inner"
              }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
