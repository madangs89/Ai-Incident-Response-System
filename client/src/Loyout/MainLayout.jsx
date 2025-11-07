import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export default function MainLayout() {
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  }, [auth.isAuthenticated]);

  return (
    <div className="flex w-full h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Area */}
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="ml-64 mt-16 p-8 bg-[#F9FAFB] min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
