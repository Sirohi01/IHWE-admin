import React from "react";
import { useState } from "react";
import {
  User,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Globe,
  Plus,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import api from "../../lib/api";
import { toast } from "react-toastify";

const IndividualProfile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    profession: "",
    age: "",
    mobileNumber: "",
    emailAddress: "",
    alternateNo: "",
    landlineNo: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    dataSource: "",
    enquiryFor: "",
    notes: "",
  });

  const [contacts, setContacts] = useState([]);
  const [currentContact, setCurrentContact] = useState({
    name: "",
    relation: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Options
  const professionOptions = [
    "Doctor",
    "Engineer",
    "Teacher",
    "Business Owner",
    "Government Employee",
    "Private Employee",
    "Student",
    "Retired",
    "Homemaker",
    "Freelancer",
    "Other",
  ];
  const dataSourceOptions = [
    "Website",
    "Referral",
    "Social Media",
    "Email Campaign",
    "Walk-in",
    "Phone Call",
    "Existing Client",
    "Advertisement",
    "Event",
    "Other",
  ];
  const enquiryForOptions = [
    "Consultation",
    "Service",
    "Product",
    "Support",
    "Quotation",
    "Partnership",
    "Other",
  ];
  const countries = [
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "UAE",
    "Singapore",
    "Germany",
    "France",
    "Japan",
    "Other",
  ];
  const indianStates = [
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "Uttar Pradesh",
    "Gujarat",
    "West Bengal",
    "Rajasthan",
    "Telangana",
    "Andhra Pradesh",
    "Kerala",
    "Madhya Pradesh",
    "Punjab",
    "Haryana",
    "Other",
  ];
  const relationOptions = [
    "Spouse",
    "Parent",
    "Child",
    "Sibling",
    "Friend",
    "Colleague",
    "Relative",
    "Other",
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }
    if (formData.emailAddress && !/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = "Email is invalid";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setCurrentContact({ ...currentContact, [name]: value });
  };

  const addContact = () => {
    if (!currentContact.name.trim() || !currentContact.phone.trim()) {
      toast.error("Please enter at least name and phone number for contact");
      return;
    }
    setContacts([...contacts, { ...currentContact, id: Date.now() }]);
    setCurrentContact({ name: "", relation: "", phone: "", email: "" });
  };

  const removeContact = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, contacts };
      const response = await api.post("/api/leads/individual", payload);
      if (response.data.success) {
        setSuccess(true);
        resetForm();
        toast.success("Lead saved to database successfully!");
      }
    } catch (err) {
      toast.error("Failed to save lead");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      profession: "",
      age: "",
      mobileNumber: "",
      emailAddress: "",
      alternateNo: "",
      landlineNo: "",
      address: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      dataSource: "",
      enquiryFor: "",
      notes: "",
    });
    setContacts([]);
    setCurrentContact({ name: "", relation: "", phone: "", email: "" });
    setErrors({});
  };

  return (
    <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
      <div className="w-full">
        <PageHeader
          title="LEAD PROFILE FORM"
          description="Digitize the CRM process for individual clients"
        />

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-fadeIn">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Lead added successfully to Database!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-600 pb-2 mb-2">
            Profile Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2 inline" /> Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg outline-none ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profession
              </label>
              <select
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              >
                <option value="">Select Profession</option>
                {professionOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                placeholder="Enter age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg outline-none ${
                  errors.mobileNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter 10-digit mobile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg outline-none ${
                  errors.emailAddress ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email"
              />
            </div>

            {/* Address */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg outline-none ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-10">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 rounded-lg"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? "Saving..." : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default IndividualProfile;