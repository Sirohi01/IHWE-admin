import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit2, Trash2, Save, BadgeHelp, Type, ImageIcon, 
  FileText, Link as LinkIcon, Image as ImageLucide, Leaf, List
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';

const WhyParticipateManagement = () => {
  const [data, setData] = useState({
    subtitle: "WHY PARTICIPATE",
    heading: "Your Gateway to Growth",
    description: "",
    keyPoints: [],
    button1Text: "Exhibit With Us",
    button1Path: "/exhibit",
    button2Text: "Download Brochure",
    button2File: "",
    image: "",
    imageAltText: "Why Participate",
    imageOverlayText: "Build Relationships. Generate Leads. Grow Your Business.",
    mainPoints: ["Exhibit", "Connect", "Grow"]
  });

  const [imageFile, setImageFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/why-participate");
      if (response.data.success) {
        setData(response.data.data);
        if (response.data.data.image) {
          setImagePreview(`${SERVER_URL}${response.data.data.image}`);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBrochureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBrochureFile(file);
    }
  };

  const handleKeyPointChange = (index, value) => {
    const newPoints = [...data.keyPoints];
    newPoints[index] = value;
    setData({ ...data, keyPoints: newPoints });
  };

  const addKeyPoint = () => {
    setData({ ...data, keyPoints: [...data.keyPoints, ""] });
  };

  const removeKeyPoint = (index) => {
    const newPoints = data.keyPoints.filter((_, i) => i !== index);
    setData({ ...data, keyPoints: newPoints });
  };

  const handleMainPointChange = (index, value) => {
    const newPoints = [...data.mainPoints];
    newPoints[index] = value;
    setData({ ...data, mainPoints: newPoints });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Add all text fields
      formData.append('subtitle', data.subtitle);
      formData.append('heading', data.heading);
      formData.append('description', data.description);
      formData.append('button1Text', data.button1Text);
      formData.append('button1Path', data.button1Path);
      formData.append('button2Text', data.button2Text);
      formData.append('imageAltText', data.imageAltText);
      formData.append('imageOverlayText', data.imageOverlayText);
      
      // Add arrays as JSON strings
      formData.append('keyPoints', JSON.stringify(data.keyPoints));
      formData.append('mainPoints', JSON.stringify(data.mainPoints));

      // Add files
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (brochureFile) {
        formData.append('brochure', brochureFile);
      }

      const response = await api.post("/api/why-participate/settings", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        Swal.fire({ 
          icon: 'success', 
          title: 'Content Saved', 
          timer: 1500, 
          showConfirmButton: false 
        });
        fetchData();
        setImageFile(null);
        setBrochureFile(null);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save content", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
      <PageHeader
        title="WHY PARTICIPATE MANAGEMENT"
        description="Manage the Why Participate section on the home page"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d] border-b-2 border-gray-100 pb-3">
              <Type className="w-5 h-5 text-[#d26019]" /> Text Content
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Subtitle (e.g. WHY PARTICIPATE)</label>
                <input
                  type="text"
                  value={data.subtitle}
                  onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-bold"
                  placeholder="Enter subtitle..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Heading (Your Gateway to Growth)</label>
                <RichTextEditor
                  value={data.heading}
                  onChange={(val) => setData({ ...data, heading: val })}
                  placeholder="Enter heading..."
                  minHeight="100px"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Description</label>
                <RichTextEditor
                  value={data.description}
                  onChange={(val) => setData({ ...data, description: val })}
                  placeholder="Enter description..."
                  minHeight="150px"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight flex items-center justify-between">
                  Key Points List
                  <button 
                    onClick={addKeyPoint}
                    className="text-[10px] bg-[#d26019] text-white px-2 py-1 rounded hover:bg-orange-700 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Point
                  </button>
                </label>
                <div className="space-y-3 mt-2">
                  {data.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handleKeyPointChange(index, e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                          placeholder={`Point ${index + 1}`}
                        />
                      </div>
                      <button 
                        onClick={() => removeKeyPoint(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d] border-b-2 border-gray-100 pb-3">
              <LinkIcon className="w-5 h-5 text-[#d26019]" /> Buttons & Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase border-b pb-1">Primary Button (Exhibit)</p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={data.button1Text}
                    onChange={(e) => setData({ ...data, button1Text: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Button Path/URL</label>
                  <input
                    type="text"
                    value={data.button1Path}
                    onChange={(e) => setData({ ...data, button1Path: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase border-b pb-1">Secondary Button (Brochure)</p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={data.button2Text}
                    onChange={(e) => setData({ ...data, button2Text: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Upload Brochure (PDF/Doc)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={handleBrochureChange}
                      className="text-xs w-full border-2 border-gray-200 p-1"
                      accept=".pdf,.doc,.docx"
                    />
                    {data.button2File && (
                      <a 
                        href={`${SERVER_URL}${data.button2File}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded shrink-0"
                        title="View Current Brochure"
                      >
                        <FileText size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image & Decorative Content */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-gray-200 p-6 shadow-sm rounded-lg">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#23471d] border-b-2 border-gray-100 pb-3">
              <ImageLucide className="w-5 h-5 text-[#d26019]" /> Image & Overlays
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Main Section Image</label>
                <div 
                  className="relative border-2 border-dashed border-gray-300 h-64 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden rounded-lg"
                  onClick={() => document.getElementById('participateImage').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2 group-hover:text-[#23471d]" />
                      <span className="text-xs font-bold text-gray-500 uppercase">Click to Upload Image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    id="participateImage" 
                    className="hidden" 
                    onChange={handleImageChange} 
                    accept="image/*"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Image Alt Text</label>
                <input
                  type="text"
                  value={data.imageAltText}
                  onChange={(e) => setData({ ...data, imageAltText: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                  placeholder="e.g. Exhibitors discussing"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight flex items-center gap-2">
                  Image Overlay Text <Leaf size={14} className="text-green-600" />
                </label>
                <textarea
                  value={data.imageOverlayText}
                  onChange={(e) => setData({ ...data, imageOverlayText: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm min-h-[80px]"
                  placeholder="Enter text that appears on image..."
                />
                <p className="text-[10px] text-gray-400 italic mt-1">* A leaf icon will always be displayed before this text on the website.</p>
              </div>

              <div className="bg-gray-50 p-4 border-2 border-gray-100 rounded-lg">
                <label className="block text-xs font-black text-[#23471d] mb-3 uppercase tracking-widest border-b pb-2">Main Points (Bottom Row)</label>
                <div className="grid grid-cols-3 gap-2">
                  {data.mainPoints.map((point, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleMainPointChange(index, e.target.value)}
                        className="w-full px-2 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none text-xs font-bold text-center uppercase"
                        placeholder={`Point ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-5 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl uppercase tracking-widest text-sm"
          >
            <Save className="w-5 h-5" /> Save Section Content
          </button>

          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-xs text-gray-500 flex items-start gap-3">
            <BadgeHelp size={18} className="text-[#23471d] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700 mb-1 uppercase tracking-tight">Why Participate Guide:</p>
              <ul className="list-disc list-inside space-y-1 font-medium italic">
                <li>**Subtitle** appears above the main heading with a leaf icon.</li>
                <li>**Key Points** are displayed as a checkmark list next to the description.</li>
                <li>**Image Overlay Text** is the text shown inside the green floating box on the image.</li>
                <li>**Main Points** are the three pillars shown at the bottom (Exhibit, Connect, Grow).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyParticipateManagement;
