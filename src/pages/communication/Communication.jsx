import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Mail, Calendar } from 'lucide-react';
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

export default function Communication({ activeTab = 'calls' }) {
  const navigate = useNavigate();

  const tabs = [
    { id: 'calls', label: 'Calls', icon: Phone, path: '/communication/calls' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, path: '/communication/whatsapp' },
    { id: 'emails', label: 'Emails', icon: Mail, path: '/communication/emails' },
    { id: 'meetings', label: 'Meetings', icon: Calendar, path: '/communication/meetings' },
  ];

  return (
    <div className="bg-[#f7f8fc] p-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-1">
        {/* Main Content Area */}
        <div className="xl:col-span-8 2xl:col-span-9">
          {/* Header */}
          <div className="mb-1">
            <h1 className="text-[24px] font-medium text-[#0F172A] mb-1">Communication</h1>
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
            {activeTab === 'calls' && (
              <>
                <CallsSummaryCards />
                <CallsTable />
              </>
            )}
            {activeTab === 'whatsapp' && (
              <>
                <WhatsAppSummaryCards />
                <WhatsAppTable />
              </>
            )}
            {activeTab === 'emails' && (
              <>
                <EmailsSummaryCards />
                <EmailsTable />
              </>
            )}
            {activeTab === 'meetings' && (
              <>
                <MeetingsSummaryCards />
                <MeetingsTable />
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-4 2xl:col-span-3">
          {activeTab === 'calls' && <CallsRightSidebar />}
          {activeTab === 'whatsapp' && <WhatsAppRightSidebar />}
          {activeTab === 'emails' && <EmailsRightSidebar />}
          {activeTab === 'meetings' && <MeetingsRightSidebar />}
        </div>
      </div>
    </div>
  );
}
