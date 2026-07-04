import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompanies } from '../../../features/company/companySlice';
import mainpic from '../../../assets/header.png';
import api, { SERVER_URL } from '../../../lib/api';

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
    return 'RUPEES ' + convert(intPart) + ' Only.';
}

const InvoicePreviewTemplate = ({ form, items, matchedInvoice, heading, invoiceCopy = 'ORIGINAL INVOICE' }) => {
    const dispatch = useDispatch();
    const { companies } = useSelector((state) => state.companies);
    const [company, setCompany] = useState(null);
    const [bankDetails, setBankDetails] = useState(null);
    const [settings, setSettings] = useState(null);

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
        const fetchCompanyDetails = async () => {
            const targetCompanyId = matchedInvoice ? (matchedInvoice.companyId || matchedInvoice.company_id) : form?.companyId;
            if (!targetCompanyId) return;
            const cId = typeof targetCompanyId === 'object' ? targetCompanyId._id : targetCompanyId;
            
            try {
                const res = await api.get(`/api/companies/lookup/${cId}`);
                setCompany(res.data.data || res.data);
            } catch (err) {
                console.error("Error fetching company details:", err);
                // Fallback to redux state if lookup fails
                if (companies && companies.length > 0) {
                    const matchedCompany = companies.find((c) => String(c._id) === String(cId));
                    if (matchedCompany) setCompany(matchedCompany);
                }
            }
        };
        fetchCompanyDetails();
    }, [companies, form?.companyId, matchedInvoice]);

    const cur = '₹';
    const fmtNum = (n) => Math.round(Number(n || 0)).toLocaleString('en-IN');

    const activeItems = matchedInvoice ? matchedInvoice.items : items;
    const invoiceNo = matchedInvoice ? matchedInvoice.invoice_no : (form?.invoiceNo || '');
    const dateVal = matchedInvoice ? (matchedInvoice.invoice_date || matchedInvoice.supply_date) : form?.invoiceDate;
    const invoiceDate = dateVal ? new Date(dateVal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const addedVal = matchedInvoice ? matchedInvoice.added : null;
    const createdDateTime = addedVal
        ? new Date(addedVal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const supplyDateTime = matchedInvoice?.supply_date || form?.supply_date
        ? new Date(matchedInvoice?.supply_date || form?.supply_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';

    const totalTaxable = activeItems?.reduce((sum, item) => sum + (parseFloat(item.taxableValue) || 0), 0) || 0;
    const totalGstAmount = activeItems?.reduce((sum, item) => sum + (parseFloat(item.gstAmount) || 0), 0) || 0;
    const grandTotal = matchedInvoice ? (matchedInvoice.finalAmount || 0) : (activeItems?.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) || 0);

    const c1 = company?.contacts?.[0] || company?.contact1 || {};
    const companyName = "Namo Gange Wellness Pvt. Ltd.";

    const PROFORMA_EVENT_NAME = '9th Edition of International Health & Wellness Expo (IHWE Global Edition)';
    const PROFORMA_PLACE_OF_SUPPLY = 'Hall Nos. 8, 9 & 10, Pragati Maidan, New Delhi - 110001, Bharat';
    const PROFORMA_EVENT_GST_NO = '08AAFCN9238F1Z6';

    const clientCompanyName = matchedInvoice?.company_name || form?.company_name || company?.companyName || company?.exhibitorName || '—';
    const clientCompanyAddress = matchedInvoice?.company_addr || form?.company_addr || [company?.address, company?.city, company?.pincode ? `- ${company.pincode}` : '', company?.state, company?.country].filter(Boolean).join(', ');
    const clientGstNo = matchedInvoice?.company_gst_no || form?.company_gst_no || matchedInvoice?.gst_no || form?.gstin;

    const eventName = matchedInvoice?.event_name || form?.event_name || matchedInvoice?.consignee_name || form?.consignee_name || PROFORMA_EVENT_NAME;
    const eventPlaceOfSupply = matchedInvoice?.event_place_of_supply || matchedInvoice?.consignee_addr || form?.consignee_addr || PROFORMA_PLACE_OF_SUPPLY;
    const eventGstNo = matchedInvoice?.event_gst_no || form?.event_gst_no || PROFORMA_EVENT_GST_NO;

    const termsCondition = matchedInvoice ? matchedInvoice.terms : form?.terms;

    const currentInvoiceType = form?.invoiceType || matchedInvoice?.type_of_invoice || matchedInvoice?.est_type;
    const isIgst = currentInvoiceType
        ? (currentInvoiceType === "Interstate Sale" || currentInvoiceType === "IGST" || currentInvoiceType === "Foreign Sale")
        : (form?.placeOfSupply ? form.placeOfSupply.toLowerCase() !== 'delhi' : (matchedInvoice?.state && matchedInvoice.state.toLowerCase() !== 'delhi'));

    const currencyStr = matchedInvoice?.currency || form?.currency || 'INR - Indian Rupee (₹)';
    let currAbbr = 'INR';
    let currName = 'RUPEES';
    if (currencyStr.includes('-')) {
        const parts = currencyStr.split('-');
        currAbbr = parts[0].trim();
        if (currAbbr === 'INR') {
            currName = 'RUPEES';
        } else {
            const namePart = parts[1].split('(')[0].trim();
            currName = namePart.endsWith('s') ? namePart : namePart + 's';
        }
    } else {
        currAbbr = currencyStr.split(' ')[0] || 'INR';
        currName = currAbbr === 'USD' ? 'US Dollars' : currAbbr === 'EUR' ? 'Euros' : 'RUPEES';
    }

    const sigUrl = settings?.authorizedSignature ? (settings.authorizedSignature.startsWith('http') ? settings.authorizedSignature : `${SERVER_URL}${settings.authorizedSignature}`) : null;
    const stampUrl = settings?.companyStamp ? (settings.companyStamp.startsWith('http') ? settings.companyStamp : `${SERVER_URL}${settings.companyStamp}`) : null;
    const cancelled = String(matchedInvoice?.status || form?.status || '').toLowerCase() === 'cancelled';
    const deliveryChallans = matchedInvoice?.delivery_challans || form?.delivery_challans || [];
    const activeItemList = activeItems || [];

    const renderInvoiceHeader = () => (
        <>
            <div style={{ marginBottom: 8, textAlign: 'center' }}>
                <img src={mainpic} alt="Header" style={{ width: '100%', maxWidth: '100%', display: 'block' }} />
            </div>

            <div
                className="invoice-title-bar"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    marginBottom: 4,
                    paddingTop: 2,
                    paddingBottom: 2,
                    color: '#0d1f3c',
                    textTransform: 'uppercase',
                }}
            >
                <span aria-hidden="true" />
                <div style={{ fontWeight: 400, fontSize: 18 }}>{heading || 'TAX INVOICE'}</div>
                <div style={{ justifySelf: 'end', fontWeight: 700, fontSize: 11 }}>{invoiceCopy}</div>
            </div>

            <table className="invoice-avoid-break" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <thead>
                    <tr>
                        <th className="invoice-client-column" style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '38%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Client Name &amp; Address</th>
                        <th className="invoice-shipment-column" style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '38%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Shipment Details</th>
                        <th className="invoice-details-column" style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '24%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}> Invoice Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #ccc', padding: '4px 8px', verticalAlign: 'top', fontSize: 11, lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{clientCompanyName}</div>
                            <div style={{ marginTop: 2, textTransform: 'capitalize' }}>{clientCompanyAddress || '—'}</div>
                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%', marginTop: 4 }}>
                                <tbody>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{[c1.title, c1.firstName, c1.surname].filter(Boolean).join(' ') || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{c1.mobile || company?.landline || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Email</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{c1.email || company?.email || '—'}</td>
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
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Place of Supply &amp; Code</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{form?.placeOfSupply || matchedInvoice?.place_of_supply || matchedInvoice?.state || form?.state || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{[c1.title, c1.firstName, c1.surname].filter(Boolean).join(' ') || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{c1.mobile || company?.landline || '—'}</td>
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
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Invoice No.</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>{invoiceNo}</td>
                                    </tr>
                                    {Number(matchedInvoice?.revision_no || 0) > 0 && (
                                        <tr>
                                            <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Revision</td>
                                            <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                            <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>Rev {matchedInvoice.revision_no}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Invoice Date</td>
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
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right', textTransform: 'capitalize' }}>{matchedInvoice?.added_by || 'Admin'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>PO No.</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{matchedInvoice?.po_no || form?.poNo || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Supply Date</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{supplyDateTime || '—'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );

    const renderDeliveryChallanDetails = () => deliveryChallans.length > 0 && (
        <div style={{ marginBottom: 8 }}>
            <div style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '4px 6px', textAlign: 'center', textTransform: 'uppercase', fontSize: 10, fontWeight: 'bold' }}>
                Delivery Challan Details
            </div>
            {deliveryChallans.map((challan, challanIndex) => (
                <div key={challan.delivery_challan_id || `${challan.challan_no}-${challanIndex}`} style={{ border: '1px solid #ccc', borderTop: 0, padding: 6, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 5 }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '25%', padding: '2px 5px' }}><b>Challan No.:</b> {challan.challan_no || '—'}</td>
                                <td style={{ width: '20%', padding: '2px 5px' }}><b>Date:</b> {challan.challan_date ? new Date(challan.challan_date).toLocaleDateString('en-IN') : '—'}</td>
                                <td style={{ width: '15%', padding: '2px 5px', textTransform: 'capitalize' }}><b>Status:</b> {challan.status || '—'}</td>
                                <td style={{ width: '40%', padding: '2px 5px' }}><b>Delivery:</b> {challan.delivery_address || '—'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '2px 5px' }}><b>Transporter:</b> {challan.transporter_name || '—'}</td>
                                <td style={{ padding: '2px 5px' }}><b>Vehicle:</b> {challan.vehicle_no || '—'}</td>
                                <td style={{ padding: '2px 5px' }}><b>E-way Bill:</b> {challan.eway_bill || '—'}</td>
                                <td style={{ padding: '2px 5px' }}><b>Bilty No.:</b> {challan.bilty_no || '—'}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#eef2f7' }}>
                                <th style={{ border: '1px solid #ccc', padding: 3, width: '5%' }}>#</th>
                                <th style={{ border: '1px solid #ccc', padding: 3, textAlign: 'left' }}>Delivered Item</th>
                                <th style={{ border: '1px solid #ccc', padding: 3, width: '15%' }}>HSN</th>
                                <th style={{ border: '1px solid #ccc', padding: 3, width: '12%' }}>Qty.</th>
                                <th style={{ border: '1px solid #ccc', padding: 3, width: '12%' }}>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(challan.items || []).map((item, itemIndex) => (
                                <tr key={`${challan.challan_no}-${itemIndex}`}>
                                    <td style={{ border: '1px solid #ccc', padding: 3, textAlign: 'center' }}>{itemIndex + 1}</td>
                                    <td style={{ border: '1px solid #ccc', padding: 3 }}>{item.description || '—'}</td>
                                    <td style={{ border: '1px solid #ccc', padding: 3, textAlign: 'center' }}>{item.hsn || '—'}</td>
                                    <td style={{ border: '1px solid #ccc', padding: 3, textAlign: 'center' }}>{item.qty ?? '—'}</td>
                                    <td style={{ border: '1px solid #ccc', padding: 3, textAlign: 'center' }}>{item.unit || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );

    const renderItemsTable = (itemsToRender = activeItemList, startIndex = 0, showTotals = true) => (
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
                {itemsToRender.map((item, index) => {
                    const amt = parseFloat(item.amount) || 0;
                    const disc = parseFloat(item.taxableValue) ? amt - parseFloat(item.taxableValue) : 0;
                    return (
                        <tr key={`${startIndex}-${index}`}>
                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{startIndex + index + 1}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                                <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO (IHWE GLOBAL EDITION)</div>
                                <div style={{ fontSize: 10, color: '#555', whiteSpace: 'pre-wrap' }}>
                                    {item?.description}
                                    {item?.remarks ? `\n${item.remarks}` : ''}
                                </div>
                            </td>
                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{item?.hsn}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{item?.qty}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{item?.area || '—'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{item?.size || '—'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{item?.unit}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{fmtNum(item?.rate)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{fmtNum(disc)}%</td>
                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(item.taxableValue)}</td>
                        </tr>
                    );
                })}
                {showTotals && (
                    <tr style={{ textTransform: 'uppercase' }}>
                        <td colSpan={9} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right', background: '#f8fafc' }}>Taxable Value</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(totalTaxable)}</td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    const renderTaxTable = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <thead>
                <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
                    {['S.No.', 'HSN/SAC No.', 'Item Value', 'Qty.', 'CGST(%)', 'Amount', 'SGST(%)', 'Amount', 'IGST(%)', 'Amount', 'Total Tax'].map((label, index) => (
                        <th key={`${label}-${index}`} style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>{label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {activeItemList.map((item, index) => {
                    const gstRate = parseFloat(item?.gstPct) || 0;
                    const halfGst = gstRate / 2;
                    const gstAmt = parseFloat(item?.gstAmount) || 0;
                    const halfGstAmt = gstAmt / 2;
                    const itemTaxable = parseFloat(item?.taxableValue) || 0;
                    return (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.hsn}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{fmtNum(itemTaxable)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.qty}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? gstRate + '%' : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{isIgst ? fmtNum(gstAmt) : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(gstAmt)}</td>
                        </tr>
                    );
                })}
                <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                    <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>GST Amount in Words ({currAbbr})</td>
                    <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px', textTransform: 'capitalize' }}>{`${toWords(Math.round(totalGstAmount))}`.toUpperCase()}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Total GST Amount</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(totalGstAmount)}</td>
                </tr>
                <tr style={{ height: 8 }}>{Array(11).fill(0).map((_, j) => <td key={j} style={{ border: 'none', padding: 0 }}></td>)}</tr>
                <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                    <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Amount in Words ({currAbbr})</td>
                    <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px', textTransform: 'capitalize' }}>{`${toWords(Math.round(grandTotal))}`.toUpperCase()}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Grand Total</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right', fontSize: 13, color: '#000' }}>{fmtNum(grandTotal)}</td>
                </tr>
            </tbody>
        </table>
    );

    const renderFooterDetails = () => (
        <div className="invoice-footer-section">
            <table className="invoice-terms-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
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
                        <td className="invoice-payment-conditions" style={{ width: '40%', border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 10, background: '#fafafa' }}>
                            <div style={{ fontWeight: 700, marginBottom: 2 }}>Payment Conditions:</div>
                            <div style={{ fontWeight: 700 }}>1. 100% Advance Payment.</div>
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
                                    <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Bank Name</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.bankname || 'Kotak Mahindra Bank'}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Account Name</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.accountname || 'Namo Gange Wellness Pvt. Ltd.'}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Account No.</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.accountno || '6812013962'}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>IFSC Code</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.ifsccode || 'KKBK0004584'}</td></tr>
                                    <tr><td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Branch Name</td><td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td><td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.bankbranch || 'Jagriti Enclave, Anand Vihar, Delhi'}</td></tr>
                                </tbody>
                            </table>
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
                            <div style={{ height: 60 }}></div>
                            <div style={{ borderTop: '1px solid #ccc', paddingTop: 4, fontWeight: 700, width: '60%', margin: '0 auto' }}>Auth Signatory</div>
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
                            <div style={{ height: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
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
    );

    return (
        <div className="bg-white border border-slate-300 p-10 text-[11px] font-sans text-black" style={{ fontFamily: 'Calibri, Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            <style>{`
                .invoice-print-shell {
                    width: 100%;
                    border-collapse: collapse;
                }
                .invoice-print-shell > thead {
                    display: table-header-group;
                }
                .invoice-print-shell > thead > tr > td {
                    padding-bottom: 4px;
                }
                .invoice-print-shell > tbody {
                    display: table-row-group;
                }
                .invoice-print-shell td {
                    vertical-align: top;
                }
                .invoice-print-document {
                    display: none;
                }
                .invoice-print-page-number {
                    display: none;
                }
                .invoice-avoid-break,
                .invoice-print-shell > tbody table tr {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                .invoice-print-shell > tbody > tr,
                .invoice-print-shell > tbody > tr > td {
                    break-inside: auto;
                    page-break-inside: auto;
                }
                @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    .invoice-print-shell {
                        display: none !important;
                    }
                    .invoice-print-document {
                        display: block !important;
                    }
                    .invoice-print-header {
                        position: fixed;
                        top: 8mm;
                        left: 8mm;
                        right: 8mm;
                        z-index: 20;
                        background: #fff;
                    }
                    .invoice-print-content {
                        margin-top: 75mm;
                        padding-bottom: 14mm;
                    }
                    .invoice-print-page-number {
                        display: block !important;
                        position: fixed;
                        left: 0;
                        right: 0;
                        bottom: 5mm;
                        text-align: center;
                        font-size: 10px;
                        color: #555;
                    }
                    .invoice-print-content table,
                    .invoice-avoid-break {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    .invoice-print-content tr {
                        break-inside: auto;
                        page-break-inside: auto;
                    }
                    .invoice-footer-section {
                        break-before: page;
                        page-break-before: always;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        padding-top: 88mm;
                    }
                    .invoice-footer-section table,
                    .invoice-footer-section tr {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    .invoice-payment-conditions {
                        display: table-cell !important;
                        visibility: visible !important;
                    }
                    .invoice-client-column { width: 34% !important; }
                    .invoice-shipment-column { width: 36% !important; }
                    .invoice-details-column { width: 30% !important; }
                }
            `}</style>
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

            <div className="invoice-print-document">
                <div className="invoice-print-header">
                    {renderInvoiceHeader()}
                </div>
                <div className="invoice-print-content">
                    {renderDeliveryChallanDetails()}
                    {renderItemsTable(activeItemList, 0, true)}
                    {renderTaxTable()}
                    {renderFooterDetails()}
                </div>
                <div className="invoice-print-page-number" aria-hidden="true"></div>
            </div>

            <table className="invoice-print-shell">
                <thead>
                    <tr>
                        <td style={{ border: 0, padding: 0 }}>
            <div style={{ marginBottom: 8, textAlign: 'center' }}>
                <img src={mainpic} alt="Header" style={{ width: '100%', maxWidth: '100%', display: 'block' }} />
            </div>

            <div
                className="invoice-title-bar"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    marginBottom: 4,
                    paddingTop: 2,
                    paddingBottom: 2,
                    color: '#0d1f3c',
                    textTransform: 'uppercase',
                }}
            >
                <span aria-hidden="true" />
                <div style={{ fontWeight: 400, fontSize: 18 }}>{heading || 'TAX INVOICE'}</div>
                <div style={{ justifySelf: 'end', fontWeight: 700, fontSize: 11 }}>{invoiceCopy}</div>
            </div>

            <table className="invoice-avoid-break" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <thead>
                    <tr>
                        <th className="invoice-client-column" style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '38%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Client Name &amp; Address</th>
                        <th className="invoice-shipment-column" style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '38%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Shipment Details</th>
                        <th className="invoice-details-column" style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '24%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}> Invoice Details</th>
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
                                        <td style={{ border: 'none', padding: '1px 0' }}>{[c1.title, c1.firstName, c1.surname].filter(Boolean).join(' ') || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{c1.mobile || company?.landline || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Email</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{c1.email || company?.email || '—'}</td>
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
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Place of Supply &amp; Code</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{form?.placeOfSupply || matchedInvoice?.place_of_supply || matchedInvoice?.state || form?.state || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{[c1.title, c1.firstName, c1.surname].filter(Boolean).join(' ') || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{c1.mobile || company?.landline || '—'}</td>
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
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Invoice No.</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>{invoiceNo}</td>
                                    </tr>
                                    {Number(matchedInvoice?.revision_no || 0) > 0 && (
                                        <tr>
                                            <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Revision</td>
                                            <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                            <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>Rev {matchedInvoice.revision_no}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Invoice Date</td>
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
                                            {matchedInvoice?.added_by || 'Admin'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>PO No.</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{matchedInvoice?.po_no || form?.poNo || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Supply Date</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{supplyDateTime || '—'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: 0, padding: 0 }}>

            {(matchedInvoice?.delivery_challans || form?.delivery_challans || []).length > 0 && (
                <div style={{ marginBottom: 8, pageBreakInside: 'auto' }}>
                    <div style={{
                        background: '#0d1f3c',
                        color: '#fff',
                        border: '1px solid #0d1f3c',
                        padding: '4px 6px',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontSize: 10,
                        fontWeight: 'bold',
                    }}>
                        Delivery Challan Details
                    </div>
                    {(matchedInvoice?.delivery_challans || form?.delivery_challans || []).map((challan, challanIndex) => (
                        <div
                            key={challan.delivery_challan_id || `${challan.challan_no}-${challanIndex}`}
                            style={{ border: '1px solid #ccc', borderTop: 0, padding: 6, pageBreakInside: 'avoid' }}
                        >
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 5 }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '25%', padding: '2px 5px' }}><b>Challan No.:</b> {challan.challan_no || '—'}</td>
                                        <td style={{ width: '20%', padding: '2px 5px' }}><b>Date:</b> {challan.challan_date ? new Date(challan.challan_date).toLocaleDateString('en-IN') : '—'}</td>
                                        <td style={{ width: '15%', padding: '2px 5px', textTransform: 'capitalize' }}><b>Status:</b> {challan.status || '—'}</td>
                                        <td style={{ width: '40%', padding: '2px 5px' }}><b>Delivery:</b> {challan.delivery_address || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '2px 5px' }}><b>Transporter:</b> {challan.transporter_name || '—'}</td>
                                        <td style={{ padding: '2px 5px' }}><b>Vehicle:</b> {challan.vehicle_no || '—'}</td>
                                        <td style={{ padding: '2px 5px' }}><b>E-way Bill:</b> {challan.eway_bill || '—'}</td>
                                        <td style={{ padding: '2px 5px' }}><b>Bilty No.:</b> {challan.bilty_no || '—'}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#eef2f7' }}>
                                        <th style={{ border: '1px solid #ccc', padding: 3, width: '5%' }}>#</th>
                                        <th style={{ border: '1px solid #ccc', padding: 3, textAlign: 'left' }}>Delivered Item</th>
                                        <th style={{ border: '1px solid #ccc', padding: 3, width: '15%' }}>HSN</th>
                                        <th style={{ border: '1px solid #ccc', padding: 3, width: '12%' }}>Qty.</th>
                                        <th style={{ border: '1px solid #ccc', padding: 3, width: '12%' }}>Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(challan.items || []).map((item, itemIndex) => (
                                        <tr key={`${challan.challan_no}-${itemIndex}`}>
                                            <td style={{ border: '1px solid #ccc', padding: 3, textAlign: 'center' }}>{itemIndex + 1}</td>
                                            <td style={{ border: '1px solid #ccc', padding: 3 }}>{item.description || '—'}</td>
                                            <td style={{ border: '1px solid #ccc', padding: 3, textAlign: 'center' }}>{item.hsn || '—'}</td>
                                            <td style={{ border: '1px solid #ccc', padding: 3, textAlign: 'center' }}>{item.qty ?? '—'}</td>
                                            <td style={{ border: '1px solid #ccc', padding: 3, textAlign: 'center' }}>{item.unit || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

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
                    {activeItems?.map((item, index) => {
                        const amt = parseFloat(item.amount) || 0;
                        const disc = parseFloat(item.taxableValue) ? amt - parseFloat(item.taxableValue) : 0;
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
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item?.unit}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmtNum(item?.rate)}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{fmtNum(disc)}%</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(item.taxableValue)}</td>
                            </tr>
                        );
                    })}
                    {Array.from({ length: Math.max(0, 7 - (activeItems?.length || 0)) }).map((_, i) => (
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
                    {activeItems?.map((item, index) => {
                        const gstRate = parseFloat(item?.gstPct) || 0;
                        const halfGst = gstRate / 2;
                        const gstAmt = parseFloat(item?.gstAmount) || 0;
                        const halfGstAmt = gstAmt / 2;
                        const itemTaxable = parseFloat(item?.taxableValue) || 0;

                        return (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.hsn}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{fmtNum(itemTaxable)}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.qty}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? gstRate + '%' : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{isIgst ? fmtNum(gstAmt) : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(gstAmt)}</td>
                            </tr>
                        );
                    })}
                    <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                        <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>GST Amount in Words ({currAbbr})</td>
                        <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px', textTransform: 'capitalize' }}>{`${toWords(Math.round(totalGstAmount))}`.toUpperCase()}</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Total GST Amount</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(totalGstAmount)}</td>
                    </tr>
                    <tr style={{ height: 8 }}>
                        {Array(11).fill(0).map((_, j) => <td key={j} style={{ border: 'none', padding: 0 }}></td>)}
                    </tr>
                    <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                        <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Amount in Words ({currAbbr})</td>
                        <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px', textTransform: 'capitalize' }}>{`${toWords(Math.round(grandTotal))}`.toUpperCase()}</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Grand Total</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right', fontSize: 13, color: '#000' }}>{fmtNum(grandTotal)}</td>
                    </tr>
                </tbody>
            </table>

            <table className="invoice-terms-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
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
                        <td className="invoice-payment-conditions" style={{ width: '40%', border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 10, background: '#fafafa' }}>
                            <div style={{ fontWeight: 700, marginBottom: 2 }}>Payment Conditions:</div>
                            <div style={{ fontWeight: 700 }}>1. 100% Advance Payment.</div>
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
                            <div style={{ height: 60 }}></div>
                            <div style={{ borderTop: '1px solid #ccc', paddingTop: 4, fontWeight: 700, width: '60%', margin: '0 auto' }}>Auth Signatory</div>
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
                            <div style={{ height: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
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
                        </td>
                    </tr>
                </tbody>
            </table>

        </div>
    );
};

export default InvoicePreviewTemplate;
