import { Link, useNavigate, useParams } from "react-router-dom";
import { Code2, User, LogOut, Settings } from "lucide-react";
import { useMember } from "@/integrations";
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-[120rem] items-center justify-between px-8">
        

        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-neon-teal to-secondary">
            <Code2 className="h-6 w-6 text-black" />
          </div>
          <span className="font-heading text-xl font-bold text-white">
            CodeLens <span className="text-neon-teal">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="font-paragraph text-sm text-foreground/80 transition-colors hover:text-neon-teal"
          >
            Dashboard
          </Link>
          {analysisId ? (
            <>
              <Link
                to={`${basePath}/code-quality`}
                className="font-paragraph text-sm text-foreground/80 transition-colors hover:text-neon-teal"
              >
                Code Quality
              </Link>
              <Link
                to={`${basePath}/code-review`}
                className="font-paragraph text-sm text-foreground/80 transition-colors hover:text-neon-teal"
              >
                AI Review
              </Link>
              <Link
                to={`${basePath}/developer-skills`}
                className="font-paragraph text-sm text-foreground/80 transition-colors hover:text-neon-teal"
              >
                Skills Profile
              </Link>
              <Link
                to={`${basePath}/best-practices`}
                className="font-paragraph text-sm text-foreground/80 transition-colors hover:text-neon-teal"
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
                  className="font-paragraph text-sm text-foreground/40 cursor-not-allowed"
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
              className="h-10 w-10 rounded-full border border-white/10 bg-white/5 p-0 hover:bg-white/10"
            >
              <User className="h-5 w-5 text-neon-teal" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-white/10 bg-deep-space-blue/95 backdrop-blur-lg"
          >
            {isAuthenticated && (
              <>
                <div className="px-2 py-1.5 text-xs font-paragraph text-foreground/60">
                  {member?.loginEmail || "User"}
                </div>
                <DropdownMenuItem
                  onClick={handleSettings}
                  className="font-paragraph text-sm text-foreground/80 focus:bg-white/10 focus:text-neon-teal cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="font-paragraph text-sm text-foreground/80 focus:bg-white/10 focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </>
            )}
            {!isAuthenticated && (
              <DropdownMenuItem
                onClick={() => actions.login()}
                className="font-paragraph text-sm text-foreground/80 focus:bg-white/10 focus:text-neon-teal cursor-pointer"
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
