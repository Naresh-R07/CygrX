import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api, setAccessToken, getAccessToken } from "../api/client";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "AUDITOR" | "VIEWER";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuditor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      api.auth.me()
        .then((data) => setUser(data.user))
        .catch(() => setAccessToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    setAccessToken(data.accessToken);
    localStorage.setItem("cygrx_refresh_token", data.refreshToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, role?: string) => {
    const data = await api.auth.register(email, password, name, role);
    setAccessToken(data.accessToken);
    localStorage.setItem("cygrx_refresh_token", data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem("cygrx_refresh_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin: user?.role === "ADMIN",
      isAuditor: user?.role === "ADMIN" || user?.role === "AUDITOR",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
