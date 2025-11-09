import { Star } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import axios from "axios";

const Settings = () => {
  const auth = useSelector((state) => state.auth);
  const [data, setData] = useState({
    userName: auth.user?.userName,
    email: auth.user?.email,
    notifications: auth.user?.notifications || false,
  });

  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ oldPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);

  const changePasswordHandler = async () => {
    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/user/change-pass`, passForm, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setShowPassModal(false);
      setPassForm({ oldPassword: "", newPassword: "" });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white px-10 py-1 overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <header>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-[-0.03em]">Settings &amp; Profile</h1>
        </header>

        <section className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-[22px] font-bold text-[#0F172A]">User Details</h2>

          <div className="grid grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm font-medium">Full Name</p>
              <input
                className="w-full rounded-lg border border-gray-200 bg-[#F9FAFB] h-12 px-3 text-gray-900 text-base focus:ring-2 focus:ring-[#00BFFF]/50 focus:outline-none"
                value={data.userName}
                name="userName"
                onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm font-medium">Email Address</p>
              <input
                className="w-full rounded-lg border border-gray-200 bg-[#F9FAFB] h-12 px-3 text-gray-900 text-base focus:ring-2 focus:ring-[#00BFFF]/50 focus:outline-none"
                value={data.email}
                name="email"
                onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
              />
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <p className="text-gray-500 text-sm">Manage your password and security settings.</p>
            <button
              onClick={() => setShowPassModal(true)}
              className="h-10 px-4 rounded-lg border border-gray-200 bg-gradient-to-b from-white to-gray-50 hover:bg-gray-100 transition text-sm font-medium text-black shadow-sm"
            >
              Change Password
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-[22px] font-bold text-[#0F172A]">Notification Preferences</h2>

          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-black font-medium">Email Alert Notifications</p>
                <p className="text-gray-500 text-sm">Receive alerts for new incidents directly in your inbox.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={data.notifications} onChange={(e) => setData({ ...data, notifications: e.target.checked })} className="sr-only peer" />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#00BFFF] peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>

          <div className="flex items-start justify-between border-t border-gray-200 pt-6">
            <div className="flex flex-col">
              <p className="text-black font-medium">Enable AI Smart Alerts</p>
              <p className="text-gray-500 text-sm">Let our AI prioritize and summarize critical alerts for you.</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg h-10 px-5 bg-gradient-to-b from-cyan-400 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition">
              <Star /> Enable AI Smart Alerts
            </button>
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <button className="h-12 px-6 rounded-lg bg-gradient-to-b from-gray-900 to-black text-base font-bold text-white shadow-md shadow-black/20 hover:opacity-90 transition">Save Settings</button>
        </div>
      </div>

      {showPassModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[380px] flex flex-col gap-4">
            <h3 className="text-lg font-bold text-black">Change Password</h3>

            <input
              type="password"
              placeholder="Old Password"
              className="border rounded-lg h-11 px-3"
              value={passForm.oldPassword}
              onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
            />

            <input
              type="password"
              placeholder="New Password"
              className="border rounded-lg h-11 px-3"
              value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
            />

            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowPassModal(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={changePasswordHandler} className="px-4 py-2 bg-black text-white text-sm rounded-lg">{loading ? <Loader /> : "Update"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
