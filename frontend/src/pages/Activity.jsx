import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilter,
  FaChevronDown,
  FaUser,
  FaCheckCircle,
  FaTags,
  FaPlus,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaCalendar,
  FaFileAlt,
  FaTasks,
  FaThumbsUp,
  FaComment,
  FaThumbtack,
  FaTimes,
  FaRupeeSign,
  FaTrash,
  FaFileCsv,
} from "react-icons/fa";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, "")}/api`,
});

const Activity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState({
    todayLeads: 0,
    closedDeals: 0,
    tasksCompleted: 0,
    totalActivities: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const [filters, setFilters] = useState({
    activityType: "All Types",
    user: "All Staff",
    dateRange: "Last 7 Days",
    openActivityType: false,
    openUser: false,
    openDate: false,
  });

  const [sortBy, setSortBy] = useState("newest");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [staffOptions, setStaffOptions] = useState(["All Staff"]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editActivity, setEditActivity] = useState({
    id: null,
    title: "",
    description: "",
    type: "Lead",
  });

  // UI state specifically for pinned section
  const [pinnedCollapsed, setPinnedCollapsed] = useState(false);

  // export state
  const [exporting, setExporting] = useState(false);

  function getInitials(name = "") {
    return name
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const [newActivity, setNewActivity] = useState({
    type: "Lead",
    title: "",
    description: "",
    user: {
      name: user?.fullName || user?.name || "You",
      initials: getInitials(user?.fullName || user?.name || "You"),
      color: "#F87171",
    },
  });

  const activityTypes = [
    "All Types",
    "Lead",
    "Deal",
    "Task",
    "Email",
    "Call",
    "Meeting",
    "Document",
  ];

  const dateRanges = ["Today", "Last 7 Days", "Last 30 Days", "All Time"];
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const getActivityConfig = (type) => {
    const configs = {
      Lead: {
        icon: FaUser,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        badgeBg: "bg-blue-100",
        badgeText: "text-blue-600",
      },
      Deal: {
        icon: FaRupeeSign,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
        badgeBg: "bg-green-100",
        badgeText: "text-green-600",
      },
      Task: {
        icon: FaCheckCircle,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
        badgeBg: "bg-green-100",
        badgeText: "text-green-600",
      },
      Email: {
        icon: FaEnvelope,
        bgColor: "bg-pink-100",
        iconColor: "text-pink-600",
        badgeBg: "bg-pink-100",
        badgeText: "text-pink-600",
      },
      Call: {
        icon: FaPhone,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        badgeBg: "bg-blue-100",
        badgeText: "text-blue-600",
      },
      Meeting: {
        icon: FaCalendar,
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-600",
      },
      Document: {
        icon: FaFileAlt,
        bgColor: "bg-orange-100",
        iconColor: "text-orange-600",
        badgeBg: "bg-orange-100",
        badgeText: "text-orange-600",
      },
    };
    return configs[type] || configs.Lead;
  };

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    user?.token ||
    "";

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.get("/activities/stats/summary", { headers });
      const data = res.data || {};
      setSummary({
        todayLeads: Number(data.todayLeads ?? 0),
        closedDeals: Number(data.closedDeals ?? 0),
        tasksCompleted: Number(data.tasksCompleted ?? 0),
        totalActivities: Number(data.totalActivities ?? 0),
      });
    } catch (err) {
      console.error("Failed to fetch summary:", err?.response?.data ?? err.message);
      setSummaryError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to load summary cards"
      );
    } finally {
      setSummaryLoading(false);
    }
  }, [user]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.get("/activities", { headers });

      const serverActivities = Array.isArray(res.data?.activities)
        ? res.data.activities
        : [];

      const normalized = serverActivities.map((a) => {
        const config = getActivityConfig(a.type);

        const likesCount =
          typeof a.likesCount === "number"
            ? a.likesCount
            : Array.isArray(a.likes)
            ? a.likes.length
            : 0;

        return {
          id: a._id ?? a.id ?? Date.now() + Math.random(),
          title: a.title ?? "",
          description: a.description ?? "",
          type: a.type ?? "Lead",
          badge: a.type ?? "Lead",
          timestamp: a.timestamp ?? a.createdAt ?? new Date().toISOString(),
          likes: likesCount,
          hasLiked: typeof a.isLikedByUser === "boolean" ? a.isLikedByUser : false,
          comments: Array.isArray(a.comments)
            ? a.comments.map((c) => ({
                text: c.text ?? c,
                user:
                  c && typeof c.user === "object"
                    ? { fullName: c.user.fullName || c.user.name, ...c.user }
                    : typeof c.user === "string"
                    ? c.user
                    : "Unknown",
              }))
            : [],
          isPinned: !!a.isPinned,
          user: {
            fullName: a.user?.fullName || a.user?.name || "Unknown",
            name: a.user?.fullName || a.user?.name || "Unknown",
            initials: getInitials(a.user?.fullName || a.user?.name || "U"),
            color: a.user?.color || "#F87171",
          },
          ...config,
        };
      });

      setActivities(normalized);
    } catch (err) {
      console.error("Failed to fetch activities:", err?.response?.data ?? err.message);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await api.get("/auth/staff", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data?.staff) {
          console.warn("No staff data found in response:", res.data);
          return;
        }

        const uniqueStaff = Array.from(
          new Set(res.data.staff.map((s) => s.fullName))
        );

        setStaffOptions(["All Staff", ...uniqueStaff]);
      } catch (err) {
        console.error(
          "Failed to fetch staff list:",
          err?.response?.data ?? err.message
        );
      }
    };

    if (user?.role === "admin") fetchStaff();
  }, [user]);

  useEffect(() => {
    fetchActivities();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchActivities, fetchSummary]);

  const filteredActivities = activities
    .filter((activity) => {
      const typeMatch =
        filters.activityType === "All Types" ||
        activity.type === filters.activityType;
      const userMatch =
        filters.user === "All Staff" || activity.user.name === filters.user;
      return typeMatch && userMatch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
    });

  // NOTE: keep pinned computed from the canonical (filtered) list by default.
  // If you want pinned to ignore filters, change to activities.filter(...)
  const pinnedActivities = filteredActivities.filter((a) => a.isPinned);
  const regularActivities = filteredActivities.filter((a) => !a.isPinned);

  const handleEditClick = (activity) => {
    setEditActivity({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
    });
    setShowEditModal(true);
    setShowTypeDropdown(false);
  };

  const handleAddActivity = async (e) => {
    e?.preventDefault?.();
    if (!newActivity.title.trim() || !newActivity.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const payload = {
      title: newActivity.title,
      description: newActivity.description,
      type: newActivity.type,
      user: newActivity.user,
    };

    const config = getActivityConfig(newActivity.type);
    const tempActivity = {
      id: Date.now() + Math.random(),
      ...payload,
      ...config,
      badge: newActivity.type,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      isPinned: false,
      hasLiked: false,
    };

    setActivities((prev) => [tempActivity, ...prev]);
    setShowAddModal(false);

    try {
      await api.post("/activities", payload, { headers });
      await fetchActivities();
      await fetchSummary();
    } catch (err) {
      console.error("Failed to add activity:", err?.response?.data ?? err.message);
      setActivities((prev) => prev.filter((a) => a.id !== tempActivity.id));
      alert("Failed to add activity. Please try again.");
    } finally {
      setNewActivity({
        type: "Lead",
        title: "",
        description: "",
        user: {
          name: user?.fullName || user?.name || "You",
          initials: getInitials(user?.fullName || user?.name || "You"),
          color: "#F87171",
        },
      });
    }
  };

  const handleDeleteActivity = async (itemOrId) => {
    const id = itemOrId?.id ?? itemOrId;
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const prev = activities;
    setActivities((p) => p.filter((a) => a.id !== id));
    setShowDeleteConfirm(null);

    try {
      await api.delete(`/activities/${id}`, { headers });
      await fetchSummary();
    } catch (err) {
      console.error("Failed to delete activity:", err?.response?.data ?? err.message);
      setActivities(prev);
      alert("Failed to delete activity. Please try again.");
    }
  };

  const handleLike = async (activityId) => {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              likes: activity.hasLiked ? activity.likes - 1 : activity.likes + 1,
              hasLiked: !activity.hasLiked,
            }
          : activity
      )
    );

    try {
      const res = await api.patch(`/activities/${activityId}/like`, {}, { headers });
      const updated = res.data?.activity;

      if (updated) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === (updated._id ?? updated.id)
              ? {
                  ...a,
                  likes: updated.likesCount,
                  hasLiked: updated.isLikedByUser,
                }
              : a
          )
        );
      }
    } catch (err) {
      console.error("Failed to like activity:", err?.response?.data ?? err.message);
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                likes: activity.hasLiked ? activity.likes - 1 : activity.likes + 1,
                hasLiked: !activity.hasLiked,
              }
            : activity
        )
      );
      alert("Failed to update like. Please try again.");
    }
  };

  const handlePin = async (activityId) => {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // optimistic toggle so UI is responsive
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId ? { ...activity, isPinned: !activity.isPinned } : activity
      )
    );

    try {
      const res = await api.patch(`/activities/${activityId}/pin`, {}, { headers });
      const isPinned = res?.data?.isPinned;

      if (typeof isPinned === "boolean") {
        setActivities((prev) =>
          prev.map((a) => (a.id === activityId ? { ...a, isPinned } : a))
        );
      } else {
        await fetchActivities();
      }
    } catch (err) {
      console.error("Failed to pin activity:", err?.response?.data ?? err.message);
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId ? { ...activity, isPinned: !activity.isPinned } : activity
        )
      );
      alert("Failed to update pin. Please try again.");
    }
  };

  const handleUpdateActivity = async (e) => {
    e?.preventDefault?.();
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const payload = {
      title: editActivity.title,
      description: editActivity.description,
      type: editActivity.type,
    };

    const config = getActivityConfig(editActivity.type);
    setActivities((prev) =>
      prev.map((a) =>
        a.id === editActivity.id
          ? { ...a, ...editActivity, ...config, badge: editActivity.type }
          : a
      )
    );

    setShowEditModal(false);

    try {
      await api.put(`/activities/${editActivity.id}`, payload, { headers });
      await fetchActivities();
      await fetchSummary();
    } catch (err) {
      console.error("Failed to update activity:", err?.response?.data ?? err.message);
      alert("Failed to update activity. Please try again.");
      await fetchActivities();
      await fetchSummary();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedActivity) return;

    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const commentObj = { user: user?.fullName || user?.name || "You", text: newComment };
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === selectedActivity.id
          ? { ...activity, comments: [...activity.comments, commentObj] }
          : activity
      )
    );

    setNewComment("");
    setShowCommentModal(false);
    setSelectedActivity(null);

    try {
      await api.post(`/activities/${selectedActivity.id}/comments`, { text: commentObj.text }, { headers });
      await fetchActivities();
    } catch (err) {
      console.error("Failed to add comment:", err?.response?.data ?? err.message);
      alert("Failed to add comment. Please try again.");
      await fetchActivities();
    }
  };

  const todayLeads = summary.todayLeads ?? 0;
  const closedDeals = summary.closedDeals ?? 0;
  const totalActivities = summary.totalActivities ?? activities.length;
  const tasksCompleted = summary.tasksCompleted ?? 0;

  // -----------------------
  // CSV Export helpers for Activities
  // -----------------------
  const convertToCSV = (objArray) => {
    const array = Array.isArray(objArray) ? objArray : JSON.parse(objArray || "[]");
    if (!array.length) return "";
    const keys = Object.keys(array[0]);
    const header = keys.join(",");
    const rows = array.map((row) =>
      keys
        .map((k) => {
          const cell = row[k] ?? "";
          // Escape double quotes and wrap in quotes
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    return [header, ...rows].join("\r\n");
  };

  const formatTimestamp = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  /**
   * Export CSV for listed activities (filteredActivities).
   * Visible to Admin and Staff.
   */
  const handleExportActivities = async () => {
    const role = (user?.role || "").toLowerCase();
    if (!(role === "admin" || role === "staff")) {
      alert("Export allowed for Admin or Staff only.");
      return;
    }

    if (!filteredActivities || filteredActivities.length === 0) {
      alert("No activities available to export.");
      return;
    }

    setExporting(true);
    try {
      const csvData = filteredActivities.map((a) => ({
        ID: a.id ?? "",
        Type: a.type ?? "",
        Title: a.title ?? "",
        Description: a.description ?? "",
        User: a.user?.fullName || a.user?.name || "",
        Timestamp: formatTimestamp(a.timestamp),
        Likes: a.likes ?? 0,
        CommentsCount: Array.isArray(a.comments) ? a.comments.length : 0,
        IsPinned: a.isPinned ? "Yes" : "No",
      }));

      const csv = convertToCSV(csvData);
      const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activities_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export activities:", err);
      alert("Failed to export activities. See console for details.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-gray-50 overflow-hidden">
      <aside className="sticky top-0 h-screen">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-50 bg-white shadow-sm">
          <Navbar />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* header / add button (unchanged) */}
          <motion.div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-11 ml-6 mt-4 lg:mb-0">
              <h1
                className="text-xl font-semibold tracking-wide"
                style={{
                  color: "#B5828C",
                  fontFamily: "'Raleway', sans-serif",
                }}
              >
                Track and manage your activities
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Monitor CRM updates and interactions effectively
              </p>
            </div>

            <div className="flex items-center gap-3 mr-6">
              {/* Export CSV button - Admin & Staff */}
              {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "staff") && (
                <button
                  onClick={handleExportActivities}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-white border border-rose-200 text-rose-600 px-4 py-2.5 rounded-lg font-medium shadow-sm hover:bg-rose-50 transition-all disabled:opacity-50"
                >
                  <FaFileCsv />
                  {exporting ? "Exporting..." : "Export CSV"}
                </button>
              )}

              <button
                onClick={() => {
                  setNewActivity((prev) => ({
                    ...prev,
                    user: {
                      name: user?.fullName || user?.name || "You",
                      initials: getInitials(user?.fullName || user?.name || "You"),
                      color: prev.user?.color || "#F87171",
                    },
                  }));
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <FaPlus className="w-4 h-4" />
                Add Activity
              </button>
            </div>
          </motion.div>

          {/* summary cards (unchanged) */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Today's Leads */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -6,
                  boxShadow: "0 10px 25px rgba(59,130,246,0.25)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.1,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-white/40 transition-all duration-300"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md">
                    <FaUser className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-extrabold text-blue-700 drop-shadow-sm">
                    {summaryLoading ? "..." : todayLeads}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700 tracking-wide">
                  Today's Leads
                </h4>
                {summaryError && <div className="text-xs text-red-500 mt-2">{summaryError}</div>}
              </motion.div>

              {/* other summary cards omitted here for brevity in reading — same as original */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -6,
                  boxShadow: "0 10px 25px rgba(34,197,94,0.25)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.2,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-white/40 transition-all duration-300"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-md">
                    <FaRupeeSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-extrabold text-green-700 drop-shadow-sm">
                    {summaryLoading ? "..." : closedDeals}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700 tracking-wide">
                  Closed Deals
                </h4>
              </motion.div>

              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -6,
                  boxShadow: "0 10px 25px rgba(147,51,234,0.25)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.3,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-white/40 transition-all duration-300"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-md">
                    <FaCheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-extrabold text-purple-700 drop-shadow-sm">
                    {summaryLoading ? "..." : tasksCompleted}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700 tracking-wide">
                  Tasks Completed
                </h4>
              </motion.div>

              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -6,
                  boxShadow: "0 10px 25px rgba(249,115,22,0.25)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.4,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-white/40 transition-all duration-300"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-md">
                    <FaTasks className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-extrabold text-orange-700 drop-shadow-sm">
                    {summaryLoading ? "..." : totalActivities}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700 tracking-wide">
                  Total Activities
                </h4>
              </motion.div>
            </div>
          </div>

          {/* filters (unchanged) */}
          <div className="px-6 pb-6">
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
                  Filter Activities
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        openActivityType: !prev.openActivityType,
                        openUser: false,
                        openDate: false,
                      }))
                    }
                    className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 bg-[#FFF0BD] text-[#E50046] shadow-sm cursor-pointer"
                  >
                    <span className="text-sm font-medium">{filters.activityType}</span>
                    <FaChevronDown className="ml-2 text-[#E50046]" />
                  </button>

                  {filters.openActivityType && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {activityTypes.map((type) => (
                        <div
                          key={type}
                          onClick={() =>
                            setFilters({
                              ...filters,
                              activityType: type,
                              openActivityType: false,
                            })
                          }
                          className="px-4 py-2 text-gray-700 hover:bg-rose-100 cursor-pointer transition-colors"
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {user.role === "admin" && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          openUser: !prev.openUser,
                          openActivityType: false,
                          openDate: false,
                        }))
                      }
                      className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 bg-[#FFF0BD] text-[#E50046] shadow-sm cursor-pointer"
                    >
                      <span className="text-sm font-medium">{filters.user}</span>
                      <FaChevronDown className="ml-2 text-[#E50046]" />
                    </button>

                    {filters.openUser && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {staffOptions.map((staff) => (
                          <div
                            key={staff}
                            onClick={() =>
                              setFilters({
                                ...filters,
                                user: staff,
                                openUser: false,
                              })
                            }
                            className="px-4 py-2 text-gray-700 hover:bg-rose-100 cursor-pointer transition-colors"
                          >
                            {staff}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        openDate: !prev.openDate,
                        openActivityType: false,
                        openUser: false,
                      }))
                    }
                    className="w-full flex justify-between items-center border-2 border-[#FDAB9E] rounded-xl px-4 py-2 bg-[#FFF0BD] text-[#E50046] shadow-sm cursor-pointer"
                  >
                    <span className="text-sm font-medium">{filters.dateRange}</span>
                    <FaChevronDown className="ml-2 text-[#E50046]" />
                  </button>

                  {filters.openDate && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {dateRanges.map((range) => (
                        <div
                          key={range}
                          onClick={() =>
                            setFilters({
                              ...filters,
                              dateRange: range,
                              openDate: false,
                            })
                          }
                          className="px-4 py-2 text-gray-700 hover:bg-rose-100 cursor-pointer transition-colors"
                        >
                          {range}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Pinned + Recent Activity sections */}
          <div className="px-6 pb-6">
            <motion.div
              className="relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 p-6 transition-all duration-500 hover:shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaTasks className="text-blue-500 drop-shadow-sm" />
                  <span className="tracking-wide">Recent Activity</span>
                </h2>

                {/* pinned collapse toggle + simple legend */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPinnedCollapsed((s) => !s)}
                    className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border bg-white/70 hover:bg-white text-rose-600"
                  >
                    <FaThumbtack className="w-4 h-4" />
                    {pinnedCollapsed ? "Show Pinned" : "Hide Pinned"}
                  </button>
                </div>
              </div>

              {/* Pinned section: visually distinct */}
              {pinnedActivities.length > 0 && !pinnedCollapsed && (
                <section className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-lg font-semibold flex items-center gap-2"
                      style={{
                        color: "#E50046",
                        fontFamily: "'Raleway', sans-serif",
                      }}
                    >
                      {/*  */}
                    </h3>
                  </div>

                  {/* Show pinned items in a highlighted grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pinnedActivities.map((activity, pIndex) => {
                      const Icon = activity.icon;
                      return (
                        <motion.div
                          key={activity.id}
                          whileHover={{ y: -3 }}
                          transition={{ duration: 0.18 }}
                        >
                          <ActivityCard
                            activity={activity}
                            Icon={Icon}
                            index={pIndex}
                            handleLike={handleLike}
                            handlePin={handlePin}
                            setShowCommentModal={setShowCommentModal}
                            setSelectedActivity={setSelectedActivity}
                            setShowDeleteConfirm={setShowDeleteConfirm}
                            handleEditClick={handleEditClick}
                            pinnedView
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  <hr className="my-6 border-gray-200" />
                </section>
              )}

              {loading && (
                <div className="text-center py-6 text-gray-500">Loading activities...</div>
              )}

              {error && (
                <div className="text-center py-6 text-red-500">{error}</div>
              )}

              <div className="space-y-4">
                {regularActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div key={activity.id} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                      <ActivityCard
                        activity={activity}
                        Icon={Icon}
                        index={index}
                        handleLike={handleLike}
                        handlePin={handlePin}
                        setShowCommentModal={setShowCommentModal}
                        setSelectedActivity={setSelectedActivity}
                        setShowDeleteConfirm={setShowDeleteConfirm}
                        handleEditClick={handleEditClick}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {filteredActivities.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <FaTasks className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Activities Found</h3>
                  <p className="text-gray-500">Try adjusting your filters or add a new activity</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add/Edit modal + Comment + Delete modals unchanged (kept as in original) */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setShowTypeDropdown(false);
            }}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#F5E3E0]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center pt-8 px-6 pb-4 border-b border-gray-100">
                <h2
                  className="text-2xl font-semibold tracking-wide"
                  style={{
                    color: "#B5828C",
                    fontFamily: "'Raleway', sans-serif",
                  }}
                >
                  {showAddModal ? "Add New Activity" : "Edit Activity"}
                </h2>
              </div>

              <form
                onSubmit={showAddModal ? handleAddActivity : handleUpdateActivity}
                className="p-6 space-y-6"
              >
                <div className="relative">
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                    <FaTags className="text-rose-400" /> Activity Type
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="w-full flex justify-between items-center border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all bg-white cursor-pointer"
                    >
                      {(showAddModal ? newActivity.type : editActivity.type) || "Select Activity Type"}
                      <FaChevronDown
                        className={`transition-transform duration-300 text-gray-400 ${showTypeDropdown ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {showTypeDropdown && (
                        <motion.ul
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
                        >
                          {activityTypes
                            .filter((t) => t !== "All Types")
                            .map((type) => (
                              <li
                                key={type}
                                onClick={() => {
                                  showAddModal ? setNewActivity({ ...newActivity, type }) : setEditActivity({ ...editActivity, type });
                                  setShowTypeDropdown(false);
                                }}
                                className="px-4 py-2 text-sm hover:bg-rose-50 cursor-pointer transition-all"
                              >
                                {type}
                              </li>
                            ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                    <FaEnvelope className="text-rose-400" /> Title
                  </label>
                  <input
                    type="text"
                    value={showAddModal ? newActivity.title : editActivity.title}
                    onChange={(e) =>
                      showAddModal ? setNewActivity({ ...newActivity, title: e.target.value }) : setEditActivity({ ...editActivity, title: e.target.value })
                    }
                    placeholder="Enter activity title"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                    <FaEnvelope className="text-rose-400" /> Description
                  </label>
                  <textarea
                    value={showAddModal ? newActivity.description : editActivity.description}
                    onChange={(e) =>
                      showAddModal ? setNewActivity({ ...newActivity, description: e.target.value }) : setEditActivity({ ...editActivity, description: e.target.value })
                    }
                    placeholder="Enter activity description"
                    rows="5"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setShowTypeDropdown(false);
                    }}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg text-sm transition-all"
                  >
                    {showAddModal ? "Add Activity" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment modal */}
      <AnimatePresence>
        {showCommentModal && selectedActivity && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCommentModal(false)}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#F5E3E0]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-semibold tracking-wide" style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}>
                  Add Comment
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90"
                  onClick={() => setShowCommentModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 mb-2">{selectedActivity.title}</h3>
                  <p className="text-sm text-gray-600">{selectedActivity.description}</p>
                </div>

                {selectedActivity.comments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2" style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}>
                      Previous Comments:
                    </h4>
                    <div className="space-y-2">
                      {selectedActivity.comments.map((comment, idx) => {
                        const userName =
                          comment && typeof comment.user === "object"
                            ? comment.user.fullName || comment.user.name || "Unknown"
                            : typeof comment.user === "string"
                            ? comment.user
                            : "Unknown";

                        return (
                          <div key={idx} className="bg-[#FFF6F5] border border-[#F5E3E0] p-3 rounded-lg">
                            <span className="font-medium text-gray-800">{userName}:</span>
                            <span className="text-gray-600 ml-2">{comment.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border-2 border-[#F5E3E0] rounded-xl px-4 py-3 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  placeholder="Write your comment..."
                  rows="4"
                />
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button onClick={() => setShowCommentModal(false)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all">
                  Cancel
                </button>
                <button onClick={handleAddComment} className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
                  Add Comment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation (unchanged) */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-semibold tracking-wide" style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}>
                  Confirm Delete
                </h2>
                <button className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90" onClick={() => setShowDeleteConfirm(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-800">{showDeleteConfirm?.title || "this activity"}</strong>?
                  <br />
                  This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowDeleteConfirm(null)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all">
                    Cancel
                  </button>
                  <button onClick={() => handleDeleteActivity(showDeleteConfirm)} className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
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

/*
  ActivityCard
  - Accepts a `pinnedView` boolean prop: when true, card gets a highlighted style
  - This makes pinned items visually distinct (left accent, stronger shadow,
    small "Pinned" ribbon). Regular cards keep the light gray background.
*/
const ActivityCard = ({
  activity,
  Icon,
  index,
  handleLike,
  handlePin,
  setShowCommentModal,
  setSelectedActivity,
  setShowDeleteConfirm,
  handleEditClick,
  pinnedView = false,
}) => {
  // base container classes
  const cardBase = pinnedView
    ? "flex-1 bg-white rounded-xl p-5 shadow-lg border-l-4 border-rose-400 transition-all"
    : "flex-1 bg-gray-50 rounded-xl p-5 hover:shadow-md transition-all duration-300";

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index || 0) * 0.05 }}
    >
      <div className="flex gap-4 items-start relative">
        {/* pinned ribbon */}
        {pinnedView && (
          <div className="absolute -top-3 left-6 flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full border border-rose-100 shadow-sm">
            <FaThumbtack className="text-rose-400 w-4 h-4" />
            <span className="text-xs font-semibold text-rose-600">Pinned</span>
          </div>
        )}

        <div
          className={`flex-shrink-0 w-12 h-12 ${activity.bgColor} rounded-full flex items-center justify-center shadow-md relative z-10`}
        >
          <Icon className={`w-5 h-5 ${activity.iconColor}`} />
        </div>

        <div className={cardBase}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="font-bold text-gray-800 text-lg">{activity.title}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${activity.badgeBg} ${activity.badgeText}`}>
                  {activity.badge}
                </span>
                {/* pinned icon inside card header (redundant with ribbon, but helpful on small screens) */}
                {activity.isPinned && !pinnedView && <FaThumbtack className="text-rose-400 w-4 h-4" />}
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 break-words">{activity.description}</p>

          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ backgroundColor: activity.user.color }}>
                {activity.user.initials}
              </div>
              <span className="text-sm font-medium text-gray-700">{activity.user.fullName || activity.user.name}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaCalendar className="w-3 h-3" />
              <span>
                {new Date(activity.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-200 flex-wrap">
            <button
              onClick={() => handleLike(activity.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activity.hasLiked ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <FaThumbsUp className="w-4 h-4" />
              <span>{activity.likes}</span>
            </button>

            <button
              onClick={() => {
                setSelectedActivity(activity);
                setShowCommentModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              <FaComment className="w-4 h-4" />
              <span>{activity.comments.length}</span>
            </button>

            <button
              onClick={() => handlePin(activity.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activity.isPinned ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <FaThumbtack className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleEditClick(activity)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-rose-100 text-rose-600 hover:bg-rose-200"
              aria-label="Edit activity"
            >
              <FaEdit className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(activity)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>

          {activity.comments.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Comments:</h4>
              <div className="space-y-2">
                {activity.comments.map((comment, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="font-medium text-gray-800">
                      {typeof comment.user === "object" ? comment.user.fullName || comment.user.name || "Unknown" : comment.user}:
                    </span>
                    <span className="text-gray-600">{comment.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Activity;