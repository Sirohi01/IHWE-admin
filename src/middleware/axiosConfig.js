import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // ✅ enable cookies globally
});

// Optional: Add request interceptor for logging or token fallback
// API.interceptors.request.use(
//   (config) => {
//     console.log("➡️ Request:", config.url);
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// 🔐 Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Optional: Add response interceptor for auto-logout on 401
// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.warn("Unauthorized! Redirecting to login...");
//       // Optionally trigger logout or redirect
//     }
//     return Promise.reject(error);
//   }
// );
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default API;
