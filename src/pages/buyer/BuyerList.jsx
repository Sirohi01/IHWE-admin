// import React, { useState, useEffect } from 'react';
// import { Search, Trash2, Mail, Phone, User, Calendar, Building2, Globe, Briefcase, Eye, Edit } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import api from "../../lib/api";
// import Swal from 'sweetalert2';
// import Table from '../../components/table/Table';
// import Pagination from "../../components/Pagination";

// const BuyerList = () => {
//     const [registrations, setRegistrations] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [currentPage, setCurrentPage] = useState(1);
//     const navigate = useNavigate();
//     const itemsPerPage = 25;

//     useEffect(() => {
//         fetchRegistrations();
//     }, []);

//     const fetchRegistrations = async () => {
//         try {
//             setIsLoading(true);
//             const response = await api.get('/api/buyer-registration');
//             if (response.data.success) {
//                 setRegistrations(response.data.data);
//             }
//         } catch (error) {
//             console.error('Error fetching registrations:', error);
//             Swal.fire('Error', 'Failed to load registrations', 'error');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleDelete = async (registration) => {
//         const result = await Swal.fire({
//             title: 'Are you sure?',
//             text: "You won't be able to revert this!",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#DC2626',
//             cancelButtonColor: '#6B7280',
//             confirmButtonText: 'Yes, delete it!'
//         });

//         if (result.isConfirmed) {
//             try {
//                 const response = await api.delete(`/api/buyer-registration/${registration._id}`);
//                 if (response.data.success) {
//                     Swal.fire('Deleted!', 'Registration has been deleted.', 'success');
//                     fetchRegistrations();
//                 }
//             } catch (error) {
//                 Swal.fire('Error', 'Failed to delete registration', 'error');
//             }
//         }
//     };

//     const filteredRegistrations = registrations.filter(reg =>
//         reg.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         reg.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         reg.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         reg.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         reg.registrationId?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

//     const columns = [
//         {
//             key: "sno",
//             label: "S.NO",
//             width: "60px",
//             render: (_, index) => (
//                 <div className="font-bold text-gray-900">{startIndex + index + 1}</div>
//             )
//         },
//         {
//             key: "registrationId",
//             label: "BUYER ID",
//             render: (row) => (
//                 <div className="font-mono text-[11px] font-black text-[#23471d] uppercase tracking-wider">
//                     {row.registrationId || "PENDING"}
//                 </div>
//             )
//         },
//         {
//             key: "company",
//             label: "COMPANY",
//             render: (row) => (
//                 <div className="space-y-1">
//                     <div className="flex items-center gap-2">
//                         <Building2 className="w-4 h-4 text-[#23471d]" />
//                         <Link
//                             to={`/buyer-registration/${row._id}`}
//                             className="font-bold text-blue-600 hover:text-blue-800 uppercase underline decoration-blue-200 underline-offset-4 transition-colors"
//                         >
//                             {row.companyName}
//                         </Link>
//                     </div>
//                     <div className="flex items-center gap-2 text-[11px]">
//                         <Globe className="w-3 h-3 text-slate-400" />
//                         <span className="text-gray-600 italic">{row.country}</span>
//                     </div>
//                 </div>
//             )
//         },
//         {
//             key: "tag",
//             label: "CRM TAG",
//             render: (row) => {
//                 const tag = row.buyerTag || 'Cold';
//                 const colors = {
//                     'Hot': 'bg-red-100 text-red-600 border-red-200',
//                     'Warm': 'bg-orange-100 text-orange-600 border-orange-200',
//                     'Cold': 'bg-blue-100 text-blue-600 border-blue-200'
//                 };
//                 return (
//                     <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${colors[tag] || colors.Cold}`}>
//                         {tag}
//                     </span>
//                 );
//             }
//         },
//         {
//             key: "contact",
//             label: "CONTACT PERSON",
//             render: (row) => (
//                 <div className="space-y-1">
//                     <div className="flex items-center gap-2">
//                         <User className="w-4 h-4 text-[#d26019]" />
//                         <div className="text-gray-900 font-medium">{row.fullName || row.contactPerson}</div>
//                     </div>
//                     <div className="text-[11px] text-slate-500 font-medium ml-6 uppercase">{row.designation}</div>
//                 </div>
//             )
//         },
//         {
//             key: "contactInfo",
//             label: "CONTACT INFO",
//             render: (row) => (
//                 <div className="space-y-1">
//                     <div className="flex items-center gap-2 text-xs">
//                         <Mail className="w-3 h-3 text-slate-400" />
//                         <span className="text-gray-600 italic">{row.emailAddress || row.email}</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-xs">
//                         <Phone className="w-3 h-3 text-slate-400" />
//                         <span className="text-gray-600 italic">{row.mobileNumber || row.whatsapp}</span>
//                     </div>
//                 </div>
//             )
//         },
//         {
//             key: "payment",
//             label: "PAYMENT",
//             render: (row) => (
//                 <div className="space-y-1">
//                     <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${row.paymentStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
//                         {row.paymentStatus || 'Pending'}
//                     </div>
//                     <div className="text-[9px] text-slate-400 font-mono">{row.registrationCategory || 'N/A'}</div>
//                 </div>
//             )
//         },
//         {
//             key: "date",
//             label: "DATE",
//             render: (row) => (
//                 <div className="flex items-center gap-2 text-gray-900 text-xs text-nowrap">
//                     <Calendar className="w-4 h-4 text-[#23471d]" />
//                     {new Date(row.createdAt).toLocaleDateString()}
//                 </div>
//             )
//         }
//     ];

