"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi, type AuthenticatedUser } from "@/lib/api-client";

export type { AuthenticatedUser } from "@/lib/api-client";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  loading: boolean;
  setAuthenticatedUser: (user: AuthenticatedUser) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const { user } = await authApi.currentUser();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();
  }, []);

  async function signOut() {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }

  return <AuthContext.Provider value={{ user, loading, setAuthenticatedUser: setUser, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within an AuthProvider.");
  return value;
}

export function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading || !user) return <main className="grid min-h-screen place-items-center">Checking your session…</main>;
  return <>{children}</>;
}
