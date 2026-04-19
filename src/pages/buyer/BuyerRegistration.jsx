

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowRight,
    Briefcase,
    Building2,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    FileText,
    Globe2,
    Landmark,
    Loader2,
    Lock,
    MapPin,
    Phone,
    QrCode,
    ShieldCheck,
    UserRound,
    Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import {
    SERVER_URL,
    buyerRegistrationApi,
    crmApi,
    heroBackgroundApi,
} from "../../lib/api";

const FALLBACK_CONFIG = {
    companyTypes: [
        "Importer / Exporter",
        "Distributor",
        "Retail Chain",
        "Wholesaler",
        "Private Label Buyer",
        "HoReCa",
        "E-commerce Platform",
        "Government Agency",
        "Other",
    ],
    annualTurnoverRanges: [
        "Below 1 Crore",
        "1-5 Crore",
        "5-10 Crore",
        "10-50 Crore",
        "50+ Crore",
    ],
    regions: [
        "North India",
        "South India",
        "East India",
        "West India",
        "Pan India",
    ],
    supplierTypes: [
        "Manufacturer",
        "Exporter",
        "MSME",
        "Startup",
        "Wholesaler",
    ],
    purchaseTimelines: ["Immediate", "1-3 Months", "3-6 Months", "Exploring"],
    roles: ["Final Decision Maker", "Influencer", "Research Only"],
    secondaryProductCategories: [],
    buyingFrequencies: ["One-time", "Monthly", "Quarterly", "Long-term"],
    annualPurchaseValueRanges: [
        "Below 10 Lakhs",
        "10-50 Lakhs",
        "50 Lakhs - 1 Crore",
        "1-5 Crore",
        "5+ Crore",
    ],
    primaryProductInterests: [],
    budgetRanges: ["Flexible", "Entry Level", "Mid-Range", "Premium"],
    companySizes: ["Small", "Medium", "Large", "Enterprise"],
    certificationOptions: ["ISO", "GMP", "FDA", "AYUSH", "Organic", "Others"],
    meetingPriorityLevels: ["Low", "Medium", "High"],
    packages: [],
};

