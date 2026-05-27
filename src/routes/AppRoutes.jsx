import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../layout/LoginPage";
import AdminLayout from "../layout/AdminLayout";
import AdminUser from "../layout/AdminUser";

import Dashboard from "../pages/Dashboard";
import ChangePassword from "../pages/ChangePassword";
import Crosual from "../pages/HomeSlider";
import EventHighlightsPage from "../pages/EventHighlights";
import FestivalCarousel from "../pages/FestivalCarousel";
import EnquiryList from "../pages/EnquiryList";
import Remainder from "../pages/Remainder";
import BookAStand from "../pages/BookAStand";

import CreatePage from "../pages/CreatePage";
import PageList from "../pages/PageList";
import UploadPdf from "../pages/UploadPdf";

import Post from "../pages/CreatePost";
import PostList from "../pages/PostList";
import About from "../pages/About";
import WhoWeAre from "../pages/WhoWeAre";
import Services from "../pages/Services";
import FAQManage from "../pages/FAQManage";
import HealthcareSectorsManagement from "../pages/HealthcareSectorsManagement";
import EPromotionWebManagement from "../pages/EPromotionWebManagement";
import AddPdf from "../pages/AddPdf";
import StatsCounter from "../pages/StatsCounter";
import MarqueeManage from "../pages/MarqueeManage";
import Glimpse from "../pages/Glimpse";
import ParallaxManage from "../pages/ParallaxManage";
import StatsManage from "../pages/StatsManage";
import SupportedBy from "../pages/SupportedBy";
import Introduction from "../pages/Introduction";
import NationalExpo from "../pages/NationalExpo";
import IntegratedFormat from "../pages/IntegratedFormat";
import WhyParticipateManagement from "../pages/WhyParticipateManagement";

import GalleryCategory from "../pages/portfolio-gallery/GalleryCategory";
import GalleryList from "../pages/portfolio-gallery/GalleryList";
import AddGalleryImages from "../pages/portfolio-gallery/AddGalleryImages";
import ManageGalleryImages from "../pages/portfolio-gallery/ManageGalleryImages";

import TestimonialsManage from "../pages/TestimonialsManage";
import NewTestimonialsManagement from "../pages/NewTestimonialsManagement";
import ExhibitorTestimonialsManagement from "../pages/ExhibitorTestimonialsManagement";

import AddVacancy from "../pages/vacancy/AddVacancy";
import VacancyList from "../pages/vacancy/VacancyList";
import CareerList from "../pages/vacancy/CareerList";

import Clients from "../pages/Clients";

import AddProject from "../pages/project/AddProject";
import ProjectList from "../pages/project/ProjectList";

import AddBlogs from "../pages/Blogs/AddBlogs";
import BlogsList from "../pages/Blogs/BlogsList";
import ExpertInsightsManage from "../pages/Blogs/ExpertInsightsManage";
import MediaResourcesManage from "../pages/Blogs/MediaResourcesManage";
import NewsletterSubscribers from "../pages/Blogs/NewsletterSubscribers";

import AddFacility from "../pages/facilities/AddFacility";
import FacilityList from "../pages/facilities/FacilityList";

import AddCorporateClients from "../pages/corporate-clients/AddCorporateClients";
import CorporateList from "../pages/corporate-clients/CorporateClientsList";

