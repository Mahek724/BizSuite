import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTimes,
  FaEye,
  FaEnvelope,
  FaTrash,
  FaFilter,
  FaBuilding,
  FaDollarSign,
  FaShareAlt,
  FaBullhorn,
  FaFlag,
  FaEdit,
  FaUser,
  FaGripVertical,
  FaListUl,
  FaLayerGroup,
  FaLink,
  FaCalendarAlt,
  FaUserTie,
  FaTh,
  FaChevronDown,
} from "react-icons/fa";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api",
});

const Leads = () => {
  const { user } = useAuth();
  
  const token = localStorage.getItem("token"); // adjust if token comes from context
  const isAdmin = (user?.role || localStorage.getItem("role") || "")
    .toString()
    .toLowerCase() === "admin";

  // attach auth header
  api.interceptors.request.use((cfg) => {
    if (!cfg.headers) cfg.headers = {};
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState("kanban");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [staffOptions, setStaffOptions] = useState(["All Staff"]);

  const [filters, setFilters] = useState({
    stage: "All Stages",
    source: "All Sources",
    staff: "All Staff",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    value: 0,
    stage: "New",
    source: "Website",
    assignedTo: "",
  });

  const stages = ["All Stages", "New", "Contacted", "Deal", "Won", "Lost"];
  const sources = ["All Sources", "Website", "Referral", "Social Media", "Cold Call", "Other"];

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

        const res = await axios.get(`${import.meta.env.VITE_API_BASE}/api/auth/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const uniqueStaff = Array.from(new Set(res.data.staff.map((s) => s.fullName)));

        setStaffOptions(["All Staff", ...uniqueStaff]);
        console.log("✅ Staff loaded:", uniqueStaff);
      } catch (err) {
        console.error("❌ Failed to fetch staff list:", (err.response && err.response.data) || err.message);
        // keep default fallback
      }
    };

    if (user?.role) fetchStaff();
  }, [user]);

  // Helper: normalize leads from server to use `id` consistently (UI expects lead.id)
  const normalizeLead = (lead) => {
    return {
      ...lead,
      id: lead._id || lead.id,
    };
  };

  const fetchLeads = useCallback(
    async (extraParams = {}) => {
      setLoading(true);
      try {
        const params = {};
        if (filters.stage && filters.stage !== "All Stages") params.stage = filters.stage;
        if (filters.source && filters.source !== "All Sources") params.source = filters.source;
        if (isAdmin) {
          if (filters.staff && filters.staff !== "All Staff") params.assignedTo = filters.staff;
        }

        Object.assign(params, extraParams);

        const res = await api.get("/leads", { params });
        const data = Array.isArray(res.data) ? res.data.map(normalizeLead) : [];
        setLeads(data);
      } catch (err) {
        console.error("Failed to fetch leads:", (err.response && err.response.data) || err.message);
        alert("Failed to fetch leads. See console for details.");
      } finally {
        setLoading(false);
      }
    },
    [filters, isAdmin]
  );

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [filters, fetchLeads]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      value: 0,
      stage: "New",
      source: sources.length > 1 ? sources[1] : "Website",
      assignedTo: isAdmin ? "" : user?.fullName || "",
    });
    setSelectedLead(null);
  };

  // Add lead -> POST /api/leads
  const handleAddLead = async (e) => {
    e?.preventDefault?.();
    if (!formData.name || !formData.email) {
      alert("Please fill in required fields");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        value: Number(formData.value) || 0,
        stage: formData.stage || "New",
        source: formData.source || "",
        assignedTo: formData.assignedTo || (user?.fullName || ""),
      };
      const res = await api.post("/leads", payload);
      const created = normalizeLead(res.data);
      setLeads((prev) => [created, ...prev]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add lead:", (err.response && err.response.data) || err.message);
      alert("Failed to add lead. See console for details.");
    }
  };

  // Edit existing lead -> PUT /api/leads/:id
  const handleEditLead = async (e) => {
    e?.preventDefault?.();
    if (!selectedLead?.id) {
      alert("No lead selected");
      return;
    }

    try {
      // If user is staff (not admin) backend enforces only "stage" property allowed.
      // So send only { stage } when editing as staff.
      let payload;
      if (!isAdmin) {
        // Validate allowed stage values for staff (only Won or Lost)
        const allowed = ["Won", "Lost"];
        if (!formData.stage || !allowed.includes(formData.stage)) {
          alert("As staff you can only mark a lead Won or Lost.");
          return;
        }
        payload = { stage: formData.stage };
      } else {
        // Admin full update
        if (!formData.name || !formData.email) {
          alert("Please fill in required fields");
          return;
        }
        payload = {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          value: Number(formData.value) || 0,
          stage: formData.stage,
          source: formData.source,
          assignedTo: formData.assignedTo,
        };
      }

      const res = await api.put(`/leads/${selectedLead.id}`, payload);
      const updated = normalizeLead(res.data);
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setShowEditModal(false);
      setSelectedLead(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update lead:", (err.response && err.response.data) || err.message);
      alert("Failed to update lead. See console for details.");
    }
  };

  // Delete -> DELETE /api/leads/:id
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/leads/${deleteConfirm.id}`);
      setLeads((prev) => prev.filter((l) => l.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete lead:", (err.response && err.response.data) || err.message);
      alert("Failed to delete lead. See console for details.");
    }
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name || "",
      email: lead.email || "",
      company: lead.company || "",
      value: lead.value || 0,
      stage: lead.stage || "New",
      source: lead.source || (sources[1] || "Website"),
      assignedTo: lead.assignedTo || (isAdmin ? "" : user?.fullName || ""),
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  // Drag & drop handlers - update stage on backend
  const handleDragStart = (e, lead) => {
    e.dataTransfer.setData("leadId", lead.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (!leadId) return;

    try {
      const res = await api.put(`/leads/${leadId}`, { stage: newStage });
      const updated = normalizeLead(res.data);
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err) {
      console.error("Failed to update lead stage:", (err.response && err.response.data) || err.message);
      fetchLeads();
      alert("Failed to move lead. See console for details.");
    }
  };

  const getLeadsByStage = (stage) => {
    return filteredLeads.filter((lead) => lead.stage === stage);
  };

  const filteredLeads = leads.filter((lead) => {
    const stageMatch = filters.stage === "All Stages" || lead.stage === filters.stage;
    const sourceMatch = filters.source === "All Sources" || lead.source === filters.source;
    const staffMatch = filters.staff === "All Staff" || lead.assignedTo === filters.staff;
    return stageMatch && sourceMatch && staffMatch;
  });

  const getStageCount = (stage) => getLeadsByStage(stage).length;

  const getStageBorderColor = (stage) => {
    const colors = {
      New: "border-orange-400",
      Contacted: "border-pink-400",
      Deal: "border-pink-500",
      Won: "border-purple-500",
      Lost: "border-gray-400",
    };
    return colors[stage] || "border-gray-400";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Stage options when editing: admin = full list, staff = only Won/Lost
  const editStageOptions = isAdmin ? stages.filter((s) => s !== "All Stages") : ["Won", "Lost"];

  return (
    <div className="flex min-h-screen bg-gray-50 w-screen">
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
                Track and manage your sales pipeline
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "kanban"
                      ? "bg-white text-rose-400 shadow-sm"
                      : "text-gray-500"
                  }`}
                  onClick={() => setViewMode("kanban")}
                >
                  <FaTh className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white text-rose-400 shadow-sm"
                      : "text-gray-500"
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <FaListUl className="w-5 h-5" />
                </button>
              </div>

              {isAdmin && (
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                >
                  <FaPlus className="w-4 h-4" />
                  Add Lead
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
            <div className="flex items-center gap-2 mb-4">
              <FaFilter className="text-[#E50046] w-5 h-5" />
              <h2
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  color: "#E50046",
                }}
              >
                Search & Filter Leads
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stage Dropdown */}
              <div className="relative">
                <div
                  className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                  onClick={() => setIsDropdownOpen(isDropdownOpen === "stage" ? false : "stage")}
                >
                  <span className="text-sm font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    {filters.stage}
                  </span>
                  <FaChevronDown className="ml-2 text-[#E50046]" />
                </div>

                {isDropdownOpen === "stage" && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm">
                    {stages.map((stage) => (
                      <div
                        key={stage}
                        className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
                        style={{ fontFamily: "'Raleway', sans-serif" }}
                        onClick={() => {
                          setFilters({ ...filters, stage });
                          setIsDropdownOpen(false);
                        }}
                      >
                        {stage}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Source Dropdown */}
              <div className="relative">
                <div
                  className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                  onClick={() => setIsDropdownOpen(isDropdownOpen === "source" ? false : "source")}
                >
                  <span className="text-sm font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    {filters.source}
                  </span>
                  <FaChevronDown className="ml-2 text-[#E50046]" />
                </div>

                {isDropdownOpen === "source" && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm max-h-60 overflow-auto">
                    {sources.map((source) => (
                      <div
                        key={source}
                        className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
                        style={{ fontFamily: "'Raleway', sans-serif" }}
                        onClick={() => {
                          setFilters({ ...filters, source });
                          setIsDropdownOpen(false);
                        }}
                      >
                        {source}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Staff Dropdown (only for admin) */}
              {isAdmin ? (
                <div className="relative">
                  <div
                    className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                    onClick={() => setIsDropdownOpen(isDropdownOpen === "staff" ? false : "staff")}
                  >
                    <span className="text-sm font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      {filters.staff}
                    </span>
                    <FaChevronDown className="ml-2 text-[#E50046]" />
                  </div>

                  {isDropdownOpen === "staff" && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm max-h-60 overflow-auto">
                      {staffOptions.map((staff) => (
                        <div
                          key={staff}
                          className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
                          style={{ fontFamily: "'Raleway', sans-serif" }}
                          onClick={() => {
                            setFilters({ ...filters, staff });
                            setIsDropdownOpen(false);
                          }}
                        >
                          {staff}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div />
              )}
            </div>
          </motion.div>

          <div className="w-full px-4 md:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {viewMode === "kanban" ? (
                // Kanban View
                <motion.div
                  key="kanban"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {["New", "Contacted", "Deal", "Won", "Lost"].map((stage, index) => (
                    <motion.div
                      key={stage}
                      className="bg-white rounded-xl p-4 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-base">{stage}</h3>
                        <span className="bg-rose-400 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center">
                          {getStageCount(stage)}
                        </span>
                      </div>

                      <div
                        className="space-y-3"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage)}
                      >
                        <AnimatePresence>
                          {getLeadsByStage(stage).map((lead) => (
                            <motion.div
                              key={lead.id}
                              className={`bg-white rounded-xl p-4 border-l-4 ${getStageBorderColor(
                                stage
                              )} cursor-move shadow-sm hover:shadow-md transition-all duration-200`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead)}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-gray-800 text-sm leading-tight">
                                  {lead.name}
                                </h4>
                                <FaGripVertical className="text-gray-300 cursor-grab active:cursor-grabbing flex-shrink-0 ml-2 text-sm" />
                              </div>

                              <div className="space-y-2 mb-3 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                  <FaBuilding className="text-rose-400 w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{lead.company}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaEnvelope className="text-rose-400 w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{lead.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaDollarSign className="text-rose-400 w-3 h-3 flex-shrink-0" />
                                  <span>${(lead.value || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaUser className="text-rose-400 w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{lead.assignedTo}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <FaShareAlt className="text-rose-400 w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{lead.source || "N/A"}</span>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-3 border-t border-gray-100">
                                <button
                                  className="flex-1 flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-600 py-2 rounded-lg transition-all"
                                  onClick={() => openDetailsModal(lead)}
                                >
                                  <FaEye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  className="flex-1 flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-600 py-2 rounded-lg transition-all"
                                  onClick={() => openEditModal(lead)}
                                >
                                  <FaEnvelope className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(lead)}
                                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                // List View
                <motion.div
                  key="list"
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-rose-100 mt-4 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {filteredLeads.length > 0 ? (
                    <motion.table className="w-full text-sm text-gray-700">
                      <thead className="bg-gradient-to-r from-rose-100 to-pink-50 text-rose-600">
                        <tr>
                          <th className="py-3 px-4 text-left">Lead</th>
                          <th className="py-3 px-4 text-left">Company</th>
                          <th className="py-3 px-4 text-left">Value</th>
                          <th className="py-3 px-4 text-left">Source</th>
                          <th className="py-3 px-4 text-left">Assigned</th>
                          <th className="py-3 px-4 text-left">Stage</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredLeads.map((lead) => {
                          const stageColors = {
                            New: "bg-blue-100 text-blue-600",
                            Contacted: "bg-yellow-100 text-yellow-600",
                            Deal: "bg-purple-100 text-purple-600",
                            Lost: "bg-red-100 text-red-600",
                            Won: "bg-green-100 text-green-600",
                          };

                          const stageClass = stageColors[lead.stage] || "bg-gray-100 text-gray-600";

                          return (
                            <motion.tr
                              key={lead.id}
                              className="border-b border-gray-100 hover:bg-rose-50 transition-all"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-rose-100 text-rose-600 font-semibold text-sm">
                                    {lead.name?.charAt(0)?.toUpperCase() || "?"}
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-base font-semibold text-gray-800 leading-tight">
                                      {lead.name}
                                    </span>

                                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                      <FaEnvelope className="text-rose-400" />
                                      <span>{lead.email}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <FaBuilding className="text-rose-400" />
                                  {lead.company}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <FaDollarSign className="text-rose-400" />
                                  ${(lead.value || 0).toLocaleString()}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <FaBullhorn className="text-rose-400" />
                                  {lead.source || "N/A"}
                                </div>
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <FaUserTie className="text-rose-400" />
                                  <span>{lead.assignedTo}</span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${stageClass}`}>
                                  {lead.stage}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <button className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg" onClick={() => openDetailsModal(lead)}>
                                    <FaEye />
                                  </button>
                                  <button className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg" onClick={() => openEditModal(lead)}>
                                    <FaEdit />
                                  </button>
                                  <button onClick={() => setDeleteConfirm(lead)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg">
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </motion.table>
                  ) : (
                    <div className="p-12 text-center text-gray-500">{loading ? "Loading..." : "No leads found"}</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modals */}
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
                  <div className="text-center pt-8 px-6 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-semibold tracking-wide" style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}>
                      Add New Lead
                    </h2>
                  </div>

                  <form onSubmit={handleAddLead} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { field: "name", label: "Lead Name", icon: <FaUser className="text-rose-400" /> },
                        { field: "email", label: "Email", icon: <FaEnvelope className="text-rose-400" /> },
                        { field: "company", label: "Company", icon: <FaBuilding className="text-rose-400" /> },
                        { field: "value", label: "Value", icon: <FaDollarSign className="text-rose-400" />, type: "number" },
                      ].map(({ field, label, icon, type }, idx) => (
                        <div key={idx}>
                          <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                            {icon}
                            {label}
                          </label>
                          <input
                            type={type || "text"}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                            value={formData[field]}
                            onChange={(e) => setFormData({ ...formData, [field]: type === "number" ? Number(e.target.value) : e.target.value })}
                            placeholder={`Enter ${label.toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[{ field: "stage", label: "Stage", icon: <FaFlag className="text-rose-400" />, options: stages.filter((s) => s !== "All Stages") },
                        { field: "source", label: "Source", icon: <FaBullhorn className="text-rose-400" />, options: sources.filter((s) => s !== "All Sources") }].map(({ field, label, icon, options }, idx) => (
                        <div key={idx}>
                          <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                            {icon} {label}
                          </label>
                          <div className="relative">
                            <div
                              className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                              onClick={() => setOpenDropdown((prev) => (prev === field ? null : field))}
                            >
                              <span className="text-sm font-medium">
                                {formData[field] || `Select ${label}`}
                              </span>
                              <FaChevronDown className="ml-2 text-[#E50046]" />
                            </div>

                            {openDropdown === field && (
                              <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm max-h-60 overflow-auto">
                                {options.map((option) => (
                                  <div
                                    key={option}
                                    className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
                                    onClick={() => {
                                      setFormData({ ...formData, [field]: option });
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
                      ))}
                    </div>

                    {/* Assigned To */}
                    <div>
                      <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                        <FaUser className="text-rose-400" /> Assigned To
                      </label>

                      {isAdmin ? (
                        <div className="relative">
                          <div
                            className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm"
                            onClick={() => setOpenDropdown((prev) => (prev === "assignedTo" ? null : "assignedTo"))}
                          >
                            <span className="text-sm font-medium">{formData.assignedTo || "Select Staff"}</span>
                            <FaChevronDown className="ml-2 text-[#E50046]" />
                          </div>

                          {openDropdown === "assignedTo" && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-sm max-h-60 overflow-auto">
                              {staffOptions
                                .filter((s) => s !== "All Staff")
                                .map((staff) => (
                                  <div
                                    key={staff}
                                    className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all"
                                    onClick={() => {
                                      setFormData({ ...formData, assignedTo: staff });
                                      setOpenDropdown(null);
                                    }}
                                  >
                                    {staff}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
                          value={user?.fullName || ""}
                          readOnly
                        />
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button type="button" className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all" onClick={() => setShowAddModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all">
                        Add Lead
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EDIT MODAL: updated to restrict staff edits to only stage (Won / Lost) and disable other fields */}
          <AnimatePresence>
            {showEditModal && selectedLead && (
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
                  <div className="text-center pt-8 px-6 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-semibold tracking-wide" style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}>
                      Edit Lead
                    </h2>
                  </div>

                  <form onSubmit={handleEditLead} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { field: "name", label: "Lead Name", icon: <FaUser className="text-rose-400" /> },
                        { field: "email", label: "Email", icon: <FaEnvelope className="text-rose-400" /> },
                        { field: "company", label: "Company", icon: <FaBuilding className="text-rose-400" /> },
                        { field: "value", label: "Value", icon: <FaDollarSign className="text-rose-400" />, type: "number" },
                      ].map(({ field, label, icon, type }, idx) => (
                        <div key={idx}>
                          <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                            {icon}
                            {label}
                          </label>
                          <input
                            type={type || "text"}
                            className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none transition-all ${!isAdmin ? "bg-gray-100 border-gray-200 text-gray-600" : "border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"}`}
                            value={formData[field]}
                            onChange={(e) => {
                              if (isAdmin) {
                                setFormData({ ...formData, [field]: type === "number" ? Number(e.target.value) : e.target.value });
                              }
                            }}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            disabled={!isAdmin}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Stage - editable for both admin and staff, but staff only sees Won/Lost */}
                      <div>
                        <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                          <FaFlag className="text-rose-400" /> Stage
                        </label>
                        <div className="relative">
                          <div
                            className={`w-full flex justify-between items-center border-2 rounded-xl px-4 py-2 cursor-pointer ${isAdmin ? "border-[#FDAB9E] bg-[#FFF0BD] text-[#E50046]" : "border-gray-200 bg-white text-gray-700"} shadow-sm`}
                            onClick={() => setIsStageOpen(!isStageOpen)}
                          >
                            <span className="text-sm font-medium">{formData.stage || "Select a stage"}</span>
                            <FaChevronDown className={`ml-2 ${isStageOpen ? "rotate-180" : ""}`} />
                          </div>

                          {isStageOpen && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-md overflow-hidden">
                              {editStageOptions.map((stage) => (
                                <div
                                  key={stage}
                                  className={`px-4 py-2 text-sm ${!isAdmin ? "text-gray-700 hover:bg-gray-100" : "text-[#E50046] hover:bg-[#FDAB9E] hover:text-white"} rounded-lg cursor-pointer transition-all`}
                                  onClick={() => {
                                    // staff and admin can choose from respective options
                                    setFormData({ ...formData, stage });
                                    setIsStageOpen(false);
                                  }}
                                >
                                  {stage}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Source - disabled for staff */}
                      <div>
                        <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                          <FaBullhorn className="text-rose-400" /> Source
                        </label>
                        <div className="relative">
                          <div
                            className={`w-full flex justify-between items-center border-2 rounded-xl px-4 py-2 ${isAdmin ? "cursor-pointer bg-[#FFF0BD] text-[#E50046] border-[#FDAB9E]" : "bg-gray-100 border-gray-200 text-gray-600"}`}
                            onClick={() => { if (isAdmin) setIsSourceOpen(!isSourceOpen); }}
                          >
                            <span className="text-sm font-medium">{formData.source || "Select a source"}</span>
                            <FaChevronDown className={`ml-2 ${isSourceOpen ? "rotate-180" : ""}`} />
                          </div>

                          {isSourceOpen && isAdmin && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-md max-h-60 overflow-auto">
                              {sources.filter((s) => s !== "All Sources").map((source) => (
                                <div key={source} className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all" onClick={() => { setFormData({ ...formData, source }); setIsSourceOpen(false); }}>
                                  {source}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Assigned To (span across) */}
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                          <FaUser className="text-rose-400" /> Assigned To
                        </label>

                        {isAdmin ? (
                          <div className="relative">
                            <div className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 cursor-pointer bg-[#FFF0BD] text-[#E50046] shadow-sm" onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}>
                              <span className="text-sm font-medium">{formData.assignedTo || "Select a staff member"}</span>
                              <FaChevronDown className={`ml-2 ${isAssignDropdownOpen ? "rotate-180" : ""}`} />
                            </div>

                            {isAssignDropdownOpen && (
                              <div className="absolute z-10 w-full mt-2 bg-white border border-[#FDAB9E] rounded-xl shadow-md max-h-60 overflow-auto">
                                {staffOptions.filter((s) => s !== "All Staff").map((staff) => (
                                  <div key={staff} className="px-4 py-2 text-sm text-[#E50046] hover:bg-[#FDAB9E] hover:text-white rounded-lg cursor-pointer transition-all" onClick={() => { setFormData({ ...formData, assignedTo: staff }); setIsAssignDropdownOpen(false); }}>
                                    {staff}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
                            value={user?.fullName || ""}
                            readOnly
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button type="button" className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all" onClick={() => setShowEditModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showDetailsModal && selectedLead && (
              <motion.div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailsModal(false)}>
                <motion.div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#F5E3E0]" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-semibold tracking-wide" style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}>
                      Lead Details
                    </h2>
                    <button className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90" onClick={() => setShowDetailsModal(false)}>
                      <FaTimes />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {[
                      { label: "Lead Name", value: selectedLead.name, icon: <FaUser className="text-rose-400" /> },
                      { label: "Email", value: selectedLead.email, icon: <FaEnvelope className="text-rose-400" /> },
                      { label: "Company", value: selectedLead.company, icon: <FaBuilding className="text-rose-400" /> },
                      { label: "Value", value: `$${(selectedLead.value || 0).toLocaleString()}`, icon: <FaDollarSign className="text-rose-400" /> },
                      { label: "Stage", value: selectedLead.stage, icon: <FaLayerGroup className="text-rose-400" /> },
                      { label: "Source", value: selectedLead.source, icon: <FaLink className="text-rose-400" /> },
                      { label: "Created At", value: formatDate(selectedLead.createdAt || selectedLead.created_at), icon: <FaCalendarAlt className="text-rose-400" /> },
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

                    <div>
                      <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                        <FaUserTie className="text-rose-400" /> Assigned To
                      </label>
                      <div className="text-base text-gray-800 border-2 border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
                        {selectedLead.assignedTo}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                    <button type="button" className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all" onClick={() => setShowDetailsModal(false)}>
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {deleteConfirm && (
              <motion.div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-xl font-semibold mb-4">Delete Lead</h2>
                  <p className="mb-6">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg" onClick={handleDelete}>Delete</button>
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

export default Leads;