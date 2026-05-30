import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../lib/api";
import {
  Type, Save, Image as ImageIcon, Sparkles, TrendingUp, HelpCircle,
  Plus, Trash2, Edit, ChevronRight, CheckCircle2, ListPlus, Upload
} from 'lucide-react';

const ImageUploadField = ({ label, value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/api/msme-pms-scheme/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        onChange(response.data.url);
        Swal.fire({ icon: 'success', title: 'Image Uploaded!', timer: 1200, showConfirmButton: false });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire('Error', 'Failed to upload image. Please check your file format and size.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2 border-2 border-dashed border-gray-200 p-4 rounded-xl bg-gray-50 flex flex-col items-center justify-center relative group min-h-[140px] transition-all hover:border-[#23471d]/60">
      <span className="text-[10px] text-gray-500 uppercase font-black absolute top-2 left-3">{label}</span>
      {value ? (
        <div className="flex flex-col items-center gap-2 mt-4 text-center">
          <img src={value} alt={label} className="h-16 max-w-[150px] object-contain filter drop-shadow-md rounded" />
          <span className="text-[8px] text-gray-400 max-w-[180px] truncate font-mono">{value}</span>
        </div>
      ) : (
        <div className="text-center mt-4">
          <ImageIcon className="mx-auto w-8 h-8 text-gray-300 mb-1" />
          <p className="text-gray-400 text-[9px] italic">No image uploaded</p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-xl pointer-events-none">
        <Upload className="text-white w-6 h-6 mb-1" />
        <p className="text-white text-[9px] font-black uppercase tracking-widest">
          {isUploading ? 'Uploading...' : 'Upload New'}
        </p>
      </div>
      <input
        type="file"
        onChange={handleUpload}
        className="absolute inset-0 opacity-0 cursor-pointer"
        accept="image/*"
        disabled={isUploading}
      />
    </div>
  );
};

const MsmePmsSchemeConfig = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    heroSubTitle: "GOVERNMENT SUPPORT TO GROW YOUR BUSINESS",
    heroTitle: "MSME PMS SCHEME",
    heroSubTitle2: "BENEFITS & REGISTRATION",
    heroDescription: "Exhibit at International Health & Wellness Expo 2026 with Financial Assistance from Ministry of MSME, Government of India.",
    heroBannerImg: "/msmepmsscheme/msme_pms_header_banner.png",
    subsidyLimit: "₹1,50,000",
    subsidyImg: "/msmepmsscheme/mony-bag.png",
    subsidyFeatures: [
      "Government Financial Support",
      "Increase Market Reach",
      "Grow Your Business Globally"
    ],
    subsidyFooterTexts: [
      "TYPICALLY ₹50,000 – ₹1,00,000",
      "HIGHER SUPPORT FOR ELIGIBLE CASES"
    ],
    subsidyNotice: "*Subsidy amount may vary as per MSME guidelines, category and approval.",
    stats: [
      { img: "/msmepmsscheme/global.png", val: "1,000+", label: "GLOBAL BUYERS" },
      { img: "/msmepmsscheme/exhibitors.png", val: "150+", label: "EXHIBITORS" },
      { img: "/msmepmsscheme/visitors.png", val: "8,000+", label: "VISITORS/ DELEGATES" },
      { img: "/msmepmsscheme/conference.png", val: "18+", label: "CONFERENCE SESSIONS" },
      { img: "/msmepmsscheme/businessOpportunities.png", val: "3 DAYS", label: "OF BUSINESS OPPORTUNITIES" },
      { img: "/msmepmsscheme/networkevents.png", val: "MULTIPLE", label: "NETWORKING EVENTS" },
    ],
    aboutTitle: "ABOUT PMS SCHEME",
    aboutImg: "/msmepmsscheme/aboutpmsscheme.png",
    aboutParagraphs: [
      "The Procurement and Marketing Support (PMS) Scheme of the Ministry of MSME, Government of India, aims to provide financial assistance to Micro, Small and Medium Enterprises (MSMEs) for participating in domestic and international exhibitions / trade fairs.",
      "The scheme helps MSMEs promote their products, explore new markets, enhance brand visibility and generate business opportunities."
    ],
    benefitsTitle: "BENEFITS OF PMS SCHEME",
    benefits: [
      { img: "/msmepmsscheme/reimbursement.png", title: "Up to ₹1.5 Lakh* Reimbursement", desc: "Subsidy on stall booking & participation cost" },
      { img: "/msmepmsscheme/reducedCost.png", title: "Reduced Cost", desc: "Lower financial burden for market expansion" },
      { img: "/msmepmsscheme/marketexposure.png", title: "Market Exposure", desc: "Showcase your products to national & international buyers" },
      { img: "/msmepmsscheme/businessgrowth.png", title: "Business Growth", desc: "Generate leads & expand your network" },
      { img: "/msmepmsscheme/govsupport.png", title: "Government Support", desc: "Exhibit with the backing of Ministry of MSME" },
      { img: "/msmepmsscheme/brandvisibility.png", title: "Brand Visibility", desc: "Enhance brand credibility and recognition" },
    ],
    footerStats: [
      { img: "/msmepmsscheme/global1.png", val: "1,000+", label: "GLOBAL BUYERS" },
      { img: "/msmepmsscheme/exhibitors.png", val: "150+", label: "EXHIBITORS" },
      { img: "/msmepmsscheme/visitors.png", val: "8,000+", label: "VISITORS/ DELEGATES" },
      { img: "/msmepmsscheme/conference.png", val: "18+", label: "CONFERENCE SESSIONS" },
      { img: "/msmepmsscheme/businessOpportunities1.png", val: "3 DAYS", label: "OF BUSINESS OPPORTUNITIES" },
    ],
    collageImg: "/msmepmsscheme/msme_exhibition_stalls_grid.png",
    whoCanApplyTitle: "WHO CAN APPLY?",
    whoCanApplyItems: [
      "MSMEs with valid Udyam Registration",
      "Manufacturers / Service Providers",
      "Startups registered under MSME category",
      "Businesses in Health, Wellness, Ayurveda, Organic, Pharma, Nutraceuticals and related sectors"
    ],
    whyPmsTitle: "WHY PMS SCHEME?",
    whyPmsImg: "/msmepmsscheme/whypms.png",
    whyPmsItems: [
      "Encourages MSMEs to participate in exhibitions",
      "Helps in exploring new markets & technologies",
      "Strengthens competitiveness and innovation",
      "Supports sustainable growth and development"
    ],
    eligibilityTitle: "ELIGIBILITY CRITERIA",
    eligibilityItems: [
      "Applicant should be a registered MSME with valid Udyam Certificate",
      "The enterprise should be in manufacturing or service sector",
      "Should not have availed PMS benefit for the same exhibition in the previous financial year",
      "Subject to approval by Ministry of MSME"
    ],
    formTitle: "APPLY FOR PMS SCHEME – IHWE 2026",
    formSubTitle: "Claim your subsidy and grow your business at IHWE 2026!",
    bottomCtaTitle: "Don't Miss This Government-Supported Opportunity!",
    bottomCtaHighlight: "Government-Supported Opportunity!",
    bottomCtaDesc: "Exhibit at IHWE 2026 and take your business to the next level with financial support under the MSME PMS Scheme.",
    helpTitle: "Need Help?",
    helpSubTitle: "Our team is here to assist you",
    helpPhone: "+91 9654900525",
    helpEmail: "info@ihwe.in",
    footerCtaImg: "/msmepmsscheme/Announcement.png",
    facebookUrl: "https://www.facebook.com/namogangewellness.event",
    instagramUrl: "https://instagram.com",
    twitterUrl: "https://twitter.com",
    linkedinUrl: "https://linkedin.com",
    youtubeUrl: "https://youtube.com"
  });

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/msme-pms-scheme/page-content');
      if (response.data.success) {
        setData(prev => ({ ...prev, ...response.data.data }));
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/msme-pms-scheme/page-content', data);
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Page Content Saved!', timer: 1500, showConfirmButton: false });
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      Swal.fire('Error', 'Failed to save page configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, val) => {
    setData(prev => ({ ...prev, [field]: val }));
  };

  const handleArrayChange = (field, idx, val) => {
    const updated = [...data[field]];
    updated[idx] = val;
    updateField(field, updated);
  };

  const handleArrayAdd = (field, defaultVal = '') => {
    updateField(field, [...data[field], defaultVal]);
  };

  const handleArrayDelete = (field, idx) => {
    updateField(field, data[field].filter((_, i) => i !== idx));
  };

  const handleStatChange = (idx, field, val) => {
    const updated = [...data.stats];
    updated[idx] = { ...updated[idx], [field]: val };
    updateField('stats', updated);
  };

  const handleFooterStatChange = (idx, field, val) => {
    const updated = [...(data.footerStats || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    updateField('footerStats', updated);
  };

  const handleBenefitChange = (idx, field, val) => {
    const updated = [...data.benefits];
    updated[idx] = { ...updated[idx], [field]: val };
    updateField('benefits', updated);
  };

  return (
    <>
      <div className="relative w-full h-64 overflow-hidden rounded mt-8">
        <img
          src="/home.png"
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/40 z-[1]" />
        <div className="absolute inset-0 opacity-[0.05] z-[2]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />
        <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-[#d26019]/0 via-[#d26019] to-[#d26019]/0 z-[2]" />

        <div className="relative z-10 h-full flex items-center justify-between px-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d26019] animate-pulse" />
              <p className="text-sm font-bold text-slate-200 uppercase tracking-[0.20em]">
                Admin Panel · Website Management · CMS
              </p>
            </div>
            <h1 className="text-3xl font-semibold text-white leading-tight tracking-tight mb-1">
              MSME PMS SCHEME PAGE DYNAMIC CONTENT
            </h1>
            <p className="text-lg font-medium text-slate-200">
              Configure texts, bags, images, checklists, lists and stats shown on MSME PMS Scheme page
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Dynamic Mode</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md p-6 min-h-screen font-inter tracking-widest text-[11px] font-bold mt-6">
        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 mb-6 gap-2">
          {[
            { id: 'hero', label: 'HERO & SUBSIDY BANNER', icon: Sparkles },
            { id: 'stats', label: 'STATISTICS & ABOUT', icon: TrendingUp },
            { id: 'benefits', label: 'BENEFITS LIST', icon: ListPlus },
            { id: 'grids', label: 'THREE COLUMN ELIGIBILITY GRIDS', icon: HelpCircle },
            { id: 'footerForm', label: 'FORM, HELP & BOTTOM CTA', icon: HelpCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-6 border-b-2 transition-all font-black text-[10px] uppercase tracking-wider ${
                activeTab === tab.id ? 'border-[#23471d] text-[#23471d]' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'hero' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* HERO DETAILS */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-[#23471d] uppercase tracking-normal">
                  <Type className="w-5 h-5 text-[#d26019]" /> HERO HEADER COPY
                </h2>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase">Hero Subtitle</label>
                  <input
                    type="text"
                    value={data.heroSubTitle}
                    onChange={(e) => updateField('heroSubTitle', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase">Hero Main Title</label>
                  <input
                    type="text"
                    value={data.heroTitle}
                    onChange={(e) => updateField('heroTitle', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase">Hero Subtitle Line 2</label>
                  <input
                    type="text"
                    value={data.heroSubTitle2}
                    onChange={(e) => updateField('heroSubTitle2', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase">Hero Description Text</label>
                  <textarea
                    value={data.heroDescription}
                    onChange={(e) => updateField('heroDescription', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24 normal-case font-normal"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="Hero Banner Image"
                    value={data.heroBannerImg}
                    onChange={(val) => updateField('heroBannerImg', val)}
                  />
                </div>
              </div>

              {/* SUBSIDY BOX */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-[#23471d] uppercase tracking-normal">
                  <Type className="w-5 h-5 text-[#d26019]" /> SUBSIDY DETAILS
                </h2>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase">Subsidy Limit</label>
                  <input
                    type="text"
                    value={data.subsidyLimit}
                    onChange={(e) => updateField('subsidyLimit', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="Subsidy Image Bag"
                    value={data.subsidyImg}
                    onChange={(val) => updateField('subsidyImg', val)}
                  />
                </div>

                {/* Features */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] text-gray-500 uppercase">Subsidy Features Checklist</label>
                    <button onClick={() => handleArrayAdd('subsidyFeatures')} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 uppercase text-[9px] font-black">
                      <Plus className="w-3.5 h-3.5" /> Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.subsidyFeatures.map((feat, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => handleArrayChange('subsidyFeatures', idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 border-2 border-gray-300 focus:border-[#23471d] outline-none font-normal normal-case text-[10px]"
                        />
                        <button onClick={() => handleArrayDelete('subsidyFeatures', idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Yellow Strip Texts */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] text-gray-500 uppercase">Subsidy Bottom Ribbon Texts</label>
                    <button onClick={() => handleArrayAdd('subsidyFooterTexts')} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 uppercase text-[9px] font-black">
                      <Plus className="w-3.5 h-3.5" /> Add Text
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.subsidyFooterTexts.map((text, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => handleArrayChange('subsidyFooterTexts', idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                        />
                        <button onClick={() => handleArrayDelete('subsidyFooterTexts', idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase">Disclaimer Notice</label>
                  <input
                    type="text"
                    value={data.subsidyNotice}
                    onChange={(e) => updateField('subsidyNotice', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none font-normal italic normal-case text-slate-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* STATISTICS GRID */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-[#23471d] uppercase tracking-normal">
                  <TrendingUp className="w-5 h-5 text-[#d26019]" /> EXHIBITION STATISTICS (6 TILES)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data.stats && data.stats.length > 0 ? data.stats : []).map((stat, idx) => (
                    <div key={idx} className="border border-gray-200 p-4 rounded-lg bg-gray-50 space-y-2">
                      <div className="text-[#d26019] text-[9px] font-black uppercase">TILE NO. {idx + 1}</div>
                      <div>
                        <label className="block text-[8px] text-gray-400 uppercase">Value / Text</label>
                        <input
                          type="text"
                          value={stat.val}
                          onChange={(e) => handleStatChange(idx, 'val', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 outline-none text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-gray-400 uppercase">Label description</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 outline-none text-[10px]"
                        />
                      </div>
                      <div>
                        <ImageUploadField
                          label="Tile Icon"
                          value={stat.img}
                          onChange={(val) => handleStatChange(idx, 'img', val)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ABOUT PMS SECTION */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-[#23471d] uppercase tracking-normal">
                  <ImageIcon className="w-5 h-5 text-[#d26019]" /> ABOUT PMS SCHEME SECTION
                </h2>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase">About Section Title</label>
                  <input
                    type="text"
                    value={data.aboutTitle}
                    onChange={(e) => updateField('aboutTitle', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="About Section Image"
                    value={data.aboutImg}
                    onChange={(val) => updateField('aboutImg', val)}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] text-gray-500 uppercase">About Paragraphs</label>
                    <button onClick={() => handleArrayAdd('aboutParagraphs')} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 uppercase text-[9px] font-black">
                      <Plus className="w-3.5 h-3.5" /> Add Paragraph
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.aboutParagraphs.map((para, idx) => (
                      <div key={idx} className="flex gap-2">
                        <textarea
                          value={para}
                          onChange={(e) => handleArrayChange('aboutParagraphs', idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 border-2 border-gray-300 h-20 outline-none normal-case font-normal text-[10px]"
                        />
                        <button onClick={() => handleArrayDelete('aboutParagraphs', idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FOOTER STATISTICS GRID */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4 col-span-1 lg:col-span-2">
                <h2 className="text-sm font-bold flex items-center gap-2 text-[#23471d] uppercase tracking-normal">
                  <TrendingUp className="w-5 h-5 text-[#d26019]" /> FOOTER REPEATING STATISTICS (5 TILES)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {(data.footerStats && data.footerStats.length > 0 ? data.footerStats : [
                    { img: "/msmepmsscheme/global1.png", val: "1,000+", label: "GLOBAL BUYERS" },
                    { img: "/msmepmsscheme/exhibitors.png", val: "150+", label: "EXHIBITORS" },
                    { img: "/msmepmsscheme/visitors.png", val: "8,000+", label: "VISITORS/ DELEGATES" },
                    { img: "/msmepmsscheme/conference.png", val: "18+", label: "CONFERENCE SESSIONS" },
                    { img: "/msmepmsscheme/businessOpportunities1.png", val: "3 DAYS", label: "OF BUSINESS OPPORTUNITIES" },
                  ]).map((stat, idx) => (
                    <div key={idx} className="border border-gray-200 p-4 rounded-lg bg-gray-50 space-y-2">
                      <div className="text-[#d26019] text-[9px] font-black uppercase">FOOTER TILE {idx + 1}</div>
                      <div>
                        <label className="block text-[8px] text-gray-400 uppercase">Value / Text</label>
                        <input
                          type="text"
                          value={stat.val}
                          onChange={(e) => handleFooterStatChange(idx, 'val', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 outline-none text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-gray-400 uppercase">Label description</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => handleFooterStatChange(idx, 'label', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 outline-none text-[10px]"
                        />
                      </div>
                      <div>
                        <ImageUploadField
                          label="Tile Icon"
                          value={stat.img}
                          onChange={(val) => handleFooterStatChange(idx, 'img', val)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold flex items-center gap-2 text-[#23471d] uppercase tracking-normal">
                  <ListPlus className="w-5 h-5 text-[#d26019]" /> BENEFITS SECTION CARDS
                </h2>
                <div className="w-1/2">
                  <label className="block text-[9px] text-gray-400 uppercase mb-1">Benefits Section Title</label>
                  <input
                    type="text"
                    value={data.benefitsTitle}
                    onChange={(e) => updateField('benefitsTitle', e.target.value)}
                    className="w-full px-4 py-1.5 border-2 border-gray-300 focus:border-[#23471d] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.benefits.map((benefit, idx) => (
                  <div key={idx} className="border-2 border-gray-100 p-4 rounded-xl bg-slate-50 relative group">
                    <div className="text-[#d26019] text-[9px] font-black uppercase mb-3 border-b border-gray-200 pb-1">CARD {idx + 1}</div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[8px] text-gray-400 uppercase">Benefit Card Title</label>
                        <input
                          type="text"
                          value={benefit.title}
                          onChange={(e) => handleBenefitChange(idx, 'title', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 outline-none font-black text-[#1a3615] text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-gray-400 uppercase">Description</label>
                        <textarea
                          value={benefit.desc}
                          onChange={(e) => handleBenefitChange(idx, 'desc', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 outline-none h-16 text-[10px] font-normal normal-case"
                        />
                      </div>
                      <div>
                        <ImageUploadField
                          label="Card Icon"
                          value={benefit.img}
                          onChange={(val) => handleBenefitChange(idx, 'img', val)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'grids' && (
            <div className="space-y-6">
              {/* Collage Image Path */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                <ImageUploadField
                  label="Left Collage Gallery Stall Image"
                  value={data.collageImg}
                  onChange={(val) => updateField('collageImg', val)}
                />
              </div>

              {/* THREE COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* WHO CAN APPLY */}
                <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-[#1a3615] flex items-center gap-2 uppercase tracking-tight">
                    <CheckCircle2 className="text-[#d26019] w-4 h-4" /> Who Can Apply?
                  </h3>
                  <div>
                    <label className="block text-[8px] text-gray-400 uppercase">Column Header Title</label>
                    <input
                      type="text"
                      value={data.whoCanApplyTitle}
                      onChange={(e) => updateField('whoCanApplyTitle', e.target.value)}
                      className="w-full px-3 py-1 border-2 border-gray-300 outline-none text-[10px]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[8px] text-gray-400 uppercase">Bullet Points List</label>
                      <button onClick={() => handleArrayAdd('whoCanApplyItems')} className="text-emerald-600 hover:text-emerald-800 text-[8px] font-black uppercase flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Point
                      </button>
                    </div>
                    <div className="space-y-2">
                      {data.whoCanApplyItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <textarea
                            value={item}
                            onChange={(e) => handleArrayChange('whoCanApplyItems', idx, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 h-16 outline-none text-[9px] font-normal normal-case"
                          />
                          <button onClick={() => handleArrayDelete('whoCanApplyItems', idx)} className="text-red-500 hover:text-red-700 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WHY PMS SCHEME */}
                <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-[#1a3615] flex items-center gap-2 uppercase tracking-tight">
                    <CheckCircle2 className="text-[#d26019] w-4 h-4" /> Why PMS Scheme?
                  </h3>
                  <div>
                    <label className="block text-[8px] text-gray-400 uppercase">Column Header Title</label>
                    <input
                      type="text"
                      value={data.whyPmsTitle}
                      onChange={(e) => updateField('whyPmsTitle', e.target.value)}
                      className="w-full px-3 py-1 border-2 border-gray-300 outline-none text-[10px]"
                    />
                  </div>
                  <div>
                    <ImageUploadField
                      label="Why PMS Icon"
                      value={data.whyPmsImg}
                      onChange={(val) => updateField('whyPmsImg', val)}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[8px] text-gray-400 uppercase">Bullet Points List</label>
                      <button onClick={() => handleArrayAdd('whyPmsItems')} className="text-emerald-600 hover:text-emerald-800 text-[8px] font-black uppercase flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Point
                      </button>
                    </div>
                    <div className="space-y-2">
                      {data.whyPmsItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <textarea
                            value={item}
                            onChange={(e) => handleArrayChange('whyPmsItems', idx, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 h-16 outline-none text-[9px] font-normal normal-case"
                          />
                          <button onClick={() => handleArrayDelete('whyPmsItems', idx)} className="text-red-500 hover:text-red-700 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ELIGIBILITY CRITERIA */}
                <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-[#1a3615] flex items-center gap-2 uppercase tracking-tight">
                    <CheckCircle2 className="text-[#d26019] w-4 h-4" /> Eligibility Criteria
                  </h3>
                  <div>
                    <label className="block text-[8px] text-gray-400 uppercase">Column Header Title</label>
                    <input
                      type="text"
                      value={data.eligibilityTitle}
                      onChange={(e) => updateField('eligibilityTitle', e.target.value)}
                      className="w-full px-3 py-1 border-2 border-gray-300 outline-none text-[10px]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[8px] text-gray-400 uppercase">Bullet Points List</label>
                      <button onClick={() => handleArrayAdd('eligibilityItems')} className="text-emerald-600 hover:text-emerald-800 text-[8px] font-black uppercase flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Point
                      </button>
                    </div>
                    <div className="space-y-2">
                      {data.eligibilityItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <textarea
                            value={item}
                            onChange={(e) => handleArrayChange('eligibilityItems', idx, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 h-16 outline-none text-[9px] font-normal normal-case"
                          />
                          <button onClick={() => handleArrayDelete('eligibilityItems', idx)} className="text-red-500 hover:text-red-700 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'footerForm' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* FORM HEADER */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-[#1a3615] flex items-center gap-2 uppercase tracking-tight">
                  <Edit className="text-[#d26019] w-4 h-4" /> FORM HEADER TEXTS
                </h3>
                <div>
                  <label className="block text-[8px] text-gray-400 uppercase mb-1">Form Main Title</label>
                  <input
                    type="text"
                    value={data.formTitle}
                    onChange={(e) => updateField('formTitle', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-400 uppercase mb-1">Form Sub Title</label>
                  <input
                    type="text"
                    value={data.formSubTitle}
                    onChange={(e) => updateField('formSubTitle', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                  />
                </div>
              </div>

              {/* BOTTOM CTA */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-[#1a3615] flex items-center gap-2 uppercase tracking-tight">
                  <Sparkles className="text-[#d26019] w-4 h-4" /> BOTTOM CTA RIBBON
                </h3>
                <div>
                  <label className="block text-[8px] text-gray-400 uppercase mb-1">CTA Main Title</label>
                  <input
                    type="text"
                    value={data.bottomCtaTitle}
                    onChange={(e) => updateField('bottomCtaTitle', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-400 uppercase mb-1">CTA Highlighted Text</label>
                  <input
                    type="text"
                    value={data.bottomCtaHighlight}
                    onChange={(e) => updateField('bottomCtaHighlight', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-400 uppercase mb-1">CTA Description</label>
                  <textarea
                    value={data.bottomCtaDesc}
                    onChange={(e) => updateField('bottomCtaDesc', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 outline-none h-20 text-[9px] font-normal normal-case"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="Footer CTA Theme Image"
                    value={data.footerCtaImg}
                    onChange={(val) => updateField('footerCtaImg', val)}
                  />
                </div>
              </div>

              {/* HELP CENTER */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-[#1a3615] flex items-center gap-2 uppercase tracking-tight">
                  <HelpCircle className="text-[#d26019] w-4 h-4" /> FORM HELP CARD
                </h3>
                <div>
                  <label className="block text-[8px] text-gray-400 uppercase mb-1">Help Card Title</label>
                  <input
                    type="text"
                    value={data.helpTitle}
                    onChange={(e) => updateField('helpTitle', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-400 uppercase mb-1">Help Card Subtitle</label>
                  <input
                    type="text"
                    value={data.helpSubTitle}
                    onChange={(e) => updateField('helpSubTitle', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-400 uppercase mb-1">Help Contact Phone</label>
                  <input
                    type="text"
                    value={data.helpPhone}
                    onChange={(e) => updateField('helpPhone', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-400 uppercase mb-1">Help Contact Email</label>
                  <input
                    type="text"
                    value={data.helpEmail}
                    onChange={(e) => updateField('helpEmail', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                  />
                </div>
              </div>

              {/* SOCIAL MEDIA LINKS */}
              <div className="bg-white border-2 border-gray-200 p-6 shadow-sm space-y-4 col-span-1 lg:col-span-3">
                <h3 className="text-sm font-black text-[#1a3615] flex items-center gap-2 uppercase tracking-tight">
                  <Sparkles className="text-[#d26019] w-4 h-4" /> SOCIAL MEDIA CHANNELS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[8px] text-gray-400 uppercase mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={data.facebookUrl}
                      onChange={(e) => updateField('facebookUrl', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-400 uppercase mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={data.instagramUrl}
                      onChange={(e) => updateField('instagramUrl', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-400 uppercase mb-1">Twitter URL</label>
                    <input
                      type="text"
                      value={data.twitterUrl}
                      onChange={(e) => updateField('twitterUrl', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-400 uppercase mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      value={data.linkedinUrl}
                      onChange={(e) => updateField('linkedinUrl', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-400 uppercase mb-1">YouTube URL</label>
                    <input
                      type="text"
                      value={data.youtubeUrl}
                      onChange={(e) => updateField('youtubeUrl', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 outline-none text-[10px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-4 mt-8 bg-[#23471d] text-white font-black uppercase tracking-[0.2em] hover:bg-black transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save className="w-5 h-5" /> Save All Configuration Changes</>}
          </button>
        </div>
      </div>
    </>
  );
};

export default MsmePmsSchemeConfig;
