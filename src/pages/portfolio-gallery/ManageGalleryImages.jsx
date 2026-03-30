import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Save, Image as ImageIcon, Trash2, Edit,
    ChevronLeft, LayoutGrid, Camera
} from 'lucide-react';
import api, { SERVER_URL } from '../../lib/api';
import PageHeader from '../../components/PageHeader';

const EMPTY_FORM = {
    _id: '',
    imageAlt: '',
    image: ''
};

const ManageGalleryImages = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { categoryTitle } = location.state || {};
    
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (!categoryTitle) {
            Swal.fire('Error', 'No category selected', 'error');
            navigate('/gallery-list');
            return;
        }
        fetchImages();
    }, [categoryTitle]);

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            // Fetch images filtered by title
            const res = await api.get(`/api/gallery?title=${encodeURIComponent(categoryTitle)}`);
            if (res.data.success) {
                setImages(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch images', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (img) => {
        setIsEditing(true);
        setForm({
            _id: img._id,
            imageAlt: img.imageAlt || '',
            image: img.image
        });
        setImagePreview(`${SERVER_URL}${img.image}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Image?',
            text: 'This image will be permanently removed from the category.',
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
            if (isEditing && form._id === id) resetForm();
            fetchImages();
        } catch (err) {
            Swal.fire('Error', 'Failed to delete image', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!isEditing) return;
        setIsLoading(true);
        try {
            const res = await api.put(`/api/gallery/${form._id}`, {
                imageAlt: form.imageAlt
            });
            if (res.data.success) {
                Swal.fire({ icon: 'success', title: 'Updated!', timer: 1200, showConfirmButton: false });
                resetForm();
                fetchImages();
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to update image', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ ...EMPTY_FORM });
        setIsEditing(false);
        setImagePreview('');
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <PageHeader
                    title={`MANAGE IMAGES: ${categoryTitle}`}
                    description={`Edit alt texts or delete individual images from this category`}
                />
                <button
                    onClick={() => navigate('/gallery-list')}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#1e3a8a] font-bold text-xs uppercase transition-colors"
                >
                    <ChevronLeft size={16} /> Back to Galleries
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: EDIT FORM */}
                <div className="lg:col-span-1">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm sticky top-6">
                        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#d26019]">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                            {isEditing ? 'Edit Image Meta' : 'Select an Image'}
                        </h2>

                        {!isEditing ? (
                            <div className="text-center py-10 text-gray-400 italic text-sm">
                                Click the edit icon on any image in the table to start editing its alt text.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="h-48 border-2 border-gray-200 rounded-lg overflow-hidden relative group">
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Preview</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        SEO Alt Text
                                    </label>
                                    <textarea
                                        value={form.imageAlt}
                                        onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24 shadow-sm text-sm"
                                        placeholder="Enter descriptive alt text for SEO..."
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex-1 py-2.5 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Update Meta
                                    </button>
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-6 pt-6 border-t border-gray-100">
                             <button
                                onClick={() => navigate('/add-gallery-images', { state: { categoryId: categoryTitle, categoryTitle } })}
                                className="w-full py-3 border-2 border-dashed border-[#d26019] text-[#d26019] font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-2 text-xs uppercase"
                            >
                                <ImageIcon size={14} /> Add More Images
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: IMAGES TABLE */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#1e3a8a] px-5 py-3 flex items-center justify-between font-bold">
                            <h2 className="text-white flex items-center gap-2 text-sm">
                                <LayoutGrid className="w-4 h-4" /> Collection Images ({images.length})
                            </h2>
                            <span className="bg-white text-[#1e3a8a] text-[10px] px-3 py-1 uppercase tracking-widest rounded shadow-sm">
                                {categoryTitle}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">IMAGE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ALT TEXT (SEO)</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && images.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-20">
                                                <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : !images.length ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-20 text-gray-400 italic">
                                                No images found in this category.
                                            </td>
                                        </tr>
                                    ) : images.map((img, idx) => (
                                        <tr key={img._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${form._id === img._id ? 'bg-orange-50 border-l-4 border-l-[#d26019]' : ''}`}>
                                            <td className="py-4 px-4 text-gray-400 font-bold">{idx + 1}</td>
                                            <td className="py-4 px-4">
                                                <img
                                                    src={`${SERVER_URL}${img.image}`}
                                                    className="w-20 h-14 object-cover rounded shadow-sm border border-gray-200"
                                                    alt={img.imageAlt}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="max-w-[300px]">
                                                    <p className={`text-xs ${img.imageAlt ? 'text-gray-700' : 'text-gray-300 italic'}`}>
                                                        {img.imageAlt || 'No alt text provided'}
                                                    </p>
                                                    <span className="text-[9px] text-gray-400 mt-1 block uppercase font-medium tracking-tighter">
                                                        ID: {img._id}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(img)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Alt Text"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(img._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Image"
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

export default ManageGalleryImages;
