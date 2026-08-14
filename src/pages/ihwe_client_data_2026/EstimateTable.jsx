import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEstimates, fetchAllGlobalEstimates } from "../../features/estimates/estimateSlice";
import {
  createPerformaInvoice,
  fetchPerformaInvoices,
} from "../../features/performaInvoice/performaInvoiceSlice";
import { fetchInvoices } from "../../features/invoice/invoiceSlice";
import api from "../../lib/api";
import Swal from "sweetalert2";
import { MessageCircleMore, Mail, Ban, Truck, Plus, FileText, CheckCircle2, Clock, Users, DollarSign, Package } from "lucide-react";
import CommunicationModal from "../../components/CommunicationModal";

// Hook: animate number from 0 to target when element enters viewport
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numTarget = parseFloat(target) || 0;
    if (numTarget === 0) { setCount(0); return; }
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(ease * numTarget);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { ref, count };
}

function AnimatedStatCard({ icon, gradientTo, iconBg, rawValue, displayValue, label, subLabel, subColor }) {
  const { ref, count } = useCountUp(rawValue);
  return (
    <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>
              {displayValue(count)}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>{label}</span>
          </div>
        </div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: subColor, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{subLabel}</div>
      </div>
    </div>
  );
}

const stylebutton =
  "w-fit text-[#3598dc] cursor-pointer border border-[#3598dc] hover:bg-[#3598dc] hover:text-white font-medium flex  items-center gap-1 px-1";

const looksLikeEventName = (value = "") => {
  const text = String(value).toLowerCase();
  return text.includes("international health") || text.includes("ihwe global") || text.includes("expo");
};

const isCancelled = (doc) => String(doc?.status || "").toLowerCase() === "cancelled";

const CancelledMark = () => (
  <span className="ml-2 inline-flex items-center rounded border border-red-300 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600">
    × Cancelled
  </span>
);

const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();
  const styles = {
    cancelled: "border-red-300 bg-red-50 text-red-600",
    "e-sent": "border-blue-300 bg-blue-50 text-blue-600",
    "w-sent": "border-emerald-300 bg-emerald-50 text-emerald-600",
    "e/w-sent": "border-teal-300 bg-teal-50 text-teal-700",
    sent: "border-slate-300 bg-slate-50 text-slate-600",
  };

  if (!normalized || normalized === "active") {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <span className={`inline-flex items-center rounded border px-2 py-1 text-[10px] font-bold uppercase ${styles[normalized] || styles.sent}`}>
      {status}
    </span>
  );
};

const getEstimateStatus = (estimate) => {
  if (isCancelled(estimate)) return "Cancelled";
  const emailSent = Boolean(estimate?.emailSent || estimate?.emailSentAt);
  const whatsappSent = Boolean(estimate?.whatsappSent || estimate?.whatsappSentAt);
  if (emailSent && whatsappSent) return "E/W-Sent";
  if (emailSent) return "E-Sent";
  if (whatsappSent) return "W-Sent";
  return "Sent";
};

