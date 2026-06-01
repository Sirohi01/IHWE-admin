import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FileText, PlusCircle, Settings, Download, Headphones, ChevronRight } from 'lucide-react';

const data = [
  { name: 'Accepted', value: 4, color: '#16A34A' },
  { name: 'Sent', value: 22, color: '#2563EB' },
  { name: 'Pending', value: 10, color: '#F59E0B' },
  { name: 'Rejected', value: 2, color: '#EF4444' },
];

const recentProposals = [
  { id: 'PROP-2026-036', client: 'GreenLife Ayurveda', date: '28 May 2026', status: 'Accepted', color: 'bg-green-100 text-green-700' },
  { id: 'PROP-2026-035', client: "Nature's Harmony Pvt. Ltd.", date: '27 May 2026', status: 'Sent', color: 'bg-blue-100 text-blue-700' },
  { id: 'PROP-2026-034', client: 'Wellness World', date: '26 May 2026', status: 'Pending', color: 'bg-orange-100 text-orange-700' },
  { id: 'PROP-2026-033', client: 'Herbal King Exports', date: '24 May 2026', status: 'Sent', color: 'bg-blue-100 text-blue-700' },
];

export default function SalesRightSidebar() {
  return (
    <div className="space-y-1">
      {/* Proposal Overview */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-4">
        <h3 className="text-[16px] font-md text-[#0F172A] mb-2">Proposal Overview</h3>
        <div className="flex items-center justify-between">
          <div className="relative w-[100px] h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-[#0F172A]">36</span>
              <span className="text-[9px] font-medium text-slate-500 uppercase leading-none">Total</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2 flex-1 ml-6">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[13px] text-slate-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-slate-900">{item.value}</span>
                  <span className="text-[11px] text-slate-400">({Math.round((item.value / 36) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[16px] font-md text-[#0F172A] mb-1">Recent Proposals</h3>
          <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">View all</button>
        </div>
        <div className="space-y-2">
          {recentProposals.map((item, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={14} className="text-slate-400" />
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-slate-900 leading-tight mb-0.5">{item.id}</h4>
                  <p className="text-[12px] font-medium text-slate-500">{item.client}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[11px] font-medium text-slate-400">{item.date}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.color}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-4">
        <h3 className="text-[16px] font-md text-[#0F172A] mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button disabled className="flex flex-col items-start p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center mb-1.5">
              <PlusCircle size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 mb-0.5">Create Proposal</span>
            <span className="text-[9px] text-slate-500">Create new proposal</span>
          </button>
          <button disabled className="flex flex-col items-start p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center mb-1.5">
              <FileText size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 mb-0.5">Proposal Templates</span>
            <span className="text-[9px] text-slate-500">Manage templates</span>
          </button>
          <button disabled className="flex flex-col items-start p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center mb-1.5">
              <Settings size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 mb-0.5">Proposal Settings</span>
            <span className="text-[9px] text-slate-500">Configure settings</span>
          </button>
          <button disabled className="flex flex-col items-start p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5">
              <Download size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 mb-0.5">Import Proposals</span>
            <span className="text-[9px] text-slate-500">Import from CSV</span>
          </button>
        </div>
      </div>

      {/* Need Help */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-3 flex items-center justify-between hover:shadow-md cursor-pointer transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Headphones size={16} className="text-slate-600" />
          </div>
          <div>
            <h4 className="text-[14px] font-medium text-[#0F172A] mb-1">Need Help?</h4>
            <p className="text-[13px] text-slate-500 font-medium mb-0.5">Click here to contact support team</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-400" />
      </div>
    </div>
  );
}
