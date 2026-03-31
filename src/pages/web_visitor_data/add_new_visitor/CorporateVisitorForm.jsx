// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { createCorporateVisitor } from "../../../features/visitor/corporateVisitorSlice";
// import { showError, showSuccess } from "../../../utils/toastMessage";

// const CorporateVisitorForm = ({
//   registrationOptions = [], // default empty array
//   industrySectors = [], // default empty array
//   countries = [], // default empty array
//   states = [], // default empty array
//   cities = [], // default empty array
// }) => {
//   const dispatch = useDispatch();
//   const { loading } = useSelector((state) => state.corporateVisitors);

//   const [corporateData, setCorporateData] = useState({
//     registrationFor: "",
//     firstName: "",
//     lastName: "",
//     email: "",
//     mobile: "",
//     designation: "",
//     companyName: "",
//     companyWebsite: "",
//     industrySector: "",
//     companySize: "",
//     country: "",
//     state: "",
//     city: "",
//     b2bMeeting: "",
//     whatsappUpdates: "",
//     specificRequirement: "",
//     subscribe: false,
//     purposeOfVisit: {
//       exploringBusiness: false,
//       meetingExhibitors: false,
//       attendingSeminar: false,
//       networking: false,
//       learningTrends: false,
//     },
//     areaOfInterest: {
//       ayushHerbal: false,
//       healthWellness: false,
//       organicFarming: false,
//       fitnessNutrition: false,
//       bioMedicine: false,
//       healthTech: false,
//     },
//   });

//   const resetForm = () => {
//     setCorporateData({
//       registrationFor: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       mobile: "",
//       designation: "",
//       companyName: "",
//       companyWebsite: "",
//       industrySector: "",
//       companySize: "",
//       country: "",
//       state: "",
//       city: "",
//       b2bMeeting: "",
//       whatsappUpdates: "",
//       specificRequirement: "",
//       subscribe: false,
//       purposeOfVisit: {
//         exploringBusiness: false,
//         meetingExhibitors: false,
//         attendingSeminar: false,
//         networking: false,
//         learningTrends: false,
//       },
//       areaOfInterest: {
//         ayushHerbal: false,
//         healthWellness: false,
//         organicFarming: false,
//         fitnessNutrition: false,
//         bioMedicine: false,
//         healthTech: false,
//       },
//     });
//   };

//   const handleCorporatePurposeChange = (key) => {
//     setCorporateData((prev) => ({
//       ...prev,
//       purposeOfVisit: {
//         ...prev.purposeOfVisit,
//         [key]: !prev.purposeOfVisit[key],
//       },
//     }));
//   };

//   const handleCorporateInterestChange = (key) => {
//     setCorporateData((prev) => ({
//       ...prev,
//       areaOfInterest: {
//         ...prev.areaOfInterest,
//         [key]: !prev.areaOfInterest[key],
//       },
//     }));
//   };

//   const validate = () => {
//     if (
//       !corporateData.registrationFor ||
//       corporateData.registrationFor === "Select Here"
//     ) {
//       showError("Please select Registration For");
//       return false;
//     }
//     if (!corporateData.firstName.trim()) {
//       showError("First Name is required");
//       return false;
//     }
//     if (!corporateData.lastName.trim()) {
//       showError("Last Name is required");
//       return false;
//     }
//     if (!corporateData.email.trim()) {
//       showError("Email is required");
//       return false;
//     }
//     if (!corporateData.mobile.trim()) {
//       showError("Mobile is required");
//       return false;
//     }
//     if (!corporateData.designation.trim()) {
//       showError("Designation is required");
//       return false;
//     }
//     if (!corporateData.companyName.trim()) {
//       showError("Company Name is required");
//       return false;
//     }
//     if (
//       !corporateData.industrySector ||
//       corporateData.industrySector === "Select Here"
//     ) {
//       showError("Please select Industry/Sector");
//       return false;
//     }
//     if (!corporateData.country || corporateData.country === "Select Country") {
//       showError("Please select Country");
//       return false;
//     }
//     return true;
//   };