const EstimateTable = ({ clientId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  // Redux state for estimates
  const { estimates, loading: estimatesLoading } = useSelector(
    (state) => state.estimates
  );
  // Redux state for PIs
  const { perInvoices, loading: piLoading } = useSelector(
    (state) => state.perinvoice
  );
  const [perInvoiceState, setPerInvoiceState] = useState({});
  const { invoices } = useSelector((state) => state.invoice);
  // console.log("estimates..", estimates);
  // console.log("invoices..", invoices);

  useEffect(() => {
    if (estimates.length > 0 && id) {
      const matchedEstimate = estimates.find((c) => c._id === id);
    }
  }, [estimates, id]);

  useEffect(() => {
    if (clientId === 'all') {
      dispatch(fetchAllGlobalEstimates());
    } else if (clientId || id) {
      dispatch(fetchEstimates(clientId || id));
    }
    dispatch(fetchPerformaInvoices());
    dispatch(fetchInvoices());
  }, [dispatch, clientId, id]);

  // Handler for PI creation
  const handleCreatePI = useCallback(
    (estimate, totalFinalAmount) => {
      const estimateId = estimate._id;

      // 1. Set row-specific loading state
      setPerInvoiceState((prev) => ({
        ...prev,
        [estimateId]: { isCreating: true, piData: null, error: null },
      }));

      const invoiceData = {
        est_no: estimate.est_no,
        companyId: estimate.companyId,
        finalAmount: totalFinalAmount,
      };

      // 2. Dispatch the async thunk
      dispatch(createPerformaInvoice(invoiceData))
        .unwrap()
        .then((newPiData) => {
          // 3. Success: Update row state with the new PI data
          setPerInvoiceState((prev) => ({
            ...prev,
            [estimateId]: { isCreating: false, piData: newPiData, error: null },
          }));
        })
        .catch((err) => {
          // 4. Failure: Update row state with the error
          setPerInvoiceState((prev) => ({
            ...prev,
            [estimateId]: {
              isCreating: false,
              piData: null,
              error: err || "Failed to create PI",
            },
          }));
        });
    },
    [dispatch]
  );

  const [commModal, setCommModal] = useState({
    isOpen: false,
    type: 'whatsapp',
    docType: 'proforma',
    docId: null
  });

  const [actionLoaders, setActionLoaders] = useState({});
  const [deliveryChallans, setDeliveryChallans] = useState([]);

  useEffect(() => {
    if (!clientId || clientId === "all") {
      setDeliveryChallans([]);
      return;
    }
    api.get(`/api/delivery-challans?companyId=${clientId}`)
      .then((response) => setDeliveryChallans(Array.isArray(response.data) ? response.data : []))
      .catch(() => setDeliveryChallans([]));
  }, [clientId]);

  const handleSendWhatsApp = (estimateId) => {
    setCommModal({ isOpen: true, type: 'whatsapp', docType: 'proforma', docId: estimateId });
  };

  const handleSendEmail = (estimateId) => {
    setCommModal({ isOpen: true, type: 'email', docType: 'proforma', docId: estimateId });
  };

  const refreshEstimateRows = useCallback(() => {
    if (clientId === 'all') {
      dispatch(fetchAllGlobalEstimates());
    } else if (clientId || id) {
      dispatch(fetchEstimates(clientId || id));
    }
    dispatch(fetchInvoices());
  }, [clientId, dispatch, id]);

  // New function to handle navigation for Print/Copy buttons
  const handlePrintCopyNavigation = (copyType, invId) => {
    if (!invId) {
      alert("Invoice not found. Please create an invoice first.");
      return;
    }
    navigate(`/payments/ODT/taxInvoiceDetails/${invId}`, {
      state: { heading: copyType },
    });
  };

  // 🕒 Helper function to format the PI date
  const formatPiDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year}, ${time}`;
  };

  const handleCancelDocuments = async (estimate, matchingInvoice) => {
    const result = await Swal.fire({
      title: "Mark as cancelled?",
      text: matchingInvoice
        ? "This invoice status will become Cancelled and the row will stay visible."
        : "This proforma invoice status will become Cancelled and the row will stay visible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Mark Cancelled",
      cancelButtonText: "Keep Active",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoaders(prev => ({ ...prev, [`${estimate._id}_cancel`]: true }));
      await api.put(`/api/estimates/${estimate._id}`, { status: "cancelled" });
      if (matchingInvoice?._id) {
        await api.put(`/api/invoices/${matchingInvoice._id}`, { status: "cancelled" });
      }
      Swal.fire("Cancelled", "Document status updated.", "success");
      if (clientId === "all") {
        dispatch(fetchAllGlobalEstimates());
      } else if (clientId || id) {
        dispatch(fetchEstimates(clientId || id));
      }
      dispatch(fetchInvoices());
    } catch (error) {
      console.error("Error cancelling documents:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to cancel documents", "error");
    } finally {
      setActionLoaders(prev => ({ ...prev, [`${estimate._id}_cancel`]: false }));
    }
  };
  const formatInvoiceDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year}, ${time}`;
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEstimates = estimates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(estimates.length / itemsPerPage);
  const buildSortLatestFirst = (a, b) => {
    const aTime = new Date(a?.added || a?.updated || 0).getTime();
    const bTime = new Date(b?.added || b?.updated || 0).getTime();
    return bTime - aTime;
  };
  const getDocumentSeq = (docNo) => {
    const lastPart = String(docNo || "").split("/").pop();
    const seq = parseInt(lastPart, 10);
    return Number.isNaN(seq) ? null : seq;
  };
  const buildDocumentNoWithSeq = (docNo, seq) => {
    const parts = String(docNo || "").split("/");
    const lastPart = parts[parts.length - 1];
    parts[parts.length - 1] = String(seq).padStart(lastPart.length, "0");
    return parts.join("/");
  };
  const getDocumentPrefix = (docNo) => String(docNo || "").split("/").slice(0, -1).join("/");
  const currentEstimateNos = new Set(currentEstimates.map((estimate) => estimate.est_no).filter(Boolean));
  const displayRows = currentEstimates.flatMap((estimate) => {
    const baseSeq = getDocumentSeq(estimate.est_no);
    const basePrefix = getDocumentPrefix(estimate.est_no);
    // Prefer the estimate's own saved finalAmount — it's the actual grand
    // total (includes PLC Charges + its GST, which aren't line items).
    // Re-summing item.finalAmount here under-counts by exactly that PLC
    // amount whenever one applies. Fall back to the item sum only for very
    // old records that predate finalAmount being saved.
    const estimateAmount = Number(estimate?.finalAmount) || (estimate?.items || []).reduce((total, item) => {
      return total + (parseFloat(item.finalAmount) || 0);
    }, 0);
    const matchingPerformaInvoices = perInvoices
      .filter((pi) => pi.est_no === estimate.est_no)
      .sort(buildSortLatestFirst);

    const matchingInvoices = invoices
      .filter((inv) => {
        if (inv.companyId && estimate.companyId && String(inv.companyId) !== String(estimate.companyId)) return false;
        if (inv.estimate_no === estimate.est_no) return true;
        if (inv.source_estimate_id && String(inv.source_estimate_id) === String(estimate._id)) return true;
        const invSeq = getDocumentSeq(inv.estimate_no);
        const sameAmount = Math.abs((Number(inv.finalAmount) || 0) - estimateAmount) < 0.01;
        return baseSeq !== null && invSeq !== null && invSeq >= baseSeq && getDocumentPrefix(inv.estimate_no) === basePrefix && sameAmount;
      })
      .sort(buildSortLatestFirst);

    const versionNos = Array.from(new Set([
      estimate.est_no,
      ...matchingInvoices.map((inv) => inv.estimate_no).filter(Boolean),
    ])).sort((a, b) => (getDocumentSeq(a) || 0) - (getDocumentSeq(b) || 0));

    const rows = versionNos.flatMap((versionNo) => {
      const versionInvoices = matchingInvoices.filter((inv) => inv.estimate_no === versionNo);
      const piForVersion = versionNo === estimate.est_no
        ? matchingPerformaInvoices.find((pi) => isCancelled(pi) === isCancelled(estimate)) || matchingPerformaInvoices[0] || null
        : null;

      const invoiceRows = versionInvoices.map((invoice) => ({
        estimate,
        displayEstNo: versionNo,
        piData: piForVersion,
        invoiceData: invoice,
        rowType: isCancelled(invoice) ? "cancelled" : "active",
      }));

      if (versionNo === estimate.est_no && isCancelled(estimate) && !invoiceRows.some((row) => row.rowType === "cancelled")) {
        invoiceRows.push({
          estimate,
          displayEstNo: versionNo,
          piData: piForVersion,
          invoiceData: null,
          rowType: "cancelled",
        });
      }

      return invoiceRows;
    });

    const hasActiveInvoice = matchingInvoices.some(inv => !isCancelled(inv));
    if (!isCancelled(estimate) && !hasActiveInvoice) {
      rows.push({
        estimate,
        displayEstNo: estimate.est_no,
        piData: null,
        invoiceData: null,
        rowType: "active",
      });
    }

    return rows.map((row, rowIndex) => ({
      ...row,
      rowInstanceKey: `${estimate._id}-${row.displayEstNo}-${row.invoiceData?._id || row.rowType}-${rowIndex}`,
      isFirstForEstimate: rowIndex === 0,
      estimateRowSpan: rows.length,
    }));
  });

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalProformas = estimates?.length || 0;
  // Same as estimateAmount/totalFinalAmount below — use each estimate's saved
  // grand total (includes PLC Charges) rather than re-summing items.
  const totalValue = (estimates || []).reduce((sum, est) => sum + (Number(est.finalAmount) || (est.items || []).reduce((s, i) => s + (parseFloat(i.finalAmount) || 0), 0)), 0);
  const activeProformas = (estimates || []).filter(est => !isCancelled(est)).length;
  const cancelledProformas = (estimates || []).filter(est => isCancelled(est)).length;

  const statCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-2">
      <AnimatedStatCard
        icon={<FileText className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
        gradientTo="to-blue-50" iconBg="bg-blue-100"
        rawValue={totalProformas}
        displayValue={(c) => Math.round(c)}
        label="TOTAL PROFORMAS"
        subLabel="Created" subColor="#2563eb"
      />
      <AnimatedStatCard
        icon={<DollarSign className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />}
        gradientTo="to-indigo-50" iconBg="bg-indigo-100"
        rawValue={totalValue}
        displayValue={(c) => `₹ ${Math.round(c).toLocaleString('en-IN')}`}
        label="TOTAL VALUE"
        subLabel="Amount" subColor="#4f46e5"
      />
      <AnimatedStatCard
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
        gradientTo="to-emerald-50" iconBg="bg-emerald-100"
        rawValue={activeProformas}
        displayValue={(c) => Math.round(c)}
        label="ACTIVE PROFORMAS"
        subLabel="Valid" subColor="#059669"
      />
      <AnimatedStatCard
        icon={<Ban className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
        gradientTo="to-rose-50" iconBg="bg-rose-100"
        rawValue={cancelledProformas}
        displayValue={(c) => Math.round(c)}
        label="CANCELLED"
        subLabel="Invalid" subColor="#e11d48"
      />
    </div>
  );

  return (
    <div className="overflow-x-auto p-1">
      {statCards}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-xs whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
          <thead className="bg-slate-50 uppercase tracking-wide text-slate-500 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">S.No.</th>
              <th scope="col" className="px-4 py-3 font-bold">Proforma Invoice</th>
              {(clientId === 'all' || id === 'all') && (
                <th scope="col" className="px-4 py-3 font-bold">Company / Client</th>
              )}
              {(clientId !== 'all' && id !== 'all') && (
                <th scope="col" className="px-4 py-3 font-bold text-center">Delivery Challan</th>
              )}
              {(clientId !== 'all' && id !== 'all') && (
                <th scope="col" className="px-4 py-3 font-bold text-center">Invoice</th>
              )}
              <th scope="col" className="px-4 py-3 font-bold">Updated Details</th>
              {(clientId !== 'all' && id !== 'all') && (
                <th scope="col" className="px-4 py-3 font-bold text-center">Status</th>
              )}
              {(clientId !== 'all' && id !== 'all') && (
                <th scope="col" className="px-4 py-3 font-bold text-center">Action</th>
              )}
            </tr>
          </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {displayRows.map((row, index) => {
            const { estimate, piData, invoiceData, rowType, displayEstNo, isFirstForEstimate, estimateRowSpan, rowInstanceKey } = row;
            // Same as estimateAmount above — use the saved grand total (includes
            // PLC Charges) rather than re-summing items, which under-counts it.
            const totalFinalAmount = Number(estimate?.finalAmount) || estimate?.items?.reduce((total, item) => {
              return total + (parseFloat(item.finalAmount) || 0);
            }, 0) || 0;
            const displayAmount = totalFinalAmount.toFixed(2);

            let formattedDate = "N/A";
            if (estimate?.supply_date) {
              formattedDate = formatPiDate(estimate.supply_date);
            }
            let formattedUpdatedDate = "N/A";
            if (estimate?.updated) {
              formattedUpdatedDate = formatPiDate(estimate.updated);
            }

            const localPiState = perInvoiceState[estimate._id];
            const piDataToDisplay = localPiState?.piData || piData;
            const isPiCreated = !!piDataToDisplay;
            const isPiCreating = localPiState?.isCreating;
            const piError = localPiState?.error;
            const companyClientName = estimate?.company_name || (!looksLikeEventName(estimate?.consignee_name) ? estimate?.consignee_name : "") || "Unknown";
            const estimateChallans = deliveryChallans.filter((challan) => String(challan.source_estimate_id) === String(estimate._id));
            const activeChallans = estimateChallans.filter((challan) => !isCancelled(challan));
            const challanQty = activeChallans.reduce((sum, challan) => sum + (challan.items || []).reduce((itemSum, item) => itemSum + (Number(item.qty) || 0), 0), 0);
            const proformaQty = (estimate.items || []).reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
            const remainingChallanQty = Math.max(0, proformaQty - challanQty);

            return (
              <tr key={rowInstanceKey} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                {isFirstForEstimate && (
                  <>
                    <td rowSpan={estimateRowSpan} className="px-4 py-3 align-top font-bold text-[11px]" style={{ color: '#093C5D' }}>{indexOfFirstItem + currentEstimates.findIndex((item) => item._id === estimate._id) + 1}</td>
                    <td rowSpan={estimateRowSpan} className="px-4 py-3 align-top text-[10px] text-slate-700">
                      <div className="flex flex-col gap-0.5 items-start justify-center">
                        <div className="flex items-center gap-1">
                          <Link to={`/payments/estimateDetails/${estimate?._id}`} state={{ displayEstNo: estimate?.est_no, documentStatus: isCancelled(estimate) ? "cancelled" : "active", invoiceStatus: "" }}>
                            <button className="text-[#194090] cursor-pointer hover:text-blue-700 font-bold px-1 text-[11px]">{estimate?.est_no}</button>
                          </Link>
                          <span className="font-bold text-emerald-600">| {displayAmount}</span>
                        </div>
                        <span className="text-slate-500 text-left">{formattedDate}</span>
                      </div>
                    </td>
                  </>
                )}
                {(clientId === 'all' || id === 'all') && (
                  isFirstForEstimate && (
                    <td rowSpan={estimateRowSpan} className="px-4 py-3 align-top text-[10px]">
                      <span className="font-bold text-slate-800">{companyClientName}</span>
                    </td>
                  )
                )}
                {(clientId !== 'all' && id !== 'all') && isFirstForEstimate && (
                  <td rowSpan={estimateRowSpan} className="px-4 py-3 align-top">
                    <div className="min-w-[190px] rounded-lg border border-teal-100 bg-teal-50/60 p-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-teal-800"><Truck size={14} /> {activeChallans.length} Challan{activeChallans.length === 1 ? "" : "s"}</span>
                        <span className="text-[10px] font-bold text-slate-500">{challanQty}/{proformaQty} qty</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-teal-100">
                        <div className="h-full rounded-full bg-teal-600" style={{ width: `${proformaQty ? Math.min(100, (challanQty / proformaQty) * 100) : 0}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">{remainingChallanQty} quantity remaining</p>
                      
                      {activeChallans.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1 border-t border-teal-100 pt-2">
                          {activeChallans.map((challan, idx) => (
                            <div key={challan._id || idx} className="flex items-center justify-between text-[10px] gap-2">
                              <span className="text-[#3598dc] font-medium cursor-pointer hover:text-[#566e7d] truncate" onClick={() => navigate(`/dashboard/account/${estimate.companyId}/delivery-challans`, { state: { viewChallanId: challan._id, sourceEstimateId: estimate._id } })} title={challan.challan_no}>
                                {challan.challan_no}
                              </span>
                              <span className="text-slate-500 shrink-0 text-right">{formatPiDate(challan.challan_date || challan.createdAt)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex gap-1.5">
                        <button type="button" onClick={() => navigate(`/dashboard/account/${estimate.companyId}/delivery-challans`, { state: { sourceEstimateId: estimate._id } })} disabled={isCancelled(estimate) || remainingChallanQty <= 0} className="flex items-center gap-1 rounded border border-teal-600 bg-teal-600 px-2 py-1 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Plus size={12} /> Create</button>
                        {estimateChallans.length > 0 && <button type="button" onClick={() => navigate(`/dashboard/account/${estimate.companyId}/delivery-challans`)} className="rounded border border-teal-600 bg-white px-2 py-1 text-[10px] font-bold text-teal-700">View All</button>}
                      </div>
                    </div>
                  </td>
                )}
                {(clientId !== 'all' && id !== 'all') && (
                  <td className="px-4 py-3 align-top text-[10px]">
                    {piDataToDisplay && !isPiCreating ? (
                        <div className="flex flex-col gap-0.5 items-start justify-center mt-1">
                          <div className="flex items-center gap-1">
                            <Link to={`/payments/performanceInvoiceDetails/${piDataToDisplay._id}`}>
                              <button className="text-[#194090] cursor-pointer hover:text-blue-700 font-bold px-1">{piDataToDisplay.pi_no}</button>
                            </Link>
                            <span className="font-bold text-emerald-600">| {piDataToDisplay.finalAmount?.toFixed(2) || "0.00"}</span>
                          </div>
                          <span className="text-slate-500 text-left pl-1">{formatPiDate(piDataToDisplay.updated) || "N/A"}</span>
                        </div>
                      ) : null}
                    {invoiceData ? (
                      <div className="flex flex-col gap-0.5 items-start justify-center mt-1">
                        <div className="flex items-center gap-1">
                          <button
                            className="text-[#194090] cursor-pointer hover:text-blue-700 font-bold px-1"
                            onClick={() => navigate(`/payments/invoiceDetails/${invoiceData._id}`)}
                            title="Open invoice"
                          >
                            {invoiceData.invoice_no}
                          </button>
                          <span className="font-bold text-emerald-600">| {Number(invoiceData.finalAmount || 0).toFixed(2)}</span>
                        </div>
                        <span className="text-slate-500 text-left pl-1">{formatInvoiceDate(invoiceData.invoice_date || invoiceData.supply_date || invoiceData.updated)}</span>
                      </div>
                    ) : null}
                    {!invoiceData && !isPiCreating && rowType !== "cancelled" && !isCancelled(estimate) && (
                      <div className="flex items-center justify-center mt-1">
                        <button className="rounded border border-[#194090] px-2 py-0.5 text-[10px] font-bold text-[#194090] hover:bg-[#194090] hover:text-white transition-colors" onClick={() => navigate(`/page-create-invoice/${estimate.companyId}/${encodeURIComponent(displayEstNo || estimate.est_no)}`, { state: { sourceEstimateId: estimate._id, sourceEstimateNo: estimate.est_no, selectedPiNo: displayEstNo || estimate.est_no, returnTo: `/payments/estimateDetails/${estimate._id}` } })} disabled={isPiCreating}>Create Invoice</button>
                      </div>
                    )}
                    {isPiCreating && <span className="text-[#194090] font-bold text-center block mt-1">Creating...</span>}
                    {piError && <span className="text-red-500 font-bold text-center block mt-1">{piError}</span>}
                  </td>
                )}
                <td className="px-4 py-3 align-top text-[10px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-700 capitalize">{estimate?.added_by}</span>
                    <span className="text-slate-500">{formattedUpdatedDate}</span>
                  </div>
                </td>
                {(clientId !== 'all' && id !== 'all') && (
                  <td className="px-4 py-3 align-top text-center">
                    <StatusBadge status={rowType === "cancelled" ? "Cancelled" : getEstimateStatus(estimate)} />
                  </td>
                )}
                {(clientId !== 'all' && id !== 'all') && (
                  <td className="px-4 py-3 align-top">
                    {rowType === "cancelled" ? (
                      <span className="text-slate-400 font-bold block text-center">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        <button type="button" onClick={() => handleSendWhatsApp(estimate._id)} className="rounded border border-slate-200 p-1.5 text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed" title="Send WhatsApp">
                          <MessageCircleMore size={13} />
                        </button>
                        <button type="button" onClick={() => handleSendEmail(estimate._id)} className="rounded border border-slate-200 p-1.5 text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed" title="Send Email">
                          <Mail size={13} />
                        </button>
                        <button type="button" disabled={actionLoaders[`${estimate._id}_cancel`]} onClick={() => handleCancelDocuments(estimate, invoiceData)} className="rounded border border-slate-200 p-1.5 text-red-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60" title="Cancel Document">
                          {actionLoaders[`${estimate._id}_cancel`] ? <span className="animate-spin text-xs inline-block">↻</span> : <Ban size={13} />}
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-3 px-4 bg-white border-t border-gray-200">
          <span className="text-sm text-gray-700">Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastItem, estimates.length)}</span> of <span className="font-semibold">{estimates.length}</span> entries</span>
          <div className="flex gap-1">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1 text-sm rounded border ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}>Previous</button>
            <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                  return (
                    <button key={pageNum} onClick={() => paginate(pageNum)} className={`px-3 py-1 text-sm rounded border ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
                  );
                }
                if (pageNum === currentPage - 3 || pageNum === currentPage + 3) return <span key={pageNum} className="px-2 py-1">...</span>;
                return null;
              })}
            </div>
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1 text-sm rounded border ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}>Next</button>
          </div>
        </div>
      )}
      <CommunicationModal
        isOpen={commModal.isOpen}
        onClose={() => setCommModal({ ...commModal, isOpen: false, docId: null })}
        type={commModal.type}
        docType={commModal.docType}
        docId={commModal.docId}
        refreshData={refreshEstimateRows}
      />
    </div>
  );
};

export default EstimateTable;
