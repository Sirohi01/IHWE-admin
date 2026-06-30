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
        <div className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {num}
        </div>
        <h2 className="text-sm font-bold text-gray-800">{label}</h2>
    </div>
);

const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold text-gray-800 mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const Input = (props) => (
    <input
        {...props}
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-100 bg-white disabled:bg-gray-50 disabled:text-gray-500 ${props.className || ''}`}
    />
);

const Select = ({ options, ...props }) => (
    <select
        {...props}
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-100 bg-white disabled:bg-gray-50 disabled:text-gray-500 ${props.className || ''}`}
    >
        {options.map((o, i) => (
            <option key={i} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>
        ))}
    </select>
);

const TypeCard = ({ selected, icon: Icon, title, desc, onClick }) => (
    <div
        onClick={onClick}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${selected
            ? 'border-purple-500 bg-purple-50/50'
            : 'border-gray-200 hover:border-purple-300 bg-white'
            }`}
    >
        <div className="flex items-start gap-2.5">
            <div className={`mt-0.5 flex items-center justify-center flex-shrink-0 ${selected ? 'text-purple-600' : 'text-[#005189]'}`}>
                <Icon className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
                <h4 className="text-xs font-bold text-gray-800 mb-1">{title}</h4>
                <p className="text-[10px] text-gray-500 leading-snug">{desc}</p>
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
                        console.error('Failed to load fallback proforma for debit note', estimateErr);
                    }
                }

                const allPayments = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
                setPayments(allPayments);

                const docs = [
                    ...invoices.map((inv) => ({
                        key: `invoice:${inv._id}`,
                        type: 'Invoice',
                        id: inv._id,
                        companyId: inv.companyId,
                        label: `${inv.invoice_no} - ${inv.consignee_name || ''}`,
                        date: inv.invoice_date,
                        amount: inv.finalAmount,
                        consignee: inv.consignee_name,
                        state: inv.state,
                        docNo: inv.invoice_no,
                        items: inv.items || [],
                    })),
                    ...estimates.map((est) => ({
                        key: `estimate:${est._id}`,
                        type: 'Proforma Invoice',
                        id: est._id,
                        companyId: est.companyId,
                        label: `${est.est_no} - ${est.consignee_name || ''}`,
                        date: est.supply_date,
                        amount: est.finalAmount,
                        consignee: est.consignee_name,
                        state: est.state,
                        docNo: est.est_no,
                        items: estimateItemsToDebitNoteItems(est.items || []),
                    })),
                ];
                setSourceDocs(docs);
                if (docs.length > 0) {
                    setForm((f) => {
                        if (f.sourceKey && docs.some((doc) => doc.key === f.sourceKey)) return f;
                        return {
                            ...f,
                            sourceKey: docs[0].key,
                            clientState: docs[0].state || f.clientState,
                        };
                    });
                }
            } catch (err) {
                console.error('Failed to load invoices/estimates for debit note', err);
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
            toast.error('Please select the invoice/estimate this debit note is raised against.');
            return;
        }
        if (form.reason === 'Select Reason') {
            toast.error('Please select a reason for this debit note.');
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

            toast.success('Debit Note generated successfully!');
            navigate(`/debit-note-list/${id || 'all'}`);
        } catch (err) {
            console.error(err);
            const serverMessage = err.response?.data?.error || err.response?.data?.message;
            toast.error(serverMessage || 'Failed to generate debit note.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-5 mt-4">
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
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">Create Debit Note</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Raise debit note for additional charges, expenses or adjustments</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/debit-note-list/${id || 'all'}`)}
                        className="flex items-center gap-1.5 border border-purple-200 bg-purple-50 rounded-md px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition shadow-sm"
                    >
                        <List className="w-4 h-4" />
                        All Debit Notes
                    </button>
                    <button
                        onClick={() => navigate(id ? `/dashboard/account/${id}` : -1)}
                        className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Overview
                    </button>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 pt-3 flex gap-3 items-start">
                {/* LEFT FORM */}
                <div className="flex-1 space-y-3 min-w-0">

                    {/* SECTION 1 - Source */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="1" label="Debit Note Source" />

                        <div className="grid grid-cols-5 gap-4">
                            <div className="col-span-2">
                                <Label required>To Invoice / Estimate</Label>
                                <Select
                                    options={[{ value: '', label: sourceDocs.length ? 'Select document' : 'No invoices/proformas found' }, ...sourceDocs.map((d) => ({ value: d.key, label: d.label }))]}
                                    value={form.sourceKey}
                                    onChange={(e) => handleSourceSelect(e.target.value)}
                                    className="py-2.5"
                                />
                            </div>
                            <div>
                                <Label>Document Date</Label>
                                <Input
                                    type="text"
                                    value={selectedDoc?.date ? new Date(selectedDoc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                    readOnly
                                    className="bg-gray-50 text-gray-600 py-2.5"
                                />
                            </div>
                            <div>
                                <Label>Client / Company</Label>
                                <Input value={selectedDoc?.consignee || '-'} readOnly className="bg-gray-50 text-gray-600 py-2.5" />
                            </div>
                            <div>
                                <Label>Original Amount</Label>
                                <Input
                                    value={`₹ ${Number(selectedDoc?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                    readOnly
                                    className="bg-gray-50 text-gray-600 py-2.5"
                                />
                            </div>
                        </div>

                        {selectedDoc && (
                            <div className="grid grid-cols-5 gap-4 mt-4">
                                <div>
                                    <Label>Outstanding Amount</Label>
                                    <Input
                                        value={`₹ ${outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                        readOnly
                                        className="bg-gray-50 text-gray-600 py-2.5"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-5 bg-blue-50/50 border border-blue-100 rounded-md p-3 flex items-center gap-2.5 text-blue-700">
                            <Info className="w-4 h-4" />
                            <span className="text-xs">Debit note will be created against the selected invoice. You can add additional charges or adjustments.</span>
                        </div>
                    </div>

                    {/* SECTION 2 - Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="2" label="Debit Note Details" />

                        <div className="grid grid-cols-4 gap-4 mb-3">
                            <div>
                                <Label>Debit Note No.</Label>
                                <Input value="Auto-generated on save" readOnly className="bg-gray-50 text-gray-500 py-2.5" />
                            </div>
                            <div>
                                <Label required>Debit Note Date</Label>
                                <Input type="date" value={form.debitNoteDate} onChange={(e) => setField('debitNoteDate', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Reason</Label>
                                <Select options={REASON_OPTIONS} value={form.reason} onChange={(e) => setField('reason', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label>Reference <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                <Input placeholder="Enter reference / remarks" value={form.reference} onChange={(e) => setField('reference', e.target.value)} className="py-2.5" />
                            </div>
                        </div>

                        <Label required>Debit Note Type</Label>
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
                                desc="Any other debit adjustment"
                                onClick={() => setField('type', 'other_adjustment')}
                            />
                        </div>
                    </div>

                    {/* SECTION 3 - Items */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="3" label="Item / Charge Details" />

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 whitespace-nowrap">
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-10">#</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[160px]">Item Description <span className="text-red-500">*</span></th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-24">HSN / SAC</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-16">Qty</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-24">Unit</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-28">Rate (₹)</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-28">Amount (₹)</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-28">GST %</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-28">GST Amount (₹)</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-28">Total (₹)</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-12">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                            <td className="px-2 py-2 text-gray-500">{idx + 1}</td>
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-purple-400 bg-white"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-purple-400 bg-white" value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input type="number" min={1} className="w-full border border-gray-200 rounded px-1 py-1.5 text-xs focus:outline-none focus:border-purple-400 bg-white text-center" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} />
                                            </td>
                                            <td className="px-2 py-2">
                                                <select className="w-full min-w-[45px] border border-gray-200 rounded px-1 py-1.5 text-xs focus:outline-none focus:border-purple-400 bg-white" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
                                                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-2 py-2">
                                                <input type="number" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-purple-400 bg-white text-right" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="w-full border border-transparent px-2 py-1.5 text-xs text-right text-gray-700 bg-transparent">
                                                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2">
                                                <select className="w-full min-w-[45px] border border-gray-200 rounded px-1 py-1.5 text-xs focus:outline-none focus:border-purple-400 bg-white" value={item.gstPct} onChange={(e) => updateItem(item.id, 'gstPct', e.target.value)}>
                                                    {GST_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="w-full border border-transparent px-2 py-1.5 text-xs text-right text-gray-700 bg-transparent">
                                                    {item.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="w-full border border-transparent px-2 py-1.5 text-xs text-right text-gray-700 bg-transparent">
                                                    {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                                                    <Trash2 className="w-4 h-4 mx-auto" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <button
                                onClick={addItem}
                                className="flex items-center gap-1.5 bg-[#00A859] hover:bg-[#00904C] text-white rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm transition"
                            >
                                <Plus className="w-4 h-4" /> Add Row
                            </button>
                            <button
                                onClick={importItemsFromSource}
                                disabled={!selectedDoc}
                                className="flex items-center gap-1.5 border border-gray-300 text-gray-600 rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileSearch className="w-4 h-4 text-blue-500" /> Import Items from Invoice
                            </button>
                        </div>
                    </div>

                    {/* SECTION 4 - Additional Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="4" label={<>Additional Information <span className="text-gray-500 font-normal text-xs ml-0.5">(Optional)</span></>} />

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label>Remarks / Notes</Label>
                                <textarea
                                    placeholder="Enter any remarks or notes (optional)"
                                    value={form.remarks}
                                    onChange={(e) => setField('remarks', e.target.value)}
                                    className="w-full h-[60px] border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-purple-500 bg-white"
                                />
                            </div>
                            <div>
                                <Label>Attach Documents</Label>
                                <label className="border border-gray-200 rounded-md h-[60px] flex items-center px-4 bg-white hover:bg-gray-50 transition cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg bg-[#F0F4FF] flex items-center justify-center mr-3 shrink-0">
                                        <Upload className="w-5 h-5 text-[#2E4383]" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold text-[#1E1B4B]">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
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
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 shadow-sm bg-white">
                        <button
                            onClick={() => navigate(id ? `/dashboard/account/${id}` : -1)}
                            className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm"
                        >
                            <Trash2 className="w-4 h-4 text-gray-400" /> Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 bg-[#00A859] hover:bg-[#00904C] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition shadow-sm disabled:opacity-60"
                        >
                            <FileText className="w-4 h-4" /> {submitting ? 'Saving...' : 'Generate Debit Note'}
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="w-[250px] flex-shrink-0 space-y-3">

                    {/* Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-purple-50/30">
                            <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">Debit Note Summary</h3>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span className="font-semibold text-gray-800">Original Invoice Amount</span>
                                    <span className="font-bold text-gray-800">₹ {Number(selectedDoc?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="font-semibold text-gray-800">Total Debit Note Amount</span>
                                    <span className="font-bold text-blue-600">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <hr className="border-dashed border-gray-200" />

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span className="font-bold text-gray-800">Taxable Amount</span>
                                    <span className="font-bold text-gray-800">₹ {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                {isIntrastate ? (
                                    <>
                                        <div className="flex justify-between text-gray-500">
                                            <span className="font-semibold text-gray-800">CGST</span>
                                            <span className="font-semibold text-gray-800">₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span className="font-semibold text-gray-800">SGST</span>
                                            <span className="font-semibold text-gray-800">₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between text-gray-500">
                                        <span className="font-semibold text-gray-800">IGST</span>
                                        <span className="font-semibold text-gray-800">₹ {igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 bg-purple-100/50 rounded-lg px-4 py-3 flex items-center justify-between border border-purple-100">
                                <span className="text-purple-700 text-[9px] font-bold whitespace-nowrap">Total Debit Note Amount</span>
                                <span className="text-purple-700 text-md font-bold whitespace-nowrap">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Related Invoice */}
                    {selectedDoc && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center">
                                    <FileText className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800">Related {selectedDoc.type}</h3>
                            </div>

                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-gray-800">{selectedDoc.docNo}</span>
                                <span className="text-sm font-bold text-gray-800">₹ {Number(selectedDoc.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] text-gray-500 font-medium">
                                    {selectedDoc.date ? new Date(selectedDoc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => navigate(selectedDoc.type === 'Invoice' ? `/payments/invoiceDetails/${selectedDoc.id}` : `/payments/estimateDetails/${selectedDoc.id}`)}
                                    className="w-1/2 py-2 border border-gray-200 rounded-lg text-xs font-bold text-purple-800 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition"
                                >
                                    <Eye className="w-3.5 h-3.5" /> View
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateDebitNote;
