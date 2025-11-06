import { Star } from "lucide-react";
import React from "react";

const Settings = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white px-10 py-1 overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-[-0.03em]">
            Settings &amp; Profile
          </h1>
        </header>

        {/* User Details Section */}
        <section className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-[22px] font-bold text-[#0F172A]">User Details</h2>

          <div className="grid grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm font-medium">Full Name</p>
              <input
                className="w-full rounded-lg border border-gray-200 bg-[#F9FAFB] h-12 px-3 text-gray-900 text-base focus:ring-2 focus:ring-[#00BFFF]/50 focus:outline-none"
                value="John Doe"
              />
            </label>

            <label className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm font-medium">Email Address</p>
              <input
                className="w-full rounded-lg border border-gray-200 bg-[#F9FAFB] h-12 px-3 text-gray-900 text-base focus:ring-2 focus:ring-[#00BFFF]/50 focus:outline-none"
                value="john.doe@example.com"
              />
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <p className="text-gray-500 text-sm">
              Manage your password and security settings.
            </p>
            <button className="h-10 px-4 rounded-lg border border-gray-200 bg-gradient-to-b from-white to-gray-50 hover:bg-gray-100 transition text-sm font-medium text-black shadow-sm">
              Change Password
            </button>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-[22px] font-bold text-[#0F172A]">
            Notification Preferences
          </h2>

          <div className="flex flex-col gap-8">
            {/* Email Alerts */}
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
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#00BFFF] peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            {/* Slack Webhook */}
            <div className="flex flex-col gap-2">
              <p className="text-black font-medium">Slack Webhook URL</p>
              <p className="text-gray-500 text-sm">
                Send incident notifications to a Slack channel.
              </p>
              <input
                placeholder="https://hooks.slack.com/services/..."
                className="mt-2 w-full rounded-lg border border-gray-200 bg-[#F9FAFB] h-12 px-3 text-base text-gray-900 focus:ring-2 focus:ring-[#00BFFF]/50 focus:outline-none"
                value=""
              />
            </div>
          </div>

          {/* AI Alerts */}
          <div className="flex items-start justify-between border-t border-gray-200 pt-6">
            <div className="flex flex-col">
              <p className="text-black font-medium">Enable AI Smart Alerts</p>
              <p className="text-gray-500 text-sm">
                Let our AI prioritize and summarize critical alerts for you.
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg h-10 px-5 bg-gradient-to-b from-cyan-400 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition">
              <span className="material-symbols-outlined !text-[20px]">
                <Star />
              </span>
              Enable AI Smart Alerts
            </button>
          </div>
        </section>

        {/* Save Settings */}
        <div className="flex justify-end pt-2">
          <button className="h-12 px-6 rounded-lg bg-gradient-to-b from-gray-900 to-black text-base font-bold text-white shadow-md shadow-black/20 hover:opacity-90 transition">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
