import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Loader from "../Components/Loader";

const Incidents = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainLoading, setMainLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);

  const [aiRes, setAiRes] = useState({});

  const selectedKey = useSelector((state) => state.user.selectedKey);

  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    if (selectedKey) {
      (async () => {
        try {
          setMainLoading(true);
          let key = selectedKey.split(":")[1];
          const { data } = await axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/incident/get-incidents/${key}`,
            {
              withCredentials: true,
            }
          );
          console.log(data);
          if (data.success) {
            setIncidents(data.data);
          }
        } catch (error) {
          toast.error("Unable to fetch incidents");
        } finally {
          setMainLoading(false);
        }
      })();
    }
  }, [selectedKey]);

  useEffect(() => {
    console.log(selectedIncident);

    if (selectedIncident?._id) {
      (async () => {
        try {
          const aiAnalysisId = selectedIncident?._id;
          if (aiAnalysisId) {
            setLoading(true);
            const aiData = await axios.get(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/api/ai/get-ai/${aiAnalysisId}`,
              {
                withCredentials: true,
              }
            );
            setAiRes(aiData.data.data);
          }
        } catch (error) {
          console.log(error);
          toast.error("Unable to fetch ai analysis");
          setAiRes({
            aiModel: "",
            rootCause: "Unable to fetch root cause",
            fixSuggestion: "Unable to fetch fix suggestion",
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [selectedIncident]);

  const getBadge = (label, color) => (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-${color}-500/10 px-2 py-1 text-xs font-medium text-${color}-600`}
    >
      <div className={`size-1.5 rounded-full bg-${color}-500`}></div>
      {label}
    </div>
  );

  const markIncidentAsResolved = async (incidentId) => {
    try {
      setRevokeLoading(true);
      const { data } = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/incident/mark-incident-solved/${incidentId}`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log(data);

      if (data.success) {
        setSelectedIncident((prev) => {
          return { ...prev, status: "solved" };
        });

        setIncidents((prev) => {
          return prev.map((inc) => {
            if (inc._id === incidentId) {
              return { ...inc, status: "solved" };
            } else {
              return inc;
            }
          });
        });
      }
    } catch (error) {
      toast.error("Unable to mark incident as resolved");
    } finally {
      setRevokeLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-4">
        <h1 className="text-2xl font-bold text-[#0F172A]">Incidents</h1>
        <button className="flex items-center justify-center rounded-lg bg-gradient-to-b from-gray-900 to-black text-white text-sm font-semibold px-4 py-2 hover:opacity-90">
          Create Alert Rule
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mt-4 bg-white border border-gray-200 rounded-lg px-6 py-3">
        <button className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white border border-gray-200 pl-3 pr-2 text-gray-700 hover:bg-gray-100">
          <p className="text-sm font-medium">Severity: All</p>
          <span className="material-symbols-outlined text-base">
            expand_more
          </span>
        </button>
        <button className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white border border-gray-200 pl-3 pr-2 text-gray-700 hover:bg-gray-100">
          <p className="text-sm font-medium">Service: All</p>
          <span className="material-symbols-outlined text-base">
            expand_more
          </span>
        </button>
        <button className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white border border-gray-200 pl-3 pr-2 text-gray-700 hover:bg-gray-100">
          <p className="text-sm font-medium">Time Range: Last 24h</p>
          <span className="material-symbols-outlined text-base">
            expand_more
          </span>
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {mainLoading ? (
          <div className="w-[100%] h-[90%]  flex items-center justify-center">
            <Loader color="black" size={15} />
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-1/5 text-gray-500 uppercase text-xs font-medium">
                  Timestamp
                </th>
                <th className="px-4 py-3 w-1/5 text-gray-500 uppercase text-xs font-medium">
                  Service
                </th>
                <th className="px-4 py-3 w-2/5 text-gray-500 uppercase text-xs font-medium">
                  Error Message
                </th>
                <th className="px-4 py-3 w-[120px] text-gray-500 uppercase text-xs font-medium">
                  Severity
                </th>
                <th className="px-4 py-3 w-[120px] text-gray-500 uppercase text-xs font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incidents.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-cyan-500/10 cursor-pointer transition-all"
                  onClick={() => setSelectedIncident(item)}
                >
                  <td className="px-4 py-3 text-gray-500">{item.createdAt}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.serviceName}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{item.message}</td>
                  <td className="px-4 py-3">
                    {getBadge(
                      item.complexity == 5
                        ? "Critical"
                        : item.complexity === 4
                        ? "High"
                        : item.complexity === 3
                        ? "Medium"
                        : "Low",
                      item.complexity == 5
                        ? "red"
                        : item.complexity === 4
                        ? "orange"
                        : item.complexity === 3
                        ? "yellow"
                        : "gray"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getBadge(
                      item.status,
                      item.status === "Active"
                        ? "blue"
                        : item.status === "Resolved"
                        ? "green"
                        : "gray"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Fullscreen Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          {loading ? (
            <Loader color="black" size={15} />
          ) : (
            <div className="bg-white w-full h-[90%] max-w-5xl rounded-lg flex flex-col overflow-hidden shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <div>
                  <h2 className="text-lg font-bold text-black">
                    {selectedIncident.message}
                  </h2>
                  <p className="text-sm text-gray-500">
                    from service: {selectedIncident.serviceName}
                  </p>
                </div>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black"
                  onClick={() => setSelectedIncident(null)}
                >
                  <span className="material-symbols-outlined text-xl">X</span>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">
                    AI Root Cause Analysis
                  </h3>
                  <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                    {aiRes?.rootCause}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">
                    AI Suggested Fix
                  </h3>
                  <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700">
                    {aiRes?.fixSuggestion &&
                      aiRes?.fixSuggestion?.split(".").map((line, index) => {
                        return (
                          line.length > 0 && (
                            <p key={index} className="mb-3">
                              {index + 1}. {line}
                            </p>
                          )
                        );
                      })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">
                    Details
                  </h3>
                  <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-700 font-mono">
                    <div className="flex border-b border-gray-200 py-2">
                      <span className="w-28 text-gray-500">Endpoint</span>
                      <span>
                        {selectedIncident?.metadata?.method}{" "}
                        {selectedIncident?.endpoint}
                      </span>
                    </div>
                    <div className="flex border-b border-gray-200 py-2">
                      <span className="w-28 text-gray-500">File</span>
                      <span>
                        {selectedIncident?.metadata?.caller?.file}:
                        {selectedIncident?.metadata?.caller?.line}
                      </span>
                    </div>
                    <div className="flex border-b border-gray-200 py-2">
                      <span className="w-28 text-gray-500">Function</span>
                      <span>
                        {selectedIncident?.metadata?.caller?.function}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="w-28 text-gray-500 block mb-1">
                        Stack Trace
                      </span>
                      <pre className="overflow-x-auto text-gray-600">
                        {selectedIncident?.stack}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end border-t border-gray-200 p-4">
                <button
                  disabled={selectedIncident.status === "solved"}
                  onClick={() => markIncidentAsResolved(selectedIncident._id)}
                  className={`flex items-center justify-center rounded-lg px-4 py-2 bg-gradient-to-b ${
                    selectedIncident.status === "solved"
                      ? "from-green-500 to-green-600 cursor-not-allowed opacity-80"
                      : "from-cyan-500 to-cyan-600 cursor-pointer "
                  } text-white text-sm font-semibold hover:opacity-90 `}
                >
                  {revokeLoading ? (
                    <Loader color="white" size={15} />
                  ) : selectedIncident.status === "solved" ? (
                    "Incident Resolved"
                  ) : (
                    "Mark as Resolved"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Incidents;
