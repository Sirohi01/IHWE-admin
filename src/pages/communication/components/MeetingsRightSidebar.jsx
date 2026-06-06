import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronDown, Facebook, Instagram, Twitter } from 'lucide-react';

export default function MeetingsRightSidebar({ statsData, recentLogs }) {
  const target = statsData?.targets?.meeting || 0;
  const completed = statsData?.completed?.meeting || 0;
  const remaining = Math.max(target - completed, 0);

  const [meetingName, setMeetingName] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');

  const handleQuickInvite = () => {
    if (meetingName) {
      const subject = `Meeting Invite: ${meetingName}`;
      const body = `Hi,\n\nI would like to invite you to a meeting.\nDate: ${meetingDate}\nLocation/Link: ${meetingLocation}\n\nPlease confirm your availability.\n\nBest,`;
      const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(url, '_blank');
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

  const recentNotes = [
    { name: 'GreenLife Ayurveda', time: '11:20 AM', note: 'Discussed about new product range. Very interested in becoming our regional partner.' },
    { name: 'Wellness World', time: 'Yesterday', note: 'Demo scheduled. Sent product brochure.' },
  ];

  const dialpadButtons = [
    { main: '1', sub: '' }, { main: '2', sub: 'ABC' }, { main: '3', sub: 'DEF' },
    { main: '4', sub: 'GHI' }, { main: '5', sub: 'JKL' }, { main: '6', sub: 'MNO' },
    { main: '7', sub: 'PQRS' }, { main: '8', sub: 'TUV' }, { main: '9', sub: 'WXYZ' },
    { main: '*', sub: '' }, { main: '0', sub: '+' }, { main: '#', sub: '' },
  ];

  return (
    <div className="space-y-1">
      {/* This Month's Meetings Target */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-3">
        <h3 className="text-[16px] font-medium text-[#0F172A] mb-1">This Month's Meetings Target</h3>
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

      {/* Pending Invites */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-2 px-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[15px] font-medium text-[#0F172A]">Pending Invites</h3>
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

      {/* Quick Invite */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-3">
        <h3 className="text-[16px] font-medium text-[#0F172A] mb-2">Quick Invite</h3>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Attendee Name or Email"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-3 text-[12px] focus:outline-none focus:border-indigo-500 bg-slate-50"
          />
          <input
            type="datetime-local"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-3 text-[12px] focus:outline-none focus:border-indigo-500 bg-slate-50 text-slate-500"
          />
          <input
            type="text"
            placeholder="Meeting Link or Location"
            value={meetingLocation}
            onChange={(e) => setMeetingLocation(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-3 text-[12px] focus:outline-none focus:border-indigo-500 bg-slate-50"
          />
          <button onClick={handleQuickInvite} className="w-full h-11 bg-[#5E5E81] hover:bg-[#4B4B67] rounded-lg flex items-center justify-center text-white transition-colors gap-2 text-[13px] font-medium mt-1">
            <Calendar size={14} />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="bg-white rounded-xl border border-[#EDF0F7] p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[14px] font-medium text-[#0F172A]">Recent Meetings</h3>
          <button className="text-[12px] font-medium text-slate-600 hover:text-slate-900">View all</button>
        </div>
        <div className="space-y-2">
          {(recentLogs && recentLogs.length > 0 ? recentLogs : recentNotes).map((note, index, arr) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
