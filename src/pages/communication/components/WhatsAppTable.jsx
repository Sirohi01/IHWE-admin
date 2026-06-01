import React from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, MoreVertical, MessageCircle, Calendar, CalendarCheck, CalendarX, Mail, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import SearchableDropdown from '../../../components/SearchableDropdown';

export default function WhatsAppTable() {
  const tableData = [
    {
      id: 1,
      clientInitials: 'GA',
      clientName: 'GreenLife Ayurveda',
      clientColor: 'bg-green-100 text-green-700',
      purpose: 'Product Demo',
      callStatus: 'Connected',
      statusColor: 'bg-green-100 text-green-700',
      statusIcon: CheckCircle2,
      duration: '08:45',
      lastRemark: 'Interested in wellness products. Asked for pricing.',
      nextActionIcon: Calendar,
      nextActionText: 'Follow up call',
      nextActionDate: '30 May, 11:00 AM'
    },
    {
      id: 2,
      clientInitials: 'NH',
      clientName: "Nature's Harmony Pvt. Ltd.",
      clientColor: 'bg-purple-100 text-purple-700',
      purpose: 'Partnership',
      callStatus: 'Call Back Later',
      statusColor: 'bg-orange-100 text-orange-700',
      statusIcon: Clock,
      duration: '--',
      lastRemark: 'Will connect next week with decision maker.',
      nextActionIcon: Calendar,
      nextActionText: 'Call back',
      nextActionDate: '29 May, 04:00 PM'
    },
    {
      id: 3,
      clientInitials: 'WW',
      clientName: 'Wellness World',
      clientColor: 'bg-blue-100 text-blue-700',
      purpose: 'Product Inquiry',
      callStatus: 'Connected',
      statusColor: 'bg-green-100 text-green-700',
      statusIcon: CheckCircle2,
      duration: '12:30',
      lastRemark: 'Requested brochure on email. Very positive.',
      nextActionIcon: Mail,
      nextActionText: 'Send Brochure',
      nextActionDate: '28 May, 05:00 PM'
    },
    {
      id: 4,
      clientInitials: 'HE',
      clientName: 'Herbal King Exports',
      clientColor: 'bg-orange-100 text-orange-700',
      purpose: 'Deal Discussion',
      callStatus: 'No Answer',
      statusColor: 'bg-red-100 text-red-700',
      statusIcon: XCircle,
      duration: '--',
      lastRemark: 'No response. Try again later.',
      nextActionIcon: Calendar,
      nextActionText: 'Call again',
      nextActionDate: '30 May, 11:30 AM'
    },
    {
      id: 5,
      clientInitials: 'AO',
      clientName: 'Arogya Organics',
      clientColor: 'bg-green-100 text-green-700',
      purpose: 'Product Demo',
      callStatus: 'Busy',
      statusColor: 'bg-orange-100 text-orange-700',
      statusIcon: CheckCircle2,
      duration: '--',
      lastRemark: 'Line was busy. Will try again.',
      nextActionIcon: Calendar,
      nextActionText: 'Call again',
      nextActionDate: '28 May, 02:00 PM'
    },
    {
      id: 6,
      clientInitials: 'PS',
      clientName: 'Pureveda Solutions',
      clientColor: 'bg-purple-100 text-purple-700',
      purpose: 'Pricing Discussion',
      callStatus: 'Interested',
      statusColor: 'bg-green-100 text-green-700',
      statusIcon: CheckCircle2,
      duration: '15:20',
      lastRemark: 'Interested in bulk order. Need best price.',
      nextActionIcon: Mail,
      nextActionText: 'Send Quotation',
      nextActionDate: '28 May, 04:30 PM'
    },
    {
      id: 7,
      clientInitials: 'SB',
      clientName: 'Shakti Bio Products',
      clientColor: 'bg-blue-100 text-blue-700',
      purpose: 'Partnership',
      callStatus: 'Not Interested',
      statusColor: 'bg-slate-100 text-slate-700',
      statusIcon: XCircle,
      duration: '05:10',
      lastRemark: 'Not looking for partnership at the moment.',
      nextActionIcon: null,
      nextActionText: '--',
      nextActionDate: ''
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-[#EDF0F7] shadow-sm">
      {/* Table Controls */}
      <div className="p-3 border-b border-[#EDF0F7] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by client or company..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-[240px] focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-slate-50"
            />
          </div>
          <div className="w-[140px]">
             <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500">
               <option>Message Status</option>
             </select>
          </div>
          <div className="w-[140px]">
             <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500">
               <option>Call Purpose</option>
             </select>
          </div>
          <div className="w-[120px]">
             <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500">
               <option>Date</option>
             </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Filters
          </button>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-[#EDF0F7]">
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700">Client / Company</th>
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700">Purpose</th>
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700">Message Status</th>
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700">Duration</th>
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700">Last Remark</th>
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700">Next Action</th>
              <th className="py-1 px-3 text-[13px] font-medium text-slate-700 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => {
              const ActionIcon = row.nextActionIcon;
              const StatusIcon = row.statusIcon;
              return (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-1 px-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center font-medium text-[11px] ${row.clientColor}`}>
                        {row.clientInitials}
                      </div>
                      <span className="text-[13px] font-medium text-slate-900">{row.clientName}</span>
                    </div>
                  </td>
                  <td className="py-1 px-3">
                    <span className="text-[13px] font-medium text-slate-600">{row.purpose}</span>
                  </td>
                  <td className="py-1 px-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${row.statusColor}`}>
                      <StatusIcon size={14} />
                      {row.callStatus}
                    </div>
                  </td>
                  <td className="py-1 px-3">
                    <span className="text-[13px] font-medium text-slate-600">{row.duration}</span>
                  </td>
                  <td className="py-1 px-3 max-w-[200px]">
                    <p className="text-[12px] text-slate-600 font-medium leading-tight">
                      {row.lastRemark}
                    </p>
                  </td>
                  <td className="py-1 px-3">
                    {row.nextActionText !== '--' ? (
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 text-slate-500">
                           <ActionIcon size={14} />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-slate-900">{row.nextActionText}</p>
                          <p className="text-[11px] font-medium text-slate-500">{row.nextActionDate}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="py-1 px-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded-md">
                        <MessageCircle size={16} />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                        <Calendar size={16} />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-[#EDF0F7] flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-600">
          Showing 1 to 7 of 28 messages
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-green-600 text-white font-medium text-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm">
              4
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ChevronRight size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-slate-600">Rows per page:</span>
            <select className="border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500">
              <option>10</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
