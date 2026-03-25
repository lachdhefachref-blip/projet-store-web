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
    
    // دالة تسجيل الدخول
    login: async (credentials) => {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      setStoredAuth(data);
      setUser(data.user);
      return data;
    },
    register: async (formData) => {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setStoredAuth(data);
      setUser(data.user);
      return data;
    },

    logout: async () => {
      try {
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}