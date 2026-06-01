import React from 'react';
import { PhoneCall, PhoneMissed, PhoneForwarded, Clock } from 'lucide-react';

export default function WhatsAppSummaryCards() {
  const stats = [
    {
      title: "Total Messages",
      value: "28",
      growth: "↑ 18% vs yesterday",
      icon: PhoneCall,
      cardBg: "bg-[#F2FCF5]",
      iconBg: "bg-[#E3F8EB]",
      color: "text-[#16A34A]",
      growthColor: "text-[#16A34A]",
    },
    {
      title: "Pending Replies",
      value: "11",
      growth: "View all",
      icon: Clock,
      cardBg: "bg-[#FFF8EE]",
      iconBg: "bg-[#FFEED5]",
      color: "text-[#F59E0B]",
      growthColor: "text-[#F59E0B]",
    },
    {
      title: "Unread Messages",
      value: "05",
      growth: "View all",
      icon: PhoneMissed,
      cardBg: "bg-[#FEF2F2]",
      iconBg: "bg-[#FEE2E2]",
      color: "text-[#EF4444]",
      growthColor: "text-[#EF4444]",
    },
    {
      title: "Delivered",
      value: "17",
      growth: "↑ 12% vs yesterday",
      icon: PhoneForwarded,
      cardBg: "bg-[#EFF6FF]",
      iconBg: "bg-[#DBEAFE]",
      color: "text-[#3B82F6]",
      growthColor: "text-[#16A34A]", // green growth text for connected calls
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-1">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`${item.cardBg} rounded-xl px-3 py-2 border border-slate-100 shadow-sm relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#475569]">
                {item.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={16} strokeWidth={2.5} className={item.color} />
              </div>
              <div className="flex flex-col">
                <span className="text-[20px] font-medium text-[#0F172A] leading-none mb-1">
                  {item.value}
                </span>
                <span className={`text-[10px] font-medium ${item.growthColor} ${item.growth === 'View all' ? 'cursor-pointer hover:underline' : ''}`}>
                  {item.growth}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
