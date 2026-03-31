import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import { Plus, Trash2, Edit, FileText, Info } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Table from '../components/table/Table';

const NativeEditor = ({ value, onChange }) => {
    const handleCommand = (e, cmd, arg = null) => {
        e.preventDefault();
        document.execCommand(cmd, false, arg);
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
            <div className="flex bg-slate-100 p-1.5 gap-1.5 border-b border-slate-200">
                <button type="button" onMouseDown={(e) => handleCommand(e, 'bold')} className="p-1 px-3 font-bold bg-white border border-slate-300 rounded hover:bg-slate-50">B</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'italic')} className="p-1 px-3 italic bg-white border border-slate-300 rounded hover:bg-slate-50">I</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'underline')} className="p-1 px-3 underline bg-white border border-slate-300 rounded hover:bg-slate-50">U</button>
                <span className="w-px h-6 bg-slate-300 mx-1 self-center"></span>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'insertUnorderedList')} className="p-1 px-3 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-50">• List</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'insertOrderedList')} className="p-1 px-3 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-50">1. List</button>
                <span className="w-px h-6 bg-slate-300 mx-1 self-center"></span>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'formatBlock', 'H2')} className="p-1 px-3 font-bold text-xs bg-white border border-slate-300 rounded hover:bg-slate-50">Heading</button>
                <button type="button" onMouseDown={(e) => handleCommand(e, 'formatBlock', 'P')} className="p-1 px-3 text-xs bg-white border border-slate-300 rounded hover:bg-slate-50">Paragraph</button>
            </div>
            <div 
                className="p-4 outline-none min-h-[200px] text-sm text-slate-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-3 [&_p]:my-2" 
                contentEditable 
                dangerouslySetInnerHTML={{__html: value}}
                onBlur={(e) => onChange(e.currentTarget.innerHTML)} 
            />
        </div>
    );
};

const EMPTY_TC = {
    eventId: '',
    pageName: '',
    title: '',
    content: ''
};

const ManageTerms = () => {
    const [terms, setTerms] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tcForm, setTcForm] = useState({ ...EMPTY_TC });
    const [isEditing, setIsEditing] = useState(null);

    useEffect(() => {
        fetchTerms();
        fetchEvents();
    }, []);

    const fetchTerms = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/terms-and-conditions');
            if (response.data.success) {
                setTerms(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching terms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await api.get('/api/events');
            if (response.data.success) {
                setEvents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tcForm.eventId || !tcForm.pageName || !tcForm.title || !tcForm.content) {
            Swal.fire('Warning', 'Please fill all required fields', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (isEditing) {
                response = await api.put(`/api/terms-and-conditions/${isEditing}`, tcForm);
            } else {
                response = await api.post('/api/terms-and-conditions', tcForm);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'T&C Updated!' : 'T&C Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                setTcForm({ ...EMPTY_TC });
                setIsEditing(null);
                fetchTerms();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to save T&C', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Terms?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await api.delete(`/api/terms-and-conditions/${id}`);
            if (response.data.success) {
                Swal.fire('Deleted!', 'Terms has been deleted.', 'success');
                fetchTerms();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to delete terms', 'error');
        }
    };

    const columns = [
        {
            key: "event",
            label: "EVENT",
            render: (row) => <div className="font-bold text-slate-800">{row.eventId?.name || 'N/A'}</div>
        },
        {
            key: "pageName",
            label: "PAGE TYPE",
            render: (row) => <div className="font-bold text-[#d26019] text-xs uppercase">{row.pageName || 'GLOBAL'}</div>
        },
        {
            key: "content",
            label: "CONTENT PREVIEW",
            render: (row) => <div className="text-xs text-slate-500 line-clamp-2 max-w-md" dangerouslySetInnerHTML={{ __html: (row.content?.length > 150 ? row.content.substring(0, 150) + '...' : row.content).replace(/<[^>]+>/g, ' ') }}></div>
        },
        {
            key: "actions",
            label: "ACTIONS",
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(row._id); setTcForm({
                        eventId: row.eventId?._id || '',
                        pageName: row.pageName,
                        title: row.title,
                        content: row.content
                    }); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(row._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-inter">
            <PageHeader title="TERMS & CONDITIONS MASTER" description="Set event-specific terms for registration" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className={`px-6 py-4 flex items-center gap-3 border-b text-white ${isEditing ? 'bg-amber-500' : 'bg-[#23471d]'}`}>
                            {isEditing ? <Edit size={20} /> : <FileText size={20} />}
                            <h2 className="text-lg font-bold">{isEditing ? 'Edit Terms' : 'Add New Terms'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Exhibition Event *</label>
                                <select required value={tcForm.eventId} onChange={(e) => setTcForm({...tcForm, eventId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                                    <option value="">Select Event</option>
                                    {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Page Type *</label>
                                <select required value={tcForm.pageName} onChange={(e) => setTcForm({...tcForm, pageName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                                    <option value="">Select Type</option>
                                    <option value="exhibitor-registration">Exhibitor Terms and Conditions</option>
                                    <option value="visitor-registration">Visitor Terms and Conditions</option>
                                    <option value="terms-of-service">General Terms of Service</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Terms Title *</label>
                                <input required type="text" value={tcForm.title} onChange={(e) => setTcForm({...tcForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" placeholder="e.g. Terms for Exhibitors" />
                            </div>
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Terms & Conditions Content *</label>
                                <NativeEditor value={tcForm.content} onChange={(val) => setTcForm({...tcForm, content: val})} />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#23471d] text-white rounded-xl font-bold hover:bg-[#1a3516] transition-all shadow-lg">
                                {isLoading ? 'Saving...' : (isEditing ? 'Update Terms' : 'Save Terms')}
                            </button>
                            {isEditing && <button type="button" onClick={() => { setIsEditing(null); setTcForm({...EMPTY_TC}); }} className="w-full py-2 text-slate-500 font-bold">Cancel</button>}
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <Table columns={columns} data={terms} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageTerms;
