import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Loader from "../Components/Loader";

const Info = ({ label, value, mono }) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">{label}</p>
    <p className={`font-semibold break-all ${mono ? "font-mono text-xs" : ""}`}>
      {value || "N/A"}
    </p>
  </div>
);
const Incidents = () => {
  const selectedKey = useSelector((state) => state.user.selectedKey);

  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [loading, setLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    severity: "",
    status: "",
  });

  const limit = 10;

  /* =========================
     FETCH INCIDENTS
  ========================== */
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
        },
      );

      if (data.success) {
        setIncidents(data.incidents);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedKey, page, filters]);

  /* =========================
     BULK RESOLVE
  ========================== */
  const resolveGroup = async () => {
    try {
      setResolveLoading(true);

      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/security-incident/resolve/${selectedIncident._id}`,
      );

      if (data.success) {
        toast.success(`Resolved ${data.updatedCount} incidents`);

        // Update frontend instantly
        setIncidents((prev) =>
          prev.map((item) =>
            item.apiKey === selectedIncident.apiKey &&
            item.endpoint === selectedIncident.endpoint &&
            item.attackType === selectedIncident.attackType
              ? { ...item, status: "resolved" }
              : item,
          ),
        );

        setSelectedIncident((prev) => ({
          ...prev,
          status: "resolved",
        }));
      }
    } catch {
      toast.error("Failed to resolve incidents");
    } finally {
      setResolveLoading(false);
    }
  };

  /* =========================
     BADGES
  ========================== */
  const severityColor = {
    5: "bg-red-100 text-red-600",
    4: "bg-orange-100 text-orange-600",
    3: "bg-yellow-100 text-yellow-600",
    2: "bg-gray-100 text-gray-600",
  };

  const statusColor = {
    open: "bg-blue-100 text-blue-600",
    resolved: "bg-green-100 text-green-600",
  };

  const severityLabel = {
    5: "Critical",
    4: "High",
    3: "Medium",
    2: "Low",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Security Incidents</h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor and manage detected threats
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow-md p-4 flex gap-4 mb-6">
        <select
          value={filters.severity}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, severity: e.target.value }))
          }
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">All Severities</option>
          <option value="5">Critical</option>
          <option value="4">High</option>
          <option value="3">Medium</option>
          <option value="2">Low</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <Loader color="black" size={15} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Endpoint</th>
                <th className="px-6 py-4">Attack</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {incidents.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => setSelectedIncident(item)}
                  className="hover:bg-cyan-50 cursor-pointer transition duration-200"
                >
                  <td className="px-6 py-4">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{item.serviceName}</td>
                  <td className="px-6 py-4">
                    {item.method} {item.endpoint}
                  </td>
                  <td className="px-6 py-4">{item.attackType}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${severityColor[item.severity]}`}
                    >
                      {severityLabel[item.severity]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-white shadow rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-white shadow rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-fade-in">
            {/* HEADER */}
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-start z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedIncident.attackType}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedIncident.method} {selectedIncident.endpoint}
                </p>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-400 hover:text-black text-xl"
              >
                ✖
              </button>
            </div>

            {/* BODY */}
            <div className="p-8 space-y-10 text-sm">
              {/* BASIC INFO */}
              <section>
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <Info label="Service" value={selectedIncident.serviceName} />
                  <Info label="API Key" value={selectedIncident.apiKey} mono />
                  <Info label="Severity" value={selectedIncident.severity} />
                  <Info label="Status" value={selectedIncident.status} />
                  <Info
                    label="Detection Source"
                    value={selectedIncident.detectionSource}
                  />
                  <Info
                    label="Confidence"
                    value={selectedIncident.confidence ?? "N/A"}
                  />
                  <Info
                    label="Signature"
                    value={selectedIncident.signature}
                    mono
                  />
                  <Info
                    label="Occurrences"
                    value={selectedIncident.occurrences}
                  />
                </div>
              </section>

              {/* REQUEST META */}
              <section>
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">
                  Request Metadata
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <Info
                    label="Client IP"
                    value={selectedIncident.requestMeta?.clientIp}
                  />
                  <Info
                    label="User Agent"
                    value={selectedIncident.requestMeta?.userAgent}
                  />
                  <Info
                    label="Normalized Path"
                    value={selectedIncident.requestMeta?.normalizedPath}
                  />
                </div>
              </section>

              {/* INDICATORS */}
              <section>
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">
                  Indicators
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <Info
                    label="Query Params Count"
                    value={selectedIncident.indicators?.queryParamsCount}
                  />
                  <Info
                    label="Is JSON"
                    value={String(selectedIncident.indicators?.isJson)}
                  />
                  <Info
                    label="ML Score"
                    value={selectedIncident.indicators?.mlScore ?? "N/A"}
                  />
                </div>

                <div className="mt-6">
                  <p className="text-gray-500 mb-2">Payload Sample</p>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                    {selectedIncident.indicators?.payloadSample || "No payload"}
                  </pre>
                </div>
              </section>

              {/* METRICS */}
              <section>
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">
                  Metrics
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <Info
                    label="Duration (ms)"
                    value={selectedIncident.metrics?.durationMs}
                  />
                  <Info
                    label="Status Code"
                    value={selectedIncident.metrics?.statusCode}
                  />
                </div>
              </section>

              {/* TIMESTAMPS */}
              <section>
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">
                  Timeline
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <Info
                    label="Created At"
                    value={new Date(
                      selectedIncident.createdAt,
                    ).toLocaleString()}
                  />
                  <Info
                    label="Last Updated"
                    value={new Date(
                      selectedIncident.updatedAt,
                    ).toLocaleString()}
                  />
                </div>
              </section>

              {/* RESOLVE BUTTON */}
              {selectedIncident.status === "open" && (
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={resolveGroup}
                    disabled={resolveLoading}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg hover:opacity-90 transition"
                  >
                    {resolveLoading
                      ? "Resolving..."
                      : "Resolve All Similar Incidents"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
