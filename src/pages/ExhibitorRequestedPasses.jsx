import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  BadgeCheck,
  Clock3,
  FileText,
  Layers3,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  Utensils,
  Users,
} from "lucide-react";
import api from "../lib/api";
import FoodCouponCanvas from "../components/passes/FoodCouponCanvas";
import { getStoredFoodCouponLogo } from "../components/passes/foodCouponStorage";
import PassTemplateCanvas from "../components/passes/PassTemplateCanvas";

const PASS_META = {
  exhibitor: { label: "Exhibitor", category: "EXHIBITOR", templateNames: ["exhibitor"], icon: Ticket, tone: "bg-sky-50 text-sky-700 border-sky-100" },
  service: { label: "Service", category: "SERVICE", templateNames: ["service", "service provider", "service_provider"], icon: BadgeCheck, tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  visitor: { label: "Visitor", category: "VISITOR", templateNames: ["visitor"], icon: Users, tone: "bg-violet-50 text-violet-700 border-violet-100" },
  delegate: { label: "Delegate", category: "DELEGATE", templateNames: ["delegate"], icon: FileText, tone: "bg-amber-50 text-amber-700 border-amber-100" },
  lunch: { label: "Food Coupon", category: "FOOD COUPON", templateNames: ["food", "food coupon", "lunch"], icon: Utensils, tone: "bg-blue-50 text-blue-700 border-blue-100", isFoodCoupon: true },
};

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
};

const TEMPLATE_CANVAS_WIDTH = 1122;
const PRINT_CARD_WIDTH_CM = 9.5;
const PRINT_CARD_HEIGHT_CM = 13;
const PRINT_SCALE = (PRINT_CARD_WIDTH_CM * 96 / 2.54) / TEMPLATE_CANVAS_WIDTH;
const FOOD_COUPONS_PER_SHEET = 20;

const isFoodPassType = (passType) => Boolean(PASS_META[passType]?.isFoodCoupon);

const getExhibitorId = (request) => String(request?.exhibitorId?._id || request?.exhibitorId || "");

const getExhibitorName = (request) => {
  const exhibitor = request?.exhibitorId || {};
  return exhibitor.exhibitorName || exhibitor.companyName || "Unknown Exhibitor";
};

const normalizeTypeValue = (value) => String(value || "").toLowerCase().replace(/-/g, " ").replace(/_/g, " ").trim();

const templateMatchesType = (template, typeNames) => {
  const values = [...(template?.passTypes || []), ...(template?.categories || [])].map(normalizeTypeValue);
  return typeNames.some((name) => values.includes(normalizeTypeValue(name)));
};

const getPassNames = (request) => {
  return (request.personnel || [])
    .map((person) => person.name)
    .filter(Boolean);
};

const getFoodCouponText = (request) => {
  const quantity = Math.max(1, Number(request.quantity || 1));
  return `${quantity} PACKED LUNCH`;
};

