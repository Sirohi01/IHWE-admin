import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Edit } from 'lucide-react';
import api from '../../../lib/api';

const InvoiceList = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const isAllList = id === 'all';
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [accountName, setAccountName] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await api.get('/api/invoices');
                setInvoices(res.data || []);
            } catch (err) {
                console.error("Failed to fetch invoices", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    useEffect(() => {
        if (isAllList) {
            setAccountName('');
            return;
        }

        let cancelled = false;
        const fetchAccountName = async () => {
            try {
                const res = await api.get(`/api/account-overview/${id}`);
                if (!cancelled && res.data?.success) {
                    setAccountName(res.data.data?.companyInfo?.name || '');
                }
            } catch (err) {
                if (!cancelled) setAccountName('');
            }
        };

        fetchAccountName();
        return () => {
            cancelled = true;
        };
    }, [id, isAllList]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).replace(/\//g, " ");
    };

    const filteredInvoices = invoices.filter(inv => {
        if (!isAllList && String(inv.companyId || '') !== String(id)) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (inv.invoice_no || '').toLowerCase().includes(q) ||
            (inv.estimate_no || '').toLowerCase().includes(q) ||
            (inv.company_name || '').toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pl-4 pr-4">
            {/* ── Header ── */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-700 font-medium">
                            {isAllList ? 'All Invoices' : `${accountName || 'Company'} Invoices`}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3598dc]"
                    />
                    <button
	                        onClick={() => navigate(isAllList ? '/page-create-invoice' : `/page-create-invoice/${id}`)}
                        className="flex items-center gap-2 bg-[#00A859] hover:bg-[#00904C] text-white px-4 py-2 rounded-md font-semibold transition text-sm"
                    >
                        Create Invoice
                    </button>
                    <button
	                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold transition text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            </div>

            {/* ── Table Container ── */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No.</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice No.</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">PI No.</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Company / Client</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount (₹)</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Added By</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">Loading invoices...</td>
                            </tr>
                        ) : paginatedInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-gray-500">No invoices found.</td>
                            </tr>
                        ) : (
                            paginatedInvoices.map((inv, idx) => (
                                <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {(currentPage - 1) * itemsPerPage + idx + 1}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <Link to={`/payments/invoiceDetails/${inv._id}`} className="text-[#3598dc] font-medium hover:underline">
                                            {inv.invoice_no}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {inv.estimate_no || "—"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {inv.company_name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(inv.invoice_date || inv.added)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        {inv.finalAmount?.toFixed(2) || "0.00"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {inv.added_by || "Unknown"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                        <Link
                                            to={`/page-create-invoice/${inv._id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-md font-medium text-xs transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> of <span className="font-semibold">{filteredInvoices.length}</span> entries
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => handlePageChange(idx + 1)}
                                className={`px-3 py-1 border rounded text-sm ${currentPage === idx + 1 ? 'bg-[#3598dc] text-white' : 'hover:bg-gray-50'}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;
