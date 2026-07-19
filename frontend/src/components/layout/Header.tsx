import { Link, useNavigate, useParams } from "react-router-dom";
import { Code2, User, LogOut, Settings, Menu } from "lucide-react";
import { useMember } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";

export default function Header() {
  const navigate = useNavigate();
  const { member, isAuthenticated, actions } = useMember();
  const { analysisId } = useParams();
  const { toggle } = useSidebar();

  const basePath = analysisId ? `/analysis/${analysisId}` : "";

  const handleLogout = async () => {
    await actions.logout();
    navigate("/");
  };

  const handleSettings = () => {
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cl-border bg-cl-bg/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-[120rem] items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu on Mobile */}
          {analysisId && (
            <button
              onClick={toggle}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-cl-border bg-cl-surface text-cl-muted hover:text-cl-text md:hidden focus-visible:ring-2 focus-visible:ring-cl-accent"
              aria-label="Toggle sidebar menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cl-accent">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-base font-semibold text-cl-text tracking-tight">
              CodeLens <span className="text-cl-accent">AI</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm text-cl-muted transition-colors hover:text-cl-text focus-visible:text-cl-text"
          >
            Dashboard
          </Link>
          {analysisId ? (
            <>
              <Link
                to={`${basePath}/code-quality`}
                className="text-sm text-cl-muted transition-colors hover:text-cl-text focus-visible:text-cl-text"
              >
                Code Quality
              </Link>
              <Link
                to={`${basePath}/ai-review`}
                className="text-sm text-cl-muted transition-colors hover:text-cl-text focus-visible:text-cl-text"
              >
                AI Review
              </Link>
              <Link
                to={`${basePath}/skill-summary`}
                className="text-sm text-cl-muted transition-colors hover:text-cl-text focus-visible:text-cl-text"
              >
                Skills Profile
              </Link>
              <Link
                to={`${basePath}/best-practices`}
                className="text-sm text-cl-muted transition-colors hover:text-cl-text focus-visible:text-cl-text"
              >
                Best Practices
              </Link>
            </>
          ) : (
            <>
              {/* Disabled links (same UI, no navigation) */}
              {[
                "Code Quality",
                "AI Review",
                "Skills Profile",
                "Best Practices",
              ].map((label) => (
                <span
                  key={label}
                  className="text-sm text-cl-muted/40 cursor-not-allowed"
                >
                  {label}
                </span>
              ))}
            </>
          )}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-full border border-cl-border bg-cl-surface p-0 hover:bg-cl-accent/10 hover:border-cl-accent/40"
            >
              <User className="h-4 w-4 text-cl-muted" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-cl-border bg-cl-surface/95 backdrop-blur-lg"
          >
            {isAuthenticated && (
              <>
                <div className="px-2 py-1.5 text-xs text-cl-muted">
                  {member?.loginEmail || "User"}
                </div>
                <DropdownMenuItem
                  onClick={handleSettings}
                  className="text-sm text-cl-text focus:bg-cl-accent/10 focus:text-cl-accent cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-sm text-cl-text focus:bg-cl-error/10 focus:text-cl-error cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </>
            )}
            {!isAuthenticated && (
              <DropdownMenuItem
                onClick={() => actions.login()}
                className="text-sm text-cl-text focus:bg-cl-accent/10 focus:text-cl-accent cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
