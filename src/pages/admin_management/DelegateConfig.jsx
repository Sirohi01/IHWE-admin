import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useEventContext } from '../../context/EventContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DelegateConfig = () => {
  // Days State
  const [days, setDays] = useState([]);
  const [daysTotal, setDaysTotal] = useState(0);
  const [daysPage, setDaysPage] = useState(1);
  const [daysSearch, setDaysSearch] = useState('');

  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsSearch, setSessionsSearch] = useState('');

  // Passes State
  const [passes, setPasses] = useState([]);
  const [passesTotal, setPassesTotal] = useState(0);
  const [passesPage, setPassesPage] = useState(1);
  const [passesSearch, setPassesSearch] = useState('');

  // We also need all days for the dropdown when adding/editing sessions
  const [allDaysForDropdown, setAllDaysForDropdown] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [showDayModal, setShowDayModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  // Edit states
  const [editDayId, setEditDayId] = useState(null);
  const [editSessionId, setEditSessionId] = useState(null);
  const [editPassId, setEditPassId] = useState(null);

  const [newDay, setNewDay] = useState({ date: '', day: '', title: '', displayOrder: 0 });
  const [newSession, setNewSession] = useState({ dayId: '', number: '', time: '', title: '', description: '', price: 500, displayOrder: 0 });
  const [newPass, setNewPass] = useState({ passKey: '', title: '', subtitle: '', price: 3000, perks: '' });

  const limit = 10;

  // Currently selected event (global, from Navbar) — scopes all fetches/creates below.
  const { currentEventId } = useEventContext();

  useEffect(() => {
    fetchAllDropdownDays();
  }, [currentEventId]);

  useEffect(() => {
    fetchDays();
  }, [daysPage, daysSearch, currentEventId]);

  useEffect(() => {
    fetchSessions();
  }, [sessionsPage, sessionsSearch, currentEventId]);

  useEffect(() => {
    fetchPasses();
  }, [passesPage, passesSearch, currentEventId]);

  const fetchAllDropdownDays = async () => {
    try {
      const res = await axios.get(`${API_URL}/delegate-config/admin${currentEventId ? `?eventId=${currentEventId}` : ''}`);
      setAllDaysForDropdown(res.data.data);
    } catch (error) { }
  };

  const fetchDays = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/delegate-config/admin/days/paginated?page=${daysPage}&limit=${limit}&search=${daysSearch}${currentEventId ? `&eventId=${currentEventId}` : ''}`);
      setDays(res.data.data);
      setDaysTotal(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch days');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/delegate-config/admin/sessions/paginated?page=${sessionsPage}&limit=${limit}&search=${sessionsSearch}${currentEventId ? `&eventId=${currentEventId}` : ''}`);
      setSessions(res.data.data);
      setSessionsTotal(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/delegate-config/admin/passes/paginated?page=${passesPage}&limit=${limit}&search=${passesSearch}${currentEventId ? `&eventId=${currentEventId}` : ''}`);
      setPasses(res.data.data);
      setPassesTotal(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch passes');
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = () => {
    fetchDays();
    fetchSessions();
    fetchPasses();
    fetchAllDropdownDays();
  };

  const getAdminName = () => {
    try {
      const adminData = localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo');
      if (adminData) {
        const parsed = JSON.parse(adminData);
        return parsed.fullName || parsed.name || 'Admin';
      }
    } catch (e) { }
    return 'Admin';
  };

  const handleAddDay = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const adminName = getAdminName();
      if (editDayId) {
        await axios.put(`${API_URL}/delegate-config/days/${editDayId}`, { ...newDay, updatedBy: adminName });
        Swal.fire('Updated!', 'Day updated successfully.', 'success');
      } else {
        await axios.post(`${API_URL}/delegate-config/days`, { ...newDay, addedBy: adminName, eventId: currentEventId });
        Swal.fire('Added!', 'Day added successfully.', 'success');
      }
      closeDayModal();
      refreshAll();
    } catch (error) {
      Swal.fire('Error', 'Failed to save day', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const adminName = getAdminName();
      if (editSessionId) {
        await axios.put(`${API_URL}/delegate-config/sessions/${editSessionId}`, { ...newSession, updatedBy: adminName });
        Swal.fire('Updated!', 'Session updated successfully.', 'success');
      } else {
        await axios.post(`${API_URL}/delegate-config/sessions`, { ...newSession, addedBy: adminName, eventId: currentEventId });
        Swal.fire('Added!', 'Session added successfully.', 'success');
      }
      closeSessionModal();
      refreshAll();
    } catch (error) {
      Swal.fire('Error', 'Failed to save session', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPass = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const adminName = getAdminName();
      const payload = {
        ...newPass,
        perks: typeof newPass.perks === 'string' ? newPass.perks.split(',').map(p => p.trim()).filter(Boolean) : newPass.perks,
        [editPassId ? 'updatedBy' : 'addedBy']: adminName,
        ...(editPassId ? {} : { eventId: currentEventId }),
      };
      if (editPassId) {
        await axios.put(`${API_URL}/delegate-config/passes/${editPassId}`, payload);
        Swal.fire('Updated!', 'Pass updated successfully.', 'success');
      } else {
        await axios.post(`${API_URL}/delegate-config/passes`, payload);
        Swal.fire('Added!', 'Pass added successfully.', 'success');
      }
      closePassModal();
      refreshAll();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save pass', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDay = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Delete this day and all its sessions?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL}/delegate-config/days/${id}`);
      Swal.fire('Deleted!', 'Day deleted successfully.', 'success');
      refreshAll();
    } catch (error) {
      Swal.fire('Error', 'Failed to delete day', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Delete this session?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL}/delegate-config/sessions/${id}`);
      Swal.fire('Deleted!', 'Session deleted successfully.', 'success');
      refreshAll();
    } catch (error) {
      Swal.fire('Error', 'Failed to delete session', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePass = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Delete this special pass?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL}/delegate-config/passes/${id}`);
      Swal.fire('Deleted!', 'Pass deleted successfully.', 'success');
      refreshAll();
    } catch (error) {
      Swal.fire('Error', 'Failed to delete pass', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Handlers
  const handleEditDay = (day) => {
    setEditDayId(day._id);
    setNewDay({ date: day.date, day: day.day, title: day.title, displayOrder: day.displayOrder || 0 });
    setShowDayModal(true);
  };

  const handleEditSession = (session) => {
    setEditSessionId(session._id);
    setNewSession({ dayId: session.dayId?._id || session.dayId, number: session.number, time: session.time, title: session.title, description: session.description, price: session.price, displayOrder: session.displayOrder || 0 });
    setShowSessionModal(true);
  };

  const handleEditPass = (pass) => {
    setEditPassId(pass._id);
    setNewPass({ passKey: pass.passKey, title: pass.title, subtitle: pass.subtitle, price: pass.price, perks: pass.perks.join(', ') });
    setShowPassModal(true);
  };

  // Close Modals
  const closeDayModal = () => {
    setShowDayModal(false);
    setEditDayId(null);
    setNewDay({ date: '', day: '', title: '', displayOrder: 0 });
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setEditSessionId(null);
    setNewSession({ dayId: '', number: '', time: '', title: '', description: '', price: 500, displayOrder: 0 });
  };

  const closePassModal = () => {
    setShowPassModal(false);
    setEditPassId(null);
    setNewPass({ passKey: '', title: '', subtitle: '', price: 3000, perks: '' });
  };

  const getModifyText = (item) => {
    if (item.updatedBy && item.updatedAt) {
      return (
        <div>
          <div className="text-[10px] text-blue-600 font-medium">{item.updatedBy}</div>
          <div className="text-[9px] text-slate-500">{new Date(item.updatedAt).toLocaleString()}</div>
        </div>
      );
    } else if (item.addedBy && item.createdAt) {
      return (
        <div>
          <div className="text-[10px] text-emerald-600 font-medium">{item.addedBy}</div>
          <div className="text-[9px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
        </div>
      );
    }
    return <span className="text-slate-400 text-xs">-</span>;
  };

  const renderPagination = (page, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-end items-center gap-2 mt-3">
        <button 
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-3 py-1 text-xs font-medium border border-slate-300 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
        <button 
          disabled={page === totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          className="px-3 py-1 text-xs font-medium border border-slate-300 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen relative">
      {/* Full Page Loader for Submissions */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/30 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-white font-medium">Processing...</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#15173D] mb-1">Delegate Sessions Configuration</h1>
          <p className="text-gray-500 text-sm">Configure days, sessions, and passes for delegates</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowDayModal(true)} className="px-4 py-2 bg-[#d26019] hover:bg-[#b04e14] text-white text-sm font-medium rounded shadow-sm">+ Add Day</button>
          <button onClick={() => setShowSessionModal(true)} className="px-4 py-2 bg-[#134698] hover:bg-[#0f3a7a] text-white text-sm font-medium rounded shadow-sm">+ Add Session</button>
          <button onClick={() => setShowPassModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded shadow-sm">+ Add Special Pass</button>
        </div>
      </div>

      <div className="flex flex-col gap-8 pb-10">

        {/* Days Table */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-sm font-bold text-[#15173D] uppercase tracking-wide">Configured Days List</h2>
            <input 
              type="text" 
              placeholder="Search days..." 
              value={daysSearch}
              onChange={(e) => { setDaysSearch(e.target.value); setDaysPage(1); }}
              className="border border-slate-300 rounded px-3 py-1 text-xs focus:outline-none focus:border-[#134698] w-64 shadow-sm"
            />
          </div>
          <div className="overflow-auto relative custom-scrollbar bg-white border border-slate-200 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap text-[12px]" style={{ fontFamily: 'Inter, sans-serif', color: '#15173D' }}>
              <thead className="sticky top-0 z-10">
                <tr className="text-white tracking-wider" style={{ backgroundColor: '#0A2947' }}>
                  <th className="px-4 py-3 font-medium">S.No</th>
                  <th className="px-4 py-3 font-medium">Date & Day</th>
                  <th className="px-4 py-3 font-medium">Theme / Title</th>
                  <th className="px-4 py-3 font-medium">Sessions Count</th>
                  <th className="px-4 py-3 font-medium">Modify at</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.length === 0 && <tr><td colSpan="6" className="px-4 py-4 text-center text-slate-500">No days configured.</td></tr>}
                {days.map((day, i) => (
                  <tr key={day._id} className="hover:bg-slate-50 transition-colors bg-white">
                    <td className="px-4 py-3 text-slate-500">{((daysPage - 1) * limit) + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-[#093C5D]">{day.date} ({day.day})</td>
                    <td className="px-4 py-3">{day.title}</td>
                    <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{day.sessions?.length || 0} Sessions</span></td>
                    <td className="px-4 py-3">{getModifyText(day)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEditDay(day)} className="text-blue-500 hover:text-blue-700 font-medium text-xs hover:underline mr-3">Edit</button>
                      <button onClick={() => handleDeleteDay(day._id)} className="text-red-500 hover:text-red-700 font-medium text-xs hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(daysPage, daysTotal, setDaysPage)}
        </div>

        {/* Sessions Table */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-sm font-bold text-[#15173D] uppercase tracking-wide">Sessions List</h2>
            <input 
              type="text" 
              placeholder="Search sessions..." 
              value={sessionsSearch}
              onChange={(e) => { setSessionsSearch(e.target.value); setSessionsPage(1); }}
              className="border border-slate-300 rounded px-3 py-1 text-xs focus:outline-none focus:border-[#134698] w-64 shadow-sm"
            />
          </div>
          <div className="overflow-auto relative custom-scrollbar bg-white border border-slate-200 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap text-[12px]" style={{ fontFamily: 'Inter, sans-serif', color: '#15173D' }}>
              <thead className="sticky top-0 z-10">
                <tr className="text-white tracking-wider" style={{ backgroundColor: '#0A2947' }}>
                  <th className="px-4 py-3 font-medium">Session No.</th>
                  <th className="px-4 py-3 font-medium">Day</th>
                  <th className="px-4 py-3 font-medium">Time & Title</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Modify at</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.length === 0 && <tr><td colSpan="6" className="px-4 py-4 text-center text-slate-500">No sessions configured.</td></tr>}
                {sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors bg-white">
                    <td className="px-4 py-3 text-[#093C5D] font-bold">Session {s.number}</td>
                    <td className="px-4 py-3">
                      {s.dayId ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] border border-blue-100">{s.dayId.date}</span> : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#15173D]">{s.title}</div>
                      <div className="text-[10px] text-slate-500">{s.time}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">₹{s.price}</td>
                    <td className="px-4 py-3">{getModifyText(s)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEditSession(s)} className="text-blue-500 hover:text-blue-700 font-medium text-xs hover:underline mr-3">Edit</button>
                      <button onClick={() => handleDeleteSession(s._id)} className="text-red-500 hover:text-red-700 font-medium text-xs hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(sessionsPage, sessionsTotal, setSessionsPage)}
        </div>

        {/* Special Passes Table */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-sm font-bold text-[#15173D] uppercase tracking-wide">Special Passes List</h2>
            <input 
              type="text" 
              placeholder="Search passes..." 
              value={passesSearch}
              onChange={(e) => { setPassesSearch(e.target.value); setPassesPage(1); }}
              className="border border-slate-300 rounded px-3 py-1 text-xs focus:outline-none focus:border-[#134698] w-64 shadow-sm"
            />
          </div>
          <div className="overflow-auto relative custom-scrollbar bg-white border border-slate-200 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap text-[12px]" style={{ fontFamily: 'Inter, sans-serif', color: '#15173D' }}>
              <thead className="sticky top-0 z-10">
                <tr className="text-white tracking-wider" style={{ backgroundColor: '#0A2947' }}>
                  <th className="px-4 py-3 font-medium">Key</th>
                  <th className="px-4 py-3 font-medium">Pass Title & Subtitle</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Perks</th>
                  <th className="px-4 py-3 font-medium">Modify at</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passes.length === 0 && <tr><td colSpan="6" className="px-4 py-4 text-center text-slate-500">No special passes configured.</td></tr>}
                {passes.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors bg-white">
                    <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] border border-slate-200 font-mono">{p.passKey}</span></td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#093C5D]">{p.title}</div>
                      <div className="text-[10px] text-slate-500">{p.subtitle}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">₹{p.price}</td>
                    <td className="px-4 py-3">
                      <ul className="list-disc list-inside text-[10px] text-slate-600">
                        {p.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                      </ul>
                    </td>
                    <td className="px-4 py-3">{getModifyText(p)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEditPass(p)} className="text-blue-500 hover:text-blue-700 font-medium text-xs hover:underline mr-3">Edit</button>
                      <button onClick={() => handleDeletePass(p._id)} className="text-red-500 hover:text-red-700 font-medium text-xs hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(passesPage, passesTotal, setPassesPage)}
        </div>

      </div>

      {/* Add Day Modal */}
      {showDayModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center" style={{ backgroundColor: '#0A2947' }}>
              <h2 className="text-lg font-medium text-white tracking-wide">{editDayId ? 'Edit Day' : 'Add New Day'}</h2>
              <button onClick={closeDayModal} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddDay} className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Date (e.g. 21 AUG 2026)</label>
                <input required type="text" value={newDay.date} onChange={e => setNewDay({ ...newDay, date: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Day Name (e.g. Fri)</label>
                <input required type="text" value={newDay.day} onChange={e => setNewDay({ ...newDay, day: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Theme / Title</label>
                <input required type="text" value={newDay.title} onChange={e => setNewDay({ ...newDay, title: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={closeDayModal} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white rounded text-sm font-medium shadow-sm hover:opacity-90" style={{ backgroundColor: '#0A2947' }}>{editDayId ? 'Update Day' : 'Save Day'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center" style={{ backgroundColor: '#0A2947' }}>
              <h2 className="text-lg font-medium text-white tracking-wide">{editSessionId ? 'Edit Session' : 'Add New Session'}</h2>
              <button onClick={closeSessionModal} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddSession} className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Select Day</label>
                <select required value={newSession.dayId} onChange={e => setNewSession({ ...newSession, dayId: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">-- Choose Day --</option>
                  {allDaysForDropdown.map(d => <option key={d._id} value={d._id}>{d.date} - {d.title}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-slate-700 mb-1">Session No.</label>
                  <input required type="text" value={newSession.number} onChange={e => setNewSession({ ...newSession, number: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-slate-700 mb-1">Price (₹)</label>
                  <input required type="number" value={newSession.price} onChange={e => setNewSession({ ...newSession, price: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Time (e.g. 10:00 AM – 11:30 AM)</label>
                <input required type="text" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Session Title</label>
                <input required type="text" value={newSession.title} onChange={e => setNewSession({ ...newSession, title: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Description</label>
                <textarea required value={newSession.description} onChange={e => setNewSession({ ...newSession, description: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" rows="2"></textarea>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={closeSessionModal} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white rounded text-sm font-medium shadow-sm hover:opacity-90" style={{ backgroundColor: '#0A2947' }}>{editSessionId ? 'Update Session' : 'Save Session'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Special Pass Modal */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border-t-4 border-t-purple-600">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-purple-50">
              <h2 className="text-lg font-medium text-purple-700 tracking-wide">{editPassId ? 'Edit Special Pass' : 'Add Special Pass'}</h2>
              <button onClick={closePassModal} className="text-purple-400 hover:text-purple-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddPass} className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Pass Key</label>
                <select required value={newPass.passKey} onChange={e => setNewPass({ ...newPass, passKey: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 bg-white">
                  <option value="">-- Choose Key --</option>
                  <option value="all_day">All Sessions (Day Specific)</option>
                  <option value="full_pass">Full Access Pass (All 3 Days)</option>
                  <option value="paper_pass">Paper Presentation Pass</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Pass Title</label>
                <input required type="text" value={newPass.title} onChange={e => setNewPass({ ...newPass, title: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Subtitle (e.g. DAY 1 + DAY 2)</label>
                <input type="text" value={newPass.subtitle} onChange={e => setNewPass({ ...newPass, subtitle: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Price (₹)</label>
                <input required type="number" value={newPass.price} onChange={e => setNewPass({ ...newPass, price: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Perks (Comma Separated)</label>
                <textarea required value={newPass.perks} onChange={e => setNewPass({ ...newPass, perks: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" rows="2" placeholder="Delegate Kit, Certificate, Lunch"></textarea>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={closePassModal} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium shadow-sm hover:opacity-90">{editPassId ? 'Update Pass' : 'Save Pass'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DelegateConfig;
