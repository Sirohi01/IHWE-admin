import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users, Shield, Utensils, Badge, IdCard, Car, Plus, Download, Upload,
    Search, Filter, Eye, Edit2, Trash2, X, Phone, User, ShieldCheck, ShieldAlert, FileText, Loader2
} from "lucide-react";
import api, { SERVER_URL } from "../../lib/api";
import Swal from "sweetalert2";

const getMediaUrl = (value) => {
    if (!value) return "";
    const normalized = String(value).replace(/\\/g, "/");
    if (normalized.startsWith("blob:") || normalized.startsWith("http://") || normalized.startsWith("https://")) {
        return normalized;
    }
    const uploadsIndex = normalized.indexOf("/uploads/");
    if (uploadsIndex >= 0) return `${SERVER_URL}${normalized.slice(uploadsIndex)}`;
    const relativeUploadsIndex = normalized.indexOf("uploads/");
    if (relativeUploadsIndex >= 0) return `${SERVER_URL}/${normalized.slice(relativeUploadsIndex)}`;
    if (normalized.startsWith("/uploads/")) return `${SERVER_URL}${normalized}`;
    return `${SERVER_URL}/${normalized}`;
};

const SecureImage = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = React.useState("");

    React.useEffect(() => {
        let objectUrl = "";
        const loadImg = async () => {
            if (!src) {
                setImgSrc("");
                return;
            }
            const mediaUrl = getMediaUrl(src);
            if (!mediaUrl || mediaUrl.startsWith("blob:")) {
                setImgSrc(mediaUrl);
                return;
            }
            try {
                const res = await api.get(mediaUrl, { responseType: "blob" });
                objectUrl = URL.createObjectURL(res.data);
                setImgSrc(objectUrl);
            } catch (err) {
                setImgSrc(mediaUrl);
            }
        };
        loadImg();
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [src]);

    return <img src={imgSrc || src} alt={alt} className={className} />;
};

