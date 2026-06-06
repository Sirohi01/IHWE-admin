import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompanies } from '../../../features/company/companySlice';
import mainpic from '../../../assets/header.png';
import api from '../../../lib/api';

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

const InvoicePreviewTemplate = ({ form, items, matchedInvoice, heading }) => {
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
        const targetCompanyId = matchedInvoice ? matchedInvoice.companyId : form?.companyId;
        if (companies && companies.length > 0 && targetCompanyId) {
            const cId = typeof targetCompanyId === 'object' ? targetCompanyId._id : targetCompanyId;
            const matchedCompany = companies.find((c) => String(c._id) === String(cId));
            setCompany(matchedCompany || null);
        }
    }, [companies, form?.companyId, matchedInvoice]);

    const cur = '₹';
    const fmtNum = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

    const activeItems = matchedInvoice ? matchedInvoice.items : items;
    const invoiceNo = matchedInvoice ? matchedInvoice.invoice_no : (form?.invoiceNo || '');
    const dateVal = matchedInvoice ? (matchedInvoice.invoice_date || matchedInvoice.supply_date) : form?.invoiceDate;
    const invoiceDate = dateVal ? new Date(dateVal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const addedVal = matchedInvoice ? matchedInvoice.added : null;
    const createdDateTime = addedVal
        ? new Date(addedVal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date(addedVal).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const totalTaxable = activeItems?.reduce((sum, item) => sum + (parseFloat(item.taxableValue) || 0), 0) || 0;
    const totalGstAmount = activeItems?.reduce((sum, item) => sum + (parseFloat(item.gstAmount) || 0), 0) || 0;
    const grandTotal = matchedInvoice ? (matchedInvoice.finalAmount || 0) : (activeItems?.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) || 0);

    const c1 = company?.contacts?.[0] || {};
    const companyName = "Namo Gange Wellness Pvt. Ltd.";

    const clientName = matchedInvoice ? matchedInvoice.consignee_name : form?.clientName;
    const billingAddress = matchedInvoice
        ? [matchedInvoice.billing_address || matchedInvoice.address, matchedInvoice.city, matchedInvoice.pincode ? `- ${matchedInvoice.pincode}` : '', matchedInvoice.state, matchedInvoice.country].filter(Boolean).join(', ')
        : (form?.billingAddress || [company?.address, company?.city, company?.pincode ? `- ${company.pincode}` : '', company?.state, company?.country].filter(Boolean).join(', '));
    const shippingAddress = matchedInvoice
        ? [matchedInvoice.consignee_addr || matchedInvoice.address, matchedInvoice.city, matchedInvoice.pincode ? `- ${matchedInvoice.pincode}` : '', matchedInvoice.state, matchedInvoice.country].filter(Boolean).join(', ')
        : (form?.shippingAddress || form?.billingAddress);
    const gstin = matchedInvoice ? matchedInvoice.gst_no : form?.gstin;
    const termsCondition = matchedInvoice ? matchedInvoice.terms : form?.terms;

    const isIgst = matchedInvoice
        ? (matchedInvoice.state && matchedInvoice.state.toLowerCase() !== 'delhi')
        : (form?.invoiceType === "Interstate Sale" || form?.invoiceType === "IGST");

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const sigUrl = settings?.authorizedSignature ? (settings.authorizedSignature.startsWith('http') ? settings.authorizedSignature : `${BASE_URL}${settings.authorizedSignature}`) : null;
    const stampUrl = settings?.companyStamp ? (settings.companyStamp.startsWith('http') ? settings.companyStamp : `${BASE_URL}${settings.companyStamp}`) : null;

    return (
        <div className="bg-white border border-slate-300 p-10 text-[11px] font-sans text-black" style={{ fontFamily: 'Calibri, Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>

            <div style={{ marginBottom: 8, textAlign: 'center' }}>
                <img src={mainpic} alt="Header" style={{ width: '100%', maxWidth: '100%', display: 'block' }} />
            </div>

            <div className="invoice-title-bar" style={{ textAlign: 'center', marginBottom: 4, paddingTop: 2, paddingBottom: 2 }}>
                <div style={{ fontWeight: 400, fontSize: 18, color: '#0d1f3c', marginBottom: 0, textTransform: 'uppercase' }}>{heading || 'TAX INVOICE'}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <thead>
                    <tr>
                        <th style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '33%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Client Name &amp; Address</th>
                        <th style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '34%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Shipment Details</th>
                        <th style={{ background: '#0d1f3c', color: '#fff', border: '1px solid #0d1f3c', padding: '3px 2px', width: '33%', textAlign: 'center', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}> Invoice Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #ccc', padding: '4px 8px', verticalAlign: 'top', fontSize: 11, lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{clientName || company?.companyName || '—'}</div>
                            <div style={{ marginTop: 2, textTransform: 'capitalize', whiteSpace: 'pre-wrap' }}>{billingAddress}</div>
                            <div style={{ marginTop: 4 }}>Contact Person: {[c1.title, c1.firstName, c1.surname].filter(Boolean).join(' ') || '—'}</div>
                            <div style={{ marginTop: 2 }}>Email: {c1.email || company?.email || '—'}</div>
                            <div style={{ marginTop: 2 }}>Contact No.: {c1.mobile || company?.landline || '—'}</div>
                            {(gstin || company?.gstNumber) && <div style={{ marginTop: 4 }}>GSTIN.: {gstin || company?.gstNumber}</div>}
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 8px', verticalAlign: 'top', fontSize: 11, lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>9th Edition of International Health &amp; Wellness Expo (IHWE Global Edition)</div>
                            <div style={{ marginTop: 2 }}>Place of Supply: Hall Nos. 8, 9 &amp; 10, Pragati Maidan, New Delhi – 110001, Bharat</div>
                            <div style={{ marginTop: 4 }}>GSTIN.: 08AAFCN9238F1Z6</div>
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '6px 8px', verticalAlign: 'top', fontSize: 11 }}>
                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Invoice No.</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{invoiceNo}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Invoice Date</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{invoiceDate}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Created Time</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{createdDateTime}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Created By</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right', textTransform: 'capitalize' }}>
                                            Admin
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
                            { label: 'Item Description', width: '52%' },
                            { label: 'HSN Code', width: '7%' },
                            { label: 'Qty.', width: '3%' },
                            { label: 'Size', width: '6%' },
                            { label: 'Rate', width: '6%' },
                            { label: 'Amount', width: '6%' },
                            { label: 'Discount', width: '6%' },
                            { label: 'Total', width: '7%' },
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
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{item?.unit}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmtNum(item?.rate)}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmtNum(amt)}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmtNum(disc)}</td>
                                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(item.taxableValue)}</td>
                            </tr>
                        );
                    })}
                    {Array.from({ length: Math.max(0, 7 - (activeItems?.length || 0)) }).map((_, i) => (
                        <tr key={`empty-${i}`} style={{ height: 24 }}>
                            {Array(9).fill(0).map((_, j) => <td key={j} style={{ border: '1px solid #ccc' }}></td>)}
                        </tr>
                    ))}
                    <tr style={{ textTransform: 'uppercase' }}>
                        <td colSpan={8} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right', background: '#f8fafc' }}>Taxable Value</td>
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
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{!isIgst ? fmtNum(halfGstAmt) : ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{!isIgst ? fmtNum(halfGstAmt) : ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? gstRate + '%' : ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right' }}>{isIgst ? fmtNum(gstAmt) : ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>{fmtNum(gstAmt)}</td>
                            </tr>
                        );
                    })}
                    <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                        <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}></td>
                        <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px' }}></td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Total GST Amount</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right' }}>{fmtNum(totalGstAmount)}</td>
                    </tr>
                    <tr style={{ height: 8 }}>
                        {Array(11).fill(0).map((_, j) => <td key={j} style={{ border: 'none', padding: 0 }}></td>)}
                    </tr>
                    <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                        <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Amount in Words</td>
                        <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textTransform: 'capitalize' }}>{toWords(Math.round(grandTotal))}</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700 }}>Grand Total</td>
                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'right', fontSize: 13, color: '#000' }}>{fmtNum(grandTotal)}</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ fontSize: 10, marginBottom: 8, padding: '6px 8px', border: '1px solid #ccc', background: '#fafafa', paddingBottom: 2 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Terms and Conditions:</div>
                <div>1. Payment must be made in favor of Namo Gange Wellness Pvt. Ltd. via Cheque / DD / RTGS / NEFT / UPI only.</div>
                <div>2. Full payment is due within the stipulated invoice period.</div>
                <div>3. Delay in payment shall attract interest @24% per annum.</div>
                <div>4. Booking / services shall be confirmed only after receipt of payment.</div>
                <div>5. Cancellation or amendments shall be subject to company policy and management approval.</div>
                <div>6. All disputes are subject to Delhi Jurisdiction only.</div>
            </div>

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
                            <div style={{ height: 60, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                                {sigUrl && <img src={sigUrl} alt="Signature" style={{ maxHeight: 50, maxWidth: 130 }} />}
                                {stampUrl && <img src={stampUrl} alt="Stamp" style={{ maxHeight: 50, maxWidth: 60 }} />}
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
};

export default InvoicePreviewTemplate;
