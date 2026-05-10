import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Save, Calendar, Image as ImageIcon, Users, List,
  Plus, Trash2, Edit2, Loader2, Layout, Info, Rocket,
  Clock, FileText, Globe, Tag, ChevronDown, ChevronUp,
  Upload
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';

const ConferenceDayManagement = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState([1, 2, 3]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [uploading, setUploading] = useState({ hero: false, speakers: {} });

  useEffect(() => {
    fetchAllDays();
  }, []);

  useEffect(() => {
    if (activeDay) {
      fetchDayContent(activeDay);
    }
  }, [activeDay]);

  const fetchAllDays = async () => {
    try {
      const response = await api.get("/api/conference-days/all");
      if (response.data.success && response.data.data.length > 0) {
        const existingDays = response.data.data.map(d => d.dayNumber);
        setDays(existingDays.length > 0 ? existingDays : [1, 2, 3]);
        if (!existingDays.includes(activeDay)) {
          setActiveDay(existingDays[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching all days:", error);
    }
  };

  const fetchDayContent = async (day) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/conference-days/${day}`);
      if (response.data.success) {
        // Ensure agenda exists
        const data = response.data.data;
        if (!data.agenda) data.agenda = { title: "", subtitle: "", sessions: [] };
        if (!data.agenda.sessions) data.agenda.sessions = [];
        setContent(data);
      } else {
        setContent(getDefaultContent(day));
      }
    } catch (error) {
      console.error("Error fetching day content:", error);
      setContent(getDefaultContent(day));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (day) => ({
    dayNumber: day,
    hero: { title: "", subtitle: "", date: "", category: `Day ${day}`, description: "", backgroundImage: "", stats: [] },
    about: { title: "", description: "", descriptionSecondary: "", focusAreas: [] },
    agenda: { title: "", subtitle: "", sessions: [] },
    featuredSpeakers: [],
    cta: {
      bePartTitle: "", bePartDescription: "",
      delegatePass: { title: "", description: "" },
      sponsor: { title: "", description: "" }
    }
  });

  const handleHeroChange = (field, value) => {
    setContent({ ...content, hero: { ...content.hero, [field]: value } });
  };

  const handleAgendaChange = (field, value) => {
    setContent({ ...content, agenda: { ...content.agenda, [field]: value } });
  };

  const handleAboutChange = (field, value) => {
    setContent({ ...content, about: { ...content.about, [field]: value } });
  };

  const handleCtaChange = (section, field, value) => {
    if (section === 'main') {
      setContent({ ...content, cta: { ...content.cta, [field]: value } });
    } else {
      setContent({ ...content, cta: { ...content.cta, [section]: { ...content.cta[section], [field]: value } } });
    }
  };

  const handleAddDay = () => {
    const nextDay = Math.max(...days) + 1;
    setDays([...days, nextDay]);
    setActiveDay(nextDay);
  };

  const handleAddStat = () => {
    setContent({
      ...content,
      hero: { ...content.hero, stats: [...content.hero.stats, { label: "", value: "" }] }
    });
  };

  const handleRemoveStat = (index) => {
    const newStats = [...content.hero.stats];
    newStats.splice(index, 1);
    setContent({ ...content, hero: { ...content.hero, stats: newStats } });
  };

  const handleAddFocusArea = () => {
    setContent({
      ...content,
      about: { ...content.about, focusAreas: [...content.about.focusAreas, ""] }
    });
  };

  const handleRemoveFocusArea = (index) => {
    const newAreas = [...content.about.focusAreas];
    newAreas.splice(index, 1);
    setContent({ ...content, about: { ...content.about, focusAreas: newAreas } });
  };

  const handleAddSpeaker = () => {
    setContent({
      ...content,
      featuredSpeakers: [...content.featuredSpeakers, { name: "", role: "", company: "", category: "", image: "" }]
    });
  };

  const handleRemoveSpeaker = (index) => {
    const newSpeakers = [...content.featuredSpeakers];
    newSpeakers.splice(index, 1);
    setContent({ ...content, featuredSpeakers: newSpeakers });
  };

  const handleAddSession = () => {
    setContent({
      ...content,
      agenda: {
        ...content.agenda,
        sessions: [...content.agenda.sessions, { time: "", session: `SESSION ${content.agenda.sessions.length + 1}`, type: "KEYNOTE", topic: "", description: "", speaker: { name: "", role: "", company: "", image: "", flag: "🇮🇳" } }]
      }
    });
  };

  const handleRemoveSession = (index) => {
    const newSessions = [...content.agenda.sessions];
    newSessions.splice(index, 1);
    setContent({ ...content, agenda: { ...content.agenda, sessions: newSessions } });
  };

  const handleImageUpload = async (file, type, index = null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    if (type === 'hero') setUploading({ ...uploading, hero: true });
    else if (type === 'speaker') setUploading({ ...uploading, speakers: { ...uploading.speakers, [index]: true } });
    else if (type === 'agendaSpeaker') setUploading({ ...uploading, agendaSpeakers: { ...uploading.agendaSpeakers, [index]: true } });

    try {
      const response = await api.post("/api/conference-days/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        const imageUrl = response.data.imageUrl;
        if (type === 'hero') {
          handleHeroChange('backgroundImage', imageUrl);
        } else if (type === 'speaker') {
          const newSpeakers = [...content.featuredSpeakers];
          newSpeakers[index].image = imageUrl;
          setContent({ ...content, featuredSpeakers: newSpeakers });
        } else if (type === 'agendaSpeaker') {
          const newSessions = [...content.agenda.sessions];
          newSessions[index].speaker.image = imageUrl;
          setContent({ ...content, agenda: { ...content.agenda, sessions: newSessions } });
        }
        Swal.fire({ icon: 'success', title: 'Image Uploaded', timer: 1000, showConfirmButton: false });
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Failed to upload image", "error");
    } finally {
      if (type === 'hero') setUploading({ ...uploading, hero: false });
      else if (type === 'speaker') setUploading({ ...uploading, speakers: { ...uploading.speakers, [index]: false } });
      else if (type === 'agendaSpeaker') setUploading({ ...uploading, agendaSpeakers: { ...uploading.agendaSpeakers, [index]: false } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(`/api/conference-days/${activeDay}`, content);
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Content Saved', timer: 1500, showConfirmButton: false });
        fetchAllDays();
        fetchDayContent(activeDay);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save content", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDay = async (day) => {
    const result = await Swal.fire({
      title: `Delete Day ${day}?`,
      text: "This will permanently remove all content for this day.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/api/conference-days/${day}`);
        if (response.data.success) {
          Swal.fire('Deleted!', `Day ${day} has been removed.`, 'success');
        }
      } catch (error) {

        console.log("Day not in DB, removing from UI only");
      }

      const newDays = days.filter(d => d !== day);
      setDays(newDays);
      if (activeDay === day) {
        setActiveDay(newDays[0] || 1);
      }
    }
  };

  if (!content) return <div className="p-20 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-4" /> Loading content structure...</div>;

  return (
    <div className="p-6 space-y-6 pt-10">
      <PageHeader
        title="CONFERENCE DAYS CONTENT"
        description="Manage dynamic content, images, and speakers for each conference day."
      />

      {/* Day Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-px overflow-x-auto">
        {days.map(day => (
          <div key={day} className="relative group/tab">
            <button
              onClick={() => setActiveDay(day)}
              className={`px-8 py-3 font-bold text-sm uppercase tracking-widest transition-all border-t-2 border-x-2 rounded-t-lg whitespace-nowrap flex items-center gap-2 ${activeDay === day ? "bg-white border-gray-200 text-[#0B2C66] -mb-px shadow-[0_-4px_10px_rgba(0,0,0,0.05)]" : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"}`}
            >
              Day {day}
              {days.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); handleDeleteDay(day); }}
                  className="opacity-0 group-hover/tab:opacity-100 p-1 hover:bg-red-50 text-red-400 rounded-full transition-all"
                >
                  <Trash2 size={12} />
                </span>
              )}
            </button>
          </div>
        ))}
        <button
          onClick={handleAddDay}
          className="p-3 text-[#4E9F3D] hover:bg-green-50 rounded-lg transition-colors border-2 border-dashed border-gray-200 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
        >
          <Plus size={16} /> Add Day
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-24">

        {/* Hero Section */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#0B2C66] px-6 py-4 flex items-center gap-3">
            <ImageIcon className="text-[#4E9F3D] w-5 h-5" />
            <h3 className="text-white font-black uppercase tracking-wider text-sm">Hero Section</h3>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Hero Title (Main)</label>
                  <input type="text" value={content.hero.title} onChange={(e) => handleHeroChange('title', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md" placeholder="e.g. Wellness & Ayush" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Hero Subtitle</label>
                  <input type="text" value={content.hero.subtitle} onChange={(e) => handleHeroChange('subtitle', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md" placeholder="e.g. Leadership Forum" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Event Date</label>
                  <input type="text" value={content.hero.date} onChange={(e) => handleHeroChange('date', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md" placeholder="e.g. 23 August 2026" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Category Label</label>
                  <input type="text" value={content.hero.category} onChange={(e) => handleHeroChange('category', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md" placeholder="e.g. Day 3" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Description Text</label>
                <textarea value={content.hero.description} onChange={(e) => handleHeroChange('description', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md min-h-[80px]" placeholder="Brief slogan or text under heading" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-3">Background Image</label>
                <div className="relative group aspect-video bg-white rounded-lg overflow-hidden border-2 border-gray-100 flex items-center justify-center">
                  {content.hero.backgroundImage ? (
                    <>
                      <img src={content.hero.backgroundImage.startsWith('http') ? content.hero.backgroundImage : `${SERVER_URL}${content.hero.backgroundImage}`} alt="Hero BG" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white p-2 rounded-full shadow-lg">
                          <Upload className="text-[#0B2C66] w-5 h-5" />
                          <input type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'hero')} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-[#4E9F3D] transition-colors">
                      <Upload size={32} />
                      <span className="text-[10px] font-black uppercase">Upload Image</span>
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'hero')} />
                    </label>
                  )}
                  {uploading.hero && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-[#4E9F3D]" /></div>}
                </div>
                <input type="text" value={content.hero.backgroundImage} onChange={(e) => handleHeroChange('backgroundImage', e.target.value)} className="w-full mt-3 px-3 py-1.5 text-[10px] border rounded bg-white" placeholder="Manual URL path..." />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase">Impact Stats</label>
                  <button type="button" onClick={handleAddStat} className="text-[10px] font-black text-[#4E9F3D] hover:underline flex items-center gap-1 uppercase tracking-widest">+ Add Stat</button>
                </div>
                <div className="space-y-2 max-h-[180px] overflow-y-auto p-2 border-2 border-gray-50 rounded-lg">
                  {content.hero.stats.map((stat, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                      <input type="text" value={stat.value} onChange={(e) => {
                        const newStats = [...content.hero.stats];
                        newStats[idx].value = e.target.value;
                        setContent({ ...content, hero: { ...content.hero, stats: newStats } });
                      }} className="w-1/2 px-2 py-1 text-xs border rounded" placeholder="Value" />
                      <input type="text" value={stat.label} onChange={(e) => {
                        const newStats = [...content.hero.stats];
                        newStats[idx].label = e.target.value;
                        setContent({ ...content, hero: { ...content.hero, stats: newStats } });
                      }} className="w-1/2 px-2 py-1 text-xs border rounded" placeholder="Label" />
                      <button type="button" onClick={() => handleRemoveStat(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#0B2C66] px-6 py-4 flex items-center gap-3">
            <Info className="text-[#4E9F3D] w-5 h-5" />
            <h3 className="text-white font-black uppercase tracking-wider text-sm">About Section</h3>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Section Title</label>
                <input type="text" value={content.about.title} onChange={(e) => handleAboutChange('title', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md" placeholder="e.g. About Day 3" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Main Description</label>
                <textarea value={content.about.description} onChange={(e) => handleAboutChange('description', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md min-h-[100px]" placeholder="Main paragraph about the day" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Secondary Description</label>
                <textarea value={content.about.descriptionSecondary} onChange={(e) => handleAboutChange('descriptionSecondary', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md min-h-[80px]" placeholder="Second paragraph (optional)" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase">Key Focus Areas</label>
                  <button type="button" onClick={handleAddFocusArea} className="text-[10px] font-black text-[#4E9F3D] hover:underline flex items-center gap-1 uppercase tracking-widest">+ Add Focus Area</button>
                </div>
                <div className="space-y-2 p-2 border-2 border-gray-50 rounded-lg min-h-[200px]">
                  {content.about.focusAreas.map((area, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="w-6 h-6 bg-[#4E9F3D]/10 text-[#4E9F3D] flex items-center justify-center rounded text-[10px] font-bold">{idx + 1}</div>
                      <input type="text" value={area} onChange={(e) => {
                        const newAreas = [...content.about.focusAreas];
                        newAreas[idx] = e.target.value;
                        setContent({ ...content, about: { ...content.about, focusAreas: newAreas } });
                      }} className="w-full px-3 py-2 text-xs border rounded-md" placeholder={`Focus Area ${idx + 1}`} />
                      <button type="button" onClick={() => handleRemoveFocusArea(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  {content.about.focusAreas.length === 0 && <p className="text-center py-8 text-[11px] text-gray-400 italic">No focus areas added yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agenda Section */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#0B2C66] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-[#4E9F3D] w-5 h-5" />
              <h3 className="text-white font-black uppercase tracking-wider text-sm">Agenda Management</h3>
            </div>
            <button type="button" onClick={handleAddSession} className="px-4 py-1.5 bg-[#4E9F3D] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus size={14} /> Add Session
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Agenda Section Title</label>
                <input type="text" value={content.agenda.title} onChange={(e) => handleAgendaChange('title', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md" placeholder="e.g. DAY 3 AGENDA — 23 AUGUST 2026" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Agenda Subtitle</label>
                <input type="text" value={content.agenda.subtitle} onChange={(e) => handleAgendaChange('subtitle', e.target.value)} className="w-full px-4 py-2 border-2 border-gray-100 focus:border-[#4E9F3D] outline-none rounded-md" placeholder="e.g. 6 Insightful Sessions | 1 Powerful Day" />
              </div>
            </div>

            <div className="space-y-4">
              {content.agenda.sessions.map((session, idx) => (
                <div key={idx} className="bg-gray-50 border-2 border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                    <span className="text-[10px] font-black text-[#0B2C66] uppercase tracking-widest">{session.session}</span>
                    <button type="button" onClick={() => handleRemoveSession(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Time Range</label>
                        <input type="text" value={session.time} onChange={(e) => {
                          const newSessions = [...content.agenda.sessions];
                          newSessions[idx].time = e.target.value;
                          setContent({ ...content, agenda: { ...content.agenda, sessions: newSessions } });
                        }} className="w-full px-3 py-1.5 text-xs border rounded" placeholder="9:00 AM - 10:00 AM" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Session Type</label>
                        <select value={session.type} onChange={(e) => {
                          const newSessions = [...content.agenda.sessions];
                          newSessions[idx].type = e.target.value;
                          setContent({ ...content, agenda: { ...content.agenda, sessions: newSessions } });
                        }} className="w-full px-3 py-1.5 text-xs border rounded bg-white">
                          <option value="KEYNOTE">KEYNOTE</option>
                          <option value="PANEL">PANEL</option>
                          <option value="WORKSHOP">WORKSHOP</option>
                          <option value="NETWORKING">NETWORKING</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Topic/Title</label>
                        <input type="text" value={session.topic} onChange={(e) => {
                          const newSessions = [...content.agenda.sessions];
                          newSessions[idx].topic = e.target.value;
                          setContent({ ...content, agenda: { ...content.agenda, sessions: newSessions } });
                        }} className="w-full px-3 py-1.5 text-xs border rounded font-bold" placeholder="Session Topic" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Brief Description</label>
                        <textarea value={session.description} onChange={(e) => {
                          const newSessions = [...content.agenda.sessions];
                          newSessions[idx].description = e.target.value;
                          setContent({ ...content, agenda: { ...content.agenda, sessions: newSessions } });
                        }} className="w-full px-3 py-1.5 text-xs border rounded min-h-[50px]" placeholder="What is this session about?" />
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase">Session Speaker</label>
                        {session.speaker?.name && (
                          content.featuredSpeakers.some(s => s.name === session.speaker.name) ? (
                            <button
                              type="button"
                              onClick={() => {
                                const newFeatured = content.featuredSpeakers.filter(s => s.name !== session.speaker.name);
                                setContent({ ...content, featuredSpeakers: newFeatured });
                                Swal.fire({ icon: 'info', title: 'Removed from Featured', timer: 800, showConfirmButton: false });
                              }}
                              className="text-[9px] font-black text-red-500 hover:underline uppercase tracking-tighter"
                            >
                              - Remove from Featured
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const speaker = session.speaker;
                                setContent({
                                  ...content,
                                  featuredSpeakers: [
                                    ...content.featuredSpeakers,
                                    {
                                      name: speaker.name,
                                      role: speaker.role,
                                      company: speaker.company,
                                      image: speaker.image,
                                      category: session.type === 'KEYNOTE' ? 'KEYNOTE SPEAKER' : 'FEATURED SPEAKER'
                                    }
                                  ]
                                });
                                Swal.fire({ icon: 'success', title: 'Added to Featured', timer: 800, showConfirmButton: false });
                              }}
                              className="text-[9px] font-black text-[#4E9F3D] hover:underline uppercase tracking-tighter"
                            >
                              + Promote to Featured
                            </button>
                          )
                        )}
                      </div>
                      <div className="flex gap-2 items-start">
                        <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 rounded-full overflow-hidden border-2 border-gray-100 group">
                          {session.speaker?.image ? (
                            <img src={session.speaker.image.startsWith('http') ? session.speaker.image : `${SERVER_URL}${session.speaker.image}`} alt="Speaker" className="w-full h-full object-cover" />
                          ) : <Users className="w-full h-full p-2 text-gray-300" />}
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                            <Upload className="text-white w-4 h-4" />
                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'agendaSpeaker', idx)} />
                          </label>
                        </div>
                        <div className="flex-1 space-y-2">
                          <input type="text" value={session.speaker?.name || ""} onChange={(e) => {
                            const newSessions = [...content.agenda.sessions];
                            if (!newSessions[idx].speaker) newSessions[idx].speaker = {};
                            newSessions[idx].speaker.name = e.target.value;
                            setContent({ ...content, agenda: { ...content.agenda, sessions: newSessions } });
                          }} className="w-full px-2 py-1 text-[10px] border rounded" placeholder="Speaker Name" />
                          <input type="text" value={session.speaker?.role || ""} onChange={(e) => {
                            const newSessions = [...content.agenda.sessions];
                            if (!newSessions[idx].speaker) newSessions[idx].speaker = {};
                            newSessions[idx].speaker.role = e.target.value;
                            setContent({ ...content, agenda: { ...content.agenda, sessions: newSessions } });
                          }} className="w-full px-2 py-1 text-[10px] border rounded" placeholder="Role" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {content.agenda.sessions.length === 0 && <div className="py-12 text-center text-gray-400 italic bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">No sessions added yet.</div>}
            </div>
          </div>
        </div>

        {/* Featured Speakers Section */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#0B2C66] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-[#4E9F3D] w-5 h-5" />
              <h3 className="text-white font-black uppercase tracking-wider text-sm">Featured Speakers</h3>
            </div>
            <button type="button" onClick={handleAddSpeaker} className="px-4 py-1.5 bg-[#4E9F3D] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus size={14} /> Add Speaker
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {content.featuredSpeakers.map((speaker, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border-2 border-gray-100 rounded-xl relative group flex flex-col gap-3">
                  <button type="button" onClick={() => handleRemoveSpeaker(idx)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 size={16} /></button>

                  <div className="relative aspect-square w-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md group/img">
                    {speaker.image ? (
                      <img src={speaker.image.startsWith('http') ? speaker.image : `${SERVER_URL}${speaker.image}`} alt="Speaker" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><Users size={32} /></div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Upload className="text-white w-6 h-6" />
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'speaker', idx)} />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <input type="text" value={speaker.name} onChange={(e) => {
                      const newSpeakers = [...content.featuredSpeakers];
                      newSpeakers[idx].name = e.target.value;
                      setContent({ ...content, featuredSpeakers: newSpeakers });
                    }} className="w-full px-3 py-1.5 text-xs font-bold border rounded text-center" placeholder="Speaker Name" />
                    <input type="text" value={speaker.role} onChange={(e) => {
                      const newSpeakers = [...content.featuredSpeakers];
                      newSpeakers[idx].role = e.target.value;
                      setContent({ ...content, featuredSpeakers: newSpeakers });
                    }} className="w-full px-3 py-1.5 text-[10px] border rounded text-center" placeholder="Role/Designation" />
                    <input type="text" value={speaker.company} onChange={(e) => {
                      const newSpeakers = [...content.featuredSpeakers];
                      newSpeakers[idx].company = e.target.value;
                      setContent({ ...content, featuredSpeakers: newSpeakers });
                    }} className="w-full px-3 py-1.5 text-[10px] border rounded text-center" placeholder="Company/Org" />
                    <select value={speaker.category} onChange={(e) => {
                      const newSpeakers = [...content.featuredSpeakers];
                      newSpeakers[idx].category = e.target.value;
                      setContent({ ...content, featuredSpeakers: newSpeakers });
                    }} className="w-full px-3 py-1.5 text-[10px] border rounded bg-white text-[#4E9F3D] font-black uppercase text-center">
                      <option value="KEYNOTE SPEAKER">KEYNOTE SPEAKER</option>
                      <option value="PANELIST">PANELIST</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="GUEST SPEAKER">GUEST SPEAKER</option>
                    </select>
                  </div>
                </div>
              ))}
              {content.featuredSpeakers.length === 0 && <div className="col-span-full py-12 text-center text-gray-400 italic bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">No speakers added for this day yet.</div>}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#0B2C66] px-6 py-4 flex items-center gap-3">
            <Rocket className="text-[#4E9F3D] w-5 h-5" />
            <h3 className="text-white font-black uppercase tracking-wider text-sm">Call To Action (CTA) Section</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-[11px] font-black text-[#0B2C66] uppercase mb-2 border-b pb-2">"Be Part Of" Container</h4>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Title</label>
                  <input type="text" value={content.cta.bePartTitle} onChange={(e) => handleCtaChange('main', 'bePartTitle', e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-md" placeholder="e.g. Be Part Of Day 3" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Description</label>
                  <textarea value={content.cta.bePartDescription} onChange={(e) => handleCtaChange('main', 'bePartDescription', e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-md min-h-[60px]" placeholder="Brief invitation text" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-[11px] font-black text-[#0B2C66] uppercase mb-2 border-b pb-2">Delegate Pass Card</h4>
                  <input type="text" value={content.cta.delegatePass.title} onChange={(e) => handleCtaChange('delegatePass', 'title', e.target.value)} className="w-full px-3 py-1.5 text-xs font-bold border rounded-md" placeholder="Card Title" />
                  <textarea value={content.cta.delegatePass.description} onChange={(e) => handleCtaChange('delegatePass', 'description', e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-md min-h-[40px]" placeholder="Card Description" />
                </div>
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-[11px] font-black text-[#0B2C66] uppercase mb-2 border-b pb-2">Sponsor Card</h4>
                  <input type="text" value={content.cta.sponsor.title} onChange={(e) => handleCtaChange('sponsor', 'title', e.target.value)} className="w-full px-3 py-1.5 text-xs font-bold border rounded-md" placeholder="Card Title" />
                  <textarea value={content.cta.sponsor.description} onChange={(e) => handleCtaChange('sponsor', 'description', e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-md min-h-[40px]" placeholder="Card Description" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="fixed bottom-6 right-6 left-72 z-50 bg-white/90 backdrop-blur-md p-4 border-2 border-[#0B2C66]/20 rounded-2xl shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-500">
            <div className={`w-3 h-3 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-[#4E9F3D] shadow-[0_0_10px_#4E9F3D]'}`}></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B2C66]">{loading ? 'Processing...' : `Day ${activeDay} Workspace`}</span>
              <span className="text-[9px] text-gray-400 font-medium italic">Changes are not saved until you click the button</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="px-12 py-3 bg-[#0B2C66] text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#08214d] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-blue-900/20 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            Save Day {activeDay} Content
          </button>
        </div>

      </form>
    </div>
  );
};

export default ConferenceDayManagement;
