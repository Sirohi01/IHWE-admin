import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, BadgeHelp, Edit, List, 
  Type, ImageIcon, Globe, UserCheck, BookOpen, TrendingUp, CheckCircle
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const ICONS_LIST = [
    { name: 'Globe', icon: Globe },
    { name: 'UserCheck', icon: UserCheck },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'TrendingUp', icon: TrendingUp },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return null;
    const Comp = found.icon;
    return <Comp {...props} />;
};

const NationalExpo = () => {
  const [data, setData] = useState({
    subtitle: "",
    title: "",
    description: "",
    bgImage: "",
    altText: "",
    points: [],
    cards: []
  });

  const [pointForm, setPointForm] = useState({ text: "", order: 0 });
  const [cardForm, setCardForm] = useState({ icon: "Globe", goldTitle: "", whiteTitle: "", description: "", order: 0 });
  
  const [bgFile, setBgFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/national-expo");
      if (response.data.success) {
        setData(response.data.data);
        if (response.data.data.bgImage) {
            setPreviewUrl(`${SERVER_URL}${response.data.data.bgImage}`);
        }
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
      const formData = new FormData();
      formData.append('subtitle', data.subtitle);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('altText', data.altText);
      if (bgFile) formData.append('bgImage', bgFile);

      const response = await api.post("/api/national-expo/settings", formData);
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Settings Saved', timer: 1500, showConfirmButton: false });
        fetchData();
        setBgFile(null);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let res;
      if (editingPoint) {
        res = await api.put(`/api/national-expo/points/${editingPoint}`, pointForm);
      } else {
        res = await api.post("/api/national-expo/points", pointForm);
      }
      if (res.data.success) {
        fetchData();
        setPointForm({ text: "", order: 0 });
        setEditingPoint(null);
      }
    } catch (err) { Swal.fire("Error", "Action failed", "error"); }
    finally { setIsLoading(false); }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let res;
      if (editingCard) {
        res = await api.put(`/api/national-expo/cards/${editingCard}`, cardForm);
      } else {
        res = await api.post("/api/national-expo/cards", cardForm);
      }
      if (res.data.success) {
        fetchData();
        setCardForm({ icon: "Globe", goldTitle: "", whiteTitle: "", description: "", order: 0 });
        setEditingCard(null);
      }
    } catch (err) { Swal.fire("Error", "Action failed", "error"); }
    finally { setIsLoading(false); }
  };

  const deleteItem = async (type, id) => {
    const res = await Swal.fire({ title: "Delete?", showCancelButton: true });
    if (res.isConfirmed) {
      await api.delete(`/api/national-expo/${type}/${id}`);
      fetchData();
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="NATIONAL EXPO MANAGEMENT"
        description="Manage the 'From India to the World' section content, points, and cards"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 font-inter">
        
        {/* Main Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center justify-between text-[#23471d] border-b-2 border-gray-100 pb-3 uppercase tracking-tighter">
              <span className="flex items-center gap-2">
                <Type className="w-5 h-5 text-[#d26019]" /> Content & Background
              </span>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded border border-gray-200">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#d4a742' }}></div>
                <span className="text-[10px] font-bold text-gray-500">GOLD: #d4a742 | rgb(212, 167, 66)</span>
              </div>
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subtitle</label>
                <RichTextEditor value={data.subtitle} onChange={(val) => setData({...data, subtitle: val})} minHeight="80px" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Main Title</label>
                <RichTextEditor value={data.title} onChange={(val) => setData({...data, title: val})} minHeight="100px" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Short Description</label>
                <RichTextEditor value={data.description} onChange={(val) => setData({...data, description: val})} minHeight="120px" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">World Map BG</label>
                  <div 
                    className="relative border-2 border-dashed border-gray-300 h-32 flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden"
                    onClick={() => document.getElementById('bgFile').click()}
                  >
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-contain opacity-50" /> : <ImageIcon className="text-gray-400" />}
                    <input type="file" id="bgFile" className="hidden" onChange={(e) => {
                      const f = e.target.files[0];
                      if(f) { setBgFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                    }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image Alt Text</label>
                  <input type="text" value={data.altText} onChange={(e) => setData({...data, altText: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 outline-none text-sm" />
                </div>
              </div>

              <button onClick={handleSettingsSave} disabled={isLoading} className="w-full py-3 bg-[#23471d] text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <Save size={16} /> Save Settings
              </button>
            </div>
          </div>

          {/* Points Management */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 text-[#d26019] border-b-2 border-gray-100 pb-3 flex items-center gap-2 uppercase tracking-tighter">
                <CheckCircle size={18} /> {editingPoint ? 'Edit Point' : 'Add Point'}
            </h2>
            <form onSubmit={handlePointSubmit} className="space-y-4">
                <input type="text" value={pointForm.text} onChange={(e) => setPointForm({...pointForm, text: e.target.value})} placeholder="Point Text..." className="w-full px-3 py-2 border-2 border-gray-200 text-sm outline-none" required />
                <div className="flex gap-2">
                    <input type="number" value={pointForm.order} onChange={(e) => setPointForm({...pointForm, order: e.target.value})} className="w-20 px-3 py-2 border-2 border-gray-200 text-sm" placeholder="Order" />
                    <button type="submit" className="flex-1 bg-[#d26019] text-white font-bold text-xs uppercase">{editingPoint ? 'Update' : 'Add Point'}</button>
                    {editingPoint && <button type="button" onClick={() => {setEditingPoint(null); setPointForm({text:"", order:0})}} className="px-3 border-2 border-gray-200 text-xs">X</button>}
                </div>
            </form>
            <div className="mt-6 space-y-2">
                {data.points?.sort((a,b)=>a.order-b.order).map(p => (
                    <div key={p._id} className="flex items-center justify-between p-2 bg-gray-50 border text-sm font-medium group">
                        <span className="flex items-center gap-2"><span className="text-[10px] bg-gray-200 px-1">{p.order}</span> {p.text}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={14} className="text-blue-500 cursor-pointer" onClick={() => {setEditingPoint(p._id); setPointForm({text:p.text, order:p.order})}} />
                            <Trash2 size={14} className="text-red-500 cursor-pointer" onClick={() => deleteItem('points', p._id)} />
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Cards Management */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
                <h2 className="text-lg font-bold mb-6 text-[#23471d] border-b-2 border-gray-100 pb-3 uppercase tracking-tighter flex items-center gap-2">
                    <Plus size={18} className="text-[#d26019]" /> {editingCard ? 'Edit Dynamic Card' : 'Add Dynamic Card'}
                </h2>
                <form onSubmit={handleCardSubmit} className="grid grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Icon</label>
                        <select value={cardForm.icon} onChange={(e) => setCardForm({...cardForm, icon: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm font-bold">
                            {ICONS_LIST.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Gold Title</label>
                        <input type="text" value={cardForm.goldTitle} onChange={(e) => setCardForm({...cardForm, goldTitle: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm font-black text-[#d26019]" placeholder="e.g. GLOBAL" required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">White Title</label>
                        <input type="text" value={cardForm.whiteTitle} onChange={(e) => setCardForm({...cardForm, whiteTitle: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm font-bold" placeholder="e.g. EXHIBITORS" required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Order</label>
                        <input type="number" value={cardForm.order} onChange={(e) => setCardForm({...cardForm, order: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Short Description</label>
                        <input type="text" value={cardForm.description} onChange={(e) => setCardForm({...cardForm, description: e.target.value})} className="w-full px-3 py-2 border-2 border-gray-200 text-sm" placeholder="Showcase to a global audience" required />
                    </div>
                    <div className="col-span-2 flex gap-2">
                        <button type="submit" className="flex-1 py-2.5 bg-[#23471d] text-white font-black text-xs uppercase tracking-widest">{editingCard ? 'Update Card' : 'Save Card'}</button>
                        {editingCard && <button type="button" onClick={() => {setEditingCard(null); setCardForm({icon:"Globe", goldTitle:"", whiteTitle:"", description:"", order:0})}} className="px-4 border-2 border-gray-200 text-sm font-bold">Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="bg-white border-2 border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-[#23471d] text-white flex justify-between items-center">
                    <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2"><List size={16} className="text-[#d26019]" /> Active Cards</h3>
                    <span className="text-[10px] font-bold bg-[#d26019] px-2 py-0.5 rounded">{data.cards?.length} TOTAL</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-inter">
                        <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Icon</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.cards?.sort((a,b)=>a.order-b.order).map(card => (
                                <tr key={card._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4"><IconComponent name={card.icon} size={20} className="text-[#d26019]" /></td>
                                    <td className="px-6 py-4 leading-tight">
                                        <div className="text-[#d26019] font-black text-xs">{card.goldTitle}</div>
                                        <div className="font-bold text-xs">{card.whiteTitle}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">{card.description}</td>
                                    <td className="px-6 py-4 font-black">{card.order}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-3">
                                            <Edit2 size={16} className="text-blue-500 cursor-pointer" onClick={() => {
                                                setEditingCard(card._id);
                                                setCardForm({...card});
                                            }} />
                                            <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => deleteItem('cards', card._id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-2 border-gray-100 rounded-lg text-[11px] text-gray-500 flex gap-3">
                <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
                <div>
                    <p className="font-black text-gray-700 uppercase mb-1 tracking-tighter">National Expo Guide:</p>
                    <ul className="list-disc list-inside space-y-1 font-semibold italic">
                        <li>The section background is set to a deep dark blue (#08172a).</li>
                        <li>Upload a world map pattern (PNG with transparency) for the background watermark.</li>
                        <li>Points will appear as a checklist with gold checkmarks on the left.</li>
                        <li>Cards will appear in a grid on the right side on large screens.</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NationalExpo;
