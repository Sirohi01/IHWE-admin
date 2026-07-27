import React, { useEffect, useMemo, useState } from "react";
import {
  Edit,
  Eye,
  FilePlus,
  Filter,
  Link as LinkIcon,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const categories = [
  "Brochure",
  "Poster",
  "Testimonials",
  "Videos",
  "Website Links",
  "Office Location",
  "Venue Location",
  "Marketing PPT",
  "Social Media Posts",
  "Sponsorship Proposal",
  "Marketing Proposal",
  "Booking Form",
];

const categoryFileTypes = {
  "Brochure": ["PDF", "Image"],
  "Poster": ["Image", "PDF"],
  "Testimonials": ["Video", "Image", "PDF", "Link"],
  "Videos": ["Video", "Link"],
  "Website Links": ["Link"],
  "Office Location": ["Location", "Link"],
  "Venue Location": ["Location", "Link"],
  "Marketing PPT": ["PPT", "PDF"],
  "Social Media Posts": ["Image", "Video", "Link"],
  "Sponsorship Proposal": ["PDF", "PPT", "Word", "Image"],
  "Marketing Proposal": ["PDF", "PPT", "Word", "Image"],
  "Booking Form": ["PDF", "Word", "Link", "Image"],
};

const emptyForm = {
  category: "Brochure",
  title: "",
  fileType: "PDF",
  fileUrl: "",
  files: [],
  totalPages: "",
  isActive: true,
};

const createEmptyForm = () => ({ ...emptyForm });

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MarketingManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState(createEmptyForm());
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const materialsPerPage = 10;

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/api/marketing-materials?includeInactive=true");
      if (res.data.success) {
        setMaterials(res.data.flatData || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch materials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // 400ms delay
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  const stats = useMemo(() => {
    const active = materials.filter((material) => material.isActive !== false).length;
    return {
      total: materials.length,
      active,
      inactive: materials.length - active,
    };
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    return materials.filter((material) => {
      const matchesSearch =
        !term ||
        material.title?.toLowerCase().includes(term) ||
        material.category?.toLowerCase().includes(term) ||
        material.fileType?.toLowerCase().includes(term) ||
        material.createdBy?.toLowerCase().includes(term) ||
        material.updatedBy?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && material.isActive !== false) ||
        (statusFilter === "Inactive" && material.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [materials, debouncedSearchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredMaterials.length / materialsPerPage);
  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = filteredMaterials.slice(indexOfFirstMaterial, indexOfLastMaterial);

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData(createEmptyForm());
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setEditingMaterial(null);
    setFormData(createEmptyForm());
    setIsFormOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, files, checked, type } = e.target;
    if (name === "files") {
      setFormData((prev) => ({ ...prev, files: files ? Array.from(files) : [] }));
      return;
    }

    if (name === "category") {
      const allowedTypes = categoryFileTypes[value] || ["PDF"];
      setFormData((prev) => ({
        ...prev,
        category: value,
        fileType: allowedTypes[0], // auto select first allowed type
        files: [],
        fileUrl: ""
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = (item, singleFile = null) => {
    const data = new FormData();
    data.append("category", item.category);
    
    let finalTitle = item.title.trim();
    if (singleFile && item.files && item.files.length > 1) {
      // Remove extension for cleaner title
      const fileNameWithoutExt = singleFile.name.replace(/\.[^/.]+$/, "");
      finalTitle = `${finalTitle} - ${fileNameWithoutExt}`;
    }
    data.append("title", finalTitle);

    data.append("fileType", item.fileType);
    data.append("isActive", String(item.isActive));
    if (item.totalPages) data.append("totalPages", item.totalPages);

    let adminInfo = {};
    try {
      adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
    } catch (e) {}
    const adminName = adminInfo.fullName || adminInfo.name || "Admin";

    if (editingMaterial) {
      data.append("updatedBy", adminName);
    } else {
      data.append("createdBy", adminName);
      data.append("updatedBy", adminName);
    }

    if (item.fileType === "Link" || item.fileType === "Location") {
      data.append("fileUrl", item.fileUrl.trim());
    } else {
      if (singleFile) {
        data.append("file", singleFile);
      } else if (editingMaterial?.fileUrl && (!item.files || item.files.length === 0)) {
        data.append("fileUrl", editingMaterial.fileUrl);
      }
    }

    return data;
  };

  const validateMaterial = (item, isEditing = false) => {
    if (!item.title.trim()) return "Please enter title.";
    if ((item.fileType === "Link" || item.fileType === "Location") && !item.fileUrl.trim()) return "Please provide a link/location URL.";
    if (!isEditing && item.fileType !== "Link" && item.fileType !== "Location" && (!item.files || item.files.length === 0)) {
      return "Please upload at least one file.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateMaterial(formData, !!editingMaterial);
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editingMaterial) {
        const res = await api.put(
          `/api/marketing-materials/${editingMaterial._id}`,
          buildPayload(formData, formData.files?.[0]),
          config
        );
        if (res.data.success) {
          toast.success("Material updated successfully!");
          resetForm();
          fetchMaterials();
        }
        return;
      }

      const isLinkType = formData.fileType === "Link" || formData.fileType === "Location";

      if (isLinkType) {
        const res = await api.post("/api/marketing-materials", buildPayload(formData), config);
        if (res.data.success) {
          toast.success("Material added successfully!");
          resetForm();
          fetchMaterials();
        }
      } else {
        const responses = [];
        for (const file of formData.files) {
          responses.push(await api.post("/api/marketing-materials", buildPayload(formData, file), config));
        }

        if (responses.every((res) => res.data.success)) {
          toast.success(`${formData.files.length} material${formData.files.length > 1 ? "s" : ""} added successfully!`);
          resetForm();
          fetchMaterials();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save material");
    } finally {
      setIsSaving(false);
    }
  };

  const renderMaterialFields = () => {
    const item = formData;
    const onChange = handleChange;

    const getAcceptType = (type) => {
      if (type === "PDF") return ".pdf";
      if (type === "Image") return "image/*";
      if (type === "Video") return "video/*";
      if (type === "PPT") return ".ppt,.pptx";
      if (type === "Word") return ".doc,.docx";
      return "*";
    };

    const isLinkType = item.fileType === "Link" || item.fileType === "Location";
    const allowedFileTypes = categoryFileTypes[item.category] || ["PDF"];

    return (
      <div className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
              Category
            </label>
            <select
              name="category"
              value={item.category}
              onChange={onChange}
              className="w-full border border-gray-300 bg-gray-50 p-2 rounded-sm text-xs font-semibold focus:outline-none focus:border-[#23471d]"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={item.title}
              onChange={onChange}
              className="w-full border border-gray-300 bg-gray-50 p-2 rounded-sm text-xs font-semibold focus:outline-none focus:border-[#23471d]"
              required
              placeholder="IHWE 2026 Main Brochure"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
              File Type
            </label>
            <select
              name="fileType"
              value={item.fileType}
              onChange={onChange}
              className="w-full border border-gray-300 bg-gray-50 p-2 rounded-sm text-xs font-semibold focus:outline-none focus:border-[#23471d]"
              required
            >
              {allowedFileTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {!isLinkType && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                Pages
              </label>
              <input
                type="number"
                name="totalPages"
                min="1"
                value={item.totalPages}
                onChange={onChange}
                className="w-full border border-gray-300 bg-gray-50 p-2 rounded-sm text-xs font-semibold focus:outline-none focus:border-[#23471d]"
                placeholder="Optional"
              />
            </div>
          )}

          {isLinkType ? (
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                {item.fileType === "Location" ? "Google Map URL" : "Link URL"}
              </label>
              <input
                type="url"
                name="fileUrl"
                value={item.fileUrl}
                onChange={onChange}
                className="w-full border border-gray-300 bg-gray-50 p-2 rounded-sm text-xs font-semibold focus:outline-none focus:border-[#23471d]"
                required
                placeholder={item.fileType === "Location" ? "https://maps.google.com/..." : "https://example.com"}
              />
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                Upload {item.fileType} {editingMaterial ? "(leave blank to keep existing)" : ""}
              </label>
              <input
                type="file"
                name="files"
                multiple={!editingMaterial}
                onChange={onChange}
                accept={getAcceptType(item.fileType)}
                className="w-full border border-gray-300 bg-gray-50 p-1.5 rounded-sm text-xs font-semibold focus:outline-none focus:border-[#23471d] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required={!editingMaterial}
              />
              {!editingMaterial && (
                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">You can select multiple files at once.</p>
              )}
            </div>
          )}

          <div className="md:col-span-2 flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-sm px-3 py-3 mt-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
              Active Status
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isActive"
                  value="true"
                  checked={String(item.isActive) === "true"}
                  onChange={onChange}
                  className="h-4 w-4 accent-[#23471d]"
                />
                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isActive"
                  value="false"
                  checked={String(item.isActive) === "false"}
                  onChange={onChange}
                  className="h-4 w-4 accent-red-600"
                />
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Inactive</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      category: material.category || "Brochure",
      title: material.title || "",
      fileType: material.fileType || "PDF",
      fileUrl: material.fileType === "Link" ? material.fileUrl || "" : "",
      files: [],
      totalPages: material.totalPages || "",
      isActive: material.isActive !== false,
    });
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (material) => {
    try {
      const payload = new FormData();
      payload.append("category", material.category);
      payload.append("title", material.title);
      payload.append("fileType", material.fileType);
      payload.append("fileUrl", material.fileUrl);
      payload.append("isActive", String(material.isActive === false));
      if (material.totalPages) payload.append("totalPages", material.totalPages);

      const res = await api.put(`/api/marketing-materials/${material._id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success(`Material marked ${material.isActive === false ? "Active" : "Inactive"}`);
        fetchMaterials();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this material!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.delete(`/api/marketing-materials/${id}`);
      if (res.data.success) {
        toast.success("Material deleted!");
        fetchMaterials();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete material");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-[#23471d] mb-4" size={40} />
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Loading Marketing Materials...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md mt-1 p-6 min-h-screen">
      <PageHeader
        title="Marketing Material Management"
        description="Manage client-facing marketing assets, status visibility and material details"
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b bg-[#23471d] flex justify-between items-center">
              <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
                <FilePlus className="w-5 h-5 text-[#d26019]" />
                {editingMaterial ? "Update Material" : "Add Materials"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
                {renderMaterialFields()}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#d26019] text-white font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="animate-spin w-4 h-4" /> : <FilePlus className="w-4 h-4" />}
                  {isSaving
                    ? "Saving..."
                    : editingMaterial
                      ? "Update Material"
                      : `Add Material${formData.files && formData.files.length > 1 ? "s" : ""}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100 gap-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-6 h-6 text-[#d26019]" />
          <h2 className="text-lg font-black text-[#23471d] uppercase tracking-tight">Marketing Material List</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-sm text-xs font-semibold focus:outline-none focus:border-[#23471d] w-full sm:w-64"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest focus:outline-none focus:border-[#23471d]"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <Filter className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 bg-[#d26019] text-white px-5 py-1.5 rounded-sm shadow-sm hover:bg-orange-700 text-xs font-black uppercase tracking-widest"
          >
            <FilePlus className="w-4 h-4" />
            Add Material
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#23471d] text-white text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-2 w-16 text-center">S.No</th>
                <th className="px-6 py-2">Material Details</th>
                <th className="px-6 py-2">Type / Size</th>
                <th className="px-6 py-2">Create / Updated Details</th>
                <th className="px-6 py-2 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentMaterials.map((material, index) => (
                <tr key={material._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-2 text-center font-semibold text-[#23471d] text-[9px]">
                    {(indexOfFirstMaterial + index + 1).toString().padStart(2, "0")}
                  </td>
                  <td className="px-6 py-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-gray-800 uppercase tracking-tight">
                        {material.title}
                      </span>
                      <span className="text-[9px] font-bold text-[#d26019] uppercase tracking-widest mt-0.5">
                        {material.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[9px] font-bold uppercase rounded-sm border border-gray-200">
                        {material.fileType}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[9px] font-bold uppercase rounded-sm border border-gray-200">
                        {material.fileSize || "-"}
                      </span>
                      {material.totalPages && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase rounded-sm border border-blue-100">
                          {material.totalPages} Pages
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-2">
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] font-bold text-gray-800 uppercase">
                        {material.updatedBy || material.createdBy || "Admin"}
                      </span>
                      <span className="text-[9px] font-semibold text-gray-500 whitespace-nowrap">
                        {formatDateTime(material.updatedAt || material.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(material)}
                        className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${material.isActive !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                        title="Toggle Active / Inactive"
                      >
                        {material.isActive !== false ? "Active" : "Inactive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(material)}
                        title="Edit Material"
                        className="p-1.5 bg-[#d26019]/10 text-[#d26019] hover:bg-[#d26019] hover:text-white transition-colors rounded-sm shadow-sm inline-flex items-center"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(material._id)}
                        title="Delete Material"
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors rounded-sm shadow-sm inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest">
                    No materials found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMaterials.length > 0 && totalPages > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredMaterials.length}
            itemsPerPage={materialsPerPage}
            onPageChange={setCurrentPage}
            label="materials"
          />
        </div>
      )}
    </div>
  );
};

export default MarketingManagement;
