import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, ShieldCheck, Clock, Briefcase, Camera,
  Activity, Users, Target, CheckCircle2, LayoutDashboard,
  FileText, MessageSquare, CreditCard, ChevronRight, Edit3, Save, Upload, Eye, TrendingUp
} from "lucide-react";
import { FaUserAstronaut } from "react-icons/fa";
import api from "../lib/api";

export default function MyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptRes, desigRes, adminRes, rolesRes] = await Promise.all([
          api.get('/api/departments'),
          api.get('/api/designations'),
          api.get('/api/admin/all'),
          api.get('/api/roles')
        ]);
        if (deptRes.data?.success) setDepartments(deptRes.data.data);
        if (desigRes.data?.success) setDesignations(desigRes.data.data);
        if (adminRes.data?.success) setAdmins(adminRes.data.data);
        if (rolesRes.data?.success) setRoles(rolesRes.data.data);
      } catch (e) {
        console.error('Failed to fetch dropdowns', e);
      }
    };
    fetchDropdowns();

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const storedInfo = localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo');

        let targetId = id;
        let currentUser = null;
        if (storedInfo) {
          try {
            currentUser = JSON.parse(storedInfo);
            setLoggedInUser(currentUser);
            if (!targetId) targetId = currentUser._id;
          } catch (e) { }
        }

        if (targetId) {
          try {
            // Fetch the profile data and dashboard stats in parallel
            const [profileRes, statsRes] = await Promise.all([
              api.get(`/api/admin/${targetId}`),
              api.get(`/api/dashboard/stats`).catch(() => ({ data: { success: false } }))
            ]);

            if (profileRes.data.success && profileRes.data.data) {
              const profileData = Array.isArray(profileRes.data.data) ? profileRes.data.data[0] : profileRes.data.data;

              // Map available dashboard stats to performance
              if (statsRes.data?.success && statsRes.data?.data) {
                const counts = statsRes.data.data.counts || {};
                profileData.performance = {
                  ...profileData.performance, // Preserve existing performance data if any
                  totalLeads: counts.totalContactQueries ?? 325,
                  stallBookings: counts.totalBookings ?? 48,
                  // The following are placeholders as they will come from CRM modules later
                  businessGenerated: '1.24 Cr',
                  conversionRate: '14.77',
                  targetAchievement: 82,
                  targetAmount: '1.50 Cr',
                  leadsGrowth: 18,
                  bookingsGrowth: 22,
                  businessGrowth: 25,
                  conversionGrowth: 8
                };
              }

              setAdminData(profileData);
              setFormData(profileData);
            }
          } catch (e) {
            console.error("Error parsing adminInfo or fetching profile/stats", e);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/api/admin/update/${adminData._id}`, formData);
      if (res.data.success) {
        setAdminData(formData);
        setEditMode(false);
      } else {
        alert(res.data.message || 'Failed to update profile');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen font-['Inter',sans-serif]">
      {/* BREADCRUMB & HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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
        {loggedInUser?.role?.includes('Super Administrator') && (
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
                  onClick={() => { setEditMode(false); setFormData(adminData); }}
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
                {loggedInUser?.role?.includes('Super Administrator') && (
                  <div className="absolute bottom-0 right-0 bg-[#00a859] p-1.5 rounded-full text-white shadow-sm border-2 border-white z-10">
                    <Camera size={14} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-1">
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

              <div className="flex items-center gap-2.5">
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
                  <p className="text-[11px] font-bold text-slate-700 leading-none mb-0.5">{adminData.createdBy ? adminData.createdBy.username : 'Super Admin'}</p>
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
                  <p className="text-[11px] font-bold text-slate-700 leading-none mb-0.5">Vijay Sharma</p>
                  <p className="text-[9px] font-medium text-slate-400 leading-none">Super Admin</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      <div className="relative">
                        <input type="password" name="password" value={editMode ? (formData.password || "") : ""} placeholder="Leave blank to keep current" className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none" readOnly={!editMode} onChange={handleChange} />
                        <Eye className="absolute right-3 top-2 text-slate-400 cursor-pointer" size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Media Col */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-2">User Photo <span className="text-red-500">*</span></label>
                      <div className="flex gap-4 items-start">
                        <div className="w-14 h-14 bg-slate-100 rounded border border-slate-200 overflow-hidden shrink-0">
                          <img src={adminData.profileImage || `https://ui-avatars.com/api/?name=${adminData.fullName || adminData.username || 'User'}&background=e2e8f0&color=0f172a&bold=true&size=100`} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button className="text-[10px] font-bold text-slate-700 border border-slate-200 px-3 py-1.5 rounded flex items-center justify-center gap-1.5 hover:bg-slate-50">
                            <Upload size={12} /> Upload New
                          </button>
                          {adminData.profileImage && (
                            <a href={adminData.profileImage} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded flex items-center justify-center gap-1.5 hover:bg-emerald-100">
                              <Eye size={12} /> View Photo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-2">Signature</label>
                      <div className="flex gap-4 items-start">
                        <div className="w-24 h-12 bg-white rounded border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {adminData.signatureImage ? (
                            <img src={adminData.signatureImage} alt="Signature" className="w-full h-full object-contain" />
                          ) : (
                            <span className="font-[cursive] text-lg text-slate-800 italic">No Sig</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button className="text-[10px] font-bold text-slate-700 border border-slate-200 px-3 py-1.5 rounded flex items-center justify-center gap-1.5 hover:bg-slate-50">
                            <Upload size={12} /> Upload New
                          </button>
                          {adminData.signatureImage && (
                            <a href={adminData.signatureImage} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded flex items-center justify-center gap-1.5 hover:bg-emerald-100">
                              <Eye size={12} /> View Signature
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">Used on Prepared By / Reviewed By in generated PDFs.</p>
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
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">Verified</span>
                      </div>
                      <p className="text-[9px] text-emerald-600 font-semibold mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> Official Email verified</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Official Mobile No <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-2">
                        <input type="text" value={editMode ? (formData.mobile || "") : (adminData.mobile || "")} name="mobile" className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none" readOnly={!editMode} onChange={handleChange} />
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">Verified</span>
                      </div>
                      <p className="text-[9px] text-emerald-600 font-semibold mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> Official Mobile No verified</p>
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
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp size={100} />
            </div>
            <div className="flex justify-between items-center mb-1 relative z-10">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">My Performance <span className="text-slate-400 font-bold lowercase tracking-normal">(This Financial Year)</span></h3>
              <button className="text-[9px] font-bold text-emerald-700 border border-emerald-200 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors">View Details</button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-1 relative z-10">
              <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-center flex flex-col items-center h-full">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center mb-1.5 shrink-0">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[8.5px] font-bold text-slate-400 mb-0.5 leading-tight">Total Leads</p>
                <p className="text-base font-black text-slate-900 leading-none tracking-tight whitespace-nowrap">{adminData.performance?.totalLeads ?? 325}</p>
                <div className="bg-emerald-50 px-1 py-1 rounded w-full text-center mt-auto pt-1.5 flex flex-col items-center justify-center leading-[1.1]">
                  <span className="text-[9px] font-bold text-emerald-600">↑ {adminData.performance?.leadsGrowth ?? 18}%</span>
                  <span className="text-[7.5px] font-medium text-emerald-600/60">vs last year</span>
                </div>
              </div>

              <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-center flex flex-col items-center h-full">
                <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center mb-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <p className="text-[8.5px] font-bold text-slate-400 mb-0.5 leading-tight">Stall Bookings</p>
                <p className="text-base font-black text-slate-900 leading-none tracking-tight whitespace-nowrap">{adminData.performance?.stallBookings ?? 48}</p>
                <div className="bg-emerald-50 px-1 py-1 rounded w-full text-center mt-auto pt-1.5 flex flex-col items-center justify-center leading-[1.1]">
                  <span className="text-[9px] font-bold text-emerald-600">↑ {adminData.performance?.bookingsGrowth ?? 22}%</span>
                  <span className="text-[7.5px] font-medium text-emerald-600/60">vs last year</span>
                </div>
              </div>

              <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-center flex flex-col items-center h-full">
                <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center mb-1.5 shrink-0">
                  <span className="text-orange-600 font-bold text-sm">₹</span>
                </div>
                <p className="text-[8.5px] font-bold text-slate-400 mb-0.5 leading-tight">Business Generated</p>
                <p className="text-base font-black text-slate-900 leading-none tracking-tight whitespace-nowrap">₹ {adminData.performance?.businessGenerated ?? '1.24 Cr'}</p>
                <div className="bg-emerald-50 px-1 py-1 rounded w-full text-center mt-auto pt-1.5 flex flex-col items-center justify-center leading-[1.1]">
                  <span className="text-[9px] font-bold text-emerald-600">↑ {adminData.performance?.businessGrowth ?? 25}%</span>
                  <span className="text-[7.5px] font-medium text-emerald-600/60">vs last year</span>
                </div>
              </div>

              <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-center flex flex-col items-center h-full">
                <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center mb-1.5 shrink-0">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="text-[8.5px] font-bold text-slate-400 mb-0.5 leading-tight">Conversion Rate</p>
                <p className="text-base font-black text-slate-900 leading-none tracking-tight whitespace-nowrap">{adminData.performance?.conversionRate ?? '14.77'}%</p>
                <div className="bg-emerald-50 px-1 py-1 rounded w-full text-center mt-auto pt-1.5 flex flex-col items-center justify-center leading-[1.1]">
                  <span className="text-[9px] font-bold text-emerald-600">↑ {adminData.performance?.conversionGrowth ?? 8}%</span>
                  <span className="text-[7.5px] font-medium text-emerald-600/60">vs last year</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-slate-600">Annual Target Achievement</span>
                <span className="text-lg font-black text-slate-900 leading-none">{adminData.performance?.targetAchievement ?? 82}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full bg-[#006039] relative`} style={{ width: `${adminData.performance?.targetAchievement ?? 82}%` }}>
                  <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]"></div>
                </div>
              </div>
              <div className="flex justify-between text-[9px] mt-2 font-bold">
                <span className="text-slate-500">Target: ₹ {adminData.performance?.targetAmount ?? '1.50 Cr'}</span>
                <span className="text-emerald-700">Achieved: ₹ {adminData.performance?.businessGenerated ?? '1.24 Cr'}</span>
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
              {Object.entries(roles.find(r => r.name === adminData.role)?.permissions || {}).filter(([_, hasAccess]) => hasAccess).slice(0, 6).map(([module]) => ({ module, access: 'Full Access' })).map((right, idx) => (
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
              {(adminData.recentActivity || [
                { title: 'Profile Updated', time: '19 Jul 2026, 09:15 AM', color: 'emerald' },
                { title: 'Password Changed', time: '12 Jul 2026, 06:20 PM', color: 'blue' },
                { title: 'Login Successful', time: '19 Jul 2026, 09:15 AM', color: 'emerald' }
              ]).map((activity, idx) => (
                <div key={idx} className="relative pl-5">
                  <div className={`absolute w-2.5 h-2.5 bg-${activity.color || 'emerald'}-500 rounded-full -left-[5.5px] top-0.5 border-2 border-white ring-2 ring-${activity.color || 'emerald'}-100`}></div>
                  <p className="text-[11px] font-bold text-slate-800 leading-none mb-1">{activity.title}</p>
                  <p className="text-[9px] font-semibold text-slate-400">{activity.time}</p>
                </div>
              ))}
            </div>

            <button className="w-full text-center mt-3 pt-3 border-t border-slate-100 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1">
              View All Activity <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      {loggedInUser?.role?.includes('Super Administrator') && (
        <div className="mt-6 flex justify-end gap-3 pb-6">
          <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2.5 bg-[#006039] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#004d2e] transition-colors flex items-center gap-2">
            <Save size={14} /> Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
