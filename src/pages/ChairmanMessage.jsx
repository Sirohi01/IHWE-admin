import { useState, useEffect } from 'react';
import {
  Save,
  Type,
  Heading,
  Eye,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Info,
  User,
  Signature,
  FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from '../lib/api';

const ChairmanMessage = () => {
  // State management
  const [formData, setFormData] = useState({
    title: "Chairman's Message",
    heading: "Leading Together for a Healthier Tomorrow",
    description: "At IHWE Expo 2026, our Advisory Board plays a pivotal role in driving our mission forward. Their expertise, global perspective, and commitment to innovation guide us in creating a world-class platform that empowers the health and wellness ecosystem.",
    signatureName: "Vijay Sharma",
    chairmanName: "Mr. Vijay Sharma",
    chairmanDesignation: "Chairman, IHWE Expo 2026",
    visionText: "A global platform for collaboration, innovation and impact in health & wellness."
  });

  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState('');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // Fetch chairman message data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/chairman-message');
      if (response.data.success) {
        const data = response.data.data;
        setFormData({
          title: data.title || "Chairman's Message",
          heading: data.heading || "Leading Together for a Healthier Tomorrow",
          description: data.description || "",
          signatureName: data.signatureName || "",
          chairmanName: data.chairmanName || "",
          chairmanDesignation: data.chairmanDesignation || "",
          visionText: data.visionText || ""
        });

        setCurrentPhoto(data.photo || '');
        setPreview(data.photo ? `${SERVER_URL}${data.photo}` : '');
      }
    } catch (error) {
      console.error('Error fetching chairman message:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load chairman message data',
        confirmButtonColor: '#23471d'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveText = async () => {
    setIsLoading(true);
    try {
      const response = await api.put('/api/chairman-message', formData);
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'Chairman message updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save chairman message data',
        confirmButtonColor: '#23471d'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 100KB Size check to ensure fast loading speeds
      if (file.size > 100 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Image Too Large',
          text: 'This image should not exceed 100KB to maintain page loading speed. Please compress and try again.',
          confirmButtonColor: '#23471d'
        });
        return;
      }
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;

    setIsSavingPhoto(true);
    try {
      const formDataPhoto = new FormData();
      formDataPhoto.append('photo', photoFile);

      const response = await api.post('/api/chairman-message/photo', formDataPhoto, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const { photoPath } = response.data;
        setCurrentPhoto(photoPath);
        setPhotoFile(null);

        Swal.fire({
          icon: 'success',
          title: 'Uploaded!',
          text: 'Chairman portrait updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to upload photo',
        confirmButtonColor: '#23471d'
      });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden mb-6">
      <div className="bg-[#23471d] px-6 py-3 flex items-center gap-3">
        <Icon className="w-4 h-4 text-white" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  return (
    <>
      <div className="relative w-full h-64 overflow-hidden rounded mt-8">
        {/* Background Image */}
        <img
          src="/home.png"
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Halka dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-[1]" />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.05] z-[2]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />

        {/* Orange left accent bar */}
        <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b from-[#d26019]/0 via-[#d26019] to-[#d26019]/0 z-[2]" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between px-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d26019] animate-pulse" />
              <p className="text-sm font-bold text-slate-200 uppercase tracking-[0.20em]">
                Admin Panel · Advisory · CMS
              </p>
            </div>
            <h1 className="text-3xl font-semibold text-white leading-tight tracking-tight mb-1">
              Chairman's Message Management
            </h1>
            <p className="text-lg font-medium text-slate-200">
              Manage the advisory board chairman message and vision content
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-3">
            {/* Online badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">System Online</span>
            </div>

            {/* Date */}
            <div className="px-4 py-2 rounded-xl bg-[#d26019]/20 border border-[#d26019]/20">
              <p className="text-[10px] font-black text-[#d26019] uppercase tracking-widest">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md p-6 min-h-screen">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            
            {/* Left side: Photo Upload & Preview */}
            <div className="lg:col-span-4 space-y-6">
              <SectionCard title="Chairman Portrait" icon={ImageIcon}>
                <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex flex-col">
                    <p className="text-[11px] text-blue-700 leading-snug">
                      Upload the Chairman's official photo. Recommended size is <strong>220x290px (3:4 ratio)</strong>.
                    </p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">
                      Must be under 100KB.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Portrait Picture</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">220x290 px</span>
                  </div>

                  <div className="relative aspect-[3/4] bg-slate-100 flex items-center justify-center group overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        className="w-full h-full object-cover"
                        alt="preview"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-400">No Image Uploaded</p>
                      </div>
                    )}

                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      <div className="bg-white px-4 py-2 rounded text-xs font-bold text-gray-900 shadow-lg capitalize">
                        Change Photo
                      </div>
                    </label>

                    {currentPhoto && !photoFile && (
                      <div className="absolute top-2 right-2 bg-[#23471d] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest shadow-sm">
                        Live
                      </div>
                    )}
                  </div>
                </div>

                {photoFile && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleUploadPhoto}
                      disabled={isSavingPhoto}
                      className="bg-[#d26019] hover:bg-[#b8521a] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.1em] shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSavingPhoto ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload className="w-4 h-4" /> Save Portrait</>
                      )}
                    </button>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Right side: Text fields */}
            <div className="lg:col-span-8 space-y-6">
              
              <SectionCard title="Header Content" icon={Heading}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category / Pre-Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Chairman's Message"
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Main Heading</label>
                    <input
                      type="text"
                      name="heading"
                      value={formData.heading}
                      onChange={handleChange}
                      placeholder="e.g. Leading Together for a Healthier Tomorrow"
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Message & Vision Card" icon={Type}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message Body Description</label>
                    <textarea
                      name="description"
                      rows={5}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Write the chairman's speech / message..."
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vision Card Description</label>
                    <textarea
                      name="visionText"
                      rows={3}
                      value={formData.visionText}
                      onChange={handleChange}
                      placeholder="Write the short vision description on the right card..."
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors resize-none"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Chairman Sign & Designation" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Signature className="w-4 h-4 text-slate-400" /> Signature Font Name
                    </label>
                    <input
                      type="text"
                      name="signatureName"
                      value={formData.signatureName}
                      onChange={handleChange}
                      placeholder="e.g. Vijay Sharma (drawn in handwriting style)"
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Display Name</label>
                    <input
                      type="text"
                      name="chairmanName"
                      value={formData.chairmanName}
                      onChange={handleChange}
                      placeholder="e.g. Mr. Vijay Sharma"
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Designation / Role Title</label>
                    <input
                      type="text"
                      name="chairmanDesignation"
                      value={formData.chairmanDesignation}
                      onChange={handleChange}
                      placeholder="e.g. Chairman, IHWE Expo 2026"
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors"
                    />
                  </div>
                </div>
              </SectionCard>

            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-4 mt-8 pb-10">
            <button
              onClick={fetchData}
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reset Form
            </button>
            
            <button
              onClick={handleSaveText}
              disabled={isLoading}
              className="px-12 py-3 bg-[#23471d] hover:bg-[#1a3615] text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Content</>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ChairmanMessage;
