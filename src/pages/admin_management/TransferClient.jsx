import { useState, useEffect } from "react";
import PageHeader from '../../components/PageHeader';
import { Settings, List, BadgeHelp, Search, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function TransferClient() {
    const [form, setForm] = useState({ fromUser: "", toUser: "", reason: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
                const headers = { Authorization: `Bearer ${token}` };

                const [usersRes, logsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/admin/public-list`, { headers }),
                    axios.get(`${API_URL}/api/ownership-transfer/logs`, { headers })
                ]);

                if (usersRes.data.success) {
                    setUsers(usersRes.data.data);
                }
                if (logsRes.data.success) {
                    setLogs(logsRes.data.data.filter(log => log.transferType === "Client Transfer"));
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                Swal.fire("Error", "Failed to fetch transfer data", "error");
            }
        };
        fetchData();
    }, []);

    const filteredData = logs.filter(item => {
        const searchStr = searchTerm.toLowerCase();
        return (
            item.fromUser.toLowerCase().includes(searchStr) ||
            item.toUser.toLowerCase().includes(searchStr) ||
            item.updatedBy.toLowerCase().includes(searchStr) ||
            (new Date(item.createdAt).toLocaleDateString()).toLowerCase().includes(searchStr)
        );
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!form.fromUser || !form.toUser || !form.reason) {
            return Swal.fire("Error", "Please fill all required fields.", "error");
        }
        if (form.fromUser === form.toUser) {
            return Swal.fire("Error", "Cannot transfer to the same user.", "error");
        }

        try {
            const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
            const res = await axios.post(`${API_URL}/api/ownership-transfer/client`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                Swal.fire("Success", res.data.message, "success");
                setForm({ fromUser: "", toUser: "", reason: "" });
                setLogs(prev => [res.data.data, ...prev]);
            }
        } catch (error) {
            console.error("Transfer failed:", error);
            Swal.fire("Error", error.response?.data?.message || "Transfer failed", "error");
        }
    };

    return (
        <div className="bg-white shadow-md p-6 min-h-screen">
            <PageHeader
                title="TRANSFER CLIENT OWNERSHIP"
                description={<span className="text-[10px] text-gray-500 font-medium italic tracking-wide">Bulk transfer all clients from one user to another (e.g., Use this bulk transfer when a team member completely leaves/project the organization.).</span>}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
                {/* Left Column: Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            <Settings className="w-5 h-5" /> Transfer Configuration
                        </h2>
                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transfer From (Current Owner) *</label>
                                <select
                                    name="fromUser"
                                    value={form.fromUser}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-semibold"
                                >
                                    <option value="">Select User</option>
                                    {users.map(u => (
                                        <option key={u.username} value={u.username}>{u.fullName || u.username} ({u.designation || 'No Designation'})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transfer To (New Owner) *</label>
                                <select
                                    name="toUser"
                                    value={form.toUser}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-semibold"
                                >
                                    <option value="">Select User</option>
                                    {users.map(u => (
                                        <option key={u.username} value={u.username}>{u.fullName || u.username} ({u.designation || 'No Designation'})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason for Transfer *</label>
                                <textarea
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="e.g. Employee resigned"
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                ></textarea>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    Execute Transfer
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500 flex items-start gap-3 mt-6">
                        <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-gray-700 mb-1">Management Tips:</p>
                            <ul className="list-disc list-inside space-y-1 font-medium italic">
                                <li>Use this bulk transfer when a team member completely leaves/project the organization.</li>
                                <li>The reason field is required to maintain a clear audit trail.</li>
                                <li>All clients belonging to the "Current Owner" will instantly be reassigned.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Table */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-lg">
                        <div className="px-6 py-4 border-b bg-[#23471d] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <List className="w-5 h-5 text-[#d26019]" /> Recent Transfer Logs
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or date..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="pl-9 pr-4 py-1.5 text-xs rounded border-none outline-none focus:ring-2 focus:ring-[#d26019] w-64 bg-white/20 text-white placeholder-white font-bold"
                                    />
                                </div>
                                <span className="bg-[#d26019] text-white text-[10px] font-bold px-2 py-1 rounded">
                                    {filteredData.length} LOGS
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b whitespace-nowrap">
                                        <th className="px-6 py-4">S.No</th>
                                        <th className="px-6 py-4">From User</th>
                                        <th className="px-6 py-4">To User</th>
                                        <th className="px-6 py-4 text-center">Clients</th>
                                        <th className="px-6 py-4">Reason</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4">Updated By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500 italic">
                                                No transfers found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <tr key={item._id || index} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <td className="px-6 py-2.5 font-bold text-[#23471d] text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="px-6 py-2.5">
                                                    <div className="font-bold text-red-600 text-xs whitespace-nowrap">{item.fromUser}</div>
                                                    <div className="text-[9px] text-[#112E81] font-bold mt-0.5 whitespace-nowrap">{item.fromDesignation}</div>
                                                </td>
                                                <td className="px-6 py-2.5">
                                                    <div className="font-bold text-emerald-600 text-xs whitespace-nowrap">{item.toUser}</div>
                                                    <div className="text-[9px] text-[#0A2947] font-bold mt-0.5 whitespace-nowrap">{item.toDesignation}</div>
                                                </td>
                                                <td className="px-6 py-2.5 text-center font-bold text-gray-600 text-xs">{item.recordCount}</td>
                                                <td className="px-6 py-2.5 text-[11px] font-semibold text-gray-500 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                                                <td className="px-6 py-2.5 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2.5">
                                                    <div className="font-bold text-red-600 text-xs whitespace-nowrap">{item.updatedBy}</div>
                                                    <div className="text-[9px] text-[#111844] font-bold mt-0.5 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                <span className="text-xs font-bold text-gray-500">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} Entries
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

            
                </div>
            </div>
        </div>
    );
}
