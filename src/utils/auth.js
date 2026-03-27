// src/utils/auth.js

export const logout = () => {
  // 🔐 Clear auth data from all storage
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminInfo");
  localStorage.removeItem("rememberMe");

  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminInfo");

  // ✅ Delayed redirect (SweetAlert ke baad)
  setTimeout(() => {
    window.location.replace("/login");
  }, 100);
};

export const isAuthenticated = () => {
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  if (rememberMe) {
    return !!localStorage.getItem("adminToken");
  }
  return !!sessionStorage.getItem("adminToken");
};

