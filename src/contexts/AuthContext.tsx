"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth-storage";
import type { LoginResponse, User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setTokenState(null);
      return;
    }
    const me = await api.get<User>("/auth/me", currentToken);
    setUser(me);
    setTokenState(currentToken);
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => {
        clearToken();
        setUser(null);
        setTokenState(null);
      })
      .finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      setToken(response.access_token);
      setTokenState(response.access_token);
      const me = await api.get<User>("/auth/me", response.access_token);
      setUser(me);
      if (response.must_change_password) {
        router.push("/cambiar-contrasena");
      } else if (me.role.code === "CLIENT") {
        router.push("/portal");
      } else {
        router.push("/dashboard");
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setTokenState(null);
    router.push("/login");
  }, [router]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      if (user.role.code === "ADMIN") return true;
      return user.permissions?.includes(permission) ?? false;
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout, refreshUser, hasPermission }),
    [user, token, isLoading, login, logout, refreshUser, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
