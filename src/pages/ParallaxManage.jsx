import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Save, Image as ImageIcon, Type, Upload, Link as LinkIcon, 
  FileText, AlignLeft, MousePointer2, Edit, BadgeHelp 
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';

const ParallaxManage = () => {
  const [formData, setFormData] = useState({
    subheading: "Join The Movement",
    heading: "Shaping the Future of Global Healthcare",
    highlightText: "Global Healthcare",
    description: "Connect with innovators and healthcare leaders driving the next generation of medical excellence worldwide.",
    buttonText: "Join the Expo",
    buttonUrl: "/exhibition",
    imageUrl: ""
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchParallaxData();
  }, []);

  const fetchParallaxData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/parallax");
      if (response.data.success) {
        setFormData(response.data.data);
        if (response.data.data.imageUrl) {
          setImagePreview(response.data.data.imageUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching parallax data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    setUploading(true);
    try {
      const response = await api.post("/api/parallax/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        setFormData({ ...formData, imageUrl: response.data.url });
        setImagePreview(response.data.url);
        Swal.fire({ icon: 'success', title: 'Uploaded!', text: 'Background image uploaded', timer: 1000, showConfirmButton: false });
      }
    } catch (error) {
      Swal.fire("Upload Failed", "Image could not be uploaded.", "error");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/api/parallax", formData);
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Parallax section updated successfully',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update parallax section.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="PARALLAX SECTION MANAGEMENT"
        description="Manage the dynamic parallax section: text content, button links, and background image"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section: Text Content & Call to Action */}
          <div className="lg:col-span-2 space-y-8 text-left">
            {/* Section 1: Text Content */}
            <div className="bg-white border-2 border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                <FileText className="w-5 h-5 text-[#d26019]" /> Text Content
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Main Heading</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="heading"
                      value={formData.heading}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none transition-colors"
                      placeholder="Enter main heading..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Subheading</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="subheading"
                      value={formData.subheading}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#d26019] mb-2 uppercase tracking-tight">Highlight Text (Orange)</label>
                  <div className="relative">
                    <Edit className="absolute left-3 top-3 w-4 h-4 text-[#d26019]/60" />
                    <input
                      type="text"
                      name="highlightText"
                      value={formData.highlightText}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none transition-colors"
                      placeholder="Text from heading to highlight..."
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Short Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none transition-colors resize-none text-sm"
                    placeholder="Enter a brief description..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 2: Call to Action */}
            <div className="bg-white border-2 border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                <MousePointer2 className="w-5 h-5 text-[#d26019]" /> Button & Link
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Button Text</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Button URL / Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="buttonUrl"
                      value={formData.buttonUrl}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none transition-colors"
                      placeholder="/exhibition or https://..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Global Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || uploading}
                className="w-full py-4 bg-[#d26019] text-white text-lg font-black uppercase tracking-widest hover:bg-[#b54e12] transition-all shadow-xl disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Save className="w-6 h-6" /> Save All Settings</>
                )}
              </button>
            </div>
          </div>

          {/* Right Section: Background Image */}
          <div className="lg:col-span-1 space-y-8 text-left">
            <div className="bg-white border-2 border-gray-200 p-8 shadow-sm min-h-full">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#23471d]">
                <ImageIcon className="w-5 h-5 text-[#d26019]" /> Background Image
              </h2>

              <div className="border-2 border-dashed border-gray-300 hover:border-[#23471d] transition-all p-8 flex flex-col items-center gap-4 group">
                {imagePreview ? (
                  <div className="relative w-full aspect-video border-4 border-white shadow-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`${SERVER_URL}${imagePreview}`} 
                      className="w-full h-full object-cover" 
                      alt="Current Background" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                      Change Image
                    </div>
                  </div>
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-200" />
                )}
                
                <label className="w-full text-left">
                  <div className={`w-full py-3 flex items-center justify-center gap-2 text-white font-bold cursor-pointer transition-all shadow-lg ${uploading ? 'bg-gray-400' : 'bg-[#23471d] hover:bg-[#1a3615] hover:scale-105 active:scale-95'}`}>
                    {uploading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload size={18} /> Choose Background</>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                </label>
                <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-200 rounded text-xs text-gray-500 flex items-start gap-3">
                  <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-700 mb-1">UI/UX Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Recommended: 1920x800px</li>
                      <li>High-Quality JPG/PNG for clarity</li>
                      <li>Image will have a dark overlay automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParallaxManage;
