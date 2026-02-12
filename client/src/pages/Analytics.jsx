import React, { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";
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
import { useSelector } from "react-redux";
import AnalyticsModal from "../Components/AnalyticsModal";

const Analytics = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const keysSlice = useSelector((state) => state.user);

  /* =========================
     STATIC INCIDENT DATA
  ========================== */
  const [endpoints, setEndpoints] = useState([]);

  /* =========================
     CHART DATA
  ========================== */
  const [logsData, setLogsData] = useState([
    { day: "Mon", logs: 800 },
    { day: "Tue", logs: 1200 },
    { day: "Wed", logs: 950 },
    { day: "Thu", logs: 1100 },
    { day: "Fri", logs: 1300 },
    { day: "Sat", logs: 900 },
    { day: "Sun", logs: 1500 },
  ]);

  const errorData = [
    { name: "Critical", value: 45, color: "#EF4444" },
    { name: "High", value: 30, color: "#F97316" },
    { name: "Medium", value: 15, color: "#F59E0B" },
    { name: "Low", value: 10, color: "#84CC16" },
  ];

  useEffect(() => {
    (async () => {
      if (keysSlice.selectedKey) {
        const apiKey = keysSlice.selectedKey.split(":")[1];
        const base = import.meta.env.VITE_BACKEND_URL;

        const allIncidentsRes = await axios.get(
          `${base}/api/incident/get-incidents/${apiKey}`,
          {
            withCredentials: true,
          },
        );

        setEndpoints(allIncidentsRes.data.data || []);
        console.log("Fetched all incidents:", allIncidentsRes.data);

        const logDateWise = await axios.get(`${base}/api/log/trend/${apiKey}`, {
          withCredentials: true,
        });

        if (logDateWise.data.success) {
          setLogsData(logDateWise.data.data);
        }
      }
    })();
  }, [keysSlice.selectedKey]);

  return (
    <div className="w-full bg-white p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-[#0F172A]">
            Usage & Metrics
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor your usage and analyze key metrics.
          </p>
        </div>

        {/* CHART SECTION */}
        <div className="flex gap-6">
          {/* Area Chart */}
          <div className="flex-1 p-6 bg-white border rounded-xl shadow-sm">
            <p className="text-lg font-semibold">Logs Analyzed</p>
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logsData}>
                  <Area
                    type="monotone"
                    dataKey="logs"
                    stroke="#06B6D4"
                    fill="#06B6D4"
                    fillOpacity={0.2}
                  />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}

          <div className="flex items-center justify-around mt-4">
            {" "}
            <div className="w-52 h-52">
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <PieChart>
                  {" "}
                  <Pie
                    data={errorData}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {" "}
                    {errorData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}{" "}
                  </Pie>{" "}
                </PieChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
            <div className="flex flex-col gap-3">
              {" "}
              {errorData.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  {" "}
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: e.color }}
                  ></div>{" "}
                  <p className="text-sm text-[#0F172A]">
                    {" "}
                    {e.name}{" "}
                    <span className="text-gray-500">({e.value}%)</span>{" "}
                  </p>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        </div>

        {/* TABLE */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Top Endpoints Causing Incidents
          </h2>

          <div className="border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Endpoint</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Occurrences</th>
                  <th className="px-6 py-3">Last Seen</th>
                </tr>
              </thead>

              <tbody>
                {endpoints.map((ep) => (
                  <tr
                    key={ep._id}
                    className="border-t hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setSelectedIncident(ep)}
                  >
                    <td className="px-6 py-4 font-medium">{ep?.endpoint}</td>
                    <td className="px-6 py-4">
                      {ep?.metadata?.method || "N/A"}
                    </td>
                    <td className="px-6 py-4">{ep?.occurrences}</td>
                    <td className="px-6 py-4">{ep?.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedIncident && (
        <AnalyticsModal
          selectedIncident={selectedIncident}
          setSelectedIncident={setSelectedIncident}
        />
      )}
    </div>
  );
};

/* =========================
   REUSABLE INFO COMPONENT
========================== */
const Info = ({ label, value, mono }) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">{label}</p>
    <p className={`${mono ? "font-mono text-xs" : "font-semibold"}`}>{value}</p>
  </div>
);

export default Analytics;
