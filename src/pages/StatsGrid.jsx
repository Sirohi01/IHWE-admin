import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  Home,
  Star,
  MessageCircle,
  Clock,
  Sofa,
  UserCheck,
  Heart,
  FileText,
  CalendarCheck,
  Image as ImageIcon,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import PageHeader from "../components/PageHeader";

import { ToastContainer, toast } from "react-toastify";
import api from "../lib/api";

const initialStats = [
  {
    title: "TOTAL USERS",
    value: "0",
    desc: "Registered admins",
    icon: UserCheck,
    iconBg: "bg-indigo-500",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    title: "TOTAL SERVICES",
    value: "0",
    desc: "Active services",
    icon: Star,
    iconBg: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    title: "TOTAL PROJECTS",
    value: "0",
    desc: "Portfolio images",
    icon: ImageIcon,
    iconBg: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    title: "REGISTRATIONS",
    value: "0",
    desc: "Buyer attendees",
    icon: Users,
    iconBg: "bg-cyan-500",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  {
    title: "TESTIMONIALS",
    value: "0",
    desc: "Happy customers",
    icon: Heart,
    iconBg: "bg-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
  {
    title: "OUR CLIENTS",
    value: "0",
    desc: "Partner logos",
    icon: Users,
    iconBg: "bg-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  {
    title: "TOTAL BLOGS",
    value: "0",
    desc: "Published articles",
    icon: FileText,
    iconBg: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    title: "EXHIBITORS",
    value: "0",
    desc: "Stall bookings",
    icon: CalendarCheck,
    iconBg: "bg-pink-500",
    bg: "bg-pink-50",
    text: "text-pink-600",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);

  const MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/dashboard/stats");

        if (response.data.success) {
          const { counts, charts, recentContacts } = response.data.data;

          setRecentContacts(recentContacts || []);
          setProjectTypes(charts.distribution || []);
          setTrendData(charts.trends || []);

          setStats([
            {
              title: "TOTAL USERS",
              value: counts.totalUsers,
              desc: "Registered admins",
              icon: UserCheck,
              iconBg: "bg-indigo-500",
              bg: "bg-indigo-50",
              text: "text-indigo-600",
            },
            {
              title: "TOTAL SERVICES",
              value: counts.totalServices,
              desc: "Active services",
              icon: Star,
              iconBg: "bg-amber-500",
              bg: "bg-amber-50",
              text: "text-amber-600",
            },
            {
              title: "TOTAL PROJECTS",
              value: counts.totalProjects,
              desc: "Portfolio images",
              icon: ImageIcon,
              iconBg: "bg-blue-500",
              bg: "bg-blue-50",
              text: "text-blue-600",
            },
            {
              title: "REGISTRATIONS",
              value: counts.totalBuyerRegistrations,
              desc: "Buyer attendees",
              icon: Users,
              iconBg: "bg-cyan-500",
              bg: "bg-cyan-50",
              text: "text-cyan-600",
            },
            {
              title: "TESTIMONIALS",
              value: counts.totalTestimonials,
              desc: "Happy customers",
              icon: Heart,
              iconBg: "bg-rose-500",
              bg: "bg-rose-50",
              text: "text-rose-600",
            },
            {
              title: "OUR CLIENTS",
              value: counts.totalClients,
              desc: "Partner logos",
              icon: Users,
              iconBg: "bg-purple-500",
              bg: "bg-purple-50",
              text: "text-purple-600",
            },
            {
              title: "TOTAL BLOGS",
              value: counts.totalBlogs,
              desc: "Published articles",
              icon: FileText,
              iconBg: "bg-emerald-500",
              bg: "bg-emerald-50",
              text: "text-emerald-600",
            },
            {
              title: "EXHIBITORS",
              value: counts.totalBookings,
              desc: "Stall bookings",
              icon: CalendarCheck,
              iconBg: "bg-pink-500",
              bg: "bg-pink-50",
              text: "text-pink-600",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        toast.error("Error fetching dashboard data!");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-indigo-600 font-medium">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <ToastContainer />

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-slate-50 to-slate-100 p-6 border-2 border-slate-200 transition-all duration-500 shadow-[0_6px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] overflow-hidden"
              >
                {/* Background Animated Balls - SLOWER */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Top Right Ball - SLOWER transition */}
                  <div
                    className={`absolute top-0 right-0 w-60 h-60 ${item.iconBg} opacity-15 rounded-full -mr-20 -mt-20 transition-all duration-1000 ease-out group-hover:-mr-10 group-hover:-mt-10`}
                  />

                  {/* Bottom Left Ball - SLOWER transition */}
                  <div
                    className={`absolute bottom-0 left-0 w-32 h-32 ${item.iconBg} opacity-15 rounded-full -ml-16 -mb-16 transition-all duration-1000 ease-out group-hover:-ml-8 group-hover:-mb-8`}
                  />
                </div>

                <div className="relative z-10">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${item.iconBg} ${item.iconBg.includes("500") ? item.iconBg.replace("500", "600") : item.iconBg} flex items-center justify-center shadow-md border border-gray-200`}
                      >
                        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>

                      <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                        {item.title}
                      </p>
                    </div>

                    <div
                      className={`px-3 py-1.5 text-base font-bold ${item.bg} ${item.text} border-2 ${item.iconBg.replace("bg-", "border-")}`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Value Section - BIGGER TEXT */}
                  <div>
                    <p className={`text-3xl font-extrabold ${item.text} mb-2 leading-none`}>
                      {item.value}
                    </p>

                    <p className="text-base text-gray-700 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* REGISTRATIONS VS LEADS CHART */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h3 className="font-bold mb-6 text-lg text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" />
              Engagement Trends (6 Months)
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fill="url(#leadGradient)"
                  name="Contact Leads"
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#regGradient)"
                  name="Buyer Registrations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* PROJECT TREND CHART */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h3 className="font-bold mb-6 text-lg text-slate-800 flex items-center gap-2">
              <ImageIcon className="text-purple-600" />
              Portfolio Growth
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="#8b5cf6"
                  strokeWidth={4}
                  dot={{r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff'}}
                  activeDot={{r: 8}}
                  name="Gallery Items"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h3 className="font-bold mb-6 text-lg text-slate-800">Media Distribution</h3>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  dataKey="value"
                  paddingAngle={5}
                >
                  {projectTypes.map((v, i) => (
                    <Cell key={i} fill={v.color || "#4f46e5"} cornerRadius={6} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
             <div className="flex flex-wrap justify-center gap-4 mt-2">
              {projectTypes.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color }}></div>
                  <span className="text-xs font-bold text-slate-600">{v.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h3 className="font-bold mb-6 text-lg text-slate-800">Exhibitor Acquisition</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="leads" fill="#10b981" radius={[8, 8, 0, 0]} name="Stall Enquiries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT CONTACTS */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mt-8 font-inter">
          <h3 className="font-bold mb-6 text-lg text-slate-800">Recent Contact Queries</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-4 font-bold">Name</th>
                  <th className="px-4 py-4 font-bold">Email</th>
                  <th className="px-4 py-4 font-bold">Phone</th>
                  <th className="px-4 py-4 font-bold">Service</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map((contact, i) => (
                  <tr key={i} className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-900">{contact.name}</td>
                    <td className="px-4 py-4">{contact.email}</td>
                    <td className="px-4 py-4 text-slate-600">{contact.phone}</td>
                    <td className="px-4 py-4">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-medium text-slate-600">
                        {contact.service || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        contact.status === 'new' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentContacts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-10 text-center text-slate-400 italic">No recent queries found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple helper icon for trend
const TrendingUp = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export default Dashboard;