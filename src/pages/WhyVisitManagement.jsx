import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Type, Save, Image as ImageIcon, Plus, Trash2, Edit,
    ShieldCheck, Activity, Box, Monitor, Microscope, Leaf, Plane, Beaker,
    Star, Heart, Globe, Zap, Award, Package, MapPin, Users, Handshake, Lightbulb, Search, BookOpen
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
    { name: 'Handshake', icon: Handshake },
    { name: 'Lightbulb', icon: Lightbulb },
    { name: 'Search', icon: Search },
    { name: 'BookOpen', icon: BookOpen },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return null;
    const Comp = found.icon;
    return <Comp {...props} />;
};

const EMPTY_CARD = {
    title: '',
    description: '',
    icon: 'Users',
    image: '',
    imageAlt: '',
    accent: '#23471d',
    buttonName: 'Learn More',
    buttonLink: '/visitor-registration'
};

const WhyVisitManagement = () => {
    const [data, setData] = useState({
        subheading: 'Empower Your Journey',
        heading: 'Discover Why You Should Join Us',
        highlightText: 'Join Us',
        shortDescription: 'Join IHWE 2026 to experience the latest innovations and build lasting connections. okh!',
        reasons: []
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
            const response = await api.get('/api/why-visit');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/why-visit/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightText: data.highlightText,
                shortDescription: data.shortDescription
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
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImage = async () => {
        if (!imageFile) return cardForm.image;
        const formData = new FormData();
        formData.append('image', imageFile);
        const res = await api.post('/api/why-visit/image', formData, {
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
        setIsLoading(true);
        try {
            let imageUrl = cardForm.image;
            if (imageFile) {
                imageUrl = await uploadImage();
            }
            const payload = { ...cardForm, image: imageUrl };
            let response;
            if (isEditingCard) {
                response = await api.put(`/api/why-visit/reasons/${isEditingCard}`, payload);
            } else {
                response = await api.post('/api/why-visit/reasons', payload);
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
            text: "This action cannot be undone. okh!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/why-visit/reasons/${cardId}`);
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
        setCardForm({ ...card });
        setImagePreview(card.image || '');
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
                title="WHY VISIT MANAGEMENT"
                description="Manage section headings and visitor reason cards dynamically. okh!"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
                        </h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Subheading (Empower...)', key: 'subheading' },
                                { label: 'Main Title (Discover...)', key: 'heading' },
                                { label: 'Highlight Text (Orange)', key: 'highlightText', isOrange: true }
                            ].map(field => (
                                <div key={field.key}>
                                    <label className={`block text-sm font-bold mb-1 uppercase tracking-tight ${field.isOrange ? 'text-[#d26019]' : 'text-gray-700'}`}>{field.label}</label>
                                    <input
                                        type="text"
                                        value={data[field.key]}
                                        onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                                        className={`w-full px-4 py-2 border-2 outline-none shadow-sm ${field.isOrange ? 'border-[#d26019]' : 'border-gray-300'} focus:border-[#23471d]`}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Short Description</label>
                                <textarea
                                    value={data.shortDescription}
                                    onChange={(e) => setData({ ...data, shortDescription: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24 shadow-sm"
                                />
                            </div>
                            <button onClick={handleHeadingSave} disabled={isLoading} className="w-full py-2 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Save Headings
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {isEditingCard ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditingCard ? 'Edit Reason Card' : 'Add New Reason Card'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason Title</label>
                                <input type="text" value={cardForm.title} onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea value={cardForm.description} onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-20 shadow-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon</label>
                                    <select value={cardForm.icon} onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm">
                                        {ICONS_LIST.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center justify-center border-2 border-gray-200 mt-5">
                                    <IconComponent name={cardForm.icon} size={20} style={{ color: cardForm.accent }} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Accent Color</label>
                                <div className="flex gap-3">
                                    {['#23471d', '#d26019'].map(c => (
                                        <button key={c} onClick={() => setCardForm({ ...cardForm, accent: c })} className={`flex-1 py-2 text-white text-xs font-bold uppercase ${cardForm.accent === c ? 'ring-4 ring-offset-2' : ''}`} style={{ backgroundColor: c, ringColor: c }}>
                                            {c === '#23471d' ? '● Green' : '● Orange'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Image</label>
                                {imagePreview ? (
                                    <div className="relative h-32 border-2 border-gray-200 overflow-hidden mb-2">
                                        <img src={imagePreview.startsWith('blob:') ? imagePreview : `${SERVER_URL}${imagePreview}`} className="w-full h-full object-cover" />
                                        <button onClick={() => { setImageFile(null); setImagePreview(''); setCardForm({ ...cardForm, image: '' }); }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><Trash2 size={12} /></button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#23471d]">
                                        <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-400">Upload Image. okh!</span>
                                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                                <input type="text" value={cardForm.imageAlt} onChange={(e) => setCardForm({ ...cardForm, imageAlt: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs mt-1" placeholder="Image Alt Text (SEO). okh!" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Button Name</label>
                                    <input type="text" value={cardForm.buttonName} onChange={(e) => setCardForm({ ...cardForm, buttonName: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs" placeholder="e.g. Learn More" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Button Link</label>
                                    <input type="text" value={cardForm.buttonLink} onChange={(e) => setCardForm({ ...cardForm, buttonLink: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs" placeholder="e.g. /visitor-registration" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleCardSubmit} disabled={isLoading} className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 flex items-center justify-center gap-2">
                                    {isEditingCard ? <><Edit className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Card</>}
                                </button>
                                {isEditingCard && <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Package className="w-4 h-4" /> Why Visit Cards List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">{data.reasons?.length || 0} CARDS</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">IMAGE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">TITLE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ICON</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center">LAST UPDATED BY</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ACTIONS</th>
                                    </tr>

                                </thead>
                                <tbody>
                                    {!data.reasons?.length ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">No cards found. okh!</td></tr> : 
                                    data.reasons.map((card, idx) => (
                                        <tr key={card._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                {card.image ? <img src={`${SERVER_URL}${card.image}`} className="w-14 h-10 object-cover rounded border" /> : <div className="w-14 h-10 bg-gray-100 flex items-center justify-center border"><ImageIcon size={14} className="text-gray-400" /></div>}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-gray-800">{card.title}</td>
                                            <td className="py-3 px-4"><div className="flex items-center gap-2"><IconComponent name={card.icon} size={16} style={{ color: card.accent }} /><span className="text-xs text-gray-500">{card.icon}</span></div></td>
                                            <td className="py-3 px-4 text-center">
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
                                            <td className="py-3 px-4 flex gap-2">
<button onClick={() => startEdit(card)} className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button><button onClick={() => handleDeleteCard(card._id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></td>
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

export default WhyVisitManagement;
