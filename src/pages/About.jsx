import { useState, useEffect } from 'react';
import {
  Save,
  Type,
  Heading,
  Target,
  Eye,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  FileText,
  Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from '../lib/api';
import PageHeader from '../components/PageHeader';

const About = () => {
  // State management
  const [formData, setFormData] = useState({
    heading: "About The Expo",
    subheading: "A Global Platform for Healthcare Excellence",
    highlightedWord: "Healthcare Excellence",
    description: "The International Health & Wellness Expo stands as a premier global gathering where healthcare leaders, innovators, and visionaries converge to shape the future of medical science. From advanced diagnostics to AI-driven solutions and wellness technologies, the expo fosters meaningful dialogue and transformative partnerships.",
    vision: "To become the world's most influential healthcare exhibition platform, uniting medical pioneers, researchers, and global innovators under one transformative ecosystem.",
    mission: "Empowering healthcare leaders with breakthrough technologies, fostering cross-border collaboration, and accelerating advancements in patient-centered care.",
    image1Alt: "",
    image2Alt: "",
    image3Alt: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState({
    image1: null, image2: null, image3: null
  });
  const [previews, setPreviews] = useState({
    image1: '', image2: '', image3: ''
  });
  const [currentImages, setCurrentImages] = useState({
    image1: '', image2: '', image3: ''
  });
  const [isSavingImages, setIsSavingImages] = useState(false);

  // Fetch about data on mount
  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/about');
      if (response.data.success) {
        const data = response.data.data;
        setFormData({
          heading: data.heading || "About The Expo",
          subheading: data.subheading || "A Global Platform for Healthcare Excellence",
          highlightedWord: data.highlightedWord || "Healthcare Excellence",
          description: data.description || "",
          vision: data.vision || "",
          mission: data.mission || "",
          image1Alt: data.image1Alt || "",
          image2Alt: data.image2Alt || "",
          image3Alt: data.image3Alt || ""
        });
        
        setCurrentImages({
          image1: data.image1 || '',
          image2: data.image2 || '',
          image3: data.image3 || ''
        });
        
        setPreviews({
          image1: data.image1 ? `${SERVER_URL}${data.image1}` : '',
          image2: data.image2 ? `${SERVER_URL}${data.image2}` : '',
          image3: data.image3 ? `${SERVER_URL}${data.image3}` : ''
        });
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load about data',
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
      const response = await api.put('/api/about', formData);
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'About content updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save about data',
        confirmButtonColor: '#23471d'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // 100KB Size check
      if (file.size > 100 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Image Too Large',
          text: 'This image should not exceed 100KB to maintain loading speed. Please compress and try again.',
          confirmButtonColor: '#23471d'
        });
        return;
      }
      setImageFiles(prev => ({ ...prev, [fieldName]: file }));
      setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  const handleUploadImages = async () => {
    const filesToUpload = Object.entries(imageFiles).filter(([_, file]) => file !== null);
    if (filesToUpload.length === 0) return;

    setIsSavingImages(true);
    try {
      const formDataImages = new FormData();
      filesToUpload.forEach(([fieldName, file]) => {
        formDataImages.append(fieldName, file);
      });

      const response = await api.post('/api/about/images', formDataImages, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const { imagePaths } = response.data;
        setCurrentImages(prev => ({ ...prev, ...imagePaths }));
        setImageFiles({ image1: null, image2: null, image3: null });
        
        Swal.fire({
          icon: 'success',
          title: 'Uploaded!',
          text: 'Images updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to upload images',
        confirmButtonColor: '#23471d'
      });
    } finally {
      setIsSavingImages(false);
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
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <div className="w-full">
        <PageHeader
          title="ABOUT PAGE MANAGEMENT"
          description="Manage your company's about page content"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left side: Video Upload & Preview */}
          <div className="lg:col-span-12 xl:col-span-12">
            <SectionCard title="About Section Images & SEO" icon={ImageIcon}>
              <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <Info className="w-4 h-4 text-blue-600" />
                <div className="flex flex-col">
                  <p className="text-xs text-blue-700">
                    Recommended sizes follow the <strong>Editorial Grid</strong> layout for a premium look. 
                    Please provide <strong>Alt Text</strong> for each image to improve SEO ranking.
                  </p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">
                    Wait! Each image MUST be under 100KB for best performance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'image1', label: 'Image 1 (Main/Tall)', dimensions: '900x1200 px (3:4)', aspect: 'aspect-[3/4]', altField: 'image1Alt' },
                  { id: 'image2', label: 'Image 3 (Wide/Bottom)', dimensions: '1200x675 px (16:9)', aspect: 'aspect-[16/9]', altField: 'image2Alt' },
                  { id: 'image3', label: 'Image 2 (Square/Top)', dimensions: '800x800 px (1:1)', aspect: 'aspect-square', altField: 'image3Alt' }
                ].map((item) => (
                  <div key={item.id} className="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">{item.label}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">{item.dimensions}</span>
                    </div>
                    
                    <div className={`relative ${item.aspect} bg-slate-100 flex items-center justify-center group`}>
                      {previews[item.id] ? (
                         <img 
                          src={previews[item.id]} 
                          className="w-full h-full object-cover" 
                          alt="preview"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-[10px] text-gray-400">No Image</p>
                        </div>
                      )}
                      
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageChange(e, item.id)}
                        />
                        <div className="bg-white px-4 py-2 rounded text-xs font-bold text-gray-900 shadow-lg capitalize">
                          Change Image
                        </div>
                      </label>

                      {currentImages[item.id] && !imageFiles[item.id] && (
                         <div className="absolute top-2 right-2 bg-[#23471d] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest shadow-sm">
                           Live
                         </div>
                      )}
                    </div>

                    <div className="p-4 space-y-3 flex-grow flex flex-col justify-end bg-white">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">SEO Alt Text</label>
                        <input
                          type="text"
                          name={item.altField}
                          value={formData[item.altField]}
                          onChange={handleChange}
                          placeholder="e.g. Healthcare networking event..."
                          className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-[#23471d] text-[11px] rounded transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {Object.values(imageFiles).some(f => f !== null) && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                  <button
                    onClick={handleUploadImages}
                    disabled={isSavingImages}
                    className="bg-[#d26019] hover:bg-[#b8521a] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.1em] shadow-lg flex items-center gap-2 transition-all"
                  >
                    {isSavingImages ? (
                       <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Save All New Images</>
                    )}
                  </button>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Right side: Text fields */}
          <div className="lg:col-span-12 xl:col-span-12 space-y-6">
            <SectionCard title="Header Content" icon={Heading}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Main Heading</label>
                  <input
                    type="text"
                    name="heading"
                    value={formData.heading}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subheading</label>
                  <input
                    type="text"
                    name="subheading"
                    value={formData.subheading}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 underline decoration-[#23471d]">Highlighted Word(s)</label>
                  <input
                    type="text"
                    name="highlightedWord"
                    value={formData.highlightedWord}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#d26019] text-sm shadow-sm transition-colors"
                  />
                  <p className="mt-1.5 text-[10px] text-gray-400 italic">This word will be highlighted with an underline in the subheading.</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="About Description" icon={Type}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Main Description</label>
                <textarea
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors resize-none"
                />
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard title="Our Vision" icon={Eye}>
                <textarea
                  name="vision"
                  rows={4}
                  value={formData.vision}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors resize-none"
                />
              </SectionCard>
              <SectionCard title="Our Mission" icon={Target}>
                <textarea
                  name="mission"
                  rows={4}
                  value={formData.mission}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#23471d] text-sm shadow-sm transition-colors resize-none"
                />
              </SectionCard>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-4 mt-8 pb-10">
          <button
            onClick={fetchAboutData}
            className="px-6 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Reset
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
  );
};

export default About;