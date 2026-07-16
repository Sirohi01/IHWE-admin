import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, CheckCircle, Printer, Download, Star, Calendar,
    Building, User, Tag, Mail, MapPin, Phone, Globe,
    Smile, ThumbsUp, Heart, Users, Target, TrendingUp,
    IndianRupee, Shield, MessageSquare, Quote, FileText, Video,
    FileBadge, Clock, LucideIcon
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import dayjs from "dayjs";

interface FeedbackData {
    status?: string;
    createdAt?: string;
    reviewedAt?: string;
    date?: string;
    companyName?: string;
    exhibitorName?: string;
    registrationId?: string;
    stallNumber?: string;
    hallNumber?: string;
    productCategory?: string;
    contactPerson?: string;
    emailId?: string;
    mobileNumber?: string;
    country?: string;
    digitalSignatureFile?: string;
    digitalSignature?: string;
    likedMost?: string;
    writtenReview?: string;
    businessLeads?: string;
    businessGenerated?: string;
    recommendOthers?: number;
    mostValuablePart?: string[];
    mostValuablePartOther?: string;
    responses?: Record<string, any>;
    testimonialFile: string;
    videoFeedbackFile: string;
    audioFeedbackFile: string;
    participateAgain: string;
    overallRating: any;
}

interface SectionCardProps {
    title: string;
    icon?: LucideIcon;
    headerBg: string;
    headerText: string;
    bodyBg?: string;
    children: React.ReactNode;
}