const PAYMENT_METHODS = [
    { id: "netbanking", label: "Net Banking", icon: Landmark, description: "All major banks" },
    { id: "creditcard", label: "Credit Card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
    { id: "debitcard", label: "Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
    { id: "upi", label: "UPI", icon: QrCode, description: "Google Pay, PhonePe, Paytm" },
    { id: "wallet", label: "Mobile Wallet", icon: Wallet, description: "Paytm, Amazon Pay" },
];

const PACKAGE_METADATA = {
    "Standard Buyer Pass": {
        tagline: "For Emerging Buyers & Business Explorers",
        description: "Designed for professionals who want to explore new suppliers and business opportunities through structured buyer-seller interactions.",
        whyChoose: "A strong entry option for buyers looking to discover products and start quality business conversations.",
        cta: "Select Standard",
        color: "blue",
        badge: null,
    },
    "VIP Buyer Pass": {
        tagline: "For Serious Buyers & Decision Makers",
        description: "Built for high-intent buyers who want curated meetings, premium assistance, and faster business outcomes.",
        whyChoose: "Best for buyers who value comfort, priority coordination, and focused networking.",
        cta: "Choose VIP",
        color: "gold",
        badge: "Recommended",
    },
    "ICOA Standard Buyer Membership": {
        tagline: "For Active Buyers & Market Explorers",
        description: "Ideal for professionals who want broader access to curated supplier networks and trusted AYUSH ecosystem connections.",
        whyChoose: "Useful when you want year-round value with event-linked business discovery.",
        cta: "Start Membership",
        color: "blue",
        badge: null,
    },
    "ICOA VIP Buyer Membership": {
        tagline: "For Focused Business Growth",
        description: "A premium membership path for buyers who want structured sourcing support and priority access to relevant suppliers.",
        whyChoose: "Great for buyers who expect more guided conversations and qualified leads.",
        cta: "Upgrade to VIP",
        color: "gold",
        badge: "Recommended",
    },
    "ICOA Elite Buyer Membership": {
        tagline: "For High-Value & Institutional Buyers",
        description: "An exclusive track for buyers seeking a more managed sourcing experience with strategic business support.",
        whyChoose: "Well suited for institutional, bulk, or strategic procurement requirements.",
        cta: "Get Elite Access",
        color: "red",
        badge: null,
    },
    "ICOA Buyer Membership": {
        tagline: "For Buyers Seeking Year-Round Opportunities",
        description: "A value-driven option for buyers who want continued opportunities beyond a single event cycle.",
        whyChoose: "Best for buyers looking for continuity, supplier discovery, and long-term engagement.",
        cta: "Get Membership",
        color: "green",
        badge: "Best Value",
    },
};

const INITIAL_FORM_STATE = {
    fullName: "",
    designation: "",
    companyName: "",
    businessType: "",
    mobileNumber: "",
    alternateNumber: "",
    emailAddress: "",
    website: "",
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
    yearsInOperation: "", // Kept for UI compatibility if needed, though replaced in logic
    annualTurnover: "",
    buyingFrequency: "",
    estimatedAnnualPurchaseValue: "",
    keyProductsServices: "", // Kept for UI compatibility if needed
    primaryProductInterest: "",
    secondaryProductCategories: "",
    specificProductRequirements: "",
    estimatedPurchaseVolume: "",
    budgetRange: "",
    preferredSupplierRegion: [],
    preferredState: "",
    preferredSupplierType: [],
    preferredCompanySize: "",
    purchaseTimeline: "",
    roleInPurchaseDecision: "",
    pricingPreference: "Mid-Range",
    matchmakingInterest: "Yes",
    logisticsRequirements: "",
    requiredCertifications: [],
    preferredMeetingDate: "",
    preferredTimeSlot: "",
    requirePreScheduledB2B: "Yes",
    meetingPriorityLevel: "Medium",
    remarks: "",
    registrationCategory: "",
    registrationFee: "₹0",
    paymentMode: "",
    paymentMethods: [],
    transactionId: "",
    paymentProof: null,
    consentTerms: true,
    consentPaymentValid: true,
    consentMatchedExhibitors: true,
};

const inputClass = "w-full rounded-[2px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10";
const labelClass = "mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500";
const sectionTitleClass = "mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-black uppercase tracking-[0.22em] text-[#23471d]";

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

const CheckboxChipGroup = ({ name, label, options, values, onToggle, error, required }) => (
    <div data-field={name}>
        <label className={labelClass}>
            {label}
            {required ? <span className="text-red-500"> *</span> : null}
        </label>
        <div className={`flex min-h-[44px] flex-wrap gap-2 rounded-[2px] border p-2 ${error ? "border-red-300" : "border-slate-300"}`}>
            {options.map((option) => {
                const checked = values.includes(option);
                return (
                    <label key={option} className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition ${checked ? "border-[#23471d] bg-[#23471d] text-white" : "border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"}`}>
                        <input type="checkbox" className="hidden" checked={checked} onChange={() => onToggle(name, option)} />
                        {option}
                    </label>
                );
            })}
        </div>
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
    const meta = PACKAGE_METADATA[pkg.name] || {};
    const colorMap = {
        blue: { accent: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600", surface: "bg-blue-50" },
        gold: { accent: "text-amber-700", border: "border-amber-200", badge: "bg-amber-500", surface: "bg-amber-50" },
        green: { accent: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-600", surface: "bg-emerald-50" },
        red: { accent: "text-red-700", border: "border-red-200", badge: "bg-red-600", surface: "bg-red-50" },
    };
    const theme = colorMap[meta.color] || colorMap.blue;
    const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];

    return (
        <button
            type="button"
            onClick={() => !disabled && onSelect(pkg)}
            disabled={disabled}
            className={`relative flex h-full flex-col rounded-xl border-2 p-5 text-left transition ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${selected ? "border-[#23471d] bg-white shadow-xl shadow-[#23471d]/10 ring-4 ring-[#23471d]/5" : "border-slate-200 bg-white hover:border-[#23471d]/40 hover:shadow-lg"}`}
        >
            {meta.badge && <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white ${theme.badge}`}>{meta.badge}</span>}
            <div className="mb-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{getPackageGroup(pkg)}</p>
                <h4 className="mt-2 text-lg font-black text-slate-900">{pkg.name}</h4>
                <p className="mt-2 text-2xl font-black text-[#23471d]">{formatCurrency(pkg.price)}</p>
                {meta.tagline && <p className={`mt-2 text-xs font-bold uppercase ${theme.accent}`}>{meta.tagline}</p>}
            </div>
            <div className="flex-1 space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">{meta.description || "Curated access to buyer-seller interactions and relevant event support."}</p>
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
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{meta.whyChoose || "Useful for buyers who want curated supplier discovery and business networking."}</p>
                </div>
            </div>
            <div className={`mt-5 rounded-lg px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] transition ${selected ? "bg-[#23471d] text-white" : disabled ? "bg-slate-200 text-slate-400" : "bg-slate-100 text-slate-600 group-hover:bg-[#23471d]"}`}>
                {selected ? "Selected Package" : (disabled ? "Complete Form First" : (meta.cta || "Select Package"))}
            </div>
        </button>
    );
};

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
        const requiredFields = ["fullName", "designation", "companyName", "businessType", "mobileNumber", "emailAddress", "registeredAddress", "pinCode", "country", "stateProvince", "city", "companyFirmName", "basicBusinessType", "yearOfEstablishment", "natureOfBusiness", "yearsInBusiness", "numberOfOutlets", "annualTurnover", "primaryProductInterest", "buyingFrequency", "estimatedAnnualPurchaseValue", "purchaseTimeline", "roleInPurchaseDecision", "matchmakingInterest", "preferredMeetingDate", "preferredTimeSlot"];

        if (requiredFields.includes(name) && !String(value || "").trim()) return "This field is required";
        if (name === "fullName" && value && !/^[A-Za-z\s.'-]+$/.test(String(value).trim())) return "Use letters and spaces only";
        if (name === "designation" && value && !/^[A-Za-z0-9\s.&/-]+$/.test(String(value).trim())) return "Please enter a valid designation";
        if (name === "emailAddress" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) return "Enter a valid email address";
        if (["mobileNumber", "alternateNumber"].includes(name) && value && !/^\d{10}$/.test(String(value))) return "Enter exactly 10 digits";
        if (name === "pinCode" && value && !/^\d{6}$/.test(String(value))) return "Enter a valid 6-digit pin code";
        if (name === "website" && value && !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(String(value).trim())) return "Enter a valid website URL";
        return "";
    };

    const scrollToField = (fieldName) => {
        const target = document.querySelector(`[data-field="${fieldName}"]`) || document.querySelector(`[name="${fieldName}"]`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const validateForm = ({ skipPackage = false } = {}) => {
        const nextErrors = {};
        const fieldsToValidate = ["fullName", "designation", "companyName", "businessType", "mobileNumber", "alternateNumber", "emailAddress", "registeredAddress", "pinCode", "country", "stateProvince", "city", "companyFirmName", "basicBusinessType", "yearOfEstablishment", "natureOfBusiness", "yearsInBusiness", "numberOfOutlets", "annualTurnover", "primaryProductInterest", "buyingFrequency", "estimatedAnnualPurchaseValue", "purchaseTimeline", "roleInPurchaseDecision", "matchmakingInterest", "preferredMeetingDate", "preferredTimeSlot", "website"];

        fieldsToValidate.forEach((fieldName) => {
            const errorMessage = validateField(fieldName);
            if (errorMessage) nextErrors[fieldName] = errorMessage;
        });

        if (!formData.preferredSupplierRegion.length) nextErrors.preferredSupplierRegion = "Select at least one region";
        if (!formData.preferredSupplierType.length) nextErrors.preferredSupplierType = "Select at least one supplier type";
        if (!skipPackage && !selectedPackage?.name) nextErrors.registrationCategory = "Please select a registration package";

        setErrors(nextErrors);
        const isValid = Object.keys(nextErrors).length === 0;

        // Update canSelectPackage state
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
            // Sync company name fields
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

        // Re-validate form after field change
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
                // Sync business type fields
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

        // Re-validate form after select change
        setTimeout(() => validateForm({ skipPackage: true }), 0);
    };

    const toggleArrayValue = (name, option) => {
        setFormData((prev) => {
            const currentValues = Array.isArray(prev[name]) ? prev[name] : [];
            const nextValues = currentValues.includes(option) ? currentValues.filter((item) => item !== option) : [...currentValues, option];
            return { ...prev, [name]: nextValues };
        });
        setErrors((prev) => ({ ...prev, [name]: "" }));

        // Re-validate form after toggle
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

        // Required fields - ensure all are present
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
            primaryProductInterest: formData.primaryProductInterest,
            buyingFrequency: formData.buyingFrequency,
            estimatedAnnualPurchaseValue: formData.estimatedAnnualPurchaseValue,
            purchaseTimeline: formData.purchaseTimeline,
            roleInPurchaseDecision: formData.roleInPurchaseDecision,
            matchmakingInterest: formData.matchmakingInterest,
            preferredMeetingDate: formData.preferredMeetingDate,
            preferredTimeSlot: formData.preferredTimeSlot,
        };

        // Check for missing required fields
        const missingFields = [];
        Object.entries(requiredTextFields).forEach(([key, value]) => {
            if (!value || value === "") {
                missingFields.push(key);
            }
            fd.append(key, value || "");
        });

        if (missingFields.length > 0) {
            console.error("Missing required fields:", missingFields);
            toast.error(`Missing required fields: ${missingFields.join(", ")}`);
            throw new Error("Missing required fields");
        }

        // Optional fields
        const optionalFields = {
            website: formData.website || "",
            gstNumber: formData.gstNumber || "",
            panNumber: formData.panNumber || "",
            secondaryProductCategories: JSON.stringify(formData.secondaryProductCategories || []),
            specificProductRequirements: formData.specificProductRequirements || "",
            estimatedPurchaseVolume: formData.estimatedPurchaseVolume || "",
            budgetRange: formData.budgetRange || "",
            preferredSupplierRegion: JSON.stringify(formData.preferredSupplierRegion || []),
            preferredState: JSON.stringify(formData.preferredState ? [formData.preferredState] : []),
            preferredSupplierType: JSON.stringify(formData.preferredSupplierType || []),
            preferredCompanySize: formData.preferredCompanySize || "",
            requirePreScheduledB2B: formData.requirePreScheduledB2B,
            meetingPriorityLevel: formData.meetingPriorityLevel,
            pricingPreference: formData.pricingPreference,
            logisticsRequirements: formData.logisticsRequirements || "",
            requiredCertifications: JSON.stringify(formData.requiredCertifications || []),
            remarks: formData.remarks || "",
            transactionId: formData.transactionId || "",
        };

        Object.entries(optionalFields).forEach(([key, value]) => {
            fd.append(key, value);
        });

        // Package and payment fields
        fd.append("registrationCategory", selectedPackage?.name || formData.registrationCategory);
        fd.append("registrationFee", formatCurrency(selectedPackage?.price || 0));
        fd.append("paymentMode", selectedPaymentMethods.length > 0 ? selectedPaymentMethods.join(", ") : "Pending");

        // Consent fields
        fd.append("consentTerms", true);
        fd.append("consentPaymentValid", true);
        fd.append("consentMatchedExhibitors", true);
        fd.append("paymentStatus", "Completed");

        // Append file if exists
        if (formData.paymentProof) {
            fd.append("paymentProof", formData.paymentProof);
        }

        // Append payment methods array
        selectedPaymentMethods.forEach(method => {
            fd.append("paymentMethods[]", method);
        });

        console.log("=== FormData being submitted ===");
        for (let pair of fd.entries()) {
            console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
        }

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

            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);

                if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            } else if (error.request) {
                errorMessage = "No response from server. Please check your connection.";
            } else if (error.message) {
                errorMessage = error.message;
            }

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
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitRegistration(); }} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <section>
                        <SectionTitle icon={UserRound} title="Personal & Company Information" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field label="Full Name" name="fullName" required error={errors.fullName}><input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="As per ID proof" className={inputClass} /></Field>
                            <Field label="Designation" name="designation" required error={errors.designation}><input id="designation" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Current position" className={inputClass} /></Field>
                            <Field label="Company Name" name="companyName" required error={errors.companyName}><input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Registered company name" className={inputClass} /></Field>
                            <Field label="Business Type" name="businessType" required error={errors.businessType}><select id="businessType" name="businessType" value={formData.businessType} onChange={(e) => handleSelectChange("businessType", e.target.value)} className={inputClass}><option value="">Select business type</option>{normalizedConfig.companyTypes.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Phone} title="Contact Information" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field label="Mobile Number" name="mobileNumber" required error={errors.mobileNumber}><input id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit mobile number" className={inputClass} maxLength={10} /></Field>
                            <Field label="Email Address" name="emailAddress" required error={errors.emailAddress}><input id="emailAddress" name="emailAddress" type="email" value={formData.emailAddress} onChange={handleInputChange} placeholder="Work email address" className={inputClass} /></Field>
                            <Field label="Alternate Number" name="alternateNumber" required error={errors.alternateNumber}><input id="alternateNumber" name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} placeholder="10-digit alternate number" className={inputClass} maxLength={10} /></Field>
                            <Field label="Website" name="website" error={errors.website} hint="Example: https://yourcompany.com"><input id="website" name="website" type="url" value={formData.website} onChange={handleInputChange} placeholder="Company website" className={inputClass} /></Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={MapPin} title="Registered Address" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                            <Field label="Country" name="country" required error={errors.country} className="xl:col-span-1"><select id="country" name="country" value={formData.country} onChange={(e) => handleSelectChange("country", e.target.value)} className={inputClass}><option value="">Select country</option>{countries.map((item) => (<option key={item._id || item.name} value={item.name}>{item.name}</option>))}</select></Field>
                            <Field label="State / Province" name="stateProvince" required error={errors.stateProvince} className="xl:col-span-1"><select id="stateProvince" name="stateProvince" value={formData.stateProvince} onChange={(e) => handleSelectChange("stateProvince", e.target.value)} className={inputClass} disabled={loadingLocations.states}><option value="">{loadingLocations.states ? "Loading states..." : "Select state"}</option>{states.map((item) => (<option key={item._id || item.name} value={item.name}>{item.name}</option>))}</select></Field>
                            <Field label="City" name="city" required error={errors.city} className="xl:col-span-1"><select id="city" name="city" value={formData.city} onChange={(e) => handleSelectChange("city", e.target.value)} className={inputClass} disabled={!formData.stateProvince || loadingLocations.cities}><option value="">{loadingLocations.cities ? "Loading cities..." : "Select city"}</option>{cities.map((item) => (<option key={item._id || item.name} value={item.name}>{item.name}</option>))}</select></Field>
                            <Field label="Pin Code" name="pinCode" required error={errors.pinCode} className="xl:col-span-1"><input id="pinCode" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="6-digit pin code" className={inputClass} maxLength={6} /></Field>
                            <Field label="Registered Address" name="registeredAddress" required error={errors.registeredAddress} className="xl:col-span-5"><textarea id="registeredAddress" name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} placeholder="Full registered company address" className={`${inputClass} min-h-[90px] resize-y`} /></Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Building2} title="Basic Business Information" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                            <Field label="Company / Firm Name" name="companyFirmName" required error={errors.companyFirmName} className="xl:col-span-2">
                                <input id="companyFirmName" name="companyFirmName" value={formData.companyFirmName} onChange={handleInputChange} placeholder="As per registration documents" className={inputClass} />
                            </Field>
                            <Field label="Basic Business Type" name="basicBusinessType" required error={errors.basicBusinessType}>
                                <select id="basicBusinessType" name="basicBusinessType" value={formData.basicBusinessType} onChange={(e) => handleSelectChange("basicBusinessType", e.target.value)} className={inputClass}>
                                    <option value="">Select type</option>
                                    <option value="Proprietorship">Proprietorship</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Private Limited">Private Limited</option>
                                    <option value="Public Limited">Public Limited</option>
                                    <option value="LLP">LLP</option>
                                    <option value="OPC">OPC (One Person Company)</option>
                                    <option value="Trust / Society">Trust / Society</option>
                                </select>
                            </Field>
                            <Field label="Year of Establishment" name="yearOfEstablishment" required error={errors.yearOfEstablishment}>
                                <input id="yearOfEstablishment" name="yearOfEstablishment" type="number" min="1900" max={new Date().getFullYear()} value={formData.yearOfEstablishment} onChange={handleInputChange} placeholder="e.g. 2010" className={inputClass} />
                            </Field>
                            <Field label="GST Number" name="gstNumber" error={errors.gstNumber}>
                                <input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="Optional" className={inputClass} />
                            </Field>
                            <Field label="PAN Number" name="panNumber" error={errors.panNumber}>
                                <input id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleInputChange} placeholder="Optional" className={inputClass} />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={FileText} title="Business Profile Details" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field label="Nature of Business" name="natureOfBusiness" required error={errors.natureOfBusiness} className="xl:col-span-2" hint="Short description (1-2 lines)">
                                <input id="natureOfBusiness" name="natureOfBusiness" value={formData.natureOfBusiness} onChange={handleInputChange} placeholder="e.g. Manufacturer of Ayurvedic products" className={inputClass} />
                            </Field>
                            <Field label="Years in Business" name="yearsInBusiness" required error={errors.yearsInBusiness}>
                                <input id="yearsInBusiness" name="yearsInBusiness" type="number" min="0" value={formData.yearsInBusiness} onChange={handleInputChange} placeholder="e.g. 5" className={inputClass} />
                            </Field>
                            <Field label="Number of Outlets" name="numberOfOutlets" required error={errors.numberOfOutlets}>
                                <input id="numberOfOutlets" name="numberOfOutlets" type="number" min="1" value={formData.numberOfOutlets} onChange={handleInputChange} placeholder="e.g. 1" className={inputClass} />
                            </Field>
                            <Field label="Annual Turnover" name="annualTurnover" required error={errors.annualTurnover}>
                                <select id="annualTurnover" name="annualTurnover" value={formData.annualTurnover} onChange={(e) => handleSelectChange("annualTurnover", e.target.value)} className={inputClass}>
                                    <option value="">Select range</option>
                                    <option value="Below 50 Lakhs">Below 50 Lakhs</option>
                                    <option value="50L – 2 Cr">50L – 2 Cr</option>
                                    <option value="2 – 10 Cr">2 – 10 Cr</option>
                                    <option value="10 Cr+">10 Cr+</option>
                                    {normalizedConfig.annualTurnoverRanges.filter(r => !["Below 50 Lakhs", "50L – 2 Cr", "2 – 10 Cr", "10 Cr+"].includes(r)).map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Globe2} title="Sourcing & Buying Interests" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field label="Primary Product Interest" name="primaryProductInterest" required error={errors.primaryProductInterest}><select id="primaryProductInterest" name="primaryProductInterest" value={formData.primaryProductInterest} onChange={(e) => handleSelectChange("primaryProductInterest", e.target.value)} className={inputClass}><option value="">Select primary interest</option>{normalizedConfig.primaryProductInterests.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                            <Field label="Secondary Product Category" name="secondaryProductCategories" error={errors.secondaryProductCategories}><select id="secondaryProductCategories" name="secondaryProductCategories" value={formData.secondaryProductCategories} onChange={(e) => handleSelectChange("secondaryProductCategories", e.target.value)} className={inputClass}><option value="">Select category</option>{normalizedConfig.secondaryProductCategories.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                            <Field label="Estimated Purchase Volume" name="estimatedPurchaseVolume" error={errors.estimatedPurchaseVolume}><input id="estimatedPurchaseVolume" name="estimatedPurchaseVolume" value={formData.estimatedPurchaseVolume} onChange={handleInputChange} placeholder="e.g. 5000 units" className={inputClass} /></Field>
                            <Field label="Budget Range" name="budgetRange" error={errors.budgetRange}><select id="budgetRange" name="budgetRange" value={formData.budgetRange} onChange={(e) => handleSelectChange("budgetRange", e.target.value)} className={inputClass}><option value="">Select budget range</option>{normalizedConfig.budgetRanges.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                            <Field label="Specific Product Requirements" name="specificProductRequirements" error={errors.specificProductRequirements} className="xl:col-span-4"><textarea id="specificProductRequirements" name="specificProductRequirements" value={formData.specificProductRequirements} onChange={handleInputChange} placeholder="Mention custom sourcing requirements, certifications, quantity expectations, or product notes." className={`${inputClass} min-h-[90px] resize-y`} /></Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Briefcase} title="Supplier Preference" />
                        <div className="space-y-5">
                            <div className="grid gap-5 xl:grid-cols-2">
                                <CheckboxChipGroup name="preferredSupplierRegion" label="Preferred Supplier Region" required options={normalizedConfig.regions} values={formData.preferredSupplierRegion} onToggle={toggleArrayValue} error={errors.preferredSupplierRegion} />
                                <CheckboxChipGroup name="preferredSupplierType" label="Preferred Supplier Type" required options={normalizedConfig.supplierTypes} values={formData.preferredSupplierType} onToggle={toggleArrayValue} error={errors.preferredSupplierType} />
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label="Preferred State" name="preferredState" error={errors.preferredState}><select id="preferredState" name="preferredState" value={formData.preferredState} onChange={(e) => handleSelectChange("preferredState", e.target.value)} className={inputClass}><option value="">Select preferred state</option>{states.map((item) => (<option key={item._id || item.name} value={item.name}>{item.name}</option>))}</select></Field>
                                <Field label="Preferred Company Size" name="preferredCompanySize" error={errors.preferredCompanySize}><select id="preferredCompanySize" name="preferredCompanySize" value={formData.preferredCompanySize} onChange={(e) => handleSelectChange("preferredCompanySize", e.target.value)} className={inputClass}><option value="">Select company size</option>{normalizedConfig.companySizes.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                            </div>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={CalendarDays} title="Purchase Intent & Meeting Preferences" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field label="Buying Frequency" name="buyingFrequency" required error={errors.buyingFrequency}><select id="buyingFrequency" name="buyingFrequency" value={formData.buyingFrequency} onChange={(e) => handleSelectChange("buyingFrequency", e.target.value)} className={inputClass}><option value="">Select frequency</option>{normalizedConfig.buyingFrequencies.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                            <Field label="Estimated Annual Purchase" name="estimatedAnnualPurchaseValue" required error={errors.estimatedAnnualPurchaseValue}><select id="estimatedAnnualPurchaseValue" name="estimatedAnnualPurchaseValue" value={formData.estimatedAnnualPurchaseValue} onChange={(e) => handleSelectChange("estimatedAnnualPurchaseValue", e.target.value)} className={inputClass}><option value="">Select value range</option>{normalizedConfig.annualPurchaseValueRanges.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                            <Field label="Purchase Timeline" name="purchaseTimeline" required error={errors.purchaseTimeline}><select id="purchaseTimeline" name="purchaseTimeline" value={formData.purchaseTimeline} onChange={(e) => handleSelectChange("purchaseTimeline", e.target.value)} className={inputClass}><option value="">Select timeline</option>{normalizedConfig.purchaseTimelines.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                            <Field label="Role in Purchase Decision" name="roleInPurchaseDecision" required error={errors.roleInPurchaseDecision}><select id="roleInPurchaseDecision" name="roleInPurchaseDecision" value={formData.roleInPurchaseDecision} onChange={(e) => handleSelectChange("roleInPurchaseDecision", e.target.value)} className={inputClass}><option value="">Select role</option>{normalizedConfig.roles.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                            <Field label="Matchmaking Interest" name="matchmakingInterest" required error={errors.matchmakingInterest}><select id="matchmakingInterest" name="matchmakingInterest" value={formData.matchmakingInterest} onChange={(e) => handleSelectChange("matchmakingInterest", e.target.value)} className={inputClass}><option value="Yes">Yes</option><option value="No">No</option></select></Field>
                            <Field label="Preferred Meeting Date" name="preferredMeetingDate" required error={errors.preferredMeetingDate}><input id="preferredMeetingDate" name="preferredMeetingDate" type="date" value={formData.preferredMeetingDate} onChange={handleInputChange} className={inputClass} /></Field>
                            <Field label="Preferred Time Slot" name="preferredTimeSlot" required error={errors.preferredTimeSlot}><select id="preferredTimeSlot" name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={(e) => handleSelectChange("preferredTimeSlot", e.target.value)} className={inputClass}><option value="">Select time slot</option><option value="Morning (10AM - 1PM)">Morning (10AM - 1PM)</option><option value="Afternoon (2PM - 4PM)">Afternoon (2PM - 4PM)</option><option value="Evening (4PM - 6PM)">Evening (4PM - 6PM)</option></select></Field>
                            <Field label="Pre-scheduled B2B" name="requirePreScheduledB2B" error={errors.requirePreScheduledB2B}><select id="requirePreScheduledB2B" name="requirePreScheduledB2B" value={formData.requirePreScheduledB2B} onChange={(e) => handleSelectChange("requirePreScheduledB2B", e.target.value)} className={inputClass}><option value="Yes">Yes</option><option value="No">No</option></select></Field>
                            <Field label="Meeting Priority Level" name="meetingPriorityLevel" error={errors.meetingPriorityLevel}><select id="meetingPriorityLevel" name="meetingPriorityLevel" value={formData.meetingPriorityLevel} onChange={(e) => handleSelectChange("meetingPriorityLevel", e.target.value)} className={inputClass}>{normalizedConfig.meetingPriorityLevels.map((item) => (<option key={item} value={item}>{item}</option>))}</select></Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={FileText} title="Compliance, Pricing & Notes" />
                        <div className="space-y-5">
                            <CheckboxChipGroup name="requiredCertifications" label="Required Certifications" options={normalizedConfig.certificationOptions} values={formData.requiredCertifications} onToggle={toggleArrayValue} error={errors.requiredCertifications} />
                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label="Pricing Preference" name="pricingPreference" error={errors.pricingPreference}><div className="flex flex-wrap gap-3 rounded-[2px] border border-slate-300 p-3">{["Premium", "Mid-Range", "Budget"].map((item) => (<label key={item} className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${formData.pricingPreference === item ? "border-[#23471d] bg-[#23471d] text-white" : "border-slate-300 text-slate-600 hover:border-[#23471d]"}`}><input type="radio" name="pricingPreference" value={item} checked={formData.pricingPreference === item} onChange={(e) => handleSelectChange("pricingPreference", e.target.value)} className="hidden" />{item}</label>))}</div></Field>
                                <Field label="Logistics Requirements" name="logisticsRequirements" error={errors.logisticsRequirements}><textarea id="logisticsRequirements" name="logisticsRequirements" value={formData.logisticsRequirements} onChange={handleInputChange} placeholder="Mention delivery, warehousing, or shipping requirements if any." className={`${inputClass} min-h-[90px] resize-y`} /></Field>
                            </div>
                            <Field label="Remarks" name="remarks" error={errors.remarks}><textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleInputChange} placeholder="Any internal or buyer-side notes for the registration." className={`${inputClass} min-h-[90px] resize-y`} /></Field>
                        </div>
                    </section>

                    {/* Registration Category & Payment - Always Visible */}
                    <section data-field="registrationCategory">
                        <SectionTitle icon={CreditCard} title="Registration Category & Payment" />
                        {normalizedPackages.length === 0 ? (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="text-sm font-black uppercase tracking-[0.16em]">No packages configured</p><p className="mt-2 text-sm leading-7">Please add buyer registration packages from the registration configuration page before using this form.</p><Link to="/buyer-registration-config" className="mt-4 inline-flex rounded-[2px] bg-[#23471d] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">Open Registration Config</Link></div></div></div>
                        ) : (
                            <div className="space-y-6">
                                <div className={`rounded-2xl border p-4 mb-4 ${canSelectPackage ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                                    <p className={`text-sm font-medium ${canSelectPackage ? 'text-green-800' : 'text-blue-800'}`}>
                                        {canSelectPackage ?
                                            "✅ All required fields completed! You can now select a package below." :
                                            "⚠️ Please complete all required fields above to unlock package selection."}
                                    </p>
                                </div>

                                {membershipPackages.length > 0 && <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setPackageView("Pass")} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${packageView === "Pass" ? "bg-[#23471d] text-white" : "border border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"}`}>Pass Packages</button><button type="button" onClick={() => setPackageView("Membership")} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${packageView === "Membership" ? "bg-[#23471d] text-white" : "border border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"}`}>Membership Plans</button></div>}

                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                    {(packageView === "Membership" ? membershipPackages : passPackages).map((pkg) => (
                                        <PackageCard
                                            key={pkg.name}
                                            pkg={pkg}
                                            selected={selectedPackage?.name === pkg.name}
                                            onSelect={handlePackageSelect}
                                            disabled={!canSelectPackage}
                                        />
                                    ))}
                                </div>

                                {selectedPackage && (
                                    <>
                                        <div className="rounded-2xl border border-[#23471d]/10 bg-[#23471d]/5 p-5">
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Selected Package</p>
                                                <h4 className="mt-2 text-xl font-black text-slate-900">{selectedPackage.name}</h4>
                                                <p className="mt-2 text-sm font-medium text-slate-600">Fee: {formatCurrency(selectedPackage.price)}</p>
                                            </div>
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

                                        <div className="grid gap-5 md:grid-cols-2">
                                            <Field label="Transaction ID" name="transactionId" hint="Enter the manual transaction reference ID">
                                                <input
                                                    id="transactionId"
                                                    name="transactionId"
                                                    value={formData.transactionId}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. TXN123456789"
                                                    className={inputClass}
                                                />
                                            </Field>
                                            <Field label="Payment Proof (Screenshot)" name="paymentProof" hint="Upload a file as proof of payment (Image or PDF)">
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id="paymentProof"
                                                        name="paymentProof"
                                                        onChange={handleFileChange}
                                                        accept="image/*,application/pdf"
                                                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                                    />
                                                    <div className={`flex w-full items-center justify-between rounded-[2px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium ${formData.paymentProof ? "text-[#23471d]" : "text-slate-400"}`}>
                                                        <span>{formData.paymentProof ? formData.paymentProof.name : "Select proof file..."}</span>
                                                        <FileText className="h-4 w-4" />
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

                    <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#23471d]" /><p className="leading-6">Review your details and selected package before submitting the registration.</p></div>
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
    );
};

export default BuyerRegistration;