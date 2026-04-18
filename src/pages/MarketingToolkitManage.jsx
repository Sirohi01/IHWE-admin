import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Layout, Upload, Trash2, Edit, Save, Plus,
    Image as ImageIcon, Video, Settings, X, Eye, ChevronRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const POSITIONS = {
    'Bottom Left': { x: 50, y: 920 },
    'Bottom Right': { x: 830, y: 920 },
    'Bottom Center': { x: 440, y: 920 },
    'Top Left': { x: 50, y: 50 },
    'Top Right': { x: 830, y: 50 },
    'Center': { x: 440, y: 500 },
};

const MarketingToolkitManage = () => {
    const [templates, setTemplates] = useState([]);
    const [exhibitors, setExhibitors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loadingTask, setLoadingTask] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category: 'Social Media',
        type: 'Frame',
        isActive: true,
        assignedExhibitorId: '',
    });

    useEffect(() => {
        fetchTemplates();
        fetchExhibitors();
    }, []);

    const fetchExhibitors = async () => {
        try {
            const res = await api.get('/api/exhibitor-registration');
            const list = res.data.data || res.data || [];
            if (Array.isArray(list)) {
                setExhibitors(list);
            }
        } catch (error) {
            console.error('Error fetching exhibitors:', error);
        }
    };

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/marketing-toolkit/admin/templates');
            if (res.data.success) {
                setTemplates(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setFiles(selectedFiles);
            const urls = selectedFiles.map(file => ({
                url: URL.createObjectURL(file),
                is_video: file.type.startsWith('video')
            }));
            setPreviewUrls(urls);
        }
    };

    const handleInputChange = (path, value) => {
        const newFormData = { ...formData };
        const keys = path.split('.');
        let current = newFormData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setFormData(newFormData);
    };

    const applyPreset = (target, presetName) => {
        const coords = POSITIONS[presetName];
        if (!coords) return;
        
        const newFormData = { ...formData };
        if (target === 'logo') {
            newFormData.config.logoPosition.x = coords.x;
            newFormData.config.logoPosition.y = coords.y;
        } else if (target === 'stand') {
            newFormData.config.standNoPosition.x = coords.x;
            newFormData.config.standNoPosition.y = coords.y;
        }
        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (editingId) {
                // Single update logic
                const data = new FormData();
                data.append('name', formData.name);
                data.append('category', formData.category);
                data.append('type', formData.type);
                data.append('isActive', formData.isActive);
                data.append('assignedExhibitorId', formData.assignedExhibitorId || '');
                if (files.length > 0) data.append('template', files[0]);

                await api.put(`/api/marketing-toolkit/admin/templates/${editingId}`, data);
                Swal.fire('Success', 'Template updated', 'success');
            } else {
                // Creation logic (Sequential for stability)
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    setLoadingTask(`Uploading file ${i + 1} of ${files.length}: ${file.name}`);
                    
                    const data = new FormData();
                    data.append('name', files.length > 1 ? file.name.split('.')[0].toUpperCase() : formData.name);
                    
                    const category = file.type.startsWith('video') ? 'Video' : formData.category;
                    
                    data.append('category', category);
                    data.append('type', formData.type);
                    data.append('isActive', formData.isActive);
                    data.append('assignedExhibitorId', formData.assignedExhibitorId || '');
                    data.append('template', file);
                    await api.post('/api/marketing-toolkit/admin/templates', data);
                }
                Swal.fire('Success', `${files.length} Template(s) added successfully`, 'success');
            }

            setIsModalOpen(false);
            resetForm();
            setLoadingTask('');
            fetchTemplates();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Social Media',
            type: '',
            isActive: true,
            assignedExhibitorId: '',
        });
        setFiles([]);
        setPreviewUrls([]);
        setEditingId(null);
    };

    const handleEdit = (template) => {
        setEditingId(template._id);
        setFormData({
            name: template.name,
            category: template.category,
            type: template.type,
            isActive: template.isActive,
            assignedExhibitorId: template.assignedExhibitorId || '',
        });
        setPreviewUrls([{ url: template.templateUrl.startsWith('http') ? template.templateUrl : `${SERVER_URL}${template.templateUrl}`, is_video: template.category === 'Video' }]);
        setIsModalOpen(true);
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
                const res = await api.delete(`/api/marketing-toolkit/admin/templates/${id}`);
                if (res.data.success) {
                    Swal.fire('Deleted!', 'Template has been deleted.', 'success');
                    fetchTemplates();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete template', 'error');
            }
        }
    };

    return (
        <div className="p-6 bg-white shadow-md mt-6 min-h-screen font-inter tracking-widest text-[11px] font-bold">
            <PageHeader
                title="MARKETING TOOLKIT MANAGE"
                description="Manage templates for exhibitor marketing posters and videos"
            />

            <div className="flex justify-end mb-6">
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#23471d] text-white font-bold uppercase transition-transform active:scale-95 shadow-md"
                >
                    <Plus className="w-4 h-4" /> Add New Template
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {templates.map((tpl) => (
                    <div key={tpl._id} className="bg-white border-2 border-gray-100 shadow-sm transition-all hover:shadow-lg group">
                        <div className="relative aspect-square overflow-hidden bg-gray-50 border-b border-gray-100">
                            {tpl.category === 'Video' ? (
                                <video src={`${SERVER_URL}${tpl.templateUrl}`} className="w-full h-full object-contain" muted />
                            ) : (
                                <img src={`${SERVER_URL}${tpl.templateUrl}`} alt={tpl.name} className="w-full h-full object-contain" />
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter ${tpl.isActive ? 'bg-green-500' : 'bg-gray-400'} text-white`}>
                                    {tpl.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {tpl.assignedExhibitorId && (
                                <div className="absolute bottom-2 left-2">
                                    <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter bg-red-600 text-white shadow-md">
                                        Private Template
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-extrabold text-[#23471d] uppercase mb-0.5 truncate text-[10px]">{tpl.name}</h3>
                            <div className="flex flex-col gap-0.5 mb-2">
                                <div className="flex justify-between items-center text-[8px] text-gray-400 uppercase">
                                    <span>{tpl.category}</span>
                                    <span>{tpl.type}</span>
                                </div>
                                {tpl.assignedExhibitorId && (
                                    <div className="text-[8px] text-red-600 font-black uppercase truncate">
                                        TO: {exhibitors.find(ex => ex._id === tpl.assignedExhibitorId)?.exhibitorName || 
                                            exhibitors.find(ex => ex._id === tpl.assignedExhibitorId)?.companyName || 
                                            'Private'}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 pt-3 border-t-2 border-gray-50">
                                <button
                                    onClick={() => handleEdit(tpl)}
                                    className="flex-1 py-1.5 bg-blue-50 text-blue-600 border-2 border-blue-100 flex items-center justify-center gap-1 hover:bg-blue-600 hover:text-white transition-colors uppercase"
                                >
                                    <Edit className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(tpl._id)}
                                    className="flex-1 py-1.5 bg-red-50 text-red-600 border-2 border-red-100 flex items-center justify-center gap-1 hover:bg-red-600 hover:text-white transition-colors uppercase"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="sticky top-0 bg-[#23471d] text-white p-4 flex justify-between items-center z-10">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {editingId ? 'Edit Template' : 'Add New Marketing Template'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Side: Config */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] text-gray-500 mb-1 uppercase">Template Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none uppercase font-bold"
                                            placeholder="e.g. Social Media Square Post"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1 uppercase">Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => handleInputChange('category', e.target.value)}
                                                className="w-full px-4 py-2 border-2 border-gray-200 uppercase font-bold text-[10px]"
                                            >
                                                <option value="Social Media">Social Media</option>
                                                <option value="Invitation">Invitation</option>
                                                <option value="Product">Product</option>
                                                <option value="Video">Video</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1 uppercase">Type / Format</label>
                                            <input
                                                type="text"
                                                value={formData.type}
                                                onChange={(e) => handleInputChange('type', e.target.value)}
                                                className="w-full px-4 py-2 border-2 border-gray-200 uppercase font-bold text-[10px]"
                                                placeholder="STORY, SQUARE, ETC."
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                        <label className="block text-[11px] text-red-600 font-extrabold mb-2 uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-200" />
                                            Target Specific Exhibitor (Optional)
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.assignedExhibitorId}
                                                onChange={(e) => handleInputChange('assignedExhibitorId', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-md focus:border-red-500 focus:ring-0 outline-none transition-all text-[11px] font-black tracking-widest text-[#1e293b] uppercase cursor-pointer hover:border-gray-300"
                                            >
                                                <option value="" className="text-gray-400">🌐 SHOW TO ALL EXHIBITORS (PUBLIC)</option>
                                                {exhibitors.map(ex => (
                                                    <option key={ex._id} value={ex._id} className="font-bold py-2">
                                                        👤 {ex.exhibitorName || ex.companyName || 'UNNAMED'} 
                                                        {ex.participation?.stallFor ? ` [STALL: ${ex.participation.stallFor}]` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase italic leading-tight">
                                            Note: If nobody is selected, this asset stays public.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-8">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                            className="w-4 h-4 accent-[#23471d]"
                                        />
                                        <label htmlFor="isActive" className="text-[10px] font-black uppercase text-gray-600">Active Template</label>
                                    </div>
                                </div>

                                {/* Right Side: Upload & Preview */}
                                <div className="space-y-4">
                                    <label className="block text-[10px] text-gray-500 mb-1 uppercase">Template File (Image/Video)</label>
                                    <div className="relative aspect-square border-4 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-4 transition-colors hover:border-[#d26019]">
                                        {previewUrls.length > 0 ? (
                                            <div className="w-full h-full overflow-y-auto custom-scrollbar">
                                                <div className={`grid ${previewUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                                                    {previewUrls.map((p, idx) => (
                                                        <div key={idx} className="relative aspect-square bg-white border border-gray-200 shadow-sm rounded-sm p-1">
                                                            {p.is_video ? (
                                                                <video src={p.url} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <img src={p.url} className="w-full h-full object-contain" alt="Preview" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => { setFiles([]); setPreviewUrls([]); }}
                                                    className="absolute -top-3 -right-3 bg-red-600 text-white p-2 rounded-full shadow-xl z-50 hover:bg-red-700 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-12 h-12 text-gray-300 mb-2" />
                                                <p className="text-[10px] text-gray-400 font-black uppercase text-center">Click to upload or drag & drop</p>
                                                <p className="text-[8px] text-gray-400 mt-1 uppercase">PNG, JPG or MP4 (Max 20MB)</p>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    accept="image/*,video/mp4,video/quicktime,video/x-msvideo"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 border-t-2 border-gray-100 pt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-[#23471d] text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px]">{loadingTask || 'Processing...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>{editingId ? 'Update Template' : 'Create Template'}</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-3 bg-gray-100 text-gray-600 font-black uppercase tracking-widest hover:bg-gray-200 transition-colors border-2 border-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingToolkitManage;
