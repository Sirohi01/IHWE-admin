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
    Trash2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocumentRequirements } from "../../features/add_by_admin/document-requirements/DocumentRequirementSlice";
import { fetchClientDocuments, uploadClientDocument, updateDocumentStatus, addDocumentComment, deleteClientDocument } from "../../features/client-documents/ClientDocumentSlice";
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
            previewUrl: d.file_url ? (d.file_url.startsWith('http') ? d.file_url : `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${d.file_url}`.replace('/api/uploads', '/uploads')) : "",
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
        } catch (err) {
            alert("Failed to update status");
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
        } catch (error) {
            alert("Failed to add comment");
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === "Approved") return <div className="text-[#16a34a] bg-[#dcfce7] text-[10px] px-2.5 py-1 rounded-md font-semibold tracking-wide">Approved</div>;
        if (status === "Pending") return <div className="text-[#f59e0b] bg-[#fef3c7] text-[10px] px-2.5 py-1 rounded-md font-semibold tracking-wide">Pending</div>;
        if (status === "Rejected") return <div className="text-[#dc2626] bg-[#fee2e2] text-[10px] px-2.5 py-1 rounded-md font-semibold tracking-wide">Rejected</div>;
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
            } catch (error) {
                alert("Failed to upload document");
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
                } catch (error) {
                    alert("Failed to delete document");
                }
            }
        };

        if (!doc.isUploaded) {
            const isUploading = uploadingDocId === doc.id;
            return (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-gray-100 transition-colors h-full min-h-[220px] relative">
                    {!isUploading && <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleCardUpload} accept="image/*,.pdf,.doc,.docx" />}

                    {isUploading ? (
                        <div className="w-10 h-10 rounded-full border-[3px] border-blue-200 border-t-blue-600 animate-spin flex items-center justify-center mb-3"></div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                            <Download size={20} className="rotate-180" />
                        </div>
                    )}
                    <h4 className="font-semibold text-[13px] text-gray-800 mb-1">{doc.name}</h4>
                    <span className="text-[11px] text-gray-500 px-2">{isUploading ? "Uploading..." : "Click to upload document"}</span>
                </div>
            );
        }

        return (
            <div
                onClick={() => setSelectedDocument(doc)}
                className={`bg-white rounded-[16px] p-3 cursor-pointer transition-all ${isSelected ? "border-[#2563eb] border-[1.5px] shadow-sm bg-blue-50/10" : "border-gray-200 border hover:border-gray-300 hover:shadow-sm"} flex flex-col min-h-[240px]`}
            >
                <div className="flex justify-between items-start mb-3 h-6">
                    <StatusBadge status={doc.status} />
                    <div className="flex gap-2 items-center">
                        <FileIcon type={doc.fileType} />
                    </div>
                </div>

                {/* Thumbnail Placeholder */}
                <div className="h-40 bg-gray-50 border border-gray-100 rounded-[10px] mb-4 flex items-center justify-center relative overflow-hidden group">
                    {doc.previewUrl ? (
                        doc.isImage ? (
                            <img src={doc.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : doc.fileType === 'PDF' ? (
                            <div className="w-full h-full relative pointer-events-none overflow-hidden bg-white">
                                <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.previewUrl)}&embedded=true`} className="absolute top-0 left-0 w-full h-[150%] -mt-4 border-none pointer-events-none" scrolling="no" />
                            </div>
                        ) : (
                            <div className="text-center p-2 text-gray-400 text-[10px] font-semibold px-4 w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
                                <span className="truncate whitespace-normal line-clamp-3 text-center opacity-60 uppercase tracking-widest leading-relaxed">{doc.fileType || "DOCUMENT"}</span>
                            </div>
                        )
                    ) : (
                        <div className="text-center p-2 text-gray-400 text-[10px] font-semibold px-4 w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
                            <span className="truncate whitespace-normal line-clamp-3 text-center opacity-60 uppercase tracking-widest leading-relaxed">{doc.fullName}</span>
                        </div>
                    )}
                    <button onClick={handleDelete} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 bg-white/90 shadow-sm rounded-md opacity-100 transition-colors hover:bg-red-50" title="Delete Document">
                        <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="mt-auto px-1">
                    <h4 className="font-bold text-[14px] text-[#0f172a] truncate mb-1.5" title={doc.fullName}>{doc.fullName}</h4>
                    <div className="flex text-[12px] text-gray-500 items-center justify-between">
                        <span>{doc.fileType} • {doc.size}</span>
                    </div>
                    <div className="text-[12px] text-gray-500 mt-1">{doc.date}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#f5f7fb] min-h-screen pb-2">

            {/* Banner Section */}
            <div className="w-full shadow-sm mb-2">
                <img src={docBanner} alt="Documents Banner" className="w-full h-auto block" />
            </div>

            <div className="px-6 py-2">

                {/* Main Grid Layout */}
                <div className="grid grid-cols-[1fr_380px] gap-4">

                    {/* Left side content */}
                    <div className="space-y-2">

                        {/* Filters */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-3">
                                <button onClick={() => setFilterStatus("All")} className={`px-5 py-2.5 rounded-[5px] text-[13px] font-semibold border transition-colors flex items-center gap-2 ${filterStatus === "All" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}>All ({stats.total})</button>
                                <button onClick={() => setFilterStatus("Approved")} className={`px-5 py-2.5 rounded-[5px] text-[13px] font-semibold border transition-colors flex items-center gap-2 ${filterStatus === "Approved" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}><CheckCircle2 size={16} fill="#16a34a" color="white" strokeWidth={2.5} /> Approved ({stats.approved})</button>
                                <button onClick={() => setFilterStatus("Pending")} className={`px-5 py-2.5 rounded-[5px] text-[13px] font-semibold border transition-colors flex items-center gap-2 ${filterStatus === "Pending" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}><Clock size={16} fill="#f59e0b" color="white" strokeWidth={2.5} /> Pending ({stats.pending})</button>
                                <button onClick={() => setFilterStatus("Rejected")} className={`px-5 py-2.5 rounded-[5px] text-[13px] font-semibold border transition-colors flex items-center gap-2 ${filterStatus === "Rejected" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}><XCircle size={16} fill="#dc2626" color="white" strokeWidth={2.5} /> Rejected ({stats.rejected})</button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center text-[13px] text-gray-600 border border-gray-200 bg-white rounded-[10px] px-3 py-2.5">
                                    <span className="mr-1">Sort by:</span> <select className="bg-transparent font-semibold text-[#0f172a] outline-none cursor-pointer"><option>Newest First</option></select>
                                </div>
                                <div className="flex gap-2 border border-gray-200 rounded-[10px] p-1 bg-white items-center">
                                    <button className="p-1.5 rounded-lg bg-indigo-50 text-[#2563eb]"><LayoutGrid size={18} /></button>
                                    <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50"><ListIcon size={18} /></button>
                                </div>
                            </div>
                        </div>

                        {/* MSME Section */}
                        {(activeTab === "All Documents" || activeTab === "MSME Related") && msmeDocs.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold flex items-center gap-2 text-gray-800"><Building2 size={18} className="text-gray-400" /> MSME Related Documents</h3>
                                    <button onClick={() => setViewAllCategory("MSME Related Documents")} className="text-blue-600 text-[12px] font-semibold hover:underline">View All</button>
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {msmeDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                                </div>
                            </div>
                        )}

                        {/* General Section */}
                        {(activeTab === "All Documents" || activeTab === "General Documents") && generalDocs.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold flex items-center gap-2 text-gray-800"><FolderOpen size={18} className="text-gray-400" /> General Documents</h3>
                                    <button onClick={() => setViewAllCategory("General Documents")} className="text-blue-600 text-[12px] font-semibold hover:underline">View All</button>
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {generalDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex items-center justify-between text-[12px] text-gray-500 pt-2">
                            <span>Showing 1 to 10 of 24 documents</span>
                            <div className="flex gap-1">
                                <button className="w-7 h-7 rounded border bg-white flex items-center justify-center hover:bg-gray-50"><ChevronLeft size={14} /></button>
                                <button className="w-7 h-7 rounded bg-blue-600 text-white font-medium flex items-center justify-center">1</button>
                                <button className="w-7 h-7 rounded border bg-white flex items-center justify-center hover:bg-gray-50">2</button>
                                <button className="w-7 h-7 rounded border bg-white flex items-center justify-center hover:bg-gray-50">3</button>
                                <button className="w-7 h-7 rounded border bg-white flex items-center justify-center hover:bg-gray-50"><ChevronRight size={14} /></button>
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar - Preview */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col sticky top-4 max-h-[calc(100vh-45px)]">
                        {selectedDocument ? (
                            <>
                                <div className="p-4 flex justify-between items-center bg-white">
                                    <div className="font-bold text-[14px] text-[#0f172a] truncate pr-2">Preview: {selectedDocument.fullName}.{selectedDocument.fileType?.toLowerCase()}</div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${selectedDocument.fileType === 'PDF' ? 'border-[#ef4444] text-[#ef4444]' : 'border-[#2563eb] text-[#2563eb]'}`}>{selectedDocument.fileType}</span>
                                        <button onClick={() => setSelectedDocument(null)} className="text-gray-900 hover:text-gray-700"><X size={18} strokeWidth={2.5} /></button>
                                    </div>
                                </div>

                                {/* Preview Area Placeholder */}
                                <div className="mx-4 h-[280px] flex-shrink-0 flex flex-col rounded-xl overflow-hidden border border-gray-200">
                                    {/* Mock PDF Toolbar */}
                                    <div className="bg-[#323639] text-gray-300 px-4 py-2.5 flex items-center justify-between text-[13px] shrink-0">
                                        <div className="flex items-center gap-4">
                                            <div className="p-1 rounded text-white/90 border border-white/20"><FileText size={14} /></div>
                                            <span className="font-medium text-white tracking-widest text-[12px]">1 / 1</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-white font-medium">
                                            <button className="hover:text-white opacity-80 transition-opacity">−</button>
                                            <span>100%</span>
                                            <button className="hover:text-white opacity-80 transition-opacity">+</button>
                                        </div>
                                        <div className="flex items-center gap-4 text-white">
                                            <button className="hover:text-white opacity-80 transition-opacity"><Download size={16} /></button>
                                            <button className="hover:text-white opacity-80 transition-opacity"><MoreVertical size={16} /></button>
                                        </div>
                                    </div>

                                    {/* Document Area */}
                                    <div className={`flex-1 flex items-center justify-center bg-[#525659] ${selectedDocument.fileType === 'PDF' && selectedDocument.previewUrl ? 'overflow-hidden' : 'overflow-auto p-4'}`}>
                                        {selectedDocument.previewUrl ? (
                                            selectedDocument.isImage ? (
                                                <img src={selectedDocument.previewUrl} alt="Preview" className="max-w-full shadow-lg object-contain bg-white" />
                                            ) : selectedDocument.fileType === 'PDF' || selectedDocument.fileType === 'DOC' || selectedDocument.fileType === 'DOCX' ? (
                                                <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedDocument.previewUrl)}&embedded=true`} className="w-full h-full border-none bg-white" />
                                            ) : (
                                                <div className="text-white flex flex-col items-center mt-10">
                                                    <FileText size={48} className="mb-2 text-gray-400" />
                                                    <p className="text-sm mb-4">Preview not available for {selectedDocument.fileType} files.</p>
                                                    <a href={selectedDocument.previewUrl} download className="px-4 py-2 bg-[#2563eb] text-white rounded text-sm hover:bg-blue-700 transition-colors">Download File</a>
                                                </div>
                                            )
                                        ) : (
                                            <div className="bg-white w-[90%] shadow-lg flex items-center justify-center overflow-hidden p-6">
                                                <div className="text-center w-full">
                                                    <div className="text-[10px] uppercase font-bold text-[#0f172a] mb-4 border-b pb-3">Government of India<br />Ministry of Micro, Small & Medium Enterprises</div>
                                                    <h2 className="text-[#f59e0b] font-bold text-[12px] mb-5 tracking-wide">UDYAM REGISTRATION CERTIFICATE</h2>
                                                    <div className="space-y-3 text-left">
                                                        <div className="flex border-b border-gray-100 pb-2">
                                                            <div className="w-1/2 text-[9px] font-bold text-[#0f172a]">UDYAM REGISTRATION NUMBER</div>
                                                            <div className="w-1/2 text-[10px] font-medium text-gray-700">UDYAM-DL-01-0001234</div>
                                                        </div>
                                                        <div className="flex border-b border-gray-100 pb-2">
                                                            <div className="w-1/2 text-[9px] font-bold text-[#0f172a]">NAME OF ENTERPRISE</div>
                                                            <div className="w-1/2 text-[10px] font-medium text-gray-700">{selectedDocument.uploader}</div>
                                                        </div>
                                                        <div className="flex border-b border-gray-100 pb-2">
                                                            <div className="w-1/2 text-[9px] font-bold text-[#0f172a]">TYPE OF ENTERPRISE</div>
                                                            <div className="w-1/2 text-[10px] font-medium text-gray-700">Micro</div>
                                                        </div>
                                                        <div className="flex border-b border-gray-100 pb-2">
                                                            <div className="w-1/2 text-[9px] font-bold text-[#0f172a]">MAJOR ACTIVITY</div>
                                                            <div className="w-1/2 text-[10px] font-medium text-gray-700">Services</div>
                                                        </div>
                                                        <div className="flex border-b border-gray-100 pb-2">
                                                            <div className="w-1/2 text-[9px] font-bold text-[#0f172a]">SOCIAL CATEGORY</div>
                                                            <div className="w-1/2 text-[10px] font-medium text-gray-700">General</div>
                                                        </div>
                                                        <div className="flex border-b border-gray-100 pb-2">
                                                            <div className="w-1/2 text-[9px] font-bold text-[#0f172a]">DATE OF INCORPORATION /<br />REGISTRATION OF ENTERPRISE</div>
                                                            <div className="w-1/2 text-[10px] font-medium text-gray-700">15/03/2022</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar text-[12px] bg-gray-50/20">
                                    <h4 className="font-bold text-[#0f172a] mb-3 text-[14px]">Document Details</h4>

                                    <div className="grid grid-cols-[22%_39%_39%] gap-y-4 gap-x-2 mb-3">
                                        <div>
                                            <div className="text-[#334155] text-[11px]">Status</div>
                                            <div className={`font-bold text-[13px] leading-tight mt-0.5 ${selectedDocument.status === 'Approved' ? 'text-green-600' : selectedDocument.status === 'Pending' ? 'text-[#f59e0b]' : 'text-red-600'}`}>
                                                {selectedDocument.status}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[#334155] text-[11px]">Uploaded On</div>
                                            <div className="font-bold text-[#0f172a] text-[12px] leading-tight mt-0.5 whitespace-nowrap">{selectedDocument.date}, {selectedDocument.time}</div>
                                        </div>
                                        <div>
                                            <div className="text-[#334155] text-[11px]">Uploaded By</div>
                                            <div className="font-bold text-[#0f172a] text-[12px] leading-tight mt-0.5 whitespace-nowrap">{selectedDocument.uploader}</div>
                                        </div>
                                        <div>
                                            <div className="text-[#334155] text-[11px]">File Size</div>
                                            <div className="font-bold text-[#0f172a] text-[13px] leading-tight mt-0.5">{selectedDocument.size}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-[#334155] text-[11px]">Document Type</div>
                                            <div className="font-bold text-[#0f172a] text-[13px] leading-tight mt-0.5">{selectedDocument.category}</div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100 -mx-4 mb-2"></div>

                                    <h4 className="font-bold text-[#0f172a] mb-3 text-[14px]">Actions</h4>
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        <button onClick={() => handleStatusChange("Approved")} className="bg-[#16a34a] hover:bg-green-700 text-white rounded-[6px] py-2 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[11px]">
                                            <CheckCircle2 size={12} strokeWidth={2.5} /> <span className="whitespace-nowrap">Approve</span>
                                        </button>
                                        <button onClick={() => handleStatusChange("Pending")} className="bg-[#f59e0b] hover:bg-orange-600 text-white rounded-[6px] py-2 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[11px]">
                                            <Clock size={12} strokeWidth={2.5} /> <span className="whitespace-nowrap">Mark as Pending</span>
                                        </button>
                                        <button onClick={() => handleStatusChange("Rejected")} className="bg-[#ef4444] hover:bg-red-700 text-white rounded-[6px] py-2 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[11px]">
                                            <XCircle size={12} strokeWidth={2.5} /> <span className="whitespace-nowrap">Reject</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        <button className="bg-[#2563eb] hover:bg-blue-700 text-white rounded-[6px] py-2 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[11px]">
                                            <Download size={12} strokeWidth={2.5} /> <span className="whitespace-nowrap">Download</span>
                                        </button>
                                        <button className="bg-[#6366f1] hover:bg-indigo-700 text-white rounded-[6px] py-2 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[11px]">
                                            <Share2 size={12} strokeWidth={2.5} /> <span className="whitespace-nowrap">Share</span>
                                        </button>
                                        <button className="bg-white border border-gray-200 hover:bg-gray-50 text-[#0f172a] rounded-[6px] py-2 px-1 flex items-center justify-center gap-1 transition-colors font-semibold shadow-sm text-[11px]">
                                            <History size={12} strokeWidth={2.5} /> <span className="whitespace-nowrap">View History</span>
                                        </button>
                                    </div>

                                    <div className="h-px bg-gray-100 -mx-4 mb-5"></div>

                                    <div className="mt-auto">
                                        <h4 className="font-bold text-[#0f172a] mb-3 text-[13px]">Add Comment <span className="text-gray-400 font-normal">(Optional)</span></h4>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={commentText}
                                                onChange={e => setCommentText(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                                                placeholder="Write your comment..."
                                                className="flex-1 border border-gray-200 rounded-[6px] px-3 py-2 text-[12px] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] bg-white shadow-sm"
                                            />
                                            <button onClick={handleAddComment} className="bg-[#2563eb] hover:bg-blue-700 text-white px-5 py-2 rounded-[6px] text-[12px] font-semibold transition-colors shadow-sm disabled:bg-blue-300" disabled={!commentText.trim() || !selectedDocument.isUploaded}>
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                <FileText size={48} className="mb-4 text-gray-300" />
                                <p>Select a document from the list to preview details</p>
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
