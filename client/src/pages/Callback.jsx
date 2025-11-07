import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setIsAuthenticated, setToken, setUser } from "../redux/authSlice";
const Callback = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    console.log(code);
    if (code) {
      (async () => {
        try {
          const data = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/github`,
            {
              code,
            },
            {
              withCredentials: true,
            }
          );
          if (data?.data?.success) {
            toast.success("Login successful");
            navigate("/dashboard");
            dispatch(setIsAuthenticated(true));
            dispatch(setUser(data?.user));
            dispatch(setToken(data?.token));
          }
        } catch (error) {
          toast.error(error?.response?.data?.message || "Something went wrong");
          navigate("/login");
          console.log(error);
        }
      })();
    }
  }, [navigate]);

  return <div></div>;
};

export default Callback;
