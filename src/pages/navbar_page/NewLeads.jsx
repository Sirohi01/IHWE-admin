import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Globe, 
  MoreVertical, 
  Filter, 
  Download,
  Building2,
  Calendar,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/PageHeader';

const NewLeads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState([
    {
      id: 1,
      name: "Rohit Sharma",
      company: "TechNova Solutions",
      email: "rohit@technova.com",
      phone: "+91 98765 43210",
      source: "Website Inquiry",
      status: "new",
      date: "2024-04-19",
    },
    {
      id: 2,
      name: "Sarah Jenkins",
      company: "Global Expo Corp",
      email: "sarah.j@globalexpo.com",
      phone: "+1 415 555 0123",
      source: "Referral",
      status: "contacted",
      date: "2024-04-18",
    },
    {
      id: 3,
      name: "Amit Patel",
      company: "Patel Industries",
      email: "amit@patelind.in",
      phone: "+91 99887 76655",
      source: "LinkedIn",
      status: "qualified",
      date: "2024-04-17",
    },
    {
      id: 4,
      name: "Elena Rodriguez",
      company: "Design Studio Pro",
      email: "elena@designstudio.es",
      phone: "+34 912 345 678",
      source: "Direct Call",
      status: "new",
      date: "2024-04-19",
    },
    {
      id: 5,
      name: "Kevin Lee",
      company: "K-Tech Markets",
      email: "kevin@ktech.kr",
      phone: "+82 10 1234 5678",
      source: "Newsletter",
      status: "lost",
      date: "2024-04-15",
    }
  ]);

  const updateStatus = (id, newStatus) => {
    setLeads(leads.map(l => 
      l.id === id ? { ...l, status: newStatus } : l
    ));
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'new': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'contacted': return "bg-amber-100 text-amber-700 border-amber-200";
      case 'qualified': return "bg-green-100 text-green-700 border-green-200";
      case 'lost': return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-6 mt-6 py-2">
        <PageHeader 
          title="New Leads" 
          description="Track and manage potential clients and exhibition inquiries"
          buttonText="Export CSV"
          buttonIcon={Download}
          buttonPath="#"
        />
      </div>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#23471d] transition-colors" />
            <input 
              type="text" 
              placeholder="Search leads by name or company..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#23471d]/5 focus:border-[#23471d] shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </button>
        </div>

        {/* Leads List */}
        <div className="grid gap-4">
          <AnimatePresence mode='popLayout'>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                    {/* User Profile Info */}
                    <div className="flex items-center gap-4 min-w-[240px]">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{lead.company}</h3>
                        <p className="text-sm font-bold text-[#23471d] mt-0.5">{lead.name}</p>
                      </div>
                    </div>

                    {/* Contact Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm font-medium">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-500 hover:text-green-600 transition-colors cursor-pointer">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm font-medium">{lead.phone}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5 text-slate-400">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm font-medium">{lead.source}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">Capture Date: {lead.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between xl:justify-end gap-6 pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                      <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${getStatusStyles(lead.status)}`}>
                        {lead.status}
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-[#23471d]/5 text-[#23471d] rounded-xl hover:bg-[#23471d] hover:text-white transition-all">
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 hover:text-slate-600 transition-all">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                        <div className="h-10 w-px bg-slate-200 mx-1 hidden xl:block" />
                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <UserPlus className="w-16 h-16 text-slate-100 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">No leads found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default NewLeads;
