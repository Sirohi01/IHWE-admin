import { ChevronDown, X, Menu } from "lucide-react";
import { useState, useEffect } from "react";
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

  const filteredMenuItems = menuItems.filter(item => {
    if (!currentUser) return false;
    if (!item.roles) return currentUser.role === 'super-admin';
    return item.roles.includes(currentUser.role);
  });

  useEffect(() => {
    filteredMenuItems.forEach((item) => {
      if (
        item.type === "dropdown" &&
        item.children?.some((c) => location.pathname === c.path)
      ) {
        setOpenDropdown(item.label);
      }
    });
  }, [location.pathname]);

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

  return (
    <>
      <style>{`
        #dh-sidebar { background-color: var(--sb-bg) !important; border-color: var(--sb-border) !important; }
        #dh-sidebar .sb-header { border-color: var(--sb-border) !important; background: white !important; }
        #dh-sidebar .sb-footer { background-color: var(--sb-bg) !important; border-color: var(--sb-border) !important; }
        #dh-sidebar .sb-heading { color: #d26019 !important; }
        #dh-sidebar .sb-icon { color: var(--sb-icon) !important; }
        #dh-sidebar .sb-label { color: var(--sb-text) !important; }
        #dh-sidebar .sb-chevron { color: var(--sb-text) !important; }
        #dh-sidebar .sb-item { transition: all 0.2s ease; cursor: pointer; }
        #dh-sidebar .sb-item:hover, #dh-sidebar .sb-dropdown-btn:hover { background-color: var(--sb-hover) !important; }
        #dh-sidebar .sb-item.active { background-color: var(--sb-active) !important; border-color: var(--sb-icon) !important; }
        #dh-sidebar .sb-sub-item:hover { background-color: var(--sb-hover) !important; }
        #dh-sidebar .sb-sub-item.active { background-color: var(--sb-active) !important; color: var(--sb-icon) !important; }
        #dh-sidebar .sb-sub-border { border-color: #d26019 !important; }
        #dh-sidebar .sb-toggle-btn { background-color: var(--sb-toggle) !important; }
        #dh-sidebar .sb-close-btn { background-color: #d26019 !important; color: white !important; border-radius: 6px !important; display: flex !important; align-items: center !important; justify-content: center !important; width: 28px !important; height: 28px !important; padding: 4px !important; transition: all 0.2s ease !important; }
        #dh-sidebar .sb-close-btn:hover { background-color: #b35215 !important; transform: scale(1.1); }
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background-color: #23471d; border-radius: 10px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
      `}</style>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        id="dh-sidebar"
        style={cssVars}
        className={`fixed top-0 left-0 h-screen border-r-4 shadow-xl z-50 transition-all duration-300 flex flex-col ${sidebarOpen ? "w-75" : "w-20 -translate-x-full lg:translate-x-0"} ${mobileMenuOpen ? "translate-x-0" : ""}`}
      >
        <div className="sb-header relative p-4 border-b">
          <div className="flex justify-center">
            {logo ? <img src={`${SERVER_URL}${logo}`} className="h-18 w-auto object-contain" alt="Logo" /> : <span className="text-xl font-black text-[#23471d]">IHWE</span>}
          </div>
          {sidebarOpen && (
            <button onClick={() => { setSidebarOpen(false); setMobileMenuOpen(false); }} className="sb-close-btn absolute right-4 top-4 p-2 rounded-lg"><X size={20} /></button>
          )}
        </div>

        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="sb-toggle-btn mx-4 mt-4 p-2 rounded-lg text-white"><Menu size={18} /></button>
        )}

        <div className="h-[calc(100vh-140px)] overflow-y-auto sidebar-scroll p-3 space-y-1 text-[13px]">
          {filteredMenuItems.map((item, index) => {
            if (item.type === "heading") {
              return sidebarOpen && <p key={index} className="sb-heading px-3 mt-3 mb-0.5 text-[11px] font-semibold uppercase">{item.label}</p>;
            }

            if (item.type === "item") {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `sb-item flex items-center gap-3 px-3 py-1.5 rounded-md border border-transparent ${isActive ? "active" : ""} ${!sidebarOpen && "justify-center"}`}
                >
                  <Icon size={16} className="sb-icon" />
                  {sidebarOpen && <span className="sb-label whitespace-nowrap">{item.label}</span>}
                </NavLink>
              );
            }

            if (item.type === "dropdown") {
              const Icon = item.icon;
              const isOpen = openDropdown === item.label;

              return (
                <div key={item.label} className="w-full">
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`sb-dropdown-btn w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-all duration-200 ${!sidebarOpen && "justify-center"} ${isOpen ? "bg-[#EFF6FF]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="sb-icon" />
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
          })}
        </div>

        <div className="sb-footer p-2 border-t bg-inherit mt-auto">
          {sidebarOpen && (
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleLogout} className="w-full px-3 py-3 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Logout</button>
              <span className="text-[10px] text-gray-500">v1.0.0 • IHWE</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}