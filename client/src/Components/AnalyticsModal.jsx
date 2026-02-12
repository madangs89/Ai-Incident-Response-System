import React, { useEffect, useState } from "react";
import axios from "axios";

const Info = ({ label, value, mono }) => (
  <div>
    <p className="text-gray-500 text-xs mb-1">{label}</p>
    <p className={`${mono ? "font-mono text-xs" : "font-semibold"}`}>{value}</p>
  </div>
);

const AnalyticsModal = ({ selectedIncident, setSelectedIncident }) => {
  const [aiAnalysis, setAiAnalysis] = useState({
    rootCause: "Analyzing root cause...",
    fixSuggestion: "Generating fix suggestions...",
    aiModel: "gemini",
  });

  useEffect(() => {
    (async () => {
      if (selectedIncident._id) {
        const aiRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/ai/get-ai/${selectedIncident._id}`,
          {
            withCredentials: true,
          },
        );
        console.log("aiRes", aiRes.data);

        setAiAnalysis((prev) => {
          return {
            ...prev,
            ...aiRes.data.data,
          };
        });
      }
    })();
  }, [selectedIncident]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8 space-y-8">
        {/* HEADER */}
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">{selectedIncident.endpoint}</h2>
          <button
            onClick={() => setSelectedIncident(null)}
            className="text-gray-500 hover:text-black"
          >
            ✖
          </button>
        </div>

        {/* INCIDENT DETAILS */}
        <section>
          <h3 className="font-bold mb-4 text-gray-500 uppercase text-sm">
            Incident Details
          </h3>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <Info label="Service Name" value={selectedIncident.serviceName} />
            <Info label="Error Type" value={selectedIncident.errorType} />
            <Info label="Complexity" value={selectedIncident.complexity} />
            <Info label="Occurrences" value={selectedIncident.occurrences} />
            <Info label="Signature" value={selectedIncident.signature} mono />
            <Info label="Status" value={selectedIncident.status} />
            <Info label="Incident Type" value={selectedIncident.incidentType} />
            <Info
              label="Attack Type"
              value={selectedIncident.attackType || "N/A"}
            />
          </div>
        </section>

        {/* MESSAGE */}
        <section>
          <h3 className="font-bold mb-2 text-gray-500 uppercase text-sm">
            Error Message
          </h3>
          <p className="bg-gray-100 p-4 rounded text-sm">
            {selectedIncident.message}
          </p>
        </section>

        {/* STACK */}
        <section>
          <h3 className="font-bold mb-2 text-gray-500 uppercase text-sm">
            Stack Trace
          </h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            {selectedIncident.stack}
          </pre>
        </section>

        {/* METADATA */}
        <section>
          <h3 className="font-bold mb-2 text-gray-500 uppercase text-sm">
            Metadata
          </h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(selectedIncident.metadata, null, 2)}
          </pre>
        </section>

        {/* AI ANALYSIS */}
        <section>
          <h3 className="font-bold mb-4 text-gray-500 uppercase text-sm">
            AI Root Cause Analysis
          </h3>

          <div className="space-y-4 text-sm">
            <Info label="AI Model" value={aiAnalysis.aiModel} />
            <div>
              <p className="text-gray-500 mb-1">Root Cause</p>
              <p className="bg-gray-100 p-4 rounded">{aiAnalysis.rootCause}</p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Fix Suggestion</p>
              <p className="bg-gray-100 p-4 rounded">
                {aiAnalysis.fixSuggestion}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalyticsModal;
