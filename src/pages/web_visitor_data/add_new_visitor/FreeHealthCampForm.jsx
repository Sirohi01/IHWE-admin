import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createHealthCampVisitor } from "../../../features/visitor/freeHealthCampSlice";
import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../../features/state/stateSlice";
import { fetchCities } from "../../../features/city/citySlice";
import { showError, showSuccess } from "../../../utils/toastMessage";
import Swal from "sweetalert2";
import { createActivityLogThunk } from "../../../features/activityLog/activityLogSlice";
import { User, MapPin, Heart, Activity, Calendar, Clock, CheckSquare, Send, Thermometer, ShieldCheck } from "lucide-react";

const FreeHealthCampForm = ({
  countries: propCountries = [],
  states: propStates = [],
  cities: propCities = [],
  genders: propGenders = [],
  timeSlots: propTimeSlots = [],
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.healthCampVisitors);

  const { countries: reduxCountries } = useSelector((state) => state.countries);
  const { states: reduxStates } = useSelector((state) => state.states);
  const { cities: reduxCities } = useSelector((state) => state.cities);

  useEffect(() => {
    if (!reduxCountries || reduxCountries.length === 0) dispatch(fetchCountries());
    if (!reduxStates || reduxStates.length === 0) dispatch(fetchStates());
    if (!reduxCities || reduxCities.length === 0) dispatch(fetchCities());
  }, [dispatch]);

  const countriesArr = propCountries.length > 1
    ? propCountries
    : ["Select Country", ...(reduxCountries || []).map(c => c.name).filter(Boolean)];

  const statesArr = propStates.length > 1
    ? propStates
    : ["Select State", ...(reduxStates || []).map(s => s.name).filter(Boolean)];

  const citiesArr = propCities.length > 1
    ? propCities
    : ["Select City", ...(reduxCities?.data || reduxCities || []).map(c => c.name).filter(Boolean)];

  const genders = propGenders.length > 1 ? propGenders : ["Select Gender", "Male", "Female", "Other"];
  const timeSlots = propTimeSlots.length > 0 ? propTimeSlots : ["09:00 AM - 12:00 PM", "12:00 PM - 03:00 PM", "03:00 PM - 06:00 PM"];

  const [healthCampData, setHealthCampData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    alternateNo: "",
    dateOfBirth: "",
    gender: "Select Gender",
    residenceAddress: "",
    country: "Select Country",
    state: "Select State",
    city: "Select City",
    existingMedicalConditions: "",
    isTakingMedications: "",
    medicationNames: "",
    hasAllergies: "",
    allergyDetails: "",
    isExperiencingSymptoms: "",
    symptomDetails: "",
    healthCheckupServices: {
      generalHealth: false,
      bloodSugar: false,
      bloodPressure: false,
      eyeCheckup: false,
      dentalCheckup: false,
      ayurvedaConsultation: false,
      nutritionConsultation: false,
      other: false,
    },
    preferredDate: "",
    preferredTimeSlot: "09:00 AM - 12:00 PM",
    consentMedicalData: "",
    agreeToUpdates: "",
    specificHealthConcerns: "",
    subscribe: false,
  });

  const resetForm = () => {
    setHealthCampData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      alternateNo: "",
      dateOfBirth: "",
      gender: "Select Gender",
      residenceAddress: "",
      country: "Select Country",
      state: "Select State",
      city: "Select City",
      existingMedicalConditions: "",
      isTakingMedications: "",
      medicationNames: "",
      hasAllergies: "",
      allergyDetails: "",
      isExperiencingSymptoms: "",
      symptomDetails: "",
      healthCheckupServices: {
        generalHealth: false,
        bloodSugar: false,
        bloodPressure: false,
        eyeCheckup: false,
        dentalCheckup: false,
        ayurvedaConsultation: false,
        nutritionConsultation: false,
        other: false,
      },
      preferredDate: "",
      preferredTimeSlot: "09:00 AM - 12:00 PM",
      consentMedicalData: "",
      agreeToUpdates: "",
      specificHealthConcerns: "",
      subscribe: false,
    });
  };

  const handleHealthServiceChange = (key) => {
    setHealthCampData(prev => ({
      ...prev,
      healthCheckupServices: {
        ...prev.healthCheckupServices,
        [key]: !prev.healthCheckupServices[key]
      }
    }));
  };

  const validate = () => {
    if (!healthCampData.firstName.trim()) return showError("First Name is required");
    if (!healthCampData.lastName.trim()) return showError("Last Name is required");
    if (!healthCampData.email.trim()) return showError("Email is required");
    if (!healthCampData.mobile.trim()) return showError("Mobile is required");
    if (!healthCampData.consentMedicalData) return showError("Please answer the consent question");
    if (!healthCampData.agreeToUpdates) return showError("Please answer the agreement question");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(createHealthCampVisitor(healthCampData)).unwrap();
      
      // Log the activity
      const userId = sessionStorage.getItem("user_id");
      if (userId) {
        dispatch(createActivityLogThunk({
          user_id: userId,
          message: `Visitor Management: Registered Health Camp Visitor '${healthCampData.firstName} ${healthCampData.lastName}'`,
          section: "Client Data Section",
          data: { action: "ADD_VISITOR", type: "HEALTH_CAMP", visitor: `${healthCampData.firstName} ${healthCampData.lastName}` }
        }));
      }

      Swal.fire({
        title: "Registration Success!",
        text: `Medical registration for ${healthCampData.firstName} has been confirmed.`,
        icon: "success",
        confirmButtonColor: "#23471d",
      });
      resetForm();
    } catch (err) {
      Swal.fire({
        title: "Registration Error",
        text: typeof err === "string" ? err : err?.message || "Something went wrong during health camp registration.",
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
          <User className="w-5 h-5 text-[#d26019]" /> Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <div>
            <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass}
              placeholder="First Name"
              value={healthCampData.firstName}
              onChange={(e) => setHealthCampData({ ...healthCampData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass}
              placeholder="Last Name"
              value={healthCampData.lastName}
              onChange={(e) => setHealthCampData({ ...healthCampData, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              className={inputClass}
              placeholder="Email"
              value={healthCampData.email}
              onChange={(e) => setHealthCampData({ ...healthCampData, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              className={inputClass}
              placeholder="Mobile No."
              value={healthCampData.mobile}
              onChange={(e) => setHealthCampData({ ...healthCampData, mobile: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Alternate No.</label>
            <input
              type="tel"
              className={inputClass}
              placeholder="Optional"
              value={healthCampData.alternateNo}
              onChange={(e) => setHealthCampData({ ...healthCampData, alternateNo: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
            <input
              type="date"
              className={inputClass}
              value={healthCampData.dateOfBirth}
              onChange={(e) => setHealthCampData({ ...healthCampData, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
            <select
              className={inputClass}
              value={healthCampData.gender}
              onChange={(e) => setHealthCampData({ ...healthCampData, gender: e.target.value })}
            >
              {genders.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Residence Address</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Full Address"
              value={healthCampData.residenceAddress}
              onChange={(e) => setHealthCampData({ ...healthCampData, residenceAddress: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <select
              className={inputClass}
              value={healthCampData.country}
              onChange={(e) => setHealthCampData({ ...healthCampData, country: e.target.value, state: "Select State", city: "Select City" })}
            >
              {countriesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>State</label>
            <select
              className={inputClass}
              value={healthCampData.state}
              onChange={(e) => setHealthCampData({ ...healthCampData, state: e.target.value, city: "Select City" })}
            >
              {statesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>City</label>
            <select
              className={inputClass}
              value={healthCampData.city}
              onChange={(e) => setHealthCampData({ ...healthCampData, city: e.target.value })}
            >
              {citiesArr.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 2: HEALTH INFO */}
      <section>
        <h3 className={sectionHeaderClass}>
          <Heart className="w-5 h-5 text-[#d26019]" /> Medical Background
        </h3>
        <div className="space-y-6 bg-slate-50 p-6 border border-slate-200">
          {[
            { label: "Existing Medical Conditions?", key: "existingMedicalConditions", area: "existingMedicalConditions" },
            { label: "Currently taking medications?", key: "isTakingMedications", area: "medicationNames" },
            { label: "Do you have any allergies?", key: "hasAllergies", area: "allergyDetails" },
            { label: "Experiencing any symptoms currently?", key: "isExperiencingSymptoms", area: "symptomDetails" }
          ].map(({ label, key, area }) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="text-[13px] font-bold text-gray-700 uppercase">{label}</label>
                <div className="flex gap-4 mt-2">
                  {["yes", "no"].map(val => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer text-[12px] font-bold text-gray-600 uppercase">
                      <input
                        type="radio"
                        name={key}
                        checked={healthCampData[key] === val}
                        onChange={() => setHealthCampData({ ...healthCampData, [key]: val })}
                        className="w-4 h-4 text-[#23471d]"
                      /> {val}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                {healthCampData[key] === "yes" && (
                  <textarea
                    className="w-full h-16 p-2 border border-slate-400 focus:border-[#23471d] outline-none text-[12.5px] rounded-[2px] bg-white resize-none shadow-inner"
                    placeholder="Provide details here..."
                    value={healthCampData[area]}
                    onChange={(e) => setHealthCampData({ ...healthCampData, [area]: e.target.value })}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: SERVICES & PREFERENCES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h3 className={sectionHeaderClass}>
            <Activity className="w-5 h-5 text-[#d26019]" /> Health Check-Up Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-[#f0f4f0] p-4 border border-[#23471d]/20 rounded-sm">
            {[
              { key: "generalHealth", label: "General Check-up" },
              { key: "bloodSugar", label: "Blood Sugar Test" },
              { key: "bloodPressure", label: "Blood Pressure" },
              { key: "eyeCheckup", label: "Eye Check-up" },
              { key: "dentalCheckup", label: "Dental Check-up" },
              { key: "ayurvedaConsultation", label: "Ayurveda Consultation" },
              { key: "nutritionConsultation", label: "Nutrition Consultation" },
              { key: "other", label: "Other" }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={healthCampData.healthCheckupServices[key]}
                  onChange={() => handleHealthServiceChange(key)}
                  className="w-4 h-4 rounded border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                />
                <span className="text-[13px] font-medium text-gray-600 group-hover:text-[#23471d] transition-colors">{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className={sectionHeaderClass}>
            <Calendar className="w-5 h-5 text-[#d26019]" /> Appointment Schedule
          </h3>
          <div className="space-y-5 bg-slate-50 p-6 border border-slate-200">
            <div>
              <label className={labelClass}>Preferred Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className={inputClass}
                value={healthCampData.preferredDate}
                onChange={(e) => setHealthCampData({ ...healthCampData, preferredDate: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Preferred Time Slot <span className="text-red-500">*</span></label>
              <select
                className={inputClass}
                value={healthCampData.preferredTimeSlot}
                onChange={(e) => setHealthCampData({ ...healthCampData, preferredTimeSlot: e.target.value })}
              >
                {timeSlots.map((slot, i) => <option key={i} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 4: CONSENT & SUBMISSION */}
      <section className="bg-orange-50 p-6 border-l-4 border-[#d26019] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-bold text-gray-700 uppercase block mb-2 leading-tight">Consent to share medical data for analysis? <span className="text-red-500">*</span></label>
              <div className="flex gap-6">
                {["yes", "no"].map(val => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer text-[13px] font-bold text-gray-700 uppercase">
                    <input
                      type="radio"
                      name="consent"
                      checked={healthCampData.consentMedicalData === val}
                      onChange={() => setHealthCampData({ ...healthCampData, consentMedicalData: val })}
                      className="w-4 h-4 text-[#23471d]"
                    /> {val}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-bold text-gray-700 uppercase block mb-2 leading-tight">Agree to health updates & reminders? <span className="text-red-500">*</span></label>
              <div className="flex gap-6">
                {["yes", "no"].map(val => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer text-[13px] font-bold text-gray-700 uppercase">
                    <input
                      type="radio"
                      name="updates"
                      checked={healthCampData.agreeToUpdates === val}
                      onChange={() => setHealthCampData({ ...healthCampData, agreeToUpdates: val })}
                      className="w-4 h-4 text-[#23471d]"
                    /> {val}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Specific health concerns or questions?</label>
            <textarea
              className="w-full h-24 p-2 border border-slate-400 focus:border-[#23471d] outline-none text-[12.5px] rounded-[2px] bg-white resize-none"
              placeholder="Mention any specific concerns for the doctors..."
              value={healthCampData.specificHealthConcerns}
              onChange={(e) => setHealthCampData({ ...healthCampData, specificHealthConcerns: e.target.value })}
            />
          </div>
        </div>
        <div className="pt-4 border-t border-orange-100">
           <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={healthCampData.subscribe}
              onChange={(e) => setHealthCampData({ ...healthCampData, subscribe: e.target.checked })}
              className="w-5 h-5 rounded border-slate-400 text-[#23471d] focus:ring-[#23471d]"
            />
            <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Subscribe to Event Updates & Wellness Newsletters</span>
          </label>
        </div>
      </section>

      {/* FOOTER ACTIONS ── STICKY VIBE */}
      <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center mt-12 bg-white pb-6">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 sm:mb-0">
          <ShieldCheck size={14} className="text-[#23471d]" />
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

export default FreeHealthCampForm;
