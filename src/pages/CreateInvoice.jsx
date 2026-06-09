import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import {
    ChevronLeft, Settings, User, Calendar, Plus, Trash2, FileText,
    Download, Mail, MessageCircleMore, Printer, Eye, Upload, Bookmark,
    XIcon,
    File,
    List
} from 'lucide-react';
import SearchableDropdown from '../components/SearchableDropdown';
import InvoicePreviewTemplate from './ihwe_client_data_2026/invoice/InvoicePreviewTemplate';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

// ── helpers ──────────────────────────────────────────────────────────────────
const newItem = () => ({
    id: Date.now(),
    description: '',
    hsn: '',
    qty: 1,
    size: '',
    area: '',
    unit: 'Nos',
    rate: 0,
    amount: 0,
    discountPct: 0,
    taxableValue: 0,
    gstPct: '18%',
    gstAmount: 0,
    total: 0,
});

const GST_OPTIONS = ['0%', '5%', '12%', '18%', '28%'];
const UNITS = ['Nos', 'Sqm', 'Sqft', 'Mtrs', 'Kgs', 'Ltrs', 'Pcs'];

// ── Section heading ──────────────────────────────────────────────────────────
const SectionHead = ({ num, label }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
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
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-100 bg-white disabled:bg-gray-50 disabled:text-gray-500 ${props.className || ''}`}
    />
);

// ── Select ───────────────────────────────────────────────────────────────────
const Select = ({ options, ...props }) => (
    <select
        {...props}
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-100 bg-white disabled:bg-gray-50 disabled:text-gray-500 ${props.className || ''}`}
    >
        {options.map((o, i) => (
            <option key={i} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>
        ))}
    </select>
);

// ── Quick Action row ─────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, colorClass = "text-blue-600", onClick }) => (
    <div onClick={onClick} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className="text-xs font-semibold text-gray-700">{label}</span>
    </div>
);

// ══════════════════════════════════════════════════════════════════════════════
const CreateInvoice = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [estimates, setEstimates] = useState([]);
    const [selectedPi, setSelectedPi] = useState('');

    const fetchEstimates = async () => {
        try {
            const [estRes, invRes] = await Promise.all([
                api.get('/api/estimates'),
                api.get('/api/invoices')
            ]);

            const fetchedEstimates = Array.isArray(estRes.data) ? estRes.data : (estRes.data?.data || []);
            const fetchedInvoices = Array.isArray(invRes.data) ? invRes.data : (invRes.data?.data || []);

            // Filter out estimates that already have an invoice generated
            const availableEstimates = fetchedEstimates.filter(est => {
                return !fetchedInvoices.some(inv => inv.estimate_no === est.est_no);
            });

            setEstimates(availableEstimates);
        } catch (err) {
            console.error("Failed to fetch estimates and invoices", err);
        }
    };
    useEffect(() => {
        fetchEstimates();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchInvoice = async () => {
                try {
                    const res = await api.get(`/api/invoices/${id}`);
                    const inv = res.data?.data || res.data;
                    if (inv) {
                        setSelectedPi(inv.estimate_no || '');
                        setForm(f => ({
                            ...f,
                            companyId: inv.companyId || f.companyId,
                            clientName: inv.consignee_name || f.clientName,
                            gstin: inv.gst_no || f.gstin,
                            invoiceType: inv.type_of_invoice || 'Standard',
                            invoiceNo: inv.invoice_no || 'Auto-generated on save',
                            invoiceDate: inv.invoice_date ? new Date(inv.invoice_date).toISOString().split('T')[0] : f.invoiceDate,
                            dueDate: inv.due_date ? new Date(inv.due_date).toISOString().split('T')[0] : f.dueDate,
                            poNo: inv.po_no || f.poNo,
                            currency: inv.currency || f.currency,
                            billingAddress: inv.billing_address || f.billingAddress,
                            shippingAddress: inv.consignee_addr || f.shippingAddress,
                            company_name: inv.company_name || inv.consignee_name || f.company_name,
                            company_addr: inv.company_addr || inv.billing_address || f.company_addr,
                            event_name: inv.event_name || inv.consignee_name || f.event_name,
                            consignee_name: inv.consignee_name || f.consignee_name,
                            consignee_addr: inv.consignee_addr || f.consignee_addr,
                            billingState: inv.billing_state || f.billingState,
                            billingPin: inv.billing_pincode || f.billingPin,
                            country: inv.country || f.country,
                            state: inv.state || f.state,
                            city: inv.city || f.city,
                            placeOfSupply: inv.place_of_supply ? (inv.place_of_supply.toLowerCase().includes('delhi') ? 'Delhi (07)' : inv.place_of_supply.toLowerCase().includes('maharashtra') ? 'Maharashtra (27)' : inv.place_of_supply.toLowerCase().includes('uttar') ? 'Uttar Pradesh (09)' : inv.place_of_supply.toLowerCase().includes('haryana') ? 'Haryana (06)' : inv.place_of_supply) : f.placeOfSupply,
                            remarks: inv.remarks || f.remarks,
                            terms: inv.terms || f.terms
                        }));
                        if (inv.items && inv.items.length > 0) {
                            setItems(inv.items.map((item, idx) => ({
                                id: Date.now() + idx,
                                description: item.description || '',
                                hsn: item.hsn || '',
                                qty: item.qty || 1,
                                size: item.size || '',
                                area: item.area || '',
                                unit: item.unit || 'Nos',
                                rate: item.rate || 0,
                                amount: item.amount || 0,
                                discountPct: item.discountPct || 0,
                                taxableValue: item.taxableValue || 0,
                                gstPct: item.gstPct || '18%',
                                gstAmount: item.gstAmount || 0,
                                total: item.total || 0
                            })));
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch invoice for edit", err);
                }
            };
            fetchInvoice();
        }
    }, [id]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachedFile(e.target.files[0]);
        }
    };

    // ── form state ──────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        companyId: '',
        clientName: '',
        gstin: '',
        invoiceType: 'Standard',
        invoiceNo: 'Auto-generated on save',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        poNo: '',
        currency: 'INR - Indian Rupee (₹)',
        company_name: '',
        company_addr: '',
        event_name: '',
        consignee_name: '',
        consignee_addr: '', // Shipping address
        shippingAddress: '',
        sameAsBilling: false,
        billingState: '',
        billingPin: '',
        country: 'India',
        state: '',
        city: '',
        placeOfSupply: '',

        remarks: '',
        terms: ''
    });

    const [items, setItems] = useState([newItem()]);
    const [showPreview, setShowPreview] = useState(false);

    // ── handlers ────────────────────────────────────────────────────────────────
    const handlePiSelect = (estNo) => {
        setSelectedPi(estNo);
        if (!estNo) return;

        const est = estimates.find(e => e.est_no === estNo);
        if (est) {
            setForm(f => ({
                ...f,
                companyId: est.companyId || f.companyId,
                clientName: est.consignee_name || f.clientName,
                gstin: est.gst_no || f.gstin,
                billingAddress: est.consignee_addr || f.billingAddress,
                shippingAddress: est.consignee_addr || f.shippingAddress,
                country: est.country || f.country,
                state: est.state || f.state,
                billingState: est.state || f.billingState,
                placeOfSupply: est.state ? (est.state.toLowerCase().includes('delhi') ? 'Delhi (07)' : est.state.toLowerCase().includes('maharashtra') ? 'Maharashtra (27)' : est.state.toLowerCase().includes('uttar') ? 'Uttar Pradesh (09)' : est.state.toLowerCase().includes('haryana') ? 'Haryana (06)' : est.state) : f.placeOfSupply,
                city: est.city || f.city,
                billingPin: est.pincode || f.billingPin,
                remarks: est.remarks || f.remarks,
                invoiceType: 'Standard',
                company_name: est.company_name || f.company_name,
                company_addr: est.company_addr || f.company_addr,
                event_name: est.event_name || f.event_name,
                consignee_name: est.consignee_name || f.consignee_name,
                consignee_addr: est.consignee_addr || f.consignee_addr,
            }));

            if (est.items && est.items.length > 0) {
                setItems(est.items.map((item, idx) => ({
                    id: Date.now() + idx,
                    description: item.description || '',
                    hsn: item.hsn || '',
                    qty: item.qty || 1,
                    size: item.size || '',
                    area: item.area || '',
                    unit: item.unit || 'Nos',
                    rate: item.rate || 0,
                    amount: item.amount || 0,
                    discountPct: item.discountPct || 0,
                    taxableValue: item.taxableValue || 0,
                    gstPct: item.gstPct || '18%',
                    gstAmount: item.gstAmount || 0,
                    total: item.total || 0
                })));
            }
        }
    };

    const updateItem = useCallback((id, field, val) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const updated = { ...item, [field]: val };

                // Auto-calculate area if size matches "3x3", "3*3", "3X3"
                if (field === 'size') {
                    const match = String(val).trim().match(/^(\d+(?:\.\d+)?)\s*[xX*]\s*(\d+(?:\.\d+)?)$/);
                    if (match) {
                        updated.area = String(Number(match[1]) * Number(match[2]));
                    }
                }

                const rate = Number(field === 'rate' ? val : updated.rate) || 0;
                const qty = Number(field === 'qty' ? val : updated.qty) || 0;
                const area = Number(field === 'area' ? val : updated.area) || 0;
                const discountPct = Number(field === 'discountPct' ? val : updated.discountPct) || 0;

                const multiplier = area > 0 ? area : (!isNaN(Number(updated.size)) && Number(updated.size) > 0 ? Number(updated.size) : 1);
                const amount = rate * qty * multiplier;
                updated.amount = amount;
                const discountAmount = amount * (discountPct / 100);
                updated.taxableValue = amount - discountAmount;

                const gstRate = parseFloat(updated.gstPct) || 0;
                updated.gstAmount = updated.taxableValue * (gstRate / 100);
                updated.total = updated.taxableValue + updated.gstAmount;

                return updated;
            })
        );
    }, []);

    const addItem = () => setItems((p) => [...p, newItem()]);
    const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));
    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        let finalAmount = items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);

        const payload = {
            companyId: form.companyId || 'UNKNOWN',
            estimate_no: selectedPi || '',
            type_of_invoice: form.invoiceType,
            invoice_date: form.invoiceDate,
            due_date: form.dueDate,
            po_no: form.poNo,
            currency: form.currency,
            gst_no: form.gstin,
            supply_date: form.invoiceDate,
            consignee_name: form.clientName,
            consignee_addr: form.shippingAddress,
            billing_address: form.billingAddress,
            billing_state: form.billingState,
            billing_pincode: form.billingPin,
            country: form.country,
            state: form.state,
            city: form.city,
            pincode: form.billingPin,
            place_of_supply: form.placeOfSupply,
            items: items.map(i => ({
                description: i.description,
                hsn: i.hsn,
                qty: Number(i.qty),
                size: i.size,
                area: i.area,
                unit: i.unit,
                rate: Number(i.rate),
                amount: Number(i.amount),
                discountPct: Number(i.discountPct),
                taxableValue: Number(i.taxableValue),
                gstPct: i.gstPct,
                gstAmount: Number(i.gstAmount),
                total: Number(i.total),
            })),
            finalAmount: finalAmount,
            remarks: form.remarks,
            terms: form.terms,
            added_by: 'Admin'
        };

        try {
            let res;
            if (id) {
                res = await api.put(`/api/invoices/${id}`, payload);
                if (res.status === 200 || res.status === 201) {
                    alert('Invoice updated successfully!');
                    navigate('/invoice-list');
                }
            } else {
                res = await api.post('/api/invoices', payload);
                if (res.status === 201 || res.status === 200) {
                    alert('Invoice generated successfully!');
                    navigate('/invoice-list');
                }
            }
        } catch (err) {
            console.error(err);
            alert(`Failed to ${id ? 'update' : 'generate'} invoice: ` + (err.response?.data?.message || err.message));
        }
    };

    const printRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: form.invoiceNo ? `Invoice_${form.invoiceNo}` : "Invoice",
    });

    const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);

    const handleSendWhatsApp = async () => {
        if (!id) {
            Swal.fire('Error', 'Please generate the invoice first before sending.', 'error');
            return;
        }

        try {
            setIsWhatsAppLoading(true);
            const res = await api.post(`/api/invoices/${id}/send-whatsapp`, {});
            if (res.status === 200) {
                Swal.fire('Success', 'WhatsApp message sent successfully', 'success');
            }
        } catch (error) {
            console.error("Error sending WhatsApp:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to send WhatsApp message', 'error');
        } finally {
            setIsWhatsAppLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!id) {
            Swal.fire('Error', 'Please generate the invoice first before sending.', 'error');
            return;
        }

        try {
            setIsEmailLoading(true);
            const res = await api.post(`/api/invoices/${id}/send-email`, {});
            if (res.status === 200) {
                Swal.fire('Success', 'Email sent successfully', 'success');
            }
        } catch (error) {
            console.error("Error sending Email:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to send Email', 'error');
        } finally {
            setIsEmailLoading(false);
        }
    };

    // Calculate Summary Values
    const isIgst = form.placeOfSupply && form.placeOfSupply.toLowerCase() !== 'delhi';
    const sumSubTotal = items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const sumTaxable = items.reduce((acc, i) => acc + (Number(i.taxableValue) || 0), 0);
    const sumDiscount = sumSubTotal - sumTaxable;
    const sumGst = items.reduce((acc, i) => acc + (Number(i.gstAmount) || 0), 0);
    const sumTotal = items.reduce((acc, i) => acc + (Number(i.total) || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-4 mt-0">
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
                    <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">{id ? "Edit Invoice" : "Create Invoice"}</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{id ? "Update details for this invoice" : "Generate a new invoice for your client"}</p>
                    </div>
                </div>
                {/* <button
                    onClick={() => navigate('/invoice-list')}
                    className="flex items-center gap-1.5 border border-blue-300 bg-blue-50 rounded px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                    <List className="w-3.5 h-3.5" />
                    All Invoices
                </button> */}
                <button
                    type="button"
                    onClick={() => navigate('/invoice-list')}
                    className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to List
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 pt-3 flex gap-3 items-start">

                {/* ── LEFT FORM ── */}
                <form onSubmit={handleSubmit} className="flex-1 space-y-3 min-w-0">

                    {/* SECTION 1 – Invoice Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="1" label="Invoice Details" />

                        <div className="grid grid-cols-4 gap-4 mb-3">
                            <div>
                                <Label required>Existing PI / Estimate</Label>
                                {/* <div className="flex relative mb-2">
                                    <Input required placeholder="Select Client / Company" value={form.clientName} onChange={(e) => setField('clientName', e.target.value)} className="py-2.5 rounded-r-none border-r-0" />
                                    <button type="button" className="border border-gray-300 rounded-r-md px-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100">
                                        <User className="w-4 h-4" />
                                    </button>
                                </div> */}
                                {id ? (
                                    <Input value={selectedPi || 'No PI / Estimate'} disabled className="py-2.5 bg-gray-50" />
                                ) : (
                                    <SearchableDropdown
                                        value={selectedPi}
                                        onChange={(e) => handlePiSelect(e.target.value)}
                                        options={[
                                            { label: 'Select Existing PI / Estimate', value: '' },
                                            ...estimates.map(e => ({ label: e.est_no, value: e.est_no }))
                                        ]}
                                    />
                                )}
                            </div>
                            <div>
                                <Label>GSTIN / PAN No.</Label>
                                <Input placeholder="Enter GSTIN / PAN No." value={form.gstin} onChange={(e) => setField('gstin', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Invoice Type</Label>
                                <Select required options={['Select Invoice Type', 'Intrastate', 'Interstate Sale', 'Foreign Sale']} value={form.invoiceType} onChange={(e) => setField('invoiceType', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Invoice No.</Label>
                                <div className="flex">
                                    <Input required value={form.invoiceNo} onChange={(e) => setField('invoiceNo', e.target.value)} disabled className="rounded-r-none border-r-0 py-2.5 bg-gray-50" />
                                    <button type="button" className="border border-gray-300 rounded-r-md px-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <Label required>Invoice Date</Label>
                                <div className="relative">
                                    <Input required type="date" value={form.invoiceDate} onChange={(e) => setField('invoiceDate', e.target.value)} className="py-2.5" />
                                </div>
                            </div>
                            <div>
                                <Label>Due Date</Label>
                                <div className="relative">
                                    <Input type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} className="py-2.5" />
                                </div>
                            </div>
                            <div>
                                <Label>Purchase Order No.</Label>
                                <Input placeholder="Enter PO No. (Optional)" value={form.poNo} onChange={(e) => setField('poNo', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Currency</Label>
                                <Select required options={['INR - Indian Rupee (₹)', 'USD - US Dollar ($)']} value={form.currency} onChange={(e) => setField('currency', e.target.value)} className="py-2.5" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2 – Billing & Shipping Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="2" label="Billing & Shipping Details" />

                        <div className="grid grid-cols-4 gap-4 mb-2">
                            <div>
                                <Label required>Billing Address</Label>
                                <textarea
                                    required
                                    value={form.company_addr}
                                    onChange={(e) => setField('company_addr', e.target.value)}
                                    className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-100 bg-white resize-y"
                                />
                            </div>
                            <div>
                                <Label>Shipping / Consignee Address</Label>
                                <textarea
                                    disabled={form.sameAsBilling}
                                    placeholder={form.sameAsBilling ? "Same as billing address" : "Enter shipping address"}
                                    value={form.sameAsBilling ? form.company_addr : form.consignee_addr}
                                    onChange={(e) => setField('consignee_addr', e.target.value)}
                                    className="w-full h-[30px] border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-100 disabled:bg-gray-50 resize-y"
                                />
                                <div className="flex items-center gap-1.5 mt-1">
                                    <input
                                        type="checkbox"
                                        id="sameAsBilling"
                                        checked={form.sameAsBilling}
                                        onChange={(e) => setField('sameAsBilling', e.target.checked)}
                                        className="w-3.5 h-3.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <label htmlFor="sameAsBilling" className="text-xs font-semibold text-gray-700 cursor-pointer">Same as Billing Address</label>
                                </div>
                            </div>
                            <div>
                                <Label required>State</Label>
                                <Select required options={['Delhi', 'Maharashtra', 'Karnataka']} value={form.billingState} onChange={(e) => setField('billingState', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Pin Code</Label>
                                <Input required value={form.billingPin} onChange={(e) => setField('billingPin', e.target.value)} className="py-2.5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <Label required>Country</Label>
                                <Select required options={['India', 'USA', 'UK']} value={form.country} onChange={(e) => setField('country', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>State</Label>
                                <Select required options={['Delhi', 'Maharashtra']} value={form.state} onChange={(e) => setField('state', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>City</Label>
                                <Input required value={form.city} onChange={(e) => setField('city', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Place of Supply</Label>
                                <Select required options={['Select Place of Supply', 'Delhi (07)', 'Maharashtra (27)', 'Uttar Pradesh (09)', 'Haryana (06)']} value={form.placeOfSupply} onChange={(e) => setField('placeOfSupply', e.target.value)} className="py-2.5" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3 – Items */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <SectionHead num="3" label="Item Details" />

                        <div className="overflow-x-none border border-gray-200 rounded-lg mb-3">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 whitespace-nowrap">
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 w-8">#</th>
                                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 min-w-[110px]">Item Description <span className="text-red-500">*</span></th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">HSN / SAC</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">Qty <span className="text-red-500">*</span></th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[40px]">Area</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[40px]">Size</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">Unit <span className="text-red-500">*</span></th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">Rate (₹) <span className="text-red-500">*</span></th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">Amount (₹)</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">Discount %</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">Taxable Value (₹)</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">GST % <span className="text-red-500">*</span></th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">GST Amount (₹)</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">Total (₹)</th>
                                        <th className="px-1.5 py-2.5 text-center font-semibold text-gray-700 min-w-[30px]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                            <td className="px-1.5 py-2 text-center text-gray-500 font-medium">{idx + 1}</td>
                                            <td className="px-1.5 py-2">
                                                <input
                                                    required
                                                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-[10px] focus:outline-none focus:border-green-500 bg-white"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <input className="w-full border border-gray-200 rounded px-2 py-1.5 text-[10px] focus:outline-none focus:border-green-500 bg-white text-center" value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} />
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <input required type="number" min={1} className="w-full border border-gray-200 rounded px-1 py-1.5 text-[10px] focus:outline-none focus:border-green-500 bg-white text-center" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} />
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <input className="w-full border border-gray-200 rounded px-1 py-1.5 text-[10px] focus:outline-none focus:border-green-500 bg-white text-center" value={item.area} onChange={(e) => updateItem(item.id, 'area', e.target.value)} placeholder="Area" />
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <input className="w-full border border-gray-200 rounded px-1 py-1.5 text-[10px] focus:outline-none focus:border-green-500 bg-white text-center" value={item.size} onChange={(e) => updateItem(item.id, 'size', e.target.value)} placeholder="Size" />
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <select required className="min-w-[30px] border border-gray-200 rounded px-1 py-1.5 text-[10px] focus:outline-none focus:border-green-500 bg-white" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
                                                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <input required type="number" className="w-full border border-gray-200 rounded px-2 py-1.5 text-[10px] focus:outline-none focus:border-green-500 bg-white text-right" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <div className="w-full px-1 py-1.5 text-[10px] text-right text-gray-700">
                                                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <input type="number" className="w-full border border-gray-200 rounded px-1 py-1.5 text-[10px] focus:outline-none focus:border-green-500 bg-white text-center" value={item.discountPct} onChange={(e) => updateItem(item.id, 'discountPct', e.target.value)} />
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <div className="w-full px-1 py-1.5 text-[10px] text-right text-gray-700">
                                                    {item.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <select required className="min-w-[30px] border border-gray-200 rounded px-1 py-1.5 text-[10px] focus:outline-none focus:border-green-500 bg-white" value={item.gstPct} onChange={(e) => updateItem(item.id, 'gstPct', e.target.value)}>
                                                    {GST_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <div className="w-full px-1 py-1.5 text-[10px] text-right text-gray-700">
                                                    {item.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1.5 py-2">
                                                <div className="w-full px-1 py-1.5 text-[10px] text-right text-gray-800 font-medium">
                                                    {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1.5 py-2 text-center">
                                                <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                                                    <Trash2 className="w-4 h-4 mx-auto" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-1.5 bg-[#00A859] hover:bg-[#00904C] text-white rounded-md px-4 py-2 text-xs font-semibold shadow-sm transition mt-4"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" /> Add Item
                        </button>
                    </div>

                    {/* SECTION 4 – Additional Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-3">
                        <SectionHead num="4" label="Additional Information" />

                        <div className="grid grid-cols-2 gap-6 mb-2">
                            <div>
                                <Label>Remarks / Notes</Label>
                                <textarea
                                    placeholder="Enter any remarks or notes (optional)"
                                    value={form.remarks}
                                    onChange={(e) => setField('remarks', e.target.value)}
                                    className="w-full h-16 border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-green-500 bg-white resize-y"
                                />
                            </div>
                            <div>
                                <Label>Terms & Conditions</Label>
                                <textarea
                                    placeholder="Enter terms & conditions (optional)"
                                    value={form.terms}
                                    onChange={(e) => setField('terms', e.target.value)}
                                    className="w-full h-16 border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-green-500 bg-white resize-y"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Attach Documents</Label>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf" />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border border-gray-200 border-dashed rounded-md h-[60px] flex items-center px-4 bg-white hover:bg-gray-50 transition cursor-pointer max-w-[50%]"
                            >
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-3 shrink-0">
                                    <Upload className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col flex-1 truncate pr-2">
                                    {attachedFile ? (
                                        <>
                                            <p className="text-xs font-bold text-gray-800 truncate">{attachedFile.name}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-gray-500"><span className="font-bold text-indigo-700">Click to upload</span> or drag and drop</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, PDF (Max. 5MB)</p>
                                        </>
                                    )}
                                </div>
                                <button type="button" className="ml-auto border border-gray-200 rounded-md px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-white shadow-sm shrink-0">
                                    {attachedFile ? "Change" : "Browse Files"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar / Footer */}
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 sticky bottom-0 z-10 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-white transition bg-white shadow-sm"
                        >
                            <XIcon size={15} className=" text-gray-800" /> Cancel
                        </button>
                        <div className="flex gap-3">
                            <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition bg-white shadow-sm">
                                <FileText className="w-4 h-4" /> Save as Draft
                            </button>
                            <button type="button" onClick={() => setShowPreview(true)} className="flex items-center gap-2 border border-green-200 bg-green-50 text-green-700 rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-green-100 transition shadow-sm">
                                <Eye className="w-4 h-4" /> Preview Invoice
                            </button>
                            <button type="submit" className="flex items-center gap-2 bg-[#00A859] hover:bg-[#00904C] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition shadow-sm">
                                <FileText className="w-4 h-4" /> {id ? "Update Invoice" : "Generate Invoice"}
                            </button>
                        </div>
                    </div>
                </form>

                {/* ── PREVIEW MODAL ── */}
                {showPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1050px] max-h-[90vh] overflow-y-auto mt-10 p-6 relative">
                            <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 z-50 bg-white rounded-full p-1 text-gray-500 hover:text-red-500 shadow-sm border">
                                <XIcon size={24} />
                            </button>
                            <div className="pt-8">
                                <InvoicePreviewTemplate form={form} items={items} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── RIGHT SIDEBAR ── */}
                <div className="w-[250px] flex-shrink-0 space-y-3">

                    {/* Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">Invoice Summary</h3>
                        </div>

                        <div className="p-5 space-y-3.5">
                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span className="font-semibold text-gray-700">Sub Total</span>
                                    <span className="font-bold text-gray-800">₹ {sumSubTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="font-semibold text-gray-700">Total Discount</span>
                                    <span className="font-bold text-red-500">- ₹ {sumDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="font-semibold text-gray-700">Taxable Amount</span>
                                    <span className="font-bold text-gray-800">₹ {sumTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <hr className="border-dashed border-gray-200 my-2" />

                            <div className="space-y-2.5 text-xs">
                                {!isIgst ? (
                                    <>
                                        <div className="flex justify-between text-gray-600">
                                            <span className="font-semibold text-gray-700">CGST</span>
                                            <span className="font-bold text-gray-800">₹ {(sumGst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span className="font-semibold text-gray-700">SGST</span>
                                            <span className="font-bold text-gray-800">₹ {(sumGst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between text-gray-600">
                                        <span className="font-semibold text-gray-700">IGST</span>
                                        <span className="font-bold text-gray-800">₹ {sumGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 bg-green-50 rounded-lg px-4 py-3 flex items-center justify-between border border-green-100">
                                <span className="text-green-700 text-sm font-bold">Grand Total</span>
                                <span className="text-green-700 text-base font-bold">₹ {sumTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-indigo-600">⚡</span>
                            <h3 className="text-sm font-bold text-gray-800">Quick Actions</h3>
                        </div>
                        <div className="flex flex-col">
                            <QuickAction icon={Mail} label={isEmailLoading ? "Sending Email..." : "Send Invoice via Email"} colorClass="text-blue-600" onClick={handleSendEmail} disabled={isEmailLoading} />
                            <QuickAction icon={MessageCircleMore} label={isWhatsAppLoading ? "Sending WhatsApp..." : "Send Invoice via WhatsApp"} colorClass="text-green-600" onClick={handleSendWhatsApp} disabled={isWhatsAppLoading} />
                            <QuickAction icon={File} label="Download PDF" colorClass="text-red-600" onClick={handlePrint} />
                            <QuickAction icon={Printer} label="Print Invoice" colorClass="text-indigo-600" onClick={handlePrint} />
                            <QuickAction icon={Bookmark} label="Save as Template" colorClass="text-blue-500" onClick={() => alert("Save as Template functionality coming soon!")} />
                        </div>
                    </div>

                    {/* Recent Invoices */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Recent Invoices</h3>
                            <a href="#" className="text-xs font-bold text-blue-600 hover:underline">View All</a>
                        </div>

                        <div className="space-y-4">
                            {/* Invoice 1 */}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-2.5">
                                    <span className="text-xs font-bold text-gray-500">1</span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">INV/26-27/0001</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">31 May 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-800">₹ 1,00,300.00</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">Draft</p>
                                </div>
                            </div>

                            {/* Invoice 2 */}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-2.5">
                                    <span className="text-xs font-bold text-gray-500">2</span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">INV/26-27/0000</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">25 May 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-green-800">₹ 75,400.00</p>
                                    <p className="text-[10px] font-bold text-green-500 mt-0.5">Paid</p>
                                </div>
                            </div>

                            {/* Invoice 3 */}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-2.5">
                                    <span className="text-xs font-bold text-gray-500">3</span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">INV/26-27/0009</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">20 May 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-red-700">₹ 1,25,000.00</p>
                                    <p className="text-[10px] font-bold text-red-400 mt-0.5">Overdue</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Hidden printable component */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    <InvoicePreviewTemplate form={form} items={items} />
                </div>
            </div>

        </div>
    );
};

export default CreateInvoice;