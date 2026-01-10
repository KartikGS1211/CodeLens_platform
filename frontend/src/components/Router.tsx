import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import CodeQualityPage from '@/components/pages/CodeQualityPage';
import CodeReviewPage from '@/components/pages/CodeReviewPage';
import DeveloperSkillsPage from '@/components/pages/DeveloperSkillsPage';
import BestPracticesPage from '@/components/pages/BestPracticesPage';
import ProfilePage from '@/components/pages/ProfilePage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "code-quality",
        element: <CodeQualityPage />,
        routeMetadata: {
          pageIdentifier: 'code-quality',
        },
      },
      {
        path: "code-review",
        element: <CodeReviewPage />,
        routeMetadata: {
          pageIdentifier: 'code-review',
        },
      },
      {
        path: "developer-skills",
        element: <DeveloperSkillsPage />,
        routeMetadata: {
          pageIdentifier: 'developer-skills',
        },
      },
      {
        path: "best-practices",
        element: <BestPracticesPage />,
        routeMetadata: {
          pageIdentifier: 'best-practices',
        },
      },
      {
        path: "profile",
        element: <ProfilePage />,
        routeMetadata: {
          pageIdentifier: 'profile',
        },
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
