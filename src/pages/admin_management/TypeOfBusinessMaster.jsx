import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Plus, Edit2, Trash2, Edit, List, Type, Search, ChevronLeft, ChevronRight, BadgeHelp } from "lucide-react";
import api from "../../lib/api";
import PageHeader from "../../components/PageHeader";

const DEFAULT_BUSINESS_TYPES = [
  "Pvt. Ltd. Company",
  "Pub. Ltd. Company",
  "Partnership Company",
  "Limited Liability Partnership (LLP)",
  "One Person Company",
  "Sole Proprietorship",
  "Section 8 Company",
  "Others"
];

export default function TypeOfBusinessMaster() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    business_type: "",
    order: 1,
    status: "Active"
  });

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/business-types");
      let data = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      // If empty, auto-seed defaults into DB
      if (data.length === 0) {
        const seeded = [];
        for (let i = 0; i < DEFAULT_BUSINESS_TYPES.length; i++) {
          try {
            const res = await api.post("/api/business-types", {
              business_type: DEFAULT_BUSINESS_TYPES[i],
              order: i + 1,
              status: "Active",
              added_by: "System",
              nature_id: `BT-${Date.now()}-${i}`
            });
            if (res.data) seeded.push(res.data);
          } catch (e) {
            console.error("Seeding error:", e);
          }
        }
        data = seeded.length > 0 ? seeded : DEFAULT_BUSINESS_TYPES.map((name, idx) => ({
          _id: `default-${idx}`,
          business_type: name,
          order: idx + 1,
          status: "Active"
        }));
      }

      setItems(data);
      setForm((prev) => ({ ...prev, order: data.length + 1 }));
    } catch (error) {
      console.error("Error fetching business types:", error);
      Swal.fire("Error", "Failed to load Business Types", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_type.trim()) {
      return Swal.fire("Warning", "Please enter Business Type Name", "warning");
    }

    setIsLoading(true);
    const adminData = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
    let adminId = "admin";
    if (adminData) {
      try {
        adminId = JSON.parse(adminData).username || JSON.parse(adminData).fullName || "admin";
      } catch (e) {}
    }

    const payload = {
      business_type: form.business_type.trim(),
      order: Number(form.order) || 0,
      status: form.status || "Active",
      added_by: adminId,
      nature_id: `BT-${Date.now()}`
    };

    try {
      if (isEditing) {
        await api.put(`/api/business-types/${editingId}`, payload);
        Swal.fire({ icon: "success", title: "Business Type Updated", timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/api/business-types", payload);
        Swal.fire({ icon: "success", title: "Business Type Added", timer: 1500, showConfirmButton: false });
      }
      fetchData();
      resetForm();
    } catch (error) {
      console.error("Save error:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to save Business Type", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id || item.id);
    setForm({
      business_type: item.business_type || "",
      order: item.order || item.display_order || 1,
      status: item.status || "Active"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this business type option?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await api.delete(`/api/business-types/${id}`);
        Swal.fire("Deleted!", "Business Type removed successfully.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Failed to delete", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setForm({
      business_type: "",
      order: items.length + 1,
      status: "Active"
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Filter & Pagination Logic
  const filteredItems = items.filter((item) =>
    (item.business_type || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedData = filteredItems.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="bg-white shadow-md p-6 min-h-screen">
      <PageHeader
        title="TYPE OF BUSINESS MANAGEMENT"
        description="Manage dynamic options for Type of Business dropdown used across Lead registration forms"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
              {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditing ? "Edit Business Type" : "Add New Business Type"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Business Type Name *
                </label>
                <input
                  required
                  type="text"
                  value={form.business_type}
                  onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                  placeholder="e.g. Pvt. Ltd. Company"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isEditing ? (
                    <>
                      <Edit className="w-4 h-4" /> Update Business Type
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add Business Type
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500 flex items-start gap-3">
            <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700 mb-1">Management Tips:</p>
              <ul className="list-disc list-inside space-y-1 font-medium italic">
                <li>Options created here automatically appear in the <strong>Type of Business</strong> dropdown across Lead registration forms.</li>
                <li>Items are sorted by the 'Order' number provided.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Items Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-lg">
            <div className="px-6 py-4 border-b bg-[#23471d] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <List className="w-5 h-5 text-[#d26019]" /> Business Type List
                </h2>
                <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                  {totalItems} ITEMS
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-2 w-full sm:w-auto justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Show</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border-none bg-transparent outline-none text-sm font-bold text-[#23471d] cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by Name..."
                    className="w-full bg-white px-4 py-2 pl-10 rounded text-sm text-gray-900 border border-gray-300 outline-none focus:ring-2 focus:ring-[#d26019]"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="px-6 py-4">No.</th>
                    <th className="px-6 py-4">Business Type Name</th>
                    <th className="px-6 py-4 text-center">Order</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                        No Business Types found. Add your first business type option.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => (
                      <tr key={item._id || item.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#23471d]">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                          {item.business_type}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-600">
                          {item.order || item.display_order || index + 1}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.status === "Active" || item.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteItem(item._id || item.id)}
                              className="text-red-500 hover:text-red-700 p-1 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                          currentPage === idx + 1
                            ? "bg-[#23471d] text-white"
                            : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
