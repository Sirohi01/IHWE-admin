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
  Ticket,
  UserCheck,
  Building2,
  Info,
  ShieldCheck,
  Rocket,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Share2,
  List,
  Palette,
  Type,
  Target,
  Handshake,
  Play,
  Globe,
  Sparkles,
  ClipboardList,
  Clock,
  BriefcaseBusiness,
  Building,
  Database,
  ShoppingBag,
} from "lucide-react";

export const menuItems = [
  /* ================= CORE DASHBOARD ================= */
  {
    type: "item",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["super-admin", "accountant-admin", "accountant-employee", "marketing-admin", "marketing-employee", "digital-admin", "digital-employee", "employee"]
  },
  {
    type: "item",
    label: "Click Analytics",
    icon: TrendingUp,
    path: "/click-analytics",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  /* ================= WEBSITE CONTENT ================= */
  {
    type: "heading",
    label: "Website Content",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "dropdown",
    label: "Home Page",
    icon: Globe,
    roles: ["super-admin", "marketing-admin", "marketing-employee"],
    children: [
      { label: "Home Slider", path: "/carousel" },
      { label: "Event Highlights", path: "/event-highlights" },
      { label: "About Us", path: "/about-us" },
      { label: "Add PDF", path: "/add-pdf" },
      { label: "Marquee Text", path: "/marquee-text" },
      { label: "Who We Are", path: "/who-we-are" },
      { label: "Featured Services", path: "/featured-services" },
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
    roles: ["super-admin", "marketing-admin", "marketing-employee"],
    children: [
      { label: "Global Platform", path: "/global-platform" },
      { label: "Vision & Mission", path: "/vision-mission" },
      { label: "Why Attend", path: "/why-attend" },
      { label: "Target Audience", path: "/target-audience" },
      { label: "Organized By", path: "/organized-by" },
    ],
  },

  /* ================= EVENT MANAGEMENT ================= */
  {
    type: "heading",
    label: "Event Management",
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee", "employee"]
  },
  {
    type: "dropdown",
    label: "Exhibit Page",
    icon: Rocket,
    roles: ["super-admin", "marketing-admin", "marketing-employee"],
    children: [
      { label: "Why Exhibit", path: "/why-exhibit-manage" },
      { label: "Exhibitor Profile", path: "/exhibitor-profile-manage" },
      { label: "E-Promotion Management", path: "/e-promotion-manage" },
      { label: "Stall Designing Vendor", path: "/stall-vendor-manage" },
    ],
  },
  {
    type: "item",
    label: "Stall Inventory",
    icon: LayoutDashboard,
    path: "/stalls",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Exhibition Events",
    icon: CalendarCheck,
    path: "/events",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Stall Pricing Rates",
    icon: Ticket,
    path: "/stall-rates",
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee"]
  },
  {
    type: "item",
    label: "Exhibitor Bookings",
    icon: ClipboardList,
    path: "/exhibitor-bookings",
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee"]
  },
  {
    type: "item",
    label: "Book A Stand",
    icon: CalendarCheck,
    path: "/book-a-stand",
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee"]
  },

  /* ================= CONNECT & NETWORK ================= */
  {
    type: "heading",
    label: "Connect & Network",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Why Visit",
    icon: Rocket,
    path: "/why-visit-manage"
  },
  {
    type: "item",
    label: "Exhibitor List",
    icon: List,
    path: "/exhibitor-list-manage"
  },
  {
    type: "item",
    label: "Partners",
    icon: Handshake,
    path: "/partners-manage"
  },
  {
    type: "item",
    label: "Advisory Board",
    icon: Users,
    path: "/advisory-manage"
  },

  /* ================= GALLERY SECTION ================= */
  {
    type: "heading",
    label: "Gallery Section",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },
  {
    type: "dropdown",
    label: "Gallery Page",
    icon: Images,
    roles: ["super-admin", "digital-admin", "digital-employee"],
    children: [
      { label: "Add Category", path: "/gallery-category" },
      { label: "View All Categories", path: "/gallery-list" },
      { label: "Add Images", path: "/add-gallery-images" },
      { label: "Manage Project Images", path: "/manage-gallery-images" },
      { label: "Add Video", path: "/gallery-videos" },
      { label: "Add Media photo", path: "/gallery-media" },
      { label: "Background Images", path: "/hero-images" },
    ],
  },

  /* ================= DIGITAL MARKETING ================= */
  {
    type: "heading",
    label: "Digital Marketing",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },
  {
    type: "dropdown",
    label: "Blogs Section",
    icon: FileText,
    children: [
      { label: "Add Blogs", path: "/add-blogs" },
      { label: "Blogs List", path: "/blogs-list" },
    ],
  },
  {
    type: "dropdown",
    label: "SEO Manager",
    icon: Share2,
    children: [
      { label: "Add Meta Tags", path: "/add-meta" },
      { label: "Meta List", path: "/meta-list" },
      { label: "Advanced SEO", path: "/advanced-seo" },
      { label: "Social Media", path: "/social-media" },
    ],
  },

  /* ================= CLIENT DATA ECOSYSTEM ================= */
  {
    type: "heading",
    label: "Client Data Ecosystem",
    roles: ["super-admin", "marketing-admin", "accountant-admin"]
  },
  {
    type: "dropdown",
    label: "IHWE Client Data 2026",
    icon: Database,
    children: [
      { label: "Add New Clients", path: "/ihweClientData2026/addNewClients" },
      { label: "New Lead List", path: "/ihweClientData2026/newLeadList" },
      { label: "Warm Client List", path: "/ihweClientData2026/warmClientList" },
      { label: "Hot Client List", path: "/ihweClientData2026/hotClientList" },
      { label: "Confirmed Client List", path: "/ihweClientData2026/confirmClientList" },
      { label: "Cold Client List", path: "/ihweClientData2026/coldClientList" },
      { label: "Master Data", path: "/ihweClientData2026/masterData" },
      { label: "Raw Data List", path: "/ihweClientData2026/rawDataList" },
      { label: "Upload Exhibitor", path: "/ihweClientData2026/uploadExhibitor" },
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
      { label: "Corporate Overview", path: "/ihweClientData2026/CorporateOverview" },
      { label: "General Overview", path: "/ihweClientData2026/GeneralOverview" },
      { label: "Health Camp Overview", path: "/ihweClientData2026/HealthCampOverview" },
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

  /* ================= GENERAL OPERATIONS ================= */
  {
    type: "heading",
    label: "General Operations",
    roles: ["super-admin", "marketing-admin", "accountant-admin"]
  },
  {
    type: "dropdown",
    label: "Registration Analysis",
    icon: ClipboardList,
    children: [
      { label: "Current Bookings", path: "/exhibitor-bookings?type=current" },
      { label: "Incoming Bookings", path: "/exhibitor-bookings?type=incoming" },
      { label: "E-Promotion Registers", path: "/e-promotion-registers" },
      { label: "Contact Enquiries", path: "/contact-enquiries" },
      { label: "Buyer Registrations", path: "/buyer-registrations" },
    ],
  },
  {
    type: "dropdown",
    label: "Dynamic Content",
    icon: BookOpen,
    children: [
      { label: "Create Page", path: "/create-a-page" },
      { label: "Page List", path: "/page-list" },
      { label: "Media Uploads (PDF)", path: "/upload-pdf" },
      { label: "Create News/Post", path: "/create-a-post" },
      { label: "News Registry", path: "/post-list" },
    ],
  },
  {
    type: "dropdown",
    label: "Services Hub",
    icon: Sparkles,
    children: [
      { label: "Create Service", path: "/create-service" },
      { label: "Service List", path: "/service-list" },
      { label: "Add Facilities", path: "/add-facilities" },
      { label: "Facilities List", path: "/facilities-list" },
    ],
  },
  {
    type: "dropdown",
    label: "HR & Recruitment",
    icon: BriefcaseBusiness,
    children: [
      { label: "Post Vacancy", path: "/add-vacancy" },
      { label: "Vacancy Registry", path: "/vacancy-list" },
      { label: "Applicants Registry", path: "/career-list" },
    ],
  },
  {
    type: "dropdown",
    label: "CRM Client Relations",
    icon: Building2,
    children: [
      { label: "Add Corporate Client", path: "/add-corporate-clients" },
      { label: "Corporate List", path: "/corporate-clients-list" },
      { label: "Add Individual Client", path: "/add-individual-clients" },
      { label: "Individual List", path: "/individual-clients-list" },
      { label: "Profiles", path: "/profiles" },
    ],
  },
  {
    type: "dropdown",
    label: "Communications",
    icon: MessageSquare,
    children: [
      { label: "Enquiry List", path: "/enquiry-list" },
      { label: "Remainder List", path: "/remainder-list" },
      { label: "Contact List", path: "/contact-list" },
    ],
  },

  /* ================= ADMINISTRATIVE CONTROL ================= */
  {
    type: "heading",
    label: "Admin Control",
    roles: ["super-admin"]
  },
  {
    type: "dropdown",
    label: "System Management",
    icon: ShieldCheck,
    children: [
      { label: "Add User", path: "/ihweClientData2026/adduser" },
      { label: "User List", path: "/ihweClientData2026/userlist" },
      { label: "Admin Users", path: "/admin-users" },
      { label: "Change Password", path: "/change-password" },
      { label: "Settings", path: "/settings" },
      { label: "Sidebar Customize", path: "/sidebar-customize" },
    ],
  },
];
