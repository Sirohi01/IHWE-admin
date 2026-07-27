import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Download, RefreshCw, Send, Users, Bell, Search, Music } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';

const AdminReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exhibitors, setExhibitors] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'Medium',
    targetAudience: 'confirmed_exhibitor',
    type: 'instant',
    scheduledFor: '',
    targetUsers: []
  });
  const [audioFile, setAudioFile] = useState(null);

  useEffect(() => {
    fetchReminders();
    fetchExhibitors();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/reminders/admin/list');
      if (res.data && res.data.success) {
        setReminders(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const fetchExhibitors = async () => {
    try {
      const res = await api.get('/api/exhibitor-registration');
      if (res.data && res.data.success) {
        setExhibitors(res.data.data);
      }
    } catch (err) {
      console.log('Failed to fetch exhibitors for dropdown');
    }
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder._id);
    setFormData({
      title: reminder.title || '',
      message: reminder.message || '',
      priority: reminder.priority || 'Medium',
      targetAudience: reminder.targetAudience || 'confirmed_exhibitor',
      type: reminder.type || 'instant',
      scheduledFor: reminder.scheduledFor ? new Date(reminder.scheduledFor).toISOString().slice(0, 16) : '',
      targetUsers: reminder.targetUsers || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResend = async (id) => {
    if (!window.confirm("Are you sure you want to resend this reminder?")) return;
    try {
      const res = await api.post(`/api/reminders/admin/resend/${id}`);
      if (res.data && res.data.success) {
        toast.success("Reminder resent successfully!");
        fetchReminders();
      }
    } catch (err) {
      toast.error("Failed to resend reminder");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      return toast.error("Title and message are required!");
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('message', formData.message);
      data.append('priority', formData.priority);
      data.append('targetAudience', formData.targetAudience);
      data.append('type', formData.type);
      if (formData.type === 'scheduled') {
        data.append('scheduledFor', formData.scheduledFor);
      }
      data.append('targetUsers', JSON.stringify(formData.targetUsers));
      if (audioFile) {
        data.append('audioFile', audioFile);
      }

      let res;
      if (editingId) {
        res = await api.put(`/api/reminders/admin/edit/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/api/reminders/admin/create', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data && res.data.success) {
        toast.success(`Reminder ${editingId ? 'updated' : 'created'} successfully!`);
        fetchReminders();
        setFormData({
          title: '', message: '', priority: 'Medium', targetAudience: 'confirmed_exhibitor', type: 'instant', scheduledFor: '', targetUsers: []
        });
        setAudioFile(null);
        setEditingId(null);
      }
    } catch (err) {
      toast.error('Failed to send reminder');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-[#1a3a7c]" />
            Reminders & Notifications
          </h1>
          <p className="text-gray-500 mt-1">Send and manage push notifications for mobile app users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CREATE FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#1a3a7c]" /> Create Reminder
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3a7c] outline-none transition-all" placeholder="e.g. Payment Overdue" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3a7c] outline-none transition-all" placeholder="Enter your message here..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3a7c] outline-none transition-all">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select name="targetAudience" value={formData.targetAudience} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3a7c] outline-none transition-all">
                    <option value="confirmed_exhibitor">Confirmed Exhibitors</option>
                    <option value="selected">Specific Exhibitors</option>
                  </select>
                </div>
              </div>

              {formData.targetAudience === 'selected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Exhibitors</label>
                  <Select
                    isMulti
                    options={exhibitors.map(e => ({ value: e._id, label: `${e.companyName || e.exhibitorName || 'Unknown Company'} (${e.contact1?.mobile || e.contact1?.email || 'N/A'})` }))}
                    value={exhibitors.map(e => ({ value: e._id, label: `${e.companyName || e.exhibitorName || 'Unknown Company'} (${e.contact1?.mobile || e.contact1?.email || 'N/A'})` })).filter(opt => formData.targetUsers?.includes(opt.value))}
                    className="basic-multi-select text-sm"
                    classNamePrefix="select"
                    placeholder="Search and select exhibitors..."
                    styles={{ menuList: (provided) => ({ ...provided, maxHeight: 160 }) }}
                    onChange={(selected) => setFormData({ ...formData, targetUsers: selected ? selected.map(s => s.value) : [] })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3a7c] outline-none transition-all">
                    <option value="instant">Instant Send</option>
                    <option value="scheduled">Schedule Later</option>
                  </select>
                </div>
                {formData.type === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                    <input type="datetime-local" name="scheduledFor" value={formData.scheduledFor} onChange={handleChange} required className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3a7c] outline-none transition-all text-sm" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Alert Audio (Optional)</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-3 text-center hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Music className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">
                        {audioFile ? audioFile.name : "Click to upload .mp3 or .wav"}
                      </span>
                    </div>
                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files[0])} />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Plays when app is open (Foreground). Max 2MB.</p>
              </div>

              <button type="submit" disabled={submitting} className="w-full mt-4 bg-[#1a3a7c] hover:bg-[#12285a] text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? 'Processing...' : (editingId ? 'Update Reminder' : (formData.type === 'instant' ? 'Send Now' : 'Schedule Reminder'))}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', message: '', priority: 'Medium', targetAudience: 'confirmed_exhibitor', type: 'instant', scheduledFor: '', targetUsers: [] }); }} className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center">
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* LISTING */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">History Log</h2>
              <button onClick={fetchReminders} className="p-2 text-gray-500 hover:text-[#1a3a7c] hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="p-10 flex justify-center"><RefreshCw className="w-8 h-8 text-gray-400 animate-spin" /></div>
            ) : reminders.length === 0 ? (
              <div className="p-10 text-center text-gray-400">No reminders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Target</th>
                      <th className="px-6 py-4">Delivery</th>
                      <th className="px-6 py-4">Reads</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {reminders.map((r, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${r.status === 'sent' ? 'bg-green-100 text-green-700' :
                            r.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{r.title}</div>
                          <div className="text-xs text-gray-500 max-w-[200px] truncate">{r.message}</div>
                        </td>
                        <td className="px-6 py-4 capitalize">{r.targetAudience.replace('_', ' ')}</td>
                        <td className="px-6 py-4 capitalize">
                          {r.type}
                          {r.type === 'scheduled' && <div className="text-[10px] text-gray-500">{new Date(r.scheduledFor).toLocaleString()}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 font-semibold text-[#1a3a7c]">
                            <Users className="w-4 h-4" /> {r.readBy?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(r.added).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                              {/* @ts-ignore */}
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => handleResend(r._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Resend">
                              {/* @ts-ignore */}
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminReminders;
