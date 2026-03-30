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

  /* ================= EXHIBIT SECTION (Restored HEAD Layout) ================= */
  {
    type: "heading",
    label: "Exhibit Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee", "employee"]
  },
  {
    type: "item",
    label: "Why Exhibit",
    icon: Rocket,
    path: "/why-exhibit-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Exhibitor Profile",
    icon: User,
    path: "/exhibitor-profile-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "E-Promotion Management",
    icon: Sparkles,
    path: "/e-promotion-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Stall Designing Vendor",
    icon: Palette,
    path: "/stall-vendor-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
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
    label: "Terms & Conditions",
    icon: FileText,
    path: "/terms-conditions",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
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

  /* ================= HOME SECTION (Restored HEAD Layout) ================= */
  {
    type: "heading",
    label: "Home Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  { type: "item", label: "Home Slider", icon: Image, path: "/carousel" },
  { type: "item", label: "Event Highlights", icon: Sparkles, path: "/event-highlights" },
  { type: "item", label: "About Us", icon: Info, path: "/about-us" },
  { type: "item", label: "Add PDF", icon: FileText, path: "/add-pdf" },
  { type: "item", label: "Marquee Text", icon: Type, path: "/marquee-text" },
  { type: "item", label: "Who We Are", icon: Users, path: "/who-we-are" },
  { type: "item", label: "Featured Services", icon: LayoutDashboard, path: "/featured-services" },
  { type: "item", label: "Glimpse", icon: Images, path: "/glimpse" },
  { type: "item", label: "Our Clients", icon: Users, path: "/clients" },
  { type: "item", label: "Parallax Image", icon: Image, path: "/parallax-manage" },
  { type: "item", label: "Testimonials", icon: MessageSquare, path: "/testimonials-manage" },
  { type: "item", label: "Counters", icon: Ticket, path: "/stats-manage" },

  /* ================= ABOUT PAGE (Restored HEAD Layout) ================= */
  {
    type: "heading",
    label: "About Page",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  { type: "item", label: "Global Platform", icon: Globe, path: "/global-platform" },
  { type: "item", label: "Vision & Mission", icon: Target, path: "/vision-mission" },
  { type: "item", label: "Why Attend", icon: Ticket, path: "/why-attend" },
  { type: "item", label: "Target Audience", icon: Users, path: "/target-audience" },
  { type: "item", label: "Organized By", icon: ShieldCheck, path: "/organized-by" },

  /* ================= VISIT & PARTNERS (Restored Layout) ================= */
  { type: "item", label: "Why Visit", icon: Rocket, path: "/why-visit-manage" },
  { type: "item", label: "Partners", icon: Handshake, path: "/partners-manage" },
  { type: "item", label: "Advisory Board", icon: Users, path: "/advisory-manage" },

  /* ================= GALLERY SECTION (Restored Layout) ================= */
  {
    type: "heading",
    label: "Gallery Section",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },
  { type: "item", label: "Add Images", icon: Image, path: "/gallery-images" },
  { type: "item", label: "Add Video", icon: Play, path: "/gallery-videos" },
  { type: "item", label: "Add Media photo", icon: Images, path: "/gallery-media" },
  { type: "item", label: "Background Images", icon: Image, path: "/hero-images" },

  /* ================= BLOGS & SEO (Restored Layout) ================= */
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

  /* ================= NEW MANAGEMENT (The "New Aaya Hai" Stuff) ================= */
  {
    type: "heading",
    label: "General Management",
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
      { label: "Contact Enquiry", path: "/contact-enquiries" },
      { label: "Buyer Registration", path: "/buyer-registrations" },
    ],
  },
  {
    type: "dropdown",
    label: "Dynamic Content",
    icon: BookOpen,
    children: [
      { label: "Create Page", path: "/create-a-page" },
      { label: "Page Registry", path: "/page-list" },
      { label: "Media Uploads (PDF)", path: "/upload-pdf" },
      { label: "Create News/Post", path: "/create-a-post" },
      { label: "News Registry", path: "/post-list" },
    ],
  },
  {
    type: "dropdown",
    label: "Core Services Hub",
    icon: Sparkles,
    children: [
      { label: "Create Service", path: "/create-service" },
      { label: "Service Registry", path: "/service-list" },
      { label: "Add Facilities", path: "/add-facilities" },
      { label: "Facilities Registry", path: "/facilities-list" },
    ],
  },
  {
    type: "dropdown",
    label: "Portfolio Projects",
    icon: Folder,
    children: [
      { label: "Gallery Category", path: "/gallery-category" },
      { label: "Gallery List", path: "/gallery-list" },
      { label: "Add Project Images", path: "/add-gallery-images" },
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
    label: "Inquiry/Reminder Hub",
    icon: MessageSquare,
    children: [
      { label: "Web Enquiry List", path: "/enquiry-list" },
      { label: "Reminder Registry", path: "/remainder-list" },
      { label: "Legacy Contact List", path: "/contact-list" },
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
      { label: "Client Database Profiles", path: "/profiles" },
    ],
  },

  /* ================= CLIENT DATA ECOSYSTEM ================= */
  {
    type: "heading",
    label: "Client Data Ecosystem",
  },
  {
    type: "dropdown",
    label: "IHWE Data 2026",
    icon: Database,
    children: [
      { label: "Add Master Client", path: "/ihweClientData2026/addNewClients" },
      { label: "New Lead List", path: "/ihweClientData2026/newLeadList" },
      { label: "Warm Client List", path: "/ihweClientData2026/warmClientList" },
      { label: "Hot Client List", path: "/ihweClientData2026/hotClientList" },
      { label: "Confirmed Client List", path: "/ihweClientData2026/confirmClientList" },
      { label: "Cold Client List", path: "/ihweClientData2026/coldClientList" },
      { label: "Master Data", path: "/ihweClientData2026/masterData" },
      { label: "Raw Dataset Registry", path: "/ihweClientData2026/rawDataList" },
    ],
  },
  {
    type: "dropdown",
    label: "Visitor Management",
    icon: Users,
    children: [
      { label: "Add New Visitor", path: "/ihweClientData2026/AddNewVisitor" },
      { label: "Corporate Register Form", path: "/ihweClientData2026/CorporateVisitorForm" },
      { label: "Free Health Camp Form", path: "/ihweClientData2026/FreeHealthCampForm" },
      { label: "General Visitor Form", path: "/ihweClientData2026/GeneralVisitorForm" },
      { label: "Visitor Online Registration", path: "/ihweClientData2026/VisitorRegistration" },
      { label: "Corporate Visitor List", path: "/ihweClientData2026/CorporateVisitorsList" },
      { label: "General Visitor List", path: "/ihweClientData2026/GeneralVisitorsList" },
      { label: "Health Camp Visitor List", path: "/ihweClientData2026/HealthCampVisitorsList" },
      { label: "Visitor Review Logs", path: "/ihweClientData2026/VisitorReview" },
      { label: "General Overview", path: "/ihweClientData2026/GeneralOverview" },
      { label: "Corporate Overview", path: "/ihweClientData2026/CorporateOverview" },
      { label: "Health Camp Overview", path: "/ihweClientData2026/HealthCampOverview" },
    ],
  },
  {
    type: "dropdown",
    label: "System Configuration",
    icon: Settings,
    children: [
      { label: "Banking Config", path: "/ihweClientData2026/AddBank" },
      { label: "Category Setup", path: "/ihweClientData2026/AddCategory" },
      { label: "WhatsApp Messaging", path: "/ihweClientData2026/AddCrmWhatsappMessage" },
      { label: "Data Origins", path: "/ihweClientData2026/AddDataSource" },
      { label: "Event Setup", path: "/ihweClientData2026/AddEvent" },
      { label: "Nature of Business", path: "/ihweClientData2026/AddNatureOfBusiness" },
      { label: "Remark Threshold", path: "/ihweClientData2026/AddRemarkLengthFixed" },
      { label: "Status Setup", path: "/ihweClientData2026/AddStatus" },
      { label: "Target Setup", path: "/ihweClientData2026/AddTarget" },
    ],
  },

  /* ================= ADMINISTRATIVE CONTROL ================= */
  {
    type: "heading",
    label: "Administrative Control",
  },
  {
    type: "dropdown",
    label: "System Management",
    icon: ShieldCheck,
    children: [
      { label: "Add System User", path: "/ihweClientData2026/adduser" },
      { label: "System User List", path: "/ihweClientData2026/userlist" },
      { label: "Permission Roles", path: "/admin-users" },
      { label: "Security Settings", path: "/change-password" },
      { label: "Global Configuration", path: "/settings" },
      { label: "App Preferences", path: "/sidebar-customize" },
    ],
    roles: ["super-admin"]
  },
];
