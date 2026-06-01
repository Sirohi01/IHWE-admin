import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ClipboardList, Users } from 'lucide-react';
import SalesSummaryCards from './components/SalesSummaryCards';
import SalesTable from './components/SalesTable';
import SalesRightSidebar from './components/SalesRightSidebar';

export default function SalesTools({ activeTab = 'proposals' }) {
  const navigate = useNavigate();

  const tabs = [
    { id: 'proposals', label: 'Proposals', icon: FileText, path: '/sales-tools/proposals' },
    { id: 'quotations', label: 'Quotations', icon: ClipboardList, path: '/sales-tools/quotations' },
    { id: 'lead-assignment', label: 'Lead Assignment', icon: Users, path: '/sales-tools/lead-assignment' },
  ];

  return (
    <div className="bg-[#f7f8fc] p-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-1">
        {/* Main Content Area */}
        <div className="xl:col-span-8 2xl:col-span-9">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-[24px] font-md text-[#0F172A] mb-1">Sales Tools</h1>
            <p className="text-sm font-medium text-slate-500">Manage proposals, quotations and lead assignments</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-[#E5E7EB] mb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`
                    flex items-center gap-2 pb-3 px-2 border-b-2 font-semibold text-[14px] transition-colors
                    ${isActive ? 'border-[#16A34A] text-[#16A34A]' : 'border-transparent text-[#475569] hover:text-[#0F172A]'}
                  `}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-0">
            <SalesSummaryCards />
            <SalesTable />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-4 2xl:col-span-3">
          <SalesRightSidebar />
        </div>
      </div>
    </div>
  );
}
