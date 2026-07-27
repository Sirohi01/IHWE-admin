import React, { useState, useEffect, useMemo } from "react";
import {
    FileText,
    File,
    CheckCircle2,
    Clock,
    XCircle,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Download,
    Share2,
    History,
    Check,
    Building2,
    FolderOpen,
    LayoutGrid,
    List as ListIcon,
    X,
    Trash2,
    ExternalLink,
    UploadCloud,
    ZoomIn,
    ZoomOut
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocumentRequirements } from "../../features/add_by_admin/document-requirements/DocumentRequirementSlice";
import { fetchClientDocuments, uploadClientDocument, updateDocumentStatus, addDocumentComment, deleteClientDocument } from "../../features/client-documents/ClientDocumentSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import docBanner from "../../assets/docBanner.webp";

const mockDocuments = [
    { id: 1, type: "MSME Related Documents", name: "MSME Registration Cert.", fullName: "MSME Registration Certificate", fileType: "PDF", size: "1.2 MB", date: "02 Jun 2026", status: "Approved", category: "MSME Related", uploader: "Wellness India Pvt. Ltd.", time: "11:20 AM", isUploaded: true },
    { id: 2, type: "MSME Related Documents", name: "Udyam Certificate", fullName: "Udyam Certificate", category: "MSME Related", isUploaded: false },
    { id: 3, type: "MSME Related Documents", name: "GST Certificate", fullName: "GST Certificate", fileType: "PDF", size: "1.3 MB", date: "30 May 2026", status: "Approved", category: "MSME Related", uploader: "Wellness India Pvt. Ltd.", time: "11:20 AM", isUploaded: true },
    { id: 4, type: "MSME Related Documents", name: "Bank Details Proof", fullName: "Bank Details Proof", category: "MSME Related", isUploaded: false },
    { id: 5, type: "MSME Related Documents", name: "Subsidy Eligibility", fullName: "MSME Subsidy Eligibility", fileType: "PDF", size: "1.4 MB", date: "28 May 2026", status: "Approved", category: "MSME Related", uploader: "Wellness India Pvt. Ltd.", isUploaded: false },

    { id: 6, type: "General Documents", name: "Company Profile", fullName: "Company Profile", fileType: "PDF", size: "2.4 MB", date: "02 Jun 2026", status: "Approved", category: "General Documents", uploader: "Wellness India Pvt. Ltd.", time: "11:20 AM", isUploaded: true },
    { id: 7, type: "General Documents", name: "Product Catalogue", fullName: "Product Catalogue", category: "General Documents", isUploaded: false },
    { id: 8, type: "General Documents", name: "Participation Form", fullName: "Participation Form", fileType: "DOCX", size: "1.1 MB", date: "30 May 2026", status: "Approved", category: "General Documents", uploader: "Wellness India Pvt. Ltd.", time: "11:20 AM", isUploaded: true },
    { id: 9, type: "General Documents", name: "Price List", fullName: "Price List", category: "General Documents", isUploaded: false },
    { id: 10, type: "General Documents", name: "Other Document", fullName: "Other Document", category: "General Documents", isUploaded: false },
];

