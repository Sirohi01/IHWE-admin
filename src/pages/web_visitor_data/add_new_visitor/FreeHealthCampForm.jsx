import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createHealthCampVisitor } from "../../../features/visitor/freeHealthCampSlice";
import { showError, showSuccess } from "../../../utils/toastMessage";

const FreeHealthCampForm = ({
  countries = [],
  states = [],
  cities = [],
  genders = [],
  timeSlots = [],
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.healthCampVisitors);

  const [healthCampData, setHealthCampData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    alternateNo: "",
    dateOfBirth: "",
    gender: "Select Here",
    residenceAddress: "",
    country: "Select Country",
    state: "Select Country first",
    city: "Select State first",
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
      gender: "Select Here",
      residenceAddress: "",
      country: "Select Country",
      state: "Select Country first",
      city: "Select State first",
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
    setHealthCampData((prev) => ({
      ...prev,
      healthCheckupServices: {
        ...prev.healthCheckupServices,
        [key]: !prev.healthCheckupServices[key],
      },
    }));
  };

  const validate = () => {
    if (!healthCampData.firstName.trim()) {
      showError("First Name is required");
      return false;
    }
    if (!healthCampData.lastName.trim()) {
      showError("Last Name is required");
      return false;
    }
    if (!healthCampData.email.trim()) {
      showError("Email is required");
      return false;
    }
    if (!healthCampData.mobile.trim()) {
      showError("Mobile is required");
      return false;
    }
    if (!healthCampData.consentMedicalData) {
      showError("Please answer the consent question");
      return false;
    }
    if (!healthCampData.agreeToUpdates) {
      showError("Please answer the agreement question");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(createHealthCampVisitor(healthCampData)).unwrap();
      showSuccess("Health Camp registration successful!");
      resetForm();
    } catch (err) {
      showError(
        typeof err === "string" ? err : err?.message || "Registration failed",
      );
    }
  };

  return (
    <form className="visitor-form space-y-6" onSubmit={handleSubmit}>
      <h3 className="font-semibold text-gray-900">
        Free Health Camp Registration
      </h3>

      <h4 className="font-medium text-gray-900">Basic Personal Details</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
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
          {
            label: "Date of Birth",
            key: "dateOfBirth",
            type: "date",
            required: true,
          },
          {
            label: "Gender",
            key: "gender",
            type: "select",
            options: genders,
            required: true,
          },
          {
            label: "Residence Address",
            key: "residenceAddress",
            type: "text",
            placeholder: "Write Here",
          },
          {
            label: "Country",
            key: "country",
            type: "select",
            options: countries,
            required: true,
            onChange: (e) =>
              setHealthCampData({
                ...healthCampData,
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
              !healthCampData.country ||
              healthCampData.country === "Select Country",
            onChange: (e) =>
              setHealthCampData({
                ...healthCampData,
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
              !healthCampData.state ||
              healthCampData.state === "Select Country first",
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
              <label className="block font-medium text-gray-900 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              {type === "select" ? (
                <select
                  value={healthCampData[key]}
                  onChange={
                    onChange ||
                    ((e) =>
                      setHealthCampData({
                        ...healthCampData,
                        [key]: e.target.value,
                      }))
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
              ) : (
                <input
                  type={type}
                  value={healthCampData[key]}
                  onChange={
                    onChange ||
                    ((e) =>
                      setHealthCampData({
                        ...healthCampData,
                        [key]: e.target.value,
                      }))
                  }
                  placeholder={placeholder}
                  className="block w-full"
                />
              )}
            </div>
          ),
        )}
      </div>

      <h4 className="font-medium text-gray-900">Health-Related Information</h4>
      <div className="space-y-3">
        {[
          {
            label:
              "Do you have any existing medical conditions? (If yes, specify)",
            key: "existingMedicalConditions",
            textareaKey: "existingMedicalConditions",
          },
          {
            label:
              "Are you currently taking any medications? (If yes, mention the medication names)",
            key: "isTakingMedications",
            textareaKey: "medicationNames",
          },
          {
            label: "Do you have any allergies? (If yes, specify)",
            key: "hasAllergies",
            textareaKey: "allergyDetails",
          },
          {
            label:
              "Are you experiencing any symptoms currently? (If yes, specify)",
            key: "isExperiencingSymptoms",
            textareaKey: "symptomDetails",
          },
        ].map(({ label, key, textareaKey }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="font-medium text-gray-900">{label}</label>
            <div className="flex items-center gap-4">
              {["yes", "no"].map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={key}
                    value={value}
                    checked={healthCampData[key] === value}
                    onChange={(e) =>
                      setHealthCampData({
                        ...healthCampData,
                        [key]: e.target.value,
                      })
                    }
                  />
                  <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                </label>
              ))}
            </div>
            {healthCampData[key] === "yes" && (
              <textarea
                value={healthCampData[textareaKey]}
                onChange={(e) =>
                  setHealthCampData({
                    ...healthCampData,
                    [textareaKey]: e.target.value,
                  })
                }
                placeholder={`Specify ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                rows="2"
                className="block w-full"
              />
            )}
          </div>
        ))}
      </div>

      <h4 className="font-medium text-gray-900">Health Check-Up Preferences</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: "generalHealth", label: "General Health Check-up" },
          { key: "bloodSugar", label: "Blood Sugar Test" },
          { key: "bloodPressure", label: "Blood Pressure Check" },
          { key: "eyeCheckup", label: "Eye Check-up" },
          { key: "dentalCheckup", label: "Dental Check-up" },
          { key: "ayurvedaConsultation", label: "Ayurveda Consultation" },
          {
            key: "nutritionConsultation",
            label: "Nutrition & Diet Consultation",
          },
          { key: "other", label: "Other" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={healthCampData.healthCheckupServices[key]}
              onChange={() => handleHealthServiceChange(key)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <h4 className="font-medium text-gray-900">Appointment & Availability</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-gray-900 mb-1">
            Preferred Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={healthCampData.preferredDate}
            onChange={(e) =>
              setHealthCampData({
                ...healthCampData,
                preferredDate: e.target.value,
              })
            }
            className="block w-full border border-gray-300 rounded px-2"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-900 mb-1">
            Preferred Time Slot <span className="text-red-500">*</span>
          </label>
          <select
            value={healthCampData.preferredTimeSlot}
            onChange={(e) =>
              setHealthCampData({
                ...healthCampData,
                preferredTimeSlot: e.target.value,
              })
            }
            className="block w-full"
          >
            {/* ✅ Safe map with optional chaining */}
            {timeSlots?.map((slot, index) => (
              <option key={index} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h4 className="font-medium text-gray-900">Consent & Agreement</h4>
      <div className="space-y-3">
        {[
          {
            label:
              "Do you consent to share your medical data with healthcare professionals for analysis?",
            key: "consentMedicalData",
          },
          {
            label:
              "Do you agree to receive health-related updates and event reminders?",
            key: "agreeToUpdates",
          },
        ].map(({ label, key }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="font-medium text-gray-900">
              {label} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {["yes", "no"].map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={key}
                    value={value}
                    checked={healthCampData[key] === value}
                    onChange={(e) =>
                      setHealthCampData({
                        ...healthCampData,
                        [key]: e.target.value,
                      })
                    }
                  />
                  <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block font-medium text-gray-900 mb-1">
          Any specific health concerns or questions for the doctors?
        </label>
        <textarea
          value={healthCampData.specificHealthConcerns}
          onChange={(e) =>
            setHealthCampData({
              ...healthCampData,
              specificHealthConcerns: e.target.value,
            })
          }
          placeholder="Write Here"
          rows="2"
          className="block w-full"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={healthCampData.subscribe}
            onChange={(e) =>
              setHealthCampData({
                ...healthCampData,
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
          className="bg-[#3598dc] hover:bg-[#2980b9] text-white rounded uppercase disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    </form>
  );
};

export default FreeHealthCampForm;
