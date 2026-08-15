import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import {
    ChevronLeft, Settings, User, Calendar, Plus, Trash2, FileText,
    Download, Mail, MessageCircleMore, Printer, Eye, Upload, Bookmark,
    XIcon,
    File,
    List,
    Package,
    Truck,
    Percent,
    Wallet,
    Paperclip,
    CheckCircle2,
    IndianRupee,
    Info,
    ClipboardList,
    Receipt,
    CreditCard,
    Calculator
} from 'lucide-react';
import SearchableDropdown from '../components/SearchableDropdown';
import InvoicePreviewTemplate from './ihwe_client_data_2026/invoice/InvoicePreviewTemplate';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import {
    clientToInvoiceForm,
    estimateItemsToInvoiceItems,
    estimateToInvoiceForm,
    fetchLatestEstimateForClient,
    loadClientLikeProforma,
} from '../utils/invoicePrefill';
import { getCurrentUserName } from '../utils/currentUser';
import { resolveLinkedIds } from '../utils/resolveLinkedIds';

// ── helpers ──────────────────────────────────────────────────────────────────
const WORD_ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const WORD_TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const twoDigitWords = (num) => {
    if (num < 20) return WORD_ONES[num];
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return WORD_TENS[tens] + (ones ? ` ${WORD_ONES[ones]}` : '');
};
const threeDigitWords = (num) => {
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    let str = hundreds ? `${WORD_ONES[hundreds]} Hundred` : '';
    if (rest) str += (str ? ' ' : '') + twoDigitWords(rest);
    return str;
};
const numberToIndianWords = (num) => {
    num = Math.round(Number(num) || 0);
    if (num === 0) return 'Zero';
    const crore = Math.floor(num / 10000000); num %= 10000000;
    const lakh = Math.floor(num / 100000); num %= 100000;
    const thousand = Math.floor(num / 1000); num %= 1000;
    const hundred = num;

    const parts = [];
    if (crore) parts.push(`${threeDigitWords(crore)} Crore`);
    if (lakh) parts.push(`${threeDigitWords(lakh)} Lakh`);
    if (thousand) parts.push(`${threeDigitWords(thousand)} Thousand`);
    if (hundred) parts.push(threeDigitWords(hundred));
    return parts.join(' ');
};
const amountInWords = (num) => `${numberToIndianWords(num)} Rupees Only`;

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
const normalizeItemValue = (value) => String(value ?? '').trim().toLowerCase();
const getItemKey = (item = {}) => [
    normalizeItemValue(item.description),
    normalizeItemValue(item.hsn),
    normalizeItemValue(item.unit),
    normalizeItemValue(item.size),
    normalizeItemValue(item.area),
    Number(item.rate || 0).toFixed(2),
].join('|');
const isCancelledDoc = (doc) => String(doc?.status || '').trim().toLowerCase() === 'cancelled';
const SIZE_BASED_UNITS = ['Sqm', 'Sqft'];
const recalculateItemForQty = (item, qty) => {
    const nextQty = Number(qty) || 0;
    if (item.category === 'PLC Charges') {
        const sourceQty = Number(item.qty) || 1;
        const scale = nextQty / sourceQty;
        return {
            ...item,
            qty: nextQty,
            amount: Number(item.amount || 0) * scale,
            taxableValue: Number(item.taxableValue || item.amount || 0) * scale,
            gstAmount: Number(item.gstAmount || 0) * scale,
            total: Number(item.total || 0) * scale,
        };
    }
    const rate = Number(item.rate) || 0;
    const area = Number(item.area) || 0;
    const sizeAsNumber = Number(item.size);
    const multiplier = SIZE_BASED_UNITS.includes(item.unit)
        ? (area > 0 ? area : (Number.isFinite(sizeAsNumber) && sizeAsNumber > 0 ? sizeAsNumber : 1))
        : 1;
    const amount = rate * nextQty * multiplier;
    const discountPct = Number(item.discountPct) || 0;
    const taxableValue = amount - (amount * discountPct) / 100;
    const gstRate = parseFloat(item.gstPct) || 0;
    const gstAmount = taxableValue * (gstRate / 100);

    return {
        ...item,
        qty: nextQty,
        amount,
        taxableValue,
        gstAmount,
        total: taxableValue + gstAmount,
    };
};

const getEstimatePlcItem = (estimate) => {
    const stall = (estimate.items || []).find((item) => item?.category !== 'Addon Product') || estimate.items?.[0] || {};
    const plcPct = Number(estimate?.plcPct) || 0;
    const plcCharges = Number(estimate?.plcCharges) || ((Number(stall.amount) || 0) * plcPct / 100);
    if (plcCharges <= 0) return null;
    const gstPct = Number(estimate?.plcGstPct) || 18;
    const gstAmount = Number(estimate?.plcGstAmount) || (plcCharges * gstPct / 100);
    return {
        id: `plc-${estimate._id || estimate.est_no}`,
        description: `Preferred Location Charges (PLC)${plcPct ? ` @ ${plcPct}%` : ''}`,
        hsn: stall.hsn || '', qty: 1, size: stall.size || '', area: stall.area || '', unit: 'Nos',
        rate: (Number(stall.rate) || 0) * plcPct / 100,
        amount: plcCharges, discountPct: 0, taxableValue: plcCharges,
        gstPct: `${gstPct}%`, gstAmount, total: Number(estimate?.plcFinalAmount) || plcCharges + gstAmount,
        category: 'PLC Charges', plScheme: stall.plScheme || '', stallType: stall.stallType || '',
    };
};

// ── Section heading ──────────────────────────────────────────────────────────
const SectionHead = ({ num, label }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
            {num}
        </div>
        <h3 className="text-[14px] font-medium text-[#1a2b4b]">{label}</h3>
    </div>
);

// ── Field label ──────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
    <label className="block text-[12px] font-medium text-[#1a2b4b] mb-1">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

// ── Input ────────────────────────────────────────────────────────────────────
const Input = (props) => (
    <input
        {...props}
        className={`w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${props.className || ''}`}
    />
);

const ReadOnlyValue = ({ children }) => (
    <div className="min-h-[32px] w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[13px] leading-5 text-[#1a2b4b] break-words">
        {children || '—'}
    </div>
);

// ── Select ───────────────────────────────────────────────────────────────────
const Select = ({ options, ...props }) => (
    <select
        {...props}
        className={`w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px] cursor-pointer disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${props.className || ''}`}
    >
        {options.map((o, i) => (
            <option key={i} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>
        ))}
    </select>
);

// ── Quick Action row ─────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, colorClass = "text-[#3b82f6]", onClick, disabled }) => (
    <div onClick={disabled ? undefined : onClick} className={`flex items-center gap-3 p-3 rounded-lg border border-transparent transition ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-100 hover:shadow-sm hover:bg-gray-50 cursor-pointer'}`}>
        <Icon size={16} className={colorClass} />
        <span className="text-[12px] font-medium text-[#1a2b4b]">{label}</span>
    </div>
);

// ══════════════════════════════════════════════════════════════════════════════
const CreateInvoice = ({ hideReadonlyFields = false, compactMode = false } = {}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id, piNo } = useParams();
    const navigationState = location.state || {};
    const selectedPiFromUrl = navigationState.selectedPiNo || (piNo ? decodeURIComponent(piNo) : '');
    const sourceEstimateId = navigationState.sourceEstimateId || '';
    const [resolvedSourceEstimateId, setResolvedSourceEstimateId] = useState(sourceEstimateId);
    const fileInputRef = useRef(null);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [estimates, setEstimates] = useState([]);
    const [existingInvoices, setExistingInvoices] = useState([]);
    const [selectedPi, setSelectedPi] = useState('');
    const [sourceEstimate, setSourceEstimate] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState('');
    const [isProformaEditMode, setIsProformaEditMode] = useState(false);
    const [editingProformaId, setEditingProformaId] = useState('');
    const [includeDeliveryChallans, setIncludeDeliveryChallans] = useState(compactMode);
    const [deliveryChallans, setDeliveryChallans] = useState([]);
    const [selectedChallanIds, setSelectedChallanIds] = useState([]);
    const [challansLoading, setChallansLoading] = useState(false);
    const [challansError, setChallansError] = useState('');

    // Compact "Create Tax Invoice from PI" fields (used when compactMode is on)
    const [poAvailable, setPoAvailable] = useState(true);
    const [poDate, setPoDate] = useState('');
    const [poAttachmentFile, setPoAttachmentFile] = useState(null);
    const poFileInputRef = useRef(null);
    const [pendingDueDays, setPendingDueDays] = useState(7);
    const [partialDueDays, setPartialDueDays] = useState(7);
    const [paymentStatusOption, setPaymentStatusOption] = useState('pending');
    const activeDueDays = paymentStatusOption === 'partial' ? partialDueDays : pendingDueDays;
    const paymentTerms = `Net ${activeDueDays || 0} Days`;
    const [amountReceived, setAmountReceived] = useState('');
    const [showPaymentReceivedDetails, setShowPaymentReceivedDetails] = useState(true);

    const addEstimateOption = (estimate) => {
        if (!estimate?.est_no) return;
        setEstimates((prev) => (
            prev.some((item) => item.est_no === estimate.est_no)
                ? prev
                : [estimate, ...prev]
        ));
    };

    const fetchEstimates = async () => {
        try {
            const [estRes, invRes, linkedIds] = await Promise.all([
                api.get('/api/estimates'),
                api.get('/api/invoices'),
                id ? resolveLinkedIds(id) : Promise.resolve([]),
            ]);

            const fetchedEstimates = Array.isArray(estRes.data) ? estRes.data : (estRes.data?.data || []);
            const fetchedInvoices = Array.isArray(invRes.data) ? invRes.data : (invRes.data?.data || []);
            const linkedIdSet = new Set(linkedIds.map(String));
            const accountEstimates = id
                ? fetchedEstimates.filter((estimate) =>
                    linkedIdSet.has(String(estimate.companyId || ''))
                    && !isCancelledDoc(estimate)
                )
                : fetchedEstimates.filter((estimate) => !isCancelledDoc(estimate));

            setEstimates(accountEstimates);
            setExistingInvoices(fetchedInvoices);
        } catch (err) {
            console.error("Failed to fetch estimates and invoices", err);
        }
    };
    useEffect(() => {
        fetchEstimates();
    }, [id]);

    useEffect(() => {
        if (id) {
            const fetchInvoice = async () => {
                const applyInvoiceToForm = (inv) => {
                    setIsEditMode(true);
                    setIsProformaEditMode(false);
                    setEditingProformaId('');
                    setEditingInvoiceId(inv._id || '');
                    setSelectedPi(inv.estimate_no || selectedPiFromUrl || '');
                    setResolvedSourceEstimateId(inv.source_estimate_id || '');
                    const linkedChallanIds = Array.isArray(inv.delivery_challan_ids)
                        ? inv.delivery_challan_ids.map(String)
                        : [];
                    setSelectedChallanIds(linkedChallanIds);
                    setIncludeDeliveryChallans(linkedChallanIds.length > 0);
                    setPoAvailable(!!inv.po_no);
                    setPoDate(inv.po_date ? new Date(inv.po_date).toISOString().split('T')[0] : '');
                    setShowPaymentReceivedDetails(inv.show_payment_details !== false);
                    const storedDays = (String(inv.payment_terms || '').match(/\d+/) || [])[0];
                    if (storedDays) {
                        setPendingDueDays(Number(storedDays));
                        setPartialDueDays(Number(storedDays));
                    }
                    setForm(f => ({
                        ...f,
                        companyId: inv.companyId || f.companyId,
                        clientName: inv.consignee_name || f.clientName,
                        gstin: inv.gst_no || f.gstin,
                        invoiceType: inv.type_of_invoice || 'Select Invoice Type',
                        invoiceNo: inv.invoice_no || 'Auto-generated on save',
                        invoiceDate: inv.invoice_date ? new Date(inv.invoice_date).toISOString().split('T')[0] : f.invoiceDate,
                        ewayBillNo: inv.eway_bill_no || f.ewayBillNo,
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
                    }));
                    if (inv.items && inv.items.length > 0) {
                        setItems(estimateItemsToInvoiceItems(inv.items || []));
                    }
                };

                if (selectedPiFromUrl) {
                    setSelectedPi(selectedPiFromUrl);
                    setIsEditMode(false);
                    setEditingInvoiceId('');
                    setIsProformaEditMode(false);
                    setEditingProformaId('');

                    if (sourceEstimateId) {
                        try {
                            const estRes = await api.get(`/api/estimates/${sourceEstimateId}`);
                            const estimate = estRes.data?.data || estRes.data;
                            if (estimate?._id) {
                                const estimateCompany = await loadClientLikeProforma(estimate.companyId).catch(() => ({}));
                                setSourceEstimate(estimate);
                                setResolvedSourceEstimateId(estimate._id);
                                setSelectedPi(selectedPiFromUrl);
                                addEstimateOption({ ...estimate, est_no: selectedPiFromUrl });
                                setForm(f => ({
                                    ...estimateToInvoiceForm(estimate, estimateCompany || {}, f),
                                    invoiceNo: 'Auto-generated on save',
                                    invoiceDate: estimate.supply_date ? new Date(estimate.supply_date).toISOString().split('T')[0] : f.invoiceDate,
                                    gstin: estimate.company_gst_no || estimate.gst_no || f.gstin,
                                    invoiceType: estimate.est_type || f.invoiceType,
                                }));
                                if (estimate.items && estimate.items.length > 0) {
                                    await applyEstimateItemsForNewInvoice(estimate);
                                }
                                return;
                            }
                        } catch (estimateErr) {
                            console.error("Failed to load source proforma for invoice", estimateErr);
                        }
                    }
                }

                try {
                    const res = await api.get(`/api/invoices/${id}`);
                    const inv = res.data?.data || res.data;
                    if (inv && inv._id) {
                        setSourceEstimate(null);
                        applyInvoiceToForm(inv);
                        return;
                    }
                } catch (err) {
                }

                setIsEditMode(false);
                setEditingInvoiceId('');
                try {
                    const estRes = await api.get(`/api/estimates/${id}`);
                    const estimate = estRes.data?.data || estRes.data;
                    if (estimate?._id) {
                        const estimateCompany = await loadClientLikeProforma(estimate.companyId).catch(() => ({}));
                        setSourceEstimate(estimate);
                        setResolvedSourceEstimateId(estimate._id);
                        setIsProformaEditMode(true);
                        setEditingProformaId(estimate._id);
                        setSelectedPi(estimate.est_no || '');
                        addEstimateOption(estimate);
                        setForm(f => ({
                            ...estimateToInvoiceForm(estimate, estimateCompany || {}, f),
                            invoiceNo: estimate.est_no || f.invoiceNo,
                            invoiceDate: estimate.supply_date ? new Date(estimate.supply_date).toISOString().split('T')[0] : f.invoiceDate,
                            gstin: estimate.company_gst_no || estimate.gst_no || f.gstin,
                            invoiceType: estimate.est_type || f.invoiceType,
                        }));
                        if (estimate.items && estimate.items.length > 0) {
                            setItems(estimateItemsToInvoiceItems(estimate.items || []));
                        }
                        return;
                    }
                } catch (estimateErr) {
                }

                setIsProformaEditMode(false);
                setEditingProformaId('');
                try {
                    const client = await loadClientLikeProforma(id);
                    if (client) {
                        setSelectedPi('');
                        setForm(f => clientToInvoiceForm(client, id, f));
                    }
                } catch (lookupErr) {
                    console.error("Failed to load company details for prefill", lookupErr);
                }
            };
            fetchInvoice();
        }
    }, [id, selectedPiFromUrl, sourceEstimateId]);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files || []);
        const oversized = selected.filter((file) => file.size > 25 * 1024 * 1024);
        if (oversized.length) {
            Swal.fire('File Too Large', `${oversized.map((file) => file.name).join(', ')} must be 25MB or smaller.`, 'warning');
        }
        setAttachedFiles((current) => [...current, ...selected.filter((file) => file.size <= 25 * 1024 * 1024)].slice(0, 10));
        e.target.value = '';
    };

    // ── form state ──────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        companyId: '',
        eventId: '',
        crmEventId: '',
        clientName: '',
        gstin: '',
        invoiceType: 'Select Invoice Type',
        invoiceNo: 'Auto-generated on save',
        invoiceDate: new Date().toISOString().split('T')[0],
        ewayBillNo: '',
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
        companyContactPerson: '',
        companyContactMobile: '',
        companyEmail: '',
        consignee_person: '',
        consignee_phone: '',
        consignee_email: '',
        consignee_country: '',
        consignee_state: '',
        consignee_city: '',
        consignee_pincode: '',
        event_gst_no: '',

    });

    const [items, setItems] = useState([newItem()]);
    const [showPreview, setShowPreview] = useState(false);
    useEffect(() => {
        if (!includeDeliveryChallans || !form.companyId || !resolvedSourceEstimateId) {
            setDeliveryChallans([]);
            setChallansError('');
            return;
        }

        let cancelled = false;
        const loadChallans = async () => {
            setChallansLoading(true);
            setChallansError('');
            try {
                const response = await api.get('/api/delivery-challans', {
                    params: {
                        companyId: form.companyId,
                        estimateId: resolvedSourceEstimateId,
                    },
                });
                if (cancelled) return;
                const eligible = (Array.isArray(response.data) ? response.data : [])
                    .filter((challan) => !isCancelledDoc(challan));
                setDeliveryChallans(eligible);
                setSelectedChallanIds((current) =>
                    current.filter((challanId) =>
                        eligible.some((challan) => String(challan._id) === String(challanId))
                    )
                );
            } catch (error) {
                if (!cancelled) {
                    setDeliveryChallans([]);
                    setChallansError(error.response?.data?.message || 'Unable to load delivery challans.');
                }
            } finally {
                if (!cancelled) setChallansLoading(false);
            }
        };
        loadChallans();
        return () => {
            cancelled = true;
        };
    }, [includeDeliveryChallans, form.companyId, resolvedSourceEstimateId]);

    // Compact mode: default to all delivery challans included rather than requiring manual selection
    useEffect(() => {
        if (compactMode && deliveryChallans.length) {
            setSelectedChallanIds(deliveryChallans.map((challan) => String(challan._id)));
        }
    }, [compactMode, deliveryChallans]);

    const returnListId = form.companyId || (!isEditMode && !isProformaEditMode ? id : '');
    const listRoute = isProformaEditMode
        ? -1
        : (returnListId ? `/invoice-list/${returnListId}` : '/invoice-list');
    const postSaveRoute = navigationState.returnTo || listRoute;
    const dropdownEstimates = selectedPiFromUrl && !estimates.some((estimate) => estimate.est_no === selectedPiFromUrl)
        ? [{ est_no: selectedPiFromUrl }, ...estimates]
        : estimates;
    const selectedEstimate = sourceEstimate?.est_no === selectedPi
        ? sourceEstimate
        : estimates.find((estimate) => estimate.est_no === selectedPi) || null;
    const selectedPrimaryStall = selectedEstimate?.items?.find((item) => item?.category !== 'Addon Product') || selectedEstimate?.items?.[0] || null;
    const selectedPlcPct = Number(selectedEstimate?.plcPct || 0);
    const selectedPlcCharges = Number(selectedEstimate?.plcCharges || 0)
        || ((Number(selectedPrimaryStall?.amount) || 0) * selectedPlcPct / 100);
    const selectedPlcGstPct = Number(selectedEstimate?.plcGstPct || 0) || 18;
    const selectedPlcGstAmount = Number(selectedEstimate?.plcGstAmount || 0)
        || (selectedPlcCharges * selectedPlcGstPct / 100);
    const selectedPlcFinalAmount = Number(selectedEstimate?.plcFinalAmount || 0)
        || selectedPlcCharges + selectedPlcGstAmount;
    const selectedTdsApplicable = selectedEstimate?.tdsApplicable !== false;
    const selectedInstalments = Array.isArray(selectedEstimate?.instalments) ? selectedEstimate.instalments : [];
    const selectedIsInstalmentPlan = selectedInstalments.length > 0
        || /instal/i.test(`${selectedEstimate?.paymentPlanLabel || ''} ${selectedEstimate?.paymentPlanType || ''}`);
    const selectedTdsLines = Array.isArray(selectedEstimate?.tdsLines) ? selectedEstimate.tdsLines : [];
    const selectedDeliveryChallans = deliveryChallans.filter((challan) =>
        selectedChallanIds.includes(String(challan._id))
    );
    const previewDeliveryChallans = selectedDeliveryChallans.map((challan) => ({
        delivery_challan_id: String(challan._id),
        challan_no: challan.challan_no,
        challan_date: challan.challan_date,
        status: challan.status,
        delivery_address: challan.delivery_address,
        transporter_name: challan.transporter_name,
        vehicle_no: challan.vehicle_no,
        eway_bill: challan.eway_bill,
        bilty_no: challan.bilty_no,
        items: challan.items || [],
    }));

    const getInvoicesForSplit = useCallback(async () => {
        if (existingInvoices.length > 0) return existingInvoices;
        try {
            const invRes = await api.get('/api/invoices');
            const fetchedInvoices = Array.isArray(invRes.data) ? invRes.data : (invRes.data?.data || []);
            setExistingInvoices(fetchedInvoices);
            return fetchedInvoices;
        } catch (error) {
            console.error("Failed to fetch invoices for split billing", error);
            return [];
        }
    }, [existingInvoices]);

    const buildRemainingInvoiceItems = useCallback(async (estimate) => {
        const invoiceList = await getInvoicesForSplit();
        const usedQtyByKey = new Map();
        invoiceList
            .filter((invoice) => {
                if (isCancelledDoc(invoice)) return false;
                if (invoice.companyId && estimate.companyId && String(invoice.companyId) !== String(estimate.companyId)) return false;
                return invoice.estimate_no === estimate.est_no || String(invoice.source_estimate_id || '') === String(estimate._id || '');
            })
            .forEach((invoice) => {
                (invoice.items || []).forEach((item) => {
                    const key = getItemKey(item);
                    usedQtyByKey.set(key, (usedQtyByKey.get(key) || 0) + (Number(item.qty) || 0));
                });
            });

        const sourceItems = estimateItemsToInvoiceItems(estimate.items || []);
        const plcItem = getEstimatePlcItem(estimate);
        if (plcItem) sourceItems.push(plcItem);
        return sourceItems
            .map((item) => {
                const remainingQty = Math.max(0, (Number(item.qty) || 0) - (usedQtyByKey.get(getItemKey(item)) || 0));
                return {
                    ...recalculateItemForQty(item, remainingQty),
                    maxQty: remainingQty,
                };
            })
            .filter((item) => Number(item.qty) > 0);
    }, [getInvoicesForSplit]);

    const applyEstimateItemsForNewInvoice = useCallback(async (estimate) => {
        const remainingItems = await buildRemainingInvoiceItems(estimate);
        if (remainingItems.length > 0) {
            setItems(remainingItems);
            return;
        }
        setItems([newItem()]);
        Swal.fire('Fully Invoiced', 'All items from this proforma invoice are already invoiced.', 'info');
    }, [buildRemainingInvoiceItems]);

    // ── handlers ────────────────────────────────────────────────────────────────
    const handlePiSelect = async (estNo) => {
        setSelectedPi(estNo);
        setSelectedChallanIds([]);
        setIncludeDeliveryChallans(false);
        if (!estNo) {
            setResolvedSourceEstimateId('');
            return;
        }

        const estimateOption = estimates.find(e => e.est_no === estNo);
        if (estimateOption) {
            let est = estimateOption;
            try {
                const detailResponse = await api.get(`/api/estimates/${estimateOption._id}`);
                est = detailResponse.data?.data || detailResponse.data || estimateOption;
            } catch (error) {
                console.warn('Could not load complete proforma details; using the selected record.', error);
            }
            setSourceEstimate(est);
            const estimateCompany = await loadClientLikeProforma(est.companyId).catch(() => ({}));
            setResolvedSourceEstimateId(est._id || '');
            setForm(f => ({
                ...estimateToInvoiceForm(est, estimateCompany || {}, f),
                companyId: est.companyId || f.companyId,
                clientName: est.company_name || est.consignee_name || f.clientName,
                gstin: est.company_gst_no || est.gst_no || f.gstin,
                billingAddress: est.company_addr || est.consignee_addr || f.billingAddress,
                shippingAddress: est.consignee_addr || est.company_addr || f.shippingAddress,
                country: est.country || f.country,
                state: est.state || f.state,
                billingState: est.state || f.billingState,
                placeOfSupply: est.state ? (est.state.toLowerCase().includes('delhi') ? 'Delhi (07)' : est.state.toLowerCase().includes('maharashtra') ? 'Maharashtra (27)' : est.state.toLowerCase().includes('uttar') ? 'Uttar Pradesh (09)' : est.state.toLowerCase().includes('haryana') ? 'Haryana (06)' : est.state) : f.placeOfSupply,
                city: est.city || f.city,
                billingPin: est.pincode || f.billingPin,
                remarks: est.remarks || f.remarks,
                invoiceType: est.est_type || f.invoiceType,
                company_name: est.company_name || f.company_name,
                company_addr: est.company_addr || f.company_addr,
                event_name: est.event_name || f.event_name,
                consignee_name: est.consignee_name || est.event_name || '',
                consignee_addr: est.consignee_addr || est.event_place_of_supply || '',
                consignee_person: est.consignee_person || '',
                consignee_phone: est.consignee_phone || '',
                consignee_email: est.consignee_email || '',
                consignee_country: est.consignee_country || '',
                consignee_state: est.consignee_state || '',
                consignee_city: est.consignee_city || '',
                consignee_pincode: est.consignee_pincode || '',
                event_gst_no: est.event_gst_no || '',
                companyContactPerson: est.company_contact_person || estimateCompany?.contactPerson || f.companyContactPerson,
                companyContactMobile: est.company_contact_mobile || estimateCompany?.mobile || estimateCompany?.contact1?.mobile || f.companyContactMobile,
                companyEmail: est.company_email || estimateCompany?.email || estimateCompany?.companyEmail || f.companyEmail,
                invoiceDate: est.supply_date ? new Date(est.supply_date).toISOString().split('T')[0] : f.invoiceDate,
                poNo: est.po_no || est.poNo || f.poNo,
                currency: String(est.country || '').toLowerCase() === 'india' ? 'INR - Indian Rupee (₹)' : 'USD - US Dollar ($)',
            }));

            if (est.items && est.items.length > 0) {
                await applyEstimateItemsForNewInvoice(est);
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
                const rawQty = Number(field === 'qty' ? val : updated.qty) || 0;
                const qty = Number(updated.maxQty) > 0 ? Math.min(rawQty, Number(updated.maxQty)) : rawQty;
                updated.qty = qty;
                const area = Number(field === 'area' ? val : updated.area) || 0;
                const discountPct = Number(field === 'discountPct' ? val : updated.discountPct) || 0;

                const multiplier = SIZE_BASED_UNITS.includes(updated.unit)
                    ? (area > 0 ? area : (!isNaN(Number(updated.size)) && Number(updated.size) > 0 ? Number(updated.size) : 1))
                    : 1;
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
    const toggleDeliveryChallan = (challanId) => {
        const value = String(challanId);
        setSelectedChallanIds((current) =>
            current.includes(value)
                ? current.filter((idValue) => idValue !== value)
                : [...current, value]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEditMode && !isProformaEditMode && !selectedPi) {
            Swal.fire('Proforma Invoice Required', 'Please select a Proforma Invoice number first.', 'warning');
            return;
        }

        if (!isProformaEditMode && includeDeliveryChallans && selectedChallanIds.length === 0) {
            Swal.fire('Delivery Challan Required', 'Select at least one delivery challan or choose No.', 'warning');
            return;
        }

        let finalAmount = items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);

        if (isProformaEditMode) {
            const isIntrastate = form.invoiceType === 'Intrastate';
            const transformedItems = items.map((item) => {
                const taxableValue = Number(item.taxableValue) || 0;
                const totalGstRate = parseFloat(item.gstPct) || 0;
                const gstAmount = taxableValue * (totalGstRate / 100);

                return {
                    description: item.description,
                    hsn: item.hsn,
                    qty: Number(item.qty),
                    size: item.size,
                    area: item.area,
                    unit: item.unit,
                    rate: Number(item.rate),
                    amount: Number(item.amount).toFixed(2),
                    disc: String(Number(item.discountPct) || 0),
                    tax: taxableValue.toFixed(2),
                    gstRate: String(totalGstRate),
                    gstPct: item.gstPct,
                    gstAmount: gstAmount.toFixed(2),
                    finalAmount: Number(item.total || 0).toFixed(2),
                    total: Number(item.total || 0),
                    cgst: isIntrastate ? (gstAmount / 2).toFixed(2) : gstAmount.toFixed(2),
                    cgst_per: isIntrastate ? (totalGstRate / 2).toFixed(0) : '0',
                    igst_per: isIntrastate ? '0' : totalGstRate.toFixed(0),
                    remarks: item.remarks || '',
                };
            });

            const proformaPayload = {
                companyId: form.companyId || id,
                est_no: selectedPi,
                est_type: form.invoiceType,
                gst_no: form.gstin,
                company_gst_no: form.gstin,
                supply_date: form.invoiceDate,
                company_name: form.company_name || form.clientName,
                company_addr: form.company_addr || form.billingAddress,
                event_name: form.event_name || form.consignee_name,
                event_place_of_supply: form.consignee_addr || form.shippingAddress,
                consignee_name: form.consignee_name || form.event_name || form.clientName,
                consignee_addr: form.sameAsBilling ? form.company_addr : (form.consignee_addr || form.shippingAddress),
                country: form.country,
                state: form.state,
                city: form.city,
                pincode: form.billingPin,
                remarks: form.remarks,
                terms: form.terms,
                finalAmount,
                items: transformedItems,
                updated_by: getCurrentUserName(),
            };

            try {
                const res = await api.put(`/api/estimates/${editingProformaId || id}`, proformaPayload);
                if (res.status === 200 || res.status === 201) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Updated!',
                        text: 'Proforma invoice updated successfully.',
                        confirmButtonColor: '#194090',
                    });
                    navigate(-1);
                }
            } catch (err) {
                console.error(err);
                await Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: err.response?.data?.message || err.message || 'Failed to update proforma invoice.',
                    confirmButtonColor: '#194090',
                });
            }
            return;
        }

        // CrmEvent this Invoice belongs to — carried via query param when reached
        // straight from the client's Account tab (no source estimate to derive it
        // from server-side). Only sent on create; edit mode must not touch it.
        const crmEventId = new URLSearchParams(location.search).get('crmEventId') || '';

        const computedDueDate = (() => {
            const base = form.invoiceDate ? new Date(form.invoiceDate) : new Date();
            base.setDate(base.getDate() + (Number(activeDueDays) || 0));
            return base.toISOString().split('T')[0];
        })();

        const payload = {
            companyId: form.companyId || id,
            ...(!isEditMode && (crmEventId || form.crmEventId) ? { crmEventId: crmEventId || form.crmEventId } : {}),
            ...(!isEditMode && form.eventId ? { eventId: form.eventId } : {}),
            source_estimate_id: resolvedSourceEstimateId || sourceEstimateId || '',
            estimate_no: selectedPi || '',
            delivery_challan_ids: includeDeliveryChallans ? selectedChallanIds : [],
            type_of_invoice: form.invoiceType,
            invoice_date: form.invoiceDate,
            eway_bill_no: form.ewayBillNo,
            po_no: poAvailable ? form.poNo : '',
            ...(compactMode ? {
                po_date: poAvailable ? poDate : null,
                payment_terms: paymentTerms,
                payment_status: paymentStatusOption === 'received' ? 'paid' : paymentStatusOption === 'partial' ? 'partial' : 'pending',
                payment_due_date: paymentStatusOption !== 'received' ? computedDueDate : null,
                show_payment_details: showPaymentReceivedDetails,
            } : {}),
            currency: form.currency,
            gst_no: form.gstin,
            company_name: form.company_name || form.clientName,
            company_addr: form.company_addr || form.billingAddress,
            company_gst_no: form.gstin,
            event_name: form.event_name || form.consignee_name,
            event_place_of_supply: form.consignee_addr || form.shippingAddress,
            supply_date: form.invoiceDate,
            consignee_name: form.consignee_name || form.event_name || form.clientName,
            consignee_addr: form.sameAsBilling ? form.company_addr : (form.consignee_addr || form.shippingAddress),
            billing_address: form.company_addr || form.billingAddress,
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
                category: i.category || '',
                plScheme: i.plScheme || '',
                stallType: i.stallType || '',
            })),
            finalAmount: finalAmount,
            added_by: getCurrentUserName(),
            updated_by: getCurrentUserName(),
        };

        // Issued invoices can only have these administrative fields corrected —
        // everything else (items, amounts, GST, company/consignee details) is
        // locked server-side once an invoice exists. Keep this in sync with
        // ADMIN_EDITABLE_INVOICE_FIELDS in invoiceController.js.
        const editPayload = {
            po_no: poAvailable ? form.poNo : '',
            po_date: poAvailable ? poDate : null,
            payment_terms: paymentTerms,
            payment_status: paymentStatusOption === 'received' ? 'paid' : paymentStatusOption === 'partial' ? 'partial' : 'pending',
            payment_due_date: paymentStatusOption !== 'received' ? computedDueDate : null,
            show_payment_details: showPaymentReceivedDetails,
            delivery_challan_ids: includeDeliveryChallans ? selectedChallanIds : [],
        };

        try {
            let res;
            if (isEditMode) {
                res = await api.put(`/api/invoices/${editingInvoiceId || id}`, editPayload);
                if (res.status === 200 || res.status === 201) {
                    if (poAvailable && poAttachmentFile) {
                        const poAttachmentData = new FormData();
                        poAttachmentData.append('po_attachment', poAttachmentFile);
                        try {
                            await api.post(`/api/invoices/${editingInvoiceId || id}/po-attachment`, poAttachmentData, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                            });
                        } catch (poAttachmentError) {
                            console.error('Failed to upload PO attachment while editing', poAttachmentError);
                        }
                    }
                    await Swal.fire({
                        icon: 'success',
                        title: 'Updated!',
                        text: 'Invoice updated successfully.',
                        confirmButtonColor: '#194090',
                    });
                    navigate(postSaveRoute);
                }
            } else {
                res = await api.post('/api/invoices', payload);
                if (res.status === 201 || res.status === 200) {
                    const createdInvoiceId = res.data?.data?._id || res.data?._id;
                    let attachmentWarning = '';
                    if (createdInvoiceId && attachedFiles.length) {
                        const attachmentData = new FormData();
                        attachedFiles.forEach((file) => attachmentData.append('attachments', file));
                        try {
                            await api.post(`/api/invoices/${createdInvoiceId}/attachments`, attachmentData, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                            });
                        } catch (attachmentError) {
                            attachmentWarning = attachmentError.response?.data?.message || 'Invoice was created, but attachments could not be uploaded.';
                        }
                    }
                    if (createdInvoiceId && compactMode && poAvailable && poAttachmentFile) {
                        const poAttachmentData = new FormData();
                        poAttachmentData.append('po_attachment', poAttachmentFile);
                        try {
                            await api.post(`/api/invoices/${createdInvoiceId}/po-attachment`, poAttachmentData, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                            });
                        } catch (poAttachmentError) {
                            attachmentWarning = attachmentWarning || poAttachmentError.response?.data?.message || 'Invoice was created, but the PO file could not be uploaded.';
                        }
                    }
                    if (createdInvoiceId && compactMode && (paymentStatusOption === 'received' || paymentStatusOption === 'partial') && Number(amountReceived) > 0) {
                        try {
                            await api.post('/api/payments', {
                                invoice_id: createdInvoiceId,
                                companyId: form.companyId || id,
                                f_amount: String(finalAmount),
                                amount_text: String(amountReceived),
                                payment_date: new Date().toISOString().split('T')[0],
                                payment_mode: 'Manual Entry',
                                received_by: getCurrentUserName(),
                            });
                        } catch (paymentError) {
                            attachmentWarning = attachmentWarning || paymentError.response?.data?.message || 'Invoice was created, but the payment receipt could not be recorded.';
                        }
                    }
                    await Swal.fire({
                        icon: attachmentWarning ? 'warning' : 'success',
                        title: 'Invoice Generated!',
                        text: attachmentWarning ? `Invoice generated successfully. ${attachmentWarning}` : 'Invoice generated successfully.',
                        confirmButtonColor: '#194090',
                    });
                    navigate(createdInvoiceId ? `/payments/invoiceDetails/${createdInvoiceId}` : postSaveRoute);
                }
            }
        } catch (err) {
            console.error(err);
            const existingInvoiceId = err.response?.data?.existingInvoiceId;
            if (!isEditMode && existingInvoiceId) {
                if (attachedFiles.length) {
                    const attachmentData = new FormData();
                    attachedFiles.forEach((file) => attachmentData.append('attachments', file));
                    try {
                        await api.post(`/api/invoices/${existingInvoiceId}/attachments`, attachmentData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                    } catch (attachmentError) {
                        console.error('Failed to attach files to the already-created invoice', attachmentError);
                    }
                }
                await Swal.fire('Invoice Already Generated', `Opening ${err.response?.data?.existingInvoiceNo || 'the existing invoice'}.`, 'info');
                navigate(`/payments/invoiceDetails/${existingInvoiceId}`);
                return;
            }
            await Swal.fire({
                icon: 'error',
                title: isEditMode ? 'Update Failed' : 'Generation Failed',
                text: err.response?.data?.message || err.message || `Failed to ${isEditMode ? 'update' : 'generate'} invoice.`,
                confirmButtonColor: '#194090',
            });
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

    // Compact mode: auto-select the Payment Status based on payments already recorded against this PI
    useEffect(() => {
        if (!compactMode || !resolvedSourceEstimateId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get('/api/payments');
                const payments = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                const totalReceived = payments
                    .filter((payment) => String(payment.invoice_id || '') === String(resolvedSourceEstimateId))
                    .reduce((sum, payment) => sum + (parseFloat(payment.amount_text) || 0), 0);
                if (cancelled) return;
                if (totalReceived <= 0) {
                    setPaymentStatusOption('pending');
                } else if (sumTotal > 0 && totalReceived >= sumTotal - 1) {
                    setPaymentStatusOption('received');
                } else {
                    setPaymentStatusOption('partial');
                    setAmountReceived(String(totalReceived));
                }
            } catch (error) {
                console.error('Failed to load existing payments for this PI', error);
            }
        })();
        return () => { cancelled = true; };
    }, [compactMode, resolvedSourceEstimateId, sumTotal]);

    const refreshChallans = async () => {
        if (!form.companyId || !resolvedSourceEstimateId) return;
        setChallansLoading(true);
        setChallansError('');
        try {
            const response = await api.get('/api/delivery-challans', {
                params: { companyId: form.companyId, estimateId: resolvedSourceEstimateId },
            });
            const eligible = (Array.isArray(response.data) ? response.data : []).filter((challan) => !isCancelledDoc(challan));
            setDeliveryChallans(eligible);
        } catch (error) {
            setChallansError(error.response?.data?.message || 'Unable to load delivery challans.');
        } finally {
            setChallansLoading(false);
        }
    };

    const amountReceivedValue = paymentStatusOption === 'received'
        ? sumTotal
        : paymentStatusOption === 'partial'
            ? (Number(amountReceived) || 0)
            : 0;
    const outstandingAmountValue = Math.max(sumTotal - amountReceivedValue, 0);

    if (compactMode) {
        return (
            <div className="bg-white">
                <style>
                    {`
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    `}
                </style>
                <div className="px-6 pt-6 pb-4 pr-14 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#194090] flex items-center justify-center shrink-0">
                                <IndianRupee className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 leading-tight">Create Tax Invoice from Proforma Invoice</h1>
                                <p className="text-xs text-gray-500 mt-0.5">Please provide the additional details to generate the Tax Invoice.</p>
                            </div>
                        </div>
                        <div className="w-[220px] shrink-0 hidden">
                            <Label required>Select Proforma Invoice</Label>
                            <SearchableDropdown
                                compact
                                value={selectedPi}
                                onChange={(e) => handlePiSelect(e.target.value)}
                                options={[
                                    { label: 'Select Proforma Invoice', value: '' },
                                    ...dropdownEstimates.map(e => ({ label: e.est_no, value: e.est_no }))
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {!selectedPi && (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-10 text-center">
                            <p className="text-sm font-semibold text-gray-600">Select a Proforma Invoice above to continue</p>
                            <p className="mt-1 text-xs text-gray-400">Purchase order, delivery challan, and payment details will appear once a PI is selected.</p>
                        </div>
                    )}

                    {selectedPi && (
                    <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* 1. Purchase Order */}
                        <div className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <ClipboardList size={14} />
                                </div>
                                <h3 className="text-[13px] font-bold text-emerald-700">1. Purchase Order</h3>
                            </div>
                            <Label>PO Available?</Label>
                            <div className="flex items-center gap-4 mb-3">
                                <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                                    <input type="radio" checked={poAvailable} onChange={() => setPoAvailable(true)} /> Yes
                                </label>
                                <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                                    <input type="radio" checked={!poAvailable} onChange={() => setPoAvailable(false)} /> No
                                </label>
                            </div>
                            {poAvailable && (
                                <>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <Label>PO Number</Label>
                                            <input
                                                className="w-full appearance-none border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[34px]"
                                                placeholder="Enter PO Number"
                                                value={form.poNo}
                                                onChange={(e) => setField('poNo', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>PO Date</Label>
                                            <input
                                                type="date"
                                                className="w-full appearance-none border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[34px]"
                                                value={poDate}
                                                onChange={(e) => setPoDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Label>Attach PO (Optional)</Label>
                                    <input type="file" ref={poFileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setPoAttachmentFile(e.target.files?.[0] || null)} />
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => poFileInputRef.current?.click()} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-[#194090] bg-white shadow-sm hover:bg-gray-50">
                                            <Upload size={13} /> Upload File
                                        </button>
                                        <span className="text-[10px] text-gray-400">{poAttachmentFile ? poAttachmentFile.name : '(PDF, JPG, PNG)'}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 2. Delivery Challans */}
                        <div className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <Truck size={14} />
                                </div>
                                <h3 className="text-[13px] font-bold text-purple-700">2. Delivery Challans</h3>
                            </div>
                            <Label>Delivery Challan Applicable?</Label>
                            <div className="flex items-center gap-4 mb-3">
                                <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                                    <input type="radio" checked={includeDeliveryChallans} onChange={() => setIncludeDeliveryChallans(true)} /> Yes
                                </label>
                                <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                                    <input type="radio" checked={!includeDeliveryChallans} onChange={() => { setIncludeDeliveryChallans(false); setSelectedChallanIds([]); }} /> No
                                </label>
                            </div>
                            {includeDeliveryChallans && (
                                !resolvedSourceEstimateId ? (
                                    <p className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-700">Select a Proforma Invoice first.</p>
                                ) : challansLoading ? (
                                    <p className="p-3 text-center text-[11px] text-slate-500">Loading delivery challans...</p>
                                ) : challansError ? (
                                    <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-[11px] text-red-700">{challansError}</p>
                                ) : deliveryChallans.filter((c) => selectedChallanIds.includes(String(c._id))).length === 0 ? (
                                    <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center text-[11px] text-slate-500">No delivery challans linked yet.</p>
                                ) : (
                                    <div className="overflow-x-auto -mx-1">
                                        <table className="w-full text-[11px]">
                                            <thead>
                                                <tr className="text-slate-500 border-b border-gray-100">
                                                    <th className="text-left font-semibold px-1 py-1.5">Challan No.</th>
                                                    <th className="text-left font-semibold px-1 py-1.5">Date</th>
                                                    <th className="text-left font-semibold px-1 py-1.5">E-Way Bill No.</th>
                                                    <th className="text-left font-semibold px-1 py-1.5">File</th>
                                                    <th className="text-center font-semibold px-1 py-1.5">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {deliveryChallans.filter((c) => selectedChallanIds.includes(String(c._id))).map((challan) => (
                                                    <tr key={challan._id} className="border-b border-gray-50 last:border-0">
                                                        <td className="px-1 py-1.5 font-semibold text-[#194090]">{challan.challan_no}</td>
                                                        <td className="px-1 py-1.5 text-slate-600">{challan.challan_date ? new Date(challan.challan_date).toLocaleDateString('en-GB') : '—'}</td>
                                                        <td className="px-1 py-1.5 text-slate-600">{challan.eway_bill || '—'}</td>
                                                        <td className="px-1 py-1.5">
                                                            {challan.attachment?.url ? (
                                                                <a href={`${api.defaults.baseURL || ''}${challan.attachment.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#194090] font-semibold hover:underline">
                                                                    <Paperclip size={11} /> {challan.attachment.originalName?.slice(0, 12) || 'File'}
                                                                </a>
                                                            ) : <span className="text-slate-300">—</span>}
                                                        </td>
                                                        <td className="px-1 py-1.5 text-center">
                                                            <button type="button" onClick={() => toggleDeliveryChallan(challan._id)} className="text-red-500 hover:text-red-700" title="Remove from this invoice">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}
                            {includeDeliveryChallans && (
                                <p className="mt-3 flex items-start gap-1.5 text-[10px] text-slate-400">
                                    <Info size={12} className="shrink-0 mt-0.5" /> Delivery challans linked to this Proforma Invoice are listed here automatically.
                                </p>
                            )}
                            {includeDeliveryChallans && resolvedSourceEstimateId && (
                                <button type="button" onClick={refreshChallans} className="mt-2 text-[10px] font-bold text-[#194090] hover:underline">
                                    Refresh challan list
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* 4. Payment Details / Receipts */}
                        <div className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <CreditCard size={14} />
                                        </div>
                                        <h3 className="text-[13px] font-bold text-blue-700">4. Payment Details / Receipts</h3>
                                    </div>
                                    <Label>Select Payment Status</Label>
                                    <label className="mt-1 flex items-center gap-1.5 cursor-pointer select-none w-fit">
                                        <span className={`relative inline-flex h-4 w-8 items-center rounded-full transition ${showPaymentReceivedDetails ? 'bg-[#194090]' : 'bg-gray-300'}`}>
                                            <input
                                                type="checkbox"
                                                checked={showPaymentReceivedDetails}
                                                onChange={(e) => setShowPaymentReceivedDetails(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${showPaymentReceivedDetails ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                        </span>
                                        <span className="text-[12px] font-bold text-slate-700">Show Payment Received Details on Invoice</span>
                                    </label>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 max-w-[420px]">
                                    <p className="text-[10px] text-slate-500">
                                        TDS, if applicable, shall be deducted on the taxable/basic value (excluding GST) at the applicable rate under the Income Tax Act, 1961.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-stretch">
                                <label className={`block h-full rounded-lg border p-2.5 transition ${paymentStatusOption === 'received' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <input type="radio" checked={paymentStatusOption === 'received'} disabled readOnly />
                                        <CheckCircle2 size={14} className="text-emerald-600" />
                                        <span className="text-[12px] font-bold text-[#1a2b4b]">Payment Received</span>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Paid in Full</span>
                                    </div>
                                    <p className="mt-1.5 pl-6 text-[10px] text-slate-500">
                                        Payment Terms: Payment received as per agreed installment plan.<br />
                                        Payment Status: Paid in Full.
                                    </p>
                                </label>
                                <label className={`block h-full rounded-lg border p-2.5 transition ${paymentStatusOption === 'pending' ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <input type="radio" checked={paymentStatusOption === 'pending'} disabled readOnly />
                                        <span className="text-[12px] font-bold text-[#1a2b4b]">Full Payment Pending</span>
                                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-700">Payment Pending</span>
                                    </div>
                                    <p className="mt-1.5 pl-6 text-[10px] text-slate-500 flex items-center flex-wrap gap-1">
                                        Payment Terms: Payment due within
                                        <input
                                            type="number"
                                            min={0}
                                            value={pendingDueDays}
                                            disabled={paymentStatusOption !== 'pending'}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setPendingDueDays(e.target.value)}
                                            className="w-10 border border-amber-300 bg-amber-50 text-amber-900 font-bold rounded px-1 py-0.5 text-[10px] text-center focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400"
                                        />
                                        days from the Invoice Date.
                                    </p>
                                    <div className="mt-2 pl-6">
                                        <Label>Outstanding Amount</Label>
                                        <input readOnly onClick={(e) => e.stopPropagation()} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[11px] h-[30px] bg-gray-50 text-gray-500" value={Math.round(sumTotal).toLocaleString('en-IN')} />
                                    </div>
                                </label>
                                <label className={`block h-full rounded-lg border p-2.5 transition ${paymentStatusOption === 'partial' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <input type="radio" checked={paymentStatusOption === 'partial'} disabled readOnly />
                                        <span className="text-[12px] font-bold text-[#1a2b4b]">Partially Paid</span>
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">Partially Paid</span>
                                    </div>
                                    <p className="mt-1.5 pl-6 text-[10px] text-slate-500 flex items-center flex-wrap gap-1">
                                        Payment Terms: Balance payment due within
                                        <input
                                            type="number"
                                            min={0}
                                            value={partialDueDays}
                                            disabled={paymentStatusOption !== 'partial'}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setPartialDueDays(e.target.value)}
                                            className="w-10 border border-amber-300 bg-amber-50 text-amber-900 font-bold rounded px-1 py-0.5 text-[10px] text-center focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400"
                                        />
                                        days from the Invoice Date.
                                    </p>
                                    <div className="mt-2 pl-6 grid grid-cols-2 gap-2">
                                        <div>
                                            <Label>Amt. Received</Label>
                                            <input type="number" min={0} max={sumTotal} disabled={paymentStatusOption !== 'partial'} onClick={(e) => e.stopPropagation()} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[11px] h-[30px] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400" placeholder="Enter Amount" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Outstanding Amt.</Label>
                                            <input readOnly onClick={(e) => e.stopPropagation()} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[11px] h-[30px] bg-gray-50 text-gray-500" value={Math.round(outstandingAmountValue).toLocaleString('en-IN')} />
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Summary bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100 rounded-xl border border-gray-200 bg-gray-50/60">
                        <div className="flex items-center gap-2 px-4 py-3">
                            <Calculator size={16} className="text-slate-500" />
                            <div>
                                <p className="text-[10px] text-slate-500">Taxable Amount</p>
                                <p className="text-[13px] font-bold text-slate-700">{Math.round(sumTaxable).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3">
                            <Receipt size={16} className="text-slate-500" />
                            <div>
                                <p className="text-[10px] text-slate-500">GST Amount</p>
                                <p className="text-[13px] font-bold text-slate-700">{Math.round(sumGst).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3">
                            <ClipboardList size={16} className="text-[#194090]" />
                            <div>
                                <p className="text-[10px] text-slate-500">Invoice Amount</p>
                                <p className="text-[13px] font-bold text-[#194090]">{Math.round(sumTotal).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <div>
                                <p className="text-[10px] text-slate-500">Amount Received</p>
                                <p className="text-[13px] font-bold text-emerald-600">{Math.round(amountReceivedValue).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3">
                            <Wallet size={16} className="text-red-500" />
                            <div>
                                <p className="text-[10px] text-slate-500">Outstanding Amount</p>
                                <p className="text-[13px] font-bold text-red-500">{Math.round(outstandingAmountValue).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button type="button" onClick={() => navigate(-1)} className="border border-gray-300 rounded-lg px-5 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm">
                            Cancel
                        </button>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg px-4 py-2 text-[12px] font-bold hover:bg-blue-100 transition shadow-sm">
                                <Eye size={14} /> Preview Invoice
                            </button>
                            <button type="submit" className="flex items-center gap-1.5 bg-[#194090] hover:bg-[#112f6b] text-white rounded-lg px-5 py-2 text-[12px] font-bold transition shadow-sm">
                                <FileText size={14} /> Create Tax Invoice
                            </button>
                        </div>
                    </div>
                    </>
                    )}
                </form>

                {showPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1050px] max-h-[90vh] overflow-y-auto mt-10 p-6 relative">
                            <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 z-50 bg-white rounded-full p-1 text-gray-500 hover:text-red-500 shadow-sm border">
                                <XIcon size={24} />
                            </button>
                            <div className="pt-8">
                                <InvoicePreviewTemplate form={{ ...form, delivery_challans: previewDeliveryChallans }} items={items} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

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
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">{isProformaEditMode ? 'Edit Proforma Invoice' : 'Create Invoice'}</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{isProformaEditMode ? 'Update proforma invoice details' : 'Generate a new invoice for your client'}</p>
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
                    onClick={() => navigate(listRoute)}
                    className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to List
                </button>
            </div>

            <div className="w-full px-4 pt-3 flex items-start">

                {/* ── LEFT FORM ── */}
                <form onSubmit={handleSubmit} className="flex-1 space-y-3 min-w-0">

                    {/* SECTION 1 – Invoice Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                                {(isEditMode || isProformaEditMode) ? (
                                    <Input value={selectedPi || 'No PI / Estimate'} disabled />
                                ) : (
                                    <SearchableDropdown
                                        value={selectedPi}
                                        onChange={(e) => handlePiSelect(e.target.value)}
                                        options={[
                                            { label: 'Select Existing PI / Estimate', value: '' },
                                            ...dropdownEstimates.map(e => ({ label: e.est_no, value: e.est_no }))
                                        ]}
                                    />
                                )}
                            </div>
                            <div>
                                <Label>GSTIN / PAN No.</Label>
                                <Input value={form.gstin} disabled />
                            </div>
                            <div>
                                <Label required>Invoice Type</Label>
                                <Select required disabled options={['Select Invoice Type', 'Intrastate', 'Interstate Sale', 'Foreign Sale']} value={form.invoiceType} />
                            </div>
                            <div>
                                <Label required>Invoice No.</Label>
                                <div className="flex h-[32px]">
                                    <Input required value={form.invoiceNo} onChange={(e) => setField('invoiceNo', e.target.value)} disabled className="rounded-r-none border-r-0 focus:z-10" />
                                    <button type="button" className="border border-gray-200 rounded-r-lg px-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center shrink-0">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <Label required>Invoice Date</Label>
                                <div className="relative">
                                    <Input required disabled type="date" value={form.invoiceDate} className="py-2.5" />
                                </div>
                            </div>
                            <div>
                                <Label>Purchase Order No.</Label>
                                <Input placeholder="Enter PO No. (Optional)" value={form.poNo} onChange={(e) => setField('poNo', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Currency</Label>
                                <Select required disabled options={['INR - Indian Rupee (₹)', 'USD - US Dollar ($)']} value={form.currency} className="py-2.5" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2 – Billing & Shipping Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
                        <SectionHead num="2" label="Billing & Shipping Details" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="border border-gray-100 rounded-lg p-4 bg-white">
                                <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-3">Company / Billing Details</h4>
                                <div className="space-y-3">
                                    <div><Label>Company Name</Label><ReadOnlyValue>{form.company_name || form.clientName}</ReadOnlyValue></div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div><Label>Contact Person</Label><Input disabled value={form.companyContactPerson} /></div>
                                        <div><Label>Mobile No.</Label><Input disabled value={form.companyContactMobile} /></div>
                                        <div><Label>Email</Label><Input disabled value={form.companyEmail} /></div>
                                    </div>
                                    <div><Label>Address</Label><Input disabled value={form.company_addr || form.billingAddress} /></div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div><Label>Country</Label><Input disabled value={form.country} /></div>
                                        <div><Label>State</Label><Input disabled value={form.state} /></div>
                                        <div><Label>City</Label><Input disabled value={form.city} /></div>
                                        <div><Label>Pin Code</Label><Input disabled value={form.billingPin} /></div>
                                    </div>
                                    <div><Label>GSTIN No. / PAN No.</Label><Input disabled value={form.gstin} /></div>
                                </div>
                            </div>

                            <div className="border border-gray-100 rounded-lg p-4 bg-white">
                                <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-3">Consignee Details</h4>
                                <div className="space-y-3">
                                    <div><Label>Consignee Name</Label><ReadOnlyValue>{form.consignee_name || form.event_name}</ReadOnlyValue></div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div><Label>Contact Person</Label><Input disabled value={form.consignee_person} /></div>
                                        <div><Label>Mobile No.</Label><Input disabled value={form.consignee_phone} /></div>
                                        <div><Label>Email</Label><Input disabled value={form.consignee_email} /></div>
                                    </div>
                                    <div><Label>Consignee Address</Label><Input disabled value={form.consignee_addr || form.shippingAddress} /></div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div><Label>Country</Label><Input disabled value={form.consignee_country} /></div>
                                        <div><Label>State</Label><Input disabled value={form.consignee_state} /></div>
                                        <div><Label>City</Label><Input disabled value={form.consignee_city} /></div>
                                        <div><Label>Pin Code</Label><Input disabled value={form.consignee_pincode} /></div>
                                    </div>
                                    <div><Label>GSTIN / UIN</Label><Input disabled value={form.event_gst_no} /></div>
                                </div>
                            </div>
                        </div>

                        <div className="hidden">
                            <div>
                                <Label required>Billing Address</Label>
                                <textarea
                                    required
                                    disabled
                                    value={form.company_addr}
                                    onChange={(e) => setField('company_addr', e.target.value)}
                                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all resize-y h-[60px]"
                                />
                            </div>
                            <div>
                                <Label>Shipping / Consignee Address</Label>
                                <textarea
                                    disabled
                                    placeholder={form.sameAsBilling ? "Same as billing address" : "Enter shipping address"}
                                    value={form.sameAsBilling ? form.company_addr : form.consignee_addr}
                                    onChange={(e) => setField('consignee_addr', e.target.value)}
                                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all resize-y h-[60px] disabled:bg-gray-50"
                                />
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <input
                                        type="checkbox"
                                        disabled
                                        id="sameAsBilling"
                                        checked={form.sameAsBilling}
                                        onChange={(e) => setField('sameAsBilling', e.target.checked)}
                                        className="w-3.5 h-3.5 text-[#3b82f6] rounded border-gray-300 focus:ring-[#3b82f6] cursor-pointer"
                                    />
                                    <label htmlFor="sameAsBilling" className="text-[12px] font-medium text-slate-500 cursor-pointer">Same as Billing Address</label>
                                </div>
                            </div>
                            <div>
                                <Label required>Billing State</Label>
                                <Input required disabled value={form.billingState} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Pin Code</Label>
                                <Input required disabled value={form.billingPin} className="py-2.5" />
                            </div>
                        </div>

                        <div className="hidden">
                            <div>
                                <Label required>State</Label>
                                <Input required disabled value={form.state} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>City</Label>
                                <Input required disabled value={form.city} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Country</Label>
                                <Input required disabled value={form.country} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Place of Supply</Label>
                                <Input required disabled value={form.placeOfSupply} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3 – Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-3">
                        <SectionHead num="3" label="Item Details" />
                        <fieldset disabled>

                        <div className="w-full overflow-hidden mb-3">
                            <table className="w-full table-fixed text-[8px] border-collapse [&_th]:min-w-0 [&_th]:px-0.5 [&_td]:min-w-0 [&_td]:px-0.5 [&_input]:min-w-0 [&_input]:w-full [&_select]:min-w-0 [&_select]:w-full">
                                <colgroup>
                                    <col className="w-[2%]" />
                                    {!hideReadonlyFields && <col className="w-[11%]" />}
                                    <col className="w-[13%]" />
                                    {!hideReadonlyFields && <col className="w-[10%]" />}
                                    <col className="w-[8%]" />
                                    <col className="w-[4%]" />
                                    <col className="w-[7%]" />
                                    <col className="w-[7%]" />
                                    <col className="w-[5%]" />
                                    <col className="w-[8%]" />
                                    <col className="w-[7%]" />
                                    <col className="w-[4%]" />
                                    <col className="w-[6%]" />
                                    <col className="w-[4%]" />
                                    <col className="w-[6%]" />
                                    <col className="w-[8%]" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 whitespace-nowrap">
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-8">#</th>
                                        {!hideReadonlyFields && <th className="px-1 py-2 text-left font-medium text-[#1a2b4b] min-w-[105px]">Item Category <span className="text-red-500">*</span></th>}
                                        <th className="px-1 py-2 text-left font-medium text-[#1a2b4b] min-w-[110px]">Item Description <span className="text-red-500">*</span></th>
                                        {!hideReadonlyFields && <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[80px]">Stall Type</th>}
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[65px]">HSN No. <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Qty <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[40px]">Area</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[40px]">Size</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Unit <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Rate (₹) <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[65px]">Basic Amt</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[45px]">GST%</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[65px]">GST Amt</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[45px]">Disc%</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[65px]">Disc Amt</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[70px]">Total Amt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.filter((item) => item.category !== 'PLC Charges').map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                            <td className="px-1 py-1.5 text-center text-slate-400 font-medium text-[11px]">{idx + 1}</td>
                                            {!hideReadonlyFields && <td className="px-1 py-1.5"><input className="w-full border border-gray-200 rounded-md px-1.5 h-[26px] text-[11px]" value={item.category || ''} readOnly /></td>}
                                            <td className="px-1 py-1.5">
                                                <input
                                                    required
                                                    className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px]"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                />
                                            </td>
                                            {!hideReadonlyFields && <td className="px-1 py-1.5"><input className="w-full border border-gray-200 rounded-md px-1.5 h-[26px] text-[11px] text-center" value={item.stallType || ''} readOnly /></td>}
                                            <td className="px-1 py-1.5">
                                                <input className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] text-center" value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <input required type="number" min={1} max={item.maxQty || undefined} className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] text-center" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} />
                                                {item.maxQty ? (
                                                    <p className="mt-0.5 text-[9px] text-slate-400 text-center whitespace-nowrap">Left: {item.maxQty}</p>
                                                ) : null}
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <input className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] text-center" value={item.area} onChange={(e) => updateItem(item.id, 'area', e.target.value)} placeholder="Area" />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <input className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] text-center" value={item.size} onChange={(e) => updateItem(item.id, 'size', e.target.value)} placeholder="Size" />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <select required className="w-full min-w-0 appearance-none border border-gray-200 rounded-md px-1 py-1 text-[10px] text-[#1a2b4b] bg-white shadow-sm h-[26px] cursor-pointer" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
                                                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <input required type="number" className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] text-right" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700 text-right">
                                                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5"><div className="h-[26px] flex items-center justify-center rounded-md bg-gray-50 border border-gray-100 text-[11px]">{item.gstPct}</div></td>
                                            <td className="px-1 py-1.5"><div className="h-[26px] flex items-center justify-end px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium">{item.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></td>
                                            <td className="px-1 py-1.5">
                                                <input type="number" className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] text-center" value={item.discountPct} onChange={(e) => updateItem(item.id, 'discountPct', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700 text-right">
                                                    {(Number(item.amount || 0) - Number(item.taxableValue || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="hidden">
                                                <select required className="min-w-[40px] appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] cursor-pointer" value={item.gstPct} onChange={(e) => updateItem(item.id, 'gstPct', e.target.value)}>
                                                    {GST_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="hidden">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700 text-right">
                                                    {item.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-emerald-50 border border-emerald-100 text-[11px] font-medium text-emerald-700 text-right">
                                                    {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {false && (selectedPlcCharges > 0 || selectedPlcPct > 0 || selectedPrimaryStall?.plScheme) && (
                            <div className="mt-4">
                                <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-2">Additional Charges</h4>
                                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                    <Label>PLC Charges (₹)</Label>
                                    <div className="grid grid-cols-5 gap-2 mt-1">
                                        <div><p className="text-[10px] text-slate-500">%</p><p className="text-[13px] font-semibold text-[#1a2b4b]">{selectedPlcPct}%</p></div>
                                        <div><p className="text-[10px] text-slate-500">Amount</p><p className="text-[13px] font-semibold text-[#1a2b4b]">{selectedPlcCharges.toLocaleString('en-IN')}</p></div>
                                        <div><p className="text-[10px] text-slate-500">GST %</p><p className="text-[13px] font-semibold text-[#1a2b4b]">{selectedPlcGstPct}%</p></div>
                                        <div><p className="text-[10px] text-slate-500">GST Amount</p><p className="text-[13px] font-semibold text-[#1a2b4b]">{selectedPlcGstAmount.toLocaleString('en-IN')}</p></div>
                                        <div><p className="text-[10px] text-slate-500">PLC Final Amount</p><p className="text-[13px] font-bold text-emerald-600">{selectedPlcFinalAmount.toLocaleString('en-IN')}</p></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">For: {selectedPrimaryStall?.plScheme || '—'}</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={addItem}
                            className="hidden"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" /> Add Item
                        </button>
                        </fieldset>
                    </div>

                    {/* SECTION 4 – Additional Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 mt-4">
                        <SectionHead num="4" label="Charges & Payment Plan" />
                        <fieldset disabled className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2">
                                <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-2">Additional Charges</h4>
                                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                    <Label>PLC Charges (₹)</Label>
                                    <div className="grid grid-cols-5 gap-2 mt-1">
                                        {[['%', `${selectedPlcPct}%`], ['Amount', selectedPlcCharges.toLocaleString('en-IN')], ['GST %', `${selectedPlcGstPct}%`], ['GST Amount', selectedPlcGstAmount.toLocaleString('en-IN')], ['PLC Final Amount', selectedPlcFinalAmount.toLocaleString('en-IN')]].map(([label, value]) => <div key={label}><p className="text-[10px] text-slate-500">{label}</p><p className={`text-[13px] font-semibold ${label === 'PLC Final Amount' ? 'text-emerald-600' : 'text-[#1a2b4b]'}`}>{value}</p></div>)}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">For: {selectedPrimaryStall?.plScheme || '—'}</p>
                                </div>
                                {!hideReadonlyFields && (
                                    <div className="mt-3 flex items-center gap-4">
                                        <span className="text-[12px] font-medium text-[#1a2b4b]">TDS Applicable<span className="text-red-500">*</span></span>
                                        <label className="flex items-center gap-1.5 text-[12px]"><input type="radio" checked={selectedTdsApplicable} readOnly /> Yes</label>
                                        <label className="flex items-center gap-1.5 text-[12px]"><input type="radio" checked={!selectedTdsApplicable} readOnly /> No</label>
                                    </div>
                                )}
                                {selectedTdsApplicable && <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5"><p className="text-[12px] font-semibold text-amber-800">TDS Deduction (Section 194C)</p><p className="text-[11px] text-amber-700 mt-0.5">TDS shall be deducted on the basic value only (excluding GST). Applicable rate: <strong>2%</strong> for Companies/Firms/other entities and <strong>1%</strong> for Individual/HUF.</p></div>}
                            </div>
                            <div className="lg:col-span-3">
                                {!hideReadonlyFields && (
                                    <div className="flex items-center gap-4 mb-3"><span className="text-[13px] font-semibold text-[#1a2b4b]">Payment Plan<span className="text-red-500">*</span></span><label className="flex items-center gap-1.5 text-[12px]"><input type="radio" checked={!selectedIsInstalmentPlan} readOnly /> Full Payment</label><label className="flex items-center gap-1.5 text-[12px]"><input type="radio" checked={selectedIsInstalmentPlan} readOnly /> Instalment Plan</label></div>
                                )}
                                {!selectedIsInstalmentPlan ? <div><h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-2">Payment Terms</h4><div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 space-y-2"><p className="text-[12px] text-[#1a2b4b]"><strong>Advance Payment – 100%:</strong> Full payment is payable in advance on the same day of Proforma Invoice (PI) generation.</p>{selectedTdsApplicable && (selectedTdsLines.length ? selectedTdsLines : ['TDS under Section 194C shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.', 'Please share the applicable TDS Certificate (Form 16A) after deduction.']).map((line, index) => <p key={index} className="text-[12px] text-[#1a2b4b]">{line}</p>)}</div></div> : <div><h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-2">Instalment Plan Details</h4><div className="overflow-x-auto"><table className="w-full text-[11px]"><thead><tr className="bg-gray-50">{['#', 'Instalment Name', '%', 'Amt', 'Due Date', 'Remarks'].map((heading) => <th key={heading} className="text-left px-2 py-2">{heading}</th>)}</tr></thead><tbody>{selectedInstalments.map((row, index) => <tr key={row.id || index} className="border-b"><td className="px-2 py-2">{index + 1}</td><td className="px-2 py-2">{row.label}</td><td className="px-2 py-2">{Number(row.percentage || 0)}%</td><td className="px-2 py-2">{Number(row.amount || 0).toLocaleString('en-IN')}</td><td className="px-2 py-2">{row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-GB') : '—'}</td><td className="px-2 py-2">{row.remarks || '—'}</td></tr>)}</tbody></table></div>{selectedTdsApplicable && <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2.5 space-y-2">{selectedTdsLines.map((line, index) => <p key={index} className="text-[12px]">{line}</p>)}</div>}</div>}
                            </div>
                        </fieldset>

                        {/* Totals summary bar — Taxable Value − Discount + GST = Final Amount — and Amount in Words */}
                        <div className="mt-4 border-t border-gray-100 pt-4 flex items-stretch gap-3">
                            <div className="w-[60%] bg-slate-50/60 border border-gray-100 rounded-xl px-4 py-3 flex items-stretch gap-3">
                                <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                        <FileText size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500 font-medium truncate">Total Taxable Value</p>
                                        <p className="text-[14px] font-bold text-[#1a2b4b]">₹ {Math.round(sumTaxable).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <span className="flex items-center text-slate-300 text-lg font-light px-1 shrink-0">−</span>
                                <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                        <Percent size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500 font-medium truncate">Total Discount</p>
                                        <p className="text-[14px] font-bold text-[#1a2b4b]">₹ {Math.round(sumDiscount).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <span className="flex items-center text-slate-300 text-lg font-light px-1 shrink-0">+</span>
                                <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 text-[9px] font-bold">GST</div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500 font-medium truncate">Total GST ({sumTaxable > 0 ? Math.round((sumGst / sumTaxable) * 100) : 0}%)</p>
                                        <p className="text-[14px] font-bold text-[#1a2b4b]">₹ {Math.round(sumGst).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <span className="flex items-center text-slate-300 text-lg font-light px-1 shrink-0">=</span>
                                <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0 bg-emerald-50 rounded-lg px-4 py-2">
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Wallet size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500 font-medium truncate">Final Amount</p>
                                        <p className="text-[16px] font-bold text-emerald-600">₹ {Math.round(sumTotal).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-[40%] bg-slate-50/60 border border-gray-100 rounded-xl px-4 py-3 flex flex-col justify-center">
                                <p className="text-[11px] text-slate-500 font-medium mb-1">Amount In Words</p>
                                <p className="text-[13px] font-semibold text-[#1a2b4b] leading-snug">{amountInWords(sumTotal)}.</p>
                            </div>
                        </div>
                    </div>

                    {false && !isProformaEditMode && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-3 mt-4">
                            <SectionHead num="4" label="Delivery Challan" />
                            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#1a2b4b]">
                                        <Truck size={16} className="text-[#194090]" />
                                        Do you want to add delivery challan details?
                                    </h4>
                                    <p className="mt-1 text-[11px] text-slate-500">This adds delivery references to the PDF without changing invoice totals.</p>
                                </div>
                                <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white text-xs">
                                    {[{ label: 'No', value: false }, { label: 'Yes', value: true }].map((option) => (
                                        <button key={option.label} type="button" onClick={() => {
                                            setIncludeDeliveryChallans(option.value);
                                            if (!option.value) setSelectedChallanIds([]);
                                        }} className={`px-6 py-2 font-bold transition ${includeDeliveryChallans === option.value ? 'bg-[#194090] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {includeDeliveryChallans && (
                                <div className="mt-4">
                                    {!resolvedSourceEstimateId ? (
                                        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">Please select an existing PI / Estimate first.</p>
                                    ) : challansLoading ? (
                                        <p className="p-4 text-center text-xs text-slate-500">Loading delivery challans...</p>
                                    ) : challansError ? (
                                        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{challansError}</p>
                                    ) : deliveryChallans.length === 0 ? (
                                        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">No active delivery challans found for this PI.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-semibold text-slate-600">Choose challans ({selectedChallanIds.length} selected)</p>
                                            {deliveryChallans.map((challan) => {
                                                const selected = selectedChallanIds.includes(String(challan._id));
                                                return (
                                                    <label key={challan._id} className={`block cursor-pointer rounded-lg border p-3 transition ${selected ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                                        <div className="flex items-start gap-3">
                                                            <input type="checkbox" checked={selected} onChange={() => toggleDeliveryChallan(challan._id)} className="mt-1 h-4 w-4 accent-[#194090]" />
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-[#194090]">{challan.challan_no}</span>
                                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">{challan.status || 'issued'}</span>
                                                                    </div>
                                                                    <span className="text-[10px] text-slate-500">{challan.challan_date ? new Date(challan.challan_date).toLocaleDateString('en-IN') : 'No date'}</span>
                                                                </div>
                                                                <div className="mt-2 grid gap-1 text-[10px] text-slate-600 sm:grid-cols-2">
                                                                    <span><b>Delivery:</b> {challan.delivery_address || '—'}</span>
                                                                    <span><b>Transport:</b> {[challan.transporter_name, challan.vehicle_no].filter(Boolean).join(' / ') || '—'}</span>
                                                                </div>
                                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                                    {(challan.items || []).map((item, itemIndex) => (
                                                                        <span key={`${challan._id}-${itemIndex}`} className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[9px] text-slate-600">
                                                                            <Package size={10} /> {item.description}: <b>{item.qty} {item.unit}</b>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-3 mt-4">
                        <SectionHead num={isProformaEditMode ? "4" : "5"} label="Attachments" />

                        <div className="hidden">
                            <div>
                                <Label>Remarks / Notes</Label>
                                <textarea
                                    placeholder="Enter any remarks or notes (optional)"
                                    value={form.remarks}
                                    onChange={(e) => setField('remarks', e.target.value)}
                                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all resize-y h-[60px]"
                                />
                            </div>
                            <div>
                                <Label>Terms & Conditions</Label>
                                <textarea
                                    placeholder="Enter terms & conditions (optional)"
                                    value={form.terms}
                                    onChange={(e) => setField('terms', e.target.value)}
                                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all resize-y h-[60px]"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Attach Documents (up to 10 files)</Label>
                            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf" />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border border-gray-200 border-dashed rounded-md h-[60px] flex items-center px-4 bg-white hover:bg-gray-50 transition cursor-pointer max-w-[50%]"
                            >
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-3 shrink-0">
                                    <Upload className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col flex-1 truncate pr-2">
                                    {attachedFiles.length ? (
                                        <>
                                            <p className="text-xs font-bold text-gray-800 truncate">{attachedFiles.length} file(s) selected</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">Click to add more files</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-gray-500"><span className="font-bold text-indigo-700">Click to upload</span> or drag and drop</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, PDF (Max. 25MB each)</p>
                                        </>
                                    )}
                                </div>
                                <button type="button" className="ml-auto border border-gray-200 rounded-md px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-white shadow-sm shrink-0">
                                    {attachedFiles.length ? "Add More" : "Browse Files"}
                                </button>
                            </div>
                            {attachedFiles.length > 0 && (
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {attachedFiles.map((file, index) => (
                                        <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                            <File size={14} className="shrink-0 text-indigo-600" />
                                            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-700">{file.name}</span>
                                            <button type="button" onClick={() => setAttachedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="rounded p-1 text-red-500 hover:bg-red-50">
                                                <XIcon size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                <Eye className="w-4 h-4" /> {isProformaEditMode ? 'Preview Proforma' : 'Preview Invoice'}
                            </button>
                            <button type="submit" className="flex items-center gap-2 bg-[#00A859] hover:bg-[#00904C] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition shadow-sm">
                                <FileText className="w-4 h-4" /> {isProformaEditMode ? "Update Proforma Invoice" : (isEditMode ? "Update Invoice" : "Generate Invoice")}
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
                                <InvoicePreviewTemplate form={{ ...form, delivery_challans: previewDeliveryChallans }} items={items} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── RIGHT SIDEBAR ── */}
                <div className="hidden">

                    {/* Summary */}
                    {/* Invoice Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#f0f5ff] text-[#194090]">
                                <FileText size={14} />
                            </div>
                            <h3 className="text-[14px] font-medium text-[#1a2b4b]">Invoice Summary</h3>
                        </div>

                        <div className="space-y-3 text-[13px]">
                            <div className="flex justify-between text-slate-500">
                                <span className="font-medium text-slate-500">Sub Total</span>
                                <span className="font-medium text-[#1a2b4b]">₹ {sumTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                            <div className="mt-2 space-y-2 pt-2 border-t border-dashed border-gray-200">
                                {form.invoiceType === 'Intrastate' ? (
                                    <>
                                        <div className="flex justify-between text-slate-400">
                                            <span className="font-medium">CGST</span>
                                            <span className="font-medium text-slate-600">₹ {(sumGst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span className="font-medium">SGST</span>
                                            <span className="font-medium text-slate-600">₹ {(sumGst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between text-slate-400">
                                        <span className="font-medium">IGST</span>
                                        <span className="font-medium text-slate-600">₹ {sumGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-[14px] font-medium text-[#1a2b4b]">Quick Actions</h3>
                        </div>
                        <div className="space-y-2.5">
                            <QuickAction icon={Mail} label={isEmailLoading ? "Sending Email..." : "Send Invoice via Email"} colorClass="text-[#3b82f6]" onClick={handleSendEmail} disabled={isEmailLoading} />
                            <QuickAction icon={MessageCircleMore} label={isWhatsAppLoading ? "Sending WhatsApp..." : "Send Invoice via WhatsApp"} colorClass="text-emerald-600" onClick={handleSendWhatsApp} disabled={isWhatsAppLoading} />
                            <QuickAction icon={File} label="Download PDF" colorClass="text-red-500" onClick={handlePrint} />
                            <QuickAction icon={Printer} label="Print Invoice" colorClass="text-indigo-600" onClick={handlePrint} />
                            <QuickAction icon={Bookmark} label="Save as Template" colorClass="text-amber-500" onClick={() => Swal.fire({
                                icon: 'info',
                                title: 'Coming Soon',
                                text: 'Save as Template functionality is coming soon!',
                                confirmButtonColor: '#194090',
                            })} />
                        </div>
                    </div>

                    {/* Recent Invoices */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[14px] font-medium text-[#1a2b4b]">Recent Invoices</h3>
                            <a href="#" className="text-[12px] font-medium text-[#3b82f6] hover:underline">View All</a>
                        </div>

                        <div className="space-y-4">
                            {/* Invoice 1 */}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <span className="text-[12px] font-bold text-slate-300">1</span>
                                    <div>
                                        <p className="text-[12px] font-medium text-[#1a2b4b]">INV/26-27/0001</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">31 May 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[12px] font-medium text-[#1a2b4b]">₹ 1,00,300.00</p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">Draft</p>
                                </div>
                            </div>

                            {/* Invoice 2 */}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <span className="text-[12px] font-bold text-slate-300">2</span>
                                    <div>
                                        <p className="text-[12px] font-medium text-[#1a2b4b]">INV/26-27/0000</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">25 May 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[12px] font-medium text-emerald-600">₹ 75,400.00</p>
                                    <p className="text-[10px] font-medium text-emerald-500 mt-0.5">Paid</p>
                                </div>
                            </div>

                            {/* Invoice 3 */}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <span className="text-[12px] font-bold text-slate-300">3</span>
                                    <div>
                                        <p className="text-[12px] font-medium text-[#1a2b4b]">INV/26-27/0009</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">20 May 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[12px] font-medium text-red-600">₹ 1,25,000.00</p>
                                    <p className="text-[10px] font-medium text-red-500 mt-0.5">Overdue</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Hidden printable component */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    <InvoicePreviewTemplate form={{ ...form, delivery_challans: previewDeliveryChallans }} items={items} />
                </div>
            </div>

        </div>
    );
};

export default CreateInvoice;
