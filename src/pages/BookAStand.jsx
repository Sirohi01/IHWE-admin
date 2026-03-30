import { useState, useEffect } from "react";
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

const BookAStand = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [availableStalls, setAvailableStalls] = useState([]);
    const [marketingStaff, setMarketingStaff] = useState([]);
    const [allRates, setAllRates] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

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
                
                if (eRes.data.success && eRes.data.data.length > 0) {
                    setEvents(eRes.data.data);
                    setSelectedEventId(eRes.data.data[0]._id);
                    setFormData(prev => ({ ...prev, eventId: eRes.data.data[0]._id }));
                }
                if (staffRes.data.success) setMarketingStaff(staffRes.data.data);
                if (ratesRes.data.success) setAllRates(ratesRes.data.data);
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
            const response = await api.post('/api/registrations', finalData);
            if (response.data.success) {
                Swal.fire('Success', 'Registration submitted and marked as PENDING!', 'success');
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Submission failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectChange = (name, value) => {
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

    const inputClasses = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#23471d]/20 focus:border-[#23471d] outline-none transition-all font-semibold text-slate-800 text-sm shadow-sm";
    const labelClasses = "text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block mb-1";

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-3xl font-black text-[#23471d] tracking-tight uppercase">
                            {events.find(e => e._id === selectedEventId)?.name || 'MANUAL BOOKING'}
                        </h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Add a new exhibitor registration from Admin Panel</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* EVENT & STALL SELECTION */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 flex flex-wrap gap-8 items-end">
                        <div className="flex-1 min-w-[300px]">
                            <label className={labelClasses}>Select Exhibition Event *</label>
                            <select value={selectedEventId} onChange={(e) => { setSelectedEventId(e.target.value); }} className={inputClasses}>
                                {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name} ({new Date(ev.startDate).getFullYear()})</option>)}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[300px]">
                            <label className={labelClasses}>Select Target Stall *</label>
                            <select value={formData.participation.stallNo} onChange={(e) => handleStallSelect(e.target.value)} className={inputClasses}>
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

                    {/* EVENT STALL RATES DISPLAY */}
                    {selectedEventId && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <h2 className="text-sm font-black text-[#23471d] mb-4 flex items-center gap-2">
                                <Banknote size={16} /> APPLICABLE STALL RATES
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {allRates.filter(r => (r.eventId?._id || r.eventId) === selectedEventId).length > 0 ? (
                                    allRates.filter(r => (r.eventId?._id || r.eventId) === selectedEventId).map(rate => (
                                        <div key={rate._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="text-[10px] font-black text-slate-500 uppercase mb-1">{rate.stallType}</div>
                                            <div className="text-lg font-black text-[#d26019]">{rate.currency} {rate.ratePerSqm.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">/ SQM</span></div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-4 text-xs text-slate-400 font-bold uppercase">No pre-configured rates found for this event.</div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: COMPANY DETAILS */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
                            <h2 className="text-lg font-black text-[#23471d] flex items-center gap-2 border-b pb-4">
                                <Briefcase size={20} /> COMPANY INFORMATION
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Exhibitor Name (Company) *</label>
                                    <input required type="text" value={formData.exhibitorName} onChange={(e) => handleSelectChange('exhibitorName', e.target.value)} className={inputClasses} placeholder="Enter full brand name" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Type of Business</label>
                                        <select value={formData.typeOfBusiness} onChange={(e) => handleSelectChange('typeOfBusiness', e.target.value)} className={inputClasses}>
                                            <option value="">Select...</option>
                                            <option value="Manufacturer">Manufacturer</option>
                                            <option value="Distributor">Distributor</option>
                                            <option value="Exporter">Exporter</option>
                                            <option value="Service Provider">Service Provider</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Industry Sector</label>
                                        <input type="text" value={formData.industrySector} onChange={(e) => handleSelectChange('industrySector', e.target.value)} className={inputClasses} placeholder="e.g. Pharma" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Company Website</label>
                                        <input type="text" value={formData.website} onChange={(e) => handleSelectChange('website', e.target.value)} className={inputClasses} placeholder="www.example.com" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Landline No.</label>
                                        <input type="text" value={formData.landlineNo} onChange={(e) => handleSelectChange('landlineNo', e.target.value)} className={inputClasses} placeholder="+91..." />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Full Address *</label>
                                    <textarea required rows={2} value={formData.address} onChange={(e) => handleSelectChange('address', e.target.value)} className={inputClasses} placeholder="Registered address..." />
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className={labelClasses}>Country</label>
                                        <input type="text" value={formData.country} onChange={(e) => handleSelectChange('country', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>State</label>
                                        <input type="text" value={formData.state} onChange={(e) => handleSelectChange('state', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>City</label>
                                        <input type="text" value={formData.city} onChange={(e) => handleSelectChange('city', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Pincode</label>
                                        <input type="text" value={formData.pincode} onChange={(e) => handleSelectChange('pincode', e.target.value)} className={inputClasses} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Fascia Name (For Stall)</label>
                                        <input type="text" value={formData.fasciaName} onChange={(e) => handleSelectChange('fasciaName', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Nature of Business</label>
                                        <input type="text" value={formData.natureOfBusiness} onChange={(e) => handleSelectChange('natureOfBusiness', e.target.value)} className={inputClasses} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>PAN Number</label>
                                        <input type="text" value={formData.panNo} onChange={(e) => handleSelectChange('panNo', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>GST Number</label>
                                        <input type="text" value={formData.gstNo} onChange={(e) => handleSelectChange('gstNo', e.target.value)} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: PARTICIPATION & SECTORS */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
                            <h2 className="text-lg font-black text-[#23471d] flex items-center gap-2 border-b pb-4">
                                <Layout size={20} /> STALL & RATE CALCULATION
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Stall Type</label>
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
                            </div>
                            
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span>STALL SIZE</span>
                                    <span className="text-slate-900 uppercase">{formData.participation.stallSize} SQM.</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span>UNIT RATE</span>
                                    <span className="text-slate-900 uppercase">{formData.participation.currency} {formData.participation.rate} / SQM</span>
                                </div>
                                <hr className="border-slate-200" />
                                {(() => {
                                    const stall = availableStalls.find(s => s._id === formData.participation.stallNo);
                                    const inc = stall ? stall.incrementPercentage : 0;
                                    const disc = stall ? stall.discountPercentage : 0;
                                    const baseValue = (stall ? stall.area : 0) * (Number(formData.participation.rate) || 0);
                                    const incValue = baseValue * (inc / 100);
                                    const discValue = baseValue * (disc / 100);

                                    return (
                                        <>
                                            <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                                <span>BASE AMOUNT</span>
                                                <span>{formData.participation.currency} {baseValue}</span>
                                            </div>
                                            {inc > 0 && (
                                                <div className="flex justify-between items-center text-sm font-bold text-red-500">
                                                    <span>INCREMENT ({inc}%)</span>
                                                    <span>+ {formData.participation.currency} {Math.round(incValue)}</span>
                                                </div>
                                            )}
                                            {disc > 0 && (
                                                <div className="flex justify-between items-center text-sm font-bold text-green-600">
                                                    <span>DISCOUNT ({disc}%)</span>
                                                    <span>- {formData.participation.currency} {Math.round(discValue)}</span>
                                                </div>
                                            )}
                                            <div className={`flex justify-between items-center text-sm font-black ${(inc > 0 || disc > 0) ? "text-[#d26019] pt-2 border-t" : "text-[#d26019]"}`}>
                                                <span>STALL SUBTOTAL</span>
                                                <span>{formData.participation.currency} {formData.participation.amount}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 mt-2">
                                    <span>GST (18%)</span>
                                    <span>{formData.participation.currency} {Math.round(formData.participation.amount * 0.18)}</span>
                                </div>
                                <div className="pt-2 flex justify-between items-center text-xl font-black text-[#23471d]">
                                    <span>TOTAL PAYABLE</span>
                                    <span>{formData.participation.currency} {formData.participation.total}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className={labelClasses}>Industry Sectors Selection</h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                    {["Medical Device", "Pharma & Drugs", "Ayurvedic & Herbal", "Fitness & Yoga", "Hospital & Clinics", "Diagnostics", "Nutrition & Wellness", "Technology", "Organic Products", "Beauty & Care", "Research & Education", "Other"].map(sector => (
                                        <label key={sector} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={formData.selectedSectors.includes(sector)} onChange={() => handleSectorToggle(sector)} className="w-4 h-4 rounded border-slate-300 text-[#23471d] focus:ring-[#23471d]/20" />
                                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-[#23471d] transition-colors uppercase">{sector}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="space-y-4">
                                    <h3 className={labelClasses}>Marketing Attribution (Referred By)</h3>
                                    <select value={formData.referredBy} onChange={(e) => handleSelectChange('referredBy', e.target.value)} className={inputClasses}>
                                        <option value="Direct Website">Direct Website</option>
                                        <option value="Email Marketing">Email Marketing</option>
                                        <option value="Social Media">Social Media</option>
                                        {marketingStaff.map(staff => (
                                            <option key={staff._id} value={staff.username}>Staff: {staff.username}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <h3 className={labelClasses}>Communication Source (Spoken With) *</h3>
                                    <select required value={formData.spokenWith} onChange={(e) => handleSelectChange('spokenWith', e.target.value)} className={inputClasses}>
                                        <option value="">-- Who Spoke With Them? --</option>
                                        {marketingStaff.map(staff => (
                                            <option key={staff._id} value={staff.username}>{staff.username} ({staff.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* CONTACT PERSON 1 */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                             <h2 className="text-lg font-black text-[#23471d] mb-6 flex items-center gap-2 border-b pb-4">
                                <User size={20} /> PRIMARY CONTACT PERSON
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Full Name *</label>
                                    <div className="flex gap-2">
                                        <select value={formData.contact1.title} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, title: e.target.value } }))} className="w-24 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm">
                                            <option value="Mr.">Mr.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Prof.">Prof.</option>
                                        </select>
                                        <input required type="text" value={formData.contact1.firstName} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, firstName: e.target.value } }))} className={inputClasses} placeholder="First Name" />
                                        <input required type="text" value={formData.contact1.lastName} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, lastName: e.target.value } }))} className={inputClasses} placeholder="Last Name" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Email Address *</label>
                                        <input required type="email" value={formData.contact1.email} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, email: e.target.value } }))} className={inputClasses} placeholder="email@company.com" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Designation *</label>
                                        <input required type="text" value={formData.contact1.designation} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, designation: e.target.value } }))} className={inputClasses} placeholder="e.g. Director" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Mobile Number *</label>
                                        <input required type="text" value={formData.contact1.mobile} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, mobile: e.target.value } }))} className={inputClasses} placeholder="9876543210" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Alternate No.</label>
                                        <input type="text" value={formData.contact1.alternateNo} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, alternateNo: e.target.value } }))} className={inputClasses} placeholder="Secondary no." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONTACT PERSON 2 */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                             <h2 className="text-lg font-black text-slate-400 mb-6 flex items-center gap-2 border-b pb-4">
                                <UserPlus size={20} /> SECONDARY CONTACT PERSON (OPTIONAL)
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Full Name</label>
                                    <div className="flex gap-2">
                                        <select value={formData.contact2.title} onChange={(e) => setFormData(p => ({ ...p, contact2: { ...p.contact2, title: e.target.value } }))} className="w-24 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm">
                                            <option value="Mr.">Mr.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Dr.">Dr.</option>
                                        </select>
                                        <input type="text" value={formData.contact2.firstName} onChange={(e) => setFormData(p => ({ ...p, contact2: { ...p.contact2, firstName: e.target.value } }))} className={inputClasses} placeholder="First Name" />
                                        <input type="text" value={formData.contact2.lastName} onChange={(e) => setFormData(p => ({ ...p, contact2: { ...p.contact2, lastName: e.target.value } }))} className={inputClasses} placeholder="Last Name" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Email Address</label>
                                        <input type="email" value={formData.contact2.email} onChange={(e) => setFormData(p => ({ ...p, contact2: { ...p.contact2, email: e.target.value } }))} className={inputClasses} placeholder="email2@company.com" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Designation</label>
                                        <input type="text" value={formData.contact2.designation} onChange={(e) => setFormData(p => ({ ...p, contact2: { ...p.contact2, designation: e.target.value } }))} className={inputClasses} placeholder="Designation" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Mobile Number</label>
                                    <input type="text" value={formData.contact2.mobile} onChange={(e) => setFormData(p => ({ ...p, contact2: { ...p.contact2, mobile: e.target.value } }))} className={inputClasses} placeholder="9876543210" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT */}
                    <button type="submit" disabled={isLoading} className="w-full py-5 bg-[#23471d] text-white rounded-[2rem] font-black text-xl hover:bg-[#1a3516] transition-all shadow-2xl shadow-[#23471d]/20 flex items-center justify-center gap-4 uppercase tracking-tighter active:scale-95 disabled:opacity-50">
                        {isLoading ? 'Processing Registration...' : (
                            <>
                                <span>Proceed to manual registration</span>
                                <ChevronRight size={24} />
                            </>
                        )}
                    </button>
                    <p className="text-center text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] pb-12">Authorized Admin Submission Protocol v2.5</p>
                </form>
            </div>
        </div>
    );
};

export default BookAStand;
