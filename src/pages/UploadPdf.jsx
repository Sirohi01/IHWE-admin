import { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from "../lib/api";
import {
    FileText,
    Upload,
    Trash2,
    Plus,
    X,
    Check,
    Search,
    ChevronDown,
    File,
    Settings,
    Eye
} from 'lucide-react';
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';


const UploadPdf = () => {
    // ✅ Categories + Sub Categories (Navbar structure)
    const pdfCategories = [
        {
            label: "E-Brochure",
            subItems: [
                { label: "Modular Furniture" },
                { label: "Office Furniture" },
                { label: "Modular Kitchen" },
                { label: "Spa & Panchkula" },
            ],
        },
        {
            label: "Newsletter",
            subItems: [
                { label: "Corporate Interior" },
                { label: "Residential Interior" },
            ],
        },
        {
            label: "Company Profile",
            subItems: [],
        },
    ];

    const [pdfList, setPdfList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [pdfForm, setPdfForm] = useState({
        category: "",
        subCategory: "",
        pdfTitle: "",
        pdfFile: null,
        status: "Active",
    });

    const formRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/pdf-manager');
            if (response.data.success) {
                setPdfList(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching PDF data:', error);
            // Fallback to empty if API not ready
            setPdfList([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePdfFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPdfForm(prev => ({ ...prev, pdfFile: file }));
        }
    };

    const resetForm = () => {
        setPdfForm({
            category: "",
            subCategory: "",
            pdfTitle: "",
            pdfFile: null,
            status: "Active",
        });
        setEditMode(false);
        setCurrentId(null);
    };

    const openAddForm = () => {
        resetForm();
        setEditMode(false);
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const openEditForm = (row) => {
        setEditMode(true);
        setCurrentId(row._id || row.id);
        setPdfForm({
            category: row.category,
            subCategory: row.subCategory || "",
            pdfTitle: row.pdfTitle,
            pdfFile: null,
            status: row.status,
        });
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handlePdfSubmit = async (e) => {
        e.preventDefault();

        const selectedCategoryObj = pdfCategories.find(c => c.label === pdfForm.category);
        const subCategories = selectedCategoryObj?.subItems || [];
        const needsSubCategory = subCategories.length > 0;

        if (!pdfForm.category || (needsSubCategory && !pdfForm.subCategory) || !pdfForm.pdfTitle || (!pdfForm.pdfFile && !editMode)) {
            Swal.fire('Error', 'Please fill all required fields', 'error');
            return;
        }

        setIsActionLoading(true);
        try {
            const formData = new FormData();
            formData.append('category', pdfForm.category);
            formData.append('subCategory', pdfForm.subCategory);
            formData.append('pdfTitle', pdfForm.pdfTitle);
            formData.append('status', pdfForm.status);

            if (pdfForm.pdfFile) {
                formData.append('pdfFile', pdfForm.pdfFile);
            }

            let response;
            if (editMode) {
                response = await api.put(`/api/pdf-manager/${currentId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/api/pdf-manager', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                Swal.fire('Success', editMode ? 'PDF updated successfully' : 'PDF added successfully', 'success');
                setShowForm(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error saving PDF:', error);
            Swal.fire('Error', 'Failed to save PDF', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeletePdf = async (row) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete "${row.pdfTitle}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/pdf-manager/${row._id || row.id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'PDF has been deleted.', 'success');
                    fetchData();
                }
            } catch (error) {
                console.error('Error deleting PDF:', error);
                Swal.fire('Error', 'Failed to delete PDF', 'error');
            }
        }
    };

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (row, index) => <div className="font-semibold">{index + 1}</div>
        },
        {
            key: "pdfTitle",
            label: "PDF TITLE",
            render: (row) => <div className="font-medium text-gray-800">{row.pdfTitle}</div>
        },
        {
            key: "category",
            label: "CATEGORY",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-blue-600">{row.category}</span>
                    {row.subCategory && <span className="text-[10px] text-gray-400 uppercase">{row.subCategory}</span>}
                </div>
            )
        },
        {
            key: "pdfUrl",
            label: "FILE PATH",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-red-500" />
                    <code className="text-xs text-gray-500 truncate max-w-[200px]">{row.pdfUrl}</code>
                    <a href={`${SERVER_URL}${row.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:text-blue-700 bg-blue-50 rounded-full transition-all" title="View/Download PDF">
                        <Eye size={14} />
                    </a>
                </div>
            )
        },
        {
            key: "status",
            label: "STATUS",
            render: (row) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ];

    const selectedCategoryObj = pdfCategories.find(c => c.label === pdfForm.category);
    const subCategories = selectedCategoryObj?.subItems || [];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="PDF DOCUMENT MANAGEMENT"
                description="Manage e-brochures, newsletters and company profiles"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Global Info / Status */}
                {/* <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded">
                                <Settings className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">Information</h2>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                            <p>Select a category from the list to start adding or managing PDF documents.</p>
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 italic">
                                "Organize your documents professionally to help users download the right resources."
                            </div>
                            <div className="pt-4 space-y-2">
                                <h4 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Guide:</h4>
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                    <li>E-Brochures support sub-categories.</li>
                                    <li>Company profiles are direct documents.</li>
                                    <li>Status 'Active' makes them visible on frontend.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Main Action Area */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Add/Edit Form */}
                    {showForm && (
                        <div ref={formRef} className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-semibold text-[#1e3a8a] uppercase tracking-tight">
                                    {editMode ? 'Edit PDF Document' : 'Upload New PDF'}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handlePdfSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Side */}
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">Main Category *</label>
                                            <select
                                                value={pdfForm.category}
                                                onChange={(e) => setPdfForm({ ...pdfForm, category: e.target.value, subCategory: '' })}
                                                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded bg-white text-sm font-medium"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {pdfCategories.map(cat => (
                                                    <option key={cat.label} value={cat.label}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {subCategories.length > 0 && (
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">Sub Category *</label>
                                                <select
                                                    value={pdfForm.subCategory}
                                                    onChange={(e) => setPdfForm({ ...pdfForm, subCategory: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded bg-white text-sm font-medium"
                                                    required
                                                >
                                                    <option value="">Select Sub Category</option>
                                                    {subCategories.map(sub => (
                                                        <option key={sub.label} value={sub.label}>{sub.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">PDF Display Title *</label>
                                            <input
                                                type="text"
                                                value={pdfForm.pdfTitle}
                                                onChange={(e) => setPdfForm({ ...pdfForm, pdfTitle: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-gray-800"
                                                placeholder="e.g. Latest Modular Furniture Catalogue"
                                                required
                                            />
                                        </div> */}
                                    </div>

                                    {/* Right Side */}
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">PDF File {editMode ? '(Optional)' : '*'}</label>
                                            <div className="border border-dashed border-gray-300 p-4 text-center relative group min-h-[120px] flex items-center justify-center bg-gray-50/30 rounded-lg hover:border-[#1e3a8a] transition-colors overflow-hidden">
                                                <input
                                                    type="file"
                                                    onChange={handlePdfFileChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    accept="application/pdf"
                                                />
                                                {pdfForm.pdfFile ? (
                                                    <div className="text-center">
                                                        <FileText className="w-8 h-8 text-red-500 mx-auto mb-1" />
                                                        <p className="text-xs font-bold text-gray-700 truncate max-w-[200px]">{pdfForm.pdfFile.name}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Click to Change</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center py-4">
                                                        <Upload className="w-8 h-8 text-gray-300 mb-2" />
                                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Click to upload PDF document</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-widest">Publication Status</label>
                                            <select
                                                value={pdfForm.status}
                                                onChange={(e) => setPdfForm({ ...pdfForm, status: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded bg-white text-sm font-medium"
                                            >
                                                <option value="Active">Published (Active)</option>
                                                <option value="Inactive">Draft (Inactive)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-5 py-2 border border-gray-300 font-semibold text-gray-500 hover:bg-white rounded transition-all uppercase text-[10px] tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isActionLoading}
                                        className="px-8 py-2 bg-[#1e3a8a] text-white font-semibold rounded hover:bg-[#162a63] transition-all shadow flex items-center gap-2 uppercase text-[10px] tracking-widest disabled:opacity-50"
                                    >
                                        {isActionLoading ? (
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : <Check className="w-4 h-4" />}
                                        {editMode ? 'Update PDF' : 'Publish PDF'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* PDF List Table */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#1e3a8a] flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Uploaded Documents</h2>
                                <p className="text-[10px] text-blue-100 uppercase mt-0.5 font-medium">{pdfList.length} Items Indexed</p>
                            </div>
                            {!showForm && (
                                <button
                                    onClick={openAddForm}
                                    className="px-4 py-1.5 bg-white text-[#1e3a8a] font-semibold text-[10px] uppercase rounded flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    New PDF Upload
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
                                    data={pdfList}
                                    onEdit={openEditForm}
                                    onDelete={handleDeletePdf}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPdf;
