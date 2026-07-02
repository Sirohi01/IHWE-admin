import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, FilePlus } from 'lucide-react';
import api from '../../../lib/api';
import EstimateTable from '../EstimateTable';

const PerformaInvoiceList = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const isAllList = id === 'all';
    const [accountName, setAccountName] = useState('');

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
            } catch (error) {
                if (!cancelled) setAccountName('');
            }
        };

        fetchAccountName();
        return () => {
            cancelled = true;
        };
    }, [id, isAllList]);

    return (
        <div className="min-h-screen bg-gray-50 pl-4 pr-4">
            {/* ── Header ── */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-1 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">PROFORMA INVOICE</h1>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-700 font-medium">
                            {isAllList ? 'All Proforma Invoices List' : `${accountName || 'Company'} Proforma Invoices`}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isAllList && (
                        <button
                            onClick={() => navigate(`/performa-invoice/${id}`)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition"
                        >
                            <FilePlus className="w-4 h-4" />
                            Create Proforma Invoice
                        </button>
                    )}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            </div>

            {/* ── Table Container ── */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-1 overflow-x-auto">
                <EstimateTable clientId={id} />
            </div>
        </div>
    );
};

export default PerformaInvoiceList;
