import React from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const routeTitles = {
    "/dashboard": "Dashboard",
    "/clients": "Clients",
    "/tasks": "Tasks",
    "/leads": "Leads",
    "/notes": "Notes",
    "/activity": "Activity",
    "/settings": "Settings",
  };

  const title = routeTitles[location.pathname] || "BizSuite";

  const displayName = user?.fullName || user?.name || "User";
  const displayRole =
    user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).toLowerCase() || "Staff";

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white border-b px-6 py-3 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pr-10 pl-3 text-sm font-semibold border border-gray-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <div className="relative cursor-pointer">
          <Bell className="text-gray-600" size={20} />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-rose-200 text-rose-700 font-semibold rounded-full flex items-center justify-center">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium text-gray-800">{displayName}</p>
            <p className="text-gray-500 text-xs">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
