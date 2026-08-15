// import React, { useRef, useState, useEffect } from "react";
// import { flushSync } from "react-dom";
// import mainpic from "../../../assets/header.png";
// import { useReactToPrint } from "react-to-print";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useParams } from "react-router-dom";
// import { fetchInvoices } from "../../../features/invoice/invoiceSlice";
// import { fetchEstimates } from "../../../features/estimates/estimateSlice";
// import { fetchCompanies } from "../../../features/company/companySlice";
// import { useSelector, useDispatch } from "react-redux";
// import { FaPrint } from "react-icons/fa";
// import { ArrowLeft, RefreshCw } from "lucide-react";
// import Swal from "sweetalert2";
// import api from "../../../lib/api";
// import InvoicePreviewTemplate from "./InvoicePreviewTemplate";

// const escapeHtml = (value) => String(value ?? "")
//   .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
//   .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

// const InvoiceNumberDetails = () => {
//   const { id } = useParams();
//   const sameRef = useRef();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const heading = location.state?.heading || "";
//   const [matchedInvoice, setMatchedInvoice] = useState(null);
//   const [company, setCompany] = useState(null);
//   const [matchedEstimate, setMatchedEstimate] = useState(null);
//   const [isRevising, setIsRevising] = useState(false);
//   const [hasChanges, setHasChanges] = useState(false);
//   const [isCheckingChanges, setIsCheckingChanges] = useState(true);
//   const [invoiceCopies, setInvoiceCopies] = useState(["ORIGINAL INVOICE"]);

//   // redux logic
//   const { invoices } = useSelector((state) => state.invoice);
//   const { companies } = useSelector((state) => state.companies);
//   const { estimates, loading } = useSelector((state) => state.estimates);

//   //   console.log("id", id);
//   //   console.log("invoices", invoices);
//   // console.log("matchedInvoice", matchedInvoice);
//   // console.log("matchedEstimate", matchedEstimate);
//   //   console.log("companies", companies);
//   //   console.log("company", company);

//   React.useEffect(() => {
//     dispatch(fetchInvoices());
//     dispatch(fetchCompanies());
//   }, [dispatch]);

//   const totalAmount =
//     matchedInvoice?.items?.reduce(
//       (sum, item) => sum + (parseFloat(item.taxableValue || item.tax || 0)),
//       0
//     ) || 0;

//   // Calculate the grand total from all items
//   const grandTotal =
//     matchedInvoice?.items?.reduce((sum, item) => {
//       const taxableValue = parseFloat(item?.taxableValue || item?.tax) || 0;
//       const totalGstRate = parseFloat(item?.gstPct || item?.gstRate) || 0;
//       const itemTotalTax = (taxableValue * totalGstRate) / 100;
//       return sum + itemTotalTax;
//     }, 0) || 0;

//   const invoiceValue = matchedInvoice?.finalAmount || (grandTotal + totalAmount);

//   useEffect(() => {
//     if (invoices && invoices.length > 0) {
//       const match = invoices.find((e) => e?._id === id);
//       setMatchedInvoice(match || null);
//     }
//   }, [id, invoices]);

//   useEffect(() => {
//     if (matchedInvoice?.companyId && companies.length > 0) {
//       const matchedCompany = companies.find(
//         (c) => c._id === matchedInvoice?.companyId || c.clientId === matchedInvoice?.companyId
//       );
//       setCompany(matchedCompany || null);
//     }
//   }, [matchedInvoice, companies]);

//   useEffect(() => {
//     const checkChanges = async () => {
//       if (
//         matchedInvoice &&
//         (matchedInvoice.source_estimate_id || matchedInvoice.estimate_no) &&
//         String(matchedInvoice.status || "").toLowerCase() !== "cancelled"
//       ) {
//         try {
//           setIsCheckingChanges(true);
//           const { data: preview } = await api.get(`/api/invoices/${id}/revision-preview`);
//           setHasChanges(preview?.hasChanges || false);
//         } catch (error) {
//           console.error("Error checking revisions:", error);
//           setHasChanges(false);
//         } finally {
//           setIsCheckingChanges(false);
//         }
//       } else {
//         setIsCheckingChanges(false);
//         setHasChanges(false);
//       }
//     };
//     checkChanges();
//   }, [matchedInvoice, id]);

