import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { motion } from "framer-motion";
import { 
    Users, Search, Download, Eye, 
    Trash2, Edit, CheckCircle, Clock, 
    XCircle, Filter, Mail, Phone, Building,
    CreditCard, MapPin, Calendar
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Table from '../components/table/Table';

const DetailItem = ({ label, value, highlight = false, isLink = false }) => (
    <div className="min-w-0">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
        {isLink ? (
            <a href={value?.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline break-all">{value || 'N/A'}</a>
        ) : (
            <p className={`text-sm break-words ${highlight ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>{value || 'N/A'}</p>
        )}
    </div>
);

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-100 last:border-0">
        <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">{label}</span>
        <span className="text-xs font-black text-slate-800 text-right break-all flex-1 min-w-0">{value || 'N/A'}</span>
    </div>
);

const ManageRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReg, setSelectedReg] = useState(null);
    const [searchParams] = useSearchParams();
    const filterType = searchParams.get('type'); // 'current' or 'incoming'

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/exhibitor-registration');
            if (response.data.success) {
                setRegistrations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
            Swal.fire('Error', 'Failed to load bookings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus, regData) => {
        if (newStatus === 'paid' || newStatus === 'advance-paid') {
            const isAdvance = newStatus === 'advance-paid';
            const totalAmount = regData?.participation?.total || 0;
            const cur = regData?.currency === 'USD' ? '$' : '₹';
            const fmtAmt = (n) => cur + ' ' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

            // Build percent buttons with plain string concat (no nested backticks)
            let pctButtons = '';
            [25, 30, 40, 50, 60, 75].forEach(p => {
                const isDefault = p === 50;
                const bg = isDefault ? '#23471d' : '#f8fafc';
                const color = isDefault ? '#fff' : '#1a3516';
                pctButtons += '<button type="button" data-pct="' + p + '" onclick="window.selectPct(' + p + ',' + totalAmount + ',\'' + cur + '\')" '
                    + 'class="pct-btn" '
                    + 'style="padding:8px 16px;border:1px solid #d1fae5;border-radius:8px;font-weight:900;font-size:13px;cursor:pointer;background:' + bg + ';color:' + color + ';transition:all 0.2s">'
                    + p + '%</button>';
            });

            // Global helper for button click (avoids 'this' context issues)
            window.selectPct = (p, total, currency) => {
                const amt = total * p / 100;
                document.getElementById('swal-percent').value = p;
                document.getElementById('swal-amt-display').textContent = currency + ' ' + amt.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                document.getElementById('swal-balance-display').textContent = currency + ' ' + (total - amt).toLocaleString('en-IN', { maximumFractionDigits: 2 });
                document.querySelectorAll('.pct-btn').forEach(b => {
                    b.style.background = '#f8fafc';
                    b.style.color = '#1a3516';
                });
                const active = document.querySelector('.pct-btn[data-pct="' + p + '"]');
                if (active) { active.style.background = '#23471d'; active.style.color = '#fff'; }
            };

            const advanceHTML = '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:14px;margin-bottom:16px">'
                + '<p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#166534;margin:0 0 10px 0">Advance Percentage</p>'
                + '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px">' + pctButtons + '</div>'
                + '<div style="display:flex;gap:10px;align-items:center;margin-bottom:16px">'
                + '<span style="font-size:11px;font-weight:700;color:#555">Custom&nbsp;%:</span>'
                + '<input id="swal-percent" type="number" min="1" max="99" value="50" '
                + 'oninput="const p=Math.min(99,Math.max(1,this.value||50));const a=' + totalAmount + '*p/100;document.getElementById(\'swal-amt-display\').textContent=\'' + cur + ' \'+a.toLocaleString(\'en-IN\',{maximumFractionDigits:2});document.getElementById(\'swal-balance-display\').textContent=\'' + cur + ' \'+(' + totalAmount + '-a).toLocaleString(\'en-IN\',{maximumFractionDigits:2});document.querySelectorAll(\'.pct-btn\').forEach(b=>{b.style.background=\'#f8fafc\';b.style.color=\'#1a3516\'});" '
                + 'style="width:72px;padding:7px;border:1px solid #d1d5db;border-radius:8px;font-weight:900;font-size:14px;text-align:center"></div>'
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
                + '<div style="background:white;padding:12px;border-radius:10px;border:1px solid #d1fae5">'
                + '<p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#999;margin:0 0 4px 0">Contract Total</p>'
                + '<p style="font-size:14px;font-weight:900;color:#1a3516;margin:0">' + fmtAmt(totalAmount) + '</p></div>'
                + '<div style="background:white;padding:12px;border-radius:10px;border:1px solid #d1fae5">'
                + '<p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#999;margin:0 0 4px 0">Collecting Now</p>'
                + '<p id="swal-amt-display" style="font-size:14px;font-weight:900;color:#d26019;margin:0">' + fmtAmt(totalAmount * 0.5) + '</p></div>'
                + '<div style="background:#fef2f2;padding:12px;border-radius:10px;border:1px solid #fecaca;grid-column:span 2">'
                + '<p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#999;margin:0 0 4px 0">Balance Remaining (Due Later)</p>'
                + '<p id="swal-balance-display" style="font-size:18px;font-weight:900;color:#dc2626;margin:0">' + fmtAmt(totalAmount * 0.5) + '</p>'
                + '</div></div></div>';

            const fullHTML = '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">'
                + '<div><p style="font-size:10px;font-weight:900;text-transform:uppercase;color:#166534;margin:0 0 4px 0">Full Amount to be Collected</p>'
                + '<p style="font-size:22px;font-weight:900;color:#14532d;margin:0">' + fmtAmt(totalAmount) + '</p></div>'
                + '<span style="background:#22c55e;color:white;font-size:9px;font-weight:900;padding:6px 16px;border-radius:100px;text-transform:uppercase">FULL SETTLEMENT</span></div>';

            const commonFields = '<div style="margin-bottom:12px">'
                + '<label style="display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:6px">Payment Method *</label>'
                + '<select id="swal-method" style="width:100%;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-weight:700;font-size:13px">'
                + '<option value="Bank Transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>'
                + '<option value="Cash">Cash Deposit</option>'
                + '<option value="Cheque">Cheque</option>'
                + '<option value="UPI">UPI</option>'
                + '<option value="DD">Demand Draft (DD)</option>'
                + '<option value="Other">Other</option>'
                + '</select></div>'
                + '<div style="margin-bottom:12px">'
                + '<label style="display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:6px">Transaction / Reference ID *</label>'
                + '<input id="swal-txid" style="width:100%;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-weight:700;font-size:13px;box-sizing:border-box" placeholder="UTR / Ref No. / Cheque No."></div>'
                + '<div style="margin-bottom:12px">'
                + '<label style="display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:6px">Upload Receipt (PDF / Image) *</label>'
                + '<input type="file" id="swal-file" style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-size:12px;box-sizing:border-box" accept="image/*,.pdf"></div>'
                + '<div><label style="display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:6px">Admin Notes</label>'
                + '<textarea id="swal-notes" style="width:100%;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-weight:600;font-size:12px;box-sizing:border-box;resize:none;height:70px" placeholder="Internal notes..."></textarea></div>';

            const { value: formValues } = await Swal.fire({
                title: isAdvance ? 'ADVANCE PAYMENT DETAILS' : 'FULL PAYMENT VERIFICATION',
                width: 560,
                html: '<div style="font-family:sans-serif;text-align:left;padding:4px 4px">'
                    + (isAdvance ? advanceHTML : fullHTML)
                    + commonFields + '</div>',
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: isAdvance ? '✓ CONFIRM ADVANCE PAYMENT' : '✓ CONFIRM FULL PAYMENT',
                confirmButtonColor: '#23471d',
                cancelButtonColor: '#94a3b8',
                preConfirm: () => {
                    const method = document.getElementById('swal-method').value;
                    const txid = document.getElementById('swal-txid').value.trim();
                    const file = document.getElementById('swal-file').files[0];
                    const notes = document.getElementById('swal-notes').value;
                    const percent = isAdvance ? parseFloat(document.getElementById('swal-percent').value) : 100;

                    if (!txid) return Swal.showValidationMessage('Transaction / Reference ID is required');
                    if (!file) return Swal.showValidationMessage('Receipt file is required');
                    if (isAdvance && (percent < 1 || percent > 99)) return Swal.showValidationMessage('Advance % must be between 1 and 99');

                    const amountPaid = parseFloat((totalAmount * percent / 100).toFixed(2));
                    const balanceAmount = parseFloat((totalAmount - amountPaid).toFixed(2));
                    return { method, txid, file, notes, percent, amountPaid, balanceAmount };
                }
            });

            if (formValues) {
                Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                try {
                    const fd = new FormData();
                    fd.append('receipt', formValues.file);
                    const uploadRes = await api.post('/api/exhibitor-registration/upload-receipt', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (uploadRes.data.success) {
                        const updateData = {
                            status: newStatus,
                            receiptUrl: uploadRes.data.url,
                            paymentId: formValues.txid,
                            amountPaid: formValues.amountPaid,
                            balanceAmount: formValues.balanceAmount,
                            paymentMode: 'manual',
                            paymentType: isAdvance ? 'advance' : 'full',
                            manualPaymentDetails: {
                                method: formValues.method,
                                transactionId: formValues.txid,
                                notes: formValues.notes,
                                advancePercent: isAdvance ? formValues.percent : 100,
                                updatedAt: new Date()
                            }
                        };
                        const response = await api.put(`/api/exhibitor-registration/${id}`, updateData);
                        if (response.data.success) {
                            Swal.fire({
                                icon: 'success',
                                title: isAdvance ? 'ADVANCE PAYMENT RECORDED' : 'PAYMENT VERIFIED',
                                html: isAdvance
                                    ? `<b>${cur} ${formValues.amountPaid.toLocaleString()}</b> received.<br/>Balance pending: <b style="color:#dc2626">${cur} ${formValues.balanceAmount.toLocaleString()}</b>`
                                    : 'Registration marked as <b>FULLY PAID</b>. Receipt emailed.',
                                confirmButtonColor: '#23471d'
                            });
                            fetchRegistrations();
                        }
                    }
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Failed to process', 'error');
                }
            }
            return;
        }

        try {
            const response = await api.put(`/api/exhibitor-registration/${id}`, { status: newStatus });
            if (response.data.success) {
                Swal.fire('Updated!', `Status changed to ${newStatus}`, 'success');
                fetchRegistrations();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };



    const columns = [
        {
            key: "exhibitor",
            label: "EXHIBITOR",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#23471d]">{row.exhibitorName}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.natureOfBusiness}</span>
                    <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-500 uppercase tracking-tighter">Event: {row.eventId?.name || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            key: "stall",
            label: "STALL DETAILS",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-[#d26019]">STALL: {row.participation?.stallFor || 'N/A'}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{row.participation?.stallType} | {row.participation?.stallSize} sqm</span>
                </div>
            )
        },
        {
            key: "contacts",
            label: "CONTACT",
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Mail size={12} className="text-[#23471d]" />
                        {row.contact1?.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Phone size={12} className="text-[#23471d]" />
                        {row.contact1?.mobile}
                    </div>
                </div>
            )
        },
        {
            key: "payment",
            label: "FINANCIALS",
            render: (row) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            row.paymentMode === 'online' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                            {row.paymentMode}
                        </span>
                    </div>
                    <span className="text-sm font-black text-slate-800">Total: {row.currency === 'USD' ? '$' : '₹'} {row.participation?.total?.toLocaleString()}</span>
                    <div className="flex flex-col mt-1 space-y-0.5">
                        <span className="text-[10px] text-green-600 font-bold tracking-tight">Paid: {row.currency === 'USD' ? '$' : '₹'} {(row.amountPaid || 0).toLocaleString()}</span>
                        {(row.balanceAmount > 0) && (
                            <span className="text-[10px] text-red-500 font-bold tracking-tight">Balance: {row.currency === 'USD' ? '$' : '₹'} {row.balanceAmount.toLocaleString()}</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: "reference",
            label: "SOURCE & LEAD",
            render: (row) => (
                <div className="flex flex-col gap-1.5">
                    <div className="text-[9px] space-y-0.5">
                        <p className="text-slate-400 font-bold uppercase tracking-widest">Referred By</p>
                        <p className="font-black text-slate-700 leading-none">{row.referredBy || 'Direct'}</p>
                    </div>
                    <div className="text-[9px] space-y-0.5 border-t border-slate-100 pt-1">
                        <p className="text-amber-500/60 font-bold uppercase tracking-[0.05em]">Spoken With</p>
                        <p className="font-black text-amber-600 leading-none">{row.spokenWith || 'Direct'}</p>
                    </div>
                    <div className="text-[8px] space-y-0.5 border-t border-slate-100 pt-1">
                        <p className="text-slate-300 font-bold uppercase tracking-widest leading-none">Filled By: {row.filledBy || 'System'}</p>
                    </div>
                </div>
            )
        },
        {
            key: "status",
            label: "STATUS",
            render: (row) => (
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 w-fit border ${
                    row.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    row.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    row.status === 'advance-paid' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                    row.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    row.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                    {row.status}
                </div>
            )
        },
        {
            key: "actions",
            label: "ACTIONS",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setSelectedReg(row)}
                        className="p-2 bg-[#23471d]/5 text-[#23471d] hover:bg-[#23471d]/10 rounded-lg transition-all border border-[#23471d]/20"
                    >
                        <Eye size={16} />
                    </button>
                    <select 
                        onChange={(e) => handleStatusUpdate(row._id, e.target.value, row)}
                        className="text-[10px] font-bold border rounded-lg px-2 py-1 outline-none bg-white"
                        value={row.status}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid (Full)</option>
                        <option value="advance-paid">Advance Paid</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            )
        }
    ];

    const filteredRegs = registrations.filter(r => {
        const matchesSearch = 
            r.exhibitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.participation?.stallNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.eventId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        const today = new Date();
        const eventStartDate = r.eventId?.startDate ? new Date(r.eventId.startDate) : null;
        const eventEndDate = r.eventId?.endDate ? new Date(r.eventId.endDate) : null;

        if (filterType === 'current') {
            // Ideally, current means it hasn't ended yet
            return eventEndDate ? eventEndDate >= today : true;
        }

        if (filterType === 'incoming') {
            // Incoming means it hasn't started yet
            return eventStartDate ? eventStartDate > today : false;
        }

        return true;
    });

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <PageHeader
                title={filterType === 'current' ? "CURRENT EXHIBITOR BOOKINGS" : filterType === 'incoming' ? "INCOMING EXHIBITOR BOOKINGS" : "ALL EXHIBITOR BOOKINGS"}
                description={filterType === 'current' ? "Monitor active registrations for upcoming or ongoing shows" : "Preview bookings for future exhibition cycles"}
            />

            <div className="mt-8 space-y-6">
                {/* FILTERS BAR */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by company or stall..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#23471d]/20 outline-none transition-all font-bold text-slate-800"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <Download size={18} />
                            Export Data
                        </button>
                    </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <Table 
                        columns={columns}
                        data={filteredRegs}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* DETAIL MODAL - ULTIMATE REDESIGN */}
            {selectedReg && (
                <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-slate-50 w-full max-w-7xl h-[85vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col lg:flex-row border border-white/20"
                    >
                        {/* LEFT SIDEBAR: STATUS & QUICK ACTIONS */}
                        <div className="w-full lg:w-[380px] bg-white border-r border-slate-200 flex flex-col">
                            <div className="p-10 flex-1 space-y-8 overflow-y-auto">
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => setSelectedReg(null)}
                                        className="mb-4 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest group"
                                    >
                                        <XCircle size={18} className="group-hover:rotate-90 transition-transform" /> 
                                        Close Details
                                    </button>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Exhibitor Branding</p>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{selectedReg.exhibitorName}</h2>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                            selectedReg.status === 'approved' ? 'bg-green-500 text-white' :
                                            selectedReg.status === 'pending' ? 'bg-amber-500 text-white' :
                                            'bg-slate-900 text-white'
                                        }`}>
                                            {selectedReg.status}
                                        </span>
                                        <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200">
                                            {selectedReg.paymentMode}
                                        </span>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* STALL TILE - COMPACT */}
                                <div className="p-6 bg-[#d26019] rounded-[2rem] text-white shadow-xl shadow-[#d26019]/20">
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Allocated Stand</p>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-bold opacity-80">{selectedReg.participation?.stallType}</p>
                                            <p className="text-4xl font-black tracking-tighter">{selectedReg.participation?.stallFor || selectedReg.participation?.stallNo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black">{selectedReg.participation?.stallSize} <span className="text-xs opacity-60">SQM</span></p>
                                            <p className="text-[10px] uppercase font-bold opacity-60">{selectedReg.participation?.dimension}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* FINANCIAL TILE */}
                                <div className="p-6 bg-[#23471d] rounded-[2rem] text-white shadow-xl shadow-[#23471d]/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                        <CreditCard size={80} />
                                    </div>
                                    <div className="relative z-10 space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Contract Total</p>
                                            <p className="text-3xl font-black tracking-tight">{selectedReg.currency === 'USD' ? '$' : '₹'} {selectedReg.participation?.total?.toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase">Paid Amount</p>
                                                <p className="text-sm font-black text-green-400">{selectedReg.currency === 'USD' ? '$' : '₹'} {(selectedReg.amountPaid || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-white/40 uppercase">Balance Due</p>
                                                <p className={`text-sm font-black ${(selectedReg.balanceAmount || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {selectedReg.currency === 'USD' ? '$' : '₹'} {(selectedReg.balanceAmount || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PAYMENT VERIFICATION DATA */}
                                {(selectedReg.status === 'paid' || selectedReg.status === 'advance-paid') && selectedReg.manualPaymentDetails && (
                                    <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-600" />
                                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                                    {selectedReg.status === 'advance-paid' ? 'Advance Payment Recorded' : 'Full Payment Verified'}
                                                </p>
                                            </div>
                                            {selectedReg.status === 'advance-paid' && (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-300 rounded-full text-[9px] font-black uppercase">
                                                    {selectedReg.manualPaymentDetails.advancePercent || '?'}% Paid
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <DetailRow label="Method" value={selectedReg.manualPaymentDetails.method} />
                                            <DetailRow label="Txn / Ref ID" value={selectedReg.manualPaymentDetails.transactionId} />
                                            {selectedReg.manualPaymentDetails.notes && (
                                                <DetailRow label="Admin Notes" value={selectedReg.manualPaymentDetails.notes} />
                                            )}
                                        </div>
                                        {/* Balance Warning for Advance */}
                                        {selectedReg.status === 'advance-paid' && selectedReg.balanceAmount > 0 && (
                                            <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                                                <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mb-1">Pending Balance</p>
                                                <p className="text-xl font-black text-red-600">
                                                    {selectedReg.currency === 'USD' ? '$' : '₹'} {selectedReg.balanceAmount.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {selectedReg.receiptUrl && (
                                            <a 
                                                href={selectedReg.receiptUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                                            >
                                                <Download size={14} />
                                                View Uploaded Receipt
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* UPDATE STATUS QUICK PANEL */}
                            <div className="p-8 bg-slate-50 border-t border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Modify Booking Status</p>
                                <div className="flex gap-2">
                                    <select 
                                        onChange={(e) => handleStatusUpdate(selectedReg._id, e.target.value, selectedReg)}
                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-[#23471d]/20"
                                        value={selectedReg.status}
                                    >
                                        <option value="pending">Pending Review</option>
                                        <option value="approved">Approved</option>
                                        <option value="paid">Paid (Full) ✓</option>
                                        <option value="advance-paid">Advance Paid</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT MAIN CONTENT: DATA BLOCKS */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-10 space-y-12">
                            {/* BLOCK 1: CORPORATE IDENTITY */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-0.5 w-12 bg-[#23471d]"></div>
                                    <h3 className="text-[11px] font-black text-[#23471d] uppercase tracking-[0.3em]">Corporate Identity</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/50">
                                    <DetailItem label="Fascia Name (On Stall)" value={selectedReg.fasciaName} highlight={true} />
                                    <DetailItem label="Business Model" value={selectedReg.typeOfBusiness} />
                                    <DetailItem label="Industry Sector" value={selectedReg.industrySector} />
                                    <DetailItem label="Nature of Business" value={selectedReg.natureOfBusiness} />
                                    <DetailItem label="Website Address" value={selectedReg.website} isLink={true} />
                                    <DetailItem label="Landline Number" value={selectedReg.landlineNo} />
                                    <DetailItem label="GST Number" value={selectedReg.gstNo} />
                                    <DetailItem label="PAN Card No." value={selectedReg.panNo} />
                                </div>
                            </section>

                            {/* BLOCK 2: LIAISON & CORRESPONDENCE */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-blue-600">
                                    <div className="h-0.5 w-12 bg-blue-600"></div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Communication Channels</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Primary */}
                                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/50 space-y-6">
                                        <div className="flex items-center gap-3 text-slate-400 border-b border-slate-50 pb-4">
                                            <Users size={16} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Authorized Primary Contact</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <DetailItem label="Full Name" value={`${selectedReg.contact1?.title || ''} ${selectedReg.contact1?.firstName || ''} ${selectedReg.contact1?.lastName || ''}`.trim()} highlight={true} />
                                            <DetailItem label="Designation" value={selectedReg.contact1?.designation} />
                                            <DetailItem label="Official Email" value={selectedReg.contact1?.email} />
                                            <DetailItem label="Mobile" value={selectedReg.contact1?.mobile} />
                                        </div>
                                    </div>
                                    {/* Secondary */}
                                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/50 space-y-6">
                                        <div className="flex items-center gap-3 text-slate-400 border-b border-slate-50 pb-4">
                                            <Users size={16} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Secondary Correspondence</span>
                                        </div>
                                        {selectedReg.contact2?.firstName ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                <DetailItem label="Full Name" value={`${selectedReg.contact2?.title || ''} ${selectedReg.contact2?.firstName || ''} ${selectedReg.contact2?.lastName || ''}`.trim()} />
                                                <DetailItem label="Designation" value={selectedReg.contact2?.designation} />
                                                <DetailItem label="Official Email" value={selectedReg.contact2?.email} />
                                                <DetailItem label="Mobile" value={selectedReg.contact2?.mobile} />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-3xl">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Secondary Contact Listed</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* BLOCK 3: GEOGRAPHICAL ADDRESS */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <div className="h-0.5 w-12 bg-slate-400"></div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Premise Location Control</h3>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/50">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                        <div className="lg:col-span-2">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Registered HQ Address</p>
                                            <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedReg.address}</p>
                                        </div>
                                        <DetailItem label="State / Province" value={selectedReg.state} />
                                        <DetailItem label="City / Region" value={selectedReg.city} />
                                        <DetailItem label="Country" value={selectedReg.country} />
                                        <DetailItem label="Pincode / ZIP" value={selectedReg.pincode} />
                                    </div>
                                </div>
                            </section>

                            {/* BLOCK 4: LOGISTICS & ORIGIN */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-[#23471d]/5 p-8 rounded-[2.5rem] border border-[#23471d]/10">
                                    <h4 className="text-[10px] font-black text-[#23471d] uppercase tracking-widest mb-4">Target Market Sub-Sectors</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedReg.selectedSectors?.length > 0 ? selectedReg.selectedSectors.map((s, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-white border border-[#23471d]/10 rounded-xl text-[9px] font-black text-[#23471d] shadow-sm uppercase tracking-tighter">{s}</span>
                                        )) : <span className="text-slate-400 font-bold italic text-xs">Unspecified Sectors</span>}
                                    </div>
                                </div>
                                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex flex-col justify-center gap-4 border border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Operational Source</span>
                                        <span className="text-[10px] font-black text-blue-400">{selectedReg.referredBy || 'Organic Lead'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Spoken With</span>
                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{selectedReg.spokenWith || 'Direct'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-white/10 pt-2 lg:pt-0 lg:border-0 font-bold">
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Data Controller</span>
                                        <span className="text-[10px] font-black text-green-400 uppercase">{selectedReg.filledBy || 'System Terminal'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Timestamp Log</span>
                                        <span className="text-[10px] font-bold text-slate-500">{new Date(selectedReg.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManageRegistrations;