const SectionCard = ({ title, icon: Icon, headerBg, headerText, bodyBg = "bg-white", children }: SectionCardProps) => (
    <div className={`rounded-lg overflow-hidden shadow-sm border border-slate-200 ${bodyBg} mb-2`}>
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 ${headerBg} ${headerText}`}>
            {Icon && <Icon size={14} />}
            <h2 className="text-[11px] font-bold uppercase tracking-wider m-0">{title}</h2>
        </div>
        <div className="p-2.5">
            {children}
        </div>
    </div>
);

interface BasicDetailRowProps {
    icon: LucideIcon;
    label: string;
    value?: string | null;
}

const BasicDetailRow = ({ icon: Icon, label, value }: BasicDetailRowProps) => (
    <div className="flex items-center gap-2 py-1 border-b border-slate-100 border-dashed last:border-0">
        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Icon size={10} className="text-blue-500" />
        </div>
        <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold text-slate-500">{label}</span>
            <span className="text-[11px] font-bold text-slate-800 text-right">{value || "-"}</span>
        </div>
    </div>
);

interface RatingRowProps {
    label: string;
    value?: number | string;
}

const RatingRow = ({ label, value }: RatingRowProps) => {
    const rating = typeof value === 'number' ? value : 0;
    return (
        <div className="flex items-center justify-between py-0.5">
            <span className="text-[10px] font-bold text-slate-500">{label}</span>
            <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"} />
                    ))}
                </div>
                <span className="text-[9px] font-bold text-slate-400 ml-1">({rating}/5)</span>
            </div>
        </div>
    );
};

export default function MobileFeedbackDetailsNew() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<FeedbackData | null>(null);
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
        return <div className="p-8 text-center text-slate-500 text-sm font-bold">Loading details...</div>;
    }

    if (!data) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-lg font-bold text-slate-800 mb-2">Feedback not found</h2>
                <button onClick={() => navigate(-1)} className="text-blue-600 text-sm font-bold hover:underline">Go Back</button>
            </div>
        );
    }

    const { responses } = data;

    return (
        <div className="p-2 bg-[#F8FAFC] min-h-screen font-inter print:bg-white print:p-0 print:min-h-0">

            {/* SCREEN VIEW */}
            <div className="print:hidden w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate("/mobile-feedback")}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft size={14} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-[15px] font-normal text-slate-900 m-0 leading-tight">Exhibitor Feedback Details</h1>
                            <p className="text-[10px] font-normal text-slate-500 m-0">Review full feedback submission</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* Left Column */}
                    <div className="space-y-2">

                        {/* STATUS & TIMELINE */}
                        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200 mb-2">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider m-0">STATUS & TIMELINE</h2>
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                                    {data.status || 'Reviewed'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center text-purple-500 shrink-0"><Calendar size={12} /></div>
                                        <div className="flex items-center gap-1.5 flex-1">
                                            <p className="text-[10px] font-bold text-slate-500 mb-0 whitespace-nowrap">Submitted On:</p>
                                            <p className="text-[11px] font-bold text-slate-800 m-0 truncate">{dayjs(data.createdAt).format("DD MMM YY, hh:mm A")}</p>
                                        </div>
                                    </div>
                                    {data.reviewedAt && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><Calendar size={12} /></div>
                                            <div className="flex items-center gap-1.5 flex-1">
                                                <p className="text-[10px] font-bold text-slate-500 mb-0 whitespace-nowrap">Reviewed On:</p>
                                                <p className="text-[11px] font-bold text-slate-800 m-0 truncate">{dayjs(data.reviewedAt).format("DD MMM YY, hh:mm A")}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center text-orange-500 shrink-0"><Calendar size={12} /></div>
                                        <div className="flex items-center gap-1.5 flex-1">
                                            <p className="text-[10px] font-bold text-slate-500 mb-0 whitespace-nowrap">Document Date:</p>
                                            <p className="text-[11px] font-bold text-slate-800 m-0 truncate">{dayjs(responses?.date || data.date || data.createdAt).format("DD MMM YY")}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pr-4 opacity-[0.03] text-slate-900 hidden sm:block">
                                    <Clock size={72} strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>

                        {/* BASIC DETAILS */}
                        <SectionCard title="BASIC DETAILS" icon={User} headerBg="bg-[#1E293B]" headerText="text-white">
                            <div className="space-y-0">
                                <BasicDetailRow icon={Building} label="Company Name" value={data.companyName} />
                                <BasicDetailRow icon={User} label="Exhibitor Name" value={data.exhibitorName} />
                                <BasicDetailRow icon={FileBadge} label="Reg ID" value={data.registrationId} />
                                <BasicDetailRow icon={Building} label="Stall Number" value={data.stallNumber} />
                                <BasicDetailRow icon={Building} label="Hall Number" value={data.hallNumber} />
                                <BasicDetailRow icon={Tag} label="Category" value={data.productCategory} />
                                <BasicDetailRow icon={User} label="Contact Person" value={responses?.contactPerson || data.contactPerson} />
                                <BasicDetailRow icon={Mail} label="Email" value={data.emailId} />
                                <BasicDetailRow icon={Phone} label="Mobile" value={data.mobileNumber} />
                                <BasicDetailRow icon={Globe} label="Country" value={responses?.country || data.country} />
                            </div>
                        </SectionCard>

                        {/* DECLARATION & MEDIA */}
                        <SectionCard title="DECLARATION & MEDIA" icon={Shield} headerBg="bg-[#FEF2F2]" headerText="text-rose-600">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">Testimonial Consent</span>
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-bold">
                                        {responses?.testimonialPermission || responses?.testimonialConsent || "No"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">Document Date</span>
                                    <span className="text-[10px] font-bold text-slate-800">{dayjs(responses?.date || data.date || data.createdAt).format("DD MMM YY")}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-500 block mb-1">Authorized Signature</span>
                                    {(responses?.digitalSignatureFile || data.digitalSignatureFile) ? (
                                        <img src={SERVER_URL + (responses?.digitalSignatureFile || data.digitalSignatureFile)} alt="Signature" className="h-8 object-contain" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="text-base font-signature italic text-slate-800 pb-0">
                                            {responses?.digitalSignature || data.digitalSignature || "_________________"}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                    <a href={(responses?.testimonialFile || data.testimonialFile) ? (SERVER_URL + (responses?.testimonialFile || data.testimonialFile)) : "#"} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1 py-1.5 text-purple-600 bg-white border border-purple-200 hover:bg-purple-50 rounded-md text-[9px] font-bold transition-colors">
                                        <Download size={10} /> Download Photo Testimonial
                                    </a>
                                    <a href={(responses?.videoFeedbackFile || data.videoFeedbackFile) ? (SERVER_URL + (responses?.videoFeedbackFile || data.videoFeedbackFile)) : "#"} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1 py-1.5 text-pink-600 bg-white border border-pink-200 hover:bg-pink-50 rounded-md text-[9px] font-bold transition-colors">
                                        <Download size={10} /> Download Video
                                    </a>
                                    <a href={(responses?.audioFeedbackFile || data.audioFeedbackFile) ? (SERVER_URL + (responses?.audioFeedbackFile || data.audioFeedbackFile)) : "#"} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1 py-1.5 text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-md text-[9px] font-bold transition-colors">
                                        <Download size={10} /> Download Audio
                                    </a>
                                </div>
                            </div>
                        </SectionCard>

                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-2">

                        {/* OVERALL EXPERIENCE SUMMARY */}
                        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Star size={12} /></div>
                                <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider m-0">OVERALL EXPERIENCE SUMMARY</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-center">
                                <div className="flex flex-col items-center border-r border-slate-100 last:border-0 pr-1">
                                    <p className="text-[8px] font-bold text-slate-500 mb-1.5 h-5 flex items-center justify-center leading-tight">Overall Expo<br />Experience</p>
                                    <Smile size={20} className="text-emerald-500 mb-1.5" />
                                    <p className="text-[11px] font-bold text-slate-800 m-0">{responses?.overallRating || data.overallRating || "-"}</p>
                                </div>
                                <div className="flex flex-col items-center border-r border-slate-100 last:border-0 pr-1">
                                    <p className="text-[8px] font-bold text-slate-500 mb-1.5 h-5 flex items-center justify-center leading-tight">Participate Next<br />Year</p>
                                    <ThumbsUp size={20} className="text-blue-500 mb-1.5" />
                                    <p className="text-[11px] font-bold text-slate-800 m-0">{responses?.participateAgain || data.participateAgain || "-"}</p>
                                </div>
                                <div className="flex flex-col items-center pr-1">
                                    <p className="text-[8px] font-bold text-slate-500 mb-1.5 h-5 flex items-center justify-center leading-tight">Would Recommend<br />IHWE</p>
                                    <div className="flex gap-0.5 mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={13}
                                                className={i < (responses?.recommendOthers || data.recommendOthers || 0) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* FEEDBACK & TESTIMONIAL (Full Width) */}

                        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
                            {/* <SectionCard title="FEEDBACK & TESTIMONIAL" icon={MessageSquare} headerBg="bg-[#334155]" headerText="text-white"> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* What did you like most */}
                                <div className="relative">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-100 border-2 border-emerald-500 shrink-0"></div>
                                        <h3 className="text-[9px] font-bold text-slate-800 m-0 tracking-wider uppercase">What They Liked Most</h3>
                                    </div>
                                    <p className="text-[10px] text-slate-600 pl-4 leading-relaxed m-0 pr-6">
                                        {responses?.likedMost || data.likedMost || "No comments provided."}
                                    </p>
                                    <Quote size={24} className="absolute right-0 top-0 text-slate-100 fill-slate-100" />
                                </div>

                                {/* Written Review */}
                                <div className="relative">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-100 border-2 border-blue-500 shrink-0"></div>
                                        <h3 className="text-[9px] font-bold text-slate-800 m-0 tracking-wider uppercase">Written Review</h3>
                                    </div>
                                    <p className="text-[10px] text-slate-600 pl-4 leading-relaxed m-0 pr-6">
                                        {responses?.writtenReview || data.writtenReview || "No comments provided."}
                                    </p>
                                    <Quote size={24} className="absolute right-0 top-0 text-slate-100 fill-slate-100" />
                                </div>
                            </div>

                            {/* Business Outcome */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100">
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-slate-500 mb-1">Business Leads</p>
                                    <p className="text-[10px] font-bold text-slate-800 m-0">{responses?.businessLeads || data.businessLeads || "-"}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-slate-500 mb-1">Business Generated</p>
                                    <p className="text-[10px] font-bold text-slate-800 m-0">{responses?.businessGenerated || data.businessGenerated || "-"}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-slate-500 mb-1.5 tracking-wider uppercase">Most Valuable Part</p>
                                    {((responses?.mostValuablePart?.length ?? 0) > 0 || (data.mostValuablePart?.length ?? 0) > 0 || responses?.mostValuablePartOther || data.mostValuablePartOther) ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {(responses?.mostValuablePart || data.mostValuablePart)?.map((item: string) => (
                                                <span key={item} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-bold">
                                                    {item}
                                                </span>
                                            ))}
                                            {(responses?.mostValuablePartOther || data.mostValuablePartOther) && (
                                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-bold">
                                                    {responses?.mostValuablePartOther || data.mostValuablePartOther}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] font-bold text-slate-800 m-0">-</p>
                                    )}
                                </div>
                            </div>

                            {/* Most Valuable Part */}
                            {/* </SectionCard> */}
                        </div>

                    </div>



                    {/* Bottom Bar */}
                    <div className="lg:col-span-3">
                        <div className="bg-gradient-to-r from-[#F0F5FF] to-[#FAF5FF] rounded-lg p-2 flex flex-col md:flex-row items-center justify-between border border-purple-100 mt-0">
                            <div className="flex items-center gap-2 mb-2 md:mb-0">
                                <div className="text-3xl leading-none">📝</div>
                                <div>
                                    <h3 className="text-[11px] font-bold text-[#1E1B4B] mb-0 flex items-center gap-1 m-0">
                                        Thank you for your valuable feedback! <Heart size={10} className="fill-purple-500 text-purple-500" />
                                    </h3>
                                    <p className="text-[9px] text-slate-500 m-0 font-medium">Your feedback helps us improve and deliver better experiences at future editions.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* PRINT VIEW (Exact match of frontend) */}
            <div className="hidden print:block w-full text-left px-0 mt-1">

                <div className="flex flex-row items-center justify-between gap-4 mb-4 border-b-[1pt] border-black pb-2">
                    <div className="flex items-center gap-3 flex-1">
                        <img src="/ihwe_logo.png" alt="IHWE" className="w-8 h-8 object-contain" onError={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'} />
                        <h2 className="font-medium text-slate-900 uppercase tracking-widest text-[18pt]">EXHIBITOR FEEDBACK REPORT</h2>
                    </div>
                </div>

                <div className="flex flex-col gap-0">
                    <div className={`mb-2 bg-transparent flex flex-col break-inside-avoid p-0`}>
                        <div className="flex items-center gap-3 border-b-[1pt] border-black pb-1 mb-1.5">
                            <h3 className="font-black uppercase tracking-wide text-[11pt] text-black">BASIC DETAILS</h3>
                        </div>
                        <div className="p-0 flex-1 grid grid-cols-2 gap-x-12 gap-y-0.5">
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Contact Person:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{responses?.contactPerson || data.contactPerson || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Company Name:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{data.exhibitorName || data.companyName || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Stall Number:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{data.stallNumber || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Hall Number:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{data.hallNumber || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Product Category:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{data.productCategory || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Mobile Number:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{data.mobileNumber || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Email ID:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{data.emailId || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Country:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{responses?.country || data.country || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`mb-0 bg-transparent flex flex-col break-inside-avoid p-0 mt-2`}>
                        <div className="flex items-center gap-3 border-b-[1pt] border-black pb-1 mb-1.5">
                            <h3 className="font-black uppercase tracking-wide text-[11pt] text-black">OVERALL EXPERIENCE</h3>
                        </div>
                        <div className="p-0 flex-1 grid grid-cols-2 gap-x-12 gap-y-0.5">
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Overall experience at the Expo?:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{responses?.overallRating || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Participate again next year?:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{responses?.participateAgain || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`mb-0 bg-transparent flex flex-col break-inside-avoid p-0 mt-2`}>
                        <div className="flex items-center gap-3 border-b-[1pt] border-black pb-1 mb-1.5">
                            <h3 className="font-black uppercase tracking-wide text-[11pt] text-black">STALL & VENUE EXPERIENCE</h3>
                        </div>
                        <div className="p-0 flex-1 grid grid-cols-3 gap-x-8 gap-y-0.5">
                            {['Stall Location', 'Stall Construction', 'Venue Facilities', 'Housekeeping', 'Electricity/Internet', 'Security Arrangements'].map((label, idx) => {
                                const vals = [responses?.stallLocationRating || responses?.stallLocation, responses?.stallConstructionRating || responses?.stallConstruction, responses?.venueFacilitiesRating || responses?.venueFacilities, responses?.housekeepingRating || responses?.housekeeping, responses?.electricityRating || responses?.electricitySupport, responses?.securityRating || responses?.securityArrangements];
                                const value = vals[idx];
                                const rating = typeof value === 'number' ? value : 0;
                                return (
                                    <div key={label} className="flex flex-row items-start gap-2 py-0.5 min-w-0 text-left">
                                        <span className="text-[8.5pt] text-slate-500 font-bold normal-case leading-tight mb-0 w-36 shrink-0">{label}:</span>
                                        <div className="flex gap-0.5 items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} className="inline text-[13pt] leading-none" style={{ color: star <= rating ? "#000" : "#ddd" }}>
                                                    {star <= rating ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className={`mb-0 bg-transparent flex flex-col break-inside-avoid p-0 mt-2`}>
                        <div className="flex items-center gap-3 border-b-[1pt] border-black pb-1 mb-1.5">
                            <h3 className="font-black uppercase tracking-wide text-[11pt] text-black">VISITOR QUALITY</h3>
                        </div>
                        <div className="p-0 flex-1 grid grid-cols-1 gap-1 text-left">
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Visitor Footfall:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{responses?.visitorFootfall || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Visitor Quality:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{responses?.visitorQuality || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Buyer Meetings:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{responses?.buyerMeetings || '-'}</span>
                            </div>
                            <div className="flex items-end gap-2 py-0.5 border-b-[0.5pt] border-slate-300">
                                <span className="text-[8pt] text-slate-500 min-w-[140px] shrink-0 font-bold uppercase leading-tight">Serious Business Leads:</span>
                                <span className="text-[9pt] text-black font-semibold flex-1 pb-0.5 leading-tight">{responses?.seriousLeads || '-'}</span>
                            </div>
                        </div>
                    </div>

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
                                <span className="font-bold text-[12pt] text-black">{dayjs(responses?.date || data.date || data.createdAt).format("DD MMM YY")}</span>
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