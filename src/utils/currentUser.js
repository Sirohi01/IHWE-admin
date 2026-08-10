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
