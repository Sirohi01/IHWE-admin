import { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from "../lib/api";
import {
    Upload,
    Trash2,
    Plus,
    Type,
    Heading,
    Save,
    Trash,
    Image as ImageIcon,
    Edit,
    Check,
    Briefcase,
    Package,
    X,
    Eye,
    Layout,
    Globe,
    Building2,
    Users,
    Settings,
    ShieldCheck,
    PenTool,
    Search,
    Megaphone,
    Code,
    ShoppingBag
} from 'lucide-react';
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';


const ICONS_LIST = [
    { name: 'Package', icon: Package },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Layout', icon: Layout },
    { name: 'Globe', icon: Globe },
    { name: 'Building2', icon: Building2 },
    { name: 'Users', icon: Users },
    { name: 'Settings', icon: Settings },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'PenTool', icon: PenTool },
    { name: 'Search', icon: Search },
    { name: 'Megaphone', icon: Megaphone },
    { name: 'Code', icon: Code },
    { name: 'ShoppingBag', icon: ShoppingBag }
];

const WhatWeDo = () => {
    const [data, setData] = useState({
        subheading: 'WHAT WE DO',
        heading: 'Our Expertise',
        highlightText: '',
        description: '',
        cards: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCardId, setCurrentCardId] = useState(null);

    const [cardForm, setCardForm] = useState({
        title: '',
        icon: 'Package',
        altText: '',
        descriptionHtml: '',
        features: ['', '', '', ''],
        buttonText: 'Learn More',
        buttonUrl: '#',
        image: null
    });

    const [cardImagePreview, setCardImagePreview] = useState(null);
    const cardEditorRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/what-we-do');
            if (response.data.success && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching What We Do data:', error);
            Swal.fire('Error', 'Failed to fetch section data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGlobalSubmit = async (e) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            const response = await api.post('/api/what-we-do/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightText: data.highlightText,
                description: data.description
            });

            if (response.data.success) {
                Swal.fire('Success', 'Section content updated successfully!', 'success');
                fetchData();
            }
        } catch (error) {
            console.error('Error saving headings:', error);
            Swal.fire('Error', 'Failed to update section content', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCardImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCardForm(prev => ({ ...prev, image: file }));
            setCardImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...cardForm.features];
        newFeatures[index] = value;
        setCardForm(prev => ({ ...prev, features: newFeatures }));
    };

    const resetCardForm = () => {
        setCardForm({
            title: '',
            icon: 'Package',
            altText: '',
            descriptionHtml: '',
            features: ['', '', '', ''],
            buttonText: 'Learn More',
            buttonUrl: '#',
            image: null
        });
        setCardImagePreview(null);
        if (cardEditorRef.current) cardEditorRef.current.innerHTML = '';
        setEditMode(false);
        setCurrentCardId(null);
    };

    const openAddForm = () => {
        resetCardForm();
        setEditMode(false);
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const openEditForm = (card) => {
        setEditMode(true);
        setCurrentCardId(card._id);
        setCardForm({
            title: card.title,
            icon: card.icon || 'Package',
            altText: card.altText,
            descriptionHtml: card.descriptionHtml,
            features: card.features.length >= 4 ? card.features : [...card.features, ...Array(4 - card.features.length).fill('')],
            buttonText: card.buttonText,
            buttonUrl: card.buttonUrl,
            image: null
        });
        setCardImagePreview(card.image ? (card.image.startsWith('http') ? card.image : `${SERVER_URL}${card.image}`) : null);
        setShowForm(true);

        setTimeout(() => {
            if (cardEditorRef.current) {
                cardEditorRef.current.innerHTML = card.descriptionHtml || '';
            }
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleCardSubmit = async () => {
        if (!cardForm.title || (!editMode && !cardForm.image)) {
            Swal.fire('Error', 'Title and Image are required', 'error');
            return;
        }

        setIsActionLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', cardForm.title);
            formData.append('icon', cardForm.icon);
            formData.append('altText', cardForm.altText);
            formData.append('descriptionHtml', cardForm.descriptionHtml);
            formData.append('features', JSON.stringify(cardForm.features.filter(f => f.trim() !== '')));
            formData.append('buttonText', cardForm.buttonText);
            formData.append('buttonUrl', cardForm.buttonUrl);

            if (cardForm.image) {
                formData.append('image', cardForm.image);
            }

            let response;
            if (editMode) {
                response = await api.put(`/api/what-we-do/cards/${currentCardId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/api/what-we-do/cards', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                Swal.fire('Success', editMode ? 'Card updated successfully' : 'Card added successfully', 'success');
                setShowForm(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error saving card:', error);
            Swal.fire('Error', 'Failed to save card', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteCard = async (card) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete "${card.title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/what-we-do/cards/${card._id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Card has been deleted.', 'success');
                    fetchData();
                }
            } catch (error) {
                console.error('Error deleting card:', error);
                Swal.fire('Error', 'Failed to delete card', 'error');
            }
        }
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        cardEditorRef.current?.focus();
    };

    const handleEditorInput = () => {
        setCardForm(prev => ({
            ...prev,
            descriptionHtml: cardEditorRef.current?.innerHTML || "",
        }));
    };

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (row, index) => <div className="font-semibold">{index + 1}</div>
        },
        {
            key: "image",
            label: "IMAGE",
            render: (row) => (
                <img
                    src={`${SERVER_URL}${row.image}`}
                    alt={row.title}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                />
            )
        },
        {
            key: "title",
            label: "TITLE",
            render: (row) => <div className="font-medium text-gray-800">{row.title}</div>
        },
        {
            key: "icon",
            label: "ICON",
            render: (row) => {
                const iconObj = ICONS_LIST.find(i => i.name === row.icon);
                const IconComp = iconObj ? iconObj.icon : Package;
                return (
                    <div className="flex items-center gap-2 text-gray-600">
                        <IconComp className="w-4 h-4" />
                        <span className="text-sm">{row.icon}</span>
                    </div>
                );
            }
        },
        {
            key: "features",
            label: "FEATURES",
            render: (row) => (
                <div className="text-xs text-gray-500">
                    {row.features.length} Features
                </div>
            )
        }
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="WHAT WE DO MANAGEMENT"
                description="Manage Expertise section and service cards"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Global Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded">
                                <Layout className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">Section Content</h2>
                        </div>

                        <form onSubmit={handleGlobalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Main Heading</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Highlight Text</label>
                                <input
                                    type="text"
                                    value={data.highlightText}
                                    onChange={(e) => setData({ ...data, highlightText: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Short Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isActionLoading}
                                className="w-full py-2.5 bg-[#9E2A3A] text-white font-semibold rounded hover:bg-[#80222F] transition-colors flex items-center justify-center gap-2 uppercase text-xs shadow-sm"
                            >
                                <Save className="w-4 h-4" />
                                {isActionLoading ? 'Saving...' : 'Save Section Content'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Cards Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Card Management Form */}
                    {showForm && (
                        <div ref={formRef} className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-semibold text-[#1e3a8a] uppercase tracking-tight">
                                    {editMode ? 'Edit Service Card' : 'Add New Service Card'}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Form Left Side */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Card Title *</label>
                                        <input
                                            type="text"
                                            value={cardForm.title}
                                            onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-gray-800"
                                            placeholder="Retail Display Merchandising"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Select Icon</label>
                                            <select
                                                value={cardForm.icon}
                                                onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded bg-white text-sm font-medium"
                                            >
                                                {ICONS_LIST.map(icon => (
                                                    <option key={icon.name} value={icon.name}>{icon.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Image Alt Text</label>
                                            <input
                                                type="text"
                                                value={cardForm.altText}
                                                onChange={(e) => setCardForm({ ...cardForm, altText: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded text-sm"
                                                placeholder="SEO Description"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider tracking-widest">Features (Key Points)</label>
                                        <div className="space-y-2">
                                            {cardForm.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                                                    <input
                                                        type="text"
                                                        value={feature}
                                                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-100 focus:border-[#134698] outline-none rounded text-sm font-medium bg-gray-50/30"
                                                        placeholder={`Point ${idx + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-1">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Button Label</label>
                                            <input
                                                type="text"
                                                value={cardForm.buttonText}
                                                onChange={(e) => setCardForm({ ...cardForm, buttonText: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded text-sm font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Target URL</label>
                                            <input
                                                type="text"
                                                value={cardForm.buttonUrl}
                                                onChange={(e) => setCardForm({ ...cardForm, buttonUrl: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded text-sm text-gray-500 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Right Side */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest">Card Hero Image *</label>
                                        <div className="border border-dashed border-gray-300 p-4 text-center relative group min-h-[140px] flex items-center justify-center bg-gray-50/30 rounded-lg hover:border-[#1e3a8a] transition-colors overflow-hidden">
                                            <input
                                                type="file"
                                                onChange={handleCardImageChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                accept="image/*"
                                            />
                                            {cardImagePreview ? (
                                                <div className="relative w-full">
                                                    <img src={cardImagePreview} alt="Preview" className="w-full h-32 object-cover rounded shadow-sm" />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                                        <span className="text-white text-xs font-bold uppercase tracking-wider">Change Image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-4">
                                                    <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Click to upload card media</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider tracking-widest flex items-center gap-2">
                                            <Type className="w-3.5 h-3.5" />
                                            Main Description Editor
                                        </label>
                                        <div className="border border-gray-200 rounded overflow-hidden shadow-inner bg-white">
                                            <div className="bg-gray-50 p-1.5 border-b flex flex-wrap gap-1">
                                                <button type="button" onClick={() => execCommand('bold')} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded font-bold border border-gray-200 text-xs shadow-sm bg-white">B</button>
                                                <button type="button" onClick={() => execCommand('italic')} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded italic border border-gray-200 text-xs shadow-sm bg-white">I</button>
                                                <button type="button" onClick={() => execCommand('underline')} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded underline border border-gray-200 text-xs shadow-sm bg-white">U</button>
                                                <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                                <button type="button" onClick={() => execCommand('insertUnorderedList')} className="px-2 h-8 flex items-center justify-center hover:bg-white rounded border border-gray-200 text-[10px] font-bold shadow-sm bg-white">UL</button>
                                                <button type="button" onClick={() => execCommand('insertOrderedList')} className="px-2 h-8 flex items-center justify-center hover:bg-white rounded border border-gray-200 text-[10px] font-bold shadow-sm bg-white">OL</button>
                                                <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                                <select
                                                    onChange={(e) => execCommand('fontSize', e.target.value)}
                                                    className="h-8 border border-gray-200 text-[10px] font-bold px-1.5 bg-white rounded"
                                                >
                                                    <option value="3">Normal</option>
                                                    <option value="4">Large</option>
                                                    <option value="5">XL</option>
                                                </select>
                                            </div>
                                            <div
                                                ref={cardEditorRef}
                                                contentEditable
                                                onInput={handleEditorInput}
                                                className="min-h-[160px] p-4 focus:outline-none text-sm text-gray-700 bg-white overflow-y-auto leading-relaxed"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2 border border-gray-300 font-semibold text-gray-500 hover:bg-white rounded transition-all uppercase text-[10px] tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCardSubmit}
                                    disabled={isActionLoading}
                                    className="px-8 py-2 bg-[#1e3a8a] text-white font-semibold rounded hover:bg-[#162a63] transition-all shadow flex items-center gap-2 uppercase text-[10px] tracking-widest disabled:opacity-50"
                                >
                                    {isActionLoading ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : <Check className="w-4 h-4" />}
                                    {editMode ? 'Update Changes' : 'Publish Card'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cards List Table */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#1e3a8a] flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Service Cards</h2>
                                <p className="text-[10px] text-blue-100 uppercase mt-0.5 font-medium">{data.cards.length} Items Listed</p>
                            </div>
                            {!showForm && (
                                <button
                                    onClick={openAddForm}
                                    className="px-4 py-1.5 bg-white text-[#1e3a8a] font-semibold text-[10px] uppercase rounded flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add New Card
                                </button>
                            )}
                        </div>
                        <div className="p-4">
                            {isLoading ? (
                                <div className="py-20 flex justify-center">
                                    <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <Table
                                    columns={columns}
                                    data={data.cards}
                                    onEdit={openEditForm}
                                    onDelete={handleDeleteCard}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                [contenteditable] ul {
                    list-style-type: disc !important;
                    padding-left: 20px !important;
                    margin: 8px 0 !important;
                }
                [contenteditable] ol {
                    list-style-type: decimal !important;
                    padding-left: 20px !important;
                    margin: 8px 0 !important;
                }
                [contenteditable]:focus {
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default WhatWeDo;