import AddIndividualClients from "../pages/individuals/AddIndividualClients";
import IndividualClientList from "../pages/individuals/IndividualClientList";
import IndividualProfile from "../pages/individuals/IndividualProfile";
import ContactList from "../pages/ContactList";
import AddSeo from "../pages/seo/AddSeo";
import SeoList from "../pages/seo/SeoList";
import AdvancedSeo from "../pages/seo/AdvancedSeo";
import SocialMedia from "../pages/SocialMedia";
import GlobalPlatform from "../pages/GlobalPlatform";
import EventOverviewManagement from "../pages/EventOverviewManagement";
import AboutOrganizerManagement from "../pages/AboutOrganizerManagement";
import OurJourneyManagement from "../pages/OurJourneyManagement";
import VisionMission from "../pages/VisionMission";
import WhyAttend from "../pages/WhyAttend";
import TargetAudience from "../pages/TargetAudience";
import OrganizedBy from "../pages/OrganizedBy";
import WhyExhibitManage from "../pages/WhyExhibitManage";
import SponsorComparisonManage from "../pages/SponsorComparisonManage";
import PartnerCategories from "../pages/PartnerCategories";
import LogisticPartnerManage from "../pages/LogisticPartnerManage";
import PrintingBrandingPartnerManage from "../pages/PrintingBrandingPartnerManage";
import HospitalityPartnerManage from "../pages/HospitalityPartnerManage";
import WhyVisitManagement from "../pages/WhyVisitManagement";
import ExhibitorProfileManage from "../pages/ExhibitorProfileManage";
import HeroImages from "../pages/HeroImages";
import CreateServiceDetail from "../pages/service/CreateServiceDetail";
import ServiceList from "../pages/service/ServiceList";
import EPromotionManage from "../pages/EPromotionManage";
import EPromotionRegisters from "../pages/EPromotionRegisters";
import EPromotionPackages from "../pages/e_promotion/EPromotionPackages";
import ContactEnquiries from "../pages/ContactEnquiries";
// import BuyerRegistrations from "../pages/buyer/BuyerRegistrations";
import BuyerRegistrationDetail from "../pages/BuyerRegistrationDetail";
import BuyerRegistrationEdit from "../pages/BuyerRegistrationEdit";
import BuyerRegistrationConfig from "../pages/BuyerRegistrationConfig";
import InternationalBuyerRegistrationConfig from "../pages/InternationalBuyerRegistrationConfig";
import StallVendorManage from "../pages/StallVendorManage";
import ExhibitorListManage from "../pages/ExhibitorListManage";
import PartnerManagement from "../pages/PartnerManagement";
import AdvisoryManagement from "../pages/AdvisoryManagement";
import ImageGalleryManagement from "../pages/ImageGalleryManagement";
import VideoGalleryManagement from "../pages/VideoGalleryManagement";
import MediaGalleryManagement from "../pages/MediaGalleryManagement";
import MediaCategoryManagement from "../pages/gallery/MediaCategoryManagement";
import VideoCategoryManagement from "../pages/gallery/VideoCategoryManagement";
import VideoList from "../pages/gallery/VideoList";
import ClickAnalytics from "../pages/ClickAnalytics";
import ManageStalls from "../pages/ManageStalls";
import ManageRegistrations from "../pages/ManageRegistrations";
import ManageEvents from "../pages/ManageEvents";
import ManageStallRates from "../pages/ManageStallRates";
import ManageTerms from "../pages/ManageTerms";
import ExhibitorBookingDetail from "../pages/ExhibitorBookingDetail";
import FailedPayments from "../pages/FailedPayments";
import PaymentDelayWarnings from "../pages/PaymentDelayWarnings";
import TravelAccommodationManage from "../pages/TravelAccommodationManage";
import AdminBSM from "../pages/AdminBSM";
import ActivityLogs from "../pages/ActivityLogs";
import RoleManagement from "../pages/RoleManagement";
import RolePermissions from "../pages/RolePermissions";
import PolicyManager from "../pages/PolicyManager";
import Settings from "../pages/Settings";
import ConferenceTestimonialsManage from "../pages/ConferenceTestimonialsManage";
import SidebarCustomize from "../pages/SidebarCustomize";
import ProtectedRoute from "./ProtectedRoute";
import AddNewClients from "../pages/ihwe_client_data_2026/AddNewClients";
import ColdClientList from "../pages/ihwe_client_data_2026/ColdClientList";
import ConfirmClientList from "../pages/ihwe_client_data_2026/ConfirmClientList";
import NewLeadList from "../pages/ihwe_client_data_2026/NewLeadList";
import WarmClientList from "../pages/ihwe_client_data_2026/WarmClientList";
import HotClientList from "../pages/ihwe_client_data_2026/HotClientList";
import MasterClientsList from "../pages/ihwe_client_data_2026/MasterClientsList";
import RawDataList from "../pages/ihwe_client_data_2026/RawDataList";
import UploadExhibitor from "../pages/ihwe_client_data_2026/UploadExhibitor";
import AddNewVisitor from "../pages/web_visitor_data/add_new_visitor/AddNewVisitors";
import CorporateVisitorForm from "../pages/web_visitor_data/add_new_visitor/CorporateVisitorForm";
import FreeHealthCampForm from "../pages/web_visitor_data/add_new_visitor/FreeHealthCampForm";
import GeneralVisitorForm from "../pages/web_visitor_data/add_new_visitor/GeneralVisitorForm";
import VisitorRegistration from "../pages/web_visitor_data/add_new_visitor/VisitorRegistration";

