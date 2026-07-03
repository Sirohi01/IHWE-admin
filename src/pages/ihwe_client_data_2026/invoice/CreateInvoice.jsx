import React, { useState, useEffect } from "react";
import { showError, showSuccess } from "../../../utils/toastMessage";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEstimates } from "../../../features/estimates/estimateSlice";
import {
  createInvoice,
  fetchInvoices,
} from "../../../features/invoice/invoiceSlice";
import { fetchCompanies } from "../../../features/company/companySlice";
import { fetchEvents } from "../../../features/crmEvent/crmEventSlice";
import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../../features/state/stateSlice";
import { fetchCities } from "../../../features/city/citySlice";
import { Upload, UserCheck, LayoutGrid, Package, Truck } from "lucide-react";
import { Link} from "react-router-dom";
import api from "../../../lib/api";
import { getCurrentUserName } from "../../../utils/currentUser";

const CreateInvoice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // Redux state for estimates, companies, events, states, and cities
  const { estimates } = useSelector((state) => state.estimates);
  const { companies } = useSelector((state) => state.companies);
  const { events } = useSelector((state) => state.crmEvents);
  const { countries } = useSelector((state) => state.countries);
  const { states } = useSelector((state) => state.states);
  const { cities } = useSelector((state) => state.cities);
  const { invoices } = useSelector((state) => state.invoice);
  console.log("companies...", companies);
  // console.log("events...", events);
  // console.log(" cities...", cities);

  // 1. Initial state to match Mongoose schema keys
  const initialFormData = {
    estimate_no: "",
    type_of_invoice: "",
    gst_no: "",
    supply_date: "",
    consignee_name: "",
    consignee_addr: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    stateCode: "",
  };

  // Define a single state object for all form fields
  const [formData, setFormData] = useState(initialFormData);
  // New state to hold the event name found from estimate/company
  const [foundEventName, setFoundEventName] = useState("");
  const [companyIdForSubmission, setCompanyIdForSubmission] = useState("");
  const [sourceEstimateId, setSourceEstimateId] = useState("");
  const [includeDeliveryChallans, setIncludeDeliveryChallans] = useState(false);
  const [deliveryChallans, setDeliveryChallans] = useState([]);
  const [selectedChallanIds, setSelectedChallanIds] = useState([]);
  const [challansLoading, setChallansLoading] = useState(false);
  const [challansError, setChallansError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  console.log("companyIdForSubmission", companyIdForSubmission);
  const location = useLocation();
  const editInvoiceId = location.state?.editInvoiceId;
  useEffect(() => {
    dispatch(fetchEstimates());
    dispatch(fetchCompanies());
    dispatch(fetchEvents());
    dispatch(fetchStates());
    dispatch(fetchCities());
    dispatch(fetchCountries());
    dispatch(fetchInvoices());
  }, [dispatch]);

  // --- LOGIC 1: Find Company Name and store it ---
  useEffect(() => {
    if (companies.length > 0 && companyIdForSubmission) {
      const matchedCompany = companies.find((c) => c._id === companyIdForSubmission);
      if (matchedCompany) {
        const nameToSearch = matchedCompany.eventName || "";

        setFoundEventName(nameToSearch);
      } else {
        setFoundEventName("");
      }
    }
  }, [companies, companyIdForSubmission]);

  // --- LOGIC 2: Pre-fill form from Estimate data & STORE companyId ---
  useEffect(() => {
    const loadAndFillEstimateData = async () => {
      if (!id && !editInvoiceId) return;

      if (editInvoiceId) {
        try {
          const response = await api.get(`/api/invoices/${editInvoiceId}`);
          const invoice = response.data?.data || response.data;
          if (invoice) {
            setCompanyIdForSubmission(invoice.companyId || "");
            const matchingEstimate = estimates.find(
              (estimate) => estimate._id === invoice.source_estimate_id
                || (estimate.est_no === invoice.estimate_no
                  && String(estimate.companyId) === String(invoice.companyId))
            );
            setSourceEstimateId(invoice.source_estimate_id || matchingEstimate?._id || "");
            const savedChallanIds = Array.isArray(invoice.delivery_challan_ids)
              ? invoice.delivery_challan_ids.map(String)
              : [];
            setSelectedChallanIds(savedChallanIds);
            setIncludeDeliveryChallans(savedChallanIds.length > 0);
            setFormData((prev) => ({
              ...prev,
              estimate_no: invoice.estimate_no || "",
              type_of_invoice: invoice.type_of_invoice || "",
              gst_no: invoice.gst_no || "",
              supply_date: invoice.supply_date ? invoice.supply_date.split("T")[0] : "",
              consignee_name: invoice.consignee_name || prev.consignee_name,
              consignee_addr: invoice.consignee_addr || invoice.billing_address || prev.consignee_addr,
              country: invoice.country || prev.country,
              state: invoice.state || prev.state,
              city: invoice.city || prev.city,
              pincode: String(invoice.pincode || prev.pincode || ""),
              stateCode: invoice.stateCode || prev.stateCode || "",
            }));
            return;
          }
        } catch (error) {
          console.error("Failed to load invoice for editing:", error);
        }
      }

      let matchedEstimate = estimates.find((est) => est._id === id);

      if (!matchedEstimate) {
        matchedEstimate = estimates.find((est) => est.companyId === id);
      }

      if (!matchedEstimate) {
        try {
          const response = await api.get(`/api/estimates/${id}`);
          matchedEstimate = response.data?.data || response.data;
        } catch (error) {
          console.warn("Direct fetch by ID failed, trying to fetch all...", error.message);
          try {
            const resAll = await api.get(`/api/estimates`);
            const allData = resAll.data?.data || resAll.data || [];
            if (Array.isArray(allData)) {
              matchedEstimate = allData.find((e) => e._id === id || e.companyId === id);
            }
          } catch (fallbackErr) {
            console.error("Failed to fetch estimate for invoice creation:", fallbackErr);
          }
        }
      }

      if (matchedEstimate) {
        const estCompanyId = matchedEstimate.companyId;
        setCompanyIdForSubmission(estCompanyId);
        setSourceEstimateId(matchedEstimate._id || "");

        console.log("✅ Estimate Matched. Company ID:", estCompanyId);

        setFormData((prev) => ({
          ...prev,
          estimate_no: matchedEstimate.est_no || "",
          gst_no: matchedEstimate.gst_no || "",
          supply_date: matchedEstimate.supply_date ? matchedEstimate.supply_date.split("T")[0] : "",
          consignee_name: matchedEstimate.consignee_name || prev.consignee_name,
          consignee_addr: matchedEstimate.consignee_addr || prev.consignee_addr,
          country: matchedEstimate.country || prev.country,
          state: matchedEstimate.state || prev.state,
          city: matchedEstimate.city || prev.city,
          pincode: String(matchedEstimate.pincode || prev.pincode),
        }));
      }
    };
    loadAndFillEstimateData();
  }, [id, editInvoiceId, estimates]);

  useEffect(() => {
    if (!includeDeliveryChallans || !companyIdForSubmission || !sourceEstimateId) {
      setDeliveryChallans([]);
      setChallansError("");
      return;
    }

    let cancelled = false;
    const loadDeliveryChallans = async () => {
      setChallansLoading(true);
      setChallansError("");
      try {
        const response = await api.get("/api/delivery-challans", {
          params: { companyId: companyIdForSubmission, estimateId: sourceEstimateId },
        });
        if (cancelled) return;
        const eligible = (Array.isArray(response.data) ? response.data : [])
          .filter((challan) => String(challan.status || "").toLowerCase() !== "cancelled");
        setDeliveryChallans(eligible);
        setSelectedChallanIds((current) =>
          current.filter((selectedId) =>
            eligible.some((challan) => String(challan._id) === String(selectedId))
          )
        );
      } catch (error) {
        if (!cancelled) {
          setDeliveryChallans([]);
          setChallansError(error.response?.data?.message || "Unable to load delivery challans.");
        }
      } finally {
        if (!cancelled) setChallansLoading(false);
      }
    };
    loadDeliveryChallans();
    return () => {
      cancelled = true;
    };
  }, [includeDeliveryChallans, companyIdForSubmission, sourceEstimateId]);
  // ---------------------------------------------------------------------------------
  // --- LOGIC 3: Override Address details from 'events' state ---
  useEffect(() => {
    if (events.length > 0 && foundEventName) {
      const matchedEvent = events.find((e) => e.event_name === foundEventName);

      if (matchedEvent) {
        console.log(`✅ Event Matched by Name: ${foundEventName}`);
        console.log("Matched Event Object:", matchedEvent);
        // Update form data, overriding estimate data if event data exists
        setFormData((prev) => ({
          ...prev,
          consignee_name: matchedEvent.event_fullName || prev.consignee_name,
          consignee_addr: matchedEvent.event_address || prev.consignee_addr,
          country: matchedEvent.event_country || prev.country,
          pincode: matchedEvent.event_pincode || prev.pincode,
        }));
      }
    }
  }, [events, foundEventName]);
  // ---------------------------------------------------------------------------------

  // --- LOGIC 4: Fetch Cities when State changes ---
  useEffect(() => {
    if (formData.state) {
    }
  }, [formData.state, dispatch]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newState = { [name]: value };

    // Reset City if State changes
    if (name === "state") {
      newState = { ...newState, city: "" };
    }

    setFormData((prev) => ({ ...prev, ...newState }));
  };

  // 3. Define required fields using Mongoose schema keys (remains the same)
  const requiredFields = [
    "type_of_invoice",
    "gst_no",
    "supply_date",
    "consignee_name",
    "consignee_addr",
    "country",
    "state",
    "city",
    "pincode",
  ];

  const handleCreateInvoice = async (e) => {
    if (e) e.preventDefault();
    const missingFields = requiredFields.filter((key) => !formData[key]);

    if (missingFields.length > 0) {
      showError("Please fill in all required fields (marked with *).");
      console.error("Missing required fields:", missingFields);
      return;
    }
    if (includeDeliveryChallans && selectedChallanIds.length === 0) {
      showError("Please select at least one delivery challan or choose No.");
      return;
    }

    // ✅ 1. Get user_name from localStorage
    const userName = getCurrentUserName("Admin");

    // Prepare the data payload, explicitly including the required IDs/names
    const invoicePayload = {
      ...formData,
      companyId: companyIdForSubmission || id, // Use invoice/company source id
      source_estimate_id: sourceEstimateId,
      delivery_challan_ids: includeDeliveryChallans ? selectedChallanIds : [],
      added_by: userName, // ✅ 2. Include added_by from localStorage
    };

    setSubmitting(true);
    try {
      if (editInvoiceId) {
        await api.put(`/api/invoices/${editInvoiceId}`, invoicePayload);
        showSuccess("Invoice updated successfully!");
      } else {
        await dispatch(createInvoice(invoicePayload)).unwrap();
        showSuccess("Invoice created successfully!");
      }
      dispatch(fetchInvoices());
      navigate(-1);
    } catch (error) {
      showError(
        error?.response?.data?.message
          || error?.message
          || "Failed to save invoice"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleChallan = (challanId) => {
    const idValue = String(challanId);
    setSelectedChallanIds((current) =>
      current.includes(idValue)
        ? current.filter((id) => id !== idValue)
        : [...current, idValue]
    );
  };

  // Styles remain defined here for reusability
  const InputStyle =
    "w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"

  // heading logic 
  const { Id, heading } = location.state || {};

  const pageHeading = heading || (editInvoiceId || Id ? "Update Invoice" : "Create Invoice");
  const buttonName = heading || (editInvoiceId || Id ? "Update Invoice" : "Create Invoice");

  const stateOptions = states?.data || states || [];
  const cityOptions = cities?.data || cities || [];
  return (
    <>
      <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
        {/* Header (unchanged) */}
      
        <div className="flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-300 gap-4">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
              ACCOUNT SECTION - INVOICE | Sales Management Section
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

        <div className="min-h-screen bg-[#eef1f5] p-4">
          {/* Create Invoice Section */}
          <form
            className="w-full bg-white px-4 pb-7 pt-1 shadow-md"
            onSubmit={handleCreateInvoice}
          >
            <h1 className="font-normal text-lg text-gray-500 mb-0.5">{pageHeading}</h1>
            <hr className="w-full mb-2 opacity-10" />

            {/* Form Fields - Mongoose keys used for name/value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
              {/* Estimate No. (Read-only) */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  Estimate No. <span className="text-red-500">*</span>
                </label>
                <input
                  className={InputStyle}
                  type="text"
                  readOnly
                  name="estimate_no"
                  value={formData.estimate_no}
                  onChange={handleChange}
                />
              </div>

              {/* Type of Invoice */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  Type of Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  className={InputStyle}
                  name="type_of_invoice"
                  value={formData.type_of_invoice}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Invoice</option>
                  <option value="Foreign Sale">Foreign Sale</option>
                  <option value="Intrastate">Intrastate</option>
                  <option value="Interstate Sale">Interstate Sale</option>
                </select>
              </div>

              {/* GSTIN No./PAN No. (Read-only since it should come from estimate/company) */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  GSTIN No./PAN No. <span className="text-red-500">*</span>
                </label>
                <input
                  className={InputStyle} // Changed to ReadOnlyStyle
                  type="text"
                  name="gst_no"
                  value={formData.gst_no}
                  onChange={handleChange}
                  readOnly
                  required
                />
              </div>

              {/* Supply Date */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  Supply Date <span className="text-red-500">*</span>
                </label>
                <input
                  className={InputStyle}
                  type="date"
                  name="supply_date"
                  value={formData.supply_date}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Consignee Name */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  Consignee Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={InputStyle}
                  type="text"
                  name="consignee_name"
                  value={formData?.consignee_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Address */}
              <div className="flex flex-col lg:col-span-2">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  className={InputStyle}
                  type="text"
                  name="consignee_addr"
                  value={formData.consignee_addr}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Country (Read-only) */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  // Country dropdown is disabled
                  disabled={true}
                  className={InputStyle}
                  required
                >
                  <option value="">Select Country</option>
                  {/* Displaying hardcoded countries (since this is read-only) */}
                  {countries.map((country, i) => (
                    <option key={country._id || i} value={country.name}>
                      {country?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* State (Editable Dropdown, uses Redux state) */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={InputStyle}
                  required
                >
                  <option value="">Select State</option>
                  {/* Populating options from Redux states array */}
                  {stateOptions.map((stateObj) => (
                    <option key={stateObj._id} value={stateObj.name}>
                      {stateObj.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City (Editable Dropdown, uses Redux state) */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={InputStyle}
                  disabled={!formData.state}
                  required
                >
                  <option value="">Select City</option>
                  {/* Populating options from Redux cities array */}
                  {cityOptions.map((cityObj) => (
                    <option key={cityObj._id} value={cityObj.name}>
                      {cityObj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pb-3 pt-4 text-xs">
              {/* Pin Code */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  Pin Code <span className="text-red-500">*</span>
                </label>
                <input
                  className={InputStyle}
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* State Code */}
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-medium text-gray-900 mb-1 block">
                  State Code
                </label>
                <input
                  className={InputStyle}
                  type="text"
                  name="stateCode"
                  value={formData.stateCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <section className="mb-4 border border-slate-200 bg-slate-50">
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Truck size={16} className="text-[#194090]" />
                    Add Delivery Challan?
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Selected challans will be shown on the invoice PDF without changing invoice items or totals.
                  </p>
                </div>
                <div className="flex overflow-hidden rounded border border-slate-300 bg-white text-xs">
                  {[
                    { label: "No", value: false },
                    { label: "Yes", value: true },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        setIncludeDeliveryChallans(option.value);
                        if (!option.value) setSelectedChallanIds([]);
                      }}
                      className={`px-5 py-2 font-bold transition ${
                        includeDeliveryChallans === option.value
                          ? "bg-[#194090] text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {includeDeliveryChallans && (
                <div className="p-4">
                  {!sourceEstimateId ? (
                    <p className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                      Select a valid proforma invoice first to load its delivery challans.
                    </p>
                  ) : challansLoading ? (
                    <p className="p-4 text-center text-xs text-slate-500">Loading delivery challans...</p>
                  ) : challansError ? (
                    <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{challansError}</p>
                  ) : deliveryChallans.length === 0 ? (
                    <p className="rounded border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                      No active delivery challans are available for this proforma invoice.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold text-slate-600">
                        Select one or more challans ({selectedChallanIds.length} selected)
                      </p>
                      {deliveryChallans.map((challan) => {
                        const selected = selectedChallanIds.includes(String(challan._id));
                        return (
                          <label
                            key={challan._id}
                            className={`block cursor-pointer border p-3 transition ${
                              selected ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleChallan(challan._id)}
                                className="mt-1 h-4 w-4 accent-[#194090]"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#194090]">{challan.challan_no}</span>
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
                                      {challan.status || "issued"}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500">
                                    {challan.challan_date
                                      ? new Date(challan.challan_date).toLocaleDateString("en-IN")
                                      : "No date"}
                                  </span>
                                </div>
                                <div className="mt-2 grid gap-1 text-[10px] text-slate-600 sm:grid-cols-2">
                                  <span><b>Delivery:</b> {challan.delivery_address || "—"}</span>
                                  <span><b>Transport:</b> {[challan.transporter_name, challan.vehicle_no].filter(Boolean).join(" / ") || "—"}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {(challan.items || []).map((item, index) => (
                                    <span key={`${challan._id}-${index}`} className="inline-flex items-center gap-1 border border-slate-200 bg-white px-2 py-1 text-[9px] text-slate-600">
                                      <Package size={10} /> {item.description}: <b>{item.qty} {item.unit}</b>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Action Buttons (unchanged) */}
            <div className="flex gap-2 mt-1 pt-3 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 text-xs bg-[#337ab7] hover:bg-[#286090] text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "SAVING..." : buttonName}
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-800  px-4 py-1.5 text-xs hover:bg-gray-400 cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </form>
          {/* Invoice List Section (unchanged) */}
          <div className="w-full bg-white p-4  shadow-md mt-6 pb-8">
            <h1 className="font-normal text-xl text-[#333] mb-3">Invoice List</h1>
            {/* Table Structure */}
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr>
                    {[
                      "S.No.",
                      "Invoice No.",
                      "Performa no",
                      "Date",
                      "Created By",
                      "Action",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-2 border border-gray-300  text-xs text-center text-black font-bold uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="border border-gray-300 bg-gray-50">
                  {invoices.map((invoice, index) => (
                    <tr key={invoice._id}>
                      <td className="px-6 py-2  border border-gray-300 text-center text-xs">
                        {index + 1}
                      </td>
                      <td className="px-6 py-2  border border-gray-300 text-center text-xs">
                        <button onClick={() => navigate(`/payments/ODT/taxInvoiceDetails/${invoice._id}`)} className="px-2  text-blue-500 hover:text-gray-800 text-center cursor-pointer">
                          {invoice?.invoice_no}
                        </button>
                      </td>
                      <td className="px-6 py-2  border border-gray-300 text-center text-xs">
                        {invoice?.estimate_no}
                      </td>
                      <td className="px-6 py-2  border border-gray-300 text-center text-xs">
                        {invoice?.supply_date}
                      </td>
                      <td className="px-6 py-2  border border-gray-300 text-center text-xs">
                        {invoice?.added_by}
                      </td>
                      <td className="px-6 py-2  border border-gray-300 text-center text-xs">
                        <button
                          onClick={() =>
                            navigate(
                              `/ihweClientData2026/creditNote/${companyIdForSubmission}`
                            )
                          }
                          className="px-2  border border-blue-500 text-blue-500 hover:bg-gray-100 text-center cursor-pointer"
                        >
                          Credit Note
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateInvoice;
