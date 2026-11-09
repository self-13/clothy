import axios from "axios";

const rawBase = (import.meta.env.VITE_BASE_URL || "").trim().replace(/\/+$/, "");
const baseURL = rawBase
  ? rawBase.endsWith("/api")
    ? rawBase
    : `${rawBase}/api`
  : "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  },
});

// Helper to set Authorization header cleanly on AxiosHeaders or plain objects
const attachAuthToken = (config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

// Attach Authorization Bearer token to api instance requests
api.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

// Global default axios setup (for slices/components using direct axios calls)
axios.defaults.withCredentials = true;
axios.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

// Global response error handler
const handleAuthError = (error) => {
  const isCheckAuth = error.config?.url?.includes("/auth/check-auth");
  const isLogin = error.config?.url?.includes("/auth/login");

  if (error.response && error.response.status === 401 && !isCheckAuth && !isLogin) {
    // Clear auth credentials only on explicit 401 Unauthorized from protected actions
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, handleAuthError);
axios.interceptors.response.use((response) => response, handleAuthError);

export default api;
