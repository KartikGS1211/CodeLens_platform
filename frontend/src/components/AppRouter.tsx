import { AuthProvider as MemberProvider } from "../context/AuthContext";
import ErrorPage from "../../integrations/errorHandlers/ErrorPage";
import PublicLayout from "./layout/PublicLayout";
import AppLayout from "./layout/AppLayout";
import HomePage from "./pages/HomePage";
import CodeQualityPage from "./pages/CodeQualityPage";
import CodeReviewPage from "./pages/CodeReviewPage";
import DeveloperSkillsPage from "./pages/DeveloperSkillsPage";
import BestPracticesPage from "./pages/BestPracticesPage";
import ProfilePage from "./pages/ProfilePage";
import { SidebarProvider } from "../context/SidebarContext";
import AnalysisOverviewPage from "./pages/AnalysisOverviewPage";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  const [router, setRouter] = useState<any>(null);

  useEffect(() => {
    const r = createBrowserRouter([
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
            element: (
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // ANALYSIS ROUTES (WITH SIDEBAR)
      {
        path: "/analysis/:analysisId",
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AnalysisOverviewPage />,
          },
          {
            path: "overview",
            element: <AnalysisOverviewPage />,
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

    setRouter(r);
  }, []);

  if (!router) return null;

  return (
    <MemberProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </MemberProvider>
  );
}
