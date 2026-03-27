import React, { useState, useEffect } from 'react';
import {
    Search,
    Briefcase,
    LayoutGrid,
    Search as SearchIcon,
    RefreshCw
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
    const itemsPerPage = 25;
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
                text: error.response?.data?.message || 'Failed to fetch services',
                confirmButtonColor: '#134698'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (service) => {
        navigate('/create-service', { state: { serviceName: service.serviceName } });
    };

    const handleDelete = async (service) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `Do you want to delete service detail for <strong>${service.serviceName}</strong>?<br><span class="text-red-600">This will delete background image and gallery images!</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setIsLoading(true);
                const response = await api.delete(`/api/service-details/${service._id}`);
                if (response.data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Service detail successfully removed',
                        timer: 2000,
                        confirmButtonColor: '#134698'
                    });
                    fetchServices();
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to delete service',
                    confirmButtonColor: '#134698'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredServices = services.filter(service =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.bgTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

    const categorizedServices = [
        {
            category: "Interiors",
            services: ["Retail Interior", "Corporate Interior", "Restaurant Interior", "Shop In Shops", "Interior Design Company"]
        },
        {
            category: "Merchandising",
            services: ["Retail Display Merchandising", "Acrylic Displays", "Gondolas", "Window Display"]
        },
        {
            category: "Kiosk",
            services: ["Retail Kiosk", "Mobile Booth"]
        },
        {
            category: "Office Interior",
            services: ["Modular Work Station", "MD Cabin", "Chairs", "Office Interior"]
        },
        {
            category: "Exhibition & Events",
            services: ["Local Level Exhibition", "National Level Exhibition", "Exhibition & Events"]
        },
        {
            category: "Furniture",
            services: ["Modular Wardrobe", "Modular Kitchen", "Modular LCD Unit", "Dressing Table", "Sofas", "Space Saving Furniture", "Furniture"]
        },
        {
            category: "Signage",
            services: ["Signage"]
        }
    ];

    const getFullServiceName = (name) => {
        for (const cat of categorizedServices) {
            if (cat.services.includes(name)) {
                return `${cat.category} / ${name}`;
            }
        }
        return name;
    };

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
            key: "bgImage",
            label: "IMAGE",
            width: "120px",
            render: (row) => (
                <div className="h-12 w-20 rounded overflow-hidden shadow-sm border border-gray-100">
                    <img
                        src={`${SERVER_URL}${row.bgImage}`}
                        alt={row.bgAltText}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80x48?text=No+Image'; }}
                    />
                </div>
            )
        },
        {
            key: "serviceName",
            label: "SERVICE NAME",
            render: (row) => (
                <div className="font-semibold text-blue-900 uppercase tracking-tight">
                    {getFullServiceName(row.serviceName)}
                </div>
            )
        },
        {
            key: "bgTitle",
            label: "HERO TITLE (H1)",
            render: (row) => (
                <div className="text-gray-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                    {row.bgTitle}
                </div>
            )
        },
        {
            key: "createdAt",
            label: "CREATED AT",
            render: (row) => (
                <div className="text-gray-500 text-xs">
                    {new Date(row.createdAt).toLocaleDateString()}
                </div>
            )
        }
    ];

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <div className="w-full">
                <PageHeader
                    title="SERVICE LIST"
                    description="View and manage all created service detail pages"
                />

                <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg mt-6">
                    <div className="px-6 py-4 border-b bg-[#1e3a8a]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                                    <LayoutGrid className="w-5 h-5" />
                                    Active Services
                                </h2>
                                <p className="text-sm text-blue-100 mt-0.5">
                                    Total {filteredServices.length} pages configured
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchServices}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                                    title="Refresh Data"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                                <div className="relative w-64 lg:w-80">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or title..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg rounded"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white">
                        {isLoading && services.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <Table
                                columns={columns}
                                data={paginatedServices}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}

                        {!isLoading && filteredServices.length === 0 && (
                            <div className="py-20 text-center">
                                <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">No Services Found</h3>
                                <p className="text-gray-400 text-sm italic mt-1">Try creating a new service or adjusting your search.</p>
                                <button
                                    onClick={() => navigate('/create-service')}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded shadow-lg hover:bg-blue-700 transition-all uppercase text-xs"
                                >
                                    Create Service
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredServices.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            label="services"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceList;
