
import React, { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ChevronRight, ArrowLeft, Ban, FilePlus2, Mail, MessageCircleMore, Pencil, Printer, RefreshCw, FileText, Calendar, Tag, Truck, User, FileBadge, Users, Building, CreditCard, Phone, MapPin, Package, MessageSquare, ShieldCheck, Send, RotateCcw, DollarSign, CheckCircle2, Clock, Landmark, SquarePen, Globe } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../../../lib/api";
import { getCurrentUserName } from "../../../utils/currentUser";
import CommunicationModal from "../../../components/CommunicationModal";
import invoiceHeader from "../../../assets/header.png";
import AccountNavigation from '../../../components/AccountNavigation';
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numTarget = parseFloat(target) || 0;
    if (numTarget === 0) { setCount(0); return; }
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(ease * numTarget);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { ref, count };
}

function AnimatedStatCard({ icon, gradientTo, iconBg, rawValue, displayValue, label, subLabel, subColor }) {
  const { ref, count } = useCountUp(rawValue);
  return (
    <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>
              {displayValue(count)}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>{label}</span>
          </div>
        </div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: subColor, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{subLabel}</div>
      </div>
    </div>
  );
}

const emptyForm = {
  challan_date: new Date().toISOString().slice(0, 10),
  source_estimate_id: "",
  company_name: "",

  company_address: "",
  company_gst_no: "",
  contact_person: "",
  contact_phone: "",
  company_email: "",
  contact_email: "",
  company_city: "",
  company_state: "",
  company_country: "",
  company_pincode: "",
  delivery_city: "",
  delivery_state: "",
  delivery_country: "",
  delivery_pincode: "",
  event_name: "",
  delivery_address: "",
  purpose: "Event/Stall Material",
  vehicle_no: "",
  transporter_name: "",
  eway_bill: "",
  challan_type: "Outward",
  type_of_sale: "",
  shipped_to: "Delhi",
  state_code: "Delhi (07)",
  bilty_no: "",
  po_no: "",
  remarks: "",
  terms: "Goods/material received in good condition.",
  status: "issued",
  items: [],
};

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]";
const labelClass = "flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] mb-1";

function toWords(n) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (!Number.isFinite(Number(n)) || Number(n) <= 0) return 'Rupees Zero Only.';
  const convert = (num) => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
    if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
    return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
  };
  return `Rupees ${convert(Math.round(Number(n || 0))).trim()} Only.`;
}

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = String(d.getFullYear()).slice(-2);
  const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day} ${month} ${year}, ${time}`;
};

const statusClass = (status) => ({
  draft: "bg-slate-100 text-slate-600",
  issued: "bg-blue-50 text-blue-700",
  delivered: "bg-amber-50 text-amber-700",
  acknowledged: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
}[status] || "bg-slate-100 text-slate-600");

const cleanAddressPart = (value) => {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    return joinAddressParts(value);
  }

  if (typeof value === "object") {
    return joinAddressParts([
      value.address,
      value.company_addr,
      value.companyAddress,
      value.company_address,
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

  let text = String(value).trim().replace(/\s+/g, " ");
  if (!text || text === "—" || text === "-") return "";
  if (["null", "undefined", "n/a", "na"].includes(text.toLowerCase())) return "";

  const hasAddressLabels = /(?:^|[,{\s])(?:address|company_addr|companyAddress|company_address|addressLine|address_line|city|district|state|country|pincode|pinCode|pin_code|postalCode|postal_code|zipCode|zip_code)\s*:/i.test(text);

  if (hasAddressLabels) {
    const values = [];
    const regex = /(?:address|company_addr|companyAddress|company_address|addressLine|address_line|city|district|state|country|pincode|pinCode|pin_code|postalCode|postal_code|zipCode|zip_code)\s*:\s*['"]?([^,'"}]+)['"]?/gi;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const cleaned = String(match[1] || "")
        .replace(/^['"`{\[]+|['"`}\]]+$/g, "")
        .trim();

      if (cleaned) values.push(cleaned);
    }

    if (values.length) return joinAddressParts(values);
  }

  return text
    .replace(/^['"`{\[]+|['"`}\]]+$/g, "")
    .replace(/,$/, "")
    .trim();
};

const joinAddressParts = (parts) => {
  const used = new Set();
  const out = [];

  (parts || [])
    .map(cleanAddressPart)
    .flatMap((part) => String(part || "").split(",").map((p) => p.trim()))
    .filter((part) => {
      if (!part) return false;

      const lowered = part.toLowerCase();
      if (lowered === "—" || lowered === "-" || lowered === "null" || lowered === "undefined" || lowered === "n/a" || lowered === "na") return false;

      const key = lowered.replace(/[^a-z0-9]/g, "");
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
    });

  return out.join(", ");
};

const stripAddressToken = (address, token) => {
  const cleanAddress = cleanAddressPart(address);
  const cleanToken = cleanAddressPart(token);
  if (!cleanAddress || !cleanToken) return cleanAddress;

  return cleanAddress
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && part.toLowerCase() !== cleanToken.toLowerCase())
    .join(", ");
};

const stripAddressTokens = (address, tokens = []) => {
  const cleanTokens = tokens
    .map(cleanAddressPart)
    .filter(Boolean)
    .map((token) => token.toLowerCase());

  if (!cleanTokens.length) return cleanAddressPart(address);

  return cleanAddressPart(address)
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !cleanTokens.includes(part.toLowerCase()))
    .join(", ");
};

const getFirstAddressValue = (...values) => values.find((value) => cleanAddressPart(value)) || "";

const isEventLikeValue = (value) => {
  const text = String(value || "").trim().toLowerCase();
  return /ihwe|health|wellness|expo|edition|global/.test(text);
};

const getCleanValue = (...values) => {
  for (const value of values) {
    const cleaned = cleanAddressPart(value);
    if (cleaned) return cleaned;
  }
  return "";
};

const normalizeContactName = (name, titledName) => {
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const value = clean(name) || clean(titledName);
  return value ? value.replace(/^(mr|mrs|ms|miss|dr|prof)\.?\s+/i, "").trim() : "-";
};

const getEmailValue = (source = {}) => getCleanValue(
  source.company_email,
  source.companyEmail,
  source.company_contact_email,
  source.contact_email,
  source.contactEmail,
  source.consignee_email,
  source.email,
  source.contact?.email,
  source.contact1?.email,
  source.contact2?.email,
  source.contacts?.find?.((contact) => contact?.isPrimary)?.email,
  source.contacts?.[0]?.email,
  source.company?.email,
  source.company?.companyEmail,
  source.company?.contact1?.email,
  source.company?.contacts?.find?.((contact) => contact?.isPrimary)?.email,
  source.company?.contacts?.[0]?.email
);

const parseAmount = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const text = String(value).replace(/,/g, "").replace(/%/g, "").trim();
  const number = Number(text);
  if (Number.isFinite(number)) return number;
  const match = text.match(/-?\d+(?:\.\d+)?/);
  const parsed = match ? Number(match[0]) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
};

const isNearlySame = (a, b, tolerance = 1) => {
  const first = Number(a);
  const second = Number(b);
  return Number.isFinite(first) && Number.isFinite(second) && Math.abs(first - second) <= tolerance;
};

const getQtyValue = (item = {}) => {
  const qty = parseAmount(item.qty ?? item.quantity ?? 1);
  return qty > 0 ? qty : 1;
};

const parseAreaValue = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const text = String(value).replace(/,/g, "").trim().toLowerCase();
  if (!text || text === "-" || text === "—") return 0;

  const dimensionMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:x|×|\*)\s*(\d+(?:\.\d+)?)/i);
  if (dimensionMatch) {
    const length = Number(dimensionMatch[1]);
    const width = Number(dimensionMatch[2]);
    if (Number.isFinite(length) && Number.isFinite(width) && length > 0 && width > 0) {
      return length * width;
    }
  }

  const sqmMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:sq\.?\s*m|sqm|sqmt|square\s*meter|square\s*metre|m2|m²)/i);
  if (sqmMatch) {
    const sqm = Number(sqmMatch[1]);
    if (Number.isFinite(sqm) && sqm > 0) return sqm;
  }

  const number = parseAmount(text);
  return number > 0 ? number : 0;
};

const getAreaMultiplier = (item = {}) => {
  const candidates = [
    item.areaSqm,
    item.area_sqm,
    item.sqm,
    item.square_meter,
    item.squareMeter,
    item.size,
    item.area,
  ];

  const values = candidates
    .map(parseAreaValue)
    .filter((number) => Number.isFinite(number) && number > 0);

  if (!values.length) return 1;

  // Old records can store size = "9" and area = "3 x 3".
  // Taking the largest valid area avoids the wrong 3 sqm result from a dimension string.
  return Math.max(...values);
};

const getItemGstRateValue = (item = {}) => {
  const directRate = parseAmount(
    item.gstRate ??
    item.gst_per ??
    item.gstPct ??
    item.gst_rate ??
    item.taxRate ??
    item.tax_rate
  );
  if (directRate) return directRate;

  const igstRate = parseAmount(item.igst_per ?? item.igstRate ?? item.igst_rate);
  if (igstRate) return igstRate;

  const cgstRate = parseAmount(item.cgst_per ?? item.cgstRate ?? item.cgst_rate);
  const sgstRate = parseAmount(item.sgst_per ?? item.sgstRate ?? item.sgst_rate);
  if (cgstRate || sgstRate) return cgstRate + sgstRate;

  return 18;
};

const getExplicitAmountValue = (item = {}) => parseAmount(
  item.amount ??
  item.itemValue ??
  item.item_value ??
  item.totalBeforeTax ??
  item.total_before_tax
);

const getProratedValue = (value, item = {}) => {
  const amount = parseAmount(value);
  if (!amount) return 0;

  const qty = parseAmount(item.qty ?? item.quantity ?? 0);
  const sourceQty = parseAmount(item.sourceQty ?? item.piQty ?? item.originalQty ?? 0);
  if (sourceQty > 0 && qty > 0 && qty !== sourceQty) return amount * (qty / sourceQty);

  return amount;
};

