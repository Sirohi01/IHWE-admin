import React, { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { MdOutlineModeEdit } from "react-icons/md";
import { useReactToPrint } from "react-to-print";
import { FaPrint } from "react-icons/fa";
// import InvoiceForm from '../InvoiceForm';
import EstimateFormDetail from "./EstimateFormDetail";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Upload, UserCheck, LayoutGrid } from "lucide-react";
import Swal from "sweetalert2";

const EstimateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sameRef = useRef();
  const [piCopies, setPiCopies] = useState(["ORIGINAL PROFORMA INVOICE"]);
  const [piMeta, setPiMeta] = useState({ companyId: "", cancelled: false });

  const printPi = useReactToPrint({
    contentRef: sameRef,
    documentTitle: "invoice",
    onAfterPrint: () => setPiCopies(["ORIGINAL PROFORMA INVOICE"]),
  });

  const waitForPrintContent = (expectedCopyCount) => new Promise((resolve) => {
    const startedAt = Date.now();
    const check = () => {
      const text = sameRef.current?.textContent || "";
      const expectedCopiesReady = sameRef.current?.querySelectorAll(".invoice-print-root").length >= expectedCopyCount;
      const isLoading = text.includes("Loading estimate details");

      if ((expectedCopiesReady && !isLoading) || Date.now() - startedAt > 4000) {
        resolve();
        return;
      }

      window.setTimeout(check, 100);
    };

    check();
  });

  const handlePrint = async () => {
    const result = await Swal.fire({
      title: "Choose Invoice Copy",
      width: 590,
      html: `
        <p style="margin:0 0 18px;color:#64748b;font-size:14px">
          Select the copy required for this print.
        </p>
        <div class="pi-copy-options">
          <label class="pi-copy-all">
            <input type="checkbox" id="select-all-pi-copies" checked />
            <span class="pi-copy-all-label">Select All</span>
          </label>
          <label class="pi-copy-card">
            <input type="checkbox" name="pi-copy" value="ORIGINAL PROFORMA INVOICE" checked />
            <span class="pi-copy-check">✓</span>
            <span class="pi-copy-name">Original</span>
            <span class="pi-copy-purpose">For Recipient</span>
            <span class="pi-copy-help">Customer's official copy</span>
          </label>
          <label class="pi-copy-card">
            <input type="checkbox" name="pi-copy" value="DUPLICATE PROFORMA INVOICE" checked />
            <span class="pi-copy-check">✓</span>
            <span class="pi-copy-name">Duplicate</span>
            <span class="pi-copy-purpose">For Supplier</span>
            <span class="pi-copy-help">Office and accounts record</span>
          </label>
          <label class="pi-copy-card">
            <input type="checkbox" name="pi-copy" value="TRIPLICATE PROFORMA INVOICE" checked />
            <span class="pi-copy-check">✓</span>
            <span class="pi-copy-name">Triplicate</span>
            <span class="pi-copy-purpose">For Transportation</span>
            <span class="pi-copy-help">For movement of goods</span>
          </label>
        </div>
        <style>
          .pi-copy-options{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;text-align:left}
          .pi-copy-all{grid-column:1 / -1;display:flex;align-items:center;gap:8px;padding:10px 12px;border:2px solid #e2e8f0;border-radius:9px;background:#f8fafc;cursor:pointer}
          .pi-copy-all input{width:16px;height:16px}
          .pi-copy-all-label{color:#0d1f3c;font-size:13px;font-weight:700}
          .pi-copy-card{position:relative;display:flex;min-height:102px;padding:13px 11px 10px;flex-direction:column;border:2px solid #e2e8f0;border-radius:9px;background:#fff;cursor:pointer;transition:all .18s ease}
          .pi-copy-card:hover{border-color:#94a3b8;transform:translateY(-1px)}
          .pi-copy-card:has(input:checked){border-color:#0d1f3c;background:#f1f5f9;box-shadow:0 5px 16px rgba(13,31,60,.12)}
          .pi-copy-card input{position:absolute;opacity:0;pointer-events:none}
          .pi-copy-check{position:absolute;top:8px;right:8px;display:none;width:18px;height:18px;align-items:center;justify-content:center;border-radius:50%;background:#0d1f3c;color:#fff;font-size:11px;font-weight:700}
          .pi-copy-card:has(input:checked) .pi-copy-check{display:flex}
          .pi-copy-name{color:#0d1f3c;font-size:16px;font-weight:700}
          .pi-copy-purpose{margin-top:4px;color:#334155;font-size:12px;font-weight:600}
          .pi-copy-help{margin-top:auto;padding-top:7px;color:#64748b;font-size:10px;line-height:1.35}
          @media (max-width:600px){.pi-copy-options{grid-template-columns:1fr}.pi-copy-card{min-height:90px}}
        </style>
      `,
      showCancelButton: true,
      confirmButtonText: "Print Selected Copy",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d1f3c",
      focusConfirm: false,
      didOpen: () => {
        const selectAll = Swal.getPopup()?.querySelector('#select-all-pi-copies');
        const copyInputs = Array.from(Swal.getPopup()?.querySelectorAll('input[name="pi-copy"]') || []);
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
        const selected = Array.from(document.querySelectorAll('input[name="pi-copy"]:checked'))
          .map((input) => input.value)
          .filter(Boolean);
        if (!selected.length) {
          Swal.showValidationMessage("Please select at least one invoice copy");
          return false;
        }
        return selected;
      },
    });

    if (!result.isConfirmed) return;

    flushSync(() => {
      setPiCopies(result.value);
    });
    requestAnimationFrame(async () => {
      await waitForPrintContent(result.value.length);
      printPi();
    });
  };

  return (
    <>
      <div className="bg-white shadow-md mt-1 p-6 min-h-screen font-inter animate-fadeIn">

        {/* ── HEADER AREA ── */}
        <div className="flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-300 gap-4">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
              Proforma Invoice | Sales Management Section
            </h1>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => navigate(`/performa-invoice-list/${piMeta.companyId}`)}
              disabled={!piMeta.companyId}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Proforma Invoice List
            </button>
            {!piMeta.cancelled && (
              <button
                type="button"
                onClick={() => navigate(`/performa-invoice/${piMeta.companyId}`, {
                  state: { editEstimateId: id },
                })}
                disabled={!piMeta.companyId}
                className="rounded border border-blue-300 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-blue-600 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="rounded border border-[#3598dc] bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-[#3598dc] shadow-sm transition-colors hover:bg-[#3598dc] hover:text-white"
              title="Print Proforma Invoice"
            >
              <span className="flex items-center gap-1.5">
                <FaPrint size={13} />
                Print
              </span>
            </button>
          </div>
        </div>

        <div ref={sameRef}>
          {piCopies.map((copyLabel, index) => (
            <div
              key={`${copyLabel}-${index}`}
              className="print-copy-page"
              style={{
                breakAfter: index < piCopies.length - 1 ? "page" : "auto",
                pageBreakAfter: index < piCopies.length - 1 ? "always" : "auto",
              }}
            >
              <EstimateFormDetail
                piCopy={copyLabel}
                onMetaChange={index === 0 ? setPiMeta : undefined}
              />
              <div className="print-copy-page-label" style={{ display: "none" }}>1/1</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EstimateDetails;
