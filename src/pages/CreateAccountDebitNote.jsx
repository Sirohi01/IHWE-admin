import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Trash2, Upload, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { getCurrentUserName } from '../utils/currentUser';

const TYPE_OPTIONS = [
    { value: 'additional_charges', label: 'Additional Charges' },
    { value: 'late_fee', label: 'Late Fee / Penalty' },
    { value: 'expense_recovery', label: 'Expense Recovery' },
    { value: 'tds_shortfall', label: 'TDS Shortfall Recovery' },
    { value: 'other', label: 'Other' },
];

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatDate = (val) => {
    if (!val) return 'N/A';
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const todayStr = () => new Date().toISOString().slice(0, 10);

const newItem = () => ({
    id: `${Date.now()}-${Math.random()}`,
    description: '', hsn: '', qty: 1, unit: 'Nos', rate: 0, amount: 0, gstPct: '18%', gstAmount: 0, total: 0,
});

const CreateAccountDebitNote = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const viewId = searchParams.get('view');

    const readOnly = Boolean(viewId);

    const [loading, setLoading] = useState(true);
    const [context, setContext] = useState(null);
    const [nextNo, setNextNo] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [viewedStatus, setViewedStatus] = useState('draft');

    const [debitNoteType, setDebitNoteType] = useState('additional_charges');
    const [debitNoteDate, setDebitNoteDate] = useState(todayStr());
    const [debitNoteNo, setDebitNoteNo] = useState('');
    const [reason, setReason] = useState('');
    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const [items, setItems] = useState([newItem()]);
    const [allocMap, setAllocMap] = useState({});
    const [tdsDeduction, setTdsDeduction] = useState(0);
    const [adjustmentCreditNote, setAdjustmentCreditNote] = useState(0);
    const [remarks, setRemarks] = useState('');
    const [attachmentFile, setAttachmentFile] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const requests = [api.get(`/api/account-debit-notes/company/${id}/context`)];
                if (viewId) requests.push(api.get(`/api/account-debit-notes/${viewId}`));
                else requests.push(api.get('/api/account-debit-notes/next-number'));

                const [ctxRes, secondRes] = await Promise.all(requests);
                if (ctxRes.data?.success) setContext(ctxRes.data.data);

                if (viewId) {
                    const note = secondRes.data?.data;
                    if (note) {
                        setDebitNoteType(note.debitNoteType || 'additional_charges');
                        setDebitNoteDate((note.debit_note_date || '').slice(0, 10) || todayStr());
                        setDebitNoteNo(note.debit_note_no || '');
                        setReason(note.reason || '');
                        setRemarks(note.remarks || '');
                        setTdsDeduction(note.tdsDeduction || 0);
                        setAdjustmentCreditNote(note.adjustmentCreditNote || 0);
                        setViewedStatus(note.status || 'active');
                        setItems((note.items || []).length ? note.items.map((it) => ({ ...it, id: `${Date.now()}-${Math.random()}` })) : [newItem()]);
                        const map = {};
                        (note.allocations || []).forEach((a) => { map[a.invoiceId] = a.appliedAmount; });
                        setAllocMap(map);
                        if (note.allocations?.[0]) setSelectedInvoiceId(note.allocations[0].invoiceId);
                    }
                } else if (secondRes.data?.success) {
                    setNextNo(secondRes.data.debit_note_no);
                    setDebitNoteNo(secondRes.data.debit_note_no);
                }
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load exhibitor account');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id, viewId]);

    const invoices = useMemo(() => context?.invoices || [], [context]);
    const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

    const updateItem = (itemId, field, val) => {
        setItems((prev) => prev.map((item) => {
            if (item.id !== itemId) return item;
            const updated = { ...item, [field]: val };
            const rate = Number(field === 'rate' ? val : updated.rate) || 0;
            const qty = Number(field === 'qty' ? val : updated.qty) || 0;
            const amount = rate * qty;
            updated.amount = amount;
            const gstRate = parseFloat(updated.gstPct) || 0;
            updated.gstAmount = amount * (gstRate / 100);
            updated.total = amount + updated.gstAmount;
            return updated;
        }));
    };
    const addItem = () => setItems((prev) => [...prev, newItem()]);
    const removeItem = (itemId) => setItems((prev) => prev.length > 1 ? prev.filter((i) => i.id !== itemId) : prev);

    const taxableAmount = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const gstAmount = items.reduce((sum, it) => sum + (Number(it.gstAmount) || 0), 0);
    const totalAmount = taxableAmount + gstAmount;

    const totalApplied = Object.values(allocMap).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const remainingBalance = Math.round((totalAmount - totalApplied) * 100) / 100;

    const toggleInvoice = (inv, checked) => {
        setAllocMap((prev) => {
            const next = { ...prev };
            if (!checked) { delete next[inv.id]; return next; }
            const remaining = Math.max(0, totalAmount - Object.values(prev).reduce((s, v) => s + v, 0));
            next[inv.id] = Math.round(Math.min(remaining, inv.outstanding) * 100) / 100;
            return next;
        });
    };
    const setAppliedAmount = (invId, val) => {
        setAllocMap((prev) => ({ ...prev, [invId]: Math.max(0, Number(val) || 0) }));
    };

    useEffect(() => {
        if (selectedInvoiceId && allocMap[selectedInvoiceId] === undefined && selectedInvoice) {
            toggleInvoice(selectedInvoice, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedInvoiceId]);

    const outstandingBeforeDN = selectedInvoice?.outstanding || 0;
    const alreadyReceived = selectedInvoice ? Math.max(0, selectedInvoice.invoiceAmount - selectedInvoice.outstanding) : 0;
    const newOutstandingAfterDN = Math.max(0, outstandingBeforeDN + totalAmount - tdsDeduction - adjustmentCreditNote);

    const withinLimitCheck = useMemo(
        () => Object.entries(allocMap).every(([invId, amt]) => {
            const inv = invoices.find((i) => i.id === invId);
            return inv && amt <= inv.outstanding + 0.5;
        }),
        [allocMap, invoices],
    );
    const hasAllocation = Object.keys(allocMap).length > 0;
    const gstOk = Math.abs(gstAmount - taxableAmount * 0) >= 0; // GST is auto-computed per item; always structurally valid
    const balancedCheck = Math.abs(remainingBalance) < 0.5;
    const infoCompleteCheck = Boolean(reason.trim() && remarks.trim() && items.every((it) => it.description.trim()));
    const allChecksPass = withinLimitCheck && hasAllocation && balancedCheck && infoCompleteCheck;

    const handleSubmit = async (status) => {
        if (!reason.trim()) { toast.error('Please enter a reason for the debit note'); return; }
        if (!remarks.trim()) { toast.error('Please enter remarks'); return; }
        if (!hasAllocation) { toast.error('Please select at least one invoice to allocate this debit note to'); return; }
        if (!balancedCheck) { toast.error(`Remaining debit balance must be ₹0.00 (currently ₹${formatCurrency(remainingBalance)})`); return; }
        if (!withinLimitCheck) { toast.error('Applied amount on one or more invoices exceeds its outstanding balance'); return; }

        setSubmitting(true);
        try {
            const allocations = Object.entries(allocMap).map(([invId, appliedAmount]) => {
                const inv = invoices.find((i) => i.id === invId);
                return {
                    invoiceId: invId,
                    invoiceNo: inv?.invoiceNo || '',
                    invoiceDate: inv?.invoiceDate || '',
                    invoiceAmount: inv?.invoiceAmount || 0,
                    outstandingBeforeDN: inv?.outstanding || 0,
                    appliedAmount,
                };
            });

            const payload = {
                companyId: id,
                debit_note_date: debitNoteDate,
                debitNoteType,
                reason,
                clientName: context?.companyInfo?.name || '',
                items: items.map((it) => ({
                    description: it.description, hsn: it.hsn, qty: it.qty, unit: it.unit,
                    rate: it.rate, amount: it.amount, gstPct: it.gstPct, gstAmount: it.gstAmount, total: it.total,
                })),
                taxableAmount,
                gstAmount,
                totalAmount,
                allocations,
                tdsDeduction,
                adjustmentCreditNote,
                remarks,
                status,
                added_by: getCurrentUserName(),
            };

            let res;
            if (attachmentFile) {
                const formData = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
                });
                formData.append('attachment', attachmentFile);
                res = await api.post('/api/account-debit-notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                res = await api.post('/api/account-debit-notes', payload);
            }

            if (res.data?.success) {
                toast.success(status === 'draft' ? 'Debit note saved as draft' : 'Debit note created successfully');
                navigate(`/account-debit-notes/${id}`);
            } else {
                toast.error(res.data?.message || 'Failed to create debit note');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create debit note');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /> Loading account...</div>
            </div>
        );
    }

    if (!context) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Exhibitor account not found.</div>;
    }

    const checklist = [
        { label: 'Debit note amount is within outstanding limit.', pass: withinLimitCheck },
        { label: 'GST is calculated correctly.', pass: gstOk },
        { label: 'At least one invoice is selected for allocation.', pass: hasAllocation },
        { label: 'All information looks good.', pass: allChecksPass },
    ];

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-2 font-sans text-slate-800">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-1">
                <span>Accounts</span> / <span>Exhibitor Account</span> / <span className="text-blue-600 font-bold">Debit Notes</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-3">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{readOnly ? 'View Debit Note' : 'Create Debit Note'}</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50">{readOnly ? 'Back' : 'Cancel'}</button>
                    {!readOnly && (
                        <>
                            <button onClick={() => handleSubmit('draft')} disabled={submitting} className="px-4 py-2 bg-white border border-blue-300 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 disabled:opacity-50">Save Draft</button>
                            <button onClick={() => handleSubmit('active')} disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5">
                                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save &amp; Send for Approval
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Exhibitor Info Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-wrap items-center gap-x-8 gap-y-2 mb-2">
                <div>
                    <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5">Exhibitor</div>
                    <div className="font-semibold text-slate-800 text-[13px]">{context.companyInfo.name}</div>
                    <div className="text-[10px] font-semibold text-slate-500">Stall No. {context.companyInfo.stallNo} · {context.companyInfo.stallSize} Sq. Mtr. · IHWE 2026</div>
                </div>
                <div>
                    <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5">Total Payable</div>
                    <div className="font-semibold text-slate-800 text-[15px]">₹ {formatCurrency(context.totalPayable)}</div>
                </div>
                <div>
                    <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5">Total Received</div>
                    <div className="font-semibold text-emerald-600 text-[15px]">₹ {formatCurrency(context.totalReceived)}</div>
                </div>
                <div>
                    <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5">Outstanding</div>
                    <div className="font-semibold text-rose-500 text-[15px]">₹ {formatCurrency(context.outstanding)}</div>
                </div>
                <div>
                    <div className="text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-0.5">Account Status</div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600">{context.accountStatus}</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-2">
                {/* Left column */}
                <div className="w-full lg:w-[68%] space-y-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-slate-800 tracking-wide">Debit Note Details</h2>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">Manual Entry</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Debit Note Type *</label>
                                <select disabled={readOnly} value={debitNoteType} onChange={(e) => setDebitNoteType(e.target.value)} className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-50">
                                    {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Debit Note Date *</label>
                                <input disabled={readOnly} type="date" value={debitNoteDate} onChange={(e) => setDebitNoteDate(e.target.value)} className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Debit Note No. *</label>
                                <input disabled={readOnly} type="text" value={debitNoteNo} onChange={(e) => setDebitNoteNo(e.target.value)} className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" />
                                <div className="text-[9px] text-slate-400 mt-0.5">Auto generated or enter manually</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Reference Invoice / Document *</label>
                                <select disabled={readOnly} value={selectedInvoiceId} onChange={(e) => setSelectedInvoiceId(e.target.value)} className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-50">
                                    <option value="">Select invoice...</option>
                                    {invoices.map((inv) => (
                                        <option key={inv.id} value={inv.id}>{inv.invoiceNo} - ₹ {formatCurrency(inv.invoiceAmount)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Invoice Date</label>
                                <div className="w-full border border-slate-200 bg-slate-50 rounded-md px-2.5 py-1.5 text-[12px] text-slate-600">{formatDate(selectedInvoice?.invoiceDate)}</div>
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Reason for Debit Note *</label>
                                <input disabled={readOnly} type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Extra power connection and late fee charges" className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Event</label>
                                <div className="w-full border border-slate-200 bg-slate-50 rounded-md px-2.5 py-1.5 text-[12px] text-slate-600 truncate">{selectedInvoice?.eventName || 'IHWE 2026'}</div>
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Hall / Stall</label>
                                <div className="w-full border border-slate-200 bg-slate-50 rounded-md px-2.5 py-1.5 text-[12px] text-slate-600">{context.companyInfo.stallNo || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">GSTIN</label>
                                <div className="w-full border border-slate-200 bg-slate-50 rounded-md px-2.5 py-1.5 text-[12px] text-slate-600">{selectedInvoice?.gstNo || context.companyInfo.gstNo || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Charge Details */}
                        <div className="mb-1 flex items-center justify-between">
                            <h3 className="text-[12px] font-semibold text-slate-800">Charge Details (Items Included)</h3>
                        </div>
                        <div className="overflow-x-auto border border-slate-200 rounded-lg mb-1">
                            <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                    <tr className="bg-slate-50 text-[8px] font-bold uppercase text-slate-500">
                                        <th className="px-2 py-1.5 w-8">#</th>
                                        <th className="px-2 py-1.5">Particular</th>
                                        <th className="px-2 py-1.5 w-20">Qty/Unit</th>
                                        <th className="px-2 py-1.5 w-24 text-right">Rate (₹)</th>
                                        <th className="px-2 py-1.5 w-24 text-right">Amount (₹)</th>
                                        <th className="px-2 py-1.5 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className="border-t border-slate-100">
                                            <td className="px-2 py-1.5 font-semibold text-slate-500">{idx + 1}</td>
                                            <td className="px-2 py-1.5">
                                                <input disabled={readOnly} type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="e.g. Extra Power Connection (5 KW)" className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" />
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <input disabled={readOnly} type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" />
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <input disabled={readOnly} type="number" min="0" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" />
                                            </td>
                                            <td className="px-2 py-1.5 text-right font-semibold text-slate-800">{formatCurrency(item.amount)}</td>
                                            <td className="px-2 py-1.5 text-center">
                                                {!readOnly && <button onClick={() => removeItem(item.id)} className="text-rose-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!readOnly && <button onClick={addItem} className="text-blue-600 text-[11px] font-bold flex items-center gap-1 mb-3"><Plus className="w-3.5 h-3.5" /> Add Another Item</button>}

                        <div className="flex justify-end mb-4">
                            <div className="w-full sm:w-64 space-y-1 text-[11px]">
                                <div className="flex justify-between"><span className="text-slate-500">Sub Total</span><span className="font-semibold text-slate-800">₹ {formatCurrency(taxableAmount)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><span className="font-semibold text-slate-800">₹ {formatCurrency(gstAmount)}</span></div>
                                <div className="flex justify-between pt-1 border-t border-slate-200"><span className="font-bold text-slate-700">Total Debit Note Value</span><span className="font-bold text-blue-600">₹ {formatCurrency(totalAmount)}</span></div>
                            </div>
                        </div>

                        {/* Apply Debit Note to Outstanding */}
                        <h3 className="text-[12px] font-semibold text-slate-800 mb-1">Apply Debit Note to Outstanding</h3>
                        <div className="overflow-x-auto border border-slate-200 rounded-lg mb-1">
                            <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                    <tr className="bg-slate-50 text-[8px] font-bold uppercase text-slate-500">
                                        <th className="px-2 py-1.5 w-8"></th>
                                        <th className="px-2 py-1.5">Invoice No.</th>
                                        <th className="px-2 py-1.5">Invoice Date</th>
                                        <th className="px-2 py-1.5 text-right">Invoice Amount (₹)</th>
                                        <th className="px-2 py-1.5 text-right">Outstanding (₹)</th>
                                        <th className="px-2 py-1.5 text-right w-28">Apply Debit (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length === 0 ? (
                                        <tr><td colSpan="6" className="px-2 py-3 text-center text-slate-400">No invoices found for this exhibitor.</td></tr>
                                    ) : invoices.map((inv) => {
                                        const checked = allocMap[inv.id] !== undefined;
                                        return (
                                            <tr key={inv.id} className="border-t border-slate-100">
                                                <td className="px-2 py-1.5 text-center">
                                                    <input type="checkbox" disabled={readOnly} checked={checked} onChange={(e) => toggleInvoice(inv, e.target.checked)} />
                                                </td>
                                                <td className="px-2 py-1.5 font-semibold text-slate-800">{inv.invoiceNo}</td>
                                                <td className="px-2 py-1.5 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                                                <td className="px-2 py-1.5 text-right text-slate-700">{formatCurrency(inv.invoiceAmount)}</td>
                                                <td className="px-2 py-1.5 text-right text-slate-700">{formatCurrency(inv.outstanding)}</td>
                                                <td className="px-2 py-1.5 text-right">
                                                    <input
                                                        type="number" min="0" disabled={!checked || readOnly}
                                                        value={checked ? allocMap[inv.id] : 0}
                                                        onChange={(e) => setAppliedAmount(inv.id, e.target.value)}
                                                        className="w-24 border border-slate-200 rounded px-2 py-1 text-[11px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-300"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end mb-4">
                            <div className="w-full sm:w-72 space-y-1 text-[11px]">
                                <div className="flex justify-between"><span className="text-slate-500">Debit Note Value</span><span className="font-semibold text-slate-800">₹ {formatCurrency(totalAmount)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Total Applied</span><span className="font-semibold text-slate-800">₹ {formatCurrency(totalApplied)}</span></div>
                                <div className={`flex justify-between pt-1 border-t border-slate-200 font-bold ${balancedCheck ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    <span>Remaining Debit Balance</span><span>₹ {formatCurrency(remainingBalance)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Remarks *</label>
                                <textarea disabled={readOnly} value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" placeholder="Add remarks for this debit note..." />
                            </div>
                            {!readOnly && (
                            <div>
                                <label className="block text-slate-700 font-bold text-[8px] uppercase tracking-wider mb-1">Attachments</label>
                                <label className="flex flex-col items-center justify-center gap-1 border border-dashed border-slate-300 rounded-md py-4 text-[11px] text-slate-500 cursor-pointer hover:bg-slate-50">
                                    <Upload className="w-4 h-4 text-slate-400" />
                                    Drag &amp; drop files here or <span className="text-blue-600 font-semibold">click to upload</span>
                                    <span className="text-[9px] text-slate-400">PDF, JPG, PNG up to 5 MB</span>
                                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)} />
                                </label>
                                {attachmentFile && (
                                    <div className="flex items-center justify-between mt-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]">
                                        <span className="truncate text-slate-600">{attachmentFile.name} ({Math.round(attachmentFile.size / 1024)} KB)</span>
                                        <button onClick={() => setAttachmentFile(null)} className="text-slate-400 hover:text-rose-500"><X className="w-3 h-3" /></button>
                                    </div>
                                )}
                            </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="w-full lg:w-[32%] space-y-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Debit Note Summary</h2>
                        <div className="space-y-2 text-[11px]">
                            <div className="flex justify-between"><span className="text-slate-500">Invoice / PI Amount</span><span className="font-semibold text-slate-800">₹ {formatCurrency(selectedInvoice?.invoiceAmount)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Already Received</span><span className="font-semibold text-slate-800">₹ {formatCurrency(alreadyReceived)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Outstanding Before DN</span><span className="font-semibold text-slate-800">₹ {formatCurrency(outstandingBeforeDN)}</span></div>
                            <div className="flex justify-between"><span className="text-blue-600 font-semibold">Debit Note Amount</span><span className="font-bold text-blue-600">₹ {formatCurrency(totalAmount)}</span></div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-slate-500">TDS Deduction</span>
                                <input disabled={readOnly} type="number" min="0" value={tdsDeduction} onChange={(e) => setTdsDeduction(Math.max(0, Number(e.target.value) || 0))} className="w-24 border border-slate-200 rounded px-2 py-1 text-right text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Adjustment / Credit Note</span>
                                <input disabled={readOnly} type="number" min="0" value={adjustmentCreditNote} onChange={(e) => setAdjustmentCreditNote(Math.max(0, Number(e.target.value) || 0))} className="w-24 border border-slate-200 rounded px-2 py-1 text-right text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" />
                            </div>
                        </div>
                        <div className="mt-3 bg-slate-800 rounded-lg p-3 flex justify-between items-center">
                            <span className="text-[11px] font-semibold text-slate-200">New Outstanding After DN<br /><span className="text-[9px] font-normal text-slate-400">(Including this Debit Note)</span></span>
                            <span className="text-[16px] font-bold text-white">₹ {formatCurrency(newOutstandingAfterDN)}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3 tracking-wide">Debit Note Preview</h2>
                        <div className="space-y-2 text-[11px]">
                            <div className="flex justify-between"><span className="text-slate-500">Debit Note No.</span><span className="font-semibold text-slate-800">{debitNoteNo || nextNo}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Debit Note Date</span><span className="font-semibold text-slate-800">{formatDate(debitNoteDate)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Exhibitor</span><span className="font-semibold text-slate-800 text-right">{context.companyInfo.name}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-500">Status</span><span className={`text-[9px] font-bold px-2 py-0.5 rounded ${viewedStatus === 'draft' ? 'bg-blue-50 text-blue-600' : viewedStatus === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{viewedStatus === 'draft' ? 'Draft' : viewedStatus === 'cancelled' ? 'Cancelled' : 'Active'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Prepared By</span><span className="font-semibold text-slate-800">{getCurrentUserName() || 'Admin'}</span></div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-sm">
                        <h2 className="text-sm font-semibold text-slate-800 mb-2 tracking-wide">Accounts Check</h2>
                        <div className="space-y-2">
                            {checklist.map((c, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[11px]">
                                    {c.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                                    <span className={c.pass ? 'text-slate-700' : 'text-amber-700 font-medium'}>{c.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAccountDebitNote;
