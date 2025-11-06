import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function MainLayout() {
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
