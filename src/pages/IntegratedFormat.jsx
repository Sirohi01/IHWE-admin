import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, BadgeHelp, Edit, List, 
  Type, Palette, LayoutGrid, 
  Building2, Users, Award, Handshake, Globe, Activity, Leaf, 
  Stethoscope, Landmark, GraduationCap, Package, Camera, ShieldCheck, UserCheck, Briefcase, Sparkles
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const ICONS_LIST = [
    { name: 'Building2', icon: Building2 },
    { name: 'Users', icon: Users },
    { name: 'Award', icon: Award },
    { name: 'Handshake', icon: Handshake },
    { name: 'Globe', icon: Globe },
    { name: 'Activity', icon: Activity },
    { name: 'Leaf', icon: Leaf },
    { name: 'Stethoscope', icon: Stethoscope },
    { name: 'Landmark', icon: Landmark },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'Package', icon: Package },
    { name: 'Camera', icon: Camera },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'UserCheck', icon: UserCheck },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Sparkles', icon: Sparkles },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return null;
    const Comp = found.icon;
    return <Comp {...props} />;
};

const IntegratedFormat = () => {
  const [data, setData] = useState({
    subtitle: "",
    title: "",
    description: "",
    leafColor: "#23471d",
    cards: [],
    highlights: []
  });

  const [cardForm, setCardForm] = useState({ icon: "Building2", title: "", description: "", cardNumber: "", order: 0 });
  const [highlightForm, setHighlightForm] = useState({ icon: "Globe", title: "", description: "", order: 0 });
  
  const [isLoading, setIsLoading] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingHighlightId, setEditingHighlightId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/integrated-format");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/integrated-format/settings", {
        subtitle: data.subtitle,
        title: data.title,
        description: data.description,
        leafColor: data.leafColor
      });
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Settings Saved', timer: 1500, showConfirmButton: false });
        fetchData();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let res;
      if (editingCardId) res = await api.put(`/api/integrated-format/cards/${editingCardId}`, cardForm);
      else res = await api.post("/api/integrated-format/cards", cardForm);
      
      if (res.data.success) {
        fetchData();
        setCardForm({ icon: "Building2", title: "", description: "", cardNumber: "", order: 0 });
        setEditingCardId(null);
      }
    } catch (err) { Swal.fire("Error", "Action failed", "error"); }
    finally { setIsLoading(false); }
  };

  const handleHighlightSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let res;
      if (editingHighlightId) res = await api.put(`/api/integrated-format/highlights/${editingHighlightId}`, highlightForm);
      else res = await api.post("/api/integrated-format/highlights", highlightForm);
      
      if (res.data.success) {
        fetchData();
        setHighlightForm({ icon: "Globe", title: "", description: "", order: 0 });
        setEditingHighlightId(null);
      }
    } catch (err) { Swal.fire("Error", "Action failed", "error"); }
    finally { setIsLoading(false); }
  };

  const deleteItem = async (type, id) => {
    const res = await Swal.fire({ title: "Are you sure?", text: "This item will be deleted.", icon: "warning", showCancelButton: true });
    if (res.isConfirmed) {
      await api.delete(`/api/integrated-format/${type}/${id}`);
      fetchData();
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter">
      <PageHeader
        title="INTEGRATED FORMAT MANAGEMENT"
        description="Manage the main layout, cards, and highlights of the Integrated Format section"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Main Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center justify-between text-[#23471d] border-b-2 border-gray-100 pb-3 uppercase tracking-tighter">
              <span className="flex items-center gap-2">
                <Type className="w-5 h-5 text-[#d26019]" /> Content Settings
              </span>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0d47a1' }}></div>
                    <span className="text-[9px] font-bold text-gray-500">INTEGRATED: #0d47a1 | rgb(13, 71, 161)</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2f8f3a' }}></div>
                    <span className="text-[9px] font-bold text-gray-500">FORMAT: #2f8f3a | rgb(47, 143, 58)</span>
                </div>
              </div>
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subtitle (e.g. OUR COMPREHENSIVE)</label>
                <input
                    type="text"
                    value={data.subtitle}
                    onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#23471d] outline-none shadow-sm text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Main Title</label>
                <RichTextEditor value={data.title} onChange={(val) => setData({...data, title: val})} minHeight="100px" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                <RichTextEditor value={data.description} onChange={(val) => setData({...data, description: val})} minHeight="180px" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Leaf Icon Color</label>
                <div className="flex gap-2">
                    <input type="color" value={data.leafColor} onChange={(e) => setData({...data, leafColor: e.target.value})} className="h-10 w-16 border-2 border-gray-200 cursor-pointer" />
                    <input type="text" value={data.leafColor} onChange={(e) => setData({...data, leafColor: e.target.value})} className="flex-1 px-4 py-2 border-2 border-gray-200 outline-none text-sm font-mono uppercase" />
                </div>
              </div>

              <button onClick={handleSettingsSave} disabled={isLoading} className="w-full py-4 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg uppercase tracking-widest text-xs">
                <Save className="w-4 h-4" /> Save General Settings
              </button>
            </div>
          </div>

          {/* Highlights Management */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg mt-6">
            <h2 className="text-lg font-bold mb-6 text-[#d26019] border-b-2 border-gray-100 pb-3 flex items-center gap-2 uppercase tracking-tighter">
                <List className="w-5 h-5" /> {editingHighlightId ? 'Edit Highlight' : 'Add Bottom Highlight'}
            </h2>
            <form onSubmit={handleHighlightSubmit} className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Icon</label>
                        <select value={highlightForm.icon} onChange={(e) => setHighlightForm({...highlightForm, icon: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm font-bold">
                            {ICONS_LIST.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                        </select>
                    </div>
                    <div className="w-24">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Order</label>
                        <input type="number" value={highlightForm.order} onChange={(e) => setHighlightForm({...highlightForm, order: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm" />
                    </div>
                </div>
                <input type="text" value={highlightForm.title} onChange={(e) => setHighlightForm({...highlightForm, title: e.target.value})} placeholder="Title (e.g. GLOBAL PARTICIPATION)" className="w-full px-3 py-2 border-2 border-gray-200 text-sm font-bold" required />
                <textarea value={highlightForm.description} onChange={(e) => setHighlightForm({...highlightForm, description: e.target.value})} placeholder="Short description..." className="w-full px-3 py-2 border-2 border-gray-200 text-sm h-20" required />
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2 bg-[#d26019] text-white font-bold text-[11px] uppercase tracking-widest">{editingHighlightId ? 'Update' : 'Add Highlight'}</button>
                    {editingHighlightId && <button type="button" onClick={() => {setEditingHighlightId(null); setHighlightForm({icon:"Globe", title:"", description:"", order:0})}} className="px-4 border-2 border-gray-200 text-xs">X</button>}
                </div>
            </form>
          </div>
        </div>

        {/* Right Column: Cards Management */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
                <h2 className="text-lg font-bold mb-6 text-[#23471d] border-b-2 border-gray-100 pb-3 uppercase tracking-tighter flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-[#d26019]" /> {editingCardId ? 'Edit Format Card' : 'Add Format Card'}
                </h2>
                <form onSubmit={handleCardSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Icon</label>
                        <select value={cardForm.icon} onChange={(e) => setCardForm({...cardForm, icon: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm font-bold">
                            {ICONS_LIST.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Card Number (e.g. 01)</label>
                        <input type="text" value={cardForm.cardNumber} onChange={(e) => setCardForm({...cardForm, cardNumber: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm font-black" placeholder="01" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Order</label>
                        <input type="number" value={cardForm.order} onChange={(e) => setCardForm({...cardForm, order: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm" />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Title</label>
                        <input type="text" value={cardForm.title} onChange={(e) => setCardForm({...cardForm, title: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm font-bold" placeholder="DYNAMIC EXHIBITION" required />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Description</label>
                        <textarea value={cardForm.description} onChange={(e) => setCardForm({...cardForm, description: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm h-24" placeholder="Card description..." required />
                    </div>
                    <div className="md:col-span-3 flex gap-2">
                        <button type="submit" className="flex-1 py-3 bg-[#d26019] text-white font-black text-xs uppercase tracking-widest">{editingCardId ? 'Update Card' : 'Save Card'}</button>
                        {editingCardId && <button type="button" onClick={() => {setEditingCardId(null); setCardForm({icon:"Building2", title:"", description:"", cardNumber:"", order:0})}} className="px-6 border-2 border-gray-200 text-xs font-bold uppercase">Cancel</button>}
                    </div>
                </form>
            </div>

            {/* List of Items (Cards & Highlights) */}
            <div className="space-y-6">
                {/* Cards List */}
                <div className="bg-white border-2 border-gray-200 shadow-sm rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-[#23471d] text-white flex justify-between items-center">
                        <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">Format Cards List</h3>
                        <span className="text-[10px] font-bold bg-[#d26019] px-2 py-0.5 rounded">{data.cards?.length} CARDS</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm font-inter">
                            <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">No.</th>
                                    <th className="px-6 py-4 text-center">Icon</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 text-center">Order</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.cards?.sort((a,b)=>a.order-b.order).map((card, idx) => (
                                    <tr key={card._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-black text-[#d26019]">{card.cardNumber || idx+1}</td>
                                        <td className="px-6 py-4 text-center"><IconComponent name={card.icon} size={20} className="text-[#23471d] mx-auto" /></td>
                                        <td className="px-6 py-4 font-bold text-xs uppercase">{card.title}</td>
                                        <td className="px-6 py-4 text-center font-black">{card.order}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-3">
                                                <Edit2 size={16} className="text-blue-500 cursor-pointer" onClick={() => { setEditingCardId(card._id); setCardForm({...card}); }} />
                                                <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => deleteItem('cards', card._id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Highlights List */}
                <div className="bg-white border-2 border-gray-200 shadow-sm rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-[#d26019] text-white flex justify-between items-center">
                        <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">Bottom Highlights List</h3>
                        <span className="text-[10px] font-bold bg-white text-[#d26019] px-2 py-0.5 rounded">{data.highlights?.length} ITEMS</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm font-inter">
                            <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Icon</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 text-center">Order</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.highlights?.sort((a,b)=>a.order-b.order).map(h => (
                                    <tr key={h._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4"><IconComponent name={h.icon} size={20} className="text-[#23471d]" /></td>
                                        <td className="px-6 py-4 font-bold text-xs uppercase">{h.title}</td>
                                        <td className="px-6 py-4 text-center font-black">{h.order}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-3">
                                                <Edit2 size={16} className="text-blue-500 cursor-pointer" onClick={() => { setEditingHighlightId(h._id); setHighlightForm({...h}); }} />
                                                <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => deleteItem('highlights', h._id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-2 border-gray-100 rounded-lg text-[11px] text-gray-500 flex gap-3">
                <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
                <div>
                    <p className="font-black text-gray-700 uppercase mb-1 tracking-tighter">Integrated Format Management Guide:</p>
                    <ul className="list-disc list-inside space-y-1 font-semibold italic">
                        <li>The **Integrated Format** section combines general headings, 4 main cards, and 4 bottom highlights.</li>
                        <li>**Leaf Color**: Adjust the color of the decorative leaf icon next to the main title.</li>
                        <li>**Cards**: These appear in a row with numbered markers (01, 02, etc.).</li>
                        <li>**Highlights**: These appear at the very bottom with circular icons.</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedFormat;
