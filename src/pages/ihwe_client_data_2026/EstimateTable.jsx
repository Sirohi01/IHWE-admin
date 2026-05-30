import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEstimates } from "../../features/estimates/estimateSlice";
import {
  createPerformaInvoice,
  fetchPerformaInvoices,
} from "../../features/performaInvoice/performaInvoiceSlice";
import { fetchInvoices } from "../../features/invoice/invoiceSlice";

const stylebutton =
  "w-fit text-[#3598dc] cursor-pointer border border-[#3598dc] hover:bg-[#3598dc] hover:text-white font-medium flex  items-center gap-1 px-1";

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
  console.log("perInvoices..", perInvoices);

  useEffect(() => {
    if (estimates.length > 0 && id) {
      const matchedEstimate = estimates.find((c) => c._id === id);
    }
  }, [estimates, id]);

  useEffect(() => {
    if (clientId || id) {
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
  // const handleCreateINV = () => {
  //   navigate(`/payments/createInvoice/${estimates?.est_no}`);
  // };

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full border-collapse border border-gray-300 ">
        <thead className="border  border-gray-300">
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-center text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              S.No.
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-center text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Estimate Details
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-center text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Performa Inv.
            </th>
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
              className="px-4 py-2 text-center text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Updated Details
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-center text-xs font-medium text-black uppercase tracking-wider border-t border-r border-l border-t-gray-300 border-r-gray-300 border-l-gray-300"
            >
              Action
            </th>
          </tr>
        </thead>

        <tbody className="bg-white border border-gray-300">
          {estimates.map((estimate, index) => {
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

            // --- 🚀 NEW PI LOGIC START 🚀 ---

            // 1. Check local state (for just created PI)
            const localPiState = perInvoiceState[estimate._id];
            let piDataToDisplay = localPiState?.piData;

            // 2. If no local PI, check Redux state (for previously created PI)
            if (!piDataToDisplay) {
              piDataToDisplay = perInvoices.find(
                (pi) => pi.est_no === estimate.est_no
              );
            }

            const isPiCreated = !!piDataToDisplay;
            const isPiCreating = localPiState?.isCreating;
            const piError = localPiState?.error;

            // --- 🚀 NEW PI LOGIC END 🚀 ---

            // Find matching invoice to extract its ID for print buttons
            const matchingInvoice = invoices.find(
              (inv) => inv.estimate_no === estimate.est_no
            );
            const invId = matchingInvoice ? matchingInvoice._id : null;

            return (
              <tr key={estimate._id}>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-xs text-black text-center">
                  {index + 1}
                </td>

                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-xs text-black text-center">
                  <div className="flex items-center justify-center gap-1">
                    {/* <Link to={`/payments/estimateDetails/${estimate?.est_no}`}> */}
                    <Link to={`/payments/estimateDetails/${estimate?._id}`}>
                      <button className="text-[#3598dc] cursor-pointer hover:text-[#566e7d] font-medium px-1">
                        {estimate?.est_no}
                      </button>
                    </Link>
                    <span>| {formattedDate} | {displayAmount}</span>
                  </div>
                </td>

                {/* 🚀 PERFORMA INVOICE CELL LOGIC 🚀 */}
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-xs text-black text-center ">
                  {/* Display PI Data if it exists or is being created */}
                  {isPiCreated && (
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        to={`/payments/performanceInvoiceDetails/${piDataToDisplay._id}`}
                      >
                        <button className="text-[#3598dc] cursor-pointer hover:text-[#566e7d] font-medium px-1">
                          {piDataToDisplay.pi_no}
                        </button>
                      </Link>
                      <span>| {formatPiDate(piDataToDisplay.updated) || "N/A"} | {piDataToDisplay.finalAmount?.toFixed(2) || "0.00"}</span>
                    </div>
                  )}

                  {/* Display Create PI button only if no PI is created and not loading */}
                  {!isPiCreated && !isPiCreating && (
                    <div className="flex items-center justify-center">
                      <button
                        className={stylebutton}
                        onClick={() => handleCreatePI(estimate, totalFinalAmount)}
                        disabled={isPiCreating}
                      >
                        Create PI
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

                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-xs text-black text-center">
                  {formattedUpdatedDate} | {estimate?.added_by}
                </td>

                <td className="border-t border-gray-300 px-7 py-2 whitespace-nowrap text-xs font-medium  items-center gap-2 text-center ">
                  <button className="border border-gray-300 text-red-600 hover:text-white hover:bg-red-500 px-2 items-center  cursor-pointer">
                    x
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EstimateTable;
