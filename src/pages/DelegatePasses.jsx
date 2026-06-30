import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Download, Filter, Search, Users, Clock, CheckCircle2,
  CreditCard, XCircle, MoreVertical, Calendar, RefreshCw,
  Presentation, FileText, MonitorPlay, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, IndianRupee
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DelegatePasses = () => {
  const [delegates, setDelegates] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ totalPaid: 0, totalPending: 0, totalRevenue: 0, globalTotal: 0 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/delegate/admin/registrations`, {
        params: {
          page,
          limit,
          search: debouncedSearch,
          paymentStatus: paymentStatus !== 'All Payment Status' ? paymentStatus : '',
          startDate,
          endDate
        }
      });
      if (res.data.success) {
        setDelegates(res.data.registrations);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setStats({
          totalPaid: res.data.totalPaid || 0,
          totalPending: res.data.totalPending || 0,
          totalRevenue: res.data.totalRevenue || 0,
          globalTotal: res.data.globalTotal || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch registrations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [page, limit, debouncedSearch, paymentStatus, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setPaymentStatus('All Payment Status');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Generate avatar based on name initials
  const getAvatar = (name) => {
    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'D';
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
  };

  const getPaymentStatusColor = (status) => {
    if (status === 'paid') return 'bg-emerald-50 text-emerald-700 marker-emerald-500';
    if (status === 'pending') return 'bg-orange-50 text-orange-700 marker-orange-500';
    if (status === 'failed') return 'bg-red-50 text-red-700 marker-red-500';
    return 'bg-slate-50 text-slate-700 marker-slate-500';
  };

  // Formatting passes & sessions for display
  const getEventDisplay = (row) => {
    const hasSessions = row.sessions?.length > 0;
    const hasPasses = row.specialPasses?.length > 0;
    
    let eventName = "Event Registration";
    let passDetail = "Standard";
    let icon = MonitorPlay;
    let color = 'text-blue-500';

    if (hasPasses) {
      eventName = "Pass Purchased";
      passDetail = row.specialPasses.map(p => p.title).join(', ');
      icon = CreditCard;
      color = 'text-purple-500';
    } else if (hasSessions) {
      eventName = "Sessions Booked";
      passDetail = row.sessions.length > 1 ? `${row.sessions.length} Sessions` : row.sessions[0].title;
      icon = Presentation;
      color = 'text-emerald-500';
    }

    return { eventName, passDetail, icon, color };
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-110px)] xl:h-[calc(100vh-110px)] flex flex-col font-sans text-slate-800 p-4 md:px-6 lg:px-8 xl:overflow-hidden">

      {/* TOP HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl text-slate-800 flex items-center gap-3">
            All Delegate Passes
            <span className="bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded-full">
              {total}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage and track all delegate pass registrations for seminars, presentations and conference
          </p>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 shrink-0">
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
              <Users size={16} />
            </div>
            <p className="text-md font-medium text-slate-600 tracking-wide">Total Passes</p>
          </div>
          <div>
            <h3 className="text-lg text-slate-800">{stats.globalTotal}</h3>
            <p className="text-[9px] text-blue-600">All Time Registrations</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            <p className="text-md font-medium text-slate-600 tracking-wide">Paid Passes</p>
          </div>
          <div>
            <h3 className="text-lg text-slate-800">{stats.totalPaid}</h3>
            <p className="text-[9px] text-emerald-600">Successfully Paid</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-orange-50 text-orange-600">
              <Clock size={16} />
            </div>
            <p className="text-md font-medium text-slate-600 tracking-wide">Pending Passes</p>
          </div>
          <div>
            <h3 className="text-lg text-slate-800">{stats.totalPending}</h3>
            <p className="text-[9px] text-orange-600">Payment Pending</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-purple-50 text-purple-600">
              <IndianRupee size={16} />
            </div>
            <p className="text-md font-medium text-slate-600 tracking-wide">Total Revenue</p>
          </div>
          <div>
            <h3 className="text-lg text-slate-800">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
            <p className="text-[9px] text-purple-600">From Paid Passes</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-3 pt-4 pb-3 border border-slate-100 flex items-center justify-between gap-2 bg-white rounded-t-xl overflow-x-auto shrink-0">
        <div className="flex items-center gap-2 flex-nowrap min-w-0">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, email or reg no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none w-[220px]"
            />
          </div>
          <select 
            value={paymentStatus} 
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 focus:outline-none min-w-[120px]">
            <option>All Payment Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <div className="flex items-center gap-1.5 py-1.5 px-2 border border-slate-200 rounded text-[10px] bg-slate-50 text-slate-600">
            <Calendar size={12} className="text-slate-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] outline-none w-[85px] cursor-pointer text-slate-600" />
            <span className="text-slate-400">-</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] outline-none w-[85px] cursor-pointer text-slate-600" />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button onClick={clearFilters} className="flex items-center gap-1.5 py-1.5 px-3 rounded text-[10px] text-white hover:bg-red-600 shadow-sm" style={{ backgroundColor: '#EF4444' }}>
            <RefreshCw size={11} /> Clear Filters
          </button>
          <button onClick={fetchRegistrations} className="flex items-center gap-1.5 py-1.5 px-3 rounded text-[10px] text-white hover:bg-blue-600 shadow-sm" style={{ backgroundColor: '#3B82F6' }}>
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-auto flex-grow relative custom-scrollbar bg-white border-l border-r border-b border-slate-200 rounded-b-xl">
        {loading ? (
           <div className="flex justify-center items-center h-full text-slate-500 flex-col gap-2">
             <RefreshCw className="animate-spin text-blue-500" size={24}/>
             <span className="text-xs">Loading Live Data...</span>
           </div>
        ) : delegates.length === 0 ? (
           <div className="flex justify-center items-center h-full text-slate-500 text-sm">
             No registrations found.
           </div>
        ) : (
        <table className="w-full text-left border-collapse whitespace-nowrap text-[10px]" style={{ fontFamily: 'Inter, sans-serif', color: '#15173D' }}>
          <thead className="sticky top-0 z-10">
            <tr className="text-white tracking-wider" style={{ backgroundColor: '#0A2947' }}>
              <th className="px-2 py-2">Delegate Details</th>
              <th className="px-2 py-2">Organization</th>
              <th className="px-2 py-2">Contact Details</th>
              <th className="px-2 py-2">Event / Registration For</th>
              <th className="px-2 py-2">Registration No.</th>
              <th className="px-2 py-2 text-center">Payment Status</th>
              <th className="px-2 py-2">Total Amount</th>
              <th className="px-2 py-2">Registered On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {delegates.map((row) => {
              const display = getEventDisplay(row);
              const statusColor = getPaymentStatusColor(row.paymentStatus);
              return (
              <tr key={row._id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 bg-white">
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-slate-300">
                      <img src={row.profileImage ? `${API_URL.replace('/api', '')}${row.profileImage}` : getAvatar(row.fullName)} alt={row.fullName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold" style={{ color: '#093C5D' }}>{row.title} {row.fullName}</div>
                      <div className="text-[9px] text-slate-500">{row.designation}</div>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-3">
                  <span className="text-[10px] font-medium">{row.organization}</span>
                  <div className="text-[9px] text-slate-500">{row.typeOfBusiness} | {row.industrySector}</div>
                </td>

                <td className="px-2 py-3">
                  <div className="text-[10px]">{row.mobile}</div>
                  <div className="text-[9px] text-blue-600">{row.email}</div>
                </td>

                <td className="px-2 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded ${display.color.replace('text', 'bg').replace('500', '50')} flex items-center justify-center shrink-0`}>
                      <display.icon size={10} className={display.color} />
                    </div>
                    <div>
                      <div className="text-[10px]">{display.eventName}</div>
                      <div className="text-[9px] text-slate-500 max-w-[150px] truncate">{display.passDetail}</div>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-3">
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{row.regNo || 'N/A'}</span>
                </td>

                <td className="px-2 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${statusColor.split(' marker-')[0]}`}>
                    <span className={`w-1 h-1 rounded-full ${statusColor.split(' marker-')[1]}`}></span>
                    {row.paymentStatus || 'pending'}
                  </span>
                </td>

                <td className="px-2 py-3">
                  <div className="text-[11px] font-semibold flex items-center"><IndianRupee size={10}/> {row.totalAmount}</div>
                  <div className="text-[8px] text-slate-500">Sub: ₹{row.subTotal} + GST/Fee</div>
                </td>

                <td className="px-2 py-3">
                  <div className="text-[10px]">{new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div className="text-[9px] text-slate-500">{new Date(row.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        )}
      </div>

      {/* Pagination */}
      <div className="p-2 border-t border-slate-100 bg-white flex items-center justify-between text-[10px] text-slate-600 rounded-b-xl shrink-0">
        <div>
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(1)}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><ChevronsLeft size={12} /></button>
          <button 
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><ChevronLeft size={12} /></button>

          <span className="px-2">Page {page} of {totalPages}</span>

          <button 
            disabled={page === totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><ChevronRight size={12} /></button>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"><ChevronsRight size={12} /></button>

          <select 
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="ml-2 px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none">
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

    </div>
  );
};

export default DelegatePasses;
