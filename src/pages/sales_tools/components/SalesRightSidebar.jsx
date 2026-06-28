import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FileText, PlusCircle, Settings, Download, Headphones, ChevronRight } from 'lucide-react';

const sidebarFont = { fontFamily: 'Inter, sans-serif', color: '#15173D' };

export default function SalesRightSidebar({ data = [], loading = false }) {
  const total = data.length;
  let acceptedCount = 0;
  let sentCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;

  data.forEach(item => {
    if (item.invoice && item.invoice.length > 0) {
      acceptedCount++;
    } else if (item.performaInvoice && item.performaInvoice.length > 0) {
      sentCount++;
    } else {
      pendingCount++;
    }
  });

  const chartData = [
    { name: 'Accepted', value: acceptedCount, color: '#16A34A' },
    { name: 'Sent', value: sentCount, color: '#2563EB' },
    { name: 'Pending', value: pendingCount, color: '#F59E0B' },
    { name: 'Rejected', value: rejectedCount, color: '#EF4444' },
  ];

  const recentProposals = data.slice(0, 4).map(item => {
    let status = 'Pending';
    let color = 'bg-amber-100 text-amber-700';
    if (item.invoice && item.invoice.length > 0) {
      status = 'Accepted';
      color = 'bg-emerald-100 text-emerald-700';
    } else if (item.performaInvoice && item.performaInvoice.length > 0) {
      status = 'Sent';
      color = 'bg-blue-100 text-blue-700';
    }

    return {
      id: item.est_no,
      client: item.companyName || item.company_name || item.consignee_name,
      date: new Date(item.added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status,
      color
    };
  });

  return (
    <div className="space-y-1" style={sidebarFont}>
      {/* Proposal Overview */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#15173D' }}>Proposal Overview</h3>
        <div className="flex items-center justify-between">
          <div className="relative w-[100px] h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold" style={{ color: '#15173D' }}>{loading ? '...' : total}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase leading-none">Total</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2 flex-1 ml-6">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-bold" style={{ color: '#15173D' }}>{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold" style={{ color: '#15173D' }}>{loading ? '-' : item.value}</span>
                  <span className="text-[10px] font-bold text-slate-400">
                    ({loading || total === 0 ? 0 : Math.round((item.value / total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#15173D' }}>Recent Proposals</h3>
          <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700">View all</button>
        </div>
        <div className="space-y-2">
          {recentProposals.map((item, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={12} className="text-slate-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold leading-tight mb-0.5" style={{ color: '#5E0006' }}>{item.id}</h4>
                  <p className="text-[10px] font-bold" style={{ color: '#093C5D' }}>{item.client}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-bold text-slate-400">{item.date}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.color}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#15173D' }}>Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button disabled className="flex flex-col items-start p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5">
              <PlusCircle size={14} />
            </div>
            <span className="text-[10px] font-bold mb-0.5" style={{ color: '#15173D' }}>Create Proposal</span>
            <span className="text-[9px] font-medium text-slate-500">Create new proposal</span>
          </button>
          <button disabled className="flex flex-col items-start p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1.5">
              <FileText size={14} />
            </div>
            <span className="text-[10px] font-bold mb-0.5" style={{ color: '#15173D' }}>Proposal Templates</span>
            <span className="text-[9px] font-medium text-slate-500">Manage templates</span>
          </button>
          <button disabled className="flex flex-col items-start p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 rounded bg-rose-100 text-rose-600 flex items-center justify-center mb-1.5">
              <Settings size={14} />
            </div>
            <span className="text-[10px] font-bold mb-0.5" style={{ color: '#15173D' }}>Proposal Settings</span>
            <span className="text-[9px] font-medium text-slate-500">Configure settings</span>
          </button>
          <button disabled className="flex flex-col items-start p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left opacity-50 cursor-not-allowed">
            <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5">
              <Download size={14} />
            </div>
            <span className="text-[10px] font-bold mb-0.5" style={{ color: '#15173D' }}>Import Proposals</span>
            <span className="text-[9px] font-medium text-slate-500">Import from CSV</span>
          </button>
        </div>
      </div>

      {/* Need Help */}
      <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center justify-between hover:shadow-md cursor-pointer transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Headphones size={16} className="text-slate-600" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold mb-0.5" style={{ color: '#15173D' }}>Need Help?</h4>
            <p className="text-[10px] font-bold text-slate-500">Click here to contact support team</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-400" />
      </div>
    </div>
  );
}