import CorporateVisitorsList from "../pages/web_visitor_data/CorporateVisitorsList";
import GeneralVisitorsList from "../pages/web_visitor_data/GeneralVisitorsList";
import HealthCampVisitorsList from "../pages/web_visitor_data/HealthCampVisitorsList";

import CorporateOverview from "../pages/web_visitor_data/overviews/CorporateOverview";
import GeneralOverview from "../pages/web_visitor_data/overviews/GeneralOverview";
import HealthCampOverview from "../pages/web_visitor_data/overviews/HealthCampOverview";
import UserList from "../pages/users/UserList";
import AddUser from "../pages/users/AddUser";
import AddBank from "../pages/add_by_admin/AddBank";
import AddCategory from "../pages/add_by_admin/AddCategory";
import AddCrmWhatsappMessage from "../pages/add_by_admin/AddCrmWhatsappMessage";
import AddDataSource from "../pages/add_by_admin/AddDataSource";
import AddEvent from "../pages/add_by_admin/AddEvent";
import AddNatureOfBusiness from "../pages/add_by_admin/AddNatureOfBusiness";
import AddRemarkLengthFixed from "../pages/add_by_admin/AddRemarkLengthFixed";
import AddStatus from "../pages/add_by_admin/AddStatus";
import AddTarget from "../pages/add_by_admin/AddTarget";
import VisitorReviewLogs from "../pages/web_visitor_data/VisitorReviewLogs";
import ClientOverview1 from "../pages/ihwe_client_data_2026/ClientOverview1";
import EmailLogs from "../pages/EmailLogs";
import WhatsAppLogs from "../pages/WhatsAppLogs";
import ResponseTemplates from "../pages/ResponseTemplates";
import BusinessType from "../pages/admin_management/BusinessType";
import AnnualTurnover from "../pages/admin_management/AnnualTurnover";
import PrimaryProductInterest from "../pages/admin_management/PrimaryProductInterest";
import SecondaryProductCategories from "../pages/admin_management/SecondaryProductCategories";
import MeetingPriorityLevel from "../pages/admin_management/MeetingPriorityLevel";
import AddDomesticVisitor from "../pages/web_visitor_data/add_new_visitor/AddDomesticVisitor";
import BuyerRegistration from "../pages/buyer/BuyerRegistration";
import BuyerList from "../pages/buyer/BuyerList";
import ManageAccessories from "../pages/ManageAccessories";
import AccessoryOrders from "../pages/AccessoryOrders";
import ExhibitorChat from "../pages/ExhibitorChat";
import CallHistory from "../pages/CallHistory";
import AddUnit from "../pages/admin_management/AddUnit";
import MarketingToolkitManage from "../pages/MarketingToolkitManage";
import ExhibitorProductsProfile from "../pages/ExhibitorProductsProfile";
import Reminder from "../pages/navbar_page/Reminder";
import ToDoList from "../pages/navbar_page/ToDoList";
import NewLeads from "../pages/navbar_page/NewLeads";
import Notification from "../pages/navbar_page/Notification";
import NotFound from "../pages/NotFound";
import BannerManagement from "../pages/BannerManagement";
import SellerSubscriptionPlans from "../pages/add_by_admin/SellerSubscriptionPlans";
import SellerServiceRequests from "../pages/SellerServiceRequests";
import SellerExportInquiries from "../pages/SellerExportInquiries";
import InternationalBuyerList from "../pages/buyer/InternationalBuyerList";
import InternationalBuyerRegistrationDetail from "../pages/InternationalBuyerRegistrationDetail";
import InternationalBuyerRegistrationEdit from "../pages/InternationalBuyerRegistrationEdit";
import InternationalBuyerRegistration from "../pages/buyer/InternationalBuyerRegistration";
import AwardsNominationsList from "../pages/AwardsNominationsList";
import ApprovedAwardsList from "../pages/ApprovedAwardsList";
import AwardCategoriesManage from "../pages/AwardCategoriesManage";
import AwardsNominationDetail from "../pages/AwardsNominationDetail";
import AwardsGalleryManage from "../pages/AwardsGalleryManage";
import AccountSection1 from "../pages/ihwe_client_data_2026/AccountSection1";
import CreateEstimate1 from "../pages/ihwe_client_data_2026/CreateEstimate1";
import EstimateDetails from "../pages/ihwe_client_data_2026/invoice/EstimateDetails"
import EditEstimate from "../pages/ihwe_client_data_2026/invoice/EditEstimate";
import PerformaInvoiceDetails from "../pages/ihwe_client_data_2026/invoice/PerformaInvoiceDetails";
import CreateInvoice from "../pages/ihwe_client_data_2026/invoice/CreateInvoice";
import CreditNote from "../pages/ihwe_client_data_2026/CreditNote";
import TaxInvoiceDetails from "../pages/ihwe_client_data_2026/invoice/TaxInvoiceDetails";
import InvoiceNumberDetails from "../pages/ihwe_client_data_2026/invoice/InvoiceNumberDetails";
import Payments from "../pages/ihwe_client_data_2026/payments/Payment";
import AgendaManagement from "../pages/AgendaManagement";
import SpeakerRegistrationList from "../pages/SpeakerRegistrationList";
import SpeakerRegistrationDetail from "../pages/SpeakerRegistrationDetail";
import SpeakerNominationsList from "../pages/SpeakerNominationsList";
import ApprovedSpeakersList from "../pages/ApprovedSpeakersList";
import FloatingVideoManagement from "../pages/FloatingVideoManagement";
import ExpoSupportEnquiries from "../pages/ExpoSupportEnquiries";
import SponsorshipEnquiries from "../pages/SponsorshipEnquiries";
import RejectedSpeakersList from "../pages/RejectedSpeakersList";
import RejectedAwardsList from "../pages/RejectedAwardsList";
import DistinguishedSpeakersManage from "../pages/DistinguishedSpeakersManage";
import ConferenceDayManagement from "../pages/ConferenceDayManagement";
import ConferenceTrackManage from "../pages/ConferenceTrackManage";
import MsmePmsSchemeList from "../pages/MsmePmsSchemeList";
import MsmePmsSchemeDetail from "../pages/MsmePmsSchemeDetail";
import MsmePmsSchemeConfig from "../pages/MsmePmsSchemeConfig"; import BSMTestimonial from "../pages/buyer_saller_meet/BSMTestimonial";
import AdvisoryNominationsList from "../pages/AdvisoryNominationsList";
import AdvisoryNominationDetail from "../pages/AdvisoryNominationDetail";
import MediaRegistrationManage from "../pages/MediaRegistrationManagement";
import ChairmanMessage from "../pages/ChairmanMessage";
import PartnerRegistrationsList from "../pages/PartnerRegistrationsList";
import PartnerRegistrationDetail from "../pages/PartnerRegistrationDetail";
import HotelStayPartnerManage from "../pages/HotelStayPartnerManage";
import FabricationPartnerManage from "../pages/FabricationPartnerManage";
import TravelPartnerManage from "../pages/TravelPartnerManage";




