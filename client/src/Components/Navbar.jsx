import { Bell, HelpCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "./Avatar";
import { useEffect, useState } from "react";
import axios from "axios";
import { setKeys, setSelectedKey } from "../redux/userSlice";
import Loader from "./Loader";

export default function Navbar() {
  const user = useSelector((state) => state.auth);
  const keys = useSelector((state) => state.user.keys);
  const selectedKey = useSelector((state) => state.user.selectedKey);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleChange = (e) => {
    console.log(e.target.value);
    dispatch(setSelectedKey(e.target.value));
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/key/get`,
          {
            withCredentials: true,
          }
        );
        dispatch(setKeys(data.data));
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="fixed left-64 top-0 right-0 h-16 bg-white backdrop-blur-[8px] border-b border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex items-center justify-between px-8 z-50">
      {/* Left Section - Page Title */}

      <h2 className="text-lg font-semibold text-[#0F172A] tracking-tight">
        Dashboard
      </h2>

      {/* Right Section */}
      <div className="flex items-center space-x-5">
        {loading ? (
          <div
            className="border flex items-center justify-center border-gray-200 text-[#475569] px-4 py-2 text-sm rounded-md 
         focus:outline-none focus:ring-0 focus:border-cyan-400 bg-white"
          >
            <Loader size={10} />
          </div>
        ) : (
          <select
            value={selectedKey || ""}
            onChange={handleChange}
            className="border flex items-center justify-center border-gray-200 text-[#475569] px-4 py-2 text-sm rounded-md 
         focus:outline-none focus:ring-0 focus:border-cyan-400 bg-white"
            name="key"
            id="key"
          >
            {keys && keys.length > 0 ? (
              keys.map((key, index) => (
                <option key={index} value={key?.projectName+":" + key?.key}>
                  {key.projectName}
                </option>
              ))
            ) : (
              <option value="">No Keys Available</option>
            )}
          </select>
        )}

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search incidents, services..."
            className="w-80 rounded-lg border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#06B6D4]/30 focus:outline-none transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
        </div>

        {/* Notification & Help Icons */}
        <div className="flex items-center space-x-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-[#F8FAFC] text-[#64748B] hover:bg-[#EEF3F7] hover:text-[#0F172A] transition-all">
            <Bell strokeWidth={2} className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-[#F8FAFC] text-[#64748B] hover:bg-[#EEF3F7] hover:text-[#0F172A] transition-all">
            <HelpCircle strokeWidth={2} className="w-5 h-5" />
          </button>

          {/* User Avatar */}
          <Avatar src={user?.user?.avatar} />
        </div>
      </div>
    </div>
  );
}
