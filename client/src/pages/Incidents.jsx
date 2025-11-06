import React, { useState } from "react";

const Incidents = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const incidents = [
    {
      id: 1,
      timestamp: "2024-05-21 14:35:12 UTC",
      service: "auth-service",
      message: "NullPointerException at com.example.UserService",
      severity: "Critical",
      status: "Active",
    },
    {
      id: 2,
      timestamp: "2024-05-21 14:32:01 UTC",
      service: "payment-api",
      message: "502 Bad Gateway",
      severity: "Critical",
      status: "Active",
    },
    {
      id: 3,
      timestamp: "2024-05-21 13:55:49 UTC",
      service: "user-profile-svc",
      message: "API rate limit exceeded",
      severity: "Warning",
      status: "Resolved",
    },
    {
      id: 4,
      timestamp: "2024-05-21 13:40:22 UTC",
      service: "notification-worker",
      message: "Timeout executing job",
      severity: "Warning",
      status: "Resolved",
    },
  ];

  const getBadge = (label, color) => (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-${color}-500/10 px-2 py-1 text-xs font-medium text-${color}-600`}
    >
      <div className={`size-1.5 rounded-full bg-${color}-500`}></div>
      {label}
    </div>
  );

  return (
    <div className="w-full h-full bg-[#F9FAFB] p-6 overflow-hidden flex flex-col">
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
          <span className="material-symbols-outlined text-base">expand_more</span>
        </button>
        <button className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white border border-gray-200 pl-3 pr-2 text-gray-700 hover:bg-gray-100">
          <p className="text-sm font-medium">Service: All</p>
          <span className="material-symbols-outlined text-base">expand_more</span>
        </button>
        <button className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white border border-gray-200 pl-3 pr-2 text-gray-700 hover:bg-gray-100">
          <p className="text-sm font-medium">Time Range: Last 24h</p>
          <span className="material-symbols-outlined text-base">expand_more</span>
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
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
            {incidents.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-cyan-500/10 cursor-pointer transition-all"
                onClick={() => setSelectedIncident(item)}
              >
                <td className="px-4 py-3 text-gray-500">{item.timestamp}</td>
                <td className="px-4 py-3 text-gray-500">{item.service}</td>
                <td className="px-4 py-3 text-gray-800">{item.message}</td>
                <td className="px-4 py-3">
                  {getBadge(
                    item.severity,
                    item.severity === "Critical"
                      ? "red"
                      : item.severity === "Warning"
                      ? "amber"
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
      </div>

      {/* Fullscreen Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full h-full max-w-5xl rounded-lg flex flex-col overflow-hidden shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h2 className="text-lg font-bold text-black">
                  {selectedIncident.message}
                </h2>
                <p className="text-sm text-gray-500">
                  from service: {selectedIncident.service}
                </p>
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black"
                onClick={() => setSelectedIncident(null)}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">
                  AI Root Cause Analysis
                </h3>
                <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                  The AI analysis indicates a service dependency failure. The
                  `payment-api` service failed to connect to the upstream
                  `transaction-processor` service, which was unresponsive. This
                  is likely due to a recent deployment on the processor service
                  or a network configuration issue between the services.
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">
                  AI Suggested Fix
                </h3>
                <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700">
                  <p className="mb-3">
                    1. Check the health status of the `transaction-processor`
                    service immediately.
                  </p>
                  <p className="mb-3">
                    2. If the service is down, investigate its deployment logs
                    for errors during its last update.
                  </p>
                  <p>
                    3. As a temporary measure, consider rolling back the
                    `transaction-processor` to its previous stable version:
                  </p>
                  <pre className="mt-2 bg-gray-200 rounded p-3 text-xs font-mono text-gray-700 overflow-x-auto">
                    kubectl rollout undo deployment/transaction-processor
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Details
                </h3>
                <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-700 font-mono">
                  <div className="flex border-b border-gray-200 py-2">
                    <span className="w-28 text-gray-500">Endpoint</span>
                    <span>POST /api/v1/charge</span>
                  </div>
                  <div className="flex border-b border-gray-200 py-2">
                    <span className="w-28 text-gray-500">File</span>
                    <span>/app/handlers/charge_handler.go:112</span>
                  </div>
                  <div className="pt-2">
                    <span className="w-28 text-gray-500 block mb-1">
                      Stack Trace
                    </span>
                    <pre className="overflow-x-auto text-gray-600">
                      goroutine 123 [running]:
                      main.handleChargeRequest(...)
                      /app/handlers/charge_handler.go:112 +0x12a
                      main.processPayment(...)
                      /app/services/payment_service.go:45 +0x5f
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-gray-200 p-4">
              <button className="flex items-center justify-center rounded-lg px-4 py-2 bg-gradient-to-b from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:opacity-90">
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
