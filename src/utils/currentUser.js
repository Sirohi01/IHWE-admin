const getStoredUserValue = (fields = []) => {
  const keys = ["adminInfo", "user", "admin"];
  for (const key of keys) {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (!raw) continue;
    try {
      const user = JSON.parse(raw);
      for (const field of fields) {
        const value = user[field];
        if (value && String(value).trim()) return String(value).trim();
      }
    } catch (error) {
      // Ignore malformed storage values and keep checking fallbacks.
    }
  }

  return "";
};

export const getCurrentUserName = (fallback = "Admin") => {
  const direct =
    localStorage.getItem("user_fullname") ||
    sessionStorage.getItem("user_fullname") ||
    localStorage.getItem("user_name") ||
    sessionStorage.getItem("user_name");

  if (direct && direct.trim()) return direct.trim();

  const name = getStoredUserValue(["fullName", "user_fullname", "name", "username", "user_name", "admin_name", "email"]);
  if (name) return name;

  return fallback;
};

export const getCurrentUsername = () =>
  getStoredUserValue(["username", "user_name", "admin_name"]);

export const getCurrentUserMobile = () =>
  getStoredUserValue(["mobile", "phone", "mobileNo", "mobile_no"]);

export const getCurrentUserDepartment = () =>
  getStoredUserValue(["department", "dept"]);

export const getCurrentUserRole = () =>
  getStoredUserValue(["role"]);

// { username, role } for the logged-in admin — reads the same storage
// as getCurrentUsername/getCurrentUserRole in one call, for components
// that need both to scope a leads request.
export const getCurrentAdminUser = () => ({
  username: getCurrentUsername(),
  role: getCurrentUserRole(),
});

// Full lead visibility (no forwardTo scoping) is limited to Super
// Administrator and Sales Manager — every other role only sees leads
// forwarded to them or that they personally added. Mirrors the backend
// check in ihwe/controllers/companyController.js (hasFullLeadAccess).
export const hasFullLeadAccess = (role) => {
  const cleanRole = role ? String(role).toLowerCase().replace(/[^a-z]/g, "") : "";
  return cleanRole.includes("superadmin") || cleanRole.includes("salesmanager");
};
