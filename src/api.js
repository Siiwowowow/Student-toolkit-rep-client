import axios from "axios";
import { auth } from "./Firebase/firebase.init";

export const API_BASE = (
  import.meta.env.VITE_API_BASE || "https://student-toolkit-server-real.vercel.app"
).replace(/\/+$/, "");

// Firebase tokens and database session tokens identify users; MongoDB decides roles.
export async function authenticatedRequest(user, path, options = {}) {
  if (!user) throw Object.assign(new Error("Sign in is required."), { status: 401 });
  const token = await user.getIdToken();
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: "no-store" });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const profileUnavailable = response.status === 404 && ["/users", "/users/me"].includes(path);
    throw Object.assign(new Error(result?.message || (profileUnavailable ? "Profile service is temporarily unavailable. Your details have been kept; please try again." : `Request failed with status ${response.status}.`)), { status: response.status });
  }
  return result.data;
}


// Use the active database or Firebase session for student data requests.
export const apiClient = axios.create();
apiClient.interceptors.request.use(async (config) => {
  if (new URL(config.url, API_BASE).origin !== new URL(API_BASE).origin) return config;
  let token;
  try { token = localStorage.getItem("toolkit-session"); } catch { /* Optional persistence. */ }
  if (!token && auth.currentUser) token = await auth.currentUser.getIdToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
