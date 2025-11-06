import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function MainLayout() {
  return (
    <div className="flex w-full h-screen">
      <Sidebar />
      <div className="flex w-full h-screen flex-col">
        <Navbar />
        <main className="ml-64 mt-16 p-6 bg-[#f9fafc] min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
