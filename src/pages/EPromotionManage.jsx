import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Type, Save, Plus, Trash2, Edit,
    MessageCircle, Mail, Share2, Globe, Zap, Target, Rocket, Users, Briefcase, Star, Package
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ICONS_LIST = [
    { name: 'MessageCircle', icon: MessageCircle },
    { name: 'Mail', icon: Mail },
    { name: 'Share2', icon: Share2 },
    { name: 'Globe', icon: Globe },
    { name: 'Zap', icon: Zap },
    { name: 'Target', icon: Target },
    { name: 'Rocket', icon: Rocket },
    { name: 'Users', icon: Users },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Star', icon: Star },
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
    icon: 'MessageCircle',
    color: '#23471d'
};

const EPromotionManage = () => {
    const [data, setData] = useState({
        subheading: 'Promotion',
        title: 'Boost Your Brand Before & During the Expo!',
        highlightText: 'During the Expo!',
        shortDescription: '',
        cards: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [cardForm, setCardForm] = useState({ ...EMPTY_CARD });
    const [isEditingCard, setIsEditingCard] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/e-promotion/content');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/e-promotion/content', {
                ...data,
                cards: data.cards
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
        if (!cardForm.title) {
            Swal.fire('Warning', 'Card title is required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let updatedCards = [...data.cards];
            if (isEditingCard !== null) {
                updatedCards[isEditingCard] = cardForm;
            } else {
                if (updatedCards.length >= 4) {
                    Swal.fire('Limit Reached', 'You can only add up to 4 cards', 'warning');
                    setIsLoading(false);
                    return;
                }
                updatedCards.push(cardForm);
            }

            const response = await api.post('/api/e-promotion/content', {
                ...data,
                cards: updatedCards
            });

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditingCard !== null ? 'Card Updated!' : 'Card Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                setData(response.data.data);
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save card', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCard = async (index) => {
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
            const updatedCards = data.cards.filter((_, i) => i !== index);
            const response = await api.post('/api/e-promotion/content', {
                ...data,
                cards: updatedCards
            });
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
                setData(response.data.data);
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (card, index) => {
        setIsEditingCard(index);
        setCardForm({ ...card });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingCard(null);
        setCardForm({ ...EMPTY_CARD });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter tracking-widest text-[11px] font-bold">
            <PageHeader
                title="E-PROMOTION MANAGEMENT"
                description="Manage section headings and e-promotion channel cards"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: lg:col-span-1 */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Section Headings */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#23471d] uppercase tracking-normal">
                            <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-1 uppercase">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-1 uppercase">Main Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData({ ...data, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-[#d26019] mb-1 uppercase">Highlight Text (Orange)</label>
                                <input
                                    type="text"
                                    value={data.highlightText}
                                    onChange={(e) => setData({ ...data, highlightText: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none shadow-sm uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-1 uppercase">Short Description</label>
                                <textarea
                                    value={data.shortDescription}
                                    onChange={(e) => setData({ ...data, shortDescription: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24 shadow-sm normal-case font-normal"
                                />
                            </div>
                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-2.5 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2 uppercase"
                            >
                                <Save className="w-4 h-4" /> Save Headings
                            </button>
                        </div>
                    </div>

                    {/* Card Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#d26019] uppercase tracking-normal">
                            {isEditingCard !== null ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditingCard !== null ? 'Edit Channel Card' : 'Add New Channel Card'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Card Title</label>
                                <input
                                    type="text"
                                    value={cardForm.title}
                                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm uppercase"
                                    placeholder="e.g. Pharmaceuticals Companies"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Description</label>
                                <textarea
                                    value={cardForm.description}
                                    onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-20 shadow-sm normal-case font-normal"
                                    placeholder="Short description..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Icon</label>
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
                                    <div className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center shrink-0 shadow-inner">
                                        <IconComponent name={cardForm.icon} size={20} style={{ color: cardForm.color }} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-2">Accent Color</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCardForm({ ...cardForm, color: '#23471d' })}
                                        className={`flex-1 py-2 text-white text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${cardForm.color === '#23471d' ? 'ring-4 ring-offset-2 ring-[#23471d]' : ''}`}
                                        style={{ backgroundColor: '#23471d' }}
                                    >
                                        ● Green
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCardForm({ ...cardForm, color: '#d26019' })}
                                        className={`flex-1 py-2 text-white text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${cardForm.color === '#d26019' ? 'ring-4 ring-offset-2 ring-[#d26019]' : ''}`}
                                        style={{ backgroundColor: '#d26019' }}
                                    >
                                        ● Orange
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCardSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 uppercase shadow-md"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : isEditingCard !== null ? <><Edit className="w-4 h-4" /> Update Card</> : <><Plus className="w-4 h-4" /> Add Card</>}
                                </button>
                                {isEditingCard !== null && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-[10px] uppercase">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: lg:col-span-2 */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between border-b-2 border-gray-200">
                            <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-normal">
                                <Package className="w-4 h-4" /> Promotion Channel Cards List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest shadow-md">
                                {data.cards?.length || 0} CARDS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-gray-500 uppercase">ICON</th>
                                        <th className="text-left py-3 px-4 text-gray-500 uppercase">TITLE</th>
                                        <th className="text-left py-3 px-4 text-gray-500 uppercase">ACCENT</th>
                                        <th className="text-left py-3 px-4 text-gray-500 uppercase">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!data.cards?.length ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-gray-400 normal-case font-normal">
                                                No promotion channels found. Add your first card using the form.
                                            </td>
                                        </tr>
                                    ) : data.cards.map((card, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-900 font-bold">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                                        <IconComponent name={card.icon} size={16} style={{ color: card.color }} />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 normal-case font-normal">{card.icon}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-red-600 uppercase text-xs">{card.title}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5 normal-case font-normal line-clamp-1 italic">{card.description}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-block w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: card.color }}></span>
                                                    <span className="font-mono text-[10px] text-gray-400 uppercase">{card.color}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => startEdit(card, idx)} className="text-blue-500 hover:text-blue-700 p-1 transition-all hover:scale-110" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteCard(idx)} className="text-red-500 hover:text-red-700 p-1 transition-all hover:scale-110" title="Delete">
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

export default EPromotionManage;
