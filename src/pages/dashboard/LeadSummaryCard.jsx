import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { motion } from "framer-motion";

export default function LeadSummaryCard({ donutData, totalLeads }) {
  const circumference = 2 * Math.PI * 32; // ≈ 201.06
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
    
    const element = document.getElementById('donut-chart-container');
    if (element) {
      observer.observe(element);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white rounded-lg p-2.5 lg:col-span-3 col-span-1 flex flex-col justify-between" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-2 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
        <h3 className="text-sm font-bold text-[#15173D] tracking-tight">Lead Summary</h3>
        <span className="text-[10px] font-bold text-slate-500">
          Total Leads: <strong className="font-bold text-[#15173D]">{totalLeads}</strong>
        </span>
      </div>

      {/* Main Flex Layout: Chart Left, Legend Right */}
      <div className="flex items-center justify-between gap-4 flex-1 my-2">
        {/* Pure SVG Donut Chart (Left) */}
        <div id="donut-chart-container" className="relative flex-shrink-0 flex items-center justify-center" style={{ width: '85px', height: '85px' }}>
          <svg viewBox="0 0 85 85" width="85" height="85" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background track */}
            <circle cx="42.5" cy="42.5" r="32" fill="none" stroke="#f1f5f9" strokeWidth="14" />
            {/* Segments */}
            {(() => {
              const total = donutData.reduce((s, d) => s + d.value, 0);
              // If all zero, just show grey track
              if (total === 0) {
                return <circle cx="42.5" cy="42.5" r="32" fill="none" stroke="#e2e8f0" strokeWidth="14" />;
              }
              const gap = 0;
              let cumulativeAngle = 0;
              return donutData.filter(d => d.value > 0).map((d, i) => {
                const segLen = (d.value / total) * circumference - gap;
                const duration = (d.value / total) * 2.0; // total 2.0s for the whole circle
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
            <p className="text-base font-bold text-[#15173D] tracking-tight leading-none mb-0.5">{totalLeads}</p>
            <span className="text-[10px] font-bold text-[#15173D] tracking-tight leading-none block">Total</span>
          </div>
        </div>

        {/* Legend (Right) */}
        <div className="flex-1 space-y-2 text-[11px] font-semibold text-slate-600 pl-2 min-w-0">
          {donutData.map((d, i) => {
            const pct = totalLeads > 0 ? Math.round((d.value / totalLeads) * 100) : 0;
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
                    {d.value} <span style={{ color: d.color }}>({pct}%)</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer view all link with line separator */}
      <div className="border-t border-slate-100/80 pt-2 mt-1">
        <Link
          to="/ihweClientData2026/masterData"
          className="text-[10px] font-md font-semibold text-[#08775e] uppercase tracking-wider flex items-center justify-center gap-1 hover:underline text-center"
        >
          View All Leads <span className="text-sm font-bold leading-none">→</span>
        </Link>
      </div>
    </div>
  );
}