const ClientDocuments = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id: clientId } = useParams();
    const { documents: clientDocs = [], loading } = useSelector((state) => state.clientDocuments || {});
    const { documentRequirements = [] } = useSelector((state) => state.documentRequirements || {});

    useEffect(() => {
        dispatch(fetchDocumentRequirements());
        if (clientId) {
            dispatch(fetchClientDocuments(clientId));
        }
    }, [dispatch, clientId]);

    const formattedDocs = useMemo(() => {
        return clientDocs.map(d => ({
            id: d._id,
            type: d.category,
            name: d.document_name,
            fullName: d.document_name,
            fileType: d.file_type || "FILE",
            size: d.size || "Unknown",
            date: new Date(d.added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: d.status,
            category: d.category === "MSME Related Documents" ? "MSME Related" : "General Documents",
            uploader: d.uploaded_by || "Admin Upload",
            time: new Date(d.added).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isUploaded: true,
            previewUrl: d.file_url ? (d.file_url.startsWith('http') ? d.file_url.replace(/\.pdf$/i, '.jpg') : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${d.file_url}`.replace('/api/uploads', '/uploads')) : "",
            originalPdfUrl: d.file_url || "",
            proxyDownloadUrl: d.file_url ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/client-documents/proxy/download?url=${encodeURIComponent(d.file_url)}&download=true` : "",
            proxyViewUrl: d.file_url ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/client-documents/proxy/download?url=${encodeURIComponent(d.file_url)}&download=false` : "",
            isImage: d.file_type && ['JPG', 'JPEG', 'PNG', 'GIF'].includes(d.file_type.toUpperCase())
        }));
    }, [clientDocs]);

    const [activeTab, setActiveTab] = useState("All Documents");
    const [filterStatus, setFilterStatus] = useState("All");
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [viewAllCategory, setViewAllCategory] = useState(null);
    const [uploadingDocId, setUploadingDocId] = useState(null);
    const [commentText, setCommentText] = useState("");

    const combinedDocuments = useMemo(() => {
        let combined = [...formattedDocs];
        const defaultRequirements = [
            { document_name: "MSME Registration Certificate", category: "MSME Related Documents", status: "Active", order: 1 },
            { document_name: "Udyam Certificate", category: "MSME Related Documents", status: "Active", order: 2 },
            { document_name: "GST Certificate", category: "MSME Related Documents", status: "Active", order: 3 },
            { document_name: "Bank Details Proof", category: "MSME Related Documents", status: "Active", order: 4 },
            { document_name: "Subsidy Eligibility", category: "MSME Related Documents", status: "Active", order: 5 },
            { document_name: "Company Profile", category: "General Documents", status: "Active", order: 6 },
            { document_name: "Product Catalogue", category: "General Documents", status: "Active", order: 7 },
            { document_name: "Participation Form", category: "General Documents", status: "Active", order: 8 },
            { document_name: "Price List", category: "General Documents", status: "Active", order: 9 },
            { document_name: "Other Document", category: "General Documents", status: "Active", order: 10 },
        ];

        const reqsToUse = documentRequirements.length > 0 ? documentRequirements : defaultRequirements;
        const activeRequirements = reqsToUse.filter(req => req.status === "Active");

        activeRequirements.forEach((req, index) => {
            const reqName = req.document_name?.trim()?.toLowerCase() || "";
            const alreadyExists = combined.some(d =>
                (d.fullName?.trim()?.toLowerCase() === reqName) ||
                (d.name?.trim()?.toLowerCase() === reqName)
            );

            if (!alreadyExists) {
                combined.push({
                    id: `req-${req._id || index}`,
                    type: req.category,
                    name: req.document_name,
                    fullName: req.document_name,
                    category: req.category === "MSME Related Documents" ? "MSME Related" : "General Documents",
                    isUploaded: false,
                    order: req.order || 0
                });
            }
        });

        // Assign order to existing documents from backend config
        combined.forEach(d => {
            if (d.order === undefined) {
                const docName1 = d.fullName?.trim().toLowerCase() || "";
                const docName2 = d.name?.trim().toLowerCase() || "";
                const req = reqsToUse.find(r => {
                    const rName = r.document_name?.trim().toLowerCase() || "";
                    return rName === docName1 || rName === docName2;
                });
                d.order = req ? (req.order || 0) : 999;
            }
        });

        // Sort by order ascending
        combined.sort((a, b) => a.order - b.order);

        return combined;
    }, [formattedDocs, documentRequirements]);

    useEffect(() => {
        if (!selectedDocument && combinedDocuments.length > 0) {
            setSelectedDocument(combinedDocuments[0]);
        } else if (selectedDocument) {
            const updatedDoc = combinedDocuments.find(d =>
                d.id === selectedDocument.id ||
                (d.fullName === selectedDocument.fullName && d.isUploaded)
            );
            if (updatedDoc && (
                updatedDoc.id !== selectedDocument.id ||
                updatedDoc.status !== selectedDocument.status ||
                updatedDoc.previewUrl !== selectedDocument.previewUrl
            )) {
                setSelectedDocument(updatedDoc);
            }
        }
    }, [combinedDocuments, selectedDocument]);

    const msmeDocs = combinedDocuments.filter(d => d.type === "MSME Related Documents" && (filterStatus === "All" || d.status === filterStatus));
    const generalDocs = combinedDocuments.filter(d => d.type === "General Documents" && (filterStatus === "All" || d.status === filterStatus));

    const stats = {
        total: formattedDocs.length,
        approved: formattedDocs.filter(d => d.status === "Approved").length,
        pending: formattedDocs.filter(d => d.status === "Pending").length,
        rejected: formattedDocs.filter(d => d.status === "Rejected").length
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedDocument || !selectedDocument.id || selectedDocument.id.toString().startsWith('req-')) return;

        let adminData = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        let adminName = "Admin";
        if (adminData) {
            try { adminName = JSON.parse(adminData).name || "Admin"; } catch (e) { }
        }

        try {
            await dispatch(updateDocumentStatus({ id: selectedDocument.id, status: newStatus, author: adminName })).unwrap();
            setSelectedDocument(prev => ({ ...prev, status: newStatus }));
            dispatch(fetchClientDocuments(clientId));
            toast.success(`Document marked as ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !selectedDocument || !selectedDocument.id || selectedDocument.id.toString().startsWith('req-')) return;

        let adminData = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        let adminName = "Admin";
        if (adminData) {
            try { adminName = JSON.parse(adminData).name || "Admin"; } catch (e) { }
        }

        try {
            await dispatch(addDocumentComment({ id: selectedDocument.id, text: commentText, author: adminName })).unwrap();
            setCommentText("");
            dispatch(fetchClientDocuments(clientId));
            toast.success("Comment added successfully");
        } catch (error) {
            toast.error("Failed to add comment");
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === "Approved") return <div className="text-[#16a34a] bg-[#dcfce7] text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">Approved</div>;
        if (status === "Pending") return <div className="text-[#f59e0b] bg-[#fef3c7] text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">Pending</div>;
        if (status === "Rejected") return <div className="text-[#dc2626] bg-[#fee2e2] text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">Rejected</div>;
        return null;
    };

    const FileIcon = ({ type }) => {
        if (type === "PDF") {
            return (
                <div className="bg-[#ef4444] text-white p-1 rounded-md shadow-sm">
                    <FileText size={14} strokeWidth={2.5} />
                </div>
            );
        }
        if (type === "DOCX") {
            return (
                <div className="bg-[#2563eb] text-white p-1 rounded-md shadow-sm">
                    <FileText size={14} strokeWidth={2.5} />
                </div>
            );
        }
        return <File size={16} className="text-gray-400" />;
    };

    const DocumentCard = ({ doc }) => {
        const isSelected = selectedDocument?.id === doc.id;

        const handleCardUpload = async (e) => {
            const file = e.target.files[0];
            if (!file || !clientId) return;

            setUploadingDocId(doc.id);
            const formData = new FormData();
            formData.append("client_id", clientId);
            formData.append("document_name", doc.fullName);
            formData.append("category", doc.type);
            formData.append("file", file);

            let adminData = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
            let adminName = "Admin Upload";
            if (adminData) {
                try { adminName = JSON.parse(adminData).name || "Admin Upload"; } catch (e) { }
            }
            formData.append("uploaded_by", adminName);

            try {
                await dispatch(uploadClientDocument(formData)).unwrap();
                await dispatch(fetchClientDocuments(clientId));
                toast.success("Document uploaded successfully");
            } catch (error) {
                toast.error("Failed to upload document");
            } finally {
                setUploadingDocId(null);
            }
        };

        const handleDelete = async (e) => {
            e.stopPropagation();
            if (window.confirm(`Are you sure you want to delete ${doc.fullName}?`)) {
                try {
                    await dispatch(deleteClientDocument(doc.id)).unwrap();
                    if (selectedDocument?.id === doc.id) {
                        setSelectedDocument(null);
                    }
                    dispatch(fetchClientDocuments(clientId));
                    toast.success("Document deleted successfully");
                } catch (error) {
                    toast.error("Failed to delete document");
                }
            }
        };

        return (
            <div
                onClick={() => setSelectedDocument(doc)}
                className={`bg-white rounded-xl px-2.5 py-1.5 cursor-pointer transition-all flex flex-col ${isSelected ? "border-[#2563eb] border ring-1 ring-blue-500/20 bg-blue-50/20" : "border-gray-100 border hover:border-blue-300"} relative`}
                style={!isSelected ? { boxShadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em' } : {}}
            >
                {!doc.isUploaded && !uploadingDocId && <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleCardUpload} accept="image/*,.pdf,.doc,.docx" />}
                <div className="flex justify-between items-start mb-2">
                    <StatusBadge status={doc.status || "Pending"} />
                    {doc.isUploaded ? (
                        <button className="text-red-400 hover:text-red-600 z-20 transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(e); }}><Trash2 size={12} /></button>
                    ) : (
                        <div className="w-3 h-3" />
                    )}
                </div>

                {/* Graphic representation */}
                <div className={`w-full h-10 rounded-lg mb-1.5 flex items-center justify-center border border-gray-100 ${!doc.isUploaded ? 'bg-gray-50 border-dashed' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
                    {!doc.isUploaded ? (
                        <div className="flex flex-col items-center text-gray-300">
                            {uploadingDocId === doc.id ? (
                                <div className="w-4 h-4 rounded-full border-[2px] border-blue-200 border-t-blue-600 animate-spin"></div>
                            ) : (
                                <>
                                    <UploadCloud size={18} />
                                    <span className="text-[7px] mt-0.5 font-semibold">Upload Required</span>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="opacity-20 flex flex-col items-center">
                            <div className="w-6 h-8 border-[1.5px] border-[#1E104E] rounded flex items-center justify-center relative">
                                <div className="absolute top-0 right-0 w-2 h-2 bg-[#1E104E] rounded-bl"></div>
                                <span className="text-[6px] font-black text-[#1E104E]">{doc.fileType}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    <h4 className="text-[10px] font-bold text-[#111844] truncate" title={doc.fullName}>{doc.fullName}</h4>
                    <div className="flex items-center gap-1 mt-0.5 text-[8px]">
                        {doc.isUploaded && <span className={`font-bold px-1 py-0.5 rounded ${doc.fileType === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{doc.fileType}</span>}
                        {doc.isUploaded && <span className="text-gray-300">•</span>}
                        <span className="font-medium text-slate-500">{doc.size || "-"}</span>
                    </div>
                    <div className="text-[8px] text-gray-900 font-medium mt-0.5">{doc.date || "-"}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#f5f7fb] min-h-screen pb-2">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Banner Section */}
            <div className="w-full -mt-1.5">
                <div className="w-full relative flex flex-col justify-center rounded-none shadow-sm mb-1">
                    <img loading="lazy" decoding="async" src={docBanner} alt="Documents Banner" className="w-full h-[90px] md:h-[110px] lg:h-[130px] object-cover object-center rounded-none block" />
                </div>
            </div>

            <div className="px-6 pb-2 flex flex-col font-inter">
                {/* Top Stats & Filters Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                    {/* Tabs */}
                    <div className="flex bg-white rounded-lg shadow-sm h-[40px] border-b border-gray-200">
                    {["All Documents", "MSME Related", "General Documents"].map((tab, idx) => (
                        <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center justify-center gap-1.5 px-2 md:px-3 h-full text-[10px] lg:text-[11px] font-semibold transition-all relative whitespace-nowrap ${
                            activeTab === tab 
                            ? "bg-[#f4f7fe] text-blue-700 rounded-lg" 
                            : "text-[#1E104E] hover:bg-gray-50 bg-white rounded-lg"
                        }`}
                        >
                        {idx === 0 && <FileText size={14} className={activeTab === tab ? "text-blue-600" : "text-[#1E104E]"} />}
                        {idx === 1 && <FileText size={14} className={activeTab === tab ? "text-blue-600" : "text-[#1E104E]"} />}
                        {idx === 2 && <FileText size={14} className={activeTab === tab ? "text-blue-600" : "text-[#1E104E]"} />}
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-b-lg"></div>
                        )}
                        </button>
                    ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
                            <div className="bg-blue-50 p-1 rounded-full"><FileText size={12} className="text-blue-600" /></div>
                            <div>
                            <p className="text-[9px] text-[#1E104E] font-semibold uppercase tracking-wider whitespace-nowrap">Total Documents</p>
                            <p className="text-xs font-bold text-blue-700">{stats.total}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
                            <div className="bg-emerald-50 p-1 rounded-full"><CheckCircle2 size={12} className="text-emerald-600" /></div>
                            <div>
                            <p className="text-[9px] text-[#1E104E] font-semibold uppercase tracking-wider whitespace-nowrap">Approved</p>
                            <p className="text-xs font-bold text-emerald-600">{stats.approved}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
                            <div className="bg-amber-50 p-1 rounded-full"><Clock size={12} className="text-amber-500" /></div>
                            <div>
                            <p className="text-[9px] text-[#1E104E] font-semibold uppercase tracking-wider whitespace-nowrap">Under Review</p>
                            <p className="text-xs font-bold text-amber-500">{stats.pending}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
                            <div className="bg-red-50 p-1 rounded-full"><XCircle size={12} className="text-red-500" /></div>
                            <div>
                            <p className="text-[9px] text-[#1E104E] font-semibold uppercase tracking-wider whitespace-nowrap">Rejected</p>
                            <p className="text-xs font-bold text-red-600">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="flex gap-4 relative">

                    {/* Left side content */}
                    <div className="flex-1 space-y-2">

                        {/* Filters */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex gap-2">
                                <button onClick={() => setFilterStatus("All")} className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors flex items-center gap-1 ${filterStatus === "All" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}>All ({stats.total})</button>
                                <button onClick={() => setFilterStatus("Approved")} className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors flex items-center gap-1 ${filterStatus === "Approved" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}><CheckCircle2 size={12} fill="#16a34a" color="white" strokeWidth={2.5} /> Approved ({stats.approved})</button>
                                <button onClick={() => setFilterStatus("Pending")} className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors flex items-center gap-1 ${filterStatus === "Pending" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}><Clock size={12} fill="#f59e0b" color="white" strokeWidth={2.5} /> Pending ({stats.pending})</button>
                                <button onClick={() => setFilterStatus("Rejected")} className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors flex items-center gap-1 ${filterStatus === "Rejected" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}><XCircle size={12} fill="#dc2626" color="white" strokeWidth={2.5} /> Rejected ({stats.rejected})</button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#111844] bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm">
                                    <span className="mr-1">Sort by:</span> <select className="bg-transparent font-bold text-[#0f172a] outline-none cursor-pointer"><option>Newest First</option></select>
                                </div>
                                <div className="flex gap-1 border border-gray-200 rounded-[10px] p-1 bg-white items-center shadow-sm">
                                    <button className="p-1 rounded bg-indigo-50 text-[#2563eb]"><LayoutGrid size={14} /></button>
                                    <button className="p-1 rounded text-gray-400 hover:bg-gray-50"><ListIcon size={14} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl mb-4 flex flex-col min-h-[385px] max-h-[385px]" style={{ boxShadow: 'rgba(9, 30, 66, 0.25) 0px 1px 1px, rgba(9, 30, 66, 0.13) 0px 0px 1px 1px' }}>
                            <div className="p-3 flex-1 overflow-y-auto">
                                {/* MSME Section */}
                                {(activeTab === "All Documents" || activeTab === "MSME Related") && msmeDocs.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-1">
                                            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5"><Building2 size={14} className="text-gray-400" /> MSME Related Documents</h3>
                                            <button onClick={() => setViewAllCategory("MSME Related Documents")} className="text-blue-600 text-[10px] font-bold hover:underline">View All</button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                                            {msmeDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                                        </div>
                                    </div>
                                )}

                                {/* General Section */}
                                {(activeTab === "All Documents" || activeTab === "General Documents") && generalDocs.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-1">
                                            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5"><FolderOpen size={14} className="text-gray-400" /> General Documents</h3>
                                            <button onClick={() => setViewAllCategory("General Documents")} className="text-blue-600 text-[10px] font-bold hover:underline">View All</button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                                            {generalDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Pagination Placeholder */}
                            <div className="flex justify-between items-center p-3 border-t border-gray-100 shrink-0 bg-white rounded-b-xl">
                                <span className="text-[10px] text-gray-900 font-medium">Showing 1 to 10 of {stats.total} documents</span>
                                <div className="flex items-center gap-1">
                                    <button className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-[10px]">&lt;</button>
                                    <button className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-600 text-white font-semibold shadow-sm text-[10px]">1</button>
                                    <button className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-semibold text-[10px]">2</button>
                                    <button className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-semibold text-[10px]">3</button>
                                    <button className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-[10px]">&gt;</button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar - Preview */}
                    <div className="w-[240px] lg:w-[260px] shrink-0 sticky top-4 h-fit bg-[#f9f8fd] rounded-xl overflow-hidden shadow-sm flex flex-col" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
                        {selectedDocument ? (
                            <>
                                <div className="p-3 flex justify-between items-start bg-gray-50/50 border-b border-gray-100">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-[10px] text-[#0f172a] leading-snug truncate pr-2" title={`Preview: ${selectedDocument.fullName}.${selectedDocument.fileType?.toLowerCase()}`}>Preview: {selectedDocument.fullName}.{selectedDocument.fileType?.toLowerCase()}</h4>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${selectedDocument.fileType === 'PDF' ? 'bg-red-50 text-[#ef4444]' : 'bg-blue-50 text-[#2563eb]'}`}>{selectedDocument.fileType}</span>
                                        <button onClick={() => setSelectedDocument(null)} className="text-gray-400 hover:text-gray-600"><X size={14} strokeWidth={2.5} /></button>
                                    </div>
                                </div>

                                {/* Preview Area */}
                                <div className="bg-gray-100 h-[180px] p-2 flex flex-col relative border-b border-gray-200">
                                    <div className="bg-[#323639] rounded-t-md px-2 py-1 flex justify-between items-center text-gray-300">
                                        <div className="flex gap-2">
                                            <FileText size={12} /> <span className="text-[9px]">1 / 1</span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <ZoomOut size={12} className="cursor-pointer hover:text-white" />
                                            <span className="text-[9px]">100%</span>
                                            <ZoomIn size={12} className="cursor-pointer hover:text-white" />
                                            <Download size={12} className="cursor-pointer hover:text-white ml-1" />
                                            <MoreVertical size={12} className="cursor-pointer hover:text-white" />
                                        </div>
                                    </div>
                                    <div className={`bg-white flex-1 overflow-hidden shadow-inner p-2 relative flex items-center justify-center ${selectedDocument.fileType === 'PDF' && selectedDocument.previewUrl ? 'overflow-hidden' : 'overflow-auto'}`}>
                                        {selectedDocument.previewUrl ? (
                                            selectedDocument.isImage || selectedDocument.fileType === 'PDF' ? (
                                                <div className="w-full h-full flex flex-col relative">
                                                    <img loading="lazy" decoding="async" src={selectedDocument.previewUrl} alt="Preview" className="max-w-full h-full object-contain bg-white" />
                                                    {selectedDocument.fileType === 'PDF' && (
                                                        <div className="absolute top-2 right-2 flex gap-2">
                                                            <a href={selectedDocument.proxyViewUrl || selectedDocument.originalPdfUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-1 rounded shadow-sm font-semibold flex items-center gap-1 z-10">
                                                                <ExternalLink size={12} /> Open PDF
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : selectedDocument.fileType === 'DOC' || selectedDocument.fileType === 'DOCX' ? (
                                                <div className="w-full h-full flex flex-col relative">
                                                    <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedDocument.originalPdfUrl || selectedDocument.previewUrl)}&embedded=true`} className="w-full flex-1 border-none bg-white" title="Document Preview" />
                                                </div>
                                            ) : (
                                                <div className="text-white flex flex-col items-center mt-4">
                                                    <FileText size={24} className="mb-2 text-gray-400" />
                                                    <p className="text-[10px] mb-2 text-gray-500">No preview for {selectedDocument.fileType}</p>
                                                    <a href={selectedDocument.proxyDownloadUrl || selectedDocument.originalPdfUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-[#2563eb] text-white rounded text-[9px] hover:bg-blue-700 transition-colors">Download</a>
                                                </div>
                                            )
                                        ) : (
                                            <div className="w-full h-full border border-gray-100 flex flex-col items-center p-6 text-center opacity-80" style={{ background: 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #ffffff 10px, #ffffff 20px)' }}>
                                                <img loading="lazy" decoding="async" src="/logo.png" alt="Logo" className="w-16 mb-4 grayscale opacity-50" />
                                                <h5 className="font-bold text-gray-800 text-sm mb-1 uppercase tracking-wide">{selectedDocument.fullName}</h5>
                                                <div className="w-12 h-0.5 bg-gray-300 mx-auto mb-4"></div>
                                                <div className="w-full space-y-2">
                                                    <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                                                    <div className="h-1.5 bg-gray-200 rounded w-[80%] mx-auto"></div>
                                                    <div className="h-1.5 bg-gray-200 rounded w-[90%] mx-auto"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
                                    <div>
                                        <h4 className="font-bold text-[#0f172a] mb-2 text-[10px] uppercase tracking-wider">Document Details</h4>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-2">
                                            <div>
                                                <div className="text-[#334155] text-[9px] font-medium">Status</div>
                                                <div className={`font-bold text-[10px] mt-0.5 ${selectedDocument.status === 'Approved' ? 'text-green-600' : selectedDocument.status === 'Pending' ? 'text-[#f59e0b]' : 'text-red-600'}`}>
                                                    {selectedDocument.status}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[#334155] text-[9px] font-medium">Uploaded On</div>
                                                <div className="font-bold text-[#0f172a] text-[10px] mt-0.5">{selectedDocument.date}</div>
                                            </div>
                                            <div>
                                                <div className="text-[#334155] text-[9px] font-medium">Uploaded By</div>
                                                <div className="font-bold text-[#0f172a] text-[10px] mt-0.5 truncate" title={selectedDocument.uploader}>{selectedDocument.uploader}</div>
                                            </div>
                                            <div>
                                                <div className="text-[#334155] text-[9px] font-medium">File Size</div>
                                                <div className="font-bold text-[#0f172a] text-[10px] mt-0.5">{selectedDocument.size}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-[#334155] text-[9px] font-medium">Document Type</div>
                                                <div className="font-bold text-[#0f172a] text-[10px] mt-0.5">{selectedDocument.category}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-[#0f172a] mb-2 text-[10px] uppercase tracking-wider">Actions</h4>
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            <button onClick={() => handleStatusChange("Approved")} className="bg-[#16a34a] hover:bg-green-700 text-white rounded-lg py-1.5 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[9px]">
                                                <CheckCircle2 size={10} strokeWidth={2.5} /> <span className="whitespace-nowrap">Approve</span>
                                            </button>
                                            <button onClick={() => handleStatusChange("Pending")} className="bg-[#f59e0b] hover:bg-orange-600 text-white rounded-lg py-1.5 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[9px]">
                                                <Clock size={10} strokeWidth={2.5} /> <span className="whitespace-nowrap">Pending</span>
                                            </button>
                                            <button onClick={() => handleStatusChange("Rejected")} className="bg-[#ef4444] hover:bg-red-700 text-white rounded-lg py-1.5 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[9px]">
                                                <XCircle size={10} strokeWidth={2.5} /> <span className="whitespace-nowrap">Reject</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <a 
                                                href={selectedDocument.originalPdfUrl ? (() => {
                                                    let url = selectedDocument.originalPdfUrl;
                                                    if (!url.startsWith('http')) url = `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace('/api', '')}${url}`;
                                                    if (url.startsWith('http://res.cloudinary.com')) url = url.replace('http://', 'https://');
                                                    return url;
                                                })() : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] rounded-lg py-1.5 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[10px] ${!selectedDocument.originalPdfUrl || !selectedDocument.isUploaded ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
                                            >
                                                <ZoomIn size={12} /> View
                                            </a>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (!selectedDocument || !selectedDocument.isUploaded) return;

                                                    let url = selectedDocument.proxyDownloadUrl || selectedDocument.originalPdfUrl;
                                                    if (!url) return;

                                                    if (!url.startsWith('http')) {
                                                        url = `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace('/api', '')}${url}`;
                                                    }
                                                    
                                                    toast.info(`Downloading ${selectedDocument.fullName}...`, { autoClose: 1500 });
                                                    
                                                    fetch(url)
                                                        .then(response => {
                                                            if (!response.ok) throw new Error('Network response failed');
                                                            return response.blob();
                                                        })
                                                        .then(blob => {
                                                            const blobUrl = window.URL.createObjectURL(blob);
                                                            const link = document.createElement('a');
                                                            link.href = blobUrl;
                                                            link.download = `${selectedDocument.fullName}.${selectedDocument.fileType?.toLowerCase() || 'pdf'}`;
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                            window.URL.revokeObjectURL(blobUrl);
                                                        })
                                                        .catch(err => {
                                                            console.error("Fetch download failed:", err);
                                                            toast.error("Download failed. The file may be restricted, deleted, or you may need to re-upload it.");
                                                        });
                                                }}
                                                className={`bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] rounded-lg py-1.5 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[10px] ${!selectedDocument.proxyDownloadUrl || !selectedDocument.isUploaded ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
                                            >
                                                <Download size={12} /> Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                <FileText size={48} className="mb-4 text-gray-300" />
                                <p className="text-[10px]">Select a document to preview details</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* View All Modal */}
            {viewAllCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-[90%] lg:max-w-7xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
                        <div className="p-4 px-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-[16px] font-bold text-[#0f172a]">{viewAllCategory}</h2>
                            <button onClick={() => setViewAllCategory(null)} className="text-gray-500 hover:text-gray-800 p-1.5 bg-white rounded-md shadow-sm border border-gray-200 transition-colors">
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {combinedDocuments.filter(d => d.type === viewAllCategory).map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ClientDocuments;
