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
    Shield
} from "lucide-react";
import Swal from "sweetalert2";
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
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";

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

    // ---------- Redux Selectors ----------
    const usersState = useSelector((state) => state.users);
    const users = getArrayFromSlice(usersState, "users");

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

    // Initial Data Fetch
    useEffect(() => {
        if (companiesArray.length === 0) dispatch(fetchCompanies());
        dispatch(fetchUsers());
        dispatch(fetchCategories());
        dispatch(fetchNatures());
        dispatch(fetchCountries());
        dispatch(fetchStates());
        dispatch(fetchCities());
        dispatch(fetchDataSources());
        dispatch(fetchEvents());
    }, [dispatch]);

    // Prefill form for editing
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
                    contacts: companyToEdit.contacts.length > 0 ? companyToEdit.contacts : [{ title: "", firstName: "", surname: "", designation: "", email: "", mobile: "", alternate: "" }],
                });
            }
        }
    }, [id, companiesArray]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
        setIsSaving(true);
        try {
            const userName = sessionStorage.getItem("user_name");
            const dataToSave = { ...formData, updated_by: userName || formData.updated_by };
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
                const response = await dispatch(addCompany(dataToSave)).unwrap();
                
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
                    text: "New company added successfully!",
                    icon: "success",
                    confirmButtonColor: "#23471d"
                });
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
            companyName: "", category: "", businessNature: "", address: "", country: "", state: "", city: "", pincode: "", website: "", landline: "", email: "", dataSource: "", eventName: "", reminder: "", forwardTo: "",
            contacts: [{ title: "", firstName: "", surname: "", designation: "", email: "", mobile: "", alternate: "" }],
        });
    };

    // Design Constants matching Buyer Registration & Standard Admin UI
    const inputClasses = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";
    const labelClasses = "text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter";
    const sectionHeaderClasses = "text-[16px] font-bold text-[#23471d] pb-1 border-b border-slate-100 mb-6 font-inter";

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
            
            {/* ── HEADER AREA ── */}
            <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight leading-none">
                        COMPANY DETAILS
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Client Registration Portal
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                    <button onClick={() => navigate("/ihweClientData2026/uploadExhibitor")} className="px-3 py-1.5 text-[11px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center gap-1.5 rounded-[2px] shadow-sm">
                        <Upload size={12} /> Upload Exhibitor
                    </button>
                    <button onClick={() => navigate("/ihweClientData2026/masterData")} className="px-3 py-1.5 text-[11px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center gap-1.5 rounded-[2px] shadow-sm">
                        <LayoutGrid size={12} /> Master List
                    </button>
                    <button onClick={() => navigate("/ihweClientData2026/confirmClientList")} className="px-3 py-1.5 text-[11px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center gap-1.5 rounded-[2px] shadow-sm">
                        <UserCheck size={12} /> Exhibitor List
                    </button>
                </div>
            </div>

            {/* ── FORM CONTENT ── */}
            <form onSubmit={handleSave} className="mt-8 space-y-10">
                
                {/* ── SUB-HEADER ── */}
                <div className="bg-slate-50/50 border-x border-y border-slate-200 px-6 py-3 rounded-[2px]">
                    <h2 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">
                        {id ? "Edit Client Details" : "Add New Company"}
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
                        International Health & Wellness Expo 2026
                    </p>
                </div>

                {/* SECTION: COMPANY INFORMATION */}
                <div className="space-y-4 px-2">
                    <h3 className={sectionHeaderClasses}>Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div>
                            <label className={labelClasses}>Company Name *</label>
                            <input required type="text" value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                        </div>
                        <div>
                            <label className={labelClasses}>Category *</label>
                            <select required value={formData.category} onChange={(e) => handleChange("category", e.target.value)} className={inputClasses}>
                                <option value="">Select Category</option>
                                {categoriesArray.map((cat, i) => (
                                    <option key={i} value={cat?.cat_name}>{cat?.cat_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Nature of Business *</label>
                            <select required value={formData.businessNature} onChange={(e) => handleChange("businessNature", e.target.value)} className={inputClasses}>
                                <option value="">Select Business Nature</option>
                                {naturesArray.map((nature, i) => (
                                    <option key={i} value={nature?.nature_name}>{nature?.nature_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Company Website *</label>
                            <input required type="text" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div>
                            <label className={labelClasses}>Official Email *</label>
                            <input required type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                        </div>
                        <div>
                            <label className={labelClasses}>Landline No.</label>
                            <input type="text" value={formData.landline} onChange={(e) => handleChange("landline", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                        </div>
                    </div>
                </div>

                {/* SECTION: LOCATION & ADDRESS */}
                <div className="space-y-4 px-2">
                    <h3 className={sectionHeaderClasses}>Location & Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div className="md:col-span-2 lg:col-span-2">
                            <label className={labelClasses}>Full Address *</label>
                            <input required type="text" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                        </div>
                        <div>
                            <label className={labelClasses}>Country *</label>
                            <select required value={formData.country} onChange={(e) => { handleChange("country", e.target.value); handleChange("state", ""); handleChange("city", ""); }} className={inputClasses}>
                                <option value="">Select Country</option>
                                {countriesArray.map((country, i) => (
                                    <option key={i} value={country?.name}>{country?.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>State *</label>
                            <select required value={formData.state} onChange={(e) => { handleChange("state", e.target.value); handleChange("city", ""); }} disabled={!formData.country} className={`${inputClasses} disabled:bg-slate-50`}>
                                <option value="">Select State</option>
                                {formData.country && statesArray.map((state, i) => (
                                    <option key={i} value={state?.name}>{state?.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div>
                            <label className={labelClasses}>City / Town *</label>
                            <select required value={formData.city} onChange={(e) => handleChange("city", e.target.value)} disabled={!formData.state} className={`${inputClasses} disabled:bg-slate-50`}>
                                <option value="">Select City</option>
                                {formData.country && formData.state && citiesArray.map((city, i) => (
                                    <option key={i} value={city?.name}>{city?.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Pin Code *</label>
                            <input required type="text" maxLength={6} value={formData.pincode} onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); if (val.length <= 6) handleChange("pincode", val); }} className={inputClasses} placeholder="Write Here.." />
                        </div>
                    </div>
                </div>

                {/* SECTION: CONTACT DETAILS */}
                <div className="space-y-4 px-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-6">
                        <h3 className="text-[16px] font-bold text-[#23471d]">Contact Details</h3>
                        <button type="button" onClick={addContact} title="Add New Contact Row" className="w-8 h-8 bg-green-600 text-white flex items-center justify-center font-bold text-lg hover:bg-green-700 transition-all rounded-[2px] shadow hover:shadow-md">
                            +
                        </button>
                    </div>
                    
                    <div className="space-y-5">
                        {formData.contacts.map((contact, index) => (
                            <div key={index} className="bg-slate-50/40 p-6 border border-slate-200 rounded-[2px] relative animate-fadeIn shadow-sm hover:shadow-md transition-shadow">
                                {formData.contacts.length > 1 && (
                                    <button type="button" onClick={() => removeContact(index)} title="Remove Contact Row" className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white flex items-center justify-center font-bold text-lg hover:bg-red-600 transition-all rounded-[2px]">
                                        -
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-x-4 gap-y-4 mt-1">
                                    <div>
                                        <label className={labelClasses}>Title *</label>
                                        <select required value={contact.title} onChange={(e) => handleContactChange(index, "title", e.target.value)} className={inputClasses}>
                                            <option value="">Select</option>
                                            <option>Mr.</option><option>Ms.</option><option>Mrs.</option><option>Dr.</option>
                                        </select>
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className={labelClasses}>First Name *</label>
                                        <input required type="text" value={contact.firstName} onChange={(e) => handleContactChange(index, "firstName", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className={labelClasses}>Surname *</label>
                                        <input required type="text" value={contact.surname} onChange={(e) => handleContactChange(index, "surname", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Designation *</label>
                                        <input required type="text" value={contact.designation} onChange={(e) => handleContactChange(index, "designation", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className={labelClasses}>Email *</label>
                                        <input required type="email" value={contact.email} onChange={(e) => handleContactChange(index, "email", e.target.value)} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Mobile *</label>
                                        <input required type="text" maxLength={10} value={contact.mobile} onChange={(e) => handleContactChange(index, "mobile", e.target.value.replace(/\D/g, ""))} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>WhatsApp</label>
                                        <input type="text" value={contact.alternate} onChange={(e) => handleContactChange(index, "alternate", e.target.value.replace(/\D/g, ""))} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION: CRM & TRACKING */}
                <div className="space-y-4 px-2 pb-16">
                    <h3 className={sectionHeaderClasses}>CRM & Tracking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div>
                            <label className={labelClasses}>Data Source *</label>
                            <select required value={formData.dataSource} onChange={(e) => handleChange("dataSource", e.target.value)} className={inputClasses}>
                                <option value="">Select Source</option>
                                {dataSourcesArray.map((source, i) => (
                                    <option key={i} value={source?.source_name}>{source?.source_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Event Attribution *</label>
                            <select required value={formData.eventName} onChange={(e) => handleChange("eventName", e.target.value)} className={inputClasses}>
                                <option value="">Select Event</option>
                                {eventsArray.map((event, i) => (
                                    <option key={i} value={event?.event_name}>{event?.event_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Reminder *</label>
                            <input required type="datetime-local" value={formData.reminder} onChange={(e) => handleChange("reminder", e.target.value)} readOnly={!!id} className={`${inputClasses} ${id ? "bg-slate-50 cursor-not-allowed" : ""}`} />
                        </div>
                        <div>
                            <label className={labelClasses}>Forward To *</label>
                            <select required value={formData.forwardTo} onChange={(e) => handleChange("forwardTo", e.target.value)} disabled={!!id} className={`${inputClasses} ${id ? "bg-slate-50 cursor-not-allowed" : ""}`}>
                                <option value="">Select User</option>
                                {users?.map((user, i) => (
                                    <option key={i} value={user?.user_fullname}>{user?.user_fullname}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS ── STICKY VIBE */}
                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center mt-12 bg-white pb-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 sm:mb-0">
                        <Shield size={14} className="text-[#23471d]" />
                        SECURE ADMIN PORTAL
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
    );
};

export default AddNewClients;
