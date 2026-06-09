import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "@/types";
import { mockUsers } from "@/mocks/data";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (_email: string, _password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));
    setUser(mockUsers.sarah);
  }, []);

  const register = useCallback(
    async (_email: string, _password: string, displayName: string) => {
      await new Promise((r) => setTimeout(r, 500));
      setUser({
        id: crypto.randomUUID(),
        email: _email,
        displayName,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7C3AED&color=fff`,
        createdAt: new Date().toISOString(),
      });
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
