import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, 
  FileText, Award, Users, Globe, Mic, CheckCircle, 
  UserCheck, Upload, LayoutGrid, Download 
} from 'lucide-react';
import api from "../lib/api";
import { showSuccess, showError } from "../utils/toastMessage";

const SpeakerRegistrationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [speaker, setSpeaker] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSpeakerDetail();
    }, [id]);

    const fetchSpeakerDetail = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/speaker/${id}`);
            if (response.data.success) {
                setSpeaker(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching speaker detail:', error);
            showError('Failed to fetch speaker details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await api.put(`/api/speaker/${id}/status`, { status: newStatus });
            if (response.data.success) {
                showSuccess('Status updated successfully');
                fetchSpeakerDetail();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showError('Failed to update status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!speaker) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">Speaker not found</h2>
                <button 
                    onClick={() => navigate(-1)} 
                    className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
                >
                    Back to List
                </button>
            </div>
        );
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="w-full h-auto bg-[#eef1f5] mt-8">
            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row justify-between items-center py-3 px-6 border-b border-gray-300 bg-white gap-4">
                <div className="flex flex-col items-center lg:items-start gap-1">
                    <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
                        SPEAKER PROFILE | Conference Management Section
                    </h1>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
                    <button 
                        onClick={() => navigate("/speaker-registration-list")} 
                        className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
                    >
                        <Mic size={12} /> Speaker Nominations
                    </button>
                    <button 
                        onClick={() => navigate("/approved-speakers-list")} 
                        className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
                    >
                        <CheckCircle size={12} /> Approved Speakers
                    </button>
                    <button 
                        onClick={() => navigate("/agenda-management")} 
                        className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
                    >
                        <UserCheck size={12} /> Conference Agenda
                    </button>
                </div>
            </div>

            {/* ── PAGE CONTENT ── */}
            <div className="p-4 space-y-6">

                {/* ── DETAILS CARD ── */}
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    {/* Sub-header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-[16px] font-semibold text-slate-700">
                            {speaker.fullName} - Speaker Details
                        </h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="px-3 py-1 text-[12px] font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-600 flex items-center gap-1"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>
                            {speaker.presentationUrl && (
                                <a
                                    href={speaker.presentationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 text-[12px] font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-600 flex items-center gap-1"
                                >
                                    <Download size={14} /> Presentation
                                </a>
                            )}
                            <select
                                value={speaker.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={`px-3 py-1 text-[12px] font-semibold rounded ${getStatusBadgeClass(speaker.status)} border-0 cursor-pointer`}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="grid grid-cols-12 text-[12px]">
                        {/* Row 1 - Speaker Basic Info */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50">Speaker Name</div>
                        <div className="col-span-4 p-3 text-slate-800 border-l border-slate-100">
                            {speaker.fullName}
                        </div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-l border-slate-100">Designation</div>
                        <div className="col-span-2 p-3 text-slate-800 border-l border-slate-100">{speaker.designation}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-l border-slate-100">Organization</div>
                        <div className="col-span-2 p-3 text-slate-800 border-l border-slate-100">{speaker.organization}</div>

                        {/* Row 2 - Contact Info */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Mobile</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{speaker.mobile}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Email</div>
                        <div className="col-span-2 p-3 text-slate-800 border-t border-l border-slate-100">{speaker.email}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">City</div>
                        <div className="col-span-2 p-3 text-slate-800 border-t border-l border-slate-100">{speaker.city}</div>

                        {/* Row 3 - Professional Details Header */}
                        <div className="col-span-6 p-2 font-bold text-slate-700 bg-slate-200/50 border-t border-slate-100 uppercase tracking-tight">
                            Professional Background
                        </div>
                        <div className="col-span-6 p-2 font-bold text-slate-700 bg-slate-200/50 border-t border-l border-slate-100 uppercase tracking-tight">
                            Session Details
                        </div>

                        {/* Row 4 - Professional Details */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Industry</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{speaker.industryCategory}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Topic</div>
                        <div className="col-span-5 p-3 text-slate-800 border-t border-l border-slate-100">{speaker.preferredTopic}</div>

                        {/* Row 5 */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Experience</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{speaker.totalExperience}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Session Type</div>
                        <div className="col-span-2 p-3 text-slate-800 border-t border-l border-slate-100">{speaker.sessionType}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Track</div>
                        <div className="col-span-2 p-3 text-slate-800 border-t border-l border-slate-100">{speaker.preferredTrack}</div>

                        {/* Row 6 - Expertise */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Expertise</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">
                            {Array.isArray(speaker.expertise) ? speaker.expertise.join(', ') : speaker.expertise}
                        </div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Spoken Before</div>
                        <div className="col-span-5 p-3 text-slate-800 border-t border-l border-slate-100">{speaker.spokenBefore}</div>

                        {/* Row 7 - LinkedIn */}
                        {speaker.linkedin && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">LinkedIn</div>
                                <div className="col-span-10 p-3 text-blue-600 border-t border-l border-slate-100">
                                    <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {speaker.linkedin}
                                    </a>
                                </div>
                            </>
                        )}

                        {/* Row 8 - Profile */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Brief Profile</div>
                        <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                            {speaker.briefProfile}
                        </div>

                        {/* Row 9 - Topic Description */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Topic Description</div>
                        <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                            {speaker.topicDescription}
                        </div>

                        {/* Row 10 - Event Details (if applicable) */}
                        {speaker.eventDetails && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Previous Events</div>
                                <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                                    {speaker.eventDetails}
                                </div>
                            </>
                        )}

                        {/* Row 11 - Expectations */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Expectations</div>
                        <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100">
                            {Array.isArray(speaker.expectations) ? speaker.expectations.join(', ') : speaker.expectations}
                        </div>

                        {/* Row 12 - Registration Info */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Registration Date</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">
                            {speaker.createdAt ? new Date(speaker.createdAt).toLocaleString('en-IN', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            }) : "-"}
                        </div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Status</div>
                        <div className="col-span-5 p-3 border-t border-l border-slate-100">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(speaker.status)}`}>
                                {speaker.status}
                            </span>
                        </div>

                        {/* Row 13 - Consent */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Consents</div>
                        <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100">
                            Data Usage: {speaker.consent1 ? '✓ Yes' : '✗ No'} | 
                            Terms & Conditions: {speaker.consent2 ? '✓ Yes' : '✗ No'}
                        </div>
                    </div>
                </div>

                {/* ── IMAGES SECTION ── */}
                {(speaker.speakerPhotoUrl || speaker.companyLogoUrl) && (
                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-white">
                            <h2 className="text-[16px] font-semibold text-slate-700">Attachments</h2>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            {speaker.speakerPhotoUrl && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Speaker Photo</p>
                                    <img 
                                        src={speaker.speakerPhotoUrl} 
                                        alt="Speaker" 
                                        className="w-full h-48 object-cover rounded border border-slate-200"
                                    />
                                </div>
                            )}
                            {speaker.companyLogoUrl && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Company Logo</p>
                                    <img 
                                        src={speaker.companyLogoUrl} 
                                        alt="Company Logo" 
                                        className="w-full h-48 object-contain rounded border border-slate-200 bg-white p-4"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeakerRegistrationDetail;
