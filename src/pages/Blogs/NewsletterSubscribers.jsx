import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Mail, Download, Search } from 'lucide-react';
import { SERVER_URL } from "../../lib/api";
import { toast } from 'react-toastify';
import PageHeader from "../../components/PageHeader";

const NewsletterSubscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const res = await axios.get(`${SERVER_URL}/api/blogs/admin/subscribers`);
            if (res.data.success) setSubscribers(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch subscribers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this subscriber?')) return;
        try {
            const res = await axios.delete(`${SERVER_URL}/api/blogs/admin/subscribers/${id}`);
            if (res.data.success) {
                toast.success('Subscriber removed');
                fetchSubscribers();
            }
        } catch (error) {
            toast.error('Failed to remove subscriber');
        }
    };

    const exportToCSV = () => {
        const headers = ['Email', 'Status', 'Subscribed Date'];
        const rows = subscribers.map(s => [
            s.email,
            s.status,
            new Date(s.subscribedAt).toLocaleDateString()
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `newsletter_subscribers_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const filteredSubscribers = subscribers.filter(s => 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#f8f9fa] min-h-screen">
            {/* Hero Banner */}
            <div className="relative w-full h-64 overflow-hidden rounded-b-xl pt-2">
                <img
                    src="/bann.png"
                    alt="Newsletter Subscribers Banner"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
                    <Mail className="w-16 h-16 mb-4" />
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
                        Newsletter Subscribers
                    </h1>
                    <p className="text-lg mt-2 text-center text-white/90">
                        View and manage users subscribed to your newsletter
                    </p>
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <PageHeader 
                        title="SUBSCRIBERS LIST" 
                    />
                    <button 
                        onClick={exportToCSV}
                        className="bg-[#001529] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#002a4d] transition-all text-xs uppercase tracking-widest shadow-lg"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by email..."
                        className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00df82]/20 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscribed On</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredSubscribers.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <Mail size={16} />
                                            </div>
                                            <span className="font-bold text-sm text-[#001529]">{item.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${item.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                        {new Date(item.subscribedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSubscribers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium text-sm italic">No subscribers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NewsletterSubscribers;
