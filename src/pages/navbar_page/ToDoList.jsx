import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Calendar,
  Layout,
  Tag,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/PageHeader';

const ToDoList = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [tasks, setTasks] = useState([
    {
      id: 1,
      task: "Finalize Exhibition Floor Plan",
      category: "Planning",
      dueDate: "2024-04-22",
      priority: "high",
      completed: false,
    },
    {
      id: 2,
      task: "Order Marketing Materials",
      category: "Marketing",
      dueDate: "2024-04-25",
      priority: "medium",
      completed: false,
    },
    {
      id: 3,
      task: "Team Briefing Session",
      category: "Internal",
      dueDate: "2024-04-19",
      priority: "medium",
      completed: true,
    },
    {
      id: 4,
      task: "Vendor Contract Renewal",
      category: "Admin",
      dueDate: "2024-04-30",
      priority: "low",
      completed: false,
    },
    {
      id: 5,
      task: "Check Equipment Inventory",
      category: "Operations",
      dueDate: "2024-04-21",
      priority: "high",
      completed: false,
    }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return "text-red-500";
      case 'medium': return "text-amber-500";
      case 'low': return "text-blue-500";
      default: return "text-slate-400";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Planning': return "bg-purple-100 text-purple-700";
      case 'Marketing': return "bg-pink-100 text-pink-700";
      case 'Internal': return "bg-blue-100 text-blue-700";
      case 'Admin': return "bg-slate-100 text-slate-700";
      case 'Operations': return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const categories = ['all', 'Planning', 'Marketing', 'Operations', 'Admin', 'Internal'];

  const filteredTasks = tasks.filter(t => 
    activeCategory === 'all' ? true : t.category === activeCategory
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-6 mt-6 py-2">
        <PageHeader 
          title="To-Do List" 
          description="Organize your daily tasks and project milestones"
          buttonText="New Task"
          buttonIcon={Plus}
          buttonPath="#"
        />
      </div>

      <main className="p-6 max-w-5xl mx-auto">
        {/* Categories Navbar */}
        <div className="flex gap-2 overflow-x-auto pb-6 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                ? 'bg-[#23471d] text-white shadow-lg shadow-[#23471d]/20' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Task List Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-black text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#23471d]" />
              {activeCategory} Tasks
            </h2>
            <div className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
              {filteredTasks.length} ITEMS
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <AnimatePresence mode='popLayout'>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`p-5 flex items-center gap-4 transition-colors group ${
                      task.completed ? 'bg-slate-50/30' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="transition-transform active:scale-90"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 group-hover:text-[#23471d]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 bg-current ${getPriorityColor(task.priority)}`} />
                        <h3 className={`text-sm font-bold truncate transition-all ${
                          task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                        }`}>
                          {task.task}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          Due: {task.dueDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="font-bold text-slate-800">No tasks in this category</h3>
                  <p className="text-slate-400 text-sm mt-1">Looks like you're all caught up!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToDoList;