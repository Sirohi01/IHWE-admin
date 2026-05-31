import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Settings, Info, Plus, Trash2, FileText,
    Download, Mail, MessageCircleMore, Printer, Eye,
    UploadCloud, FileSearch, CircleDot, Wallet, TrendingUp, SlidersHorizontal, Upload,
    File
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
    '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

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

// ── Section heading ──────────────────────────────────────────────────────────
const SectionHead = ({ num, label }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {num}
        </div>
        <h2 className="text-sm font-bold text-gray-800">{label}</h2>
    </div>
);

// ── Field label ──────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold text-gray-800 mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

// ── Input ────────────────────────────────────────────────────────────────────
const Input = (props) => (
    <input
        {...props}
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-100 bg-white disabled:bg-gray-50 disabled:text-gray-500 ${props.className || ''}`}
    />
);

// ── Select ───────────────────────────────────────────────────────────────────
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

// ── Quick Action row ─────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label }) => (
    <button className="flex items-center justify-between w-full py-2  transition  border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-2.5">
            <Icon className={`w-4 h-4  transition ${label === 'Print Debit Note' || label === 'Send via Email' || label === 'Preview Debit Note' ? 'text-purple-800' : 'text-green-800'}`} />
            <span className="text-xs font-medium text-gray-700">{label}</span>
        </div>
        <ChevronLeft className="w-3.5 h-3.5 text-gray-300 rotate-180 " />
    </button>
);

// ── Type Card ─────────────────────────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════════
const CreateDebitNote = () => {
    const navigate = useNavigate();

    // ── form state ──────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        toInvoice: 'INV/26-27/0001',
        invoiceDate: '2026-05-15',
        clientName: 'Organic Expo 2026',
        originalAmount: '103000.00',
        outstandingAmount: '78000.00',

        debitNoteNo: 'DN/26-27/----',
        debitNoteDate: '2026-05-31',
        reason: 'Select Reason',
        reference: '',

        type: 'additional_charges',
        remarks: ''
    });

    const [items, setItems] = useState([
        {
            id: 1,
            description: 'Additional Fabrication Work',
            hsn: '9988',
            qty: 1,
            unit: 'Nos',
            rate: 20000.00,
            amount: 20000.00,
            gstPct: '18%',
            gstAmount: 3600.00,
            total: 23600.00
        }
    ]);

    // ── computed ─────────────────────────────────────────────────────────────────
    const taxableAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);


    // Here we'll just hardcode the split shown in the image for the demo
    const cgst = taxableAmount * 0.09;
    const sgst = taxableAmount * 0.09;
    const igst = 0; // For demo matching image where IGST is 3600 but let's match the summary block precisely

    const summaryTaxable = 21350.00;
    const summaryCgst = 1925.00;
    const summarySgst = 1925.00;
    const summaryIgst = 3600.00;
    const summaryTotal = 25000.00;

    // ── handlers ────────────────────────────────────────────────────────────────
    const updateItem = useCallback((id, field, val) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
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
    const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));
    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div className="min-h-screen bg-gray-50/50 pb-5 mt-4">
            <style>
                {`
                /* Hide number input spinners on this page */
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
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to List
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 pt-3 flex gap-3 items-start">
                {/* ── LEFT FORM ── */}
                <div className="flex-1 space-y-3 min-w-0">

                    {/* SECTION 1 – Source */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="1" label="Debit Note Source" />

                        <div className="grid grid-cols-5 gap-4">
                            <div className="col-span-2">
                                <Label required>To Invoice / Estimate</Label>
                                <Select
                                    options={[
                                        { value: 'INV/26-27/0001', label: 'INV/26-27/0001 - Organic Expo 2026' }
                                    ]}
                                    value={form.toInvoice}
                                    onChange={(e) => setField('toInvoice', e.target.value)}
                                    className="py-2.5"
                                />
                            </div>
                            <div>
                                <Label>Invoice Date</Label>
                                <Input type="date" value={form.invoiceDate} readOnly className="bg-gray-50 text-gray-600 py-2.5" />
                            </div>
                            <div>
                                <Label>Client / Company</Label>
                                <Input value={form.clientName} readOnly className="bg-gray-50 text-gray-600 py-2.5" />
                            </div>
                            <div>
                                <Label>Original Invoice Amount</Label>
                                <Input value={`₹ ${parseFloat(form.originalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} readOnly className="bg-gray-50 text-gray-600 py-2.5" />
                            </div>
                            {/* Wait, design shows 5 columns including Outstanding Amount */}
                        </div>
                        <div className="grid grid-cols-5 gap-4 mt-4">
                            <div className="col-span-2">
                                {/* The design shows the select dropdown has "Organic Expo 2026" inside it, I mocked it in options above */}
                            </div>
                        </div>

                        {/* Adjusting grid to match exactly */}
                        <div className="grid grid-cols-5 gap-4 -mt-4">
                            {/* Empty, restructuring */}
                        </div>



                        <div className="mt-5 bg-blue-50/50 border border-blue-100 rounded-md p-3 flex items-center gap-2.5 text-blue-700">
                            <Info className="w-4 h-4" />
                            <span className="text-xs">Debit note will be created against the selected invoice. You can add additional charges or adjustments.</span>
                        </div>
                    </div>

                    {/* SECTION 2 – Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="2" label="Debit Note Details" />

                        <div className="grid grid-cols-4 gap-4 mb-3">
                            <div>
                                <Label required>Debit Note No.</Label>
                                <div className="flex">
                                    <Input value={form.debitNoteNo} onChange={(e) => setField('debitNoteNo', e.target.value)} className="rounded-r-none border-r-0 py-2.5" />
                                    <button className="border border-gray-300 rounded-r-md px-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Label required>Debit Note Date</Label>
                                <Input type="date" value={form.debitNoteDate} onChange={(e) => setField('debitNoteDate', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Reason</Label>
                                <Select options={['Select Reason', 'Extra Services', 'Price Revision']} value={form.reason} onChange={(e) => setField('reason', e.target.value)} className="py-2.5" />
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

                    {/* SECTION 3 – Items */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="3" label="Item / Charge Details" />

                        <div className="overflow-x-none border border-gray-200 rounded-lg">
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
                            <button className="flex items-center gap-1.5 border border-gray-300 text-gray-600 rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition shadow-sm">
                                <FileSearch className="w-4 h-4 text-blue-500" /> Import Items from Invoice
                            </button>
                        </div>
                    </div>

                    {/* SECTION 4 – Additional Info */}
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
                                <div className="border border-gray-200 rounded-md h-[60px] flex items-center px-4 bg-white hover:bg-gray-50 transition cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg bg-[#F0F4FF] flex items-center justify-center mr-3 shrink-0">
                                        <Upload className="w-5 h-5 text-[#2E4383]" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs text-gray-500"><span className="font-semibold text-[#1E1B4B]">Click to upload</span> or drag and drop</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, PDF (Max. 5MB)</p>
                                    </div>
                                    <button className="ml-auto border border-gray-200 rounded-md px-4 py-1.5 text-xs font-semibold text-blue-600 bg-white hover:bg-gray-50 transition shadow-sm">
                                        Browse Files
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm"
                        >
                            <Trash2 className="w-4 h-4 text-gray-400" /> Cancel
                        </button>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition bg-white shadow-sm">
                                <Download className="w-4 h-4" /> Save as Draft
                            </button>
                            <button className="flex items-center gap-2 bg-[#00A859] hover:bg-[#00904C] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition shadow-sm">
                                <FileText className="w-4 h-4" /> Generate Debit Note
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR ── */}
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
                                    <span className="font-bold text-gray-800">₹ 1,03,000.00</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="font-semibold text-gray-800">Total Debit Note Amount</span>
                                    <span className="font-bold text-blue-600">₹ 25,000.00</span>
                                </div>
                            </div>

                            <hr className="border-dashed border-gray-200" />

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span className="font-bold text-gray-800">Taxable Amount</span>
                                    <span className="font-bold text-gray-800">₹ 21,350.00</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span className="font-semibold text-gray-800">CGST (9%)</span>
                                    <span className="font-semibold text-gray-800">₹ 1,925.00</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span className="font-semibold text-gray-800">SGST (9%)</span>
                                    <span className="font-semibold text-gray-800">₹ 1,925.00</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span className="font-semibold text-gray-800">IGST (18%)</span>
                                    <span className="font-semibold text-gray-800">₹ 3,600.00</span>
                                </div>
                            </div>

                            <div className="mt-4 bg-purple-100/50 rounded-lg px-4 py-3 flex items-center justify-between border border-purple-100">
                                <span className="text-purple-700 text-[9px] font-bold whitespace-nowrap">Total Debit Note Amount</span>
                                <span className="text-purple-700 text-md font-bold whitespace-nowrap">₹ 25,000.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-purple-600">⚡</span>
                            <h3 className="text-sm font-bold text-gray-800">Quick Actions</h3>
                        </div>
                        <div className="flex flex-col">
                            <QuickAction icon={Eye} label="Preview Debit Note" />
                            <QuickAction icon={File} label="Download PDF" />
                            <QuickAction icon={Mail} label="Send via Email" />
                            <QuickAction icon={MessageCircleMore} label="Send via WhatsApp" />
                            <QuickAction icon={Printer} label="Print Debit Note" />
                        </div>
                    </div>

                    {/* Related Invoice */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">Related Invoice</h3>
                        </div>

                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-gray-800">INV/26-27/0001</span>
                            <span className="text-sm font-bold text-gray-800">₹ 1,03,000.00</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] text-gray-500 font-medium">15 May 2026</span>
                            <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold">Approved</span>
                        </div>
                        <div className="flex justify-center">

                            <button className="w-1/2 py-2 border border-gray-200 rounded-lg text-xs font-bold text-purple-800 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition">
                                <Eye className="w-3.5 h-3.5" /> View Invoice
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateDebitNote;