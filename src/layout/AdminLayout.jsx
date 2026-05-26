import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import Sidebar from "./Sidebar";
import WhatsAppFloat from "../components/WhatsAppFloat";
import SocialSidebar from "../components/SocialSidebar";

export default function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* NAVBAR (fixed height = 64px / 4rem) */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={onLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* PAGE BODY */}
      <div className="flex pt-[55px] flex-1 ">
        {/* SIDEBAR (fixed position) */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* MAIN CONTENT + FOOTER */}
        <div
          className={`
            flex flex-col flex-1 transition-all duration-300 overflow-hidden
            ${sidebarOpen ? "lg:ml-[240px]" : "lg:ml-[70px]"}
          `}
        >
          {/* MAIN CONTENT - Reduced and consistent padding */}
          <main className="flex-1 overflow-hidden">
            <div className="w-full">
              <Outlet />
            </div>
          </main>

          {/* FOOTER */}
          <Footer />
        </div>
      </div>

      {/* Floating Widgets */}
      <WhatsAppFloat />
      <SocialSidebar />
    </div>
  );
}