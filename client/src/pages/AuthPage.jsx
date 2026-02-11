import React, { useEffect, useState } from "react";
import { Bell, HelpCircle } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setIsAuthenticated, setToken, setUser } from "../redux/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const auth = useSelector((state) => state.auth);
  const location = useLocation();
  const [githubLoading, setGithubLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      try {
        setLoading(true);
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
          {
            email: formData.email,
            password: formData.password,
          },
          {
            withCredentials: true,
          }
        );
        if (data.success) {
          toast.success("Login successful");
          dispatch(setIsAuthenticated(true));
          dispatch(setUser(data?.user));
          dispatch(setToken(data?.token));
          navigate("/dashboard");
        }
      } catch (error) {
        console.log(error);

        toast.error(error?.response?.data?.message || "Something went wrong");
        dispatch(setIsAuthenticated(false));
        dispatch(setUser(null));
        dispatch(setToken(null));
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
          {
            email: formData.email,
            password: formData.password,
            userName: formData.userName,
          },
          {
            withCredentials: true,
          }
        );
        if (data.success) {
          toast.success("Login successful");
          dispatch(setIsAuthenticated(true));
          dispatch(setUser(data?.user));
          dispatch(setToken(data?.token));
          navigate("/dashboard");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
        dispatch(setIsAuthenticated(false));
        dispatch(setUser(null));
        dispatch(setToken(null));
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const successHandler = async (googleData) => {
    try {
      setGoogleLoading(true);
      console.log(googleData);
      const { code } = googleData;
      const data = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        { code },
        {
          withCredentials: true,
        }
      );
      console.log({ data });
      if (data.success) {
        toast.success("Login successful");
        dispatch(setIsAuthenticated(true));
        dispatch(setUser(data?.user));
        dispatch(setToken(data?.token));
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      dispatch(setIsAuthenticated(false));
      dispatch(setUser(null));
      dispatch(setToken(null));
      console.log(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: successHandler,
    onError: successHandler,
    flow: "auth-code",
  });

  const handleGitLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${
      import.meta.env.VITE_GIT_CLIENT_ID
    }&redirect_uri=${import.meta.env.VITE_REDIRECT_URI}&scope=user`;
    window.open(githubAuthUrl, "_self");
  };

  useEffect(() => {
    if (auth.isAuthenticated && location.pathname == "/login") {
      navigate("/dashboard");
    }
  }, [auth.isAuthenticated]);

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
                  value={formData.userName}
                  onChange={(e) => {
                    setFormData((prev) => {
                      return {
                        ...prev,
                        [e.target.name]: e.target.value,
                      };
                    });
                  }}
                  name="userName"
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
                name="email"
                type="email"
                onChange={(e) => {
                  setFormData((prev) => {
                    return {
                      ...prev,
                      [e.target.name]: e.target.value,
                    };
                  });
                }}
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
                name="password"
                type="password"
                onChange={(e) => {
                  setFormData((prev) => {
                    return {
                      ...prev,
                      [e.target.name]: e.target.value,
                    };
                  });
                }}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 bg-[#F9FAFB] px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
            >
              {loading ? (
                <Loader color="white" size={18} />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
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
              className={`${
                googleLoading && "cursor-not-allowed"
              } flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all text-sm text-gray-700`}
            >
              {googleLoading ? (
                <Loader size={16} />
              ) : (
                <>
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                    alt="google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </>
              )}
            </button>
            <button
              onClick={handleGitLogin}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all text-sm text-gray-700"
            >
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
