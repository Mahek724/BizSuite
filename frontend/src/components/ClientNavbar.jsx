import React from "react";
import { Bell, Search, User } from "lucide-react";

const DashboardNavbar = () => {
  return (
    <header className="flex items-center justify-between bg-white border-b px-6 py-3 shadow-sm">
      {/* Left Section */}
      <h1 className="text-xl font-semibold text-gray-800">Clients</h1>

      {/* Middle Section - Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
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

export default DashboardNavbar;
