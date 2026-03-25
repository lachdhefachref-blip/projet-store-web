"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearStoredAuth, getStoredUser, setStoredAuth } from "@/lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const data = getStoredUser();
    if (data) setUser(data);
    setIsReady(true);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin" || user?.role === "merchant",
    
    login: async (credentials) => {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      setStoredAuth(data);
      setUser(data.user);
      return data;
    },

    // أضفنا async هنا لإصلاح خطأ الـ .then() في النافبار
    logout: async () => {
      try {
        // إذا أردت استدعاء API الخروج مستقبلاً:
        // await api("/auth/logout", { method: "POST" });
      } catch (err) {
        console.error("Logout error:", err);
      }
      clearStoredAuth();
      setUser(null);
    }
  }), [user]);

  if (!isReady) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}