//   // ✅ API call
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     try {
//       await dispatch(createCorporateVisitor(corporateData)).unwrap();
//       showSuccess("Corporate Visitor registered successfully!");
//       resetForm();
//     } catch (err) {
//       showError(
//         typeof err === "string" ? err : err?.message || "Registration failed",
//       );
//     }
//   };

//   return (
//     <form
//       className="visitor-form"
//       onSubmit={handleSubmit}
//       style={{ marginTop: "30px" }}
//     >
//       <h3 className="text-sm text-gray-900 font-semibold mb-3">
//         Corporate Visitor Registration
//       </h3>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//         {[
//           {
//             label: "Registration For",
//             key: "registrationFor",
//             type: "select",
//             options: registrationOptions,
//             required: true,
//           },
//           {
//             label: "First Name",
//             key: "firstName",
//             type: "text",
//             placeholder: "Enter First Name",
//             required: true,
//           },
//           {
//             label: "Last Name",
//             key: "lastName",
//             type: "text",
//             placeholder: "Enter Last Name",
//             required: true,
//           },
//           {
//             label: "Email",
//             key: "email",
//             type: "email",
//             placeholder: "Enter Email",
//             required: true,
//           },
//           {
//             label: "Mobile No.",
//             key: "mobile",
//             type: "tel",
//             placeholder: "Enter Mobile",
//             required: true,
//           },
//           {
//             label: "Designation",
//             key: "designation",
//             type: "text",
//             placeholder: "Enter Designation",
//             required: true,
//           },
//           {
//             label: "Company Name",
//             key: "companyName",
//             type: "text",
//             placeholder: "Enter Company Name",
//             required: true,
//           },
//           {
//             label: "Company Website",
//             key: "companyWebsite",
//             type: "text",
//             placeholder: "Enter Website",
//           },
//         ].map(({ label, key, type, placeholder, options, required }) => (
//           <div key={key}>
//             <label className="text-xs font-medium text-gray-900 mb-1 block">
//               {label} {required && <span className="text-red-500">*</span>}
//             </label>
//             {type === "select" ? (
//               <select
//                 value={corporateData[key]}
//                 onChange={(e) =>
//                   setCorporateData({ ...corporateData, [key]: e.target.value })
//                 }
//                 className="block w-full"
//               >
//                 {/* ✅ Safe map with optional chaining */}
//                 {options?.map((option, index) => (
//                   <option key={index} value={option}>
//                     {option}
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <input
//                 type={type}
//                 value={corporateData[key]}
//                 onChange={(e) =>
//                   setCorporateData({ ...corporateData, [key]: e.target.value })
//                 }
//                 placeholder={placeholder}
//                 className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
//               />
//             )}
//           </div>
//         ))}
//       </div>

//       <h3 className="font-semibold text-gray-900 py-1.5">
//         Company & Industry Information
//       </h3>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//         {[
//           {
//             label: "Industry/Sector",
//             key: "industrySector",
//             options: industrySectors,
//             required: true,
//           },
//           {
//             label: "Company Size",
//             key: "companySize",
//             options: ["Select Here", "1-10 Employees", "11-50 Employees"],
//             required: true,
//           },
//           {
//             label: "Country",
//             key: "country",
//             options: countries,
//             required: true,
//             onChange: (e) =>
//               setCorporateData({
//                 ...corporateData,
//                 country: e.target.value,
//                 state: "",
//                 city: "",
//               }),
//           },
//           {
//             label: "State",
//             key: "state",
//             options: states,
//             required: true,
//             disabled:
//               !corporateData.country ||
//               corporateData.country === "Select Country",
//             onChange: (e) =>
//               setCorporateData({
//                 ...corporateData,
//                 state: e.target.value,
//                 city: "",
//               }),
//           },
//           {
//             label: "City",
//             key: "city",
//             options: cities,
//             required: true,
//             disabled:
//               !corporateData.state ||
//               corporateData.state === "Select Country first",
//           },
//         ].map(({ label, key, options, required, disabled, onChange }) => (
//           <div key={key}>
//             <label className="block font-medium text-gray-900 mb-1">
//               {label} {required && <span className="text-red-500">*</span>}
//             </label>
//             <select
//               value={corporateData[key]}
//               onChange={
//                 onChange ||
//                 ((e) =>
//                   setCorporateData({ ...corporateData, [key]: e.target.value }))
//               }
//               disabled={disabled}
//               className="block w-full"
//             >
//               {/* ✅ Safe map with optional chaining */}
//               {options?.map((option, index) => (
//                 <option key={index} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </select>
//           </div>
//         ))}
//       </div>

//       <div className="my-1.5">
//         <label className="block font-semibold text-gray-900 mb-2">
//           Purpose of Visit <span className="text-red-500">*</span>
//         </label>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {[
//             {
//               key: "exploringBusiness",
//               label: "Exploring Business Opportunities",
//             },
//             {
//               key: "meetingExhibitors",
//               label: "Meeting Exhibitors & Suppliers",
//             },
//             {
//               key: "attendingSeminar",
//               label: "Attending Arogya Sangosthi Seminar",
//             },
//             { key: "networking", label: "Networking & Collaborations" },
//             { key: "learningTrends", label: "Learning About Latest Trends" },
//           ].map(({ key, label }) => (
//             <label key={key} className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={corporateData.purposeOfVisit[key]}
//                 onChange={() => handleCorporatePurposeChange(key)}
//               />
//               <span>{label}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div>
//         <label className="block font-semibold text-gray-900 mb-2">
//           Area of Interest <span className="text-red-500">*</span>
//         </label>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {[
//             { key: "ayushHerbal", label: "AYUSH & Herbal Products" },
//             { key: "healthWellness", label: "Health & Wellness" },
//             { key: "organicFarming", label: "Organic Farming & Agriculture" },
//             { key: "fitnessNutrition", label: "Fitness & Nutrition" },
//             { key: "bioMedicine", label: "Bio-Medicine & Research" },
//             { key: "healthTech", label: "HealthTech & Startups" },
//           ].map(({ key, label }) => (
//             <label key={key} className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={corporateData.areaOfInterest[key]}
//                 onChange={() => handleCorporateInterestChange(key)}
//               />
//               <span>{label}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div className="py-1.5">
//         <label className="block font-medium text-gray-900 mb-2">
//           Would you like to schedule B2B meetings?{" "}
//           <span className="text-red-500">*</span>
//         </label>
//         <div className="flex gap-4">
//           {["yes", "no"].map((value) => (
//             <label
//               key={value}
//               className="flex items-center gap-2 cursor-pointer"
//             >
//               <input
//                 type="radio"
//                 name="b2bMeeting"
//                 value={value}
//                 checked={corporateData.b2bMeeting === value}
//                 onChange={(e) =>
//                   setCorporateData({
//                     ...corporateData,
//                     b2bMeeting: e.target.value,
//                   })
//                 }
//               />
//               <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div>
//         <label className="block font-medium text-gray-900 mb-2">
//           Would you like updates via WhatsApp?{" "}
//           <span className="text-red-500">*</span>
//         </label>
//         <div className="flex gap-4">
//           {["yes", "no"].map((value) => (
//             <label
//               key={value}
//               className="flex items-center gap-2 cursor-pointer"
//             >
//               <input
//                 type="radio"
//                 name="whatsappUpdates"
//                 value={value}
//                 checked={corporateData.whatsappUpdates === value}
//                 onChange={(e) =>
//                   setCorporateData({
//                     ...corporateData,
//                     whatsappUpdates: e.target.value,
//                   })
//                 }
//               />
//               <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div className="py-1.5">
//         <label className="block font-medium text-gray-900 mb-1">
//           Any Specific Requirement
//         </label>
//         <textarea
//           value={corporateData.specificRequirement}
//           onChange={(e) =>
//             setCorporateData({
//               ...corporateData,
//               specificRequirement: e.target.value,
//             })
//           }
//           placeholder="Write Here"
//           rows="2"
//           className="block w-full"
//         />
//       </div>

//       <div className="py-2">
//         <label className="flex items-center gap-2 cursor-pointer">
//           <input
//             type="checkbox"
//             checked={corporateData.subscribe}
//             onChange={(e) =>
//               setCorporateData({
//                 ...corporateData,
//                 subscribe: e.target.checked,
//               })
//             }
//           />
//           <span>Subscribe to Event Updates & Newsletters</span>
//         </label>
//       </div>

//       <div className="flex justify-start">
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-[#3598dc] hover:bg-[#2980b9] text-white uppercase disabled:opacity-60 disabled:cursor-not-allowed"
//         >
//           {loading ? "Submitting..." : "Submit Registration"}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default CorporateVisitorForm;
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCorporateVisitor } from "../../../features/visitor/corporateVisitorSlice";
import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../../features/state/stateSlice";
import { fetchCities } from "../../../features/city/citySlice";
import { fetchEvents } from "../../../features/crmEvent/crmEventSlice";
import { fetchNatures } from "../../../features/add_by_admin/nature/natureSlice";
import { showError, showSuccess } from "../../../utils/toastMessage";

const CorporateVisitorForm = ({
  registrationOptions: propRegistrationOptions = [],
  industrySectors: propIndustrySectors = [],
  countries: propCountries = [],
  states: propStates = [],
  cities: propCities = [],
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.corporateVisitors);

  // Redux data
  const { countries: reduxCountries } = useSelector((state) => state.countries);
  const { states: reduxStates } = useSelector((state) => state.states);
  const { cities: reduxCities } = useSelector((state) => state.cities);
  const { events: reduxEvents } = useSelector((state) => state.crmEvents);
  const { natures: reduxNatures } = useSelector((state) => state.natures);

  // Fetch data if missing
  useEffect(() => {
    if (!reduxCountries || reduxCountries.length === 0) dispatch(fetchCountries());
    if (!reduxStates || reduxStates.length === 0) dispatch(fetchStates());
    if (!reduxCities || reduxCities.length === 0) dispatch(fetchCities());
    if (!reduxEvents || reduxEvents.length === 0) dispatch(fetchEvents());
    if (!reduxNatures || reduxNatures.length === 0) dispatch(fetchNatures());
  }, [dispatch, reduxCountries?.length, reduxStates?.length, reduxCities?.length, reduxEvents?.length, reduxNatures?.length]);

  // Derived options
  const registrationOptions = propRegistrationOptions.length > 0 
    ? propRegistrationOptions 
    : ["Select Here", ...(reduxEvents || []).map(e => e.event_name).filter(Boolean)];

  const industrySectors = propIndustrySectors.length > 0
    ? propIndustrySectors
    : ["Select Here", ...(reduxNatures || []).map(n => n.nature_name).filter(Boolean)];

  const countriesArr = propCountries.length > 0
    ? propCountries
    : ["Select Country", ...(reduxCountries || []).map(c => c.name).filter(Boolean)];

  const statesArr = propStates.length > 0
    ? propStates
    : ["Select Country first", ...(reduxStates || []).map(s => s.name).filter(Boolean)];

  const citiesArr = propCities.length > 0
    ? propCities
    : ["Select State first", ...(reduxCities?.data || reduxCities || []).map(c => c.name).filter(Boolean)];

  const [corporateData, setCorporateData] = useState({
    registrationFor: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    designation: "",
    companyName: "",
    companyWebsite: "",
    industrySector: "",
    companySize: "",
    country: "",
    state: "",
    city: "",
    b2bMeeting: "",
    whatsappUpdates: "",
    specificRequirement: "",
    subscribe: false,
    purposeOfVisit: {
      exploringBusiness: false,
      meetingExhibitors: false,
      attendingSeminar: false,
      networking: false,
      learningTrends: false,
    },
    areaOfInterest: {
      ayushHerbal: false,
      healthWellness: false,
      organicFarming: false,
      fitnessNutrition: false,
      bioMedicine: false,
      healthTech: false,
    },
  });

  const resetForm = () => {
    setCorporateData({
      registrationFor: "",
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      designation: "",
      companyName: "",
      companyWebsite: "",
      industrySector: "",
      companySize: "",
      country: "",
      state: "",
      city: "",
      b2bMeeting: "",
      whatsappUpdates: "",
      specificRequirement: "",
      subscribe: false,
      purposeOfVisit: {
        exploringBusiness: false,
        meetingExhibitors: false,
        attendingSeminar: false,
        networking: false,
        learningTrends: false,
      },
      areaOfInterest: {
        ayushHerbal: false,
        healthWellness: false,
        organicFarming: false,
        fitnessNutrition: false,
        bioMedicine: false,
        healthTech: false,
      },
    });
  };

  const handleCorporatePurposeChange = (key) => {
    setCorporateData((prev) => ({
      ...prev,
      purposeOfVisit: {
        ...prev.purposeOfVisit,
        [key]: !prev.purposeOfVisit[key],
      },
    }));
  };

  const handleCorporateInterestChange = (key) => {
    setCorporateData((prev) => ({
      ...prev,
      areaOfInterest: {
        ...prev.areaOfInterest,
        [key]: !prev.areaOfInterest[key],
      },
    }));
  };

  // ✅ Validation
  const validate = () => {
    if (
      !corporateData.registrationFor ||
      corporateData.registrationFor === "Select Here"
    ) {
      showError("Please select Registration For");
      return false;
    }
    if (!corporateData.firstName.trim()) {
      showError("First Name is required");
      return false;
    }
    if (!corporateData.lastName.trim()) {
      showError("Last Name is required");
      return false;
    }
    if (!corporateData.email.trim()) {
      showError("Email is required");
      return false;
    }
    if (!corporateData.mobile.trim()) {
      showError("Mobile is required");
      return false;
    }
    if (!corporateData.designation.trim()) {
      showError("Designation is required");
      return false;
    }
    if (!corporateData.companyName.trim()) {
      showError("Company Name is required");
      return false;
    }
    if (
      !corporateData.industrySector ||
      corporateData.industrySector === "Select Here"
    ) {
      showError("Please select Industry/Sector");
      return false;
    }
    if (!corporateData.country || corporateData.country === "Select Country") {
      showError("Please select Country");
      return false;
    }
    return true;
  };

  // ✅ API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(createCorporateVisitor(corporateData)).unwrap();
      showSuccess("Corporate Visitor registered successfully!");
      resetForm();
    } catch (err) {
      showError(
        typeof err === "string" ? err : err?.message || "Registration failed",
      );
    }
  };

  return (
    <form
      className="visitor-form space-y-6 bg-white px-4 py-6 rounded-md shadow-md"
      onSubmit={handleSubmit}
      style={{ marginTop: "30px" }}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Corporate Visitor Registration
      </h3>

      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Registration For",
            key: "registrationFor",
            type: "select",
            options: registrationOptions,
            required: true,
          },
          {
            label: "First Name",
            key: "firstName",
            type: "text",
            placeholder: "Enter First Name",
            required: true,
          },
          {
            label: "Last Name",
            key: "lastName",
            type: "text",
            placeholder: "Enter Last Name",
            required: true,
          },
          {
            label: "Email",
            key: "email",
            type: "email",
            placeholder: "Enter Email",
            required: true,
          },
          {
            label: "Mobile No.",
            key: "mobile",
            type: "tel",
            placeholder: "Enter Mobile",
            required: true,
          },
          {
            label: "Designation",
            key: "designation",
            type: "text",
            placeholder: "Enter Designation",
            required: true,
          },
          {
            label: "Company Name",
            key: "companyName",
            type: "text",
            placeholder: "Enter Company Name",
            required: true,
          },
          {
            label: "Company Website",
            key: "companyWebsite",
            type: "text",
            placeholder: "Enter Website",
          },
        ].map(({ label, key, type, placeholder, options, required }) => (
          <div key={key}>
            <label className="block text-base font-medium text-gray-900 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === "select" ? (
              <select
                value={corporateData[key]}
                onChange={(e) =>
                  setCorporateData({ ...corporateData, [key]: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                {options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={corporateData[key]}
                onChange={(e) =>
                  setCorporateData({ ...corporateData, [key]: e.target.value })
                }
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            )}
          </div>
        ))}
      </div>

      {/* Company & Industry Information */}
      <h3 className="text-lg font-semibold text-gray-900 py-2">
        Company & Industry Information
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            label: "Industry/Sector",
            key: "industrySector",
            options: industrySectors,
            required: true,
          },
          {
            label: "Company Size",
            key: "companySize",
            options: ["Select Here", "1-10 Employees", "11-50 Employees"],
            required: true,
          },
          {
            label: "Country",
            key: "country",
            options: countriesArr,
            required: true,
            onChange: (e) =>
              setCorporateData({
                ...corporateData,
                country: e.target.value,
                state: "",
                city: "",
              }),
          },
          {
            label: "State",
            key: "state",
            options: statesArr,
            required: true,
            disabled:
              !corporateData.country ||
              corporateData.country === "Select Country",
            onChange: (e) =>
              setCorporateData({
                ...corporateData,
                state: e.target.value,
                city: "",
              }),
          },
          {
            label: "City",
            key: "city",
            options: citiesArr,
            required: true,
            disabled:
              !corporateData.state ||
              corporateData.state === "Select Country first",
          },
        ].map(({ label, key, options, required, disabled, onChange }) => (
          <div key={key}>
            <label className="block text-base font-medium text-gray-900 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={corporateData[key]}
              onChange={
                onChange ||
                ((e) =>
                  setCorporateData({ ...corporateData, [key]: e.target.value }))
              }
              disabled={disabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base disabled:bg-gray-100"
            >
              {options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Purpose of Visit */}
      <div className="my-4">
        <label className="block text-base font-semibold text-gray-900 mb-3">
          Purpose of Visit <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              key: "exploringBusiness",
              label: "Exploring Business Opportunities",
            },
            {
              key: "meetingExhibitors",
              label: "Meeting Exhibitors & Suppliers",
            },
            {
              key: "attendingSeminar",
              label: "Attending Arogya Sangosthi Seminar",
            },
            { key: "networking", label: "Networking & Collaborations" },
            { key: "learningTrends", label: "Learning About Latest Trends" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={corporateData.purposeOfVisit[key]}
                onChange={() => handleCorporatePurposeChange(key)}
                className="w-5 h-5 text-[#3598dc] focus:ring-[#3598dc] border-gray-300 rounded"
              />
              <span className="text-base text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Area of Interest */}
      <div>
        <label className="block text-base font-semibold text-gray-900 mb-3">
          Area of Interest <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: "ayushHerbal", label: "AYUSH & Herbal Products" },
            { key: "healthWellness", label: "Health & Wellness" },
            { key: "organicFarming", label: "Organic Farming & Agriculture" },
            { key: "fitnessNutrition", label: "Fitness & Nutrition" },
            { key: "bioMedicine", label: "Bio-Medicine & Research" },
            { key: "healthTech", label: "HealthTech & Startups" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={corporateData.areaOfInterest[key]}
                onChange={() => handleCorporateInterestChange(key)}
                className="w-5 h-5 text-[#3598dc] focus:ring-[#3598dc] border-gray-300 rounded"
              />
              <span className="text-base text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* B2B Meeting */}
      <div className="py-2">
        <label className="block text-base font-medium text-gray-900 mb-2">
          Would you like to schedule B2B meetings?{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          {["yes", "no"].map((value) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="b2bMeeting"
                value={value}
                checked={corporateData.b2bMeeting === value}
                onChange={(e) =>
                  setCorporateData({
                    ...corporateData,
                    b2bMeeting: e.target.value,
                  })
                }
                className="w-5 h-5 text-[#3598dc] focus:ring-[#3598dc] border-gray-300"
              />
              <span className="text-base text-gray-700">
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* WhatsApp Updates */}
      <div>
        <label className="block text-base font-medium text-gray-900 mb-2">
          Would you like updates via WhatsApp?{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          {["yes", "no"].map((value) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="whatsappUpdates"
                value={value}
                checked={corporateData.whatsappUpdates === value}
                onChange={(e) =>
                  setCorporateData({
                    ...corporateData,
                    whatsappUpdates: e.target.value,
                  })
                }
                className="w-5 h-5 text-[#3598dc] focus:ring-[#3598dc] border-gray-300"
              />
              <span className="text-base text-gray-700">
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Specific Requirement */}
      <div className="py-2">
        <label className="block text-base font-medium text-gray-900 mb-1">
          Any Specific Requirement
        </label>
        <textarea
          value={corporateData.specificRequirement}
          onChange={(e) =>
            setCorporateData({
              ...corporateData,
              specificRequirement: e.target.value,
            })
          }
          placeholder="Write Here"
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
        />
      </div>

      {/* Subscribe */}
      <div className="py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={corporateData.subscribe}
            onChange={(e) =>
              setCorporateData({
                ...corporateData,
                subscribe: e.target.checked,
              })
            }
            className="w-5 h-5 text-[#3598dc] focus:ring-[#3598dc] border-gray-300 rounded"
          />
          <span className="text-base text-gray-700">
            Subscribe to Event Updates & Newsletters
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-start mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#3598dc] hover:bg-[#2980b9] text-white px-6 py-2 text-base rounded-md uppercase disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    </form>
  );
};

export default CorporateVisitorForm;
