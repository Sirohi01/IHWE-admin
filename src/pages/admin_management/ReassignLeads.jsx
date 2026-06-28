import { useState, useEffect } from "react";
import PageHeader from '../../components/PageHeader';
import { Settings, List, BadgeHelp, Search, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ReassignLeads() {
    const [form, setForm] = useState({ leadStatus: "", fromUser: "", toUser: "", remarks: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [leads, setLeads] = useState([]);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
                const res = await axios.get(`${API_URL}/api/admin/public-list`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setUsers(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
                Swal.fire("Error", "Failed to load users", "error");
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchLeads = async () => {
            if (!form.fromUser && !form.leadStatus) {
                setLeads([]);
                return;
            }
            try {
                const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
                const queryParams = new URLSearchParams();
                if (form.fromUser) queryParams.append("currentOwner", form.fromUser);
                if (form.leadStatus) queryParams.append("status", form.leadStatus);
                
                const res = await axios.get(`${API_URL}/api/ownership-transfer/leads?${queryParams.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setLeads(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch leads:", error);
                Swal.fire("Error", "Failed to load leads", "error");
            }
        };
        fetchLeads();
    }, [form.fromUser, form.leadStatus]);

    const filteredData = leads.filter(item => {
        const searchStr = searchTerm.toLowerCase();
        return (
            (item.name || "").toLowerCase().includes(searchStr) ||
            (item.currentOwner || "").toLowerCase().includes(searchStr) ||
            (item.updatedBy || "").toLowerCase().includes(searchStr) ||
            (new Date(item.date).toLocaleDateString()).toLowerCase().includes(searchStr)
        );
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleReassign = async (e) => {
        e.preventDefault();
        if (!form.fromUser || !form.toUser || !form.remarks || !form.leadStatus) {
            return Swal.fire("Error", "Please fill all required fields (including Lead Status and Remarks).", "error");
        }
        if (form.fromUser === form.toUser) {
            return Swal.fire("Error", "Cannot reassign to the same user.", "error");
        }
        
        try {
            const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
            const payload = {
                fromUser: form.fromUser,
                toUser: form.toUser,
                leadStatus: form.leadStatus,
                remarks: form.remarks
            };
            
            const res = await axios.post(`${API_URL}/api/ownership-transfer/reassign`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data.success) {
                Swal.fire("Success", res.data.message, "success");
                setForm({ ...form, toUser: "", remarks: "", fromUser: "" });
                setLeads([]);
            }
        } catch (error) {
            console.error("Reassignment failed:", error);
            Swal.fire("Error", error.response?.data?.message || "Reassignment failed", "error");
        }
    };

    return (
        <div className="bg-white shadow-md p-6 min-h-screen">
            <PageHeader
                title="REASSIGN LEADS"
                description="Selectively reassign leads based on status or current owner."
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
                {/* Left Column: Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            <Settings className="w-5 h-5" /> Reassignment Configuration
                        </h2>
                        <form onSubmit={handleReassign} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Owner *</label>
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
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lead Status Filter</label>
                                <select
                                    name="leadStatus"
                                    value={form.leadStatus}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-semibold"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="New Lead">New Lead</option>
                                    <option value="Warm Lead">Warm Lead</option>
                                    <option value="Hot Lead">Hot Lead</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Owner *</label>
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
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Remarks *</label>
                                <textarea
                                    name="remarks"
                                    value={form.remarks}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="e.g. Lead requested technical contact"
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                ></textarea>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    Reassign Selected
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500 flex items-start gap-3 mt-6">
                        <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-gray-700 mb-1">Management Tips:</p>
                            <ul className="list-disc list-inside space-y-1 font-medium italic">
                                <li>Filter by specific statuses (e.g., Warm Leads) to selectively reassign priority targets.</li>
                                <li>Leaving the status filter blank will select all leads owned by the Current Owner.</li>
                                <li>Always provide a meaningful remark so the new owner understands context.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Table */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white border-2 border-gray-200 shadow-sm overflow-hidden rounded-lg">
                        <div className="px-6 py-4 border-b bg-[#23471d] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <List className="w-5 h-5 text-[#d26019]" /> Leads Available for Reassignment
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
                                    {filteredData.length} LEADS FOUND
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-widest border-b whitespace-nowrap">
                                        <th className="px-6 py-4">S.No</th>
                                        <th className="px-6 py-4">Lead Name</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4">Current Owner</th>
                                        <th className="px-6 py-4">Updated By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                                                No leads found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <td className="px-6 py-2.5 font-bold text-[#23471d] text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="px-6 py-2.5 font-bold text-gray-900 text-xs">{item.name}</td>
                                                <td className="px-6 py-2.5 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                        item.status === 'Hot Lead' ? 'bg-red-100 text-red-700' :
                                                        item.status === 'Warm Lead' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2.5">
                                                    <div className="font-bold text-[#112E81] text-xs whitespace-nowrap">{item.currentOwner}</div>
                                                    <div className="text-[9px] text-[#112E81] font-bold mt-0.5 whitespace-nowrap">{item.ownerDesignation}</div>
                                                </td>
                                                <td className="px-6 py-2.5">
                                                    <div className="font-bold text-red-600 text-xs whitespace-nowrap">{item.updatedBy}</div>
                                                    <div className="text-[9px] text-[#111844] font-bold mt-0.5 whitespace-nowrap">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
