import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilter,
  FaChevronDown,
  FaUser,
  FaCheckCircle,
  FaEdit,
  FaStickyNote,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaFileAlt,
  FaTasks,
  FaHandshake,
  FaThumbsUp,
  FaComment,
  FaThumbtack,
  FaTimes,
  FaBell,
  FaDollarSign,
  FaPlus,
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
      icon: FaDollarSign,
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
  });

  const [sortBy, setSortBy] = useState("newest");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [newComment, setNewComment] = useState("");

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
        icon: FaDollarSign,
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

  const handleDeleteActivity = (id) => {
    setActivities(activities.filter((a) => a.id !== id));
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />


        {/* Main Content Area - NO PADDING, FULL WIDTH */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
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
      Track and manage your activities
    </h1>
    <p className="text-gray-500 text-sm mt-1">
      Monitor CRM updates and interactions effectively
    </p>
  </div>

  <button
    onClick={() => setShowAddModal(true)}
    className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
  >
    <FaPlus className="w-4 h-4" />
    Add Activity
  </button>
</motion.div>


          {/* Summary Stats Cards - Full Width with padding */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <FaUser className="w-8 h-8 text-blue-500" />
                  <span className="text-4xl font-bold text-blue-600">
                    {todayLeads}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700">
                  Today's Leads
                </h4>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <FaDollarSign className="w-8 h-8 text-green-500" />
                  <span className="text-4xl font-bold text-green-600">
                    {closedDeals}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700">
                  Closed Deals
                </h4>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <FaCheckCircle className="w-8 h-8 text-purple-500" />
                  <span className="text-4xl font-bold text-purple-600">
                    {tasksCompleted}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700">
                  Tasks Completed
                </h4>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <FaTasks className="w-8 h-8 text-orange-500" />
                  <span className="text-4xl font-bold text-orange-600">
                    {totalActivities}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-700">
                  Total Activities
                </h4>
              </motion.div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 pb-6">
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

  {/* Sort Buttons */}
  <div className="flex items-center gap-3 mb-6 flex-wrap">
    <button
      onClick={() => setSortBy("newest")}
      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-300 ${
        sortBy === "newest"
          ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-md hover:shadow-lg"
          : "bg-[#FFF0BD] border-[#FDAB9E] text-[#E50046] hover:bg-rose-100"
      }`}
    >
      Newest First
    </button>
    <button
      onClick={() => setSortBy("oldest")}
      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-300 ${
        sortBy === "oldest"
          ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-md hover:shadow-lg"
          : "bg-[#FFF0BD] border-[#FDAB9E] text-[#E50046] hover:bg-rose-100"
      }`}
    >
      Oldest First
    </button>
  </div>

  {/* Filters Section */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Activity Type Dropdown */}
    <div className="relative">
      <select
        className="w-full appearance-none border-2 border-[#FDAB9E] rounded-xl px-4 py-2 bg-[#FFF0BD] text-[#E50046] font-medium focus:border-[#E50046] focus:ring-2 focus:ring-rose-100 outline-none cursor-pointer transition-all"
        value={filters.activityType}
        onChange={(e) =>
          setFilters({ ...filters, activityType: e.target.value })
        }
      >
        {activityTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#E50046] pointer-events-none" />
    </div>

    {/* User Dropdown */}
    <div className="relative">
      <select
        className="w-full appearance-none border-2 border-[#FDAB9E] rounded-xl px-4 py-2 bg-[#FFF0BD] text-[#E50046] font-medium focus:border-[#E50046] focus:ring-2 focus:ring-rose-100 outline-none cursor-pointer transition-all"
        value={filters.user}
        onChange={(e) => setFilters({ ...filters, user: e.target.value })}
      >
        {users.map((user) => (
          <option key={user} value={user}>
            {user}
          </option>
        ))}
      </select>
      <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#E50046] pointer-events-none" />
    </div>

    {/* Date Range Dropdown */}
    <div className="relative">
      <select
        className="w-full appearance-none border-2 border-[#FDAB9E] rounded-xl px-4 py-2 bg-[#FFF0BD] text-[#E50046] font-medium focus:border-[#E50046] focus:ring-2 focus:ring-rose-100 outline-none cursor-pointer transition-all"
        value={filters.dateRange}
        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
      >
        {dateRanges.map((range) => (
          <option key={range} value={range}>
            {range}
          </option>
        ))}
      </select>
      <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#E50046] pointer-events-none" />
    </div>
  </div>
</motion.div>

          </div>

          {/* Pinned Activities Section */}
          {pinnedActivities.length > 0 && (
            <div className="px-6 pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <FaThumbtack className="text-rose-400" />
                  Pinned Activities
                </h2>
                <div className="space-y-4">
                  {pinnedActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        Icon={Icon}
                        index={index}
                        handleLike={handleLike}
                        handlePin={handlePin}
                        setShowCommentModal={setShowCommentModal}
                        setSelectedActivity={setSelectedActivity}
                        setShowDeleteConfirm={setShowDeleteConfirm}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* Recent Activity Section */}
          <div className="px-6 pb-6">
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Recent Activity
              </h2>

              <div className="space-y-4">
                {regularActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      Icon={Icon}
                      index={index}
                      handleLike={handleLike}
                      handlePin={handlePin}
                      setShowCommentModal={setShowCommentModal}
                      setSelectedActivity={setSelectedActivity}
                      setShowDeleteConfirm={setShowDeleteConfirm}
                    />
                  );
                })}
              </div>

              {filteredActivities.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTasks className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
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

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">
                  Add New Activity
                </h2>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all hover:rotate-90"
                  onClick={() => setShowAddModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="text-gray-700 font-semibold mb-2 block">
                    Activity Type
                  </label>
                  <div className="relative">
                    <select
                      value={newActivity.type}
                      onChange={(e) =>
                        setNewActivity({ ...newActivity, type: e.target.value })
                      }
                      className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                    >
                      {activityTypes.filter((t) => t !== "All Types").map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-gray-700 font-semibold mb-2 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, title: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                    placeholder="Enter activity title"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-gray-700 font-semibold mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={newActivity.description}
                    onChange={(e) =>
                      setNewActivity({
                        ...newActivity,
                        description: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                    placeholder="Enter activity description"
                    rows="4"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddActivity}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Add Activity
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {showCommentModal && selectedActivity && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCommentModal(false)}
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
                  <h3 className="font-bold text-gray-800 mb-2">
                    {selectedActivity.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedActivity.description}
                  </p>
                </div>

                {selectedActivity.comments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Previous Comments:
                    </h4>
                    <div className="space-y-2">
                      {selectedActivity.comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium text-gray-800">
                            {comment.user}:
                          </span>
                          <span className="text-gray-600 ml-2">
                            {comment.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  placeholder="Write your comment..."
                  rows="4"
                />
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
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
                Are you sure you want to delete this activity? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteActivity(showDeleteConfirm)}
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

// Activity Card Component
const ActivityCard = ({
  activity,
  Icon,
  index,
  handleLike,
  handlePin,
  setShowCommentModal,
  setSelectedActivity,
  setShowDeleteConfirm,
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

            <button
              onClick={() => setShowDeleteConfirm(activity.id)}
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
