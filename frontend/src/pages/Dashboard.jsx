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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api",
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
  // summary cards state
    const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalLeads: 0,
    activeClients: 0,
    pendingTasks: 0,
    conversionRate: "0%",
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
  api.get(`/dashboard/summary`, { headers }),
  api.get(`/dashboard/leads-by-stage`, { headers }),
  api.get(`/dashboard/leads-by-source`, { headers }),
  api.get(`/dashboard/sales-trend`, { headers }),
  api.get(`/dashboard/recent-activity`, { headers }),
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
      changes: sdata.changes || {}, // 👈 new line
    });
  }
}
 else {
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
          const recent = recentRes.value.data || [];
          if (mounted) {
            // server already returns array with { name, action, target, time }
            setRecentActivity(Array.isArray(recent) ? recent : []);
          }
        } else {
          console.warn("recent-activity fetch failed:", recentRes.reason);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (mounted) setError(err?.response?.data?.message || err.message || "Failed to load dashboard");
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
  const pieDataToUse = pieData.length ? pieData : [
    { name: "New", value: 1 },
    { name: "Contacted", value: 1 },
    { name: "Deal", value: 1 },
  ];
  const barDataToUse = barData.length ? barData : [
    { name: "Website", value: 1 },
    { name: "Social Media", value: 1 },
  ];
  const lineDataToUse = lineData.length ? lineData : [
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

  return (
  <div className="flex min-h-screen bg-[#fffaf7] text-[#4a2d2a] overflow-hidden">
    {/* Sidebar - stays sticky on the left */}
    <aside className="sticky top-0 h-screen">
      <Sidebar />
    </aside>

    {/* Right section */}
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Navbar - stays sticky on top */}
      <div className="sticky top-0 z-50 bg-[#fffaf7] shadow-sm">
        <Navbar />
        </div>

        <div className="px-6 sm:px-8 md:px-10 lg:px-12 xl:px-14 2xl:px-16 py-6 space-y-8 w-full overflow-y-auto">
          <h2 className="text-lg font-medium">Welcome back! Here's your business overview.</h2>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-600">
              {error}
            </div>
          )}

          {loading && (
            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-100 text-yellow-700">
              Loading dashboard...
            </div>
          )}

          {/* Top Stat Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 xl:gap-14 2xl:gap-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {cards.map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 280 }}
                className="bg-white p-6 rounded-2xl shadow-md border border-[#f1e4e1] w-full min-h-[130px]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#f8dcd3] text-[#b44d3b] text-2xl p-3 rounded-xl flex items-center justify-center">
                    {card.icon}
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700">{card.title}</span>
                      <span className="text-xl font-bold text-gray-900">{card.value}</span>
                    </div>
                  </div>
                </div>

                <div className="flex mt-2">
                  <div className="w-[1.2rem] shrink-0"></div>
                  <p className={`text-sm ${card.changeColor}`}>
                    {card.change} <span className="text-gray-500">{card.sub}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Row 1 - Pie + Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PIE CHART */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-[#f1e4e1] px-6 pt-5 pb-1 overflow-visible"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <h3 className="font-semibold text-xl mb-1">Leads by Stage</h3>
              <p className="text-gray-600 text-sm font-medium mb-2">Distribution across pipeline stages</p>

              <div className="flex justify-center items-center" style={{ height: 220, marginTop: "-10px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 25, bottom: 0, left: 10 }}>
                    <Pie
                      data={pieDataToUse}
                      dataKey="value"
                      nameKey="name"
                      cx="55%"
                      cy="45%"
                      outerRadius={80}
                      paddingAngle={2}
                      labelLine={{ strokeWidth: 2 }}
                      label={({ cx, cy, midAngle, outerRadius, percent, name }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 18;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#4a2d2a"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontSize={12}
                            fontWeight={600}
                          >
                            {`${name}: ${(percent * 100).toFixed(1)}%`}
                          </text>
                        );
                      }}
                    >
                      {pieDataToUse.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <ReTooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "none" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* BAR CHART */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-[#f1e4e1] p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <h3 className="font-semibold text-xl mb-1">Leads by Source</h3>
              <p className="text-gray-600 text-sm font-medium mb-3">Where your leads are coming from</p>

              <div style={{ width: "100%", height: 230 }}>
                <ResponsiveContainer>
                  <BarChart data={barDataToUse} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e9e7" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#4a2d2a" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#4a2d2a" }} />
                    <ReTooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "none" }} />
                    <Bar dataKey="value" fill="#e5907f" barSize={28} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* LINE CHART */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-[#f1e4e1] p-6 mt-8 mx-auto w-[90%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            <h3 className="font-semibold text-lg text-center">Sales Trends</h3>
            <p className="text-gray-500 text-sm mb-3 text-center">Monthly sales performance</p>

            <div className="flex justify-center" style={{ width: "95%", height: 260, margin: "0 auto" }}>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={lineDataToUse}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e9e7" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ReTooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "none" }} />
                  <Line type="monotone" dataKey="value" stroke="#d36f5e" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* RECENT ACTIVITY */}
          <motion.div
            className="bg-white rounded-2xl shadow-md border border-[#f1e4e1] p-6 mt-8 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-xl text-[#4a2d2a]">Recent Activity</h3>
                <p className="text-gray-500 text-sm">Latest updates from your team</p>
              </div>
              <motion.div whileHover={{ scale: 1.1, rotate: 15 }} transition={{ type: "spring", stiffness: 300 }} className="text-[#b44d3b] text-2xl">
                🕒
              </motion.div>
            </div>

            <div className="relative">
              <motion.div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#f4a79d] to-[#f8d1c9]" initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1, ease: "easeOut" }} />

              <div className="space-y-5 pl-12">
                {recentActivity.length === 0 && (
                  <div className="text-sm text-gray-500">No recent activity</div>
                )}
                {recentActivity.map((item, i) => {
                  const initials = (item.name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <motion.div
                      key={i}
                      className="relative flex items-center gap-4 bg-[#fff8f6] hover:bg-[#ffeae3] transition-all duration-300 rounded-xl p-4 shadow-sm hover:shadow-md group"
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
                      <div className="absolute left-[-1.05rem] w-3 h-3 rounded-full bg-[#e99685] group-hover:scale-125 group-hover:bg-[#b44d3b] transition-all shadow-sm" />

                      <motion.div whileHover={{ rotate: -5 }} className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-[#ffd8cf] to-[#f6b8ac] text-[#7a3a33] shadow-inner">
                        {initials}
                      </motion.div>

                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#4a2d2a]">
                          <span className="text-[#7a3a33]">{item.name}</span>{" "}
                          <span className="font-normal text-gray-700">{item.action}</span>{" "}
                          <motion.span whileHover={{ color: "#b44d3b" }} className="font-semibold text-[#7a3a33]">
                            {item.target}
                          </motion.span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo(item.time)}</p>
                      </div>

                      <motion.div className="w-2.5 h-2.5 rounded-full bg-[#b44d3b]" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, ease: "easeInOut" }} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;