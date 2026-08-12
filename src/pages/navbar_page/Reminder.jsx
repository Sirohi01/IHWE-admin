import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../lib/api";
import {
  Search,
  RefreshCw,
  Download,
  FileText,
  Smartphone,
  Mail,
  Building2,
  Eye,
  User,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Phone,
  MessageCircle,
  Users,
  PlusCircle,
  X,
  Activity
} from "lucide-react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import BaseLeadPage from "../../layout/BaseLeadPage";
import Swal from "sweetalert2";

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const INITIAL_FOLLOWUPS = [
  {
    id: 1,
    leadId: "LEAD1250",
    leadName: "Rahul Verma",
    initials: "RA",
    company: "Wellness India Pvt Ltd",
    industry: "Nutrition, Organic & Health Foods",
    city: "New Delhi",
    mobile: "9876543210",
    email: "rahul@wellnessindia.com",
    type: "Call Follow-Up",
    date: "18 Apr 2026",
    time: "11:00 AM",
    assignedTo: "Vansh Chaudhary",
    assignedRole: "Sales Executive",
    status: "Pending",
    priority: "High"
  },
  {
    id: 2,
    leadId: "LEAD1248",
    leadName: "Priya Sharma",
    initials: "PS",
    company: "FitLife Solutions",
    industry: "Fitness & Wellness",
    city: "Mumbai",
    mobile: "9123456789",
    email: "priya@fitlife.com",
    type: "Whatsapp Follow-Up",
    date: "18 Apr 2026",
    time: "02:30 PM",
    assignedTo: "Vansh Chaudhary",
    assignedRole: "Sales Executive",
    status: "Pending",
    priority: "Medium"
  },
  {
    id: 3,
    leadId: "LEAD1245",
    leadName: "Amit Kumar",
    initials: "AK",
    company: "HealthGenix",
    industry: "Pharmaceuticals",
    city: "Bangalore",
    mobile: "9988777665",
    email: "amit@healthgenix.com",
    type: "Meeting Follow-Up",
    date: "19 Apr 2026",
    time: "10:30 AM",
    assignedTo: "Ritika Nair",
    assignedRole: "Sales Manager",
    status: "Pending",
    priority: "High"
  },
  {
    id: 4,
    leadId: "LEAD1243",
    leadName: "Sneha Gupta",
    initials: "SG",
    company: "CareWellness",
    industry: "Ayurveda & Herbal",
    city: "Pune",
    mobile: "9765432109",
    email: "sneha@carewellness.com",
    type: "Email Follow-Up",
    date: "19 Apr 2026",
    time: "03:00 PM",
    assignedTo: "Vansh Chaudhary",
    assignedRole: "Sales Executive",
    status: "Completed",
    priority: "Low"
  },
  {
    id: 5,
    leadId: "LEAD1241",
    leadName: "Vikram Singh",
    initials: "VK",
    company: "TechHealth Solutions",
    industry: "Medical Devices",
    city: "Hyderabad",
    mobile: "9000011122",
    email: "vikram@techhealth.com",
    type: "Call Follow-Up",
    date: "20 Apr 2026",
    time: "11:30 AM",
    assignedTo: "Neha Mehta",
    assignedRole: "Sales Executive",
    status: "Overdue",
    priority: "High"
  },
  {
    id: 6,
    leadId: "LEAD1239",
    leadName: "Meera Das",
    initials: "MD",
    company: "Wellness World",
    industry: "Organic Cosmetics",
    city: "Kolkata",
    mobile: "9333344556",
    email: "meera@wellnessworld.com",
    type: "Whatsapp Follow-Up",
    date: "20 Apr 2026",
    time: "04:00 PM",
    assignedTo: "Ritika Nair",
    assignedRole: "Sales Manager",
    status: "Pending",
    priority: "Medium"
  },
  {
    id: 7,
    leadId: "LEAD1237",
    leadName: "Rohit Jaiswal",
    initials: "RJ",
    company: "Healthy Living Co.",
    industry: "Health Supplements",
    city: "Chennai",
    mobile: "9889966778",
    email: "rohit@healthyliving.com",
    type: "Meeting Follow-Up",
    date: "21 Apr 2026",
    time: "12:00 PM",
    assignedTo: "Vansh Chaudhary",
    assignedRole: "Sales Executive",
    status: "Pending",
    priority: "High"
  },
  {
    id: 8,
    leadId: "LEAD1235",
    leadName: "Neha Pillai",
    initials: "NP",
    company: "LifeCare Wellness",
    industry: "Personal Care",
    city: "Kochi",
    mobile: "9494911223",
    email: "neha@lifecare.com",
    type: "Email Follow-Up",
    date: "21 Apr 2026",
    time: "02:30 PM",
    assignedTo: "Neha Mehta",
    assignedRole: "Sales Executive",
    status: "Pending",
    priority: "Low"
  }
];

