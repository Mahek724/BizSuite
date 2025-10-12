import React from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search, User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  // Map route paths to page titles
  const routeTitles = {
    "/dashboard": "Dashboard",
    "/clients": "Clients",
    "/tasks": "Tasks",
    "/leads": "Leads",
    "/notes": "Notes",
    "/activity": "Activity",
    "/settings": "Settings",
  };

  // Default title if route not found in map
  const title = routeTitles[location.pathname] || "BizSuite";

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white border-b px-6 py-3 shadow-sm">

      {/* Left Section - Dynamic Page Title */}
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

      {/* Middle Section - Search */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Input */}
            <input
              type="text"
              placeholder="Search..."
              className="w-full pr-10 pl-3 text-sm font-semibold border border-gray-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {/* Icon */}
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>




      {/* Right Section - Notification + Profile */}
      <div className="flex items-center space-x-5">
        {/* Notification Bell */}
        <div className="relative cursor-pointer">
          <Bell className="text-gray-600" size={20} />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-rose-200 rounded-full flex items-center justify-center">
            <User className="text-rose-600" size={18} />
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium text-gray-800">Admin User</p>
            <p className="text-gray-500 text-xs">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
