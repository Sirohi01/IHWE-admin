import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Bike,
  Calendar,
  ChevronDown,
  IndianRupee,
  Info,
  Lightbulb,
  LifeBuoy,
  Minus,
  Plus,
  Ruler,
  Sparkles,
  RefreshCw,
  Save,
  Ticket,
  UserCheck,
  Users,
  Wrench,
  AlertCircle,
  CheckCircle2,
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
  orange: "from-orange-500 to-amber-500",
  emerald: "from-emerald-500 to-teal-500",
  purple: "from-purple-500 to-indigo-500",
  blue: "from-blue-500 to-cyan-500",
  pink: "from-pink-500 to-rose-500",
  teal: "from-teal-500 to-emerald-500",
  cyan: "from-cyan-500 to-sky-500",
};

const tintClass = {
  orange: "from-orange-50/70",
  emerald: "from-emerald-50/70",
  purple: "from-purple-50/70",
  blue: "from-blue-50/70",
  pink: "from-pink-50/70",
};

const ringClass = {
  orange: "ring-orange-100",
  emerald: "ring-emerald-100",
  purple: "ring-purple-100",
  blue: "ring-blue-100",
  pink: "ring-pink-100",
};

const textTint = {
  orange: "text-orange-600",
  emerald: "text-emerald-600",
  purple: "text-purple-600",
  blue: "text-blue-600",
  pink: "text-pink-600",
};

const footerTint = {
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  purple: "bg-purple-50 text-purple-700 ring-purple-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  pink: "bg-pink-50 text-pink-700 ring-pink-100",
};

const getEventBadge = (event) => {
  const now = new Date();
  const start = event.startDate ? new Date(event.startDate) : null;
  const end = event.endDate ? new Date(event.endDate) : null;
  if (start && now < start) return { label: "Upcoming", className: "bg-blue-50 text-blue-700" };
  if (end && now > end) return { label: "Completed", className: "bg-slate-100 text-slate-500" };
  return { label: "Ongoing", className: "bg-emerald-50 text-emerald-700" };
};

