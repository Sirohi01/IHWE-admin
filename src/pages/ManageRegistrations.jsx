import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { motion } from "framer-motion";
import { 
    Users, Search, Download, Eye, 
    Trash2, Edit, CheckCircle, Clock, 
    XCircle, Filter, Mail, Phone, Building,
    CreditCard, MapPin, Calendar, X, User, Layout
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { createActivityLogThunk } from '../features/activityLog/activityLogSlice';

const DetailItem = ({ label, value, highlight = false, isLink = false }) => (
    <div className="min-w-0 font-inter">
        <p className={`block text-[11px] font-medium uppercase tracking-tight mb-1 ${label === 'Highlight Text (Orange)' ? 'text-[#d26019]' : 'text-black'}`}>{label}</p>
        {isLink ? (
            <a href={value?.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline break-all">{value || 'N/A'}</a>
        ) : (
            <p className={`text-sm font-semibold uppercase ${highlight ? 'text-red-600' : 'text-gray-700'} break-words`}>{value || 'N/A'}</p>
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
    const navigate = useNavigate();
    const filterType = searchParams.get('type'); // 'current' or 'incoming'
    const dispatch = useDispatch();

    const getUserInfo = () => {
        const userStr = sessionStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = sessionStorage.getItem("user_id") || user._id;
        const userName = user.name || "User";
        return { userId, userName };
    };

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
            // If already advance-paid, show remaining balance instead of full total
            const alreadyPaid = regData?.amountPaid || 0;
            const remainingAmount = Math.max(0, totalAmount - alreadyPaid);
            const collectAmount = isAdvance ? totalAmount : remainingAmount;
            const cur = regData?.participation?.currency === 'USD' ? '$' : '₹';
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

            const fullHTML = '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:14px;margin-bottom:16px">'
                + (alreadyPaid > 0 ? '<div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:10px 12px;margin-bottom:12px;display:flex;justify-content:space-between">'
                    + '<div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#854d0e;margin:0 0 2px 0">Already Paid</p>'
                    + '<p style="font-size:14px;font-weight:900;color:#854d0e;margin:0">' + fmtAmt(alreadyPaid) + '</p></div>'
                    + '<div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#166534;margin:0 0 2px 0">Contract Total</p>'
                    + '<p style="font-size:14px;font-weight:900;color:#166534;margin:0">' + fmtAmt(totalAmount) + '</p></div>'
                    + '</div>' : '')
                + '<div style="display:flex;justify-content:space-between;align-items:center">'
                + '<div><p style="font-size:10px;font-weight:900;text-transform:uppercase;color:#166534;margin:0 0 4px 0">' + (alreadyPaid > 0 ? 'Balance to Collect (Remaining)' : 'Full Amount to be Collected') + '</p>'
                + '<p style="font-size:22px;font-weight:900;color:#14532d;margin:0">' + fmtAmt(collectAmount) + '</p></div>'
                + '<span style="background:#22c55e;color:white;font-size:9px;font-weight:900;padding:6px 16px;border-radius:100px;text-transform:uppercase">' + (alreadyPaid > 0 ? 'BALANCE SETTLEMENT' : 'FULL SETTLEMENT') + '</span></div></div>';

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
                + '<input type="file" id="swal-file" style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-size:12px;box-sizing:border-box" accept="image/*"></div>'
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

                    const amountPaid = isAdvance
                        ? parseFloat((totalAmount * percent / 100).toFixed(2))
                        : parseFloat(collectAmount.toFixed(2));
                    const newTotalPaid = parseFloat((alreadyPaid + amountPaid).toFixed(2));
                    const balanceAmount = parseFloat((totalAmount - newTotalPaid).toFixed(2));
                    return { method, txid, file, notes, percent, amountPaid: newTotalPaid, balanceAmount };
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
                            const { userId, userName } = getUserInfo();
                            if (userId) {
                                dispatch(createActivityLogThunk({
                                    user_id: userId,
                                    message: `Exhibitor: Updated payment for '${regData.exhibitorName}' in ${regData.eventId?.name || 'N/A'} (Status: ${newStatus}) by ${userName}`,
                                    section: "Book A Stand",
                                    data: {
                                        action: "UPDATE",
                                        booking_id: id,
                                        exhibitor: regData.exhibitorName,
                                        new_status: newStatus,
                                        payment_details: updateData
                                    }
                                }));
                            }

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
                const reg = registrations.find(r => r._id === id);
                const { userId, userName } = getUserInfo();
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Exhibitor: Updated status for '${reg?.exhibitorName || id}' to '${newStatus}' by ${userName}`,
                        section: "Book A Stand",
                        data: {
                            action: "UPDATE",
                            booking_id: id,
                            exhibitor: reg?.exhibitorName,
                            new_status: newStatus
                        }
                    }));
                }
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
                <div className="flex flex-col font-inter">
                    <span className="font-semibold text-red-600 text-sm uppercase tracking-tight leading-none mb-1">{row.exhibitorName}</span>
                    <span className="text-[10px] text-black font-medium uppercase tracking-widest leading-none">{row.natureOfBusiness}</span>
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-medium text-black uppercase tracking-tighter border border-slate-200">Event: <span className="text-red-500 font-bold">{row.eventId?.name || 'N/A'}</span></span>
                    </div>
                </div>
            )
        },
        {
            key: "stall",
            label: "STALL DETAILS",
            render: (row) => (
                <div className="flex flex-col font-inter">
                    <span className="font-semibold text-[#d26019] text-xs uppercase tracking-tight">STALL: {row.participation?.stallFor || 'A/A'}</span>
                    <span className="text-[10px] text-black font-medium uppercase tracking-tighter mt-1">{row.participation?.stallType} | {row.participation?.stallSize} sqm</span>
                </div>
            )
        },
        {
            key: "contacts",
            label: "CONTACT",
            render: (row) => (
                <div className="space-y-1 font-inter">
                    <div className="flex items-center gap-2 text-xs font-semibold text-black">
                        <Mail size={12} className="text-[#23471d]" />
                        {row.contact1?.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-black">
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
                <div className="flex flex-col font-inter">
                    <div className="flex items-center gap-1 mb-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-[2px] border ${
                            row.paymentMode === 'online' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                            {row.paymentMode}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-black uppercase tracking-tight">Total: {row.currency === 'USD' ? '$' : '₹'} {row.participation?.total?.toLocaleString()}</span>
                    <div className="flex flex-col mt-1.5 space-y-0.5">
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
                <div className="flex flex-col gap-1.5 font-inter">
                    <div className="text-[9px] space-y-0.5">
                        <p className="text-black font-medium uppercase tracking-widest leading-none">Referred By</p>
                        <p className="font-bold text-black uppercase">{row.referredBy || 'Direct'}</p>
                    </div>
                    <div className="text-[9px] space-y-0.5 border-t border-slate-100 pt-1">
                        <p className="text-[#d26019] font-medium uppercase tracking-[0.05em] leading-none">Spoken With</p>
                        <p className="font-bold text-[#d26019] uppercase">{row.spokenWith || 'Direct'}</p>
                    </div>
                    <div className="text-[8px] space-y-0.5 border-t border-slate-100 pt-1">
                        <p className="text-black font-medium uppercase tracking-widest leading-none opacity-40">Filled By: {row.filledBy || 'System'}</p>
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
                    row.status === 'payment-failed' ? 'bg-rose-100 text-rose-800 border-rose-300' :
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
                        onClick={() => navigate(`/exhibitor-booking/${row._id}`)}
                        className="p-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-[2px] transition-all border border-gray-200"
                    >
                        <Eye size={16} />
                    </button>
                    <select 
                        onChange={(e) => handleStatusUpdate(row._id, e.target.value, row)}
                        className="text-[10px] font-bold border-2 border-gray-200 rounded-[2px] px-2 py-1 outline-none bg-white focus:border-[#23471d]"
                        value={row.status}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid (Full)</option>
                        <option value="advance-paid">Advance Paid</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                        <option value="payment-failed">Payment Failed</option>
                    </select>
                </div>
            )
        }
    ];

    const filteredRegs = registrations.filter(r => {
        // Exclude payment-failed entries - they have their own dedicated page
        if (r.status === 'payment-failed') return false;

        const matchesSearch = 
            r.exhibitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.participation?.stallNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.eventId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        const today = new Date();
        const eventStartDate = r.eventId?.startDate ? new Date(r.eventId.startDate) : null;
        const eventEndDate = r.eventId?.endDate ? new Date(r.eventId.endDate) : null;

        if (filterType === 'current') {
            return eventEndDate ? eventEndDate >= today : true;
        }

        if (filterType === 'incoming') {
            return eventStartDate ? eventStartDate > today : false;
        }

        return true;
    });

    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when search changes
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const totalPages = Math.ceil(filteredRegs.length / PAGE_SIZE);
    const paginatedRegs = filteredRegs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="p-6 bg-white min-h-screen">
            <PageHeader
                title={filterType === 'current' ? "CURRENT EXHIBITOR BOOKINGS" : filterType === 'incoming' ? "INCOMING EXHIBITOR BOOKINGS" : "ALL EXHIBITOR BOOKINGS"}
                description={filterType === 'current' ? "Monitor active registrations for upcoming or ongoing shows" : "Preview bookings for future exhibition cycles"}
            />

            <div className="mt-6 space-y-4">
                {/* SEARCH BAR */}
                <div className="bg-white shadow-md border-2 border-gray-200 rounded-[2px] px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by company or stall..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[2px] text-sm outline-none focus:border-[#23471d] transition-all font-medium text-slate-800"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-[2px] text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <Download size={16} />
                        Export Data
                    </button>
                </div>

                {/* TABLE CONTAINER */}
                <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-[#23471d] px-5 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-white/80" />
                            <h2 className="text-white font-bold text-base uppercase tracking-tight font-inter">Exhibitor Bookings</h2>
                        </div>
                        <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider shadow-sm">
                            {filteredRegs.length} RECORDS
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                                    <th className="py-4 px-4 text-[11px] font-medium text-black uppercase text-center w-12 tracking-tight">No.</th>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className={`py-4 px-4 text-[11px] font-medium text-black uppercase tracking-tight ${col.key === 'actions' || col.key === 'status' ? 'text-center' : 'text-left'}`}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-inter">
                                {isLoading ? (
                                    <tr><td colSpan={columns.length + 1} className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">Loading bookings...</td></tr>
                                ) : filteredRegs.length === 0 ? (
                                    <tr><td colSpan={columns.length + 1} className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">No registrations found</td></tr>
                                ) : (
                                    paginatedRegs.map((row, idx) => (
                                        <tr key={row._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group">
                                            <td className="py-3 px-4 text-gray-400 font-bold text-center text-xs">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                                            {columns.map((col, colIdx) => (
                                                <td key={colIdx} className={`py-3 px-4 ${col.key === 'actions' || col.key === 'status' ? 'text-center' : 'text-left'}`}>
                                                    {col.render ? col.render(row) : row[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-white px-5 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/30">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                            Showing <span className="text-red-600 font-black">{Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredRegs.length)}–{Math.min(currentPage * PAGE_SIZE, filteredRegs.length)}</span> of <span className="text-red-600 font-black">{filteredRegs.length}</span> registrations
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-[10px] font-black border border-gray-200 rounded-[2px] disabled:opacity-30 hover:bg-gray-100 transition-all"
                                >«</button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-[10px] font-black border border-gray-200 rounded-[2px] disabled:opacity-30 hover:bg-gray-100 transition-all"
                                >‹</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce((acc, p, i, arr) => {
                                        if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) => p === '...'
                                        ? <span key={`ellipsis-${i}`} className="px-2 py-1 text-[10px] text-gray-400">…</span>
                                        : <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`px-2.5 py-1 text-[10px] font-black border rounded-[2px] transition-all ${currentPage === p ? 'bg-[#23471d] text-white border-[#23471d]' : 'border-gray-200 hover:bg-gray-100'}`}
                                        >{p}</button>
                                    )
                                }
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 text-[10px] font-black border border-gray-200 rounded-[2px] disabled:opacity-30 hover:bg-gray-100 transition-all"
                                >›</button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 text-[10px] font-black border border-gray-200 rounded-[2px] disabled:opacity-30 hover:bg-gray-100 transition-all"
                                >»</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DETAIL MODAL - PROFESSIONAL REDESIGN */}
            {selectedReg && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white max-w-6xl w-full h-[90vh] overflow-hidden rounded-[2px] shadow-2xl flex flex-col border-2 border-gray-200"
                    >
                        {/* TOP HEADER BAR */}
                        <div className="bg-gray-100 border-b border-gray-300 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#23471d]/10 rounded-[2px]">
                                    <Building className="w-5 h-5 text-[#23471d]" />
                                </div>
                                <div>
                                    <h2 className="text-[#23471d] font-bold text-base uppercase tracking-tight font-inter">Exhibitor Booking Dossier</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Ref: {selectedReg._id?.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedReg(null)}
                                className="p-2 bg-red-50 text-red-500 hover:bg-red-100 transition-all rounded-[2px] border border-red-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* LEFT SIDEBAR: SUMMARY & QUICK ACTIONS */}
                            <div className="w-full lg:w-[320px] bg-gray-50/50 border-r border-gray-200 flex flex-col overflow-y-auto">
                                <div className="p-8 space-y-8">
                                    {/* Company Identity */}
                                    <div className="space-y-4 font-inter">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-medium text-black uppercase tracking-[0.2em] mb-2">Primary Entity</p>
                                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-none uppercase">{selectedReg.exhibitorName}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className={`px-3 py-1 rounded-[2px] text-[9px] font-black uppercase tracking-widest shadow-sm border ${
                                                selectedReg.status === 'approved' ? 'bg-green-500 text-white border-green-600' :
                                                selectedReg.status === 'pending' ? 'bg-amber-500 text-white border-amber-600' :
                                                'bg-gray-900 text-white border-black'
                                            }`}>
                                                {selectedReg.status}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-[2px] text-[9px] font-black uppercase tracking-widest border border-blue-200 shadow-sm">
                                                {selectedReg.paymentMode}
                                            </span>
                                        </div>
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* Stand Information */}
                                    <div className="p-6 bg-white border-2 border-gray-100 rounded-[2px] shadow-sm font-inter">
                                        <p className="text-[10px] font-medium text-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Layout className="w-3 h-3" /> Allocated Stand
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{selectedReg.participation?.stallType}</p>
                                                <p className="text-4xl font-black text-[#d26019] tracking-tighter leading-none">{selectedReg.participation?.stallFor || selectedReg.participation?.stallNo}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-gray-800 leading-none">{selectedReg?.participation?.stallSize} <span className="text-[10px] text-gray-400">SQM</span></p>
                                                <p className="text-[9px] uppercase font-bold text-gray-400">{selectedReg.participation?.dimension}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="p-6 bg-white border-2 border-gray-100 rounded-[2px] shadow-sm relative overflow-hidden font-inter">
                                        <p className="text-[10px] font-medium text-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <CreditCard className="w-3 h-3" /> Contract Ledger
                                        </p>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Fee</p>
                                                <p className="text-2xl font-black text-[#23471d] tracking-tight">{selectedReg.currency === 'USD' ? '$' : '₹'} {selectedReg.participation?.total?.toLocaleString()}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                                <div>
                                                    <p className="text-[9px] font-medium text-black uppercase mb-1 tracking-tighter">Amount Paid</p>
                                                    <p className="text-xs font-black text-green-600 font-inter">{selectedReg.currency === 'USD' ? '$' : '₹'} {(selectedReg.amountPaid || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-medium text-black uppercase mb-1 tracking-tighter">Balance Due</p>
                                                    <p className={`text-xs font-black font-inter ${(selectedReg.balanceAmount || 0) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {selectedReg.currency === 'USD' ? '$' : '₹'} {(selectedReg.balanceAmount || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Receipt Display */}
                                    {(selectedReg.status === 'paid' || selectedReg.status === 'advance-paid') && selectedReg.receiptUrl && (
                                        <div className="p-6 bg-white border-2 border-gray-100 rounded-[2px] shadow-sm space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle size={14} className="text-green-600" />
                                                    <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest">
                                                        {selectedReg.status === 'advance-paid' ? 'Advance Recorded' : 'Payment Verified'}
                                                    </p>
                                                </div>
                                            </div>
                                            <a 
                                                href={selectedReg.receiptUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-[2px] text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                                            >
                                                <Download size={14} />
                                                Download Receipt
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* FOOTER STATUS CONTROLLER */}
                                <div className="p-8 bg-gray-50 border-t border-gray-200 mt-auto sticky bottom-0 font-inter">
                                    <p className="text-[10px] font-medium text-black uppercase tracking-[0.2em] mb-3">Booking Control Panel</p>
                                    <select 
                                        onChange={(e) => handleStatusUpdate(selectedReg._id, e.target.value, selectedReg)}
                                        className="w-full bg-white border-2 border-gray-200 rounded-[2px] px-4 py-2.5 text-xs font-bold outline-none focus:border-[#23471d] shadow-sm transition-all text-gray-700"
                                        value={selectedReg.status}
                                    >
                                        <option value="pending">Review Pending</option>
                                        <option value="approved">Approved / Active</option>
                                        <option value="paid">Fully Settled ✓</option>
                                        <option value="advance-paid">Partial (Advance)</option>
                                        <option value="confirmed">Confirmed Registry</option>
                                        <option value="rejected">Rejected / Cancelled</option>
                                        <option value="payment-failed">Payment Failed</option>
                                    </select>
                                </div>
                            </div>

                            {/* RIGHT MAIN CONTENT: DATA BLOCKS */}
                            <div className="flex-1 overflow-y-auto bg-white p-10 space-y-12">
                                {/* Corporate Info */}
                                <section className="space-y-6 font-inter">
                                    <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-1 bg-[#23471d]"></div>
                                            <h3 className="text-lg font-bold text-[#23471d] uppercase tracking-tight">Corporate Profile</h3>
                                        </div>
                                        <span className="text-[11px] font-medium text-black uppercase tracking-widest whitespace-nowrap">Section 01 / Registry Data</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
                                        <DetailItem label="Business Nature" value={selectedReg.natureOfBusiness} />
                                        <DetailItem label="Fascia Name" value={selectedReg.fasciaName} highlight={true} />
                                        <DetailItem label="Ownership Model" value={selectedReg.typeOfBusiness} />
                                        <DetailItem label="Industry Segment" value={selectedReg.industrySector} />
                                        <DetailItem label="Corporate Portal" value={selectedReg.website} isLink={true} />
                                        <DetailItem label="Tax ID (GST)" value={selectedReg.gstNo} />
                                        <DetailItem label="PAN Card Ref" value={selectedReg.panNo} />
                                        <DetailItem label="Fixed Line" value={selectedReg.landlineNo} />
                                    </div>
                                </section>

                                {/* Communication */}
                                <section className="space-y-6 font-inter">
                                    <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-1 bg-red-600"></div>
                                            <h3 className="text-lg font-bold text-red-600 uppercase tracking-tight">Communication Channels</h3>
                                        </div>
                                        <span className="text-[11px] font-medium text-black uppercase tracking-widest whitespace-nowrap">Section 02 / Liaison</span>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-gray-50/50 p-8 border border-gray-100 rounded-[2px] space-y-6 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity text-black">
                                                <User size={80} />
                                            </div>
                                            <div className="flex items-center gap-3 text-red-600 mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 bg-red-50 inline-block border border-red-100">Primary Liaison Officer</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-5 relative z-10">
                                                <DetailItem label="Main Title" value={`${selectedReg.contact1?.title || ''} ${selectedReg.contact1?.firstName || ''} ${selectedReg.contact1?.lastName || ''}`.trim()} highlight={true} />
                                                <DetailItem label="Official Designation" value={selectedReg.contact1?.designation} />
                                                <DetailItem label="Liaison Email" value={selectedReg.contact1?.email} />
                                                <DetailItem label="Direct Mobile" value={selectedReg.contact1?.mobile} />
                                            </div>
                                        </div>
                                        <div className="bg-gray-50/50 p-8 border border-gray-100 rounded-[2px] space-y-6 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity text-black">
                                                <Users size={80} />
                                            </div>
                                            <div className="flex items-center gap-3 text-black mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 bg-white inline-block border border-gray-200">Secondary Correspondence</span>
                                            </div>
                                            {selectedReg.contact2?.firstName ? (
                                                <div className="grid grid-cols-1 gap-5 relative z-10">
                                                    <DetailItem label="Coordinator 2" value={`${selectedReg.contact2?.title || ''} ${selectedReg.contact2?.firstName || ''} ${selectedReg.contact2?.lastName || ''}`.trim()} />
                                                    <DetailItem label="Designation" value={selectedReg.contact2?.designation} />
                                                    <DetailItem label="Mobile Ref" value={selectedReg.contact2?.mobile} />
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 p-10">
                                                    <span className="text-[11px] font-medium text-black uppercase tracking-widest">No Secondary Liaison Configured</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Premise Data */}
                                <section className="space-y-6 font-inter">
                                    <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-1 bg-blue-600"></div>
                                            <h3 className="text-lg font-bold text-blue-600 uppercase tracking-tight">Geographical HQ Control</h3>
                                        </div>
                                        <span className="text-[11px] font-medium text-black uppercase tracking-widest whitespace-nowrap">Section 03 / Premise Data</span>
                                    </div>
                                    <div className="bg-gray-50/30 p-8 border border-gray-100 rounded-[2px]">
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                                            <div className="lg:col-span-2">
                                                <p className="text-sm font-bold text-black mb-1 uppercase tracking-tight">Short Description</p>
                                                <p className="text-sm font-semibold text-gray-600 leading-relaxed uppercase">{selectedReg.address}</p>
                                            </div>
                                            <DetailItem label="State / Province" value={selectedReg.state} />
                                            <DetailItem label="City / Hub" value={selectedReg.city} />
                                            <DetailItem label="Nation" value={selectedReg.country} />
                                            <DetailItem label="ZIP / Pincode" value={selectedReg.pincode} />
                                        </div>
                                    </div>
                                </section>

                                {/* Logistics Control */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                                    <div className="bg-[#23471d]/5 p-8 border-l-4 border-[#23471d] space-y-4">
                                        <h4 className="block text-sm font-bold text-[#d26019] uppercase tracking-tight mb-1">Highlight Text (Orange)</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedReg.selectedSectors?.length > 0 ? selectedReg.selectedSectors.map((s, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-white border border-[#23471d]/10 text-[9px] font-black text-[#23471d] uppercase shadow-sm">{s}</span>
                                            )) : <span className="text-gray-400 font-bold italic text-xs uppercase">Unspecified Sectors</span>}
                                        </div>
                                    </div>
                                    <div className="bg-gray-900 border-l-4 border-red-600 p-8 grid grid-cols-2 gap-y-4 font-inter">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Entry Origin</p>
                                            <p className="text-[10px] font-black text-white uppercase">{selectedReg.referredBy || 'Direct Lead'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Liaison Ref</p>
                                            <p className="text-[10px] font-black text-amber-500 uppercase">{selectedReg.spokenWith || 'System Organic'}</p>
                                        </div>
                                        <div className="space-y-1 pt-2 border-t border-white/5">
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Terminal Point</p>
                                            <p className="text-[10px] font-black text-green-400 uppercase">{selectedReg.filledBy || 'Auto Logic'}</p>
                                        </div>
                                        <div className="space-y-1 pt-2 border-t border-white/5">
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Timestamp Log</p>
                                            <p className="text-[10px] font-bold text-gray-400">{new Date(selectedReg.createdAt).toLocaleDateString()}</p>
                                        </div>
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
