import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
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
  FaHandshake,
  FaThumbsUp,
  FaComment,
  FaThumbtack,
  FaTimes,
  FaRupeeSign,
  FaTrash,
} from "react-icons/fa";

const Activity = () => {
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "Lead",
      title: "New Lead Added",
      description: "Sarah Johnson from TechCorp Solutions was added as a new lead",
      user: {
        name: "John Doe",
        initials: "JD",
        color: "#F87171",
      },
      timestamp: "Oct 6, 2025, 3:30 PM",
      icon: FaUser,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      badge: "Lead",
      badgeBg: "bg-blue-100",
      badgeText: "text-blue-600",
      likes: 3,
      comments: [],
      isPinned: false,
      hasLiked: false,
    },
    {
      id: 2,
      type: "Task",
      title: "Task Completed",
      description: "Completed 'Follow up with TechCorp Solutions' task with successful outcome",
      user: {
        name: "John Doe",
        initials: "JD",
        color: "#F87171",
      },
      timestamp: "Oct 6, 2025, 2:15 PM",
      icon: FaCheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      badge: "Task",
      badgeBg: "bg-green-100",
      badgeText: "text-green-600",
      likes: 5,
      comments: [{ user: "Jane Smith", text: "Great work!" }],
      isPinned: true,
      hasLiked: true,
    },
    {
      id: 3,
      type: "Deal",
      title: "Deal Won - $45,000",
      description: "Successfully closed deal with Taylor Consulting for Q4 services package",
      user: {
        name: "Jane Smith",
        initials: "JS",
        color: "#FB923C",
      },
      timestamp: "Oct 6, 2025, 1:00 PM",
      icon: FaRupeeSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      badge: "Deal",
      badgeBg: "bg-green-100",
      badgeText: "text-green-600",
      likes: 12,
      comments: [
        { user: "Admin", text: "Congratulations! 🎉" },
        { user: "John Doe", text: "Amazing!" },
      ],
      isPinned: true,
      hasLiked: true,
    },
  ]);

  const [filters, setFilters] = useState({
    activityType: "All Types",
    user: "All Users",
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editActivity, setEditActivity] = useState({
    id: null,
    title: "",
    description: "",
    type: "Lead",
  });

  const [newActivity, setNewActivity] = useState({
    type: "Lead",
    title: "",
    description: "",
    user: {
      name: "John Doe",
      initials: "JD",
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

  const users = ["All Users", "John Doe", "Jane Smith"];
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

  const filteredActivities = activities
    .filter((activity) => {
      const typeMatch =
        filters.activityType === "All Types" ||
        activity.type === filters.activityType;
      const userMatch =
        filters.user === "All Users" || activity.user.name === filters.user;
      return typeMatch && userMatch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
    });

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

  const handleAddActivity = () => {
    if (!newActivity.title.trim() || !newActivity.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const config = getActivityConfig(newActivity.type);
    const activity = {
      id: Date.now(),
      ...newActivity,
      ...config,
      badge: newActivity.type,
      timestamp: new Date().toLocaleString(),
      likes: 0,
      comments: [],
      isPinned: false,
      hasLiked: false,
    };

    setActivities([activity, ...activities]);
    setShowAddModal(false);
    setNewActivity({
      type: "Lead",
      title: "",
      description: "",
      user: {
        name: "John Doe",
        initials: "JD",
        color: "#F87171",
      },
    });
  };

  const handleDeleteActivity = (itemOrId) => {
    const id = itemOrId?.id ?? itemOrId;
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleLike = (activityId) => {
    setActivities(
      activities.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              likes: activity.hasLiked ? activity.likes - 1 : activity.likes + 1,
              hasLiked: !activity.hasLiked,
            }
          : activity
      )
    );
  };

  const handleUpdateActivity = (e) => {
    e.preventDefault();

    const config = getActivityConfig(editActivity.type);

    setActivities((prev) =>
      prev.map((a) =>
        a.id === editActivity.id
          ? { ...a, ...editActivity, ...config, badge: editActivity.type }
          : a
      )
    );

    setShowEditModal(false);
  };

  const handlePin = (activityId) => {
    setActivities(
      activities.map((activity) =>
        activity.id === activityId
          ? { ...activity, isPinned: !activity.isPinned }
          : activity
      )
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedActivity) return;

    setActivities(
      activities.map((activity) =>
        activity.id === selectedActivity.id
          ? {
              ...activity,
              comments: [
                ...activity.comments,
                { user: "You", text: newComment },
              ],
            }
          : activity
      )
    );

    setNewComment("");
    setShowCommentModal(false);
    setSelectedActivity(null);
  };

  const todayLeads = activities.filter(
    (a) =>
      a.type === "Lead" &&
      new Date(a.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const closedDeals = activities.filter((a) => a.title.includes("Deal Won"))
    .length;

  const totalActivities = activities.length;

  const tasksCompleted = activities.filter((a) =>
    a.title.includes("Task Completed")
  ).length;

  return (
    <div className="flex min-h-screen w-screen bg-gray-50">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 w-full min-h-screen overflow-y-auto">
          {/* Header Section */}
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

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 mr-6 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FaPlus className="w-4 h-4" />
              Add Activity
            </button>
          </motion.div>

          {/* Summary Stats Cards - Full Width with padding */}
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
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110">
                    <FaUser className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-extrabold text-blue-700 drop-shadow-sm">
                    {todayLeads}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700 tracking-wide">
                  Today's Leads
                </h4>
                <motion.div
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-100/40 to-transparent opacity-0 transition duration-300 pointer-events-none"
                />
              </motion.div>

              {/* Closed Deals */}
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
                  <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110">
                    <FaRupeeSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-extrabold text-green-700 drop-shadow-sm">
                    {closedDeals}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700 tracking-wide">
                  Closed Deals
                </h4>
                <motion.div
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-100/40 to-transparent opacity-0 transition duration-300 pointer-events-none"
                />
              </motion.div>

              {/* Tasks Completed */}
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
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110">
                    <FaCheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-extrabold text-purple-700 drop-shadow-sm">
                    {tasksCompleted}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700 tracking-wide">
                  Tasks Completed
                </h4>
                <motion.div
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-100/40 to-transparent opacity-0 transition duration-300 pointer-events-none"
                />
              </motion.div>

              {/* Total Activities */}
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
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110">
                    <FaTasks className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-extrabold text-orange-700 drop-shadow-sm">
                    {totalActivities}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700 tracking-wide">
                  Total Activities
                </h4>
                <motion.div
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-100/40 to-transparent opacity-0 transition duration-300 pointer-events-none"
                />
              </motion.div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 pb-6">
            {/* Filter Section — Styled Same as Notes.jsx */}
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
                  Filter Activities
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Activity Type Dropdown */}
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

                {/* User Dropdown */}
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
                      {users.map((user) => (
                        <div
                          key={user}
                          onClick={() =>
                            setFilters({
                              ...filters,
                              user,
                              openUser: false,
                            })
                          }
                          className="px-4 py-2 text-gray-700 hover:bg-rose-100 cursor-pointer transition-colors"
                        >
                          {user}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Range Dropdown */}
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

          {/* Pinned Activities Section */}
          {pinnedActivities.length > 0 && (
            <div className="px-6 pb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-lg border border-white/40 p-6"
              >
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <FaThumbtack className="text-rose-500 drop-shadow-sm" />
                  <span className="tracking-wide">Pinned Activities</span>
                </h2>

                <div className="space-y-4">
                  {pinnedActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <motion.div
                        key={activity.id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
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
              </motion.div>
            </div>
          )}

          {/* Recent Activity Section */}
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
              </div>

              <div className="space-y-4">
                {regularActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
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

              {filteredActivities.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <FaTasks className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Activities Found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or add a new activity
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add/Edit Activity Modal */}
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
              {/* Header */}
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

              {/* Form */}
              <form
                onSubmit={showAddModal ? handleAddActivity : handleUpdateActivity}
                className="p-6 space-y-6"
              >
                {/* Activity Type */}
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
                      {(showAddModal ? newActivity.type : editActivity.type) ||
                        "Select Activity Type"}
                      <FaChevronDown
                        className={`transition-transform duration-300 text-gray-400 ${
                          showTypeDropdown ? "rotate-180" : ""
                        }`}
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
                                  showAddModal
                                    ? setNewActivity({ ...newActivity, type })
                                    : setEditActivity({ ...editActivity, type });
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

                {/* Title */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                    <FaEnvelope className="text-rose-400" /> Title
                  </label>
                  <input
                    type="text"
                    value={showAddModal ? newActivity.title : editActivity.title}
                    onChange={(e) =>
                      showAddModal
                        ? setNewActivity({ ...newActivity, title: e.target.value })
                        : setEditActivity({ ...editActivity, title: e.target.value })
                    }
                    placeholder="Enter activity title"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
                    <FaEnvelope className="text-rose-400" /> Description
                  </label>
                  <textarea
                    value={
                      showAddModal
                        ? newActivity.description
                        : editActivity.description
                    }
                    onChange={(e) =>
                      showAddModal
                        ? setNewActivity({
                            ...newActivity,
                            description: e.target.value,
                          })
                        : setEditActivity({
                            ...editActivity,
                            description: e.target.value,
                          })
                    }
                    placeholder="Enter activity description"
                    rows="5"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>

                {/* Footer Buttons */}
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

      {/* Comment Modal */}
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
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2
                  className="text-2xl font-semibold tracking-wide"
                  style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}
                >
                  Add Comment
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90"
                  onClick={() => setShowCommentModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 mb-2">
                    {selectedActivity.title}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedActivity.description}</p>
                </div>

                {selectedActivity.comments.length > 0 && (
                  <div className="mb-4">
                    <h4
                      className="font-semibold mb-2"
                      style={{ color: "#B5828C", fontFamily: "'Raleway', sans-serif" }}
                    >
                      Previous Comments:
                    </h4>
                    <div className="space-y-2">
                      {selectedActivity.comments.map((comment, idx) => (
                        <div
                          key={idx}
                          className="bg-[#FFF6F5] border border-[#F5E3E0] p-3 rounded-lg"
                        >
                          <span className="font-medium text-gray-800">
                            {comment.user}:
                          </span>
                          <span className="text-gray-600 ml-2">{comment.text}</span>
                        </div>
                      ))}
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

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  className="px-5 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Add Comment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-800">
                    {showDeleteConfirm?.title || "this activity"}
                  </strong>
                  ?<br />
                  This action cannot be undone.
                </p>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(showDeleteConfirm)}
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

// Activity Card Component
// Activity Card Component (replace the existing ActivityCard in Activity.jsx)
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
}) => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex gap-4 items-start">
        <div
          className={`flex-shrink-0 w-12 h-12 ${activity.bgColor} rounded-full flex items-center justify-center shadow-md relative z-10`}
        >
          <Icon className={`w-5 h-5 ${activity.iconColor}`} />
        </div>

        <div className="flex-1 bg-gray-50 rounded-xl p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="font-bold text-gray-800 text-lg">
                  {activity.title}
                </h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${activity.badgeBg} ${activity.badgeText}`}
                >
                  {activity.badge}
                </span>
                {activity.isPinned && (
                  <FaThumbtack className="text-rose-400 w-4 h-4" />
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 break-words">
            {activity.description}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                style={{ backgroundColor: activity.user.color }}
              >
                {activity.user.initials}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {activity.user.name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaCalendar className="w-3 h-3" />
              <span>{activity.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-200 flex-wrap">
            <button
              onClick={() => handleLike(activity.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activity.hasLiked
                  ? "bg-rose-100 text-rose-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activity.isPinned
                  ? "bg-rose-100 text-rose-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaThumbtack className="w-4 h-4" />
            </button>

            {/* Edit button styled with pink background (same look as pin when active) */}
            <button
              onClick={() => handleEditClick(activity)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-rose-100 text-rose-600 hover:bg-rose-200`}
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
              <h4 className="text-xs font-semibold text-gray-600 mb-2">
                Comments:
              </h4>
              <div className="space-y-2">
                {activity.comments.map((comment, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="font-medium text-gray-800">
                      {comment.user}:
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