//     return (
//         <div className="bg-white shadow-md mt-6 p-6">
//             <div className="w-full">
//                 <div className="mb-6">
//                     <h1 className="text-3xl font-bold text-[#23471d] uppercase">Buyer Registrations</h1>
//                     <p className="text-gray-600 mt-2 text-lg">Manage all registrations from the Buyer Registration page</p>
//                 </div>

//                 <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
//                     <div className="px-6 py-4 border-b bg-[#23471d]">
//                         <div className="flex items-center justify-between gap-4">
//                             <div>
//                                 <h2 className="text-lg font-semibold text-white uppercase">Registration List</h2>
//                                 <p className="text-sm text-blue-100 mt-0.5 normal-case tracking-normal">
//                                     Showing {filteredRegistrations.length} of {registrations.length} registrations
//                                 </p>
//                             </div>

//                             <div className="relative w-72">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search registrations..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg bg-white normal-case font-normal"
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white">
//                         {isLoading ? (
//                             <div className="flex items-center justify-center py-20">
//                                 <div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div>
//                             </div>
//                         ) : (
//                             <Table
//                                 columns={columns}
//                                 data={paginatedRegistrations}
//                                 onEdit={(row) => navigate(`/buyer-registration/edit/${row._id}`)}
//                                 onDelete={handleDelete}
//                             />
//                         )}
//                     </div>

