import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    LayoutGrid,
    Loader2,
    Send,
    ShieldCheck,
    Upload,
    UserCheck,
} from "lucide-react";

const events = [
    { _id: "evt-1", name: "IHWE 2026" },
    { _id: "evt-2", name: "Ayush Expo 2026" },
    { _id: "evt-3", name: "Wellness Summit 2026" },
];

const countries = [{ _id: "country-1", name: "India" }];

const statesByCountry = {
    India: ["Gujarat", "Maharashtra", "Delhi", "Rajasthan"],
};

const citiesByState = {
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
    Delhi: ["New Delhi", "Dwarka", "Saket", "Rohini"],
    Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
};

const PURPOSE_GENERAL = [
    "Business Networking",
    "Exploring New Products",
    "Buying Products & Services",
    "Learning Industry Trends",
    "Others",
];

const PURPOSE_CORPORATE = [
    "Business Meeting",
    "Networking & Industry Interaction",
    "Partnership / Collaboration Discussion",
    "Exploring Business Opportunities",
    "Exhibitor / Vendor Meeting",
    "Product Sourcing / Procurement",
    "Market Research",
    "Investment Opportunities",
    "Conference / Seminar Participation",
];

const INTEREST_GENERAL = [
    "AYUSH & Herbal Products",
    "Organic & Natural Products",
    "Fitness & Wellness Equipment",
    "Health Supplements",
    "Hospitals & Healthcare Services",
    "Agriculture & Organic Farming",
    "R&D & Innovations",
    "Others",
];

const INTEREST_CORPORATE = [
    "Medical, Healthcare & Hospital Solutions",
    "Medical Technology, Diagnostics & Devices",
    "AYUSH & Traditional Systems of Medicine",
    "Nutrition, Organic & Health Foods",
    "Beauty, Personal Care & Aesthetic Wellness",
    "Mental Health, Yoga & Spiritual Wellness",
    "Wellness, Fitness & Lifestyle",
    "Institutions, Government Bodies & Startups",
];

const getInitialFormData = () => ({
    registrationFor: events[0]?.name || "",
    firstName: "",
    lastName: "",
    designation: "",
    gender: "",
    dob: "",
    mobileNo: "",
    alternateNo: "",
    email: "",
    companyName: "",
    companyWebsite: "",
    industry: "",
    companySize: "",
    country: "India",
    state: "",
    city: "",
    companyPincode: "",
    purposeOfVisit: [],
    areaOfInterest: [],
    anyRequirement: "",
    subscribeNewsletter: false,
});

