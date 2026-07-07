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
    Truck
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
const recalculateItemForQty = (item, qty) => {
    const nextQty = Number(qty) || 0;
    const rate = Number(item.rate) || 0;
    const area = Number(item.area) || 0;
    const sizeAsNumber = Number(item.size);
    const multiplier = area > 0 ? area : (Number.isFinite(sizeAsNumber) && sizeAsNumber > 0 ? sizeAsNumber : 1);
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
const CreateInvoice = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id, piNo } = useParams();
    const navigationState = location.state || {};
    const selectedPiFromUrl = navigationState.selectedPiNo || (piNo ? decodeURIComponent(piNo) : '');
    const sourceEstimateId = navigationState.sourceEstimateId || '';
    const [resolvedSourceEstimateId, setResolvedSourceEstimateId] = useState(sourceEstimateId);
    const fileInputRef = useRef(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [estimates, setEstimates] = useState([]);
    const [existingInvoices, setExistingInvoices] = useState([]);
    const [selectedPi, setSelectedPi] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState('');
    const [isProformaEditMode, setIsProformaEditMode] = useState(false);
    const [editingProformaId, setEditingProformaId] = useState('');
    const [includeDeliveryChallans, setIncludeDeliveryChallans] = useState(false);
    const [deliveryChallans, setDeliveryChallans] = useState([]);
    const [selectedChallanIds, setSelectedChallanIds] = useState([]);
    const [challansLoading, setChallansLoading] = useState(false);
    const [challansError, setChallansError] = useState('');

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
            const [estRes, invRes] = await Promise.all([
                api.get('/api/estimates'),
                api.get('/api/invoices')
            ]);

            const fetchedEstimates = Array.isArray(estRes.data) ? estRes.data : (estRes.data?.data || []);
            const fetchedInvoices = Array.isArray(invRes.data) ? invRes.data : (invRes.data?.data || []);

            setEstimates(fetchedEstimates);
            setExistingInvoices(fetchedInvoices);
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
                                setResolvedSourceEstimateId(estimate._id);
                                setSelectedPi(selectedPiFromUrl);
                                addEstimateOption({ ...estimate, est_no: selectedPiFromUrl });
                                setForm(f => ({
                                    ...estimateToInvoiceForm(estimate, estimate.exhibitor || {}, f),
                                    invoiceNo: 'Auto-generated on save',
                                    invoiceDate: f.invoiceDate,
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
                        setResolvedSourceEstimateId(estimate._id);
                        setIsProformaEditMode(true);
                        setEditingProformaId(estimate._id);
                        setSelectedPi(estimate.est_no || '');
                        addEstimateOption(estimate);
                        setForm(f => ({
                            ...estimateToInvoiceForm(estimate, estimate.exhibitor || {}, f),
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

    const returnListId = form.companyId || (!isEditMode && !isProformaEditMode ? id : '');
    const listRoute = isProformaEditMode
        ? -1
        : (returnListId ? `/invoice-list/${returnListId}` : '/invoice-list');
    const postSaveRoute = navigationState.returnTo || listRoute;
    const dropdownEstimates = selectedPiFromUrl && !estimates.some((estimate) => estimate.est_no === selectedPiFromUrl)
        ? [{ est_no: selectedPiFromUrl }, ...estimates]
        : estimates;
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

        return estimateItemsToInvoiceItems(estimate.items || [])
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

        const est = estimates.find(e => e.est_no === estNo);
        if (est) {
            setResolvedSourceEstimateId(est._id || '');
            setForm(f => ({
                ...f,
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
                invoiceType: 'Standard',
                company_name: est.company_name || f.company_name,
                company_addr: est.company_addr || f.company_addr,
                event_name: est.event_name || f.event_name,
                consignee_name: est.event_name || est.consignee_name || f.consignee_name,
                consignee_addr: est.consignee_addr || f.consignee_addr,
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

        const payload = {
            companyId: form.companyId || id,
            source_estimate_id: resolvedSourceEstimateId || sourceEstimateId || '',
            estimate_no: selectedPi || '',
            delivery_challan_ids: includeDeliveryChallans ? selectedChallanIds : [],
            type_of_invoice: form.invoiceType,
            invoice_date: form.invoiceDate,
            due_date: form.dueDate,
            po_no: form.poNo,
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
            })),
            finalAmount: finalAmount,
            remarks: form.remarks,
            terms: form.terms,
            added_by: getCurrentUserName(),
            updated_by: getCurrentUserName(),
        };

        try {
            let res;
            if (isEditMode) {
                res = await api.put(`/api/invoices/${editingInvoiceId || id}`, payload);
                if (res.status === 200 || res.status === 201) {
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
                    await Swal.fire({
                        icon: 'success',
                        title: 'Invoice Generated!',
                        text: 'Invoice generated successfully.',
                        confirmButtonColor: '#194090',
                    });
                    const createdInvoiceId = res.data?.data?._id || res.data?._id;
                    navigate(createdInvoiceId ? `/payments/invoiceDetails/${createdInvoiceId}` : postSaveRoute);
                }
            }
        } catch (err) {
            console.error(err);
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

            <div className="w-full  pr-16 px-4 pt-3 flex gap-3 items-start">

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
                                <Input placeholder="Enter GSTIN / PAN No." value={form.gstin} onChange={(e) => setField('gstin', e.target.value)} />
                            </div>
                            <div>
                                <Label required>Invoice Type</Label>
                                <Select required options={['Select Invoice Type', 'Intrastate', 'Interstate Sale', 'Foreign Sale']} value={form.invoiceType} onChange={(e) => setField('invoiceType', e.target.value)} />
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
                                    <Input required type="date" value={form.invoiceDate} onChange={(e) => setField('invoiceDate', e.target.value)} className="py-2.5" />
                                </div>
                            </div>
                            <div>
                                <Label required>Due Date</Label>
                                <div className="relative">
                                    <Input required type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} className="py-2.5" />
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
                        <SectionHead num="2" label="Billing & Shipping Details" />

                        <div className="grid grid-cols-4 gap-4 mb-2">
                            <div>
                                <Label required>Billing Address</Label>
                                <textarea
                                    required
                                    value={form.company_addr}
                                    onChange={(e) => setField('company_addr', e.target.value)}
                                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all resize-y h-[60px]"
                                />
                            </div>
                            <div>
                                <Label>Shipping / Consignee Address</Label>
                                <textarea
                                    disabled={form.sameAsBilling}
                                    placeholder={form.sameAsBilling ? "Same as billing address" : "Enter shipping address"}
                                    value={form.sameAsBilling ? form.company_addr : form.consignee_addr}
                                    onChange={(e) => setField('consignee_addr', e.target.value)}
                                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all resize-y h-[60px] disabled:bg-gray-50"
                                />
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <input
                                        type="checkbox"
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
                                <Select required options={['Delhi', 'Maharashtra', 'Karnataka']} value={form.billingState} onChange={(e) => setField('billingState', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Pin Code</Label>
                                <Input required value={form.billingPin} onChange={(e) => setField('billingPin', e.target.value)} className="py-2.5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <Label required>State</Label>
                                <Select required options={['Delhi', 'Maharashtra', 'Karnataka']} value={form.state} onChange={(e) => setField('state', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>City</Label>
                                <Input required value={form.city} onChange={(e) => setField('city', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Country</Label>
                                <Select required options={['India', 'USA', 'UK']} value={form.country} onChange={(e) => setField('country', e.target.value)} className="py-2.5" />
                            </div>
                            <div>
                                <Label required>Place of Supply</Label>
                                <Select required options={['Select Place of Supply', 'Delhi (07)', 'Maharashtra (27)', 'Uttar Pradesh (09)', 'Haryana (06)']} value={form.placeOfSupply} onChange={(e) => setField('placeOfSupply', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3 – Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-3">
                        <SectionHead num="3" label="Item Details" />

                        <div className="overflow-x-none mb-3">
                            <table className="w-full text-[9px] border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 whitespace-nowrap">
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] w-8">#</th>
                                        <th className="px-1 py-2 text-left font-medium text-[#1a2b4b] min-w-[110px]">Item Description <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">HSN / SAC</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Qty <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[40px]">Area</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[40px]">Size</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Unit <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Rate (₹) <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Amount (₹)</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Disc. %</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Taxable (₹)</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">GST % <span className="text-red-500">*</span></th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">GST (₹)</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Total (₹)</th>
                                        <th className="px-1 py-2 text-center font-medium text-[#1a2b4b] min-w-[30px]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                            <td className="px-1 py-1.5 text-center text-slate-400 font-medium text-[11px]">{idx + 1}</td>
                                            <td className="px-1 py-1.5">
                                                <input
                                                    required
                                                    className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px]"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                />
                                            </td>
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
                                                <select required className="min-w-[40px] appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] cursor-pointer" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
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
                                            <td className="px-1 py-1.5">
                                                <input type="number" className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] text-center" value={item.discountPct} onChange={(e) => updateItem(item.id, 'discountPct', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700 text-right">
                                                    {item.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <select required className="min-w-[40px] appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] cursor-pointer" value={item.gstPct} onChange={(e) => updateItem(item.id, 'gstPct', e.target.value)}>
                                                    {GST_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700 text-right">
                                                    {item.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5">
                                                <div className="flex items-center justify-end h-[26px] px-1.5 rounded-md bg-emerald-50 border border-emerald-100 text-[11px] font-medium text-emerald-700 text-right">
                                                    {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5 text-center">
                                                <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                                                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
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
                    {!isProformaEditMode && (
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
                        <SectionHead num={isProformaEditMode ? "4" : "5"} label="Additional Information" />

                        <div className="grid grid-cols-2 gap-6 mb-2">
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
                <div className="w-[250px] flex-shrink-0 space-y-3">

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
