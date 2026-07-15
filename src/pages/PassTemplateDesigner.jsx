import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CirclePlus,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Lock,
  RefreshCw,
  Save,
  Trash2,
  Type,
  Unlock,
  Upload,
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";

const PASS_TEMPLATE_TYPES = ["Media", "Speaker", "Organizer", "Exhibitor", "Service", "Vehicle", "Visitor"];

const SAMPLE_DATA = {
  "{{person.name}}": "Vijay Sharma",
  "{{pass.category}}": "ORGANIZER",
};

const assetSrc = (url) => !url ? "" : url.startsWith("http") ? url : `${SERVER_URL}${url}`;
const slugify = (value) => String(value || "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export default function PassTemplateDesigner() {
  const savingRef = useRef(false);
  const [template, setTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [previewScale, setPreviewScale] = useState(0.34);
  const [selectedTemplateType, setSelectedTemplateType] = useState("Organizer");

  const refreshTemplates = async () => {
    const res = await api.get("/api/pass-templates");
    setTemplates(res.data.data || []);
    return res.data.data || [];
  };

  const load = async (templateId = "") => {
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const allTemplates = await refreshTemplates();
      const next = templateId
        ? allTemplates.find(item => item._id === templateId)
        : allTemplates.find(item => item.isDefault) || allTemplates[0] || (await api.get("/api/pass-templates/default")).data.data;
      setTemplate(next);
      setSelectedTemplateType(next?.categories?.[0] || next?.passTypes?.[0] || "Organizer");
      setSelectedLayerId(next?.layers?.find(layer => layer.id === "pass-background-image")?.id || next?.layers?.[0]?.id || "");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load pass template");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selectedLayer = useMemo(
    () => (template?.layers || []).find(layer => layer.id === selectedLayerId),
    [template, selectedLayerId],
  );
  const backgroundLayer = useMemo(
    () => (template?.layers || []).find(layer => layer.id === "pass-background-image"),
    [template],
  );

  const updateTemplate = (updater) => {
    setTemplate(prev => typeof updater === "function" ? updater(prev) : { ...prev, ...updater });
  };

  const updateLayer = (layerId, changes) => {
    updateTemplate(prev => ({
      ...prev,
      layers: (prev.layers || []).map(layer => layer.id === layerId ? { ...layer, ...changes } : layer),
    }));
  };

  const updateLayerStyle = (layerId, key, value) => {
    updateTemplate(prev => ({
      ...prev,
      layers: (prev.layers || []).map(layer => layer.id === layerId
        ? { ...layer, style: { ...(layer.style || {}), [key]: value } }
        : layer),
    }));
  };

  const save = async () => {
    if (!template?._id || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await api.put(`/api/pass-templates/${template._id}`, template);
      setTemplate(res.data.data);
      await refreshTemplates();
      setStatus(`Saved: ${res.data.data.name}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save template");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const saveAsType = async () => {
    if (!template || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const type = selectedTemplateType || "Organizer";
      const typeSlug = slugify(type);
      const nextSlug = `${typeSlug}-pass-template`;
      const existing = templates.find(item => item.slug === nextSlug);
      const templateCopy = JSON.parse(JSON.stringify(template));
      const payload = {
        ...templateCopy,
        _id: undefined,
        id: undefined,
        name: `${type} Pass Template`,
        slug: nextSlug,
        isDefault: false,
        templateVersion: Number(template.templateVersion || 1),
        passTypes: [typeSlug],
        categories: [type],
      };
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;
      const res = existing
        ? await api.put(`/api/pass-templates/${existing._id}`, payload)
        : await api.post("/api/pass-templates", payload);
      setTemplate(res.data.data);
      await refreshTemplates();
      setStatus(`${existing ? "Updated" : "Created"} separate template: ${res.data.data.name}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to create separate template");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const uploadAsset = async (file, layerId) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("asset", file);

    const dimensions = await new Promise(resolve => {
      if (file.type === "image/svg+xml") return resolve({ width: 0, height: 0 });
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });

    const res = await api.post("/api/pass-templates/upload-asset", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const uploaded = res.data.data;
    const warnings = [...(uploaded.warnings || [])];
    if (layerId === "pass-background-image" && (dimensions.width !== 1122 || dimensions.height !== 1533)) {
      warnings.push(`Recommended background size is exactly 1122 x 1533 px. Uploaded ${dimensions.width || "?"} x ${dimensions.height || "?"} px.`);
    }

    updateLayer(layerId, {
      ...(layerId === "pass-background-image" ? {
        x: 0,
        y: 0,
        width: 1122,
        height: 1533,
        objectFit: "cover",
        objectPosition: "center",
        padding: 0,
        border: "none",
        borderRadius: 0,
        backgroundColor: "transparent",
      } : {}),
      assetUrl: uploaded.url,
      assetName: uploaded.originalName,
      quality: {
        width: dimensions.width,
        height: dimensions.height,
        dpi: 0,
        fileType: uploaded.fileType,
        fileSize: uploaded.fileSize,
        warnings,
      },
    });
  };

  const updateLogoGroup = (groupId, changes) => {
    updateTemplate(prev => ({
      ...prev,
      logoGroups: (prev.logoGroups || []).map(group => group.id === groupId ? { ...group, ...changes } : group),
    }));
  };

  const updateLogo = (groupId, logoId, changes) => {
    updateTemplate(prev => ({
      ...prev,
      logoGroups: (prev.logoGroups || []).map(group => group.id === groupId ? {
        ...group,
        logos: (group.logos || []).map(logo => logo.id === logoId ? { ...logo, ...changes } : logo),
      } : group),
    }));
  };

  const addLogo = (groupId) => {
    const logo = {
      id: `logo-${Date.now()}`,
      name: "New Logo",
      type: "logo",
      assetUrl: "",
      visible: true,
      x: 0,
      y: 0,
      width: 90,
      height: 38,
      padding: 3,
      border: "1px dashed #cbd5e1",
      borderRadius: 4,
      backgroundColor: "transparent",
      objectFit: "contain",
      objectPosition: "center",
      opacity: 1,
      rotation: 0,
      scalePercent: 100,
      zIndex: 1,
      quality: { warnings: [] },
    };
    updateTemplate(prev => ({
      ...prev,
      logoGroups: (prev.logoGroups || []).map(group => group.id === groupId ? { ...group, logos: [...(group.logos || []), logo] } : group),
    }));
  };

  const uploadLogoAsset = async (file, groupId, logoId) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("asset", file);
    const res = await api.post("/api/pass-templates/upload-asset", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const uploaded = res.data.data;
    updateLogo(groupId, logoId, {
      assetUrl: uploaded.url,
      assetName: uploaded.originalName,
      quality: {
        width: 0,
        height: 0,
        dpi: 0,
        fileType: uploaded.fileType,
        fileSize: uploaded.fileSize,
        warnings: uploaded.warnings || [],
      },
    });
  };

  const sortedLayers = useMemo(
    () => [...(template?.layers || [])].sort((a, b) => Number(a.zIndex || 0) - Number(b.zIndex || 0)),
    [template],
  );

  const visibleLayers = sortedLayers.filter(layer => layer.visible !== false);
  const canvas = template?.canvas || { width: 1122, height: 1533, backgroundColor: "#ffffff", safeArea: { top: 28, right: 28, bottom: 28, left: 28 } };

  const renderText = (text) => Object.entries(SAMPLE_DATA).reduce(
    (value, [key, replacement]) => value.replaceAll(key, replacement),
    String(text || ""),
  );

  const n = (label, value, onChange, step = 1) => (
    <label className="block">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</span>
      <input
        type="number"
        step={step}
        value={value ?? 0}
        onChange={event => onChange(Number(event.target.value))}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none focus:border-[#23471d]"
      />
    </label>
  );

  const renderLogoGroup = (groupId) => {
    const group = (template?.logoGroups || []).find(item => item.id === groupId);
    if (!group || group.visible === false) return null;

    return (
      <div className="h-full w-full" style={{ padding: Number(group.padding || 0), border: group.border || "none", backgroundColor: group.backgroundColor || "transparent" }}>
        {group.title && (
          <div style={{ fontSize: group.titleFontSize, fontWeight: group.titleFontWeight, color: group.titleColor, textAlign: group.alignment || "center", lineHeight: 1 }}>
            {group.title}
          </div>
        )}
        <div
          className="relative"
          style={{
            display: group.manualPlacement ? "block" : "grid",
            gridTemplateColumns: group.manualPlacement ? undefined : `repeat(${Number(group.logosPerRow || 1)}, minmax(0, 1fr))`,
            gap: `${Number(group.rowGap || 6)}px ${Number(group.logoGap || 8)}px`,
            height: `calc(100% - ${group.title ? Number(group.titleFontSize || 12) + 3 : 0}px)`,
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {(group.logos || []).filter(logo => logo.visible !== false).map(logo => (
            <div
              key={logo.id}
              className="flex items-center justify-center overflow-hidden text-[9px] font-bold text-slate-400"
              style={{
                position: group.manualPlacement ? "absolute" : "relative",
                left: group.manualPlacement ? Number(logo.x || 0) : undefined,
                top: group.manualPlacement ? Number(logo.y || 0) : undefined,
                width: Number(logo.width || 80),
                height: Number(logo.height || 36),
                padding: Number(logo.padding || 0),
                border: logo.border || "1px dashed #cbd5e1",
                borderRadius: Number(logo.borderRadius || 0),
                backgroundColor: logo.backgroundColor || "transparent",
                opacity: Number(logo.opacity || 1),
                transform: `rotate(${Number(logo.rotation || 0)}deg) scale(${Number(logo.scalePercent || 100) / 100})`,
                zIndex: Number(logo.zIndex || 1),
              }}
            >
              {logo.assetUrl ? (
                <img src={assetSrc(logo.assetUrl)} alt={logo.name} style={{ width: "100%", height: "100%", objectFit: logo.objectFit || "contain", objectPosition: logo.objectPosition || "center" }} />
              ) : logo.name}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="mx-auto animate-spin text-[#23471d]" size={28} />
          <p className="mt-3 text-sm font-black text-slate-400">Loading pass designer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#23471d] text-white">
              <Layers size={19} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Pass Template Designer</h1>
              <p className="text-xs font-bold text-slate-500">Default size: 1122px x 1533px. Name/category: Arial. Date/hall: Aladin.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => load()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700">
            <RefreshCw size={15} /> Reload
          </button>
          <button type="button" onClick={save} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#23471d] px-4 text-xs font-black text-white disabled:opacity-60">
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{error}</div>}
      {status && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">{status}</div>}

      <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-900">Saved Templates</p>
              <p className="text-[11px] font-bold text-slate-500">Saved templates appear here.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{templates.length}</span>
          </div>
          <div className="max-h-56 space-y-2 overflow-auto pr-1">
            {templates.map(item => (
              <button
                key={item._id}
                type="button"
                onClick={() => load(item._id)}
                className={`w-full rounded-xl border p-3 text-left ${template?._id === item._id ? "border-[#23471d] bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-800">{item.name}</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-400">{(item.categories || item.passTypes || []).join(", ") || "General"}</p>
                  </div>
                  {template?._id === item._id && <Check size={15} className="shrink-0 text-[#23471d]" />}
                </div>
                <p className="mt-2 text-[10px] font-bold text-slate-400">Updated {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black text-slate-900">Current Template</p>
              <p className="mt-1 text-xs font-bold text-slate-500">{template?.name || "No template selected"}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">Current categories: {(template?.categories || []).join(", ") || "General"}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={selectedTemplateType}
                onChange={event => setSelectedTemplateType(event.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none"
              >
                {PASS_TEMPLATE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <button type="button" onClick={saveAsType} disabled={saving} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#23471d] bg-white px-4 text-xs font-black text-[#23471d] disabled:opacity-60">
                <Copy size={15} /> Save As Separate Type
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-amber-900">Full Pass Background Image</p>
              <p className="mt-1 text-xs font-bold text-amber-700">
                Upload the complete 1122 x 1533 px pass/background image here. Editable logos and text can be managed as layers above it.
              </p>
              {backgroundLayer?.assetName && <p className="mt-1 text-[11px] font-black text-amber-800">Current: {backgroundLayer.assetName}</p>}
            </div>
            <label className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#23471d] px-4 text-xs font-black text-white shadow-sm">
              <Upload size={15} /> Upload Full Background
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={event => uploadAsset(event.target.files?.[0], "pass-background-image")} />
            </label>
          </div>
          {(backgroundLayer?.quality?.warnings || []).map(warning => <p key={warning} className="mt-2 text-[11px] font-bold text-amber-700">{warning}</p>)}
        </div>
        <button type="button" onClick={() => setSelectedLayerId("pass-background-image")} className="rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 shadow-sm">
          Select Background Layer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(640px,1fr)_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">Layers</p>
          <div className="space-y-1">
            {[...(template?.layers || [])].sort((a, b) => Number(b.zIndex || 0) - Number(a.zIndex || 0)).map(layer => (
              <button
                key={layer.id}
                type="button"
                onClick={() => setSelectedLayerId(layer.id)}
                className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left ${selectedLayerId === layer.id ? "border-[#23471d] bg-emerald-50" : "border-transparent hover:bg-slate-50"}`}
              >
                {layer.type === "text" ? <Type size={14} className="text-slate-500" /> : <ImageIcon size={14} className="text-slate-500" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-slate-700">{layer.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">z {layer.zIndex || 0} · {layer.visible === false ? "hidden" : "visible"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
            <p className="text-xs font-black text-slate-600">Preview</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Aspect Fit</span>
              <select
                value={previewScale}
                onChange={event => setPreviewScale(Number(event.target.value))}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold outline-none"
              >
                <option value={0.3}>Compact</option>
                <option value={0.34}>Fit</option>
                <option value={0.38}>Large Fit</option>
              </select>
            </div>
          </div>

          <div
            className="mx-auto rounded bg-white shadow-xl"
            style={{
              width: Number(canvas.width) * previewScale,
              height: Number(canvas.height) * previewScale,
              maxWidth: "100%",
              aspectRatio: `${Number(canvas.width)} / ${Number(canvas.height)}`,
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                width: Number(canvas.width),
                height: Number(canvas.height),
                backgroundColor: canvas.backgroundColor,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              <div
                className="pointer-events-none absolute border border-dashed border-emerald-500/60"
                style={{
                  left: canvas.safeArea?.left || 0,
                  top: canvas.safeArea?.top || 0,
                  right: canvas.safeArea?.right || 0,
                  bottom: canvas.safeArea?.bottom || 0,
                  zIndex: 999,
                }}
              />
              {visibleLayers.map(layer => {
                const isFullBackground = layer.id === "pass-background-image";
                const bleed = isFullBackground ? 12 : 0;
                return (
                <button
                    key={layer.id}
                    type="button"
                    onClick={() => setSelectedLayerId(layer.id)}
                  className={`absolute overflow-hidden ${selectedLayerId === layer.id ? "ring-2 ring-[#23471d]" : ""}`}
                  style={{
                    left: isFullBackground ? -bleed : Number(layer.x || 0),
                    top: isFullBackground ? -bleed : Number(layer.y || 0),
                    width: isFullBackground ? Number(canvas.width) + (bleed * 2) : Number(layer.width || 0),
                    height: isFullBackground ? Number(canvas.height) + (bleed * 2) : Number(layer.height || 0),
                      opacity: Number(layer.opacity || 1),
                      transform: `rotate(${Number(layer.rotation || 0)}deg)`,
                      zIndex: Number(layer.zIndex || 0),
                    }}
                  >
                    {layer.type === "shape" && <div className="h-full w-full" style={{ background: layer.style?.gradient || layer.style?.backgroundColor, border: layer.style?.border, borderRadius: layer.style?.borderRadius }} />}
                    {layer.type === "image" && (
                      <div className="flex h-full w-full items-center justify-center overflow-hidden text-xs font-black text-slate-400" style={{ padding: layer.padding, border: layer.border, borderRadius: layer.borderRadius, backgroundColor: layer.backgroundColor }}>
                        {layer.assetUrl ? (
                          <img src={assetSrc(layer.assetUrl)} alt={layer.name} style={{ display: "block", width: "100%", height: "100%", objectFit: isFullBackground ? "cover" : (layer.objectFit || "contain"), objectPosition: layer.objectPosition || "center", filter: layer.filter, mixBlendMode: layer.mixBlendMode }} />
                        ) : layer.placeholder}
                      </div>
                    )}
                    {layer.type === "text" && (
                      <div
                        className="flex h-full w-full items-center justify-center whitespace-pre-line"
                        style={{
                          fontFamily: layer.style?.fontFamily,
                          fontSize: layer.style?.fontSize,
                          fontWeight: layer.style?.fontWeight,
                          color: layer.style?.color,
                          lineHeight: layer.style?.lineHeight,
                          textAlign: layer.style?.textAlign,
                          textTransform: layer.style?.textTransform,
                          letterSpacing: layer.style?.letterSpacing,
                          textShadow: layer.style?.textShadow,
                        }}
                      >
                        {renderText(layer.text)}
                      </div>
                    )}
                    {layer.type === "logoGroup" && renderLogoGroup(layer.groupId)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Selected Layer</p>
          {selectedLayer ? (
            <>
              <input
                value={selectedLayer.name || ""}
                onChange={event => updateLayer(selectedLayer.id, { name: event.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-black outline-none"
              />
              <div className="grid grid-cols-4 gap-2">
                {n("X", selectedLayer.x, value => updateLayer(selectedLayer.id, { x: value }))}
                {n("Y", selectedLayer.y, value => updateLayer(selectedLayer.id, { y: value }))}
                {n("W", selectedLayer.width, value => updateLayer(selectedLayer.id, { width: value }))}
                {n("H", selectedLayer.height, value => updateLayer(selectedLayer.id, { height: value }))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {n("Z", selectedLayer.zIndex, value => updateLayer(selectedLayer.id, { zIndex: value }))}
                {n("Rotate", selectedLayer.rotation, value => updateLayer(selectedLayer.id, { rotation: value }))}
                {n("Opacity", selectedLayer.opacity, value => updateLayer(selectedLayer.id, { opacity: value }), 0.05)}
              </div>

              {selectedLayer.type === "image" && (
                <div className="space-y-2">
                  <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-black text-slate-600">
                    <Upload size={15} /> Upload / Replace Image
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" className="hidden" onChange={event => uploadAsset(event.target.files?.[0], selectedLayer.id)} />
                  </label>
                  <button type="button" onClick={() => updateLayer(selectedLayer.id, { assetUrl: "", assetName: "", quality: { warnings: [] } })} className="h-9 w-full rounded-lg border border-slate-200 text-xs font-black text-slate-500">
                    Remove Image
                  </button>
                  {(selectedLayer.quality?.warnings || []).map(warning => <p key={warning} className="text-[10px] font-bold text-amber-600">{warning}</p>)}
                </div>
              )}

              {selectedLayer.type === "text" && (
                <div className="space-y-2">
                  <textarea value={selectedLayer.text || ""} onChange={event => updateLayer(selectedLayer.id, { text: event.target.value })} className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none" />
                  <div className="grid grid-cols-3 gap-2">
                    {n("Font", selectedLayer.style?.fontSize, value => updateLayerStyle(selectedLayer.id, "fontSize", value))}
                    {n("Weight", selectedLayer.style?.fontWeight, value => updateLayerStyle(selectedLayer.id, "fontWeight", value))}
                    <label>
                      <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">Color</span>
                      <input type="color" value={selectedLayer.style?.color || "#172033"} onChange={event => updateLayerStyle(selectedLayer.id, "color", event.target.value)} className="h-9 w-full rounded-lg border border-slate-200" />
                    </label>
                  </div>
                  <input
                    value={selectedLayer.style?.fontFamily || ""}
                    onChange={event => updateLayerStyle(selectedLayer.id, "fontFamily", event.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs font-bold outline-none"
                    placeholder="Font family"
                  />
                </div>
              )}

              {selectedLayer.type === "logoGroup" && (
                <div className="space-y-3">
                  {(() => {
                    const group = (template?.logoGroups || []).find(item => item.id === selectedLayer.groupId);
                    if (!group) return <p className="text-xs font-bold text-slate-400">Logo group missing.</p>;
                    return (
                      <>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-black text-slate-700">{group.title}</p>
                            <button type="button" onClick={() => addLogo(group.id)} className="flex h-7 items-center gap-1 rounded-lg bg-[#23471d] px-2 text-[10px] font-black text-white">
                              <CirclePlus size={12} /> Add
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {n("Per Row", group.logosPerRow, value => updateLogoGroup(group.id, { logosPerRow: value }))}
                            {n("Gap", group.logoGap, value => updateLogoGroup(group.id, { logoGap: value }))}
                            {n("Pad", group.padding, value => updateLogoGroup(group.id, { padding: value }))}
                          </div>
                        </div>

                        <div className="max-h-72 space-y-2 overflow-auto pr-1">
                          {(group.logos || []).map(logo => (
                            <div key={logo.id} className="rounded-xl border border-slate-200 p-2">
                              <input value={logo.name || ""} onChange={event => updateLogo(group.id, logo.id, { name: event.target.value })} className="mb-2 h-8 w-full rounded-lg border border-slate-200 px-2 text-[11px] font-bold outline-none" />
                              <label className="mb-2 flex h-8 cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-[10px] font-black text-slate-600">
                                <Upload size={12} /> Upload Logo
                                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" className="hidden" onChange={event => uploadLogoAsset(event.target.files?.[0], group.id, logo.id)} />
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {n("W", logo.width, value => updateLogo(group.id, logo.id, { width: value }))}
                                {n("H", logo.height, value => updateLogo(group.id, logo.id, { height: value }))}
                              </div>
                              <label className="mt-2 flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                <input type="checkbox" checked={logo.visible !== false} onChange={event => updateLogo(group.id, logo.id, { visible: event.target.checked })} />
                                Visible
                              </label>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => updateLayer(selectedLayer.id, { visible: selectedLayer.visible === false })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200" title="Show/hide">
                  {selectedLayer.visible === false ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button type="button" onClick={() => updateLayer(selectedLayer.id, { locked: !selectedLayer.locked })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200" title="Lock/unlock">
                  {selectedLayer.locked ? <Lock size={15} /> : <Unlock size={15} />}
                </button>
                <button type="button" onClick={() => updateLayer(selectedLayer.id, { zIndex: Number(selectedLayer.zIndex || 0) + 1 })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200" title="Move up"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => updateLayer(selectedLayer.id, { zIndex: Number(selectedLayer.zIndex || 0) - 1 })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200" title="Move down"><ArrowDown size={15} /></button>
                <button type="button" onClick={() => updateLayer(selectedLayer.id, { assetUrl: "", visible: false })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600" title="Hide/remove asset"><Trash2 size={15} /></button>
              </div>
            </>
          ) : (
            <p className="text-xs font-bold text-slate-400">Select a layer from the preview or list.</p>
          )}
        </div>
      </div>
    </div>
  );
}
