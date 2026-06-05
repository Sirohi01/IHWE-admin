import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Quote, RotateCw, ChevronLeft, ChevronRight, User, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import Swal from 'sweetalert2';

const EMPTY = {
    text: '',
    name: '',
    designation: '',
    isActive: true,
    order: 0
};

const iCls = "w-full h-11 px-4 bg-gray-50/50 border border-gray-200 rounded-md focus:bg-white focus:ring-4 focus:ring-[#23471d]/10 focus:border-[#23471d] outline-none transition-all text-sm font-medium text-gray-700";
const tCls = "w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-md focus:bg-white focus:ring-4 focus:ring-[#23471d]/10 focus:border-[#23471d] outline-none transition-all text-sm font-medium text-gray-700 min-h-[120px] resize-none";
const lCls = "block text-[11px] font-bold text-gray-500 uppercase mb-2 tracking-widest";

export default function BSMTestimonial() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/bsm-testimonials/testimonials?page=${currentPage}&limit=${itemsPerPage}&admin=true`);
            if (res.data.success) {
                setTestimonials(res.data.data || []);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.totalPages);
                    setTotalItems(res.data.pagination.total);
                }
            }
        } catch (err) {
            console.error('Load error:', err);
            Swal.fire('Error', 'Failed to load testimonials', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [currentPage]);

    const inp = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!form.text.trim()) return Swal.fire('Error', 'Testimonial text is required', 'error');
        if (!form.name.trim()) return Swal.fire('Error', 'Name is required', 'error');
        if (!form.designation.trim()) return Swal.fire('Error', 'Designation/Company is required', 'error');

        setSaving(true);
        try {
            if (editId) {
                await api.put(`/api/bsm-testimonials/testimonials/${editId}`, form);
            } else {
                await api.post('/api/bsm-testimonials/testimonials', form);
            }
            Swal.fire({ icon: 'success', title: editId ? 'Updated' : 'Added', timer: 1200, showConfirmButton: false });
            closeModal();
            load();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to save', 'error');
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        const r = await Swal.fire({
            title: 'Delete Testimonial?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Yes, delete it!'
        });
        if (!r.isConfirmed) return;
        try {
            await api.delete(`/api/bsm-testimonials/testimonials/${id}`);
            load();
            Swal.fire('Deleted!', 'Testimonial has been deleted.', 'success');
        } catch (err) {
            Swal.fire('Error', 'Failed to delete', 'error');
        }
    };

    const startEdit = (pkg) => {
        setForm({ ...EMPTY, ...pkg });
        setEditId(pkg._id);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setForm(EMPTY);
        setEditId(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setForm(EMPTY);
            setEditId(null);
        }, 300); // delay to allow animation
    };

    return (
        <div className=" min-h-screen bg-[#f4f7f4] font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white px-6 py-2 pb-4 border border-gray-100">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">BSM <span className="text-[#23471d]">Testimonials</span></h1>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">Manage participant quotes and feedback for the Buyer–Seller Meet.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={load}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-bold rounded hover:bg-gray-100 transition-all shadow-sm group"
                    >
                        <RotateCw size={14} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-[#23471d]/20 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={18} /> Add New Quote
                    </button>
                </div>
            </div>

            {/* TABLE BELOW */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden m-6">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                        <Quote className="w-4 h-4 text-[#23471d]" />
                        Testimonials List <span className="text-gray-400 font-medium text-xs ml-2">({totalItems} Total)</span>
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">Order</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Participant Details</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-md">Quote</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-[#23471d]/20 border-t-[#23471d] rounded-full animate-spin" />
                                            <span className="text-xs font-black text-[#23471d] uppercase tracking-widest">Fetching Testimonials...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : testimonials.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                                <Quote className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <span className="text-sm font-black text-gray-800 uppercase tracking-widest">No Testimonials Found</span>
                                            <p className="text-xs text-gray-400 font-medium">Click on "Add New Quote" to create your first testimonial.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : testimonials.map((t) => (
                                <tr key={t._id} className="group hover:bg-[#23471d]/[0.02] transition-colors">
                                    <td className="px-8 py-6 align-top">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-[#23471d] group-hover:text-white transition-colors">
                                            {t.order}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#23471d]/20 to-[#23471d]/5 flex items-center justify-center shrink-0">
                                                <User className="w-5 h-5 text-[#23471d]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 leading-tight">{t.name}</p>
                                                <p className="text-xs font-semibold text-gray-500 mt-1">{t.designation}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 align-top">
                                        <div className="relative">
                                            <Quote className="absolute -left-2 -top-1.5 w-6 h-6 text-gray-100 rotate-180 -z-10" />
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium max-w-lg z-10 relative">"{t.text}"</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 align-top">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${t.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {t.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 align-top">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => startEdit(t)} className="p-2.5 bg-gray-50 hover:bg-[#23471d] hover:text-white text-gray-500 rounded-xl transition-all shadow-sm border border-gray-200 hover:border-transparent">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(t._id)} className="p-2.5 bg-gray-50 hover:bg-red-600 hover:text-white text-gray-500 rounded-xl transition-all shadow-sm border border-gray-200 hover:border-transparent">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-gray-900">{totalItems}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all ${currentPage === i + 1 ? 'bg-[#23471d] text-white shadow-lg shadow-[#23471d]/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#23471d] hover:text-[#23471d]'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-slideUp">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-lg font-black flex items-center gap-3 text-gray-900 tracking-tight">
                                <div className={`p-2 rounded-xl ${editId ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-[#23471d]'}`}>
                                    {editId ? <Pencil className="w-5 h-5" /> : <Quote className="w-5 h-5" />}
                                </div>
                                {editId ? 'Edit Testimonial' : 'Add New Participant Quote'}
                            </h2>
                            <button onClick={closeModal} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="px-8 py-4">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label className={lCls}>Testimonial Text *</label>
                                    <textarea
                                        value={form.text}
                                        onChange={e => inp('text', e.target.value)}
                                        className={tCls}
                                        placeholder="Enter the participant's quote here..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={lCls}>Author Name *</label>
                                        <input
                                            value={form.name}
                                            onChange={e => inp('name', e.target.value)}
                                            className={iCls}
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className={lCls}>Designation/Company *</label>
                                        <input
                                            value={form.designation}
                                            onChange={e => inp('designation', e.target.value)}
                                            className={iCls}
                                            placeholder="e.g. CEO, Global Trade"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={lCls}>Display Order</label>
                                        <input type="number" value={form.order} onChange={e => inp('order', e.target.value)} className={iCls} />
                                    </div>
                                    <div>
                                        <label className={lCls}>Status</label>
                                        <div className="relative">
                                            <select value={form.isActive ? 'true' : 'false'} onChange={e => inp('isActive', e.target.value === 'true')} className={`${iCls} appearance-none pr-10`}>
                                                <option value="true">Active (Visible)</option>
                                                <option value="false">Hidden</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-200 flex gap-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex py-1 px-6 rounded-sm text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all text-[13px] font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`flex py-1 px-6 rounded-sm text-white tracking-widest text-[13px] font-medium shadow-xl transition-all flex items-center justify-center gap-3 ${editId ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20' : 'bg-[#23471d] hover:bg-[#1a3516] shadow-[#23471d]/20'} disabled:opacity-50 disabled:hover:translate-y-0 hover:-translate-y-0.5`}
                                    >
                                        {saving ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>{editId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editId ? 'Save Changes' : 'Publish Quote'}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}