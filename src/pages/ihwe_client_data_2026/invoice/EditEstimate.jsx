import React, { useState, useEffect } from "react";
import {
  updateEstimate,
  clearEstimateState,
} from "../../../features/estimates/estimateSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../../../features/crmEvent/crmEventSlice";
import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../../features/state/stateSlice";
import { fetchCities } from "../../../features/city/citySlice";
import { useNavigate, useParams } from "react-router-dom";
import { showError, showSuccess } from "../../../utils/toastMessage";
import { LayoutGrid, UserCheck, Upload, ChevronDown, ChevronLeft, X } from "lucide-react";
import api from "../../../lib/api";

const EditEstimate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { estimates, loading, error, success } = useSelector(
    (state) => state.estimates
  );
  const { events } = useSelector((state) => state.crmEvents);
  const { countries } = useSelector((state) => state.countries);
  const { states } = useSelector((state) => state.states);
  const { cities } = useSelector((state) => state.cities);

  const [formData, setFormData] = useState({
    est_type: "",
    est_no: "",
    gst_no: "",
    supply_date: "",
    consignee_name: "",
    consignee_addr: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    remarks: "",
    // finalAmount: "0.00",
  });

  const [items, setItems] = useState([
    {
      description: "",
      hsn: "",
      qty: "",
      size: "",
      unit: "",
      rate: "",
      amount: "0.00",
      disc: "0",
      tax: "0.00",
      gstRate: "",
      finalAmount: "0.00",
      remarks: "",
    },
  ]);
  const unitOptions = [
    "Inch",
    "Feet",
    "Sqft",
    "Meter",
    "Nos",
    "%",
    "L.S.",
    "Rft.",
    "Rmt.",
    "Pcs.",
    "Sqmtr.",
    "Roll",
    "Pkt",
    "Mtr",
    "Q.FT",
    "RFT",
    "RMT",
    "l.s.",
  ];

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchCountries());
    dispatch(fetchStates());
    dispatch(fetchCities());
  }, [dispatch]);

  // Effect to populate form when estimate data is available
  useEffect(() => {
    const loadEstimateData = async () => {
      if (!id) return;
      
      let estimateToEdit = estimates.find((est) => est._id === id);
      
      if (!estimateToEdit) {
        try {
          // Try direct fetch by ID
          const response = await api.get(`/api/estimates/${id}`);
          estimateToEdit = response.data?.data || response.data;
        } catch (err) {
          console.warn("Direct fetch failed, falling back to fetch all...", err.message);
          try {
            const resAll = await api.get(`/api/estimates`);
            const allData = resAll.data?.data || resAll.data || [];
            if (Array.isArray(allData)) {
              estimateToEdit = allData.find(e => e._id === id);
            }
          } catch (fallbackErr) {
            console.error("Fallback fetch also failed:", fallbackErr);
          }
        }
      }

      if (estimateToEdit) {
        setFormData({
          est_type: estimateToEdit.est_type || "",
          est_no: estimateToEdit.est_no || "",
          gst_no: estimateToEdit.gst_no || "",
          supply_date: estimateToEdit.supply_date
            ? estimateToEdit.supply_date.split("T")[0]
            : "",
          consignee_name: estimateToEdit.consignee_name || "",
          consignee_addr: estimateToEdit.consignee_addr || "",
          country: estimateToEdit.country || "",
          state: estimateToEdit.state || "",
          city: estimateToEdit.city || "",
          pincode: estimateToEdit.pincode || "",
          remarks: estimateToEdit.remarks || "",
        });
        setItems(estimateToEdit.items?.length > 0 ? estimateToEdit.items : [{
          description: "", hsn: "", qty: "", size: "", unit: "", rate: "", amount: "0.00", disc: "0", tax: "0.00", gstRate: "", finalAmount: "0.00", remarks: "",
        }]);
      }
    };
    
    loadEstimateData();
  }, [id, estimates]);

  // Effect for API feedback
  useEffect(() => {
    if (success) {
      showSuccess("Estimate updated successfully!");
      dispatch(clearEstimateState());
      navigate(-1); // Go back to the previous page
    }
    if (error) {
      showError(error.message || "Failed to update estimate.");
      dispatch(clearEstimateState());
    }
  }, [success, error, dispatch, navigate]);

  // Effect to recalculate amounts when item properties change
  useEffect(() => {
    const newItems = items.map((item) => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const disc = parseFloat(item.disc) || 0;
      const gstRate = parseFloat(item.gstRate) || 0;

      const amount = qty * rate;
      const taxableValue = amount - (amount * disc) / 100;
      const gstAmount = (taxableValue * gstRate) / 100;
      const finalAmount = taxableValue + gstAmount;

      return {
        ...item,
        amount: amount.toFixed(2),
        tax: taxableValue.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
      };
    });
    setItems(newItems);

    const totalFinalAmount = newItems.reduce(
      (sum, item) => sum + (parseFloat(item.finalAmount) || 0),
      0
    );
    setFormData((prev) => ({
      ...prev,
      finalAmount: totalFinalAmount.toFixed(2),
    }));
  }, [
    // This effect runs when any of these core values change in any item
    ...items.flatMap((item) => [item.qty, item.rate, item.disc, item.gstRate]),
  ]);

  const handleBasicChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setItems(updatedItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        description: "",
        hsn: "",
        qty: "",
        size: "",
        unit: "",
        rate: "",
        amount: "0.00",
        disc: "0",
        tax: "0.00",
        gstRate: "",
        finalAmount: "0.00",
        remarks: "",
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isIntrastate = formData.est_type === "Intrastate";

    const transformedItems = items.map((item) => {
      const taxableValue = parseFloat(item.tax) || 0;
      const totalGstRate = parseFloat(item.gstRate) || 0;
      const gstAmount = (taxableValue * totalGstRate) / 100;

      return {
        ...item,
        cgst: isIntrastate ? (gstAmount / 2).toFixed(2) : gstAmount.toFixed(2),
        cgst_per: isIntrastate ? (totalGstRate / 2).toFixed(0) : "0",
        igst_per: isIntrastate ? "0" : totalGstRate.toFixed(0),
      };
    });

    const updatedData = {
      ...formData,
      items: transformedItems,
    };

    dispatch(updateEstimate({ id, updatedData }));
  };

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <>
      <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">

        {/* Heading Section */}
        {/* <div className="w-full h-auto bg-white  px-5 py-1  ">
        <h2 className="text-xl font-normal text-gray-500 ">ESTIMATE | EDIT</h2>
      </div> */}
      <div className="flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-300 gap-4">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
              ESTIMATE EDIT | Sales Management Section
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

        <form
          onSubmit={handleSubmit}
          className="w-full min-h-screen bg-gray-100 font-sans mx-1 pt-2 "
        >
          {/* Main Form Section */}
          <div className="max-w-full  bg-white  m-4 ">
            <div className="p-3 mx-2">
              <h2 className="text-xl font-normal text-gray-600  ">
                Edit Estimate
              </h2>
              <hr className="w-full opacity-10 mb-2" />
              {/* Basic Information - Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-1">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Estimate Types <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="est_type"
                    value={formData.est_type}
                    onChange={handleBasicChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select Here</option>
                    <option value="Intrastate">Intrastate</option>
                    <option value="Interstate Sale">Interstate Sale</option>
                    <option value="Foreign Sale">Foreign Sale</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Estimate No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="est_no"
                    value={formData.est_no}
                    readOnly
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    GSTIN No./PAN No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="gst_no"
                    value={formData.gst_no}
                    onChange={handleBasicChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Supply Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="supply_date"
                    value={formData.supply_date}
                    onChange={handleBasicChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Consignee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="consignee_name"
                    value={formData.consignee_name}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  >
                    {/* <option value="">Select Here</option>
                  {events.map((event, i) => (
                    <option key={i} value={event?.event_name}>
                      {event?.event_name}
                    </option>
                  ))} */}
                  </input>
                </div>
              </div>

              {/* Address Information - Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Consignee Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="consignee_addr"
                    value={formData.consignee_addr}
                    onChange={handleBasicChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    readOnly
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                    onChange={handleBasicChange}
                  >
                    {/* <option value="">Select Country</option>
                  {countries.map((country, i) => (
                    <option key={i}>{country?.name}</option>
                  ))} */}
                  </input>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleBasicChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select State</option>
                    {formData.country &&
                      states.map((state, i) => (
                        <option key={i}>{state?.name}</option>
                      ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleBasicChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select Here</option>
                    {formData.country &&
                      formData.state &&
                      cities?.data?.map((city, i) => (
                        <option key={i}>{city?.name}</option>
                      ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Pin Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleBasicChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Pin Code Row */}

              {/* Items Section */}
              {items.map((item, index) => (
                <div key={index} className="mb-1  bg-gray-50 ">
                  {/* Item Header */}

                  <div className="flex justify-between items-center mb-2">
                    <h4 className="w-full bg-gray-500 text-center text-sm font-semibold text-black">
                      Item No. {index + 1}
                    </h4>
                  </div>

                  {/* Item Fields Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Item Description <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                        placeholder="Type here..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        HSN No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="hsn"
                        value={item.hsn}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Qty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="qty"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none 
                            [appearance:textfield] 
                            [&::-webkit-inner-spin-button]:appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Size
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={item.size}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="unit"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                      >
                        <option value="">Select Unit</option>
                        {unitOptions.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Rate <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="rate"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none
                      [appearance:textfield] 
                            [&::-webkit-inner-spin-button]:appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={item.amount}
                        readOnly
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        DISC % <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="disc"
                        value={item.disc}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none
                      [appearance:textfield] 
                            [&::-webkit-inner-spin-button]:appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  {/* Item Fields Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3">
                    <div>
                      <label className=" block text-xs font-semibold text-gray-700 mb-1">
                        Taxable Value <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="tax"
                        value={item.tax}
                        readOnly
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        GST Rate <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="gstRate"
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-1/3 px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none
                        [appearance:textfield] 
                            [&::-webkit-inner-spin-button]:appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <span className=" w-auto bg-gray-100 px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none">
                          %
                        </span>
                        <input
                          type="text"
                          value={(
                            (parseFloat(item.tax) || 0) *
                            ((parseFloat(item.gstRate) || 0) / 100)
                          ).toFixed(2)}
                          required
                          readOnly
                          className="w-1/3 bg-gray-100 cursor-not-allowed rounded-l-none border-l-0  px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Final Amount
                      </label>
                      <input
                        type="number"
                        name="finalAmount"
                        value={item.finalAmount}
                        readOnly
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Any Remarks
                      </label>
                      <input
                        type="text"
                        name="remarks"
                        value={item.remarks}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-[250px] px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                        placeholder="Type here..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-5">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        disabled={items.length === 1}
                        className=" h-8 px-4 py-1.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      {index === items.length - 1 && (
                        <button
                          type="button"
                          onClick={addItemRow}
                          className="h-8 px-3.5 py-1.5 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white  transition-colors duration-200"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Footer Section */}

              <div className="flex flex-col sm:flex-row  items-start sm:items-center mx-1">
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-sm bg-[#3598dc] text-white font-medium  hover:bg-[#2a87c5] transition-colors disabled:bg-gray-400"
                    disabled={loading}
                  >
                    {loading ? "UPDATING..." : "UPDATE ESTIMATE"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-1.5 text-sm bg-gray-300 text-gray-800 font-medium  hover:bg-gray-400 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditEstimate;
