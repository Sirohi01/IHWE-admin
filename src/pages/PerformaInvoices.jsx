import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../lib/api';
import {
    ChevronRight, List, Plus, Trash2, FileText,
    Save, Download, MessageCircle, X, CheckSquare, Bookmark,
    FileSpreadsheet,
    File,
    MessageCircleMore,
    Mail,
} from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from "../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../features/state/stateSlice";
import { fetchCities } from "../features/city/citySlice";
import SearchableDropdown from '../components/SearchableDropdown';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
    '₹ ' + Math.round(Number(n || 0)).toLocaleString('en-IN');

const roundAmount = (value) => Math.round(Number(value || 0));

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

const newItem = () => ({
    id: Date.now(),
    description: '',
    subDesc: '',
    hsn: '',
    qty: 1,
    area: '',
    size: '',
    unit: 'Nos',
    rate: 0,
    amount: 0,
    disc: 0,
    taxable: 0,
});

const GST_OPTIONS = ['0% GST', '5% CGST+SGST', '12% CGST+SGST', '18% CGST+SGST', '28% CGST+SGST', '18% IGST', '12% IGST', '5% IGST'];
const ESTIMATE_TYPES = ['Intrastate', 'Interstate Sale', 'Foreign Sale'];
const UNITS = ['Nos', 'Sqm', 'Sqft', 'Mtrs', 'Kgs', 'Ltrs', 'Pcs'];

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

// ── Quick Action row ─────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, color, label, sub, onClick, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-between w-full p-3 rounded-lg border border-gray-100 transition group ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-[#3b82f6] hover:shadow-sm hover:bg-white bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center ${disabled ? 'grayscale' : ''}`}>
                <Icon size={16} />
            </div>
            <div className="text-left">
                <p className={`text-[12px] font-medium ${label === "Save Draft" ? "text-emerald-600" : label === "Generate Estimate" ? "text-emerald-600" : label === "Download PDF" ? "text-[#1a2b4b]" : label === "Send via WhatsApp" ? "text-emerald-600" : label === "Send via Email" ? "text-[#1a2b4b]" : "text-[#1a2b4b]"}`}>{label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
            </div>
        </div>
        <ChevronRight size={16} className={`shrink-0 ${disabled ? 'text-gray-200' : 'text-gray-400 group-hover:text-[#3b82f6]'}`} />
    </button>
);

