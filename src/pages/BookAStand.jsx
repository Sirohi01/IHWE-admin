import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    Send, ChevronRight,
    ShieldCheck,
    CreditCard,
    Banknote,
    Lock,
    User,
    UserPlus,
    Mail,
    Phone,
    Hexagon,
    MapPin,
    Globe,
    Briefcase,
    Layout
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import Swal from 'sweetalert2';
import { useDispatch } from "react-redux";
import { createActivityLogThunk } from "../features/activityLog/activityLogSlice";

const BookAStand = () => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [availableStalls, setAvailableStalls] = useState([]);
    const [marketingStaff, setMarketingStaff] = useState([]);
    const [allRates, setAllRates] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const info = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
        if (info) setCurrentUser(JSON.parse(info));
    }, []);

    const [formData, setFormData] = useState({
        exhibitorName: '',
        typeOfBusiness: '',
        industrySector: '',
        website: '',
        address: '',
        country: '',
        state: '',
        city: '',
        pincode: '',
        landlineNo: '',
        gstNo: '',
        panNo: '',
        natureOfBusiness: '',
        fasciaName: '',
        contact1: { title: 'Mr.', firstName: '', lastName: '', email: '', designation: '', mobile: '', alternateNo: '' },
        contact2: { title: 'Mr.', firstName: '', lastName: '', email: '', designation: '', mobile: '', alternateNo: '' },
        participation: {
            eventId: '',
            stallNo: '',
            stallFor: '',
            stallSize: 0,
            stallType: 'Shell Space',
            currency: 'INR',
            rate: 0,
            amount: 0,
            gstPercent: 18,
            total: 0,
            dimension: ''
        },
        selectedSectors: [],
        referredBy: 'Direct Website',
        spokenWith: '',
        filledBy: 'Admin',
        status: 'pending',
        paymentMode: 'manual',
        paymentType: 'full',
        amountPaid: 0,
        balanceAmount: 0
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const eRes = await api.get('/api/events');
                const staffRes = await api.get('/api/public/employees');
                const ratesRes = await api.get('/api/stall-rates');
                const countryRes = await api.get('/api/crm-countries');
                const stateRes = await api.get('/api/crm-states');
                const cityRes = await api.get('/api/crm-cities');

                if (eRes.data.success && eRes.data.data.length > 0) {
                    setEvents(eRes.data.data);
                    setSelectedEventId(eRes.data.data[0]._id);
                    setFormData(prev => ({ ...prev, eventId: eRes.data.data[0]._id }));
                }
                if (staffRes.data.success) setMarketingStaff(staffRes.data.data);
                if (ratesRes.data.success) setAllRates(ratesRes.data.data);
                if (countryRes.data.data) setCountries(countryRes.data.data);
                else setCountries(countryRes.data);

                if (stateRes.data.data) setStates(stateRes.data.data);
                else setStates(stateRes.data);

                if (cityRes.data.data) setCities(cityRes.data.data);
                else setCities(cityRes.data);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            api.get(`/api/stalls?eventId=${selectedEventId}`).then(res => {
                if (res.data.success) {
                    setAvailableStalls(res.data.data.filter(s => s.status === 'available'));
                }
            });
        }
    }, [selectedEventId]);

    // Rate Fetching
    useEffect(() => {
        const updateRate = async () => {
            if (!selectedEventId || !formData.participation.stallType || !formData.participation.currency) return;
            try {
                const res = await api.get(`/api/stall-rates/find?eventId=${selectedEventId}&currency=${formData.participation.currency}&stallType=${formData.participation.stallType}`);
                if (res.data.success && res.data.data) {
                    setFormData(prev => ({
                        ...prev,
                        participation: { ...prev.participation, rate: res.data.data.ratePerSqm }
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        participation: { ...prev.participation, rate: 0 }
                    }));
                }
            } catch (e) {
                console.error(e);
                setFormData(prev => ({ ...prev, participation: { ...prev.participation, rate: 0 } }));
            }
        };
        updateRate();
    }, [selectedEventId, formData.participation.stallType, formData.participation.currency]);

    // Total Calculation
    useEffect(() => {
        const part = formData.participation;
        const stall = availableStalls.find(s => s._id === part.stallNo);
        const area = stall ? stall.area : 0;
        const rate = Number(part.rate) || 0;
        const inc = stall ? stall.incrementPercentage : 0;
        const disc = stall ? stall.discountPercentage : 0;

        const subtotal = (area * rate) + ((area * rate) * inc / 100) - ((area * rate) * disc / 100);
        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        setFormData(prev => ({
            ...prev,
            participation: { ...prev.participation, stallSize: area, amount: Math.round(subtotal), total: Math.round(total) }
        }));
    }, [formData.participation.stallNo, formData.participation.rate, availableStalls]);

    const filteredStates = useMemo(() => {
        if (!formData.country || !countries.length) return [];
        const selectedCountry = countries.find(c =>
            c.name && c.name.trim().toLowerCase() === formData.country.trim().toLowerCase()
        );
        if (!selectedCountry) return [];
        return states.filter(s =>
            s.countryCode != null && selectedCountry.countryCode != null &&
            String(s.countryCode) === String(selectedCountry.countryCode)
        );
    }, [formData.country, countries, states]);

    const filteredCities = useMemo(() => {
        if (!formData.state || !states.length) return [];
        const selectedState = states.find(s =>
            s.name && s.name.trim().toLowerCase() === formData.state.trim().toLowerCase()
        );
        if (!selectedState) return [];
        return cities.filter(c =>
            c.stateCode != null && selectedState.stateCode != null &&
            String(c.stateCode) === String(selectedState.stateCode)
        );
    }, [formData.state, states, cities]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const finalData = {
                ...formData,
                eventId: selectedEventId,
                filledBy: currentUser?.username || 'Admin',
                balanceAmount: formData.participation.total
            };
            if (response.data.success) {
                // Log the activity
                const adminName = currentUser?.user_fullname || currentUser?.username || "Admin";
                const userId = sessionStorage.getItem("user_id") || currentUser?._id;

                if (userId) {
                    dispatch(createActivityLogThunk({
                        user_id: userId,
                        message: `Exhibitor: Manual booking created for '${formData.exhibitorName}' in '${events.find(e => e._id === selectedEventId)?.name || 'N/A'}' (Stall: ${formData.participation.stallFor}) by ${adminName}`,
                        section: "Registration Section",
                        data: {
                            action: "ADD",
                            exhibitor: formData.exhibitorName,
                            event: events.find(e => e._id === selectedEventId)?.name,
                            stall: formData.participation.stallFor,
                            total: formData.participation.total
                        }
                    }));
                }

                Swal.fire({
                    icon: 'success',
                    title: 'REGISTRATION SUCCESSFUL',
                    text: 'Manual booking has been recorded and marked as PENDING!',
                    confirmButtonColor: '#23471d'
                });
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Submission failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectChange = (name, value) => {
        if (name === 'country') {
            setFormData(prev => ({ ...prev, country: value, state: '', city: '' }));
            return;
        }
        if (name === 'state') {
            setFormData(prev => ({ ...prev, state: value, city: '' }));
            return;
        }
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStallSelect = (stallId) => {
        const stall = availableStalls.find(s => s._id === stallId);
        if (stall) {
            setFormData(prev => ({
                ...prev,
                participation: {
                    ...prev.participation,
                    stallNo: stall._id,
                    stallFor: stall.stallNumber,
                    stallSize: stall.area,
                    stallType: stall.stallType || prev.participation.stallType,
                    dimension: `${stall.length}x${stall.width}m`
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                participation: { ...prev.participation, stallNo: '', stallFor: '', stallSize: 0, dimension: '' }
            }));
        }
    };

    const handleSectorToggle = (sector) => {
        setFormData(prev => {
            const current = [...prev.selectedSectors];
            const idx = current.indexOf(sector);
            if (idx > -1) current.splice(idx, 1);
            else current.push(sector);
            return { ...prev, selectedSectors: current };
        });
    };

    const inputClasses = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";
    const labelClasses = "text-[11px] font-bold text-slate-800 mb-1 block capitalize font-inter";
    const sectionHeaderClasses = "text-[16px] font-bold text-[#23471d] pb-1 border-b border-slate-100 mb-6 font-inter";

    return (
        <div className="bg-white shadow-md mt-6 p-6 min-h-screen font-inter animate-fadeIn">
            {/* ── HEADER AREA ── */}
            <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-100">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-500 uppercase tracking-tight leading-none">
                        MANUAL REGISTRATION
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Book A Stand Admin Panel
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                    <div className="px-3 py-1.5 text-[11px] font-black uppercase bg-slate-100 text-[#23471d] rounded-[2px] border border-slate-200">
                        {events.find(e => e._id === selectedEventId)?.name || 'NO EVENT SELECTED'}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-10">

                {/* ── SUB-HEADER ── */}
                <div className="bg-slate-50/50 border-x border-y border-slate-200 px-6 py-3 rounded-[2px]">
                    <h2 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">
                        Manual Exhibitor Booking
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-bold">
                        International Health & Wellness Expo 2026
                    </p>
                </div>

                {/* SECTION: EVENT & STALL SELECTION */}
                <div className="space-y-4 px-2">
                    <h3 className={sectionHeaderClasses}>Event & Stall Selection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Linked Exhibition Event *</label>
                            <select required value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className={inputClasses}>
                                <option value="">Select Event</option>
                                {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name} ({new Date(ev.startDate).getFullYear()})</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Stall Number *</label>
                            <select required value={formData.participation.stallNo} onChange={(e) => handleStallSelect(e.target.value)} className={inputClasses}>
                                <option value="">-- Choose Available Stall --</option>
                                {availableStalls.filter(s =>
                                    (typeof s.eventId === 'string' ? s.eventId === selectedEventId : s.eventId?._id === selectedEventId) ||
                                    (typeof s.event === 'string' ? s.event === selectedEventId : s.event?._id === selectedEventId)
                                ).map(s => (
                                    <option key={s._id} value={s._id}>
                                        {s.stallNumber} ({s.area} sqm - {s.plScheme})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* APPLICABLE RATES WIDGET */}
                    {selectedEventId && (
                        <div className="mt-6 p-4 bg-slate-50/50 border border-slate-200 rounded-[2px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Banknote size={12} className="text-[#23471d]" />
                                Live Market Rates
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {allRates.filter(r => (r.eventId?._id || r.eventId) === selectedEventId).map(rate => (
                                    <div key={rate._id} className="bg-white p-2 border border-slate-200 rounded-[2px] shadow-sm">
                                        <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{rate.stallType}</p>
                                        <p className="text-[11px] font-black text-[#d26019]">{rate.currency} {rate.ratePerSqm.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION: COMPANY INFORMATION */}
                <div className="space-y-4 px-2">
                    <h3 className={sectionHeaderClasses}>Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div>
                            <label className={labelClasses}>Exhibitor Name *</label>
                            <input required type="text" value={formData.exhibitorName} onChange={(e) => handleSelectChange('exhibitorName', e.target.value)} className={inputClasses} placeholder="Brand Name" />
                        </div>
                        <div>
                            <label className={labelClasses}>Business Type</label>
                            <select value={formData.typeOfBusiness} onChange={(e) => handleSelectChange('typeOfBusiness', e.target.value)} className={inputClasses}>
                                <option value="">Select Option</option>
                                <option value="Manufacturer">Manufacturer</option>
                                <option value="Distributor">Distributor</option>
                                <option value="Exporter">Exporter</option>
                                <option value="Service Provider">Service Provider</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Industry Sector</label>
                            <input type="text" value={formData.industrySector} onChange={(e) => handleSelectChange('industrySector', e.target.value)} className={inputClasses} placeholder="Sector" />
                        </div>
                        <div>
                            <label className={labelClasses}>Company Website</label>
                            <input type="text" value={formData.website} onChange={(e) => handleSelectChange('website', e.target.value)} className={inputClasses} placeholder="www.example.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Full Address *</label>
                            <input required type="text" value={formData.address} onChange={(e) => handleSelectChange('address', e.target.value)} className={inputClasses} placeholder="Office Address" />
                        </div>
                        <div>
                            <label className={labelClasses}>Country *</label>
                            <select required value={formData.country} onChange={(e) => handleSelectChange('country', e.target.value)} className={inputClasses}>
                                <option value="">Select Country</option>
                                {countries.map((c, i) => (
                                    <option key={i} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>State *</label>
                            <select required value={formData.state} onChange={(e) => handleSelectChange('state', e.target.value)} disabled={!formData.country} className={inputClasses}>
                                <option value="">Select State</option>
                                {filteredStates.map((s, i) => (
                                    <option key={i} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div>
                            <label className={labelClasses}>City *</label>
                            <select required value={formData.city} onChange={(e) => handleSelectChange('city', e.target.value)} disabled={!formData.state} className={inputClasses}>
                                <option value="">Select City</option>
                                {filteredCities.map((ct, i) => (
                                    <option key={i} value={ct.name}>{ct.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Pincode</label>
                            <input type="text" value={formData.pincode} onChange={(e) => handleSelectChange('pincode', e.target.value)} className={inputClasses} placeholder="Pincode" />
                        </div>
                        <div>
                            <label className={labelClasses}>Fascia Name (On Stall)</label>
                            <input type="text" value={formData.fasciaName} onChange={(e) => handleSelectChange('fasciaName', e.target.value)} className={inputClasses} placeholder="Branding Name" />
                        </div>
                        <div>
                            <label className={labelClasses}>Nature of Business</label>
                            <input type="text" value={formData.natureOfBusiness} onChange={(e) => handleSelectChange('natureOfBusiness', e.target.value)} className={inputClasses} placeholder="Business Nature" />
                        </div>
                    </div>
                </div>

                {/* SECTION: FINANCIALS & CALCULATION */}
                <div className="space-y-4 px-2">
                    <h3 className={sectionHeaderClasses}>Financials & Participation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div>
                            <label className={labelClasses}>Stall Selection Type</label>
                            <select value={formData.participation.stallType} onChange={(e) => handleSelectChange('participation.stallType', e.target.value)} className={inputClasses}>
                                <option value="Shell Space">Shell Space</option>
                                <option value="Raw Space">Raw Space</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Currency</label>
                            <select value={formData.participation.currency} onChange={(e) => handleSelectChange('participation.currency', e.target.value)} className={inputClasses}>
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Base Rate (/sqm)</label>
                            <input readOnly type="text" value={formData.participation.rate} className={`${inputClasses} bg-slate-50 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label className={labelClasses}>Total Calculated Area</label>
                            <p className="h-8 flex items-center font-black text-[#23471d] text-[13px] border-b border-slate-200">
                                {formData.participation.stallSize} SQ METER
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2px] p-6 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                            <CreditCard size={100} />
                        </div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Base Amount</p>
                                <p className="text-sm font-bold">{formData.participation.currency} {Math.round(formData.participation.amount / 1.18)}</p>
                            </div>
                            <div className="space-y-1 border-l border-white/10 pl-4">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">GST (18%)</p>
                                <p className="text-sm font-bold">{formData.participation.currency} {Math.round(formData.participation.total - (formData.participation.amount / 1.18))}</p>
                            </div>
                            <div className="space-y-1 border-l border-white/10 pl-4 md:col-span-1 lg:col-span-3">
                                <p className="text-[10px] font-black text-slate-100 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    Contract Total Summary
                                </p>
                                <p className="text-2xl font-black text-green-400 tracking-tighter">
                                    {formData.participation.currency} {formData.participation.total?.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION: CONTACT PERSONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
                    <div className="space-y-4">
                        <h3 className={sectionHeaderClasses}>Primary Contact Person</h3>
                        <div className="bg-slate-50/40 p-6 border border-slate-200 rounded-[2px] space-y-4">
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className={labelClasses}>Title</label>
                                    <select value={formData.contact1.title} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, title: e.target.value } }))} className={inputClasses}>
                                        <option value="Mr.">Mr.</option><option value="Ms.">Ms.</option><option value="Dr.">Dr.</option>
                                    </select>
                                </div>
                                <div className="col-span-3">
                                    <label className={labelClasses}>Full Name *</label>
                                    <input required type="text" value={`${formData.contact1.firstName} ${formData.contact1.lastName}`.trim()} onChange={(e) => {
                                        const names = e.target.value.split(" ");
                                        setFormData(p => ({ ...p, contact1: { ...p.contact1, firstName: names[0] || "", lastName: names.slice(1).join(" ") || "" } }));
                                    }} className={inputClasses} placeholder="First & Last Name" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Official Email *</label>
                                    <input required type="email" value={formData.contact1.email} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, email: e.target.value } }))} className={inputClasses} placeholder="email@company.com" />
                                </div>
                                <div>
                                    <label className={labelClasses}>Designation *</label>
                                    <input required type="text" value={formData.contact1.designation} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, designation: e.target.value } }))} className={inputClasses} placeholder="Designation" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Mobile Number *</label>
                                <input required type="text" maxLength={10} value={formData.contact1.mobile} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, mobile: e.target.value.replace(/\D/g, "") } }))} className={inputClasses} placeholder="Mobile No." />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className={sectionHeaderClasses}>Secondary Reference (Optional)</h3>
                        <div className="bg-white p-6 border border-slate-200 rounded-[2px] space-y-4 shadow-sm">
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className={labelClasses}>Title</label>
                                    <select value={formData.contact2.title} onChange={(e) => setFormData(p => ({ ...p, contact2: { ...p.contact2, title: e.target.value } }))} className={inputClasses}>
                                        <option value="Mr.">Mr.</option><option value="Ms.">Ms.</option><option value="Dr.">Dr.</option>
                                    </select>
                                </div>
                                <div className="col-span-3">
                                    <label className={labelClasses}>Full Name</label>
                                    <input type="text" value={`${formData.contact2.firstName} ${formData.contact2.lastName}`.trim()} onChange={(e) => {
                                        const names = e.target.value.split(" ");
                                        setFormData(p => ({ ...p, contact2: { ...p.contact2, firstName: names[0] || "", lastName: names.slice(1).join(" ") || "" } }));
                                    }} className={inputClasses} placeholder="First & Last Name" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Mobile</label>
                                    <input type="text" maxLength={10} value={formData.contact2.mobile} onChange={(e) => setFormData(p => ({ ...p, contact2: { ...p.contact2, mobile: e.target.value.replace(/\D/g, "") } }))} className={inputClasses} placeholder="Mobile No." />
                                </div>
                                <div>
                                    <label className={labelClasses}>Email</label>
                                    <input type="email" value={formData.contact2.email} onChange={(e) => setFormData(p => ({ ...p, contact2: { ...p.contact2, email: e.target.value } }))} className={inputClasses} placeholder="email2@company.com" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION: CRM ATTRIBUTION */}
                <div className="space-y-4 px-2 pb-16">
                    <h3 className={sectionHeaderClasses}>CRM Attribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className={labelClasses}>Marketing Attribution (Referred By)</label>
                            <select value={formData.referredBy} onChange={(e) => handleSelectChange('referredBy', e.target.value)} className={inputClasses}>
                                <option value="Direct Website">Direct Website</option>
                                <option value="Email Marketing">Email Marketing</option>
                                <option value="Social Media">Social Media</option>
                                {marketingStaff.map(staff => (
                                    <option key={staff._id} value={staff.username}>Staff: {staff.username}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Account Executive (Spoken With) *</label>
                            <select required value={formData.spokenWith} onChange={(e) => handleSelectChange('spokenWith', e.target.value)} className={inputClasses}>
                                <option value="">Select Staff</option>
                                {marketingStaff.map(staff => (
                                    <option key={staff._id} value={staff.username}>{staff.username} ({staff.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS ── STICKY VIBE */}
                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center mt-12 bg-white pb-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 sm:mb-0">
                        <ShieldCheck size={14} className="text-[#23471d]" />
                        SECURE ADMIN MANUAL BOOKING
                    </p>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="px-10 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all rounded-[2px]"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-12 py-2.5 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-3 group"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    PROCEED REGISTRATION
                                    <ChevronRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BookAStand;
