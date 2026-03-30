// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import CorporateVisitorForm from "./CorporateVisitorForm";
// import GeneralVisitorForm from "./GeneralVisitorForm";
// import FreeHealthCampForm from "./FreeHealthCampForm";
// import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
// import { fetchStates } from "../../../features/state/stateSlice";
// import { fetchCities } from "../../../features/city/citySlice";

// const VisitorRegistration = ({ onNavigateToList }) => {
//   const dispatch = useDispatch();
//   const [visitorType, setVisitorType] = useState("corporate");

//   // ✅ Redux se lo — static arrays hata diye
//   const { countries: countriesData } = useSelector((state) => state.countries);
//   const { states: statesData } = useSelector((state) => state.states);
//   const { cities: citiesData } = useSelector((state) => state.cities);

//   // ✅ Country/State/City names array banao
//   const countryNames = [
//     "Select Country",
//     ...(countriesData || []).map((c) => c.name).filter(Boolean),
//   ];
//   const stateNames = [
//     "Select Country first",
//     ...(statesData || []).map((s) => s.name).filter(Boolean),
//   ];
//   const cityNames = [
//     "Select State first",
//     ...(citiesData?.data || citiesData || [])
//       .map((c) => c.name)
//       .filter(Boolean),
//   ];

//   const registrationOptions = [
//     "Select Here",
//     "4th Organic Expo 2026",
//     "9th International Health and Wellness Expo",
//   ];
//   const genders = ["Select Here", "Male", "Female", "Other"];
//   const timeSlots = [
//     "09:00 AM - 12:00 PM",
//     "12:00 PM - 03:00 PM",
//     "03:00 PM - 06:00 PM",
//   ];
//   const industrySectors = [
//     "Select Here",
//     "AYUSH & Herbal Products",
//     "Health & Wellness",
//     "Organic Farming & Agriculture",
//     "Fitness & Nutrition",
//     "Bio-Medicine & Research",
//     "HealthTech & Startups",
//     "Pharmaceuticals",
//     "Healthcare Services",
//     "Medical Equipment",
//   ];

//   useEffect(() => {
//     dispatch(fetchCountries());
//     dispatch(fetchStates());
//     dispatch(fetchCities());
//   }, [dispatch]);

//   return (
//     <div style={{ marginTop: "30px" }}>
//       <div className="w-full bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
//         <h1 className="text-xl font-normal text-gray-700">VISITOR</h1>
//         <div className="flex gap-2">
//           <button className="bg-[#3598dc] hover:bg-[#2980b9] text-white px-3 py-1 text-sm">
//             Master List
//           </button>
//           <button
//             onClick={onNavigateToList}
//             className="bg-[#3598dc] hover:bg-[#2980b9] text-white px-3 py-1 text-sm"
//           >
//             Visitor List
//           </button>
//         </div>
//       </div>

//       <div className="max-w-[1200px] mx-auto p-4">
//         <div className="bg-white rounded shadow p-4 visitor-form">
//           <h2 className="text-4xl text-gray-700 font-normal mb-4">
//             Add New Visitor
//             <hr className="w-full opacity-10" />
//           </h2>

//           <hr className="w-full pb-6 opacity-10" />
//           <div className="mb-4 flex gap-6">
//             {[
//               { value: "corporate", label: "Corporate Visitor" },
//               { value: "general", label: "General Visitor" },
//               { value: "freeHealth", label: "Free Health Camp" },
//             ].map(({ value, label }) => (
//               <label
//                 key={value}
//                 className="flex items-center gap-2 cursor-pointer"
//               >
//                 <input
//                   type="radio"
//                   name="visitorType"
//                   value={value}
//                   checked={visitorType === value}
//                   onChange={(e) => setVisitorType(e.target.value)}
//                   className="h-4 w-4 text-[#3598dc] focus:ring-[#3598dc]"
//                 />
//                 <span className="text-sm font-medium text-gray-900">
//                   {label}
//                 </span>
//               </label>
//             ))}
//           </div>

//           {visitorType === "corporate" && (
//             <CorporateVisitorForm
//               registrationOptions={registrationOptions}
//               industrySectors={industrySectors}
//               countries={countryNames}
//               states={stateNames}
//               cities={cityNames}
//             />
//           )}
//           {visitorType === "general" && (
//             <GeneralVisitorForm
//               registrationOptions={registrationOptions}
//               industrySectors={industrySectors}
//               countries={countryNames}
//               states={stateNames}
//               cities={cityNames}
//               genders={genders}
//             />
//           )}
//           {visitorType === "freeHealth" && (
//             <FreeHealthCampForm
//               countries={countryNames}
//               states={stateNames}
//               cities={cityNames}
//               genders={genders}
//               timeSlots={timeSlots}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VisitorRegistration;
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CorporateVisitorForm from "./CorporateVisitorForm";
import GeneralVisitorForm from "./GeneralVisitorForm";
import FreeHealthCampForm from "./FreeHealthCampForm";
import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../../features/state/stateSlice";
import { fetchCities } from "../../../features/city/citySlice";

const VisitorRegistration = ({ onNavigateToList }) => {
  const dispatch = useDispatch();
  const [visitorType, setVisitorType] = useState("corporate");

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
    <div style={{ marginTop: "30px" }}>
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-700">VISITOR</h1>
        <div className="flex gap-3">
          <button className="bg-[#3598dc] hover:bg-[#2980b9] text-white px-4 py-2 text-base rounded-md border border-[#3598dc]">
            Master List
          </button>
          <button
            onClick={onNavigateToList}
            className="bg-[#3598dc] hover:bg-[#2980b9] text-white px-4 py-2 text-base rounded-md border border-[#3598dc]"
          >
            Visitor List
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-3xl text-gray-700 font-normal mb-4">
            Add New Visitor
            <hr className="w-full opacity-10 mt-2" />
          </h2>

          <div className="mb-6 flex gap-6">
            {[
              { value: "corporate", label: "Corporate Visitor" },
              { value: "general", label: "General Visitor" },
              { value: "freeHealth", label: "Free Health Camp" },
            ].map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="visitorType"
                  value={value}
                  checked={visitorType === value}
                  onChange={(e) => setVisitorType(e.target.value)}
                  className="h-5 w-5 text-[#3598dc] focus:ring-[#3598dc]"
                />
                <span className="text-base font-medium text-gray-900">
                  {label}
                </span>
              </label>
            ))}
          </div>

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
  );
};

export default VisitorRegistration;