const getDiscountPercentValue = (item = {}) => {
  const explicitPercent = parseAmount(
    item.discountPct ??
    item.disc ??
    item.discount_percent ??
    item.discountPercentage ??
    item.discount_percentage
  );
  if (explicitPercent) return explicitPercent;

  // In this delivery challan UI the Discount column is printed as a percentage.
  // Some old/proforma records store that percentage in `discount` only.
  const fallbackDiscount = parseAmount(item.discount);
  const hasAbsoluteDiscount = parseAmount(item.discountAmount ?? item.discount_amount) > 0;
  if (!hasAbsoluteDiscount && fallbackDiscount > 0 && fallbackDiscount <= 100) return fallbackDiscount;

  return 0;
};

const getDiscountAmountValue = (item = {}, amount = 0) => {
  const explicitAmount = parseAmount(item.discountAmount ?? item.discount_amount);
  if (explicitAmount) return getProratedValue(explicitAmount, item);

  const rawDiscount = parseAmount(item.discount);
  const discountPercent = getDiscountPercentValue(item);

  // If `discount` has already been treated as a percent, don't subtract it again as rupees.
  if (rawDiscount && rawDiscount !== discountPercent) return getProratedValue(rawDiscount, item);
  if (discountPercent) return (amount * discountPercent) / 100;

  return 0;
};

const getLineAmount = (item = {}) => {
  const qty = getQtyValue(item);
  const rate = parseAmount(item.rate ?? item.unit_rate ?? item.price);
  const area = getAreaMultiplier(item);
  const computedAmount = rate > 0 ? roundMoney(rate * area * qty) : 0;
  const explicitAmount = getExplicitAmountValue(item);
  const gstRate = getItemGstRateValue(item);

  // Rate × area × qty is the source of truth for stall/space items.
  // This prevents GST amount (18,144) or GST-included amount from being printed as taxable value.
  if (computedAmount) {
    const expectedTotalWithGst = computedAmount + ((computedAmount * gstRate) / 100);
    if (!explicitAmount) return computedAmount;
    if (isNearlySame(explicitAmount, computedAmount)) return computedAmount;
    if (isNearlySame(explicitAmount, expectedTotalWithGst)) return computedAmount;
    if (explicitAmount < computedAmount * 0.5) return computedAmount;
    return computedAmount;
  }

  return roundMoney(getProratedValue(explicitAmount, item));
};

const getLineTaxable = (item = {}) => {
  const amount = getLineAmount(item);
  const discountAmount = getDiscountAmountValue(item, amount);
  const calculatedTaxable = roundMoney(Math.max(0, amount - discountAmount));

  const gstRate = getItemGstRateValue(item);
  const expectedGst = gstRate ? roundMoney((calculatedTaxable * gstRate) / 100) : 0;
  const explicitTaxable = parseAmount(
    item.taxableValue ??
    item.taxable_value ??
    item.taxable
  );

  if (explicitTaxable) {
    const expectedTotalWithGst = calculatedTaxable + expectedGst;

    if (expectedGst && isNearlySame(explicitTaxable, expectedGst)) return calculatedTaxable;
    if (expectedTotalWithGst && isNearlySame(explicitTaxable, expectedTotalWithGst)) return calculatedTaxable;
    if (amount && explicitTaxable < amount * 0.5 && expectedGst && isNearlySame(explicitTaxable, expectedGst)) return calculatedTaxable;

    return roundMoney(getProratedValue(explicitTaxable, item));
  }

  const legacyTax = parseAmount(item.tax);
  if (legacyTax && expectedGst && !isNearlySame(legacyTax, expectedGst)) {
    return roundMoney(getProratedValue(legacyTax, item));
  }

  return calculatedTaxable;
};

const getLineGstAmount = (item = {}, taxableValue) => {
  const taxable = taxableValue !== undefined ? parseAmount(taxableValue) : getLineTaxable(item);
  const gstRate = getItemGstRateValue(item);
  const expectedGst = gstRate ? roundMoney((taxable * gstRate) / 100) : 0;

  const directGst = parseAmount(
    item.gstAmount ??
    item.gst_amount ??
    item.totalTax ??
    item.total_tax ??
    item.tax
  );
  const splitGst = parseAmount(item.cgst) + parseAmount(item.sgst) + parseAmount(item.igst);
  const explicitGst = directGst || splitGst;

  if (explicitGst) {
    const proratedExplicitGst = roundMoney(getProratedValue(explicitGst, item));
    if (!expectedGst || isNearlySame(proratedExplicitGst, expectedGst)) return proratedExplicitGst;
  }

  return expectedGst;
};

const mergeChallanWithProforma = (challan = {}, estimate = {}) => {
  const estimateCompany = typeof estimate?.company === "object" && estimate.company ? estimate.company : {};
  const c1 = estimateCompany?.contacts?.[0] || estimateCompany?.contact1 || {};

  const companyEmail = getCleanValue(
    getEmailValue(challan),
    getEmailValue(estimate),
    estimateCompany.email,
    estimateCompany.companyEmail,
    estimateCompany.contact1?.email,
    estimateCompany.contacts?.[0]?.email,
    c1.email
  );

  const companyCity = getCleanValue(
    challan.company_city,
    estimate.company_city,
    estimate.city,
    estimateCompany.city,
    estimateCompany.district
  );

  const companyState = getCleanValue(
    challan.company_state,
    challan.state,
    estimate.company_state,
    estimate.state,
    estimateCompany.state
  );

  const companyCountry = getCleanValue(
    challan.company_country,
    estimate.company_country,
    estimate.country,
    estimateCompany.country
  );

  const companyPincode = getCleanValue(
    challan.company_pincode,
    challan.pincode,
    challan.pin_code,
    estimate.company_pincode,
    estimate.pincode,
    estimate.pin_code,
    estimate.postal_code,
    estimate.zip_code,
    estimateCompany.pincode,
    estimateCompany.pinCode,
    estimateCompany.pin_code,
    estimateCompany.postalCode,
    estimateCompany.postal_code,
    estimateCompany.zipCode,
    estimateCompany.zip_code
  );

  const companyAddressLine = stripAddressTokens(
    getCleanValue(
      challan.company_address,
      challan.company_addr,
      challan.address,
      estimate.company_addr,
      estimate.company_address,
      estimate.address,
      estimateCompany.address,
      estimateCompany.company_addr,
      estimateCompany.companyAddress
    ),
    [companyCity, companyPincode, companyState, companyCountry]
  );

  const companyAddress = joinAddressParts([
    companyAddressLine,
    companyCity,
    companyPincode,
    companyState,
    companyCountry,
  ]);

  const deliveryCity = getCleanValue(challan.delivery_city, estimate.delivery_city, estimate.shipping_city);
  const deliveryState = getCleanValue(challan.delivery_state, estimate.delivery_state, estimate.shipping_state);
  const deliveryCountry = getCleanValue(challan.delivery_country, estimate.delivery_country, estimate.shipping_country);
  const deliveryPincode = getCleanValue(challan.delivery_pincode, challan.delivery_pin_code, estimate.delivery_pincode, estimate.delivery_pin_code, estimate.shipping_pincode, estimate.shipping_pin_code);

  const rawDeliveryAddress = getCleanValue(
    estimate.event_place_of_supply,
    estimate.consignee_addr,
    estimate.place_of_supply_address,
    estimate.delivery_address,
    challan.delivery_address,
    challan.delivery_addr,
    challan.shipment_address,
    challan.shipping_address
  );
  const deliveryAddress = isEventLikeValue(rawDeliveryAddress)
    ? rawDeliveryAddress
    : joinAddressParts([rawDeliveryAddress, deliveryCity, deliveryPincode, deliveryState, deliveryCountry]);

  const safeShippedTo = !isEventLikeValue(challan.shipped_to) ? cleanAddressPart(challan.shipped_to) : "";

  return {
    ...challan,

    company_name: getCleanValue(
      challan.company_name,
      estimate.company_name,
      estimate.companyName,
      estimateCompany.companyName,
      estimateCompany.exhibitorName
    ),

    company_address: companyAddress || challan.company_address || "",
    company_email: companyEmail,
    contact_email: getCleanValue(challan.contact_email, companyEmail),
    company_city: companyCity,
    company_state: companyState,
    company_country: companyCountry,
    company_pincode: companyPincode,

    company_gst_no: getCleanValue(
      challan.company_gst_no,
      estimate.company_gst_no,
      estimate.gst_no,
      estimate.gstin,
      estimateCompany.gstNo,
      estimateCompany.gst_no,
      estimateCompany.gstin
    ),

    contact_person: normalizeContactName(
      getCleanValue(
        challan.contact_person,
        estimate.contact_person,
        estimate.company_contact_person,
        estimate.consignee_person,
        estimateCompany.contactPerson,
        estimateCompany.contact_person,
        [c1.title, c1.firstName, c1.surname].filter(Boolean).join(" ")
      ),
      [c1.title, c1.firstName, c1.surname].filter(Boolean).join(" ")
    ),

    contact_phone: getCleanValue(
      challan.contact_phone,
      estimate.contact_phone,
      estimate.contact_no,
      estimate.company_contact_no,
      estimate.company_phone,
      estimate.mobile,
      estimate.phone,
      estimate.consignee_phone,
      c1.mobile,
      estimateCompany.mobile,
      estimateCompany.landline
    ),

    event_name: getCleanValue(
      challan.event_name,
      estimate.event_name,
      estimate.consignee_name
    ),

    delivery_address: deliveryAddress || challan.delivery_address || companyAddress || "",
    delivery_city: deliveryCity,
    delivery_state: deliveryState,
    delivery_country: deliveryCountry,
    delivery_pincode: deliveryPincode,

    shipped_to: getCleanValue(
      safeShippedTo,
      estimate.place_of_supply,
      estimate.placeOfSupply,
      deliveryState,
      companyState
    ),

    state_code: getCleanValue(
      challan.state_code,
      estimate.state_code,
      estimate.place_of_supply_code,
      estimate.stateCode
    ),
    items: Array.isArray(challan.items)
      ? challan.items.map((item) => {
        const amount = getLineAmount(item);
        const taxable = getLineTaxable(item);
        const gstAmount = getLineGstAmount(item, taxable);
        return {
          ...item,
          amount,
          taxable,
          gstAmount,
          finalAmount: roundMoney(taxable + gstAmount),
        };
      })
      : challan.items,
  };
};



const DEFAULT_CHALLAN_COPY = "ORIGINAL DELIVERY CHALLAN";
const PROFORMA_PLACE_OF_SUPPLY = "Hall Nos. 8, 9 & 10, Pragati Maidan, New Delhi - 110001, Bharat";
const PROFORMA_EVENT_STATE = "Delhi";
const PROFORMA_PLACE_OF_SUPPLY_WITH_CODE = "Delhi (07)";

