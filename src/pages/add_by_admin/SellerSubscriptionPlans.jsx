import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../../lib/api";
import { Plus, Trash2, Edit, Save, X, Package, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const EMPTY_FORM = {
    name: '', price: '', currency: 'INR', durationDays: '365',
    description: '', status: 'active', displayOrder: '0',
    maxLeads: '0', maxExportInquiries: '0', maxServiceRequests: '0',
    features: [], imageUrl: ''
};

const SellerSubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [availableFeatures, setAvailableFeatures] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => { fetchPlans(); fetchFeatures(); }, []);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const r = await api.get('/api/seller-subscription-plans');
            if (r.data.success) setPlans(r.data.data);
        } catch { Swal.fire('Error', 'Failed to fetch plans', 'error'); }
        finally { setIsLoading(false); }
    };

    const fetchFeatures = async () => {
        try {
            const r = await api.get('/api/seller-subscription-plans/features');
            if (r.data.success) setAvailableFeatures(r.data.data);
        } catch {}
    };

    const handleFeatureToggle = (featureKey) => {
        const cur = form.features || [];
        const exists = cur.find(f => f.key === featureKey);
        if (exists) {
            setForm({ ...form, features: cur.filter(f => f.key !== featureKey) });
        } else {
            const def = availableFeatures.find(f => f.key === featureKey);
            setForm({ ...form, features: [...cur, { key: featureKey, label: def?.label || featureKey, enabled: true }] });
        }
    };

    const isFeatureSelected = (k) => form.features?.some(f => f.key === k) || false;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price) {
            Swal.fire('Warning', 'Plan name and price are required!', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            // If image selected, upload via FormData
            let imageUrl = form.imageUrl;
            if (imageFile) {
                const fd = new FormData();
                fd.append('image', imageFile);
                fd.append('name', form.name);
                const uploadRes = await api.post('/api/seller-subscription-plans/upload-image', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data.success) imageUrl = uploadRes.data.imageUrl;
            }

            const payload = {
                ...form,
                imageUrl,
                price: parseFloat(form.price),
                durationDays: parseInt(form.durationDays),
                displayOrder: parseInt(form.displayOrder),
                maxLeads: parseInt(form.maxLeads),
                maxExportInquiries: parseInt(form.maxExportInquiries),
                maxServiceRequests: parseInt(form.maxServiceRequests),
            };

            const r = isEditing
                ? await api.put(`/api/seller-subscription-plans/${isEditing}`, payload)
                : await api.post('/api/seller-subscription-plans', payload);

            if (r.data.success) {
                Swal.fire({ icon: 'success', title: isEditing ? 'Updated!' : 'Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchPlans();
            }
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to save plan', 'error');
        } finally { setIsLoading(false); }
    };

    const handleDelete = async (id) => {
        const r = await Swal.fire({ title: 'Delete Plan?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete!' });
        if (!r.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/seller-subscription-plans/${id}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchPlans();
        } catch { Swal.fire('Error', 'Failed to delete', 'error'); }
        finally { setIsLoading(false); }
    };

    const startEdit = (plan) => {
        setIsEditing(plan._id);
        setForm({
            name: plan.name, price: plan.price.toString(), currency: plan.currency || 'INR',
            durationDays: plan.durationDays?.toString() || '365', description: plan.description || '',
            status: plan.status || 'active', displayOrder: plan.displayOrder?.toString() || '0',
            maxLeads: plan.maxLeads?.toString() || '0', maxExportInquiries: plan.maxExportInquiries?.toString() || '0',
            maxServiceRequests: plan.maxServiceRequests?.toString() || '0', features: plan.features || [],
            imageUrl: plan.imageUrl || ''
        });
        setImagePreview(plan.imageUrl ? (plan.imageUrl.startsWith('http') ? plan.imageUrl : `${SERVER_URL}${plan.imageUrl}`) : null);
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => { setIsEditing(null); setForm({ ...EMPTY_FORM }); setImageFile(null); setImagePreview(null); };
    const fmt = (price, currency) => currency === 'INR' ? `₹ ${price.toLocaleString()}` : `${currency} ${price.toLocaleString()}`;

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader title="SELLER SUBSCRIPTION PLANS" description="Manage subscription plans for seller portal access" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* FORM */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                            {isEditing ? 'Edit Plan' : 'Add New Plan'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm" placeholder="e.g. Standard, Premium" />
                            </div>

                            {/* Plan Image */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded hover:border-[#23471d] transition-colors relative cursor-pointer group">
                                    <input type="file" accept="image/*" onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                                <ImageIcon className="text-white w-6 h-6" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center py-6 text-gray-400">
                                            <ImageIcon className="w-8 h-8 mb-1" />
                                            <span className="text-xs font-medium">Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                                {form.imageUrl && !imageFile && (
                                    <p className="text-[10px] text-gray-400 mt-1">Current image saved. Upload new to replace.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price *</label>
                                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm" placeholder="9999" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Currency</label>
                                    <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm">
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Days)</label>
                                    <input type="number" value={form.durationDays} onChange={e => setForm({ ...form, durationDays: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm" placeholder="365" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Order</label>
                                    <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm" placeholder="0" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm h-16" placeholder="Plan description..." />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[['maxLeads','Max Leads'],['maxExportInquiries','Max Inquiries'],['maxServiceRequests','Max Services']].map(([k,l]) => (
                                    <div key={k}>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{l}</label>
                                        <input type="number" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm" placeholder="0=∞" />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Plan Features</label>
                                <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto border border-gray-200 p-3 rounded bg-slate-50">
                                    {availableFeatures.map(f => (
                                        <label key={f.key} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded">
                                            <input type="checkbox" checked={isFeatureSelected(f.key)} onChange={() => handleFeatureToggle(f.key)}
                                                className="w-4 h-4 accent-[#23471d]" />
                                            <span className="text-xs font-medium text-gray-700">{f.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button onClick={handleSubmit} disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider text-xs">
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : isEditing ? <><Save className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Plan</>}
                                </button>
                                {isEditing && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 text-xs uppercase">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-wide text-sm">
                                <Package className="w-4 h-4" /> Subscription Plans
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">{plans.length} PLANS</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase">Plan</th>
                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase">Price</th>
                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase">Duration</th>
                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase">Features</th>
                                        <th className="text-center py-3 px-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="text-center py-3 px-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-gray-400 italic text-xs">No plans found. Add your first subscription plan!</td></tr>
                                    ) : plans.map(plan => (
                                        <tr key={plan._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    {plan.imageUrl && (
                                                        <img src={plan.imageUrl.startsWith('http') ? plan.imageUrl : `${SERVER_URL}${plan.imageUrl}`}
                                                            alt={plan.name} className="w-8 h-8 object-cover rounded border border-gray-200" />
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-[#23471d] text-sm uppercase">{plan.name}</p>
                                                        {plan.description && <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{plan.description}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3"><span className="font-bold text-[#d26019]">{fmt(plan.price, plan.currency)}</span></td>
                                            <td className="py-3 px-3"><span className="text-gray-600 text-xs">{plan.durationDays}d</span></td>
                                            <td className="py-3 px-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {plan.features?.slice(0, 2).map((f, i) => (
                                                        <span key={i} className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-medium">{f.label}</span>
                                                    ))}
                                                    {plan.features?.length > 2 && <span className="bg-[#d26019] text-white text-[9px] px-1.5 py-0.5 rounded font-medium">+{plan.features.length - 2}</span>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {plan.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => startEdit(plan)} className="text-blue-500 hover:text-blue-700 p-1.5 border border-blue-100 rounded bg-blue-50"><Edit size={13} /></button>
                                                    <button onClick={() => handleDelete(plan._id)} className="text-red-500 hover:text-red-700 p-1.5 border border-red-100 rounded bg-red-50"><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerSubscriptionPlans;
