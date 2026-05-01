import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, BadgeHelp, Type, ImageIcon, 
  MessageSquare, Quote, Sparkles, User, MapPin, List, Edit,
  Users, Activity, Globe
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const ICONS_LIST = [
    { name: 'Quote', icon: Quote, color: '#2f8f3a' },
    { name: 'Users', icon: Users, color: '#0e7fa8' },
    { name: 'Activity', icon: Activity, color: '#e07b2a' },
    { name: 'Globe', icon: Globe, color: '#1a56b0' },
    { name: 'Sparkles', icon: Sparkles, color: '#9b3db8' },
];

const IconComponent = ({ name, color, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return <Quote {...props} />;
    const Comp = found.icon;
    return <Comp color={color || found.color} {...props} />;
};

const NewTestimonialsManagement = () => {
  const [data, setData] = useState({
    subtitle: "Testimonials",
    heading: "",
    description: "",
    leftBgImage: "",
    leftBgAlt: "Left Pattern",
    rightBgImage: "",
    rightBgAlt: "Right Pattern",
    highlightCardText: "",
    testimonials: []
  });

  const [testimonialForm, setTestimonialForm] = useState({
    icon: "Quote",
    description: "",
    authorName: "",
    location: "",
    order: 0
  });

  const [leftImageFile, setLeftImageFile] = useState(null);
  const [rightImageFile, setRightImageFile] = useState(null);
  const [leftPreview, setLeftPreview] = useState("");
  const [rightPreview, setRightPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingTestimonial, setIsEditingTestimonial] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/new-testimonials");
      if (response.data.success) {
        setData(response.data.data);
        if (response.data.data.leftBgImage) setLeftPreview(`${SERVER_URL}${response.data.data.leftBgImage}`);
        if (response.data.data.rightBgImage) setRightPreview(`${SERVER_URL}${response.data.data.rightBgImage}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeftImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLeftImageFile(file);
      setLeftPreview(URL.createObjectURL(file));
    }
  };

  const handleRightImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRightImageFile(file);
      setRightPreview(URL.createObjectURL(file));
    }
  };

  const handleSettingsSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('subtitle', data.subtitle);
      formData.append('heading', data.heading);
      formData.append('description', data.description);
      formData.append('leftBgAlt', data.leftBgAlt);
      formData.append('rightBgAlt', data.rightBgAlt);
      formData.append('highlightCardText', data.highlightCardText);
      
      if (leftImageFile) formData.append('leftBgImage', leftImageFile);
      if (rightImageFile) formData.append('rightBgImage', rightImageFile);

      const response = await api.post("/api/new-testimonials/settings", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Settings Saved', timer: 1500, showConfirmButton: false });
        fetchData();
        setLeftImageFile(null);
        setRightImageFile(null);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    if (!testimonialForm.description || !testimonialForm.authorName) return Swal.fire("Warning", "Description and Author Name are required", "warning");

    setIsLoading(true);
    try {
      let response;
      if (isEditingTestimonial) {
        response = await api.put(`/api/new-testimonials/testimonials/${editingTestimonialId}`, testimonialForm);
      } else {
        response = await api.post("/api/new-testimonials/testimonials", testimonialForm);
      }

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: isEditingTestimonial ? 'Testimonial Updated' : 'Testimonial Added', timer: 1500, showConfirmButton: false });
        fetchData();
        resetTestimonialForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetTestimonialForm = () => {
    setTestimonialForm({ icon: "Quote", description: "", authorName: "", location: "", order: 0 });
    setIsEditingTestimonial(false);
    setEditingTestimonialId(null);
  };

  const startEditTestimonial = (item) => {
    setIsEditingTestimonial(true);
    setEditingTestimonialId(item._id);
    setTestimonialForm({
      icon: item.icon,
      description: item.description,
      authorName: item.authorName,
      location: item.location,
      order: item.order || 0
    });
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const deleteTestimonial = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This testimonial will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await api.delete(`/api/new-testimonials/testimonials/${id}`);
        if (response.data.success) {
          Swal.fire("Deleted!", "Testimonial removed.", "success");
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
        title="NEW TESTIMONIALS MANAGEMENT"
        description="Manage the Testimonials section content, background patterns, and user voices"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Main Settings */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d] border-b-2 border-gray-100 pb-3">
              <Type className="w-5 h-5 text-[#d26019]" /> Section Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Subtitle (e.g. Testimonials)</label>
                <input
                  type="text"
                  value={data.subtitle}
                  onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-bold"
                  placeholder="Enter subtitle..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Main Heading (Rich Text)</label>
                <RichTextEditor
                  value={data.heading}
                  onChange={(val) => setData({ ...data, heading: val })}
                  placeholder="Enter heading..."
                  minHeight="120px"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Short Description</label>
                <RichTextEditor
                  value={data.description}
                  onChange={(val) => setData({ ...data, description: val })}
                  placeholder="Enter description..."
                  minHeight="150px"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Left BG Image (Pattern)</label>
                  <div 
                    className="relative border-2 border-dashed border-gray-300 h-40 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden"
                    onClick={() => document.getElementById('leftBg').click()}
                  >
                    {leftPreview ? (
                      <img src={leftPreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-1 group-hover:text-[#23471d]" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Left Pattern</span>
                      </>
                    )}
                    <input type="file" id="leftBg" className="hidden" onChange={handleLeftImageChange} accept="image/*" />
                  </div>
                  <input
                    type="text"
                    value={data.leftBgAlt}
                    onChange={(e) => setData({ ...data, leftBgAlt: e.target.value })}
                    className="w-full mt-2 px-3 py-1.5 border-2 border-gray-200 text-xs"
                    placeholder="Left Alt Text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Right BG Image (PNG)</label>
                  <div 
                    className="relative border-2 border-dashed border-gray-300 h-40 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden"
                    onClick={() => document.getElementById('rightBg').click()}
                  >
                    {rightPreview ? (
                      <img src={rightPreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-1 group-hover:text-[#23471d]" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Right Pattern</span>
                      </>
                    )}
                    <input type="file" id="rightBg" className="hidden" onChange={handleRightImageChange} accept="image/*" />
                  </div>
                  <input
                    type="text"
                    value={data.rightBgAlt}
                    onChange={(e) => setData({ ...data, rightBgAlt: e.target.value })}
                    className="w-full mt-2 px-3 py-1.5 border-2 border-gray-200 text-xs"
                    placeholder="Right Alt Text"
                  />
                </div>
              </div>

              <button
                onClick={handleSettingsSave}
                disabled={isLoading}
                className="w-full py-4 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg uppercase tracking-widest text-sm"
              >
                <Save className="w-5 h-5" /> Update Testimonials Content
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Individual Testimonials */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Add/Edit Testimonial Form */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#d26019] border-b-2 border-gray-100 pb-3">
              {isEditingTestimonial ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>
            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Icon</label>
                  <div className="flex gap-2">
                    <select 
                      value={testimonialForm.icon}
                      onChange={(e) => setTestimonialForm({...testimonialForm, icon: e.target.value})}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
                    >
                      {ICONS_LIST.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                    <div className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center bg-gray-50 rounded shrink-0">
                      <IconComponent name={testimonialForm.icon} size={20} className="text-[#23471d]" />
                    </div>
                  </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Order</label>
                    <input
                      type="number"
                      value={testimonialForm.order}
                      onChange={(e) => setTestimonialForm({...testimonialForm, order: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Testimonial Content</label>
                <RichTextEditor
                  value={testimonialForm.description}
                  onChange={(val) => setTestimonialForm({...testimonialForm, description: val})}
                  placeholder="Enter what they said..."
                  minHeight="120px"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Author Name / Company</label>
                  <input
                    type="text"
                    value={testimonialForm.authorName}
                    onChange={(e) => setTestimonialForm({...testimonialForm, authorName: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-bold"
                    placeholder="e.g. NatureCure International"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                  <input
                    type="text"
                    value={testimonialForm.location}
                    onChange={(e) => setTestimonialForm({...testimonialForm, location: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                    placeholder="e.g. Dubai, UAE"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm uppercase"
                >
                  {isEditingTestimonial ? <><Edit size={16}/> Update</> : <><Plus size={16}/> Add Testimonial</>}
                </button>
                {isEditingTestimonial && (
                  <button
                    type="button"
                    onClick={resetTestimonialForm}
                    className="px-4 py-3 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-xs uppercase"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Testimonials List */}
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-lg">
            <div className="px-6 py-4 border-b bg-[#23471d] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <List className="w-5 h-5 text-[#d26019]" /> Voice List
              </h2>
              <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                {data.testimonials?.length || 0} VOICES
              </span>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {data.testimonials?.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500 italic font-medium">
                    No testimonials added yet.
                  </div>
                ) : (
                  data.testimonials?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item, index) => (
                    <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors relative group">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                <IconComponent name={item.icon} size={18} className="text-[#23471d]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-[#23471d] text-sm">{item.authorName}</h4>
                                    <span className="text-[10px] text-gray-400">Order: {item.order}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 text-[11px] mb-2 font-medium">
                                    <MapPin size={10} /> {item.location}
                                </div>
                                <div 
                                    className="text-xs text-gray-600 line-clamp-3 italic prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: item.description }}
                                />
                            </div>
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEditTestimonial(item)} 
                              className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteTestimonial(item._id)} 
                              className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500 flex items-start gap-3">
            <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700 mb-1 uppercase tracking-tight">Testimonial Management Guide:</p>
              <ul className="list-disc list-inside space-y-1 font-medium italic">
                <li>**Subtitle** is the small green label at the top (e.g., "Testimonials").</li>
                <li>**Heading** and **Description** support rich text for visual impact.</li>
                <li>**Highlight Card** is the specialized card on the left side of the layout.</li>
                <li>Individual testimonials will show up as cards in the grid.</li>
                <li>Author Name color in the frontend will automatically match the selected icon's theme.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTestimonialsManagement;
