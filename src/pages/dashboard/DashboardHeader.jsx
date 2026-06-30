import { CalendarDays, MapPin } from "lucide-react";

export default function DashboardHeader({ fullProfile, currentUser, loading, globalPeriod, setGlobalPeriod }) {
  return (
    <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-3 p-3 bg-white rounded-lg border border-slate-100" style={{ boxShadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em', fontFamily: 'Inter, sans-serif' }}>
      {/* Left Welcome Info */}
      <div className="flex flex-col justify-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Welcome back,</p>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-[#124170] leading-tight">
            {fullProfile?.fullName || currentUser?.username}!
          </h2>
        </div>
        <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Here's what's happening with your participation in the 9th Edition of IHWE 2026
          </p>
          {loading && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase tracking-wider animate-pulse shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Syncing Live Data...
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Global Period Dropdown */}
        <div className="flex items-center gap-2 px-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest pl-1">Duration</span>
          <select
            value={globalPeriod}
            onChange={(e) => setGlobalPeriod(e.target.value)}
            className="text-[11px] bg-white border border-slate-200 px-2 py-1 font-bold rounded-md text-[#111844] shadow-sm outline-none cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="this_week">Yesterday</option>
            <option value="this_month">This Week</option>
            <option value="this_year">Last Week</option>
            <option value="today">This Month</option>
            <option value="this_week">Last Month</option>
            <option value="this_month">This Quarter</option>
            <option value="this_year">Last Quarter</option>
            <option value="this_year">This Year</option>
          </select>
        </div>

        {/* Middle Event Details Card */}
        <div className="flex-none sm:w-[220px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex flex-col justify-center text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-white rounded-md shadow-sm border border-slate-100">
              <CalendarDays size={14} className="text-[#0A2947]" />
            </div>
            <p className="text-xs font-bold text-[#0A2947] leading-snug">
              21 – 23 AUGUST 2026
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-2">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-white rounded-md shadow-sm border border-slate-100">
              <MapPin size={14} className="text-[#0A2947]" />
            </div>
            <p className="text-[10px] font-bold text-[#0A2947] uppercase leading-snug">
              PRAGATI MAIDAN,<br />NEW DELHI, INDIA
            </p>
          </div>
        </div>

        {/* Right Banner */}
        <div
          className="flex-none sm:w-[350px] rounded-lg overflow-hidden relative flex items-center px-4 py-3 text-left min-h-[70px] shadow-sm"
          style={{
            backgroundImage: "url('/exhibition/topright.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#111844]/90 to-transparent"></div>
          
          <div className="relative z-[2] max-w-[200px]">
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-0.5">
              Be a part of the
            </p>
            <p className="text-sm font-semibold text-white leading-snug">
              World's Leading Platform for Healthcare & Wellness
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

