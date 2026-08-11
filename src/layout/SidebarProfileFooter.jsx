import { logout } from "../utils/auth";
import Swal from "sweetalert2";

export default function SidebarProfileFooter({ sidebarOpen, currentUser, fullProfile, myRank, showFooterProfile = false }) {
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
      logout();
    }
  };

  if (!showFooterProfile) return null;

  return (
    <div className="sb-footer p-3 border-t border-white/10 bg-inherit mt-auto relative z-10 space-y-4">
      {sidebarOpen && currentUser && (
        <div className="space-y-4 font-inter mb-2">
          {/* Top Section: Avatar & Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#06d6a0] bg-slate-800 flex items-center justify-center shadow-lg">
                {fullProfile?.profileImage ? (
                  <img loading="lazy" decoding="async" src={fullProfile.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-lg font-bold uppercase">
                    {currentUser.username ? currentUser.username[0] : 'A'}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#061d49] animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[14px] font-bold text-white leading-tight truncate">
                {fullProfile?.fullName || currentUser.username}
              </h4>
              <p className="text-[11px] text-emerald-400 font-bold leading-tight mt-0.5 truncate uppercase tracking-wider">
                {fullProfile?.designation || currentUser.role}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>

          {/* Rank Card */}
          <div className="rank-card p-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1.5">
                Your Rank
              </p>
              <p className="text-xl font-black text-[#06d6a0] leading-none mb-1">
                {myRank !== null ? `# ${myRank}` : "—"}
              </p>
              <p className="text-[9px] text-white/60 font-medium leading-none">
                In Admin Team
              </p>
            </div>
            {/* Trophy Icon with Stars */}
            <div className="relative flex items-center justify-center pr-1.5">
              <svg className="text-amber-400" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2H6a2 2 0 0 0-2 2v3c0 2.21 1.79 4 4 4h1v2c0 2.44 1.72 4.48 4 4.9V20H9v2h6v-2h-3v-3.1c2.28-.42 4-2.46 4-4.9v-2h1c2.21 0 4-1.79 4-4V4a2 2 0 0 0-2-2zM6 9V4h2v5c0 1.1-.9 2-2 2zm12 0c-1.1 0-2-.9-2-2V4h2v5z" />
              </svg>
              {/* Micro stars */}
              <span className="absolute -top-0.5 -right-0.5 text-[8px] text-yellow-300 animate-bounce">✦</span>
              <span className="absolute bottom-0 left-0 text-[6px] text-yellow-300 animate-pulse">✦</span>
            </div>
          </div>

          {/* Motivation Card */}
          <div className="motivation-card p-3 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[11px] font-extrabold text-[#06d6a0] uppercase tracking-wider mb-1">
                Keep Going!
              </p>
              <p className="text-[11px] text-white/95 font-medium leading-tight">
                You're doing great.
              </p>
              <p className="text-[10px] text-white/70 leading-snug mt-0.5">
                Every task brings you closer to your goal.
              </p>

              {/* 4 Stars */}
              <div className="flex items-center gap-0.5 mt-2">
                <span className="text-[10px] text-yellow-400">★</span>
                <span className="text-[10px] text-yellow-400">★</span>
                <span className="text-[10px] text-yellow-400">★</span>
                <span className="text-[10px] text-yellow-400">★</span>
              </div>
            </div>

            {/* Targets / Arrow absolute graphics */}
            <div className="absolute -right-2 -bottom-2 opacity-20 transform translate-x-1 translate-y-1">
              <svg className="text-[#06d6a0]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-md font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md"
          >
            Logout
          </button>
          <span className="text-[10px] text-white/40">v1.0.0 • IHWE</span>
        </div>
      )}
    </div>
  );
}
