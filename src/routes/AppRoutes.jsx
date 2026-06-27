import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../layout/LoginPage";
const AdminLayout = lazy(() => import("../layout/AdminLayout"));
const AdminUser = lazy(() => import("../layout/AdminUser"));
const Dashboard = lazy(() => import("../pages/admin_settings/Dashboard"));
const Crosual = lazy(() => import("../pages/cms/HomeSlider"));
const EventHighlightsPage = lazy(() => import("../pages/cms/EventHighlights"));
const FestivalCarousel = lazy(() => import("../pages/cms/FestivalCarousel"));
const EnquiryList = lazy(() => import("../pages/enquiries/EnquiryList"));
const Remainder = lazy(() => import("../pages/admin_settings/Remainder"));
const BookAStand = lazy(() => import("../pages/exhibitors/BookAStand"));

const CreatePage = lazy(() => import("../pages/cms/CreatePage"));
const PageList = lazy(() => import("../pages/cms/PageList"));
const UploadPdf = lazy(() => import("../pages/cms/UploadPdf"));

const Post = lazy(() => import("../pages/cms/CreatePost"));
const PostList = lazy(() => import("../pages/cms/PostList"));
const About = lazy(() => import("../pages/cms/About"));
const WhoWeAre = lazy(() => import("../pages/cms/WhoWeAre"));
const Services = lazy(() => import("../pages/service/Services"));
const FAQManage = lazy(() => import("../pages/cms/FAQManage"));
const HealthcareSectorsManagement = lazy(() => import("../pages/cms/HealthcareSectorsManagement"));
const EPromotionWebManagement = lazy(() => import("../pages/e_promotion/EPromotionWebManagement"));
const AddPdf = lazy(() => import("../pages/cms/AddPdf"));
const StatsCounter = lazy(() => import("../pages/cms/StatsCounter"));
const MarqueeManage = lazy(() => import("../pages/cms/MarqueeManage"));
const Glimpse = lazy(() => import("../pages/cms/Glimpse"));
const ParallaxManage = lazy(() => import("../pages/cms/ParallaxManage"));
const StatsManage = lazy(() => import("../pages/cms/StatsManage"));
const SupportedBy = lazy(() => import("../pages/cms/SupportedBy"));
const UpcomingBrands = lazy(() => import("../pages/UpcomingBrands"));
const Introduction = lazy(() => import("../pages/cms/Introduction"));
const NationalExpo = lazy(() => import("../pages/cms/NationalExpo"));
const IntegratedFormat = lazy(() => import("../pages/cms/IntegratedFormat"));
const WhyParticipateManagement = lazy(() => import("../pages/cms/WhyParticipateManagement"));

const GalleryCategory = lazy(() => import("../pages/portfolio-gallery/GalleryCategory"));
const GalleryList = lazy(() => import("../pages/portfolio-gallery/GalleryList"));
const AddGalleryImages = lazy(() => import("../pages/portfolio-gallery/AddGalleryImages"));
const ManageGalleryImages = lazy(() => import("../pages/portfolio-gallery/ManageGalleryImages"));

const TestimonialsManage = lazy(() => import("../pages/cms/TestimonialsManage"));
const NewTestimonialsManagement = lazy(() => import("../pages/cms/NewTestimonialsManagement"));
const ExhibitorTestimonialsManagement = lazy(() => import("../pages/exhibitors/ExhibitorTestimonialsManagement"));

const AddVacancy = lazy(() => import("../pages/vacancy/AddVacancy"));
const VacancyList = lazy(() => import("../pages/vacancy/VacancyList"));
const CareerList = lazy(() => import("../pages/vacancy/CareerList"));

const Clients = lazy(() => import("../pages/clients/Clients"));

const AddProject = lazy(() => import("../pages/project/AddProject"));
const ProjectList = lazy(() => import("../pages/project/ProjectList"));

const AddBlogs = lazy(() => import("../pages/Blogs/AddBlogs"));
const BlogsList = lazy(() => import("../pages/Blogs/BlogsList"));
const ExpertInsightsManage = lazy(() => import("../pages/Blogs/ExpertInsightsManage"));
const MediaResourcesManage = lazy(() => import("../pages/Blogs/MediaResourcesManage"));
const NewsletterSubscribers = lazy(() => import("../pages/Blogs/NewsletterSubscribers"));

const AddFacility = lazy(() => import("../pages/facilities/AddFacility"));
const FacilityList = lazy(() => import("../pages/facilities/FacilityList"));

const AddCorporateClients = lazy(() => import("../pages/corporate-clients/AddCorporateClients"));
const CorporateList = lazy(() => import("../pages/corporate-clients/CorporateClientsList"));

