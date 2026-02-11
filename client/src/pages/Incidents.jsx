import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Components/Loader";
import { setKeys, setSelectedKey } from "../redux/userSlice";

const severityOptions = [
  { label: "All", value: "" },
  { label: "Critical", value: 5 },
  { label: "High", value: 4 },
  { label: "Medium", value: 3 },
  { label: "Low", value: 2 },
];

const statusOptions = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
];

const Incidents = () => {
  const dispatch = useDispatch();
  const keys = useSelector((state) => state.user.keys);
  const selectedKey = useSelector((state) => state.user.selectedKey);

  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    severity: "",
    status: "",
  });

  const limit = 10;

  /* ======================================
     FETCH INCIDENTS WITH FILTERS
  ======================================= */
  const fetchIncidents = async () => {
    try {
      if (!selectedKey) return;

      setLoading(true);

      const apiKey = selectedKey.split(":")[1];

      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/security-incident`,
        {
          params: {
            apiKey,
            page,
            limit,
            severity: filters.severity,
            status: filters.status,
          },
          withCredentials: true,
        },
      );

      if (data.success) {
        setIncidents(data.incidents);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedKey, page, filters]);

  /* ======================================
     BADGE SYSTEM (NO DYNAMIC TAILWIND BUG)
  ======================================= */
  const severityBadge = (severity) => {
    const map = {
      5: "bg-red-100 text-red-600",
      4: "bg-orange-100 text-orange-600",
      3: "bg-yellow-100 text-yellow-600",
      2: "bg-gray-100 text-gray-600",
    };

    const label =
      severity === 5
        ? "Critical"
        : severity === 4
          ? "High"
          : severity === 3
            ? "Medium"
            : "Low";

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${map[severity]}`}
      >
        {label}
      </span>
    );
  };

  const statusBadge = (status) => {
    if (status === "resolved")
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
          Resolved
        </span>
      );
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
        Open
      </span>
    );
  };



  return (
    <div className="w-full h-full bg-[#F9FAFB] flex flex-col gap-6">
      {/* HEADER */}
      <div className="bg-white border rounded-lg shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0F172A]">Incidents</h1>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-lg px-6 py-3 flex gap-4">
        <select
          value={filters.severity}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, severity: e.target.value }))
          }
          className="border rounded px-3 py-2 text-sm"
        >
          {severityOptions.map((opt) => (
            <option key={opt.label} value={opt.value}>
              Severity: {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          className="border rounded px-3 py-2 text-sm"
        >
          {statusOptions.map((opt) => (
            <option key={opt.label} value={opt.value}>
              Status: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <Loader color="black" size={15} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Attack Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {incidents && incidents.length > 0 ? (
                incidents.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-cyan-50 cursor-pointer transition"
                    onClick={() => setSelectedIncident(item)}
                  >
                    <td className="px-4 py-3">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{item.serviceName}</td>
                    <td className="px-4 py-3">
                      {item.method} {item.endpoint}
                    </td>
                    <td className="px-4 py-3">{item.attackType}</td>
                    <td className="px-4 py-3">
                      {severityBadge(item.severity)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="flex items-center justify-center h-[50vh] bg-[#F9FAFB]">
                      <div className="flex flex-col items-center gap-6 animate-fade-in">
                        <div className="relative">
                          <div className="absolute w-40 h-40 bg-cyan-400/20 rounded-full animate-ping"></div>
                          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-4xl">🛡️</span>
                          </div>
                        </div>
                        <h2 className="text-xl font-bold text-[#0F172A]">
                          No Incidents Found
                        </h2>
                        <p className="text-gray-500 text-sm">
                          Try adjusting filters or wait for new activity.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-3">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2 text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden animate-scale-in">
            {/* HEADER */}
            <div className="border-b p-6 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">
                  {selectedIncident.attackType}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedIncident.method} {selectedIncident.endpoint}
                </p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-500 hover:text-black"
              >
                ✖
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500">Service</p>
                  <p className="font-semibold">
                    {selectedIncident.serviceName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">API Key</p>
                  <p className="font-mono text-xs break-all">
                    {selectedIncident.apiKey}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500">Severity</p>
                  {severityBadge(selectedIncident.severity)}
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  {statusBadge(selectedIncident.status)}
                </div>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Payload Sample</p>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                  {selectedIncident.indicators?.payloadSample}
                </pre>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Request Meta</p>
                <div className="bg-gray-100 p-4 rounded text-xs space-y-1">
                  <div>IP: {selectedIncident.requestMeta?.clientIp}</div>
                  <div>
                    User Agent: {selectedIncident.requestMeta?.userAgent}
                  </div>
                  <div>
                    Path: {selectedIncident.requestMeta?.normalizedPath}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Metrics</p>
                <div className="bg-gray-100 p-4 rounded text-xs">
                  Duration: {selectedIncident.metrics?.durationMs} ms <br />
                  Status Code: {selectedIncident.metrics?.statusCode}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
