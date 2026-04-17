import {
  Bell,
  Menu,
  X,
  LogOut,
  Key,
  BellRing,
  HelpCircle,
  Sun,
  Moon,
  Sunrise,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserAstronaut } from "react-icons/fa";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { logout } from "../utils/auth";
import { io } from "socket.io-client";
import { SERVER_URL } from "../lib/api";

export default function Navbar({
  sidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTitle, setActiveTitle] = useState(null);
  const [chatUnread, setChatUnread] = useState(0);
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({ username: "Admin", role: "Authorized Access" });
  const [greeting, setGreeting] = useState({ text: "", icon: null, color: "" });

  useEffect(() => {
    // Fetch Admin Info from storage
    const storedInfo = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    if (storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        setAdminData({
          username: parsed.username || "Admin",
          role: parsed.role || "Authorized Access"
        });
      } catch (e) {
        console.error("Error parsing adminInfo", e);
      }
    }

    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting({
          text: "Good Morning",
          icon: <Sunrise size={20} className="text-amber-500" />,
          color: "from-amber-500 to-orange-500"
        });
      } else if (hour >= 12 && hour < 17) {
        setGreeting({
          text: "Good Afternoon",
          icon: <Sun size={20} className="text-orange-500" />,
          color: "from-blue-500 to-cyan-500"
        });
      } else {
        setGreeting({
          text: "Good Evening",
          icon: <Moon size={20} className="text-indigo-400" />,
          color: "from-indigo-500 to-purple-500"
        });
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);

    // Socket for chat notifications
    const adminInfo2 = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
    const adminId = adminInfo2._id || adminInfo2.id || "admin";
    const adminName2 = adminInfo2.username || "Admin";
    const adminRole2 = adminInfo2.role || "";

    // Load existing unread count on mount
    fetch(`${SERVER_URL}/api/chat/rooms?adminUsername=${encodeURIComponent(adminName2)}&adminRole=${encodeURIComponent(adminRole2)}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const total = res.data.reduce((s, r) => s + (r.unreadAdmin || 0), 0);
          setChatUnread(total);
        }
      }).catch(() => {});

    const s = io(SERVER_URL, { transports: ["websocket", "polling"] });
    s.on("connect", () => s.emit("join_admin", { adminId, adminName: adminName2 }));

    // room_updated fires for every new message — increment if exhibitor sent it
    s.on("room_updated", (data) => {
      if (data.lastSenderType === "exhibitor" && !window.location.pathname.includes("exhibitor-chat")) {
        setChatUnread(prev => prev + 1);
      }
    });

    return () => { clearInterval(interval); s.disconnect(); };
  }, []);

  // 🔥 PROPER LOGOUT WITH SWEETALERT
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
      // ✅ Show success message FIRST
      await Swal.fire({
        title: "Logged Out!",
        text: "You have been successfully logged out",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      // ✅ Then logout (after 1.5 seconds)
      logout();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-22 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 z-50 shadow-sm">
      <div className={`flex items-center justify-between h-full px-4 sm:px-6 transition-all duration-[400ms] ${sidebarOpen ? 'lg:pl-[300px]' : 'lg:pl-22'}`}>

        {/* LEFT – MOBILE TOGGLE & GREETING */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-slate-700" />
            ) : (
              <Menu size={20} className="text-slate-700" />
            )}
          </button>

          {/* 🌟 PREMIUM GREETING CARD */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden sm:flex items-center gap-3 bg-slate-50/50 px-4 py-2 rounded-xl border border-slate-200/60 group transition-all duration-300 hover:bg-white hover:border-blue-600/30 hover:shadow-[0_2px_10px_-3px_rgba(30,58,138,0.1)]"
          >
            {/* Icon Circle */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm transition-all duration-500 group-hover:scale-110">
              {greeting.icon}
            </div>

            {/* Text Content */}
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-slate-500 tracking-tight">
                  {greeting.text},
                </span>
                <span className="text-[12px] font-bold text-[#23471d] tracking-tight">
                  {adminData.username}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-500 animate-ping opacity-75" />
                </div>
                <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">
                  {adminData.role}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT – ICONS */}
        <div className="flex items-center gap-2 sm:gap-4 relative">

          {/* Chat Notifications */}
          <div className="relative">
            <button
              onClick={() => { navigate("/exhibitor-chat"); setChatUnread(0); }}
              className="relative p-2 rounded-lg hover:bg-[#23471d]/10 transition-all duration-200 hover:scale-105"
              title="Exhibitor Chat"
            >
              <MessageSquare size={18} className="text-[#23471d]" />
              {chatUnread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-[#d26019] text-white text-[9px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black shadow-lg"
                >
                  {chatUnread > 99 ? "99+" : chatUnread}
                </motion.span>
              )}
            </button>
          </div>

          {/* Help & Support */}
          <div className="relative">
            <button
              onClick={() =>
                setActiveTitle(activeTitle === "help" ? null : "help")
              }
              className="p-2 rounded-lg hover:bg-[#23471d]/10 transition-all duration-200 hover:scale-105"
            >
              <HelpCircle size={18} className="text-[#23471d]" />
            </button>

            {activeTitle === "help" && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-nowrap absolute top-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg"
              >
                Help & Support
                <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-900 rotate-45"></div>
              </motion.div>
            )}
          </div>

          {/* Reminder List */}
          <div className="relative">
            <button
              onClick={() =>
                setActiveTitle(activeTitle === "reminder" ? null : "reminder")
              }
              className="p-2 rounded-lg hover:bg-[#23471d]/10 transition-all duration-200 hover:scale-105"
            >
              <BellRing size={18} className="text-[#23471d]" />
            </button>

            {activeTitle === "reminder" && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-nowrap absolute top-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg"
              >
                Reminder List
                <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-900 rotate-45"></div>
              </motion.div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() =>
                setActiveTitle(activeTitle === "notify" ? null : "notify")
              }
              className="relative p-2 rounded-lg hover:bg-[#23471d]/10 transition-all duration-200 hover:scale-105"
            >
              <Bell size={18} className="text-[#23471d]" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-lg"
              >
                3
              </motion.span>
            </button>

            {activeTitle === "notify" && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-nowrap absolute top-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg"
              >
                Notifications
                <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-900 rotate-45"></div>
              </motion.div>
            )}
          </div>

          {/* Profile with Lottie Animation */}
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setActiveTitle(null);
            }}
            className="relative flex items-center gap-2 p-1.5 rounded-full hover:bg-[#23471d]/10 transition-all duration-200 hover:scale-105"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#23471d] flex-shrink-0 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200">
              <DotLottieReact
                src="https://lottie.host/58dbdff1-ac25-407c-bb37-5a283535e9a2/S1kH2ZgNwu.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%', transform: 'scale(1.2)' }}
              />
            </div>
          </button>

          {/* PROFILE DROPDOWN */}
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap absolute right-0 top-16 w-56 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Admin Panel</p>
                <p className="text-sm font-bold text-slate-800">{adminData.username}</p>
              </div>

              {/* Manage Admin Users */}
              <button
                onClick={() => {
                  navigate("/admin-users");
                  setProfileOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                <FaUserAstronaut size={16} className="text-blue-600" />
                <span className="font-medium">Manage Admin Users</span>
              </button>

              {/* Change Password */}
              <button
                onClick={() => {
                  navigate("/change-password");
                  setProfileOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                <Key size={16} className="text-slate-600" />
                <span className="font-medium">Change Password</span>
              </button>

              <div className="border-t border-slate-200" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut size={16} />
                <span className="font-semibold">Logout</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}