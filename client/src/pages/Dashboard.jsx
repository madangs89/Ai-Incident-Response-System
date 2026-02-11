import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
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

const COLORS = ["#A7F3D0", "#67E8F9", "#22D3EE", "#0EA5E9", "#0284C7"];

const Dashboard = () => {
  const keysSlice = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeIncidents, setActiveIncidents] = useState(0);
  const [resolvedIncidents, setResolvedIncidents] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState("0 ms");
  const [totalCallsAnalyzed, setTotalCallsAnalyzed] = useState(0);
  const [apiCalls, setApiCalls] = useState(0);

  const [incidentData, setIncidentData] = useState([]);
  const [securityDistribution, setSecurityDistribution] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!keysSlice.selectedKey) return;

        setLoading(true);
        setError(null);

        const apiKey = keysSlice.selectedKey.split(":")[1];
        const base = import.meta.env.VITE_BACKEND_URL;

        const [
          activeRes,
          resolvedRes,
          distributionRes,
          weekRes,
          avgRes,
          totalApiCalls,
        ] = await Promise.all([
          axios.get(`${base}/api/security-incident/active/count/${apiKey}`),
          axios.get(`${base}/api/security-incident/resolved/count/${apiKey}`),
          axios.get(`${base}/api/security-incident/distribution/${apiKey}`),
          axios.get(`${base}/api/security-incident/trend/weekly/${apiKey}`),
          axios.get(`${base}/api/metric/average-response/${apiKey}`),
          axios.get(`${base}/api/metric/today/total/${apiKey}`),
        ]);

        setActiveIncidents(activeRes.data.activeIncidents || 0);
        setResolvedIncidents(resolvedRes.data.resolvedIncidents || 0);
        setSecurityDistribution(distributionRes.data.distribution || []);
        setIncidentData(weekRes.data.data || []);
        setAvgResponseTime(`${avgRes.data.averageResponseTime || 0} ms`);
        setTotalCallsAnalyzed(avgRes.data.totalCalls || 0);
        setApiCalls(totalApiCalls.data.totalApiCallsToday || 0);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [keysSlice.selectedKey]);

  const noIncidents =
    activeIncidents === 0 &&
    resolvedIncidents === 0 &&
    securityDistribution.length === 0;

  /* =========================
     EMPTY STATE UI
  ========================== */
  if (!loading && noIncidents) {
    return (
      <div className="w-full h-[60vh] overflow-hidden flex items-center justify-center bg-[#F9FAFB]">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">📡</div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
            Waiting for Activity
          </h2>
          <p className="text-gray-500 text-sm">
            Once your APIs start receiving traffic, insights and incidents will
            appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] flex flex-col gap-8">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-pulse text-lg font-semibold text-[#0F172A]">
            Loading Dashboard...
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-md">{error}</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Active Incidents", value: activeIncidents },
          { title: "Resolved Incidents", value: resolvedIncidents },
          { title: "Avg. Response Time", value: avgResponseTime },
          { title: "API Calls Today", value: apiCalls },
        ].map((card, index) => (
          <div
            key={index}
            className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 transition ${
              loading ? "animate-pulse" : ""
            }`}
          >
            <p className="text-[#64748B] text-sm font-medium">{card.title}</p>
            <p className="text-3xl font-extrabold text-[#0F172A]">
              {card.value}
            </p>
            {card.title === "Avg. Response Time" && (
              <p className="text-sm text-gray-500 mt-1">
                {totalCallsAnalyzed} API calls analyzed
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Trend */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-base font-semibold text-[#0F172A] mb-4">
            Incident Frequency Over Time
          </p>

          {incidentData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-gray-400">
              No incident trend data available
            </div>
          ) : (
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incidentData}>
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
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stroke="#06B6D4"
                    fill="url(#colorIncidents)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-base font-semibold text-[#0F172A] mb-4">
            Incident Distribution
          </p>

          {securityDistribution.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-gray-400">
              No attack data available
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={securityDistribution}
                    dataKey="count"
                    nameKey="attackType"
                    outerRadius={100}
                  >
                    {securityDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
