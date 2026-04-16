import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
    Loader2,
    Lock,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    UserRound,
    X,
} from "lucide-react";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import {
    SERVER_URL,
    buyerRegistrationApi,
    crmApi,
    heroBackgroundApi,
    policyApi,
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

const PACKAGE_METADATA = {
    "Standard Buyer Pass": {
        tagline: "For Emerging Buyers & Business Explorers",
        description:
            "Designed for professionals who want to explore new suppliers and business opportunities through structured buyer-seller interactions.",
        whyChoose:
            "A strong entry option for buyers looking to discover products and start quality business conversations.",
        cta: "Select Standard",
        color: "blue",
        badge: null,
    },
    "VIP Buyer Pass": {
        tagline: "For Serious Buyers & Decision Makers",
        description:
            "Built for high-intent buyers who want curated meetings, premium assistance, and faster business outcomes.",
        whyChoose:
            "Best for buyers who value comfort, priority coordination, and focused networking.",
        cta: "Choose VIP",
        color: "gold",
        badge: "Recommended",
    },
    "ICOA Standard Buyer Membership": {
        tagline: "For Active Buyers & Market Explorers",
        description:
            "Ideal for professionals who want broader access to curated supplier networks and trusted AYUSH ecosystem connections.",
        whyChoose:
            "Useful when you want year-round value with event-linked business discovery.",
        cta: "Start Membership",
        color: "blue",
        badge: null,
    },
    "ICOA VIP Buyer Membership": {
        tagline: "For Focused Business Growth",
        description:
            "A premium membership path for buyers who want structured sourcing support and priority access to relevant suppliers.",
        whyChoose:
            "Great for buyers who expect more guided conversations and qualified leads.",
        cta: "Upgrade to VIP",
        color: "gold",
        badge: "Recommended",
    },
    "ICOA Elite Buyer Membership": {
        tagline: "For High-Value & Institutional Buyers",
        description:
            "An exclusive track for buyers seeking a more managed sourcing experience with strategic business support.",
        whyChoose:
            "Well suited for institutional, bulk, or strategic procurement requirements.",
        cta: "Get Elite Access",
        color: "red",
        badge: null,
    },
    "ICOA Buyer Membership": {
        tagline: "For Buyers Seeking Year-Round Opportunities",
        description:
            "A value-driven option for buyers who want continued opportunities beyond a single event cycle.",
        whyChoose:
            "Best for buyers looking for continuity, supplier discovery, and long-term engagement.",
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
    yearsInOperation: "",
    annualTurnover: "",
    buyingFrequency: "",
    estimatedAnnualPurchaseValue: "",
    keyProductsServices: "",
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
    paymentMode: "Online / Razorpay",
    transactionId: "",
    consentTerms: false,
    consentPaymentValid: false,
    consentMatchedExhibitors: false,
};

const inputClass =
    "w-full rounded-[2px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10";
const labelClass =
    "mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500";
const sectionTitleClass =
    "mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-black uppercase tracking-[0.22em] text-[#23471d]";

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

const getRegistrationId = (response) =>
    response?.data?._id ||
    response?.data?.id ||
    response?.data?.registrationId ||
    response?._id ||
    response?.id ||
    response?.registrationId ||
    null;

const getOrderPayload = (response) =>
    response?.data?.order || response?.order || response?.data || response || {};

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
        );

        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true), {
                once: true,
            });
            existingScript.addEventListener("error", () => resolve(false), {
                once: true,
            });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const ErrorText = ({ message }) =>
    message ? (
        <p className="mt-1 text-xs font-medium text-red-600">{message}</p>
    ) : null;

const SectionTitle = ({ icon: Icon, title }) => (
    <h3 className={sectionTitleClass}>
        <Icon className="h-4 w-4 text-[#d26019]" />
        {title}
    </h3>
);

