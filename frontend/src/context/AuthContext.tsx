import { createContext, useContext, useState, type ReactNode } from "react";
import api from "../services/api";
import {
  type AuthUser,
  clearSession,
  getStoredUser,
  setSession,
} from "../services/authStorage";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    setSession(response.data.access_token, response.data.user);
    setUser(response.data.user);
  };

  const signup = async (fullName: string, email: string, password: string) => {
    const response = await api.post("/auth/signup", {
      full_name: fullName,
      email,
      password,
    });
    setSession(response.data.access_token, response.data.user);
    setUser(response.data.user);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
