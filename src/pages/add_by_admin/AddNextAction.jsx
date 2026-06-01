import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Plus, Save, Search, Trash2, Filter, Info } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNextActions, createNextAction, updateNextAction, deleteNextAction } from '../../features/add_by_admin/nextAction/nextActionSlice';
import Swal from 'sweetalert2';
import PageHeader from '../../components/PageHeader';

const AddNextAction = () => {
  const dispatch = useDispatch();
  const { nextActions, loading: isLoading } = useSelector((state) => state.nextActions);

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: 'active' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { dispatch(fetchNextActions()); }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    let list = Array.isArray(nextActions) ? nextActions.filter(Boolean) : [];
    if (debouncedSearch.trim()) list = list.filter((n) => (n?.name || '').toLowerCase().includes(debouncedSearch.trim().toLowerCase()));
    if (statusFilter !== 'All') list = list.filter((n) => (n?.status || '').toLowerCase() === statusFilter.toLowerCase());
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [nextActions, debouncedSearch, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);

  const resetForm = () => { setIsEditing(null); setFormData({ name: '', status: 'active' }); setIsModalOpen(false); };

  const startEdit = (id) => {
    const item = nextActions.find((n) => n._id === id);
    if (item) { setIsEditing(id); setFormData({ name: item.name, status: item.status || 'active' }); setIsModalOpen(true); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return Swal.fire({ icon: 'warning', title: 'Missing Field', text: 'Please enter a name', confirmButtonColor: '#23471d' });

    const duplicate = nextActions.find((n) => (n?.name || '').trim().toLowerCase() === formData.name.trim().toLowerCase() && n._id !== isEditing);
    if (duplicate) return Swal.fire({ title: 'Duplicate', text: 'This Next Action already exists!', icon: 'warning', confirmButtonColor: '#23471d' });

    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || '{}');
    const userName = adminInfo.fullName || adminInfo.name || adminInfo.username || 'Admin';
    const payload = { name: formData.name.trim(), status: formData.status, updated_by: userName };

    try {
      setIsSaving(true);
      if (isEditing) {
        await dispatch(updateNextAction({ id: isEditing, data: payload })).unwrap();
      } else {
        await dispatch(createNextAction(payload)).unwrap();
      }
      Swal.fire({ icon: 'success', title: 'Success', text: isEditing ? 'Updated successfully' : 'Added successfully', timer: 1500, showConfirmButton: false });
      resetForm();
      dispatch(fetchNextActions());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Operation failed', confirmButtonColor: '#23471d' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const item = nextActions.find((n) => n._id === id);
    const result = await Swal.fire({ title: 'Are you sure?', text: `Delete "${item?.name}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try {
        await dispatch(deleteNextAction(id)).unwrap();
        Swal.fire('Deleted!', 'Next Action has been deleted.', 'success');
        dispatch(fetchNextActions());
      } catch (err) {
        Swal.fire('Error', err?.message || 'Failed to delete', 'error');
      }
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen animate-fadeIn">
      <PageHeader
        title="NEXT ACTION CONFIGURATION"
        description="Manage Next Action options for Lead Status Updates"
      />

      <div className="mt-6">
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                {isEditing ? <Edit className="w-5 h-5 text-[#d26019]" /> : <Plus className="w-5 h-5 text-[#d26019]" />}
                {isEditing ? 'Edit Next Action' : 'Add New Next Action'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Follow Up Call, Send Proposal"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <div className="flex gap-2 mt-0.5">
                    {['active', 'inactive'].map((s) => (
                      <label key={s} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] cursor-pointer transition-colors ${formData.status === s ? 'bg-[#eef5ec] border-[#1e4018] text-[#1e4018]' : 'border-gray-200 text-gray-500'}`}>
                        <input type="radio" name="status" value={s} checked={formData.status === s} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className="accent-[#1e4018]" />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={isSaving} className="flex-1 py-1 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /><span>{isEditing ? 'Update' : 'Save'}</span></>}
                  </button>
                  <button type="button" onClick={resetForm} className="px-4 py-1 bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors">Cancel</button>
                </div>
              </form>
              <div className="mt-4 p-4 bg-green-50 border border-green-100 flex gap-3">
                <Info className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-[10px] text-green-700 font-bold uppercase leading-relaxed">These options will appear in the Next Action dropdown on Lead Status Updates.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none" />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#23471d] outline-none appearance-none bg-white cursor-pointer">
                <option value="All">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#23471d] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1a3516] transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Next Action
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b">No.</th>
                <th className="p-4 font-bold border-b">Name</th>
                <th className="p-4 font-bold border-b text-center">Status</th>
                <th className="p-4 font-bold border-b text-center">Created At</th>
                <th className="p-4 font-bold border-b text-center">Updated By</th>
                <th className="p-4 font-bold border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500"><div className="flex flex-col items-center gap-2"><div className="w-8 h-8 border-4 border-[#23471d]/20 border-t-[#23471d] rounded-full animate-spin" /><span className="text-sm font-medium">Loading...</span></div></td></tr>
              ) : paginated.length > 0 ? (
                paginated.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="p-4"><div className="font-bold text-[#23471d]">{item.name}</div></td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span>
                    </td>
                    <td className="p-4 text-sm text-center text-gray-500 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-sm text-center text-gray-500">{item.updated_by || <span className="text-gray-400 text-xs italic">N/A</span>}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => startEdit(item._id)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500"><div className="flex flex-col items-center gap-2"><Info className="w-8 h-8 text-gray-400" /><p className="text-sm">No records found</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${currentPage === i + 1 ? 'bg-[#23471d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddNextAction;
