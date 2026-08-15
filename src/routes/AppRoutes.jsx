import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import LoginPage from "../layout/LoginPage";
import AdminLayout from "../layout/AdminLayout";
import Dashboard from "../pages/Dashboard";
import CrmEventScopedRoute from "../components/CrmEventScopedRoute";
const AdminUser = lazy(() => import("../layout/AdminUser"));
const MyProfile = lazy(() => import("../pages/MyProfile"));
const Crosual = lazy(() => import("../pages/HomeSlider"));
const EventHighlightsPage = lazy(() => import("../pages/EventHighlights"));
const FestivalCarousel = lazy(() => import("../pages/FestivalCarousel"));
const EnquiryList = lazy(() => import("../pages/EnquiryList"));
const Remainder = lazy(() => import("../pages/Remainder"));
const BookAStand = lazy(() => import("../pages/BookAStand"));
const TaskAndAlerts = lazy(() => import("../pages/TaskAndAlerts"));
const ActivityLog = lazy(() => import("../pages/ActivityLog"));
const DelegatePasses = lazy(() => import("../pages/DelegatePasses"));


const CreatePage = lazy(() => import("../pages/CreatePage"));
const PageList = lazy(() => import("../pages/PageList"));
const UploadPdf = lazy(() => import("../pages/UploadPdf"));

const Post = lazy(() => import("../pages/CreatePost"));
const PostList = lazy(() => import("../pages/PostList"));
const About = lazy(() => import("../pages/About"));
const WhoWeAre = lazy(() => import("../pages/WhoWeAre"));
const Services = lazy(() => import("../pages/Services"));
const FAQManage = lazy(() => import("../pages/FAQManage"));
const HealthcareSectorsManagement = lazy(() => import("../pages/HealthcareSectorsManagement"));
const EPromotionWebManagement = lazy(() => import("../pages/EPromotionWebManagement"));
const AddPdf = lazy(() => import("../pages/AddPdf"));
const StatsCounter = lazy(() => import("../pages/StatsCounter"));
const MarqueeManage = lazy(() => import("../pages/MarqueeManage"));
const Glimpse = lazy(() => import("../pages/Glimpse"));
const ParallaxManage = lazy(() => import("../pages/ParallaxManage"));
const StatsManage = lazy(() => import("../pages/StatsManage"));
const SupportedBy = lazy(() => import("../pages/SupportedBy"));
const UpcomingBrands = lazy(() => import("../pages/UpcomingBrands"));
const Introduction = lazy(() => import("../pages/Introduction"));
const NationalExpo = lazy(() => import("../pages/NationalExpo"));
const CertificateSettings = lazy(() => import("../pages/CertificateSettings"));
const IntegratedFormat = lazy(() => import("../pages/IntegratedFormat"));
const WhyParticipateManagement = lazy(() => import("../pages/WhyParticipateManagement"));

const GalleryCategory = lazy(() => import("../pages/portfolio-gallery/GalleryCategory"));
const GalleryList = lazy(() => import("../pages/portfolio-gallery/GalleryList"));
const AddGalleryImages = lazy(() => import("../pages/portfolio-gallery/AddGalleryImages"));
const ManageGalleryImages = lazy(() => import("../pages/portfolio-gallery/ManageGalleryImages"));

const TestimonialsManage = lazy(() => import("../pages/TestimonialsManage"));
const NewTestimonialsManagement = lazy(() => import("../pages/NewTestimonialsManagement"));
const ExhibitorTestimonialsManagement = lazy(() => import("../pages/ExhibitorTestimonialsManagement"));

const AddVacancy = lazy(() => import("../pages/vacancy/AddVacancy"));
const VacancyList = lazy(() => import("../pages/vacancy/VacancyList"));
const CareerList = lazy(() => import("../pages/vacancy/CareerList"));