//                     <div className="mt-4 px-4 pb-4 bg-white">
//                         <Pagination
//                             currentPage={currentPage}
//                             totalItems={filteredRegistrations.length}
//                             itemsPerPage={itemsPerPage}
//                             onPageChange={setCurrentPage}
//                             label="registrations"
//                         />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default BuyerList;
import React, { useState, useEffect } from 'react';
import { Search, Trash2, Mail, Phone, User, Calendar, Building2, Globe, Briefcase, Eye, Edit, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../lib/api";
import Swal from 'sweetalert2';
import Pagination from "../../components/Pagination";

const BuyerList = () => {
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const itemsPerPage = 25;

    // Column-specific search states
    const [searchCompany, setSearchCompany] = useState("");
    const [searchContact, setSearchContact] = useState("");
    const [searchCategory, setSearchCategory] = useState("");
    const [searchNature, setSearchNature] = useState("");
    const [searchCity, setSearchCity] = useState("");
    const [searchState, setSearchState] = useState("");
    const [searchSource, setSearchSource] = useState("");
    const [searchUpdate, setSearchUpdate] = useState("");

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

    // Filter logic with all column-specific searches
    const filteredRegistrations = registrations.filter(reg => {
        const companyMatch = !searchCompany ||
            (reg.companyName?.toLowerCase().includes(searchCompany.toLowerCase()) ||
                reg.registrationId?.toLowerCase().includes(searchCompany.toLowerCase()));

        const contactMatch = !searchContact ||
            (reg.fullName?.toLowerCase().includes(searchContact.toLowerCase()) ||
                reg.emailAddress?.toLowerCase().includes(searchContact.toLowerCase()) ||
                reg.mobileNumber?.toLowerCase().includes(searchContact.toLowerCase()) ||
                reg.whatsapp?.toLowerCase().includes(searchContact.toLowerCase()));

        const categoryMatch = !searchCategory ||
            (reg.registrationCategory?.toLowerCase().includes(searchCategory.toLowerCase()));

        const natureMatch = !searchNature ||
            (reg.natureOfBusiness?.toLowerCase().includes(searchNature.toLowerCase()));

        const cityMatch = !searchCity ||
            (reg.city?.toLowerCase().includes(searchCity.toLowerCase()));

        const stateMatch = !searchState ||
            (reg.state?.toLowerCase().includes(searchState.toLowerCase()));

        const sourceMatch = !searchSource ||
            (reg.source?.toLowerCase().includes(searchSource.toLowerCase()) ||
                reg.heardAbout?.toLowerCase().includes(searchSource.toLowerCase()));

        const updateMatch = !searchUpdate ||
            (reg.updates?.toLowerCase().includes(searchUpdate.toLowerCase()) ||
                reg.notes?.toLowerCase().includes(searchUpdate.toLowerCase()) ||
                reg.adminNotes?.toLowerCase().includes(searchUpdate.toLowerCase()));

        return companyMatch && contactMatch && categoryMatch && natureMatch &&
            cityMatch && stateMatch && sourceMatch && updateMatch;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

    const clearAllFilters = () => {
        setSearchCompany("");
        setSearchContact("");
        setSearchCategory("");
        setSearchNature("");
        setSearchCity("");
        setSearchState("");
        setSearchSource("");
        setSearchUpdate("");
        setCurrentPage(1);
    };

    const isFilterActive = searchCompany || searchContact || searchCategory || searchNature ||
        searchCity || searchState || searchSource || searchUpdate;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const FilterInput = ({ placeholder, value, onChange }) => (
        <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-500 focus:ring-0 bg-white"
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );

    return (
        <div className="bg-white mt-6">
            <div className="w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 uppercase">Buyer Registrations</h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage all registrations from the Buyer Registration page</p>
                </div>

                <div className="border border-gray-300 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-300 bg-white">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 uppercase">Registration List</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Showing {filteredRegistrations.length} of {registrations.length} registrations
                                </p>
                            </div>
                            {isFilterActive && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Column Filters Row */}
                    <div className="px-4 py-3 border-b border-gray-300 bg-white">
                        <div className="grid grid-cols-8 gap-2">
                            <FilterInput
                                placeholder="Search Company ID/Name"
                                value={searchCompany}
                                onChange={setSearchCompany}
                            />
                            <FilterInput
                                placeholder="Search Contact Details"
                                value={searchContact}
                                onChange={setSearchContact}
                            />
                            <FilterInput
                                placeholder="Search Category"
                                value={searchCategory}
                                onChange={setSearchCategory}
                            />
                            <FilterInput
                                placeholder="Search Nature of Business"
                                value={searchNature}
                                onChange={setSearchNature}
                            />
                            <FilterInput
                                placeholder="Search City"
                                value={searchCity}
                                onChange={setSearchCity}
                            />
                            <FilterInput
                                placeholder="Search State"
                                value={searchState}
                                onChange={setSearchState}
                            />
                            <FilterInput
                                placeholder="Search Source"
                                value={searchSource}
                                onChange={setSearchSource}
                            />
                            <FilterInput
                                placeholder="Search Update Details"
                                value={searchUpdate}
                                onChange={setSearchUpdate}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-gray-300">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">S.NO</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">COMPANY</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">CRM TAG</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">CONTACT PERSON</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">CONTACT INFO</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">PAYMENT</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">DATE</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRegistrations.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12 text-gray-500 border-b border-gray-300">
                                                No registrations found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRegistrations.map((row, index) => (
                                            <tr key={row._id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                                                    {startIndex + index + 1}
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div>
                                                        <Link
                                                            to={`/buyer-registration/${row._id}`}
                                                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                                        >
                                                            {row.companyName || 'N/A'}
                                                        </Link>
                                                        <div className="text-xs text-gray-400">{row.country || ''}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <span className={`text-[10px] font-medium px-2 py-0.5 border ${(row.buyerTag || 'Cold') === 'Hot' ? 'border-red-300 text-red-600' : (row.buyerTag || 'Cold') === 'Warm' ? 'border-orange-300 text-orange-600' : 'border-blue-300 text-blue-600'}`}>
                                                        {row.buyerTag || 'Cold'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-sm text-gray-800">{row.fullName || row.contactPerson || 'N/A'}</div>
                                                    <div className="text-xs text-gray-400">{row.designation || ''}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-xs text-gray-600">{row.emailAddress || row.email || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{row.mobileNumber || row.whatsapp || 'N/A'}</div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="text-xs text-gray-600">{row.paymentStatus || 'Pending'}</div>
                                                    <div className="text-[10px] text-gray-400">{row.registrationCategory || 'N/A'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                                    {formatDate(row.createdAt)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/buyer-registration/${row._id}`)}
                                                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/buyer-registration/edit/${row._id}`)}
                                                            className="p-1 text-gray-500 hover:text-amber-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(row)}
                                                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="mt-4 px-4 pb-4 bg-white border-t border-gray-300 pt-4">
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