//   const printInvoice = useReactToPrint({
//     contentRef: sameRef,
//     documentTitle: "invoice",
//     onAfterPrint: () => setInvoiceCopies(["ORIGINAL INVOICE"]),
//   });

//   const handlePrint = async () => {
//     const result = await Swal.fire({
//       title: "Choose Invoice Copy",
//       width: 590,
//       html: `
//         <p style="margin:0 0 18px;color:#64748b;font-size:14px">
//           Select the copy required for this print.
//         </p>
//         <div class="invoice-copy-options">
//           <label class="invoice-copy-all">
//             <input type="checkbox" id="select-all-copies" checked />
//             <span class="invoice-copy-all-label">Select All</span>
//           </label>
//           <label class="invoice-copy-card">
//             <input type="checkbox" name="invoice-copy" value="ORIGINAL INVOICE" checked />
//             <span class="invoice-copy-check">✓</span>
//             <span class="invoice-copy-name">Original</span>
//             <span class="invoice-copy-purpose">For Recipient</span>
//             <span class="invoice-copy-help">Customer's official copy</span>
//           </label>
//           <label class="invoice-copy-card">
//             <input type="checkbox" name="invoice-copy" value="DUPLICATE INVOICE" checked />
//             <span class="invoice-copy-check">✓</span>
//             <span class="invoice-copy-name">Duplicate</span>
//             <span class="invoice-copy-purpose">For Supplier</span>
//             <span class="invoice-copy-help">Office and accounts record</span>
//           </label>
//           <label class="invoice-copy-card">
//             <input type="checkbox" name="invoice-copy" value="TRIPLICATE INVOICE" checked />
//             <span class="invoice-copy-check">✓</span>
//             <span class="invoice-copy-name">Triplicate</span>
//             <span class="invoice-copy-purpose">For Transportation</span>
//             <span class="invoice-copy-help">For movement of goods</span>
//           </label>
//         </div>
//         <style>
//           .invoice-copy-options {
//             display:grid;
//             grid-template-columns:repeat(3, 1fr);
//             gap:9px;
//             text-align:left;
//           }
//           .invoice-copy-all {
//             grid-column:1 / -1;
//             display:flex;
//             align-items:center;
//             gap:8px;
//             padding:10px 12px;
//             border:2px solid #e2e8f0;
//             border-radius:9px;
//             background:#f8fafc;
//             cursor:pointer;
//           }
//           .invoice-copy-all input {
//             width:16px;
//             height:16px;
//           }
//           .invoice-copy-all-label {
//             color:#0d1f3c;
//             font-size:13px;
//             font-weight:700;
//           }
//           .invoice-copy-card {
//             position:relative;
//             display:flex;
//             min-height:102px;
//             padding:13px 11px 10px;
//             flex-direction:column;
//             border:2px solid #e2e8f0;
//             border-radius:9px;
//             background:#fff;
//             cursor:pointer;
//             transition:all .18s ease;
//           }
//           .invoice-copy-card:hover {
//             border-color:#94a3b8;
//             transform:translateY(-1px);
//           }
//           .invoice-copy-card:has(input:checked) {
//             border-color:#0d1f3c;
//             background:#f1f5f9;
//             box-shadow:0 5px 16px rgba(13,31,60,.12);
//           }
//           .invoice-copy-card input {
//             position:absolute;
//             opacity:0;
//             pointer-events:none;
//           }
//           .invoice-copy-check {
//             position:absolute;
//             top:8px;
//             right:8px;
//             display:none;
//             width:18px;
//             height:18px;
//             align-items:center;
//             justify-content:center;
//             border-radius:50%;
//             background:#0d1f3c;
//             color:#fff;
//             font-size:11px;
//             font-weight:700;
//           }
//           .invoice-copy-card:has(input:checked) .invoice-copy-check { display:flex; }
//           .invoice-copy-name {
//             color:#0d1f3c;
//             font-size:16px;
//             font-weight:700;
//           }
//           .invoice-copy-purpose {
//             margin-top:4px;
//             color:#334155;
//             font-size:12px;
//             font-weight:600;
//           }
//           .invoice-copy-help {
//             margin-top:auto;
//             padding-top:7px;
//             color:#64748b;
//             font-size:10px;
//             line-height:1.35;
//           }
//           @media (max-width:600px) {
//             .invoice-copy-options { grid-template-columns:1fr; }
//             .invoice-copy-card { min-height:90px; }
//           }
//         </style>
//       `,
//       showCancelButton: true,
//       confirmButtonText: "Print Selected Copy",
//       cancelButtonText: "Cancel",
//       confirmButtonColor: "#0d1f3c",
//       focusConfirm: false,
//       didOpen: () => {
//         const selectAll = Swal.getPopup()?.querySelector('#select-all-copies');
//         const copyInputs = Array.from(Swal.getPopup()?.querySelectorAll('input[name="invoice-copy"]') || []);
//         const syncSelectAll = () => {
//           if (!selectAll) return;
//           selectAll.checked = copyInputs.length > 0 && copyInputs.every((input) => input.checked);
//         };
//         selectAll?.addEventListener('change', () => {
//           copyInputs.forEach((input) => {
//             input.checked = selectAll.checked;
//           });
//         });
//         copyInputs.forEach((input) => input.addEventListener('change', syncSelectAll));
//         syncSelectAll();
//       },
//       preConfirm: () => {
//         const selected = Array.from(document.querySelectorAll('input[name="invoice-copy"]:checked'))
//           .map((input) => input.value)
//           .filter(Boolean);
//         if (!selected.length) {
//           Swal.showValidationMessage("Please select at least one invoice copy");
//           return false;
//         }
//         return selected;
//       },
//     });

