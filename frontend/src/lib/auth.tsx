import { API_URL } from "@/config";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type User = {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  avatar?: string;
  avatarSource?: string;
  provider?: string;
  roles?: string[];
  stripeAccountId?: string | null;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  google: (credential: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
const TOKEN_KEY = "ledgerly_token";

// ✅ SINGLE SOURCE OF TOKEN
export function getToken() {
  if (typeof window === "undefined") return null; // Server-side
  return localStorage.getItem(TOKEN_KEY);
}

// ✅ API HELPER (FIXED)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function api<T = any>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(opts.body && !(opts.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...((opts.headers as Record<string, string>) ?? {}),
  };

  if (opts.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  const persist = (t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  };

  const clear = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const refresh = async () => {
    const t = getToken();

    if (!t) {
      clear();
      return;
    }

    try {
      const data = await api<{ user: User }>("/api/auth/me");
      setUser(data.user);
      setToken(t);
    } catch {
      clear(); // ✅ important if token expired
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  // ✅ SIGNIN
  const signin: AuthCtx["signin"] = async (email, password) => {
    const data = await api<{ token: string; user: User }>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });

    persist(data.token, data.user);
  };

  // ✅ SIGNUP
  const signup: AuthCtx["signup"] = async (name, email, password) => {
    const data = await api<{ token: string; user: User }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      auth: false,
    });

    persist(data.token, data.user);
  };

  // ✅ GOOGLE LOGIN (CRITICAL FIX)
  const google: AuthCtx["google"] = async (credential) => {
    const data = await api<{ token: string; user: User }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
      auth: false,
    });

    if (!data.token) {
      throw new Error("No token returned");
    }

    persist(data.token, data.user);
  };

  const logout = () => {
    clear();
    api("/api/auth/logout", { method: "POST" }).catch(() => {});
  };

  return (
    <Ctx.Provider value={{ user, token, loading, signin, signup, google, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
