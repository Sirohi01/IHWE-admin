import { useState, useEffect } from "react";
import { Plus, Search, Eye, Trash2, Image as ImageIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import api, { API_URL, SERVER_URL } from "../../lib/api";
import Table from "../../components/table/Table";
import Pagination from "../../components/Pagination";

const GalleryList = () => {
    const [galleries, setGalleries] = useState([]);
    const [filteredGalleries, setFilteredGalleries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal State for Viewing Images
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [currentGalleryImages, setCurrentGalleryImages] = useState([]);
    const [currentGalleryTitle, setCurrentGalleryTitle] = useState("");

    const apiUrl = SERVER_URL;

    useEffect(() => {
        fetchGalleries();
    }, []);

    useEffect(() => {
        const results = galleries.filter(
            (g) =>
                g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredGalleries(results);
        setCurrentPage(1); // Reset to first page on search
    }, [searchTerm, galleries]);

    const fetchGalleries = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/api/portfolio-gallery/all");
            if (response.data.success) {
                setGalleries(response.data.data);
                setFilteredGalleries(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching galleries:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(
                    `/api/portfolio-gallery/delete/${row._id}`
                );
                if (response.data.success) {
                    Swal.fire("Deleted!", "Gallery has been deleted.", "success");
                    fetchGalleries();
                }
            } catch (error) {
                Swal.fire("Error", "Failed to delete gallery", "error");
            }
        }
    };

    const openImageModal = (gallery) => {
        setCurrentGalleryTitle(gallery.title);
        setCurrentGalleryImages(gallery.galleryImages || []);
        setViewModalOpen(true);
    };

    // Pagination Logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedGalleries = filteredGalleries.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (row, index) => (
                <div className="font-bold text-gray-900">
                    {startIndex + index + 1}
                </div>
            ),
        },
        {
            key: "title",
            label: "TITLE",
            render: (row) => (
                <div className="font-medium text-gray-900">{row.title}</div>
            ),
        },
        {
            key: "category",
            label: "CATEGORY",
            render: (row) => (
                <div>
                    <span className="bg-blue-50 text-[#134698] px-2 py-1 rounded text-xs font-bold">
                        {row.category}
                    </span>
                    {row.subCategory && (
                        <span className="block text-xs mt-1 text-gray-500">
                            {row.subCategory}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "mainImage",
            label: "MAIN IMAGE",
            render: (row) => (
                <img
                    src={`${apiUrl}${row.mainImage}`}
                    alt={row.title}
                    className="w-16 h-10 object-cover rounded-md border border-gray-200"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/64x40?text=No+Image";
                    }}
                />
            ),
        },
        {
            key: "galleryImages",
            label: "GALLERY IMAGES",
            render: (row) => (
                <div
                    className="flex -space-x-2 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openImageModal(row)}
                >
                    {row.galleryImages?.slice(0, 4).map((img, i) => (
                        <img
                            key={i}
                            src={`${apiUrl}${img.image}`}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                            alt=""
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/32x32?text=NA";
                            }}
                        />
                    ))}
                    {row.galleryImages?.length > 4 && (
                        <div className="h-8 w-8 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-xs font-bold text-gray-600">
                            +{row.galleryImages.length - 4}
                        </div>
                    )}
                    {(row.galleryImages?.length === 0 || !row.galleryImages) && (
                        <span className="text-xs text-gray-400">0 images</span>
                    )}
                </div>
            ),
        },
        {
            key: "status",
            label: "STATUS",
            render: (row) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            key: "createdAt",
            label: "DATE",
            render: (row) => (
                <div className="text-gray-500 text-sm">
                    {new Date(row.createdAt).toLocaleDateString()}
                </div>
            ),
        },
        {
            key: "actions",
            label: "ACTIONS",
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openImageModal(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Images">
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <div className="w-full mb-6">
                <h1 className="text-3xl font-bold text-[#1e3a8a]">GALLERY LISTINGS</h1>
                <p className="text-gray-600 mt-2 text-lg">
                    Manage all your portfolio event galleries
                </p>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <Link
                        to="/gallery-category"
                        className="bg-[#1e3a8a] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-[#152c69] transition-all flex items-center gap-2 uppercase tracking-wider text-sm"
                    >
                        <Plus size={18} /> Add New Category
                    </Link>

                    <Link
                        to="/add-gallery-images"
                        className="bg-[#DE802B] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-[#c97224] transition-all flex items-center gap-2 uppercase tracking-wider text-sm"
                    >
                        <ImageIcon size={18} /> Add Images to Existing
                    </Link>
                </div>
            </div>


            <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
                <div className="px-6 py-4 border-b bg-[#1e3a8a]">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Gallery List</h2>
                            <p className="text-sm text-blue-100 mt-0.5">
                                Showing {filteredGalleries.length} galleries
                            </p>
                        </div>

                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search galleries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <Table columns={columns} data={paginatedGalleries} />
                    )}
                </div>

                <div className="mt-4 px-4 pb-4 bg-white">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredGalleries.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        label="galleries"
                    />
                </div>
            </div>


            {/* IMAGE MODAL */}
            {viewModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
                    onClick={() => setViewModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                Images in "{currentGalleryTitle}"
                            </h3>
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                            {currentGalleryImages.map((img, i) => (
                                <div key={i} className="group relative">
                                    <img
                                        src={`${apiUrl}${img.image}`}
                                        className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-100"
                                        alt={img.altText}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/300x200?text=No+Image";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-white text-xs p-2 text-center">
                                        {img.altText}
                                    </div>
                                </div>
                            ))}
                            {currentGalleryImages.length === 0 && (
                                <p className="text-center text-gray-500 col-span-full py-10">
                                    No images uploaded yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryList;
