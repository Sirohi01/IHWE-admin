import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addEstimate,
  clearEstimateState,
  fetchNextEstimateNo,
} from "../../features/estimates/estimateSlice";
import { fetchCountries } from "../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../features/state/stateSlice";
import { fetchCities } from "../../features/city/citySlice";
import { fetchCompanies } from "../../features/company/companySlice";
import { showError, showSuccess } from "../../utils/toastMessage";
import { Upload, LayoutGrid, UserCheck } from "lucide-react";
import api from "../../lib/api";

const unitOptions = [
  "Inch",
  "Feet",
  "Sqft",
  "Meter",
  "Nos",
  "%",
  "L.S.",
  "Rft.",
  "Nos.",
  "Rmt.",
  "Sqft.",
  "Pcs.",
  "Sqmtr.",
  "Roll",
  "Pkt",
  "Mtr",
  "Q.FT",
  "RFT",
  "RMT",
  "l.s.",
  "%",
  "meter",
  "sqft",
  "feet",
  "inch",
  "nos",
  "inch",
];

// Internal values stay "Stall" / "Addon Product" — only the displayed label changes.
const ITEM_CATEGORIES = ["Stall", "Addon Product"];
const ITEM_CATEGORY_LABELS = { Stall: "Exhibition Stall", "Addon Product": "Add-on Product" };
const STALL_TYPES = ["Raw Space", "Shell Space"];

const EVENT_NAME = "9th Edition of International Health & Wellness Expo (IHWE Global Edition)";
const EVENT_PLACE_OF_SUPPLY = "Hall Nos. 12, Pragati Maidan, New Delhi - 110001, Bharat";
const EVENT_GST_NO = "08AAFCN9238F1Z6";

// Helper function to safely extract an array from any Redux slice
const getArrayFromSlice = (sliceState, fallbackKey) => {
  if (Array.isArray(sliceState)) return sliceState;
  if (sliceState && typeof sliceState === "object" && fallbackKey in sliceState && Array.isArray(sliceState[fallbackKey])) {
    return sliceState[fallbackKey];
  }
  return [];
};

const CreateEstimate1 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: companyIdFromParams } = useParams();
  const { loading, error, success } = useSelector((state) => state.estimates);
  const countriesState = useSelector((state) => state.countries);
  const statesState = useSelector((state) => state.states);
  const citiesState = useSelector((state) => state.cities);
  const { companies } = useSelector((state) => state.companies);

  const countriesArray = getArrayFromSlice(countriesState, "countries")
    .slice()
    .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

  const statesArray = getArrayFromSlice(statesState, "states")
    .slice()
    .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

  const citiesArray = getArrayFromSlice(citiesState, "cities")
    .slice()
    .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchStates());
    dispatch(fetchCities());
    if (companies.length === 0) {
      dispatch(fetchCompanies());
    }
    dispatch(fetchNextEstimateNo())
      .unwrap()
      .then((nextEstNo) => {
        // 🟢 Update the local state with the fetched number
        setEstimateData((prev) => ({
          ...prev,
          est_no: nextEstNo,
        }));
      })
      .catch((err) => {
        showError(`Failed to fetch estimate number: ${err.message || err}`);
      });
  }, [dispatch, companies.length]);

  // --- State Initialization ---
  const [estimateData, setEstimateData] = useState({
    est_type: "",
    est_no: "",
    gst_no: "",
    company_name: "",
    company_addr: "",
    company_gst_no: "",
    event_name: EVENT_NAME,
    event_place_of_supply: EVENT_PLACE_OF_SUPPLY,
    event_gst_no: EVENT_GST_NO,
    supply_date: "",
    consignee_name: EVENT_NAME,
    consignee_addr: EVENT_PLACE_OF_SUPPLY,
    country: "",
    state: "",
    city: "",
    pincode: "",
    remarks: "",
  });

  const [items, setItems] = useState([
    {
      category: "Stall",
      description: "",
      stallType: "",
      hsn: "",
      qty: "",
      size: "",
      unit: "",
      rate: "",
      amount: "0.00",
      disc: "0",
      tax: "0.00",
      gstRate: "18",
      finalAmount: "0.00",
      remarks: "",
    },
  ]);

  // [{ stallFor, dimension, stallSize, discount, gstPercent, stallType, eventId, currency }]
  const [bookedStallDetails, setBookedStallDetails] = useState([]);
  // `${eventId}|${currency}|${stallType}` -> StallRate doc ({ ratePerSqm, hsnCode, ... })
  const [stallRateMap, setStallRateMap] = useState({});
  const [addonProductOptions, setAddonProductOptions] = useState([]);

  useEffect(() => {
    if (!companyIdFromParams || !companies.length) return;
    const company = companies.find((item) => item._id === companyIdFromParams);
    if (!company) return;
    setEstimateData((prev) => ({
      ...prev,
      company_name: prev.company_name || company.companyName || company.exhibitorName || "",
      company_addr: prev.company_addr || company.address || company.companyAddress || "",
      company_gst_no: prev.company_gst_no || company.gstNumber || company.gstNo || company.gst_no || "",
      gst_no: prev.gst_no || company.gstNumber || company.gstNo || company.gst_no || "",
      country: prev.country || company.country || "",
      state: prev.state || company.state || "",
      city: prev.city || company.city || "",
      pincode: prev.pincode || company.pincode || "",
    }));
  }, [companyIdFromParams, companies]);

  // Item rows → "Stall" category: this client's actually booked stall(s) with
  // the detail needed to auto-fill area/size + discount once a stall is picked.
  // Rate and HSN are NOT baked in here — both live on the per-event Stall Rate
  // card keyed by (event, currency, stall type), so they're resolved separately
  // (see stallRateMap) and re-resolved whenever Stall Type changes.
  useEffect(() => {
    if (!companyIdFromParams || !companies.length) return;
    const company = companies.find((item) => item._id === companyIdFromParams);
    const assignments = company?.eventAssignments || [];
    const registrationIds = [...new Set(
      assignments.map((a) => a.exhibitorRegistrationId).filter(Boolean).map(String)
    )];
    if (!registrationIds.length) {
      setBookedStallDetails([]);
      setStallRateMap({});
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const regResults = await Promise.all(
          registrationIds.map((regId) =>
            api.get(`/api/exhibitor-registration/${regId}`).catch(() => null)
          )
        );
        if (cancelled) return;

        const registrations = regResults
          .map((res) => res?.data?.data)
          .filter((reg) => reg?.participation?.stallFor);

        const details = registrations.map((reg) => {
          const p = reg.participation;
          return {
            stallFor: p.stallFor,
            dimension: p.dimension || "",
            stallSize: p.stallSize || 0,
            discount: p.discount || 0,
            gstPercent: p.gstPercent ?? 18,
            stallType: p.stallType || "",
            eventId: reg.eventId,
            currency: p.currency || "INR",
          };
        });
        setBookedStallDetails([...new Map(details.map((d) => [d.stallFor, d])).values()]);

        // Rate + HSN for every (event, currency, stall type) combination this
        // client's stalls could switch to, so changing Stall Type doesn't need
        // another round trip.
        const comboKeys = [...new Set(details.map((d) => `${d.eventId}|${d.currency}`))];
        const rateEntries = await Promise.all(
          comboKeys.flatMap((combo) => {
            const [eventId, currency] = combo.split("|");
            return STALL_TYPES.map((stallType) =>
              api.get("/api/stall-rates/find", { params: { eventId, currency, stallType } })
                .then((res) => [`${eventId}|${currency}|${stallType}`, res?.data?.data])
                .catch(() => [`${eventId}|${currency}|${stallType}`, null])
            );
          })
        );
        if (cancelled) return;
        setStallRateMap(Object.fromEntries(rateEntries));
      } catch (err) {
        console.error("Error resolving booked stalls for client:", err);
        if (!cancelled) { setBookedStallDetails([]); setStallRateMap({}); }
      }
    })();

    return () => { cancelled = true; };
  }, [companyIdFromParams, companies]);

  // Item rows → "Addon Product" category: purchasable accessories from the
  // shared accessories catalog (managed on the Manage Accessories page).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/stall-accessories/accessories");
        if (cancelled) return;
        const list = (res.data?.data || []).filter((acc) => acc.type === "purchasable");
        setAddonProductOptions(list);
      } catch (err) {
        console.error("Error loading addon product options:", err);
        if (!cancelled) setAddonProductOptions([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 🟢 NEW: Handle API feedback (Success/Error)
  useEffect(() => {
    if (success) {
      showSuccess("Estimate created successfully!");
      dispatch(clearEstimateState()); // Clear success message after showing
      navigate(`/ihweClientData2026/accountSection1/${companyIdFromParams}`);
    }
    if (error) {
      showError(`Error: ${error.message || error}`); // Show error message
      dispatch(clearEstimateState()); // Clear error message
    }
  }, [success, error, dispatch, navigate]);

  // --- Handlers (Unchanged) ---
  const handleEstimateChange = (e) => {
    const { name, value } = e.target;
    setEstimateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    if (name === "category") {
      newItems[index].description = "";
      newItems[index].stallType = "";
    }
    setItems(newItems);
  };

  // Rate + HSN for a stall depend on its Stall Type (looked up on the per-event
  // Stall Rate card), not on the stall itself — resolve them together here.
  const getRateForType = (detail, stallType) => {
    const rateDoc = stallRateMap[`${detail.eventId}|${detail.currency}|${stallType}`];
    return { rate: rateDoc?.ratePerSqm || 0, hsn: rateDoc?.hsnCode || "" };
  };

  // Stall Type options come from what's actually configured on the Manage
  // Stall Rates page for this stall's event/currency — not a hardcoded list —
  // so a type nobody priced there can't be picked. Before a stall is chosen,
  // fall back to every type priced for ANY of the client's booked events.
  const getStallTypeOptions = (item) => {
    const detail = bookedStallDetails.find((d) => d.stallFor === item.description);
    const hasRate = (eventId, currency, stallType) => !!stallRateMap[`${eventId}|${currency}|${stallType}`];
    const options = detail
      ? STALL_TYPES.filter((t) => hasRate(detail.eventId, detail.currency, t))
      : [...new Set(
          Object.keys(stallRateMap)
            .filter((key) => stallRateMap[key])
            .map((key) => key.split("|")[2])
        )];
    return item.stallType && !options.includes(item.stallType) ? [item.stallType, ...options] : options;
  };

  // Picking a stall auto-fills everything the system already knows about it
  // (area/size, discount, GST) plus rate/HSN for its originally booked type.
  const selectStall = (index, stallFor) => {
    const detail = bookedStallDetails.find((d) => d.stallFor === stallFor);
    const newItems = [...items];
    if (!detail) {
      newItems[index].description = stallFor;
    } else {
      const { rate, hsn } = getRateForType(detail, detail.stallType);
      newItems[index] = {
        ...newItems[index],
        description: stallFor,
        stallType: detail.stallType,
        hsn: hsn || newItems[index].hsn,
        qty: 1,
        size: detail.dimension || String(detail.stallSize || ""),
        unit: "Sqmtr.",
        rate,
        disc: String(detail.discount || 0),
        gstRate: String(detail.gstPercent ?? 18),
      };
    }
    setItems(newItems);
  };

  // Switching Stall Type re-resolves Rate + HSN for the currently selected
  // stall's event/currency, leaving Qty/Area/Size/Unit untouched.
  const selectStallType = (index, stallType) => {
    const newItems = [...items];
    const detail = bookedStallDetails.find((d) => d.stallFor === newItems[index].description);
    if (!detail) {
      newItems[index] = { ...newItems[index], stallType };
    } else {
      const { rate, hsn } = getRateForType(detail, stallType);
      newItems[index] = {
        ...newItems[index],
        stallType,
        rate,
        hsn: hsn || newItems[index].hsn,
      };
    }
    setItems(newItems);
  };

  // Picking an Addon Product auto-fills everything the accessories catalog
  // already knows about it (HSN/SAC, unit, rate, dimensions).
  const selectAddonProduct = (index, productName) => {
    const product = addonProductOptions.find((p) => p.name === productName);
    const newItems = [...items];
    if (!product) {
      newItems[index].description = productName;
    } else {
      const hasDims = product.length && product.width;
      newItems[index] = {
        ...newItems[index],
        description: productName,
        hsn: product.hsnCode || product.sacCode || newItems[index].hsn,
        qty: 1,
        size: hasDims ? `${product.length}x${product.width}` : "",
        unit: product.unit || newItems[index].unit,
        rate: Number(product.price) || 0,
        gstRate: String(product.gstPercent ?? 18),
      };
    }
    setItems(newItems);
  };

  const getAreaMultiplier = (value) => {
    const text = String(value ?? "").replace(/,/g, "").trim();
    const dimensions = text.match(/(\d+(?:\.\d+)?)\s*[xX×*]\s*(\d+(?:\.\d+)?)/);
    if (dimensions) return (parseFloat(dimensions[1]) || 0) * (parseFloat(dimensions[2]) || 0) || 1;
    const match = text.match(/\d+(?:\.\d+)?/);
    const number = match ? parseFloat(match[0]) : 0;
    return Number.isFinite(number) && number > 0 ? number : 1;
  };

  // --- Calculation Logic (Unchanged) ---
  useEffect(() => {
    let totalFinalAmount = 0;

    const calculateItems = items.map((item) => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const disc = parseFloat(item.disc) || 0;
      const gstRate = parseFloat(item.gstRate) || 18;

      const amount = qty * rate * getAreaMultiplier(item.size);
      const taxableValue = amount - amount * (disc / 100);
      const gstAmount = taxableValue * (gstRate / 100);
      const finalAmount = taxableValue + gstAmount;

      totalFinalAmount += finalAmount;

      return {
        ...item,
        amount: amount.toFixed(2),
        tax: taxableValue.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
      };
    });

    setItems(calculateItems);

    setEstimateData((prev) => ({
      ...prev,
      finalAmount: totalFinalAmount.toFixed(2),
    }));
  }, [
    items.length,
    ...items
      .map((item) => [item.qty, item.rate, item.disc, item.gstRate])
      .flat(),
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        category: "Stall",
        description: "",
        stallType: "",
        hsn: "",
        qty: "",
        size: "",
        unit: "",
        rate: "",
        amount: "0.00",
        disc: "0",
        tax: "0.00",
        gstRate: "18",
        finalAmount: "0.00",
        remarks: "",
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // 3. FORM SUBMISSION AND API CALL (FIXED)
  const handleSubmit = (e) => {
    e.preventDefault();

    const isIntrastate = estimateData.est_type === "Intrastate";
    const isInterstate = estimateData.est_type === "Interstate Sale";
    const isForeignSale = estimateData.est_type === "Foreign Sale";

    let addedBy = localStorage.getItem("user_fullname") || localStorage.getItem("user_name") || sessionStorage.getItem("user_name") || "";
    try {
      const userObjStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userObjStr) {
        const userObj = JSON.parse(userObjStr);
        if (userObj.user_fullname) addedBy = userObj.user_fullname;
        else if (userObj.name) addedBy = userObj.name;
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
    // Fallback to prevent validation crash if user name is somehow missing
    if (!addedBy) addedBy = "Admin";

    // Assuming 'company_id' holds the companyId value
    const companyId = companyIdFromParams;
    // Item Data Transformation with GST Breakdown
    const transformedItems = items.map((item) => {
      const taxableValue = parseFloat(item.tax) || 0;
      const totalGstRate = parseFloat(item.gstRate) || 18;
      const totalGstAmount = (taxableValue * (totalGstRate / 100));
      let cgstPer = "0";
      let cgstAmount = "0.00";
      let igstPer = "0";

      if (isIntrastate) {
        // Intrastate Sale: Fill FULL rate and amount into CGST fields (as per your request)
        cgstPer = totalGstRate.toFixed(0);
        cgstAmount = totalGstAmount.toFixed(2);
        igstPer = "0"; // Ensure IGST is 0
      } else if (isInterstate) {
        // Interstate Sale: Fill FULL rate into IGST rate, and full amount into CGST amount field (as per your existing schema structure)
        igstPer = totalGstRate.toFixed(0);
        cgstAmount = totalGstAmount.toFixed(2);
        cgstPer = "0"; // Ensure CGST rate is 0
      } else if (isForeignSale) {
        // Foreign Sale: Tax is 0
        cgstPer = "0";
        cgstAmount = "0.00";
        igstPer = "0";
      }

      return {
        // ... direct mapping fields
        description: item.description,
        hsn: item.hsn,
        qty: item.qty,
        size: item.size,
        unit: item.unit,
        rate: item.rate,
        amount: item.amount,
        disc: item.disc,
        tax: item.tax,
        gstRate: item.gstRate,
        finalAmount: item.finalAmount,
        remarks: item.remarks,
        // ... calculated fields
        depth: item.depth || "",
        cgst: cgstAmount,
        cgst_per: cgstPer,
        igst_per: igstPer,
      };
    });

    // Main Estimate Data Transformation
    const finalEstimateData = {
      // ... direct mapping fields
      est_type: estimateData.est_type,
      est_no: estimateData.est_no,
      gst_no: estimateData.company_gst_no || estimateData.gst_no,
      company_name: estimateData.company_name,
      company_addr: estimateData.company_addr,
      company_gst_no: estimateData.company_gst_no || estimateData.gst_no,
      event_name: EVENT_NAME,
      event_place_of_supply: EVENT_PLACE_OF_SUPPLY,
      event_gst_no: EVENT_GST_NO,
      supply_date: estimateData.supply_date,
      consignee_name: EVENT_NAME,
      consignee_addr: EVENT_PLACE_OF_SUPPLY,
      country: estimateData.country,
      state: estimateData.state,
      city: estimateData.city,
      pincode: estimateData.pincode,
      remarks: estimateData.remarks,

      // Final Amount
      finalAmount: estimateData.finalAmount,

      // 🔴 MANDATORY: Auth Context से आनी चाहिए
      companyId: companyId,
      added_by: addedBy,

      items: transformedItems,
      status: "active",
    };
    console.log("finalEstimateData...", finalEstimateData);
    // 🟢 NEW: Dispatch the Redux Thunk
    dispatch(addEstimate(finalEstimateData));
  };
  // Derived filtered lists
  const filteredStates = React.useMemo(() => {
    if (!estimateData.country || !countriesArray.length) return [];
    const selectedCountry = countriesArray.find(c =>
      c.name && c.name.trim().toLowerCase() === estimateData.country.trim().toLowerCase()
    );
    if (!selectedCountry) return [];
    return statesArray.filter(s =>
      s.countryCode != null && selectedCountry.countryCode != null &&
      String(s.countryCode) === String(selectedCountry.countryCode)
    );
  }, [estimateData.country, countriesArray, statesArray]);

  const filteredCities = React.useMemo(() => {
    if (!estimateData.state || !statesArray.length) return [];
    const selectedState = statesArray.find(s =>
      s.name && s.name.trim().toLowerCase() === estimateData.state.trim().toLowerCase()
    );
    if (!selectedState) return [];
    return citiesArray.filter(c =>
      c.stateCode != null && selectedState.stateCode != null &&
      String(c.stateCode) === String(selectedState.stateCode)
    );
  }, [estimateData.state, statesArray, citiesArray]);


  // --- Navigation Handlers (Unchanged) ---
  const handleMasterList = () => {
    navigate("/ihweClientData2026/masterData");
  };
  const handleAddClient = () => {
    navigate("/ihweClientData2026/addNewClients");
  };
  const handleCancel = () => {
    navigate(-1); // navigate(-1) is equivalent to window.history.back()
  };

  const inputClass =
    "w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none";
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1 ";

  return (
    <div className="min-h-screen bg-gray-100 mt-8">
      {/* ... (JSX remains largely the same) ... */}

      <div className="flex flex-col lg:flex-row justify-between items-center py-3 px-6 border-b border-gray-300 bg-white gap-4">
        <div className="flex flex-col items-center lg:items-start gap-1">
          <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
            ACCOUNT SECTION - ESTIMATE | Sales Management Section
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

      <div className="bg-white shadow-lg  px-6 pt-2 pb-6 m-4">
        <h2 className="text-lg font-normal text-gray-600 mb-2 border-b border-b-gray-200 pb-2">
          Create Estimate
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Main Estimate Details Section (Unchanged) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-4 mb-4">
            {/* Estimate Types */}
            <div>
              <label htmlFor="est_type" className={labelClass}>
                Estimate Types *
              </label>
              <select
                id="est_type"
                name="est_type"
                value={estimateData.est_type}
                onChange={handleEstimateChange}
                className={`w-full ${inputClass}`}
                required
              >
                <option value="">Select Here</option>
                <option value="Intrastate">Intrastate</option>
                <option value="Interstate Sale">Interstate Sale</option>
                <option value="Foreign Sale">Foreign Sale</option>
              </select>
            </div>

            {/* Proforma Invoice No. */}
            <div>
              <label htmlFor="est_no" className={labelClass}>
                Proforma Invoice No. *
              </label>
              <input
                type="text"
                id="est_no"
                name="est_no"
                value={estimateData.est_no}
                onChange={handleEstimateChange}
                className={`w-full bg-gray-100 cursor-not-allowed ${inputClass}`}
                readOnly
                required
              />
            </div>

            {/* Company GSTIN No./PAN No. */}
            <div>
              <label htmlFor="company_gst_no" className={labelClass}>
                GSTIN No./PAN No. *
              </label>
              <input
                type="text"
                id="company_gst_no"
                name="company_gst_no"
                value={estimateData.company_gst_no}
                onChange={handleEstimateChange}
                className={`w-full ${inputClass}`}
                placeholder="Enter GSTIN/PAN No."
                required
              />
            </div>

            {/* Supply Date */}
            <div>
              <label htmlFor="supply_date" className={labelClass}>
                Supply Date *
              </label>
              <input
                type="date"
                id="supply_date"
                name="supply_date"
                value={estimateData.supply_date}
                onChange={handleEstimateChange}
                className={`w-full bg-gray-100 ${inputClass}`}
                required
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className={labelClass}>
                Company Name *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={estimateData.company_name}
                onChange={handleEstimateChange}
                className={`w-full ${inputClass}`}
                required
              />
            </div>

            {/* Company Address */}
            <div>
              <label htmlFor="company_addr" className={labelClass}>
                Company Address *
              </label>
              <input
                type="text"
                id="company_addr"
                name="company_addr"
                value={estimateData.company_addr}
                onChange={handleEstimateChange}
                className={`w-full ${inputClass}`}
                required
              />
            </div>

            {/* Consignee Name */}
            <div>
              <label htmlFor="consignee_name" className={labelClass}>
                Event Name *
              </label>
              <input
                type="text"
                id="consignee_name"
                name="consignee_name"
                value={estimateData.consignee_name}
                className={`w-full bg-gray-100 cursor-not-allowed ${inputClass}`}
                readOnly
                required
              />
            </div>

            {/* Consignee Address */}
            <div>
              <label htmlFor="consignee_addr" className={labelClass}>
                Place of Supply *
              </label>
              <input
                type="text"
                id="consignee_addr"
                name="consignee_addr"
                value={estimateData.consignee_addr}
                className={`w-full bg-gray-100 cursor-not-allowed ${inputClass}`}
                readOnly
                required
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className={labelClass}>
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={estimateData.country}
                onChange={(e) => {
                  handleEstimateChange(e);
                  setEstimateData(prev => ({ ...prev, state: "", city: "" }));
                }}
                className={`w-full ${inputClass}`}
                required
              >
                <option value="">Select Country</option>
                {countriesArray.map((country, i) => (
                  <option key={i} value={country?.name}>
                    {country?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className={labelClass}>
                State *
              </label>
              <select
                id="state"
                name="state"
                value={estimateData.state}
                onChange={(e) => {
                  handleEstimateChange(e);
                  setEstimateData(prev => ({ ...prev, city: "" }));
                }}
                className={`w-full ${inputClass}`}
                required
                disabled={!estimateData.country}
              >
                <option value="">Select State</option>
                {filteredStates.map((state, i) => (
                  <option key={i} value={state?.name}>
                    {state?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className={labelClass}>
                City *
              </label>
              <select
                id="city"
                name="city"
                value={estimateData.city}
                onChange={handleEstimateChange}
                className={`w-full ${inputClass}`}
                required
                disabled={!estimateData.state}
              >
                <option value="">Select City</option>
                {filteredCities.map((city, i) => (
                  <option key={i} value={city?.name}>
                    {city?.name}
                  </option>
                ))}
              </select>
            </div>


            {/* Pin Code */}
            <div>
              <label htmlFor="pincode" className={labelClass}>
                Pin Code *
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={estimateData.pincode}
                onChange={handleEstimateChange}
                className={`w-full   ${inputClass}`}
                required
              />
            </div>
          </div>

          {/* Item Rows Section (Unchanged) */}
          {items.map((item, index) => (
            <div
              key={index}
              className=" bg-gray-50 p-4  mb-4 border border-gray-200"
            >
              {index > 0 && (
                <h3 className="w-full bg-gray-500 text-sm text-center font-semibold text-gray-900 mb-4 py-0.5">
                  item No.{index + 1}
                </h3>
              )}

              <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-x-4 gap-y-3 items-end">
                {/* ... (Item fields: Description, HSN, Qty, Size, Unit, Rate, Amount) ... */}
                {/* 0. Item Category */}
                <div className="col-span-full md:col-span-2 lg:col-span-2">
                  <label htmlFor={`category-${index}`} className={labelClass}>
                    Item Category *
                  </label>
                  <select
                    id={`category-${index}`}
                    name="category"
                    value={item.category || "Stall"}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`w-full ${inputClass}`}
                    required
                  >
                    {ITEM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{ITEM_CATEGORY_LABELS[c] || c}</option>
                    ))}
                  </select>
                </div>
                {/* 1. Item Description */}
                <div className="col-span-full md:col-span-3 lg:col-span-3">
                  <label
                    htmlFor={`description-${index}`}
                    className={labelClass}
                  >
                    Item Description *
                  </label>
                  {item.category === "Addon Product" ? (
                    <select
                      id={`description-${index}`}
                      name="description"
                      value={item.description}
                      onChange={(e) => selectAddonProduct(index, e.target.value)}
                      className={`w-full ${inputClass}`}
                      required
                    >
                      <option value="">Select Add-on Product</option>
                      {(item.description && !addonProductOptions.some((p) => p.name === item.description)
                        ? [{ _id: "current", name: item.description }, ...addonProductOptions]
                        : addonProductOptions
                      ).map((product) => (
                        <option key={product._id} value={product.name}>{product.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      id={`description-${index}`}
                      name="description"
                      value={item.description}
                      onChange={(e) => selectStall(index, e.target.value)}
                      className={`w-full ${inputClass}`}
                      required
                    >
                      <option value="">Select Stall</option>
                      {(item.description && !bookedStallDetails.some((d) => d.stallFor === item.description)
                        ? [item.description, ...bookedStallDetails.map((d) => d.stallFor)]
                        : bookedStallDetails.map((d) => d.stallFor)
                      ).map((stallNo) => (
                        <option key={stallNo} value={stallNo}>{stallNo}</option>
                      ))}
                    </select>
                  )}
                </div>
                {/* Stall Type */}
                {item.category === "Stall" && (
                  <div className="col-span-2 md:col-span-2 lg:col-span-1">
                    <label className={labelClass}>Stall Type</label>
                    <select
                      value={item.stallType || ""}
                      onChange={(e) => selectStallType(index, e.target.value)}
                      className={`w-full ${inputClass}`}
                    >
                      <option value="">Select Type</option>
                      {getStallTypeOptions(item).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* 2. HSN No. */}
                <div className="col-span-2 md:col-span-2 lg:col-span-1">
                  <label htmlFor={`hsn-${index}`} className={labelClass}>
                    HSN No. *
                  </label>
                  <input
                    type="text"
                    id={`hsn-${index}`}
                    name="hsn"
                    value={item.hsn}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`w-full ${inputClass}`}
                    required
                  />
                </div>
                {/* 3. Qty */}
                <div className="col-span-3 md:col-span-2 lg:col-span-1">
                  <label htmlFor={`qty-${index}`} className={labelClass}>
                    Qty. *
                  </label>
                  <input
                    type="number"
                    id={`qty-${index}`}
                    name="qty"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`w-full [appearance:textfield] 
                            [&::-webkit-inner-spin-button]:appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none" ${inputClass}`}
                    required
                  />
                </div>
                {/* 4. Size */}
                <div className="col-span-3 md:col-span-2 lg:col-span-1">
                  <label htmlFor={`size-${index}`} className={labelClass}>
                    Size
                  </label>
                  <input
                    type="text"
                    id={`size-${index}`}
                    name="size"
                    value={item.size}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`w-full ${inputClass}`}
                  />
                </div>
                {/* 5. Unit */}
                <div className="col-span-3 md:col-span-2 lg:col-span-2">
                  <label htmlFor={`unit-${index}`} className={labelClass}>
                    Unit *
                  </label>
                  <select
                    id={`unit-${index}`}
                    name="unit"
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`w-full ${inputClass}`}
                    required
                  >
                    <option value="">Select Unit</option>
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                {/* 6. Rate */}
                <div className="col-span-2 md:col-span-1 lg:col-span-1">
                  <label htmlFor={`rate-${index}`} className={labelClass}>
                    Rate *
                  </label>
                  <input
                    type="number"
                    id={`rate-${index}`}
                    name="rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`w-full [appearance:textfield] 
                            [&::-webkit-inner-spin-button]:appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none" ${inputClass}`}
                    required
                  />
                </div>
                {/* 7. Amount */}
                <div className="col-span-3 md:col-span-2 lg:col-span-2">
                  <label htmlFor={`amount-${index}`} className={labelClass}>
                    Amount *
                  </label>
                  <input
                    type="text"
                    id={`amount-${index}`}
                    name="amount"
                    value={item.amount}
                    readOnly
                    className={`w-full bg-gray-100 cursor-not-allowed ${inputClass}`}
                    required
                  />
                </div>

                {/* --- ROW 2: DISC, Taxable Value, GST, Final Amount, Remarks, Buttons --- */}

                {/* 8. DISC % */}
                <div className="col-span-3 md:col-span-2 lg:col-span-2">
                  <label htmlFor={`disc-${index}`} className={labelClass}>
                    DISC % *
                  </label>
                  <input
                    type="number"
                    id={`disc-${index}`}
                    name="disc"
                    value={item.disc}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`w-full [appearance:textfield] 
                            [&::-webkit-inner-spin-button]:appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none" ${inputClass}`}
                    required
                  />
                </div>
                {/* 9. Taxable Value */}
                <div className="col-span-3 md:col-span-2 lg:col-span-2">
                  <label htmlFor={`tax-${index}`} className={labelClass}>
                    Taxable Value *
                  </label>
                  <input
                    type="text"
                    id={`tax-${index}`}
                    name="tax"
                    value={item.tax}
                    readOnly
                    className={`w-full bg-gray-100 cursor-not-allowed ${inputClass}`}
                    required
                  />
                </div>
                {/* 10. GST Rate */}
                <div className="col-span-3 md:col-span-3 lg:col-span-2">
                  <label htmlFor={`gstRate-${index}`} className={labelClass}>
                    GST Rate *
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id={`gstRate-${index}`}
                      name="gstRate"
                      value={item.gstRate}
                      onChange={(e) => handleItemChange(index, e)}
                      className={`w-1/3  [appearance:textfield] 
                            [&::-webkit-inner-spin-button]:appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none" ${inputClass} rounded-r-none border-r-0`}
                      placeholder="e.g. 18"
                      required
                    />
                    <span className="w-fit bg-gray-100 px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none">
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
                      className={`w-1/3 bg-gray-100 cursor-not-allowed ${inputClass} rounded-l-none border-l-0`}
                    />
                  </div>
                </div>
                {/* 11. Final Amount */}
                <div className="col-span-3 md:col-span-2 lg:col-span-2">
                  <label
                    htmlFor={`finalAmount-${index}`}
                    className={labelClass}
                  >
                    Final Amount
                  </label>
                  <input
                    type="text"
                    id={`finalAmount-${index}`}
                    name="finalAmount"
                    value={item.finalAmount}
                    readOnly
                    className={`w-full bg-gray-100 cursor-not-allowed ${inputClass}`}
                  />
                </div>
                {/* 12. Any Remarks */}
                <div className="col-span-full md:col-span-5 lg:col-span-3 ">
                  <label
                    htmlFor={`itemRemarks-${index}`}
                    className={labelClass}
                  >
                    Any Remarks
                  </label>
                  <textarea
                    id={`itemRemarks-${index}`}
                    name="remarks"
                    value={item.remarks}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`w-full border border-gray-300 align-middle text-sm  h-[30px] resize-y px-2 py-1 ${inputClass}`}
                    placeholder="Type Here..."
                  ></textarea>
                </div>
                {/* 13. Add/Remove Buttons */}
                <div className="flex items-end justify-end gap-2 col-span-full md:col-span-1 lg:col-span-1 min-w-[70px]">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-0.5   transition-colors  flex items-center justify-center text-base font-bold cursor-pointer"
                      aria-label="Remove Item"
                    >
                      -
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-0.5  transition-colors  flex items-center justify-center text-base font-bold cursor-pointer"
                    aria-label="Add Item"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="mt-3 flex space-x-4">
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-[#337ab7] hover:bg-[#286090] text-white transition-colors disabled:bg-gray-400 cursor-pointer"
              disabled={loading} // 🟢 Disable button while loading
            >
              {loading ? "ADDING..." : "ADD ESTIMATE"}{" "}
              {/* 🟢 Loading state feedback */}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-1.5 text-xs bg-gray-300 text-gray-800   hover:bg-gray-400 transition-colors cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEstimate1;
