import React, { useState } from 'react';
import {
    Bell,
    CheckCheck,
    Trash2,
    Info,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Search,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/PageHeader';

const Notification = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "New Exhibitor Registered",
            message: "Studio 54 has completed their registration for the Upcoming Expo.",
            time: "2 hours ago",
            type: "success",
            read: false,
        },
        {
            id: 2,
            title: "Server Maintenance",
            message: "The admin panel will be down for scheduled maintenance at 12:00 AM.",
            time: "5 hours ago",
            type: "warning",
            read: false,
        },
        {
            id: 3,
            title: "Account Security Update",
            message: "Your password was successfully changed yesterday.",
            time: "1 day ago",
            type: "info",
            read: true,
        },
        {
            id: 4,
            title: "Payment Failed",
            message: "Transaction for invoice #8872 was declined by the bank.",
            time: "2 days ago",
            type: "error",
            read: false,
        },
        {
            id: 5,
            title: "New Lead Generated",
            message: "A new visitor lead has been captured from the landing page.",
            time: "3 days ago",
            type: "success",
            read: true,
        }
    ]);

    const toggleRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: !n.read } : n
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unread') return !n.read;
        return n.type === activeFilter;
    });

    const getTypeStyles = (type) => {
        switch (type) {
            case 'success': return { icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-green-100 text-green-600 border-green-200" };
            case 'warning': return { icon: <AlertTriangle className="w-5 h-5" />, color: "bg-amber-100 text-amber-600 border-amber-200" };
            case 'error': return { icon: <XCircle className="w-5 h-5" />, color: "bg-red-100 text-red-600 border-red-200" };
            default: return { icon: <Info className="w-5 h-5" />, color: "bg-blue-100 text-blue-600 border-blue-200" };
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-white px-6 mt-6 py-2">
                <PageHeader
                    title="Notifications"
                    description="Manage and track your system activity notifications"
                >
                    <div className="flex items-center gap-2">
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 shadow-sm"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear all
                        </button>
                    </div>
                </PageHeader>
            </div>

            <main className="p-6 max-w-5xl mx-auto">
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                    {['all', 'unread', 'success', 'warning', 'error', 'info'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all duration-300 ${activeFilter === filter
                                ? 'bg-[#23471d] text-white shadow-md shadow-[#23471d]/20'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Notif List */}
                <div className="space-y-3">
                    <AnimatePresence mode='popLayout'>
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notif) => {
                                const styles = getTypeStyles(notif.type);
                                return (
                                    <motion.div
                                        key={notif.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className={`relative group bg-white p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-200 ${notif.read ? 'border-l-slate-200' : 'border-l-[#23471d]'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2.5 rounded-lg border ${styles.color}`}>
                                                {styles.icon}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`text-sm font-bold ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="text-[11px] font-medium text-slate-400">
                                                        {notif.time}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                                                    {notif.message}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleRead(notif.id)}
                                                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
                                                    title={notif.read ? "Mark as unread" : "Mark as read"}
                                                >
                                                    <CheckCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200"
                            >
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No notifications found</h3>
                                <p className="text-slate-500 text-sm">Quiet as a mouse here.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Notification;