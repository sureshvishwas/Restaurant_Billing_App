import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api";
import type { User } from "../types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  message: string;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  setMessage: (message: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("billfast_token");
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("billfast_token"))
      .finally(() => setLoading(false));
  }, []);

  const applyAuth = (data: { token: string; user: User }) => {
    localStorage.setItem("billfast_token", data.token);
    setUser(data.user);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      message,
      setMessage,
      signup: async (payload) => {
        const { data } = await authApi.signup(payload);
        applyAuth(data);
      },
      login: async (payload) => {
        const { data } = await authApi.login(payload);
        applyAuth(data);
      },
      logout: () => {
        localStorage.removeItem("billfast_token");
        setUser(null);
      }
    }),
    [user, loading, message]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
