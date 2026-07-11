import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Printer, Download, Star } from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import dayjs from "dayjs";

const DetailRow = ({ label, value, isRating }) => {
  const renderValue = () => {
    if (isRating && typeof value === 'number') {
      return (
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < value ? "fill-amber-500 text-amber-500" : "text-slate-200 fill-slate-50"} />
          ))}
          <span className="ml-1.5 text-[9px] font-bold text-slate-500">({value}/5)</span>
        </div>
      );
    }
    return value || "-";
  };

  return (
    <div className="flex flex-col sm:flex-row py-2.5 border-b border-slate-100 last:border-0">
      <span className="w-full sm:w-1/3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="w-full sm:w-2/3 text-[11px] font-bold text-slate-800">{renderValue()}</span>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="bg-white rounded-lg p-4 mb-6" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
    <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">{title}</h2>
    {children}
  </div>
);

const PrintField = ({ label, value, fullWidth = false }) => (
    <div className={`flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300 ${fullWidth ? "col-span-2" : ""}`}>
        <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">{label}:</span>
        <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{value || '-'}</span>
    </div>
);

const PrintStar = ({ label, value }) => (
    <div className="flex flex-row items-start gap-2 py-0.5 min-w-0 text-left">
        <span className="text-[8.5pt] text-slate-500 font-bold normal-case leading-tight mb-0 w-36 shrink-0">{label}:</span>
        <div className="flex gap-0.5 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="inline text-[13pt] leading-none" style={{ color: star <= (typeof value === 'number' ? value : 0) ? "#000" : "#ddd" }}>
                    {star <= (typeof value === 'number' ? value : 0) ? '★' : '☆'}
                </span>
            ))}
        </div>
    </div>
);

const PrintSection = ({ title, children, className }) => (
    <div className={`mb-2 bg-transparent flex flex-col break-inside-avoid p-0 ${className || ''}`}>
        <div className="flex items-center gap-3 border-b-[1pt] border-black pb-1 mb-1.5">
            <h3 className="font-black uppercase tracking-wide text-[11pt] text-black">
                {title}
            </h3>
        </div>
        <div className="p-0 flex-1">
            {children}
        </div>
    </div>
);

