import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Printer } from 'lucide-react';
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

const InternationalBuyerRegistrationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/api/international-buyer/${id}`);
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

    const handlePrint = () => {
        window.print();
    };

    const handleEdit = () => {
        navigate(`/international-buyer/edit/${id}`);
    };

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
                <Button onClick={() => navigate('/international-buyer-list')} className="mt-4">
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
      .print-section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 12px !important; }
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
            return value.join(', ');
        }
        return value;
    };

    const DetailRow = ({ label, value }) => (
        <div className="detail-row mb-2">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">
                {label}
            </span>
            <p className="text-sm text-gray-900 font-medium break-words leading-tight">
                {formatValue(value)}
            </p>
        </div>
    );

    const Section = ({ title, children }) => (
        <div className="print-section mb-3">
            <div className="border-b-2 border-gray-300 pb-0.5 mb-2">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    {title}
                </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-2 gap-y-0">
                {children}
            </div>
        </div>
    );

    return (
        <>
            <style>{printStyles}</style>
            <div className="print-container">
                <div className="max-w-8xl mx-auto">
                    {/* Header with buttons */}
                    <div className="flex justify-between items-start mb-4 no-print">
                        <div>
                            <Button
                                onClick={() => navigate('/international-buyer-list')}
                                variant="outline"
                                className="mb-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mt-2">
                                International Buyer Registration Details
                            </h1>
                            <div className="mt-1">
                                <span className="text-sm text-gray-600 font-mono">
                                    {registration.registrationId || "ID PENDING"}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                className="bg-white hover:bg-gray-50"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Button>
                            <Button
                                onClick={handlePrint}
                                variant="primary"
                                className="bg-gray-800 hover:bg-gray-700"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </Button>
                        </div>
                    </div>

                    {/* Print version header (visible only in print) */}
                    <div className="hidden print:block mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                            International Buyer Registration Details
                        </h1>
                        <div className="mt-1">
                            <span className="text-sm text-gray-600 font-mono">
                                {registration.registrationId || "ID PENDING"}
                            </span>
                        </div>
                    </div>

                    <Section title="Section 1 – Company Information">
                        <DetailRow label="Brand / Company Name" value={registration.brandName} />
                        <DetailRow label="Legal Entity Type" value={registration.legalEntityType} />
                        <DetailRow label="Country of Registration" value={registration.countryOfRegistration} />
                        <DetailRow label="Registration Status" value={registration.registrationStatus} />
                        <DetailRow label="Year established" value={registration.yearOfEstablishment} />
                        <DetailRow label="Reg. Number" value={registration.registrationNumber} />
                        <DetailRow label="Tax ID / VAT" value={registration.taxRegistrationNumber} />
                        <DetailRow label="IEC Code" value={registration.importExportCode} />
                        <DetailRow label="Business License" value={registration.businessLicenseNumber} />
                    </Section>

                    <Section title="Section 2 – Registered Office Details">
                        <DetailRow label="Full Address" value={registration.address} />
                        <DetailRow label="City" value={registration.city} />
                        <DetailRow label="State / Province" value={registration.stateProvince} />
                        <DetailRow label="Country" value={registration.country} />
                        <DetailRow label="Postal Code" value={registration.postalCode} />
                        <DetailRow label="Website" value={registration.website} />
                        <DetailRow label="LinkedIn" value={registration.linkedInPage} />
                        <DetailRow label="Social Media" value={registration.socialMediaLinks} />
                    </Section>

                    <Section title="Section 3 – Primary Contact Person">
                        <DetailRow label="Full Name" value={registration.primaryContact?.fullName} />
                        <DetailRow label="Designation" value={registration.primaryContact?.designation} />
                        <DetailRow label="Official Email" value={registration.primaryContact?.emailId} />
                        <DetailRow label="Mobile Number" value={registration.primaryContact?.mobileNumber} />
                        <DetailRow label="WhatsApp" value={registration.primaryContact?.whatsappNumber} />
                    </Section>

                    <Section title="Section 4 – Secondary Contact Person">
                        <DetailRow label="Full Name" value={registration.secondaryContact?.fullName} />
                        <DetailRow label="Designation" value={registration.secondaryContact?.designation} />
                        <DetailRow label="Contact Number" value={registration.secondaryContact?.contactNumber} />
                        <DetailRow label="Email Id" value={registration.secondaryContact?.emailId} />
                    </Section>

                    <Section title="Section 5 – Product / Service Category">
                        <DetailRow label="Nature of Business" value={registration.natureOfBusiness} />
                        <DetailRow label="Product Categories" value={registration.productCategories} />
                    </Section>

                    <Section title="Section 6 – Stall Requirement">
                        <DetailRow label="Preferred Stall" value={registration.stallRequirement?.preferredStallType} />
                        <DetailRow label="Stall Size" value={registration.stallRequirement?.stallSize} />
                        <DetailRow label="Corner Stall" value={registration.stallRequirement?.cornerStallRequired} />
                        <DetailRow label="Preferred Hall" value={registration.stallRequirement?.preferredHallNumber} />
                        <DetailRow label="Preferred Location" value={registration.stallRequirement?.preferredStallLocation} />
                        <DetailRow label="Country Pavilion" value={registration.stallRequirement?.countryPavilionParticipation} />
                    </Section>

                    <Section title="Section 7 – Sponsorship Interest">
                        <DetailRow label="Interested" value={registration.sponsorship?.interested} />
                        <DetailRow label="Preferred Type" value={registration.sponsorship?.preferredType} />
                    </Section>

                    <Section title="Section 8 – Business Profile">
                        <DetailRow label="Profile Short" value={registration.businessProfile?.companyProfileShort} />
                        <DetailRow label="Key Products" value={registration.businessProfile?.keyProductsServices} />
                        <DetailRow label="Export Countries" value={registration.businessProfile?.exportCountries} />
                        <DetailRow label="Major Clients" value={registration.businessProfile?.existingMajorClients} />
                        <DetailRow label="Certifications" value={registration.businessProfile?.certifications} />
                    </Section>

                    <Section title="Section 9 – B2B Meeting Interest">
                        <DetailRow label="Interested" value={registration.b2bInterest?.interested} />
                        <DetailRow label="Looking For" value={registration.b2bInterest?.lookingFor} />
                    </Section>

                    <Section title="Section 10 – Travel Support">
                        <DetailRow label="Visa Invitation" value={registration.travelSupport?.visaInvitation} />
                        <DetailRow label="Hotel Booking" value={registration.travelSupport?.hotelBooking} />
                        <DetailRow label="Airport Pickup" value={registration.travelSupport?.airportPickup} />
                        <DetailRow label="Translator Support" value={registration.travelSupport?.translatorSupport} />
                        <DetailRow label="Arrival Date" value={registration.travelSupport?.arrivalDate ? new Date(registration.travelSupport.arrivalDate).toLocaleDateString('en-IN') : '—'} />
                        <DetailRow label="Departure Date" value={registration.travelSupport?.departureDate ? new Date(registration.travelSupport.departureDate).toLocaleDateString('en-IN') : '—'} />
                    </Section>

                    <Section title="Section 11 – Billing & Payment Details">
                        <DetailRow label="Billing Name" value={registration.billingDetails?.billingName} />
                        <DetailRow label="Billing Address" value={registration.billingDetails?.billingAddress} />
                        <DetailRow label="Accounts Contact" value={registration.billingDetails?.accountsContactPerson} />
                        <DetailRow label="Accounts Email" value={registration.billingDetails?.accountsEmail} />
                        <DetailRow label="Accounts Mobile" value={registration.billingDetails?.accountsMobileNumber} />
                        <DetailRow label="Invoice Required" value={registration.billingDetails?.invoiceRequired} />
                        <DetailRow label="Payment Mode" value={registration.billingDetails?.paymentMode} />
                        <DetailRow label="Amount Paid" value={registration.billingDetails?.bookingAmountPaid} />
                        <DetailRow label="UTR / Trans. ID" value={registration.billingDetails?.utrTransactionId} />
                    </Section>

                    <Section title="Registration & Verification Status">
                        <DetailRow label="Payment Status" value={registration.paymentStatus} />
                        <DetailRow label="Admin Status" value={registration.verification?.adminApprovalStatus} />
                        <DetailRow label="Email Verified" value={registration.verification?.emailVerified} />
                        <DetailRow label="Mobile Verified" value={registration.verification?.mobileOtpVerified} />
                        <DetailRow label="Tax Verified" value={registration.verification?.taxRegistrationVerified} />
                        <DetailRow label="Passport Verified" value={registration.verification?.passportVerified} />
                        <DetailRow label="VIP Program Interest" value={registration.vipProgram?.interested} />
                        <DetailRow label="Created Date" value={registration.createdAt ? new Date(registration.createdAt).toLocaleDateString('en-IN') : '—'} />
                    </Section>

                    <Section title="Admin / Internal Remarks">
                        <div className="bg-orange-50 p-3 border border-orange-200 w-full col-span-full">
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

export default InternationalBuyerRegistrationDetail;
