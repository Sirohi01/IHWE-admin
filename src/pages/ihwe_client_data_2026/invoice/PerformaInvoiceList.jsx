import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, FilePlus } from 'lucide-react';
import api from '../../../lib/api';
import EstimateTable from '../EstimateTable';
import AccountNavigation from '../../../components/AccountNavigation';

const PerformaInvoiceList = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const [searchParams] = useSearchParams();
    const crmEventId = searchParams.get('crmEventId') || '';
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
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Sub-Navigation for Account pages */}
            {!isAllList && <AccountNavigation id={id} accountName={accountName} pageName="Proforma Invoice" />}

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-3 px-1 mt-1">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">PROFORMA INVOICE</h1>
                    {isAllList && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Home</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-700 font-medium">All Proforma Invoices List</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!isAllList && (
                        <button
                            onClick={() => navigate(`/performa-invoice/${id}${crmEventId ? `?crmEventId=${crmEventId}` : ''}`)}
                            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-blue-700"
                        >
                            <FilePlus size={16} />
                            Create Proforma Invoice
                        </button>
                    )}
                    {/* <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button> */}
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
