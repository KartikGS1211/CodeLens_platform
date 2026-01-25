import { Link, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  FileSearch,
  User,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const location = useLocation();
  const { analysisId } = useParams();

  const basePath = analysisId ? `/analysis/${analysisId}` : "";

  const navItems = [
    {
      title: "Overview",
      href: basePath,
      icon: LayoutDashboard,
      enabled: !!analysisId,
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

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-background/60 backdrop-blur-lg">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === basePath
              ? location.pathname === basePath
              : location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all",
                isActive
                  ? "bg-neon-teal/10 text-neon-teal border border-neon-teal/20"
                  : "text-foreground/70 hover:bg-white/5 hover:text-neon-teal",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
