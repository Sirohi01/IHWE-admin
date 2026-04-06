import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from "../lib/api";
import {
    Type, Save, Image as ImageIcon, Plus, Trash2, Edit,
    ShieldCheck, Activity, Box, Monitor, Microscope, Leaf, Plane, Beaker,
    Star, Heart, Globe, Zap, Award, Package, MapPin, Users
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ICONS_LIST = [
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'Activity', icon: Activity },
    { name: 'Box', icon: Box },
    { name: 'Monitor', icon: Monitor },
    { name: 'Microscope', icon: Microscope },
    { name: 'Leaf', icon: Leaf },
    { name: 'Plane', icon: Plane },
    { name: 'Beaker', icon: Beaker },
    { name: 'Star', icon: Star },
    { name: 'Heart', icon: Heart },
    { name: 'Globe', icon: Globe },
    { name: 'Zap', icon: Zap },
    { name: 'Award', icon: Award },
    { name: 'Package', icon: Package },
    { name: 'MapPin', icon: MapPin },
    { name: 'Users', icon: Users },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return null;
    const Comp = found.icon;
    return <Comp {...props} />;
};

const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const EMPTY_CARD = {
    title: '',
    description: '',
    icon: 'ShieldCheck',
    image: '',
    imageAlt: '',
    accent: '#23471d'
};

