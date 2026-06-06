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

  const tabs = [
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
  ];

  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
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
          const res = await api.get(`/api/user-targets/stats/dashboard?username=${username}&userId=${userId || ''}`);
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
    fetchStats();
  }, []);

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

  return (
    <div className="bg-[#f7f8fc] pl-6 pr-6 pt-6 pb-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-1">
        {/* Main Content Area */}
        <div className="xl:col-span-8 2xl:col-span-9 flex flex-col h-[calc(100vh-110px)]">
          {/* Header */}
          <div className="mb-1 shrink-0">
            <h1 className="text-[24px] font-medium text-[#0F172A] mb-1">Communication</h1>
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
          <div className="h-[calc(100vh-110px)] overflow-y-auto pr-1 custom-scrollbar">
            {activeTab === 'calls' && <CallsRightSidebar statsData={statsData} recentLogs={recentLogs} onLogAdded={fetchRecentLogs} />}
            {activeTab === 'whatsapp' && <WhatsAppRightSidebar statsData={statsData} recentLogs={recentLogs} onLogAdded={fetchRecentLogs} />}
            {activeTab === 'emails' && <EmailsRightSidebar statsData={statsData} recentLogs={recentLogs} onLogAdded={fetchRecentLogs} />}
            {activeTab === 'meetings' && <MeetingsRightSidebar statsData={statsData} recentLogs={recentLogs} onLogAdded={fetchRecentLogs} />}
          </div>
        </div>
      </div>
    </div>
  );
}
