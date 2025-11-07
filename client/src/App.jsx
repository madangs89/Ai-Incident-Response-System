import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import MainLayout from "./Loyout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Analytics from "./pages/Analytics";
import Services from "./pages/Services";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import AuthPage from "./pages/AuthPage";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setIsAuthenticated, setToken, setUser } from "./redux/authSlice";
import Callback from "./pages/Callback";

const App = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/is-auth`,
          {
            withCredentials: true,
          }
        );
        console.log(data);
        if (data.success) {
          navigate("/dashboard");
          dispatch(setIsAuthenticated(true));
          dispatch(setUser(data?.user));
          dispatch(setToken(data?.token));
        }
        navigate("/login");
      } catch (error) {
        console.log(error);
        dispatch(setIsAuthenticated(false));
        dispatch(setUser(null));
      }
    })();
  }, []);

  return (
    <div className="w-full h-screen">
      <Routes>
        {/* Public Route (No Layout) */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/callback" element={<Callback />} />
        {/* Protected Routes (With Layout) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="incidents" element={<Incidents />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="services" element={<Services />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-All (Optional) */}
        <Route
          path="*"
          element={<Navigate to={auth ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </div>
  );
};

export default App;
