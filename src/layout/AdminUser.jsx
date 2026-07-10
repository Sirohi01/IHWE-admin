import { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, Upload, Check, EyeOff, CheckCircle, XCircle, Pencil, Trash2, X, BadgeCheck, Users, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import api, { otpApi } from '../lib/api';
import Pagination from '../components/Pagination';
import SearchableDropdown from '../components/SearchableDropdown';

const EMPTY_FORM = {
    title: '',
    username: '',
    password: '',
    fullName: '',
    department: '',
    designation: '',
    email: '',
    mobile: '',
    altMobile: '',
    hodName: '',
    hodMobile: '',
    hodEmail: '',
    hodDesignation: '',
    hodImage: '',
    reportingToName: '',
    reportingToMobile: '',
    reportingToEmail: '',
    reportingToDesignation: '',
    reportingToImage: '',
    profileImage: '',
    role: '',
    status: 'Active'
};
const iCls = 'w-full h-8 px-2.5 border border-gray-500 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]';
const lCls = 'text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1 block';

export default function AdminUser() {
    const [admins, setAdmins] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [showPwd, setShowPwd] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [mobileOtp, setMobileOtp] = useState('');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [mobileOtpSent, setMobileOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [mobileVerified, setMobileVerified] = useState(false);
    const [verifiedEmailValue, setVerifiedEmailValue] = useState('');
    const [verifiedMobileValue, setVerifiedMobileValue] = useState('');
    const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
    const [sendingMobileOtp, setSendingMobileOtp] = useState(false);
    const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
    const [verifyingMobileOtp, setVerifyingMobileOtp] = useState(false);
    const itemsPerPage = 25;

    useEffect(() => { fetchAdmins(); fetchRoles(); fetchDepartments(); fetchDesignations(); }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/all');
            if (res.data.success) setAdmins(res.data.data);
        } catch { }
        setLoading(false);
    };

    const fetchRoles = async () => {
        try {
            const res = await api.get('/api/roles');
            if (res.data.success) setRoles(res.data.data);
        } catch { }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/api/departments');
            if (res.data.success) setDepartments(res.data.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchDesignations = async () => {
        try {
            const res = await api.get('/api/designations');
            if (res.data.success) setDesignations(res.data.data);
        } catch (error) {
            console.error('Error fetching designations:', error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const email = form.email.trim();
        if (!email || email !== verifiedEmailValue) {
            setEmailVerified(false);
            setEmailOtpSent(false);
            setEmailOtp('');
        }
    }, [form.email, verifiedEmailValue]);

    useEffect(() => {
        const mobile = form.mobile.trim();
        if (!mobile || mobile !== verifiedMobileValue) {
            setMobileVerified(false);
            setMobileOtpSent(false);
            setMobileOtp('');
        }
    }, [form.mobile, verifiedMobileValue]);

    const inp = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleDepartmentChange = (e) => {
        const depName = e.target.value;
        inp('department', depName);

        const dep = departments.find(d => d.name === depName);
        if (dep && dep.hodName) {
            inp('hodName', dep.hodName);
            const hodUser = admins.find(a => (a.fullName || a.username) === dep.hodName);
            if (hodUser) {
                inp('hodMobile', hodUser.mobile || '');
                inp('hodEmail', hodUser.email || '');
                inp('hodDesignation', hodUser.designation || '');
                inp('hodImage', hodUser.profileImage || hodUser.hodImage || '');
            } else {
                inp('hodMobile', '');
                inp('hodEmail', '');
                inp('hodDesignation', '');
                inp('hodImage', '');
            }
        } else {
            inp('hodName', '');
            inp('hodMobile', '');
            inp('hodEmail', '');
            inp('hodDesignation', '');
            inp('hodImage', '');
        }
    };

    const handleDesignationChange = (e) => {
        const desName = e.target.value;
        inp('designation', desName);

        const des = designations.find(d => d.name === desName);
        if (des && des.reportTo) {
            inp('reportingToName', des.reportTo);
            const reportUser = admins.find(a => (a.fullName || a.username) === des.reportTo);
            if (reportUser) {
                inp('reportingToMobile', reportUser.mobile || '');
                inp('reportingToEmail', reportUser.email || '');
                inp('reportingToDesignation', reportUser.designation || '');
                inp('reportingToImage', reportUser.profileImage || reportUser.hodImage || '');
            } else {
                inp('reportingToMobile', '');
                inp('reportingToEmail', '');
                inp('reportingToDesignation', '');
                inp('reportingToImage', '');
            }
        } else {
            inp('reportingToName', '');
            inp('reportingToMobile', '');
            inp('reportingToEmail', '');
            inp('reportingToDesignation', '');
            inp('reportingToImage', '');
        }
    };

    const isFile = (value) => value instanceof File;

    const buildPayload = () => {
        const cleaned = {
            ...form,
            username: form.username.trim(),
            email: form.email.trim(),
            mobile: form.mobile.trim(),
            hodEmail: form.hodEmail.trim(),
            hodMobile: form.hodMobile.trim()
        };

        if (!cleaned.password) delete cleaned.password;

        const hasFiles = isFile(cleaned.profileImage); // Only user photo can be uploaded here now

        if (!hasFiles) {
            if (!editId || typeof cleaned.profileImage !== 'string') delete cleaned.profileImage;
            return cleaned;
        }

        const fd = new FormData();
        Object.entries(cleaned).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'profileImage') {
                if (isFile(value)) {
                    fd.append(key, value);
                } else if (typeof value === 'string' && value) {
                    fd.append(key, value);
                }
                return;
            }
            fd.append(key, value);
        });
        return fd;
    };

    const checkOfficialContact = async (field = 'both') => {
        const email = form.email.trim();
        const mobile = form.mobile.trim();

        if ((field === 'both' || field === 'email') && email) {
            const emailRes = await api.post('/api/admin/verify-email', { email, id: editId });
            if (!emailRes.data?.success) throw new Error(emailRes.data?.message || 'Official Email is not available');
        }

        if ((field === 'both' || field === 'mobile') && mobile) {
            const mobileRes = await api.post('/api/admin/verify-mobile', { mobile, id: editId });
            if (!mobileRes.data?.success) throw new Error(mobileRes.data?.message || 'Official Mobile Number is not available');
        }
    };

    const resetOtpState = () => {
        setEmailOtp('');
        setMobileOtp('');
        setEmailOtpSent(false);
        setMobileOtpSent(false);
        setEmailVerified(false);
        setMobileVerified(false);
        setVerifiedEmailValue('');
        setVerifiedMobileValue('');
    };

    const sendOfficialEmailOtp = async () => {
        const email = form.email.trim();
        if (!email) return Swal.fire('Error', 'Official Email is required', 'error');
        if (!/^\S+@\S+\.\S+$/.test(email)) return Swal.fire('Error', 'Enter a valid official email', 'error');

        setSendingEmailOtp(true);
        try {
            await checkOfficialContact('email');
            const res = await otpApi.request(email, 'email', form.fullName || form.username || 'Admin User', 'ADMIN_USER');
            if (!res.success) throw new Error(res.message || 'Failed to send email OTP');
            setEmailOtpSent(true);
            setEmailVerified(false);
            setVerifiedEmailValue('');
            Swal.fire({ icon: 'success', title: 'Email OTP sent', timer: 1300, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to send email OTP', 'error');
        }
        setSendingEmailOtp(false);
    };

    const verifyOfficialEmailOtp = async () => {
        const email = form.email.trim();
        if (!emailOtp.trim()) return Swal.fire('Error', 'Enter email OTP', 'error');

        setVerifyingEmailOtp(true);
        try {
            const res = await otpApi.verify(email, emailOtp.trim(), 'email');
            if (!res.success) throw new Error(res.message || 'Invalid email OTP');
            setEmailVerified(true);
            setVerifiedEmailValue(email);
            setEmailOtpSent(false);
            setEmailOtp('');
            Swal.fire({ icon: 'success', title: 'Email verified', timer: 1300, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Invalid email OTP', 'error');
        }
        setVerifyingEmailOtp(false);
    };

    const sendOfficialMobileOtp = async () => {
        const mobile = form.mobile.trim();
        if (!mobile) return Swal.fire('Error', 'Official Mobile No is required', 'error');

        setSendingMobileOtp(true);
        try {
            await checkOfficialContact('mobile');
            const res = await otpApi.request(mobile, 'phone', form.fullName || form.username || 'Admin User', 'ADMIN_USER');
            if (!res.success) throw new Error(res.message || 'Failed to send WhatsApp OTP');
            setMobileOtpSent(true);
            setMobileVerified(false);
            setVerifiedMobileValue('');
            Swal.fire({ icon: 'success', title: 'WhatsApp OTP sent', timer: 1300, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to send WhatsApp OTP', 'error');
        }
        setSendingMobileOtp(false);
    };

    const verifyOfficialMobileOtp = async () => {
        const mobile = form.mobile.trim();
        if (!mobileOtp.trim()) return Swal.fire('Error', 'Enter mobile OTP', 'error');

        setVerifyingMobileOtp(true);
        try {
            const res = await otpApi.verify(mobile, mobileOtp.trim(), 'phone');
            if (!res.success) throw new Error(res.message || 'Invalid mobile OTP');
            setMobileVerified(true);
            setVerifiedMobileValue(mobile);
            setMobileOtpSent(false);
            setMobileOtp('');
            Swal.fire({ icon: 'success', title: 'Mobile verified', timer: 1300, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Invalid mobile OTP', 'error');
        }
        setVerifyingMobileOtp(false);
    };

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowPwd(false); resetOtpState(); setShowModal(true); };
    const openEdit = (admin) => {
        setForm({ ...EMPTY_FORM, ...admin, password: '' });
        setEditId(admin._id);
        setEmailVerified(Boolean(admin.email));
        setMobileVerified(Boolean(admin.mobile));
        setVerifiedEmailValue(admin.email?.trim() || '');
        setVerifiedMobileValue(admin.mobile?.trim() || '');
        setEmailOtp('');
        setMobileOtp('');
        setEmailOtpSent(false);
        setMobileOtpSent(false);
        setShowPwd(false);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title) return Swal.fire('Error', 'Title is required', 'error');
        if (!form.fullName.trim()) return Swal.fire('Error', 'Full name is required', 'error');
        if (!form.username.trim()) return Swal.fire('Error', 'Username is required', 'error');
        if (!editId && !form.password) return Swal.fire('Error', 'Password is required', 'error');
        if (!form.profileImage) return Swal.fire('Error', 'User Photo is required', 'error');
        if (!form.department) return Swal.fire('Error', 'Department is required', 'error');
        if (!form.designation) return Swal.fire('Error', 'Designation is required', 'error');
        if (!form.email.trim()) return Swal.fire('Error', 'Official Email is required', 'error');
        if (!form.mobile.trim()) return Swal.fire('Error', 'Official Mobile No is required', 'error');
        if (!form.role) return Swal.fire('Error', 'Role is required', 'error');
        if (!form.hodName) return Swal.fire('Error', 'HOD Details missing for this Department', 'error');
        if (!form.reportingToName) return Swal.fire('Error', 'Reporting To missing for this Designation', 'error');

        if (form.email.trim() && (!emailVerified || verifiedEmailValue !== form.email.trim())) {
            return Swal.fire('Error', 'Please verify Official Email via OTP', 'error');
        }
        if (form.mobile.trim() && (!mobileVerified || verifiedMobileValue !== form.mobile.trim())) {
            return Swal.fire('Error', 'Please verify Official Mobile No via WhatsApp OTP', 'error');
        }
        setSaving(true);
        try {
            await checkOfficialContact();
            const payload = buildPayload();
            const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
            if (editId) {
                await api.put(`/api/admin/update/${editId}`, payload, config);
            } else {
                await api.post('/api/admin/create', payload, config);
            }
            Swal.fire({ icon: 'success', title: editId ? 'Updated!' : 'Created!', timer: 1500, showConfirmButton: false });
            setShowModal(false);
            fetchAdmins();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Failed', 'error');
        }
        setSaving(false);
    };

    const handleDelete = async (admin) => {
        const r = await Swal.fire({ title: `Delete ${admin.username}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626' });
        if (!r.isConfirmed) return;
        try {
            await api.delete(`/api/admin/delete/${admin._id}`);
            fetchAdmins();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed', 'error');
        }
    };

    const filtered = admins.filter(a => {
        const matchesSearch = !debouncedSearch ||
            a.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            a.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            a.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            a.mobile?.includes(debouncedSearch);

        const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white shadow-md mt-6 p-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-md text-[#23471d] uppercase tracking-tight">Users Id Management</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Users, roles & contact details</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Filter className="h-3 w-3 text-gray-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="pl-7 pr-6 py-1.5 h-9 bg-white text-[#23471d] text-xs font-bold uppercase tracking-wider rounded-[2px] border border-gray-300 outline-none cursor-pointer hover:bg-gray-50 shadow-sm"
                        >
                            <option value="Active">Active Only</option>
                            <option value="Inactive">Inactive Only</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-3 h-3 text-[#23471d]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-64">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, username, email..."
                            className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-[2px] text-xs outline-none focus:border-[#23471d]" />
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-0 h-9 bg-[#d26019] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#b8521a]">
                        <UserPlus size={13} /> Add User
                    </button>
                </div>
            </div>


            {/* Table */}
            <div className="border border-gray-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#23471d]">
                                    {['#', 'Username', 'Full Name', 'Department', 'Designation', 'Email', 'Mobile', 'Role', 'Status', 'Last Login', 'Updated At', ''].map(h => (
                                        <th key={h} className="py-2.5 px-3 text-[10px] font-black text-white uppercase text-left whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginated.map((admin, i) => (
                                    <tr key={admin._id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                        <td className="py-2 px-3 text-[11px] text-gray-400 font-bold">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                        <td className="py-2 px-3 text-[11px] font-bold text-[#d26019]">{admin.username}</td>
                                        <td className="py-2 px-3 text-[11px] font-bold text-gray-800">{admin.fullName || '—'}</td>
                                        <td className="py-2 px-3 text-[11px] text-gray-600">{admin.department || '—'}</td>
                                        <td className="py-2 px-3 text-[11px] text-gray-600">{admin.designation || '—'}</td>
                                        <td className="py-2 px-3 text-[11px] text-gray-600">{admin.email || '—'}</td>
                                        <td className="py-2 px-3 text-[11px] text-gray-600">{admin.mobile || '—'}</td>
                                        <td className="py-2 px-3">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-black uppercase rounded-full">
                                                {admin.role || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3">
                                            <span className={`flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded-full w-fit ${admin.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {admin.status === 'Active' ? <CheckCircle size={9} /> : <XCircle size={9} />}
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-[10px] text-gray-500">
                                            {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                                        </td>
                                        <td className="py-2 px-3 text-[10px] text-gray-500">
                                            {admin.updatedAt ? new Date(admin.updatedAt).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td className="py-2 px-3">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => openEdit(admin)} className="p-1.5 bg-slate-100 hover:bg-[#23471d] hover:text-white text-slate-600 rounded-[2px] transition-colors">
                                                    <Pencil size={11} />
                                                </button>
                                                <button onClick={() => handleDelete(admin)} className="p-1.5 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 rounded-[2px] transition-colors">
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginated.length === 0 && (
                                    <tr><td colSpan={11} className="py-12 text-center text-[11px] text-slate-400 font-bold uppercase">No users found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-3">
                <Pagination currentPage={currentPage} totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} label="users" />
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl max-h-[96vh] overflow-y-auto rounded-xl border border-gray-200 shadow-xl">

                        {/* ── Header ── */}
                        <div className="bg-[#1e4018] px-5 py-3 flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <UserPlus size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-white leading-tight">
                                        {editId ? 'Edit user' : 'Add new user'}
                                    </p>
                                    <p className="text-[11px] text-white/55">
                                        Fill in the details below to {editId ? 'update the' : 'create a'} user account
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="px-5 pb-5">

                            {/* ── Section: User Details ── */}
                            <div className="mt-4 mb-3 flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md bg-[#eef5ec] flex items-center justify-center">
                                    <BadgeCheck size={13} className="text-[#1e4018]" />
                                </div>
                                <p className="text-[11px] font-semibold text-[#1e4018] uppercase tracking-widest">User details</p>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={lCls}>Title <span className="text-red-500">*</span></label>
                                    <select value={form.title} onChange={e => inp('title', e.target.value)} className={iCls}>
                                        <option value="">Select</option>
                                        <option>Mr.</option>
                                        <option>Mrs.</option>
                                        <option>Miss</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={lCls}>Full name <span className="text-red-500">*</span></label>
                                    <input value={form.fullName} onChange={e => inp('fullName', e.target.value)} className={iCls} placeholder="e.g. John Doe" />
                                </div>
                                <div>
                                    <label className={lCls}>Username <span className="text-red-500">*</span></label>
                                    <input value={form.username} onChange={e => inp('username', e.target.value)} className={iCls} placeholder="e.g. john_doe" />
                                </div>
                                <div>
                                    <label className={lCls}>
                                        Password {!editId && <span className="text-red-500">*</span>}
                                        {editId && <span className="text-gray-400 normal-case font-normal ml-1">(leave blank to keep)</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPwd ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={e => inp('password', e.target.value)}
                                            className={`${iCls} pr-9`}
                                            placeholder={editId ? 'Leave blank to keep current' : 'Enter password'}
                                        />
                                        <button type="button" onClick={() => setShowPwd(p => !p)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lCls}>User Photo <span className="text-red-500">*</span></label>
                                    <label className="w-full flex items-center gap-2 px-2.5 py-1 border border-dashed border-gray-300 rounded-[2px] h-8 bg-gray-50 text-gray-400 text-[10px] cursor-pointer hover:border-[#1e4018] hover:text-[#1e4018] transition-colors">
                                        <Upload size={12} />
                                        {isFile(form.profileImage) ? form.profileImage.name : 'Upload user photo'}
                                        <input type="file" accept="image/*" className="hidden" onChange={e => inp('profileImage', e.target.files?.[0] || '')} />
                                    </label>
                                    {typeof form.profileImage === 'string' && form.profileImage && (
                                        <a href={form.profileImage} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-[10px] font-semibold text-[#1e4018] hover:underline">
                                            View current photo
                                        </a>
                                    )}
                                </div>
                                <div>
                                    <label className={lCls}>Department <span className="text-red-500">*</span></label>
                                    <SearchableDropdown
                                        options={departments.map(dep => ({
                                            label: dep.name,
                                            value: dep.name
                                        }))}
                                        value={form.department}
                                        onChange={handleDepartmentChange}
                                        name="department"
                                        placeholder="Search Department..."
                                    />
                                </div>
                                <div>
                                    <label className={lCls}>Designation <span className="text-red-500">*</span></label>
                                    <SearchableDropdown
                                        options={designations
                                            .filter(des => !form.department || des.department?.name === form.department || des.department === form.department)
                                            .map(des => ({
                                                label: des.name,
                                                value: des.name
                                            }))}
                                        value={form.designation}
                                        onChange={handleDesignationChange}
                                        name="designation"
                                        placeholder="Search Designation..."
                                    />
                                </div>
                                <div>
                                    <label className={lCls}>Official Email <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <input type="email" value={form.email} onChange={e => inp('email', e.target.value)} className={iCls} placeholder="email@example.com" />
                                        <button
                                            type="button"
                                            onClick={sendOfficialEmailOtp}
                                            disabled={sendingEmailOtp || emailVerified || !form.email.trim()}
                                            className="h-9 shrink-0 px-3 rounded-[2px] bg-[#d26019] text-white text-[10px] font-black uppercase disabled:opacity-50"
                                        >
                                            {sendingEmailOtp ? 'Sending' : emailVerified ? 'Verified' : 'OTP'}
                                        </button>
                                    </div>
                                    {emailOtpSent && !emailVerified && (
                                        <div className="mt-2 flex gap-2">
                                            <input value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className={iCls} placeholder="Email OTP" />
                                            <button
                                                type="button"
                                                onClick={verifyOfficialEmailOtp}
                                                disabled={verifyingEmailOtp || emailOtp.length < 4}
                                                className="h-9 shrink-0 px-3 rounded-[2px] bg-[#1e4018] text-white text-[10px] font-black uppercase disabled:opacity-50"
                                            >
                                                {verifyingEmailOtp ? 'Checking' : 'Verify'}
                                            </button>
                                        </div>
                                    )}
                                    {emailVerified && (
                                        <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-green-700">
                                            <CheckCircle size={11} /> Official Email verified
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className={lCls}>Official Mobile No <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <input value={form.mobile} onChange={e => inp('mobile', e.target.value.replace(/\D/g, '').slice(0, 15))} className={iCls} placeholder="10-digit mobile" />
                                        <button
                                            type="button"
                                            onClick={sendOfficialMobileOtp}
                                            disabled={sendingMobileOtp || mobileVerified || !form.mobile.trim()}
                                            className="h-9 shrink-0 px-3 rounded-[2px] bg-[#d26019] text-white text-[10px] font-black uppercase disabled:opacity-50"
                                        >
                                            {sendingMobileOtp ? 'Sending' : mobileVerified ? 'Verified' : 'OTP'}
                                        </button>
                                    </div>
                                    {mobileOtpSent && !mobileVerified && (
                                        <div className="mt-2 flex gap-2">
                                            <input value={mobileOtp} onChange={e => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className={iCls} placeholder="WhatsApp OTP" />
                                            <button
                                                type="button"
                                                onClick={verifyOfficialMobileOtp}
                                                disabled={verifyingMobileOtp || mobileOtp.length < 4}
                                                className="h-9 shrink-0 px-3 rounded-[2px] bg-[#1e4018] text-white text-[10px] font-black uppercase disabled:opacity-50"
                                            >
                                                {verifyingMobileOtp ? 'Checking' : 'Verify'}
                                            </button>
                                        </div>
                                    )}
                                    {mobileVerified && (
                                        <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-green-700">
                                            <CheckCircle size={11} /> Official Mobile No verified
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ── Section: HOD Details ── */}
                            <div className="mt-4 mb-3 flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md bg-[#eef5ec] flex items-center justify-center">
                                    <Users size={13} className="text-[#1e4018]" />
                                </div>
                                <p className="text-[11px] font-semibold text-[#1e4018] uppercase tracking-widest">HOD Details</p>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={lCls}>HOD name <span className="text-red-500">*</span></label>
                                    <input value={form.hodName} readOnly className={`${iCls} h-8 bg-gray-50 cursor-not-allowed`} placeholder="HOD full name" />
                                </div>
                                <div>
                                    <label className={lCls}>HOD mobile no <span className="text-red-500">*</span></label>
                                    <input value={form.hodMobile} readOnly className={`${iCls} bg-gray-50 cursor-not-allowed`} placeholder="HOD mobile no" />
                                </div>
                                <div>
                                    <label className={lCls}>HOD official email <span className="text-red-500">*</span></label>
                                    <input value={form.hodEmail} readOnly className={`${iCls} bg-gray-50 cursor-not-allowed`} placeholder="hod@example.com" />
                                </div>
                                <div>
                                    <label className={lCls}>HOD designation <span className="text-red-500">*</span></label>
                                    <input value={form.hodDesignation} readOnly className={`${iCls} bg-gray-50 cursor-not-allowed`} placeholder="HOD designation" />
                                </div>
                                <div>
                                    <label className={lCls}>HOD Photo <span className="text-red-500">*</span></label>
                                    <div className="flex items-center gap-3 h-8">
                                        {form.hodImage ? (
                                            <div className="w-8 h-8 rounded-full border overflow-hidden shadow-sm">
                                                <img loading="lazy" decoding="async" src={form.hodImage} alt="HOD" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full border bg-gray-100 flex items-center justify-center text-gray-400 text-xs shadow-sm">N/A</div>
                                        )}
                                        <span className="text-[10px] text-gray-400 font-medium">Auto-fetched from HOD's profile</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Section: Reporting To Details ── */}
                            <div className="mt-4 mb-3 flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md bg-[#eef5ec] flex items-center justify-center">
                                    <Users size={13} className="text-[#1e4018]" />
                                </div>
                                <p className="text-[11px] font-semibold text-[#1e4018] uppercase tracking-widest">Reporting To</p>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={lCls}>Reporting Name <span className="text-red-500">*</span></label>
                                    <input value={form.reportingToName} readOnly className={`${iCls} bg-gray-50 cursor-not-allowed`} placeholder="Reporting to name" />
                                </div>
                                <div>
                                    <label className={lCls}>Reporting Mobile <span className="text-red-500">*</span></label>
                                    <input value={form.reportingToMobile} readOnly className={`${iCls} bg-gray-50 cursor-not-allowed`} placeholder="Reporting mobile no" />
                                </div>
                                <div>
                                    <label className={lCls}>Reporting Email <span className="text-red-500">*</span></label>
                                    <input value={form.reportingToEmail} readOnly className={`${iCls} bg-gray-50 cursor-not-allowed`} placeholder="reporting@example.com" />
                                </div>
                                <div>
                                    <label className={lCls}>Reporting Designation <span className="text-red-500">*</span></label>
                                    <input value={form.reportingToDesignation} readOnly className={`${iCls} bg-gray-50 cursor-not-allowed`} placeholder="Reporting designation" />
                                </div>
                                <div>
                                    <label className={lCls}>Reporting Photo <span className="text-red-500">*</span></label>
                                    <div className="flex items-center gap-3 h-8">
                                        {form.reportingToImage ? (
                                            <div className="w-8 h-8 rounded-full border overflow-hidden shadow-sm">
                                                <img loading="lazy" decoding="async" src={form.reportingToImage} alt="Reporting To" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full border bg-gray-100 flex items-center justify-center text-gray-400 text-xs shadow-sm">N/A</div>
                                        )}
                                        <span className="text-[10px] text-gray-400 font-medium">Auto-fetched from profile</span>
                                    </div>
                                </div>
                                <div>
                                    <label className={lCls}>Role <span className="text-red-500">*</span></label>
                                    <select value={form.role} onChange={e => inp('role', e.target.value)} className={iCls}>
                                        <option value="">Select role</option>
                                        {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={lCls}>Status</label>
                                    <div className="flex gap-2 mt-0.5">
                                        {['Active', 'Inactive'].map(s => (
                                            <label key={s}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] cursor-pointer transition-colors ${form.status === s
                                                    ? 'bg-[#eef5ec] border-[#1e4018] text-[#1e4018]'
                                                    : 'border-gray-200 text-gray-500'
                                                    }`}>
                                                <input type="radio" name="status" value={s}
                                                    checked={form.status === s}
                                                    onChange={() => inp('status', s)}
                                                    className="accent-[#1e4018]" />
                                                {s}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Footer ── */}
                            <div className="mt-5 pt-3 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-[11px] text-gray-400">
                                    <span className="text-red-500">*</span> Required fields
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-5 py-2 bg-[#1e4018] hover:bg-[#162e11] text-white text-[12px] font-semibold rounded-lg disabled:opacity-60 transition-colors"
                                    >
                                        <Check size={13} />
                                        {saving ? 'Saving...' : (editId ? 'Update user' : 'Submit')}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