const AddDomesticVisitor = () => {
    const navigate = useNavigate();
    const [visitorType, setVisitorType] = useState("corporate");
    const [formData, setFormData] = useState(getInitialFormData());
    const [loading, setLoading] = useState(false);

    const labelClasses = "text-[10px] font-bold text-slate-700 uppercase tracking-widest";
    const inputClasses =
        "h-8 w-full rounded-[2px] border border-slate-400 bg-white px-3 text-[12px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#23471d] focus:ring-1 focus:ring-[#23471d]/10";

    const states = formData.country ? statesByCountry[formData.country] || [] : [];
    const cities = formData.state ? citiesByState[formData.state] || [] : [];
    const loadingStates = false;
    const loadingCities = false;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => {
            const next = {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };

            if (name === "country") {
                next.state = "";
                next.city = "";
            }

            if (name === "state") {
                next.city = "";
            }

            return next;
        });
    };

    const handlePurposeChange = (option, checked) => {
        setFormData((prev) => ({
            ...prev,
            purposeOfVisit: checked
                ? [...prev.purposeOfVisit, option]
                : prev.purposeOfVisit.filter((item) => item !== option),
        }));
    };

    const handleInterestChange = (option, checked) => {
        setFormData((prev) => ({
            ...prev,
            areaOfInterest: checked
                ? [...prev.areaOfInterest, option]
                : prev.areaOfInterest.filter((item) => item !== option),
        }));
    };

    const validate = () => {
        if (!formData.firstName.trim()) return "First name is required.";
        if (!formData.lastName.trim()) return "Last name is required.";
        if (visitorType === "corporate" && !formData.designation.trim()) return "Designation is required.";
        if (!formData.gender) return "Gender is required.";
        if (!formData.mobileNo.trim()) return "WhatsApp number is required.";
        if (!formData.email.trim()) return "Email address is required.";
        if (!formData.country) return "Country is required.";
        if (!formData.state) return "State is required.";
        if (!formData.city) return "City is required.";
        if (!formData.companyPincode.trim()) return "Pincode is required.";

        if (visitorType === "corporate") {
            if (!formData.companyName.trim()) return "Company name is required.";
            if (!formData.companyWebsite.trim()) return "Company website is required.";
            if (!formData.industry) return "Industry/Sector is required.";
            if (!formData.companySize) return "Company size is required.";
        }

        if (formData.purposeOfVisit.length === 0) return "Select at least one purpose of visit.";
        if (formData.areaOfInterest.length === 0) return "Select at least one area of interest.";

        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errorMessage = validate();
        if (errorMessage) {
            Swal.fire({
                title: "Validation Error",
                text: errorMessage,
                icon: "warning",
                confirmButtonColor: "#23471d",
            });
            return;
        }

        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 400));

        const payload = {
            visitorType,
            ...formData,
            submittedAt: new Date().toISOString(),
        };

        console.log("Domestic visitor form data:", payload);

        setLoading(false);
        Swal.fire({
            title: "Saved Locally",
            text: "Form data console me print ho gaya.",
            icon: "success",
            confirmButtonColor: "#23471d",
        });

        setVisitorType("corporate");
        setFormData(getInitialFormData());
    };

    return (
        <div className="mt-6 min-h-screen animate-fadeIn bg-white p-6 font-inter shadow-md">
            <div className="flex flex-col items-center justify-between border-b border-gray-100 pb-4 sm:flex-row">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold uppercase leading-none tracking-tight text-slate-500">
                        COMPANY DETAILS
                    </h1>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Client Registration Portal
                    </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                    <button
                        type="button"
                        onClick={() => navigate("/ihweClientData2026/uploadExhibitor")}
                        className="flex items-center gap-1.5 rounded-[2px] bg-[#3598dc] px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow-sm transition-colors hover:bg-[#286090]"
                    >
                        <Upload size={12} /> Upload Exhibitor
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/ihweClientData2026/masterData")}
                        className="flex items-center gap-1.5 rounded-[2px] bg-[#3598dc] px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow-sm transition-colors hover:bg-[#286090]"
                    >
                        <LayoutGrid size={12} /> Master List
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/ihweClientData2026/confirmClientList")}
                        className="flex items-center gap-1.5 rounded-[2px] bg-[#3598dc] px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow-sm transition-colors hover:bg-[#286090]"
                    >
                        <UserCheck size={12} /> Exhibitor List
                    </button>
                </div>
            </div>

            <div className="mx-auto rounded-sm border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-8 py-5">
                    <h1 className="text-2xl font-bold text-[#23471d]">Add Domestic Visitor</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Local registration form with the same requested fields and no OTP flow.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-8 font-inter">
                    <div className="flex flex-wrap items-center gap-12">
                        <div className="flex flex-wrap gap-10">
                            <label className="flex cursor-pointer items-center space-x-3">
                                <input
                                    type="radio"
                                    name="visitorType"
                                    value="corporate"
                                    checked={visitorType === "corporate"}
                                    onChange={(e) => setVisitorType(e.target.value)}
                                    className="h-5 w-5 border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                                />
                                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    Corporate Visitor
                                </span>
                            </label>
                            <label className="flex cursor-pointer items-center space-x-3">
                                <input
                                    type="radio"
                                    name="visitorType"
                                    value="general"
                                    checked={visitorType === "general"}
                                    onChange={(e) => setVisitorType(e.target.value)}
                                    className="h-5 w-5 border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                                />
                                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    General Visitor
                                </span>
                            </label>
                        </div>

                        <div className="hidden min-w-[220px] flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                                Registering For (Event) *
                            </label>
                            <select
                                required
                                name="registrationFor"
                                value={formData.registrationFor}
                                onChange={handleInputChange}
                                className="h-8 rounded-[2px] border border-slate-400 bg-white px-3 text-[12px] font-medium text-slate-900"
                            >
                                {events.map((ev) => (
                                    <option key={ev._id} value={ev.name}>
                                        {ev.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <h3
                            className="border-b border-slate-100 pb-1.5 text-sm font-bold uppercase tracking-[0.05em] text-[#d26019]"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-5">
                            <div>
                                <label className={labelClasses}>FIRST NAME *</label>
                                <input name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="Enter First Name" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>LAST NAME *</label>
                                <input name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Enter Last Name" className={inputClasses} />
                            </div>
                            {visitorType === "corporate" && (
                                <div>
                                    <label className={labelClasses}>DESIGNATION *</label>
                                    <input name="designation" value={formData.designation} onChange={handleInputChange} required placeholder="Enter Designation.." className={inputClasses} />
                                </div>
                            )}
                            <div>
                                <label className={labelClasses}>GENDER *</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputClasses}>
                                    <option value="">Select Here</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>DATE OF BIRTH (OPTIONAL)</label>
                                <input name="dob" value={formData.dob} onChange={handleInputChange} type="date" className={inputClasses} />
                            </div>
                            <div className="group relative flex flex-col">
                                <label className={labelClasses}>MOBILE NO. (WHATSAPP) *</label>
                                <input name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} required placeholder="Enter WhatsApp Number" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>ALTERNATE NO. (OPTIONAL)</label>
                                <input name="alternateNo" value={formData.alternateNo} onChange={handleInputChange} placeholder="Enter Alternate No." className={inputClasses} />
                            </div>
                            <div className="group relative flex flex-col lg:col-span-2">
                                <label className={labelClasses}>EMAIL ADDRESS *</label>
                                <input name="email" value={formData.email} onChange={handleInputChange} type="email" required placeholder="Enter Email Address" className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3
                            className="border-b border-slate-400 pb-1.5 text-sm font-bold uppercase tracking-[0.05em] text-[#d26019]"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            Company & Industry Information
                        </h3>
                        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-5">
                            {visitorType === "corporate" && (
                                <>
                                    <div className="lg:col-span-2">
                                        <label className={labelClasses}>COMPANY NAME *</label>
                                        <input name="companyName" value={formData.companyName} onChange={handleInputChange} required placeholder="Enter Company Name.." className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>COMPANY WEBSITE *</label>
                                        <input name="companyWebsite" value={formData.companyWebsite} onChange={handleInputChange} required placeholder="Enter Company Website.." className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>INDUSTRY/SECTOR *</label>
                                        <select name="industry" value={formData.industry} onChange={handleInputChange} className={inputClasses}>
                                            <option value="">Select Here</option>
                                            <option value="ayush">AYUSH</option>
                                            <option value="agriculture">Agriculture & Organic</option>
                                            <option value="fitness">Fitness & Wellness</option>
                                            <option value="healthcare">Healthcare Services</option>
                                            <option value="pharma">Pharmaceutical</option>
                                            <option value="others">Others</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>COMPANY SIZE *</label>
                                        <select name="companySize" value={formData.companySize} onChange={handleInputChange} className={inputClasses}>
                                            <option value="">Select Here</option>
                                            <option value="1-10">1-10 Employees</option>
                                            <option value="11-50">11-50 Employees</option>
                                            <option value="51-200">51-200 Employees</option>
                                            <option value="200+">200+ Employees</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className={labelClasses}>COUNTRY *</label>
                                <select name="country" value={formData.country} onChange={handleInputChange} className={inputClasses}>
                                    <option value="">Select Country</option>
                                    {countries.map((country) => (
                                        <option key={country._id} value={country.name}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>STATE *</label>
                                <select disabled={!formData.country || loadingStates} name="state" value={formData.state} onChange={handleInputChange} className={inputClasses}>
                                    <option value="">{loadingStates ? "Loading..." : "Select State"}</option>
                                    {states.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>CITY *</label>
                                <select disabled={!formData.state || loadingCities} name="city" value={formData.city} onChange={handleInputChange} className={inputClasses}>
                                    <option value="">{loadingCities ? "Loading..." : "Select City"}</option>
                                    {cities.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Pincode *</label>
                                <input name="companyPincode" value={formData.companyPincode} onChange={handleInputChange} required placeholder="Enter Pincode" className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div className="space-y-4 rounded-[2px] border border-slate-300 bg-slate-50/50 p-5 shadow-sm">
                            <label className="block border-b border-slate-200 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#23471d]">Purpose of Visit *</label>
                            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                                {(visitorType === "corporate" ? PURPOSE_CORPORATE : PURPOSE_GENERAL).map((opt) => (
                                    <label key={opt} className="group flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.purposeOfVisit.includes(opt)}
                                            onChange={(e) => handlePurposeChange(opt, e.target.checked)}
                                            className="h-3.5 w-3.5 rounded-none border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                                        />
                                        <span className="text-[11px] font-medium text-slate-600 transition-colors group-hover:text-slate-900">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 rounded-[2px] border border-slate-300 bg-slate-50/50 p-5 shadow-sm">
                            <label className="block border-b border-slate-200 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#23471d]">Area of Interest *</label>
                            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                                {(visitorType === "corporate" ? INTEREST_CORPORATE : INTEREST_GENERAL).map((opt) => (
                                    <label key={opt} className="group flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.areaOfInterest.includes(opt)}
                                            onChange={(e) => handleInterestChange(opt, e.target.checked)}
                                            className="h-3.5 w-3.5 rounded-none border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                                        />
                                        <span className="text-[11px] font-medium text-slate-600 transition-colors group-hover:text-slate-900">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {visitorType === "corporate" && (
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900">Any Specific requirement</label>
                            <input
                                name="anyRequirement"
                                value={formData.anyRequirement}
                                onChange={handleInputChange}
                                placeholder="Write Here .."
                                className={inputClasses}
                            />
                        </div>
                    )}

                    <div className="border-t border-slate-100 pt-4">
                        <label className="group flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                name="subscribeNewsletter"
                                checked={formData.subscribeNewsletter}
                                onChange={handleInputChange}
                                className="h-4 w-4 rounded-none border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                            />
                            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
                                Subscribe to Event Updates & Newsletters
                            </span>
                        </label>
                    </div>

                    <div className="flex flex-col items-center pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex h-12 w-full max-w-56 items-center justify-center gap-3 rounded-sm bg-[#23471d] text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-[#23471d]/10 transition-all duration-300 hover:bg-[#1a3516] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>SUBMITTING...</span>
                                </>
                            ) : (
                                <>
                                    SUBMIT REGISTRATION
                                    <Send size={16} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                        <p className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            <ShieldCheck size={12} className="text-[#23471d]" />
                            Secure Registration Portal
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDomesticVisitor;
