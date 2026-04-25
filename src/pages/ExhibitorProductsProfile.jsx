import React, { useState, useEffect } from "react";
import {
    Package, Eye, MessageCircle, TrendingUp,
    Search, Users, Filter, ArrowRight,
    ShoppingBag, Star, AlertCircle, Loader2,
    X, Trash2, LayoutGrid, List as ListIcon,
    Plus, Image as ImageIcon, CheckCircle2,
    Upload
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import PageHeader from "../components/PageHeader";

export default function ExhibitorProductsProfile() {
    const [exhibitors, setExhibitors] = useState([]);
    const [selectedExhibitor, setSelectedExhibitor] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null); // For Quick View Modal
    const [activeModalImage, setActiveModalImage] = useState(0);
    const [exhibitorAnalytics, setExhibitorAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid");

    // Add Product Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [units, setUnits] = useState([]);

    const backendBaseUrl = SERVER_URL;

    useEffect(() => {
        fetchExhibitors();
        fetchUnits();
    }, []);

    useEffect(() => {
        setActiveModalImage(0);
    }, [selectedProduct]);

    const fetchExhibitors = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/exhibitor-registration");
            if (res.data && res.data.success && Array.isArray(res.data.data)) {
                const activeOnes = res.data.data
                    .filter(e => e && e.status && ['paid', 'confirmed', 'approved', 'advance-paid'].includes(e.status.toLowerCase()))
                    .map(e => ({
                        _id: e._id,
                        title: e.exhibitorName || 'Unknown Company',
                        location: `${e.city || ''}, ${e.country || ''}`,
                        email: e.contact1?.email || 'No Email',
                        companyLogoUrl: e.companyLogoUrl
                    }));
                setExhibitors(activeOnes);
            } else {
                setExhibitors([]);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load exhibitors");
        } finally {
            setLoading(false);
        }
    };

    const fetchUnits = async () => {
        try {
            const res = await api.get("/api/units");
            if (Array.isArray(res.data)) setUnits(res.data);
        } catch (err) { }
    };

    const handleSelectExhibitor = async (exh) => {
        if (!exh || !exh._id) return;
        setSelectedExhibitor(exh);
        setProductsLoading(true);
        try {
            const [pRes, aRes] = await Promise.all([
                api.get(`/api/stall-products/admin/exhibitor/${exh._id}`),
                api.get(`/api/stall-products/admin/analytics/${exh._id}`)
            ]);
            if (pRes?.data?.success) setProducts(pRes.data.data || []);
            if (aRes?.data?.success) setExhibitorAnalytics(aRes.data.data || null);
        } catch (err) {
            console.error("Select Error:", err);
            toast.error("Error fetching data");
            setProducts([]);
            setExhibitorAnalytics(null);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!id || !window.confirm("Admin Warning: Delete this product?")) return;
        try {
            const res = await api.delete(`/api/stall-products/admin/${id}`);
            if (res?.data?.success) {
                toast.success("Removed");
                handleSelectExhibitor(selectedExhibitor);
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            formData.append("exhibitorId", selectedExhibitor._id);
            selectedImages.forEach(file => formData.append('images', file));

            const res = await api.post("/api/stall-products/admin/add", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success("Product added for exhibitor");
                setShowAddModal(false);
                setSelectedImages([]);
                setImagePreviews([]);
                handleSelectExhibitor(selectedExhibitor);
            }
        } catch (err) {
            toast.error("Add failed");
        } finally {
            setFormLoading(false);
        }
    };

    // Global filtering safety
    const filteredExhibitors = Array.isArray(exhibitors) ? exhibitors.filter(e =>
        (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.location || "").toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <PageHeader
                title="Exhibitors Products Management"
                subtitle="End-to-end monitoring and multi-exhibitor catalog control."
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Left: Exhibitor Selection */}
                <div className="xl:col-span-1 border rounded-lg bg-white overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    <div className="p-4 border-b bg-gray-50 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase text-gray-400">Exhibitor Directory</h3>
                            <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-bold">{exhibitors.length}</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search Exhibitor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border rounded text-xs outline-none focus:border-[#23471d]"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredExhibitors.map((exh) => (
                            <button
                                key={exh._id}
                                onClick={() => handleSelectExhibitor(exh)}
                                className={`w-full text-left p-4 border-b last:border-0 flex items-center justify-between transition-all group ${selectedExhibitor?._id === exh._id ? 'bg-[#23471d] text-white' : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <div className="min-w-0">
                                    <h4 className="text-[11px] font-black uppercase truncate leading-tight">{exh.title}</h4>
                                    <p className={`text-[10px] font-medium truncate mt-0.5 ${selectedExhibitor?._id === exh._id ? 'text-white/70' : 'text-gray-400'}`}>
                                        {exh.location}
                                    </p>
                                </div>
                                <ArrowRight size={14} className={`shrink-0 transition-transform ${selectedExhibitor?._id === exh._id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Main Content Area */}
                <div className="xl:col-span-3">
                    <AnimatePresence mode="wait">
                        {!selectedExhibitor ? (
                            <div className="h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed rounded-lg p-20 text-center opacity-60">
                                <Users size={48} className="text-gray-300 mb-4" />
                                <h3 className="text-sm font-black uppercase text-gray-400">Select an Exhibitor to Manage</h3>
                            </div>
                        ) : productsLoading ? (
                            <div className="h-full flex items-center justify-center py-40">
                                <Loader2 className="animate-spin text-[#23471d]" size={40} />
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                {/* Header Info Card */}
                                <div className="bg-white border rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-[#23471d] text-white rounded flex items-center justify-center text-xl font-black overflow-hidden border border-gray-100 shadow-sm">
                                            {selectedExhibitor.companyLogoUrl ? (
                                                <img
                                                    src={selectedExhibitor.companyLogoUrl.startsWith('http') ? selectedExhibitor.companyLogoUrl : `${backendBaseUrl}${selectedExhibitor.companyLogoUrl}`}
                                                    className="w-full h-full object-contain bg-white"
                                                    alt={selectedExhibitor.title}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerText = selectedExhibitor.title?.[0] || "E";
                                                    }}
                                                />
                                            ) : (
                                                selectedExhibitor.title?.[0] || "E"
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">{selectedExhibitor.title}</h2>
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{selectedExhibitor.location || 'No Location'}</p>
                                                <p className="text-[10px] font-bold text-[#23471d] lowercase">{selectedExhibitor.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-center px-6">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Views</p>
                                            <p className="text-xl font-black text-gray-900">{exhibitorAnalytics?.totalViews || 0}</p>
                                        </div>
                                        <div className="text-center px-6 border-l border-r">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Leads</p>
                                            <p className="text-xl font-black text-[#23471d]">{exhibitorAnalytics?.totalEnquiries || 0}</p>
                                        </div>
                                        <button
                                            onClick={() => setShowAddModal(true)}
                                            className="h-12 px-6 bg-[#23471d] text-white rounded flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                                        >
                                            <Plus size={18} /> Add Product
                                        </button>
                                    </div>
                                </div>

                                {/* Catalog List */}
                                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                                    <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Exhibitor Catalog</h3>
                                        <div className="flex bg-white border rounded overflow-hidden">
                                            <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}><LayoutGrid size={16} /></button>
                                            <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}><ListIcon size={16} /></button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {products.length === 0 ? (
                                            <div className="text-center py-20 text-gray-300">
                                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="text-xs uppercase font-black">No products uploaded</p>
                                            </div>
                                        ) : viewMode === 'grid' ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {products.map(p => (
                                                    <div
                                                        key={p._id}
                                                        onClick={() => setSelectedProduct(p)}
                                                        className="border rounded relative group overflow-hidden bg-white cursor-pointer hover:border-[#23471d] transition-all"
                                                    >
                                                        <div className="aspect-square bg-gray-50 relative">
                                                            {p.images?.[0] ? (
                                                                <img
                                                                    src={p.images[0].startsWith('http') ? p.images[0] : `${backendBaseUrl}${p.images[0]}`}
                                                                    className="w-full h-full object-contain"
                                                                    onError={(e) => e.target.src = 'https://placehold.co/400x400?text=No+Image'}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                                    <Package size={32} />
                                                                    <span className="text-[8px] font-black uppercase mt-1">No Image</span>
                                                                </div>
                                                            )}
                                                            {p.images?.length > 1 && (
                                                                <div className="absolute top-2 right-2 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                                    +{p.images.length - 1} Images
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2 left-2 flex gap-1">
                                                                <span className="px-1.5 py-0.5 bg-black/60 text-white text-[8px] font-black rounded flex items-center gap-1"><Eye size={8} /> {p.views}</span>
                                                                <span className="px-1.5 py-0.5 bg-[#23471d] text-white text-[8px] font-black rounded flex items-center gap-1"><MessageCircle size={8} /> {p.enquiryCount}</span>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteProduct(p._id);
                                                                }}
                                                                className="absolute bottom-2 right-2 p-2 bg-white text-red-500 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="p-3">
                                                            <h4 className="text-[11px] font-black uppercase truncate text-gray-800">{p.name}</h4>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {(p.category || "").split(',').filter(t => t.trim() !== "").slice(0, 2).map((tag, i) => (
                                                                    <span key={i} className="text-[7px] font-black uppercase bg-[#23471d]/5 text-[#23471d]/70 px-1 rounded border border-[#23471d]/10">{tag.trim()}</span>
                                                                ))}
                                                                {(p.category || "").split(',').filter(t => t.trim() !== "").length > 2 && <span className="text-[7px] font-black text-gray-400">...</span>}
                                                            </div>
                                                            <p className="text-[10px] font-bold text-[#23471d] mt-1">{p.price || 'TBD'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b text-[10px] uppercase font-black text-gray-400">
                                                        <th className="py-2">Product</th>
                                                        <th className="py-2">Views</th>
                                                        <th className="py-2">Leads</th>
                                                        <th className="py-2 text-right">Delete</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {products.map(p => (
                                                        <tr
                                                            key={p._id}
                                                            onClick={() => setSelectedProduct(p)}
                                                            className="border-b hover:bg-gray-50 transition-all cursor-pointer group"
                                                        >
                                                            <td className="py-3 flex items-center gap-3">
                                                                <div className="w-10 h-10 border rounded overflow-hidden bg-gray-50 flex">
                                                                    {p.images?.[0] ? (
                                                                        <img
                                                                            src={p.images[0].startsWith('http') ? p.images[0] : `${backendBaseUrl}${p.images[0]}`}
                                                                            className="w-full h-full object-contain"
                                                                            onError={(e) => e.target.src = 'https://placehold.co/100x100?text=NA'}
                                                                        />
                                                                    ) : (
                                                                        <Package size={16} className="m-auto text-gray-300" />
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold uppercase">{p.name}</span>
                                                                    <span className="text-[8px] font-black text-gray-400 uppercase">{p.images?.length || 0} Photos</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 text-xs font-black">{p.views}</td>
                                                            <td className="py-3 text-xs font-black text-[#23471d]">{p.enquiryCount}</td>
                                                            <td className="py-3 text-right">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteProduct(p._id);
                                                                    }}
                                                                    className="text-red-400 hover:text-red-600 p-2"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row h-[80vh]">
                            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white md:text-black rounded-full transition-all"><X size={24} /></button>

                            {/* Left: Image Gallery */}
                            <div className="md:w-3/5 bg-gray-100 flex flex-col relative h-1/2 md:h-full">
                                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
                                    {selectedProduct.images?.[activeModalImage] ? (
                                        <motion.img
                                            key={activeModalImage}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            src={selectedProduct.images[activeModalImage].startsWith('http') ? selectedProduct.images[activeModalImage] : `${backendBaseUrl}${selectedProduct.images[activeModalImage]}`}
                                            className="max-w-full max-h-full object-contain shadow-lg rounded"
                                        />
                                    ) : (
                                        <Package size={80} className="text-gray-300" />
                                    )}
                                </div>

                                {selectedProduct.images?.length > 1 && (
                                    <div className="p-4 bg-white/50 backdrop-blur-sm flex justify-center gap-2 overflow-x-auto">
                                        {selectedProduct.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveModalImage(idx)}
                                                className={`w-16 h-16 rounded border-2 transition-all overflow-hidden shrink-0 ${activeModalImage === idx ? 'border-[#23471d] scale-110 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                            >
                                                <img src={img.startsWith('http') ? img : `${backendBaseUrl}${img}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Product Details */}
                            <div className="md:w-2/5 p-8 flex flex-col overflow-y-auto bg-white">
                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {(selectedProduct.category || "").split(',').filter(t => t.trim() !== "").map((tag, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-[#23471d]/10 text-[#23471d] text-[9px] font-black uppercase rounded border border-[#23471d]/20">{tag.trim()}</span>
                                        ))}
                                    </div>
                                    <h2 className="text-2xl font-black uppercase text-gray-900 leading-tight">{selectedProduct.name}</h2>
                                    <p className="text-xl font-black text-[#23471d] mt-2">
                                        {selectedProduct.price} <span className="text-sm text-gray-400 font-medium">/ {selectedProduct.priceUnit || 'Pcs'}</span>
                                    </p>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 border-b pb-1">Specifications</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase">MOQ</span><span className="font-black">{selectedProduct.moq || 'N/A'}</span></div>
                                            <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase">Status</span><span className="text-green-600 font-black">Available</span></div>
                                            {(selectedProduct.category || "").split(',').filter(t => t.trim() !== "").length > 0 && (
                                                <div className="flex justify-between text-xs items-center">
                                                    <span className="text-gray-400 font-bold uppercase">Categories</span>
                                                    <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                                                        {(selectedProduct.category || "").split(',').filter(t => t.trim() !== "").map((tag, i) => (
                                                            <span key={i} className="px-1.5 py-0.5 bg-[#23471d]/10 text-[#23471d] text-[8px] font-black uppercase rounded border border-[#23471d]/20">{tag.trim()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase">Admin Code</span><span className="font-mono text-[10px]">{selectedProduct._id}</span></div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 border-b pb-1">Description</h4>
                                        <p className="text-xs text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedProduct.description || 'No description provided.'}</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t flex gap-3">
                                    <div className="flex-1 bg-gray-50 p-3 rounded text-center">
                                        <p className="text-[8px] font-black uppercase text-gray-400">Total Views</p>
                                        <p className="text-lg font-black">{selectedProduct.views}</p>
                                    </div>
                                    <div className="flex-1 bg-gray-50 p-3 rounded text-center">
                                        <p className="text-[8px] font-black uppercase text-gray-400">Total Leads</p>
                                        <p className="text-lg font-black text-[#23471d]">{selectedProduct.enquiryCount}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Product Modal for Admin */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-2xl rounded shadow-2xl overflow-hidden relative">
                            <form onSubmit={handleAddProduct} className="flex flex-col h-full">
                                <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 leading-none">Admin: Register New Product</h3>
                                        <p className="text-[10px] font-black uppercase text-gray-400 mt-1 tracking-widest">For {selectedExhibitor.title}</p>
                                    </div>
                                    <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
                                    {/* Image Selector */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[9px] font-black uppercase text-gray-400">Product Images (upto 8)</label>
                                            <span className="text-[9px] font-black text-[#23471d] uppercase tracking-tighter">Required: 1000 x 1000 px (Square)</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                            {imagePreviews.map((src, i) => (
                                                <div key={i} className="aspect-square rounded border relative group bg-gray-50 flex overflow-hidden">
                                                    <img src={src} className="w-full h-full object-contain m-auto" />
                                                    <button type="button" onClick={() => {
                                                        setSelectedImages(prev => prev.filter((_, idx) => idx !== i));
                                                        setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                                                    }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-all">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            {imagePreviews.length < 8 && (
                                                <label className="aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all bg-white">
                                                    <Upload size={24} className="text-gray-300" />
                                                    <span className="text-[8px] font-black uppercase text-gray-400">Add Photos</span>
                                                    <input type="file" multiple onChange={handleImageChange} className="hidden" />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Product Name</label>
                                                <input required name="name" className="w-full h-11 border rounded px-4 text-xs font-bold outline-none focus:border-[#23471d]" placeholder="Premium Leather Sofa" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Product Categories (Comma Separated)</label>
                                                <input required name="category" className="w-full h-11 border rounded px-4 text-xs font-bold outline-none focus:border-[#23471d]" placeholder="e.g. Furniture, Modern, Luxury" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Short Description</label>
                                            <textarea name="description" className="w-full h-24 border rounded p-4 text-xs font-bold outline-none focus:border-[#23471d] resize-none" placeholder="Highlight key features..." />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1 col-span-2">
                                                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Price Guide & Unit</label>
                                                <div className="flex gap-1">
                                                    <input required name="price" type="number" className="flex-1 h-11 border rounded px-4 text-xs font-bold outline-none focus:border-[#23471d]" placeholder="1500" />
                                                    <select name="priceUnit" className="w-32 h-11 border rounded px-2 text-[10px] font-black bg-gray-50 outline-none">
                                                        {units.map(u => <option key={u._id} value={u.unit}>{u.unit}</option>)}
                                                        {units.length === 0 && <option>Pcs</option>}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Min. Order Qty (MOQ)</label>
                                                <input name="moq" className="w-full h-11 border rounded px-4 text-xs font-bold outline-none focus:border-[#23471d]" placeholder="50 Sets" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="text-xs font-black uppercase text-gray-400 hover:text-black transition-all">Cancel</button>
                                    <button disabled={formLoading} type="submit" className="h-12 px-10 bg-[#23471d] text-white rounded font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                                        {formLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Save Product
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ChevronRight({ size, className }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
