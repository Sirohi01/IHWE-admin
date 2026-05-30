import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import {
    Save, Image as ImageIcon, Plus, Trash2, Edit,
    Globe, Camera, X
} from 'lucide-react';
import api, { SERVER_URL } from '../../lib/api';
import PageHeader from '../../components/PageHeader';

const EMPTY_FORM = {
    title: '',
    imageAlt: '',
    image: '',
};

const MediaCategoryManagement = () => {
    const [mediaList, setMediaList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => { fetchMedia(); }, []);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/gallery?category=press');
            if (res.data.success) setMediaList(res.data.data);
        } catch (err) {
            console.error('Failed to fetch media', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!imageFile && !form.image) {
            Swal.fire('Warning', 'Media image is required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let imageUrl = form.image;
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const uploadRes = await api.post("/api/gallery/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                imageUrl = uploadRes.data.url;
            }

            const payload = {
                title: form.title,
                category: 'press',
                mediaType: 'image',
                image: imageUrl,
                imageAlt: form.imageAlt,
            };

            let res;
            if (isEditing) {
                res = await api.put(`/api/gallery/${isEditing}`, payload);
            } else {
                res = await api.post('/api/gallery', payload);
            }

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Media Updated!' : 'Media Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchMedia();
            }
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Media Photo?',
            text: 'This action cannot be undone.',
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
            fetchMedia();
        } catch (err) {
            Swal.fire('Error', 'Failed to delete media', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (item) => {
        setIsEditing(item._id);
        setForm({
            title: item.title || '',
            imageAlt: item.imageAlt || '',
            image: item.image || '',
        });
        setImagePreview(item.image ? `${SERVER_URL}${item.image}` : '');
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({ ...EMPTY_FORM });
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="MEDIA GALLERY MANAGEMENT"
                description="Upload and manage your press & media photos directly"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">

                {/* ===== LEFT: FORM ===== */}
                <div className="lg:col-span-1">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#d26019]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Edit Media Photo' : 'Add New Media Photo'}
                        </h2>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Media Title (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. Press Coverage 2024"
                                />
                            </div>

                            {/* Image Alt Text */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Image Alt Text (SEO)
                                </label>
                                <input
                                    type="text"
                                    value={form.imageAlt}
                                    onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. IHWE Press release photo"
                                />
                            </div>

                            {/* Cover Image */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Media Image <span className="text-red-500">*</span>
                                </label>
                                {imagePreview ? (
                                    <div className="relative h-36 border-2 border-gray-200 overflow-hidden mb-2">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <button
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview('');
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#23471d] transition-colors mb-2">
                                        <Camera className="w-7 h-7 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-400">Click to upload image</span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading
                                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : isEditing
                                            ? <><Edit className="w-4 h-4" /> Update Media</>
                                            : <><Plus className="w-4 h-4" /> Add Media</>
                                    }
                                </button>
                                {isEditing && (
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== RIGHT: MEDIA TABLE ===== */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        {/* Table Header */}
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#d26019]" /> Media Photos List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                {mediaList.length} PHOTOS
                            </span>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-24">IMAGE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">TITLE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ALT TEXT (SEO)</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">LAST UPDATED BY</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase w-24">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && mediaList.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12">
                                                <div className="w-8 h-8 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : mediaList.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400 italic">
                                                No media photos found. Add your first photo.
                                            </td>
                                        </tr>
                                    ) : mediaList.map((item, idx) => (
                                        <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                {item.image ? (
                                                    <img
                                                        src={`${SERVER_URL}${item.image}`}
                                                        alt={item.imageAlt}
                                                        className="w-16 h-11 object-cover rounded border border-gray-200"
                                                        onError={(e) => { e.target.src = 'https://placehold.co/64x44?text=No+Img'; }}
                                                    />
                                                ) : (
                                                    <div className="w-16 h-11 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                                        <ImageIcon size={14} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-gray-800 text-sm">{item.title || '—'}</td>
                                            <td className="py-3 px-4 text-gray-600 text-xs">{item.imageAlt || '—'}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="font-bold text-red-600 underline underline-offset-2 uppercase text-[10px]">
                                                        {item.updatedBy || 'System'}
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap text-center">
                                                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString('en-GB', { 
                                                            day: '2-digit', month: 'short', year: 'numeric', 
                                                            hour: '2-digit', minute: '2-digit', hour12: true 
                                                        }) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => startEdit(item)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="text-red-400 hover:text-red-600 transition-colors p-1"
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

export default MediaCategoryManagement;
