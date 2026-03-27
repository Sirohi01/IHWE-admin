import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api$/, "");
  }
  
  const { hostname, protocol } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  // Handle common VPS subdomain patterns (admin.domain.com -> domain.com)
  return window.location.origin.replace(/:\/\/admin\./, "://");
};

export const SERVER_URL = getBaseUrl();
export const API_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: SERVER_URL,
});

// ✅ REQUEST INTERCEPTOR - Token add karne ke liye
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token Added:", token.substring(0, 30) + "...");
      console.log("📤 API Request:", config.method.toUpperCase(), config.url);
    } else {
      // Silence warning for login/register to avoid confusion
      if (!config.url.includes("/login") && !config.url.includes("/register")) {
        console.warn("ℹ️ No token found for this request (might be public or first-time login)");
      }
      console.log("📤 API Request (No Auth):", config.method.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR - Token validation
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("🔒 Session Expired or Unauthorized. Logging out...");

      // ✅ Clear storage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminInfo");

      // Redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;