import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useLocation } from "react-router-dom";
import {
  Check,
  FileText,
  LayoutGrid,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import api from "../lib/api";
import PassTemplateCanvas from "../components/passes/PassTemplateCanvas";

const PASS_CONFIG = {
  media: { title: "Media Passes", category: "MEDIA", templateNames: ["media"] },
  speaker: { title: "Speaker Passes", category: "SPEAKER", templateNames: ["speaker", "delegate"] },
  organizer: { title: "Organizer Passes", category: "ORGANIZER", templateNames: ["organizer"] },
  exhibitor: { title: "Exhibitor Passes", category: "EXHIBITOR", templateNames: ["exhibitor"] },
  service: { title: "Service Passes", category: "SERVICE", templateNames: ["service", "service provider", "service_provider"] },
  vehicle: { title: "Vehicle Passes", category: "VEHICLE", templateNames: ["vehicle"] },
  visitor: { title: "Visitor Passes", category: "VISITOR", templateNames: ["visitor"] },
};

const PER_PAGE_OPTIONS = [1, 2, 4, 6, 8];
const TEMPLATE_CANVAS_WIDTH = 1122;
const PRINT_8_CARD_WIDTH_CM = 9.5;
const PRINT_8_CARD_HEIGHT_CM = 13;
const PRINT_8_SCALE = (PRINT_8_CARD_WIDTH_CM * 96 / 2.54) / TEMPLATE_CANVAS_WIDTH;
const PRINT_SCALE_BY_COUNT = {
  1: 0.47,
  2: 0.37,
  4: 0.3,
  6: 0.325,
  8: PRINT_8_SCALE,
};
const PRINT_WIDTH_BY_COUNT = {
  1: "140mm",
  2: "110mm",
  4: "90mm",
  6: "97mm",
  8: `${PRINT_8_CARD_WIDTH_CM}cm`,
};
const PRINT_SLOT_BY_COUNT = {
  1: { width: "191.2mm", height: "140mm" },
  2: { width: "150.3mm", height: "110mm" },
  4: { width: "123mm", height: "90mm" },
  6: { width: "132.6mm", height: "97mm" },
  8: { width: `${PRINT_8_CARD_WIDTH_CM}cm`, height: `${PRINT_8_CARD_HEIGHT_CM}cm` },
};
const PRINT_COLUMNS_BY_COUNT = {
  1: 1,
  2: 1,
  4: 2,
  6: 2,
  8: 4,
};

const parseNames = (value) => String(value || "")
  .split(/[\n,]+/)
  .map((name) => name.trim())
  .filter(Boolean);

const uniqRows = (rows) => {
  const seen = new Set();
  return rows.filter((row) => {
    const key = String(row.name || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const makeRow = (name) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name,
  selected: true,
});

const freshRows = () => [makeRow("")];

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
        // Browser print preview can still use the loaded image if decode rejects.
      }
    }
  }));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};

const templateMatchesType = (template, typeNames) => {
  const values = [...(template?.passTypes || []), ...(template?.categories || [])]
    .map((item) => String(item || "").toLowerCase().replace(/-/g, " ").replace(/_/g, " ").trim());
  return typeNames.some((name) => values.includes(name.replace(/_/g, " ")));
};

