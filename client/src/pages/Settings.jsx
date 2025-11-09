import { Star, X } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import axios from "axios";

import { toast } from "react-hot-toast";
import { setUser } from "../redux/authSlice";
import { useEffect } from "react";
const Settings = () => {
  const auth = useSelector((state) => state.auth);
  const [data, setData] = useState({
    userName: auth.user?.userName,
    email: auth.user?.email,
    notifications: auth.user?.notifications || false,
  });
  const dispatch = useDispatch();

  const [pageLoading, setPageLoading] = useState(false);

  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [updateLoader, setUpdateLoader] = useState(false);

  const changePasswordHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/change-pass`,
        passForm,
        {
          withCredentials: true,
        }
      );
      if (data.success) {
        toast.success("Password changed successfully");
        setShowPassModal(false);
      }
      setPassForm({ oldPassword: "", newPassword: "" });
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const updateUserDetails = async () => {
    setUpdateLoader(true);
    try {
      const result = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/update`,
        {
          userName: data.userName,
          email: data.email,
          notifications: data.notifications,
        },
        {
          withCredentials: true,
        }
      );
      if (result?.data?.success) {
        toast.success("Updated successfully");
        dispatch(setUser(result?.data?.data));
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setUpdateLoader(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setPageLoading(true);
        const result = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
          {
            withCredentials: true,
          }
        );
        if (result?.data?.success) {
          setData((prev) => {
            return {
              ...prev,
              userName: result?.data?.data?.userName,
              email: result?.data?.data?.email,
              notifications: result?.data?.data?.notifications,
            };
          });
          dispatch(setUser(result?.data?.data));
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Something went wrong");
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen  bg-white px-10 py-1 overflow-hidden">
      {pageLoading ? (
        <div className="h-96 w-full items-center justify-center flex">
          <Loader color="black" size={20} />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <header>
            <h1 className="text-4xl font-black text-[#0F172A] tracking-[-0.03em]">
              Settings &amp; Profile
            </h1>
          </header>

          <section className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-[22px] font-bold text-[#0F172A]">
              User Details
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <label className="flex flex-col gap-2">
                <p className="text-gray-500 text-sm font-medium">Full Name</p>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-[#F9FAFB] h-12 px-3 text-gray-900 text-base focus:ring-2 focus:ring-[#00BFFF]/50 focus:outline-none"
                  value={data.userName}
                  name="userName"
                  onChange={(e) =>
                    setData({ ...data, [e.target.name]: e.target.value })
                  }
                />
              </label>

              <label className="flex flex-col gap-2">
                <p className="text-gray-500 text-sm font-medium">
                  Email Address
                </p>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-[#F9FAFB] h-12 px-3 text-gray-900 text-base focus:ring-2 focus:ring-[#00BFFF]/50 focus:outline-none"
                  value={data.email}
                  name="email"
                  readOnly
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <p className="text-gray-500 text-sm">
                Manage your password and security settings.
              </p>
              <button
                onClick={() => setShowPassModal(true)}
                className="h-10 px-4 rounded-lg border border-gray-200 bg-gradient-to-b from-white to-gray-50 hover:bg-gray-100 transition text-sm font-medium text-black shadow-sm"
              >
                Change Password
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-[22px] font-bold text-[#0F172A]">
              Notification Preferences
            </h2>

            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-black font-medium">
                    Email Alert Notifications
                  </p>
                  <p className="text-gray-500 text-sm">
                    Receive alerts for new incidents directly in your inbox.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={data.notifications}
                    onChange={(e) =>
                      setData({ ...data, notifications: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#00BFFF] peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>

            <div className="flex items-start justify-between border-t border-gray-200 pt-6">
              <div className="flex flex-col">
                <p className="text-black font-medium">Enable AI Smart Alerts</p>
                <p className="text-gray-500 text-sm">
                  Let our AI prioritize and summarize critical alerts for you.
                  This feature is always free.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg h-10 px-5 bg-gradient-to-b from-cyan-400 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-500/20">
                <Star className="w-4 h-4" /> Enabled
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-2">
            <button
              onClick={updateUserDetails}
              className="h-12 px-6 flex items-center justify-center rounded-lg bg-gradient-to-b from-gray-900 to-black text-base font-bold text-white shadow-md shadow-black/20 hover:opacity-90 transition"
            >
              {updateLoader ? <Loader color="white" size={18} /> : "Save"}
            </button>
          </div>
        </div>
      )}
      {showPassModal && (
        <form
          onSubmit={changePasswordHandler}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity animate-fadeIn"
        >
          <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 relative animate-scaleIn">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowPassModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-black mb-4">
              Change Password
            </h3>

            <input
              type="password"
              placeholder="Old Password"
              className="border rounded-lg h-11 px-3 w-full mb-3"
              value={passForm.oldPassword}
              onChange={(e) =>
                setPassForm({ ...passForm, oldPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              className="border rounded-lg h-11 px-3 w-full mb-4"
              value={passForm.newPassword}
              onChange={(e) =>
                setPassForm({ ...passForm, newPassword: e.target.value })
              }
            />

            <button
              disabled={
                loading || !passForm.oldPassword || !passForm.newPassword
              }
              className={`w-full flex items-center justify-center bg-[#06B6D4] text-white py-2 rounded-lg font-semibold hover:bg-[#0EA5B9] transition ${
                (loading || !passForm.oldPassword || !passForm.newPassword) &&
                "opacity-50 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader color="white" size={18} /> : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
