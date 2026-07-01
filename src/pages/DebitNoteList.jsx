import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Eye, FileMinus, Plus, RefreshCw, Search } from 'lucide-react';
import api from '../lib/api';
import { resolveLinkedIds } from '../utils/resolveLinkedIds';

const formatCurrency = (value) =>
    `₹ ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (date) => {
    if (!date) return '-';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DebitNoteList = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadDebitNotes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/debitnotes');
            const allNotes = Array.isArray(res.data) ? res.data : (res.data?.data || []);

            if (id === 'all') {
                setNotes(allNotes);
                return;
            }

            const linkedIds = await resolveLinkedIds(id);
            setNotes(allNotes.filter((note) => linkedIds.includes(String(note.companyId))));
        } catch (err) {
            console.error('Failed to load credit notes', err);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDebitNotes();
    }, [id]);

    const filteredNotes = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return notes;
        return notes.filter((note) => [
            note.debit_note_no,
            note.clientName,
            note.toInvoiceNo,
            note.toDocumentType,
            note.reason,
            note.status,
        ].some((value) => String(value || '').toLowerCase().includes(term)));
    }, [notes, search]);

    return (
        <div className="min-h-screen bg-gray-50 pl-4 pr-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-1 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">CREDIT NOTE</h1>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-700 font-medium">All Credit Notes List</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {id !== 'all' && (
                        <button
                            onClick={() => navigate(`/create-debit-note/${id}`)}
                            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md font-semibold transition"
                        >
                            <Plus className="w-4 h-4" />
                            Create Credit Note
                        </button>
                    )}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 overflow-x-auto">
                <div className="flex items-center justify-between mb-3 gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search credit notes..."
                            className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <button
                        onClick={loadDebitNotes}
                        className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <table className="min-w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {['S.No.', 'Credit Note Details', 'Client / Company', 'Against', 'Reason', 'Amount', 'Status', 'Action'].map((head) => (
                                <th key={head} className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 bg-gray-50">
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && (
                            <tr>
                                <td colSpan={8} className="py-10 text-center text-sm text-gray-500">
                                    Loading credit notes...
                                </td>
                            </tr>
                        )}
                        {!loading && filteredNotes.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-10 text-center text-sm text-gray-500">
                                    No credit notes found.
                                </td>
                            </tr>
                        )}
                        {!loading && filteredNotes.map((note, index) => (
                            <tr key={note._id || index} className="hover:bg-gray-50/70">
                                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-start gap-2">
                                        <div className="w-8 h-8 rounded bg-purple-50 text-purple-700 flex items-center justify-center">
                                            <FileMinus className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{note.debit_note_no || '-'}</div>
                                            <div className="text-xs text-gray-500">{formatDate(note.debit_note_date || note.added)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{note.clientName || '-'}</td>
                                <td className="px-4 py-3">
                                    <div className="text-sm text-gray-800">{note.toInvoiceNo || '-'}</div>
                                    <div className="text-xs text-gray-500">{note.toDocumentType || '-'}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{note.reason || '-'}</td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(note.totalAmount)}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-semibold capitalize">
                                        {note.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => navigate(`/debit-note-view/${note._id}`)}
                                        className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 text-sm font-semibold"
                                        title="View credit note"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DebitNoteList;
