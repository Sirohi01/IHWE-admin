import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import api from "../../lib/api";
import Pagination from "../../components/Pagination";
import Table from '../../components/table/Table';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';

import { pagesList } from '../../data/pagesList'; // Import pages list

const SeoList = () => {
    const [seoList, setSeoList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchSeoModules();
    }, []);

    const fetchSeoModules = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/seo/all');
            if (response.data.success) {
                setSeoList(response.data.data);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to fetch SEO modules',
                confirmButtonColor: '#134698'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `Delete SEO for page: <strong>${row.page}</strong>?<br><span class="text-red-600">This cannot be undone!</span>`,
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
                const response = await api.delete(`/api/seo/delete/${row._id}`);

                if (response.data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'SEO module deleted successfully',
                        confirmButtonColor: '#134698',
                        timer: 2000
                    });
                    fetchSeoModules();
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to delete',
                    confirmButtonColor: '#134698'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleEdit = (row) => {
        // Navigate to AddSeo page with data
        navigate('/add-meta', { state: { seoData: row } });
    };

    // Helper to get page name from path
    const getPageName = (path) => {
        const found = pagesList.find(p => p.path === path);
        return found ? found.name : path; // Fallback to path if name not found
    };


    const filteredList = seoList.filter(item =>
        item.page?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.metaTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

    const columns = [
        {
            key: "sno",
            label: "S.NO",
            width: "80px",
            render: (row, index) => (
                <div className="font-bold text-gray-900">{startIndex + index + 1}</div>
            )
        },
        {
            key: "page",
            label: "PAGE NAME",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-[#1e3a8a]">{getPageName(row.page)}</span>
                    <span className="text-[10px] text-gray-400">{row.page}</span>
                </div>
            )
        },
        {
            key: "metaTitle",
            label: "META TITLE",
            render: (row) => (
                <div className="text-gray-600 text-xs max-w-[200px] truncate" title={row.metaTitle}>
                    {row.metaTitle || "-"}
                </div>
            )
        },
        {
            key: "isActive",
            label: "STATUS",
            render: (row) => (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${row.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {row.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {row.isActive ? "Active" : "Inactive"}
                </div>
            )
        },
        {
            key: "updatedAt",
            label: "LAST UPDATE",
            render: (row) => (
                <div className="text-xs text-gray-500">
                    {new Date(row.updatedAt).toLocaleDateString()}
                </div>
            )
        },
    ];

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="SEO META LIST"
                description="Manage all SEO meta tags"
            />

            <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
                <div className="px-6 py-4 border-b bg-[#1e3a8a]">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Meta Tags List</h2>
                            <p className="text-sm text-blue-100 mt-0.5">
                                Showing {filteredList.length} of {seoList.length} entries
                            </p>
                        </div>

                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search page..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={paginatedList}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>

                <div className="mt-4 px-4 pb-4 bg-white">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredList.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        label="pages"
                    />
                </div>
            </div>
        </div>
    );
};

export default SeoList;
