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
        { label: "Business Type", value: registration.businessType, icon: Info },
        { label: "Annual Turnover", value: registration.annualTurnover, icon: Info },
        { label: "Years in Operation", value: registration.yearsInOperation, icon: Calendar },
        { label: "Country", value: registration.country, icon: Globe },
        { label: "State/Province", value: registration.stateProvince, icon: Globe },
        { label: "City", value: registration.city, icon: Globe },
        { label: "Registered Date", value: new Date(registration.createdAt).toLocaleDateString(), icon: Calendar },
    ];

    const contactData = [
        { label: "Full Name", value: registration.fullName || registration.contactPerson, icon: User },
        { label: "Designation", value: registration.designation, icon: Briefcase },
        { label: "Email Address", value: registration.emailAddress || registration.email, icon: Mail },
        { label: "Mobile Number", value: registration.mobileNumber || registration.whatsapp, icon: Phone },
    ];

    const sourcingData = [
        { label: "Primary Interest", value: registration.primaryProductInterest, icon: Target },
        { label: "Secondary Categories", value: registration.secondaryProductCategories, icon: Briefcase },
        { label: "Supplier Region", value: registration.preferredSupplierRegion, icon: Globe },
        { label: "Supplier Type", value: registration.preferredSupplierType, icon: User },
    ];

    const purchaseData = [
        { label: "Timeline", value: registration.purchaseTimeline, icon: Info },
        { label: "Decision Role", value: registration.roleInPurchaseDecision, icon: User },
        { label: "Priority", value: registration.meetingPriorityLevel, icon: Target },
        { label: "B2B Scheduled", value: registration.requirePreScheduledB2B, icon: Calendar },
    ];

    const paymentData = [
        { label: "Category", value: registration.registrationCategory, icon: CreditCard },
        { label: "Fee Paid", value: registration.registrationFee, icon: CreditCard },
        { label: "Status", value: registration.paymentStatus, icon: CheckCircle2 },
        { label: "Payment ID", value: registration.razorpayPaymentId, icon: Info },
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
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-[#23471d] uppercase tracking-tight">Buyer Registration <span className="text-slate-900 italic">Overview</span></h1>
                            {registration.buyerTag && (
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${
                                    registration.buyerTag === 'Hot' ? 'bg-red-50 text-red-600 border-red-200' :
                                    registration.buyerTag === 'Warm' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                    'bg-blue-50 text-blue-600 border-blue-200'
                                }`}>
                                    {registration.buyerTag} LEAD
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-base mt-2">ID: {registration._id} | Database Record</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white shadow-lg border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Company & Business Profile" icon={Building2} />
                        <CompactDetailGrid data={companyData} />
                    </div>

                    <div className="bg-white shadow-lg border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Contact Personnel" icon={User} />
                        <CompactDetailGrid data={contactData} />
                    </div>

                    <div className="bg-white shadow-lg border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Sourcing & Supplier Preferences" icon={Target} />
                        <CompactDetailGrid data={sourcingData} />
                    </div>

                    <div className="bg-white shadow-lg border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Purchase Intent & B2B Logistics" icon={Calendar} />
                        <CompactDetailGrid data={purchaseData} />
                    </div>

                    <div className="bg-white shadow-lg border-2 border-gray-100 overflow-hidden">
                        <SectionHeader title="Registration & Payment Details" icon={CreditCard} />
                        <CompactDetailGrid data={paymentData} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-6 border rounded-lg">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Registered Address</h4>
                            <p className="text-slate-700 font-medium leading-relaxed">{registration.registeredAddress || 'No address provided'}</p>
                        </div>
                        <div className="bg-slate-50 p-6 border rounded-lg">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Admin Remarks</h4>
                            <p className="text-slate-700 font-medium leading-relaxed">{registration.remarks || 'No remarks added'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerRegistrationDetail;
