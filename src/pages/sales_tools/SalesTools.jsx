import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, ClipboardList, Users } from 'lucide-react';
import axios from 'axios';
import SalesSummaryCards from './components/SalesSummaryCards';
import ProposalsTable from './components/ProposalsTable';
import QuotationsTable from './components/QuotationsTable';
import LeadAssignmentTable from './components/LeadAssignmentTable';
import SalesRightSidebar from './components/SalesRightSidebar';

export default function SalesTools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'proposals';
  const [currentTab, setCurrentTab] = useState(initialTab);

  const [estimates, setEstimates] = useState([]);
  const [estimatesLoading, setEstimatesLoading] = useState(true);

  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${BASE_URL}/api/estimates`);
        setEstimates(res.data.data || []);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      } finally {
        setEstimatesLoading(false);
      }
    };
    
    const fetchLeads = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${BASE_URL}/api/companies`);
        const data = res.data.data || res.data || [];
        setLeads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLeadsLoading(false);
      }
    };

    fetchEstimates();
    fetchLeads();
  }, []);

  const tabs = [
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'quotations', label: 'Quotations', icon: ClipboardList },
    { id: 'lead-assignment', label: 'Lead Assignment', icon: Users },
  ];

  useEffect(() => {
    setSearchParams({ tab: currentTab });
  }, [currentTab, setSearchParams]);

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
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
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
            <SalesSummaryCards 
              data={estimates} 
              loading={estimatesLoading} 
              leadsData={leads} 
              leadsLoading={leadsLoading} 
              currentTab={currentTab} 
            />
            {currentTab === 'proposals' && <ProposalsTable data={estimates} parentLoading={estimatesLoading} />}
            {currentTab === 'quotations' && <QuotationsTable data={estimates} parentLoading={estimatesLoading} />}
            {currentTab === 'lead-assignment' && <LeadAssignmentTable data={leads} parentLoading={leadsLoading} />}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-4 2xl:col-span-3">
          <SalesRightSidebar data={estimates} loading={estimatesLoading} />
        </div>
      </div>
    </div>
  );
}
