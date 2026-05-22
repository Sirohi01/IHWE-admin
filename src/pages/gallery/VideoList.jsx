import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Play, Trash2, Edit, Youtube, FileVideo,
    Video, Search, Filter, Plus
} from 'lucide-react';
import api, { SERVER_URL } from '../../lib/api';
import PageHeader from '../../components/PageHeader';

const VideoList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(
        location.state?.categoryId || 'all'
    );

    useEffect(() => {
        fetchCategories();
        fetchVideos();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/gallery-category?type=video');
            if (res.data.success) setCategories(res.data.data);
        } catch (err) {
            console.error('Failed to fetch video categories', err);
        }
    };

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/gallery?category=video');
            if (res.data.success) setVideos(res.data.data);
        } catch (err) {
            console.error('Failed to fetch videos', err);
        } finally {
            setIsLoading(false);
        }
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
            await api.delete(`/api/gallery/${id}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchVideos();
        } catch (err) {
            Swal.fire('Error', 'Failed to delete video', 'error');
        }
    };

    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) videoId = url.split('v=')[1]?.split('&')[0];
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
        else if (url.includes('youtube.com/embed/')) videoId = url.split('embed/')[1]?.split('?')[0];
        else if (url.includes('youtube.com/shorts/')) videoId = url.split('shorts/')[1]?.split('?')[0];
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    };

    const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

    const getCategoryTitle = (video) => {
        if (video.galleryCategoryId) {
            const cat = categories.find(c => c._id === (video.galleryCategoryId?._id || video.galleryCategoryId));
            return cat?.title || video.title || 'Uncategorized';
        }
        return video.title || 'Uncategorized';
    };

    // Filter videos
    const filtered = videos.filter(v => {
        const matchSearch = !searchTerm ||
            v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.videoUrl?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchCategory = selectedCategory === 'all' ||
            (v.galleryCategoryId?._id || v.galleryCategoryId) === selectedCategory ||
            v.title === selectedCategory;

        return matchSearch && matchCategory;
    });

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="VIDEO GALLERY LISTINGS"
                description="View, filter and manage all uploaded videos across categories"
            />

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-6">
                {/* Category Filter */}
                <div className="flex items-center gap-2 bg-white border-2 border-gray-200 px-3 py-2 shadow-sm">
                    <Filter className="w-4 h-4 text-[#23471d] flex-shrink-0" />
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="flex-1 text-sm font-bold text-gray-700 outline-none bg-transparent"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.title}</option>
                        ))}
                    </select>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-white border-2 border-gray-200 px-3 py-2 shadow-sm">
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-1 text-sm outline-none bg-transparent"
                    />
                </div>

                {/* Add Video Button */}
                <button
                    onClick={() => navigate('/gallery-videos')}
                    className="flex items-center justify-center gap-2 bg-[#23471d] text-white font-bold px-4 py-2 hover:bg-[#1a3615] transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add New Video
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border-2 border-gray-200 shadow-sm">
                <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                    <h2 className="text-white font-bold flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#d26019]" /> Video Listings
                    </h2>
                    <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                        {filtered.length} VIDEOS
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase w-12 text-center">NO.</th>
                                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase">VIDEO</th>
                                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase">CATEGORY</th>
                                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase">SOURCE</th>
                                <th className="text-center py-3 px-4 text-[10px] font-black text-gray-500 uppercase">DATE</th>
                                <th className="text-center py-3 px-4 text-[10px] font-black text-gray-500 uppercase">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-400 italic">
                                        No videos found. Add your first video.
                                    </td>
                                </tr>
                            ) : filtered.map((video, idx) => {
                                const thumb = getYouTubeThumbnail(video.videoUrl);
                                const youtube = isYouTube(video.videoUrl);
                                return (
                                    <tr key={video._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-3 px-4 text-center font-black text-gray-300 text-xs">{idx + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center text-[#23471d] relative flex-shrink-0">
                                                    {thumb ? (
                                                        <img src={thumb} className="w-full h-full object-cover" alt={video.title}
                                                            onError={(e) => { e.target.src = "https://placehold.co/80x48?text=Video"; }} />
                                                    ) : !youtube && video.videoUrl ? (
                                                        <video src={`${SERVER_URL}${video.videoUrl}#t=0.5`} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                                                    ) : (
                                                        <Play className="w-5 h-5 fill-current" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Play className="w-4 h-4 text-white fill-current" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-slate-800 uppercase tracking-tight text-xs line-clamp-1">{video.title || '—'}</h3>
                                                    <a
                                                        href={video.videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-blue-500 hover:underline line-clamp-1 block"
                                                    >
                                                        {video.videoUrl}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="bg-[#23471d]/10 text-[#23471d] text-[10px] font-black px-2 py-1 rounded uppercase">
                                                {getCategoryTitle(video)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {youtube ? (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded w-fit">
                                                    <Youtube size={10} /> YouTube
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                                    <FileVideo size={10} /> Uploaded
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center text-[10px] text-gray-500 font-medium">
                                            {video.createdAt ? new Date(video.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            }) : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate('/gallery-videos', { state: { editItem: video } })}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(video._id)}
                                                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VideoList;
