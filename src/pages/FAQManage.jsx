import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Type, Save, Image as ImageIcon, Plus, Trash2, Edit, HelpCircle, Package
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EMPTY_ITEM = {
    question: '',
    answer: '',
    image: '',
    imageAlt: '',
};

const FAQManage = () => {
    const [data, setData] = useState({
        subheading: 'Support & Info',
        heading: 'Frequently Asked Questions',
        highlightText: 'Questions',
        description: 'Find answers to common inquiries about the 9th International Health & Wellness Expo 2026.',
        defaultImage: '',
        defaultImageAlt: '',
        items: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [itemForm, setItemForm] = useState({ ...EMPTY_ITEM });
    const [isEditingItem, setIsEditingItem] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [defaultImageFile, setDefaultImageFile] = useState(null);
    const [defaultImagePreview, setDefaultImagePreview] = useState('');
    const fileInputRef = useRef(null);
    const defaultFileInputRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/faq');
            if (response.data.success) {
                setData(response.data.data);
                if (response.data.data.defaultImage) {
                    setDefaultImagePreview(`${SERVER_URL}${response.data.data.defaultImage}`);
                }
            }
        } catch (error) {
            console.error('Error fetching FAQ:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            let defaultImageUrl = data.defaultImage;
            if (defaultImageFile) {
                const formData = new FormData();
                formData.append('image', defaultImageFile);
                const res = await api.post('/api/faq/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.data.success) defaultImageUrl = res.data.imageUrl;
            }

            const response = await api.post('/api/faq/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightText: data.highlightText,
                description: data.description,
                defaultImage: defaultImageUrl,
                defaultImageAlt: data.defaultImageAlt
            });
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Headings Saved!', timer: 1500, showConfirmButton: false });
                fetchData();
                setDefaultImageFile(null);
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save headings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDefaultImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setDefaultImageFile(file);
        setDefaultImagePreview(URL.createObjectURL(file));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImage = async () => {
        if (!imageFile) return itemForm.image;
        const formData = new FormData();
        formData.append('image', imageFile);
        const res = await api.post('/api/faq/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) return res.data.imageUrl;
        throw new Error('Image upload failed');
    };

    const handleItemSubmit = async () => {
        if (!itemForm.question.trim()) {
            Swal.fire('Warning', 'Question is required', 'warning');
            return;
        }
        if (!itemForm.answer.trim()) {
            Swal.fire('Warning', 'Answer is required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let imageUrl = itemForm.image;
            if (imageFile) {
                imageUrl = await uploadImage();
            }
            const payload = { ...itemForm, image: imageUrl };
            let response;
            if (isEditingItem) {
                response = await api.put(`/api/faq/items/${isEditingItem}`, payload);
            } else {
                response = await api.post('/api/faq/items', payload);
            }
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditingItem ? 'FAQ Updated!' : 'FAQ Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save FAQ item', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        const result = await Swal.fire({
            title: 'Delete FAQ?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/faq/items/${itemId}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (item) => {
        setIsEditingItem(item._id);
        setItemForm({
            question: item.question,
            answer: item.answer,
            image: item.image || '',
            imageAlt: item.imageAlt || '',
        });
        setImagePreview(item.image ? `${SERVER_URL}${item.image}` : '');
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingItem(null);
        setItemForm({ ...EMPTY_ITEM });
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="FAQ MANAGEMENT"
                description="Manage FAQ section headings and individual question & answer cards"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Headings + Item Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Section Headings */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Eyebrow Text</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. Support & Info"
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

                            {/* DEFAULT VISUAL UPLOAD */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-bold text-[#d26019] mb-2 uppercase tracking-tight">
                                    Default Visual (800x600px)
                                </label>
                                <p className="text-[10px] text-gray-400 mb-3 italic">This image appears when no FAQ is selected.</p>
                                
                                {defaultImagePreview ? (
                                    <div className="relative h-40 border-2 border-gray-200 overflow-hidden mb-2 shadow-inner">
                                        <img src={defaultImagePreview} className="w-full h-full object-cover" alt="Default Visual Preview" />
                                        <button
                                            onClick={() => { setDefaultImageFile(null); setDefaultImagePreview(''); setData({ ...data, defaultImage: '' }); if (defaultFileInputRef.current) defaultFileInputRef.current.value = ''; }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#23471d] hover:bg-gray-50 transition-all shadow-inner">
                                        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                        <span className="text-xs text-gray-400 font-medium">Upload Default SEO Image</span>
                                        <input ref={defaultFileInputRef} type="file" className="hidden" onChange={handleDefaultImageChange} accept="image/*" />
                                    </label>
                                )}
                                
                                <div className="mt-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Default Image Alt Text (SEO)</label>
                                    <input
                                        type="text"
                                        value={data.defaultImageAlt}
                                        onChange={(e) => setData({ ...data, defaultImageAlt: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none text-xs"
                                        placeholder="SEO description for the default image..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-3 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mt-4"
                            >
                                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                : <><Save className="w-5 h-5" /> Save All Headings & Visuals</>}
                            </button>
                        </div>
                    </div>

                    {/* FAQ Item Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {isEditingItem ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditingItem ? 'Edit FAQ Item' : 'Add New FAQ'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question *</label>
                                <input
                                    type="text"
                                    value={itemForm.question}
                                    onChange={(e) => setItemForm({ ...itemForm, question: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                                    placeholder="e.g. What is IHWE 2026?"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Answer *</label>
                                <textarea
                                    value={itemForm.answer}
                                    onChange={(e) => setItemForm({ ...itemForm, answer: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-28 shadow-sm"
                                    placeholder="Type detailed answer here..."
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    FAQ Image <span className="text-gray-400 normal-case font-normal">(Recommended: 800×600px)</span>
                                </label>
                                {imagePreview ? (
                                    <div className="relative h-32 border-2 border-gray-200 overflow-hidden mb-2">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <button
                                            onClick={() => { setImageFile(null); setImagePreview(''); setItemForm({ ...itemForm, image: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#23471d] transition-colors">
                                        <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-400">Click to upload image</span>
                                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                                <input
                                    type="text"
                                    value={itemForm.imageAlt}
                                    onChange={(e) => setItemForm({ ...itemForm, imageAlt: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs shadow-sm mt-2"
                                    placeholder="Alt Text for SEO (describe the image)..."
                                />
            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleItemSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : isEditingItem ? <><Edit className="w-4 h-4" /> Update FAQ</> : <><Plus className="w-4 h-4" /> Add FAQ</>}
                                </button>
                                {isEditingItem && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: FAQ Items Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" /> FAQ Items List
                            </h2>
                            <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                {data.items?.length || 0} FAQs
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">IMAGE</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">QUESTION & ANSWER</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!data.items?.length ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-12 text-gray-400">
                                                No FAQ items found. Add your first FAQ using the form.
                                            </td>
                                        </tr>
                                    ) : data.items.map((item, idx) => (
                                        <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                {item.image ? (
                                                    <img src={`${SERVER_URL}${item.image}`} alt={item.imageAlt} className="w-14 h-10 object-cover rounded border border-gray-200" />
                                                ) : (
                                                    <div className="w-14 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                                        <ImageIcon size={14} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 max-w-sm">
                                                <p className="font-bold text-gray-800 text-sm">{item.question}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.answer}</p>
                                                {item.imageAlt && (
                                                    <p className="text-[10px] text-[#23471d] mt-1 font-semibold">Alt: {item.imageAlt}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => startEdit(item)} className="text-blue-500 hover:text-blue-700 p-1 transition-colors" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteItem(item._id)} className="text-red-500 hover:text-red-700 p-1 transition-colors" title="Delete">
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

export default FAQManage;
