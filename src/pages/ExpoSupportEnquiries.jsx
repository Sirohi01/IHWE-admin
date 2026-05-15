import React, { useState, useEffect } from 'react';
import { Search, Trash2, Mail, Phone, User, Calendar, Tag, Building2, LayoutPanelLeft, ChevronDown } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';
import Table from '../components/table/Table';
import Pagination from "../components/Pagination";

const ExpoSupportEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const [selectedService, setSelectedService] = useState("");

    const services = [
        "Hotel Booking",
        "Travel Assistance",
        "Stall Design & Fabrication",
        "Logistics Support",
        "Printing & Branding",
        "Hospitality Services"
    ];

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/expo-support-enquiry');
            if (response.data.success) {
                setEnquiries(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching enquiries:', error);
            Swal.fire('Error', 'Failed to load enquiries', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (enquiry) => {
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
                const response = await api.delete(`/api/expo-support-enquiry/${enquiry._id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Enquiry has been deleted.', 'success');
                    fetchEnquiries();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete enquiry', 'error');
            }
        }
    };

    const filteredEnquiries = enquiries.filter(enq => {
        const matchesSearch = 
            enq.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.selectedServices?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesService = selectedService === "" || 
            enq.selectedServices?.some(s => s.toLowerCase() === selectedService.toLowerCase());
            
        return matchesSearch && matchesService;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEnquiries = filteredEnquiries.slice(startIndex, startIndex + itemsPerPage);

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (_, index) => (
                <div className="font-bold text-gray-900">{startIndex + index + 1}</div>
            )
        },
        {
            key: "fullName",
            label: "NAME & COMPANY",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#23471d]" />
                        <div className="font-medium text-red-600 uppercase text-xs">{row.fullName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <div className="text-xs text-gray-500 italic">{row.companyName}</div>
                    </div>
                </div>
            )
        },
        {
            key: "services",
            label: "REQUIRED SERVICES",
            render: (row) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {row.selectedServices?.map((service, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-[#e8f5e9] px-2 py-0.5 rounded-full border border-[#2d6a2d]/20">
                            <Tag className="w-3 h-3 text-[#2d6a2d]" />
                            <span className="text-[9px] font-bold text-[#2d6a2d] uppercase whitespace-nowrap">
                                {service.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </div>
                    ))}
                </div>
            )
        },
        {
            key: "contact",
            label: "CONTACT INFO",
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-blue-600 font-semibold italic">{row.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-red-600 font-semibold italic">{row.mobile}</span>
                    </div>
                </div>
            )
        },
        {
            key: "message",
            label: "MESSAGE",
            render: (row) => (
                <div className="max-w-[250px] text-xs font-bold line-clamp-2 italic text-black">
                    {row.message || 'No message'}
                </div>
            )
        },
        {
            key: "date",
            label: "DATE & TIME",
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-900 text-[10px] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#23471d]" />
                    <div className="flex flex-col leading-tight">
                        <span className="text-slate-700">{new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-blue-600 text-[9px] font-bold">{new Date(row.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6">
            <div className="w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-[#23471d]">EXPO SUPPORT ENQUIRIES</h1>
                    <p className="text-gray-600 mt-2 text-lg">List of all inquiries submitted from the Partners & Expo Support section</p>
                </div>

                <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b bg-[#23471d]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white uppercase tracking-wider">Enquiry List</h2>
                                <p className="text-sm text-blue-100 mt-0.5 normal-case tracking-normal">
                                    Showing {filteredEnquiries.length} of {enquiries.length} enquiries
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={selectedService}
                                        onChange={(e) => {
                                            setSelectedService(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="h-10 pl-3 pr-8 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg bg-white normal-case font-bold text-[#23471d] rounded-none appearance-none cursor-pointer"
                                    >
                                        <option value="">All Services</option>
                                        {services.map((service, idx) => (
                                            <option key={idx} value={service}>{service}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown size={14} className="text-gray-400" />
                                    </div>
                                </div>

                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search expo enquiries..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg bg-white normal-case font-normal"
                                    />
                                </div>
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
                                data={paginatedEnquiries}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>

                    <div className="mt-4 px-4 pb-4 bg-white">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredEnquiries.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            label="enquiries"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpoSupportEnquiries;
