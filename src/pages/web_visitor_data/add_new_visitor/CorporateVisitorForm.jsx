import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCorporateVisitor } from "../../../features/visitor/corporateVisitorSlice";
import { showError, showSuccess } from "../../../utils/toastMessage";

const CorporateVisitorForm = ({
  registrationOptions = [], // default empty array
  industrySectors = [], // default empty array
  countries = [], // default empty array
  states = [], // default empty array
  cities = [], // default empty array
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.corporateVisitors);

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
    <form className="visitor-form" onSubmit={handleSubmit}>
      <h3 className="text-sm text-gray-900 font-semibold mb-3">
        Corporate Visitor Registration
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            <label className="text-xs font-medium text-gray-900 mb-1 block">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === "select" ? (
              <select
                value={corporateData[key]}
                onChange={(e) =>
                  setCorporateData({ ...corporateData, [key]: e.target.value })
                }
                className="block w-full"
              >
                {/* ✅ Safe map with optional chaining */}
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
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>

      <h3 className="font-semibold text-gray-900 py-1.5">
        Company & Industry Information
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            options: countries,
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
            options: states,
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
            options: cities,
            required: true,
            disabled:
              !corporateData.state ||
              corporateData.state === "Select Country first",
          },
        ].map(({ label, key, options, required, disabled, onChange }) => (
          <div key={key}>
            <label className="block font-medium text-gray-900 mb-1">
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
              className="block w-full"
            >
              {/* ✅ Safe map with optional chaining */}
              {options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="my-1.5">
        <label className="block font-semibold text-gray-900 mb-2">
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
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-900 mb-2">
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
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="py-1.5">
        <label className="block font-medium text-gray-900 mb-2">
          Would you like to schedule B2B meetings?{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
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
              />
              <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium text-gray-900 mb-2">
          Would you like updates via WhatsApp?{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
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
              />
              <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="py-1.5">
        <label className="block font-medium text-gray-900 mb-1">
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
          rows="2"
          className="block w-full"
        />
      </div>

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
          />
          <span>Subscribe to Event Updates & Newsletters</span>
        </label>
      </div>

      <div className="flex justify-start">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#3598dc] hover:bg-[#2980b9] text-white uppercase disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    </form>
  );
};

export default CorporateVisitorForm;
