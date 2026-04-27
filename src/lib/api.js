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

const unwrapApiResponse = (response) => response?.data ?? response;

export const heroBackgroundApi = {
  getAll: async () => {
    const payload = unwrapApiResponse(
      await api.get(`/api/hero-background?t=${Date.now()}`),
    );
    return payload.success ? payload.data : [];
  },
  getByPage: async (pageName) => {
    const items = await heroBackgroundApi.getAll();
    return items.find((item) => item.pageName === pageName) || null;
  },
};

export const buyerRegistrationApi = {
  submit: async (payload) => {
    const isFormData = payload instanceof FormData;
    const response = await api.post("/api/buyer-registration", payload, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
    return unwrapApiResponse(response);
  },
  getAll: async () => {
    const payload = unwrapApiResponse(await api.get("/api/buyer-registration"));
    return payload.success ? payload.data : [];
  },
  delete: async (id) => {
    const response = await api.delete(`/api/buyer-registration/${id}`);
    return unwrapApiResponse(response);
  },
  createOrder: async (amount) => {
    const response = await api.post("/api/buyer-registration/create-order", {
      amount,
    });
    return unwrapApiResponse(response);
  },
  verifyPayment: async (regId, paymentDetails) => {
    const response = await api.post("/api/buyer-registration/verify-payment", {
      regId,
      paymentDetails,
    });
    return unwrapApiResponse(response);
  },
  getConfig: async () => {
    const response = await api.get("/api/buyer-registration/config");
    return unwrapApiResponse(response);
  },
};

export const internationalBuyerApi = {
  submit: async (payload) => {
    const isFormData = payload instanceof FormData;
    const response = await api.post("/api/international-buyer/register", payload, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
    return unwrapApiResponse(response);
  },
  getAll: async () => {
    const payload = unwrapApiResponse(await api.get("/api/international-buyer"));
    return payload.success ? payload.data : [];
  },
  delete: async (id) => {
    const response = await api.delete(`/api/international-buyer/${id}`);
    return unwrapApiResponse(response);
  },
  getConfig: async () => {
    const response = await api.get("/api/international-buyer/config");
    return unwrapApiResponse(response);
  },
};

export const otpApi = {
  request: async (identifier, type, name) => {
    const response = await api.post("/api/otp/request", {
      identifier,
      type,
      name,
    });
    return unwrapApiResponse(response);
  },
  verify: async (identifier, otp, type) => {
    const response = await api.post("/api/otp/verify", {
      identifier,
      otp,
      type,
    });
    return unwrapApiResponse(response);
  },
};

export const policyApi = {
  getByPage: async (page) => {
    const payload = unwrapApiResponse(await api.get(`/api/policies/${page}`));
    return payload.success ? payload.data : null;
  },
};

export const crmApi = {
  getCountries: async () => {
    const payload = unwrapApiResponse(await api.get("/api/crm-countries"));
    return Array.isArray(payload) ? payload : payload.data || [];
  },
  getStates: async (countryCode) => {
    const query = countryCode ? `?countryCode=${countryCode}` : "";
    const payload = unwrapApiResponse(await api.get(`/api/crm-states${query}`));
    return Array.isArray(payload) ? payload : payload.data || [];
  },
  getCities: async (stateCode) => {
    const query = stateCode ? `?stateCode=${stateCode}` : "";
    const payload = unwrapApiResponse(await api.get(`/api/crm-cities${query}`));
    return Array.isArray(payload) ? payload : payload.data || [];
  },
};

export default api;
