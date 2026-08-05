import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInternationalVisitor } from "../../../features/visitor/internationalVisitorSlice";
import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../../features/state/stateSlice";
import { fetchCities } from "../../../features/city/citySlice";
import { fetchEvents } from "../../../features/crmEvent/crmEventSlice";
import { fetchNatures } from "../../../features/add_by_admin/nature/natureSlice";
import { showError, showSuccess } from "../../../utils/toastMessage";
import Swal from "sweetalert2";
import { createActivityLogThunk } from "../../../features/activityLog/activityLogSlice";
import { User, Building2, Globe, MapPin, CheckSquare, Send, Briefcase, Plane } from "lucide-react";

// Must stay identical to PURPOSE_OPTIONS/INTEREST_OPTIONS in
// frontend/src/pages/visitors/international_vistor/AddInternationalVistor.tsx
// so admin-entered and website-entered visitors store the same values.
const PURPOSE_OPTIONS = [
  "Business Networking", "Product Sourcing", "Distributor Search",
  "Franchise Opportunity", "Investment Opportunity", "Medical Tourism",
  "Healthcare Collaboration", "Wellness Industry Exploration",
  "Ayurveda & AYUSH Interest", "Conference Participation",
  "Knowledge Sessions", "Startup Collaboration", "Government Delegation", "General Visit",
];

const INTEREST_OPTIONS = [
  "Business Networking", "Product Sourcing", "Distributor Search",
  "Franchise Opportunity", "Investment Opportunity", "Medical Tourism",
  "Healthcare Collaboration", "Wellness Industry Exploration",
  "Ayurveda & AYUSH Interest", "Conference Participation",
  "Knowledge Sessions", "Startup Collaboration", "Government Delegation", "General Visit",
];

const InternationalVisitorForm = ({
  registrationOptions: propRegistrationOptions = [],
  industrySectors: propIndustrySectors = [],
  countries: propCountries = [],
  states: propStates = [],
  cities: propCities = [],
}) => {
  const [corporateData, setCorporateData] = useState({
    registrationFor: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    personalEmail: "",
    mobile: "",
    whatsappNo: "",
    indiaContactNo: "",
    designation: "",
    companyName: "",
    companyWebsite: "",
    industrySector: "",
    companySize: "",
    nationality: "",
    passportNo: "",
    occupation: "",
    address: "",
    country: "",
    state: "",
    city: "",
    companyPincode: "",
    preferredDate: "",
    invitationLetter: "no",
    hotelAssistance: "no",
    airportPickup: "no",
    translatorSupport: "no",
    conferenceInterest: "no",
    conferenceRole: "",
    vipPass: "no",
    b2bMeeting: "",
    whatsappUpdates: "",
    specificRequirement: "",
    subscribe: false,
    purposeOfVisit: [],
    areaOfInterest: [],
  });

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.internationalVisitors);

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
    if (!corporateData.country || !reduxStates?.length) return ["Select State"];
    const countryObj = reduxCountries.find(c => c.name && c.name.trim().toLowerCase() === corporateData.country.trim().toLowerCase());
    if (!countryObj) return ["Select State"];
    const filtered = reduxStates.filter(s => String(s.countryCode) === String(countryObj.countryCode));
    return ["Select State", ...filtered.map(s => s.name).filter(Boolean)];
  })();

  const filteredCitiesArr = (() => {
    if (!corporateData.state || !reduxCities?.length) return ["Select City"];
    const stateObj = reduxStates.find(s => s.name && s.name.trim().toLowerCase() === corporateData.state.trim().toLowerCase());
    if (!stateObj) return ["Select City"];
    const actualCities = reduxCities.data || reduxCities || [];
    const filtered = actualCities.filter(c => String(c.stateCode) === String(stateObj.stateCode));
    return ["Select City", ...filtered.map(c => c.name).filter(Boolean)];
  })();


  const resetForm = () => {
    setCorporateData({
      registrationFor: "",
      firstName: "",
      lastName: "",
      gender: "",
      dob: "",
      email: "",
      personalEmail: "",
      mobile: "",
      whatsappNo: "",
      indiaContactNo: "",
      designation: "",
      companyName: "",
      companyWebsite: "",
      industrySector: "",
      companySize: "",
      nationality: "",
      passportNo: "",
      occupation: "",
      address: "",
      country: "",
      state: "",
      city: "",
      companyPincode: "",
      preferredDate: "",
      invitationLetter: "no",
      hotelAssistance: "no",
      airportPickup: "no",
      translatorSupport: "no",
      conferenceInterest: "no",
      conferenceRole: "",
      vipPass: "no",
      b2bMeeting: "",
      whatsappUpdates: "",
      specificRequirement: "",
      subscribe: false,
      purposeOfVisit: [],
      areaOfInterest: [],
    });
  };

  const handleCheckboxList = (field, opt, checked) => {
    setCorporateData(prev => ({
      ...prev,
      [field]: checked ? [...prev[field], opt] : prev[field].filter(i => i !== opt)
    }));
  };

  const handleRadioChange = (name, value) => {
    setCorporateData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!corporateData.registrationFor || corporateData.registrationFor.includes("Select")) return showError("Please select Event");
    if (!corporateData.firstName.trim()) return showError("First Name is required");
    if (!corporateData.lastName.trim()) return showError("Last Name is required");
    if (!corporateData.gender || corporateData.gender.includes("Select")) return showError("Gender is required");
    if (!corporateData.email.trim()) return showError("Email is required");
    if (!corporateData.mobile.trim()) return showError("Mobile is required");
    if (!corporateData.companyName.trim()) return showError("Company Name is required");
    if (!corporateData.industrySector || corporateData.industrySector.includes("Select")) return showError("Please select Sector");
    if (!corporateData.nationality || corporateData.nationality.includes("Select")) return showError("Please select Nationality");
    if (!corporateData.country || corporateData.country.includes("Select")) return showError("Please select Country");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(createInternationalVisitor(corporateData)).unwrap();

      // Log the activity
      const userId = sessionStorage.getItem("user_id");
      if (userId) {
        dispatch(createActivityLogThunk({
          user_id: userId,
          message: `Visitor Management: Registered International Visitor '${corporateData.firstName} ${corporateData.lastName}' from '${corporateData.companyName}'`,
          section: "Client Data Section",
          data: { action: "ADD_VISITOR", type: "CORPORATE", visitor: `${corporateData.firstName} ${corporateData.lastName}`, company: corporateData.companyName }
        }));
      }

      Swal.fire({
        title: "Registration Success!",
        text: `${corporateData.firstName} has been registered as a International Visitor.`,
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
  const labelClass = "text-[11px] font-semibold text-slate-700 mb-1 block capitalize font-inter";
  const sectionHeaderClass = "text-[13px] font-semibold text-[#23471d] pb-1 border-b border-slate-200 mb-2 font-inter flex items-center gap-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 animate-fadeIn">
      {/* SECTION 1: EVENT & PERSONAL */}
      <section>
        <h3 className={sectionHeaderClass}>
          <User className="w-5 h-5 text-[#d26019]" /> Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <label className={labelClass}>Event Name <span className="text-red-500">*</span></label>
            <select
              className={inputClass}
              value={corporateData.registrationFor}
              onChange={(e) => setCorporateData({ ...corporateData, registrationFor: e.target.value })}
            >
              {registrationOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass}
              placeholder="Jhon"
              value={corporateData.firstName}
              onChange={(e) => setCorporateData({ ...corporateData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass}
              placeholder="Doe"
              value={corporateData.lastName}
              onChange={(e) => setCorporateData({ ...corporateData, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
            <select
              className={inputClass}
              value={corporateData.gender}
              onChange={(e) => setCorporateData({ ...corporateData, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              type="date"
              className={inputClass}
              value={corporateData.dob}
              onChange={(e) => setCorporateData({ ...corporateData, dob: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Passport Number</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Passport / ID No."
              value={corporateData.passportNo}
              onChange={(e) => setCorporateData({ ...corporateData, passportNo: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Occupation</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Occupation"
              value={corporateData.occupation}
              onChange={(e) => setCorporateData({ ...corporateData, occupation: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              className={inputClass}
              placeholder="jhon@company.com"
              value={corporateData.email}
              onChange={(e) => setCorporateData({ ...corporateData, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Personal Email</label>
            <input
              type="email"
              className={inputClass}
              placeholder="personal@email.com"
              value={corporateData.personalEmail}
              onChange={(e) => setCorporateData({ ...corporateData, personalEmail: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              className={inputClass}
              placeholder="+91 00000 00000"
              value={corporateData.mobile}
              onChange={(e) => setCorporateData({ ...corporateData, mobile: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>WhatsApp Number</label>
            <input
              type="tel"
              className={inputClass}
              placeholder="+1 234 567 8900"
              value={corporateData.whatsappNo}
              onChange={(e) => setCorporateData({ ...corporateData, whatsappNo: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>India Contact Number</label>
            <input
              type="tel"
              className={inputClass}
              placeholder="+91 123 456 7890"
              value={corporateData.indiaContactNo}
              onChange={(e) => setCorporateData({ ...corporateData, indiaContactNo: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Designation</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Manager"
              value={corporateData.designation}
              onChange={(e) => setCorporateData({ ...corporateData, designation: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Company Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass}
              placeholder="Company Ltd."
              value={corporateData.companyName}
              onChange={(e) => setCorporateData({ ...corporateData, companyName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Company Website</label>
            <input
              type="text"
              className={inputClass}
              placeholder="www.company.com"
              value={corporateData.companyWebsite}
              onChange={(e) => setCorporateData({ ...corporateData, companyWebsite: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: INDUSTRY & LOCATION */}
      <section>
        <h3 className={sectionHeaderClass}>
          <Building2 className="w-5 h-5 text-[#d26019]" /> Professional Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <div>
            <label className={labelClass}>Industry/Sector <span className="text-red-500">*</span></label>
            <select
              className={inputClass}
              value={corporateData.industrySector}
              onChange={(e) => setCorporateData({ ...corporateData, industrySector: e.target.value })}
            >
              {industrySectors.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Company Size</label>
            <select
              className={inputClass}
              value={corporateData.companySize}
              onChange={(e) => setCorporateData({ ...corporateData, companySize: e.target.value })}
            >
              <option value="">Select Size</option>
              <option value="1-10">1-10 Employees</option>
              <option value="11-50">11-50 Employees</option>
              <option value="51-200">51-200 Employees</option>
              <option value="201+">201+ Employees</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Nationality <span className="text-red-500">*</span></label>
            <select
              className={inputClass}
              value={corporateData.nationality}
              onChange={(e) => setCorporateData({ ...corporateData, nationality: e.target.value })}
            >
              {countriesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Country <span className="text-red-500">*</span></label>
            <select
              className={inputClass}
              value={corporateData.country}
              onChange={(e) => setCorporateData({ ...corporateData, country: e.target.value, state: "", city: "" })}
            >
              {countriesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>State</label>
            <select
              className={inputClass}
              value={corporateData.state}
              onChange={(e) => setCorporateData({ ...corporateData, state: e.target.value, city: "" })}
              disabled={!corporateData.country || corporateData.country.includes("Select")}
            >
              {filteredStatesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>City</label>
            <select
              className={inputClass}
              value={corporateData.city}
              onChange={(e) => setCorporateData({ ...corporateData, city: e.target.value })}
              disabled={!corporateData.state || corporateData.state.includes("Select")}
            >
              {filteredCitiesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Residential Address</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Street / Area / Building"
              value={corporateData.address}
              onChange={(e) => setCorporateData({ ...corporateData, address: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Postal Code</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Postal / ZIP Code"
              value={corporateData.companyPincode}
              onChange={(e) => setCorporateData({ ...corporateData, companyPincode: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2B: VISIT PLANNING */}
      <section>
        <h3 className={sectionHeaderClass}>
          <Plane className="w-5 h-5 text-[#d26019]" /> Visit Planning
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-5">
          <div>
            <label className={labelClass}>Preferred Visit Days</label>
            <select
              className={inputClass}
              value={corporateData.preferredDate}
              onChange={(e) => setCorporateData({ ...corporateData, preferredDate: e.target.value })}
            >
              <option value="">Select Days</option>
              <option value="1 Day">1 Day</option>
              <option value="2 Days">2 Days</option>
              <option value="3 Days">3 Days</option>
              <option value="All Days">All Days</option>
            </select>
          </div>
          {[
            { name: "invitationLetter", label: "Need Invitation Letter for Visa?" },
            { name: "hotelAssistance", label: "Need Hotel Booking Assistance?" },
            { name: "airportPickup", label: "Need Airport Pickup?" },
            { name: "translatorSupport", label: "Need Translator Support?" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className={labelClass}>{label}</label>
              <div className="flex gap-4 mt-1">
                {["yes", "no"].map(val => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-700 capitalize">
                    <input
                      type="radio"
                      name={name}
                      checked={corporateData[name] === val}
                      onChange={() => handleRadioChange(name, val)}
                      className="w-4 h-4 text-[#23471d]"
                    /> {val}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2C: CONFERENCE PARTICIPATION */}
      <section>
        <h3 className={sectionHeaderClass}>
          <User className="w-5 h-5 text-[#d26019]" /> Conference Participation
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
          <div>
            <label className={labelClass}>Interested in Medical Conference / Knowledge Sessions?</label>
            <div className="flex gap-4 mt-1">
              {["yes", "no"].map(val => (
                <label key={val} className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-700 capitalize">
                  <input
                    type="radio"
                    name="conferenceInterest"
                    checked={corporateData.conferenceInterest === val}
                    onChange={() => handleRadioChange("conferenceInterest", val)}
                    className="w-4 h-4 text-[#23471d]"
                  /> {val}
                </label>
              ))}
            </div>
          </div>
          {corporateData.conferenceInterest === "yes" && (
            <div>
              <label className={labelClass}>Interested As</label>
              <select
                className={inputClass}
                value={corporateData.conferenceRole}
                onChange={(e) => setCorporateData({ ...corporateData, conferenceRole: e.target.value })}
              >
                <option value="">Select Role</option>
                {["Delegate", "Attendee", "Speaker", "Panel Participant", "Industry Expert"].map(r => (
                  <option key={r} value={r.toLowerCase().replace(" ", "-")}>{r}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: PREFERENCES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h3 className={sectionHeaderClass}>
            <CheckSquare className="w-5 h-5 text-[#d26019]" /> Purpose of Visit
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 border border-slate-200 rounded-sm">
            {PURPOSE_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={corporateData.purposeOfVisit.includes(opt)}
                  onChange={(e) => handleCheckboxList("purposeOfVisit", opt, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                />
                <span className="text-[13px] font-medium text-gray-600 group-hover:text-[#23471d] transition-colors">{opt}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className={sectionHeaderClass}>
            <CheckSquare className="w-5 h-5 text-[#d26019]" /> Areas of Interest
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 border border-slate-200 rounded-sm">
            {INTEREST_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={corporateData.areaOfInterest.includes(opt)}
                  onChange={(e) => handleCheckboxList("areaOfInterest", opt, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                />
                <span className="text-[13px] font-medium text-gray-600 group-hover:text-[#23471d] transition-colors">{opt}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* SECTION 4: OPTIONS */}
      <section className="bg-[#f9f9f9] py-3 px-5 border-l-4 border-[#23471d] space-y-6">
        <div className="flex flex-row w-full gap-8">
          <div className="w-[75%]">
            <label className={labelClass}>Specific Requirements</label>
            <textarea
              className="w-full h-9 px-2 border border-slate-400 focus:border-[#23471d] outline-none text-[12px] rounded-[2px] bg-white resize-none"
              placeholder="Write your requirements here..."
              value={corporateData.specificRequirement}
             
              onChange={(e) => setCorporateData({ ...corporateData, specificRequirement: e.target.value })}
            />
          </div>
          <div className="w-[25%] flex flex-row gap-8">
            <div>
              <label className={labelClass}>B2B Meetings?</label>
              <div className="flex gap-6 mt-1">
                {["yes", "no"].map(val => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-700 capitalize">
                    <input
                      type="radio"
                      name="b2b"
                      checked={corporateData.b2bMeeting === val}
                      onChange={() => setCorporateData({ ...corporateData, b2bMeeting: val })}
                      className="w-4 h-4 text-[#23471d]"
                    /> {val}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>WhatsApp Updates?</label>
              <div className="flex gap-6 mt-1">
                {["yes", "no"].map(val => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-700 capitalize">
                    <input
                      type="radio"
                      name="whatsapp"
                      checked={corporateData.whatsappUpdates === val}
                      onChange={() => setCorporateData({ ...corporateData, whatsappUpdates: val })}
                      className="w-4 h-4 text-[#23471d]"
                    /> {val}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER ACTIONS ── STICKY VIBE */}
      <div className=" border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center py-4 bg-white ">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 sm:mb-0">
          <CheckSquare size={14} className="text-[#23471d]" />
          SECURE VISITOR PORTAL
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-10 py-1.5 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px] shadow-sm"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-1.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-3 group"
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

export default InternationalVisitorForm;


