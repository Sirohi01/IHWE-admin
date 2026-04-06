import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
    Type, Save, Plus, Trash2, Edit,
    MessageSquare, Quote, Star, Users, MessageSquareQuote
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_CARD = {
    name: '',
    role: '',
    company: '',
    feedback: '',
    rating: 5
};

const TestimonialsManage = () => {
    const [data, setData] = useState({
        subheading: 'Testimonials',
        heading: 'What Global Leaders Are Saying',
        highlightText: 'Are Saying',
        description: 'Voices of trust from healthcare innovators, clinical experts, and industry pioneers across the globe.',
        cards: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [cardForm, setCardForm] = useState({ ...EMPTY_CARD });
    const [isEditingCard, setIsEditingCard] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/testimonials');
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
            const response = await api.post('/api/testimonials/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightText: data.highlightText,
                description: data.description
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
        if (!cardForm.name || !cardForm.feedback) {
            Swal.fire('Warning', 'Name and feedback are required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let response;
            if (isEditingCard) {
                response = await api.put(`/api/testimonials/cards/${isEditingCard}`, cardForm);
            } else {
                response = await api.post('/api/testimonials/cards', cardForm);
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
            await api.delete(`/api/testimonials/cards/${cardId}`);
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
            name: card.name,
            role: card.role || '',
            company: card.company || '',
            feedback: card.feedback,
            rating: card.rating || 5
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingCard(null);
        setCardForm({ ...EMPTY_CARD });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="TESTIMONIALS MANAGEMENT"
                description="Manage section headings and customer testimonials"
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
                            {isEditingCard ? 'Edit Testimonial' : 'Add New Testimonial'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <input
                                    type="text"
                                    value={cardForm.name}
                                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. Dr. Sarah Mitchell"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Position / Role</label>
                                    <input
                                        type="text"
                                        value={cardForm.role}
                                        onChange={(e) => setCardForm({ ...cardForm, role: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        placeholder="Chief Medical Officer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Organisation</label>
                                    <input
                                        type="text"
                                        value={cardForm.company}
                                        onChange={(e) => setCardForm({ ...cardForm, company: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        placeholder="MedTech Global"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Feedback</label>
                                <textarea
                                    value={cardForm.feedback}
                                    onChange={(e) => setCardForm({ ...cardForm, feedback: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24 shadow-sm"
                                    placeholder="Enter client feedback..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rating</label>
                                <select
                                    value={cardForm.rating}
                                    onChange={(e) => setCardForm({ ...cardForm, rating: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                >
                                    {[5, 4, 3, 2, 1].map(num => (
                                        <option key={num} value={num}>{num} Stars</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleCardSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : isEditingCard ? <><Edit className="w-4 h-4" /> Update Testimonial</> : <><Plus className="w-4 h-4" /> Add Testimonial</>}
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

                {/* RIGHT: Testimonials Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <MessageSquareQuote className="w-4 h-4" /> Testimonials List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                {data.cards?.length || 0} ITEMS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">PROFILE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">CLIENT INFO</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">FEEDBACK</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">RATING</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center">LAST UPDATED BY</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center w-24">ACTIONS</th>
                                    </tr>

                                </thead>
                                <tbody>
                                    {!data.cards?.length ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400">
                                                No testimonials found. Add your first testimonial using the form.
                                            </td>
                                        </tr>
                                    ) : data.cards.map((card, idx) => (
                                        <tr key={card._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-xs ${idx % 2 === 0
                                                    ? "bg-[#23471d]/5 border-[#23471d]/20 text-[#23471d]"
                                                    : "bg-[#d26019]/5 border-[#d26019]/20 text-[#d26019]"
                                                    }`}>
                                                    {card.initials}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-gray-800 text-sm whitespace-nowrap">{card.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-tight line-clamp-1">{card.role}</p>
                                                <p className="text-[10px] text-[#d26019] font-bold mt-0.5">{card.company}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-start gap-1">
                                                    <Quote className="w-2.5 h-2.5 text-gray-300 shrink-0 mt-1" />
                                                    <p className="text-xs text-gray-600 line-clamp-2 italic leading-normal">
                                                        {card.feedback}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-3 h-3 ${i < card.rating ? "fill-[#d26019] text-[#d26019]" : "text-gray-200"}`} 
                                                        />
                                                    ))}
                                                </div>
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
                                            <td className="py-3 px-4 text-center">

                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => startEdit(card)} className="text-blue-500 hover:text-blue-700 p-1.5 bg-blue-50 rounded-lg transition-colors">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteCard(card._id)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-lg transition-colors">
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

export default TestimonialsManage;
