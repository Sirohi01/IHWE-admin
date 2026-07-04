import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Eye, FileMinus, Plus, RefreshCw, Search, FileText, CheckCircle2, Clock, Users, DollarSign, Package } from 'lucide-react';
import api from '../lib/api';
import AccountNavigation from '../components/AccountNavigation';
import { resolveLinkedIds } from '../utils/resolveLinkedIds';

// Hook: animate number from 0 to target when element enters viewport
function useCountUp(target, duration = 1200) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (!started) return;
        const numTarget = parseFloat(target) || 0;
        if (numTarget === 0) { setCount(0); return; }
        const startTime = performance.now();
        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(ease * numTarget);
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [started, target, duration]);

    return { ref, count };
}

function AnimatedStatCard({ icon, gradientTo, iconBg, rawValue, displayValue, label, subLabel, subColor }) {
    const { ref, count } = useCountUp(rawValue);
    return (
        <div ref={ref} className={`group cursor-pointer relative bg-gradient-to-br from-white ${gradientTo} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center shrink-0`}>
                        {icon}
                    </div>
                    <div className="flex flex-col">
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '4px', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                            {displayValue(count)}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', lineHeight: 1.2, display: 'block', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                    </div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: subColor, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{subLabel}</div>
            </div>
        </div>
    );
}

const formatCurrency = (value) =>
    `₹ ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year}, ${time}`;
};

const DebitNoteList = () => {
    const navigate = useNavigate();
    const { id = 'all' } = useParams();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [accountName, setAccountName] = useState('');

    useEffect(() => {
        if (id === 'all') {
            setAccountName('');
            return;
        }
        let cancelled = false;
        api.get(`/api/account-overview/${id}`)
            .then(res => {
                if (!cancelled && res.data?.success) {
                    setAccountName(res.data.data?.companyInfo?.name || '');
                }
            })
            .catch(() => {
                if (!cancelled) setAccountName('');
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

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

    const totalNotes = filteredNotes.length;
    const totalValue = filteredNotes.reduce((sum, note) => sum + (parseFloat(note.totalAmount) || 0), 0);
    const avgValue = totalNotes > 0 ? totalValue / totalNotes : 0;
    const totalClients = new Set(filteredNotes.map(n => n.clientName).filter(Boolean)).size;

    const statCards = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 mt-2">
            <AnimatedStatCard
                icon={<FileMinus className="w-5 h-5 text-purple-600" strokeWidth={2.5} />}
                gradientTo="to-purple-50" iconBg="bg-purple-100"
                rawValue={totalNotes}
                displayValue={(c) => Math.round(c)}
                label="TOTAL CREDIT NOTES"
                subLabel="Issued" subColor="#7e22ce"
            />
            <AnimatedStatCard
                icon={<DollarSign className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />}
                gradientTo="to-indigo-50" iconBg="bg-indigo-100"
                rawValue={totalValue / 100000}
                displayValue={(c) => `₹ ${c.toFixed(1)}L`}
                label="TOTAL VALUE"
                subLabel="Amount" subColor="#4f46e5"
            />
            <AnimatedStatCard
                icon={<DollarSign className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />}
                gradientTo="to-emerald-50" iconBg="bg-emerald-100"
                rawValue={avgValue / 1000}
                displayValue={(c) => `₹ ${c.toFixed(1)}k`}
                label="AVG VALUE"
                subLabel="Per Note" subColor="#059669"
            />
            <AnimatedStatCard
                icon={<Users className="w-5 h-5 text-rose-600" strokeWidth={2.5} />}
                gradientTo="to-rose-50" iconBg="bg-rose-100"
                rawValue={totalClients}
                displayValue={(c) => Math.round(c)}
                label="TOTAL CLIENTS"
                subLabel="Credited" subColor="#e11d48"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Sub-Navigation for Account pages */}
            {id !== 'all' && <AccountNavigation id={id} accountName={accountName} pageName="Credit Notes" />}

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-3 px-1 mt-1">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">CREDIT NOTE</h1>
                    {id === 'all' && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Home</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-700 font-medium">All Credit Notes List</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {id !== 'all' && (
                        <button
                            onClick={() => navigate(`/create-debit-note/${id}`)}
                            className="flex items-center gap-1.5 rounded-md bg-[#194090] px-3 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-[#112f6b]"
                        >
                            <Plus size={16} />
                            Create Credit Note
                        </button>
                    )}
                    {/* <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold transition text-[13px]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button> */}
                </div>
            </div>

            {statCards}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 overflow-x-auto">
                <div className="flex items-center justify-between mb-3 gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search credit notes..."
                            className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#194090]"
                        />
                    </div>
                    <button
                        onClick={loadDebitNotes}
                        className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <table className="min-w-full text-left text-xs whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <thead className="bg-slate-50 uppercase tracking-wide text-slate-500 border-b border-slate-200">
                        <tr>
                            {['S.No.', 'Credit Note Details', 'Client / Company', 'Against', 'Reason', 'Amount', 'Status', 'Action'].map((head) => (
                                <th key={head} className="px-4 py-3 font-bold">
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
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
                            <tr key={note._id || index} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-[11px]" style={{ color: '#093C5D' }}>{index + 1}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-start gap-2">
                                        <div className="w-7 h-7 rounded bg-[#194090]/10 text-[#194090] flex items-center justify-center">
                                            <FileMinus className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#194090]">{note.debit_note_no || '-'}</div>
                                            <div className="text-[10px] text-slate-500">{formatDate(note.debit_note_date || note.added)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-[10px] font-bold text-slate-800">{note.clientName || '-'}</td>
                                <td className="px-4 py-3">
                                    <div className="text-[10px] font-bold text-slate-700">{note.toInvoiceNo || '-'}</div>
                                    <div className="text-[10px] text-slate-500">{note.toDocumentType || '-'}</div>
                                </td>
                                <td className="px-4 py-3 text-[10px] font-medium text-slate-600">{note.reason || '-'}</td>
                                <td className="px-4 py-3 text-[10px] font-bold text-emerald-600">{formatCurrency(note.totalAmount)}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider">
                                        {note.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => navigate(`/debit-note-view/${note._id}`)}
                                        className="rounded border border-slate-200 p-1.5 text-[#194090] hover:bg-slate-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                        title="View credit note"
                                    >
                                        <Eye size={13} />
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
