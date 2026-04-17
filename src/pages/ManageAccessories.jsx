import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Package, Gift, ShoppingCart, Image as ImageIcon, Ruler, RotateCw } from 'lucide-react';
import api, { SERVER_URL } from '../lib/api';
import Swal from 'sweetalert2';

const EMPTY = {
    name: '', type: 'complimentary', itemType: 'Product', description: '',
    length: '', width: '', height: '', dimensionUnit: 'ft',
    price: '', gstPercent: 18, unit: '',
    hsnCode: '', sacCode: '',
    category: 'General', includedQty: 1, availableQty: 0,
    isActive: true, sortOrder: 0,
};

const iCls = "w-full h-9 px-3 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]";
const lCls = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block";

export default function ManageAccessories() {
    const [items, setItems] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('all');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const [accRes, unitRes] = await Promise.all([
                api.get('/api/stall-accessories/accessories'),
                api.get('/api/units')
            ]);
            setItems(accRes.data.data || []);
            setUnits((unitRes.data.data || unitRes.data).filter(u => u.status === 'Active') || []);
        } catch (err) { console.error('Load error:', err); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const inp = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const openAdd = () => {
        setForm(EMPTY);
        setEditId(null);
        setSelectedFile(null);
        setPreviewUrl('');
        setShowForm(true);
    };

    const openEdit = (item) => {
        setForm({ ...EMPTY, ...item });
        setEditId(item._id);
        setSelectedFile(null);
        setPreviewUrl(item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${SERVER_URL}${item.imageUrl}`) : '');
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return Swal.fire('Error', 'Name is required', 'error');
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (v !== null && v !== undefined) fd.append(k, v);
            });
            if (selectedFile) fd.append('image', selectedFile);

            if (editId) {
                await api.put(`/api/stall-accessories/accessories/${editId}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/api/stall-accessories/accessories', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            Swal.fire({ icon: 'success', title: editId ? 'Updated' : 'Added', timer: 1200, showConfirmButton: false });
            setShowForm(false);
            load();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed', 'error');
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        const r = await Swal.fire({ title: 'Delete?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626' });
        if (!r.isConfirmed) return;
        await api.delete(`/api/stall-accessories/accessories/${id}`);
        load();
    };

    const filtered = tab === 'all' ? items : items.filter(i => i.type === tab);

    return (
        <div className="p-6 min-h-screen bg-gray-50 font-inter">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-base font-black text-[#23471d] uppercase tracking-tight">Stall Accessories & Extras</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Manage complimentary items and purchasable extras for exhibitors</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase hover:border-[#23471d] hover:text-[#23471d] transition-all rounded-[2px] shadow-sm group">
                        <RotateCw size={12} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} /> Refresh
                    </button>
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#23471d] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#1a3516] shadow-sm transition-all">
                        <Plus size={13} /> Add Item
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {[
                    { label: 'Total Items', value: items.length, icon: Package, color: 'text-slate-700' },
                    { label: 'Complimentary', value: items.filter(i => i.type === 'complimentary').length, icon: Gift, color: 'text-emerald-600' },
                    { label: 'Purchasable', value: items.filter(i => i.type === 'purchasable').length, icon: ShoppingCart, color: 'text-[#d26019]' },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-gray-200 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon size={14} className={s.color} />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                        </div>
                        <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-white border border-gray-200 p-1 w-fit shadow-sm">
                {[['all', 'All'], ['complimentary', 'Complimentary'], ['purchasable', 'Purchasable']].map(([v, l]) => (
                    <button key={v} onClick={() => setTab(v)}
                        className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${tab === v ? 'bg-[#23471d] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">No items found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#23471d]">
                                    {['Item', 'Type', 'Category', 'Code (HSN/SAC)', 'Dimensions', 'Rate/GST', 'Units', 'Stock', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="py-2.5 px-4 text-[10px] font-black text-white uppercase text-left whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((item, i) => (
                                    <tr key={item._id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded border border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                    {item.imageUrl
                                                        ? <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `${SERVER_URL}${item.imageUrl}`} alt="" className="w-full h-full object-cover" />
                                                        : <Package size={16} className="text-gray-300" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-gray-800 uppercase truncate">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium truncate">{item.itemType || 'Product'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${item.type === 'complimentary' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                {item.type === 'complimentary' ? 'Free' : 'Paid'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-[11px] font-bold text-gray-600 uppercase tracking-tight">{item.category || 'General'}</td>
                                        <td className="py-2.5 px-4">
                                            <p className="text-[10px] font-black text-slate-700">{item.itemType === 'Service' ? (item.sacCode || '—') : (item.hsnCode || '—')}</p>
                                            <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase">{item.itemType === 'Service' ? 'SAC' : 'HSN'}</p>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600">
                                                <Ruler size={11} className="text-gray-400" />
                                                {[item.length, item.width, item.height].filter(Boolean).join('×') || '—'}
                                                {item.dimensionUnit && item.length && <span className="text-[9px] text-gray-400 lowercase ml-0.5">{item.dimensionUnit}</span>}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            {item.type === 'complimentary' ? <span className="text-[10px] font-black text-emerald-600 uppercase">Included</span> : (
                                                <>
                                                    <p className="text-xs font-black text-[#23471d]">₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">GST {item.gstPercent}%</p>
                                                </>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <p className="text-[11px] font-black text-gray-700 uppercase">{item.unit || 'piece'}</p>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <p className="text-xs font-black text-slate-800">{item.availableQty || 0}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Available</p>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.isActive ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(item)} className="p-2 bg-slate-100 hover:bg-[#23471d] hover:text-white text-slate-600 rounded-[2px] shadow-sm transition-all">
                                                    <Pencil size={12} />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="p-2 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 rounded-[2px] shadow-sm transition-all">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-sm">
                        <div className="flex items-center justify-between px-6 py-4 bg-[#23471d] sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded">
                                    <Plus className="text-white" size={18} />
                                </div>
                                <h3 className="text-[13px] font-black text-white uppercase tracking-widest">{editId ? 'Modify Accessory' : 'Create New Accessory'}</h3>
                            </div>
                            <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white transition-colors p-1"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Section 1: Identity & Fulfillment */}
                            <div className="space-y-4">
                                <p className="text-[11px] font-black text-[#23471d] uppercase tracking-widest border-l-4 border-[#23471d] pl-3">Basic Information</p>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* Image Selection */}
                                    <div className="md:col-span-1">
                                        <label className={lCls}>Item Image</label>
                                        <div className="relative aspect-square w-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center group overflow-hidden rounded-sm hover:border-[#23471d]/30 transition-colors">
                                            {previewUrl ? (
                                                <>
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <button type="button" onClick={() => document.getElementById('accImg').click()} className="p-2 bg-white rounded-full text-[#23471d] shadow-lg">
                                                            <ImageIcon size={18} />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <button type="button" onClick={() => document.getElementById('accImg').click()} className="flex flex-col items-center gap-2 text-slate-400 hover:text-[#23471d] transition-colors">
                                                    <ImageIcon size={28} strokeWidth={1.5} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Upload</span>
                                                </button>
                                            )}
                                            <input type="file" id="accImg" hidden accept="image/*" onChange={handleFileChange} />
                                        </div>
                                    </div>

                                    {/* Main Details */}
                                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className={lCls}>Item Name *</label>
                                            <input value={form.name} onChange={e => inp('name', e.target.value)} className={iCls} placeholder="e.g. Premium Leather Sofa" />
                                        </div>
                                        <div>
                                            <label className={lCls}>Fulfillment Type</label>
                                            <select value={form.type} onChange={e => inp('type', e.target.value)} className={iCls}>
                                                <option value="complimentary">Complimentary (Included)</option>
                                                <option value="purchasable">Purchasable (Paid Add-on)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={lCls}>Item Category</label>
                                            <input value={form.category} onChange={e => inp('category', e.target.value)} className={iCls} placeholder="Furniture, Power, etc." />
                                        </div>
                                        <div>
                                            <label className={lCls}>Billing Type</label>
                                            <select value={form.itemType} onChange={e => inp('itemType', e.target.value)} className={iCls}>
                                                <option value="Product">Product</option>
                                                <option value="Service">Service</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={lCls}>{form.itemType === 'Service' ? 'SAC Code' : 'HSN Code'}</label>
                                            {form.itemType === 'Service'
                                                ? <input value={form.sacCode} onChange={e => inp('sacCode', e.target.value)} className={iCls} placeholder="SAC Code" />
                                                : <input value={form.hsnCode} onChange={e => inp('hsnCode', e.target.value)} className={iCls} placeholder="HSN Code" />
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Logistics & Stock */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <p className="text-[11px] font-black text-[#23471d] uppercase tracking-widest border-l-4 border-[#23471d] pl-3">Logistics & Dimensions</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className={lCls}>Dimension Unit</label>
                                            <select value={form.dimensionUnit} onChange={e => inp('dimensionUnit', e.target.value)} className={iCls}>
                                                <option value="">No Dimensions</option>
                                                {units.map(u => <option key={u._id} value={u.unit}>{u.unit}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={lCls}>Length {form.dimensionUnit && `(${form.dimensionUnit})`}</label>
                                            <input value={form.length} onChange={e => inp('length', e.target.value)} className={iCls} disabled={!form.dimensionUnit} />
                                        </div>
                                        <div>
                                            <label className={lCls}>Width {form.dimensionUnit && `(${form.dimensionUnit})`}</label>
                                            <input value={form.width} onChange={e => inp('width', e.target.value)} className={iCls} disabled={!form.dimensionUnit} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className={lCls}>Height {form.dimensionUnit && `(${form.dimensionUnit})`}</label>
                                            <input value={form.height} onChange={e => inp('height', e.target.value)} className={iCls} disabled={!form.dimensionUnit} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[11px] font-black text-[#23471d] uppercase tracking-widest border-l-4 border-[#23471d] pl-3">Pricing & Inventory</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className={lCls}>Quantity Unit *</label>
                                            <select value={form.unit} onChange={e => inp('unit', e.target.value)} className={iCls}>
                                                <option value="">Select Unit</option>
                                                {units.map(u => <option key={u._id} value={u.unit}>{u.unit}</option>)}
                                            </select>
                                        </div>
                                        {form.type === 'purchasable' && (
                                            <>
                                                <div>
                                                    <label className={lCls}>Base Rate (₹)</label>
                                                    <input type="number" value={form.price} onChange={e => inp('price', e.target.value)} className={`${iCls} font-black text-emerald-700`} placeholder="0" />
                                                </div>
                                                <div>
                                                    <label className={lCls}>GST Slab %</label>
                                                    <select value={form.gstPercent} onChange={e => inp('gstPercent', Number(e.target.value))} className={iCls}>
                                                        {[0, 5, 12, 18, 28].map(v => <option key={v} value={v}>{v}%</option>)}
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <label className={lCls}>{form.type === 'complimentary' ? 'Included Qty' : 'Min Order Qty'}</label>
                                            <input type="number" value={form.includedQty} onChange={e => inp('includedQty', e.target.value)} className={iCls} min={1} />
                                        </div>
                                        <div>
                                            <label className={lCls}>Available Stock</label>
                                            <input type="number" value={form.availableQty} onChange={e => inp('availableQty', e.target.value)} className={iCls} placeholder="0" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Extra Info */}
                            <div className="space-y-4">
                                <p className="text-[11px] font-black text-[#23471d] uppercase tracking-widest border-l-4 border-[#23471d] pl-3">Additional Settings</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className={lCls}>Short Description</label>
                                        <textarea value={form.description} onChange={e => inp('description', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d] resize-none h-20"
                                            placeholder="Specify materials, colors, or service scope..." />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={lCls}>Sort Order</label>
                                            <input type="number" value={form.sortOrder} onChange={e => inp('sortOrder', e.target.value)} className={iCls} placeholder="0" />
                                        </div>
                                        <div>
                                            <label className={lCls}>Status</label>
                                            <select value={form.isActive ? 'true' : 'false'} onChange={e => inp('isActive', e.target.value === 'true')} className={iCls}>
                                                <option value="true">Active</option>
                                                <option value="false">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-slate-300 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                                <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-2 bg-[#23471d] text-white text-[11px] font-black uppercase tracking-widest disabled:opacity-60 shadow-lg hover:shadow-xl transition-all">
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save Item'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
