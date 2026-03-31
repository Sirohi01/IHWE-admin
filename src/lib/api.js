import axios from "axios";

const getBaseUrl = () => {
  // Always prioritize the ENV value if present
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api$/, "");
  }

  // Fallback for local development or subdomains
  const { hostname, origin } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  return origin.replace(/:\/\/admin\./, "://");
};

export const SERVER_URL = getBaseUrl();
export const API_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: SERVER_URL,
});

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token Added");
    } else {
      if (!config.url.includes("/login") && !config.url.includes("/register")) {
        console.warn("ℹ️ No token found");
      }
    }

    console.log("📤 API Request:", config.method.toUpperCase(), config.url);

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ RESPONSE INTERCEPTOR (FIXED)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url.includes("/login") ||
      error.config?.url.includes("/register") ||
      error.config?.url.includes("/verify-otp");

    if (error.response?.status === 401 && !isAuthRoute) {
      console.error("🔒 Session Expired. Logging out...");

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminInfo");

      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default api;
