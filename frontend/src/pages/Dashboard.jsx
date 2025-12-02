import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { FaUsers, FaTasks, FaChartLine } from "react-icons/fa";
import useAISummary from "../hooks/useAISummary";
import AISummaryBox from "../components/AISummaryCard";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL?.replace(/\/$/, "")}/api`,
});

const DASHBOARD_BASE = "/api/dashboard"; // make sure your backend mounts the router at /api/dashboard

const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // adjust if you store token with a different key
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // summary cards state
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalLeads: 0,
    activeClients: 0,
    pendingTasks: 0,
    conversionRate: "0%",
    changes: {},
  });

  // chart data states
  const [pieData, setPieData] = useState([]);
  const [pieColors, setPieColors] = useState([
    "#fcb6a0",
    "#e99685",
    "#b27874",
    "#f3b3a1",
    "#d8b9b4",
  ]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityLoading, setActivityLoading] = useState(false);
  const RECENT_ACTIVITY_LIMIT = 6; // keep same as backend default

  const {
    summary: aiSummary,
    loading: aiLoading,
    generateSummary,
    closeSummary,
  } = useAISummary();

  // loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch all dashboard data
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = getAuthHeaders();

        const [
          summaryRes,
          stageRes,
          sourceRes,
          trendRes,
          recentRes,
        ] = await Promise.allSettled([
          api.get("/dashboard/summary", { headers }),
          api.get("/dashboard/leads-by-stage", { headers }),
          api.get("/dashboard/leads-by-source", { headers }),
          api.get("/dashboard/sales-trend", { headers }),
          api.get("/dashboard/recent-activity", { headers }),
        ]);

        // SUMMARY
        if (summaryRes.status === "fulfilled") {
          const sdata = summaryRes.value.data || {};
          if (mounted) {
            setSummary({
              totalLeads: sdata.totalLeads ?? 0,
              activeClients: sdata.activeClients ?? 0,
              pendingTasks: sdata.pendingTasks ?? 0,
              conversionRate: sdata.conversionRate ?? "0%",
              changes: sdata.changes || {},
            });
          }
        } else {
          console.warn("summary fetch failed:", summaryRes.reason);
        }

        // PIE - leads by stage
        if (stageRes.status === "fulfilled") {
          const stages = stageRes.value.data || [];
          if (mounted) {
            // ensure format [{name, value}]
            setPieData(
              Array.isArray(stages)
                ? stages.map((s) => ({ name: s.name, value: s.value }))
                : []
            );
          }
        } else {
          console.warn("leads-by-stage fetch failed:", stageRes.reason);
        }

        // BAR - leads by source
        if (sourceRes.status === "fulfilled") {
          const sources = sourceRes.value.data || [];
          if (mounted) {
            setBarData(Array.isArray(sources) ? sources : []);
          }
        } else {
          console.warn("leads-by-source fetch failed:", sourceRes.reason);
        }

        // LINE - sales trend
        if (trendRes.status === "fulfilled") {
          const trend = trendRes.value.data || [];
          if (mounted) {
            setLineData(Array.isArray(trend) ? trend : []);
          }
        } else {
          console.warn("sales-trend fetch failed:", trendRes.reason);
        }

        // RECENT ACTIVITY
        if (recentRes.status === "fulfilled") {
          const recentData = recentRes.value.data || {};
          if (mounted) {
            // server returns { total, page, totalPages, recent: [...] }
            setRecentActivity(Array.isArray(recentData.recent) ? recentData.recent : []);
            setActivityTotalPages(recentData.totalPages || 1);
            setActivityPage(recentData.page || 1);
          }
        } else {
          console.warn("recent-activity fetch failed:", recentRes.reason);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (mounted)
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load dashboard"
          );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      mounted = false;
    };
  }, []);

  // fallback cards while loading or on error
  const cards = [
    {
      title: "Total Leads",
      value: summary.totalLeads,
      icon: <FaUsers />,
      change: `${summary.changes?.leadsChange ?? 0}%`,
      changeColor:
        (summary.changes?.leadsChange ?? 0) >= 0
          ? "text-green-600"
          : "text-red-600",
      sub: "from last month",
    },
    {
      title: "Active Clients",
      value: summary.activeClients,
      icon: <FaUsers />,
      change: `${summary.changes?.clientsChange ?? 0}%`,
      changeColor:
        (summary.changes?.clientsChange ?? 0) >= 0
          ? "text-green-600"
          : "text-red-600",
      sub: "from last month",
    },
    {
      title: "Pending Tasks",
      value: summary.pendingTasks,
      icon: <FaTasks />,
      change: `${summary.changes?.tasksChange ?? 0}%`,
      changeColor:
        (summary.changes?.tasksChange ?? 0) >= 0
          ? "text-green-600"
          : "text-red-600",
      sub: "from last month",
    },
    {
      title: "Conversion Rate",
      value: summary.conversionRate,
      icon: <FaChartLine />,
      change: "+3.1%", // keep static or calculate similar way if needed
      changeColor: "text-green-600",
      sub: "from last month",
    },
  ];

  // safe chart data defaults
  const pieDataToUse = pieData.length
    ? pieData
    : [
        { name: "New", value: 1 },
        { name: "Contacted", value: 1 },
        { name: "Deal", value: 1 },
      ];
  const barDataToUse = barData.length
    ? barData
    : [
        { name: "Website", value: 1 },
        { name: "Social Media", value: 1 },
      ];
  const lineDataToUse = lineData.length
    ? lineData
    : [
        { name: "Jan", value: 0 },
        { name: "Feb", value: 0 },
        { name: "Mar", value: 0 },
        { name: "Apr", value: 0 },
        { name: "May", value: 0 },
        { name: "Jun", value: 0 },
        { name: "July", value: 0 },
        { name: "Aug", value: 0 },
        { name: "Sept", value: 0 },
        { name: "Oct", value: 0 },
        { name: "Nov", value: 0 },
        { name: "Dec", value: 0 },
      ];

  const handleGenerateAI = () => {
    const payload = {
      summaryData: summary,
      leadsByStage: pieData,
      leadsBySource: barData,
      salesTrend: lineData,
      recentActivity: recentActivity,
    };

    generateSummary(payload);
  };

  // handle page change for recent activity
  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > activityTotalPages || activityLoading) return;

    setActivityLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await api.get(`/dashboard/recent-activity?page=${newPage}&limit=${RECENT_ACTIVITY_LIMIT}`, { headers });

      const data = response.data || {};
      setRecentActivity(Array.isArray(data.recent) ? data.recent : []);
      setActivityPage(data.page || newPage);
      setActivityTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching activity page:", err);
      // Optionally show error to user
    } finally {
      setActivityLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#fffaf7] text-[#4a2d2a] overflow-hidden">
      {/* Sidebar - stays sticky on the left */}
      <aside className={`fixed lg:static top-0 left-0 h-screen z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:block`}>
        <Sidebar isSidebarOpen={isMobileMenuOpen} />
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Right section */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <div className="sticky top-0 z-50 bg-[#fffaf7] shadow-sm">
          <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        </div>

        <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 py-4 sm:py-6 space-y-6 sm:space-y-8 w-full overflow-y-auto">
          <h2 className="text-base sm:text-lg font-medium">
            Welcome back! Here's your business overview.
          </h2>

          <AISummaryBox
            summary={aiSummary}
            loading={aiLoading}
            onGenerate={handleGenerateAI}
            onClose={closeSummary}
          />

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm">
              Loading dashboard...
            </div>
          )}

          {/* Top Stat Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {cards.map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 280 }}
                className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl shadow-md border border-[#f1e4e1] w-full min-h-[120px] sm:min-h-[130px]"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-[#f8dcd3] text-[#b44d3b] text-xl sm:text-2xl p-2 sm:p-3 rounded-xl flex items-center justify-center shrink-0">
                    {card.icon}
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">
                        {card.title}
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        {card.value}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex mt-2">
                  <div className="w-[1.2rem] shrink-0 hidden sm:block"></div>
                  <p className={`text-xs sm:text-sm ${card.changeColor}`}>
                    {card.change}{" "}
                    <span className="text-gray-500">{card.sub}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Row 1 - Pie + Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* PIE CHART */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-[#f1e4e1] px-4 sm:px-6 pt-4 sm:pt-5 pb-1 overflow-visible"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <h3 className="font-semibold text-lg sm:text-xl mb-1">
                Leads by Stage
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
                Distribution across pipeline stages
              </p>

              <div
                className="flex justify-center items-center"
                style={{
                  height: window.innerWidth < 640 ? 200 : 220,
                  marginTop: "-10px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart
                    margin={{
                      top: 5,
                      right: window.innerWidth < 640 ? 15 : 25,
                      bottom: 0,
                      left: window.innerWidth < 640 ? 5 : 10,
                    }}
                  >
                    <Pie
                      data={pieDataToUse}
                      dataKey="value"
                      nameKey="name"
                      cx="55%"
                      cy="45%"
                      outerRadius={window.innerWidth < 640 ? 60 : 80}
                      paddingAngle={2}
                      labelLine={{ strokeWidth: 2 }}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        outerRadius,
                        percent,
                        name,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          outerRadius + (window.innerWidth < 640 ? 12 : 18);
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#4a2d2a"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontSize={window.innerWidth < 640 ? 10 : 12}
                            fontWeight={600}
                          >
                            {`${name}: ${(percent * 100).toFixed(1)}%`}
                          </text>
                        );
                      }}
                    >
                      {pieDataToUse.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <ReTooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* BAR CHART */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-[#f1e4e1] p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <h3 className="font-semibold text-lg sm:text-xl mb-1">
                Leads by Source
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                Where your leads are coming from
              </p>

              <div
                style={{
                  width: "100%",
                  height: window.innerWidth < 640 ? 200 : 230,
                }}
              >
                <ResponsiveContainer>
                  <BarChart
                    data={barDataToUse}
                    margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3e9e7"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: window.innerWidth < 640 ? 10 : 12,
                        fill: "#4a2d2a",
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: window.innerWidth < 640 ? 10 : 12,
                        fill: "#4a2d2a",
                      }}
                    />
                    <ReTooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        border: "none",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#e5907f"
                      barSize={window.innerWidth < 640 ? 20 : 28}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* LINE CHART */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-[#f1e4e1] p-4 sm:p-6 mt-6 sm:mt-8 mx-auto w-full lg:w-[95%] xl:w-[90%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            <h3 className="font-semibold text-base sm:text-lg text-center">
              Sales Trends
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 text-center">
              Monthly sales performance
            </p>

            <div
              className="flex justify-center"
              style={{
                width: window.innerWidth < 640 ? "100%" : "95%",
                height: window.innerWidth < 640 ? 220 : 260,
                margin: "0 auto",
              }}
            >
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={lineDataToUse}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e9e7" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      border: "none",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#d36f5e"
                    strokeWidth={window.innerWidth < 640 ? 2 : 3}
                    dot={{ r: window.innerWidth < 640 ? 3 : 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* RECENT ACTIVITY */}
          <motion.div
            className="bg-white rounded-2xl shadow-md border border-[#f1e4e1] p-4 sm:p-6 mt-6 sm:mt-8 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg sm:text-xl text-[#4a2d2a]">
                  Recent Activity
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Latest updates from your team
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-[#b44d3b] text-xl sm:text-2xl"
              >
                🕒
              </motion.div>
            </div>

            <div className="relative">
              <motion.div
                className="absolute left-3 sm:left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#f4a79d] to-[#f8d1c9]"
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 1, ease: "easeOut" }}
              />

              <div className="space-y-3 sm:space-y-5 pl-8 sm:pl-12">
                {activityLoading ? (
                  <div className="text-xs sm:text-sm text-gray-500">
                    Loading activities...
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-xs sm:text-sm text-gray-500">
                    No recent activity
                  </div>
                ) : (
                  recentActivity.map((item, i) => {
                    const initials = (item.name || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <motion.div
                        key={i}
                        className="relative flex items-center gap-3 sm:gap-4 bg-[#fff8f6] hover:bg-[#ffeae3] transition-all duration-300 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.35 + i * 0.15,
                          duration: 0.6,
                          type: "spring",
                          stiffness: 150,
                        }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="absolute left-[-0.85rem] sm:left-[-1.05rem] w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#e99685] group-hover:scale-125 group-hover:bg-[#b44d3b] transition-all shadow-sm" />

                        <motion.div
                          whileHover={{ rotate: -5 }}
                          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold bg-gradient-to-br from-[#ffd8cf] to-[#f6b8ac] text-[#7a3a33] shadow-inner shrink-0"
                        >
                          {initials}
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-[#4a2d2a] break-words">
                            <span className="text-[#7a3a33]">{item.name}</span>{" "}
                            <span className="font-normal text-gray-700">
                              {item.action}
                            </span>{" "}
                            <motion.span
                              whileHover={{ color: "#b44d3b" }}
                              className="font-semibold text-[#7a3a33]"
                            >
                              {item.target}
                            </motion.span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {timeAgo(item.time)}
                          </p>
                        </div>

                        <motion.div
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#b44d3b] shrink-0"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5 + i * 0.2,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Pagination Controls */}
              {activityTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-[#f1e4e1]">
                  <button
                    onClick={() => handlePageChange(activityPage - 1)}
                    disabled={activityPage <= 1 || activityLoading}
                    className="px-3 py-1 text-sm bg-[#f8dcd3] text-[#b44d3b] rounded-md hover:bg-[#e99685] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: activityTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={activityLoading}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          page === activityPage
                            ? "bg-[#b44d3b] text-white"
                            : "bg-[#f8dcd3] text-[#b44d3b] hover:bg-[#e99685] hover:text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(activityPage + 1)}
                    disabled={activityPage >= activityTotalPages || activityLoading}
                    className="px-3 py-1 text-sm bg-[#f8dcd3] text-[#b44d3b] rounded-md hover:bg-[#e99685] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;