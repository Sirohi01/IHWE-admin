import React, { useState, useEffect } from 'react';
import { Search, Trash2, Mail, Phone, User, Calendar, Tag } from 'lucide-react';
import api from "../lib/api";
import Swal from 'sweetalert2';
import Table from '../components/table/Table';
import Pagination from "../components/Pagination";

const ContactEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/contact-enquiry');
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
                const response = await api.delete(`/api/contact-enquiry/${enquiry._id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Enquiry has been deleted.', 'success');
                    fetchEnquiries();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete enquiry', 'error');
            }
        }
    };

    const filteredEnquiries = enquiries.filter(enq => 
        enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.service?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            key: "name",
            label: "NAME",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#23471d]" />
                    <div className="font-medium text-red-600">{row.name}</div>
                </div>
            )
        },
        {
            key: "service",
            label: "INQUIRY TYPE",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#d26019]" />
                    <div className="text-gray-900 font-medium capitalize">{row.service}</div>
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
                        <span className="text-gray-600 font-normal italic">{row.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-gray-600 font-normal italic">{row.phone}</span>
                    </div>
                </div>
            )
        },
        {
            key: "message",
            label: "MESSAGE",
            render: (row) => (
                <div className="max-w-[300px] text-xs font-normal line-clamp-2 italic text-slate-600">
                    {row.message || 'No message'}
                </div>
            )
        },
        {
            key: "date",
            label: "DATE",
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-900">
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
                    <h1 className="text-3xl font-bold text-[#23471d]">CONTACT ENQUIRIES</h1>
                    <p className="text-gray-600 mt-2 text-lg">List of all inquiries submitted from the Contact page</p>
                </div>

                <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b bg-[#23471d]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white uppercase">Enquiry List</h2>
                                <p className="text-sm text-blue-100 mt-0.5 normal-case tracking-normal">
                                    Showing {filteredEnquiries.length} of {enquiries.length} enquiries
                                </p>
                            </div>

                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search enquiries..."
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

export default ContactEnquiries;
