import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    UserPlus,
    Save,
    RotateCcw,
    ArrowLeft,
    Plus,
    Trash2,
    Globe,
    Calendar,
    UserCheck,
    Briefcase,
    LayoutGrid,
    Navigation,
    Clock,
    UserCircle,
    ChevronRight,
    ArrowRightCircle,
    Upload,
    ArrowRight,
    Shield,
    PhoneCall,
    Flame,
    PauseCircle
} from "lucide-react";
import Swal from "sweetalert2";
import { fetchUsers, fetchAdmins } from "../../features/auth/userSlice";
import { fetchCategories } from "../../features/add_by_admin/category/categorySlice";
import { fetchNatures } from "../../features/add_by_admin/nature/natureSlice";
import { fetchCountries } from "../../features/add_by_admin/country/countrySlice";
import { fetchStates } from "../../features/state/stateSlice";
import { fetchCities } from "../../features/city/citySlice";
import { fetchDataSources } from "../../features/add_by_admin/dataSource/dataSourceSlice";
import api from "../../lib/api";
import {
    addCompany,
    fetchCompanies,
    updateCompany,
} from "../../features/company/companySlice";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";
import SearchableDropdown from "../../components/SearchableDropdown";
import { useEventContext } from "../../context/EventContext";

// Helper function to safely extract an array from any Redux slice
const getArrayFromSlice = (sliceState, fallbackKey) => {
    if (Array.isArray(sliceState)) return sliceState;
    if (sliceState && typeof sliceState === "object" && fallbackKey in sliceState && Array.isArray(sliceState[fallbackKey])) {
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
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentEventId, currentEvent } = useEventContext();
    const isCrmEventScope = Boolean(currentEvent?.event_name);

    // 🧩 Form State
    const [formData, setFormData] = useState({
        clientType: "Domestic",
        companyName: "",
        category: "",
        exhibitorCategory: "Under General Category",
        businessNature: "",
        address: "",
        country: "India",
        state: "",
        city: "",
        pincode: "",
        website: "",
        landline: "",
        email: "",
        dataSource: "",
        socialMediaType: "",
        referralName: "",
        referralMobile: "",
        eventName: "",
        reminder: "",
        forwardTo: "",
        followUpDate: "",
        added_by: "",
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

    // ---------- Redux Selectors ----------
    const usersState = useSelector((state) => state.users);
    const users = getArrayFromSlice(usersState, "users")
        .slice()
        .sort((a, b) => (a?.username || "").localeCompare(b?.username || ""));

    const categoriesState = useSelector((state) => state.categories);
    const categoriesArray = getArrayFromSlice(categoriesState, "categories")
        .slice()
        .filter(cat => cat?.cat_status?.toLowerCase() === 'active')
        .sort((a, b) => (a?.cat_name || "").localeCompare(b?.cat_name || ""));

    const naturesState = useSelector((state) => state.natures);
    const naturesArray = getArrayFromSlice(naturesState, "natures")
        .slice()
        .filter(n => n?.nature_status?.toLowerCase() === 'active')
        .sort((a, b) => (a?.nature_name || "").localeCompare(b?.nature_name || ""));

    const countriesState = useSelector((state) => state.countries);
    const countriesArray = getArrayFromSlice(countriesState, "countries")
        .slice()
        .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

    const statesState = useSelector((state) => state.states);
    const statesArray = getArrayFromSlice(statesState, "states")
        .slice()
        .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

    const citiesState = useSelector((state) => state.cities);
    const citiesArray = getArrayFromSlice(citiesState, "cities")
        .slice()
        .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

    const dataSourcesState = useSelector((state) => state.dataSources);
    const dataSourcesArray = getArrayFromSlice(dataSourcesState, "dataSources")
        .slice()
        .sort((a, b) => (a?.source_name || "").localeCompare(b?.source_name || ""));

    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const companiesState = useSelector((state) => state.companies);
    const companiesArray = getArrayFromSlice(companiesState, "companies");

    // 🧩 Filtered Location Data
    const filteredStates = React.useMemo(() => {
        if (!formData.country || !countriesArray.length) return [];
        const selectedCountry = countriesArray.find(c =>
            c.name && c.name.trim().toLowerCase() === formData.country.trim().toLowerCase()
        );
        if (!selectedCountry) return [];
        return statesArray.filter(s =>
            s.countryCode != null && selectedCountry.countryCode != null &&
            String(s.countryCode) === String(selectedCountry.countryCode)
        );
    }, [formData.country, countriesArray, statesArray]);

    const filteredCities = React.useMemo(() => {
        if (!formData.state || !statesArray.length) return [];
        const selectedState = statesArray.find(s =>
            s.name && s.name.trim().toLowerCase() === formData.state.trim().toLowerCase()
        );
        if (!selectedState) return [];
        return citiesArray.filter(c =>
            c.stateCode != null && selectedState.stateCode != null &&
            String(c.stateCode) === String(selectedState.stateCode)
        );
    }, [formData.state, statesArray, citiesArray]);


    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/events');
            if (response.data.success) {
                setEvents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-select the first active event by default for new clients
    useEffect(() => {
        if (!id && isCrmEventScope && currentEventId) {
            setFormData(prev => ({
                ...prev,
                eventName: currentEvent.event_fullName || currentEvent.event_name || "",
            }));
            return;
        }
        if (!id && !formData.eventName && events.length > 0) {
            const activeEvents = events.filter(e => e.status === "active");
            if (activeEvents.length > 0) {
                setFormData(prev => ({ ...prev, eventName: activeEvents[0].name }));
            }
        }
    }, [events, id, formData.eventName, isCrmEventScope, currentEventId, currentEvent]);

    // Initial Data Fetch
    useEffect(() => {
        if (companiesArray.length === 0) dispatch(fetchCompanies());
        dispatch(fetchAdmins());
        dispatch(fetchCategories());
        dispatch(fetchNatures());
        dispatch(fetchCountries());
        dispatch(fetchStates());
        dispatch(fetchCities());
        dispatch(fetchDataSources());
    }, [dispatch]);

    // Auto-fetch State & City from Pincode
    useEffect(() => {
        if (formData.clientType === 'Domestic' && formData.pincode?.length === 6) {
            const timerId = setTimeout(() => {
                fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data[0] && data[0].Status === 'Success') {
                            const postOffice = data[0].PostOffice[0];
                            setFormData(prev => ({
                                ...prev,
                                state: postOffice.State,
                                city: postOffice.District
                            }));
                        }
                    })
                    .catch(err => console.error("Error fetching pincode data:", err));
            }, 600); // 600ms debounce
            return () => clearTimeout(timerId);
        }
    }, [formData.pincode, formData.clientType]);

    // Prefill form for editing
    useEffect(() => {
        if (id && companiesArray.length > 0) {
            const companyToEdit = companiesArray.find((c) => c._id === id);
            if (companyToEdit) {
                setFormData({
                    clientType: companyToEdit.clientType || "Domestic",
                    companyName: companyToEdit.companyName || "",
                    category: companyToEdit.category || "",
                    businessNature: companyToEdit.businessNature || "",
                    address: companyToEdit.address || "",
                    country: companyToEdit.country || "India",
                    state: companyToEdit.state || "",
                    city: companyToEdit.city || "",
                    pincode: companyToEdit.pincode || "",
                    website: companyToEdit.website || "",
                    landline: companyToEdit.landline || "",
                    email: companyToEdit.email || "",
                    dataSource: companyToEdit.dataSource || "",
                    socialMediaType: companyToEdit.socialMediaType || "",
                    referralName: companyToEdit.referralName || "",
                    referralMobile: companyToEdit.referralMobile || "",
                    eventName: companyToEdit.eventName || "",
                    reminder: formatReminderDate(companyToEdit.reminder) || "",
                    forwardTo: companyToEdit.forwardTo || "",
                    followUpDate: formatReminderDate(companyToEdit.followUpDate) || "",
                    added_by: companyToEdit.added_by || "",
                    updated_by: companyToEdit.updated_by || "",
                    contacts: companyToEdit.contacts.length > 0
                        ? companyToEdit.contacts
                        : [{ title: "", firstName: "", surname: "", designation: "", email: "", mobile: "", alternate: "" }],
                });
            }
        }
    }, [id, companiesArray]);

    const handleChange = (field, value) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            // ✅ CONDITION 1 & 3: clientType change par country/pincode auto-handle
            if (field === "clientType") {
                if (value === "Domestic") {
                    updated.country = "India";
                    updated.state = "";
                    updated.city = "";
                } else {
                    updated.country = "";
                    updated.state = "";
                    updated.city = "";
                    updated.pincode = ""; // ✅ International mein pincode clear
                }
            }
            return updated;
        });
    };

    const handlePincodeChange = async (val) => {
        const numericVal = val.replace(/\D/g, "");
        if (numericVal.length <= 6) {
            handleChange("pincode", numericVal);
        }

        if (numericVal.length === 6 && formData.clientType === "Domestic") {
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${numericVal}`);
                const data = await response.json();
                if (data && data[0] && data[0].Status === "Success") {
                    const postOffice = data[0].PostOffice[0];
                    const stateName = postOffice.State;
                    const cityName = postOffice.District; 
                    
                    setFormData(prev => ({
                        ...prev,
                        state: stateName,
                        city: cityName
                    }));
                }
            } catch (error) {
                console.error("Error fetching pincode details:", error);
            }
        }
    };

    const handleContactChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedContacts = prev.contacts.map((contact, i) => {
                if (i === index) return { ...contact, [field]: value };
                return contact;
            });
            return { ...prev, contacts: updatedContacts };
        });
    };

    const addContact = () => {
        setFormData((prev) => ({
            ...prev,
            contacts: [...prev.contacts, { title: "", firstName: "", surname: "", designation: "", email: "", mobile: "", alternate: "" }],
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

        // --- VALIDATIONS ---
        if (!formData.category) {
            Swal.fire({ title: "Missing Category", text: "Please select a Category.", icon: "warning", confirmButtonColor: "#23471d" });
            return;
        }
        if (!formData.businessNature) {
            Swal.fire({ title: "Missing Business Nature", text: "Please select a Nature of Business.", icon: "warning", confirmButtonColor: "#23471d" });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(formData.email)) {
            Swal.fire({ title: "Invalid Email", text: "Please enter a valid official email address (e.g., info@company.com)", icon: "warning", confirmButtonColor: "#23471d" });
            return;
        }

        for (let i = 0; i < formData.contacts.length; i++) {
            const contact = formData.contacts[i];
            if (!emailRegex.test(contact.email)) {
                Swal.fire({ title: "Invalid Email", text: `Please enter a valid email for Contact Person #${i + 1}`, icon: "warning", confirmButtonColor: "#23471d" });
                return;
            }
            if (formData.clientType === "Domestic") {
                if (contact.mobile && contact.mobile.length !== 10) {
                    Swal.fire({ title: "Invalid Mobile", text: `Mobile number must be exactly 10 digits for Contact Person #${i + 1}`, icon: "warning", confirmButtonColor: "#23471d" });
                    return;
                }
                if (contact.alternate && contact.alternate.length !== 10) {
                    Swal.fire({ title: "Invalid Alternate No", text: `Alternate number must be exactly 10 digits for Contact Person #${i + 1}`, icon: "warning", confirmButtonColor: "#23471d" });
                    return;
                }
            }
        }

        setIsSaving(true);
        try {
            let userName = sessionStorage.getItem("user_name") || "";
            try {
                // LocalStorage ya SessionStorage se "user" object fetch karke parse karein
                const userObjStr = localStorage.getItem("user") || sessionStorage.getItem("user");
                if (userObjStr) {
                    const userObj = JSON.parse(userObjStr);
                    if (userObj.username) userName = userObj.username;
                    else if (userObj.fullName) userName = userObj.fullName;
                }
            } catch (e) {
                console.error("Error parsing user data:", e);
            }

            const dataToSave = {
                ...formData,
                ...(isCrmEventScope && currentEventId ? {
                    eventId: currentEventId,
                    events: [currentEventId],
                } : {}),
                updated_by: userName || formData.updated_by,
            };
            if (id) {
                await dispatch(updateCompany({ id, data: dataToSave })).unwrap();

                // Log the activity
                const userId = sessionStorage.getItem("user_id");
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Client Data: Updated company details for '${formData.companyName}'`,
                        section: "Client Data Section",
                        data: { action: "UPDATE", company: formData.companyName, id }
                    }));
                }

                Swal.fire({
                    title: "Success!",
                    text: "Company updated successfully!",
                    icon: "success",
                    confirmButtonColor: "#23471d"
                });
                navigate(`/client-overview/${id}`);
            } else {
                // Jab naya create ho raha ho tab added_by mein bhi same name dalein
                dataToSave.added_by = userName;
                const response = await dispatch(addCompany(dataToSave)).unwrap();
                const savedEventId = response?.eventLifecycle?.eventId || response?.eventId;
                if (
                    isCrmEventScope
                    && currentEventId
                    && String(savedEventId || "") !== String(currentEventId)
                ) {
                    throw new Error("Lead was not assigned to the selected exhibition. Please try again.");
                }

                // Log the activity
                const userId = sessionStorage.getItem("user_id");
                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Client Data: Added new company '${formData.companyName}'`,
                        section: "Client Data Section",
                        data: { action: "ADD", company: formData.companyName }
                    }));
                }

                Swal.fire({
                    title: "Registered!",
                    text: `${response?.companyName || formData.companyName} added to ${currentEvent?.event_fullName || currentEvent?.event_name || "the selected exhibition"} successfully!`,
                    icon: "success",
                    confirmButtonColor: "#23471d"
                });
                handleReset();
                navigate(
                    isCrmEventScope && currentEventId
                        ? `/crm-event/${currentEventId}/new-leads`
                        : "/ihweClientData2026/newLeadList"
                );
            }
        } catch (err) {
            console.error("Failed to save company:", err);
            const errorMsg = typeof err === 'string' ? err : err?.message || err?.data?.message || "An error occurred while saving the data.";
            Swal.fire({
                title: "Error!",
                text: errorMsg,
                icon: "error",
                confirmButtonColor: "#d33"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setFormData({
            clientType: "Domestic",
            companyName: "",
            category: "",
            exhibitorCategory: "Under General Category",
            businessNature: "",
            address: "",
            country: "India",
            state: "",
            city: "",
            pincode: "",
            website: "",
            landline: "",
            email: "",
            dataSource: "",
            socialMediaType: "",
            referralName: "",
            referralMobile: "",
            eventName: "",
            reminder: "",
            forwardTo: "",
            updated_by: "",
            contacts: [{ title: "", firstName: "", surname: "", designation: "", email: "", mobile: "", alternate: "" }],
        });
    };
    const inputClasses = "rounded-[2px] border border-slate-400 py-1.5 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";
    const labelClasses = "text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter";
    const sectionHeaderClasses = "text-[16px] font-medium text-[#23471d] pb-1 border-b border-gray-300 mb-2 font-inter";

    return (
        <>
            <div className="bg-white shadow-md mt-1 p-6 min-h-screen font-inter animate-fadeIn">

                {/* ── HEADER AREA ── */}
                <div className="flex flex-col lg:flex-row justify-between items-center pb-4 border-b border-gray-300 gap-4">
                    <div className="flex flex-col items-center lg:items-start gap-1">
                        <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
                            {id ? "EDIT NEW LEADS" : "ADD NEW LEADS"} | <span className="text-[#0A2947]">LEAD SECTION</span>
                        </h1>
                    </div>
                    <div className="flex flex-wrap justify-center lg:justify-end gap-1.5 w-full lg:w-auto">
                        <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Upload size={12} /> Add New Data
                        </button>
                        <button onClick={() => navigate("/ihweClientData2026/newLeadList")} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <UserCheck size={12} /> New Leads List
                        </button>
                        <button onClick={() => navigate("/ihweClientData2026/masterData")} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <LayoutGrid size={12} /> Master List
                        </button>
                        <button onClick={() => navigate("/ihweClientData2026/confirmClientList")} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <UserCheck size={12} /> Exhibitor List
                        </button>
                        <button onClick={() => navigate("/ihweClientData2026/followUps")} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <PhoneCall size={12} /> Follow-Ups
                        </button>
                        <button onClick={() => navigate("/ihweClientData2026/hotLeads")} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Flame size={12} /> Hot Leads
                        </button>
                        <button onClick={() => navigate("/ihweClientData2026/holdLostLeads")} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <PauseCircle size={12} /> Hold / Lost Leads
                        </button>
                    </div>
                </div>

                {/* ── FORM CONTENT ── */}
                <form onSubmit={handleSave} className="mt-4 space-y-6 border border-gray-300 px-4 py-4 rounded-lg">

                    {/* SECTION: COMPANY INFORMATION */}
                    <div className="space-y-2 px-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-300 mb-2 pb-2 gap-4">
                            <h3 className="text-[16px] font-medium text-[#23471d] font-inter">Company Information</h3>
                            <div className="flex items-center gap-6">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="radio"
                                        name="clientType"
                                        value="Domestic"
                                        checked={formData.clientType === "Domestic"}
                                        onChange={(e) => handleChange("clientType", e.target.value)}
                                        className="h-4 w-4 accent-[#23471d] border-slate-400"
                                    />
                                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Domestic</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="radio"
                                        name="clientType"
                                        value="International"
                                        checked={formData.clientType === "International"}
                                        onChange={(e) => handleChange("clientType", e.target.value)}
                                        className="h-4 w-4 accent-[#23471d] border-slate-400"
                                    />
                                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">International</span>
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-x-3 gap-y-2">
                            <div>
                                <label className={labelClasses}>Company Name <span className="text-red-500">*</span></label>
                                <input required type="text" value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            <div>
                                <label className={labelClasses}>Type of Business <span className="text-red-500">*</span></label>
                                <select required value={formData.category} onChange={(e) => handleChange("category", e.target.value)} className={inputClasses}>
                                    <option value="" className="text-red-500 font-medium">Select Here</option>
                                    <option>Pvt. Ltd. Company</option>
                                    <option>Pub. Ltd. Company</option>
                                    <option>Partnership Company</option>
                                    <option>Limited Liability Partnership (LLP)</option>
                                    <option>One Person Company</option>
                                    <option>Sole Proprietorship</option>
                                    <option>Section 8 Company</option>
                                    <option>Others</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Industry / Sector <span className="text-red-500">*</span></label>
                                <select required value={formData.businessNature} onChange={(e) => handleChange("businessNature", e.target.value)} className={inputClasses}>
                                    <option value="" className="text-red-500 font-medium">Select Here</option>
                                    <option>Medical &amp; Healthcare</option>
                                    <option>AYUSH &amp; Traditional Medicine</option>
                                    <option>Wellness, Fitness &amp; Lifestyle</option>
                                    <option>Nutrition, Organic &amp; Health Foods</option>
                                    <option>Beauty, Personal Care &amp; Aesthetic Wellness</option>
                                    <option>Mental Health, Yoga &amp; Spiritual Wellness</option>
                                    <option>Medical Technology, Diagnostics &amp; Devices</option>
                                    <option>Institutions, Government Bodies &amp; Startups</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Company Website <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                                <input type="text" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            <div>
                                <label className={labelClasses}>Official Email <span className="text-red-500">*</span></label>
                                <input required type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            <div>
                                <label className={labelClasses}>Landline No.<span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                                <input type="text" value={formData.landline} onChange={(e) => handleChange("landline", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: LOCATION & ADDRESS */}
                    <div className="space-y-2 px-2">
                        <h3 className={sectionHeaderClasses}>Location & Address</h3>

                        {/* Country indicator removed per user request */}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-x-2 gap-y-2">
                            <div className="md:col-span-2 lg:col-span-2">
                                <label className={labelClasses}>Full Address <span className="text-red-500">*</span></label>
                                <input required type="text" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>

                            {/* ✅ CONDITION 3: Country (Disabled) & Pin Code — sirf Domestic mein dikhega */}
                            {formData.clientType === "Domestic" && (
                                <>
                                    <div>
                                        <label className={labelClasses}>Country <span className="text-red-500">*</span></label>
                                        <input disabled type="text" value="India" className={`${inputClasses} bg-slate-100 text-slate-500 cursor-not-allowed`} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Pin Code <span className="text-red-500">*</span></label>
                                        <input required type="text" maxLength={6} value={formData.pincode} onChange={(e) => handlePincodeChange(e.target.value)} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                </>
                            )}

                            {/* ✅ CONDITION 2: Country dropdown — sirf International mein */}
                            {formData.clientType === "International" && (
                                <div>
                                    <label className={labelClasses}>Country <span className="text-red-500">*</span></label>
                                    <SearchableDropdown
                                        name="country"
                                        value={formData.country}
                                        onChange={(e) => { handleChange("country", e.target.value); handleChange("state", ""); handleChange("city", ""); }}
                                        placeholder="Select Country"
                                        options={countriesArray.map(country => ({ label: country?.name, value: country?.name }))}
                                    />
                                </div>
                            )}

                            <div>
                                <label className={labelClasses}>State <span className="text-red-500">*</span></label>
                                {formData.clientType === "Domestic" ? (
                                    <input required type="text" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} className={inputClasses} placeholder="Auto-filled from Pincode" />
                                ) : (
                                    <SearchableDropdown
                                        name="state"
                                        value={formData.state}
                                        onChange={(e) => { handleChange("state", e.target.value); handleChange("city", ""); }}
                                        placeholder="Select State"
                                        options={filteredStates.map(state => ({ label: state?.name, value: state?.name }))}
                                        disabled={!formData.country}
                                    />
                                )}
                            </div>

                            <div>
                                <label className={labelClasses}>City / Town <span className="text-red-500">*</span></label>
                                {formData.clientType === "Domestic" ? (
                                    <input required type="text" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} className={inputClasses} placeholder="Auto-filled from Pincode" />
                                ) : (
                                    <SearchableDropdown
                                        name="city"
                                        value={formData.city}
                                        onChange={(e) => handleChange("city", e.target.value)}
                                        placeholder="Select City"
                                        options={filteredCities.map(city => ({ label: city?.name, value: city?.name }))}
                                        disabled={!formData.state}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION: CONTACT DETAILS */}
                    <div className="space-y-2 px-2">
                        <div className="flex items-center justify-between border-b border-gray-300 pb-1 mb-2">
                            <h3 className="text-[16px] font-medium text-[#23471d]">Contact Details</h3>
                            <button type="button" onClick={addContact} title="Add New Contact Row" className="w-7 h-7 bg-green-600 text-white flex items-center justify-center font-bold text-lg hover:bg-green-700 transition-all rounded-[2px] shadow hover:shadow-md">
                                +
                            </button>
                        </div>

                        <div className="space-y-2">
                            {formData.contacts.map((contact, index) => (
                                <div key={index} className="bg-slate-50/40 px-3 py-4 border border-slate-200 rounded-[2px] relative animate-fadeIn shadow-sm hover:shadow-md transition-shadow">
                                    {formData.contacts.length > 1 && (
                                        <button type="button" onClick={() => removeContact(index)} title="Remove Contact Row" className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white flex items-center justify-center font-bold text-lg hover:bg-red-600 transition-all rounded-[2px]">
                                            -
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-x-4 gap-y-4 mt-1">
                                        <div>
                                            <label className={labelClasses}>Title <span className="text-red-500">*</span></label>
                                            <select required value={contact.title} onChange={(e) => handleContactChange(index, "title", e.target.value)} className={inputClasses}>
                                                <option value="">Select</option>
                                                <option>Mr.</option><option>Ms.</option><option>Mrs.</option><option>Dr.</option>
                                            </select>
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className={labelClasses}>First Name <span className="text-red-500">*</span></label>
                                            <input required type="text" value={contact.firstName} onChange={(e) => handleContactChange(index, "firstName", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className={labelClasses}>Surname <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                                            <input type="text" value={contact.surname} onChange={(e) => handleContactChange(index, "surname", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Designation <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                                            <input type="text" value={contact.designation} onChange={(e) => handleContactChange(index, "designation", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label className={labelClasses}>Email <span className="text-red-500">*</span></label>
                                            <input required type="email" value={contact.email} onChange={(e) => handleContactChange(index, "email", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Mobile No. <span className="text-red-500">*</span></label>
                                            <input required type="text" maxLength={formData.clientType === "Domestic" ? 10 : 20} value={contact.mobile} onChange={(e) => {
                                                const val = formData.clientType === "Domestic" ? e.target.value.replace(/\D/g, "") : e.target.value.replace(/[^\d+]/g, "");
                                                handleContactChange(index, "mobile", val);
                                            }} className={inputClasses} placeholder="Write Here.." />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Alternate No.<span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                                            <input type="text" maxLength={formData.clientType === "Domestic" ? 10 : 20} value={contact.alternate} onChange={(e) => {
                                                const val = formData.clientType === "Domestic" ? e.target.value.replace(/\D/g, "") : e.target.value.replace(/[^\d+]/g, "");
                                                handleContactChange(index, "alternate", val);
                                            }} className={inputClasses} placeholder="Write Here.." />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION: CRM & TRACKING */}
                    <div className="space-y-4 px-2 pb-2">
                        <h3 className={sectionHeaderClasses}>CRM & Tracking</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-4">
                            <div>
                                <label className={labelClasses}>Data Source <span className="text-red-500">*</span></label>
                                <SearchableDropdown
                                    name="dataSource"
                                    value={formData.dataSource}
                                    onChange={(e) => handleChange("dataSource", e.target.value)}
                                    placeholder="Select Source"
                                    options={[
                                        "Direct Calling",
                                        "Direct Website",
                                        "Email Marketing",
                                        "Google (GMB / GMV)",
                                        "Others",
                                        "Referral",
                                        "Social Media",
                                        "WhatsApp Marketing"
                                    ].map(source => ({ label: source, value: source }))}
                                />
                            </div>
                            {formData.dataSource === 'Social Media' && (
                                <div>
                                    <label className={labelClasses}>Social Media <span className="text-red-500">*</span></label>
                                    <select required value={formData.socialMediaType} onChange={(e) => handleChange('socialMediaType', e.target.value)} className={inputClasses}>
                                        <option value="" className="text-red-500 font-medium">Select Platform</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                    </select>
                                </div>
                            )}
                            {formData.dataSource === 'Referral' && (
                                <>
                                    <div>
                                        <label className={labelClasses}>Referral Name <span className="text-red-500">*</span></label>
                                        <input required value={formData.referralName} onChange={(e) => handleChange('referralName', e.target.value)} placeholder="Name" className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Referral Mobile <span className="text-red-500">*</span></label>
                                        <input required value={formData.referralMobile} onChange={(e) => handleChange('referralMobile', e.target.value)} placeholder="Mobile" className={inputClasses} inputMode="numeric" maxLength={10} />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className={labelClasses}>Event Attribution <span className="text-red-500">*</span></label>
                                <select required disabled value={formData.eventName} onChange={(e) => handleChange("eventName", e.target.value)} className={`${inputClasses} bg-slate-50 cursor-not-allowed appearance-none`}>
                                    <option value="">Select Event</option>
                                    {isCrmEventScope && formData.eventName && (
                                        <option value={formData.eventName}>{formData.eventName}</option>
                                    )}
                                    {events.filter(e => e.status === "active").map((event, i) => (
                                        <option key={i} value={event.name}>{event.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Lead Date <span className="text-red-500">*</span></label>
                                <input required type="datetime-local" value={formData.reminder} onChange={(e) => handleChange("reminder", e.target.value)} readOnly={!!id} className={`${inputClasses} ${id ? "bg-slate-50 cursor-not-allowed" : ""}`} />
                            </div>
                            <div>
                                <label className={labelClasses}>Assigned To <span className="text-red-500">*</span></label>
                                <SearchableDropdown
                                    name="forwardTo"
                                    value={formData.forwardTo}
                                    onChange={(e) => handleChange("forwardTo", e.target.value)}
                                    placeholder="Select User"
                                    options={users?.map(user => ({ label: user?.fullName || user?.username, value: user?.username }))}
                                    disabled={!!id}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Follow Up Date <span className="text-red-500">*</span></label>
                                <input required type="datetime-local" value={formData.followUpDate} onChange={(e) => handleChange("followUpDate", e.target.value)} className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="pt-5 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center bg-white pb-6">
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 sm:mb-0">
                            <Shield size={14} className="text-red-500" />
                            Required Fields *
                        </p>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-10 py-2.5 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px] shadow-sm"
                            >
                                Reset Form
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-3 group"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        {id ? "UPDATE PROFILE" : "SAVE REGISTRATION"}
                                        <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddNewClients;
