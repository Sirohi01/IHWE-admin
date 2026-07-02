import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Ban, Eye, FilePlus2, Mail, MessageCircleMore, Pencil, Printer, RefreshCw, FileText, Calendar, Tag, Truck, User, FileBadge, Users, Building, CreditCard, Phone, MapPin, Package, MessageSquare, ShieldCheck, Send, RotateCcw, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../../../lib/api";
import { getCurrentUserName } from "../../../utils/currentUser";
import CommunicationModal from "../../../components/CommunicationModal";
import invoiceHeader from "../../../assets/header.png";

// Hook: animate number from 0 to target when element enters viewport
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
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
};

const statusClass = (status) => ({
  draft: "bg-slate-100 text-slate-600",
  issued: "bg-blue-50 text-blue-700",
  delivered: "bg-amber-50 text-amber-700",
  acknowledged: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
}[status] || "bg-slate-100 text-slate-600");

const DeliveryChallanPrint = ({ challan, settings }) => {
  const mediaUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    const normalized = String(value).replace(/\\/g, "/");
    const uploadsIndex = normalized.indexOf("uploads/");
    const relativePath = uploadsIndex >= 0 ? normalized.slice(uploadsIndex) : normalized.replace(/^\/+/, "");
    return `${SERVER_URL}/${relativePath}`;
  };
  return (
    <div className="challan-print mx-auto max-w-[900px] bg-white p-8 text-[12px] text-slate-900">
      <div className="relative border-2 border-slate-900">
        {challan.status === "cancelled" && <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-[6px] border-red-600/70 px-8 py-3 text-5xl font-black uppercase tracking-widest text-red-600/70">Cancelled</div>}
        <div className="border-b-2 border-slate-900 p-5 text-center">
          <img src={invoiceHeader} alt="Namo Gange Wellness" className="mb-2 w-full object-contain" />
          <h2 className="mt-3 text-xl font-bold uppercase">Delivery Challan</h2>
          <p className="font-bold text-red-600">NOT FOR PAYMENT</p>
        </div>
        <div className="grid grid-cols-2 border-b border-slate-900">
          <div className="border-r border-slate-900 p-4">
            <p className="text-[10px] font-bold uppercase text-slate-500">Delivered To</p>
            <p className="mt-1 font-bold uppercase">{challan.company_name || "-"}</p>
            <p className="whitespace-pre-wrap">{challan.company_address || "-"}</p>
            <p className="mt-2"><b>GSTIN:</b> {challan.company_gst_no || "-"}</p>
            <p><b>Contact:</b> {challan.contact_person || "-"} {challan.contact_phone ? `(${challan.contact_phone})` : ""}</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-[130px_1fr] gap-y-1">
              <b>Challan No.</b><span>{challan.challan_no || "Auto-generated on save"}</span>
              <b>Challan Date</b><span>{formatDate(challan.challan_date)}</span>
              <b>Proforma No.</b><span>{challan.estimate_no || "-"}</span>
              <b>Purpose</b><span>{challan.purpose}</span>
              <b>Vehicle No.</b><span>{challan.vehicle_no || "-"}</span>
              <b>Transporter</b><span>{challan.transporter_name || "-"}</span>
            </div>
          </div>
        </div>
        <div className="border-b border-slate-900 p-4">
          <p><b>Event:</b> {challan.event_name || "-"}</p>
          <p><b>Delivery Address:</b> {challan.delivery_address || "-"}</p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#0d1f3c] text-white">
              {["S.No.", "Description", "HSN/SAC", "Size", "Area", "Qty.", "Unit", "Remarks"].map((heading) => (
                <th key={heading} className="border border-slate-900 px-2 py-2 text-center">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(challan.items || []).map((item, index) => (
              <tr key={`${item.sourceItemKey}-${index}`}>
                <td className="border border-slate-900 p-2 text-center">{index + 1}</td>
                <td className="border border-slate-900 p-2 font-semibold">{item.description}</td>
                <td className="border border-slate-900 p-2 text-center">{item.hsn || "-"}</td>
                <td className="border border-slate-900 p-2 text-center">{item.size || "-"}</td>
                <td className="border border-slate-900 p-2 text-center">{item.area || "-"}</td>
                <td className="border border-slate-900 p-2 text-center font-bold">{item.qty}</td>
                <td className="border border-slate-900 p-2 text-center">{item.unit || "-"}</td>
                <td className="border border-slate-900 p-2">{item.remarks || "-"}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 5 - (challan.items?.length || 0)) }).map((_, index) => (
              <tr key={`blank-${index}`} className="h-10">
                {Array.from({ length: 8 }).map((__, cell) => <td key={cell} className="border border-slate-900" />)}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="grid min-h-32 grid-cols-2 border-t border-slate-900">
          <div className="border-r border-slate-900 p-4">
            <p><b>Remarks:</b> {challan.remarks || "-"}</p>
            <p className="mt-2"><b>Terms:</b> {challan.terms || "-"}</p>
          </div>
          <div className="flex min-h-36 flex-col p-4 text-right">
            <p>For <b>Namo Gange Wellness Pvt. Ltd.</b></p>
            {(settings?.companyStamp || settings?.authorizedSignature) && <div className="mt-2 flex h-20 items-center justify-end gap-4 overflow-hidden">
              {settings?.companyStamp && <img src={mediaUrl(settings.companyStamp)} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} className="h-20 w-24 shrink-0 object-contain" />}
              {settings?.authorizedSignature && <img src={mediaUrl(settings.authorizedSignature)} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} className="h-16 w-28 shrink-0 object-contain" />}
            </div>}
            <p className="mt-auto font-bold">Authorized Signatory</p>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-slate-900">
          <div className="p-4">Receiver Name &amp; Signature: ____________________</div>
          <div className="p-4 text-right">Received Date: ____________________</div>
        </div>
      </div>
    </div>
  );
};

const DeliveryChallanManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const directCreateHandled = useRef(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [challans, setChallans] = useState([]);
  const [proformas, setProformas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [mode, setMode] = useState("list");
  const [settings, setSettings] = useState(null);
  const [commModal, setCommModal] = useState({ isOpen: false, type: "whatsapp", docId: "" });

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
      const [challanRes, proformaRes, settingsRes] = await Promise.all([
        api.get(`/api/delivery-challans?companyId=${id}`),
        api.get(`/api/delivery-challans/proformas/${id}`),
        api.get("/api/settings"),
      ]);
      setChallans(Array.isArray(challanRes.data) ? challanRes.data : []);
      setProformas(Array.isArray(proformaRes.data) ? proformaRes.data : []);
      setSettings(settingsRes.data?.data || settingsRes.data || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load delivery challans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

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
      items: (estimate?.items || []).filter((item) => item.remainingQty > 0).map((item) => ({
        sourceItemKey: item.sourceItemKey,
        description: item.description,
        hsn: item.hsn,
        unit: item.unit,
        size: item.size,
        area: item.area,
        remarks: item.remarks || "",
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
        items: selectedItems.map(({ remainingQty, sourceQty, deliveredQty, selected, ...item }) => ({ ...item, qty: Number(item.qty) })),
      };
      const response = editingId
        ? await api.put(`/api/delivery-challans/${editingId}`, payload)
        : await api.post("/api/delivery-challans", payload);
      toast.success(response.data?.message || "Delivery challan saved");
      setMode("list");
      setEditingId("");
      await loadData();
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
    setMode("view");
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center gap-2 text-slate-600"><RefreshCw className="animate-spin" /> Loading challans...</div>;

  if (mode === "view") return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="no-print mx-auto mb-3 flex max-w-[900px] justify-between">
        <button onClick={() => setMode("list")} className="flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-bold"><ArrowLeft size={16} /> Back</button>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-md bg-[#194090] px-4 py-2 text-sm font-bold text-white"><Printer size={16} /> Print / Save PDF</button>
      </div>
      <DeliveryChallanPrint challan={form} settings={settings} />
      <style>{`@media print { body * { visibility:hidden } .challan-print,.challan-print * { visibility:visible } .challan-print { position:absolute;left:0;top:0;width:100%;max-width:none;padding:0 } .no-print { display:none!important } }`}</style>
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
              <div className="md:col-span-4"><label className={labelClass}><FileText size={14} className="text-blue-500" /> Source Proforma Invoice *</label><select disabled={Boolean(editingId)} className={inputClass} value={form.source_estimate_id} onChange={(event) => selectProforma(event.target.value)}><option value="">Select Proforma Invoice</option>{proformas.map((estimate) => { const availableItems = estimate.items.filter((item) => item.remainingQty > 0); const availableQty = availableItems.reduce((sum, item) => sum + item.remainingQty, 0); return <option key={estimate._id} value={estimate._id}>{estimate.est_no} — {availableItems.length} item(s), {availableQty} qty available</option>; })}</select></div>
              <div className="md:col-span-4"><label className={labelClass}><Calendar size={14} className="text-blue-500" /> Challan Date *</label><input required type="date" className={inputClass} value={form.challan_date} onChange={(event) => setForm({ ...form, challan_date: event.target.value })} /></div>
              <div className="md:col-span-4"><label className={labelClass}><Tag size={14} className="text-blue-500" /> Purpose</label><select className={inputClass} value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })}>{["Event/Stall Material", "Job Work", "Returnable Material", "Non-returnable Material", "Other"].map((value) => <option key={value}>{value}</option>)}</select></div>
              <div className="col-span-full my-1 h-px bg-slate-100"></div>
              <div className="md:col-span-3"><label className={labelClass}><Truck size={14} className="text-blue-500" /> Vehicle No.</label><input className={inputClass} value={form.vehicle_no} onChange={(event) => setForm({ ...form, vehicle_no: event.target.value })} placeholder="Enter vehicle number" /></div>
              <div className="md:col-span-3"><label className={labelClass}><User size={14} className="text-blue-500" /> Transporter</label><input className={inputClass} value={form.transporter_name} onChange={(event) => setForm({ ...form, transporter_name: event.target.value })} placeholder="Transporter name" /></div>
              <div className="md:col-span-3"><label className={labelClass}><Calendar size={14} className="text-blue-500" /> Event Name</label><input className={inputClass} value={form.event_name} onChange={(event) => setForm({ ...form, event_name: event.target.value })} placeholder="Enter event name" /></div>
              <div className="md:col-span-3"><label className={labelClass}><FileBadge size={14} className="text-blue-500" /> PO / Reference No.</label><input className={inputClass} value={form.po_no} onChange={(event) => setForm({ ...form, po_no: event.target.value })} placeholder="Enter reference number" /></div>
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
        <button onClick={() => navigate(`/dashboard/account/${id}`)} className="mb-2 flex items-center gap-1 text-sm font-bold text-[#194090]"><ArrowLeft size={15} /> Account Overview</button>
        <div className="mb-4 flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
          <div><h1 className="text-xl font-black text-[#1a2b4b]">Delivery Challans</h1><p className="text-xs text-slate-500">Create multiple partial-delivery challans against a proforma invoice.</p></div>
          <button onClick={startCreate} className="flex items-center gap-2 rounded-md bg-[#194090] px-4 py-2 text-[13px] font-bold text-white"><FilePlus2 size={17} /> Create Challan</button>
        </div>
        
        {statCards}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-xs whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
            <thead className="bg-slate-50 uppercase text-slate-500 border-b border-slate-200">
              <tr>{["Challan No.", "Date", "Proforma No.", "Purpose", "Items", "Quantity", "Status", "Actions"].map((heading) => <th key={heading} className="px-4 py-3 font-bold">{heading}</th>)}</tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!challans.length && <tr><td colSpan={8} className="p-10 text-center text-slate-400 font-bold">No delivery challans created yet.</td></tr>}
              {challans.map((challan) => (
                <tr key={challan._id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-[11px] font-bold text-[#194090] cursor-pointer hover:underline" onClick={() => view(challan)}>{challan.challan_no}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-600 font-medium">{formatDate(challan.challan_date)}</td>
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
                      <button title="View / Print" onClick={() => view(challan)} className="rounded border border-slate-200 p-1.5 text-[#194090] hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed"><Eye size={13} /></button>
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