//     if (!result.isConfirmed) return;

//     flushSync(() => {
//       setInvoiceCopies(result.value);
//     });
//     requestAnimationFrame(() => printInvoice());
//   };

//   const handleRevise = async () => {
//     try {
//       setIsRevising(true);
//       const { data: preview } = await api.get(`/api/invoices/${id}/revision-preview`);
//       if (!preview?.hasChanges) {
//         await Swal.fire("No changes found", "Invoice already matches the latest Proforma Invoice.", "info");
//         return;
//       }
//       const dependencyRows = [
//         ["Payments", preview.dependencies?.payments],
//         ["Credit Notes", preview.dependencies?.creditNotes],
//         ["Debit Notes", preview.dependencies?.debitNotes],
//         ["Delivery Challans", preview.deliveryChallans],
//       ].filter(([, records]) => records?.length);
//       const changedRows = (preview.changedFields || []).map((change) => `
//         <tr>
//           <td style="padding:5px;border-bottom:1px solid #e5e7eb;font-weight:600">${escapeHtml(change.label)}</td>
//           <td style="padding:5px;border-bottom:1px solid #e5e7eb;color:#64748b">${escapeHtml(change.before || "—")}</td>
//           <td style="padding:5px;border-bottom:1px solid #e5e7eb;color:#166534">${escapeHtml(change.after || "—")}</td>
//         </tr>`).join("");
//       const items = preview.itemChanges || {};
//       const result = await Swal.fire({
//         icon: dependencyRows.length ? "warning" : "question",
//         title: `Revise ${escapeHtml(preview.invoice_no)} → Rev ${preview.next_revision}`,
//         width: 720,
//         html: `
//           <div style="text-align:left;font-size:12px">
//             <p><b>Invoice number same rahega.</b> Current copy revision history mein save hogi.</p>
//             <div style="max-height:190px;overflow:auto;border:1px solid #e5e7eb;border-radius:6px">
//               <table style="width:100%;border-collapse:collapse">
//                 <thead><tr style="background:#f8fafc"><th style="padding:5px;text-align:left">Field</th><th>Old</th><th>New</th></tr></thead>
//                 <tbody>${changedRows || '<tr><td colspan="3" style="padding:6px">Only items changed.</td></tr>'}</tbody>
//               </table>
//             </div>
//             <p><b>Items:</b> ${items.added || 0} added, ${items.removed || 0} removed, ${items.modified || 0} modified</p>
//             ${dependencyRows.map(([label, records]) => `<p style="margin:4px 0;color:#9a3412"><b>${label}:</b> ${records.length} linked — these records will not auto-change.</p>`).join("")}
//             <input id="revision-reason" class="swal2-input" style="width:100%;margin:10px 0 0" placeholder="Revision reason (recommended)" />
//           </div>`,
//         showCancelButton: true,
//         confirmButtonText: "Revise Same Invoice",
//         cancelButtonText: "Cancel",
//         confirmButtonColor: "#b45309",
//         preConfirm: () => document.getElementById("revision-reason")?.value?.trim() || "",
//       });
//       if (!result.isConfirmed) return;

