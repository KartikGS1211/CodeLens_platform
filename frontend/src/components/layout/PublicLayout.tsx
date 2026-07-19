import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
