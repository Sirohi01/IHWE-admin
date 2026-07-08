import { useEffect, useMemo, useState } from "react";
import {
  Car,
  Bike,
  CheckCircle2,
  IndianRupee,
  Sparkles,
  RefreshCw,
  Save,
  Ticket,
  UserCheck,
  Users,
  Wrench,
  ShieldCheck,
  TrendingUp,
  Activity,
  AlertCircle
} from "lucide-react";
import api from "../lib/api";

const passMeta = {
  exhibitor: { icon: UserCheck, color: "orange", label: "Exhibitor" },
  vehicle: { icon: Car, color: "emerald", label: "Vehicle" },
  service: { icon: Wrench, color: "purple", label: "Service" },
  visitor: { icon: Users, color: "blue", label: "Visitor" },
  delegate: { icon: Sparkles, color: "pink", label: "Delegate" },
};

const VEHICLE_SUB_TYPES = [
  { key: "twoWheeler", label: "2-Wheeler", icon: Bike, color: "teal" },
  { key: "fourWheeler", label: "Car / 4-Wheeler", icon: Car, color: "cyan" },
];

const colorClass = {
  orange: "from-orange-500 to-amber-500 shadow-orange-500/20",
  emerald: "from-emerald-500 to-teal-500 shadow-emerald-500/20",
  purple: "from-purple-500 to-indigo-500 shadow-purple-500/20",
  blue: "from-blue-500 to-cyan-500 shadow-blue-500/20",
  pink: "from-pink-500 to-rose-500 shadow-pink-500/20",
  teal: "from-teal-500 to-emerald-500 shadow-teal-500/20",
  cyan: "from-cyan-500 to-sky-500 shadow-cyan-500/20",
};

const PREVIEW_STALL_SIZES = [9, 12, 18, 27];
const ROUND_FN = { floor: Math.floor, round: Math.round, ceil: Math.ceil };
const computeEntitlementPreview = (item, stallArea) => {
  const ratioArea = Number(item.ratioArea);
  if (!stallArea || !ratioArea) return 0;
  const roundFn = ROUND_FN[item.roundingMode] || Math.floor;
  return roundFn(stallArea / ratioArea) * (Number(item.ratioQty) || 0);
};