const Clients = lazy(() => import("../pages/Clients"));

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
const ContactList = lazy(() => import("../pages/ContactList"));
const AddSeo = lazy(() => import("../pages/seo/AddSeo"));
const SeoList = lazy(() => import("../pages/seo/SeoList"));
const AdvancedSeo = lazy(() => import("../pages/seo/AdvancedSeo"));
const SocialMedia = lazy(() => import("../pages/SocialMedia"));
const GlobalPlatform = lazy(() => import("../pages/GlobalPlatform"));
const EventOverviewManagement = lazy(() => import("../pages/EventOverviewManagement"));
const AboutOrganizerManagement = lazy(() => import("../pages/AboutOrganizerManagement"));
const OurJourneyManagement = lazy(() => import("../pages/OurJourneyManagement"));
const VisionMission = lazy(() => import("../pages/VisionMission"));
const WhyAttend = lazy(() => import("../pages/WhyAttend"));
const TargetAudience = lazy(() => import("../pages/TargetAudience"));
const OrganizedBy = lazy(() => import("../pages/OrganizedBy"));
const WhyExhibitManage = lazy(() => import("../pages/WhyExhibitManage"));
const SponsorComparisonManage = lazy(() => import("../pages/SponsorComparisonManage"));
const PartnerCategories = lazy(() => import("../pages/PartnerCategories"));
const LogisticPartnerManage = lazy(() => import("../pages/LogisticPartnerManage"));
const PrintingBrandingPartnerManage = lazy(() => import("../pages/PrintingBrandingPartnerManage"));
const HospitalityPartnerManage = lazy(() => import("../pages/HospitalityPartnerManage"));
const WhyVisitManagement = lazy(() => import("../pages/WhyVisitManagement"));
const ExhibitorProfileManage = lazy(() => import("../pages/ExhibitorProfileManage"));
const HeroImages = lazy(() => import("../pages/HeroImages"));
const CreateServiceDetail = lazy(() => import("../pages/service/CreateServiceDetail"));
const ServiceList = lazy(() => import("../pages/service/ServiceList"));
const EPromotionManage = lazy(() => import("../pages/EPromotionManage"));
const EPromotionRegisters = lazy(() => import("../pages/EPromotionRegisters"));
const EPromotionPackages = lazy(() => import("../pages/e_promotion/EPromotionPackages"));
const ContactEnquiries = lazy(() => import("../pages/ContactEnquiries"));
// const BuyerRegistrations = lazy(() => import("../pages/buyer/BuyerRegistrations"));
const BuyerRegistrationDetail = lazy(() => import("../pages/BuyerRegistrationDetail"));
const BuyerRegistrationEdit = lazy(() => import("../pages/BuyerRegistrationEdit"));
const BuyerRegistrationConfig = lazy(() => import("../pages/BuyerRegistrationConfig"));
const InternationalBuyerRegistrationConfig = lazy(() => import("../pages/InternationalBuyerRegistrationConfig"));
const StallVendorManage = lazy(() => import("../pages/StallVendorManage"));
const ExhibitorListManage = lazy(() => import("../pages/ExhibitorListManage"));
const PartnerManagement = lazy(() => import("../pages/PartnerManagement"));
const SpecificPartnerManage = lazy(() => import("../pages/SpecificPartnerManage"));
const AdvisoryManagement = lazy(() => import("../pages/AdvisoryManagement"));
const ImageGalleryManagement = lazy(() => import("../pages/ImageGalleryManagement"));
const VideoGalleryManagement = lazy(() => import("../pages/VideoGalleryManagement"));
const MediaGalleryManagement = lazy(() => import("../pages/MediaGalleryManagement"));
const MediaCategoryManagement = lazy(() => import("../pages/gallery/MediaCategoryManagement"));
const VideoCategoryManagement = lazy(() => import("../pages/gallery/VideoCategoryManagement"));
const VideoList = lazy(() => import("../pages/gallery/VideoList"));
const ClickAnalytics = lazy(() => import("../pages/ClickAnalytics"));
const ManageStalls = lazy(() => import("../pages/ManageStalls"));
const ManageRegistrations = lazy(() => import("../pages/ManageRegistrations"));
const ManageEvents = lazy(() => import("../pages/ManageEvents"));
const ManageStallRates = lazy(() => import("../pages/ManageStallRates"));
const ManageTerms = lazy(() => import("../pages/ManageTerms"));
const ExhibitorBookingDetail = lazy(() => import("../pages/ExhibitorBookingDetail"));
const FailedPayments = lazy(() => import("../pages/FailedPayments"));
const PaymentDelayWarnings = lazy(() => import("../pages/PaymentDelayWarnings"));
const TravelAccommodationManage = lazy(() => import("../pages/TravelAccommodationManage"));
const AdminBSM = lazy(() => import("../pages/AdminBSM"));
const ActivityLogs = lazy(() => import("../pages/ActivityLogs"));
const ExhibitorActivityLogs = lazy(() => import("../pages/ExhibitorActivityLogs"));
const RoleManagement = lazy(() => import("../pages/RoleManagement"));
const DepartmentManagement = lazy(() => import("../pages/DepartmentManagement"));
const RolePermissions = lazy(() => import("../pages/RolePermissions"));
const DesignationManagement = lazy(() => import("../pages/DesignationManagement"));
const PolicyManager = lazy(() => import("../pages/PolicyManager"));
const Settings = lazy(() => import("../pages/Settings"));
const ConferenceTestimonialsManage = lazy(() => import("../pages/ConferenceTestimonialsManage"));
const SidebarCustomize = lazy(() => import("../pages/SidebarCustomize"));
const PaymentList = lazy(() => import("../pages/dashboard/account/PaymentList"));
import ProtectedRoute from "./ProtectedRoute";
const AddNewClients = lazy(() => import("../pages/ihwe_client_data_2026/AddNewClients"));
const DelegateConfig = lazy(() => import("../pages/admin_management/DelegateConfig"));
const TypeOfBusinessMaster = lazy(() => import("../pages/admin_management/TypeOfBusinessMaster"));
const LeadTypeOfBusiness = lazy(() => import("../pages/admin_management/LeadTypeOfBusiness"));
const LeadIndustry = lazy(() => import("../pages/admin_management/LeadIndustry"));
const AccessoryCategory = lazy(() => import("../pages/admin_management/AccessoryCategory"));
const ColdClientList = lazy(() => import("../pages/ihwe_client_data_2026/ColdClientList"));
const ConfirmClientList = lazy(() => import("../pages/ihwe_client_data_2026/ConfirmClientList"));
const NewLeadList = lazy(() => import("../pages/ihwe_client_data_2026/NewLeadList"));
const WarmClientList = lazy(() => import("../pages/ihwe_client_data_2026/WarmClientList"));
const HotClientList = lazy(() => import("../pages/ihwe_client_data_2026/HotClientList"));
const ProposalSentList = lazy(() => import("../pages/ihwe_client_data_2026/ProposalSentList"));
const ConvertedList = lazy(() => import("../pages/ihwe_client_data_2026/ConvertedList"));
const AllLeadsList = lazy(() => import("../pages/ihwe_client_data_2026/AllLeadsList"));
const MasterClientsList = lazy(() => import("../pages/ihwe_client_data_2026/MasterClientsList"));
const CrmEventReferralLeads = lazy(() => import("../pages/CrmEventReferralLeads"));
const RawDataList = lazy(() => import("../pages/ihwe_client_data_2026/RawDataList"));
const UploadExhibitor = lazy(() => import("../pages/ihwe_client_data_2026/UploadExhibitor"));
const AddNewVisitor = lazy(() => import("../pages/web_visitor_data/add_new_visitor/AddNewVisitors"));
const CorporateVisitorForm = lazy(() => import("../pages/web_visitor_data/add_new_visitor/CorporateVisitorForm"));
const FreeHealthCampForm = lazy(() => import("../pages/web_visitor_data/add_new_visitor/FreeHealthCampForm"));
const GeneralVisitorForm = lazy(() => import("../pages/web_visitor_data/add_new_visitor/GeneralVisitorForm"));
const VisitorRegistration = lazy(() => import("../pages/web_visitor_data/add_new_visitor/VisitorRegistration"));
const VisitorRegistrationForm = lazy(() => import("../pages/web_visitor_data/add_new_visitor/VisitorRegistrationForm"));

