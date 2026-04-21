import React, { useState } from 'react';
import { 
  AlarmClock, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  AlertTriangle,
  Flag,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/PageHeader';

const Reminder = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: "Client Follow-up: Tech Corp",
      description: "Discuss the final booth layout and branding requirements.",
      dateTime: "2024-04-20 10:30 AM",
      priority: "high",
      completed: false,
    },
    {
      id: 2,
      title: "Invoice Review",
      description: "Verify pending invoices with the accounts department.",
      dateTime: "2024-04-20 02:00 PM",
      priority: "medium",
      completed: false,
    },
    {
      id: 3,
      title: "Material Sample Check",
      description: "Approve the granite samples for the VIP lounge.",
      dateTime: "2024-04-19 11:00 AM",
      priority: "high",
      completed: true,
    },
    {
      id: 4,
      title: "Site Inspection",
      description: "Visit Hall B to check electricity wiring progress.",
      dateTime: "2024-04-21 09:00 AM",
      priority: "low",
      completed: false,
    },
    {
      id: 5,
      title: "Weekly Team Sync",
      description: "Project status update with all department heads.",
      dateTime: "2024-04-18 04:30 PM",
      priority: "medium",
      completed: true,
    }
  ]);

  const toggleComplete = (id) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return "text-red-600 bg-red-50 border-red-100";
      case 'medium': return "text-amber-600 bg-amber-50 border-amber-100";
      case 'low': return "text-blue-600 bg-blue-50 border-blue-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const filteredReminders = reminders.filter(r => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return r.completed;
    if (activeTab === 'pending') return !r.completed;
    return r.priority === activeTab;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-6 mt-6 py-2">
        <PageHeader 
          title="Reminders" 
          description="Stay on top of your schedule with timely alerts"
          buttonText="Add Reminder"
          buttonIcon={Plus}
          buttonPath="#"
        />
      </div>

      <main className="p-6 max-w-5xl mx-auto">
        {/* Filter Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-6 w-fit">
          {['all', 'pending', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${
                activeTab === tab 
                ? 'bg-[#23471d] text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Reminders Grid/List */}
        <div className="grid gap-4">
          <AnimatePresence mode='popLayout'>
            {filteredReminders.length > 0 ? (
              filteredReminders.map((rem) => (
                <motion.div
                  key={rem.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-md ${
                    rem.completed ? 'opacity-70 group' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleComplete(rem.id)}
                      className="mt-1 transition-transform active:scale-95"
                    >
                      {rem.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-blue-500" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className={`text-base font-bold transition-all ${
                          rem.completed ? 'text-slate-400 line-through font-medium' : 'text-slate-900'
                        }`}>
                          {rem.title}
                        </h3>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityStyles(rem.priority)}`}>
                          <Flag className="w-3 h-3" />
                          {rem.priority}
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-4 leading-relaxed ${rem.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                        {rem.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {rem.dateTime.split(' ')[0]}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          {rem.dateTime.split(' ').slice(1).join(' ')}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteReminder(rem.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <AlarmClock className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Clear Schedule!</h3>
                <p className="text-slate-500 text-sm mt-1">No reminders for the current filter.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Reminder;