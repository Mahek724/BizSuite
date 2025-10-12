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
  FaUser,
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1">
        <Navbar />


        <div className="p-6">
          {/* Header Section */}
          <motion.div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 bg-white rounded-2xl p-6 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage and track team tasks
              </p>
            </div>
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={handleAddTask}
            >
              <FaPlus className="w-4 h-4" />
              Add Task
            </button>
          </motion.div>

          {/* Filters Section */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-rose-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-gray-700">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <select
                  className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 font-medium focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 font-medium focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters({ ...filters, priority: e.target.value })
                  }
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 font-medium focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                  value={filters.staff}
                  onChange={(e) =>
                    setFilters({ ...filters, staff: e.target.value })
                  }
                >
                  {staffOptions.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* Table Section */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredTasks.map((task) => (
                    <motion.tr
                      key={task.id}
                      className={`hover:bg-gray-50 transition-all duration-300 ${
                        task.completed ? "opacity-50 blur-[0.5px]" : ""
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleComplete(task.id)}
                          className={`transition-colors ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.completed ? (
                            <FaCheckCircle className="w-6 h-6" />
                          ) : (
                            <FaCircle className="w-6 h-6" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <h4
                            className={`font-semibold text-gray-800 ${
                              task.completed ? "line-through" : ""
                            }`}
                          >
                            {task.title}
                          </h4>
                          <p
                            className={`text-sm text-gray-600 mt-1 ${
                              task.completed ? "line-through" : ""
                            }`}
                          >
                            {task.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaCalendar className="text-rose-400 w-3.5 h-3.5" />
                          <span className="text-sm">{task.dueDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {task.assignedTo.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-800">
                            {task.assignedTo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(task)}
                            className="flex items-center justify-center w-20 h-8 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-all text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditTask(task)}
                            className="flex items-center justify-center w-16 h-8 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(task)}
                            className="flex items-center justify-center w-20 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddFormOpen || isEditFormOpen) && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isAddFormOpen ? "Add New Task" : "Edit Task"}
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="p-6">
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold mb-2 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={selectedTask?.title || ""}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        title: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                    placeholder="Enter task title"
                  />
                </div>

                <div className="mb-6">
                  <label className="text-gray-700 font-semibold mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={selectedTask?.description || ""}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        description: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                    placeholder="Enter task description"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-gray-700 font-semibold mb-2 block">
                      Due Date
                    </label>
                    <input
                      type="text"
                      value={selectedTask?.dueDate || ""}
                      onChange={(e) =>
                        setSelectedTask({
                          ...selectedTask,
                          dueDate: e.target.value,
                        })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                      placeholder="Oct 8, 2025"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 font-semibold mb-2 block">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                        value={selectedTask?.priority || "Medium"}
                        onChange={(e) =>
                          setSelectedTask({
                            ...selectedTask,
                            priority: e.target.value,
                          })
                        }
                      >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                      <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-gray-700 font-semibold mb-2 block">
                    Assigned To
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                      value={selectedTask?.assignedTo || "John Doe"}
                      onChange={(e) =>
                        setSelectedTask({
                          ...selectedTask,
                          assignedTo: e.target.value,
                        })
                      }
                    >
                      <option>John Doe</option>
                      <option>Jane Smith</option>
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
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
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">
                  Task Details
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Title
                  </label>
                  <p className="text-base text-gray-800 bg-gray-50 px-4 py-3 rounded-xl">
                    {selectedTask.title}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Description
                  </label>
                  <p className="text-base text-gray-800 bg-gray-50 px-4 py-3 rounded-xl">
                    {selectedTask.description}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Due Date
                  </label>
                  <p className="text-base text-gray-800 bg-gray-50 px-4 py-3 rounded-xl">
                    {selectedTask.dueDate}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Priority
                  </label>
                  <p className="text-base text-gray-800 bg-gray-50 px-4 py-3 rounded-xl">
                    {selectedTask.priority}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Status
                  </label>
                  <p className="text-base text-gray-800 bg-gray-50 px-4 py-3 rounded-xl capitalize">
                    {selectedTask.status}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Assigned To
                  </label>
                  <p className="text-base text-gray-800 bg-gray-50 px-4 py-3 rounded-xl">
                    {selectedTask.assignedTo}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={closeModal}
                  className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
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
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Confirm Delete
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.title}</strong>? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
