import { useState, useEffect } from "react";
import {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Phone,
    MessageCircle,
    Save,
    Loader2,
    Share2,
    Contact,
} from "lucide-react";
import api from "../lib/api";
import Swal from "sweetalert2";
import PageHeader from "../components/PageHeader";


const SocialMedia = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        youtube: "",
        whatsappNumber: "",
        whatsappMessage: "",
        callNumber: "",
    });

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/api/social-media");
                if (response.data.success) {
                    setFormData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching social media links:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to fetch social media links",
                });
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.put("/api/social-media", formData);
            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Social media links updated successfully",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error("Error updating social media links:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to update social media links",
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            {/* Header */}
            <PageHeader
                title="SOCIAL MEDIA MANAGEMENT"
                description="Manage your social media links and contact information"
            />

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Contact Information */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded">
                                <Contact className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">
                                Contact Info
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                    WhatsApp Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MessageCircle size={16} className="text-[#25D366]" />
                                    </div>
                                    <input
                                        type="text"
                                        name="whatsappNumber"
                                        value={formData.whatsappNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. 919876543210"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">No + symbol</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                    Call Float Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={16} className="text-blue-600" />
                                    </div>
                                    <input
                                        type="text"
                                        name="callNumber"
                                        value={formData.callNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. +919876543210"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                    WhatsApp Message
                                </label>
                                <textarea
                                    name="whatsappMessage"
                                    value={formData.whatsappMessage}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Default message..."
                                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-sm resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-[#9E2A3A] text-white font-semibold rounded hover:bg-[#80222F] transition-colors flex items-center justify-center gap-2 uppercase text-xs shadow-sm"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Social Networks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded">
                                <Share2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">
                                Social Networks
                            </h2>
                        </div>

                        <div className="space-y-5">
                            {/* Facebook */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                                    <Facebook size={14} className="text-[#1877F2]" />
                                    Facebook URL
                                </label>
                                <input
                                    type="url"
                                    name="facebook"
                                    value={formData.facebook}
                                    onChange={handleChange}
                                    placeholder="https://facebook.com/yourpage"
                                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-gray-800 text-sm"
                                />
                            </div>

                            {/* Instagram */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                                    <Instagram size={14} className="text-[#E4405F]" />
                                    Instagram URL
                                </label>
                                <input
                                    type="url"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="https://instagram.com/yourpage"
                                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-gray-800 text-sm"
                                />
                            </div>

                            {/* Twitter */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                                    <Twitter size={14} className="text-black" />
                                    Twitter URL
                                </label>
                                <input
                                    type="url"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    placeholder="https://twitter.com/yourpage"
                                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-gray-800 text-sm"
                                />
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                                    <Linkedin size={14} className="text-[#0A66C2]" />
                                    LinkedIn URL
                                </label>
                                <input
                                    type="url"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/company/yourcompany"
                                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-gray-800 text-sm"
                                />
                            </div>

                            {/* YouTube */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                                    <Youtube size={14} className="text-[#FF0000]" />
                                    YouTube URL
                                </label>
                                <input
                                    type="url"
                                    name="youtube"
                                    value={formData.youtube}
                                    onChange={handleChange}
                                    placeholder="https://youtube.com/@yourchannel"
                                    className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#134698] rounded font-medium text-gray-800 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SocialMedia;
