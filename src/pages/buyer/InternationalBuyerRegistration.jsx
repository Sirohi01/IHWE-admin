
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
    Plane,
    Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import {
    SERVER_URL,
    internationalBuyerApi,
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
        },
        amber: {
            bg: "bg-amber-50",
            border: "border-amber-300",
            text: "text-amber-700",
        },
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-300",
            text: "text-blue-700",
        },
        slate: {
            bg: "bg-slate-50",
            border: "border-slate-300",
            text: "text-slate-700",
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
    natureOfBusiness: ["Manufacturer", "Exporter", "Importer", "Distributor", "Wholesaler", "Retailer", "Buying Agent", "Others"],
    productCategories: ["Ayurveda", "Organic", "Wellness", "Pharma", "Cosmetics", "Nutraceuticals", "Herbal", "Skincare", "Medical Devices", "HealthTech"],
    stallTypes: ["Shell Scheme", "Bare Space", "Country Pavilion", "Premium Lounge"],
    packages: [],
};

const PAYMENT_METHODS = [
    { id: "upi", label: "UPI", icon: QrCode, description: "Google Pay, PhonePe, Paytm" },
    { id: "debitcard", label: "Debit Card", icon: CreditCard, description: "All major banks" },
    { id: "creditcard", label: "Credit Card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
    { id: "netbanking", label: "Net Banking", icon: Landmark, description: "All major banks" },
    { id: "online", label: "Online Payment Gateway", icon: Globe, description: "Digital Payment" },
];

const INITIAL_FORM_STATE = {
    brandName: "",
    legalEntityType: "",
    countryOfRegistration: "",
    yearOfEstablishment: "",
    registrationNumber: "",
    taxRegistrationNumber: "",
    importExportCode: "",
    businessLicenseNumber: "",
    natureOfBusiness: [],
    address: "",
    city: "",
    stateProvince: "",
    country: "",
    postalCode: "",
    website: "",
    linkedInPage: "",
    socialMediaLinks: [],
    primaryContact: {
        fullName: "",
        designation: "",
        mobileNumber: "",
        whatsappNumber: "",
        emailId: ""
    },
    secondaryContact: {
        fullName: "",
        designation: "",
        contactNumber: "",
        emailId: ""
    },
    productCategories: [],
    stallRequirement: {
        preferredStallType: "",
        stallSize: "",
        cornerStallRequired: "No",
        preferredHallNumber: "",
        preferredStallLocation: "",
        countryPavilionParticipation: "No"
    },
    sponsorship: {
        interested: "No",
        preferredType: ""
    },
    businessProfile: {
        companyProfileShort: "",
        keyProductsServices: "",
        exportCountries: "",
        existingMajorClients: "",
        certifications: []
    },
    b2bInterest: {
        interested: "No",
        lookingFor: []
    },
    travelSupport: {
        visaInvitation: "No",
        hotelBooking: "No",
        airportPickup: "No",
        translatorSupport: "No",
        arrivalDate: "",
        departureDate: ""
    },
    billingDetails: {
        billingName: "",
        billingAddress: "",
        accountsContactPerson: "",
        accountsEmail: "",
        accountsMobileNumber: "",
        invoiceRequired: "No",
        paymentMode: "",
        bookingAmountPaid: "",
        utrTransactionId: ""
    },
    vipProgram: {
        interested: "No"
    },
    verification: {
        adminApprovalStatus: "Pending"
    },
    paymentStatus: "Pending",
    remarks: "",
    registrationCategory: "",
    registrationFee: "",
    companyRegistrationCertificate: "",
    taxRegistrationCertificate: "",
    passportCopy: "",
    productCatalogue: "",
    companyBrochure: "",
    logo: "",
    visitingCard: "",
    productCertifications: "",
    previousParticipationProof: "",
    paymentScreenshot: ""
};

const inputClass = "w-full h-9 px-3 py-0 rounded-[2px] border border-slate-400 bg-white text-left text-[12px] font-medium text-slate-900 outline-none shadow-none transition-all ring-offset-background focus:border-[#23471d] focus:ring-[#23471d]/10 placeholder:text-slate-400 font-sans";
const textareaClass = "w-full px-3 py-2 rounded-[2px] border border-slate-400 bg-white text-left text-[12px] font-medium text-slate-900 outline-none shadow-none transition-all ring-offset-background focus:border-[#23471d] focus:ring-[#23471d]/10 placeholder:text-slate-400 font-sans resize-y";
const selectClass = "w-full h-9 px-3 py-0 rounded-[2px] border border-slate-400 bg-white text-left text-[12px] font-medium text-slate-900 outline-none shadow-none transition-all ring-offset-background focus:border-[#23471d] focus:ring-[#23471d]/10 placeholder:text-slate-400 font-sans appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364758b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-8";
const labelClass = "text-[12px] font-semibold text-slate-900 mb-1 block text-left font-sans";
const sectionTitleClass = "text-[13px] font-black text-[#23471d] pb-1 border-b border-emerald-500/20 flex items-center gap-1.5 mb-3 uppercase tracking-tight font-sans";

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
        {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
);

const PackageCard = ({ pkg, selected, onSelect, disabled }) => {
    const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];
    return (
        <button
            type="button"
            onClick={() => !disabled && onSelect(pkg)}
            disabled={disabled}
            className={`relative flex h-full flex-col rounded-xl border-2 p-5 text-left transition ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${selected ? "border-[#23471d] bg-white shadow-xl shadow-[#23471d]/10 ring-4 ring-[#23471d]/5" : "border-slate-200 bg-white hover:border-[#23471d]/40 hover:shadow-lg"}`}
        >
            <div className="mb-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Package</p>
                <h4 className="mt-2 text-lg font-black text-slate-900">{pkg.name}</h4>
                <p className="mt-2 text-2xl font-black text-[#23471d]">₹{pkg.price}</p>
            </div>
            <div className="flex-1 space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">{pkg.description || "International buyer package with relevant event support."}</p>
                {benefits.length > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Benefits</p>
                        <ul className="space-y-2 text-sm text-slate-700">
                            {benefits.slice(0, 5).map((benefit, index) => (
                                <li key={index} className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className={`mt-5 rounded-lg px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] transition ${selected ? "bg-[#23471d] text-white" : disabled ? "bg-slate-200 text-slate-400" : "bg-slate-100 text-slate-600 group-hover:bg-[#23471d]"}`}>
                {selected ? "Selected" : (disabled ? "Complete Form" : "Select")}
            </div>
        </button>
    );
};

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
        </label>
    );
};

const InternationalBuyerRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedRegistrationId, setSubmittedRegistrationId] = useState("");
    const [config, setConfig] = useState(FALLBACK_CONFIG);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [heroData, setHeroData] = useState(null);
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingLocations, setLoadingLocations] = useState({ states: false, cities: false });
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
    const [canSelectPackage, setCanSelectPackage] = useState(false);
    const [newSocialLink, setNewSocialLink] = useState("");
    const [files, setFiles] = useState({});

    const [packageView, setPackageView] = useState("Pass");

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingPage(true);
            try {
                const [heroRes, countryRes, configRes] = await Promise.allSettled([
                    heroBackgroundApi.getByPage("Registration / International Buyer Registration"),
                    crmApi.getCountries(),
                    internationalBuyerApi.getConfig()
                ]);
                if (heroRes.status === "fulfilled") setHeroData(heroRes.value);
                if (countryRes.status === "fulfilled") setCountries(countryRes.value);
                if (configRes.status === "fulfilled") {
                    const payload = configRes.value?.data || configRes.value;
                    if (payload) setConfig(prev => ({ ...prev, ...payload }));
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoadingPage(false);
            }
        };
        fetchInitialData();
    }, []);

    const normalizedPackages = useMemo(() => {
        const pkgs = Array.isArray(config?.packages) ? config.packages : [];
        return pkgs.map(pkg => ({
            ...pkg,
            category: pkg.name.toLowerCase().includes("membership") ? "Membership" : "Pass"
        }));
    }, [config.packages]);

    const passPackages = useMemo(() => normalizedPackages.filter(p => p.category === "Pass"), [normalizedPackages]);
    const membershipPackages = useMemo(() => normalizedPackages.filter(p => p.category === "Membership"), [normalizedPackages]);

    useEffect(() => {
        if (passPackages.length === 0 && membershipPackages.length > 0) {
            setPackageView("Membership");
        }
    }, [passPackages, membershipPackages]);

    useEffect(() => {
        const fetchStates = async () => {
            if (!formData.country) { setStates([]); setCities([]); return; }
            const selectedCountry = countries.find(c => c.name === formData.country);
            if (!selectedCountry?.countryCode) { setStates([]); return; }
            setLoadingLocations(prev => ({ ...prev, states: true }));
            try {
                const res = await crmApi.getStates(selectedCountry.countryCode);
                setStates(res);
            } catch (e) { console.error(e); }
            finally { setLoadingLocations(prev => ({ ...prev, states: false })); }
        };
        fetchStates();
    }, [formData.country, countries]);

    useEffect(() => {
        const fetchCities = async () => {
            if (!formData.stateProvince) { setCities([]); return; }
            const selectedState = states.find(s => s.name === formData.stateProvince);
            if (!selectedState?.stateCode) { setCities([]); return; }
            setLoadingLocations(prev => ({ ...prev, cities: true }));
            try {
                const res = await crmApi.getCities(selectedState.stateCode);
                setCities(res);
            } catch (e) { console.error(e); }
            finally { setLoadingLocations(prev => ({ ...prev, cities: false })); }
        };
        fetchCities();
    }, [formData.stateProvince, states]);

    useEffect(() => {
        const isValid = !!(formData.brandName && formData.country && formData.primaryContact.fullName && formData.primaryContact.emailId && formData.primaryContact.mobileNumber);
        setCanSelectPackage(isValid);
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddSocialLink = () => {
        if (newSocialLink.trim()) {
            const links = Array.isArray(formData.socialMediaLinks) ? formData.socialMediaLinks : [];
            setFormData(prev => ({ ...prev, socialMediaLinks: [...links, newSocialLink.trim()] }));
            setNewSocialLink("");
        }
    };
    const handleRemoveSocialLink = (index) => {
        const links = Array.isArray(formData.socialMediaLinks) ? [...formData.socialMediaLinks] : [];
        links.splice(index, 1);
        setFormData(prev => ({ ...prev, socialMediaLinks: links }));
    };

    const handleSelectChange = (name, value) => {
        if (name === "country") {
            setFormData(prev => ({ ...prev, country: value, stateProvince: "", city: "" }));
        } else if (name === "stateProvince") {
            setFormData(prev => ({ ...prev, stateProvince: value, city: "" }));
        } else {
            handleInputChange({ target: { name, value } });
        }
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
        }
    };

    const handleMultiSelect = (name, value) => {
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg);
        setFormData(prev => ({ ...prev, registrationCategory: pkg.name, registrationFee: `₹${pkg.price}` }));
    };

    const togglePaymentMethod = (id) => {
        setSelectedPaymentMethods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const finalFormData = new FormData();
            
            // Append form data fields
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    finalFormData.append(key, JSON.stringify(value));
                } else if (Array.isArray(value)) {
                    finalFormData.append(key, JSON.stringify(value));
                } else {
                    finalFormData.append(key, value);
                }
            });

            // Append payment mode
            finalFormData.append('paymentMode', selectedPaymentMethods.join(", "));

            // Append files
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    finalFormData.append(key, files[key]);
                }
            });

            const res = await internationalBuyerApi.submit(finalFormData);
            if (res.success) {
                setSubmitted(true);
                setSubmittedRegistrationId(res.data?.registrationId || res.data?._id);
                toast.success("International Buyer registered successfully!");
            } else {
                toast.error(res.message || "Failed to register");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingPage) {
        return (
            <div className="mt-6 flex min-h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-[#23471d]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading international registration form
                </div>
            </div>
        );
    }

    const heroImage = heroData?.backgroundImage ? (heroData.backgroundImage.startsWith("http") ? heroData.backgroundImage : `${SERVER_URL}${heroData.backgroundImage}`) : "";

    return (
        <div className="mt-6 space-y-6 pb-10">
            <PageHeader title="International Buyer Registration" description="Register a new international buyer with a premium workflow.">
                <Link to="/international-buyer-list" className="rounded-[2px] border border-slate-300 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 transition hover:border-[#23471d] hover:text-[#23471d]">View List</Link>
            </PageHeader>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative">
                    {heroImage ? <img src={heroImage} alt="Hero" className="h-[280px] w-full object-cover" /> : <div className="h-[280px] w-full bg-[radial-gradient(circle_at_top_left,_#f0fdf4,_#dcfce7_35%,_#ffffff_78%)]" />}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/55 to-[#23471d]/35" />
                    <div className="absolute inset-0 flex items-end">
                        <div className="max-w-4xl p-8 text-white md:p-10">
                            <h2 className="text-3xl font-black uppercase leading-tight md:text-4xl">{heroData?.title || "International Registration Desk"}</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/90 md:text-base">{heroData?.shortDescription || "Onboard international buyers with a structured, high-quality registration process."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {submitted ? (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
                    <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"><CheckCircle2 className="h-7 w-7" /></div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">Registration Successful</h3>
                            <p className="mt-2 text-sm text-slate-600">ID: {submittedRegistrationId}</p>
                            <button onClick={() => window.location.reload()} className="mt-4 rounded-[2px] bg-[#23471d] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white">Register Another</button>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] md:p-8">
                    <section>
                        <SectionTitle icon={UserRound} title="Section 1 – Personal & Contact Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Full Name *" name="primaryContact.fullName" required>
                                <input name="primaryContact.fullName" value={formData.primaryContact.fullName} onChange={handleInputChange} placeholder="Full Name" className={inputClass} />
                            </Field>
                            <Field label="Designation" name="primaryContact.designation">
                                <input name="primaryContact.designation" value={formData.primaryContact.designation} onChange={handleInputChange} placeholder="Designation" className={inputClass} />
                            </Field>
                            <Field label="Email Address *" name="primaryContact.emailId" required>
                                <input name="primaryContact.emailId" type="email" value={formData.primaryContact.emailId} onChange={handleInputChange} placeholder="Email" className={inputClass} />
                            </Field>
                            <Field label={<span>Mobile Number * <div className="inline-flex w-32 overflow-hidden align-middle ml-2 items-center h-4 relative"><motion.span initial={{ x: "100%" }} animate={{ x: "-100%" }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="text-red-500 text-[10px] uppercase font-semibold tracking-wide whitespace-nowrap absolute">Our team will contact you</motion.span></div></span>} name="primaryContact.mobileNumber" required>
                                <input name="primaryContact.mobileNumber" value={formData.primaryContact.mobileNumber} onChange={handleInputChange} placeholder="Mobile" className={inputClass} />
                            </Field>
                            <Field label="WhatsApp Number" name="primaryContact.whatsappNumber">
                                <input name="primaryContact.whatsappNumber" value={formData.primaryContact.whatsappNumber} onChange={handleInputChange} placeholder="WhatsApp" className={inputClass} />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={MapPin} title="Section 2 – Registered Office Details" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Country *" name="country" required>
                                <select name="country" value={formData.country} onChange={(e) => handleSelectChange("country", e.target.value)} className={selectClass}>
                                    <option value="">Select Country</option>
                                    {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                            </Field>
                            <Field label="State/Province" name="stateProvince">
                                <select name="stateProvince" value={formData.stateProvince} onChange={(e) => handleSelectChange("stateProvince", e.target.value)} className={selectClass} disabled={loadingLocations.states}>
                                    <option value="">{loadingLocations.states ? "Loading..." : "Select State"}</option>
                                    {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                </select>
                            </Field>
                            <Field label="City *" name="city" required>
                                <select name="city" value={formData.city} onChange={(e) => handleSelectChange("city", e.target.value)} className={selectClass} disabled={!formData.stateProvince || loadingLocations.cities}>
                                    <option value="">{loadingLocations.cities ? "Loading..." : "Select City"}</option>
                                    {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Postal Code" name="postalCode">
                                <input name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="Postal Code" className={inputClass} />
                            </Field>
                            <Field label="Full Address *" name="address" required>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Full Registered Address" className={textareaClass} rows={1} />
                            </Field>
                            <Field label="Website" name="website">
                                <input name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." className={inputClass} />
                            </Field>
                            <Field label="LinkedIn Company Page" name="linkedInPage">
                                <input name="linkedInPage" value={formData.linkedInPage} onChange={handleInputChange} placeholder="https://linkedin.com/company/..." className={inputClass} />
                            </Field>
                            <Field label="Social Media Links" name="socialMediaLinks">
                                <div className="flex gap-2">
                                    <input
                                        value={newSocialLink}
                                        onChange={(e) => setNewSocialLink(e.target.value)}
                                        placeholder="Instagram, Facebook, Twitter links..."
                                        className={inputClass}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSocialLink();
                                            }
                                        }}
                                    />
                                    <button type="button" onClick={handleAddSocialLink} className="bg-slate-800 text-white rounded-md px-4 text-xs shrink-0 hover:bg-slate-700 transition-colors">Add</button>
                                </div>
                                {Array.isArray(formData.socialMediaLinks) && formData.socialMediaLinks.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.socialMediaLinks.map((link, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-1 text-[10px] rounded flex items-center gap-1 border border-slate-200">
                                                <a href={link} target="_blank" rel="noopener noreferrer" className="truncate max-w-[150px]">{link}</a>
                                                <button type="button" onClick={() => handleRemoveSocialLink(idx)} className="text-slate-500 hover:text-red-500 ml-1"><X size={10} /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Building2} title="Section 3 – Company Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Brand / Company Name *" name="brandName" required>
                                <input name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="Company Name" className={inputClass} />
                            </Field>
                            <Field label="Legal Entity Type" name="legalEntityType">
                                <select name="legalEntityType" value={formData.legalEntityType} onChange={handleInputChange} className={selectClass}>
                                    <option value="">Select type</option>
                                    {['Private Limited', 'Public Limited', 'LLC', 'LLP', 'Partnership', 'Proprietorship', 'Government Organization', 'Trade Association', 'Embassy / Delegation', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field label="Year of Establishment" name="yearOfEstablishment">
                                <input name="yearOfEstablishment" value={formData.yearOfEstablishment} onChange={handleInputChange} placeholder="e.g. 2010" className={inputClass} />
                            </Field>
                            <Field label="Country of Reg. *" name="countryOfRegistration" required>
                                <input name="countryOfRegistration" value={formData.countryOfRegistration} onChange={handleInputChange} placeholder="Country of Registration" className={inputClass} />
                            </Field>
                            <Field label="Company Reg. Number" name="registrationNumber">
                                <input name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="Reg number" className={inputClass} />
                            </Field>
                            <Field label="VAT / GST / Tax Reg. No." name="taxRegistrationNumber">
                                <input name="taxRegistrationNumber" value={formData.taxRegistrationNumber} onChange={handleInputChange} placeholder="Tax ID" className={inputClass} />
                            </Field>
                            <Field label="IEC Code" name="importExportCode">
                                <input name="importExportCode" value={formData.importExportCode} onChange={handleInputChange} placeholder="IEC Code" className={inputClass} />
                            </Field>
                            <Field label="Business License Number" name="businessLicenseNumber">
                                <input name="businessLicenseNumber" value={formData.businessLicenseNumber} onChange={handleInputChange} placeholder="License number" className={inputClass} />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Phone} title="Section 4 – Secondary Contact Person" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Full Name" name="secondaryContact.fullName">
                                <input name="secondaryContact.fullName" value={formData.secondaryContact.fullName} onChange={handleInputChange} placeholder="Full Name" className={inputClass} />
                            </Field>
                            <Field label="Designation" name="secondaryContact.designation">
                                <input name="secondaryContact.designation" value={formData.secondaryContact.designation} onChange={handleInputChange} placeholder="Designation" className={inputClass} />
                            </Field>
                            <Field label="Contact Number" name="secondaryContact.contactNumber">
                                <input name="secondaryContact.contactNumber" value={formData.secondaryContact.contactNumber} onChange={handleInputChange} placeholder="Mobile" className={inputClass} />
                            </Field>
                            <Field label="Email ID" name="secondaryContact.emailId">
                                <input name="secondaryContact.emailId" type="email" value={formData.secondaryContact.emailId} onChange={handleInputChange} placeholder="Email" className={inputClass} />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Globe2} title="Section 5 – Product & Nature of Business" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <div>
                                <label className={labelClass}>Nature of Business</label>
                                <MultiSelectDropdown options={config.natureOfBusiness} selected={formData.natureOfBusiness} onChange={(val) => handleMultiSelect("natureOfBusiness", val)} placeholder="Select..." accentColor="emerald" />
                            </div>
                            <div>
                                <label className={labelClass}>Product Categories</label>
                                <MultiSelectDropdown options={config.productCategories} selected={formData.productCategories} onChange={(val) => handleMultiSelect("productCategories", val)} placeholder="Select..." accentColor="emerald" />
                            </div>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={FileText} title="Section 6 – Stall Requirement" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Preferred Stall Type" name="stallRequirement.preferredStallType">
                                <select name="stallRequirement.preferredStallType" value={formData.stallRequirement.preferredStallType} onChange={handleInputChange} className={selectClass}>
                                    <option value="">Select Type</option>
                                    {['Shell Scheme', 'Bare Space', 'Premium Pavilion', 'International Pavilion', 'Country Pavilion', 'Startup Pavilion'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field label="Stall Size Requirement" name="stallRequirement.stallSize">
                                <select name="stallRequirement.stallSize" value={formData.stallRequirement.stallSize} onChange={handleInputChange} className={selectClass}>
                                    <option value="">Select Size</option>
                                    {['9 sqm', '18 sqm', '27 sqm', '36 sqm', '54 sqm', 'Custom Size'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                            <Field label="Corner Stall Required?" name="stallRequirement.cornerStallRequired">
                                <select name="stallRequirement.cornerStallRequired" value={formData.stallRequirement.cornerStallRequired} onChange={handleInputChange} className={selectClass}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>

                            <Field label="Preferred Stall Location" name="stallRequirement.preferredStallLocation">
                                <select name="stallRequirement.preferredStallLocation" value={formData.stallRequirement.preferredStallLocation} onChange={handleInputChange} className={selectClass}>
                                    <option value="">Select...</option>
                                    <option value="One Side Open">One Side Open</option>
                                    <option value="Two Side Open">Two Side Open</option>
                                    <option value="Three Side Open">Three Side Open</option>
                                </select>
                            </Field>
                            <Field label="Country Pavilion Participation" name="stallRequirement.countryPavilionParticipation">
                                <select name="stallRequirement.countryPavilionParticipation" value={formData.stallRequirement.countryPavilionParticipation} onChange={handleInputChange} className={selectClass}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Globe} title="Section 7 – Sponsorship Interest" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Interested in Sponsorship?" name="sponsorship.interested">
                                <select name="sponsorship.interested" value={formData.sponsorship.interested} onChange={handleInputChange} className={selectClass}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                            <Field label="Preferred Sponsorship Type" name="sponsorship.preferredType">
                                <select name="sponsorship.preferredType" value={formData.sponsorship.preferredType} onChange={handleInputChange} className={selectClass} disabled={formData.sponsorship.interested === 'No'}>
                                    <option value="">Select Type</option>
                                    {['Title Sponsor', 'Powered By Sponsor', 'Associate Sponsor', 'Session Sponsor', 'Delegate Bag Sponsor', 'Lanyard Sponsor', 'Registration Desk Sponsor', 'Knowledge Session Sponsor', 'International Buyer Lounge Sponsor'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Briefcase} title="Section 8 & 9 – Profile & B2B Interest" />
                        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Company Profile (Short)" name="businessProfile.companyProfileShort">
                                <input name="businessProfile.companyProfileShort" value={formData.businessProfile.companyProfileShort} onChange={handleInputChange} placeholder="Short bio" className={inputClass} />
                            </Field>
                            <Field label="Key Products / Services" name="businessProfile.keyProductsServices">
                                <input name="businessProfile.keyProductsServices" value={formData.businessProfile.keyProductsServices} onChange={handleInputChange} placeholder="Top products" className={inputClass} />
                            </Field>
                            <Field label="Export Countries" name="businessProfile.exportCountries">
                                <input name="businessProfile.exportCountries" value={formData.businessProfile.exportCountries} onChange={handleInputChange} placeholder="Countries" className={inputClass} />
                            </Field>
                            <Field label="Existing Major Clients" name="businessProfile.existingMajorClients">
                                <input name="businessProfile.existingMajorClients" value={formData.businessProfile.existingMajorClients} onChange={handleInputChange} placeholder="Key clients" className={inputClass} />
                            </Field>
                            <div>
                                <label className={labelClass}>Certifications</label>
                                <MultiSelectDropdown options={['ISO', 'CE', 'FDA', 'GMP', 'WHO-GMP', 'AYUSH Certified', 'Organic Certification', 'Other']} selected={formData.businessProfile.certifications} onChange={(val) => handleMultiSelect("businessProfile.certifications", val)} placeholder="Select..." accentColor="amber" />
                            </div>
                            <Field label="B2B Meetings Interested?" name="b2bInterest.interested">
                                <select name="b2bInterest.interested" value={formData.b2bInterest.interested} onChange={handleInputChange} className={selectClass}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                            <div>
                                <label className={labelClass}>Looking For</label>
                                <MultiSelectDropdown options={["Distributors", "Importers", "Hospital Buyers", "Government Buyers", "Franchise Partners", "Investors", "OEM Partners", "Strategic Collaborations"]} selected={formData.b2bInterest.lookingFor} onChange={(val) => handleMultiSelect("b2bInterest.lookingFor", val)} placeholder="Select..." accentColor="amber" />
                            </div>
                        </div>
                    </section>
                    <section>
                        <SectionTitle icon={Plane} title="Section 10 – Travel Support" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Visa Invitation" name="travelSupport.visaInvitation">
                                <select name="travelSupport.visaInvitation" value={formData.travelSupport.visaInvitation} onChange={handleInputChange} className={selectClass}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                            <Field label="Hotel Booking" name="travelSupport.hotelBooking">
                                <select name="travelSupport.hotelBooking" value={formData.travelSupport.hotelBooking} onChange={handleInputChange} className={selectClass}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                            <Field label="Airport Pickup" name="travelSupport.airportPickup">
                                <select name="travelSupport.airportPickup" value={formData.travelSupport.airportPickup} onChange={handleInputChange} className={selectClass}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                            <Field label="Translator Support" name="travelSupport.translatorSupport">
                                <select name="travelSupport.translatorSupport" value={formData.travelSupport.translatorSupport} onChange={handleInputChange} className={selectClass}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                            <Field label="Arrival Date" name="travelSupport.arrivalDate">
                                <input name="travelSupport.arrivalDate" type="date" value={formData.travelSupport.arrivalDate} onChange={handleInputChange} className={inputClass} />
                            </Field>
                            <Field label="Departure Date" name="travelSupport.departureDate">
                                <input name="travelSupport.departureDate" type="date" value={formData.travelSupport.departureDate} onChange={handleInputChange} className={inputClass} />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Landmark} title="Section 11 – Billing & Payment Details" />
                        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-x-3 gap-y-3">
                            <Field label="Billing Name" name="billingDetails.billingName">
                                <input name="billingDetails.billingName" value={formData.billingDetails.billingName} onChange={handleInputChange} placeholder="Billing Name" className={inputClass} />
                            </Field>
                            <Field label="Billing Address" name="billingDetails.billingAddress">
                                <input name="billingDetails.billingAddress" value={formData.billingDetails.billingAddress} onChange={handleInputChange} placeholder="Full Address" className={inputClass} />
                            </Field>
                            <Field label="Accounts Contact" name="billingDetails.accountsContactPerson">
                                <input name="billingDetails.accountsContactPerson" value={formData.billingDetails.accountsContactPerson} onChange={handleInputChange} placeholder="Name" className={inputClass} />
                            </Field>
                            <Field label="Accounts Email" name="billingDetails.accountsEmail">
                                <input name="billingDetails.accountsEmail" type="email" value={formData.billingDetails.accountsEmail} onChange={handleInputChange} placeholder="email@example.com" className={inputClass} />
                            </Field>
                            <Field label="Accounts Mobile" name="billingDetails.accountsMobileNumber">
                                <input name="billingDetails.accountsMobileNumber" value={formData.billingDetails.accountsMobileNumber} onChange={handleInputChange} placeholder="Mobile" className={inputClass} />
                            </Field>
                            <Field label="Invoice Required" name="billingDetails.invoiceRequired">
                                <select name="billingDetails.invoiceRequired" value={formData.billingDetails.invoiceRequired} onChange={handleInputChange} className={selectClass}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </Field>
                            <Field label="Payment Mode" name="billingDetails.paymentMode">
                                <select name="billingDetails.paymentMode" value={formData.billingDetails.paymentMode} onChange={handleInputChange} className={selectClass}>
                                    <option value="">Select Mode</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Online Payment Gateway">Online Payment Gateway</option>
                                </select>
                            </Field>
                            <Field label="Booking Amount Paid" name="billingDetails.bookingAmountPaid">
                                <input name="billingDetails.bookingAmountPaid" value={formData.billingDetails.bookingAmountPaid} onChange={handleInputChange} placeholder="e.g. ₹25000" className={inputClass} />
                            </Field>
                            <Field label="UTR / Transaction ID" name="billingDetails.utrTransactionId">
                                <input name="billingDetails.utrTransactionId" value={formData.billingDetails.utrTransactionId} onChange={handleInputChange} placeholder="Transaction reference" className={inputClass} />
                            </Field>
                        </div>
                    </section>



                    <section>
                        <SectionTitle icon={Upload} title="Section 12 – Document Upload" />
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[
                                { label: 'Company Registration', name: 'companyRegistrationCertificate' },
                                { label: 'Tax Registration', name: 'taxRegistrationCertificate' },
                                { label: 'Passport Copy', name: 'passportCopy' },
                                { label: 'Product Catalogue', name: 'productCatalogue' },
                                { label: 'Company Brochure', name: 'companyBrochure' },
                                { label: 'Logo (High Res)', name: 'logo' },
                                { label: 'Visiting Card', name: 'visitingCard' },
                                { label: 'Product Certs', name: 'productCertifications' },
                                { label: 'Previous Proof', name: 'previousParticipationProof' },
                                { label: 'Payment Screenshot', name: 'paymentScreenshot' }
                            ].map(doc => (
                                <div key={doc.name} className="p-3 border border-dashed border-slate-300 rounded-md bg-slate-50 flex flex-col gap-2">
                                    <label className="text-[11px] font-bold">{doc.label}</label>
                                    <div className="flex items-center gap-2">
                                        <input type="file" name={doc.name} onChange={handleFileChange} className="hidden" id={`admin-file-${doc.name}`} />
                                        <label htmlFor={`admin-file-${doc.name}`} className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded cursor-pointer hover:bg-slate-50 transition-colors">
                                            <Upload size={14} className="text-[#23471d]" />
                                            <span className="text-[10px] text-slate-500 truncate">{files[doc.name]?.name || "Upload"}</span>
                                        </label>
                                        {files[doc.name] && <CheckCircle2 size={14} className="text-emerald-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Clock} title="Admin Remarks & Status" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-3">
                            <Field label="Approval Status" name="verification.adminApprovalStatus">
                                <select name="verification.adminApprovalStatus" value={formData.verification.adminApprovalStatus} onChange={handleInputChange} className={selectClass}>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </Field>
                            <Field label="Payment Status" name="paymentStatus">
                                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleInputChange} className={selectClass}>
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </Field>
                            <Field label="Registration Category" name="registrationCategory">
                                <input name="registrationCategory" value={formData.registrationCategory} onChange={handleInputChange} placeholder="e.g. VIP Pass" className={inputClass} />
                            </Field>
                            <Field label="Fee Amount" name="registrationFee">
                                <input name="registrationFee" value={formData.registrationFee} onChange={handleInputChange} placeholder="e.g. ₹4999" className={inputClass} />
                            </Field>
                            <Field label="Internal Remarks" name="remarks">
                                <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} placeholder="Internal notes..." className={textareaClass} rows={2} />
                            </Field>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={CreditCard} title="Package Selection 🔹" />
                        <div className="space-y-6">
                            <div className={`rounded-2xl border p-4 ${canSelectPackage ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                                <p className="text-sm font-medium">{canSelectPackage ? "✅ Ready to select package!" : "⚠️ Fill required fields to select package."}</p>
                            </div>

                            {membershipPackages.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPackageView("Pass")}
                                        className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${packageView === "Pass" ? "bg-[#23471d] text-white" : "border border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"}`}
                                    >
                                        Pass Packages
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPackageView("Membership")}
                                        className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${packageView === "Membership" ? "bg-[#23471d] text-white" : "border border-slate-300 bg-white text-slate-600 hover:border-[#23471d]"}`}
                                    >
                                        Membership Plans
                                    </button>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {(packageView === "Membership" ? membershipPackages : passPackages).map(pkg => (
                                    <PackageCard key={pkg.name} pkg={pkg} selected={selectedPackage?.name === pkg.name} onSelect={handlePackageSelect} disabled={!canSelectPackage} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {selectedPackage && (
                        <section className="mt-8 rounded-2xl border border-slate-200 p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-[#23471d]" />
                                <h4 className="text-sm font-black uppercase tracking-[0.18em]">Payment Methods</h4>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                                {PAYMENT_METHODS.map(m => (
                                    <PaymentMethodCard key={m.id} method={m} selected={selectedPaymentMethods.includes(m.id)} onToggle={togglePaymentMethod} />
                                ))}
                            </div>
                        </section>
                    )}


                    <div className="flex justify-end gap-3 border-t pt-6">
                        <button type="button" onClick={() => window.location.reload()} className="rounded-[2px] border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-red-700 hover:bg-red-100">Reset</button>
                        <button type="submit" disabled={isSubmitting || !selectedPackage} className="inline-flex items-center gap-2 rounded-[2px] bg-[#23471d] px-8 py-3 text-sm font-black uppercase tracking-[0.16em] text-white hover:bg-[#1a3516] disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {isSubmitting ? "Submitting..." : "Submit Registration"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default InternationalBuyerRegistration;
