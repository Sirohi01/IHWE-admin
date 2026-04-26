
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    Briefcase,
    Building2,
    CheckCircle2,
    Clock,
    CreditCard,
    Factory,
    FileText,
    Globe,
    Globe2,
    HeartPulse,
    Hotel,
    Landmark,
    Leaf,
    Laptop,
    Loader2,
    MapPin,
    Phone,
    QrCode,
    ChevronDown,
    ChevronsUpDown,
    ShieldCheck,
    Store,
    UserRound,
    Wallet,
    X,
} from "lucide-react";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import {
    SERVER_URL,
    buyerRegistrationApi,
    crmApi,
    heroBackgroundApi,
} from "../../lib/api";

const MultiSelectDropdown = ({
    options,
    selected,
    onChange,
    placeholder = "Select options",
    error = false,
    accentColor = "emerald",
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggle = (item) => {
        if (selected.includes(item)) {
            onChange(selected.filter((s) => s !== item));
        } else {
            onChange([...selected, item]);
        }
    };

    const accentClasses = {
        emerald: {
            bg: "bg-emerald-50",
            border: "border-emerald-300",
            text: "text-emerald-700",
            tag: "bg-emerald-100 border-emerald-300",
            tagText: "text-emerald-700",
            tagX: "text-emerald-500 hover:text-emerald-700",
        },
        amber: {
            bg: "bg-amber-50",
            border: "border-amber-300",
            text: "text-amber-700",
            tag: "bg-amber-100 border-amber-300",
            tagText: "text-amber-700",
            tagX: "text-amber-500 hover:text-amber-700",
        },
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-300",
            text: "text-blue-700",
            tag: "bg-blue-100 border-blue-300",
            tagText: "text-blue-700",
            tagX: "text-blue-500 hover:text-blue-700",
        },
        slate: {
            bg: "bg-slate-50",
            border: "border-slate-300",
            text: "text-slate-700",
            tag: "bg-slate-100 border-slate-300",
            tagText: "text-slate-700",
            tagX: "text-slate-500 hover:text-slate-700",
        },
    };

    const ac = accentClasses[accentColor] || accentClasses.emerald;

    return (
        <div ref={ref} className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className={`w-full h-9 px-3 py-0 rounded-[2px] border text-left text-[12px] font-medium bg-white transition-all outline-none flex items-center justify-between gap-2
                    ${error ? "border-red-400" : open ? "border-[#23471d]" : "border-slate-400"} hover:border-[#23471d]`}
            >
                <span className="flex flex-wrap gap-1 flex-1 truncate">
                    {selected.length === 0 ? (
                        <span className="text-slate-400">{placeholder}</span>
                    ) : (
                        <span className="truncate">{selected.join(", ")}</span>
                    )}
                </span>
                <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-[220px] overflow-y-auto custom-scrollbar">
                    {options.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-3">No options available</p>
                    ) : (
                        options.map((opt) => {
                            const isChecked = selected.includes(opt);
                            return (
                                <label
                                    key={opt}
                                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-[12px] font-medium transition-colors
                                        ${isChecked ? `${ac.bg} ${ac.text}` : "text-slate-700 hover:bg-slate-50"}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggle(opt)}
                                        className="h-3.5 w-3.5 rounded border-emerald-400 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    {opt}
                                </label>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const FALLBACK_CONFIG = {
    companyTypes: [
        "Distributor", "Super Distributor", "Wholesaler", "Retailer (Single Store)",
        "Retail Chain / Multi-Store", "Modern Trade Buyer", "Manufacturer",
        "Private Label Buyer", "Franchise Seeker", "Investor", "Importer",
        "Exporter", "International Buying Agent", "E-commerce Seller", "D2C Brand Owner",
        "Hospital / Clinic", "Doctor / Medical Practitioner", "Pharmacy / Chemist",
        "Diagnostic Center", "Spa / Salon Owner", "Wellness Center", "Gym / Fitness Center",
        "Yoga Studio", "Nutritionist / Dietician", "Wellness Resort / Hospitality",
        "Hotel / Resort", "Corporate Buyer (Procurement / HR)", "Government / PSU",
        "NGO / Trust", "Consultant / Advisor", "Startup Founder", "Student / Researcher"
    ],
    annualTurnoverRanges: ["Below 50 Lakhs", "50L – 2 Cr", "2 – 10 Cr", "10 Cr+"],
    regions: ["North India", "South India", "East India", "West India", "Pan India", "Global"],
    supplierTypes: ["Manufacturer", "Exporter", "MSME", "Startup", "Wholesaler"],
    purchaseTimelines: ["Immediate", "1–3 Months", "3–6 Months", "Exploring"],
    roles: ["Final Decision Maker", "Influencer", "Research Only"],
    secondaryProductCategories: [
        "Ayurveda", "Organic", "Wellness", "Pharma", "Cosmetics",
        "Nutraceuticals", "Herbal", "Skincare", "Medical Devices", "HealthTech"
    ],
    buyingFrequencies: ["One-time", "Monthly", "Quarterly", "Long-term"],
    annualPurchaseValueRanges: ["Below 10 Lakhs", "10-50 Lakhs", "50 Lakhs - 1 Crore", "1-5 Crore", "5+ Crore"],
    primaryProductInterests: [
        "AYUSH & Traditional Medicine", "Organic & Natural Products", "Wellness & Lifestyle",
        "Beauty & Personal Care", "Fitness & Nutrition", "Medical & Healthcare", "Pharmaceuticals"
    ],
    budgetRanges: ["Flexible", "Entry Level", "Mid-Range", "Premium"],
    companySizes: ["Small (1-10 employees)", "Medium (11-50 employees)", "Large (51-200 employees)", "Enterprise (200+)"],
    certificationOptions: ["ISO", "GMP", "FDA", "AYUSH", "Organic", "Halal", "Kosher", "Others"],
    meetingPriorityLevels: ["Low Priority", "Medium Priority", "High Priority"],
    businessModelOptions: ["Retail", "Distribution", "Franchise", "Private Label / White Label", "Direct Sourcing", "B2B Bulk Supply"],
    meetingCategoryOptions: [
        "Ayurveda & Herbal", "Organic Food & Beverages", "Nutraceuticals & Supplements",
        "Fitness Equipment", "Beauty & Cosmetics", "Skincare", "Medical Devices",
        "Wellness Services", "Spa & Salon", "HealthTech", "Pharmaceuticals", "Others"
    ],
    exhibitorTypeOptions: ["Manufacturer", "Brand Owner", "Distributor", "Exporter", "Startup / Innovator", "Wholesaler"],
    meetingObjectiveOptions: [
        "Product Sourcing", "Partnership / Collaboration", "Distribution Opportunities",
        "Private Label / OEM", "Investment / Business Expansion", "Brand Acquisition",
        "Market Research", "Networking"
    ],
    preferredBusinessTypeOptions: ["Bulk Purchase", "Private Label", "Franchise", "Exclusive Distribution", "Joint Venture"],
    meetingDayOptions: ["Day 1", "Day 2", "Day 3"],
    packages: [],
};

const PAYMENT_METHODS = [
    { id: "netbanking", label: "Net Banking", icon: Landmark, description: "All major banks" },
    { id: "creditcard", label: "Credit Card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
    { id: "debitcard", label: "Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
    { id: "upi", label: "UPI", icon: QrCode, description: "Google Pay, PhonePe, Paytm" },
    { id: "wallet", label: "Mobile Wallet", icon: Wallet, description: "Paytm, Amazon Pay" },
];



const INITIAL_FORM_STATE = {
    fullName: "",
    designation: "",
    companyName: "",
    businessType: "",
    mobileNumber: "",
    alternateNumber: "",
    emailAddress: "",
    website: "",
    brandName: "",
    pinCode: "",
    country: "India",
    stateProvince: "",
    city: "",
    registeredAddress: "",
    companyFirmName: "",
    basicBusinessType: "",
    yearOfEstablishment: "",
    gstNumber: "",
    panNumber: "",
    natureOfBusiness: "",
    yearsInBusiness: "",
    numberOfOutlets: "",
    annualTurnover: "",
    buyerIndustry: "",
    buyingFrequency: "",
    estimatedAnnualPurchaseValue: "",
    primaryProductInterest: "",
    secondaryProductCategories: [],
    specificProductRequirements: "",
    estimatedPurchaseVolume: "",
    budgetRange: "",
    purchaseFrequency: "",
    businessModelPreference: "",
    b2bMeetInterest: "Yes",
    interestedInImporting: "No",
    interestedInExporting: "No",
    preferredSupplierRegion: [],
    preferredState: [],
    preferredSupplierType: [],
    preferredCompanySize: "",
    purchaseTimeline: "",
    roleInPurchaseDecision: "",
    pricingPreference: "Mid-Range",
    matchmakingInterest: "Yes",
    logisticsRequirements: "",
    preferredPaymentMethods: [],
    companyProfile: null,
    requiredCertifications: [],
    preferredMeetingDate: "",
    preferredTimeSlot: "",
    requirePreScheduledB2B: "Yes",
    preferredMeetingCategories: [],
    preferredExhibitorTypes: [],
    numberOfMeetingsInterested: "",
    meetingObjectives: [],
    preferredBusinessTypes: [],
    meetingRequirements: "",
    preferredMeetingDay: "",
    meetingPriorityLevel: "Medium",
    remarks: "",
    registrationCategory: "",
    registrationFee: "₹0",
    paymentMode: "",
    paymentMethods: [],
    transactionId: "",
    paymentProof: null,
    otherBusinessType: "",
    consentTerms: true,
    consentPaymentValid: true,
    consentMatchedExhibitors: true,
};


const inputClass = "w-full h-9 px-3 py-0 rounded-[2px] border border-slate-400 bg-white text-left text-[12px] font-medium text-slate-900 outline-none shadow-none transition-all ring-offset-background focus:border-[#23471d] focus:ring-[#23471d]/10 placeholder:text-slate-400 font-sans";
const textareaClass = "w-full px-3 py-2 rounded-[2px] border border-slate-400 bg-white text-left text-[12px] font-medium text-slate-900 outline-none shadow-none transition-all ring-offset-background focus:border-[#23471d] focus:ring-[#23471d]/10 placeholder:text-slate-400 font-sans resize-y";
const selectClass = "w-full h-9 px-3 py-0 rounded-[2px] border border-slate-400 bg-white text-left text-[12px] font-medium text-slate-900 outline-none shadow-none transition-all ring-offset-background focus:border-[#23471d] focus:ring-[#23471d]/10 placeholder:text-slate-400 font-sans appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364758b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-8";

const labelClass = "text-[12px] font-semibold text-slate-900 mb-1 block text-left font-sans";
const sectionTitleClass = "text-[13px] font-black text-[#23471d] pb-1 border-b border-emerald-500/20 flex items-center gap-1.5 mb-3 uppercase tracking-tight font-sans";

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const getPackageGroup = (pkg) => {
    if (pkg?.category) return pkg.category;
    const name = (pkg?.name || "").toLowerCase();
    return name.includes("membership") ? "Membership" : "Pass";
};

const ErrorText = ({ message }) =>
    message ? <p className="mt-1 text-xs font-medium text-red-600">{message}</p> : null;

const SectionTitle = ({ icon: Icon, title }) => (
    <h3 className={sectionTitleClass}>
        <Icon className="h-4 w-4 text-[#d26019]" />
        {title}
    </h3>
);

const Field = ({ label, name, error, required, children, hint, className = "" }) => (
    <div className={className} data-field={name}>
        <label className={labelClass} htmlFor={name}>
            {label}
            {required ? <span className="text-red-500"> *</span> : null}
        </label>
        {children}
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
        <ErrorText message={error} />
    </div>
);

const PaymentMethodCard = ({ method, selected, onToggle }) => {
    const Icon = method.icon;
    return (
        <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${selected ? "border-[#23471d] bg-[#23471d]/5" : "border-slate-200 bg-white hover:border-[#23471d]/40"}`}>
            <input type="checkbox" checked={selected} onChange={() => onToggle(method.id)} className="h-5 w-5 rounded border-slate-300 text-[#23471d] focus:ring-[#23471d]" />
            <div className={`rounded-full p-2 ${selected ? "bg-[#23471d]/10" : "bg-slate-100"}`}>
                <Icon className={`h-5 w-5 ${selected ? "text-[#23471d]" : "text-slate-500"}`} />
            </div>
            <div className="flex-1">
                <p className={`font-bold ${selected ? "text-[#23471d]" : "text-slate-700"}`}>{method.label}</p>
                <p className="text-xs text-slate-500">{method.description}</p>
            </div>
            {selected && <CheckCircle2 className="h-5 w-5 text-[#23471d]" />}
        </label>
    );
};

const PackageCard = ({ pkg, selected, onSelect, disabled }) => {
    const colorMap = {
        blue: { accent: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600", surface: "bg-blue-50" },
        yellow: { accent: "text-amber-700", border: "border-amber-200", badge: "bg-amber-500", surface: "bg-amber-50" },
        green: { accent: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-600", surface: "bg-emerald-50" },
        red: { accent: "text-red-700", border: "border-red-200", badge: "bg-red-600", surface: "bg-red-50" },
    };
    const theme = colorMap[pkg.color] || colorMap.blue;
    const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];

    return (
        <button
            type="button"
            onClick={() => !disabled && onSelect(pkg)}
            disabled={disabled}
            className={`relative flex h-full flex-col rounded-xl border-2 p-5 text-left transition ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${selected ? "border-[#23471d] bg-white shadow-xl shadow-[#23471d]/10 ring-4 ring-[#23471d]/5" : "border-slate-200 bg-white hover:border-[#23471d]/40 hover:shadow-lg"}`}
        >
            {pkg.badge && <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white ${theme.badge}`}>{pkg.badge}</span>}
            <div className="mb-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{getPackageGroup(pkg)}</p>
                <h4 className="mt-2 text-lg font-black text-slate-900">{pkg.name}</h4>
                <p className="mt-2 text-2xl font-black text-[#23471d]">{formatCurrency(pkg.price)}</p>
                {pkg.tagline && <p className={`mt-2 text-xs font-bold uppercase ${theme.accent}`}>{pkg.tagline}</p>}
            </div>
            <div className="flex-1 space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">{pkg.description || "Curated access to buyer-seller interactions and relevant event support."}</p>
                {benefits.length > 0 && (
                    <div className={`rounded-xl border p-3 ${theme.border} ${theme.surface}`}>
                        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Package Benefits</p>
                        <ul className="space-y-2 text-sm text-slate-700">
                            {benefits.slice(0, 5).map((benefit, index) => (
                                <li key={`${pkg.name}-benefit-${index}`} className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Why Choose This</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{pkg.whyChoose || "Useful for buyers who want curated supplier discovery and business networking."}</p>
                </div>
            </div>
            <div className={`mt-5 rounded-lg px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] transition ${selected ? "bg-[#23471d] text-white" : disabled ? "bg-slate-200 text-slate-400" : "bg-slate-100 text-slate-600 group-hover:bg-[#23471d]"}`}>
                {selected ? "Selected Package" : (disabled ? "Complete Form First" : (pkg.cta || "Select Package"))}
            </div>
        </button>
    );
};

const staticGroups = [
    { title: 'Trade & Distribution', icon: <Store size={14} />, items: ['Distributor', 'Super Distributor', 'Wholesaler', 'Retailer (Single Store)', 'Retail Chain / Multi-Store', 'Modern Trade Buyer'] },
    { title: 'Manufacturing & Business', icon: <Factory size={14} />, items: ['Manufacturer', 'Private Label Buyer', 'Franchise Seeker', 'Investor'] },
    { title: 'International Trade', icon: <Globe size={14} />, items: ['Importer', 'Exporter', 'International Buying Agent'] },
    { title: 'Online & Digital', icon: <Laptop size={14} />, items: ['E-commerce Seller', 'D2C Brand Owner'] },
    { title: 'Healthcare & Medical', icon: <HeartPulse size={14} />, items: ['Hospital / Clinic', 'Doctor / Medical Practitioner', 'Pharmacy / Chemist', 'Diagnostic Center'] },
    { title: 'Wellness & Lifestyle', icon: <Leaf size={14} />, items: ['Spa / Salon Owner', 'Wellness Center', 'Gym / Fitness Center', 'Yoga Studio', 'Nutritionist / Dietician'] },
    { title: 'Hospitality & Institutional', icon: <Hotel size={14} />, items: ['Wellness Resort / Hospitality', 'Hotel / Resort', 'Corporate Buyer (Procurement / HR)', 'Government / PSU', 'NGO / Trust'] },
    { title: 'Professionals & Others', icon: <Briefcase size={14} />, items: ['Consultant / Advisor', 'Startup Founder', 'Student / Researcher', 'Other (Please Specify)'] }
];

const BuyerRegistration = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState(FALLBACK_CONFIG);
    const [heroData, setHeroData] = useState(null);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState({});
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingLocations, setLoadingLocations] = useState({ states: false, cities: false });
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [packageView, setPackageView] = useState("Pass");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedRegistrationId, setSubmittedRegistrationId] = useState("");
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
    const [canSelectPackage, setCanSelectPackage] = useState(false);
    const [openRoleGroup, setOpenRoleGroup] = useState(null);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const roleDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
                setIsRoleDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const normalizedConfig = useMemo(() => ({
        ...FALLBACK_CONFIG,
        ...(config || {}),
        packages: Array.isArray(config?.packages) ? config.packages : [],
    }), [config]);

    const normalizedPackages = useMemo(() =>
        normalizedConfig.packages.map((pkg) => ({
            ...pkg,
            category: getPackageGroup(pkg),
            benefits: Array.isArray(pkg.benefits) ? pkg.benefits : [],
        })), [normalizedConfig.packages]);

    const passPackages = useMemo(() => normalizedPackages.filter((pkg) => pkg.category === "Pass"), [normalizedPackages]);
    const membershipPackages = useMemo(() => normalizedPackages.filter((pkg) => pkg.category === "Membership"), [normalizedPackages]);

    const heroImage = heroData?.backgroundImage ? (heroData.backgroundImage.startsWith("http") ? heroData.backgroundImage : `${SERVER_URL}${heroData.backgroundImage}`) : "";

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingPage(true);
            const [heroResult, countryResult, configResult] = await Promise.allSettled([
                heroBackgroundApi.getByPage("Registration / Buyer Registration"),
                crmApi.getCountries(),
                buyerRegistrationApi.getConfig(),
            ]);
            if (heroResult.status === "fulfilled") setHeroData(heroResult.value);
            if (countryResult.status === "fulfilled") setCountries(Array.isArray(countryResult.value) ? countryResult.value : []);
            if (configResult.status === "fulfilled") {
                const payload = configResult.value?.data || configResult.value;
                if (payload) setConfig((prev) => ({ ...prev, ...payload }));
            }
            setLoadingPage(false);
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            if (!formData.country) { setStates([]); setCities([]); return; }
            const selectedCountry = countries.find((item) => item?.name?.trim().toLowerCase() === formData.country.trim().toLowerCase());
            if (!selectedCountry?.countryCode) { setStates([]); return; }
            setLoadingLocations((prev) => ({ ...prev, states: true }));
            try {
                const nextStates = await crmApi.getStates(selectedCountry.countryCode);
                setStates(Array.isArray(nextStates) ? nextStates : []);
            } catch (error) { console.error("Error fetching states:", error); setStates([]); }
            finally { setLoadingLocations((prev) => ({ ...prev, states: false })); }
        };
        fetchStates();
    }, [formData.country, countries]);

    useEffect(() => {
        const fetchCities = async () => {
            if (!formData.stateProvince) { setCities([]); return; }
            const selectedState = states.find((item) => item?.name?.trim().toLowerCase() === formData.stateProvince.trim().toLowerCase());
            if (!selectedState?.stateCode) { setCities([]); return; }
            setLoadingLocations((prev) => ({ ...prev, cities: true }));
            try {
                const nextCities = await crmApi.getCities(selectedState.stateCode);
                setCities(Array.isArray(nextCities) ? nextCities : []);
            } catch (error) { console.error("Error fetching cities:", error); setCities([]); }
            finally { setLoadingLocations((prev) => ({ ...prev, cities: false })); }
        };
        fetchCities();
    }, [formData.stateProvince, states]);

    const validateField = (name, rawValue = formData[name]) => {
        const value = rawValue;
        const requiredFields = [
            "fullName", "designation", "companyName", "businessType",
            "mobileNumber", "emailAddress", "alternateNumber",
            "registeredAddress", "pinCode", "country", "stateProvince", "city",
            "companyFirmName", "basicBusinessType", "yearOfEstablishment",
            "natureOfBusiness", "yearsInBusiness", "numberOfOutlets", "annualTurnover",
            "buyerIndustry", "primaryProductInterest", "estimatedAnnualPurchaseValue",
            "purchaseTimeline", "roleInPurchaseDecision", "matchmakingInterest"
        ];

        if (formData.requirePreScheduledB2B === 'Yes') {
            requiredFields.push('preferredMeetingDay', 'preferredTimeSlot');
        }

        if (requiredFields.includes(name) && !String(value || "").trim()) return "This field is required";
        if (name === "fullName" && value && !/^[A-Za-z\s.'-]+$/.test(String(value).trim())) return "Use letters and spaces only";
        if (name === "emailAddress" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) return "Enter a valid email address";
        if (["mobileNumber", "alternateNumber"].includes(name) && value && !/^\d{10}$/.test(String(value))) return "Enter exactly 10 digits";
        if (name === "pinCode" && value && !/^\d{6}$/.test(String(value))) return "Enter a valid 6-digit pin code";
        return "";
    };

    const scrollToField = (fieldName) => {
        const target = document.querySelector(`[data-field="${fieldName}"]`) || document.querySelector(`[name="${fieldName}"]`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const validateForm = ({ skipPackage = false } = {}) => {
        const nextErrors = {};
        const fieldsToValidate = [
            "fullName", "designation", "companyName", "businessType",
            "mobileNumber", "alternateNumber", "emailAddress",
            "registeredAddress", "pinCode", "country", "stateProvince", "city",
            "companyFirmName", "basicBusinessType", "yearOfEstablishment",
            "natureOfBusiness", "yearsInBusiness", "numberOfOutlets", "annualTurnover",
            "primaryProductInterest", "estimatedAnnualPurchaseValue",
            "purchaseTimeline", "roleInPurchaseDecision", "matchmakingInterest"
        ];

        fieldsToValidate.forEach((fieldName) => {
            const errorMessage = validateField(fieldName);
            if (errorMessage) nextErrors[fieldName] = errorMessage;
        });

        if (!formData.preferredSupplierRegion.length) nextErrors.preferredSupplierRegion = "Select at least one region";
        if (!formData.preferredSupplierType.length) nextErrors.preferredSupplierType = "Select at least one supplier type";

        if (formData.requirePreScheduledB2B === 'Yes') {
            if (!formData.preferredMeetingCategories.length) nextErrors.preferredMeetingCategories = "Select at least one category";
            if (!formData.meetingObjectives.length) nextErrors.meetingObjectives = "Select at least one objective";
            if (!formData.preferredBusinessTypes.length) nextErrors.preferredBusinessTypes = "Select business types";
        }

        if (!skipPackage && !selectedPackage?.name) nextErrors.registrationCategory = "Please select a registration package";

        setErrors(nextErrors);
        const isValid = Object.keys(nextErrors).length === 0;

        const basicFieldsValid = fieldsToValidate.every(fieldName => !nextErrors[fieldName]) &&
            formData.preferredSupplierRegion.length > 0 &&
            formData.preferredSupplierType.length > 0;

        setCanSelectPackage(basicFieldsValid);

        return { isValid, nextErrors };
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        let nextValue = value;
        if (name === "mobileNumber" || name === "alternateNumber") nextValue = value.replace(/\D/g, "").slice(0, 10);
        if (name === "pinCode") nextValue = value.replace(/\D/g, "").slice(0, 6);
        if (name === "fullName") nextValue = value.replace(/[^A-Za-z\s.'-]/g, "");

        setFormData((prev) => {
            const nextState = { ...prev, [name]: nextValue };
            if (name === "companyName") nextState.companyFirmName = nextValue;
            if (name === "companyFirmName") nextState.companyName = nextValue;
            return nextState;
        });

        setErrors((prev) => {
            const nextErrors = { ...prev, [name]: validateField(name, nextValue) };
            if (name === "companyName") nextErrors.companyFirmName = validateField("companyFirmName", nextValue);
            if (name === "companyFirmName") nextErrors.companyName = validateField("companyName", nextValue);
            return nextErrors;
        });

        setTimeout(() => validateForm({ skipPackage: true }), 0);
    };

    const handleSelectChange = (name, value) => {
        if (name === "country") {
            setFormData((prev) => ({ ...prev, country: value, stateProvince: "", city: "" }));
            setErrors((prev) => ({ ...prev, country: validateField("country", value), stateProvince: "", city: "" }));
        } else if (name === "stateProvince") {
            setFormData((prev) => ({ ...prev, stateProvince: value, city: "" }));
            setErrors((prev) => ({ ...prev, stateProvince: validateField("stateProvince", value), city: "" }));
        } else {
            setFormData((prev) => {
                const nextState = { ...prev, [name]: value };
                if (name === "businessType") nextState.basicBusinessType = value;
                if (name === "basicBusinessType") nextState.businessType = value;
                return nextState;
            });
            setErrors((prev) => {
                const nextErrors = { ...prev, [name]: validateField(name, value) };
                if (name === "businessType") nextErrors.basicBusinessType = validateField("basicBusinessType", value);
                if (name === "basicBusinessType") nextErrors.businessType = validateField("businessType", value);
                return nextErrors;
            });
        }
        setTimeout(() => validateForm({ skipPackage: true }), 0);
    };

    const toggleArrayValue = (name, option) => {
        setFormData((prev) => {
            const currentValues = Array.isArray(prev[name]) ? prev[name] : [];
            const nextValues = currentValues.includes(option) ? currentValues.filter((item) => item !== option) : [...currentValues, option];
            return { ...prev, [name]: nextValues };
        });
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setTimeout(() => validateForm({ skipPackage: true }), 0);
    };

    const togglePaymentMethod = (methodId) => {
        setSelectedPaymentMethods(prev => prev.includes(methodId) ? prev.filter(m => m !== methodId) : [...prev, methodId]);
    };

    const handleFileChange = (event) => {
        const { name, files } = event.target;
        if (files && files[0]) {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handlePackageSelect = (pkg) => {
        if (!canSelectPackage) {
            toast.error("Please complete all required fields before selecting a package.");
            return;
        }
        setSelectedPackage(pkg);
        setFormData((prev) => ({ ...prev, registrationCategory: pkg.name, registrationFee: formatCurrency(pkg.price) }));
        setErrors((prev) => ({ ...prev, registrationCategory: "" }));
    };

    const buildSubmissionPayload = () => {
        const fd = new FormData();

        const requiredTextFields = {
            fullName: formData.fullName,
            designation: formData.designation,
            companyName: formData.companyName,
            businessType: formData.businessType,
            mobileNumber: formData.mobileNumber,
            alternateNumber: formData.alternateNumber,
            emailAddress: formData.emailAddress,
            registeredAddress: formData.registeredAddress,
            pinCode: formData.pinCode,
            country: formData.country,
            stateProvince: formData.stateProvince,
            city: formData.city,
            companyFirmName: formData.companyFirmName,
            basicBusinessType: formData.basicBusinessType,
            yearOfEstablishment: formData.yearOfEstablishment,
            natureOfBusiness: formData.natureOfBusiness,
            yearsInBusiness: formData.yearsInBusiness,
            numberOfOutlets: formData.numberOfOutlets,
            annualTurnover: formData.annualTurnover,
            buyerIndustry: formData.buyerIndustry,
            primaryProductInterest: formData.primaryProductInterest,
            estimatedAnnualPurchaseValue: formData.estimatedAnnualPurchaseValue,
            purchaseTimeline: formData.purchaseTimeline,
            roleInPurchaseDecision: formData.roleInPurchaseDecision,
            matchmakingInterest: formData.matchmakingInterest,
        };

        if (formData.requirePreScheduledB2B === 'Yes') {
            requiredTextFields.preferredMeetingDay = formData.preferredMeetingDay;
            requiredTextFields.preferredTimeSlot = formData.preferredTimeSlot;
        }

        Object.entries(requiredTextFields).forEach(([key, value]) => {
            fd.append(key, value || "");
        });

        const optionalFields = {
            brandName: formData.brandName || "",
            website: formData.website || "",
            preferredPaymentMethods: JSON.stringify(formData.preferredPaymentMethods || []),
            gstNumber: formData.gstNumber || "",
            panNumber: formData.panNumber || "",
            secondaryProductCategories: JSON.stringify(formData.secondaryProductCategories || []),
            specificProductRequirements: formData.specificProductRequirements || "",
            estimatedPurchaseVolume: formData.estimatedPurchaseVolume || "",
            budgetRange: formData.budgetRange || "",
            purchaseFrequency: formData.purchaseFrequency || "",
            businessModelPreference: formData.businessModelPreference || "",
            interestedInImporting: formData.interestedInImporting || "No",
            interestedInExporting: formData.interestedInExporting || "No",
            preferredSupplierRegion: JSON.stringify(formData.preferredSupplierRegion || []),
            preferredState: JSON.stringify(formData.preferredState || []),
            preferredSupplierType: JSON.stringify(formData.preferredSupplierType || []),

            preferredCompanySize: formData.preferredCompanySize || "",
            requirePreScheduledB2B: formData.requirePreScheduledB2B,
            meetingPriorityLevel: formData.meetingPriorityLevel,
            pricingPreference: formData.pricingPreference,
            logisticsRequirements: formData.logisticsRequirements || "",
            requiredCertifications: JSON.stringify(formData.requiredCertifications || []),
            remarks: formData.remarks || "",
            transactionId: formData.transactionId || "",
            registrationCategory: selectedPackage?.name || formData.registrationCategory,
            registrationFee: formatCurrency(selectedPackage?.price || 0),
            paymentMode: selectedPaymentMethods.length > 0 ? selectedPaymentMethods.join(", ") : "Pending",
            paymentStatus: "Completed",
            consentTerms: "true",
            consentPaymentValid: "true",
            consentMatchedExhibitors: "true",
            preferredMeetingCategories: JSON.stringify(formData.preferredMeetingCategories || []),
            preferredExhibitorTypes: JSON.stringify(formData.preferredExhibitorTypes || []),
            numberOfMeetingsInterested: formData.numberOfMeetingsInterested || "",
            meetingObjectives: JSON.stringify(formData.meetingObjectives || []),
            preferredBusinessTypes: JSON.stringify(formData.preferredBusinessTypes || []),
            meetingRequirements: formData.meetingRequirements || "",
            buyingFrequency: formData.buyingFrequency || "",
        };

        Object.entries(optionalFields).forEach(([key, value]) => {
            fd.append(key, value);
        });

        if (formData.paymentProof) {
            fd.append("paymentProof", formData.paymentProof);
        }

        selectedPaymentMethods.forEach(method => {
            fd.append("paymentMethods[]", method);
        });

        return fd;
    };

    const handleSubmitRegistration = async () => {
        const { isValid, nextErrors } = validateForm();
        if (!isValid) {
            toast.error("Please fix the remaining form issues before submitting.");
            const firstErrorField = Object.keys(nextErrors)[0];
            if (firstErrorField) scrollToField(firstErrorField);
            return;
        }
        if (!selectedPackage) {
            toast.error("Please select a package first.");
            scrollToField("registrationCategory");
            return;
        }
        if (selectedPaymentMethods.length === 0) {
            toast.error("Please select at least one payment method.");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = buildSubmissionPayload();
            const response = await buyerRegistrationApi.submit(payload);

            if (!response?.success) throw new Error(response?.message || "Registration could not be completed.");

            setSubmitted(true);
            setSubmittedRegistrationId(response?.data?._id || response?.data?.id || response?._id || response?.id || "");
            toast.success("Buyer registration completed successfully!");

        } catch (error) {
            console.error("Registration error details:", error);
            let errorMessage = "Unable to complete registration. Please try again.";
            if (error.response?.data?.message) errorMessage = error.response.data.message;
            else if (error.response?.data?.error) errorMessage = error.response.data.error;
            else if (error.message) errorMessage = error.message;
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = (shouldScroll = true) => {
        setFormData(INITIAL_FORM_STATE);
        setErrors({});
        setStates([]);
        setCities([]);
        setSelectedPackage(null);
        setSubmitted(false);
        setSubmittedRegistrationId("");
        setSelectedPaymentMethods([]);
        setCanSelectPackage(false);
        setPackageView(passPackages.length ? "Pass" : "Membership");
        if (shouldScroll) window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        if (!passPackages.length && membershipPackages.length) setPackageView("Membership");
    }, [passPackages.length, membershipPackages.length]);

    if (loadingPage) {
        return (
            <div className="mt-6 flex min-h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-[#23471d]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading buyer registration form
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-6 pb-10">
            <PageHeader title="Buyer Registration" description="Create a buyer registration by completing the form and selecting a package.">
                <Link to="/buyer-list" className="rounded-[2px] border border-slate-300 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#23471d] hover:text-[#23471d]">View Registrations</Link>
            </PageHeader>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative">
                    {heroImage ? <img src={heroImage} alt={heroData?.imageAltText || "Buyer registration"} className="h-[280px] w-full object-cover" /> : <div className="h-[280px] w-full bg-[radial-gradient(circle_at_top_left,_#f0fdf4,_#dcfce7_35%,_#ffffff_78%)]" />}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/55 to-[#23471d]/35" />
                    <div className="absolute inset-0 flex items-end">
                        <div className="max-w-4xl p-8 text-white md:p-10">
                            <div className="mb-4 flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-[0.18em]">
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Direct Buyer Flow</span>
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Simple Registration</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase leading-tight md:text-4xl">{heroData?.title || "Buyer Registration Desk"}</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/90 md:text-base">{heroData?.shortDescription || heroData?.heading || "Complete buyer verification, capture sourcing preferences, and finalize the correct pass or membership in one clean workflow."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {submitted ? (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"><CheckCircle2 className="h-7 w-7" /></div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Registration Completed</p>
                                <h3 className="mt-2 text-2xl font-black text-slate-900">Buyer registration submitted successfully</h3>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">The selected buyer package has been saved successfully. You can create another registration or review the full buyer registration list.</p>
                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    <div className="rounded-2xl border border-white/80 bg-white p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Package</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedPackage?.name || "N/A"}</p></div>
                                    <div className="rounded-2xl border border-white/80 bg-white p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Registration ID</p><p className="mt-2 break-all text-sm font-bold text-slate-900">{submittedRegistrationId || "Saved successfully"}</p></div>
                                </div>
                                {selectedPaymentMethods.length > 0 && <div className="mt-3 rounded-2xl border border-white/80 bg-white p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Payment Methods Selected</p><p className="mt-2 text-sm font-bold text-slate-900">{selectedPaymentMethods.join(", ")}</p></div>}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={() => handleReset(true)} className="rounded-[2px] border border-slate-300 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#23471d] hover:text-[#23471d]">New Registration</button>
                            <Link to="/buyer-registrations" className="rounded-[2px] bg-[#23471d] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#1a3516]">Go to Buyer List</Link>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitRegistration(); }} className="space-y-8 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] md:p-8">

                    {/* SECTION 1: Personal & Company Information - 5 FIELDS */}
                    <section>
                        <SectionTitle icon={UserRound} title="Personal & Company Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Full Name *" name="fullName" required error={errors.fullName}>
                                <input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="As per ID Proof" className={inputClass} />
                            </Field>
                            <Field label="Designation *" name="designation" required error={errors.designation}>
                                <input id="designation" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Current Position" className={inputClass} />
                            </Field>
                            <Field label="Company Name *" name="companyName" required error={errors.companyName}>
                                <input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Full Registered Name" className={inputClass} />
                            </Field>
                            <Field label={<span>Mobile Number * <div className="inline-flex w-32 overflow-hidden align-middle ml-2 items-center h-4 relative"><motion.span initial={{ x: "100%" }} animate={{ x: "-100%" }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="text-red-500 text-[10px] uppercase font-semibold tracking-wide whitespace-nowrap absolute">Our team will contact you</motion.span></div></span>} name="mobileNumber" required error={errors.mobileNumber}>
                                <input id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit mobile" className={inputClass} maxLength={10} />
                            </Field>
                            <Field label="Alternate Number *" name="alternateNumber" required error={errors.alternateNumber}>
                                <input id="alternateNumber" name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} placeholder="10-digit alternate" className={inputClass} maxLength={10} />
                            </Field>
                            <Field label="Email Address *" name="emailAddress" required error={errors.emailAddress}>
                                <input id="emailAddress" name="emailAddress" type="email" value={formData.emailAddress} onChange={handleInputChange} placeholder="Work Email" className={inputClass} />
                            </Field>
                            <Field label="Business Role *" name="businessType" required error={errors.businessType}>
                                {!formData.businessType.toString().toLowerCase().includes('other') ? (
                                    <div className="relative" ref={roleDropdownRef}>
                                        <button type="button" onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)} className={`${inputClass} flex items-center justify-between text-left`}>
                                            <span className={formData.businessType ? "text-slate-900" : "text-slate-400"}>{formData.businessType || "Select Type"}</span>
                                            <ChevronsUpDown className="h-3 w-3 text-slate-400" />
                                        </button>
                                        {isRoleDropdownOpen && (
                                            <div className="absolute left-0 right-0 z-[100] mt-1 max-h-[300px] overflow-y-auto rounded-[2px] border border-slate-200 bg-white shadow-xl">
                                                {staticGroups.map((group) => (
                                                    <div key={group.title} className="border-b border-slate-100 last:border-0">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); setOpenRoleGroup(openRoleGroup === group.title ? null : group.title); }} className="flex w-full items-center justify-between bg-slate-50/50 px-3 py-2 text-[10px] font-bold text-slate-700 transition hover:bg-slate-50">
                                                            <div className="flex items-center gap-2"><span className="text-[#23471d]/60">{group.icon}</span>{group.title}</div>
                                                            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${openRoleGroup === group.title ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {openRoleGroup === group.title && (
                                                            <div className="bg-white py-1">
                                                                {group.items.map((item) => (
                                                                    <button key={item} type="button" onClick={() => { handleSelectChange('businessType', item); setIsRoleDropdownOpen(false); }} className={`flex w-full items-center px-8 py-1.5 text-[10px] font-medium transition hover:bg-[#23471d]/5 hover:text-[#23471d] ${formData.businessType === item ? 'bg-[#23471d]/5 text-[#23471d]' : 'text-slate-600'}`}>{item}</button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input name="otherBusinessType" value={formData.otherBusinessType} onChange={handleInputChange} placeholder="Specify Business Role" className={`${inputClass} pr-8`} required autoFocus />
                                        <button type="button" onClick={() => handleSelectChange('businessType', '')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                    </div>
                                )}
                            </Field>
                            <Field label="Website" name="website">
                                <input id="website" name="website" type="url" value={formData.website} onChange={handleInputChange} placeholder="https://..." className={inputClass} />
                            </Field>
                        </div>
                    </section>

                    {/* SECTION 2: Registered Address - 5 FIELDS */}
                    <section>
                        <SectionTitle icon={MapPin} title="Registered Address" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Country *" name="country" required error={errors.country}>
                                <select id="country" name="country" value={formData.country} onChange={(e) => handleSelectChange("country", e.target.value)} className={selectClass}>
                                    <option value="">Select country</option>
                                    {countries.map((item) => (<option key={item._id || item.name} value={item.name}>{item.name}</option>))}
                                </select>
                            </Field>
                            <Field label="State/Province *" name="stateProvince" required error={errors.stateProvince}>
                                <select id="stateProvince" name="stateProvince" value={formData.stateProvince} onChange={(e) => handleSelectChange("stateProvince", e.target.value)} className={selectClass} disabled={loadingLocations.states}>
                                    <option value="">{loadingLocations.states ? "Loading..." : "Select State"}</option>
                                    {states.map((item) => (<option key={item._id || item.name} value={item.name}>{item.name}</option>))}
                                </select>
                            </Field>
                            <Field label="City *" name="city" required error={errors.city}>
                                <select id="city" name="city" value={formData.city} onChange={(e) => handleSelectChange("city", e.target.value)} className={selectClass} disabled={!formData.stateProvince || loadingLocations.cities}>
                                    <option value="">{loadingLocations.cities ? "Loading..." : "Select City"}</option>
                                    {cities.map((item) => (<option key={item._id || item.name} value={item.name}>{item.name}</option>))}
                                </select>
                            </Field>
                            <Field label="Pin Code *" name="pinCode" required error={errors.pinCode}>
                                <input id="pinCode" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="Postal Code" className={inputClass} maxLength={6} />
                            </Field>
                            <Field label="Registered Address *" name="registeredAddress" required error={errors.registeredAddress} className="xl:col-span-5">
                                <textarea id="registeredAddress" name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} placeholder="Full Corporate Address" className={`${textareaClass} min-h-[36px] h-9 resize-none`} rows={1} />
                            </Field>
                        </div>
                    </section>

                    {/* SECTION 3: Company Business Profile - 5 FIELDS */}
                    <section>
                        <SectionTitle icon={Building2} title="Company Business Profile" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Company/Firm Name *" name="companyFirmName" required error={errors.companyFirmName}>
                                <input id="companyFirmName" name="companyFirmName" value={formData.companyFirmName} onChange={handleInputChange} placeholder="Company / Firm Name" className={inputClass} />
                            </Field>
                            <Field label="Brand Name" name="brandName">
                                <input id="brandName" name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="Brand Name" className={inputClass} />
                            </Field>
                            <Field label="Business Type *" name="basicBusinessType" required error={errors.basicBusinessType}>
                                <select id="basicBusinessType" name="basicBusinessType" value={formData.basicBusinessType} onChange={(e) => handleSelectChange("basicBusinessType", e.target.value)} className={selectClass}>
                                    <option value="">Select Type</option>
                                    {['Proprietorship', 'Partnership', 'Pvt Ltd', 'LLP', 'Others'].map((t) => (<option key={t} value={t}>{t}</option>))}
                                </select>
                            </Field>
                            <Field label="Year of Est.*" name="yearOfEstablishment" required error={errors.yearOfEstablishment}>
                                <input id="yearOfEstablishment" name="yearOfEstablishment" value={formData.yearOfEstablishment} onChange={handleInputChange} placeholder="e.g. 2010" className={inputClass} />
                            </Field>
                            <Field label="GST Number" name="gstNumber">
                                <input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="GST Number" className={inputClass} />
                            </Field>
                            <Field label="PAN Number" name="panNumber">
                                <input id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleInputChange} placeholder="PAN Number" className={inputClass} />
                            </Field>
                            <Field label="Buyer Industry *" name="buyerIndustry" required error={errors.buyerIndustry}>
                                <select id="buyerIndustry" name="buyerIndustry" value={formData.buyerIndustry} onChange={(e) => handleSelectChange("buyerIndustry", e.target.value)} className={selectClass}>
                                    <option value="">Choose Industry</option>
                                    {normalizedConfig.primaryProductInterests.map((i) => (<option key={i} value={i}>{i}</option>))}
                                </select>
                            </Field>
                        </div>
                    </section>

                    {/* SECTION 4: Business Profile Details - 5 FIELDS */}
                    <section>
                        <SectionTitle icon={FileText} title="Business Profile Details" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Nature of Business *" name="natureOfBusiness" required error={errors.natureOfBusiness}>
                                <input id="natureOfBusiness" name="natureOfBusiness" value={formData.natureOfBusiness} onChange={handleInputChange} placeholder="Short description" className={inputClass} />
                            </Field>
                            <Field label="Years in Business *" name="yearsInBusiness" required error={errors.yearsInBusiness}>
                                <input id="yearsInBusiness" name="yearsInBusiness" type="number" min="0" value={formData.yearsInBusiness} onChange={handleInputChange} placeholder="e.g. 10" className={inputClass} />
                            </Field>
                            <Field label="No. of Outlets *" name="numberOfOutlets" required error={errors.numberOfOutlets}>
                                <input id="numberOfOutlets" name="numberOfOutlets" type="number" min="1" value={formData.numberOfOutlets} onChange={handleInputChange} placeholder="e.g. 5" className={inputClass} />
                            </Field>
                            <Field label="Annual Turnover *" name="annualTurnover" required error={errors.annualTurnover}>
                                <select id="annualTurnover" name="annualTurnover" value={formData.annualTurnover} onChange={(e) => handleSelectChange("annualTurnover", e.target.value)} className={selectClass}>
                                    <option value="">Select Range</option>
                                    {(normalizedConfig.annualTurnoverRanges || ['Below 50 Lakhs', '50L – 2 Cr', '2 – 10 Cr', '10 Cr+']).map((r) => (<option key={r} value={r}>{r}</option>))}
                                </select>
                            </Field>
                        </div>
                    </section>

                    {/* SECTION 5: Sourcing & Purchase Intent - Primary Fields */}
                    <section>
                        <SectionTitle icon={Globe2} title="Sourcing & Purchase Intent" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Primary Product Interest *" name="primaryProductInterest" required error={errors.primaryProductInterest}>
                                <select id="primaryProductInterest" name="primaryProductInterest" value={formData.primaryProductInterest} onChange={(e) => handleSelectChange("primaryProductInterest", e.target.value)} className={selectClass}>
                                    <option value="">Choose Interest</option>
                                    {normalizedConfig.primaryProductInterests.map((item) => (<option key={item} value={item}>{item}</option>))}
                                </select>
                            </Field>
                            <Field label="Secondary Categories">
                                <MultiSelectDropdown options={normalizedConfig.secondaryProductCategories} selected={formData.secondaryProductCategories} onChange={(val) => setFormData(prev => ({ ...prev, secondaryProductCategories: val }))} placeholder="Select categories..." accentColor="emerald" />
                            </Field>
                            <Field label="Importing Interest?" name="interestedInImporting">
                                <select id="interestedInImporting" name="interestedInImporting" value={formData.interestedInImporting} onChange={(e) => handleSelectChange("interestedInImporting", e.target.value)} className={selectClass}>
                                    {['Yes', 'No'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </Field>
                            <Field label="Export Interest?" name="interestedInExporting">
                                <select id="interestedInExporting" name="interestedInExporting" value={formData.interestedInExporting} onChange={(e) => handleSelectChange("interestedInExporting", e.target.value)} className={selectClass}>
                                    {['Yes', 'No'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </Field>
                            <Field label="Business Model" name="businessModelPreference">
                                <select id="businessModelPreference" name="businessModelPreference" value={formData.businessModelPreference} onChange={(e) => handleSelectChange("businessModelPreference", e.target.value)} className={selectClass}>
                                    <option value="">Select Model</option>
                                    {normalizedConfig.businessModelOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
                                </select>
                            </Field>
                            <Field label="Est. Monthly Purchase" name="estimatedPurchaseVolume">
                                <input id="estimatedPurchaseVolume" name="estimatedPurchaseVolume" value={formData.estimatedPurchaseVolume} onChange={handleInputChange} placeholder="e.g. 5000 Units" className={inputClass} />
                            </Field>
                            <Field label="Budget Range" name="budgetRange">
                                <select id="budgetRange" name="budgetRange" value={formData.budgetRange} onChange={(e) => handleSelectChange("budgetRange", e.target.value)} className={selectClass}>
                                    <option value="">Choose Budget</option>
                                    {normalizedConfig.budgetRanges.map((item) => (<option key={item} value={item}>{item}</option>))}
                                </select>
                            </Field>
                            <Field label="Buying Frequency *" name="buyingFrequency" required error={errors.buyingFrequency}>
                                <select id="buyingFrequency" name="buyingFrequency" value={formData.buyingFrequency} onChange={(e) => handleSelectChange("buyingFrequency", e.target.value)} className={selectClass}>
                                    <option value="">Select</option>
                                    {(normalizedConfig.buyingFrequencies || ['One-time', 'Monthly', 'Quarterly', 'Long-term']).map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </Field>
                            <Field label="Est. Annual Purchase *" name="estimatedAnnualPurchaseValue" required error={errors.estimatedAnnualPurchaseValue}>
                                <select id="estimatedAnnualPurchaseValue" name="estimatedAnnualPurchaseValue" value={formData.estimatedAnnualPurchaseValue} onChange={(e) => handleSelectChange("estimatedAnnualPurchaseValue", e.target.value)} className={selectClass}>
                                    <option value="">Select</option>
                                    {(normalizedConfig.annualPurchaseValueRanges || ['Below 10 Lakhs', '10-50 Lakhs', '50 Lakhs - 1 Crore', '1-5 Crore', '5+ Crore']).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </Field>
                            <Field label="Purchase Timeline *" name="purchaseTimeline" required error={errors.purchaseTimeline}>
                                <select id="purchaseTimeline" name="purchaseTimeline" value={formData.purchaseTimeline} onChange={(e) => handleSelectChange("purchaseTimeline", e.target.value)} className={selectClass}>
                                    <option value="">Select</option>
                                    {(normalizedConfig.purchaseTimelines || ['Immediate', '1–3 Months', '3–6 Months', 'Exploring']).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field label="Matchmaking Interest *" name="matchmakingInterest" required error={errors.matchmakingInterest}>
                                <select id="matchmakingInterest" name="matchmakingInterest" value={formData.matchmakingInterest} onChange={(e) => handleSelectChange("matchmakingInterest", e.target.value)} className={selectClass}>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </Field>
                            <Field label="Role in Purchase *" name="roleInPurchaseDecision" required error={errors.roleInPurchaseDecision}>
                                <select id="roleInPurchaseDecision" name="roleInPurchaseDecision" value={formData.roleInPurchaseDecision} onChange={(e) => handleSelectChange("roleInPurchaseDecision", e.target.value)} className={selectClass}>
                                    <option value="">Select Role</option>
                                    {(normalizedConfig.roles || ['Final Decision Maker', 'Influencer', 'Research Only']).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </Field>
                            <Field label="Specific Requirements" name="specificProductRequirements" className="xl:col-span-5">
                                <textarea id="specificProductRequirements" name="specificProductRequirements" value={formData.specificProductRequirements} onChange={handleInputChange} placeholder="Any custom needs..." className={`${textareaClass} min-h-[36px] h-9 resize-none`} rows={1} />
                            </Field>
                        </div>
                    </section>

                    {/* SECTION 6: Supplier Preference - 5 FIELDS */}
                    <section>
                        <SectionTitle icon={Briefcase} title="Supplier Preference" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <div>
                                <label className={labelClass}>Preferred Region *</label>
                                <MultiSelectDropdown options={normalizedConfig.regions || ['North India', 'South India', 'East India', 'West India', 'Pan India', 'Global']} selected={formData.preferredSupplierRegion} onChange={(val) => { setFormData(prev => ({ ...prev, preferredSupplierRegion: val })); setErrors(prev => ({ ...prev, preferredSupplierRegion: '' })); }} placeholder="Select regions..." error={!!errors.preferredSupplierRegion} accentColor="emerald" />
                                <ErrorText message={errors.preferredSupplierRegion} />
                            </div>
                            <div>
                                <label className={labelClass}>Preferred Supplier Type *</label>
                                <MultiSelectDropdown options={normalizedConfig.supplierTypes || ['Manufacturer', 'Exporter', 'MSME', 'Startup', 'Wholesaler']} selected={formData.preferredSupplierType} onChange={(val) => { setFormData(prev => ({ ...prev, preferredSupplierType: val })); setErrors(prev => ({ ...prev, preferredSupplierType: '' })); }} placeholder="Select types..." error={!!errors.preferredSupplierType} accentColor="emerald" />
                                <ErrorText message={errors.preferredSupplierType} />
                            </div>
                            <div>
                                <label className={labelClass}>Preferred State</label>
                                <MultiSelectDropdown options={states.map(s => s.name)} selected={formData.preferredState} onChange={(val) => setFormData(prev => ({ ...prev, preferredState: val }))} placeholder={states.length === 0 ? "Select country first..." : "Select states..."} accentColor="emerald" />
                            </div>
                            <Field label="Preferred Company Size" name="preferredCompanySize">
                                <select id="preferredCompanySize" name="preferredCompanySize" value={formData.preferredCompanySize} onChange={(e) => handleSelectChange("preferredCompanySize", e.target.value)} className={selectClass}>
                                    <option value="">Select Size</option>
                                    {normalizedConfig.companySizes.map((item) => (<option key={item} value={item}>{item}</option>))}
                                </select>
                            </Field>
                        </div>
                    </section>

                    {/* SECTION 7: Certification & Compliance - 5 FIELDS */}
                    <section>
                        <SectionTitle icon={ShieldCheck} title="Certification & Compliance" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <div>
                                <label className={labelClass}>Required Certifications</label>
                                <MultiSelectDropdown options={normalizedConfig.certificationOptions || ['ISO', 'GMP', 'FDA', 'AYUSH', 'Organic', 'Halal', 'Kosher', 'Others']} selected={formData.requiredCertifications} onChange={(val) => setFormData(prev => ({ ...prev, requiredCertifications: val }))} placeholder="Select certifications..." accentColor="slate" />
                            </div>
                            <Field label="Pricing Preference" name="pricingPreference">
                                <select name="pricingPreference" value={formData.pricingPreference} onChange={(e) => handleSelectChange("pricingPreference", e.target.value)} className={selectClass}>
                                    <option value="Premium">Premium</option>
                                    <option value="Mid-Range">Mid-Range</option>
                                    <option value="Budget">Budget</option>
                                </select>
                            </Field>
                            <div>
                                <label className={labelClass}>Payment Methods</label>
                                <MultiSelectDropdown options={['Letter of Credit (LC)', 'Cash Against Documents (CAD)', 'Bank Transfer (T/T)', 'Open Account', 'Advance Payment']} selected={formData.preferredPaymentMethods} onChange={(val) => setFormData(prev => ({ ...prev, preferredPaymentMethods: val }))} placeholder="Select methods..." accentColor="blue" />
                            </div>
                            <Field label="Company Profile" name="companyProfile">
                                <div className="relative h-9">
                                    <input type="file" id="companyProfile" name="companyProfile" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
                                    <div className={`flex h-full w-full items-center justify-between rounded-[2px] border border-slate-300 bg-white px-3 text-[12px] font-medium ${formData.companyProfile ? "text-[#23471d]" : "text-slate-400"}`}>
                                        <span className="truncate">{formData.companyProfile ? formData.companyProfile.name : "Select file..."}</span>
                                        <FileText className="h-4 w-4 shrink-0" />
                                    </div>
                                </div>
                            </Field>
                            <Field label="Logistics Requirements" name="logisticsRequirements">
                                <input id="logisticsRequirements" name="logisticsRequirements" value={formData.logisticsRequirements} onChange={handleInputChange} placeholder="e.g. Sea freight..." className={inputClass} />
                            </Field>
                        </div>
                    </section>

                    {/* SECTION 8: B2B Meeting Preferences - 5 FIELDS */}
                    <section>
                        <SectionTitle icon={Clock} title="B2B Meeting Preferences" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Pre-scheduled B2B?" name="requirePreScheduledB2B">
                                <select id="requirePreScheduledB2B" name="requirePreScheduledB2B" value={formData.requirePreScheduledB2B} onChange={(e) => handleSelectChange("requirePreScheduledB2B", e.target.value)} className={selectClass}>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </Field>
                            <Field label="Priority Level" name="meetingPriorityLevel">
                                <select id="meetingPriorityLevel" name="meetingPriorityLevel" value={formData.meetingPriorityLevel} onChange={(e) => handleSelectChange("meetingPriorityLevel", e.target.value)} className={selectClass}>
                                    {normalizedConfig.meetingPriorityLevels.map((item) => (<option key={item} value={item}>{item}</option>))}
                                </select>
                            </Field>

                            {formData.requirePreScheduledB2B === 'Yes' && (
                                <>
                                    <div>
                                        <label className={labelClass}>Meeting Categories *</label>
                                        <MultiSelectDropdown options={normalizedConfig.meetingCategoryOptions} selected={formData.preferredMeetingCategories} onChange={(val) => { setFormData(prev => ({ ...prev, preferredMeetingCategories: val })); setErrors(prev => ({ ...prev, preferredMeetingCategories: '' })); }} placeholder="Select..." error={!!errors.preferredMeetingCategories} accentColor="emerald" />
                                        <ErrorText message={errors.preferredMeetingCategories} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Exhibitor Types</label>
                                        <MultiSelectDropdown options={normalizedConfig.exhibitorTypeOptions} selected={formData.preferredExhibitorTypes} onChange={(val) => setFormData(prev => ({ ...prev, preferredExhibitorTypes: val }))} placeholder="Select..." accentColor="emerald" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Meeting Objectives *</label>
                                        <MultiSelectDropdown options={normalizedConfig.meetingObjectiveOptions} selected={formData.meetingObjectives} onChange={(val) => { setFormData(prev => ({ ...prev, meetingObjectives: val })); setErrors(prev => ({ ...prev, meetingObjectives: '' })); }} placeholder="Select..." error={!!errors.meetingObjectives} accentColor="amber" />
                                        <ErrorText message={errors.meetingObjectives} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Business Type *</label>
                                        <MultiSelectDropdown options={normalizedConfig.preferredBusinessTypeOptions} selected={formData.preferredBusinessTypes} onChange={(val) => { setFormData(prev => ({ ...prev, preferredBusinessTypes: val })); setErrors(prev => ({ ...prev, preferredBusinessTypes: '' })); }} placeholder="Select..." error={!!errors.preferredBusinessTypes} accentColor="blue" />
                                        <ErrorText message={errors.preferredBusinessTypes} />
                                    </div>
                                    <Field label="Preferred Day *" name="preferredMeetingDay" required error={errors.preferredMeetingDay}>
                                        <select id="preferredMeetingDay" name="preferredMeetingDay" value={formData.preferredMeetingDay} onChange={(e) => handleSelectChange("preferredMeetingDay", e.target.value)} className={selectClass}>
                                            <option value="">Select Day</option>
                                            {normalizedConfig.meetingDayOptions.map(day => <option key={day} value={day}>{day}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Time Slot *" name="preferredTimeSlot" required error={errors.preferredTimeSlot}>
                                        <select id="preferredTimeSlot" name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={(e) => handleSelectChange("preferredTimeSlot", e.target.value)} className={selectClass}>
                                            <option value="">Select Slot</option>
                                            {['Morning (10AM-1PM)', 'Afternoon (2PM-4PM)', 'Evening (4PM-6PM)'].map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Number of Meetings" name="numberOfMeetingsInterested">
                                        <select id="numberOfMeetingsInterested" name="numberOfMeetingsInterested" value={formData.numberOfMeetingsInterested} onChange={(e) => handleSelectChange("numberOfMeetingsInterested", e.target.value)} className={selectClass}>
                                            <option value="">Select Count</option>
                                            {["3–5 Meetings", "5–10 Meetings", "10+ Meetings"].map(count => <option key={count} value={count}>{count}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Meeting Requirements" name="meetingRequirements" className="xl:col-span-5">
                                        <textarea id="meetingRequirements" name="meetingRequirements" value={formData.meetingRequirements} onChange={handleInputChange} placeholder="Mention specific expectations..." className={`${textareaClass} min-h-[36px] h-9 resize-none`} rows={1} />
                                    </Field>
                                </>
                            )}
                        </div>
                    </section>

                    {/* SECTION 9: Remarks - Full Width */}
                    <section>
                        <SectionTitle icon={FileText} title="Remarks" />
                        <div className="grid grid-cols-1 gap-4">
                            <Field label="Remarks" name="remarks">
                                <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleInputChange} placeholder="Any internal or buyer-side notes for the registration." className={`${textareaClass} min-h-[60px]`} rows={2} />
                            </Field>
                        </div>
                    </section>

                    {/* Registration Category & Payment Section */}
                    <section data-field="registrationCategory">
                        <SectionTitle icon={CreditCard} title="Registration Category 🔹" />
                        {normalizedPackages.length === 0 ? (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                                <div className="flex gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-[0.16em]">No packages configured</p>
                                        <p className="mt-2 text-sm leading-7">Please add buyer registration packages from the registration configuration page before using this form.</p>
                                        <Link to="/buyer-registration-config" className="mt-4 inline-flex rounded-[2px] bg-[#23471d] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">Open Registration Config</Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className={`rounded-2xl border p-4 mb-4 ${canSelectPackage ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                                    <p className={`text-sm font-medium ${canSelectPackage ? 'text-green-800' : 'text-blue-800'}`}>
                                        {canSelectPackage ? "✅ All required fields completed! You can now select a package below." : "⚠️ Please complete all required fields above to unlock package selection."}
                                    </p>
                                </div>

                                {membershipPackages.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={() => setPackageView("Pass")} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${packageView === "Pass" ? "bg-[#23471d] text-white" : "border border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"}`}>Pass Packages</button>
                                        <button type="button" onClick={() => setPackageView("Membership")} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${packageView === "Membership" ? "bg-[#23471d] text-white" : "border border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"}`}>Membership Plans</button>
                                    </div>
                                )}

                                <div className="grid gap-x-4 gap-y-3 md:grid-cols-2 xl:grid-cols-4">
                                    {(packageView === "Membership" ? membershipPackages : passPackages).map((pkg) => (
                                        <PackageCard key={pkg.name} pkg={pkg} selected={selectedPackage?.name === pkg.name} onSelect={handlePackageSelect} disabled={!canSelectPackage} />
                                    ))}
                                </div>

                                {selectedPackage && (
                                    <>
                                        <div className="rounded-2xl border border-[#23471d]/10 bg-[#23471d]/5 p-5">
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Selected Package</p>
                                            <h4 className="mt-2 text-xl font-black text-slate-900">{selectedPackage.name}</h4>
                                            <p className="mt-2 text-sm font-medium text-slate-600">Fee: {formatCurrency(selectedPackage.price)}</p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 p-5">
                                            <div className="mb-4 flex items-center gap-2">
                                                <CreditCard className="h-5 w-5 text-[#23471d]" />
                                                <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">Select Payment Method</h4>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                {PAYMENT_METHODS.map((method) => (
                                                    <PaymentMethodCard key={method.id} method={method} selected={selectedPaymentMethods.includes(method.id)} onToggle={togglePaymentMethod} />
                                                ))}
                                            </div>
                                            {selectedPaymentMethods.length === 0 && <p className="mt-3 text-xs text-red-600">Please select at least one payment method</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                            <Field label="Transaction ID" name="transactionId" hint="Manual transaction reference ID" className="xl:col-span-2">
                                                <input id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleInputChange} placeholder="e.g. TXN123456789" className={inputClass} />
                                            </Field>
                                            <Field label="Payment Proof" name="paymentProof" hint="Upload proof of payment" className="xl:col-span-3">
                                                <div className="relative h-9">
                                                    <input type="file" id="paymentProof" name="paymentProof" onChange={handleFileChange} accept="image/*,application/pdf" className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
                                                    <div className={`flex h-full w-full items-center justify-between rounded-[2px] border border-slate-300 bg-white px-3 text-[12px] font-medium ${formData.paymentProof ? "text-[#23471d]" : "text-slate-400"}`}>
                                                        <span className="truncate">{formData.paymentProof ? formData.paymentProof.name : "Select proof file..."}</span>
                                                        <FileText className="h-4 w-4 shrink-0" />
                                                    </div>
                                                </div>
                                            </Field>
                                        </div>
                                    </>
                                )}
                                <ErrorText message={errors.registrationCategory} />
                            </div>
                        )}
                    </section>

                    {/* Submit Buttons */}
                    <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#23471d]" />
                            <p className="leading-6">Review your details and selected package before submitting the registration.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={() => handleReset(true)} className="rounded-[2px] border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-100">Reset Form</button>
                            <button type="submit" disabled={isSubmitting || normalizedPackages.length === 0 || !selectedPackage || selectedPaymentMethods.length === 0} className="inline-flex items-center gap-2 rounded-[2px] bg-[#23471d] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#1a3516] disabled:cursor-not-allowed disabled:opacity-60">
                                {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>) : (<><CheckCircle2 className="h-4 w-4" /> Submit Registration</>)}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    )
};

export default BuyerRegistration;