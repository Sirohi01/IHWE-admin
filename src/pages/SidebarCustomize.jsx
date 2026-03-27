import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import api from "../lib/api";
import Swal from "sweetalert2";
import { Palette, Save, RefreshCw } from "lucide-react";

export default function SidebarCustomize() {

    const defaultTheme = {
        bgColor: "#ffffff",
        iconColor: "#2563EB",
        textColor: "#0F2854",
        hoverColor: "#EFF6FF",
        activeColor: "#DBEAFE",
        toggleColor: "#2563EB",
        hamburgerColor: "#000000"
    };

    const [theme, setTheme] = useState(defaultTheme);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const response = await api.get("/api/sidebar-theme");
                if (response.data.success && response.data.data) {
                    setTheme(prev => ({ ...prev, ...response.data.data }));
                }
            } catch (error) {
                console.error("Error fetching theme:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTheme();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTheme(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await api.put("/api/sidebar-theme", theme);
            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Saved!",
                    text: "Sidebar theme updated successfully. Refresh to see changes.",
                    confirmButtonColor: "#134698"
                });
            }
        } catch (error) {
            console.error("Error saving theme:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Could not save sidebar theme settings.",
                confirmButtonColor: "#134698"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        Swal.fire({
            title: "Reset to default?",
            text: "Colors will revert to original blue/white theme.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#134698",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, reset"
        }).then((result) => {
            if (result.isConfirmed) {
                setTheme(defaultTheme);
            }
        });
    };

    const colorFields = [
        { name: "bgColor", label: "Sidebar Background", desc: "Main sidebar background color" },
        { name: "textColor", label: "Text Color", desc: "Navlink labels & headings" },
        { name: "iconColor", label: "Icon Color", desc: "Icons next to nav labels" },
        { name: "hoverColor", label: "Hover Color", desc: "Background on hover" },
        { name: "activeColor", label: "Active Color", desc: "Background when nav is selected" },
        { name: "toggleColor", label: "Toggle / X Button", desc: "Mobile sidebar close button" },
        { name: "hamburgerColor", label: "Hamburger Color", desc: "Menu open button icon color" }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-[#134698]" size={36} />
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md p-6 mt-6 min-h-screen">
            <PageHeader
                title="CUSTOMIZE SIDEBAR"
                description="Manage sidebar colors and styling dynamically"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-0">

                {/* Left Column - Info Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded">
                                <Palette className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">How It Works</h2>
                        </div>
                        <div className="space-y-4 text-[12px] text-gray-600 leading-relaxed">
                            <p>Use the color pickers on the right to customize your sidebar's appearance.</p>
                            <p>Click <strong>"Save Changes"</strong> then <strong>refresh</strong> the page to see the updated colors applied to the sidebar.</p>
                            <div className="pt-3 border-t border-gray-100">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">What stays the same</p>
                                <ul className="space-y-1 text-[11px] text-gray-500">
                                    <li>✓ Font family & font weight</li>
                                    <li>✓ Spacing & margins</li>
                                    <li>✓ Layout & structure</li>
                                    <li>✓ Logo size & position</li>
                                </ul>
                            </div>
                            <div className="pt-3 border-t border-gray-100">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">What changes</p>
                                <ul className="space-y-1 text-[11px] text-gray-500">
                                    <li>✓ Background color</li>
                                    <li>✓ Icon & text colors</li>
                                    <li>✓ Hover & active states</li>
                                    <li>✓ Border colors</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            className="mt-6 w-full px-4 py-2 border-2 border-gray-200 text-gray-600 text-sm font-semibold rounded hover:border-gray-400 hover:text-gray-800 transition-all"
                        >
                            Reset to Defaults
                        </button>
                    </div>
                </div>

                {/* Right Column - Color Settings */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-semibold text-blue-900 uppercase tracking-tight">Sidebar Color Settings</h3>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 bg-[#6b21a8] text-white font-bold transition-all shadow-lg hover:shadow-xl hover:bg-[#581c87] flex items-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {colorFields.map((field) => (
                                    <div key={field.name} className="space-y-2">
                                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                                            {field.label}
                                        </label>
                                        <div className="flex items-center gap-3 border-2 border-gray-200 focus-within:border-blue-500 rounded shadow-sm bg-white px-3 py-2 transition-colors">
                                            {/* Color Preview Swatch + Picker */}
                                            <div className="relative flex-shrink-0">
                                                <div
                                                    className="w-9 h-9 rounded border border-gray-300 shadow-inner"
                                                    style={{ backgroundColor: theme[field.name] }}
                                                />
                                                <input
                                                    type="color"
                                                    name={field.name}
                                                    value={theme[field.name]}
                                                    onChange={handleChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                    title="Click to pick color"
                                                />
                                            </div>
                                            {/* Hex Text Input */}
                                            <input
                                                type="text"
                                                name={field.name}
                                                value={theme[field.name]}
                                                onChange={handleChange}
                                                maxLength={7}
                                                placeholder="#000000"
                                                className="flex-1 text-sm font-bold uppercase tracking-widest outline-none bg-transparent text-gray-800"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic">{field.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Live Preview Strip */}
                        <div className="mx-6 mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Color Preview</p>
                            </div>
                            <div className="p-4 flex items-center gap-4" style={{ backgroundColor: theme.bgColor }}>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.hoverColor }}>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.iconColor }} />
                                    <span className="text-[11px] font-semibold" style={{ color: theme.textColor }}>Nav Item</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ backgroundColor: theme.activeColor, borderColor: theme.iconColor }}>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.iconColor }} />
                                    <span className="text-[11px] font-bold" style={{ color: theme.iconColor }}>Active Item</span>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.toggleColor }}>
                                    <span className="text-[11px] font-bold text-white">✕</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: theme.textColor, opacity: 0.6 }}>SECTION</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-[11px] text-gray-400 text-center italic">
                            Note: Only colors change — all fonts, spacing, margins and layout remain exactly the same.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
