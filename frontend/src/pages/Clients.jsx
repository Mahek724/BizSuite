import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; 
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
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserTie,
  FaCalendarAlt,
  FaPhoneAlt,
  FaTags,
  FaTag,
  FaBuilding,
  FaChevronDown,
} from "react-icons/fa";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, '')}/api`,
});


const Clients = () => {
   const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [staffList, setStaffList] = useState([]); 
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("All Tags");
  const [viewMode, setViewMode] = useState("kanban");
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);



  const validateForm = () => {
    if (!selectedClient.name.trim()) return "Name is required";
    if (!selectedClient.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedClient.email))
      return "Enter a valid email";
    if (!selectedClient.phone.trim()) return "Phone number is required";
    if (!/^[0-9+\-()\s]+$/.test(selectedClient.phone))
      return "Enter a valid phone number";
    if (!selectedClient.company.trim()) return "Company is required";
    return "";
  };

useEffect(() => {
    if (isAddFormOpen || isEditFormOpen) {
      api.get("/auth/staff", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
        .then(res => setStaffList(res.data.staff))
        .catch(() => setStaffList([]));
    }
  }, [isAddFormOpen, isEditFormOpen]);

  // When fetching clients, also populate assignedTo with staff info
  useEffect(() => {
    api.get("/clients", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => setClients(res.data.clients))
      .catch(() => setClients([]));
  }, []);


  const handleAddClient = () => {
    setIsAddFormOpen(true);
    setSelectedClient({
      name: "",
      email: "",
      phone: "",
      company: "",
      assignedTo: "",
      tags: [],
    });
    setError("");
  };

  const handleSaveClient = async (e) => {
  e.preventDefault();
  const validation = validateForm();
  if (validation) {
    setError(validation);
    return;
  }
  try {
    if (selectedClient._id) { // Edit mode
      await api.put(`/clients/${selectedClient._id}`, selectedClient, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setIsEditFormOpen(false);
    } else { // Add mode
      await api.post("/clients", selectedClient, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setIsAddFormOpen(false);
    }
    // Reload clients after save
    const res = await api.get("/clients", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setClients(res.data.clients);
    setSelectedClient(null);
    setError("");
  } catch (err) {
    setError("Failed to save client.");
  }
};


  const handleEditClient = (client) => {
  setSelectedClient({
    ...client,
    assignedTo: typeof client.assignedTo === "object" 
      ? client.assignedTo._id 
      : client.assignedTo,
  });
  setIsEditFormOpen(true);
  setError("");
};


  const handleViewDetails = (client) => {
  const assignedUser =
    typeof client.assignedTo === "object"
      ? client.assignedTo
      : staffList.find((s) => s._id === client.assignedTo);

  setSelectedClient({
    ...client,
    assignedTo: assignedUser || { fullName: "Unassigned" },
  });
  setIsDetailsOpen(true);
};


  const handleDeleteConfirm = (client) => {
    setDeleteConfirm(client);
  };

  const handleDelete = async () => {
  try {
    await api.delete(`/clients/${deleteConfirm._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    const res = await api.get("/clients", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setClients(res.data.clients);
    setDeleteConfirm(null);
  } catch (err) {
    setError("Failed to delete client.");
  }
};

  const closeModal = () => {
    setIsAddFormOpen(false);
    setIsEditFormOpen(false);
    setIsDetailsOpen(false);
    setSelectedClient(null);
    setError("");
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      filterTag === "All Tags" || client.tags.includes(filterTag);

    return matchesSearch && matchesTag;
  });

  const allTags = [
  "All Tags",
  ...Array.from(
    new Set(clients.flatMap(c => c.tags || []))
  ),
];

  return (
  <div className="flex min-h-screen bg-gray-50 w-screen">
    {/* Sidebar */}
    <Sidebar />

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <Navbar />
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
  Manage and track your client relationships
</h1>

</div>

   {user?.role !== "staff" && (
  <button
    className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
    onClick={handleAddClient}
  >
    <FaPlus className="w-4 h-4" />
    Add Client
  </button>
)}
  </motion.div>

          {/* Filters Section */}
<motion.div
  className="bg-white rounded-xl p-4 md:p-5 shadow-sm mb-6 border border-gray-100 w-full"

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
      Search & Filter Clients
    </h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Search Field */}
    <input
      type="text"
      placeholder="Search by name, email, or company..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="col-span-2 w-full border-2 border-[#FDAB9E] rounded-xl px-4 py-2 text-sm font-medium focus:border-[#E50046] focus:outline-none focus:ring-2 focus:ring-[#FFF0BD] transition-all shadow-sm"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    />

    {/* Stylish Custom Dropdown */}
    <div className="relative">
      {/* Dropdown Header */}
      <div
        className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className="text-sm font-medium">{filterTag}</span>
        <FaChevronDown className="ml-2 text-[#E50046]" />
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm">
          {allTags.map((tag) => (
            <div
              key={tag}
              className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
              onClick={() => {
                setFilterTag(tag);
                setIsDropdownOpen(false);
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</motion.div>

{/* View Toggle Buttons */}
<div className="flex justify-end items-center mb-4 gap-3">
  <button
    onClick={() => setViewMode("kanban")}
    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-sm ${
      viewMode === "kanban"
        ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white"
        : "bg-white border border-gray-200 text-gray-700 hover:bg-rose-50"
    }`}
  >
    <FaEye /> Kanban View
  </button>

  <button
    onClick={() => setViewMode("list")}
    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-sm ${
      viewMode === "list"
        ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white"
        : "bg-white border border-gray-200 text-gray-700 hover:bg-rose-50"
    }`}
  >
    <FaEdit /> List View
  </button>
</div>

{/* Clients Section */}
<div className="w-full px-4 md:px-6 lg:px-8">
  <AnimatePresence mode="wait">
  {viewMode === "kanban" ? (
    // 🌸 Modern Kanban View
    <motion.div
      key="kanban"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {filteredClients.length > 0 ? (
        filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-100 p-4 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.07 }}
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-white font-bold flex items-center justify-center shadow-sm">
                {client.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{client.name}</h3>
                <p className="text-xs text-gray-500">{client.company}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1 mb-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-rose-400 w-3" /> {client.email}
              </div>
              <div className="flex items-center gap-2">
                <FaPhoneAlt className="text-rose-400 w-3" /> {client.phone}
              </div>
              <div className="flex items-center gap-2">
                <FaUserTie className="text-rose-400 w-3" /> 
                {typeof client.assignedTo === "object"
  ? client.assignedTo?.fullName
  : staffList.find((s) => s._id === client.assignedTo)?.fullName || "Unassigned"}


              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {client.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div
  className={`flex border-t border-gray-100 pt-3 ${
    user?.role === "staff" ? "justify-center" : "justify-between"
  }`}
>
  <button
    onClick={() => handleViewDetails(client)}
    className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-all"
  >
    <FaEye />
  </button>

  {user?.role !== "staff" && (
    <>
      <button
        onClick={() => handleEditClient(client)}
        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all"
      >
        <FaEdit />
      </button>
      <button
        onClick={() => handleDeleteConfirm(client)}
        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
      >
        <FaTrash />
      </button>
    </>
  )}
</div>


          </motion.div>
        ))
      ) : (
        <motion.div
          key="empty-kanban"
          className="col-span-full flex flex-col items-center justify-center p-12 bg-white/80 border border-rose-100 rounded-2xl text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FaUser className="w-10 h-10 mb-3 text-gray-400" />
          <p>No clients found</p>
        </motion.div>
      )}
    </motion.div>
  ) : (
    // 🌿 Modern List View
    <motion.div
      key="list"
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-rose-100 overflow-x-auto mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {filteredClients.length > 0 ? (
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
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Contact</th>
              <th className="py-3 px-4 text-left">Company</th>
              <th className="py-3 px-4 text-left">Assigned</th>
              <th className="py-3 px-4 text-left">Tags</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <motion.tr
                key={client.id}
                className="border-b border-gray-100 hover:bg-rose-50 transition-all"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <td className="py-3 px-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {client.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-800">{client.name}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-xs flex items-center gap-2 text-gray-600">
                    <FaEnvelope className="text-rose-400" /> {client.email}
                  </div>
                  <div className="text-xs flex items-center gap-2 text-gray-600">
                    <FaPhoneAlt className="text-rose-400" /> {client.phone}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-800">{client.company}</td>
                <td className="py-3 px-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    <span className="font-medium text-gray-800 text-sm truncate max-w-[160px]">
    {typeof client.assignedTo === "object"
  ? client.assignedTo?.fullName
  : staffList.find((s) => s._id === client.assignedTo)?.fullName || "Unassigned"}


    </span>
  </div>
</td>


                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {client.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
  <div className="flex justify-center gap-2">
    <button
      className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-all"
      onClick={() => handleViewDetails(client)}
    >
      <FaEye />
    </button>

    {user?.role !== "staff" && (
      <>
        <button
          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all"
          onClick={() => handleEditClient(client)}
        >
          <FaEdit />
        </button>
        <button
          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
          onClick={() => handleDeleteConfirm(client)}
        >
          <FaTrash />
        </button>
      </>
    )}
  </div>
</td>

              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      ) : (
        <div className="p-12 text-center text-gray-500">No clients found</div>
      )}
    </motion.div>
  )}
</AnimatePresence>




  
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
            style={{
              color: "#B5828C",
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            {isAddFormOpen ? "Add New Client" : "Edit Client"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveClient} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/** Input Fields */}
            {["name", "email", "phone", "company"].map((field, idx) => (
              <div key={idx}>
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                  {field === "name" && <FaUser className="text-rose-400" />}
                  {field === "email" && <FaEnvelope className="text-rose-400" />}
                  {field === "phone" && <FaPhone className="text-rose-400" />}
                  {field === "company" && <FaBuilding className="text-rose-400" />}
                  {field.charAt(0).toUpperCase() + field.slice(1).replace("-", " ")}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  value={selectedClient?.[field] || ""}
                  onChange={(e) =>
                    setSelectedClient({ ...selectedClient, [field]: e.target.value })
                  }
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
          </div>

          {/* Tags Section */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FaTags className="text-rose-400" /> Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Enter tag"
                className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                value={selectedClient?.newTag || ""}
                onChange={(e) =>
                  setSelectedClient({ ...selectedClient, newTag: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => {
                  if (selectedClient.newTag?.trim()) {
                    setSelectedClient({
                      ...selectedClient,
                      tags: [...(selectedClient.tags || []), selectedClient.newTag.trim()],
                      newTag: "",
                    });
                  }
                }}
                className="bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(selectedClient?.tags || []).map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-rose-50 text-rose-600"
                >
                  {tag}
                  <FaTimes
                    className="cursor-pointer text-red-500 hover:text-red-700"
                    onClick={() => {
                      setSelectedClient({
                        ...selectedClient,
                        tags: selectedClient.tags.filter((_, index) => index !== i),
                      });
                    }}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Assigned To */}
          {/* Assigned To — same dropdown color/design as All Tags filter */}
<div>
  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
    <FaUser className="text-rose-400" /> Assigned To
  </label>

  <div className="relative">
    {/* Dropdown Header */}
    <div
      className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
      onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
    >
     <span className="text-sm font-medium">
  {
    (() => {
      const assignedStaff = staffList.find(u => u._id === selectedClient?.assignedTo);
      if (assignedStaff) return assignedStaff.fullName;
      const populatedName = selectedClient?.assignedTo?.fullName;
      return populatedName || "Select a user";
    })()
  }
</span>

      <FaChevronDown
        className={`ml-2 text-[#E50046] transform transition-transform duration-300 ${
          isAssignDropdownOpen ? "rotate-180" : ""
        }`}
      />
    </div>

    {/* Dropdown Menu */}
    {isAssignDropdownOpen && (
    <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-md overflow-hidden">
      {staffList.length === 0 ? (
        <div className="px-4 py-2 text-gray-400">No staff registered</div>
      ) : (
        staffList.map(staff => (
          <div
            key={staff._id}
            className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
            onClick={() => {
              setSelectedClient({ ...selectedClient, assignedTo: staff._id});
              setIsAssignDropdownOpen(false);
            }}
          >
            {staff.fullName}
          </div>
        ))
      )}
    </div>
  )}
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
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
            >
              {isAddFormOpen ? "Add Client" : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>



          {/* Details Modal */}
          {/* Details Modal */}
<AnimatePresence>
  {isDetailsOpen && selectedClient && (
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
            style={{
              color: "#B5828C",
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            Client Details
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
            { label: "Full Name", value: selectedClient.name, icon: <FaUser className="text-rose-400" /> },
            { label: "Email Address", value: selectedClient.email, icon: <FaEnvelope className="text-rose-400" /> },
            { label: "Phone Number", value: selectedClient.phone, icon: <FaPhone className="text-rose-400" /> },
            { label: "Company", value: selectedClient.company, icon: <FaBuilding className="text-rose-400" /> },
          ].map((item, idx) => (
            <div key={idx}>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                {item.icon}
                {item.label}
              </label>
              <div className="text-base text-gray-800 border-2 border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
                {item.value}
              </div>
            </div>
          ))}

          {/* Tags Section */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FaTags className="text-rose-400" /> Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedClient.tags.length > 0 ? (
                selectedClient.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-sm font-medium shadow-sm"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic">No tags added</span>
              )}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FaUserTie className="text-rose-400" /> Assigned To
            </label>
            <div className="text-base text-gray-800 border-2 border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
  {selectedClient?.assignedTo
    ? typeof selectedClient.assignedTo === "object"
      ? selectedClient.assignedTo.fullName
      : staffList.find((s) => s._id === selectedClient.assignedTo)?.fullName || "Unassigned"
    : "Unassigned"
  }
</div>

          </div>
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
      className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
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
        <div className="p-6">
          <h2
            className="text-2xl font-semibold tracking-wide mb-4"
            style={{
              color: "#B5828C",
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            Confirm Delete
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800">{deleteConfirm.name}</strong>?<br />
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
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
      </div>
    </div>
  );
};

export default Clients;