const CorporateVisitorsList = lazy(() => import("../pages/web_visitor_data/CorporateVisitorsList"));
const InternationalVisitorsList = lazy(() => import("../pages/web_visitor_data/InternationalVisitorsList"));
const GeneralVisitorsList = lazy(() => import("../pages/web_visitor_data/GeneralVisitorsList"));
const HealthCampVisitorsList = lazy(() => import("../pages/web_visitor_data/HealthCampVisitorsList"));

const CorporateOverview = lazy(() => import("../pages/web_visitor_data/overviews/CorporateOverview"));
const InternationalOverview = lazy(() => import("../pages/web_visitor_data/overviews/InternationalOverview"));
const GeneralOverview = lazy(() => import("../pages/web_visitor_data/overviews/GeneralOverview"));
const HealthCampOverview = lazy(() => import("../pages/web_visitor_data/overviews/HealthCampOverview"));
const UserList = lazy(() => import("../pages/users/UserList"));
const AddUser = lazy(() => import("../pages/users/AddUser"));
const AddBank = lazy(() => import("../pages/add_by_admin/AddBank"));
const BankAccountDetail = lazy(() => import("../pages/add_by_admin/BankAccountDetail"));
const AddCategory = lazy(() => import("../pages/add_by_admin/AddCategory"));
const AddExhibitorCategory = lazy(() => import("../pages/add_by_admin/AddExhibitorCategory"));
const AddCrmWhatsappMessage = lazy(() => import("../pages/add_by_admin/AddCrmWhatsappMessage"));
const AddDataSource = lazy(() => import("../pages/add_by_admin/AddDataSource"));
const AddEvent = lazy(() => import("../pages/add_by_admin/AddEvent"));
const AddNatureOfBusiness = lazy(() => import("../pages/add_by_admin/AddNatureOfBusiness"));
const AddNextAction = lazy(() => import("../pages/add_by_admin/AddNextAction"));
const AddRemarkLengthFixed = lazy(() => import("../pages/add_by_admin/AddRemarkLengthFixed"));
const AddStatus = lazy(() => import("../pages/add_by_admin/AddStatus"));
const AddStatusForm = lazy(() => import("../pages/add_by_admin/AddStatusForm"));
const AddExhibitionRole = lazy(() => import("../pages/add_by_admin/AddExhibitionRole"));
const EstimateTermsConfig = lazy(() => import("../pages/add_by_admin/EstimateTermsConfig"));
const AddTarget = lazy(() => import("../pages/add_by_admin/AddTarget"));
const VisitorReviewLogs = lazy(() => import("../pages/web_visitor_data/VisitorReviewLogs"));
const ClientOverview1 = lazy(() => import("../pages/ihwe_client_data_2026/ClientOverview1"));
const ClientContacts = lazy(() => import("../pages/ihwe_client_data_2026/ClientContacts"));
const AddTeamMembersAdmin = lazy(() => import("../pages/ihwe_client_data_2026/AddTeamMembersAdmin"));
const ClientDocuments = lazy(() => import("../pages/ihwe_client_data_2026/ClientDocuments"));
const EmailLogs = lazy(() => import("../pages/EmailLogs"));
const WhatsAppLogs = lazy(() => import("../pages/WhatsAppLogs"));
const ResponseTemplates = lazy(() => import("../pages/ResponseTemplates"));
const BusinessType = lazy(() => import("../pages/admin_management/BusinessType"));
const AnnualTurnover = lazy(() => import("../pages/admin_management/AnnualTurnover"));
const PrimaryProductInterest = lazy(() => import("../pages/admin_management/PrimaryProductInterest"));
const SecondaryProductCategories = lazy(() => import("../pages/admin_management/SecondaryProductCategories"));
const AddDelegatePass = lazy(() => import("../pages/admin_management/AddDelegatePass"));
const MeetingPriorityLevel = lazy(() => import("../pages/admin_management/MeetingPriorityLevel"));
const DocumentConfiguration = lazy(() => import("../pages/admin_management/DocumentConfiguration"));
const TransferClient = lazy(() => import("../pages/admin_management/TransferClient"));
const ReassignLeads = lazy(() => import("../pages/admin_management/ReassignLeads"));
const AiVerificationSettings = lazy(() => import("../pages/admin_management/AiVerificationSettings"));
const PreviousExhibitionList = lazy(() => import("../pages/admin_management/PreviousExhibitionList"));
const AddDomesticVisitor = lazy(() => import("../pages/web_visitor_data/add_new_visitor/AddDomesticVisitor"));
const BuyerRegistration = lazy(() => import("../pages/buyer/BuyerRegistration"));
const BuyerList = lazy(() => import("../pages/buyer/BuyerList"));
const ManageAccessories = lazy(() => import("../pages/ManageAccessories"));
const AccessoryOrders = lazy(() => import("../pages/AccessoryOrders"));
const ExhibitorChat = lazy(() => import("../pages/ExhibitorChat"));
const CallHistory = lazy(() => import("../pages/CallHistory"));
const AddUnit = lazy(() => import("../pages/admin_management/AddUnit"));
const MarketingToolkitManage = lazy(() => import("../pages/MarketingToolkitManage"));
const ExhibitorProductsProfile = lazy(() => import("../pages/ExhibitorProductsProfile"));
const Reminder = lazy(() => import("../pages/navbar_page/Reminder"));
const ToDoList = lazy(() => import("../pages/navbar_page/ToDoList"));
const NewLeads = lazy(() => import("../pages/navbar_page/NewLeads"));
const Notification = lazy(() => import("../pages/navbar_page/Notification"));
const NotFound = lazy(() => import("../pages/NotFound"));
const BannerManagement = lazy(() => import("../pages/BannerManagement"));
const SellerSubscriptionPlans = lazy(() => import("../pages/add_by_admin/SellerSubscriptionPlans"));
const SellerServiceRequests = lazy(() => import("../pages/SellerServiceRequests"));
const SellerExportInquiries = lazy(() => import("../pages/SellerExportInquiries"));
const MobilePassRequests = lazy(() => import("../pages/MobilePassRequests"));
const MobilePassConfig = lazy(() => import("../pages/MobilePassConfig"));
const ExhibitorRequestedPasses = lazy(() => import("../pages/ExhibitorRequestedPasses"));
const PassConfirmationReport = lazy(() => import("../pages/PassConfirmationReport"));
const FoodCouponGeneratorPage = lazy(() => import("../pages/FoodCouponGeneratorPage"));
const PassTemplateDesigner = lazy(() => import("../pages/PassTemplateDesigner"));
const PassGeneratorPage = lazy(() => import("../pages/PassGeneratorPage"));
const MobileFeedback = lazy(() => import("../pages/MobileFeedback"));
const MobileFeedbackDetails = lazy(() => import("../pages/MobileFeedbackDetails"));
const AdminReminders = lazy(() => import("../pages/AdminReminders"));
const MobileLeadCaptures = lazy(() => import("../pages/MobileLeadCaptures"));
const InternationalBuyerList = lazy(() => import("../pages/buyer/InternationalBuyerList"));
const InternationalBuyerRegistrationDetail = lazy(() => import("../pages/InternationalBuyerRegistrationDetail"));
const InternationalBuyerRegistrationEdit = lazy(() => import("../pages/InternationalBuyerRegistrationEdit"));
const InternationalBuyerRegistration = lazy(() => import("../pages/buyer/InternationalBuyerRegistration"));
const AwardsNominationsList = lazy(() => import("../pages/AwardsNominationsList"));
const ApprovedAwardsList = lazy(() => import("../pages/ApprovedAwardsList"));
const AwardCategoriesManage = lazy(() => import("../pages/AwardCategoriesManage"));
const AwardsNominationDetail = lazy(() => import("../pages/AwardsNominationDetail"));
const AwardsGalleryManage = lazy(() => import("../pages/AwardsGalleryManage"));
const AccountSection1 = lazy(() => import("../pages/ihwe_client_data_2026/AccountSection1"));
const CreateEstimate1 = lazy(() => import("../pages/ihwe_client_data_2026/CreateEstimate1"));
import EstimateDetails from "../pages/ihwe_client_data_2026/invoice/EstimateDetails"
import BuyerRegistrationForm from '../pages/buyer/BuyerRegistrationForm';
import AddNextActionForm from "../pages/add_by_admin/AddNextActionForm";
import MobileFeedbackDetailsNew from '../pages/MobileFeedbackDetailsNew';
import ClientOverview2 from '../pages/ihwe_client_data_2026/pms_application/ClientOverview2';
import ClientOverview2Page from '../pages/ihwe_client_data_2026/pms_application/ClientOverview2Page';
import MSMEPMSApplicationPage from '../pages/ihwe_client_data_2026/pms_application/MSMEPMSApplicationPage';
import MSMEPMSBankDetailsPage from '../pages/ihwe_client_data_2026/pms_application/MSMEPMSBankDetailsPage';
import MSMEPMSDocumentsUploadPage from '../pages/ihwe_client_data_2026/pms_application/MSMEPMSDocumentsUploadPage';
import MSMEApplicationReviewPage from '../pages/ihwe_client_data_2026/pms_application/MSMEApplicationReviewPage';
import PMSFinalSubmissionPage from '../pages/ihwe_client_data_2026/pms_application/PMSFinalSubmissionPage';
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
const AccountOverview = lazy(() => import("../pages/dashboard/account/AccountOverview"));
const DeliveryChallanManager = lazy(() => import("../pages/dashboard/account/DeliveryChallanManager"));
const AgendaManagement = lazy(() => import("../pages/AgendaManagement"));
const PaperPresentationManage = lazy(() => import("../pages/PaperPresentationManage"));
const PosterPresentationManage = lazy(() => import("../pages/PosterPresentationManage"));
const AbstractPresentationManage = lazy(() => import("../pages/AbstractPresentationManage"));
const SpeakerRegistrationList = lazy(() => import("../pages/SpeakerRegistrationList"));
const SpeakerRegistrationDetail = lazy(() => import("../pages/SpeakerRegistrationDetail"));
const SpeakerNominationsList = lazy(() => import("../pages/SpeakerNominationsList"));
const ApprovedSpeakersList = lazy(() => import("../pages/ApprovedSpeakersList"));
const FloatingVideoManagement = lazy(() => import("../pages/FloatingVideoManagement"));
const OrganicExpo2027ReferralLeads = lazy(() => import("../pages/OrganicExpo2027ReferralLeads"));
const IHWEExpo2026ReferralLeads = lazy(() => import("../pages/IHWEExpo2026ReferralLeads"));
const OrganicExpo2026ReferralLeads = lazy(() => import("../pages/OrganicExpo2026ReferralLeads"));
const ExpoSupportEnquiries = lazy(() => import("../pages/ExpoSupportEnquiries"));
const SponsorshipEnquiries = lazy(() => import("../pages/SponsorshipEnquiries"));
const RejectedSpeakersList = lazy(() => import("../pages/RejectedSpeakersList"));
const RejectedAwardsList = lazy(() => import("../pages/RejectedAwardsList"));
const DistinguishedSpeakersManage = lazy(() => import("../pages/DistinguishedSpeakersManage"));
const ConferenceDayManagement = lazy(() => import("../pages/ConferenceDayManagement"));
const ConferenceTrackManage = lazy(() => import("../pages/ConferenceTrackManage"));
const MsmePmsSchemeList = lazy(() => import("../pages/MsmePmsSchemeList"));
const MsmePmsSchemeDetail = lazy(() => import("../pages/MsmePmsSchemeDetail"));
const MsmePmsSchemeConfig = lazy(() => import("../pages/MsmePmsSchemeConfig")); const BSMTestimonial = lazy(() => import("../pages/buyer_saller_meet/BSMTestimonial"));
const AdvisoryNominationsList = lazy(() => import("../pages/AdvisoryNominationsList"));
const AdvisoryNominationDetail = lazy(() => import("../pages/AdvisoryNominationDetail"));
const MediaRegistrationManage = lazy(() => import("../pages/MediaRegistrationManagement"));
const ChairmanMessage = lazy(() => import("../pages/ChairmanMessage"));
const PartnerRegistrationsList = lazy(() => import("../pages/PartnerRegistrationsList"));
const PartnerRegistrationDetail = lazy(() => import("../pages/PartnerRegistrationDetail"));
const HotelStayPartnerManage = lazy(() => import("../pages/HotelStayPartnerManage"));
const FabricationPartnerManage = lazy(() => import("../pages/FabricationPartnerManage"));
const TravelPartnerManage = lazy(() => import("../pages/TravelPartnerManage"));
const PerformaInvoices = lazy(() => import("../pages/PerformaInvoices"));
//Account Section
const SalesReport = lazy(() => import("../pages/accounts/SalesReport"));
const CreateDebitNote = lazy(() => import("../pages/CreateDebitNote"));
const DebitNoteList = lazy(() => import("../pages/DebitNoteList"));
const DebitNoteView = lazy(() => import("../pages/DebitNoteView"));
const CreateInvoicePage = lazy(() => import("../pages/CreateInvoice"));
const BankDetailsManage = lazy(() => import("../pages/accounts/BankDetailsManage"));
const PaymentsView = lazy(() => import("../pages/accounts/PaymentsView"));
const ReceiptsView = lazy(() => import("../pages/accounts/ReceiptsView"));
const PaymentManagement = lazy(() => import("../pages/accounts/PaymentManagement"));
const ClientLedgerView = lazy(() => import("../pages/accounts/ClientLedgerView"));
const DebitNotesView = lazy(() => import("../pages/accounts/DebitNotesView"));
const CreateAccountDebitNote = lazy(() => import("../pages/CreateAccountDebitNote"));
const AccountsReceivableView = lazy(() => import("../pages/accounts/AccountsReceivableView"));
const PaymentsSummaryReport = lazy(() => import("../pages/accounts/PaymentsSummaryReport"));
const InvoicesView = lazy(() => import("../pages/accounts/InvoicesView"));
const ProformaInvoicesView = lazy(() => import("../pages/accounts/ProformaInvoicesView"));
const AccountDashboardPage = lazy(() => import("../pages/accounts/AccountDashboardPage"));
const DeliveryChallansView = lazy(() => import("../pages/accounts/DeliveryChallansView"));
const CreditNotesView = lazy(() => import("../pages/accounts/CreditNotesView"));
const CreateCreditNote = lazy(() => import("../pages/accounts/CreateCreditNote"));
const CreditNoteView = lazy(() => import("../pages/accounts/CreditNoteView"));
const DebitNoteViewAccount = lazy(() => import("../pages/accounts/DebitNoteViewAccount"));
const ImprestView = lazy(() => import("../pages/accounts/ImprestView"));
const CreateImprestRequest = lazy(() => import("../pages/accounts/CreateImprestRequest"));
// Sales Tools
const SalesTools = lazy(() => import("../pages/sales_tools/SalesTools"));
// Payment Mail
const PaymentMail = lazy(() => import("../pages/PaymentMail"));
const SendMail = lazy(() => import("../pages/SendMail"));
// Communication
const Communication = lazy(() => import("../pages/communication/Communication"));

