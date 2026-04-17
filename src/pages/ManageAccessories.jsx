import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Package, Gift, ShoppingCart } from 'lucide-react';
import api from '../lib/api';
import Swal from 'sweetalert2';

const EMPTY = {
    name: '', type: 'complimentary', description: '',
    length: '', width: '', height: '',
    price: '', gstPercent: 18, unit: 'piece',
    category: 'General', includedQty: 1, isActive: true, sortOrder: 0,
};

const iCls = "w-full h-9 px-3 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d]";
const lCls = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block";

export default function ManageAccessories() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('all');

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/stall-accessories/accessories');
            setItems(res.data.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const inp = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
    const openEdit = (item) => {
        setForm({ ...EMPTY, ...item });
        setEditId(item._id);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return Swal.fire('Error', 'Name is required', 'error');
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/api/stall-accessories/accessories/${editId}`, form);
            } else {
                await api.post('/api/stall-accessories/accessories', form);
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
        <div className="p-6 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-base font-black text-[#23471d] uppercase tracking-tight">Stall Accessories & Extras</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Manage complimentary items and purchasable extras for exhibitors</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#23471d] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#1a3516]">
                    <Plus size={13} /> Add Item
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { label: 'Total Items', value: items.length, icon: Package, color: 'text-slate-700' },
                    { label: 'Complimentary', value: items.filter(i => i.type === 'complimentary').length, icon: Gift, color: 'text-emerald-600' },
                    { label: 'Purchasable', value: items.filter(i => i.type === 'purchasable').length, icon: ShoppingCart, color: 'text-[#d26019]' },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-gray-200 px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon size={14} className={s.color} />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                        </div>
                        <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-white border border-gray-200 p-1 w-fit">
                {[['all', 'All'], ['complimentary', 'Complimentary'], ['purchasable', 'Purchasable']].map(([v, l]) => (
                    <button key={v} onClick={() => setTab(v)}
                        className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider ${tab === v ? 'bg-[#23471d] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
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
                                    {['Name', 'Type', 'Category', 'Dimensions', 'Price', 'GST', 'Unit', 'Qty', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="py-2.5 px-4 text-[10px] font-black text-white uppercase text-left whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((item, i) => (
                                    <tr key={item._id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                        <td className="py-2.5 px-4">
                                            <p className="text-xs font-bold text-gray-800">{item.name}</p>
                                            {item.description && <p className="text-[10px] text-gray-400 mt-0.5 max-w-[180px] truncate">{item.description}</p>}
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${item.type === 'complimentary' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                {item.type === 'complimentary' ? 'Free' : 'Paid'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-gray-600">{item.category || '—'}</td>
                                        <td className="py-2.5 px-4 text-xs text-gray-600">
                                            {[item.length, item.width, item.height].filter(Boolean).join(' × ') || '—'}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs font-bold text-gray-800">
                                            {item.type === 'complimentary' ? '—' : `₹${Number(item.price || 0).toLocaleString('en-IN')}`}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-gray-600">{item.type === 'complimentary' ? '—' : `${item.gstPercent}%`}</td>
                                        <td className="py-2.5 px-4 text-xs text-gray-600">{item.unit}</td>
                                        <td className="py-2.5 px-4 text-xs text-gray-600">{item.includedQty}</td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(item)} className="p-1.5 bg-slate-100 hover:bg-[#23471d] hover:text-white text-slate-600 rounded-[2px] transition-colors">
                                                    <Pencil size={12} />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 rounded-[2px] transition-colors">
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-3 bg-[#23471d]">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{editId ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className={lCls}>Item Name *</label>
                                    <input value={form.name} onChange={e => inp('name', e.target.value)} className={iCls} placeholder="e.g. Folding Chair, LED TV, Table" />
                                </div>
                                <div>
                                    <label className={lCls}>Type *</label>
                                    <select value={form.type} onChange={e => inp('type', e.target.value)} className={iCls}>
                                        <option value="complimentary">Complimentary (Free)</option>
                                        <option value="purchasable">Purchasable (Paid)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={lCls}>Category</label>
                                    <input value={form.category} onChange={e => inp('category', e.target.value)} className={iCls} placeholder="Furniture, Electronics, etc." />
                                </div>
                                <div className="col-span-2">
                                    <label className={lCls}>Description</label>
                                    <textarea value={form.description} onChange={e => inp('description', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-[2px] text-xs font-medium outline-none focus:border-[#23471d] resize-none"
                                        rows={2} placeholder="Brief description of the item" />
                                </div>
                            </div>

                            <p className="text-[10px] font-black text-[#23471d] uppercase tracking-wider border-b border-slate-100 pb-1">Dimensions</p>
                            <div className="grid grid-cols-3 gap-4">
                                {[['length', 'Length'], ['width', 'Width'], ['height', 'Height']].map(([k, l]) => (
                                    <div key={k}>
                                        <label className={lCls}>{l}</label>
                                        <input value={form[k]} onChange={e => inp(k, e.target.value)} className={iCls} placeholder="e.g. 2ft" />
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10px] font-black text-[#23471d] uppercase tracking-wider border-b border-slate-100 pb-1">Pricing & Availability</p>
                            <div className="grid grid-cols-2 gap-4">
                                {form.type === 'purchasable' && (
                                    <>
                                        <div>
                                            <label className={lCls}>Price (₹) *</label>
                                            <input type="number" value={form.price} onChange={e => inp('price', e.target.value)} className={iCls} placeholder="0" />
                                        </div>
                                        <div>
                                            <label className={lCls}>GST %</label>
                                            <input type="number" value={form.gstPercent} onChange={e => inp('gstPercent', e.target.value)} className={iCls} />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label className={lCls}>Unit</label>
                                    <select value={form.unit} onChange={e => inp('unit', e.target.value)} className={iCls}>
                                        {['piece', 'set', 'pair', 'sqft', 'meter', 'day'].map(u => <option key={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={lCls}>{form.type === 'complimentary' ? 'Included Qty' : 'Min Order Qty'}</label>
                                    <input type="number" value={form.includedQty} onChange={e => inp('includedQty', e.target.value)} className={iCls} min={1} />
                                </div>
                                <div>
                                    <label className={lCls}>Sort Order</label>
                                    <input type="number" value={form.sortOrder} onChange={e => inp('sortOrder', e.target.value)} className={iCls} />
                                </div>
                                <div>
                                    <label className={lCls}>Status</label>
                                    <select value={form.isActive ? 'true' : 'false'} onChange={e => inp('isActive', e.target.value === 'true')} className={iCls}>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-[11px] font-bold uppercase hover:bg-gray-50">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#23471d] text-white text-[11px] font-black uppercase disabled:opacity-60">
                                    <Save size={12} /> {saving ? 'Saving...' : 'Save Item'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
