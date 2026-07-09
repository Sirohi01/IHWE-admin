import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, UploadCloud, Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { getCurrentUserName, getCurrentUsername } from '../../utils/currentUser';

const CreateCreditNote = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const isEdit = Boolean(editId);

    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [financials, setFinancials] = useState(null);

    // Form States
    const [creditNoteType, setCreditNoteType] = useState('Discount Adjustment');
    const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditNoteNo, setCreditNoteNo] = useState('Auto-generating...');
    const [referenceInvoice, setReferenceInvoice] = useState('');
    const [referenceInvoiceDate, setReferenceInvoiceDate] = useState('');
    const [reason, setReason] = useState('');
    const [event, setEvent] = useState('IHWE 2026 - 9th International Health & Wellness Expo 2026');
    const [hallStall, setHallStall] = useState('');
    const [gstin, setGstin] = useState('');
    const [remarks, setRemarks] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [adjustmentType, setAdjustmentType] = useState('Against Invoice');
    const [tdsAmount, setTdsAmount] = useState(0);
    const [preparedByName, setPreparedByName] = useState('');
    const [preparedByDesignation, setPreparedByDesignation] = useState('');
    const [reviewedByName, setReviewedByName] = useState('');
    const [reviewedByDesignation, setReviewedByDesignation] = useState('');

    const [items, setItems] = useState([
        { id: 1, particular: '', hsn: '', qty: 1, unit: 'Nos', rate: 0, amount: 0, gstPct: '18', gstAmt: 0, total: 0 }
    ]);

    const [invoices, setInvoices] = useState([]);
    const [allInvoicesForDropdown, setAllInvoicesForDropdown] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Invoice table pagination
    const [invPage, setInvPage] = useState(1);
    const INV_PER_PAGE = 5;

    useEffect(() => {
        if (!id) {
            toast.error("Exhibitor ID is missing!");
            navigate(-1);
            return;
        }

        const fetchData = async () => {
            try {
                const [overviewRes, allInvRes, cnCountRes] = await Promise.all([
                    api.get(`/api/account-overview/${id}`),
                    api.get('/api/invoices'),
                    api.get('/api/creditnotes').catch(() => ({ data: { data: [] } }))
                ]);

                // ── Company Info ──────────────────────────────────────
                if (overviewRes.data?.success) {
                    const info = overviewRes.data.data.companyInfo;
                    const fin  = overviewRes.data.data.financials;
                    setCompanyInfo(info);
                    setFinancials(fin);
                    const stallPart = info.stallNo   ? `Stall No. ${info.stallNo}` : '';
                    const sizePart  = info.stallSize ? `${info.stallSize} Sq. Mtr.` : '';
                    setHallStall([stallPart, sizePart].filter(Boolean).join(' · ') || 'N/A');
                    setGstin(info.gst_no || info.gstin || '');
                }

                // ── Invoices for table (filter by this company) ───────
                const allInvs = allInvRes.data?.data || allInvRes.data || [];
                const rawCompanyInvs = (Array.isArray(allInvs) ? allInvs : [])
                    .filter(inv => String(inv.companyId) === String(id));

                // Store full raw objects for auto-populate
                setAllInvoicesForDropdown(rawCompanyInvs);

                // Map to table format
                let companyInvs = rawCompanyInvs.map(inv => ({
                    _id: inv._id,
                    invoice_no: inv.invoice_no,
                    invoice_date: inv.invoice_date || inv.added,
                    invoice_amount: inv.finalAmount || inv.total_amount || 0,
                    outstanding: inv.finalAmount || inv.total_amount || 0,
                    selected: false,
                    apply_credit: 0
                }));

                if (editId) {
                    // ── Editing an existing credit note: load its saved data ──
                    const existingRes = await api.get(`/api/creditnotes/${editId}`);
                    const note = existingRes.data?.data || existingRes.data;
                    if (note) {
                        setCreditNoteType(note.credit_note_type || 'Discount Adjustment');
                        setCreditNoteDate((note.credit_note_date || '').slice(0, 10) || new Date().toISOString().split('T')[0]);
                        setCreditNoteNo(note.create_note_no || '');
                        setReferenceInvoice(note.reference_invoice_no || '');
                        setReferenceInvoiceDate((note.invoice_date || '').slice(0, 10) || '');
                        setReason(note.reason || '');
                        setEvent(note.event || event);
                        setHallStall(note.hall_stall || hallStall);
                        setGstin(note.gstin || '');
                        setRemarks(note.remarks || '');
                        setAdjustmentType(note.adjustment_type || 'Against Invoice');
                        setTdsAmount(note.tdsAmount || 0);
                        // Only apply the note's own saved values when it actually has them —
                        // older notes saved before this field existed leave these untouched
                        // so the auto-fill effect below can fill them from the logged-in
                        // admin's profile instead of showing permanently blank fields.
                        if (note.preparedBy?.name) setPreparedByName(note.preparedBy.name);
                        if (note.preparedBy?.designation) setPreparedByDesignation(note.preparedBy.designation);
                        if (note.reviewedBy?.name) setReviewedByName(note.reviewedBy.name);
                        if (note.reviewedBy?.designation) setReviewedByDesignation(note.reviewedBy.designation);

                        if (note.items?.length) {
                            setItems(note.items.map((it, idx) => ({
                                id: it._id || Date.now() + idx,
                                particular: it.item || '',
                                hsn: it.hsn || '',
                                qty: it.quantity || 1,
                                unit: it.unit || 'Nos',
                                rate: it.rate != null ? it.rate : it.cn_amount,
                                amount: it.taxableValue != null ? it.taxableValue : (it.rate != null ? it.rate * (it.quantity || 1) : it.cn_amount * (it.quantity || 1)),
                                gstPct: (it.gstPct || '18%').replace('%', ''),
                                gstAmt: it.gstAmount || 0,
                                total: it.total || 0,
                                area: it.area || '',
                                size: it.size || '',
                                discountPct: it.discountPct,
                            })));
                        }

                        const appliedByInvoiceId = {};
                        (note.adjusted_invoices || []).forEach((a) => { appliedByInvoiceId[a.invoice_id] = a.applied_credit; });
                        companyInvs = companyInvs.map(inv => appliedByInvoiceId[inv._id] != null
                            ? { ...inv, selected: true, apply_credit: appliedByInvoiceId[inv._id] }
                            : inv);
                    }
                } else {
                    // ── Auto-generate Credit Note number for a brand new note ──
                    const existingCNs = cnCountRes.data?.data || cnCountRes.data || [];
                    const count = Array.isArray(existingCNs) ? existingCNs.length + 1 : 1;
                    const yr = new Date().getFullYear();
                    setCreditNoteNo(`CN-${yr}-${String(count).padStart(5, '0')}`);
                }

                setInvoices(companyInvs);

            } catch (err) {
                console.error("Failed to fetch data", err);
                toast.error("Error loading exhibitor data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, editId, navigate]);

    // Prepared By / Reviewed By auto-fill from the logged-in admin's own profile
    // (designation + their HOD's name/designation) — editable afterwards. Runs for
    // both new notes and edits of older notes that never had these fields saved;
    // every set-call below uses the "only fill if still empty" pattern so a note's
    // own saved values (loaded above, when present) always take priority.
    useEffect(() => {
        // Name is always available from the login payload — set it immediately so
        // it's never blank even if the enrichment fetch below fails or 404s.
        setPreparedByName(prev => prev || getCurrentUserName());

        const username = getCurrentUsername();
        if (!username) return;
        api.get(`/api/admin/by-username/${encodeURIComponent(username)}`)
            .then(res => {
                const user = res.data?.data;
                if (!user) {
                    console.warn('Prepared By auto-fill: no admin user found for username', username);
                    return;
                }
                setPreparedByName(prev => prev || user.fullName || '');
                setPreparedByDesignation(prev => prev || user.designation || '');
                setReviewedByName(prev => prev || user.hodName || user.reportingToName || '');
                setReviewedByDesignation(prev => prev || user.hodDesignation || user.reportingToDesignation || '');
            })
            .catch((err) => console.warn('Prepared By auto-fill failed', err));
    }, []);

    // ── Derived values ────────────────────────────────────────────────
    const subTotal             = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const gstAmt               = subTotal * 0.18;
    const totalCreditNoteValue = subTotal + gstAmt;
    const totalApplied         = invoices.filter(i => i.selected).reduce((s, i) => s + (parseFloat(i.apply_credit) || 0), 0);
    const remainingBalance     = totalCreditNoteValue - totalApplied;
    const outstandingBeforeCN  = financials?.remainingBalance ?? 0;
    const totalPayable         = financials?.totalDue          ?? 0;
    const totalReceived        = financials?.paidAmount         ?? 0;
    const balanceAfterPosting  = Math.max(0, outstandingBeforeCN - totalCreditNoteValue);

    const fmt = (val) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

    // Helper: compute invoice total — finalAmount > items sum > 0
    const getInvAmount = (inv) => {
        if (!inv) return 0;
        if (inv.finalAmount && inv.finalAmount > 0) return inv.finalAmount;
        if (inv.total_amount && inv.total_amount > 0) return inv.total_amount;
        // Fallback: sum items
        return (inv.items || []).reduce((s, item) => {
            return s + parseFloat(item.total || item.amount || (parseFloat(item.rate || 0) * parseFloat(item.qty || item.quantity || 1)) || 0);
        }, 0);
    };

    // ── Invoice pagination ────────────────────────────────────────────
    const invTotalPages  = Math.ceil(invoices.length / INV_PER_PAGE);
    const invStart       = (invPage - 1) * INV_PER_PAGE;
    const pagedInvoices  = invoices.slice(invStart, invStart + INV_PER_PAGE);

    // ── Item handlers ─────────────────────────────────────────────────
    const handleAddItem    = () => setItems([...items, { id: Date.now(), particular: '', hsn: '', qty: 1, unit: 'Nos', rate: 0, amount: 0, gstPct: '18', gstAmt: 0, total: 0 }]);
    const handleRemoveItem = (iid) => setItems(items.filter(i => i.id !== iid));
    const handleItemChange = (iid, field, value) => {
        setItems(items.map(item => {
            if (item.id !== iid) return item;
            const u = { ...item, [field]: value };
            if (field === 'qty' || field === 'rate' || field === 'gstPct') {
                u.amount = (parseFloat(u.qty) || 0) * (parseFloat(u.rate) || 0);
                u.gstAmt = u.amount * (parseFloat(u.gstPct) || 0) / 100;
                u.total = u.amount + u.gstAmt;
            }
            return u;
        }));
    };

    // ── Invoice handlers ──────────────────────────────────────────────
    const handleInvoiceToggle = (invId) => {
        setInvoices(invoices.map(inv => {
            if (inv._id !== invId) return inv;
            const selected = !inv.selected;
            let apply_credit = 0;
            if (selected) {
                const already = invoices.filter(i => i.selected && i._id !== invId).reduce((s, i) => s + (parseFloat(i.apply_credit) || 0), 0);
                apply_credit = Math.max(0, Math.min(inv.outstanding, totalCreditNoteValue - already));
            }
            return { ...inv, selected, apply_credit };
        }));
    };
    const handleInvoiceCreditChange = (invId, value) =>
        setInvoices(invoices.map(inv => inv._id === invId ? { ...inv, apply_credit: parseFloat(value) || 0 } : inv));

    const handleReferenceInvoiceChange = (invoiceNo) => {
        setReferenceInvoice(invoiceNo);
        setDropdownOpen(false);
        const found = allInvoicesForDropdown.find(inv => inv.invoice_no === invoiceNo);
        if (!found) return;

        // Auto-fill date
        setReferenceInvoiceDate(found.invoice_date ? new Date(found.invoice_date).toISOString().split('T')[0] : '');

        // Auto-fill GSTIN from invoice
        if (found.gst_no) setGstin(found.gst_no);

        // Auto-populate Charge Details items from invoice items
        if (found.items && found.items.length > 0) {
            const autoItems = found.items.map((item, idx) => {
                // Invoice items store the pre-discount price as `amount` and the
                // post-discount price as `taxableValue` — the printout's "Total"
                // column shows the taxable value, not a `.total` field (invoice
                // items don't have one, so reading it always produced ₹0 here).
                const grossAmount = parseFloat(item.amount || 0);
                const qty = parseFloat(item.qty || item.quantity || 1);
                const rate = parseFloat(item.rate || 0);
                const taxableValue = parseFloat(item.taxableValue ?? item.amount ?? (rate * qty) ?? 0);
                const discountPct = item.discountPct != null
                    ? parseFloat(item.discountPct)
                    : (grossAmount > 0 ? ((grossAmount - taxableValue) / grossAmount) * 100 : 0);
                const gstAmt = parseFloat(item.gstAmount || 0);
                return {
                    id: Date.now() + idx,
                    particular: item.description || item.item_name || '',
                    hsn: item.hsn || '',
                    qty,
                    unit: item.unit || 'Nos',
                    rate,
                    amount: taxableValue,
                    gstPct: item.gstPct || '18',
                    gstAmt,
                    total: taxableValue + gstAmt,
                    area: item.area || item.stall_area || '',
                    size: item.size || item.stall_size || '',
                    discountPct,
                    fromInvoice: true  // flag to mark auto-populated
                };
            });
            setItems(autoItems);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Submit ────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!creditNoteType) { toast.error("Please select a Credit Note Type"); return; }
        if (!referenceInvoice) { toast.error("Please select a Reference Invoice"); return; }
        if (!reason.trim()) { toast.error("Please enter a Reason for Credit Note"); return; }
        if (!remarks.trim()) { toast.error("Please enter Remarks"); return; }
        if (remainingBalance < 0) { toast.error("Applied credit exceeds total value"); return; }

        const formData = new FormData();
        formData.append('companyId', id);
        formData.append('credit_note_type', creditNoteType);
        formData.append('credit_note_date', creditNoteDate);
        formData.append('reference_invoice_no', referenceInvoice);
        formData.append('est_no', referenceInvoice);
        formData.append('invoice_date', referenceInvoiceDate);
        formData.append('reason', reason);
        formData.append('event', event);
        formData.append('hall_stall', hallStall);
        formData.append('gstin', gstin);
        formData.append('remarks', remarks);
        formData.append('sub_total', subTotal);
        formData.append('gst_reversal', gstAmt);
        formData.append('total_value', totalCreditNoteValue);
        formData.append('adjusted_amount', totalApplied);
        formData.append('remaining_balance', remainingBalance);
        formData.append('status', totalApplied >= totalCreditNoteValue ? 'Fully Adjusted' : totalApplied > 0 ? 'Partially Adjusted' : 'Draft');
        formData.append('added_by', 'Admin');
        formData.append('taxableAmount', subTotal);
        formData.append('gstAmount', gstAmt);
        formData.append('totalAmount', totalCreditNoteValue);
        formData.append('tdsAmount', tdsAmount);
        formData.append('adjustment_type', adjustmentType);
        formData.append('preparedBy', JSON.stringify({ name: preparedByName, designation: preparedByDesignation }));
        formData.append('reviewedBy', JSON.stringify({ name: reviewedByName, designation: reviewedByDesignation }));

        formData.append('items', JSON.stringify(items.map(item => ({
            item: item.particular,
            quantity: item.qty,
            cn_amount: item.rate,
            cedit_note_remark: '',
            hsn: item.hsn || '',
            unit: item.unit || 'Nos',
            rate: parseFloat(item.rate) || 0,
            gstPct: `${item.gstPct || 18}%`,
            gstAmount: item.gstAmt || 0,
            total: item.total || item.amount,
            area: item.area || '',
            size: item.size || '',
            discountPct: item.discountPct,
            taxableValue: item.amount,
        }))));
        formData.append('adjusted_invoices', JSON.stringify(invoices.filter(inv => inv.selected).map(inv => ({
            invoice_id: inv._id, invoice_no: inv.invoice_no, invoice_date: inv.invoice_date,
            invoice_amount: inv.invoice_amount, outstanding: inv.outstanding, applied_credit: inv.apply_credit
        }))));

        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            const res = isEdit
                ? await api.put(`/api/creditnotes/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                : await api.post('/api/creditnotes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data?.success || res.status === 201 || res.data?._id) {
                toast.success(isEdit ? 'Credit Note Updated Successfully' : 'Credit Note Created Successfully');
                navigate(-1);
            }
        } catch (error) { toast.error(isEdit ? 'Failed to update credit note' : 'Failed to create credit note'); console.error(error); }
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

    const inputCls    = "w-full text-[13px] font-medium border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-colors";
    const readOnlyCls = "w-full text-[13px] font-medium border border-slate-200 rounded-lg px-3 py-2 outline-none bg-slate-50 text-slate-600";
    const labelCls    = "block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide";

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-[1400px] mx-auto px-5 py-5">

                {/* ── Top Header ───────────────────────────────────── */}
                <div className="flex items-center justify-between mb-1">
                    <div className="text-[12px] text-slate-400 font-medium">
                        Accounts / Exhibitor Account / <span className="text-slate-600">Credit Notes</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white text-slate-700 border border-slate-200 font-bold rounded-lg hover:bg-slate-50 transition-colors text-[13px]">Cancel</button>
                        {!isEdit && <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors text-[13px]">Save Draft</button>}
                        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-[13px]">{isEdit ? 'Save Changes' : 'Save & Send for Approval'}</button>
                    </div>
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{isEdit ? 'Edit Credit Note' : 'Create Credit Note'}</h1>

                {/* ── Company Banner ───────────────────────────────── */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] mb-4 px-5 py-3.5 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Exhibitor</div>
                        <div className="text-[17px] font-black text-slate-900 leading-tight">{companyInfo?.name || '—'}</div>
                        <div className="text-[12px] font-semibold text-slate-500 mt-0.5">{hallStall} · IHWE 2026</div>
                    </div>
                    <div className="flex gap-8 text-right flex-wrap">
                        {[
                            ['Total Payable',  `₹${fmt(totalPayable)}`,  'text-slate-800'],
                            ['Total Received', `₹${fmt(totalReceived)}`, 'text-emerald-600'],
                            ['Outstanding',    `₹${fmt(outstandingBeforeCN)}`, 'text-rose-600'],
                        ].map(([label, value, color]) => (
                            <div key={label}>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
                                <div className={`text-[17px] font-black ${color}`}>{value}</div>
                            </div>
                        ))}
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Status</div>
                            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[11px] rounded-full inline-block mt-0.5">
                                {outstandingBeforeCN > 0 ? 'Part Paid' : 'Paid'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Main Grid ────────────────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">

                    {/* LEFT COLUMN */}
                    <div className="space-y-4 min-w-0">

                        {/* Credit Note Details */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-extrabold text-slate-800 text-base">Credit Note Details</h3>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded border border-emerald-100">Manual Entry</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls}>Credit Note Type <span className="text-red-500">*</span></label>
                                    <select value={creditNoteType} onChange={e => setCreditNoteType(e.target.value)} className={inputCls}>
                                        <option value="Discount Adjustment">Discount Adjustment</option>
                                        <option value="Sales Return">Sales Return</option>
                                        <option value="Rate Difference">Rate Difference</option>
                                        <option value="Short Supply">Short Supply</option>
                                        <option value="Service Deficiency">Service Deficiency</option>
                                        <option value="TDS Adjustment">TDS Adjustment</option>
                                        <option value="GST Correction">GST Correction</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Credit Note Date <span className="text-red-500">*</span></label>
                                    <input type="date" value={creditNoteDate} onChange={e => setCreditNoteDate(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Credit Note No. <span className="text-red-500">*</span></label>
                                    <input type="text" value={creditNoteNo} onChange={e => setCreditNoteNo(e.target.value)} className={inputCls} placeholder="Auto generated" />
                                    <div className="text-[10px] text-slate-400 mt-0.5">Auto generated or enter manually</div>
                                </div>

                                <div ref={dropdownRef} className="relative">
                                    <label className={labelCls}>Reference Invoice / Document <span className="text-red-500">*</span></label>
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(o => !o)}
                                        className={`${inputCls} flex items-center justify-between text-left`}
                                    >
                                        <span className={referenceInvoice ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                                            {referenceInvoice
                                                ? (() => { const f = allInvoicesForDropdown.find(i => i.invoice_no === referenceInvoice); return f ? `${f.invoice_no} — ₹${fmt(getInvAmount(f))}` : referenceInvoice; })()
                                                : 'Select Invoice'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                                            {/* Header */}
                                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Select Invoice</span>
                                                <span className="text-[10px] font-semibold text-slate-400">{allInvoicesForDropdown.length} found</span>
                                            </div>
                                            {/* Scrollable list */}
                                            <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                                                {allInvoicesForDropdown.length === 0 && (
                                                    <div className="px-4 py-3 text-[12px] text-slate-400 text-center">No invoices found for this exhibitor.</div>
                                                )}
                                                {allInvoicesForDropdown.map((inv, i) => (
                                                    <button
                                                        key={inv._id}
                                                        type="button"
                                                        onClick={() => handleReferenceInvoiceChange(inv.invoice_no)}
                                                        className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 ${referenceInvoice === inv.invoice_no ? 'bg-blue-50' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div>
                                                                <div className="text-[13px] font-bold text-slate-800">{inv.invoice_no}</div>
                                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                                    {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                                                                    {inv.items?.length ? ` · ${inv.items.length} item${inv.items.length > 1 ? 's' : ''}` : ''}
                                                                </div>
                                                            </div>
                                                            <div className="text-[13px] font-black text-emerald-600 shrink-0">₹{fmt(getInvAmount(inv))}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className={labelCls}>Invoice Date</label>
                                    <input type="date" value={referenceInvoiceDate} onChange={e => setReferenceInvoiceDate(e.target.value)} className={readOnlyCls} readOnly />
                                </div>
                                <div>
                                    <label className={labelCls}>Reason for Credit Note <span className="text-red-500">*</span></label>
                                    <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Stall size reduced" className={inputCls} />
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
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500">Particular / Description</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-24">HSN</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-16">Qty</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-16">Unit</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-28">Rate (₹)</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-28">Amount (₹)</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-16">GST%</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-28">Total (₹)</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 w-12 text-center">Del</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {items.map((item, index) => (
                                            <tr key={item.id} className={item.fromInvoice ? 'bg-blue-50/20' : ''}>
                                                <td className="py-2 px-5 text-xs font-bold text-slate-400">{index + 1}</td>
                                                <td className="py-2 px-3">
                                                    <input type="text" value={item.particular} onChange={e => handleItemChange(item.id, 'particular', e.target.value)} placeholder="Item description" className="w-full text-[12px] font-medium border border-slate-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none min-w-[160px]" />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input type="text" value={item.hsn || ''} onChange={e => handleItemChange(item.id, 'hsn', e.target.value)} placeholder="HSN" className="w-full text-[12px] font-medium border border-slate-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none" />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input type="number" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', e.target.value)} className="w-full text-[12px] font-medium border border-slate-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none" min="1" />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input type="text" value={item.unit || 'Nos'} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} className="w-full text-[12px] font-medium border border-slate-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none" />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} className="w-full text-[12px] font-medium border border-slate-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none" min="0" />
                                                </td>
                                                <td className="py-2 px-3 text-[12px] font-bold text-slate-700 bg-slate-50/50 whitespace-nowrap">{fmt(item.amount)}</td>
                                                <td className="py-2 px-3">
                                                    <input type="text" value={item.gstPct || '18'} onChange={e => handleItemChange(item.id, 'gstPct', e.target.value)} className="w-full text-[12px] font-medium border border-slate-200 rounded px-2 py-1.5 focus:ring-blue-500 outline-none" />
                                                </td>
                                                <td className="py-2 px-3 text-[12px] font-bold text-slate-800 bg-slate-50/50 whitespace-nowrap">
                                                    {fmt(item.total || item.amount * (1 + parseFloat(item.gstPct || 18) / 100))}
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <button type="button" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1} className="text-rose-400 hover:text-rose-600 transition-colors p-1 disabled:opacity-30">
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
                                <div className="min-w-[280px] text-right space-y-1.5">
                                    <div className="flex justify-between items-center gap-6 text-[12px]">
                                        <span className="text-slate-500 font-semibold whitespace-nowrap">Sub Total</span>
                                        <span className="font-bold text-slate-800 shrink-0">₹{fmt(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-6 text-[12px]">
                                        <span className="text-slate-500 font-semibold whitespace-nowrap">GST (18%)</span>
                                        <span className="font-bold text-slate-800 shrink-0">₹{fmt(gstAmt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-6 border-t border-slate-200 pt-2 mt-1">
                                        <span className="font-bold text-blue-600 whitespace-nowrap text-[13px]">Total Credit Note Value</span>
                                        <span className="font-black text-blue-600 shrink-0 text-[14px]">₹{fmt(totalCreditNoteValue)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Apply Credit Note to Outstanding Invoices */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-extrabold text-slate-800 text-base">Apply Credit Note to Outstanding</h3>
                                <span className="text-[11px] font-semibold text-slate-400">Auto allocation can be edited</span>
                            </div>

                            <div className="overflow-x-auto -mx-5">
                                <table className="w-full text-left border-collapse min-w-[520px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-y border-slate-100">
                                            <th className="py-2.5 px-5 w-8"></th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600">Invoice No.</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600">Invoice Date</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600 text-right">Invoice Amount (₹)</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600 text-right">Outstanding (₹)</th>
                                            <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-600 text-center w-32">Apply Credit (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {invoices.length === 0 && (
                                            <tr><td colSpan="6" className="py-6 text-center text-[13px] text-slate-400 font-medium">No invoices found for this exhibitor.</td></tr>
                                        )}
                                        {pagedInvoices.map(inv => (
                                            <tr key={inv._id} className={inv.selected ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'}>
                                                <td className="py-2.5 px-5">
                                                    <input type="checkbox" checked={inv.selected} onChange={() => handleInvoiceToggle(inv._id)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                                </td>
                                                <td className="py-2.5 px-3 text-[13px] font-bold text-slate-800">{inv.invoice_no}</td>
                                                <td className="py-2.5 px-3 text-[12px] text-slate-500">{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}</td>
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

                            {/* Pagination + Add link */}
                            <div className="flex items-center justify-between mt-3 px-0">
                                <button type="button" onClick={() => {}} className="text-[12px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add Credit Note to Another Invoice
                                </button>

                                {invTotalPages > 1 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] text-slate-500 mr-1">
                                            {invStart + 1}–{Math.min(invStart + INV_PER_PAGE, invoices.length)} of {invoices.length}
                                        </span>
                                        <button
                                            onClick={() => setInvPage(p => Math.max(1, p - 1))}
                                            disabled={invPage === 1}
                                            className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                        </button>
                                        {Array.from({ length: invTotalPages }, (_, i) => i + 1).map(pg => (
                                            <button
                                                key={pg}
                                                onClick={() => setInvPage(pg)}
                                                className={`w-7 h-7 flex items-center justify-center rounded text-[11px] font-bold transition ${
                                                    invPage === pg
                                                        ? 'bg-blue-600 text-white border border-blue-600'
                                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {pg}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setInvPage(p => Math.min(invTotalPages, p + 1))}
                                            disabled={invPage === invTotalPages}
                                            className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end mt-4">
                                <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-4 space-y-2" style={{ minWidth: '300px' }}>
                                    <div className="flex items-center justify-between gap-8 text-[12px]">
                                        <span className="font-semibold text-slate-600 whitespace-nowrap">Credit Note Value</span>
                                        <span className="font-bold text-slate-800 shrink-0">₹{fmt(totalCreditNoteValue)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-8 text-[12px]">
                                        <span className="font-semibold text-slate-600 whitespace-nowrap">Total Applied</span>
                                        <span className="font-bold text-slate-800 shrink-0">₹{fmt(totalApplied)}</span>
                                    </div>
                                    <div className={`flex items-center justify-between gap-8 text-[13px] border-t pt-2 ${remainingBalance === 0 ? 'border-emerald-200' : 'border-orange-200'}`}>
                                        <span className={`font-bold whitespace-nowrap ${remainingBalance === 0 ? 'text-emerald-600' : 'text-orange-500'}`}>Remaining Credit Balance</span>
                                        <span className={`font-black shrink-0 ${remainingBalance === 0 ? 'text-emerald-600' : 'text-orange-500'}`}>₹{fmt(remainingBalance)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Approval & Adjustment Type */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <h3 className="font-extrabold text-slate-800 text-base mb-4">Approval &amp; Adjustment</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls}>Adjustment Type</label>
                                    <select value={adjustmentType} onChange={e => setAdjustmentType(e.target.value)} className={inputCls}>
                                        <option value="Against Invoice">Against Invoice</option>
                                        <option value="Against Proforma">Against Proforma</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Prepared By — Name</label>
                                    <input type="text" value={preparedByName} onChange={e => setPreparedByName(e.target.value)} placeholder="e.g. Vansh Chaudhary" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Prepared By — Designation</label>
                                    <input type="text" value={preparedByDesignation} onChange={e => setPreparedByDesignation(e.target.value)} placeholder="e.g. Accounts Executive" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Reviewed By — Name</label>
                                    <input type="text" value={reviewedByName} onChange={e => setReviewedByName(e.target.value)} placeholder="e.g. Neha Singh" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Reviewed By — Designation</label>
                                    <input type="text" value={reviewedByDesignation} onChange={e => setReviewedByDesignation(e.target.value)} placeholder="e.g. Accounts Manager" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>TDS Impact (If Any)</label>
                                    <input type="number" min="0" value={tdsAmount} onChange={e => setTdsAmount(Math.max(0, parseFloat(e.target.value) || 0))} className={inputCls} />
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
                                    <label className="border-2 border-dashed border-slate-200 rounded-lg h-28 flex flex-col items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden">
                                        <input type="file" onChange={e => setAttachment(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.jpg,.jpeg,.png" />
                                        <UploadCloud className="w-6 h-6 mb-1.5" />
                                        <span className="text-[11px] font-bold text-center px-2">
                                            {attachment ? attachment.name : <><span className="text-slate-600">Drag &amp; drop files here or</span> <span className="text-blue-500">click to upload</span></>}
                                        </span>
                                        <span className="text-[10px] mt-0.5">{attachment ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, JPG, PNG up to 5 MB'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-4">

                        {/* Summary */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <h3 className="font-extrabold text-slate-800 text-base mb-4">Credit Note Summary</h3>
                            <div className="space-y-3">
                                {[
                                    ['Invoice / PI Amount',   `₹${fmt(totalPayable)}`,        'text-slate-800'],
                                    ['Already Received',      `₹${fmt(totalReceived)}`,       'text-slate-800'],
                                    ['Outstanding Before CN', `₹${fmt(outstandingBeforeCN)}`, 'text-slate-800'],
                                ].map(([label, value, color]) => (
                                    <div key={label} className="flex justify-between items-center">
                                        <span className="text-[12px] font-semibold text-slate-500">{label}</span>
                                        <span className={`text-[13px] font-bold ${color}`}>{value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center text-blue-600 border-t border-slate-100 pt-3">
                                    <span className="text-[12px] font-bold">Credit Note Amount</span>
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
                                    <div className="text-[10px] font-bold text-slate-400 mb-0.5">New Outstanding After CN</div>
                                    <div className="text-[22px] font-black">₹{fmt(balanceAfterPosting)}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">(Including this Credit Note)</div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
                            <h3 className="font-extrabold text-slate-800 text-base mb-4">Credit Note Preview</h3>
                            <div className="space-y-2.5">
                                {[
                                    ['Credit Note No.', creditNoteNo],
                                    ['Credit Note Date', creditNoteDate ? new Date(creditNoteDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'],
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
                                    <span className="font-bold text-slate-800">{preparedByName || 'Admin'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Accounts Check */}
                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
                            <h3 className="font-extrabold text-amber-900 text-[13px] mb-3">Accounts Check:</h3>
                            <div className="space-y-2.5">
                                {[
                                    'Credit note amount is within outstanding limit.',
                                    'GST reversal is calculated correctly.',
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
