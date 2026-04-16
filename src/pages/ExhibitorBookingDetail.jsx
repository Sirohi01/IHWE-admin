import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Building2, User, Mail, Phone, Globe,
    Briefcase, Calendar, CreditCard, MapPin, Tag,
    FileText, Users, Layers, CheckCircle2, Info,
    Receipt, ExternalLink
} from 'lucide-react';
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';

const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 px-5 py-3 bg-[#23471d] border-b border-gray-200">
        {Icon && <Icon className="w-4 h-4 text-white" />}
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">{title}</h3>
    </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col border-b border-gray-200 py-3 px-4 hover:bg-gray-50/50 transition-colors h-full">
        <div className="flex items-center gap-1.5 mb-1">
            {Icon && <Icon className="w-3 h-3 text-[#23471d]/50" />}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-800 leading-tight break-words">
            {Array.isArray(value)
                ? (value.length > 0 ? value.join(', ') : <span className="text-gray-300 font-normal italic">Not provided</span>)
                : (value || <span className="text-gray-300 font-normal italic">Not provided</span>)}
        </span>
    </div>
);

const Grid = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-gray-200">
        {data.map((item, idx) => (
            <div key={idx} className="border-r border-b border-gray-200">
                <DetailRow {...item} />
            </div>
        ))}
    </div>
);

const STATUS_STYLES = {
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'advance-paid': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    'payment-failed': 'bg-rose-100 text-rose-800 border-rose-300',
};

const ExhibitorBookingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reg, setReg] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get(`/api/exhibitor-registration/${id}`)
            .then(res => { if (res.data.success) setReg(res.data.data); })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!reg) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-600">Booking not found</h2>
            <button onClick={() => navigate('/exhibitor-bookings')} className="mt-4 px-4 py-2 bg-[#23471d] text-white font-bold rounded-sm text-sm">
                Back to List
            </button>
        </div>
    );

    const cur = reg.participation?.currency === 'USD' ? '$' : '₹';
    const fmt = (n) => `${cur} ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    const companyData = [
        { label: "Company / Exhibitor Name", value: reg.exhibitorName, icon: Building2 },
        { label: "Type of Business", value: reg.typeOfBusiness, icon: Briefcase },
        { label: "Industry Sector", value: reg.industrySector, icon: Layers },
        { label: "Fascia Name", value: reg.fasciaName, icon: Tag },
        { label: "Website", value: reg.website, icon: Globe },
        { label: "Landline No.", value: reg.landlineNo, icon: Phone },
        { label: "GST No.", value: reg.gstNo, icon: FileText },
        { label: "PAN No.", value: reg.panNo, icon: FileText },
    ];

    const addressData = [
        { label: "Address", value: reg.address, icon: MapPin },
        { label: "City", value: reg.city, icon: MapPin },
        { label: "State", value: reg.state, icon: MapPin },
        { label: "Country", value: reg.country, icon: Globe },
        { label: "Pincode", value: reg.pincode, icon: MapPin },
    ];

    const contact1Data = [
        { label: "Title", value: reg.contact1?.title, icon: User },
        { label: "First Name", value: reg.contact1?.firstName, icon: User },
        { label: "Last Name", value: reg.contact1?.lastName, icon: User },
        { label: "Designation", value: reg.contact1?.designation, icon: Briefcase },
        { label: "Email", value: reg.contact1?.email, icon: Mail },
        { label: "Mobile", value: reg.contact1?.mobile, icon: Phone },
        { label: "Alternate No.", value: reg.contact1?.alternateNo, icon: Phone },
    ];

    const contact2Data = [
        { label: "Title", value: reg.contact2?.title, icon: User },
        { label: "First Name", value: reg.contact2?.firstName, icon: User },
        { label: "Last Name", value: reg.contact2?.lastName, icon: User },
        { label: "Designation", value: reg.contact2?.designation, icon: Briefcase },
        { label: "Email", value: reg.contact2?.email, icon: Mail },
        { label: "Mobile", value: reg.contact2?.mobile, icon: Phone },
        { label: "Alternate No.", value: reg.contact2?.alternateNo, icon: Phone },
    ];

    const stallData = [
        { label: "Event", value: reg.eventId?.name, icon: Calendar },
        { label: "Stall No.", value: reg.participation?.stallFor, icon: Tag },
        { label: "Stall Type", value: reg.participation?.stallType, icon: Layers },
        { label: "Stall Size", value: reg.participation?.stallSize ? `${reg.participation.stallSize} sqm` : null, icon: Info },
        { label: "Dimension", value: reg.participation?.dimension, icon: Info },
        { label: "Stall Scheme", value: reg.participation?.stallScheme, icon: Info },
        { label: "Currency", value: reg.participation?.currency, icon: CreditCard },
        { label: "Rate / sqm", value: reg.participation?.rate ? fmt(reg.participation.rate) : null, icon: CreditCard },
    ];

    const paymentData = [
        { label: "Base Amount", value: fmt(reg.participation?.amount), icon: CreditCard },
        { label: "Discount", value: fmt(reg.participation?.discount), icon: CreditCard },
        { label: "GST (18%)", value: fmt((reg.participation?.total || 0) - (reg.participation?.amount || 0)), icon: CreditCard },
        { label: "Total Amount", value: fmt(reg.participation?.total), icon: CreditCard },
        { label: "Amount Paid", value: fmt(reg.amountPaid), icon: CheckCircle2 },
        { label: "Balance Due", value: fmt(reg.balanceAmount), icon: CreditCard },
        { label: "Payment Mode", value: reg.paymentMode, icon: CreditCard },
        { label: "Payment Type", value: reg.paymentType, icon: CreditCard },
    ];

    const crmData = [
        { label: "Referred By", value: reg.referredBy, icon: User },
        { label: "Spoken With", value: reg.spokenWith, icon: User },
        { label: "Filled By", value: reg.filledBy, icon: User },
        { label: "Registration ID", value: reg.registrationId, icon: FileText },
        { label: "Registered On", value: reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null, icon: Calendar },
        { label: "Primary Category", value: reg.primaryCategory, icon: Tag },
        { label: "Sub Category", value: reg.subCategory, icon: Tag },
        { label: "Selected Sectors", value: reg.selectedSectors, icon: Layers },
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter">
            <div className="w-full">
                {/* HEADER */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/exhibitor-bookings')}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#23471d] transition-colors mb-3 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Bookings
                        </button>
                        <h1 className="text-2xl font-bold text-[#23471d] uppercase tracking-tight">
                            Exhibitor Booking <span className="text-slate-900 italic">Overview</span>
                        </h1>
                        <p className="text-gray-400 text-xs mt-1 font-medium">ID: {reg._id}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-4 py-1.5 text-xs font-black uppercase border rounded-full ${STATUS_STYLES[reg.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                            {reg.status}
                        </span>
                        <span className={`px-3 py-1.5 text-xs font-black uppercase border rounded-full ${reg.paymentMode === 'online' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                            {reg.paymentMode} payment
                        </span>
                    </div>
                </div>

                {/* PAYMENT SUMMARY BANNER */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Amount", value: fmt(reg.participation?.total), color: "text-[#23471d]" },
                        { label: "Amount Paid", value: fmt(reg.amountPaid), color: "text-emerald-600" },
                        { label: "Balance Due", value: fmt(reg.balanceAmount), color: reg.balanceAmount > 0 ? "text-red-600" : "text-emerald-600" },
                        { label: "Stall No.", value: reg.participation?.stallFor || 'N/A', color: "text-[#d26019]" },
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* COMPANY */}
                    <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Company & Business Profile" icon={Building2} />
                        <Grid data={companyData} />
                    </div>

                    {/* ADDRESS */}
                    <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Address Details" icon={MapPin} />
                        <Grid data={addressData} />
                    </div>

                    {/* CONTACT 1 */}
                    <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Liaison Officer / Contact Person 1" icon={User} />
                        <Grid data={contact1Data} />
                    </div>

                    {/* CONTACT 2 */}
                    <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Contact Person 2" icon={Users} />
                        <Grid data={contact2Data} />
                    </div>

                    {/* STALL */}
                    <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Stall & Participation Details" icon={Layers} />
                        <Grid data={stallData} />
                    </div>

                    {/* PAYMENT */}
                    <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Payment & Financial Details" icon={CreditCard} />
                        <Grid data={paymentData} />
                        {/* Manual payment details */}
                        {reg.manualPaymentDetails?.transactionId && (
                            <div className="px-5 py-4 bg-slate-50 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
                                    <p className="text-sm font-bold text-gray-800">{reg.manualPaymentDetails.method}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transaction ID</p>
                                    <p className="text-sm font-bold text-gray-800">{reg.manualPaymentDetails.transactionId}</p>
                                </div>
                                {reg.manualPaymentDetails.notes && (
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                                        <p className="text-sm font-medium text-gray-700">{reg.manualPaymentDetails.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                       
                        {/* Online payment IDs */}
                        {reg.paymentId && (
                            <div className="px-5 py-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-50/30">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Razorpay Payment ID</p>
                                    <p className="text-xs font-bold text-indigo-700 break-all">{reg.paymentId}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PAYMENT HISTORY */}
                    {reg.paymentHistory?.length > 0 && (
                        <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                            <SectionHeader title="Payment History" icon={CreditCard} />
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm font-inter">
                                    <thead>
                                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                                            <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase text-left">#</th>
                                            <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Type</th>
                                            <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Amount</th>
                                            <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Mode / Method</th>
                                            <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Txn ID</th>
                                            <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {reg.paymentHistory.map((h, i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                                <td className="py-2 px-4 text-xs text-gray-400 font-bold">{i + 1}</td>
                                                <td className="py-2 px-4 text-xs font-bold text-gray-700 capitalize">{h.paymentType || '—'}</td>
                                                <td className="py-2 px-4 text-xs font-black text-emerald-700">{fmt(h.amount)}</td>
                                                <td className="py-2 px-4 text-xs text-gray-600">{h.method || h.paymentMode || '—'}</td>
                                                <td className="py-2 px-4 text-xs text-gray-600 font-mono">{h.transactionId || h.razorpayPaymentId || '—'}</td>
                                                <td className="py-2 px-4 text-xs text-gray-500">
                                                    {h.paidAt ? new Date(h.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* CRM */}
                    <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="CRM & Attribution Details" icon={Info} />
                        <Grid data={crmData} />
                    </div>

                    {/* MSME */}
                    {reg.msme?.udhyamRegNo && (
                        <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                            <SectionHeader title="MSME / Udhyam Details" icon={Info} />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-gray-200">
                                {[
                                    { label: 'Udhyam Reg. No.', value: reg.msme.udhyamRegNo },
                                    { label: 'MSME Category', value: reg.msme.msmeCategory },
                                    { label: 'Issue Date', value: reg.msme.udhyamIssueDate ? new Date(reg.msme.udhyamIssueDate).toLocaleDateString('en-IN') : null },
                                    { label: 'Contact Person', value: reg.msme.udhyamContactPerson },
                                    { label: 'Designation', value: reg.msme.udhyamDesignation },
                                    { label: 'Mobile No.', value: reg.msme.udhyamMobileNo },
                                    { label: 'Email ID', value: reg.msme.udhyamEmailId },
                                    { label: 'Address', value: reg.msme.udhyamAddress },
                                    { label: 'DFO Location', value: reg.msme.dfoLocation },
                                    { label: 'DFO Email', value: reg.msme.dfoEmail },
                                    { label: 'DFO Mobile', value: reg.msme.dfoMobileNo },
                                    { label: 'Remark', value: reg.msme.msmeRemark },
                                ].map((item, idx) => (
                                    <div key={idx} className="border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-sm font-bold text-gray-800">{item.value || <span className="text-gray-300 font-normal italic">Not provided</span>}</p>
                                    </div>
                                ))}
                            </div>
                            {reg.msme.udhyamCertificateUrl && (
                                <div className="px-5 py-3 border-t border-gray-200 bg-slate-50">
                                    {(() => {
                                        const url = reg.msme.udhyamCertificateUrl.startsWith('http') ? reg.msme.udhyamCertificateUrl : `${SERVER_URL}${reg.msme.udhyamCertificateUrl}`;
                                        const finalUrl = url.includes('cloudinary') && !url.match(/\.(pdf|jpg|jpeg|png)$/i) ? url + '.pdf' : url;
                                        return (
                                            <a href={finalUrl} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#23471d] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1a3516] transition-all">
                                                <ExternalLink size={12} /> View Udhyam Certificate
                                            </a>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DOCUMENTS */}
                    <div className="bg-white shadow-sm border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Documents & Downloads" icon={FileText} />
                        <div className="p-5 flex flex-wrap gap-3">
                            {reg.registrationPdfUrl && (
                                <a href={reg.registrationPdfUrl.includes('cloudinary') && !reg.registrationPdfUrl.endsWith('.pdf') ? reg.registrationPdfUrl + '.pdf' : reg.registrationPdfUrl}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#23471d] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1a3516] transition-all">
                                    <FileText size={12} /> Registration Form (PDF)
                                </a>
                            )}
                            {reg.receiptPdfUrl && (
                                <a href={reg.receiptPdfUrl.includes('cloudinary') && !reg.receiptPdfUrl.endsWith('.pdf') ? reg.receiptPdfUrl + '.pdf' : reg.receiptPdfUrl}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#d26019] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#b8521a] transition-all">
                                    <Receipt size={12} /> Payment Receipt (PDF)
                                </a>
                            )}
                            {reg.receiptUrl && (() => {
                                const url = reg.receiptUrl.startsWith('http') ? reg.receiptUrl : `${SERVER_URL}${reg.receiptUrl}`;
                                const isPdf = url.toLowerCase().includes('.pdf') || url.includes('raw/upload');
                                const finalUrl = isPdf && url.includes('cloudinary') && !url.endsWith('.pdf') ? url + '.pdf' : url;
                                return (
                                    <a href={finalUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                                        <ExternalLink size={12} /> Uploaded Invoice
                                    </a>
                                );
                            })()}
                            {!reg.registrationPdfUrl && !reg.receiptPdfUrl && !reg.receiptUrl && (
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">No documents available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExhibitorBookingDetail;
