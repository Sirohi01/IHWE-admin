import { useState, useEffect } from 'react';
import { Search, Plus, X, Eye, Calendar, Image, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import api, { API_URL, SERVER_URL } from "../lib/api";
import Pagination from "../components/Pagination";
import Table from '../components/table/Table';
import PageHeader from '../components/PageHeader';
import RichTextEditor from '../components/RichTextEditor';


// Timer Component
const TimeRemaining = ({ schedule }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!schedule?.startDate || !schedule?.startTime) return '';

      const now = new Date().getTime();
      const startDateTime = new Date(schedule.startDate + 'T' + schedule.startTime).getTime();
      const endDateTime = schedule.endDate && schedule.endTime
        ? new Date(schedule.endDate + 'T' + schedule.endTime).getTime()
        : null;

      if (endDateTime && now > endDateTime) {
        return '⏰ Ended';
      }

      if (now >= startDateTime && (!endDateTime || now < endDateTime)) {
        return '🟢 Live Now';
      }

      if (now < startDateTime) {
        const difference = startDateTime - now;
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) return `⏳ ${days}d ${hours}h left`;
        if (hours > 0) return `⏳ ${hours}h ${minutes}m left`;
        if (minutes > 0) return `⏳ ${minutes}m ${seconds}s left`;
        return `⏳ ${seconds}s left`;
      }

      return '';
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [schedule]);

  return (
    <div className={`text-xs font-semibold ${timeLeft.includes('Live') ? 'text-green-600' :
      timeLeft.includes('Ended') ? 'text-red-600' :
        'text-blue-600'
      }`}>
      {timeLeft}
    </div>
  );
};

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    image: null,
    altText: "",
    subtitle: "",
    title: "",
    titleFontSize: "45",
    description: "",
    descriptionFontSize: "16",
    button1Name: "View Our Projects",
    button1Url: "/projects-list",
    button2Name: "Get Free Consultation",
    button2Url: "/contact-list",
    isActive: true,
    order: 0
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedule, setSchedule] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: ""
  });
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/hero/all');

      if (response.data.success) {
        setSlides(response.data.data);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch slides',
        confirmButtonColor: '#134698'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.subtitle.trim() || !formData.title.trim() || !formData.description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill all required fields',
        confirmButtonColor: '#134698'
      });
      return;
    }

    if (!editMode && !formData.image) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Image',
        text: 'Please upload an image',
        confirmButtonColor: '#134698'
      });
      return;
    }

    try {
      setIsLoading(true);
      const formDataToSend = new FormData();

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      formDataToSend.append('altText', formData.altText);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('titleFontSize', formData.titleFontSize);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('descriptionFontSize', formData.descriptionFontSize);
      formDataToSend.append('button1Name', formData.button1Name);
      formDataToSend.append('button1Url', formData.button1Url);
      formDataToSend.append('button2Name', formData.button2Name);
      formDataToSend.append('button2Url', formData.button2Url);
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('order', formData.order);

      if (schedule.startDate && schedule.startTime) {
        formDataToSend.append('schedule', JSON.stringify(schedule));
      }

      let response;
      if (editMode) {
        response = await api.put(`/api/hero/update/${editId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/api/hero/create', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: editMode ? 'Slide updated successfully' : 'Slide created successfully',
          confirmButtonColor: '#134698',
          timer: 2000
        });

        handleReset();
        fetchSlides();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Operation failed',
        confirmButtonColor: '#134698'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      image: null,
      altText: "",
      subtitle: "",
      title: "",
      titleFontSize: "45",
      description: "",
      descriptionFontSize: "16",
      button1Name: "View Our Projects",
      button1Url: "/projects-list",
      button2Name: "Get Free Consultation",
      button2Url: "/contact-list",
      isActive: true,
      order: 0
    });
    setImagePreview(null);
    setEditMode(false);
    setEditId(null);
    setSchedule({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: ""
    });
  };

  const handleEdit = (slide) => {
    setEditMode(true);
    setEditId(slide._id);
    setFormData({
      image: null,
      altText: slide.altText || "",
      subtitle: slide.subtitle,
      title: slide.title,
      titleFontSize: slide.titleFontSize || "45",
      description: slide.description,
      descriptionFontSize: slide.descriptionFontSize || "16",
      button1Name: slide.button1Name || "View Our Projects",
      button1Url: slide.button1Url || "/projects-list",
      button2Name: slide.button2Name || "Get Free Consultation",
      button2Url: slide.button2Url || "/contact-list",
      isActive: slide.isActive,
      order: slide.order || 0
    });
    setImagePreview(`${SERVER_URL}${slide.image}`);

    if (slide.schedule) {
      setSchedule(slide.schedule);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    Swal.fire({
      icon: 'info',
      title: 'Edit Mode',
      text: 'Update the slide details',
      confirmButtonColor: '#134698',
      timer: 1500
    });
  };

  const handleDelete = async (slide) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `Delete slide: <strong>${slide.title}</strong>?<br><span class="text-red-600">This cannot be undone!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const response = await api.delete(`/api/hero/delete/${slide._id}`);

        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Slide deleted successfully',
            confirmButtonColor: '#134698',
            timer: 2000
          });
          fetchSlides();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete',
          confirmButtonColor: '#134698'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleView = (slide) => {
    setViewData(slide);
    setViewModal(true);
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setSchedule(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleSave = async () => {
    if (!schedule.startDate || !schedule.startTime) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Start date & time required',
        confirmButtonColor: '#134698'
      });
      return;
    }

    try {
      setIsLoading(true);

      if (editMode && editId) {
        const formDataToSend = new FormData();

        if (formData.image) {
          formDataToSend.append('image', formData.image);
        }
        formDataToSend.append('subtitle', formData.subtitle);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('titleFontSize', formData.titleFontSize);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('descriptionFontSize', formData.descriptionFontSize);
        formDataToSend.append('isActive', formData.isActive);
        formDataToSend.append('schedule', JSON.stringify(schedule));

        const response = await api.put(`/api/hero/update/${editId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Scheduled!',
            text: 'Slide scheduled successfully',
            confirmButtonColor: '#134698',
            timer: 2000
          });
          setShowSchedule(false);
          fetchSlides();
        }
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Schedule Saved',
          text: 'Schedule will be applied when you create the slide',
          confirmButtonColor: '#134698',
          timer: 2000
        });
        setShowSchedule(false);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save schedule',
        confirmButtonColor: '#134698'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSlides = slides.filter(slide =>
    slide.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slide.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSlides = filteredSlides.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    {
      key: "sno",
      label: "S.NO",
      width: "80px",
      render: (row, index) => (
        <div className="font-bold text-gray-900">{startIndex + index + 1}</div>
      )
    },
    {
      key: "order",
      label: "ORDER",
      width: "80px",
      render: (row) => (
        <div className="font-bold text-gray-900 bg-blue-50 px-2 py-1 border border-blue-200 text-center">{row.order || 0}</div>
      )
    },
    {
      key: "image",
      label: "IMAGE",
      render: (row) => (
        <div className="overflow-hidden border-2 border-gray-300 shadow-lg" style={{ width: '128px', aspectRatio: '16/6' }}>
          <img
            src={`${SERVER_URL}${row.image}`}
            alt={row.title}
            className="w-full h-full object-cover"
          />
        </div>
      )
    },
    {
      key: "altText",
      label: "ALT TEXT",
      render: (row) => (
        <div className="text-gray-600 text-xs italic max-w-[150px] truncate">{row.altText || "-"}</div>
      )
    },
    {
      key: "title",
      label: "TITLE",
      render: (row) => (
        <div 
          className="font-medium text-gray-900 max-w-[250px] line-clamp-2" 
          dangerouslySetInnerHTML={{ __html: row.title }}
        />
      )
    },
    {
      key: "subtitle",
      label: "SUBTITLE",
      render: (row) => (
        <div className="text-gray-700 text-sm">{row.subtitle}</div>
      )
    },
    {
      key: "button1",
      label: "BUTTON 1",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs">{row.button1Name}</span>
          <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{row.button1Url}</span>
        </div>
      )
    },
    {
      key: "button2",
      label: "BUTTON 2",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs">{row.button2Name}</span>
          <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{row.button2Url}</span>
        </div>
      )
    },
    {
      key: "schedule",
      label: "SCHEDULE",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.schedule?.startDate ? (
            <>
              <div className="text-xs text-gray-600">
                <span className="font-semibold">Start:</span> {new Date(row.schedule.startDate + 'T' + row.schedule.startTime).toLocaleString()}
              </div>
              {row.schedule.endDate && (
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">End:</span> {new Date(row.schedule.endDate + 'T' + row.schedule.endTime).toLocaleString()}
                </div>
              )}
              <TimeRemaining schedule={row.schedule} />
            </>
          ) : (
            <span className="text-xs text-gray-400">Not Scheduled</span>
          )}
        </div>
      )
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <span className={`px-3 py-1 text-xs font-semibold ${row.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div className="bg-white shadow-md mt-6 p-6">
      <div className="w-full">
        <PageHeader
          title="HERO SLIDER MANAGEMENT"
          description="Manage hero section slides"
        />

        <div className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50">
              <Image className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editMode ? 'Edit Hero Slide' : 'Create New Hero Slide'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Subtitle *
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="e.g., PREMIUM INTERIOR"
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                name="isActive"
                value={formData.isActive}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Order Number
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                placeholder="Slide order..."
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Alt Text (SEO)
              </label>
              <input
                type="text"
                name="altText"
                value={formData.altText}
                onChange={handleInputChange}
                placeholder="Image alt text..."
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
              />
            </div>

            {/* Editors Row - Half and Half */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-gray-700">
                  Hero Title *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Default: 45px</span>
                  <div className="flex items-center border-2 border-gray-300 rounded overflow-hidden h-6 bg-white shadow-sm">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const newSize = Math.max(1, parseInt(formData.titleFontSize || 0) - 1);
                        setFormData(prev => ({ ...prev, titleFontSize: newSize.toString() }));
                      }}
                      className="px-1.5 h-full hover:bg-gray-100 border-r border-gray-300 transition-colors text-[10px] font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      name="titleFontSize"
                      value={formData.titleFontSize}
                      onChange={handleInputChange}
                      className="w-10 h-full text-center text-[10px] focus:outline-none border-0"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const newSize = parseInt(formData.titleFontSize || 0) + 1;
                        setFormData(prev => ({ ...prev, titleFontSize: newSize.toString() }));
                      }}
                      className="px-1.5 h-full hover:bg-gray-100 border-l border-gray-300 transition-colors text-[10px] font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <RichTextEditor
                value={formData.title}
                onChange={(content) => setFormData(prev => ({ ...prev, title: content }))}
                placeholder="Enter Hero Title..."
                minHeight="150px"
                fontSize={formData.titleFontSize}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-gray-700">
                  Description *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Default: 16px</span>
                  <div className="flex items-center border-2 border-gray-300 rounded overflow-hidden h-6 bg-white shadow-sm">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const newSize = Math.max(1, parseInt(formData.descriptionFontSize || 0) - 1);
                        setFormData(prev => ({ ...prev, descriptionFontSize: newSize.toString() }));
                      }}
                      className="px-1.5 h-full hover:bg-gray-100 border-r border-gray-300 transition-colors text-[10px] font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      name="descriptionFontSize"
                      value={formData.descriptionFontSize}
                      onChange={handleInputChange}
                      className="w-10 h-full text-center text-[10px] focus:outline-none border-0"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const newSize = parseInt(formData.descriptionFontSize || 0) + 1;
                        setFormData(prev => ({ ...prev, descriptionFontSize: newSize.toString() }));
                      }}
                      className="px-1.5 h-full hover:bg-gray-100 border-l border-gray-300 transition-colors text-[10px] font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <RichTextEditor
                value={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Enter description..."
                minHeight="150px"
                fontSize={formData.descriptionFontSize}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Button 1 Name
                </label>
                <input
                  type="text"
                  name="button1Name"
                  value={formData.button1Name}
                  onChange={handleInputChange}
                  placeholder="e.g., View Our Projects"
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Button 1 URL
                </label>
                <input
                  type="text"
                  name="button1Url"
                  value={formData.button1Url}
                  onChange={handleInputChange}
                  placeholder="e.g., /projects-list"
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Button 2 Name
                </label>
                <input
                  type="text"
                  name="button2Name"
                  value={formData.button2Name}
                  onChange={handleInputChange}
                  placeholder="e.g., Get Free Consultation"
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Button 2 URL
                </label>
                <input
                  type="text"
                  name="button2Url"
                  value={formData.button2Url}
                  onChange={handleInputChange}
                  placeholder="e.g., /contact-list"
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Image (1600 * 600 - 16:6 Ratio) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-sm shadow-lg"
              />
                {imagePreview && (
                  <div className="mt-3 w-full border-2 border-[#23471d] shadow-lg overflow-hidden" style={{ aspectRatio: '16/6' }}>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setShowSchedule(true)}
              className="px-6 py-3 bg-purple-600 text-white font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 uppercase tracking-wider text-sm"
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>

            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-500 text-white font-bold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider text-sm"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-3 bg-[#9E2A3A] text-white font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{editMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{editMode ? 'Update Slide' : 'Create Slide'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b bg-[#23471d]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Hero Slides List</h2>
                <p className="text-sm text-blue-100 mt-0.5">
                  Showing {filteredSlides.length} of {slides.length} slides
                </p>
              </div>

              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search slides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm border-2 border-gray-300 focus:outline-none focus:border-white transition-colors shadow-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Table
                columns={columns}
                data={paginatedSlides}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                wrapperClassName="orange-scrollbar"
              />
            )}
          </div>

          <div className="mt-4 px-4 pb-4 bg-white">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredSlides.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              label="slides"
            />
          </div>
        </div>
      </div>

      {showSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-lg shadow-2xl p-6 animate-slide-up">
            <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Slide
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={schedule.startDate}
                  onChange={handleScheduleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] shadow-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={schedule.startTime}
                  onChange={handleScheduleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] shadow-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={schedule.endDate}
                  onChange={handleScheduleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] shadow-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={schedule.endTime}
                  onChange={handleScheduleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] shadow-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSchedule(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSave}
                className="px-4 py-2 bg-[#1e3a8a] text-white hover:bg-blue-800 transition shadow-lg"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {viewModal && viewData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setViewModal(false)}>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1e3a8a] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-xl font-bold">View Slide Details</h3>
              <button onClick={() => setViewModal(false)} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="border-2 border-gray-300 p-4">
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Hero Image
                </h4>
                <img
                  src={`${API_URL}${viewData.image}`}
                  alt={viewData.title}
                  className="w-full h-80 object-cover border-2 border-gray-300 shadow-lg"
                />
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">Alt Text:</span> {viewData.altText || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-500 mb-1">SUBTITLE</p>
                  <p className="text-lg text-gray-900">{viewData.subtitle}</p>
                </div>

                <div className="border-2 border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-500 mb-1">TITLE</p>
                  <p className="text-xl font-bold text-gray-900">{viewData.title}</p>
                </div>

                <div className="border-2 border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-500 mb-1">HIGHLIGHT</p>
                  <p className="text-xl font-bold text-[#DE802B]">{viewData.highlight}</p>
                </div>

                <div className="border-2 border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-500 mb-1">STATUS</p>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold ${viewData.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {viewData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="border-2 border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-500 mb-2">DESCRIPTION</p>
                <p className="text-gray-700 leading-relaxed">{viewData.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-500 mb-1">BUTTON 1</p>
                  <p className="text-gray-900 font-medium">{viewData.button1Name}</p>
                  <p className="text-gray-600 text-sm">{viewData.button1Url}</p>
                </div>
                <div className="border-2 border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-500 mb-1">BUTTON 2</p>
                  <p className="text-gray-900 font-medium">{viewData.button2Name}</p>
                  <p className="text-gray-600 text-sm">{viewData.button2Url}</p>
                </div>
              </div>

              {viewData.schedule?.startDate && (
                <div className="border-2 border-blue-200 bg-blue-50 p-4">
                  <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Schedule Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Start Date & Time</p>
                      <p className="text-gray-900">
                        {new Date(viewData.schedule.startDate + 'T' + viewData.schedule.startTime).toLocaleString()}
                      </p>
                    </div>
                    {viewData.schedule.endDate && (
                      <div>
                        <p className="text-sm font-semibold text-blue-700">End Date & Time</p>
                        <p className="text-gray-900">
                          {new Date(viewData.schedule.endDate + 'T' + viewData.schedule.endTime).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold text-blue-700 mb-1">Time Status</p>
                      <TimeRemaining schedule={viewData.schedule} />
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Created: {viewData.createdAt ? new Date(viewData.createdAt).toLocaleString() : 'N/A'}</span>
                  <span>Updated: {viewData.updatedAt ? new Date(viewData.updatedAt).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;