const AddIndividualClients = lazy(() => import("../pages/individuals/AddIndividualClients"));
const IndividualClientList = lazy(() => import("../pages/individuals/IndividualClientList"));
const IndividualProfile = lazy(() => import("../pages/individuals/IndividualProfile"));
const ContactList = lazy(() => import("../pages/enquiries/ContactList"));
const AddSeo = lazy(() => import("../pages/seo/AddSeo"));
const SeoList = lazy(() => import("../pages/seo/SeoList"));
const AdvancedSeo = lazy(() => import("../pages/seo/AdvancedSeo"));
const SocialMedia = lazy(() => import("../pages/cms/SocialMedia"));
const GlobalPlatform = lazy(() => import("../pages/cms/GlobalPlatform"));
const EventOverviewManagement = lazy(() => import("../pages/cms/EventOverviewManagement"));
const AboutOrganizerManagement = lazy(() => import("../pages/cms/AboutOrganizerManagement"));
const OurJourneyManagement = lazy(() => import("../pages/cms/OurJourneyManagement"));
const VisionMission = lazy(() => import("../pages/cms/VisionMission"));
const WhyAttend = lazy(() => import("../pages/cms/WhyAttend"));
const TargetAudience = lazy(() => import("../pages/cms/TargetAudience"));
const OrganizedBy = lazy(() => import("../pages/cms/OrganizedBy"));
const WhyExhibitManage = lazy(() => import("../pages/cms/WhyExhibitManage"));
const SponsorComparisonManage = lazy(() => import("../pages/partners/SponsorComparisonManage"));
const PartnerCategories = lazy(() => import("../pages/partners/PartnerCategories"));
const LogisticPartnerManage = lazy(() => import("../pages/partners/LogisticPartnerManage"));
const PrintingBrandingPartnerManage = lazy(() => import("../pages/partners/PrintingBrandingPartnerManage"));
const HospitalityPartnerManage = lazy(() => import("../pages/partners/HospitalityPartnerManage"));
const WhyVisitManagement = lazy(() => import("../pages/cms/WhyVisitManagement"));
const ExhibitorProfileManage = lazy(() => import("../pages/exhibitors/ExhibitorProfileManage"));
const HeroImages = lazy(() => import("../pages/cms/HeroImages"));
const CreateServiceDetail = lazy(() => import("../pages/service/CreateServiceDetail"));
const ServiceList = lazy(() => import("../pages/service/ServiceList"));
const EPromotionManage = lazy(() => import("../pages/e_promotion/EPromotionManage"));
const EPromotionRegisters = lazy(() => import("../pages/e_promotion/EPromotionRegisters"));
const EPromotionPackages = lazy(() => import("../pages/e_promotion/EPromotionPackages"));
const ContactEnquiries = lazy(() => import("../pages/enquiries/ContactEnquiries"));
// const BuyerRegistrations = lazy(() => import("../pages/buyer/BuyerRegistrations"));
const BuyerRegistrationDetail = lazy(() => import("../pages/buyers/BuyerRegistrationDetail"));
const BuyerRegistrationEdit = lazy(() => import("../pages/buyers/BuyerRegistrationEdit"));
const BuyerRegistrationConfig = lazy(() => import("../pages/buyers/BuyerRegistrationConfig"));
const InternationalBuyerRegistrationConfig = lazy(() => import("../pages/buyers/InternationalBuyerRegistrationConfig"));
const StallVendorManage = lazy(() => import("../pages/exhibitors/StallVendorManage"));
const ExhibitorListManage = lazy(() => import("../pages/exhibitors/ExhibitorListManage"));
const PartnerManagement = lazy(() => import("../pages/partners/PartnerManagement"));
const AdvisoryManagement = lazy(() => import("../pages/advisory/AdvisoryManagement"));
const ImageGalleryManagement = lazy(() => import("../pages/cms/ImageGalleryManagement"));
const VideoGalleryManagement = lazy(() => import("../pages/cms/VideoGalleryManagement"));
const MediaGalleryManagement = lazy(() => import("../pages/cms/MediaGalleryManagement"));
const MediaCategoryManagement = lazy(() => import("../pages/gallery/MediaCategoryManagement"));
const VideoCategoryManagement = lazy(() => import("../pages/gallery/VideoCategoryManagement"));
const VideoList = lazy(() => import("../pages/gallery/VideoList"));
const ClickAnalytics = lazy(() => import("../pages/admin_settings/ClickAnalytics"));
const ManageStalls = lazy(() => import("../pages/exhibitors/ManageStalls"));
const ManageRegistrations = lazy(() => import("../pages/exhibitors/ManageRegistrations"));
const ManageEvents = lazy(() => import("../pages/admin_settings/ManageEvents"));
const ManageStallRates = lazy(() => import("../pages/exhibitors/ManageStallRates"));
const ManageTerms = lazy(() => import("../pages/admin_settings/ManageTerms"));
const ExhibitorBookingDetail = lazy(() => import("../pages/exhibitors/ExhibitorBookingDetail"));
const FailedPayments = lazy(() => import("../pages/finance/FailedPayments"));
const PaymentDelayWarnings = lazy(() => import("../pages/finance/PaymentDelayWarnings"));
const TravelAccommodationManage = lazy(() => import("../pages/partners/TravelAccommodationManage"));
const AdminBSM = lazy(() => import("../pages/buyer_saller_meet/AdminBSM"));
const ActivityLogs = lazy(() => import("../pages/admin_settings/ActivityLogs"));
const RoleManagement = lazy(() => import("../pages/admin_settings/RoleManagement"));
const DepartmentManagement = lazy(() => import("../pages/admin_settings/DepartmentManagement"));
const RolePermissions = lazy(() => import("../pages/admin_settings/RolePermissions"));
const DesignationManagement = lazy(() => import("../pages/admin_settings/DesignationManagement"));
const PolicyManager = lazy(() => import("../pages/admin_settings/PolicyManager"));
const Settings = lazy(() => import("../pages/admin_settings/Settings"));
const ConferenceTestimonialsManage = lazy(() => import("../pages/conference/ConferenceTestimonialsManage"));
const SidebarCustomize = lazy(() => import("../pages/admin_settings/SidebarCustomize"));
import ProtectedRoute from "./ProtectedRoute";
const AddNewClients = lazy(() => import("../pages/ihwe_client_data_2026/AddNewClients"));
const ColdClientList = lazy(() => import("../pages/ihwe_client_data_2026/ColdClientList"));
const ConfirmClientList = lazy(() => import("../pages/ihwe_client_data_2026/ConfirmClientList"));
const NewLeadList = lazy(() => import("../pages/ihwe_client_data_2026/NewLeadList"));
const WarmClientList = lazy(() => import("../pages/ihwe_client_data_2026/WarmClientList"));
const HotClientList = lazy(() => import("../pages/ihwe_client_data_2026/HotClientList"));
const MasterClientsList = lazy(() => import("../pages/ihwe_client_data_2026/MasterClientsList"));
const RawDataList = lazy(() => import("../pages/ihwe_client_data_2026/RawDataList"));
const UploadExhibitor = lazy(() => import("../pages/ihwe_client_data_2026/UploadExhibitor"));
const AddNewVisitor = lazy(() => import("../pages/web_visitor_data/add_new_visitor/AddNewVisitors"));
const CorporateVisitorForm = lazy(() => import("../pages/web_visitor_data/add_new_visitor/CorporateVisitorForm"));
const FreeHealthCampForm = lazy(() => import("../pages/web_visitor_data/add_new_visitor/FreeHealthCampForm"));
const GeneralVisitorForm = lazy(() => import("../pages/web_visitor_data/add_new_visitor/GeneralVisitorForm"));
const VisitorRegistration = lazy(() => import("../pages/web_visitor_data/add_new_visitor/VisitorRegistration"));
const VisitorRegistrationForm = lazy(() => import("../pages/web_visitor_data/add_new_visitor/VisitorRegistrationForm"));

