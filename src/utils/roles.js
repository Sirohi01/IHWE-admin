// Role helpers — role strings come from adminInfo (e.g. "IHWE–Super Administrator").
export const getAdminInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
  } catch {
    return {};
  }
};

export const isSuperAdminRole = (role = "") => {
  const slug = String(role).toLowerCase().replace(/[^a-z]/g, "");
  return slug === "superadmin" || slug === "ihwesuperadministrator";
};

export const isCurrentUserSuperAdmin = () => isSuperAdminRole(getAdminInfo().role);
