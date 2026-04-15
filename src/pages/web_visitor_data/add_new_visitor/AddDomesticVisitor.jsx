import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { fetchCountries } from "../../../features/add_by_admin/country/countrySlice";
import { fetchNatures } from "../../../features/add_by_admin/nature/natureSlice";
import { fetchCities } from "../../../features/city/citySlice";
import { fetchEvents } from "../../../features/crmEvent/crmEventSlice";
import { fetchStates } from "../../../features/state/stateSlice";
import { createCorporateVisitor } from "../../../features/visitor/corporateVisitorSlice";
import { createGeneralVisitor } from "../../../features/visitor/generalVisitorSlice";

const PURPOSE_GENERAL = [
    { key: "businessNetworking", label: "Business Networking" },
    { key: "exploringNewProducts", label: "Exploring New Products" },
    { key: "buyingProductsServices", label: "Buying Products & Services" },
    { key: "learningIndustryTrends", label: "Learning Industry Trends" },
    { key: "others", label: "Others" },
];

const PURPOSE_CORPORATE = [
    { key: "businessMeeting", label: "Business Meeting" },
    { key: "networkingIndustryInteraction", label: "Networking & Industry Interaction" },
    { key: "partnershipCollaborationDiscussion", label: "Partnership / Collaboration Discussion" },
    { key: "exploringBusinessOpportunities", label: "Exploring Business Opportunities" },
    { key: "exhibitorVendorMeeting", label: "Exhibitor / Vendor Meeting" },
    { key: "productSourcingProcurement", label: "Product Sourcing / Procurement" },
    { key: "marketResearch", label: "Market Research" },
    { key: "investmentOpportunities", label: "Investment Opportunities" },
    { key: "conferenceSeminarParticipation", label: "Conference / Seminar Participation" },
];

const INTEREST_GENERAL = [
    { key: "ayushHerbalProducts", label: "AYUSH & Herbal Products" },
    { key: "organicNaturalProducts", label: "Organic & Natural Products" },
    { key: "fitnessWellnessEquipment", label: "Fitness & Wellness Equipment" },
    { key: "healthSupplements", label: "Health Supplements" },
    { key: "hospitalsHealthcareServices", label: "Hospitals & Healthcare Services" },
    { key: "agricultureOrganicFarming", label: "Agriculture & Organic Farming" },
    { key: "rdInnovations", label: "R&D & Innovations" },
    { key: "others", label: "Others" },
];

const INTEREST_CORPORATE = [
    { key: "medicalHealthcareHospitalSolutions", label: "Medical, Healthcare & Hospital Solutions" },
    { key: "medicalTechnologyDiagnosticsDevices", label: "Medical Technology, Diagnostics & Devices" },
    { key: "ayushTraditionalSystems", label: "AYUSH & Traditional Systems of Medicine" },
    { key: "nutritionOrganicHealthFoods", label: "Nutrition, Organic & Health Foods" },
    { key: "beautyPersonalCareAestheticWellness", label: "Beauty, Personal Care & Aesthetic Wellness" },
    { key: "mentalHealthYogaSpiritualWellness", label: "Mental Health, Yoga & Spiritual Wellness" },
    { key: "wellnessFitnessLifestyle", label: "Wellness, Fitness & Lifestyle" },
    { key: "institutionsGovernmentBodiesStartups", label: "Institutions, Government Bodies & Startups" },
];

const getInitialFormData = () => ({
    registrationFor: "",
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
    country: "",
    state: "",
    city: "",
    companyPincode: "",
    purposeOfVisit: [],
    areaOfInterest: [],
    anyRequirement: "",
    subscribeNewsletter: false,
});

const buildBooleanSelectionMap = (options, selectedValues) =>
    options.reduce((acc, option) => {
        acc[option.key] = selectedValues.includes(option.label);
        return acc;
    }, {});

const getEventLabel = (event) =>
    event?.event_fullName || event?.event_name || event?.name || "";