export default function Reminder() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [followUps, setFollowUps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [assignedToOptions, setAssignedToOptions] = useState([]);

  const [newFollowUp, setNewFollowUp] = useState({
    leadName: "",
    company: "",
    industry: "General",
    city: "",
    mobile: "",
    email: "",
    type: "Call Follow-Up",
    date: "",
    time: "11:00 AM",
    assignedTo: "",
    priority: "Medium"
  });

  // Get logged-in user from localStorage
  const getAuthParams = () => {
    try {
      const raw = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") ||
                  localStorage.getItem("user") || sessionStorage.getItem("user") || "";
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          username: parsed.username || parsed.user_name || "",
          role: parsed.role || parsed.roleName || ""
        };
      }
    } catch (e) {}
    return { username: "", role: "" };
  };

  // Fetch real follow-up reminders from backend
  const fetchFollowUps = async () => {
    setIsLoading(true);
    try {
      const { username, role } = getAuthParams();
      const params = new URLSearchParams();
      if (eventId) params.append("eventId", eventId);
      if (username) params.append("username", username);
      if (role) params.append("role", role);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(`/api/crm-follow-ups?${params.toString()}`);
      const data = res.data?.data || res.data || [];
      setFollowUps(Array.isArray(data) ? data : []);

      // Extract unique assignedTo values for filter dropdown
      const assigned = [...new Set(data.map(d => d.assignedTo).filter(Boolean))].sort();
      setAssignedToOptions(assigned);
    } catch (err) {
      console.error("Error fetching follow-ups:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [eventId]);

  // Re-fetch when date range filter changes
  useEffect(() => {
    if (startDate || endDate) {
      fetchFollowUps();
    }
  }, [startDate, endDate]);

  // Filter Logic (client-side for status/type/assigned/search)
  const filteredList = useMemo(() => {
    return followUps.filter((item) => {
      const search = searchTerm.toLowerCase();
      const cName = (item.company || "").toLowerCase();
      const lName = (item.leadName || "").toLowerCase();
      const mobile = (item.mobile || "").toLowerCase();
      const email = (item.email || "").toLowerCase();

      if (search && !cName.includes(search) && !lName.includes(search) && !mobile.includes(search) && !email.includes(search)) {
        return false;
      }
      if (filterStatus && item.status !== filterStatus) return false;
      if (filterType && item.type !== filterType && item.nextAction !== filterType) return false;
      if (filterAssigned && item.assignedTo !== filterAssigned) return false;
      return true;
    });
  }, [followUps, searchTerm, filterStatus, filterType, filterAssigned]);

  // Pagination
  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedData = filteredList.slice((page - 1) * limit, page * limit);

  // Stats
  const totalCount = followUps.length;
  const pendingCount = followUps.filter(f => f.status === "Pending").length;
  const completedCount = followUps.filter(f => f.status === "Completed").length;
  const overdueCount = followUps.filter(f => f.status === "Overdue").length;
  const callCount = followUps.filter(f => (f.type || "").includes("Call")).length;
  const whatsappCount = followUps.filter(f => (f.type || "").includes("Whatsapp")).length;

  const statCardsData = [
    {
      title: "TOTAL FOLLOW-UPS",
      value: totalCount,
      desc: "All Scheduled Reminders",
      icon: Calendar,
      iconBg: "bg-blue-100",
      bg: "bg-gradient-to-br from-white from-50% to-blue-50",
      text: "text-blue-600"
    },
    {
      title: "PENDING FOLLOW-UPS",
      value: pendingCount,
      desc: "Awaiting Action",
      icon: Clock,
      iconBg: "bg-amber-100",
      bg: "bg-gradient-to-br from-white from-50% to-amber-50",
      text: "text-amber-600"
    },
    {
      title: "COMPLETED TODAY",
      value: completedCount,
      desc: "Successfully Closed",
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      bg: "bg-gradient-to-br from-white from-50% to-green-50",
      text: "text-green-600"
    },
    {
      title: "OVERDUE REMINDERS",
      value: overdueCount,
      desc: "Requires Attention",
      icon: AlertCircle,
      iconBg: "bg-red-100",
      bg: "bg-gradient-to-br from-white from-50% to-red-50",
      text: "text-red-600"
    },
    {
      title: "CALL FOLLOW-UPS",
      value: callCount,
      desc: "Phone Outreach",
      icon: Phone,
      iconBg: "bg-purple-100",
      bg: "bg-gradient-to-br from-white from-50% to-purple-50",
      text: "text-purple-600"
    },
    {
      title: "WHATSAPP REMINDERS",
      value: whatsappCount,
      desc: "Chat Communications",
      icon: FaWhatsapp,
      iconBg: "bg-emerald-100",
      bg: "bg-gradient-to-br from-white from-50% to-emerald-50",
      text: "text-emerald-600"
    }
  ];

  const statCards = (
    <>
      {statCardsData.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`group cursor-pointer relative ${item.bg} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${item.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${item.text}`} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <p className="text-xl font-extrabold text-slate-900 leading-none mb-1">
                    {item.value < 10 && item.value > 0 ? `0${item.value}` : item.value}
                  </p>
                  <p className="text-[9px] font-extrabold text-slate-700 leading-tight">
                    {item.title}
                  </p>
                </div>
              </div>
              <div className={`text-[10px] font-bold mt-2 ${item.text} text-center`}>
                {item.desc}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterType("");
    setFilterAssigned("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    fetchFollowUps();
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newFollowUp.leadName || !newFollowUp.company) {
      Swal.fire("Warning", "Please enter Lead Name and Company Name.", "warning");
      return;
    }

    const initials = newFollowUp.leadName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const created = {
      id: Date.now(),
      leadId: `LEAD${Math.floor(1000 + Math.random() * 9000)}`,
      leadName: newFollowUp.leadName,
      initials: initials || "EX",
      company: newFollowUp.company,
      industry: newFollowUp.industry || "General",
      city: newFollowUp.city || "New Delhi",
      mobile: newFollowUp.mobile || "9876543210",
      email: newFollowUp.email || "client@company.com",
      type: newFollowUp.type,
      date: newFollowUp.date || "22 Apr 2026",
      time: newFollowUp.time || "10:00 AM",
      assignedTo: newFollowUp.assignedTo,
      assignedRole: "Sales Executive",
      status: "Pending",
      priority: newFollowUp.priority
    };

    setFollowUps([created, ...followUps]);
    setIsModalOpen(false);
    Swal.fire({
      title: "Success!",
      text: "New follow-up reminder added successfully.",
      icon: "success",
      confirmButtonColor: "#0A2947"
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this follow-up reminder?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#3B82F6",
      confirmButtonText: "Yes, delete"
    }).then((result) => {
      if (result.isConfirmed) {
        setFollowUps(followUps.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "Follow-up has been removed.", "success");
      }
    });
  };

  const headerActions = null;

  const filterBar = (
    <>
      <div className="relative min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-7 pr-3 py-1.5 border rounded text-[10px] focus:outline-none bg-white border-slate-200 text-slate-700 placeholder-slate-400"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      <select 
        value={filterStatus} 
        onChange={e => { setFilterStatus(e.target.value); setPage(1); }} 
        className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-white border-slate-200 text-slate-700 min-w-[100px]"
      >
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Overdue">Overdue</option>
      </select>

      <select 
        value={filterType} 
        onChange={e => { setFilterType(e.target.value); setPage(1); }} 
        className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-white border-slate-200 text-slate-700 min-w-[120px]"
      >
        <option value="">Next Action</option>
        <option value="Call Follow-Up">Call Follow-Up</option>
        <option value="Whatsapp Follow-Up">Whatsapp Follow-Up</option>
        <option value="Meeting Follow-Up">Meeting Follow-Up</option>
        <option value="Email Follow-Up">Email Follow-Up</option>
      </select>

      <select 
        value={filterAssigned} 
        onChange={e => { setFilterAssigned(e.target.value); setPage(1); }} 
        className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-white border-slate-200 text-slate-700 min-w-[110px]"
      >
        <option value="">Assigned To</option>
        {assignedToOptions.map((name, i) => (
          <option key={i} value={name}>{name}</option>
        ))}
      </select>

      <div className="flex items-center gap-1.5 py-1 px-2 border rounded text-[10px] font-medium bg-white border-slate-200">
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }} 
          className="bg-transparent text-[10px] py-0.5 outline-none w-[85px] cursor-pointer text-slate-700" 
        />
        <span className="text-slate-400">-</span>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }} 
          className="bg-transparent text-[10px] py-0.5 outline-none w-[85px] cursor-pointer text-slate-700" 
        />
      </div>
    </>
  );

  const tableHeadersComponent = (
    <>
      <th className="px-3 py-2 font-medium text-left">Company Name</th>
      <th className="px-3 py-2 font-medium text-left">Contact Details</th>
      <th className="px-3 py-2 font-medium text-center">Next Action</th>
      <th className="px-3 py-2 font-medium text-left">Forward To</th>
      <th className="px-3 py-2 font-medium text-center">Lead Status</th>
      <th className="px-3 py-2 font-medium text-left">Remark</th>
      <th className="px-3 py-2 font-medium text-center">Status</th>
      <th className="px-3 py-2 font-medium text-left">Date & Time</th>
      <th className="px-3 py-2 w-16 text-center">Action</th>
    </>
  );

  const tableBodyContent = (
    <>
      {isLoading ? (
        <tr>
          <td colSpan="9" className="text-center py-10 text-slate-400 text-[11px]">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              Loading follow-up reminders...
            </div>
          </td>
        </tr>
      ) : paginatedData.length === 0 ? (
        <tr>
          <td colSpan="9" className="text-center py-10 text-slate-500 text-[11px]">
            {followUps.length === 0 ? "No follow-up reminders found. Follow-up dates are set in the Lead Status Update panel." : "No records match the current filters."}
          </td>
        </tr>
      ) : (
        paginatedData.map((row, index) => (
          <tr key={row.id || index} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
            <td className="px-2 py-2 text-center">
              <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
            </td>

            {/* Company Name & Industry */}
            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-bold text-[11px] hover:text-emerald-600 transition-colors cursor-pointer" style={{ color: '#093C5D' }}>
                  {toTitleCase(row.company)}
                </span>
                <span className="text-[9px] font-bold" style={{ color: '#5E0006' }}>
                  {toTitleCase(row.industry)}
                </span>
              </div>
            </td>

            {/* Contact Details */}
            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 font-bold text-[10px]" style={{ color: '#15173D' }}>
                  <User size={10} className="text-emerald-600" />
                  {toTitleCase(row.leadName)}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-blue-600 font-semibold hover:underline cursor-pointer">
                  <Smartphone size={10} className="text-blue-500" />
                  {row.mobile}
                </div>
              </div>
            </td>

            {/* Next Action */}
            <td className="px-3 py-2 text-center whitespace-nowrap">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider border border-emerald-200">
                <Phone size={10} /> {row.nextAction || row.type || "Send Proposal"}
              </span>
            </td>

            {/* Forward To */}
            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-[10px] text-red-600">{row.assignedTo || "—"}</span>
              </div>
            </td>

            {/* Lead Status */}
            <td className="px-3 py-2 text-center whitespace-nowrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {row.currentStatus || "New Lead"}
              </span>
            </td>

            {/* Remark */}
            <td className="px-3 py-2 max-w-[180px]">
              <p
                onClick={() => { setSelectedLead(row); setIsViewModalOpen(true); }}
                className="text-[10px] text-slate-700 font-medium truncate cursor-pointer hover:text-blue-600 transition-colors"
                title="Click to view full remark & follow-up details"
              >
                {row.lastRemark || <span className="text-slate-300 italic">No remark</span>}
              </p>
            </td>

            {/* Status */}
            <td className="px-3 py-2 text-center whitespace-nowrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  row.status === "Completed"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : row.status === "Overdue"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {row.status}
              </span>
            </td>

            {/* Date & Time */}
            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-[10px] text-slate-800">{row.date}</span>
                <span className="text-[9px] font-semibold text-slate-400">{row.time}</span>
              </div>
            </td>

            {/* Actions */}
            <td className="px-3 py-2 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5 text-slate-400">
                <button
                  title="View Details & Full Remark"
                  onClick={() => { setSelectedLead(row); setIsViewModalOpen(true); }}
                  className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-slate-600"
                >
                  <Eye size={13} />
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </>
  );

  const paginationComponent = (
    <div className="w-full flex items-center justify-between">
      <span>Showing 1 to {paginatedData.length} of {totalItems} entries</span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-2 py-1 border rounded text-[10px] font-bold hover:bg-slate-50 disabled:opacity-40"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`w-5 h-5 rounded text-[10px] font-bold ${page === i + 1 ? 'bg-[#0A2947] text-white' : 'hover:bg-slate-100 text-slate-700'}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          className="px-2 py-1 border rounded text-[10px] font-bold hover:bg-slate-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <>
      <BaseLeadPage
        title="Follow-Ups (Reminders)"
        subtitle="History of all follow-up reminders, scheduled meetings, and outreach activities"
        badgeCount={totalCount}
        cardsInRow={6}
        headerActions={headerActions}
        statCards={statCards}
        filterBar={filterBar}
        onReset={handleReset}
        tableHeaders={tableHeadersComponent}
        tableBody={tableBodyContent}
        pagination={paginationComponent}
      />

      {/* Modal for Add Follow-Up */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between" style={{ backgroundColor: '#0A2947' }}>
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <PlusCircle size={14} className="text-emerald-400" />
                <span>Schedule New Follow-Up</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-md"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 space-y-3 text-[11px] font-medium text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Lead Name *</label>
                  <input
                    required
                    type="text"
                    value={newFollowUp.leadName}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, leadName: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    className="w-full h-7 px-2.5 border border-slate-300 rounded outline-none focus:border-slate-600 text-[10px]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Company *</label>
                  <input
                    required
                    type="text"
                    value={newFollowUp.company}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, company: e.target.value })}
                    placeholder="e.g. Wellness India"
                    className="w-full h-7 px-2.5 border border-slate-300 rounded outline-none focus:border-slate-600 text-[10px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Mobile</label>
                  <input
                    type="text"
                    value={newFollowUp.mobile}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full h-7 px-2.5 border border-slate-300 rounded outline-none focus:border-slate-600 text-[10px]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={newFollowUp.email}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, email: e.target.value })}
                    placeholder="rahul@wellness.com"
                    className="w-full h-7 px-2.5 border border-slate-300 rounded outline-none focus:border-slate-600 text-[10px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Follow-Up Type</label>
                  <select
                    value={newFollowUp.type}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value })}
                    className="w-full h-7 px-2 border border-slate-300 rounded outline-none focus:border-slate-600 bg-white text-[10px]"
                  >
                    <option>Call Follow-Up</option>
                    <option>Whatsapp Follow-Up</option>
                    <option>Meeting Follow-Up</option>
                    <option>Email Follow-Up</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Priority</label>
                  <select
                    value={newFollowUp.priority}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, priority: e.target.value })}
                    className="w-full h-7 px-2 border border-slate-300 rounded outline-none focus:border-slate-600 bg-white text-[10px]"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Date</label>
                  <input
                    type="date"
                    value={newFollowUp.date}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, date: e.target.value })}
                    className="w-full h-7 px-2.5 border border-slate-300 rounded outline-none focus:border-slate-600 text-[10px]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Time</label>
                  <input
                    type="text"
                    value={newFollowUp.time}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, time: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full h-7 px-2.5 border border-slate-300 rounded outline-none focus:border-slate-600 text-[10px]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-white rounded font-bold text-[10px]"
                  style={{ backgroundColor: '#0A2947' }}
                >
                  Save Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Follow-Up & Remark Modal */}
      {isViewModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-lg rounded-xl overflow-hidden animate-fadeIn text-[#15173D]"
            style={{
              fontFamily: 'Inter, sans-serif',
              boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 bg-slate-100 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <Activity size={16} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-orange-600">Status Update</h3>
                  <p className="text-[10px] font-bold" style={{ color: '#133458' }}>{selectedLead.date} {selectedLead.time}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {/* Client */}
              <div
                className="bg-white p-2.5 rounded-lg"
                style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}
              >
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Client</span>
                <span className="text-[11px] font-bold text-[#093C5D]">{toTitleCase(selectedLead.company)}</span>
              </div>

              {/* Status */}
              <div
                className="bg-white p-2.5 rounded-lg flex items-center justify-between"
                style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}
              >
                <span className="text-[10px] font-bold text-slate-600">Status:</span>
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase">
                  {selectedLead.currentStatus || "New Lead"}
                </span>
              </div>

              {/* Next Action */}
              {selectedLead.nextAction && (
                <div
                  className="bg-white p-2.5 rounded-lg flex items-center justify-between"
                  style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}
                >
                  <span className="text-[10px] font-bold text-slate-600">Next Action:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    {selectedLead.nextAction}
                  </span>
                </div>
              )}

              {/* Details / Message */}
              <div
                className="bg-white p-3 rounded-lg"
                style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}
              >
                <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">Details / Message</span>
                <p className="text-[11px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedLead.lastRemark || "No remark added."}
                </p>
              </div>

              {/* ⏰ Reminder */}
              <div
                className="bg-red-50/50 p-2.5 rounded-lg border border-red-100"
                style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}
              >
                <span className="text-[11px] font-bold text-red-600 block">
                  ⏰ Reminder: {selectedLead.date} {selectedLead.time}
                </span>
              </div>

              {/* By */}
              {selectedLead.assignedTo && (
                <div className="text-[11px] font-bold text-red-600 text-right pt-1.5 border-t border-slate-100">
                  By / Forward To: {selectedLead.assignedTo}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  navigate(`/client-overview/${selectedLead.companyId || selectedLead.id}`);
                }}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg transition-colors border border-blue-200"
              >
                View Full Client Profile
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-1.5 bg-[#15173D] text-white text-[11px] font-bold rounded-lg hover:bg-[#0A2643] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}