import { X, Menu } from "lucide-react";
import namogangelogo from "../assets/namogangelogo.webp";

export default function SidebarHeader({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  return (
    <>
      <div className="absolute inset-0 bg-[#061d49] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_88%,rgba(21,220,173,0.36),transparent_26%),radial-gradient(circle_at_78%_8%,rgba(37,112,255,0.22),transparent_24%),linear-gradient(180deg,#08204d_0%,#031b47_58%,#06306b_100%)] z-0 pointer-events-none" />

      <div className="absolute inset-x-0 bottom-8 h-52 opacity-55 z-0 pointer-events-none flex items-end justify-center">
        <img loading="lazy" decoding="async" src="/exhibition/1.png" alt="" className="w-full object-contain" />
      </div>

      <div className="sb-header relative z-10 flex py-2 items-center justify-center px-4 border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
          <div className="w-48 h-8 bg-white/70 rounded-full blur-[25px] absolute translate-y-3" />
          <div className="w-40 h-8 bg-white/60 rounded-full blur-[25px] absolute translate-y-5" />

          <div className="absolute top-2 left-10 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_3px_rgba(255,255,255,1)] animate-pulse" />
          <div className="absolute bottom-1 right-12 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_12px_4px_rgba(255,255,255,1)] animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="absolute top-5 right-6 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,1)] animate-pulse" style={{ animationDelay: '500ms' }} />
          <div className="absolute bottom-4 left-6 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_3px_rgba(255,255,255,1)] animate-pulse" style={{ animationDelay: '800ms' }} />
        </div>
        <img loading="lazy" decoding="async" src={namogangelogo}
          alt="IHWE 2026"
          className="relative h-[65px] w-full object-contain z-10 my-1"
          style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.8))" }}
        />
        {sidebarOpen && (
          <button
            onClick={() => {
              setSidebarOpen(false);
              setMobileMenuOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white rounded-xl z-20 shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <X size={16} className="text-[#08775e]" />
          </button>
        )}
      </div>

      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="sb-toggle-btn mx-4 mt-4 p-2 rounded-lg text-white relative z-10">
          <Menu size={18} />
        </button>
      )}
    </>
  );
}
