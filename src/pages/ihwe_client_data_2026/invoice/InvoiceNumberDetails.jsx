import React, { useRef, useState, useEffect } from "react";
import mainpic from "../../../assets/header.png";
import { useReactToPrint } from "react-to-print";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchInvoices } from "../../../features/invoice/invoiceSlice";
import { fetchEstimates } from "../../../features/estimates/estimateSlice";
import { fetchCompanies } from "../../../features/company/companySlice";
import { useSelector, useDispatch } from "react-redux";
import { FaPrint } from "react-icons/fa";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../lib/api";
import InvoicePreviewTemplate from "./InvoicePreviewTemplate";

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

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

  // redux logic
  const { invoices } = useSelector((state) => state.invoice);
  const { companies } = useSelector((state) => state.companies);
  const { estimates, loading } = useSelector((state) => state.estimates);

  //   console.log("id", id);
  //   console.log("invoices", invoices);
  // console.log("matchedInvoice", matchedInvoice);
  // console.log("matchedEstimate", matchedEstimate);
  //   console.log("companies", companies);
  //   console.log("company", company);

  React.useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchCompanies());
  }, [dispatch]);

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

  const handleprint = useReactToPrint({
    contentRef: sameRef,
    documentTitle: "invoice",
  });

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
          && String(matchedInvoice.status || "").toLowerCase() !== "cancelled" && (
          <button
            onClick={handleRevise}
            disabled={isRevising || isCheckingChanges || !hasChanges}
            className={`mr-auto rounded px-3 py-2 text-white shadow-sm transition flex items-center gap-2 ${
              isCheckingChanges || !hasChanges ? "bg-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"
            }`}
            title={!hasChanges ? "No changes found" : "Update this invoice from latest Proforma Invoice while keeping the same invoice number"}
          >
            <RefreshCw size={16} className={isRevising || isCheckingChanges ? "animate-spin" : ""} />
            {isRevising ? "Checking..." : isCheckingChanges ? "Checking changes..." : "Revise from PI"}
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
          onClick={handleprint}
          disabled={hasChanges}
          className={`ml-2 rounded p-2 shadow-sm border transition flex items-center justify-center ${
            hasChanges ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-gray-500 hover:text-blue-500"
          }`}
          title={hasChanges ? "Please revise the invoice before printing" : "Print Invoice"}
        >
          <FaPrint size={18} />
        </button>
      </div>
      <div ref={sameRef}>
        <InvoicePreviewTemplate matchedInvoice={matchedInvoice} heading={heading} />
      </div>
    </div>
  );
};

export default InvoiceNumberDetails;
