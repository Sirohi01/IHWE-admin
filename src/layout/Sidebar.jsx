import { ChevronDown, X, Menu } from "lucide-react";
import { useState, useEffect } from "react";
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

  /* Sidebar is now using static defaults defined above */
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

  /* ── Filter Menu Items by Role ────────────────────────────────────────── */
  const filteredMenuItems = menuItems.filter(item => {
    if (!currentUser) return false;
    // If no roles specified, default to super-admin only
    if (!item.roles) return currentUser.role === 'super-admin';
    return item.roles.includes(currentUser.role);
  });

  /* ── Auto-open dropdown & section for current route ─────────────────────── */
  useEffect(() => {
    let currentHeading = "General"; // Fallback
    let foundActiveHeading = null;

    filteredMenuItems.forEach((item) => {
      if (item.type === "heading") {
        currentHeading = item.label;
      }
      if (item.type === "item" && item.path && location.pathname.includes(item.path)) {
        foundActiveHeading = currentHeading;
      }
      if (
        item.type === "dropdown" &&
        item.children?.some((c) => location.pathname.includes(c.path))
      ) {
        setOpenDropdown(item.label);
        foundActiveHeading = currentHeading;
      }
    });

    if (foundActiveHeading) {
      setOpenSections(prev => {
        if (prev[foundActiveHeading]) return prev;
        return { ...prev, [foundActiveHeading]: true };
      });
    }
  }, [location.pathname]);

  /* ── Logout ──────────────────────────────────────────────────────────────── */
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
      await Swal.fire({
        title: "Logged Out!",
        text: "You have been successfully logged out",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      logout();
    }
  };

  /*
   * ── CSS-variable trick ────────────────────────────────────────────────────
   * We inject a <style> block scoped to #dh-sidebar so that:
   *   - hover backgrounds work purely via CSS (no JS event listeners needed)
   *   - NavLink active class detection works normally via className
   *   - Font, spacing, scrollbar, border-radius — absolutely unchanged
   *   - Only colors are swapped
   */
  const cssVars = {
    "--sb-bg": theme.bgColor,
    "--sb-icon": theme.iconColor,
    "--sb-text": theme.textColor,
    "--sb-hover": theme.hoverColor,
    "--sb-active": theme.activeColor,
    "--sb-toggle": theme.toggleColor,
    "--sb-border": BORDER_COLOR,
  };

  return (
    <>
      {/* ── Dynamic colour styles scoped to this sidebar only ─────────────── */}
      <style>{`
        #dh-sidebar {
          background-color: var(--sb-bg) !important;
          border-color: var(--sb-border) !important;
        }
        #dh-sidebar .sb-header {
          border-color: var(--sb-border) !important;
          background: white !important;
        }
        #dh-sidebar .sb-footer {
          background-color: var(--sb-bg) !important;
          border-color: var(--sb-border) !important;
        }
        #dh-sidebar .sb-heading {
          color: #d26019 !important;
        }
        #dh-sidebar .sb-icon {
          color: var(--sb-icon) !important;
        }
        #dh-sidebar .sb-label {
          color: var(--sb-text) !important;
        }
        #dh-sidebar .sb-chevron {
          color: var(--sb-text) !important;
        }
        #dh-sidebar .sb-item:hover,
        #dh-sidebar .sb-dropdown-btn:hover {
          background-color: var(--sb-hover) !important;
        }
        #dh-sidebar .sb-item.active {
          background-color: var(--sb-active) !important;
          border-color: var(--sb-icon) !important;
        }
        #dh-sidebar .sb-sub-item:hover {
          background-color: var(--sb-hover) !important;
        }
        #dh-sidebar .sb-sub-item.active {
          background-color: var(--sb-active) !important;
          color: var(--sb-icon) !important;
        }
        #dh-sidebar .sb-sub-border {
          border-color: #d26019 !important;
        }
        #dh-sidebar .sb-toggle-btn {
          background-color: var(--sb-toggle) !important;
        }
        #dh-sidebar .sb-close-btn:hover {
          background-color: var(--sb-hover) !important;
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

        /* ── Custom Scrollbar ── */
        .sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #23471d;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        id="dh-sidebar"
        style={cssVars}
        className={`fixed top-0 left-0 h-screen border-r-4
          shadow-xl z-50 transition-all duration-300
          ${sidebarOpen ? "w-75" : "w-20 -translate-x-full lg:translate-x-0"}
          ${mobileMenuOpen ? "translate-x-0" : ""}`}
      >
        {/* HEADER */}
        <div className="sb-header relative p-4 border-b">
          <div className="flex justify-center">
            {logo ? (
              <img src={`${SERVER_URL}${logo}`} className="h-18 w-auto object-contain" alt="Logo" />
            ) : (
              <span className="text-xl font-black text-[#23471d]">IHWE</span>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={() => {
                setSidebarOpen(false);
                setMobileMenuOpen(false);
              }}
              className="sb-close-btn absolute right-4 top-4 p-2 rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* OPEN BUTTON */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="sb-toggle-btn mx-4 mt-4 p-2 rounded-lg text-white"
          >
            <Menu size={18} />
          </button>
        )}

        {/* MENU */}
        <div className="h-[calc(100vh-140px)] overflow-y-auto sidebar-scroll p-3 space-y-2 text-[13px]">
          {(() => {
            let currentHeading = "General"; // Fallback tracking var

            return filteredMenuItems.map((item, index) => {
              /* ===== HEADING ===== */
              if (item.type === "heading") {
                currentHeading = item.label;
                const isOpen = openSections[item.label];
                return (
                  sidebarOpen && (
                    <div
                      key={index}
                      onClick={() => setOpenSections(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                      className="sb-heading px-3 mt-5 mb-2 flex justify-between items-center cursor-pointer hover:opacity-75 transition-opacity"
                    >
                      <p className="text-[11px] font-semibold uppercase">{item.label}</p>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  )
                );
              }

              // Hide items if their parent section is collapsed (except top-level items before any heading)
              if (currentHeading !== "General" && !openSections[currentHeading] && sidebarOpen) {
                return null;
              }

              /* ===== NORMAL ITEM ===== */
              if (item.type === "item") {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `sb-item flex items-center gap-3 px-3 py-2 rounded-md border border-transparent
                      ${isActive ? "active" : ""}
                      ${!sidebarOpen && "justify-center"}`
                    }
                  >
                    <Icon size={16} className="sb-icon" />
                    {sidebarOpen && (
                      <span className="sb-label whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              }

              /* ===== DROPDOWN ===== */
              if (item.type === "dropdown") {
                const Icon = item.icon;
                const isOpen = openDropdown === item.label;

                return (
                  <div key={item.label}>
                    <button
                      onClick={() =>
                        sidebarOpen && setOpenDropdown(isOpen ? null : item.label)
                      }
                      className={`sb-dropdown-btn w-full flex items-center justify-between px-3 py-2 rounded-md
                        ${!sidebarOpen && "justify-center"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="sb-icon" />
                        {sidebarOpen && (
                          <span className="sb-label whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </div>

                      {sidebarOpen && (
                        <ChevronDown
                          size={14}
                          className={`sb-chevron transition ${isOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    {sidebarOpen && isOpen && (
                      <div className="sb-sub-border ml-5 mt-1 space-y-1 border-l pl-3">
                        {item.children.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              `sb-sub-item block px-3 py-1.5 rounded-md sb-label
                              ${isActive ? "active" : ""}`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            });
          })()}
        </div>

        {/* FOOTER */}
        <div className="sb-footer absolute bottom-0 w-full p-2 border-t">
          {sidebarOpen && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleLogout}
                className="w-full px-3 py-3 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
              <span className="text-[10px] text-gray-500">
                v1.0.0 • IHWE
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}