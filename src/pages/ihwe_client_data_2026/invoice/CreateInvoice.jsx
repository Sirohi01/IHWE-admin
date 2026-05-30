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
import { Upload, UserCheck, LayoutGrid } from "lucide-react";
import { Link} from "react-router-dom";
import api from "../../../lib/api";

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
  console.log("companyIdForSubmission", companyIdForSubmission);
  useEffect(() => {
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
      if (!id) return;

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
  }, [id, estimates]);
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

  const handleCreateInvoice = (e) => {
    if (e) e.preventDefault();
    const missingFields = requiredFields.filter((key) => !formData[key]);

    if (missingFields.length > 0) {
      showError("Please fill in all required fields (marked with *).");
      console.error("Missing required fields:", missingFields);
      return;
    }

    // ✅ 1. Get user_name from localStorage
    const userName = localStorage.getItem("user_name") || "unknown_user";

    // Prepare the data payload, explicitly including the required IDs/names
    const invoicePayload = {
      ...formData,
      companyId: id, // URL parameter 'id' for companyId
      added_by: userName, // ✅ 2. Include added_by from localStorage
    };

    // Submit the form data to the server
    dispatch(createInvoice(invoicePayload));
    showSuccess("Invoice created successfully!");
    // Clear form data
    setFormData({
      type_of_invoice: "",
      consignee_name: "",
      state: "",
      city: "",
    });
    console.log("Invoice Data submitted:", invoicePayload);
    navigate(-1);
  };

  // Styles remain defined here for reusability
  const InputStyle =
    "w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"

  // heading logic 
  const location = useLocation();
  const { Id, heading } = location.state || {};

  const pageHeading = heading || (Id ? "Update Invoice" : "Create Invoice");
  const buttonName = heading || (Id ? "Update Invoice" : "Create Invoice");

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

            {/* Action Buttons (unchanged) */}
            <div className="flex gap-2 mt-1 pt-3 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-[#337ab7] hover:bg-[#286090] text-white cursor-pointer "
              >
                {buttonName}
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
