import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Printer, FileText, CheckCircle, XCircle, Users, Download } from 'lucide-react';
import api from "../lib/api";
import { showSuccess, showError } from "../utils/toastMessage";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const Button = ({ children, onClick, className, variant, ...props }) => {
    const baseStyles = "px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-sm flex items-center gap-2 transition-all";
    const variants = {
        primary: "bg-gray-800 text-white hover:bg-gray-700",
        outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
        success: "bg-green-700 text-white hover:bg-green-800",
        danger: "bg-red-700 text-white hover:bg-red-800"
    };
    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variant ? variants[variant] : variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

const AdvisoryNominationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nomination, setNomination] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/advisory-nomination/${id}`);
            if (response.data.success) {
                setNomination(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching nomination detail:', error);
            showError('Failed to fetch details');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await api.patch(`/api/advisory-nomination/${id}/status`, { status: newStatus });
            if (response.data.success) {
                showSuccess(`Nomination ${newStatus} successfully`);
                fetchDetail();
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

    if (!nomination) {
        return (
            <div className="p-8 text-center bg-white m-8 rounded-lg shadow">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Nomination not found</h2>
                <Button onClick={() => navigate('/advisory-nominations')} variant="outline" className="mt-4 mx-auto">
                    Back to List
                </Button>
            </div>
        );
    }

    const printStyles = `
    @media print {
      body { margin: 0; padding: 0; background: white; }
      .no-print { display: none !important; }
      .print-container { padding: 0; margin: 0; width: 100%; }
      .print-section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 15px !important; }
      .detail-row { break-inside: avoid; page-break-inside: avoid; }
      @page { size: A4; margin: 1.5cm; }
      h1, h2, h3 { page-break-after: avoid; }
      .document-header { border-bottom: 3px solid #1f2937; margin-bottom: 20px; padding-bottom: 10px; }
    }
    @media screen {
      .print-container { width: 100%; background: white; padding: 16px; }
      body { background: #f3f4f6; }
    }
  `;

    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') return '—';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return value;
    };

    const DetailRow = ({ label, value, className = "" }) => (
        <div className={`detail-row mb-3 ${className}`}>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
                {label}
            </span>
            <p className="text-sm text-gray-900 font-semibold break-words leading-tight">
                {formatValue(value)}
            </p>
        </div>
    );

    const Section = ({ title, children, columns = "lg:grid-cols-6" }) => (
        <div className="print-section mb-6">
            <div className="border-b-2 border-gray-300 pb-1 mb-3">
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-3 bg-gray-800"></div>
                    {title}
                </h2>
            </div>
            <div className={`grid grid-cols-2 md:grid-cols-3 ${columns} gap-x-4 gap-y-1`}>
                {children}
            </div>
        </div>
    );

    return (
        <>
            <style>{printStyles}</style>
            <div className="print-container mt-6">
                <div className="w-full px-4">
                    
                    {/* Control Header (Hidden in Print) */}
                    <div className="flex justify-between items-start mb-8 no-print border-b border-gray-100 pb-6">
                        <div>
                            <Button
                                onClick={() => navigate('/advisory-nominations')}
                                variant="outline"
                                className="mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to List
                            </Button>
                            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                                Advisory Board Nomination Profile
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs font-black bg-gray-100 text-gray-600 px-3 py-1 rounded-sm uppercase tracking-widest">
                                    REG ID: {nomination.registrationId}
                                </span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest ${
                                    nomination.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                    nomination.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    Status: {nomination.status || 'Pending'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {nomination.status !== 'Approved' && (
                                <Button onClick={() => handleStatusChange('Approved')} variant="success">
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </Button>
                            )}
                            {nomination.status !== 'Rejected' && (
                                <Button onClick={() => handleStatusChange('Rejected')} variant="danger">
                                    <XCircle className="w-4 h-4" /> Reject
                                </Button>
                            )}
                            <Button onClick={handlePrint} variant="primary">
                                <Printer className="w-4 h-4" /> Print Overview
                            </Button>
                        </div>
                    </div>

                    {/* Document Header (Visible in Print Only) */}
                    <div className="hidden print:block document-header">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                                    IHWE 2026 Advisory Board
                                </h1>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-1">
                                    Nomination Assessment Profile
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-gray-400 uppercase">Registration Number</p>
                                <p className="text-xl font-black text-gray-800">{nomination.registrationId}</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: NOMINEE INFORMATION */}
                    <Section title="Section 1 – Nominee Profile">
                        <DetailRow label="Full Name" value={nomination.fullName} />
                        <DetailRow label="Designation" value={nomination.designation} />
                        <DetailRow label="Organization" value={nomination.organization} />
                        <DetailRow label="Industry / Sector" value={nomination.industry} />
                        <DetailRow label="Email Address" value={nomination.email} />
                        <DetailRow label="Phone Number" value={nomination.phone} />
                    </Section>

                    {/* SECTION 2: PROFESSIONAL BACKGROUND */}
                    <Section title="Section 2 – Expertise & Experience">
                        <DetailRow label="Areas of Expertise" value={nomination.areasOfExpertise} className="col-span-2" />
                        <DetailRow label="Years of Experience" value={nomination.yearsOfExperience ? `${nomination.yearsOfExperience} Years` : '—'} />
                        <div className="col-span-full mt-2">
                            <DetailRow label="Professional Summary" value={nomination.professionalSummary} className="bg-gray-50 p-3 rounded" />
                        </div>
                    </Section>

                    {/* SECTION 3: ASSESSMENT DETAILS */}
                    <Section title="Section 3 – Evaluation Rationale" columns="lg:grid-cols-2">
                        <DetailRow label="Reason for Recommendation" value={nomination.whyRecommend} className="bg-gray-50 p-3 rounded border-l-2 border-gray-200" />
                        <DetailRow label="Potential Contribution" value={nomination.contribution} className="bg-gray-50 p-3 rounded border-l-2 border-gray-200" />
                    </Section>

                    {/* SECTION 4: NOMINATOR INFORMATION */}
                    <Section title="Section 4 – Nominator Verification">
                        <DetailRow label="Nominator Name" value={nomination.nominatorName} />
                        <DetailRow label="Designation" value={nomination.nominatorDesignation} />
                        <DetailRow label="Organization" value={nomination.nominatorOrg} />
                        <DetailRow label="Relationship" value={nomination.relationship} />
                        <DetailRow label="Nominator Email" value={nomination.nominatorEmail} />
                        <DetailRow label="Nominator Phone" value={nomination.nominatorPhone} />
                    </Section>

                    {/* SECTION 5: VERIFICATION STATUS */}
                    <Section title="Section 5 – Identity Verification Status">
                        <DetailRow label="Nominee Email" value={nomination.otpVerifiedEmail ? "VERIFIED" : "PENDING"} className={nomination.otpVerifiedEmail ? "text-green-600" : "text-red-500"} />
                        <DetailRow label="Nominee Mobile" value={nomination.otpVerifiedMobile ? "VERIFIED" : "PENDING"} className={nomination.otpVerifiedMobile ? "text-green-600" : "text-red-500"} />
                        <DetailRow label="Nominator Email" value={nomination.nominatorOtpVerifiedEmail ? "VERIFIED" : "PENDING"} className={nomination.nominatorOtpVerifiedEmail ? "text-green-600" : "text-red-500"} />
                        <DetailRow label="Nominator Mobile" value={nomination.nominatorOtpVerifiedMobile ? "VERIFIED" : "PENDING"} className={nomination.nominatorOtpVerifiedMobile ? "text-green-600" : "text-red-500"} />
                        <DetailRow label="Submitted Date" value={nomination.createdAt ? new Date(nomination.createdAt).toLocaleDateString('en-IN') : '—'} />
                        <DetailRow label="Last Updated" value={nomination.updatedAt ? new Date(nomination.updatedAt).toLocaleDateString('en-IN') : '—'} />
                    </Section>

                    {/* SECTION 6: ATTACHMENTS */}
                    <Section title="Section 6 – Supporting Documents">
                        <div className="col-span-full">
                            <DetailRow label="LinkedIn Profile" value={nomination.linkedin ? (
                                <a href={nomination.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                                    Open LinkedIn Profile <FileText className="w-3 h-3" />
                                </a>
                            ) : 'Not Provided'} />
                        </div>
                        <div className="col-span-full mt-2">
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Curriculum Vitae (CV)</span>
                            {nomination.cvPath ? (
                                <a
                                    href={`${SERVER_URL}${nomination.cvPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-6 py-2.5 bg-gray-800 text-white text-xs font-black uppercase tracking-widest hover:bg-gray-700 transition-all no-print"
                                >
                                    <Download className="w-4 h-4" /> Download Resume / CV
                                </a>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No CV uploaded with this nomination.</p>
                            )}
                            <p className="hidden print:block text-xs font-bold text-gray-600">
                                [Document Reference: {nomination.cvPath ? 'Attached/Uploaded' : 'Not Provided'}]
                            </p>
                        </div>
                    </Section>

                    {/* SECTION 7: INTERNAL REMARKS */}
                    <Section title="Admin Evaluation Remarks">
                        <div className="bg-gray-100 p-4 w-full col-span-full min-h-[60px] border-l-4 border-gray-400">
                            <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">
                                {nomination.adminRemarks || "No internal evaluation remarks provided yet."}
                            </p>
                        </div>
                    </Section>

                    {/* Document Footer (Visible in Print) */}
                    <div className="hidden print:block mt-16 pt-8 border-t border-gray-200">
                        <div className="flex justify-between items-end">
                            <div className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                                <p>System Generated Document</p>
                                <p className="mt-1">© 2026 IHWE | Namo Gange Wellness Pvt. Ltd.</p>
                            </div>
                            <div className="text-center w-48">
                                <div className="border-b border-gray-400 mb-2"></div>
                                <p className="text-[10px] font-black text-gray-600 uppercase">Assessment Officer Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdvisoryNominationDetail;
