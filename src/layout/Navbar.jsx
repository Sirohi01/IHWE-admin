import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, X, Key } from "lucide-react";
import { FaUserAstronaut } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { RiListCheck2, RiAlarmWarningLine, RiUserAddLine } from "react-icons/ri";
import { IoNotificationsOutline } from "react-icons/io5";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../lib/api";
import { logout } from "../utils/auth";
import { fetchCompanies } from "../features/company/companySlice";
import { useSelector, useDispatch } from "react-redux";

const getArrayFromSlice = (sliceState, fallbackKey = "companies") => {
  if (Array.isArray(sliceState)) return sliceState;
  if (sliceState && typeof sliceState === "object" && fallbackKey in sliceState && Array.isArray(sliceState[fallbackKey])) {
    return sliceState[fallbackKey];
  }
  return [];
};

export default function Navbar({ sidebarOpen, mobileMenuOpen, setMobileMenuOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const [fullProfile, setFullProfile] = useState(null);
  const [adminData, setAdminData] = useState({ username: "Admin", role: "Authorized Access" });

  const companiesState = useSelector((state) => state.companies);
  const companiesArray = getArrayFromSlice(companiesState, "companies");
  const newLeadsCount = companiesArray.filter((c) => c.companyStatus === "New Lead").length;

  useEffect(() => { dispatch(fetchCompanies()); }, [dispatch]);

  useEffect(() => {
    const storedInfo = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    if (storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        setAdminData({ username: parsed.username || "Admin", role: parsed.role || "Authorized Access" });
      } catch (e) { console.error("Error parsing adminInfo", e); }
    }

    const adminInfo2 = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
    const adminId = adminInfo2._id || adminInfo2.id || "admin";
    const adminName2 = adminInfo2.fullName || adminInfo2.username || "Admin";
    const adminRole2 = adminInfo2.role || "";

    fetch(`${SERVER_URL}/api/chat/rooms?adminUsername=${encodeURIComponent(adminName2)}&adminRole=${encodeURIComponent(adminRole2)}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setChatUnread(res.data.reduce((s, r) => s + (r.unreadAdmin || 0), 0));
      }).catch(() => {});

    const s = io(SERVER_URL, { transports: ["websocket", "polling"] });
    s.on("connect", () => s.emit("join_admin", { adminId, adminName: adminName2 }));
    s.on("room_updated", (data) => {
      if (adminRole2 !== "super-admin" && data.spokenWith && data.spokenWith.toLowerCase() !== adminName2.toLowerCase()) return;
      if (data.lastSenderType === "exhibitor" && !window.location.pathname.includes("exhibitor-chat")) {
        setChatUnread(prev => prev + 1);
      }
    });
    return () => { s.disconnect(); };
  }, []);

  useEffect(() => {
    if (adminData?.username && adminData.username !== "Admin") {
      api.get("/api/admin/all")
        .then(res => {
          if (res.data.success) {
            const match = res.data.data.find(u => u.username.toLowerCase() === adminData.username.toLowerCase());
            if (match) setFullProfile(match);
          }
        }).catch(err => console.error("Error fetching full admin profile in Navbar:", err));
    }
  }, [adminData]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?", text: "You will be logged out from admin panel", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#d33", cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout", cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      await Swal.fire({ title: "Logged Out!", text: "You have been successfully logged out", icon: "success", timer: 1500, showConfirmButton: false });
      logout();
    }
  };

  return (
    <div className={`fixed top-0 right-0 z-[100] h-[64px] bg-gradient-to-r from-[#051c47] via-[#082b6b] to-[#051c47] border-b border-blue-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-between px-6 print:hidden transition-all duration-300 left-0 ${sidebarOpen ? 'lg:left-[240px]' : 'lg:left-[70px]'}`}>

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-all duration-200"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h2 className="text-white text-2xl uppercase font-semibold tracking-tight">User Interface</h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* Live Chat */}
        <div className="relative group">
          <button
            onClick={() => { navigate("/exhibitor-chat"); setChatUnread(0); }}
            className="relative p-2.5 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm"
          >
            <BiSupport size={19} />
            {chatUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-red-600 text-white text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center font-black shadow-sm">
                {chatUnread > 9 ? "9+" : chatUnread}
              </span>
            )}
          </button>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-md">
            Live Chat
          </span>
        </div>

        {/* Reminders */}
        <div className="relative hidden sm:block group">
          <button
            onClick={() => navigate('/reminder')}
            className="relative p-2.5 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm"
          >
            <RiAlarmWarningLine size={19} />
          </button>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-md">
            Reminders
          </span>
        </div>

        {/* Notifications */}
        <div className="relative group">
          <button
            onClick={() => navigate('/notification')}
            className="relative p-2.5 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm"
          >
            <IoNotificationsOutline size={19} />
            <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-orange-600 border border-white/20 text-white text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center font-black shadow-sm">
              2
            </span>
          </button>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-md">
            Notifications
          </span>
        </div>

        {/* To-Do */}
        <div className="relative hidden md:block group">
          <button
            onClick={() => navigate('/to-do-list')}
            className="relative p-2.5 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm"
          >
            <RiListCheck2 size={19} />
          </button>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-md">
            To-Do List
          </span>
        </div>

        {/* New Leads */}
        <div className="relative hidden lg:block group">
          <button
            onClick={() => navigate('/ihweClientData2026/newLeadList')}
            className="relative p-2.5 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm"
          >
            <RiUserAddLine size={19} />
            {newLeadsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-orange-600 border border-white/20 text-white text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center font-black shadow-sm">
                {newLeadsCount > 99 ? '99+' : newLeadsCount}
              </span>
            )}
          </button>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-md">
            New Leads
          </span>
        </div>

        {/* Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-2 py-1.5 bg-white/5 border border-white/10 rounded-full hover:shadow-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm"
            id="user-profile-trigger"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#06d6a0] bg-slate-800 flex items-center justify-center shadow-sm flex-shrink-0">
              {fullProfile?.hodImage ? (
                <img src={fullProfile.hodImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[12px] font-black uppercase">
                  {adminData.username ? adminData.username[0] : 'A'}
                </div>
              )}
            </div>
            <span className="text-[11px] font-extrabold text-slate-200 uppercase tracking-widest hidden md:block max-w-[120px] truncate">
              My Profile
            </span>
            <div className="p-0.5">
              <Menu size={15} className="text-slate-300" />
            </div>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-2xl rounded-sm z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">
                      {fullProfile?.fullName || adminData.username}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 truncate">
                      {fullProfile?.email || 'admin@ihwe.in'}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { navigate("/admin-users"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#23471d] hover:bg-emerald-50 rounded-sm transition-all"
                    >
                      <FaUserAstronaut size={14} className="text-blue-600" />
                      Manage Admin Users
                    </button>
                    <button
                      onClick={() => { navigate("/change-password"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:text-[#23471d] hover:bg-emerald-50 rounded-sm transition-all"
                    >
                      <Key size={14} className="text-slate-500" />
                      Change Password
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => { handleLogout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-sm transition-all"
                    >
                      <LogOut size={14} />
                      Logout System
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