const forceDelhiGstin = (value) => {
  const text = String(value || "").trim().toUpperCase();
  return /^\d{2}[0-9A-Z]{13}$/.test(text) ? `07${text.slice(2)}` : text;
};

const DeliveryChallanPrint = ({ challan, settings, bankDetails, estimateTerms, copyLabel = DEFAULT_CHALLAN_COPY }) => {
  const challanCopyType = String(copyLabel || "")
    .replace(/\s*DELIVERY\s+CHALLAN\s*/gi, "")
    .trim();
  const challanCopyLabel = challanCopyType ? `${challanCopyType} COPY` : copyLabel;

  const fmtNum = (value, decimals = 0) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return decimals ? "0.00" : "0";
    return number.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const fmtDateOnly = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatSize = (value) => {
    if (!value && value !== 0) return "-";
    return `${String(value).replace(/\s*[xX*]\s*/g, " × ").trim()} m`;
  };

  const formatArea = (value) => {
    if (!value && value !== 0) return "-";
    return `${value} sqm`;
  };

  const mediaUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    const normalized = String(value).replace(/\\/g, "/");
    const uploadsIndex = normalized.indexOf("uploads/");
    const relativePath = uploadsIndex >= 0 ? normalized.slice(uploadsIndex) : normalized.replace(/^\/+/, "");
    return `${SERVER_URL}/${relativePath}`;
  };

  const items = challan.items || [];
  const getGstRate = (item) => getItemGstRateValue(item);

  const lineValue = (item, key) => {
    const amount = getLineAmount(item);
    const taxable = getLineTaxable(item);
    const gstAmount = getLineGstAmount(item, taxable);

    if (key === "amount") return amount;
    if (key === "discount") return Math.max(0, amount - taxable);
    if (key === "taxable") return taxable;
    if (key === "gstAmount") return gstAmount;
    if (key === "finalAmount") return roundMoney(taxable + gstAmount);

    return 0;
  };
  const discountPercentValue = (item) => getDiscountPercentValue(item);
  const totalQty = items.reduce((sum, it) => sum + parseAmount(it.qty || it.quantity || 0), 0);
  const totalTaxable = roundMoney(items.reduce((sum, it) => sum + lineValue(it, "taxable"), 0));
  const totalGst = roundMoney(items.reduce((sum, it) => sum + lineValue(it, "gstAmount"), 0));
  const grandTotal = roundMoney(totalTaxable + totalGst);
  const hsnRows = Object.values(items.reduce((acc, item) => {
    const hsn = item.hsn || "-";
    if (!acc[hsn]) acc[hsn] = { hsn, qty: 0, taxable: 0, gstRate: getGstRate(item), gst: 0 };
    acc[hsn].qty += parseAmount(item.qty || item.quantity || 0);
    acc[hsn].taxable += lineValue(item, "taxable");
    acc[hsn].gst += lineValue(item, "gstAmount");
    return acc;
  }, {})).map((row) => ({ ...row, taxable: roundMoney(row.taxable), gst: roundMoney(row.gst) }));
  const companyName = settings?.companyName || "Namo Gange Wellness Pvt. Ltd.";
  const companyGst = forceDelhiGstin(settings?.companyGst || settings?.companyGstin || "07AAFCN9238F1Z6");
  const companyGstShort = String(companyGst || "-").slice(0, 11);
  const bank = bankDetails || {};
  const bankName = bank.bankname || bank.bankName || settings?.bankName || "-";
  const accountName = bank.accountname || bank.accountName || settings?.accountName || companyName;
  const accountNo = bank.accountno || bank.accountNo || settings?.accountNo || "-";
  const ifscCode = bank.ifsccode || bank.ifscCode || settings?.ifscCode || "-";
  const bankBranch = bank.bankbranch || bank.branch || settings?.bankBranch || "-";

  const buyerAddressLine = stripAddressTokens(getFirstAddressValue(
    challan.company_address,
    challan.company_addr,
    challan.companyAddress,
    challan.address,
    challan.company?.address,
    challan.company?.company_addr,
    challan.company?.companyAddress
  ), [
    challan.company_city || challan.city || challan.company?.city || challan.company?.district,
    challan.company_pincode || challan.pincode || challan.pin_code || challan.postal_code || challan.zip_code || challan.company?.pincode || challan.company?.pinCode || challan.company?.pin_code || challan.company?.postalCode || challan.company?.postal_code || challan.company?.zipCode || challan.company?.zip_code,
    challan.company_state || challan.state || challan.company?.state,
    challan.company_country || challan.country || challan.company?.country,
  ]);

  const buyerCity = getFirstAddressValue(
    challan.company_city,
    challan.city,
    challan.company?.city,
    challan.company?.district
  );

  const buyerState = getFirstAddressValue(
    challan.company_state,
    challan.state,
    challan.company?.state
  );

  const buyerCountry = getFirstAddressValue(
    challan.company_country,
    challan.country,
    challan.company?.country
  );

  const buyerPincode = getFirstAddressValue(
    challan.company_pincode,
    challan.pincode,
    challan.pin_code,
    challan.postal_code,
    challan.zip_code,
    challan.company?.pincode,
    challan.company?.pinCode,
    challan.company?.pin_code,
    challan.company?.postalCode,
    challan.company?.postal_code,
    challan.company?.zipCode,
    challan.company?.zip_code
  );

  const buyerCompanyAddress = joinAddressParts([
    buyerAddressLine,
    buyerCity,
    buyerPincode,
    buyerState,
    buyerCountry,
  ]) || "-";

  const deliveryAddressLine = getFirstAddressValue(
    challan.delivery_address,
    challan.delivery_addr,
    challan.shipment_address,
    challan.shipping_address
  );

  const deliveryCity = getFirstAddressValue(
    challan.delivery_city,
    challan.shipping_city,
    challan.city,
    challan.company_city
  );

  const deliveryState = getFirstAddressValue(
    challan.delivery_state,
    challan.shipping_state,
    challan.state,
    challan.company_state
  );

  const deliveryCountry = getFirstAddressValue(
    challan.delivery_country,
    challan.shipping_country,
    challan.country,
    challan.company_country
  );

  const deliveryPincode = getFirstAddressValue(
    challan.delivery_pincode,
    challan.delivery_pin_code,
    challan.shipping_pincode,
    challan.shipping_pin_code,
    challan.pincode,
    challan.company_pincode
  );

  const cleanShipmentAddress = isEventLikeValue(deliveryAddressLine) ? deliveryAddressLine : PROFORMA_PLACE_OF_SUPPLY;
  const shipmentAddress = joinAddressParts([
    (cleanShipmentAddress || "").replace(/,\s*Bharat$/i, ""),
    PROFORMA_EVENT_STATE,
    "Bharat",
  ]);

  const titledBuyerContactPerson = [
    challan.company?.contact1?.title || challan.company?.contacts?.[0]?.title,
    challan.company?.contact1?.firstName || challan.company?.contacts?.[0]?.firstName,
    challan.company?.contact1?.surname || challan.company?.contacts?.[0]?.surname,
  ].filter(Boolean).join(" ");
  const rawBuyerContactPerson =
    challan.contact_person ||
    challan.company_contact_person ||
    challan.consignee_person ||
    challan.company?.contactPerson ||
    challan.company?.contact_person ||
    "-";
  const buyerContactPerson = normalizeContactName(rawBuyerContactPerson, titledBuyerContactPerson);

  const buyerContactNo =
    challan.contact_phone ||
    challan.contact_no ||
    challan.company_contact_no ||
    challan.company_phone ||
    challan.mobile ||
    challan.phone ||
    challan.consignee_phone ||
    challan.company?.mobile ||
    challan.company?.landline ||
    "-";

  const buyerEmail = getEmailValue(challan) || "-";

  const buyerGstNo =
    challan.company_gst_no ||
    challan.gst_no ||
    challan.gstin ||
    challan.company?.gstNo ||
    challan.company?.gst_no ||
    "-";

  const placeOfSupplyCode = PROFORMA_PLACE_OF_SUPPLY_WITH_CODE;

  const deliveryChallanNo = challan.challan_no || "-";
  const deliveryChallanDate = fmtDateOnly(challan.challan_date);

  const th = { border: "1px solid #0d1f3c", background: "#0d1f3c", color: "#fff", padding: "3px 2px", fontSize: 10, lineHeight: 1.1, fontWeight: 700, textAlign: "center", textTransform: "uppercase" };
  const td = { border: "1px solid #ccc", padding: "6px", fontSize: 11, lineHeight: 1.2, verticalAlign: "top" };
  const topTh = { ...th };
  const topTd = { ...td, padding: "4px 8px" };
  const topInfoLine = { margin: 0, padding: 0, fontSize: 11, lineHeight: 1.2 };
  const labelCell = { border: "none", padding: "1px 3px 1px 0", fontSize: 11, fontWeight: 700, width: "1%", whiteSpace: "nowrap", lineHeight: 1.3 };
  const colonCell = { border: "none", padding: "1px 3px 1px 0", fontSize: 11, fontWeight: 700, width: "1%", lineHeight: 1.3 };
  const valueCell = { border: "none", padding: "1px 0", fontSize: 11, lineHeight: 1.3 };
  const detailLabelCell = { ...labelCell, fontSize: 10, padding: "1px 2px 1px 0" };
  const detailColonCell = { ...colonCell, fontSize: 10, padding: "1px 6px 1px 3px" };
  const detailValueCell = { ...valueCell, fontSize: 10, padding: "1px 0 1px 1px" };
  const mutedCell = { ...td, background: "#f8fafc", fontWeight: 700, textTransform: "uppercase" };

  return (
    <div className="challan-print invoice-print-root bg-white border border-slate-300 p-10 text-[11px] font-sans text-black" style={{ fontFamily: "Calibri, Arial, sans-serif", maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
      <div style={{ position: "relative" }}>
        {challan.status === "cancelled" && <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-[5px] border-red-600/70 px-7 py-2 text-4xl font-black uppercase tracking-widest text-red-600/70">Cancelled</div>}

        <div className="challan-page-header" style={{ marginBottom: 0, textAlign: "center" }}>
          <img loading="lazy" decoding="async" src={invoiceHeader} alt="Namo Gange Design House" style={{ width: "100%", maxWidth: "100%", display: "block" }} />
        </div>
        <div className="challan-page-body">

          <div className="invoice-title-bar" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 22, marginBottom: 0, paddingTop: 10, paddingBottom: 4, color: "#0d1f3c", textTransform: "uppercase" }}>
            <div style={{ fontWeight: 500, fontSize: 18, lineHeight: 1, textAlign: "center" }}>DELIVERY CHALLAN</div>
            <div className="invoice-copy-label" style={{ position: "absolute", right: 0, bottom: 3, fontWeight: 600, fontSize: 11, lineHeight: 1, paddingRight: 2, whiteSpace: "nowrap", textAlign: "right", letterSpacing: "-0.35px" }}>{challanCopyLabel}</div>
          </div>

          <table className="challan-summary-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8, tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th className="challan-client-column" style={{ ...topTh, width: "32%" }}>Buyer's Name &amp; Address</th>
                <th className="challan-shipment-column" style={{ ...topTh, width: "32%" }}>Shipment Details</th>
                <th className="challan-details-column" style={{ ...topTh, width: "36%" }}>Delivery Challan Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...topTd, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  <div style={{ ...topInfoLine, fontWeight: 800, textTransform: "uppercase", marginBottom: 1 }}>{challan.company_name || "-"}</div>
                  <div style={{ ...topInfoLine, whiteSpace: "pre-wrap" }}>{buyerCompanyAddress}</div>
                  <table style={{ borderCollapse: "collapse", border: "none", lineHeight: 1.3, width: "100%", marginTop: 4 }}>
                    <tbody>
                      {[
                        ["Contact Person", buyerContactPerson],
                        ["Contact No.", buyerContactNo],
                        ["Email", buyerEmail],
                        ["GSTIN/PAN", buyerGstNo],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td style={labelCell}>{label}</td>
                          <td style={colonCell}>:</td>
                          <td style={valueCell}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td style={{ ...topTd, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  <div style={{ ...topInfoLine, fontWeight: 800, textTransform: "uppercase", marginBottom: 1 }}>{challan.event_name || "9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO"}</div>
                  <div style={{ ...topInfoLine, fontSize: 10.5, whiteSpace: "pre-wrap" }}>{shipmentAddress}</div>
                  <table style={{ borderCollapse: "collapse", border: "none", lineHeight: 1.3, width: "100%", marginTop: 4 }}>
                    <tbody>
                      {[
                        ["Place of Supply & Code", placeOfSupplyCode],
                        ["Contact Person", buyerContactPerson],
                        ["Contact No.", buyerContactNo],
                        ["GSTIN", companyGstShort],
                      ].map(([label, value]) => {
                        const isCompanyGstRow = label === "GSTIN";
                        return (
                          <tr key={label}>
                            <td style={labelCell}>{isCompanyGstRow ? "GST" : label}</td>
                            <td style={colonCell}>:</td>
                            <td style={isCompanyGstRow ? { ...valueCell, whiteSpace: "nowrap", wordBreak: "keep-all", overflowWrap: "normal", fontSize: 10.5 } : valueCell}>{value}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </td>
                <td className="challan-details-cell" style={{ ...topTd, padding: "4px 4px", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  <table className="challan-detail-info-table" style={{ borderCollapse: "collapse", border: "none", lineHeight: 1.3, width: "auto", maxWidth: "100%" }}>
                    <tbody>
                      {[
                        ["DC No.", deliveryChallanNo],
                        ["Delivery Challan Date", deliveryChallanDate],
                        ["Delivery Challan Type", challan.challan_type || "Outward"],
                        ["Type of Sale", challan.type_of_sale || "-"],
                        ["PO No.", challan.po_no || "-"],
                        ["Bilty No.", challan.bilty_no || "-"],
                        ["Vehicle No.", challan.vehicle_no || "-"],
                        ["E-Way Bill No.", challan.eway_bill || "-"],
                      ].map(([label, value]) => {
                        const keepInOneLine = label === "DC No.";
                        return (
                          <tr key={label}>
                            <td style={detailLabelCell}>{label}</td>
                            <td style={detailColonCell}>:</td>
                            <td
                              style={{
                                ...detailValueCell,
                                textAlign: "left",
                                whiteSpace: keepInOneLine ? "nowrap" : "normal",
                                overflowWrap: keepInOneLine ? "normal" : "anywhere",
                                wordBreak: keepInOneLine ? "keep-all" : "break-word",
                              }}
                            >
                              {value}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="challan-items-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
            <thead>
              <tr>
                {[
                  ["S.No.", "3%"],
                  ["Item Description", "41%"],
                  ["HSN Code", "8%"],
                  ["Qty.", "4%"],
                  ["Size", "8%"],
                  ["Area", "8%"],
                  ["Unit", "5%"],
                  ["Rate", "7%"],
                  ["Discount", "7%"],
                  ["Amount", "9%"],
                ].map(([label, width]) => <th key={label} style={{ ...th, width }}>{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.sourceItemKey}-${index}`}>
                  <td style={{ ...td, textAlign: "center" }}>{index + 1}</td>
                  <td style={{ ...td, minHeight: 34 }}>
                    <div style={{ fontWeight: 800, textTransform: "uppercase" }}>{challan.event_name || "9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO"}</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{item.description || "-"}</div>
                    {item.remarks && <div style={{ whiteSpace: "pre-wrap" }}>{item.remarks}</div>}
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>{item.hsn || "-"}</td>
                  <td style={{ ...td, textAlign: "center" }}>{fmtNum(item.qty)}</td>
                  <td style={{ ...td, textAlign: "center", whiteSpace: "nowrap" }}>{formatSize(item.area)}</td>
                  <td style={{ ...td, textAlign: "center", whiteSpace: "nowrap" }}>{formatArea(item.size)}</td>
                  <td style={{ ...td, textAlign: "center", whiteSpace: "nowrap" }}>Nos</td>
                  <td style={{ ...td, textAlign: "right" }}>{fmtNum(item.rate || 0)}</td>
                  <td style={{ ...td, textAlign: "center" }}>{fmtNum(discountPercentValue(item))}%</td>
                  <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{fmtNum(lineValue(item, "taxable"))}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 7 - items.length) }).map((_, row) => (
                <tr key={`blank-${row}`} className="challan-blank-row" style={{ height: 24 }}>
                  {Array.from({ length: 10 }).map((__, cell) => <td key={cell} style={td}></td>)}
                </tr>
              ))}
              <tr className="challan-taxable-row">
                <td colSpan={7} style={{ ...mutedCell, fontSize: 10, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                </td>
                <td colSpan={2} style={{ ...mutedCell, textAlign: "right", fontSize: 10, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                  Taxable Value
                </td>
                <td style={{ ...mutedCell, textAlign: "center", padding: "4px 4px", fontSize: 10, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                  {fmtNum(totalTaxable)}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="challan-tax-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
            <thead>
              <tr>
                {["S.No.", "HSN/SAC No.", "Item Value", "Qty.", "CGST(%)", "Amount", "SGST(%)", "Amount", "IGST(%)", "Amount", "Total Tax"].map((head) => (
                  <th key={head} style={th}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hsnRows.map((row, index) => {
                const isIgst = String(challan.type_of_sale || "").toLowerCase().includes("inter");
                const halfRate = row.gstRate / 2;
                const halfGst = row.gst / 2;
                return (
                  <tr key={row.hsn}>
                    <td style={{ ...td, textAlign: "center" }}>{index + 1}</td>
                    <td style={{ ...td, textAlign: "center" }}>{row.hsn}</td>
                    <td style={{ ...td, textAlign: "center" }}>{fmtNum(row.taxable)}</td>
                    <td style={{ ...td, textAlign: "center" }}>{fmtNum(row.qty)}</td>
                    <td style={{ ...td, textAlign: "center" }}>{isIgst ? "-" : `${fmtNum(halfRate)}%`}</td>
                    <td style={{ ...td, textAlign: "center" }}>{isIgst ? "-" : fmtNum(halfGst)}</td>
                    <td style={{ ...td, textAlign: "center" }}>{isIgst ? "-" : `${fmtNum(halfRate)}%`}</td>
                    <td style={{ ...td, textAlign: "center" }}>{isIgst ? "-" : fmtNum(halfGst)}</td>
                    <td style={{ ...td, textAlign: "center" }}>{isIgst ? `${fmtNum(row.gstRate)}%` : "-"}</td>
                    <td style={{ ...td, textAlign: "center" }}>{isIgst ? fmtNum(row.gst) : "-"}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{fmtNum(row.gst)}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={3} style={{ ...mutedCell, textAlign: "center" }}>GST Amount in Words (INR)</td>
                <td colSpan={6} style={{ ...td, textTransform: "capitalize", textAlign: "center" }}>{toWords(totalGst)}</td>
                <td style={{ ...mutedCell, textAlign: "center", whiteSpace: "nowrap" }}>Total GST Amount</td>
                <td style={{ ...td, textAlign: "center", fontWeight: 800 }}>{fmtNum(totalGst)}</td>
              </tr>
              <tr style={{ height: 8 }}>
                {Array(11).fill(0).map((_, cell) => <td key={cell} style={{ border: "none", padding: 0 }}></td>)}
              </tr>
              <tr>
                <td colSpan={3} style={{ ...mutedCell, textAlign: "center" }}>Amount in Words (INR)</td>
                <td colSpan={6} style={{ ...td, textTransform: "capitalize", textAlign: "center" }}>{toWords(grandTotal)}</td>
                <td style={{ ...mutedCell, textAlign: "center" }}>Grand Total</td>
                <td style={{ ...td, textAlign: "center", fontWeight: 800, fontSize: 13, color: "#000" }}>{fmtNum(grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          <table className="challan-remarks-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
            <tbody>
              <tr>
                <td style={{ ...td, width: '50%', verticalAlign: 'top', background: '#fafafa' }}>
                  <div style={{ fontWeight: 800, marginBottom: 6, background: '#F8FAFC', borderBottom: '1px solid #ccc', padding: '4px 8px', margin: '-6px -8px 6px' }}>Terms and Conditions:</div>
                  <div style={{ marginLeft: 4, whiteSpace: 'pre-wrap' }}>
                    {estimateTerms?.termsAndConditions?.length ? (
                      estimateTerms.termsAndConditions.map((t, i) => <div key={i}>{i + 1}. {t}</div>)
                    ) : (
                      <>
                        <div>1. Goods once delivered will not be taken back.</div>
                        <div>2. Please check the goods in presence of our delivery executive.</div>
                        <div>3. Any discrepancy should be reported within 24 hours.</div>
                        <div>4. Goods are delivered in good condition.</div>
                        <div>5. Subject to Delhi Jurisdiction only.</div>
                      </>
                    )}
                  </div>
                </td>
                <td style={{ ...td, width: '50%', verticalAlign: 'top', background: '#fafafa' }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>Delivery Notes:</div>
                  <div style={{ marginLeft: 4, whiteSpace: 'pre-wrap' }}>
                    {estimateTerms?.deliveryNotes?.length ? (
                      estimateTerms.deliveryNotes.map((t, i) => <div key={i}>{i + 1}. {t}</div>)
                    ) : (
                      <>
                        <div>1. Goods delivered as per Purchase Order.</div>
                        <div>2. For any queries, please contact our office.</div>
                      </>
                    )}
                  </div>
                  {(estimateTerms?.specialRemark || challan.remarks) && (
                    <>
                      <div style={{ fontWeight: 800, marginTop: 8, marginBottom: 4 }}>Special Remark:</div>
                      <div style={{ marginLeft: 4, whiteSpace: 'pre-wrap' }}>{estimateTerms?.specialRemark || challan.remarks}</div>
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-footer-section">
            <table className="avoid-break" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0, border: '1px solid #ccc' }}>
              <colgroup>
                <col style={{ width: '33%' }} />
                <col style={{ width: '33%' }} />
                <col style={{ width: '34%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th style={{ border: 'none', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '6px 8px', background: '#fafafa', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0d1f3c', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      <Landmark size={14} strokeWidth={2} /> NGWPL Bank Details
                    </div>
                  </th>
                  <th style={{ border: 'none', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '6px 8px', background: '#fafafa', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0d1f3c', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      <SquarePen size={14} strokeWidth={2} /> Receiver's Acknowledgement
                    </div>
                  </th>
                  <th style={{ border: 'none', borderBottom: '1px solid #ccc', padding: '6px 8px', background: '#fafafa', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0d1f3c', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      <SquarePen size={14} strokeWidth={2} /> For {companyName}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={2} style={{ border: 'none', borderRight: '1px solid #ccc', padding: '2px 8px 2px', verticalAlign: 'top', fontSize: 10, width: '33.33%' }}>
                    <table style={{ borderCollapse: "collapse", border: "none", lineHeight: 1.3, width: "auto" }}>
                      <tbody>
                        {[
                          ["Bank Name", bankName],
                          ["Account Name", accountName],
                          ["Account No.", accountNo],
                          ["IFSC Code", ifscCode],
                          ["Branch Name", bankBranch],
                        ].map(([label, value]) => (
                          <tr key={label}>
                            <td style={labelCell}>{label}</td>
                            <td style={colonCell}>:</td>
                            <td style={{ ...valueCell, wordBreak: 'break-word', whiteSpace: label === 'Branch Name' ? 'normal' : 'nowrap', ...(label === 'IFSC Code' ? { fontWeight: 700, color: '#0d1f3c' } : {}) }}>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td style={{ border: 'none', borderRight: '1px solid #ccc', padding: '2px 8px 8px', verticalAlign: 'top', textAlign: 'center', width: '33.33%' }}>
                    <span style={{ fontSize: 9, whiteSpace: 'nowrap' }}>Received the above goods / services in good condition.</span>
                  </td>
                  <td style={{ border: 'none', padding: '8px', verticalAlign: 'top', textAlign: 'center', width: '33.33%' }}>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      {settings?.authorizedSignature && <img src={mediaUrl(settings.authorizedSignature)} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ maxHeight: 45, maxWidth: 100, objectFit: "contain" }} />}
                      {settings?.companyStamp && <img src={mediaUrl(settings.companyStamp)} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ maxHeight: 45, maxWidth: 45, objectFit: "contain" }} />}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ border: 'none', borderRight: '1px solid #ccc', padding: '0 8px 2px', verticalAlign: 'bottom' }}>
                    <div style={{ borderTop: '1px solid #ccc', margin: '0 2px 4px' }}></div>
                    <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#888', fontSize: 10 }}>(Signature &amp; Company Seal)</div>
                  </td>
                  <td style={{ border: 'none', padding: '0 8px 2px', verticalAlign: 'bottom' }}>
                    <div style={{ borderTop: '1px solid #ccc', margin: '0 2px 4px' }}></div>
                    <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#888', fontSize: 10 }}>Authorized Signatory.</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="avoid-break" style={{ position: 'relative', height: 62, overflow: 'hidden', border: '1px solid #ccc', borderTop: 'none' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, background: '#0d1f3c', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, fontSize: 11, fontWeight: 500, color: '#0d1f3c', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  +91 96549 00525
                </div>
                <div style={{ width: 1, height: 12, background: '#ccc' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> info@namogangewellness.com</div>
                <div style={{ width: 1, height: 12, background: '#ccc' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={12} /> www.namogangewellness.com</div>
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10.5, zIndex: 2 }}>
                <span>This is a computer generated document and does not require a physical signature.</span>
              </div>
            </div>
          </div>
        </div>{/* end challan-page-body */}
      </div>
    </div>

  );
};

const DeliveryChallanManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const directCreateHandled = useRef(false);
  const challanPrintRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [challans, setChallans] = useState([]);
  const [proformas, setProformas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [mode, setMode] = useState("list");
  const [settings, setSettings] = useState(null);
  const [banks, setBanks] = useState([]);
  const [commModal, setCommModal] = useState({ isOpen: false, type: "whatsapp", docId: "" });
  const [accountName, setAccountName] = useState("");
  const [challanCopies, setChallanCopies] = useState([DEFAULT_CHALLAN_COPY]);
  const [estimateTerms, setEstimateTerms] = useState(null);

  const selectedProforma = useMemo(
    () => proformas.find((item) => item._id === form.source_estimate_id),
    [form.source_estimate_id, proformas],
  );
  const selectedItems = useMemo(
    () => (form.items || []).filter((item) => item.selected !== false),
    [form.items],
  );
  const selectedQuantity = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0),
    [selectedItems],
  );

  const enrichChallanForView = (challan) => {
    const estimate = (proformas || []).find(
      (item) =>
        String(item._id) === String(challan?.source_estimate_id) ||
        String(item.est_no || item.estimate_no) === String(challan?.estimate_no)
    );

    return mergeChallanWithProforma(challan || {}, estimate || {});
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [challanRes, proformaRes, settingsRes, accountRes, bankRes, termsRes] = await Promise.all([
        api.get(`/api/delivery-challans?companyId=${id}`),
        api.get(`/api/delivery-challans/proformas/${id}`),
        api.get("/api/settings"),
        api.get(`/api/account-overview/${id}`).catch(() => ({ data: {} })),
        api.get("/api/banks").catch(() => ({ data: [] })),
        api.get("/api/estimate-terms-config/delivery-challan").catch(() => null)
      ]);
      setChallans(Array.isArray(challanRes.data) ? challanRes.data : []);
      setProformas(Array.isArray(proformaRes.data) ? proformaRes.data : []);
      setSettings(settingsRes.data?.data || settingsRes.data || null);
      setBanks(Array.isArray(bankRes.data) ? bankRes.data : []);
      if (accountRes.data?.success) setAccountName(accountRes.data.data?.companyInfo?.name || "");
      if (termsRes?.data?.success && termsRes.data.data) {
        setEstimateTerms(termsRes.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load delivery challans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const printChallan = useReactToPrint({
    contentRef: challanPrintRef,
    documentTitle: "delivery-challan",
    onAfterPrint: () => setChallanCopies([DEFAULT_CHALLAN_COPY]),
  });

  const startCreate = () => {
    setEditingId("");
    setForm({ ...emptyForm, items: [] });
    setMode("form");
  };

  const selectProforma = (estimateId) => {
    const estimate = proformas.find((item) => item._id === estimateId);
    setForm((previous) => {
      const nextForm = {
        ...previous,
        source_estimate_id: estimateId,
        company_name: estimate?.company_name || previous.company_name,
        company_address: joinAddressParts([
          estimate?.company_pincode || estimate?.pincode || estimate?.pin_code || estimate?.postal_code || estimate?.zip_code,
          estimate?.company_addr,
          estimate?.company_address,
          estimate?.address,
          estimate?.company_city || estimate?.city,
          estimate?.company_state || estimate?.state,
          estimate?.company_country || estimate?.country,
        ]) || previous.company_address,
        company_gst_no: estimate?.company_gst_no || previous.company_gst_no,
        contact_person: estimate?.contact_person || previous.contact_person,
        contact_phone: estimate?.contact_phone || estimate?.company_phone || estimate?.mobile || previous.contact_phone,
        company_email: getEmailValue(estimate) || previous.company_email,
        contact_email: getEmailValue({ contact_email: estimate?.contact_email, contactEmail: estimate?.contactEmail, contact1: estimate?.contact1, contact: estimate?.contact, contacts: estimate?.contacts }) || getEmailValue(estimate) || previous.contact_email || previous.company_email,
        company_city: estimate?.company_city || estimate?.city || previous.company_city,
        company_state: estimate?.company_state || estimate?.state || previous.company_state,
        company_country: estimate?.company_country || estimate?.country || previous.company_country,
        company_pincode: estimate?.company_pincode || estimate?.pincode || estimate?.pin_code || previous.company_pincode,
        delivery_city: estimate?.delivery_city || previous.delivery_city,
        delivery_state: estimate?.delivery_state || previous.delivery_state,
        delivery_country: estimate?.delivery_country || previous.delivery_country,
        delivery_pincode: estimate?.delivery_pincode || previous.delivery_pincode,
        event_name: estimate?.event_name || previous.event_name,
        delivery_address: getCleanValue(
          estimate?.event_place_of_supply,
          estimate?.consignee_addr,
          estimate?.delivery_address,
          previous.delivery_address
        ),
        remarks: estimate?.remarks || previous.remarks,
        terms: estimate?.terms || previous.terms,
        items: (estimate?.items || []).filter((item) => item.remainingQty > 0).map((item) => ({
          sourceItemKey: item.sourceItemKey,
          description: item.description,
          hsn: item.hsn,
          unit: item.unit,
          size: item.size,
          area: item.area,
          remarks: item.remarks || "",
          rate: item.rate || 0,
          discount: item.discount || 0,
          discountPct: item.discountPct || item.disc || 0,
          amount: item.amount || 0,
          taxable: item.taxableValue || item.taxable || item.tax || 0,
          gstRate: item.gstRate || item.gstPct || item.gst_per || item.igst_per || (item.cgst_per ? Number(item.cgst_per) * 2 : 0) || 0,
          gstAmount: item.gstAmount || item.gst_amount || item.totalTax || item.total_tax || ((Number(item.cgst || 0) + Number(item.sgst || 0) + Number(item.igst || 0)) || 0),
          finalAmount: item.finalAmount || 0,
          qty: item.remainingQty,
          remainingQty: item.remainingQty,
          sourceQty: item.sourceQty,
          deliveredQty: item.deliveredQty,
          selected: true,
        })),
      };

      return mergeChallanWithProforma(nextForm, estimate || {});
    });
  };

  useEffect(() => {
    if (directCreateHandled.current) return;

    const viewChallanId = location.state?.viewChallanId;
    if (viewChallanId && challans.length > 0) {
      const matchingChallan = challans.find((c) => String(c._id) === String(viewChallanId));
      if (matchingChallan) {
        directCreateHandled.current = true;
        setForm(enrichChallanForView(matchingChallan));
        setMode("view");
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }
    }

    const sourceEstimateId = location.state?.sourceEstimateId;
    if (!sourceEstimateId || !proformas.length) return;
    const matchingEstimate = proformas.find((estimate) => String(estimate._id) === String(sourceEstimateId));
    if (!matchingEstimate) return;
    directCreateHandled.current = true;
    setEditingId("");
    setForm({ ...emptyForm, items: [] });
    setMode("form");
    selectProforma(matchingEstimate._id);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, proformas, challans]);

  const updateItem = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  };

  const toggleItem = (index) => setForm((previous) => ({
    ...previous,
    items: previous.items.map((item, itemIndex) => itemIndex === index
      ? { ...item, selected: item.selected === false }
      : item),
  }));

  const save = async (event) => {
    event.preventDefault();
    if (!form.source_estimate_id) return toast.error("Please select a proforma invoice");
    if (!selectedItems.length) return toast.error("Please select at least one item");
    try {
      setSaving(true);
      const payload = {
        ...form,
        companyId: selectedProforma?.companyId || form.companyId || id,
        account_ref_id: id,
        added_by: getCurrentUserName("Admin"),
        items: selectedItems.map(({ remainingQty, deliveredQty, selected, ...item }) => ({ ...item, qty: Number(item.qty) })),
      };
      const wasEditing = Boolean(editingId);
      const response = wasEditing
        ? await api.put(`/api/delivery-challans/${editingId}`, payload)
        : await api.post("/api/delivery-challans", payload);
      toast.success(response.data?.message || "Delivery challan saved");
      setEditingId("");
      await loadData();
      if (wasEditing) {
        setMode("list");
      } else {
        setForm(enrichChallanForView(response.data?.data || payload));
        setMode("view");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save delivery challan");
    } finally {
      setSaving(false);
    }
  };

  const edit = async (challan) => {
    const source = proformas.find((item) => item._id === challan.source_estimate_id);
    const sourceByKey = new Map((source?.items || []).map((item) => [item.sourceItemKey, item]));
    setEditingId(challan._id);
    const enrichedChallan = enrichChallanForView(challan);
    setForm({
      ...emptyForm,
      ...enrichedChallan,
      items: challan.items.map((item) => {
        const sourceItem = sourceByKey.get(item.sourceItemKey);
        return {
          ...item,
          remainingQty: Number(sourceItem?.remainingQty || 0) + Number(item.qty || 0),
          sourceQty: sourceItem?.sourceQty,
          deliveredQty: Math.max(0, Number(sourceItem?.deliveredQty || 0) - Number(item.qty || 0)),
          selected: true,
        };
      }),
    });
    setMode("form");
  };

  const updateStatus = async (challan, status) => {
    const result = await Swal.fire({
      title: `${status.charAt(0).toUpperCase() + status.slice(1)} challan?`,
      text: challan.challan_no,
      icon: status === "cancelled" ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
    });
    if (!result.isConfirmed) return;
    try {
      await api.put(`/api/delivery-challans/${challan._id}`, { status });
      toast.success("Status updated");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update status");
    }
  };

  const view = async (challan) => {
    setForm(enrichChallanForView(challan));
    setChallanCopies([DEFAULT_CHALLAN_COPY]);
    setMode("view");
  };

  const handlePrint = async () => {
    const result = await Swal.fire({
      title: "Choose Delivery Challan Copy",
      width: 590,
      html: `
        <p style="margin:0 0 18px;color:#64748b;font-size:14px">
          Select the copy required for this print.
        </p>
        <div class="challan-copy-options">
          <label class="challan-copy-all">
            <input type="checkbox" id="select-all-challan-copies" checked />
            <span class="challan-copy-all-label">Select All</span>
          </label>
          <label class="challan-copy-card">
            <input type="checkbox" name="challan-copy" value="ORIGINAL DELIVERY CHALLAN" checked />
            <span class="challan-copy-check">✓</span>
            <span class="challan-copy-name">Original</span>
            <span class="challan-copy-purpose">For Recipient</span>
            <span class="challan-copy-help">Customer's official copy</span>
          </label>
          <label class="challan-copy-card">
            <input type="checkbox" name="challan-copy" value="DUPLICATE DELIVERY CHALLAN" checked />
            <span class="challan-copy-check">✓</span>
            <span class="challan-copy-name">Duplicate</span>
            <span class="challan-copy-purpose">For Supplier</span>
            <span class="challan-copy-help">Office and accounts record</span>
          </label>
          <label class="challan-copy-card">
            <input type="checkbox" name="challan-copy" value="TRIPLICATE DELIVERY CHALLAN" checked />
            <span class="challan-copy-check">✓</span>
            <span class="challan-copy-name">Triplicate</span>
            <span class="challan-copy-purpose">For Transportation</span>
            <span class="challan-copy-help">For movement of goods</span>
          </label>
        </div>
        <style>
          .challan-copy-options {
            display:grid;
            grid-template-columns:repeat(3, 1fr);
            gap:9px;
            text-align:left;
          }
          .challan-copy-all {
            grid-column:1 / -1;
            display:flex;
            align-items:center;
            gap:8px;
            padding:10px 12px;
            border:2px solid #e2e8f0;
            border-radius:9px;
            background:#f8fafc;
            cursor:pointer;
          }
          .challan-copy-all input {
            width:16px;
            height:16px;
          }
          .challan-copy-all-label {
            color:#0d1f3c;
            font-size:13px;
            font-weight:700;
          }
          .challan-copy-card {
            position:relative;
            display:flex;
            min-height:102px;
            padding:13px 11px 10px;
            flex-direction:column;
            border:2px solid #e2e8f0;
            border-radius:9px;
            background:#fff;
            cursor:pointer;
            transition:all .18s ease;
          }
          .challan-copy-card:hover {
            border-color:#94a3b8;
            transform:translateY(-1px);
          }
          .challan-copy-card:has(input:checked) {
            border-color:#0d1f3c;
            background:#f1f5f9;
            box-shadow:0 5px 16px rgba(13,31,60,.12);
          }
          .challan-copy-card input {
            position:absolute;
            opacity:0;
            pointer-events:none;
          }
          .challan-copy-check {
            position:absolute;
            top:8px;
            right:8px;
            display:none;
            width:18px;
            height:18px;
            align-items:center;
            justify-content:center;
            border-radius:50%;
            background:#0d1f3c;
            color:#fff;
            font-size:11px;
            font-weight:700;
          }
          .challan-copy-card:has(input:checked) .challan-copy-check { display:flex; }
          .challan-copy-name {
            color:#0d1f3c;
            font-size:16px;
            font-weight:700;
          }
          .challan-copy-purpose {
            margin-top:4px;
            color:#334155;
            font-size:12px;
            font-weight:600;
          }
          .challan-copy-help {
            margin-top:auto;
            padding-top:7px;
            color:#64748b;
            font-size:10px;
            line-height:1.35;
          }
          @media (max-width:600px) {
            .challan-copy-options { grid-template-columns:1fr; }
            .challan-copy-card { min-height:90px; }
          }
        </style>
      `,
      showCancelButton: true,
      confirmButtonText: "Print Selected Copy",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d1f3c",
      focusConfirm: false,
      didOpen: () => {
        const selectAll = Swal.getPopup()?.querySelector('#select-all-challan-copies');
        const copyInputs = Array.from(Swal.getPopup()?.querySelectorAll('input[name="challan-copy"]') || []);
        const syncSelectAll = () => {
          if (!selectAll) return;
          selectAll.checked = copyInputs.length > 0 && copyInputs.every((input) => input.checked);
        };
        selectAll?.addEventListener('change', () => {
          copyInputs.forEach((input) => {
            input.checked = selectAll.checked;
          });
        });
        copyInputs.forEach((input) => input.addEventListener('change', syncSelectAll));
        syncSelectAll();
      },
      preConfirm: () => {
        const selected = Array.from(document.querySelectorAll('input[name="challan-copy"]:checked'))
          .map((input) => input.value)
          .filter(Boolean);
        if (!selected.length) {
          Swal.showValidationMessage("Please select at least one delivery challan copy");
          return false;
        }
        return selected;
      },
    });

    if (!result.isConfirmed) return;

    flushSync(() => {
      setChallanCopies(result.value);
    });
    requestAnimationFrame(() => {
      window.setTimeout(() => printChallan(), 800);
    });
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center gap-2 text-slate-600"><RefreshCw className="animate-spin" /> Loading challans...</div>;

  if (mode === "view") return (
    <div className="challan-view-page bg-white shadow-md mt-1 p-6 min-h-screen font-inter animate-fadeIn">
      <div className="no-print flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-300 gap-4">
        <div className="flex flex-col items-center lg:items-start gap-1">
          <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
            Delivery Challan | Sales Management Section
          </h1>
        </div>
        <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
          <button
            onClick={() => setMode("list")}
            className="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1 text-[12px] font-bold uppercase text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={handlePrint}
            className="w-fit h-fit border border-[#3598dc] text-[#3598dc] text-[12px] hover:text-white hover:bg-[#3598dc] px-2 py-1 cursor-pointer"
            title="Print / Save PDF"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>
      <div ref={challanPrintRef} className="pt-3">
        {challanCopies.map((copyLabel, index) => (
          <div
            key={`${copyLabel}-${index}`}
            className="print-copy-page"
            style={{
              breakAfter: index < challanCopies.length - 1 ? "page" : "auto",
              pageBreakAfter: index < challanCopies.length - 1 ? "always" : "auto",
            }}
          >
            <DeliveryChallanPrint
              challan={form}
              settings={settings}
              bankDetails={banks.find((bank) => String(bank.status || "").toLowerCase() === "active") || banks[0]}
              estimateTerms={estimateTerms}
              copyLabel={copyLabel}
            />
            <div className="print-copy-page-label" style={{ display: "none" }}>1/1</div>
          </div>
        ))}
      </div>
      <style>{`
        body:has(.challan-view-page) footer { display:none!important }

        .challan-page-header {
          margin-bottom: 2px !important;
        }

        .challan-page-header img {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .challan-title-bar {
          margin-bottom: 4px !important;
          padding-top: 2px !important;
          padding-bottom: 2px !important;
        }

        .challan-summary-table,
        .challan-items-table,
        .challan-tax-table,
        .challan-remarks-table,
        .challan-bank-table {
          margin-top: 0 !important;
          margin-bottom: 8px !important;
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

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: visible !important;
          }

          .challan-print,
          .challan-print * {
            visibility: visible !important;
            opacity: 1 !important;
          }

          .challan-print {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: inset 0 0 0 1px #cbd5e1 !important;
            box-sizing: border-box !important;
            background: white !important;
            overflow: visible !important;
            font-family: Calibri, Arial, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
          }

          .challan-print > div,
          .challan-page-body {
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .challan-page-header {
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            box-sizing: border-box !important;
            background: white !important;
            z-index: auto !important;
            margin: 0 0 4px 0 !important;
            padding: 0 !important;
          }

          .challan-page-header img {
            width: 100% !important;
            max-width: 100% !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .invoice-title-bar,
          .challan-title-bar {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            line-height: normal !important;
            min-height: 22px !important;
          }

          .challan-copy-label {
            right: 0 !important;
            letter-spacing: -0.35px !important;
            white-space: nowrap !important;
            max-width: 44% !important;
            overflow: visible !important;
          }

          .challan-summary-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 0 !important;
            margin-bottom: 8px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            outline: 1px solid #ccc !important;
            outline-offset: -1px !important;
          }

          .challan-summary-table th {
            padding: 3px 2px !important;
            font-size: 10px !important;
            line-height: 1.1 !important;
          }

          .challan-summary-table td {
            padding: 4px 8px !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
            vertical-align: top !important;
          }

          .challan-summary-table table {
            margin-top: 4px !important;
            line-height: 1.3 !important;
          }

          .challan-summary-table table td {
            padding: 1px 4px 1px 0 !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }

          .challan-details-cell {
            padding: 4px 4px !important;
          }

          .challan-detail-info-table {
            width: 100% !important;
            max-width: 100% !important;
          }

          .challan-detail-info-table td {
            padding: 1px 2px 1px 0 !important;
            font-size: 10px !important;
            line-height: 1.25 !important;
          }

          .challan-detail-info-table td:nth-child(2) {
            padding: 1px 6px 1px 3px !important;
          }

          .challan-detail-info-table td:last-child {
            padding: 1px 0 1px 1px !important;
            text-align: left !important;
          }

          .challan-client-column { width: 32% !important; }
          .challan-shipment-column { width: 32% !important; }
          .challan-details-column { width: 36% !important; }

          .challan-items-table,
          .challan-tax-table,
          .challan-remarks-table,
          .challan-bank-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 0 !important;
            margin-bottom: 8px !important;
          }

          .challan-items-table {
            table-layout: fixed !important;
          }

          .challan-items-table th,
          .challan-items-table td {
            font-size: 9px !important;
            padding: 3px 2px !important;
            vertical-align: middle !important;
            line-height: 1.15 !important;
          }

          .challan-items-table th:nth-child(3),
          .challan-items-table td:nth-child(3),
          .challan-items-table th:nth-child(4),
          .challan-items-table td:nth-child(4),
          .challan-items-table th:nth-child(5),
          .challan-items-table td:nth-child(5),
          .challan-items-table th:nth-child(6),
          .challan-items-table td:nth-child(6),
          .challan-items-table th:nth-child(7),
          .challan-items-table td:nth-child(7) {
            white-space: nowrap !important;
            word-break: keep-all !important;
          }

          .challan-tax-table th,
          .challan-tax-table td {
            white-space: nowrap !important;
            font-size: 9px !important;
            padding: 3px 2px !important;
            line-height: 1.15 !important;
          }

          .challan-remarks-table td,
          .challan-bank-table td {
            padding: 6px 8px !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
            vertical-align: top !important;
          }

          .challan-bank-table th {
            padding: 3px 2px !important;
            font-size: 10px !important;
            line-height: 1.1 !important;
          }

          .challan-blank-row {
            display: table-row !important;
            height: 24px !important;
          }

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

          .no-print,
          .challan-view-page > .no-print,
          footer {
            display: none !important;
          }

          .challan-summary-table,
          .challan-remarks-table,
          .challan-bank-table,
          .challan-bank-table tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );

  if (mode === "form") return (
    <div className="min-h-screen bg-[#f8f9fc] p-4">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <button onClick={() => setMode("list")} className="mb-2 flex items-center gap-1 text-sm font-bold text-[#194090]"><ArrowLeft size={15} /> Back to Challans</button>
            <h1 className="text-xl font-black text-[#1a2b4b]">{editingId ? "Edit" : "Create"} Delivery Challan</h1>
            <p className="text-xs text-slate-500">One proforma can have multiple challans. Only remaining quantities can be delivered.</p>
          </div>
        </div>
        <form onSubmit={save} className="space-y-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-3"><label className={labelClass}><FileText size={14} className="text-blue-500" /> Source Proforma Invoice *</label><select disabled={Boolean(editingId)} className={inputClass} value={form.source_estimate_id} onChange={(event) => selectProforma(event.target.value)}><option value="">Select Proforma Invoice</option>{proformas.map((estimate) => { const availableItems = estimate.items.filter((item) => item.remainingQty > 0); const availableQty = availableItems.reduce((sum, item) => sum + item.remainingQty, 0); return <option key={estimate._id} value={estimate._id}>{estimate.est_no} — {availableItems.length} item(s), {availableQty} qty available</option>; })}</select></div>
              <div className="md:col-span-3"><label className={labelClass}><Calendar size={14} className="text-blue-500" /> Challan Date *</label><input required type="date" className={inputClass} value={form.challan_date} onChange={(event) => setForm({ ...form, challan_date: event.target.value })} /></div>
              <div className="md:col-span-3"><label className={labelClass}><Tag size={14} className="text-blue-500" /> Challan Type</label><select className={inputClass} value={form.challan_type || "Outward"} onChange={(event) => setForm({ ...form, challan_type: event.target.value })}>{["Outward", "Inward", "Return", "Gate Pass"].map((value) => <option key={value}>{value}</option>)}</select></div>
              <div className="md:col-span-3"><label className={labelClass}><Tag size={14} className="text-blue-500" /> Purpose</label><select className={inputClass} value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })}>{["Event/Stall Material", "Job Work", "Returnable Material", "Non-returnable Material", "Other"].map((value) => <option key={value}>{value}</option>)}</select></div>
              <div className="md:col-span-3"><label className={labelClass}><Truck size={14} className="text-blue-500" /> Vehicle No.</label><input className={inputClass} value={form.vehicle_no} onChange={(event) => setForm({ ...form, vehicle_no: event.target.value })} placeholder="Enter vehicle number" /></div>
              <div className="md:col-span-3"><label className={labelClass}><User size={14} className="text-blue-500" /> Transporter</label><input className={inputClass} value={form.transporter_name} onChange={(event) => setForm({ ...form, transporter_name: event.target.value })} placeholder="Transporter name" /></div>
              <div className="md:col-span-3"><label className={labelClass}><FileText size={14} className="text-blue-500" /> E-way Bill No.</label><input className={inputClass} value={form.eway_bill || ""} onChange={(event) => setForm({ ...form, eway_bill: event.target.value })} placeholder="Enter E-way Bill No." /></div>
              <div className="md:col-span-3"><label className={labelClass}><Calendar size={14} className="text-blue-500" /> Event Name</label><input className={inputClass} value={form.event_name} onChange={(event) => setForm({ ...form, event_name: event.target.value })} placeholder="Enter event name" /></div>
              <div className="md:col-span-3"><label className={labelClass}><FileBadge size={14} className="text-blue-500" /> PO / Reference No.</label><input className={inputClass} value={form.po_no} onChange={(event) => setForm({ ...form, po_no: event.target.value })} placeholder="Enter reference number" /></div>
              <div className="md:col-span-3"><label className={labelClass}><Tag size={14} className="text-blue-500" /> Type of Sale</label><select className={inputClass} value={form.type_of_sale || ""} onChange={(event) => setForm({ ...form, type_of_sale: event.target.value })}><option value="">Select Type</option>{["Local", "Inter-State", "Export", "Import", "Other"].map((v) => <option key={v}>{v}</option>)}</select></div>
              <div className="md:col-span-3"><label className={labelClass}><MapPin size={14} className="text-blue-500" /> Shipped To</label><input className={inputClass} value={form.shipped_to || ""} onChange={(event) => setForm({ ...form, shipped_to: event.target.value })} placeholder="Enter shipped to" /></div>
              <div className="md:col-span-3"><label className={labelClass}><MapPin size={14} className="text-blue-500" /> State Code</label><input className={inputClass} value={form.state_code || ""} onChange={(event) => setForm({ ...form, state_code: event.target.value })} placeholder="e.g. 07 (Delhi)" /></div>
              <div className="md:col-span-3"><label className={labelClass}><FileBadge size={14} className="text-blue-500" /> Bilty No.</label><input className={inputClass} value={form.bilty_no || ""} onChange={(event) => setForm({ ...form, bilty_no: event.target.value })} placeholder="Enter bilty number" /></div>
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-black uppercase text-[#1a2b4b]"><Users size={16} className="text-blue-600" /> Client &amp; Delivery Details</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <div><label className={labelClass}><Building size={14} className="text-blue-500" /> Company Name</label><input className={inputClass} value={form.company_name} onChange={(event) => setForm({ ...form, company_name: event.target.value })} placeholder="Enter company name" /></div>
              <div><label className={labelClass}><CreditCard size={14} className="text-blue-500" /> GSTIN</label><input className={inputClass} value={form.company_gst_no} onChange={(event) => setForm({ ...form, company_gst_no: event.target.value })} placeholder="Enter GSTIN" /></div>
              <div><label className={labelClass}><User size={14} className="text-blue-500" /> Contact Person</label><input className={inputClass} value={form.contact_person} onChange={(event) => setForm({ ...form, contact_person: event.target.value })} placeholder="Enter contact person" /></div>
              <div><label className={labelClass}><Phone size={14} className="text-blue-500" /> Contact Phone</label><input className={inputClass} value={form.contact_phone} onChange={(event) => setForm({ ...form, contact_phone: event.target.value })} placeholder="Enter phone number" /></div>
              <div><label className={labelClass}><Mail size={14} className="text-blue-500" /> Company Email</label><input className={inputClass} value={form.company_email || ""} onChange={(event) => setForm({ ...form, company_email: event.target.value })} placeholder="Enter email" /></div>
              <div><label className={labelClass}><Mail size={14} className="text-blue-500" /> Contact Email</label><input className={inputClass} value={form.contact_email || form.company_email || ""} onChange={(event) => setForm({ ...form, contact_email: event.target.value, company_email: form.company_email || event.target.value })} placeholder="Enter contact email" /></div>
              <div><label className={labelClass}><MapPin size={14} className="text-blue-500" /> Company Address</label><textarea rows={3} className={inputClass} value={form.company_address} onChange={(event) => setForm({ ...form, company_address: event.target.value })} placeholder="Enter company address" /></div>
              <div><label className={labelClass}><MapPin size={14} className="text-blue-500" /> Delivery Address</label><textarea rows={3} className={inputClass} value={form.delivery_address} onChange={(event) => setForm({ ...form, delivery_address: event.target.value })} placeholder="Enter delivery address" /></div>
            </div>
          </section>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="flex items-center gap-2 text-sm font-black uppercase text-[#1a2b4b]"><Package size={16} className="text-blue-600" /> Select Items for This Challan</h2><p className="mt-1 text-xs text-slate-500">Tick only the items going in this delivery and enter their delivery quantity.</p></div>
              {form.source_estimate_id && <div className="flex gap-2"><span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">{selectedItems.length} item(s) selected</span><span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">{selectedQuantity} total qty</span></div>}
            </div>
            {!selectedProforma && !editingId ? <p className="p-8 text-center text-sm text-slate-400">Select a proforma invoice to load items.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-xs">
                  <thead className="bg-slate-50 uppercase tracking-wide text-slate-500"><tr>{["Select", "Description", "HSN/SAC", "Size / Area", "PI Qty", "Delivered", "Available", "This Challan", "Unit"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead>
                  <tbody>{form.items.map((item, index) => { const isSelected = item.selected !== false; return <tr key={`${item.sourceItemKey}-${index}`} className={`border-t border-slate-100 transition-colors ${isSelected ? "bg-white" : "bg-slate-50 opacity-60"}`}><td className="px-4 py-3"><input type="checkbox" checked={isSelected} onChange={() => toggleItem(index)} className="h-4 w-4 accent-[#194090]" /></td><td className="max-w-[360px] px-4 py-3"><p className="font-bold text-slate-800">{item.description}</p>{item.remarks && <p className="mt-1 text-[10px] text-slate-500">{item.remarks}</p>}</td><td className="px-4 py-3">{item.hsn || "-"}</td><td className="px-4 py-3">{[item.area ? `${String(item.area).replace(/\s*[xX*]\s*/g, " × ")} m` : "", item.size ? `${item.size} sqm` : ""].filter(Boolean).join(" / ") || "-"}</td><td className="px-4 py-3 font-semibold">{item.sourceQty ?? "-"}</td><td className="px-4 py-3">{item.deliveredQty ?? "-"}</td><td className="px-4 py-3 font-bold text-emerald-700">{item.remainingQty ?? "-"}</td><td className="px-4 py-3"><input disabled={!isSelected} required={isSelected} min="0.000001" max={item.remainingQty} step="any" type="number" className="w-28 rounded-md border border-slate-300 px-3 py-2 font-bold outline-none focus:border-[#194090] disabled:bg-slate-100" value={item.qty} onChange={(event) => updateItem(index, "qty", event.target.value)} /></td><td className="px-4 py-3">Nos</td></tr>; })}</tbody>
                </table>
              </div>
            )}
          </section>
          <div className="grid gap-3 md:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className={labelClass}><MessageSquare size={14} className="text-blue-500" /> Remarks</label>
              <textarea rows={3} className={inputClass} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} placeholder="Add any remarks or notes here..." />
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className={labelClass}><ShieldCheck size={14} className="text-blue-500" /> Terms</label>
              <textarea rows={3} className={inputClass} value={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.value })} placeholder="Goods/material received in good condition." />
            </section>
          </div>
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-[#f8f9fc]/95 py-4 backdrop-blur">
            <button type="button" onClick={() => { setForm(emptyForm); setMode("list"); }} className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-[#194090] hover:bg-slate-50"><RotateCcw size={15} /> Reset</button>
            <button disabled={saving || !selectedItems.length} className="flex items-center gap-2 rounded-md bg-[#3b82f6] px-7 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-50 hover:bg-blue-600">{saving ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />} {saving ? "Saving..." : editingId ? "Update Challan" : `Create Challan`}</button>
          </div>
        </form>
      </div>
    </div>
  );

  const totalChallans = challans.length;
  const totalItemsDelivered = challans.reduce((sum, ch) => sum + (ch.items || []).reduce((acc, it) => acc + Number(it.qty || 0), 0), 0);
  const totalAck = challans.filter(ch => ch.status === 'acknowledged').length;
  const totalPending = challans.filter(ch => ch.status === 'issued' || ch.status === 'draft').length;

  const statCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 mt-2">
      <AnimatedStatCard
        icon={<Truck className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
        gradientTo="to-blue-50" iconBg="bg-blue-100"
        rawValue={totalChallans}
        displayValue={(c) => Math.round(c)}
        label="TOTAL CHALLANS"
        subLabel="Created" subColor="#2563eb"
      />
      <AnimatedStatCard
        icon={<Package className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />}
        gradientTo="to-indigo-50" iconBg="bg-indigo-100"
        rawValue={totalItemsDelivered}
        displayValue={(c) => Math.round(c)}
        label="TOTAL ITEMS"
        subLabel="Dispatched" subColor="#4f46e5"
      />
      <AnimatedStatCard
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
        gradientTo="to-emerald-50" iconBg="bg-emerald-100"
        rawValue={totalAck}
        displayValue={(c) => Math.round(c)}
        label="ACKNOWLEDGED"
        subLabel="Completed" subColor="#059669"
      />
      <AnimatedStatCard
        icon={<Clock className="w-5 h-5 text-amber-600" strokeWidth={2.5} />}
        gradientTo="to-amber-50" iconBg="bg-amber-100"
        rawValue={totalPending}
        displayValue={(c) => Math.round(c)}
        label="PENDING"
        subLabel="In Transit" subColor="#d97706"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4">
      <div className="w-full">
        <AccountNavigation id={id} accountName={accountName} pageName="Delivery Challan" />

        <div className="mb-3 mt-1 flex items-center justify-between px-1">
          <div><h1 className="text-lg font-black text-[#1a2b4b]">Delivery Challans</h1></div>
          <button onClick={startCreate} className="flex items-center gap-1.5 rounded-md bg-[#194090] px-3 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-blue-800"><FilePlus2 size={16} /> Create Challan</button>
        </div>

        {statCards}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-xs whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
            <thead className="bg-slate-50 uppercase text-slate-500 border-b border-slate-200">
              <tr>{["Challan No.", "Date", "Type", "Proforma No.", "Purpose", "Items", "Quantity", "Status", "Actions"].map((heading) => <th key={heading} className="px-4 py-3 font-bold">{heading}</th>)}</tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!challans.length && <tr><td colSpan={9} className="p-10 text-center text-slate-400 font-bold">No delivery challans created yet.</td></tr>}
              {challans.map((challan) => (
                <tr key={challan._id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-[11px] font-bold text-[#194090] cursor-pointer hover:underline" onClick={() => view(challan)}>{challan.challan_no}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-600 font-medium">{formatDate(challan.challan_date)}</td>
                  <td className="px-4 py-3 text-[10px] font-bold text-slate-700">{challan.challan_type || "Outward"}</td>
                  <td className="px-4 py-3 text-[10px] font-bold text-slate-700">{challan.estimate_no}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-600">{challan.purpose}</td>
                  <td className="px-4 py-3 text-[10px] font-bold text-slate-700">{(challan.items || []).length}</td>
                  <td className="px-4 py-3 text-[10px] font-bold text-emerald-600">{(challan.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0)}</td>
                  <td className="px-4 py-3">
                    <select disabled={challan.status === "cancelled"} value={challan.status} onChange={(event) => updateStatus(challan, event.target.value)} className={`rounded-full border-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider outline-none ${statusClass(challan.status)}`}>
                      {["draft", "issued", "delivered", "acknowledged", ...(challan.status === "cancelled" ? ["cancelled"] : [])].map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-start">
                      <button disabled={challan.status === "cancelled"} title="Edit" onClick={() => edit(challan)} className="rounded border border-slate-200 p-1.5 text-amber-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"><Pencil size={13} /></button>
                      <button disabled={challan.status === "cancelled"} title="Send WhatsApp" onClick={() => setCommModal({ isOpen: true, type: "whatsapp", docId: challan._id })} className="rounded border border-slate-200 p-1.5 text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"><MessageCircleMore size={13} /></button>
                      <button disabled={challan.status === "cancelled"} title="Send Email" onClick={() => setCommModal({ isOpen: true, type: "email", docId: challan._id })} className="rounded border border-slate-200 p-1.5 text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"><Mail size={13} /></button>
                      <button disabled={challan.status === "cancelled"} title="Cancel Challan" onClick={() => updateStatus(challan, "cancelled")} className="rounded border border-slate-200 p-1.5 text-red-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"><Ban size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CommunicationModal isOpen={commModal.isOpen} onClose={() => setCommModal((previous) => ({ ...previous, isOpen: false }))} type={commModal.type} docType="challan" docId={commModal.docId} refreshData={loadData} />
      </div>
    </div>
  );
};

export default DeliveryChallanManager;
