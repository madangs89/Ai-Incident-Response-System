import React, { useState, useEffect } from "react";
import { Plus, Clipboard, ArrowRight, Puzzle, X, Trash2 } from "lucide-react";
import axios from "axios";
import Loader from "../Components/Loader";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { pushKey, setKeys } from "../redux/userSlice";

const Services = () => {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const [revokeModal, setRevokeModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  const apiKeys = useSelector((state) => state.user.keys);

  const dispatch = useDispatch();

  // ✅ Generate new API key
  const handleGenerateKey = async () => {
    if (!projectName.trim()) return toast.error("Please enter a project name");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/key/create`,
        { projectName },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("API key generated successfully");
  
        dispatch(
          pushKey(
            {
              _id: data?.data?._id,
              projectName: data?.data?.projectName,
              key: data?.data?.key,
              totalAnalyzedLogs: 0,
            },
          )
        );
        setShowModal(false);
        setProjectName("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create API key");
    } finally {
      setLoading(false);
    }
  };

  // // ✅ Fetch API Keys
  useEffect(() => {
    (async () => {
      try {
        setOpenLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/key/get`,
          { withCredentials: true }
        );
        if (data.success) dispatch(setKeys(data?.data || []));
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
      } finally {
        setOpenLoading(false);
      }
    })();
  }, []);

  const handleRevokeKey = async () => {
    if (!selectedKey?._id) return;
    setRevokeLoading(true);
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/key/delete/${selectedKey._id}`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("API key revoked successfully");
        dispatch(setKeys(apiKeys.filter((k) => k._id !== selectedKey._id)));
        setRevokeModal(false);
      } else {
        toast.error(data.message || "Failed to revoke key");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error while revoking API key");
    } finally {
      setRevokeLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full bg-[#F9FAFB] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[#0F172A] text-4xl font-black tracking-[-0.03em]">
            API Keys &amp; Integrations
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg h-10 px-4 bg-[#06B6D4] text-white text-sm font-bold hover:bg-[#0EA5B9] transition"
          >
            <Plus className="w-4 h-4" />
            Generate New API Key
          </button>
        </div>

        {/* Table + Side Card */}
        <div className="grid grid-cols-[2fr_1fr] gap-8">
          {/* API Key Table */}
          <div
            className={`bg-white border max-h-[500px] overflow-y-scroll border-gray-200 rounded-xl shadow-sm ${
              openLoading ? "flex items-center justify-center" : ""
            }`}
          >
            {openLoading ? (
              <Loader color="black" size={20} />
            ) : apiKeys && apiKeys.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase text-gray-500">
                      Project Name
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase text-gray-500">
                      API Key
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase text-gray-500">
                      Usage
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase text-gray-500">
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
                        {row.projectName}
                      </td>

                      {/* ✅ Key with copy icon */}
                      <td className="px-5 py-5 text-sm text-gray-700 font-mono whitespace-nowrap flex items-center gap-2">
                        <span className="cursor-pointer select-none">
                          {row.key.slice(0, 7) + "...." + row.key.slice(-2)}
                        </span>
                        <Clipboard
                          onClick={() => {
                            navigator.clipboard.writeText(row.key);
                            toast.success("API key copied!");
                          }}
                          className="w-4 h-4 text-gray-500 hover:text-[#06B6D4] cursor-pointer transition"
                        />
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-600 whitespace-nowrap">
                        {row.totalAnalyzedLogs}
                      </td>

                      {/* ✅ Revoke button */}
                      <td className="px-5 py-5 text-sm font-semibold whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedKey(row);
                            setRevokeModal(true);
                          }}
                          className="flex items-center gap-1 text-[#06B6D4] hover:text-[#0EA5B9] hover:underline"
                        >
                          <Trash2 className="w-4 h-4" />
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 font-medium">No API keys found.</p>
              </div>
            )}
          </div>

          {/* Side Help Card */}
          <div className="bg-gradient-to-b from-gray-50 via-white to-gray-100 border border-gray-200 rounded-xl shadow-sm max-h-[220px] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Puzzle className="w-6 h-6 text-[#06B6D4]" />
              <h3 className="text-[#0F172A] text-lg font-bold">
                How to integrate SDK
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Install our SDK into your project to start sending incident data
              for analysis.
            </p>

            <div className="relative bg-gray-100 border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-800">
              <code>npm install @ai-analyzer/sdk</code>
              <button
                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-gray-200 text-gray-600 hover:text-[#06B6D4] transition"
                onClick={() =>
                  navigator.clipboard.writeText("npm install @ai-analyzer/sdk")
                }
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

      {/* ✅ Create API Key Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">
              Generate New API Key
            </h2>

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#06B6D4] outline-none mb-4"
              placeholder="Enter your project name"
            />

            <button
              onClick={handleGenerateKey}
              disabled={loading}
              className="w-full bg-[#06B6D4] flex items-center justify-center text-white py-2 rounded-lg font-semibold hover:bg-[#0EA5B9] transition disabled:opacity-60"
            >
              {loading ? <Loader color="white" size={20} /> : "Generate Key"}
            </button>
          </div>
        </div>
      )}

      {/* ✅ Revoke Confirmation Modal */}
      {revokeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setRevokeModal(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-[#0F172A] mb-2">
              Revoke API Key
            </h2>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Are you sure you want to revoke this API key? <br />
              <span className="font-semibold text-[#EF4444]">
                All access and data linked to it will be lost permanently.
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setRevokeModal(false)}
                className="flex-1 border border-gray-300 rounded-lg py-2 font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeKey}
                disabled={revokeLoading}
                className="flex-1 bg-[#EF4444] flex items-center justify-center text-white rounded-lg py-2 font-semibold hover:bg-[#DC2626] transition disabled:opacity-60"
              >
                {revokeLoading ? <Loader color="white" size={18} /> : "Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
