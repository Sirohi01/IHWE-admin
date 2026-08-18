import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { fetchHealthCampVisitors } from "../../features/visitor/freeHealthCampSlice";
import ClientOverview from "../../components/ClientOverview";
import BaseLeadPage from "../../layout/BaseLeadPage";
import { Search, MoreVertical, RefreshCw, Users, Clock, CalendarDays, CalendarCheck, CheckCircle } from "lucide-react";
import { FaWhatsapp } from 'react-icons/fa';
import BulkUploadModal from "../../components/BulkUploadModal";

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numTarget = parseFloat(target) || 0;
    if (numTarget === 0) {
      const frame = requestAnimationFrame(() => setCount(0));
      return () => cancelAnimationFrame(frame);
    }
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(ease * numTarget);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { ref, count };
}

const HealthCampVisitorsList = () => {
  const dispatch = useDispatch();
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalQrCode, setModalQrCode] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Local pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { healthCampVisitors, loading } = useSelector(
    (state) => state.healthCampVisitors,
  );

  useEffect(() => {
    dispatch(fetchHealthCampVisitors());
  }, [dispatch]);

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    const time = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month} ${year} | ${time}`;
  };

  const handleBulkResend = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one visitor to resend passes.");
      return;
    }
    const types = ["whatsapp"];
    if (window.confirm(`Are you sure you want to resend WhatsApp passes to ${selectedRows.length} visitor(s)?`)) {
      try {
        const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
        const res = await fetch(`${SERVER_URL}/api/health-camp-visitors/bulk-resend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorIds: selectedRows, types })
        });
        const data = await res.json();
        if (data.success) {
          alert("WhatsApp messages sent successfully!");
          setSelectedRows([]);
        } else {
          alert(data.message || "Failed to send messages.");
        }
      } catch (error) {
        console.error("Error resending messages:", error);
        alert("An error occurred while sending messages.");
      }
    }
  };

  const handleExport = () => {
    const dataToExport = filteredVisitors.map((v, i) => ({
      "#": i + 1,
      "Registration ID": v.registrationId || "-",
      "First Name": v.firstName || "-",
      "Last Name": v.lastName || "-",
      "Mobile": v.mobile || "-",
      "Email": v.email || "-",
      "Status": v.status || "-",
      "Preferred Date": v.preferredDate || "-",
      "Preferred Time Slot": v.preferredTimeSlot || "-",
      "City": v.city || "-",
      "State": v.state || "-",
      "Created At": formatDateTime(v.createdAt),
      "Updated At": formatDateTime(v.updatedAt),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Health Camp Visitors");
    XLSX.writeFile(workbook, "HealthCampVisitors.xlsx");
  };

  const toggleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Filter and paginate locally since API might return all
  const filteredVisitors = healthCampVisitors.filter(v => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (v.firstName && v.firstName.toLowerCase().includes(term)) ||
      (v.lastName && v.lastName.toLowerCase().includes(term)) ||
      (v.mobile && v.mobile.toLowerCase().includes(term)) ||
      (v.email && v.email.toLowerCase().includes(term)) ||
      (v.registrationId && v.registrationId.toLowerCase().includes(term))
    );
  });
  
  const totalPages = Math.ceil(filteredVisitors.length / limit) || 1;
  const paginatedVisitors = filteredVisitors.slice((page - 1) * limit, page * limit);

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const totalStats = healthCampVisitors.length;
  const todaysStats = healthCampVisitors.filter(v => new Date(v.createdAt) >= startOfToday).length;
  const thisWeekStats = healthCampVisitors.filter(v => new Date(v.createdAt) >= startOfWeek).length;
  const thisMonthStats = healthCampVisitors.filter(v => new Date(v.createdAt) >= startOfMonth).length;
  const approvedStats = healthCampVisitors.filter(v => (v.status || "").toLowerCase().includes('approved')).length;

  function AnimatedStatCard({ icon, gradientTo, iconBg, rawValue, displayValue, label, subLabel, subColor }) {
    const { ref, count } = useCountUp(rawValue);
    return (
      <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} p-3 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`w-9 h-9 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>
              {icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                {displayValue(count)}
              </span>
              <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          </div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: subColor, textAlign: 'center', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{subLabel}</div>
        </div>
      </div>
    );
  }

  const statCards = (
    <>
      <AnimatedStatCard
        icon={<Users className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
        gradientTo="to-emerald-50" iconBg="bg-emerald-100"
        rawValue={totalStats}
        displayValue={(c) => Math.round(c)}
        label="TOTAL VISITORS"
        subLabel="All time" subColor="#059669"
      />
      <AnimatedStatCard
        icon={<Clock className="w-5 h-5 text-blue-600" strokeWidth={2.5} />}
        gradientTo="to-blue-50" iconBg="bg-blue-100"
        rawValue={todaysStats}
        displayValue={(c) => Math.round(c)}
        label="TODAY'S VISITORS"
        subLabel="Registered today" subColor="#2563eb"
      />
      <AnimatedStatCard
        icon={<CalendarDays className="w-5 h-5 text-purple-600" strokeWidth={2.5} />}
        gradientTo="to-purple-50" iconBg="bg-purple-100"
        rawValue={thisWeekStats}
        displayValue={(c) => Math.round(c)}
        label="THIS WEEK"
        subLabel="Registered this week" subColor="#9333ea"
      />
      <AnimatedStatCard
        icon={<CalendarCheck className="w-5 h-5 text-orange-600" strokeWidth={2.5} />}
        gradientTo="to-orange-50" iconBg="bg-orange-100"
        rawValue={thisMonthStats}
        displayValue={(c) => Math.round(c)}
        label="THIS MONTH"
        subLabel="Registered this month" subColor="#ea580c"
      />
      <AnimatedStatCard
        icon={<CheckCircle className="w-5 h-5 text-cyan-600" strokeWidth={2.5} />}
        gradientTo="to-cyan-50" iconBg="bg-cyan-100"
        rawValue={approvedStats}
        displayValue={(c) => Math.round(c)}
        label="APPROVED PASSES"
        subLabel="Ready to enter" subColor="#0891b2"
      />
    </>
  );

  // Define components for BaseLeadPage
  const headerActions = (
    <div className="flex items-center gap-2">
      <button onClick={() => dispatch(fetchHealthCampVisitors())} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" title="Refresh">
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      </button>
      <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold border border-blue-100 transition-colors">
        <Users size={12} />
        Bulk Upload
      </button>
      <button onClick={handleBulkResend} disabled={selectedRows.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold border border-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <FaWhatsapp size={12} />
        Resend Visitor Pass ({selectedRows.length})
      </button>
    </div>
  );

  const filterBar = (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full">
      <div className="relative w-full sm:w-64 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <Search size={12} className="text-slate-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search visitors..." 
          className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );

  const tableHeadersComponent = (
    <>
      <th className="px-2 py-2 font-medium">Registration ID</th>
      <th className="px-2 py-2 font-medium">Visitor Details</th>
      <th className="px-2 py-2 font-medium">Contact</th>
      <th className="px-2 py-2 font-medium text-center">Status</th>
      <th className="px-2 py-2 font-medium">Appointment</th>
      <th className="px-2 py-2 font-medium">City & State</th>
      <th className="px-2 py-2 font-medium text-center">QR Code</th>
      <th className="px-2 py-2 font-medium">Created / Updated</th>
    </>
  );

  const tableBodyContent = (
    <>
      {loading ? (
        [...Array(10)].map((_, index) => (
          <tr key={`skeleton-${index}`} className="animate-pulse border-b border-slate-100 bg-white">
            <td className="px-2 py-3 text-center"><div className="w-3 h-3 bg-slate-200 rounded-sm mx-auto"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-20 bg-slate-200 rounded"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-32 bg-slate-200 rounded mb-1"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded mb-1"></div></td>
            <td className="px-2 py-3 text-center"><div className="h-4 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-20 bg-slate-200 rounded"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
            <td className="px-2 py-3 text-center"><div className="w-8 h-8 bg-slate-200 rounded mx-auto"></div></td>
            <td className="px-2 py-3"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
          </tr>
        ))
      ) : paginatedVisitors.length === 0 ? (
        <tr><td colSpan="10" className="text-center py-8 text-slate-500 text-[11px]">No health camp visitors found.</td></tr>
      ) : (
        paginatedVisitors.map((row, i) => {
          const status = row.status || "Pending";
          let statusBg = "bg-slate-50 text-slate-700";
          if (status.toLowerCase().includes('approved')) statusBg = "bg-emerald-50 text-emerald-700";
          if (status.toLowerCase().includes('rejected')) statusBg = "bg-red-50 text-red-700";

          return (
            <tr key={row._id || i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 bg-white">
              <td className="px-2 py-2 text-center">
                <input type="checkbox" checked={selectedRows.includes(row._id)} onChange={() => toggleRowSelection(row._id)} className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
              </td>
              <td className="px-2 py-2">
                <div className="font-bold text-[10px] text-slate-600">{row.registrationId || "N/A"}</div>
              </td>
              <td className="px-2 py-2">
                <div className="font-bold text-[11px] cursor-pointer hover:text-emerald-600 hover:underline" style={{ color: '#093C5D', fontFamily: 'Inter, sans-serif' }}>
                  <Link to={`/webVisitorData/healthCampVisitorDetails/${row._id}`}>{toTitleCase(`${row.firstName || ""} ${row.lastName || ""}`)}</Link>
                </div>
              </td>
              <td className="px-2 py-2">
                <div className="text-[10px] text-slate-700 font-semibold">{row.mobile}</div>
                <div className="text-[9px] text-slate-500">{row.email}</div>
              </td>
              <td className="px-2 py-2 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBg} border-transparent`}>
                  {toTitleCase(status)}
                </span>
              </td>
              <td className="px-2 py-2">
                <div className="text-[9px] font-bold text-slate-700">{row.preferredDate || "N/A"}</div>
                <div className="text-[9px] text-slate-500">{row.preferredTimeSlot || ""}</div>
              </td>
              <td className="px-2 py-2">
                <div className="text-[9px] font-semibold text-slate-700">{toTitleCase(row.city)}</div>
                <div className="text-[9px] text-slate-500">{toTitleCase(row.state)}</div>
              </td>
              <td className="px-2 py-2 text-center">
                {row.qrCode ? (
                  <img loading="lazy" decoding="async" src={row.qrCode} alt="QR Code" className="w-8 h-8 object-contain mx-auto cursor-pointer border rounded" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalQrCode(row.qrCode); }} />
                ) : (
                  <span className="text-[9px] text-slate-400">N/A</span>
                )}
              </td>
              <td className="px-2 py-1.5">
                <div className="text-[9px] text-slate-600 whitespace-nowrap">
                  <span className="font-semibold">C:</span> {row.created_by ? `${row.created_by} | ` : ''}{formatDateTime(row.createdAt)}
                </div>
                {row.updatedAt && (
                  <div className="text-[9px] text-slate-600 whitespace-nowrap mt-0.5">
                    <span className="font-semibold">U:</span> {row.updated_by ? `${row.updated_by} | ` : ''}{formatDateTime(row.updatedAt)}
                  </div>
                )}
              </td>
            </tr>
          );
        })
      )}
    </>
  );

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const paginationBar = (
    <>
      <div className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Showing</span>
        <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100" style={{ color: '#016B61' }}>
          {filteredVisitors.length === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, filteredVisitors.length)}
        </span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>of</span>
        <span className="text-[11px] font-black" style={{ color: '#15173D' }}>{filteredVisitors.length}</span>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>visitors</span>
      </div>
      <div className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
        <button onClick={() => setPage(1)} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>«</button>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>‹</button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="w-7 h-7 flex items-center justify-center text-[11px] text-slate-400 font-bold">…</span>
          ) : (
            <button key={p} onClick={() => setPage(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all duration-200" style={p === page ? { backgroundColor: '#016B61', color: '#fff', borderColor: '#016B61', boxShadow: '0 2px 8px rgba(1,107,97,0.3)' } : { backgroundColor: '#fff', color: '#15173D', borderColor: '#e2e8f0' }}>{p}</button>
          )
        )}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>›</button>
        <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100" style={{ borderColor: '#e2e8f0', color: '#334155' }}>»</button>
      </div>
      <div className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="text-[11px] font-bold" style={{ color: '#334155' }}>Rows:</span>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded-lg py-1 px-2 bg-white outline-none cursor-pointer text-[11px] font-bold" style={{ borderColor: '#e2e8f0', color: '#15173D', fontFamily: 'Inter, sans-serif' }}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </>
  );

  return (
    <>
      {selectedClient ? (
        <ClientOverview client={selectedClient} onBack={() => setSelectedClient(null)} />
      ) : (
        <BaseLeadPage
          title="Health Camp Visitors"
          subtitle="Manage all health camp registrations and visitors"
          cardsInRow={5}
          statCards={statCards}
          headerActions={headerActions}
          filterBar={filterBar}
          onExport={handleExport}
          tableHeaders={tableHeadersComponent}
          tableBody={tableBodyContent}
          pagination={paginationBar}
          isAllSelected={paginatedVisitors.length > 0 && selectedRows.length === paginatedVisitors.length}
          onSelectAll={(e) => setSelectedRows(e.target.checked ? paginatedVisitors.map(v => v._id) : [])}
          onReset={() => {
            setSearchTerm('');
            setPage(1);
          }}
        />
      )}

      {/* QR Code Modal */}
      {modalQrCode && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={(e) => { e.stopPropagation(); setModalQrCode(null); }}>
          <div className="bg-white p-4 rounded-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl" onClick={(e) => { e.stopPropagation(); setModalQrCode(null); }}>✕</button>
            <h3 className="text-lg font-medium text-center mb-4 mt-2">Visitor QR Code</h3>
            <img loading="lazy" decoding="async" src={modalQrCode} alt="Enlarged QR Code" className="w-64 h-64 object-contain" />
          </div>
        </div>
      )}

      <BulkUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadUrl="/api/health-camp-visitors/upload"
        templatePath="/templates/HealthCampVisitorTemplate.xlsx"
        title="Bulk Upload Health Camp Visitors"
        onSuccess={() => dispatch(fetchHealthCampVisitors())}
      />
    </>
  );
};

export default HealthCampVisitorsList;
