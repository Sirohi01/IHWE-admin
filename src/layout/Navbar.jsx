import {
  Menu,
  X,
  LogOut,
  Key,
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
import api, { SERVER_URL } from "../lib/api";
import { BiSupport } from "react-icons/bi";
import { RiContactsLine, RiListCheck2, RiAlarmWarningLine, RiUserAddLine } from "react-icons/ri";
import { IoNotificationsOutline } from "react-icons/io5";
import { fetchCompanies } from "../features/company/companySlice";
import { useSelector, useDispatch } from "react-redux";

const getArrayFromSlice = (sliceState, fallbackKey = "companies") => {
  if (Array.isArray(sliceState)) return sliceState;
  if (
    sliceState &&
    typeof sliceState === "object" &&
    fallbackKey in sliceState &&
    Array.isArray(sliceState[fallbackKey])
  ) {
    return sliceState[fallbackKey];
  }
  return [];
};

export default function Navbar({
  sidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const dispatch = useDispatch();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTitle, setActiveTitle] = useState(null);
  const [chatUnread, setChatUnread] = useState(0);
  const navigate = useNavigate();

  const [fullProfile, setFullProfile] = useState(null);
  const [adminData, setAdminData] = useState({ username: "Admin", role: "Authorized Access" });
  const [greeting, setGreeting] = useState({ text: "", icon: null, color: "" });
  // 🏢 Company redux data – robust extraction
  const companiesState = useSelector((state) => state.companies);
  const companiesArray = getArrayFromSlice(companiesState, "companies");

  // Dynamic count logic for New Leads
  const newLeadsCount = companiesArray.filter((c) => c.companyStatus === "New Lead").length;

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

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
    const adminName2 = adminInfo2.fullName || adminInfo2.username || "Admin";
    const adminRole2 = adminInfo2.role || "";

    // Load existing unread count on mount
    fetch(`${SERVER_URL}/api/chat/rooms?adminUsername=${encodeURIComponent(adminName2)}&adminRole=${encodeURIComponent(adminRole2)}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const total = res.data.reduce((s, r) => s + (r.unreadAdmin || 0), 0);
          setChatUnread(total);
        }
      }).catch(() => { });

    const s = io(SERVER_URL, { transports: ["websocket", "polling"] });
    s.on("connect", () => s.emit("join_admin", { adminId, adminName: adminName2 }));

    // room_updated fires for every new message — increment if exhibitor sent it
    s.on("room_updated", (data) => {
      if (adminRole2 !== "super-admin" && data.spokenWith && data.spokenWith.toLowerCase() !== adminName2.toLowerCase()) return;
      if (data.lastSenderType === "exhibitor" && !window.location.pathname.includes("exhibitor-chat")) {
        setChatUnread(prev => prev + 1);
      }
    });

    return () => { clearInterval(interval); s.disconnect(); };
  }, []);

  useEffect(() => {
    if (adminData?.username && adminData.username !== "Admin") {
      api.get("/api/admin/all")
        .then(res => {
          if (res.data.success) {
            const match = res.data.data.find(u => u.username.toLowerCase() === adminData.username.toLowerCase());
            if (match) {
              setFullProfile(match);
            }
          }
        })
        .catch(err => console.error("Error fetching full admin profile in Navbar:", err));
    }
  }, [adminData]);

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
    <nav className={`fixed top-0 right-0 z-50 h-16 bg-gradient-to-r from-[#051c47] via-[#082b6b] to-[#051c47] border-b border-blue-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 ${sidebarOpen ? 'left-[240px]' : 'left-[70px]'}`}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6">

        {/* LEFT – MOBILE TOGGLE & GREETING */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-all duration-200"
          >
            {mobileMenuOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

          {/* 🌟 PREMIUM GREETING CARD */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 group transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
          >
            {/* Icon Circle */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/10 shadow-sm transition-all duration-500 group-hover:scale-110">
              {greeting.icon}
            </div>

            {/* Text Content */}
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-400 animate-ping opacity-75" />
                </div>
                <span className="text-[12px] font-black text-white uppercase tracking-widest">
                  User Interface
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT – ICONS */}
        <div className="flex items-center gap-2 sm:gap-4 relative">

          {/* UTILITY ICONS GROUP (Premium Floating White Pill) */}
          <div className="flex items-center gap-3.5 sm:gap-4 relative px-4 py-2 bg-white rounded-full border border-white/20 shadow-[0_4px_25px_rgba(0,0,0,0.18)]">

            {/* Live Chat */}
            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { navigate("/exhibitor-chat"); setChatUnread(0); }}
              className="group relative flex items-center justify-center w-10 h-10 bg-white rounded-xl cursor-pointer border border-slate-100 hover:bg-slate-50 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md"
            >
              <BiSupport size={19} className="text-[#23471d] transition-colors duration-300" />
              {chatUnread > 0 && (
                <div className="absolute -top-1.5 -right-1.5">
                  <div className="absolute inset-0 rounded-full bg-[#d26019] animate-ping opacity-25" />
                  <span className="relative bg-[#d26019] text-white text-[9.5px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">
                    {chatUnread > 99 ? "99+" : chatUnread}
                  </span>
                </div>
              )}
              {/* Premium Tooltip */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 shadow-xl border border-white/10 whitespace-nowrap">
                Live Chat
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45 border-l border-t border-white/10" />
              </div>
            </motion.div>

            {/* Reminder List */}
            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/reminder')}
              className="group relative hidden sm:flex items-center justify-center w-10 h-10 bg-white rounded-xl cursor-pointer border border-slate-100 hover:bg-slate-50 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md"
            >
              <RiAlarmWarningLine size={19} className="text-[#23471d] transition-colors duration-300" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9.5px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">
                1
              </span>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 shadow-xl border border-white/10 whitespace-nowrap">
                Reminders
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45 border-l border-t border-white/10" />
              </div>
            </motion.div>

            {/* Notification */}
            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/notification')}
              className="group relative flex items-center justify-center w-10 h-10 bg-white rounded-xl cursor-pointer border border-slate-100 hover:bg-slate-50 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md"
            >
              <IoNotificationsOutline size={19} className="text-[#23471d] transition-colors duration-300" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9.5px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">
                2
              </span>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 shadow-xl border border-white/10 whitespace-nowrap">
                Notifications
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45 border-l border-t border-white/10" />
              </div>
            </motion.div>

            {/* To-Do List */}
            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/to-do-list')}
              className="group relative hidden md:flex items-center justify-center w-10 h-10 bg-white rounded-xl cursor-pointer border border-slate-100 hover:bg-slate-50 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md"
            >
              <RiListCheck2 size={19} className="text-[#23471d] transition-colors duration-300" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9.5px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">
                4
              </span>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 shadow-xl border border-white/10 whitespace-nowrap">
                To-Do List
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45 border-l border-t border-white/10" />
              </div>
            </motion.div>

            {/* New Leads */}
            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/ihweClientData2026/newLeadList')}
              className="group relative hidden lg:flex items-center justify-center w-10 h-10 bg-white rounded-xl cursor-pointer border border-slate-100 hover:bg-slate-50 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md"
            >
              <RiUserAddLine size={19} className="text-[#23471d] transition-colors duration-300" />
              {newLeadsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9.5px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">
                  {newLeadsCount > 99 ? '99+' : newLeadsCount}
                </span>
              )}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 shadow-xl border border-white/10 whitespace-nowrap">
                New Leads
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45 border-l border-t border-white/10" />
              </div>
            </motion.div>

          </div>

          {/* User Profile Button matching Exhibitor style */}
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setActiveTitle(null);
            }}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 bg-white/5 border border-white/10 rounded-full hover:shadow-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm cursor-pointer"
            id="user-profile-trigger"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#06d6a0] bg-slate-800 flex items-center justify-center shadow-sm">
              {fullProfile?.hodImage ? (
                <img src={fullProfile.hodImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[11px] font-black uppercase">
                  {adminData.username ? adminData.username[0] : 'A'}
                </div>
              )}
            </div>
            <span className="text-[10px] font-extrabold text-slate-200 uppercase tracking-widest hidden md:block max-w-[120px] truncate">
              {fullProfile?.fullName || adminData.username}
            </span>
            <div className="p-0.5 text-slate-400">
              <Menu size={13} className="text-slate-300" />
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
              <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">
                  {fullProfile?.fullName || adminData.username}
                </p>
                <p className="text-[9px] font-bold text-slate-400 truncate">
                  {fullProfile?.email || 'admin@ihwe.in'}
                </p>
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