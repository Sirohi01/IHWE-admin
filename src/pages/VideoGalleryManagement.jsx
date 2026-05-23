import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Save, Play, Plus, Trash2, Edit,
    Video, Youtube, FileVideo, Layers, Instagram, Camera
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_FORM = {
    title: '',
    description: '',
    category: 'video',
    mediaType: 'video',
    videoUrl: '',
    image: '',
    galleryCategoryId: '',
};

const VideoGalleryManagement = () => {
    const location = useLocation();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(null);
    const [videoType, setVideoType] = useState('youtube'); // 'youtube', 'instagram', or 'upload'
    const [videoFile, setVideoFile] = useState(null);
    const videoInputRef = useRef(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const coverImageInputRef = useRef(null);

    useEffect(() => {
        fetchCategories();
        fetchData();
    }, []);

    // Handle edit state passed from VideoList page
    useEffect(() => {
        if (location.state?.editItem) {
            const item = location.state.editItem;
            const isYoutube = item.videoUrl && (item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be'));
            const isInstagram = item.videoUrl && (item.videoUrl.includes('instagram.com') || item.videoUrl.includes('instagr.am'));
            setVideoType(isYoutube ? 'youtube' : isInstagram ? 'instagram' : 'upload');
            setIsEditing(item._id);
            setForm({
                title: item.title || '',
                description: item.description || '',
                category: item.category,
                mediaType: item.mediaType,
                videoUrl: item.videoUrl || '',
                image: item.image || '',
                galleryCategoryId: item.galleryCategoryId?._id || item.galleryCategoryId || '',
            });
            setVideoFile(null);
            setCoverImageFile(null);
            setCoverImagePreview(item.image ? `${SERVER_URL}${item.image}` : '');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Clear state to avoid re-triggering
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/gallery-category?type=video');
            if (res.data.success) setCategories(res.data.data);
        } catch (err) {
            console.error('Failed to fetch video categories', err);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/gallery?category=video');
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching gallery videos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVideoFile(file);
    };

    const uploadVideo = async () => {
        if (!videoFile) return form.videoUrl;
        const formData = new FormData();
        formData.append('file', videoFile);
        const res = await api.post('/api/gallery/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) return res.data.url;
        throw new Error('Video upload failed');
    };

    const handleSubmit = async () => {
        if (!form.title) {
            Swal.fire('Warning', 'Please enter a video title', 'warning');
            return;
        }
        if (videoType === 'youtube' && !form.videoUrl) {
            Swal.fire('Warning', 'Please enter a YouTube link', 'warning');
            return;
        }
        if (videoType === 'instagram' && !form.videoUrl) {
            Swal.fire('Warning', 'Please enter an Instagram link', 'warning');
            return;
        }
        if (videoType === 'upload' && !videoFile && !form.videoUrl) {
            Swal.fire('Warning', 'Please upload a video file', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let videoUrl = form.videoUrl;
            if (videoType === 'upload' && videoFile) {
                videoUrl = await uploadVideo();
            }

            let imageUrl = form.image;
            if (coverImageFile) {
                const formData = new FormData();
                formData.append('file', coverImageFile);
                const uploadRes = await api.post("/api/gallery/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                imageUrl = uploadRes.data.url;
            }

            const payload = { ...form, videoUrl, image: imageUrl };
            // Only include galleryCategoryId if a category is selected
            if (!payload.galleryCategoryId) delete payload.galleryCategoryId;

            let response;
            if (isEditing) {
                response = await api.put(`/api/gallery/${isEditing}`, payload);
            } else {
                response = await api.post('/api/gallery', payload);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Video Updated!' : 'Video Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchData();
            }
        } catch (error) {
            console.error('Error saving gallery video:', error);
            Swal.fire('Error', 'Failed to save video', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Video?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/gallery/${id}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (item) => {
        setIsEditing(item._id);
        const isYoutube = item.videoUrl && (item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be'));
        const isInstagram = item.videoUrl && (item.videoUrl.includes('instagram.com') || item.videoUrl.includes('instagr.am'));
        setVideoType(isYoutube ? 'youtube' : isInstagram ? 'instagram' : 'upload');
        setForm({
            title: item.title || '',
            description: item.description || '',
            category: item.category,
            mediaType: item.mediaType,
            videoUrl: item.videoUrl || '',
            image: item.image || '',
            galleryCategoryId: item.galleryCategoryId?._id || item.galleryCategoryId || '',
        });
        setVideoFile(null);
        setCoverImageFile(null);
        setCoverImagePreview(item.image ? `${SERVER_URL}${item.image}` : '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({ ...EMPTY_FORM });
        setVideoFile(null);
        setCoverImageFile(null);
        setCoverImagePreview('');
        setVideoType('youtube');
        if (videoInputRef.current) videoInputRef.current.value = '';
        if (coverImageInputRef.current) coverImageInputRef.current.value = '';
    };

    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        let videoId = "";
        if (url.includes("youtube.com/watch?v=")) videoId = url.split("v=")[1]?.split("&")[0];
        else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
        else if (url.includes("youtube.com/embed/")) videoId = url.split("embed/")[1]?.split("?")[0];
        else if (url.includes("youtube.com/shorts/")) videoId = url.split("shorts/")[1]?.split("?")[0];
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    };

    const getInstagramThumbnail = (url) => {
        if (!url) return null;
        let shortcode = "";
        if (url.includes("instagram.com/reel/")) {
            shortcode = url.split("instagram.com/reel/")[1]?.split("/")[0]?.split("?")[0];
        } else if (url.includes("instagram.com/p/")) {
            shortcode = url.split("instagram.com/p/")[1]?.split("/")[0]?.split("?")[0];
        } else if (url.includes("instagr.am/p/")) {
            shortcode = url.split("instagr.am/p/")[1]?.split("/")[0]?.split("?")[0];
        }
        return shortcode ? `https://www.instagram.com/p/${shortcode}/media/?size=l` : null;
    };

    const getInstagramEmbedUrl = (url) => {
        if (!url) return "";
        let cleanUrl = url.split("?")[0];
        if (!cleanUrl.endsWith("/")) {
            cleanUrl += "/";
        }
        return `${cleanUrl}embed/`;
    };

    const getCategoryName = (item) => {
        if (!item.galleryCategoryId) return '—';
        const catId = item.galleryCategoryId?._id || item.galleryCategoryId;
        const cat = categories.find(c => c._id === catId);
        return cat?.title || '—';
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="VIDEO GALLERY MANAGEMENT"
                description="Upload video files or add YouTube links to your video gallery categories"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Add/Edit Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Edit Video Entry' : 'Add New Video Entry'}
                        </h2>

                        <div className="space-y-4">
                            {/* Video Source Type */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Video Source Type</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setVideoType('youtube')}
                                        className={`flex-1 py-2 px-3 rounded border-2 font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${videoType === 'youtube' ? 'border-red-500 bg-red-500 text-white shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                    >
                                        <Youtube size={14} /> YouTube
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVideoType('instagram')}
                                        className={`flex-1 py-2 px-3 rounded border-2 font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${videoType === 'instagram' ? 'border-[#e1306c] bg-gradient-to-r from-[#f9ce3f] via-[#e1306c] to-[#833ab4] text-white shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                    >
                                        <Instagram size={14} /> Instagram
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVideoType('upload')}
                                        className={`flex-1 py-2 px-3 rounded border-2 font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${videoType === 'upload' ? 'border-[#23471d] bg-[#23471d] text-white shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                    >
                                        <FileVideo size={14} /> Upload Video
                                    </button>
                                </div>
                            </div>

                            {/* Video Input */}
                            {videoType === 'youtube' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">YouTube URL</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.videoUrl}
                                            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                                            className="w-full px-4 py-2 pl-10 border-2 border-gray-200 focus:border-[#d26019] outline-none shadow-sm text-sm"
                                            placeholder="e.g. https://www.youtube.com/watch?v=..."
                                        />
                                        <Youtube className="absolute left-3 top-2.5 text-red-500" size={16} />
                                    </div>
                                </div>
                            ) : videoType === 'instagram' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram URL</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.videoUrl}
                                            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                                            className="w-full px-4 py-2 pl-10 border-2 border-gray-200 focus:border-[#d26019] outline-none shadow-sm text-sm"
                                            placeholder="e.g. https://www.instagram.com/reel/..."
                                        />
                                        <Instagram className="absolute left-3 top-2.5 text-pink-500" size={16} />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Video File</label>
                                    <div className="relative">
                                        {videoFile ? (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded">
                                                <FileVideo className="text-[#23471d]" size={24} />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-xs font-bold truncate">{videoFile.name}</p>
                                                    <p className="text-[10px] text-gray-400">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                </div>
                                                <button onClick={() => setVideoFile(null)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : form.videoUrl && !form.videoUrl.startsWith('http') ? (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-[#23471d]/20 rounded group">
                                                <Play className="text-[#23471d]" size={24} />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-xs font-bold truncate">Current: {form.videoUrl.split('/').pop()}</p>
                                                    <p className="text-[10px] text-[#23471d] font-bold uppercase tracking-widest">Uploaded File</p>
                                                </div>
                                                <label className="p-2 text-[#23471d] hover:bg-[#23471d]/10 rounded cursor-pointer">
                                                    <Edit size={14} />
                                                    <input ref={videoInputRef} type="file" className="hidden" onChange={handleVideoChange} accept="video/*" />
                                                </label>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#23471d] hover:bg-gray-50 transition-all group">
                                                <Video className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#23471d]" />
                                                <span className="text-xs text-gray-400 group-hover:text-[#23471d]">Click to upload local video</span>
                                                <input ref={videoInputRef} type="file" className="hidden" onChange={handleVideoChange} accept="video/*" />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Video Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Video Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    placeholder="Enter video title..."
                                />
                            </div>

                            {/* Category Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <Layers size={11} /> Video Category
                                </label>
                                <select
                                    value={form.galleryCategoryId}
                                    onChange={(e) => setForm({ ...form, galleryCategoryId: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-sm bg-white"
                                >
                                    <option value="">— Select Category —</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.title}</option>
                                    ))}
                                </select>
                                {categories.length === 0 && (
                                    <p className="text-[10px] text-orange-500 mt-1">
                                        No categories yet. Create one in "Video Categories".
                                    </p>
                                )}
                            </div>

                            {/* Video Cover Image (Thumbnail) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Video Thumbnail / Cover Image (Optional)
                                </label>
                                {coverImagePreview ? (
                                    <div className="relative h-28 border-2 border-gray-200 overflow-hidden mb-2">
                                        <img src={coverImagePreview} className="w-full h-full object-cover" alt="Cover Preview" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCoverImageFile(null);
                                                setCoverImagePreview('');
                                                setForm({ ...form, image: '' });
                                                if (coverImageInputRef.current) coverImageInputRef.current.value = '';
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#23471d] hover:bg-gray-50 transition-all group mb-2">
                                        <Camera className="w-6 h-6 text-gray-400 mb-1 group-hover:text-[#23471d]" />
                                        <span className="text-xs text-gray-400 group-hover:text-[#23471d]">Click to upload thumbnail</span>
                                        <input
                                            ref={coverImageInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                setCoverImageFile(file);
                                                setCoverImagePreview(URL.createObjectURL(file));
                                            }}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-[#23471d]/10"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        isEditing ? <><Edit className="w-5 h-5" /> Update Video</> : <><Save className="w-5 h-5" /> Save Video Entry</>
                                    )}
                                </button>
                                {isEditing && (
                                    <button
                                        onClick={resetForm}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Table List */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Video className="w-4 h-4 text-[#d26019]" /> Video Gallery List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                                {items.length} VIDEOS
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase w-12 text-center">NO.</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase">VIDEO DETAILS</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase">CATEGORY</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase w-24">SOURCE</th>
                                        <th className="text-center py-3 px-4 text-[10px] font-black text-gray-500 uppercase w-24">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <div className="w-10 h-10 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-gray-400 italic">
                                                No videos found in your gallery.
                                            </td>
                                        </tr>
                                    ) : items.map((item, idx) => (
                                        <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group text-sm">
                                            <td className="py-3 px-4 text-center font-black text-gray-300">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center text-[#23471d] relative group/preview">
                                                        {item.image ? (
                                                            <img
                                                                src={`${SERVER_URL}${item.image}`}
                                                                className="w-full h-full object-cover"
                                                                alt={item.title}
                                                            />
                                                        ) : item.videoUrl && (item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be')) ? (
                                                            <img
                                                                src={getYouTubeThumbnail(item.videoUrl)}
                                                                className="w-full h-full object-cover"
                                                                alt={item.title}
                                                                onError={(e) => { e.target.src = "https://placehold.co/64x40?text=NA"; }}
                                                            />
                                                        ) : item.videoUrl && (item.videoUrl.includes('instagram.com') || item.videoUrl.includes('instagr.am')) ? (
                                                            <div className="w-full h-full pointer-events-none overflow-hidden relative flex items-center justify-center bg-black">
                                                                <iframe 
                                                                    src={getInstagramEmbedUrl(item.videoUrl)} 
                                                                    className="w-[125%] h-[200%] border-0 opacity-80"
                                                                    scrolling="no"
                                                                />
                                                            </div>
                                                        ) : item.videoUrl ? (
                                                            <video src={`${SERVER_URL}${item.videoUrl}#t=0.5`} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                                                        ) : (
                                                            <Play className="w-5 h-5 fill-current" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                                            <Play className="w-4 h-4 text-white fill-current" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 uppercase tracking-tight line-clamp-1 text-xs">{item.title}</h3>
                                                        <p className="text-[10px] text-slate-400 italic line-clamp-1">{item.videoUrl}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-[10px] font-bold bg-[#23471d]/10 text-[#23471d] px-2 py-1 rounded uppercase">
                                                    {getCategoryName(item)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.videoUrl && (item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be')) ? (
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded">
                                                        <Youtube size={10} /> YouTube
                                                    </span>
                                                ) : item.videoUrl && (item.videoUrl.includes('instagram.com') || item.videoUrl.includes('instagr.am')) ? (
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-pink-600 bg-pink-50 px-2 py-1 rounded">
                                                        <Instagram size={10} /> Instagram
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                        <FileVideo size={10} /> Uploaded
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => startEdit(item)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                                        title="Edit Entry"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                        title="Delete Entry"
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

export default VideoGalleryManagement;
