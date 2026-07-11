import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu, X, Key, FileText, MessageSquare, ShoppingBag, UserCog2, ChevronRight, CheckCircle2, Clock3 } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FaUserAstronaut } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { RiListCheck2, RiAlarmWarningLine, RiUserAddLine } from "react-icons/ri";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../lib/api";
import { logout } from "../utils/auth";
import { fetchCompanies } from "../features/company/companySlice";
import { useSelector, useDispatch } from "react-redux";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { menuItems } from "../data/menuItems";


const getArrayFromSlice = (sliceState, fallbackKey = "companies") => {
  if (Array.isArray(sliceState)) return sliceState;
  if (sliceState && typeof sliceState === "object" && fallbackKey in sliceState && Array.isArray(sliceState[fallbackKey])) {
    return sliceState[fallbackKey];
  }
  return [];
};

// Central config for each notification type — keeps the modal markup clean
// and makes it trivial to add a new alert type later.
const NOTIF_CONFIG = {
  chat: {
    title: "New Message Received!",
    label: "New chat message",
    icon: MessageSquare,
    accent: "#2563eb",      // blue
    accentSoft: "#eff6ff",
    accentBorder: "#bfdbfe",
    verb: "has sent a new message.",
    cta: "Open Chat",
    lottie: "https://lottie.host/0d08f7aa-8331-4d41-8033-fe1e45ac838a/gMPH70MOwq.lottie",
  },
  accessory: {
    title: "New Order Placed!",
    label: "Service order placed",
    icon: ShoppingBag,
    accent: "#d97706",      // amber
    accentSoft: "#fffbeb",
    accentBorder: "#fde68a",
    verb: "has placed a new order.",
    cta: "View Tasks",
    lottie: "https://lottie.host/8c0057e1-a13c-45f4-9d98-488f88c5a54d/scNuDcI2zN.lottie",
  },
  profile: {
    title: "Profile Updated!",
    label: "Exhibitor profile change",
    icon: UserCog2,
    accent: "#7c3aed",      // violet
    accentSoft: "#f5f3ff",
    accentBorder: "#ddd6fe",
    verb: "has modified their exhibitor profile.",
    cta: "View Alerts",
    lottie: "https://lottie.host/3a567c32-7db4-4c69-a5ba-8d98f61651e7/pcrOllBheV.lottie",
  },
  document: {
    title: "Document Uploaded Successfully!",
    label: "Document type uploaded",
    icon: FileText,
    accent: "#dc2626",      // red
    accentSoft: "#fef2f2",
    accentBorder: "#fecaca",
    verb: "has uploaded a new document.",
    cta: "View Tasks",
    lottie: "https://lottie.host/b27241eb-b226-4c8e-aa75-f2c06013ccfd/Uh3ShCyEDG.lottie",
  },
  activity: {
    title: "New Activity Logged!",
    label: "Exhibitor activity",
    icon: FileText,
    accent: "#059669",      // emerald
    accentSoft: "#ecfdf5",
    accentBorder: "#a7f3d0",
    verb: "has performed a new action.",
    cta: "View Activity Logs",
    lottie: "https://lottie.host/8c0057e1-a13c-45f4-9d98-488f88c5a54d/scNuDcI2zN.lottie", // fallback to accessory animation, can be changed later
  },
};

