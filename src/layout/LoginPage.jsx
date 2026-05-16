import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../lib/api";
import {
  Eye,
  EyeOff,
  Users,
  Shield,
  Building2,
  Mail,
  Lock,
  LogIn,
  Loader2,
  ChevronLeft,
  User,
  ShieldCheck,
  Headset,
  Headphones,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import adminLogo from "../assets/adminlogonew.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [logo, setLogo] = useState("");

  // Fetch branding settings (Logo)
  useEffect(() => {
    api.get("/api/settings")
      .then(res => {
        if (res.data.success && res.data.data.logo) {
          setLogo(res.data.data.logo);
        }
      })
      .catch(err => console.error("Error fetching login branding:", err));
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

      if (!token) {
        setIsChecking(false);
        return;
      }

      // Verify token with backend
      try {
        const response = await api.get("/api/verify-token");
        if (response.data.success) {
          navigate("/dashboard", { replace: true });
        } else {
          // Invalid token, clear it
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
          sessionStorage.removeItem("adminToken");
          sessionStorage.removeItem("adminInfo");
          setIsChecking(false);
        }
      } catch (error) {
        // Token verification failed, clear it
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminInfo");
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // SweetAlert Configuration
  const showAlert = (icon, title, text) => {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      confirmButtonColor: "#23471d",
      background: "#f8f9fa",
      customClass: {
        title: "text-xl font-bold font-inter",
        popup: "rounded-xl",
        confirmButton: "py-2 px-6 text-base font-semibold"
      }
    });
  };

  // LOGIN FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      showAlert("warning", "Missing Fields", "Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/login", {
        username: credentials.username,
        password: credentials.password,
      });

      if (response.data.success && response.data.token) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("adminToken", response.data.token);

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        if (response.data.admin) {
          storage.setItem("adminInfo", JSON.stringify(response.data.admin));
        }

        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: "Welcome to IHWE Official Admin Portal",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "#23471d",
        });

        navigate("/dashboard", { replace: true });
      } else {
        showAlert("error", "Login Failed", response.data.message || "Invalid username or password!");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Invalid credentials! Please try again.";
      showAlert("error", "Login Error", errorMessage);

      // Clear tokens on failure
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminInfo");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] font-inter flex flex-col justify-center relative">

      {/* ── Animated Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <style>{`
          @keyframes floatLeaf {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            33%       { transform: translateY(-22px) rotate(14deg); opacity: 1; }
            66%       { transform: translateY(-10px) rotate(-8deg); opacity: 0.8; }
          }
          @keyframes drift1 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33%       { transform: translate(20px, -15px) scale(1.05); }
            66%       { transform: translate(-10px, 10px) scale(0.97); }
          }
          @keyframes drift2 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33%       { transform: translate(-18px, 12px) scale(1.04); }
            66%       { transform: translate(12px, -8px) scale(0.98); }
          }
          .leaf-float { animation: floatLeaf 5s ease-in-out infinite; }
          .blob-drift1 { animation: drift1 10s ease-in-out infinite; }
          .blob-drift2 { animation: drift2 13s ease-in-out infinite reverse; }
          .blob-drift3 { animation: drift1 8s ease-in-out infinite reverse; }
        `}</style>

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f7ea] via-[#e8f5d8] to-[#f4faf0]" />

        {/* Blobs */}
        <div className="blob-drift1 absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#c5e89a]/25" />
        <div className="blob-drift2 absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#8dc44f]/20" />
        <div className="blob-drift3 absolute top-10 right-20 w-48 h-48 rounded-full bg-[#d6ffb7]/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#a8d96c]/15 animate-pulse" />

        {/* Floating Leaves */}
        {[
          { top: "8%", left: "8%", delay: "0s" },
          { top: "15%", right: "10%", delay: "1.5s" },
          { top: "55%", left: "5%", delay: "2.5s" },
          { bottom: "20%", right: "8%", delay: "0.8s" },
          { bottom: "35%", left: "15%", delay: "3.5s" },
          { top: "70%", right: "22%", delay: "1.2s" },
          { top: "35%", left: "45%", delay: "4s" },
          { top: "80%", left: "35%", delay: "2s" },
        ].map((leaf, i) => (
          <div
            key={i}
            className="leaf-float absolute w-7 h-7 opacity-40"
            style={{
              top: leaf.top,
              left: leaf.left,
              right: leaf.right,
              bottom: leaf.bottom,
              animationDelay: leaf.delay,
            }}
          >
            <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
              <path
                d="M18 3 C10 8,4 16,8 26 C12 34,26 32,30 22 C34 12,26 4,18 3Z"
                fill="#4a8c28"
              />
              <line x1="18" y1="5" x2="18" y2="28" stroke="#3a7020" strokeWidth="1.2" />
            </svg>
          </div>
        ))}
      </div>

      <section className="py-4 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 items-stretch rounded-2xl shadow-2xl overflow-hidden bg-white border border-slate-100 min-h-[550px] lg:min-h-[550px]">


              <div className="w-full flex flex-col">
                <div
                  className="flex-1 px-8 py-2 relative overflow-hidden flex flex-col bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${adminLogo})`,
                  }}
                >

                  <div
                    className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-40 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, #b8e0a0 0%, transparent 70%)",
                      transform: "translate(30%, -30%)",
                    }}
                  />

                  <div
                    className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-30 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, #7dc465 0%, transparent 70%)",
                      transform: "translate(-30%, 30%)",
                    }}
                  />


                  <div className="relative z-10 flex-1 flex flex-col">

                    <div className="mb-0">
                      {logo ? (
                        <img
                          // src={`${SERVER_URL}${logo}`}
                          src="/logo.png"
                          className="h-20 w-auto object-contain -ml-4 mt-4"
                          alt="IHWE Logo"
                        />
                      ) : (
                        /* Fallback Logo */
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className="flex items-center justify-center rounded-full font-black text-white text-3xl"
                            style={{
                              width: "60px",
                              height: "60px",
                              background: "linear-gradient(135deg, #4caf50, #1a5c1a)",
                              border: "3px solid #fff",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                              fontFamily: "Georgia, serif",
                            }}
                          >
                            9
                          </div>
                          <div className="leading-tight">
                            <div className="text-sm font-bold text-[#1a4d1a] uppercase tracking-wider">International</div>
                            <div className="text-sm font-bold text-[#1a4d1a] uppercase tracking-wider">Health &amp; Wellness</div>
                            <div className="text-lg font-black uppercase tracking-wider" style={{ color: "#e65c00" }}>
                              EXPO 2026
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* IHWE ADMIN label */}
                    <div className="mt-10">
                      <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1">
                        IHWE ADMIN
                      </h2>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                        Official Management Portal
                      </p>
                      <div className="w-12 h-1 bg-[#357a38] mt-2" />
                    </div>

                    {/* Hello / Good Day */}
                    <div className="mb-2">
                      <p
                        className="text-[#357a38] text-xl mb-1 italic"
                        style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                      >
                        Hello!
                      </p>
                      <h1 className="text-[28px] md:text-[30px] font-black text-slate-900 leading-[1.1] mb-2">
                        Have a<br />Good Day
                      </h1>
                      <p className="text-black font-medium text-[14px] leading-relaxed max-w-[280px]">
                        Welcome back! Please login to continue<br />
                        managing the International Health &amp;<br />
                        Wellness Expo 2026.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTTOM: Feature badges bar */}
                <div
                  className="bg-[#24541e] p-4 grid grid-cols-3 gap-3 text-center"
                >
                  {[
                    { icon: <Shield size={14} />, title: "Secure Access", desc: "Your data is safe with us." },
                    { icon: <Users size={14} />, title: "Centralized Management", desc: "Manage everything seamlessly." },
                    { icon: <BarChart2 size={14} />, title: "Real-time Insights", desc: "Track performance & reports." },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white mb-1.5"
                      >
                        {item.icon}
                      </div>
                      <h4 className="text-white text-[10px] font-bold leading-tight mb-0.5">{item.title}</h4>
                      <p className="text-white/80 text-[9px] leading-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE - Form */}
              <div className="px-8 relative flex flex-col justify-center h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#23471d]/10 to-transparent -rotate-45" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key="login-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[#23471d]/10 to-[#d26019]/10 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 text-[#23471d]">
                        <Shield size={36} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-[1.75rem] font-semibold text-slate-900 tracking-tight leading-none mb-2">
                        Admin Login
                      </h3>
                      <p className="text-[13.5px] text-slate-500 leading-relaxed">
                        Enter your credentials to manage the portal
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold uppercase tracking-widest text-[#23471d]">Username</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#23471d] transition-colors">
                            <Users size={18} />
                          </div>
                          <input
                            type="text"
                            required
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#23471d] focus:ring-4 focus:ring-[#23471d]/10 transition-all text-base placeholder:text-slate-400 text-slate-800 shadow-sm"
                            placeholder="Enter username"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold uppercase tracking-widest text-[#23471d]">Password</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#23471d] transition-colors">
                            <Lock size={18} />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#23471d] focus:ring-4 focus:ring-[#23471d]/10 transition-all text-base placeholder:text-slate-400 text-slate-800 shadow-sm"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-[#23471d] transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-5 h-5 text-[#23471d] border-slate-300 rounded focus:ring-[#23471d] cursor-pointer"
                          />
                          <label htmlFor="remember" className="ml-3 text-xs font-bold text-slate-600 cursor-pointer select-none uppercase tracking-wide">
                            Keep me logged in
                          </label>
                        </div>
                        <button type="button" className="text-sm font-bold text-[#23471d] hover:underline uppercase tracking-wide">
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-[#23471d] to-[#2d5a25] hover:from-[#1a3a14] hover:to-[#23471d] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-xl hover:shadow-[#23471d]/30 hover:-translate-y-0.5 mt-2 disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn size={18} />}
                        <span>{isLoading ? 'Verifying...' : 'Login Now'}</span>
                      </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-4 pt-2">
                        <div className="w-12 h-12 bg-[#23471d]/10 rounded-full flex items-center justify-center text-[#23471d] flex-shrink-0">
                          <Headset size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base mb-1">Need Help?</h4>
                          <div className="text-sm text-slate-500 font-medium flex flex-wrap gap-x-2">
                            <span className="text-base">Email: <a href="mailto:admin@ihwe.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors">info@ihwe.in</a></span>
                            <span className="text-slate-300 hidden sm:inline text-base">|</span>
                            <span className="w-full sm:w-auto text-base">Phone: <a href="tel:+919654900525" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors">+91 9654900525</a></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}