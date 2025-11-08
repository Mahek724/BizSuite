import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaEye,
  FaTimes,
  FaPlus,
  FaEdit,
  FaFilter,
  FaTrash,
  FaChevronDown,
  FaSearch,
  FaFileExport,
  FaUsers,
  FaTasks,
  FaEyeSlash,
  FaClock,
} from "react-icons/fa";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api",
});

const API_BASE = api.defaults.baseURL + "/users";
 // adjust if your backend is mounted at a different path

const mapServerUserToClient = (u) => {
  const fullName = u.fullName || u.name || "";
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  // handle relative vs absolute URL
  let avatarUrl = u.avatarUrl || u.profilePhoto || u.avatar || null;
  if (avatarUrl && !avatarUrl.startsWith("http")) {
    avatarUrl = `${API_BASE}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`;
  }

  return {
    id: u._id || u.id,
    name: fullName,
    email: u.email,
    role: u.role || "Staff",
    status: u.status || "Active",
    avatarUrl,
    initials: fullName ? fullName.charAt(0).toUpperCase() : "?",
    color: "#C98A8A",
    joinDate: u.createdAt
      ? new Date(u.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : u.joinDate || "",
    workSummary: u.workSummary || { leads: 0, tasks: 0, clients: 0 },
  };
};



const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // adjust key if you store token elsewhere
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Settings = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]); // now loaded from server
  const [filters, setFilters] = useState({
    role: "All Roles",
    status: "All Status",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // stores id of user to delete
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);


  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Staff",
    password: "",
  });

  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // compute deleting user (for modal display) — may be undefined if null
  const deletingUser = users.find((u) => u.id === showDeleteConfirm);

  // Fetch users on mount
  useEffect(() => {
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_BASE, {
        headers: getAuthHeaders(),
      });

      console.log("GET /api/users response:", res.status, res.data);

      if (Array.isArray(res.data)) {
        setUsers(res.data.map(mapServerUserToClient));
      } else if (res.data.users && Array.isArray(res.data.users)) {
        setUsers(res.data.users.map(mapServerUserToClient));
      } else {
        setUsers([]);
      }
    } catch (err) {
      // More detailed logging for debugging
      console.error("Failed to fetch users - full error:", err);

      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message || err?.response?.data || err.message;

      // friendly UI message for common auth issues
      if (status === 401 || status === 403) {
        setError("You do not have permission to view all users. This endpoint is admin-only.");
      } else {
        setError(serverMessage || "Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, []);


  // Handle View Profile
  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  // Handle Add User (calls API)
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullName: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      };
      const res = await axios.post(API_BASE, payload, {
        headers: getAuthHeaders(),
      });

      // the server responds with created user (res.data.user) or the user object directly
      const created = res.data.user || res.data;
      const mapped = mapServerUserToClient(created);
      setUsers((prev) => [...prev, mapped]);

      setShowAddModal(false);
      setNewUser({ name: "", email: "", role: "Staff", password: "" });
    } catch (err) {
      console.error("Failed to add user:", err);
      alert(err?.response?.data?.message || err.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit User (open modal)
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  // Save edit (calls API)
  const handleSaveEdit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedUser) return;

    try {
      setLoading(true);
      const payload = {
        fullName: editUser.name,
        email: editUser.email,
        role: editUser.role,
        status: editUser.status,
      };
      const res = await axios.put(`${API_BASE}/${selectedUser.id}`, payload, {
        headers: getAuthHeaders(),
      });

      const updated = res.data.user || res.data;
      const mapped = mapServerUserToClient(updated);

      setUsers((prev) => prev.map((u) => (String(u.id) === String(mapped.id) ? mapped : u)));
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(err?.response?.data?.message || err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete User (calls API)
  const handleDeleteUser = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/${id}`, {
        headers: getAuthHeaders(),
      });
      setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(err?.response?.data?.message || err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // Filter and Search Users
  const filteredUsers = users.filter((user) => {
    const roleMatch =
      filters.role === "All Roles" || user.role === filters.role;
    const statusMatch =
      filters.status === "All Status" || user.status === filters.status;
    const searchMatch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return roleMatch && statusMatch && searchMatch;
  });

  // Export to CSV functionality (client-side)
  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Role",
      "Status",
      "Leads",
      "Tasks",
      "Clients",
      "Join Date",
    ];
    const csvData = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.workSummary.leads,
      user.workSummary.tasks,
      user.workSummary.clients,
      user.joinDate,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString().split("T")[0]}.csv`
    );

    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        {/* Main Content - Full Width */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Header Section */}
          <motion.div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Left side - Title & subtitle */}
            <div className="mb-11 ml-6 mt-4 lg:mb-0">
              <h1
                className="text-xl font-semibold tracking-wide"
                style={{
                  color: "#B5828C",
                  fontFamily: "'Raleway', sans-serif",
                }}
              >
                Manage your team and user roles
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Add, edit, or export users with ease
              </p>
            </div>

            {/* Right side - Buttons */}
            <div className="flex items-center gap-3 mr-6">
              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all duration-200"
              >
                <FaFileExport className="w-4 h-4" />
                <span>Export</span>
              </button>

              {/* Add User Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <div className="px-6 pb-3">
            <motion.div
              className="bg-white rounded-2xl p-4 md:p-6 shadow-sm mb-3 border border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Filter Header */}
              <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-[#E50046] w-5 h-5" />
                <h2
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "'Raleway', sans-serif",
                    color: "#E50046",
                  }}
                >
                  Filter Users
                </h2>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <div className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-[1px] bg-[#FFF0BD] text-[#E50046] shadow-sm">
                    <div className="flex items-center w-full">
                      <FaSearch className="w-4 h-4 text-[#E50046] mr-2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full bg-transparent text-[#E50046] placeholder-[#E50046]/70 text-sm font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <div
                    className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-[6px] cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                    onClick={() =>
                      setOpenDropdown((prev) =>
                        prev === "roleFilter" ? null : "roleFilter"
                      )
                    }
                  >
                    <span className="text-sm font-medium">
                      {filters.role === "All Roles" ? "All Roles" : filters.role}
                    </span>
                    <FaChevronDown className="ml-2 text-[#E50046]" />
                  </div>

                  {openDropdown === "roleFilter" && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm overflow-hidden">
                      {["All Roles", "Admin", "Staff"].map((role) => (
                        <div
                          key={role}
                          className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white cursor-pointer transition-all"
                          onClick={() => {
                            setFilters({ ...filters, role });
                            setOpenDropdown(null);
                          }}
                        >
                          {role}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <div
                    className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-[6px] cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                    onClick={() =>
                      setOpenDropdown((prev) =>
                        prev === "statusFilter" ? null : "statusFilter"
                      )
                    }
                  >
                    <span className="text-sm font-medium">
                      {filters.status === "All Status" ? "All Status" : filters.status}
                    </span>
                    <FaChevronDown className="ml-2 text-[#E50046]" />
                  </div>

                  {openDropdown === "statusFilter" && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm overflow-hidden">
                      {["All Status", "Active", "Inactive"].map((status) => (
                        <div
                          key={status}
                          className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white cursor-pointer transition-all"
                          onClick={() => {
                            setFilters({ ...filters, status });
                            setOpenDropdown(null);
                          }}
                        >
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Users Table */}
          <motion.div
            key="user-list"
            className="mx-4 md:mx-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-rose-100 -mt-2 pb-6 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {loading && (
              <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
            )}

            {!loading && filteredUsers.length > 0 ? (
              <motion.table className="w-full text-sm text-gray-700">
                <thead className="bg-gradient-to-r from-rose-100 to-pink-50 text-rose-600">
                  <tr>
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Role</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Work Summary</th>
                    <th className="py-3 px-4 text-left">Join Date</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-rose-50 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {/* User */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
  <img
    src={user.avatarUrl}
    alt={user.name}
    className="w-10 h-10 rounded-full object-cover shadow-sm border border-rose-200"
  />
) : (
  <div
    className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold text-sm shadow-sm"
    style={{ backgroundColor: user.color }}
  >
    {user.initials}
  </div>
)}

                          <div>
                            <span className="text-base font-semibold text-gray-800 leading-tight">
                              {user.name}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                              <FaEnvelope className="text-rose-400" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            user.role === "Admin"
                              ? "bg-rose-100 text-rose-600"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Work Summary */}
                      <td className="py-3 px-4">
                        <div className="text-xs space-y-0.5">
                          <div className="text-gray-700">
                            <span className="font-medium">Leads:</span>{" "}
                            {user.workSummary.leads}
                          </div>
                          <div className="text-gray-700">
                            <span className="font-medium">Tasks:</span>{" "}
                            {user.workSummary.tasks}
                          </div>
                          <div className="text-gray-700">
                            <span className="font-medium">Clients:</span>{" "}
                            {user.workSummary.clients}
                          </div>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="py-3 px-4 text-gray-600">{user.joinDate}</td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewProfile(user)}
                            className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            ) : (
              !loading && (
                <div className="p-12 text-center text-gray-500">
                  No users found
                </div>
              )
            )}
          </motion.div>
        </div>

        {/* User Profile Modal */}
        <AnimatePresence>
          {showProfileModal && selectedUser && (
            <motion.div
              className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
            >
              <motion.div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#F5E3E0]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-center p-6 border-b border-gray-100">
                  <h2
                    className="text-2xl font-semibold tracking-wide"
                    style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}
                  >
                    User Profile
                  </h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center space-y-2">
                   {selectedUser.avatarUrl ? (
  <img
    src={selectedUser.avatarUrl}
    alt={selectedUser.name}
    className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-rose-200"
  />
) : (
  <div
    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md"
    style={{ backgroundColor: selectedUser.color }}
  >
    {selectedUser.initials}
  </div>
)}

                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                    <div>
                      <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                        <FaShieldAlt className="text-rose-400" />
                        Role
                      </label>
                      <div className="text-base text-gray-800 border-2 border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50">
                        {selectedUser.role}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                        <FaUser className="text-rose-400" />
                        Status
                      </label>
                      <div className="text-base text-gray-800 border-2 border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50">
                        {selectedUser.status}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                        <FaClock className="text-rose-400" />
                        Join Date
                      </label>
                      <div className="text-base text-gray-800 border-2 border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50">
                        {selectedUser.joinDate}
                      </div>
                    </div>
                  </div>

                  {/* Work Summary */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                      <FaTasks className="text-rose-400" /> Work Summary
                    </label>
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-5 border border-rose-100">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-[#B87C7C]">
                            {selectedUser.workSummary.leads}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Leads</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedUser.workSummary.tasks}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Tasks</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#B87C7C]">
                            {selectedUser.workSummary.clients}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Clients</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
                    onClick={() => setShowProfileModal(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add User Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#F5E3E0]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="text-center pt-8 px-6 pb-4 border-b border-gray-100">
                  <h2
                    className="text-2xl font-semibold tracking-wide"
                    style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}
                  >
                    Add New User
                  </h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                      <FaUser className="text-rose-400" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                      <FaEnvelope className="text-rose-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email address"
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                      <FaShieldAlt className="text-rose-400" /> Role
                    </label>
                    <div className="relative">
                      <div
                        className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                        onClick={() =>
                          setOpenDropdown((prev) => (prev === "role" ? null : "role"))
                        }
                      >
                        <span className="text-sm font-medium">
                          {newUser.role || "Select Role"}
                        </span>
                        <FaChevronDown className="ml-2 text-[#E50046]" />
                      </div>

                      {openDropdown === "role" && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm max-h-60 overflow-auto">
                          {["Staff", "Admin"].map((role) => (
                            <div
                              key={role}
                              className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
                              onClick={() => {
                                setNewUser({ ...newUser, role });
                                setOpenDropdown(null);
                              }}
                            >
                              {role}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                      <FaShieldAlt className="text-rose-400" /> Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        placeholder="Enter password"
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E50046]/70 hover:text-[#E50046]"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
                  >
                    Add User
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit User Modal (handled earlier) */}
        <AnimatePresence>
  {showEditModal && selectedUser && (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowEditModal(false)}
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#F5E3E0]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center pt-8 px-6 pb-4 border-b border-gray-100">
          <h2
            className="text-2xl font-semibold tracking-wide"
            style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}
          >
            Edit User
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                <FaUser className="text-rose-400" /> Full Name
              </label>
              <input
                type="text"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                <FaEnvelope className="text-rose-400" /> Email Address
              </label>
              <input
                type="email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                placeholder="Enter email"
              />
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                <FaShieldAlt className="text-rose-400" /> Role
              </label>
              <div className="relative">
                <div
                  className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                  onClick={() =>
                    setOpenDropdown((prev) =>
                      prev === "role" ? null : "role"
                    )
                  }
                >
                  <span className="text-sm font-medium">
                    {editUser.role || "Select Role"}
                  </span>
                  <FaChevronDown className="ml-2 text-[#E50046]" />
                </div>

                {openDropdown === "role" && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm">
                    {["Admin", "Staff"].map((option) => (
                      <div
                        key={option}
                        className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
                        onClick={() => {
                          setEditUser({ ...editUser, role: option });
                          setOpenDropdown(null);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                <FaShieldAlt className="text-rose-400" /> Status
              </label>
              <div className="relative">
                <div
                  className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                  onClick={() =>
                    setOpenDropdown((prev) =>
                      prev === "status" ? null : "status"
                    )
                  }
                >
                  <span className="text-sm font-medium">
                    {editUser.status || "Select Status"}
                  </span>
                  <FaChevronDown className="ml-2 text-[#E50046]" />
                </div>

                {openDropdown === "status" && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm">
                    {["Active", "Inactive"].map((option) => (
                      <div
                        key={option}
                        className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
                        onClick={() => {
                          setEditUser({ ...editUser, status: option });
                          setOpenDropdown(null);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


        {/* Delete Confirmation Modal (handled earlier) */}
        <AnimatePresence>
  {showDeleteConfirm && (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowDeleteConfirm(null)}
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-[#F5E3E0]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2
          className="text-2xl font-semibold text-center mb-4"
          style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}
        >
          Confirm Delete
        </h2>

        {/* Body */}
        <p className="text-center text-gray-700 text-sm mb-6">
          Are you sure you want to delete{" "}
          <strong className="text-[#E50046]">{showDeleteConfirm.name}</strong>?
          <br />
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 pt-2 border-t border-gray-100">
          <button
            type="button"
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all"
            onClick={() => setShowDeleteConfirm(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
            onClick={() => handleDeleteUser(showDeleteConfirm)}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      </div>
    </div>
  );
};

export default Settings;