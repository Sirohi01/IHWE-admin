import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { motion } from "framer-motion";
import {
    Users, Search, Eye, Mail, Phone, Building,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { createActivityLogThunk } from '../features/activityLog/activityLogSlice';
import { SERVER_URL } from '../lib/api';

const fixUrl = (url) => {
    if (!url || url === 'undefined' || url === 'null') return null;
    if (typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('blob:')) {
        return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${SERVER_URL}${cleanPath}`;
};

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
                setRegistrations(Array.isArray(response.data.data) ? response.data.data : []);
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
            const fb = regData?.financeBreakdown || {};
            const totalAmount = fb.netPayable || regData?.participation?.total || 0;
            const history = regData?.paymentHistory || [];
            const alreadyPaid = history.reduce((sum, h) => sum + (h.amount || 0), 0);
            const remainingAmount = Math.max(0, totalAmount - alreadyPaid);
            const collectAmount = isAdvance ? totalAmount : remainingAmount;
            const isFirstPayment = history.length === 0;
            const cur = regData?.participation?.currency === 'USD' ? '$' : '₹';
            const fmtAmt = (n) => cur + ' ' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

            const paymentPlans = regData?.eventId?.paymentPlans || [];
            const installmentPlans = paymentPlans.filter(p => Number(p.percentage) > 0 && Number(p.percentage) < 100);
            const defaultPcts = installmentPlans.length > 0 ? installmentPlans.map(p => Number(p.percentage)) : [25, 30, 40, 50, 60, 75];
            const defaultSelectedPct = defaultPcts.length > 0 ? defaultPcts[0] : 50;
            const installmentBase = alreadyPaid > 0 ? remainingAmount : totalAmount;

            const nextPaymentNo = history.length + 1;

            let pctButtons = '';
            defaultPcts.forEach((p, idx) => {
                const planLabel = installmentPlans.find(plan => Number(plan.percentage) === p)?.label || (p + '%');
                const isDefault = idx === 0;
                const isAlreadyPaid = idx < history.length;

                let btnStyle = 'padding:5px 10px;border:1px solid #e2e8f0;border-radius:6px;font-weight:900;font-size:11px;transition:all 0.2s;white-space:nowrap;';
                if (isAlreadyPaid) {
                    btnStyle += 'background:#f1f5f9;color:#94a3b8;cursor:not-allowed;text-decoration:line-through;';
                } else if (isDefault) {
                    btnStyle += 'background:#334155;color:#fff;cursor:pointer;';
                } else {
                    btnStyle += 'background:#fff;color:#334155;cursor:pointer;';
                }

                pctButtons += `<button type="button" ${isAlreadyPaid ? 'disabled' : ''} data-pct="${p}" onclick="window.selectPct(${p},${installmentBase},'${cur}')" `
                    + `class="pct-btn" style="${btnStyle}">${planLabel}</button>`;
            });

            // If all phases are done but balance still remaining, add "Pay Remaining" button
            const allPhasesDone = history.length >= defaultPcts.length;
            if (allPhasesDone && remainingAmount > 0) {
                const remainBtnStyle = 'padding:5px 10px;border:2px solid #23471d;border-radius:6px;font-weight:900;font-size:11px;background:#23471d;color:#fff;cursor:pointer;white-space:nowrap;';
                pctButtons += `<button type="button" data-pct="remaining" onclick="window.selectPctRemaining(${remainingAmount},'${cur}')" `
                    + `class="pct-btn" style="${remainBtnStyle}">Pay Remaining Balance</button>`;
            }

            window.selectPct = (p, base, currency) => {
                const amt = base * p / 100;
                const percentInput = document.getElementById('swal-percent');
                if (percentInput) percentInput.value = p;

                const amtDisplay = document.getElementById('swal-amt-display');
                const balDisplay = document.getElementById('swal-balance-display');

                if (amtDisplay) amtDisplay.textContent = currency + ' ' + amt.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                if (balDisplay) balDisplay.textContent = currency + ' ' + (base - amt).toLocaleString('en-IN', { maximumFractionDigits: 2 });

                document.querySelectorAll('.pct-btn').forEach(b => {
                    if (b.disabled) return;
                    b.style.background = '#fff';
                    b.style.color = '#334155';
                });
                const active = document.querySelector('.pct-btn[data-pct="' + p + '"]');
                if (active && !active.disabled) { active.style.background = '#334155'; active.style.color = '#fff'; }
            };

            window.selectPctRemaining = (remainAmt, currency) => {
                const percentInput = document.getElementById('swal-percent');
                if (percentInput) percentInput.value = 'remaining';
                const amtDisplay = document.getElementById('swal-amt-display');
                const balDisplay = document.getElementById('swal-balance-display');
                if (amtDisplay) amtDisplay.textContent = currency + ' ' + remainAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                if (balDisplay) balDisplay.textContent = currency + ' 0';
                document.querySelectorAll('.pct-btn').forEach(b => {
                    if (b.disabled) return;
                    b.style.background = '#fff';
                    b.style.color = '#334155';
                    b.style.border = '1px solid #e2e8f0';
                });
                const active = document.querySelector('.pct-btn[data-pct="remaining"]');
                if (active) { active.style.background = '#23471d'; active.style.color = '#fff'; }
            };

            const historyListHTML = history.length > 0 ? `
                <div style="margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 10px">
                    <p style="font-size: 8px; font-weight: 900; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0">Payment History</p>
                    ${history.map((h, i) => `
                        <div style="display: flex; justify-content: space-between; font-size: 10px; padding: 3px 0;">
                            <span style="color: #94a3b8">#${i + 1} (${new Date(h.paidAt).toLocaleDateString()})</span>
                            <span style="font-weight: 800; color: #475569">${fmtAmt(h.amount)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : '';
            const fbBreakdownHTML = `
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:12px">
                    <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b;margin:0 0 8px 0;letter-spacing:0.08em">Financial Breakdown</p>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Taxable Value (Subtotal)</span>
                        <span style="font-size:11px;font-weight:700;color:#0f172a">${fmtAmt(fb.subtotal || 0)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Add: GST @ 18%</span>
                        <span style="font-size:11px;font-weight:700;color:#1d4ed8">+ ${fmtAmt(fb.gstAmount || 0)}</span>
                    </div>
                    ${fb.tdsAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#dc2626">Less: TDS @ ${fb.tdsPercent || 0}%</span>
                        <span style="font-size:11px;font-weight:700;color:#dc2626">- ${fmtAmt(fb.tdsAmount)}</span>
                    </div>` : ''}
                    <div style="display:flex;justify-content:space-between;padding:6px 0;margin-top:2px">
                        <span style="font-size:12px;font-weight:900;color:#0f172a">Total Net Payable</span>
                        <span style="font-size:13px;font-weight:900;color:#23471d">${fmtAmt(totalAmount)}</span>
                    </div>
                </div>
            `;

            const advanceHTML = `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                        <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#475569;margin:0">RECORD INSTALLMENT #${nextPaymentNo}</p>
                        <span style="background:#e2e8f0;color:#475569;font-size:8px;font-weight:900;padding:3px 10px;border-radius:100px">${nextPaymentNo}${nextPaymentNo === 1 ? 'ST' : nextPaymentNo === 2 ? 'ND' : nextPaymentNo === 3 ? 'RD' : 'TH'} PAYMENT</span>
                    </div>
                    ${fbBreakdownHTML}
                    ${alreadyPaid > 0 ? `
                        <div style="display:flex;justify-content:space-between;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:12px">
                            <div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#94a3b8;margin:0 0 2px 0">Already Paid</p>
                            <p style="font-size:14px;font-weight:900;color:#475569;margin:0">${fmtAmt(alreadyPaid)}</p></div>
                            <div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#94a3b8;margin:0 0 2px 0">Remaining</p>
                            <p style="font-size:14px;font-weight:900;color:#dc2626;margin:0">${fmtAmt(remainingAmount)}</p></div>
                        </div>
                    ` : ''}
                    ${historyListHTML}
                    <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b;margin:12px 0 6px 0">Select Installment Phase</p>
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;margin-bottom:12px;overflow-x:auto">${pctButtons}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                        <div style="background:white;padding:12px;border-radius:10px;border:1px solid #e2e8f0">
                            <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#94a3b8;margin:0 0 4px 0">Amount to Collect</p>
                            <p id="swal-amt-display" style="font-size:18px;font-weight:900;color:#23471d;margin:0">${allPhasesDone ? fmtAmt(remainingAmount) : fmtAmt(installmentBase * defaultSelectedPct / 100)}</p>
                        </div>
                        <div style="background:white;padding:12px;border-radius:10px;border:1px solid #e2e8f0">
                            <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#94a3b8;margin:0 0 4px 0">Balance After This</p>
                            <p id="swal-balance-display" style="font-size:18px;font-weight:900;color:#dc2626;margin:0">${allPhasesDone ? fmtAmt(0) : fmtAmt(installmentBase - (installmentBase * defaultSelectedPct / 100))}</p>
                        </div>
                    </div>
                    <input type="hidden" id="swal-percent" value="${allPhasesDone ? 'remaining' : defaultSelectedPct}">
                </div>
            `;
            const fullDiscountNote = isFirstPayment && fb.discountAmount > 0
                ? `<div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:10px 12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#854d0e;margin:0 0 2px 0">Full Payment Discount Applied</p>
                        <p style="font-size:12px;font-weight:700;color:#854d0e;margin:0">${fb.discountPercent}% discount = - ${fmtAmt(fb.discountAmount)}</p>
                    </div>
                    <span style="background:#f59e0b;color:white;font-size:9px;font-weight:900;padding:4px 12px;border-radius:100px">SAVINGS</span>
                  </div>`
                : '';

            const fullBreakdownHTML = `
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:12px">
                    <p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b;margin:0 0 8px 0;letter-spacing:0.08em">Financial Breakdown</p>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Gross Stall Cost</span>
                        <span style="font-size:11px;font-weight:700;color:#0f172a">${fmtAmt(fb.grossAmount || 0)}</span>
                    </div>
                    ${fb.stallDiscountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#16a34a">Less: Stall Discount (${fb.stallDiscountPercent || 0}%)</span>
                        <span style="font-size:11px;font-weight:700;color:#16a34a">- ${fmtAmt(fb.stallDiscountAmount)}</span>
                    </div>` : ''}
                    ${fb.discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#d97706">Less: Full Payment Discount (${fb.discountPercent || 0}%)</span>
                        <span style="font-size:11px;font-weight:700;color:#d97706">- ${fmtAmt(fb.discountAmount)}</span>
                    </div>` : ''}
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Taxable Value (Subtotal)</span>
                        <span style="font-size:11px;font-weight:700;color:#0f172a">${fmtAmt(fb.subtotal || 0)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#64748b">Add: GST @ 18%</span>
                        <span style="font-size:11px;font-weight:700;color:#1d4ed8">+ ${fmtAmt(fb.gstAmount || 0)}</span>
                    </div>
                    ${fb.tdsAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
                        <span style="font-size:11px;color:#dc2626">Less: TDS @ ${fb.tdsPercent || 0}%</span>
                        <span style="font-size:11px;font-weight:700;color:#dc2626">- ${fmtAmt(fb.tdsAmount)}</span>
                    </div>` : ''}
                    <div style="display:flex;justify-content:space-between;padding:6px 0;margin-top:2px">
                        <span style="font-size:12px;font-weight:900;color:#0f172a">Total Net Payable</span>
                        <span style="font-size:13px;font-weight:900;color:#23471d">${fmtAmt(totalAmount)}</span>
                    </div>
                </div>
            `;

            const fullHTML = `
                <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:14px;margin-bottom:16px">
                    ${fullDiscountNote}
                    ${fullBreakdownHTML}
                    ${alreadyPaid > 0 ? `
                        <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:10px 12px;margin-bottom:12px;display:flex;justify-content:space-between">
                            <div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#854d0e;margin:0 0 2px 0">Already Paid</p>
                            <p style="font-size:14px;font-weight:900;color:#854d0e;margin:0">${fmtAmt(alreadyPaid)}</p></div>
                            <div><p style="font-size:9px;font-weight:900;text-transform:uppercase;color:#166534;margin:0 0 2px 0">Contract Total</p>
                            <p style="font-size:14px;font-weight:900;color:#166534;margin:0">${fmtAmt(totalAmount)}</p></div>
                        </div>
                        ${historyListHTML}
                    ` : ''}
                    <div style="display:flex;justify-content:space-between;align-items:center;background:#dcfce7;border-radius:10px;padding:14px">
                        <div>
                            <p style="font-size:10px;font-weight:900;text-transform:uppercase;color:#166534;margin:0 0 4px 0">${alreadyPaid > 0 ? 'Balance to Collect (Remaining)' : 'Full Amount to be Collected'}</p>
                            <p style="font-size:24px;font-weight:900;color:#14532d;margin:0">${fmtAmt(collectAmount)}</p>
                        </div>
                        <span style="background:#22c55e;color:white;font-size:9px;font-weight:900;padding:6px 16px;border-radius:100px;text-transform:uppercase">${alreadyPaid > 0 ? 'BALANCE SETTLEMENT' : 'FULL SETTLEMENT'}</span>
                    </div>
                </div>
            `;

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
                title: isAdvance ? 'INSTALLMENT PAYMENT DETAILS' : 'FULL PAYMENT VERIFICATION',
                width: 680,
                html: '<div style="font-family:sans-serif;text-align:left;padding:4px 4px">'
                    + (isAdvance ? advanceHTML : fullHTML)
                    + commonFields + '</div>',
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: isAdvance ? '✓ CONFIRM INSTALLMENT' : '✓ CONFIRM FULL PAYMENT',
                confirmButtonColor: '#23471d',
                cancelButtonColor: '#94a3b8',
                didOpen: () => { document.body.style.overflow = 'hidden'; },
                willClose: () => { document.body.style.overflow = ''; },
                preConfirm: () => {
                    const method = document.getElementById('swal-method').value;
                    const txid = document.getElementById('swal-txid').value.trim();
                    const file = document.getElementById('swal-file').files[0];
                    const notes = document.getElementById('swal-notes').value;
                    const percentRaw = isAdvance ? document.getElementById('swal-percent').value : '100';
                    const isRemaining = percentRaw === 'remaining';
                    const percent = isRemaining ? 100 : parseFloat(percentRaw);

                    if (!txid) return Swal.showValidationMessage('Transaction / Reference ID is required');
                    if (!file) return Swal.showValidationMessage('Receipt file is required');
                    if (isAdvance && !isRemaining && (percent < 1 || percent > 99)) return Swal.showValidationMessage('Installment % must be between 1 and 99');

                    const thisInstallment = isAdvance
                        ? (isRemaining ? parseFloat(remainingAmount.toFixed(2)) : parseFloat((installmentBase * percent / 100).toFixed(2)))
                        : parseFloat(collectAmount.toFixed(2));
                    const newTotalPaid = parseFloat((alreadyPaid + thisInstallment).toFixed(2));
                    const balanceAmount = parseFloat(Math.max(0, totalAmount - newTotalPaid).toFixed(2));
                    return { method, txid, file, notes, percent, amountPaid: newTotalPaid, balanceAmount, thisInstallment };
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
                        const isFullyPaidNow = formValues.balanceAmount <= 1;
                        const finalStatus = isFullyPaidNow ? 'paid' : newStatus;

                        const updateData = {
                            status: finalStatus,
                            receiptUrl: uploadRes.data.url,
                            paymentId: formValues.txid,
                            amountPaid: formValues.amountPaid,
                            balanceAmount: formValues.balanceAmount,
                            paymentMode: 'manual',
                            paymentType: isAdvance ? 'installment' : 'full',
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
                                    message: `Exhibitor: Updated payment for '${regData.exhibitorName}' in ${regData.eventId?.name || 'N/A'} (Status: ${finalStatus}) by ${userName}`,
                                    section: "Book A Stand",
                                    data: {
                                        action: "UPDATE",
                                        booking_id: id,
                                        exhibitor: regData.exhibitorName,
                                        new_status: finalStatus,
                                        payment_details: updateData
                                    }
                                }));
                            }

                            Swal.fire({
                                icon: 'success',
                                title: isAdvance ? 'INSTALLMENT RECORDED' : 'PAYMENT VERIFIED',
                                html: isAdvance
                                    ? `<b>${cur} ${formValues.thisInstallment?.toLocaleString()}</b> received.<br/>Total paid: <b>${cur} ${formValues.amountPaid?.toLocaleString()}</b><br/>Balance pending: <b style="color:#dc2626">${cur} ${formValues.balanceAmount?.toLocaleString()}</b>`
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
                <div className="flex items-center gap-3 font-inter">
                    <div className="w-10 h-10 rounded-sm border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                        {row.companyLogoUrl ? (
                            <img
                                src={fixUrl(row.companyLogoUrl)}
                                alt={row.exhibitorName}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "https://placehold.co/100x100?text=LOGO"; }}
                            />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Building size={16} className="text-slate-300" />
                                <span className="text-[7px] text-slate-300 font-bold uppercase mt-0.5">No Logo</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-red-600 text-sm uppercase tracking-tight leading-none mb-1 truncate">{row.exhibitorName}</span>
                        <span className="text-[10px] text-black font-medium uppercase tracking-widest leading-none truncate">{row.natureOfBusiness}</span>
                        <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-medium text-black uppercase tracking-tighter border border-slate-200">Event: <span className="text-red-500 font-bold">{row.eventId?.name || 'N/A'}</span></span>
                        </div>
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
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-[2px] border ${row.paymentMode === 'online' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                            {row.paymentMode}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-black uppercase tracking-tight">Total: {row.participation?.currency === 'USD' ? '$' : '₹'} {row.participation?.total?.toLocaleString()}</span>
                    {(row.paymentPlanLabel) && (
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter mt-0.5">{row.paymentPlanLabel}</span>
                    )}
                    <div className="flex flex-col mt-1.5 space-y-0.5">
                        <span className="text-[10px] text-green-600 font-bold tracking-tight">Paid: {row.participation?.currency === 'USD' ? '$' : '₹'} {(row.amountPaid || 0).toLocaleString()}</span>
                        {(row.balanceAmount > 0) && (
                            <span className="text-[10px] text-red-500 font-bold tracking-tight">Balance: {row.participation?.currency === 'USD' ? '$' : '₹'} {row.balanceAmount.toLocaleString()}</span>
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
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 w-fit border ${row.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    row.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        row.status === 'advance-paid' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                            row.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                row.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                    row.status === 'payment-failed' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                                        'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                    {row.status === 'advance-paid' ? 'Installment Paid' : row.status}
                </div>
            )
        },
        {
            key: "actions",
            label: "ACTIONS",
            render: (row) => (
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => navigate(`/exhibitor-booking/${row._id}`)}
                        className="p-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-[2px] transition-all border border-gray-200"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    {row.status === 'advance-paid' && (
                        <button
                            onClick={() => handleStatusUpdate(row._id, 'advance-paid', row)}
                            title="Record Next Installment"
                            className="px-2 py-1 bg-cyan-600 text-white text-[9px] font-black uppercase rounded-[2px] border border-cyan-700 hover:bg-cyan-700 transition-all whitespace-nowrap"
                        >
                            + Installment
                        </button>
                    )}
                    <select
                        onChange={(e) => handleStatusUpdate(row._id, e.target.value, row)}
                        className="text-[10px] font-bold border-2 border-gray-200 rounded-[2px] px-2 py-1 outline-none bg-white focus:border-[#23471d]"
                        value={row.status}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid (Full)</option>
                        <option value="advance-paid">Installment Paid</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                        <option value="payment-failed">Payment Failed</option>
                    </select>
                </div>
            )
        }
    ];

    const filteredRegs = registrations.filter(r => {
        if (r.status === 'payment-failed') return false;

        const exhibitorName = (r.exhibitorName || '').toLowerCase();
        const stallNo = (r.participation?.stallFor || r.participation?.stallNo || '').toLowerCase();
        const eventName = (r.eventId?.name || '').toLowerCase();
        const searchTermLower = (searchTerm || '').toLowerCase();

        const matchesSearch =
            exhibitorName.includes(searchTermLower) ||
            stallNo.includes(searchTermLower) ||
            eventName.includes(searchTermLower);

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
                </div>

                <div className="bg-white border-2 border-gray-200 shadow-sm overflow-x-auto">
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
                        <table className="w-full text-sm" style={{minWidth: '900px'}}>
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
                            Showing <span className="text-red-600 font-black">{filteredRegs.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filteredRegs.length)}</span> of <span className="text-red-600 font-black">{filteredRegs.length}</span> registrations
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 px-3 border border-slate-200 bg-white text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all rounded-[2px]"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 text-[11px] font-black border transition-all rounded-[2px] ${currentPage === i + 1 ? 'bg-[#23471d] text-white border-[#23471d]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 px-3 border border-slate-200 bg-white text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all rounded-[2px]"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageRegistrations;
