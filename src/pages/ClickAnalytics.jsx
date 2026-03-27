import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MessageCircle, 
  Phone, 
  Share2, 
  Search,
  Calendar,
  MousePointer2,
  Clock,
  CalendarCheck,
  LayoutDashboard
} from 'lucide-react';
import api from "../lib/api";
import Pagination from "../components/Pagination";
import Table from '../components/table/Table';
import PageHeader from "../components/PageHeader";
import Swal from 'sweetalert2';

const ClickAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    stats: { total: 0, whatsapp: 0, call: 0, social: 0, bookMeeting: 0 },
    logs: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("today");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchAnalytics = async (page = 1) => {
    try {
      setIsLoading(true);
      let url = `/api/analytics/stats?page=${page}&limit=25`;

      if (filterType === "daily" && selectedDate) {
        url += `&date=${selectedDate}`;
      } else if (filterType === "range" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else if (filterType === "weekly" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else if (filterType === "monthly" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await api.get(url);
      if (response.data.success) {
        setAnalyticsData({
          stats: response.data.data.stats,
          logs: response.data.data.logs
        });
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (type, val1 = "", val2 = "") => {
    setFilterType(type);
    setCurrentPage(1);
    
    if (type === 'today') {
      setSelectedDate("");
      setStartDate("");
      setEndDate("");
    } else if (type === 'daily') {
      setSelectedDate(val1);
      setStartDate("");
      setEndDate("");
    } else if (type === 'weekly') {
      if (val1) {
        const d = new Date(val1);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        const start = new Date(d.setDate(diff));
        const end = new Date(d.setDate(diff + 6));
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
      }
    } else if (type === 'monthly') {
      if (val1) {
        const [year, month] = val1.split('-');
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
      }
    } else if (type === 'range') {
      if (val1) setStartDate(val1);
      if (val2) setEndDate(val2);
    }
  };

  useEffect(() => {
    fetchAnalytics(currentPage);
  }, [currentPage, selectedDate, startDate, endDate, filterType]);

  const stats = [
    {
      title: "TOTAL CLICKS",
      value: analyticsData.stats.total,
      desc: "Total interactions ",
      icon: TrendingUp,
      iconBg: "bg-slate-800",
      bg: "bg-slate-50",
      text: "text-slate-800",
      accent: "border-slate-800"
    },
    {
      title: "WHATSAPP",
      value: analyticsData.stats.whatsapp,
      desc: "WhatsApp chat clicks",
      icon: MessageCircle,
      iconBg: "bg-[#25D366]",
      bg: "bg-green-50",
      text: "text-green-600",
      accent: "border-[#25D366]"
    },
    {
      title: "CALL FLOAT",
      value: analyticsData.stats.call,
      desc: "Direct phone calls",
      icon: Phone,
      iconBg: "bg-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
      accent: "border-blue-600"
    },
    {
      title: "BOOK MEETING",
      value: analyticsData.stats.bookMeeting,
      desc: "Meeting requests",
      icon: CalendarCheck,
      iconBg: "bg-[#d26019]",
      bg: "bg-orange-50",
      text: "text-[#d26019]",
      accent: "border-[#d26019]"
    },
    {
      title: "SOCIAL CLICKS",
      value: analyticsData.stats.social,
      desc: "Social media icons",
      icon: Share2,
      iconBg: "bg-[#134698]",
      bg: "bg-indigo-50",
      text: "text-[#134698]",
      accent: "border-[#134698]"
    },
  ];

  const columns = [
    {
      key: "sno",
      label: "S.NO",
      width: "80px",
      render: (row, index) => (
        <div className="font-bold text-gray-900 border-r-2 border-gray-100 pr-2">
          {(currentPage - 1) * 25 + index + 1}
        </div>
      )
    },
    {
      key: "icon",
      label: "INTERACTED ICON",
      render: (row) => {
        const name = row.iconName.toLowerCase();
        const isWhatsapp = name.includes('whatsapp');
        const isCall = name.includes('call');
        const isBook = name.includes('book') || name.includes('register');
        return (
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${
              isWhatsapp ? 'bg-green-50' : isCall ? 'bg-blue-50' : isBook ? 'bg-orange-50' : 'bg-indigo-50'
            }`}>
              {isWhatsapp ? (
                <MessageCircle className="w-4 h-4 text-green-600" />
              ) : isCall ? (
                <Phone className="w-4 h-4 text-blue-600" />
              ) : isBook ? (
                <CalendarCheck className="w-4 h-4 text-orange-600" />
              ) : (
                <Share2 className="w-4 h-4 text-indigo-600" />
              )}
            </div>
            <span className="font-medium text-gray-900 uppercase text-xs tracking-wider">
              {row.iconName}
            </span>
          </div>
        );
      }
    },
    {
      key: "ip",
      label: "IP ADDRESS",
      render: (row) => (
        <div className="flex items-center gap-2 font-mono text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded border border-gray-200 w-fit">
          <MousePointer2 className="w-3 h-3 text-gray-400" />
          {row.ipAddress}
        </div>
      )
    },
    {
      key: "time",
      label: "CLICKED AT",
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-gray-900 font-medium text-sm">
            <Calendar className="w-3.5 h-3.5 text-[#23471d]" />
            {new Date(row.timestamp).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(row.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <div className="w-full">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#23471d] uppercase tracking-tight">CLICK ANALYTICS</h1>
            <p className="text-gray-600 mt-2 text-lg italic">Track and monitor all user interactions on floating website widgets and buttons</p>
        </div>

        <div className="space-y-8">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white border-2 border-gray-100 p-6 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden rounded-xl"
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${item.iconBg} opacity-15 rounded-full -mr-10 -mt-10 transition-all duration-700 group-hover:scale-150`} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${item.iconBg} flex items-center justify-center rounded-lg shadow-inner`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-black ${item.bg} ${item.text} border-2 ${item.accent}`}>
                        0{index + 1}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className={`text-4xl font-black ${item.text} mb-1 tracking-tighter`}>
                        {item.value}
                      </p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-2 font-medium italic">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-xl rounded-t-xl">
            <div className="px-6 py-5 border-b bg-[#23471d]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Detailed Interacted Logs</h2>
                        <p className="text-xs text-green-100 mt-0.5 font-medium">Analysis of current active logged interactions</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="h-10 px-4 text-[11px] font-bold border-2 border-white/20 focus:outline-none focus:border-white shadow-lg bg-[#1a3516] text-white uppercase tracking-wider rounded"
                  >
                    <option value="today">Today</option>
                    <option value="daily">Select Date</option>
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                    <option value="range">Custom Range</option>
                  </select>

                  {filterType === "daily" && (
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleFilterChange("daily", e.target.value)}
                      className="h-10 px-3 text-[11px] font-bold border-2 border-white/20 focus:outline-none focus:border-white shadow-lg bg-[#1a3516] text-white uppercase tracking-wider rounded"
                    />
                  )}

                  {filterType === "weekly" && (
                    <input
                      type="date"
                      onChange={(e) => handleFilterChange("weekly", e.target.value)}
                      className="h-10 px-3 text-[11px] font-bold border-2 border-white/20 focus:outline-none focus:border-white shadow-lg bg-[#1a3516] text-white uppercase tracking-wider rounded"
                    />
                  )}

                  {filterType === "monthly" && (
                    <input
                      type="month"
                      onChange={(e) => handleFilterChange("monthly", e.target.value)}
                      className="h-10 px-3 text-[11px] font-bold border-2 border-white/20 focus:outline-none focus:border-white shadow-lg bg-[#1a3516] text-white uppercase tracking-wider rounded"
                    />
                  )}

                  {filterType === "range" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleFilterChange("range", e.target.value, endDate)}
                        className="h-10 px-3 text-[11px] font-bold border-2 border-white/20 focus:outline-none focus:border-white shadow-lg bg-[#1a3516] text-white uppercase tracking-wider rounded"
                      />
                      <span className="text-white text-[10px] font-black">TO</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleFilterChange("range", startDate, e.target.value)}
                        className="h-10 px-3 text-[11px] font-bold border-2 border-white/20 focus:outline-none focus:border-white shadow-lg bg-[#1a3516] text-white uppercase tracking-wider rounded"
                      />
                    </div>
                  )}

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-200" />
                    <input
                      type="text"
                      placeholder="SEARCH LOGS BY NAME OR IP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 text-[10px] font-bold border-2 border-white/20 focus:outline-none focus:border-white shadow-lg bg-[#1a3516] text-white uppercase tracking-wider rounded placeholder:text-green-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <Table
                columns={columns}
                data={analyticsData.logs.filter(log => 
                  log.iconName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  log.ipAddress.includes(searchTerm)
                )}
                showActions={false}
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center rounded-b-xl">
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Total Pages Found: {totalPages}
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={totalPages * 25}
                itemsPerPage={25}
                onPageChange={setCurrentPage}
                label="logs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClickAnalytics;
