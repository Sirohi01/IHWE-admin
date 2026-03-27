import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api, { SERVER_URL } from "../lib/api";
import {
    Type, Save, Plus, Trash2, Edit,
    Building2, MapPin, User, Phone, Mail,
    Star, Heart, Globe, Zap, Award, Package, Palette, Layout
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ICONS_LIST = [
    { name: 'Building2', icon: Building2 },
    { name: 'Star', icon: Star },
    { name: 'Heart', icon: Heart },
    { name: 'Globe', icon: Globe },
    { name: 'Zap', icon: Zap },
    { name: 'Award', icon: Award },
    { name: 'Package', icon: Package },
    { name: 'Palette', icon: Palette },
    { name: 'Layout', icon: Layout },
    { name: 'Users', icon: User },
    { name: 'Phone', icon: Phone },
    { name: 'Mail', icon: Mail },
    { name: 'MapPin', icon: MapPin },
];

const IconComponent = ({ name, ...props }) => {
    const found = ICONS_LIST.find(i => i.name === name);
    if (!found) return <Building2 {...props} />;
    const Comp = found.icon;
    return <Comp {...props} />;
};

const EMPTY_CARD = {
    company: '',
    address: '',
    contactPerson: '',
    tel: '',
    email: '',
    icon: 'Building2',
    buttonText: 'Inquire Now',
    buttonUrl: '#'
};

const StallVendorManage = () => {
    const [data, setData] = useState({
        subheading: 'Our Vendors',
        heading: 'Expand Your Brand with Professional Stall Excellence',
        highlightText: 'Stall Excellence',
        description: '',
        cards: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [cardForm, setCardForm] = useState({ ...EMPTY_CARD });
    const [isEditingCard, setIsEditingCard] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/stall-vendor');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeadingSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/stall-vendor/headings', {
                subheading: data.subheading,
                heading: data.heading,
                highlightText: data.highlightText,
                description: data.description
            });
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: 'Headings Saved!', timer: 1500, showConfirmButton: false });
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save headings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardSubmit = async () => {
        if (!cardForm.company) {
            Swal.fire('Warning', 'Company name is required', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let response;
            if (isEditingCard) {
                response = await api.put(`/api/stall-vendor/cards/${isEditingCard}`, cardForm);
            } else {
                response = await api.post('/api/stall-vendor/cards', cardForm);
            }
            if (response.data.success) {
                Swal.fire({ icon: 'success', title: isEditingCard ? 'Vendor Updated!' : 'Vendor Added!', timer: 1500, showConfirmButton: false });
                resetForm();
                fetchData();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to save vendor', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        const result = await Swal.fire({
            title: 'Delete Vendor?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });
        if (!result.isConfirmed) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/stall-vendor/cards/${cardId}`);
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to delete', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (card) => {
        setIsEditingCard(card._id);
        setCardForm({
            company: card.company,
            address: card.address || '',
            contactPerson: card.contactPerson || '',
            tel: card.tel || '',
            email: card.email || '',
            icon: card.icon || 'Building2',
            buttonText: card.buttonText || 'Inquire Now',
            buttonUrl: card.buttonUrl || '#'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditingCard(null);
        setCardForm({ ...EMPTY_CARD });
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="STALL DESIGNING VENDOR MANAGEMENT"
                description="Manage section headings and stall designing vendor list"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* LEFT: Headings + Vendor Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Section Headings */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#23471d]">
                            <Type className="w-5 h-5 text-[#d26019]" /> Section Headings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight font-inter">Subheading</label>
                                <input
                                    type="text"
                                    value={data.subheading}
                                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-inter"
                                    placeholder="e.g. Our Vendors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight font-inter">Main Title</label>
                                <input
                                    type="text"
                                    value={data.heading}
                                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm font-inter"
                                    placeholder="e.g. Expand Your Brand with Professional Stall Excellence"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight text-[#d26019] font-inter">Highlight Text (Orange)</label>
                                <input
                                    type="text"
                                    value={data.highlightText}
                                    onChange={(e) => setData({ ...data, highlightText: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-[#d26019] focus:border-[#23471d] outline-none shadow-sm font-inter"
                                    placeholder="Text to highlight in orange..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight font-inter">Short Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-24 shadow-sm font-inter"
                                    placeholder="Enter short description..."
                                />
                            </div>
                            <button
                                onClick={handleHeadingSave}
                                disabled={isLoading}
                                className="w-full py-2 bg-[#23471d] text-white font-bold hover:bg-[#1a3615] transition-colors flex items-center justify-center gap-2 font-inter"
                            >
                                <Save className="w-4 h-4" /> Save Headings
                            </button>
                        </div>
                    </div>

                    {/* Vendor Form */}
                    <div className="bg-white border-2 border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d26019]">
                            {isEditingCard ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditingCard ? 'Edit Vendor Details' : 'Add New Vendor'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Company Name</label>
                                <input
                                    type="text"
                                    value={cardForm.company}
                                    onChange={(e) => setCardForm({ ...cardForm, company: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                    placeholder="e.g. IHWE Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Address</label>
                                <textarea
                                    value={cardForm.address}
                                    onChange={(e) => setCardForm({ ...cardForm, address: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none h-20 shadow-sm text-sm font-inter"
                                    placeholder="e.g. P.O Box 9825, Dubai, UAE"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Contact Person</label>
                                    <input
                                        type="text"
                                        value={cardForm.contactPerson}
                                        onChange={(e) => setCardForm({ ...cardForm, contactPerson: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                        placeholder="Mr. Praveen Kumar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Phone Number</label>
                                    <input
                                        type="text"
                                        value={cardForm.tel}
                                        onChange={(e) => setCardForm({ ...cardForm, tel: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                        placeholder="+971 52 126 8613"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Email Address</label>
                                <input
                                    type="email"
                                    value={cardForm.email}
                                    onChange={(e) => setCardForm({ ...cardForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                    placeholder="info@ihwename.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Icon</label>
                                <div className="flex gap-2">
                                    <select
                                        value={cardForm.icon}
                                        onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })}
                                        className="flex-1 px-3 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                    >
                                        {ICONS_LIST.map(i => (
                                            <option key={i.name} value={i.name}>{i.name}</option>
                                        ))}
                                    </select>
                                    <div className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center shrink-0">
                                        <IconComponent name={cardForm.icon} className="w-5 h-5 text-[#23471d]" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Button Text</label>
                                    <input
                                        type="text"
                                        value={cardForm.buttonText}
                                        onChange={(e) => setCardForm({ ...cardForm, buttonText: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 font-inter">Button URL</label>
                                    <input
                                        type="text"
                                        value={cardForm.buttonUrl}
                                        onChange={(e) => setCardForm({ ...cardForm, buttonUrl: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#23471d] outline-none shadow-sm text-sm font-inter"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleCardSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-[#d26019] text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-inter uppercase tracking-wider text-xs"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        : isEditingCard ? <><Edit className="w-4 h-4" /> Update Vendor</> : <><Plus className="w-4 h-4" /> Add Vendor</>}
                                </button>
                                {isEditingCard && (
                                    <button onClick={resetForm} className="px-4 py-2.5 border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-xs uppercase tracking-wider font-inter">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Vendor List Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-gray-200 shadow-sm">
                        <div className="bg-[#23471d] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-white font-bold flex items-center gap-2 font-inter uppercase tracking-wide text-sm">
                                <Building2 className="w-4 h-4" /> Vendors List
                            </h2>
                            <span className="bg-[#d26019] text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                                {data.cards?.length || 0} VENDORS
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-10 font-inter">NO.</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase font-inter">COMPANY</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase font-inter">CONTACT INFO</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase font-inter">ICON</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase font-inter">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!data.cards?.length ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-gray-400 font-inter font-medium lowercase">
                                                No vendors found. Add your first vendor using the form okh!
                                            </td>
                                        </tr>
                                    ) : data.cards.map((card, idx) => (
                                        <tr key={card._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 text-gray-500 font-bold font-inter">{idx + 1}</td>
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-[#23471d] text-[13px] uppercase tracking-wide font-inter">{card.company}</p>
                                                <div className="flex items-start gap-1 mt-1">
                                                    <MapPin className="w-3 h-3 text-[#d26019] shrink-0 mt-0.5" />
                                                    <p className="text-[11px] text-gray-500 font-medium leading-tight font-inter">{card.address}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3 text-[#23471d] shrink-0" />
                                                        <span className="text-[11px] font-bold text-gray-700 uppercase font-inter">{card.contactPerson}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <span className="text-[11px] font-medium text-gray-600 font-inter">{card.tel}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <span className="text-[11px] font-medium text-gray-600 font-inter lowercase">{card.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                                                        <IconComponent name={card.icon} className="w-4 h-4 text-[#23471d]" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => startEdit(card)} className="text-blue-500 hover:text-blue-700 p-1.5 transition-colors border border-blue-100 rounded bg-blue-50" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteCard(card._id)} className="text-red-500 hover:text-red-700 p-1.5 transition-colors border border-red-100 rounded bg-red-50" title="Delete">
                                                        <Trash2 size={16} />
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
            </div>
        </div>
    );
};

export default StallVendorManage;
