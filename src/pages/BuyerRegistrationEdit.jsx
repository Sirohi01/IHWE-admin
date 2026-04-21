import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, ChevronDown } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';

const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Select options" }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const toggle = (item) => {
        if (selected.includes(item)) onChange(selected.filter((s) => s !== item));
        else onChange([...selected, item]);
    };
    return (
        <div ref={ref} className="relative w-full">
            <button type="button" onClick={() => setOpen((p) => !p)} className="w-full px-4 py-2 border-2 border-gray-200 text-left text-sm rounded-sm font-medium bg-white flex items-center justify-between">
                <span className="truncate">{selected.length === 0 ? <span className="text-gray-400">{placeholder}</span> : selected.join(", ")}</span>
                <ChevronDown size={14} className="text-gray-400" />
            </button>
            {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-[220px] overflow-y-auto">
                    {options.map((opt) => (
                        <label key={opt} className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium ${selected.includes(opt) ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"}`}>
                            <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="rounded" />
                            {opt}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const COUNTRIES = ["India", "Afghanistan", "Australia", "Bangladesh", "Bhutan", "Canada", "China", "France", "Germany", "Japan", "Malaysia", "Maldives", "Nepal", "Singapore", "Sri Lanka", "UAE", "UK", "USA", "Other"];

const FALLBACK_CONFIG = {
    companyTypes: ["Distributor", "Super Distributor", "Wholesaler", "Retailer (Single Store)", "Retail Chain / Multi-Store", "Modern Trade Buyer", "Manufacturer", "Private Label Buyer", "Franchise Seeker", "Investor", "Importer", "Exporter", "International Buying Agent", "E-commerce Seller", "D2C Brand Owner", "Hospital / Clinic", "Doctor / Medical Practitioner", "Pharmacy / Chemist", "Diagnostic Center", "Spa / Salon Owner", "Wellness Center", "Gym / Fitness Center", "Yoga Studio", "Nutritionist / Dietician", "Wellness Resort / Hospitality", "Hotel / Resort", "Corporate Buyer (Procurement / HR)", "Government / PSU", "NGO / Trust", "Consultant / Advisor", "Startup Founder", "Student / Researcher"],
    annualTurnoverRanges: ["Below 50 Lakhs", "50L – 2 Cr", "2 – 10 Cr", "10 Cr+"],
    regions: ["North India", "South India", "East India", "West India", "Pan India", "Global"],
    supplierTypes: ["Manufacturer", "Exporter", "MSME", "Startup", "Wholesaler"],
    purchaseTimelines: ["Immediate", "1–3 Months", "3–6 Months", "Exploring"],
    roles: ["Final Decision Maker", "Influencer", "Research Only"],
    secondaryProductCategories: ["Ayurveda", "Organic", "Wellness", "Pharma", "Cosmetics", "Nutraceuticals", "Herbal", "Skincare", "Medical Devices", "HealthTech"],
    buyingFrequencies: ["One-time", "Monthly", "Quarterly", "Long-term"],
    annualPurchaseValueRanges: ["Below 10 Lakhs", "10-50 Lakhs", "50 Lakhs - 1 Crore", "1-5 Crore", "5+ Crore"],
    primaryProductInterests: ["AYUSH & Traditional Medicine", "Organic & Natural Products", "Wellness & Lifestyle", "Beauty & Personal Care", "Fitness & Nutrition", "Medical & Healthcare", "Pharmaceuticals"],
    budgetRanges: ["Flexible", "Entry Level", "Mid-Range", "Premium"],
    companySizes: ["Small (1-10 employees)", "Medium (11-50 employees)", "Large (51-200 employees)", "Enterprise (200+)"],
    certificationOptions: ["ISO", "GMP", "FDA", "AYUSH", "Organic", "Halal", "Kosher", "Others"],
    meetingPriorityLevels: ["Low Priority", "Medium Priority", "High Priority"],
    businessModelOptions: ["Retail", "Distribution", "Franchise", "Private Label / White Label", "Direct Sourcing", "B2B Bulk Supply"],
    meetingCategoryOptions: ["Ayurveda & Herbal", "Organic Food & Beverages", "Nutraceuticals & Supplements", "Fitness Equipment", "Beauty & Cosmetics", "Skincare", "Medical Devices", "Wellness Services", "Spa & Salon", "HealthTech", "Pharmaceuticals", "Others"],
    exhibitorTypeOptions: ["Manufacturer", "Brand Owner", "Distributor", "Exporter", "Startup / Innovator", "Wholesaler"],
    meetingObjectiveOptions: ["Product Sourcing", "Partnership / Collaboration", "Distribution Opportunities", "Private Label / OEM", "Investment / Business Expansion", "Brand Acquisition", "Market Research", "Networking"],
    preferredBusinessTypeOptions: ["Bulk Purchase", "Private Label", "Franchise", "Exclusive Distribution", "Joint Venture"],
    meetingDayOptions: ["Day 1", "Day 2", "Day 3"],
    paymentMethods: ['Letter of Credit (LC)', 'Cash Against Documents (CAD)', 'Bank Transfer (T/T)', 'Open Account', 'Advance Payment'],
    basicBusinessTypes: ['Proprietorship', 'Partnership', 'Pvt Ltd', 'LLP', 'Others']
};

const Button = ({ children, onClick, className, variant, disabled, type, ...props }) => {
    const baseStyles = "px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-200 rounded-sm flex items-center gap-2";
    const variants = { primary: "bg-[#23471d] text-white hover:bg-[#1a3516] disabled:bg-gray-400", outline: "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm" };
    return <button type={type} disabled={disabled} onClick={onClick} className={`${baseStyles} ${variant === 'outline' ? variants.outline : variants.primary} ${className}`} {...props}>{children}</button>;
};

const BuyerRegistrationEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/api/buyer-registration/${id}`);
                if (response.data.success) {
                    const data = response.data.data;
                    // Ensure arrays are arrays
                    const ensureArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);
                    data.secondaryProductCategories = ensureArray(data.secondaryProductCategories);
                    data.preferredSupplierRegion = ensureArray(data.preferredSupplierRegion);
                    data.preferredState = ensureArray(data.preferredState);
                    data.preferredSupplierType = ensureArray(data.preferredSupplierType);
                    data.requiredCertifications = ensureArray(data.requiredCertifications);
                    data.preferredMeetingCategories = ensureArray(data.preferredMeetingCategories);
                    data.preferredExhibitorTypes = ensureArray(data.preferredExhibitorTypes);
                    data.meetingObjectives = ensureArray(data.meetingObjectives);
                    data.preferredBusinessTypes = ensureArray(data.preferredBusinessTypes);
                    data.preferredPaymentMethods = ensureArray(data.preferredPaymentMethods);
                    setFormData(data);
                }
            } catch (error) {
                console.error('Error fetching registration:', error);
                Swal.fire('Error', 'Failed to load registration data', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelect = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await api.put(`/api/buyer-registration/${id}`, formData);
            if (response.data.success) {
                await Swal.fire('Success', 'Registration updated successfully', 'success');
                navigate(`/buyer-registration/${id}`);
            }
        } catch (error) {
            console.error('Error updating registration:', error);
            Swal.fire('Error', 'Failed to update registration', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div></div>;
    if (!formData) return null;

    const inputClasses = "w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] focus:outline-none transition-colors text-sm rounded-sm font-medium bg-white";
    const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
    const SectionTitle = ({ title }) => <h3 className="text-sm font-bold text-[#23471d] uppercase tracking-[0.2em] border-b pb-2 mb-6 mt-10">{title}</h3>;

    return (
        <div className="bg-white shadow-md mt-6 p-6 pb-20">
            <div className="w-full">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <button onClick={() => navigate(`/buyer-registration/${id}`)} className="flex items-center gap-2 text-gray-500 hover:text-[#23471d] transition-colors mb-2 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Details
                        </button>
                        <h1 className="text-3xl font-bold text-[#23471d] uppercase tracking-tight italic">Edit <span className="text-slate-900">Registration</span></h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-100 p-8 shadow-lg rounded-none">
                    {/* Admin Overrides */}
                    <div className="space-y-6 bg-slate-50 p-6 border-l-4 border-orange-500">
                        <h3 className="text-sm font-bold text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">Admin Control & CRM Tagging</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div><label className={labelClasses}>Buyer CRM Tag</label><select name="buyerTag" value={formData.buyerTag || ""} onChange={handleChange} className={inputClasses}><option value="Hot">HOT Lead</option><option value="Warm">WARM Lead</option><option value="Cold">COLD Lead</option></select></div>
                            <div><label className={labelClasses}>Payment Status</label><select name="paymentStatus" value={formData.paymentStatus || ""} onChange={handleChange} className={inputClasses}><option value="Pending">Pending</option><option value="Completed">Completed</option><option value="Failed">Failed</option></select></div>
                            <div><label className={labelClasses}>Registration Category</label><input name="registrationCategory" value={formData.registrationCategory || ""} onChange={handleChange} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Registration Fee</label><input name="registrationFee" value={formData.registrationFee || ""} onChange={handleChange} className={inputClasses} /></div>
                            <div className="md:col-span-2 lg:col-span-4"><label className={labelClasses}>Internal Remarks</label><textarea name="remarks" value={formData.remarks || ""} onChange={handleChange} rows={2} className={`${inputClasses} resize-none`} placeholder="Add internal notes about this buyer..." /></div>
                        </div>
                    </div>

                    <SectionTitle title="1. Personal & Contact Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div><label className={labelClasses}>Full Name</label><input required name="fullName" value={formData.fullName || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Designation</label><input name="designation" value={formData.designation || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Email Address</label><input required type="email" name="emailAddress" value={formData.emailAddress || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Mobile Number</label><input required name="mobileNumber" value={formData.mobileNumber || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Alternate Number</label><input name="alternateNumber" value={formData.alternateNumber || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Business Role</label><select name="businessType" value={formData.businessType || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.companyTypes.map(t=><option key={t} value={t}>{t}</option>)}<option value="Other">Other</option></select></div>
                        <div className="lg:col-span-2"><label className={labelClasses}>Website</label><input name="website" value={formData.website || ""} onChange={handleChange} className={inputClasses} /></div>
                    </div>

                    <SectionTitle title="2. Registered Address" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div><label className={labelClasses}>Country</label><select name="country" value={formData.country || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{COUNTRIES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClasses}>State/Province</label><input name="stateProvince" value={formData.stateProvince || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>City</label><input name="city" value={formData.city || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Pin Code</label><input name="pinCode" value={formData.pinCode || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div className="md:col-span-4"><label className={labelClasses}>Registered Address</label><textarea name="registeredAddress" value={formData.registeredAddress || ""} onChange={handleChange} rows={2} className={inputClasses} /></div>
                    </div>

                    <SectionTitle title="3. Company Business Profile" />
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div className="md:col-span-2"><label className={labelClasses}>Company Name</label><input required name="companyName" value={formData.companyName || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div className="md:col-span-2"><label className={labelClasses}>Company/Firm Name</label><input name="companyFirmName" value={formData.companyFirmName || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Brand Name</label><input name="brandName" value={formData.brandName || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Structure (Type)</label><select name="basicBusinessType" value={formData.basicBusinessType || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.basicBusinessTypes.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClasses}>Year of Est.</label><input name="yearOfEstablishment" value={formData.yearOfEstablishment || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>GST Number</label><input name="gstNumber" value={formData.gstNumber || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>PAN Number</label><input name="panNumber" value={formData.panNumber || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Buyer Industry</label><select name="buyerIndustry" value={formData.buyerIndustry || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.primaryProductInterests.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                    </div>

                    <SectionTitle title="4. Business Profile Details" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div><label className={labelClasses}>Nature of Business</label><input name="natureOfBusiness" value={formData.natureOfBusiness || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Years in Business</label><input type="number" name="yearsInBusiness" value={formData.yearsInBusiness || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>No. of Outlets</label><input type="number" name="numberOfOutlets" value={formData.numberOfOutlets || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Annual Turnover</label><select name="annualTurnover" value={formData.annualTurnover || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.annualTurnoverRanges.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                    </div>

                    <SectionTitle title="5. Sourcing & Purchase Intent" />
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div><label className={labelClasses}>Primary Interest</label><select name="primaryProductInterest" value={formData.primaryProductInterest || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.primaryProductInterests.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClasses}>Secondary Categories</label><MultiSelectDropdown options={FALLBACK_CONFIG.secondaryProductCategories} selected={formData.secondaryProductCategories} onChange={(v)=>handleMultiSelect('secondaryProductCategories',v)} placeholder="Select..." /></div>
                        <div><label className={labelClasses}>Import Interest?</label><select name="interestedInImporting" value={formData.interestedInImporting || ""} onChange={handleChange} className={inputClasses}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                        <div><label className={labelClasses}>Export Interest?</label><select name="interestedInExporting" value={formData.interestedInExporting || ""} onChange={handleChange} className={inputClasses}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                        <div><label className={labelClasses}>Business Model</label><select name="businessModelPreference" value={formData.businessModelPreference || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.businessModelOptions.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClasses}>Est. Monthly Purchase</label><input name="estimatedPurchaseVolume" value={formData.estimatedPurchaseVolume || ""} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Budget Range</label><select name="budgetRange" value={formData.budgetRange || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.budgetRanges.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClasses}>Buying Frequency</label><select name="buyingFrequency" value={formData.buyingFrequency || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.buyingFrequencies.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClasses}>Est. Annual Purchase</label><select name="estimatedAnnualPurchaseValue" value={formData.estimatedAnnualPurchaseValue || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.annualPurchaseValueRanges.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClasses}>Purchase Timeline</label><select name="purchaseTimeline" value={formData.purchaseTimeline || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.purchaseTimelines.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClasses}>Matchmaking Interest</label><select name="matchmakingInterest" value={formData.matchmakingInterest || ""} onChange={handleChange} className={inputClasses}><option value="Yes">Yes</option><option value="No">No</option></select></div>
                        <div><label className={labelClasses}>Role in Purchase</label><select name="roleInPurchaseDecision" value={formData.roleInPurchaseDecision || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.roles.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div className="md:col-span-3 lg:col-span-4"><label className={labelClasses}>Specific Requirements</label><textarea name="specificProductRequirements" value={formData.specificProductRequirements || ""} onChange={handleChange} rows={2} className={inputClasses} /></div>
                    </div>

                    <SectionTitle title="6. Supplier Preference" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div><label className={labelClasses}>Preferred Region</label><MultiSelectDropdown options={FALLBACK_CONFIG.regions} selected={formData.preferredSupplierRegion} onChange={(v)=>handleMultiSelect('preferredSupplierRegion',v)} placeholder="Select..." /></div>
                        <div><label className={labelClasses}>Preferred Supplier Type</label><MultiSelectDropdown options={FALLBACK_CONFIG.supplierTypes} selected={formData.preferredSupplierType} onChange={(v)=>handleMultiSelect('preferredSupplierType',v)} placeholder="Select..." /></div>
                        <div><label className={labelClasses}>Preferred State (Manual)</label><input placeholder="Use comma separated for states" name="preferredState" value={(formData.preferredState || []).join(', ')} onChange={(e)=>handleMultiSelect('preferredState', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Company Size</label><select name="preferredCompanySize" value={formData.preferredCompanySize || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.companySizes.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                    </div>

                    <SectionTitle title="7. Certification & Compliance" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div><label className={labelClasses}>Required Certifications</label><MultiSelectDropdown options={FALLBACK_CONFIG.certificationOptions} selected={formData.requiredCertifications} onChange={(v)=>handleMultiSelect('requiredCertifications',v)} placeholder="Select..." /></div>
                        <div><label className={labelClasses}>Pricing Preference</label><select name="pricingPreference" value={formData.pricingPreference || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option><option value="Premium">Premium</option><option value="Mid-Range">Mid-Range</option><option value="Budget">Budget</option></select></div>
                        <div><label className={labelClasses}>Payment Methods</label><MultiSelectDropdown options={FALLBACK_CONFIG.paymentMethods} selected={formData.preferredPaymentMethods} onChange={(v)=>handleMultiSelect('preferredPaymentMethods',v)} placeholder="Select..." /></div>
                        <div><label className={labelClasses}>Logistics Requirements</label><input name="logisticsRequirements" value={formData.logisticsRequirements || ""} onChange={handleChange} className={inputClasses} /></div>
                    </div>

                    <SectionTitle title="8. B2B Meeting Preferences" />
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div><label className={labelClasses}>Pre-scheduled B2B?</label><select name="requirePreScheduledB2B" value={formData.requirePreScheduledB2B || ""} onChange={handleChange} className={inputClasses}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                        <div><label className={labelClasses}>Priority Level</label><select name="meetingPriorityLevel" value={formData.meetingPriorityLevel || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.meetingPriorityLevels.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        
                        {formData.requirePreScheduledB2B === 'Yes' && (
                            <>
                                <div><label className={labelClasses}>Meeting Categories</label><MultiSelectDropdown options={FALLBACK_CONFIG.meetingCategoryOptions} selected={formData.preferredMeetingCategories} onChange={(v)=>handleMultiSelect('preferredMeetingCategories',v)} placeholder="Select..." /></div>
                                <div><label className={labelClasses}>Exhibitor Types</label><MultiSelectDropdown options={FALLBACK_CONFIG.exhibitorTypeOptions} selected={formData.preferredExhibitorTypes} onChange={(v)=>handleMultiSelect('preferredExhibitorTypes',v)} placeholder="Select..." /></div>
                                <div><label className={labelClasses}>Meeting Objectives</label><MultiSelectDropdown options={FALLBACK_CONFIG.meetingObjectiveOptions} selected={formData.meetingObjectives} onChange={(v)=>handleMultiSelect('meetingObjectives',v)} placeholder="Select..." /></div>
                                <div><label className={labelClasses}>Business Types</label><MultiSelectDropdown options={FALLBACK_CONFIG.preferredBusinessTypeOptions} selected={formData.preferredBusinessTypes} onChange={(v)=>handleMultiSelect('preferredBusinessTypes',v)} placeholder="Select..." /></div>
                                <div><label className={labelClasses}>Preferred Day</label><select name="preferredMeetingDay" value={formData.preferredMeetingDay || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option>{FALLBACK_CONFIG.meetingDayOptions.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                                <div><label className={labelClasses}>Time Slot</label><select name="preferredTimeSlot" value={formData.preferredTimeSlot || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option><option value="Morning (10AM-1PM)">Morning (10AM-1PM)</option><option value="Afternoon (2PM-4PM)">Afternoon (2PM-4PM)</option><option value="Evening (4PM-6PM)">Evening (4PM-6PM)</option></select></div>
                                <div><label className={labelClasses}>Number of Meetings</label><select name="numberOfMeetingsInterested" value={formData.numberOfMeetingsInterested || ""} onChange={handleChange} className={inputClasses}><option value="">Select</option><option value="3–5 Meetings">3–5 Meetings</option><option value="5–10 Meetings">5–10 Meetings</option><option value="10+ Meetings">10+ Meetings</option></select></div>
                                <div className="md:col-span-3"><label className={labelClasses}>Meeting Requirements</label><textarea name="meetingRequirements" value={formData.meetingRequirements || ""} onChange={handleChange} rows={2} className={inputClasses} /></div>
                            </>
                        )}
                    </div>

                    <div className="pt-10 flex justify-end gap-4 mt-10">
                        <Button type="button" variant="outline" onClick={() => navigate(`/buyer-registration/${id}`)}>Cancel</Button>
                        <Button disabled={isSubmitting} type="submit" className="px-10">
                            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BuyerRegistrationEdit;
