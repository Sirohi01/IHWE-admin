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

    // Professional Print Styles - Centered layout for A4
    const printStyles = `
        @media print {
            body {
                margin: 0;
                padding: 0;
                background: white;
            }
            .no-print {
                display: none !important;
            }
            .print-container {
                padding: 0;
                margin: 0;
                width: 100%;
            }
            .print-section {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 24px !important;
            }
            .detail-row {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            @page {
                size: A4;
                margin: 1.5cm;
            }
            h1, h2, h3 {
                page-break-after: avoid;
            }
        }
        @media screen {
            .print-container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 20px;
            }
            body {
                background: #e5e7eb;
                padding: 20px;
            }
        }
    `;

    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return '—';
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (Array.isArray(value) && value.length > 0) {
            return value.join(', ');
        }
        return value;
    };

    const DetailRow = ({ label, value }) => (
        <div className="detail-row py-2 px-2 border-b border-gray-100 min-w-0">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">{label}</span>
            <p className="text-sm text-gray-900 mt-1 font-medium break-words overflow-wrap-break-word">{formatValue(value)}</p>
        </div>
    );

    const Section = ({ title, children }) => (
        <div className="print-section mb-6">
            <div className="border-b-2 border-gray-300 pb-1 mb-3">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
            </div>
            {children}
        </div>
    );

    const FiveColumnGrid = ({ children }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {children}
        </div>
    );

    return (
        <>
            <style>{printStyles}</style>
            <div className="print-container">
                {/* Header with Print Button */}
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

                {/* Main Content - Centered Layout */}
                <div className="max-w-6xl mx-auto">
                    {/* Title Section - Centered */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Buyer Registration Details</h1>
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

                    {/* Company Information */}
                    <Section title="Company & Business Profile">
                        <FiveColumnGrid>
                            <DetailRow label="Company Name" value={registration.companyName} />
                            <DetailRow label="Business Type" value={registration.businessType} />
                            <DetailRow label="Annual Turnover" value={registration.annualTurnover} />
                            <DetailRow label="Years in Operation" value={registration.yearsInOperation} />
                            <DetailRow label="Country" value={registration.country} />
                            <DetailRow label="State/Province" value={registration.stateProvince} />
                            <DetailRow label="City" value={registration.city} />
                            <DetailRow label="PIN/ZIP Code" value={registration.pinCode || registration.zipCode} />
                            <DetailRow label="GST Number" value={registration.gstNumber || registration.gst} />
                            <DetailRow label="PAN Number" value={registration.panNumber || registration.pan} />
                            <DetailRow label="Website" value={registration.website} />
                            <DetailRow label="Registration Date" value={registration.createdAt ? new Date(registration.createdAt).toLocaleDateString('en-IN') : 'N/A'} />
                        </FiveColumnGrid>
                    </Section>

                    {/* Contact Information */}
                    <Section title="Contact Personnel">
                        <FiveColumnGrid>
                            <DetailRow label="Full Name" value={registration.fullName || registration.contactPerson} />
                            <DetailRow label="Designation" value={registration.designation || registration.position} />
                            <DetailRow label="Email Address" value={registration.emailAddress || registration.email} />
                            <DetailRow label="Mobile Number" value={registration.mobileNumber || registration.whatsapp || registration.phone} />
                            <DetailRow label="Alternate Phone" value={registration.alternatePhone || registration.landline} />
                            <DetailRow label="WhatsApp Number" value={registration.whatsapp || registration.mobileNumber} />
                            <DetailRow label="Number of Employees" value={registration.numberOfEmployees} />
                            <DetailRow label="IEC Code" value={registration.iecNumber} />
                        </FiveColumnGrid>
                    </Section>

                    {/* Sourcing Information */}
                    <Section title="Sourcing & Supplier Preferences">
                        <FiveColumnGrid>
                            <DetailRow label="Primary Product Interest" value={registration.primaryProductInterest} />
                            <DetailRow label="Secondary Categories" value={registration.secondaryProductCategories} />
                            <DetailRow label="Preferred Supplier Region" value={registration.preferredSupplierRegion} />
                            <DetailRow label="Preferred Supplier Type" value={registration.preferredSupplierType} />
                        </FiveColumnGrid>
                        <div className="mt-3">
                            <DetailRow label="Specific Requirements" value={registration.specificRequirements || registration.productDetails} />
                        </div>
                    </Section>

                    {/* Purchase Information */}
                    <Section title="Purchase Intent & Logistics">
                        <FiveColumnGrid>
                            <DetailRow label="Purchase Timeline" value={registration.purchaseTimeline} />
                            <DetailRow label="Role in Decision" value={registration.roleInPurchaseDecision} />
                            <DetailRow label="Priority Level" value={registration.meetingPriorityLevel} />
                            <DetailRow label="Require Pre-Scheduled B2B" value={registration.requirePreScheduledB2B} />
                            <DetailRow label="Expected Order Value" value={registration.expectedOrderValue} />
                            <DetailRow label="Preferred Meeting Mode" value={registration.preferredMeetingMode} />
                        </FiveColumnGrid>
                    </Section>

                    {/* Payment Information */}
                    <Section title="Registration & Payment Details">
                        <FiveColumnGrid>
                            <DetailRow label="Registration Category" value={registration.registrationCategory} />
                            <DetailRow label="Registration Fee" value={registration.registrationFee} />
                            <DetailRow label="Payment Status" value={registration.paymentStatus} />
                            <DetailRow label="Transaction ID" value={registration.transactionId || registration.razorpayPaymentId || registration.orderId} />
                            <DetailRow label="Payment Date" value={registration.paymentDate ? new Date(registration.paymentDate).toLocaleDateString('en-IN') : 'N/A'} />
                            <DetailRow label="Payment Proof" value={registration.paymentProof ? "Available" : "Not provided"} />
                        </FiveColumnGrid>
                    </Section>

                    {/* Addresses */}
                    <Section title="Addresses">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border-r border-gray-200 pr-4">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Registered Address</h3>
                                <p className="text-sm text-gray-800 leading-relaxed break-words">
                                    {registration.registeredAddress || registration.businessAddress || 'Not provided'}
                                </p>
                            </div>
                            <div className="pl-0 md:pl-4">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Shipping Address</h3>
                                <p className="text-sm text-gray-800 leading-relaxed break-words">
                                    {registration.shippingAddress || registration.factoryAddress || 'Same as registered address'}
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* Admin Remarks */}
                    <Section title="Admin Remarks">
                        <div className="bg-gray-50 p-4 border border-gray-200">
                            <p className="text-sm text-gray-700 leading-relaxed break-words">
                                {registration.remarks || registration.adminNotes || 'No remarks'}
                            </p>
                        </div>
                    </Section>

                    {/* Footer */}

                </div>
            </div>
        </>
    );
};

export default BuyerRegistrationDetail;