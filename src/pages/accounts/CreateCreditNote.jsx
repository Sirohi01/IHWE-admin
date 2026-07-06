import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, UploadCloud, Plus, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const CreateCreditNote = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [financials, setFinancials] = useState(null);

    // Form States
    const [creditNoteType, setCreditNoteType] = useState('Additional Charges');
    const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditNoteNo, setCreditNoteNo] = useState('Auto-generating...');
    const [referenceInvoice, setReferenceInvoice] = useState('');
    const [referenceInvoiceDate, setReferenceInvoiceDate] = useState('');
    const [reason, setReason] = useState('');
    const [event, setEvent] = useState('IHWE 2026 - 9th International Health & Wellness Expo 2026');
    const [hallStall, setHallStall] = useState('');
    const [gstin, setGstin] = useState('');
    const [remarks, setRemarks] = useState('');

    const [items, setItems] = useState([
        { id: 1, particular: '', qty: 1, rate: 0, amount: 0 }
    ]);

    const [invoices, setInvoices] = useState([]);
    const [allInvoicesForDropdown, setAllInvoicesForDropdown] = useState([]);

    useEffect(() => {
        if (!id) {
            toast.error("Exhibitor ID is missing!");
            navigate(-1);
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch account overview + all invoices in parallel
                const [overviewRes, allInvRes, cnCountRes] = await Promise.all([
                    api.get(`/api/account-overview/${id}`),
                    api.get('/api/invoices'),
                    api.get('/api/debitnotes').catch(() => ({ data: { data: [] } }))
                ]);

                // ── Company Info ──────────────────────────────────────
                if (overviewRes.data?.success) {
                    const info = overviewRes.data.data.companyInfo;
                    const fin = overviewRes.data.data.financials;

                    setCompanyInfo(info);
                    setFinancials(fin);

                    // Stall info — API returns stallNo & stallSize
                    const stallPart = info.stallNo ? `Stall No. ${info.stallNo}` : '';
                    const sizePart  = info.stallSize ? `${info.stallSize} Sq. Mtr.` : '';
                    setHallStall([stallPart, sizePart].filter(Boolean).join(' · ') || 'N/A');
                    setGstin(info.gst_no || info.gstin || '');
                }

                // ── Invoices for dropdown (filter by this company) ─────
                const allInvs = allInvRes.data?.data || allInvRes.data || [];
                const companyInvs = (Array.isArray(allInvs) ? allInvs : [])
                    .filter(inv => String(inv.companyId) === String(id))
                    .map(inv => ({
                        _id: inv._id,
                        invoice_no: inv.invoice_no,
                        invoice_date: inv.invoice_date || inv.added,
                        invoice_amount: inv.finalAmount || inv.total_amount || 0,
                        outstanding: inv.finalAmount || inv.total_amount || 0,
                        selected: false,
                        apply_credit: 0
                    }));
                setAllInvoicesForDropdown(companyInvs);
                setInvoices(companyInvs);

                // ── Auto-generate Credit Note number ─────────────────
                const existingDNs = cnCountRes.data?.data || cnCountRes.data || [];
                const count = Array.isArray(existingDNs) ? existingDNs.length + 1 : 1;
                const yr = new Date().getFullYear();
                const short = (yr % 100).toString().padStart(2, '0');
                const next = (yr + 1).toString().slice(-2);
                setCreditNoteNo(`DN-${yr}-${String(count).padStart(5, '0')}`);

            } catch (err) {
                console.error("Failed to fetch data", err);
                toast.error("Error loading exhibitor data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    // ── Derived values ─────────────────────────────────────────────────
    const subTotal = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const gstAmt   = subTotal * 0.18;
    const totalCreditNoteValue = subTotal + gstAmt;

    const totalApplied     = invoices.filter(inv => inv.selected).reduce((s, inv) => s + (parseFloat(inv.apply_credit) || 0), 0);
    const remainingBalance = totalCreditNoteValue - totalApplied;

    const outstandingBeforeDN = financials?.remainingBalance ?? 0;
    const totalPayable        = financials?.totalDue         ?? 0;
    const totalReceived       = financials?.paidAmount       ?? 0;
    const balanceAfterPosting = outstandingBeforeDN + totalCreditNoteValue;

    const fmt = (val) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

    // ── Item handlers ────────────────────────────────────────────────
    const handleAddItem = () => setItems([...items, { id: Date.now(), particular: '', qty: 1, rate: 0, amount: 0 }]);
    const handleRemoveItem = (itemId) => setItems(items.filter(i => i.id !== itemId));
    const handleItemChange = (itemId, field, value) => {
        setItems(items.map(item => {
            if (item.id !== itemId) return item;
            const updated = { ...item, [field]: value };
            if (field === 'qty' || field === 'rate') {
                updated.amount = (parseFloat(updated.qty) || 0) * (parseFloat(updated.rate) || 0);
            }
            return updated;
        }));
    };

    // ── Invoice toggle handlers ──────────────────────────────────────
    const handleInvoiceToggle = (invId) => {
        setInvoices(invoices.map(inv => {
            if (inv._id !== invId) return inv;
            const selected = !inv.selected;
            let apply_credit = 0;
            if (selected) {
                const alreadyApplied = invoices.filter(i => i.selected && i._id !== invId).reduce((s, i) => s + (parseFloat(i.apply_credit) || 0), 0);
                apply_credit = Math.max(0, Math.min(inv.outstanding, totalCreditNoteValue - alreadyApplied));
            }
            return { ...inv, selected, apply_credit };
        }));
    };

    const handleInvoiceCreditChange = (invId, value) => {
        setInvoices(invoices.map(inv => inv._id === invId ? { ...inv, apply_credit: parseFloat(value) || 0 } : inv));
    };

    // When reference invoice is selected from dropdown, update invoice date
    const handleReferenceInvoiceChange = (invoiceNo) => {
        setReferenceInvoice(invoiceNo);
        const found = allInvoicesForDropdown.find(inv => inv.invoice_no === invoiceNo);
        if (found) {
            setReferenceInvoiceDate(found.invoice_date ? new Date(found.invoice_date).toISOString().split('T')[0] : '');
        }
    };

    // ── Submit ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (remainingBalance < 0) { toast.error("Applied credit exceeds total value"); return; }

        const dataToSend = {
            companyId: id,
            credit_note_type: creditNoteType,
            credit_note_date: creditNoteDate,
            reference_invoice_no: referenceInvoice,
            est_no: referenceInvoice,
            invoice_date: referenceInvoiceDate,
            reason,
            event,
            hall_stall: hallStall,
            gstin,
            remarks,
            sub_total: subTotal,
            gst_reversal: gstAmt,
            total_value: totalCreditNoteValue,
            adjusted_amount: totalApplied,
            remaining_balance: remainingBalance,
            status: totalApplied >= totalCreditNoteValue ? 'Fully Adjusted' : totalApplied > 0 ? 'Partially Adjusted' : 'Draft',
            items: items.map(item => ({
                item: item.particular,
                quantity: item.qty,
                rate: item.rate,
                cn_amount: item.rate,
                cedit_note_remark: ''
            })),
            adjusted_invoices: invoices.filter(inv => inv.selected).map(inv => ({
                invoice_id: inv._id,
                invoice_no: inv.invoice_no,
                invoice_date: inv.invoice_date,
                invoice_amount: inv.invoice_amount,
                outstanding: inv.outstanding,
                applied_credit: inv.apply_credit
            })),
            added_by: 'Admin'
        };

        try {
            const res = await api.post('/api/creditnotes', dataToSend);
            if (res.data?.success || res.status === 201) {
                toast.success('Credit Note Created Successfully');
                navigate('/dashboard/account/credit-notes');
            }
        } catch (error) {
            toast.error('Failed to create credit note');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <div className="text-slate-500 text-sm font-semibold">Loading exhibitor data...</div>
                </div>
            </div>
        );
    }

    const inputCls = "w-full text-[13px] font-medium border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-colors";
    const readOnlyCls = "w-full text-[13px] font-medium border border-slate-200 rounded-lg px-3 py-2 outline-none bg-slate-50 text-slate-600";
    const labelCls = "block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide";

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-[1400px] mx-auto px-5 py-5">

                {/* ── Top Header ─────────────────────────────────── */}
                <div className="flex items-center justify-between mb-1">
                    <div className="text-[12px] text-slate-400 font-medium">
                        Accounts / Exhibitor Account / <span className="text-slate-600">Debit Notes</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white text-slate-700 border border-slate-200 font-bold rounded-lg hover:bg-slate-50 transition-colors text-[13px]">
                            Cancel
                        </button>
                        <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors text-[13px]">
                            Save Draft
                        </button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-[13px] flex items-center gap-1.5">
                            Save &amp; Send for Approval
                        </button>
                    </div>
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Create Debit Note</h1>

                {/* ── Company Summary Banner ──────────────────────── */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] mb-4 px-5 py-3.5 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Exhibitor</div>
                        <div className="text-[17px] font-black text-slate-900 leading-tight">{companyInfo?.name || '—'}</div>
                        <div className="text-[12px] font-semibold text-slate-500 mt-0.5">{hallStall} · IHWE 2026</div>
                    </div>
                    <div className="flex gap-8 text-right flex-wrap">
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Payable</div>
                            <div className="text-[17px] font-black text-slate-800">₹{fmt(totalPayable)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Received</div>
                            <div className="text-[17px] font-black text-emerald-600">₹{fmt(totalReceived)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Outstanding</div>
                            <div className="text-[17px] font-black text-rose-600">₹{fmt(outstandingBeforeDN)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Status</div>
                            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[11px] rounded-full inline-block mt-0.5">
                                {outstandingBeforeDN > 0 ? 'Part Paid' : 'Paid'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Main Grid ───────────────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">

                    {/* LEFT COLUMN */}
                    <div className="space-y-4 min-w-0">

                        {/* Debit Note Details */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-extrabold text-slate-800 text-base">Debit Note Details</h3>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded border border-emerald-100">Manual Entry</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls}>Debit Note Type <span className="text-red-500">*</span></label>
                                    <select value={creditNoteType} onChange={e => setCreditNoteType(e.target.value)} className={inputCls}>
                                        <option value="Additional Charges">Additional Charges</option>
                                        <option value="Stall Size Increase">Stall Size Increase</option>
                                        <option value="Late Payment Fee">Late Payment Fee</option>
                                        <option value="Service Charges">Service Charges</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Debit Note Date <span className="text-red-500">*</span></label>
                                    <input type="date" value={creditNoteDate} onChange={e => setCreditNoteDate(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Debit Note No. <span className="text-red-500">*</span></label>
                                    <input type="text" value={creditNoteNo} onChange={e => setCreditNoteNo(e.target.value)} className={inputCls} placeholder="Auto generated" />
                                    <div className="text-[10px] text-slate-400 mt-0.5">Auto generated or enter manually</div>
                                </div>

                                <div>
                                    <label className={labelCls}>Reference Invoice / Document <span className="text-red-500">*</span></label>
                                    <select
                                        value={referenceInvoice}
                                        onChange={e => handleReferenceInvoiceChange(e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="">Select Invoice</option>
                                        {allInvoicesForDropdown.map(inv => (
                                            <option key={inv._id} value={inv.invoice_no}>
                                                {inv.invoice_no} — ₹{fmt(inv.invoice_amount)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Invoice Date</label>
                                    <input type="date" value={referenceInvoiceDate} onChange={e => setReferenceInvoiceDate(e.target.value)} className={readOnlyCls} readOnly />
                                </div>
                                <div>
                                    <label className={labelCls}>Reason for Debit Note <span className="text-red-500">*</span></label>
                                    <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Extra power connection" className={inputCls} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelCls}>Event</label>
                                    <input type="text" value={event} onChange={e => setEvent(e.target.value)} className={readOnlyCls} readOnly />
                                </div>
                                <div>
                                    <label className={labelCls}>Hall / Stall</label>
                                    <input type="text" value={hallStall} onChange={e => setHallStall(e.target.value)} className={readOnlyCls} readOnly />
                                </div>
                                <div>
                                    <label className={labelCls}>GSTIN</label>
                                    <input type="text" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="09ABCDE1234F1Z5" className={inputCls} />
                                </div>
                            </div>
                        </div>

                        {/* Charge Details */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <h3 className="font-extrabold text-slate-800 text-base mb-4">
                                Charge Details <span className="text-slate-500 font-semibold text-[13px]">(Items Included)</span>
                            </h3>

                            <div className="overflow-x-auto -mx-5">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-y border-slate-100">
                                            <th className="py-2.5 px-5 text-[10px] font-extrabold text-slate-500 w-10">#</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500">Particular</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-24">Qty / Unit</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-28">Rate (₹)</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-28">Amount (₹)</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-12 text-center">Del</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="py-2 px-5 text-xs font-bold text-slate-400">{index + 1}</td>
                                                <td className="py-2 px-3">
                                                    <input type="text" value={item.particular} onChange={e => handleItemChange(item.id, 'particular', e.target.value)} placeholder="Item description" className="w-full text-[13px] font-medium border border-slate-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none" />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input type="number" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', e.target.value)} className="w-full text-[13px] font-medium border border-slate-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none" min="1" />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} className="w-full text-[13px] font-medium border border-slate-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none" min="0" />
                                                </td>
                                                <td className="py-2 px-3 text-[13px] font-bold text-slate-700 bg-slate-50/50">
                                                    {fmt(item.amount)}
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-rose-400 hover:text-rose-600 transition-colors p-1 disabled:opacity-30" disabled={items.length === 1}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between items-start mt-4">
                                <button type="button" onClick={handleAddItem} className="flex items-center gap-1.5 text-blue-600 font-bold text-[12px] hover:text-blue-800 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add Another Item
                                </button>
                                <div className="w-60 text-right space-y-1">
                                    <div className="flex justify-between text-[12px]">
                                        <span className="text-slate-500 font-semibold">Sub Total</span>
                                        <span className="font-bold text-slate-800">₹{fmt(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-[12px]">
                                        <span className="text-slate-500 font-semibold">GST (18%)</span>
                                        <span className="font-bold text-slate-800">₹{fmt(gstAmt)}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px] border-t border-slate-200 pt-2 mt-1">
                                        <span className="font-bold text-blue-600">Total Debit Note Value</span>
                                        <span className="font-black text-blue-600">₹{fmt(totalCreditNoteValue)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Apply to Outstanding Invoices */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-extrabold text-slate-800 text-base">Apply Debit Note to Outstanding</h3>
                                <span className="text-[11px] font-semibold text-slate-400">Auto allocation can be edited</span>
                            </div>

                            <div className="overflow-x-auto -mx-5">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-y border-slate-100">
                                            <th className="py-2.5 px-5 w-8"></th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600">Invoice No.</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600">Invoice Date</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600 text-right">Invoice Amount (₹)</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600 text-right">Outstanding (₹)</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600 text-center w-32">Apply Debit (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {invoices.length === 0 && (
                                            <tr><td colSpan="6" className="py-6 text-center text-[13px] text-slate-400 font-medium">No invoices found for this exhibitor.</td></tr>
                                        )}
                                        {invoices.map(inv => (
                                            <tr key={inv._id} className={inv.selected ? 'bg-blue-50/40' : ''}>
                                                <td className="py-2.5 px-5">
                                                    <input type="checkbox" checked={inv.selected} onChange={() => handleInvoiceToggle(inv._id)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                                </td>
                                                <td className="py-2.5 px-3 text-[13px] font-bold text-slate-800">{inv.invoice_no}</td>
                                                <td className="py-2.5 px-3 text-[12px] text-slate-500">{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-GB') : '—'}</td>
                                                <td className="py-2.5 px-3 text-[13px] font-bold text-slate-800 text-right">₹{fmt(inv.invoice_amount)}</td>
                                                <td className="py-2.5 px-3 text-[13px] font-bold text-rose-600 text-right">₹{fmt(inv.outstanding)}</td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <input
                                                        type="number"
                                                        disabled={!inv.selected}
                                                        value={inv.apply_credit}
                                                        onChange={e => handleInvoiceCreditChange(inv._id, e.target.value)}
                                                        className="w-full text-[13px] font-bold border border-slate-200 rounded px-2 py-1.5 text-right outline-none focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-300"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end mt-4">
                                <div className="w-72 bg-emerald-50/60 border border-emerald-100 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-[12px]">
                                        <span className="font-semibold text-slate-600">Debit Note Value</span>
                                        <span className="font-bold text-slate-800">₹{fmt(totalCreditNoteValue)}</span>
                                    </div>
                                    <div className="flex justify-between text-[12px]">
                                        <span className="font-semibold text-slate-600">Total Applied</span>
                                        <span className="font-bold text-slate-800">₹{fmt(totalApplied)}</span>
                                    </div>
                                    <div className={`flex justify-between text-[13px] border-t pt-2 ${remainingBalance === 0 ? 'border-emerald-200' : 'border-orange-200'}`}>
                                        <span className={`font-bold ${remainingBalance === 0 ? 'text-emerald-600' : 'text-orange-500'}`}>Remaining Debit Balance</span>
                                        <span className={`font-black ${remainingBalance === 0 ? 'text-emerald-600' : 'text-orange-500'}`}>₹{fmt(remainingBalance)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remarks & Attachments */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Remarks <span className="text-red-500">*</span></label>
                                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className={`${inputCls} h-28 resize-none`} placeholder="Add any notes here..."></textarea>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{remarks.length} / 500</div>
                                </div>
                                <div>
                                    <label className={labelCls}>Attachments</label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg h-28 flex flex-col items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer">
                                        <UploadCloud className="w-6 h-6 mb-1.5" />
                                        <span className="text-[11px] font-bold">Drag &amp; drop files here or <span className="text-blue-500 hover:underline">click to upload</span></span>
                                        <span className="text-[10px] mt-0.5">PDF, JPG, PNG up to 5 MB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-4">

                        {/* Summary Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <h3 className="font-extrabold text-slate-800 text-base mb-4">Debit Note Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] font-semibold text-slate-500">Invoice / PI Amount</span>
                                    <span className="text-[13px] font-bold text-slate-800">₹{fmt(totalPayable)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] font-semibold text-slate-500">Already Received</span>
                                    <span className="text-[13px] font-bold text-slate-800">₹{fmt(totalReceived)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] font-semibold text-slate-500">Outstanding Before DN</span>
                                    <span className="text-[13px] font-bold text-slate-800">₹{fmt(outstandingBeforeDN)}</span>
                                </div>
                                <div className="flex justify-between items-center text-blue-600 border-t border-slate-100 pt-3">
                                    <span className="text-[12px] font-bold">Debit Note Amount</span>
                                    <span className="text-[14px] font-black">₹{fmt(totalCreditNoteValue)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] font-semibold text-slate-500">TDS Deduction</span>
                                    <span className="text-[13px] font-bold text-slate-800">₹0.00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] font-semibold text-slate-500">Adjustment / Credit Note</span>
                                    <span className="text-[13px] font-bold text-slate-800">₹0.00</span>
                                </div>

                                <div className="bg-[#0f172a] rounded-xl p-4 mt-2 text-white">
                                    <div className="text-[10px] font-bold text-slate-400 mb-0.5">New Outstanding After DN</div>
                                    <div className="text-[22px] font-black">₹{fmt(balanceAfterPosting)}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">(Including this Debit Note)</div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <h3 className="font-extrabold text-slate-800 text-base mb-4">Debit Note Preview</h3>
                            <div className="space-y-2.5">
                                {[
                                    ['Debit Note No.', creditNoteNo],
                                    ['Debit Note Date', creditNoteDate ? new Date(creditNoteDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
                                    ['Exhibitor', companyInfo?.name || '—'],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between text-[12px] border-b border-slate-50 pb-2">
                                        <span className="font-semibold text-slate-500">{label}</span>
                                        <span className="font-bold text-slate-800 text-right max-w-[150px] break-words">{value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center text-[12px] border-b border-slate-50 pb-2">
                                    <span className="font-semibold text-slate-500">Status</span>
                                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 font-bold rounded-full text-[10px]">Draft</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="font-semibold text-slate-500">Prepared By</span>
                                    <span className="font-bold text-slate-800">Admin</span>
                                </div>
                            </div>
                        </div>

                        {/* Accounts Check */}
                        <div className="bg-amber-50 rounded-xl border border-amber-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
                            <h3 className="font-extrabold text-amber-900 text-[13px] mb-3">Accounts Check:</h3>
                            <div className="space-y-2.5">
                                {[
                                    'Debit note amount is within outstanding limit.',
                                    'GST is calculated correctly.',
                                    invoices.some(i => i.selected) ? 'At least one invoice is selected for allocation.' : null,
                                    'All information looks good.',
                                ].filter(Boolean).map((text, i) => (
                                    <div key={i} className="flex gap-2 items-start">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-[12px] font-semibold text-slate-700 leading-snug">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCreditNote;
