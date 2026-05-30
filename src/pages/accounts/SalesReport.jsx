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
} from "recharts";
const SalesReport = () => {
  const [search, setSearch] = useState("");
      const stats = [
  {
    title: "Total Leads",
    value: "512",
    growth: "+18.6%",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Total Conversions",
    value: "82",
    growth: "+14.2%",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Total Revenue",
    value: "₹24,75,000",
    growth: "+22.8%",
    icon: IndianRupee,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Conversion Rate",
    value: "16%",
    growth: "+2.1%",
    icon: Target,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    title: "Avg Deal Value",
    value: "₹30,183",
    growth: "+12.3%",
    icon: ClipboardList,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];
const trendData = [
 { date:"01 May", leads:50, conversion:25 },
 { date:"05 May", leads:120, conversion:70 },
 { date:"09 May", leads:90, conversion:50 },
 { date:"13 May", leads:160, conversion:90 },
 { date:"17 May", leads:100, conversion:45 },
 { date:"21 May", leads:185, conversion:105 },
 { date:"25 May", leads:110, conversion:42 },
 { date:"29 May", leads:200, conversion:115 },
 { date:"31 May", leads:160, conversion:82 }
];

const sourceData = [
 { name:"Website", value:162, color:"#10B981" },
 { name:"Referral", value:138, color:"#3B82F6" },
 { name:"Exhibition", value:96, color:"#F59E0B" },
 { name:"Social", value:62, color:"#EF4444" },
 { name:"Email", value:38, color:"#A855F7" },
 { name:"Others", value:16, color:"#64748B" }
];

const sourceRevenue = [
 {
  source:"Website",
  leads:162,
  converted:28,
  rate:"17.28%",
  revenue:"₹8,45,000"
 },
 {
  source:"Referral",
  leads:138,
  converted:24,
  rate:"17.39%",
  revenue:"₹6,75,000"
 }
];

const revenueData = [
 { value:4 },
 { value:5 },
 { value:7 },
 { value:6 },
 { value:10 },
 { value:8 },
 { value:12 },
 { value:14 }
];

const executives = [
 { name:"Vijay Sharma", revenue:"845000" },
 { name:"Amit Verma", revenue:"650000" },
 { name:"Neha Tiwari", revenue:"475000" },
 { name:"Priya Singh", revenue:"270000" },
];
  return (
<div className="min-h-screen bg-[#f7f8fc] p-6">

  {/* Header */}

  <div className="flex items-center justify-between mb-6">

    <div className="relative w-[420px]">

      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        className="w-full h-12 rounded-xl border bg-white pl-11 pr-4"
        placeholder="Search by Name, Company, Email, Mobile..."
      />
    </div>

    <div className="flex gap-3">

      <button className="h-11 px-5 bg-green-600 text-white rounded-xl flex items-center gap-2">
        <Plus size={18}/>
        Add Lead
      </button>

      <button className="h-11 px-5 bg-white border rounded-xl flex items-center gap-2">
        <Upload size={18}/>
        Import Leads
      </button>

    </div>

  </div>

  {/* Title */}

  <div className="mb-6">

    <h1 className="text-[34px] font-bold text-[#0F172A]">
      Reports
    </h1>

    <p className="text-gray-500">
      Track performance and analyze business insights
    </p>

  </div>

  {/* Tabs */}

  <div className="flex items-center justify-between border-b mb-6">

    <div className="flex gap-10">

      <button className="pb-4 border-b-2 border-green-600 text-green-600 font-semibold">
        Sales Analytics
      </button>

      <button className="pb-4 text-gray-500">
        Performance Report
      </button>

    </div>

    <div className="flex gap-3 pb-4">

      <button className="h-11 px-4 border bg-white rounded-xl flex items-center gap-2">
        <Calendar size={18}/>
        This Month
      </button>

      <button className="h-11 px-4 border bg-white rounded-xl flex items-center gap-2">
        <Filter size={18}/>
        Filters
      </button>

    </div>

  </div>

  {/* KPI Cards */}

  <div className="grid grid-cols-5 gap-4 mb-6">

    {stats.map((item,index)=>{

      const Icon = item.icon;

      return(
        <div
          key={index}
          className="bg-white border rounded-2xl p-5"
        >

          <div className="flex items-center gap-4">

            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${item.bg}`}>
              <Icon size={26} className={item.color}/>
            </div>

            <div>

              <p className="text-sm font-medium text-gray-500">
                {item.title}
              </p>

              <h3 className="text-[30px] font-bold mt-1">
                {item.value}
              </h3>

              <p className="text-green-600 text-sm font-medium">
                ↑ {item.growth} vs last month
              </p>

            </div>

          </div>

        </div>
      )
    })}

  </div>

  {/* Charts Row */}

  <div className="grid grid-cols-12 gap-5 mb-5">

    <div className="col-span-8 bg-white rounded-2xl border p-5">

      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">
          Leads & Conversions Trend
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="date"/>
          <YAxis/>
          <Tooltip/>

          <Line
            type="monotone"
            dataKey="leads"
            stroke="#16A34A"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="conversion"
            stroke="#2563EB"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>

    <div className="col-span-4 bg-white rounded-2xl border p-5">

      <h3 className="font-semibold mb-4">
        Leads by Source
      </h3>

      <div className="h-[320px] relative">

        <ResponsiveContainer>
          <PieChart>

            <Pie
              data={sourceData}
              dataKey="value"
              innerRadius={70}
              outerRadius={100}
            >
              {sourceData.map((entry,index)=>(
                <Cell
                  key={index}
                  fill={entry.color}
                />
              ))}
            </Pie>

          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <h3 className="text-[36px] font-bold">
            512
          </h3>

          <p>Total</p>

        </div>

      </div>

    </div>

  </div>

  {/* Table + Funnel */}

  <div className="grid grid-cols-12 gap-5 mb-5">

    <div className="col-span-8 bg-white rounded-2xl border p-5">

      <h3 className="font-semibold mb-4">
        Leads & Revenue by Source
      </h3>

      <table className="w-full">

        <thead>
          <tr className="border-b">

            <th className="text-left py-3">
              Source
            </th>

            <th>Total Leads</th>
            <th>Converted</th>
            <th>Rate</th>
            <th>Revenue</th>

          </tr>
        </thead>

        <tbody>

          {sourceRevenue.map((row,index)=>(
            <tr key={index} className="border-b">

              <td className="py-4">
                {row.source}
              </td>

              <td>{row.leads}</td>

              <td>{row.converted}</td>

              <td>{row.rate}</td>

              <td>{row.revenue}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

    <div className="col-span-4 bg-white rounded-2xl border p-5">

      <h3 className="font-semibold mb-4">
        Leads by Status
      </h3>

      <img
        src="/funnel-placeholder.png"
        alt=""
        className="w-full"
      />

    </div>

  </div>

  {/* Revenue + Top Executives */}

  <div className="grid grid-cols-12 gap-5">

    <div className="col-span-8 bg-white rounded-2xl border p-5">

      <h3 className="font-semibold mb-4">
        Revenue Trend
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={revenueData}>
          <Tooltip/>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#16A34A"
            fill="#DCFCE7"
          />
        </AreaChart>
      </ResponsiveContainer>

    </div>

    <div className="col-span-4 bg-white rounded-2xl border p-5">

      <h3 className="font-semibold mb-4">
        Top Performing Sales Executives
      </h3>

      {executives.map((item,index)=>(
        <div
          key={index}
          className="flex items-center justify-between py-3 border-b"
        >
          <span>{item.name}</span>

          <span className="font-semibold">
            ₹{item.revenue}
          </span>
        </div>
      ))}

    </div>

  </div>

</div>
);

};
export default SalesReport;