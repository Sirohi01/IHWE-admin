import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, Type, ImageIcon, 
  Quote, MapPin, List, Edit, Users, Globe, 
  Handshake, Mic2, Leaf, Building2, Play, Video, 
  Settings, ChevronRight, Store, MousePointer2,
  Layout, BarChart3, Clock, Trash, MessageSquare
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const NewTestimonialsManagement = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    settings: {
      subtitle: "Testimonials",
      heading: "Real Voices.<div><font color=\"#0145b2\">Real Impact.</font></div>",
      description: "From innovation to collaboration, our global community shares how <font color=\"#0b6100\">IHWE</font> is driving meaningful connections, advancing healthcare, and building a healthier future for all.",
      heroBgImage: "",
      heroBgAlt: "IHWE Expo Background",
      dividerText: "WHAT OUR EXHIBITORS & PARTNERS SAY",
      heroStats: [],
      videoMainHeading: "Our Exhibitors",
      videoSubheading: "Hear Directly From",
      videoDescription: "Real stories from real partners who experienced the IHWE impact.",
      videoButtonText: "View More Videos",
      videoButtonPath: "#",
      bottomBarStats: [],
      ctaMainText: "Be the Next",
      ctaSubText: "Success Story",
      ctaBottomText: "at IHWE 2026!",
      ctaButton1Name: "Book Your Stall",
      ctaButton1Path: "/book-a-stand",
      ctaButton2Name: "Apply Now",
      ctaButton2Path: "/registration"
    },
    cards: [],
    videos: []
  });

  // Form States
  const [heroBgFile, setHeroBgFile] = useState(null);
  const [heroBgPreview, setHeroBgPreview] = useState("");

  const [cardForm, setCardForm] = useState({
    quote: "",
    company1: "",
    company2: "",
    location: "",
    color: "#23471d",
    order: 0,
    logoAlt: "Logo",
    bottomImageAlt: "Bottom Decoration"
  });
  const [cardLogoFile, setCardLogoFile] = useState(null);
  const [cardLogoPreview, setCardLogoPreview] = useState("");
  const [cardBottomFile, setCardBottomFile] = useState(null);
  const [cardBottomPreview, setCardBottomPreview] = useState("");
  const [editCardId, setEditCardId] = useState(null);

  const [videoForm, setVideoForm] = useState({
    title: "",
    location: "",
    videoUrl: "",
    order: 0,
    status: "active"
  });
  const [editVideoId, setEditVideoId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/new-testimonials");
      if (response.data.success) {
        setData({
          settings: response.data.data.settings,
          cards: response.data.data.cards,
          videos: response.data.data.videos
        });
        if (response.data.data.settings.heroBgImage) {
          setHeroBgPreview(`${SERVER_URL}${response.data.data.settings.heroBgImage}`);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── SETTINGS HANDLERS ───
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, [name]: value }
    }));
  };

  const handleHeroStatChange = (index, field, value) => {
    const newStats = [...data.settings.heroStats];
    newStats[index] = { ...newStats[index], [field]: value };
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, heroStats: newStats }
    }));
  };

  const handleBottomStatChange = (index, field, value) => {
    const newStats = [...data.settings.bottomBarStats];
    newStats[index] = { ...newStats[index], [field]: value };
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, bottomBarStats: newStats }
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data.settings).forEach(key => {
        if (key === 'heroStats' || key === 'bottomBarStats') {
          formData.append(key, JSON.stringify(data.settings[key]));
        } else {
          formData.append(key, data.settings[key]);
        }
      });
      if (heroBgFile) formData.append('heroBgImage', heroBgFile);

      const response = await api.post("/api/new-testimonials/settings", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Settings Saved', timer: 1500, showConfirmButton: false });
        fetchData();
        setHeroBgFile(null);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── CARD HANDLERS ───
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(cardForm).forEach(key => formData.append(key, cardForm[key]));
      if (cardLogoFile) formData.append('logo', cardLogoFile);
      if (cardBottomFile) formData.append('bottomImage', cardBottomFile);

      let response;
      if (editCardId) {
        response = await api.put(`/api/new-testimonials/cards/${editCardId}`, formData);
      } else {
        response = await api.post("/api/new-testimonials/cards", formData);
      }

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: editCardId ? 'Card Updated' : 'Card Added', timer: 1500, showConfirmButton: false });
        fetchData();
        resetCardForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetCardForm = () => {
    setCardForm({ quote: "", company1: "", company2: "", location: "", color: "#23471d", order: 0, logoAlt: "Logo", bottomImageAlt: "Bottom Decoration" });
    setCardLogoFile(null);
    setCardLogoPreview("");
    setCardBottomFile(null);
    setCardBottomPreview("");
    setEditCardId(null);
  };

  const startEditCard = (card) => {
    setEditCardId(card._id);
    setCardForm({
      quote: card.quote,
      company1: card.company1,
      company2: card.company2 || "",
      location: card.location,
      color: card.color,
      order: card.order || 0,
      logoAlt: card.logoAlt || "Logo",
      bottomImageAlt: card.bottomImageAlt || "Bottom Decoration"
    });
    if (card.logo) setCardLogoPreview(`${SERVER_URL}${card.logo}`);
    if (card.bottomImage) setCardBottomPreview(`${SERVER_URL}${card.bottomImage}`);
    setActiveTab('cards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCard = async (id) => {
    const result = await Swal.fire({ title: "Are you sure?", icon: "warning", showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/new-testimonials/cards/${id}`);
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  // ─── VIDEO HANDLERS ───
  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let response;
      if (editVideoId) {
        response = await api.put(`/api/new-testimonials/videos/${editVideoId}`, videoForm);
      } else {
        response = await api.post("/api/new-testimonials/videos", videoForm);
      }
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Video Saved', timer: 1500, showConfirmButton: false });
        fetchData();
        resetVideoForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetVideoForm = () => {
    setVideoForm({ title: "", location: "", videoUrl: "", order: 0, status: "active" });
    setEditVideoId(null);
  };

  const startEditVideo = (video) => {
    setEditVideoId(video._id);
    setVideoForm({
      title: video.title,
      location: video.location,
      videoUrl: video.videoUrl,
      order: video.order || 0,
      status: video.status
    });
    setActiveTab('videos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteVideo = async (id) => {
    const result = await Swal.fire({ title: "Delete Video?", icon: "warning", showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/new-testimonials/videos/${id}`);
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  const ICONS_DROPDOWN = [
    { value: 'Globe', label: 'Globe', icon: Globe },
    { value: 'Users', label: 'Users', icon: Users },
    { value: 'Handshake', label: 'Handshake', icon: Handshake },
    { value: 'Mic2', label: 'Expert Mic', icon: Mic2 },
    { value: 'Leaf', label: 'Leaf', icon: Leaf },
    { value: 'Building2', label: 'Building', icon: Building2 },
    { value: 'Store', label: 'Store', icon: Store }
  ];

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="NEW TESTIMONIALS MANAGEMENT"
        description="Manage the Testimonials section content, background patterns, and user voices"
      />

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 mb-8 mt-6 border-b border-gray-100 pb-4">
        {[
          { id: 'general', label: 'General & Hero Stats', icon: Layout },
          { id: 'cards', label: 'Testimonial Cards', icon: MessageSquare },
          { id: 'videos', label: 'Video Section', icon: Video },
          { id: 'cta', label: 'Bottom Bar & CTA', icon: MousePointer2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.id 
              ? 'bg-[#23471d] text-white shadow-lg' 
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        
        {/* ─── TAB 1: GENERAL & HERO STATS ─── */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg h-fit">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#23471d] border-b pb-3 uppercase tracking-tighter">
                <Settings className="w-5 h-5 text-[#d26019]" /> Hero Content Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={data.settings.subtitle}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#23471d] outline-none font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading (HTML supported)</label>
                  <input
                    type="text"
                    name="heading"
                    value={data.settings.heading}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#23471d] outline-none font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Short Description</label>
                  <textarea
                    name="description"
                    value={data.settings.description}
                    onChange={handleSettingsChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#23471d] outline-none font-medium text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Hero Background Image</label>
                  <div 
                    className="relative border-2 border-dashed border-gray-300 h-48 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden"
                    onClick={() => document.getElementById('heroBg').click()}
                  >
                    {heroBgPreview ? (
                      <img src={heroBgPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-gray-300 mb-2 group-hover:text-[#23471d] transition-colors" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to upload background</span>
                      </>
                    )}
                    <input 
                      type="file" id="heroBg" className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setHeroBgFile(file);
                          setHeroBgPreview(URL.createObjectURL(file));
                        }
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Section Divider Text</label>
                  <input
                    type="text"
                    name="dividerText"
                    value={data.settings.dividerText}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#23471d] outline-none font-bold text-sm text-[#23471d]"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="w-full py-4 bg-[#23471d] text-white font-black hover:bg-green-900 transition-all flex items-center justify-center gap-3 shadow-xl uppercase tracking-widest text-xs"
                >
                  <Save className="w-5 h-5" /> Save General Settings
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#23471d] border-b pb-3 uppercase tracking-tighter">
                  <BarChart3 className="w-5 h-5 text-[#d26019]" /> Hero Stats (4 Items)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.settings.heroStats.map((stat, idx) => (
                    <div key={idx} className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50/50">
                      <div className="flex items-center gap-3 mb-3">
                         <select 
                           value={stat.icon} 
                           onChange={(e) => handleHeroStatChange(idx, 'icon', e.target.value)}
                           className="bg-white border border-gray-200 rounded p-1 text-xs font-bold"
                         >
                           {ICONS_DROPDOWN.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                         </select>
                         <input 
                           type="color" 
                           value={stat.color}
                           onChange={(e) => handleHeroStatChange(idx, 'color', e.target.value)}
                           className="w-8 h-8 rounded border-none cursor-pointer"
                         />
                      </div>
                      <input
                        type="text"
                        placeholder="Value (e.g. 1000+)"
                        value={stat.value}
                        onChange={(e) => handleHeroStatChange(idx, 'value', e.target.value)}
                        className="w-full px-3 py-2 mb-2 border-2 border-gray-200 rounded text-xs font-black uppercase tracking-widest text-[#23471d]"
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g. Global Buyers)"
                        value={stat.label}
                        onChange={(e) => handleHeroStatChange(idx, 'label', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded text-[10px] font-bold text-gray-500 uppercase"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="w-full mt-6 py-3 border-2 border-[#23471d] text-[#23471d] font-black hover:bg-[#23471d] hover:text-white transition-all uppercase tracking-widest text-[10px]"
                >
                  Update Hero Stats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: TESTIMONIAL CARDS ─── */}
        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-4">
               <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg sticky top-6">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#d26019] border-b pb-3 uppercase tracking-tighter">
                    {editCardId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editCardId ? 'Edit Testimonial' : 'Add Testimonial'}
                  </h3>
                  <form onSubmit={handleCardSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Testimonial Quote</label>
                      <textarea
                        value={cardForm.quote}
                        onChange={(e) => setCardForm({...cardForm, quote: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#23471d] outline-none font-medium text-sm leading-relaxed"
                        placeholder="What did they say?"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Card Color</label>
                          <input 
                            type="color" 
                            value={cardForm.color}
                            onChange={(e) => setCardForm({...cardForm, color: e.target.value})}
                            className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Display Order</label>
                          <input 
                            type="number" 
                            value={cardForm.order}
                            onChange={(e) => setCardForm({...cardForm, order: e.target.value})}
                            className="w-full px-4 py-2 border-2 border-gray-300 outline-none font-bold text-sm h-10 rounded-lg"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Card Logo (Top Left)</label>
                          <div 
                            className="relative border-2 border-dashed border-gray-300 h-24 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden"
                            onClick={() => document.getElementById('cardLogo').click()}
                          >
                            {cardLogoPreview ? (
                              <img src={cardLogoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                            ) : (
                              <Plus className="w-6 h-6 text-gray-300 group-hover:text-[#d26019]" />
                            )}
                            <input type="file" id="cardLogo" className="hidden" onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) { setCardLogoFile(file); setCardLogoPreview(URL.createObjectURL(file)); }
                            }} />
                          </div>
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Decoration (Bottom Right)</label>
                          <div 
                            className="relative border-2 border-dashed border-gray-300 h-24 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden"
                            onClick={() => document.getElementById('cardBottom').click()}
                          >
                            {cardBottomPreview ? (
                              <img src={cardBottomPreview} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-300 group-hover:text-[#d26019]" />
                            )}
                            <input type="file" id="cardBottom" className="hidden" onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) { setCardBottomFile(file); setCardBottomPreview(URL.createObjectURL(file)); }
                            }} />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <input 
                         type="text" 
                         placeholder="Company Name (Line 1)*"
                         value={cardForm.company1}
                         onChange={(e) => setCardForm({...cardForm, company1: e.target.value})}
                         className="w-full px-4 py-2.5 border-2 border-gray-300 outline-none font-bold text-sm rounded-lg"
                         required
                       />
                       <input 
                         type="text" 
                         placeholder="Company Name (Line 2) - Optional"
                         value={cardForm.company2}
                         onChange={(e) => setCardForm({...cardForm, company2: e.target.value})}
                         className="w-full px-4 py-2.5 border-2 border-gray-200 outline-none font-medium text-xs rounded-lg italic"
                       />
                       <input 
                         type="text" 
                         placeholder="Location (e.g. Dubai, UAE)*"
                         value={cardForm.location}
                         onChange={(e) => setCardForm({...cardForm, location: e.target.value})}
                         className="w-full px-4 py-2.5 border-2 border-gray-300 outline-none font-medium text-xs rounded-lg"
                         required
                       />
                    </div>

                    <div className="flex gap-2 pt-4">
                       <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-[#23471d] text-white font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-green-900 shadow-lg">
                         {editCardId ? 'Update Card' : 'Save Testimonial'}
                       </button>
                       {editCardId && (
                         <button type="button" onClick={resetCardForm} className="px-6 py-3 border-2 border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-gray-50">
                           Cancel
                         </button>
                       )}
                    </div>
                  </form>
               </div>
            </div>

            <div className="lg:col-span-8">
               <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-[#23471d] px-6 py-4 flex items-center justify-between">
                     <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <List size={16} /> Testimonials List
                     </h3>
                     <span className="bg-[#d26019] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                        {data.cards.length} TOTAL VOICES
                     </span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[1200px] overflow-y-auto">
                     {data.cards.length === 0 ? (
                       <div className="p-20 text-center text-gray-300 italic font-medium">No testimonials found. Add your first voice.</div>
                     ) : (
                       data.cards.map((card, idx) => (
                         <div key={card._id} className="p-6 hover:bg-gray-50 transition-colors group relative">
                            <div className="flex gap-6 items-start">
                               <div className="w-16 h-16 rounded-xl border border-gray-100 flex items-center justify-center bg-white shadow-sm overflow-hidden shrink-0">
                                  {card.logo ? <img src={`${SERVER_URL}${card.logo}`} className="w-full h-full object-contain p-2" /> : <Quote size={24} className="text-gray-200" />}
                               </div>
                               <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                     <h4 className="font-black text-[#23471d] text-sm uppercase">{card.company1} {card.company2}</h4>
                                     <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-400 uppercase">Order: {card.order || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest">
                                     <MapPin size={10} className="text-[#d26019]" /> {card.location}
                                  </div>
                                  <p className="text-gray-600 text-xs italic leading-relaxed line-clamp-3">"{card.quote}"</p>
                               </div>
                               <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditCard(card)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 shadow-sm transition-colors"><Edit2 size={16} /></button>
                                  <button onClick={() => deleteCard(card._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 shadow-sm transition-colors"><Trash2 size={16} /></button>
                               </div>
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: VIDEOS ─── */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
                   <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#23471d] border-b pb-3 uppercase tracking-tighter">
                      <Layout className="w-5 h-5 text-[#d26019]" /> Video Section Header
                   </h3>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Subheading</label>
                        <input 
                          type="text" 
                          name="videoSubheading" 
                          value={data.settings.videoSubheading} 
                          onChange={handleSettingsChange}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main Heading</label>
                        <input 
                          type="text" 
                          name="videoMainHeading" 
                          value={data.settings.videoMainHeading} 
                          onChange={handleSettingsChange}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none font-black text-[#23471d] uppercase tracking-tighter"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Description</label>
                        <textarea 
                          name="videoDescription" 
                          value={data.settings.videoDescription} 
                          onChange={handleSettingsChange}
                          rows={2}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none font-medium text-xs leading-relaxed"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Btn Text</label>
                            <input 
                              type="text" 
                              name="videoButtonText" 
                              value={data.settings.videoButtonText} 
                              onChange={handleSettingsChange}
                              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none font-bold text-xs"
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Btn Path</label>
                            <input 
                              type="text" 
                              name="videoButtonPath" 
                              value={data.settings.videoButtonPath} 
                              onChange={handleSettingsChange}
                              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none font-medium text-xs"
                            />
                         </div>
                      </div>
                      <button onClick={handleSaveSettings} className="w-full py-3 bg-[#23471d] text-white font-black uppercase tracking-widest text-[10px] rounded-lg mt-2">Update Video Header</button>
                   </div>
                </div>

                <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
                   <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#d26019] border-b pb-3 uppercase tracking-tighter">
                      {editVideoId ? <Edit2 size={18}/> : <Plus size={18}/>}
                      {editVideoId ? 'Edit Video Link' : 'Add New Video Link'}
                   </h3>
                   <form onSubmit={handleVideoSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Video Title / Company*</label>
                        <input 
                          type="text" 
                          value={videoForm.title} 
                          onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none font-bold text-sm"
                          placeholder="e.g. NatureCure International"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Location</label>
                        <input 
                          type="text" 
                          value={videoForm.location} 
                          onChange={(e) => setVideoForm({...videoForm, location: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none font-medium text-sm"
                          placeholder="Dubai, UAE"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">YouTube / Video URL*</label>
                        <div className="relative">
                           <Play size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                           <input 
                             type="url" 
                             value={videoForm.videoUrl} 
                             onChange={(e) => setVideoForm({...videoForm, videoUrl: e.target.value})}
                             className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg outline-none font-medium text-xs text-blue-600"
                             placeholder="https://youtube.com/watch?v=..."
                             required
                           />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Order</label>
                            <input 
                              type="number" 
                              value={videoForm.order} 
                              onChange={(e) => setVideoForm({...videoForm, order: e.target.value})}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-bold text-sm"
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Status</label>
                            <select 
                              value={videoForm.status} 
                              onChange={(e) => setVideoForm({...videoForm, status: e.target.value})}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-black text-[10px] uppercase tracking-widest"
                            >
                               <option value="active">Active</option>
                               <option value="inactive">Inactive</option>
                            </select>
                         </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                         <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-[#d26019] text-white font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-orange-700 shadow-lg">
                           {editVideoId ? 'Update Link' : 'Add Video'}
                         </button>
                         {editVideoId && <button type="button" onClick={resetVideoForm} className="px-6 py-3 border-2 border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-lg">Cancel</button>}
                      </div>
                   </form>
                </div>
             </div>

             <div className="lg:col-span-8">
                <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm overflow-hidden">
                   <div className="bg-[#23471d] px-6 py-4 flex items-center justify-between">
                      <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                         <Video size={16} /> Uploaded Video List
                      </h3>
                   </div>
                   <div className="max-h-[800px] overflow-y-auto divide-y divide-gray-100">
                      {data.videos.length === 0 ? (
                        <div className="p-20 text-center text-gray-300 italic font-medium">No videos found.</div>
                      ) : (
                        data.videos.map((vid, idx) => (
                          <div key={vid._id} className="p-5 hover:bg-gray-50 transition-colors flex items-center gap-5 group">
                             <div className="w-24 h-16 bg-black rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative">
                                <Play size={20} className="text-white opacity-40" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                             </div>
                             <div className="flex-1">
                                <h4 className="font-black text-[#23471d] text-sm uppercase">{vid.title}</h4>
                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase mt-1">
                                   <span className="flex items-center gap-1"><MapPin size={10} className="text-[#d26019]" /> {vid.location}</span>
                                   <span className={`px-2 py-0.5 rounded-full ${vid.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{vid.status}</span>
                                   <span>Order: {vid.order}</span>
                                </div>
                                <div className="text-[10px] text-blue-500 font-medium truncate max-w-md mt-1">{vid.videoUrl}</div>
                             </div>
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditVideo(vid)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16} /></button>
                                <button onClick={() => deleteVideo(vid._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash size={16} /></button>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ─── TAB 4: BOTTOM BAR & CTA ─── */}
        {activeTab === 'cta' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#23471d] border-b pb-3 uppercase tracking-tighter">
                   <Leaf className="w-5 h-5 text-[#d26019]" /> Bottom Bar Stats (4 Items)
                </h3>
                <div className="space-y-4">
                   {data.settings.bottomBarStats.map((stat, idx) => (
                     <div key={idx} className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50/50 grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-2">
                           <select 
                             value={stat.icon} 
                             onChange={(e) => handleBottomStatChange(idx, 'icon', e.target.value)}
                             className="w-full bg-white border border-gray-200 rounded p-2 text-xs font-bold"
                           >
                             {ICONS_DROPDOWN.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                           </select>
                        </div>
                        <div className="col-span-5">
                           <input
                             type="text"
                             placeholder="Label (e.g. Trusted by)"
                             value={stat.label}
                             onChange={(e) => handleBottomStatChange(idx, 'label', e.target.value)}
                             className="w-full px-3 py-2 border-2 border-gray-200 rounded text-[10px] font-bold text-gray-500 uppercase"
                           />
                        </div>
                        <div className="col-span-5">
                           <input
                             type="text"
                             placeholder="Value (e.g. 150+ Exhibitors)"
                             value={stat.value}
                             onChange={(e) => handleBottomStatChange(idx, 'value', e.target.value)}
                             className="w-full px-3 py-2 border-2 border-gray-200 rounded text-xs font-black uppercase tracking-widest text-[#23471d]"
                           />
                        </div>
                     </div>
                   ))}
                </div>
                <button onClick={handleSaveSettings} className="w-full mt-6 py-4 bg-[#23471d] text-white font-black uppercase tracking-widest text-[10px] rounded-lg shadow-lg">Save Bottom Stats</button>
             </div>

             <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#23471d] border-b pb-3 uppercase tracking-tighter">
                   <MousePointer2 className="w-5 h-5 text-[#d26019]" /> CTA Banner Settings
                </h3>
                <div className="space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Main CTA Text</label>
                         <input 
                           type="text" 
                           name="ctaMainText" 
                           value={data.settings.ctaMainText} 
                           onChange={handleSettingsChange}
                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none font-bold text-sm"
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Sub CTA Text (Gold)</label>
                         <input 
                           type="text" 
                           name="ctaSubText" 
                           value={data.settings.ctaSubText} 
                           onChange={handleSettingsChange}
                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none font-bold text-sm text-[#d26019]"
                         />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">CTA Bottom Line</label>
                      <input 
                        type="text" 
                        name="ctaBottomText" 
                        value={data.settings.ctaBottomText} 
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none font-black text-[#23471d] uppercase tracking-tighter"
                      />
                   </div>

                   <div className="p-4 border-2 border-[#d26019]/20 bg-[#d26019]/5 rounded-xl space-y-4">
                      <h4 className="text-xs font-black text-[#d26019] uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Store size={14}/> Primary Button (Premium)
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                         <input 
                           type="text" 
                           placeholder="Btn Name"
                           name="ctaButton1Name" 
                           value={data.settings.ctaButton1Name} 
                           onChange={handleSettingsChange}
                           className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-xs font-bold"
                         />
                         <input 
                           type="text" 
                           placeholder="Btn Path"
                           name="ctaButton1Path" 
                           value={data.settings.ctaButton1Path} 
                           onChange={handleSettingsChange}
                           className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-[10px] font-medium"
                         />
                      </div>
                   </div>

                   <div className="p-4 border-2 border-gray-200 bg-gray-50/50 rounded-xl space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <ChevronRight size={14}/> Secondary Button
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                         <input 
                           type="text" 
                           placeholder="Btn Name"
                           name="ctaButton2Name" 
                           value={data.settings.ctaButton2Name} 
                           onChange={handleSettingsChange}
                           className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-xs font-bold"
                         />
                         <input 
                           type="text" 
                           placeholder="Btn Path"
                           name="ctaButton2Path" 
                           value={data.settings.ctaButton2Path} 
                           onChange={handleSettingsChange}
                           className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-[10px] font-medium"
                         />
                      </div>
                   </div>

                   <button onClick={handleSaveSettings} className="w-full py-4 bg-[#23471d] text-white font-black uppercase tracking-widest text-[10px] rounded-lg shadow-lg">Save CTA Banner Settings</button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default NewTestimonialsManagement;
