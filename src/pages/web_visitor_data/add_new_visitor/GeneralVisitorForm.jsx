// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { createGeneralVisitor } from "../../../features/visitor/generalVisitorSlice";
// import { showError, showSuccess } from "../../../utils/toastMessage";

// const GeneralVisitorForm = ({
//   registrationOptions = [],
//   industrySectors = [],
//   countries = [],
//   states = [],
//   cities = [],
//   genders = [],
// }) => {
//   const dispatch = useDispatch();
//   const { loading } = useSelector((state) => state.generalVisitors);

//   const [generalData, setGeneralData] = useState({
//     registrationFor: "",
//     firstName: "",
//     lastName: "",
//     email: "",
//     mobile: "",
//     alternateNo: "",
//     dateOfBirth: "",
//     gender: "Select Here",
//     companyName: "",
//     designation: "",
//     industrySector: "Select Here",
//     country: "Select Country",
//     state: "Select Country first",
//     city: "Select State first",
//     purposeOfVisit: {
//       businessNetworking: false,
//       exploringProducts: false,
//       buyingProducts: false,
//       learningTrends: false,
//       others: false,
//     },
//     areaOfInterest: {
//       ayushHerbal: false,
//       organicProducts: false,
//       fitnessWellness: false,
//       healthSupplements: false,
//       healthcareServices: false,
//       agricultureFarming: false,
//       researchInnovations: false,
//       others: false,
//     },
//     subscribe: false,
//   });

//   const resetForm = () => {
//     setGeneralData({
//       registrationFor: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       mobile: "",
//       alternateNo: "",
//       dateOfBirth: "",
//       gender: "Select Here",
//       companyName: "",
//       designation: "",
//       industrySector: "Select Here",
//       country: "Select Country",
//       state: "Select Country first",
//       city: "Select State first",
//       purposeOfVisit: {
//         businessNetworking: false,
//         exploringProducts: false,
//         buyingProducts: false,
//         learningTrends: false,
//         others: false,
//       },
//       areaOfInterest: {
//         ayushHerbal: false,
//         organicProducts: false,
//         fitnessWellness: false,
//         healthSupplements: false,
//         healthcareServices: false,
//         agricultureFarming: false,
//         researchInnovations: false,
//         others: false,
//       },
//       subscribe: false,
//     });
//   };

//   const handleGeneralPurposeChange = (key) => {
//     setGeneralData((prev) => ({
//       ...prev,
//       purposeOfVisit: {
//         ...prev.purposeOfVisit,
//         [key]: !prev.purposeOfVisit[key],
//       },
//     }));
//   };

//   const handleGeneralInterestChange = (key) => {
//     setGeneralData((prev) => ({
//       ...prev,
//       areaOfInterest: {
//         ...prev.areaOfInterest,
//         [key]: !prev.areaOfInterest[key],
//       },
//     }));
//   };

//   const validate = () => {
//     if (
//       !generalData.registrationFor ||
//       generalData.registrationFor === "Select Here"
//     ) {
//       showError("Please select Registration For");
//       return false;
//     }
//     if (!generalData.firstName.trim()) {
//       showError("First Name is required");
//       return false;
//     }
//     if (!generalData.lastName.trim()) {
//       showError("Last Name is required");
//       return false;
//     }
//     if (!generalData.email.trim()) {
//       showError("Email is required");
//       return false;
//     }
//     if (!generalData.mobile.trim()) {
//       showError("Mobile is required");
//       return false;
//     }
//     if (!generalData.country || generalData.country === "Select Country") {
//       showError("Please select Country");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     try {
//       await dispatch(createGeneralVisitor(generalData)).unwrap();
//       showSuccess("General Visitor registered successfully!");
//       resetForm();
//     } catch (err) {
//       showError(
//         typeof err === "string" ? err : err?.message || "Registration failed",
//       );
//     }
//   };

//   return (
//     <div className="visitor-form space-y-6" style={{ marginTop: "30px" }}>
//       <h3 className="font-semibold text-gray-900">
//         General Visitor Registration
//       </h3>

