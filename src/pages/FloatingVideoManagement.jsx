import { useState, useEffect, useRef } from 'react';
import { 
    Plus, Pencil, Trash2, Video, Clock, Type, Hash, 
    Edit, Save, Camera, Play, List, Settings as SettingsIcon,
    Layers, Monitor
} from 'lucide-react';
import { toast } from "react-toastify";
import DeleteConfirmToast from "../components/DeleteConfirmToast";
import Table from "../components/table/Table";
import PageHeader from '../components/PageHeader';
import api, { SERVER_URL } from "../lib/api";
import Swal from "sweetalert2";

const FloatingVideoManagement = () => {
    const [videos, setVideos] = useState([]);
    const [timer, setTimer] = useState(7);
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        name: '',
        companyName: '',
        companyNameColor: 'orange',
        video: null,
        videoPreview: null,
        status: 'active',
        order: 0
    });

    useEffect(() => {
        fetchVideos();
        fetchSettings();
    }, []);

    const fetchVideos = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/floating-videos');
            if (response.data.success) {
                setVideos(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await api.get('/api/floating-videos/settings');
            if (response.data.success) {
                setTimer(response.data.timer);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVideoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({
                ...prev,
                video: file,
                videoPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleTimerUpdate = async () => {
        try {
            setIsLoading(true);
            const response = await api.put('/api/floating-videos/settings', { timer });
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Timer Updated!',
                    text: `Rotation interval set to ${timer} seconds.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            toast.error("Failed to update timer");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || (!formData.video && !editId)) {
            Swal.fire('Warning', 'Please provide a title and upload a video.', 'warning');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('name', formData.name);
        data.append('companyName', formData.companyName);
        data.append('companyNameColor', formData.companyNameColor);
        data.append('status', formData.status);
        data.append('order', formData.order);
        if (formData.video) {
            data.append('video', formData.video);
        }

        try {
            setIsLoading(true);
            let response;
            if (editId) {
                response = await api.put(`/api/floating-videos/${editId}`, data);
            } else {
                response = await api.post('/api/floating-videos', data);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: editId ? 'Video Updated!' : 'Video Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchVideos();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save video");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            name: '',
            companyName: '',
            companyNameColor: 'orange',
            video: null,
            videoPreview: null,
            status: 'active',
            order: 0
        });
        setEditId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startEdit = (item) => {
        setEditId(item._id);
        setFormData({
            title: item.title,
            name: item.name || '',
            companyName: item.companyName || '',
            companyNameColor: item.companyNameColor || 'orange',
            video: null,
            videoPreview: item.videoUrl ? `${SERVER_URL}${item.videoUrl}` : null,
            status: item.status,
            order: item.order
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Video?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;

        try {
            setIsLoading(true);
            const response = await api.delete(`/api/floating-videos/${id}`);
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
                fetchVideos();
            }
        } catch (error) {
            toast.error("Failed to delete video");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <PageHeader
                title="FLOATING VIDEO MANAGEMENT"
                description="Manage the floating videos that appear on the homepage"
            />

            {/* TIMER SETTINGS - Premium Top Bar */}
            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm mb-8 mt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#d26019] text-white rounded flex items-center justify-center shadow-md">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-[#23471d] uppercase text-sm tracking-wider">Rotation Interval</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Seconds before the next video appears</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <input
                            type="number"
                            value={timer}
                            onChange={(e) => setTimer(e.target.value)}
                            className="w-full md:w-24 px-4 py-2.5 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-bold text-center"
                        />
                        <button
                            onClick={handleTimerUpdate}
                            className="bg-[#23471d] text-white px-8 py-2.5 font-bold uppercase text-xs hover:bg-green-900 transition-all shadow-md flex items-center gap-2"
                        >
                            <Save size={14} /> Update Timer
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ===== LEFT: FORM ===== */}
                <div className="lg:col-span-1">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#d26019]">
                            {editId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {editId ? 'Edit Floating Video' : 'Add New Video'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Video Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Video Title <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        placeholder="e.g. Highlights 2026"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Person Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Person Name
                                </label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>

                            {/* Company Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Company Name
                                </label>
                                <div className="relative">
                                    <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                            </div>

                            {/* Company Name Color */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Company Name Color
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="companyNameColor"
                                            value="orange"
                                            checked={formData.companyNameColor === 'orange'}
                                            onChange={handleInputChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.companyNameColor === 'orange' ? 'border-[#d26019] scale-110' : 'border-gray-300'}`}>
                                            {formData.companyNameColor === 'orange' && <div className="w-2.5 h-2.5 bg-[#d26019] rounded-full" />}
                                        </div>
                                        <span className={`text-xs font-bold uppercase ${formData.companyNameColor === 'orange' ? 'text-[#d26019]' : 'text-gray-400'}`}>Orange</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="companyNameColor"
                                            value="green"
                                            checked={formData.companyNameColor === 'green'}
                                            onChange={handleInputChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.companyNameColor === 'green' ? 'border-[#23471d] scale-110' : 'border-gray-300'}`}>
                                            {formData.companyNameColor === 'green' && <div className="w-2.5 h-2.5 bg-[#23471d] rounded-full" />}
                                        </div>
                                        <span className={`text-xs font-bold uppercase ${formData.companyNameColor === 'green' ? 'text-[#23471d]' : 'text-gray-400'}`}>Green</span>
                                    </label>
                                </div>
                            </div>

                            {/* Display Order */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Display Order
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Display Status */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Display Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-xs font-bold uppercase"
                                >
                                    <option value="active">Active (Visible)</option>
                                    <option value="inactive">Inactive (Hidden)</option>
                                </select>
                            </div>

                            {/* Video Upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Upload Video <span className="text-red-500">*</span>
                                </label>
                                {formData.videoPreview ? (
                                    <div className="relative h-40 border-2 border-gray-200 overflow-hidden mb-2 bg-black flex items-center justify-center">
                                        <video 
                                            src={formData.videoPreview} 
                                            className="w-full h-full object-contain" 
                                            muted 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, video: null, videoPreview: null }));
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#23471d] transition-colors mb-2 bg-gray-50">
                                        <Video className="w-8 h-8 text-gray-400 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Click to upload video</span>
                                        <span className="text-[9px] text-gray-300 mt-1 uppercase">MP4, Max 50MB</span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleVideoChange}
                                            accept="video/*"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 uppercase text-xs tracking-widest"
                                >
                                    {isLoading
                                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : editId
                                            ? <><Edit className="w-4 h-4" /> Update Video</>
                                            : <><Plus className="w-4 h-4" /> Save Video</>
                                    }
                                </button>
                                {editId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-xs uppercase"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* ===== RIGHT: TABLE ===== */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        {/* Table Header */}
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Layers className="w-4 h-4" /> Floating Videos List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                                {videos.length} VIDEOS
                            </span>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">PREVIEW</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">VIDEO TITLE</th>
                                        <th className="text-center py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">STATUS</th>
                                        <th className="text-center py-3 px-4 text-[10px] font-bold text-gray-500 uppercase w-16">ORDER</th>
                                        <th className="text-right py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && videos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12">
                                                <div className="w-8 h-8 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : videos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400 italic font-medium">
                                                No floating videos found. Upload your first video.
                                            </td>
                                        </tr>
                                    ) : videos.map((vid, idx) => (
                                        <tr key={vid._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                <div className="w-16 h-10 bg-black rounded overflow-hidden border border-gray-200">
                                                    <video
                                                        src={`${SERVER_URL}${vid.videoUrl}`}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-gray-800 text-sm">{vid.title}</p>
                                                {(vid.name || vid.companyName) && (
                                                    <p className="text-[10px] font-bold uppercase mt-0.5">
                                                        <span className="text-gray-800">{vid.name}</span>
                                                        {vid.name && vid.companyName && <span className="text-gray-300 mx-1">|</span>}
                                                        <span style={{ color: vid.companyNameColor === 'green' ? '#23471d' : '#d26019' }}>{vid.companyName}</span>
                                                    </p>
                                                )}
                                                <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5 tracking-tighter">
                                                    Uploaded: {new Date(vid.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${vid.status === "active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                                                    {vid.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded border border-gray-200">
                                                    {vid.order || 0}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => startEdit(vid)}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(vid._id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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

export default FloatingVideoManagement;
