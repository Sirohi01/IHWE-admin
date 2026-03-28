import { useState, useEffect } from 'react';
import {
    Upload,
    Mail,
    Phone,
    MapPin,
    Plus,
    Trash2,
    X,
    Edit2,
    Globe,
    Save,
    Settings as SettingsIcon,
    Image as ImageIcon,
    ArrowUp,
    Contact,
    Type,
    Calendar,
    MessageSquare,
    CreditCard,
    Banknote
} from 'lucide-react';
import api, { API_URL, SERVER_URL } from "../lib/api";
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';

const Settings = () => {
    // Logo state
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    // Topbar state
    const [marqueeText, setMarqueeText] = useState("• 150+ Speakers confirmed • Early Bird discount ending soon! • Join 8,000+ Professionals from 25+ Countries");
    const [topbarDate, setTopbarDate] = useState("15–17 October 2026");
    const [supportDeskText, setSupportDeskText] = useState("For exhibitors and delegates traveling from abroad, our international support team is available 24/7 during the expo period for visa, travel, and logistics assistance.");


    // Email addresses state
    const [emails, setEmails] = useState([
        { id: 1, email: 'info@tilesdesignhouse.com', isEditing: false, forTopbar: true, forContact: true }
    ]);
    const [newEmail, setNewEmail] = useState('');

    // Phone numbers state
    const [phones, setPhones] = useState([
        { id: 1, phone: '+91 98765 43210', isEditing: false, forTopbar: true, forContact: true }
    ]);
    const [newPhone, setNewPhone] = useState('');

    // Map Iframe state
    const [mapIframe, setMapIframe] = useState('');

    // Company addresses state
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            title: 'Head Office',
            street: '12/29, Site-II, Loni Road, Industrial Area, Mohan Nagar',
            city: 'Ghaziabad',
            state: 'Uttar Pradesh',
            zipCode: '201007',
            country: 'India',
            isEditing: false
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/settings');
            if (res.data.success && res.data.data) {
                const { logo, emails, phones, addresses, mapIframe: savedIframe, marqueeText: savedMarquee, topbarDate: savedDate, supportDeskText: savedSupportDeskText } = res.data.data;

                if (logo) {
                    setLogoPreview(`${SERVER_URL}${logo}`);
                }
                if (savedIframe) {
                    setMapIframe(savedIframe);
                }
                if (savedMarquee) {
                    setMarqueeText(savedMarquee);
                }
                if (savedDate) {
                    setTopbarDate(savedDate);
                }
                if (savedSupportDeskText) {
                    setSupportDeskText(savedSupportDeskText);
                }


                if (emails && emails.length > 0) {
                    setEmails(emails.map((e, index) => ({ ...e, id: Date.now() + index, isEditing: false })));
                }
                if (phones && phones.length > 0) {
                    setPhones(phones.map((p, index) => ({ ...p, id: Date.now() + index, isEditing: false })));
                }
                if (addresses && addresses.length > 0) {
                    setAddresses(addresses.map((a, index) => ({ ...a, id: Date.now() + index, isEditing: false })));
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSystemSettings = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();

            if (logo) {
                formData.append('logo', logo);
            }

            const emailsToSave = emails.map(({ id, isEditing, ...rest }) => rest);
            const phonesToSave = phones.map(({ id, isEditing, ...rest }) => rest);
            const addressesToSave = addresses.map(({ id, isEditing, ...rest }) => rest);

            formData.append('emails', JSON.stringify(emailsToSave));
            formData.append('phones', JSON.stringify(phonesToSave));
            formData.append('addresses', JSON.stringify(addressesToSave));
            formData.append('mapIframe', mapIframe);
            formData.append('marqueeText', marqueeText);
            formData.append('topbarDate', topbarDate);
            formData.append('supportDeskText', supportDeskText);


            const res = await api.put('/api/settings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Configuration Saved',
                    text: 'System settings have been updated successfully.',
                    confirmButtonColor: '#23471d'
                });

                if (res.data.data.logo) {
                    setLogoPreview(`${SERVER_URL}${res.data.data.logo}`);
                    setLogo(null);
                }
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save configuration. Please try again.',
                confirmButtonColor: '#23471d'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addEmail = () => {
        if (newEmail && !emails.some(e => e.email === newEmail)) {
            const newEmailObj = {
                id: Date.now(),
                email: newEmail,
                isEditing: false,
                forTopbar: emails.length === 0,
                forContact: emails.length === 0
            };
            setEmails([...emails, newEmailObj]);
            setNewEmail('');
        }
    };

    const startEditingEmail = (id) => {
        setEmails(emails.map(email =>
            email.id === id ? { ...email, isEditing: true } : email
        ));
    };

    const saveEmail = (id, newValue) => {
        if (newValue.trim()) {
            setEmails(emails.map(email =>
                email.id === id ? { ...email, email: newValue, isEditing: false } : email
            ));
        }
    };

    const removeEmail = (id) => {
        if (emails.length > 1) {
            setEmails(emails.filter(email => email.id !== id));
        }
    };

    const setTopbarEmail = (id) => {
        setEmails(emails.map(email =>
            email.id === id ? { ...email, forTopbar: !email.forTopbar } : email
        ));
    };

    const setContactEmail = (id) => {
        setEmails(emails.map(email =>
            email.id === id ? { ...email, forContact: !email.forContact } : email
        ));
    };

    const addPhone = () => {
        if (newPhone && !phones.some(p => p.phone === newPhone)) {
            const newPhoneObj = {
                id: Date.now(),
                phone: newPhone,
                isEditing: false,
                forTopbar: phones.length === 0,
                forContact: phones.length === 0
            };
            setPhones([...phones, newPhoneObj]);
            setNewPhone('');
        }
    };

    const startEditingPhone = (id) => {
        setPhones(phones.map(phone =>
            phone.id === id ? { ...phone, isEditing: true } : phone
        ));
    };

    const savePhone = (id, newValue) => {
        if (newValue.trim()) {
            setPhones(phones.map(phone =>
                phone.id === id ? { ...phone, phone: newValue, isEditing: false } : phone
            ));
        }
    };

    const removePhone = (id) => {
        if (phones.length > 1) {
            setPhones(phones.filter(phone => phone.id !== id));
        }
    };

    const setTopbarPhone = (id) => {
        setPhones(phones.map(phone => 
            phone.id === id ? { ...phone, forTopbar: !phone.forTopbar } : phone
        ));
    };

    const setContactPhone = (id) => {
        setPhones(phones.map(phone => 
            phone.id === id ? { ...phone, forContact: !phone.forContact } : phone
        ));
    };

    const addNewAddress = () => {
        const newAddress = {
            id: Date.now(),
            title: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            isEditing: true
        };
        setAddresses([newAddress, ...addresses]);
    };

    const startEditingAddress = (id) => {
        setAddresses(addresses.map(address =>
            address.id === id ? { ...address, isEditing: true } : address
        ));
    };

    const saveAddressField = (id, field, value) => {
        setAddresses(addresses.map(address =>
            address.id === id ? { ...address, [field]: value } : address
        ));
    };

    const saveAllAddressEdits = (id) => {
        const address = addresses.find(a => a.id === id);
        if (address.street && address.city && address.country && address.title) {
            setAddresses(addresses.map(address =>
                address.id === id ? { ...address, isEditing: false } : address
            ));
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in Title, Street, City and Country.',
                confirmButtonColor: '#23471d'
            })
        }
    };

    const cancelAddressEdit = (id) => {
        const address = addresses.find(a => a.id === id);
        if (!address.street && !address.city && !address.country) {
            setAddresses(addresses.filter(a => a.id !== id));
        } else {
            setAddresses(addresses.map(address =>
                address.id === id ? { ...address, isEditing: false } : address
            ));
        }
    };

    const removeAddress = (id) => {
        if (addresses.length > 0) {
            setAddresses(addresses.filter(address => address.id !== id));
        }
    };

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen">
            <PageHeader
                title="SYSTEM CONFIGURATION"
                description="Manage your exhibition's branding and contact information"
            >
                <button
                    onClick={saveSystemSettings}
                    disabled={isLoading}
                    className="py-2.5 px-6 bg-[#23471d] text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 uppercase text-xs tracking-wider disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? "Saving..." : "Save Configuration"}
                </button>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Branding & Topbar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Brand Identity */}
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded">
                                <SettingsIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">Brand Identity</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                                    Website Logo
                                </label>
                                <div className="border border-dashed border-gray-300 p-4 text-center relative group min-h-[160px] flex items-center justify-center bg-gray-50/30 rounded-lg hover:border-[#23471d] transition-colors overflow-hidden">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    {logoPreview ? (
                                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <div className="w-24 h-24 mb-2 p-2 border border-gray-100 bg-white rounded flex items-center justify-center">
                                                <img src={logoPreview.startsWith('http') || logoPreview.startsWith('data:') || logoPreview.startsWith('blob:') ? logoPreview : `${SERVER_URL}${logoPreview}`} alt="Preview" className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded pointer-events-none">
                                                <span className="text-xs font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm">Change Logo</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center py-4">
                                            <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Click to upload logo</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Topbar Settings */}
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-50 rounded">
                                <ArrowUp className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">Topbar & Interface Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                                    <Type className="w-3 h-3" /> Marquee Text
                                </label>
                                <textarea
                                    value={marqueeText}
                                    onChange={(e) => setMarqueeText(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-[#23471d] font-medium resize-none shadow-sm"
                                    placeholder="Enter marquee text here..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Event Date (Topbar)
                                </label>
                                <input
                                    type="text"
                                    value={topbarDate}
                                    onChange={(e) => setTopbarDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-[#23471d] font-medium shadow-sm"
                                    placeholder="e.g. 15–17 October 2026"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" /> Support Desk Text
                                </label>
                                <textarea
                                    value={supportDeskText}
                                    onChange={(e) => setSupportDeskText(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-[#23471d] font-medium resize-none shadow-sm"
                                    placeholder="Enter support desk text for contact page..."
                                />
                            </div>

                        </div>
                    </div>

                    {/* Google Map */}
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-50 rounded">
                                <Globe className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">Map Configuration</h2>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider tracking-widest">Google Map Embed (Iframe)</label>
                            <textarea
                                value={mapIframe}
                                onChange={(e) => setMapIframe(e.target.value)}
                                placeholder='<iframe src="..." ...></iframe>'
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-200 text-xs rounded focus:outline-none focus:border-[#23471d] font-mono resize-y"
                            />
                            {mapIframe && mapIframe.includes('<iframe') && (
                                <div className="border border-gray-200 rounded overflow-hidden">
                                    <div className="text-[10px] text-gray-400 px-3 py-1 bg-gray-50 border-b">Preview Map</div>
                                    <div className="map-preview-container" dangerouslySetInnerHTML={{ __html: mapIframe }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Middle/Right Column - Contact Channels */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-50 rounded">
                                <Mail className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 uppercase">Contact Channels</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Emails */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Addresses</label>
                                </div>
                                <div className="space-y-2">
                                    {emails.map(item => (
                                        <div key={item.id} className={`group flex items-center gap-2 p-2 border rounded transition-colors ${item.forTopbar || item.forContact ? 'border-green-500 bg-green-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setTopbarEmail(item.id)}
                                                    className={`p-1.5 rounded-full transition-colors ${item.forTopbar ? 'text-green-600 bg-green-100' : 'text-gray-300'}`}
                                                    title="Topbar Email"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setContactEmail(item.id)}
                                                    className={`p-1.5 rounded-full transition-colors ${item.forContact ? 'text-blue-600 bg-blue-100' : 'text-gray-300'}`}
                                                    title="Contact Page Email"
                                                >
                                                    <Contact className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            {item.isEditing ? (
                                                <input
                                                    autoFocus
                                                    type="email"
                                                    defaultValue={item.email}
                                                    onBlur={(e) => saveEmail(item.id, e.target.value)}
                                                    className="flex-1 bg-white px-2 py-1 text-xs border border-blue-300 rounded"
                                                />
                                            ) : (
                                                <span className="flex-1 text-sm text-gray-700 font-medium truncate">{item.email}</span>
                                            )}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditingEmail(item.id)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => removeEmail(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-2 pt-2">
                                        <input
                                            type="text"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            placeholder="Add email..."
                                            className="flex-1 px-3 py-1.5 border border-gray-200 text-xs rounded"
                                        />
                                        <button onClick={addEmail} className="p-1.5 bg-[#23471d] text-white rounded"><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Phones */}
                            <div className="space-y-4">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Numbers</label>
                                <div className="space-y-2">
                                    {phones.map(item => (
                                        <div key={item.id} className={`group flex items-center gap-2 p-2 border rounded transition-colors ${item.forTopbar || item.forContact ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setTopbarPhone(item.id)}
                                                    className={`p-1.5 rounded-full transition-colors ${item.forTopbar ? 'text-orange-600 bg-orange-100' : 'text-gray-300'}`}
                                                    title="Topbar Phone"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setContactPhone(item.id)}
                                                    className={`p-1.5 rounded-full transition-colors ${item.forContact ? 'text-blue-600 bg-blue-100' : 'text-gray-300'}`}
                                                    title="Contact Page Phone"
                                                >
                                                    <Contact className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            {item.isEditing ? (
                                                <input
                                                    autoFocus
                                                    type="tel"
                                                    defaultValue={item.phone}
                                                    onBlur={(e) => savePhone(item.id, e.target.value)}
                                                    className="flex-1 bg-white px-2 py-1 text-xs border border-blue-300 rounded"
                                                />
                                            ) : (
                                                <span className="flex-1 text-sm text-gray-700 font-medium truncate">{item.phone}</span>
                                            )}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditingPhone(item.id)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => removePhone(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-2 pt-2">
                                        <input
                                            type="text"
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                            placeholder="Add phone..."
                                            className="flex-1 px-3 py-1.5 border border-gray-200 text-xs rounded"
                                        />
                                        <button onClick={addPhone} className="p-1.5 bg-[#23471d] text-white rounded"><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Office Locations */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b bg-[#23471d] flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider">Office Locations</h2>
                            </div>
                            <button
                                onClick={addNewAddress}
                                className="px-4 py-1.5 bg-white text-[#23471d] font-semibold text-[10px] uppercase rounded flex items-center gap-2"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Location
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {addresses.map((address) => (
                                <div key={address.id} className={`relative border rounded-lg p-5 ${address.isEditing ? 'border-[#23471d] bg-gray-50' : 'border-gray-100'}`}>
                                    {address.isEditing ? (
                                        <div className="space-y-3">
                                            <input type="text" value={address.title} onChange={(e) => saveAddressField(address.id, 'title', e.target.value)} className="w-full p-2 border text-xs" placeholder="Title" />
                                            <input type="text" value={address.street} onChange={(e) => saveAddressField(address.id, 'street', e.target.value)} className="w-full p-2 border text-xs" placeholder="Street" />
                                            <div className="flex gap-2">
                                                <input type="text" value={address.city} onChange={(e) => saveAddressField(address.id, 'city', e.target.value)} className="flex-1 p-2 border text-xs" placeholder="City" />
                                                <input type="text" value={address.state} onChange={(e) => saveAddressField(address.id, 'state', e.target.value)} className="flex-1 p-2 border text-xs" placeholder="State" />
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" value={address.zipCode} onChange={(e) => saveAddressField(address.id, 'zipCode', e.target.value)} className="flex-1 p-2 border text-xs" placeholder="Zip Code" />
                                                <input type="text" value={address.country} onChange={(e) => saveAddressField(address.id, 'country', e.target.value)} className="flex-1 p-2 border text-xs" placeholder="Country" />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => saveAllAddressEdits(address.id)} className="flex-1 py-1.5 bg-[#23471d] text-white text-[10px] uppercase font-bold rounded">Save</button>
                                                <button onClick={() => cancelAddressEdit(address.id)} className="flex-1 py-1.5 bg-gray-200 text-gray-700 text-[10px] uppercase font-bold rounded">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between mb-2">
                                                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2"><MapPin className="w-3 h-3 text-[#23471d]" /> {address.title}</h3>
                                                <div className="flex gap-1">
                                                    <button onClick={() => startEditingAddress(address.id)} className="text-gray-400 hover:text-blue-600"><Edit2 className="w-3 h-3" /></button>
                                                    <button onClick={() => removeAddress(address.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">{address.street}, {address.city}, {address.state} {address.zipCode}, {address.country}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .map-preview-container iframe {
                    width: 100% !important;
                    height: 250px !important;
                    border: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default Settings;