const Field = ({
    label,
    name,
    error,
    required,
    children,
    hint,
    className = "",
}) => (
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

const CheckboxChipGroup = ({
    name,
    label,
    options,
    values,
    onToggle,
    error,
    required,
}) => (
    <div data-field={name}>
        <label className={labelClass}>
            {label}
            {required ? <span className="text-red-500"> *</span> : null}
        </label>
        <div
            className={`flex min-h-[44px] flex-wrap gap-2 rounded-[2px] border p-2 ${error ? "border-red-300" : "border-slate-300"
                }`}
        >
            {options.map((option) => {
                const checked = values.includes(option);
                return (
                    <label
                        key={option}
                        className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition ${checked
                                ? "border-[#23471d] bg-[#23471d] text-white"
                                : "border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"
                            }`}
                    >
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={checked}
                            onChange={() => onToggle(name, option)}
                        />
                        {option}
                    </label>
                );
            })}
        </div>
        <ErrorText message={error} />
    </div>
);

const PackageCard = ({ pkg, selected, onSelect }) => {
    const meta = PACKAGE_METADATA[pkg.name] || {};
    const colorMap = {
        blue: {
            accent: "text-blue-700",
            border: "border-blue-200",
            badge: "bg-blue-600",
            surface: "bg-blue-50",
        },
        gold: {
            accent: "text-amber-700",
            border: "border-amber-200",
            badge: "bg-amber-500",
            surface: "bg-amber-50",
        },
        green: {
            accent: "text-emerald-700",
            border: "border-emerald-200",
            badge: "bg-emerald-600",
            surface: "bg-emerald-50",
        },
        red: {
            accent: "text-red-700",
            border: "border-red-200",
            badge: "bg-red-600",
            surface: "bg-red-50",
        },
    };

    const theme = colorMap[meta.color] || colorMap.blue;
    const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];

    return (
        <button
            type="button"
            onClick={() => onSelect(pkg)}
            className={`relative flex h-full flex-col rounded-xl border-2 p-5 text-left transition ${selected
                    ? "border-[#23471d] bg-white shadow-xl shadow-[#23471d]/10 ring-4 ring-[#23471d]/5"
                    : "border-slate-200 bg-white hover:border-[#23471d]/40 hover:shadow-lg"
                }`}
        >
            {meta.badge ? (
                <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white ${theme.badge}`}
                >
                    {meta.badge}
                </span>
            ) : null}

            <div className="mb-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {getPackageGroup(pkg)}
                </p>
                <h4 className="mt-2 text-lg font-black text-slate-900">{pkg.name}</h4>
                <p className="mt-2 text-2xl font-black text-[#23471d]">
                    {formatCurrency(pkg.price)}
                </p>
                {meta.tagline ? (
                    <p className={`mt-2 text-xs font-bold uppercase ${theme.accent}`}>
                        {meta.tagline}
                    </p>
                ) : null}
            </div>

            <div className="flex-1 space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">
                    {meta.description ||
                        "Curated access to buyer-seller interactions and relevant event support."}
                </p>

                {benefits.length ? (
                    <div className={`rounded-xl border p-3 ${theme.border} ${theme.surface}`}>
                        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                            Package Benefits
                        </p>
                        <ul className="space-y-2 text-sm text-slate-700">
                            {benefits.slice(0, 5).map((benefit, index) => (
                                <li key={`${pkg.name}-benefit-${index}`} className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                        Why Choose This
                    </p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                        {meta.whyChoose ||
                            "Useful for buyers who want curated supplier discovery and business networking."}
                    </p>
                </div>
            </div>

            <div
                className={`mt-5 rounded-lg px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] transition ${selected
                        ? "bg-[#23471d] text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-[#23471d]"
                    }`}
            >
                {selected ? "Selected Package" : meta.cta || "Select Package"}
            </div>
        </button>
    );
};

const PolicyModal = ({
    open,
    packageInfo,
    activeTab,
    setActiveTab,
    policiesData,
    consents,
    setConsents,
    onClose,
    onConfirm,
    isSubmitting,
}) => {
    const tabs = [
        { key: "payment", label: "Payment Terms" },
        { key: "refund", label: "Refund Policy" },
        { key: "privacy", label: "Privacy Policy" },
    ];

    const currentPolicy = policiesData[activeTab];

    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Final Review
                                </p>
                                <h3 className="mt-2 text-2xl font-black text-slate-900">
                                    {packageInfo?.name}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    {formatCurrency(packageInfo?.price)} • Please review and accept
                                    all policies before continuing.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="border-b border-slate-200 px-6 pt-4">
                            <div className="flex flex-wrap gap-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`rounded-t-xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${activeTab === tab.key
                                                ? "bg-[#23471d] text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid max-h-[60vh] grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[1.35fr_0.85fr]">
                            <div className="min-h-[320px] overflow-y-auto px-6 py-5">
                                <div className="mb-4">
                                    <h4 className="text-lg font-black text-slate-900">
                                        {currentPolicy?.title || "Policy details"}
                                    </h4>
                                </div>

                                <div
                                    className="prose prose-sm max-w-none text-slate-700 [&_h2]:text-lg [&_h2]:font-black [&_h3]:text-base [&_h3]:font-bold [&_li]:my-1 [&_ol]:pl-5 [&_p]:leading-7 [&_ul]:pl-5"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            currentPolicy?.content ||
                                            "<p>No policy content has been added yet.</p>",
                                    }}
                                />
                            </div>

                            <div className="border-l border-slate-200 bg-slate-50 px-6 py-5">
                                <div className="rounded-2xl border border-[#23471d]/10 bg-white p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="h-5 w-5 text-[#23471d]" />
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                Mandatory Consents
                                            </p>
                                            <h4 className="text-base font-black text-slate-900">
                                                Complete all confirmations
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        <label className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={consents.paymentTerms}
                                                onChange={(event) =>
                                                    setConsents((prev) => ({
                                                        ...prev,
                                                        paymentTerms: event.target.checked,
                                                    }))
                                                }
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#23471d] focus:ring-[#23471d]"
                                            />
                                            <span>I accept the payment terms for this registration.</span>
                                        </label>

                                        <label className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={consents.refundPolicy}
                                                onChange={(event) =>
                                                    setConsents((prev) => ({
                                                        ...prev,
                                                        refundPolicy: event.target.checked,
                                                    }))
                                                }
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#23471d] focus:ring-[#23471d]"
                                            />
                                            <span>I have read and agree to the refund policy.</span>
                                        </label>

                                        <label className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={consents.privacyPolicy}
                                                onChange={(event) =>
                                                    setConsents((prev) => ({
                                                        ...prev,
                                                        privacyPolicy: event.target.checked,
                                                    }))
                                                }
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#23471d] focus:ring-[#23471d]"
                                            />
                                            <span>I agree to the privacy policy and data handling terms.</span>
                                        </label>

                                        <label className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={consents.matchedExhibitors}
                                                onChange={(event) =>
                                                    setConsents((prev) => ({
                                                        ...prev,
                                                        matchedExhibitors: event.target.checked,
                                                    }))
                                                }
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#23471d] focus:ring-[#23471d]"
                                            />
                                            <span>
                                                I consent to receiving curated exhibitor matches and
                                                meeting coordination support.
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                        <p className="leading-relaxed">
                                            Please proceed only after reviewing the selected package,
                                            payment terms, and policy content shown here.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={isSubmitting}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#23471d] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#1a3516] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Processing
                                        </>
                                    ) : packageInfo?.price > 0 ? (
                                        <>
                                            Proceed to Payment
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    ) : (
                                        <>
                                            Complete Registration
                                            <CheckCircle2 className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
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
    const [policiesData, setPoliciesData] = useState({
        payment: null,
        refund: null,
        privacy: null,
    });
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingLocations, setLoadingLocations] = useState({
        states: false,
        cities: false,
    });
    const [isFormLocked, setIsFormLocked] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [packageView, setPackageView] = useState("Pass");
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [activePolicyTab, setActivePolicyTab] = useState("payment");
    const [policyConsents, setPolicyConsents] = useState({
        paymentTerms: false,
        refundPolicy: false,
        privacyPolicy: false,
        matchedExhibitors: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedRegistrationId, setSubmittedRegistrationId] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [pendingRegistrationId, setPendingRegistrationId] = useState("");
    const [pendingPackageName, setPendingPackageName] = useState("");

    const normalizedConfig = useMemo(
        () => ({
            ...FALLBACK_CONFIG,
            ...(config || {}),
            packages: Array.isArray(config?.packages) ? config.packages : [],
        }),
        [config],
    );

    const normalizedPackages = useMemo(
        () =>
            normalizedConfig.packages.map((pkg) => ({
                ...pkg,
                category: getPackageGroup(pkg),
                benefits: Array.isArray(pkg.benefits) ? pkg.benefits : [],
            })),
        [normalizedConfig.packages],
    );

    const passPackages = useMemo(
        () => normalizedPackages.filter((pkg) => pkg.category === "Pass"),
        [normalizedPackages],
    );

    const membershipPackages = useMemo(
        () => normalizedPackages.filter((pkg) => pkg.category === "Membership"),
        [normalizedPackages],
    );

    const heroImage = heroData?.backgroundImage
        ? heroData.backgroundImage.startsWith("http")
            ? heroData.backgroundImage
            : `${SERVER_URL}${heroData.backgroundImage}`
        : "";

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingPage(true);

            const [
                heroResult,
                countryResult,
                configResult,
                paymentPolicyResult,
                refundPolicyResult,
                privacyPolicyResult,
            ] = await Promise.allSettled([
                heroBackgroundApi.getByPage("Registration / Buyer Registration"),
                crmApi.getCountries(),
                buyerRegistrationApi.getConfig(),
                policyApi.getByPage("terms-of-service"),
                policyApi.getByPage("refund-policy"),
                policyApi.getByPage("privacy-policy"),
            ]);

            if (heroResult.status === "fulfilled") {
                setHeroData(heroResult.value);
            }

            if (countryResult.status === "fulfilled") {
                setCountries(Array.isArray(countryResult.value) ? countryResult.value : []);
            }

            if (configResult.status === "fulfilled") {
                const payload = configResult.value?.data || configResult.value;
                if (payload) {
                    setConfig((prev) => ({ ...prev, ...payload }));
                }
            }

            setPoliciesData({
                payment:
                    paymentPolicyResult.status === "fulfilled"
                        ? paymentPolicyResult.value
                        : null,
                refund:
                    refundPolicyResult.status === "fulfilled"
                        ? refundPolicyResult.value
                        : null,
                privacy:
                    privacyPolicyResult.status === "fulfilled"
                        ? privacyPolicyResult.value
                        : null,
            });

            setLoadingPage(false);
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            if (!formData.country) {
                setStates([]);
                setCities([]);
                return;
            }

            const selectedCountry = countries.find(
                (item) =>
                    item?.name?.trim().toLowerCase() ===
                    formData.country.trim().toLowerCase(),
            );

            if (!selectedCountry?.countryCode) {
                setStates([]);
                return;
            }

            setLoadingLocations((prev) => ({ ...prev, states: true }));

            try {
                const nextStates = await crmApi.getStates(selectedCountry.countryCode);
                setStates(Array.isArray(nextStates) ? nextStates : []);
            } catch (error) {
                console.error("Error fetching states:", error);
                setStates([]);
            } finally {
                setLoadingLocations((prev) => ({ ...prev, states: false }));
            }
        };

        fetchStates();
    }, [formData.country, countries]);

    useEffect(() => {
        const fetchCities = async () => {
            if (!formData.stateProvince) {
                setCities([]);
                return;
            }

            const selectedState = states.find(
                (item) =>
                    item?.name?.trim().toLowerCase() ===
                    formData.stateProvince.trim().toLowerCase(),
            );

            if (!selectedState?.stateCode) {
                setCities([]);
                return;
            }

            setLoadingLocations((prev) => ({ ...prev, cities: true }));

            try {
                const nextCities = await crmApi.getCities(selectedState.stateCode);
                setCities(Array.isArray(nextCities) ? nextCities : []);
            } catch (error) {
                console.error("Error fetching cities:", error);
                setCities([]);
            } finally {
                setLoadingLocations((prev) => ({ ...prev, cities: false }));
            }
        };

        fetchCities();
    }, [formData.stateProvince, states]);

    const validateField = (name, rawValue = formData[name]) => {
        const value = rawValue;

        if (
            [
                "fullName",
                "designation",
                "companyName",
                "businessType",
                "mobileNumber",
                "alternateNumber",
                "emailAddress",
                "registeredAddress",
                "pinCode",
                "country",
                "stateProvince",
                "city",
                "yearsInOperation",
                "annualTurnover",
                "keyProductsServices",
                "primaryProductInterest",
                "buyingFrequency",
                "estimatedAnnualPurchaseValue",
                "purchaseTimeline",
                "roleInPurchaseDecision",
                "matchmakingInterest",
                "preferredMeetingDate",
                "preferredTimeSlot",
            ].includes(name) &&
            !String(value || "").trim()
        ) {
            return "This field is required";
        }

        if (
            name === "fullName" &&
            value &&
            !/^[A-Za-z\s.'-]+$/.test(String(value).trim())
        ) {
            return "Use letters and spaces only";
        }

        if (
            name === "designation" &&
            value &&
            !/^[A-Za-z0-9\s.&/-]+$/.test(String(value).trim())
        ) {
            return "Please enter a valid designation";
        }

        if (
            name === "emailAddress" &&
            value &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
        ) {
            return "Enter a valid email address";
        }

        if (
            ["mobileNumber", "alternateNumber"].includes(name) &&
            value &&
            !/^\d{10}$/.test(String(value))
        ) {
            return "Enter exactly 10 digits";
        }

        if (name === "pinCode" && value && !/^\d{6}$/.test(String(value))) {
            return "Enter a valid 6-digit pin code";
        }

        if (
            name === "website" &&
            value &&
            !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(String(value).trim())
        ) {
            return "Enter a valid website URL";
        }

        return "";
    };

    const scrollToField = (fieldName) => {
        const target =
            document.querySelector(`[data-field="${fieldName}"]`) ||
            document.querySelector(`[name="${fieldName}"]`);

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    const validateForm = ({ skipPackage = false } = {}) => {
        const nextErrors = {};

        [
            "fullName",
            "designation",
            "companyName",
            "businessType",
            "mobileNumber",
            "alternateNumber",
            "emailAddress",
            "registeredAddress",
            "pinCode",
            "country",
            "stateProvince",
            "city",
            "yearsInOperation",
            "annualTurnover",
            "keyProductsServices",
            "primaryProductInterest",
            "buyingFrequency",
            "estimatedAnnualPurchaseValue",
            "purchaseTimeline",
            "roleInPurchaseDecision",
            "matchmakingInterest",
            "preferredMeetingDate",
            "preferredTimeSlot",
            "website",
        ].forEach((fieldName) => {
            const errorMessage = validateField(fieldName);
            if (errorMessage) {
                nextErrors[fieldName] = errorMessage;
            }
        });

        if (!formData.preferredSupplierRegion.length) {
            nextErrors.preferredSupplierRegion = "Select at least one region";
        }

        if (!formData.preferredSupplierType.length) {
            nextErrors.preferredSupplierType = "Select at least one supplier type";
        }

        if (!skipPackage && !selectedPackage?.name) {
            nextErrors.registrationCategory = "Please select a registration package";
        }

        setErrors(nextErrors);
        return {
            isValid: Object.keys(nextErrors).length === 0,
            nextErrors,
        };
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        let nextValue = value;

        if (name === "mobileNumber" || name === "alternateNumber") {
            nextValue = value.replace(/\D/g, "").slice(0, 10);
        }

        if (name === "pinCode") {
            nextValue = value.replace(/\D/g, "").slice(0, 6);
        }

        if (name === "fullName") {
            nextValue = value.replace(/[^A-Za-z\s.'-]/g, "");
        }

        setFormData((prev) => ({
            ...prev,
            [name]: nextValue,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, nextValue),
        }));
    };

    const handleSelectChange = (name, value) => {
        if (name === "country") {
            setFormData((prev) => ({
                ...prev,
                country: value,
                stateProvince: "",
                city: "",
            }));
            setErrors((prev) => ({
                ...prev,
                country: validateField("country", value),
                stateProvince: "",
                city: "",
            }));
            return;
        }

        if (name === "stateProvince") {
            setFormData((prev) => ({
                ...prev,
                stateProvince: value,
                city: "",
            }));
            setErrors((prev) => ({
                ...prev,
                stateProvince: validateField("stateProvince", value),
                city: "",
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value),
        }));
    };

    const toggleArrayValue = (name, option) => {
        setFormData((prev) => {
            const currentValues = Array.isArray(prev[name]) ? prev[name] : [];
            const nextValues = currentValues.includes(option)
                ? currentValues.filter((item) => item !== option)
                : [...currentValues, option];

            return {
                ...prev,
                [name]: nextValues,
            };
        });

        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleUnlockPackages = () => {
        const { isValid, nextErrors } = validateForm({ skipPackage: true });

        if (!isValid) {
            toast.error("Please complete the required fields before unlocking packages.");
            const firstErrorField = Object.keys(nextErrors)[0];
            if (firstErrorField) scrollToField(firstErrorField);
            return;
        }

        setIsFormLocked(false);
        toast.success("Packages unlocked. You can now select the right plan.");

        window.setTimeout(() => {
            scrollToField("registrationCategory");
        }, 120);
    };

    const handlePackageSelect = (pkg) => {
        if (selectedPackage?.name !== pkg.name && pendingRegistrationId) {
            setPendingRegistrationId("");
            setPendingPackageName("");
        }

        setSelectedPackage(pkg);
        setFormData((prev) => ({
            ...prev,
            registrationCategory: pkg.name,
            registrationFee: formatCurrency(pkg.price),
        }));
        setErrors((prev) => ({ ...prev, registrationCategory: "" }));
    };

    const handleOpenPolicyModal = () => {
        const { isValid, nextErrors } = validateForm();

        if (!isValid) {
            toast.error("Please fix the remaining form issues before continuing.");
            const firstErrorField = Object.keys(nextErrors)[0];
            if (firstErrorField) scrollToField(firstErrorField);
            return;
        }

        if (!selectedPackage) {
            toast.error("Please select a package first.");
            scrollToField("registrationCategory");
            return;
        }

        setActivePolicyTab("payment");
        setPolicyConsents({
            paymentTerms: false,
            refundPolicy: false,
            privacyPolicy: false,
            matchedExhibitors: false,
        });
        setShowPolicyModal(true);
    };

    const buildSubmissionPayload = (registrationId = "") => ({
        ...formData,
        registrationCategory: selectedPackage?.name || formData.registrationCategory,
        registrationFee: formatCurrency(selectedPackage?.price || 0),
        paymentMode: "Online / Razorpay",
        transactionId: registrationId,
        consentTerms: true,
        consentPaymentValid: true,
        consentMatchedExhibitors: true,
    });

    const createPendingRegistration = async () => {
        if (
            pendingRegistrationId &&
            pendingPackageName &&
            pendingPackageName === selectedPackage?.name
        ) {
            return pendingRegistrationId;
        }

        const response = await buyerRegistrationApi.submit({
            ...buildSubmissionPayload(""),
            paymentStatus: Number(selectedPackage?.price || 0) > 0 ? "Pending" : "Completed",
        });

        if (!response?.success) {
            throw new Error(response?.message || "Failed to create registration.");
        }

        const registrationId = getRegistrationId(response);

        if (!registrationId) {
            throw new Error("Registration ID was not returned by the server.");
        }

        setPendingRegistrationId(registrationId);
        setPendingPackageName(selectedPackage?.name || "");

        return registrationId;
    };

    const openRazorpayCheckout = ({ registrationId, orderPayload, key }) =>
        new Promise((resolve, reject) => {
            let completed = false;

            const finalize = (callback) => {
                if (completed) return;
                completed = true;
                callback();
            };

            const razorpay = new window.Razorpay({
                key,
                amount: orderPayload.amount,
                currency: orderPayload.currency || "INR",
                order_id: orderPayload.id,
                name: "IHWE Buyer Registration",
                description: `${selectedPackage?.name || "Buyer Registration"} Payment`,
                prefill: {
                    name: formData.fullName,
                    email: formData.emailAddress,
                    contact: formData.mobileNumber,
                },
                theme: {
                    color: "#23471d",
                },
                modal: {
                    confirm_close: true,
                    ondismiss: () =>
                        finalize(() =>
                            reject(
                                new Error(
                                    "Payment was cancelled. Your registration remains pending until payment is completed.",
                                ),
                            ),
                        ),
                },
                handler: async (response) => {
                    try {
                        const verifyResponse = await buyerRegistrationApi.verifyPayment(
                            registrationId,
                            response,
                        );

                        if (!verifyResponse?.success) {
                            throw new Error(
                                verifyResponse?.message || "Payment verification failed.",
                            );
                        }

                        finalize(() => resolve(response));
                    } catch (error) {
                        finalize(() => reject(error));
                    }
                },
            });

            razorpay.on("payment.failed", (response) => {
                finalize(() =>
                    reject(
                        new Error(
                            response?.error?.description ||
                            "Payment failed. Please try again.",
                        ),
                    ),
                );
            });

            razorpay.open();
        });

    const handleConfirmPackage = async () => {
        if (
            !policyConsents.paymentTerms ||
            !policyConsents.refundPolicy ||
            !policyConsents.privacyPolicy ||
            !policyConsents.matchedExhibitors
        ) {
            toast.error("Please accept all required confirmations to continue.");
            return;
        }

        setShowPolicyModal(false);
        setIsSubmitting(true);

        try {
            const packagePrice = Number(selectedPackage?.price || 0);

            if (packagePrice <= 0) {
                const response = await buyerRegistrationApi.submit({
                    ...buildSubmissionPayload("FREE"),
                    paymentStatus: "Completed",
                });

                if (!response?.success) {
                    throw new Error(
                        response?.message || "Registration could not be completed.",
                    );
                }

                handleReset(false);
                toast.success("Buyer registration completed successfully.");
                navigate("/buyer-list", { replace: true });
                return;
            }

            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error("Failed to load Razorpay checkout.");
            }

            const registrationId = await createPendingRegistration();
            const orderResponse = await buyerRegistrationApi.createOrder(packagePrice);

            if (!orderResponse?.success) {
                throw new Error(orderResponse?.message || "Unable to create payment order.");
            }

            const orderPayload = getOrderPayload(orderResponse);
            const razorpayKey =
                orderResponse?.key ||
                orderPayload?.key ||
                import.meta.env.VITE_RAZORPAY_KEY_ID;

            if (!orderPayload?.id || !razorpayKey) {
                throw new Error("Payment gateway configuration is incomplete.");
            }

            const paymentResponse = await openRazorpayCheckout({
                registrationId,
                orderPayload,
                key: razorpayKey,
            });

            handleReset(false);
            toast.success("Payment verified and buyer registration completed.");
            navigate("/buyer-list", { replace: true });
        } catch (error) {
            console.error("Buyer registration error:", error);
            toast.error(error.message || "Unable to complete buyer registration.");
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
        setIsFormLocked(true);
        setShowPolicyModal(false);
        setSubmitted(false);
        setSubmittedRegistrationId("");
        setPaymentReference("");
        setPendingRegistrationId("");
        setPendingPackageName("");
        setPackageView(passPackages.length ? "Pass" : "Membership");
        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();

        if (isFormLocked) {
            handleUnlockPackages();
            return;
        }

        handleOpenPolicyModal();
    };

    useEffect(() => {
        if (!passPackages.length && membershipPackages.length) {
            setPackageView("Membership");
        }
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
            <PageHeader
                title="Buyer Registration"
                description="Create a buyer registration, review the policy terms, and process the selected package payment."
            >
                <Link
                    to="/buyer-list"
                    className="rounded-[2px] border border-slate-300 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#23471d] hover:text-[#23471d]"
                >
                    View Registrations
                </Link>
            </PageHeader>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative">
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt={heroData?.imageAltText || "Buyer registration"}
                            className="h-[280px] w-full object-cover"
                        />
                    ) : (
                        <div className="h-[280px] w-full bg-[radial-gradient(circle_at_top_left,_#f0fdf4,_#dcfce7_35%,_#ffffff_78%)]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/55 to-[#23471d]/35" />

                    <div className="absolute inset-0 flex items-end">
                        <div className="max-w-4xl p-8 text-white md:p-10">
                            <div className="mb-4 flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-[0.18em]">
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                                    Direct Buyer Flow
                                </span>
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                                    Payment + Policy Review
                                </span>
                            </div>

                            <h2 className="text-3xl font-black uppercase leading-tight md:text-4xl">
                                {heroData?.title || "Buyer Registration Desk"}
                            </h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/90 md:text-base">
                                {heroData?.shortDescription ||
                                    heroData?.heading ||
                                    "Complete buyer verification, capture sourcing preferences, and finalize the correct pass or membership in one clean workflow."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* <div className="grid gap-4 border-t border-slate-200 bg-slate-50 p-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#23471d]" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Form Status
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {isFormLocked
                    ? "Complete required details"
                    : "Packages unlocked"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#23471d]" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Selected Package
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedPackage
                    ? `${selectedPackage.name} • ${formatCurrency(selectedPackage.price)}`
                    : "No package selected yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#23471d]" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Current Step
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {submitted
                    ? "Registration completed"
                    : isFormLocked
                      ? "Complete form details"
                      : "Choose package and finish payment"}
                </p>
              </div>
            </div>
          </div>
        </div> */}
            </div>

            <AnimatePresence>
                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm"
                    >
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                            <div className="flex gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                                    <CheckCircle2 className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
                                        Registration Completed
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black text-slate-900">
                                        Buyer registration submitted successfully
                                    </h3>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">
                                        The selected buyer package has been saved successfully. You
                                        can create another registration or review the full buyer
                                        registration list.
                                    </p>

                                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                                        <div className="rounded-2xl border border-white/80 bg-white p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                Package
                                            </p>
                                            <p className="mt-2 text-sm font-bold text-slate-900">
                                                {selectedPackage?.name || "N/A"}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-white/80 bg-white p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                Registration ID
                                            </p>
                                            <p className="mt-2 break-all text-sm font-bold text-slate-900">
                                                {submittedRegistrationId || "Saved successfully"}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-white/80 bg-white p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                Payment Reference
                                            </p>
                                            <p className="mt-2 break-all text-sm font-bold text-slate-900">
                                                {paymentReference || "Pending / Free"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="rounded-[2px] border border-slate-300 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#23471d] hover:text-[#23471d]"
                                >
                                    New Registration
                                </button>
                                <Link
                                    to="/buyer-registrations"
                                    className="rounded-[2px] bg-[#23471d] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#1a3516]"
                                >
                                    Go to Buyer List
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {!submitted ? (
                <form
                    onSubmit={handleFormSubmit}
                    className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
                >
                    <section>
                        <SectionTitle icon={UserRound} title="Personal & Company Information" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field
                                label="Full Name"
                                name="fullName"
                                required
                                error={errors.fullName}
                            >
                                <input
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="As per ID proof"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Designation"
                                name="designation"
                                required
                                error={errors.designation}
                            >
                                <input
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                    placeholder="Current position"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Company Name"
                                name="companyName"
                                required
                                error={errors.companyName}
                            >
                                <input
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    placeholder="Registered company name"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Business Type"
                                name="businessType"
                                required
                                error={errors.businessType}
                            >
                                <select
                                    id="businessType"
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={(event) =>
                                        handleSelectChange("businessType", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select business type</option>
                                    {normalizedConfig.companyTypes.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Phone} title="Contact Information" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field
                                label="Mobile Number"
                                name="mobileNumber"
                                required
                                error={errors.mobileNumber}
                            >
                                <input
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    placeholder="10-digit mobile number"
                                    className={inputClass}
                                    maxLength={10}
                                />
                            </Field>

                            <Field
                                label="Email Address"
                                name="emailAddress"
                                required
                                error={errors.emailAddress}
                            >
                                <input
                                    id="emailAddress"
                                    name="emailAddress"
                                    type="email"
                                    value={formData.emailAddress}
                                    onChange={handleInputChange}
                                    placeholder="Work email address"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Alternate Number"
                                name="alternateNumber"
                                required
                                error={errors.alternateNumber}
                            >
                                <input
                                    id="alternateNumber"
                                    name="alternateNumber"
                                    value={formData.alternateNumber}
                                    onChange={handleInputChange}
                                    placeholder="10-digit alternate number"
                                    className={inputClass}
                                    maxLength={10}
                                />
                            </Field>

                            <Field
                                label="Website"
                                name="website"
                                error={errors.website}
                                hint="Example: https://yourcompany.com"
                            >
                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    placeholder="Company website"
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={MapPin} title="Registered Address" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                            <Field
                                label="Country"
                                name="country"
                                required
                                error={errors.country}
                                className="xl:col-span-1"
                            >
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={(event) =>
                                        handleSelectChange("country", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select country</option>
                                    {countries.map((item) => (
                                        <option key={item._id || item.name} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="State / Province"
                                name="stateProvince"
                                required
                                error={errors.stateProvince}
                                className="xl:col-span-1"
                            >
                                <select
                                    id="stateProvince"
                                    name="stateProvince"
                                    value={formData.stateProvince}
                                    onChange={(event) =>
                                        handleSelectChange("stateProvince", event.target.value)
                                    }
                                    className={inputClass}
                                    disabled={loadingLocations.states}
                                >
                                    <option value="">
                                        {loadingLocations.states ? "Loading states..." : "Select state"}
                                    </option>
                                    {states.map((item) => (
                                        <option key={item._id || item.name} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="City"
                                name="city"
                                required
                                error={errors.city}
                                className="xl:col-span-1"
                            >
                                <select
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={(event) => handleSelectChange("city", event.target.value)}
                                    className={inputClass}
                                    disabled={!formData.stateProvince || loadingLocations.cities}
                                >
                                    <option value="">
                                        {loadingLocations.cities ? "Loading cities..." : "Select city"}
                                    </option>
                                    {cities.map((item) => (
                                        <option key={item._id || item.name} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Pin Code"
                                name="pinCode"
                                required
                                error={errors.pinCode}
                                className="xl:col-span-1"
                            >
                                <input
                                    id="pinCode"
                                    name="pinCode"
                                    value={formData.pinCode}
                                    onChange={handleInputChange}
                                    placeholder="6-digit pin code"
                                    className={inputClass}
                                    maxLength={6}
                                />
                            </Field>

                            <Field
                                label="Registered Address"
                                name="registeredAddress"
                                required
                                error={errors.registeredAddress}
                                className="xl:col-span-5"
                            >
                                <textarea
                                    id="registeredAddress"
                                    name="registeredAddress"
                                    value={formData.registeredAddress}
                                    onChange={handleInputChange}
                                    placeholder="Full registered company address"
                                    className={`${inputClass} min-h-[90px] resize-y`}
                                />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Building2} title="Business Profile" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field
                                label="Years in Operation"
                                name="yearsInOperation"
                                required
                                error={errors.yearsInOperation}
                            >
                                <input
                                    id="yearsInOperation"
                                    name="yearsInOperation"
                                    type="number"
                                    min="0"
                                    value={formData.yearsInOperation}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 5"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Annual Turnover"
                                name="annualTurnover"
                                required
                                error={errors.annualTurnover}
                            >
                                <select
                                    id="annualTurnover"
                                    name="annualTurnover"
                                    value={formData.annualTurnover}
                                    onChange={(event) =>
                                        handleSelectChange("annualTurnover", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select turnover range</option>
                                    {normalizedConfig.annualTurnoverRanges.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Key Products / Services"
                                name="keyProductsServices"
                                required
                                error={errors.keyProductsServices}
                                className="xl:col-span-2"
                            >
                                <input
                                    id="keyProductsServices"
                                    name="keyProductsServices"
                                    value={formData.keyProductsServices}
                                    onChange={handleInputChange}
                                    placeholder="Your core products or service categories"
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Globe2} title="Sourcing & Buying Interests" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field
                                label="Primary Product Interest"
                                name="primaryProductInterest"
                                required
                                error={errors.primaryProductInterest}
                            >
                                <select
                                    id="primaryProductInterest"
                                    name="primaryProductInterest"
                                    value={formData.primaryProductInterest}
                                    onChange={(event) =>
                                        handleSelectChange(
                                            "primaryProductInterest",
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select primary interest</option>
                                    {normalizedConfig.primaryProductInterests.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Secondary Product Category"
                                name="secondaryProductCategories"
                                error={errors.secondaryProductCategories}
                            >
                                <select
                                    id="secondaryProductCategories"
                                    name="secondaryProductCategories"
                                    value={formData.secondaryProductCategories}
                                    onChange={(event) =>
                                        handleSelectChange(
                                            "secondaryProductCategories",
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select category</option>
                                    {normalizedConfig.secondaryProductCategories.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Estimated Purchase Volume"
                                name="estimatedPurchaseVolume"
                                error={errors.estimatedPurchaseVolume}
                            >
                                <input
                                    id="estimatedPurchaseVolume"
                                    name="estimatedPurchaseVolume"
                                    value={formData.estimatedPurchaseVolume}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 5000 units"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Budget Range"
                                name="budgetRange"
                                error={errors.budgetRange}
                            >
                                <select
                                    id="budgetRange"
                                    name="budgetRange"
                                    value={formData.budgetRange}
                                    onChange={(event) =>
                                        handleSelectChange("budgetRange", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select budget range</option>
                                    {normalizedConfig.budgetRanges.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Specific Product Requirements"
                                name="specificProductRequirements"
                                error={errors.specificProductRequirements}
                                className="xl:col-span-4"
                            >
                                <textarea
                                    id="specificProductRequirements"
                                    name="specificProductRequirements"
                                    value={formData.specificProductRequirements}
                                    onChange={handleInputChange}
                                    placeholder="Mention custom sourcing requirements, certifications, quantity expectations, or product notes."
                                    className={`${inputClass} min-h-[90px] resize-y`}
                                />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Briefcase} title="Supplier Preference" />
                        <div className="space-y-5">
                            <div className="grid gap-5 xl:grid-cols-2">
                                <CheckboxChipGroup
                                    name="preferredSupplierRegion"
                                    label="Preferred Supplier Region"
                                    required
                                    options={normalizedConfig.regions}
                                    values={formData.preferredSupplierRegion}
                                    onToggle={toggleArrayValue}
                                    error={errors.preferredSupplierRegion}
                                />

                                <CheckboxChipGroup
                                    name="preferredSupplierType"
                                    label="Preferred Supplier Type"
                                    required
                                    options={normalizedConfig.supplierTypes}
                                    values={formData.preferredSupplierType}
                                    onToggle={toggleArrayValue}
                                    error={errors.preferredSupplierType}
                                />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <Field
                                    label="Preferred State"
                                    name="preferredState"
                                    error={errors.preferredState}
                                >
                                    <select
                                        id="preferredState"
                                        name="preferredState"
                                        value={formData.preferredState}
                                        onChange={(event) =>
                                            handleSelectChange("preferredState", event.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">Select preferred state</option>
                                        {states.map((item) => (
                                            <option key={item._id || item.name} value={item.name}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field
                                    label="Preferred Company Size"
                                    name="preferredCompanySize"
                                    error={errors.preferredCompanySize}
                                >
                                    <select
                                        id="preferredCompanySize"
                                        name="preferredCompanySize"
                                        value={formData.preferredCompanySize}
                                        onChange={(event) =>
                                            handleSelectChange(
                                                "preferredCompanySize",
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">Select company size</option>
                                        {normalizedConfig.companySizes.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={CalendarDays} title="Purchase Intent & Meeting Preferences" />
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Field
                                label="Buying Frequency"
                                name="buyingFrequency"
                                required
                                error={errors.buyingFrequency}
                            >
                                <select
                                    id="buyingFrequency"
                                    name="buyingFrequency"
                                    value={formData.buyingFrequency}
                                    onChange={(event) =>
                                        handleSelectChange("buyingFrequency", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select frequency</option>
                                    {normalizedConfig.buyingFrequencies.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Estimated Annual Purchase"
                                name="estimatedAnnualPurchaseValue"
                                required
                                error={errors.estimatedAnnualPurchaseValue}
                            >
                                <select
                                    id="estimatedAnnualPurchaseValue"
                                    name="estimatedAnnualPurchaseValue"
                                    value={formData.estimatedAnnualPurchaseValue}
                                    onChange={(event) =>
                                        handleSelectChange(
                                            "estimatedAnnualPurchaseValue",
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select value range</option>
                                    {normalizedConfig.annualPurchaseValueRanges.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Purchase Timeline"
                                name="purchaseTimeline"
                                required
                                error={errors.purchaseTimeline}
                            >
                                <select
                                    id="purchaseTimeline"
                                    name="purchaseTimeline"
                                    value={formData.purchaseTimeline}
                                    onChange={(event) =>
                                        handleSelectChange("purchaseTimeline", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select timeline</option>
                                    {normalizedConfig.purchaseTimelines.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Role in Purchase Decision"
                                name="roleInPurchaseDecision"
                                required
                                error={errors.roleInPurchaseDecision}
                            >
                                <select
                                    id="roleInPurchaseDecision"
                                    name="roleInPurchaseDecision"
                                    value={formData.roleInPurchaseDecision}
                                    onChange={(event) =>
                                        handleSelectChange(
                                            "roleInPurchaseDecision",
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select role</option>
                                    {normalizedConfig.roles.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Matchmaking Interest"
                                name="matchmakingInterest"
                                required
                                error={errors.matchmakingInterest}
                            >
                                <select
                                    id="matchmakingInterest"
                                    name="matchmakingInterest"
                                    value={formData.matchmakingInterest}
                                    onChange={(event) =>
                                        handleSelectChange("matchmakingInterest", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </Field>

                            <Field
                                label="Preferred Meeting Date"
                                name="preferredMeetingDate"
                                required
                                error={errors.preferredMeetingDate}
                            >
                                <input
                                    id="preferredMeetingDate"
                                    name="preferredMeetingDate"
                                    type="date"
                                    value={formData.preferredMeetingDate}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Preferred Time Slot"
                                name="preferredTimeSlot"
                                required
                                error={errors.preferredTimeSlot}
                            >
                                <select
                                    id="preferredTimeSlot"
                                    name="preferredTimeSlot"
                                    value={formData.preferredTimeSlot}
                                    onChange={(event) =>
                                        handleSelectChange("preferredTimeSlot", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select time slot</option>
                                    <option value="Morning (10AM - 1PM)">Morning (10AM - 1PM)</option>
                                    <option value="Afternoon (2PM - 4PM)">
                                        Afternoon (2PM - 4PM)
                                    </option>
                                    <option value="Evening (4PM - 6PM)">Evening (4PM - 6PM)</option>
                                </select>
                            </Field>

                            <Field
                                label="Pre-scheduled B2B"
                                name="requirePreScheduledB2B"
                                error={errors.requirePreScheduledB2B}
                            >
                                <select
                                    id="requirePreScheduledB2B"
                                    name="requirePreScheduledB2B"
                                    value={formData.requirePreScheduledB2B}
                                    onChange={(event) =>
                                        handleSelectChange("requirePreScheduledB2B", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </Field>

                            <Field
                                label="Meeting Priority Level"
                                name="meetingPriorityLevel"
                                error={errors.meetingPriorityLevel}
                            >
                                <select
                                    id="meetingPriorityLevel"
                                    name="meetingPriorityLevel"
                                    value={formData.meetingPriorityLevel}
                                    onChange={(event) =>
                                        handleSelectChange("meetingPriorityLevel", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    {normalizedConfig.meetingPriorityLevels.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={FileText} title="Compliance, Pricing & Notes" />
                        <div className="space-y-5">
                            <CheckboxChipGroup
                                name="requiredCertifications"
                                label="Required Certifications"
                                options={normalizedConfig.certificationOptions}
                                values={formData.requiredCertifications}
                                onToggle={toggleArrayValue}
                                error={errors.requiredCertifications}
                            />

                            <div className="grid gap-5 md:grid-cols-2">
                                <Field
                                    label="Pricing Preference"
                                    name="pricingPreference"
                                    error={errors.pricingPreference}
                                >
                                    <div className="flex flex-wrap gap-3 rounded-[2px] border border-slate-300 p-3">
                                        {["Premium", "Mid-Range", "Budget"].map((item) => (
                                            <label
                                                key={item}
                                                className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${formData.pricingPreference === item
                                                        ? "border-[#23471d] bg-[#23471d] text-white"
                                                        : "border-slate-300 text-slate-600 hover:border-[#23471d]"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="pricingPreference"
                                                    value={item}
                                                    checked={formData.pricingPreference === item}
                                                    onChange={(event) =>
                                                        handleSelectChange("pricingPreference", event.target.value)
                                                    }
                                                    className="hidden"
                                                />
                                                {item}
                                            </label>
                                        ))}
                                    </div>
                                </Field>

                                <Field
                                    label="Logistics Requirements"
                                    name="logisticsRequirements"
                                    error={errors.logisticsRequirements}
                                >
                                    <textarea
                                        id="logisticsRequirements"
                                        name="logisticsRequirements"
                                        value={formData.logisticsRequirements}
                                        onChange={handleInputChange}
                                        placeholder="Mention delivery, warehousing, or shipping requirements if any."
                                        className={`${inputClass} min-h-[90px] resize-y`}
                                    />
                                </Field>
                            </div>

                            <Field label="Remarks" name="remarks" error={errors.remarks}>
                                <textarea
                                    id="remarks"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                    placeholder="Any internal or buyer-side notes for the registration."
                                    className={`${inputClass} min-h-[90px] resize-y`}
                                />
                            </Field>
                        </div>
                    </section>

                    <section data-field="registrationCategory">
                        <SectionTitle icon={CreditCard} title="Registration Category" />

                        {normalizedPackages.length === 0 ? (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                                <div className="flex gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-[0.16em]">
                                            No packages configured
                                        </p>
                                        <p className="mt-2 text-sm leading-7">
                                            Please add buyer registration packages from the registration
                                            configuration page before using this form.
                                        </p>
                                        <Link
                                            to="/buyer-registration-config"
                                            className="mt-4 inline-flex rounded-[2px] bg-[#23471d] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white"
                                        >
                                            Open Registration Config
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : isFormLocked ? (
                            <div className="rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/70 p-8 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#23471d] shadow-sm">
                                    <Lock className="h-6 w-6" />
                                </div>
                                <h4 className="mt-4 text-lg font-black uppercase tracking-[0.16em] text-slate-900">
                                    Packages are locked
                                </h4>
                                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                                    Complete the required buyer details to unlock passes and
                                    membership options.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleUnlockPackages}
                                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#23471d] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#1a3516]"
                                >
                                    Unlock Packages
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {membershipPackages.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPackageView("Pass")}
                                            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${packageView === "Pass"
                                                    ? "bg-[#23471d] text-white"
                                                    : "border border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"
                                                }`}
                                        >
                                            Pass Packages
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPackageView("Membership")}
                                            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${packageView === "Membership"
                                                    ? "bg-[#23471d] text-white"
                                                    : "border border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"
                                                }`}
                                        >
                                            Membership Plans
                                        </button>
                                    </div>
                                ) : null}

                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                    {(packageView === "Membership" ? membershipPackages : passPackages).map(
                                        (pkg) => (
                                            <PackageCard
                                                key={pkg.name}
                                                pkg={pkg}
                                                selected={selectedPackage?.name === pkg.name}
                                                onSelect={handlePackageSelect}
                                            />
                                        ),
                                    )}
                                </div>

                                {selectedPackage ? (
                                    <div className="rounded-2xl border border-[#23471d]/10 bg-[#23471d]/5 p-5">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                    Selected Package
                                                </p>
                                                <h4 className="mt-2 text-xl font-black text-slate-900">
                                                    {selectedPackage.name}
                                                </h4>
                                                <p className="mt-2 text-sm font-medium text-slate-600">
                                                    Fee: {formatCurrency(selectedPackage.price)}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleOpenPolicyModal}
                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#23471d] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#1a3516]"
                                            >
                                                Review Policies & Continue
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-600">
                                        Select any package card above to continue with payment and final
                                        registration confirmation.
                                    </div>
                                )}

                                <ErrorText message={errors.registrationCategory} />
                            </div>
                        )}
                    </section>

                    <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#23471d]" />
                            <p className="leading-6">
                                The package checkout button will validate the form again, review
                                policies, and then proceed to Razorpay if the selected package is
                                paid.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-[2px] border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-100"
                            >
                                Reset Form
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    normalizedPackages.length === 0 ||
                                    (!isFormLocked && !selectedPackage)
                                }
                                className="inline-flex items-center gap-2 rounded-[2px] bg-[#23471d] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#1a3516] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing
                                    </>
                                ) : isFormLocked ? (
                                    <>
                                        Unlock Packages
                                        <Lock className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        Review & Continue
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            ) : null}

            <PolicyModal
                open={showPolicyModal}
                packageInfo={selectedPackage}
                activeTab={activePolicyTab}
                setActiveTab={setActivePolicyTab}
                policiesData={policiesData}
                consents={policyConsents}
                setConsents={setPolicyConsents}
                onClose={() => setShowPolicyModal(false)}
                onConfirm={handleConfirmPackage}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default BuyerRegistration;