const AddDomesticVisitor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [visitorType, setVisitorType] = useState("corporate");
    const [formData, setFormData] = useState(getInitialFormData());

    const { countries = [], loading: countriesLoading } = useSelector((state) => state.countries || {});
    const { states = [], loading: statesLoading } = useSelector((state) => state.states || {});
    const { cities = [], loading: citiesLoading } = useSelector((state) => state.cities || {});
    const { events = [] } = useSelector((state) => state.crmEvents || {});
    const { natures = [] } = useSelector((state) => state.natures || {});
    const { loading: corporateLoading = false } = useSelector((state) => state.corporateVisitors || {});
    const { loading: generalLoading = false } = useSelector((state) => state.generalVisitors || {});

    const loading = corporateLoading || generalLoading;

    const labelClasses = "text-[10px] font-bold text-slate-700 uppercase tracking-widest";
    const inputClasses =
        "h-8 w-full rounded-[2px] border border-slate-400 bg-white px-3 text-[12px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#23471d] focus:ring-1 focus:ring-[#23471d]/10";

    useEffect(() => {
        dispatch(fetchCountries());
        dispatch(fetchStates());
        dispatch(fetchCities());
        dispatch(fetchEvents());
        dispatch(fetchNatures());
    }, [dispatch]);

    const eventOptions = useMemo(() => {
        const activeEvents = (events || []).filter(
            (event) => !event?.event_status || event.event_status.toLowerCase() === "active"
        );

        return activeEvents
            .map((event) => ({
                id: event?._id || event?.id || getEventLabel(event),
                label: getEventLabel(event),
            }))
            .filter((event) => event.label);
    }, [events]);

    const countryOptions = useMemo(
        () =>
            (countries || [])
                .map((country) => ({
                    id: country?._id || country?.countryCode || country?.name,
                    name: country?.name || "",
                    countryCode: country?.countryCode,
                }))
                .filter((country) => country.name),
        [countries]
    );

    const industryOptions = useMemo(
        () =>
            (natures || [])
                .map((nature) => nature?.nature_name || nature?.name || "")
                .filter(Boolean),
        [natures]
    );

    const filteredStates = useMemo(() => {
        if (!formData.country) return [];

        const selectedCountry = countryOptions.find(
            (country) => country.name.trim().toLowerCase() === formData.country.trim().toLowerCase()
        );

        if (!selectedCountry) return [];

        return (states || [])
            .filter(
                (state) =>
                    selectedCountry.countryCode != null &&
                    state?.countryCode != null &&
                    String(state.countryCode) === String(selectedCountry.countryCode)
            )
            .map((state) => ({
                id: state?._id || state?.stateCode || state?.name,
                name: state?.name || "",
                stateCode: state?.stateCode,
            }))
            .filter((state) => state.name);
    }, [countryOptions, formData.country, states]);

    const filteredCities = useMemo(() => {
        if (!formData.state) return [];

        const selectedState = filteredStates.find(
            (state) => state.name.trim().toLowerCase() === formData.state.trim().toLowerCase()
        );

        if (!selectedState) return [];

        return (cities || [])
            .filter(
                (city) =>
                    selectedState.stateCode != null &&
                    city?.stateCode != null &&
                    String(city.stateCode) === String(selectedState.stateCode)
            )
            .map((city) => ({
                id: city?._id || city?.name,
                name: city?.name || "",
            }))
            .filter((city) => city.name);
    }, [cities, filteredStates, formData.state]);

    useEffect(() => {
        if (!formData.registrationFor && eventOptions.length > 0) {
            setFormData((prev) => ({
                ...prev,
                registrationFor: eventOptions[0].label,
            }));
        }
    }, [eventOptions, formData.registrationFor]);

    useEffect(() => {
        if (!formData.country) {
            const indiaOption = countryOptions.find(
                (country) => country.name.trim().toLowerCase() === "india"
            );

            if (indiaOption) {
                setFormData((prev) => ({
                    ...prev,
                    country: indiaOption.name,
                }));
            }
        }
    }, [countryOptions, formData.country]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        let processedValue = type === "checkbox" ? checked : value;

        // Apply specific validations based on input name
        switch (name) {
            case "firstName":
            case "lastName":
                processedValue = value.replace(/[^a-zA-Z\s]/g, "");
                break;
            case "mobileNo":
            case "alternateNo":
                processedValue = value.replace(/\D/g, "").slice(0, 10);
                break;
            case "companyPincode":
                processedValue = value.replace(/\D/g, "").slice(0, 6);
                break;
            default:
                break;
        }

        setFormData((prev) => {
            const next = {
                ...prev,
                [name]: processedValue,
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
                ? [...prev.purposeOfVisit, option.label]
                : prev.purposeOfVisit.filter((item) => item !== option.label),
        }));
    };

    const handleInterestChange = (option, checked) => {
        setFormData((prev) => ({
            ...prev,
            areaOfInterest: checked
                ? [...prev.areaOfInterest, option.label]
                : prev.areaOfInterest.filter((item) => item !== option.label),
        }));
    };

    const validate = () => {
        if (!formData.firstName.trim()) return "First name is required.";
        if (!formData.lastName.trim()) return "Last name is required.";
        if (visitorType === "corporate" && !formData.designation.trim()) return "Designation is required.";
        if (!formData.gender) return "Gender is required.";

        if (!formData.mobileNo.trim()) return "WhatsApp number is required.";
        if (!/^\d{10}$/.test(formData.mobileNo)) return "WhatsApp number must be exactly 10 digits.";

        if (formData.alternateNo && !/^\d{10}$/.test(formData.alternateNo)) {
            return "Alternate number must be 10 digits, if provided.";
        }

        if (!formData.email.trim()) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            return "Please enter a valid email format (e.g., user@example.com).";
        }

        if (!formData.country) return "Country is required.";
        if (!formData.state) return "State is required.";
        if (!formData.city) return "City is required.";

        if (!formData.companyPincode.trim()) return "Pincode is required.";
        if (!/^\d{6}$/.test(formData.companyPincode)) return "Pincode must be exactly 6 digits.";

        if (visitorType === "corporate") {
            if (!formData.companyName.trim()) return "Company name is required.";
            if (!formData.companyWebsite.trim()) return "Company website is required.";
            if (!formData.companyWebsite.includes('.')) {
                return "Please enter a valid company website URL.";
            }
            if (!formData.industry) return "Industry/Sector is required.";
            if (!formData.companySize) return "Company size is required.";
            if (!formData.b2bMeeting) return "Please select if you want to schedule B2B meetings.";
        }

        if (formData.purposeOfVisit.length === 0) return "Select at least one purpose of visit.";
        if (formData.areaOfInterest.length === 0) return "Select at least one area of interest.";

        return "";
    };

    const buildGeneralPayload = () => ({
        registrationFor: formData.registrationFor,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobileNo,
        alternateNo: formData.alternateNo,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        companyName: formData.companyName,
        designation: formData.designation,
        industrySector: formData.industry,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.companyPincode,
        purposeOfVisit: buildBooleanSelectionMap(PURPOSE_GENERAL, formData.purposeOfVisit),
        areaOfInterest: buildBooleanSelectionMap(INTEREST_GENERAL, formData.areaOfInterest),
        subscribe: formData.subscribeNewsletter,
        subscribeTerms: formData.subscribeNewsletter,
        visitorCategory: "Domestic Visitor",
    });

    const buildCorporatePayload = () => ({
        registrationFor: formData.registrationFor,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobileNo,
        designation: formData.designation,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        industrySector: formData.industry,
        companySize: formData.companySize,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.companyPincode,
        b2bMeeting: formData.b2bMeeting,
        whatsappUpdates: formData.subscribeNewsletter ? "yes" : "no",
        specificRequirement: formData.anyRequirement,
        subscribe: formData.subscribeNewsletter,
        purposeOfVisit: buildBooleanSelectionMap(PURPOSE_CORPORATE, formData.purposeOfVisit),
        areaOfInterest: buildBooleanSelectionMap(INTEREST_CORPORATE, formData.areaOfInterest),
        visitorCategory: "Domestic Visitor",
    });

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

        try {
            if (visitorType === "corporate") {
                await dispatch(createCorporateVisitor(buildCorporatePayload())).unwrap();
            } else {
                await dispatch(createGeneralVisitor(buildGeneralPayload())).unwrap();
            }

            Swal.fire({
                title: "Success!",
                text: `${formData.firstName} has been registered as a ${visitorType === "corporate" ? "Corporate" : "General"} Visitor.`,
                icon: "success",
                confirmButtonColor: "#23471d",
            });

            setVisitorType("corporate");
            setFormData(getInitialFormData());
        } catch (error) {
            Swal.fire({
                title: "Registration Error",
                text: typeof error === "string" ? error : error?.message || "Something went wrong during registration.",
                icon: "error",
                confirmButtonColor: "#23471d",
            });
        }
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
                        Visitor registration form connected to the existing visitor APIs.
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
                                {eventOptions.map((event) => (
                                    <option key={event.id} value={event.label}>
                                        {event.label}
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
                                <input name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} required placeholder="Enter WhatsApp Number" className={inputClasses} maxLength={10} />
                            </div>
                            <div>
                                <label className={labelClasses}>ALTERNATE NO. (OPTIONAL)</label>
                                <input name="alternateNo" value={formData.alternateNo} onChange={handleInputChange} placeholder="Enter Alternate No." className={inputClasses} maxLength={10} />
                            </div>
                            <div className="group relative flex flex-col lg:col-span-2">
                                <label className={labelClasses}>EMAIL ADDRESS *</label>
                                <input name="email" value={formData.email} onChange={handleInputChange} type="email" required placeholder="user@example.com" className={inputClasses} />
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
                                            {industryOptions.map((industry) => (
                                                <option key={industry} value={industry}>
                                                    {industry}
                                                </option>
                                            ))}
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
                                <select name="country" value={formData.country} onChange={handleInputChange} className={inputClasses} disabled={countriesLoading}>
                                    <option value="">{countriesLoading ? "Loading..." : "Select Country"}</option>
                                    {countryOptions.map((country) => (
                                        <option key={country.id} value={country.name}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>STATE *</label>
                                <select disabled={!formData.country || statesLoading} name="state" value={formData.state} onChange={handleInputChange} className={inputClasses}>
                                    <option value="">{statesLoading ? "Loading..." : "Select State"}</option>
                                    {filteredStates.map((state) => (
                                        <option key={state.id} value={state.name}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>CITY *</label>
                                <select disabled={!formData.state || citiesLoading} name="city" value={formData.city} onChange={handleInputChange} className={inputClasses}>
                                    <option value="">{citiesLoading ? "Loading..." : "Select City"}</option>
                                    {filteredCities.map((city) => (
                                        <option key={city.id} value={city.name}>
                                            {city.name}
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
                                {(visitorType === "corporate" ? PURPOSE_CORPORATE : PURPOSE_GENERAL).map((option) => (
                                    <label key={option.key} className="group flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.purposeOfVisit.includes(option.label)}
                                            onChange={(e) => handlePurposeChange(option, e.target.checked)}
                                            className="h-3.5 w-3.5 rounded-none border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                                        />
                                        <span className="text-[11px] font-medium text-slate-600 transition-colors group-hover:text-slate-900">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 rounded-[2px] border border-slate-300 bg-slate-50/50 p-5 shadow-sm">
                            <label className="block border-b border-slate-200 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#23471d]">Area of Interest *</label>
                            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                                {(visitorType === "corporate" ? INTEREST_CORPORATE : INTEREST_GENERAL).map((option) => (
                                    <label key={option.key} className="group flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.areaOfInterest.includes(option.label)}
                                            onChange={(e) => handleInterestChange(option, e.target.checked)}
                                            className="h-3.5 w-3.5 rounded-none border-slate-400 text-[#23471d] focus:ring-[#23471d]"
                                        />
                                        <span className="text-[11px] font-medium text-slate-600 transition-colors group-hover:text-slate-900">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {visitorType === "corporate" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">Would you like to schedule B2B meetings? *</label>
                                <div className="flex gap-6 mt-1">
                                    {["yes", "no"].map(val => (
                                        <label key={val} className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-700 capitalize">
                                            <input
                                                type="radio"
                                                name="b2bMeeting"
                                                value={val}
                                                checked={formData.b2bMeeting === val}
                                                onChange={(e) => setFormData(prev => ({ ...prev, b2bMeeting: e.target.value }))}
                                                className="w-4 h-4 accent-[#23471d]"
                                            /> {val}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {/* <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">Would you like updates via WhatsApp? *</label>
                                <div className="flex gap-6 mt-1">
                                    {["yes", "no"].map(val => (
                                        <label key={val} className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-700 capitalize">
                                            <input
                                                type="radio"
                                                name="whatsappUpdates"
                                                value={val}
                                                checked={formData.whatsappUpdates === val}
                                                onChange={(e) => setFormData(prev => ({ ...prev, whatsappUpdates: e.target.value }))}
                                                className="w-4 h-4 accent-[#23471d]"
                                            /> {val}
                                        </label>
                                    ))}
                                </div>
                            </div> */}
                        </div>
                    )}

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
