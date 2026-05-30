import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, MoveUp, MoveDown, Image as ImageIcon, Type, Calendar, Palette, Link as LinkIcon, List } from 'lucide-react';
import api, { SERVER_URL } from '../lib/api';
import Swal from 'sweetalert2';

const ICON_OPTIONS = ['Lightbulb', 'Sprout', 'ShieldPlus'];

const EMPTY_TRACK = {
    day: '',
    date: '',
    title: '',
    sessions: [],
    iconName: 'Lightbulb',
    accentColor: '#4E9F3D',
    badgeColor: 'bg-[#1A4D2E]',
    shadowColor: '',
    link: '',
    isActive: true
};

export default function ConferenceTrackManage() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_TRACK);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [sessionInput, setSessionInput] = useState('');

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/conference-tracks');
            if (res.data.success) {
                setTracks(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching tracks:', error);
            Swal.fire('Error', 'Failed to fetch tracks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const addSession = () => {
        if (sessionInput.trim()) {
            setFormData(prev => ({
                ...prev,
                sessions: [...prev.sessions, sessionInput.trim()]
            }));
            setSessionInput('');
        }
    };

    const removeSession = (index) => {
        setFormData(prev => ({
            ...prev,
            sessions: prev.sessions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'sessions') {
                data.append(key, JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            let res;
            if (editingId) {
                res = await api.put(`/api/conference-tracks/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await api.post('/api/conference-tracks', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (res.data.success) {
                Swal.fire('Success', `Track ${editingId ? 'updated' : 'created'} successfully`, 'success');
                resetForm();
                fetchTracks();
            }
        } catch (error) {
            console.error('Error saving track:', error);
            Swal.fire('Error', 'Failed to save track', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (track) => {
        setEditingId(track._id);
        setFormData({
            day: track.day,
            date: track.date,
            title: track.title,
            sessions: track.sessions || [],
            iconName: track.iconName,
            accentColor: track.accentColor,
            badgeColor: track.badgeColor,
            shadowColor: track.shadowColor || '',
            link: track.link || '',
            isActive: track.isActive
        });
        setImagePreview(track.image ? `${SERVER_URL}${track.image}` : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await api.delete(`/api/conference-tracks/${id}`);
                if (res.data.success) {
                    Swal.fire('Deleted!', 'Track has been deleted.', 'success');
                    fetchTracks();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete track', 'error');
            }
        }
    };

    const handleMove = async (index, direction) => {
        const newTracks = [...tracks];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= tracks.length) return;

        [newTracks[index], newTracks[newIndex]] = [newTracks[newIndex], newTracks[index]];

        const orders = newTracks.map((t, i) => ({ id: t._id, order: i + 1 }));

        try {
            await api.post('/api/conference-tracks/order', { orders });
            fetchTracks();
        } catch (error) {
            Swal.fire('Error', 'Failed to update order', 'error');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData(EMPTY_TRACK);
        setImageFile(null);
        setImagePreview(null);
        setSessionInput('');
    };

    return (
        <div className="p-6 py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#0F2854]">Conference Tracks Management</h1>
                {editingId && (
                    <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        <X size={18} /> Cancel Edit
                    </button>
                )}
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-[#23471d]">
                <h2 className="text-lg font-bold mb-4 text-[#d26019] flex items-center gap-2">
                    {editingId ? <Edit size={20} /> : <Plus size={20} />}
                    {editingId ? 'Edit Track' : 'Add New Track'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Day (e.g. DAY 1)</label>
                            <input
                                type="text"
                                value={formData.day}
                                onChange={e => setFormData({ ...formData, day: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Date (e.g. 21 AUGUST 2026)</label>
                            <input
                                type="text"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Link (URL Path)</label>
                            <input
                                type="text"
                                value={formData.link}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                placeholder="/conference/day-1"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Icon</label>
                                <select
                                    value={formData.iconName}
                                    onChange={e => setFormData({ ...formData, iconName: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Accent Color</label>
                                <input
                                    type="color"
                                    value={formData.accentColor}
                                    onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                                    className="w-full h-10 p-1 border rounded-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Badge Color (Tailwind Class)</label>
                            <input
                                type="text"
                                value={formData.badgeColor}
                                onChange={e => setFormData({ ...formData, badgeColor: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                placeholder="bg-[#1A4D2E]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Track Image</label>
                            <input type="file" onChange={handleImageChange} className="w-full text-sm" accept="image/*" />
                            {imagePreview && (
                                <div className="mt-2 relative inline-block">
                                    <img src={imagePreview} className="h-20 w-32 object-cover rounded-lg border" alt="Preview" />
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Conference Sessions</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={sessionInput}
                                onChange={e => setSessionInput(e.target.value)}
                                className="flex-1 p-2 border rounded-lg"
                                placeholder="Add a session focus area..."
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSession())}
                            />
                            <button type="button" onClick={addSession} className="px-4 py-2 bg-[#23471d] text-white rounded-lg hover:bg-[#1a3616]">
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.sessions.map((session, idx) => (
                                <span key={idx} className="bg-[#EFF6FF] text-[#23471d] px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 border border-[#DBEAFE]">
                                    {session}
                                    <button type="button" onClick={() => removeSession(idx)} className="text-red-500 hover:text-red-700">
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#23471d] text-white font-bold rounded-lg hover:bg-[#1a3616] flex items-center justify-center gap-2 transition-all"
                        >
                            <Save size={20} />
                            {loading ? 'Saving...' : editingId ? 'Update Conference Track' : 'Create Conference Track'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-sm font-bold uppercase text-gray-600">Order</th>
                            <th className="p-4 text-sm font-bold uppercase text-gray-600">Track Info</th>
                            <th className="p-4 text-sm font-bold uppercase text-gray-600">Sessions</th>
                            <th className="p-4 text-sm font-bold uppercase text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {tracks.map((track, index) => (
                            <tr key={track._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><MoveUp size={16} /></button>
                                        <span className="text-center font-bold text-gray-500">{index + 1}</span>
                                        <button onClick={() => handleMove(index, 'down')} disabled={index === tracks.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><MoveDown size={16} /></button>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0 border">
                                            {track.image && <img src={`${SERVER_URL}${track.image}`} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#d26019]">{track.day} - {track.date}</p>
                                            <p className="font-bold text-[#0B2C66] line-clamp-1">{track.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: track.accentColor }} />
                                                <span className="text-[10px] text-gray-500 uppercase font-bold">{track.iconName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 max-w-xs">
                                    <div className="flex flex-wrap gap-1">
                                        {track.sessions?.map((s, i) => (
                                            <span key={i} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{s}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(track)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(track._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tracks.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">No conference tracks found. Please add some.</div>
                )}
            </div>
        </div>
    );
}
