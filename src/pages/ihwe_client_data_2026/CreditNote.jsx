import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { fetchEstimates } from "../../features/estimates/estimateSlice";
import {
  createCreditNote,
  fetchCreditNotes,
  clearCreditNoteState, // State clear करने के लिए import
} from "../../features/creditNote/creditNoteSlice";
import { showSuccess, showError } from "../../utils/toastMessage"; // showError भी import करें
import { Upload, UserCheck, LayoutGrid } from "lucide-react";

// ✅ HELPER: Date Formatting Function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};

// ✅ HELPER: Calculate Total Credit Amount (Sum of all cn_amount in items array)// यदि आपको (Quantity * Amount) का योग चाहिए
const calculateTotalCNAmount = (items) => {
  if (!items || items.length === 0) return 0;

  return items
    .reduce(
      (total, item) =>
        total + (Number(item.quantity) || 0) * (Number(item.cn_amount) || 0),
      0
    )
    .toFixed(2);
};

const CreditNote = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { id } = useParams();

  const { estimates } = useSelector((state) => state.estimates);
  const {
    creditNotes,
    loading: cnLoading,
    error: cnError,
    success: cnSuccess,
  } = useSelector((state) => state.creditnotes); // Credit Note Redux State

  const [matchedEstNo, setMatchedEstNo] = useState("");
  console.log("creditNotes..", creditNotes);

  const [rows, setRows] = useState([
    { estimate: "", item: "", qty: "", amount: "", remark: "" },
  ]);

  // Datas array को Redux data से बदल दिया गया है (Credit Note Details table के लिए)
  // const Datas = [ ... ];

  let userName = localStorage.getItem("user_name") || sessionStorage.getItem("user_name") || "";
  try {
    const userObjStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userObjStr) {
      const userObj = JSON.parse(userObjStr);
      if (userObj.name) userName = userObj.name;
    }
  } catch (e) {
    console.error("Error parsing user data:", e);
  }
  if (!userName) userName = "unknown_user";

  useEffect(() => {
    if (id) {
      dispatch(fetchEstimates(id));
    }
    dispatch(fetchCreditNotes());
  }, [dispatch, id]);

  // --- 💡 success/error/loading Handling useEffect ---
  useEffect(() => {
    if (cnSuccess) {
      showSuccess("✅ Credit Note Created Successfully!");
      dispatch(fetchCreditNotes()); // New data fetch करें
      resetForm();
      dispatch(clearCreditNoteState());
    }
    if (cnError) {
      showError(
        `❌ Error: ${cnError.message || "Could not create Credit Note"}`
      );
      dispatch(clearCreditNoteState());
    }
  }, [cnSuccess, cnError, dispatch]);

  // --- Collect unique item descriptions ---
  const uniqueItemDescriptions = useMemo(() => {
    if (!estimates || estimates.length === 0) return [];

    const descriptions = new Set();
    const companyEstimates = estimates.filter((est) => est.companyId === id);

    companyEstimates.forEach((estimate) => {
      estimate.items.forEach((item) => {
        if (item.description) {
          descriptions.add(item.description);
        }
      });
    });
    return Array.from(descriptions);
  }, [estimates, id]);
  // ----------------------------------------------------

  // --- CORRECTED MATCHING LOGIC (Assuming 'id' is CompanyId) ---
  useEffect(() => {
    if (id && estimates && estimates.length > 0) {
      const matchedEstimate = estimates.find((est) => est.companyId === id);

      if (matchedEstimate) {
        setMatchedEstNo(matchedEstimate.est_no);
      } else {
        setMatchedEstNo("");
      }
    }
  }, [id, estimates]);
  // ------------------------------------------------------------------

  const buttonStyle =
    "px-3 py-1 text-xs bg-[#3598dc] hover:bg-[#286090] text-white transition-colors";


  const handleAddRow = () => {
    setRows([
      ...rows,
      { estimate: "", item: "", qty: "", amount: "", remark: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    if (field === "qty" || field === "amount") {
      value = value.replace(/[^0-9.]/g, "");
      if ((value.match(/\./g) || []).length > 1) return;
    }
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const resetForm = () => {
    setRows([{ estimate: "", item: "", qty: "", amount: "", remark: "" }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedEstimateId = rows.length > 0 ? rows[0].estimate : "";

    const selectedEstimate = estimates.find(
      (est) => est._id === selectedEstimateId
    );
    const estNoToSend = selectedEstimate ? selectedEstimate.est_no : "";

    // Validation
    if (
      !estNoToSend ||
      !rows[0].item ||
      !rows[0].qty ||
      !rows[0].amount ||
      !rows[0].remark
    ) {
      showError("Please fill out all required fields.");
      return;
    }

    const items = rows.map(({ estimate, ...rest }) => ({
      item: rest.item,
      quantity: Number(rest.qty),
      cn_amount: Number(rest.amount),
      cedit_note_remark: rest.remark,
    }));

    const dataToSend = {
      est_no: estNoToSend,
      added_by: userName,
      companyId: id,
      items: items,
    };

    console.log("Form Submitted Data Structure:", dataToSend);
    dispatch(createCreditNote(dataToSend));
  };

  const handleCancle = () => {
    resetForm();
  };

  return (
    <>
      <div className="bg-gray-50 shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
        {/* ... (Header Section) ... */}
        {/* <div className="max-w-full mx-auto bg-white shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 py-1">
          <h1 className="text-xl text-gray-500 mb-2 lg:mb-0 uppercase">
            ACCOUNT SECTION | CREDIT NOTE
          </h1>
          <div className="flex flex-wrap gap-2 cursor-pointer">
            <button onClick={handleAddClient} className={buttonStyle}>
              Add Client
            </button>
            <button onClick={handleMasterList} className={buttonStyle}>
              Master List
            </button>
          </div>
        </div>
      </div> */}
        <div className="flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-300 gap-4">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
              ACCOUNT SECTION - CREDIT NOTE | Sales Management Section
            </h1>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
            <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
              <Upload size={12} /> Upload Exhibitor
            </button>
            <button onClick={() => navigate("/ihweClientData2026/newLeadList")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
              <UserCheck size={12} /> New Leads List
            </button>
            <button onClick={() => navigate("/ihweClientData2026/masterData")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
              <LayoutGrid size={12} /> Master List
            </button>
            <button onClick={() => navigate("/ihweClientData2026/confirmClientList")} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap">
              <UserCheck size={12} /> Exhibitor List
            </button>
          </div>
        </div>

        <div className="bg-white shadow px-5 py-5 mt-6 ">
          <h2 className="text-lg font-medium text-gray-600 ">
            Add Credit Note
          </h2>
          <hr className="w-full opacity-10 pb-4" />
          {/* Display the matched est_no for confirmation */}
          {/* {matchedEstNo && (
          <div className="text-sm font-medium text-green-700 mb-4 p-2 bg-green-100 border border-green-300 rounded">
            Matched Estimate Number (est_no) for Company ID **{id}**: **
            {matchedEstNo}**
          </div>
        )} */}

          <form onSubmit={handleSubmit}>
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-5 md:grid-cols-6 gap-3 mb-4 items-end"
              >
                {/* Select Estimate */}
                {index === 0 ? (
                  <div className="flex flex-col md:col-span-1">
                    <label className="text-xs font-medium text-gray-900 mb-1 block">
                      Select Estimate{" "}
                      <span className="text-red-500 font-semibold">*</span>
                    </label>
                    <select
                      value={row.estimate}
                      onChange={(e) =>
                        handleRowChange(index, "estimate", e.target.value)
                      }
                      required
                      className="border border-gray-300 px-2 text-xs h-8 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none font-medium"
                    >
                      <option value="">Select Here</option>
                      {estimates
                        .filter((est) => est.companyId === id)
                        .map((est) => (
                          <option key={est._id} value={est._id}>
                            {est.est_no}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div className="md:col-span-1 h-8" />
                )}

                {/* Select Item */}
                <div className="flex flex-col md:col-span-1">
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    Select Item{" "}
                    <span className="text-red-500 font-semibold">*</span>
                  </label>
                  <select
                    value={row.item}
                    onChange={(e) =>
                      handleRowChange(index, "item", e.target.value)
                    }
                    required
                    className="border border-gray-300 px-2 text-xs h-8 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none font-medium"
                  >
                    <option value="">Select Here</option>
                    {uniqueItemDescriptions.map((description, descIndex) => (
                      <option key={descIndex} value={description}>
                        {description}
                      </option>
                    ))}
                    {uniqueItemDescriptions.length === 0 && (
                      <option value="" disabled>
                        No items found for this Company
                      </option>
                    )}
                  </select>
                </div>

                {/* Quantity */}
                <div className="flex flex-col md:col-span-1">
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    Quantity <span className="text-red-500 font-semibold">*</span>
                  </label>
                  <input
                    type="text"
                    value={row.qty}
                    onChange={(e) =>
                      handleRowChange(index, "qty", e.target.value)
                    }
                    required
                    className="border border-gray-300 px-2 text-xs h-8 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                {/* CN Amount */}
                <div className="flex flex-col md:col-span-1">
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    CN Amount{" "}
                    <span className="text-red-500 font-semibold">*</span>
                  </label>
                  <input
                    type="text"
                    value={row.amount}
                    onChange={(e) =>
                      handleRowChange(index, "amount", e.target.value)
                    }
                    required
                    className="border border-gray-300 px-2 text-xs h-8 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                {/* Credit Note Remark */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    Credit Note Remark{" "}
                    <span className="text-red-500 font-semibold">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <textarea
                      required
                      value={row.remark}
                      onChange={(e) =>
                        handleRowChange(index, "remark", e.target.value)
                      }
                      className="border border-gray-300 px-2 text-xs h-8 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none flex-grow"
                    ></textarea>

                    <div className="flex gap-1.5 h-8">
                      {/* Add/Remove Buttons */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="bg-red-600 hover:bg-red-700 text-white h-8 w-8 flex items-center justify-center transition-colors"
                          title="Remove Row"
                        >
                          <FaMinus size={12} />
                        </button>
                      )}
                      {index === rows.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 flex items-center justify-center transition-colors"
                          title="Add New Row"
                        >
                          <FaPlus size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-start gap-1 mt-6">
              <button
                type="submit"
                disabled={cnLoading}
                className={`px-3.5 py-1.5 text-sm font-normal transition-colors ${cnLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#337ab7] hover:bg-[#286ca7] text-white"
                  }`}
              >
                {cnLoading ? "SAVING..." : "SAVE"}
              </button>
              <button
                type="button"
                onClick={handleCancle}
                className="bg-[#d9534f] hover:bg-[#bd3a35] text-white px-3.5 py-1.5 text-sm font-normal transition-colors"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
        <div className="mt-6 bg-white shadow px-5 py-5 ">
          <h3 className="text-xl font-normal mb-3 text-gray-500 border-b pb-1">
            Credit Note Details
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-xs">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="border px-2 py-1 font-normal">
                    Credit Note No.
                  </th>
                  <th className="border px-2 py-1 font-normal">
                    Credit Amount
                  </th>
                  <th className="border px-2 py-1 font-normal">Credit Date</th>
                  <th className="border px-2 py-1 font-normal">Updated</th>
                  <th className="border px-2 py-1 font-normal">Updated By</th>
                </tr>
              </thead>
              <tbody>
                {/* ✅ Credit Notes Data Mapping */}
                {creditNotes.length === 0 ? (
                  <tr>
                    <td
                      className="border border-gray-300 px-2 py-3 text-center text-gray-500"
                      colSpan={5}
                    >
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  creditNotes.map((creditNote, i) => (
                    <tr key={creditNote._id || i}>
                      <td className="border border-gray-300 px-2 py-3 text-center text-gray-500">
                        {creditNote?.create_note_no}
                      </td>
                      {/* ✅ Improvement 2: Total Credit Amount Calculation */}
                      <td className="border border-gray-300 px-2 py-3 text-center text-gray-500">
                        {/* सुनिश्चित करें कि क्रेडिट नोट ऑब्जेक्ट और आइटम्स एरे मौजूद हों */}
                        ₹{" "}
                        {creditNote?.items
                          ? calculateTotalCNAmount(creditNote.items)
                          : "0.00"}
                      </td>
                      {/* ✅ Improvement 1: Date Formatting (Created Date) */}
                      <td className="border border-gray-300 px-2 py-3 text-center text-gray-500">
                        {formatDate(creditNote?.created_at)}
                      </td>
                      {/* ✅ Improvement 1: Date Formatting (Updated Date) */}
                      <td className="border border-gray-300 px-2 py-3 text-center text-gray-500">
                        {formatDate(creditNote?.updated_date)}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center text-gray-500">
                        {creditNote?.added_by}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditNote;