// ══════════════════════════════════════════════════════════════════════════════
export const PerformaInvoices = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const editEstimateId = location.state?.editEstimateId;
    const requestedEventId = new URLSearchParams(location.search).get('eventId') || '';
    const [companyData, setCompanyData] = useState(null);
    const [existingEstimateId, setExistingEstimateId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const savingRef = useRef(false);

    const dispatch = useDispatch();
    const { countries: reduxCountries } = useSelector((state) => state.countries || { countries: [] });
    const { states: reduxStates } = useSelector((state) => state.states || { states: [] });
    const { cities: reduxCities } = useSelector((state) => state.cities || { cities: [] });


    let currentUserName = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || '';
    try {
        const userObjStr = localStorage.getItem('user') || sessionStorage.getItem('user') || localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || localStorage.getItem('admin') || sessionStorage.getItem('admin');
        if (userObjStr) {
            const userObj = JSON.parse(userObjStr);
            if (userObj.name) currentUserName = userObj.name;
            else if (userObj.fullName) currentUserName = userObj.fullName;
            else if (userObj.username) currentUserName = userObj.username;
            else if (userObj.user_name) currentUserName = userObj.user_name;
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
        consigneePerson: '',
        consigneePhone: '',
        consigneeEventName: PROFORMA_EVENT_NAME,
        consigneeEventAddress: PROFORMA_PLACE_OF_SUPPLY,
        consigneeGstin: PROFORMA_EVENT_GST_NO,
        country: '',
        state: '',
        city: '',
        pinCode: '',
    });

    const [items, setItems] = useState([
        { id: 1, description: 'Exhibition Stall Space (9 Sqm)', subDesc: '', hsn: '997331', qty: 1, area: '3x3', size: 9, unit: 'Sqm', rate: 11200, amount: 100800, disc: 0, taxable: 100800 }
    ]);

    const [gstOption, setGstOption] = useState('18% IGST');
    const [remarks, setRemarks] = useState('');
    const [notes, setNotes] = useState('');
    const [discount, setDiscount] = useState(0);

    const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);

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

                    const formattedItems = (estimateForPrefill.items || []).map((item, index) => {
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
                        const amount = roundAmount(Number(item.amount) || (qty * rate * size));
                        const disc = Number(item.disc || 0);
                        const taxable = roundAmount(amount - (amount * disc) / 100);

                        return {
                            ...item,
                            id: item._id || index + 1,
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
                            taxable: taxable
                        };
                    });

                    setItems(formattedItems);

                    setForm(prev => ({
                        ...prev,
                        estimateNo: existingEstimate ? estimateForPrefill.est_no : prev.estimateNo,
                        supplyDate: estimateForPrefill.supply_date || new Date().toISOString().split('T')[0],
                        consigneeName: estimateForPrefill.company_name || (estimateForPrefill.consignee_name !== PROFORMA_EVENT_NAME ? estimateForPrefill.consignee_name : '') || companyInfo?.companyName || companyInfo?.exhibitorName || '',
                        consigneeAddress: estimateForPrefill.company_addr || (estimateForPrefill.consignee_addr !== PROFORMA_PLACE_OF_SUPPLY ? estimateForPrefill.consignee_addr : '') || companyInfo?.address || companyInfo?.companyAddress || '',
                        consigneePerson: companyInfo?.contactPerson || (companyInfo?.contacts && companyInfo.contacts[0] ? [companyInfo.contacts[0].firstName, companyInfo.contacts[0].surname].filter(Boolean).join(' ') : '') || estimateForPrefill.consignee_person || '',
                        consigneePhone: companyInfo?.mobile || (companyInfo?.contacts && companyInfo.contacts[0] ? companyInfo.contacts[0].mobile : '') || estimateForPrefill.consignee_phone || '',
                        consigneeEventName: estimateForPrefill.event_name || PROFORMA_EVENT_NAME,
                        consigneeEventAddress: estimateForPrefill.event_place_of_supply || PROFORMA_PLACE_OF_SUPPLY,
                        consigneeGstin: estimateForPrefill.event_gst_no || PROFORMA_EVENT_GST_NO,
                        gstin: estimateForPrefill.company_gst_no || estimateForPrefill.gst_no || companyInfo?.gst || companyInfo?.gstNo || '',
                        country: estimateForPrefill.country || companyInfo?.country || '',
                        state: estimateForPrefill.state || companyInfo?.state || '',
                        city: estimateForPrefill.city || companyInfo?.city || '',
                        pinCode: estimateForPrefill.pincode || companyInfo?.pinCode || companyInfo?.pincode || '',
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
                        consigneePerson: companyInfo.contactPerson || (companyInfo.contacts && companyInfo.contacts[0] ? [companyInfo.contacts[0].firstName, companyInfo.contacts[0].surname].filter(Boolean).join(' ') : '') || '',
                        consigneePhone: companyInfo.mobile || (companyInfo.contacts && companyInfo.contacts[0] ? companyInfo.contacts[0].mobile : '') || '',
                        consigneeEventName: PROFORMA_EVENT_NAME,
                        consigneeEventAddress: PROFORMA_PLACE_OF_SUPPLY,
                        consigneeGstin: PROFORMA_EVENT_GST_NO,
                        gstin: companyInfo.gst || companyInfo.gstNo || '',
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
    const subTotal = roundAmount(items.reduce((s, i) => s + Number(i.amount || 0), 0));
    const calculatedDiscount = roundAmount(items.reduce((s, i) => s + (Number(i.amount || 0) * Number(i.disc || 0)) / 100, 0));
    const taxable = roundAmount(subTotal - calculatedDiscount);
    const isIGST = gstOption.includes('IGST');
    const gstPct = parseFloat(gstOption) || 0;
    const cgst = isIGST ? 0 : roundAmount((taxable * gstPct) / 200);
    const sgst = isIGST ? 0 : roundAmount((taxable * gstPct) / 200);
    const igst = isIGST ? roundAmount((taxable * gstPct) / 100) : 0;
    const totalTax = roundAmount(cgst + sgst + igst);
    const grandTotal = roundAmount(taxable + totalTax);

    // ── dynamic location options ─────────────────────────────────────────────────
    const countriesArr = ['Select Country', ...(reduxCountries || []).map(c => c.name).filter(Boolean)];

    const filteredStatesArr = (() => {
        if (!form.country || !reduxStates?.length) return ["Select State"];
        const countryObj = reduxCountries.find(c => c.name && c.name.trim().toLowerCase() === form.country.trim().toLowerCase());
        if (!countryObj) return ["Select State"];
        const filtered = reduxStates.filter(s => String(s.countryCode) === String(countryObj.countryCode));
        return ["Select State", ...filtered.map(s => s.name).filter(Boolean)];
    })();

    const filteredCitiesArr = (() => {
        if (!form.state || !reduxCities) return ["Select City"];
        const actualCities = reduxCities.data || reduxCities || [];
        if (!actualCities.length) return ["Select City"];
        const stateObj = reduxStates.find(s => s.name && s.name.trim().toLowerCase() === form.state.trim().toLowerCase());
        if (!stateObj) return ["Select City"];
        const filtered = actualCities.filter(c => String(c.stateCode) === String(stateObj.stateCode));
        return ["Select City", ...filtered.map(c => c.name).filter(Boolean)];
    })();

    const countryOptions = [...Array.from(new Set([...countriesArr, form.country].filter(Boolean)))].map(c => ({ label: c, value: c }));
    const stateOptions = [...Array.from(new Set([...filteredStatesArr, form.state].filter(Boolean)))].map(s => ({ label: s, value: s }));
    const cityOptions = [...Array.from(new Set([...filteredCitiesArr, form.city].filter(Boolean)))].map(c => ({ label: c, value: c }));

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
                updated.amount = roundAmount(qty * rate * size);
                updated.taxable = roundAmount(updated.amount - (updated.amount * disc) / 100);
                return updated;
            })
        );
    }, []);

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
        if (savingRef.current) return;
        const actualCompanyId = companyData?.clientId || companyData?._id || id;
        if (!actualCompanyId) {
            Swal.fire('Error', 'Company ID is missing!', 'error');
            return;
        }

        const assignments = Array.isArray(companyData?.eventAssignments)
            ? companyData.eventAssignments.filter((assignment) => assignment?.registrationEventId)
            : [];
        const selectedAssignment = requestedEventId
            ? assignments.find((assignment) =>
                String(assignment.registrationEventId?._id || assignment.registrationEventId) === String(requestedEventId)
            )
            : (assignments.length === 1 ? assignments[0] : null);
        const resolvedEventId =
            requestedEventId
            || selectedAssignment?.registrationEventId?._id
            || selectedAssignment?.registrationEventId
            || '';

        if (!resolvedEventId && !existingEstimateId) {
            Swal.fire(
                'Exhibition Required',
                'Please open Accounts from the required exhibition Client Profile before creating the Proforma Invoice.',
                'warning'
            );
            return;
        }

        const payload = {
            companyId: actualCompanyId,
            eventId: resolvedEventId || undefined,
            crmEventId: selectedAssignment?.eventId?._id || selectedAssignment?.eventId || undefined,
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
            country: form.country,
            state: form.state,
            city: form.city,
            pincode: form.pinCode,
            items: items.map(i => ({
                description: i.description + (i.subDesc ? `\n${i.subDesc}` : ''),
                hsn: i.hsn,
                qty: i.qty,
                area: i.area,
                size: i.size,
                unit: i.unit,
                rate: i.rate,
                amount: i.amount,
                disc: i.disc,
                tax: roundAmount((i.taxable * gstPct) / 100),
                gstRate: gstOption,
                cgst: isIGST ? 0 : roundAmount((i.taxable * (gstPct / 2)) / 100),
                cgst_per: isIGST ? "0" : String(gstPct / 2),
                igst_per: isIGST ? String(gstPct) : "0",
                finalAmount: roundAmount(i.taxable + ((i.taxable * gstPct) / 100)),
                remarks: remarks
            })),
            finalAmount: grandTotal,
            added_by: currentUserName,
            status: 'active'
        };

        try {
            savingRef.current = true;
            setIsSaving(true);
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
                        text: 'Estimate updated successfully!',
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
                        text: 'Estimate created successfully!',
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
        } finally {
            savingRef.current = false;
            setIsSaving(false);
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
                    <h1 className="text-lg font-bold text-gray-900">Create Estimate (Proforma Invoice)</h1>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                        <span className="hover:text-blue-600 cursor-pointer">Home</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="hover:text-blue-600 cursor-pointer">Proforma Invoices</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-600">Create Estimate</span>
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
            <div className="px-3.5 pt-3.5 pb-1 pr-16 flex gap-3 items-start">
                {/* ── LEFT FORM ── */}
                <div className="flex-1 space-y-3 min-w-0">

                    {/* SECTION 1 – Estimate Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                                <Label required>Proforma Invoice No.</Label>
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
                                <Label required>Company Name</Label>
                                <Input placeholder="Company name" value={form.consigneeName} onChange={(e) => setField('consigneeName', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                            <div className="col-span-1">
                                <Label required>Company Address</Label>
                                <textarea
                                    rows={2}
                                    placeholder="Company address"
                                    value={form.consigneeAddress}
                                    onChange={(e) => setField('consigneeAddress', e.target.value)}
                                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all resize-y"
                                />
                            </div>
                            <div>
                                <Label required>Country</Label>
                                <SearchableDropdown
                                    options={countryOptions}
                                    value={form.country}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, country: e.target.value, state: '', city: '' }));
                                    }}
                                    placeholder="Select Country"
                                />
                            </div>
                            <div>
                                <Label required>State</Label>
                                <SearchableDropdown
                                    options={stateOptions}
                                    value={form.state}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, state: e.target.value, city: '' }));
                                    }}
                                    placeholder="Select State"
                                    disabled={!form.country || form.country === 'Select Country'}
                                />
                            </div>
                            <div>
                                <Label required>City</Label>
                                <SearchableDropdown
                                    options={cityOptions}
                                    value={form.city}
                                    onChange={(e) => setField('city', e.target.value)}
                                    placeholder="Select City"
                                    disabled={!form.state || form.state === 'Select State'}
                                />
                            </div>
                            <div>
                                <Label required>Pin Code</Label>
                                <Input placeholder="110001" maxLength={6} value={form.pinCode} onChange={(e) => setField('pinCode', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-3">
                            <div>
                                <Label>Consignee Name</Label>
                                <Input value={form.consigneeEventName} onChange={(e) => setField('consigneeEventName', e.target.value)} />
                            </div>
                            <div>
                                <Label>Consignee Address</Label>
                                <Input value={form.consigneeEventAddress} onChange={(e) => setField('consigneeEventAddress', e.target.value)} />
                            </div>
                            <div>
                                <Label>Consignee GSTIN</Label>
                                <Input value={form.consigneeGstin} onChange={(e) => setField('consigneeGstin', e.target.value.toUpperCase())} />
                            </div>
                            <div>
                                <Label>Consignee Person</Label>
                                <Input placeholder="Contact Person" value={form.consigneePerson} onChange={(e) => setField('consigneePerson', e.target.value)} />
                            </div>
                            <div>
                                <Label>Consignee Phone</Label>
                                <Input placeholder="Contact Number" value={form.consigneePhone} onChange={(e) => setField('consigneePhone', e.target.value)} />
                            </div>
                        </div>
                        {/* <div className="grid grid-cols-5 gap-3 mt-3">

                        </div> */}
                    </div>

                    {/* SECTION 2 – Item & Pricing */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
                        <SectionHead num="2" label="Item & Pricing Details" />

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px] border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        {['#', 'Item Description *', 'HSN No. *', 'Qty. *', 'Area', 'Size', 'Unit *', 'Rate (₹) *', 'Amount (₹)', 'Disc. %', 'Taxable Value (₹)', ''].map((h, i) => (
                                            <th key={i} className="text-left px-1 py-2 font-medium text-[#1a2b4b] whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className=" hover:bg-gray-50/50 border-b border-gray-50 last:border-0">
                                            <td className="px-1 py-1.5 font-medium text-slate-400 text-center">{idx + 1}</td>
                                            <td className="px-1 py-1.5 min-w-[120px]">
                                                <div className='border border-gray-200 rounded-md overflow-hidden focus-within:border-[#3b82f6] focus-within:ring-1 focus-within:ring-[#3b82f6]/20 transition-all shadow-sm'>
                                                    <input
                                                        className="w-full px-1.5 py-1 text-[11px] text-[#1a2b4b] focus:outline-none bg-white"
                                                        value={item.description}
                                                        placeholder="Item description"
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                    />
                                                    <input
                                                        className="w-full border-t border-gray-100 px-1.5 py-1 text-[10px] text-gray-400 focus:outline-none bg-gray-50/50"
                                                        value={item.subDesc}
                                                        placeholder="Sub description"
                                                        onChange={(e) => updateItem(item.id, 'subDesc', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5 min-w-[50px]">
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
                                                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1.5 min-w-[60px]">
                                                <input type="number" className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all h-[26px] text-right" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5 min-w-[70px]">
                                                <div className="flex justify-end items-center h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-slate-700">{roundAmount(item.amount).toLocaleString('en-IN')}</div>
                                            </td>
                                            <td className="px-1 py-1.5 w-14">
                                                <input type="number" min={0} max={100} className="w-full appearance-none border border-gray-200 rounded-md px-1.5 py-1 text-[11px] text-[#1a2b4b] bg-white shadow-sm hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all text-center h-[26px]" value={item.disc} onChange={(e) => updateItem(item.id, 'disc', e.target.value)} />
                                            </td>
                                            <td className="px-1 py-1.5 min-w-[70px]">
                                                <div className="flex justify-end items-center h-[26px] px-1.5 rounded-md bg-gray-50 border border-gray-100 text-[11px] font-medium text-[#1a2b4b]">
                                                    {roundAmount(item.taxable).toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="px-1 py-1.5 w-6 text-center">
                                                {items.length > 1 && (
                                                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition">
                                                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
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

                        {/* GST / Final Amount / Remarks row */}
                        <div className="mt-2 grid grid-cols-3 gap-3 items-end border-t border-gray-100 pt-1">
                            <div>
                                <Label required>GST %</Label>
                                <Select options={GST_OPTIONS} value={gstOption} onChange={(e) => setGstOption(e.target.value)} />
                            </div>
                            <div>
                                <Label>Final Amount (₹)</Label>
                                <Input readOnly value={roundAmount(grandTotal).toLocaleString('en-IN')} className="bg-gray-50 font-semibold" />
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
                            rows={3}
                            maxLength={500}
                            placeholder="Type your notes or any special instructions here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 resize-y bg-white"
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
                        <button disabled={isSaving} onClick={handleGenerateEstimate} className="flex items-center gap-2 bg-green-800 hover:bg-green-900 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded px-6 py-2 text-xs font-bold transition">
                            <FileText className="w-3.5 h-3.5" /> {isSaving ? "Saving..." : existingEstimateId ? "Update Estimate" : "Generate Estimate"}
                        </button>
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="w-80 flex-shrink-0 space-y-4">
                    {/* Estimate Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#f0f5ff] text-[#194090]">
                                <FileText size={14} />
                            </div>
                            <h3 className="text-[14px] font-medium text-[#1a2b4b]">Estimate Summary</h3>
                        </div>

                        <div className="space-y-3 text-[13px]">
                            <div className="flex justify-between text-slate-500">
                                <span className="font-medium text-slate-500">Sub Total</span>
                                <span className="font-medium text-[#1a2b4b]">{fmt(subTotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span className="font-medium text-slate-500">Discount</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-emerald-600 font-medium">- {fmt(calculatedDiscount)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-slate-500 border-t border-dashed border-gray-200 pt-3">
                                <span className="font-medium text-slate-500">Taxable Amount</span>
                                <span className="font-medium text-[#1a2b4b]">{fmt(taxable)}</span>
                            </div>

                            <div className="mt-2 space-y-2 pt-2">
                                <div className="flex justify-between text-slate-400">
                                    <span className="font-medium">CGST ({isIGST ? 0 : gstPct / 2}%)</span>
                                    <span className="font-medium text-slate-600">{fmt(cgst)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span className="font-medium">SGST ({isIGST ? 0 : gstPct / 2}%)</span>
                                    <span className="font-medium text-slate-600">{fmt(sgst)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span className="font-medium">IGST ({isIGST ? gstPct : 0}%)</span>
                                    <span className="font-medium text-slate-600">{fmt(igst)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-slate-500 border-t border-dashed border-gray-200 pt-3">
                                <span className="font-bold text-[#1a2b4b]">Total Tax</span>
                                <span className="font-bold text-[#1a2b4b]">{fmt(totalTax)}</span>
                            </div>
                        </div>

                        {/* Grand Total */}
                        <div className="mt-4 bg-[#f8f9fc] rounded-lg px-4 py-3 flex items-center justify-between">
                            <span className="text-[#1a2b4b] text-[14px] font-semibold">Grand Total</span>
                            <span className="text-[#194090] text-[16px] font-bold">{fmt(grandTotal)}</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-[14px] font-medium text-[#1a2b4b]">Quick Actions</h3>
                        </div>
                        <div className="space-y-2.5">
                            <QuickAction icon={Bookmark} color="bg-blue-50 text-blue-500" label="Save Draft" sub="Save as draft for later" disabled={true} />
                            <QuickAction icon={FileSpreadsheet} color="bg-emerald-50 text-emerald-600" label={existingEstimateId ? "Update Estimate" : "Generate Estimate"} sub="Create or update Proforma Invoice" onClick={handleGenerateEstimate} disabled={true} />
                            <QuickAction icon={File} color="bg-red-50 text-red-500" label="Download PDF" sub="Download estimate as PDF" onClick={() => window.open(`/payments/estimateDetails/${existingEstimateId}`, '_blank')} disabled={!existingEstimateId} />
                            <QuickAction icon={MessageCircleMore} color="bg-emerald-50 text-emerald-600" label={isWhatsAppLoading ? "Sending..." : "Send via WhatsApp"} sub="Share estimate on WhatsApp" onClick={handleSendWhatsApp} disabled={!existingEstimateId || isWhatsAppLoading} />
                            <QuickAction icon={Mail} color="bg-blue-50 text-blue-500" label={isEmailLoading ? "Sending..." : "Send via Email"} sub="Email estimate to client" onClick={handleSendEmail} disabled={!existingEstimateId || isEmailLoading} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformaInvoices;
