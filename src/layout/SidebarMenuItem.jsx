import { NavLink, Link, useLocation } from "react-router-dom";
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
  if (item.type === "item" && item.disabled) {
    const Icon = item.icon;
    return (
      <div
        className={`sb-item flex items-center gap-3 px-3 py-1.5 rounded-md border border-transparent opacity-45 cursor-not-allowed select-none ${
          !sidebarOpen && "justify-center"
        }`}
        title="Coming soon"
      >
        <Icon size={16} className="sb-icon shrink-0" />
        {sidebarOpen && (
          <span className="sb-label whitespace-nowrap flex items-center gap-2 flex-1 min-w-0">
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
              Soon
            </span>
          </span>
        )}
      </div>
    );
  }

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

    const currentFullPath = (location?.pathname || '') + (location?.search || '');

    const checkChildActive = (child) => {
      if (!child || !child.path) return false;
      if (child.path.includes('?')) {
        return currentFullPath === child.path;
      }
      return location.pathname === child.path && !location.search;
    };

    const hasActiveChild = item.children?.some(child => {
      if (child.children) return child.children.some(c => checkChildActive(c));
      return checkChildActive(child);
    });

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
                            {sub.children.map((child, cIdx) => {
                              const isChildActive = checkChildActive(child);
                              return (
                                <Link
                                  key={child.path || cIdx}
                                  to={child.path}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={
                                    `sb-sub-item block px-3 py-1.5 rounded-md sb-label transition-colors ${
                                      isChildActive
                                        ? "active bg-white/10"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                    }`
                                  }
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                if (sub.disabled) {
                  return (
                    <div
                      key={`disabled-${idx}`}
                      className="sb-sub-item flex items-center justify-between gap-2 px-3 py-1.5 rounded-md sb-label opacity-45 cursor-not-allowed select-none"
                      title="Coming soon"
                    >
                      <span className="truncate">{sub.label}</span>
                      <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    </div>
                  );
                }

                const isSubItemActive = checkChildActive(sub);
                return (
                  <Link
                    key={sub.path || idx}
                    to={sub.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={
                      `sb-sub-item block px-3 py-1.5 rounded-md sb-label transition-colors ${
                        isSubItemActive ? "active" : ""
                      }`
                    }
                  >
                    {sub.label}
                  </Link>
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
