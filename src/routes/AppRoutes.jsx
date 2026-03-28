import { Routes, Route, Navigate } from "react-router-dom";

/* layouts */
import LoginPage from "../layout/LoginPage";
import AdminLayout from "../layout/AdminLayout";
import AdminUser from "../layout/AdminUser";

/* pages */
import Dashboard from "../pages/Dashboard";
import ChangePassword from "../pages/ChangePassword";
import Crosual from "../pages/HomeSlider";
import EventHighlightsPage from "../pages/EventHighlights";
import FestivalCarousel from "../pages/FestivalCarousel";
import EnquiryList from "../pages/EnquiryList";
import Remainder from "../pages/Remainder";
import BookAStand from "../pages/BookAStand";

/* page */
import CreatePage from "../pages/CreatePage";
import PageList from "../pages/PageList";
import UploadPdf from "../pages/UploadPdf";

/* posts */
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

/* gallery */
import GalleryCategory from "../pages/portfolio-gallery/GalleryCategory";
import GalleryList from "../pages/portfolio-gallery/GalleryList";
import AddGalleryImages from "../pages/portfolio-gallery/AddGalleryImages";

/* testimonials */
import TestimonialsManage from "../pages/TestimonialsManage";

/* vacancy */
import AddVacancy from "../pages/vacancy/AddVacancy";
import VacancyList from "../pages/vacancy/VacancyList";
import CareerList from "../pages/vacancy/CareerList";

/* clients */
import Clients from "../pages/Clients";

/* projects */
import AddProject from "../pages/project/AddProject";
import ProjectList from "../pages/project/ProjectList";

/* blogs */
import AddBlogs from "../pages/Blogs/AddBlogs";
import BlogsList from "../pages/Blogs/BlogsList";

/* facilities */
import AddFacility from "../pages/facilities/AddFacility";
import FacilityList from "../pages/facilities/FacilityList";

/* corporate */
import AddCorporateClients from "../pages/corporate-clients/AddCorporateClients";
import CorporateList from "../pages/corporate-clients/CorporateClientsList";

/* individual */
import AddIndividualClients from "../pages/individuals/AddIndividualClients";
import IndividualClientList from "../pages/individuals/IndividualClientList";
import IndividualProfile from "../pages/individuals/IndividualProfile";

/* contact */
import ContactList from "../pages/ContactList";

/* seo */
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
import ContactEnquiries from '../pages/ContactEnquiries';
import BuyerRegistrations from '../pages/BuyerRegistrations';
import BuyerRegistrationDetail from '../pages/BuyerRegistrationDetail';
import BuyerRegistrationEdit from '../pages/BuyerRegistrationEdit';
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

/* PROTECTION */
import ProtectedRoute from "./ProtectedRoute";

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
          <Route path="how-we-work" element={<Navigate to="/who-we-are" replace />} />
          <Route path="featured-services" element={<Services />} />
          <Route path="add-pdf" element={<AddPdf />} />
          <Route path="stats-counter" element={<StatsCounter />} />
          <Route path="global-platform" element={<GlobalPlatform />} />
          <Route path="vision-mission" element={<VisionMission />} />
          <Route path="why-attend" element={<WhyAttend />} />
          <Route path="target-audience" element={<TargetAudience />} />
          <Route path="organized-by" element={<OrganizedBy />} />
          <Route path="why-exhibit-manage" element={<WhyExhibitManage />} />
          <Route path="exhibitor-profile-manage" element={<ExhibitorProfileManage />} />
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
          <Route path="e-promotion-registers" element={<EPromotionRegisters />} />
          <Route path="contact-enquiries" element={<ContactEnquiries />} />
          <Route path="buyer-registrations" element={<BuyerRegistrations />} />
          <Route path="buyer-registration/:id" element={<BuyerRegistrationDetail />} />
          <Route path="buyer-registration/edit/:id" element={<BuyerRegistrationEdit />} />
          <Route path="stall-vendor-manage" element={<StallVendorManage />} />
          <Route path="exhibitor-list-manage" element={<ExhibitorListManage />} />
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

          <Route path="add-corporate-clients" element={<AddCorporateClients />} />
          <Route path="corporate-clients-list" element={<CorporateList />} />

          <Route path="add-individual-clients" element={<AddIndividualClients />} />
          <Route path="individual-clients-list" element={<IndividualClientList />} />
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
        </Route>
      </Route>
    </Routes>
  );
}