//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {[
//             {
//               label: "Registration For",
//               key: "registrationFor",
//               type: "select",
//               options: registrationOptions,
//               required: true,
//             },
//             {
//               label: "First Name",
//               key: "firstName",
//               type: "text",
//               placeholder: "Enter First Name",
//               required: true,
//             },
//             {
//               label: "Last Name",
//               key: "lastName",
//               type: "text",
//               placeholder: "Enter Last Name",
//               required: true,
//             },
//             {
//               label: "Email",
//               key: "email",
//               type: "email",
//               placeholder: "Enter Email",
//               required: true,
//             },
//             {
//               label: "Mobile No.",
//               key: "mobile",
//               type: "tel",
//               placeholder: "Enter Telephone/Mobile",
//               required: true,
//             },
//             {
//               label: "Alternate No.",
//               key: "alternateNo",
//               type: "tel",
//               placeholder: "Enter Alternate No.",
//             },
//             { label: "Date of Birth", key: "dateOfBirth", type: "date" },
//             {
//               label: "Gender",
//               key: "gender",
//               type: "select",
//               options: genders,
//               required: true,
//             },
//             {
//               label: "Company Name",
//               key: "companyName",
//               type: "text",
//               placeholder: "Enter Company Name",
//             },
//             {
//               label: "Designation",
//               key: "designation",
//               type: "text",
//               placeholder: "Enter Designation",
//             },
//             {
//               label: "Industry/Sector",
//               key: "industrySector",
//               type: "select",
//               options: industrySectors,
//             },
//             {
//               label: "Country",
//               key: "country",
//               type: "select",
//               options: countries,
//               required: true,
//               onChange: (e) =>
//                 setGeneralData({
//                   ...generalData,
//                   country: e.target.value,
//                   state: "Select Country first",
//                   city: "Select State first",
//                 }),
//             },
//             {
//               label: "State",
//               key: "state",
//               type: "select",
//               options: states,
//               required: true,
//               disabled:
//                 !generalData.country ||
//                 generalData.country === "Select Country",
//               onChange: (e) =>
//                 setGeneralData({
//                   ...generalData,
//                   state: e.target.value,
//                   city: "Select State first",
//                 }),
//             },
//             {
//               label: "City",
//               key: "city",
//               type: "select",
//               options: cities,
//               required: true,
//               disabled:
//                 !generalData.state ||
//                 generalData.state === "Select Country first",
//             },
//           ].map(
//             ({
//               label,
//               key,
//               type,
//               placeholder,
//               options,
//               required,
//               disabled,
//               onChange,
//             }) => (
//               <div key={key}>
//                 <label className="block font-medium text-gray-900 mb-1">
//                   {label} {required && <span className="text-red-500">*</span>}
//                 </label>
//                 {type === "select" ? (
//                   <select
//                     value={generalData[key]}
//                     onChange={
//                       onChange ||
//                       ((e) =>
//                         setGeneralData({
//                           ...generalData,
//                           [key]: e.target.value,
//                         }))
//                     }
//                     disabled={disabled}
//                     className="block w-full"
//                   >
//                     {/* ✅ Safe map with optional chaining */}
//                     {options?.map((option, index) => (
//                       <option key={index} value={option}>
//                         {option}
//                       </option>
//                     ))}
//                   </select>
//                 ) : (
//                   <input
//                     type={type}
//                     value={generalData[key]}
//                     onChange={
//                       onChange ||
//                       ((e) =>
//                         setGeneralData({
//                           ...generalData,
//                           [key]: e.target.value,
//                         }))
//                     }
//                     placeholder={placeholder}
//                     className="block w-full"
//                   />
//                 )}
//               </div>
//             ),
//           )}
//         </div>

