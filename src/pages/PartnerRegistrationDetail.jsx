import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, FileText, CheckCircle, XCircle, Handshake, Download } from "lucide-react";
import api from "../lib/api";
import { showSuccess, showError } from "../utils/toastMessage";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const Button = ({ children, onClick, className, variant, ...props }) => {
  const baseStyles = "px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-sm flex items-center gap-2 transition-all";
  const variants = {
    primary: "bg-gray-800 text-white hover:bg-gray-700",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    success: "bg-green-700 text-white hover:bg-green-800",
    danger: "bg-red-700 text-white hover:bg-red-800",
  };
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variant ? variants[variant] : variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const PartnerRegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/partner-registration/${id}`);
      if (response.data.success) {
        setPartner(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching partner details:", error);
      showError("Failed to fetch details");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await api.patch(`/api/partner-registration/${id}/status`, { status: newStatus });
      if (response.data.success) {
        showSuccess(`Partner registration marked as ${newStatus}`);
        fetchDetail();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showError("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-8 text-center bg-white m-8 rounded-lg shadow">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Partner registration not found</h2>
        <Button onClick={() => navigate("/partner-registrations")} variant="outline" className="mt-4 mx-auto">
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
      .print-section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 15px !important; }
      .detail-row { break-inside: avoid; page-break-inside: avoid; }
      @page { size: A4; margin: 1.5cm; }
      h1, h2, h3 { page-break-after: avoid; }
      .document-header { border-bottom: 3px solid #1f2937; margin-bottom: 20px; padding-bottom: 10px; }
    }
    @media screen {
      .print-container { width: 100%; background: white; padding: 16px; }
      body { background: #f3f4f6; }
    }
  `;

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return value;
  };

  const DetailRow = ({ label, value, className = "" }) => (
    <div className={`detail-row mb-3 ${className}`}>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
        {label}
      </span>
      <p className="text-sm text-gray-900 font-semibold break-words leading-tight">
        {formatValue(value)}
      </p>
    </div>
  );

  const Section = ({ title, children, columns = "lg:grid-cols-6" }) => (
    <div className="print-section mb-6">
      <div className="border-b-2 border-gray-300 pb-1 mb-3">
        <h2 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-3 bg-gray-800"></div>
          {title}
        </h2>
      </div>
      <div className={`grid grid-cols-2 md:grid-cols-3 ${columns} gap-x-4 gap-y-1`}>
        {children}
      </div>
    </div>
  );

  const DocumentLink = ({ label, filePath }) => {
    if (!filePath) return <DetailRow label={label} value="Not Uploaded" className="text-gray-400 italic" />;
    return (
      <div className="detail-row mb-3">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
          {label}
        </span>
        <a
          href={`${SERVER_URL}${filePath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase rounded hover:bg-green-100 transition-all no-print"
        >
          <Download className="w-3.5 h-3.5" /> View / Download Document
        </a>
        <p className="hidden print:block text-xs font-bold text-gray-600">[Uploaded]</p>
      </div>
    );
  };

  return (
    <>
      <style>{printStyles}</style>
      <div className="print-container mt-6 ">
        <div className="w-full px-4">
          {/* Control Header (Hidden in Print) */}
          <div className="flex justify-between items-start mb-8 no-print border-b border-gray-100 pb-6">
            <div>
              <Button onClick={() => navigate("/partner-registrations")} variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </Button>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                Service Partner Registration Profile
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-black bg-gray-100 text-gray-600 px-3 py-1 rounded-sm uppercase tracking-widest">
                  REG ID: {partner.registrationId}
                </span>
                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest ${partner.status === "Accepted"
                    ? "bg-green-100 text-green-700"
                    : partner.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : partner.status === "Reviewed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  Status: {partner.status || "Pending"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {partner.status !== "Accepted" && (
                <Button onClick={() => handleStatusChange("Accepted")} variant="success">
                  <CheckCircle className="w-4 h-4" /> Accept
                </Button>
              )}
              {partner.status !== "Rejected" && (
                <Button onClick={() => handleStatusChange("Rejected")} variant="danger">
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
              )}
              {partner.status === "Pending" && (
                <Button onClick={() => handleStatusChange("Reviewed")} variant="primary">
                  Mark Reviewed
                </Button>
              )}
              <Button onClick={handlePrint} variant="outline">
                <Printer className="w-4 h-4" /> Print Profile
              </Button>
            </div>
          </div>

          {/* Document Header (Visible in Print Only) */}
          <div className="hidden print:block document-header">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                  IHWE 2026 Service Partner Profile
                </h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-1">
                  Official Partnership Assessment Profile
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-gray-400 uppercase">Registration Number</p>
                <p className="text-xl font-black text-gray-800">{partner.registrationId}</p>
              </div>
            </div>
          </div>

          {/* SECTION 1: COMPANY PROFILE */}
          <Section title="Section 1 – Company Information">
            <DetailRow label="Company Name" value={partner.companyName} />
            <DetailRow label="Business Category" value={partner.businessCategory} />
            <DetailRow label="Website" value={partner.website} />
            <DetailRow label="Year Established" value={partner.yearEstablished} />
            <DetailRow label="GST Number" value={partner.gstNumber} />
            <DetailRow label="MSME Registration No" value={partner.msmeRegistration} />
          </Section>

          {/* SECTION 2: CONTACT DETAILS */}
          <Section title="Section 2 – Contact Information">
            <DetailRow label="Contact Person" value={partner.fullName} />
            <DetailRow label="Designation" value={partner.designation} />
            <DetailRow label="Mobile Number" value={partner.mobile} />
            <DetailRow label="WhatsApp Number" value={partner.whatsapp} />
            <DetailRow label="Email Address" value={partner.email} />
            <DetailRow label="Pin Code" value={partner.pinCode} />
            <DetailRow label="Office Address" value={partner.officeAddress} className="col-span-2" />
            <DetailRow label="City" value={partner.city} />
            <DetailRow label="State" value={partner.state} />
            <DetailRow label="Country" value={partner.country} />
          </Section>

          {/* SECTION 3: SERVICES AND CAPACITY */}
          <Section title="Section 3 – Services & Professional Capacity">
            <div className="col-span-full mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                Which Services Do You Offer?
              </span>
              <div className="flex flex-wrap gap-2">
                {partner.selectedServices && partner.selectedServices.length > 0 ? (
                  partner.selectedServices.map((s, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-green-50 border border-green-100 text-green-800 text-[11px] font-bold rounded-md"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">None specified</span>
                )}
              </div>
            </div>
            {partner.otherService && (
              <DetailRow label="Other Services Description" value={partner.otherService} className="col-span-full" />
            )}
            <DetailRow label="Years of Experience" value={partner.experience} />
            <DetailRow label="Operational Cities" value={partner.operationalCities} className="col-span-2" />
            <DetailRow label="Can Handle International Projects?" value={partner.canHandleInternational} />
            <DetailRow label="Major Clients / Key Accounts" value={partner.majorClients} className="col-span-full bg-gray-50 p-2.5 rounded" />
          </Section>

          {/* SECTION 4: PARTNERSHIP PREFERENCES */}
          <Section title="Section 4 – Partnership Preferences & Additional Information">
            <div className="col-span-full mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                Interests & Partnership Model
              </span>
              <div className="flex flex-wrap gap-2">
                {partner.partnershipInterests && partner.partnershipInterests.length > 0 ? (
                  partner.partnershipInterests.map((p, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-800 text-[11px] font-bold rounded-md"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">None specified</span>
                )}
              </div>
            </div>
            <DetailRow label="Additional Remarks" value={partner.additionalInfo} className="col-span-full bg-gray-50 p-2.5 rounded" />
          </Section>

          {/* SECTION 5: SUPPORTING DOCUMENTS */}
          <Section title="Section 5 – Supporting Documents & Certifications" columns="lg:grid-cols-3">
            <DocumentLink label="Company Profile" filePath={partner.companyProfilePath} />
            <DocumentLink label="GST Certificate" filePath={partner.gstCertificatePath} />
            <DocumentLink label="PAN Card" filePath={partner.panCardPath} />
            <DocumentLink label="MSME Certificate" filePath={partner.msmeCertificatePath} />
            <DocumentLink label="Portfolio / Credentials" filePath={partner.portfolioPath} />
            <DocumentLink label="Visiting Card" filePath={partner.visitingCardPath} />
          </Section>

          {/* SECTION 6: METADATA & DECLARATION */}
          <Section title="Section 6 – Declaration & Registration Status">
            <DetailRow label="Declaration Accepted?" value={partner.declaration ? "YES, ACCEPTED" : "NO"} className="font-bold text-green-700" />
            <DetailRow label="Otp Verified Email" value={partner.otpVerifiedEmail ? "Yes" : "No"} />
            <DetailRow label="Otp Verified Mobile" value={partner.otpVerifiedMobile ? "Yes" : "No"} />
            <DetailRow label="Submitted At" value={new Date(partner.createdAt).toLocaleString()} />
            <DetailRow label="Last Updated At" value={new Date(partner.updatedAt).toLocaleString()} />
          </Section>

          {/* Document Footer (Visible in Print) */}
          <div className="hidden print:block mt-16 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-end">
              <div className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                <p>System Generated Document</p>
                <p className="mt-1">© 2026 IHWE | Namo Gange Wellness Pvt. Ltd.</p>
              </div>
              <div className="text-center w-48">
                <div className="border-b border-gray-400 mb-2"></div>
                <p className="text-[10px] font-black text-gray-600 uppercase">Assessment Officer Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerRegistrationDetail;
