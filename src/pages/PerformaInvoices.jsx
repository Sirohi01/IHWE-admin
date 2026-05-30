import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, List, Plus, Trash2, FileText,
    Save, Download, MessageCircle, Mail, X, CheckSquare
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
    '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const newItem = () => ({
    id: Date.now(),
    description: '',
    subDesc: '',
    hsn: '',
    qty: 1,
    size: '',
    unit: 'Nos',
    rate: 0,
    amount: 0,
    disc: 0,
    taxable: 0,
});

const GST_OPTIONS = ['0% GST', '5% CGST+SGST', '12% CGST+SGST', '18% CGST+SGST', '28% CGST+SGST', '18% IGST', '12% IGST', '5% IGST'];
const ESTIMATE_TYPES = ['Proforma Invoice', 'Quotation', 'Tax Invoice'];
const UNITS = ['Nos', 'Sqm', 'Sqft', 'Mtrs', 'Kgs', 'Ltrs', 'Pcs'];

const LOCATION_DATA = {
    'India': {
        'Uttar Pradesh': ['Noida', 'Ghaziabad', 'Lucknow', 'Kanpur'],
        'Delhi': ['New Delhi', 'North Delhi', 'South Delhi'],
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
        'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru']
    },
    'USA': {
        'California': ['Los Angeles', 'San Francisco', 'San Diego'],
        'New York': ['New York City', 'Buffalo', 'Albany'],
        'Texas': ['Houston', 'Austin', 'Dallas']
    },
    'UK': {
        'England': ['London', 'Manchester', 'Birmingham'],
        'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen']
    },
    'UAE': {
        'Dubai': ['Dubai City', 'Jebel Ali'],
        'Abu Dhabi': ['Abu Dhabi City', 'Al Ain']
    }
};

// ── Section heading ──────────────────────────────────────────────────────────
const SectionHead = ({ num, label }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {num}
        </div>
        <h2 className="text-sm font-bold text-gray-800">{label}</h2>
    </div>
);

// ── Field label ──────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold text-gray-800 mb-1">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

// ── Input ────────────────────────────────────────────────────────────────────
const Input = (props) => (
    <input
        {...props}
        className={`w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-white ${props.className || ''}`}
    />
);

// ── Select ───────────────────────────────────────────────────────────────────
const Select = ({ options, ...props }) => (
    <select
        {...props}
        className={`w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 bg-white ${props.className || ''}`}
    >
        {options.map((o) => (
            <option key={o} value={o}>{o}</option>
        ))}
    </select>
);

// ── Quick Action row ─────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, color, label, sub }) => (
    <button className="flex items-center justify-between w-full p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition group">
        <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded ${color} flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left">
                <p className="text-xs font-semibold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-400">{sub}</p>
            </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400" />
    </button>
);

