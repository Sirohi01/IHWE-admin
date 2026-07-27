import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  User, Mail, Phone, ShieldCheck, Clock, Briefcase, Camera,
  Activity, Users, Target, CheckCircle2, LayoutDashboard, Settings,
  FileText, MessageSquare, CreditCard, ChevronRight, Edit3, Save, Upload, Eye, EyeOff, TrendingUp
} from "lucide-react";
import { FaUserAstronaut } from "react-icons/fa";
import Swal from "sweetalert2";
import api, { otpApi } from "../lib/api";

export default function MyProfile() {
  const { id } = useParams();
  const [adminData, setAdminData] = useState({});
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activeTab, setActiveTab] = useState('User Details');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [verifiedEmailValue, setVerifiedEmailValue] = useState("");
  const [verifiedMobileValue, setVerifiedMobileValue] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [mobileVerificationToken, setMobileVerificationToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [sendingMobileOtp, setSendingMobileOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [verifyingMobileOtp, setVerifyingMobileOtp] = useState(false);
  const [profilePreview, setProfilePreview] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");
  const [recentActivities, setRecentActivities] = useState([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      const deptRes = await api.get('/api/departments').catch(error => {
        console.error('Failed to fetch departments', error); return null;
      });
      if (deptRes?.data?.success) setDepartments(deptRes.data.data);

      const desigRes = await api.get('/api/designations').catch(error => {
        console.error('Failed to fetch designations', error); return null;
      });
      if (desigRes?.data?.success) setDesignations(desigRes.data.data);

      const adminRes = await api.get('/api/admin/all').catch(error => {
        console.error('Failed to fetch admin users', error); return null;
      });
      if (adminRes?.data?.success) setAdmins(adminRes.data.data);

      const rolesRes = await api.get('/api/roles').catch(error => {
        console.error('Failed to fetch roles', error); return null;
      });
      if (rolesRes?.data?.success) setRoles(rolesRes.data.data);
    };
    fetchDropdowns();

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const storedInfo = localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo');

        let targetId = id;
        let currentUser = null;
        if (storedInfo) {
          try {
            currentUser = JSON.parse(storedInfo);
            setLoggedInUser(currentUser);
            if (!targetId) targetId = currentUser._id;
          } catch {
            setLoadError("Your saved login details are invalid. Please sign in again.");
          }
        }

        if (targetId) {
          try {
            const profileRes = await api.get(`/api/admin/${targetId}`);

            if (profileRes.data.success && profileRes.data.data) {
              const profileData = Array.isArray(profileRes.data.data) ? profileRes.data.data[0] : profileRes.data.data;

              setAdminData({ ...profileData, performance: null });
              setFormData({ ...profileData, password: "" });
              setEmailVerified(Boolean(profileData.email));
              setMobileVerified(Boolean(profileData.mobile));
              setVerifiedEmailValue(profileData.email?.trim() || "");
              setVerifiedMobileValue(profileData.mobile?.trim() || "");
              setLoading(false);

              setPerformanceLoading(true);
              const statsRes = await api.get(`/api/admin/performance/${targetId}`).catch(error => {
                console.error("Failed to fetch user performance", error);
                return null;
              });
              const performance = statsRes?.data?.success
                ? statsRes.data.data
                : { totalLeads: 0, stallBookings: 0, conversionRate: 0, totalAmountAchieved: 0 };
              setAdminData(previous => ({ ...previous, performance }));
              setPerformanceLoading(false);

              setActivityLoading(true);
              const activityRes = await api.get(
                `/api/activity-logs?limit=4&search=${encodeURIComponent(profileData.username || profileData.fullName || "")}`
              ).catch(error => {
                console.error("Failed to fetch recent activity", error);
                return null;
              });
              if (activityRes?.data?.success) {
                setRecentActivities((activityRes.data.data || []).slice(0, 4).map(log => ({
                  id: log._id,
                  title: `${log.action || "Activity"} · ${log.module || "System"}`,
                  time: log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—",
                  color: String(log.action || "").toLowerCase().includes("delete") ? "red" : String(log.action || "").toLowerCase().includes("update") ? "blue" : "emerald"
                })));
              } else {
                setRecentActivities([]);
              }
              setActivityLoading(false);
            }
          } catch (e) {
            console.error("Error parsing adminInfo or fetching profile/stats", e);
            setLoadError(e.response?.data?.message || "Unable to load this profile.");
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setLoadError("Unable to load this profile.");
      } finally {
        setLoading(false);
        setPerformanceLoading(false);
        setActivityLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    const email = (formData.email || "").trim();
    if (!email || email !== verifiedEmailValue) {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp("");
      setEmailVerificationToken("");
    }
  }, [formData.email, verifiedEmailValue]);

  useEffect(() => {
    const mobile = (formData.mobile || "").trim();
    if (!mobile || mobile !== verifiedMobileValue) {
      setMobileVerified(false);
      setMobileOtpSent(false);
      setMobileOtp("");
      setMobileVerificationToken("");
    }
  }, [formData.mobile, verifiedMobileValue]);

  useEffect(() => () => {
    if (profilePreview) URL.revokeObjectURL(profilePreview);
    if (signaturePreview) URL.revokeObjectURL(signaturePreview);
  }, [profilePreview, signaturePreview]);


  const handleDepartmentChange = (e) => {
    const depName = e.target.value;
    setFormData(prev => {
      const p = { ...prev, department: depName };
      const dep = departments.find(d => d.name === depName);
      if (dep && dep.hodName) {
        p.hodName = dep.hodName;
        const hodUser = admins.find(a => (a.fullName || a.username) === dep.hodName);
        if (hodUser) {
          p.hodMobile = hodUser.mobile || '';
          p.hodEmail = hodUser.email || '';
          p.hodDesignation = hodUser.designation || '';
          p.hodImage = hodUser.profileImage || hodUser.hodImage || '';
        } else {
          p.hodMobile = '';
          p.hodEmail = '';
          p.hodDesignation = '';
          p.hodImage = '';
        }
      } else {
        p.hodName = '';
        p.hodMobile = '';
        p.hodEmail = '';
        p.hodDesignation = '';
        p.hodImage = '';
      }
      return p;
    });
  };

  const handleDesignationChange = (e) => {
    const desName = e.target.value;
    setFormData(prev => {
      const p = { ...prev, designation: desName };
      const des = designations.find(d => d.name === desName);
      if (des && des.reportTo) {
        p.reportingToName = des.reportTo;
        const reportUser = admins.find(a => (a.fullName || a.username) === des.reportTo);
        if (reportUser) {
          p.reportingToMobile = reportUser.mobile || '';
          p.reportingToEmail = reportUser.email || '';
          p.reportingToDesignation = reportUser.designation || '';
          p.reportingToImage = reportUser.profileImage || reportUser.hodImage || '';
        } else {
          p.reportingToMobile = '';
          p.reportingToEmail = '';
          p.reportingToDesignation = '';
          p.reportingToImage = '';
        }
      } else {
        p.reportingToName = '';
        p.reportingToMobile = '';
        p.reportingToEmail = '';
        p.reportingToDesignation = '';
        p.reportingToImage = '';
      }
      return p;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "mobile" || name === "altMobile" ? value.replace(/\D/g, "").slice(0, 10) : value
    }));
  };

  const handleImageSelection = (field, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire("Invalid file", "Please select a JPG, PNG or WebP image.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("File too large", "Image size must be 5 MB or less.", "error");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (field === "profileImage") {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      setProfilePreview(previewUrl);
    } else {
      if (signaturePreview) URL.revokeObjectURL(signaturePreview);
      setSignaturePreview(previewUrl);
    }
    setFormData(previous => ({ ...previous, [field]: file }));
  };

  const isFile = value => value instanceof File;
  const currentRole = roles.find(role =>
    role.name?.toLowerCase() === loggedInUser?.role?.toLowerCase()
  );
  const currentRoleSlug = (loggedInUser?.role || "").toLowerCase().replace(/[^a-z]/g, "");
  const isSuperAdmin = currentRoleSlug === "superadmin" || currentRoleSlug === "ihwesuperadministrator";
  const canManagePrivileges = isSuperAdmin || currentRole?.permissions?.["User ID Management"] === true;
  const canEditProfile = canManagePrivileges;
  const canViewActivityLogs = isSuperAdmin || currentRole?.permissions?.["Activity Logs"] === true;

  const checkOfficialContact = async field => {
    if (field === "email") {
      const res = await api.post("/api/admin/verify-email", { email: formData.email.trim(), id: adminData._id });
      if (!res.data?.success) throw new Error(res.data?.message || "Official Email is not available");
    } else {
      const res = await api.post("/api/admin/verify-mobile", { mobile: formData.mobile.trim(), id: adminData._id });
      if (!res.data?.success) throw new Error(res.data?.message || "Official Mobile Number is not available");
    }
  };

  const sendOtp = async type => {
    const isEmail = type === "email";
    const identifier = (isEmail ? formData.email : formData.mobile || "").trim();
    if (!identifier) return Swal.fire("Error", `${isEmail ? "Official Email" : "Official Mobile No"} is required`, "error");
    if (isEmail && !/^\S+@\S+\.\S+$/.test(identifier)) return Swal.fire("Error", "Enter a valid official email", "error");
    if (!isEmail && !/^\d{10}$/.test(identifier)) return Swal.fire("Error", "Enter a valid 10-digit mobile number", "error");

    (isEmail ? setSendingEmailOtp : setSendingMobileOtp)(true);
    try {
      await checkOfficialContact(type);
      const result = await otpApi.request(identifier, isEmail ? "email" : "phone", formData.fullName || formData.username || "Admin User", "ADMIN_USER");
      if (!result.success) throw new Error(result.message || "Failed to send OTP");
      (isEmail ? setEmailOtpSent : setMobileOtpSent)(true);
      Swal.fire({ icon: "success", title: isEmail ? "Email OTP sent" : "WhatsApp OTP sent", timer: 1400, showConfirmButton: false });
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || error.message || "Failed to send OTP", "error");
    } finally {
      (isEmail ? setSendingEmailOtp : setSendingMobileOtp)(false);
    }
  };

  const verifyOtp = async type => {
    const isEmail = type === "email";
    const identifier = (isEmail ? formData.email : formData.mobile || "").trim();
    const code = (isEmail ? emailOtp : mobileOtp).trim();
    if (code.length !== 6) return Swal.fire("Error", "Enter the 6-digit OTP", "error");

    (isEmail ? setVerifyingEmailOtp : setVerifyingMobileOtp)(true);
    try {
      const result = await otpApi.verify(identifier, code, isEmail ? "email" : "phone");
      if (!result.success || !result.verificationToken) throw new Error(result.message || "Invalid OTP");
      if (isEmail) {
        setEmailVerified(true); setVerifiedEmailValue(identifier); setEmailVerificationToken(result.verificationToken);
        setEmailOtp(""); setEmailOtpSent(false);
      } else {
        setMobileVerified(true); setVerifiedMobileValue(identifier); setMobileVerificationToken(result.verificationToken);
        setMobileOtp(""); setMobileOtpSent(false);
      }
      Swal.fire({ icon: "success", title: `${isEmail ? "Email" : "Mobile"} verified`, timer: 1300, showConfirmButton: false });
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || error.message || "Invalid or expired OTP", "error");
    } finally {
      (isEmail ? setVerifyingEmailOtp : setVerifyingMobileOtp)(false);
    }
  };

  const buildPayload = () => {
    const cleaned = {
      ...formData,
      username: (formData.username || "").trim(),
      email: (formData.email || "").trim(),
      mobile: (formData.mobile || "").trim(),
      emailVerificationToken,
      mobileVerificationToken
    };
    if (!canManagePrivileges || !cleaned.password) delete cleaned.password;
    if (!canManagePrivileges) {
      delete cleaned.role;
      delete cleaned.status;
    }
    const hasFiles = isFile(cleaned.profileImage) || isFile(cleaned.signatureImage);
    if (!hasFiles) return cleaned;
    const body = new FormData();
    Object.entries(cleaned).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if ((key === "profileImage" || key === "signatureImage") && !isFile(value)) return;
      body.append(key, value);
    });
    return body;
  };

  const handleSaveProfile = async () => {
    if (!formData.title || !formData.fullName?.trim() || !formData.username?.trim()
      || !formData.department || !formData.designation || !formData.email?.trim()
      || !formData.mobile?.trim()) {
      return Swal.fire("Required fields", "Please complete all required user details.", "error");
    }
    if (!emailVerified || verifiedEmailValue !== formData.email.trim()) {
      return Swal.fire("Email verification required", "Please verify the changed Official Email via OTP.", "error");
    }
    if (!mobileVerified || verifiedMobileValue !== formData.mobile.trim()) {
      return Swal.fire("Mobile verification required", "Please verify the changed Official Mobile Number via WhatsApp OTP.", "error");
    }
    if (formData.password && formData.password.length < 6) {
      return Swal.fire("Invalid password", "New password must be at least 6 characters long.", "error");
    }
    try {
      setSaving(true);
      const payload = buildPayload();
      const config = payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
      const res = await api.put(`/api/admin/update/${adminData._id}`, payload, config);
      if (res.data.success) {
        const updated = res.data.data || { ...adminData, ...formData };
        setAdminData(updated);
        setFormData({ ...updated, password: "" });
        setShowPassword(false);
        setProfilePreview("");
        setSignaturePreview("");
        setEditMode(false);
        window.dispatchEvent(new Event("admin-profile-updated"));
        Swal.fire({ icon: "success", title: "Profile updated", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire("Error", res.data.message || "Failed to update profile", "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.response?.data?.message || "Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen font-['Inter',sans-serif]">
      {saving && (
        <div className="fixed inset-0 z-[300] bg-slate-950/35 backdrop-blur-[2px] flex items-center justify-center px-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center">
            <div className="mx-auto mb-4 h-11 w-11 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
            <h3 className="text-sm font-black text-slate-900">Updating profile</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Uploading images and saving user details. Please wait…
            </p>
          </div>
        </div>
      )}
      {loading && (
        <div className="mb-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm animate-pulse">
          <div className="h-5 w-40 rounded bg-slate-200 mb-3" />
          <div className="h-3 w-72 max-w-full rounded bg-slate-100" />
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {loadError}
          <button type="button" onClick={() => window.location.reload()} className="ml-3 underline">Retry</button>
        </div>
      )}
      {/* BREADCRUMB & HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1 gap-4">
        <div>
          <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span>Admin Users</span>
            <ChevronRight size={10} />
            <span className="text-emerald-700">My Profile</span>
          </div>
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight flex items-center gap-3">
            My Profile
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Manage your personal information, performance and account settings
          </p>
        </div>
        {canEditProfile && !loading && !loadError && (
          <div className="flex items-center gap-2">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-50 transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              >
                <Edit3 size={14} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (profilePreview) URL.revokeObjectURL(profilePreview);
                    if (signaturePreview) URL.revokeObjectURL(signaturePreview);
                    setProfilePreview("");
                    setSignaturePreview("");
                    setShowPassword(false);
                    setEditMode(false);
                    setFormData({ ...adminData, password: "" });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all focus:ring-2 focus:ring-slate-500 focus:ring-offset-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 border border-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        {/* LEFT COLUMN: PROFILE SUMMARY & TABS */}
        <div className="lg:col-span-2 flex flex-col gap-1">

          {/* PROFILE SUMMARY CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-24 group cursor-pointer shrink-0">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-[3px] border-white shadow-sm">
                  <img
                    src={adminData.profileImage || `https://ui-avatars.com/api/?name=${adminData.fullName || adminData.username || 'User'}&background=e2e8f0&color=0f172a&bold=true&size=200`}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                {canEditProfile && (
                  <div className="absolute bottom-0 right-0 bg-[#00a859] p-1.5 rounded-full text-white shadow-sm border-2 border-white z-10">
                    <Camera size={14} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-[minmax(150px,0.7fr)_minmax(250px,1.3fr)] gap-y-2 gap-x-2">
              <div className="col-span-full mb-1">
                <h2 className="text-[20px] font-bold text-slate-800 flex items-center gap-2 mb-0.5">
                  {adminData.title ? `${adminData.title} ` : ''}{adminData.fullName || adminData.username || 'User'}
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${adminData.status === 'Inactive' ? 'bg-red-100 text-red-700' : 'bg-[#e6f7ec] text-[#00a859]'}`}>
                    {adminData.status || 'Active'}
                  </span>
                </h2>
                <p className="text-xs font-medium text-slate-500 mb-2">
                  @{adminData.username || 'username'}
                </p>
                <div className="inline-block px-2.5 py-0.5 bg-transparent text-[#00a859] text-[10px] font-bold rounded border border-[#00a859]/30">
                  {adminData.role || 'Role'}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <Briefcase size={12} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5">Designation</p>
                  <p className="text-[11px] font-bold text-slate-700">{adminData.designation || 'Managing Director'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <Mail size={12} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5 flex items-center gap-1.5">
                    Email Address
                  </p>
                  <p className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                    {adminData.email || 'vansh.2002vc@gmail.com'}
                    <span className="text-[9px] bg-[#e6f7ec] text-[#00a859] px-1.5 py-[1px] rounded font-bold">Verified</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <Activity size={12} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5">Department</p>
                  <p className="text-[11px] font-bold text-slate-700">{adminData.department || 'Management'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <Phone size={12} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5 flex items-center gap-1.5">
                    Mobile No
                  </p>
                  <p className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                    {adminData.mobile || '8076750278'}
                    <span className="text-[9px] bg-[#e6f7ec] text-[#00a859] px-1.5 py-[1px] rounded font-bold">Verified</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px bg-slate-200 mx-2"></div>

            <div className="flex flex-col justify-center gap-3 min-w-[200px]">
              <div className="grid grid-cols-[85px_10px_1fr] items-start">
                <p className="text-[10px] font-bold text-slate-500">User ID</p>
                <p className="text-[11px] font-bold text-slate-400 text-center">:</p>
                <p className="text-[11px] font-bold text-slate-700">{adminData._id ? adminData._id.slice(-8).toUpperCase() : 'USR-ADM-0157'}</p>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr] items-start">
                <p className="text-[10px] font-bold text-slate-500">ID Created On</p>
                <p className="text-[11px] font-bold text-slate-400 text-center">:</p>
                <div className="text-[11px] font-bold text-slate-700 leading-snug">
                  {adminData.createdAt ? new Date(adminData.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                </div>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr] items-start">
                <p className="text-[10px] font-bold text-slate-500">Created By</p>
                <p className="text-[11px] font-bold text-slate-400 text-center">:</p>
                <div>
                  <p className="text-[11px] font-bold text-slate-700 leading-none mb-0.5">{adminData.createdBy?.fullName || adminData.createdBy?.username || 'System'}</p>
                  <p className="text-[9px] font-medium text-slate-400 leading-none">{adminData.createdBy ? adminData.createdBy.role : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr] items-start">
                <p className="text-[10px] font-bold text-slate-500">Last Updated</p>
                <p className="text-[11px] font-bold text-slate-400 text-center">:</p>
                <div className="text-[11px] font-bold text-slate-700 leading-snug">
                  {adminData.updatedAt ? new Date(adminData.updatedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                </div>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr] items-start">
                <p className="text-[10px] font-bold text-slate-500">Last Updated By</p>
                <p className="text-[11px] font-bold text-slate-400 text-center">:</p>
                <div>
                  <p className="text-[11px] font-bold text-slate-700 leading-none mb-0.5">{adminData.updatedBy?.fullName || adminData.updatedBy?.username || 'System'}</p>
                  <p className="text-[9px] font-medium text-slate-400 leading-none">{adminData.updatedBy?.role || ''}</p>
                </div>
              </div>
            </div>
          </div>

          {/* TABS & FORM AREA */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[380px] flex flex-col">
            {/* TABS */}
            <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setActiveTab('User Details')}
                className={`px-5 py-3 text-[11px] font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'User Details' ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <FaUserAstronaut size={14} /> User Details
              </button>


              <button
                onClick={() => setActiveTab('HOD Details')}
                className={`px-5 py-3 text-[11px] font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'HOD Details' ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Users size={14} /> HOD Details
              </button>
              <button
                onClick={() => setActiveTab('Reporting To')}
                className={`px-5 py-3 text-[11px] font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'Reporting To' ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Target size={14} /> Reporting To
              </button>
              <button
                onClick={() => setActiveTab('Role & Status')}
                className={`px-5 py-3 text-[11px] font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'Role & Status' ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <ShieldCheck size={14} /> Role & Status
              </button>
            </div>

            {/* FORM CONTENT */}
            <div className="p-4 flex-1">

              {/* TAB: USER DETAILS */}
              {activeTab === 'User Details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
                  {/* Basic Info Col */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                      <select value={editMode ? (formData.title || "") : (adminData.title || "")} name="title" className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none" disabled={!editMode} onChange={handleChange}>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" value={editMode ? (formData.fullName || "") : (adminData.fullName || "")} name="fullName" className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none" readOnly={!editMode} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
                      <input type="text" value={editMode ? (formData.username || "") : (adminData.username || "")} name="username" className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none" readOnly={!editMode} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Password</label>
                      {canManagePrivileges && editMode ? (
                        <>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password || ""}
                              onChange={handleChange}
                              autoComplete="new-password"
                              placeholder="Leave blank to keep current password"
                              className="w-full text-xs font-semibold px-3 py-2 pr-9 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none"
                            />
                            <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-2 text-slate-400 hover:text-emerald-600" aria-label={showPassword ? "Hide password" : "Show password"}>
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <p className="mt-1 text-[9px] font-medium text-amber-600">
                            Resets this selected user's password.
                          </p>
                        </>
                      ) : !canManagePrivileges ? (
                        <>
                          <button
                            type="button"
                            onClick={() => window.dispatchEvent(new Event("open-admin-change-password"))}
                            className="w-full flex items-center justify-between text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                          >
                            Change My Password with OTP <ChevronRight size={13} />
                          </button>
                          <p className="mt-1 text-[9px] font-medium text-slate-400">Opens your secure password verification modal.</p>
                        </>
                      ) : (
                        <p className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-400">
                          Enter Edit mode to reset this user's password
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Media Col */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">User Photo <span className="text-red-500">*</span></label>
                      <div className="flex gap-3 items-start">
                        <div className="w-14 h-14 bg-slate-100 rounded border border-slate-200 overflow-hidden shrink-0">
                          <img src={profilePreview || adminData.profileImage || `https://ui-avatars.com/api/?name=${adminData.fullName || adminData.username || 'User'}&background=e2e8f0&color=0f172a&bold=true&size=100`} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className={`text-[9px] font-bold text-slate-700 border border-slate-200 px-2 py-1 rounded flex items-center justify-center gap-1 ${editMode ? "hover:bg-slate-50 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
                            <Upload size={10} /> Upload New
                            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={!editMode || saving} className="hidden" onChange={e => handleImageSelection("profileImage", e.target.files?.[0])} />
                          </label>
                          {formData.profileImage instanceof File && <span className="max-w-[120px] truncate text-[9px] font-semibold text-emerald-600" title={formData.profileImage.name}>{formData.profileImage.name}</span>}
                          {adminData.profileImage && (
                            <a href={adminData.profileImage} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-1 rounded flex items-center justify-center gap-1 hover:bg-emerald-100">
                              <Eye size={10} /> View Photo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Signature</label>
                      <div className="flex gap-3 items-start">
                        <div className="w-24 h-12 bg-white rounded border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {signaturePreview || adminData.signatureImage ? (
                            <img src={signaturePreview || adminData.signatureImage} alt="Signature" className="w-full h-full object-contain" />
                          ) : (
                            <span className="font-[cursive] text-lg text-slate-800 italic">No Sig</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className={`text-[9px] font-bold text-slate-700 border border-slate-200 px-2 py-1 rounded flex items-center justify-center gap-1 ${editMode ? "hover:bg-slate-50 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
                            <Upload size={10} /> Upload New
                            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={!editMode || saving} className="hidden" onChange={e => handleImageSelection("signatureImage", e.target.files?.[0])} />
                          </label>
                          {formData.signatureImage instanceof File && <span className="max-w-[120px] truncate text-[9px] font-semibold text-emerald-600" title={formData.signatureImage.name}>{formData.signatureImage.name}</span>}
                          {adminData.signatureImage && (
                            <a href={adminData.signatureImage} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-1 rounded flex items-center justify-center gap-1 hover:bg-emerald-100">
                              <Eye size={10} /> View Signature
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 font-medium leading-tight">Used on Prepared By / Reviewed By in generated PDFs.</p>
                    </div>
                  </div>

                  {/* Department & Contact Col */}
                  <div className="space-y-3 xl:col-span-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Department <span className="text-red-500">*</span></label>
                      <select className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none" disabled={!editMode} onChange={editMode ? handleDepartmentChange : handleChange} value={editMode ? (formData.department || "") : (adminData.department || "")} name="department">
                        {editMode ? departments.map(d => <option key={d._id || d.name} value={d.name}>{d.name}</option>) : <option value={adminData.department}>{adminData.department || 'Management'}</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Designation <span className="text-red-500">*</span></label>
                      <select className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none" disabled={!editMode} onChange={editMode ? handleDesignationChange : handleChange} value={editMode ? (formData.designation || "") : (adminData.designation || "")} name="designation">
                        {editMode ? designations.map(d => <option key={d._id || d.name} value={d.name}>{d.name}</option>) : <option value={adminData.designation}>{adminData.designation || 'Managing Director'}</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Official Email <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-2">
                        <input type="email" value={editMode ? (formData.email || "") : (adminData.email || "")} name="email" className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none" readOnly={!editMode} onChange={handleChange} />
                        {editMode ? (
                          <button type="button" disabled={sendingEmailOtp || emailVerified} onClick={() => sendOtp("email")} className="min-w-[74px] text-[9px] font-bold bg-emerald-600 text-white px-2 py-2 rounded disabled:opacity-60">
                            {sendingEmailOtp ? "Sending..." : emailVerified ? "Verified" : "Send OTP"}
                          </button>
                        ) : emailVerified && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">Verified</span>}
                      </div>
                      {emailOtpSent && editMode && (
                        <div className="flex gap-2 mt-2">
                          <input value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit Email OTP" className="flex-1 text-xs px-3 py-2 border border-amber-300 rounded-md outline-none focus:border-emerald-500" />
                          <button type="button" disabled={verifyingEmailOtp} onClick={() => verifyOtp("email")} className="px-3 py-2 text-[9px] font-bold text-white bg-[#1e4018] rounded-md disabled:opacity-60">{verifyingEmailOtp ? "Checking..." : "Verify"}</button>
                        </div>
                      )}
                      <p className={`text-[9px] font-semibold mt-1 flex items-center gap-1 ${emailVerified ? "text-emerald-600" : "text-amber-600"}`}><CheckCircle2 size={10} /> {emailVerified ? "Official Email verified" : "Email change requires OTP verification"}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Official Mobile No <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-2">
                        <input type="text" value={editMode ? (formData.mobile || "") : (adminData.mobile || "")} name="mobile" className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none" readOnly={!editMode} onChange={handleChange} />
                        {editMode ? (
                          <button type="button" disabled={sendingMobileOtp || mobileVerified} onClick={() => sendOtp("mobile")} className="min-w-[74px] text-[9px] font-bold bg-emerald-600 text-white px-2 py-2 rounded disabled:opacity-60">
                            {sendingMobileOtp ? "Sending..." : mobileVerified ? "Verified" : "Send OTP"}
                          </button>
                        ) : mobileVerified && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">Verified</span>}
                      </div>
                      {mobileOtpSent && editMode && (
                        <div className="flex gap-2 mt-2">
                          <input value={mobileOtp} onChange={e => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit WhatsApp OTP" className="flex-1 text-xs px-3 py-2 border border-amber-300 rounded-md outline-none focus:border-emerald-500" />
                          <button type="button" disabled={verifyingMobileOtp} onClick={() => verifyOtp("mobile")} className="px-3 py-2 text-[9px] font-bold text-white bg-[#1e4018] rounded-md disabled:opacity-60">{verifyingMobileOtp ? "Checking..." : "Verify"}</button>
                        </div>
                      )}
                      <p className={`text-[9px] font-semibold mt-1 flex items-center gap-1 ${mobileVerified ? "text-emerald-600" : "text-amber-600"}`}><CheckCircle2 size={10} /> {mobileVerified ? "Official Mobile No verified" : "Mobile change requires WhatsApp OTP verification"}</p>
                    </div>

                  </div>

                  {/* HOD, Reporting & Role Section */}
                  <div className="col-span-full xl:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 pt-4 border-t border-slate-200">

                    {/* Column 1: HOD Details */}
                    <div className="space-y-1.5">
                      <h4 className="text-[12px] font-bold text-emerald-700 flex items-center gap-2 mb-2"><Users size={14} /> HOD Details</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#1e293b]">HOD Name</span><span className="text-[10px] font-semibold text-slate-800">{(editMode ? formData.hodName : adminData.hodName) || 'N/A'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#1e293b]">HOD Mobile No</span><span className="text-[10px] font-semibold text-slate-800">{(editMode ? formData.hodMobile : adminData.hodMobile) || 'N/A'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#1e293b]">HOD Official Email</span><span className="text-[10px] font-semibold text-slate-800">{(editMode ? formData.hodEmail : adminData.hodEmail) || 'N/A'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#1e293b]">HOD Designation</span><span className="text-[10px] font-semibold text-slate-800">{(editMode ? formData.hodDesignation : adminData.hodDesignation) || 'N/A'}</span></div>
                      </div>
                      <div className="mt-2">
                        <span className="text-[10px] font-bold text-[#1e293b] block mb-2">HOD Photo</span>
                        <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-lg border border-slate-100 w-max pr-4">
                          <div className="w-9 h-9 rounded-md bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                            {(editMode ? formData.hodImage : adminData.hodImage) ? (
                              <img src={editMode ? formData.hodImage : adminData.hodImage} alt="HOD" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={16} /></div>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[#1e293b]">HOD</p>
                            <p className="text-[9px] font-medium text-slate-500 leading-tight">Auto-fetched from<br />HOD's profile</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Reporting To */}
                    <div className="space-y-1.5 md:border-l border-slate-200 md:pl-6">
                      <h4 className="text-[12px] font-bold text-emerald-700 flex items-center gap-2 mb-2"><User size={14} /> Reporting To</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#1e293b]">Reporting Name</span><span className="text-[10px] font-semibold text-slate-800">{(editMode ? formData.reportingToName : adminData.reportingToName) || 'N/A'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#1e293b]">Reporting Mobile</span><span className="text-[10px] font-semibold text-slate-800">{(editMode ? formData.reportingToMobile : adminData.reportingToMobile) || 'N/A'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#1e293b]">Reporting Email</span><span className="text-[10px] font-semibold text-slate-800">{(editMode ? formData.reportingToEmail : adminData.reportingToEmail) || 'N/A'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[#1e293b]">Reporting Designation</span><span className="text-[10px] font-semibold text-slate-800">{(editMode ? formData.reportingToDesignation : adminData.reportingToDesignation) || 'N/A'}</span></div>
                      </div>
                      <div className="mt-2">
                        <span className="text-[10px] font-bold text-[#1e293b] block mb-2">Reporting Photo</span>
                        <div className="flex items-center gap-3 bg-[#f2f9f5] p-2 rounded-lg border border-[#e0f0e6] w-max pr-4">
                          <div className="w-9 h-9 rounded-md bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                            {(editMode ? formData.reportingToImage : adminData.reportingToImage) ? (
                              <img src={editMode ? formData.reportingToImage : adminData.reportingToImage} alt="Reporting To" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={16} /></div>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-700">Reporting To</p>
                            <p className="text-[9px] font-medium text-slate-500 leading-tight">Auto-fetched from<br />profile</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Role & Status */}
                    <div className="space-y-2 md:border-l border-slate-200 md:pl-6">
                      <h4 className="text-[12px] font-bold text-emerald-700 flex items-center gap-2 mb-2"><Settings size={14} /> Role & Status</h4>

                      <div>
                        <label className="block text-[10px] font-bold text-[#1e293b] mb-1">Role <span className="text-red-500">*</span></label>
                        <select className="w-full text-[11px] font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none text-slate-700" disabled={!editMode || !canManagePrivileges} value={editMode ? (formData.role || "") : (adminData.role || "")} name="role" onChange={handleChange}>
                          {editMode && canManagePrivileges ? roles.map(r => <option key={r._id || r.name} value={r.name}>{r.name}</option>) : <option value={adminData.role}>{adminData.role || 'Role not assigned'}</option>}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#1e293b] mb-1">Status</label>
                        <div className="flex rounded-md shadow-sm">
                          <button
                            type="button"
                            disabled={!editMode || !canManagePrivileges}
                            onClick={() => setFormData({ ...formData, status: 'Active' })}
                            className={`flex-1 py-2 text-[11px] font-bold rounded-l-md border transition-colors ${(editMode ? formData.status : adminData.status) !== 'Inactive'
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                              }`}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            disabled={!editMode || !canManagePrivileges}
                            onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                            className={`flex-1 py-2 text-[11px] font-bold rounded-r-md border-y border-r transition-colors ${(editMode ? formData.status : adminData.status) === 'Inactive'
                                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                              }`}
                          >
                            Inactive
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>



                </div>
              )}

              {/* TAB: HOD DETAILS */}
              {activeTab === 'HOD Details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl animate-in fade-in duration-300">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">HOD Name</label>
                      <input type="text" value={editMode ? (formData.hodName || "") : (adminData.hodName || "")} name="hodName" className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none text-slate-600" readOnly disabled />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">HOD Designation</label>
                      <input type="text" value={editMode ? (formData.hodDesignation || "") : (adminData.hodDesignation || "")} name="hodDesignation" className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none text-slate-600" readOnly disabled />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">HOD Email</label>
                      <input type="email" value={editMode ? (formData.hodEmail || "") : (adminData.hodEmail || "")} name="hodEmail" className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none text-slate-600" readOnly disabled />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">HOD Mobile</label>
                      <input type="text" value={editMode ? (formData.hodMobile || "") : (adminData.hodMobile || "")} name="hodMobile" className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none text-slate-600" readOnly disabled />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-2">HOD Photo</label>
                    <div className="w-24 h-24 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {(editMode ? formData.hodImage : adminData.hodImage) ? (
                        <img src={editMode ? formData.hodImage : adminData.hodImage} alt="HOD Photo" className="w-full h-full object-cover rounded shadow-sm" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded text-slate-300">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: REPORTING TO */}
              {activeTab === 'Reporting To' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl animate-in fade-in duration-300">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Reporting To Name</label>
                      <input type="text" value={editMode ? (formData.reportingToName || "") : (adminData.reportingToName || "")} name="reportingToName" className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none text-slate-600" readOnly disabled />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Reporting To Designation</label>
                      <input type="text" value={editMode ? (formData.reportingToDesignation || "") : (adminData.reportingToDesignation || "")} name="reportingToDesignation" className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none text-slate-600" readOnly disabled />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Reporting To Email</label>
                      <input type="email" value={editMode ? (formData.reportingToEmail || "") : (adminData.reportingToEmail || "")} name="reportingToEmail" className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none text-slate-600" readOnly disabled />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Reporting To Mobile</label>
                      <input type="text" value={editMode ? (formData.reportingToMobile || "") : (adminData.reportingToMobile || "")} name="reportingToMobile" className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none text-slate-600" readOnly disabled />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-2">Reporting To Photo</label>
                    <div className="w-24 h-24 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {(editMode ? formData.reportingToImage : adminData.reportingToImage) ? (
                        <img src={editMode ? formData.reportingToImage : adminData.reportingToImage} alt="Reporting To Photo" className="w-full h-full object-cover rounded shadow-sm" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded text-slate-300">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ROLE & STATUS */}
              {activeTab === 'Role & Status' && (
                <div className="max-w-xl animate-in fade-in duration-300">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-5 flex items-start gap-4">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-100 shrink-0">
                      <ShieldCheck size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 mb-1">System Permissions</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                        Your assigned role determines your access level across the CRM modules, analytics dashboards, and operational features.
                      </p>
                      <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-md shadow-sm">
                        <span className="text-[10px] font-bold text-slate-500">Current Role:</span>
                        <span className="text-[11px] font-black text-emerald-700">{adminData.role || 'Role Not Assigned'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-2">Account Status</label>
                      <div className="flex rounded-md overflow-hidden border border-slate-200 w-max shadow-sm">
                        <button className={`px-5 py-2 text-xs font-bold transition-colors ${adminData.status !== 'Inactive' ? 'bg-[#006039] text-white' : 'bg-white text-slate-500'}`}>Active</button>
                        <button className={`px-5 py-2 text-xs font-bold transition-colors ${adminData.status === 'Inactive' ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border-l border-slate-200'}`}>Inactive</button>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">Determines if you can log into the system.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-2">Account Type</label>
                      <div className="inline-flex px-3 py-2 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md">
                        {adminData.role?.includes('Admin') ? 'Administrator' : 'Standard User'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-1">
          {/* PERFORMANCE CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
            {performanceLoading && (
              <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
                <div className="h-7 w-7 rounded-full border-3 border-emerald-100 border-t-emerald-600 animate-spin" />
              </div>
            )}
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp size={100} />
            </div>
            <div className="flex justify-between items-center mb-1 relative z-10">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{adminData.fullName || adminData.username || 'User'} Performance <span className="text-slate-400 font-bold lowercase tracking-normal">(This Year)</span></h3>
              <Link to="/dashboard" className="text-[9px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors">View Details</Link>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-1 relative z-10">
              <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-center flex flex-col items-center h-full">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center mb-1.5 shrink-0">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[8.5px] font-bold text-slate-400 mb-0.5 leading-tight">Total Leads</p>
                <p className="text-base font-black text-slate-900 leading-none tracking-tight whitespace-nowrap">{adminData.performance?.totalLeads ?? 0}</p>
              </div>

              <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-center flex flex-col items-center h-full">
                <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center mb-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <p className="text-[8.5px] font-bold text-slate-400 mb-0.5 leading-tight">Stall Bookings</p>
                <p className="text-base font-black text-slate-900 leading-none tracking-tight whitespace-nowrap">{adminData.performance?.stallBookings ?? 0}</p>
              </div>

              <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-center flex flex-col items-center h-full">
                <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center mb-1.5 shrink-0">
                  <Target className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <p className="text-[8.5px] font-bold text-slate-400 mb-0.5 leading-tight">Conversion Rate</p>
                <p className="text-base font-black text-slate-900 leading-none tracking-tight whitespace-nowrap">{adminData.performance?.conversionRate ?? 0}%</p>
              </div>

              <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-center flex flex-col items-center h-full">
                <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center mb-1.5 shrink-0">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="text-[8.5px] font-bold text-slate-400 mb-0.5 leading-tight">Amount Achieved</p>
                <p className="text-sm font-black text-slate-900 leading-none tracking-tight whitespace-nowrap">
                  ₹ {Number(adminData.performance?.totalAmountAchieved || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-slate-600">Lead-to-Booking Conversion</span>
                <span className="text-lg font-black text-slate-900 leading-none">{adminData.performance?.conversionRate ?? 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full bg-[#006039] relative`} style={{ width: `${Math.min(100, adminData.performance?.conversionRate ?? 0)}%` }}>
                  <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]"></div>
                </div>
              </div>
              <div className="flex justify-between text-[9px] mt-2 font-bold">
                <span className="text-slate-500">New Leads: {adminData.performance?.totalLeads ?? 0}</span>
                <span className="text-emerald-700">Bookings: {adminData.performance?.stallBookings ?? 0}</span>
              </div>
            </div>
          </div>

          {/* ACCESS RIGHTS */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-blue-600" /> CRM Access Rights
            </h3>
            <p className="text-[10px] font-medium text-slate-500 mb-4">Modules and features this user can access.</p>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {Object.entries(roles.find(r => r.name === adminData.role)?.permissions || {}).filter(([, hasAccess]) => hasAccess).slice(0, 6).map(([module]) => ({ module, access: 'Full Access' })).map((right, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-slate-400" /> {right.module}</span>
                  <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                    {right.access === 'Full Access' ? <CheckCircle2 size={10} /> : null} {right.access}
                  </span>
                </div>
              ))}
            </div>

            {loggedInUser?.role?.includes('Super Administrator') && (
              <Link to="/role-permissions" className="w-full mt-4 py-2.5 text-[11px] font-bold text-slate-700 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 block text-center">
                <ShieldCheck size={14} className="inline-block" /> View / Edit Access Rights
              </Link>
            )}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-5">
              <Clock size={14} className="text-emerald-600" /> Recent Activity
            </h3>

            <div className="relative border-l-2 border-slate-100 ml-2 space-y-5 pb-2">
              {activityLoading && (
                <div className="py-6 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-emerald-100 border-t-emerald-600 animate-spin" />
                </div>
              )}
              {!activityLoading && recentActivities.map((activity) => (
                <div key={activity.id} className="relative pl-5">
                  <div className={`absolute w-2.5 h-2.5 rounded-full -left-[5.5px] top-0.5 border-2 border-white ring-2 ${activity.color === "red" ? "bg-red-500 ring-red-100" : activity.color === "blue" ? "bg-blue-500 ring-blue-100" : "bg-emerald-500 ring-emerald-100"}`}></div>
                  <p className="text-[11px] font-bold text-slate-800 leading-none mb-1">{activity.title}</p>
                  <p className="text-[9px] font-semibold text-slate-400">{activity.time}</p>
                </div>
              ))}
              {!activityLoading && !recentActivities.length && <p className="pl-5 text-[10px] font-medium text-slate-400">No recent activity found.</p>}
            </div>

            {canViewActivityLogs ? (
              <Link to="/activity-logs" className="w-full text-center mt-3 pt-3 border-t border-slate-100 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1">
                View All Activity <ChevronRight size={12} />
              </Link>
            ) : (
              <button type="button" disabled className="w-full text-center mt-3 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1 cursor-not-allowed" title="Activity Logs access required">
                View All Activity <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      {/* {loggedInUser?.role?.includes('Super Administrator') && (
        <div className="mt-6 flex justify-end gap-3 pb-6">
          <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2.5 bg-[#006039] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#004d2e] transition-colors flex items-center gap-2">
            <Save size={14} /> Save Changes
          </button>
        </div>
      )} */}
    </div>
  );
}