export default function MobileFeedbackDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get(`/api/exhibitor-feedback/admin/${id}`);
      setData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const markReviewed = async () => {
    await api.put(`/api/exhibitor-feedback/admin/${id}/review`, { status: "reviewed" });
    load();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs font-bold">Loading details...</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-sm font-bold text-slate-800 mb-2">Feedback not found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 text-xs font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const { responses } = data;

  return (
    <div className="p-4 bg-slate-50 min-h-screen font-inter print:bg-white print:p-0 print:min-h-0">
      
      {/* SCREEN VIEW */}
      <div className="print:hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/mobile-feedback")} 
              className="p-1.5 bg-white rounded hover:bg-slate-100 transition-colors"
              style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800" style={{ color: '#093C5D' }}>Exhibitor Feedback Details</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review full feedback submission</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.status !== "reviewed" && (
              <button 
                onClick={markReviewed} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white rounded text-[10px] font-bold shadow-sm transition-colors"
              >
                <CheckCircle size={14} /> Mark as Reviewed
              </button>
            )}
            {/* 
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded text-[10px] font-bold transition-colors"
              style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}
            >
              <Printer size={14} /> Print
            </button>
            */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Core Info & Status */}
          <div className="lg:col-span-1 space-y-4">
            <Card title="Status & Meta">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Status</p>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-bold text-[9px] capitalize ${data.status === "reviewed" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-amber-700 bg-amber-50 border border-amber-200"}`}>
                    {data.status || "new"}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Submitted On</p>
                  <p className="text-[11px] font-bold" style={{ color: '#111844' }}>
                    {dayjs(data.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </p>
                </div>
                {data.status === "reviewed" && data.reviewedAt && (
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Reviewed On</p>
                    <p className="text-[11px] font-bold" style={{ color: '#111844' }}>
                      {dayjs(data.reviewedAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Basic Details">
              <div className="space-y-0">
                <DetailRow label="Company Name" value={data.companyName} />
                <DetailRow label="Exhibitor Name" value={data.exhibitorName} />
                <DetailRow label="Reg ID" value={data.registrationId} />
                <DetailRow label="Stall Number" value={data.stallNumber} />
                <DetailRow label="Hall Number" value={data.hallNumber} />
                <DetailRow label="Category" value={data.productCategory} />
                <DetailRow label="Contact Person" value={responses?.contactPerson || data.contactPerson} />
                <DetailRow label="Email" value={data.emailId} />
                <DetailRow label="Mobile" value={data.mobileNumber} />
                <DetailRow label="Country" value={responses?.country || data.country} />
              </div>
            </Card>
            <Card title="Declaration & Media">
              <div className="grid grid-cols-1 gap-y-2 mb-3">
                <DetailRow label="Testimonial Consent" value={responses?.testimonialConsent || responses?.testimonialPermission} />
                <DetailRow label="Document Date" value={responses?.date || data.date || dayjs(data.createdAt).format("DD MMM, YYYY")} />
              </div>

              <div className="flex flex-col gap-y-4 mt-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Authorized Signature</p>
                  {(responses?.digitalSignatureFile || data.digitalSignatureFile) ? (
                    <div className="border border-slate-200 rounded p-1.5 bg-slate-50 inline-block">
                      <img 
                        src={SERVER_URL + (responses?.digitalSignatureFile || data.digitalSignatureFile)} 
                        alt="Signature" 
                        className="max-h-16 object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>
                  ) : (
                    <div className="text-lg font-signature italic text-slate-800 border-b border-slate-300 inline-block min-w-[150px] pb-1">
                      {responses?.digitalSignature || data.digitalSignature || "_________________"}
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {responses?.testimonialFile && (
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Testimonial File</p>
                      <a 
                        href={SERVER_URL + responses.testimonialFile} 
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                      >
                        <Download size={12} /> Download Testimonial
                      </a>
                    </div>
                  )}
                  {responses?.videoFeedbackFile && (
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Video Feedback</p>
                      <a 
                        href={SERVER_URL + responses.videoFeedbackFile} 
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
                      >
                        <Download size={12} /> Download Video
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Feedback Responses */}
          <div className="lg:col-span-2 space-y-4">
            <Card title="Overall Experience">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Overall Expo Experience</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.overallRating || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Participate Next Year</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.participateAgain || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Met Expectations</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.meetExpectations || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Interest for Next Edition</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.interestNextEdition || "-"}</p>
                </div>
              </div>
            </Card>

            <Card title="Stall & Venue Experience">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-0">
                <DetailRow label="Stall Location" value={responses?.stallLocationRating || responses?.stallLocation} isRating />
                <DetailRow label="Stall Construction" value={responses?.stallConstructionRating || responses?.stallConstruction} isRating />
                <DetailRow label="Housekeeping" value={responses?.housekeepingRating || responses?.housekeeping} isRating />
                <DetailRow label="Electricity / Internet" value={responses?.electricityRating || responses?.electricitySupport} isRating />
                <DetailRow label="Venue Facilities" value={responses?.venueFacilitiesRating || responses?.venueFacilities} isRating />
                <DetailRow label="Security" value={responses?.securityRating || responses?.securityArrangements} isRating />
              </div>
            </Card>

            <Card title="Visitor Quality & ROI">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Visitor Footfall</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.visitorFootfall || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Visitor Quality</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.visitorQuality || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Buyer Meetings</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.buyerMeetings || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Serious Business Leads</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.seriousLeads || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Business Expectations</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.meetExpectations || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Estimated Business Gen.</p>
                  <p className="text-[11px] font-bold text-slate-800">{responses?.estimatedBusiness || "-"}</p>
                </div>
              </div>
            </Card>

            <Card title="Organizer Support & Branding">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-0">
                <DetailRow label="Pre-Event Comm." value={responses?.preEventCommRating || responses?.preEventComm} isRating />
                <DetailRow label="Onsite Coordination" value={responses?.onsiteCoordinationRating || responses?.onsiteCoordination} isRating />
                <DetailRow label="Registration Process" value={responses?.registrationProcessRating || responses?.registrationProcess} isRating />
                <DetailRow label="Problem Resolution" value={responses?.problemResolutionRating || responses?.problemResolution} isRating />
                <DetailRow label="Help Desk Service" value={responses?.helpDeskRating || responses?.helpDeskService} isRating />
                <DetailRow label="Payment Support" value={responses?.paymentSupportRating || responses?.paymentSupport} isRating />
                <DetailRow label="RM Support" value={responses?.rmSupport} isRating />
                <DetailRow label="Marketing Support" value={responses?.marketingSupport} isRating />
                <DetailRow label="Post-Event Comm." value={responses?.postEventComm} isRating />
                <DetailRow label="Branding Effectiveness" value={responses?.brandingEffectiveness} />
                <DetailRow label="Sponsor Next Edition?" value={responses?.interestNextEdition} />
              </div>
            </Card>

            <Card title="Suggestions & Remarks">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Improvements Needed</p>
                  <p className="text-[11px] font-bold text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-100">{responses?.improvements || "No comments provided."}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Special Suggestions</p>
                  <p className="text-[11px] font-bold text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-100">{responses?.specialSuggestions || "No comments provided."}</p>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>

      {/* PRINT VIEW (Exact match of frontend) */}
      <div className="hidden print:block w-full text-left px-0 mt-1">
        
        <div className="flex flex-row items-center justify-between gap-4 mb-4 border-b-[1pt] border-black pb-2">
            <div className="flex items-center gap-3 flex-1">
                <img src="/ihwe_logo.png" alt="IHWE" className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                <h2 className="font-medium text-slate-900 uppercase tracking-widest text-[18pt]">EXHIBITOR FEEDBACK REPORT</h2>
            </div>
        </div>
        
        <div className="flex flex-col gap-0">
            <PrintSection title="BASIC DETAILS">
                <div className="grid grid-cols-2 gap-x-12 gap-y-0.5">
                    <PrintField label="Contact Person" value={responses?.contactPerson || data.contactPerson} />
                    <PrintField label="Company Name" value={data.exhibitorName || data.companyName} />
                    <PrintField label="Stall Number" value={data.stallNumber} />
                    <PrintField label="Hall Number" value={data.hallNumber} />
                    <PrintField label="Product Category" value={data.productCategory} />
                    <PrintField label="Mobile Number" value={data.mobileNumber} />
                    <PrintField label="Email ID" value={data.emailId} />
                    <PrintField label="Country" value={responses?.country || data.country} />
                </div>
            </PrintSection>

            <PrintSection title="OVERALL EXPERIENCE" className="!mb-0">
                <div className="grid grid-cols-2 gap-x-12 gap-y-0.5">
                    <PrintField label="Overall experience at the Expo?" value={responses?.overallRating} />
                    <PrintField label="Participate again next year?" value={responses?.participateAgain} />
                </div>
            </PrintSection>

            <PrintSection title="STALL & VENUE EXPERIENCE" className="!mb-0">
                <div className="grid grid-cols-3 gap-y-0.5 gap-x-8">
                    <PrintStar label="Stall Location" value={responses?.stallLocationRating || responses?.stallLocation} />
                    <PrintStar label="Stall Construction" value={responses?.stallConstructionRating || responses?.stallConstruction} />
                    <PrintStar label="Venue Facilities" value={responses?.venueFacilitiesRating || responses?.venueFacilities} />
                    <PrintStar label="Housekeeping" value={responses?.housekeepingRating || responses?.housekeeping} />
                    <PrintStar label="Electricity/Internet" value={responses?.electricityRating || responses?.electricitySupport} />
                    <PrintStar label="Security Arrangements" value={responses?.securityRating || responses?.securityArrangements} />
                </div>
            </PrintSection>

            <PrintSection title="VISITOR QUALITY" className="!mb-0">
                <div className="grid grid-cols-1 gap-1 text-left">
                    <PrintField label="Visitor Footfall" value={responses?.visitorFootfall} />
                    <PrintField label="Visitor Quality" value={responses?.visitorQuality} />
                    <PrintField label="Buyer Meetings" value={responses?.buyerMeetings} />
                    <PrintField label="Serious Business Leads" value={responses?.seriousLeads} />
                </div>
            </PrintSection>

            <PrintSection title="ORGANIZER SUPPORT" className="!mb-0">
                <div className="grid grid-cols-3 gap-y-3 gap-x-4">
                    <PrintStar label="Pre-Event Communication" value={responses?.preEventCommRating || responses?.preEventComm} />
                    <PrintStar label="Registration Process" value={responses?.registrationProcessRating || responses?.registrationProcess} />
                    <PrintStar label="Payment Support" value={responses?.paymentSupportRating || responses?.paymentSupport} />
                    <PrintStar label="Onsite Coordination" value={responses?.onsiteCoordinationRating || responses?.onsiteCoordination} />
                    <PrintStar label="Problem Resolution Speed" value={responses?.problemResolutionRating || responses?.problemResolution} />
                    <PrintStar label="Relationship Manager Support" value={responses?.rmSupport} />
                    <PrintStar label="Help Desk Service" value={responses?.helpDeskRating || responses?.helpDeskService} />
                    <PrintStar label="Marketing Support" value={responses?.marketingSupport} />
                    <PrintStar label="Post-Event Communication" value={responses?.postEventComm} />
                </div>
            </PrintSection>

            <PrintSection title="SPONSORSHIP & BRANDING" className="!mb-0">
                <div className="grid grid-cols-1">
                    <PrintField label="Did sponsorship / branding help your business visibility?" value={responses?.brandingEffectiveness} />
                </div>
            </PrintSection>

            <PrintSection title="ROI EVALUATION" className="!mb-0">
                <div className="grid grid-cols-1 gap-1">
                    <PrintField label="Business Expectations" value={responses?.meetExpectations} />
                    <PrintField label="Estimated Business Generated" value={responses?.estimatedBusiness} />
                    <PrintField label="Interested in sponsorship for next edition?" value={responses?.interestNextEdition} />
                </div>
            </PrintSection>

            <PrintSection title="SUGGESTIONS & IMPROVEMENTS">
                <div className="grid grid-cols-2 gap-4">
                    <PrintField label="Improvements" value={responses?.improvements} />
                    <PrintField label="Suggestions" value={responses?.specialSuggestions} />
                </div>
            </PrintSection>

            <PrintSection title="TESTIMONIAL PERMISSION">
                <div className="grid grid-cols-1 gap-4 items-start">
                    <PrintField label="Testimonial Consent" value={responses?.testimonialPermission || responses?.testimonialConsent} />
                </div>
            </PrintSection>

            <div className="flex flex-col gap-3 mb-0 mt-4 break-inside-avoid">
                <div className="flex items-start gap-3">
                    <label className="text-[11pt] text-black font-bold flex-1 italic leading-relaxed">"I confirm that the feedback provided above is true and based on my business experience."</label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                    <div className="flex-1 min-w-[250px] flex items-center gap-4">
                        <div className="flex-1">
                            <p className="font-bold uppercase tracking-widest text-[9.5pt] text-slate-600 mb-1">Authorized Digital Signature</p>
                            <div className="flex flex-col gap-2">
                                {(responses?.digitalSignatureFile || data.digitalSignatureFile) ? (
                                    <div className="border-b-2 py-1 border-black inline-block max-w-xs">
                                        <img src={SERVER_URL + (responses?.digitalSignatureFile || data.digitalSignatureFile)} alt="Digital Signature" className="object-contain h-16 mb-1" crossOrigin="anonymous" />
                                    </div>
                                ) : (
                                    <div className="block text-[18pt] font-signature border-b-2 border-black min-w-[300px] max-w-xs py-1"> {responses?.digitalSignature || data.digitalSignature || '________________'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px] text-left">
                        <p className="font-bold uppercase tracking-widest text-[9.5pt] text-slate-600">Document Date</p>
                        <span className="font-bold text-[12pt] text-black">{responses?.date || data.date || dayjs(data.createdAt).format("DD MMM, YYYY")}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { size: A4; margin: 15mm; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        `
      }} />
    </div>
  );
}
