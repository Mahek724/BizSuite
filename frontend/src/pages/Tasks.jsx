import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTimes,
  FaEye,
  FaChevronDown,
  FaCalendar,
  FaFilter,
  FaTasks,
  FaUser,
  FaFlag,
  FaStickyNote,
  FaAlignLeft,
  FaExclamationCircle,
  FaInfoCircle,
  FaUserTie,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaRegCircle,
  FaFileCsv,
  FaBars,
} from "react-icons/fa";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, '')}/api`,
});


  const Tasks = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 8
  });
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssignedDropdown, setShowAssignedDropdown] = useState(false);
  const [error, setError] = useState("");
  const [staffOptions, setStaffOptions] = useState(["All Staff"]);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const [filters, setFilters] = useState({
    status: "All Status",
    priority: "All Priorities",
    staff: "All Staff",
  });

  const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  user?.token;


  const statusOptions = ["All Status", "pending", "in-progress", "completed"];
  const priorityOptions = ["All Priorities", "High", "Medium", "Low"];

  const validateForm = () => {
    if (!selectedTask.title.trim()) return "Title is required";
    if (!selectedTask.description.trim()) return "Description is required";
    if (!selectedTask.dueDate.trim()) return "Due date is required";
    return "";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return null;
    try {
      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) return null;
      return d.toLocaleString(); 
    } catch {
      return null;
    }
  };

useEffect(() => {
  const fetchStaff = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        user?.token;

      if (!token) {
        console.warn("⚠️ No token found");
        return;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const uniqueStaff = Array.from(
        new Set(res.data.staff.map((s) => s.fullName))
      );

      setStaffOptions(["All Staff", ...uniqueStaff]);
    } catch (err) {
      console.error("❌ Failed to fetch staff list:", err.response?.data || err.message);
    }
  };

  if (user?.role) fetchStaff();
}, [user]);

useEffect(() => {
  const handleResize = () => {
    const width = window.innerWidth;
    setIsMobile(width <= 768);
    setIsSidebarOpen(width > 768);
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const handleAddTask = () => {
    setIsAddFormOpen(true);
    setSelectedTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "pending",
      assignedTo: "",
    });
  };


  useEffect(() => {
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        user?.token;

      if (!token) return console.warn("⚠️ Missing token");

      const res = await api.get(`/tasks?page=${pagination.currentPage}&limit=${pagination.limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedTasks = res.data.tasks;
      const paginationData = res.data.pagination;

      const uniqueTasks = fetchedTasks.filter(
        (task, index, self) =>
          index === self.findIndex((t) => t._id === task._id)
      );

      setTasks(uniqueTasks);
      setPagination(paginationData);
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role) fetchTasks();
}, [user, pagination.currentPage, pagination.limit]);



  const handleSaveTask = async (e) => {
  e.preventDefault();
  const validation = validateForm();
  if (validation) {
    setError(validation);
    return;
  }

  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      user?.token;

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    if (selectedTask._id) {
      const res = await api.put(`/tasks/${selectedTask._id}`, selectedTask, config);
      setTasks(tasks.map((t) => (t._id === selectedTask._id ? res.data : t)));
      setIsEditFormOpen(false);
    } else {
      const res = await api.post("/tasks", selectedTask, config);
      setTasks([...tasks, res.data]);
      setIsAddFormOpen(false);
    }

    setError("");
    setSelectedTask(null);
  } catch (err) {
    console.error("❌ Failed to save task:", err.response?.data || err.message);
    setError("Failed to save task. Try again.");
  }
};


  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditFormOpen(true);
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleDeleteConfirm = (task) => {
    setDeleteConfirm(task);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${deleteConfirm._id}`);
      setTasks(tasks.filter((t) => t._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("❌ Delete failed:", err.response?.data || err.message);
    }
  };

  const handleToggleComplete = async (taskId) => {
  try {
    const taskToUpdate = tasks.find((t) => t._id === taskId);
    if (!taskToUpdate) return;

    let nextStatus = "pending";
    if (taskToUpdate.status === "pending") nextStatus = "in-progress";
    else if (taskToUpdate.status === "in-progress") nextStatus = "completed";
    else if (taskToUpdate.status === "completed") nextStatus = "pending"; // optional cycle back

    const updatedTask = { ...taskToUpdate, status: nextStatus };

    await api.put(`/tasks/${taskId}`, updatedTask, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));

    console.log(`✅ Task "${taskToUpdate.title}" status updated to ${nextStatus}`);
  } catch (error) {
    console.error("❌ Error updating task status:", error);
  }
};

  const closeModal = () => {
    setIsAddFormOpen(false);
    setIsEditFormOpen(false);
    setIsDetailsOpen(false);
    setSelectedTask(null);
    setError("");
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      filters.status === "All Status" || task.status === filters.status;
    const priorityMatch =
      filters.priority === "All Priorities" ||
      task.priority === filters.priority;
    const staffMatch =
      filters.staff === "All Staff" || task.assignedTo === filters.staff;
    return statusMatch && priorityMatch && staffMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-gray-500";
      case "in-progress":
        return "text-blue-500";
      case "completed":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-600";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState({
    status: false,
    priority: false,
    staff: false,
  });
  const convertToCSV = (objArray) => {
    const array = Array.isArray(objArray) ? objArray : JSON.parse(objArray || "[]");
    if (!array.length) return "";
    const keys = Object.keys(array[0]);
    const header = keys.join(",");
    const rows = array.map(row =>
      keys
        .map(k => {
          const cell = row[k] ?? "";
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    return [header, ...rows].join("\r\n");
  };

  const handleExportTasks = async () => {
    const role = (user?.role || "").toLowerCase();
    if (!(role === "admin" || role === "staff")) {
      alert("Export allowed for Admin or Staff only.");
      return;
    }

    if (!filteredTasks || filteredTasks.length === 0) {
      alert("No tasks available to export.");
      return;
    }

    setExporting(true);
    try {
      // Map tasks to CSV-friendly shape
      const csvData = filteredTasks.map((t) => ({
        Title: t.title || "",
        Description: t.description || "",
        DueDate: formatDate(t.dueDate) || "",
        Priority: t.priority || "",
        Status: t.status || "",
        AssignedTo: t.assignedTo || "",
        CreatedAt: formatDate(t.createdAt || t.created_at) || "",
        UpdatedAt: formatDate(t.updatedAt || t.updated_at) || "",
        ID: t._id || t.id || "",
      }));

      const csv = convertToCSV(csvData);
      const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks_export_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export tasks:", err);
      alert("Failed to export tasks. See console for details.");
    } finally {
      setExporting(false);
    }
  };

   return (
  <div className="flex min-h-screen bg-gray-50 w-screen">
    {/* Sidebar */}
    <Sidebar isSidebarOpen={isSidebarOpen} />

    {/* Backdrop for mobile sidebar */}
    {isMobile && isSidebarOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <Navbar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto p-6">

  {/* Header Section */}
  <motion.div
    className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
            <div className="mb-4 lg:mb-0">
              <h1
                className="text-xl font-semibold tracking-wide"
                style={{
                  color: "#B5828C",
                  fontFamily: "'Raleway', sans-serif",
                }}
              >
                Manage and track team tasks
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Export Tasks button - visible to Admin and Staff */}
              {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "staff") && (
                <button
                  onClick={handleExportTasks}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-white border border-rose-200 text-rose-600 px-4 py-2.5 rounded-lg font-medium shadow-sm hover:bg-rose-50 transition-all disabled:opacity-50"
                >
                  <FaFileCsv />
                  {exporting ? "Exporting..." : "Export CSV"}
                </button>
              )}

            {/* Add Task button only visible to admin */}
             {user?.role !== "staff" && (
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={handleAddTask}
              >
                <FaPlus className="w-4 h-4" />
                Add Task
              </button>
            )}
            </div>
          </motion.div>

          {/* Filters Section */}
          <motion.div
            className="bg-white rounded-2xl p-4 md:p-6 shadow-sm mb-6 border border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Title Section */}
            <div className="flex items-center gap-2 mb-4">
              <FaFilter className="text-[#E50046] w-5 h-5" />
              <h2
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  color: "#E50046",
                }}
              >
                Search & Filter Tasks
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="relative">
                <div
                  onClick={() =>
                    setIsDropdownOpen((prev) => ({
                      ...prev,
                      status: !prev.status,
                      priority: false,
                      staff: false,
                    }))
                  }
                  className="w-full bg-[#FFF0BD] border-2 border-[#FDAB9E] rounded-xl px-4 py-2 text-[#E50046] text-sm font-medium flex justify-between items-center cursor-pointer"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  <span>{filters.status}</span>
                  <FaChevronDown
                    className={`transition-transform duration-200 ${
                      isDropdownOpen.status ? "rotate-180" : ""
                    } text-[#E50046]`}
                  />
                </div>

                {isDropdownOpen.status && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-[#FDAB9E] rounded-xl shadow-md overflow-hidden">
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        onClick={() => {
                          setFilters({ ...filters, status });
                          setIsDropdownOpen({ status: false, priority: false, staff: false });
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#FFF0BD] hover:text-[#E50046] ${
                          filters.status === status ? "bg-[#FFF0BD] text-[#E50046]" : ""
                        }`}
                        style={{ fontFamily: "'Raleway', sans-serif" }}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Filter */}
              <div className="relative">
                <div
                  onClick={() =>
                    setIsDropdownOpen((prev) => ({
                      ...prev,
                      priority: !prev.priority,
                      status: false,
                      staff: false,
                    }))
                  }
                  className="w-full bg-[#FFF0BD] border-2 border-[#FDAB9E] rounded-xl px-4 py-2 text-[#E50046] text-sm font-medium flex justify-between items-center cursor-pointer"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  <span>{filters.priority}</span>
                  <FaChevronDown
                    className={`transition-transform duration-200 ${
                      isDropdownOpen.priority ? "rotate-180" : ""
                    } text-[#E50046]`}
                  />
                </div>

                {isDropdownOpen.priority && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-[#FDAB9E] rounded-xl shadow-md overflow-hidden">
                    {priorityOptions.map((priority) => (
                      <div
                        key={priority}
                        onClick={() => {
                          setFilters({ ...filters, priority });
                          setIsDropdownOpen({ status: false, priority: false, staff: false });
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#FFF0BD] hover:text-[#E50046] ${
                          filters.priority === priority ? "bg-[#FFF0BD] text-[#E50046]" : ""
                        }`}
                        style={{ fontFamily: "'Raleway', sans-serif" }}
                      >
                        {priority}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Staff Filter - only visible to admin */}
              {isAdmin ? (
                <div className="relative">
                  <div
                    onClick={() =>
                      setIsDropdownOpen((prev) => ({
                        ...prev,
                        staff: !prev.staff,
                        status: false,
                        priority: false,
                      }))
                    }
                    className="w-full bg-[#FFF0BD] border-2 border-[#FDAB9E] rounded-xl px-4 py-2 text-[#E50046] text-sm font-medium flex justify-between items-center cursor-pointer"
                    style={{ fontFamily: "'Raleway', sans-serif" }}
                  >
                    <span>{filters.staff}</span>
                    <FaChevronDown
                      className={`transition-transform duration-200 ${
                        isDropdownOpen.staff ? "rotate-180" : ""
                      } text-[#E50046]`}
                    />
                  </div>

                  {isDropdownOpen.staff && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-[#FDAB9E] rounded-xl shadow-md overflow-hidden">
                      {staffOptions.map((staff) => (
                        <div
                          key={staff}
                          onClick={() => {
                            setFilters({ ...filters, staff });
                            setIsDropdownOpen({ status: false, priority: false, staff: false });
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#FFF0BD] hover:text-[#E50046] ${
                            filters.staff === staff ? "bg-[#FFF0BD] text-[#E50046]" : ""
                          }`}
                          style={{ fontFamily: "'Raleway', sans-serif" }}
                        >
                          {staff}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // If not admin, you can render an empty placeholder or nothing.
                <div />
              )}
            </div>
          </motion.div>

          {/* Table Section */}
          <motion.div
            key="list"
            className="bg-white/80 rounded-2xl shadow-md border border-rose-100 overflow-x-auto mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {filteredTasks.length > 0 ? (
              <motion.table
                className="w-full text-sm text-gray-700"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
                }}
              >
                <thead className="bg-gradient-to-r from-rose-100 to-pink-50 text-rose-600">
                  <tr>
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Due Date</th>
                    <th className="py-3 px-4 text-left">Priority</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Assigned To</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task) => (
                 <motion.tr
                      key={task._id}
                      className={`border-b border-gray-100 transition-all duration-500 ease-in-out ${
                        task.status === "completed"
                          ? "opacity-60 blur-[1px] hover:opacity-100 hover:blur-0"
                          : "hover:bg-rose-50"
                      }`}
                variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                      }}
                    >
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-3">
                            {/* Status Icon (no button, just an icon) */}
                            {task.completed ? (
                              <FaCheckCircle className="text-rose-500 w-5 h-5 mt-1" />
                            ) : (
                              <FaRegCircle className="text-rose-300 w-5 h-5 mt-1" />
                            )}

                            {/* Title + Description */}
                            <div className="flex flex-col gap-0.5 min-w-0">
                              {/* Title */}
                              <h4
                                className={`text-base font-medium text-gray-800 leading-none ${
                                  task.completed ? "line-through text-gray-500" : ""
                                } truncate`}
                                style={{ maxWidth: "48ch" }}
                                title={task.title}
                              >
                                {task.title}
                              </h4>

                              {/* Description (tight spacing) */}
                              <p
                                className={`text-xs text-gray-500 leading-tight ${
                                  task.completed ? "line-through text-gray-400" : ""
                                } truncate`}
                                style={{ maxWidth: "60ch" }}
                              >
                                {task.description}
                              </p>
                            </div>
                          </div>
                        </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <FaCalendar className="text-rose-400 w-3.5 h-3.5" />
                          {task.dueDate}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.priority === "High"
                              ? "bg-red-100 text-red-600"
                              : task.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Status Label */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.status === "pending"
                              ? "bg-gray-100 text-gray-600"
                              : task.status === "in-progress"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {task.assignedTo?.charAt(0) ?? "U"}
                          </div>
                          <span className="font-medium text-gray-800 text-sm truncate max-w-[160px]">
                            {task.assignedTo}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-all"
                            onClick={() => handleViewDetails(task)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all"
                            onClick={() => handleEditTask(task)}
                          >
                            <FaEdit />
                          </button>
                          {user?.role?.toLowerCase() !== "staff" && (
                              <button
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                                onClick={() => handleDeleteConfirm(task)}
                              >
                                <FaTrash />
                              </button>
                            )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            ) : (
              <div className="p-12 text-center text-gray-500">No tasks found</div>
            )}
          </motion.div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <motion.div
              className="flex justify-center items-center gap-4 mt-6 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg font-medium shadow-sm hover:bg-rose-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600 font-medium">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalTasks} tasks)
              </span>

              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddFormOpen || isEditFormOpen) && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#F5E3E0]"
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
                  {isAddFormOpen ? "Add New Task" : "Edit Task"}
                </h2>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveTask} className="p-6 space-y-6">
                {/* Title */}
                 <div>
    <label className="block text-gray-700 font-semibold mb-1">
      Title
    </label>
   <input
  type="text"
  value={selectedTask?.title || ""}
  onChange={(e) =>
    setSelectedTask({ ...selectedTask, title: e.target.value })
  }
  disabled={user?.role?.toLowerCase() === "staff"} // ✅ disable for staff
  className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none ${
    user?.role?.toLowerCase() === "staff"
      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
      : "focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
  }`}
/>

  </div>

                              {/* Description */}
                              <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={selectedTask?.description || ""}
                    onChange={(e) =>
                      setSelectedTask({ ...selectedTask, description: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  ></textarea>
                </div>

                {/* Due Date & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Due Date */}
                 <div>
                        <label className="block text-gray-700 font-semibold mb-1">
                          Due Date
                        </label>
                        <input
                      type="date"
                      value={selectedTask?.dueDate || ""}
                      onChange={(e) =>
                        setSelectedTask({ ...selectedTask, dueDate: e.target.value })
                      }
                      disabled={user?.role?.toLowerCase() === "staff"} // ✅ disable for staff
                      className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none ${
                        user?.role?.toLowerCase() === "staff"
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                      }`}
                    />

                      </div>

                  {/* Priority Dropdown */}
                  <div className="relative">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                      <FaFlag className="text-rose-400" /> Priority
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                      className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:outline-none transition-all ${
      user?.role?.toLowerCase() === "staff"
        ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
        : "border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white"
    }`}
  >
                      {selectedTask?.priority || "Select Priority"}
                      <FaChevronDown
                        className={`transition-transform duration-300 ${
                          showPriorityDropdown ? "rotate-180" : ""
                        } text-gray-400`}
                      />
                    </button>

                    <AnimatePresence>
                      {user?.role?.toLowerCase() !== "staff" && showPriorityDropdown && (
                        <motion.ul
                          className="absolute left-0 right-0 mt-2 bg-white border border-rose-100 rounded-lg shadow-lg z-20"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {["High", "Medium", "Low"].map((priority) => (
                            <li
                              key={priority}
                              onClick={() => {
                                setSelectedTask({ ...selectedTask, priority });
                                setShowPriorityDropdown(false);
                              }}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 cursor-pointer transition-all"
                            >
                              {priority}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Status Dropdown */}
                  <div className="relative">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                      <FaInfoCircle className="text-rose-400" /> Status
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setIsDropdownOpen((prev) => ({
                          ...prev,
                          statusField: !prev.statusField,
                        }))
                      }
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer bg-white"
                    >
                      {selectedTask?.status || "Select Status"}
                      <FaChevronDown
                        className={`transition-transform duration-300 ${
                          isDropdownOpen.statusField ? "rotate-180" : ""
                        } text-gray-400`}
                      />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen.statusField && (
                        <motion.ul
                          className="absolute left-0 right-0 mt-2 bg-white border border-rose-100 rounded-lg shadow-lg z-20"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {["pending", "in-progress", "completed"].map((status) => (
                            <li
                              key={status}
                              onClick={() => {
                                setSelectedTask({ ...selectedTask, status });
                                setIsDropdownOpen((prev) => ({
                                  ...prev,
                                  statusField: false,
                                }));
                              }}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 cursor-pointer transition-all capitalize"
                            >
                              {status}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>


                {/* Assigned To */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                    <FaUser className="text-rose-400" /> Assigned To
                  </label>

                  {/* If not admin, hide the staff dropdown and show the current user as assignedTo.
                      Admins see the dropdown as before. */}
                  {!isAdmin ? (
                    // show a readonly display for staff users and keep assignedTo value set to currentUser.name
                    <div className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700">
                      {user?.fullName || "You"}

                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAssignedDropdown(!showAssignedDropdown)}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer bg-white"
                      >
                        {selectedTask?.assignedTo || "Select Person"}
                        <FaChevronDown
                          className={`transition-transform duration-300 ${
                            showAssignedDropdown ? "rotate-180" : ""
                          } text-gray-400`}
                        />
                      </button>

                      <AnimatePresence>
                        {showAssignedDropdown && (
                          <motion.ul
                            className="absolute left-0 right-0 mt-2 bg-white border border-rose-100 rounded-lg shadow-lg z-20"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                           {staffOptions.filter((s) => s !== "All Staff").map((person) => (

                              <li
                                key={person}
                                onClick={() => {
                                  setSelectedTask({ ...selectedTask, assignedTo: person });
                                  setShowAssignedDropdown(false);
                                }}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 cursor-pointer transition-all"
                              >
                                {person}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
                  >
                    {isAddFormOpen ? "Add Task" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedTask && (
          <motion.div
            className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#F5E3E0]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2
                  className="text-2xl font-semibold tracking-wide"
                  style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}
                >
                  Task Details
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Details Body */}
              <div className="p-6 space-y-5">
                {[
                  { label: "Title", value: selectedTask.title, icon: <FaTasks className="text-rose-400" /> },
                  { label: "Description", value: selectedTask.description, icon: <FaAlignLeft className="text-rose-400" /> },
                  { label: "Due Date", value: selectedTask.dueDate, icon: <FaCalendar className="text-rose-400" /> },
                  // Created At added here (formatted)
                  { label: "Created At", value: formatDate(selectedTask.createdAt), icon: <FaCalendar className="text-rose-400" /> },
                  { label: "Priority", value: selectedTask.priority, icon: <FaExclamationCircle className="text-rose-400" /> },
                  { label: "Status", value: selectedTask.status, icon: <FaInfoCircle className="text-rose-400" /> },
                  { label: "Assigned To", value: selectedTask.assignedTo, icon: <FaUserTie className="text-rose-400" /> },
                ].map((item, idx) => (
                  <div key={idx}>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                      {item.icon}
                      {item.label}
                    </label>
                    <div className="text-base text-gray-800 border-2 border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
                      {item.value || <span className="text-gray-400 italic">N/A</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button
                  type="button"
                  className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#F5E3E0]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2
                  className="text-2xl font-semibold tracking-wide"
                  style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}
                >
                  Confirm Delete
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90"
                  onClick={() => setDeleteConfirm(null)}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-800">{deleteConfirm.title}</strong>?<br />
                  This action cannot be undone.
                </p>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;