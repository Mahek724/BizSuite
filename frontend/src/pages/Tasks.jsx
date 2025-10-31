import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTimes,
  FaEye,
  FaChevronDown,
  FaCalendar,
  FaFilter,
  FaTasks,
  FaAlignLeft,
  FaExclamationCircle,
  FaInfoCircle,
  FaUserTie,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaCircle,
} from "react-icons/fa";

const Tasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Follow up with TechCorp Solutions",
      description: "Discuss contract renewal terms",
      dueDate: "Oct 8, 2025",
      priority: "High",
      status: "pending",
      assignedTo: "John Doe",
      completed: false,
    },
    {
      id: 2,
      title: "Send proposal to Startup Hub",
      description: "Prepare and send initial proposal",
      dueDate: "Oct 6, 2025",
      priority: "High",
      status: "in-progress",
      assignedTo: "John Doe",
      completed: false,
    },
    {
      id: 3,
      title: "Schedule demo with Digital Agency Co",
      description: "Product demonstration meeting",
      dueDate: "Oct 4, 2025",
      priority: "Medium",
      status: "completed",
      assignedTo: "Jane Smith",
      completed: true,
    },
    {
      id: 4,
      title: "Contract Deal with Taylor Consulting",
      description: "Finalize terms and pricing",
      dueDate: "Oct 7, 2025",
      priority: "High",
      status: "in-progress",
      assignedTo: "John Doe",
      completed: false,
    },
    {
      id: 5,
      title: "Onboard E-Commerce Plus",
      description: "Complete onboarding process",
      dueDate: "Oct 9, 2025",
      priority: "Medium",
      status: "pending",
      assignedTo: "Jane Smith",
      completed: false,
    },
  ]);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
const [showAssignedDropdown, setShowAssignedDropdown] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    status: "All Status",
    priority: "All Priorities",
    staff: "All Staff",
  });

  const statusOptions = ["All Status", "pending", "in-progress", "completed"];
  const priorityOptions = ["All Priorities", "High", "Medium", "Low"];
  const staffOptions = ["All Staff", "John Doe", "Jane Smith"];

  const validateForm = () => {
    if (!selectedTask.title.trim()) return "Title is required";
    if (!selectedTask.description.trim()) return "Description is required";
    if (!selectedTask.dueDate.trim()) return "Due date is required";
    return "";
  };

  const handleAddTask = () => {
    setIsAddFormOpen(true);
    setSelectedTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "pending",
      assignedTo: "John Doe",
      completed: false,
    });
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    if (selectedTask.id) {
      setTasks(tasks.map((t) => (t.id === selectedTask.id ? selectedTask : t)));
      setIsEditFormOpen(false);
    } else {
      setTasks([
        ...tasks,
        {
          ...selectedTask,
          id: Date.now(),
        },
      ]);
      setIsAddFormOpen(false);
    }
    setError("");
    setSelectedTask(null);
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

  const handleDelete = () => {
    setTasks(tasks.filter((t) => t.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  const handleToggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              status: !task.completed ? "completed" : "in-progress",
            }
          : task
      )
    );
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

  // Add this below your filters useState
const [isDropdownOpen, setIsDropdownOpen] = useState({
  status: false,
  priority: false,
  staff: false,
});


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1">
        <Navbar />


        <div className="p-6">
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

  <button
    className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
    onClick={handleAddTask}
  >
    <FaPlus className="w-4 h-4" />
    Add Task
  </button>
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
   {/* Status Filter (Custom Dropdown like client page) */}
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
{/* Priority Filter (Custom Dropdown like client page) */}
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

    {/* Staff Filter */}
    {/* Staff Filter (Custom Dropdown like client page) */}
{/* Staff Filter (Custom Dropdown like client page) */}
{/* Staff Filter (Custom Dropdown like client page) */}
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
</div>
</motion.div>

          {/* Table Section */}
          <motion.div
  key="list"
  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-rose-100 overflow-x-auto mt-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
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
  key={task.id}
  className={`border-b border-gray-100 transition-all duration-300 ${
    task.completed
      ? "opacity-60 blur-[1px] hover:opacity-80 hover:blur-0"
      : "hover:bg-rose-50"
  }`}
  variants={{
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }}
>
  {/* Title + Checkbox */}
  <td className="py-3 px-4 flex items-center gap-3">
    <button
      onClick={() => handleToggleComplete(task.id)}
      className="flex items-center justify-center w-5 h-5 border-2 border-rose-400 rounded-full focus:outline-none"
    >
      {task.completed ? (
        <FaCheckCircle className="text-rose-500 w-4 h-4" />
      ) : (
        <FaCircle className="text-rose-300 w-3.5 h-3.5" />
      )}
    </button>
    <div>
      <h4
        className={`font-semibold text-gray-800 ${
          task.completed ? "line-through text-gray-500" : ""
        }`}
      >
        {task.title}
      </h4>
      <p
        className={`text-xs text-gray-500 mt-0.5 ${
          task.completed ? "line-through text-gray-400" : ""
        }`}
      >
        {task.description}
      </p>
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
        {task.assignedTo.charAt(0)}
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
      <button
        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
        onClick={() => handleDeleteConfirm(task)}
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
    <div className="p-12 text-center text-gray-500">No tasks found</div>
  )}
</motion.div>

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
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              Title
            </label>
            <input
              type="text"
              value={selectedTask?.title || ""}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, title: e.target.value })
              }
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              Description
            </label>
            <textarea
              value={selectedTask?.description || ""}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, description: e.target.value })
              }
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
              placeholder="Enter task description"
              rows="3"
            />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                Due Date
              </label>
              <input
                type="text"
                value={selectedTask?.dueDate || ""}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, dueDate: e.target.value })
                }
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                placeholder="Oct 8, 2025"
              />
            </div>

            <div className="relative">
  <button
    type="button"
    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer bg-white"
  >
    {selectedTask?.priority || "Select Priority"}
    <FaChevronDown
      className={`transition-transform duration-300 ${
        showPriorityDropdown ? "rotate-180" : ""
      } text-gray-400`}
    />
  </button>

  <AnimatePresence>
    {showPriorityDropdown && (
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

          {/* Assigned To */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              Assigned To
            </label>
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
        {["John Doe", "Jane Smith"].map((person) => (
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
