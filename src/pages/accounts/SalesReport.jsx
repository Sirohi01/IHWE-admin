import React, { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  Bell,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  IndianRupee,
  Target,
  ClipboardList,
  BarChart3,
  ChevronDown,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
const SalesReport = () => {
  const [search, setSearch] = useState("");
  const stats = [
    {
      title: "Total Leads",
      value: "512",
      growth: "18.6%",
      icon: TrendingUp,
      cardBg: "bg-[#F2FBF5]",
      iconBg: "bg-[#E3F6E9]",
      color: "text-[#16A34A]",
    },
    {
      title: "Total Conversions",
      value: "82",
      growth: "14.2%",
      icon: Users,
      cardBg: "bg-[#F4F8FF]",
      iconBg: "bg-[#E8F0FF]",
      color: "text-[#3B82F6]",
    },
    {
      title: "Total Revenue",
      value: "₹ 24,75,000",
      growth: "22.8%",
      icon: IndianRupee,
      cardBg: "bg-[#FCF6FF]",
      iconBg: "bg-[#F3E8FF]",
      color: "text-[#9333EA]",
    },
    {
      title: "Conversion Rate",
      value: "16.0%",
      growth: "2.1%",
      icon: Target,
      cardBg: "bg-[#FFF9EF]",
      iconBg: "bg-[#FFF1D6]",
      color: "text-[#F59E0B]",
    },
    {
      title: "Avg. Deal Value",
      value: "₹ 30,183",
      growth: "12.3%",
      icon: ClipboardList,
      cardBg: "bg-[#F2FCFA]",
      iconBg: "bg-[#E2F7F2]",
      color: "text-[#0F9D8A]",
    },
  ];
  const trendData = [
    { date: "01 May", leads: 50, conversion: 25 },
    { date: "05 May", leads: 120, conversion: 70 },
    { date: "09 May", leads: 90, conversion: 50 },
    { date: "13 May", leads: 160, conversion: 90 },
    { date: "17 May", leads: 100, conversion: 45 },
    { date: "21 May", leads: 185, conversion: 105 },
    { date: "25 May", leads: 110, conversion: 42 },
    { date: "29 May", leads: 200, conversion: 115 },
    { date: "31 May", leads: 160, conversion: 82 }
  ];

  const sourceData = [
    {
      name: "Website",
      value: 162,
      percentage: "31.6%",
      color: "#0F9D9A",
    },
    {
      name: "Referral",
      value: 138,
      percentage: "27.0%",
      color: "#1976D2",
    },
    {
      name: "Exhibition / Event",
      value: 96,
      percentage: "18.8%",
      color: "#FFA000",
    },
    {
      name: "Social Media",
      value: 62,
      percentage: "12.1%",
      color: "#FF5252",
    },
    {
      name: "Email Campaign",
      value: 38,
      percentage: "7.4%",
      color: "#AB47BC",
    },
    {
      name: "Others",
      value: 16,
      percentage: "3.1%",
      color: "#5C6BC0",
    },
  ];

  const sourceRevenue = [
    {
      source: "Website",
      leads: 162,
      converted: 28,
      rate: "17.28%",
      revenue: "8,45,000",
      progress: 100,
    },
    {
      source: "Referral",
      leads: 138,
      converted: 24,
      rate: "17.39%",
      revenue: "6,75,000",
      progress: 80,
    },
    {
      source: "Exhibition / Event",
      leads: 96,
      converted: 15,
      rate: "15.63%",
      revenue: "4,25,000",
      progress: 55,
    },
    {
      source: "Social Media",
      leads: 62,
      converted: 9,
      rate: "14.52%",
      revenue: "2,35,000",
      progress: 35,
    },
    {
      source: "Email Campaign",
      leads: 38,
      converted: 4,
      rate: "10.53%",
      revenue: "1,35,000",
      progress: 20,
    },
    {
      source: "Others",
      leads: 16,
      converted: 2,
      rate: "12.50%",
      revenue: "60,000",
      progress: 10,
    },
  ];
  const statusData = [
    {
      label: "New Leads",
      value: 512,
      color: "#14B8D4",
      top: 140,
      bottom: 115,
    },
    {
      label: "In Discussion",
      value: 238,
      color: "#59C3C3",
      top: 115,
      bottom: 90,
    },
    {
      label: "Proposal Sent",
      value: 132,
      color: "#F5C542",
      top: 90,
      bottom: 65,
    },
    {
      label: "Negotiation",
      value: 68,
      color: "#FF5B5B",
      top: 65,
      bottom: 35,
    },
    {
      label: "Converted",
      value: 82,
      color: "#6D5BAF",
      top: 35,
      bottom: 35,
    },
  ];
  const revenueData = [
    { day: "01 May", value: 5 },
    { day: "03 May", value: 4.2 },
    { day: "05 May", value: 6.5 },
    { day: "07 May", value: 4.8 },
    { day: "09 May", value: 7.9 },
    { day: "11 May", value: 6.1 },
    { day: "13 May", value: 10.5 },
    { day: "15 May", value: 6.7 },
    { day: "17 May", value: 7.1 },
    { day: "19 May", value: 9.8 },
    { day: "21 May", value: 5.2 },
    { day: "23 May", value: 5.3 },
    { day: "25 May", value: 9.1 },
    { day: "27 May", value: 10.4 },
    { day: "29 May", value: 13.8 },
    { day: "31 May", value: 14.2 },
  ];

  const executives = [
    {
      rank: 1,
      initials: "VS",
      color: "#F59E0B",
      name: "Vijay Sharma",
      leads: 148,
      conversions: 28,
      rate: "18.92%",
      revenue: "8,45,000",
    },
    {
      rank: 2,
      initials: "AV",
      color: "#3B82F6",
      name: "Amit Verma",
      leads: 132,
      conversions: 22,
      rate: "16.67%",
      revenue: "6,50,000",
    },
    {
      rank: 3,
      initials: "NT",
      color: "#8B5CF6",
      name: "Neha Tiwari",
      leads: 108,
      conversions: 17,
      rate: "15.74%",
      revenue: "4,75,000",
    },
    {
      rank: 4,
      initials: "PS",
      color: "#94A3B8",
      name: "Priya Singh",
      leads: 72,
      conversions: 11,
      rate: "15.28%",
      revenue: "2,70,000",
    },
    {
      rank: 5,
      initials: "RK",
      color: "#94A3B8",
      name: "Rohit Kumar",
      leads: 52,
      conversions: 4,
      rate: "7.69%",
      revenue: "1,35,000",
    },
  ];
  return (
    <div className="min-h-screen bg-[#f7f8fc] p-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="relative w-[420px]">
          <div className="mb-3">

            <h1 className="text-[24px] font-bold text-[#0F172A]">
              Reports
            </h1>

            <p className="text-gray-500">
              Track performance and analyze business insights
            </p>

          </div>

        </div>

        <div className="flex gap-3">

          <button className="h-11 px-5 bg-green-600 text-white rounded-xl flex items-center gap-2">
            <Plus size={18} />
            Add Lead
          </button>

          <button className="h-11 px-5 bg-white border rounded-xl flex items-center gap-2">
            <Upload size={18} />
            Import Leads
          </button>

        </div>

      </div>

      {/* Title */}



      {/* Tabs */}

      <div className="flex items-center justify-between border-b border-[#E5E7EB] mb-6">

        {/* Left Tabs */}
        <div className="flex items-center gap-8">

          <button
            className="
        flex items-center gap-2
        pb-4
        border-b-2 border-[#16A34A]
        text-[#16A34A]
        font-semibold
        text-[14px]
        px-3
      "
          >
            <BarChart3 size={18} />
            <span>Sales Analytics</span>
          </button>

          <button
            className="
        flex items-center gap-2
        px-3
        pb-4
        text-[#475569]
        font-medium
        text-[14px]
      "
          >
            <ClipboardList size={18} />
            <span>Performance Report</span>
          </button>

        </div>

        {/* Right Filters */}
        <div className="flex items-center gap-3 pb-1">

          <button
            className="
        h-12
        px-4
        bg-white
        border border-[#E5E7EB]
        rounded-lg
        flex items-center gap-2
        text-[12px]
        font-medium
      "
          >
            <Calendar size={16} />
            <span>This Month</span>
            <ChevronDown size={14} />
          </button>

          <button
            className="
        h-12
        px-4
        bg-white
        border border-[#E5E7EB]
        rounded-lg
        flex items-center gap-2
        text-[12px]
        font-medium
      "
          >
            <Filter size={16} />
            <span>Filters</span>
            <ChevronDown size={14} />
          </button>

        </div>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className={`
            ${item.cardBg}
            bg-gradient-to-r
            from-white/40
            to-transparent
            border border-[#EDF0F7]
            rounded-xl
            px-5
            h-[100px]
            flex items-center gap-4
          `}
            >
              <div
                className={`
            ${item.iconBg}
            w-[54px]
            h-[54px]
            rounded-full
            flex
            items-center
            justify-center
          `}
              >
                <Icon
                  size={24}
                  strokeWidth={2}
                  className={item.color}
                />
              </div>

              <div>
                <p className="text-[12px] font-semibold text-[#0F172A]">
                  {item.title}
                </p>

                <h3 className="text-[16px] font-bold text-[#0F172A] mt-1">
                  {item.value}
                </h3>

                <p className="text-[11px] font-medium text-[#16A34A] mt-1">
                  ↑ {item.growth} vs last month
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}

      <div className="grid grid-cols-12 gap-5 mb-5">

        <div className="col-span-7 space-y-5">
          <div className="bg-white rounded-[10px] border border-[#EDF0F7] p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">

              <div>
                <h3 className="text-[18px] font-semibold text-[#0F172A]">
                  Leads & Conversions Trend
                </h3>

                {/* Legend */}
                <div className="flex items-center gap-8 mt-4">

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-[3px] bg-[#16A34A] rounded-full" />
                    <span className="text-[12px] text-[#475569] font-medium">
                      Leads
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-[3px] bg-[#2563EB] rounded-full" />
                    <span className="text-[12px] text-[#475569] font-medium">
                      Conversions
                    </span>
                  </div>

                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">

                <button
                  className="
          h-9
          px-4
          border border-[#E5E7EB]
          rounded-lg
          bg-white
          flex items-center gap-2
          text-[12px]
          font-medium
          text-[#0F172A]
        "
                >
                  Daily
                  <ChevronDown size={14} />
                </button>

                <button
                  className="
          w-9 h-9
          border border-[#E5E7EB]
          rounded-lg
          flex items-center justify-center
          bg-white
        "
                >
                  <TrendingUp size={16} />
                </button>

                <button
                  className="
          w-9 h-9
          border border-[#E5E7EB]
          rounded-lg
          flex items-center justify-center
          bg-white
        "
                >
                  <BarChart3 size={16} />
                </button>

              </div>

            </div>

            {/* Chart */}

            <ResponsiveContainer width="100%" height={200}>

              <ComposedChart
                data={trendData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  stroke="#EEF2F7"
                  vertical={false}
                  strokeDasharray="0"
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "10px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  }}
                />

                {/* Green Area */}
                <Area
                  type="linear"
                  dataKey="leads"
                  fill="#16A34A"
                  fillOpacity={0.08}
                  stroke="none"
                />

                {/* Blue Area */}
                <Area
                  type="linear"
                  dataKey="conversion"
                  fill="#2563EB"
                  fillOpacity={0.08}
                  stroke="none"
                />

                {/* Leads Line */}
                <Line
                  type="linear"
                  dataKey="leads"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={{
                    r: 2,
                    fill: "#16A34A",
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />

                {/* Conversion Line */}
                <Line
                  type="linear"
                  dataKey="conversion"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{
                    r: 2,
                    fill: "#2563EB",
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />

              </ComposedChart>

            </ResponsiveContainer>
          </div>
          {/*2nd -------------------------------------------------------------------------- */}
          <div className="bg-white rounded-[10px] border border-[#EDF0F7] overflow-hidden">

            <h3 className="px-4 py-2 text-[16px] font-semibold text-[#0F172A]">
              Leads & Revenue by Source
            </h3>

            <table className="w-full table-fixed">

              <thead className="bg-[#F8FAFC] border-y border-[#EDF0F7]">

                <tr>

                  <th className="w-[26%] text-left pl-4 py-3 text-[12px] font-semibold">
                    Source
                  </th>

                  <th className="w-[12%] text-center text-[12px] font-semibold">
                    Total Leads
                  </th>

                  <th className="w-[15%] text-center text-[12px] font-semibold">
                    Converted Leads
                  </th>

                  <th className="w-[15%] text-center text-[12px] font-semibold">
                    Conversion Rate
                  </th>

                  <th className="w-[32%] text-left pl-4 text-[12px] font-semibold">
                    Revenue (₹)
                  </th>

                </tr>

              </thead>

              <tbody>

                {sourceRevenue.map((row, index) => (

                  <tr
                    key={index}
                    className="border-b border-[#F1F5F9]"
                  >

                    <td className="pl-3 py-1 text-[12px] font-medium">
                      {row.source}
                    </td>

                    <td className="text-center text-[12px]">
                      {row.leads}
                    </td>

                    <td className="text-center text-[12px]">
                      {row.converted}
                    </td>

                    <td className="text-center text-[12px]">
                      {row.rate}
                    </td>

                    <td className="px-4">

                      <div className="flex items-center gap-3">

                        {/* Progress Bar */}
                        <div className="flex-1 min-w-[120px] h-[8px] bg-[#EAEFF5] rounded-full overflow-hidden">

                          <div
                            className="h-full bg-[#16A34A] rounded-full"
                            style={{
                              width: `${row.progress}%`,
                            }}
                          />

                        </div>

                        {/* Amount */}
                        <span className="w-[80px] text-right text-[12px] font-medium whitespace-nowrap">
                          {row.revenue}
                        </span>

                      </div>

                    </td>

                  </tr>

                ))}

                {/* Footer Total */}

                <tr className="bg-[#F8FAFC] font-semibold">

                  <td className="pl-3 py-3">
                    Total
                  </td>

                  <td className="text-center">
                    512
                  </td>

                  <td className="text-center">
                    82
                  </td>

                  <td className="text-center">
                    16.02%
                  </td>

                  <td className="text-right px-2">
                    24,75,000
                  </td>

                </tr>

              </tbody>

            </table>

          </div>
          {/*3rd -------------------------------------------------------------------------- */}
                <div className="bg-white rounded-[10px] border border-[#EDF0F7] p-5">

    <h3 className="text-[18px] font-semibold text-[#0F172A] mb-4">
      Revenue Trend
    </h3>

    <div className="grid grid-cols-12 gap-4">

      {/* Chart */}

      <div className="col-span-8">

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={revenueData}>

            <defs>
              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#16A34A"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="#16A34A"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />

            <Tooltip />

            <Area
              type="linear"
              dataKey="value"
              stroke="#16A34A"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />

          </AreaChart>
        </ResponsiveContainer>

      </div>

      {/* Right Cards */}

      <div className="col-span-4 flex flex-col gap-3">

        <div className="border border-[#EDF0F7] rounded-xl p-4">

          <p className="text-[12px] text-[#64748B]">
            Total Revenue
          </p>

          <h4 className="text-[20px] font-bold text-[#0F172A]">
            ₹ 24,75,000
          </h4>

          <p className="text-[#16A34A] text-[12px] font-medium">
            ↑ 22.8% vs last month
          </p>

        </div>

        <div className="border border-[#EDF0F7] rounded-xl p-4">

          <p className="text-[12px] text-[#64748B]">
            This Month Target
          </p>

          <h4 className="text-[20px] font-bold text-[#0F172A]">
            ₹ 30,00,000
          </h4>

          <div className="mt-4 flex items-center gap-3">

            <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full">

              <div
                className="h-2 bg-[#16A34A] rounded-full"
                style={{ width: "82%" }}
              />

            </div>

            <span className="text-[12px] font-semibold">
              82%
            </span>

          </div>

        </div>

      </div>

    </div>

  </div>
          
        </div>
        <div className="col-span-5 space-y-5">
          <div className="bg-white rounded-[10px] border border-[#EDF0F7] p-5">
            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-6">
              Leads by Source
            </h3>

            <div className="flex items-center justify-between">

              {/* Donut Chart */}

              <div className="relative w-[190px] h-[190px]">

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>

                    <Pie
                      data={sourceData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={0}
                      stroke="none"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>

                  </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}

                <div className="absolute inset-0 flex flex-col items-center justify-center">

                  <h3 className="text-[24px] leading-none font-bold text-[#0F172A]">
                    512
                  </h3>

                  <p className="text-[13px] text-[#64748B] mt-1">
                    Total
                  </p>

                </div>

              </div>

              {/* Right Legend */}

              <div className="flex-1 pl-6">

                <div className="space-y-4">

                  {sourceData.map((item, index) => (

                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >

                      <div className="flex items-center gap-3">

                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: item.color,
                          }}
                        />

                        <span className="text-[13px] font-medium text-[#0F172A]">
                          {item.name}
                        </span>

                      </div>

                      <span className="text-[13px] font-semibold text-[#0F172A]">
                        {item.value} ({item.percentage})
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>
          </div>
          <div className="bg-white rounded-[10px] border border-[#EDF0F7] p-5">

            <h3 className="text-[16px] font-semibold text-[#0F172A] mb-6">
              Leads by Status
            </h3>

            <div className="flex items-center justify-between gap-8">

              {/* Funnel */}

              <div className="w-[170px] flex flex-col items-center mt-2">

                {statusData.map((item, index) => (
                  <div
                    key={index}
                    className="h-[24px]"
                    style={{
                      width: `${item.top}px`,
                      background: item.color,
                      clipPath: `polygon(
          ${(1 - item.bottom / item.top) * 50}% 100%,
          ${100 - (1 - item.bottom / item.top) * 50}% 100%,
          100% 0%,
          0% 0%
        )`,
                    }}
                  />
                ))}
              </div>

              {/* Legend */}

              <div className="flex-1">

                <div className="space-y-5">

                  {statusData.map((item, index) => (

                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >

                      <div className="flex items-center gap-3">

                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: item.color,
                          }}
                        />

                        <span className="text-[13px] font-medium text-[#0F172A]">
                          {item.label}
                        </span>

                      </div>

                      <span className="text-[13px] font-semibold text-[#0F172A]">
                        {item.value}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>
          <div className="bg-white rounded-[10px] border border-[#EDF0F7] overflow-hidden">

            <div className="px-4 py-2 pb-2">

              <h3 className="text-[16px] font-semibold text-[#0F172A]">
                Top Performing Sales Executives
              </h3>

            </div>

            <table className="w-full">

              <thead className="border-y border-[#EDF0F7] bg-[#F8FAFC]">

                <tr className="text-[12px]">

                  <th className="text-left pl-4 py-3">
                    Sales Executive
                  </th>

                  <th>Total Leads</th>

                  <th>Conversions</th>

                  <th>Conversion %</th>

                  <th>Revenue (₹)</th>

                  <th></th>

                </tr>

              </thead>

              <tbody>

                {executives.map((item) => (

                  <tr
                    key={item.rank}
                    className="border-b border-[#EDF0F7]"
                  >

                    <td className="pl-4 py-3">

                      <div className="flex items-center gap-3">

                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{
                            backgroundColor: item.color,
                          }}
                        >
                          {item.initials}
                        </div>

                        <span className="text-[13px] font-medium">
                          {item.name}
                        </span>

                      </div>

                    </td>

                    <td className="text-center text-[13px]">
                      {item.leads}
                    </td>

                    <td className="text-center text-[13px]">
                      {item.conversions}
                    </td>

                    <td className="text-center text-[13px]">
                      {item.rate}
                    </td>

                    <td className="text-center text-[13px]">
                      {item.revenue}
                    </td>

                    <td className="pr-3">

                      <div
                        className="
                  w-6 h-6
                  rounded-full
                  bg-[#FEF3C7]
                  text-[#D97706]
                  text-[11px]
                  font-bold
                  flex
                  items-center
                  justify-center
                "
                      >
                        {item.rank}
                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            <div className="p-4 text-center border-t border-[#EDF0F7]">

              <button className="text-[#2563EB] font-medium text-[14px]">
                View Full Performance Report →
              </button>

            </div>
          </div>



        </div>
      </div>

    </div>
  );

};
export default SalesReport;