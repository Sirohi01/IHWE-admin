import { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, EyeOff, CheckCircle, XCircle, Pencil, Trash2, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';
import Pagination from '../components/Pagination';

const EMPTY_FORM = { username: '', password: '', fullName: '', designation: '', email: '', mobile: '', altMobile: '', role: '', status: 'Active' };
const iCls = 'w-full h-9 px-3 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]';
const lCls = 'text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block';

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

    const inp = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowPwd(false); setShowModal(true); };
    const openEdit = (admin) => {
        setForm({ ...EMPTY_FORM, ...admin, password: '' });
        setEditId(admin._id);
        setShowPwd(false);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.username.trim()) return Swal.fire('Error', 'Username is required', 'error');
        if (!editId && !form.password) return Swal.fire('Error', 'Password is required', 'error');
        setSaving(true);
        try {
            const payload = { ...form };
            if (!payload.password) delete payload.password; // don't send empty password on edit
            if (editId) {
                await api.put(`/api/admin/update/${editId}`, payload);
            } else {
                await api.post('/api/admin/create', payload);
            }
            Swal.fire({ icon: 'success', title: editId ? 'Updated!' : 'Created!', timer: 1500, showConfirmButton: false });
            setShowModal(false);
            fetchAdmins();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed', 'error');
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
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[#d26019] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#b8521a]">
                    <UserPlus size={13} /> Add User
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-4 max-w-sm">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, username, email..."
                    className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-[2px] text-xs outline-none focus:border-[#23471d]" />
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
                                    {['#', 'Username', 'Full Name', 'Designation', 'Email', 'Mobile', 'Alt Mobile', 'Role', 'Status', 'Last Login', ''].map(h => (
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
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-3 bg-[#23471d] sticky top-0">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">
                                {editId ? 'Edit User' : 'Add New User'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lCls}>Username {!editId && <span className="text-red-500">*</span>}</label>
                                    <input value={form.username} onChange={e => inp('username', e.target.value)} className={iCls} placeholder="e.g. john_doe" />
                                </div>
                                <div>
                                    <label className={lCls}>Password {!editId && <span className="text-red-500">*</span>} {editId && <span className="text-gray-400 normal-case font-normal">(leave blank to keep)</span>}</label>
                                    <div className="relative">
                                        <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => inp('password', e.target.value)}
                                            className={`${iCls} pr-9`} placeholder={editId ? 'Leave blank to keep current' : 'Enter password'} />
                                        <button type="button" onClick={() => setShowPwd(p => !p)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lCls}>Full Name</label>
                                    <input value={form.fullName} onChange={e => inp('fullName', e.target.value)} className={iCls} placeholder="e.g. John Doe" />
                                </div>
                                <div>
                                    <label className={lCls}>Designation</label>
                                    <input value={form.designation} onChange={e => inp('designation', e.target.value)} className={iCls} placeholder="e.g. Sales Manager" />
                                </div>
                                <div>
                                    <label className={lCls}>Email</label>
                                    <input type="email" value={form.email} onChange={e => inp('email', e.target.value)} className={iCls} placeholder="email@example.com" />
                                </div>
                                <div>
                                    <label className={lCls}>Mobile No.</label>
                                    <input value={form.mobile} onChange={e => inp('mobile', e.target.value)} className={iCls} placeholder="10-digit mobile" />
                                </div>
                                <div>
                                    <label className={lCls}>Alternative Mobile</label>
                                    <input value={form.altMobile} onChange={e => inp('altMobile', e.target.value)} className={iCls} placeholder="Alternative number" />
                                </div>
                                <div>
                                    <label className={lCls}>Role</label>
                                    <select value={form.role} onChange={e => inp('role', e.target.value)} className={iCls}>
                                        <option value="">Select Role</option>
                                        {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={lCls}>Status</label>
                                    <select value={form.status} onChange={e => inp('status', e.target.value)} className={iCls}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-[11px] font-bold uppercase hover:bg-gray-50">Cancel</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2 bg-[#23471d] text-white text-[11px] font-black uppercase disabled:opacity-60 hover:bg-[#1a3516]">
                                    <Save size={12} /> {saving ? 'Saving...' : (editId ? 'Update User' : 'Create User')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
