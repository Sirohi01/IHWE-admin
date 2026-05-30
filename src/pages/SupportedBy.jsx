import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, BadgeHelp, Edit, List, 
  Type, Palette, Hash, 
  Stethoscope, Landmark, Leaf, Globe, Building2, GraduationCap, 
  Users, Handshake, Package, Sparkles, Camera, ShieldCheck, UserCheck, Activity, Award, Briefcase
} from "lucide-react";
import api from "../lib/api";
import PageHeader from '../components/PageHeader';

const ICONS_LIST = [
    { name: 'Stethoscope', icon: Stethoscope },
    { name: 'Landmark', icon: Landmark },
    { name: 'Leaf', icon: Leaf },
    { name: 'Globe', icon: Globe },
    { name: 'Building2', icon: Building2 },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'Users', icon: Users },
    { name: 'Handshake', icon: Handshake },
    { name: 'Package', icon: Package },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Camera', icon: Camera },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'UserCheck', icon: UserCheck },
    { name: 'Activity', icon: Activity },
    { name: 'Award', icon: Award },
    { name: 'Briefcase', icon: Briefcase },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return null;
    const Comp = found.icon;
    return <Comp {...props} />;
};

const SupportedBy = () => {
  const [settings, setSettings] = useState({
    title: "Supported By",
    bgColor: "#23471d",
    items: []
  });

  const [itemForm, setItemForm] = useState({
    icon: "Stethoscope",
    label: "",
    label2: "",
    order: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/supported-by");
      if (response.data.success) {
        setSettings(response.data.data);
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
      const response = await api.post("/api/supported-by/settings", {
        title: settings.title,
        bgColor: settings.bgColor
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

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemForm.label) return Swal.fire("Warning", "Title is required", "warning");

    setIsLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/api/supported-by/items/${editingId}`, itemForm);
      } else {
        response = await api.post("/api/supported-by/items", itemForm);
      }

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: isEditing ? 'Item Updated' : 'Item Added', timer: 1500, showConfirmButton: false });
        fetchData();
        resetForm();
      }
    } catch (error) {
      Swal.fire("Error", "Action failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setItemForm({ icon: "Stethoscope", label: "", label2: "", order: 0 });
    setIsEditing(false);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setItemForm({
      icon: item.icon,
      label: item.label,
      label2: item.label2,
      order: item.order || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This item will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await api.delete(`/api/supported-by/items/${id}`);
        if (response.data.success) {
          Swal.fire("Deleted!", "Item removed.", "success");
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
        title="SUPPORTED BY MANAGEMENT"
        description="Manage the supported-by icons and section headings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left Column: Settings & Form */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Section Settings */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
              <Type className="w-5 h-5 text-[#d26019]" /> Section Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Section Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.bgColor}
                    onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                    className="h-10 w-20 border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.bgColor}
                    onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-mono text-sm"
                  />
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, bgColor: '#23471d' })}
                  className="mt-2 text-[10px] font-bold text-[#23471d] hover:underline uppercase tracking-widest"
                >
                  Reset to Default Green
                </button>
              </div>
              <button
                onClick={handleSettingsSave}
                disabled={isLoading}
                className="w-full py-3 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mt-2"
              >
                <Save className="w-5 h-5" /> Save Section Content
              </button>
            </div>
          </div>

          {/* Add/Edit Item Form */}
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
              {isEditing ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditing ? 'Edit Item' : 'Add New Item'}
            </h2>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Icon</label>
                <div className="flex gap-2">
                  <select 
                    value={itemForm.icon}
                    onChange={(e) => setItemForm({...itemForm, icon: e.target.value})}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-semibold"
                  >
                    {ICONS_LIST.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                  </select>
                  <div className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center bg-gray-50 rounded">
                    <IconComponent name={itemForm.icon} size={20} className="text-[#23471d]" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title (Label 1)</label>
                <input
                  type="text"
                  value={itemForm.label}
                  onChange={(e) => setItemForm({...itemForm, label: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-bold"
                  placeholder="e.g. HEALTHCARE"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sub-title (Label 2)</label>
                <input
                  type="text"
                  value={itemForm.label2}
                  onChange={(e) => setItemForm({...itemForm, label2: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                  placeholder="e.g. LEADERS"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Order</label>
                <input
                  type="number"
                  value={itemForm.order}
                  onChange={(e) => setItemForm({...itemForm, order: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isEditing ? <><Edit className="w-4 h-4" /> Update Item</> : <><Plus className="w-4 h-4" /> Add Item</>}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Items Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-lg">
            <div className="px-6 py-4 border-b bg-[#23471d] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <List className="w-5 h-5 text-[#d26019]" /> Supported Items List
              </h2>
              <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                {settings.items?.length || 0} ITEMS
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b">
                    <th className="px-6 py-4">No.</th>
                    <th className="px-6 py-4">Icon</th>
                    <th className="px-6 py-4">Label 1</th>
                    <th className="px-6 py-4">Label 2</th>
                    <th className="px-6 py-4 text-center">Order</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settings.items?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">
                        No items found. Add your first supported organization.
                      </td>
                    </tr>
                  ) : (
                    settings.items?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#23471d]">{index + 1}</td>
                        <td className="px-6 py-4 text-center">
                            <div className="w-10 h-10 mx-auto rounded bg-gray-50 border border-gray-200 flex items-center justify-center">
                                <IconComponent name={item.icon} size={18} className="text-[#23471d]" />
                            </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">{item.label}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-500">{item.label2}</td>
                        <td className="px-6 py-4 text-center font-bold text-gray-600">{item.order}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => startEdit(item)} 
                              className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteItem(item._id)} 
                              className="text-red-500 hover:text-red-700 p-1 transition-colors"
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
          </div>

          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500 flex items-start gap-3">
            <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700 mb-1">Management Tips:</p>
              <ul className="list-disc list-inside space-y-1 font-medium italic">
                <li>Choose icons that best represent the supporting body.</li>
                <li>Label 1 is the primary title, Label 2 is the secondary/smaller text.</li>
                <li>The Background Color applies to the entire horizontal strip on the website.</li>
                <li>Items are sorted by the 'Order' number provided.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportedBy;