const CorporateVisitorsList = lazy(() => import("../pages/web_visitor_data/CorporateVisitorsList"));
const GeneralVisitorsList = lazy(() => import("../pages/web_visitor_data/GeneralVisitorsList"));
const HealthCampVisitorsList = lazy(() => import("../pages/web_visitor_data/HealthCampVisitorsList"));

const CorporateOverview = lazy(() => import("../pages/web_visitor_data/overviews/CorporateOverview"));
const GeneralOverview = lazy(() => import("../pages/web_visitor_data/overviews/GeneralOverview"));
const HealthCampOverview = lazy(() => import("../pages/web_visitor_data/overviews/HealthCampOverview"));
const UserList = lazy(() => import("../pages/users/UserList"));
const AddUser = lazy(() => import("../pages/users/AddUser"));
const AddBank = lazy(() => import("../pages/add_by_admin/AddBank"));
const AddCategory = lazy(() => import("../pages/add_by_admin/AddCategory"));
const AddCrmWhatsappMessage = lazy(() => import("../pages/add_by_admin/AddCrmWhatsappMessage"));
const AddDataSource = lazy(() => import("../pages/add_by_admin/AddDataSource"));
const AddEvent = lazy(() => import("../pages/add_by_admin/AddEvent"));
const AddNatureOfBusiness = lazy(() => import("../pages/add_by_admin/AddNatureOfBusiness"));
const AddNextAction = lazy(() => import("../pages/add_by_admin/AddNextAction"));
const AddRemarkLengthFixed = lazy(() => import("../pages/add_by_admin/AddRemarkLengthFixed"));
const AddStatus = lazy(() => import("../pages/add_by_admin/AddStatus"));
const AddTarget = lazy(() => import("../pages/add_by_admin/AddTarget"));
const VisitorReviewLogs = lazy(() => import("../pages/web_visitor_data/VisitorReviewLogs"));
const ClientOverview1 = lazy(() => import("../pages/ihwe_client_data_2026/ClientOverview1"));
const ClientDocuments = lazy(() => import("../pages/ihwe_client_data_2026/ClientDocuments"));
const EmailLogs = lazy(() => import("../pages/admin_settings/EmailLogs"));
const WhatsAppLogs = lazy(() => import("../pages/admin_settings/WhatsAppLogs"));
const ResponseTemplates = lazy(() => import("../pages/admin_settings/ResponseTemplates"));
const BusinessType = lazy(() => import("../pages/admin_management/BusinessType"));
const AnnualTurnover = lazy(() => import("../pages/admin_management/AnnualTurnover"));
const PrimaryProductInterest = lazy(() => import("../pages/admin_management/PrimaryProductInterest"));
const SecondaryProductCategories = lazy(() => import("../pages/admin_management/SecondaryProductCategories"));
const MeetingPriorityLevel = lazy(() => import("../pages/admin_management/MeetingPriorityLevel"));
const DocumentConfiguration = lazy(() => import("../pages/admin_management/DocumentConfiguration"));
const AddDomesticVisitor = lazy(() => import("../pages/web_visitor_data/add_new_visitor/AddDomesticVisitor"));
const BuyerRegistration = lazy(() => import("../pages/buyer/BuyerRegistration"));
const BuyerList = lazy(() => import("../pages/buyer/BuyerList"));
const ManageAccessories = lazy(() => import("../pages/exhibitors/ManageAccessories"));
const AccessoryOrders = lazy(() => import("../pages/exhibitors/AccessoryOrders"));
const ExhibitorChat = lazy(() => import("../pages/exhibitors/ExhibitorChat"));
const CallHistory = lazy(() => import("../pages/admin_settings/CallHistory"));
const AddUnit = lazy(() => import("../pages/admin_management/AddUnit"));
const MarketingToolkitManage = lazy(() => import("../pages/marketing/MarketingToolkitManage"));
const ExhibitorProductsProfile = lazy(() => import("../pages/exhibitors/ExhibitorProductsProfile"));
const Reminder = lazy(() => import("../pages/navbar_page/Reminder"));
const ToDoList = lazy(() => import("../pages/navbar_page/ToDoList"));
const NewLeads = lazy(() => import("../pages/navbar_page/NewLeads"));
const Notification = lazy(() => import("../pages/navbar_page/Notification"));
const NotFound = lazy(() => import("../pages/NotFound"));
const BannerManagement = lazy(() => import("../pages/cms/BannerManagement"));
const SellerSubscriptionPlans = lazy(() => import("../pages/add_by_admin/SellerSubscriptionPlans"));
const SellerServiceRequests = lazy(() => import("../pages/enquiries/SellerServiceRequests"));
const SellerExportInquiries = lazy(() => import("../pages/enquiries/SellerExportInquiries"));
const MobilePassRequests = lazy(() => import("../pages/mobile_app_controls/MobilePassRequests"));
const MobilePassConfig = lazy(() => import("../pages/mobile_app_controls/MobilePassConfig"));
const MobileFeedback = lazy(() => import("../pages/mobile_app_controls/MobileFeedback"));
const AdminReminders = lazy(() => import("../pages/mobile_app_controls/AdminReminders"));
const MobileLeadCaptures = lazy(() => import("../pages/mobile_app_controls/MobileLeadCaptures"));

