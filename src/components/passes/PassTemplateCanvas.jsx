import { SERVER_URL } from "../../lib/api";

export const passAssetSrc = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${SERVER_URL}${url}`;
};

const getBindingValue = (binding, data) => {
  if (!binding) return "";
  return String(binding)
    .split(".")
    .reduce((value, key) => (value && value[key] !== undefined ? value[key] : ""), data);
};

const renderTemplateText = (text, data) => String(text || "")
  .replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, key) => getBindingValue(key.trim(), data));

const numOr = (value, fallback) => (value === undefined || value === null || value === "" ? fallback : Number(value));

export default function PassTemplateCanvas({
  template,
  data,
  scale = 1,
  className = "",
  showSafeArea = false,
}) {
  const canvas = template?.canvas || {
    width: 1122,
    height: 1533,
    backgroundColor: "#ffffff",
    safeArea: { top: 28, right: 28, bottom: 28, left: 28 },
  };
  const width = Number(canvas.width || 1122);
  const height = Number(canvas.height || 1533);
  const sortedLayers = [...(template?.layers || [])]
    .filter((layer) => layer.visible !== false)
    .sort((a, b) => Number(a.zIndex || 0) - Number(b.zIndex || 0));

  const logoGroups = template?.logoGroups || [];

  const renderLogoGroup = (groupId) => {
    const group = logoGroups.find((item) => item.id === groupId);
    if (!group || group.visible === false) return null;

    return (
      <div
        className="h-full w-full"
        style={{
          padding: Number(group.padding || 0),
          border: group.border || "none",
          backgroundColor: group.backgroundColor || "transparent",
        }}
      >
        {group.title && (
          <div
            style={{
              fontSize: group.titleFontSize,
              fontWeight: group.titleFontWeight,
              color: group.titleColor,
              textAlign: group.alignment || "center",
              lineHeight: 1,
            }}
          >
            {group.title}
          </div>
        )}
        <div
          className="relative"
          style={{
            display: group.manualPlacement ? "block" : "grid",
            gridTemplateColumns: group.manualPlacement ? undefined : `repeat(${Number(group.logosPerRow || 1)}, minmax(0, 1fr))`,
            gap: `${numOr(group.rowGap, 6)}px ${numOr(group.logoGap, 8)}px`,
            height: `calc(100% - ${group.title ? Number(group.titleFontSize || 12) + 3 : 0}px)`,
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {(group.logos || []).filter((logo) => logo.visible !== false).map((logo) => (
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
                border: logo.border || "none",
                borderRadius: Number(logo.borderRadius || 0),
                backgroundColor: logo.backgroundColor || "transparent",
                opacity: numOr(logo.opacity, 1),
                transform: `rotate(${Number(logo.rotation || 0)}deg) scale(${numOr(logo.scalePercent, 100) / 100})`,
                zIndex: Number(logo.zIndex || 1),
              }}
            >
              {logo.assetUrl ? (
                <img
                  src={passAssetSrc(logo.assetUrl)}
                  alt={logo.name || "Logo"}
                  loading="eager"
                  decoding="sync"
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: logo.objectFit || "contain",
                    objectPosition: logo.objectPosition || "center",
                  }}
                />
              ) : logo.name}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative overflow-hidden bg-white ${className}`}
      style={{
        width: width * scale,
        height: height * scale,
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width,
          height,
          backgroundColor: canvas.backgroundColor || "#ffffff",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {showSafeArea && (
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
        )}
        {sortedLayers.map((layer) => {
          const isFullBackground = layer.id === "pass-background-image";
          const bleed = isFullBackground ? 12 : 0;
          return (
          <div
            key={layer.id}
            className="absolute overflow-hidden"
            style={{
              left: isFullBackground ? -bleed : Number(layer.x || 0),
              top: isFullBackground ? -bleed : Number(layer.y || 0),
              width: isFullBackground ? width + (bleed * 2) : Number(layer.width || 0),
              height: isFullBackground ? height + (bleed * 2) : Number(layer.height || 0),
              opacity: numOr(layer.opacity, 1),
              transform: `rotate(${Number(layer.rotation || 0)}deg)`,
              zIndex: Number(layer.zIndex || 0),
            }}
          >
            {layer.type === "shape" && (
              <div
                className="h-full w-full"
                style={{
                  background: layer.style?.gradient || layer.style?.backgroundColor,
                  border: layer.style?.border,
                  borderRadius: layer.style?.borderRadius,
                }}
              />
            )}
            {layer.type === "image" && (
              <div
                className="flex h-full w-full items-center justify-center overflow-hidden text-xs font-black text-slate-400"
                style={{
                  padding: Number(layer.padding || 0),
                  border: layer.border || "none",
                  borderRadius: Number(layer.borderRadius || 0),
                  backgroundColor: layer.backgroundColor || "transparent",
                }}
              >
                {layer.assetUrl ? (
                  <img
                    src={passAssetSrc(layer.assetUrl)}
                    alt={layer.name || "Pass layer"}
                    loading="eager"
                    decoding="sync"
                    draggable={false}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: isFullBackground ? "cover" : (layer.objectFit || "contain"),
                      objectPosition: layer.objectPosition || "center",
                      filter: layer.filter || undefined,
                      mixBlendMode: layer.mixBlendMode || "normal",
                    }}
                  />
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
                {renderTemplateText(layer.text, data)}
              </div>
            )}
            {layer.type === "logoGroup" && renderLogoGroup(layer.groupId)}
          </div>
        )})}
      </div>
    </div>
  );
}