const Services = () => {
    const [data, setData] = useState({
        subheading: 'Specialized Pavilions',
        heading: 'Focused Industry Zones for Business',
        highlightText: 'Industry Zones',
        description: 'Navigating the future of healthcare through dedicated specialized zones, connecting buyers with the right global innovators.',
        mainButtonText: 'Exhibit At India Health 2026',
        mainButtonUrl: '/book-a-stand',
        mainSubText: 'Join 2,500+ exhibiting brands from over 25 countries',
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
            const response = await api.get('/api/featured-services');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/featured-services/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightText: data.highlightText,
                description: data.description,
                mainButtonText: data.mainButtonText,
                mainButtonUrl: data.mainButtonUrl,
                mainSubText: data.mainSubText
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

        // Check file size (100KB = 100 * 1024 bytes)
        if (file.size > 100 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Image Too Large',
                text: 'Image size should not exceed 100KB. Please compress the image (e.g., using TinyPNG or WebP) and try again.',
                confirmButtonColor: '#d26019'
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
        const res = await api.post('/api/featured-services/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) return res.data.imageUrl;
        throw new Error('Image upload failed');
    };

    const handleCardSubmit = async () => {
        if (!cardForm.title) {
            Swal.fire('Warning', 'Card title is required', 'warning');
            return;
        }
        if (countWords(cardForm.description) > 95) {
            Swal.fire('Warning', 'Description cannot exceed 95 words', 'warning');
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
                response = await api.put(`/api/featured-services/cards/${isEditingCard}`, payload);
            } else {
                response = await api.post('/api/featured-services/cards', payload);
            }
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditingCard ? 'Card Updated!' : 'Card Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save card', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        const result = await Swal.fire({
            title: 'Delete Card?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/featured-services/cards/${cardId}`);
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
            title: card.title,
            description: card.description,
            icon: card.icon,
            image: card.image,
            imageAlt: card.imageAlt || '',
            accent: card.accent
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
                title="FEATURED SERVICES MANAGEMENT"
                description="Manage section headings and industry zone service cards"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Headings + Card Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Section Headings */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Heading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Title</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight text-[#d26019]">Highlight Text (Orange)</label>
                                <input
                                    type="text"
                                    value={data.highlightText}
                                    onChange={(e) => setData({ ...data, highlightText: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="Text to highlight in orange..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Short Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24 shadow-sm"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Bottom CTA Management</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#d26019] uppercase mb-1">Button Text</label>
                                        <input
                                            type="text"
                                            value={data.mainButtonText}
                                            onChange={(e) => setData({ ...data, mainButtonText: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#d26019] uppercase mb-1">Button URL</label>
                                        <input
                                            type="text"
                                            value={data.mainButtonUrl}
                                            onChange={(e) => setData({ ...data, mainButtonUrl: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none text-xs"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#d26019] uppercase mb-1">Sub-Text (Brands/Countries)</label>
                                    <input
                                        type="text"
                                        value={data.mainSubText}
                                        onChange={(e) => setData({ ...data, mainSubText: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none text-xs"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-3 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mt-2"
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
                            {isEditingCard ? 'Edit Service Card' : 'Add New Service Card'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Title</label>
                                <input
                                    type="text"
                                    value={cardForm.title}
                                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. Pharmaceuticals Companies"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Description</label>
                                    <span className={`text-[10px] font-bold ${countWords(cardForm.description) > 95 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {countWords(cardForm.description)} / 95 Words
                                    </span>
                                </div>
                                <textarea
                                    value={cardForm.description}
                                    onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                                    className={`w-full px-4 py-2 border-2 ${countWords(cardForm.description) > 95 ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-[#23471d]'} outline-none h-20 shadow-sm transition-colors`}
                                    placeholder="Short description..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon</label>
                                <div className="flex gap-2">
                                    <select
                                        value={cardForm.icon}
                                        onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })}
                                        className="flex-1 px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                    >
                                        {ICONS_LIST.map(i => (
                                            <option key={i.name} value={i.name}>{i.name}</option>
                                        ))}
                                    </select>
                                    <div className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center shrink-0">
                                        <IconComponent name={cardForm.icon} size={20} style={{ color: cardForm.accent }} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Accent Color (Icon & Bottom Bar)</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCardForm({ ...cardForm, accent: '#23471d' })}
                                        className={`flex-1 py-2 text-white text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all ${cardForm.accent === '#23471d' ? 'ring-4 ring-offset-2 ring-[#23471d]' : ''}`}
                                        style={{ backgroundColor: '#23471d' }}
                                    >
                                        ● Green
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCardForm({ ...cardForm, accent: '#d26019' })}
                                        className={`flex-1 py-2 text-white text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all ${cardForm.accent === '#d26019' ? 'ring-4 ring-offset-2 ring-[#d26019]' : ''}`}
                                        style={{ backgroundColor: '#d26019' }}
                                    >
                                        ● Orange
                                    </button>
                                </div>
                            </div>

                            {/* Image Upload - Event Highlights Style */}
                             <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-tight">Card Image</label>
                                <div className="grid grid-cols-1 gap-4">
                                     <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-colors p-3 bg-gray-50">
                                         <input
                                             type="file"
                                             ref={fileInputRef}
                                             accept="image/*"
                                             onChange={handleImageChange}
                                             className="w-full text-[10px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-bold file:bg-[#23471d] file:text-white hover:file:bg-[#d26019] file:cursor-pointer cursor-pointer uppercase tracking-tighter"
                                         />
                                         <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Recommended: 800 x 450 px (16:9) | Max: 100KB</p>
                                     </div>

                                     {imagePreview ? (
                                         <div className="relative h-48 group">
                                             <img src={imagePreview} className="w-full h-full object-cover border-2 border-gray-200 shadow-sm" alt="Preview" />
                                             <div className="absolute top-2 right-2 bg-green-600 text-[10px] text-white px-2 py-0.5 font-black uppercase tracking-widest shadow-md">
                                                 {imageFile ? 'New Image' : 'Current Image'}
                                             </div>
                                             <button
                                                 onClick={() => { setImageFile(null); setImagePreview(''); setCardForm({ ...cardForm, image: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                 className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                                                 title="Remove Image"
                                             >
                                                 <Trash2 size={14} />
                                             </button>
                                         </div>
                                     ) : (
                                         <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                                             <ImageIcon className="w-8 h-8 mb-1 opacity-20" />
                                             <p className="text-[10px] font-bold uppercase tracking-widest">No image selected</p>
                                         </div>
                                     )}

                                     <input
                                         type="text"
                                         value={cardForm.imageAlt}
                                         onChange={(e) => setCardForm({ ...cardForm, imageAlt: e.target.value })}
                                         className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm bg-white"
                                         placeholder="Image Alt Text (SEO)..."
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
                                        : isEditingCard ? <><Edit className="w-4 h-4" /> Update Card</> : <><Plus className="w-4 h-4" /> Add Card</>}
                                </button>
                                {isEditingCard && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Service Cards Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Package className="w-4 h-4" /> Service Cards List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                {data.cards?.length || 0} CARDS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">IMAGE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">TITLE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ICON</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ACCENT</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center">LAST UPDATED BY</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ACTIONS</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {!data.cards?.length ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400">
                                                No service cards found. Add your first card using the form.
                                            </td>
                                        </tr>
                                    ) : data.cards.map((card, idx) => (
                                        <tr key={card._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                {card.image ? (
                                                    <img src={`${SERVER_URL}${card.image}`} alt={card.imageAlt} className="w-14 h-10 object-cover rounded-none border border-gray-200" />
                                                ) : (
                                                    <div className="w-14 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                                        <ImageIcon size={14} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-gray-800 text-sm">{card.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{card.description}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <IconComponent name={card.icon} size={16} style={{ color: card.accent }} />
                                                    <span className="text-xs text-gray-500">{card.icon}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: card.accent }} title={card.accent}></span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="font-bold text-red-600 underline underline-offset-2 uppercase text-[10px]">
                                                        {card.updatedBy || 'System'}
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap text-center">
                                                        {card.updatedAt ? new Date(card.updatedAt).toLocaleString('en-GB', { 
                                                            day: '2-digit', month: 'short', year: 'numeric', 
                                                            hour: '2-digit', minute: '2-digit', hour12: true 
                                                        }) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">

                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => startEdit(card)} className="text-blue-500 hover:text-blue-700 p-1 transition-colors" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteCard(card._id)} className="text-red-500 hover:text-red-700 p-1 transition-colors" title="Delete">
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

export default Services;
