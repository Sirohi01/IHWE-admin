import React, { useState } from 'react';
import {
  Download, Filter, Search, Users, Clock, CheckCircle2,
  CreditCard, XCircle, MoreVertical, Calendar, RefreshCw,
  Presentation, FileText, MonitorPlay, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';

const DelegatePasses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dummy Data for UI
  const stats = [
    { title: 'Total Registrations', value: '186', sub: 'Across 42 Companies', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Upcoming Seminars', value: '14', sub: 'In Next 7 Days', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Paid Registrations', value: '132', sub: '71.0% of Total', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Complementary Passes', value: '54', sub: '29.0% of Total', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Cancelled / Failed', value: '6', sub: '2.3% of Total', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const delegates = [
    {
      id: 1, name: 'Dr. Neha Sharma', email: 'neha@citydental.com', company: 'City Dental Systems',
      phone: '+91 9876543210', event: 'Conference', passDetail: 'Full Day Pass', eventIcon: MonitorPlay, eventColor: 'text-blue-500',
      date: '21 Aug 2026', day: 'Day 1', passType: 'Paid', regNo: 'DEL-2026-0001', payStatus: 'Paid',
      amount: '₹ 1,000', regDate: '15 May 2026', regTime: '10:15 AM', avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 2, name: 'Mr. Ravi Kumar', email: 'ravi@abcpharma.com', company: 'ABC Pharma Pvt. Ltd.',
      phone: '+91 9812345678', event: 'Paper Presentation', passDetail: 'Full Day Pass', eventIcon: FileText, eventColor: 'text-emerald-500',
      date: '21 Aug 2026', day: 'Day 1', passType: 'Paid', regNo: 'DEL-2026-0002', payStatus: 'Partial',
      amount: '₹ 500 / ₹ 1,000', regDate: '14 May 2026', regTime: '04:20 PM', avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 3, name: 'Dr. Amit Verma', email: 'amit@herbalcare.com', company: 'Herbal Care India',
      phone: '+91 9911223344', event: 'Poster Presentation', passDetail: 'Full Day Pass', eventIcon: Presentation, eventColor: 'text-orange-500',
      date: '22 Aug 2026', day: 'Day 2', passType: 'Paid', regNo: 'DEL-2026-0003', payStatus: 'Paid',
      amount: '₹ 1,000', regDate: '14 May 2026', regTime: '02:30 PM', avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
    },
    {
      id: 4, name: 'Ms. Pooja Mehta', email: 'pooja@airxinnovation.com', company: 'Airx Innovation Pvt. Ltd.',
      phone: '+91 9876501234', event: 'Conference', passDetail: '3 Days Pass', eventIcon: MonitorPlay, eventColor: 'text-blue-500',
      date: '21 - 23 Aug 2026', day: 'All 3 Days', passType: 'Complementary', regNo: 'DEL-2026-0004', payStatus: '-',
      amount: '₹ 0', amountSub: 'Complimentary', regDate: '13 May 2026', regTime: '11:05 AM', avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      id: 5, name: 'Mr. Suraj Patel', email: 'suraj@happymiles.com', company: 'Happy Miles Journey Pvt. Ltd.',
      phone: '+91 8822334455', event: 'Conference', passDetail: 'Full Day Pass', eventIcon: MonitorPlay, eventColor: 'text-blue-500',
      date: '23 Aug 2026', day: 'Day 3', passType: 'Paid', regNo: 'DEL-2026-0005', payStatus: 'Paid',
      amount: '₹ 1,000', regDate: '12 May 2026', regTime: '09:40 AM', avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
    },
    {
      id: 6, name: 'Dr. Meghna Joshi', email: 'meghna@wellnessworld.com', company: 'Wellness World Pvt. Ltd.',
      phone: '+91 9712233445', event: 'Paper Presentation', passDetail: '3 Days Pass', eventIcon: FileText, eventColor: 'text-emerald-500',
      date: '21 - 23 Aug 2026', day: 'All 3 Days', passType: 'Paid', regNo: 'DEL-2026-0006', payStatus: 'Paid',
      amount: '₹ 2,500', regDate: '12 May 2026', regTime: '05:10 PM', avatar: 'https://randomuser.me/api/portraits/women/24.jpg'
    },
    {
      id: 7, name: 'Mr. Vikram Singh', email: 'vikram@bioherb.com', company: 'BioHerb Naturals',
      phone: '+91 9810044556', event: 'Conference', passDetail: 'Full Day Pass', eventIcon: MonitorPlay, eventColor: 'text-blue-500',
      date: '22 Aug 2026', day: 'Day 2', passType: 'Complementary', regNo: 'DEL-2026-0007', payStatus: '-',
      amount: '₹ 0', amountSub: 'Complimentary', regDate: '11 May 2026', regTime: '03:25 PM', avatar: 'https://randomuser.me/api/portraits/men/78.jpg'
    },
    {
      id: 8, name: 'Ms. Anjali Gupta', email: 'anjali@organicindia.com', company: 'Organic India Pvt. Ltd.',
      phone: '+91 9899987766', event: 'Poster Presentation', passDetail: '3 Days Pass', eventIcon: Presentation, eventColor: 'text-orange-500',
      date: '21 - 23 Aug 2026', day: 'All 3 Days', passType: 'Paid', regNo: 'DEL-2026-0008', payStatus: 'Partial',
      amount: '₹ 1,500 / ₹ 2,500', regDate: '11 May 2026', regTime: '10:45 AM', avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
    {
      id: 9, name: 'Mr. Karan Malhotra', email: 'karan@meditech.com', company: 'MediTech Solutions',
      phone: '+91 9878899000', event: 'Conference', passDetail: 'Day 3', eventIcon: MonitorPlay, eventColor: 'text-blue-500',
      date: '23 Aug 2026', day: 'Day 3', passType: 'Paid', regNo: 'DEL-2026-0009', payStatus: 'Paid',
      amount: '₹ 1,000', regDate: '10 May 2026', regTime: '06:30 PM', avatar: 'https://randomuser.me/api/portraits/men/55.jpg'
    },
    {
      id: 10, name: 'Ms. Ritika Tandon', email: 'ritika@ayushveda.com', company: 'Ayushveda Exports',
      phone: '+91 9871234500', event: 'Paper Presentation', passDetail: '3 Days Pass', eventIcon: FileText, eventColor: 'text-emerald-500',
      date: '21 - 23 Aug 2026', day: 'All 3 Days', passType: 'Paid', regNo: 'DEL-2026-0010', payStatus: 'Processing',
      amount: '₹ 2,000 / ₹ 2,500', regDate: '10 May 2026', regTime: '01:15 PM', avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
    }
  ];

  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-110px)] xl:h-[calc(100vh-110px)] flex flex-col font-sans text-slate-800 p-4 md:px-6 lg:px-8 xl:overflow-hidden">

      {/* TOP HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl text-slate-800 flex items-center gap-3">
            All Delegate Passes
            <span className="bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded-full">
              186
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage and track all delegate pass registrations for seminars, presentations and conference
          </p>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-4 shrink-0">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon size={16} />
              </div>
              <p className="text-md font-medium text-slate-600 tracking-wide">{stat.title}</p>
            </div>
            <div>
              <h3 className="text-lg text-slate-800">{stat.value}</h3>
              <p className={`text-[9px] ${stat.color}`}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="px-3 pt-4 pb-3 border border-slate-100 flex items-center justify-between gap-2 bg-white rounded-t-xl overflow-x-auto shrink-0">
        <div className="flex items-center gap-2 flex-nowrap min-w-0">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none w-[220px]"
            />
          </div>
          <select className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 focus:outline-none min-w-[140px]">
            <option>All Seminar / Event Types</option>
          </select>
          <select className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 focus:outline-none min-w-[120px]">
            <option>All Payment Status</option>
          </select>
          <select className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 focus:outline-none min-w-[110px]">
            <option>All Pass Types</option>
          </select>
          <select className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 focus:outline-none min-w-[120px]">
            <option>All Companies</option>
          </select>
          <div className="flex items-center gap-1.5 py-1.5 px-2 border border-slate-200 rounded text-[10px] bg-slate-50 text-slate-600">
            <Calendar size={12} className="text-slate-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] outline-none w-[85px] cursor-pointer text-slate-600" />
            <span className="text-slate-400">-</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] outline-none w-[85px] cursor-pointer text-slate-600" />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button className="flex items-center gap-1.5 py-1.5 px-3 rounded text-[10px] text-white hover:bg-red-600 shadow-sm" style={{ backgroundColor: '#EF4444' }}>
            <RefreshCw size={11} /> Clear Filters
          </button>
          <button className="flex items-center gap-1.5 py-1.5 px-3 rounded text-[10px] text-white hover:bg-emerald-600 shadow-sm" style={{ backgroundColor: '#10B981' }}>
            <Download size={11} /> Export
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-auto flex-grow relative custom-scrollbar bg-white border-l border-r border-b border-slate-200 rounded-b-xl">
        <table className="w-full text-left border-collapse whitespace-nowrap text-[10px]" style={{ fontFamily: 'Inter, sans-serif', color: '#15173D' }}>
          <thead className="sticky top-0 z-10">
            <tr className="text-white tracking-wider" style={{ backgroundColor: '#0A2947' }}>
              <th className="px-2 py-2 w-8 text-center">
                <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
              </th>
              <th className="px-2 py-2">Delegate Details</th>
              <th className="px-2 py-2">Company Name</th>
              <th className="px-2 py-2">Contact Details</th>
              <th className="px-2 py-2">Event / Registration For</th>
              <th className="px-2 py-2">Seminar Date</th>
              <th className="px-2 py-2">Pass Type</th>
              <th className="px-2 py-2">Registration No.</th>
              <th className="px-2 py-2 text-center">Payment Status</th>
              <th className="px-2 py-2">Amount</th>
              <th className="px-2 py-2">Registered On</th>
              <th className="px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {delegates.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 bg-white">
                <td className="px-2 py-3 text-center">
                  <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
                </td>

                <td className="px-2 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-slate-300">
                      <img src={row.avatar} alt={row.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-[11px]" style={{ color: '#093C5D' }}>{row.name}</div>
                      <div className="text-[9px] text-blue-600 hover:underline cursor-pointer">{row.email}</div>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-3">
                  <span className="text-[10px]">{row.company}</span>
                </td>

                <td className="px-2 py-3">
                  <div className="text-[10px]">{row.phone}</div>
                  <div className="text-[9px] text-slate-500">{row.email}</div>
                </td>

                <td className="px-2 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded ${row.eventColor.replace('text', 'bg').replace('500', '50')} flex items-center justify-center shrink-0`}>
                      <row.eventIcon size={10} className={row.eventColor} />
                    </div>
                    <div>
                      <div className="text-[10px]">{row.event}</div>
                      <div className="text-[9px] text-slate-500">{row.passDetail}</div>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-3">
                  <div className="text-[10px]">{row.date}</div>
                  <div className="text-[9px] text-purple-600 bg-purple-50 px-1 py-0.5 rounded inline-block mt-0.5">{row.day}</div>
                </td>

                <td className="px-2 py-3">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${row.passType === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                    {row.passType}
                  </span>
                </td>

                <td className="px-2 py-3">
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{row.regNo}</span>
                </td>

                <td className="px-2 py-3 text-center">
                  {row.payStatus !== '-' ? (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${row.payStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                      row.payStatus === 'Partial' ? 'bg-blue-50 text-blue-700' :
                        'bg-orange-50 text-orange-700'
                      }`}>
                      <span className={`w-1 h-1 rounded-full ${row.payStatus === 'Paid' ? 'bg-emerald-500' :
                        row.payStatus === 'Partial' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}></span>
                      {row.payStatus}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>

                <td className="px-2 py-3">
                  <div className="text-[10px]">{row.amount}</div>
                  {row.amountSub && <div className="text-[9px] text-slate-500">{row.amountSub}</div>}
                </td>

                <td className="px-2 py-3">
                  <div className="text-[10px]">{row.regDate}</div>
                  <div className="text-[9px] text-slate-500">{row.regTime}</div>
                </td>

                <td className="px-2 py-3 text-right">
                  <button className="text-slate-400 hover:text-slate-700">
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-2 border-t border-slate-100 bg-white flex items-center justify-between text-[10px] text-slate-600 rounded-b-xl shrink-0">
        <div>
          Showing 1 to 10 of 186 entries
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><ChevronsLeft size={12} /></button>
          <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><ChevronLeft size={12} /></button>

          <button className="w-5 h-5 flex items-center justify-center text-white bg-[#0A2947] rounded">1</button>
          <button className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded">2</button>
          <button className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded">3</button>
          <span className="text-slate-400">...</span>
          <button className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded">19</button>

          <button className="p-1 text-slate-400 hover:text-slate-600"><ChevronRight size={12} /></button>
          <button className="p-1 text-slate-400 hover:text-slate-600"><ChevronsRight size={12} /></button>

          <select className="ml-2 px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none">
            <option>10 per page</option>
            <option>25 per page</option>
            <option>50 per page</option>
          </select>
        </div>
      </div>

    </div>
  );
};

export default DelegatePasses;