const getRequestFallbackNames = (request) => {
  const names = getPassNames(request);
  if (names.length) return names;
  if (isFoodPassType(request.passType)) {
    return [getFoodCouponText(request)];
  }
  const fallback = getExhibitorName(request);
  const quantity = Math.max(1, Number(request.quantity || 1));
  return Array.from({ length: quantity }, (_, index) => quantity === 1 ? fallback : `${fallback} ${index + 1}`);
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const waitForPrintAssets = async (root) => {
  if (!root) return;
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(images.map(async (image) => {
    if (!image.complete) {
      await new Promise((resolve) => {
        image.onload = resolve;
        image.onerror = resolve;
      });
    }
    if (typeof image.decode === "function") {
      try {
        await image.decode();
      } catch {
        // Loaded image is still usable by print preview.
      }
    }
  }));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};

export default function ExhibitorRequestedPasses() {
  const printRef = useRef(null);
  const foodPrintRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [defaultTemplate, setDefaultTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExhibitorId, setSelectedExhibitorId] = useState("");
  const [selectedPrintIds, setSelectedPrintIds] = useState([]);
  const [search, setSearch] = useState("");
  const [showExhibitorDropdown, setShowExhibitorDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState("approved");
  const [showPrintGapPrompt, setShowPrintGapPrompt] = useState(false);
  const [activePrintMode, setActivePrintMode] = useState("");
  const [foodCouponLogoSrc, setFoodCouponLogoSrc] = useState("");
  const [printGapCm, setPrintGapCm] = useState(0.7);
  const [printGapDraft, setPrintGapDraft] = useState("0.7");
  const [printRowGapCm, setPrintRowGapCm] = useState(1.3);
  const [printRowGapDraft, setPrintRowGapDraft] = useState("1.3");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [requestRes, templateRes] = await Promise.all([
        api.get("/api/exhibitor-pass-requests/admin/all"),
        api.get("/api/pass-templates"),
      ]);
      const allTemplates = templateRes.data.data || [];
      setRequests(requestRes.data.data || []);
      setTemplates(allTemplates);
      setDefaultTemplate(allTemplates.find((item) => item.isDefault) || allTemplates[0] || null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to load exhibitor passes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const refreshFoodCouponLogo = () => {
      setFoodCouponLogoSrc(getStoredFoodCouponLogo().logoSrc);
    };
    refreshFoodCouponLogo();
    window.addEventListener("storage", refreshFoodCouponLogo);
    return () => window.removeEventListener("storage", refreshFoodCouponLogo);
  }, []);

  const templateByPassType = useMemo(() => {
    return Object.fromEntries(Object.entries(PASS_META).map(([passType, meta]) => {
      const matching = templates.filter((template) => template.isActive !== false && templateMatchesType(template, meta.templateNames));
      return [passType, matching.find((template) => !template.isDefault) || matching[0] || defaultTemplate];
    }));
  }, [templates, defaultTemplate]);

  const exhibitors = useMemo(() => {
    const map = new Map();
    requests.forEach((request) => {
      const id = getExhibitorId(request);
      if (!id || map.has(id)) return;
      const exhibitor = request.exhibitorId || {};
      map.set(id, {
        id,
        name: getExhibitorName(request),
        registrationId: exhibitor.registrationId || "",
        contact: exhibitor.contact1?.mobile || exhibitor.contact1?.email || "",
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [requests]);

  const requestCountByExhibitor = useMemo(() => requests.reduce((acc, request) => {
    const id = getExhibitorId(request);
    if (!id || !PASS_META[request.passType]) return acc;
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {}), [requests]);

  const selectedExhibitor = exhibitors.find((item) => item.id === selectedExhibitorId);
  const isAllExhibitorsSelected = selectedExhibitorId === "all";

  const filteredExhibitors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exhibitors;
    return exhibitors.filter((item) => [item.name, item.registrationId, item.contact].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [exhibitors, search]);

  const selectedRequests = useMemo(() => requests
    .filter((request) => isAllExhibitorsSelected || getExhibitorId(request) === selectedExhibitorId)
    .filter((request) => PASS_META[request.passType])
    .filter((request) => statusFilter === "all" || request.status === statusFilter)
    .sort((a, b) => {
      if (isAllExhibitorsSelected) {
        const exhibitorSort = getExhibitorName(a).localeCompare(getExhibitorName(b));
        if (exhibitorSort !== 0) return exhibitorSort;
      }
      const foodSort = Number(isFoodPassType(a.passType)) - Number(isFoodPassType(b.passType));
      if (foodSort !== 0) return foodSort;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }), [requests, selectedExhibitorId, statusFilter, isAllExhibitorsSelected]);

  const printItems = useMemo(() => selectedRequests.flatMap((request) => {
    const meta = PASS_META[request.passType];
    if (isFoodPassType(request.passType)) {
      return [{
        id: `${request._id}-food`,
        requestId: request._id,
        passType: request.passType,
        name: getExhibitorName(request),
        category: meta.category,
        status: request.status,
        date: request.createdAt,
        mealQuantity: Math.max(1, Number(request.quantity || 1)),
        foodCouponText: getFoodCouponText(request),
      }];
    }
    return getRequestFallbackNames(request).map((name, index) => ({
      id: `${request._id}-${index}`,
      requestId: request._id,
      passType: request.passType,
      name,
      category: meta.category,
      status: request.status,
      date: request.createdAt,
    }));
  }), [selectedRequests]);

  const printItemKey = useMemo(() => printItems.map((item) => item.id).join("|"), [printItems]);

  useEffect(() => {
    setSelectedPrintIds(printItems.map((item) => item.id));
  }, [selectedExhibitorId, statusFilter, printItemKey]);

  const selectedPrintItems = useMemo(
    () => printItems.filter((item) => selectedPrintIds.includes(item.id)),
    [printItems, selectedPrintIds],
  );

  const normalPrintItems = useMemo(
    () => selectedPrintItems.filter((item) => !isFoodPassType(item.passType)),
    [selectedPrintItems],
  );

  const foodPrintItems = useMemo(
    () => selectedPrintItems.filter((item) => isFoodPassType(item.passType)),
    [selectedPrintItems],
  );

  const groupedRequests = useMemo(() => selectedRequests.reduce((acc, request) => {
    acc[request.passType] = acc[request.passType] || [];
    acc[request.passType].push(request);
    return acc;
  }, {}), [selectedRequests]);

  const stats = useMemo(() => {
    const source = requests.filter((request) => (isAllExhibitorsSelected || getExhibitorId(request) === selectedExhibitorId) && PASS_META[request.passType]);
    return {
      requests: source.length,
      approved: source.filter((request) => request.status === "approved").length,
      printable: selectedPrintItems.length,
      types: new Set(source.map((request) => request.passType)).size,
    };
  }, [requests, selectedExhibitorId, selectedPrintItems.length, isAllExhibitorsSelected]);

  const globalStats = useMemo(() => {
    const printableRequests = requests.filter((request) => PASS_META[request.passType]);
    return {
      exhibitors: exhibitors.length,
      requests: printableRequests.length,
      approved: printableRequests.filter((request) => request.status === "approved").length,
      printable: printableRequests
        .filter((request) => request.status === "approved")
        .reduce((total, request) => total + getRequestFallbackNames(request).length, 0),
    };
  }, [requests, exhibitors.length]);

  const typeSummary = useMemo(() => Object.entries(PASS_META).map(([passType, meta]) => {
    const total = printItems.filter((item) => item.passType === passType).length;
    const selected = selectedPrintItems.filter((item) => item.passType === passType).length;
    return { passType, meta, total, selected };
  }).filter((item) => item.total > 0), [printItems, selectedPrintItems]);

  const printPasses = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${selectedExhibitor?.name || "exhibitor"}-requested-passes`,
    onBeforePrint: () => waitForPrintAssets(printRef.current),
    onAfterPrint: () => setActivePrintMode(""),
  });

  const printFoodCoupons = useReactToPrint({
    contentRef: foodPrintRef,
    documentTitle: `${isAllExhibitorsSelected ? "all-exhibitors" : selectedExhibitor?.name || "exhibitor"}-food-coupons`,
    onBeforePrint: () => waitForPrintAssets(foodPrintRef.current),
    onAfterPrint: () => setActivePrintMode(""),
  });

  const openPrintPrompt = () => {
    if (!normalPrintItems.length) {
      setError("No passes available to print for this selection.");
      return;
    }
    setError("");
    setPrintGapDraft(String(printGapCm));
    setPrintRowGapDraft(String(printRowGapCm));
    setShowPrintGapPrompt(true);
  };

  const printWithGapValue = () => {
    const parsedColumnGap = Number(printGapDraft);
    const parsedRowGap = Number(printRowGapDraft);
    const safeColumnGap = Number.isFinite(parsedColumnGap) ? Math.min(Math.max(parsedColumnGap, 0), 0.8) : 0.7;
    const safeRowGap = Number.isFinite(parsedRowGap) ? Math.min(Math.max(parsedRowGap, 0), 2.1) : 1.3;
    const roundedColumnGap = Math.round(safeColumnGap * 10) / 10;
    const roundedRowGap = Math.round(safeRowGap * 10) / 10;
    setPrintGapCm(roundedColumnGap);
    setPrintGapDraft(String(roundedColumnGap));
    setPrintRowGapCm(roundedRowGap);
    setPrintRowGapDraft(String(roundedRowGap));
    setShowPrintGapPrompt(false);
    setActivePrintMode("passes");
    requestAnimationFrame(() => requestAnimationFrame(() => printPasses()));
  };

  const openFoodPrint = () => {
    if (!foodPrintItems.length) {
      setError("No food coupons available to print for this selection.");
      return;
    }
    setError("");
    setFoodCouponLogoSrc(getStoredFoodCouponLogo().logoSrc);
    setActivePrintMode("food");
    requestAnimationFrame(() => requestAnimationFrame(() => printFoodCoupons()));
  };

  const dataForItem = (item) => ({
    person: { name: item.name },
    pass: { category: item.category },
  });

  const togglePrintItem = (itemId) => {
    setSelectedPrintIds((current) => current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId]);
  };

  const selectExhibitor = (exhibitor) => {
    setSelectedExhibitorId(exhibitor.id);
    setSearch("");
    setShowExhibitorDropdown(false);
  };

  const selectAllExhibitors = () => {
    setSelectedExhibitorId("all");
    setSearch("");
    setShowExhibitorDropdown(false);
  };

  const selectAllPrintItems = () => setSelectedPrintIds(printItems.map((item) => item.id));
  const clearPrintItems = () => setSelectedPrintIds([]);

  const normalPrintPages = Math.ceil(normalPrintItems.length / 8);
  const foodPrintPages = Math.ceil(foodPrintItems.length / FOOD_COUPONS_PER_SHEET);
  const printPages = normalPrintPages || 1;

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-3 md:p-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        .thin-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .thin-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .mixed-pass-print-root { position: fixed; left: -10000px; top: 0; width: 42cm; opacity: 0; pointer-events: none; }
        .food-coupon-print-root { position: fixed; left: -10000px; top: 0; width: 29.7cm; opacity: 0; pointer-events: none; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          ${activePrintMode === "passes" ? `
          @page { size: A3 landscape; margin: 0; }
          .mixed-pass-print-root, .mixed-pass-print-root * { visibility: visible !important; }
          .mixed-pass-print-root { display: block !important; position: absolute; left: 0; top: 0; width: 42cm; opacity: 1; pointer-events: auto; background: #fff; }
          .food-coupon-print-root { display: none !important; }
          ` : ""}
          ${activePrintMode === "food" ? `
          @page { size: A3 portrait; margin: 0; }
          .food-coupon-print-root, .food-coupon-print-root * { visibility: visible !important; }
          .food-coupon-print-root { display: block !important; position: absolute; left: 0; top: 0; width: 29.7cm; opacity: 1; pointer-events: auto; background: #fff; }
          .mixed-pass-print-root { display: none !important; }
          ` : ""}
          .mixed-pass-print-sheet {
            width: 42cm;
            height: 29.65cm;
            padding: 0.8cm;
            box-sizing: border-box;
            display: grid;
            grid-template-columns: repeat(4, 9.5cm);
            grid-template-rows: repeat(2, 13cm);
            column-gap: ${printGapCm}cm;
            row-gap: ${printRowGapCm}cm;
            align-content: start;
            justify-content: start;
            break-after: auto;
            page-break-after: auto;
            overflow: hidden;
          }
          .mixed-pass-print-sheet:not(:first-child) { break-before: page; page-break-before: always; }
          .mixed-pass-print-card { width: 9.5cm; height: 13cm; overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
          .food-coupon-print-sheet {
            width: 29.7cm;
            height: 42cm;
            box-sizing: border-box;
            padding: 0.55cm;
            display: grid;
            grid-template-columns: repeat(2, 14.3cm);
            grid-template-rows: repeat(10, 3.95cm);
            column-gap: 0.1cm;
            row-gap: 0.15cm;
            align-content: start;
            justify-content: start;
            break-after: page;
            page-break-after: always;
            overflow: hidden;
          }
          .food-coupon-print-sheet:last-child { break-after: auto; page-break-after: auto; }
          .food-coupon-print-card { width: 14.3cm; height: 3.95cm; overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      {showPrintGapPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#079fd3] text-white">
                <Printer size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Print Gap</p>
                <p className="text-xs font-bold text-slate-500">Set spacing between printed passes.</p>
              </div>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">Horizontal Gap In CM</span>
              <input
                type="number"
                min="0"
                max="0.8"
                step="0.1"
                value={printGapDraft}
                onChange={(event) => setPrintGapDraft(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-[#079fd3]"
              />
              <span className="mt-1 block text-[10px] font-bold text-slate-400">Default is 0.7cm. Allowed range: 0 to 0.8cm.</span>
            </label>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {[0, 0.1, 0.7, 0.8].map((gap) => (
                <button
                  key={gap}
                  type="button"
                  onClick={() => setPrintGapDraft(String(gap))}
                  className={`h-9 rounded-xl border px-3 text-xs font-black ${Number(printGapDraft) === gap
                      ? "border-[#079fd3] bg-cyan-50 text-[#079fd3]"
                      : "border-slate-200 bg-white text-slate-600"
                    }`}
                >
                  {gap}cm
                </button>
              ))}
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">Vertical Gap In CM</span>
              <input
                type="number"
                min="0"
                max="2.1"
                step="0.1"
                value={printRowGapDraft}
                onChange={(event) => setPrintRowGapDraft(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-[#079fd3]"
              />
              <span className="mt-1 block text-[10px] font-bold text-slate-400">Default is 1.3cm. Allowed range: 0 to 2.1cm.</span>
            </label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {[0, 0.5, 1.3, 2.1].map((gap) => (
                <button
                  key={gap}
                  type="button"
                  onClick={() => setPrintRowGapDraft(String(gap))}
                  className={`h-9 rounded-xl border px-3 text-xs font-black ${Number(printRowGapDraft) === gap
                      ? "border-[#079fd3] bg-cyan-50 text-[#079fd3]"
                      : "border-slate-200 bg-white text-slate-600"
                    }`}
                >
                  {gap}cm
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={printWithGapValue}
                className="h-11 rounded-xl bg-[#23471d] px-4 text-xs font-black text-white"
              >
                Print with selected gaps
              </button>
              <button
                type="button"
                onClick={() => setShowPrintGapPrompt(false)}
                className="h-10 rounded-xl text-xs font-black text-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#016B61] text-white">
              <Printer size={15} />
            </div>
            <h1 className="text-lg font-black text-[#15173D]">Exhibitor Requested Passes</h1>
            <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-[#016B61]">
              Mixed Print
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            Select an exhibitor, review requested pass names, and print all pass types in one A3 job.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: "Exhibitors", value: globalStats.exhibitors, icon: Users, tone: "bg-indigo-50 text-indigo-700", sub: "with pass requests" },
          { label: "Requests", value: globalStats.requests, icon: Ticket, tone: "bg-sky-50 text-sky-700", sub: "printable pass types" },
          { label: "Approved", value: globalStats.approved, icon: ShieldCheck, tone: "bg-emerald-50 text-emerald-700", sub: "ready for print" },
          { label: "Pass Names", value: globalStats.printable, icon: Layers3, tone: "bg-amber-50 text-amber-700", sub: "approved names" },
        ].map(({ label, value, icon: Icon, tone, sub }) => (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 shadow-sm">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone}`}>
              <Icon size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase text-slate-400">{label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-base font-black leading-tight text-[#15173D]">{value}</p>
                <p className="hidden truncate text-[9px] font-semibold text-slate-400 sm:block">{sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</div>}

      <div>
        <main className="space-y-2.5">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-white px-3 py-2">
              <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(260px,420px)_1fr] xl:items-center">
                <div className="relative">
                  <p className="mb-1 text-[9px] font-black uppercase tracking-wide text-slate-400">Select Exhibitor</p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      value={search}
                      onFocus={() => {
                        setSearch("");
                        setShowExhibitorDropdown(true);
                      }}
                      onClick={() => {
                        setSearch("");
                        setShowExhibitorDropdown(true);
                      }}
                      onBlur={() => window.setTimeout(() => setShowExhibitorDropdown(false), 120)}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setShowExhibitorDropdown(true);
                      }}
                      placeholder="Search exhibitor..."
                      className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-[11px] font-bold text-slate-800 outline-none transition focus:border-[#016B61] focus:bg-white"
                    />
                  </div>
                  <p className="mt-1 truncate text-[10px] font-bold text-slate-500">
                    {isAllExhibitorsSelected ? "Selected: All exhibitors" : selectedExhibitor ? `Selected: ${selectedExhibitor.name}` : "No exhibitor selected"}
                  </p>
                  {showExhibitorDropdown && (
                    <div className="thin-scrollbar absolute left-0 right-0 top-[68px] z-30 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                      {loading ? (
                        <div className="px-3 py-6 text-center text-[11px] font-black text-slate-400">Loading exhibitors...</div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={selectAllExhibitors}
                            className={`mb-1 flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left transition ${isAllExhibitorsSelected ? "bg-emerald-50 text-[#016B61]" : "hover:bg-slate-50"}`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-[11px] font-black text-slate-900">All Exhibitors</span>
                              <span className="block truncate text-[9px] font-bold text-slate-400">Print selected requests from every exhibitor</span>
                            </span>
                            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-500">
                              {globalStats.requests}
                            </span>
                          </button>
                          {filteredExhibitors.length === 0 ? (
                            <div className="px-3 py-6 text-center text-[11px] font-black text-slate-400">No exhibitors found.</div>
                          ) : filteredExhibitors.map((exhibitor) => (
                            <button
                              key={exhibitor.id}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => selectExhibitor(exhibitor)}
                              className={`mb-1 flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left transition ${selectedExhibitorId === exhibitor.id ? "bg-emerald-50 text-[#016B61]" : "hover:bg-slate-50"
                                }`}
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-[11px] font-black text-slate-900">{exhibitor.name}</span>
                                <span className="block truncate text-[9px] font-bold text-slate-400">{[exhibitor.registrationId, exhibitor.contact].filter(Boolean).join(" | ") || "No contact details"}</span>
                              </span>
                              <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-500">
                                {requestCountByExhibitor[exhibitor.id] || 0}
                              </span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    ["Requests", stats.requests],
                    ["Approved", stats.approved],
                    ["Pass Types", stats.types],
                    ["To Print", stats.printable],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-[64px] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                      <p className="text-[8.5px] font-black uppercase text-slate-400">{label}</p>
                      <p className="text-sm font-black leading-tight text-[#15173D]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 bg-slate-50/80 px-3 py-1.5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-black text-slate-700 outline-none focus:border-[#016B61]"
                >
                  <option value="approved">Approved only</option>
                  <option value="all">All statuses</option>
                  <option value="pending">Pending only</option>
                  <option value="rejected">Rejected only</option>
                </select>
                <span className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-500">
                  {normalPrintItems.length} passes | {foodPrintItems.length} food coupons | {printPages} pass sheet{printPages === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAllPrintItems}
                  disabled={!printItems.length || selectedPrintItems.length === printItems.length}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearPrintItems}
                  disabled={!selectedPrintItems.length}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={openPrintPrompt}
                  disabled={!normalPrintItems.length}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#124170] px-3 text-[11px] font-bold text-white transition hover:bg-[#0A2643] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Printer size={13} />
                  Print {normalPrintItems.length || 0} Passes
                </button>
                <button
                  type="button"
                  onClick={openFoodPrint}
                  disabled={!foodPrintItems.length}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#083ef5] px-3 text-[11px] font-bold text-white transition hover:bg-[#002fc7] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Utensils size={13} />
                  Print {foodPrintItems.length || 0} Food Coupons
                </button>
              </div>
            </div>
          </section>

          {typeSummary.length > 0 && (
            <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
              {typeSummary.map(({ passType, meta, total, selected }) => {
                const Icon = meta.icon;
                return (
                  <div key={passType} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${meta.tone}`}>
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-black text-[#15173D]">{meta.label}</p>
                        <p className="text-[9px] font-semibold text-slate-400">selected</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">{selected}/{total}</span>
                  </div>
                );
              })}
            </section>
          )}

          {Object.keys(groupedRequests).length === 0 ? (
            <section className="rounded-xl border border-slate-200 bg-white py-10 text-center shadow-sm">
              <Ticket className="mx-auto mb-2 text-slate-300" size={32} />
              <p className="text-sm font-black text-[#15173D]">No passes found for this selection.</p>
              <p className="mt-1 text-xs font-bold text-slate-400">Change the status filter or choose another exhibitor.</p>
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-2 lg:grid-cols-3">
              {Object.entries(groupedRequests).map(([passType, items]) => {
                const meta = PASS_META[passType];
                const Icon = meta.icon;
                const names = items.flatMap(getRequestFallbackNames);
                return (
                  <div key={passType} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${meta.tone}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-xs font-black text-[#15173D]">{meta.label} Passes</h3>
                          <p className="text-[10px] font-bold leading-tight text-slate-500">{items.length} request{items.length === 1 ? "" : "s"} | {names.length} item{names.length === 1 ? "" : "s"}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-600 shadow-sm ring-1 ring-slate-200">{meta.category}</span>
                    </div>
                    <div className="thin-scrollbar h-[200px] overflow-auto">
                      {items.map((request) => {
                        const requestNames = getRequestFallbackNames(request);
                        return (
                          <div key={request._id} className="border-b border-slate-100 px-2 py-1.5 last:border-b-0">
                            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
                              <div className="flex shrink-0 items-center gap-1">
                                <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-black uppercase leading-none ${STATUS_STYLES[request.status] || STATUS_STYLES.pending}`}>
                                  {request.status || "pending"}
                                </span>
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-black uppercase leading-none text-slate-500">
                                  Qty {request.quantity || requestNames.length || 1}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {requestNames.map((name, index) => {
                                  const itemId = isFoodPassType(request.passType) ? `${request._id}-food` : `${request._id}-${index}`;
                                  const selected = selectedPrintIds.includes(itemId);
                                  return (
                                    <label
                                      key={itemId}
                                      className={`flex min-h-[28px] cursor-pointer items-center gap-1.5 rounded border px-2 py-1 transition ${selected
                                          ? "border-emerald-200 bg-emerald-50 text-slate-900"
                                          : "border-slate-200 bg-white text-slate-400"
                                        }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => togglePrintItem(itemId)}
                                        className="h-3.5 w-3.5 shrink-0 accent-[#016B61]"
                                      />
                                      <span className="text-xs font-black leading-tight whitespace-nowrap" title={name}>{name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[10px] font-bold text-slate-400">
                                <Clock3 size={11} />
                                {formatDate(request.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      </div>

      <div ref={printRef} className="mixed-pass-print-root">
        {Array.from({ length: normalPrintPages }).map((_, pageIndex) => {
          const pageItems = normalPrintItems.slice(pageIndex * 8, pageIndex * 8 + 8);
          return (
            <div key={pageIndex} className="mixed-pass-print-sheet">
              {pageItems.map((item) => (
                <div key={item.id} className="mixed-pass-print-card">
                  <PassTemplateCanvas
                    template={templateByPassType[item.passType] || defaultTemplate}
                    data={dataForItem(item)}
                    scale={PRINT_SCALE}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div ref={foodPrintRef} className="food-coupon-print-root">
        {Array.from({ length: foodPrintPages }).map((_, pageIndex) => {
          const pageItems = foodPrintItems.slice(pageIndex * FOOD_COUPONS_PER_SHEET, pageIndex * FOOD_COUPONS_PER_SHEET + FOOD_COUPONS_PER_SHEET);
          return (
            <div key={`food-${pageIndex}`} className="food-coupon-print-sheet">
              {pageItems.map((item) => (
                <div key={item.id} className="food-coupon-print-card">
                  <FoodCouponCanvas persons={item.foodCouponText || "1 PACKED LUNCH"} logoSrc={foodCouponLogoSrc} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