//       const revisedBy = localStorage.getItem("user_name") || sessionStorage.getItem("user_name") || "";
//       const response = await api.post(`/api/invoices/${id}/revise-from-estimate`, {
//         reason: result.value,
//         revised_by: revisedBy,
//       });
//       setMatchedInvoice(response.data?.data);
//       dispatch(fetchInvoices());
//       await Swal.fire({
//         icon: "success",
//         title: `Invoice Revised — Rev ${response.data?.data?.revision_no}`,
//         text: `Invoice number ${response.data?.data?.invoice_no} remains unchanged.`,
//       });
//     } catch (error) {
//       await Swal.fire("Revision Failed", error.response?.data?.message || "Unable to revise invoice.", "error");
//     } finally {
//       setIsRevising(false);
//     }
//   };

//   if (!matchedInvoice) {
//     return <div className="text-center p-10">Loading invoice details...</div>;
//   }

//   return (
//     <div className="bg-gray-100 p-6 min-h-screen ">
//       <div className="max-w-[1000px] mx-auto flex justify-end mb-2">
//         {(matchedInvoice.source_estimate_id || matchedInvoice.estimate_no)
//           && String(matchedInvoice.status || "").toLowerCase() !== "cancelled" && (
//             <button
//               onClick={handleRevise}
//               disabled={isRevising || isCheckingChanges || !hasChanges}
//               className={`mr-auto rounded px-3 py-2 text-white shadow-sm transition flex items-center gap-2 ${isCheckingChanges || !hasChanges ? "bg-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"
//                 }`}
//               title={!hasChanges ? "No changes found" : "Update this invoice from latest Proforma Invoice while keeping the same invoice number"}
//             >
//               <RefreshCw size={16} className={isRevising || isCheckingChanges ? "animate-spin" : ""} />
//               {isRevising ? "Checking..." : isCheckingChanges ? "Checking changes..." : "Revise from PI"}
//             </button>
//           )}
//         {Number(matchedInvoice.revision_no || 0) > 0 && (
//           <span className="mr-2 rounded bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">
//             Rev {matchedInvoice.revision_no}
//           </span>
//         )}
//         <button
//           onClick={() => navigate('/invoice-list')}
//           className="bg-white rounded p-2 text-gray-500 hover:text-blue-500 shadow-sm border transition flex items-center justify-center"
//           title="Back"
//         >
//           <ArrowLeft size={18} />
//         </button>
//         <button
//           onClick={handlePrint}
//           disabled={hasChanges}
//           className={`ml-2 rounded p-2 shadow-sm border transition flex items-center justify-center ${hasChanges ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-gray-500 hover:text-blue-500"
//             }`}
//           title={hasChanges ? "Please revise the invoice before printing" : "Print Invoice"}
//         >
//           <FaPrint size={18} />
//         </button>
//       </div>
//       <div ref={sameRef}>
//         {invoiceCopies.map((copyLabel, index) => (
//           <div
//             key={`${copyLabel}-${index}`}
//             style={{
//               breakAfter: index < invoiceCopies.length - 1 ? "page" : "auto",
//               pageBreakAfter: index < invoiceCopies.length - 1 ? "always" : "auto",
//             }}
//           >
//             <InvoicePreviewTemplate
//               matchedInvoice={matchedInvoice}
//               heading={heading}
//               invoiceCopy={copyLabel}
//               printPageLabel={`Page ${index + 1} of ${invoiceCopies.length}`}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default InvoiceNumberDetails;
import React, { useRef, useState, useEffect } from "react";
import { flushSync } from "react-dom";
import mainpic from "../../../assets/header.png";
import { useReactToPrint } from "react-to-print";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchInvoices } from "../../../features/invoice/invoiceSlice";
import { fetchEstimates } from "../../../features/estimates/estimateSlice";
import { fetchCompanies } from "../../../features/company/companySlice";
import { fetchPayments } from "../../../features/payment/paymentSlice";
import { useSelector, useDispatch } from "react-redux";
import { FaPrint } from "react-icons/fa";
import { ArrowLeft, RefreshCw, Download, Paperclip, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../../../lib/api";
import InvoicePreviewTemplate from "./InvoicePreviewTemplate";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

// Renders PDF pages as images so they show inline and print reliably (embedded PDF viewers don't print).
const PdfAttachmentPages = ({ url }) => {
  const [pageImages, setPageImages] = useState([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const renderPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
          if (cancelled) return;
          const dataUrl = canvas.toDataURL("image/png");
          setPageImages((current) => [...current, dataUrl]);
        }
      } catch (_error) {
        if (!cancelled) setFailed(true);
      }
    };
    renderPdf();

    return () => { cancelled = true; };
  }, [url]);

  if (failed) {
    return <p className="text-xs text-red-500">Unable to preview this file.</p>;
  }
  if (!pageImages.length) {
    return <p className="text-xs text-gray-400">Loading preview…</p>;
  }
  return pageImages.map((src, index) => (
    <img key={index} src={src} alt={`Page ${index + 1}`} className="w-full rounded-md border border-gray-100 mb-2 last:mb-0" />
  ));
};

