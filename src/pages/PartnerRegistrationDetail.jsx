import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, FileText, CheckCircle, XCircle, Download, Clock, MapPin, Phone, Mail, Building, Globe, Settings, FileCheck, Handshake } from "lucide-react";
import api from "../lib/api";
import { showSuccess, showError } from "../utils/toastMessage";
import Swal from "sweetalert2";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const Button = ({ children, onClick, className, variant, ...props }) => {
    const baseStyles = "px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded flex items-center gap-2 transition-all shadow-sm";
    const variants = {
        primary: "bg-[#0B2545] text-white hover:bg-[#081a31] border border-[#0B2545]",
        outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600",
        danger: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
        warning: "bg-amber-500 text-white hover:bg-amber-600 border border-amber-500",
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

const PartnerRegistrationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [partner, setPartner] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/partner-registration/${id}`);
            if (response.data.success) {
                setPartner(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching partner details:", error);
            showError("Failed to fetch details");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleStatusChange = async (newStatus) => {
        const result = await Swal.fire({
            title: `Mark as ${newStatus}?`,
            text: `Are you sure you want to change the status to ${newStatus}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0B2545',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, update it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.patch(`/api/partner-registration/${id}/status`, { status: newStatus });
                if (response.data.success) {
                    showSuccess(`Partner registration marked as ${newStatus}`);
                    fetchDetail();
                }
            } catch (error) {
                console.error("Error updating status:", error);
                showError("Failed to update status");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-slate-50">
                <XCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-2xl font-black text-slate-800 uppercase">Registration Not Found</h2>
                <p className="text-slate-500 font-medium mt-2 mb-6">The requested partner profile could not be located in the system.</p>
                <Button onClick={() => navigate("/partner-registrations")} variant="outline">
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </Button>
            </div>
        );
    }

    const printStyles = `
        @media print {
            html, body { height: auto !important; min-height: auto !important; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body * { visibility: hidden; }
            .print-container, .print-container * { visibility: visible; }
            .print-container { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; padding: 30px !important; margin: 0 !important; background: white !important; box-shadow: none !important; border: none !important; box-sizing: border-box; }
            .no-print, .no-print * { display: none !important; }
            .print-section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 8px !important; }
            .detail-row { break-inside: avoid; page-break-inside: avoid; }
            @page { size: A4; margin: 0.5cm; }
            h1, h2, h3 { page-break-after: avoid; }
            .print-grid { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 16px !important; }
            .print-grid-2 { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 16px !important; }
            .document-header { border-bottom: 4px solid #0B2545; padding-bottom: 12px; margin-bottom: 16px; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .print-bg-slate { background-color: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
            .print-status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        }
    `;

    const formatValue = (value) => {
        if (value === null || value === undefined || value === "") return "—";
        if (typeof value === "boolean") return value ? "Yes" : "No";
        return value;
    };

    const DetailRow = ({ label, value, className = "", icon: Icon }) => (
        <div className={`detail-row flex flex-col ${className}`}>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                {Icon && <Icon className="w-3 h-3 text-emerald-600" />} {label}
            </span>
            <p className="text-sm font-bold text-slate-900 leading-tight">
                {formatValue(value)}
            </p>
        </div>
    );

    const Section = ({ title, icon: Icon, children, gridClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print-grid" }) => (
        <div className="print-section mb-2 bg-white border border-slate-200 rounded-lg p-3 shadow-sm print:shadow-none print:border-slate-300">
            <div className="border-b-2 border-slate-100 pb-1 mb-2">
                <h2 className="text-sm font-black text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
                    {title}
                </h2>
            </div>
            <div className={`grid ${gridClass} gap-y-2 gap-x-6`}>
                {children}
            </div>
        </div>
    );

    const DocumentLink = ({ label, filePath }) => {
        if (!filePath) return <DetailRow label={label} value="Not Uploaded" className="text-slate-400 italic" icon={FileText} />;
        return (
            <div className="detail-row flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <FileText className="w-3 h-3 text-blue-600" /> {label}
                </span>
                <a
                    href={`${SERVER_URL}${filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-wide rounded hover:bg-blue-100 transition-all no-print w-fit"
                >
                    <Download className="w-3.5 h-3.5" /> Download File
                </a>
                <p className="hidden print:flex items-center gap-1 text-[11px] font-black text-emerald-600 uppercase tracking-wide border border-emerald-200 bg-emerald-50 px-2 py-1 rounded w-fit">
                    <CheckCircle className="w-3 h-3" /> Uploaded & Verified
                </p>
            </div>
        );
    };

    return (
        <div className="min-h-screen print:min-h-0 print:p-0 bg-slate-50 p-4 md:p-6 lg:p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            <style>{printStyles}</style>

            <div className="mx-auto">
                {/* Control Header (Hidden in Print) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 no-print">
                    <div>
                        <Button onClick={() => navigate("/partner-registrations")} variant="outline" className="mb-4 text-[10px]">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to List
                        </Button>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            Partner Profile
                            <span className="text-sm bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200 font-black">
                                #{partner.registrationId}
                            </span>
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {partner.status !== "Accepted" && (
                            <Button onClick={() => handleStatusChange("Accepted")} variant="success">
                                <CheckCircle className="w-4 h-4" /> Accept
                            </Button>
                        )}
                        {partner.status !== "Rejected" && (
                            <Button onClick={() => handleStatusChange("Rejected")} variant="danger">
                                <XCircle className="w-4 h-4" /> Reject
                            </Button>
                        )}
                        {partner.status === "Pending" && (
                            <Button onClick={() => handleStatusChange("Reviewed")} variant="primary">
                                <FileCheck className="w-4 h-4" /> Mark Reviewed
                            </Button>
                        )}
                        {/* <Button onClick={handlePrint} variant="outline" className="ml-2">
                            <Printer className="w-4 h-4" /> Print
                        </Button> */}
                    </div>
                </div>

                <div className="print-container bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8 print:border-none">

                    {/* Document Header (Visible in Print Only) */}
                    <div className="hidden print:block document-header">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-[#0B2545] uppercase tracking-tighter leading-none">
                                    Service Partner Profile
                                </h1>
                                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-2">
                                    Official Partnership Assessment Document
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration ID</p>
                                <p className="text-2xl font-black text-slate-900">{partner.registrationId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Ribbon */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 mb-2 bg-slate-50 border border-slate-200 rounded-lg print-bg-slate">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md shadow-sm border border-slate-200">
                                <Building className="w-6 h-6 text-[#0B2545]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-800">{partner.companyName}</h2>
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{partner.businessCategory}</p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Status</p>
                            <span
                                className={`print-status-badge text-xs font-black px-3 py-1.5 rounded uppercase tracking-widest border ${partner.status === "Accepted"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                    : partner.status === "Rejected"
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : partner.status === "Reviewed"
                                            ? "bg-blue-100 text-blue-800 border-blue-200"
                                            : "bg-amber-100 text-amber-800 border-amber-200"
                                    }`}
                            >
                                {partner.status || "Pending"}
                            </span>
                        </div>
                    </div>

                    {/* SECTION 1: COMPANY PROFILE */}
                    <Section title="Company Information" icon={Building}>
                        <DetailRow label="Company Name" value={partner.companyName} />
                        <DetailRow label="Business Category" value={partner.businessCategory} />
                        <DetailRow label="Website" value={partner.website} icon={Globe} />
                        <DetailRow label="Year Established" value={partner.yearEstablished} icon={Clock} />
                        <DetailRow label="GST Number" value={partner.gstNumber} />
                        <DetailRow label="MSME Registration No." value={partner.msmeRegistration} />
                    </Section>

                    {/* SECTION 2: CONTACT DETAILS */}
                    <Section title="Contact & Location" icon={Phone}>
                        <DetailRow label="Primary Contact" value={partner.fullName} />
                        <DetailRow label="Designation" value={partner.designation} />
                        <DetailRow label="Email Address" value={partner.email} icon={Mail} />
                        <DetailRow label="Mobile Number" value={partner.mobile} icon={Phone} />
                        <DetailRow label="WhatsApp Number" value={partner.whatsapp} />
                        <div className="hidden lg:block print:block"></div> {/* Spacer for grid alignment */}

                        <DetailRow label="Full Office Address" value={`${partner.officeAddress}, ${partner.city}, ${partner.state}, ${partner.country} - ${partner.pinCode}`} className="col-span-1 md:col-span-2 lg:col-span-3 print:col-span-3 bg-slate-50 p-3 rounded border border-slate-100 print-bg-slate" icon={MapPin} />
                    </Section>

                    {/* SECTION 3: SERVICES AND CAPACITY */}
                    <Section title="Services & Capabilities" icon={Settings} gridClass="grid-cols-1 md:grid-cols-2 print-grid-2">
                        <div className="col-span-1 md:col-span-2 print:col-span-2 mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                Offered Services
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {partner.selectedServices && partner.selectedServices.length > 0 ? (
                                    partner.selectedServices.map((s, index) => (
                                        <span
                                            key={index}
                                            className="px-2.5 py-1.5 bg-[#0B2545] text-white text-[10px] font-bold tracking-wide rounded-sm"
                                        >
                                            {s}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-400 italic text-sm">None specified</span>
                                )}
                            </div>
                        </div>

                        {partner.otherService && (
                            <DetailRow label="Other Services Details" value={partner.otherService} className="col-span-1 md:col-span-2 print:col-span-2" />
                        )}
                        <DetailRow label="Years of Experience" value={partner.experience} />
                        <DetailRow label="Operational Cities" value={partner.operationalCities} />
                        <DetailRow label="International Capabilities" value={partner.canHandleInternational} />
                        <div className="hidden md:block print:block"></div>
                        <DetailRow label="Major Clients / Key Accounts" value={partner.majorClients} className="col-span-1 md:col-span-2 print:col-span-2 bg-amber-50 p-3 rounded border border-amber-100" />
                    </Section>

                    {/* SECTION 4: PARTNERSHIP PREFERENCES */}
                    <Section title="Partnership Interests" icon={Handshake} gridClass="grid-cols-1 md:grid-cols-2 print-grid-2">
                        <div className="col-span-1 md:col-span-2 print:col-span-2 mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                Preferred Partnership Models
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {partner.partnershipInterests && partner.partnershipInterests.length > 0 ? (
                                    partner.partnershipInterests.map((p, index) => (
                                        <span
                                            key={index}
                                            className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold tracking-wide rounded-sm uppercase"
                                        >
                                            {p}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-400 italic text-sm">None specified</span>
                                )}
                            </div>
                        </div>
                        <DetailRow label="Additional Remarks / Proposal" value={partner.additionalInfo} className="col-span-1 md:col-span-2 print:col-span-2 bg-slate-50 p-3 rounded border border-slate-100 print-bg-slate" />
                    </Section>

                    {/* SECTION 5: SUPPORTING DOCUMENTS */}
                    <Section title="Uploaded Documents" icon={FileCheck}>
                        <DocumentLink label="Company Profile" filePath={partner.companyProfilePath} />
                        <DocumentLink label="GST Certificate" filePath={partner.gstCertificatePath} />
                        <DocumentLink label="PAN Card" filePath={partner.panCardPath} />
                        <DocumentLink label="MSME Certificate" filePath={partner.msmeCertificatePath} />
                        <DocumentLink label="Portfolio / Credentials" filePath={partner.portfolioPath} />
                        <DocumentLink label="Visiting Card" filePath={partner.visitingCardPath} />
                    </Section>

                    {/* SECTION 6: METADATA & DECLARATION */}
                    <Section title="System Information & Verification" icon={Settings} gridClass="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 print-grid-2">
                        <DetailRow label="Terms Declaration" value={partner.declaration ? "ACCEPTED" : "NOT ACCEPTED"} className={partner.declaration ? "text-emerald-700" : "text-red-600"} />
                        <DetailRow label="Email Verification" value={partner.otpVerifiedEmail ? "VERIFIED" : "PENDING"} className={partner.otpVerifiedEmail ? "text-emerald-700" : "text-amber-600"} />
                        <DetailRow label="Mobile Verification" value={partner.otpVerifiedMobile ? "VERIFIED" : "PENDING"} className={partner.otpVerifiedMobile ? "text-emerald-700" : "text-amber-600"} />
                        <div className="hidden lg:block print:hidden"></div>
                        <DetailRow label="Registration Date" value={new Date(partner.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                        <DetailRow label="Last Updated" value={new Date(partner.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                    </Section>

                    {/* Document Footer (Visible in Print) */}
                    <div className="hidden print:flex justify-between items-end mt-16 pt-6 border-t-[3px] border-slate-800">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                            <p>This is a system generated document.</p>
                            <p className="text-emerald-700">© 2026 9th IHWE | Namo Gange Wellness Pvt. Ltd.</p>
                        </div>
                        <div className="text-center w-64">
                            <div className="border-b-2 border-slate-800 mb-2 h-10"></div>
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Authorized Signature / Stamp</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PartnerRegistrationDetail;