export default function PassGeneratorPage({ passType = "organizer" }) {
  const config = PASS_CONFIG[passType] || PASS_CONFIG.organizer;
  const location = useLocation();
  const printRef = useRef(null);
  const appliedPrefillKeyRef = useRef("");
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState(null);
  const [batches, setBatches] = useState([]);
  const [activeBatchId, setActiveBatchId] = useState("");
  const [batchTitle, setBatchTitle] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [nameRows, setNameRows] = useState(freshRows());
  const [passesPerPage, setPassesPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showPrintGapPrompt, setShowPrintGapPrompt] = useState(false);
  const [printGapCm, setPrintGapCm] = useState(0.7);
  const [printGapDraft, setPrintGapDraft] = useState("0.7");
  const [printRowGapCm, setPrintRowGapCm] = useState(1.3);
  const [printRowGapDraft, setPrintRowGapDraft] = useState("1.3");
  const previewBoxRef = useRef(null);
  const [previewBoxWidth, setPreviewBoxWidth] = useState(0);

  const selectedRows = useMemo(() => nameRows.filter((row) => row.selected && row.name.trim()), [nameRows]);
  const printRows = selectedRows.length ? selectedRows : nameRows.filter((row) => row.name.trim());
  const hasTypeTemplate = useMemo(() => templateMatchesType(template, config.templateNames), [template, config.templateNames]);
  const previewScale = useMemo(() => {
    const canvasWidth = Number(template?.canvas?.width || TEMPLATE_CANVAS_WIDTH);
    const availableWidth = Math.max((previewBoxWidth || 0) - 24, 0);
    if (!availableWidth || !canvasWidth) return 0.24;
    return Math.min(0.24, Math.max(0.12, availableWidth / canvasWidth));
  }, [template, previewBoxWidth]);

  useEffect(() => {
    const node = previewBoxRef.current;
    if (!node) return undefined;

    const updatePreviewWidth = () => setPreviewBoxWidth(node.clientWidth || 0);
    updatePreviewWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updatePreviewWidth);
      return () => window.removeEventListener("resize", updatePreviewWidth);
    }

    const observer = new ResizeObserver(updatePreviewWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const [templateRes, batchRes] = await Promise.all([
        api.get("/api/pass-templates"),
        api.get(`/api/generated-passes?passType=${passType}`),
      ]);
      const allTemplates = templateRes.data.data || [];
      const typeBatches = (batchRes.data.data || []).filter((batch) => batch.passType === passType);
      const activeTypeTemplates = allTemplates.filter((item) => item.isActive !== false && templateMatchesType(item, config.templateNames));
      const selectedTemplate = activeTypeTemplates.find((item) => !item.isDefault)
        || activeTypeTemplates[0]
        || allTemplates.find((item) => item.isDefault)
        || allTemplates[0]
        || (await api.get("/api/pass-templates/default")).data.data;
      setTemplates(allTemplates);
      setTemplate(selectedTemplate);
      setBatches(typeBatches);
      setActiveBatchId("");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load passes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveBatchId("");
    setBatchTitle("");
    setBulkNames("");
    setNameRows(freshRows());
    setPassesPerPage(8);
    load();
  }, [passType]);

  useEffect(() => {
    const prefill = location.state?.prefillPasses;
    if (!prefill || prefill.passType !== passType || loading) return;

    const names = Array.isArray(prefill.names)
      ? prefill.names.map((name) => String(name || "").trim()).filter(Boolean)
      : parseNames(prefill.names);
    const prefillKey = `${passType}:${prefill.sourceId || ""}:${names.join("|")}`;
    if (!names.length || appliedPrefillKeyRef.current === prefillKey) return;

    appliedPrefillKeyRef.current = prefillKey;
    setActiveBatchId("");
    setBatchTitle(prefill.title || "");
    setBulkNames("");
    setNameRows(uniqRows(names.map(makeRow)));
    setPassesPerPage(8);
    setStatus(prefill.message || `Loaded ${names.length} ${config.category} pass${names.length === 1 ? "" : "es"} from exhibitor request.`);
  }, [location.state, passType, loading, config.category]);

  const handleAddBulkNames = () => {
    const parsed = parseNames(bulkNames).map(makeRow);
    if (!parsed.length) return;
    setNameRows((prev) => uniqRows([...prev.filter((row) => row.name.trim()), ...parsed]));
    setBulkNames("");
  };

  const updateRow = (id, changes) => {
    setNameRows((prev) => prev.map((row) => row.id === id ? { ...row, ...changes } : row));
  };

  const removeRow = (id) => {
    setNameRows((prev) => prev.filter((row) => row.id !== id));
  };

  const selectBatch = async (batchId) => {
    if (!batchId) {
      setActiveBatchId("");
      setBatchTitle("");
      setNameRows(freshRows());
      setPassesPerPage(8);
      return;
    }

    setError("");
    setStatus("");
    try {
      const res = await api.get(`/api/generated-passes/${batchId}`);
      const batch = res.data.data;
      if (batch.passType !== passType) {
        setError("This saved batch belongs to another pass type.");
        return;
      }
      setActiveBatchId(batch._id);
      setBatchTitle(batch.title || "");
      setNameRows((batch.names || []).map((row) => ({ id: row._id || `${Date.now()}-${row.name}`, name: row.name, selected: row.selected !== false })));
      setPassesPerPage(8);
      if (batch.templateId) {
        const batchTemplateId = typeof batch.templateId === "object" ? batch.templateId._id : batch.templateId;
        const matchedTemplate = templates.find((item) => item._id === batchTemplateId)
          || (typeof batch.templateId === "object" ? batch.templateId : null);
        if (matchedTemplate) setTemplate(matchedTemplate);
      }
      setStatus(`Loaded batch: ${batch.title || new Date(batch.updatedAt).toLocaleString()}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load saved batch");
    }
  };

  const saveBatch = async () => {
    if (!template?._id) {
      setError("Template missing. Save/select template first.");
      return;
    }
    const cleanRows = nameRows.filter((row) => row.name.trim()).map((row) => ({ name: row.name.trim(), selected: row.selected }));
    if (!cleanRows.length) {
      setError("Add at least one name before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setStatus("");
    try {
      const payload = {
        title: batchTitle || `${config.title} - ${new Date().toLocaleDateString()}`,
        passType,
        categoryLabel: config.category,
        templateId: template._id,
        names: cleanRows,
        printSettings: { passesPerPage },
      };
      const res = activeBatchId
        ? await api.put(`/api/generated-passes/${activeBatchId}`, payload)
        : await api.post("/api/generated-passes", payload);
      setActiveBatchId(res.data.data._id);
      setBatchTitle(res.data.data.title || "");
      setStatus("Pass batch saved successfully.");
      const batchRes = await api.get(`/api/generated-passes?passType=${passType}`);
      setBatches((batchRes.data.data || []).filter((batch) => batch.passType === passType));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save pass batch");
    } finally {
      setSaving(false);
    }
  };

  const printPasses = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${config.title}-${new Date().toISOString().slice(0, 10)}`,
    onBeforePrint: () => waitForPrintAssets(printRef.current),
  });

  const openPrintPrompt = () => {
    if (passesPerPage === 8) {
      setPrintGapDraft(String(printGapCm));
      setPrintRowGapDraft(String(printRowGapCm));
      setShowPrintGapPrompt(true);
      return;
    }
    printPasses();
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
    requestAnimationFrame(() => requestAnimationFrame(() => printPasses()));
  };

  const dataForName = (name) => ({
    person: { name },
    pass: { category: config.category },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="mx-auto animate-spin text-[#23471d]" size={28} />
          <p className="mt-3 text-sm font-black text-slate-400">Loading {config.title}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 p-4 md:p-6">
      <style>{`
        .pass-print-root { position: fixed; left: -10000px; top: 0; width: ${passesPerPage === 8 ? "42cm" : "297mm"}; opacity: 0; pointer-events: none; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; width: ${passesPerPage === 8 ? "42cm" : "297mm"} !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          .pass-print-root, .pass-print-root * { visibility: visible !important; }
          .pass-print-root { display: block !important; position: absolute; left: 0; top: 0; width: ${passesPerPage === 8 ? "42cm" : "297mm"}; opacity: 1; pointer-events: auto; background: #fff; }
          @page { size: ${passesPerPage === 8 ? "A3 landscape" : "A3 portrait"}; margin: 0; }
          .pass-print-sheet { break-after: page; page-break-after: always; break-inside: avoid; page-break-inside: avoid; display: grid; align-items: center; justify-items: center; box-sizing: border-box; overflow: hidden; }
          .pass-print-sheet--generic { gap: 4mm 4mm; align-content: center; justify-content: center; width: 297mm; height: 420mm; padding: 2.65mm; }
          .pass-print-sheet--exact-eight { width: 42cm; height: 29.7cm; padding: 0.8cm; column-gap: ${printGapCm}cm; row-gap: ${printRowGapCm}cm; align-content: start; justify-content: start; grid-template-columns: repeat(4, 9.5cm) !important; grid-template-rows: repeat(2, 13cm) !important; }
          .pass-print-sheet:last-child { break-after: auto; page-break-after: auto; }
          .pass-print-slot { width: var(--pass-slot-width); height: var(--pass-slot-height); break-inside: avoid; page-break-inside: avoid; position: relative; overflow: visible; }
          .pass-print-card { position: absolute; left: 50%; top: 50%; width: var(--pass-print-width); aspect-ratio: 1122 / 1533; overflow: hidden; display: flex; align-items: flex-start; justify-content: flex-start; transform: translate(-50%, -50%) rotate(90deg); transform-origin: center center; }
          .pass-print-card--exact-eight { position: static; left: auto; top: auto; width: 9.5cm; height: 13cm; aspect-ratio: 9.5 / 13; transform: none; }
        }
      `}</style>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#23471d] text-white">
              <FileText size={19} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{config.title}</h1>
              <p className="text-xs font-bold text-slate-500">Add multiple names, then save and print individual passes.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={load} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700">
            <RefreshCw size={15} /> Reload
          </button>
          <button type="button" onClick={saveBatch} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#23471d] px-4 text-xs font-black text-white disabled:opacity-60">
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />} Save Batch
          </button>
          <button type="button" onClick={openPrintPrompt} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#079fd3] px-4 text-xs font-black text-white">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {showPrintGapPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#079fd3] text-white">
                <Printer size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Print Gap</p>
                <p className="text-xs font-bold text-slate-500">Set the horizontal and vertical gaps between passes.</p>
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
            <div className="mb-3 grid grid-cols-2 gap-2">
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

      {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{error}</div>}
      {status && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">{status}</div>}
      {!hasTypeTemplate && template && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
          "{template.name}" template {config.title}
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,360px)_minmax(0,1fr)_minmax(240px,300px)]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-black text-slate-900">Batch Setup</p>
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">Batch Name</span>
              <input
                value={batchTitle}
                onChange={(event) => setBatchTitle(event.target.value)}
                placeholder={`${config.title} batch`}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-[#23471d]"
              />
            </label>
            <div className="mt-3">
              <label>
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">Passes Per Page</span>
                <select
                  value={passesPerPage}
                  onChange={(event) => setPassesPerPage(Number(event.target.value))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black outline-none"
                >
                  {PER_PAGE_OPTIONS.map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">Auto Selected Template</span>
                <p className="truncate text-xs font-black text-slate-700">{template?.name || "Default template"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-slate-900">Saved Batches</p>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{batches.length}</span>
            </div>
            <select
              value={activeBatchId}
              onChange={(event) => selectBatch(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black outline-none"
            >
              <option value="">New batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.title || new Date(batch.updatedAt).toLocaleString()} ({batch.names?.length || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Users size={16} className="text-[#23471d]" />
              <p className="text-sm font-black text-slate-900">Add Multiple Names</p>
            </div>
            <textarea
              value={bulkNames}
              onChange={(event) => setBulkNames(event.target.value)}
              placeholder="Enter one name per line, or paste comma-separated names"
              className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none focus:border-[#23471d]"
            />
            <button type="button" onClick={handleAddBulkNames} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-black text-white">
              <Plus size={15} /> Add Names
            </button>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-black text-slate-900">Names</p>
              <p className="text-[11px] font-bold text-slate-500">{selectedRows.length || nameRows.length} passes ready for print.</p>
            </div>
            <button type="button" onClick={() => setNameRows((prev) => [...prev, makeRow("")])} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700">
              <Plus size={14} /> Row
            </button>
          </div>
          <div className="max-h-[540px] space-y-2 overflow-auto pr-1">
            {nameRows.map((row, index) => (
              <div key={row.id} className="grid min-w-0 grid-cols-[34px_minmax(0,1fr)_36px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <input
                  type="checkbox"
                  checked={row.selected}
                  onChange={(event) => updateRow(row.id, { selected: event.target.checked })}
                  className="h-4 w-4"
                  title="Select for print"
                />
                <input
                  value={row.name}
                  onChange={(event) => updateRow(row.id, { name: event.target.value })}
                  placeholder={`Name ${index + 1}`}
                  className="min-w-0 h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-[#23471d]"
                />
                <button type="button" onClick={() => removeRow(row.id)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <LayoutGrid size={16} className="text-[#23471d]" />
            <p className="text-sm font-black text-slate-900">Preview</p>
          </div>
          {template ? (
            <div ref={previewBoxRef} className="flex w-full min-w-0 justify-center overflow-hidden rounded-xl bg-slate-100 p-3">
              <PassTemplateCanvas
                template={template}
                data={dataForName(printRows[0]?.name || "Sample Name")}
                scale={previewScale}
                className="shadow-lg"
              />
            </div>
          ) : (
            <p className="text-xs font-bold text-slate-400">Template not found.</p>
          )}
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">
            <Check size={13} className="mr-1 inline text-[#23471d]" />
            Print selected names.
          </div>
        </div>
      </div>

      <div ref={printRef} className="pass-print-root">
        {Array.from({ length: Math.ceil(printRows.length / passesPerPage) || 1 }).map((_, pageIndex) => {
          const pageRows = printRows.slice(pageIndex * passesPerPage, pageIndex * passesPerPage + passesPerPage);
          const isExactEightLayout = passesPerPage === 8;
          const columns = PRINT_COLUMNS_BY_COUNT[passesPerPage] || 2;
          const rows = Math.ceil(pageRows.length / columns) || 1;
          const passWidth = PRINT_WIDTH_BY_COUNT[passesPerPage] || PRINT_WIDTH_BY_COUNT[2];
          const slot = PRINT_SLOT_BY_COUNT[passesPerPage] || PRINT_SLOT_BY_COUNT[2];
          const printScale = PRINT_SCALE_BY_COUNT[passesPerPage] || PRINT_SCALE_BY_COUNT[2];
          return (
            <div
              key={pageIndex}
              className={`pass-print-sheet ${isExactEightLayout ? "pass-print-sheet--exact-eight" : "pass-print-sheet--generic"}`}
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, max-content)`,
              }}
            >
              {pageRows.map((row) => (
                <div
                  key={row.id}
                  className="pass-print-slot"
                  style={{
                    "--pass-print-width": passWidth,
                    "--pass-slot-width": slot.width,
                    "--pass-slot-height": slot.height,
                  }}
                >
                  <div className={`pass-print-card ${isExactEightLayout ? "pass-print-card--exact-eight" : ""}`}>
                    <PassTemplateCanvas template={template} data={dataForName(row.name)} scale={printScale} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
