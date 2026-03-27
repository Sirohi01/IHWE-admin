import { useState, useEffect } from 'react';
import {
  Save,
  Type,
  Heading,
  Target,
  Eye,
  Video,
  Upload,
  RefreshCw,
  FileText,
  Play
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
    mission: "Empowering healthcare leaders with breakthrough technologies, fostering cross-border collaboration, and accelerating advancements in patient-centered care."
  });

  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [currentVideo, setCurrentVideo] = useState('');
  const [isSavingVideo, setIsSavingVideo] = useState(false);

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
          mission: data.mission || ""
        });
        if (data.video) {
          setCurrentVideo(data.video);
          setVideoPreview(`${SERVER_URL}${data.video}`);
        }
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

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Please upload a video file smaller than 100MB',
          confirmButtonColor: '#23471d'
        });
        e.target.value = '';
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadVideo = async () => {
    if (!videoFile) return;
    setIsSavingVideo(true);
    try {
      const formDataVideo = new FormData();
      formDataVideo.append('video', videoFile);
      const response = await api.post('/api/about/video', formDataVideo, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setCurrentVideo(response.data.videoPath);
        setVideoFile(null);
        Swal.fire({
          icon: 'success',
          title: 'Uploaded!',
          text: 'Video uploaded successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to upload video',
        confirmButtonColor: '#23471d'
      });
    } finally {
      setIsSavingVideo(false);
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
            <SectionCard title="About Video" icon={Video}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-colors p-8 text-center bg-gray-50">
                    <input
                      type="file"
                      accept="video/*"
                      id="video-upload"
                      className="hidden"
                      onChange={handleVideoChange}
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-semibold text-gray-700">Click to upload video</p>
                      <p className="text-xs text-gray-400 mt-2">MP4, WebM, OGG (Max 100MB)</p>
                    </label>
                  </div>
                  {videoFile && (
                    <div className="bg-orange-50 border border-orange-200 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#d26019]" />
                        <span className="text-xs font-semibold text-[#d26019] truncate max-w-[200px]">{videoFile.name}</span>
                      </div>
                      <button
                        onClick={handleUploadVideo}
                        disabled={isSavingVideo}
                        className="bg-[#d26019] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-[#b8521a] transition-colors disabled:opacity-50"
                      >
                        {isSavingVideo ? "Uploading..." : "Upload Now"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {videoPreview ? (
                    <video
                      key={videoPreview}
                      src={videoPreview}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Play className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No video uploaded</p>
                    </div>
                  )}
                  {currentVideo && !videoFile && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] px-2 py-1 font-bold uppercase">
                      Live
                    </div>
                  )}
                </div>
              </div>
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