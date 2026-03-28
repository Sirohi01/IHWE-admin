import React, { useState, useEffect } from "react";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { useLocation } from "react-router-dom";
import { showSuccess } from "../../utils/toastMessage";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../../features/auth/userSlice";
import { fetchCategories } from "../../features/add_by_admin/category/categorySlice";
import { fetchNatures } from "../../features/add_by_admin/nature/natureSlice";
import { fetchCountries } from "../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../features/state/stateSlice";
import { fetchCities } from "../../features/city/citySlice";
import { fetchDataSources } from "../../features/add_by_admin/dataSource/dataSourceSlice";
import { fetchEvents } from "../../features/crmEvent/crmEventSlice";
import {
  addCompany,
  fetchCompanies,
  updateCompany,
} from "../../features/company/companySlice";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

// Helper function to safely extract an array from any Redux slice
const getArrayFromSlice = (sliceState, fallbackKey) => {
  if (Array.isArray(sliceState)) return sliceState;
  if (
    sliceState &&
    typeof sliceState === "object" &&
    fallbackKey in sliceState &&
    Array.isArray(sliceState[fallbackKey])
  ) {
    return sliceState[fallbackKey];
  }
  return [];
};

const formatReminderDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AddNewClients = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Check if we are in Edit mode (id exists)

  // ---------- Redux Selectors – Safe array extraction ----------
  const usersState = useSelector((state) => state.users);
  const users = getArrayFromSlice(usersState, "users"); // adjust fallbackKey if needed

  const categoriesState = useSelector((state) => state.categories);
  const categoriesArray = getArrayFromSlice(categoriesState, "categories");

  const naturesState = useSelector((state) => state.natures);
  const naturesArray = getArrayFromSlice(naturesState, "natures");

  const countriesState = useSelector((state) => state.countries);
  const countriesArray = getArrayFromSlice(countriesState, "countries");

  const statesState = useSelector((state) => state.states);
  const statesArray = getArrayFromSlice(statesState, "states");

  const citiesState = useSelector((state) => state.cities);
  const citiesArray = getArrayFromSlice(citiesState, "cities");

  const dataSourcesState = useSelector((state) => state.dataSources);
  const dataSourcesArray = getArrayFromSlice(dataSourcesState, "dataSources");

  const eventsState = useSelector((state) => state.crmEvents);
  const eventsArray = getArrayFromSlice(eventsState, "events");

  const companiesState = useSelector((state) => state.companies);
  const companiesArray = getArrayFromSlice(companiesState, "companies");

  // Optional: Log the extracted arrays to verify structure
  // console.log('categoriesArray:', categoriesArray);
  // console.log('naturesArray:', naturesArray);
  // console.log('countriesArray:', countriesArray);
  // console.log('statesArray:', statesArray);
  // console.log('citiesArray:', citiesArray);
  // console.log('dataSourcesArray:', dataSourcesArray);
  // console.log('eventsArray:', eventsArray);
  // console.log('users:', users);

  // 🧩 Form State
  const [formData, setFormData] = useState({
    companyName: "",
    category: "",
    businessNature: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    website: "",
    landline: "",
    email: "",
    dataSource: "",
    eventName: "",
    reminder: "",
    forwardTo: "",
    updated_by: "",
    contacts: [
      {
        title: "",
        firstName: "",
        surname: "",
        designation: "",
        email: "",
        mobile: "",
        alternate: "",
      },
    ],
  });

  const [isSaving, setIsSaving] = useState(false);

  // Fetch Companies on mount for editing logic
  useEffect(() => {
    if (companiesArray.length === 0) dispatch(fetchCompanies());
  }, [dispatch, companiesArray.length]);

  // Fetch all master data (users, categories, etc.)
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCategories());
    dispatch(fetchNatures());
    dispatch(fetchCountries());
    dispatch(fetchStates());
    dispatch(fetchCities());
    dispatch(fetchDataSources());
    dispatch(fetchEvents());
  }, [dispatch]);

  // If editing, prefill form
  useEffect(() => {
    if (id && companiesArray.length > 0) {
      const companyToEdit = companiesArray.find((c) => c._id === id);
      if (companyToEdit) {
        setFormData({
          companyName: companyToEdit.companyName || "",
          category: companyToEdit.category || "",
          businessNature: companyToEdit.businessNature || "",
          address: companyToEdit.address || "",
          country: companyToEdit.country || "",
          state: companyToEdit.state || "",
          city: companyToEdit.city || "",
          pincode: companyToEdit.pincode || "",
          website: companyToEdit.website || "",
          landline: companyToEdit.landline || "",
          email: companyToEdit.email || "",
          dataSource: companyToEdit.dataSource || "",
          eventName: companyToEdit.eventName || "",
          reminder: formatReminderDate(companyToEdit.reminder) || "",
          forwardTo: companyToEdit.forwardTo || "",
          updated_by: companyToEdit.updated_by || "",
          contacts:
            companyToEdit.contacts.length > 0
              ? companyToEdit.contacts
              : [
                  {
                    title: "",
                    firstName: "",
                    surname: "",
                    designation: "",
                    email: "",
                    mobile: "",
                    alternate: "",
                  },
                ],
        });
      }
    }
  }, [id, companiesArray]);

  const heading = id ? "Edit Client Details" : "Add New Company";
  const buttonName = id ? "Update" : "Save";

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedContacts = prev.contacts.map((contact, i) => {
        if (i === index) {
          return { ...contact, [field]: value };
        }
        return contact;
      });
      return { ...prev, contacts: updatedContacts };
    });
  };

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          title: "",
          firstName: "",
          surname: "",
          designation: "",
          email: "",
          mobile: "",
          alternate: "",
        },
      ],
    }));
  };

  const removeContact = (index) => {
    if (formData.contacts.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const userName = sessionStorage.getItem("user_name");
      const dataToSave = {
        ...formData,
        updated_by: userName || formData.updated_by,
      };

      if (id) {
        await dispatch(updateCompany({ id, data: dataToSave })).unwrap();
        showSuccess("Company updated successfully!");
        navigate(`/clientOverview1/${id}`);
      } else {
        await dispatch(addCompany(dataToSave)).unwrap();
        showSuccess("New company added successfully!");
        handleReset();
        navigate("/ihweClientData2026/newLeadList");
      }
    } catch (err) {
      console.error("Failed to save company:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      companyName: "",
      category: "",
      businessNature: "",
      address: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      website: "",
      landline: "",
      email: "",
      dataSource: "",
      eventName: "",
      reminder: "",
      forwardTo: "",
      contacts: [
        {
          title: "",
          firstName: "",
          surname: "",
          designation: "",
          email: "",
          mobile: "",
          alternate: "",
        },
      ],
    });
  };

  const handleMasterList = () => {
    navigate("/ihweClientData2026/masterData");
  };
  const handleConformList = () => {
    navigate("/ihweClientData2026/confirmClientList");
  };
  const handleUploadExhibitor = () => {
    navigate("/ihweClientData2026/uploadExhibitor");
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Heading and Navigation Buttons */}
      <div className="w-full h-fit bg-white shadow-md">
        <div className="w-full bg-white flex flex-col sm:flex-row justify-between items-center px-4 py-1">
          <h1 className="text-xl text-gray-500 mb-2 lg:mb-0 uppercase">
            COMPANY DETAILS
          </h1>
          <div className="flex flex-wrap gap-2 cursor-pointer">
            <button
              onClick={handleUploadExhibitor}
              className="px-2 py-1.5 text-xs font-medium bg-[#3598dc] hover:bg-[#286090] text-white transition-colors"
            >
              Upload Exhibitor
            </button>
            <button
              onClick={handleMasterList}
              className="px-2 py-1.5 text-xs font-medium bg-[#3598dc] hover:bg-[#286090] text-white transition-colors"
            >
              Master List
            </button>
            <button
              onClick={handleConformList}
              className="px-2 py-1.5 text-xs font-medium bg-[#3598dc] hover:bg-[#286090] text-white transition-colors"
            >
              Exhibitor List
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="max-w-full bg-white shadow-lg m-4">
        <div className="px-4 pb-4 pt-2">
          <h2 className="text-xl font-normal text-gray-500 mb-1">{heading}</h2>
          <hr className="mb-3 opacity-10" />

          {/* Company Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                placeholder="Enter company name"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                required
              >
                <option value="">Select Category</option>
                {categoriesArray.map((categorie, i) => (
                  <option key={i} value={categorie?.cat_name}>
                    {categorie?.cat_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Nature of Business <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.businessNature}
                onChange={(e) => handleChange("businessNature", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                required
              >
                <option value="">Select Nature</option>
                {naturesArray.map((nature, i) => (
                  <option key={i} value={nature?.nature_name}>
                    {nature?.nature_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                placeholder="Enter address"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.country}
                onChange={(e) => {
                  handleChange("country", e.target.value);
                  handleChange("state", "");
                  handleChange("city", "");
                }}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                required
              >
                <option value="">Select Country Here</option>
                {countriesArray.map((country, i) => (
                  <option key={i} value={country?.name}>
                    {country?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* State / City */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => {
                  handleChange("state", e.target.value);
                  handleChange("city", "");
                }}
                disabled={!formData.country}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 disabled:bg-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                required
              >
                <option value="">Select State Here</option>
                {formData.country &&
                  statesArray.map((state, i) => (
                    <option key={i} value={state?.name}>
                      {state?.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                City <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                disabled={!formData.state}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 disabled:bg-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                required
              >
                <option value="">Select City Here</option>
                {formData.country &&
                  formData.state &&
                  citiesArray.map((city, i) => (
                    <option key={i} value={city?.name}>
                      {city?.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Pin Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!isNaN(value) && value.length <= 6) {
                    setFormData((prev) => ({
                      ...prev,
                      pincode: value,
                    }));
                  }
                }}
                maxLength={6}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                placeholder="Enter pin code"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Website <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                placeholder="Enter website URL"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                LandLine No.
              </label>
              <input
                type="text"
                value={formData.landline}
                onChange={(e) => handleChange("landline", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                placeholder="Enter landline number"
              />
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Email Id <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Data Source <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.dataSource}
                onChange={(e) => handleChange("dataSource", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                required
              >
                <option value="">Select Source</option>
                {dataSourcesArray.map((dataSource, i) => (
                  <option key={i} value={dataSource?.source_name}>
                    {dataSource?.source_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Event Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.eventName}
                onChange={(e) => handleChange("eventName", e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                required
              >
                <option value="">Select Event</option>
                {eventsArray.map((event, i) => (
                  <option key={i} value={event?.event_name}>
                    {event?.event_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Reminder Date &amp; Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.reminder}
                onChange={(e) => handleChange("reminder", e.target.value)}
                readOnly={!!id}
                className={`w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none ${
                  !!id ? "bg-gray-200 cursor-not-allowed" : ""
                }`}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-900 mb-1 block">
                Forward To <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.forwardTo}
                onChange={(e) => handleChange("forwardTo", e.target.value)}
                disabled={!!id}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 disabled:bg-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                required
              >
                <option value="">Select Here</option>
                {users?.map((user, i) => (
                  <option key={i} value={user?.user_fullname}>
                    {user?.user_fullname}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <h3 className="text-sm font-medium text-gray-800 mb-1 mt-6">
            Contact Details-1
          </h3>
          <hr className="mb-0.5 opacity-10" />

          {formData.contacts.map((contact, index) => (
            <div key={index} className="pb-3 pt-1 bg-gray-50 mb-0.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 items-end">
                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contact.title}
                    onChange={(e) =>
                      handleContactChange(index, "title", e.target.value)
                    }
                    required
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select Here</option>
                    <option>Mr.</option>
                    <option>Ms.</option>
                    <option>Mrs.</option>
                    <option>Dr.</option>
                  </select>
                </div>

                {/* First Name */}
                <div>
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.firstName}
                    onChange={(e) =>
                      handleContactChange(index, "firstName", e.target.value)
                    }
                    placeholder="Enter First Name"
                    required
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                {/* Surname */}
                <div>
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.surname}
                    onChange={(e) =>
                      handleContactChange(index, "surname", e.target.value)
                    }
                    placeholder="Enter Surname"
                    required
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.designation}
                    onChange={(e) =>
                      handleContactChange(index, "designation", e.target.value)
                    }
                    placeholder="Enter Designation"
                    required
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) =>
                      handleContactChange(index, "email", e.target.value)
                    }
                    placeholder="Enter Email"
                    required
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="text-xs font-medium text-gray-900 mb-1 block">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.mobile}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 10) val = val.slice(0, 10);
                      handleContactChange(index, "mobile", val);
                    }}
                    placeholder="Enter Mobile"
                    required
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                {/* Alternate Number */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-900 block">
                      Alternate No.
                    </label>
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={addContact}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 flex items-center justify-center text-sm font-bold"
                      >
                        +
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 flex items-center justify-center text-sm font-bold"
                      >
                        -
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={contact.alternate}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      handleContactChange(index, "alternate", val);
                    }}
                    placeholder="Enter Alternate Number"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <hr className="my-0.5 opacity-10" />

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3">
            <p className="text-xs text-gray-600 mb-3 sm:mb-0">
              <span className="text-red-500 text-sm">*</span> Required Fields
            </p>
            <div className="flex gap-1">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-[#337ab7] hover:bg-[#286090] text-white flex items-center gap-1"
              >
                {buttonName} <IoIosArrowDroprightCircle />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewClients;
