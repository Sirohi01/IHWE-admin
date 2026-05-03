import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, List, 
  Clock, User, Type, Calendar, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import api from "../lib/api";
import PageHeader from '../components/PageHeader';

const AgendaManagement = () => {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State for a Day
  const [form, setForm] = useState({
    day: "",
    shortTitle: "",
    order: 0,
    sessions: []
  });

  // Form State for a Single Session
  const [sessionForm, setSessionForm] = useState({
    time: "",
    topic: "",
    speakers: "",
    type: "Session"
  });

  const [isEditingSession, setIsEditingSession] = useState(false);
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);

  useEffect(() => {
    fetchAgendas();
  }, []);

  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/agenda");
      if (response.data.success) {
        setAgendas(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching agendas:", error);
      Swal.fire("Error", "Failed to fetch agenda data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = () => {
    if (!sessionForm.time || !sessionForm.topic) {
      return Swal.fire("Warning", "Time and Topic are required for a session", "warning");
    }
    
    if (isEditingSession) {
      const newSessions = [...form.sessions];
      newSessions[editingSessionIndex] = { ...sessionForm };
      setForm({ ...form, sessions: newSessions });
      setIsEditingSession(false);
      setEditingSessionIndex(null);
    } else {
      setForm({
        ...form,
        sessions: [...form.sessions, { ...sessionForm }]
      });
    }
    setSessionForm({ time: "", topic: "", speakers: "", type: "Session" });
  };

  const handleEditSession = (index) => {
    const session = form.sessions[index];
    setSessionForm({ ...session });
    setIsEditingSession(true);
    setEditingSessionIndex(index);
  };

  const handleRemoveSession = (index) => {
    const newSessions = [...form.sessions];
    newSessions.splice(index, 1);
    setForm({ ...form, sessions: newSessions });
    if (isEditingSession && editingSessionIndex === index) {
      setIsEditingSession(false);
      setEditingSessionIndex(null);
      setSessionForm({ time: "", topic: "", speakers: "", type: "Session" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.day || !form.shortTitle) {
      return Swal.fire("Warning", "Day and Short Title are required", "warning");
    }

    setLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/api/agenda/${editingId}`, form);
      } else {
        response = await api.post("/api/agenda", form);
      }

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: `Agenda Day ${isEditing ? 'Updated' : 'Added'}`, timer: 1500, showConfirmButton: false });
        fetchAgendas();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving agenda:", error);
      Swal.fire("Error", "Failed to save agenda", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ day: "", shortTitle: "", order: 0, sessions: [] });
    setSessionForm({ time: "", topic: "", speakers: "", type: "Session" });
    setIsEditing(false);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setForm({
      day: item.day,
      shortTitle: item.shortTitle,
      order: item.order || 0,
      sessions: item.sessions || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This agenda day will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await api.delete(`/api/agenda/${id}`);
        if (response.data.success) {
          Swal.fire("Deleted!", "Agenda day has been removed.", "success");
          fetchAgendas();
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete agenda", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <div className="relative w-full h-64 overflow-hidden rounded mt-8">
        {/* Background Image */}
        <img
          src="/activity_log.png"
          alt="Agenda Management Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0B2C66]/60 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6 text-center">
          <Calendar className="w-16 h-16 mb-4 text-[#4E9F3D]" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Conference Agenda
          </h1>
          <p className="text-lg mt-2 text-white/90 max-w-2xl font-medium">
            Manage your multi-day conference schedule, tracks, and session details seamlessly.
          </p>
        </div>
      </div>

      <div className="p-6 min-h-screen space-y-6">
        <PageHeader
          title="AGENDA MANAGEMENT"
          description="Control every session, keynote, and networking event for the upcoming IHWE 2026."
        />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#0B2C66] border-b-2 border-gray-100 pb-3">
              {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditing ? 'Edit Agenda Day' : 'Add New Agenda Day'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Day Title (e.g. DAY 1 | 21 AUG)</label>
                <input
                  type="text"
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#1E88E5] outline-none shadow-sm"
                  placeholder="DAY 1 | 21 AUG"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Short Title (Theme of the day)</label>
                <input
                  type="text"
                  value={form.shortTitle}
                  onChange={(e) => setForm({ ...form, shortTitle: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#1E88E5] outline-none shadow-sm"
                  placeholder="Healthcare Innovation Summit"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Display Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#1E88E5] outline-none shadow-sm"
                />
              </div>

              {/* Session Builder */}
              <div className="border-t-2 border-gray-100 pt-4 mt-6">
                <h3 className="text-md font-bold mb-4 text-[#4E9F3D] flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Add Sessions to this Day
                </h3>
                
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    value={sessionForm.time}
                    onChange={(e) => setSessionForm({...sessionForm, time: e.target.value})}
                    placeholder="Time (e.g. 10:00 AM - 11:00 AM)"
                    className="w-full px-3 py-2 border border-gray-300 text-sm"
                  />
                  <input
                    type="text"
                    value={sessionForm.topic}
                    onChange={(e) => setSessionForm({...sessionForm, topic: e.target.value})}
                    placeholder="Session Topic"
                    className="w-full px-3 py-2 border border-gray-300 text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={sessionForm.speakers}
                    onChange={(e) => setSessionForm({...sessionForm, speakers: e.target.value})}
                    placeholder="Speaker(s)"
                    className="w-full px-3 py-2 border border-gray-300 text-sm"
                  />
                  <select
                    value={sessionForm.type}
                    onChange={(e) => setSessionForm({...sessionForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 text-sm"
                  >
                    <option value="Session">Normal Session</option>
                    <option value="Keynote">Keynote</option>
                    <option value="Panel">Panel Discussion</option>
                    <option value="Expert Talk">Expert Talk</option>
                    <option value="Networking">Networking</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSession}
                    className={`w-full py-2 ${isEditingSession ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#4E9F3D] hover:bg-green-700'} text-white font-bold text-xs uppercase tracking-widest transition-all rounded`}
                  >
                    {isEditingSession ? 'Update Session' : '+ Add Session to List'}
                  </button>
                  {isEditingSession && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingSession(false);
                        setEditingSessionIndex(null);
                        setSessionForm({ time: "", topic: "", speakers: "", type: "Session" });
                      }}
                      className="w-full py-1.5 text-gray-500 text-[10px] font-bold uppercase hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* Added Sessions List */}
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Sessions in this Day ({form.sessions.length})</p>
                  {form.sessions.map((s, idx) => (
                    <div key={idx} className={`flex items-center justify-between border p-2 rounded text-xs transition-colors ${editingSessionIndex === idx ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
                      <div className="flex-1 truncate">
                        <span className="font-bold text-[#1E88E5]">{s.time}:</span> {s.topic}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button 
                          type="button"
                          onClick={() => handleEditSession(idx)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Edit Session"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleRemoveSession(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove Session"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#0B2C66] text-white font-bold hover:bg-[#08214d] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  <Save className="w-5 h-5" /> {isEditing ? 'Update Day' : 'Save Day'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-all uppercase tracking-widest text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7">
          <div className="bg-white border-2 border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-[#0B2C66] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#4E9F3D]" /> Scheduled Days
              </h2>
              <span className="bg-[#4E9F3D] text-white text-[10px] font-bold px-2 py-1 rounded">
                {agendas.length} DAYS
              </span>
            </div>

            {loading && agendas.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center">
                 <Loader2 className="w-10 h-10 text-[#1E88E5] animate-spin mb-4" />
                 <p className="text-gray-500 font-medium">Fetching Agendas...</p>
               </div>
            ) : agendas.length === 0 ? (
              <div className="py-20 text-center text-gray-500 italic">
                No agenda days found. Start by adding one.
              </div>
            ) : (
              <div className="p-6 space-y-8 bg-gray-50/50">
                {agendas.sort((a,b) => (a.order || 0) - (b.order || 0)).map((agenda) => (
                  <div key={agenda._id} className="bg-white border-2 border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-[#0B2C66]/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#0B2C66] text-white p-2 rounded-lg">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h3 className="text-[#0B2C66] font-black text-xs uppercase tracking-[0.15em] mb-0.5">{agenda.day}</h3>
                          <h4 className="text-base font-bold text-gray-900">{agenda.shortTitle}</h4>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEdit(agenda)} 
                          className="p-2 text-[#1E88E5] hover:bg-[#1E88E5]/10 rounded-full transition-colors border border-transparent hover:border-[#1E88E5]/20"
                          title="Edit Day"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(agenda._id)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
                          title="Delete Day"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Sessions List */}
                    <div className="p-0">
                      {agenda.sessions.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm italic">No sessions added yet.</div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {agenda.sessions.map((session, sidx) => (
                            <div key={sidx} className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50/80 transition-colors group">
                              {/* Time Column */}
                              <div className="md:w-48 shrink-0">
                                <div className="flex items-center gap-2 text-[#4E9F3D]">
                                  <Clock size={16} />
                                  <span className="font-bold text-sm tracking-tight">{session.time}</span>
                                </div>
                              </div>
                              
                              {/* Content Column */}
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <p className="font-bold text-gray-800 text-[15px] leading-tight">{session.topic}</p>
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                    session.type === 'Keynote' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    session.type === 'Panel' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    session.type === 'Networking' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                    'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}>
                                    {session.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                  <User size={14} className="shrink-0" />
                                  <span className="text-xs font-medium">{session.speakers || 'No speaker assigned'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default AgendaManagement;
