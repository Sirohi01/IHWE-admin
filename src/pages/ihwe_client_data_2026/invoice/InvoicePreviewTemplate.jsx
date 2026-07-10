

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompanies } from '../../../features/company/companySlice';
import mainpic from '../../../assets/header.png';
import api, { SERVER_URL } from '../../../lib/api';
import { Landmark, SquarePen, Mail, Globe } from 'lucide-react';

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
    const words = convert(intPart).trim();
    return 'Rupees ' + words + ' Only.';
}

const InvoicePreviewTemplate = ({ form, items, matchedInvoice, heading, invoiceCopy = 'ORIGINAL INVOICE' }) => {
    const dispatch = useDispatch();
    const invoiceCopyType = String(invoiceCopy || '')
        .replace(/\s*INVOICE\s*/gi, '')
        .trim();
    const invoiceCopyLabel = invoiceCopyType ? `${invoiceCopyType} INVOICE` : invoiceCopy;
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
    const parseNum = (value) => {
        if (value === null || value === undefined || value === '') return 0;
        const parsed = Number(String(value).replace(/,/g, '').replace(/%/g, '').trim());
        return Number.isFinite(parsed) ? parsed : 0;
    };
    const fmtNum = (n) => Math.round(Number(n || 0)).toLocaleString('en-IN');
    const getItemAmount = (item = {}) => {
        const qty = parseNum(item.qty ?? item.quantity ?? 1) || 1;
        const rate = parseNum(item.rate ?? item.unit_rate ?? item.price);
        const getAreaMultiplier = (...values) => {
            for (const value of values) {
                const text = String(value ?? '').replace(/,/g, '').trim();
                const dimensions = text.match(/(\d+(?:\.\d+)?)\s*[xX×*]\s*(\d+(?:\.\d+)?)/);
                if (dimensions) return parseNum(dimensions[1]) * parseNum(dimensions[2]);
                const match = text.match(/\d+(?:\.\d+)?/);
                const number = match ? parseNum(match[0]) : 0;
                if (number > 0) return number;
            }
            return 1;
        };
        const computedAmount = rate * getAreaMultiplier(item.size, item.area, item.areaSqm, item.area_sqm, item.sqm) * qty;
        const explicitAmount = parseNum(
            item.amount ??
            item.itemValue ??
            item.item_value ??
            item.totalBeforeTax ??
            item.total_before_tax
        );
        if (explicitAmount && computedAmount && explicitAmount < computedAmount * 0.5) return computedAmount;
        return explicitAmount || computedAmount;
    };
    const getItemTaxable = (item = {}) => {
        const amount = getItemAmount(item);
        const discountPercent = parseNum(item.discountPct ?? item.discount_percent ?? item.discountPercentage ?? item.disc);
        const discountAmount = parseNum(item.discountAmount ?? item.discount_amount);
        if (discountPercent || discountAmount) {
            return Math.max(0, amount - (discountAmount || ((amount * discountPercent) / 100)));
        }

        const taxValue = parseNum(item.tax);
        const gstRate = getItemGstRate(item);
        const expectedGstFromTaxable = amount && gstRate ? (amount * gstRate) / 100 : 0;
        const taxLooksLikeGstAmount = taxValue && expectedGstFromTaxable && Math.abs(taxValue - expectedGstFromTaxable) < 1;

        const explicitTaxable = parseNum(
            item.taxableValue ??
            item.taxable_value ??
            item.taxable ??
            (taxLooksLikeGstAmount ? 0 : item.tax)
        );
        if (explicitTaxable) return explicitTaxable;

        return amount;
    };
    const getItemGstRate = (item = {}) => {
        const directRate = parseNum(
            item.gstPct ??
            item.gstRate ??
            item.gst_rate ??
            item.gst ??
            item.taxRate ??
            item.tax_rate ??
            item.igst_per
        );
        if (directRate) return directRate;

        const cgstRate = parseNum(item.cgst_per);
        return cgstRate ? cgstRate * 2 : 18;
    };
    const getItemGstAmount = (item = {}) => {
        const taxable = getItemTaxable(item);
        const gstRate = getItemGstRate(item);
        const computedGstAmount = taxable && gstRate ? (taxable * gstRate) / 100 : 0;
        if (computedGstAmount) return computedGstAmount;

        const explicitGstAmount = parseNum(
            item.gstAmount ??
            item.gst_amount ??
            item.totalTax ??
            item.total_tax ??
            (parseNum(item.cgst) + parseNum(item.sgst) + parseNum(item.igst))
        );
        if (explicitGstAmount) return explicitGstAmount;

        return 0;
    };
    const getItemFinalAmount = (item = {}) => {
        return getItemTaxable(item) + getItemGstAmount(item);
    };
    const formatSize = (value) => {
        if (!value) return '—';
        return `${String(value).replace(/\s*[xX*]\s*/g, ' × ').trim()} m`;
    };
    const formatArea = (value) => value ? `${value} sqm` : '—';
    const joinAddressParts = (parts) => {
        const used = new Set();
        const out = [];
        return (parts || [])
            .map(cleanAddressPart)
            .flatMap((part) => String(part || '').split(',').map((p) => p.trim()))
            .filter((part) => {
                if (!part) return false;
                const lowered = part.toLowerCase();
                if (lowered === '—' || lowered === 'null' || lowered === 'undefined' || lowered === 'n/a') return false;
                const key = lowered.replace(/[^a-z0-9]/g, '');
                if (!key || used.has(key)) return false;
                used.add(key);
                return true;
            })
            .forEach((part) => {
                if (/^\d{6}$/.test(part) && out.length) {
                    out[out.length - 1] = `${out[out.length - 1]} - ${part}`;
                    return;
                }
                out.push(part);
            }) || out.join(', ');
    };

    const cleanAddressPart = (value) => {
        if (value === null || value === undefined) return '';

        if (Array.isArray(value)) {
            return joinAddressParts(value);
        }

        if (typeof value === 'object') {
            return joinAddressParts([
                value.address,
                value.company_addr,
                value.companyAddress,
                value.addressLine,
                value.address_line,
                value.city,
                value.district,
                value.state,
                value.country,
                value.pincode,
                value.pinCode,
                value.pin_code,
                value.postalCode,
                value.postal_code,
                value.zipCode,
                value.zip_code,
            ]);
        }

        let text = String(value).trim().replace(/\s+/g, ' ');
        if (!text || text === '—') return '';
        if (['null', 'undefined', 'n/a'].includes(text.toLowerCase())) return '';

        // If backend sends object-like text such as:
        // "city: 'asd'" or "{ city: 'asd', state: 'UP', pincode: '123' }"
        // this removes the labels and keeps only clean values.
        const hasAddressLabels = /(?:^|[,{\s])(?:address|company_addr|companyAddress|addressLine|address_line|city|district|state|country|pincode|pinCode|pin_code|postalCode|postal_code|zipCode|zip_code)\s*:/i.test(text);
        if (hasAddressLabels) {
            const values = [];
            const regex = /(?:address|company_addr|companyAddress|addressLine|address_line|city|district|state|country|pincode|pinCode|pin_code|postalCode|postal_code|zipCode|zip_code)\s*:\s*['"]?([^,'"}]+)['"]?/gi;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const cleaned = String(match[1] || '')
                    .replace(/^['"`{\[]+|['"`}\]]+$/g, '')
                    .trim();
                if (cleaned) values.push(cleaned);
            }
            if (values.length) return joinAddressParts(values);
        }

        return text
            .replace(/^['"`{\[]+|['"`}\]]+$/g, '')
            .replace(/,$/, '')
            .trim();
    };

    const getFirstAddressValue = (...values) => values.find((value) => cleanAddressPart(value)) || '';
    const getFirstCleanValue = (...values) => values.find((value) => String(value ?? '').trim()) || '';
    const normalizeContactName = (name, titledName) => {
        const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
        const value = clean(name) || clean(titledName);
        return value ? value.replace(/^(mr|mrs|ms|miss|dr|prof)\.?\s+/i, '').trim() : '—';
    };

    const getDeliveryChallanNo = (source) => {
        const directNo = (
            source?.delivery_challan_no ||
            source?.deliveryChallanNo ||
            source?.delivery_challan_number ||
            source?.deliveryChallanNumber ||
            source?.challan_no ||
            source?.challanNo ||
            source?.challan_number ||
            source?.delivery_challan?.delivery_challan_no ||
            source?.delivery_challan?.deliveryChallanNo ||
            source?.delivery_challan?.delivery_challan_number ||
            source?.delivery_challan?.deliveryChallanNumber ||
            source?.delivery_challan?.challan_no ||
            source?.delivery_challan?.challanNo ||
            source?.delivery_challan?.challan_number
        );

        if (directNo) return directNo;

        return deliveryChallans
            .map((challan) => (
                challan?.delivery_challan_no ||
                challan?.deliveryChallanNo ||
                challan?.delivery_challan_number ||
                challan?.deliveryChallanNumber ||
                challan?.challan_no ||
                challan?.challanNo ||
                challan?.challan_number
            ))
            .filter(Boolean)
            .join(', ');
    };

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

    const totalTaxable = activeItems?.reduce((sum, item) => sum + getItemTaxable(item), 0) || 0;
    const totalGstAmount = activeItems?.reduce((sum, item) => sum + getItemGstAmount(item), 0) || 0;
    const grandTotal = activeItems?.reduce((sum, item) => sum + getItemFinalAmount(item), 0) || parseNum(matchedInvoice?.finalAmount ?? matchedInvoice?.final_amount ?? form?.finalAmount ?? form?.final_amount);
    const getDiscountPercent = (item = {}) => {
        const directPercent = parseNum(item.discountPct ?? item.disc ?? item.discount_percent ?? item.discountPercentage);
        return Number.isFinite(directPercent) ? directPercent : 0;
    };

    const targetCompanyId = matchedInvoice ? (matchedInvoice.companyId || matchedInvoice.company_id) : form?.companyId;
    const normalizedCompanyId = typeof targetCompanyId === 'object' ? targetCompanyId?._id : targetCompanyId;
    const reduxCompany = companies?.find((item) =>
        String(item?._id) === String(normalizedCompanyId) ||
        String(item?.clientId) === String(normalizedCompanyId)
    );
    const resolvedCompany = company || reduxCompany || {};
    const c1 = resolvedCompany?.contacts?.[0] || resolvedCompany?.contact1 || {};
    const companyName = "Namo Gange Wellness Pvt. Ltd.";

    const PROFORMA_EVENT_NAME = '9th Edition of International Health & Wellness Expo (IHWE Global Edition)';
    const PROFORMA_PLACE_OF_SUPPLY = 'Hall Nos. 8, 9 & 10, Pragati Maidan, New Delhi - 110001, Bharat';
    const PROFORMA_EVENT_STATE = 'Delhi';
    const PROFORMA_PLACE_OF_SUPPLY_WITH_CODE = 'Delhi (07)';
    const PROFORMA_EVENT_GST_NO = '07AAFCN9238F1Z6';

    const clientCompanyName = matchedInvoice?.company_name || form?.company_name || resolvedCompany?.companyName || resolvedCompany?.exhibitorName || '—';
    const titledContactPerson = [c1.title, c1.firstName, c1.surname].filter(Boolean).join(' ');
    const rawClientContactPerson = getFirstCleanValue(
        matchedInvoice?.contact_person,
        matchedInvoice?.company_contact_person,
        matchedInvoice?.consignee_person,
        form?.contact_person,
        form?.company_contact_person,
        form?.consignee_person,
        titledContactPerson,
        resolvedCompany?.contactPerson,
        resolvedCompany?.contact_person
    ) || '—';
    const clientContactPerson = normalizeContactName(rawClientContactPerson, titledContactPerson);
    const clientContactNo = getFirstCleanValue(
        matchedInvoice?.contact_no,
        matchedInvoice?.contact_phone,
        matchedInvoice?.company_contact_no,
        matchedInvoice?.company_phone,
        matchedInvoice?.mobile,
        matchedInvoice?.phone,
        matchedInvoice?.consignee_phone,
        form?.contact_no,
        form?.contact_phone,
        form?.company_contact_no,
        form?.company_phone,
        form?.mobile,
        form?.phone,
        form?.consignee_phone,
        c1.mobile,
        resolvedCompany?.landline,
        resolvedCompany?.mobile
    ) || '—';
    const clientEmail = getFirstCleanValue(
        matchedInvoice?.company_email,
        matchedInvoice?.contact_email,
        matchedInvoice?.email,
        form?.company_email,
        form?.contact_email,
        form?.email,
        c1.email,
        resolvedCompany?.companyEmail,
        resolvedCompany?.email
    ) || '—';
    const clientAddressLine = getFirstAddressValue(
        matchedInvoice?.company_addr,
        matchedInvoice?.address,
        form?.company_addr,
        form?.address,
        resolvedCompany?.address,
        resolvedCompany?.companyAddress,
        resolvedCompany?.company_addr
    );
    const clientCity = getFirstAddressValue(
        matchedInvoice?.company_city,
        matchedInvoice?.city,
        form?.company_city,
        form?.city,
        resolvedCompany?.city,
        resolvedCompany?.district
    );
    const clientState = getFirstAddressValue(
        matchedInvoice?.company_state,
        matchedInvoice?.state,
        form?.company_state,
        form?.state,
        resolvedCompany?.state
    );
    const clientCountry = getFirstAddressValue(
        matchedInvoice?.company_country,
        matchedInvoice?.country,
        form?.company_country,
        form?.country,
        resolvedCompany?.country
    );
    const clientPincode = getFirstAddressValue(
        matchedInvoice?.company_pincode,
        matchedInvoice?.pincode,
        matchedInvoice?.pin_code,
        matchedInvoice?.postal_code,
        matchedInvoice?.zip_code,
        form?.company_pincode,
        form?.pincode,
        form?.pin_code,
        form?.postal_code,
        form?.zip_code,
        resolvedCompany?.pincode,
        resolvedCompany?.pinCode,
        resolvedCompany?.pin_code,
        resolvedCompany?.postalCode,
        resolvedCompany?.postal_code,
        resolvedCompany?.zipCode,
        resolvedCompany?.zip_code
    );
    const clientCompanyAddress = joinAddressParts([
        clientAddressLine,
        clientCity,
        clientPincode,
        clientState,
        clientCountry,
    ]);
    const clientGstNo = matchedInvoice?.company_gst_no || form?.company_gst_no || matchedInvoice?.gst_no || form?.gstin;

    const eventName = matchedInvoice?.event_name || form?.event_name || matchedInvoice?.consignee_name || form?.consignee_name || PROFORMA_EVENT_NAME;
    const eventPlaceOfSupply = joinAddressParts([
        (matchedInvoice?.event_place_of_supply || matchedInvoice?.consignee_addr || form?.consignee_addr || PROFORMA_PLACE_OF_SUPPLY)
            .replace(/,\s*Bharat$/i, ''),
        PROFORMA_EVENT_STATE,
        'Bharat',
    ]);
    const shipmentAddress = eventPlaceOfSupply;
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
    const displayChallanNo = getDeliveryChallanNo(activeItemList?.[0]);
    const ewayChallan = deliveryChallans.find((challan) => getFirstCleanValue(
        challan?.eway_bill_no,
        challan?.ewayBillNo,
        challan?.eway_bill,
        challan?.ewayBill
    ));
    const ewayBillNo = getFirstCleanValue(
        matchedInvoice?.eway_bill_no,
        matchedInvoice?.ewayBillNo,
        matchedInvoice?.eway_bill,
        matchedInvoice?.ewayBill,
        form?.eway_bill_no,
        form?.ewayBillNo,
        form?.eway_bill,
        form?.ewayBill,
        ewayChallan?.eway_bill_no,
        ewayChallan?.ewayBillNo,
        ewayChallan?.eway_bill,
        ewayChallan?.ewayBill
    );

    const renderInvoiceHeader = () => (
        <>
            <div className="invoice-header-image" style={{ marginBottom: 0, textAlign: 'center' }}>
                <img src={mainpic} alt="Header" style={{ width: '100%', maxWidth: '100%', display: 'block' }} />
            </div>

            <div
                className="invoice-title-bar"
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 22,
                    marginBottom: 0,
                    paddingTop: 10,
                    paddingBottom: 4,
                    color: '#0d1f3c',
                    textTransform: 'uppercase',
                }}
            >
                <div style={{ fontWeight: 500, fontSize: 18, lineHeight: 1, textAlign: 'center' }}>{heading || 'TAX INVOICE'}</div>
                <div
                    className="invoice-copy-label"
                    style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 2,
                        fontWeight: 600,
                        fontSize: 11,
                        lineHeight: 1,
                        paddingRight: 2,
                        whiteSpace: 'nowrap',
                        textAlign: 'right',
                        letterSpacing: '-0.35px',
                    }}
                >
                    {invoiceCopyLabel}
                </div>
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
                            <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                {clientContactPerson !== '—' ? clientContactPerson : clientCompanyName}
                            </div>
                            <div style={{ marginTop: 2, textTransform: 'uppercase' }}>{clientCompanyName}</div>
                            <div style={{ marginTop: 2, textTransform: 'capitalize' }}>{clientCompanyAddress || '—'}</div>
                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%', marginTop: 4 }}>
                                <tbody>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientContactPerson}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientContactNo}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Email</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientEmail}</td>
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
                            <div style={{ marginTop: 2 }}>{shipmentAddress || '—'}</div>
                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%', marginTop: 4 }}>
                                <tbody>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Place of Supply &amp; Code</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{PROFORMA_PLACE_OF_SUPPLY_WITH_CODE}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientContactPerson}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientContactNo}</td>
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

                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Invoice Date</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{invoiceDate}</td>
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
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>E-way Bill No.</td>
                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{ewayBillNo || '—'}</td>
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
                                <td style={{ width: '25%', padding: '2px 5px' }}><b>Delivery Challan No.:</b> {getDeliveryChallanNo(challan) || '—'}</td>
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
        <table className="invoice-items-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, tableLayout: 'fixed' }}>
            <thead>
                <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
                    {[
                        { label: 'S.No.', width: '3%' },
                        { label: 'Item Description', width: '41%' },
                        { label: 'HSN Code', width: '8%' },
                        { label: 'Qty.', width: '4%' },
                        { label: 'Size', width: '8%' },
                        { label: 'Area', width: '8%' },
                        { label: 'Unit', width: '5%' },
                        { label: 'Rate', width: '7%' },
                        { label: 'Discount', width: '7%' },
                        { label: 'Total', width: '9%' },
                    ].map(h => (
                        <th key={h.label} style={{ border: '1px solid #0d1f3c', padding: '3px 2px', textAlign: 'center', fontSize: 9, background: '#0d1f3c', color: '#fff', fontWeight: 'bold', width: h.width, whiteSpace: 'nowrap' }}>{h.label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {itemsToRender.map((item, index) => {
                    const discountPercent = getDiscountPercent(item);
                    return (
                        <tr key={`${startIndex}-${index}`}>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{startIndex + index + 1}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', fontSize: 10, lineHeight: 1.15 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                                    <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO (IHWE GLOBAL EDITION)</div>
                                    <div style={{ fontSize: 10, color: '#555', whiteSpace: 'pre-wrap' }}>
                                        {item?.description}
                                        {item?.remarks ? `\n${item.remarks}` : ''}
                                    </div>
                                </div>
                            </td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{item?.hsn || item?.hsnCode || item?.hsn_code || '—'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{item?.qty ?? item?.quantity ?? '—'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{formatSize(item?.area)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{formatArea(item?.size)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>Nos</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 10 }}>{fmtNum(item?.rate ?? item?.unit_rate ?? item?.price)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{fmtNum(discountPercent)}%</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 10 }}>{fmtNum(getItemTaxable(item))}</td>
                        </tr>
                    );
                })}
                {showTotals && (
                    <tr className="challan-taxable-row" style={{ textTransform: 'uppercase' }}>
                        <td
                            colSpan={7}
                            style={{
                                border: '1px solid #ccc',
                                padding: '4px 6px',
                                fontWeight: 700,
                                background: '#f8fafc',
                                fontSize: 10,
                                lineHeight: '1.2',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {displayChallanNo ? <>Delivery Challan No.: {displayChallanNo}</> : null}
                        </td>
                        <td
                            colSpan={2}
                            style={{
                                border: '1px solid #ccc',
                                padding: '4px 6px',
                                fontWeight: 700,
                                background: '#f8fafc',
                                textAlign: 'right',
                                fontSize: 10,
                                lineHeight: '1.2',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Taxable Value
                        </td>
                        <td
                            style={{
                                border: '1px solid #ccc',
                                padding: '4px 4px',
                                fontWeight: 700,
                                background: '#f8fafc',
                                textAlign: 'center',
                                fontSize: 10,
                                lineHeight: '1.2',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {fmtNum(totalTaxable)}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    const renderTaxTable = () => (
        <table className="invoice-tax-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <thead>
                <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
                    {['S.No.', 'HSN/SAC No.', 'Item Value', 'Qty.', 'CGST(%)', 'Amount', 'SGST(%)', 'Amount', 'IGST(%)', 'Amount', 'Total Tax'].map((label, index) => (
                        <th key={`${label}-${index}`} style={{ border: '1px solid #0d1f3c', padding: '3px 2px', fontSize: 10, background: '#0d1f3c', color: '#fff', fontWeight: 'bold' }}>{label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {activeItemList.map((item, index) => {
                    const gstRate = getItemGstRate(item);
                    const halfGst = gstRate / 2;
                    const gstAmt = getItemGstAmount(item);
                    const halfGstAmt = gstAmt / 2;
                    const itemTaxable = getItemTaxable(item);
                    return (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.hsn || item?.hsnCode || item?.hsn_code || '—'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{fmtNum(itemTaxable)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.qty ?? item?.quantity ?? '—'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? gstRate + '%' : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? fmtNum(gstAmt) : '-'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center', fontWeight: 700 }}>{fmtNum(gstAmt)}</td>
                        </tr>
                    );
                })}
                <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                    <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center' }}>GST Amount in Words ({currAbbr})</td>
                    <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px', textTransform: 'capitalize', textAlign: 'center' }}>{toWords(Math.round(totalGstAmount))}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center' }}>Total GST Amt</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center' }}>{fmtNum(totalGstAmount)}</td>
                </tr>
                <tr style={{ height: 8 }}>{Array(11).fill(0).map((_, j) => <td key={j} style={{ border: 'none', padding: 0 }}></td>)}</tr>
                <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                    <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center' }}>Amount in Words ({currAbbr})</td>
                    <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px', textTransform: 'capitalize', textAlign: 'center' }}>{toWords(Math.round(grandTotal))}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center' }}>Grand Total</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center', fontSize: 13, color: '#000' }}>{fmtNum(grandTotal)}</td>
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
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', width: '33%', background: '#0d1f3c', color: '#fff', fontWeight: 'bold', fontSize: 10, textAlign: 'center' }}>NGWPL Bank Details</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', width: '33%', background: '#0d1f3c', color: '#fff', fontWeight: 'bold', fontSize: 10, textAlign: 'center' }}>Client Signature</th>
                        <th style={{ border: '1px solid #0d1f3c', padding: '3px 2px', width: '34%', background: '#0d1f3c', color: '#fff', fontWeight: 'bold', fontSize: 10, textAlign: 'center' }}>For {companyName}</th>
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
        <div className="invoice-print-root bg-white border border-slate-300 p-10 text-[11px] font-sans text-black" style={{ fontFamily: 'Calibri, Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
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
                .invoice-print-info-once {
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
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    .print-copy-page {
                        position: relative !important;
                        padding: 9mm 8mm 11mm !important;
                        box-sizing: border-box !important;
                    }
                    .print-copy-page-label {
                        display: block !important;
                        position: absolute !important;
                        right: 8mm !important;
                        bottom: 5mm !important;
                        font-family: Calibri, Arial, sans-serif !important;
                        font-size: 11px !important;
                        line-height: 1 !important;
                        font-weight: 700 !important;
                        color: #0d1f3c !important;
                    }
                    .invoice-print-root {
                        padding: 0 !important;
                        border: 0 !important;
                        margin: 0 !important;
                        max-width: none !important;
                        box-shadow: inset 0 0 0 1px #cbd5e1 !important;
                        box-sizing: border-box !important;
                    }
                    .invoice-print-shell {
                        margin: 0 !important;
                        display: table !important;
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    .invoice-print-shell > thead {
                        display: table-header-group !important;
                    }
                    .invoice-print-shell > tbody {
                        display: table-row-group !important;
                    }
                    .invoice-print-shell > thead > tr,
                    .invoice-print-shell > tbody > tr {
                        display: table-row !important;
                    }
                    .invoice-print-shell > thead > tr > td,
                    .invoice-print-shell > tbody > tr > td {
                        display: table-cell !important;
                        width: 100% !important;
                    }
                    .invoice-print-shell > thead > tr > td {
                        padding-bottom: 0 !important;
                    }
                    .invoice-print-info-once {
                        display: none !important;
                    }
                    .invoice-print-shell > tbody table {
                        page-break-inside: auto;
                        break-inside: auto;
                    }
                    .invoice-print-shell > tbody table thead {
                        display: table-header-group;
                    }
                    .invoice-title-bar {
                        margin-bottom: 0 !important;
                        padding-top: 0 !important;
                        padding-bottom: 0 !important;
                    }
                    .invoice-copy-label {
                        right: 0 !important;
                        font-size: 8.8px !important;
                        line-height: 1 !important;
                        letter-spacing: -0.25px !important;
                        max-width: 44% !important;
                        white-space: nowrap !important;
                        overflow: visible !important;
                        text-align: right !important;
                    }
                    .invoice-avoid-break {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    .invoice-footer-section {
                        break-inside: avoid;
                        page-break-inside: avoid;
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
                    .invoice-items-table {
                        table-layout: fixed !important;
                        width: 100% !important;
                    }
                    .invoice-items-table th,
                    .invoice-items-table td {
                        font-size: 9px !important;
                        padding: 3px 2px !important;
                        vertical-align: middle !important;
                    }
                    .invoice-items-table th:nth-child(3),
                    .invoice-items-table td:nth-child(3),
                    .invoice-items-table th:nth-child(4),
                    .invoice-items-table td:nth-child(4),
                    .invoice-items-table th:nth-child(5),
                    .invoice-items-table td:nth-child(5),
                    .invoice-items-table th:nth-child(6),
                    .invoice-items-table td:nth-child(6),
                    .invoice-items-table th:nth-child(7),
                    .invoice-items-table td:nth-child(7) {
                        white-space: nowrap !important;
                        word-break: keep-all !important;
                    }
                    .invoice-tax-table th,
                    .invoice-tax-table td {
                        white-space: nowrap !important;
                        font-size: 9px !important;
                        padding: 3px 2px !important;
                    }
                    .invoice-client-column { width: 34% !important; }
                    .invoice-shipment-column { width: 36% !important; }
                    .invoice-details-column { width: 30% !important; }

                    .challan-taxable-line {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        gap: 12px !important;
                        width: 100% !important;
                        font-size: 10px !important;
                        line-height: 1.2 !important;
                        white-space: nowrap !important;
                    }
                    .challan-taxable-line span {
                        white-space: nowrap !important;
                    }

                    .taxable-total-cell {
                        font-size: 9px !important;
                        line-height: 1.1 !important;
                        white-space: normal !important;
                        word-break: break-word !important;
                        overflow-wrap: anywhere !important;
                    }
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

            <table className="invoice-print-shell" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <td style={{ border: 0, padding: 0 }}>
                            <div className="invoice-header-image" style={{ marginBottom: 0, textAlign: 'center' }}>
                                <img src={mainpic} alt="Header" style={{ width: '100%', maxWidth: '100%', display: 'block' }} />
                            </div>

                            <div
                                className="invoice-title-bar"
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 22,
                                    marginBottom: 0,
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                    color: '#0d1f3c',
                                    textTransform: 'uppercase',
                                }}
                            >
                                <div style={{ fontWeight: 500, fontSize: 15, lineHeight: 1, textAlign: 'center' }}>{heading || 'TAX INVOICE'}</div>
                                <div
                                    className="invoice-copy-label"
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontWeight: 600,
                                        fontSize: 11,
                                        lineHeight: 1,
                                        paddingRight: 2,
                                        whiteSpace: 'nowrap',
                                        textAlign: 'right',
                                        letterSpacing: '-0.35px',
                                    }}
                                >
                                    {invoiceCopyLabel}
                                </div>
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
                                            <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                                {clientContactPerson !== '—' ? clientContactPerson : clientCompanyName}
                                            </div>
                                            <div style={{ marginTop: 2, textTransform: 'uppercase' }}>{clientCompanyName}</div>
                                            <div style={{ marginTop: 2, textTransform: 'capitalize' }}>
                                                {clientCompanyAddress || '—'}
                                            </div>
                                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%', marginTop: 4 }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientContactPerson}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientContactNo}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Email</td>
                                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientEmail}</td>
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
                                            <div style={{ marginTop: 2 }}>{shipmentAddress || '—'}</div>
                                            <table style={{ borderCollapse: 'collapse', border: 'none', lineHeight: '1.3', width: '100%', marginTop: 4 }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Place of Supply &amp; Code</td>
                                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                                        <td style={{ border: 'none', padding: '1px 0' }}>{PROFORMA_PLACE_OF_SUPPLY_WITH_CODE}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact Person</td>
                                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientContactPerson}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Contact No.</td>
                                                        <td style={{ border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                                        <td style={{ border: 'none', padding: '1px 0' }}>{clientContactNo}</td>
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

                                                    <tr>
                                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>Invoice Date</td>
                                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{invoiceDate}</td>
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
                                                    <tr>
                                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none', width: '1%' }}>E-way Bill No.</td>
                                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0', width: '1%' }}>:</td>
                                                        <td style={{ border: 'none', padding: '1px 0', textAlign: 'right' }}>{ewayBillNo || '—'}</td>
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

                            <div className="invoice-print-info-once">
                                {renderInvoiceHeader()}
                            </div>

                            <table className="invoice-items-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, tableLayout: 'fixed' }}>
                                <thead>
                                    <tr style={{ background: '#0d1f3c', color: '#fff', textTransform: 'uppercase' }}>
                                        {[
                                            { label: 'S.No.', width: '3%' },
                                            { label: 'Item Description', width: '41%' },
                                            { label: 'HSN Code', width: '8%' },
                                            { label: 'Qty.', width: '4%' },
                                            { label: 'Size', width: '8%' },
                                            { label: 'Area', width: '8%' },
                                            { label: 'Unit', width: '5%' },
                                            { label: 'Rate', width: '7%' },
                                            { label: 'Discount', width: '7%' },
                                            { label: 'Total', width: '9%' },
                                        ].map(h => (
                                            <th key={h.label} style={{ border: '1px solid #0d1f3c', padding: '3px 2px', textAlign: 'center', fontSize: 9, background: '#0d1f3c', color: '#fff', fontWeight: 'bold', width: h.width, whiteSpace: 'nowrap' }}>{h.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeItems?.map((item, index) => {
                                        const discountPercent = getDiscountPercent(item);
                                        return (
                                            <tr key={index}>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{index + 1}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', fontSize: 10, lineHeight: 1.15 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                                                        <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO (IHWE GLOBAL EDITION)</div>
                                                        <div style={{ fontSize: 10, color: '#555', whiteSpace: 'pre-wrap' }}>
                                                            {item?.description}
                                                            {item?.remarks ? `\n${item.remarks}` : ''}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{item?.hsn || item?.hsnCode || item?.hsn_code || '—'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{item?.qty ?? item?.quantity ?? '—'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{formatSize(item?.area)}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{formatArea(item?.size)}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>Nos</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 10 }}>{fmtNum(item?.rate ?? item?.unit_rate ?? item?.price)}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10 }}>{fmtNum(discountPercent)}%</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 3px', textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 10 }}>{fmtNum(getItemTaxable(item))}</td>
                                            </tr>
                                        );
                                    })}
                                    {Array.from({ length: Math.max(0, 7 - (activeItems?.length || 0)) }).map((_, i) => (
                                        <tr key={`empty-${i}`} style={{ height: 24 }}>
                                            {Array(10).fill(0).map((_, j) => <td key={j} style={{ border: '1px solid #ccc' }}></td>)}
                                        </tr>
                                    ))}
                                    <tr className="challan-taxable-row" style={{ textTransform: 'uppercase' }}>
                                        <td
                                            colSpan={7}
                                            style={{
                                                border: '1px solid #ccc',
                                                padding: '4px 6px',
                                                fontWeight: 700,
                                                background: '#f8fafc',
                                                fontSize: 10,
                                                lineHeight: '1.2',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {displayChallanNo ? <>Delivery Challan No.: {displayChallanNo}</> : null}
                                        </td>
                                        <td
                                            colSpan={2}
                                            style={{
                                                border: '1px solid #ccc',
                                                padding: '4px 6px',
                                                fontWeight: 700,
                                                background: '#f8fafc',
                                                textAlign: 'right',
                                                fontSize: 10,
                                                lineHeight: '1.2',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            Taxable Value
                                        </td>
                                        <td
                                            style={{
                                                border: '1px solid #ccc',
                                                padding: '4px 4px',
                                                fontWeight: 700,
                                                background: '#f8fafc',
                                                textAlign: 'center',
                                                fontSize: 10,
                                                lineHeight: '1.2',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {fmtNum(totalTaxable)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table className="invoice-tax-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
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
                                        const gstRate = getItemGstRate(item);
                                        const halfGst = gstRate / 2;
                                        const gstAmt = getItemGstAmount(item);
                                        const halfGstAmt = gstAmt / 2;
                                        const itemTaxable = getItemTaxable(item);

                                        return (
                                            <tr key={index}>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{index + 1}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.hsn || item?.hsnCode || item?.hsn_code || '—'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{fmtNum(itemTaxable)}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{item?.qty ?? item?.quantity ?? '—'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? halfGst + '%' : '-'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{!isIgst ? fmtNum(halfGstAmt) : '-'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? gstRate + '%' : '-'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center' }}>{isIgst ? fmtNum(gstAmt) : '-'}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: 'center', fontWeight: 700 }}>{fmtNum(gstAmt)}</td>
                                            </tr>
                                        );
                                    })}
                                    <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                                        <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center' }}>GST Amount in Words ({currAbbr})</td>
                                        <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px', textTransform: 'capitalize', textAlign: 'center' }}>{toWords(Math.round(totalGstAmount))}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center' }}>Total GST Amount</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center' }}>{fmtNum(totalGstAmount)}</td>
                                    </tr>
                                    <tr style={{ height: 8 }}>
                                        {Array(11).fill(0).map((_, j) => <td key={j} style={{ border: 'none', padding: 0 }}></td>)}
                                    </tr>
                                    <tr style={{ background: '#f8fafc', textTransform: 'uppercase' }}>
                                        <td colSpan={3} style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center' }}>Amount in Words ({currAbbr})</td>
                                        <td colSpan={6} style={{ border: '1px solid #ccc', padding: '4px 6px', textTransform: 'capitalize', textAlign: 'center' }}>{toWords(Math.round(grandTotal))}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center' }}>Grand Total</td>
                                        <td style={{ border: '1px solid #ccc', padding: '4px 6px', fontWeight: 700, textAlign: 'center', fontSize: 13, color: '#000' }}>{fmtNum(grandTotal)}</td>
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

                            <table className="avoid-break" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0, border: '1px solid #ccc' }}>
                                <colgroup>
                                    <col style={{ width: '33%' }} />
                                    <col style={{ width: '33%' }} />
                                    <col style={{ width: '34%' }} />
                                </colgroup>
                                <thead>
                                    <tr style={{ background: '#fafafa' }}>
                                        <th style={{ border: 'none', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '6px 8px', background: '#fafafa', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0d1f3c', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                                                <Landmark size={14} strokeWidth={2} /> NGWPL Bank Details
                                            </div>
                                        </th>
                                        <th style={{ border: 'none', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '6px 8px', background: '#fafafa', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0d1f3c', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                                                <SquarePen size={14} strokeWidth={2} /> Receiver's Acknowledgement
                                            </div>
                                        </th>
                                        <th style={{ border: 'none', borderBottom: '1px solid #ccc', padding: '6px 8px', background: '#fafafa', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0d1f3c', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                                                <SquarePen size={14} strokeWidth={2} /> For {companyName}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ border: 'none', borderRight: '1px solid #ccc', padding: '2px 8px 8px', verticalAlign: 'top', fontSize: 10 }}>
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
                                                        <td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0', fontWeight: 700, color: '#0d1f3c' }}>{bankDetails?.ifsccode || 'KKBK0004584'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', padding: '1px 4px 1px 0', border: 'none' }}>Branch Name</td>
                                                        <td style={{ fontWeight: 'bold', border: 'none', padding: '1px 4px 1px 0' }}>:</td>
                                                        <td style={{ border: 'none', whiteSpace: 'nowrap', padding: '1px 0' }}>{bankDetails?.bankbranch || 'Jagriti Enclave, Anand Vihar, Delhi'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td style={{ border: 'none', borderRight: '1px solid #ccc', padding: '16px 8px 8px', verticalAlign: 'top', fontSize: 10 }}>
                                            <div>Received the above goods / services in good condition.</div>
                                            <div style={{ borderTop: '1px solid #ccc', margin: '75px 10px 8px' }}></div>
                                            <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#888', fontSize: 10, marginTop: 6 }}>(Signature &amp; Company Seal)</div>
                                        </td>
                                        <td style={{ border: 'none', padding: '2px 8px 8px', textAlign: 'center', verticalAlign: 'bottom' }}>
                                            <div style={{ height: 55, marginTop: 15, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                {sigUrl && <img src={sigUrl} alt="Signature" style={{ maxHeight: 55, maxWidth: 120 }} />}
                                                {stampUrl && <img src={stampUrl} alt="Stamp" style={{ maxHeight: 55, maxWidth: 55 }} />}
                                            </div>
                                            <div style={{ borderTop: '1px solid #ccc', margin: '35px 10px 8px' }}></div>
                                            <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#888', fontSize: 10, marginTop: 6 }}>Authorized Signatory.</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="avoid-break" style={{ position: 'relative', height: 62, overflow: 'hidden', border: '1px solid #ccc', borderTop: 'none' }}>
                                {/* navy background — banner area only, bottom-anchored */}
                                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, background: '#0d1f3c', zIndex: 0 }} />

                                {/* contact row */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, fontSize: 10, fontWeight: 600, color: '#0d1f3c', zIndex: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        +91 96549 00525
                                    </div>
                                    <div style={{ width: 1, height: 12, background: '#ccc' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> info@namogangewellness.com</div>
                                    <div style={{ width: 1, height: 12, background: '#ccc' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={12} /> www.namogangewellness.com</div>
                                </div>

                                {/* banner text */}
                                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10.5, zIndex: 2 }}>
                                    <span>This is a computer generated document and does not require a physical signature.</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default InvoicePreviewTemplate;
