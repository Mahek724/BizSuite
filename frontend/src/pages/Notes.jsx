import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext"; 
import axios from "axios";
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
  FaTags,
  FaEnvelope,
  FaTag,
  FaStickyNote,
} from "react-icons/fa";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api",
});

const Notes = () => {
     const { user } = useAuth();
     const token = user?.token || localStorage.getItem("token");

  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);


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

  useEffect(() => {
  if (!token) return;
  const fetchNotes = async () => {
    try {
      const { data } = await api.get("/notes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchNotes(); // initial fetch

  const interval = setInterval(fetchNotes, 30000); // refresh every 30 seconds
  return () => clearInterval(interval);
}, [token]);


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

  const handleSaveNote = async (e) => {
  e.preventDefault();
  const validation = validateForm();
  if (validation) {
    setError(validation);
    return;
  }

  try {
    if (selectedNote._id) {
      // Update existing note
      const res = await api.put(`/notes/${selectedNote._id}`, selectedNote, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.map((n) => (n._id === selectedNote._id ? res.data : n)));
      setIsEditFormOpen(false);
    } else {
      // Add new note
      const res = await api.post("/notes", selectedNote, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes([res.data, ...notes]);
      setIsAddFormOpen(false);
    }
    setSelectedNote(null);
    setError("");
  } catch (err) {
    console.error("Error saving note:", err);
    setError("Failed to save note. Please try again.");
  }
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

  const handleDelete = async () => {
  if (!deleteConfirm?._id) return;
  try {
    await api.delete(`/notes/${deleteConfirm._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes(notes.filter((n) => n._id !== deleteConfirm._id));
    setDeleteConfirm(null);
  } catch (err) {
    console.error("Error deleting note:", err);
  }
};


  const handleTogglePin = async (noteId) => {
  try {
    const res = await api.patch(`/notes/${noteId}/pin`, {}, {
      headers: {Authorization: `Bearer ${token}` },
    });
    setNotes(notes.map((n) => (n._id === noteId ? res.data : n)));
  } catch (err) {
    console.error("Error toggling pin:", err);
  }
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

    const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return new Date(dateString).toLocaleString("en-US", options);
};

const sortNotes = (list) => {
  if (filters.sortBy === "Recent") return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (filters.sortBy === "Oldest") return [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (filters.sortBy === "A-Z") return [...list].sort((a, b) => a.title.localeCompare(b.title));
  return [...list].sort((a, b) => b.title.localeCompare(a.title));
};
console.log("User in Notes:", user);

const pinnedNotes = sortNotes(filteredNotes.filter(n => n.pinnedBy?.includes(user.id)));
const unpinnedNotes = sortNotes(filteredNotes.filter(n => !n.pinnedBy?.includes(user.id)));


  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-hidden">
        <Navbar />


        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
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
      Capture and manage your notes
    </h1>
    <p className="text-gray-500 text-sm mt-1">
      Capture ideas and important information
    </p>
  </div>

   <button
      className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
      onClick={handleAddNote}
    >
      <FaPlus className="w-4 h-4" />
      Add Note
    </button>
</motion.div>

          {/* Filters Section */}
          <motion.div
  className="bg-white rounded-2xl p-4 md:p-6 shadow-sm mb-6 border border-gray-100"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.2 }}
>
  {/* Stylish Title */}
  <div className="flex items-center gap-2 mb-4">
    <FaFilter className="text-[#E50046] w-5 h-5" />
    <h2
      className="text-lg font-bold"
      style={{
        fontFamily: "'Raleway', sans-serif",
        color: "#E50046",
      }}
    >
      Filter Notes
    </h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Category Dropdown */}
<div className="relative">
  <button
    onClick={() =>
      setFilters((prev) => ({
        ...prev,
        openCategory: !prev.openCategory,
      }))
    }
    className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 bg-[#FFF0BD] text-[#E50046] shadow-sm cursor-pointer"
  >
    <span className="text-sm font-medium">{filters.category}</span>
    <FaChevronDown className="ml-2 text-[#E50046]" />
  </button>
  {filters.openCategory && (
    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {categories.map((category) => (
        <div
          key={category}
          onClick={() => {
            setFilters({ ...filters, category, openCategory: false });
          }}
          className="px-4 py-2 text-gray-700 hover:bg-rose-100 cursor-pointer transition-colors"
        >
          {category}
        </div>
      ))}
    </div>
  )}
</div>

{/* Sort By Dropdown */}
<div className="relative">
  <button
    onClick={() =>
      setFilters((prev) => ({
        ...prev,
        openSort: !prev.openSort,
      }))
    }
    className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 bg-[#FFF0BD] text-[#E50046] shadow-sm cursor-pointer"
  >
    <span className="text-sm font-medium">{filters.sortBy}</span>
    <FaChevronDown className="ml-2 text-[#E50046]" />
  </button>
  {filters.openSort && (
    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {sortOptions.map((option) => (
        <div
          key={option}
          onClick={() => setFilters({ ...filters, sortBy: option, openSort: false })}
          className="px-4 py-2 text-gray-700 hover:bg-rose-100 cursor-pointer transition-colors"
        >
          {option}
        </div>
      ))}
    </div>
  )}
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
                    key={note._id}

                    
                    className="rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer relative group"
                    style={{ backgroundColor: note.color }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    {/* Pin Icon */}
                    <button
                      onClick={() => handleTogglePin(note._id)}
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
                      <span>{formatDate(note.createdAt)}</span>

                    </div>

                   {user?.role === "admin" && note.createdBy && (
  <div className="mt-2 text-sm font-semibold text-gray-800">
    {note.createdBy.fullName
      ? `${note.createdBy.fullName} - ${note.createdBy.role.charAt(0).toUpperCase() + note.createdBy.role.slice(1)}`
      : note.createdBy.role}
  </div>
)}




                    {/* Action Buttons */}
                    {/* Action Buttons - Always Visible */}
{/* Action Buttons - Always Visible with Different Colors */}
<div className="flex gap-2 mt-4">
  {/* View Button - Blue */}
  <button
    onClick={() => handleViewDetails(note)}
    className="flex-1 flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all text-sm font-medium"
  >
    <FaEye className="w-3.5 h-3.5" />
    
  </button>

  {/* Edit Button - Green */}
  <button
    onClick={() => handleEditNote(note)}
    className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-all text-sm font-medium"
  >
    <FaEdit className="w-3.5 h-3.5" />
  
  </button>

  {/* Delete Button - Red */}
  <button
    onClick={() => handleDeleteConfirm(note)}
    className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-all text-sm font-medium"
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
                  key={note._id}
                  className="rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer relative group"
                  style={{ backgroundColor: note.color }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Pin Icon */}
                  <button
                    onClick={() => handleTogglePin(note._id)}
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
                    <span>{formatDate(note.createdAt)}</span>

                  </div>

                  {/* Created By (Visible only to admin) */}
{user?.role === "admin" && note.createdBy && (
  <div className="mt-2 text-sm font-semibold text-gray-800">
    {note.createdBy.fullName
      ? `${note.createdBy.fullName} - ${note.createdBy.role.charAt(0).toUpperCase() + note.createdBy.role.slice(1)}`
      : note.createdBy.role}
  </div>
)}

{/* Action Buttons - Always Visible with Different Colors */}
<div className="flex gap-2 mt-4">
  {/* View Button - Blue */}
  <button
    onClick={() => handleViewDetails(note)}
    className="flex-1 flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all text-sm font-medium"
  >
    <FaEye className="w-3.5 h-3.5" />
    
  </button>

  {/* Edit Button - Green */}
  <button
    onClick={() => handleEditNote(note)}
    className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-all text-sm font-medium"
  >
    <FaEdit className="w-3.5 h-3.5" />
    
  </button>

  {/* Delete Button - Red */}
  <button
    onClick={() => handleDeleteConfirm(note)}
    className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-all text-sm font-medium"
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
      className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4"
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
        <div className="text-center pt-8 px-6 pb-4 border-b border-gray-100">
          <h2
            className="text-2xl font-semibold tracking-wide"
            style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}
          >
            {isAddFormOpen ? "Add New Note" : "Edit Note"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveNote} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FaTags className="text-rose-400" /> Title
            </label>
            <input
              type="text"
              value={selectedNote?.title || ""}
              onChange={(e) =>
                setSelectedNote({ ...selectedNote, title: e.target.value })
              }
              placeholder="Enter note title"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FaEnvelope className="text-rose-400" /> Content
            </label>
            <textarea
              value={selectedNote?.content || ""}
              onChange={(e) =>
                setSelectedNote({ ...selectedNote, content: e.target.value })
              }
              placeholder="Enter note content"
              rows="6"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          {/* Category & Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                <FaTags className="text-rose-400" /> Category
              </label>
              <div className="relative">
  <button
    type="button"
    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer bg-white"
  >
    {selectedNote?.category || "Select Category"}
    <FaChevronDown
      className={`transition-transform duration-300 ${
        showCategoryDropdown ? "rotate-180" : ""
      } text-gray-400`}
    />
  </button>

  <AnimatePresence>
    {showCategoryDropdown && (
      <motion.ul
        className="absolute left-0 right-0 mt-2 bg-white border border-rose-100 rounded-lg shadow-lg z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {categories
          .filter((c) => c !== "All Categories")
          .map((category) => (
            <li
              key={category}
              onClick={() => {
                setSelectedNote({ ...selectedNote, category });
                setShowCategoryDropdown(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-500 cursor-pointer transition-all"
            >
              {category}
            </li>
          ))}
      </motion.ul>
    )}
  </AnimatePresence>
</div>

            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                <FaTags className="text-rose-400" /> Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {noteColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setSelectedNote({ ...selectedNote, color: color.value })
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
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
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
      className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4"
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
            Note Details
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
          <div
            className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
            style={{ backgroundColor: selectedNote.color }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {selectedNote.title}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {selectedNote.content}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                <FaTags className="text-rose-400" /> Category
              </label>
              <div className="text-base text-gray-800 border-2 border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50">
                {selectedNote.category}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                <FaClock className="text-rose-400" /> Created At
              </label>
              <div className="text-base text-gray-800 border-2 border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50">
                {formatDate(selectedNote.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={closeModal}
            className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
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
            <strong className="text-gray-800">
              {deleteConfirm.name || deleteConfirm.title}
            </strong>?<br />
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

export default Notes;