const InvoiceNumberDetails = () => {
  const { id } = useParams();
  const sameRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const heading = location.state?.heading || "";
  const [matchedInvoice, setMatchedInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [matchedEstimate, setMatchedEstimate] = useState(null);
  const [isRevising, setIsRevising] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCheckingChanges, setIsCheckingChanges] = useState(true);
  const [invoiceCopies, setInvoiceCopies] = useState(["ORIGINAL INVOICE"]);

  // redux logic
  const { invoices } = useSelector((state) => state.invoice);
  const { companies } = useSelector((state) => state.companies);
  const { estimates, loading } = useSelector((state) => state.estimates);
  const { payments } = useSelector((state) => state.payment);

  //   console.log("id", id);
  //   console.log("invoices", invoices);
  // console.log("matchedInvoice", matchedInvoice);
  // console.log("matchedEstimate", matchedEstimate);
  //   console.log("companies", companies);
  //   console.log("company", company);

  React.useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchCompanies());
    dispatch(fetchPayments());
  }, [dispatch]);

  const invoicePayments = (payments || [])
    .filter((payment) => (
      payment.invoice_id === id ||
      (matchedInvoice?.source_estimate_id && payment.invoice_id === matchedInvoice.source_estimate_id)
    ))
    .slice()
    .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));

  const totalAmount =
    matchedInvoice?.items?.reduce(
      (sum, item) => sum + (parseFloat(item.taxableValue || item.tax || 0)),
      0
    ) || 0;

  // Calculate the grand total from all items
  const grandTotal =
    matchedInvoice?.items?.reduce((sum, item) => {
      const taxableValue = parseFloat(item?.taxableValue || item?.tax) || 0;
      const totalGstRate = parseFloat(item?.gstPct || item?.gstRate) || 0;
      const itemTotalTax = (taxableValue * totalGstRate) / 100;
      return sum + itemTotalTax;
    }, 0) || 0;

  const invoiceValue = matchedInvoice?.finalAmount || (grandTotal + totalAmount);

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const match = invoices.find((e) => e?._id === id);
      setMatchedInvoice(match || null);
    }
  }, [id, invoices]);

  useEffect(() => {
    if (matchedInvoice?.companyId && companies.length > 0) {
      const matchedCompany = companies.find(
        (c) => c._id === matchedInvoice?.companyId || c.clientId === matchedInvoice?.companyId
      );
      setCompany(matchedCompany || null);
    }
  }, [matchedInvoice, companies]);

  useEffect(() => {
    const fetchSourceEstimate = async () => {
      const estimateId = matchedInvoice?.source_estimate_id;
      if (!estimateId) {
        setMatchedEstimate(null);
        return;
      }

      try {
        const response = await api.get(`/api/estimates/${estimateId}`);
        setMatchedEstimate(response.data?.data || response.data || null);
      } catch (error) {
        setMatchedEstimate(null);
      }
    };

    fetchSourceEstimate();
  }, [matchedInvoice?.source_estimate_id]);

  useEffect(() => {
    const checkChanges = async () => {
      if (
        matchedInvoice &&
        (matchedInvoice.source_estimate_id || matchedInvoice.estimate_no) &&
        String(matchedInvoice.status || "").toLowerCase() !== "cancelled"
      ) {
        try {
          setIsCheckingChanges(true);
          const { data: preview } = await api.get(`/api/invoices/${id}/revision-preview`);
          setHasChanges(preview?.hasChanges || false);
        } catch (error) {
          console.error("Error checking revisions:", error);
          setHasChanges(false);
        } finally {
          setIsCheckingChanges(false);
        }
      } else {
        setIsCheckingChanges(false);
        setHasChanges(false);
      }
    };
    checkChanges();
  }, [matchedInvoice, id]);

  const printInvoice = useReactToPrint({
    contentRef: sameRef,
    documentTitle: "invoice",
    onAfterPrint: () => setInvoiceCopies(["ORIGINAL INVOICE"]),
  });

  const handlePrint = async () => {
    const result = await Swal.fire({
      title: "Choose Invoice Copy",
      width: 590,
      html: `
        <p style="margin:0 0 18px;color:#64748b;font-size:14px">
          Select the copy required for this print.
        </p>
        <div class="invoice-copy-options">
          <label class="invoice-copy-all">
            <input type="checkbox" id="select-all-copies" checked />
            <span class="invoice-copy-all-label">Select All</span>
          </label>
          <label class="invoice-copy-card">
            <input type="checkbox" name="invoice-copy" value="ORIGINAL INVOICE" checked />
            <span class="invoice-copy-check">✓</span>
            <span class="invoice-copy-name">Original</span>
            <span class="invoice-copy-purpose">For Recipient</span>
            <span class="invoice-copy-help">Customer's official copy</span>
          </label>
          <label class="invoice-copy-card">
            <input type="checkbox" name="invoice-copy" value="DUPLICATE INVOICE" checked />
            <span class="invoice-copy-check">✓</span>
            <span class="invoice-copy-name">Duplicate</span>
            <span class="invoice-copy-purpose">For Supplier</span>
            <span class="invoice-copy-help">Office and accounts record</span>
          </label>
          <label class="invoice-copy-card">
            <input type="checkbox" name="invoice-copy" value="TRIPLICATE INVOICE" checked />
            <span class="invoice-copy-check">✓</span>
            <span class="invoice-copy-name">Triplicate</span>
            <span class="invoice-copy-purpose">For Transportation</span>
            <span class="invoice-copy-help">For movement of goods</span>
          </label>
        </div>
        <style>
          .invoice-copy-options {
            display:grid;
            grid-template-columns:repeat(3, 1fr);
            gap:9px;
            text-align:left;
          }
          .invoice-copy-all {
            grid-column:1 / -1;
            display:flex;
            align-items:center;
            gap:8px;
            padding:10px 12px;
            border:2px solid #e2e8f0;
            border-radius:9px;
            background:#f8fafc;
            cursor:pointer;
          }
          .invoice-copy-all input {
            width:16px;
            height:16px;
          }
          .invoice-copy-all-label {
            color:#0d1f3c;
            font-size:13px;
            font-weight:700;
          }
          .invoice-copy-card {
            position:relative;
            display:flex;
            min-height:102px;
            padding:13px 11px 10px;
            flex-direction:column;
            border:2px solid #e2e8f0;
            border-radius:9px;
            background:#fff;
            cursor:pointer;
            transition:all .18s ease;
          }
          .invoice-copy-card:hover {
            border-color:#94a3b8;
            transform:translateY(-1px);
          }
          .invoice-copy-card:has(input:checked) {
            border-color:#0d1f3c;
            background:#f1f5f9;
            box-shadow:0 5px 16px rgba(13,31,60,.12);
          }
          .invoice-copy-card input {
            position:absolute;
            opacity:0;
            pointer-events:none;
          }
          .invoice-copy-check {
            position:absolute;
            top:8px;
            right:8px;
            display:none;
            width:18px;
            height:18px;
            align-items:center;
            justify-content:center;
            border-radius:50%;
            background:#0d1f3c;
            color:#fff;
            font-size:11px;
            font-weight:700;
          }
          .invoice-copy-card:has(input:checked) .invoice-copy-check { display:flex; }
          .invoice-copy-name {
            color:#0d1f3c;
            font-size:16px;
            font-weight:700;
          }
          .invoice-copy-purpose {
            margin-top:4px;
            color:#334155;
            font-size:12px;
            font-weight:600;
          }
          .invoice-copy-help {
            margin-top:auto;
            padding-top:7px;
            color:#64748b;
            font-size:10px;
            line-height:1.35;
          }
          @media (max-width:600px) {
            .invoice-copy-options { grid-template-columns:1fr; }
            .invoice-copy-card { min-height:90px; }
          }
        </style>
      `,
      showCancelButton: true,
      confirmButtonText: "Print Selected Copy",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d1f3c",
      focusConfirm: false,
      didOpen: () => {
        const selectAll = Swal.getPopup()?.querySelector('#select-all-copies');
        const copyInputs = Array.from(Swal.getPopup()?.querySelectorAll('input[name="invoice-copy"]') || []);
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
        const selected = Array.from(document.querySelectorAll('input[name="invoice-copy"]:checked'))
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
      setInvoiceCopies(result.value);
    });
    requestAnimationFrame(() => {
      window.setTimeout(() => printInvoice(), 800);
    });
  };

  const handleRevise = async () => {
    try {
      setIsRevising(true);
      const { data: preview } = await api.get(`/api/invoices/${id}/revision-preview`);
      if (!preview?.hasChanges) {
        await Swal.fire("No changes found", "Invoice already matches the latest Proforma Invoice.", "info");
        return;
      }
      const dependencyRows = [
        ["Payments", preview.dependencies?.payments],
        ["Credit Notes", preview.dependencies?.creditNotes],
        ["Debit Notes", preview.dependencies?.debitNotes],
        ["Delivery Challans", preview.deliveryChallans],
      ].filter(([, records]) => records?.length);
      const changedRows = (preview.changedFields || []).map((change) => `
        <tr>
          <td style="padding:5px;border-bottom:1px solid #e5e7eb;font-weight:600">${escapeHtml(change.label)}</td>
          <td style="padding:5px;border-bottom:1px solid #e5e7eb;color:#64748b">${escapeHtml(change.before || "—")}</td>
          <td style="padding:5px;border-bottom:1px solid #e5e7eb;color:#166534">${escapeHtml(change.after || "—")}</td>
        </tr>`).join("");
      const items = preview.itemChanges || {};
      const result = await Swal.fire({
        icon: dependencyRows.length ? "warning" : "question",
        title: `Revise ${escapeHtml(preview.invoice_no)} → Rev ${preview.next_revision}`,
        width: 720,
        html: `
          <div style="text-align:left;font-size:12px">
            <p><b>Invoice number same rahega.</b> Current copy revision history mein save hogi.</p>
            <div style="max-height:190px;overflow:auto;border:1px solid #e5e7eb;border-radius:6px">
              <table style="width:100%;border-collapse:collapse">
                <thead><tr style="background:#f8fafc"><th style="padding:5px;text-align:left">Field</th><th>Old</th><th>New</th></tr></thead>
                <tbody>${changedRows || '<tr><td colspan="3" style="padding:6px">Only items changed.</td></tr>'}</tbody>
              </table>
            </div>
            <p><b>Items:</b> ${items.added || 0} added, ${items.removed || 0} removed, ${items.modified || 0} modified</p>
            ${dependencyRows.map(([label, records]) => `<p style="margin:4px 0;color:#9a3412"><b>${label}:</b> ${records.length} linked — these records will not auto-change.</p>`).join("")}
            <input id="revision-reason" class="swal2-input" style="width:100%;margin:10px 0 0" placeholder="Revision reason (recommended)" />
          </div>`,
        showCancelButton: true,
        confirmButtonText: "Revise Same Invoice",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#b45309",
        preConfirm: () => document.getElementById("revision-reason")?.value?.trim() || "",
      });
      if (!result.isConfirmed) return;

      const revisedBy = localStorage.getItem("user_name") || sessionStorage.getItem("user_name") || "";
      const response = await api.post(`/api/invoices/${id}/revise-from-estimate`, {
        reason: result.value,
        revised_by: revisedBy,
      });
      setMatchedInvoice(response.data?.data);
      dispatch(fetchInvoices());
      await Swal.fire({
        icon: "success",
        title: `Invoice Revised — Rev ${response.data?.data?.revision_no}`,
        text: `Invoice number ${response.data?.data?.invoice_no} remains unchanged.`,
      });
    } catch (error) {
      await Swal.fire("Revision Failed", error.response?.data?.message || "Unable to revise invoice.", "error");
    } finally {
      setIsRevising(false);
    }
  };

  if (!matchedInvoice) {
    return <div className="text-center p-10">Loading invoice details...</div>;
  }

  return (
    <div className="bg-gray-100 p-6 min-h-screen ">
      <div className="max-w-[1000px] mx-auto flex justify-end mb-2">
        {(matchedInvoice.source_estimate_id || matchedInvoice.estimate_no)
          && String(matchedInvoice.status || "").toLowerCase() !== "cancelled"
          && !isCheckingChanges
          && hasChanges && (
            <button
              onClick={handleRevise}
              disabled={isRevising}
              className="mr-auto rounded px-3 py-2 text-white shadow-sm transition flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Update this invoice from latest Proforma Invoice while keeping the same invoice number"
            >
              <RefreshCw size={16} className={isRevising ? "animate-spin" : ""} />
              {isRevising ? "Checking..." : "Revise from PI"}
            </button>
          )}
        {Number(matchedInvoice.revision_no || 0) > 0 && (
          <span className="mr-2 rounded bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">
            Rev {matchedInvoice.revision_no}
          </span>
        )}
        <button
          onClick={() => navigate('/invoice-list')}
          className="bg-white rounded p-2 text-gray-500 hover:text-blue-500 shadow-sm border transition flex items-center justify-center"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => navigate(
            `/page-create-invoice/${matchedInvoice._id}`,
            { state: { backgroundLocation: location, returnTo: `/payments/invoiceDetails/${matchedInvoice._id}` } }
          )}
          disabled={String(matchedInvoice.status || "").toLowerCase() === "cancelled"}
          className="ml-2 rounded p-2 shadow-sm border transition flex items-center justify-center bg-white text-gray-500 hover:text-blue-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          title={String(matchedInvoice.status || "").toLowerCase() === "cancelled" ? "Cancelled invoices cannot be edited" : "Edit Invoice"}
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={handlePrint}
          disabled={hasChanges}
          className={`ml-2 rounded p-2 shadow-sm border transition flex items-center justify-center ${hasChanges ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-gray-500 hover:text-blue-500"
            }`}
          title={hasChanges ? "Please revise the invoice before printing" : "Print Invoice"}
        >
          <FaPrint size={18} />
        </button>
      </div>

      <div ref={sameRef}>
        {invoiceCopies.map((copyLabel, index) => (
          <div
            key={`${copyLabel}-${index}`}
            className="print-copy-page"
            style={{
              breakAfter: index < invoiceCopies.length - 1 ? "page" : "auto",
              pageBreakAfter: index < invoiceCopies.length - 1 ? "always" : "auto",
            }}
          >
            <InvoicePreviewTemplate
              matchedInvoice={matchedInvoice}
              matchedEstimate={matchedEstimate}
              heading={heading}
              invoiceCopy={copyLabel}
              payments={invoicePayments}
            />
            <div className="print-copy-page-label" style={{ display: "none" }}>1/1</div>
          </div>
        ))}

        {matchedInvoice.attachments?.length > 0 && (
          <div className="max-w-[1000px] mx-auto mt-4 space-y-4">
            {matchedInvoice.attachments.map((file, index) => {
              const fileUrl = `${SERVER_URL}${file.url}`;
              const isImage = file.mimeType?.startsWith('image/');
              return (
                <div key={`${file.url}-${index}`} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Paperclip size={14} className="text-gray-500 shrink-0" />
                    <span className="flex-1 min-w-0 truncate text-sm font-bold text-gray-800">{file.originalName}</span>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="print:hidden shrink-0 flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Open <Download size={12} />
                    </a>
                  </div>
                  {isImage ? (
                    <img src={fileUrl} alt={file.originalName} className="w-full max-h-[800px] object-contain rounded-md border border-gray-100" />
                  ) : (
                    <PdfAttachmentPages key={fileUrl} url={fileUrl} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceNumberDetails;
