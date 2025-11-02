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

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { name: "Clients", icon: <Users size={18} />, path: "/clients" },
    { name: "Leads", icon: <UserPlus size={18} />, path: "/leads" },
    { name: "Tasks", icon: <CheckSquare size={18} />, path: "/tasks" },
    { name: "Notes", icon: <StickyNote size={18} />, path: "/notes" },
    { name: "Activity", icon: <Activity size={18} />, path: "/activity" },
    { name: "Settings", icon: <Settings size={18} />, path: "/settings" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside
      className="
        sticky top-0 
        h-screen w-64 
        bg-rose-300 text-white 
        flex flex-col p-5 
        shadow-md
      "
    >
      {/* Logo Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold leading-tight">BizSuite</h1>
        <p className="text-sm text-rose-100">Mini CRM</p>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.path)}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-base font-medium transition-all duration-200
              outline-none focus:outline-none focus:ring-0
              ₹{
                location.pathname === item.path
                  ? "bg-white text-rose-600 shadow-md"
                  : "bg-transparent text-white hover:bg-white/25 hover:text-white hover:shadow-inner backdrop-blur-sm outline-none"
              }
            `}
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
