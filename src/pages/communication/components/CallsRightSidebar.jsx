import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Phone, ChevronDown, Facebook, Instagram, Twitter } from 'lucide-react';

const countryCodes = [
  { code: '+91', flag: 'in' },
  { code: '+1', flag: 'us' },
  { code: '+44', flag: 'gb' },
  { code: '+971', flag: 'ae' },
  { code: '+966', flag: 'sa' },
  { code: '+974', flag: 'qa' },
  { code: '+965', flag: 'kw' },
  { code: '+968', flag: 'om' },
  { code: '+973', flag: 'bh' },
  { code: '+61', flag: 'au' },
  { code: '+65', flag: 'sg' },
  { code: '+60', flag: 'my' },
];

export default function CallsRightSidebar({ statsData, recentLogs }) {
  const target = statsData?.targets?.call || 0;
  const completed = statsData?.completed?.call || 0;
  const remaining = Math.max(target - completed, 0);

  const [dialNumber, setDialNumber] = useState('');
  const [dialCountryCode, setDialCountryCode] = useState('+91');

  const handleDialpadClick = (num) => {
    setDialNumber(prev => prev + num);
  };

  const handleQuickDial = () => {
    if (dialNumber) {
      window.location.href = `tel:${dialCountryCode}${dialNumber.replace(/^\+/, '')}`;
    }
  };

  const targetData = [
    { name: 'Remaining', value: remaining, color: '#F1F5F9' },
    { name: 'Connected', value: completed, color: '#16A34A' },
  ];

  const pendingCallbacks = [
    { initials: 'NH', name: "Nature's Harmony Pvt. Ltd.", date: '29 May, 04:00 PM', color: 'bg-purple-100 text-purple-700', Icon: Facebook, iconColor: 'text-blue-500 border-blue-400' },
    { initials: 'HE', name: 'Herbal King Exports', date: '29 May, 11:30 AM', color: 'bg-orange-100 text-orange-700', Icon: Instagram, iconColor: 'text-pink-500 border-pink-400' },
    { initials: 'AO', name: 'Arogya Organics', date: '28 May, 02:00 PM', color: 'bg-green-100 text-green-700', Icon: Twitter, iconColor: 'text-slate-800 border-slate-800' },
  ];

  const dialpadButtons = [
    { main: '1', sub: '' }, { main: '2', sub: 'ABC' }, { main: '3', sub: 'DEF' },
    { main: '4', sub: 'GHI' }, { main: '5', sub: 'JKL' }, { main: '6', sub: 'MNO' },
    { main: '7', sub: 'PQRS' }, { main: '8', sub: 'TUV' }, { main: '9', sub: 'WXYZ' },
    { main: '*', sub: '' }, { main: '0', sub: '+' }, { main: '#', sub: '' },
  ];

  return (
    <div className="space-y-1">
      {/* This Month's Call Target */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-3">
        <h3 className="text-[16px] font-medium text-[#0F172A] mb-1">This Month's Call Target</h3>
        <div className="flex items-center justify-between">
          <div className="relative w-[90px] h-[90px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={40}
                  startAngle={180}
                  endAngle={-90}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {targetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[18px] font-medium text-[#0F172A] leading-tight">{completed}</span>
              <span className="text-[10px] font-medium text-slate-500 leading-tight">/ {target}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2 flex-1 ml-6">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-600">Target</span>
              <span className="text-[12px] font-medium text-slate-900">{target}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-600">Connected</span>
              <span className="text-[12px] font-medium text-slate-900">{completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-600">Remaining</span>
              <span className="text-[12px] font-medium text-slate-900">{remaining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Call Backs */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-2 px-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[15px] font-medium text-[#0F172A]">Pending Call Backs</h3>
          <button className="text-[11px] font-medium text-slate-600 hover:text-slate-900">View all</button>
        </div>
        <div className="space-y-1">
          {pendingCallbacks.map((item, index) => {
            const SocialIcon = item.Icon;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded text-[11px] font-medium flex items-center justify-center ${item.color}`}>
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium text-[#0F172A] leading-tight mb-0.5">{item.name}</h4>
                    <p className="text-[11px] font-medium text-slate-500">{item.date}</p>
                  </div>
                </div>
                <button className={`w-7 h-7 rounded-full border flex items-center justify-center hover:bg-slate-50 ${item.iconColor}`}>
                  <SocialIcon size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Dial */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-3">
        <h3 className="text-[16px] font-medium text-[#0F172A] mb-2">Quick Dial</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex items-center rounded-lg border border-slate-200 bg-white">
            <img loading="lazy" decoding="async"               src={`https://flagcdn.com/w20/${countryCodes.find((country) => country.code === dialCountryCode)?.flag || 'in'}.png`}
              alt=""
              className="ml-2 h-3 w-5"
            />
            <select
              value={dialCountryCode}
              onChange={(e) => setDialCountryCode(e.target.value)}
              className="h-8 w-[62px] appearance-none bg-transparent pl-2 pr-6 text-[12px] font-medium text-slate-700 outline-none"
              title="Country code"
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Enter number"
            value={dialNumber}
            onChange={(e) => setDialNumber(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-[12px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
          />
          <button onClick={handleQuickDial} className="w-8 h-8 bg-[#5E5E81] hover:bg-[#4B4B67] rounded-lg flex items-center justify-center text-white transition-colors">
            <Phone size={14} fill="currentColor" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {dialpadButtons.map((btn, index) => (
            <button
              key={index}
              onClick={() => handleDialpadClick(btn.main)}
              className="flex flex-col items-center justify-center h-10 border border-slate-100 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <span className="text-[16px] font-medium text-slate-800 leading-none">{btn.main}</span>
              {btn.sub && <span className="text-[9px] font-medium text-slate-400 uppercase leading-tight tracking-widest mt-0.5">{btn.sub}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Call Notes */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[14px] font-medium text-[#0F172A]">Recent Call Notes</h3>
          <button className="text-[12px] font-medium text-slate-600 hover:text-slate-900">View all</button>
        </div>
        <div className="space-y-2">
          {recentLogs && recentLogs.length > 0 ? (
            recentLogs.map((note, index, arr) => (
              <div key={index} className="flex items-start gap-3 relative">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0 z-10" />
                {index !== arr.length - 1 && (
                  <div className="absolute left-[3px] top-4 bottom-[-16px] w-[1px] bg-slate-100" />
                )}
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-[12px] font-medium text-[#0F172A]">{note.name}</h4>
                    <span className="text-[10px] font-medium text-slate-400">
                      {note.time && !isNaN(new Date(note.time).getTime()) ? new Date(note.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : note.time}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                    {note.note}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[12px] text-slate-400 text-center py-2">No recent calls</p>
          )}
        </div>
      </div>
    </div>
  );
}
