import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Award, CheckCircle, List, Download, XCircle 
} from 'lucide-react';
import api from "../lib/api";
import { showSuccess, showError } from "../utils/toastMessage";

const AwardsNominationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nomination, setNomination] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNominationDetail();
    }, [id]);

    const fetchNominationDetail = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/awards-nomination/${id}`);
            if (response.data.success) {
                setNomination(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching nomination detail:', error);
            showError('Failed to fetch nomination details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await api.patch(`/api/awards-nomination/${id}/status`, { status: newStatus });
            if (response.data.success) {
                showSuccess('Status updated successfully');
                fetchNominationDetail();
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

    if (!nomination) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">Nomination not found</h2>
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
            case 'Under Review':
                return 'bg-blue-100 text-blue-800';
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
                        AWARD NOMINATION PROFILE | Awards Management Section
                    </h1>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
                    <button 
                        onClick={() => navigate("/awards-nominations")} 
                        className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
                    >
                        <Award size={12} /> Award Nominations
                    </button>
                    <button 
                        onClick={() => navigate("/approved-awards-list")} 
                        className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
                    >
                        <CheckCircle size={12} /> Approved Awards
                    </button>
                    <button 
                        onClick={() => navigate("/award-categories-manage")} 
                        className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
                    >
                        <List size={12} /> Award Categories
                    </button>
                    <button 
                        onClick={() => navigate("/rejected-awards-list")} 
                        className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-red-500 hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
                    >
                        <CheckCircle size={12} /> Rejected Awards
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
                            {nomination.fullName} - Nomination Details
                        </h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="px-3 py-1 text-[12px] font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-600 flex items-center gap-1"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>
                            <select
                                value={nomination.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={`px-3 py-1 text-[12px] font-semibold rounded ${getStatusBadgeClass(nomination.status)} border-0 cursor-pointer`}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="grid grid-cols-12 text-[12px]">
                        {/* Row 1 - Basic Info */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50">Full Name</div>
                        <div className="col-span-4 p-3 text-slate-800 border-l border-slate-100">
                            {nomination.fullName}
                        </div>
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-l border-slate-100">Applicant Type</div>
                        <div className="col-span-4 p-3 text-slate-800 border-l border-slate-100">{nomination.applicantType}</div>

                        {/* Row 2 - Contact Info */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Contact Person</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{nomination.contactPersonName}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Designation</div>
                        <div className="col-span-5 p-3 text-slate-800 border-t border-l border-slate-100">{nomination.designation || '-'}</div>

                        {/* Row 3 - Contact Details */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Mobile</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{nomination.mobile}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Email</div>
                        <div className="col-span-5 p-3 text-slate-800 border-t border-l border-slate-100">{nomination.email}</div>

                        {/* Row 4 - Location */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">City</div>
                        <div className="col-span-2 p-3 text-slate-800 border-t border-l border-slate-100">{nomination.city}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">State</div>
                        <div className="col-span-2 p-3 text-slate-800 border-t border-l border-slate-100">{nomination.state}</div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Country</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{nomination.country}</div>

                        {/* Row 5 - Website */}
                        {nomination.website && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Website</div>
                                <div className="col-span-10 p-3 text-blue-600 border-t border-l border-slate-100">
                                    <a href={nomination.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {nomination.website}
                                    </a>
                                </div>
                            </>
                        )}

                        {/* Row 6 - Award Category Header */}
                        <div className="col-span-12 p-2 font-bold text-slate-700 bg-slate-200/50 border-t border-slate-100 uppercase tracking-tight">
                            Award Category & Details
                        </div>

                        {/* Row 7 - Award Category */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Award Category</div>
                        <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 font-semibold text-[#008d48]">
                            {nomination.awardCategory}
                        </div>

                        {/* Row 8 - Experience & Team */}
                        {(nomination.yearsOfExperience || nomination.teamSize) && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Years of Experience</div>
                                <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">{nomination.yearsOfExperience || '-'}</div>
                                <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Team Size</div>
                                <div className="col-span-5 p-3 text-slate-800 border-t border-l border-slate-100">{nomination.teamSize || '-'}</div>
                            </>
                        )}

                        {/* Row 9 - Brief Profile */}
                        {nomination.briefProfile && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Brief Profile</div>
                                <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                                    {nomination.briefProfile}
                                </div>
                            </>
                        )}

                        {/* Row 10 - Key Services */}
                        {nomination.keyServices && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Key Services</div>
                                <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                                    {nomination.keyServices}
                                </div>
                            </>
                        )}

                        {/* Row 11 - Achievements Header */}
                        {nomination.keyAchievements && (
                            <div className="col-span-12 p-2 font-bold text-slate-700 bg-slate-200/50 border-t border-slate-100 uppercase tracking-tight">
                                Achievements & Impact
                            </div>
                        )}

                        {/* Row 12 - Key Achievements */}
                        {nomination.keyAchievements && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Key Achievements</div>
                                <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                                    {nomination.keyAchievements}
                                </div>
                            </>
                        )}

                        {/* Row 13 - Unique Contribution */}
                        {nomination.uniqueContribution && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Unique Contribution</div>
                                <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                                    {nomination.uniqueContribution}
                                </div>
                            </>
                        )}

                        {/* Row 14 - Impact Created */}
                        {nomination.impactCreated && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Impact Created</div>
                                <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                                    {nomination.impactCreated}
                                </div>
                            </>
                        )}

                        {/* Row 15 - Innovation Used */}
                        {nomination.innovationUsed && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Innovation Used</div>
                                <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                                    {nomination.innovationUsed}
                                </div>
                            </>
                        )}

                        {/* Row 16 - Why Deserve */}
                        {nomination.whyDeserve && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Why Deserve Award</div>
                                <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                                    {nomination.whyDeserve}
                                </div>
                            </>
                        )}

                        {/* Row 17 - Admin Remarks */}
                        {nomination.adminRemarks && (
                            <>
                                <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Admin Remarks</div>
                                <div className="col-span-10 p-3 text-slate-800 border-t border-l border-slate-100 whitespace-pre-wrap">
                                    {nomination.adminRemarks}
                                </div>
                            </>
                        )}

                        {/* Row 18 - Submission Info */}
                        <div className="col-span-2 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-slate-100">Submitted On</div>
                        <div className="col-span-4 p-3 text-slate-800 border-t border-l border-slate-100">
                            {nomination.createdAt ? new Date(nomination.createdAt).toLocaleString('en-IN', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            }) : "-"}
                        </div>
                        <div className="col-span-1 p-3 font-bold text-slate-700 bg-slate-50/50 border-t border-l border-slate-100">Status</div>
                        <div className="col-span-5 p-3 border-t border-l border-slate-100">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(nomination.status)}`}>
                                {nomination.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── DOCUMENTS SECTION ── */}
                {(nomination.profileDeckUrl || nomination.certificationsUrl || nomination.imagesUrl) && (
                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-white">
                            <h2 className="text-[16px] font-semibold text-slate-700">Supporting Documents</h2>
                        </div>
                        <div className="p-4 grid grid-cols-3 gap-4">
                            {nomination.profileDeckUrl && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Profile Deck</p>
                                    <a 
                                        href={nomination.profileDeckUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 text-xs font-medium"
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                </div>
                            )}
                            {nomination.certificationsUrl && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Certifications</p>
                                    <a 
                                        href={nomination.certificationsUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 text-xs font-medium"
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                </div>
                            )}
                            {nomination.imagesUrl && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Images/Videos</p>
                                    <a 
                                        href={nomination.imagesUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 text-xs font-medium"
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AwardsNominationDetail;
