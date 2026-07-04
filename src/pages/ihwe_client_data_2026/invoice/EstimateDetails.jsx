import React, { useRef, useState } from "react";
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
  const [piCopy, setPiCopy] = useState("ORIGINAL PROFORMA INVOICE");
  const [piMeta, setPiMeta] = useState({ companyId: "", cancelled: false });

  const printPi = useReactToPrint({
    contentRef: sameRef,
    documentTitle: "invoice",
    onAfterPrint: () => setPiCopy("ORIGINAL PROFORMA INVOICE"),
  });

  const handlePrint = async () => {
    const result = await Swal.fire({
      title: "Choose PI Copy",
      width: 460,
      html: `
        <p style="margin:0 0 14px;color:#64748b;font-size:13px">
          Select the copy required for this print.
        </p>
        <div class="pi-copy-options">
          <label class="pi-copy-card">
            <input type="radio" name="pi-copy" value="ORIGINAL PROFORMA INVOICE" checked />
            <span class="pi-copy-check">✓</span>
            <span class="pi-copy-name">Original Proforma Invoice</span>
            <span class="pi-copy-help">Primary proforma copy</span>
          </label>
          <label class="pi-copy-card">
            <input type="radio" name="pi-copy" value="DUPLICATE PROFORMA INVOICE" />
            <span class="pi-copy-check">✓</span>
            <span class="pi-copy-name">Duplicate Proforma Invoice</span>
            <span class="pi-copy-help">Additional proforma copy</span>
          </label>
        </div>
        <style>
          .pi-copy-options{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;text-align:left}
          .pi-copy-card{position:relative;display:flex;min-height:88px;padding:13px 11px 10px;flex-direction:column;border:2px solid #e2e8f0;border-radius:9px;background:#fff;cursor:pointer;transition:all .18s ease}
          .pi-copy-card:hover{border-color:#94a3b8;transform:translateY(-1px)}
          .pi-copy-card:has(input:checked){border-color:#0d1f3c;background:#f1f5f9;box-shadow:0 5px 16px rgba(13,31,60,.12)}
          .pi-copy-card input{position:absolute;opacity:0;pointer-events:none}
          .pi-copy-check{position:absolute;top:8px;right:8px;display:none;width:18px;height:18px;align-items:center;justify-content:center;border-radius:50%;background:#0d1f3c;color:#fff;font-size:11px;font-weight:700}
          .pi-copy-card:has(input:checked) .pi-copy-check{display:flex}
          .pi-copy-name{color:#0d1f3c;font-size:16px;font-weight:700}
          .pi-copy-help{margin-top:auto;padding-top:7px;color:#64748b;font-size:10px}
        </style>
      `,
      showCancelButton: true,
      confirmButtonText: "Print Selected Copy",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d1f3c",
      focusConfirm: false,
      preConfirm: () => {
        const selected = document.querySelector('input[name="pi-copy"]:checked');
        if (!selected) {
          Swal.showValidationMessage("Please select a PI copy");
          return false;
        }
        return selected.value;
      },
    });

    if (!result.isConfirmed) return;

    setPiCopy(result.value);
    requestAnimationFrame(() => requestAnimationFrame(() => printPi()));
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
          <EstimateFormDetail piCopy={piCopy} onMetaChange={setPiMeta} />
        </div>
      </div>
    </>
  );
};

export default EstimateDetails;
