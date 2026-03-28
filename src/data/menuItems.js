import {
  LayoutDashboard,
  FileText,
  Folder,
  Image,
  Users,
  User,
  Briefcase,
  BookOpen,
  Images,
  Lock,
  Settings,
  CalendarCheck,
  Building2,
  Info,
  ShieldCheck,
  UserCheck,
  Rocket,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Share2,
  List,
  Palette,
  Type,
  Ticket,
  Target,
  Handshake,
  Play,
  Globe,
} from "lucide-react";

export const menuItems = [
  /* ================= DASHBOARD ================= */
  {
    type: "item",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },

  /* ================= ANALYTICS SECTION ================= */
  {
    type: "heading",
    label: "Analytics Section",
  },

  {
    type: "item",
    label: "Click Analytics",
    icon: TrendingUp,
    path: "/click-analytics",
  },

  /* ================= HOME SECTION ================= */
  {
    type: "heading",
    label: "Home Section",
  },
  {
    type: "dropdown",
    label: "Home Page",
    icon: Globe,
    children: [
      {
        label: "Home Slider",
        path: "/carousel",
      },
      {
        label: "Event Highlights",
        path: "/event-highlights",
      },
      {
        label: "About Us",
        path: "/about-us",
      },
      {
        label: "Add PDF",
        path: "/add-pdf",
      },
      {
        label: "Marquee Text",
        path: "/marquee-text",
      },
      {
        label: "Who We Are",
        path: "/who-we-are",
      },
      {
        label: "Featured Services",
        path: "/featured-services",
      },
      {
        label: "Glimpse",
        path: "/glimpse",
      },
      {
        label: "Our Clients",
        path: "/clients",
      },
      {
        label: "Parallax Image",
        path: "/parallax-manage",
      },
      {
        label: "Testimonials",
        path: "/testimonials-manage",
      },
      {
        label: "Counters",
        path: "/stats-manage",
      },
    ],
  },

  {
    type: "heading",
    label: "About Section",
  },
  {
    type: "dropdown",
    label: "About Page",
    icon: Info,
    children: [
      {
        label: "Global Platform",
        path: "/global-platform",
      },
      {
        label: "Vision & Mission",
        path: "/vision-mission",
      },
      {
        label: "Why Attend",
        path: "/why-attend",
      },
      {
        label: "Target Audience",
        path: "/target-audience",
      },
      {
        label: "Organized By",
        path: "/organized-by",
      },
    ],
  },

  /* ================= EXHIBIT SECTION ================= */
  {
    type: "heading",
    label: "Exhibit Section",
  },
  {
    type: "dropdown",
    label: "Exhibit Page",
    icon: Rocket,
    children: [
      {
        label: "Why Exhibit",
        path: "/why-exhibit-manage",
      },
      {
        label: "Exhibitor Profile",
        path: "/exhibitor-profile-manage",
      },
      {
        label: "E-Promotion Management",
        path: "/e-promotion-manage",
      },
      {
        label: "Stall Designing Vendor",
        path: "/stall-vendor-manage",
      },
    ],
  },

  /* ================= VISIT SECTION ================= */
  {
    type: "heading",
    label: "Visit Section",
  },
  {
    type: "item",
    label: "Why Visit",
    icon: Rocket,
    path: "/why-visit-manage",
  },

  /* ================= PARTNERS SECTION ================= */
  {
    type: "heading",
    label: "Partners Section",
  },
  {
    type: "item",
    label: "Add Partners",
    icon: Handshake,
    path: "/partners-manage",
  },

  /* ================= ADVISORY SECTION ================= */
  {
    type: "heading",
    label: "Advisory Section",
  },
  {
    type: "item",
    label: "Add Advisory member",
    icon: Users,
    path: "/advisory-manage",
  },

  /* ================= GALLERY SECTION ================= */
  {
    type: "heading",
    label: "Gallery Section",
  },
  {
    type: "dropdown",
    label: "Gallery Page",
    icon: Images,
    children: [
      {
        label: "Add Images",
        path: "/gallery-images",
      },
      {
        label: "Add Video",
        path: "/gallery-videos",
      },
      {
        label: "Add Media photo",
        path: "/gallery-media",
      },
    ],
  },

  /* ================= BLOGS SECTION ================= */
  {
    type: "heading",
    label: "Blogs Section",
  },
  {
    type: "dropdown",
    label: "Blogs",
    icon: FileText,
    children: [
      { label: "Add Blogs", path: "/add-blogs" },
      { label: "Blogs List", path: "/blogs-list" },
    ],
  },

  /* ================= BACKGROUND IMAGES SECTION ================= */
  {
    type: "heading",
    label: "Background Images Section",
  },
  {
    type: "item",
    label: "Background Images",
    icon: Images,
    path: "/hero-images",
  },

  /* ================= SEO SECTION ================= */
  {
    type: "heading",
    label: "SEO Section",
  },
  {
    type: "dropdown",
    label: "SEO Manager",
    icon: TrendingUp,
    children: [
      { label: "Add Meta", path: "/add-meta" },
      { label: "Meta List", path: "/meta-list" },
      { label: "Advanced SEO", path: "/advanced-seo" },
    ],
  },
  {
    type: "item",
    label: "Social Media",
    icon: Share2,
    path: "/social-media",
  },

  /* ================= REGISTRATION SECTION ================= */
  {
    type: "heading",
    label: "Registration Section",
  },
  {
    type: "item",
    label: "Book A Stand",
    icon: Ticket,
    path: "/book-a-stand",
  },
  {
    type: "item",
    label: "E-Promotion Registers",
    icon: List,
    path: "/e-promotion-registers",
  },
  {
    type: "item",
    label: "Contact Enquiry",
    path: "/contact-enquiries",
    icon: MessageSquare,
  },
  {
    type: "item",
    label: "Buyer Registration",
    path: "/buyer-registrations",
    icon: Users,
  },

  {
    type: "heading",
    label: "Client Data Section",
  },
  {
    type: "dropdown",
    label: "IHWE Client Data 2026",
    icon: FileText,
    children: [
      { label: "Add New Clients", path: "/ihweClientData2026/addNewClients" },
      { label: "New Leads List", path: "/ihweClientData2026/newLeadList" },
      { label: "Warm Client List", path: "/ihweClientData2026/warmClientList" },
      { label: "Not Client List", path: "/ihweClientData2026/hotClientList" },
      {
        label: "Confirmed Client List",
        path: "/ihweClientData2026/confirmClientList",
      },
      { label: "Cold Client List", path: "/ihweClientData2026/coldClientList" },
      { label: "Master Data", path: "/ihweClientData2026/masterData" },
      { label: "Raw Data List", path: "/ihweClientData2026/rawDataList" },
    ],
  },
  {
    type: "dropdown",
    label: "Visitors Management",
    icon: FileText,
    children: [
      { label: "Add New Visitor", path: "/ihweClientData2026/AddNewVisitor" },

      {
        label: "Corporate Visitor Form",
        path: "/ihweClientData2026/CorporateVisitorForm",
      },
      {
        label: "Free Health Camp Form",
        path: "/ihweClientData2026/FreeHealthCampForm",
      },
      {
        label: "General Visitor Form",
        path: "/ihweClientData2026/GeneralVisitorForm",
      },

      {
        label: "Visitor Registration",
        path: "/ihweClientData2026/VisitorRegistration",
      },

      {
        label: "Corporate Visitors List",
        path: "/ihweClientData2026/CorporateVisitorsList",
      },
      {
        label: "General Visitors List",
        path: "/ihweClientData2026/GeneralVisitorsList",
      },
      {
        label: "Health Camp Visitors List",
        path: "/ihweClientData2026/HealthCampVisitorsList",
      },

      {
        label: "Corporate Overview",
        path: "/ihweClientData2026/CorporateOverview",
      },
      {
        label: "General Overview",
        path: "/ihweClientData2026/GeneralOverview",
      },
      {
        label: "Health Camp Overview",
        path: "/ihweClientData2026/HealthCampOverview",
      },
    ],
  },
  {
    type: "dropdown",
    label: "Add By Admin",
    icon: FileText,
    children: [
      { label: "Add Bank", path: "/ihweClientData2026/AddBank" },
      { label: "Add Category", path: "/ihweClientData2026/AddCategory" },
      {
        label: "Add CRM WhatsApp Message",
        path: "/ihweClientData2026/AddCrmWhatsappMessage",
      },
      { label: "Add Data Source", path: "/ihweClientData2026/AddDataSource" },
      { label: "Add Event", path: "/ihweClientData2026/AddEvent" },
      {
        label: "Add Nature Of Business",
        path: "/ihweClientData2026/AddNatureOfBusiness",
      },
      {
        label: "Add Remark Length Fixed",
        path: "/ihweClientData2026/AddRemarkLengthFixed",
      },
      { label: "Add Status", path: "/ihweClientData2026/AddStatus" },
      { label: "Add Target", path: "/ihweClientData2026/AddTarget" },
    ],
  },
  {
    type: "heading",
    label: "Account Section",
  },
  {
    type: "dropdown",
    label: "User Management",
    icon: FileText,
    children: [
      { label: "Add User", path: "/ihweClientData2026/adduser" },
      { label: "User List", path: "/ihweClientData2026/userlist" },
    ],
  },
  {
    type: "heading",
    label: "Account Section",
  },
  {
    type: "item",
    label: "Manage Admin Users",
    icon: ShieldCheck,
    path: "/admin-users",
  },
  {
    type: "item",
    label: "Change Password",
    icon: Lock,
    path: "/change-password",
  },

  {
    type: "item",
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
  {
    type: "item",
    label: "Customize Sidebar",
    icon: Palette,
    path: "/sidebar-customize",
  },
];
