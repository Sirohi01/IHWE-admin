import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, ImageIcon, 
  Mic2, List, Edit, MapPin, Globe, 
  User, Building2, Hash, CheckCircle2,
  ChevronUp, ChevronDown
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';

const DistinguishedSpeakersManage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [speakers, setSpeakers] = useState([]);
  const [inlinePositions, setInlinePositions] = useState({});
  const [form, setForm] = useState({
    name: "",
    designation: "",
    organization: "",
    topic: "",
    flag: "🇮🇳",
    order: 0,
    status: "active"
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/distinguished-speakers");
      if (response.data.success) {
        const sortedList = response.data.data.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        setSpeakers(sortedList);
      }
    } catch (error) {
      console.error("Error fetching speakers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (imageFile) formData.append('image', imageFile);

      let response;
      if (editId) {
        response = await api.put(`/api/distinguished-speakers/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post("/api/distinguished-speakers", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: editId ? 'Speaker Updated' : 'Speaker Added', timer: 1500, showConfirmButton: false });
        fetchSpeakers();
        resetForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      designation: "",
      organization: "",
      topic: "",
      flag: "🇮🇳",
      order: 0,
      status: "active"
    });
    setImageFile(null);
    setImagePreview("");
    setEditId(null);
  };

  const startEdit = (speaker, currentIdx) => {
    setEditId(speaker._id);
    setForm({
      name: speaker.name,
      designation: speaker.designation,
      organization: speaker.organization,
      topic: speaker.topic || "",
      flag: speaker.flag || "🇮🇳",
      order: speaker.order || 0,
      status: speaker.status || "active"
    });
    if (speaker.image) {
      setImagePreview(speaker.image.startsWith('http') ? speaker.image : `${SERVER_URL}${speaker.image}`);
    } else {
      setImagePreview("");
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSpeaker = async (id) => {
    const result = await Swal.fire({ 
      title: "Are you sure?", 
      text: "You won't be able to revert this!",
      icon: "warning", 
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/distinguished-speakers/${id}`);
        fetchSpeakers();
        Swal.fire('Deleted!', 'Speaker has been deleted.', 'success');
      } catch (error) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  // Directly update the order value without shifting anything
  const moveToPosition = async (speakerId, newPos) => {
    const newPosNum = Number(newPos);
    if (isNaN(newPosNum)) return;

    try {
      setIsLoading(true);
      await api.put(`/api/distinguished-speakers/${speakerId}`, { order: newPosNum });
      fetchSpeakers();
      setInlinePositions(prev => ({ ...prev, [speakerId]: '' }));
    } catch (error) {
      Swal.fire("Error", "Failed to update position", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const movePosition = async (speaker, direction) => {
    const currentIndex = speakers.findIndex(s => s._id === speaker._id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= speakers.length) return;
    
    const targetSpeaker = speakers[targetIndex];
    
    try {
      setIsLoading(true);
      await api.put(`/api/distinguished-speakers/${speaker._id}`, { order: targetSpeaker.order });
      await api.put(`/api/distinguished-speakers/${targetSpeaker._id}`, { order: speaker.order });
      fetchSpeakers();
    } catch (error) {
      Swal.fire("Error", "Failed to move position", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="DISTINGUISHED SPEAKERS MANAGEMENT"
        description="Directly add and manage speakers shown on the homepage and conference sections"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Form Column */}
        <div className="lg:col-span-4">
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg sticky top-6">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#0B2C66] border-b pb-3 uppercase tracking-tighter">
              {editId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-green-500" />}
              {editId ? 'Edit Speaker' : 'Add New Speaker'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Full Name*</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-[#0B2C66] font-medium text-sm"
                    placeholder="e.g. Dr. Rajesh Sharma"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Designation*</label>
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-[#0B2C66] font-medium text-sm"
                    placeholder="e.g. Director"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Organization</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="organization"
                      value={form.organization}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-[#0B2C66] font-medium text-sm"
                      placeholder="e.g. AIIMS"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Preferred Topic</label>
                <textarea
                  name="topic"
                  value={form.topic}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-[#0B2C66] font-medium text-sm"
                  placeholder="What will they speak about?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Country Flag</label>
                  <input
                    type="text"
                    name="flag"
                    value={form.flag}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-[#0B2C66] font-medium text-sm"
                    placeholder="🇮🇳"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Set Position (1 to N)</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="order"
                      min={1}
                      value={form.order || ''}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-[#0B2C66] font-bold text-sm"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1">Leave empty or 0 to add at the end</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Speaker Photo</label>
                <div 
                  className="relative border-2 border-dashed border-gray-200 h-32 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden"
                  onClick={() => document.getElementById('speakerImage').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-300 mb-1 group-hover:text-[#0B2C66]" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Click to upload</span>
                    </>
                  )}
                  <input 
                    type="file" id="speakerImage" className="hidden" 
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#0B2C66] text-white font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-blue-900 shadow-lg flex items-center justify-center gap-2"
                >
                  <Save size={14} /> {editId ? 'Update' : 'Save'} Speaker
                </button>
                {editId && (
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-4 py-3 border-2 border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8">
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#0B2C66] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <Mic2 size={16} /> Distinguished Speakers List
              </h3>
              <span className="bg-[#4E9F3D] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                {speakers.length} Speakers
              </span>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[800px] overflow-y-auto">
              {speakers.length === 0 ? (
                <div className="p-20 text-center text-gray-300 italic font-medium">
                  No speakers found. Add your first speaker.
                </div>
              ) : (
                speakers.map((speaker, idx) => (
                  <div key={speaker._id} className="p-4 hover:bg-gray-50 transition-colors group border-b border-gray-100">
                    <div className="flex gap-4 items-start">
                      {/* Position Badge */}
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                        <div className="w-8 h-8 rounded-full bg-[#0B2C66] text-white text-[11px] font-black flex items-center justify-center">
                          {speaker.order || 0}
                        </div>
                        <button onClick={() => movePosition(speaker, 'up')} disabled={idx === 0} className="p-0.5 hover:bg-gray-200 rounded text-gray-300 disabled:opacity-20"><ChevronUp size={14} /></button>
                        <button onClick={() => movePosition(speaker, 'down')} disabled={idx === speakers.length - 1} className="p-0.5 hover:bg-gray-200 rounded text-gray-300 disabled:opacity-20"><ChevronDown size={14} /></button>
                      </div>

                      {/* Photo */}
                      <div className="w-14 h-14 rounded-full border-2 border-gray-100 flex items-center justify-center bg-gray-50 shadow-sm overflow-hidden shrink-0">
                        {speaker.image ? (
                          <img src={speaker.image.startsWith('http') ? speaker.image : `${SERVER_URL}${speaker.image}`} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-gray-200" />
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-black text-[#0B2C66] text-sm uppercase truncate">{speaker.name}</h4>
                          <span className="text-base shrink-0">{speaker.flag}</span>
                        </div>
                        <div className="text-gray-500 text-[11px] font-bold uppercase">{speaker.designation}</div>
                        <div className="text-[#4E9F3D] text-[11px] font-bold flex items-center gap-1">
                          <Building2 size={11} /> {speaker.organization}
                        </div>
                        {speaker.topic && (
                          <p className="text-[10px] text-gray-400 italic mt-1 line-clamp-1">"{speaker.topic}"</p>
                        )}

                        {/* ── INLINE MOVE TO POSITION ── */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase whitespace-nowrap">Move to #</span>
                          <input
                            type="number"
                            placeholder={String(speaker.order || 0)}
                            value={inlinePositions[speaker._id] ?? ''}
                            onChange={(e) => setInlinePositions(prev => ({ ...prev, [speaker._id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') moveToPosition(speaker._id, inlinePositions[speaker._id]);
                            }}
                            className="w-16 px-2 py-1 border-2 border-gray-200 rounded text-xs font-bold text-center outline-none focus:border-[#0B2C66]"
                          />
                          <button
                            onClick={() => moveToPosition(speaker._id, inlinePositions[speaker._id])}
                            disabled={!inlinePositions[speaker._id] || isLoading}
                            className="px-3 py-1 bg-[#0B2C66] text-white text-[9px] font-black uppercase rounded hover:bg-blue-900 disabled:opacity-30 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => startEdit(speaker, idx)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 shadow-sm transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => deleteSpeaker(speaker._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 shadow-sm transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistinguishedSpeakersManage;
