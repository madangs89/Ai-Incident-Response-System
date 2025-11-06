import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#f8f9fb] p-4 border-r border-gray-200">
      <h2 className="text-xl font-semibold mb-6">AI Incident Response</h2>
      <nav className="flex flex-col space-y-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `p-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/incidents"
          className={({ isActive }) =>
            `p-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`
          }
        >
          Incidents
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `p-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`
          }
        >
          Analytics
        </NavLink>
        <NavLink
          to="/services"
          className={({ isActive }) =>
            `p-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`
          }
        >
          Services
        </NavLink>
        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `p-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`
          }
        >
          Alerts
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`
          }
        >
          Settings
        </NavLink>
      </nav>
    </div>
  );
}
