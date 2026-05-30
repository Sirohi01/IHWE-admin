import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Plus, Trash2, Edit, Building2, MapPin, Globe, Image as ImageIcon, Save, X, ArrowUp, ArrowDown, Search, Filter, UploadCloud, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createActivityLogThunk } from '../features/activityLog/activityLogSlice';
import PageHeader from '../components/PageHeader';

const CATEGORIES = [
    "ALL", "AYURVEDA", "PHARMA", "FITNESS", "ORGANIC & NUTRITION", "MEDICAL DEVICES", "WELLNESS & SPA", "OTHERS"
];

const EMPTY_FORM = {
    title: '',
    location: '',
    websiteUrl: '',
    altText: '',
    category: 'OTHERS',
    image: null,
    order: 0
};



const ExhibitorListManage = () => {
    const dispatch = useDispatch();
    const [exhibitors, setExhibitors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [isEditing, setIsEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(localStorage.getItem('exhibitorItemsPerPage')) || 10);

    // Bulk Upload State
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkImages, setBulkImages] = useState([]);
    const [bulkCategory, setBulkCategory] = useState('OTHERS');
    const [bulkLocation, setBulkLocation] = useState('India');
    const [bulkAltText, setBulkAltText] = useState('');

    useEffect(() => {
        fetchExhibitors();
    }, [currentPage, activeTab, searchTerm, itemsPerPage]);

    useEffect(() => {
        localStorage.setItem('exhibitorItemsPerPage', itemsPerPage);
        setCurrentPage(1); // Reset to first page when limit changes
    }, [itemsPerPage]);

    const fetchExhibitors = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                category: activeTab,
                search: searchTerm
            });

            const response = await api.get(`/api/exhibitor?${params.toString()}`);
            console.log('Exhibitor API Response:', response.data);
            if (response.data.success) {
                setExhibitors(response.data.data);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPages);
                    setTotalItems(response.data.pagination.total);
                } else {
                    // Fallback if backend doesn't support pagination yet
                    setTotalPages(1);
                    setTotalItems(response.data.data.length);
                }
            }
        } catch (error) {
            console.error('Error fetching exhibitors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleBulkFileChange = (e) => {
        const files = Array.from(e.target.files);
        setBulkImages(files);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isLoading) return;

        if (!form.title || !form.location || (!isEditing && !form.image)) {
            Swal.fire('Warning', 'Title, Location and Image are required!', 'warning');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('location', form.location);
        formData.append('websiteUrl', form.websiteUrl);
        formData.append('category', form.category);
        formData.append('altText', form.altText || form.title);
        formData.append('order', form.order || 0);
        if (form.image) formData.append('image', form.image);

        try {
            let response;
            if (isEditing) {
                response = await api.put(`/api/exhibitor/${isEditing}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/api/exhibitor', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditing ? 'Updated!' : 'Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchExhibitors();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save exhibitor', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isLoading) return;

        if (bulkImages.length === 0) {
            Swal.fire('Warning', 'Please select images first!', 'warning');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('category', bulkCategory);
        formData.append('location', bulkLocation);
        formData.append('altText', bulkAltText);
        bulkImages.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await api.post('/api/exhibitor/bulk', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                Swal.fire('Success', response.data.message, 'success');
                setBulkImages([]);
                setBulkAltText('');
                setIsBulkMode(false);
                setCurrentPage(1);
                fetchExhibitors();
            }
        } catch (error) {
            Swal.fire('Error', 'Bulk upload failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartMove = async (index) => {
        const currentItem = exhibitors[index];
        const currentPos = (currentPage - 1) * itemsPerPage + index + 1;

        const { value: targetPos } = await Swal.fire({
            title: 'Move Exhibitor',
            html: `
                <div class="space-y-3 p-2">
                    <div class="text-xs text-gray-500 font-medium">Currently at position: <b class="text-green-600">${currentPos}</b></div>
                    <input type="number" id="target-pos" class="swal2-input !m-0 !w-full" placeholder="Enter target position (1-${totalItems})" min="1" max="${totalItems}">
                    <div class="text-[10px] text-gray-400 italic">Example: Enter 1 to move to the very beginning.</div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Move',
            preConfirm: () => {
                const val = document.getElementById('target-pos').value;
                if (!val || val < 1 || val > totalItems) {
                    Swal.showValidationMessage(`Please enter a position between 1 and ${totalItems}`);
                    return false;
                }
                return parseInt(val);
            }
        });

        if (!targetPos) return;

        const targetPage = Math.ceil(targetPos / itemsPerPage);
        const targetIndexOnPage = (targetPos - 1) % itemsPerPage;

        // If it's on the same page, we can show the swap/shift choice
        // If it's on a different page, we'll default to 'shift' (pushing it into that page)

        let targetId = null;
        if (targetPage === currentPage) {
            targetId = exhibitors[targetIndexOnPage]?._id;
        } else {
            // We need to fetch the ID of the item at that position globally
            // But for simplicity, we can just send the targetOrder to the backend
            // Let's update the backend to support targetOrder instead of just targetId
        }

        // Alternative: Just ask for Shift or Swap if targetId is found
        if (targetPage === currentPage && exhibitors[targetIndexOnPage]) {
            const result = await Swal.fire({
                title: 'Reorder Mode',
                text: `Move "${currentItem.title}" to position ${targetPos}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Push / Shift',
                denyButtonText: 'Swap Positions',
                showDenyButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#15803d',
                denyButtonColor: '#1e40af',
            });

            if (result.isConfirmed) {
                await performReorder(currentItem._id, exhibitors[targetIndexOnPage]._id, 'shift');
            } else if (result.isDenied) {
                await performReorder(currentItem._id, exhibitors[targetIndexOnPage]._id, 'swap');
            }
        } else {
            // For different pages, we just shift
            // We'll need a different endpoint or update the current one to handle absolute order
            Swal.fire('Info', 'Moving across pages will default to "Shift" mode.', 'info');
            // We'll calculate the targetOrder based on targetPos
            // Let's assume rebalanceOrders keeps it 0-indexed
            const targetOrder = parseInt(targetPos) - 1;

            try {
                setIsLoading(true);
                const response = await api.post('/api/exhibitor/reorder', {
                    id: currentItem._id,
                    targetOrder: targetOrder,
                    mode: 'shift'
                });
                if (response.data.success) {
                    setCurrentPage(targetPage);
                    fetchExhibitors();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to move exhibitor', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const performReorder = async (id, targetId, mode) => {
        try {
            setIsLoading(true);
            const response = await api.post('/api/exhibitor/reorder', { id, targetId, mode });
            if (response.data.success) {
                fetchExhibitors();
            }
        } catch (error) {
            console.error('Error reordering:', error);
            Swal.fire('Error', 'Failed to reorder exhibitors', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMove = async (index, direction) => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= exhibitors.length) return;

        const currentItem = exhibitors[index];
        const targetItem = exhibitors[targetIndex];

        // For adjacent moves, we'll default to 'shift' as it's the most natural expectation
        await performReorder(currentItem._id, targetItem._id, 'shift');
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This exhibitor will be permanently removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            await api.delete(`/api/exhibitor/${id}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });

            // If deleting the last item on a page, go back
            if (exhibitors.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                fetchExhibitors();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (exhibitor) => {
        setIsBulkMode(false);
        setIsEditing(exhibitor._id);
        setForm({
            title: exhibitor.title,
            location: exhibitor.location,
            websiteUrl: exhibitor.websiteUrl,
            altText: exhibitor.altText,
            category: exhibitor.category || 'OTHERS',
            order: exhibitor.order || 0,
            image: null
        });
        setPreview(exhibitor.image.startsWith('http') ? exhibitor.image : `${SERVER_URL}${exhibitor.image}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setForm({ ...EMPTY_FORM });
        setPreview(null);
    };

    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelectAll = () => {
        if (selectedIds.length === exhibitors.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(exhibitors.map(ex => ex._id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const result = await Swal.fire({
            title: 'Delete Selected?',
            text: `You are about to delete ${selectedIds.length} exhibitors. This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete all!'
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            await api.delete('/api/exhibitor/bulk/delete', { data: { ids: selectedIds } });

            Swal.fire('Deleted!', `${selectedIds.length} exhibitors have been removed.`, 'success');
            setSelectedIds([]);
            fetchExhibitors();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete selected items', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const removeBulkImage = (index) => {
        setBulkImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-6">
            {/* Hero Banner */}
            <div className="relative w-full h-64 overflow-hidden rounded-b-xl pt-2">
                {/* Background Image */}
                <img
                    src="/bann.png"
                    alt="Exhibitor Management Banner"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>

                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
                    <Building2 className="w-16 h-16 mb-4" />
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
                        Exhibitor Management
                    </h1>
                    <p className="text-lg mt-2 text-center text-white/90">
                        Manage brands, categories, and display order for the exhibitors page
                    </p>
                </div>
            </div>

            <div className="p-2 md:p-8">
                <PageHeader
                // title="EXHIBITOR LIST MANAGEMENT"
                // description="Manage brands, categories, and display order for the exhibitors page"
                />

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-8">
                    {/* FORM SECTION (4/12) */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-8">
                            <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${isEditing ? 'bg-orange-50' : isBulkMode ? 'bg-blue-50' : 'bg-green-50'}`}>
                                <h2 className="text-sm font-bold flex items-center gap-2 text-gray-800 uppercase tracking-tight">
                                    {isEditing ? <Edit className="w-4 h-4 text-orange-600" /> : isBulkMode ? <UploadCloud className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-green-600" />}
                                    {isEditing ? 'Update Exhibitor' : isBulkMode ? 'Bulk Upload' : 'New Exhibitor'}
                                </h2>
                                <button
                                    onClick={() => { setIsBulkMode(!isBulkMode); resetForm(); }}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-lg shadow-sm"
                                >
                                    {isBulkMode ? <Layers className="w-3.5 h-3.5" /> : <UploadCloud className="w-3.5 h-3.5" />}
                                    {isBulkMode ? 'Standard Mode' : 'Bulk Mode'}
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {!isBulkMode ? (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Brand Name</label>
                                            <input
                                                type="text"
                                                value={form.title}
                                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. Patanjali"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Category</label>
                                                <select
                                                    value={form.category}
                                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                                >
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Location</label>
                                                <input
                                                    type="text"
                                                    value={form.location}
                                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                                    placeholder="e.g. India"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Website URL</label>
                                            <input
                                                type="text"
                                                value={form.websiteUrl}
                                                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Image Alt Text (SEO)</label>
                                            <input
                                                type="text"
                                                value={form.altText}
                                                onChange={(e) => setForm({ ...form, altText: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. Brand Logo"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Brand Logo</label>
                                            <div className="mt-1 flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50/30 transition-all relative group cursor-pointer">
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                {preview ? (
                                                    <div className="relative w-full aspect-video flex items-center justify-center">
                                                        <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                                            <ImageIcon className="text-white w-8 h-8" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <ImageIcon className="text-gray-400 w-6 h-6" />
                                                        </div>
                                                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Upload Logo</span>
                                                        <span className="block text-[10px] text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className={`w-full py-3.5 rounded-lg text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg transition-all flex items-center justify-center gap-3 ${isEditing ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'bg-green-700 hover:bg-green-800 shadow-green-200'
                                                } disabled:opacity-50`}
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>{isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {isEditing ? 'Save Changes' : 'Add Brand'}</>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest leading-relaxed">
                                                Bulk upload will create individual entries for each image. Brand names will be derived from filenames.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Target Category</label>
                                                <select
                                                    value={bulkCategory}
                                                    onChange={(e) => setBulkCategory(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                                >
                                                    {CATEGORIES.filter(c => c !== 'ALL').map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Common Location</label>
                                                <input
                                                    type="text"
                                                    value={bulkLocation}
                                                    onChange={(e) => setBulkLocation(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                                    placeholder="e.g. India"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Common Alt Text (SEO)</label>
                                            <input
                                                type="text"
                                                value={bulkAltText}
                                                onChange={(e) => setBulkAltText(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. Exhibitor Logo"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Select Multiple Logos</label>
                                            <div className="mt-1 flex flex-col items-center p-8 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all relative group cursor-pointer">
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleBulkFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <UploadCloud className="text-blue-500 w-6 h-6" />
                                                    </div>
                                                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                        {bulkImages.length > 0 ? `${bulkImages.length} files selected` : 'Select Files'}
                                                    </span>
                                                    <span className="block text-[10px] text-gray-400 mt-1">Upload up to 100 images at once</span>
                                                </div>
                                            </div>
                                        </div>

                                        {bulkImages.length > 0 && (
                                            <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg space-y-2 border border-gray-100">
                                                {bulkImages.map((file, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-tight bg-white p-2 rounded-lg border border-gray-100 shadow-sm group/item">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center text-blue-500 shrink-0">
                                                                <ImageIcon className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="truncate max-w-[150px]">{file.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-blue-400 font-medium lowercase">{(file.size / 1024).toFixed(0)}kb</span>
                                                            <button
                                                                onClick={() => removeBulkImage(idx)}
                                                                className="p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                                                                title="Remove file"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleBulkSubmit}
                                            disabled={isLoading || bulkImages.length === 0}
                                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><UploadCloud className="w-4 h-4" /> Start Bulk Upload</>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* LIST SECTION (8/12) */}
                    <div className="xl:col-span-8 space-y-6">
                        {/* FILTERS & SEARCH */}
                        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex overflow-x-auto gap-1 pb-1 w-full md:w-auto scrollbar-hide">
                                {CATEGORIES.slice(0, 5).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveTab(cat)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === cat ? 'bg-green-700 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                {CATEGORIES.length > 5 && (
                                    <select
                                        className="px-3 py-2 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg border-none focus:ring-0 cursor-pointer"
                                        onChange={(e) => setActiveTab(e.target.value)}
                                        value={activeTab === "ALL" || CATEGORIES.slice(0, 5).includes(activeTab) ? "" : activeTab}
                                    >
                                        <option value="" disabled>More...</option>
                                        {CATEGORIES.slice(5).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete ({selectedIds.length})
                                    </button>
                                )}
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search brands..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-xs font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length === exhibitors.length && exhibitors.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">No.</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {exhibitors.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                                                    {isLoading ? 'Loading exhibitors...' : 'No exhibitors found matching your criteria.'}
                                                </td>
                                            </tr>
                                        ) : exhibitors.map((ex, idx) => (
                                            <tr key={ex._id} className={`group hover:bg-green-50/20 transition-colors ${selectedIds.includes(ex._id) ? 'bg-green-50/40' : ''}`}>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(ex._id)}
                                                        onChange={() => toggleSelect(ex._id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <button
                                                            disabled={idx === 0 && currentPage === 1}
                                                            onClick={() => handleMove(idx, 'up')}
                                                            className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-20 transition-colors"
                                                        >
                                                            <ArrowUp size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleSmartMove(idx)}
                                                            className="text-xs font-black text-gray-300 group-hover:text-green-600 transition-colors hover:scale-110"
                                                            title="Click to move to specific position"
                                                        >
                                                            {(currentPage - 1) * itemsPerPage + idx + 1}
                                                        </button>
                                                        <button
                                                            disabled={idx === exhibitors.length - 1 && currentPage === totalPages}
                                                            onClick={() => handleMove(idx, 'down')}
                                                            className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-20 transition-colors"
                                                        >
                                                            <ArrowDown size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-10 bg-white border border-gray-100 rounded-lg p-1.5 flex items-center justify-center overflow-hidden shadow-sm">
                                                            <img
                                                                src={ex.image.startsWith('http') ? ex.image : `${SERVER_URL}${ex.image}`}
                                                                alt={ex.altText}
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800">{ex.title}</p>
                                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                                <MapPin className="w-2.5 h-2.5 text-orange-500" /> {ex.location}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${ex.category === 'AYURVEDA' ? 'bg-green-100 text-green-700' :
                                                        ex.category === 'PHARMA' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {ex.category || 'OTHERS'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => startEdit(ex)}
                                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Brand"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(ex._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Brand"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINATION CONTROLS */}
                            {totalPages >= 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} brands
                                        </div>
                                        <div className="text-[8px] text-gray-300 uppercase font-bold">Page {currentPage} of {totalPages}</div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Items Per Page Selector */}
                                        <div className="flex items-center gap-3 border-r border-gray-200 pr-6 mr-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Items per page:</span>
                                            <div className="flex items-center gap-1.5">
                                                <select
                                                    value={itemsPerPage}
                                                    onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                                                    className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none cursor-pointer shadow-sm"
                                                >
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                    <option value={75}>75</option>
                                                    <option value={100}>100</option>
                                                    <option value={200}>200</option>
                                                    <option value={500}>500</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {[...Array(totalPages)].map((_, i) => {
                                                    const page = i + 1;
                                                    if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                                                        if (page === 2 || page === totalPages - 1) return <span key={page} className="px-1 text-gray-300">...</span>;
                                                        return null;
                                                    }
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === page
                                                                ? 'bg-green-700 text-white shadow-md'
                                                                : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExhibitorListManage;
