import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { settingsApi, SERVER_URL } from "../lib/api";

const NotFound = () => {
  const location = useLocation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.get();
        if (data) setSettings(data);
      } catch (error) {
        console.error("Error fetching settings for 404 page:", error);
      }
    };
    fetchSettings();
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Logo Section */}
        <div className="mb-10 flex justify-center">
          <Link to="/dashboard">
            {settings?.logo ? (
              <img
                src={`${SERVER_URL}${settings.logo}`}
                alt="IHWE Logo"
                className="h-16 w-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-[#23471d] leading-none">IHWE</span>
                <span className="text-xs font-bold text-[#d26019] tracking-[0.2em] uppercase">ADMIN PANEL</span>
              </div>
            )}
          </Link>
        </div>

        {/* 404 Error Text */}
        <p className="text-base font-semibold text-[#d26019]">404 Error</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">Page not found</h1>
        <p className="mt-6 text-base leading-7 text-slate-600 max-w-lg mx-auto">
          Sorry, we couldn't find the admin page you're looking for. It might have been moved or the URL might be incorrect.
        </p>

        {/* Actions */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/dashboard"
            className="rounded-full bg-[#23471d] px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1a3516] transition-all duration-300 flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="text-sm font-semibold text-slate-900 flex items-center gap-2 hover:text-[#d26019] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Decorative Element */}
        <div className="mt-16 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700 flex justify-center">
           <img 
            src="/favicon-32x32.png" 
            alt="Decoration" 
            className="w-12 h-12 animate-pulse"
           />
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
