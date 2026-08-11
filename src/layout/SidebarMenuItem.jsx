import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SidebarMenuItem({
  item,
  sidebarOpen,
  location,
  openDropdown,
  toggleDropdown,
  openNestedDropdown,
  setOpenNestedDropdown,
  setMobileMenuOpen
}) {
  if (item.type === "item") {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.path}
        onClick={() => setMobileMenuOpen(false)}
        className={({ isActive }) =>
          `sb-item flex items-center gap-3 px-3 py-1.5 rounded-md border border-transparent ${
            isActive ? "active" : ""
          } ${!sidebarOpen && "justify-center"}`
        }
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
      <div className="w-full">
        <button
          onClick={() => toggleDropdown(item.label)}
          className={`sb-dropdown-btn w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-all duration-200 ${
            !sidebarOpen && "justify-center"
          } ${
            hasActiveChild || isOpen
              ? "active-dropdown"
              : "text-white/80 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon size={16} className="sb-icon shrink-0" />
            {sidebarOpen && <span className="sb-label whitespace-nowrap">{item.label}</span>}
          </div>
          {sidebarOpen && (
            <ChevronDown
              size={14}
              className={`sb-chevron transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        <AnimatePresence initial={false}>
          {sidebarOpen && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="sb-sub-border ml-4 mt-1 space-y-1 border-l pl-2 pr-1 py-1 overflow-hidden bg-black/40 shadow-inner rounded-r-md"
            >
              {item.children.map((sub, idx) => {
                if (sub.type === "label") {
                  return (
                    <div
                      key={`label-${idx}`}
                      className="px-3 py-1 mt-2 text-[10px] text-white/50 font-bold uppercase tracking-wider"
                    >
                      {sub.label}
                    </div>
                  );
                }
                if (sub.type === "dropdown") {
                  const isNestedOpen = openNestedDropdown === sub.label;
                  return (
                    <div key={sub.label} className="w-full mt-1">
                      <button
                        onClick={() =>
                          setOpenNestedDropdown(isNestedOpen ? null : sub.label)
                        }
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-all duration-200 sb-label ${
                          isNestedOpen
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{sub.label}</span>
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-300 ${
                            isNestedOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isNestedOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-2 overflow-hidden"
                          >
                            {sub.children.map((child, cIdx) => (
                              <NavLink
                                key={child.path || cIdx}
                                to={child.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                  `sb-sub-item block px-3 py-1.5 rounded-md sb-label transition-colors ${
                                    isActive
                                      ? "active bg-white/10"
                                      : "text-white/70 hover:bg-white/5 hover:text-white"
                                  }`
                                }
                              >
                                {child.label}
                              </NavLink>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <NavLink
                    key={sub.path || idx}
                    to={sub.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `sb-sub-item block px-3 py-1.5 rounded-md sb-label transition-colors ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    {sub.label}
                  </NavLink>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  return null;
}
