import React, { useState, useEffect } from 'react';
import { Search, Trash2, Mail, Phone, User, Calendar, Building2, Globe, Briefcase, Eye, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../lib/api";
import Swal from 'sweetalert2';
import Table from '../../components/table/Table';
import Pagination from "../../components/Pagination";

const BuyerList = () => {
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const itemsPerPage = 25;

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/buyer-registration');
            if (response.data.success) {
                setRegistrations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
            Swal.fire('Error', 'Failed to load registrations', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (registration) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/buyer-registration/${registration._id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Registration has been deleted.', 'success');
                    fetchRegistrations();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete registration', 'error');
            }
        }
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "60px",
            render: (_, index) => (
                <div className="font-bold text-gray-900">{startIndex + index + 1}</div>
            )
        },
        {
            key: "company",
            label: "COMPANY",
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#23471d]" />
                        <Link
                            to={`/buyer-registration/${row._id}`}
                            className="font-bold text-blue-600 hover:text-blue-800 uppercase underline decoration-blue-200 underline-offset-4 transition-colors"
                        >
                            {row.companyName}
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span className="text-gray-600 italic">{row.country}</span>
                    </div>
                </div>
            )
        },
        {
            key: "tag",
            label: "CRM TAG",
            render: (row) => {
                const tag = row.buyerTag || 'Cold';
                const colors = {
                    'Hot': 'bg-red-100 text-red-600 border-red-200',
                    'Warm': 'bg-orange-100 text-orange-600 border-orange-200',
                    'Cold': 'bg-blue-100 text-blue-600 border-blue-200'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${colors[tag] || colors.Cold}`}>
                        {tag}
                    </span>
                );
            }
        },
        {
            key: "contact",
            label: "CONTACT PERSON",
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#d26019]" />
                        <div className="text-gray-900 font-medium">{row.fullName || row.contactPerson}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium ml-6 uppercase">{row.designation}</div>
                </div>
            )
        },
        {
            key: "contactInfo",
            label: "CONTACT INFO",
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-gray-600 italic">{row.emailAddress || row.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-gray-600 italic">{row.mobileNumber || row.whatsapp}</span>
                    </div>
                </div>
            )
        },
        {
            key: "payment",
            label: "PAYMENT",
            render: (row) => (
                <div className="space-y-1">
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${row.paymentStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {row.paymentStatus || 'Pending'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">{row.registrationCategory || 'N/A'}</div>
                </div>
            )
        },
        {
            key: "date",
            label: "DATE",
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-900 text-xs text-nowrap">
                    <Calendar className="w-4 h-4 text-[#23471d]" />
                    {new Date(row.createdAt).toLocaleDateString()}
                </div>
            )
        }
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6">
            <div className="w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-[#23471d] uppercase">Buyer Registrations</h1>
                    <p className="text-gray-600 mt-2 text-lg">Manage all registrations from the Buyer Registration page</p>
                </div>

                <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b bg-[#23471d]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white uppercase">Registration List</h2>
                                <p className="text-sm text-blue-100 mt-0.5 normal-case tracking-normal">
                                    Showing {filteredRegistrations.length} of {registrations.length} registrations
                                </p>
                            </div>

                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search registrations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg bg-white normal-case font-normal"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <Table
                                columns={columns}
                                data={paginatedRegistrations}
                                onEdit={(row) => navigate(`/buyer-registration/edit/${row._id}`)}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>

                    <div className="mt-4 px-4 pb-4 bg-white">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredRegistrations.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            label="registrations"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerList;
