import { Link, useNavigate, useParams } from "react-router-dom";
import { Code2, User, LogOut, Settings, Menu } from "lucide-react";
import { useMember } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/context/SidebarContext";

export default function Header() {
  const navigate = useNavigate();
  const { member, isAuthenticated, isLoading, actions } = useMember();
  const { analysisId } = useParams();
  const { toggle } = useSidebar();

  const handleLogout = async () => {
    await actions.logout();
    navigate("/");
  };

  const handleSettings = () => {
    navigate("/profile");
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_0_rgba(0,0,0,0.35)]"
      style={{ WebkitBackdropFilter: "blur(24px)" }}
    >
      <div className="mx-auto flex h-14 max-w-[120rem] items-center justify-between px-4 sm:px-8">
        {/* ── Left: hamburger + logo ── */}
        <div className="flex items-center gap-3">
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

        {/* ── Right: Auth section ── */}
        <div className="flex items-center gap-3">
          {/* Loading skeleton */}
          {isLoading && (
            <div className="h-8 w-28 animate-pulse rounded-lg bg-white/5" />
          )}

          {/* ── NOT authenticated: glowing Sign In button ── */}
          {!isLoading && !isAuthenticated && (
            <button
              id="signin-btn"
              onClick={() => actions.login()}
              className="group flex items-center gap-2 rounded-lg border border-cl-accent/50 bg-cl-accent/10 px-4 py-1.5 text-sm font-semibold text-cl-accent transition-all duration-200 hover:bg-cl-accent hover:text-white hover:border-cl-accent hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] active:scale-95"
            >
              {/* GitHub mark */}
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Sign In
            </button>
          )}

          {/* ── Authenticated: avatar + username dropdown ── */}
          {!isLoading && isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border border-cl-border bg-cl-surface px-3 py-1.5 text-sm font-medium text-cl-text transition-all duration-200 hover:border-cl-accent/40 hover:bg-cl-accent/10 hover:text-cl-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cl-accent">
                  {member?.profile?.photo?.url ? (
                    <img
                      src={member.profile.photo.url}
                      alt={member.profile.nickname || "User"}
                      className="h-5 w-5 rounded-full object-cover ring-1 ring-cl-accent/30"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cl-accent/20">
                      <User className="h-3 w-3 text-cl-accent" />
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {member?.profile?.nickname ||
                      member?.contact?.firstName ||
                      "Account"}
                  </span>
                  {/* chevron */}
                  <svg
                    className="h-3 w-3 text-cl-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 border-cl-border bg-cl-surface/95 backdrop-blur-lg"
              >
                {/* User info header */}
                <div className="px-2 py-2">
                  <p className="text-xs font-medium text-cl-text truncate">
                    {member?.profile?.nickname ||
                      member?.contact?.firstName ||
                      "User"}
                  </p>
                  <p className="text-xs text-cl-muted truncate">
                    {member?.loginEmail || "GitHub Account"}
                  </p>
                </div>

                <DropdownMenuSeparator className="bg-cl-border" />

                <DropdownMenuItem
                  onClick={handleSettings}
                  className="text-sm text-cl-text focus:bg-cl-accent/10 focus:text-cl-accent cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-cl-border" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-sm text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
