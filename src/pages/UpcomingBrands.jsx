import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Plus, Edit2, Trash2, Save, BadgeHelp, Edit, List, Type, Image as ImageIcon, Search, ChevronLeft, ChevronRight } from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';

const UpcomingBrands = () => {
  const getImageUrl = (path) => {
    if (!path) return '';
    return `${SERVER_URL}${path}`;
  };
  const [settings, setSettings] = useState({
    title: "UPCOMING LEADING BRANDS",
    items: []
  });

  const [itemForm, setItemForm] = useState({
    logo: null,
    logoName: "",
    altText: "",
    order: 0
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/upcoming-brands?page=${currentPage}&limit=${limit}&search=${search}`);
      if (response.data.success) {
        setSettings(response.data.data);
        setTotalPages(response.data.data.totalPages || 1);
        setTotalItems(response.data.data.total || response.data.data.items?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData();
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // Small timeout to allow state to update before fetch
      setTimeout(() => fetchData(), 0);
    }
  };

  const handleSettingsSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/upcoming-brands/settings", {
        title: settings.title
      });
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Settings Saved', timer: 1500, showConfirmButton: false });
        fetchData();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm({ ...itemForm, logo: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing && !itemForm.logo) return Swal.fire("Warning", "Logo image is required", "warning");

    setIsLoading(true);
    const formData = new FormData();
    if (itemForm.logo instanceof File) {
        formData.append("logo", itemForm.logo);
    }
    formData.append("logoName", itemForm.logoName);
    formData.append("altText", itemForm.altText);
    formData.append("order", itemForm.order);

    try {
      let response;
      if (isEditing) {
        response = await api.put(`/api/upcoming-brands/items/${editingId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post("/api/upcoming-brands/items", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: isEditing ? 'Brand Updated' : 'Brand Added', timer: 1500, showConfirmButton: false });
        fetchData();
        resetForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setItemForm({ logo: null, logoName: "", altText: "", order: 0 });
    setPreviewImage(null);
    setIsEditing(false);
    setEditingId(null);
    document.getElementById("logoInput").value = "";
  };

  const startEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setItemForm({
      logo: item.logo,
      logoName: item.logoName || "",
      altText: item.altText || "",
      order: item.order || 0
    });
    setPreviewImage(getImageUrl(item.logo));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This brand will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await api.delete(`/api/upcoming-brands/items/${id}`);
        if (response.data.success) {
          Swal.fire("Deleted!", "Brand removed.", "success");
          fetchData();
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-md p-6 min-h-screen">
      <PageHeader
        title="UPCOMING BRANDS MANAGEMENT"
        description="Manage the upcoming leading brands logos and section heading"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left Column: Settings & Form */}
        <div className="lg:col-span-1 space-y-6">

          {/* Section Settings */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
              <Type className="w-5 h-5 text-[#d26019]" /> Section Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Section Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                />
              </div>
              <button
                onClick={handleSettingsSave}
                disabled={isLoading}
                className="w-full py-3 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mt-2"
              >
                <Save className="w-5 h-5" /> Save Section Content
              </button>
            </div>
          </div>

          {/* Add/Edit Item Form */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
              {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditing ? 'Edit Brand' : 'Add New Brand'}
            </h2>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo Image</label>
                <input
                  type="file"
                  id="logoInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                />
                {previewImage && (
                    <div className="mt-2 p-2 border border-gray-200 rounded flex justify-center bg-gray-50">
                        <img src={previewImage} alt="Preview" className="h-16 object-contain" />
                    </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Name</label>
                <input
                  type="text"
                  value={itemForm.logoName}
                  onChange={(e) => setItemForm({ ...itemForm, logoName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                  placeholder="e.g. Brand Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alt Text (Optional)</label>
                <input
                  type="text"
                  value={itemForm.altText}
                  onChange={(e) => setItemForm({ ...itemForm, altText: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                  placeholder="e.g. Image description"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Order</label>
                <input
                  type="number"
                  value={itemForm.order}
                  onChange={(e) => setItemForm({ ...itemForm, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isEditing ? <><Edit className="w-4 h-4" /> Update Brand</> : <><Plus className="w-4 h-4" /> Add Brand</>}
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
        </div>

        {/* Right Column: Items Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-lg">
            <div className="px-6 py-4 border-b bg-[#23471d] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <List className="w-5 h-5 text-[#d26019]" /> Brands List
                </h2>
                <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                  {totalItems} ITEMS
                </span>
              </div>
              
              <form onSubmit={handleSearch} className="flex items-center w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Brand Name..."
                    className="w-full px-4 py-2 pl-10 rounded text-sm text-gray-900 border-none outline-none focus:ring-2 focus:ring-[#d26019]"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  {search && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 font-bold"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <button type="submit" className="ml-2 bg-[#d26019] hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                  Search
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="px-6 py-4">No.</th>
                    <th className="px-6 py-4">Logo</th>
                    <th className="px-6 py-4">Brand Name</th>
                    <th className="px-6 py-4 text-center">Order</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settings.items?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                        No brands found. Add your first upcoming brand.
                      </td>
                    </tr>
                  ) : (
                    settings.items?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#23471d]">{index + 1}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="w-16 h-10 mx-auto rounded bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                            <img src={getImageUrl(item.logo)} alt={item.altText} className="max-h-full max-w-full object-contain" />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">{item.logoName || item.altText || '-'}</td>
                        <td className="px-6 py-4 text-center font-bold text-gray-600">{item.order}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteItem(item._id)}
                              className="text-red-500 hover:text-red-700 p-1 transition-colors"
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
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
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
                            ? 'bg-[#23471d] text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500 flex items-start gap-3">
            <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700 mb-1">Management Tips:</p>
              <ul className="list-disc list-inside space-y-1 font-medium italic">
                <li>Upload PNG logos with transparent backgrounds for best results.</li>
                <li>Items are sorted by the 'Order' number provided.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingBrands;
