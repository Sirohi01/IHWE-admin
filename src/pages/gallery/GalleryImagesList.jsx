import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { Search, Eye, Filter, Calendar, Tag, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import DeleteConfirmToast from "../../components/DeleteConfirmToast";
import Pagination from '../../components/Pagination';
import Table from "../../components/table/Table";
import PageHeader from '../../components/PageHeader';
import api, { API_URL, SERVER_URL } from "../../lib/api";
import { motion, AnimatePresence } from 'framer-motion';

const GalleryImagesList = () => {
    const navigate = useNavigate();
    const [galleryItems, setGalleryItems] = useState([]);
    const [galleryImagesData, setGalleryImagesData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [itemsRes, imagesRes] = await Promise.all([
                api.get('/api/gallery/items'),
                api.get('/api/gallery/images')
            ]);

            if (itemsRes.data.success) setGalleryItems(itemsRes.data.data);
            if (imagesRes.data.success) setGalleryImagesData(imagesRes.data.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load gallery data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        toast(
            <DeleteConfirmToast
                onDelete={async () => {
                    try {
                        const response = await api.delete(`/api/gallery/items/${id}`);
                        if (response.data.success) {
                            toast.success("Entry deleted successfully");
                            fetchData();
                        }
                    } catch (error) {
                        toast.error("Failed to delete entry");
                    }
                }}
            />,
            { autoClose: false }
        );
    };

    const openImageModal = (itemId) => {
        const data = galleryImagesData.find(g => g.galleryItem?._id === itemId || g.galleryItem === itemId);
        if (data && data.images.length > 0) {
            setSelectedGallery(data);
            setIsModalOpen(true);
        } else {
            toast.info("No gallery images found for this item. Click 'Add Gallery Images' to upload.");
        }
    };

    // Filter Logic
    const filteredItems = galleryItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredItems.length;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + rowsPerPage);

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "70px",
            render: (_, index) => <span className="text-gray-400 font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</span>
        },
        {
            key: "title",
            label: "GALLERY TITLE",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1A3263] uppercase tracking-wide">{row.title}</span>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded self-start mt-1 border border-amber-100 italic">
                        {row.highlightText || "No Highlight"}
                    </span>
                </div>
            )
        },
        {
            key: "category",
            label: "PORTFOLIO CATEGORY",
            render: (row) => (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-semibold text-gray-600 uppercase italic">
                            {row.category?.name || "Uncategorized"}
                        </span>
                    </div>
                    {row.subcategory && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-medium border border-purple-200 self-start ml-5">
                            → {row.subcategory}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: "images",
            label: "GALLERY IMAGES (FIXED 6)",
            render: (row) => {
                const gallery = galleryImagesData.find(g => g.galleryItem?._id === row._id || g.galleryItem === row._id);
                const imageCount = gallery?.images?.length || 0;

                return (
                    <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => openImageModal(row._id)}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white shadow-sm overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 ${i < imageCount ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                {i < imageCount ? (
                                    <img
                                        src={`${SERVER_URL}${gallery.images[i].url}`}
                                        className="w-full h-full object-cover"
                                        alt="Gallery"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300">?</div>
                                )}
                            </div>
                        ))}
                        <div className="ml-2 w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 group-hover:bg-[#1A3263] group-hover:text-white transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                        </div>
                    </div>
                );
            }
        },
        {
            key: "status",
            label: "STATUS",
            render: (row) => (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border max-w-fit ${row.status === "Active" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${row.status === "Active" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"}`}></div>
                    {row.status.toUpperCase()}
                </div>
            )
        },
        {
            key: "slug",
            label: "SLUG",
            render: (row) => <code className="text-[10px] text-gray-500 tracking-tighter bg-gray-50 px-2 py-1 rounded">{row.slug}</code>
        }
    ];

    return (
        <div className="bg-[#f8fafc] min-h-screen p-6">
            <PageHeader
                title="PORTFOLIO GALLERY MANAGEMENT"
                description="View and manage detailed gallery entries with multiple images and search functionality"
            />

            <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* TOOLBAR */}
                <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white">
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Title or Category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-gray-50 border-2 border-gray-100 focus:border-[#1A3263] focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Show:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            className="bg-gray-50 border-2 border-gray-100 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                        >
                            <option value={5}>5 Rows</option>
                            <option value={10}>10 Rows</option>
                            <option value={20}>20 Rows</option>
                            <option value={50}>50 Rows</option>
                        </select>
                        <button onClick={fetchData} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border-2 border-transparent">
                            <Calendar className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* TABLE CONTENT */}
                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                            <div className="w-12 h-12 border-4 border-[#1A3263] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Fetching Gallery Data...</p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={paginatedItems}
                            onEdit={(row) => navigate('/gallery-category', { state: { editItem: row } })}
                            onDelete={(row) => handleDelete(row._id)}
                        />
                    )}
                </div>

                {/* PAGINATION */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={rowsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* HIGH-END IMAGE MODAL */}
            <AnimatePresence>
                {isModalOpen && selectedGallery && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#0a1128]/95 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] z-10"
                        >
                            {/* Modal Header */}
                            <div className="absolute top-6 right-6 z-20">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20 hover:scale-110 active:scale-95"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                                {/* Left: Hero Content */}
                                <div className="w-full md:w-[65%] bg-gray-950 flex items-center justify-center relative group p-10">
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-transparent to-amber-500/20"></div>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedGallery._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="relative z-10 w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10"
                                        >
                                            <img
                                                src={`${SERVER_URL}${selectedGallery.images[0].url}`}
                                                alt="Main Preview"
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-lg border border-white/10">
                                                <p className="text-white font-bold text-sm tracking-wide uppercase">{selectedGallery.galleryItem?.title}</p>
                                                <p className="text-blue-200 text-[10px] italic mt-1 font-medium">{selectedGallery.images[0].altText || "No description provided"}</p>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Right: Multi-Grid */}
                                <div className="w-full md:w-[35%] bg-white p-8 overflow-y-auto">
                                    <div className="mb-8">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <div className="w-5 h-px bg-gray-300"></div> Portfolio Snapshot
                                        </h4>
                                        <h3 className="text-2xl font-black text-[#1A3263] leading-tight">GALLERY COLLECTION</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-3 leading-relaxed">
                                            A curated collection of exactly 6 high-definition images showcasing the detail and craftsmanship of this project.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedGallery.images.map((img, idx) => (
                                            <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-500">
                                                <img
                                                    src={`${SERVER_URL}${img.url}`}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    alt={img.altText}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                                    <span className="text-[8px] text-white font-bold uppercase tracking-tighter line-clamp-1">{img.altText || `View Image ${idx + 1}`}</span>
                                                </div>
                                                <div className="absolute top-2 right-2 w-5 h-5 bg-[#1A3263] text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <button className="w-full h-12 bg-gray-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#1A3263] transition-colors flex items-center justify-center gap-3 group shadow-lg">
                                            <Maximize2 className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" /> Enter Fullscreen View
                                        </button>
                                        <p className="text-[10px] text-gray-400 font-medium mt-4 text-center italic">
                                            Item Reference ID: {selectedGallery._id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalleryImagesList;