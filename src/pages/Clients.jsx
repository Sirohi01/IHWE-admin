import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, Image as ImageIcon, 
  Type, Upload, FileDown, BadgeHelp, Edit
} from "lucide-react";
import api, { API_URL, SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';

const Clients = () => {
  // Clients Data State
  const [clientData, setClientData] = useState({
    subheading: "Join the Leaders",
    heading: "Our Exhibitors & Industry Partners",
    highlightText: "Exhibitors",
    images: []
  });

  // Form State for individual logo
  const [imageForm, setImageForm] = useState({
    altText: "",
    url: ""
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingImageId, setEditingImageId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/client");
      if (response.data.success) {
        setClientData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Heading changes
  const handleHeadingChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  // Save Headings
  const saveHeadings = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/client/headings", {
        subheading: clientData.subheading,
        heading: clientData.heading,
        highlightText: clientData.highlightText
      });
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Headings updated successfully',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update headings.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Image Upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const response = await api.post("/api/client/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        setImageForm({ ...imageForm, url: response.data.url });
        setImagePreview(response.data.url);
        Swal.fire({ icon: 'success', title: 'Uploaded!', text: 'Client logo uploaded', timer: 1000, showConfirmButton: false });
      }
    } catch (error) {
      Swal.fire("Upload Failed", "Logo could not be uploaded.", "error");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // Handle Image Form changes
  const handleFormChange = (e) => {
    setImageForm({ ...imageForm, [e.target.name]: e.target.value });
  };

  // Add or Update Image
  const handleSubmitImage = async (e) => {
    e.preventDefault();
    if (!imageForm.url) {
      return Swal.fire("Warning", "Logo image is required.", "warning");
    }

    setIsLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/api/client/images/${editingImageId}`, imageForm);
      } else {
        response = await api.post("/api/client/images", imageForm);
      }

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: isEditing ? 'Logo updated' : 'Logo added',
          timer: 1500,
          showConfirmButton: false
        });
        fetchClientData();
        resetForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImageForm({ altText: "", url: "" });
    setImagePreview(null);
    setIsEditing(false);
    setEditingImageId(null);
  };

  const startEdit = (img) => {
    setIsEditing(true);
    setEditingImageId(img._id);
    setImageForm({
      altText: img.altText,
      url: img.url
    });
    setImagePreview(img.url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteImage = async (imageId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This logo will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await api.delete(`/api/client/images/${imageId}`);
        if (response.data.success) {
          Swal.fire("Deleted!", "Logo has been removed.", "success");
          fetchClientData();
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete logo.", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="EXHIBITORS & PARTNERS MANAGEMENT"
        description="Manage the client logos section: header content and partner logos"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Heading Settings & Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Headings Management */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
              <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
            </h2>
            <div className="p-0 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                <input
                  type="text"
                  name="subheading"
                  value={clientData.subheading}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Title</label>
                <input
                  type="text"
                  name="heading"
                  value={clientData.heading}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#d26019] mb-1 uppercase tracking-tight">Highlight Text (Orange)</label>
                <input
                  type="text"
                  name="highlightText"
                  value={clientData.highlightText}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none"
                  placeholder="Enter text from title to highlight..."
                />
              </div>
              <button
                onClick={saveHeadings}
                disabled={isLoading}
                className="w-full py-2 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Headings
              </button>
            </div>
          </div>

          {/* Add/Edit Logo Form */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
              {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditing ? 'Edit Client Logo' : 'Add New Client Logo'}
            </h2>
            <form onSubmit={handleSubmitImage} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Alt Text (SEO)</label>
                <input
                  type="text"
                  name="altText"
                  value={imageForm.altText}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                  placeholder="Exhibitor name or description..."
                />
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-gray-500 uppercase">Client Logo</label>
                <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-colors p-4 flex flex-col items-center gap-2">
                  {imagePreview ? (
                    <div className="relative w-full h-32 border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                      <img 
                        src={imagePreview.startsWith('data:') || imagePreview.startsWith('/uploads') ? `${imagePreview.startsWith('data:') ? '' : SERVER_URL}${imagePreview}` : `${SERVER_URL}${imagePreview}`} 
                        className="max-w-full max-h-full object-contain" 
                        alt="Preview" 
                      />
                      <button 
                        type="button"
                        onClick={() => { setImagePreview(null); setImageForm({...imageForm, url: ''}) }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                  <label className="w-full">
                    <div className={`w-full py-2 flex items-center justify-center gap-2 text-white text-xs font-bold cursor-pointer transition-colors ${uploading ? 'bg-gray-400' : 'bg-[#23471d] hover:bg-[#1a3615]'}`}>
                      {uploading ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload size={14} /> Choose Logo</>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || uploading}
                  className="flex-1 py-2 bg-[#d26019] text-white font-bold hover:bg-[#b35215] transition-colors disabled:opacity-50"
                >
                  {isEditing ? 'Update Logo' : 'Add Logo To Clients'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Logos Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-[#23471d] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileDown className="w-5 h-5 text-[#d26019]" /> Client Logos List
              </h2>
              <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                {clientData.images?.length || 0} LOGOS
              </span>
            </div>
            
            <div className="overflow-x-auto orange-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="px-6 py-4 border-b">No.</th>
                    <th className="px-6 py-4 border-b">Logo</th>
                    <th className="px-6 py-4 border-b">Alt Text / Name</th>
                    <th className="px-6 py-4 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientData.images?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                        No logos found. Add your first client logo using the form on the left.
                      </td>
                    </tr>
                  ) : (
                    clientData.images?.map((img, index) => (
                      <tr key={img._id} className="hover:bg-gray-50 transition-colors border-b">
                        <td className="px-6 py-4 font-bold text-[#23471d]">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="w-16 h-12 bg-white border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center p-1">
                            <img 
                              src={`${SERVER_URL}${img.url}`} 
                              alt={img.altText} 
                              className="max-w-full max-h-full object-contain" 
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-sm leading-tight">{img.altText || "Untitled Logo"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => startEdit(img)} 
                              className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all rounded shadow-sm hover:shadow"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteImage(img._id)} 
                              className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all rounded shadow-sm hover:shadow"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-200 rounded text-xs text-gray-500 flex items-start gap-3 text-left">
            <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700 mb-1">UI/UX Preview Guidelines:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Logos:</strong> Should ideally be PNG with transparent background or high-quality JPG with white background.</li>
                <li><strong>Alt Text:</strong> Used for SEO and accessibility. Mention the company name.</li>
                <li><strong>Highlight Text:</strong> Enter text from the main title that should appear in orange color.</li>
                <li><strong>Carousel:</strong> The website displays these logos in a smooth auto-scrolling marquee.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
