import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Search, Filter, Mic } from 'lucide-react';
import api from "../lib/api";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import DeleteConfirmToast from "../components/DeleteConfirmToast";
import { showSuccess, showError } from "../utils/toastMessage";

const SpeakerRegistrationList = () => {
    const navigate = useNavigate();
    const [speakers, setSpeakers] = useState([]);
    const [filteredSpeakers, setFilteredSpeakers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [deleteId, setDeleteId] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    useEffect(() => {
        fetchSpeakers();
    }, []);

    useEffect(() => {
        filterSpeakers();
    }, [searchTerm, statusFilter, speakers]);

    const fetchSpeakers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/speaker');
            if (response.data.success) {
                setSpeakers(response.data.data);
                setFilteredSpeakers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching speakers:', error);
            showError('Failed to fetch speakers');
        } finally {
            setIsLoading(false);
        }
    };

    const filterSpeakers = () => {
        let filtered = [...speakers];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(speaker =>
                speaker.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                speaker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                speaker.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                speaker.mobile?.includes(searchTerm)
            );
        }

        // Status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(speaker => speaker.status === statusFilter);
        }

        setFilteredSpeakers(filtered);
    };

    const handleDelete = async (id) => {
        try {
            const response = await api.delete(`/api/speaker/${id}`);
            if (response.data.success) {
                showSuccess('Speaker deleted successfully');
                fetchSpeakers();
            }
        } catch (error) {
            console.error('Error deleting speaker:', error);
            showError('Failed to delete speaker');
        } finally {
            setDeleteId(null);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setUpdatingStatusId(id);
            const response = await api.put(`/api/speaker/${id}/status`, { status: newStatus });
            if (response.data.success) {
                showSuccess('Status updated successfully');
                fetchSpeakers();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showError('Failed to update status');
        } finally {
            setUpdatingStatusId(null);
        }
    };

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            {/* Hero Banner */}
            <div className="relative w-full h-64 overflow-hidden rounded mt-8">
                {/* Background Image */}
                <img
                    src="/dashbordBan.png"
                    alt="Speaker Registrations Banner"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                
                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
                    <Mic className="w-16 h-16 mb-4" />
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
                        Speaker Registrations
                    </h1>
                    <p className="text-lg mt-2 text-center text-white/90">
                        Manage conference speaker applications and profiles
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 md:p-6 space-y-5">
                <PageHeader
                    subtitle={`Total ${speakers.length} speaker${speakers.length !== 1 ? 's' : ''} registered`}
                />

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl border p-3 bg-slate-50 border-slate-200 text-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total</p>
                        <p className="text-[26px] font-black leading-none mt-0.5">{speakers.length}</p>
                    </div>
                    <div className="rounded-xl border p-3 bg-yellow-50 border-yellow-200 text-yellow-700">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Pending</p>
                        <p className="text-[26px] font-black leading-none mt-0.5">
                            {speakers.filter(s => s.status === 'Pending').length}
                        </p>
                    </div>
                    <div className="rounded-xl border p-3 bg-green-50 border-green-200 text-green-700">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Approved</p>
                        <p className="text-[26px] font-black leading-none mt-0.5">
                            {speakers.filter(s => s.status === 'Approved').length}
                        </p>
                    </div>
                    <div className="rounded-xl border p-3 bg-red-50 border-red-200 text-red-700">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Rejected</p>
                        <p className="text-[26px] font-black leading-none mt-0.5">
                            {speakers.filter(s => s.status === 'Rejected').length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, organization, or mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                {filteredSpeakers.length === 0 ? (
                    <EmptyState message="No speaker registrations found" />
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Speaker Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Organization
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Topic
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSpeakers.map((speaker) => (
                                        <tr key={speaker._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {speaker.speakerPhotoUrl && (
                                                        <img
                                                            src={speaker.speakerPhotoUrl}
                                                            alt={speaker.fullName}
                                                            className="w-10 h-10 rounded-full object-cover mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {speaker.fullName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {speaker.designation}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{speaker.organization}</div>
                                                <div className="text-sm text-gray-500">{speaker.industryCategory}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{speaker.mobile}</div>
                                                <div className="text-sm text-gray-500">{speaker.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {speaker.preferredTopic}
                                                </div>
                                                <div className="text-sm text-gray-500">{speaker.sessionType}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={speaker.status}
                                                        onChange={(e) => handleStatusChange(speaker._id, e.target.value)}
                                                        disabled={updatingStatusId === speaker._id}
                                                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(speaker.status)} border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-8`}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                    {updatingStatusId === speaker._id && (
                                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                            <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/speaker-registration/${speaker._id}`)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(speaker._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteId && (
                    <DeleteConfirmToast
                        message="Are you sure you want to delete this speaker registration?"
                        onConfirm={() => handleDelete(deleteId)}
                        onCancel={() => setDeleteId(null)}
                    />
                )}
            </div>
        </>
    );
};

export default SpeakerRegistrationList;
