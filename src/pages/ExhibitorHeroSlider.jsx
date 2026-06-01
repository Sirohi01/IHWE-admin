import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Image as ImageIcon, Plus, Trash2, Edit, Save, Package
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_CARD = {
    image: '',
    imageAlt: '',
};

const ExhibitorHeroSlider = () => {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cardForm, setCardForm] = useState({ ...EMPTY_CARD });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/exhibitor-hero-slider');
            if (response.data.success) {
                setImages(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Image Too Large',
                text: 'Image size should not exceed 5MB.',
                confirmButtonColor: '#23471d'
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImage = async () => {
        if (!imageFile) return cardForm.image;
        const formData = new FormData();
        formData.append('image', imageFile);
        const res = await api.post('/api/exhibitor-hero-slider/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) return res.data.imageUrl;
        throw new Error('Image upload failed');
    };

    const handleCardSubmit = async () => {
        if (!imageFile && !cardForm.image) {
            Swal.fire('Warning', 'Image is required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let imageUrl = cardForm.image;
            if (imageFile) {
                imageUrl = await uploadImage();
            }
            const payload = { ...cardForm, image: imageUrl };
            
            const response = await api.post('/api/exhibitor-hero-slider', payload);
            
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Image Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save image', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCard = async (imageId) => {
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
            await api.delete(`/api/exhibitor-hero-slider/${imageId}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setCardForm({ ...EMPTY_CARD });
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="EXHIBITOR HERO SLIDER"
                description="Manage hero section slider images for Exhibitor Dashboard"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            <Plus className="w-5 h-5" />
                            Add New Slider Image
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Slider Image</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-colors p-3 bg-gray-50">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full text-[10px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-bold file:bg-[#23471d] file:text-white hover:file:bg-[#d26019] file:cursor-pointer cursor-pointer uppercase"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Max: 5MB | 1300 x 600 px</p>
                                    </div>

                                    {imagePreview ? (
                                        <div className="relative h-40 group">
                                            <img src={imagePreview} className="w-full h-full object-cover border-2 border-gray-200 shadow-sm" alt="Preview" />
                                            <button
                                                onClick={() => { setImageFile(null); setImagePreview(''); setCardForm({ ...cardForm, image: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-40 bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                                            <ImageIcon className="w-8 h-8 mb-1 opacity-20" />
                                            <p className="text-[10px] font-bold uppercase">No image selected</p>
                                        </div>
                                    )}

                                    <input
                                        type="text"
                                        value={cardForm.imageAlt}
                                        onChange={(e) => setCardForm({ ...cardForm, imageAlt: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                        placeholder="Image Alt Text..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCardSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : <><Plus className="w-4 h-4" /> Add Image</>}
                                </button>
                                {imagePreview && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Package className="w-4 h-4" /> Slider Images List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                {images?.length || 0} IMAGES
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">IMAGE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ALT TEXT</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center">UPDATED BY</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!images?.length ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-gray-400">
                                                No slider images found.
                                            </td>
                                        </tr>
                                    ) : images.map((image, idx) => (
                                        <tr key={image._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                {image.image ? (
                                                    <img src={`${SERVER_URL}${image.image}`} alt={image.imageAlt} className="w-20 h-10 object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-20 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                                        <ImageIcon size={14} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-gray-800 text-sm">{image.imageAlt || 'N/A'}</p>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="font-bold text-red-600 uppercase text-[10px]">{image.updatedBy || 'System'}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleDeleteCard(image._id)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
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

export default ExhibitorHeroSlider;
