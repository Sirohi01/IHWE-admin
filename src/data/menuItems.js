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
} from "lucide-react";

export const menuItems = [
  /* ================= DASHBOARD ================= */
  {
    type: "item",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["super-admin", "accountant-admin", "accountant-employee", "marketing-admin", "marketing-employee", "digital-admin", "digital-employee", "employee"]
  },

  /* ================= ANALYTICS SECTION ================= */
  {
    type: "heading",
    label: "Analytics Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  {
    type: "item",
    label: "Click Analytics",
    icon: TrendingUp,
    path: "/click-analytics",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  /* ================= EXHIBIT SECTION ================= */
  {
    type: "heading",
    label: "Exhibit Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
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
    icon: UserCheck,
    path: "/exhibitor-profile-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "E-Promotion Management",
    icon: Rocket,
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
    icon: Users,
    path: "/exhibitor-bookings",
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee", "employee"]
  },
  {
    type: "item",
    label: "Book A Stand",
    icon: Ticket,
    path: "/book-a-stand",
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee"]
  },

  /* ================= HOME SECTION ================= */
  {
    type: "heading",
    label: "Home Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  {
    type: "item",
    label: "Home Slider",
    icon: Images,
    path: "/carousel",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  {
    type: "item",
    label: "Event Highlights",
    icon: CalendarCheck,
    path: "/event-highlights",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  {
    type: "item",
    label: "About Us",
    icon: Info,
    path: "/about-us",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Add PDF",
    icon: FileText,
    path: "/add-pdf",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Marquee Text",
    icon: Type,
    path: "/marquee-text",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Who We Are",
    icon: HelpCircle,
    path: "/who-we-are",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Featured Services",
    icon: Briefcase,
    path: "/featured-services",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Glimpse",
    icon: Images,
    path: "/glimpse",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Our Clients",
    icon: Building2,
    path: "/clients",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Parallax Image",
    icon: LayoutDashboard,
    path: "/parallax-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Testimonials",
    icon: MessageSquare,
    path: "/testimonials-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Counters",
    icon: TrendingUp,
    path: "/stats-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  {
    type: "heading",
    label: "About Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Global Platform",
    icon: HelpCircle,
    path: "/global-platform",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Vision & Mission",
    icon: Target,
    path: "/vision-mission",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Why Attend",
    icon: CalendarCheck,
    path: "/why-attend",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  {
    type: "item",
    label: "Target Audience",
    icon: UserCheck,
    path: "/target-audience",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Organized By",
    icon: Building2,
    path: "/organized-by",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },



  /* ================= VISIT SECTION ================= */
  {
    type: "heading",
    label: "Visit Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Why Visit",
    icon: Rocket,
    path: "/why-visit-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  /* ================= PARTNERS SECTION ================= */
  {
    type: "heading",
    label: "Partners Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Add Partners",
    icon: Handshake,
    path: "/partners-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  /* ================= ADVISORY SECTION ================= */
  {
    type: "heading",
    label: "Advisory Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },
  {
    type: "item",
    label: "Add Advisory member",
    icon: Users,
    path: "/advisory-manage",
    roles: ["super-admin", "marketing-admin", "marketing-employee"]
  },

  /* ================= GALLERY SECTION ================= */
  {
    type: "heading",
    label: "Gallery Section",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },
  {
    type: "item",
    label: "Add Images",
    icon: Images,
    path: "/gallery-images",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },
  {
    type: "item",
    label: "Add Video",
    icon: Play,
    path: "/gallery-videos",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },
  {
    type: "item",
    label: "Add Media photo",
    icon: Globe,
    path: "/gallery-media",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },



  /* ================= BLOGS SECTION ================= */
  {
    type: "heading",
    label: "Blogs Section",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },
  {
    type: "dropdown",
    label: "Blogs",
    icon: FileText,
    roles: ["super-admin", "digital-admin", "digital-employee"],
    children: [
      { label: "Add Blogs", path: "/add-blogs" },
      { label: "Blogs List", path: "/blogs-list" },
    ],
  },



  /* ================= BACKGROUND IMAGES SECTION ================= */
  {
    type: "heading",
    label: "Background Images Section",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },
  {
    type: "item",
    label: "Background Images",
    icon: Images,
    path: "/hero-images",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },


  /* ================= SEO SECTION ================= */
  {
    type: "heading",
    label: "SEO Section",
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },
  {
    type: "dropdown",
    label: "SEO Manager",
    icon: TrendingUp,
    roles: ["super-admin", "digital-admin", "digital-employee"],
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
    roles: ["super-admin", "digital-admin", "digital-employee"]
  },

  /* ================= REGISTRATION SECTION ================= */
  {
    type: "heading",
    label: "Registration Section",
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee"]
  },
  {
    type: "item",
    label: "E-Promotion Registers",
    icon: List,
    path: "/e-promotion-registers",
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee"]
  },
  {
    type: "item",
    label: "Contact Enquiry",
    path: "/contact-enquiries",
    icon: MessageSquare,
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee"]
  },
  {
    type: "item",
    label: "Buyer Registration",
    path: "/buyer-registrations",
    icon: Users,
    roles: ["super-admin", "marketing-admin", "marketing-employee", "accountant-admin", "accountant-employee"]
  },

  /* ================= SETTINGS SECTION ================= */
  {
    type: "heading",
    label: "Account Section",
    roles: ["super-admin", "accountant-admin", "accountant-employee", "marketing-admin", "marketing-employee", "digital-admin", "digital-employee"]
  },
  {
    type: "item",
    label: "Manage Users",
    icon: ShieldCheck,
    path: "/admin-users",
    roles: ["super-admin", "accountant-admin", "accountant-employee", "marketing-admin", "marketing-employee", "digital-admin", "digital-employee"]
  },
  {
    type: "item",
    label: "Change Password",
    icon: Lock,
    path: "/change-password",
    roles: ["super-admin", "accountant-admin", "accountant-employee", "marketing-admin", "marketing-employee", "digital-admin", "digital-employee", "employee"]
  },

  {
    type: "item",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ["super-admin"]
  },
  {
    type: "item",
    label: "Customize Sidebar",
    icon: Palette,
    path: "/sidebar-customize",
    roles: ["super-admin"]
  },
];