import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { resolveLinkedIds } from '../utils/resolveLinkedIds';
import { getCurrentUserName } from '../utils/currentUser';
import {
    estimateItemsToDebitNoteItems,
    fetchLatestEstimateForClient,
    loadClientLikeProforma,
} from '../utils/invoicePrefill';
import {
    ChevronLeft, Info, Plus, Trash2, FileText,
    Eye, FileSearch, CircleDot, Wallet, TrendingUp, SlidersHorizontal, Upload,
    List,
} from 'lucide-react';

const newItem = () => ({
    id: Date.now(),
    description: '',
    hsn: '',
    qty: 1,
    unit: 'Nos',
    rate: 0,
    amount: 0,
    gstPct: '18%',
    gstAmount: 0,
    total: 0,
});

const GST_OPTIONS = ['0%', '5%', '12%', '18%', '28%'];
const UNITS = ['Nos', 'Sqm', 'Sqft', 'Mtrs', 'Kgs', 'Ltrs', 'Pcs'];
const REASON_OPTIONS = ['Select Reason', 'Extra Services', 'Price Revision', 'Material Cost Increase', 'Additional Stall Work', 'Other Adjustment'];

const SectionHead = ({ num, label }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded flex items-center justify-center bg-[#f3e8ff] text-[#7e22ce] text-[13px] font-bold flex-shrink-0">
            {num}
        </div>
        <h2 className="text-[14px] font-semibold text-[#1a2b4b]">{label}</h2>
    </div>
);

const Label = ({ children, required }) => (
    <label className="block text-[13px] font-medium text-[#1a2b4b] mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const Input = (props) => (
    <input
        {...props}
        className={`w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#7e22ce] focus:ring-2 focus:ring-[#7e22ce]/10 transition-all h-[32px] disabled:bg-gray-50 disabled:text-gray-500 ${props.className || ''}`}
    />
);

const Select = ({ options, ...props }) => (
    <select
        {...props}
        className={`w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#7e22ce] focus:ring-2 focus:ring-[#7e22ce]/10 transition-all h-[32px] disabled:bg-gray-50 disabled:text-gray-500 cursor-pointer ${props.className || ''}`}
    >
        {options.map((o, i) => (
            <option key={i} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>
        ))}
    </select>
);

const TypeCard = ({ selected, icon: Icon, title, desc, onClick }) => (
    <div
        onClick={onClick}
        className={`p-3 rounded-lg border cursor-pointer transition-all h-full ${selected
            ? 'border-[#7e22ce] bg-[#f3e8ff]/50 shadow-[0_2px_8px_rgba(126,34,206,0.1)]'
            : 'border-gray-200 hover:border-purple-300 bg-white shadow-sm hover:shadow-md'
            }`}
    >
        <div className="flex items-start gap-2.5">
            <div className={`mt-0.5 flex items-center justify-center flex-shrink-0 ${selected ? 'text-[#7e22ce]' : 'text-[#1a2b4b]'}`}>
                <Icon size={20} strokeWidth={1.5} />
            </div>
            <div>
                <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-1">{title}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
            </div>
        </div>
    </div>
);

const CreateDebitNote = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [sourceDocs, setSourceDocs] = useState([]); // [{key, type, id, label, date, amount, consignee}]
    const [payments, setPayments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [nextCreditNoteNo, setNextCreditNoteNo] = useState('');

    const [form, setForm] = useState({
        sourceKey: '',
        debitNoteDate: new Date().toISOString().split('T')[0],
        reason: 'Select Reason',
        reference: '',
        type: 'additional_charges',
        remarks: '',
        clientState: '',
    });

    const [items, setItems] = useState([newItem()]);

    useEffect(() => {
        let cancelled = false;
        const loadNextCreditNoteNo = async () => {
            try {
                const res = await api.get('/api/debitnotes/next-number');
                if (!cancelled) {
                    setNextCreditNoteNo(res.data?.debit_note_no || res.data?.data?.debit_note_no || '');
                }
            } catch (err) {
                console.error('Failed to load next credit note number', err);
                if (!cancelled) setNextCreditNoteNo('');
            }
        };

        loadNextCreditNoteNo();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!id) return;
        const loadSourceData = async () => {
            try {
                const [linkedIds, invRes, estRes, payRes] = await Promise.all([
                    resolveLinkedIds(id),
                    api.get('/api/invoices'),
                    api.get('/api/estimates'),
                    api.get('/api/payments'),
                ]);

                const invoices = (Array.isArray(invRes.data) ? invRes.data : invRes.data?.data || [])
                    .filter((inv) => linkedIds.includes(String(inv.companyId)));
                const estimates = (Array.isArray(estRes.data) ? estRes.data : estRes.data?.data || [])
                    .filter((est) => linkedIds.includes(String(est.companyId)));

                if (estimates.length === 0) {
                    try {
                        const client = await loadClientLikeProforma(id);
                        const latestEstimate = await fetchLatestEstimateForClient(id, client);
                        if (latestEstimate && !estimates.some((est) => est._id === latestEstimate._id)) {
                            estimates.push(latestEstimate);
                        }
                    } catch (estimateErr) {
                        console.error('Failed to load fallback proforma for credit note', estimateErr);
                    }
                }

                const allPayments = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
                setPayments(allPayments);

                const getClientName = (doc) => doc.company_name || doc.clientName || doc.consignee_name || doc.consignee || '';

                const docs = [
                    ...invoices.map((inv) => ({
                        key: `invoice:${inv._id}`,
                        type: 'Invoice',
                        id: inv._id,
                        companyId: inv.companyId,
                        label: `${inv.invoice_no} - ${getClientName(inv)}`,
                        date: inv.invoice_date,
                        amount: inv.finalAmount,
                        consignee: getClientName(inv),
                        state: inv.state,
                        docNo: inv.invoice_no,
                        items: inv.items || [],
                    })),
                    ...estimates.map((est) => ({
                        key: `estimate:${est._id}`,
                        type: 'Proforma Invoice',
                        id: est._id,
                        companyId: est.companyId,
                        label: `${est.est_no} - ${getClientName(est)}`,
                        date: est.supply_date,
                        amount: est.finalAmount,
                        consignee: getClientName(est),
                        state: est.state,
                        docNo: est.est_no,
                        items: estimateItemsToDebitNoteItems(est.items || []),
                    })),
                ];
                setSourceDocs(docs);
                setForm((f) => (
                    f.sourceKey && docs.some((doc) => doc.key === f.sourceKey)
                        ? f
                        : { ...f, sourceKey: '', clientState: '' }
                ));
            } catch (err) {
                console.error('Failed to load invoices/estimates for credit note', err);
            }
        };
        loadSourceData();
    }, [id]);

    const selectedDoc = useMemo(
        () => sourceDocs.find((d) => d.key === form.sourceKey) || null,
        [sourceDocs, form.sourceKey]
    );

    const outstandingAmount = useMemo(() => {
        if (!selectedDoc) return 0;
        const docPaid = payments
            .filter((p) => p.invoice_id === selectedDoc.id)
            .reduce((sum, p) => sum + (parseFloat(p.amount_text) || 0), 0);
        return Math.max(0, (selectedDoc.amount || 0) - docPaid);
    }, [selectedDoc, payments]);

    const handleSourceSelect = (key) => {
        setForm((f) => ({ ...f, sourceKey: key }));
        const doc = sourceDocs.find((d) => d.key === key);
        if (doc) {
            setForm((f) => ({ ...f, clientState: doc.state || f.clientState }));
        }
    };

    const importItemsFromSource = () => {
        if (!selectedDoc || !selectedDoc.items || selectedDoc.items.length === 0) {
            toast.info('Selected document has no items to import.');
            return;
        }
        setItems(selectedDoc.items.map((it, idx) => {
            const rate = Number(it.rate) || 0;
            const qty = Number(it.qty) || 1;
            const amount = Number(it.amount) || rate * qty;
            const gstPctStr = it.gstPct || it.gstRate || '18%';
            const gstRate = parseFloat(gstPctStr) || 0;
            const gstAmount = Number(it.gstAmount) || amount * (gstRate / 100);
            return {
                id: Date.now() + idx,
                description: it.description || '',
                hsn: it.hsn || '',
                qty,
                unit: it.unit || 'Nos',
                rate,
                amount,
                gstPct: typeof gstPctStr === 'string' ? gstPctStr : `${gstPctStr}%`,
                gstAmount,
                total: amount + gstAmount,
            };
        }));
    };

    const taxableAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalGst = items.reduce((sum, item) => sum + (Number(item.gstAmount) || 0), 0);
    const isIntrastate = (form.clientState || '').toLowerCase().includes('delhi');
    const cgstAmount = isIntrastate ? totalGst / 2 : 0;
    const sgstAmount = isIntrastate ? totalGst / 2 : 0;
    const igstAmount = isIntrastate ? 0 : totalGst;
    const totalAmount = taxableAmount + totalGst;

    const updateItem = useCallback((itemId, field, val) => {
        setItems((prev) =>
            prev.map((item) => {
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
            })
        );
    }, []);

    const addItem = () => setItems((p) => [...p, newItem()]);
    const removeItem = (itemId) => setItems((p) => p.filter((i) => i.id !== itemId));
    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!selectedDoc) {
            toast.error('Please select the invoice/estimate this credit note is raised against.');
            return;
        }
        if (form.reason === 'Select Reason') {
            toast.error('Please select a reason for this credit note.');
            return;
        }
        if (items.every((it) => !it.description)) {
            toast.error('Please add at least one item.');
            return;
        }

        const payload = {
            companyId: selectedDoc.companyId || id,
            debit_note_date: form.debitNoteDate,
            toInvoiceId: selectedDoc.id,
            toInvoiceNo: selectedDoc.docNo,
            toDocumentType: selectedDoc.type,
            clientName: selectedDoc.consignee,
            originalAmount: selectedDoc.amount,
            reason: form.reason,
            reference: form.reference,
            type: form.type,
            items: items.filter((it) => it.description).map((it) => ({
                description: it.description,
                hsn: it.hsn,
                qty: Number(it.qty),
                unit: it.unit,
                rate: Number(it.rate),
                amount: Number(it.amount),
                gstPct: it.gstPct,
                gstAmount: Number(it.gstAmount),
                total: Number(it.total),
            })),
            taxableAmount,
            cgstAmount,
            sgstAmount,
            igstAmount,
            totalAmount,
            remarks: form.remarks,
            added_by: getCurrentUserName(),
        };

        try {
            setSubmitting(true);
            await api.post('/api/debitnotes', payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            toast.success('Credit Note generated successfully!');
            navigate(`/debit-note-list/${id || 'all'}`);
        } catch (err) {
            console.error(err);
            const serverMessage = err.response?.data?.error || err.response?.data?.message;
            toast.error(serverMessage || 'Failed to generate credit note.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-5">
            <style>
                {`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] {
                    -moz-appearance: textfield;
                }
                `}
            </style>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h1 className="text-[18px] font-bold text-[#1a2b4b] leading-tight">Create Credit Note</h1>
                        <p className="text-[12px] text-slate-500 mt-0.5">Raise credit note for adjustments against an invoice or estimate</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/debit-note-list/${id || 'all'}`)}
                        className="flex items-center gap-1.5 border border-[#e9d5ff] bg-[#f3e8ff] rounded-lg px-4 py-2 text-[13px] font-semibold text-[#7e22ce] hover:bg-[#e9d5ff] transition shadow-sm"
                    >
                        <List size={16} />
                        All Credit Notes
                    </button>
                    <button
                        onClick={() => navigate(id ? `/dashboard/account/${id}` : -1)}
                        className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-4 py-2 text-[13px] font-semibold text-[#1a2b4b] hover:bg-gray-50 transition shadow-sm"
                    >
                        <ChevronLeft size={16} />
                        Back to Overview
                    </button>
                </div>
            </div>

            <div className="w-full pr-16 px-4 pt-6 flex gap-4 items-start">
                {/* LEFT FORM */}
                <div className="flex-1 space-y-4 min-w-0">

                    {/* SECTION 1 - Source */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <SectionHead num="1" label="Credit Note Source" />

                        <div className="grid grid-cols-5 gap-6">
                            <div className="col-span-2">
                                <Label required>To Invoice / Estimate</Label>
                                <Select
                                    options={[{ value: '', label: sourceDocs.length ? 'Select document' : 'No invoices/proformas found' }, ...sourceDocs.map((d) => ({ value: d.key, label: d.label }))]}
                                    value={form.sourceKey}
                                    onChange={(e) => handleSourceSelect(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Document Date</Label>
                                <Input
                                    type="text"
                                    value={selectedDoc?.date ? new Date(selectedDoc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                    readOnly
                                    className="bg-gray-50 text-slate-500 font-medium"
                                />
                            </div>
                            <div>
                                <Label>Client / Company</Label>
                                <Input value={selectedDoc?.consignee || '-'} readOnly className="bg-gray-50 text-slate-500 font-medium" />
                            </div>
                            <div>
                                <Label>Original Amount</Label>
                                <Input
                                    value={`₹ ${Number(selectedDoc?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                    readOnly
                                    className="bg-gray-50 text-slate-500 font-medium text-right"
                                />
                            </div>
                        </div>

                        {selectedDoc && (
                            <div className="grid grid-cols-5 gap-6 mt-4">
                                <div>
                                    <Label>Outstanding Amount</Label>
                                    <Input
                                        value={`₹ ${outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                        readOnly
                                        className="bg-[#f0f5ff] text-[#194090] font-bold border-[#c7d2fe] text-right"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-5 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-3 flex items-start gap-2.5 text-[#1e40af]">
                            <Info size={16} className="mt-0.5 flex-shrink-0" />
                            <span className="text-[12px] font-medium leading-relaxed">Credit note will be created against the selected invoice or estimate. Select the source document, then add adjustment details below.</span>
                        </div>
                    </div>

                    {/* SECTION 2 - Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <SectionHead num="2" label="Credit Note Details" />

                        <div className="grid grid-cols-4 gap-6 mb-4">
                            <div>
                                <Label>Credit Note No.</Label>
                                <Input value={nextCreditNoteNo || 'Auto-generating...'} readOnly className="bg-gray-50 text-slate-500 font-medium" />
                            </div>
                            <div>
                                <Label required>Credit Note Date</Label>
                                <Input type="date" value={form.debitNoteDate} onChange={(e) => setField('debitNoteDate', e.target.value)} />
                            </div>
                            <div>
                                <Label required>Reason</Label>
                                <Select options={REASON_OPTIONS} value={form.reason} onChange={(e) => setField('reason', e.target.value)} />
                            </div>
                            <div>
                                <Label>Reference <span className="text-slate-400 font-normal">(Optional)</span></Label>
                                <Input placeholder="Enter reference / remarks" value={form.reference} onChange={(e) => setField('reference', e.target.value)} />
                            </div>
                        </div>

                        <Label required>Credit Note Type</Label>
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            <TypeCard
                                selected={form.type === 'additional_charges'}
                                icon={CircleDot}
                                title="Additional Charges"
                                desc="For extra services / charges not included in invoice"
                                onClick={() => setField('type', 'additional_charges')}
                            />
                            <TypeCard
                                selected={form.type === 'expense_recovery'}
                                icon={Wallet}
                                title="Expense Recovery"
                                desc="Recover expenses incurred on behalf of client"
                                onClick={() => setField('type', 'expense_recovery')}
                            />
                            <TypeCard
                                selected={form.type === 'price_revision'}
                                icon={TrendingUp}
                                title="Price Revision"
                                desc="Increase in price after original invoice"
                                onClick={() => setField('type', 'price_revision')}
                            />
                            <TypeCard
                                selected={form.type === 'other_adjustment'}
                                icon={SlidersHorizontal}
                                title="Other Adjustment"
                                desc="Any other credit adjustment"
                                onClick={() => setField('type', 'other_adjustment')}
                            />
                        </div>
                    </div>

                    {/* SECTION 3 - Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-3">
                        <SectionHead num="3" label="Item / Charge Details" />

                        <div className="overflow-x-none mb-3">
                            <table className="w-full text-[10px] border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-8">#</th>
                                        <th className="px-1 py-2 text-left font-medium text-[#1a2b4b] min-w-[120px]">Item Description <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-20">HSN / SAC</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-14">Qty</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-16">Unit</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-24">Rate (₹)</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-24">Amount (₹)</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-16">GST %</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-24">GST (₹)</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-24">Total (₹)</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-8">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                            <td className="px-1 py-1.5 text-center text-slate-400 font-medium text-[11px]">{idx + 1}</td>
                                            <td className="px-1 py-1.5">
                                                <input
                                                    className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#7e22ce] focus:ring-1 focus:ring-[#7e22ce]/20 transition-all h-[26px]"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <input className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#7e22ce] focus:ring-1 focus:ring-[#7e22ce]/20 transition-all h-[26px] text-center" value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <input type="number" min={1} className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#7e22ce] focus:ring-1 focus:ring-[#7e22ce]/20 transition-all h-[26px] text-center" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <select className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#7e22ce] focus:ring-1 focus:ring-[#7e22ce]/20 transition-all h-[26px] cursor-pointer" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
                                                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <input type="number" className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#7e22ce] focus:ring-1 focus:ring-[#7e22ce]/20 transition-all h-[26px] text-right" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700 text-right">
                                                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <select className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#7e22ce] focus:ring-1 focus:ring-[#7e22ce]/20 transition-all h-[26px] cursor-pointer" value={item.gstPct} onChange={(e) => updateItem(item.id, 'gstPct', e.target.value)}>
                                                    {GST_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700 text-right">
                                                    {item.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-purple-50 border border-purple-100 text-[11px] font-medium text-[#7e22ce] text-right">
                                                    {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5 text-center">
                                                <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                                                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <button
                                onClick={addItem}
                                className="flex items-center gap-1.5 bg-[#00A859] hover:bg-[#00904C] text-white rounded-md px-4 py-2 text-xs font-semibold shadow-sm transition"
                            >
                                <Plus size={16} strokeWidth={3} /> Add Row
                            </button>
                            <button
                                onClick={importItemsFromSource}
                                disabled={!selectedDoc}
                                className="flex items-center gap-1.5 border border-gray-200 text-[#1a2b4b] rounded-md px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileSearch size={16} className="text-[#3b82f6]" /> Import Items from Source
                            </button>
                        </div>
                    </div>

                    {/* SECTION 4 - Additional Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-3 mt-4">
                        <SectionHead num="4" label={<>Additional Information <span className="text-slate-400 font-normal text-[12px] ml-0.5">(Optional)</span></>} />

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label>Remarks / Notes</Label>
                                <textarea
                                    placeholder="Enter any remarks or notes (optional)"
                                    value={form.remarks}
                                    onChange={(e) => setField('remarks', e.target.value)}
                                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#7e22ce] focus:ring-2 focus:ring-[#7e22ce]/10 transition-all resize-y h-[72px]"
                                />
                            </div>
                            <div>
                                <Label>Attach Documents</Label>
                                <label className="border border-dashed border-gray-300 rounded-lg h-[72px] flex items-center px-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mr-3 shrink-0 text-[#7e22ce]">
                                        <Upload size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[12px] text-[#1a2b4b]">
                                            <span className="font-bold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {attachmentFile ? attachmentFile.name : 'PNG, JPG, PDF (Max. 5MB)'}
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between rounded-xl shadow-sm border border-gray-100 p-4 bg-white mt-4">
                        <button
                            onClick={() => navigate(id ? `/dashboard/account/${id}` : -1)}
                            className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-[#1a2b4b] hover:bg-gray-50 transition bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                        >
                            <Trash2 size={16} className="text-slate-400" /> Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 bg-[#00A859] hover:bg-[#00904C] text-white rounded-lg px-8 py-2.5 text-[14px] font-bold transition shadow-sm disabled:opacity-60"
                        >
                            <FileText size={16} /> {submitting ? 'Saving...' : 'Generate Credit Note'}
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                {/* RIGHT SIDEBAR */}
                <div className="w-[250px] flex-shrink-0 space-y-4">

                    {/* Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#f3e8ff] text-[#7e22ce]">
                                <FileText size={14} />
                            </div>
                            <h3 className="text-[14px] font-medium text-[#1a2b4b]">Credit Note Summary</h3>
                        </div>

                        <div className="space-y-3 text-[13px]">
                            <div className="flex justify-between text-slate-500">
                                <span className="font-medium text-slate-500">Original Amount</span>
                                <span className="font-medium text-[#1a2b4b]">₹ {Number(selectedDoc?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span className="font-medium text-slate-500">Credit Total</span>
                                <span className="font-semibold text-[#7e22ce]">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            
                            <div className="mt-2 space-y-2 pt-2 border-t border-dashed border-gray-200">
                                <div className="flex justify-between text-slate-400">
                                    <span className="font-medium">Taxable</span>
                                    <span className="font-medium text-slate-600">₹ {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                {isIntrastate ? (
                                    <>
                                        <div className="flex justify-between text-slate-400">
                                            <span className="font-medium">CGST</span>
                                            <span className="font-medium text-slate-600">₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span className="font-medium">SGST</span>
                                            <span className="font-medium text-slate-600">₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between text-slate-400">
                                        <span className="font-medium">IGST</span>
                                        <span className="font-medium text-slate-600">₹ {igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 bg-[#f3e8ff]/50 rounded-lg px-4 py-3 flex items-center justify-between border border-[#e9d5ff]/50">
                                <span className="text-[#7e22ce] text-[12px] font-bold whitespace-nowrap">Grand Total</span>
                                <span className="text-[#7e22ce] text-[15px] font-bold whitespace-nowrap">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Related Invoice */}
                    {selectedDoc && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[14px] font-medium text-[#1a2b4b]">Related {selectedDoc.type}</h3>
                                <button
                                    onClick={() => navigate(selectedDoc.type === 'Invoice' ? `/payments/invoiceDetails/${selectedDoc.id}` : `/payments/estimateDetails/${selectedDoc.id}`)}
                                    className="text-[12px] font-medium text-[#3b82f6] hover:underline flex items-center gap-1"
                                >
                                    <Eye size={12} /> View
                                </button>
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shrink-0">
                                        <FileText size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-medium text-[#1a2b4b]">{selectedDoc.docNo}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {selectedDoc.date ? new Date(selectedDoc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[12px] font-medium text-[#1a2b4b]">₹ {Number(selectedDoc.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[10px] font-medium text-emerald-500 mt-0.5">Original</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateDebitNote;
