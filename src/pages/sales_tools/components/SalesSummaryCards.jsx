import React from 'react';
import { FileText, Send, Hourglass, CheckCircle2, TrendingUp } from 'lucide-react';

export default function SalesSummaryCards() {
  const stats = [
    {
      title: "Total Proposals",
      value: "36",
      growth: "↑ 20% vs last month",
      icon: FileText,
      cardBg: "bg-[#F2FCF5]",
      iconBg: "bg-[#E3F8EB]",
      color: "text-[#16A34A]",
      growthColor: "text-[#16A34A]",
    },
    {
      title: "Sent Proposals",
      value: "22",
      growth: "61% of total",
      icon: Send,
      cardBg: "bg-[#F8F4FF]",
      iconBg: "bg-[#EFE8FF]",
      color: "text-[#9333EA]",
      growthColor: "text-[#9333EA]",
    },
    {
      title: "Pending Proposals",
      value: "10",
      growth: "28% of total",
      icon: Hourglass,
      cardBg: "bg-[#FFF8EE]",
      iconBg: "bg-[#FFEED5]",
      color: "text-[#F59E0B]",
      growthColor: "text-[#F59E0B]",
    },
    {
      title: "Accepted Proposals",
      value: "04",
      growth: "11% of total",
      icon: CheckCircle2,
      cardBg: "bg-[#F2FBFF]",
      iconBg: "bg-[#E2F5FF]",
      color: "text-[#2563EB]",
      growthColor: "text-[#2563EB]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-1">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`${item.cardBg} rounded-xl px-4 py-1 border border-slate-100 shadow-sm relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-bold text-[#475569]">
                {item.title}
              </span>
              <Icon size={18} strokeWidth={2.5} className={item.color} />
            </div>
            <div className="flex flex-col">
              <span className="text-[24px] font-bold text-[#0F172A] leading-none mb-1">
                {item.value}
              </span>
              <span className={`text-[11px] font-bold ${item.growthColor}`}>
                {item.growth}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
