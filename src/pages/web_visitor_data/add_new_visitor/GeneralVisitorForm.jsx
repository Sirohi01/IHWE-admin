import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGeneralVisitor } from "../../../features/visitor/generalVisitorSlice";
import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../../features/state/stateSlice";
import { fetchCities } from "../../../features/city/citySlice";
import { fetchEvents } from "../../../features/crmEvent/crmEventSlice";
import { fetchNatures } from "../../../features/add_by_admin/nature/natureSlice";
import { showError, showSuccess } from "../../../utils/toastMessage";
import Swal from "sweetalert2";
import { createActivityLogThunk } from "../../../features/activityLog/activityLogSlice";
import { User, Building2, MapPin, CheckSquare, Send, Calendar, Heart, Briefcase } from "lucide-react";

const GeneralVisitorForm = ({
  registrationOptions: propRegistrationOptions = [],
  industrySectors: propIndustrySectors = [],
  countries: propCountries = [],
  states: propStates = [],
  cities: propCities = [],
  genders: propGenders = [],
}) => {
  const [generalData, setGeneralData] = useState({
    registrationFor: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    alternateNo: "",
    dateOfBirth: "",
    gender: "Select Gender",
    companyName: "",
    designation: "",
    industrySector: "Select Sector",
    country: "Select Country",
    state: "Select State",
    city: "Select City",
    purposeOfVisit: {
      businessNetworking: false,
      exploringProducts: false,
      buyingProducts: false,
      learningTrends: false,
      others: false,
    },
    areaOfInterest: {
      ayushHerbal: false,
      organicProducts: false,
      fitnessWellness: false,
      healthSupplements: false,
      healthcareServices: false,
      agricultureFarming: false,
      researchInnovations: false,
      others: false,
    },
    sourceOfInformation: {
      socialMedia: false,
      friendsFamily: false,
      newspaperAds: false,
      website: false,
      emailSms: false,
      others: false,
    },
    subscribeTerms: false,
  });

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.generalVisitors);

  const { countries: reduxCountries } = useSelector((state) => state.countries);
  const { states: reduxStates } = useSelector((state) => state.states);
  const { cities: reduxCities } = useSelector((state) => state.cities);
  const { events: reduxEvents } = useSelector((state) => state.crmEvents);
  const { natures: reduxNatures } = useSelector((state) => state.natures);

  useEffect(() => {
    if (!reduxCountries || reduxCountries.length === 0) dispatch(fetchCountries());
    if (!reduxStates || reduxStates.length === 0) dispatch(fetchStates());
    if (!reduxCities || reduxCities.length === 0) dispatch(fetchCities());
    if (!reduxEvents || reduxEvents.length === 0) dispatch(fetchEvents());
    if (!reduxNatures || reduxNatures.length === 0) dispatch(fetchNatures());
  }, [dispatch]);

  const registrationOptions = propRegistrationOptions.length > 1 
    ? propRegistrationOptions 
    : ["Select Event", ...(reduxEvents || []).filter(e => e.event_status === "active").map(e => e.event_fullName).filter(Boolean)];

  const industrySectors = propIndustrySectors.length > 1
    ? propIndustrySectors
    : ["Select Sector", ...(reduxNatures || []).map(n => n.nature_name).filter(Boolean)];

  const countriesArr = propCountries.length > 1
    ? propCountries
    : ["Select Country", ...(reduxCountries || []).map(c => c.name).filter(Boolean)];

  const filteredStatesArr = (() => {
    if (!generalData.country || !reduxStates?.length) return ["Select State"];
    const countryObj = reduxCountries.find(c => c.name && c.name.trim().toLowerCase() === generalData.country.trim().toLowerCase());
    if (!countryObj) return ["Select State"];
    const filtered = reduxStates.filter(s => String(s.countryCode) === String(countryObj.countryCode));
    return ["Select State", ...filtered.map(s => s.name).filter(Boolean)];
  })();

  const filteredCitiesArr = (() => {
    if (!generalData.state || !reduxCities?.length) return ["Select City"];
    const stateObj = reduxStates.find(s => s.name && s.name.trim().toLowerCase() === generalData.state.trim().toLowerCase());
    if (!stateObj) return ["Select City"];
    const actualCities = reduxCities.data || reduxCities || [];
    const filtered = actualCities.filter(c => String(c.stateCode) === String(stateObj.stateCode));
    return ["Select City", ...filtered.map(c => c.name).filter(Boolean)];
  })();

  const genders = propGenders.length > 1 ? propGenders : ["Select Gender", "Male", "Female", "Other"];

  const resetForm = () => {
    setGeneralData({
      registrationFor: "",
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      alternateNo: "",
      dateOfBirth: "",
      gender: "Select Gender",
      companyName: "",
      designation: "",
      industrySector: "Select Sector",
      country: "Select Country",
      state: "Select State",
      city: "Select City",
      purposeOfVisit: {
        businessNetworking: false,
        exploringProducts: false,
        buyingProducts: false,
        learningTrends: false,
        others: false,
      },
      areaOfInterest: {
        ayushHerbal: false,
        organicProducts: false,
        fitnessWellness: false,
        healthSupplements: false,
        healthcareServices: false,
        agricultureFarming: false,
        researchInnovations: false,
        others: false,
      },
      subscribe: false,
    });
  };

  const handleCheckboxChange = (section, key) => {
    setGeneralData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const validate = () => {
    if (!generalData.registrationFor || generalData.registrationFor.includes("Select")) return showError("Please select Event");
    if (!generalData.firstName.trim()) return showError("First Name is required");
    if (!generalData.lastName.trim()) return showError("Last Name is required");
    if (!generalData.email.trim()) return showError("Email is required");
    if (!generalData.mobile.trim()) return showError("Mobile is required");
    if (!generalData.country || generalData.country.includes("Select")) return showError("Please select Country");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(createGeneralVisitor(generalData)).unwrap();
      
      // Log the activity
      const userId = sessionStorage.getItem("user_id");
      if (userId) {
        dispatch(createActivityLogThunk({
          user_id: userId,
          message: `Visitor Management: Registered General Visitor '${generalData.firstName} ${generalData.lastName}'`,
          section: "Client Data Section",
          data: { action: "ADD_VISITOR", type: "GENERAL", visitor: `${generalData.firstName} ${generalData.lastName}` }
        }));
      }

      Swal.fire({
        title: "Registration Success!",
        text: `${generalData.firstName} has been registered as a General Visitor.`,
        icon: "success",
        confirmButtonColor: "#23471d",
      });
      resetForm();
    } catch (err) {
      Swal.fire({
        title: "Registration Error",
        text: typeof err === "string" ? err : err?.message || "Something went wrong during registration.",
        icon: "error",
        confirmButtonColor: "#23471d",
      });
    }
  };

  const inputClass = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";
  const labelClass = "text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter";
  const sectionHeaderClass = "text-[16px] font-bold text-[#23471d] pb-1 border-b border-slate-100 mb-6 font-inter flex items-center gap-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-fadeIn">
      {/* SECTION 1: PERSONAL DETAILS */}
      <section>
        <h3 className={sectionHeaderClass}>
          <User className="w-5 h-5 text-[#d26019]" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <div>
            <label className={labelClass}>Event Name <span className="text-red-500">*</span></label>
            <select
              className={inputClass}
              value={generalData.registrationFor}
              onChange={(e) => setGeneralData({ ...generalData, registrationFor: e.target.value })}
            >
              {registrationOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass}
              placeholder="First Name"
              value={generalData.firstName}
              onChange={(e) => setGeneralData({ ...generalData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass}
              placeholder="Last Name"
              value={generalData.lastName}
              onChange={(e) => setGeneralData({ ...generalData, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              className={inputClass}
              placeholder="Email"
              value={generalData.email}
              onChange={(e) => setGeneralData({ ...generalData, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              className={inputClass}
              placeholder="Mobile No."
              value={generalData.mobile}
              onChange={(e) => setGeneralData({ ...generalData, mobile: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Alternate No.</label>
            <input
              type="tel"
              className={inputClass}
              placeholder="Optional"
              value={generalData.alternateNo}
              onChange={(e) => setGeneralData({ ...generalData, alternateNo: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              type="date"
              className={inputClass}
              value={generalData.dateOfBirth}
              onChange={(e) => setGeneralData({ ...generalData, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select
              className={inputClass}
              value={generalData.gender}
              onChange={(e) => setGeneralData({ ...generalData, gender: e.target.value })}
            >
              {genders.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROFESSIONAL & LOCATION */}
      <section>
        <h3 className={sectionHeaderClass}>
          <Briefcase className="w-5 h-5 text-[#d26019]" /> Occupation & Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <div>
            <label className={labelClass}>Company Name</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Company"
              value={generalData.companyName}
              onChange={(e) => setGeneralData({ ...generalData, companyName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Designation</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Designation"
              value={generalData.designation}
              onChange={(e) => setGeneralData({ ...generalData, designation: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Industry/Sector</label>
            <select
              className={inputClass}
              value={generalData.industrySector}
              onChange={(e) => setGeneralData({ ...generalData, industrySector: e.target.value })}
            >
              {industrySectors.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Country <span className="text-red-500">*</span></label>
            <select
              className={inputClass}
              value={generalData.country}
              onChange={(e) => setGeneralData({ ...generalData, country: e.target.value, state: "Select State", city: "Select City" })}
            >
              {countriesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>State</label>
            <select
              className={inputClass}
              value={generalData.state}
              onChange={(e) => setGeneralData({ ...generalData, state: e.target.value, city: "Select City" })}
              disabled={!generalData.country || generalData.country.includes("Select")}
            >
              {filteredStatesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>City</label>
            <select
              className={inputClass}
              value={generalData.city}
              onChange={(e) => setGeneralData({ ...generalData, city: e.target.value })}
              disabled={!generalData.state || generalData.state.includes("Select")}
            >
              {filteredCitiesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERESTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h3 className={sectionHeaderClass}>
            <CheckSquare className="w-5 h-5 text-[#d26019]" /> Purpose of Visit
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-4 border border-slate-200 rounded-sm">
            {[
              { key: "businessNetworking", label: "Business Networking" },
              { key: "exploringProducts", label: "Exploring Products" },
              { key: "buyingProducts", label: "Buying Products" },
              { key: "learningTrends", label: "Learning Trends" },
              { key: "others", label: "Others" }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={generalData.purposeOfVisit[key]}
                  onChange={() => handleCheckboxChange("purposeOfVisit", key)}
                  className="w-4 h-4 rounded border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                />
                <span className="text-[13px] font-medium text-gray-600 group-hover:text-[#23471d] transition-colors">{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className={sectionHeaderClass}>
            <Heart className="w-5 h-5 text-[#d26019]" /> Areas of Interest
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-4 border border-slate-200 rounded-sm">
            {[
              { key: "ayushHerbal", label: "AYUSH & Herbal" },
              { key: "organicProducts", label: "Organic Products" },
              { key: "fitnessWellness", label: "Fitness & Wellness" },
              { key: "healthSupplements", label: "Health Supplements" },
              { key: "healthcareServices", label: "Healthcare Services" },
              { key: "agricultureFarming", label: "Agriculture" },
              { key: "researchInnovations", label: "Innovations" }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={generalData.areaOfInterest[key]}
                  onChange={() => handleCheckboxChange("areaOfInterest", key)}
                  className="w-4 h-4 rounded border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                />
                <span className="text-[13px] font-medium text-gray-600 group-hover:text-[#23471d] transition-colors">{label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER OPTIONS */}
      <section className="bg-[#f9f9f9] p-6 border-l-4 border-[#23471d]">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={generalData.subscribe}
            onChange={(e) => setGeneralData({ ...generalData, subscribe: e.target.checked })}
            className="w-5 h-5 rounded border-slate-400 text-[#23471d] focus:ring-[#23471d]"
          />
          <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Subscribe to Event Updates & Newsletters</span>
        </label>
      </section>

      {/* FOOTER ACTIONS ── STICKY VIBE */}
      <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center mt-12 bg-white pb-6">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 sm:mb-0">
          <Heart size={14} className="text-[#23471d]" />
          SECURE VISITOR PORTAL
        </p>
        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={resetForm}
            className="px-10 py-2.5 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px] shadow-sm"
          >
            Reset Form
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-3 group"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                SUBMIT REGISTRATION
                <Send size={15} className="group-hover:translate-x-1.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default GeneralVisitorForm;
