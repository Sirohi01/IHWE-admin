import { ChevronDown, X, Menu } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { menuItems } from "../data/menuItems";
import { NavLink, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { logout } from "../utils/auth";
import api, { SERVER_URL } from "../lib/api";

// ─── Default theme — must match the hardcoded static values exactly ──────────
const DEFAULT_THEME = {
  bgColor: "#ffffff",
  iconColor: "#23471d",
  textColor: "#0F2854",
  hoverColor: "#EFF6FF",
  activeColor: "#DBEAFE",
  toggleColor: "#23471d",
  hamburgerColor: "#000000",
};

// Border colour set to requested Dark Green
const BORDER_COLOR = "#23471d";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    if (info) {
      setCurrentUser(JSON.parse(info));
    }
  }, []);

  const [logo, setLogo] = useState("");

  useEffect(() => {
    api.get("/api/settings")
      .then(res => {
        if (res.data.success && res.data.data.logo) {
          setLogo(res.data.data.logo);
        }
      })
      .catch(err => console.error("Error fetching sidebar settings:", err));
  }, []);

  const [fullProfile, setFullProfile] = useState(null);

  useEffect(() => {
    if (currentUser?.username) {
      api.get("/api/admin/all")
        .then(res => {
          if (res.data.success) {
            const match = res.data.data.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
            if (match) {
              setFullProfile(match);
            }
          }
        })
        .catch(err => console.error("Error fetching full admin profile:", err));
    }
  }, [currentUser]);

  const [roleData, setRoleData] = useState(null);

  useEffect(() => {
    if (currentUser?.role) {
      api.get("/api/roles")
        .then(res => {
          if (res.data.success) {
            const role = res.data.data.find(r => r.name.toLowerCase() === currentUser.role.toLowerCase());
            if (role) setRoleData(role);
          }
        })
        .catch(err => console.error("Error fetching permissions:", err));
    }
  }, [currentUser]);

  const groupedMenuItems = useMemo(() => {
    if (!currentUser) return [];

    const perms = roleData?.permissions || {};
    const roleSlug = currentUser.role.toLowerCase().replace(/[^a-z]/g, '');
    const isSuperAdmin = roleSlug === 'superadmin';

    const results = [];
    let currentSection = null;

    menuItems.forEach((item) => {
      if (item.type === "heading") {
        currentSection = { ...item, type: "section", children: [] };
        results.push(currentSection);
      } else {
        let isVisible = false;
        let visibleChildren = item.children;

        if (isSuperAdmin) {
          isVisible = true;
          visibleChildren = item.children; // Show all children for super-admin
        } else {
          if (item.type === "item") {
            isVisible = perms[item.label] === true;
          } else if (item.type === "dropdown") {
            visibleChildren = item.children?.filter(child => perms[child.label] === true);
            isVisible = visibleChildren && visibleChildren.length > 0;
          }
        }

        if (isVisible) {
          const finalItem = { ...item, children: visibleChildren };
          if (currentSection) {
            currentSection.children.push(finalItem);
          } else {
            results.push(finalItem);
          }
        }
      }
    });

    return results.filter(item => item.type !== "section" || item.children.length > 0);
  }, [currentUser, roleData]);

  useEffect(() => {
    let activeSection = null;
    let activeDropdown = null;

    groupedMenuItems.forEach((group) => {
      if (group.type === "section") {
        let hasActive = false;
        group.children.forEach((child) => {
          if (child.type === "dropdown" && child.children?.some((c) => location.pathname === c.path)) {
            activeDropdown = child.label;
            hasActive = true;
          } else if (child.path === location.pathname) {
            hasActive = true;
          }
        });
        if (hasActive) activeSection = group.label;
      } else if (group.type === "dropdown" && group.children?.some((c) => location.pathname === c.path)) {
        activeDropdown = group.label;
      }
    });

    if (activeSection) setOpenSections((prev) => ({ ...prev, [activeSection]: true }));
    if (activeDropdown) setOpenDropdown(activeDropdown);
  }, [location.pathname, groupedMenuItems]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "You will be logged out from admin panel",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  const cssVars = {
    "--sb-bg": theme.bgColor,
    "--sb-icon": theme.iconColor,
    "--sb-text": theme.textColor,
    "--sb-hover": theme.hoverColor,
    "--sb-active": theme.activeColor,
    "--sb-toggle": theme.toggleColor,
    "--sb-border": BORDER_COLOR,
  };

  const toggleDropdown = (label) => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setOpenDropdown(label);
    } else {
      setOpenDropdown(openDropdown === label ? null : label);
    }
  };

  const renderMenuItem = (item) => {
    if (item.type === "item") {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.label}
          to={item.path}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) => `sb-item flex items-center gap-3 px-3 py-1.5 rounded-md border border-transparent ${isActive ? "active" : ""} ${!sidebarOpen && "justify-center"}`}
        >
          <Icon size={16} className="sb-icon shrink-0" />
          {sidebarOpen && <span className="sb-label whitespace-nowrap">{item.label}</span>}
        </NavLink>
      );
    }

    if (item.type === "dropdown") {
      const Icon = item.icon;
      const isOpen = openDropdown === item.label;
      const hasActiveChild = item.children?.some(child => location.pathname === child.path);

      return (
        <div key={item.label} className="w-full">
          <button
            onClick={() => toggleDropdown(item.label)}
            className={`sb-dropdown-btn w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-all duration-200 ${!sidebarOpen && "justify-center"} ${hasActiveChild
                ? "active-dropdown"
                : isOpen
                  ? "bg-white/8 text-white"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={16} className="sb-icon shrink-0" />
              {sidebarOpen && <span className="sb-label whitespace-nowrap">{item.label}</span>}
            </div>
            {sidebarOpen && <ChevronDown size={14} className={`sb-chevron transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />}
          </button>

          <AnimatePresence initial={false}>
            {sidebarOpen && isOpen && (
              <motion.div
                key={`${item.label}-content`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="sb-sub-border ml-5 mt-1 space-y-1 border-l pl-3 overflow-hidden"
              >
                {item.children.map((sub) => (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `sb-sub-item block px-3 py-1.5 rounded-md sb-label transition-colors ${isActive ? "active" : ""}`}
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <style>{`
        #dh-sidebar {
          background: #061d49 !important;
          background-image: radial-gradient(circle at 22% 88%, rgba(21,220,173,0.36), transparent 26%),
                            radial-gradient(circle at 78% 8%, rgba(37,112,255,0.22), transparent 24%),
                            linear-gradient(180deg, #08204d 0%, #031b47 58%, #06306b 100%) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        #dh-sidebar .sb-header {
          border-color: rgba(255, 255, 255, 0.1) !important;
          background: transparent !important;
        }
        #dh-sidebar .sb-footer {
          background: #04193d !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        #dh-sidebar .sb-heading {
          color: #ffffff !important;
          font-weight: 700 !important;
          letter-spacing: 0.05em;
        }
        #dh-sidebar .sb-heading:hover {
          color: #ffffff !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        #dh-sidebar .sb-icon {
          color: #ffffff !important;
          transition: color 0.2s ease;
        }
        #dh-sidebar .sb-label {
          color: #ffffff !important;
          font-weight: 600 !important;
          font-family: inherit;
          transition: color 0.2s ease;
        }
        #dh-sidebar .sb-chevron {
          color: #ffffff !important;
        }
        #dh-sidebar .sb-item, #dh-sidebar .sb-dropdown-btn {
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }
        #dh-sidebar .sb-item:hover, #dh-sidebar .sb-dropdown-btn:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
        }
        #dh-sidebar .sb-item:hover .sb-label, #dh-sidebar .sb-dropdown-btn:hover .sb-label,
        #dh-sidebar .sb-item:hover .sb-icon, #dh-sidebar .sb-dropdown-btn:hover .sb-icon,
        #dh-sidebar .sb-item:hover .sb-chevron, #dh-sidebar .sb-dropdown-btn:hover .sb-chevron {
          color: #ffffff !important;
        }
        #dh-sidebar .sb-item.active {
          background: linear-gradient(to right, #095b55, #08775e) !important;
          color: #ffffff !important;
          box-shadow: 0 0 0 1px rgba(90, 255, 203, 0.45), 0 12px 28px rgba(0, 0, 0, 0.28) !important;
          border-color: transparent !important;
        }
        #dh-sidebar .sb-item.active .sb-icon, #dh-sidebar .sb-item.active .sb-label {
          color: #ffffff !important;
        }
        #dh-sidebar .sb-dropdown-btn.active-dropdown {
          background-color: rgba(9, 91, 85, 0.25) !important;
          color: #06d6a0 !important;
        }
        #dh-sidebar .sb-dropdown-btn.active-dropdown .sb-icon,
        #dh-sidebar .sb-dropdown-btn.active-dropdown .sb-label,
        #dh-sidebar .sb-dropdown-btn.active-dropdown .sb-chevron {
          color: #06d6a0 !important;
        }
        #dh-sidebar .sb-sub-item {
          transition: all 0.2s ease;
          color: rgba(255, 255, 255, 0.7) !important;
        }
        #dh-sidebar .sb-sub-item:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
        }
        #dh-sidebar .sb-sub-item.active {
          background: rgba(9, 91, 85, 0.25) !important;
          color: #06d6a0 !important;
          font-weight: bold !important;
          border-left: 2px solid #06d6a0;
        }
        #dh-sidebar .sb-sub-border {
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        #dh-sidebar .sb-toggle-btn {
          background-color: #095b55 !important;
        }
        #dh-sidebar .sb-close-btn {
          background-color: #d26019 !important;
          color: white !important;
          border-radius: 6px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 28px !important;
          height: 28px !important;
          padding: 4px !important;
          transition: all 0.2s ease !important;
        }
        #dh-sidebar .sb-close-btn:hover {
          background-color: #b35215 !important;
          transform: scale(1.1);
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #08775e;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .rank-card {
          background: #020c22 !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 8px !important;
        }
        .motivation-card {
          background: #021a14 !important;
          border: 1px solid rgba(6, 214, 160, 0.3) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        }
      `}</style>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        id="dh-sidebar"
        style={cssVars}
        className={`fixed top-0 left-0 bottom-0 border-r border-white/10 shadow-xl z-50 transition-all duration-300 flex flex-col ${sidebarOpen ? "w-[240px]" : "w-[70px] -translate-x-full lg:translate-x-0"} ${mobileMenuOpen ? "translate-x-0" : ""}`}
      >
        {/* Background Layer mimicking Exhibitor Sidebar */}
        <div className="absolute inset-0 bg-[#061d49] z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_88%,rgba(21,220,173,0.36),transparent_26%),radial-gradient(circle_at_78%_8%,rgba(37,112,255,0.22),transparent_24%),linear-gradient(180deg,#08204d_0%,#031b47_58%,#06306b_100%)] z-0 pointer-events-none" />

        {/* Copied exhibition image matching Exhibitor Sidebar */}
        <div className="absolute inset-x-0 bottom-8 h-52 opacity-55 z-0 pointer-events-none flex items-end justify-center">
          <img src="/exhibition/1.png" alt="" className="w-full object-contain" />
        </div>

        <div className="sb-header relative z-10 flex py-2 items-center justify-center px-4 border-b border-white/10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 bg-white/90 rounded-full blur-md" />
          </div>
          <img src="/logo.png" alt="IHWE 2026" className="relative h-[70px] w-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,1)]" />
          {/* {sidebarOpen && (
            <button
              onClick={() => {
                setSidebarOpen(false);
                setMobileMenuOpen(false);
              }}
              className="sb-close-btn absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg z-20"
            >
              <X size={18} />
            </button>
          )} */}
        </div>

        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="sb-toggle-btn mx-4 mt-4 p-2 rounded-lg text-white relative z-10"><Menu size={18} /></button>
        )}

        <div className="flex-1 overflow-y-auto sidebar-scroll pt-1 p-3 space-y-1 text-[13px] relative z-10 pb-28">
          {groupedMenuItems.map((item, index) => {
            if (item.type === "section") {
              const isOpen = !!openSections[item.label];

              return (
                <div key={`section-${index}`} className={`w-full ${sidebarOpen ? "mb-2" : "mb-0"}`}>
                  {sidebarOpen && (
                    <button
                      onClick={() => setOpenSections(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                      className={`sb-heading w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-white/5 rounded-md transition-colors ${index === 0 ? "mt-0" : "mt-2"}`}
                    >
                      <span className="whitespace-nowrap">{item.label}</span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  )}

                  <AnimatePresence initial={false}>
                    {(!sidebarOpen || isOpen) && (
                      <motion.div
                        key={`${item.label}-content`}
                        initial={sidebarOpen ? { height: 0, opacity: 0 } : false}
                        animate={sidebarOpen ? { height: "auto", opacity: 1 } : false}
                        exit={sidebarOpen ? { height: 0, opacity: 0 } : false}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden space-y-1"
                      >
                        {item.children.map(subItem => renderMenuItem(subItem))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return renderMenuItem(item);
          })}
        </div>

        <div className="sb-footer p-3 border-t border-white/10 bg-inherit mt-auto relative z-10 space-y-4">
          {sidebarOpen && currentUser && (
            <div className="space-y-4 font-inter mb-2">
              {/* Top Section: Avatar & Info */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#06d6a0] bg-slate-800 flex items-center justify-center shadow-lg">
                    {fullProfile?.hodImage ? (
                      <img src={fullProfile.hodImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-lg font-bold uppercase">
                        {currentUser.username ? currentUser.username[0] : 'A'}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#061d49] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-white leading-tight truncate">
                    {fullProfile?.fullName || currentUser.username}
                  </h4>
                  <p className="text-[11px] text-emerald-400 font-bold leading-tight mt-0.5 truncate uppercase tracking-wider">
                    {fullProfile?.designation || currentUser.role}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>

              {/* Rank Card */}
              <div className="rank-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1.5">
                    Your Rank
                  </p>
                  <p className="text-xl font-black text-[#06d6a0] leading-none mb-1">
                    # 1
                  </p>
                  <p className="text-[9px] text-white/60 font-medium leading-none">
                    In Admin Team
                  </p>
                </div>
                {/* Trophy Icon with Stars */}
                <div className="relative flex items-center justify-center pr-1.5">
                  <svg className="text-amber-400" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2H6a2 2 0 0 0-2 2v3c0 2.21 1.79 4 4 4h1v2c0 2.44 1.72 4.48 4 4.9V20H9v2h6v-2h-3v-3.1c2.28-.42 4-2.46 4-4.9v-2h1c2.21 0 4-1.79 4-4V4a2 2 0 0 0-2-2zM6 9V4h2v5c0 1.1-.9 2-2 2zm12 0c-1.1 0-2-.9-2-2V4h2v5z" />
                  </svg>
                  {/* Micro stars */}
                  <span className="absolute -top-0.5 -right-0.5 text-[8px] text-yellow-300 animate-bounce">✦</span>
                  <span className="absolute bottom-0 left-0 text-[6px] text-yellow-300 animate-pulse">✦</span>
                </div>
              </div>

              {/* Motivation Card */}
              <div className="motivation-card p-3 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[11px] font-extrabold text-[#06d6a0] uppercase tracking-wider mb-1">
                    Keep Going!
                  </p>
                  <p className="text-[11px] text-white/95 font-medium leading-tight">
                    You're doing great.
                  </p>
                  <p className="text-[10px] text-white/70 leading-snug mt-0.5">
                    Every task brings you closer to your goal.
                  </p>
                  
                  {/* 4 Stars */}
                  <div className="flex items-center gap-0.5 mt-2">
                    <span className="text-[10px] text-yellow-400">★</span>
                    <span className="text-[10px] text-yellow-400">★</span>
                    <span className="text-[10px] text-yellow-400">★</span>
                    <span className="text-[10px] text-yellow-400">★</span>
                  </div>
                </div>

                {/* Targets / Arrow absolute graphics */}
                <div className="absolute -right-2 -bottom-2 opacity-20 transform translate-x-1 translate-y-1">
                  <svg className="text-[#06d6a0]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {sidebarOpen && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-md font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md"
              >
                Logout
              </button>
              <span className="text-[10px] text-white/40">v1.0.0 • IHWE</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}