import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Image, Layers3, Printer, RotateCcw, Ticket, Upload } from "lucide-react";
import FoodCouponCanvas from "../components/passes/FoodCouponCanvas";

const COUPONS_PER_SHEET = 20;

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
        // Already loaded enough for print preview.
      }
    }
  }));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};

export default function FoodCouponGeneratorPage() {
  const printRef = useRef(null);
  const [quantity, setQuantity] = useState(20);
  const [persons, setPersons] = useState("2 PERSON");
  const [logoSrc, setLogoSrc] = useState("");
  const [logoName, setLogoName] = useState("Default Namo Gange logo");
  const coupons = useMemo(
    () => Array.from({ length: Math.max(1, Number(quantity) || 1) }, (_, index) => index + 1),
    [quantity],
  );
  const sheetCount = Math.ceil(coupons.length / COUPONS_PER_SHEET) || 1;

  const printCoupons = useReactToPrint({
    contentRef: printRef,
    documentTitle: "food-coupons",
    onBeforePrint: () => waitForPrintAssets(printRef.current),
  });

  useEffect(() => () => {
    if (logoSrc) URL.revokeObjectURL(logoSrc);
  }, [logoSrc]);

  const changeLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextLogo = URL.createObjectURL(file);
    setLogoSrc((currentLogo) => {
      if (currentLogo) URL.revokeObjectURL(currentLogo);
      return nextLogo;
    });
    setLogoName(file.name);
    event.target.value = "";
  };

  const resetLogo = () => {
    setLogoSrc((currentLogo) => {
      if (currentLogo) URL.revokeObjectURL(currentLogo);
      return "";
    });
    setLogoName("Default Namo Gange logo");
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-3 md:p-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        .food-coupon-print-root { position: fixed; left: -10000px; top: 0; width: 29.7cm; opacity: 0; pointer-events: none; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          .food-coupon-print-root, .food-coupon-print-root * { visibility: visible !important; }
          .food-coupon-print-root { display: block !important; position: absolute; left: 0; top: 0; width: 29.7cm; opacity: 1; pointer-events: auto; background: #fff; }
          @page { size: A3 portrait; margin: 0; }
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

      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#083ef5] text-white">
              <Ticket size={16} />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#15173D]">Food Coupons</h1>
              <p className="text-[11px] font-medium text-slate-500">Standalone food coupon print sheet, separate from pass templates.</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={printCoupons}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#124170] px-4 text-xs font-bold text-white transition hover:bg-[#0A2643]"
        >
          <Printer size={14} />
          Print Coupons
        </button>
      </div>

      <section className="mb-3 grid grid-cols-1 gap-2 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Layers3 size={16} />
            </div>
            <div>
              <p className="text-sm font-black text-[#15173D]">Print Setup</p>
              <p className="text-[10px] font-bold text-slate-400">A3 portrait, 20 coupons per sheet.</p>
            </div>
          </div>
          <label className="mb-3 block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">Quantity</span>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-900 outline-none focus:border-[#083ef5] focus:bg-white"
            />
          </label>
          <label className="mb-3 block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">Person Text</span>
            <input
              value={persons}
              onChange={(event) => setPersons(event.target.value.toUpperCase())}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-900 outline-none focus:border-[#083ef5] focus:bg-white"
            />
          </label>
          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                <Image size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Logo</p>
                <p className="truncate text-[11px] font-black text-slate-700" title={logoName}>{logoName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#083ef5] px-3 text-[11px] font-black text-white">
                <Upload size={13} />
                Change Logo
                <input type="file" accept="image/*" onChange={changeLogo} className="hidden" />
              </label>
              <button
                type="button"
                onClick={resetLogo}
                disabled={!logoSrc}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-600 disabled:opacity-40"
              >
                <RotateCcw size={13} />
                Default
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase text-slate-400">Coupons</p>
              <p className="text-base font-black text-[#15173D]">{coupons.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[9px] font-black uppercase text-slate-400">Sheets</p>
              <p className="text-base font-black text-[#15173D]">{sheetCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-black text-[#15173D]">Preview</p>
          <div className="max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div style={{ width: "100%", aspectRatio: "3.62 / 1" }}>
              <FoodCouponCanvas persons={persons || "2 PERSON"} logoSrc={logoSrc} />
            </div>
          </div>
        </div>
      </section>

      <div ref={printRef} className="food-coupon-print-root">
        {Array.from({ length: sheetCount }).map((_, pageIndex) => {
          const pageItems = coupons.slice(pageIndex * COUPONS_PER_SHEET, pageIndex * COUPONS_PER_SHEET + COUPONS_PER_SHEET);
          return (
            <div key={pageIndex} className="food-coupon-print-sheet">
              {pageItems.map((coupon) => (
                <div key={coupon} className="food-coupon-print-card">
                  <FoodCouponCanvas persons={persons || "2 PERSON"} logoSrc={logoSrc} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
