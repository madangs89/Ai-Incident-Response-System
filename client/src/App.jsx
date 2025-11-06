import React from "react";
import MainLayout from "./Loyout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Analytics from "./pages/Analytics";
import Services from "./pages/Services";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import { Navigate, Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <div className="w-full h-screen">
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="services" element={<Services />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
