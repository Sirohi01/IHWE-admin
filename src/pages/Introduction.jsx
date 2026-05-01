import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, BadgeHelp, Edit, List, 
  Type, Palette, ImageIcon, 
  Stethoscope, Landmark, Leaf, Globe, Building2, GraduationCap, 
  Users, Handshake, Package, Sparkles, Camera, ShieldCheck, UserCheck, Activity, Award, Briefcase
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const ICONS_LIST = [
    { name: 'Award', icon: Award },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Users', icon: Users },
    { name: 'Globe', icon: Globe },
    { name: 'Stethoscope', icon: Stethoscope },
    { name: 'Landmark', icon: Landmark },
    { name: 'Leaf', icon: Leaf },
    { name: 'Building2', icon: Building2 },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'Handshake', icon: Handshake },
    { name: 'Package', icon: Package },
    { name: 'Camera', icon: Camera },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'UserCheck', icon: UserCheck },
    { name: 'Activity', icon: Activity },
    { name: 'Briefcase', icon: Briefcase },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return null;
    const Comp = found.icon;
    return <Comp {...props} />;
};

const Introduction = () => {
  const [data, setData] = useState({
    subtitle: "",
    title: "",
    description: "",
    image: "",
    altText: "",
    bgColor: "#ffffff",
    features: []
  });

  const [featureForm, setFeatureForm] = useState({
    icon: "Award",
    number: "",
    label: "",
    order: 0
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/introduction");
      if (response.data.success) {
        setData(response.data.data);
        if (response.data.data.image) {
            setPreviewUrl(`${SERVER_URL}${response.data.data.image}`);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSettingsSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('subtitle', data.subtitle);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('altText', data.altText);
      formData.append('bgColor', data.bgColor);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.post("/api/introduction/settings", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Settings Saved', timer: 1500, showConfirmButton: false });
        fetchData();
        setImageFile(null);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    if (!featureForm.number || !featureForm.label) return Swal.fire("Warning", "Number and Label are required", "warning");

    setIsLoading(true);
    try {
      let response;
      if (isEditingFeature) {
        response = await api.put(`/api/introduction/features/${editingFeatureId}`, featureForm);
      } else {
        response = await api.post("/api/introduction/features", featureForm);
      }

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: isEditingFeature ? 'Feature Updated' : 'Feature Added', timer: 1500, showConfirmButton: false });
        fetchData();
        resetFeatureForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFeatureForm = () => {
    setFeatureForm({ icon: "Award", number: "", label: "", order: 0 });
    setIsEditingFeature(false);
    setEditingFeatureId(null);
  };

  const startEditFeature = (item) => {
    setIsEditingFeature(true);
    setEditingFeatureId(item._id);
    setFeatureForm({
      icon: item.icon,
      number: item.number,
      label: item.label,
      order: item.order || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteFeature = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This feature will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await api.delete(`/api/introduction/features/${id}`);
        if (response.data.success) {
          Swal.fire("Deleted!", "Feature removed.", "success");
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
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="INTRODUCTION MANAGEMENT"
        description="Manage the main introduction content, collage image, and statistics"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Main Settings (subtitle, title, desc, image, bg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d] border-b-2 border-gray-100 pb-3">
              <Type className="w-5 h-5 text-[#d26019]" /> Content Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Subtitle (e.g. INTRODUCTION)</label>
                <RichTextEditor
                  value={data.subtitle}
                  onChange={(val) => setData({ ...data, subtitle: val })}
                  placeholder="Enter subtitle..."
                  minHeight="100px"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Main Title</label>
                <RichTextEditor
                  value={data.title}
                  onChange={(val) => setData({ ...data, title: val })}
                  placeholder="Enter main title..."
                  minHeight="120px"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Description</label>
                <RichTextEditor
                  value={data.description}
                  onChange={(val) => setData({ ...data, description: val })}
                  placeholder="Enter description..."
                  minHeight="200px"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Collage Image</label>
                  <div 
                    className="relative border-2 border-dashed border-gray-300 h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden"
                    onClick={() => document.getElementById('introImage').click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2 group-hover:text-[#23471d]" />
                        <span className="text-xs font-bold text-gray-500 uppercase">Click to Upload</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      id="introImage" 
                      className="hidden" 
                      onChange={handleImageChange} 
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Image Alt Text</label>
                    <input
                      type="text"
                      value={data.altText}
                      onChange={(e) => setData({ ...data, altText: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                      placeholder="e.g. IHWE 2026 Intro Collage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Background Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={data.bgColor}
                            onChange={(e) => setData({ ...data, bgColor: e.target.value })}
                            className="h-10 w-16 border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={data.bgColor}
                            onChange={(e) => setData({ ...data, bgColor: e.target.value })}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-mono text-sm uppercase"
                        />
                    </div>
                    <button 
                        onClick={() => setData({ ...data, bgColor: '#ffffff' })}
                        className="mt-2 text-[10px] font-bold text-[#23471d] hover:underline uppercase tracking-widest"
                    >
                        Reset to Default White
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSettingsSave}
                disabled={isLoading}
                className="w-full py-4 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mt-4 uppercase tracking-widest text-sm"
              >
                <Save className="w-5 h-5" /> Update Introduction Content
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Features Management */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Add/Edit Feature Form */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#d26019] border-b-2 border-gray-100 pb-3">
              {isEditingFeature ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditingFeature ? 'Edit Statistic Item' : 'Add New Statistic Item'}
            </h2>
            <form onSubmit={handleFeatureSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Icon</label>
                <div className="flex gap-2">
                  <select 
                    value={featureForm.icon}
                    onChange={(e) => setFeatureForm({...featureForm, icon: e.target.value})}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-semibold text-sm"
                  >
                    {ICONS_LIST.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                  </select>
                  <div className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center bg-gray-50 rounded shrink-0">
                    <IconComponent name={featureForm.icon} size={20} className="text-[#23471d]" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Number (e.g. 10+)</label>
                <input
                  type="text"
                  value={featureForm.number}
                  onChange={(e) => setFeatureForm({...featureForm, number: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-black"
                  placeholder="e.g. 10+"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label (Name)</label>
                <input
                  type="text"
                  value={featureForm.label}
                  onChange={(e) => setFeatureForm({...featureForm, label: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-bold"
                  placeholder="e.g. YEARS OF LEGACY"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm uppercase"
                >
                  {isEditingFeature ? 'Update' : 'Add'}
                </button>
                {isEditingFeature && (
                  <button
                    type="button"
                    onClick={resetFeatureForm}
                    className="px-3 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-xs uppercase"
                  >
                    X
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Features Table */}
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-lg">
            <div className="px-6 py-4 border-b bg-[#23471d] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <List className="w-5 h-5 text-[#d26019]" /> Statistics List
              </h2>
              <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                {data.features?.length || 0} ITEMS
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="px-6 py-4">No.</th>
                    <th className="px-6 py-4 text-center">Icon</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Label</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.features?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic font-medium">
                        No statistic items added yet.
                      </td>
                    </tr>
                  ) : (
                    data.features?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#23471d]">{index + 1}</td>
                        <td className="px-6 py-4 text-center">
                            <div className="w-10 h-10 mx-auto rounded bg-gray-50 border border-gray-200 flex items-center justify-center">
                                <IconComponent name={item.icon} size={18} className="text-[#23471d]" />
                            </div>
                        </td>
                        <td className="px-6 py-4 font-black text-gray-900 text-base">{item.number}</td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{item.label}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => startEditFeature(item)} 
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => deleteFeature(item._id)} 
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={18} />
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

          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500 flex items-start gap-3">
            <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700 mb-1 uppercase tracking-tight">Introduction Management Guide:</p>
              <ul className="list-disc list-inside space-y-1 font-medium italic">
                <li>Use the **Subtitle** for the small label above the main heading (e.g., "INTRODUCTION").</li>
                <li>The **Main Title** and **Description** support rich text (bold, colors, lists).</li>
                <li>Upload a high-quality collage image (transparency is supported).</li>
                <li>Add statistics (Features) like "10+ Years" to highlight key event metrics at the bottom.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
