import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import apiClient from "../lib/apiClient";

export interface User {
  id: string;
  githubId: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Member {
  _id: string;
  loginEmail?: string;
  loginEmailVerified?: boolean;
  status?: string;
  contact?: {
    firstName?: string;
    lastName?: string;
    phones?: string[];
  };
  profile?: {
    nickname?: string;
    photo?: {
      url?: string;
    };
    title?: string;
  };
  _createdDate?: string;
  lastLoginDate?: string;
}

interface AuthContextType {
  member: Member | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  actions: {
    login: () => void;
    logout: () => Promise<void>;
    loadCurrentMember: () => Promise<void>;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://codelens-platform.onrender.com";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [member, setMember] = useState<Member | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentMember = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/auth/me");
      if (res.data && res.data.isAuthenticated && res.data.user) {
        const u: User = res.data.user;
        const mappedMember: Member = {
          _id: u.id,
          loginEmail: u.email || "",
          loginEmailVerified: true,
          status: "APPROVED",
          contact: {
            firstName: u.username,
            lastName: "",
          },
          profile: {
            nickname: u.username,
            photo: {
              url: u.avatarUrl || "",
            },
            title: "GitHub Member",
          },
          _createdDate: u.createdAt,
          lastLoginDate: new Date().toISOString(),
        };
        setMember(mappedMember);
        setIsAuthenticated(true);
      } else {
        setMember(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error("Failed to load user session:", err);
      setError(err?.message || "Failed to load session");
      setMember(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `${API_BASE_URL}/api/auth/github?returnToUrl=${returnUrl}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Failed to logout on server:", err);
    } finally {
      setMember(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    loadCurrentMember();
  }, [loadCurrentMember]);

  const value = {
    member,
    isAuthenticated,
    isLoading,
    error,
    actions: {
      login,
      logout,
      loadCurrentMember,
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useMember() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useMember must be used within an AuthProvider/MemberProvider",
    );
  }
  return context;
}