// Hero Slider
const ExhibitorHeroSlider = lazy(() => import("../pages/ExhibitorHeroSlider"));
const UpcomingEvent = lazy(() => import("../pages/UpcomingEvent"));

// Marketing Materials
const MarketingMaterialPage = lazy(() => import("../pages/ihwe_client_data_2026/MarketingMaterialPage"));
const MarketingManagement = lazy(() => import("../pages/admin_management/MarketingManagement"));
const CertificatesGenerator = lazy(() => import("../pages/CertificatesGenerator"));
const Certificate = lazy(() => import("../pages/Certificate"));

function CreateInvoiceModal() {
  const navigate = useNavigate();
  const close = () => navigate(-1);
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[900px] my-10 relative max-h-[85vh] overflow-y-auto">
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-gray-100 border border-gray-200 rounded-full p-1.5 shadow-sm"
          title="Close"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        <CreateInvoicePage hideReadonlyFields compactMode />
      </div>
    </div>
  );
}

export default function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#23471d] border-t-transparent rounded-full animate-spin"></div></div>}>
      <Routes location={backgroundLocation || location}>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="role-permissions" element={<RolePermissions />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="certificate" element={<Certificate />} />
            <Route path="dashboard/add-payment" element={<AddPayment />} />
            <Route path="dashboard/account/AddPayment/:id" element={<AddPayment />} />
            <Route path="dashboard/account/:id/delivery-challans" element={<DeliveryChallanManager />} />
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
            <Route path="users/add" element={<AddUser />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="my-profile/:id" element={<MyProfile />} />
            <Route path="add-pdf" element={<AddPdf />} />
            <Route path="exhibitor-useful-documents" element={<AddPdf />} />
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
            <Route path="/paper-presentation-manage" element={<PaperPresentationManage />} />
            <Route path="/poster-presentation-manage" element={<PosterPresentationManage />} />
            <Route path="/abstract-submission-manage" element={<AbstractPresentationManage />} />
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
            <Route path="debit-note-list/:id" element={<DebitNoteList />} />
            <Route path="debit-note-view/:id" element={<DebitNoteView />} />
            <Route path="create-debit-note" element={<CreateDebitNote />} />
            <Route path="create-debit-note/:id" element={<CreateDebitNote />} />
            <Route path="page-create-invoice" element={<CreateInvoicePage />} />
            <Route path="page-create-invoice/:id" element={<CreateInvoicePage />} />
            <Route path="page-create-invoice/:id/:piNo" element={<CreateInvoicePage />} />
            <Route path="e-promotion-manage" element={<EPromotionManage />} />
            <Route path="why-visit-manage" element={<WhyVisitManagement />} />
            <Route path="marquee-text" element={<MarqueeManage />} />
            <Route path="certificate-settings" element={<CertificateSettings />} />
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
              path="/invoice-list/:id"
              element={<InvoiceList />}
            />
            <Route
              path="/payment-list"
              element={<PaymentList />}
            />
            <Route
              path="/payment-list/:id"
              element={<PaymentList />}
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
            <Route
              path="/add-delegate-pass"
              element={<AddDelegatePass />}
            />
            <Route path="delegate-passes" element={<DelegatePasses />} />
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
            <Route path="knowledge-partners-manage" element={<SpecificPartnerManage pageTitle="Knowledge Partners" subheading="Knowledge Partners" heading="Industry Leadership" />} />
            <Route path="healthcare-partners-manage" element={<SpecificPartnerManage pageTitle="Healthcare Partners" subheading="Healthcare Partner" heading="Healthcare Excellence" />} />
            <Route path="supporting-associations-manage" element={<SpecificPartnerManage pageTitle="Supporting Associations" subheading="Supporting Association" heading="Key Associations" />} />
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
              path="ihweClientData2026/proposalSentList"
              element={<ProposalSentList />}
            />
            <Route
              path="ihweClientData2026/convertedList"
              element={<ConvertedList />}
            />
            <Route
              path="ihweClientData2026/allLeadsList"
              element={<AllLeadsList />}
            />

            {/* Dynamic per-event CRM sections — one sidebar dropdown per
                Event Configuration entry (any name, e.g. "Skill Technical",
                "Medical Expo Data 2025"), all reusing the exact same pages
                as the static IHWE Expo 2026 section. :eventId picks which
                CrmEvent's assigned companies to show. */}
            <Route path="crm-event/:eventId/sales-tools" element={<SalesTools />} />
            <Route path="crm-event/:eventId/payment-mail" element={<PaymentMail />} />
            <Route path="crm-event/:eventId/send-mail" element={<SendMail />} />
            <Route path="crm-event/:eventId/new-leads" element={<CrmEventScopedRoute><NewLeadList /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/add-client" element={<CrmEventScopedRoute><AddNewClients /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/client/:id" element={<CrmEventScopedRoute><ClientOverview1 /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/follow-ups" element={<CrmEventScopedRoute><WarmClientList /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/hot-leads" element={<CrmEventScopedRoute><HotClientList /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/proposal-sent" element={<CrmEventScopedRoute><ProposalSentList /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/bookings" element={<CrmEventScopedRoute><ConfirmClientList /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/lost-leads" element={<CrmEventScopedRoute><ColdClientList /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/converted-leads" element={<CrmEventScopedRoute><ConvertedList /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/all-leads" element={<CrmEventScopedRoute><AllLeadsList /></CrmEventScopedRoute>} />
            <Route path="crm-event/:eventId/referral-leads" element={<CrmEventReferralLeads />} />

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
              path="ihweClientData2026/AddStatus/add"
              element={<AddStatusForm />}
            />
            <Route
              path="ihweClientData2026/AddStatus/edit/:id"
              element={<AddStatusForm />}
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
            <Route
              path="dashboard/account/:id"
              element={<AccountOverview />}
            />
            <Route
              path="dashboard/account/:id/share-payment-details"
              element={<BankAccountDetail />}
            />
            <Route
              path="share-payment-details"
              element={<BankAccountDetail />}
            />
            <Route path="delegate-config" element={<DelegateConfig />} />
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
                path="ihweClientData2026/InternationalVisitorsList"
                element={<InternationalVisitorsList />}
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
                path="ihweClientData2026/corporateVisitors/:id"
                element={<CorporateOverview />}
              />
              <Route
                path="ihweClientData2026/internationalVisitors/:id"
                element={<InternationalOverview />}
              />
              <Route
                path="ihweClientData2026/generalVisitors/:id"
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
              path="webVisitorData/InternationalVisitorDetails/:id"
                element={<InternationalOverview />}
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
            <Route path="ihweClientData2026/AddBank/:bankId" element={<BankAccountDetail />} />
            <Route
              path="ihweClientData2026/AddCategory"
              element={<AddCategory />}
            />
            <Route
              path="ihweClientData2026/AddCategory/add-exhibitor-category"
              element={<AddExhibitorCategory />}
            />
            <Route
              path="ihweClientData2026/AddCategory/edit/:id"
              element={<AddExhibitorCategory />}
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
            <Route path="ihweClientData2026/AddExhibitionRole" element={<AddExhibitionRole />} />
            <Route path="ihweClientData2026/EstimateTermsConfig" element={<EstimateTermsConfig />} />
            <Route path="ihweClientData2026/AddTarget" element={<AddTarget />} />
            <Route path="ihweClientData2026/AddNextAction" element={<AddNextAction />} />
            <Route path="ihweClientData2026/AddNextAction/add" element={<AddNextActionForm />} />
            <Route path="ihweClientData2026/AddNextAction/edit/:id" element={<AddNextActionForm />} />
            <Route path="accounts/salesreport" element={<SalesReport />} />
            <Route path="accounts/bank-details" element={<BankDetailsManage />} />
            <Route path="accounts/payments" element={<PaymentsView />} />
            <Route path="accounts/receipts" element={<ReceiptsView />} />
            <Route path="accounts/payment-management" element={<PaymentManagement />} />
            <Route path="accounts/client-ledger" element={<ClientLedgerView />} />
            <Route path="dashboard/account/client-ledger/:id" element={<ClientLedgerView />} />
            <Route path="account-debit-notes" element={<DebitNotesView />} />
            <Route path="account-debit-notes/:id" element={<DebitNotesView />} />
            <Route path="create-account-debit-note/:id" element={<CreateAccountDebitNote />} />
            <Route path="debit-note-view-account/:id" element={<DebitNoteViewAccount />} />
            <Route path="accounts/ar" element={<AccountsReceivableView />} />
            <Route path="accounts/summary-report" element={<PaymentsSummaryReport />} />
            <Route path="accounts/invoices" element={<InvoicesView />} />
            <Route path="accounts/proforma-invoices" element={<ProformaInvoicesView />} />
            <Route path="accounts/dashboard" element={<AccountDashboardPage />} />
            <Route path="accounts/delivery-challans" element={<DeliveryChallansView />} />
            <Route path="accounts/credit-notes" element={<CreditNotesView />} />
            <Route path="accounts/imprest" element={<ImprestView />} />
            <Route path="accounts/imprest/create" element={<CreateImprestRequest />} />
            <Route path="dashboard/account/credit-notes/:id" element={<CreditNotesView />} />
            <Route path="dashboard/account/create-credit-note/:id" element={<CreateCreditNote />} />
            <Route path="credit-note-view/:id" element={<CreditNoteView />} />
            <Route path="/client-overview/:id" element={<ClientOverview1 />} />
            <Route path="/pms-application/:id" element={<ClientOverview2Page />} />
            <Route path="/pms-application/:id/edit" element={<MSMEPMSApplicationPage />} />
            <Route path="/pms-application/:id/edit/bank-details" element={<MSMEPMSBankDetailsPage />} />
            <Route path="/pms-application/:id/edit/documents" element={<MSMEPMSDocumentsUploadPage />} />
            <Route path="/pms-application/:id/edit/review" element={<MSMEApplicationReviewPage />} />
            <Route path="/pms-application/:id/edit/submit" element={<PMSFinalSubmissionPage />} />
            <Route path="/client-contacts/:id" element={<ClientContacts />} />
            <Route path="/add-team-members/:id" element={<AddTeamMembersAdmin />} />
            <Route path="/client-documents/:id" element={<ClientDocuments />} />
            <Route path="/client-data/:id/marketing-materials" element={<MarketingMaterialPage />} />
            <Route path="/admin/marketing-management" element={<MarketingManagement />} />
            <Route path="/business-type" element={<BusinessType />} />
            <Route path="/annual-turnover" element={<AnnualTurnover />} />
            <Route path="/primary-product-interest" element={<PrimaryProductInterest />} />
            <Route path="/secondary-product-categories" element={<SecondaryProductCategories />} />
            <Route path="/meeting-priority-level" element={<MeetingPriorityLevel />} />
            <Route path="/document-configuration" element={<DocumentConfiguration />} />
            <Route path="/transfer-client" element={<TransferClient />} />
            <Route path="/reassign-leads" element={<ReassignLeads />} />
            <Route path="/ai-verification-settings" element={<AiVerificationSettings />} />
            <Route path="/previous-exhibitions" element={<PreviousExhibitionList />} />
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
            <Route path="/exhibitor-requested-passes" element={<ExhibitorRequestedPasses />} />
            <Route path="/pass-confirmation-report" element={<PassConfirmationReport />} />
            <Route path="/pass-template-designer" element={<PassTemplateDesigner />} />
            <Route path="/passes/media" element={<PassGeneratorPage passType="media" />} />
            <Route path="/passes/speaker" element={<PassGeneratorPage passType="speaker" />} />
            <Route path="/passes/organizer" element={<PassGeneratorPage passType="organizer" />} />
            <Route path="/passes/exhibitor" element={<PassGeneratorPage passType="exhibitor" />} />
            <Route path="/passes/service" element={<PassGeneratorPage passType="service" />} />
            <Route path="/passes/delegate" element={<PassGeneratorPage passType="delegate" />} />
            <Route path="/passes/vehicle" element={<Navigate to="/passes/delegate" replace />} />
            <Route path="/passes/visitor" element={<PassGeneratorPage passType="visitor" />} />
            <Route path="/passes/food-coupons" element={<FoodCouponGeneratorPage />} />
            <Route path="/mobile-feedback" element={<MobileFeedback />} />
            <Route path="/mobile-feedback/:id" element={<MobileFeedbackDetailsNew />} />
            <Route path="/mobile-lead-captures" element={<MobileLeadCaptures />} />
            <Route path="/marketing-toolkit-manage" element={<MarketingToolkitManage />} />
            <Route path="/reminder" element={<Reminder />} />
            <Route path="/reminders" element={<AdminReminders />} />
            <Route path="/to-do-list" element={<ToDoList />} />
            <Route path="/new-leads" element={<NewLeads />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/task-alerts" element={<TaskAndAlerts />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/exhibitor-activity-logs" element={<ExhibitorActivityLogs />} />
            <Route path="/floating-video-management" element={<FloatingVideoManagement />} />
            <Route path="/organic-expo-2027/referral-leads" element={<OrganicExpo2027ReferralLeads />} />
            <Route path="/ihwe-expo-2026/referral-leads" element={<IHWEExpo2026ReferralLeads />} />
            <Route path="/organic-expo-2026/referral-leads" element={<OrganicExpo2026ReferralLeads />} />
            <Route path="/expo-support-enquiries" element={<ExpoSupportEnquiries />} />
            <Route path="/sponsorship-enquiries" element={<SponsorshipEnquiries />} />
            <Route path="/media-registration-manage" element={<MediaRegistrationManage />} />
            <Route path="/business-type" element={<TypeOfBusinessMaster />} />
            <Route path="/type-of-business-master" element={<TypeOfBusinessMaster />} />
            <Route path="/lead-type-of-business" element={<LeadTypeOfBusiness />} />
            <Route path="/lead-industry" element={<LeadIndustry />} />
            <Route path="/accessory-category" element={<AccessoryCategory />} />

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
            <Route path="certificates-generation" element={<CertificatesGenerator />} />
            <Route path="certificatesgeneration" element={<Navigate to="/certificates-generation" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route path="/page-create-invoice/:id" element={<CreateInvoiceModal />} />
          <Route path="/page-create-invoice/:id/:piNo" element={<CreateInvoiceModal />} />
        </Routes>
      )}
    </Suspense>
  );
}
