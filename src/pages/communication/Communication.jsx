import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Mail, Calendar } from 'lucide-react';
import api from '../../lib/api';
import CallsSummaryCards from './components/CallsSummaryCards';
import CallsTable from './components/CallsTable';
import CallsRightSidebar from './components/CallsRightSidebar';

import WhatsAppSummaryCards from './components/WhatsAppSummaryCards';
import WhatsAppTable from './components/WhatsAppTable';
import WhatsAppRightSidebar from './components/WhatsAppRightSidebar';

import EmailsSummaryCards from './components/EmailsSummaryCards';
import EmailsTable from './components/EmailsTable';
import EmailsRightSidebar from './components/EmailsRightSidebar';

import MeetingsSummaryCards from './components/MeetingsSummaryCards';
import MeetingsTable from './components/MeetingsTable';
import MeetingsRightSidebar from './components/MeetingsRightSidebar';

export default function Communication() {
  const [activeTab, setActiveTab] = useState('calls');
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const now = new Date();
  const currentTargetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const tabs = [
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
  ];

  const [statsData, setStatsData] = useState(null);

  const fetchStats = async () => {
    try {
      let user = {};
      try {
        const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        if (info) user = JSON.parse(info);
      } catch (e) {
        console.error("Error parsing adminInfo:", e);
      }

      const userId = user._id || user.id;
      const username = user.username || user.user_name;

      console.log("Fetching stats for:", { username, userId });

      if (username) {
        const res = await api.get(`/api/user-targets/stats/dashboard?username=${encodeURIComponent(username)}&userId=${encodeURIComponent(userId || '')}&period=${encodeURIComponent(selectedPeriod)}`);
        console.log("Stats API Response:", res.data);
        if (res.data.success) {
          setStatsData(res.data);
        }
      } else {
        console.error("Username or userId missing in session storage!", { username, userId });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const [recentLogs, setRecentLogs] = useState([]);

  const fetchRecentLogs = async () => {
    try {
      let user = {};
      try {
        const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        if (info) user = JSON.parse(info);
      } catch (e) {
        console.error("Error parsing adminInfo:", e);
      }

      const userId = user._id || user.id;

      if (userId) {
        const type = activeTab; // activeTab is already 'calls', 'emails', 'whatsapp', 'meetings'
        const res = await api.get(`/api/user-targets/logs/recent?userId=${userId}&type=${type}`);
        if (res.data.success) {
          setRecentLogs(res.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching recent logs:", error);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, [activeTab]);

  const refreshCommunicationData = () => {
    fetchRecentLogs();
    fetchStats();
  };

  return (
    <div className="h-[calc(100vh-82px)] overflow-hidden bg-[#f7f8fc] pl-6 pr-6 pt-4 pb-4">
      <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-12 gap-1">
        {/* Main Content Area */}
        <div className="xl:col-span-8 2xl:col-span-9 flex min-h-0 flex-col h-full">
          {/* Header */}
          <div className="mb-1 shrink-0 flex items-center justify-between">
            <h1 className="text-[24px] font-medium text-[#0F172A] mb-1">Communication</h1>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-[#E5E7EB] rounded-md px-3 py-1 text-sm font-medium text-[#475569] outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-[#E5E7EB] mb-1 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

          <div className="space-y-1 flex-1 flex flex-col min-h-0">
            {activeTab === 'calls' && (
              <>
                <CallsSummaryCards statsData={statsData} />
                <CallsTable />
              </>
            )}
            {activeTab === 'whatsapp' && (
              <>
                <WhatsAppSummaryCards statsData={statsData} />
                <WhatsAppTable />
              </>
            )}
            {activeTab === 'emails' && (
              <>
                <EmailsSummaryCards statsData={statsData} />
                <EmailsTable />
              </>
            )}
            {activeTab === 'meetings' && (
              <>
                <MeetingsSummaryCards statsData={statsData} />
                <MeetingsTable />
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-4 2xl:col-span-3">
          <div className="h-full min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            {activeTab === 'calls' && <CallsRightSidebar statsData={statsData} recentLogs={recentLogs} onLogAdded={refreshCommunicationData} />}
            {activeTab === 'whatsapp' && <WhatsAppRightSidebar statsData={statsData} recentLogs={recentLogs} onLogAdded={refreshCommunicationData} />}
            {activeTab === 'emails' && <EmailsRightSidebar statsData={statsData} recentLogs={recentLogs} onLogAdded={refreshCommunicationData} />}
            {activeTab === 'meetings' && <MeetingsRightSidebar statsData={statsData} recentLogs={recentLogs} onLogAdded={refreshCommunicationData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
