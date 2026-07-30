import { useState, useEffect } from 'react';
import api from '../lib/api';

const useDashboardStats = (filterStatus, customData = null, eventId = '') => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    todaysLeads: 0,
    thisWeekLeads: 0,
    thisMonthLeads: 0,
    followUpsDueThisWeek: 0,
    followUpsDueThisMonth: 0,
    pendingFollowUpsCount: 0,
    followUps: [],
    sourceChartData: [],
    statusChartData: [],
    recentActivities: [],
    topExecutives: [],
    isLoadingStats: false
  });

  useEffect(() => {
    let isMounted = true;

    const calculateStats = (data) => {
      // Filter data if a status is provided, unless it's Master (no filter needed)
      const filteredData = filterStatus
        ? data.filter(item => {
            const status = (item.companyStatus || item.status || 'New').toLowerCase();
            if (Array.isArray(filterStatus)) {
                return filterStatus.some(f => status.includes(f.toLowerCase()));
            }
            return status.includes(filterStatus.toLowerCase());
          })
        : data;

      const totalLeads = filteredData.length;
      
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let todaysLeads = 0;
      let thisWeekLeads = 0;
      let thisMonthLeads = 0;
      let pendingFollowUpsCount = 0;
      let followUpsDueThisMonth = 0;

      const sourceStats = {};
      const statusStats = {};
      const execStats = {};
      const holdReasonStats = {};
      const lostReasonStats = {};

      const followUpsRaw = [];
      const recentActivitiesRaw = [];

      filteredData.forEach(c => {
        const createdAt = new Date(c.createdAt || c.added);
        if (createdAt >= startOfToday) todaysLeads++;
        if (createdAt >= startOfWeek) thisWeekLeads++;
        if (createdAt >= startOfMonth) thisMonthLeads++;

        const status = c.companyStatus || c.status || 'New';
        
        if (c.reminder || status.toLowerCase().includes('follow')) {
           pendingFollowUpsCount++;
           if (c.reminder) {
               const reminderDate = new Date(c.reminder);
               followUpsRaw.push({
                   name: c.companyName || c.exhibitorName,
                   date: reminderDate.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }),
                   rawDate: reminderDate,
                   type: 'System', 
                   iconBg: "bg-blue-50 text-blue-600",
                   tagBg: "bg-blue-50 text-blue-600"
               });
           }
        }

        const source = c.dataSource || c.referredBy || 'Direct';
        sourceStats[source] = (sourceStats[source] || 0) + 1;

        statusStats[status] = (statusStats[status] || 0) + 1;

        const forwardTo = c.forwardTo || 'Unassigned';
        if (forwardTo !== 'Unassigned') {
            execStats[forwardTo] = (execStats[forwardTo] || 0) + 1;
        }

        if (status.toLowerCase().includes('hold') && c.reason) {
            holdReasonStats[c.reason] = (holdReasonStats[c.reason] || 0) + 1;
        }
        
        if (status.toLowerCase().includes('lost') && c.reason) {
            lostReasonStats[c.reason] = (lostReasonStats[c.reason] || 0) + 1;
        }

        if (c.updatedAt) {
            recentActivitiesRaw.push({
                name: c.companyName || c.exhibitorName,
                updatedAt: new Date(c.updatedAt)
            });
        }
      });

      // Follow-up specific calculations
      let dueToday = 0;
      let dueTomorrow = 0;
      let dueThisWeek = 0;
      let overdue = 0;
      const overdueList = [];
      const tomorrow = new Date(startOfToday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startOfNextWeek = new Date(startOfWeek);
      startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      followUpsRaw.forEach(fu => {
          const rDate = fu.rawDate;
          if (rDate >= startOfMonth && rDate < startOfNextMonth) {
              followUpsDueThisMonth++;
          }
          if (rDate < startOfToday) {
              overdue++;
              const diffTime = Math.abs(startOfToday - rDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              overdueList.push({
                  company: fu.name,
                  date: rDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                  days: `${diffDays} day${diffDays > 1 ? 's' : ''} overdue`,
                  rawDate: rDate
              });
          } else if (rDate >= startOfToday && rDate < tomorrow) {
              dueToday++;
              dueThisWeek++;
          } else if (rDate >= tomorrow && rDate < new Date(tomorrow.getTime() + 86400000)) {
              dueTomorrow++;
              dueThisWeek++;
          } else if (rDate >= startOfWeek && rDate < startOfNextWeek) {
              dueThisWeek++;
          }
      });
      
      const totalOverview = dueToday + dueTomorrow + dueThisWeek + overdue;
      const overviewData = [
          { name: "Due Today", value: dueToday, percentage: totalOverview > 0 ? Math.round((dueToday/totalOverview)*100) + "%" : "0%", color: "#FF7A1A" },
          { name: "Due Tomorrow", value: dueTomorrow, percentage: totalOverview > 0 ? Math.round((dueTomorrow/totalOverview)*100) + "%" : "0%", color: "#FACC15" },
          { name: "Due This Week", value: dueThisWeek, percentage: totalOverview > 0 ? Math.round((dueThisWeek/totalOverview)*100) + "%" : "0%", color: "#3B82F6" },
          { name: "Overdue", value: overdue, percentage: totalOverview > 0 ? Math.round((overdue/totalOverview)*100) + "%" : "0%", color: "#EF4444" },
      ];
      const overdueLeads = overdueList.sort((a,b) => a.rawDate - b.rawDate).slice(0, 5);

      const sourceChartData = Object.keys(sourceStats)
        .map((label, idx) => ({
          label,
          count: sourceStats[label],
          pct: totalLeads > 0 ? Math.round((sourceStats[label] / totalLeads) * 100) + '%' : '0%',
          color: ['bg-sky-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-slate-400'][idx % 5]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const statusChartData = Object.keys(statusStats)
        .map((label, idx) => ({
          label,
          count: statusStats[label],
          pct: totalLeads > 0 ? Math.round((statusStats[label] / totalLeads) * 100) + '%' : '0%',
          color: ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500'][idx % 5]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topExecutives = Object.keys(execStats)
        .map((name, idx) => ({
          name,
          init: name.substring(0, 2).toUpperCase(),
          count: execStats[name],
          color: ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500'][idx % 3]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const followUps = followUpsRaw.sort((a, b) => a.rawDate - b.rawDate).slice(0, 5);
      
      const holdTotal = Object.values(holdReasonStats).reduce((a,b) => a+b, 0);
      const holdReasonsData = Object.keys(holdReasonStats)
        .map((label, idx) => ({
          label,
          count: holdReasonStats[label],
          pct: holdTotal > 0 ? Math.round((holdReasonStats[label] / holdTotal) * 100) + '%' : '0%',
          color: ['bg-orange-500', 'bg-orange-400', 'bg-orange-300', 'bg-orange-200', 'bg-orange-600'][idx % 5]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const lostTotal = Object.values(lostReasonStats).reduce((a,b) => a+b, 0);
      const lostReasonsData = Object.keys(lostReasonStats)
        .map((label, idx) => ({
          label,
          count: lostReasonStats[label],
          pct: lostTotal > 0 ? Math.round((lostReasonStats[label] / lostTotal) * 100) + '%' : '0%',
          color: ['bg-red-600', 'bg-red-500', 'bg-red-400', 'bg-red-300', 'bg-red-700'][idx % 5]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const recentActivities = recentActivitiesRaw
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 3)
        .map(c => ({
            bg: "bg-emerald-50 border-emerald-100",
            text: `Updated ${c.name}`,
            date: c.updatedAt.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
        }));

      if (isMounted) {
          setStats({
            totalLeads,
            todaysLeads,
            thisWeekLeads,
            thisMonthLeads,
            followUpsDueThisWeek: dueThisWeek,
            followUpsDueThisMonth,
            pendingFollowUpsCount,
            followUps,
            overviewData,
            overdueLeads,
            sourceChartData,
            statusChartData,
            statusStats,
            recentActivities,
            topExecutives,
            holdReasonsData,
            lostReasonsData,
            isLoadingStats: false
          });
      }
    };

    if (customData) {
        calculateStats(customData);
    } else {
        setStats(prev => ({ ...prev, isLoadingStats: true }));
        // Scope the raw-doc fetch to the same status/event as the list it backs
        // (e.g. New Leads only wants companyStatus "New Lead" for the current
        // event) instead of pulling the top 3000 rows across every status/event —
        // that mismatch was the main source of the New Leads page's slow load.
        const params = new URLSearchParams({
            dashboard: 'true',
            ...(eventId && { eventId }),
            ...(filterStatus && { status: Array.isArray(filterStatus) ? filterStatus.join(',') : filterStatus }),
        });

        // The raw-doc fetch above is capped at 3000 rows (fine for the
        // secondary charts — source breakdown, top executives, follow-ups —
        // which only ever show a top-N sample anyway). But the headline
        // "Total Leads" + per-status card counts must be exact even once the
        // collection grows past that cap, so always also pull the accurate
        // aggregated totals (scoped to the same status filter, if any) and
        // use those instead — this is what every list page's stat cards read.
        const summaryParams = new URLSearchParams({
            ...(eventId && { eventId }),
            ...(filterStatus && { status: Array.isArray(filterStatus) ? filterStatus.join(',') : filterStatus }),
        });
        const statsSummaryPromise = api.get(`/api/companies/stats-summary?${summaryParams}`).catch(() => null);

        Promise.all([api.get(`/api/companies?${params}`), statsSummaryPromise])
            .then(([res, summaryRes]) => {
                calculateStats(res.data);
                if (summaryRes?.data?.success && isMounted) {
                    setStats(prev => ({
                        ...prev,
                        totalLeads: summaryRes.data.total,
                        statusStats: summaryRes.data.statusCounts,
                    }));
                }
            })
            .catch(err => {
                console.error("Error fetching dashboard stats:", err);
                if (isMounted) setStats(prev => ({ ...prev, isLoadingStats: false }));
            });
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filterStatus), customData, eventId]);

  return stats;
};

export default useDashboardStats;
