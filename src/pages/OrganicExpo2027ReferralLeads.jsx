import { useState, useEffect } from 'react';
import {
    Trash2, Layers, ShieldCheck, Mail, Phone, Building2, User, Tag, Search
} from 'lucide-react';
import { toast } from "react-toastify";
import PageHeader from '../components/PageHeader';
import api from "../lib/api";
import Swal from "sweetalert2";

const OrganicExpo2027ReferralLeads = () => {
    const [referrals, setReferrals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredReferrals = referrals.filter(ref => {
        const term = searchTerm.toLowerCase();
        return (
            (ref.companyName && ref.companyName.toLowerCase().includes(term)) ||
            (ref.contactPerson && ref.contactPerson.toLowerCase().includes(term)) ||
            (ref.mobileNumber && ref.mobileNumber.includes(term)) ||
            (ref.emailId && ref.emailId.toLowerCase().includes(term))
        );
    });

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/referrals');
            if (response.data.success) {
                setReferrals(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching referrals:", error);
            toast.error("Failed to load referrals");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Referral?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;

        try {
            setIsLoading(true);
            const response = await api.delete(`/api/referrals/${id}`);
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
                fetchReferrals();
            }
        } catch (error) {
            toast.error("Failed to delete referral");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md p-6 min-h-screen">
            <PageHeader
                title="ORGANIC EXPO 2027 - REFERRAL LEADS"
                description="View and manage referrals submitted by users"
            >
                <div className="relative w-72">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search by company, name, email, phone..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23471d]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </PageHeader>

            <div className="mt-6">
                <div className="bg-white border-2 border-gray-200 shadow-sm">
                    {/* Table Header */}
                    <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                        <h2 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Layers className="w-4 h-4" /> Referral Leads
                        </h2>
                        <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                            {filteredReferrals.length} REFERRALS
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase w-10">NO.</th>
                                    <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">COMPANY / CONTACT</th>
                                    <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">COMMUNICATION</th>
                                    <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">CATEGORY / REMARKS</th>
                                    <th className="text-center py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">STATUS</th>
                                    <th className="text-center py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">DATE</th>
                                    <th className="text-right py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && referrals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12">
                                            <div className="w-8 h-8 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredReferrals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400 italic font-medium">
                                            No referral leads found.
                                        </td>
                                    </tr>
                                ) : filteredReferrals.map((ref, idx) => (
                                    <tr key={ref._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-sm">
                                                <Building2 size={14} className="text-[#d26019]" />
                                                {ref.companyName}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mt-1 uppercase">
                                                <User size={12} className="text-[#23471d]" />
                                                {ref.contactPerson}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                                                <Phone size={12} className="text-green-600" />
                                                +91 {ref.mobileNumber}
                                                <ShieldCheck size={12} className="text-green-500 ml-1" title="Verified" />
                                            </div>
                                            {ref.emailId && (
                                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mt-1">
                                                    <Mail size={12} className="text-gray-400" />
                                                    {ref.emailId}
                                                    <ShieldCheck size={12} className="text-green-500 ml-1" title="Verified" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600 uppercase">
                                                <Tag size={10} className="text-[#d26019]" />
                                                {ref.category || 'N/A'}
                                            </div>
                                            {ref.remarks && (
                                                <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate" title={ref.remarks}>
                                                    "{ref.remarks}"
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${ref.status === "active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                                                {ref.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="text-[10px] font-bold text-gray-600">
                                                {new Date(ref.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleDelete(ref._id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganicExpo2027ReferralLeads;
