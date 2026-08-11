import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SocialSidebar from "../components/SocialSidebar";
import { useSidebarMenu } from "./useSidebarMenu";
import SidebarProfileFooter from "./SidebarProfileFooter";
import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";
import "./Sidebar.css";

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
  const [openNestedDropdown, setOpenNestedDropdown] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [theme] = useState(DEFAULT_THEME);

  const { currentUser, fullProfile, myRank, groupedMenuItems } = useSidebarMenu();
  const showFooterProfile = false;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

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

    if (activeSection) setOpenSections({ [activeSection]: true });
    if (activeDropdown) setOpenDropdown(activeDropdown);
  }, [location.pathname, groupedMenuItems]);

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
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        id="dh-sidebar"
        style={cssVars}
        className={`fixed top-0 left-0 bottom-0 border-r border-white/10 shadow-xl z-50 transition-all duration-300 flex flex-col
          ${sidebarOpen ? "w-[240px]" : "w-[70px]"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <SidebarHeader 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <SidebarMenu 
          groupedMenuItems={groupedMenuItems}
          sidebarOpen={sidebarOpen}
          openSections={openSections}
          setOpenSections={setOpenSections}
          location={location}
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          openNestedDropdown={openNestedDropdown}
          setOpenNestedDropdown={setOpenNestedDropdown}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <SidebarProfileFooter 
          sidebarOpen={sidebarOpen} 
          currentUser={currentUser} 
          fullProfile={fullProfile} 
          myRank={myRank} 
          showFooterProfile={showFooterProfile} 
        />

        {sidebarOpen && (
          <div className="mt-auto px-4 pb-4 pt-2 z-20 relative">
            <SocialSidebar />
          </div>
        )}
      </aside>
    </>
  );
}
