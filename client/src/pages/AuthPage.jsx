import React, { useState } from "react";
import { Bell, HelpCircle } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? "Logging in..." : "Signing up...");
  };

  const successHandler = async (googleData) => {
    try {
      console.log(googleData);

      const { code } = googleData;
      const data = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        { code },
        {
          withCredentials: true,
        }
      );

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: successHandler,
    onError: successHandler,
    flow: "auth-code",
  });

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Dummy Auth Navbar */}
      <div className="h-16 bg-gradient-to-b from-[#F8FBFF] to-[#F4F7FB] border-b border-gray-200 shadow-sm flex items-center justify-between px-8">
        <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
          AI Incident Response
        </h1>

        <div className="flex items-center space-x-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-[#F8FAFC] text-[#64748B] hover:bg-[#EEF3F7] hover:text-[#0F172A] transition-all">
            <Bell strokeWidth={2} className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-[#F8FAFC] text-[#64748B] hover:bg-[#EEF3F7] hover:text-[#0F172A] transition-all">
            <HelpCircle strokeWidth={2} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Auth Container */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#0F172A]">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin
                ? "Sign in to access your incident dashboard."
                : "Join and monitor your systems with AI-driven insights."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 bg-[#F9FAFB] px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 bg-[#F9FAFB] px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 bg-[#F9FAFB] px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-3 text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleGoogleLogin()}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all text-sm text-gray-700"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                alt="google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all text-sm text-gray-700">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                alt="github"
                className="w-5 h-5"
              />
              Continue with GitHub
            </button>
          </div>

          {/* Toggle */}
          <div className="text-center mt-6 text-sm text-gray-600">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-cyan-600 hover:underline font-semibold"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-cyan-600 hover:underline font-semibold"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
