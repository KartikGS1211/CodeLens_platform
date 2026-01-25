import { MemberProvider } from "@/integrations";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "@/integrations/errorHandlers/ErrorPage";

import PublicLayout from "@/components/layout/PublicLayout";
import AppLayout from "@/components/layout/AppLayout";

import HomePage from "@/components/pages/HomePage";
import CodeQualityPage from "@/components/pages/CodeQualityPage";
import CodeReviewPage from "@/components/pages/CodeReviewPage";
import DeveloperSkillsPage from "@/components/pages/DeveloperSkillsPage";
import BestPracticesPage from "@/components/pages/BestPracticesPage";
import ProfilePage from "@/components/pages/ProfilePage";

import { SidebarProvider } from "@/context/SidebarContext";
import AnalysisOverviewPage from "./pages/AnalysisOverviewPage";

const router = createBrowserRouter([
  // 🌍 PUBLIC ROUTES (NO SIDEBAR)
  {
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },

  // ANALYSIS ROUTES (WITH SIDEBAR)
  {
    path: "/analysis/:analysisId",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <AnalysisOverviewPage />
      },
      {
        path: "code-quality",
        element: <CodeQualityPage />,
      },
      {
        path: "ai-review",
        element: <CodeReviewPage />,
      },
      {
        path: "skill-summary",
        element: <DeveloperSkillsPage />,
      },
      {
        path: "best-practices",
        element: <BestPracticesPage />,
      },
    ],
  },
]);

export default function AppRouter() {
  return (
    <MemberProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </MemberProvider>
  );
}
