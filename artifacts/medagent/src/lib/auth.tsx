import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

interface User {
  name: string;
  email: string;
  picture?: string;
  provider?: "google" | "email";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, picture?: string, provider?: "google" | "email") => void;
  loginWithGoogle: (googleUser: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored =
      localStorage.getItem("nirogi-g-one-auth") ?? localStorage.getItem("medagent-auth");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const login = (email: string, name = "User", picture?: string, provider: "google" | "email" = "email") => {
    const newUser = { email, name, picture, provider };
    setUser(newUser);
    localStorage.setItem("nirogi-g-one-auth", JSON.stringify(newUser));
  };

  const loginWithGoogle = (googleUser: any) => {
    const { name, email, picture } = googleUser;
    login(email, name, picture, "google");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("nirogi-g-one-auth");
    localStorage.removeItem("medagent-auth");
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
