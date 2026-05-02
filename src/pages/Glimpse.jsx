import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, Image as ImageIcon, 
  Type, Upload, BadgeHelp, Edit, List, 
  Users, Globe, Building2, Mic, Handshake, Package, Sparkles, Camera, LayoutGrid, Hash
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const ICONS_LIST = [
    { name: 'Users', icon: Users },
    { name: 'Globe', icon: Globe },
    { name: 'Building2', icon: Building2 },
    { name: 'Mic', icon: Mic },
    { name: 'Handshake', icon: Handshake },
    { name: 'Package', icon: Package },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Camera', icon: Camera },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return null;
    const Comp = found.icon;
    return <Comp {...props} />;
};

const Glimpse = () => {
  // Glimpse Data State
  const [glimpseData, setGlimpseData] = useState({
    subheading: "Event Glimpses",
    heading: "BEST MOMENTS – IHWE 2026",
    highlightText: "BEST MOMENTS",
    description: "A glimpse into the energy, innovation, and success of IHWE 2026.",
    counterText: "Relive the moments that inspired connections and created impact",
    images: [],
    counters: []
  });

  // Image Form State
  const [imageForm, setImageForm] = useState({
    title: "",
    altText: "",
    url: ""
  });

  // Counter Form State
  const [counterForm, setCounterForm] = useState({
    icon: "Users",
    number: "",
    label: "",
    order: 0
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editingImageId, setEditingImageId] = useState(null);
  
  const [isEditingCounter, setIsEditingCounter] = useState(false);
  const [editingCounterId, setEditingCounterId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

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
        description: glimpseData.description,
        counterText: glimpseData.counterText
      });
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Headings updated successfully',
          timer: 1500,
          showConfirmButton: false
        });
        fetchGlimpseData();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update headings.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- IMAGE MANAGEMENT ---

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Image Too Large',
        text: 'Gallery image should not exceed 100KB. Please compress and try again.',
        confirmButtonColor: '#23471d'
      });
      e.target.value = null;
      return;
    }

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

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!imageForm.url || !imageForm.title) {
      return Swal.fire("Warning", "Title and Image are required.", "warning");
    }

    setIsLoading(true);
    try {
      let response;
      if (isEditingImage) {
        response = await api.put(`/api/glimpse/images/${editingImageId}`, imageForm);
      } else {
        response = await api.post("/api/glimpse/images", imageForm);
      }

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: isEditingImage ? 'Image updated' : 'Image added',
          timer: 1500,
          showConfirmButton: false
        });
        fetchGlimpseData();
        resetImageForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetImageForm = () => {
    setImageForm({ title: "", altText: "", url: "" });
    setImagePreview(null);
    setIsEditingImage(false);
    setEditingImageId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startEditImage = (img) => {
    setIsEditingImage(true);
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

  // --- COUNTER MANAGEMENT ---

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    if (!counterForm.number || !counterForm.label) {
      return Swal.fire("Warning", "Number and Label are required.", "warning");
    }

    setIsLoading(true);
    try {
      let response;
      if (isEditingCounter) {
        response = await api.put(`/api/glimpse/counters/${editingCounterId}`, counterForm);
      } else {
        response = await api.post("/api/glimpse/counters", counterForm);
      }

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: isEditingCounter ? 'Counter updated' : 'Counter added',
          timer: 1500,
          showConfirmButton: false
        });
        fetchGlimpseData();
        resetCounterForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetCounterForm = () => {
    setCounterForm({ icon: "Users", number: "", label: "", order: 0 });
    setIsEditingCounter(false);
    setEditingCounterId(null);
  };

  const startEditCounter = (counter) => {
    setIsEditingCounter(true);
    setEditingCounterId(counter._id);
    setCounterForm({
      icon: counter.icon,
      number: counter.number,
      label: counter.label,
      order: counter.order || 0
    });
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const deleteCounter = async (counterId) => {
    const result = await Swal.fire({
      title: "Delete Counter?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await api.delete(`/api/glimpse/counters/${counterId}`);
        if (response.data.success) {
          Swal.fire("Deleted!", "Counter has been removed.", "success");
          fetchGlimpseData();
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete counter.", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="GLIMPSE EVENT MANAGEMENT"
        description="Manage the gallery section: header content, glimpse images, and statistics counters"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left Column: Heading Settings & Image Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Headings Management */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
              <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                <input
                  type="text"
                  name="subheading"
                  value={glimpseData.subheading}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Title</label>
                <input
                  type="text"
                  name="heading"
                  value={glimpseData.heading}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#d26019] mb-1 uppercase tracking-tight">Highlight Text (Orange)</label>
                <input
                  type="text"
                  name="highlightText"
                  value={glimpseData.highlightText}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none shadow-sm"
                  placeholder="Enter text from title to highlight..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Short Description</label>
                <RichTextEditor
                  value={glimpseData.description}
                  onChange={(val) => setGlimpseData({ ...glimpseData, description: val })}
                  placeholder="Enter short description..."
                  minHeight="200px"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Counter Footer Text</label>
                <input
                  type="text"
                  name="counterText"
                  value={glimpseData.counterText}
                  onChange={handleHeadingChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                />
              </div>
              <button
                onClick={saveHeadings}
                disabled={isLoading}
                className="w-full py-3 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mt-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  : <><Save className="w-5 h-5" /> Save Section Content</>}
              </button>
            </div>
            <h1 className="text-3xl font-semibold text-white leading-tight tracking-tight mb-1">
              EVENT GLIMPSES MANAGEMENT
            </h1>
            <p className="text-lg font-medium text-slate-200">
              Manage the gallery section: header content and event glimpse images
            </p>
          </div>

          {/* Add/Edit Image Form */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
              {isEditingImage ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditingImage ? 'Edit Glimpse Image' : 'Add New Glimpse Image'}
            </h2>
            <form onSubmit={handleImageSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image Title (Hover Text)</label>
                <input
                  type="text"
                  name="title"
                  value={imageForm.title}
                  onChange={(e) => setImageForm({...imageForm, title: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-semibold"
                  placeholder="e.g. Global Health Summit"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alt Text (SEO)</label>
                <input
                  type="text"
                  name="altText"
                  value={imageForm.altText}
                  onChange={(e) => setImageForm({...imageForm, altText: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                  placeholder="Image description..."
                />
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gallery Image</label>
                <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-colors p-4 flex flex-col items-center gap-2 bg-gray-50">
                  {imagePreview ? (
                    <div className="relative w-full aspect-[3/2] border-2 border-white shadow-md overflow-hidden bg-white">
                      <img 
                        src={imagePreview.startsWith('http') || imagePreview.startsWith('/uploads') ? (imagePreview.startsWith('http') ? imagePreview : `${SERVER_URL}${imagePreview}`) : imagePreview} 
                        className="w-full h-full object-cover" 
                        alt="Preview" 
                      />
                      <button 
                        type="button"
                        onClick={() => { setImagePreview(null); setImageForm({...imageForm, url: ''}) }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/2] bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                      <span className="text-[10px] text-gray-400 font-bold mt-2">NO IMAGE SELECTED</span>
                    </div>
                  )}
                  <label className="w-full">
                    <div className={`w-full py-2 flex items-center justify-center gap-2 text-white text-xs font-bold cursor-pointer transition-colors ${uploading ? 'bg-gray-400' : 'bg-[#23471d] hover:bg-[#1a3615]'}`}>
                      {uploading ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload size={14} /> Choose Image</>}
                    </div>
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight text-center leading-tight mt-1">
                    Recommended: 1200 x 800 PX (3:2 Ratio) | Max: 100KB
                  </p>
                </div>
              </div>

        </div>
      </div>

      <div className="bg-white shadow-md p-6 min-h-screen">
        {/* <PageHeader
        title="EVENT GLIMPSES MANAGEMENT"
        description="Manage the gallery section: header content and event glimpse images"
      /> */}

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
                  type="submit"
                  disabled={isLoading || uploading}
                  className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isEditingImage ? <><Edit className="w-4 h-4" /> Update Image</> : <><Plus className="w-4 h-4" /> Add Image</>}
                </button>
                {isEditingImage && (
                  <button
                    type="button"
                    onClick={resetImageForm}
                    className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
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

        {/* Right Column: Images List Table & Counters Table */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images Table */}
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-[#23471d] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#d26019]" /> Glimpse Images List
              </h2>
              <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                {glimpseData.images?.length || 0} IMAGES
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="px-6 py-4">No.</th>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Alt Text</th>
                    <th className="px-6 py-4 text-center">LAST UPDATED BY</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {glimpseData.images?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">
                        No images found. Add your first glimpse image.
                      </td>
                    </tr>
                  ) : (
                    glimpseData.images?.map((img, index) => (
                      <tr key={img._id} className="hover:bg-gray-50 transition-colors">
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
                            <div className="flex flex-col gap-1 items-center">
                              <span className="font-bold text-red-600 underline underline-offset-2 uppercase text-[10px]">
                                {img.updatedBy || 'System'}
                              </span>
                              <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap text-center">
                                {img.updatedAt ? new Date(img.updatedAt).toLocaleString('en-GB', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit', hour12: true
                                }) : 'N/A'}
                              </span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => startEditImage(img)} 
                              className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteImage(img._id)} 
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

          {/* Counters Management Section */}
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-[#d26019] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Hash className="w-5 h-5 text-white" /> Glimpse Counters Management
              </h2>
              <span className="bg-[#23471d] text-white text-[10px] font-bold px-2 py-1 rounded">
                {glimpseData.counters?.length || 0} COUNTERS
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b">
                {/* Counter Form */}
                <div className="md:col-span-1 space-y-4 border-r pr-6 border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 uppercase">{isEditingCounter ? 'Edit Counter' : 'Add New Counter'}</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Icon</label>
                            <div className="flex gap-2">
                                <select 
                                    value={counterForm.icon}
                                    onChange={(e) => setCounterForm({...counterForm, icon: e.target.value})}
                                    className="flex-1 px-3 py-1.5 border-2 border-gray-200 focus:border-[#23471d] outline-none text-xs"
                                >
                                    {ICONS_LIST.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                </select>
                                <div className="w-8 h-8 border-2 border-gray-100 flex items-center justify-center shrink-0">
                                    <IconComponent name={counterForm.icon} size={16} className="text-[#23471d]" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Number/Value</label>
                            <input 
                                type="text"
                                value={counterForm.number}
                                onChange={(e) => setCounterForm({...counterForm, number: e.target.value})}
                                className="w-full px-3 py-1.5 border-2 border-gray-200 focus:border-[#23471d] outline-none text-xs"
                                placeholder="e.g. 10,000+"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Label</label>
                            <input 
                                type="text"
                                value={counterForm.label}
                                onChange={(e) => setCounterForm({...counterForm, label: e.target.value})}
                                className="w-full px-3 py-1.5 border-2 border-gray-200 focus:border-[#23471d] outline-none text-xs"
                                placeholder="e.g. Trade Visitors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Order</label>
                            <input 
                                type="number"
                                value={counterForm.order}
                                onChange={(e) => setCounterForm({...counterForm, order: parseInt(e.target.value)})}
                                className="w-full px-3 py-1.5 border-2 border-gray-200 focus:border-[#23471d] outline-none text-xs"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={handleCounterSubmit}
                                className="flex-1 py-2 bg-[#23471d] text-white text-[10px] font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-1.5"
                            >
                                {isEditingCounter ? <><Edit size={12} /> Update</> : <><Plus size={12} /> Add</>}
                            </button>
                            {isEditingCounter && (
                                <button onClick={resetCounterForm} className="px-3 py-2 border border-gray-300 text-gray-500 text-[10px] font-bold">Cancel</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Counter Table */}
                <div className="md:col-span-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b">
                                <tr>
                                    <th className="px-4 py-2">Icon</th>
                                    <th className="px-4 py-2">Value</th>
                                    <th className="px-4 py-2">Label</th>
                                    <th className="px-4 py-2 text-center">Order</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {glimpseData.counters?.sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => (
                                    <tr key={c._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                            <IconComponent name={c.icon} size={14} className="text-[#23471d]" />
                                        </td>
                                        <td className="px-4 py-2 font-bold text-[#d26019]">{c.number}</td>
                                        <td className="px-4 py-2 font-medium">{c.label}</td>
                                        <td className="px-4 py-2 text-center">{c.order}</td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => startEditCounter(c)} className="text-blue-500 hover:text-blue-700 transition-colors"><Edit2 size={14} /></button>
                                                <button onClick={() => deleteCounter(c._id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {glimpseData.counters?.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-400 italic">No counters added yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-200 rounded text-xs text-gray-500 flex items-start gap-3 text-left">
            <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700 mb-1">UI/UX Preview Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 font-medium">
                <li><strong>Image Title:</strong> Displayed in the gallery hover overlay on the website.</li>
                <li><strong>Alt Text:</strong> Used for SEO and accessibility.</li>
                <li><strong>Counters:</strong> These statistics will appear in the green bar below the glimpse gallery.</li>
                <li><strong>Grid Layout:</strong> The gallery uses a premium staggered layout automatically.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Glimpse;
