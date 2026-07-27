import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X, History } from "lucide-react";
import { useDispatch } from "react-redux";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";
import Swal from "sweetalert2";
import api from "../../lib/api";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) pages.push(p);
  const btnCls = "w-8 h-8 flex items-center justify-center border border-slate-300 bg-white text-[11px] font-bold rounded-[2px] hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  const activeBtnCls = "w-8 h-8 flex items-center justify-center border border-[#23471d] bg-[#23471d] text-white text-[11px] font-bold rounded-[2px]";
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={btnCls}>{"<<"}</button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={btnCls}>{"<"}</button>
      {start > 1 && <span className="px-1 text-slate-400 text-[10px] font-bold">...</span>}
      {pages.map((p) => <button key={p} onClick={() => onPageChange(p)} className={p === currentPage ? activeBtnCls : btnCls}>{p}</button>)}
      {end < totalPages && <span className="px-1 text-slate-400 text-[10px] font-bold">...</span>}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={btnCls}>{">"}</button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={btnCls}>{">>"}</button>
    </div>
  );
};

const AddTarget = () => {
  const dispatch = useDispatch();
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    api.get("/api/admin/all")
      .then(res => {
        if (res.data.success) {
          setAdminUsers(res.data.data || []);
        }
      })
      .catch(err => console.error("Error fetching admin users:", err));
  }, []);

  const emptyTarget = { callTarget: "", whatsappTarget: "", emailTarget: "", meetingTarget: "", revenueTarget: "" };

  const [editingTarget, setEditingTarget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [targetHistory, setTargetHistory] = useState([]);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState("");

  const [formData, setFormData] = useState({
    user: "",
    daily: { ...emptyTarget },
    weekly: { ...emptyTarget },
    monthly: { ...emptyTarget },
    yearly: { ...emptyTarget },
    status: "Active"
  });

  const [activeTab, setActiveTab] = useState("monthly");

  const [targets, setTargets] = useState([]);

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = () => {
    api.get("/api/user-targets")
      .then(res => {
        if (res.data.success) {
          setTargets(res.data.data.map(t => ({
            id: t._id,
            user: t.username,
            daily: t.daily || emptyTarget,
            weekly: t.weekly || emptyTarget,
            monthly: t.monthly || emptyTarget,
            yearly: t.yearly || emptyTarget,
            status: t.status,
            createdByFullName: t.createdByFullName || t.createdBy?.user_fullname || "Admin",
            updatedByFullName: t.updatedByFullName || t.updatedBy?.user_fullname || t.createdByFullName || "Admin",
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          })));
        }
      })
      .catch(err => console.error("Error fetching targets:", err));
  };

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "id", dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getUserInfo = () => {
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = sessionStorage.getItem("user_id") || user._id;
    return { userId };
  };

  const handleNestedChange = (interval, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [interval]: {
        ...prev[interval],
        [field]: value
      }
    }));
  };

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setFormData({
      user: "",
      daily: { ...emptyTarget },
      weekly: { ...emptyTarget },
      monthly: { ...emptyTarget },
      yearly: { ...emptyTarget },
      status: "Active"
    });
    setEditingTarget(null);
    setActiveTab("monthly");
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleAddTarget = async (e) => {
    if (e) e.preventDefault();
    if (!formData.user) {
      Swal.fire({ title: "Error", text: "Please select a user!", icon: "error", confirmButtonColor: "#23471d" });
      return;
    }

    const { userId } = getUserInfo();

    const formatTarget = (t) => ({
      callTarget: Number(t.callTarget) || 0,
      whatsappTarget: Number(t.whatsappTarget) || 0,
      emailTarget: Number(t.emailTarget) || 0,
      meetingTarget: Number(t.meetingTarget) || 0,
      revenueTarget: Number(t.revenueTarget) || 0,
    });

    try {
      const res = await api.post("/api/user-targets", {
        username: formData.user,
        daily: formatTarget(formData.daily),
        weekly: formatTarget(formData.weekly),
        monthly: formatTarget(formData.monthly),
        yearly: formatTarget(formData.yearly),
        status: formData.status
      });

      if (res.data.success) {
        Swal.fire({ title: "Success!", text: "Target saved successfully!", icon: "success", confirmButtonColor: "#23471d" });
        fetchTargets();
        resetForm();
        setIsModalOpen(false);
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Updated target for user '${formData.user}'`,
            section: "System Configuration",
            data: { action: "UPDATE_TARGET", type: "USER_TARGET", user_name: formData.user }
          }));
        }
      } else {
        Swal.fire({ title: "Error", text: res.data.message || "Failed to save target", icon: "error", confirmButtonColor: "#23471d" });
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: "Something went wrong!", icon: "error", confirmButtonColor: "#23471d" });
    }
  };

  const handleEdit = (itemId) => {
    const item = targets.find((i) => i.id === itemId);
    if (item) {
      setFormData({
        user: item.user,
        daily: item.daily || emptyTarget,
        weekly: item.weekly || emptyTarget,
        monthly: item.monthly || emptyTarget,
        yearly: item.yearly || emptyTarget,
        status: item.status
      });
      setEditingTarget(item);
      setIsModalOpen(true);
    }
  };

  const viewHistory = async (user) => {
    try {
      const res = await api.get(`/api/user-targets/${user}/history`);
      if (res.data.success) {
        setTargetHistory(res.data.data || []);
        setSelectedUserForHistory(user);
        setHistoryModalOpen(true);
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: "Failed to fetch history.", icon: "error" });
    }
  };

  const handleDelete = async (itemId) => {
    const itemToDelete = targets.find((i) => i.id === itemId);
    if (!itemToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete all targets and history for user '${itemToDelete.user}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#23471d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/user-targets/${itemId}`);
        setTargets((prev) => prev.filter((c) => c.id !== itemId));
        const userId = sessionStorage.getItem("user_id");
        if (userId) {
          dispatch(createActivityLogThunk({
            user_id: userId,
            message: `System Config: Deleted target for user '${itemToDelete.user}'`,
            section: "System Configuration",
            data: { action: "DELETE", type: "USER_TARGET", user_name: itemToDelete.user }
          }));
        }
        Swal.fire({ title: "Deleted!", text: "Target has been deleted.", icon: "success", confirmButtonColor: "#23471d" });
        if (editingTarget && editingTarget.id === itemId) resetForm();
      } catch (err) {
        Swal.fire({ title: "Error", text: "Failed to delete target.", icon: "error", confirmButtonColor: "#23471d" });
      }
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...targets];
    if (searchText?.trim()) list = list.filter((c) => c.user.toLowerCase().includes(searchText.trim().toLowerCase()));
    if (statusFilter === "Active" || statusFilter === "Inactive") list = list.filter((c) => c.status === statusFilter);
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = (key === "id") ? Number(a[key]) : (a[key] || "").toString().toLowerCase();
      let bv = (key === "id") ? Number(b[key]) : (b[key] || "").toString().toLowerCase();
      return av < bv ? (dir === "asc" ? -1 : 1) : av > bv ? (dir === "asc" ? 1 : -1) : 0;
    });
    return list;
  }, [targets, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / rowsPerPage));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);
  const currentPageData = useMemo(() => filteredAndSorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredAndSorted, currentPage, rowsPerPage]);
  const toggleSort = (key) => setSortBy((prev) => prev.key === key ? { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const formatDateTime = (value) => {
    if (!value) return "Current";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    });
  };

  const resolveAdminFullName = (name) => {
    if (!name) return "Admin";
    const cleanedName = String(name).trim();
    const admin = adminUsers.find((user) => {
      const username = String(user.username || user.user_name || "").trim().toLowerCase();
      const fullName = String(user.fullName || user.user_fullname || "").trim().toLowerCase();
      const compareName = cleanedName.toLowerCase();
      return username === compareName || fullName === compareName;
    });
    return admin?.fullName || admin?.user_fullname || cleanedName || "Admin";
  };

  const inputCls = "h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10 w-full";
  const labelCls = "text-xs font-bold text-slate-700 mb-1 block";

  const renderTargetInputs = (interval) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-4 animate-fadeIn">
      <div>
        <label className={labelCls}>Call Target</label>
        <input type="number" value={formData[interval].callTarget} onChange={(e) => handleNestedChange(interval, "callTarget", e.target.value)} className={inputCls} placeholder="e.g., 40" min="0" />
      </div>
      <div>
        <label className={labelCls}>WhatsApp Target</label>
        <input type="number" value={formData[interval].whatsappTarget} onChange={(e) => handleNestedChange(interval, "whatsappTarget", e.target.value)} className={inputCls} placeholder="e.g., 20" min="0" />
      </div>
      <div>
        <label className={labelCls}>Email Target</label>
        <input type="number" value={formData[interval].emailTarget} onChange={(e) => handleNestedChange(interval, "emailTarget", e.target.value)} className={inputCls} placeholder="e.g., 50" min="0" />
      </div>
      <div>
        <label className={labelCls}>Meeting Target</label>
        <input type="number" value={formData[interval].meetingTarget} onChange={(e) => handleNestedChange(interval, "meetingTarget", e.target.value)} className={inputCls} placeholder="e.g., 5" min="0" />
      </div>
      <div>
        <label className={labelCls}>Revenue Target (in Lakhs)</label>
        <input type="number" step="0.01" value={formData[interval].revenueTarget} onChange={(e) => handleNestedChange(interval, "revenueTarget", e.target.value)} className={inputCls} placeholder="e.g., 15 for 15 L" min="0" />
      </div>
    </div>
  );

  return (
    <div className="bg-slate-100 p-3 sm:p-4 min-h-screen font-inter animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center rounded-md border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight">USER TARGET CONFIGURATION</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Sales Target Management | Performance Tracking</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#23471d] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1a3516] sm:mt-0"
        >
          <Plus size={17} />
          Add Target
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-1 pt-1 pb-1 space-y-3">
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-start justify-between bg-slate-50 border-b border-slate-200 px-6 py-3">
                <div>
                  <h2 className="text-[16px] font-bold text-slate-800 uppercase">{editingTarget ? "Edit Target" : "Add Target"}</h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">International Health & Wellness Expo 2026</p>
                </div>
                <button type="button" onClick={closeModal} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 lg:p-10">
                <form onSubmit={handleAddTarget}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mb-6">
                    <div>
                      <label className={labelCls}>Assign User <span className="text-red-500">*</span></label>
                      <select name="user" value={formData.user} onChange={handleChange} className={inputCls} disabled={!!editingTarget} required>
                        <option value="">Select User</option>
                        {adminUsers.map((u) => (
                          <option key={u._id} value={u.username}>
                            {u.fullName || u.username} ({u.username})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Status <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-6 h-8">
                        {["Active", "Inactive"].map((s) => (
                          <label key={s} className="flex items-center gap-2 text-[12px] text-slate-700 font-bold cursor-pointer">
                            <input type="radio" name="status" value={s} checked={formData.status === s} onChange={handleChange} className="accent-[#23471d]" /> {s}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 mt-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      {["daily", "weekly", "monthly", "yearly"].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`
                            ${activeTab === tab ? 'border-[#23471d] text-[#23471d]' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                            whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold uppercase
                          `}
                        >
                          {tab} Targets
                        </button>
                      ))}
                    </nav>
                  </div>

                  {renderTargetInputs(activeTab)}

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={closeModal} className="px-8 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all rounded-[2px]">Cancel</button>
                    <button type="submit" className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg">
                      {editingTarget ? "Update Target" : "Save Target"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY MODAL */}
        {historyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-start justify-between bg-slate-50 border-b border-slate-200 px-6 py-3">
                <div>
                  <h2 className="text-[16px] font-bold text-slate-800 uppercase">Target History: {resolveAdminFullName(selectedUserForHistory)}</h2>
                </div>
                <button type="button" onClick={() => setHistoryModalOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                {targetHistory.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No historical targets found for this user.</div>
                ) : (
                  <table className="w-full border-collapse border border-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border border-slate-200 p-2 text-xs font-bold text-left">Valid From</th>
                        <th className="border border-slate-200 p-2 text-xs font-bold text-left">Valid To</th>
                        <th className="border border-slate-200 p-2 text-xs font-bold text-left">Daily (C/W/E/M/R)</th>
                        <th className="border border-slate-200 p-2 text-xs font-bold text-left">Weekly (C/W/E/M/R)</th>
                        <th className="border border-slate-200 p-2 text-xs font-bold text-left">Monthly (C/W/E/M/R)</th>
                        <th className="border border-slate-200 p-2 text-xs font-bold text-left">Yearly (C/W/E/M/R)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {targetHistory.map((h, i) => {
                        const fmt = (t) => t ? `${t.callTarget}/${t.whatsappTarget}/${t.emailTarget}/${t.meetingTarget}/${t.revenueTarget}` : "0/0/0/0/0";
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="border border-slate-200 p-2 text-xs">{formatDateTime(h.validFrom)}</td>
                            <td className="border border-slate-200 p-2 text-xs">{formatDateTime(h.validTo)}</td>
                            <td className="border border-slate-200 p-2 text-xs">{fmt(h.daily)}</td>
                            <td className="border border-slate-200 p-2 text-xs">{fmt(h.weekly)}</td>
                            <td className="border border-slate-200 p-2 text-xs">{fmt(h.monthly)}</td>
                            <td className="border border-slate-200 p-2 text-xs">{fmt(h.yearly)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white px-6 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">User Target Registry</h2>
                <p className="text-sm font-medium text-slate-500 mt-0.5">Showing active assigned targets</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Search targets..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="h-10 w-56 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto font-inter bg-white">
            <table className="w-full min-w-[1280px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-3 text-[10px] font-extrabold text-slate-600 uppercase text-center w-[2%]">S.No.</th>
                  <th className="px-3 py-3 text-[10px] font-extrabold text-slate-600 uppercase text-left w-[8%]">User</th>
                  <th className="px-3 py-3 text-[10px] font-extrabold text-slate-600 uppercase text-left w-[10%]">Targets (C/W/E/M/Rev)</th>
                  <th className="px-3 py-3 text-[10px] font-extrabold text-slate-600 uppercase text-center w-[8%]">Status</th>
                  <th className="px-3 py-3 text-[10px] font-extrabold text-slate-600 uppercase text-left w-[8%]">Modified By</th>
                  <th className="px-3 py-3 text-[10px] font-extrabold text-slate-600 uppercase text-center w-[8%]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSorted.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm italic">No targets found</td></tr>
                ) : currentPageData.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 transition-colors hover:bg-[#23471d]/5">
                    <td className="px-3 py-3 text-[11px] text-gray-900 text-center font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td onClick={() => handleEdit(item.id)} className="px-3 py-3 text-[11px] text-[#23471d] hover:text-[#1a3516] cursor-pointer hover:underline font-bold capitalize tracking-tight">
                      {resolveAdminFullName(item.user)}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-600 font-medium">
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-1.5 gap-y-0.5 items-center tabular-nums">
                        <span className="font-bold text-slate-400 text-[9px] uppercase text-left">Daily</span>
                        <span className="font-bold text-slate-400 text-[9px] uppercase">:</span>
                        <span>{item.daily.callTarget} / {item.daily.whatsappTarget} / {item.daily.emailTarget} / {item.daily.meetingTarget} / {item.daily.revenueTarget} L</span>
                        
                        <span className="font-bold text-slate-400 text-[9px] uppercase text-left">Weekly</span>
                        <span className="font-bold text-slate-400 text-[9px] uppercase">:</span>
                        <span>{item.weekly.callTarget} / {item.weekly.whatsappTarget} / {item.weekly.emailTarget} / {item.weekly.meetingTarget} / {item.weekly.revenueTarget} L</span>
                        
                        <span className="font-bold text-slate-400 text-[9px] uppercase text-left">Monthly</span>
                        <span className="font-bold text-slate-400 text-[9px] uppercase">:</span>
                        <span>{item.monthly.callTarget} / {item.monthly.whatsappTarget} / {item.monthly.emailTarget} / {item.monthly.meetingTarget} / {item.monthly.revenueTarget} L</span>
                        
                        <span className="font-bold text-slate-400 text-[9px] uppercase text-left">Yearly</span>
                        <span className="font-bold text-slate-400 text-[9px] uppercase">:</span>
                        <span>{item.yearly.callTarget} / {item.yearly.whatsappTarget} / {item.yearly.emailTarget} / {item.yearly.meetingTarget} / {item.yearly.revenueTarget} L</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.status === "Active" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[10px] text-slate-700">
                      <div className="font-bold Capatalize text-slate-900">{resolveAdminFullName(item.updatedByFullName || item.createdByFullName)}</div>
                      <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">{formatDateTime(item.updatedAt || item.createdAt)}</div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => viewHistory(item.user)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-blue-200 text-blue-700 transition hover:bg-blue-50" title="History">
                          <History size={16} />
                        </button>
                        <button onClick={() => handleEdit(item.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-green-200 text-green-700 transition hover:bg-green-50" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-inner">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Showing {filteredAndSorted.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} entries
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTarget;
