import React from "react";
import {
  Search,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Analytics = () => {
  // Dummy Data for Line Chart (Logs analyzed per day)
  const logsData = [
    { day: "Mon", logs: 800 },
    { day: "Tue", logs: 1200 },
    { day: "Wed", logs: 950 },
    { day: "Thu", logs: 1100 },
    { day: "Fri", logs: 1300 },
    { day: "Sat", logs: 900 },
    { day: "Sun", logs: 1500 },
  ];

  // Dummy Data for Pie Chart (Error Severity Distribution)
  const errorData = [
    { name: "Critical", value: 45, color: "#EF4444" },
    { name: "High", value: 30, color: "#F97316" },
    { name: "Medium", value: 15, color: "#F59E0B" },
    { name: "Low", value: 10, color: "#84CC16" },
  ];

  // Table Data
  const endpoints = [
    {
      path: "/api/v1/users/authenticate",
      method: "POST",
      count: "1,204",
      last: "2 min ago",
    },
    {
      path: "/api/v2/payments/process",
      method: "POST",
      count: "982",
      last: "15 min ago",
    },
    {
      path: "/api/v1/inventory/{id}",
      method: "GET",
      count: "753",
      last: "45 min ago",
    },
    {
      path: "/api/v1/orders",
      method: "PUT",
      count: "512",
      last: "1 hour ago",
    },
    {
      path: "/api/v3/reports/generate",
      method: "GET",
      count: "344",
      last: "2 hours ago",
    },
  ];

  return (
    <div className="w-full h-full bg-white ">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-[#0F172A] tracking-[-0.03em]">
              Usage &amp; Metrics
            </h1>
            <p className="text-gray-600 text-base">
              Monitor your usage and analyze key metrics for your projects.
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 h-10 text-sm font-semibold text-black hover:bg-gray-100">
            Last 30 Days
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="flex gap-6">
          {/* Logs Analyzed Chart */}
          <div className="flex-1 flex flex-col gap-2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <p className="text-base font-medium text-[#0F172A]">
              Logs Analyzed Per Day
            </p>
            <p className="text-4xl font-bold">1.2M</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-sm">Last 30 Days</p>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUp size={14} />
                <p className="text-sm font-semibold">+15.2%</p>
              </div>
            </div>

            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logsData} margin={{ top: 10, right: 20 }}>
                  <defs>
                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#06B6D4"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#06B6D4"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="logs"
                    stroke="#06B6D4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorLogs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error Severity Pie */}
          <div className="flex-1 flex flex-col gap-2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <p className="text-base font-medium text-[#0F172A]">
              Error Severity Distribution
            </p>
            <p className="text-4xl font-bold">543 Total</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-sm">Last 30 Days</p>
              <div className="flex items-center gap-1 text-red-600">
                <ArrowDown size={14} />
                <p className="text-sm font-semibold">-2.1%</p>
              </div>
            </div>

            <div className="flex items-center justify-around mt-4">
              <div className="w-52 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={errorData}
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {errorData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-3">
                {errorData.map((e, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: e.color }}
                    ></div>
                    <p className="text-sm text-[#0F172A]">
                      {e.name}{" "}
                      <span className="text-gray-500">({e.value}%)</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div>
          <h2 className="text-[22px] font-bold text-[#0F172A] pt-4 pb-3">
            Top Endpoints Causing Incidents
          </h2>
          <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Endpoint Path</th>
                  <th className="px-6 py-3">HTTP Method</th>
                  <th className="px-6 py-3">Incident Count</th>
                  <th className="px-6 py-3">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-3 font-medium text-[#0F172A]">
                      {ep.path}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-6 py-3">{ep.count}</td>
                    <td className="px-6 py-3">{ep.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
