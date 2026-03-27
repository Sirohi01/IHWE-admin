import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, Image as ImageIcon, 
  Type, Upload, FileDown, BadgeHelp, Edit
} from "lucide-react";
import api, { API_URL, SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';

const Glimpse = () => {
  // Glimpse Data State
  const [glimpseData, setGlimpseData] = useState({
    subheading: "Event Glimpses",
    heading: "Witness the Legacy of Innovation",
    highlightText: "Legacy of Innovation",
    description: "A curated showcase of transformative moments and groundbreaking milestones from a decade of healthcare excellence.",
    images: []
  });

  // Form State for individual image
  const [imageForm, setImageForm] = useState({
    title: "",
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
    fetchGlimpseData();
  }, []);

  const fetchGlimpseData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/glimpse");
      if (response.data.success) {
        setGlimpseData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching glimpse data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Heading changes
  const handleHeadingChange = (e) => {
    setGlimpseData({ ...glimpseData, [e.target.name]: e.target.value });
  };

  // Save Headings
  const saveHeadings = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/glimpse/headings", {
        subheading: glimpseData.subheading,
        heading: glimpseData.heading,
        highlightText: glimpseData.highlightText,
        description: glimpseData.description
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
      const response = await api.post("/api/glimpse/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        setImageForm({ ...imageForm, url: response.data.url });
        setImagePreview(response.data.url);
        Swal.fire({ icon: 'success', title: 'Uploaded!', text: 'Gallery image uploaded', timer: 1000, showConfirmButton: false });
      }
    } catch (error) {
      Swal.fire("Upload Failed", "Image could not be uploaded.", "error");
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
    if (!imageForm.url || !imageForm.title) {
      return Swal.fire("Warning", "Title and Image are required.", "warning");
    }

    setIsLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/api/glimpse/images/${editingImageId}`, imageForm);
      } else {
        response = await api.post("/api/glimpse/images", imageForm);
      }

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: isEditing ? 'Image updated' : 'Image added',
          timer: 1500,
          showConfirmButton: false
        });
        fetchGlimpseData();
        resetForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImageForm({ title: "", altText: "", url: "" });
    setImagePreview(null);
    setIsEditing(false);
    setEditingImageId(null);
  };

  const startEdit = (img) => {
    setIsEditing(true);
    setEditingImageId(img._id);
    setImageForm({
      title: img.title,
      altText: img.altText,
      url: img.url
    });
    setImagePreview(img.url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteImage = async (imageId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This image will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await api.delete(`/api/glimpse/images/${imageId}`);
        if (response.data.success) {
          Swal.fire("Deleted!", "Image has been removed.", "success");
          fetchGlimpseData();
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete image.", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="EVENT GLIMPSES MANAGEMENT"
        description="Manage the gallery section: header content and event glimpse images"
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
                  value={glimpseData.subheading}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Title</label>
                <input
                  type="text"
                  name="heading"
                  value={glimpseData.heading}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#d26019] mb-1 uppercase tracking-tight">Highlight Text (Orange)</label>
                <input
                  type="text"
                  name="highlightText"
                  value={glimpseData.highlightText}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none"
                  placeholder="Enter text from title to highlight..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Short Description</label>
                <textarea
                  name="description"
                  value={glimpseData.description}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24"
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

          {/* Add/Edit Image Form */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
              {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditing ? 'Edit Glimpse Image' : 'Add New Glimpse Image'}
            </h2>
            <form onSubmit={handleSubmitImage} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Image Title (Hover Text)</label>
                <input
                  type="text"
                  name="title"
                  value={imageForm.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
                  placeholder="e.g. Global Health Summit"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Alt Text (SEO)</label>
                <input
                  type="text"
                  name="altText"
                  value={imageForm.altText}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                  placeholder="Image description..."
                />
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-gray-500 uppercase">Gallery Image</label>
                <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-colors p-4 flex flex-col items-center gap-2">
                  {imagePreview ? (
                    <div className="relative w-full h-32 border border-gray-200">
                      <img 
                        src={imagePreview} 
                        className="w-full h-full object-cover" 
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
                      {uploading ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload size={14} /> Choose Image</>}
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
                  {isEditing ? 'Update Image' : 'Add Image To Glimpse'}
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

        {/* Right Column: Cards Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-[#23471d] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileDown className="w-5 h-5 text-[#d26019]" /> Gallery Images List
              </h2>
              <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                {glimpseData.images?.length || 0} IMAGES
              </span>
            </div>
            
            <div className="overflow-x-auto orange-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="px-6 py-4 border-b">No.</th>
                    <th className="px-6 py-4 border-b">Image</th>
                    <th className="px-6 py-4 border-b">Title</th>
                    <th className="px-6 py-4 border-b">Alt Text</th>
                    <th className="px-6 py-4 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {glimpseData.images?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                        No images found in the gallery. Add your first glimpse using the form on the left.
                      </td>
                    </tr>
                  ) : (
                    glimpseData.images?.map((img, index) => (
                      <tr key={img._id} className="hover:bg-gray-50 transition-colors border-b">
                        <td className="px-6 py-4 font-bold text-[#23471d]">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="w-14 h-10 bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
                            <img 
                              src={`${SERVER_URL}${img.url}`} 
                              alt={img.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-sm leading-tight">{img.title}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{img.altText || "-"}</td>
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
                <li><strong>Image Title:</strong> This text will be displayed in the gallery hover overlay on the website.</li>
                <li><strong>Alt Text:</strong> Used for SEO and accessibility (not visible on hover).</li>
                <li><strong>Highlight Text:</strong> Enter text from the main title that should appear in orange color.</li>
                <li><strong>Grid Layout:</strong> The website displays images in a premium staggered 5-column grid.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Glimpse;
