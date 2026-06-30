import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  const circumference = 2 * Math.PI * 32;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setMounted(true), 250);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById('proposal-donut-chart-container');
    if (element) {
      observer.observe(element);
    }
    
    return () => observer.disconnect();
  }, []);

  const recentProposals = data.slice(0, 4).map(item => {
    let status = 'Pending';
    let color = 'bg-amber-100 text-amber-700';
    let iconColor = 'text-amber-500';
    let iconBg = 'bg-amber-50';
    
    if (item.invoice && item.invoice.length > 0) {
      status = 'Accepted';
      color = 'bg-emerald-100 text-emerald-700';
      iconColor = 'text-emerald-500';
      iconBg = 'bg-emerald-50';
    } else if (item.performaInvoice && item.performaInvoice.length > 0) {
      status = 'Sent';
      color = 'bg-blue-100 text-blue-700';
      iconColor = 'text-blue-500';
      iconBg = 'bg-blue-50';
    }

    return {
      id: item.est_no,
      client: item.companyName || item.company_name || item.consignee_name,
      date: new Date(item.added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status,
      color,
      iconColor,
      iconBg
    };
  });

  return (
    <div className="space-y-1" style={sidebarFont}>
      {/* Proposal Overview */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        {/* Top Header */}
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Proposal Overview</h3>
          <span className="text-[10px] font-bold text-slate-500">
            Total: <strong className="font-bold text-[#15173D]">{loading ? '...' : total}</strong>
          </span>
        </div>

        {/* Main Flex Layout: Chart Left, Legend Right */}
        <div className="flex items-center justify-between gap-4 my-2">
          {/* Pure SVG Donut Chart (Left) */}
          <div id="proposal-donut-chart-container" className="relative flex-shrink-0 flex items-center justify-center" style={{ width: '85px', height: '85px' }}>
            <svg viewBox="0 0 85 85" width="85" height="85" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background track */}
              <circle cx="42.5" cy="42.5" r="32" fill="none" stroke="#f1f5f9" strokeWidth="14" />
              {/* Segments */}
              {(() => {
                if (loading || total === 0) {
                  return <circle cx="42.5" cy="42.5" r="32" fill="none" stroke="#e2e8f0" strokeWidth="14" />;
                }
                const gap = 0;
                let cumulativeAngle = 0;
                return chartData.filter(d => d.value > 0).map((d, i) => {
                  const segLen = (d.value / total) * circumference - gap;
                  const duration = (d.value / total) * 2.0; 
                  const delay = (cumulativeAngle / 360) * 2.0;
                  const currentAngle = cumulativeAngle;
                  
                  cumulativeAngle += (d.value / total) * 360;
                  
                  return (
                    <g key={i} style={{ transform: `rotate(${currentAngle}deg)`, transformOrigin: 'center' }}>
                      <circle
                        cx="42.5" cy="42.5" r="32"
                        fill="none"
                        stroke={d.color}
                        strokeWidth="14"
                        strokeDasharray={circumference}
                        strokeDashoffset={mounted ? circumference - Math.max(segLen, 0) : circumference}
                        strokeLinecap="butt"
                        style={{ 
                          transition: `stroke-dashoffset ${duration}s linear ${delay}s` 
                        }}
                      />
                    </g>
                  );
                });
              })()}
            </svg>
            <div className="absolute text-center mt-0.5">
              <p className="text-base font-bold text-[#15173D] tracking-tight leading-none mb-0.5">{loading ? '...' : total}</p>
              <span className="text-[10px] font-bold text-[#15173D] tracking-tight leading-none block">Total</span>
            </div>
          </div>

          {/* Legend (Right) */}
          <div className="flex-1 space-y-2 text-[11px] font-semibold text-slate-600 pl-2 min-w-0">
            {chartData.map((d, i) => {
              const pct = total > 0 && !loading ? Math.round((d.value / total) * 100) : 0;
              return (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                  transition={{ delay: 0.1 + (i * 0.1), duration: 0.3 }}
                  className="flex items-center gap-2 min-w-0"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <div className="flex items-center justify-between w-full min-w-0 gap-1">
                    <span className="text-[#15173D] font-bold truncate text-[10px]">{d.name}</span>
                    <span className="text-[#093C5D] font-bold flex-shrink-0 text-[10px]">
                      {loading ? '-' : d.value} <span style={{ color: d.color }}>({pct}%)</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
        <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
          <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Recent Proposals</h3>
          <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline">View all</button>
        </div>
        <div className="space-y-2">
          {recentProposals.map((item, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex gap-2">
                <div className={`w-7 h-7 rounded-lg ${item.iconBg} border border-slate-100/50 flex items-center justify-center shrink-0 mt-0.5`}>
                  <FileText size={12} className={item.iconColor} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold leading-tight mb-0.5" style={{ color: '#5E0006' }}>{item.id}</h4>
                  <p className="text-[10px] font-bold" style={{ color: '#093C5D' }}>{item.client}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-bold" style={{ color: '#15173D' }}>{item.date}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.color}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
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
      <div className="bg-white rounded-xl p-3 flex items-center justify-between hover:shadow-md cursor-pointer transition-shadow" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
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
