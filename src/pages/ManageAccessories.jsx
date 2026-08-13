import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Package,
  Gift,
  ShoppingCart,
  Image as ImageIcon,
  Ruler,
  RotateCw,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
  Layers
} from 'lucide-react';
import api, { SERVER_URL } from '../lib/api';
import Swal from 'sweetalert2';
import BaseLeadPage from '../layout/BaseLeadPage';

const EMPTY = {
  name: '', type: 'complimentary', itemType: 'Product', description: '',
  length: '', width: '', height: '', dimensionUnit: 'ft',
  price: '', gstPercent: 18, unit: '',
  hsnCode: '', sacCode: '',
  category: 'Furniture', includedQty: 1, availableQty: 0,
  isActive: true, sortOrder: 0,
  allocationMode: 'fixed', ratioQty: 1, ratioArea: 9, roundingMode: 'floor',
};

const iCls = "w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-[#0A2947]";
const lCls = "text-[11px] font-semibold text-black uppercase tracking-wider mb-1 block";

const PREVIEW_STALL_SIZES = [9, 12, 15, 18, 20, 24, 27, 28, 32, 36];
const ROUND_FN = { floor: Math.floor, round: Math.round, ceil: Math.ceil };
const computeEntitlementPreview = (form, stallArea) => {
  const ratioArea = Number(form.ratioArea);
  if (!stallArea || !ratioArea) return 0;
  const roundFn = ROUND_FN[form.roundingMode] || Math.floor;
  return roundFn(stallArea / ratioArea) * (Number(form.ratioQty) || 0);
};

export default function ManageAccessories() {
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([
    "Furniture",
    "Electrical",
    "Display & Branding",
    "Audio Visual",
    "Stall Fixtures",
    "Services",
    "Others"
  ]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const load = async () => {
    setLoading(true);
    try {
      const [accRes, unitRes, catRes] = await Promise.all([
        api.get('/api/stall-accessories/accessories'),
        api.get('/api/units'),
        api.get('/api/accessory-categories?activeOnly=true')
      ]);
      setItems(accRes.data.data || []);
      setUnits((unitRes.data.data || unitRes.data).filter(u => u.status === 'Active') || []);
      const catData = catRes.data?.data || catRes.data || [];
      if (Array.isArray(catData) && catData.length > 0) {
        const names = catData.sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => c.name).filter(Boolean);
        if (names.length > 0) setCategories(names);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || '';

  useEffect(() => {
    setFilterCategory(urlCategory);
  }, [urlCategory]);

  const inp = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openAdd = () => {
    const activeCat = filterCategory || urlCategory;
    const isServiceCat = activeCat === 'Services';
    setForm({
      ...EMPTY,
      category: activeCat || (categories.length > 0 ? categories[0] : 'Furniture'),
      type: isServiceCat ? 'purchasable' : 'complimentary',
      itemType: isServiceCat ? 'Service' : 'Product'
    });
    setEditId(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({ ...EMPTY, ...item });
    setEditId(item._id);
    setSelectedFile(null);
    setPreviewUrl(item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${SERVER_URL}${item.imageUrl}`) : '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return Swal.fire('Error', 'Name is required', 'error');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, v);
      });
      if (selectedFile) fd.append('image', selectedFile);

      if (editId) {
        await api.put(`/api/stall-accessories/accessories/${editId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/stall-accessories/accessories', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      Swal.fire({ icon: 'success', title: editId ? 'Updated' : 'Added', timer: 1200, showConfirmButton: false });
      setShowForm(false);
      load();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this accessory item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!r.isConfirmed) return;
    await api.delete(`/api/stall-accessories/accessories/${id}`);
    Swal.fire('Deleted!', 'Item has been removed.', 'success');
    load();
  };

  const handleReset = () => {
    setSearchTerm('');
    setTab('all');
    setFilterCategory('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  // Filter Logic
  const filtered = items.filter(i => {
    const matchesSearch = !searchTerm || (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (i.hsnCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = tab === 'all' || i.type === tab;
    const matchesCategory = !filterCategory || i.category === filterCategory;
    const matchesStatus = !filterStatus || (filterStatus === 'active' ? i.isActive : !i.isActive);
    return matchesSearch && matchesTab && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Stat Cards Data (Filtered by active category if selected)
  const scopedItems = filterCategory
    ? items.filter(i => (i.category || '').trim().toLowerCase() === filterCategory.trim().toLowerCase())
    : items;
  const totalCount = scopedItems.length;
  const complimentaryCount = scopedItems.filter(i => i.type === 'complimentary').length;
  const purchasableCount = scopedItems.filter(i => i.type === 'purchasable').length;
  const totalStock = scopedItems.reduce((acc, i) => acc + (Number(i.availableQty) || 0), 0);

  const statCardsData = [
    {
      title: "TOTAL ACCESSORIES",
      value: totalCount,
      desc: "All Registered Items",
      icon: Package,
      iconBg: "bg-blue-100",
      bg: "bg-gradient-to-br from-white from-50% to-blue-50",
      text: "text-blue-600"
    },
    {
      title: "COMPLIMENTARY",
      value: complimentaryCount,
      desc: "Free Entitlements",
      icon: Gift,
      iconBg: "bg-emerald-100",
      bg: "bg-gradient-to-br from-white from-50% to-emerald-50",
      text: "text-emerald-600"
    },
    {
      title: "PURCHASABLE",
      value: purchasableCount,
      desc: "Paid Add-ons",
      icon: ShoppingCart,
      iconBg: "bg-amber-100",
      bg: "bg-gradient-to-br from-white from-50% to-amber-50",
      text: "text-amber-600"
    },
    {
      title: "AVAILABLE STOCK",
      value: totalStock,
      desc: "Inventory Units",
      icon: CheckCircle2,
      iconBg: "bg-purple-100",
      bg: "bg-gradient-to-br from-white from-50% to-purple-50",
      text: "text-purple-600"
    }
  ];

  const statCards = (
    <>
      {statCardsData.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`group cursor-pointer relative ${item.bg} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${item.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${item.text}`} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <p className="text-xl font-extrabold text-slate-900 leading-none mb-1">
                    {item.value < 10 && item.value > 0 ? `0${item.value}` : item.value}
                  </p>
                  <p className="text-[9px] font-extrabold text-slate-700 leading-tight">
                    {item.title}
                  </p>
                </div>
              </div>
              <div className={`text-[10px] font-bold mt-2 ${item.text} text-center`}>
                {item.desc}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );

  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={load}
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
      </button>
      <button
        onClick={openAdd}
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold text-white transition-all duration-200 hover:opacity-90 shadow-sm whitespace-nowrap"
        style={{ backgroundColor: '#0A2947', fontFamily: 'Inter, sans-serif' }}
      >
        <Plus size={12} /> Add Item
      </button>
    </div>
  );

  const filterBar = (
    <>
      <div className="relative min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
        <input
          type="text"
          placeholder="Search accessories..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-7 pr-3 py-1.5 border rounded text-[10px] focus:outline-none bg-white border-slate-200 text-slate-700 placeholder-slate-400"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      <select
        value={tab}
        onChange={(e) => { setTab(e.target.value); setCurrentPage(1); }}
        className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-white border-slate-200 text-slate-700 min-w-[120px]"
      >
        <option value="all">All Types</option>
        <option value="complimentary">Complimentary</option>
        <option value="purchasable">Purchasable</option>
      </select>

      <select
        value={filterCategory}
        onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
        className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-white border-slate-200 text-slate-700 min-w-[130px]"
      >
        <option value="">All Categories</option>
        {categories.map((cat, idx) => (
          <option key={idx} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={filterStatus}
        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
        className="py-1.5 px-2 border rounded text-[10px] font-medium outline-none cursor-pointer bg-white border-slate-200 text-slate-700 min-w-[100px]"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Hidden</option>
      </select>
    </>
  );

  const isServiceCategory = filterCategory === 'Services';

  const tableHeadersComponent = (
    <>
      <th className="px-3 py-2 font-medium text-left">Item Details</th>
      <th className="px-3 py-2 font-medium text-center">Fulfillment</th>
      <th className="px-3 py-2 font-medium text-left">Category</th>
      <th className="px-3 py-2 font-medium text-left">{isServiceCategory ? 'Code (SAC)' : 'Code (HSN/SAC)'}</th>
      {!isServiceCategory && <th className="px-3 py-2 font-medium text-left">Dimensions</th>}
      <th className="px-3 py-2 font-medium text-left">Rate / GST</th>
      <th className="px-3 py-2 font-medium text-center">Unit</th>
      {!isServiceCategory && <th className="px-3 py-2 font-medium text-center">Stock</th>}
      <th className="px-3 py-2 font-medium text-center">Status</th>
      <th className="px-3 py-2 w-20 text-center">Actions</th>
    </>
  );

  const tableBodyContent = (
    <>
      {loading ? (
        <tr>
          <td colSpan={isServiceCategory ? 9 : 11} className="text-center py-10 text-slate-400 text-[11px]">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw size={14} className="animate-spin text-slate-500" />
              Loading stall accessories...
            </div>
          </td>
        </tr>
      ) : paginatedItems.length === 0 ? (
        <tr>
          <td colSpan={isServiceCategory ? 9 : 11} className="text-center py-12 text-slate-500">
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <Package size={22} />
              </div>
              <span className="font-semibold text-slate-700 text-sm">No Accessories Found</span>
              <span className="text-[11px] text-slate-400">
                {filterCategory ? `No accessories available in "${filterCategory}" category.` : 'No accessories found matching your search or filters.'}
              </span>
            </div>
          </td>
        </tr>
      ) : (
        paginatedItems.map((item, index) => (
          <tr key={item._id || index} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
            <td className="px-2 py-2 text-center">
              <input type="checkbox" className="w-3 h-3 accent-blue-500 cursor-pointer rounded-sm" />
            </td>

            {/* Item Details */}
            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md border border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.imageUrl
                    ? <img loading="lazy" decoding="async" src={item.imageUrl.startsWith('http') ? item.imageUrl : `${SERVER_URL}${item.imageUrl}`} alt="" className="w-full h-full object-cover" />
                    : <Package size={14} className="text-slate-400" />}
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-bold text-[11px] hover:text-emerald-600 transition-colors cursor-pointer" style={{ color: '#093C5D' }}>
                    {item.name}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {item.itemType || 'Product'}
                  </span>
                </div>
              </div>
            </td>

            {/* Fulfillment Type */}
            <td className="px-3 py-2 text-center whitespace-nowrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                item.type === 'complimentary'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {item.type === 'complimentary' ? 'Free' : 'Paid'}
              </span>
            </td>

            {/* Category */}
            <td className="px-3 py-2 whitespace-nowrap">
              <span className="text-[10px] font-bold" style={{ color: '#5E0006' }}>
                {item.category || 'General'}
              </span>
            </td>

            {/* Code */}
            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-[10px]" style={{ color: '#15173D' }}>
                  {item.itemType === 'Service' ? (item.sacCode || '—') : (item.hsnCode || '—')}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">
                  {item.itemType === 'Service' ? 'SAC' : 'HSN'}
                </span>
              </div>
            </td>

            {/* Dimensions */}
            {!isServiceCategory && (
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                  <Ruler size={10} className="text-slate-400" />
                  {[item.length, item.width, item.height].filter(Boolean).join('×') || '—'}
                  {item.dimensionUnit && item.length && <span className="text-[9px] text-slate-400 lowercase">{item.dimensionUnit}</span>}
                </div>
              </td>
            )}

            {/* Rate / GST */}
            <td className="px-3 py-2 whitespace-nowrap">
              {item.type === 'complimentary' ? (
                item.allocationMode === 'perArea' ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-700">Per Area</span>
                    <span className="text-[9px] text-slate-500 font-medium">{item.ratioQty} per {item.ratioArea} sqm</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700">Included ({item.includedQty})</span>
                )
              ) : (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#15173D]">₹{Number(item.price || 0).toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-slate-400 font-semibold">GST {item.gstPercent}%</span>
                </div>
              )}
            </td>

            {/* Unit */}
            <td className="px-3 py-2 text-center whitespace-nowrap">
              <span className="text-[10px] font-bold text-slate-700">{item.unit || 'piece'}</span>
            </td>

            {/* Stock */}
            {!isServiceCategory && (
              <td className="px-3 py-2 text-center whitespace-nowrap">
                <span className="text-[10px] font-bold text-slate-900">{item.availableQty || 0}</span>
              </td>
            )}

            {/* Status */}
            <td className="px-3 py-2 text-center whitespace-nowrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                item.isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {item.isActive ? 'Active' : 'Hidden'}
              </span>
            </td>

            {/* Actions */}
            <td className="px-3 py-2 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </>
  );

  const paginationComponent = (
    <div className="flex items-center justify-between w-full text-[10px] font-medium text-slate-600 px-2 py-1">
      <span>
        Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
        {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded text-[10px] font-bold hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                currentPage === idx + 1
                  ? "bg-[#0A2947] text-white"
                  : "border text-slate-600 hover:bg-slate-50"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded text-[10px] font-bold hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <BaseLeadPage
        title={urlCategory ? `Stall Accessories (${urlCategory})` : "Stall Accessories & Extras"}
        subtitle={urlCategory ? `Manage complimentary items and purchasable extras pre-filtered for ${urlCategory}` : "Manage complimentary items and purchasable extras for exhibitors"}
        badgeCount={filtered.length}
        cardsInRow={4}
        headerActions={headerActions}
        statCards={statCards}
        filterBar={filterBar}
        onReset={handleReset}
        tableHeaders={tableHeadersComponent}
        tableBody={tableBodyContent}
        pagination={paginationComponent}
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0A2947] sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Plus className="text-white" size={18} />
                </div>
                <h3 className="text-[13px] font-semibold text-white uppercase tracking-widest">{editId ? 'Modify Accessory' : 'Create New Accessory'}</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white transition-colors p-1"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-8 text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              {/* Section 1: Identity & Fulfillment */}
              <div className="space-y-4">
                <p className="text-[12px] font-semibold text-black uppercase tracking-wider border-l-4 border-[#0A2947] pl-3">Basic Information</p>
                <div className={`grid grid-cols-1 ${form.itemType === 'Service' ? 'md:grid-cols-1' : 'md:grid-cols-4'} gap-6`}>
                  {/* Image Selection */}
                  {form.itemType !== 'Service' && (
                    <div className="md:col-span-1">
                      <label className={lCls}>Item Image</label>
                      <div className="relative aspect-square w-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center group overflow-hidden rounded-xl hover:border-[#0A2947]/30 transition-colors">
                        {previewUrl ? (
                          <>
                            <img loading="lazy" decoding="async" src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <button type="button" onClick={() => document.getElementById('accImg').click()} className="p-2 bg-white rounded-full text-[#0A2947] shadow-lg">
                                <ImageIcon size={18} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <button type="button" onClick={() => document.getElementById('accImg').click()} className="flex flex-col items-center gap-2 text-slate-400 hover:text-[#0A2947] transition-colors">
                            <ImageIcon size={28} strokeWidth={1.5} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Upload</span>
                          </button>
                        )}
                        <input type="file" id="accImg" hidden accept="image/*" onChange={handleFileChange} />
                      </div>
                    </div>
                  )}

                  {/* Main Details */}
                  <div className={`${form.itemType === 'Service' ? 'w-full' : 'md:col-span-3'} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                    <div className="md:col-span-2">
                      <label className={lCls}>Item Name *</label>
                      <input value={form.name} onChange={e => inp('name', e.target.value)} className={iCls} placeholder="e.g. Premium Leather Sofa" />
                    </div>
                    <div>
                      <label className={lCls}>Fulfillment Type</label>
                      <select value={form.type} onChange={e => inp('type', e.target.value)} className={iCls}>
                        <option value="complimentary">Complimentary (Included)</option>
                        <option value="purchasable">Purchasable (Paid Add-on)</option>
                      </select>
                    </div>
                    <div>
                      <label className={lCls}>Item Category</label>
                      <select
                        value={form.category}
                        onChange={e => {
                          const cat = e.target.value;
                          setForm(p => ({
                            ...p,
                            category: cat,
                            type: cat === 'Services' ? 'purchasable' : p.type,
                            itemType: cat === 'Services' ? 'Service' : p.itemType
                          }));
                        }}
                        className={iCls}
                      >
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={lCls}>Billing Type</label>
                      <select value={form.itemType} onChange={e => inp('itemType', e.target.value)} className={iCls}>
                        <option value="Service">Service</option>
                        <option value="Product">Product</option>
                      </select>
                    </div>
                    <div>
                      <label className={lCls}>{form.itemType === 'Service' ? 'SAC Code' : 'HSN Code'}</label>
                      {form.itemType === 'Service'
                        ? <input value={form.sacCode} onChange={e => inp('sacCode', e.target.value)} className={iCls} placeholder="SAC Code" />
                        : <input value={form.hsnCode} onChange={e => inp('hsnCode', e.target.value)} className={iCls} placeholder="HSN Code" />
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Logistics & Pricing */}
              <div className="space-y-6">
                <div className={`grid grid-cols-1 ${form.itemType === 'Service' ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-10`}>
                  {form.itemType !== 'Service' && (
                    <div className="space-y-4">
                      <p className="text-[12px] font-semibold text-black uppercase tracking-wider border-l-4 border-[#0A2947] pl-3">Logistics & Dimensions</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className={lCls}>Dimension Unit</label>
                          <select value={form.dimensionUnit} onChange={e => inp('dimensionUnit', e.target.value)} className={iCls}>
                            <option value="">No Dimensions</option>
                            {units.map(u => <option key={u._id} value={u.unit}>{u.unit}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lCls}>Length {form.dimensionUnit && `(${form.dimensionUnit})`}</label>
                          <input value={form.length} onChange={e => inp('length', e.target.value)} className={iCls} disabled={!form.dimensionUnit} />
                        </div>
                        <div>
                          <label className={lCls}>Width {form.dimensionUnit && `(${form.dimensionUnit})`}</label>
                          <input value={form.width} onChange={e => inp('width', e.target.value)} className={iCls} disabled={!form.dimensionUnit} />
                        </div>
                        <div className="col-span-2">
                          <label className={lCls}>Height {form.dimensionUnit && `(${form.dimensionUnit})`}</label>
                          <input value={form.height} onChange={e => inp('height', e.target.value)} className={iCls} disabled={!form.dimensionUnit} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-[12px] font-semibold text-black uppercase tracking-wider border-l-4 border-[#0A2947] pl-3">Pricing & Inventory</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={form.type === 'complimentary' ? '' : 'col-span-2'}>
                        <label className={lCls}>Quantity Unit *</label>
                        <select value={form.unit} onChange={e => inp('unit', e.target.value)} className={iCls}>
                          <option value="">Select Unit</option>
                          {units.map(u => <option key={u._id} value={u.unit}>{u.unit}</option>)}
                        </select>
                      </div>
                      {form.type === 'complimentary' ? (
                        <div>
                          <label className={lCls}>Allocation Mode</label>
                          <select value={form.allocationMode} onChange={e => inp('allocationMode', e.target.value)} className={iCls}>
                            <option value="fixed">Fixed Qty (same for every exhibitor)</option>
                            <option value="perArea">Per Stall Area (auto-scales by stall size)</option>
                          </select>
                        </div>
                      ) : (
                        form.itemType !== 'Service' && (
                          <div>
                            <label className={lCls}>Min Order Qty</label>
                            <input type="number" value={form.includedQty} onChange={e => inp('includedQty', e.target.value)} className={iCls} min={1} />
                          </div>
                        )
                      )}
                      {form.type === 'purchasable' && (
                        <>
                          <div>
                            <label className={lCls}>Base Rate (₹)</label>
                            <input type="number" value={form.price} onChange={e => inp('price', e.target.value)} className={`${iCls} font-bold text-emerald-700`} placeholder="0" />
                          </div>
                          <div>
                            <label className={lCls}>GST Slab %</label>
                            <select value={form.gstPercent} onChange={e => inp('gstPercent', Number(e.target.value))} className={iCls}>
                              {[0, 5, 12, 18, 28].map(v => <option key={v} value={v}>{v}%</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      {form.type === 'complimentary' && form.allocationMode === 'fixed' && form.itemType !== 'Service' && (
                        <div className="col-span-2">
                          <label className={lCls}>Included Qty</label>
                          <input type="number" value={form.includedQty} onChange={e => inp('includedQty', e.target.value)} className={iCls} min={1} />
                        </div>
                      )}

                      {form.type === 'complimentary' && form.allocationMode === 'perArea' && (
                        <>
                          <div>
                            <label className={lCls}>Give Qty</label>
                            <input type="number" value={form.ratioQty} onChange={e => inp('ratioQty', e.target.value)} className={iCls} min={0} step="0.5" />
                          </div>
                          <div>
                            <label className={lCls}>Per Stall Area (sqm)</label>
                            <input type="number" value={form.ratioArea} onChange={e => inp('ratioArea', e.target.value)} className={iCls} min={0.1} step="0.5" />
                          </div>
                          <div>
                            <label className={lCls}>Rounding Rule</label>
                            <select value={form.roundingMode} onChange={e => inp('roundingMode', e.target.value)} className={iCls}>
                              <option value="floor">Floor (round down)</option>
                              <option value="round">Nearest (round off)</option>
                              <option value="ceil">Ceil (round up)</option>
                            </select>
                          </div>
                        </>
                      )}

                      {form.itemType !== 'Service' && (
                        <div className={form.type === 'complimentary' && form.allocationMode === 'perArea' ? '' : 'col-span-2'}>
                          <label className={lCls}>Available Stock</label>
                          <input type="number" value={form.availableQty} onChange={e => inp('availableQty', e.target.value)} className={iCls} placeholder="0" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {form.type === 'complimentary' && form.allocationMode === 'perArea' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest mb-3">Live Preview — Qty exhibitor gets by stall size</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {PREVIEW_STALL_SIZES.map(size => (
                        <div key={size} className="flex items-center justify-between bg-white border border-emerald-200/60 rounded-lg px-3 py-2 shadow-2xs">
                          <span className="text-[11px] font-semibold text-slate-600">{size} sqm →</span>
                          <span className="text-xs font-bold text-emerald-700">{computeEntitlementPreview(form, size)} {form.unit || 'unit'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Extra Info */}
              <div className="space-y-4">
                <p className="text-[12px] font-semibold text-black uppercase tracking-wider border-l-4 border-[#0A2947] pl-3">Additional Settings</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className={lCls}>Short Description</label>
                    <textarea value={form.description} onChange={e => inp('description', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-[#0A2947] resize-none h-20"
                      placeholder="Specify materials, colors, or service scope..." />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={lCls}>Sort Order</label>
                      <input type="number" value={form.sortOrder} onChange={e => inp('sortOrder', e.target.value)} className={iCls} placeholder="0" />
                    </div>
                    <div>
                      <label className={lCls}>Status</label>
                      <select value={form.isActive ? 'true' : 'false'} onChange={e => inp('isActive', e.target.value === 'true')} className={iCls}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 text-[11px] font-semibold uppercase tracking-wider rounded-lg hover:bg-red-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-2 bg-emerald-600 text-white text-[11px] font-semibold uppercase tracking-wider rounded-lg disabled:opacity-60 shadow-md hover:bg-emerald-700 transition-all"
                >
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
