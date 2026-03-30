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
import AddPdf from "../pages/AddPdf";
import StatsCounter from "../pages/StatsCounter";
import MarqueeManage from "../pages/MarqueeManage";
import Glimpse from "../pages/Glimpse";
import ParallaxManage from "../pages/ParallaxManage";
import StatsManage from "../pages/StatsManage";

import GalleryCategory from "../pages/portfolio-gallery/GalleryCategory";
import GalleryList from "../pages/portfolio-gallery/GalleryList";
import AddGalleryImages from "../pages/portfolio-gallery/AddGalleryImages";

import TestimonialsManage from "../pages/TestimonialsManage";

import AddVacancy from "../pages/vacancy/AddVacancy";
import VacancyList from "../pages/vacancy/VacancyList";
import CareerList from "../pages/vacancy/CareerList";

import Clients from "../pages/Clients";

import AddProject from "../pages/project/AddProject";
import ProjectList from "../pages/project/ProjectList";

import AddBlogs from "../pages/Blogs/AddBlogs";
import BlogsList from "../pages/Blogs/BlogsList";

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
import VisionMission from "../pages/VisionMission";
import WhyAttend from "../pages/WhyAttend";
import TargetAudience from "../pages/TargetAudience";
import OrganizedBy from "../pages/OrganizedBy";
import WhyExhibitManage from "../pages/WhyExhibitManage";
import WhyVisitManagement from "../pages/WhyVisitManagement";
import ExhibitorProfileManage from "../pages/ExhibitorProfileManage";
import HeroImages from "../pages/HeroImages";
import CreateServiceDetail from "../pages/service/CreateServiceDetail";
import ServiceList from "../pages/service/ServiceList";
import EPromotionManage from "../pages/EPromotionManage";
import EPromotionRegisters from "../pages/EPromotionRegisters";
import ContactEnquiries from "../pages/ContactEnquiries";
import BuyerRegistrations from "../pages/BuyerRegistrations";
import BuyerRegistrationDetail from "../pages/BuyerRegistrationDetail";
import BuyerRegistrationEdit from "../pages/BuyerRegistrationEdit";
import StallVendorManage from "../pages/StallVendorManage";
import ExhibitorListManage from "../pages/ExhibitorListManage";
import PartnerManagement from "../pages/PartnerManagement";
import AdvisoryManagement from "../pages/AdvisoryManagement";
import ImageGalleryManagement from "../pages/ImageGalleryManagement";
import VideoGalleryManagement from "../pages/VideoGalleryManagement";
import MediaGalleryManagement from "../pages/MediaGalleryManagement";
import ClickAnalytics from "../pages/ClickAnalytics";
import ManageStalls from "../pages/ManageStalls";
import ManageRegistrations from "../pages/ManageRegistrations";
import ManageEvents from "../pages/ManageEvents";
import ManageStallRates from "../pages/ManageStallRates";
import ManageTerms from "../pages/ManageTerms";



/* settings */
import Settings from "../pages/Settings";
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
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="click-analytics" element={<ClickAnalytics />} />
          <Route path="about-us" element={<About />} />
          <Route path="who-we-are" element={<WhoWeAre />} />
          <Route
            path="how-we-work"
            element={<Navigate to="/who-we-are" replace />}
          />
          <Route path="featured-services" element={<Services />} />
          <Route path="add-pdf" element={<AddPdf />} />
          <Route path="stats-counter" element={<StatsCounter />} />
          <Route path="global-platform" element={<GlobalPlatform />} />
          <Route path="vision-mission" element={<VisionMission />} />
          <Route path="why-attend" element={<WhyAttend />} />
          <Route path="target-audience" element={<TargetAudience />} />
          <Route path="organized-by" element={<OrganizedBy />} />
          <Route path="why-exhibit-manage" element={<WhyExhibitManage />} />
          <Route
            path="exhibitor-profile-manage"
            element={<ExhibitorProfileManage />}
          />
          <Route path="e-promotion-manage" element={<EPromotionManage />} />
          <Route path="why-visit-manage" element={<WhyVisitManagement />} />
          <Route path="marquee-text" element={<MarqueeManage />} />
          <Route path="glimpse" element={<Glimpse />} />
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
          <Route path="testimonials-manage" element={<TestimonialsManage />} />
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
          <Route path="contact-list" element={<ContactList />} />
          <Route path="book-a-stand" element={<BookAStand />} />
          <Route
            path="e-promotion-registers"
            element={<EPromotionRegisters />}
          />
          <Route path="contact-enquiries" element={<ContactEnquiries />} />
          <Route path="buyer-registrations" element={<BuyerRegistrations />} />
          <Route
            path="buyer-registration/:id"
            element={<BuyerRegistrationDetail />}
          />
          <Route
            path="buyer-registration/edit/:id"
            element={<BuyerRegistrationEdit />}
          />
          <Route path="stall-vendor-manage" element={<StallVendorManage />} />
          <Route
            path="exhibitor-list-manage"
            element={<ExhibitorListManage />}
          />
          <Route path="stalls" element={<ManageStalls />} />
          <Route path="exhibitor-bookings" element={<ManageRegistrations />} />
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
            path="ihweClientData2026/AddNewVisitor"
            element={<AddNewVisitor />}
          />
          <Route
            path="ihweClientData2026/CorporateVisitorForm"
            element={<CorporateVisitorForm />}
          />
          <Route
            path="ihweClientData2026/FreeHealthCampForm"
            element={<FreeHealthCampForm />}
          />
          <Route
            path="ihweClientData2026/GeneralVisitorForm"
            element={<GeneralVisitorForm />}
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
            path="ihweClientData2026/HealthCampVisitorsList"
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
        </Route>
      </Route>
    </Routes>
  );
}
