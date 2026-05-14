import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Download, Eye, Video, FileText, Link as LinkIcon, Upload, Folder, ChevronDown } from 'lucide-react';
import { SERVER_URL } from "../../lib/api";
import { toast } from 'react-toastify';
import PageHeader from "../../components/PageHeader";

const MediaResourcesManage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'view',
        icon: 'FileText',
        link: '',
        isActive: true
    });
    const [uploadFile, setUploadFile] = useState(null);

    const FIXED_RESOURCES = [
        { title: 'Image Gallery', type: 'view', icon: 'Link' },
        { title: 'YouTube Channel', type: 'watch', icon: 'Video' },
        { title: 'Press Kit', type: 'download', icon: 'FileText' },
        { title: 'Exhibitors', type: 'view', icon: 'Eye' }
    ];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await axios.get(`${SERVER_URL}/api/blogs/media-resources`);
            if (res.data.success) setResources(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (resource) => {
        setEditingItem(resource);
        setFormData({
            title: resource.title,
            type: resource.type,
            icon: resource.icon,
            link: resource.link,
            isActive: resource.isActive
        });
        setUploadFile(null);
        setShowModal(true);
    };

    const handleSelectResource = (title) => {
        if (!title) return;
        const fixed = FIXED_RESOURCES.find(f => f.title === title);
        const existing = resources.find(r => r.title === title);
        
        if (existing) {
            handleEdit(existing);
        } else if (fixed) {
            setEditingItem(null);
            setFormData({
                title: fixed.title,
                type: fixed.type,
                icon: fixed.icon,
                link: '',
                isActive: true
            });
            setUploadFile(null);
            setShowModal(true);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const res = await axios.delete(`${SERVER_URL}/api/blogs/resources/${id}`);
            if (res.data.success) {
                toast.success('Resource deleted');
                fetchResources();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (uploadFile) data.append('file', uploadFile);

        try {
            let res;
            if (editingItem) {
                res = await axios.patch(`${SERVER_URL}/api/blogs/resources/${editingItem._id}`, data);
            } else {
                res = await axios.post(`${SERVER_URL}/api/blogs/resources`, data);
            }

            if (res.data.success) {
                toast.success('Saved successfully');
                setShowModal(false);
                resetForm();
                fetchResources();
            }
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    const resetForm = () => {
        setFormData({ title: '', type: 'view', icon: 'FileText', link: '', isActive: true });
        setEditingItem(null);
        setUploadFile(null);
    };

    const getIcon = (iconName) => {
        switch(iconName) {
            case 'Video': return <Video size={20} />;
            case 'Eye': return <Eye size={20} />;
            case 'Download': return <Download size={20} />;
            case 'Link': return <LinkIcon size={20} />;
            default: return <FileText size={20} />;
        }
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen">
            {/* Hero Banner */}
            <div className="relative w-full h-64 overflow-hidden rounded-b-xl pt-2">
                <img
                    src="/bann.png"
                    alt="Media Resources Banner"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
                    <Folder className="w-16 h-16 mb-4" />
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
                        Media Resources
                    </h1>
                    <p className="text-lg mt-2 text-center text-white/90">
                        Manage downloadable files and external media links
                    </p>
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <PageHeader 
                        title="RESOURCES LIST" 
                    />
                    
                    <div className="relative group">
                        <div className="bg-[#00df82] text-[#001529] px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00c572] transition-all shadow-lg uppercase tracking-widest text-xs cursor-pointer">
                            <Plus size={20} /> Update Resources <ChevronDown size={16} />
                        </div>
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            {FIXED_RESOURCES.map(res => (
                                <button 
                                    key={res.title}
                                    onClick={() => handleSelectResource(res.title)}
                                    className="w-full text-left px-5 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-[#00df82] transition-all flex items-center justify-between"
                                >
                                    {res.title}
                                    <div className="w-6 h-6 bg-slate-50 rounded flex items-center justify-center text-slate-300 group-hover:text-[#00df82]">
                                        {getIcon(res.icon)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Link/File</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {resources.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                {getIcon(item.icon)}
                                            </div>
                                            <span className="font-bold text-sm text-[#001529]">{item.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500">{item.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`w-2 h-2 rounded-full inline-block mr-2 ${item.isActive ? 'bg-[#00df82]' : 'bg-red-400'}`}></span>
                                        <span className="text-xs font-bold text-slate-600">{item.isActive ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-medium text-slate-400 truncate max-w-[200px] block">{item.link}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {resources.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium text-sm italic">No resources configured. Select from dropdown to add.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Resource' : 'Add New Resource'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Resource Title</label>
                                    <input required disabled={FIXED_RESOURCES.some(f => f.title === formData.title)} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm disabled:opacity-70" placeholder="e.g. Press Kit" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Type</label>
                                        <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm">
                                            <option value="view">View/Link</option>
                                            <option value="download">Download (PDF)</option>
                                            <option value="watch">Watch (Video)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Icon</label>
                                        <select value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm">
                                            <option value="FileText">File</option>
                                            <option value="Download">Download</option>
                                            <option value="Eye">View</option>
                                            <option value="Video">Video</option>
                                            <option value="Link">External Link</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {formData.title === 'Press Kit' || formData.type === 'download' ? (
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Upload PDF File</label>
                                        <div className="border-2 border-dashed border-slate-200 p-6 text-center relative group min-h-[100px] flex items-center justify-center bg-slate-50/50 rounded-xl hover:border-[#00df82] transition-all overflow-hidden">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => setUploadFile(e.target.files[0])}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            {uploadFile || formData.link ? (
                                                <div className="flex flex-col items-center">
                                                    <FileText className="w-8 h-8 text-orange-500 mb-1" />
                                                    <p className="text-[10px] font-bold text-slate-600 truncate max-w-[200px]">
                                                        {uploadFile ? uploadFile.name : "File Attached"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Plus className="w-6 h-6 text-slate-300 mb-1" />
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Click to upload PDF</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">URL / Link</label>
                                        <input required value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm" placeholder="https://..." />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-4 pt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-[#001529] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#002a4d] transition-all shadow-xl">Save Resource</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaResourcesManage;