//         <div className="mt-4">
//           <label className="block font-semibold text-gray-900 mb-2">
//             Purpose of Visit <span className="text-red-500">*</span>
//           </label>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {[
//               { key: "businessNetworking", label: "Business Networking" },
//               { key: "exploringProducts", label: "Exploring New Products" },
//               { key: "buyingProducts", label: "Buying Products & Services" },
//               { key: "learningTrends", label: "Learning Industry Trends" },
//               { key: "others", label: "Others" },
//             ].map(({ key, label }) => (
//               <label
//                 key={key}
//                 className="flex items-center gap-2 cursor-pointer"
//               >
//                 <input
//                   type="checkbox"
//                   checked={generalData.purposeOfVisit[key]}
//                   onChange={() => handleGeneralPurposeChange(key)}
//                 />
//                 <span>{label}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         <div className="mt-4">
//           <label className="block font-semibold text-gray-900 mb-2">
//             Area of Interest <span className="text-red-500">*</span>
//           </label>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {[
//               { key: "ayushHerbal", label: "AYUSH & Herbal Products" },
//               { key: "organicProducts", label: "Organic & Natural Products" },
//               { key: "fitnessWellness", label: "Fitness & Wellness Equipment" },
//               { key: "healthSupplements", label: "Health Supplements" },
//               {
//                 key: "healthcareServices",
//                 label: "Hospitals & Healthcare Services",
//               },
//               {
//                 key: "agricultureFarming",
//                 label: "Agriculture & Organic Farming",
//               },
//               { key: "researchInnovations", label: "R&D & Innovations" },
//               { key: "others", label: "Others" },
//             ].map(({ key, label }) => (
//               <label
//                 key={key}
//                 className="flex items-center gap-2 cursor-pointer"
//               >
//                 <input
//                   type="checkbox"
//                   checked={generalData.areaOfInterest[key]}
//                   onChange={() => handleGeneralInterestChange(key)}
//                 />
//                 <span>{label}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         <div className="mt-4">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={generalData.subscribe}
//               onChange={(e) =>
//                 setGeneralData({ ...generalData, subscribe: e.target.checked })
//               }
//             />
//             <span>Subscribe to Event Updates & Newsletters</span>
//           </label>
//         </div>

//         <div className="flex justify-start mt-4">
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-[#3598dc] hover:bg-[#2980b9] text-white rounded uppercase disabled:opacity-60 disabled:cursor-not-allowed"
//           >
//             {loading ? "Submitting..." : "Submit Registration"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default GeneralVisitorForm;
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGeneralVisitor } from "../../../features/visitor/generalVisitorSlice";
import { showError, showSuccess } from "../../../utils/toastMessage";