const ClientContacts = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const photoInputRef = useRef(null);

    const initialForm = {
        name: "",
        designation: "",
        department: "",
        mobile: "",
        email: "",
        photoUrl: "",
        idProofUrl: "",
        idProof: "Aadhaar Card",
        isPrimary: false,
        roleAtExhibition: "",
        passes: {
            exhibitor: false,
            vehicle: false,
            service: false,
            visitor: false
        },
        verificationStatus: "Pending",
        isUploadingPhoto: false,
        isUploadingId: false
    };

    const [form, setForm] = useState(initialForm);
    const [passConfigs, setPassConfigs] = useState([]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await api.get(`/api/client-contacts/${id}`);
                if (response.data.success) {
                    setTeamMembers(response.data.data);
                    setSource(response.data.source);

                    if (response.data.source === "ExhibitorRegistration") {
                        try {
                            const configRes = await api.get('/api/exhibitor-pass-config/active');
                            if (configRes.data.success) {
                                setPassConfigs(configRes.data.data);
                            }
                        } catch (err) {
                            console.error("Error fetching pass config:", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching contacts:", error);
                Swal.fire("Error", "Could not fetch team members.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [id]);

    const handleModalPhotoUpload = async (file) => {
        if (!file) return;
        setForm(prev => ({ ...prev, isUploadingPhoto: true }));
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('documentType', 'personphoto');
        try {
            const uploadRes = await api.post('/api/client-contacts/admin-upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (uploadRes.data?.success) {
                setForm(prev => ({ ...prev, photoUrl: uploadRes.data.url || uploadRes.data.fileUrl, isUploadingPhoto: false }));
            }
        } catch (e) {
            console.log(e);
            Swal.fire('AI Verification Failed', e.response?.data?.message || 'Verification failed', 'error');
            setForm(prev => ({ ...prev, isUploadingPhoto: false }));
        }
    };

    const handleModalIdProofUpload = async (file) => {
        if (!file) return;
        setForm(prev => ({ ...prev, isUploadingId: true }));
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('documentType', 'idproof');
        try {
            const uploadRes = await api.post('/api/client-contacts/admin-upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (uploadRes.data?.success) {
                setForm(prev => ({ ...prev, idProofUrl: uploadRes.data.url || uploadRes.data.fileUrl, isUploadingId: false }));
            }
        } catch (e) {
            console.log(e);
            Swal.fire('AI Verification Failed', e.response?.data?.message || 'Verification failed', 'error');
            setForm(prev => ({ ...prev, isUploadingId: false }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            let updatedList = [...teamMembers];

            // Handle primary logic: if this is primary, unset others
            if (form.isPrimary) {
                updatedList = updatedList.map(member => ({ ...member, isPrimary: false }));
            }

            if (editingIndex !== null) {
                updatedList[editingIndex] = form;
            } else {
                updatedList.push(form);
            }

            const response = await api.put(`/api/client-contacts/${id}/contacts`,
                { contacts: updatedList }
            );

            if (response.data.success) {
                setTeamMembers(response.data.data);
                setIsModalOpen(false);
                Swal.fire("Success", "Team members updated successfully", "success");
            }
        } catch (error) {
            console.error("Error saving contact:", error);
            Swal.fire("Error", "Could not save team member.", "error");
        }
    };

    const handleDelete = async (index) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                const updatedList = teamMembers.filter((_, i) => i !== index);

                const response = await api.put(`/api/client-contacts/${id}/contacts`,
                    { contacts: updatedList }
                );

                if (response.data.success) {
                    setTeamMembers(response.data.data);
                    Swal.fire("Deleted!", "Team member has been deleted.", "success");
                }
            } catch (error) {
                Swal.fire("Error", "Could not delete team member.", "error");
            }
        }
    };

    const handlePassToggle = (passName) => {
        setForm(prev => ({
            ...prev,
            passes: {
                ...prev.passes,
                [passName]: !prev.passes[passName]
            }
        }));
    };

    const filteredMembers = teamMembers.filter(m =>
        (m.name || m.title || m.firstName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.designation && m.designation.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: teamMembers.length,
        exhibitorPass: teamMembers.filter(m => m.passes?.exhibitor).length,
        vehiclePass: teamMembers.filter(m => m.passes?.vehicle).length,
        servicePass: teamMembers.filter(m => m.passes?.service).length,
        visitorPass: teamMembers.filter(m => m.passes?.visitor).length,
        pending: teamMembers.filter(m => m.verificationStatus === "Pending").length
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0A143D]">Contact Details / Team Members</h1>
                    <p className="text-gray-500 text-sm">Manage all your team members who will be involved in the exhibition.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => navigate(`/add-team-members/${id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                        <Plus size={18} /> Add Team Member
                    </button>
                    {/* <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                        <Upload size={18} /> Import from Excel
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                        <Download size={18} /> Download Template
                    </button> */}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[#0A143D] leading-none">{String(stats.total).padStart(2, '0')}</div>
                        <div className="text-xs font-semibold text-gray-600 mt-1">Total Team Members</div>
                        <div className="text-[10px] text-gray-500 mt-1">View all members</div>
                    </div>
                </div>

                {(() => {
                    const isExhibitor = source === "ExhibitorRegistration";
                    const disabledClass = isExhibitor ? "" : "opacity-50 grayscale pointer-events-none";
                    const getFreeQuota = (type) => {
                        const config = passConfigs.find(c => c.passType?.toLowerCase() === type.toLowerCase());
                        return config ? config.complimentaryQuota : 0;
                    };

                    return (
                        <>
                            <div className={`bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-4 ${disabledClass}`}>
                                <div className="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center shrink-0">
                                    <IdCard size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0A143D] leading-none">{String(stats.exhibitorPass).padStart(2, '0')}</div>
                                    <div className="text-xs font-semibold text-gray-600 mt-1">Exhibitor Pass</div>
                                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                                        {isExhibitor ? `${String(stats.exhibitorPass).padStart(2, '0')} members • ${String(getFreeQuota('exhibitor')).padStart(2, '0')} Free` : "Not applicable"}
                                    </div>
                                </div>
                            </div>
                            <div className={`bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-4 ${disabledClass}`}>
                                <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center shrink-0">
                                    <Car size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0A143D] leading-none">{String(stats.vehiclePass).padStart(2, '0')}</div>
                                    <div className="text-xs font-semibold text-gray-600 mt-1">Vehicle Pass</div>
                                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                                        {isExhibitor ? `${String(stats.vehiclePass).padStart(2, '0')} members • ${String(getFreeQuota('vehicle')).padStart(2, '0')} Free` : "Not applicable"}
                                    </div>
                                </div>
                            </div>
                            <div className={`bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center gap-4 ${disabledClass}`}>
                                <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center shrink-0">
                                    <Badge size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0A143D] leading-none">{String(stats.servicePass).padStart(2, '0')}</div>
                                    <div className="text-xs font-semibold text-gray-600 mt-1">Service Pass</div>
                                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                                        {isExhibitor ? `${String(stats.servicePass).padStart(2, '0')} members • ${String(getFreeQuota('service')).padStart(2, '0')} Free` : "Not applicable"}
                                    </div>
                                </div>
                            </div>
                            <div className={`bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4 ${disabledClass}`}>
                                <div className="w-12 h-12 bg-blue-400 text-white rounded-lg flex items-center justify-center shrink-0">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0A143D] leading-none">{String(stats.visitorPass).padStart(2, '0')}</div>
                                    <div className="text-xs font-semibold text-gray-600 mt-1">Visitor Pass</div>
                                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                                        {isExhibitor ? `${String(stats.visitorPass).padStart(2, '0')} members • ${String(getFreeQuota('visitor')).padStart(2, '0')} Free` : "Not applicable"}
                                    </div>
                                </div>
                            </div>
                            <div className={`bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-4 ${disabledClass}`}>
                                <div className="w-12 h-12 bg-rose-500 text-white rounded-lg flex items-center justify-center shrink-0">
                                    <ShieldAlert size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0A143D] leading-none">{String(stats.pending).padStart(2, '0')}</div>
                                    <div className="text-xs font-semibold text-gray-600 mt-1">Pending Verification</div>
                                    <div className="text-[10px] text-gray-500 mt-1">{isExhibitor ? "ID Proof / Details" : "Not applicable"}</div>
                                </div>
                            </div>
                        </>
                    )
                })()}
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-[#0A143D]">Team Members List</h2>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Search by name, designation or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shrink-0">
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-600 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="py-4 px-6">Photo</th>
                                <th className="py-4 px-6">Name</th>
                                <th className="py-4 px-6">Designation</th>
                                <th className="py-4 px-6">Department</th>
                                <th className="py-4 px-6">Mobile</th>
                                <th className="py-4 px-6">Email</th>
                                <th className="py-4 px-6">Role at Exhibition</th>
                                <th className="py-4 px-6">ID Proof</th>
                                <th className="py-4 px-6">Passes</th>
                                <th className="py-4 px-6">Verification Status</th>
                                <th className="py-4 px-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMembers.map((member, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                            {member.photoUrl || member.photo ? (
                                                <SecureImage src={member.photoUrl || member.photo} alt="user" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="text-slate-400" size={20} />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-semibold text-gray-900">{member.name || member.firstName}</div>

                                    </td>
                                    <td className="py-4 px-6 text-gray-600">{member.designation || '-'}</td>
                                    <td className="py-4 px-6 text-gray-600">{member.department || '-'}</td>
                                    <td className="py-4 px-6 text-gray-600">{member.mobile}</td>
                                    <td className="py-4 px-6 text-gray-600">{member.email}</td>
                                    <td className="py-4 px-6 text-gray-600">{member.roleAtExhibition || '-'}</td>
                                    <td className="py-4 px-6 text-gray-600">
                                        <div className="flex flex-col gap-1">
                                            <span>{member.idProof || '-'}</span>
                                            {/* {member.idProofUrl && (
                                                <a href={member.idProofUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium mt-1">
                                                    <FileText size={12} /> View Doc
                                                </a>
                                            )} */}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-1.5">
                                            {member.passes?.exhibitor && <div className="w-7 h-7 rounded bg-orange-50 text-orange-600 flex items-center justify-center" title="Exhibitor Pass"><IdCard size={14} /></div>}
                                            {member.passes?.vehicle && <div className="w-7 h-7 rounded bg-green-50 text-green-600 flex items-center justify-center" title="Vehicle Pass"><Car size={14} /></div>}
                                            {member.passes?.service && <div className="w-7 h-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center" title="Service Pass"><Badge size={14} /></div>}
                                            {member.passes?.visitor && <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center" title="Visitor Pass"><Users size={14} /></div>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {member.verificationStatus === 'Verified' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold"><ShieldCheck size={14} /> Verified</span>
                                        )}
                                        {member.verificationStatus === 'Pending' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">Pending</span>
                                        )}
                                        {member.verificationStatus === 'Rejected' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">Rejected</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-100 transition-colors">
                                                <Eye size={14} />
                                            </button>
                                            <button onClick={() => {
                                                setForm({
                                                    name: member.name || member.firstName || "",
                                                    designation: member.designation || "",
                                                    department: member.department || "",
                                                    email: member.email || "",
                                                    mobile: member.mobile || "",
                                                    photoUrl: member.photoUrl || member.photo || "",
                                                    idProofUrl: member.idProofUrl || "",
                                                    idProof: member.idProof || "Aadhar Card",
                                                    isPrimary: member.isPrimary || false,
                                                    roleAtExhibition: member.roleAtExhibition || "",
                                                    passes: member.passes || { exhibitor: false, vehicle: false, service: false, visitor: false },
                                                    verificationStatus: member.verificationStatus || "Pending"
                                                });
                                                setEditingIndex(index);
                                                setIsModalOpen(true);
                                            }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-100 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(index)} className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-100 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan="10" className="py-10 text-center text-gray-500">No team members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                                {editingIndex !== null ? "Edit Team Member" : "New Team Member"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm font-medium">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                                    <input type="text" className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Role / Designation</label>
                                    <input type="text" className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                                        value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Department</label>
                                    <input type="text" className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                                        value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Role at Exhibition</label>
                                    <input type="text" className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                                        value={form.roleAtExhibition} onChange={(e) => setForm({ ...form, roleAtExhibition: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Work Email</label>
                                    <input type="email" className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mobile Number</label>
                                    <input type="text" className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                                        value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Person Photo</label>
                                    <div className="flex items-center gap-3">
                                        {form.photoUrl && !form.isUploadingPhoto && (
                                            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                                                <SecureImage src={form.photoUrl} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        {form.isUploadingPhoto ? (
                                            <div className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-blue-600">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span className="text-sm font-semibold">Uploading...</span>
                                            </div>
                                        ) : (
                                            <input type="file" accept="image/*" className="w-full rounded-xl border border-slate-200 p-2 text-sm outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                onChange={(e) => handleModalPhotoUpload(e.target.files[0])} />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">ID Proof ({form.idProof || 'Any'})</label>
                                    <div className="flex items-center gap-3">
                                        {form.idProofUrl && !form.isUploadingId && (
                                            <a href={form.idProofUrl} target="_blank" rel="noreferrer" className="flex-shrink-0 text-blue-600 hover:bg-blue-50 p-2 rounded">
                                                <FileText size={20} />
                                            </a>
                                        )}
                                        {form.isUploadingId ? (
                                            <div className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-indigo-600">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span className="text-sm font-semibold">Uploading...</span>
                                            </div>
                                        ) : (
                                            <input type="file" accept="image/*,.pdf" className="w-full rounded-xl border border-slate-200 p-2 text-sm outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                onChange={(e) => handleModalIdProofUpload(e.target.files[0])} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Passes Required</label>
                                <div className="flex gap-4 p-3 border border-slate-200 rounded-xl">
                                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                        <input type="checkbox" checked={form.passes?.exhibitor} onChange={() => handlePassToggle('exhibitor')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                        <IdCard size={16} /> Exhibitor
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                        <input type="checkbox" checked={form.passes?.vehicle} onChange={() => handlePassToggle('vehicle')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                        <Car size={16} /> Vehicle
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                        <input type="checkbox" checked={form.passes?.service} onChange={() => handlePassToggle('service')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                        <Badge size={16} /> Service
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                        <input type="checkbox" checked={form.passes?.visitor} onChange={() => handlePassToggle('visitor')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                        <Users size={16} /> Visitor
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification Status</label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                                    value={form.verificationStatus}
                                    onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Verified">Verified</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
                                <input type="checkbox" checked={form.isPrimary}
                                    onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <div>
                                    <span className="text-sm font-bold text-slate-900 block leading-tight">Designate as Primary Contact</span>
                                    <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">This person will appear as the lead representative for team-specific inquiries.</span>
                                </div>
                            </label>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 shadow-sm">
                                Save Team Member
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientContacts;
