import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* ✅ SINGLE HEADER */}
      <Header />

      <div className="flex h-screen w-full">
        {/* ✅ SIDEBAR ONLY (NO HEADER INSIDE IT) */}
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
