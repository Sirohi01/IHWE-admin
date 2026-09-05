import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../lib/api';
import {
    ChevronRight, ChevronDown, List, Plus, Trash2, FileText,
    Save, Download, MessageCircle, X, CheckSquare, Bookmark,
    FileSpreadsheet,
    File,
    MessageCircleMore,
    Mail,
    Search,
    Wallet,
    Percent,
    ShieldCheck,
} from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from "../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../features/state/stateSlice";
import { fetchCities } from "../features/city/citySlice";
import SearchableDropdown from '../components/SearchableDropdown';
import { getCurrentUserMobile } from '../utils/currentUser';

// ── helpers ──────────────────────────────────────────────────────────────────
const roundAmount = (value) => Math.round(Number(value || 0));
// Contact names are often saved ALL CAPS — normalize to Title Case.
const toTitleCase = (value) =>
    String(value || '').toLowerCase().replace(/(^|[\s.'-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());

// ── amount-in-words (Indian numbering: Crore/Lakh/Thousand) ───────────────────
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

const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const buildImpactPreviewHtml = (preview) => {
    const changes = preview?.changedFields || [];
    const itemChanges = preview?.itemChanges || {};
    const dependencies = preview?.dependencies || {};
    const dependencyRows = [
        ['Invoices', dependencies.invoices, 'invoice_no'],
        ['Delivery Challans', dependencies.deliveryChallans, 'challan_no'],
        ['Payments', dependencies.payments, 'ex_no'],
        ['Credit Notes', dependencies.creditNotes, 'create_note_no'],
        ['Debit Notes', dependencies.debitNotes, 'debit_note_no'],
    ].filter(([, records]) => records?.length);

    const changeRows = changes.length
        ? changes.map((change) => `
            <tr>
                <td style="padding:6px;border-bottom:1px solid #e5e7eb;font-weight:600">${escapeHtml(change.label)}</td>
                <td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#64748b">${escapeHtml(change.before || '—')}</td>
                <td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#166534">${escapeHtml(change.after || '—')}</td>
            </tr>`).join('')
        : '<tr><td colspan="3" style="padding:7px;color:#64748b">No header/detail field changed.</td></tr>';

    const itemSummary = [
        itemChanges.added ? `${itemChanges.added} added` : '',
        itemChanges.removed ? `${itemChanges.removed} removed` : '',
        itemChanges.modified ? `${itemChanges.modified} modified` : '',
    ].filter(Boolean).join(', ') || 'No item changes';

    const dependencyHtml = dependencyRows.length
        ? dependencyRows.map(([label, records, numberField]) => `
            <div style="padding:7px 9px;margin-top:6px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px">
                <b>${escapeHtml(label)} (${records.length})</b>
                <div style="font-size:11px;color:#7c2d12;margin-top:2px">
                    ${escapeHtml(records.map((record) => record[numberField] || record._id).join(', '))}
                </div>
            </div>`).join('')
        : '<div style="padding:8px;background:#f0fdf4;color:#166534;border-radius:6px">No linked downstream documents found.</div>';

    return `
        <div style="text-align:left;font-size:12px">
            <p style="margin:0 0 8px;color:#475569">
                PI will be updated, but already-created Invoice, Delivery Challan, Payment or Notes will remain unchanged.
            </p>
            <div style="max-height:210px;overflow:auto;border:1px solid #e5e7eb;border-radius:6px">
                <table style="width:100%;border-collapse:collapse">
                    <thead><tr style="background:#f8fafc">
                        <th style="padding:6px;text-align:left">Field</th>
                        <th style="padding:6px;text-align:left">Old</th>
                        <th style="padding:6px;text-align:left">New</th>
                    </tr></thead>
                    <tbody>${changeRows}</tbody>
                </table>
            </div>
            <p style="margin:8px 0"><b>Items:</b> ${escapeHtml(itemSummary)}</p>
            <p style="margin:10px 0 4px"><b>Linked document impact:</b></p>
            ${dependencyHtml}
        </div>`;
};

// A fresh row starts fully blank — HSN/Qty/Area/Size/Unit/Rate are only meant
// to be filled once a Stall No. (and, for rate/HSN, a Stall Type) is picked.
const newItem = () => ({
    id: Date.now(),
    category: 'Stall',
    description: '',
    subDesc: '',
    stallType: '',
    hsn: '',
    qty: '',
    area: '',
    size: '',
    unit: '',
    rate: '',
    amount: 0,
    gstPct: 18,
    disc: '',
    taxable: 0,
});

const GST_OPTIONS = ['0% GST', '5% CGST+SGST', '12% CGST+SGST', '18% CGST+SGST', '28% CGST+SGST', '18% IGST', '12% IGST', '5% IGST'];
const ESTIMATE_TYPES = ['Intrastate', 'Interstate Sale', 'Foreign Sale'];
const UNITS = ['Nos', 'Sqm', 'Sqft', 'Mtrs', 'Kgs', 'Ltrs', 'Pcs'];
const SIZE_BASED_UNITS = ['Sqm', 'Sqft'];
// Internal values stay 'Stall' / 'Addon Product' (every category check in this
// file compares against these) — only the displayed label changes.
const ITEM_CATEGORIES = ['Stall', 'Addon Product'];
const ITEM_CATEGORY_LABELS = { Stall: 'Exhibition Stall', 'Addon Product': 'Add-on Product' };
const STALL_TYPES = ['Raw Space', 'Shell Space'];

const PROFORMA_EVENT_NAME = '9th Edition of International Health & Wellness Expo (IHWE Global Edition)';
const PROFORMA_PLACE_OF_SUPPLY = 'Hall Nos. 12, Pragati Maidan, New Delhi - 110001, Bharat';
const PROFORMA_EVENT_GST_NO = '09AAFCN9238F1Z6';



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
        className={`w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px] ${props.className || ''}`}
    />
);

// ── ReadOnlyField ────────────────────────────────────────────────────────────
// Company / Billing Details are sourced from the CRM Company record and must
// not be hand-edited per-PI — shown as static text instead of an input.
const ReadOnlyField = ({ value, placeholder }) => (
    <div className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-gray-50 h-[32px] flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
        {value || <span className="text-gray-400">{placeholder || '—'}</span>}
    </div>
);

// ── Select ───────────────────────────────────────────────────────────────────
const Select = ({ options, ...props }) => (
    <select
        {...props}
        className={`w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px] cursor-pointer ${props.className || ''}`}
    >
        {options.map((o) => (
            <option key={o} value={o}>{o}</option>
        ))}
    </select>
);

// ── Compact searchable select for the Item table (Stall / Addon Product picker) ──
const ItemSearchSelect = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [panelStyle, setPanelStyle] = useState(null);
    const btnRef = useRef(null);
    const panelRef = useRef(null);

    // The panel is portaled to <body> with fixed positioning instead of being
    // an absolutely-positioned child of the trigger — this table lives inside
    // an `overflow-x-auto` wrapper, which clips any in-flow absolute dropdown
    // that extends past its bounds, making it silently invisible.
    const openPanel = () => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) {
            setPanelStyle({
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, 200),
            });
        }
        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleOutside = (e) => {
            if (btnRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
            setIsOpen(false);
            setQuery('');
        };
        const handleReposition = () => setIsOpen(false);
        document.addEventListener('mousedown', handleOutside);
        window.addEventListener('scroll', handleReposition, true);
        window.addEventListener('resize', handleReposition);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            window.removeEventListener('scroll', handleReposition, true);
            window.removeEventListener('resize', handleReposition);
        };
    }, [isOpen]);

    const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative w-full">
            <button
                type="button"
                ref={btnRef}
                onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
                className="w-full h-[26px] flex items-center justify-between px-1.5 text-[11px] text-left bg-white focus:outline-none cursor-pointer"
            >
                <span className={`truncate ${selected ? 'text-[#1a2b4b]' : 'text-gray-400'}`}>{selected ? selected.label : (placeholder || 'Select')}</span>
                <ChevronDown className="w-3 h-3 text-gray-400 shrink-0 ml-1" />
            </button>
            {isOpen && panelStyle && createPortal(
                <div
                    ref={panelRef}
                    style={panelStyle}
                    className="z-[9999] bg-white border border-gray-200 rounded-md shadow-lg max-h-56 flex flex-col"
                >
                    <div className="p-1.5 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <input
                                type="text"
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Search..."
                                className="w-full pl-6 pr-2 py-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:border-[#3b82f6]"
                            />
                        </div>
                    </div>
                    <ul className="overflow-y-auto flex-1">
                        {filtered.length > 0 ? filtered.map((o) => (
                            <li
                                key={o.value}
                                onClick={() => { onChange(o.value); setIsOpen(false); setQuery(''); }}
                                className={`px-2 py-1.5 text-[11px] cursor-pointer hover:bg-blue-50 ${value === o.value ? 'bg-blue-50 text-[#3b82f6] font-medium' : 'text-[#1a2b4b]'}`}
                            >
                                {o.label}
                            </li>
                        )) : (
                            <li className="px-2 py-3 text-[11px] text-gray-400 text-center">No results found</li>
                        )}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
export const PerformaInvoices = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const editEstimateId = location.state?.editEstimateId;
    const [companyData, setCompanyData] = useState(null);
    const [existingEstimateId, setExistingEstimateId] = useState(null);
    // Not-yet-booked stalls for this PI's event — [{ stallFor, dimension, stallSize, discount, eventId }]
    const [availableStallDetails, setAvailableStallDetails] = useState([]);
    // `${eventId}|${currency}|${stallType}` -> StallRate doc ({ ratePerSqm, hsnCode, ... }),
    // sourced straight from the Manage Stall Rates data for this PI's own event
    // (the `eventId` URL param).
    const [eventStallRateMap, setEventStallRateMap] = useState({});
    const [addonProductOptions, setAddonProductOptions] = useState([]);

    const dispatch = useDispatch();
    const { countries: reduxCountries } = useSelector((state) => state.countries || { countries: [] });
    const { states: reduxStates } = useSelector((state) => state.states || { states: [] });
    const { cities: reduxCities } = useSelector((state) => state.cities || { cities: [] });


    let currentUserName = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || '';
    let currentUserEmail = '';
    try {
        const userObjStr = localStorage.getItem('user') || sessionStorage.getItem('user') || localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || localStorage.getItem('admin') || sessionStorage.getItem('admin');
        if (userObjStr) {
            const userObj = JSON.parse(userObjStr);
            if (userObj.name) currentUserName = userObj.name;
            else if (userObj.fullName) currentUserName = userObj.fullName;
            else if (userObj.username) currentUserName = userObj.username;
            else if (userObj.user_name) currentUserName = userObj.user_name;
            if (userObj.email) currentUserEmail = userObj.email;
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
    }
    if (!currentUserName) currentUserName = 'Admin';

    useEffect(() => {
        if (!reduxCountries || reduxCountries.length === 0) dispatch(fetchCountries());
        if (!reduxStates || reduxStates.length === 0) dispatch(fetchStates());
        const actualCities = reduxCities?.data || reduxCities || [];
        if (!actualCities || actualCities.length === 0) dispatch(fetchCities());
    }, [dispatch]);

    // ── form state ──────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        estimateType: 'Select Here',
        estimateNo: 'Loading...',
        gstin: '',
        supplyDate: new Date().toISOString().split('T')[0],
        consigneeName: '',
        consigneeAddress: '',
        // Company/Billing side's own contact — the client's contact person, not
        // whoever is creating this PI (that's consigneePerson/Phone below).
        companyContactPerson: '',
        companyContactMobile: '',
        companyEmail: '',
        consigneePerson: '',
        consigneePhone: '',
        consigneeEmail: '',
        consigneeEventName: PROFORMA_EVENT_NAME,
        consigneeEventAddress: PROFORMA_PLACE_OF_SUPPLY,
        consigneeGstin: PROFORMA_EVENT_GST_NO,
        country: '',
        state: '',
        city: '',
        pinCode: '',
        // Consignee's own address, split the same way as the company/billing
        // address — defaults match PROFORMA_PLACE_OF_SUPPLY (the event venue).
        consigneeCountry: 'India',
        consigneeState: 'Delhi',
        consigneeCity: 'New Delhi',
        consigneePincode: '110001',
    });

    const [items, setItems] = useState([newItem()]);
    // 'default' auto-fills the item table from the linked Estimate/PI; 'custom' lets
    // the user build it from scratch. prefillItemsRef remembers what was fetched so
    // switching back to Default doesn't require re-fetching the estimate.
    const [itemsMode, setItemsMode] = useState('default');
    const prefillItemsRef = useRef(null);
    const isFirstItemsModeRender = useRef(true);

    useEffect(() => {
        if (isFirstItemsModeRender.current) {
            isFirstItemsModeRender.current = false;
            return;
        }
        if (itemsMode === 'custom') {
            setItems([newItem()]);
        } else {
            setItems(prefillItemsRef.current?.length ? prefillItemsRef.current : [newItem()]);
        }
    }, [itemsMode]);

    const [gstOption, setGstOption] = useState('18% IGST');
    const [discount, setDiscount] = useState(0);
    const [paymentPlans, setPaymentPlans] = useState([]);
    const [paymentPlanType, setPaymentPlanType] = useState('');
    // Event Setup's own start date — instalment due dates are computed as
    // (event start date − each plan's dueDaysBeforeEvent).
    const [eventStartDate, setEventStartDate] = useState('');
    // Instalment row remarks start out auto-generated (see instalmentRowsWithRemark)
    // but stay editable — this holds any row the user has overridden, keyed by plan id.
    const [instalmentRemarkOverrides, setInstalmentRemarkOverrides] = useState({});
    // Which of the event's configured instalment phases actually apply to this
    // PI — not every deal uses every phase. null = not yet touched, default to
    // all phases selected (old behaviour); otherwise a Set of plan ids.
    const [selectedPhaseIds, setSelectedPhaseIds] = useState(null);
    // Whether TDS applies to this client/booking at all — when off, every TDS
    // note/line is hidden (not just visually collapsed to empty).
    const [tdsApplicable, setTdsApplicable] = useState(true);
    // PLC % defaults to the stall's saved PL Scheme increment%, but stays
    // editable per-PI — null means "not overridden, use the stall default".
    const [plcPctOverride, setPlcPctOverride] = useState(null);
    // Editing an existing PI is reached without a ?crmEventId= query param, so
    // the event it belongs to has to come from the loaded estimate instead —
    // this holds whichever source resolved it (URL first, estimate as fallback).
    const [resolvedCrmEventId, setResolvedCrmEventId] = useState('');
    // The actual registration Event id used for stall/rate lookups — preferred
    // from the `?eventId=` URL param when present, else resolved below via
    // resolvedCrmEventId → CrmEvent.registrationEventId (same chain payment
    // plans already use), so Stall Type/Stall No. still work when this page is
    // reached without that query param (e.g. editing an existing PI).
    const [resolvedEventId, setResolvedEventId] = useState('');

    const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);

    useEffect(() => {
        const urlCrmEventId = new URLSearchParams(location.search).get('crmEventId') || '';
        if (urlCrmEventId) setResolvedCrmEventId(urlCrmEventId);

        const urlEventId = new URLSearchParams(location.search).get('eventId') || '';
        if (urlEventId) setResolvedEventId(urlEventId);
    }, [location.search]);

    // Creating a new PI reached without a ?crmEventId= (e.g. not opened from a
    // specific event's client list) still needs its event resolved so the Payment
    // Plan dropdown can populate — mirror the same single-assignment fallback used
    // at submit time (handleGenerateEstimate) here too, so the dropdown isn't left
    // empty until the user actually submits.
    useEffect(() => {
        if (resolvedCrmEventId || existingEstimateId) return;
        const assignments = companyData?.eventAssignments || [];
        if (assignments.length === 1 && assignments[0].eventId) {
            setResolvedCrmEventId(String(assignments[0].eventId));
        }
    }, [companyData, resolvedCrmEventId, existingEstimateId]);

    // Item Details → Stall Type: every rate card configured on the Manage Stall
    // Rates page (/stall-rates) for this PI's own event — not inferred from the
    // client's booking history, so the dropdown has real options even for a
    // client with no booked stalls yet.
    useEffect(() => {
        if (!resolvedEventId) {
            setEventStallRateMap({});
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const res = await api.get(`/api/stall-rates/event/${resolvedEventId}`);
                if (cancelled) return;
                const rates = res.data?.data || [];
                setEventStallRateMap(Object.fromEntries(
                    rates.map((r) => [`${resolvedEventId}|${r.currency}|${r.stallType}`, r])
                ));
            } catch (error) {
                console.error('Error loading stall rates for this event:', error);
                if (!cancelled) setEventStallRateMap({});
            }
        })();

        return () => { cancelled = true; };
    }, [resolvedEventId]);

    // Item Details → "Stall" category: the Select Stall dropdown must only ever
    // offer stalls that are NOT already booked for this event — a booked stall
    // (by this client or anyone else) must never show up here, full stop —
    // sourced straight from stall inventory (GET /api/stalls/available). Rate/HSN
    // aren't known from the stall itself (the Stall model has no price/type on
    // it); those come from the Stall Type pick + Stall Rate card instead (see
    // eventStallRateMap above). If every stall for this event is booked, the
    // dropdown is correctly empty — there is nothing left to sell.
    useEffect(() => {
        if (!resolvedEventId) {
            setAvailableStallDetails([]);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const res = await api.get('/api/stalls/available', { params: { eventId: resolvedEventId } });
                if (cancelled) return;
                const stalls = res.data?.data || [];
                setAvailableStallDetails(stalls.map((s) => ({
                    stallFor: s.stallNumber,
                    dimension: `${s.length}x${s.width}`,
                    stallSize: s.area || 0,
                    discount: s.discountPercentage || 0,
                    plScheme: s.plScheme || 'One Side Open',
                    // PLC (Preferential Location Charge) is a % of the stall's own
                    // base cost — same field/formula BookAStand.jsx uses at booking time.
                    incrementPercentage: Number(s.incrementPercentage) || 0,
                    eventId: resolvedEventId,
                })));
            } catch (error) {
                console.error('Error loading available stalls for this event:', error);
                if (!cancelled) setAvailableStallDetails([]);
            }
        })();

        return () => { cancelled = true; };
    }, [resolvedEventId]);

    // Item Details → "Addon Product" category: purchasable accessories from the
    // shared accessories catalog (managed on the Manage Accessories page).
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get('/api/stall-accessories/accessories');
                if (cancelled) return;
                const list = (res.data?.data || []).filter((acc) => acc.type === 'purchasable');
                setAddonProductOptions(list);
            } catch (error) {
                console.error('Error loading addon product options:', error);
                if (!cancelled) setAddonProductOptions([]);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Payment plans are configured per-exhibition in Event Setup — resolve the
    // CrmEvent this PI belongs to, then load its linked Event's payment plans.
    useEffect(() => {
        if (!resolvedCrmEventId) return;

        let cancelled = false;
        (async () => {
            try {
                const crmEventRes = await api.get(`/api/crm-events/${resolvedCrmEventId}`);
                const registrationEventId = crmEventRes.data?.registrationEventId;
                if (!registrationEventId) return;
                setResolvedEventId((prev) => prev || String(registrationEventId));

                const eventRes = await api.get(`/api/events/${registrationEventId}`);
                const plans = eventRes.data?.data?.paymentPlans || [];
                if (cancelled) return;
                setPaymentPlans(plans);
                setEventStartDate(eventRes.data?.data?.startDate || '');
                // Default to Full Payment unless a plan was already chosen (e.g. prefilled from an existing estimate)
                setPaymentPlanType((prev) => {
                    if (prev) return prev;
                    const fullPlan = plans.find((plan) => Number(plan.percentage) === 100 || plan.id === 'full');
                    return fullPlan?.id || 'full';
                });
            } catch (error) {
                console.error('Error loading payment plans for this event:', error);
            }
        })();

        return () => { cancelled = true; };
    }, [resolvedCrmEventId]);

    // Performa Invoice Type follows the client's location relative to the
    // organizer (registered in Uttar Pradesh): same state → Intrastate, other
    // Indian state → Interstate Sale, outside India → Foreign Sale.
    useEffect(() => {
        if (!form.state || form.state === 'Select State') return;
        const isIndia = String(form.country || '').trim().toLowerCase() === 'india';
        const nextType = !isIndia
            ? 'Foreign Sale'
            : form.state.trim().toLowerCase() === 'uttar pradesh'
                ? 'Intrastate'
                : 'Interstate Sale';
        setField('estimateType', nextType);
    }, [form.state, form.country]);

    // Handle Estimate Type changing to update GST Option
    useEffect(() => {
        if (!form.estimateType || form.estimateType === 'Select Here') return;

        setGstOption(prev => {
            const match = prev.match(/(\d+)%/);
            const pct = match ? match[1] : '18';

            if (pct === '0') return '0% GST';

            if (form.estimateType === 'Intrastate') {
                return `${pct}% CGST+SGST`;
            } else {
                return `${pct}% IGST`;
            }
        });
    }, [form.estimateType]);

    // ── data fetching ────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchCompanyDetails = async () => {
            if (!id) return;
            try {
                let companyInfo = null;
                try {
                    const res = await api.get(`/api/companies/${id}`);
                    companyInfo = res.data;
                } catch (err) {
                    if (err.response?.status === 404 || err.response?.status === 400) {
                        const res = await api.get(`/api/exhibitor-registration/${id}`);
                        companyInfo = res.data.data || res.data;
                    } else {
                        throw err;
                    }
                }
                const actualCompanyId = companyInfo?.clientId || companyInfo?._id || id;

                // Fetch the clicked proforma first when coming from the list edit action.
                let existingEstimate = null;
                let templateEstimate = null;
                if (editEstimateId) {
                    try {
                        const estRes = await api.get(`/api/estimates/${editEstimateId}`);
                        existingEstimate = estRes.data?.data || estRes.data || null;
                    } catch (e) {
                        console.error("Error fetching selected estimate:", e);
                    }
                }

                // Fetch existing estimates
                try {
                    if (!existingEstimate) {
                        let estRes = await api.get(`/api/estimates/grouped/${actualCompanyId}`);
                        if (estRes.data?.success && estRes.data?.count > 0) {
                            templateEstimate = estRes.data.data[0]; // Get the latest one for prefill only
                        } else if (companyInfo && actualCompanyId !== companyInfo._id) {
                            estRes = await api.get(`/api/estimates/grouped/${companyInfo._id}`);
                            if (estRes.data?.success && estRes.data?.count > 0) {
                                templateEstimate = estRes.data.data[0]; // Get the latest one for prefill only
                            }
                        } else if (companyInfo && actualCompanyId !== id) {
                            estRes = await api.get(`/api/estimates/grouped/${id}`);
                            if (estRes.data?.success && estRes.data?.count > 0) {
                                templateEstimate = estRes.data.data[0]; // Get the latest one for prefill only
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error fetching existing estimates:", e);
                }

                const estimateForPrefill = existingEstimate || templateEstimate;

                if (estimateForPrefill) {
                    setCompanyData(companyInfo);
                    setExistingEstimateId(existingEstimate?._id || null);

                    // Editing an existing PI: recover which event's payment plans apply,
                    // and restore whichever plan was chosen when it was issued.
                    if (existingEstimate?.crmEventId) {
                        setResolvedCrmEventId(String(existingEstimate.crmEventId));
                    }
                    if (existingEstimate?.paymentPlanType) {
                        setPaymentPlanType(existingEstimate.paymentPlanType);
                    }
                    if (existingEstimate && typeof existingEstimate.tdsApplicable === 'boolean') {
                        setTdsApplicable(existingEstimate.tdsApplicable);
                    }
                    if (existingEstimate && typeof existingEstimate.plcPct === 'number') {
                        setPlcPctOverride(existingEstimate.plcPct);
                    }
                    if (existingEstimate?.instalments?.length) {
                        const overrides = {};
                        existingEstimate.instalments.forEach((inst) => {
                            const key = inst.id || inst.label;
                            if (key && inst.remarks) overrides[key] = inst.remarks;
                        });
                        setInstalmentRemarkOverrides(overrides);
                        // Restore exactly which phases were selected last time, so
                        // re-opening a PI that skipped a phase doesn't silently
                        // bring it back.
                        const savedPhaseIds = existingEstimate.instalments.map((inst) => inst.id).filter(Boolean);
                        if (savedPhaseIds.length) setSelectedPhaseIds(new Set(savedPhaseIds));
                    }

                    // Only an actual edit (existingEstimate, reached via the list's Edit
                    // action / editEstimateId) should reload its own saved item rows —
                    // those are real, already-issued line items. A brand-new PI that's
                    // merely borrowing header/address info from the client's last estimate
                    // (templateEstimate) must NOT also carry over that old estimate's items:
                    // stall numbers/rates/HSN go stale, and the row should instead start
                    // blank and be filled by actually picking a Stall No./Type below.
                    if (existingEstimate) {
                        const formattedItems = (existingEstimate.items || []).map((item, index) => {
                            let desc = item.description || '';
                            let subDesc = '';
                            if (desc.includes('\n')) {
                                const parts = desc.split('\n');
                                desc = parts[0];
                                subDesc = parts.slice(1).join('\n');
                            }

                            const rate = Number(item.rate || 0);
                            const qty = Number(item.qty || 1);
                            const size = Number(item.size || 0);
                            const unit = item.unit || 'Sqm';
                            const multiplier = SIZE_BASED_UNITS.includes(unit) ? (size > 0 ? size : 1) : 1;
                            const amount = roundAmount(Number(item.amount) || (qty * rate * multiplier));
                            const disc = Number(item.disc || 0);
                            const taxable = roundAmount(amount - (amount * disc) / 100);
                            // Saved items only carry gstRate ("18% IGST") / cgst_per / igst_per,
                            // not a flat gstPct — derive it back so the % input isn't blank on edit.
                            const gstPct = Number(item.igst_per) || (Number(item.cgst_per) * 2) || parseFloat(item.gstRate) || 18;

                            return {
                                ...item,
                                id: item._id || index + 1,
                                category: item.category || 'Stall',
                                description: desc,
                                subDesc: subDesc,
                                hsn: item.hsn || '',
                                qty: qty,
                                area: item.area || '3x3',
                                size: item.size || '',
                                unit: item.unit || 'Sqm',
                                rate: rate,
                                amount: amount,
                                disc: disc,
                                taxable: taxable,
                                gstPct: gstPct
                            };
                        });

                        prefillItemsRef.current = formattedItems;
                        if (itemsMode === 'default') setItems(formattedItems);
                    }

                    // Editing/viewing an already-issued PI (existingEstimate) must stay faithful to what
                    // was actually issued, so its own saved GST/address/location win. A brand-new PI that's
                    // only borrowing item/layout data from a past one (templateEstimate) should instead use
                    // the client's current profile as the source of truth, falling back to the template only
                    // when the profile itself has nothing set.
                    const useProfileFirst = !existingEstimate;
                    setForm(prev => ({
                        ...prev,
                        estimateNo: existingEstimate ? estimateForPrefill.est_no : prev.estimateNo,
                        supplyDate: estimateForPrefill.supply_date || new Date().toISOString().split('T')[0],
                        consigneeName: estimateForPrefill.company_name || companyInfo?.companyName || companyInfo?.exhibitorName || '',
                        consigneeAddress: useProfileFirst
                            ? (companyInfo?.address || companyInfo?.companyAddress || estimateForPrefill.company_addr || '')
                            : (estimateForPrefill.company_addr || companyInfo?.address || companyInfo?.companyAddress || ''),
                        // The client's own contact — Company/Billing side.
                        companyContactPerson: (existingEstimate && estimateForPrefill.company_contact_person) || companyInfo?.contactPerson || (companyInfo?.contacts && companyInfo.contacts[0] ? [companyInfo.contacts[0].firstName, companyInfo.contacts[0].surname].filter(Boolean).join(' ') : '') || '',
                        companyContactMobile: (existingEstimate && estimateForPrefill.company_contact_mobile) || companyInfo?.mobile || (companyInfo?.contacts && companyInfo.contacts[0] ? companyInfo.contacts[0].mobile : '') || '',
                        companyEmail: (existingEstimate && estimateForPrefill.company_email) || companyInfo?.email || (companyInfo?.contacts && companyInfo.contacts[0] ? companyInfo.contacts[0].email : '') || '',
                        // Consignee Person/Phone/Email is whoever is creating this PI (the
                        // logged-in admin/staff user), not the client's own contact — editing
                        // an already-issued PI still shows what was actually saved on it.
                        consigneePerson: existingEstimate ? (estimateForPrefill.consignee_person || currentUserName) : currentUserName,
                        consigneePhone: existingEstimate ? (estimateForPrefill.consignee_phone || getCurrentUserMobile()) : getCurrentUserMobile(),
                        consigneeEmail: existingEstimate ? (estimateForPrefill.consignee_email || currentUserEmail) : currentUserEmail,
                        consigneeEventName: estimateForPrefill.event_name || PROFORMA_EVENT_NAME,
                        consigneeEventAddress: estimateForPrefill.event_place_of_supply || PROFORMA_PLACE_OF_SUPPLY,
                        consigneeGstin: estimateForPrefill.event_gst_no || PROFORMA_EVENT_GST_NO,
                        consigneeCountry: existingEstimate ? (estimateForPrefill.consignee_country || 'India') : prev.consigneeCountry,
                        consigneeState: existingEstimate ? (estimateForPrefill.consignee_state || 'Delhi') : prev.consigneeState,
                        consigneeCity: existingEstimate ? (estimateForPrefill.consignee_city || 'New Delhi') : prev.consigneeCity,
                        consigneePincode: existingEstimate ? (estimateForPrefill.consignee_pincode || '110001') : prev.consigneePincode,
                        gstin: useProfileFirst
                            ? (companyInfo?.gstNumber || companyInfo?.gst || companyInfo?.gstNo || estimateForPrefill.company_gst_no || estimateForPrefill.gst_no || '')
                            : (estimateForPrefill.company_gst_no || companyInfo?.gstNumber || companyInfo?.gst || companyInfo?.gstNo || estimateForPrefill.gst_no || ''),
                        country: useProfileFirst
                            ? (companyInfo?.country || estimateForPrefill.country || '')
                            : (estimateForPrefill.country || companyInfo?.country || ''),
                        state: useProfileFirst
                            ? (companyInfo?.state || estimateForPrefill.state || '')
                            : (estimateForPrefill.state || companyInfo?.state || ''),
                        city: useProfileFirst
                            ? (companyInfo?.city || estimateForPrefill.city || '')
                            : (estimateForPrefill.city || companyInfo?.city || ''),
                        pinCode: useProfileFirst
                            ? (companyInfo?.pinCode || companyInfo?.pincode || estimateForPrefill.pincode || '')
                            : (estimateForPrefill.pincode || companyInfo?.pinCode || companyInfo?.pincode || ''),
                    }));

                    if (!existingEstimate) {
                        try {
                            const res = await api.get('/api/estimates/next-number');
                            if (res.data?.est_no) {
                                setForm(prev => ({ ...prev, estimateNo: res.data.est_no }));
                            }
                        } catch (error) {
                            console.error("Error fetching next estimate no:", error);
                        }
                    }
                } else if (companyInfo) {
                    // Pre-fill with just company info
                    setCompanyData(companyInfo);
                    setForm(prev => ({
                        ...prev,
                        consigneeName: companyInfo.companyName || companyInfo.exhibitorName || '',
                        consigneeAddress: companyInfo.address || companyInfo.companyAddress || '',
                        companyContactPerson: companyInfo.contactPerson || (companyInfo.contacts && companyInfo.contacts[0] ? [companyInfo.contacts[0].firstName, companyInfo.contacts[0].surname].filter(Boolean).join(' ') : '') || '',
                        companyContactMobile: companyInfo.mobile || (companyInfo.contacts && companyInfo.contacts[0] ? companyInfo.contacts[0].mobile : '') || '',
                        companyEmail: companyInfo.email || (companyInfo.contacts && companyInfo.contacts[0] ? companyInfo.contacts[0].email : '') || '',
                        consigneePerson: currentUserName,
                        consigneePhone: getCurrentUserMobile(),
                        consigneeEmail: currentUserEmail,
                        consigneeEventName: PROFORMA_EVENT_NAME,
                        consigneeEventAddress: PROFORMA_PLACE_OF_SUPPLY,
                        consigneeGstin: PROFORMA_EVENT_GST_NO,
                        gstin: companyInfo.gst || companyInfo.gstNo || companyInfo.gstNumber || '',
                        country: companyInfo.country || '',
                        state: companyInfo.state || '',
                        city: companyInfo.city || '',
                        pinCode: companyInfo.pinCode || companyInfo.pincode || '',
                    }));

                    // Since it's a new estimate, fetch next number
                    try {
                        const res = await api.get('/api/estimates/next-number');
                        if (res.data?.est_no) {
                            setForm(prev => ({ ...prev, estimateNo: res.data.est_no }));
                        }
                    } catch (error) {
                        console.error("Error fetching next estimate no:", error);
                    }
                }
            } catch (error) {
                console.error("Error fetching company details:", error);
            }
        };

        fetchCompanyDetails();
    }, [id, editEstimateId]);

    // ── computed ─────────────────────────────────────────────────────────────────
    // Company / Billing Details' Contact Person is the one editable field in that
    // section — a dropdown over the CRM Company's saved contacts (or, when this PI
    // is against an ExhibitorRegistration instead, its contact1/contact2/
    // accountsContact) — selecting one drives Mobile/Email, which aren't
    // independently editable.
    const companyContactOptions = companyData?.contacts?.length
        ? companyData.contacts.map((c, i) => ({
            key: c._id || `c-${i}`,
            label: toTitleCase([c.firstName, c.surname].filter(Boolean).join(' ') || c.name) || `Contact ${i + 1}`,
            mobile: c.mobile || '',
            email: c.email || '',
        }))
        : [companyData?.contact1, companyData?.contact2, companyData?.accountsContact]
            .filter(Boolean)
            .map((c, i) => ({
                key: `c-${i}`,
                label: toTitleCase([c.firstName, c.lastName].filter(Boolean).join(' ')) || `Contact ${i + 1}`,
                mobile: c.mobile || '',
                email: c.email || '',
            }));

    const subTotal = roundAmount(items.reduce((s, i) => s + Number(i.amount || 0), 0));
    const calculatedDiscount = roundAmount(items.reduce((s, i) => s + (Number(i.amount || 0) * Number(i.disc || 0)) / 100, 0));
    const isIGST = gstOption.includes('IGST');
    // The Stall Type column is only meaningful for Stall rows — if every row in
    // the table is an Addon Product, drop the column (header included) entirely
    // instead of showing a label over a permanently-empty cell.
    const showStallTypeColumn = itemsMode === 'default' && items.some((item) => item.category === 'Stall');

    // PLC (Preferential Location Charge) for the invoice's primary stall — a %
    // of the stall's own base cost (Stall Inventory's incrementPercentage),
    // same formula BookAStand.jsx uses at booking time: baseCost × PLC% / 100.
    const primaryStallItem = items.find((i) => i.category === 'Stall' && i.description && i.stallType);
    const primaryStallDetail = primaryStallItem
        ? availableStallDetails.find((d) => d.stallFor === primaryStallItem.description)
        : null;
    const plcCurrency = String(form.country || '').trim().toLowerCase() === 'india' ? 'INR' : 'USD';
    const primaryStallRateDoc = primaryStallDetail
        ? eventStallRateMap[`${primaryStallDetail.eventId}|${plcCurrency}|${primaryStallItem.stallType}`]
        : null;
    const defaultPlcPct = Number(primaryStallDetail?.incrementPercentage) || 0;
    const plcPct = plcPctOverride !== null ? plcPctOverride : defaultPlcPct;
    const plcCharges = roundAmount((Number(primaryStallItem?.amount) || 0) * plcPct / 100);
    // PLC is taxed at the same GST rate as the stall it belongs to.
    const plcGstPct = Number(primaryStallItem?.gstPct) || 18;
    const plcGstAmount = roundAmount((plcCharges * plcGstPct) / 100);
    const plcFinalAmount = plcCharges + plcGstAmount;

    // A manually-edited PLC % only makes sense for the stall it was entered
    // against — if the primary stall actually changes (not just the initial
    // load), drop the override so the new stall's own default applies.
    const primaryStallKeyRef = useRef(undefined);
    useEffect(() => {
        const key = primaryStallItem?.description || null;
        if (primaryStallKeyRef.current !== undefined && primaryStallKeyRef.current !== key) {
            setPlcPctOverride(null);
        }
        primaryStallKeyRef.current = key;
    }, [primaryStallItem?.description]);

    // Taxable Value / GST / Final Amount now include PLC Charges — it's a real
    // part of what the client owes, not just an informational side note.
    const taxable = roundAmount(subTotal - calculatedDiscount + plcCharges);
    // GST is per item (each row's own GST % applied to its own taxable value),
    // summed for the invoice total — not one flat rate applied to the whole
    // taxable amount — plus PLC's own GST.
    const totalTax = roundAmount(items.reduce((s, i) => {
        const itemAmount = Number(i.amount) || 0;
        const itemDisc = Number(i.disc) || 0;
        const itemTaxable = itemAmount - (itemAmount * itemDisc) / 100;
        const itemGstPct = Number(i.gstPct) || 0;
        return s + (itemTaxable * itemGstPct) / 100;
    }, plcGstAmount));
    const grandTotal = roundAmount(taxable + totalTax);

    // TDS Deduction notes — configured per Stall Rate card (Manage Stall
    // Rates), separately for Full Payment vs Instalment Payment. If the rate
    // card hasn't been customized (empty list), fall back to the standard
    // Section 194C wording so existing/unconfigured events aren't left blank.
    const tdsFullPaymentLines = primaryStallRateDoc?.tdsFullPaymentLines?.length
        ? primaryStallRateDoc.tdsFullPaymentLines
        : [
            'TDS under Section 194C shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.',
            'Please share the applicable TDS Certificate (Form 16A) after deduction.',
        ];
    const tdsInstalmentPaymentLines = primaryStallRateDoc?.tdsInstalmentPaymentLines?.length
        ? primaryStallRateDoc.tdsInstalmentPaymentLines
        : [
            'TDS under Section 194C shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.',
        ];

    // Payment Plan: Full Payment vs Instalment Plan — same single/multi-phase
    // resolution already used for the dropdown, now driving radio buttons.
    const fullPaymentPlan = paymentPlans.find((plan) => Number(plan.percentage) === 100 || plan.id === 'full');
    const firstInstalmentPlan = paymentPlans.find((plan) => plan.id === 'advance')
        || paymentPlans.filter((plan) => Number(plan.percentage) < 100)[0];
    const fullPaymentId = fullPaymentPlan?.id || 'full';
    const instalmentPlanId = firstInstalmentPlan?.id || 'installment';
    const isInstalmentPlanSelected = paymentPlanType === instalmentPlanId;

    // Full Payment's Payment Terms text — always this single line, not the
    // Estimate Terms config's Payment Conditions list.
    const fullPaymentConditions = ['Advance Payment – 100%: Full payment is payable in advance on the same day of Proforma Invoice (PI) generation.'];

    // Instalment schedule = the event's configured payment-plan phases (< 100%
    // each, from Event Setup), amounts split from this invoice's own Final
    // Amount, due dates computed relative to the event's own start date.
    const computeInstalmentDueDate = (plan) => {
        if (plan.dueDate) return new Date(plan.dueDate);
        if (eventStartDate && plan.dueDaysBeforeEvent) {
            const d = new Date(eventStartDate);
            d.setDate(d.getDate() - Number(plan.dueDaysBeforeEvent));
            return d;
        }
        return null;
    };
    // All of the event's configured instalment phases, before this PI's own
    // selection is applied — used to drive the phase checkboxes below.
    const allInstalmentPhases = paymentPlans
        .filter((plan) => Number(plan.percentage) < 100)
        .sort((a, b) => (a.id === 'advance' ? -1 : b.id === 'advance' ? 1 : 0))
        .map((plan) => ({ id: plan.id, label: plan.label, percentage: Number(plan.percentage) || 0, plan }));
    const effectiveSelectedPhaseIds = selectedPhaseIds !== null
        ? selectedPhaseIds
        : new Set(allInstalmentPhases.map((p) => p.id));
    const selectedPhases = allInstalmentPhases.filter((p) => effectiveSelectedPhaseIds.has(p.id));
    // Skipping a phase (e.g. this deal only uses Advance + Final, not Mid
    // Payment) means the remaining selected phases must still cover 100% of
    // the invoice — redistribute the dropped phase's % proportionally across
    // what's left, rather than under-billing.
    const selectedPctBase = selectedPhases.reduce((s, p) => s + p.percentage, 0);
    let runningInstalmentTotal = 0;
    const instalmentRows = selectedPhases.map((p, idx) => {
        const redistributedPct = selectedPctBase > 0 ? (p.percentage * 100) / selectedPctBase : 0;
        const isLast = idx === selectedPhases.length - 1;
        // Remainder goes to the last row so rounding never leaves the total
        // short of (or over) the invoice's actual Grand Total.
        const amount = isLast
            ? Math.max(0, grandTotal - runningInstalmentTotal)
            : roundAmount((grandTotal * redistributedPct) / 100);
        runningInstalmentTotal += amount;
        return {
            id: p.id,
            label: p.label,
            percentage: Math.round(redistributedPct * 100) / 100,
            amount,
            dueDate: computeInstalmentDueDate(p.plan),
        };
    });
    const instalmentTotalPct = instalmentRows.reduce((s, r) => s + r.percentage, 0);
    const instalmentTotalAmt = instalmentRows.reduce((s, r) => s + r.amount, 0);
    const formatDueDate = (date) => date
        ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
        : '—';
    const formatDueDateLong = (date) => date
        ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
        : '';
    // First phase is always payable immediately on generating the PI; every
    // later phase is payable by its own due date — this is just the default
    // text though, each row's Remarks stays freely editable (instalmentRemarkOverrides).
    const instalmentRowsWithRemark = instalmentRows.map((row, idx) => {
        const defaultRemark = idx === 0
            ? 'Payable on the same day of PI generation'
            : `Payable on or before ${formatDueDateLong(row.dueDate)}`;
        return {
            ...row,
            remark: instalmentRemarkOverrides[row.id] ?? defaultRemark,
        };
    });
    const togglePhase = (phaseId) => {
        setSelectedPhaseIds((prev) => {
            const base = prev !== null ? prev : new Set(allInstalmentPhases.map((p) => p.id));
            const next = new Set(base);
            if (next.has(phaseId)) next.delete(phaseId);
            else next.add(phaseId);
            return next;
        });
    };

    // ── dynamic location options ─────────────────────────────────────────────────
    const countriesArr = ['Select Country', ...(reduxCountries || []).map(c => c.name).filter(Boolean)];

    // Shared cascading logic — used for both the company/billing address and
    // the consignee's own address, which has the same divided fields.
    const getFilteredStatesArr = (country) => {
        if (!country || !reduxStates?.length) return ["Select State"];
        const countryObj = reduxCountries.find(c => c.name && c.name.trim().toLowerCase() === country.trim().toLowerCase());
        if (!countryObj) return ["Select State"];
        const filtered = reduxStates.filter(s => String(s.countryCode) === String(countryObj.countryCode));
        return ["Select State", ...filtered.map(s => s.name).filter(Boolean)];
    };

    const getFilteredCitiesArr = (state) => {
        if (!state || !reduxCities) return ["Select City"];
        const actualCities = reduxCities.data || reduxCities || [];
        if (!actualCities.length) return ["Select City"];
        const stateObj = reduxStates.find(s => s.name && s.name.trim().toLowerCase() === state.trim().toLowerCase());
        if (!stateObj) return ["Select City"];
        const filtered = actualCities.filter(c => String(c.stateCode) === String(stateObj.stateCode));
        return ["Select City", ...filtered.map(c => c.name).filter(Boolean)];
    };

    const consigneeFilteredStatesArr = getFilteredStatesArr(form.consigneeCountry);
    const consigneeFilteredCitiesArr = getFilteredCitiesArr(form.consigneeState);

    const consigneeCountryOptions = [...Array.from(new Set([...countriesArr, form.consigneeCountry].filter(Boolean)))].map(c => ({ label: c, value: c }));
    const consigneeStateOptions = [...Array.from(new Set([...consigneeFilteredStatesArr, form.consigneeState].filter(Boolean)))].map(s => ({ label: s, value: s }));
    const consigneeCityOptions = [...Array.from(new Set([...consigneeFilteredCitiesArr, form.consigneeCity].filter(Boolean)))].map(c => ({ label: c, value: c }));

    // ── item handlers ────────────────────────────────────────────────────────────
    const updateItem = useCallback((id, field, val) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const updated = { ...item, [field]: val };
                const rate = Number(field === 'rate' ? val : updated.rate) || 0;
                const qty = Number(field === 'qty' ? val : updated.qty) || 0;
                const size = Number(field === 'size' ? val : updated.size) || 0;
                const disc = Number(field === 'disc' ? val : updated.disc) || 0;
                const unit = field === 'unit' ? val : updated.unit;
                const multiplier = SIZE_BASED_UNITS.includes(unit) ? (size > 0 ? size : 1) : 1;
                updated.amount = roundAmount(qty * rate * multiplier);
                updated.taxable = roundAmount(updated.amount - (updated.amount * disc) / 100);
                return updated;
            })
        );
    }, []);

    // Rate currency follows the client's Country, not the stall's original
    // booking currency — India bills in INR, every other country in USD.
    const getClientCurrency = useCallback(
        () => (String(form.country || '').trim().toLowerCase() === 'india' ? 'INR' : 'USD'),
        [form.country]
    );

    // The event to price against: the stall's own event if one is selected,
    // else this PI's own resolved event.
    const getPricingEventId = useCallback(
        (detail) => detail?.eventId || resolvedEventId || '',
        [resolvedEventId]
    );

    // Rate + HSN for a stall depend on its Stall Type and the client's billing
    // currency (looked up on the per-event Stall Rate card) — resolve together.
    const getRateForType = useCallback((eventId, stallType) => {
        const currency = getClientCurrency();
        const rateDoc = eventStallRateMap[`${eventId}|${currency}|${stallType}`];
        // A stall booking is a service (SAC), not goods — SAC Code is the
        // correct classification here; hsnCode is only a fallback for rate
        // cards saved before SAC Code existed as its own field.
        return { rate: rateDoc?.ratePerSqm || 0, hsn: rateDoc?.sacCode || rateDoc?.hsnCode || '' };
    }, [eventStallRateMap, getClientCurrency]);

    // Stall Type options come from what's actually configured on the Manage
    // Stall Rates page for this event + the client's billing currency — not a
    // hardcoded list — so a type nobody priced there (in that currency) can't
    // be picked.
    const getStallTypeOptions = useCallback((item) => {
        const detail = availableStallDetails.find((d) => d.stallFor === item.description);
        const eventId = getPricingEventId(detail);
        const currency = getClientCurrency();
        const options = eventId
            ? STALL_TYPES.filter((t) => !!eventStallRateMap[`${eventId}|${currency}|${t}`])
            : [...new Set(
                Object.keys(eventStallRateMap)
                    .filter((key) => eventStallRateMap[key] && key.split('|')[1] === currency)
                    .map((key) => key.split('|')[2])
            )];
        return item.stallType && !options.includes(item.stallType) ? [item.stallType, ...options] : options;
    }, [availableStallDetails, eventStallRateMap, getClientCurrency, getPricingEventId]);

    // Picking a stall auto-fills everything the system already knows about it
    // (area/size, discount) plus rate/HSN for its originally booked stall type.
    // The Stall model has no price/type on the stall itself — those come from
    // Stall Type (picked separately, resolved against the Stall Rate card). So
    // picking a stall only fills Qty/Area/Size/Unit/Disc; Rate/HSN are left as
    // whatever they already are (recomputed against the new size if a Stall
    // Type was already picked, otherwise still 0 until it is).
    const selectStall = useCallback((id, stallFor) => {
        const detail = availableStallDetails.find((d) => d.stallFor === stallFor);
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                if (!detail) return { ...item, description: stallFor };
                const qty = 1;
                const size = detail.stallSize;
                const disc = detail.discount || 0;
                const unit = 'Sqm';
                const rate = Number(item.rate) || 0;
                const multiplier = SIZE_BASED_UNITS.includes(unit) ? (size > 0 ? size : 1) : 1;
                const amount = roundAmount(qty * rate * multiplier);
                return {
                    ...item,
                    description: stallFor,
                    qty,
                    area: detail.dimension,
                    size,
                    unit,
                    disc,
                    amount,
                    taxable: roundAmount(amount - (amount * disc) / 100),
                    plScheme: detail.plScheme || '',
                };
            })
        );
    }, [availableStallDetails]);

    // Switching Stall Type re-resolves Rate + HSN for this PI's event and the
    // client's billing currency, leaving Qty/Area/Size/Unit (which come from the
    // stall itself, not its type) untouched.
    const selectStallType = useCallback((id, stallType) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const detail = availableStallDetails.find((d) => d.stallFor === item.description);
                const { rate, hsn } = getRateForType(getPricingEventId(detail), stallType);
                const qty = Number(item.qty) || 1;
                const size = Number(item.size) || 0;
                const disc = Number(item.disc) || 0;
                const multiplier = SIZE_BASED_UNITS.includes(item.unit) ? (size > 0 ? size : 1) : 1;
                const amount = roundAmount(qty * rate * multiplier);
                return {
                    ...item,
                    stallType,
                    rate,
                    hsn: hsn || item.hsn,
                    amount,
                    taxable: roundAmount(amount - (amount * disc) / 100),
                };
            })
        );
    }, [availableStallDetails, getRateForType, getPricingEventId]);

    // Picking an Addon Product auto-fills everything the accessories catalog
    // already knows about it (HSN/SAC, unit, rate, dimensions) instead of
    // leaving those to be typed.
    const selectAddonProduct = useCallback((id, productName) => {
        const product = addonProductOptions.find((p) => p.name === productName);
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                if (!product) return { ...item, description: productName };
                const qty = 1;
                const rate = Number(product.price) || 0;
                const unit = product.unit || item.unit;
                const size = (product.length && product.width) ? Number(product.length) * Number(product.width) : 0;
                const area = (product.length && product.width) ? `${product.length}x${product.width}` : '';
                const multiplier = SIZE_BASED_UNITS.includes(unit) ? (size > 0 ? size : 1) : 1;
                const disc = Number(item.disc) || 0;
                const amount = roundAmount(qty * rate * multiplier);
                return {
                    ...item,
                    description: productName,
                    // Falls back to the standard misc.-services SAC code when the
                    // accessory catalog entry itself has no HSN/SAC filled in yet —
                    // otherwise the row silently carries forward whatever (often
                    // blank) HSN the row already had.
                    hsn: product.hsnCode || product.sacCode || '998596',
                    qty,
                    area,
                    size,
                    unit,
                    rate,
                    gstPct: product.gstPercent ?? item.gstPct ?? 18,
                    amount,
                    taxable: roundAmount(amount - (amount * disc) / 100),
                };
            })
        );
    }, [addonProductOptions]);

    const addItem = () => setItems((p) => [...p, newItem()]);
    const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));

    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSendWhatsApp = async () => {
        const estId = existingEstimateId;
        if (!estId) {
            Swal.fire('Error', 'Please generate the estimate first before sending.', 'error');
            return;
        }

        let phone = '';
        if (companyData) {
            phone = companyData.contact1?.mobile || companyData.mobile || companyData.landlineNo || '';
        }

        if (!phone) {
            Swal.fire('Error', 'No mobile number found for this client.', 'error');
            return;
        }

        try {
            setIsWhatsAppLoading(true);
            const res = await api.post(`/api/estimates/${estId}/send-whatsapp`, { phone });
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
        const estId = existingEstimateId;
        if (!estId) {
            Swal.fire('Error', 'Please generate the estimate first before sending.', 'error');
            return;
        }

        let email = '';
        if (companyData) {
            email = companyData.contact1?.email || companyData.email || '';
        }

        if (!email) {
            Swal.fire('Error', 'No email address found for this client.', 'error');
            return;
        }

        try {
            setIsEmailLoading(true);
            const res = await api.post(`/api/estimates/${estId}/send-email`, { email });
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

    const handleGenerateEstimate = async () => {
        const actualCompanyId = companyData?.clientId || companyData?._id || id;
        if (!actualCompanyId) {
            Swal.fire('Error', 'Company ID is missing!', 'error');
            return;
        }

        // Which CrmEvent (Organic Expo 2026, IHW Expo 2026, ...) this Estimate
        // belongs to — carried via query param from the client's Account tab.
        // Only resolved/required on create: editing an existing Estimate is
        // reached from a different, non-scoped navigation and must not have
        // its crmEventId cleared just because this page didn't receive one.
        let crmEventId = new URLSearchParams(location.search).get('crmEventId') || '';
        if (!existingEstimateId && !crmEventId) {
            const assignments = companyData?.eventAssignments || [];
            if (assignments.length === 1) {
                crmEventId = String(assignments[0].eventId || '');
            } else if (assignments.length > 1) {
                Swal.fire(
                    'Event required',
                    "This client belongs to more than one event. Open it from that specific event's list to create a Performa Invoice.",
                    'warning',
                );
                return;
            } else {
                Swal.fire(
                    'Exhibition required',
                    'This client is not assigned to any exhibition yet. Assign it to an exhibition before creating a Proforma Invoice.',
                    'warning',
                );
                return;
            }
        }

        const payload = {
            companyId: actualCompanyId,
            ...(crmEventId ? { crmEventId } : {}),
            est_type: form.estimateType,
            gst_no: form.gstin,
            supply_date: form.supplyDate,
            company_name: form.consigneeName,
            company_addr: form.consigneeAddress,
            company_gst_no: form.gstNo || form.gst_no || form.gstin || "",
            event_name: form.consigneeEventName,
            event_place_of_supply: form.consigneeEventAddress,
            event_gst_no: form.consigneeGstin,
            consignee_name: form.consigneeEventName,
            consignee_addr: form.consigneeEventAddress,
            consignee_person: form.consigneePerson,
            consignee_phone: form.consigneePhone,
            consignee_email: form.consigneeEmail,
            company_contact_person: form.companyContactPerson,
            company_contact_mobile: form.companyContactMobile,
            company_email: form.companyEmail,
            consignee_country: form.consigneeCountry,
            consignee_state: form.consigneeState,
            consignee_city: form.consigneeCity,
            consignee_pincode: form.consigneePincode,
            country: form.country,
            state: form.state,
            city: form.city,
            pincode: form.pinCode,
            items: items.map(i => ({
                category: i.category,
                plScheme: i.plScheme || '',
                stallType: i.stallType || '',
                description: i.description + (i.subDesc ? `\n${i.subDesc}` : ''),
                hsn: i.hsn,
                qty: i.qty,
                area: i.area,
                size: i.size,
                unit: i.unit,
                rate: i.rate,
                amount: i.amount,
                disc: i.disc,
                tax: roundAmount((i.taxable * (Number(i.gstPct) || 0)) / 100),
                gstRate: `${i.gstPct}% ${isIGST ? 'IGST' : 'CGST+SGST'}`,
                cgst: isIGST ? 0 : roundAmount((i.taxable * ((Number(i.gstPct) || 0) / 2)) / 100),
                cgst_per: isIGST ? "0" : String((Number(i.gstPct) || 0) / 2),
                igst_per: isIGST ? String(Number(i.gstPct) || 0) : "0",
                finalAmount: roundAmount(i.taxable + ((i.taxable * (Number(i.gstPct) || 0)) / 100)),
                remarks: ''
            })),
            finalAmount: grandTotal,
            paymentPlanType,
            paymentPlanLabel: paymentPlans.find(p => p.id === paymentPlanType)?.label || '',
            plcPct,
            plcCharges,
            plcGstPct,
            plcGstAmount,
            plcFinalAmount,
            tdsApplicable,
            tdsLines: tdsApplicable
                ? (isInstalmentPlanSelected ? tdsInstalmentPaymentLines : tdsFullPaymentLines)
                : [],
            instalments: isInstalmentPlanSelected
                ? instalmentRowsWithRemark.map((row) => ({
                    id: row.id,
                    label: row.label,
                    percentage: row.percentage,
                    amount: row.amount,
                    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
                    remarks: row.remark,
                }))
                : [],
            paymentConditions: isInstalmentPlanSelected ? [] : fullPaymentConditions,
            added_by: currentUserName,
            status: 'active'
        };

        try {
            if (existingEstimateId) {
                const previewResponse = await api.post(
                    `/api/estimates/${existingEstimateId}/impact-preview`,
                    payload
                );
                const preview = previewResponse.data;

                if (!preview?.hasChanges) {
                    await Swal.fire({
                        icon: 'info',
                        title: 'No changes found',
                        text: 'Proforma Invoice data is already up to date.',
                    });
                    return;
                }

                const confirmation = await Swal.fire({
                    icon: preview?.hasImpact ? 'warning' : 'question',
                    title: 'Review PI Changes',
                    html: buildImpactPreviewHtml(preview),
                    width: 720,
                    showCancelButton: true,
                    confirmButtonText: 'Save PI Changes',
                    cancelButtonText: 'Review Again',
                    confirmButtonColor: '#166534',
                    reverseButtons: true,
                });
                if (!confirmation.isConfirmed) return;

                const res = await api.put(`/api/estimates/${existingEstimateId}`, payload);
                if (res.data?.message) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Performa Invoice updated successfully!',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    navigate(`/payments/estimateDetails/${existingEstimateId}`);
                }
            } else {
                const res = await api.post('/api/estimates', payload);
                if (res.data?.message) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Performa Invoice created successfully!',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    const newEstimateId = res.data.data?._id || res.data._id;
                    navigate(`/payments/estimateDetails/${newEstimateId}`);
                }
            }
        } catch (error) {
            console.error("Error saving estimate:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to save estimate', 'error');
        }
    };

    // ── render ────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
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
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between ">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Create Performa Invoice</h1>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                        <span className="hover:text-blue-600 cursor-pointer">Home</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="hover:text-blue-600 cursor-pointer">Proforma Invoices</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-600">Create Performa Invoice</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/performa-invoice-list/all')}
                        className="flex items-center gap-1.5 border border-blue-300 bg-blue-50 rounded px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                    >
                        <List className="w-3.5 h-3.5" />
                        All Proforma Invoices
                    </button>
                    <button
                        onClick={() => navigate('/ihweClientData2026/masterData')}
                        className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                        <List className="w-3.5 h-3.5" />
                        Master List
                    </button>
                </div>
            </div>

            {/* ── body ── */}
            <div className="px-3.5 pt-3.5 pb-1">
                <div className="flex-1 space-y-3 min-w-0">

                    {/* SECTION 1 – Company, Billing & Consignee Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <SectionHead num="1" label="Company, Billing & Consignee Information" />

                        {/* Invoice meta */}
                        <div className="flex flex-wrap items-end gap-3 mb-4">
                            <div className="flex-1 min-w-[160px]">
                                <Label required>Proforma Invoice No.</Label>
                                <Input value={form.estimateNo} onChange={(e) => setField('estimateNo', e.target.value)} />
                            </div>
                            <div className="flex-1 min-w-[160px]">
                                <Label required>Supply Date</Label>
                                <Input type="date" value={form.supplyDate} onChange={(e) => setField('supplyDate', e.target.value)} />
                            </div>
                            <div className="flex items-center gap-4 h-[32px]">
                                {ESTIMATE_TYPES.map((type) => (
                                    <label key={type} className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] cursor-pointer whitespace-nowrap">
                                        <input
                                            type="radio"
                                            name="estimateType"
                                            value={type}
                                            checked={form.estimateType === type}
                                            onChange={() => setField('estimateType', type)}
                                            className="accent-[#3b82f6]"
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* LEFT – Company / Billing Details */}
                            <div className="border border-gray-100 rounded-lg p-4">
                                <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-3">Company / Billing Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <Label>Company Name</Label>
                                        <ReadOnlyField value={form.consigneeName} placeholder="Company name" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label required>Contact Person</Label>
                                            <select
                                                value={form.companyContactPerson}
                                                onChange={(e) => {
                                                    const selected = companyContactOptions.find((c) => c.label === e.target.value);
                                                    setForm((f) => ({
                                                        ...f,
                                                        companyContactPerson: e.target.value,
                                                        companyContactMobile: selected?.mobile || f.companyContactMobile,
                                                        companyEmail: selected?.email || f.companyEmail,
                                                    }));
                                                }}
                                                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px] cursor-pointer"
                                            >
                                                {!companyContactOptions.length && (
                                                    <option value="">No saved contacts</option>
                                                )}
                                                {!companyContactOptions.some((c) => c.label === form.companyContactPerson) && form.companyContactPerson && (
                                                    <option value={form.companyContactPerson}>{form.companyContactPerson}</option>
                                                )}
                                                {companyContactOptions.map((c) => (
                                                    <option key={c.key} value={c.label}>{c.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Mobile No.</Label>
                                            <ReadOnlyField value={form.companyContactMobile} placeholder="Mobile Number" />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <ReadOnlyField value={form.companyEmail} placeholder="Email" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Address</Label>
                                        <ReadOnlyField value={form.consigneeAddress} placeholder="Company address" />
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div>
                                            <Label>Country</Label>
                                            <ReadOnlyField value={form.country} placeholder="Country" />
                                        </div>
                                        <div>
                                            <Label>State</Label>
                                            <ReadOnlyField value={form.state} placeholder="State" />
                                        </div>
                                        <div>
                                            <Label>City</Label>
                                            <ReadOnlyField value={form.city} placeholder="City" />
                                        </div>
                                        <div>
                                            <Label>Pin Code</Label>
                                            <ReadOnlyField value={form.pinCode} placeholder="110001" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>GSTIN No. / PAN No.</Label>
                                        <ReadOnlyField value={form.gstin} placeholder="GSTIN / PAN No." />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT – Consignee Details */}
                            <div className="border border-gray-100 rounded-lg p-4">
                                <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-3">Consignee Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <Label required>Consignee Name</Label>
                                        <Input value={form.consigneeEventName} onChange={(e) => setField('consigneeEventName', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label required>Contact Person</Label>
                                            <Input placeholder="Contact Person" value={form.consigneePerson} onChange={(e) => setField('consigneePerson', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label required>Mobile No.</Label>
                                            <Input placeholder="Contact Number" value={form.consigneePhone} onChange={(e) => setField('consigneePhone', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label required>Email</Label>
                                            <Input type="email" placeholder="Email" value={form.consigneeEmail} onChange={(e) => setField('consigneeEmail', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>Consignee Address</Label>
                                        <Input placeholder="Consignee address" value={form.consigneeEventAddress} onChange={(e) => setField('consigneeEventAddress', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div>
                                            <Label required>Country</Label>
                                            <SearchableDropdown
                                                options={consigneeCountryOptions}
                                                value={form.consigneeCountry}
                                                onChange={(e) => {
                                                    setForm(f => ({ ...f, consigneeCountry: e.target.value, consigneeState: '', consigneeCity: '' }));
                                                }}
                                                placeholder="Select Country"
                                            />
                                        </div>
                                        <div>
                                            <Label required>State</Label>
                                            <SearchableDropdown
                                                options={consigneeStateOptions}
                                                value={form.consigneeState}
                                                onChange={(e) => {
                                                    setForm(f => ({ ...f, consigneeState: e.target.value, consigneeCity: '' }));
                                                }}
                                                placeholder="Select State"
                                                disabled={!form.consigneeCountry || form.consigneeCountry === 'Select Country'}
                                            />
                                        </div>
                                        <div>
                                            <Label required>City</Label>
                                            <SearchableDropdown
                                                options={consigneeCityOptions}
                                                value={form.consigneeCity}
                                                onChange={(e) => setField('consigneeCity', e.target.value)}
                                                placeholder="Select City"
                                                disabled={!form.consigneeState || form.consigneeState === 'Select State'}
                                            />
                                        </div>
                                        <div>
                                            <Label required>Pin Code</Label>
                                            <Input placeholder="110001" maxLength={6} value={form.consigneePincode} onChange={(e) => setField('consigneePincode', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>GSTIN / UIN</Label>
                                        <Input value={form.consigneeGstin} onChange={(e) => setField('consigneeGstin', e.target.value.toUpperCase())} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2 – Item & Pricing */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <SectionHead num="2" label="Item & Pricing Details" />
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] cursor-pointer">
                                    <input
                                        type="radio"
                                        name="itemsMode"
                                        value="default"
                                        checked={itemsMode === 'default'}
                                        onChange={() => setItemsMode('default')}
                                        className="accent-[#3b82f6]"
                                    />
                                    Default
                                </label>
                                <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] cursor-pointer">
                                    <input
                                        type="radio"
                                        name="itemsMode"
                                        value="custom"
                                        checked={itemsMode === 'custom'}
                                        onChange={() => setItemsMode('custom')}
                                        className="accent-[#3b82f6]"
                                    />
                                    Custom
                                </label>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px] border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        {(itemsMode === 'default'
                                            ? ['#', 'Item Category *', 'Item Description *', ...(showStallTypeColumn ? ['Stall Type'] : []), 'HSN No. *', 'Qty. *', 'Area', 'Size', 'Unit *', 'Rate (₹) *', 'Basic Amt', 'GST%', 'GST Amt', 'Disc%', 'Disc Amt', 'Total Amt', 'Action']
                                            : ['#', 'Item Description *', 'HSN No. *', 'Qty. *', 'Area', 'Size', 'Unit *', 'Rate (₹) *', 'Basic Amt.', 'GST %', 'Amount (₹)', 'Disc. %', 'Disc Amt.', 'Total Amt.', 'Action']
                                        ).map((h, i) => (
                                            <th key={i} className="text-left px-1 py-2 font-medium text-[#1a2b4b] whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className=" hover:bg-gray-50/50 border-b border-gray-50 last:border-0">
                                            <td className="px-1 py-1.5 w-5 font-medium text-slate-400 text-center">{idx + 1}</td>
                                            {itemsMode === 'default' && (
                                                <td className="px-1 py-1.5 w-36">
                                                    <select className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] cursor-pointer" value={item.category || 'Stall'} onChange={(e) => { updateItem(item.id, 'category', e.target.value); updateItem(item.id, 'description', ''); updateItem(item.id, 'stallType', ''); }}>
                                                        {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{ITEM_CATEGORY_LABELS[c] || c}</option>)}
                                                    </select>
                                                </td>
                                            )}
                                            <td className="px-1 py-1.5 w-36">
                                                <div className='border border-gray-200 rounded-md overflow-hidden focus-within:border-[#3b82f6] focus-within:ring-1 focus-within:ring-[#3b82f6]/20 transition-all shadow-sm'>
                                                    {itemsMode === 'custom' ? (
                                                        <input
                                                            className="w-full px-1.5 py-1 text-[11px] text-[#1a2b4b] focus:outline-none bg-white"
                                                            value={item.description}
                                                            placeholder="Item description"
                                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        />
                                                    ) : item.category === 'Stall' ? (
                                                        <ItemSearchSelect
                                                            placeholder="Select Stall"
                                                            value={item.description}
                                                            onChange={(val) => selectStall(item.id, val)}
                                                            options={(item.description && !availableStallDetails.some((d) => d.stallFor === item.description)
                                                                ? [item.description, ...availableStallDetails.map((d) => d.stallFor)]
                                                                : availableStallDetails.map((d) => d.stallFor)
                                                            ).map((stallNo) => ({ label: stallNo, value: stallNo }))}
                                                        />
                                                    ) : (
                                                        <ItemSearchSelect
                                                            placeholder="Select Add-on Product"
                                                            value={item.description}
                                                            onChange={(val) => selectAddonProduct(item.id, val)}
                                                            options={(item.description && !addonProductOptions.some((p) => p.name === item.description)
                                                                ? [{ _id: 'current', name: item.description }, ...addonProductOptions]
                                                                : addonProductOptions
                                                            ).map((product) => ({ label: product.name, value: product.name }))}
                                                        />
                                                    )}
                                                    {item.description && (
                                                        <input
                                                            className="w-full border-t border-gray-100 px-1.5 py-1 text-[10px] text-gray-400 focus:outline-none bg-gray-50/50"
                                                            value={item.subDesc}
                                                            placeholder="Sub description"
                                                            onChange={(e) => updateItem(item.id, 'subDesc', e.target.value)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            {showStallTypeColumn && (
                                                <td className="px-1 py-1.5 w-20">
                                                    {item.category === 'Stall' ? (
                                                        <select
                                                            className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] cursor-pointer"
                                                            value={item.stallType || ''}
                                                            onChange={(e) => selectStallType(item.id, e.target.value)}
                                                        >
                                                            <option value="">Select Type</option>
                                                            {getStallTypeOptions(item).map((type) => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    ) : null}
                                                </td>
                                            )}
                                            <td className="px-1 py-1.5 w-12">
                                                <input type='number' className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px]" value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5 w-14">
                                                <input type="number" min={1} className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all text-center h-[26px]" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5 w-14">
                                                <input className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px]" value={item.area} onChange={(e) => updateItem(item.id, 'area', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5 w-14">
                                                <input className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px]" value={item.size} onChange={(e) => updateItem(item.id, 'size', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5 w-16">
                                                <select className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] cursor-pointer" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
                                                    <option value="">Select</option>
                                                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1.5 w-14">
                                                <input type="number" className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] text-right" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5 w-16">
                                                <div className="flex justify-end items-center h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700">{roundAmount(item.amount).toLocaleString('en-IN')}</div>
                                            </td>
                                            <td className="px-1 py-1.5 w-14">
                                                <input type="number" min={0} max={100} className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all text-center h-[26px]" value={item.gstPct} onChange={(e) => updateItem(item.id, 'gstPct', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5 w-16">
                                                <div className="flex justify-end items-center h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700">
                                                    {roundAmount(item.taxable * (Number(item.gstPct) || 0) / 100).toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5 w-14">
                                                <input type="number" min={0} max={100} className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all text-center h-[26px]" value={item.disc} onChange={(e) => updateItem(item.id, 'disc', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5 w-16">
                                                <div className="flex justify-end items-center h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700">
                                                    {roundAmount(item.amount * (Number(item.disc) || 0) / 100).toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5 w-16">
                                                <div className="flex justify-end items-center h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-[#1a2b4b]">
                                                    {roundAmount(item.taxable).toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5 w-16 text-center">
                                                {items.length > 1 && (
                                                    <button onClick={() => removeItem(item.id)} className="flex items-center justify-center gap-1 text-red-400 hover:text-red-600 transition mx-auto">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
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
                            className="mt-2 flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold text-gray-600  transition bg-green-100/70"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Item
                        </button>
                    </div>

                    {/* SECTION 3 – Charges & Payment Plan */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <SectionHead num="3" label="Charges & Payment Plan" />
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* LEFT – Additional Charges + TDS note */}
                            <div className="lg:col-span-2">
                                <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-2">Additional Charges</h4>
                                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                    <Label>PLC Charges (₹)</Label>
                                    <div className="grid grid-cols-5 gap-2 mt-1">
                                        <div>
                                            <p className="text-[10px] text-slate-500">%</p>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                step="0.01"
                                                value={plcPct}
                                                onChange={(e) => setPlcPctOverride(e.target.value === '' ? 0 : Number(e.target.value))}
                                                className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[13px] font-semibold text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500">Amount</p>
                                            <p className="text-[13px] font-semibold text-[#1a2b4b]">{plcCharges.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500">GST %</p>
                                            <p className="text-[13px] font-semibold text-[#1a2b4b]">{plcGstPct}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500">GST Amount</p>
                                            <p className="text-[13px] font-semibold text-[#1a2b4b]">{plcGstAmount.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500">PLC Final Amount</p>
                                            <p className="text-[13px] font-bold text-emerald-600">{plcFinalAmount.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">For: {primaryStallDetail?.plScheme || '—'}</p>
                                </div>

                                <div className="mt-3 flex items-center gap-4">
                                    <span className="text-[12px] font-medium text-[#1a2b4b]">TDS Applicable<span className="text-red-500 ml-0.5">*</span></span>
                                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tdsApplicable"
                                            checked={tdsApplicable}
                                            onChange={() => setTdsApplicable(true)}
                                            className="accent-[#3b82f6]"
                                        />
                                        Yes
                                    </label>
                                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tdsApplicable"
                                            checked={!tdsApplicable}
                                            onChange={() => setTdsApplicable(false)}
                                            className="accent-[#3b82f6]"
                                        />
                                        No
                                    </label>
                                </div>

                                {tdsApplicable && (
                                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex gap-2">
                                        <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[12px] font-semibold text-amber-800">TDS Deduction (Section 194C)</p>
                                            <p className="text-[11px] text-amber-700 mt-0.5">
                                                TDS shall be deducted on the basic value only (excluding GST).
                                                Applicable rate: <span className="font-semibold">2%</span> for Companies/Firms/other entities and <span className="font-semibold">1%</span> for Individual/HUF.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT – Payment Plan + Instalment Plan Details / Full Payment terms */}
                            <div className="lg:col-span-3">
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="text-[13px] font-semibold text-[#1a2b4b]">Payment Plan<span className="text-red-500 ml-0.5">*</span></span>
                                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentPlanChoice"
                                            checked={!isInstalmentPlanSelected}
                                            onChange={() => setPaymentPlanType(fullPaymentId)}
                                            className="accent-[#3b82f6]"
                                        />
                                        Full Payment
                                    </label>
                                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentPlanChoice"
                                            checked={isInstalmentPlanSelected}
                                            onChange={() => setPaymentPlanType(instalmentPlanId)}
                                            className="accent-[#3b82f6]"
                                        />
                                        Instalment Plan
                                    </label>
                                </div>
                                {!isInstalmentPlanSelected && (
                                    <div>
                                        <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-2">Payment Terms</h4>
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 space-y-2">
                                            {fullPaymentConditions.map((t, i) => (
                                                <p key={i} className="text-[12px] text-[#1a2b4b]">{i + 1}. {t}</p>
                                            ))}
                                            {tdsApplicable && tdsFullPaymentLines.map((line, i) => (
                                                <p key={`tds-${i}`} className="text-[12px] text-[#1a2b4b]">{fullPaymentConditions.length + i + 1}. {line}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {isInstalmentPlanSelected && allInstalmentPhases.length > 0 && (
                                    <div className="mb-3 flex flex-wrap items-center gap-3">
                                        <span className="text-[12px] font-medium text-[#1a2b4b]">Phases used for this deal:</span>
                                        {allInstalmentPhases.map((p) => (
                                            <label key={p.id} className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={effectiveSelectedPhaseIds.has(p.id)}
                                                    onChange={() => togglePhase(p.id)}
                                                    className="accent-[#3b82f6]"
                                                />
                                                {p.label} ({p.percentage}%)
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {isInstalmentPlanSelected && instalmentRowsWithRemark.length > 0 && (
                                    <div>
                                        <h4 className="text-[13px] font-semibold text-[#1a2b4b] mb-2">Instalment Plan Details</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-[11px] border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        {['#', 'Instalment Name', '%', 'Amt', 'Due Date', 'Remarks'].map((h) => (
                                                            <th key={h} className="text-left px-2 py-2 font-medium text-[#1a2b4b] whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {instalmentRowsWithRemark.map((row, idx) => (
                                                        <tr key={row.id} className="border-b border-gray-50 last:border-0">
                                                            <td className="px-2 py-1.5 text-slate-400 font-medium">{idx + 1}</td>
                                                            <td className="px-2 py-1.5 font-medium text-[#1a2b4b] whitespace-nowrap">{row.label}</td>
                                                            <td className="px-2 py-1.5">{row.percentage}%</td>
                                                            <td className="px-2 py-1.5">{row.amount.toLocaleString('en-IN')}</td>
                                                            <td className="px-2 py-1.5 whitespace-nowrap">{formatDueDate(row.dueDate)}</td>
                                                            <td className="px-2 py-1.5">
                                                                <input
                                                                    value={row.remark}
                                                                    onChange={(e) => setInstalmentRemarkOverrides((prev) => ({ ...prev, [row.id]: e.target.value }))}
                                                                    className="w-full appearance-none border border-gray-200 rounded-md px-2 py-1 text-[11px] text-[#1a2b4b] bg-white focus:outline-none focus:border-[#3b82f6]"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="font-bold text-[#1a2b4b]">
                                                        <td className="px-2 py-1.5" colSpan={2}>Total</td>
                                                        <td className="px-2 py-1.5">{instalmentTotalPct}%</td>
                                                        <td className="px-2 py-1.5">{instalmentTotalAmt.toLocaleString('en-IN')}</td>
                                                        <td className="px-2 py-1.5" colSpan={2}></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {tdsApplicable && (
                                            <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 space-y-2">
                                                {tdsInstalmentPaymentLines.map((line, i) => (
                                                    <p key={i} className="text-[12px] text-[#1a2b4b]">{line}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Totals summary bar — Taxable Value − Discount + GST = Final Amount — and Amount in Words */}
                        <div className="mt-4 border-t border-gray-100 pt-4 flex items-stretch gap-3">
                            <div className="w-[60%] bg-slate-50/60 border border-gray-100 rounded-xl px-4 py-3 flex items-stretch gap-3">
                                <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                        <FileText size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500 font-medium truncate">Total Taxable Value</p>
                                        <p className="text-[14px] font-bold text-[#1a2b4b]">₹ {roundAmount(taxable).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <span className="flex items-center text-slate-300 text-lg font-light px-1 shrink-0">−</span>
                                <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                        <Percent size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500 font-medium truncate">Total Discount</p>
                                        <p className="text-[14px] font-bold text-[#1a2b4b]">₹ {roundAmount(calculatedDiscount).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <span className="flex items-center text-slate-300 text-lg font-light px-1 shrink-0">+</span>
                                <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 text-[9px] font-bold">GST</div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500 font-medium truncate">Total GST ({parseFloat(gstOption) || 0}%)</p>
                                        <p className="text-[14px] font-bold text-[#1a2b4b]">₹ {roundAmount(totalTax).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <span className="flex items-center text-slate-300 text-lg font-light px-1 shrink-0">=</span>
                                <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0 bg-emerald-50 rounded-lg px-4 py-2">
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Wallet size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500 font-medium truncate">Final Amount</p>
                                        <p className="text-[16px] font-bold text-emerald-600">₹ {roundAmount(grandTotal).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-[40%] bg-slate-50/60 border border-gray-100 rounded-xl px-4 py-3 flex flex-col justify-center">
                                <p className="text-[11px] text-slate-500 font-medium mb-1">Amount In Words</p>
                                <p className="text-[13px] font-semibold text-[#1a2b4b] leading-snug">{amountInWords(grandTotal)}.</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom action bar */}
                    <div className="bg-white rounded-lg border border-gray-200 px-5 py-3 flex justify-between items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 border border-gray-300 rounded px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                        >
                            <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.open(`/payments/estimateDetails/${existingEstimateId}`, '_blank')}
                                disabled={!existingEstimateId}
                                className="flex items-center gap-1.5 border border-gray-300 rounded px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                            >
                                <File className="w-3.5 h-3.5" /> Download PDF
                            </button>
                            <button
                                onClick={handleSendWhatsApp}
                                disabled={!existingEstimateId || isWhatsAppLoading}
                                className="flex items-center gap-1.5 border border-gray-300 rounded px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                            >
                                <MessageCircleMore className="w-3.5 h-3.5" /> {isWhatsAppLoading ? 'Sending...' : 'Send via WhatsApp'}
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={!existingEstimateId || isEmailLoading}
                                className="flex items-center gap-1.5 border border-gray-300 rounded px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                            >
                                <Mail className="w-3.5 h-3.5" /> {isEmailLoading ? 'Sending...' : 'Send via Email'}
                            </button>
                            <button onClick={handleGenerateEstimate} className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white rounded px-6 py-2 text-xs font-bold transition">
                                <FileText className="w-3.5 h-3.5" /> {existingEstimateId ? "Update Performa Invoice" : "Generate Performa Invoice"}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PerformaInvoices;
