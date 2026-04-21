
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from "../lib/api";

const Button = ({ children, onClick, className, variant, ...props }) => {
    const baseStyles = "px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-sm flex items-center gap-2";
    const variants = {
        primary: "bg-gray-800 text-white",
        outline: "bg-white border border-gray-300 text-gray-700"
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
                <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">Registration not found</h2>
                <Button onClick={() => navigate('/buyer-list')} className="mt-4">
                    Back to List
                </Button>
            </div>
        );
    }

    const printStyles = `
    @media print {
      body { margin: 0; padding: 0; background: white; }
      .no-print { display: none !important; }
      .print-container { padding: 0; margin: 0; width: 100%; }
      .print-section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 24px !important; }
      .detail-row { break-inside: avoid; page-break-inside: avoid; }
      @page { size: A4; margin: 1.5cm; }
      h1, h2, h3 { page-break-after: avoid; }
    }
    @media screen {
      .print-container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; }
      body { background: #e5e7eb; padding: 20px; }
    }
  `;

    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') return '—';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';

        // Handle case where backend returns a stringified JSON array
        if (typeof value === 'string' && value.trim().startsWith('[') && value.trim().endsWith(']')) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return parsed.length === 0 ? '—' : parsed.join(', ');
                }
            } catch (e) {
                return value;
            }
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return '—';
            // If the array contains a single string that is actually JSON, parse it
            if (value.length === 1 && typeof value[0] === 'string' && value[0].trim().startsWith('[') && value[0].trim().endsWith(']')) {
                try {
                    const parsed = JSON.parse(value[0]);
                    if (Array.isArray(parsed)) {
                        return parsed.join(', ');
                    }
                } catch (e) { }
            }
            // Otherwise regular array
            return value.map(item => {
                if (typeof item === 'string') return item;
                return String(item);
            }).join(', ');
        }
        return value;
    };

    const DetailRow = ({ label, value }) => (
        <div className="detail-row py-2 px-2 border-b border-gray-100">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">
                {label}
            </span>
            <p className="text-sm text-gray-900 mt-1 font-medium break-words">
                {formatValue(value)}
            </p>
        </div>
    );

    const Section = ({ title, children }) => (
        <div className="print-section mb-6">
            <div className="border-b-2 border-gray-300 pb-1 mb-3">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    {title}
                </h2>
            </div>
            {children}
        </div>
    );

    const FiveColumnGrid = ({ children }) => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {children}
        </div>
    );

    return (
        <>
            <style>{printStyles}</style>
            <div className="print-container">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200 no-print">
                    <button
                        onClick={() => navigate('/buyer-list')}
                        className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded"
                    >
                        🖨️ Print / PDF
                    </button>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                            Buyer Registration Details
                        </h1>
                        <div className="mt-2">
                            <span className="text-sm text-gray-600 font-mono">
                                {registration.registrationId || "ID PENDING"}
                                {registration._id && <span className="text-gray-400"> • Ref: {registration._id.slice(-8)}</span>}
                            </span>
                        </div>
                        {registration.buyerTag && (
                            <div className="mt-3 inline-block px-4 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wide">
                                {registration.buyerTag} LEAD
                            </div>
                        )}

                    </div>

                    {/* Personal & Company */}
                    <Section title="Personal & Company Information">
                        <FiveColumnGrid>
                            <DetailRow label="Full Name" value={registration.fullName} />
                            <DetailRow label="Designation" value={registration.designation} />
                            <DetailRow label="Company Name" value={registration.companyName} />
                            <DetailRow label="Mobile Number" value={registration.mobileNumber} />
                            <DetailRow label="Alternate Number" value={registration.alternateNumber} />
                            <DetailRow label="Email Address" value={registration.emailAddress} />
                            <DetailRow label="Business Role" value={registration.businessType} />
                            <DetailRow label="Website" value={registration.website} />
                        </FiveColumnGrid>
                    </Section>

                    {/* Registered Address */}
                    <Section title="Registered Address">
                        <FiveColumnGrid>
                            <DetailRow label="Country" value={registration.country} />
                            <DetailRow label="State/Province" value={registration.stateProvince} />
                            <DetailRow label="City" value={registration.city} />
                            <DetailRow label="Pin Code" value={registration.pinCode} />
                        </FiveColumnGrid>
                        <DetailRow label="Registered Address" value={registration.registeredAddress} />
                    </Section>

                    {/* Company Business Profile */}
                    <Section title="Company Business Profile">
                        <FiveColumnGrid>
                            <DetailRow label="Company/Firm Name" value={registration.companyFirmName} />
                            <DetailRow label="Brand Name" value={registration.brandName} />
                            <DetailRow label="Business Type" value={registration.basicBusinessType} />
                            <DetailRow label="Year of Est." value={registration.yearOfEstablishment} />
                            <DetailRow label="GST Number" value={registration.gstNumber} />
                            <DetailRow label="PAN Number" value={registration.panNumber} />
                            <DetailRow label="Buyer Industry" value={registration.buyerIndustry} />
                        </FiveColumnGrid>
                    </Section>

                    {/* Business Profile Details */}
                    <Section title="Business Profile Details">
                        <FiveColumnGrid>
                            <DetailRow label="Nature of Business" value={registration.natureOfBusiness} />
                            <DetailRow label="Years in Business" value={registration.yearsInBusiness} />
                            <DetailRow label="No. of Outlets" value={registration.numberOfOutlets} />
                            <DetailRow label="Annual Turnover" value={registration.annualTurnover} />
                        </FiveColumnGrid>
                    </Section>

                    {/* Sourcing & Purchase Intent */}
                    <Section title="Sourcing & Purchase Intent">
                        <FiveColumnGrid>
                            <DetailRow label="Primary Interest" value={registration.primaryProductInterest} />
                            <DetailRow label="Secondary Categories" value={registration.secondaryProductCategories} />
                            <DetailRow label="Import Interest" value={registration.interestedInImporting} />
                            <DetailRow label="Export Interest" value={registration.interestedInExporting} />
                            <DetailRow label="Business Model" value={registration.businessModelPreference} />
                            <DetailRow label="Est. Monthly Purchase" value={registration.estimatedPurchaseVolume} />
                            <DetailRow label="Budget Range" value={registration.budgetRange} />
                            <DetailRow label="Buying Frequency" value={registration.buyingFrequency} />
                            <DetailRow label="Est. Annual Purchase" value={registration.estimatedAnnualPurchaseValue} />
                            <DetailRow label="Purchase Timeline" value={registration.purchaseTimeline} />
                            <DetailRow label="Matchmaking Interest" value={registration.matchmakingInterest} />
                            <DetailRow label="Role in Purchase" value={registration.roleInPurchaseDecision} />
                        </FiveColumnGrid>
                        <DetailRow label="Specific Requirements" value={registration.specificProductRequirements} />
                    </Section>

                    {/* Supplier Preference */}
                    <Section title="Supplier Preference">
                        <FiveColumnGrid>
                            <DetailRow label="Preferred Region" value={registration.preferredSupplierRegion} />
                            <DetailRow label="Preferred Supplier Type" value={registration.preferredSupplierType} />
                            <DetailRow label="Preferred State" value={registration.preferredState} />
                            <DetailRow label="Preferred Company Size" value={registration.preferredCompanySize} />
                        </FiveColumnGrid>
                    </Section>

                    {/* Certification & Compliance */}
                    <Section title="Certification & Compliance">
                        <FiveColumnGrid>
                            <DetailRow label="Required Certifications" value={registration.requiredCertifications} />
                            <DetailRow label="Pricing Preference" value={registration.pricingPreference} />
                            <DetailRow label="Payment Methods" value={registration.preferredPaymentMethods} />
                            <DetailRow label="Logistics Requirements" value={registration.logisticsRequirements} />
                        </FiveColumnGrid>
                    </Section>

                    {/* B2B Meeting Preferences */}
                    <Section title="B2B Meeting Preferences">
                        <FiveColumnGrid>
                            <DetailRow label="Pre-scheduled B2B" value={registration.requirePreScheduledB2B} />
                            <DetailRow label="Priority Level" value={registration.meetingPriorityLevel} />
                        </FiveColumnGrid>
                        {registration.requirePreScheduledB2B === 'Yes' && (
                            <>
                                <FiveColumnGrid>
                                    <DetailRow label="Meeting Categories" value={registration.preferredMeetingCategories} />
                                    <DetailRow label="Exhibitor Types" value={registration.preferredExhibitorTypes} />
                                    <DetailRow label="Meeting Objectives" value={registration.meetingObjectives} />
                                    <DetailRow label="Business Types" value={registration.preferredBusinessTypes} />
                                    <DetailRow label="Preferred Day" value={registration.preferredMeetingDay} />
                                    <DetailRow label="Time Slot" value={registration.preferredTimeSlot} />
                                    <DetailRow label="Number of Meetings" value={registration.numberOfMeetingsInterested} />
                                </FiveColumnGrid>
                                <DetailRow label="Meeting Requirements" value={registration.meetingRequirements} />
                            </>
                        )}
                    </Section>

                    {/* Registration & Payment Details */}
                    <Section title="Registration & Payment Details">
                        <FiveColumnGrid>
                            <DetailRow label="Registration Category" value={registration.registrationCategory} />
                            <DetailRow label="Registration Fee" value={registration.registrationFee} />
                            <DetailRow label="Payment Mode" value={registration.paymentMode} />
                            <DetailRow label="Payment Status" value={registration.paymentStatus} />
                            <DetailRow label="Transaction ID" value={registration.transactionId || registration.razorpayPaymentId} />
                            <DetailRow label="Registration Date" value={registration.createdAt ? new Date(registration.createdAt).toLocaleDateString('en-IN') : 'N/A'} />
                            <DetailRow label="Payment Proof" value={registration.paymentProof ? "Available" : "Not provided"} />
                        </FiveColumnGrid>
                    </Section>

                    {/* Admin Remarks */}
                    <Section title="Admin / Internal Remarks">
                        <div className="bg-orange-50 p-4 border border-orange-200">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {registration.remarks || 'No remarks provided.'}
                            </p>
                        </div>
                    </Section>
                </div>
            </div>
        </>
    );
};

export default BuyerRegistrationDetail;