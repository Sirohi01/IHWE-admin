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
    type: "item",
    label: "Home Slider",
    icon: Images,
    path: "/carousel",
  },

  {
    type: "item",
    label: "Event Highlights",
    icon: CalendarCheck,
    path: "/event-highlights",
  },

  {
    type: "item",
    label: "About Us",
    icon: Info,
    path: "/about-us",
  },
  {
    type: "item",
    label: "Add PDF",
    icon: FileText,
    path: "/add-pdf",
  },
  {
    type: "item",
    label: "Marquee Text",
    icon: Type,
    path: "/marquee-text",
  },
  {
    type: "item",
    label: "Who We Are",
    icon: HelpCircle,
    path: "/who-we-are",
  },
  {
    type: "item",
    label: "Featured Services",
    icon: Briefcase,
    path: "/featured-services",
  },
  {
    type: "item",
    label: "Glimpse",
    icon: Images,
    path: "/glimpse",
  },
  {
    type: "item",
    label: "Our Clients",
    icon: Building2,
    path: "/clients",
  },
  {
    type: "item",
    label: "Parallax Image",
    icon: LayoutDashboard,
    path: "/parallax-manage",
  },
  {
    type: "item",
    label: "Testimonials",
    icon: MessageSquare,
    path: "/testimonials-manage",
  },
  {
    type: "item",
    label: "Counters",
    icon: TrendingUp,
    path: "/stats-manage",
  },

  {
    type: "heading",
    label: "About Section",
  },
  {
    type: "item",
    label: "Global Platform",
    icon: HelpCircle,
    path: "/global-platform",
  },
  {
    type: "item",
    label: "Vision & Mission",
    icon: Target,
    path: "/vision-mission",
  },
  {
    type: "item",
    label: "Why Attend",
    icon: CalendarCheck,
    path: "/why-attend",
  },

  {
    type: "item",
    label: "Target Audience",
    icon: UserCheck,
    path: "/target-audience",
  },
  {
    type: "item",
    label: "Organized By",
    icon: Building2,
    path: "/organized-by",
  },



  /* ================= EXHIBIT SECTION ================= */
  {
    type: "heading",
    label: "Exhibit Section",
  },
  {
    type: "item",
    label: "Why Exhibit",
    icon: Rocket,
    path: "/why-exhibit-manage",
  },
  {
    type: "item",
    label: "Exhibitor Profile",
    icon: UserCheck,
    path: "/exhibitor-profile-manage",
  },
  {
    type: "item",
    label: "E-Promotion Management",
    icon: Rocket,
    path: "/e-promotion-manage",
  },
  {
    type: "item",
    label: "Stall Designing Vendor",
    icon: Palette,
    path: "/stall-vendor-manage",
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
    type: "item",
    label: "Add Images",
    icon: Images,
    path: "/gallery-images",
  },
  {
    type: "item",
    label: "Add Video",
    icon: Play,
    path: "/gallery-videos",
  },
  {
    type: "item",
    label: "Add Media photo",
    icon: Globe,
    path: "/gallery-media",
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

  /* ================= SETTINGS SECTION ================= */
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