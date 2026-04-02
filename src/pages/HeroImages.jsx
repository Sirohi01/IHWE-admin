import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Search, Plus, Trash2, Edit, ImageIcon, Layout, Type, 
    Heading, AlignLeft, CheckCircle, XCircle, Save, 
    ChevronLeft, Image as LucideImage, FileText, Settings, Layers, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from "../lib/api";
import Table from '../components/table/Table';
import Pagination from "../components/Pagination";
import PageHeader from '../components/PageHeader';
import { pagesList } from '../data/pagesList';

const HeroImages = () => {
    const navigate = useNavigate();
    const { id: urlId } = useParams();
    const fileInputRef = useRef(null);

    // States
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        pageName: "",
        backgroundImage: null,
        imageAltText: "",
        title: "",
        heading: "",
        shortDescription: "",
        status: "Active"
    });

    useEffect(() => {
        fetchHeroImages();
        if (urlId) {
            handleEditById(urlId);
        }
    }, [urlId]);

    const fetchHeroImages = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/hero-background?t=${Date.now()}`);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditById = async (id) => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/hero-background/${id}?t=${Date.now()}`);
            if (response.data.success) {
                const item = response.data.data;
                populateForm(item);
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch details' });
        } finally {
            setIsLoading(false);
        }
    };

    const populateForm = (item) => {
        setEditMode(true);
        setEditId(item._id);
        setFormData({
            pageName: item.pageName,
            backgroundImage: null,
            imageAltText: item.imageAltText || "",
            title: item.title || "",
            heading: item.heading || "",
            shortDescription: item.shortDescription || "",
            status: item.status || "Active"
        });
        setImagePreview(`${SERVER_URL}${item.backgroundImage}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setFormData({
            pageName: "",
            backgroundImage: null,
            imageAltText: "",
            title: "",
            heading: "",
            shortDescription: "",
            status: "Active"
        });
        setImagePreview(null);
        setImageFile(null);
        setEditMode(false);
        setEditId(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (urlId) navigate('/hero-images');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 100KB Size check
        if (file.size > 100 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Image Too Large',
                text: 'Hero image should not exceed 100KB to maintain loading speed. Please compress and try again.',
                confirmButtonColor: '#23471d'
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setImagePreview(URL.createObjectURL(file));
        setImageFile(file);
    };

    const isRegistrationPage = (name) => {
        if (!name) return false;
        const n = name.toLowerCase();
        return n.includes("registration") || n.includes("book a stand");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.pageName) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please select a page' });
            return;
        }

        if (!editMode && !imageFile) {
            Swal.fire({ icon: 'warning', title: 'Required', text: 'Please upload a background image' });
            return;
        }

        try {
            setIsLoading(true);
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'backgroundImage') {
                    if (imageFile) dataToSend.append('backgroundImage', imageFile);
                } else {
                    dataToSend.append(key, formData[key]);
                }
            });

            let response;
            const currentId = editId || urlId;
            if (editMode && currentId) {
                response = await api.put(`/api/hero-background/update/${currentId}`, dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/api/hero-background/create', dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Success!', text: editMode ? 'Updated successfully' : 'Created successfully', timer: 2000, showConfirmButton: false });
                handleReset();
                fetchHeroImages();
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Operation failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete background for "${item.pageName}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                setIsLoading(true);
                const response = await api.delete(`/api/hero-background/delete/${item._id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Record has been removed.', 'success');
                    fetchHeroImages();
                }
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete record.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredData = data.filter(item =>
        item.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const columns = [
        {
            key: "index",
            label: "S.NO",
            width: "60px",
            render: (_, index) => <div className="font-bold text-gray-900">{startIndex + index + 1}</div>
        },
        {
            key: "backgroundImage",
            label: "IMAGE",
            render: (row) => (
                <div className="w-20 h-10 border-2 border-gray-200 overflow-hidden bg-gray-50 rounded">
                    <img
                        src={`${SERVER_URL}${row.backgroundImage}`}
                        alt={row.imageAltText || row.pageName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )
        },
        {
            key: "pageName",
            label: "PAGE NAME",
            render: (row) => <div className="font-bold text-[#1a5b32] uppercase text-xs tracking-wider">{row.pageName}</div>
        },
        {
            key: "details",
            label: "CONTENT INFO",
            render: (row) => (
                <div className="max-w-[250px]">
                    <p className="text-gray-900 font-bold text-xs truncate uppercase">{row.title || 'No Title'}</p>
                    <p className="text-gray-500 text-[10px] italic truncate">{row.heading || 'No Heading'}</p>
                </div>
            )
        },
        {
            key: "status",
            label: "STATUS",
            render: (row) => (
                <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.status === "Active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                    {row.status === "Active" ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    {row.status}
                </div>
            )
        }
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen rounded-lg">
            <PageHeader
                title="HERO BACKGROUND MANAGEMENT"
                description="Manage hero background images, titles, and headings for every page"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* LEFT: FORM SECTION */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-12 -mt-12 z-0 opacity-50"></div>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#1a5b32] relative z-10">
                            <LucideImage className="w-5 h-5 text-[#d26019]" /> {editMode ? 'Edit Background' : 'Add New Hero BG'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Select Page *</label>
                                <select
                                    name="pageName"
                                    value={formData.pageName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-[#1a5b32] outline-none shadow-sm text-sm"
                                >
                                    <option value="">-- Choose Website Page --</option>
                                    {pagesList.filter(page => page.name !== "General / Home" && page.name !== "Overview / Media & Blogs").map((page, i) => (
                                        <option key={i} value={page.name}>{page.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Hero Title (e.g. About Us)</label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter main title"
                                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 focus:border-[#1a5b32] outline-none shadow-sm text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Hero Heading (e.g. About IH&WE)</label>
                                <div className="relative">
                                    <Heading className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="heading"
                                        value={formData.heading}
                                        onChange={handleInputChange}
                                        placeholder="Enter section heading"
                                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 focus:border-[#1a5b32] outline-none shadow-sm text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Short Description</label>
                                <textarea
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Enter brief page description..."
                                    className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-[#1a5b32] outline-none shadow-sm text-sm resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-[#1a5b32] outline-none shadow-sm text-sm"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Image Alt (SEO)</label>
                                    <input
                                        type="text"
                                        name="imageAltText"
                                        value={formData.imageAltText}
                                        onChange={handleInputChange}
                                        placeholder="Alt text"
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-[#1a5b32] outline-none shadow-sm text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-[#23471d] uppercase tracking-widest mb-1 opacity-50">Upload Banner Image</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-all p-4 bg-gray-50 flex items-center justify-between">
                                        <div className="flex-1">
                                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[#23471d] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1a5b32] transition-colors shadow-sm">
                                                {imageFile ? "Change Image" : "Choose File"}
                                            </button>
                                            <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest leading-none">
                                                Recommended: {isRegistrationPage(formData.pageName) ? '1600 x 500 PX (16:5)' : '1600 x 400 PX (16:4)'} | Max: 100KB
                                            </p>
                                        </div>
                                        <ImageIcon className="w-8 h-8 text-gray-200" />
                                    </div>
                                    {imagePreview ? (
                                        <div className="relative group overflow-hidden">
                                            <div className={`w-full overflow-hidden border-2 border-gray-200 shadow-sm ${isRegistrationPage(formData.pageName) ? 'aspect-[16/5]' : 'aspect-[16/4]'}`}>
                                                <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                                            </div>
                                            <div className="absolute top-3 left-3 bg-[#23471d] text-white text-[10px] font-black px-3 py-1 uppercase tracking-[0.2em] shadow-lg">
                                                {imageFile ? 'New Selection' : 'Current Hero'}
                                            </div>
                                            {imageFile && (
                                                <button type="button" onClick={() => { setImageFile(null); setImagePreview(currentImage ? `${SERVER_URL}${currentImage}` : ''); if(fileInputRef.current) fileInputRef.current.value=''; }} className="absolute bottom-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-xl transition-transform hover:scale-110">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`w-full bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 ${isRegistrationPage(formData.pageName) ? 'aspect-[16/5]' : 'aspect-[16/4]'}`}>
                                            <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">No Banner Selected</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-[#1a5b32] text-white font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl hover:bg-[#144727] transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : editMode ? <><Save className="w-4 h-4" /> Update BG</> : <><Plus className="w-4 h-4" /> Save Background</>}
                                </button>
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-4 py-3 border-2 border-gray-300 text-gray-600 font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Requirements Alert */}
                    <div className="mt-6 flex bg-orange-50 border border-orange-100 p-4 shadow-sm items-start">
                        <Sparkles className="w-5 h-5 text-[#d26019] mt-0.5" />
                        <div className="ml-3">
                            <h3 className="text-xs font-black text-[#d26019] uppercase tracking-[0.2em]">Image Policy</h3>
                            <div className="mt-1 text-[10px] text-orange-700 uppercase leading-tight tracking-wider font-bold">
                                <p>Max size 100KB | Recommended: {isRegistrationPage(formData.pageName) ? '1600 x 500 PX (16:5)' : '1600 x 400 PX (16:4)'} | WebP recommended.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: DATA TABLE SECTION */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-md">
                        <div className="bg-[#1a5b32] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-green-300" /> Background List
                                </h2>
                                <p className="text-xs text-green-100 font-medium">Managing {filteredData.length} page specific backgrounds</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                <input
                                    type="text"
                                    placeholder="Search by page or title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 text-sm bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all rounded"
                                />
                            </div>
                        </div>

                        <div className="bg-white">
                            {isLoading && data.length === 0 ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-10 h-10 border-4 border-[#1a5b32] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : filteredData.length > 0 ? (
                                <>
                                    <Table
                                        columns={columns}
                                        data={paginatedData}
                                        onEdit={populateForm}
                                        onDelete={handleDelete}
                                    />
                                    <div className="p-4 border-t border-gray-100">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalItems={filteredData.length}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={setCurrentPage}
                                            label="backgrounds"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-24 bg-gray-50/30">
                                    <LucideImage className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">No Data Configured Yet</h3>
                                    <p className="text-[10px] text-gray-400 mt-2 uppercase">Your configured per-page heroes will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroImages;