const InternationalBuyerList = lazy(() => import("../pages/buyer/InternationalBuyerList"));
const InternationalBuyerRegistrationDetail = lazy(() => import("../pages/buyers/InternationalBuyerRegistrationDetail"));
const InternationalBuyerRegistrationEdit = lazy(() => import("../pages/buyers/InternationalBuyerRegistrationEdit"));
const InternationalBuyerRegistration = lazy(() => import("../pages/buyer/InternationalBuyerRegistration"));
const AwardsNominationsList = lazy(() => import("../pages/awards/AwardsNominationsList"));
const ApprovedAwardsList = lazy(() => import("../pages/awards/ApprovedAwardsList"));
const AwardCategoriesManage = lazy(() => import("../pages/awards/AwardCategoriesManage"));
const AwardsNominationDetail = lazy(() => import("../pages/awards/AwardsNominationDetail"));
const AwardsGalleryManage = lazy(() => import("../pages/awards/AwardsGalleryManage"));
const AccountSection1 = lazy(() => import("../pages/ihwe_client_data_2026/AccountSection1"));
const CreateEstimate1 = lazy(() => import("../pages/ihwe_client_data_2026/CreateEstimate1"));
import EstimateDetails from "../pages/ihwe_client_data_2026/invoice/EstimateDetails"
import BuyerRegistrationForm from '../pages/buyer/BuyerRegistrationForm';
const EditEstimate = lazy(() => import("../pages/ihwe_client_data_2026/invoice/EditEstimate"));
const PerformaInvoiceDetails = lazy(() => import("../pages/ihwe_client_data_2026/invoice/PerformaInvoiceDetails"));
const PerformaInvoiceList = lazy(() => import("../pages/ihwe_client_data_2026/invoice/PerformaInvoiceList"));
const CreateInvoice = lazy(() => import("../pages/ihwe_client_data_2026/invoice/CreateInvoice"));
const CreditNote = lazy(() => import("../pages/ihwe_client_data_2026/CreditNote"));
const TaxInvoiceDetails = lazy(() => import("../pages/ihwe_client_data_2026/invoice/TaxInvoiceDetails"));
const InvoiceNumberDetails = lazy(() => import("../pages/ihwe_client_data_2026/invoice/InvoiceNumberDetails"));
const InvoiceList = lazy(() => import("../pages/ihwe_client_data_2026/invoice/InvoiceList"));
const Payments = lazy(() => import("../pages/ihwe_client_data_2026/payments/Payment"));
const AddPayment = lazy(() => import("../pages/dashboard/account/AddPayment"));
const AgendaManagement = lazy(() => import("../pages/conference/AgendaManagement"));
const SpeakerRegistrationList = lazy(() => import("../pages/speakers/SpeakerRegistrationList"));
const SpeakerRegistrationDetail = lazy(() => import("../pages/speakers/SpeakerRegistrationDetail"));
const SpeakerNominationsList = lazy(() => import("../pages/speakers/SpeakerNominationsList"));
const ApprovedSpeakersList = lazy(() => import("../pages/speakers/ApprovedSpeakersList"));
const FloatingVideoManagement = lazy(() => import("../pages/cms/FloatingVideoManagement"));
const ReferralMembers = lazy(() => import("../pages/partners/ReferralMembers"));
const ExpoSupportEnquiries = lazy(() => import("../pages/enquiries/ExpoSupportEnquiries"));
const SponsorshipEnquiries = lazy(() => import("../pages/enquiries/SponsorshipEnquiries"));
const RejectedSpeakersList = lazy(() => import("../pages/speakers/RejectedSpeakersList"));
const RejectedAwardsList = lazy(() => import("../pages/awards/RejectedAwardsList"));
const DistinguishedSpeakersManage = lazy(() => import("../pages/speakers/DistinguishedSpeakersManage"));
const ConferenceDayManagement = lazy(() => import("../pages/conference/ConferenceDayManagement"));
const ConferenceTrackManage = lazy(() => import("../pages/conference/ConferenceTrackManage"));
const MsmePmsSchemeList = lazy(() => import("../pages/msme/MsmePmsSchemeList"));
const MsmePmsSchemeDetail = lazy(() => import("../pages/msme/MsmePmsSchemeDetail"));
const MsmePmsSchemeConfig = lazy(() => import("../pages/msme/MsmePmsSchemeConfig")); const BSMTestimonial = lazy(() => import("../pages/buyer_saller_meet/BSMTestimonial"));
const AdvisoryNominationsList = lazy(() => import("../pages/advisory/AdvisoryNominationsList"));
const AdvisoryNominationDetail = lazy(() => import("../pages/advisory/AdvisoryNominationDetail"));
const MediaRegistrationManage = lazy(() => import("../pages/gallery/MediaRegistrationManagement"));
const ChairmanMessage = lazy(() => import("../pages/cms/ChairmanMessage"));
const PartnerRegistrationsList = lazy(() => import("../pages/partners/PartnerRegistrationsList"));
const PartnerRegistrationDetail = lazy(() => import("../pages/partners/PartnerRegistrationDetail"));
const HotelStayPartnerManage = lazy(() => import("../pages/partners/HotelStayPartnerManage"));
const FabricationPartnerManage = lazy(() => import("../pages/partners/FabricationPartnerManage"));
const TravelPartnerManage = lazy(() => import("../pages/partners/TravelPartnerManage"));
const PerformaInvoices = lazy(() => import("../pages/finance/PerformaInvoices"));
//Account Section
const SalesReport = lazy(() => import("../pages/accounts/SalesReport"));
const CreateDebitNote = lazy(() => import("../pages/finance/CreateDebitNote"));
const CreateInvoicePage = lazy(() => import("../pages/finance/CreateInvoice"));
const BankDetailsManage = lazy(() => import("../pages/accounts/BankDetailsManage"));
// Sales Tools
const SalesTools = lazy(() => import("../pages/sales_tools/SalesTools"));
// Communication
const Communication = lazy(() => import("../pages/communication/Communication"));

