import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Check, X, Camera, Users } from 'lucide-react';
import { SERVER_URL } from "../../lib/api";
import { toast } from 'react-toastify';
import PageHeader from "../../components/PageHeader";

const ExpertInsightsManage = () => {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        organization: '',
        insight: '',
        linkedArticleSlug: '',
        isActive: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchExperts();
    }, []);

    const fetchExperts = async () => {
        try {
            const res = await axios.get(`${SERVER_URL}/api/blogs/expert-insights`);
            if (res.data.success) setExperts(res.data.data);
        } catch (error) {
            console.error('Error fetching experts:', error);
            toast.error('Failed to fetch experts');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (expert) => {
        setEditingItem(expert);
        setFormData({
            name: expert.name,
            role: expert.role,
            organization: expert.organization || '',
            insight: expert.insight,
            linkedArticleSlug: expert.linkedArticleSlug || '',
            isActive: expert.isActive
        });
        setPreviewUrl(`${SERVER_URL}${expert.image}`);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expert insight?')) return;
        try {
            const res = await axios.delete(`${SERVER_URL}/api/blogs/experts/${id}`);
            if (res.data.success) {
                toast.success('Expert deleted successfully');
                fetchExperts();
            }
        } catch (error) {
            toast.error('Failed to delete expert');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imageFile) data.append('image', imageFile);

        try {
            let res;
            if (editingItem) {
                res = await axios.patch(`${SERVER_URL}/api/blogs/experts/${editingItem._id}`, data);
            } else {
                res = await axios.post(`${SERVER_URL}/api/blogs/experts`, data);
            }

            if (res.data.success) {
                toast.success(editingItem ? 'Expert updated' : 'Expert added');
                setShowModal(false);
                resetForm();
                fetchExperts();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save expert');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            organization: '',
            insight: '',
            linkedArticleSlug: '',
            isActive: true
        });
        setEditingItem(null);
        setImageFile(null);
        setPreviewUrl('');
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen">
            {/* Hero Banner */}
            <div className="relative w-full h-64 overflow-hidden rounded-b-xl pt-2">
                <img
                    src="/bann.png"
                    alt="Expert Insights Banner"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
                    <Users className="w-16 h-16 mb-4" />
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
                        Expert Insights
                    </h1>
                    <p className="text-lg mt-2 text-center text-white/90">
                        Manage insights and quotes from industry experts
                    </p>
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <PageHeader 
                        title="EXPERT LIST" 
                    />
                    <button 
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-[#00df82] text-[#001529] px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00c572] transition-all shadow-lg uppercase tracking-widest text-xs"
                    >
                        <Plus size={20} /> Add New Expert
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {experts.map((expert) => (
                        <div key={expert._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <div className="p-6 flex items-start gap-4">
                                <img 
                                    src={`${SERVER_URL}${expert.image}`} 
                                    alt={expert.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-50 shadow-sm"
                                />
                                <div className="flex-1">
                                    <h3 className="text-[#001529] font-bold text-sm mb-1">{expert.name}</h3>
                                    <p className="text-blue-600 text-[10px] font-bold mb-0.5">{expert.role}</p>
                                    <p className="text-slate-400 text-[9px] font-bold uppercase">{expert.organization}</p>
                                </div>
                            </div>
                            <div className="px-6 pb-6">
                                <p className="text-slate-600 text-xs italic line-clamp-3 mb-4 h-12">"{expert.insight}"</p>
                                <div className="flex justify-end gap-2 border-t border-slate-50 pt-4">
                                    <button onClick={() => handleEdit(expert)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(expert._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Expert Insight' : 'Add New Expert Insight'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="col-span-2 flex justify-center mb-4">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50">
                                            {previewUrl ? (
                                                <img src={previewUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300"><Plus size={40} /></div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 bg-[#00df82] p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-all">
                                            <Camera size={16} />
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    setPreviewUrl(URL.createObjectURL(file));
                                                }
                                            }} />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Expert Name</label>
                                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm" placeholder="Dr. John Doe" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Role/Designation</label>
                                    <input required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm" placeholder="Cardiologist" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Organization</label>
                                    <input required value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm" placeholder="AIIMS, Delhi" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Article Slug (Optional)</label>
                                    <input value={formData.linkedArticleSlug} onChange={(e) => setFormData({...formData, linkedArticleSlug: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm" placeholder="future-of-healthcare" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Insight/Quote</label>
                                    <textarea required value={formData.insight} onChange={(e) => setFormData({...formData, insight: e.target.value})} rows={3} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm resize-none" placeholder="Enter the expert's key insight or quote..." />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-[#001529] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#002a4d] transition-all shadow-xl">Save Expert</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertInsightsManage;