export default function Navbar({ sidebarOpen, mobileMenuOpen, setMobileMenuOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageNameFromMenu = (pathname) => {
    if (pathname.includes('/dashboard/account/')) {
      if (pathname.includes('/delivery-challans')) return { page: 'Delivery Challans', section: 'Accounts' };
      if (pathname.includes('/AddPayment')) return { page: 'Payments', section: 'Accounts' };
      return { page: 'Account Overview', section: 'Accounts' };
    }
    if (pathname.startsWith('/performa-invoice-list')) return { page: 'Proforma Invoice', section: 'Accounts' };
    if (pathname.startsWith('/invoice-list')) return { page: 'Invoice', section: 'Accounts' };
    if (pathname.startsWith('/debit-note-list')) return { page: 'Credit Note', section: 'Accounts' };
    if (pathname.startsWith('/debit-note-view')) return { page: 'Credit Note View', section: 'Accounts' };
    if (pathname.startsWith('/create-debit-note')) return { page: 'Create Credit Note', section: 'Accounts' };

    let foundLabel = null;
    let foundParentLabel = null;
    let bestMatchLength = 0;

    const searchMenu = (items, parentLabel = null) => {
      for (const item of items) {
        if (item.path) {
          if (pathname === item.path || pathname.startsWith(item.path + '/')) {
            if (item.path.length > bestMatchLength) {
              bestMatchLength = item.path.length;
              foundLabel = item.label;
              foundParentLabel = parentLabel;
            }
          }
        }
        if (item.children) {
          searchMenu(item.children, item.label);
        }
      }
    };

    searchMenu(menuItems);

    if (foundLabel) return { page: foundLabel, section: foundParentLabel };

    const pathSegments = pathname.split('/').filter(Boolean);
    const pageNameRaw = pathSegments.length > 0 ? pathSegments[0] : 'Dashboard';
    const formattedPageName = pageNameRaw.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return { page: formattedPageName.replace(/Debit/gi, 'Credit'), section: null };
  };

  const { page: pageName, section: sectionName } = getPageNameFromMenu(location.pathname);

  const [profileOpen, setProfileOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const [fullProfile, setFullProfile] = useState(null);
  const [adminData, setAdminData] = useState({ username: "Admin", role: "Authorized Access" });
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const companiesState = useSelector((state) => state.companies);
  const companiesArray = getArrayFromSlice(companiesState, "companies");
  const newLeadsCount = companiesArray.filter((c) => c.companyStatus === "New Lead").length;

  const [showDemoAlert, setShowDemoAlert] = useState(false);
  const [hasUnreadTaskAlert, setHasUnreadTaskAlert] = useState(false);
  const [latestDocument, setLatestDocument] = useState(null);

  // Stop blinking when user visits task-alerts
  useEffect(() => {
    if (location.pathname === "/task-alerts") {
      setHasUnreadTaskAlert(false);
      setShowDemoAlert(false);
    }
  }, [location.pathname]);

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

    fetch(`${SERVER_URL}/api/chat/rooms?adminUsername=${encodeURIComponent(adminName2)}&adminRole=${encodeURIComponent(adminRole2)}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) setChatUnread(res.data.reduce((s, r) => s + (r.unreadAdmin || 0), 0));
      }).catch(() => { });

    const s = io(SERVER_URL, { transports: ["websocket", "polling"] });
    s.on("connect", () => s.emit("join_admin", { adminId, adminName: adminName2 }));
    s.on("room_updated", (data) => {
      console.log("Navbar received room_updated!", data);

      // Absolute minimum check: if not admin, show popup.
      if (data.lastSenderType !== "admin") {
        setChatUnread(prev => prev + 1);

        // Show chat notification banner
        setLatestDocument({
          type: 'chat',
          roomId: data.roomId,
          exhibitorName: data.exhibitorName || data.buyerName || 'Unknown Company',
          message: data.lastMessage,
          notifTime: Date.now(),
        });
        setHasUnreadTaskAlert(true);
        setShowDemoAlert(true);
      }
    });

    s.on("document_uploaded", (data) => {
      if (window.location.pathname !== "/task-alerts") {
        setLatestDocument({ type: 'document', notifTime: Date.now(), ...data });
        setShowDemoAlert(true);
        setHasUnreadTaskAlert(true);
      }
    });

    s.on("accessory_order_placed", (data) => {
      if (window.location.pathname !== "/task-alerts") {
        setLatestDocument({ type: 'accessory', notifTime: Date.now(), ...data });
        setShowDemoAlert(true);
        setHasUnreadTaskAlert(true);
      }
    });

    s.on("profile_updated", (data) => {
      // Persist to localStorage so TaskAndAlerts widget shows it even when page re-mounts
      try {
        const existing = JSON.parse(localStorage.getItem('admin_profile_notifications') || '[]');
        const newNotif = {
          id: Date.now() + Math.random(),
          title: `Updated ${data.action}`,
          companyName: data.companyName,
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "warning",
          clientId: data.clientId
        };
        const updated = [newNotif, ...existing].slice(0, 15);
        localStorage.setItem('admin_profile_notifications', JSON.stringify(updated));
      } catch { }

      setLatestDocument({ type: 'profile', notifTime: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(), ...data });
      setShowDemoAlert(true);
      setHasUnreadTaskAlert(true);
    });

    s.on("new_exhibitor_activity_log", (data) => {
      if (window.location.pathname !== "/exhibitor-activity-logs") {
        setLatestDocument({ type: 'activity', notifTime: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(), ...data });
        setShowDemoAlert(true);
        setHasUnreadTaskAlert(true);
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

  const [actualLeaderboard, setActualLeaderboard] = useState([]);

  useEffect(() => {
    if (adminData?.username && adminData.username !== "Admin") {
      api.get("/api/companies/leaderboard")
        .then(res => {
          if (res.data.success) setActualLeaderboard(res.data.leaderboard || []);
        })
        .catch(err => console.error("Error fetching admin leaderboard in Navbar:", err));
    }
  }, [adminData]);

  const myRank = useMemo(() => {
    if (!adminData || actualLeaderboard.length === 0) return null;
    const idx = actualLeaderboard.findIndex(s => s.username === adminData.username.toLowerCase());
    return idx >= 0 ? idx + 1 : null;
  }, [adminData, actualLeaderboard]);

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

  // Resolve display name for the current notification, falling back to
  // matching against the companies list when needed.
  const notifCompanyName = useMemo(() => {
    if (!latestDocument) return "";
    if (latestDocument.type === 'chat') return latestDocument.exhibitorName;
    if (latestDocument.type === 'accessory') return latestDocument.exhibitorName || 'A client';
    if (latestDocument.type === 'profile') return latestDocument.companyName;
    if (latestDocument.type === 'activity') return latestDocument.companyName;

    let compName = latestDocument.companyName;
    if (!compName || compName === 'Unknown Client') {
      const c = companiesArray.find(co =>
        String(co._id) === String(latestDocument.client_id) ||
        String(co.id) === String(latestDocument.client_id) ||
        String(co.clientId) === String(latestDocument.client_id)
      );
      compName = c ? c.companyName : 'A client';
    }
    return compName;
  }, [latestDocument, companiesArray]);

  const notifConfig = latestDocument ? NOTIF_CONFIG[latestDocument.type] : null;
  const NotifIcon = notifConfig?.icon || FileText;

  // "Uploaded on: 1 July 2026, 10:45 AM" style formatting
  const notifTimeLabel = useMemo(() => {
    if (!latestDocument?.notifTime) return "";
    return new Date(latestDocument.notifTime).toLocaleString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
    });
  }, [latestDocument]);

  return (
    <div className={`fixed top-0 right-0 z-[100] h-[42px] bg-gradient-to-r from-[#051c47] via-[#082b6b] to-[#051c47] border-b border-blue-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-between px-6 print:hidden transition-all duration-300 left-0 ${sidebarOpen ? 'lg:left-[240px]' : 'lg:left-[70px]'}`}>

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-all duration-200"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h2 className="text-white text-[15px] uppercase font-semibold tracking-tight">
          IHWE 2026 <span className="text-yellow-200 font-medium tracking-normal capitalize ml-1">
            | {sectionName ? `${sectionName} > ` : ''}{pageName}
          </span>
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* Task & Alerts Button */}
        <button
          onClick={() => navigate("/task-alerts")}
          className={`relative hidden sm:flex cursor-pointer items-center justify-center px-2.5 py-1 mr-2 rounded border border-red-500 bg-red-600 text-white font-semibold text-[10px] hover:bg-red-700 transition-all shadow-sm tracking-wider ${hasUnreadTaskAlert ? 'animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] ring-2 ring-red-400' : ''}`}
        >
          Task & Alerts
          {newLeadsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-white text-blue-700 text-[10px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center font-black shadow-md border border-gray-200">
              {newLeadsCount > 99 ? "99+" : newLeadsCount}
            </span>
          )}
        </button>

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
              {fullProfile?.profileImage ? (
                <img loading="lazy" decoding="async" src={fullProfile.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[12px] font-black uppercase">
                  {adminData.username ? adminData.username[0] : 'A'}
                </div>
              )}
            </div>
            <div className="hidden md:flex flex-col items-start justify-center max-w-[120px]">
              <span className="text-[8px] font-medium text-white uppercase tracking-widest mb-0.5 leading-none">
                Hello,
              </span>
              <span className="text-[10px] font-md text-white uppercase tracking-widest truncate w-full text-left leading-none">
                {(fullProfile?.fullName || adminData?.username || "My Profile").split(' ')[0]}!
              </span>
            </div>
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
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-lg z-50 overflow-hidden"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                    <p className="text-[12px] font-bold text-slate-900 leading-tight mb-0.5 truncate tracking-tight">
                      {fullProfile?.fullName || adminData.username}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 truncate">
                      {fullProfile?.email || 'admin@ihwe.in'}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { navigate("/admin-users"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-slate-700 hover:text-[#08775e] hover:bg-emerald-50 rounded-md transition-all"
                    >
                      <FaUserAstronaut size={14} className="text-blue-600" />
                      Manage Admin Users
                    </button>
                    <button
                      onClick={() => { setIsChangePasswordOpen(true); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-slate-700 hover:text-[#08775e] hover:bg-emerald-50 rounded-md transition-all"
                    >
                      <Key size={14} className="text-slate-500" />
                      Change Password
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => { handleLogout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-md transition-all"
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

      {/* ============================================================ */}
      {/* Professional light-theme success-style notification (centered) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showDemoAlert && notifConfig && (
          <>
            {/* Soft backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoAlert(false)}
              className="fixed inset-0 z-[998] bg-slate-900/30 backdrop-blur-[2px]"
            />

            <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 24, rotate: -1.5 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="pointer-events-auto w-full max-w-[400px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-slate-100 px-6 py-4 flex flex-col items-center text-center relative"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {/* Close */}
                <button
                  onClick={() => setShowDemoAlert(false)}
                  className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors p-1.5 rounded-full"
                >
                  <X size={16} />
                </button>

                {/* Bell animation */}
                <div className="relative w-38 h-38 flex items-center justify-center -mt-6 -mb-6">
                  {/* Bell Lottie animation */}
                  <div className="relative w-full h-full">
                    <DotLottieReact
                      src={notifConfig.lottie}
                      loop
                      autoplay
                    />
                  </div>


                </div>

                {/* Title + subtitle */}
                <h3 className="text-[16px] font-semibold text-[#007979] tracking-tight">
                  {notifConfig.title}
                </h3>
                <p className="text-[13px] text-slate-900 mt-1 leading-relaxed">
                  <span className="font-bold text-blue-600">
                    {notifCompanyName}
                  </span>{" "}
                  {notifConfig.verb}
                </p>

                {/* Detail card */}
                <div
                  className="w-full mt-3 rounded-xl border px-4 py-2.5 flex items-center gap-3 text-left"
                  style={{ backgroundColor: notifConfig.accentSoft, borderColor: notifConfig.accentBorder }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white"
                  >
                    <CheckCircle2 size={16} style={{ color: notifConfig.accent }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-slate-800 truncate uppercase tracking-wide">
                      {latestDocument.type === 'chat' && `"${latestDocument.message || '...'}"`}
                      {latestDocument.type === 'accessory' && `Order #${latestDocument.orderNo || ''}`}
                      {latestDocument.type === 'profile' && `Action: ${latestDocument.action || ''}`}
                      {latestDocument.type === 'document' && (latestDocument.document_name || 'Document')}
                      {latestDocument.type === 'activity' && (latestDocument.action || 'Activity Logged')}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{notifConfig.label}</p>
                  </div>
                </div>

                {/* Timestamp */}
                {notifTimeLabel && (
                  <div className="flex items-center gap-1.5 text-[11.5px] text-[#7F2020] mt-2">
                    <Clock3 size={12.5} />
                    <span>Uploaded on: {notifTimeLabel}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 w-full mt-4">
                  <button
                    onClick={() => setShowDemoAlert(false)}
                    className="flex-1 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[12.5px] font-semibold transition-all"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      setShowDemoAlert(false);
                      if (latestDocument?.type === 'chat') {
                        navigate("/exhibitor-chat");
                      } else if (latestDocument?.type === 'activity') {
                        navigate("/exhibitor-activity-logs");
                      } else {
                        navigate("/task-alerts");
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white rounded-lg text-[12.5px] font-semibold transition-all shadow-sm"
                    style={{ backgroundColor: notifConfig.accent }}
                  >
                    {notifConfig.cta}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}