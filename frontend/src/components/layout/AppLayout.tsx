import { Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );
}
