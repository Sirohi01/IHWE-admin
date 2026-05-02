import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Award, ToggleLeft, ToggleRight, GripVertical } from "lucide-react";
import Swal from "sweetalert2";
import api from "../lib/api";
import PageHeader from "../components/PageHeader";

const EMPTY_FORM = { name: "", description: "", status: "Active", order: "" };

const AwardCategoriesManage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/award-categories?all=true");
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, order: categories.length + 1 });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, description: cat.description || "", status: cat.status, order: cat.order || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Swal.fire({ icon: "warning", title: "Required", text: "Category name is required." });
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/award-categories/${editId}`, form);
      } else {
        await api.post("/api/award-categories", form);
      }
      await fetchCategories();
      setShowForm(false);
      Swal.fire({ icon: "success", title: editId ? "Updated!" : "Created!", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete "${name}"?`,
      text: "This will remove the category permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/api/award-categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete." });
    }
  };

  const toggleStatus = async (cat) => {
    const newStatus = cat.status === "Active" ? "Inactive" : "Active";
    try {
      await api.put(`/api/award-categories/${cat._id}`, { ...cat, status: newStatus });
      setCategories(prev => prev.map(c => c._id === cat._id ? { ...c, status: newStatus } : c));
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to update status." });
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <div className="relative w-full h-64 overflow-hidden rounded mt-8">
        {/* Background Image */}
        <img
          src="/award.png"
          alt="Award Categories Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
          <Award className="w-16 h-16 mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
            Award Categories
          </h1>
          <p className="text-lg mt-2 text-center text-white/90">
            Manage award categories for Namo Gange Global Health Excellence Awards
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6 space-y-5">
        <PageHeader
          // title="Award Categories"
          subtitle="Manage award categories for Namo Gange Global Health Excellence Awards"
        />

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#008d48] text-white rounded-lg text-[12px] font-black uppercase tracking-widest hover:bg-[#007a3e] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#008d48] rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-black text-[#0a2e5c] text-[14px]">
                  {editId ? "Edit Category" : "Add New Category"}
                </h2>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Category Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Best Hospital / Healthcare Institution"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Description (Optional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of this award category..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={e => setForm(p => ({ ...p, order: e.target.value }))}
                    placeholder="1"
                    min="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#008d48]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#008d48] text-white rounded-lg font-black text-[12px] uppercase tracking-widest hover:bg-[#007a3e] transition-all disabled:opacity-60"
                >
                  {saving ? "Saving..." : editId ? "Update Category" : "Add Category"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold text-[12px] hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#008d48] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-[13px]">No categories yet. Add your first one!</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Order", "Category Name", "Description", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-300" />
                      <span className="text-[12px] font-black text-slate-400">{cat.order || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-[#008d48]" />
                      </div>
                      <span className="text-[13px] font-bold text-[#0a2e5c]">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-slate-400 font-medium">{cat.description || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border transition-all ${
                        cat.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {cat.status === "Active"
                        ? <ToggleRight className="w-3.5 h-3.5" />
                        : <ToggleLeft className="w-3.5 h-3.5" />
                      }
                      {cat.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
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
        )}
      </div>

      <p className="text-[11px] text-slate-400 font-medium">
        Total: <strong>{categories.length}</strong> categories &nbsp;|&nbsp;
        Active: <strong>{categories.filter(c => c.status === "Active").length}</strong> &nbsp;|&nbsp;
        Inactive: <strong>{categories.filter(c => c.status === "Inactive").length}</strong>
      </p>
    </div>
    </>
  );
};

export default AwardCategoriesManage;
