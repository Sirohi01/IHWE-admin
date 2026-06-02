import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import pragatiMaidan from "../../assets/pragatiMaidan.png";
import sideImage from "../../assets/sideImage2.png";
import { toast } from "react-toastify";
import {
  FaWhatsapp, FaEnvelope, FaLink, FaDownload, FaTimes, FaFilePdf, FaImage, FaVideo,
  FaLink as FaExternalLink, FaCheckCircle, FaChevronLeft, FaChevronRight, FaBookOpen, FaComments,
  FaGlobe, FaMapMarkerAlt, FaMap, FaFilePowerpoint, FaHashtag, FaHandshake, FaFileAlt,
  FaClipboardList, FaEye, FaPaperPlane, FaSearch, FaThLarge, FaList, FaFolderOpen
} from "react-icons/fa";
import EmailModal from "./communication/EmailModal";

const categoriesDef = [
  { name: "Brochure", sub: "Official expo brochure", icon: FaBookOpen, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Poster", sub: "Promotional posters", icon: FaImage, color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Testimonials", sub: "Client feedback & stories", icon: FaComments, color: "text-green-500", bg: "bg-green-50" },
  { name: "Videos", sub: "Event promo videos", icon: FaVideo, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Website Links", sub: "Important web links", icon: FaGlobe, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Office Location", sub: "Our office address", icon: FaMapMarkerAlt, color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Venue Location", sub: "Expo venue location", icon: FaMap, color: "text-green-500", bg: "bg-green-50" },
  { name: "Marketing PPT", sub: "Complete presentation", icon: FaFilePowerpoint, color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Social Media Posts", sub: "Post templates", icon: FaHashtag, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Sponsorship Proposal", sub: "Brand partnership proposal", icon: FaHandshake, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Marketing Proposal", sub: "Collaboration proposal", icon: FaFileAlt, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Booking Form", sub: "Exhibitor booking form", icon: FaClipboardList, color: "text-pink-500", bg: "bg-pink-50" }
];

const getMapEmbedUrl = (url, title) => {
  if (!url) return null;
  if (url.includes("/embed?")) return url;
  const placeMatch = url.match(/\/place\/([^\/]+)/);
  if (placeMatch && placeMatch[1]) {
    return `https://maps.google.com/maps?q=${placeMatch[1]}&output=embed`;
  }
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(title || 'Location')}&output=embed`;
};

const forceDownload = (material) => {
  if (!material || !material.fileUrl) return;
  let url = material.fileUrl;

  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    let ext = ".pdf";
    if (material.fileType === "PPT") ext = ".pptx";
    else if (material.fileType === "Word") ext = ".docx";
    else if (material.fileType === "Video") ext = ".mp4";
    else if (material.fileType === "Image") ext = ".jpg";

    let safeTitle = (material.title || "Download").replace(/[^a-zA-Z0-9]/g, "_");
    url = url.replace("/upload/", `/upload/fl_attachment:${safeTitle}${ext}/`);
  }

  window.open(url, '_blank');
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes("youtube.com/shorts/")) {
    const videoId = url.split("shorts/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("youtube.com/watch")) {
    try {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const videoId = urlParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) { }
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
};

const getDocumentEmbedUrl = (url, type) => {
  if (!url) return null;
  if (type === "PDF") return url;
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    return "fallback";
  }
  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
};

const MarketingMaterialPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [materialsByCat, setMaterialsByCat] = useState({});
  const [shareHistory, setShareHistory] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("");
  const [modalItems, setModalItems] = useState([]);
  const [selectedItemsForSend, setSelectedItemsForSend] = useState([]);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [initialEmailContent, setInitialEmailContent] = useState("");
  const [initialEmailAttachments, setInitialEmailAttachments] = useState([]);
  const [currentEmailMaterialIds, setCurrentEmailMaterialIds] = useState([]);

  useEffect(() => {
    fetchCompanyDetails();
    fetchMaterials();
    fetchShareHistory();
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      const res = await api.get(`/api/companies/${id}`);
      setCompany(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch company details");
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await api.get(`/api/marketing-materials`);
      if (res.data.success) {
        setMaterialsByCat(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShareHistory = async () => {
    try {
      const res = await api.get(`/api/marketing-materials/history/${id}`);
      if (res.data.success) {
        setShareHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryClick = (category) => {
    const items = materialsByCat[category] || [];
    if (items.length === 0) {
      toast.info(`No materials found for ${category}`);
      return;
    }

    if (items.length === 1) {
      setSelectedMaterial(items[0]);
    } else {
      setModalCategory(category);
      setModalItems(items);
      setSelectedItemsForSend([items[0]._id]);
      setSelectedMaterial(items[0]);
      setIsModalOpen(true);
    }
  };

  const handleSend = async (via, materialIds = null) => {
    if (!company) return;
    const idsToSend = materialIds || (selectedMaterial ? [selectedMaterial._id] : []);

    if (idsToSend.length === 0) {
      toast.error("No material selected");
      return;
    }

    if (via === "Email") {
      let allMaterials = [];
      Object.values(materialsByCat).forEach(arr => allMaterials.push(...arr));
      const selectedDocs = allMaterials.filter(m => idsToSend.includes(m._id));

      let content = `Dear ${company.companyName || "Sir/Ma'am"},\n\nPlease find the requested marketing materials below:\n\n`;

      const attachments = [];
      selectedDocs.forEach(m => {
        if (m.fileType === "Link" || m.fileType === "Location" || m.fileType === "Video") {
          content += `- ${m.title}: ${m.fileUrl}\n`;
        } else {
          let ext = ".pdf";
          if (m.fileType === "PPT") ext = ".pptx";
          else if (m.fileType === "Word") ext = ".docx";
          else if (m.fileType === "Image") ext = ".jpg";

          attachments.push({
            filename: (m.title || "Document").replace(/[^a-zA-Z0-9 ]/g, "_") + ext,
            path: m.fileUrl
          });
        }
      });

      content += `\nBest Regards,\nIHWE Team`;

      setInitialEmailContent(content);
      setInitialEmailAttachments(attachments);
      setCurrentEmailMaterialIds(idsToSend);
      setIsEmailModalOpen(true);
      return;
    }

    setSending(true);
    try {
      const res = await api.post(`/api/marketing-materials/share`, {
        cmpny_id: company._id,
        material_ids: idsToSend,
        sentVia: via,
        sentBy: "Admin",
        clientEmail: company.companyEmail || company.email,
        clientMobile: company.companyMobile || company.mobile,
        clientName: company.companyName,
      });

      if (res.data.success) {
        toast.success(`Material sent successfully via ${via}`);
        fetchShareHistory();
        if (isModalOpen) setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || `Failed to send via ${via}`);
    } finally {
      setSending(false);
    }
  };

  const handleSendKit = async () => {
    // Collect all essential materials from categories
    const essentialCats = ["Brochure", "Marketing PPT", "Marketing Proposal", "Booking Form", "Website Links"];
    let ids = [];
    essentialCats.forEach(cat => {
      if (materialsByCat[cat] && materialsByCat[cat].length > 0) {
        ids.push(materialsByCat[cat][0]._id);
      }
    });

    if (ids.length === 0) {
      toast.error("No essential materials available in library.");
      return;
    }

    handleSend("Email", ids);
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const filteredCategories = categoriesDef.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.sub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentCategoryItems = selectedMaterial ? (materialsByCat[selectedMaterial.category] || []) : [];
  const currentMaterialIndex = selectedMaterial ? currentCategoryItems.findIndex(m => m._id === selectedMaterial._id) : -1;

  const handleNextMaterial = () => {
    if (currentMaterialIndex < currentCategoryItems.length - 1) {
      setSelectedMaterial(currentCategoryItems[currentMaterialIndex + 1]);
    }
  };

  const handlePrevMaterial = () => {
    if (currentMaterialIndex > 0) {
      setSelectedMaterial(currentCategoryItems[currentMaterialIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#f3f4f6]">
      <div className="p-2 max-w-[1600px] mx-auto w-full flex flex-col gap-2">

        {/* TOP BANNER */}
        <div className="w-full relative rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => navigate(`/client-overview/${id}`)}
            className="absolute left-4 top-4 z-10 p-2 bg-black/30 hover:bg-black/50 backdrop-blur text-white rounded-full transition"
          >
            <FaChevronLeft />
          </button>
          <img src={pragatiMaidan} alt="Banner" className="w-full h-auto object-cover" />
        </div>

        {/* MAIN ROW: Library and Preview */}
        <div className="flex flex-col xl:flex-row gap-2">

          {/* LEFT: MARKETING MATERIAL LIBRARY */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg">
                  <FaFolderOpen className="text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Marketing Material Library</h2>
                  <p className="text-xs text-gray-500 font-medium">Select any material to preview and share</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search material..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button className="p-1.5 bg-blue-600 text-white rounded-md shadow-sm"><FaThLarge /></button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md"><FaList /></button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredCategories.map((cat, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-between text-center hover:shadow-md transition-shadow bg-white relative cursor-pointer" onClick={() => handleCategoryClick(cat.name)}>
                  <div className={`w-10 h-10 ${cat.bg} ${cat.color} rounded-lg flex items-center justify-center text-xl mb-2`}>
                    <cat.icon />
                  </div>
                  <h3 className="font-bold text-xs text-[#1e234c] leading-tight mb-0.5">{cat.name}</h3>
                  <p className="text-[10px] text-gray-500 mb-3">{cat.sub}</p>

                  <div className="flex items-center justify-center gap-4 text-xs font-bold w-full border-t border-gray-50 pt-2.5 mt-auto">
                    <button className="text-blue-700 flex items-center gap-1 hover:text-blue-800" onClick={(e) => { e.stopPropagation(); handleCategoryClick(cat.name); }}>
                      <FaEye /> Preview
                    </button>
                    <button className="text-[#1da935] flex items-center gap-1 hover:text-[#158828]" onClick={(e) => { e.stopPropagation(); handleCategoryClick(cat.name); }}>
                      <FaPaperPlane /> Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: PREVIEW PANEL */}
          <div className="w-full xl:w-[400px] 2xl:w-[480px] bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-col justify-between">
            {selectedMaterial ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
                    <h3 className="text-md font-bold text-gray-800 truncate">Preview: {selectedMaterial.title}</h3>
                    {currentCategoryItems.length > 1 && (
                      <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 flex-shrink-0 border border-gray-200">
                        <button
                          onClick={handlePrevMaterial}
                          disabled={currentMaterialIndex === 0}
                          className="p-1 rounded-full hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition text-gray-600"
                        >
                          <FaChevronLeft className="text-[10px]" />
                        </button>
                        <span className="text-[10px] font-bold text-gray-600 px-1 select-none">
                          {currentMaterialIndex + 1}/{currentCategoryItems.length}
                        </span>
                        <button
                          onClick={handleNextMaterial}
                          disabled={currentMaterialIndex === currentCategoryItems.length - 1}
                          className="p-1 rounded-full hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition text-gray-600"
                        >
                          <FaChevronRight className="text-[10px]" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase tracking-wide flex-shrink-0">
                    {selectedMaterial.fileType}
                  </span>
                </div>

                <div className="w-full h-[230px] 2xl:h-[270px] bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-100 relative group p-2">
                  {selectedMaterial.fileType === "Image" ? (
                    <img src={selectedMaterial.fileUrl} alt={selectedMaterial.title} className="max-w-full max-h-full object-contain mx-auto shadow-sm" />
                  ) : selectedMaterial.fileType === "Video" ? (
                    <video src={selectedMaterial.fileUrl} controls className="w-full h-full" />
                  ) : selectedMaterial.fileType === "Location" ? (
                    <iframe
                      title={selectedMaterial.title}
                      className="w-full h-full rounded shadow-sm border-none"
                      src={getMapEmbedUrl(selectedMaterial.fileUrl, selectedMaterial.title)}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : selectedMaterial.fileType === "Link" ? (
                    getYoutubeEmbedUrl(selectedMaterial.fileUrl) ? (
                      <iframe
                        title={selectedMaterial.title}
                        className="w-full h-full rounded shadow-sm border-none"
                        src={getYoutubeEmbedUrl(selectedMaterial.fileUrl)}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <iframe
                        title={selectedMaterial.title}
                        className="w-full h-full rounded shadow-sm border-none"
                        src={selectedMaterial.fileUrl}
                        loading="lazy"
                      />
                    )
                  ) : selectedMaterial.fileType === "PDF" ? (
                    <iframe
                      title={selectedMaterial.title}
                      className="w-full h-full rounded shadow-sm border-none bg-white"
                      src={selectedMaterial.fileUrl}
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-center text-gray-500 flex flex-col items-center justify-center">
                      {selectedMaterial.fileType === "PPT" ? (
                        <FaFilePowerpoint className="text-6xl mx-auto mb-3 text-orange-500" />
                      ) : selectedMaterial.fileType === "Word" ? (
                        <FaFileAlt className="text-6xl mx-auto mb-3 text-blue-600" />
                      ) : (
                        <FaFilePdf className="text-6xl mx-auto mb-3 text-red-500" />
                      )}
                      <p className="font-bold text-gray-700">{selectedMaterial.title}</p>
                      <p className="text-xs text-gray-400 mt-1">Click External Link to open</p>
                    </div>
                  )}
                  {/* Real Toolbar overlay */}
                  <div className="absolute top-0 left-0 w-full bg-black/60 p-2 flex items-center justify-between text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="flex gap-4 items-center">
                      <span className="font-bold text-[10px] uppercase tracking-wider">{selectedMaterial.category}</span>
                    </div>
                    <div className="flex gap-4">
                      <FaDownload className="cursor-pointer hover:text-blue-400" onClick={() => forceDownload(selectedMaterial)} />
                      <FaExternalLink className="cursor-pointer hover:text-blue-400" onClick={() => window.open(selectedMaterial.fileUrl)} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">File Type</p>
                    <p className="font-bold text-xs text-gray-700 uppercase">{selectedMaterial.fileType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">File Size</p>
                    <p className="font-bold text-xs text-gray-700">{selectedMaterial.fileSize || "4.2 MB"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">Updated On</p>
                    <p className="font-bold text-xs text-gray-700">
                      {new Date(selectedMaterial.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <button
                    onClick={() => handleSend("WhatsApp")}
                    disabled={sending}
                    className="col-span-1 bg-[#25D366] text-white py-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 hover:bg-[#1ebd5a] transition text-[9px] xl:text-[10px] disabled:opacity-50 text-center leading-tight shadow-sm"
                  >
                    <FaWhatsapp className="text-sm" /> WhatsApp
                  </button>
                  <button
                    onClick={() => handleSend("Email")}
                    disabled={sending}
                    className="col-span-1 bg-blue-600 text-white py-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 hover:bg-blue-700 transition text-[9px] xl:text-[10px] disabled:opacity-50 text-center leading-tight shadow-sm"
                  >
                    <FaEnvelope className="text-sm" /> Email
                  </button>
                  <button
                    onClick={() => copyLink(selectedMaterial.fileUrl)}
                    className="col-span-1 border border-gray-200 bg-gray-50 text-blue-600 py-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition text-[9px] xl:text-[10px] text-center leading-tight shadow-sm"
                  >
                    <FaLink className="text-sm" /> Copy Link
                  </button>
                  <a
                    href={selectedMaterial.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-1 border border-gray-200 bg-gray-50 text-[#d26019] py-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition text-[9px] xl:text-[10px] text-center leading-tight shadow-sm"
                  >
                    <FaDownload className="text-sm" /> Download
                  </a>
                </div>
              </>
            ) : (
              <div className="w-full min-h-[350px] rounded-lg overflow-hidden relative flex-1">
                <img src={sideImage} alt="Select Material" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: Quick Share Kit and History */}
        <div className="flex flex-col xl:flex-row gap-2 mb-1">

          {/* QUICK SHARE KIT */}
          <div className="w-full xl:w-[55%] bg-gradient-to-br from-white to-blue-50/30 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>

            <h3 className="text-md font-bold text-[#1e234c] mb-1 relative z-10">Quick Share Kit</h3>
            <p className="text-xs text-gray-500 mb-6 relative z-10">Send all essential materials in one click</p>

            <div className="flex items-center justify-between w-full overflow-x-auto pb-1 mt-auto relative z-10 gap-2">

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-xl shadow-sm flex items-center justify-center text-blue-600 text-3xl hover:-translate-y-1 transition-transform">
                  <FaBookOpen />
                </div>
                <span className="text-[11px] font-bold text-[#1e234c]">Brochure</span>
              </div>

              <span className="text-gray-300 font-bold text-xl mb-6 flex-shrink-0">+</span>

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-xl shadow-sm flex items-center justify-center text-orange-500 text-3xl hover:-translate-y-1 transition-transform">
                  <FaFilePowerpoint />
                </div>
                <span className="text-[11px] font-bold text-[#1e234c]">PPT</span>
              </div>

              <span className="text-gray-300 font-bold text-xl mb-6 flex-shrink-0">+</span>

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-xl shadow-sm flex items-center justify-center text-green-600 text-3xl font-bold hover:-translate-y-1 transition-transform">
                  ₹
                </div>
                <span className="text-[11px] font-bold text-[#1e234c]">Rate Card</span>
              </div>

              <span className="text-gray-300 font-bold text-xl mb-6 flex-shrink-0">+</span>

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-14 h-14 bg-pink-50 border border-pink-100 rounded-xl shadow-sm flex items-center justify-center text-pink-500 text-3xl hover:-translate-y-1 transition-transform">
                  <FaClipboardList />
                </div>
                <span className="text-[11px] font-bold text-[#1e234c]">Booking Form</span>
              </div>

              <span className="text-gray-300 font-bold text-xl mb-6 flex-shrink-0">+</span>

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-xl shadow-sm flex items-center justify-center text-blue-500 text-3xl hover:-translate-y-1 transition-transform">
                  <FaGlobe />
                </div>
                <span className="text-[11px] font-bold text-[#1e234c]">Website Link</span>
              </div>

              <div className="flex flex-col items-center min-w-[170px] pl-4 flex-shrink-0">
                <button
                  onClick={handleSendKit}
                  disabled={sending}
                  className="w-full bg-[#1da935] text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#158828] hover:shadow-lg transition-all disabled:opacity-50 text-xs shadow-md"
                >
                  <FaPaperPlane className="text-xl -mt-1" />
                  <span className="text-left leading-tight">Send Complete<br />Marketing Kit</span>
                </button>
                <span className="text-[10px] text-[#2c3167] font-semibold mt-2 text-center leading-tight">One click – All essential<br />materials to client</span>
              </div>
            </div>
          </div>

          {/* RECENT SHARED HISTORY */}
          <div className="w-full xl:w-[45%] bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-bold text-gray-800">Recent Shared History</h3>
              <button className="text-blue-600 text-xs font-semibold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[100px] thin-scrollbar pr-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-y border-gray-100">
                  <tr>
                    <th className="py-2 px-3 font-bold text-[10px] text-gray-500 uppercase tracking-wider">Client Name</th>
                    <th className="py-2 px-3 font-bold text-[10px] text-gray-500 uppercase tracking-wider">Material Sent</th>
                    <th className="py-2 px-3 font-bold text-[10px] text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-2 px-3 font-bold text-[10px] text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shareHistory.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-gray-700">{company?.companyName}</td>
                      <td className="py-2 px-3 text-xs text-gray-500 truncate max-w-[100px]">
                        {log.materials.map(m => m.title).join(", ")}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-600 border border-green-100 uppercase tracking-wide">
                          <FaCheckCircle className="text-[9px]" /> Sent
                        </span>
                      </td>
                    </tr>
                  ))}
                  {shareHistory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-400 font-medium text-xs">No sharing history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* MULTIPLE SELECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex overflow-hidden max-h-[85vh]">

            {/* Modal Left - Selection */}
            <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Select {modalCategory}</h3>
                  <p className="text-sm text-gray-500">Choose multiple items to send at once</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 p-2 bg-white rounded-full shadow-sm">
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="space-y-3">
                {modalItems.map((item) => (
                  <label
                    key={item._id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white shadow-sm ${selectedItemsForSend.includes(item._id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      checked={selectedItemsForSend.includes(item._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItemsForSend([...selectedItemsForSend, item._id]);
                        } else {
                          setSelectedItemsForSend(selectedItemsForSend.filter(id => id !== item._id));
                        }
                      }}
                    />
                    <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                      {/* Clicking on text updates the right preview panel */}
                      <div className="cursor-pointer" onClick={() => setSelectedMaterial(item)}>
                        <h4 className="font-bold text-gray-800 text-sm leading-tight">{item.title}</h4>
                        <div className="flex text-xs text-gray-500 gap-3 mt-1.5 font-medium">
                          <span className="uppercase">{item.fileType}</span>
                          {item.fileSize && <span>• {item.fileSize}</span>}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Modal Right - Preview & Actions */}
            <div className="w-1/2 bg-white p-8 flex flex-col">
              <h4 className="font-bold text-gray-800 text-lg mb-4">Preview Selected</h4>
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative p-4">
                {selectedMaterial ? (
                  selectedMaterial.fileType === "Image" ? (
                    <img src={selectedMaterial.fileUrl} alt={selectedMaterial.title} className="max-w-full max-h-full object-contain rounded shadow-sm" />
                  ) : selectedMaterial.fileType === "Video" ? (
                    <video src={selectedMaterial.fileUrl} controls className="max-w-full max-h-full rounded shadow-sm" />
                  ) : selectedMaterial.fileType === "Location" ? (
                    <iframe
                      title={selectedMaterial.title}
                      className="w-full h-full rounded shadow-sm border-none"
                      src={getMapEmbedUrl(selectedMaterial.fileUrl, selectedMaterial.title)}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : selectedMaterial.fileType === "Link" ? (
                    getYoutubeEmbedUrl(selectedMaterial.fileUrl) ? (
                      <iframe
                        title={selectedMaterial.title}
                        className="w-full h-full rounded shadow-sm border-none"
                        src={getYoutubeEmbedUrl(selectedMaterial.fileUrl)}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <iframe
                        title={selectedMaterial.title}
                        className="w-full h-full rounded shadow-sm border-none"
                        src={selectedMaterial.fileUrl}
                        loading="lazy"
                      />
                    )
                  ) : selectedMaterial.fileType === "PDF" ? (
                    <iframe
                      title={selectedMaterial.title}
                      className="w-full h-full rounded shadow-sm border-none bg-white"
                      src={selectedMaterial.fileUrl}
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-center text-gray-500 flex flex-col items-center justify-center">
                      {selectedMaterial.fileType === "PPT" ? (
                        <FaFilePowerpoint className="text-6xl mx-auto mb-3 text-orange-500" />
                      ) : selectedMaterial.fileType === "Word" ? (
                        <FaFileAlt className="text-6xl mx-auto mb-3 text-blue-600" />
                      ) : (
                        <FaFilePdf className="text-6xl mx-auto mb-3 text-red-500" />
                      )}
                      <p className="font-bold text-gray-800 mt-2">{selectedMaterial.title}</p>
                      <a href={selectedMaterial.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-semibold hover:underline mt-2 inline-block">View Full Document</a>
                    </div>
                  )
                ) : (
                  <p className="text-gray-400 font-medium text-sm">Click a title on the left to preview</p>
                )}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-800 text-sm">{selectedItemsForSend.length} Items Selected</span>
                  <span className="text-xs text-gray-500 font-medium">Ready to send</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSend("WhatsApp", selectedItemsForSend)}
                    disabled={sending || selectedItemsForSend.length === 0}
                    className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1ebd5a] transition disabled:opacity-50 text-sm"
                  >
                    <FaWhatsapp className="text-lg" /> Send via WhatsApp
                  </button>
                  <button
                    onClick={() => handleSend("Email", selectedItemsForSend)}
                    disabled={sending || selectedItemsForSend.length === 0}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                  >
                    <FaEnvelope className="text-lg" /> Send via Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {isEmailModalOpen && (
        <EmailModal
          company={company}
          initialSubject="Marketing Materials from IHWE"
          initialContent={initialEmailContent}
          initialAttachments={initialEmailAttachments}
          onClose={() => setIsEmailModalOpen(false)}
          onSend={async () => {
            try {
              if (currentEmailMaterialIds.length > 0) {
                await api.post(`/api/marketing-materials/share`, {
                  cmpny_id: company._id,
                  material_ids: currentEmailMaterialIds,
                  sentVia: "Email",
                  sentBy: "Admin",
                  clientEmail: company.companyEmail || company.email,
                  clientMobile: company.companyMobile || company.mobile,
                  clientName: company.companyName,
                  logOnly: true
                });
              }
            } catch (e) {
              console.error("Failed to log share history:", e);
            }
            fetchShareHistory();
          }}
        />
      )}
    </div>
  );
};

export default MarketingMaterialPage;
