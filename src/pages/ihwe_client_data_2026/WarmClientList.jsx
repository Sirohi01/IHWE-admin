
import React, { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  MessageCircle,
  CalendarDays,
  Clock3,
  AlertCircle,
  TrendingUp,
  Users,
  Phone,
  Mail,
  Bell,
  Filter,
  ChevronDown,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
const WarmClientList = () => {
  const [search, setSearch] = useState("");

  const stats = [
    {
      title: "Total Follow-Ups",
      value: "12",
      subtitle: "Pending",
      icon: CalendarDays,
      bg: "bg-[#F3F7FF]",
      iconBg: "bg-[#E7F0FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Due Today",
      value: "05",
      subtitle: "Follow-ups",
      icon: CalendarDays,
      bg: "bg-[#FFF8EE]",
      iconBg: "bg-[#FFE8C7]",
      iconColor: "text-[#F97316]",
    },
    {
      title: "Overdue",
      value: "02",
      subtitle: "Follow-ups",
      icon: Clock3,
      bg: "bg-[#FFF2F4]",
      iconBg: "bg-[#FFDDE3]",
      iconColor: "text-[#EF4444]",
    },
    {
      title: "Due This Week",
      value: "07",
      subtitle: "Follow-ups",
      icon: CalendarDays,
      bg: "bg-[#F1FBF5]",
      iconBg: "bg-[#DDF7E6]",
      iconColor: "text-[#16A34A]",
    },
    {
      title: "Due This Month",
      value: "10",
      subtitle: "Follow-ups",
      icon: CalendarDays,
      bg: "bg-[#F8F3FF]",
      iconBg: "bg-[#EBDDFF]",
      iconColor: "text-[#7C3AED]",
    },
  ];

  const leads = [
    { company: "ABC Organics", source: "IndiaMart", status: "Due Today", date: "29 May 2026" },
    { company: "Green Foods", source: "JustDial", status: "Overdue", date: "28 May 2026" },
    { company: "Nature Export", source: "Website", status: "Due Today", date: "29 May 2026" },
    { company: "Healthy Farm", source: "Referral", status: "Upcoming", date: "30 May 2026" },
    { company: "Organic World", source: "IndiaMart", status: "Due Today", date: "29 May 2026" },
    { company: "ABC Organics", source: "IndiaMart", status: "Due Today", date: "29 May 2026" },
    { company: "Green Foods", source: "JustDial", status: "Overdue", date: "28 May 2026" },
    { company: "Nature Export", source: "Website", status: "Due Today", date: "29 May 2026" },
    { company: "Healthy Farm", source: "Referral", status: "Upcoming", date: "30 May 2026" },
    { company: "Organic World", source: "IndiaMart", status: "Due Today", date: "29 May 2026" },
  ];
const overviewData = [
  {
    name: "Due Today",
    value: 5,
    percentage: "42%",
    color: "#FF7A1A",
  },
  {
    name: "Due Tomorrow",
    value: 2,
    percentage: "17%",
    color: "#FACC15",
  },
  {
    name: "Due This Week",
    value: 5,
    percentage: "41%",
    color: "#3B82F6",
  },
  {
    name: "Overdue",
    value: 2,
    percentage: "17%",
    color: "#EF4444",
  },
];
const overdueLeads = [
  {
    company: "ABC Organics",
    date: "25 May 2026",
    days: "4 days overdue",
  },
  {
    company: "Green Foods",
    date: "27 May 2026",
    days: "2 days overdue",
  },
];
  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-9">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">

            {/* Left Side */}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[24px] font-bold">
                  My Follow-Ups
                </h2>
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                  12
                </span>
              </div>
              <p className="text-gray-800 font-medium mt-1">
                Leads with pending follow-ups
              </p>
            </div>

            {/* Right Side */}
            <div className="flex flex-wrap gap-3">

              <button className="h-11 px-5 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2 transition-all">
                <Plus size={18} />
                Add Lead
              </button>

              <button className="h-11 px-5 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-all">
                <Upload size={18} />
                Import Leads
              </button>

              <button className="h-11 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-2 transition-all">
                <MessageCircle size={18} />
                Send Bulk WhatsApp
              </button>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-6">
            {stats.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className={`
          ${item.bg}
          rounded-[8px]
          border border-gray-200
          px-5
          py-5
          min-h-[104px]
        `}
                >
                  <div className="flex items-center gap-4">

                    {/* LEFT ICON */}
                    <div
                      className={`
                            w-12 h-12
                            rounded-full
                            flex items-center justify-center
                            ${item.iconBg}
                          `}
                    >
                      <Icon
                        size={24}
                        strokeWidth={2}
                        className={item.iconColor}
                      />
                    </div>

                    {/* RIGHT TEXT */}
                    <div>

                      <p className="text-[12px] font-semibold text-[#0F172A]">
                        {item.title}
                      </p>

                      <h3 className="text-[20px] leading-none font-bold text-[#0F172A] mt-2">
                        {item.value}
                      </h3>

                      <p className="text-[12px] text-[#475569] mt-1">
                        {item.subtitle}
                      </p>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-5">

            {/* Search */}
            <div className="relative flex-1 min-w-[280px] max-w-[350px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search within follow-ups..."
                className="
        w-full
        h-12
        pl-11
        pr-4
        bg-white
        border
        border-gray-200
        rounded-xl
        text-sm
        focus:outline-none
      "
              />
            </div>

            {/* Follow Up Date */}
            <button
              className="
      h-12
      px-4
      bg-white
      border border-gray-200
      rounded-xl
      flex items-center gap-3
      text-sm font-medium
      text-[#0F172A]
    "
            >
              Follow-Up Date
              <CalendarDays size={18} />
            </button>

            {/* Status */}
            <button
              className="
      h-12
      px-4
      bg-white
      border border-gray-200
      rounded-xl
      flex items-center gap-3
      text-sm font-medium
    "
            >
              Status
              <ChevronDown size={16} />
            </button>

            {/* Source */}
            <button
              className="
      h-12
      px-4
      bg-white
      border border-gray-200
      rounded-xl
      flex items-center gap-3
      text-sm font-medium
    "
            >
              Source
              <ChevronDown size={16} />
            </button>

            {/* Lead Owner */}
            <button
              className="
      h-12
      px-4
      bg-white
      border border-gray-200
      rounded-xl
      flex items-center gap-3
      text-sm font-medium
    "
            >
              Lead Owner: Me
              <ChevronDown size={16} />
            </button>

            {/* More Filters */}
            <button
              className="
      h-12
      px-4
      bg-white
      border border-gray-200
      rounded-xl
      flex items-center gap-3
      text-sm font-medium
    "
            >
              <Filter size={16} />
              More Filters
              <ChevronDown size={16} />
            </button>

          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

            <table className="w-full">

              <thead className="bg-[#082A84] text-white">

                <tr className="h-14">
                  
                  <th className="">
                    <input type="checkbox" />
                  </th>
                  
                  <th className="text-left text-sm font-medium">
                    Company Name
                  </th>
                  <th className="text-left text-sm font-medium">
                    Source
                  </th>
                  <th className="text-left text-sm font-medium">
                    Lead Score
                  </th>
                  <th className="text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="text-left text-sm font-medium">
                    Follow-Up Date
                  </th>
                  <th className="text-left text-sm font-medium">
                    Handled By / Last Conversation
                  </th>
                  <th className="text-left text-sm font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>

                {leads.map((lead, index) => (

                  <tr
                    key={index}
                    className="
                      border-b
                      border-gray-100
                      hover:bg-gray-50
                      transition
                    ">
                    <td className="pl-4 py-4">
                      <input type="checkbox" />
                    </td>
                    <td className="py-4">

                      <h4 className="font-semibold text-[#0F172A]">
                        {lead.company}
                      </h4>

                    </td>

                    <td>

                      <span
                        className="
      px-3 py-1
      rounded-full
      text-xs
      bg-blue-100
      text-blue-700
      font-medium
    "
                      >
                        {lead.source}
                      </span>

                    </td>

                    <td>

                      <div className="flex items-center gap-2">

                        <div className="flex text-green-500">
                          ★★★★☆
                        </div>

                        <span className="text-sm font-medium">
                          70
                        </span>

                      </div>

                    </td>

                    <td>

                      <span
                        className="
      px-3 py-1
      rounded-lg
      text-xs
      bg-orange-100
      text-orange-700
      font-medium
    "
                      >
                        Due Today
                      </span>

                    </td>

                    <td>

                      <div className="flex flex-col">

                        <span className="font-medium">
                          27 May 2026
                        </span>

                        <span className="text-xs text-gray-500">
                          11:00 AM
                        </span>

                      </div>

                    </td>

                    <td>

                      <div className="flex gap-3">

                        <MessageCircle
                          size={16}
                          className="text-green-500"
                        />

                        <div>

                          <p className="text-sm font-medium">
                            27 May 2026, 10:15 AM
                          </p>

                          <p className="text-xs text-gray-500">
                            WhatsApp
                          </p>

                        </div>

                      </div>

                    </td>

                    <td>

                      <div className="flex items-center gap-4">

                        <Phone
                          size={17}
                          className="text-green-600 cursor-pointer"
                        />

                        <MessageCircle
                          size={17}
                          className="text-green-600 cursor-pointer"
                        />

                        <MoreVertical
                          size={17}
                          className="cursor-pointer"
                        />

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>
            </table>
            <div className="flex items-center justify-between px-6 py-4 bg-white">

  <p className="text-sm text-gray-500">
    Showing 1 to 12 of 12 follow-ups
  </p>

  <div className="flex items-center gap-2">

    <button className="w-10 h-10 border rounded-lg">
      ‹
    </button>

    <button className="w-10 h-10 bg-[#082A84] text-white rounded-lg">
      1
    </button>

    <button className="w-10 h-10 border rounded-lg">
      ›
    </button>

  </div>

  <div className="flex items-center gap-2">

    <span className="text-sm">
      Rows per page:
    </span>

    <select className="border rounded-lg px-2 py-1">
      <option>10</option>
    </select>

  </div>

</div>
          </div>
        </div>

        <div className="col-span-3 space-y-5">

          <div className="bg-white rounded-2xl border border-gray-100 p-5">

  <h3 className="text-[20px] font-semibold text-[#0F172A] mb-5">
    Follow-Up Overview
  </h3>

  <div className="flex items-center justify-between">

    {/* Donut Chart */}

    <div className="relative w-[120px] h-[120px]">

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>

          <Pie
            data={overviewData}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={50}
            dataKey="value"
            stroke="none"
          >
            {overviewData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
              />
            ))}
          </Pie>

        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <h3 className="text-[18px] font-bold text-[#0F172A]">
          12
        </h3>

        <p className="text-sm text-gray-500">
          Total
        </p>

      </div>

    </div>

    {/* Legend */}

    <div className="space-y-4">

      {overviewData.map((item) => (

        <div
          key={item.name}
          className="flex items-center justify-between gap-6"
        >

          <div className="flex items-center gap-3">

            <span
              className="w-3 h-3 rounded-full"
              style={{
                background: item.color,
              }}
            />

            <span className="text-sm font-medium text-[#0F172A]">
              {item.name}
            </span>

          </div>

          <span className="text-sm font-semibold text-[#0F172A]">
            {item.value} ({item.percentage})
          </span>

        </div>

      ))}

    </div>

  </div>

</div>

         <div className="bg-white rounded-2xl border border-gray-100 p-5">

  <div className="flex items-center justify-between mb-4">

    <h3 className="text-[16px] font-semibold text-[#0F172A]">
      Overdue Follow-Ups
    </h3>

    <button className="text-sm text-[#2563EB] font-medium">
      View All
    </button>

  </div>

  <div className="space-y-4">

    {overdueLeads.map((lead, index) => (
      <div
        key={index}
        className={`
          flex
          items-center
          justify-between
          pb-4
          ${index !== overdueLeads.length - 1 ? "border-b border-gray-100" : ""}
        `}
      >
        <div>

          <h4 className="text-sm font-semibold text-[#0F172A]">
            {lead.company}
          </h4>

          <p className="text-xs text-gray-500 mt-1">
            Due: {lead.date}
          </p>

        </div>

        <span
          className="
            min-w-[36px]
            h-8
            px-2
            rounded-full
            bg-red-100
            text-red-600
            text-xs
            font-semibold
            flex
            items-center
            justify-center
          "
        >
          {lead.days}
        </span>

      </div>
    ))}
    <div className="mt-4 pt-4 border-t border-gray-100">

  <button
    className="
      w-full
      flex
      items-center
      justify-between
      text-sm
      font-medium
      text-[#2563EB]
      hover:text-[#1D4ED8]
      transition-all
    "
  >
    <span>
      View All Overdue ({overdueLeads.length})
    </span>

    <ArrowRight size={16} />
  </button>

</div>
  </div>

</div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">

  <h3 className="text-[16px] font-semibold text-[#0F172A] mb-2">
    Quick Actions
  </h3>

  <div className="grid grid-cols-2 gap-4">

    <button
      className="
        h-[55px]
        rounded-xl
        bg-[#F8F1FF]
        flex
        items-center
        px-3
        gap-2
        hover:opacity-90
      "
    >
      <CalendarDays
        size={22}
        className="text-purple-600"
      />

      <span className="text-sm font-medium text-[#0F172A]">
        Schedule Follow-Up
      </span>
    </button>

    <button
      className="
        h-[70px]
        rounded-xl
        bg-[#EEF9F2]
        flex
        items-center
        px-3
        gap-2
      "
    >
      <Phone
        size={22}
        className="text-green-600"
      />

      <span className="text-sm font-medium text-[#0F172A]">
        Log Call
      </span>
    </button>

    <button
      className="
        h-[55px]
        rounded-xl
        bg-[#EEF9F2]
        flex
        items-center
        px-3
        gap-2
      "
    >
      <MessageCircle
        size={22}
        className="text-green-600"
      />

      <span className="text-sm font-medium text-[#0F172A]">
        Send WhatsApp
      </span>
    </button>

    <button
      className="
        h-[55px]
        rounded-xl
        bg-[#F4F7FF]
        flex
        items-center
        px-3
        gap-2
      "
    >
      <Mail
        size={22}
        className="text-blue-600"
      />

      <span className="text-sm font-medium text-[#0F172A]">
        Send Email
      </span>
    </button>

  </div>

</div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">

  <div className="flex items-start gap-3 mb-5">

    <Bell
      size={20}
      className="text-[#0F172A] mt-1"
    />

    <div>
      <h3 className="text-[16px] font-semibold text-[#0F172A]">
        Reminder Settings
      </h3>

      <p className="text-xs text-gray-500 mt-1">
        Get reminded before follow-up is due
      </p>
    </div>

  </div>

  {/* Enable Reminder */}

  <div className="flex items-center justify-between mb-5">

    <span className="text-sm font-medium text-[#0F172A]">
      Enable Reminders
    </span>

    <label className="relative inline-flex cursor-pointer">

      <input
        type="checkbox"
        defaultChecked
        className="sr-only peer"
      />

      <div
        className="
          w-11 h-6
          bg-gray-200
          rounded-full
          peer
          peer-checked:bg-green-500
          after:content-['']
          after:absolute
          after:top-[2px]
          after:left-[2px]
          after:bg-white
          after:w-5
          after:h-5
          after:rounded-full
          after:transition-all
          peer-checked:after:translate-x-5
        "
      />
    </label>

  </div>

  {/* Remind Me */}

  <div className="flex items-center justify-between mb-5">

    <span className="text-sm font-medium text-[#0F172A]">
      Remind me
    </span>

    <select
      className="
        border
        border-gray-200
        rounded-lg
        px-3
        py-2
        text-sm
      "
    >
      <option>1 Hour Before</option>
      <option>2 Hours Before</option>
      <option>1 Day Before</option>
    </select>

  </div>

  {/* Send Via */}

  <div>

    <p className="text-sm font-medium text-[#0F172A] mb-3">
      Send reminder via
    </p>

    <div className="flex items-center gap-6">

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          defaultChecked
          className="accent-blue-600"
        />
        WhatsApp
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          defaultChecked
          className="accent-blue-600"
        />
        Email
      </label>

    </div>

  </div>

</div>
        </div>
      </div>
    </div>
  );
};

export default WarmClientList;
