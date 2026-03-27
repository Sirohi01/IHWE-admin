import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react';
import api from "../lib/api";

const Button = ({ children, onClick, className, variant, disabled, type, ...props }) => {
    const baseStyles = "px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-200 rounded-sm flex items-center gap-2";
    const variants = {
        primary: "bg-[#23471d] text-white hover:bg-[#1a3516] disabled:bg-gray-400",
        outline: "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm",
        danger: "bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 shadow-sm"
    };
    return (
        <button 
            type={type}
            disabled={disabled}
            onClick={onClick} 
            className={`${baseStyles} ${variant === 'outline' ? variants.outline : variant === 'danger' ? variants.danger : variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
import Swal from 'sweetalert2';

const COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const COMPANY_TYPES = [
    "Importer/Exporter",
    "Distributor",
    "Retail Chain",
    "Wholesaler",
    "Private Label Buyer",
    "HoReCa",
    "E-commerce Platform",
    "Government Agency",
    "Other"
];

const PRODUCT_CATEGORIES = [
    "Cereals & Grains",
    "Pulses",
    "Spices & Herbs",
    "Oils",
    "Tea & Coffee",
    "Processed Food",
    "Superfoods",
    "Dairy",
    "Fresh Produce",
    "Private Label",
    "Other"
];

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
                    setFormData(response.data.data);
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

    const handleCheckboxChange = (name, value, checked) => {
        setFormData(prev => {
            const list = [...(prev[name] || [])];
            if (checked) {
                if (!list.includes(value)) list.push(value);
            } else {
                const index = list.indexOf(value);
                if (index > -1) list.splice(index, 1);
            }
            return { ...prev, [name]: list };
        });
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!formData) return null;

    const inputClasses = "w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] focus:outline-none transition-colors text-sm rounded-sm font-medium";
    const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

    return (
        <div className="bg-white shadow-md mt-6 p-6">
            <div className="w-full">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <button 
                            onClick={() => navigate(`/buyer-registration/${id}`)}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#23471d] transition-colors mb-2 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Overview
                        </button>
                        <h1 className="text-3xl font-bold text-[#23471d] uppercase tracking-tight italic">Edit <span className="text-slate-900">Registration</span></h1>
                        <p className="text-gray-500 text-base mt-2">Update the details for this buyer registration</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-white border-2 border-gray-100 p-8 shadow-lg rounded-none">
                {/* Company Info */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#23471d] uppercase tracking-[0.2em] border-b pb-2">1. Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className={labelClasses}>Company Name *</label>
                            <input required name="companyName" value={formData.companyName} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Country *</label>
                            <select name="country" value={formData.country} onChange={handleChange} className={inputClasses}>
                                <option value="">Select Country</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Website</label>
                            <input name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Years in Business</label>
                            <input name="yearsInBusiness" value={formData.yearsInBusiness} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Annual Import Volume</label>
                            <input name="annualImportVolume" value={formData.annualImportVolume} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Markets Served</label>
                            <input name="mainMarketsServed" value={formData.mainMarketsServed} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 border-l-4 border-[#23471d]">
                        <label className={labelClasses}>Type of Company</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
                            {COMPANY_TYPES.map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.companyTypes?.includes(type)}
                                        onChange={(e) => handleCheckboxChange('companyTypes', type, e.target.checked)}
                                        className="w-4 h-4 rounded-none border-gray-300 text-[#23471d] focus:ring-[#23471d]"
                                    />
                                    <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#23471d] uppercase tracking-[0.2em] border-b pb-2">2. Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className={labelClasses}>Contact Person *</label>
                            <input required name="contactPerson" value={formData.contactPerson} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Designation *</label>
                            <input required name="designation" value={formData.designation} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Email *</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>WhatsApp *</label>
                            <input required name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>
                </div>

                {/* Interests & Meeting */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-[#23471d] uppercase tracking-[0.2em] border-b pb-2">3. Product Interest & Meeting</h3>
                    <div className="bg-gray-50 p-6 border-l-4 border-[#23471d]">
                        <label className={labelClasses}>Interested Categories</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
                            {PRODUCT_CATEGORIES.map(cat => (
                                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.interestedCategories?.includes(cat)}
                                        onChange={(e) => handleCheckboxChange('interestedCategories', cat, e.target.checked)}
                                        className="w-4 h-4 rounded-none border-gray-300 text-[#23471d] focus:ring-[#23471d]"
                                    />
                                    <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Price Range</label>
                            <input name="targetPriceRange" value={formData.targetPriceRange} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Preferred Meeting Type</label>
                            <select name="preferredMeetingType" value={formData.preferredMeetingType} onChange={handleChange} className={inputClasses}>
                                <option value="1:1">1:1 Scheduled Meetings</option>
                                <option value="roundtable">Small Group Roundtable</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className={labelClasses}>Specific Exhibitors</label>
                        <textarea 
                            name="specificExhibitors" 
                            value={formData.specificExhibitors} 
                            onChange={handleChange} 
                            rows={3}
                            className={`${inputClasses} resize-none`}
                        />
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-200">
                        <input 
                            type="checkbox" 
                            id="confirmed"
                            checked={formData.confirmed}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmed: e.target.checked }))}
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <label htmlFor="confirmed" className="text-xs font-bold text-gray-700 uppercase cursor-pointer">
                            Genuine Trade Buyer Confirmed
                        </label>
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
                    <Button 
                        type="button" 
                        variant="danger"
                        onClick={() => navigate(`/buyer-registration/${id}`)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        disabled={isSubmitting}
                        type="submit"
                        className="bg-[#23471d] hover:bg-[#1a3516] text-white px-10 shadow-xl shadow-[#23471d]/10"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Changes
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    </div>
    );
};

export default BuyerRegistrationEdit;
