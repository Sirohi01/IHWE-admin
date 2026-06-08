import React from 'react';
import { FileText, Send, Hourglass, CheckCircle2, TrendingUp, Users, UserCheck, UserX, UserPlus } from 'lucide-react';

export default function SalesSummaryCards({ data = [], loading = false, leadsData = [], leadsLoading = false, currentTab = 'proposals' }) {
  
  if (currentTab === 'lead-assignment') {
    const totalLeads = leadsData.length;
    let assignedLeads = 0;
    let unassignedLeads = 0;
    let newLeads = 0;

    leadsData.forEach(item => {
      if (item.forwardTo) {
        assignedLeads++;
      } else {
        unassignedLeads++;
      }
      if (item.companyStatus === 'New Lead') {
        newLeads++;
      }
    });

    const getLeadsPercentage = (count) => totalLeads === 0 ? "0%" : `${Math.round((count / totalLeads) * 100)}% of total`;

    const leadStats = [
      {
        title: "Total Leads",
        value: leadsLoading ? "..." : totalLeads.toString(),
        growth: "All time",
        icon: Users,
        cardBg: "bg-[#F2FCF5]",
        iconBg: "bg-[#E3F8EB]",
        color: "text-[#16A34A]",
        growthColor: "text-[#16A34A]",
      },
      {
        title: "New Leads",
        value: leadsLoading ? "..." : newLeads.toString(),
        growth: leadsLoading ? "..." : getLeadsPercentage(newLeads),
        icon: UserPlus,
        cardBg: "bg-[#F8F4FF]",
        iconBg: "bg-[#EFE8FF]",
        color: "text-[#9333EA]",
        growthColor: "text-[#9333EA]",
      },
      {
        title: "Assigned Leads",
        value: leadsLoading ? "..." : assignedLeads.toString(),
        growth: leadsLoading ? "..." : getLeadsPercentage(assignedLeads),
        icon: UserCheck,
        cardBg: "bg-[#F2FBFF]",
        iconBg: "bg-[#E2F5FF]",
        color: "text-[#2563EB]",
        growthColor: "text-[#2563EB]",
      },
      {
        title: "Unassigned Leads",
        value: leadsLoading ? "..." : unassignedLeads.toString(),
        growth: leadsLoading ? "..." : getLeadsPercentage(unassignedLeads),
        icon: UserX,
        cardBg: "bg-[#FFF8EE]",
        iconBg: "bg-[#FFEED5]",
        color: "text-[#F59E0B]",
        growthColor: "text-[#F59E0B]",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-1">
        {leadStats.map((item, index) => {
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

  // Logic for Proposals & Quotations
  const isQuotation = currentTab === 'quotations';
  const label = isQuotation ? 'Quotations' : 'Proposals';
  
  const total = data.length;
  let acceptedCount = 0;
  let sentCount = 0;
  let pendingCount = 0;

  data.forEach(item => {
    if (item.invoice && item.invoice.length > 0) {
      acceptedCount++;
    } else if (item.performaInvoice && item.performaInvoice.length > 0) {
      sentCount++;
    } else {
      pendingCount++;
    }
  });

  const getPercentage = (count) => total === 0 ? "0%" : `${Math.round((count / total) * 100)}% of total`;

  const stats = [
    {
      title: `Total ${label}`,
      value: loading ? "..." : total.toString(),
      growth: "All time",
      icon: FileText,
      cardBg: "bg-[#F2FCF5]",
      iconBg: "bg-[#E3F8EB]",
      color: "text-[#16A34A]",
      growthColor: "text-[#16A34A]",
    },
    {
      title: `Sent ${label}`,
      value: loading ? "..." : sentCount.toString(),
      growth: loading ? "..." : getPercentage(sentCount),
      icon: Send,
      cardBg: "bg-[#F8F4FF]",
      iconBg: "bg-[#EFE8FF]",
      color: "text-[#9333EA]",
      growthColor: "text-[#9333EA]",
    },
    {
      title: `Pending ${label}`,
      value: loading ? "..." : pendingCount.toString(),
      growth: loading ? "..." : getPercentage(pendingCount),
      icon: Hourglass,
      cardBg: "bg-[#FFF8EE]",
      iconBg: "bg-[#FFEED5]",
      color: "text-[#F59E0B]",
      growthColor: "text-[#F59E0B]",
    },
    {
      title: `Accepted ${label}`,
      value: loading ? "..." : acceptedCount.toString(),
      growth: loading ? "..." : getPercentage(acceptedCount),
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
