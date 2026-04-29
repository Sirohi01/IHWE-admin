import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    LayoutGrid,
    Search as SearchIcon,
    RefreshCw,
    Pencil,
    Trash2,
    Eye,
    ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../../lib/api";
import { useNavigate } from 'react-router-dom';
import Pagination from "../../components/Pagination";
import Table from '../../components/table/Table';
import PageHeader from '../../components/PageHeader';

const ServiceList = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25; // Increased to match SEO list
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/service-details');
            if (response.data.success) {
                setServices(response.data.data);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch service detail list',
                confirmButtonColor: '#1e3a8a'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (service) => {
        navigate('/create-service', { state: { serviceDetail: service } });
    };

    const handleDelete = async (service) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `Do you want to delete the detail page for: <strong>${service.serviceTitle}</strong>?<br><span class="text-red-600 font-bold">This cannot be undone!</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setIsLoading(true);
                const response = await api.delete(`/api/service-details/${service._id}`);
                if (response.data.success) {
                    Swal.fire({ 
                        icon: 'success', 
                        title: 'Deleted!', 
                        text: 'Service detail deleted successfully',
                        timer: 1500, 
                        showConfirmButton: false 
                    });
                    fetchServices();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete service detail', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredServices = services.filter(service =>
        service.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.h1Heading.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (row, index) => (
                <div className="font-bold text-gray-900">
                    {startIndex + index + 1}
                </div>
            )
        },
        {
            key: "heroImage",
            label: "HERO IMAGE",
            width: "120px",
            render: (row) => (
                <div className="h-14 w-24 rounded border border-gray-200 overflow-hidden bg-gray-50">
                    {row.heroImage ? (
                        <img
                            src={`${SERVER_URL}${row.heroImage}`}
                            alt={row.heroImageAlt}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                            <Briefcase size={16} />
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "serviceTitle",
            label: "SERVICE DETAILS",
            width: "300px",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1e3a8a] text-sm uppercase">{row.serviceTitle}</span>
                    <span className="text-[10px] text-gray-400 font-medium line-clamp-1 italic">
                        {row.h1Heading?.replace(/<[^>]*>/g, '')}
                    </span>
                </div>
            )
        },
        {
            key: "updatedAt",
            label: "LAST UPDATED",
            className: "text-center",
            headerClassName: "text-center",
            width: "200px",
            render: (row) => (
                <div className="flex flex-col gap-1 items-center">
                    <span className="font-bold text-red-600 underline underline-offset-2 uppercase text-[10px]">
                        {row.updatedBy || 'System'}
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap text-center">
                        {row.updatedAt ? new Date(row.updatedAt).toLocaleString('en-GB', { 
                            day: '2-digit', month: 'short', year: 'numeric', 
                            hour: '2-digit', minute: '2-digit', hour12: true 
                        }) : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            key: "actions",
            label: "ACTIONS",
            width: "150px",
            headerClassName: "text-center",
            className: "text-center",
            render: (row) => (
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit Page"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Page"
                    >
                        <Trash2 size={18} />
                    </button>
                    <a
                        href={`/industry-zone/${row.serviceCardId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#23471d] transition-colors"
                        title="View on Website"
                    >
                        <ExternalLink size={18} />
                    </a>
                </div>
            )
        }
    ];

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <PageHeader
                title="SERVICE PAGES LIST"
                description="Manage configured detail pages for Industry Zones"
            />

            <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg mt-8">
                {/* Header matching SEO List */}
                <div className="px-6 py-4 border-b bg-[#1e3a8a]">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white uppercase tracking-tight">Active Pages List</h2>
                            <p className="text-sm text-blue-100 mt-0.5 font-medium">
                                Showing {filteredServices.length} of {services.length} entries
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative w-72">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search page..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg"
                                />
                            </div>
                            <button
                                onClick={() => navigate('/create-service')}
                                className="px-6 py-2 bg-white text-[#1e3a8a] font-black uppercase text-xs tracking-widest shadow-lg hover:bg-gray-100 transition-all border-2 border-white"
                            >
                                + Add New
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white">
                    {isLoading && services.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredServices.length > 0 ? (
                        <Table
                            columns={columns}
                            data={paginatedServices}
                            hideActions={true}
                        />
                    ) : (
                        <div className="py-20 text-center bg-gray-50/50">
                            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-300 uppercase tracking-[0.2em]">No Pages Found</h3>
                        </div>
                    )}
                </div>

                {filteredServices.length > 0 && (
                    <div className="mt-4 px-4 pb-4 bg-white">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredServices.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            label="pages"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceList;
