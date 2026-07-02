import React, { useState, useEffect, useCallback } from "react";
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
import { MessageCircleMore, Mail, Ban, Truck, Plus } from "lucide-react";
import CommunicationModal from "../../components/CommunicationModal";

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

  // 📝 Helper function to format the PI date
  const formatPiDate = (dateString) => {
    if (!dateString) return "N/A";
    const dateObj = new Date(dateString);
    return dateObj
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
      .replace(/\//g, " ");
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
    const dateObj = new Date(dateString);
    return dateObj
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
      .replace(/\//g, " ");
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
    const estimateAmount = (estimate?.items || []).reduce((total, item) => {
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

    if (!isCancelled(estimate)) {
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

  return (
    <div className="overflow-x-auto p-1">
      <table className="min-w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50">S.No.</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50">Proforma Invoice</th>
            {(clientId === 'all' || id === 'all') && (
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50">Company / Client</th>
            )}
            {(clientId !== 'all' && id !== 'all') && (
              <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50">Delivery Challan</th>
            )}
            {(clientId !== 'all' && id !== 'all') && (
              <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-black uppercase tracking-wider border border-gray-300">Invoice</th>
            )}
            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50">Updated Details</th>
            {(clientId !== 'all' && id !== 'all') && (
              <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50">Status</th>
            )}
            {(clientId !== 'all' && id !== 'all') && (
              <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50">Action</th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {displayRows.map((row, index) => {
            const { estimate, piData, invoiceData, rowType, displayEstNo, isFirstForEstimate, estimateRowSpan, rowInstanceKey } = row;
            const totalFinalAmount = estimate?.items?.reduce((total, item) => {
              return total + (parseFloat(item.finalAmount) || 0);
            }, 0);
            const displayAmount = totalFinalAmount?.toFixed(2) || "0.00";

            let formattedDate = "N/A";
            if (estimate?.supply_date) {
              const dateObj = new Date(estimate.supply_date);
              formattedDate = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).replace(/\//g, " ");
            }
            let formattedUpdatedDate = "N/A";
            if (estimate?.updated) {
              const dateObj = new Date(estimate.updated);
              formattedUpdatedDate = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).replace(/\//g, " ");
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
              <tr key={rowInstanceKey} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                {isFirstForEstimate && (
                  <>
                    <td rowSpan={estimateRowSpan} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left align-top">{indexOfFirstItem + currentEstimates.findIndex((item) => item._id === estimate._id) + 1}</td>
                    <td rowSpan={estimateRowSpan} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left align-top">
                      <div className="flex items-center justify-start gap-2">
                        <Link to={`/payments/estimateDetails/${estimate?._id}`} state={{ displayEstNo: estimate?.est_no, documentStatus: isCancelled(estimate) ? "cancelled" : "active", invoiceStatus: "" }}>
                          <button className="text-[#3598dc] cursor-pointer hover:text-[#566e7d] font-medium px-1">{estimate?.est_no}</button>
                        </Link>
                        <span>| {formattedDate} | {displayAmount}</span>
                      </div>
                    </td>
                  </>
                )}
                {(clientId === 'all' || id === 'all') && (
                  isFirstForEstimate && (
                    <td rowSpan={estimateRowSpan} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left align-top">
                      <span className="font-semibold text-gray-800">{companyClientName}</span>
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
                            <div key={challan._id || idx} className="flex items-center justify-between text-[10px]">
                              <span className="text-[#3598dc] font-medium cursor-pointer hover:text-[#566e7d]" onClick={() => navigate(`/dashboard/account/${estimate.companyId}/delivery-challans`, { state: { viewChallanId: challan._id, sourceEstimateId: estimate._id } })} title="View Challan">
                                {challan.challan_no}
                              </span>
                              <span className="text-slate-500">{formatPiDate(challan.challan_date || challan.createdAt)}</span>
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left">
                    {isPiCreated && (
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/payments/performanceInvoiceDetails/${piDataToDisplay._id}`}>
                          <button className="text-[#3598dc] cursor-pointer hover:text-[#566e7d] font-medium px-1">{piDataToDisplay.pi_no}</button>
                        </Link>
                        <span>| {formatPiDate(piDataToDisplay.updated) || "N/A"} | {piDataToDisplay.finalAmount?.toFixed(2) || "0.00"}</span>
                      </div>
                    )}
                    {invoiceData ? (
                      <div className="flex items-center justify-center gap-1 mt-1 text-sm">
                        <button className="text-[#3598dc] cursor-pointer hover:text-[#566e7d] font-medium px-1" onClick={() => navigate(`/payments/estimateDetails/${estimate._id}`, { state: { displayEstNo: displayEstNo || estimate?.est_no, documentStatus: rowType === "cancelled" ? "cancelled" : "active", invoiceStatus: invoiceData?.status || "" } })} title="Open estimate overview">{invoiceData.invoice_no}</button>
                        <span>| {formatInvoiceDate(invoiceData.invoice_date || invoiceData.supply_date || invoiceData.updated)} | {Number(invoiceData.finalAmount || 0).toFixed(2)}</span>
                      </div>
                    ) : null}
                    {!invoiceData && !isPiCreating && rowType !== "cancelled" && !isCancelled(estimate) && (
                      <div className="flex items-center justify-center">
                        <button className={stylebutton} onClick={() => navigate(`/page-create-invoice/${estimate.companyId}/${encodeURIComponent(displayEstNo || estimate.est_no)}`, { state: { sourceEstimateId: estimate._id, sourceEstimateNo: estimate.est_no, selectedPiNo: displayEstNo || estimate.est_no, returnTo: `/performa-invoice-list/${estimate.companyId}` } })} disabled={isPiCreating}>Create Invoice</button>
                      </div>
                    )}
                    {isPiCreating && <span className="text-[#3598dc] font-medium">Creating...</span>}
                    {piError && <span className="text-red-500 font-medium">{piError}</span>}
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left">
                  <span className="text-gray-500">{formattedUpdatedDate}</span> <span className="text-gray-300 mx-1">|</span> <span className="font-medium capitalize">{estimate?.added_by}</span>
                </td>
                {(clientId !== 'all' && id !== 'all') && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <StatusBadge status={rowType === "cancelled" ? "Cancelled" : getEstimateStatus(estimate)} />
                  </td>
                )}
                {(clientId !== 'all' && id !== 'all') && (
                  <td className="px-7 py-3 whitespace-nowrap text-sm font-medium items-center gap-2 text-center">
                    {rowType === "cancelled" ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button type="button" onClick={() => handleSendWhatsApp(estimate._id)} className="border border-green-500 text-green-600 hover:text-white hover:bg-green-500 p-1.5 rounded flex items-center justify-center cursor-pointer transition-colors" title="Send WhatsApp">
                          <MessageCircleMore size={16} />
                        </button>
                        <button type="button" onClick={() => handleSendEmail(estimate._id)} className="border border-blue-500 text-blue-600 hover:text-white hover:bg-blue-500 p-1.5 rounded flex items-center justify-center cursor-pointer transition-colors" title="Send Email">
                          <Mail size={16} />
                        </button>
                        <button type="button" disabled={actionLoaders[`${estimate._id}_cancel`]} onClick={() => handleCancelDocuments(estimate, invoiceData)} className="border border-red-500 text-red-600 hover:text-white hover:bg-red-500 p-1.5 rounded flex items-center justify-center cursor-pointer transition-colors disabled:opacity-60" title="Cancel Document">
                          {actionLoaders[`${estimate._id}_cancel`] ? <span className="animate-spin text-xs">↻</span> : <Ban size={16} />}
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
