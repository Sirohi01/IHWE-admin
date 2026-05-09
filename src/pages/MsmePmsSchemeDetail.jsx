import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, CheckCircle, XCircle } from 'lucide-react';
import api from "../lib/api";
import { showSuccess, showError } from "../utils/toastMessage";
import StatusUpdateForm from "../components/StatusUpdateForm";

const MsmePmsSchemeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchApplicationDetail();
    }, [id]);

    const fetchApplicationDetail = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/msme-pms-scheme/${id}`);
            if (response.data.success) {
                setApplication(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching application detail:', error);
            showError('Failed to fetch application details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await api.patch(`/api/msme-pms-scheme/${id}/status`, { status: newStatus });
            if (response.data.success) {
                showSuccess('Status updated successfully');
                fetchApplicationDetail();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showError('Failed to update status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">Application not found</h2>
                <button 
                    onClick={() => navigate(-1)} 
                    className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
                >
                    Back to List
                </button>
            </div>
        );
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="w-full h-auto bg-[#eef1f5] mt-8">
            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row justify-between items-center py-3 px-6 border-b border-gray-300 bg-white gap-4">
                <div className="flex flex-col items-center lg:items-start gap-1">
                    <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
                        MSME PMS SCHEME PROFILE | Registrations Section
                    </h1>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
                    <button 
                        onClick={() => navigate("/msme-pms-scheme-list")} 
                        className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
                    >
                        <FileText size={12} /> View Applications List
                    </button>
                </div>
            </div>

            {/* ── PAGE CONTENT ── */}
            <div className="p-4 space-y-6">

                {/* ── DETAILS CARD ── */}
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    {/* Sub-header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-[16px] font-semibold text-slate-700">
                            {application.companyName} - Application Details
                        </h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="px-3 py-1 text-[12px] font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-600 flex items-center gap-1"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>
                            <select
                                value={application.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={`px-3 py-1 text-[12px] font-semibold rounded ${getStatusBadgeClass(application.status)} border-0 cursor-pointer`}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="grid grid-cols-12 text-[12px]">
                        {/* Row 1 - Basic Info */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50">Company Name</div>
                        <div className="col-span-10 p-3 text-slate-800 border-l border-slate-100">
                            {application.companyName}
                        </div>

                        {/* Row 2 - Contact Info */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Contact Person</div>
                        <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100">{application.contactPerson}</div>

                        {/* Row 3 - Contact Details */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Mobile Number</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{application.mobileNumber}</div>
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Email ID</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{application.emailId}</div>

                        {/* Row 4 - Registration details */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Udyam Registration</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100 font-semibold">{application.udyamNumber}</div>
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">GST Number</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{application.gstNumber || 'Not Provided'}</div>

                        {/* Row 5 - Category */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Product/Service Category</div>
                        <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 font-medium">
                            {application.category}
                        </div>

                        {/* Row 6 - Brief About Company */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Company Brief</div>
                        <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                            {application.companyBrief}
                        </div>

                        {/* Row 7 - Submission Info */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Submitted On</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">
                            {application.createdAt ? new Date(application.createdAt).toLocaleString('en-IN', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            }) : "-"}
                        </div>
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Current Status</div>
                        <div className="col-span-4 p-3 border-t border-l border-slate-100">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(application.status)}`}>
                                {application.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── DOCUMENTS SECTION ── */}
                {application.documents && application.documents.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-white">
                            <h2 className="text-[16px] font-semibold text-slate-700">Uploaded Supporting Documents</h2>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {application.documents.map((doc, idx) => (
                                <div key={doc._id || idx} className="p-3 border border-slate-100 rounded bg-slate-50/30 flex flex-col justify-between">
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-slate-700 truncate" title={doc.filename}>
                                            {doc.filename || `Document ${idx + 1}`}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{doc.mimetype}</p>
                                    </div>
                                    <a 
                                        href={doc.path} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 text-xs font-medium w-full"
                                    >
                                        <Download size={14} /> Download/View
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── STATUS UPDATE FORM ── */}
                <StatusUpdateForm 
                    targetId={id} 
                    currentStatus={application.status} 
                    onSuccess={fetchApplicationDetail} 
                    updateType="msme"
                    applicationData={application}
                />
            </div>
        </div>
    );
};

export default MsmePmsSchemeDetail;
