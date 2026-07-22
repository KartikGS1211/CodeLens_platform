import { NavLink, Link, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  FileSearch,
  User,
  BookOpen,
  X,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { AnimatePresence, motion } from "framer-motion";

type RouteParams = {
  analysisId?: string;
};

export default function Sidebar() {
  const { analysisId } = useParams<RouteParams>();
  const { isOpen, close } = useSidebar();

  // If route param is missing, do not render sidebar at all
  if (!analysisId) return null;

  const basePath = `/analysis/${analysisId}`;

  const navItems = [
    {
      title: "Overview",
      href: basePath,
      icon: LayoutDashboard,
      end: true,
    },
    {
      title: "Code Quality",
      href: `${basePath}/code-quality`,
      icon: BarChart3,
    },
    {
      title: "AI Review",
      href: `${basePath}/ai-review`,
      icon: FileSearch,
    },
    {
      title: "Skills Profile",
      href: `${basePath}/skill-summary`,
      icon: User,
    },
    {
      title: "Best Practices",
      href: `${basePath}/best-practices`,
      icon: BookOpen,
    },
  ];

  const LinksList = () => (
    <nav className="flex flex-col gap-1 p-3">
      {/* ── Home / Dashboard link ── */}
      <Link
        to="/"
        onClick={close}
        className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-cl-muted hover:bg-cl-surface hover:text-cl-text border border-transparent transition-all focus-visible:ring-2 focus-visible:ring-cl-accent"
      >
        <Home className="h-4 w-4" />
        Home
      </Link>

      {/* Divider */}
      <div className="my-1 border-t border-cl-border/60" />

      {/* ── Analysis nav items ── */}
      {navItems.map(({ title, href, icon: Icon, end }) => (
        <NavLink
          key={title}
          to={href}
          end={end}
          onClick={close}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-all focus-visible:ring-2 focus-visible:ring-cl-accent",
              isActive
                ? "bg-cl-accent/10 text-cl-accent border border-cl-accent/20"
                : "text-cl-muted hover:bg-cl-surface hover:text-cl-text border border-transparent",
            )
          }
        >
          <Icon className="h-4 w-4" />
          {title}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:block w-56 shrink-0 border-r border-cl-border bg-cl-bg/60 backdrop-blur-lg">
        <LinksList />
      </aside>

      {/* ── MOBILE OVERLAY DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Slide-in sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-cl-bg border-r border-cl-border md:hidden flex flex-col shadow-2xl"
            >
              {/* Header inside drawer */}
              <div className="flex h-14 items-center justify-between px-4 border-b border-cl-border/60">
                <span className="font-heading text-sm font-semibold text-cl-text">
                  Navigation
                </span>
                <button
                  onClick={close}
                  className="p-1 rounded-md text-cl-muted hover:text-cl-text hover:bg-cl-surface"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation links */}
              <div className="flex-1 overflow-y-auto pt-2">
                <LinksList />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
