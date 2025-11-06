import React from "react";
import { Plus, Clipboard, ArrowRight, Puzzle } from "lucide-react";

const Services = () => {
  const apiKeys = [
    { project: "Project Alpha", key: "sk_live_...aBc1", usage: "Logs Analyzed: 1,452" },
    { project: "E-commerce Backend", key: "sk_live_...xYz9", usage: "Logs Analyzed: 8,210" },
    { project: "User Analytics Service", key: "sk_live_...4hJk", usage: "Logs Analyzed: 23,981" },
  ];

  return (
    <div className="w-full h-full bg-[#F9FAFB] px-10 py-10 overflow-y-auto">
      {/* Centered desktop container */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[#0F172A] text-4xl font-black tracking-[-0.03em]">
            API Keys &amp; Integrations
          </h1>

          <button className="inline-flex items-center gap-2 rounded-lg h-10 px-4 bg-[#06B6D4] text-white text-sm font-bold hover:bg-[#0EA5B9] transition">
            <Plus className="w-4 h-4" />
            Generate New API Key
          </button>
        </div>

        {/* Main grid: 2/3 table + 1/3 side card */}
        <div className="grid grid-cols-[2fr_1fr] gap-8">
          {/* Table card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                    Project Name
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                    API Key
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                    Usage
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 hover:bg-cyan-50/40 transition"
                  >
                    <td className="px-5 py-5 text-sm text-[#0F172A] whitespace-nowrap">
                      {row.project}
                    </td>
                    <td className="px-5 py-5 text-sm text-gray-700 font-mono whitespace-nowrap">
                      {row.key}
                    </td>
                    <td className="px-5 py-5 text-sm text-gray-600 whitespace-nowrap">
                      {row.usage}
                    </td>
                    <td className="px-5 py-5 text-sm font-semibold whitespace-nowrap">
                      <button className="text-[#06B6D4] hover:text-[#0EA5B9] hover:underline">
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Side help card */}
          <div className="bg-gradient-to-b from-gray-50 via-white to-gray-100 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Puzzle className="w-6 h-6 text-[#06B6D4]" />
              <h3 className="text-[#0F172A] text-lg font-bold">
                How to integrate SDK
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Install our SDK into your project to start sending incident data for analysis.
            </p>

            <div className="relative bg-gray-100 border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-800">
              <code className="block overflow-x-auto">npm install @ai-analyzer/sdk</code>
              <button
                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-gray-200 text-gray-600 hover:text-[#06B6D4] transition"
                onClick={() => navigator.clipboard?.writeText("npm install @ai-analyzer/sdk")}
                aria-label="Copy command"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>

            <button className="group inline-flex items-center gap-1 text-[#06B6D4] hover:text-[#0EA5B9] text-sm font-semibold">
              View Full Documentation
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
