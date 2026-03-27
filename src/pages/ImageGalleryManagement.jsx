import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from "../lib/api";
import {
    Type, Save, Image as ImageIcon, Plus, Trash2, Edit,
    Maximize2, FileText, Search, Package
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_FORM = {
    title: '',
    description: '',
    category: 'photo',
    mediaType: 'image',
    image: '',
    imageAlt: '',
};

const ImageGalleryManagement = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/gallery?category=photo');
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
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

    const uploadImage = async () => {
        if (!imageFile) return form.image;
        const formData = new FormData();
        formData.append('file', imageFile);
        const res = await api.post('/api/gallery/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) return res.data.url;
        throw new Error('Image upload failed');
    };

    const handleSubmit = async () => {
        if (!imageFile && !form.image) {
            Swal.fire('Warning', 'Please upload an image', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let imageUrl = form.image;
            if (imageFile) {
                imageUrl = await uploadImage();
            }

            const payload = { ...form, image: imageUrl };
            let response;
            if (isEditing) {
                response = await api.put(`/api/gallery/${isEditing}`, payload);
            } else {
                response = await api.post('/api/gallery', payload);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Image Updated!' : 'Image Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchData();
            }
        } catch (error) {
            console.error('Error saving gallery image:', error);
            Swal.fire('Error', 'Failed to save image', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Image?',
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
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                timer: 1200,
                showConfirmButton: false
            });
            fetchData();
        } catch (error) {
            console.error('Error deleting image:', error);
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (item) => {
        setIsEditing(item._id);
        setForm({
            title: item.title || '',
            description: item.description || '',
            category: item.category,
            mediaType: item.mediaType,
            image: item.image,
            imageAlt: item.imageAlt || '',
        });
        setImagePreview(item.image);
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
                title="IMAGE GALLERY MANAGEMENT"
                description="Manage your photo gallery images, titles, and descriptions"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Add/Edit Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Edit Image Entry' : 'Add New Image Entry'}
                        </h2>
                        
                        <div className="space-y-4">
                            {/* Image Upload Area */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gallery Image</label>
                                {imagePreview ? (
                                    <div className="relative h-48 border-2 border-gray-200 overflow-hidden mb-2 bg-gray-50">
                                        <img 
                                            src={imagePreview.startsWith('blob:') ? imagePreview : `${SERVER_URL}${imagePreview}`} 
                                            className="w-full h-full object-contain" 
                                            alt="Preview" 
                                        />
                                        <button
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview('');
                                                setForm({ ...form, image: '' });
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#23471d] hover:bg-gray-50 transition-all group">
                                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2 group-hover:text-[#23471d]" />
                                        <span className="text-xs text-gray-400 group-hover:text-[#23471d]">Click to upload gallery photo</span>
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

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image Alt Text (SEO)</label>
                                <input
                                    type="text"
                                    value={form.imageAlt}
                                    onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    placeholder="e.g. Healthcare Summit 2024 Event Photo"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    placeholder="Enter image title..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center justify-between">
                                    Short Description
                                    <span className="text-[10px] text-gray-400">(Visible on zoom)</span>
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none h-24 shadow-sm text-sm"
                                    placeholder="Enter short description..."
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        isEditing ? <><Edit className="w-5 h-5" /> Update Image</> : <><Plus className="w-5 h-5" /> Save Image</>
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
                                <ImageIcon className="w-4 h-4 text-[#d26019]" /> Gallery Images List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                                {items.length} IMAGES
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase w-12 text-center">NO.</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase w-24">IMAGE</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase">IMAGE DETAILS</th>
                                        <th className="text-center py-3 px-4 text-[10px] font-black text-gray-500 uppercase w-24">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && items.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <div className="w-10 h-10 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-gray-400 italic">
                                                No images found in your gallery.
                                            </td>
                                        </tr>
                                    ) : items.map((item, idx) => (
                                        <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-3 px-4 text-center font-bold text-gray-400 text-xs">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                <div className="w-16 h-12 bg-gray-100 border border-gray-200 rounded overflow-hidden">
                                                    <img 
                                                        src={`${SERVER_URL}${item.image}`} 
                                                        alt={item.imageAlt} 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <h3 className="text-xs font-bold text-[#23471d] uppercase tracking-tight line-clamp-1">{item.title || 'Untitled'}</h3>
                                                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 italic">{item.description || 'No description provided'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase">ALT: {item.imageAlt || 'None'}</span>
                                                </div>
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

export default ImageGalleryManagement;
