import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Layout, Save, Image as ImageIcon, Plus, Trash2, Edit2,
    Link as LinkIcon, Palette, List, ArrowUp, ArrowDown, HelpCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const PartnerCategories = () => {
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [editingIndex, setEditingIndex] = useState(null);
    const [form, setForm] = useState({
        no: '',
        title: '',
        color: '#619941',
        link: '',
        image: '',
        icon: '',
        points: []
    });

    // File Preview States
    const [imagePreview, setImagePreview] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const [newPoint, setNewPoint] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/partner-categories');
            if (response.data.success) {
                setCards(response.data.data.cards || []);
            }
        } catch (error) {
            console.error('Error fetching partner categories:', error);
            Swal.fire('Error', 'Failed to load partner categories & benefits', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAll = async (updatedCards = cards) => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/partner-categories', {
                cards: updatedCards
            });
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sync Successful!',
                    text: 'Changes saved and updated in database.',
                    timer: 1500,
                    showConfirmButton: false
                });
                setCards(response.data.data.cards || []);
            }
        } catch (error) {
            console.error('Save error:', error);
            Swal.fire('Error', 'Failed to save configuration', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- UPLOADS ---
    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Visual preview
        const localUrl = URL.createObjectURL(file);
        if (type === 'image') {
            setImagePreview(localUrl);
        } else {
            setIconPreview(localUrl);
        }

        const formData = new FormData();
        formData.append('image', file);

        setIsLoading(true);
        try {
            const response = await api.post('/api/partner-categories/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setForm(prev => ({ ...prev, [type]: response.data.url }));
                toastSuccess(`${type === 'image' ? 'Background image' : 'Icon'} uploaded to Cloudinary!`);
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to upload file to Cloudinary', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- POINTS MANIPULATION ---
    const handleAddPoint = () => {
        if (!newPoint.trim()) return;
        setForm(prev => ({
            ...prev,
            points: [...prev.points, newPoint.trim()]
        }));
        setNewPoint('');
    };

    const handleRemovePoint = (pIdx) => {
        setForm(prev => ({
            ...prev,
            points: prev.points.filter((_, idx) => idx !== pIdx)
        }));
    };

    const handlePointChange = (pIdx, newVal) => {
        const updatedPoints = [...form.points];
        updatedPoints[pIdx] = newVal;
        setForm(prev => ({ ...prev, points: updatedPoints }));
    };

    // --- CRUD ACTIONS ---
    const handleAddOrUpdateCard = () => {
        if (!form.title || !form.image || !form.icon) {
            return Swal.fire('Warning', 'Title, Background Image, and Icon are all required.', 'warning');
        }

        let newCards = [...cards];

        // Auto-assign order / number if empty
        const finalForm = {
            ...form,
            no: form.no.trim() || String(editingIndex !== null ? editingIndex + 1 : newCards.length + 1).padStart(2, '0')
        };

        if (editingIndex !== null) {
            newCards[editingIndex] = finalForm;
            toastSuccess('Category updated in draft!');
        } else {
            newCards.push(finalForm);
            toastSuccess('New Category added to draft list!');
        }

        setCards(newCards);
        resetForm();
        handleSaveAll(newCards);
    };

    const resetForm = () => {
        setForm({
            no: '',
            title: '',
            color: '#619941',
            link: '',
            image: '',
            icon: '',
            points: []
        });
        setImagePreview(null);
        setIconPreview(null);
        setNewPoint('');
        setEditingIndex(null);
    };

    const handleEditCard = (index) => {
        setEditingIndex(index);
        const card = cards[index];
        setForm({ ...card });

        // Setup previews
        const getFullUrl = (url) => {
            if (!url) return null;
            if (url.startsWith('http') || url.startsWith('/uploads')) {
                return url.startsWith('http') ? url : `${SERVER_URL}${url}`;
            }
            return url;
        };

        setImagePreview(getFullUrl(card.image));
        setIconPreview(getFullUrl(card.icon));

        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleDeleteCard = async (index) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will remove the partner category and all its dynamic benefits forever!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete category!'
        });

        if (result.isConfirmed) {
            const newCards = cards.filter((_, i) => i !== index);
            setCards(newCards);
            handleSaveAll(newCards);
        }
    };

    // Reordering cards
    const moveCard = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === cards.length - 1) return;

        const newCards = [...cards];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap cards
        const temp = newCards[index];
        newCards[index] = newCards[swapIndex];
        newCards[swapIndex] = temp;

        // Auto-refresh numbers based on new order
        const autoNumberedCards = newCards.map((card, i) => ({
            ...card,
            no: String(i + 1).padStart(2, '0')
        }));

        setCards(autoNumberedCards);
        handleSaveAll(autoNumberedCards);
    };

    const toastSuccess = (msg) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: msg,
            showConfirmButton: false,
            timer: 1500
        });
    };

    const formatUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http') || url.startsWith('/uploads')
            ? (url.startsWith('http') ? url : `${SERVER_URL}${url}`)
            : url;
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-poppins">
            <PageHeader
                title="PARTNER CATEGORIES & BENEFITS MANAGER"
                description="Manage IHWE 2026 Partner categories, graphics, colors, landing page routing, and benefits bullet points in real-time."
            />

            {/* LOADING STATE */}
            {isLoading && (
                <div className="py-12 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent" />
                    Syncing with Database...
                </div>
            )}

            <div className="mt-6 flex flex-col lg:flex-row gap-8">
                {/* PARTNERS LISTING */}
                <div className="w-full lg:w-3/5 space-y-6">
                    <div className="bg-slate-900 px-6 py-4 flex justify-between items-center rounded-t-xl">
                        <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                            <Layout size={18} className="text-emerald-500" /> Active Partner Categories ({cards.length})
                        </h2>
                        <span className="text-[10px] text-slate-400 font-medium">Reorder items using arrows</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cards.map((card, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative"
                                style={{ borderTop: `4px solid ${card.color}` }}
                            >
                                {/* Background Banner Preview */}
                                <div
                                    className="h-28 bg-cover bg-center relative"
                                    style={{ backgroundImage: `url(${formatUrl(card.image)})` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    {/* Order Tag */}
                                    <div
                                        className="absolute top-0 left-0 text-white font-black text-xs px-3 py-1.5 rounded-br-xl"
                                        style={{ backgroundColor: card.color }}
                                    >
                                        {card.no}
                                    </div>

                                    {/* Icon Placement */}
                                    <div className="absolute -bottom-5 left-5 w-12 h-12 rounded-full bg-white shadow-md border-2 border-white flex items-center justify-center p-2.5 overflow-hidden">
                                        <img src={formatUrl(card.icon)} alt="" className="w-full h-full object-contain" />
                                    </div>
                                </div>

                                <div className="p-5 pt-8 flex-1 flex flex-col">
                                    <h3 className="text-sm font-black uppercase mb-2 tracking-wide" style={{ color: card.color }}>
                                        {card.title}
                                    </h3>

                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-3">
                                        <LinkIcon size={12} /> {card.link || 'No dynamic route assigned'}
                                    </div>

                                    {/* Benefits bullet points review */}
                                    <div className="flex-1 space-y-1.5 mt-2">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Benefits Outline ({card.points.length})</h4>
                                        <ul className="space-y-1">
                                            {card.points.slice(0, 3).map((pt, pIdx) => (
                                                <li key={pIdx} className="text-[11px] text-slate-600 truncate flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: card.color }} />
                                                    {pt}
                                                </li>
                                            ))}
                                            {card.points.length > 3 && (
                                                <li className="text-[10px] italic text-slate-400 pl-3">+{card.points.length - 3} more advantages...</li>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100">
                                        {/* Reorder Arrows */}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => moveCard(idx, 'up')}
                                                disabled={idx === 0}
                                                className="p-1.5 border border-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                            >
                                                <ArrowUp size={12} />
                                            </button>
                                            <button
                                                onClick={() => moveCard(idx, 'down')}
                                                disabled={idx === cards.length - 1}
                                                className="p-1.5 border border-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                            >
                                                <ArrowDown size={12} />
                                            </button>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleEditCard(idx)}
                                                className="p-2 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCard(idx)}
                                                className="p-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {cards.length === 0 && !isLoading && (
                            <div className="col-span-full py-16 border-2 border-dashed border-slate-200 text-center text-slate-400 italic rounded-2xl bg-slate-50">
                                No active partner categories defined. Create the first one on the right.
                            </div>
                        )}
                    </div>
                </div>

                {/* FORM PANEL */}
                <div className="w-full lg:w-2/5">
                    <div className="bg-white border border-slate-100 p-6 shadow-md rounded-2xl sticky top-6">
                        <h2 className="text-sm font-black uppercase text-slate-900 border-b pb-3 mb-4 flex items-center gap-1.5">
                            <Plus size={16} className="text-emerald-600" /> {editingIndex !== null ? 'Modify Partner Category' : 'Create Partner Category'}
                        </h2>

                        <div className="space-y-4">
                            {/* Graphic Uploads */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Banner Background</label>
                                    <div className="relative h-28 w-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden rounded-xl group">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change Banner</span>
                                        </div>
                                        <input type="file" onChange={(e) => handleFileUpload(e, 'image')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Card Icon</label>
                                    <div className="relative h-28 w-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden rounded-xl group">
                                        {iconPreview ? (
                                            <img src={iconPreview} className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change Icon</span>
                                        </div>
                                        <input type="file" onChange={(e) => handleFileUpload(e, 'icon')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            {/* Text Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Order/Number</label>
                                    <input
                                        type="text"
                                        value={form.no}
                                        onChange={(e) => setForm(prev => ({ ...prev, no: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg outline-none text-xs"
                                        placeholder="e.g. 01 (Auto-gen if empty)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Theme Accent Color</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={form.color}
                                            onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                                            className="w-8 h-8 rounded cursor-pointer border border-slate-200 shrink-0"
                                        />
                                        <input
                                            type="text"
                                            value={form.color}
                                            onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                                            className="w-full px-2 py-1.5 border border-slate-200 focus:border-emerald-600 rounded-lg outline-none text-xs uppercase"
                                            placeholder="#619941"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Partner Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg outline-none text-xs font-semibold"
                                    placeholder="e.g. Hotel & Stay Partner"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dynamic Routing Path (Benefits Page Link)</label>
                                <input
                                    type="text"
                                    value={form.link}
                                    onChange={(e) => setForm(prev => ({ ...prev, link: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg outline-none text-xs"
                                    placeholder="e.g. /hotel-stay-partner"
                                />
                            </div>

                            {/* Bullet Points Section */}
                            <div className="border-t border-slate-100 pt-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                                    Benefits Bullet Points List ({form.points.length})
                                </label>

                                {/* Points List Editor */}
                                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 mb-3">
                                    {form.points.map((pt, pIdx) => (
                                        <div key={pIdx} className="flex gap-2 items-center bg-slate-50 p-2 border border-slate-100 rounded-lg">
                                            <input
                                                type="text"
                                                value={pt}
                                                onChange={(e) => handlePointChange(pIdx, e.target.value)}
                                                className="flex-1 bg-white px-2 py-1 border border-slate-200 rounded outline-none text-xs"
                                            />
                                            <button
                                                onClick={() => handleRemovePoint(pIdx)}
                                                className="p-1 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all shrink-0"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {form.points.length === 0 && (
                                        <p className="text-[10px] text-slate-400 italic text-center py-4 bg-slate-50 border rounded-lg">
                                            No benefit points added yet. Use the tool below to add.
                                        </p>
                                    )}
                                </div>

                                {/* Add New Point Tool */}
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={newPoint}
                                        onChange={(e) => setNewPoint(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddPoint(); }}
                                        className="flex-1 px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg outline-none text-xs"
                                        placeholder="Add an advantage/benefit..."
                                    />
                                    <button
                                        onClick={handleAddPoint}
                                        className="px-3.5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg transition-all"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Save Actions */}
                            <div className="flex gap-2.5 pt-4 border-t border-slate-100">
                                <button
                                    onClick={handleAddOrUpdateCard}
                                    className="flex-1 py-3 bg-slate-950 text-white font-bold uppercase tracking-widest text-[10px] rounded-lg flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-all shadow-md"
                                >
                                    <Save size={14} /> {editingIndex !== null ? 'Modify Category' : 'Save Category'}
                                </button>
                                {editingIndex !== null && (
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerCategories;
