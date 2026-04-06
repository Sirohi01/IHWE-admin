import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Save, ImageIcon, Plus, Trash2, Edit,
    Package, Type, Globe, Search, UploadCloud, Camera, X
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_FORM = {
    title: '', 
    category: 'press',
    galleryCategoryId: '', 
    mediaType: 'image',
    image: '',
    imageAlt: '',
};

const MediaGalleryManagement = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(null);
    
    // Multiple upload states
    const [images, setImages] = useState([]);
    const [altTexts, setAltTexts] = useState({});
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/gallery-category?type=media');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching media categories:', error);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/gallery?category=press');
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching media photos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (isEditing) {
            // If editing, only handle single image
            const file = files[0];
            if (!file) return;
            setImages([file]);
            setAltTexts({ 0: form.imageAlt });
        } else {
            // Bulk upload
            if (files.length + images.length > 20) {
                Swal.fire("Warning", "Max 20 images at a time", "warning");
                return;
            }
            setImages((prev) => [...prev, ...files]);
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setAltTexts((prev) => {
            const next = { ...prev };
            delete next[index];
            // Re-index remaining alt texts to match new image array
            const reindexed = {};
            images.filter((_, i) => i !== index).forEach((_, i) => {
                const oldIndex = i >= index ? i + 1 : i;
                reindexed[i] = prev[oldIndex] || "";
            });
            return reindexed;
        });
    };

    const handleAltTextChange = (index, value) => {
        setAltTexts((prev) => ({ ...prev, [index]: value }));
    };

    const handleSubmit = async () => {
        if (!form.galleryCategoryId) {
            Swal.fire('Warning', 'Please select a media category', 'warning');
            return;
        }

        if (isEditing) {
            // Single update logic
            if (images.length === 0 && !form.image) {
                Swal.fire('Warning', 'Please upload a media photo', 'warning');
                return;
            }
            setIsLoading(true);
            try {
                let imageUrl = form.image;
                if (images.length > 0) {
                    const formData = new FormData();
                    formData.append('file', images[0]);
                    const res = await api.post('/api/gallery/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    imageUrl = res.data.url;
                }
                const payload = { ...form, image: imageUrl, imageAlt: altTexts[0] || form.imageAlt };
                const response = await api.put(`/api/gallery/${isEditing}`, payload);
                if (response.data.success) {
                    Swal.fire({ icon: 'success', title: 'Photo Updated!', timer: 1500, showConfirmButton: false });
                    resetForm();
                    fetchData();
                }
            } catch (error) {
                console.error('Error updating photo:', error);
                Swal.fire('Error', 'Failed to update photo', 'error');
            } finally {
                setIsLoading(false);
            }
        } else {
            // Bulk upload logic
            if (images.length === 0) {
                Swal.fire('Warning', 'Please select at least one media photo', 'warning');
                return;
            }
            setIsLoading(true);
            try {
                const selectedCat = categories.find(c => c._id === form.galleryCategoryId);
                const categoryTitle = selectedCat ? selectedCat.title : "Media";

                const uploadPromises = images.map(async (file, idx) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const uploadRes = await api.post("/api/gallery/upload", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
                    
                    return api.post('/api/gallery', {
                        title: categoryTitle,
                        category: 'press',
                        galleryCategoryId: form.galleryCategoryId,
                        mediaType: 'image',
                        image: uploadRes.data.url,
                        imageAlt: altTexts[idx] || ""
                    });
                });

                await Promise.all(uploadPromises);

                Swal.fire({
                    icon: 'success',
                    title: `${images.length} Media Photos Added!`,
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchData();
            } catch (error) {
                console.error('Error bulk uploading media photos:', error);
                Swal.fire('Error', 'Failed to upload photos', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Media Photo?',
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
            console.error('Error deleting photo:', error);
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (item) => {
        setIsEditing(item._id);
        const catId = item.galleryCategoryId?._id || item.galleryCategoryId || '';
        setForm({
            title: item.title || '',
            category: item.category,
            galleryCategoryId: catId,
            mediaType: item.mediaType,
            image: item.image,
            imageAlt: item.imageAlt || '',
        });
        setImages([]); // Don't put the existing image in the `images` array for editing, use `form.image`
        setAltTexts({ 0: item.imageAlt || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({ ...EMPTY_FORM });
        setImages([]);
        setAltTexts({});
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="MEDIA PHOTO MANAGEMENT"
                description="Manage photos for the press & media section of your gallery"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Add/Edit Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Edit Media Photo' : 'Bulk Media Upload'}
                        </h2>
                        
                        <div className="space-y-4">
                            {/* Category Selection FIRST for bulk upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Media Category *</label>
                                <select
                                    value={form.galleryCategoryId}
                                    onChange={(e) => setForm({ ...form, galleryCategoryId: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#d26019] outline-none shadow-sm text-sm bg-white"
                                    required
                                >
                                    <option value="">Choose Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Multiple Image Upload Area */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    {isEditing ? 'Update Media Image' : 'Select Images to Upload'}
                                </label>
                                
                                {isEditing && form.image && images.length === 0 ? (
                                    <div className="relative h-48 border-2 border-gray-200 overflow-hidden mb-2 bg-gray-50">
                                        <img 
                                            src={`${SERVER_URL}${form.image}`} 
                                            className="w-full h-full object-contain" 
                                            alt="Current" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="text-white text-xs font-bold">Replace by clicking button below</span>
                                        </div>
                                    </div>
                                ) : null}

                                <div 
                                    className="border-2 border-dashed border-gray-300 rounded-sm p-4 bg-gray-50 text-center hover:bg-gray-100 transition-all cursor-pointer group mb-4"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-[#d26019] transition-colors">
                                            <Camera size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-xs font-bold text-gray-700">Click to {isEditing ? 'Change' : 'Upload'} Image{!isEditing && 's'}</h3>
                                            <p className="text-gray-500 text-[9px] uppercase font-black tracking-tighter">MAX 20 IMAGES (JPG, PNG, WEBP)</p>
                                        </div>
                                    </div>
                                    <input 
                                        ref={fileInputRef} 
                                        type="file" 
                                        multiple={!isEditing}
                                        className="hidden" 
                                        onChange={handleImageChange} 
                                        accept="image/*" 
                                    />
                                </div>
                            </div>

                            {/* Previews and Alt Text Section */}
                            {(images.length > 0 || isEditing) && (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {images.map((file, idx) => (
                                        <div key={idx} className="bg-gray-50 border-2 border-gray-200 p-3 rounded-sm relative">
                                            {!isEditing && (
                                                <button 
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 z-10"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 bg-white border border-gray-200 flex-shrink-0 overflow-hidden">
                                                    <img 
                                                        src={URL.createObjectURL(file)} 
                                                        className="w-full h-full object-cover" 
                                                        alt="preview" 
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase truncate w-32">{file.name}</p>
                                                    <input
                                                        type="text"
                                                        placeholder="SEO Alt Text..."
                                                        className="w-full px-3 py-1.5 border-2 border-gray-200 focus:border-[#d26019] outline-none text-xs"
                                                        value={isEditing ? (altTexts[0] || form.imageAlt) : (altTexts[idx] || "")}
                                                        onChange={(e) => handleAltTextChange(isEditing ? 0 : idx, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || (!isEditing && images.length === 0)}
                                    className="flex-1 py-3 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/10"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            UPLOADING...
                                        </>
                                    ) : (
                                        isEditing ? <><Edit className="w-5 h-5" /> Update Photo</> : <><UploadCloud className="w-5 h-5" /> {images.length > 0 ? `Upload ${images.length} Photos` : 'Save Media Photos'}</>
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
                                <Globe className="w-4 h-4 text-[#d26019]" /> Media Gallery List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                                {items.length} PHOTOS
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase w-12 text-center">NO.</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase w-24">IMAGE</th>
                                        <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase">IMAGE DETAILS</th>
                                        <th className="text-center py-3 px-4 text-[10px] font-black text-gray-500 uppercase">LAST UPDATED BY</th>
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
                                                No media photos found.
                                            </td>
                                        </tr>
                                    ) : items.map((item, idx) => (
                                        <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group text-sm">
                                            <td className="py-3 px-4 text-center font-black text-gray-300">{idx + 1}</td>
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
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-[#23471d] uppercase tracking-[0.1em]">
                                                        {item.galleryCategoryId?.title || 'Uncategorized Media'}
                                                    </span>
                                                    <p className="text-xs text-gray-600 font-bold uppercase tracking-tight line-clamp-1">{item.imageAlt || 'Untitled Media Photo'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] text-gray-400">ID: {item._id}</span>
                                                    </div>
                                                </div>
                                            </td>
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
                                                    <button 
                                                        onClick={() => startEdit(item)} 
                                                        className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                                        title="Edit Photo"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(item._id)} 
                                                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                        title="Delete Photo"
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
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d26019;
                    border-radius: 10px;
                }
            ` }} />
        </div>
    );
};

export default MediaGalleryManagement;
