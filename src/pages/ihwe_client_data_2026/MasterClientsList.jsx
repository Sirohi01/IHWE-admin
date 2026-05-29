import React, { useRef, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ClientOverview from "../../components/ClientOverview";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanies } from "../../features/company/companySlice";
import {
  FaSearch, FaPlus, FaUpload, FaWhatsapp, FaDownload,
  FaFilter, FaRedo, FaChevronLeft, FaChevronRight, FaRegStar, FaStar
} from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";

// Helper to safely extract an array from any Redux slice
const getArrayFromSlice = (sliceState, fallbackKey = "companies") => {
  if (Array.isArray(sliceState)) return sliceState;
  if (
    sliceState &&
    typeof sliceState === "object" &&
    fallbackKey in sliceState &&
    Array.isArray(sliceState[fallbackKey])
  ) {
    return sliceState[fallbackKey];
  }
  return [];
};

const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const MasterClientsList = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const printref = useRef();
  const dispatch = useDispatch();

  const companiesState = useSelector((state) => state.companies);
  const companiesArray = Array.isArray(companiesState?.companies) ? companiesState.companies : [];
  const pagination = companiesState?.pagination;
  const isLoading = companiesState?.loading ?? false;
  const error = companiesState?.error ?? null;

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    let total = companiesArray.length;
    let newLeads = 0;
    let contacted = 0;
    let interested = 0;
    let notContacted = 0;
    let converted = 0;

    companiesArray.forEach((c) => {
      const status = (c.companyStatus || "").toLowerCase();
      if (status.includes("new")) newLeads++;
      else if (status.includes("contacted") && !status.includes("not")) contacted++;
      else if (status.includes("interested")) interested++;
      else if (status.includes("not contacted") || status.includes("pending")) notContacted++;
      else if (status.includes("convert") || status.includes("win")) converted++;
    });

    const getPct = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

    return {
      total,
      newLeads: { count: newLeads, pct: getPct(newLeads) },
      contacted: { count: contacted, pct: getPct(contacted) },
      interested: { count: interested, pct: getPct(interested) },
      notContacted: { count: notContacted, pct: getPct(notContacted) },
      converted: { count: converted, pct: getPct(converted) },
    };
  }, [companiesArray]);

  // --- FILTER & PAGINATION STATE ---
  const [globalSearch, setGlobalSearch] = useState("");
  const [filters, setFilters] = useState({
    source: "",
    status: "",
    industry: "",
    handledBy: "",
    cityState: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchCompanies({
        page: currentPage,
        limit: pageSize,
        search: globalSearch,
        status: filters.status,
        source: filters.source,
        industry: filters.industry
      }));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, currentPage, pageSize, globalSearch, filters.status, filters.source, filters.industry]);

  // --- FILTERING LOGIC ---
  // Now handled by the backend, so we just use the array directly
  const filteredRows = companiesArray;

  const totalPages = pagination?.totalPages || 1;
  const totalCount = pagination?.total || filteredRows.length;
  const paginatedRows = filteredRows;

  // --- ACTIONS ---
  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedRows.length && paginatedRows.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedRows.map((r) => r._id));
    }
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setGlobalSearch("");
    setFilters({
      source: "",
      status: "",
      industry: "",
      handledBy: "",
      cityState: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  const exportTableToExcel = () => {
    const dataToExport = filteredRows.map((c, i) => ({
      "#": i + 1,
      "Company Name": c.companyName || "-",
      "Source": c.dataSource || "-",
      "Status": c.companyStatus || "-",
      "Industry": c.businessNature || "-",
      "City / State": `${c.city || "-"}, ${c.state || "-"}`,
      "Handled By": c.forwardTo || "-",
      "Lead Score": c.leadScore || 0,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "AllLeads.xlsx");
  };

  // Extract unique options for dropdowns
  const uniqueSources = [...new Set(companiesArray.map(c => c.dataSource).filter(Boolean))];
  const uniqueStatuses = [...new Set(companiesArray.map(c => c.companyStatus).filter(Boolean))];
  const uniqueIndustries = [...new Set(companiesArray.map(c => c.businessNature).filter(Boolean))];

  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-110px)] xl:h-[calc(100vh-110px)] flex flex-col font-sans text-slate-800 p-4 md:px-6 lg:px-8 xl:overflow-hidden">
      {selectedClient ? (
        <ClientOverview client={selectedClient} onBack={() => setSelectedClient(null)} />
      ) : (
        <div className="w-full flex-grow flex flex-col xl:min-h-0">

          {/* TOP BAR */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-2 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                Master Leads
                <span className="bg-emerald-100 text-emerald-700 text-sm py-1 px-3 rounded-full font-semibold">
                  {stats.total}
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">Master list of all leads with complete details and status</p>
            </div>

            {/* ACTION BUTTONS */}
            {/* <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full xl:w-auto">
              <div className="relative flex-grow xl:flex-grow-0 min-w-[200px] w-full sm:w-auto">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Name, Company, Email, Mobile..."
                  value={globalSearch}
                  onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
              <button className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <FaPlus size={12} /> Add Lead
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <FaUpload size={12} className="text-blue-500" /> Import Leads
              </button>
              <button className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <FaWhatsapp size={16} /> Send Bulk WhatsApp
              </button>
            </div> */}
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
            <div className="bg-white p-2 md:p-3 rounded-lg border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FaSearch size={14} />
              </div>
              <div>
                <div className="text-slate-800 text-[10px] font-semibold">Total Leads</div>
                <div className="text-lg font-bold text-slate-800">{stats.total}</div>
              </div>
            </div>
            <div className="bg-white p-2 md:p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-800 text-[10px] font-semibold mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> New
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-800">{stats.newLeads.count}</span>
                <span className="text-[10px] text-slate-500 font-medium">({stats.newLeads.pct}%)</span>
              </div>
            </div>
            <div className="bg-white p-2 md:p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-800 text-[10px] font-semibold mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Contacted
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-800">{stats.contacted.count}</span>
                <span className="text-[10px] text-slate-500 font-medium">({stats.contacted.pct}%)</span>
              </div>
            </div>
            <div className="bg-white p-2 md:p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-800 text-[10px] font-semibold mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Interested
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-800">{stats.interested.count}</span>
                <span className="text-[10px] text-slate-500 font-medium">({stats.interested.pct}%)</span>
              </div>
            </div>
            <div className="bg-white p-2 md:p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-800 text-[10px] font-semibold mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Not Contacted
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-800">{stats.notContacted.count}</span>
                <span className="text-[10px] text-slate-500 font-medium">({stats.notContacted.pct}%)</span>
              </div>
            </div>
            <div className="bg-white p-2 md:p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-800 text-[10px] font-semibold mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> Converted
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-800">{stats.converted.count}</span>
                <span className="text-[10px] text-slate-500 font-medium">({stats.converted.pct}%)</span>
              </div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 flex-grow">
              <div className="relative w-full md:w-48">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={globalSearch}
                  onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded py-1.5 px-3 outline-none"
                value={filters.source} onChange={(e) => { setFilters({ ...filters, source: e.target.value }); setCurrentPage(1); }}>
                <option value="">Source</option>
                {uniqueSources.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>

              <select className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded py-1.5 px-3 outline-none"
                value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}>
                <option value="">Status</option>
                {uniqueStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>

              <select className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded py-1.5 px-3 outline-none"
                value={filters.industry} onChange={(e) => { setFilters({ ...filters, industry: e.target.value }); setCurrentPage(1); }}>
                <option value="">Industry</option>
                {uniqueIndustries.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>

              <select className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded py-1.5 px-3 outline-none"
                value={filters.handledBy} onChange={(e) => { setFilters({ ...filters, handledBy: e.target.value }); setCurrentPage(1); }}>
                <option value="">Handled By</option>
                {/* Mocked handled by */}
                <option value="Vijay Sharma">Vijay Sharma</option>
                <option value="Rahul Verma">Rahul Verma</option>
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="City / State"
                  value={filters.cityState}
                  onChange={(e) => { setFilters({ ...filters, cityState: e.target.value }); setCurrentPage(1); }}
                  className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                <MdOutlineDateRange className="text-slate-500" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setCurrentPage(1); }}
                  className="bg-transparent text-[10px] text-slate-700 outline-none w-[85px] cursor-pointer"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setCurrentPage(1); }}
                  className="bg-transparent text-[10px] text-slate-700 outline-none w-[85px] cursor-pointer"
                />
              </div>

              {/* <button className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium transition-colors">
                <FaFilter size={10} /> Filters
              </button> */}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={resetFilters} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded text-xs font-medium transition-colors">
                <FaRedo size={10} /> Reset
              </button>
              <button onClick={exportTableToExcel} className="flex items-center gap-2 bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-1.5 rounded text-xs font-semibold transition-colors">
                <FaDownload size={10} /> Export
              </button>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-grow flex flex-col min-h-[400px] xl:min-h-0" ref={printref}>
            <div className="overflow-auto flex-grow relative custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap text-[10px]">
                <thead>
                  <tr className="bg-[#0f172a] text-white text-[10px] uppercase tracking-wider">
                    <th className="px-2 py-1.5 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === paginatedRows.length && paginatedRows.length > 0}
                        onChange={toggleSelectAll}
                        className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm"
                      />
                    </th>
                    {/* <th className="px-2 py-1.5 w-10 font-medium">#</th> */}
                    <th className="px-2 py-1.5 font-medium">Company Name</th>
                    <th className="px-2 py-1.5 font-medium">Source</th>
                    <th className="px-2 py-1.5 font-medium">Status</th>
                    <th className="px-2 py-1.5 font-medium">Industry</th>
                    <th className="px-2 py-1.5 font-medium">City / State</th>
                    <th className="px-2 py-1.5 font-medium">Lead Score</th>
                    <th className="px-2 py-1.5 font-medium">Handled By / Last Conversation</th>
                    <th className="px-2 py-1.5 font-medium">Next Follow Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-8 text-center text-slate-500">Loading leads...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-8 text-center text-red-500">Error loading data: {error}</td>
                    </tr>
                  ) : paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-8 text-center text-slate-500">No leads found matching criteria.</td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, index) => {
                      const globalIndex = (currentPage - 1) * pageSize + index + 1;
                      const isSelected = selectedRows.includes(row._id);

                      // Status Badge Styling (CRM Style)
                      let statusClass = "bg-slate-100 text-slate-700 border border-slate-200";
                      let statusDot = "bg-slate-400";
                      const statLow = (row.companyStatus || "").toLowerCase();
                      if (statLow.includes("new lead") || statLow === "new") { statusClass = "bg-blue-50 text-blue-700 border border-blue-100"; statusDot = "bg-blue-500"; }
                      else if (statLow.includes("contacted") || statLow.includes("called")) { statusClass = "bg-amber-50 text-amber-700 border border-amber-100"; statusDot = "bg-amber-500"; }
                      else if (statLow.includes("proposal") || statLow.includes("interested")) { statusClass = "bg-purple-50 text-purple-700 border border-purple-100"; statusDot = "bg-purple-500"; }
                      else if (statLow.includes("won") || statLow.includes("convert") || statLow.includes("success")) { statusClass = "bg-emerald-50 text-emerald-700 border border-emerald-100"; statusDot = "bg-emerald-500"; }
                      else if (statLow.includes("lost") || statLow.includes("not") || statLow.includes("junk")) { statusClass = "bg-rose-50 text-rose-700 border border-rose-100"; statusDot = "bg-rose-500"; }

                      // Source Badge Styling (CRM Style)
                      let sourceColor = "text-slate-600 bg-slate-100 px-2 py-0.5 rounded";
                      const srcLow = (row.dataSource || "").toLowerCase();
                      if (srcLow.includes("google") || srcLow.includes("search")) sourceColor = "text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100";
                      else if (srcLow.includes("facebook") || srcLow.includes("social")) sourceColor = "text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100";
                      else if (srcLow.includes("trade show") || srcLow.includes("event") || srcLow.includes("trade")) sourceColor = "text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100";
                      else if (srcLow.includes("referral")) sourceColor = "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100";
                      else if (srcLow.includes("website") || srcLow.includes("organic")) sourceColor = "text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100";

                      return (
                        <tr key={row._id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-2 py-1.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(row._id)}
                              className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm"
                            />
                          </td>
                          {/* <td className="px-2 py-1.5 text-slate-500 text-[10px]">{globalIndex}</td> */}
                          <td className="px-2 py-1.5 font-medium text-slate-800">
                            <span onClick={() => setSelectedClient(row)} className="cursor-pointer hover:text-blue-600 transition-colors text-[11px]">
                              {toTitleCase(row.companyName)}
                            </span>
                          </td>
                          <td className="px-2 py-1.5">
                            <span className={`text-[9px] font-semibold inline-block ${sourceColor}`}>
                              @{toTitleCase(row.dataSource) || "Unknown"}
                            </span>
                          </td>
                          <td className="px-2 py-1.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${statusClass}`}>
                              <span className={`w-1 h-1 rounded-full ${statusDot}`}></span>
                              {toTitleCase(row.companyStatus) || "Unknown"}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-[10px] text-slate-600">{toTitleCase(row.businessNature) || "-"}</td>
                          <td className="px-2 py-1.5 text-[10px] text-slate-600">
                            {row.city ? `${toTitleCase(row.city)}, ${toTitleCase(row.state)}` : "-"}
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-0.5 text-emerald-500 text-[10px]">
                              <FaStar /><FaStar /><FaStar /><FaRegStar className="text-slate-300" /><FaRegStar className="text-slate-300" />
                              <span className="ml-1 font-semibold text-slate-700 text-[10px]">{row.leadScore || Math.floor(Math.random() * 60 + 30)}</span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              {/* <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[9px]">
                                {(row.forwardTo || "V").charAt(0).toUpperCase()}
                              </div> */}
                              <span className="text-[10px] font-medium text-slate-800">{toTitleCase(row.forwardTo) || "Unassigned"}</span> <span> |  </span>
                              <span className="text-[9px] text-slate-500">
                                {row.updatedAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.updatedAt)) : "-"} (Call)
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            {row.reminder ? (
                              <span className="text-[10px] font-medium text-slate-800 whitespace-nowrap">
                                {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(row.reminder))}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="bg-white border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Showing {paginatedRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} leads
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <span className="text-xs font-bold">|&lt;</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <FaChevronLeft size={10} />
                  </button>

                  {/* Page Numbers Mock */}
                  <button className="w-7 h-7 flex items-center justify-center rounded bg-[#00a65a] text-white text-xs font-medium">
                    {currentPage}
                  </button>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <FaChevronRight size={10} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <span className="text-xs font-bold">&gt;|</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterClientsList;