export default function MobilePassConfig() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      const res = await api.get("/api/events");
      const list = res.data?.data || [];
      setEvents(list);
      if (list.length) setEventId((prev) => prev || list[0]._id);
    } catch {
      setEvents([]);
    }
  };

  const loadPasses = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/exhibitor-pass-config/admin/all", { params: { eventId: id } });
      setItems(res.data.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to load pass configuration";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { if (eventId) loadPasses(eventId); }, [eventId]);

  const selectedEvent = events.find((e) => e._id === eventId) || null;

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

  const save = async (item) => {
    setSavingId(item._id);
    setError("");
    try {
      await api.put(`/api/exhibitor-pass-config/admin/${item.passType}`, item, { params: { eventId } });
      loadPasses(eventId);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save pass configuration");
    } finally {
      setSavingId("");
    }
  };

  // A plain-language "same for everyone" vs "more for bigger stalls" choice,
  // instead of the technical "Fixed" / "Per Stall Area" allocation-mode terms.
  const AllocationChoice = ({ current, onChange, gradient }) => (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1">
      {[
        { value: "fixed", label: "Same for everyone", icon: Users },
        { value: "perArea", label: "More for bigger stalls", icon: Ruler },
      ].map(opt => {
        const active = (current || "fixed") === opt.value;
        const OptIcon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${active
              ? `bg-gradient-to-br ${gradient} text-white shadow-sm`
              : "text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
          >
            <OptIcon size={12} strokeWidth={2.5} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  const Stepper = ({ value, onChange, width = "w-24" }) => (
    <div className={`inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${width}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, Number(value || 0) - 1))}
        className="flex h-7 w-6 shrink-0 items-center justify-center text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
      >
        <Minus size={11} strokeWidth={2.5} />
      </button>
      <input
        type="number"
        min="0"
        value={value || 0}
        onChange={e => onChange(e.target.value)}
        className="w-full border-x border-slate-100 bg-transparent py-1 text-center text-xs font-normal text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(Number(value || 0) + 1)}
        className="flex h-7 w-6 shrink-0 items-center justify-center text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
      >
        <Plus size={11} strokeWidth={2.5} />
      </button>
    </div>
  );

  const SectionLabel = ({ children, gradient }) => (
    <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500">
      <span className={`h-1.5 w-4 rounded-full bg-gradient-to-r ${gradient}`} />
      {children}
    </p>
  );

  const StatField = ({ gradient, label, noBullet, prefixIcon: PrefixIcon, suffix, value, onChange }) => (
    <div>
      {noBullet ? (
        <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-500">{label}</p>
      ) : (
        <SectionLabel gradient={gradient}>{label}</SectionLabel>
      )}
      <div className="flex items-center gap-1.5">
        {PrefixIcon && <PrefixIcon size={13} className="shrink-0 text-slate-400" />}
        <Stepper value={value} onChange={onChange} />
        {suffix && <span className="text-[10px] font-bold text-slate-500">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-50 pb-20">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

      <div className="relative px-6 pb-6 pt-4 lg:px-8 lg:pb-8 lg:pt-5">

        {/* Header Section */}
        <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight text-slate-900">
              Pass Configuration
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500 max-w-2xl">
              Configure pass categories, set free quota, and manage pricing for your exhibitors and visitors.
            </p>
          </div>

          <button
            onClick={() => loadPasses(eventId)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-normal text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:shadow-md active:scale-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-[#23471d]" : "text-slate-400"} /> Refresh Data
          </button>
        </div>

        {/* Event Selector */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="relative w-full max-w-lg">
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-500">Select Event for Pass Configuration</p>
            <button
              type="button"
              onClick={() => setEventDropdownOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm transition-all hover:border-slate-300"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Calendar size={14} className="shrink-0 text-slate-400" />
                <span className="truncate text-xs font-normal text-slate-800">{selectedEvent?.name || "Select an event"}</span>
                {selectedEvent && (
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-normal tracking-wide ${getEventBadge(selectedEvent).className}`}>
                    {getEventBadge(selectedEvent).label}
                  </span>
                )}
              </span>
              <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${eventDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {eventDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setEventDropdownOpen(false)} />
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="max-h-72 overflow-y-auto py-1">
                    {events.map((ev) => {
                      const badge = getEventBadge(ev);
                      const active = ev._id === eventId;
                      return (
                        <button
                          key={ev._id}
                          type="button"
                          onClick={() => { setEventId(ev._id); setEventDropdownOpen(false); }}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-bold transition-colors ${active ? "bg-[#23471d]/5 text-[#23471d]" : "text-slate-700 hover:bg-slate-50"}`}
                        >
                          <span className="truncate">{ev.name}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-normal tracking-wide ${badge.className}`}>{badge.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/events")}
                    className="flex w-full items-center gap-1.5 border-t border-slate-100 px-4 py-2.5 text-left text-xs font-normal text-[#23471d] hover:bg-slate-50"
                  >
                    <Plus size={14} /> Manage Events
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-1 items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
            <Info size={16} className="mt-0.5 shrink-0 text-indigo-500" />
            <div>
              <p className="text-xs font-normal text-indigo-900">Why select an event?</p>
              <p className="mt-0.5 text-[11px] font-medium text-indigo-700">Pass configuration will be saved and applied only for the selected event.</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
            <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={20} />
            <div>
              <h3 className="text-sm font-normal">Sync Error</h3>
              <p className="mt-1 text-sm font-medium">{error}. Showing available configuration if possible.</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#23471d] border-t-transparent" />
            <p className="mt-4 text-sm font-normal text-slate-400">Loading Configuration...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const meta = passMeta[item.passType] || { icon: Ticket, color: "blue", label: item.passType };
              const Icon = meta.icon;
              const gradient = colorClass[meta.color];
              const tint = tintClass[meta.color];
              const ring = ringClass[meta.color];
              const isPerArea = item.allocationMode === "perArea";

              return (
                <div
                  key={item._id}
                  className={`flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-b ${tint} to-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ring-2 ${ring} ${gradient}`}>
                        <Icon size={18} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-normal leading-tight tracking-tight text-slate-900">{item.title || meta.label}</p>
                        <p className="text-[10px] font-bold tracking-wide text-slate-400">{meta.label} Pass</p>
                      </div>
                    </div>

                    <label className="flex cursor-pointer flex-col items-center gap-1 shrink-0">
                      <span className={`text-[9px] font-semibold tracking-wider ${item.isActive !== false ? textTint[meta.color] : "text-slate-400"}`}>
                        {item.isActive !== false ? "Active" : "Hidden"}
                      </span>
                      <div
                        className="relative inline-flex h-6 w-11 items-center rounded-full shadow-inner transition-colors"
                        style={{ backgroundColor: item.isActive !== false ? "#10b981" : "#cbd5e1" }}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={item.isActive !== false}
                          onChange={e => updateItem(item._id, "isActive", e.target.checked)}
                        />
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${item.isActive !== false ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </div>
                    </label>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 space-y-2 rounded-t-3xl bg-white/80 p-3 backdrop-blur-sm">
                    {item.passType === "vehicle" ? (
                      <>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {VEHICLE_SUB_TYPES.map(sub => {
                            const SubIcon = sub.icon;
                            const subGradient = colorClass[sub.color];
                            const subMode = subValue(item, sub.key, "allocationMode", "fixed");
                            const subRatioArea = subValue(item, sub.key, "ratioArea", 9);
                            return (
                              <div key={sub.key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 transition-colors hover:bg-slate-50">
                                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                  <span className={`flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm ${subGradient}`}>
                                    <SubIcon size={11} className="text-white" strokeWidth={2.5} />
                                  </span>
                                  {sub.label}
                                </p>

                                <AllocationChoice
                                  current={subMode}
                                  gradient={subGradient}
                                  onChange={(v) => updateVehicleSub(item._id, sub.key, "allocationMode", v)}
                                />

                                <div className="mt-1.5 space-y-1">
                                  <StatField
                                    gradient={subGradient}
                                    noBullet
                                    label={subMode === "perArea" ? `Free Passes (Per ${subRatioArea || 0} sqm)` : "Free Passes"}
                                    suffix="Passes are free"
                                    value={subMode === "perArea" ? subValue(item, sub.key, "ratioQty") : subValue(item, sub.key, "complimentaryQuota")}
                                    onChange={(v) => updateVehicleSub(item._id, sub.key, subMode === "perArea" ? "ratioQty" : "complimentaryQuota", v)}
                                  />
                                  <StatField
                                    gradient={subGradient}
                                    noBullet
                                    label="After Free Quota"
                                    prefixIcon={IndianRupee}
                                    value={subValue(item, sub.key, "price")}
                                    onChange={(v) => updateVehicleSub(item._id, sub.key, "price", v)}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="mb-0.5 text-[11px] font-semibold tracking-wide text-slate-500">Who can use?</p>
                          <AllocationChoice
                            current={item.allocationMode}
                            gradient={gradient}
                            onChange={(v) => updateItem(item._id, "allocationMode", v)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <StatField
                            gradient={gradient}
                            noBullet
                            label={isPerArea ? `Free Passes (Per ${item.ratioArea || 0} sqm)` : "Free Passes"}
                            suffix="Passes are free"
                            value={isPerArea ? item.ratioQty : item.complimentaryQuota}
                            onChange={(v) => updateItem(item._id, isPerArea ? "ratioQty" : "complimentaryQuota", v)}
                          />
                          {isPerArea && (
                            <StatField
                              gradient={gradient}
                              noBullet
                              label="Stall Area Step"
                              suffix="sqm"
                              value={item.ratioArea}
                              onChange={(v) => updateItem(item._id, "ratioArea", v)}
                            />
                          )}
                          <StatField gradient={gradient} noBullet label="Price After Free Quota" prefixIcon={IndianRupee} value={item.price} onChange={(v) => updateItem(item._id, "price", v)} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-col items-start justify-between gap-2 border-t border-slate-100 bg-white/80 px-3 py-2 sm:flex-row sm:items-center">
                    <p className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${footerTint[meta.color]}`}>
                      {item.passType === "vehicle" ? (
                        <>2-Wheeler ₹{Number(subValue(item, "twoWheeler", "price")).toLocaleString("en-IN")} · Car ₹{Number(subValue(item, "fourWheeler", "price")).toLocaleString("en-IN")} after free quota</>
                      ) : isPerArea ? (
                        <>{item.ratioQty || 0} free per {item.ratioArea || 0} sqm, then ₹{Number(item.price || 0).toLocaleString("en-IN")}/pass</>
                      ) : (
                        <>First {item.complimentaryQuota || 0} free, then ₹{Number(item.price || 0).toLocaleString("en-IN")}/pass</>
                      )}
                    </p>
                    <button
                      onClick={() => save(item)}
                      disabled={savingId === item._id}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-br px-3.5 py-1.5 text-[11px] font-normal tracking-wider text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-70 ${gradient}`}
                    >
                      {savingId === item._id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save size={16} />
                      )}
                      <span>{savingId === item._id ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Tips */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/70 bg-white p-3.5 shadow-sm">
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-normal text-slate-800">
                  <Lightbulb size={16} className="text-amber-500" /> Quick Tips
                </p>
                <ul className="space-y-1.5">
                  {[
                    'Use "More for bigger stalls" to give higher free quota for larger exhibitors.',
                    "Price after free quota will be applicable once free limit is exhausted.",
                    "Don't forget to Save Changes after updating any section.",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] font-medium text-slate-600">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
                <LifeBuoy size={15} className="shrink-0 text-slate-400" />
                <p className="text-[11px] font-bold text-slate-600">
                  Need help configuring passes? <span className="text-[#23471d]">Contact your support team →</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
