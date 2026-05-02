import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Download, Trash2, Eye,
  Filter, Award, CheckCircle, XCircle, Clock, AlertCircle, X
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import api from "../lib/api";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

const STATUS_COLORS = {
  "Pending":      "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Under Review": "bg-blue-100 text-blue-700 border-blue-200",
  "Approved":     "bg-green-100 text-green-700 border-green-200",
  "Rejected":     "bg-red-100 text-red-700 border-red-200",
};

const STATUS_ICONS = {
  "Pending":      <Clock className="w-3 h-3" />,
  "Under Review": <AlertCircle className="w-3 h-3" />,
  "Approved":     <CheckCircle className="w-3 h-3" />,
  "Rejected":     <XCircle className="w-3 h-3" />,
};

const STATUSES = ["Pending", "Under Review", "Approved", "Rejected"];

// ─── Detail Modal ───
const DetailModal = ({ nomination, onClose, onStatusUpdate }) => {
  const [status, setStatus] = useState(nomination.status);
  const [remarks, setRemarks] = useState(nomination.adminRemarks || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/awards-nomination/${nomination._id}/status`, { status, adminRemarks: remarks });
      onStatusUpdate(nomination._id, status, remarks);
      Swal.fire({ icon: "success", title: "Updated!", text: "Status updated successfully.", timer: 1500, showConfirmButton: false });
      onClose();
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to update status." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#008d48] rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-[#0a2e5c] text-[15px]">{nomination.fullName}</h2>
              <p className="text-slate-400 text-[11px] font-bold">{nomination.awardCategory}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Applicant Info */}
          <Section title="Applicant Details">
            <Grid>
              <Field label="Applicant Type" value={nomination.applicantType} />
              <Field label="Full Name" value={nomination.fullName} />
              <Field label="Contact Person" value={nomination.contactPersonName} />
              <Field label="Designation" value={nomination.designation} />
              <Field label="Mobile" value={nomination.mobile} />
              <Field label="Email" value={nomination.email} />
              <Field label="Website" value={nomination.website} />
              <Field label="Location" value={[nomination.city, nomination.state, nomination.country].filter(Boolean).join(", ")} />
            </Grid>
          </Section>

          {/* Award Category */}
          <Section title="Award Category">
            <p className="text-[#008d48] font-black text-[14px]">{nomination.awardCategory}</p>
          </Section>

          {/* Profile */}
          {nomination.briefProfile && (
            <Section title="Profile Details">
              <Grid>
                <Field label="Years of Experience" value={nomination.yearsOfExperience} />
                <Field label="Team Size" value={nomination.teamSize} />
              </Grid>
              <Field label="Brief Profile" value={nomination.briefProfile} full />
              <Field label="Key Services" value={nomination.keyServices} full />
            </Section>
          )}

          {/* Achievements */}
          {nomination.keyAchievements && (
            <Section title="Achievements & Impact">
              <Field label="Key Achievements" value={nomination.keyAchievements} full />
              <Field label="Unique Contribution" value={nomination.uniqueContribution} full />
              <Field label="Impact Created" value={nomination.impactCreated} full />
              <Field label="Innovation Used" value={nomination.innovationUsed} full />
              <Field label="Why Deserve" value={nomination.whyDeserve} full />
            </Section>
          )}

          {/* Status Update */}
          <Section title="Status Management">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all ${
                        status === s ? STATUS_COLORS[s] + " ring-2 ring-offset-1 ring-current" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {STATUS_ICONS[s]} <span className="ml-1">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Admin Remarks</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Add internal remarks..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-[#008d48] text-white rounded-lg font-black text-[12px] uppercase tracking-widest hover:bg-[#007a3e] transition-all disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes & Notify Applicant"}
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
);

const Field = ({ label, value, full }) => (
  value ? (
    <div className={full ? "col-span-2" : ""}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{label}</span>
      <span className="text-[12.5px] font-semibold text-slate-700">{value}</span>
    </div>
  ) : null
);

// ─── Main Component ───
const AwardsNominationList = () => {
  const navigate = useNavigate();
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0 });
  const [filters, setFilters] = useState({ status: "all", awardCategory: "all", applicantType: "all" });
  const [awardCategories, setAwardCategories] = useState([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchNominations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearchTerm,
        status: filters.status,
        awardCategory: filters.awardCategory,
        applicantType: filters.applicantType,
      });
      const res = await api.get(`/api/awards-nomination?${params}`);
      if (res.data.success) {
        setNominations(res.data.nominations);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filters]);

  useEffect(() => { fetchNominations(); }, [fetchNominations]);

  // Fetch Award Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/award-categories?all=true");
        if (res.data.success) {
          setAwardCategories(res.data.data.filter(c => c.status === "Active").map(c => c.name));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Nomination?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/api/awards-nomination/${id}`);
      setNominations(prev => prev.filter(n => n._id !== id));
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete." });
    }
  };

  const handleStatusUpdate = (id, status, remarks) => {
    setNominations(prev => prev.map(n => n._id === id ? { ...n, status, adminRemarks: remarks } : n));
    fetchNominations();
  };

  const exportToExcel = () => {
    const data = nominations.map(n => ({
      "Full Name": n.fullName,
      "Contact Person": n.contactPersonName,
      "Mobile": n.mobile,
      "Email": n.email,
      "Applicant Type": n.applicantType,
      "Award Category": n.awardCategory,
      "City": n.city,
      "State": n.state,
      "Status": n.status,
      "Submitted On": new Date(n.createdAt).toLocaleDateString("en-IN"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nominations");
    XLSX.writeFile(wb, `Awards_Nominations_${Date.now()}.xlsx`);
  };

  // Pagination
  const paginated = nominations.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      {/* Hero Banner */}
      <div className="relative w-full h-64 overflow-hidden rounded mt-8">
        {/* Background Image */}
        <img
          src="/nomi.png"
          alt="Awards Nominations Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
          <Award className="w-16 h-16 mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
            Awards Nominations
          </h1>
          <p className="text-lg mt-2 text-center text-white/90">
            Manage Namo Gange Global Health Excellence Awards nominations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6 space-y-5">
        <PageHeader
          title="Awards Nominations"
          subtitle="Manage Namo Gange Global Health Excellence Awards nominations"
        />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "bg-slate-50 border-slate-200 text-slate-700" },
          { label: "Pending", value: stats.pending, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
          { label: "Under Review", value: stats.underReview, color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Approved", value: stats.approved, color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Rejected", value: stats.rejected, color: "bg-red-50 border-red-200 text-red-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 ${s.color}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
            <p className="text-[26px] font-black leading-none mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, mobile..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#008d48]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-[12px] font-bold transition-all ${showFilters ? "bg-[#008d48] text-white border-[#008d48]" : "bg-white text-slate-600 border-slate-200 hover:border-[#008d48]"}`}
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-[12px] font-bold hover:border-[#008d48] transition-all"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-wrap gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#008d48]"
            >
              <option value="all">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Applicant Type</label>
            <select
              value={filters.applicantType}
              onChange={e => setFilters(p => ({ ...p, applicantType: e.target.value }))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#008d48]"
            >
              <option value="all">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Organization">Organization</option>
              <option value="Startup">Startup</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Award Category</label>
            <select
              value={filters.awardCategory}
              onChange={e => setFilters(p => ({ ...p, awardCategory: e.target.value }))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#008d48]"
            >
              <option value="all">All Categories</option>
              {awardCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setFilters({ status: "all", awardCategory: "all", applicantType: "all" }); setSearchTerm(""); }}
            className="self-end px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-red-500 transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#008d48] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <EmptyState message="No nominations found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["#", "Type", "Full Name", "Contact Person", "Designation", "Mobile", "Email", "Website", "Location", "Award Category", "Status", "Submitted", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((n, idx) => (
                  <tr key={n._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-[12px] text-slate-400 font-bold">
                      {(currentPage - 1) * rowsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${
                        n.applicantType === 'Individual' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : n.applicantType === 'Startup'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {n.applicantType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12.5px] font-black text-[#0a2e5c] whitespace-nowrap">{n.fullName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11.5px] font-bold text-slate-700 whitespace-nowrap">{n.contactPersonName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] text-slate-600 whitespace-nowrap">{n.designation || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11.5px] font-semibold text-slate-700 whitespace-nowrap">{n.mobile}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11.5px] font-semibold text-slate-700 max-w-[180px] truncate">{n.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {n.website ? (
                        <a 
                          href={n.website.startsWith('http') ? n.website : `https://${n.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:text-blue-800 underline max-w-[150px] truncate block"
                        >
                          {n.website}
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11.5px] font-semibold text-slate-700 whitespace-nowrap capitalize">{n.city || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] font-bold text-slate-700 max-w-[180px] leading-tight">{n.awardCategory}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border whitespace-nowrap ${STATUS_COLORS[n.status]}`}>
                        {STATUS_ICONS[n.status]} {n.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/awards-nominations/${n._id}`)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="View & Update"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(n._id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {nominations.length > rowsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(nominations.length / rowsPerPage)}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Detail Modal */}
      {selectedNomination && (
        <DetailModal
          nomination={selectedNomination}
          onClose={() => setSelectedNomination(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
    </>
  );
};

export default AwardsNominationList;
