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
import { MessageCircleMore, Mail } from "lucide-react";

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
  const cancelled = String(status || "").toLowerCase() === "cancelled";
  if (!cancelled) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <span className="inline-flex items-center rounded border border-red-300 bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-600">
      Cancelled
    </span>
  );
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

  const [actionLoaders, setActionLoaders] = useState({});

  const handleSendWhatsApp = async (estimateId) => {
    try {
      setActionLoaders(prev => ({ ...prev, [`${estimateId}_wa`]: true }));
      const res = await api.post(`/api/estimates/${estimateId}/send-whatsapp`, {});
      if (res.status === 200) {
        Swal.fire('Success', 'WhatsApp message sent successfully', 'success');
      }
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to send WhatsApp message', 'error');
    } finally {
      setActionLoaders(prev => ({ ...prev, [`${estimateId}_wa`]: false }));
    }
  };

  const handleSendEmail = async (estimateId) => {
    try {
      setActionLoaders(prev => ({ ...prev, [`${estimateId}_email`]: true }));
      const res = await api.post(`/api/estimates/${estimateId}/send-email`, {});
      if (res.status === 200) {
        Swal.fire('Success', 'Email sent successfully', 'success');
      }
    } catch (error) {
      console.error("Error sending Email:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to send Email', 'error');
    } finally {
      setActionLoaders(prev => ({ ...prev, [`${estimateId}_email`]: false }));
    }
  };

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
  // const handleCreateINV = () => {
  //   navigate(`/payments/createInvoice/${estimates?.est_no}`);
  // };

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
  const incrementDocumentNo = (docNo) => {
    const parts = String(docNo || "").split("/");
    const lastPart = parts[parts.length - 1];
    const nextNum = parseInt(lastPart, 10);
    if (Number.isNaN(nextNum)) return docNo;
    parts[parts.length - 1] = String(nextNum + 1).padStart(lastPart.length, "0");
    return parts.join("/");
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

    return rows;
  });

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="overflow-x-auto p-1">
      <table className="min-w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50"
            >
              S.No.
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50"
            >
              Proforma Invoice
            </th>
            {(clientId === 'all' || id === 'all') && (
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50"
              >
                Company / Client
              </th>
            )}
            {(clientId !== 'all' && id !== 'all') && (
              <th
                scope="col"
                className="px-4 py-2 text-center text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
              >
                Invoice
              </th>
            )}
            {/* <th
              scope="col"
              className="px-4 py-2 text-center text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Invoice Details
            </th> */}
            {/* <th
              scope="col"
              className="px-4 py-2 text-center text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Print
            </th> */}
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50"
            >
              Updated Details
            </th>
            {(clientId !== 'all' && id !== 'all') && (
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50"
              >
                Status
              </th>
            )}
            {(clientId !== 'all' && id !== 'all') && (
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50"
              >
                Action
              </th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {displayRows.map((row, index) => {
            const { estimate, piData, invoiceData, rowType, displayEstNo } = row;
            // 💰 Calculate Amount
            const totalFinalAmount = estimate?.items?.reduce((total, item) => {
              return total + (parseFloat(item.finalAmount) || 0);
            }, 0);
            const displayAmount = totalFinalAmount?.toFixed(2) || "0.00";

            // 📅 Format Dates
            let formattedDate = "N/A";
            if (estimate?.supply_date) {
              const dateObj = new Date(estimate.supply_date);
              formattedDate = dateObj
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })
                .replace(/\//g, " ");
            }
            let formattedUpdatedDate = "N/A";
            if (estimate?.updated) {
              const dateObj = new Date(estimate.updated);
              formattedUpdatedDate = dateObj
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })
                .replace(/\//g, " ");
            }

            const localPiState = perInvoiceState[estimate._id];
            const piDataToDisplay = localPiState?.piData || piData;
            const isPiCreated = !!piDataToDisplay;
            const isPiCreating = localPiState?.isCreating;
            const piError = localPiState?.error;
            const invId = invoiceData?._id || null;
            const companyClientName =
              estimate?.company_name ||
              (!looksLikeEventName(estimate?.consignee_name) ? estimate?.consignee_name : "") ||
              "Unknown";

            return (
              <tr key={`${estimate._id}-${displayEstNo}-${rowType}`} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left">
                  {indexOfFirstItem + index + 1}
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left">
                  <div className="flex items-center justify-start gap-2">
                    {/* <Link to={`/payments/estimateDetails/${estimate?.est_no}`}> */}
                    <Link
                      to={`/payments/estimateDetails/${estimate?._id}`}
                      state={{
                        displayEstNo: displayEstNo || estimate?.est_no,
                        documentStatus: rowType === "cancelled" ? "cancelled" : "active",
                        invoiceStatus: invoiceData?.status || "",
                      }}
                    >
                      <button className="text-[#3598dc] cursor-pointer hover:text-[#566e7d] font-medium px-1">
                        {displayEstNo || estimate?.est_no}
                      </button>
                    </Link>
                    <span>| {formattedDate} | {displayAmount}</span>
                  </div>
                </td>

                {(clientId === 'all' || id === 'all') && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left">
                    <span className="font-semibold text-gray-800">
                      {companyClientName}
                    </span>
                  </td>
                )}

                {/* 🚀 PROFORMA Invoice CELL LOGIC 🚀 */}
                {(clientId !== 'all' && id !== 'all') && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left">
                    {/* Display PI Data if it exists or is being created */}
                    {isPiCreated && (
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/payments/performanceInvoiceDetails/${piDataToDisplay._id}`}>
                          <button className="text-[#3598dc] cursor-pointer hover:text-[#566e7d] font-medium px-1">
                            {piDataToDisplay.pi_no}
                          </button>
                        </Link>
                        <span>| {formatPiDate(piDataToDisplay.updated) || "N/A"} | {piDataToDisplay.finalAmount?.toFixed(2) || "0.00"}</span>
                      </div>
                    )}

                    {invoiceData ? (
                      <div className="flex items-center justify-center gap-1 mt-1 text-sm">
                        <button
                          className="text-[#3598dc] cursor-pointer hover:text-[#566e7d] font-medium px-1"
                          onClick={() => navigate(`/payments/estimateDetails/${estimate._id}`, {
                            state: {
                              displayEstNo: displayEstNo || estimate?.est_no,
                              documentStatus: rowType === "cancelled" ? "cancelled" : "active",
                              invoiceStatus: invoiceData?.status || "",
                            },
                          })}
                          title="Open estimate overview"
                        >
                          {invoiceData.invoice_no}
                        </button>
                        <span>
                          | {formatInvoiceDate(invoiceData.invoice_date || invoiceData.supply_date || invoiceData.updated)} | {Number(invoiceData.finalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    ) : null}

                    {!invoiceData && !isPiCreating && rowType !== "cancelled" && !isCancelled(estimate) && (
                      <div className="flex items-center justify-center">
	                        <button
	                          className={stylebutton}
	                          onClick={() => navigate(`/page-create-invoice/${estimate.companyId}/${encodeURIComponent(displayEstNo || estimate.est_no)}`, {
                              state: {
                                sourceEstimateId: estimate._id,
                                sourceEstimateNo: estimate.est_no,
                                selectedPiNo: displayEstNo || estimate.est_no,
                                returnTo: `/performa-invoice-list/${estimate.companyId}`,
                              },
                            })}
	                          disabled={isPiCreating}
	                        >
	                          Create Invoice
                        </button>
                      </div>
                    )}

                    {/* Display Loading state */}
                    {isPiCreating && (
                      <span className="text-[#3598dc] font-medium">
                        Creating...
                      </span>
                    )}

                    {/* Display Error state */}
                    {piError && (
                      <span className="text-red-500 font-medium">{piError}</span>
                    )}
                  </td>
                )}

                {/* ... Invoice Details Cell ... */}
                {/* <td className="border border-gray-300 px-4 justify-items-center whitespace-nowrap text-xs text-black text-center">
                  {(() => {

                    const matchingInvoice = invoices.find(
                      (inv) => inv.estimate_no === estimate.est_no
                    );

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

                    if (matchingInvoice) {
                      const displayInvAmount =
                        matchingInvoice.finalAmount?.toFixed(2) || "0.00";
                      const invId = matchingInvoice._id;
                      return (
                        <button className="text-gray-700  font-medium">
                          {`${matchingInvoice.invoice_no} | ${formatInvoiceDate(
                            matchingInvoice.supply_date
                          )} | ${piDataToDisplay?.finalAmount?.toFixed(2) || "0.00"
                            }`}
                        </button>
                      );
                    } else {
                      return (
                        <Link
                          to={`/payments/createInvoice/${estimate?._id}`}
                          className={stylebutton}
                        >
                          Create INV
                        </Link>
                      );
                    }
                  })()}
                </td> */}

                {/* ... Print, Updated Details, Action cells ... */}
                {/* <td className="border border-gray-300 px-2 py-2 whitespace-nowrap text-xs text-black text-center ">
                  <div className="flex justify-between gap-1">
                    <button
                      onClick={() =>
                        handlePrintCopyNavigation("Original Copy", invId)
                      }
                      className={stylebutton}
                    >
                      O
                    </button>
                    <button
                      onClick={() =>
                        handlePrintCopyNavigation("Duplicate Copy", invId)
                      }
                      className={stylebutton}
                    >
                      D
                    </button>
                    <button
                      onClick={() =>
                        handlePrintCopyNavigation("Triplicate Copy", invId)
                      }
                      className={stylebutton}
                    >
                      T
                    </button>
                  </div>
                </td> */}

                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left">
                  <span className="text-gray-500">{formattedUpdatedDate}</span> <span className="text-gray-300 mx-1">|</span> <span className="font-medium capitalize">{estimate?.added_by}</span>
                </td>

                {(clientId !== 'all' && id !== 'all') && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <StatusBadge status={rowType === "cancelled" ? "cancelled" : "active"} />
                  </td>
                )}

                {(clientId !== 'all' && id !== 'all') && (
                  <td className="px-7 py-3 whitespace-nowrap text-sm font-medium items-center gap-2 text-center">
                    {rowType === "cancelled" ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <button
                        type="button"
                        disabled={actionLoaders[`${estimate._id}_cancel`]}
                        onClick={() => handleCancelDocuments(estimate, invoiceData)}
                        className="border border-red-300 text-red-600 hover:text-white hover:bg-red-500 px-3 py-1 rounded items-center cursor-pointer transition-colors disabled:opacity-60"
                      >
                        {actionLoaders[`${estimate._id}_cancel`] ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-3 px-4 bg-white border-t border-gray-200">
          <span className="text-sm text-gray-700">
            Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastItem, estimates.length)}</span> of <span className="font-semibold">{estimates.length}</span> entries
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded border ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}
            >
              Previous
            </button>
            <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 text-sm rounded border ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                  return <span key={pageNum} className="px-2 py-1">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm rounded border ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateTable;
