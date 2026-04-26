import React, { useState, useEffect } from 'react';
import api, { SERVER_URL } from '../lib/api';
import PageHeader from '../components/PageHeader';
import { Image, Plus, Trash2, Edit2, CheckCircle, Globe, Layout } from 'lucide-react';
import Swal from 'sweetalert2';

const DASHBOARD_PAGES = [
    { id: 'ex-stall', label: 'Exhibitor Stall Mgmt', type: 'exhibitor' },
    { id: 'ex-profile', label: 'Exhibitor Profile', type: 'exhibitor' },
    { id: 'ex-invoices', label: 'Exhibitor Invoices', type: 'exhibitor' },
    { id: 'ex-payments', label: 'Exhibitor Payments', type: 'exhibitor' },
    { id: 'ex-accessories', label: 'Exhibitor Accessories', type: 'exhibitor' },
    { id: 'ex-marketing', label: 'Exhibitor Marketing', type: 'exhibitor' },
    { id: 'ex-bsm', label: 'Exhibitor BSM', type: 'exhibitor' },
    { id: 'ex-calendar', label: 'Exhibitor Calendar', type: 'exhibitor' },
    { id: 'ex-chat', label: 'Exhibitor Chat', type: 'exhibitor' },
    { id: 'ex-msme', label: 'Exhibitor MSME/PSM', type: 'exhibitor' },
    { id: 'ex-events', label: 'Exhibitor Events', type: 'exhibitor' },
    { id: 'ex-docs', label: 'Exhibitor Documents', type: 'exhibitor' },
    { id: 'ex-notifications', label: 'Exhibitor Notifications', type: 'exhibitor' },
    { id: 'ex-rm', label: 'Exhibitor RM Support', type: 'exhibitor' },
    { id: 'ex-reminders', label: 'Exhibitor Pay Reminders', type: 'exhibitor' },
    { id: 'sl-profile', label: 'Seller Profile', type: 'seller' },
    { id: 'sl-payments', label: 'Seller Payments', type: 'seller' },
    { id: 'sl-marketing', label: 'Seller Marketing', type: 'seller' },
    { id: 'sl-stall', label: 'Seller Stall Mgmt', type: 'seller' },
    { id: 'sl-leads', label: 'Seller Leads', type: 'seller' },
    { id: 'sl-bsm', label: 'Seller BSM', type: 'seller' },
    { id: 'sl-calendar', label: 'Seller Calendar', type: 'seller' },
    { id: 'sl-products', label: 'Seller Products', type: 'seller' },
    { id: 'sl-export', label: 'Seller Export Desk', type: 'seller' },
    { id: 'sl-logistics', label: 'Seller Logistics', type: 'seller' },
    { id: 'sl-sponsorship', label: 'Seller Sponsorship', type: 'seller' },
    { id: 'sl-conference', label: 'Seller Conference', type: 'seller' },
    { id: 'sl-reports', label: 'Seller Reports', type: 'seller' },
    { id: 'sl-helpdesk', label: 'Seller Helpdesk', type: 'seller' },
];

export default function BannerManagement() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ pageId: '', title: '', subtitle: '', type: 'exhibitor' });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await api.get('/api/dashboard-banners');
            if (res.data.success) setBanners(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.pageId) return Swal.fire('Error', 'Please select a page', 'error');
        
        setUploading(true);
        const formData = new FormData();
        formData.append('pageId', form.pageId);
        formData.append('title', form.title);
        formData.append('subtitle', form.subtitle);
        formData.append('type', form.type);
        if (selectedFile) formData.append('image', selectedFile);

        try {
            const res = await api.post('/api/dashboard-banners', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                Swal.fire('Success', 'Banner updated successfully', 'success');
                fetchBanners();
                setForm({ pageId: '', title: '', subtitle: '', type: 'exhibitor' });
                setSelectedFile(null);
            }
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to upload', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/dashboard-banners/${id}`);
                Swal.fire('Deleted!', 'Banner has been deleted.', 'success');
                fetchBanners();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete', 'error');
            }
        }
    };

    const editBanner = (b) => {
        setForm({ pageId: b.pageId, title: b.title, subtitle: b.subtitle, type: b.type });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-6">
            <PageHeader title="Dashboard Banners" subtitle="Manage hero section background images for portal pages" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border-4 border-[#23471d] shadow-xl space-y-4">
                        <h3 className="text-lg font-black text-[#23471d] uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Plus size={20} /> Add / Update Banner
                        </h3>
                        
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Target Page</label>
                            <select 
                                value={form.pageId}
                                onChange={(e) => {
                                    const page = DASHBOARD_PAGES.find(p => p.id === e.target.value);
                                    setForm({...form, pageId: e.target.value, type: page?.type || 'exhibitor'});
                                }}
                                className="w-full h-11 px-4 rounded-lg bg-slate-50 border-2 border-slate-100 focus:border-[#d26019] outline-none text-sm font-semibold"
                            >
                                <option value="">Select a Page</option>
                                {DASHBOARD_PAGES.map(p => (
                                    <option key={p.id} value={p.id}>{p.label} ({p.type})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Banner Title (Optional)</label>
                            <input 
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({...form, title: e.target.value})}
                                placeholder="Leave blank to use default"
                                className="w-full h-11 px-4 rounded-lg bg-slate-50 border-2 border-slate-100 focus:border-[#d26019] outline-none text-sm font-semibold"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Banner Subtitle (Optional)</label>
                            <input 
                                type="text"
                                value={form.subtitle}
                                onChange={(e) => setForm({...form, subtitle: e.target.value})}
                                placeholder="Brief description..."
                                className="w-full h-11 px-4 rounded-lg bg-slate-50 border-2 border-slate-100 focus:border-[#d26019] outline-none text-sm font-semibold"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Banner Image</label>
                            <div className="relative group">
                                <input 
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="banner-upload"
                                    accept="image/*"
                                />
                                <label 
                                    htmlFor="banner-upload"
                                    className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#d26019] hover:bg-orange-50 transition-all"
                                >
                                    {selectedFile ? (
                                        <div className="text-center p-4">
                                            <CheckCircle className="text-emerald-500 mx-auto mb-2" size={24} />
                                            <p className="text-[10px] font-bold uppercase text-slate-600 truncate max-w-[150px]">{selectedFile.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Image className="text-slate-300 mb-2" size={32} />
                                            <p className="text-[10px] font-bold uppercase text-slate-400">Click to upload 1920x400px</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <button 
                            disabled={uploading}
                            className="w-full py-4 bg-[#23471d] text-white rounded-lg font-black uppercase tracking-widest text-[11px] shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                        >
                            {uploading ? 'Processing...' : 'Save Banner Settings'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between bg-[#23471d] p-4 rounded-lg text-white">
                        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Layout size={16} /> Configured Banners ({banners.length})
                        </h3>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Loading Banners...</div>
                    ) : banners.length === 0 ? (
                        <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No banners configured yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {banners.map(b => (
                                <div key={b._id} className="bg-white border-2 border-slate-100 rounded-xl overflow-hidden group hover:border-[#23471d] transition-all">
                                    <div className="relative h-32 overflow-hidden">
                                        <img src={`${SERVER_URL}${b.imageUrl}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end">
                                            <span className="inline-block self-start px-2 py-0.5 bg-[#d26019] text-white text-[8px] font-black uppercase rounded mb-1">{b.type}</span>
                                            <h4 className="text-white font-black uppercase text-sm leading-none">{b.title || b.pageId}</h4>
                                        </div>
                                    </div>
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-[#23471d]">{b.pageId}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">{b.subtitle || 'No subtitle'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => editBanner(b)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(b._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
