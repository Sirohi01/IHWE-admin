import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { createActivityLogThunk } from "../../features/activityLog/activityLogSlice";
import Swal from "sweetalert2";
import api from "../../lib/api";


const getCurrentTargetMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

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

// Removed LOCAL_STORAGE_KEY
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

  const [editingTarget, setEditingTarget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ user: "", targetMonth: getCurrentTargetMonth(), callTarget: "", whatsappTarget: "", emailTarget: "", meetingTarget: "", revenueTarget: "", status: "Active" });
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
            callTarget: t.callTarget,
            whatsappTarget: t.whatsappTarget,
            emailTarget: t.emailTarget,
            meetingTarget: t.meetingTarget,
            revenueTarget: t.revenueTarget,
            status: t.status,
            targetMonth: t.targetMonth || getCurrentTargetMonth(),
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

  // Removed useEffect for localStorage

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const resetForm = () => { setFormData({ user: "", targetMonth: getCurrentTargetMonth(), callTarget: "", whatsappTarget: "", emailTarget: "", meetingTarget: "", revenueTarget: "", status: "Active" }); setEditingTarget(null); };
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

    try {
      const res = await api.post("/api/user-targets", {
        username: formData.user,
        targetMonth: formData.targetMonth || getCurrentTargetMonth(),
        callTarget: Number(formData.callTarget) || 0,
        whatsappTarget: Number(formData.whatsappTarget) || 0,
        emailTarget: Number(formData.emailTarget) || 0,
        meetingTarget: Number(formData.meetingTarget) || 0,
        revenueTarget: Number(formData.revenueTarget) || 0,
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
      setFormData({ user: item.user, targetMonth: item.targetMonth || getCurrentTargetMonth(), callTarget: item.callTarget, whatsappTarget: item.whatsappTarget, emailTarget: item.emailTarget, meetingTarget: item.meetingTarget, revenueTarget: item.revenueTarget, status: item.status });
      setEditingTarget(item);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (itemId) => {
    const itemToDelete = targets.find((i) => i.id === itemId);
    if (!itemToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete target for user '${itemToDelete.user}'?`,
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
    if (searchText?.trim()) list = list.filter((c) => c.user.toLowerCase().includes(searchText.trim().toLowerCase()) || String(c.targetMonth || "").includes(searchText.trim()) || String(c.callTarget).includes(searchText.trim()));
    if (statusFilter === "Active" || statusFilter === "Inactive") list = list.filter((c) => c.status === statusFilter);
    const { key, dir } = sortBy;
    list.sort((a, b) => {
      let av = (key === "id" || key.includes("Target")) ? Number(a[key]) : (a[key] || "").toString().toLowerCase();
      let bv = (key === "id" || key.includes("Target")) ? Number(b[key]) : (b[key] || "").toString().toLowerCase();
      return av < bv ? (dir === "asc" ? -1 : 1) : av > bv ? (dir === "asc" ? 1 : -1) : 0;
    });
    return list;
  }, [targets, searchText, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / rowsPerPage));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);
  const currentPageData = useMemo(() => filteredAndSorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredAndSorted, currentPage, rowsPerPage]);
  const toggleSort = (key) => setSortBy((prev) => prev.key === key ? { ...prev, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
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
  const formatTargetMonth = (month) => {
    if (!month) return "-";
    const [year, monthNumber] = String(month).split("-");
    const date = new Date(Number(year), Number(monthNumber) - 1, 1);
    if (Number.isNaN(date.getTime())) return month;
    return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  };
  const inputCls = "h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10 w-full";
  const labelCls = "text-xs font-bold text-slate-700 mb-1 block";

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
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 lg:p-10">
                <form onSubmit={handleAddTarget}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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
                      <label className={labelCls}>Target Month <span className="text-red-500">*</span></label>
                      <input type="month" name="targetMonth" value={formData.targetMonth} onChange={handleChange} className={inputCls} disabled={!!editingTarget} required />
                    </div>
                    <div>
                      <label className={labelCls}>Call Target</label>
                      <input type="number" name="callTarget" value={formData.callTarget} onChange={handleChange} className={inputCls} placeholder="e.g., 40" min="0" />
                    </div>
                    <div>
                      <label className={labelCls}>WhatsApp Target</label>
                      <input type="number" name="whatsappTarget" value={formData.whatsappTarget} onChange={handleChange} className={inputCls} placeholder="e.g., 20" min="0" />
                    </div>
                    <div>
                      <label className={labelCls}>Email Target</label>
                      <input type="number" name="emailTarget" value={formData.emailTarget} onChange={handleChange} className={inputCls} placeholder="e.g., 50" min="0" />
                    </div>
                    <div>
                      <label className={labelCls}>Meeting Target</label>
                      <input type="number" name="meetingTarget" value={formData.meetingTarget} onChange={handleChange} className={inputCls} placeholder="e.g., 5" min="0" />
                    </div>
                    <div>
                      <label className={labelCls}>Revenue Target (in Lakhs) <span className="text-red-500">*</span></label>
                      <input type="number" step="0.01" name="revenueTarget" value={formData.revenueTarget} onChange={handleChange} className={inputCls} placeholder="e.g., 15 for 15 L" min="0" />
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
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                    {editingTarget && (
                      <button type="button" onClick={closeModal} className="px-8 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all rounded-[2px]">Cancel Edit</button>
                    )}
                    {!editingTarget && (
                      <button type="button" onClick={closeModal} className="px-8 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all rounded-[2px]">Cancel</button>
                    )}
                    <button type="submit" className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg">
                      {editingTarget ? "Update Target" : "Save Target"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* LIST AREA */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white px-6 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  User Target Registry
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-0.5">
                  Showing {filteredAndSorted.length} assigned targets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Search targets..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="h-10 w-56 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#23471d] focus:ring-2 focus:ring-[#23471d]/10">
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto font-inter bg-white">
            <table className="w-full min-w-[1280px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-center w-20">
                    <button onClick={() => toggleSort("id")} className="mx-auto uppercase hover:text-slate-900">S.No.</button>
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-left">
                    <button onClick={() => toggleSort("user")} className="uppercase hover:text-slate-900">User</button>
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-left">
                    <button onClick={() => toggleSort("targetMonth")} className="uppercase hover:text-slate-900">Month</button>
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-left">
                    <button onClick={() => toggleSort("callTarget")} className="uppercase hover:text-slate-900">Call Target</button>
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-left">
                    <button onClick={() => toggleSort("whatsappTarget")} className="uppercase hover:text-slate-900">WhatsApp Target</button>
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-left">
                    <button onClick={() => toggleSort("emailTarget")} className="uppercase hover:text-slate-900">Email Target</button>
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-left">
                    <button onClick={() => toggleSort("meetingTarget")} className="uppercase hover:text-slate-900">Meeting Target</button>
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-left">
                    <button onClick={() => toggleSort("revenueTarget")} className="uppercase hover:text-slate-900">Revenue Target</button>
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-center w-32">
                    <button onClick={() => toggleSort("status")} className="mx-auto uppercase hover:text-slate-900">Status</button>
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-left w-44">
                    Modified By
                  </th>
                  <th className="px-6 py-3 text-xs font-extrabold text-slate-600 uppercase text-center w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSorted.length === 0 ? (
                  <tr><td colSpan={11} className="py-10 text-center text-slate-400 text-sm italic">No targets found</td></tr>
                ) : currentPageData.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 transition-colors hover:bg-[#23471d]/5">
                    <td className="px-6 py-3 text-sm text-gray-900 text-center font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td
                      onClick={() => handleEdit(item.id)}
                      className="px-6 py-3 text-md text-[#23471d] hover:text-[#1a3516] cursor-pointer hover:underline font-medium capitalize tracking-tight"
                    >
                      {resolveAdminFullName(item.user)}
                    </td>
                    <td className="px-6 py-3 text-md text-slate-700 font-md">{formatTargetMonth(item.targetMonth)}</td>
                    <td className="px-6 py-3 text-md text-slate-700 font-md">{item.callTarget}</td>
                    <td className="px-6 py-3 text-md text-slate-700 font-md">{item.whatsappTarget}</td>
                    <td className="px-6 py-3 text-md text-slate-700 font-md">{item.emailTarget}</td>
                    <td className="px-6 py-3 text-md text-slate-700 font-md">{item.meetingTarget}</td>
                    <td className="px-6 py-3 text-md text-slate-700 font-md">{item.revenueTarget ? `Rs. ${Number(item.revenueTarget).toFixed(2)} L` : "Rs. 0.00 L"}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.status === "Active"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700">
                      <div className="font-medium Capatalize text-slate-900">{resolveAdminFullName(item.updatedByFullName || item.createdByFullName)}</div>
                      <div className="mt-0.5 text-[8px] font-medium uppercase text-slate-400">{formatDateTime(item.updatedAt || item.createdAt)}</div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-green-200 text-green-700 transition hover:bg-green-50"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50"
                          title="Delete"
                        >
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
