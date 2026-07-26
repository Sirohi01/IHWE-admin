import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, FileText, FileSpreadsheet, FileMinus, FileWarning, Truck, CreditCard, ArrowLeft } from 'lucide-react';

const AccountNavigation = ({ id, accountName, pageName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!id || id === 'all') return null;

  const navItems = [
    { label: 'Proforma Invoices', path: `/performa-invoice-list/${id}`, icon: <FileText size={12} /> },
    { label: 'Delivery Challans', path: `/dashboard/account/${id}/delivery-challans`, icon: <Truck size={12} /> },
    { label: 'Invoices', path: `/invoice-list/${id}`, icon: <FileSpreadsheet size={12} /> },
    { label: 'Payments', path: `/payment-list/${id}`, icon: <CreditCard size={12} /> },
    { label: 'Credit Notes', path: `/dashboard/account/credit-notes/${id}`, icon: <FileMinus size={12} /> },
    { label: 'Debit Notes', path: `/account-debit-notes/${id}`, icon: <FileWarning size={12} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm w-full">
      {/* Breadcrumb Left */}
      <div className="flex items-center flex-wrap gap-2 text-[13px] text-[#194090] font-semibold shrink-0">
        <span>Exhibitors</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-800">{accountName || "Company"}</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-500 font-normal">Accounts</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-slate-500 font-normal">{pageName}</span>
      </div>

      {/* Action Buttons Right */}
      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar w-full lg:w-auto">
        <button
          onClick={() => navigate(`/dashboard/account/${id}`)}
          className="flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[11px] font-bold text-[#194090] bg-[#f0f5ff] hover:bg-[#e0ecff] rounded transition-colors border border-[#d6e4ff] mr-1"
        >
          <ArrowLeft size={12} strokeWidth={2.5} />
          Overview
        </button>

        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/') || (item.label === 'Payments' && location.pathname.includes('/AddPayment/'));
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold rounded transition-all duration-200 ${isActive
                ? 'bg-[#194090] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#194090] border border-transparent hover:border-gray-200'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AccountNavigation;
