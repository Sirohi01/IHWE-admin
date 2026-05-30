import { CalendarDays, MapPin } from "lucide-react";

export default function DashboardHeader({ fullProfile, currentUser, loading }) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-stretch gap-3 mb-1">
      {/* Left Welcome Info */}
      <div className="flex flex-col justify-center">
        <p className="text-base lg:text-lg text-gray-500 mb-1 tracking-wide">Welcome back,</p>
        <div className="flex items-center gap-2 mb-1.5">
          <h2
            className="text-[18px] lg:text-[20px] font-semibold text-gray-900 leading-tight"
            style={{ textShadow: '0 1px 0 rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)' }}
          >
            {fullProfile?.fullName || currentUser?.username}.
          </h2>
          <>
            <style>{`
              @keyframes wave {
                0% { transform: rotate( 0.0deg) }
                10% { transform: rotate(14.0deg) }
                20% { transform: rotate(-8.0deg) }
                30% { transform: rotate(14.0deg) }
                40% { transform: rotate(-4.0deg) }
                50% { transform: rotate(10.0deg) }
                60% { transform: rotate( 0.0deg) }
                100% { transform: rotate( 0.0deg) }
              }
              .waving-hand {
                animation-name: wave;
                animation-duration: 2.5s;
                animation-iteration-count: infinite;
                transform-origin: 70% 70%;
                display: inline-block;
              }
            `}</style>
            <span className="text-[18px] waving-hand select-none ml-1">👋</span>
          </>
        </div>
        <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
          <p className="text-xs lg:text-sm text-gray-500 leading-relaxed">
            Here's what's happening with your participation in IHWE 2026.
          </p>
          {loading && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#08775e] text-[9px] font-black uppercase tracking-wider animate-pulse shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Syncing Live Data...
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Middle Event Details Card */}
        <div
          className="flex-none sm:w-[220px] bg-white border border-gray-200 rounded-md px-3 py-1.5 flex flex-col justify-center text-left"
          style={{
            boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 2px 8px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.05)',
            transform: 'perspective(800px) rotateY(-1deg) rotateX(1deg)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
              <CalendarDays size={17} className="text-[#1a3a7c]" />
            </div>
            <p className="text-[13px] font-medium text-[#1a3a7c] leading-snug" style={{ textShadow: '0 1px 2px rgba(26,58,124,0.15)' }}>
              21 – 23 AUGUST 2026
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
              <MapPin size={17} className="text-[#1a3a7c]" />
            </div>
            <p className="text-[13px] font-medium text-[#1a3a7c] leading-snug" style={{ textShadow: '0 1px 2px rgba(26,58,124,0.15)' }}>
              PRAGATI MAIDAN,<br />NEW DELHI, INDIA
            </p>
          </div>
        </div>

        {/* Right Banner */}
        <div
          className="flex-none sm:w-[420px] rounded-md overflow-hidden relative flex items-center px-4 py-1 text-left min-h-[56px]"
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
            <p className="text-[15px] font-medium text-white leading-snug"
              style={{ textShadow: '0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.4)' }}>
              Healthcare &amp; Wellness Innovation!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

