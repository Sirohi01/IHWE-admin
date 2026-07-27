import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Search, Filter, Eye, Download, Calendar } from 'lucide-react';

const mockActivities = [
  { id: 1, user: "John Doe (ABC Pharma)", role: "Exhibitor", module: "Documents", action: "Uploaded GST Certificate", time: "2026-06-28 10:30 AM", status: "Success" },
  { id: 2, user: "Jane Smith (City Dental Systems)", role: "Exhibitor", module: "Profile", action: "Updated Company Logo", time: "2026-06-28 10:10 AM", status: "Success" },
  { id: 3, user: "Admin User", role: "Admin", module: "Service Requests", action: "Approved Electricity Request for Herbal Care", time: "2026-06-28 09:55 AM", status: "Success" },
  { id: 4, user: "System", role: "System", module: "Payments", action: "Payment Received from Happy Miles (₹1,16,820)", time: "2026-06-28 09:20 AM", status: "Success" },
  { id: 5, user: "Mike Johnson (Airx Innovation)", role: "Exhibitor", module: "Stall Modification", action: "Requested Stall Size Upgrade (12 sqm)", time: "2026-06-28 09:10 AM", status: "Pending" },
  { id: 6, user: "Admin User", role: "Admin", module: "Approvals", action: "Rejected Fascia Name for City Dental", time: "2026-06-27 16:45 PM", status: "Failed" },
  { id: 7, user: "Sarah Lee (Herbal Care India)", role: "Exhibitor", module: "Passes", action: "Requested 3 Service Passes", time: "2026-06-27 14:30 PM", status: "Success" },
  { id: 8, user: "System", role: "System", module: "Communications", action: "Sent Payment Reminder WhatsApp to City Dental", time: "2026-06-27 10:00 AM", status: "Success" },
];

const ActivityLog = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusColor = (status) => {
        switch(status) {
            case 'Success': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <PageHeader 
                title="Activity Log" 
                subtitle="Track and monitor all user and system activities across the platform"
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search activities by user, action, or module..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#23471d] focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
                            <Calendar size={16} />
                            Date Range
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
                            <Filter size={16} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#23471d] text-white rounded-lg text-sm font-medium hover:bg-[#1a3515] transition-colors w-full sm:w-auto justify-center">
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">User / Company</th>
                                <th className="px-6 py-4">Module</th>
                                <th className="px-6 py-4">Action Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">View</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {mockActivities.map((log) => (
                                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{log.time.split(' ')[0]}</div>
                                        <div className="text-xs text-gray-500">{log.time.split(' ')[1]} {log.time.split(' ')[2]}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-[#23471d]">{log.user}</div>
                                        <div className="text-xs text-gray-500">{log.role}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                                            {log.module}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-800">{log.action}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getStatusColor(log.status)}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex justify-center items-center">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <span className="text-sm text-gray-600">Showing <span className="font-bold">1</span> to <span className="font-bold">8</span> of <span className="font-bold">85</span> entries</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50">Prev</button>
                        <button className="px-3 py-1 border border-[#23471d] rounded text-sm font-bold text-white bg-[#23471d]">1</button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">3</button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-500 bg-white hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;
