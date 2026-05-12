import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Type, Save, Image as ImageIcon, Plus, Trash2, Edit,
    Quote, MapPin, Building, Package, ExternalLink
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_CARD = {
    quote: '',
    companyName1: '',
    companyName2: '',
    location: '',
    order: 0,
    image: '',
    imageAlt: '',
};

const ExhibitorTestimonialsManagement = () => {
    const [data, setData] = useState({
        heading: 'What Our Exhibitors Say',
        cards: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [cardForm, setCardForm] = useState({ ...EMPTY_CARD });
    const [isEditingCard, setIsEditingCard] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/exhibitor-testimonials');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching exhibitor testimonials:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/exhibitor-testimonials/headings', {
                heading: data.heading
            });
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Headings Saved!', timer: 1500, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save headings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 500 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Image Too Large',
                text: 'Image size should not exceed 500KB.',
                confirmButtonColor: '#071056'
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
        const res = await api.post('/api/exhibitor-testimonials/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) return res.data.imageUrl;
        throw new Error('Image upload failed');
    };

    const handleCardSubmit = async () => {
        if (!cardForm.companyName1 || !cardForm.quote || !cardForm.location) {
            Swal.fire('Warning', 'Company Name, Quote and Location are required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let imageUrl = cardForm.image;
            if (imageFile) {
                imageUrl = await uploadImage();
            }
            const payload = { ...cardForm, image: imageUrl };
            let response;
            if (isEditingCard) {
                response = await api.put(`/api/exhibitor-testimonials/cards/${isEditingCard}`, payload);
            } else {
                response = await api.post('/api/exhibitor-testimonials/cards', payload);
            }
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditingCard ? 'Testimonial Updated!' : 'Testimonial Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save testimonial', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        const result = await Swal.fire({
            title: 'Delete Testimonial?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/exhibitor-testimonials/cards/${cardId}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (card) => {
        setIsEditingCard(card._id);
        setCardForm({
            quote: card.quote,
            companyName1: card.companyName1,
            companyName2: card.companyName2 || '',
            location: card.location,
            order: card.order || 0,
            image: card.image,
            imageAlt: card.imageAlt || '',
        });
        setImagePreview(card.image ? `${SERVER_URL}${card.image}` : '');
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingCard(null);
        setCardForm({ ...EMPTY_CARD });
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="EXHIBITOR TESTIMONIALS MANAGEMENT"
                description="Manage exhibitor reviews and section headings for Why Exhibit page"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* Section Headings */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#071056]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Title</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#071056] outline-none shadow-sm"
                                />
                            </div>
                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-3 bg-[#071056] text-white font-bold hover:bg-[#050b3d] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mt-2"
                            >
                                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    : <><Save className="w-5 h-5" /> Save Section Content</>}
                            </button>
                        </div>
                    </div>

                    {/* Card Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {isEditingCard ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditingCard ? 'Edit Testimonial' : 'Add New Testimonial'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Exhibitor Image</label>
                                <div className="grid grid-cols-1 gap-4">
                                     <div className="border-2 border-dashed border-gray-300 hover:border-[#071056] transition-colors p-3 bg-gray-50">
                                         <input
                                             type="file"
                                             ref={fileInputRef}
                                             accept="image/*"
                                             onChange={handleImageChange}
                                             className="w-full text-[10px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-bold file:bg-[#071056] file:text-white hover:file:bg-[#d26019] file:cursor-pointer cursor-pointer uppercase"
                                         />
                                         <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Max: 500KB</p>
                                     </div>

                                     {imagePreview ? (
                                         <div className="relative h-40 group">
                                             <img src={imagePreview} className="w-full h-full object-cover border-2 border-gray-200 shadow-sm rounded-lg" alt="Preview" />
                                             <button
                                                 onClick={() => { setImageFile(null); setImagePreview(''); setCardForm({ ...cardForm, image: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                 className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                                             >
                                                 <Trash2 size={14} />
                                             </button>
                                         </div>
                                     ) : (
                                         <div className="w-full h-40 bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 rounded-lg">
                                             <ImageIcon className="w-8 h-8 mb-1 opacity-20" />
                                             <p className="text-[10px] font-bold uppercase">No image selected</p>
                                         </div>
                                     )}

                                     <input
                                         type="text"
                                         value={cardForm.imageAlt}
                                         onChange={(e) => setCardForm({ ...cardForm, imageAlt: e.target.value })}
                                         className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#071056] outline-none text-xs shadow-sm bg-white font-bold"
                                         placeholder="Image Alt Text..."
                                     />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name (Line 1)*</label>
                                <input
                                    type="text"
                                    value={cardForm.companyName1}
                                    onChange={(e) => setCardForm({ ...cardForm, companyName1: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#071056] outline-none shadow-sm font-bold"
                                    placeholder="e.g. NutriLife Pvt. Ltd."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name (Line 2) - Optional</label>
                                <input
                                    type="text"
                                    value={cardForm.companyName2}
                                    onChange={(e) => setCardForm({ ...cardForm, companyName2: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#071056] outline-none shadow-sm font-bold"
                                    placeholder="e.g. CEO / Director"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location (e.g. Dubai, UAE)*</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={cardForm.location}
                                        onChange={(e) => setCardForm({ ...cardForm, location: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#071056] outline-none shadow-sm font-bold"
                                        placeholder="e.g. Dubai, UAE"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Testimonial Quote*</label>
                                <textarea
                                    value={cardForm.quote}
                                    onChange={(e) => setCardForm({ ...cardForm, quote: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#071056] outline-none h-32 shadow-sm font-medium"
                                    placeholder="What did they say?"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Order</label>
                                <input
                                    type="number"
                                    value={cardForm.order}
                                    onChange={(e) => setCardForm({ ...cardForm, order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#071056] outline-none shadow-sm font-bold"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleCardSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-[#d26019] text-white font-black hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest shadow-lg"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : isEditingCard ? <><Edit className="w-4 h-4" /> Save changes</> : <><Plus className="w-4 h-4" /> Save Testimonial</>}
                                </button>
                                {isEditingCard && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm uppercase">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#071056] px-5 py-4 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider">
                                <Quote className="w-4 h-4 text-[#d26019]" /> Testimonials List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest rounded-full shadow-inner">
                                {data.cards?.length || 0} REVIEWS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase w-10">ORD.</th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">EXHIBITOR</th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">QUOTE</th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase text-center">UPDATED BY</th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!data.cards?.length ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest italic">
                                                No exhibitor testimonials found.
                                            </td>
                                        </tr>
                                    ) : [...data.cards].sort((a,b) => a.order - b.order).map((card, idx) => (
                                        <tr key={card._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                                            <td className="py-4 px-4 text-gray-400 font-black">{card.order}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    {card.image ? (
                                                        <img src={`${SERVER_URL}${card.image}`} alt={card.imageAlt} className="w-12 h-12 object-cover border-2 border-gray-100 rounded-full shadow-sm" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 rounded-full shadow-inner">
                                                            <ImageIcon size={16} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-black text-[#071056] text-xs leading-tight">{card.companyName1}</p>
                                                        <p className="text-[10px] text-[#d26019] font-bold mt-1 uppercase tracking-tighter flex items-center gap-1">
                                                            <MapPin size={8} /> {card.location}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 max-w-xs">
                                                <p className="text-xs text-gray-600 line-clamp-2 italic">"{card.quote}"</p>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-bold text-red-600 uppercase text-[9px] bg-red-50 px-2 py-1 rounded border border-red-100">{card.updatedBy || 'System'}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => startEdit(card)} className="text-blue-500 hover:text-blue-700 p-1.5 transition-all hover:bg-blue-50 rounded-lg shadow-sm hover:shadow-md">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteCard(card._id)} className="text-red-500 hover:text-red-700 p-1.5 transition-all hover:bg-red-50 rounded-lg shadow-sm hover:shadow-md">
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
                    
                    <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-100 rounded-lg flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-full">
                            <ExternalLink className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-900 uppercase">Live Preview</p>
                            <p className="text-[11px] text-blue-700">These testimonials will appear in the "Why Exhibit" page marquee.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExhibitorTestimonialsManagement;
