import { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, Upload, Check, EyeOff, CheckCircle, XCircle, Pencil, Trash2, X, BadgeCheck, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import api, { otpApi } from '../lib/api';
import Pagination from '../components/Pagination';

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
    role: '',
    status: 'Active'
};
const iCls = 'w-full h-9 px-3 border border-gray-500 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]';
const lCls = 'text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1 block';

export default function AdminUser() {
    const [admins, setAdmins] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
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

    useEffect(() => { fetchAdmins(); fetchRoles(); }, []);

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

        if (!isFile(cleaned.hodImage)) {
            if (!editId || typeof cleaned.hodImage !== 'string') delete cleaned.hodImage;
            return cleaned;
        }

        const fd = new FormData();
        Object.entries(cleaned).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'hodImage') {
                fd.append('hodImage', value);
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
        if (!form.username.trim()) return Swal.fire('Error', 'Username is required', 'error');
        if (!editId && !form.password) return Swal.fire('Error', 'Password is required', 'error');
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

    const filtered = admins.filter(a =>
        !search ||
        a.username?.toLowerCase().includes(search.toLowerCase()) ||
        a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.mobile?.includes(search)
    );
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white shadow-md mt-6 p-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#23471d] uppercase tracking-tight">Manage Users</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Admin users, roles & contact details</p>
                </div>
                {/* Search */}
                <div className="relative mb-4 max-w-sm">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, username, email..."
                        className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-[2px] text-xs outline-none focus:border-[#23471d]" />
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[#d26019] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#b8521a]">
                    <UserPlus size={13} /> Add User
                </button>
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
                                    {['#', 'Username', 'Full Name', 'Designation', 'Email', 'Mobile', 'Alt Mobile', 'Role', 'Status', 'Last Login', 'Update By', ''].map(h => (
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
                                        <td className="py-2 px-3 text-[11px] text-gray-600">{admin.designation || '—'}</td>
                                        <td className="py-2 px-3 text-[11px] text-gray-600">{admin.email || '—'}</td>
                                        <td className="py-2 px-3 text-[11px] text-gray-600">{admin.mobile || '—'}</td>
                                        <td className="py-2 px-3 text-[11px] text-gray-600">{admin.altMobile || '—'}</td>
                                        <td className="py-2 px-3">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-black uppercase rounded-full">
                                                {admin.role?.replace(/-/g, ' ') || 'N/A'}
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
                                        <td className="py-2 px-3 text-[11px] text-gray-600">{".." || '—'}</td>
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 shadow-xl">

                        {/* ── Header ── */}
                        <div className="bg-[#1e4018] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
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

                        <div className="px-6 pb-6">

                            {/* ── Section: User Details ── */}
                            <div className="mt-5 mb-4 flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md bg-[#eef5ec] flex items-center justify-center">
                                    <BadgeCheck size={13} className="text-[#1e4018]" />
                                </div>
                                <p className="text-[11px] font-semibold text-[#1e4018] uppercase tracking-widest">User details</p>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={lCls}>Title {!editId && <span className="text-red-500">*</span>}</label>
                                    <select value={form.title} onChange={e => inp('title', e.target.value)} className={iCls}>
                                        <option value="">Select</option>
                                        <option>Mr.</option>
                                        <option>Mrs.</option>
                                        <option>Miss</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={lCls}>Full name</label>
                                    <input value={form.fullName} onChange={e => inp('fullName', e.target.value)} className={iCls} placeholder="e.g. John Doe" />
                                </div>
                                <div>
                                    <label className={lCls}>Username {!editId && <span className="text-red-500">*</span>}</label>
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
                                    <label className={lCls}>Department</label>
                                    <input value={form.department} onChange={e => inp('department', e.target.value)} className={iCls} placeholder="e.g. Marketing" />
                                </div>
                                <div>
                                    <label className={lCls}>Designation</label>
                                    <input value={form.designation} onChange={e => inp('designation', e.target.value)} className={iCls} placeholder="e.g. Sales Manager" />
                                </div>
                                <div>
                                    <label className={lCls}>Official Email</label>
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
                                    <label className={lCls}>Official Mobile No</label>
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
                            <div className="mt-6 mb-4 flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md bg-[#eef5ec] flex items-center justify-center">
                                    <Users size={13} className="text-[#1e4018]" />
                                </div>
                                <p className="text-[11px] font-semibold text-[#1e4018] uppercase tracking-widest">HOD details</p>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={lCls}>HOD name</label>
                                    <input value={form.hodName} onChange={e => inp('hodName', e.target.value)} className={iCls} placeholder="HOD full name" />
                                </div>
                                <div>
                                    <label className={lCls}>HOD mobile no</label>
                                    <input value={form.hodMobile} onChange={e => inp('hodMobile', e.target.value)} className={iCls} placeholder="HOD mobile no" />
                                </div>
                                <div>
                                    <label className={lCls}>HOD official email</label>
                                    <input value={form.hodEmail} onChange={e => inp('hodEmail', e.target.value)} className={iCls} placeholder="hod@example.com" />
                                </div>
                                <div>
                                    <label className={lCls}>HOD designation</label>
                                    <input value={form.hodDesignation} onChange={e => inp('hodDesignation', e.target.value)} className={iCls} placeholder="HOD designation" />
                                </div>
                                <div>
                                    <label className={lCls}>Passport size photo</label>
                                    <label className="w-full flex items-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-[12px] cursor-pointer hover:border-[#1e4018] hover:text-[#1e4018] transition-colors">
                                        <Upload size={13} />
                                        {isFile(form.hodImage) ? form.hodImage.name : 'Click to upload photo'}
                                        <input type="file" accept="image/*" className="hidden" onChange={e => inp('hodImage', e.target.files?.[0] || '')} />
                                    </label>
                                    {typeof form.hodImage === 'string' && form.hodImage && (
                                        <a href={form.hodImage} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-[10px] font-semibold text-[#1e4018] hover:underline">
                                            View current photo
                                        </a>
                                    )}
                                </div>
                                <div>
                                    <label className={lCls}>Role</label>
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
                            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
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
