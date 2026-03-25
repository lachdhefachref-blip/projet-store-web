// src/lib/api.js

export function getApiBase() {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    const isLocal = h === "localhost" || h === "127.0.0.1";
    if (isLocal) return "http://localhost:5000/api";
    return env || `${window.location.origin}/api`;
  }
  
  return env || "http://localhost:5000/api";
}

export function getImageUrl(path) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  if (!cleanPath.startsWith("products/")) {
    return `/products/${cleanPath}`;
  }
  
  return `/${cleanPath}`;
}

const storageKeys = {
  access: "storeweb:v2:accessToken",
  refresh: "storeweb:v2:refreshToken",
  user: "storeweb:v2:user",
};

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKeys.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth({ user, accessToken, refreshToken }) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(storageKeys.user, JSON.stringify(user));
  if (accessToken) localStorage.setItem(storageKeys.access, accessToken);
  if (refreshToken) localStorage.setItem(storageKeys.refresh, refreshToken);
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKeys.user);
  localStorage.removeItem(storageKeys.access);
  localStorage.removeItem(storageKeys.refresh);
}

export async function api(path, options = {}) {
  const basePath = getApiBase().endsWith('/') ? getApiBase().slice(0, -1) : getApiBase();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith("http") ? path : `${basePath}${cleanPath}`;
  const headers = new Headers(options.headers || {});

  const token = typeof window !== "undefined" ? localStorage.getItem(storageKeys.access) : null;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { 
    ...options, 
    headers,
    mode: 'cors', 
  });
  
  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { error: `HTTP ${res.status}` };
    }

    const error = new Error(errorData.error || `Error ${res.status}`);
    error.status = res.status; 
    error.details = errorData.details; 
    throw error;
  }
  
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}