// ══════════════════════════════════════════════════════════════════════════════
export const PerformaInvoices = () => {
    const navigate = useNavigate();

    // ── form state ──────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        estimateType: 'Select Here',
        estimateNo: 'NGW/26-27/EST/027',
        gstin: '',
        supplyDate: '2026-05-31',
        consigneeName: '',
        consigneeAddress: '',
        country: '',
        state: '',
        city: '',
        pinCode: '',
    });

    const [items, setItems] = useState([
        { id: 1, description: 'Exhibition Stall Space (9 Sqm)', subDesc: 'Health & Wellness Expo 2025', hsn: '997331', qty: 1, size: '9 Sqm', unit: 'Nos', rate: 90000, amount: 90000, disc: 0, taxable: 90000 },
        { id: 2, description: 'Premium Corner Charges', subDesc: 'Additional Charges', hsn: '997331', qty: 1, size: '-', unit: 'Nos', rate: 10000, amount: 10000, disc: 0, taxable: 10000 },
    ]);

    const [gstOption, setGstOption] = useState('18% IGST');
    const [remarks, setRemarks] = useState('');
    const [notes, setNotes] = useState('');
    const [discount, setDiscount] = useState(5000);

    // ── computed ─────────────────────────────────────────────────────────────────
    const subTotal = items.reduce((s, i) => s + Number(i.taxable || 0), 0);
    const taxable = subTotal - Number(discount || 0);
    const isIGST = gstOption.includes('IGST');
    const gstPct = parseFloat(gstOption) || 0;
    const cgst = isIGST ? 0 : (taxable * gstPct) / 200;
    const sgst = isIGST ? 0 : (taxable * gstPct) / 200;
    const igst = isIGST ? (taxable * gstPct) / 100 : 0;
    const totalTax = cgst + sgst + igst;
    const grandTotal = taxable + totalTax;

    // ── item handlers ────────────────────────────────────────────────────────────
    const updateItem = useCallback((id, field, val) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const updated = { ...item, [field]: val };
                const rate = Number(field === 'rate' ? val : updated.rate) || 0;
                const qty = Number(field === 'qty' ? val : updated.qty) || 0;
                const disc = Number(field === 'disc' ? val : updated.disc) || 0;
                updated.amount = rate * qty;
                updated.taxable = updated.amount - (updated.amount * disc) / 100;
                return updated;
            })
        );
    }, []);

    const addItem = () => setItems((p) => [...p, newItem()]);
    const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));

    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    // ── render ────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 mt-6">
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
            {/* ── page header ── */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Create Estimate (Proforma Invoice)</h1>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                        <span className="hover:text-blue-600 cursor-pointer">Home</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="hover:text-blue-600 cursor-pointer">Proforma Invoices</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-600">Create Estimate</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                    <List className="w-3.5 h-3.5" />
                    Master List
                </button>
            </div>

            {/* ── body ── */}
            <div className="p-4 flex gap-4 items-start">
                {/* ── LEFT FORM ── */}
                <div className="flex-1 space-y-4 min-w-0">

                    {/* SECTION 1 – Estimate Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <SectionHead num="1" label="Estimate Details" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            <div>
                                <Label required>Estimate Type</Label>
                                <Select
                                    options={['Select Here', ...ESTIMATE_TYPES]}
                                    value={form.estimateType}
                                    onChange={(e) => setField('estimateType', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label required>Estimate No.</Label>
                                <Input value={form.estimateNo} onChange={(e) => setField('estimateNo', e.target.value)} />
                            </div>
                            <div>
                                <Label>GSTIN No. / PAN No.</Label>
                                <Input placeholder="Enter GSTIN / PAN No." value={form.gstin} onChange={(e) => setField('gstin', e.target.value)} />
                            </div>
                            <div>
                                <Label required>Supply Date</Label>
                                <Input type="date" value={form.supplyDate} onChange={(e) => setField('supplyDate', e.target.value)} />
                            </div>
                            <div>
                                <Label required>Consignee Name</Label>
                                <Input placeholder="Consignee name" value={form.consigneeName} onChange={(e) => setField('consigneeName', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                            <div className="col-span-1">
                                <Label required>Consignee Address</Label>
                                <textarea
                                    rows={2}
                                    placeholder="Hall No.-12, Ground Floor, ITPO, Pragati Maidan"
                                    value={form.consigneeAddress}
                                    onChange={(e) => setField('consigneeAddress', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 resize-none bg-white"
                                />
                            </div>
                            <div>
                                <Label required>Country</Label>
                                <Select
                                    options={['Select Country', ...Object.keys(LOCATION_DATA)]}
                                    value={form.country}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, country: e.target.value, state: '', city: '' }));
                                    }}
                                />
                            </div>
                            <div>
                                <Label required>State</Label>
                                <Select
                                    options={['Select State', ...(form.country && LOCATION_DATA[form.country] ? Object.keys(LOCATION_DATA[form.country]) : [])]}
                                    value={form.state}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, state: e.target.value, city: '' }));
                                    }}
                                    disabled={!form.country || form.country === 'Select Country'}
                                />
                            </div>
                            <div>
                                <Label required>City</Label>
                                <Select
                                    options={['Select City', ...(form.state && form.country && LOCATION_DATA[form.country]?.[form.state] ? LOCATION_DATA[form.country][form.state] : [])]}
                                    value={form.city}
                                    onChange={(e) => setField('city', e.target.value)}
                                    disabled={!form.state || form.state === 'Select State'}
                                />
                            </div>
                            <div>
                                <Label required>Pin Code</Label>
                                <Input placeholder="110001" maxLength={6} value={form.pinCode} onChange={(e) => setField('pinCode', e.target.value)} />
                            </div>
                        </div>
                        {/* <div className="grid grid-cols-5 gap-3 mt-3">

                        </div> */}
                    </div>

                    {/* SECTION 2 – Item & Pricing */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <SectionHead num="2" label="Item & Pricing Details" />

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        {['#', 'Item Description *', 'HSN No. *', 'Qty. *', 'Size', 'Unit *', 'Rate (₹) *', 'Amount (₹)', 'Disc. %', 'Taxable Value (₹)', ''].map((h, i) => (
                                            <th key={i} className="text-left px-2 py-2 font-semibold text-gray-800 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <td className="px-2 py-2 font-semibold text-gray-500">{idx + 1}</td>
                                            <td className="px-2 py-1 min-w-[160px]  ">
                                                <div className='border border-gray-200 rounded'>
                                                    <input
                                                        className="w-full  px-2 py-1 text-xs focus:outline-none focus:border-blue-400 bg-white"
                                                        value={item.description}
                                                        placeholder="Item description"
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                    />
                                                    <input
                                                        className="w-full border-0 px-2 py-0.5 text-[10px] text-gray-400 focus:outline-none bg-transparent"
                                                        value={item.subDesc}
                                                        placeholder="Sub description"
                                                        onChange={(e) => updateItem(item.id, 'subDesc', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-2 py-1.5 min-w-[72px]">
                                                <input type='number' className="w-full border border-gray-200 rounded px-2 py-[9px] text-xs focus:outline-none focus:border-blue-400 bg-white" value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} />
                                            </td>
                                            <td className="px-2 py-1.5 w-17">
                                                <input type="number" min={1} className="w-full border border-gray-200 rounded px-2 py-[9px] text-xs focus:outline-none focus:border-blue-400 bg-white text-center" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} />
                                            </td>
                                            <td className="px-2 py-1.5 min-w-[72px]">
                                                <input className="w-full border border-gray-200 rounded px-2 py-[9px] text-xs focus:outline-none focus:border-blue-400 bg-white" value={item.size} onChange={(e) => updateItem(item.id, 'size', e.target.value)} />
                                            </td>
                                            <td className="px-2 py-1.5 w-20">
                                                <select className="w-full border border-gray-200 rounded px-1 py-[9px] text-xs focus:outline-none bg-white" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
                                                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-2 py-1.5 min-w-[80px]">
                                                <input type="number" className="w-full border border-gray-200 rounded px-2 py-[9px] text-xs focus:outline-none focus:border-blue-400 bg-white" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                                            </td>
                                            <td className="px-2 py-1.5 min-w-[60px]">
                                                <span className="px-3 py-2 text-xs text-gray-700 bg-gray-100 ">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </td>
                                            <td className="px-2 py-1.5 w-14">
                                                <input type="number" min={0} max={100} className="w-full border border-gray-200 rounded px-2 py-[9px] text-xs focus:outline-none focus:border-blue-400 bg-white text-center" value={item.disc} onChange={(e) => updateItem(item.id, 'disc', e.target.value)} />
                                            </td>
                                            <td className="pl-2 pr-5 py-1.5 min-w-[100px]">
                                                <div className="block w-full px-2 py-[9px] border border-gray-200 rounded text-xs text-gray-700 bg-white">
                                                    {item.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="pl-0 pr-2 py-1.5 w-6 text-center">
                                                {items.length > 1 && (
                                                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition">
                                                        <Trash2 className="w-4 h-4 mx-auto" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Item */}
                        <button
                            onClick={addItem}
                            className="mt-3 flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Item
                        </button>

                        {/* GST / Final Amount / Remarks row */}
                        <div className="mt-4 grid grid-cols-3 gap-3 items-end border-t border-gray-100 pt-4">
                            <div>
                                <Label required>GST %</Label>
                                <Select options={GST_OPTIONS} value={gstOption} onChange={(e) => setGstOption(e.target.value)} />
                            </div>
                            <div>
                                <Label>Final Amount (₹)</Label>
                                <Input readOnly value={grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} className="bg-gray-50 font-semibold" />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>Any Remarks</Label>
                                    <Input placeholder="Enter remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                                </div>
                                <button className="mt-5 w-8 h-7 rounded bg-green-600 hover:bg-green-700 flex items-center justify-center flex-shrink-0 transition">
                                    <Plus className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3 – Remarks / Notes */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <SectionHead num="3" label="Remarks / Notes" />
                        <textarea
                            rows={4}
                            maxLength={500}
                            placeholder="Type your notes or any special instructions here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 resize-none bg-white"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">{notes.length} / 500 Characters</p>
                    </div>

                    {/* Bottom action bar */}
                    <div className="bg-white rounded-lg border border-gray-200 px-5 py-3 flex justify-between items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 border border-gray-300 rounded px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                        >
                            <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white rounded px-6 py-2 text-xs font-bold transition">
                            <FileText className="w-3.5 h-3.5" /> Generate Estimate
                        </button>
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="w-72 flex-shrink-0 space-y-4">
                    {/* Estimate Summary */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <h3 className="text-sm font-bold text-gray-800">Estimate Summary</h3>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between text-gray-600">
                                <span>Sub Total</span>
                                <span className="font-semibold text-gray-800">{fmt(subTotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Discount</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-red-500 font-semibold">- {fmt(discount)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-gray-600 border-t border-dashed border-gray-200 pt-2">
                                <span>Taxable Amount</span>
                                <span className="font-semibold text-gray-800">{fmt(taxable)}</span>
                            </div>

                            <div className="mt-1 space-y-1.5 pt-1">
                                <div className="flex justify-between text-gray-500">
                                    <span>CGST ({isIGST ? 0 : gstPct / 2}%)</span>
                                    <span>{fmt(cgst)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>SGST ({isIGST ? 0 : gstPct / 2}%)</span>
                                    <span>{fmt(sgst)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>IGST ({isIGST ? gstPct : 0}%)</span>
                                    <span>{fmt(igst)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-gray-600 border-t border-dashed border-gray-200 pt-2">
                                <span>Total Tax</span>
                                <span className="font-semibold text-gray-800">{fmt(totalTax)}</span>
                            </div>
                        </div>

                        {/* Grand Total */}
                        <div className="mt-3 bg-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
                            <span className="text-blue-800 text-base font-black">Grand Total</span>
                            <span className="text-blue-800 text-base font-black">{fmt(grandTotal)}</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Quick Actions</h3>
                        <div className="space-y-2">
                            <QuickAction icon={Save} color="bg-blue-500" label="Save Draft" sub="Save as draft for later" />
                            <QuickAction icon={CheckSquare} color="bg-green-600" label="Generate Estimate" sub="Create Proforma Invoice" />
                            <QuickAction icon={Download} color="bg-red-500" label="Download PDF" sub="Download estimate as PDF" />
                            <QuickAction icon={MessageCircle} color="bg-green-500" label="Send via WhatsApp" sub="Share estimate on WhatsApp" />
                            <QuickAction icon={Mail} color="bg-blue-400" label="Send via Email" sub="Email estimate to client" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformaInvoices;