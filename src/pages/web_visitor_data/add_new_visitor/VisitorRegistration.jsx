import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CorporateVisitorForm from "./CorporateVisitorForm";
import GeneralVisitorForm from "./GeneralVisitorForm";
import FreeHealthCampForm from "./FreeHealthCampForm";
import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../../features/state/stateSlice";
import { fetchCities } from "../../../features/city/citySlice";

const VisitorRegistration = ({ onNavigateToList, initialType = "corporate", hideTabs = false }) => {
  const dispatch = useDispatch();
  const [visitorType, setVisitorType] = useState(initialType);

  useEffect(() => {
    setVisitorType(initialType);
  }, [initialType]);

  // Redux data
  const { countries: countriesData } = useSelector((state) => state.countries);
  const { states: statesData } = useSelector((state) => state.states);
  const { cities: citiesData } = useSelector((state) => state.cities);

  const countryNames = [
    "Select Country",
    ...(countriesData || []).map((c) => c.name).filter(Boolean),
  ];
  const stateNames = [
    "Select Country first",
    ...(statesData || []).map((s) => s.name).filter(Boolean),
  ];
  const cityNames = [
    "Select State first",
    ...(citiesData?.data || citiesData || [])
      .map((c) => c.name)
      .filter(Boolean),
  ];

  const registrationOptions = [
    "Select Here",
    "4th Organic Expo 2026",
    "9th International Health and Wellness Expo",
  ];
  const genders = ["Select Here", "Male", "Female", "Other"];
  const timeSlots = [
    "09:00 AM - 12:00 PM",
    "12:00 PM - 03:00 PM",
    "03:00 PM - 06:00 PM",
  ];
  const industrySectors = [
    "Select Here",
    "AYUSH & Herbal Products",
    "Health & Wellness",
    "Organic Farming & Agriculture",
    "Fitness & Nutrition",
    "Bio-Medicine & Research",
    "HealthTech & Startups",
    "Pharmaceuticals",
    "Healthcare Services",
    "Medical Equipment",
  ];

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchStates());
    dispatch(fetchCities());
  }, [dispatch]);

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
      {/* ── HEADER AREA ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100 bg-white px-2 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight leading-none">
            VISITOR DETAILS
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Visitor Registration Portal
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <button className="px-3 py-1.5 text-[11px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center gap-1.5 rounded-[2px] shadow-sm">
            Master List
          </button>
          <button
            onClick={onNavigateToList}
            className="px-3 py-1.5 text-[11px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center gap-1.5 rounded-[2px] shadow-sm"
          >
            Visitor List
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        <div className="bg-white shadow-md border border-gray-200 rounded-[2px] overflow-hidden">
          {/* ── SUB-HEADER ── */}
          <div className="bg-slate-50/50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">
              Add New Visitor
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
              International Health & Wellness Expo 2026
            </p>
          </div>

          <div className="p-6 lg:p-10">
            {!hideTabs && (
              <div className="mb-8 flex gap-8 border-b border-gray-100 pb-4">
                {[
                  { value: "corporate", label: "Corporate Visitor" },
                  { value: "general", label: "General Visitor" },
                  { value: "freeHealth", label: "Free Health Camp" },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="visitorType"
                      value={value}
                      checked={visitorType === value}
                      onChange={(e) => setVisitorType(e.target.value)}
                      className="h-5 w-5 text-[#23471d] border-gray-300 focus:ring-[#23471d]"
                    />
                    <span className={`text-sm font-bold uppercase tracking-tight transition-colors ${
                      visitorType === value ? "text-[#23471d]" : "text-gray-500 group-hover:text-gray-700"
                    }`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6">
              {visitorType === "corporate" && (
                <CorporateVisitorForm
                  registrationOptions={registrationOptions}
                  industrySectors={industrySectors}
                  countries={countryNames}
                  states={stateNames}
                  cities={cityNames}
                />
              )}
              {visitorType === "general" && (
                <GeneralVisitorForm
                  registrationOptions={registrationOptions}
                  industrySectors={industrySectors}
                  countries={countryNames}
                  states={stateNames}
                  cities={cityNames}
                  genders={genders}
                />
              )}
              {visitorType === "freeHealth" && (
                <FreeHealthCampForm
                  countries={countryNames}
                  states={stateNames}
                  cities={cityNames}
                  genders={genders}
                  timeSlots={timeSlots}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorRegistration;
