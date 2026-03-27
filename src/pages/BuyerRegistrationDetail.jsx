import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, User, Mail, Phone, Globe, Briefcase, Calendar, CheckCircle2, Info } from 'lucide-react';
import api from "../lib/api";

const Button = ({ children, onClick, className, variant, ...props }) => {
    const baseStyles = "px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-200 rounded-sm flex items-center gap-2";
    const variants = {
        primary: "bg-[#23471d] text-white hover:bg-[#1a3516]",
        outline: "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
    };
    return (
        <button 
            onClick={onClick} 
            className={`${baseStyles} ${variant === 'outline' ? variants.outline : variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

const BuyerRegistrationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/api/buyer-registration/${id}`);
                if (response.data.success) {
                    setRegistration(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching registration detail:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Registration not found</h2>
                <Button onClick={() => navigate('/buyer-registrations')} className="mt-4">
                    Back to List
                </Button>
            </div>
        );
    }

    const DetailRow = ({ label, value, icon: Icon }) => (
        <div className="flex flex-col border-b border-gray-300 py-3 hover:bg-gray-50/50 transition-colors px-4 h-full">
            <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className="w-3.5 h-3.5 text-[#23471d]/60" />}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
            <div>
                <span className="text-sm font-bold text-gray-800 leading-tight">
                    {Array.isArray(value) ? value.join(', ') : (value || <span className="text-gray-300 font-normal italic">Not provided</span>)}
                </span>
            </div>
        </div>
    );

    const CompactDetailGrid = ({ data }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-gray-300">
            {data.map((item, idx) => (
                <div key={idx} className="border-r border-b border-gray-300 last:border-r-0 lg:[&:nth-child(4n)]:border-r-0">
                    <DetailRow {...item} />
                </div>
            ))}
        </div>
    );

    const SectionHeader = ({ title, icon: Icon }) => (
        <div className="flex items-center gap-2 px-4 py-3 bg-[#23471d] border-b border-gray-200">
            {Icon && <Icon className="w-4 h-4 text-white" />}
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">{title}</h3>
        </div>
    );

    const companyData = [
        { label: "Company Name", value: registration.companyName, icon: Building2 },
        { label: "Country", value: registration.country, icon: Globe },
        { label: "Website", value: registration.companyWebsite, icon: Globe },
        { label: "Years in Business", value: registration.yearsInBusiness, icon: Calendar },
        { label: "Annual Import Volume", value: registration.annualImportVolume, icon: Info },
        { label: "Main Markets", value: registration.mainMarketsServed, icon: Globe },
        { label: "Type of Company", value: registration.companyTypes, icon: Info },
        { label: "Registration Date", value: new Date(registration.createdAt).toLocaleDateString(), icon: Calendar },
    ];

    const contactData = [
        { label: "Full Name", value: registration.contactPerson, icon: User },
        { label: "Designation", value: registration.designation, icon: Briefcase },
        { label: "Email", value: registration.email, icon: Mail },
        { label: "WhatsApp", value: registration.whatsapp, icon: Phone },
    ];

    const interestData = [
        { label: "Categories", value: registration.interestedCategories, icon: Briefcase },
        { label: "Price Range", value: registration.targetPriceRange, icon: Info },
        { label: "Preferred Meeting", value: registration.preferredMeetingType, icon: Calendar },
        { label: "Trade Buyer Confirmed", value: registration.confirmed ? 'YES' : 'NO', icon: CheckCircle2 },
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6">
            <div className="w-full">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button 
                            onClick={() => navigate('/buyer-registrations')}
                            className="flex items-center gap-2 text-gray-500 hover:text-[#23471d] transition-colors mb-2 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Registrations
                        </button>
                        <h1 className="text-3xl font-bold text-[#23471d] uppercase tracking-tight">Buyer Registration <span className="text-slate-900 italic">Overview</span></h1>
                        <p className="text-gray-500 text-base mt-2">Manage and view detailed information for this registration</p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            onClick={() => navigate(`/buyer-registration/edit/${id}`)}
                            className="bg-[#23471d] text-white shadow-lg hover:bg-slate-800"
                        >
                            Edit Registration
                        </Button>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white shadow-lg border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Company Overview" icon={Building2} />
                        <CompactDetailGrid data={companyData} />
                    </div>

                    <div className="bg-white shadow-lg border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Contact Personnel" icon={User} />
                        <CompactDetailGrid data={contactData} />
                    </div>

                    <div className="bg-white shadow-lg border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Interest & Logistics" icon={Briefcase} />
                        <CompactDetailGrid data={interestData} />
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                             <DetailRow label="Specific Exhibitors" value={registration.specificExhibitors} icon={Info} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerRegistrationDetail;
