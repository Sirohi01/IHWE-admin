import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarMenuItem from "./SidebarMenuItem";

export default function SidebarMenu({
  groupedMenuItems,
  sidebarOpen,
  openSections,
  setOpenSections,
  location,
  openDropdown,
  toggleDropdown,
  openNestedDropdown,
  setOpenNestedDropdown,
  setMobileMenuOpen
}) {
  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll pt-1 p-3 space-y-1 text-[13px] relative z-10 pb-28">
      {groupedMenuItems.map((item, index) => {
        if (item.type === "section") {
          const isOpen = !!openSections[item.label];

          return (
            <div key={`section-${index}`} className={`w-full ${sidebarOpen ? "mb-2" : "mb-0"}`}>
              {sidebarOpen && (
                <button
                  onClick={() =>
                    setOpenSections(prev =>
                      prev[item.label] ? {} : { [item.label]: true }
                    )
                  }
                  className={`sb-heading w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-white/5 rounded-md transition-colors ${
                    index === 0 ? "mt-0" : "mt-2"
                  } ${isOpen ? "active-section" : ""}`}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
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
                    className="overflow-hidden space-y-1 bg-black/40 shadow-inner rounded-b-md p-1 border border-t-0 border-white/5"
                  >
                    {item.children.map(subItem => (
                      <SidebarMenuItem
                        key={subItem.label}
                        item={subItem}
                        sidebarOpen={sidebarOpen}
                        location={location}
                        openDropdown={openDropdown}
                        toggleDropdown={toggleDropdown}
                        openNestedDropdown={openNestedDropdown}
                        setOpenNestedDropdown={setOpenNestedDropdown}
                        setMobileMenuOpen={setMobileMenuOpen}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <SidebarMenuItem
            key={item.label}
            item={item}
            sidebarOpen={sidebarOpen}
            location={location}
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
            openNestedDropdown={openNestedDropdown}
            setOpenNestedDropdown={setOpenNestedDropdown}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        );
      })}
    </div>
  );
}
