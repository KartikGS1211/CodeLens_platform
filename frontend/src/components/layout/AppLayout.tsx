  import { Outlet } from "react-router-dom";
  import { AnimatePresence } from "framer-motion";
  import Sidebar from "./Sidebar";
  import Header from "@/components/layout/Header";
  import PageTransition from "./PageTransition";

  export default function AppLayout() {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        
        {/* TOP NAVBAR */}
        <Header />

        {/* BODY */}
        <div className="flex flex-1">
          
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
      </div>
    );
  }
