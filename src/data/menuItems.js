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
  Plus,
  Clock,
  BriefcaseBusiness,
  Sparkles,
  ClipboardList,
  Activity,
  AlertTriangle,
  Package,
  ShoppingCart,
} from "lucide-react";


export const menuItems = [
  /* ================= ANALYTICS SECTION ================= */
  {
    type: "heading",
    label: "Analytics Section",
  },
  {
    type: "item",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    type: "item",
    label: "Activity Logs",
    icon: Activity,
    path: "/activity-logs",
  },
  {
    type: "item",
    label: "Click Analytics",
    icon: TrendingUp,
    path: "/click-analytics",
  },

  /* ================= Website Management SECTION ================= */
  {
    type: "heading",
    label: "Website Management",
  },
  {
    type: "dropdown",
    label: "Home Page",
    icon: Globe,
    children: [
      { label: "Home Slider", path: "/carousel" },
      { label: "Event Highlights", path: "/event-highlights" },
      { label: "About Us", path: "/about-us" },
      { label: "Add PDF", path: "/add-pdf" },
      { label: "Marquee Text", path: "/marquee-text" },
      { label: "Who We Are", path: "/who-we-are" },
      { label: "Featured Services", path: "/featured-services" },
      { label: "FAQ Management", path: "/faq-manage" },
      { label: "Glimpse", path: "/glimpse" },
      { label: "Our Clients", path: "/clients" },
      { label: "Parallax Image", path: "/parallax-manage" },
      { label: "Testimonials", path: "/testimonials-manage" },
      { label: "Counters", path: "/stats-manage" },
    ],
  },
  {
    type: "dropdown",
    label: "About Page",
    icon: Info,
    children: [
      { label: "Global Platform", path: "/global-platform" },
      { label: "Vision & Mission", path: "/vision-mission" },
      { label: "Why Attend", path: "/why-attend" },
      { label: "Target Audience", path: "/target-audience" },
      { label: "Organized By", path: "/organized-by" },
    ],
  },
  {
    type: "dropdown",
    label: "Gallery Page",
    icon: Images,
    children: [
      { label: "Gallery Categories", path: "/gallery-category" },
      { label: "View All Listings", path: "/gallery-list" },
      { label: "Add Gallery Images", path: "/add-gallery-images" },
      { label: "Add Video", path: "/gallery-videos" },
      { label: "Media Categories", path: "/media-category" },
      { label: "Media Photo Management", path: "/gallery-media" },
    ],
  },
  {
    type: "dropdown",
    label: "Exhibit Page",
    icon: Rocket,
    children: [
      { label: "Why Exhibit", path: "/why-exhibit-manage" },
      { label: "Exhibitor Profile", path: "/exhibitor-profile-manage" },
      { label: "E-Promotion Management", path: "/e-promotion-manage" },
      { label: "Stall Designing Vendor", path: "/stall-vendor-manage" },
      { label: "Travel & Accommodation", path: "/travel-accommodation-manage" },
    ],
  },
  {
    type: "item",
    label: "Why Visit",
    icon: Rocket,
    path: "/why-visit-manage",
  },
  {
    type: "item",
    label: "Exhibitor List",
    icon: List,
    path: "/exhibitor-list-manage",
  },
  {
    type: "item",
    label: "Add Partners",
    icon: Handshake,
    path: "/partners-manage",
  },
  {
    type: "item",
    label: "Add Advisory member",
    icon: Users,
    path: "/advisory-manage",
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
  {
    type: "item",
    label: "Background Images",
    icon: Images,
    path: "/hero-images",
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

  /* ================= Marketing Section ================= */
  {
    type: "heading",
    label: "Marketing Section",
  },
  {
    type: "item",
    label: "Book A Stand",
    icon: Ticket,
    path: "/book-a-stand",
  },
  {
    type: "dropdown",
    label: "IHWE Client Data 2026",
    icon: FileText,
    children: [
      { label: "Add New Client", path: "/ihweClientData2026/addNewClients" },
      { label: "New Leads List", path: "/ihweClientData2026/newLeadList" },
      { label: "Warm Client List", path: "/ihweClientData2026/warmClientList" },
      { label: "Hot Client List", path: "/ihweClientData2026/hotClientList" },
      { label: "Confirmed Client List", path: "/ihweClientData2026/confirmClientList" },
      { label: "Cold Client List", path: "/ihweClientData2026/coldClientList" },
      { label: "Master Data", path: "/ihweClientData2026/masterData" },
      { label: "Raw Data List", path: "/ihweClientData2026/rawDataList" },
    ],
  },
  {
    type: "dropdown",
    label: "Buyer Management",
    icon: Users,
    children: [
      { label: "Buyer Registration", path: "/buyer-registration" },
      { label: "Buyer List", path: "/buyer-list" },
    ],
  },
  {
    type: "dropdown",
    label: "Visitor Management",
    icon: Users,
    children: [
      { label: "Add Domestic Visitor", path: "/ihweClientData2026/AddNewVisitor" },
      { label: "Add International Visitor", path: "/ihweClientData2026/VisitorRegistration" },
      { label: "Corporate Visitors List", path: "/ihweClientData2026/CorporateVisitorsList" },
      { label: "General Visitors List", path: "/ihweClientData2026/GeneralVisitorsList" },
      { label: "Health Camp Visitors List", path: "/ihweClientData2026/FreeHealthCampVisitorsList" },
      { label: "Visitor Review", path: "/ihweClientData2026/VisitorReview" },
    ],
  },
  {
    type: "dropdown",
    label: "Exhibitor Management",
    icon: FileText,
    children: [
      { label: "Exhibitor Chat", path: "/exhibitor-chat" },
      {
        label: "Stall Inventory",
        path: "/stalls",
      },
      {
        label: "Exhibition Events",
        path: "/events",
      },
      {
        label: "Stall Pricing Rates",
        path: "/stall-rates",
      },
      {
        label: "Exhibitor Bookings",
        path: "/exhibitor-bookings",
      },
      {
        label: "Failed Payments",
        path: "/failed-payments",
      },
    ]
  },
  {
    type: "dropdown",
    label: "System Configuration",
    icon: Settings,
    children: [
      { label: "Add Bank", path: "/ihweClientData2026/AddBank" },
      { label: "Add Category", path: "/ihweClientData2026/AddCategory" },
      { label: "Add CRM Whatsapp Message", path: "/ihweClientData2026/AddCrmWhatsappMessage" },
      { label: "Add Data Source", path: "/ihweClientData2026/AddDataSource" },
      { label: "Add Event", path: "/ihweClientData2026/AddEvent" },
      { label: "Add Nature Of Business", path: "/ihweClientData2026/AddNatureOfBusiness" },
      { label: "Add Remark Length Fixed", path: "/ihweClientData2026/AddRemarkLengthFixed" },
      { label: "Add Status", path: "/ihweClientData2026/AddStatus" },
      { label: "Add Target", path: "/ihweClientData2026/AddTarget" },
      { label: "Registration Settings", path: "/buyer-registration-config" },
    ],
  },
  {
    type: "item",
    label: "Marketing Toolkit",
    icon: Package,
    path: "/marketing-toolkit-manage",
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

  /* ================= STALLS & EVENTS ================= */
  // {
  //   type: "heading",
  //   label: "Stalls & Events",
  // },

  /* ================= Developer SECTION ================= */
  {
    type: "heading",
    label: "Developer Section",
  },
  {
    type: "item",
    label: "Email Logs",
    icon: ClipboardList,
    path: "/email-logs",
  },
  {
    type: "item",
    label: "WhatsApp Logs",
    icon: MessageSquare,
    path: "/whatsapp-logs",
  },


  {
    type: "item",
    label: "Response Templates",
    icon: MessageSquare,
    path: "/response-templates",
  },


  {
    type: "item",
    label: "Policy Manager",
    icon: ShieldCheck,
    path: "/policy-manager",
  },

  {
    type: "dropdown",
    label: "Admin Management",
    icon: TrendingUp,
    children: [
      { label: "Business Type", path: "/business-type" },
      { label: "Annual Turnover", path: "/annual-turnover" },
      { label: "Primary Product Interest", path: "/primary-product-interest" },
      { label: "Secondary Product Categories", path: "/secondary-product-categories" },
      { label: "Meeting Priority Level", path: "/meeting-priority-level" },
      { label: "Add Unit", path: "/add-unit" },
    ],
  },
  {
    type: "item",
    label: "Manage Accessories",
    icon: Package,
    path: "/stall-accessories",
  },
  {
    type: "item",
    label: "Accessory Orders",
    icon: ShoppingCart,
    path: "/accessory-orders",
  },



  {
    type: "item",
    label: "Manage Admin Users",
    icon: ShieldCheck,
    path: "/admin-users",
  },
  {
    type: "item",
    label: "Manage Roles",
    icon: Users,
    path: "/manage-roles",
  },
  {
    type: "item",
    label: "Role Permissions",
    icon: ShieldCheck,
    path: "/role-permissions",
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
