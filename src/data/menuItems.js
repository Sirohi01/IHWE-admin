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
    type: "heading",
    label: "About Section",
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
      { label: "Why Exhibit", path: "/why-exhibit-manage" },
      { label: "Exhibitor Profile", path: "/exhibitor-profile-manage" },
      { label: "E-Promotion Management", path: "/e-promotion-manage" },
      { label: "Stall Designing Vendor", path: "/stall-vendor-manage" },
      { label: "Travel & Accommodation", path: "/travel-accommodation-manage" },
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

  /* ================= EXHIBITORS SECTION ================= */
  {
    type: "heading",
    label: "Exhibitors Section",
  },
  {
    type: "item",
    label: "Exhibitor List",
    icon: List,
    path: "/exhibitor-list-manage",
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
      { label: "Gallery Categories", path: "/gallery-category" },
      { label: "View All Listings", path: "/gallery-list" },
      { label: "Add Gallery Images", path: "/add-gallery-images" },
      { label: "Add Video", path: "/gallery-videos" },
      { label: "Media Categories", path: "/media-category" },
      { label: "Media Photo Management", path: "/gallery-media" },
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

  /* ================= CLIENT DATA SECTION ================= */
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
      { label: "Hot Client List", path: "/ihweClientData2026/hotClientList" },
      { label: "Confirmed Client List", path: "/ihweClientData2026/confirmClientList" },
      { label: "Cold Client List", path: "/ihweClientData2026/coldClientList" },
      { label: "Master Data", path: "/ihweClientData2026/masterData" },
      { label: "Raw Data List", path: "/ihweClientData2026/rawDataList" },
    ],
  },
  {
    type: "dropdown",
    label: "Visitor Management",
    icon: Users,
    children: [
      { label: "Add New Visitor", path: "/ihweClientData2026/AddNewVisitor" },
      { label: "Corporate Visitor Form", path: "/ihweClientData2026/CorporateVisitorForm" },
      { label: "Free Health Camp Form", path: "/ihweClientData2026/FreeHealthCampForm" },
      { label: "General Visitor Form", path: "/ihweClientData2026/GeneralVisitorForm" },
      { label: "Visitor Registration", path: "/ihweClientData2026/VisitorRegistration" },
      { label: "Corporate Visitors List", path: "/ihweClientData2026/CorporateVisitorsList" },
      { label: "General Visitors List", path: "/ihweClientData2026/GeneralVisitorsList" },
      { label: "Health Camp Visitors List", path: "/ihweClientData2026/HealthCampVisitorsList" },
      { label: "Visitor Review", path: "/ihweClientData2026/VisitorReview" },
    ],
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
    ],
  },

  /* ================= STALLS & EVENTS ================= */
  {
    type: "heading",
    label: "Stalls & Events",
  },
  {
    type: "item",
    label: "Stall Inventory",
    icon: LayoutDashboard,
    path: "/stalls",
  },
  {
    type: "item",
    label: "Exhibition Events",
    icon: CalendarCheck,
    path: "/events",
  },
  {
    type: "item",
    label: "Stall Pricing Rates",
    icon: Ticket,
    path: "/stall-rates",
  },
  {
    type: "item",
    label: "Exhibitor Bookings",
    icon: ClipboardList,
    path: "/exhibitor-bookings",
  },

  /* ================= GENERAL OPERATIONS ================= */
  // {
  //   type: "heading",
  //   label: "General Operations",
  // },
  // {
  //   type: "dropdown",
  //   label: "Content Hub",
  //   icon: BookOpen,
  //   children: [
  //     { label: "Create Page", path: "/create-a-page" },
  //     { label: "Page List", path: "/page-list" },
  //     { label: "Media Uploads (PDF)", path: "/upload-pdf" },
  //     { label: "Create News/Post", path: "/create-a-post" },
  //     { label: "News Registry", path: "/post-list" },
  //   ],
  // },
  // {
  //   type: "dropdown",
  //   label: "Services Hub",
  //   icon: Sparkles,
  //   children: [
  //     { label: "Create Service", path: "/create-service" },
  //     { label: "Service List", path: "/service-list" },
  //     { label: "Add Facilities", path: "/add-facilities" },
  //   ],
  // },
  // {
  //   type: "dropdown",
  //   label: "HR & Recruitment",
  //   icon: BriefcaseBusiness,
  //   children: [
  //     { label: "Post Vacancy", path: "/add-vacancy" },
  //     { label: "Applicants Registry", path: "/career-list" },
  //   ],
  // },
  // {
  //   type: "dropdown",
  //   label: "CRM Client Relations",
  //   icon: Building2,
  //   children: [
  //     { label: "Add Corporate Client", path: "/add-corporate-clients" },
  //     { label: "Corporate List", path: "/corporate-clients-list" },
  //     { label: "Add Individual Client", path: "/add-individual-clients" },
  //     { label: "Profiles", path: "/profiles" },
  //   ],
  // },
  // {
  //   type: "dropdown",
  //   label: "Communications",
  //   icon: MessageSquare,
  //   children: [
  //     { label: "Enquiry List", path: "/enquiry-list" },
  //     { label: "Remainder List", path: "/remainder-list" },
  //     { label: "Contact List", path: "/contact-list" },
  //   ],
  // },

  /* ================= LOGS SECTION ================= */
  {
    type: "heading",
    label: "Logs Section",
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


  /* ================= MESSAGE SECTION ================= */
  {
    type: "heading",
    label: "Message Section",
  },
  {
    type: "item",
    label: "Response Templates",
    icon: MessageSquare,
    path: "/response-templates",
  },


  /* ================= ACCOUNT SECTION ================= */
  {
    type: "heading",
    label: "Account Section",
  },
  // {
  //   type: "item",
  //   label: "User List",
  //   icon: Users,
  //   path: "/ihweClientData2026/userlist",
  // },
  // {
  //   type: "item",
  //   label: "Add User",
  //   icon: UserCheck,
  //   path: "/ihweClientData2026/adduser",
  // },
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
