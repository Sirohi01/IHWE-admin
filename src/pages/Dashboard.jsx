import { useEffect, useState } from "react";
import StatsGrid from "./StatsGrid";
import HeroCarousel from "../components/HeroCarousel";
import { UserCheck, Users, CalendarCheck, FileText, CalendarDays, MapPin } from "lucide-react";
import api from "../lib/api";

export default function Dashboard() {
  const [adminData, setAdminData] = useState({ username: "Admin", role: "Authorized Access" });
  const [counts, setCounts] = useState({
    totalUsers: 0,
    totalBuyerRegistrations: 0,
    totalBookings: 0,
    totalBlogs: 0,
  });

  useEffect(() => {
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

    const fetchCounts = async () => {
      try {
        const response = await api.get("/api/dashboard/stats");
        if (response.data.success) {
          const { counts: fetchedCounts } = response.data.data;
          setCounts({
            totalUsers: fetchedCounts.totalUsers || 0,
            totalBuyerRegistrations: fetchedCounts.totalBuyerRegistrations || 0,
            totalBookings: fetchedCounts.totalBookings || 0,
            totalBlogs: fetchedCounts.totalBlogs || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
      }
    };
    fetchCounts();
  }, []);

  const stats = [
    {
      id: "users",
      icon: UserCheck,
      iconBg: "bg-gradient-to-br from-[#7c6ef5] to-[#5b4fcf]",
      label: "TOTAL USERS",
      value: counts.totalUsers,
      sub: "Registered Admins",
      valueColor: "text-gray-800",
    },
    {
      id: "registrations",
      icon: Users,
      iconBg: "bg-gradient-to-br from-[#22a96a] to-[#178a52]",
      label: "REGISTRATIONS",
      value: counts.totalBuyerRegistrations,
      sub: "Buyer Attendees",
      valueColor: "text-[#22a96a]",
    },
    {
      id: "exhibitors",
      icon: CalendarCheck,
      iconBg: "bg-gradient-to-br from-[#f97316] to-[#ea6c0a]",
      label: "EXHIBITORS",
      value: counts.totalBookings,
      sub: "Stall Bookings",
      valueColor: "text-[#f97316]",
    },
    {
      id: "blogs",
      icon: FileText,
      iconBg: "bg-gradient-to-br from-[#3b82f6] to-[#2563eb]",
      label: "TOTAL BLOGS",
      value: counts.totalBlogs,
      sub: "Published Articles",
      valueColor: "text-[#3b82f6]",
    },
  ];

  return (
    <div className="px-6 py-6 transition-colors duration-300">
      {/* Welcome Header restored matching Exhibitor Dashboard exactly */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-5 mb-6">
        {/* Left Welcome Text */}
        <div className="flex flex-col justify-center">
          <p className="text-sm text-gray-500 mb-1.5 tracking-wide">Welcome back,</p>
          <div className="flex items-center gap-2 mb-2.5">
            <h2
              className="text-[32px] font-bold text-gray-900 leading-tight"
              style={{
                textShadow: '0 1px 0 rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)'
              }}
            >
              {adminData.username}
            </h2>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #02a344, #027D34)',
                boxShadow: '0 2px 6px rgba(2,125,52,0.4), 0 1px 0 rgba(255,255,255,0.3) inset'
              }}
            >
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            {/* Elegant Glow Badge for Designation/Role */}
            <div className="flex items-center gap-1.5 bg-red-50/80 px-2.5 py-1 rounded-full border border-red-100 shadow-sm ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">
                {adminData.role}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Here's what's happening with your administration in IHWE 2026.
          </p>
        </div>

        {/* Right Cards Section */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Center Event Card */}
          <div
            className="flex-none w-[220px] bg-white border border-gray-200 rounded-md px-4 py-1.5 flex flex-col justify-center shadow-sm"
            style={{
              boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 2px 8px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.05)',
              transform: 'perspective(800px) rotateY(-1deg) rotateX(1deg)',
            }}
          >
            {/* Date Row */}
            <div className="flex items-center gap-2.5">
              <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                <CalendarDays size={17} className="text-[#1a3a7c]" />
              </div>
              <div>
                <p
                  className="text-[13px] font-medium text-[#1a3a7c] leading-snug"
                  style={{ textShadow: '0 1px 2px rgba(26,58,124,0.15)' }}
                >
                  21 – 23 AUGUST 2026
                </p>
              </div>
            </div>

            {/* Location Row */}
            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                <MapPin size={17} className="text-[#1a3a7c]" />
              </div>
              <div>
                <p
                  className="text-[13px] font-medium text-[#1a3a7c] leading-snug"
                  style={{ textShadow: '0 1px 2px rgba(26,58,124,0.15)' }}
                >
                  PRAGATI MAIDAN,<br />NEW DELHI, INDIA
                </p>
              </div>
            </div>
          </div>

          {/* Right Promo Banner */}
          <div
            className="flex-none w-[420px] rounded-md overflow-hidden relative flex items-center px-5 py-1.5 shadow-sm"
            style={{
              backgroundImage: "url('/exhibition/topright.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="relative z-[2] max-w-[150px]">
              <p className="text-[11px] text-white/75 mb-1 leading-relaxed">
                Be a part of the world's leading platform for
              </p>
              <p
                className="text-[15px] font-medium text-white leading-snug"
                style={{ textShadow: '0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.4)' }}
              >
                Healthcare &amp; Wellness Innovation!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM STATS CARDS (exactly like Exhibitor Dashboard StatCards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="flex items-center gap-4 bg-white rounded-md px-5 py-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-gray-300"
            >
              <div className={`${stat.iconBg} rounded-xl p-3 shrink-0 shadow-sm`}>
                <Icon size={20} className="text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#1a3a7c] uppercase tracking-wider leading-none mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold leading-tight ${stat.valueColor}`}>
                  {stat.value}
                </p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                  {stat.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* HERO SECTION */}
      <HeroCarousel />

      {/* STATS GRID (Charts & Queries) */}
      <div className="mt-8">
        <StatsGrid />
      </div>
    </div>
  );
}