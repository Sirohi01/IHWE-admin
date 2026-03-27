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
  LogIn
} from "lucide-react";

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

  // ✅ Fetch branding settings (Logo)
  useEffect(() => {
    api.get("/api/settings")
      .then(res => {
        if (res.data.success && res.data.data.logo) {
          setLogo(res.data.data.logo);
        }
      })
      .catch(err => console.error("Error fetching login branding:", err));
  }, []);

  // ✅ Check if user is already logged in
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
      confirmButtonColor: "#1a4d1a", // Updated to green
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1a4d1a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4 font-inter">
      {/* Main Container - Tile Style (No Border Radius) */}
      <div className="w-full max-w-6xl bg-white shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-screen sm:min-h-[600px]">

        {/* LEFT SIDE - Welcome Section (White) */}
        <div className="lg:w-1/2 bg-white relative overflow-hidden flex items-center justify-center p-6 lg:p-12 border-r-2 border-[#1a4d1a]/10">
          {/* Background Pattern - Subtle Green on White */}
          <div className="absolute inset-0">
            {/* Geometric Shapes */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#1a4d1a]/5 transform rotate-12"></div>
            <div className="absolute top-40 right-10 w-48 h-48 bg-[#1a4d1a]/5 transform -rotate-12"></div>
            <div className="absolute bottom-20 left-20 w-56 h-56 bg-[#1a4d1a]/5 transform rotate-45"></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="grid grid-cols-8 grid-rows-8 h-full w-full gap-4">
                {[...Array(64)].map((_, i) => (
                  <div key={i} className="bg-[#1a4d1a]"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center lg:text-left w-full">
            {/* NEW LOGO SECTION ON LEFT */}
            <div className="mb-10 flex flex-col items-center lg:items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a4d1a] to-[#2d5a2d] transform translate-x-1 translate-y-1"></div>
                <div className="relative bg-white border-2 border-[#1a4d1a] p-2">
                  {logo ? (
                    <img src={`${SERVER_URL}${logo}`} className="h-32 lg:h-36 w-auto object-contain" alt="IHWE Logo" />
                  ) : (
                    <div className="h-24 lg:h-28 flex items-center justify-center bg-slate-50 px-6">
                      <span className="text-2xl font-black text-[#1a4d1a]">IHWE</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#1a4d1a] tracking-tight">
                  IHWE ADMIN
                </h2>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">
                  Official Management Portal
                </p>
              </div>
              <div className="h-1 w-24 bg-[#1a4d1a]"></div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                Hello!
              </h1>
              <h2 className="text-3xl lg:text-5xl font-black text-[#1a4d1a] leading-tight tracking-tight">
                Have a<br />GOOD DAY
              </h2>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Login Form (Light Grey) */}
        <div className="lg:w-1/2 bg-slate-100 p-6 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div>
              {/* Form Branding */}
              <div className="mb-8 text-center lg:text-left">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  Administrator Login
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  Please enter your credentials to continue
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* USERNAME */}
                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wider">
                    Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      placeholder="Enter username"
                      className="w-full px-4 py-3 pl-10 bg-white border-2 border-gray-300 focus:outline-none focus:border-[#1a4d1a] transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pl-10 bg-white border-2 border-gray-300 focus:outline-none focus:border-[#1a4d1a] transition-all text-sm font-medium pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a4d1a] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* REMEMBER ME */}
                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-[#1a4d1a] border-gray-300 rounded-none focus:ring-[#1a4d1a] cursor-pointer"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-3 text-xs font-bold text-gray-600 cursor-pointer select-none uppercase tracking-wide"
                  >
                    Keep me logged in
                  </label>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1a4d1a] hover:bg-[#153a15] text-white font-black py-3.5 px-4 transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed transform hover:translate-y-[-2px] text-base uppercase tracking-widest"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn size={20} />
                      <span>LOGIN</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}