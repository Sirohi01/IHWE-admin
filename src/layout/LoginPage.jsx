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
  Headphones,
  BarChart2
} from "lucide-react";
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


  useEffect(() => {
    api.get("/api/settings")
      .then(res => {
        if (res.data.success && res.data.data.logo) {
          setLogo(res.data.data.logo);
        }
      })
      .catch(err => console.error("Error fetching login branding:", err));
  }, []);

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

  // ✅ SweetAlert Configuration
  const showAlert = (icon, title, text) => {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      confirmButtonColor: "#1a4d1a",
      background: "#ffffff",
      customClass: {
        title: "text-xl font-bold",
        popup: "rounded-none",
        confirmButton: "py-3 px-6 text-base font-semibold"
      }
    });
  };

  // ✅ LOGIN FUNCTION
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
          confirmButtonColor: "#1a4d1a",
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

  // ✅ Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1a6b1a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 font-sans w-full">

      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
        style={{ minHeight: "580px", maxHeight: "650px" }}>


        <div
          className="lg:w-1/2 relative overflow-hidden flex flex-col bg-cover bg-center"
          style={{
            backgroundImage: `url(${adminLogo})`,
          }}
        >
          {/* Decorative soft blob top-right */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-40 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #b8e0a0 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
            }}
          />
          {/* Decorative blob bottom-left */}
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #7dc465 0%, transparent 70%)",
              transform: "translate(-30%, 30%)",
            }}
          />

          {/* Content container with proper spacing */}
          <div className="relative z-10 flex flex-col h-full px-8 py-8">
            {/* TOP: Logo + Branding */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-4 mb-6 -ml-7">
                {logo ? (
                  <img
                    src={`${SERVER_URL}${logo}`}
                    className="h-59 w-auto object-contain"
                    alt="IHWE Logo"
                  />
                ) : (
                  /* Fallback Logo */
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center rounded-full font-black text-white text-5xl"
                      style={{
                        width: "85px",
                        height: "85px",
                        background: "linear-gradient(135deg, #4caf50, #1a5c1a)",
                        border: "3px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      9
                    </div>
                    <div className="leading-tight">
                      <div className="text-base font-bold text-[#1a4d1a] uppercase tracking-wider">International</div>
                      <div className="text-base font-bold text-[#1a4d1a] uppercase tracking-wider">Health &amp; Wellness</div>
                      <div className="text-xl font-black uppercase tracking-wider" style={{ color: "#e65c00" }}>
                        EXPO 2026
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* IHWE ADMIN label - LARGER FONT */}
              <div className="mb-6">
                <h2 className="text-4xl font-black text-[#1a4d1a] tracking-tight leading-none mb-1">
                  IHWE ADMIN
                </h2>
                <p className="text-sm font-bold uppercase tracking-widest text-[#2d5a2d]">
                  Official Management Portal
                </p>
                <div className="mt-2 h-0.5 w-24 bg-[#1a4d1a] rounded" />
              </div>

              {/* Hello / Good Day - LARGER FONT */}
              <div className="mb-2">
                <p
                  className="text-4xl text-[#1a6b1a] mb-0"
                  style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontWeight: 600 }}
                >
                  Hello!
                </p>
                <h1 className="text-5xl font-black text-[#1a2e1a] leading-tight tracking-tight mb-1">
                  Have a<br />Good Day
                </h1>
                <p className="text-sm text-[#2d5a2d] font-medium leading-relaxed">
                  Welcome back! Please login to continue<br />
                  managing the International Health &amp;<br />
                  Wellness Expo 2026.
                </p>
              </div>
            </div>

            {/* MIDDLE: Wellness imagery */}
            <div className="flex-1 flex items-end justify-end relative min-h-[120px]">
              {/* Zen stone stack */}
              <svg
                className="relative z-10 opacity-90 mr-4 mb-2"
                width="100" height="130" viewBox="0 0 100 130"
                fill="none" xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse cx="50" cy="118" rx="38" ry="10" fill="#5a7a3a" opacity="0.5" />
                <ellipse cx="50" cy="110" rx="35" ry="13" fill="#7aab52" opacity="0.85" />
                <ellipse cx="50" cy="90" rx="26" ry="10" fill="#8db870" opacity="0.9" />
                <ellipse cx="50" cy="84" rx="24" ry="9" fill="#a8c884" opacity="0.95" />
                <ellipse cx="50" cy="68" rx="18" ry="8" fill="#bcd99a" opacity="0.95" />
                <ellipse cx="50" cy="63" rx="16" ry="7" fill="#cce4aa" opacity="0.95" />
                <ellipse cx="50" cy="51" rx="11" ry="6" fill="#dff0c0" opacity="0.95" />
                <ellipse cx="50" cy="48" rx="10" ry="5" fill="#eaf7d4" opacity="0.95" />
                <path d="M64 42 Q82 18 74 8 Q60 25 64 42Z" fill="#4caf50" opacity="0.7" />
              </svg>

              {/* Lotus flower */}
              <svg
                className="relative z-10 opacity-85 mr-8 mb-4"
                width="55" height="45" viewBox="0 0 55 45"
                fill="none" xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse cx="27" cy="37" rx="18" ry="5" fill="#2d6e2d" opacity="0.4" />
                <path d="M27 32 Q18 20 19 10 Q27 18 27 32Z" fill="#f5f0e8" opacity="0.9" />
                <path d="M27 32 Q36 20 35 10 Q27 18 27 32Z" fill="#f0ebe0" opacity="0.9" />
                <path d="M27 32 Q13 21 15 8 Q25 19 27 32Z" fill="#f8f4ec" opacity="0.85" />
                <path d="M27 32 Q41 21 39 8 Q29 19 27 32Z" fill="#f3ede4" opacity="0.85" />
                <circle cx="27" cy="29" r="4" fill="#f5d478" opacity="0.9" />
              </svg>
            </div>

            {/* BOTTOM: Feature badges bar */}
            <div
              className="flex-shrink-0 -mx-8 -mb-0 mt-3 px-6 py-1"
              style={{ background: "linear-gradient(90deg, #1a5c1a 0%, #1e6e1e 100%)" }}
            >
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Shield size={14} />, title: "Secure Access", desc: "Your data is safe with us." },
                  { icon: <Users size={14} />, title: "Centralized Management", desc: "Manage events, users & operations seamlessly." },
                  { icon: <BarChart2 size={14} />, title: "Real-time Insights", desc: "Track performance & get real-time reports." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white"
                      style={{ background: "rgba(255,255,255,0.18)" }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-white text-[10px] font-bold leading-tight">{item.title}</p>
                      <p className="text-green-200 text-[8px] leading-tight mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT SIDE — Login Form ===== */}
        <div className="lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 lg:p-10">
          <div className="w-full max-w-md">
            {/* Shield icon */}
            <div className="flex justify-center mb-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#f0f7f0", border: "2px solid #d4ecd4" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #2d8b2d, #1a5c1a)" }}
                >
                  <Lock size={18} className="text-white" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-7">
              <h3 className="text-2xl font-black text-gray-900">
                Administrator Login
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Please enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* USERNAME */}
              <div>
                <label htmlFor="username" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Users size={16} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#2d8b2d] focus:ring-2 focus:ring-[#2d8b2d]/10 transition-all text-sm text-gray-700"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pl-10 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#2d8b2d] focus:ring-2 focus:ring-[#2d8b2d]/10 transition-all text-sm text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2d8b2d] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME + FORGOT */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#2d8b2d] focus:ring-[#2d8b2d] cursor-pointer"
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs font-medium text-gray-600 cursor-pointer select-none"
                  >
                    Keep me logged in
                  </label>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#2d8b2d] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-black py-3.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                style={{
                  background: isLoading
                    ? "#2d8b2d"
                    : "linear-gradient(90deg, #2d8b2d 0%, #1a5c1a 100%)",
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>LOGIN</span>
                  </>
                )}
              </button>
            </form>

            {/* NEED HELP */}
            <div className="mt-7 pt-5 border-t border-gray-100">
              <p className="text-center text-xs text-gray-500 font-medium mb-3">Need help?</p>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#e8f5e2" }}
                >
                  <Headphones size={24} className="text-[#2d8b2d]" />
                </div>
                <div>
                  <p className="text-md font-bold text-gray-800">Contact Support</p>
                  <p className="text-md text-gray-500">
                    admin@ihwe.in &nbsp;|&nbsp; +91 98765 43210
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}