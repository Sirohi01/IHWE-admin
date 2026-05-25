import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Package, RotateCw, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import api, { SERVER_URL } from '../../lib/api';
import Swal from 'sweetalert2';

const EMPTY = {
    title: '',
    subtitle: '',
    price: '',
    gstText: '+18% GST',
    features: [''],
    backgroundImage: '',
    buttonText: 'CHOOSE PACKAGE',
    badgeText: '',
    borderColor: '',
    textColor: '',
    priceColor: '',
    isActive: true,
    order: 0
};

const iCls = "w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-xs font-medium";
const lCls = "block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest";

export default function EPromotionPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/e-promotion-packages/packages?page=${currentPage}&limit=${itemsPerPage}`);
            if (res.data.success) {
                setPackages(res.data.data || []);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.totalPages);
                    setTotalItems(res.data.pagination.total);
                }
            }
        } catch (err) {
            console.error('Load error:', err);
            Swal.fire('Error', 'Failed to load packages', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [currentPage]);

    const inp = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...form.features];
        newFeatures[index] = value;
        setForm(p => ({ ...p, features: newFeatures }));
    };

    const addFeature = () => {
        setForm(p => ({ ...p, features: [...p.features, ''] }));
    };

    const removeFeature = (index) => {
        const newFeatures = form.features.filter((_, i) => i !== index);
        setForm(p => ({ ...p, features: newFeatures }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!form.title.trim()) return Swal.fire('Error', 'Title is required', 'error');
        if (!form.price) return Swal.fire('Error', 'Price is required', 'error');

        const cleanFeatures = form.features.filter(f => f.trim() !== '');

        setSaving(true);
        try {
            const payload = { ...form, features: cleanFeatures };
            if (editId) {
                await api.put(`/api/e-promotion-packages/packages/${editId}`, payload);
            } else {
                await api.post('/api/e-promotion-packages/packages', payload);
            }
            Swal.fire({ icon: 'success', title: editId ? 'Updated' : 'Added', timer: 1200, showConfirmButton: false });
            resetForm();
            load();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to save', 'error');
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        const r = await Swal.fire({
            title: 'Delete Package?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Yes, delete it!'
        });
        if (!r.isConfirmed) return;
        try {
            await api.delete(`/api/e-promotion-packages/packages/${id}`);
            load();
            Swal.fire('Deleted!', 'Package has been deleted.', 'success');
        } catch (err) {
            Swal.fire('Error', 'Failed to delete', 'error');
        }
    };

    const startEdit = (pkg) => {
        setForm({ ...EMPTY, ...pkg });
        setEditId(pkg._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setForm(EMPTY);
        setEditId(null);
    };

    return (
        <div className="p-6 min-h-screen bg-[#f8f9fa] font-inter">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 mt-6">
                <div>
                    <h1 className="text-2xl font-black text-[#23471d] uppercase tracking-tight">E-Promotion Packages</h1>
                    <p className="text-xs text-gray-400 mt-1">Configure and manage promotional tiers for the IHWE platform</p>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold uppercase hover:border-[#23471d] hover:text-[#23471d] transition-all rounded-lg shadow-sm group">
                    <RotateCw size={14} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} /> Refresh
                </button>
            </div>

            {/* FORM AT TOP */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
                <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${editId ? 'bg-orange-50' : 'bg-green-50'}`}>
                    <h2 className="text-sm font-bold flex items-center gap-2 text-gray-800 uppercase tracking-tight">
                        {editId ? <Pencil className="w-4 h-4 text-orange-600" /> : <Plus className="w-4 h-4 text-green-600" />}
                        {editId ? 'Update Package Details' : 'Create New Promotional Package'}
                    </h2>
                    {editId && (
                        <button onClick={resetForm} className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 flex items-center gap-1.5 px-3 py-1 bg-white border border-orange-100 rounded-lg shadow-sm">
                            <X className="w-3.5 h-3.5" /> Cancel Edit
                        </button>
                    )}
                </div>

                <div className="p-8">
                    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Column 1: Identity */}
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-[#23471d] uppercase tracking-widest border-l-4 border-[#23471d] pl-3">Package Identity</p>
                            <div>
                                <label className={lCls}>Package Title *</label>
                                <input value={form.title} onChange={e => inp('title', e.target.value)} className={iCls} placeholder="e.g. STARTER VISIBILITY" />
                            </div>
                            <div>
                                <label className={lCls}>Subtitle / Tagline</label>
                                <input value={form.subtitle} onChange={e => inp('subtitle', e.target.value)} className={iCls} placeholder="Build presence online" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lCls}>Price (₹) *</label>
                                    <input type="number" value={form.price} onChange={e => inp('price', e.target.value)} className={iCls} />
                                </div>
                                <div>
                                    <label className={lCls}>GST Text</label>
                                    <input value={form.gstText} onChange={e => inp('gstText', e.target.value)} className={iCls} />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Content & Styling */}
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-[#23471d] uppercase tracking-widest border-l-4 border-[#23471d] pl-3">Features & Layout</p>
                            <div>
                                <label className={lCls}>Features List</label>
                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border border-gray-100 p-3 bg-gray-50/50 rounded-lg">
                                    {form.features.map((feature, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                value={feature}
                                                onChange={e => handleFeatureChange(idx, e.target.value)}
                                                className="w-full h-8 px-3 bg-white border border-gray-200 rounded-md text-[11px] font-medium outline-none focus:ring-1 focus:ring-green-500"
                                                placeholder={`Feature ${idx + 1}`}
                                            />
                                            <button type="button" onClick={() => removeFeature(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addFeature} className="w-full py-1.5 border border-dashed border-gray-300 text-[10px] font-bold text-gray-500 uppercase hover:bg-white hover:border-green-500 hover:text-green-600 transition-all rounded-md">
                                        + Add New Feature
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Appearance & Actions */}
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-[#23471d] uppercase tracking-widest border-l-4 border-[#23471d] pl-3">Styling & Config</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lCls}>Display Order</label>
                                    <input type="number" value={form.order} onChange={e => inp('order', e.target.value)} className={iCls} />
                                </div>
                                <div>
                                    <label className={lCls}>Status</label>
                                    <select value={form.isActive ? 'true' : 'false'} onChange={e => inp('isActive', e.target.value === 'true')} className={iCls}>
                                        <option value="true">Active</option>
                                        <option value="false">Hidden</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lCls}>Badge Text</label>
                                    <input value={form.badgeText} onChange={e => inp('badgeText', e.target.value)} className={iCls} placeholder="MOST POPULAR" />
                                </div>
                                <div>
                                    <label className={lCls}>Border Color</label>
                                    <input value={form.borderColor} onChange={e => inp('borderColor', e.target.value)} className={iCls} placeholder="#e8a415" />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`w-full py-3 rounded-lg text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all flex items-center justify-center gap-3 ${editId ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100' : 'bg-green-700 hover:bg-green-800 shadow-green-100'} disabled:opacity-50`}
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>{editId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editId ? 'Save Changes' : 'Create Package'}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* TABLE BELOW */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Promotional Tiers ({totalItems})</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/30 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">Order</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Package Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Features</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Packages...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : packages.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="w-10 h-10 text-gray-200" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Packages Configured</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : packages.map((pkg) => (
                                <tr key={pkg._id} className="group hover:bg-green-50/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-gray-300 group-hover:text-green-700 transition-colors">#{pkg.order}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                {pkg.backgroundImage ? (
                                                    <img src={pkg.backgroundImage.startsWith('http') || pkg.backgroundImage.startsWith('/') ? pkg.backgroundImage : `${SERVER_URL}${pkg.backgroundImage}`} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <ImageIcon className="w-4 h-4 text-gray-300" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 uppercase leading-none">{pkg.title}</p>
                                                <p className="text-[10px] text-gray-400 font-bold mt-1 truncate max-w-[200px]">{pkg.subtitle}</p>
                                                {pkg.badgeText && <span className="inline-block mt-1.5 px-2 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black uppercase rounded-sm tracking-tighter">{pkg.badgeText}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-[#23471d]">₹{Number(pkg.price || 0).toLocaleString('en-IN')}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">{pkg.gstText}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-[10px] font-black">{pkg.features?.length || 0}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Included Perks</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {pkg.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => startEdit(pkg)} className="p-2 bg-gray-100 hover:bg-[#23471d] hover:text-white text-gray-500 rounded-lg transition-all shadow-sm">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(pkg._id)} className="p-2 bg-gray-100 hover:bg-red-600 hover:text-white text-gray-500 rounded-lg transition-all shadow-sm">
                                                <Trash2 size={14} />
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
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-gray-800">{totalItems}</span> tiers
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-white hover:text-green-700 disabled:opacity-20 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#23471d] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#23471d] hover:text-[#23471d]'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-white hover:text-green-700 disabled:opacity-20 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
