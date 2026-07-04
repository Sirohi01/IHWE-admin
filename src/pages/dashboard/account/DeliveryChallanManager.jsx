import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, ArrowLeft, Ban, FilePlus2, Mail, MessageCircleMore, Pencil, Printer, RefreshCw, FileText, Calendar, Tag, Truck, User, FileBadge, Users, Building, CreditCard, Phone, MapPin, Package, MessageSquare, ShieldCheck, Send, RotateCcw, DollarSign, CheckCircle2, Clock } from "lucide-react";
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
  event_name: "",
  delivery_address: "",
  purpose: "Event/Stall Material",
  vehicle_no: "",
  transporter_name: "",
  eway_bill: "",
  challan_type: "Outward",
  type_of_sale: "",
  shipped_to: "",
  state_code: "",
  bilty_no: "",
  po_no: "",
  remarks: "",
  terms: "Goods/material received in good condition.",
  status: "issued",
  items: [],
};

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-1 text-[13px] text-[#1a2b4b] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10 transition-all h-[32px]";
const labelClass = "flex items-center gap-1.5 text-[12px] font-medium text-[#1a2b4b] mb-1";

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

const DEFAULT_CHALLAN_COPY = "ORIGINAL DELIVERY CHALLAN";

const DeliveryChallanPrint = ({ challan, settings, bankDetails, copyLabel = DEFAULT_CHALLAN_COPY }) => {
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

  const mediaUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    const normalized = String(value).replace(/\\/g, "/");
    const uploadsIndex = normalized.indexOf("uploads/");
    const relativePath = uploadsIndex >= 0 ? normalized.slice(uploadsIndex) : normalized.replace(/^\/+/, "");
    return `${SERVER_URL}/${relativePath}`;
  };

  const items = challan.items || [];
  const getGstRate = (item) => {
    const directRate = Number(item.gstRate ?? item.gst_per ?? item.gstPct);
    if (Number.isFinite(directRate) && directRate) return directRate;
    const igstRate = Number(item.igst_per);
    if (Number.isFinite(igstRate) && igstRate) return igstRate;
    const cgstRate = Number(item.cgst_per);
    return Number.isFinite(cgstRate) && cgstRate ? cgstRate * 2 : 0;
  };
  const lineValue = (item, key) => {
    const qty = Number(item.qty || 0);
    const sourceQty = Number(item.sourceQty || item.piQty || item.originalQty || 0);
    const ratio = sourceQty > 0 ? qty / sourceQty : 1;
    const amount = Number(item.amount || 0);
    const rateAmount = Number(item.rate || 0) * qty;
    const discount = Number(item.discountAmount ?? item.discount ?? 0) * ratio;
    const discountPercent = Number(item.disc ?? item.discountPct ?? 0);
    const computedDiscount = discount || ((amount || rateAmount) * ratio * discountPercent) / 100;
    const taxable = Number(item.taxable ?? item.tax ?? item.taxableValue ?? 0);
    const gstAmount = Number(item.gstAmount ?? 0);
    const finalAmount = Number(item.finalAmount ?? item.total ?? 0);
    if (key === "amount" && Number(item.amount)) return Number(item.amount) * ratio;
    if (key === "discount") return computedDiscount;
    if (key === "taxable" && taxable) return taxable * ratio;
    if (key === "gstAmount" && gstAmount) return gstAmount * ratio;
    if (key === "amount") return rateAmount;
    if (key === "taxable") return Math.max(0, rateAmount - computedDiscount);
    if (key === "gstAmount") return (lineValue(item, "taxable") * getGstRate(item)) / 100;
    if (key === "finalAmount") return lineValue(item, "taxable") + lineValue(item, "gstAmount");
    return 0;
  };
  const totalQty = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
  const totalTaxable = items.reduce((sum, it) => sum + lineValue(it, "taxable"), 0);
  const totalGst = items.reduce((sum, it) => sum + lineValue(it, "gstAmount"), 0);
  const grandTotal = totalTaxable + totalGst;
  const hsnRows = Object.values(items.reduce((acc, item) => {
    const hsn = item.hsn || "-";
    if (!acc[hsn]) acc[hsn] = { hsn, qty: 0, taxable: 0, gstRate: getGstRate(item), gst: 0 };
    acc[hsn].qty += Number(item.qty || 0);
    acc[hsn].taxable += lineValue(item, "taxable");
    acc[hsn].gst += lineValue(item, "gstAmount");
    return acc;
  }, {}));
  const companyName = settings?.companyName || "Namo Gange Wellness Pvt. Ltd.";
  const companyGst = settings?.companyGst || settings?.companyGstin || "09AAFCN9238F1Z6";
  const bank = bankDetails || {};
  const bankName = bank.bankname || bank.bankName || settings?.bankName || "-";
  const accountName = bank.accountname || bank.accountName || settings?.accountName || companyName;
  const accountNo = bank.accountno || bank.accountNo || settings?.accountNo || "-";
  const ifscCode = bank.ifsccode || bank.ifscCode || settings?.ifscCode || "-";
  const bankBranch = bank.bankbranch || bank.branch || settings?.bankBranch || "-";

  const th = { border: "1px solid #0d1f3c", background: "#0d1f3c", color: "#fff", padding: "3px 2px", fontSize: 10, lineHeight: 1.1, fontWeight: 700, textAlign: "center", textTransform: "uppercase" };
  const td = { border: "1px solid #ccc", padding: "6px", fontSize: 11, lineHeight: 1.2, verticalAlign: "top" };
  const topTh = { ...th };
  const topTd = { ...td, padding: "4px 7px" };
  const topInfoLine = { margin: 0, padding: 0, fontSize: 11, lineHeight: 1.2 };
  const labelCell = { border: "none", padding: "1px 3px 1px 0", fontSize: 11, fontWeight: 700, width: "1%", whiteSpace: "nowrap", lineHeight: 1.3 };
  const colonCell = { border: "none", padding: "1px 3px 1px 0", fontSize: 11, fontWeight: 700, width: "1%", lineHeight: 1.3 };
  const valueCell = { border: "none", padding: "1px 0", fontSize: 11, lineHeight: 1.3 };
  const detailLabelCell = { ...labelCell, fontSize: 10.5 };
  const detailColonCell = { ...colonCell, fontSize: 10.5 };
  const detailValueCell = { ...valueCell, fontSize: 10.5 };
  const mutedCell = { ...td, background: "#f8fafc", fontWeight: 700, textTransform: "uppercase" };

  return (
    <div className="challan-print bg-white border border-slate-300 p-10 text-[11px] font-sans text-black" style={{ fontFamily: "Calibri, Arial, sans-serif", maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
      <div style={{ position: "relative" }}>
        {challan.status === "cancelled" && <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-[5px] border-red-600/70 px-7 py-2 text-4xl font-black uppercase tracking-widest text-red-600/70">Cancelled</div>}

        <div className="challan-page-header" style={{ marginBottom: 8, textAlign: "center" }}>
          <img src={invoiceHeader} alt="Namo Gange Design House" style={{ width: "100%", maxWidth: "100%", display: "block" }} />
        </div>
        <div className="challan-page-body">

        <div className="invoice-title-bar" style={{ position: "relative", textAlign: "center", marginBottom: 4, paddingTop: 2, paddingBottom: 1 }}>
          <div style={{ fontWeight: 400, fontSize: 18, color: "#0d1f3c", marginBottom: 0 }}>DELIVERY CHALLAN</div>
          <div style={{ position: "absolute", right: 0, top: 5, fontWeight: 700, fontSize: 10, color: "#0d1f3c", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>{copyLabel}</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ ...topTh, width: "35%" }}>Buyer's Name &amp; Address</th>
              <th style={{ ...topTh, width: "34%" }}>Shipment Details</th>
              <th style={{ ...topTh, width: "31%" }}>Delivery Challan Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...topTd }}>
                <div style={{ ...topInfoLine, fontWeight: 800, textTransform: "uppercase", marginBottom: 1 }}>{challan.company_name || "-"}</div>
                <div style={{ ...topInfoLine, whiteSpace: "pre-wrap" }}>{challan.company_address || "-"}</div>
                <table style={{ borderCollapse: "collapse", border: "none", lineHeight: 1.3, width: "100%", marginTop: 4 }}>
                  <tbody>
                    {[
                      ["GSTIN/PAN", challan.company_gst_no || "-"],
                      ["Contact Person", challan.contact_person || "-"],
                      ["Contact No.", challan.contact_phone || "-"],
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
              <td style={{ ...topTd }}>
                <div style={{ ...topInfoLine, fontWeight: 800, textTransform: "uppercase", marginBottom: 1 }}>{challan.event_name || "9TH EDITION OF INTERNATIONAL HEALTH & WELLNESS EXPO"}</div>
                <div style={{ ...topInfoLine, fontSize: 10.5, whiteSpace: "nowrap" }}>{challan.delivery_address || challan.company_address || "-"}</div>
                <table style={{ borderCollapse: "collapse", border: "none", lineHeight: 1.3, width: "100%", marginTop: 4 }}>
                  <tbody>
                    {[
                      ["Place of Supply", challan.shipped_to || "-"],
                      ["State Code", challan.state_code || "-"],
                      ["GSTIN", companyGst],
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
              <td style={{ ...topTd }}>
                <table style={{ borderCollapse: "collapse", border: "none", lineHeight: 1.3, width: "100%" }}>
                  <tbody>
                    {[
                      ["Delivery Challan No.", challan.challan_no || "-"],
                      ["Delivery Challan Date", fmtDateOnly(challan.challan_date)],
                      ["Delivery Challan Type", challan.challan_type || "Outward"],
                      ["Type of Sale", challan.type_of_sale || "-"],
                      ["PO No.", challan.po_no || "-"],
                      ["Bilty No.", challan.bilty_no || "-"],
                      ["Vehicle No.", challan.vehicle_no || "-"],
                      ["Transporter", challan.transporter_name || "-"],
                      ["E-Way Bill No.", challan.eway_bill || "-"],
                      ["Proforma No.", challan.estimate_no || "-"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={detailLabelCell}>{label}</td>
                        <td style={detailColonCell}>:</td>
                        <td style={{ ...detailValueCell, textAlign: "right", whiteSpace: "nowrap" }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
          <thead>
            <tr>
              {[
                ["S.No.", "4%"],
                ["Item Description", "38%"],
                ["HSN Code", "8%"],
                ["Qty.", "5%"],
                ["Area", "6%"],
                ["Size", "6%"],
                ["Unit", "5%"],
                ["Rate", "7%"],
                ["Discount", "7%"],
                ["Amount", "8%"],
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
                <td style={{ ...td, textAlign: "center" }}>{item.area || "-"}</td>
                <td style={{ ...td, textAlign: "center" }}>{item.size || "-"}</td>
                <td style={{ ...td, textAlign: "center" }}>{item.unit || "-"}</td>
                <td style={{ ...td, textAlign: "right" }}>{fmtNum(item.rate || 0)}</td>
                <td style={{ ...td, textAlign: "right" }}>{fmtNum(lineValue(item, "discount"))}</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{fmtNum(lineValue(item, "taxable"))}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 7 - items.length) }).map((_, row) => (
              <tr key={`blank-${row}`} style={{ height: 24 }}>
                {Array.from({ length: 10 }).map((__, cell) => <td key={cell} style={td}></td>)}
              </tr>
            ))}
            <tr>
              <td colSpan={9} style={{ ...mutedCell, textAlign: "right" }}>Taxable Value</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>{fmtNum(totalTaxable)}</td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
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
                  <td style={{ ...td, textAlign: "right" }}>{fmtNum(row.taxable)}</td>
                  <td style={{ ...td, textAlign: "center" }}>{fmtNum(row.qty)}</td>
                  <td style={{ ...td, textAlign: "center" }}>{isIgst ? "-" : `${fmtNum(halfRate)}%`}</td>
                  <td style={{ ...td, textAlign: "right" }}>{isIgst ? "-" : fmtNum(halfGst)}</td>
                  <td style={{ ...td, textAlign: "center" }}>{isIgst ? "-" : `${fmtNum(halfRate)}%`}</td>
                  <td style={{ ...td, textAlign: "right" }}>{isIgst ? "-" : fmtNum(halfGst)}</td>
                  <td style={{ ...td, textAlign: "center" }}>{isIgst ? `${fmtNum(row.gstRate)}%` : "-"}</td>
                  <td style={{ ...td, textAlign: "right" }}>{isIgst ? fmtNum(row.gst) : "-"}</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{fmtNum(row.gst)}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={3} style={mutedCell}>GST Amount in Words</td>
              <td colSpan={6} style={td}>-</td>
              <td style={mutedCell}>Total GST Amount</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>{fmtNum(totalGst)}</td>
            </tr>
            <tr style={{ height: 8 }}>
              {Array(11).fill(0).map((_, cell) => <td key={cell} style={{ border: "none", padding: 0 }}></td>)}
            </tr>
            <tr>
              <td colSpan={10} style={{ ...mutedCell, textAlign: "right" }}>Total Value</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>{fmtNum(grandTotal)}</td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
          <tbody>
            <tr>
              <td style={{ ...td, fontWeight: 800, width: "16%", background: "#fafafa" }}>Special Remark:</td>
              <td style={{ ...td, height: 24 }}>{challan.remarks || "-"}</td>
            </tr>
            <tr>
              <td style={{ ...td, fontWeight: 800, background: "#fafafa" }}>Terms and Conditions:</td>
              <td style={{ ...td }}>{challan.terms || "Goods/material received in good condition. All disputes are subject to Delhi jurisdiction."}</td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "33%" }}>NGWPL Bank Details</th>
              <th style={{ ...th, width: "33%" }}>Client Signature</th>
              <th style={{ ...th, width: "34%" }}>For {companyName}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>
                <table style={{ borderCollapse: "collapse", border: "none", lineHeight: 1.3, width: "auto" }}>
                  <tbody>
                    {[
                      ["Bank Name", bankName],
                      ["Account Name", accountName],
                      ["Account No.", accountNo],
                      ["IFSC Code", ifscCode],
                      ["Branch", bankBranch],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={labelCell}>{label}</td>
                        <td style={colonCell}>:</td>
                        <td style={{ ...valueCell, whiteSpace: "nowrap" }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td style={{ ...td, textAlign: "center", verticalAlign: "bottom" }}>
                <div style={{ height: 80 }}></div>
                <div style={{ borderTop: "1px solid #ccc", paddingTop: 4, fontWeight: 700, width: "60%", margin: "0 auto" }}>Client Signature</div>
              </td>
              <td style={{ ...td, textAlign: "center", verticalAlign: "bottom" }}>
                {(settings?.companyStamp || settings?.authorizedSignature) ? (
                  <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, overflow: "hidden" }}>
                    {settings?.authorizedSignature && <img src={mediaUrl(settings.authorizedSignature)} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ maxHeight: 60, maxWidth: 130, objectFit: "contain" }} />}
                    {settings?.companyStamp && <img src={mediaUrl(settings.companyStamp)} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ maxHeight: 60, maxWidth: 60, objectFit: "contain" }} />}
                  </div>
                ) : (
                  <div style={{ height: 60 }}></div>
                )}
                <div style={{ borderTop: "1px solid #ccc", paddingTop: 4, fontWeight: 700, width: "60%", margin: "0 auto" }}>Authorised Signatory</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: 12, textAlign: "center", color: "#666", marginTop: 8, paddingTop: 6 }}>
          <b>Registered Address:</b> First Floor, E-1, Opposite KFC, Kalkaji Main Market, South Delhi-110019, Delhi, India
        </div>
        <div style={{ fontSize: 11, textAlign: "center", color: "#999", marginTop: 4 }}>
          This is a computer generated document and does not require a physical signature.
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
  const [challanCopy, setChallanCopy] = useState(DEFAULT_CHALLAN_COPY);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [challanRes, proformaRes, settingsRes, accountRes, bankRes] = await Promise.all([
        api.get(`/api/delivery-challans?companyId=${id}`),
        api.get(`/api/delivery-challans/proformas/${id}`),
        api.get("/api/settings"),
        api.get(`/api/account-overview/${id}`).catch(() => ({ data: {} })),
        api.get("/api/banks").catch(() => ({ data: [] })),
      ]);
      setChallans(Array.isArray(challanRes.data) ? challanRes.data : []);
      setProformas(Array.isArray(proformaRes.data) ? proformaRes.data : []);
      setSettings(settingsRes.data?.data || settingsRes.data || null);
      setBanks(Array.isArray(bankRes.data) ? bankRes.data : []);
      if (accountRes.data?.success) setAccountName(accountRes.data.data?.companyInfo?.name || "");
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
    onAfterPrint: () => setChallanCopy(DEFAULT_CHALLAN_COPY),
  });

  const startCreate = () => {
    setEditingId("");
    setForm({ ...emptyForm, items: [] });
    setMode("form");
  };

  const selectProforma = (estimateId) => {
    const estimate = proformas.find((item) => item._id === estimateId);
    setForm((previous) => ({
      ...previous,
      source_estimate_id: estimateId,
      company_name: estimate?.company_name || previous.company_name,
      company_address: estimate?.company_addr || previous.company_address,
      company_gst_no: estimate?.company_gst_no || previous.company_gst_no,
      contact_person: estimate?.contact_person || previous.contact_person,
      contact_phone: estimate?.contact_phone || previous.contact_phone,
      event_name: estimate?.event_name || previous.event_name,
      delivery_address: estimate?.delivery_address || previous.delivery_address,
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
        amount: item.amount || 0,
        taxable: item.taxable || 0,
        gstRate: item.gstRate || 0,
        gstAmount: item.gstAmount || 0,
        finalAmount: item.finalAmount || 0,
        qty: item.remainingQty,
        remainingQty: item.remainingQty,
        sourceQty: item.sourceQty,
        deliveredQty: item.deliveredQty,
        selected: true,
      })),
    }));
  };

  useEffect(() => {
    if (directCreateHandled.current) return;

    const viewChallanId = location.state?.viewChallanId;
    if (viewChallanId && challans.length > 0) {
      const matchingChallan = challans.find((c) => String(c._id) === String(viewChallanId));
      if (matchingChallan) {
        directCreateHandled.current = true;
        setForm(matchingChallan);
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
        setForm(response.data?.data || payload);
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
    setForm({
      ...emptyForm,
      ...challan,
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
    setForm(challan);
    setChallanCopy(DEFAULT_CHALLAN_COPY);
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
          <label class="challan-copy-card">
            <input type="radio" name="challan-copy" value="ORIGINAL DELIVERY CHALLAN" checked />
            <span class="challan-copy-check">✓</span>
            <span class="challan-copy-name">Original</span>
            <span class="challan-copy-purpose">For Recipient</span>
            <span class="challan-copy-help">Customer's official copy</span>
          </label>
          <label class="challan-copy-card">
            <input type="radio" name="challan-copy" value="DUPLICATE DELIVERY CHALLAN" />
            <span class="challan-copy-check">✓</span>
            <span class="challan-copy-name">Duplicate</span>
            <span class="challan-copy-purpose">For Supplier</span>
            <span class="challan-copy-help">Office and accounts record</span>
          </label>
          <label class="challan-copy-card">
            <input type="radio" name="challan-copy" value="TRIPLICATE DELIVERY CHALLAN" />
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
      preConfirm: () => {
        const selected = document.querySelector('input[name="challan-copy"]:checked');
        if (!selected) {
          Swal.showValidationMessage("Please select a delivery challan copy");
          return false;
        }
        return selected.value;
      },
    });

    if (!result.isConfirmed) return;

    setChallanCopy(result.value);
    requestAnimationFrame(() => requestAnimationFrame(() => printChallan()));
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
        <DeliveryChallanPrint
          challan={form}
          settings={settings}
          bankDetails={banks.find((bank) => String(bank.status || "").toLowerCase() === "active") || banks[0]}
          copyLabel={challanCopy}
        />
      </div>
      <style>{`
        body:has(.challan-view-page) footer { display:none!important }
        @media print {
          @page { margin: 0; }
          body * { visibility: hidden; }
          .challan-print, .challan-print * { visibility: visible; }
          .challan-print {
            position: absolute;
            left: 0; right: 0; top: 0;
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 0;
          }
          .challan-page-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            background: white;
            z-index: 9999;
            margin-bottom: 0 !important;
          }
          .challan-page-header img { width: 100%; display: block; }
          .challan-page-body {
            margin-top: 100px;
            padding: 12px 40px 40px 40px;
          }
          .no-print, footer { display: none !important; }
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
                  <tbody>{form.items.map((item, index) => { const isSelected = item.selected !== false; return <tr key={`${item.sourceItemKey}-${index}`} className={`border-t border-slate-100 transition-colors ${isSelected ? "bg-white" : "bg-slate-50 opacity-60"}`}><td className="px-4 py-3"><input type="checkbox" checked={isSelected} onChange={() => toggleItem(index)} className="h-4 w-4 accent-[#194090]" /></td><td className="max-w-[360px] px-4 py-3"><p className="font-bold text-slate-800">{item.description}</p>{item.remarks && <p className="mt-1 text-[10px] text-slate-500">{item.remarks}</p>}</td><td className="px-4 py-3">{item.hsn || "-"}</td><td className="px-4 py-3">{[item.size, item.area].filter(Boolean).join(" / ") || "-"}</td><td className="px-4 py-3 font-semibold">{item.sourceQty ?? "-"}</td><td className="px-4 py-3">{item.deliveredQty ?? "-"}</td><td className="px-4 py-3 font-bold text-emerald-700">{item.remainingQty ?? "-"}</td><td className="px-4 py-3"><input disabled={!isSelected} required={isSelected} min="0.000001" max={item.remainingQty} step="any" type="number" className="w-28 rounded-md border border-slate-300 px-3 py-2 font-bold outline-none focus:border-[#194090] disabled:bg-slate-100" value={item.qty} onChange={(event) => updateItem(index, "qty", event.target.value)} /></td><td className="px-4 py-3">{item.unit || "-"}</td></tr>; })}</tbody>
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
