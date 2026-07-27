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
        cardBg: "bg-gradient-to-br from-white from-50% to-emerald-50",
        iconBg: "bg-emerald-100",
        color: "text-emerald-600",
        growthColor: "text-emerald-600",
      },
      {
        title: "New Leads",
        value: leadsLoading ? "..." : newLeads.toString(),
        growth: leadsLoading ? "..." : getLeadsPercentage(newLeads),
        icon: UserPlus,
        cardBg: "bg-gradient-to-br from-white from-50% to-indigo-50",
        iconBg: "bg-indigo-100",
        color: "text-indigo-600",
        growthColor: "text-indigo-600",
      },
      {
        title: "Assigned Leads",
        value: leadsLoading ? "..." : assignedLeads.toString(),
        growth: leadsLoading ? "..." : getLeadsPercentage(assignedLeads),
        icon: UserCheck,
        cardBg: "bg-gradient-to-br from-white from-50% to-blue-50",
        iconBg: "bg-blue-100",
        color: "text-blue-600",
        growthColor: "text-blue-600",
      },
      {
        title: "Unassigned Leads",
        value: leadsLoading ? "..." : unassignedLeads.toString(),
        growth: leadsLoading ? "..." : getLeadsPercentage(unassignedLeads),
        icon: UserX,
        cardBg: "bg-gradient-to-br from-white from-50% to-rose-50",
        iconBg: "bg-rose-100",
        color: "text-rose-600",
        growthColor: "text-rose-600",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-1">
        {leadStats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`group relative ${item.cardBg} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}
            >
              <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                      <div
                          className={`w-10 h-10 ${item.iconBg} rounded-full flex items-center justify-center shrink-0`}
                      >
                          <Icon className={`w-5 h-5 ${item.color}`} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                          <p className="text-xl font-extrabold text-slate-900 leading-none mb-1">
                              {item.value}
                          </p>
                          <p className="text-[9px] font-extrabold text-slate-700 leading-tight uppercase whitespace-nowrap truncate">
                              {item.title}
                          </p>
                      </div>
                  </div>
                  <div className={`text-[10px] font-bold mt-2 ${item.growthColor} text-center`}>
                      {item.growth}
                  </div>
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
      cardBg: "bg-gradient-to-br from-white from-50% to-emerald-50",
      iconBg: "bg-emerald-100",
      color: "text-emerald-600",
      growthColor: "text-emerald-600",
    },
    {
      title: `Sent ${label}`,
      value: loading ? "..." : sentCount.toString(),
      growth: loading ? "..." : getPercentage(sentCount),
      icon: Send,
      cardBg: "bg-gradient-to-br from-white from-50% to-indigo-50",
      iconBg: "bg-indigo-100",
      color: "text-indigo-600",
      growthColor: "text-indigo-600",
    },
    {
      title: `Pending ${label}`,
      value: loading ? "..." : pendingCount.toString(),
      growth: loading ? "..." : getPercentage(pendingCount),
      icon: Hourglass,
      cardBg: "bg-gradient-to-br from-white from-50% to-rose-50",
      iconBg: "bg-rose-100",
      color: "text-rose-600",
      growthColor: "text-rose-600",
    },
    {
      title: `Accepted ${label}`,
      value: loading ? "..." : acceptedCount.toString(),
      growth: loading ? "..." : getPercentage(acceptedCount),
      icon: CheckCircle2,
      cardBg: "bg-gradient-to-br from-white from-50% to-blue-50",
      iconBg: "bg-blue-100",
      color: "text-blue-600",
      growthColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-1">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`group relative ${item.cardBg} p-4 border border-slate-200 rounded-2xl transition-all duration-500 shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden`}
          >
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className={`w-10 h-10 ${item.iconBg} rounded-full flex items-center justify-center shrink-0`}
                    >
                        <Icon className={`w-5 h-5 ${item.color}`} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl font-extrabold text-slate-900 leading-none mb-1">
                            {item.value}
                        </p>
                        <p className="text-[9px] font-extrabold text-slate-700 leading-tight uppercase whitespace-nowrap truncate">
                            {item.title}
                        </p>
                    </div>
                </div>
                <div className={`text-[10px] font-bold mt-2 ${item.growthColor} text-center`}>
                    {item.growth}
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