const GeneralVisitorForm = ({
  registrationOptions = [],
  industrySectors = [],
  countries = [],
  states = [],
  cities = [],
  genders = [],
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.generalVisitors);

  const [generalData, setGeneralData] = useState({
    registrationFor: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    alternateNo: "",
    dateOfBirth: "",
    gender: "Select Here",
    companyName: "",
    designation: "",
    industrySector: "Select Here",
    country: "Select Country",
    state: "Select Country first",
    city: "Select State first",
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

  const resetForm = () => {
    setGeneralData({
      registrationFor: "",
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      alternateNo: "",
      dateOfBirth: "",
      gender: "Select Here",
      companyName: "",
      designation: "",
      industrySector: "Select Here",
      country: "Select Country",
      state: "Select Country first",
      city: "Select State first",
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

  const handleGeneralPurposeChange = (key) => {
    setGeneralData((prev) => ({
      ...prev,
      purposeOfVisit: {
        ...prev.purposeOfVisit,
        [key]: !prev.purposeOfVisit[key],
      },
    }));
  };

  const handleGeneralInterestChange = (key) => {
    setGeneralData((prev) => ({
      ...prev,
      areaOfInterest: {
        ...prev.areaOfInterest,
        [key]: !prev.areaOfInterest[key],
      },
    }));
  };

  const validate = () => {
    if (
      !generalData.registrationFor ||
      generalData.registrationFor === "Select Here"
    ) {
      showError("Please select Registration For");
      return false;
    }
    if (!generalData.firstName.trim()) {
      showError("First Name is required");
      return false;
    }
    if (!generalData.lastName.trim()) {
      showError("Last Name is required");
      return false;
    }
    if (!generalData.email.trim()) {
      showError("Email is required");
      return false;
    }
    if (!generalData.mobile.trim()) {
      showError("Mobile is required");
      return false;
    }
    if (!generalData.country || generalData.country === "Select Country") {
      showError("Please select Country");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(createGeneralVisitor(generalData)).unwrap();
      showSuccess("General Visitor registered successfully!");
      resetForm();
    } catch (err) {
      showError(
        typeof err === "string" ? err : err?.message || "Registration failed",
      );
    }
  };

  return (
    <div
      className="visitor-form space-y-6 bg-white px-4"
      style={{ marginTop: "30px" }}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        General Visitor Registration
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder: "Enter Telephone/Mobile",
              required: true,
            },
            {
              label: "Alternate No.",
              key: "alternateNo",
              type: "tel",
              placeholder: "Enter Alternate No.",
            },
            { label: "Date of Birth", key: "dateOfBirth", type: "date" },
            {
              label: "Gender",
              key: "gender",
              type: "select",
              options: genders,
              required: true,
            },
            {
              label: "Company Name",
              key: "companyName",
              type: "text",
              placeholder: "Enter Company Name",
            },
            {
              label: "Designation",
              key: "designation",
              type: "text",
              placeholder: "Enter Designation",
            },
            {
              label: "Industry/Sector",
              key: "industrySector",
              type: "select",
              options: industrySectors,
            },
            {
              label: "Country",
              key: "country",
              type: "select",
              options: countries,
              required: true,
              onChange: (e) =>
                setGeneralData({
                  ...generalData,
                  country: e.target.value,
                  state: "Select Country first",
                  city: "Select State first",
                }),
            },
            {
              label: "State",
              key: "state",
              type: "select",
              options: states,
              required: true,
              disabled:
                !generalData.country ||
                generalData.country === "Select Country",
              onChange: (e) =>
                setGeneralData({
                  ...generalData,
                  state: e.target.value,
                  city: "Select State first",
                }),
            },
            {
              label: "City",
              key: "city",
              type: "select",
              options: cities,
              required: true,
              disabled:
                !generalData.state ||
                generalData.state === "Select Country first",
            },
          ].map(
            ({
              label,
              key,
              type,
              placeholder,
              options,
              required,
              disabled,
              onChange,
            }) => (
              <div key={key}>
                <label className="block text-base font-medium text-gray-900 mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                {type === "select" ? (
                  <select
                    value={generalData[key]}
                    onChange={
                      onChange ||
                      ((e) =>
                        setGeneralData({
                          ...generalData,
                          [key]: e.target.value,
                        }))
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
                ) : (
                  <input
                    type={type}
                    value={generalData[key]}
                    onChange={
                      onChange ||
                      ((e) =>
                        setGeneralData({
                          ...generalData,
                          [key]: e.target.value,
                        }))
                    }
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                )}
              </div>
            ),
          )}
        </div>

        {/* Purpose of Visit */}
        <div className="mt-4">
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Purpose of Visit <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: "businessNetworking", label: "Business Networking" },
              { key: "exploringProducts", label: "Exploring New Products" },
              { key: "buyingProducts", label: "Buying Products & Services" },
              { key: "learningTrends", label: "Learning Industry Trends" },
              { key: "others", label: "Others" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={generalData.purposeOfVisit[key]}
                  onChange={() => handleGeneralPurposeChange(key)}
                  className="w-5 h-5 text-[#3598dc] focus:ring-[#3598dc] border-gray-300 rounded"
                />
                <span className="text-base text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Area of Interest */}
        <div className="mt-4">
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Area of Interest <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: "ayushHerbal", label: "AYUSH & Herbal Products" },
              { key: "organicProducts", label: "Organic & Natural Products" },
              { key: "fitnessWellness", label: "Fitness & Wellness Equipment" },
              { key: "healthSupplements", label: "Health Supplements" },
              {
                key: "healthcareServices",
                label: "Hospitals & Healthcare Services",
              },
              {
                key: "agricultureFarming",
                label: "Agriculture & Organic Farming",
              },
              { key: "researchInnovations", label: "R&D & Innovations" },
              { key: "others", label: "Others" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={generalData.areaOfInterest[key]}
                  onChange={() => handleGeneralInterestChange(key)}
                  className="w-5 h-5 text-[#3598dc] focus:ring-[#3598dc] border-gray-300 rounded"
                />
                <span className="text-base text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subscribe */}
        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={generalData.subscribe}
              onChange={(e) =>
                setGeneralData({ ...generalData, subscribe: e.target.checked })
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
    </div>
  );
};

export default GeneralVisitorForm;
