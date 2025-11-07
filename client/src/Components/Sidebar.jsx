import axios from "axios";
import {
  LayoutDashboard,
  AlertTriangle,
  PieChart,
  Server,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { setIsAuthenticated, setToken, setUser } from "../redux/authSlice";
import { useState } from "react";
import Loader from "./Loader";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { name: "Incidents", to: "/incidents", icon: AlertTriangle },
    { name: "Analytics", to: "/analytics", icon: PieChart },
    { name: "Services", to: "/services", icon: Server },
  ];
  const bottomNavItems = [
    { name: "Settings", to: "/settings", icon: Settings },
  ];

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Logout successful");
        dispatch(setIsAuthenticated(false));
        dispatch(setUser(null));
        dispatch(setToken(null));
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-[#E2E8F0] shadow-[2px_0_6px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between">
      {/* Logo Section */}
      <div>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="text-[#0F172A]">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-[#06B6D4]"
            >
              <path
                d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-[15px] font-semibold text-[#0F172A] leading-tight">
            AI Incident Response
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#E6FDFF] text-[#06B6D4] shadow-sm"
                      : "text-[#64748B] hover:bg-[#EEF3F7] hover:text-[#0F172A]"
                  }`
                }
              >
                <Icon
                  className={`w-[18px] h-[18px] ${
                    item.active ? "text-[#06B6D4]" : ""
                  }`}
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <nav className="flex flex-col gap-1.5">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#E6FDFF] text-[#06B6D4] shadow-sm"
                    : "text-[#64748B] hover:bg-[#EEF3F7] hover:text-[#0F172A]"
                }`
              }
            >
              <Icon
                className={`w-[18px] h-[18px] ${
                  item.active ? "text-[#06B6D4]" : ""
                }`}
              />
              {item.name}
            </NavLink>
          );
        })}
        <button
          onClick={handleLogout}
          className={`flex items-center ${
            loading && "cursor-not-allowed"
          }  gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200
                shadow-sm text-[#64748B] hover:bg-[#EEF3F7] 
            }`}
        >
          {loading ? (
            <>
              <Loader color="#64748B" size={16} />
              <span className="">Logging out</span>
            </>
          ) : (
            <>
              <LogOut className={`w-[18px] h-[18px]`} />
              Logout
            </>
          )}
        </button>
      </nav>
    </div>
  );
}
