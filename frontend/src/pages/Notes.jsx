import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTimes,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter,
  FaChevronDown,
  FaClock,
  FaTag,
  FaStickyNote,
} from "react-icons/fa";

const Notes = () => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Meeting Notes - TechCorp",
      content:
        "Discussed Q4 roadmap, budget allocation for new features, and timeline for product launch. Action items: Follow up with design team, prepare mockups by Friday.",
      category: "Meeting",
      color: "#FFE5E5",
      createdAt: "Oct 6, 2025, 3:30 PM",
      isPinned: false,
    },
    {
      id: 2,
      title: "Client Feedback",
      content:
        "Positive response from Startup Hub regarding proposal. They requested additional information about pricing tiers and support options.",
      category: "Client",
      color: "#FFF4E5",
      createdAt: "Oct 5, 2025, 2:15 PM",
      isPinned: true,
    },
    {
      id: 3,
      title: "Project Ideas",
      content:
        "New CRM features to implement: automated email sequences, advanced reporting dashboard, mobile app integration, and AI-powered lead scoring.",
      category: "Ideas",
      color: "#E5F4FF",
      createdAt: "Oct 4, 2025, 11:00 AM",
      isPinned: false,
    },
    {
      id: 4,
      title: "Weekly Goals",
      content:
        "Complete client onboarding for 3 new accounts. Finalize Q4 marketing strategy. Review and optimize sales pipeline. Team meeting on Thursday at 2 PM.",
      category: "Personal",
      color: "#F0E5FF",
      createdAt: "Oct 3, 2025, 9:00 AM",
      isPinned: false,
    },
    {
      id: 5,
      title: "Research Notes",
      content:
        "Competitor analysis shows strong demand for integrated communication tools. Consider adding Slack/Teams integration. User feedback indicates need for better mobile experience.",
      category: "Research",
      color: "#E5FFE5",
      createdAt: "Oct 2, 2025, 4:45 PM",
      isPinned: true,
    },
    {
      id: 6,
      title: "Bug Fixes",
      content:
        "Fixed login authentication issue. Updated email notification system. Resolved dashboard loading delay. Need to test on staging before deployment.",
      category: "Development",
      color: "#FFE5F4",
      createdAt: "Oct 1, 2025, 6:20 PM",
      isPinned: false,
    },
  ]);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    category: "All Categories",
    sortBy: "Recent",
  });

  const categories = [
    "All Categories",
    "Meeting",
    "Client",
    "Ideas",
    "Personal",
    "Research",
    "Development",
  ];

  const sortOptions = ["Recent", "Oldest", "A-Z", "Z-A"];

  const noteColors = [
    { name: "Pink", value: "#FFE5E5" },
    { name: "Orange", value: "#FFF4E5" },
    { name: "Blue", value: "#E5F4FF" },
    { name: "Purple", value: "#F0E5FF" },
    { name: "Green", value: "#E5FFE5" },
    { name: "Rose", value: "#FFE5F4" },
  ];

  const validateForm = () => {
    if (!selectedNote.title.trim()) return "Title is required";
    if (!selectedNote.content.trim()) return "Content is required";
    return "";
  };

  const handleAddNote = () => {
    setIsAddFormOpen(true);
    setSelectedNote({
      title: "",
      content: "",
      category: "Personal",
      color: "#FFE5E5",
      isPinned: false,
    });
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    if (selectedNote.id) {
      setNotes(notes.map((n) => (n.id === selectedNote.id ? selectedNote : n)));
      setIsEditFormOpen(false);
    } else {
      setNotes([
        ...notes,
        {
          ...selectedNote,
          id: Date.now(),
          createdAt: new Date().toLocaleString("en-US", {
            dateStyle: "short",
            timeStyle: "short",
          }),
        },
      ]);
      setIsAddFormOpen(false);
    }
    setError("");
    setSelectedNote(null);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setIsEditFormOpen(true);
  };

  const handleViewDetails = (note) => {
    setSelectedNote(note);
    setIsDetailsOpen(true);
  };

  const handleDeleteConfirm = (note) => {
    setDeleteConfirm(note);
  };

  const handleDelete = () => {
    setNotes(notes.filter((n) => n.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  const handleTogglePin = (noteId) => {
    setNotes(
      notes.map((note) =>
        note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  };

  const closeModal = () => {
    setIsAddFormOpen(false);
    setIsEditFormOpen(false);
    setIsDetailsOpen(false);
    setSelectedNote(null);
    setError("");
  };

  const filteredNotes = notes
    .filter((note) => {
      const categoryMatch =
        filters.category === "All Categories" ||
        note.category === filters.category;
      return categoryMatch;
    })
    .sort((a, b) => {
      if (filters.sortBy === "Recent") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filters.sortBy === "Oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (filters.sortBy === "A-Z") {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-hidden">
        <Navbar />


        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
          {/* Header Section */}
          <motion.div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 bg-white rounded-2xl p-6 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-800">Notes</h1>
              <p className="text-gray-500 text-sm mt-1">
                Capture ideas and important information
              </p>
            </div>
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={handleAddNote}
            >
              <FaPlus className="w-4 h-4" />
              Add Note
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
              <FaFilter className="text-rose-400" />
              <span className="font-semibold text-gray-700">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <select
                  className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 font-medium focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 font-medium focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-rose-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
                Pinned Notes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinnedNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    className="rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer relative group"
                    style={{ backgroundColor: note.color }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    {/* Pin Icon */}
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className="absolute top-3 right-3 text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                      </svg>
                    </button>

                    <h3 className="font-bold text-gray-800 text-lg mb-3 pr-8 break-words">
                      {note.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-4 break-words">
                      {note.content}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-60 text-gray-700">
                        <FaTag className="w-2.5 h-2.5" />
                        {note.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
                      <FaClock className="w-3 h-3" />
                      <span>{note.createdAt}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewDetails(note)}
                        className="flex-1 flex items-center justify-center gap-1 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 py-2 rounded-lg transition-all text-sm font-medium"
                      >
                        <FaEye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditNote(note)}
                        className="flex-1 flex items-center justify-center gap-1 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 py-2 rounded-lg transition-all text-sm font-medium"
                      >
                        <FaEdit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(note)}
                        className="flex items-center justify-center gap-1 bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-3 py-2 rounded-lg transition-all text-sm"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Notes Section - Regular Grid (No Masonry) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {unpinnedNotes.length > 0 && (
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FaStickyNote className="text-rose-400" />
                All Notes
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unpinnedNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  className="rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer relative group"
                  style={{ backgroundColor: note.color }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Pin Icon */}
                  <button
                    onClick={() => handleTogglePin(note.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                    </svg>
                  </button>

                  <h3 className="font-bold text-gray-800 text-lg mb-3 pr-8 break-words">
                    {note.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-4 break-words">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-60 text-gray-700">
                      <FaTag className="w-2.5 h-2.5" />
                      {note.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
                    <FaClock className="w-3 h-3" />
                    <span>{note.createdAt}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewDetails(note)}
                      className="flex-1 flex items-center justify-center gap-1 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 py-2 rounded-lg transition-all text-sm font-medium"
                    >
                      <FaEye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditNote(note)}
                      className="flex-1 flex items-center justify-center gap-1 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 py-2 rounded-lg transition-all text-sm font-medium"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(note)}
                      className="flex items-center justify-center gap-1 bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-3 py-2 rounded-lg transition-all text-sm"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
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
                  {isAddFormOpen ? "Add New Note" : "Edit Note"}
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="p-6">
                <div className="mb-6">
                  <label className="text-gray-700 font-semibold mb-2 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={selectedNote?.title || ""}
                    onChange={(e) =>
                      setSelectedNote({
                        ...selectedNote,
                        title: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                    placeholder="Enter note title"
                  />
                </div>

                <div className="mb-6">
                  <label className="text-gray-700 font-semibold mb-2 block">
                    Content
                  </label>
                  <textarea
                    value={selectedNote?.content || ""}
                    onChange={(e) =>
                      setSelectedNote({
                        ...selectedNote,
                        content: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                    placeholder="Enter note content"
                    rows="6"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-gray-700 font-semibold mb-2 block">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                        value={selectedNote?.category || "Personal"}
                        onChange={(e) =>
                          setSelectedNote({
                            ...selectedNote,
                            category: e.target.value,
                          })
                        }
                      >
                        {categories
                          .filter((c) => c !== "All Categories")
                          .map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                      </select>
                      <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-700 font-semibold mb-2 block">
                      Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {noteColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() =>
                            setSelectedNote({
                              ...selectedNote,
                              color: color.value,
                            })
                          }
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            selectedNote?.color === color.value
                              ? "border-rose-500 scale-110"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
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
                    {isAddFormOpen ? "Add Note" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedNote && (
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
                  Note Details
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <div
                  className="rounded-2xl p-6 mb-6"
                  style={{ backgroundColor: selectedNote.color }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {selectedNote.title}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedNote.content}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaTag className="text-rose-400" />
                    <span className="font-semibold text-gray-600">
                      Category:
                    </span>
                    <span className="text-gray-800">
                      {selectedNote.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaClock className="text-rose-400" />
                    <span className="font-semibold text-gray-600">
                      Created:
                    </span>
                    <span className="text-gray-800">
                      {selectedNote.createdAt}
                    </span>
                  </div>
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

export default Notes;
