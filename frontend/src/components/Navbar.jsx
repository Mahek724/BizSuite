import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { FaRegBell, FaTimes, FaBars } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import axios from "axios";
import Profile from "./Profile";

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen, isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);

  const routeTitles = {
    "/dashboard": "Dashboard",
    "/clients": "Clients",
    "/tasks": "Tasks",
    "/leads": "Leads",
    "/notes": "Notes",
    "/activity": "Activity",
    "/settings": "Settings",
    "/profile": "Profile",
  };

  const title = routeTitles[location.pathname] || "BizSuite";
  const displayName = user?.fullName || user?.name || "User";
  const displayRole =
    user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).toLowerCase() ||
    "Staff";

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const profilePhoto = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${API_BASE}${user.avatar}`

    : null;

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    await Promise.all(
      notifications
        .filter((n) => !n.isRead)
        .map((n) =>
          axios.put(
            `${API_BASE}/api/notifications/${n._id}/read`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        )
    );
    fetchNotifications();
  };

  const clearAll = async () => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE}/api/notifications/clear`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white border-b px-6 py-3 shadow-sm">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <FaBars className="text-gray-700" size={20} />
        </button>

        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search leads, clients, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-3 text-sm font-semibold border border-gray-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        <div className="flex items-center space-x-5 relative">
          <div className="relative">
            <button
              onClick={() => setOpenNotif(!openNotif)}
              className="relative focus:outline-none hover:scale-110 transition-transform duration-150"
            >
              <FaRegBell
                size={22}
                className={`text-gray-700 hover:text-rose-600 transition ${
                  unreadCount > 0 ? "animate-bounce-slow" : ""
                }`}
              />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">
                    {unreadCount}
                  </span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75"></span>
                </>
              )}
            </button>

            {/* Notification Dropdown */}
            {openNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                <div className="p-3 font-semibold border-b flex justify-between items-center">
                  <span>Notifications</span>

                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-red-500 hover:underline"
                        aria-label="Clear notifications"
                      >
                        Clear
                      </button>
                    )}

                    <button
                      onClick={() => setOpenNotif(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
                      aria-label="Close notifications"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 p-3">
                    No notifications yet
                  </p>
                ) : (
                  <>
                    <div className="flex justify-between p-2 border-b">
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>

                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-3 text-sm border-b hover:bg-[#fff3f1] ${
                          !n.isRead ? "bg-[#fff8f6]" : ""
                        }`}
                      >
                        <p>{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsProfileOpen(true)}
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="w-8 h-8 bg-rose-200 text-rose-700 font-semibold rounded-full flex items-center justify-center select-none">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col justify-center">
              <span className="block m-0 font-medium text-gray-800 text-[15px] leading-none">
                {displayName}
              </span>
              <span className="block m-0.5 text-gray-500 text-[13px] leading-none">
                {displayRole}
              </span>
            </div>
          </div>
        </div>
      </header>

      {isProfileOpen && (
        <Profile
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;