// Hero Slider
const ExhibitorHeroSlider = lazy(() => import("../pages/exhibitors/ExhibitorHeroSlider"));
const UpcomingEvent = lazy(() => import("../pages/cms/UpcomingEvent"));

// Marketing Materials
const MarketingMaterialPage = lazy(() => import("../pages/ihwe_client_data_2026/MarketingMaterialPage"));
const MarketingManagement = lazy(() => import("../pages/admin_management/MarketingManagement"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="role-permissions" element={<RolePermissions />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/add-payment" element={<AddPayment />} />
            <Route path="dashboard-banners" element={<BannerManagement />} />
            <Route path="click-analytics" element={<ClickAnalytics />} />
            <Route path="about-us" element={<About />} />
            <Route path="who-we-are" element={<WhoWeAre />} />
            <Route
              path="how-we-work"
              element={<Navigate to="/who-we-are" replace />}
            />
            <Route path="featured-services" element={<Services />} />
            <Route path="healthcare-sectors" element={<HealthcareSectorsManagement />} />
            <Route path="epromotion" element={<EPromotionWebManagement />} />
            <Route path="faq-manage" element={<FAQManage />} />
            <Route path="add-pdf" element={<AddPdf />} />
            <Route path="stats-counter" element={<StatsCounter />} />
            <Route path="global-platform" element={<GlobalPlatform />} />
            <Route path="/event-overview" element={<EventOverviewManagement />} />
            <Route path="/about-organizer" element={<AboutOrganizerManagement />} />
            <Route path="/our-journey" element={<OurJourneyManagement />} />
            <Route path="/vision-mission" element={<VisionMission />} />
            <Route path="why-attend" element={<WhyAttend />} />
            <Route path="target-audience" element={<TargetAudience />} />
            <Route path="organized-by" element={<OrganizedBy />} />
            <Route path="why-exhibit-manage" element={<WhyExhibitManage />} />
            <Route path="sponsor-comparison-manage" element={<SponsorComparisonManage />} />
            <Route path="partner-categories" element={<PartnerCategories />} />
            <Route path="logistic-partner-manage" element={<LogisticPartnerManage />} />
            <Route path="printing-branding-partner-manage" element={<PrintingBrandingPartnerManage />} />
            <Route path="hospitality-partner-manage" element={<HospitalityPartnerManage />} />
            <Route path="travel-accommodation-manage" element={<TravelAccommodationManage />} />
            <Route path="/agenda-management" element={<AgendaManagement />} />
            <Route path="/conference-days-manage" element={<ConferenceDayManagement />} />
            <Route path="/conference-tracks-manage" element={<ConferenceTrackManage />} />
            <Route path="/conference-testimonials-manage" element={<ConferenceTestimonialsManage />} />
            <Route path="/speaker-registration-list" element={<SpeakerNominationsList />} />
            <Route path="/approved-speakers-list" element={<ApprovedSpeakersList />} />
            <Route path="/distinguished-speakers-manage" element={<DistinguishedSpeakersManage />} />
            <Route path="/rejected-speakers-list" element={<RejectedSpeakersList />} />
            <Route path="/speaker-registration/:id" element={<SpeakerRegistrationDetail />} />
            <Route
              path="exhibitor-profile-manage"
              element={<ExhibitorProfileManage />}
            />
            <Route path="performa-invoice/:id" element={<PerformaInvoices />} />
            <Route path="performa-invoice-list/:id" element={<PerformaInvoiceList />} />
            <Route path="create-debit-note" element={<CreateDebitNote />} />
            <Route path="page-create-invoice" element={<CreateInvoicePage />} />
            <Route path="page-create-invoice/:id" element={<CreateInvoicePage />} />
            <Route path="e-promotion-manage" element={<EPromotionManage />} />
            <Route path="why-visit-manage" element={<WhyVisitManagement />} />
            <Route path="marquee-text" element={<MarqueeManage />} />
            <Route path="/glimpse" element={<Glimpse />} />
            <Route path="/supported-by" element={<SupportedBy />} />
            <Route path="/upcoming-brands" element={<UpcomingBrands />} />
            <Route path="/introduction" element={<Introduction />} />
            <Route path="/national-expo" element={<NationalExpo />} />
            <Route path="/integrated-format" element={<IntegratedFormat />} />
            <Route path="/why-participate-manage" element={<WhyParticipateManagement />} />
            <Route path="parallax-manage" element={<ParallaxManage />} />
            <Route path="stats-manage" element={<StatsManage />} />
            <Route path="create-a-post" element={<Post />} />
            <Route path="post-list" element={<PostList />} />
            <Route path="create-a-page" element={<CreatePage />} />
            <Route path="page-list" element={<PageList />} />
            <Route path="upload-pdf" element={<UploadPdf />} />
            <Route path="gallery-category" element={<GalleryCategory />} />
            <Route path="gallery-list" element={<GalleryList />} />
            <Route path="add-gallery-images" element={<AddGalleryImages />} />
            <Route path="manage-gallery-images" element={<ManageGalleryImages />} />
            <Route path="testimonials-manage" element={<TestimonialsManage />} />
            <Route path="new-testimonials-manage" element={<NewTestimonialsManagement />} />
            <Route path="exhibitor-testimonials" element={<ExhibitorTestimonialsManagement />} />
            <Route path="add-vacancy" element={<AddVacancy />} />
            <Route path="vacancy-list" element={<VacancyList />} />
            <Route path="career-list" element={<CareerList />} />
            <Route path="clients" element={<Clients />} />
            <Route path="add-facilities" element={<AddFacility />} />
            <Route path="facilities-list" element={<FacilityList />} />
            <Route path="create-service" element={<CreateServiceDetail />} />
            <Route path="service-list" element={<ServiceList />} />
            <Route path="add-blogs" element={<AddBlogs />} />
            <Route path="blogs-list" element={<BlogsList />} />
            <Route path="blog-experts" element={<ExpertInsightsManage />} />
            <Route path="blog-resources" element={<MediaResourcesManage />} />
            <Route path="blog-subscribers" element={<NewsletterSubscribers />} />
            <Route path="contact-list" element={<ContactList />} />
            <Route path="book-a-stand" element={<BookAStand />} />
            <Route path="book-a-stand/:id" element={<BookAStand />} />
            <Route
              path="e-promotion-registers"
              element={<EPromotionRegisters />}
            />
            <Route path="contact-enquiries" element={<ContactEnquiries />} />
            <Route path="buyer-registration-form" element={<BuyerRegistrationForm />} />
            <Route path="buyer-registration" element={<BuyerRegistration />} />
            <Route
              path="buyer-registration/:id"
              element={<BuyerRegistrationDetail />}
            />
            <Route
              path="buyer-registration/edit/:id"
              element={<BuyerRegistrationEdit />}
            />
            <Route
              path="buyer-registration-config"
              element={<BuyerRegistrationConfig />}
            />
            <Route
              path="international-buyer-registration-config"
              element={<InternationalBuyerRegistrationConfig />}
            />
            <Route path="stall-vendor-manage" element={<StallVendorManage />} />
            <Route
              path="exhibitor-list-manage"
              element={<ExhibitorListManage />}
            />
            <Route
              path="/payments/performanceInvoiceDetails/:id"
              element={<PerformaInvoiceDetails />}
            />
            <Route
              path="/payments/createInvoice/:id"
              element={<CreateInvoice />}
            />
            <Route
              path="/ihweClientData2026/creditNote/:id"
              element={<CreditNote />}
            />
            <Route
              path="/payments/ODT/taxInvoiceDetails/:id"
              element={<TaxInvoiceDetails />}
            />
            <Route
              path="/invoiceNumberDetails/:id"
              element={<InvoiceNumberDetails />}
            />
            <Route
              path="/invoice-list"
              element={<InvoiceList />}
            />
            <Route
              path="/payments/invoiceDetails/:id"
              element={<InvoiceNumberDetails />}
            />
            <Route path="exhibitor-products-profile" element={<ExhibitorProductsProfile />} />
            <Route path="stalls" element={<ManageStalls />} />
            <Route path="exhibitor-bookings" element={<ManageRegistrations />} />
            <Route path="exhibitor-booking/:id" element={<ExhibitorBookingDetail />} />
            <Route path="failed-payments" element={<FailedPayments />} />
            <Route path="payment-delay-warnings" element={<PaymentDelayWarnings />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="stall-rates" element={<ManageStallRates />} />
            <Route path="terms-conditions" element={<ManageTerms />} />

            <Route path="add-meta" element={<AddSeo />} />
            <Route path="meta-list" element={<SeoList />} />
            <Route path="advanced-seo" element={<AdvancedSeo />} />
            <Route path="social-media" element={<SocialMedia />} />
            <Route path="hero-images" element={<HeroImages />} />
            <Route path="edit-hero-image/:id" element={<HeroImages />} />
            <Route
              path="add-corporate-clients"
              element={<AddCorporateClients />}
            />
            <Route path="corporate-clients-list" element={<CorporateList />} />
            <Route
              path="add-individual-clients"
              element={<AddIndividualClients />}
            />
            <Route
              path="individual-clients-list"
              element={<IndividualClientList />}
            />
            <Route path="partners-manage" element={<PartnerManagement />} />
            <Route path="advisory-manage" element={<AdvisoryManagement />} />
            <Route path="gallery-images" element={<ImageGalleryManagement />} />
            <Route path="gallery-videos" element={<VideoGalleryManagement />} />
            <Route path="video-category" element={<VideoCategoryManagement />} />
            <Route path="video-list" element={<VideoList />} />
            <Route path="media-category" element={<MediaCategoryManagement />} />
            <Route path="gallery-media" element={<MediaGalleryManagement />} />
            <Route path="profiles" element={<IndividualProfile />} />
            <Route path="festival-carousels" element={<FestivalCarousel />} />
            <Route path="carousel" element={<Crosual />} />
            <Route path="event-highlights" element={<EventHighlightsPage />} />
            <Route path="enquiry-list" element={<EnquiryList />} />
            <Route path="remainder-list" element={<Remainder />} />
            <Route path="admin-users" element={<AdminUser />} />
            <Route path="settings" element={<Settings />} />
            <Route path="sidebar-customize" element={<SidebarCustomize />} />
            <Route path="addnewclient" element={<AddNewClients />} />
            <Route path="email-logs" element={<EmailLogs />} />
            <Route path="whatsapp-logs" element={<WhatsAppLogs />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="manage-roles" element={<RoleManagement />} />
            <Route path="manage-departments" element={<DepartmentManagement />} />
            <Route path="manage-designations" element={<DesignationManagement />} />
            <Route path="response-templates" element={<ResponseTemplates />} />
            <Route path="policy-manager" element={<PolicyManager />} />
            <Route path="exhibitor-hero-slider" element={<ExhibitorHeroSlider />} />
            <Route path="upcoming-events" element={<UpcomingEvent />} />
            <Route
              path="ihweClientData2026/addNewClients"
              element={<AddNewClients />}
            />
            <Route
              path="ihweClientData2026/addNewClients/:id"
              element={<AddNewClients />}
            />
            <Route
              path="ihweClientData2026/newLeadList"
              element={<NewLeadList />}
            />
            <Route
              path="ihweClientData2026/warmClientList"
              element={<WarmClientList />}
            />
            <Route
              path="ihweClientData2026/hotClientList"
              element={<HotClientList />}
            />
            <Route
              path="ihweClientData2026/confirmClientList"
              element={<ConfirmClientList />}
            />
            <Route
              path="ihweClientData2026/coldClientList"
              element={<ColdClientList />}
            />
            <Route
              path="ihweClientData2026/masterData"
              element={<MasterClientsList />}
            />
            <Route
              path="ihweClientData2026/rawDataList"
              element={<RawDataList />}
            />
            <Route
              path="ihweClientData2026/uploadExhibitor"
              element={<UploadExhibitor />}
            />
            <Route
              path="ihweClientData2026/accountSection1/:id"
              element={<AccountSection1 />}
            />
            <Route
              path="ihweClientData2026/createEstimate1/:id"
              element={<CreateEstimate1 />}
            />
            <Route
              path="payments/estimateDetails/:id"
              element={<EstimateDetails />}
            />
            <Route path="/payments/estimateEdit/:id" element={<EditEstimate />} />
            <Route
              path="/ihweClientData2026/payments/:id"
              element={<Payments />}
            />
            {/* <Route
            path="ihweClientData2026/AddNewVisitor"
            element={<VisitorRegistration />}
          /> */}
            <Route
              path="ihweClientData2026/VisitorRegistrationForm"
              element={<VisitorRegistrationForm />}
            />
            <Route
              path="ihweClientData2026/AddNewVisitor"
              element={<AddDomesticVisitor />}
            />
            <Route
              path="ihweClientData2026/CorporateVisitorForm"
              element={<VisitorRegistration initialType="corporate" hideTabs={true} />}
            />
            <Route
              path="ihweClientData2026/FreeHealthCampForm"
              element={<VisitorRegistration initialType="freeHealth" hideTabs={true} />}
            />
            <Route
              path="ihweClientData2026/GeneralVisitorForm"
              element={<VisitorRegistration initialType="general" hideTabs={true} />}
            />
            <Route
              path="ihweClientData2026/VisitorRegistration"
              element={<VisitorRegistration />}
            />
            <Route
              path="ihweClientData2026/CorporateVisitorsList"
              element={<CorporateVisitorsList />}
            />
            <Route
              path="ihweClientData2026/GeneralVisitorsList"
              element={<GeneralVisitorsList />}
            />
            <Route
              path="ihweClientData2026/FreeHealthCampVisitorsList"
              element={<HealthCampVisitorsList />}
            />
            <Route
              path="ihweClientData2026/VisitorReview"
              element={<VisitorReviewLogs />}
            />
            <Route
              path="ihweClientData2026/CorporateOverview"
              element={<CorporateOverview />}
            />
            <Route
              path="ihweClientData2026/GeneralOverview"
              element={<GeneralOverview />}
            />
            <Route
              path="ihweClientData2026/HealthCampOverview"
              element={<HealthCampOverview />}
            />
            <Route
              path="webVisitorData/corporateVisitorDetails/:id"
              element={<CorporateOverview />}
            />
            <Route
              path="webVisitorData/generalVisitorDetails/:id"
              element={<GeneralOverview />}
            />
            <Route
              path="webVisitorData/healthCampVisitorDetails/:id"
              element={<HealthCampOverview />}
            />

            <Route path="ihweClientData2026/adduser" element={<AddUser />} />
            <Route path="ihweClientData2026/userlist" element={<UserList />} />
            <Route path="ihweClientData2026/AddBank" element={<AddBank />} />
            <Route
              path="ihweClientData2026/AddCategory"
              element={<AddCategory />}
            />
            <Route
              path="ihweClientData2026/AddCrmWhatsappMessage"
              element={<AddCrmWhatsappMessage />}
            />
            <Route
              path="ihweClientData2026/AddDataSource"
              element={<AddDataSource />}
            />
            <Route path="ihweClientData2026/AddEvent" element={<AddEvent />} />
            <Route
              path="ihweClientData2026/AddNatureOfBusiness"
              element={<AddNatureOfBusiness />}
            />
            <Route
              path="ihweClientData2026/AddRemarkLengthFixed"
              element={<AddRemarkLengthFixed />}
            />
            <Route path="ihweClientData2026/AddStatus" element={<AddStatus />} />
            <Route path="ihweClientData2026/AddTarget" element={<AddTarget />} />
            <Route path="ihweClientData2026/AddNextAction" element={<AddNextAction />} />
         // ############################# -- Account Section
            <Route path="accounts/salesreport" element={<SalesReport />} />
            <Route path="accounts/bank-details" element={<BankDetailsManage />} />

        // ############################# -- Account Section
            <Route path="/client-overview/:id" element={<ClientOverview1 />} />
            <Route path="/client-documents/:id" element={<ClientDocuments />} />
            <Route path="/client-data/:id/marketing-materials" element={<MarketingMaterialPage />} />
            <Route path="/admin/marketing-management" element={<MarketingManagement />} />
            <Route path="/business-type" element={<BusinessType />} />
            <Route path="/annual-turnover" element={<AnnualTurnover />} />
            <Route path="/primary-product-interest" element={<PrimaryProductInterest />} />
            <Route path="/secondary-product-categories" element={<SecondaryProductCategories />} />
            <Route path="/meeting-priority-level" element={<MeetingPriorityLevel />} />
            <Route path="/document-configuration" element={<DocumentConfiguration />} />
            <Route path="manage-registrations" element={<ManageRegistrations />} />
            <Route path="bsm-management" element={<AdminBSM />} />
            <Route path="/buyer-list" element={<BuyerList />} />
            <Route path="/stall-accessories" element={<ManageAccessories />} />
            <Route path="/accessory-orders" element={<AccessoryOrders />} />
            <Route path="/exhibitor-chat" element={<ExhibitorChat />} />
            <Route path="/call-history" element={<CallHistory />} />
            <Route path="/e-promotion-packages" element={<EPromotionPackages />} />
            <Route path="/add-unit" element={<AddUnit />} />
            <Route path="/seller-subscription-plans" element={<SellerSubscriptionPlans />} />
            <Route path="/seller-service-requests" element={<SellerServiceRequests />} />
            <Route path="/seller-export-inquiries" element={<SellerExportInquiries />} />
            <Route path="/mobile-pass-requests" element={<MobilePassRequests />} />
            <Route path="/mobile-pass-config" element={<MobilePassConfig />} />
            <Route path="/mobile-feedback" element={<MobileFeedback />} />
            <Route path="/mobile-lead-captures" element={<MobileLeadCaptures />} />
            <Route path="/marketing-toolkit-manage" element={<MarketingToolkitManage />} />
            <Route path="/reminder" element={<Reminder />} />
            <Route path="/reminders" element={<AdminReminders />} />
            <Route path="/to-do-list" element={<ToDoList />} />
            <Route path="/new-leads" element={<NewLeads />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/floating-video-management" element={<FloatingVideoManagement />} />
            <Route path="/referral-members" element={<ReferralMembers />} />
            <Route path="/expo-support-enquiries" element={<ExpoSupportEnquiries />} />
            <Route path="/sponsorship-enquiries" element={<SponsorshipEnquiries />} />
            <Route path="/media-registration-manage" element={<MediaRegistrationManage />} />

            <Route path="*" element={<NotFound />} />
            <Route path="/international-buyer-list" element={<InternationalBuyerList />} />
            <Route path="/international-buyer/:id" element={<InternationalBuyerRegistrationDetail />} />
            <Route path="/international-buyer/edit/:id" element={<InternationalBuyerRegistrationEdit />} />
            <Route path="/international-buyer-registration" element={<InternationalBuyerRegistration />} />
            <Route path="/awards-nominations" element={<AwardsNominationsList />} />
            <Route path="/approved-awards-list" element={<ApprovedAwardsList />} />
            <Route path="/awards-nominations/:id" element={<AwardsNominationDetail />} />
            <Route path="/award-categories-manage" element={<AwardCategoriesManage />} />
            <Route path="/awards-gallery-manage" element={<AwardsGalleryManage />} />
            <Route path="/rejected-awards-list" element={<RejectedAwardsList />} />
            <Route path="/msme-pms-scheme-list" element={<MsmePmsSchemeList />} />
            <Route path="/msme-pms-scheme/:id" element={<MsmePmsSchemeDetail />} />
            <Route path="/msme-pms-scheme-config" element={<MsmePmsSchemeConfig />} />
            <Route path="/bsm-testimonial" element={<BSMTestimonial />} />
            <Route path="advisory-nominations" element={<AdvisoryNominationsList />} />
            <Route path="advisory-nominations/:id" element={<AdvisoryNominationDetail />} />
            <Route path="partner-registrations" element={<PartnerRegistrationsList />} />
            <Route path="partner-registrations/:id" element={<PartnerRegistrationDetail />} />
            <Route path="hotel-stay-partner-manage" element={<HotelStayPartnerManage />} />
            <Route path="fabrication-partner-manage" element={<FabricationPartnerManage />} />
            <Route path="travel-partner-manage" element={<TravelPartnerManage />} />

            <Route path="chairman-message" element={<ChairmanMessage />} />

            {/* Sales Tools */}
            <Route path="sales-tools" element={<SalesTools />} />

            {/* Communication */}
            <Route path="communication" element={<Communication />} />

          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