export default function MobilePassConfig() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/exhibitor-pass-config/admin/all");
      setItems(res.data.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to load pass configuration";
      setError(message);

      try {
        const fallbackRes = await api.get("/api/exhibitor-pass-config/active");
        setItems(fallbackRes.data.data || []);
      } catch {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter(item => item.isActive !== false).length,
    complimentary: items.reduce((sum, item) => {
      if (item.passType === "vehicle") {
        return sum + Number(item.vehicleTypeConfig?.twoWheeler?.complimentaryQuota || 0) + Number(item.vehicleTypeConfig?.fourWheeler?.complimentaryQuota || 0);
      }
      return sum + Number(item.complimentaryQuota || 0);
    }, 0),
    totalQuota: items.reduce((sum, item) => sum + Number(item.totalQuota || 0), 0),
  }), [items]);

  const updateItem = (id, key, value) => {
    setItems(prev => prev.map(item => item._id === id ? { ...item, [key]: value } : item));
  };

  // The single "Vehicle Pass" holds two independent sub-configs (2-wheeler / car),
  // each with its own allocation mode, ratio, and price.
  const updateVehicleSub = (id, subKey, field, value) => {
    setItems(prev => prev.map(item => {
      if (item._id !== id) return item;
      const vehicleTypeConfig = { ...(item.vehicleTypeConfig || {}) };
      vehicleTypeConfig[subKey] = { ...(vehicleTypeConfig[subKey] || {}), [field]: value };
      return { ...item, vehicleTypeConfig };
    }));
  };
  const subValue = (item, subKey, field, fallback = 0) => item.vehicleTypeConfig?.[subKey]?.[field] ?? fallback;
  const computeSubPreview = (item, subKey, stallArea) => {
    const sub = item.vehicleTypeConfig?.[subKey] || {};
    if (sub.allocationMode !== "perArea") return Number(sub.complimentaryQuota) || 0;
    const ratioArea = Number(sub.ratioArea);
    if (!stallArea || !ratioArea) return 0;
    const roundFn = ROUND_FN[sub.roundingMode] || Math.floor;
    return roundFn(stallArea / ratioArea) * (Number(sub.ratioQty) || 0);
  };

  const save = async (item) => {
    setSavingId(item._id);
    setError("");
    try {
      await api.put(`/api/exhibitor-pass-config/admin/${item.passType}`, item);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save pass configuration");
    } finally {
      setSavingId("");
    }
  };

  const numberInput = (item, key, label, icon, step) => {
    const Icon = icon;
    return (
      <label className="block group">
        <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:text-[#23471d]">
          <Icon size={14} className="text-slate-400 transition-colors group-focus-within:text-[#23471d]" /> {label}
        </span>
        <div className="relative">
          <input
            type="number"
            min="0"
            step={step || 1}
            value={item[key] || 0}
            onChange={e => updateItem(item._id, key, e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base font-bold text-slate-800 outline-none transition-all hover:border-slate-300 focus:border-[#23471d] focus:bg-white focus:ring-4 focus:ring-[#23471d]/10"
          />
        </div>
      </label>
    );
  };

  const segmentedControl = (item, key, options, gradient, size = "md") => {
    const current = item[key] || options[0].value;
    const pad = size === "sm" ? "px-2.5 py-1.5 text-[10px]" : "px-4 py-2 text-xs";
    return (
      <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {options.map(opt => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateItem(item._id, key, opt.value)}
              className={`rounded-lg font-black uppercase tracking-wide transition-all ${pad} ${active
                ? `bg-gradient-to-br ${gradient} text-white shadow-md`
                : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  };

  const inlineNumber = (item, key, width = "w-16") => (
    <input
      type="number"
      min="0"
      step="0.5"
      value={item[key] || 0}
      onChange={e => updateItem(item._id, key, e.target.value)}
      className={`${width} rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm font-black text-slate-800 outline-none transition-all focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10`}
    />
  );

  // Vehicle-sub-config variants of the same controls above, scoped to
  // item.vehicleTypeConfig[subKey] instead of the flat item fields.
  const subNumberInput = (item, subKey, field, label, icon) => {
    const Icon = icon;
    return (
      <label className="block group">
        <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:text-[#23471d]">
          <Icon size={12} className="text-slate-400" /> {label}
        </span>
        <input
          type="number"
          min="0"
          step="0.5"
          value={subValue(item, subKey, field)}
          onChange={e => updateVehicleSub(item._id, subKey, field, e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-800 outline-none transition-all focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10"
        />
      </label>
    );
  };

  const subSegmented = (item, subKey, field, options, gradient) => {
    const current = subValue(item, subKey, field, options[0].value);
    return (
      <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
        {options.map(opt => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateVehicleSub(item._id, subKey, field, opt.value)}
              className={`rounded px-2 py-1 text-[9px] font-black uppercase tracking-wide transition-all ${active ? `bg-gradient-to-br ${gradient} text-white shadow-sm` : "text-slate-400 hover:text-slate-600"}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  };

  const subInlineNumber = (item, subKey, field, width = "w-14") => (
    <input
      type="number"
      min="0"
      step="0.5"
      value={subValue(item, subKey, field)}
      onChange={e => updateVehicleSub(item._id, subKey, field, e.target.value)}
      className={`${width} rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-center text-xs font-black text-slate-800 outline-none focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10`}
    />
  );

  return (
    <div className="relative min-h-screen bg-slate-50 pb-20">
      {/* Decorative Top Gradient Background */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

      <div className="relative p-6 lg:p-8">

        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Pass & Hospitality</h1>
            <p className="mt-2 text-base font-medium text-slate-500 max-w-2xl">
              Control the pricing, complimentary limits, and request quotas for all passes available inside the Exhibitor Mobile App.
            </p>
          </div>

          <button
            onClick={load}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:shadow-md active:scale-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-[#23471d]" : "text-slate-400"} /> Refresh Data
          </button>
        </div>

        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Pass Types", value: stats.total, sub: "Configured Types", icon: Ticket, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Types", value: stats.active, sub: "Visible to Exhibitors", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Complimentary", value: stats.complimentary, sub: "Total Free Passes", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Total Quota", value: stats.totalQuota, sub: "Overall Pass Limit", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">{stat.label}</p>
                    <p className="mt-1 flex items-baseline gap-2 text-3xl font-black text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{stat.sub}</p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
            <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={20} />
            <div>
              <h3 className="text-sm font-black">Sync Error</h3>
              <p className="mt-1 text-sm font-medium">{error}. Showing available configuration if possible.</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#23471d] border-t-transparent" />
            <p className="mt-4 text-sm font-black text-slate-400">Loading Configuration...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {items.map((item, index) => {
              const meta = passMeta[item.passType] || { icon: Ticket, color: "blue", label: item.passType };
              const Icon = meta.icon;

              return (
                <div
                  key={item._id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${colorClass[meta.color]}`} />

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${colorClass[meta.color]}`}>
                        <Icon size={26} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{meta.label} Category</p>
                          {item.isActive !== false && (
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          )}
                        </div>
                        <input
                          value={item.title || ""}
                          onChange={e => updateItem(item._id, "title", e.target.value)}
                          placeholder="Pass Title"
                          className="mt-1.5 w-full rounded-lg border border-transparent bg-transparent px-0 text-xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-slate-200 focus:bg-slate-50 focus:px-3 focus:py-1"
                        />
                        <input
                          value={item.subtitle || ""}
                          onChange={e => updateItem(item._id, "subtitle", e.target.value)}
                          placeholder="Pass subtitle description"
                          className="mt-1 w-full rounded-lg border border-transparent bg-transparent px-0 text-sm font-semibold text-slate-500 outline-none transition-all placeholder:text-slate-300 focus:border-slate-200 focus:bg-slate-50 focus:px-3 focus:py-1"
                        />
                      </div>
                    </div>

                    {/* Custom Toggle Switch */}
                    <label className="flex cursor-pointer items-center gap-3 shrink-0">
                      <span className="hidden sm:block text-xs font-black uppercase tracking-wider text-slate-500">
                        {item.isActive !== false ? 'Active' : 'Hidden'}
                      </span>
                      <div
                        className="relative inline-flex h-7 w-12 items-center rounded-full shadow-inner transition-colors duration-300 ease-in-out"
                        style={{ backgroundColor: item.isActive !== false ? '#10b981' : '#cbd5e1' }}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={item.isActive !== false}
                          onChange={e => updateItem(item._id, "isActive", e.target.checked)}
                        />
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ease-in-out ${item.isActive !== false ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </div>
                    </label>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 space-y-6 p-6">

                    {/* Free Allocation */}
                    <div>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-5 rounded-full bg-gradient-to-r ${colorClass[meta.color]}`} />
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            {item.passType === "vehicle" ? "Free Allocation — By Vehicle Type" : "Free Allocation"}
                          </p>
                        </div>
                        {item.passType !== "vehicle" && segmentedControl(item, "allocationMode", [
                          { value: "fixed", label: "Fixed" },
                          { value: "perArea", label: "Per Stall Area" },
                        ], colorClass[meta.color])}
                      </div>

                      {item.passType === "vehicle" ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {VEHICLE_SUB_TYPES.map(sub => {
                            const gradient = colorClass[sub.color];
                            const SubIcon = sub.icon;
                            const subMode = subValue(item, sub.key, "allocationMode", "fixed");
                            return (
                              <div key={sub.key} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                  <span className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                                    <SubIcon size={14} className="text-slate-500" /> {sub.label}
                                  </span>
                                  {subSegmented(item, sub.key, "allocationMode", [
                                    { value: "fixed", label: "Fixed" },
                                    { value: "perArea", label: "Per Area" },
                                  ], gradient)}
                                </div>

                                {subMode === "perArea" ? (
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-500">Give</span>
                                      {subInlineNumber(item, sub.key, "ratioQty")}
                                      <span className="text-[10px] font-bold text-slate-500">per</span>
                                      {subInlineNumber(item, sub.key, "ratioArea")}
                                      <span className="text-[10px] font-bold text-slate-500">sqm</span>
                                      <div className="ml-auto">
                                        {subSegmented(item, sub.key, "roundingMode", [
                                          { value: "floor", label: "Floor" },
                                          { value: "round", label: "Round" },
                                          { value: "ceil", label: "Ceil" },
                                        ], gradient)}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {PREVIEW_STALL_SIZES.map(size => (
                                        <div key={size} className={`flex items-center gap-1 rounded bg-gradient-to-br ${gradient} px-2 py-0.5 shadow-sm`}>
                                          <span className="text-[9px] font-bold text-white/75">{size}sqm</span>
                                          <span className="text-[10px] font-black text-white">{computeSubPreview(item, sub.key, size)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="max-w-[140px]">
                                    {subNumberInput(item, sub.key, "complimentaryQuota", "Free Qty", CheckCircle2)}
                                  </div>
                                )}

                                <div className="mt-3 border-t border-slate-200/80 pt-3">
                                  {subNumberInput(item, sub.key, "price", "Price (₹) / Extra", IndianRupee)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : item.allocationMode === "perArea" ? (
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-bold text-slate-500">Give</span>
                            {inlineNumber(item, "ratioQty")}
                            <span className="text-xs font-bold text-slate-500">free per</span>
                            {inlineNumber(item, "ratioArea")}
                            <span className="text-xs font-bold text-slate-500">sqm of stall</span>
                            <div className="ml-auto">
                              {segmentedControl(item, "roundingMode", [
                                { value: "floor", label: "Floor" },
                                { value: "round", label: "Round" },
                                { value: "ceil", label: "Ceil" },
                              ], colorClass[meta.color], "sm")}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3">
                            <span className="mr-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Preview</span>
                            {PREVIEW_STALL_SIZES.map(size => (
                              <div key={size} className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-br ${colorClass[meta.color]} px-2.5 py-1 shadow-sm`}>
                                <span className="text-[10px] font-bold text-white/75">{size}sqm</span>
                                <span className="text-xs font-black text-white">{computeEntitlementPreview(item, size)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-[200px]">
                          {numberInput(item, "complimentaryQuota", "Free Quota", CheckCircle2)}
                        </div>
                      )}
                    </div>

                    {/* Pricing & Limits */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-1.5 w-5 rounded-full bg-slate-200" />
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Pricing & Limits</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {numberInput(item, "totalQuota", "Total Quota", Ticket)}
                        {item.passType !== "vehicle" && numberInput(item, "price", "Price (₹)", IndianRupee)}
                        {numberInput(item, "gstPercentage", "GST (%)", Activity)}
                        {numberInput(item, "maxPerRequest", "Max/Req", Users)}
                        {numberInput(item, "validityDays", "Valid Days", ShieldCheck)}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                        <IndianRupee size={14} className="text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-500">
                        {item.passType === "vehicle" ? (
                          <span className="text-slate-700">
                            2-Wheeler ₹{Number(subValue(item, "twoWheeler", "price")).toLocaleString("en-IN")} · Car ₹{Number(subValue(item, "fourWheeler", "price")).toLocaleString("en-IN")} (after free quota)
                          </span>
                        ) : item.allocationMode === "perArea" ? (
                          <span className="text-slate-700">{item.ratioQty || 0} free per {item.ratioArea || 0} sqm, then ₹{Number(item.price || 0).toLocaleString("en-IN")}/pass</span>
                        ) : (
                          <span className="text-slate-700">First {item.complimentaryQuota || 0} Free, then ₹{Number(item.price || 0).toLocaleString("en-IN")}/pass</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => save(item)}
                      disabled={savingId === item._id}
                      className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#23471d] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#1a3515] hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                    >
                      {savingId === item._id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save size={16} className="transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:scale-110" />
                      )}
                      <span>{savingId === item._id ? "Saving..." : "Save Config"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
