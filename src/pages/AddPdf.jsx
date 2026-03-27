import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from "../lib/api";
import {
    Upload,
    Trash2,
    Plus,
    Type,
    Save,
    Image as ImageIcon,
    Edit,
    FileText,
    BadgeHelp,
    Hash,
    AlignLeft,
    FileDown
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
// import Table from '../components/table/Table';

const AddPdf = () => {
    const [data, setData] = useState({
        subheading: 'Resources',
        heading: 'Expand Your Business with Health & Wellness',
        highlightTitle: 'Health & Wellness',
        description: 'Download our official reports, brochures, and floor plans to stay informed and plan your participation.',
        cards: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingCard, setIsEditingCard] = useState(null); // ID of the card being edited
    const [cardForm, setCardForm] = useState({
        title: '',
        subtitle: '',
        meta: '',
        badge: '',
        tag: 'PDF',
        image: '',
        imageAlt: '',
        pdf: ''
    });

    // File upload states
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/download-pdf');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching PDF data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/download-pdf/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightTitle: data.highlightTitle,
                description: data.description
            });
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Headings updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update headings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsUploadingImage(true);
            const response = await api.post('/api/download-pdf/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setCardForm({ ...cardForm, image: response.data.url });
                Swal.fire({ icon: 'success', title: 'Uploaded!', text: 'Cover image uploaded', timer: 1000, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
            setIsUploadingImage(false);
            e.target.value = null;
        }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            setIsUploadingPdf(true);
            const response = await api.post('/api/download-pdf/upload-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setCardForm({ ...cardForm, pdf: response.data.url });
                Swal.fire({ icon: 'success', title: 'Uploaded!', text: 'PDF file uploaded', timer: 1000, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to upload PDF', 'error');
        } finally {
            setIsUploadingPdf(false);
            e.target.value = null;
        }
    };

    const handleAddOrUpdateCard = async () => {
        if (!cardForm.title || !cardForm.image || !cardForm.pdf) {
            Swal.fire('Error', 'Title, Image, and PDF are required', 'warning');
            return;
        }

        // Include year in meta or subtitle if provided by user
        const finalCardData = { ...cardForm };

        setIsLoading(true);
        try {
            let response;
            if (isEditingCard) {
                response = await api.put(`/api/download-pdf/cards/${isEditingCard}`, finalCardData);
            } else {
                response = await api.post('/api/download-pdf/cards', finalCardData);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditingCard ? 'Card updated' : 'Card added',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Operation failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCard = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                const response = await api.delete(`/api/download-pdf/cards/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'PDF card has been deleted.', 'success');
                    fetchData();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete card', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = (card) => {
        setIsEditingCard(card._id);
        setCardForm({
            title: card.title,
            subtitle: card.subtitle,
            meta: card.meta,
            badge: card.badge,
            tag: card.tag || 'PDF',
            image: card.image,
            imageAlt: card.imageAlt || '',
            pdf: card.pdf
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingCard(null);
        setCardForm({
            title: '',
            subtitle: '',
            meta: '',
            badge: '',
            tag: 'PDF',
            image: '',
            imageAlt: '',
            pdf: ''
        });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="RESOURCES (PDF) MANAGEMENT"
                description="Manage the downloads section: header content and PDF resource cards"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section: Headings and Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Headings Management */}
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
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Title</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight text-[#d26019]">Highlight Text (Orange)</label>
                                <input
                                    type="text"
                                    value={data.highlightTitle}
                                    onChange={(e) => setData({ ...data, highlightTitle: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none"
                                    placeholder="Enter text from title to highlight..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Short Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24"
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
                            {isEditingCard ? 'Edit PDF Card' : 'Add New PDF Card'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Card Title (e.g. Health & Wellness)</label>
                                <input
                                    type="text"
                                    value={cardForm.title}
                                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Card Subtitle (e.g. 9th International)</label>
                                <input
                                    type="text"
                                    value={cardForm.subtitle}
                                    onChange={(e) => setCardForm({ ...cardForm, subtitle: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Meta / Year (e.g. BROCHURE 2026)</label>
                                <input
                                    type="text"
                                    value={cardForm.meta}
                                    onChange={(e) => setCardForm({ ...cardForm, meta: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Badge Text</label>
                                    <input
                                        type="text"
                                        value={cardForm.badge}
                                        onChange={(e) => setCardForm({ ...cardForm, badge: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                                        placeholder="e.g. View All"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Button Tag</label>
                                    <input
                                        type="text"
                                        value={cardForm.tag}
                                        onChange={(e) => setCardForm({ ...cardForm, tag: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                                        placeholder="e.g. PDF"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Cover Image</label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-colors p-4 flex flex-col items-center gap-2">
                                    {cardForm.image ? (
                                        <div className="relative w-full h-32 border border-gray-200">
                                            <img src={`${SERVER_URL}${cardForm.image}`} className="w-full h-full object-cover" alt="Cover Preview" />
                                            <button 
                                                onClick={() => setCardForm({...cardForm, image: ''})}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    )}
                                    <label className="w-full">
                                        <div className={`w-full py-2 flex items-center justify-center gap-2 text-white text-xs font-bold cursor-pointer transition-colors ${isUploadingImage ? 'bg-gray-400' : 'bg-[#23471d] hover:bg-[#1a3615]'}`}>
                                            {isUploadingImage ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload size={14} /> Choose Image</>}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploadingImage} />
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    value={cardForm.imageAlt}
                                    onChange={(e) => setCardForm({ ...cardForm, imageAlt: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs"
                                    placeholder="Image Alt Text (SEO)..."
                                />
                            </div>

                            {/* PDF Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase">PDF File</label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-[#d26019] transition-colors p-4 flex flex-col items-center gap-2">
                                    {cardForm.pdf ? (
                                        <div className="w-full p-2 bg-orange-50 border border-orange-100 flex items-center gap-2 overflow-hidden">
                                            <FileText className="text-[#d26019] shrink-0" size={16} />
                                            <span className="text-[10px] text-gray-600 truncate flex-1">{cardForm.pdf.split('/').pop()}</span>
                                            <button 
                                                onClick={() => setCardForm({...cardForm, pdf: ''})}
                                                className="text-red-500 hover:bg-red-50 p-1"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <FileText className="w-8 h-8 text-gray-300" />
                                    )}
                                    <label className="w-full">
                                        <div className={`w-full py-2 flex items-center justify-center gap-2 text-white text-xs font-bold cursor-pointer transition-colors ${isUploadingPdf ? 'bg-gray-400' : 'bg-[#d26019] hover:bg-[#b35215]'}`}>
                                            {isUploadingPdf ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload size={14} /> Choose PDF</>}
                                        </div>
                                        <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" disabled={isUploadingPdf} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleAddOrUpdateCard}
                                    disabled={isLoading || isUploadingImage || isUploadingPdf}
                                    className="flex-1 py-2 bg-[#d26019] text-white font-bold hover:bg-[#b35215] transition-colors disabled:opacity-50"
                                >
                                    {isEditingCard ? 'Update Card' : 'Add Card'}
                                </button>
                                {isEditingCard && (
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Cards Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#23471d] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileDown className="w-5 h-5 text-[#d26019]" /> PDF Resource List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                                {data.cards?.length || 0} RESOURCES
                            </span>
                        </div>
                        
                        <div className="table-scroll-wrapper orange-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b">
                                        <th className="px-6 py-4">No.</th>
                                        <th className="px-6 py-4">Cover</th>
                                        <th className="px-6 py-4">Details</th>
                                        <th className="px-6 py-4">Badge/Tag</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {!data.cards || data.cards.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                                                No PDF resources found. Add your first resource using the form on the left.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.cards.map((card, index) => (
                                            <tr key={card._id} className="hover:bg-gray-50 transition-colors border-b">
                                                <td className="px-6 py-4 font-bold text-[#23471d]">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-14 h-10 bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
                                                        <img
                                                            src={`${SERVER_URL}${card.image}`}
                                                            alt={card.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] text-[#d26019] font-bold uppercase tracking-wider">{card.meta}</p>
                                                        <p className="font-bold text-gray-900 text-sm leading-tight">{card.title}</p>
                                                        <p className="text-[11px] text-gray-500 font-medium">{card.subtitle}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="inline-block px-2 py-0.5 bg-green-50 text-[#23471d] text-[10px] font-bold border border-green-100 uppercase text-center rounded">
                                                            {card.badge}
                                                        </span>
                                                        <span className="inline-block px-2 py-0.5 bg-orange-50 text-[#d26019] text-[10px] font-bold border border-orange-100 uppercase text-center rounded">
                                                            {card.tag}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => startEdit(card)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all rounded shadow-sm hover:shadow"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCard(card._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all rounded shadow-sm hover:shadow"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <a 
                                                            href={`${API_URL}${card.pdf}`} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="p-2 text-[#d26019] hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all rounded shadow-sm hover:shadow"
                                                            title="View PDF"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-200 rounded text-xs text-gray-500 flex items-start gap-3">
                        <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-gray-700 mb-1">UI/UX Preview Guidelines:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Badge Text:</strong> Displayed on the blue/green chip in the card list.</li>
                                <li><strong>Button Tag:</strong> The text displayed on the arrow button (default: PDF).</li>
                                <li><strong>Meta:</strong> Displayed in small orange text above the main title.</li>
                                <li><strong>Orange Scrollbar:</strong> The list table uses the custom IHWE theme scrollbar.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPdf;
