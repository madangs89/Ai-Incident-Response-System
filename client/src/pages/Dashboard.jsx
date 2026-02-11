import React from "react";

import { useState } from "react";
import { useSelector } from "react-redux";

import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useEffect } from "react";

const Dashboard = () => {
  const keysSlice = useSelector((state) => state.user);
  const [activeIncidents, setActiveIncidents] = useState({
    title: "Active Incidents",
    value: "12",
    change: "+5% vs last 24h",
    changeColor: "text-[#EF4444]",
  });

  const [resolvedIncidents, setResolvedIncidents] = useState({
    title: "Resolved Incidents",
    value: "86",
    change: "-2% vs last 24h",
    changeColor: "text-green-500",
  });

  const [avgResponseTime, setAvgResponseTime] = useState({
    title: "Avg. Response Time",
    value: "5.2 min",
    change: "+1.1% vs last 24h",
    changeColor: "text-green-500",
  });
  const [apiCalls, setApiCalls] = useState({
    title: "API Calls Today",
    value: "1.2M",
    change: "+15% vs last 24h",
    changeColor: "text-green-500",
  });
  const [incidentData, setIncidentData] = useState([
    { day: "Mon", incidents: 210 },
    { day: "Tue", incidents: 320 },
    { day: "Wed", incidents: 290 },
    { day: "Thu", incidents: 370 },
    { day: "Fri", incidents: 450 },
    { day: "Sat", incidents: 380 },
    { day: "Sun", incidents: 420 },
  ]);

  // [{count: 7, attackType: "SQL_INJECTION"}]
  const [securityDistribution, setSecurityDistribution] = useState([]);
  const COLORS = ["#A7F3D0", "#67E8F9", "#22D3EE", "#0EA5E9", "#0284C7"];

  useEffect(() => {
    (async () => {
      if (keysSlice.selectedKey) {
        const activeRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/security-incident/active/count/${keysSlice.selectedKey.split(":")[1]}`,
        );

        if (activeRes.data.success) {
          setActiveIncidents((prev) => ({
            ...prev,
            value: activeRes.data.activeIncidents,
          }));
        }
        const resolvedRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/security-incident/resolved/count/${keysSlice.selectedKey.split(":")[1]}`,
        );

        if (resolvedRes.data.success) {
          setResolvedIncidents((prev) => ({
            ...prev,
            value: resolvedRes.data.resolvedIncidents,
          }));
        }
        const distributionRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/security-incident/distribution/${keysSlice.selectedKey.split(":")[1]}`,
        );
        if (distributionRes.data.success) {
          setSecurityDistribution(distributionRes.data.distribution);
        }
        const weekData = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/security-incident/trend/weekly/${keysSlice.selectedKey.split(":")[1]}`,
        );
        if (weekData.data.success) {
          setIncidentData(weekData.data.data);
        }
      }
    })();
  }, [keysSlice.selectedKey]);

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB]  overflow-hidden flex flex-col gap-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-[#F8FAFC] border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 p-6 flex flex-col gap-2">
          <p className="text-[#64748B] text-sm font-medium">
            {activeIncidents.title}
          </p>
          <p className="text-3xl font-extrabold text-[#0F172A] leading-tight">
            {activeIncidents.value}
          </p>
          {/* <p className={`text-sm font-semibold ${activeIncidents.changeColor}`}>
            {activeIncidents.change}
          </p> */}
        </div>

        <div className="bg-gradient-to-br from-white to-[#F8FAFC] border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 p-6 flex flex-col gap-2">
          <p className="text-[#64748B] text-sm font-medium">
            {resolvedIncidents.title}
          </p>
          <p className="text-3xl font-extrabold text-[#0F172A] leading-tight">
            {resolvedIncidents.value}
          </p>
          {/* <p
            className={`text-sm font-semibold ${resolvedIncidents.changeColor}`}
          >
            {resolvedIncidents.change}
          </p> */}
        </div>

        <div className="bg-gradient-to-br from-white to-[#F8FAFC] border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 p-6 flex flex-col gap-2">
          <p className="text-[#64748B] text-sm font-medium">
            {avgResponseTime.title}
          </p>
          <p className="text-3xl font-extrabold text-[#0F172A] leading-tight">
            {avgResponseTime.value}
          </p>
          <p className={`text-sm font-semibold ${avgResponseTime.changeColor}`}>
            {avgResponseTime.change}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-[#F8FAFC] border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 p-6 flex flex-col gap-2">
          <p className="text-[#64748B] text-sm font-medium">{apiCalls.title}</p>
          <p className="text-3xl font-extrabold text-[#0F172A] leading-tight">
            {apiCalls.value}
          </p>
          <p className={`text-sm font-semibold ${apiCalls.changeColor}`}>
            {apiCalls.change}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Frequency Chart */}
        <div className="bg-gradient-to-br from-white to-[#F8FAFC] border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6">
          <div className="flex flex-col mb-4">
            <p className="text-base font-semibold text-[#0F172A]">
              Incident Frequency Over Time
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[#0F172A]">421</p>
              <p className="text-sm font-semibold text-green-500">+12.5%</p>
            </div>
          </div>

          {/* Real Recharts AreaChart */}
          <div className="w-full h-[260px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={incidentData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorIncidents"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="day"
                  stroke="#94A3B8"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    color: "#0F172A",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#06B6D4"
                  fillOpacity={1}
                  fill="url(#colorIncidents)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Distribution Chart (Pie) */}
        <div className="bg-gradient-to-br from-white to-[#F8FAFC] border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6">
          <p className="text-base font-semibold text-[#0F172A] mb-4">
            Error Distribution by Service
          </p>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={securityDistribution}
                  dataKey="count"
                  nameKey="attackType"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#06B6D4"
                  label={({ name }) => name}
                >
                  {securityDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    color: "#0F172A",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
