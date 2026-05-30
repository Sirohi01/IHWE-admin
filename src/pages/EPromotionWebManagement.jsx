import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { FRONTEND_URL } from "../lib/api";
import {
    Save, Plus, Trash2, Edit, RefreshCw, Sliders,
    Users, Award, MessageSquare, Briefcase, Eye, EyeOff, Check
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const EPromotionWebManagement = () => {
    const [activeTab, setActiveTab] = useState('packages');
    const [isLoading, setIsLoading] = useState(false);

    // Data States
    const [packages, setPackages] = useState([]);
    const [addons, setAddons] = useState([]);
    const [reach, setReach] = useState({
        tradeVisitors: '20,000+',
        exhibitors: '500+',
        countries: '25+',
        socialMediaReach: '500,000+',
        emailReach: '100,000+'
    });
    const [testimonials, setTestimonials] = useState([]);

    // Form States
    const [packageForm, setPackageForm] = useState({
        title: '',
        subtitle: '',
        price: '',
        gstText: '+18% GST',
        featuresText: '', // features joined by newline
        backgroundImage: '/images/9.png',
        buttonText: 'CHOOSE PACKAGE',
        badgeText: '',
        borderColor: '',
        textColor: 'text-green-800',
        priceColor: 'text-green-800',
        order: 0,
        isActive: true
    });
    const [editingPackageId, setEditingPackageId] = useState(null);

    const [addonForm, setAddonForm] = useState({
        name: '',
        price: '',
        order: 0
    });
    const [editingAddonId, setEditingAddonId] = useState(null);

    const [testimonialForm, setTestimonialForm] = useState({
        text: '',
        name: '',
        order: 0
    });
    const [editingTestimonialId, setEditingTestimonialId] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [pkgsRes, addonsRes, reachRes, testimonialsRes] = await Promise.all([
                api.get('/api/e-promotion-packages/packages'),
                api.get('/api/e-promotion-packages/addons'),
                api.get('/api/e-promotion-packages/reach'),
                api.get('/api/e-promotion-packages/testimonials')
            ]);

            if (pkgsRes.data.success) setPackages(pkgsRes.data.data);
            if (addonsRes.data.success) setAddons(addonsRes.data.data);
            if (reachRes.data.success) setReach(reachRes.data.data);
            if (testimonialsRes.data.success) setTestimonials(testimonialsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire('Error', 'Failed to fetch E-Promotion data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetDefaults = async () => {
        const result = await Swal.fire({
            title: 'Reset to Defaults?',
            text: "This will restore original packages, reach metrics, add-ons, and testimonials. All current edits will be overwritten.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d26019',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Yes, reset everything!'
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            const response = await api.post('/api/e-promotion-packages/packages/seed-all');
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'System Restored!',
                    text: 'Default configurations have been loaded successfully.',
                    timer: 1800,
                    showConfirmButton: false
                });
                fetchAllData();
                resetForms();
            }
        } catch (error) {
            console.error('Error seeding:', error);
            Swal.fire('Error', 'Failed to restore default configurations', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForms = () => {
        setPackageForm({
            title: '',
            subtitle: '',
            price: '',
            gstText: '+18% GST',
            featuresText: '',
            backgroundImage: '/images/9.png',
            buttonText: 'CHOOSE PACKAGE',
            badgeText: '',
            borderColor: '',
            textColor: 'text-green-800',
            priceColor: 'text-green-800',
            order: 0,
            isActive: true
        });
        setEditingPackageId(null);

        setAddonForm({
            name: '',
            price: '',
            order: 0
        });
        setEditingAddonId(null);

        setTestimonialForm({
            text: '',
            name: '',
            order: 0
        });
        setEditingTestimonialId(null);
    };

    // ==========================================
    // PACKAGES HANDLERS
    // ==========================================
    const handlePackageSubmit = async (e) => {
        e.preventDefault();
        if (!packageForm.title || !packageForm.price) {
            Swal.fire('Warning', 'Title and Price are required fields', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...packageForm,
                price: Number(packageForm.price),
                features: packageForm.featuresText.split('\n').map(f => f.trim()).filter(Boolean)
            };

            let response;
            if (editingPackageId) {
                response = await api.put(`/api/e-promotion-packages/packages/${editingPackageId}`, payload);
            } else {
                response = await api.post('/api/e-promotion-packages/packages', payload);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: editingPackageId ? 'Package Updated!' : 'Package Created!',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForms();
                fetchAllData();
            }
        } catch (error) {
            console.error('Error saving package:', error);
            Swal.fire('Error', 'Failed to save package', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEditPackage = (pkg) => {
        setEditingPackageId(pkg._id);
        setPackageForm({
            title: pkg.title,
            subtitle: pkg.subtitle || '',
            price: pkg.price.toString(),
            gstText: pkg.gstText || '+18% GST',
            featuresText: (pkg.features || []).join('\n'),
            backgroundImage: pkg.backgroundImage || '/images/9.png',
            buttonText: pkg.buttonText || 'CHOOSE PACKAGE',
            badgeText: pkg.badgeText || '',
            borderColor: pkg.borderColor || '',
            textColor: pkg.textColor || 'text-green-800',
            priceColor: pkg.priceColor || 'text-green-800',
            order: pkg.order || 0,
            isActive: pkg.isActive !== false
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeletePackage = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Package?',
            text: "Are you sure you want to delete this promotion package?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            const response = await api.delete(`/api/e-promotion-packages/packages/${id}`);
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
                fetchAllData();
            }
        } catch (error) {
            console.error('Error deleting package:', error);
            Swal.fire('Error', 'Failed to delete package', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // ADDONS HANDLERS
    // ==========================================
    const handleAddonSubmit = async (e) => {
        e.preventDefault();
        if (!addonForm.name || !addonForm.price) {
            Swal.fire('Warning', 'Addon name and price are required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (editingAddonId) {
                response = await api.put(`/api/e-promotion-packages/addons/${editingAddonId}`, addonForm);
            } else {
                response = await api.post('/api/e-promotion-packages/addons', addonForm);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: editingAddonId ? 'Add-on Updated!' : 'Add-on Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForms();
                fetchAllData();
            }
        } catch (error) {
            console.error('Error saving addon:', error);
            Swal.fire('Error', 'Failed to save add-on', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEditAddon = (addon) => {
        setEditingAddonId(addon._id);
        setAddonForm({
            name: addon.name,
            price: addon.price,
            order: addon.order || 0
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteAddon = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Add-on?',
            text: "Are you sure you want to delete this add-on option?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            const response = await api.delete(`/api/e-promotion-packages/addons/${id}`);
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
                fetchAllData();
            }
        } catch (error) {
            console.error('Error deleting addon:', error);
            Swal.fire('Error', 'Failed to delete add-on', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // REACH HANDLERS
    // ==========================================
    const handleReachSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.put('/api/e-promotion-packages/reach', reach);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Reach Metrics Saved!',
                    text: 'Live reach counters have been updated.',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchAllData();
            }
        } catch (error) {
            console.error('Error updating reach:', error);
            Swal.fire('Error', 'Failed to update reach metrics', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // TESTIMONIALS HANDLERS
    // ==========================================
    const handleTestimonialSubmit = async (e) => {
        e.preventDefault();
        if (!testimonialForm.text || !testimonialForm.name) {
            Swal.fire('Warning', 'Quote Text and Name are required', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (editingTestimonialId) {
                response = await api.put(`/api/e-promotion-packages/testimonials/${editingTestimonialId}`, testimonialForm);
            } else {
                response = await api.post('/api/e-promotion-packages/testimonials', testimonialForm);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: editingTestimonialId ? 'Testimonial Updated!' : 'Testimonial Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForms();
                fetchAllData();
            }
        } catch (error) {
            console.error('Error saving testimonial:', error);
            Swal.fire('Error', 'Failed to save testimonial', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEditTestimonial = (test) => {
        setEditingTestimonialId(test._id);
        setTestimonialForm({
            text: test.text,
            name: test.name,
            order: test.order || 0
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteTestimonial = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Testimonial?',
            text: "Are you sure you want to delete this customer testimonial?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            const response = await api.delete(`/api/e-promotion-packages/testimonials/${id}`);
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
                fetchAllData();
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            Swal.fire('Error', 'Failed to delete testimonial', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <PageHeader
                    title="E-PROMOTION WEB PAGE MANAGEMENT"
                    description="Dynamically manage packages, addons, reach counters, and customer testimonials"
                />
                <button
                    onClick={handleResetDefaults}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-[#d26019] hover:bg-orange-700 text-white font-bold px-4 py-2.5 shadow-md hover:shadow-lg transition-all rounded-[4px] uppercase text-xs"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Reset to Defaults
                </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-wrap border-b border-gray-200 mt-6 gap-2">
                {[
                    { id: 'packages', label: 'E-Promotion Packages', icon: Briefcase },
                    { id: 'addons', label: 'Add-on Options', icon: Sliders },
                    { id: 'reach', label: 'Reach & Impact', icon: Users },
                    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); resetForms(); }}
                        className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase border-b-2 transition-all ${activeTab === tab.id
                            ? 'border-[#23471d] text-[#23471d] bg-gray-50'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">

                {/* ========================================================
                    TAB: PACKAGES
                    ======================================================== */}
                {activeTab === 'packages' && (
                    <>
                        {/* Package Edit/Add Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                                    {editingPackageId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {editingPackageId ? 'Edit Package' : 'Create Custom Package'}
                                </h2>
                                <form onSubmit={handlePackageSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Package Title</label>
                                        <input
                                            type="text"
                                            value={packageForm.title}
                                            onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                            placeholder="e.g. STARTER VISIBILITY PACKAGE"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtitle / Tagline</label>
                                        <input
                                            type="text"
                                            value={packageForm.subtitle}
                                            onChange={(e) => setPackageForm({ ...packageForm, subtitle: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                            placeholder="e.g. Build your presence and get notice online"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (₹)</label>
                                            <input
                                                type="number"
                                                value={packageForm.price}
                                                onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                                placeholder="e.g. 12000"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">GST Label</label>
                                            <input
                                                type="text"
                                                value={packageForm.gstText}
                                                onChange={(e) => setPackageForm({ ...packageForm, gstText: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                                placeholder="+18% GST"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            Features List (One feature per line)
                                        </label>
                                        <textarea
                                            value={packageForm.featuresText}
                                            onChange={(e) => setPackageForm({ ...packageForm, featuresText: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-32 shadow-sm text-sm"
                                            placeholder="Featured Listing on Website&#10;Logo on Directory Page&#10;1 Social Media Post"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Badge Text</label>
                                            <input
                                                type="text"
                                                value={packageForm.badgeText}
                                                onChange={(e) => setPackageForm({ ...packageForm, badgeText: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                                placeholder="e.g. MOST POPULAR"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Button Action Text</label>
                                            <input
                                                type="text"
                                                value={packageForm.buttonText}
                                                onChange={(e) => setPackageForm({ ...packageForm, buttonText: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                                placeholder="e.g. CHOOSE STARTER"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Border Accent</label>
                                        <input
                                            type="text"
                                            value={packageForm.borderColor}
                                            onChange={(e) => setPackageForm({ ...packageForm, borderColor: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                            placeholder="e.g. #e8a415"
                                        />
                                    </div>

                                    <div className="bg-gray-50 p-4 border border-gray-200">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Select Header Image Style</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: '/images/9.png', label: 'Green Accents' },
                                                { value: '/images/10.png', label: 'Orange Accents' },
                                                { value: '/images/11.png', label: 'Grey Accents' },
                                                { value: '/images/epromotion.webp', label: 'Mega Banner' }
                                            ].map((img) => (
                                                <div
                                                    key={img.value}
                                                    onClick={() => setPackageForm({ ...packageForm, backgroundImage: img.value })}
                                                    className={`cursor-pointer border-2 p-2 rounded transition-all bg-white flex flex-col items-center justify-between relative ${
                                                        packageForm.backgroundImage === img.value
                                                            ? 'border-[#23471d] bg-green-50 shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <img
                                                        src={`${FRONTEND_URL}${img.value}`}
                                                        alt={img.label}
                                                        className="w-full h-12 object-cover rounded mb-1.5 border border-gray-100"
                                                        onError={(e) => {
                                                            e.target.src = img.value;
                                                        }}
                                                    />
                                                    <span className="text-[10px] font-bold text-gray-700 text-center">{img.label}</span>
                                                    {packageForm.backgroundImage === img.value && (
                                                        <div className="absolute top-1.5 right-1.5 bg-[#23471d] text-white rounded-full p-0.5 shadow-sm">
                                                            <Check className="w-2.5 h-2.5" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Display Order</label>
                                            <input
                                                type="number"
                                                value={packageForm.order}
                                                onChange={(e) => setPackageForm({ ...packageForm, order: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="isActive"
                                                checked={packageForm.isActive}
                                                onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })}
                                                className="w-4 h-4 accent-[#23471d] cursor-pointer"
                                            />
                                            <label htmlFor="isActive" className="text-xs font-bold text-gray-700 uppercase cursor-pointer">
                                                Active on Web
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 py-3 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-md uppercase text-xs"
                                        >
                                            {editingPackageId ? <><Edit className="w-4 h-4" /> Update Package</> : <><Plus className="w-4 h-4" /> Create Package</>}
                                        </button>
                                        {editingPackageId && (
                                            <button
                                                type="button"
                                                onClick={resetForms}
                                                className="px-4 py-3 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors uppercase text-xs"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Packages List Table */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border-2 border-gray-200 shadow-sm">
                                <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                                    <h2 className="text-white font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                        <Briefcase className="w-4 h-4" /> E-Promotion Packages
                                    </h2>
                                    <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                        {packages.length} Packages
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200 bg-gray-50">
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">TITLE & SUBTITLE</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">PRICE</th>
                                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase w-20">ORDER</th>
                                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase w-24">STATUS</th>
                                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase w-24">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {packages.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-12 text-gray-400 font-bold uppercase text-xs">
                                                        No E-Promotion Packages found. Click "Reset to Defaults" above to seed.
                                                    </td>
                                                </tr>
                                            ) : packages.map((pkg, idx) => (
                                                <tr key={pkg._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-gray-800 text-xs sm:text-sm">{pkg.title}</p>
                                                                {pkg.badgeText && (
                                                                    <span className="bg-[#e8a415] text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wide">
                                                                        {pkg.badgeText}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 font-medium leading-none mt-1">{pkg.subtitle}</span>
                                                            <span className="text-[9px] text-[#23471d] font-bold mt-1.5 uppercase">
                                                                {pkg.features?.length || 0} features configured
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="font-extrabold text-green-700 text-xs sm:text-sm">
                                                            ₹ {pkg.price.toLocaleString()}
                                                        </p>
                                                        <span className="text-[9px] text-gray-400 font-bold">{pkg.gstText}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold text-gray-600">{pkg.order}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        {pkg.isActive !== false ? (
                                                            <span className="bg-green-100 text-green-800 text-[9px] font-bold px-2 py-1 rounded-full uppercase flex items-center justify-center gap-1 w-20 mx-auto">
                                                                <Eye className="w-3 h-3" /> Live
                                                            </span>
                                                        ) : (
                                                            <span className="bg-gray-100 text-gray-800 text-[9px] font-bold px-2 py-1 rounded-full uppercase flex items-center justify-center gap-1 w-20 mx-auto">
                                                                <EyeOff className="w-3 h-3" /> Hidden
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => startEditPackage(pkg)}
                                                                className="text-blue-500 hover:text-blue-700 p-1.5 transition-colors border border-blue-200 hover:border-blue-500 rounded"
                                                                title="Edit Package"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePackage(pkg._id)}
                                                                className="text-red-500 hover:text-red-700 p-1.5 transition-colors border border-red-200 hover:border-red-500 rounded"
                                                                title="Delete Package"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ========================================================
                    TAB: ADDONS
                    ======================================================== */}
                {activeTab === 'addons' && (
                    <>
                        {/* Addon Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                                    {editingAddonId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {editingAddonId ? 'Edit Add-on Option' : 'Add New Add-on'}
                                </h2>
                                <form onSubmit={handleAddonSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Add-on Item Name</label>
                                        <input
                                            type="text"
                                            value={addonForm.name}
                                            onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                            placeholder="e.g. Homepage Banner Ad (7 Days)"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price Label</label>
                                        <input
                                            type="text"
                                            value={addonForm.price}
                                            onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                            placeholder="e.g. ₹ 15,000"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Display Order</label>
                                        <input
                                            type="number"
                                            value={addonForm.order}
                                            onChange={(e) => setAddonForm({ ...addonForm, order: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 py-3 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-md uppercase text-xs"
                                        >
                                            {editingAddonId ? <><Edit className="w-4 h-4" /> Update Add-on</> : <><Plus className="w-4 h-4" /> Create Add-on</>}
                                        </button>
                                        {editingAddonId && (
                                            <button
                                                type="button"
                                                onClick={resetForms}
                                                className="px-4 py-3 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors uppercase text-xs"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Addons List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border-2 border-gray-200 shadow-sm">
                                <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                                    <h2 className="text-white font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                        <Sliders className="w-4 h-4" /> Add-on Promotion Options
                                    </h2>
                                    <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                        {addons.length} Options
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200 bg-gray-50">
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">OPTION DESCRIPTION</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">PRICE</th>
                                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase w-20">ORDER</th>
                                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase w-24">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {addons.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-12 text-gray-400 font-bold uppercase text-xs">
                                                        No Add-on Options configured. Click "Reset to Defaults" to seed.
                                                    </td>
                                                </tr>
                                            ) : addons.map((addon, idx) => (
                                                <tr key={addon._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                                    <td className="py-3 px-4 font-bold text-gray-800 text-xs sm:text-sm">{addon.name}</td>
                                                    <td className="py-3 px-4 font-extrabold text-[#23471d] text-xs sm:text-sm">{addon.price}</td>
                                                    <td className="py-3 px-4 text-center font-bold text-gray-600">{addon.order}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => startEditAddon(addon)}
                                                                className="text-blue-500 hover:text-blue-700 p-1.5 transition-colors border border-blue-200 hover:border-blue-500 rounded"
                                                                title="Edit Addon"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAddon(addon._id)}
                                                                className="text-red-500 hover:text-red-700 p-1.5 transition-colors border border-red-200 hover:border-red-500 rounded"
                                                                title="Delete Addon"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ========================================================
                    TAB: REACH & IMPACT
                    ======================================================== */}
                {activeTab === 'reach' && (
                    <div className="col-span-3">
                        <div className="bg-white border-2 border-gray-200 shadow-sm">
                            <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                                <h2 className="text-white font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                    <Users className="w-4 h-4" /> Live Reach & Impact Counters
                                </h2>
                            </div>
                            <form onSubmit={handleReachSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Trade Visitors Counter</label>
                                        <input
                                            type="text"
                                            value={reach.tradeVisitors}
                                            onChange={(e) => setReach({ ...reach, tradeVisitors: e.target.value })}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-extrabold text-green-800"
                                            placeholder="e.g. 20,000+"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Exhibitors Counter</label>
                                        <input
                                            type="text"
                                            value={reach.exhibitors}
                                            onChange={(e) => setReach({ ...reach, exhibitors: e.target.value })}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-extrabold text-green-800"
                                            placeholder="e.g. 500+"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Countries Counter</label>
                                        <input
                                            type="text"
                                            value={reach.countries}
                                            onChange={(e) => setReach({ ...reach, countries: e.target.value })}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-extrabold text-green-800"
                                            placeholder="e.g. 25+"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Social Media Reach Counter</label>
                                        <input
                                            type="text"
                                            value={reach.socialMediaReach}
                                            onChange={(e) => setReach({ ...reach, socialMediaReach: e.target.value })}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-extrabold text-green-800"
                                            placeholder="e.g. 500,000+"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Email Reach Counter</label>
                                        <input
                                            type="text"
                                            value={reach.emailReach}
                                            onChange={(e) => setReach({ ...reach, emailReach: e.target.value })}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-extrabold text-green-800"
                                            placeholder="e.g. 100,000+"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full md:w-auto px-8 py-3 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-3 shadow-md uppercase text-xs"
                                    >
                                        <Save className="w-4 h-4" /> Save Live Reach & Impact Values
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================
                    TAB: TESTIMONIALS
                    ======================================================== */}
                {activeTab === 'testimonials' && (
                    <>
                        {/* Testimonial Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                                    {editingTestimonialId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {editingTestimonialId ? 'Edit Testimonial' : 'Add Testimonial'}
                                </h2>
                                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quote Description</label>
                                        <textarea
                                            value={testimonialForm.text}
                                            onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24 shadow-sm text-sm"
                                            placeholder="e.g. We generated quality leads even before the exhibition started..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Author Name / Role</label>
                                        <input
                                            type="text"
                                            value={testimonialForm.name}
                                            onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                            placeholder="e.g. Exhibitor, IHWE 2025"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Display Order</label>
                                        <input
                                            type="number"
                                            value={testimonialForm.order}
                                            onChange={(e) => setTestimonialForm({ ...testimonialForm, order: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 py-3 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-md uppercase text-xs"
                                        >
                                            {editingTestimonialId ? <><Edit className="w-4 h-4" /> Update Testimonial</> : <><Plus className="w-4 h-4" /> Create Testimonial</>}
                                        </button>
                                        {editingTestimonialId && (
                                            <button
                                                type="button"
                                                onClick={resetForms}
                                                className="px-4 py-3 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors uppercase text-xs"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Testimonials List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border-2 border-gray-200 shadow-sm">
                                <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                                    <h2 className="text-white font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                        <Award className="w-4 h-4" /> E-Promotion Testimonials
                                    </h2>
                                    <span className="bg-[#d26019] text-white text-xs font-black px-3 py-1 uppercase tracking-wider">
                                        {testimonials.length} Testimonials
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200 bg-gray-50">
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10">NO.</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">QUOTE</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">AUTHOR</th>
                                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase w-20">ORDER</th>
                                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase w-24">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {testimonials.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-12 text-gray-400 font-bold uppercase text-xs">
                                                        No Customer Testimonials found. Click "Reset to Defaults" to seed.
                                                    </td>
                                                </tr>
                                            ) : testimonials.map((test, idx) => (
                                                <tr key={test._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4 text-gray-500 font-bold">{idx + 1}</td>
                                                    <td className="py-3 px-4 text-xs text-gray-700 italic max-w-xs truncate">{test.text}</td>
                                                    <td className="py-3 px-4 font-bold text-gray-800 text-xs sm:text-sm">{test.name}</td>
                                                    <td className="py-3 px-4 text-center font-bold text-gray-600">{test.order}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => startEditTestimonial(test)}
                                                                className="text-blue-500 hover:text-blue-700 p-1.5 transition-colors border border-blue-200 hover:border-blue-500 rounded"
                                                                title="Edit Testimonial"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTestimonial(test._id)}
                                                                className="text-red-500 hover:text-red-700 p-1.5 transition-colors border border-red-200 hover:border-red-500 rounded"
                                                                title="Delete Testimonial"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default EPromotionWebManagement;
