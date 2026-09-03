import axios from "axios";

const getBaseUrl = () => {
  // Always prioritize the ENV value if present
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/api$/, "");
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

// Determine Frontend URL (Main Website)
export const FRONTEND_URL = (import.meta.env.VITE_FRONTEND_URL ||
  (window.location.hostname === "localhost" ? "http://localhost:8080" : window.location.origin.replace(/:\/\/admin\./, "://"))
).replace(/\/$/, "");

const api = axios.create({
  baseURL: SERVER_URL,
});

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    config.headers["ngrok-skip-browser-warning"] = "true";

    const token =
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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

export const heroApi = {
  getAll: async () => {
    const payload = unwrapApiResponse(await api.get("/api/hero/all"));
    return payload.success ? payload.data : [];
  },
};

export const settingsApi = {
  get: async () => {
    const payload = unwrapApiResponse(await api.get("/api/settings"));
    return payload.success ? payload.data : null;
  },
};

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
  request: async (identifier, type, name, source) => {
    const response = await api.post("/api/otp/request", {
      identifier,
      type,
      name,
      source,
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

export const socialMediaApi = {
  get: async () => {
    const payload = unwrapApiResponse(await api.get("/api/social-media"));
    return payload.success ? payload.data : null;
  },
};

export const printingBrandingPartnerApi = {
  get: async () => {
    const payload = unwrapApiResponse(await api.get("/api/printing-branding-partner"));
    return payload.success ? payload.data : null;
  },
  save: async (data) => {
    const payload = unwrapApiResponse(await api.put("/api/printing-branding-partner", data));
    return payload.success ? payload.data : null;
  },
  uploadImage: async (formData) => {
    const payload = unwrapApiResponse(await api.post("/api/printing-branding-partner/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }));
    return payload;
  }
};

export const logisticPartnerApi = {
  get: async () => {
    const payload = unwrapApiResponse(await api.get("/api/logistic-partner"));
    return payload.success ? payload.data : null;
  },
  save: async (data) => {
    const payload = unwrapApiResponse(await api.put("/api/logistic-partner", data));
    return payload.success ? payload.data : null;
  },
  uploadImage: async (formData) => {
    const payload = unwrapApiResponse(await api.post("/api/logistic-partner/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }));
    return payload;
  }
};

export const hospitalityPartnerApi = {
  get: async () => {
    const payload = unwrapApiResponse(await api.get("/api/hospitality-partner"));
    return payload.success ? payload.data : null;
  },
  save: async (data) => {
    const payload = unwrapApiResponse(await api.put("/api/hospitality-partner", data));
    return payload.success ? payload.data : null;
  },
  uploadImage: async (formData) => {
    const payload = unwrapApiResponse(await api.post("/api/hospitality-partner/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }));
    return payload;
  }
};

export const aiVerificationSettingsApi = {
  get: async () => {
    const payload = unwrapApiResponse(await api.get("/api/ai-verification-settings"));
    return payload.success ? payload.data : null;
  },
  save: async (data) => {
    const response = await api.put("/api/ai-verification-settings", data);
    return unwrapApiResponse(response);
  },
  testConnection: async (data) => {
    const response = await api.post("/api/ai-verification-settings/test", data);
    return unwrapApiResponse(response);
  },
  testDocument: async (formData) => {
    const response = await api.post("/api/ai-verification-settings/test-document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrapApiResponse(response);
  },
};

export const pmsApi = {
  getById: async (id) => {
    const payload = unwrapApiResponse(await api.get(`/api/msme-pms-scheme/${id}`));
    return payload.success ? payload.data : null;
  },
  updateStatus: async (id, status, reason) => {
    const response = await api.patch(`/api/msme-pms-scheme/${id}/status`, {
      status,
      ...(reason ? { reason } : {}),
    });
    return unwrapApiResponse(response);
  },
  saveStepById: async (id, step, data) => {
    const payload = unwrapApiResponse(await api.put(`/api/msme-pms-scheme/${id}/step/${step}`, data));
    return payload.success ? payload.data : null;
  },
  getForEdit: async (id) => {
    const payload = unwrapApiResponse(await api.get(`/api/msme-pms-scheme/${id}/edit`));
    return payload.success ? payload.data : null;
  },
  uploadDocumentById: async (id, documentType, files, onProgress) => {
    const formData = new FormData();
    const fileList = files instanceof FileList || Array.isArray(files) ? Array.from(files) : [files];
    fileList.forEach((file) => formData.append('file', file));
    const response = await api.post(`/api/msme-pms-scheme/${id}/documents/${documentType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (event) => onProgress(event.total ? Math.round((event.loaded * 100) / event.total) : 0)
        : undefined,
    });
    return unwrapApiResponse(response);
  },
  deleteDocumentById: async (id, documentType, documentId) => {
    const payload = unwrapApiResponse(await api.delete(`/api/msme-pms-scheme/${id}/documents/${documentType}`, {
      params: documentId ? { documentId } : undefined,
    }));
    return payload.success ? payload.data : null;
  },
  submitById: async (id) => unwrapApiResponse(await api.post(`/api/msme-pms-scheme/${id}/submit`)),
  updateStage: async (id, stage) => {
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/stage`, { stage }));
    return payload.success ? payload.data : null;
  },
  updatePortal: async (id, data) => {
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/portal`, data));
    return payload.success ? payload.data : null;
  },
  uploadPortalAcknowledgement: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const payload = unwrapApiResponse(await api.post(`/api/msme-pms-scheme/${id}/portal-acknowledgement`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
    return payload.success ? payload.data : null;
  },
  updateClaimSubmission: async (id, data) => {
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/claim-submission`, data));
    return payload.success ? payload.data : null;
  },
  updateSanction: async (id, data) => {
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/sanction`, data));
    return payload.success ? payload.data : null;
  },
  updateReimbursement: async (id, data) => {
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/reimbursement`, data));
    return payload.success ? payload.data : null;
  },
  updateDocumentStatus: async (id, documentId, fields) => {
    const body = typeof fields === 'string' ? { status: fields } : fields;
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/documents/${documentId}/status`, body));
    return payload.success ? payload.data : null;
  },
  markDocumentNotApplicable: async (id, documentType, notApplicable) => {
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/documents/${documentType}/not-applicable`, { notApplicable }));
    return payload.success ? payload.data : null;
  },
  updateUdyamDetails: async (id, data) => {
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/udyam-details`, data));
    return payload.success ? payload.data : null;
  },
  updatePortalOtpContact: async (id, data) => {
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/portal-otp-contact`, data));
    return payload.success ? payload.data : null;
  },
  runAiScreening: async (id) => unwrapApiResponse(await api.post(`/api/msme-pms-scheme/${id}/ai-screening`)),
  setActionRequired: async (id, body) => {
    const payload = unwrapApiResponse(await api.patch(`/api/msme-pms-scheme/${id}/action-required`, body));
    return payload.success ? payload.data : null;
  },
};
export default api;
