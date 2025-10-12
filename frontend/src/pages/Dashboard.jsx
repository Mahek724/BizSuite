import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
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

const Dashboard = () => {
  const cards = [
    {
      title: "Total Leads",
      value: 234,
      icon: <FaUsers />,
      change: "+12.5%",
      changeColor: "text-green-600",
      sub: "from last month",
    },
    {
      title: "Active Clients",
      value: 89,
      icon: <FaUsers />,
      change: "+8.2%",
      changeColor: "text-green-600",
      sub: "from last month",
    },
    {
      title: "Pending Tasks",
      value: 42,
      icon: <FaTasks />,
      change: "-5.4%",
      changeColor: "text-red-600",
      sub: "from last month",
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      icon: <FaChartLine />,
      change: "+3.1%",
      changeColor: "text-green-600",
      sub: "from last month",
    },
  ];

  const pieData = [
    { name: "Contacted", value: 33 },
    { name: "Deal", value: 24 },
    { name: "Won", value: 15 },
    { name: "New", value: 19 },
    { name: "Lost", value: 9 },
  ];
  const pieColors = ["#fcb6a0", "#e99685", "#b27874", "#f3b3a1", "#d8b9b4"];

  const barData = [
    { name: "Website", value: 65 },
    { name: "Social Media", value: 45 },
    { name: "Email", value: 55 },
    { name: "Direct", value: 35 },
  ];

  const lineData = [
    { name: "Jan", value: 45 },
    { name: "Feb", value: 52 },
    { name: "Mar", value: 48 },
    { name: "Apr", value: 62 },
    { name: "May", value: 55 },
    { name: "Jun", value: 68 },
  ];

  // ✅ Added from old code — Recent Activity section
  const recentActivity = [
    {
      name: "John Smith",
      action: "contacted lead",
      target: "ABC Corp",
      time: "5 minutes ago",
    },
    {
      name: "Sarah Johnson",
      action: "completed task",
      target: "Client Onboarding",
      time: "15 minutes ago",
    },
    {
      name: "Mike Davis",
      action: "added note to",
      target: "XYZ Industries",
      time: "1 hour ago",
    },
    {
      name: "Emily Brown",
      action: "moved lead to Won",
      target: "Tech Solutions Ltd",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#fffaf7] text-[#4a2d2a]">
        <Sidebar />

        {/* Right section */}
        <div className="flex-1 flex flex-col">
          {/* ✅ Make Navbar sticky */}
          <div className="sticky top-0 z-50 bg-[#fffaf7]">
            <Navbar />
          </div>

          {/* ✅ Scrollable content area (overflow moved here) */}
          <div className="px-32 py-4 space-y-8 w-full overflow-y-auto">
            

            {/* Rest of your Dashboard content */}

          <h2 className="text-lg font-medium">
            Welcome back! Here's your business overview.
          </h2>

          {/* Top Stat Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {cards.map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 280 }}
                className="bg-white p-3 rounded-2xl shadow-sm border border-[#f1e4e1] w-[115%]"

              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#f8dcd3] text-[#b44d3b] text-2xl p-2 rounded-xl flex items-center justify-center">
                    {card.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{card.title}</span>
                    <span className="text-lg font-bold">{card.value}</span>
                  </div>
                </div>
                <p className={`text-sm mt-1 ${card.changeColor}`}>
                  {card.change}{" "}
                  <span className="text-gray-500">{card.sub}</span>
                </p>
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
              <p className="text-gray-600 text-sm font-medium mb-2">
                Distribution across pipeline stages
              </p>

              <div
                className="flex justify-center items-center"
                style={{ height: 220, marginTop: "-10px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 25, bottom: 0, left: 10 }}>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="55%"
                      cy="45%"
                      outerRadius={80}
                      paddingAngle={2}
                      labelLine={{ strokeWidth: 2 }}
                      label={({ cx, cy, midAngle, outerRadius, percent, name, value }) => {
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
                            {`${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                          </text>
                        );
                      }}
                    >
                      {pieData.map((entry, index) => (
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
              className="bg-white rounded-2xl shadow-sm border border-[#f1e4e1] p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <h3 className="font-semibold text-xl mb-1">Leads by Source</h3>
              <p className="text-gray-600 text-sm font-medium mb-3">
                Where your leads are coming from
              </p>

              <div style={{ width: "100%", height: 230 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={[...barData, { name: "Referral", value: 48 }]}
                    margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3e9e7"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#4a2d2a" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#4a2d2a" }} />
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
                      barSize={28}
                      radius={[8, 8, 0, 0]}
                    />
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
            <p className="text-gray-500 text-sm mb-3 text-center">
              Monthly sales performance
            </p>

            <div
              className="flex justify-center"
              style={{ width: "95%", height: 260, margin: "0 auto" }}
            >
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e9e7" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
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
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ✅ RECENT ACTIVITY SECTION (Added at the bottom) */}
         {/* ✅ RECENT ACTIVITY SECTION (Stylish + Animated) */}
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
    <motion.div
      whileHover={{ scale: 1.1, rotate: 15 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="text-[#b44d3b] text-2xl"
    >
      🕒
    </motion.div>
  </div>

  <div className="relative">
    <motion.div
      className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#f4a79d] to-[#f8d1c9]"
      initial={{ height: 0 }}
      animate={{ height: "100%" }}
      transition={{ duration: 1, ease: "easeOut" }}
    />

    <div className="space-y-5 pl-12">
      {recentActivity.map((item, i) => {
        const initials = item.name
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
            {/* Dot indicator with glow */}
            <div className="absolute left-[-1.05rem] w-3 h-3 rounded-full bg-[#e99685] group-hover:scale-125 group-hover:bg-[#b44d3b] transition-all shadow-sm" />

            {/* Avatar initials */}
            <motion.div
              whileHover={{ rotate: -5 }}
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-[#ffd8cf] to-[#f6b8ac] text-[#7a3a33] shadow-inner"
            >
              {initials}
            </motion.div>

            {/* Text info */}
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#4a2d2a]">
                <span className="text-[#7a3a33]">{item.name}</span>{" "}
                <span className="font-normal text-gray-700">{item.action}</span>{" "}
                <motion.span
                  whileHover={{ color: "#b44d3b" }}
                  className="font-semibold text-[#7a3a33]"
                >
                  {item.target}
                </motion.span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.time}</p>
            </div>

            {/* Animated subtle pulse indicator */}
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-[#b44d3b]"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.5 + i * 0.2,
                ease: "easeInOut",
              }}
            />
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
