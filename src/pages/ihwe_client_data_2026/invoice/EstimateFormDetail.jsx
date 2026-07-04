import React, { useEffect, useState } from 'react';
import mainpic from '../../../assets/header.png';
import { fetchCompanies } from '../../../features/company/companySlice';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../../lib/api';

const PROFORMA_EVENT_NAME = '9th Edition of International Health & Wellness Expo (IHWE Global Edition)';
const PROFORMA_PLACE_OF_SUPPLY = 'Hall Nos. 8, 9 & 10, Pragati Maidan, New Delhi - 110001, Bharat';
const PROFORMA_EVENT_GST_NO = '08AAFCN9238F1Z6';

function toWords(n) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (n === 0) return 'Zero';
    const convert = (num) => {
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
        if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
        if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
        return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
    };
    const intPart = Math.floor(n);
    return convert(intPart) + ' Rupees Only.';
}

const EstimateFormDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const routeState = location.state || {};
    const dispatch = useDispatch();
    const [matchedEstimate, setMatchedEstimate] = useState(null);
    const [company, setCompany] = useState(null);
    const [fetchingEstimate, setFetchingEstimate] = useState(true);
    const [bankDetails, setBankDetails] = useState(null);
    const [settings, setSettings] = useState(null);
    const [relatedInvoiceStatus, setRelatedInvoiceStatus] = useState({ hasCancelled: false, hasActive: false });

    const { companies, loading: companiesLoading } = useSelector((state) => state.companies);

    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                const res = await api.get('/api/banks');
                const banks = res.data?.data || res.data;
                if (banks && banks.length > 0) {
                    const activeBank = banks.find((b) => b.status === 'active') || banks[0];
                    setBankDetails(activeBank);
                }
            } catch (err) { }
        };
        const fetchSettings = async () => {
            try {
                const res = await api.get('/api/settings');
                setSettings(res.data?.data || res.data);
            } catch (err) { }
        };
        fetchBankDetails();
        fetchSettings();
    }, []);

    useEffect(() => {
        dispatch(fetchCompanies());
    }, [dispatch]);

    useEffect(() => {
        const fetchEstimateData = async () => {
            if (!id) return;
            setFetchingEstimate(true);
            try {
                let foundEstimate = null;
                try {
                    const response = await api.get(`/api/estimates/${id}`);
                    foundEstimate = response.data?.data || response.data;
                } catch (err) {
                    const resAll = await api.get(`/api/estimates`);
                    const allData = resAll.data?.data || resAll.data || [];
                    if (Array.isArray(allData)) {
                        foundEstimate = allData.find(e => e._id === id);
                    }
                }
                setMatchedEstimate(foundEstimate || null);
                if (foundEstimate?._id) {
                    try {
                        const invRes = await api.get('/api/invoices');
                        const invoices = invRes.data?.data || invRes.data || [];
                        const relatedInvoices = Array.isArray(invoices)
                            ? invoices.filter((inv) => {
                                const sameEstimateId = inv?.source_estimate_id && String(inv.source_estimate_id) === String(foundEstimate._id);
                                const sameEstimateNo = inv?.estimate_no && inv.estimate_no === foundEstimate.est_no;
                                return sameEstimateId || sameEstimateNo;
                            })
                            : [];
                        setRelatedInvoiceStatus({
                            hasCancelled: relatedInvoices.some((inv) => String(inv?.status || '').toLowerCase() === 'cancelled'),
                            hasActive: relatedInvoices.some((inv) => String(inv?.status || '').toLowerCase() !== 'cancelled'),
                        });
                    } catch (invoiceErr) {
                        setRelatedInvoiceStatus({ hasCancelled: false, hasActive: false });
                    }
                } else {
                    setRelatedInvoiceStatus({ hasCancelled: false, hasActive: false });
                }
            } catch (error) {
                setMatchedEstimate(null);
                setRelatedInvoiceStatus({ hasCancelled: false, hasActive: false });
            } finally {
                setFetchingEstimate(false);
            }
        };
        fetchEstimateData();
    }, [id, dispatch]);

    useEffect(() => {
        if (matchedEstimate && companies.length > 0) {
            const matchedCompany = companies.find((c) => c._id === matchedEstimate.companyId);
            setCompany(matchedCompany || null);
        }
    }, [matchedEstimate, companies]);

    if (fetchingEstimate || companiesLoading) {
        return <div className="text-center p-10">Loading estimate details...</div>;
    }

    if (!matchedEstimate) {
        return <div className="text-center p-10">Estimate not found.</div>;
    }

    const cur = '₹';
    const fmtNum = (n) => Math.round(Number(n || 0)).toLocaleString('en-IN');

    const invoiceNo = routeState.displayEstNo || matchedEstimate?.est_no || '';
    const invoiceDate = matchedEstimate?.supply_date ? new Date(matchedEstimate.supply_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    const createdDateTime = matchedEstimate?.added ? (() => {
        const d = new Date(matchedEstimate.added);
        return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        `;
        // , ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
    })() : '';

    const totalTaxable = matchedEstimate?.items?.reduce((sum, item) => {
        const amt = parseFloat(item.amount) || 0;
        return sum + (amt - (parseFloat(item.disc) || 0));
    }, 0) || 0;
    const totalGstAmount = matchedEstimate?.items?.reduce((sum, item) => sum + (parseFloat(item.tax) || 0), 0) || 0;
    const grandTotal = totalTaxable + totalGstAmount;

    const c1 = company?.contacts?.[0] || {};
    const companyName = "Namo Gange Wellness Pvt. Ltd.";
    const clientCompanyName = matchedEstimate?.company_name || company?.companyName || '—';
    const clientCompanyAddress = matchedEstimate?.company_addr || [company?.address, company?.city, company?.pincode ? `- ${company.pincode}` : '', company?.state, company?.country].filter(Boolean).join(', ');
    const clientGstNo = matchedEstimate?.company_gst_no || matchedEstimate?.gst_no;
    const eventName = matchedEstimate?.event_name || matchedEstimate?.consignee_name || PROFORMA_EVENT_NAME;
    const eventPlaceOfSupply = matchedEstimate?.event_place_of_supply || matchedEstimate?.consignee_addr || PROFORMA_PLACE_OF_SUPPLY;
    const eventGstNo = matchedEstimate?.event_gst_no || PROFORMA_EVENT_GST_NO;

    const isIgst = matchedEstimate?.state && matchedEstimate.state.toLowerCase() !== 'delhi';

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const sigUrl = settings?.authorizedSignature ? (settings.authorizedSignature.startsWith('http') ? settings.authorizedSignature : `${BASE_URL}${settings.authorizedSignature}`) : null;
    const stampUrl = settings?.companyStamp ? (settings.companyStamp.startsWith('http') ? settings.companyStamp : `${BASE_URL}${settings.companyStamp}`) : null;
    const selectedStatus = String(routeState.documentStatus || routeState.invoiceStatus || '').toLowerCase();
    const cancelled = selectedStatus
        ? selectedStatus === 'cancelled'
        : String(matchedEstimate?.status || '').toLowerCase() === 'cancelled' ||
        (relatedInvoiceStatus.hasCancelled && !relatedInvoiceStatus.hasActive);

    return (
        <>
        <div className="max-w-[1000px] mx-auto mb-3 flex justify-end gap-2">
            <button
                type="button"
                onClick={() => navigate(`/performa-invoice-list/${matchedEstimate.companyId}`)}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 shadow-sm hover:bg-gray-50"
            >
                Proforma Invoice List
            </button>
            {!cancelled && (
                <button
                    type="button"
                    onClick={() => navigate(`/performa-invoice/${matchedEstimate.companyId}`, {
                        state: { editEstimateId: matchedEstimate._id },
                    })}
                    className="rounded border border-blue-300 bg-white px-4 py-2 text-xs font-bold uppercase text-blue-600 shadow-sm hover:bg-blue-50"
                >
                    Edit
                </button>
            )}
        </div>
        <div className="bg-white border border-slate-300 p-10 text-[11px] font-sans text-black" style={{ fontFamily: 'Calibri, Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            {cancelled && (
                <div style={{
                    position: 'absolute',
                    top: '44%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-18deg)',
                    border: '6px solid rgba(220, 38, 38, 0.7)',
                    color: 'rgba(220, 38, 38, 0.75)',
                    fontSize: 54,
                    fontWeight: 900,
                    letterSpacing: 4,
                    padding: '10px 28px',
                    textTransform: 'uppercase',
                    zIndex: 5,
                    pointerEvents: 'none',
                }}>
                    Cancelled
                </div>
            )}

            <div style={{ marginBottom: 8, textAlign: 'center' }}>
                <img src={mainpic} alt="Header" style={{ width: '100%', maxWidth: '100%', display: 'block' }} />
            </div>

            <div className="invoice-title-bar" style={{ textAlign: 'center', marginBottom: 4, paddingTop: 2, paddingBottom: 2 }}>
                <div style={{ fontWeight: 400, fontSize: 18, color: '#0d1f3c', marginBottom: 0 }}>PROFORMA INVOICE</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <thead>
                    <tr>
                        <th style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '38%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Client Name &amp; Address</th>
                        <th style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '38%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Shipment Details</th>
                        <th style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '24%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}> Proforma Invoice Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #ccc', padding: '4px 8px', verticalAlign: 'top', fontSize: 11, lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{clientCompanyName}</div>
                            <div style={{ marginTop: 2, textTransform: 'capitalize' }}>
                                {clientCompanyAddress || '—'}
                            </div>
                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%', marginTop: 4 }}>
                                <tbody>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{matchedEstimate?.consignee_person || [c1.title, c1.firstName, c1.surname].filter(Boolean).join(' ') || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{matchedEstimate?.consignee_phone || c1.mobile || company?.landline || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Email</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{c1.email || '—'}</td>
                                    </tr>
                                    {clientGstNo && (
                                        <tr>
                                            <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>GSTIN.</td>
                                            <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                            <td style={{ border: 'none', padding: '1px 0' }}>{clientGstNo}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 8px', verticalAlign: 'top', fontSize: 11, lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{eventName}</div>
                            <div style={{ marginTop: 2 }}>{eventPlaceOfSupply}</div>
                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%', marginTop: 4 }}>
                                <tbody>
                                    {/* <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Place of Supply &amp; Code</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{matchedEstimate?.place_of_supply || 'Delhi (07)'}</td>
                                    </tr> */}
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{matchedEstimate?.consignee_person || [c1.title, c1.firstName, c1.surname].filter(Boolean).join(' ') || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{matchedEstimate?.consignee_phone || c1.mobile || company?.landline || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>GSTIN.</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{eventGstNo}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 11 }}>
                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Proforma Invoice No.</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{invoiceNo}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Proforma Invoice Date</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{invoiceDate}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Created Date</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{createdDateTime}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Created By</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right', textTransform: 'capitalize' }}>
                                            {matchedEstimate?.added_by || 'Admin'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <thead>
                    <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
                        {[
                            { label: 'S.No.', width: '3%' },
                            { label: 'Item Description', width: '48%' },
                            { label: 'HSN Code', width: '7%' },
                            { label: 'Qty.', width: '4%' },
                            { label: 'Area', width: '7%' },
                            { label: 'Size', width: '7%' },
                            { label: 'Unit', width: '6%' },
                            { label: 'Rate', width: '7%' },
                            { label: 'Discount', width: '8%' },
                            { label: 'Total', width: '10%' },
                        ].map(h => (
                            <th key={h.label} style={{ border: '1px solid #0d1f3c', padding: '3px 2px', textAlign: 'center', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold', width: h.width }}>{h.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {matchedEstimate?.items?.map((item, index) => {
                        const amt = parseFloat(item.amount) || 0;
                        return (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px' }}>
                                    <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO (IHWE GLOBAL EDITION)</div>
                                    <div style={{ fontSize: 10, color: '#555', whiteSpace: 'pre-wrap' }}>
                                        {item?.description}
                                        {item?.remarks ? `\n${item.remarks}` : ''}
                                    </div>
                                </td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item?.hsn}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item?.qty}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item?.area || '—'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item?.size || '—'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item?.unit || '—'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmtNum(item?.rate)}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{fmtNum(item?.disc)}%</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(amt - (parseFloat(item?.disc) || 0))}</td>
                            </tr>
                        );
                    })}
                    {Array.from({ length: Math.max(0, 7 - (matchedEstimate?.items?.length || 0)) }).map((_, i) => (
                        <tr key={`empty-${i}`} style={{ height: 24 }}>
                            {Array(10).fill(0).map((_, j) => <td key={j} style={{ border: '1px solid #ccc' }}></td>)}
                        </tr>
                    ))}
                    <tr style={{ textTransform: 'uppercase' }}>
                        <td colSpan={9} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right', background: '#f8fafc' }}>Taxable Value</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(totalTaxable)}</td>
                    </tr>
                </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <thead>
                    <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>S.No.</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>HSN/SAC No.</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>Item Value</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>Qty.</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>CGST(%)</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>Amount</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>SGST(%)</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>Amount</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>IGST(%)</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>Amount</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>Total Tax</th>
                    </tr>
                </thead>
                <tbody>
                    {matchedEstimate?.items?.map((item, index) => {
                        const gstRate = parseFloat(item?.gstRate) || 0;
                        const halfGst = gstRate / 2;
                        const gstAmt = parseFloat(item?.tax) || 0;
                        const halfGstAmt = gstAmt / 2;
                        const itemTaxable = (parseFloat(item?.amount) || 0) - (parseFloat(item?.disc) || 0);

                        return (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.hsn}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{fmtNum(itemTaxable)}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.qty}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? gstRate + '%' : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? fmtNum(gstAmt) : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(gstAmt)}</td>
                            </tr>
                        );
                    })}
                    <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                        <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>GST Amount in Words</td>
                        <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{toWords(Math.round(totalGstAmount))}</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Total GST Amount</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(totalGstAmount)}</td>
                    </tr>
                    <tr style={{ height: 8 }}>
                        {Array(11).fill(0).map((_, j) => <td key={j} style={{ border: 'none', padding: 0 }}></td>)}
                    </tr>
                    <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                        <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Amount in Words</td>
                        <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px' }}>{toWords(Math.round(grandTotal))}</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Grand Total</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(grandTotal)}</td>
                    </tr>
                </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <tbody>
                    <tr>
                        <td style={{ width: '60%', border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 10, background: '#fafafa' }}>
                            <div style={{ fontWeight: 700, marginBottom: 2 }}>Terms and Conditions:</div>
                            <div>1. Payment must be made in favor of Namo Gange Wellness Pvt. Ltd. via Cheque / DD / RTGS / NEFT / UPI only.</div>
                            <div>2. Full payment is due within the stipulated invoice period.</div>
                            <div>3. Delay in payment shall attract interest @24% per annum.</div>
                            <div>4. Booking / services shall be confirmed only after receipt of payment.</div>
                            <div>5. Cancellation or amendments shall be subject to company policy and management approval.</div>
                            <div>6. All disputes are subject to Delhi Jurisdiction only.</div>
                        </td>
                        <td style={{ width: '40%', border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 10, background: '#fafafa' }}>
                            <div style={{ fontWeight: 700, marginBottom: 2 }}>Payment Conditions:</div>
                            <div>1. 100% Advance Payment.</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <thead>
                    <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', width: '33%', background: '#0d1f3c', color: '#fff', fontWeight: 'bold', fontSize: 10 }}>NGWPL Bank Details</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', width: '33%', background: '#0d1f3c', color: '#fff', fontWeight: 'bold', fontSize: 10 }}>Client Signature</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', width: '34%', background: '#0d1f3c', color: '#fff', fontWeight: 'bold', fontSize: 10 }}>For {companyName}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 10 }}>
                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: 'auto' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Bank Name</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td>
                                        <td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.bankname || 'Kotak Mahindra Bank'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Account Name</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td>
                                        <td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.accountname || 'Namo Gange Wellness Pvt. Ltd.'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Account No.</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td>
                                        <td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.accountno || '6812013962'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>IFSC Code</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td>
                                        <td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.ifsccode || 'KKBK0004584'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Branch Name</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td>
                                        <td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.bankbranch || 'Jagriti Enclave, Anand Vihar, Delhi'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
                            <div style={{ height: 80 }}></div>
                            <div style={{ borderTop: '1px solid #ccc', paddingTop: 4, fontWeight: 700, width: '60%', margin: '0 auto' }}>Auth Signatory</div>
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
                            <div style={{ height: 60, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                                {sigUrl && <img src={sigUrl} alt="Signature" style={{ maxHeight: 60, maxWidth: 130 }} />}
                                {stampUrl && <img src={stampUrl} alt="Stamp" style={{ maxHeight: 60, maxWidth: 60 }} />}
                            </div>
                            <div style={{ borderTop: '1px solid #ccc', paddingTop: 4, fontWeight: 700, width: '60%', margin: '0 auto' }}>Auth Signatory</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style={{ fontSize: 12, textAlign: 'center', color: '#666', marginTop: 8, paddingTop: 6 }}>
                <b>Registered Address:</b> First Floor, E-1, Opposite KFC, Kalkaji Main Market, South Delhi-110019, Delhi, India
            </div>
            <div style={{ fontSize: 11, textAlign: 'center', color: '#999', marginTop: 4 }}>
                This is a computer generated document and does not require a physical signature.
            </div>

        </div>
        </>
    );
};

export default EstimateFormDetail;
