import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Type, Save, Plus, Trash2, Edit,
    ShieldCheck, Activity, Box, Monitor, Microscope, Leaf, Plane, Beaker,
    Star, Heart, Globe, Zap, Award, Package, MapPin, Users, Sun, BookOpen, Stethoscope, HelpCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ICONS_LIST = [
    { name: 'Globe', icon: Globe },
    { name: 'Sun', icon: Sun },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Stethoscope', icon: Stethoscope },
    { name: 'Users', icon: Users },
    { name: 'Zap', icon: Zap },
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
    { name: 'Award', icon: Award },
    { name: 'Package', icon: Package },
    { name: 'MapPin', icon: MapPin },
    { name: 'HelpCircle', icon: HelpCircle },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    const Comp = found ? found.icon : HelpCircle;
    return <Comp {...props} />;
};

const EMPTY_CARD = {
    title: '',
    icon: 'Globe',
    desc: ''
};

const WhyAttend = () => {
    const [data, setData] = useState({
        subheading: 'Why Attend?',
        heading: 'Expo Highlights',
        highlightText: 'Highlights',
        cards: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [cardForm, setCardForm] = useState({ ...EMPTY_CARD });
    const [isEditingCard, setIsEditingCard] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/why-attend');
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
            const response = await api.post('/api/why-attend/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightText: data.highlightText
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

    const handleCardSubmit = async () => {
        if (!cardForm.title || !cardForm.desc) {
            Swal.fire('Warning', 'Title and Description are required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let response;
            if (isEditingCard) {
                response = await api.put(`/api/why-attend/cards/${isEditingCard}`, cardForm);
            } else {
                response = await api.post('/api/why-attend/cards', cardForm);
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
            await api.delete(`/api/why-attend/cards/${cardId}`);
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
            icon: card.icon,
            desc: card.desc
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingCard(null);
        setCardForm({ ...EMPTY_CARD });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <PageHeader
                title="WHY ATTEND MANAGEMENT"
                description="Manage section headings and Expo Highlights cards"
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
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
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
                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-2 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Headings
                            </button>
                        </div>
                    </div>

                    {/* Card Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {isEditingCard ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditingCard ? 'Edit Highlight Card' : 'Add New Highlight Card'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Title</label>
                                <input
                                    type="text"
                                    value={cardForm.title}
                                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. 200+ Exhibitors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon</label>
                                <div className="flex gap-2">
                                    <select
                                        value={cardForm.icon}
                                        onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })}
                                        className="flex-1 px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm bg-white"
                                    >
                                        {ICONS_LIST.map(i => (
                                            <option key={i.name} value={i.name}>{i.name}</option>
                                        ))}
                                    </select>
                                    <div className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center shrink-0">
                                        <IconComponent name={cardForm.icon} size={20} className="text-[#23471d]" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Description</label>
                                <textarea
                                    value={cardForm.desc}
                                    onChange={(e) => setCardForm({ ...cardForm, desc: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24 shadow-sm text-sm resize-none"
                                    placeholder="Short description..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCardSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : isEditingCard ? <><Edit className="w-4 h-4" /> Update Highlight</> : <><Plus className="w-4 h-4" /> Add Highlight</>}
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

                {/* RIGHT: Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-[#23471d] px-6 py-4 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
                                <Package className="w-4 h-4 text-[#d26019]" /> Highlights List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                                {data.cards?.length || 0} ITEMS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                                        <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">#</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">CONTENT</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">ICON</th>
                                        <th className="text-center py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {!data.cards?.length ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-20 text-gray-300 font-medium italic">
                                                No highlights added yet. Start by adding one!
                                            </td>
                                        </tr>
                                    ) : data.cards.map((card, idx) => (
                                        <tr key={card._id} className="group hover:bg-gray-50/80 transition-all border-b border-gray-100">
                                            <td className="py-5 px-6 font-bold text-[#23471d] tabular-nums">{idx + 1}</td>
                                            <td className="py-5 px-6">
                                                <p className="font-bold text-gray-800 text-sm">{card.title}</p>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">{card.desc}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3 bg-gray-100 w-fit px-3 py-1.5 ring-1 ring-gray-200">
                                                    <IconComponent name={card.icon} size={14} className="text-[#23471d]" />
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{card.icon}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => startEdit(card)} className="w-8 h-8 bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Edit">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteCard(card._id)} className="w-8 h-8 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Delete">
                                                        <Trash2 size={14} />
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

export default WhyAttend;