export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="role-permissions" element={<RolePermissions />} />
          <Route path="dashboard" element={<Dashboard />} />
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
          <Route path="e-promotion-manage" element={<EPromotionManage />} />
          <Route path="why-visit-manage" element={<WhyVisitManagement />} />
          <Route path="marquee-text" element={<MarqueeManage />} />
          <Route path="/glimpse" element={<Glimpse />} />
          <Route path="/supported-by" element={<SupportedBy />} />
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
          <Route
            path="e-promotion-registers"
            element={<EPromotionRegisters />}
          />
          <Route path="contact-enquiries" element={<ContactEnquiries />} />
          {/* <Route path="buyer-registrations" element={<BuyerRegistrations />} /> */}
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
          <Route path="change-password" element={<ChangePassword />} />
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
          <Route path="response-templates" element={<ResponseTemplates />} />
          <Route path="policy-manager" element={<PolicyManager />} />
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
          <Route path="/client-overview/:id" element={<ClientOverview1 />} />
          <Route path="/business-type" element={<BusinessType />} />
          <Route path="/annual-turnover" element={<AnnualTurnover />} />
          <Route path="/primary-product-interest" element={<PrimaryProductInterest />} />
          <Route path="/secondary-product-categories" element={<SecondaryProductCategories />} />
          <Route path="/meeting-priority-level" element={<MeetingPriorityLevel />} />
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
          <Route path="/marketing-toolkit-manage" element={<MarketingToolkitManage />} />
          <Route path="/reminder" element={<Reminder />} />
          <Route path="/to-do-list" element={<ToDoList />} />
          <Route path="/new-leads" element={<NewLeads />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/floating-video-management" element={<FloatingVideoManagement />} />
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

        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
