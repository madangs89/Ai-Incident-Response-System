import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./Loyout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Analytics from "./pages/Analytics";
import Services from "./pages/Services";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import AuthPage from "./pages/AuthPage";

const App = () => {
  const [auth, setAuth] = useState(true);

  return (
    <div className="w-full h-screen">
      <Routes>
        {/* Public Route (No Layout) */}
        <Route
          path="/login"
          element={auth ? <Navigate to="/dashboard" /> : <AuthPage />}
        />

        {/* Protected Routes (With Layout) */}
        <Route
          path="/"
          element={auth ? <MainLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="services" element={<Services />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-All (Optional) */}
        <Route path="*" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
};

export default App;
