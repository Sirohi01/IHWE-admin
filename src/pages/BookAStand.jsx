import React, { useState, useEffect, useMemo } from "react";
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
    Layout,
    ChevronDown
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
    const [exhibitorType, setExhibitorType] = useState(null); // 'domestic' | 'international'
    const [settings, setSettings] = useState(null);

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
        primaryCategory: '',
        subCategory: '',
        referredBy: 'Direct Website',
        spokenWith: '',
        filledBy: 'Admin',
        status: 'pending',
        paymentMode: 'manual',
        paymentPlanType: 'full', paymentPlanLabel: 'Full Payment (100%)',
        chosenTdsPercent: 0,
        amountPaid: 0,
        balanceAmount: 0,
        financeBreakdown: {
            grossCost: 0,
            stallDiscount: { percentage: 0, amount: 0 },
            subtotal1: 0,
            fullPaymentDiscount: { percentage: 0, amount: 0 },
            subtotal2: 0,
            tdsDeduction: { percentage: 0, amount: 0 },
            gst: 0,
            totalAmount: 0,
            isFullPayment: false
        }
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [eRes, staffRes, ratesRes, countryRes, stateRes, cityRes, settingsRes] = await Promise.all([
                    api.get('/api/events'),
                    api.get('/api/public/employees'),
                    api.get('/api/stall-rates'),
                    api.get('/api/crm-countries'),
                    api.get('/api/crm-states'),
                    api.get('/api/crm-cities'),
                    api.get('/api/settings')
                ]);

                if (eRes.data.success && eRes.data.data.length > 0) {
                    setEvents(eRes.data.data);
                    setSelectedEventId(eRes.data.data[0]._id);
                    setFormData(prev => {
                        const selEv = eRes.data.data[0];
                        const plans = selEv?.paymentPlans || [];
                        const firstPlanId = plans.length > 0 ? plans[0].id : 'full';
                        const firstPlanLabel = plans.length > 0 ? plans[0].label : 'Full Payment';
                        return { ...prev, eventId: selEv._id, paymentPlanType: firstPlanId, paymentPlanLabel: firstPlanLabel };
                    });
                }
                if (staffRes.data.success) setMarketingStaff(staffRes.data.data);
                if (ratesRes.data.success) setAllRates(ratesRes.data.data);
                if (countryRes.data.data) setCountries(countryRes.data.data);
                if (stateRes.data.data) setStates(stateRes.data.data);
                if (cityRes.data.data) setCities(cityRes.data.data);
                if (settingsRes.data.success) setSettings(settingsRes.data.data);
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

        // 1. Gross cost before any discounts
        const baseCost = area * rate;
        const plIncrement = (baseCost * inc) / 100;
        const grossCost = baseCost + plIncrement;

        // 2. Stall specific discount
        const stallDiscountPct = stall ? (stall.discountPercentage || 0) : 0;
        const stallDiscountAmt = (grossCost * stallDiscountPct) / 100;
        const subtotal1 = grossCost - stallDiscountAmt;

        // 3. Organization-wide Full Payment Discount
        const currentEvent = events.find(e => e._id === selectedEventId);
        const plans = currentEvent?.paymentPlans || [];
        const selectedPlan = plans.find(p => p.id === formData.paymentPlanType);

        // A payment is "full" if the plan ID is 'full' OR if the percentage is 100
        const isFull = formData.paymentPlanType === 'full' || (selectedPlan && Number(selectedPlan.percentage) === 100);

        const fpDiscountPct = isFull ? (settings?.fullPaymentDiscount || 0) : 0;
        const fpDiscountAmt = Math.round(subtotal1 * fpDiscountPct / 100);
        const subtotal2 = subtotal1 - fpDiscountAmt;

        // 4. GST 18% on taxable value (subtotal2)
        const gstAmt = Math.round(subtotal2 * 0.18);

        // 5. Invoice total (subtotal2 + GST) — what seller invoices
        const invoiceTotal = subtotal2 + gstAmt;

        // 6. TDS on taxable value only (subtotal2), NOT on GST
        const tdsPct = formData.chosenTdsPercent || 0;
        const tdsAmt = Math.round(subtotal2 * tdsPct / 100);

        // 7. Net cash payable by buyer = invoiceTotal - TDS
        const netPayable = invoiceTotal - tdsAmt;

        // Installment calculation for Advance
        let amountToCollect = netPayable;
        if (selectedPlan && !isFull) {
            amountToCollect = Math.round(netPayable * (Number(selectedPlan.percentage) / 100));
        }

        setFormData(prev => ({
            ...prev,
            participation: {
                ...prev.participation,
                stallSize: area,
                amount: Math.round(subtotal2),   // taxable value (pre-GST)
                total: Math.round(invoiceTotal),  // subtotal2 + GST (invoice total, pre-TDS)
            },
            financeBreakdown: {
                grossAmount: Math.round(grossCost),
                stallDiscountPercent: stallDiscountPct,
                stallDiscountAmount: Math.round(stallDiscountAmt),
                subtotal1: Math.round(subtotal1),
                discountPercent: fpDiscountPct,
                discountAmount: Math.round(fpDiscountAmt),
                subtotal: Math.round(subtotal2),
                gstAmount: gstAmt,
                tdsPercent: tdsPct,
                tdsAmount: tdsAmt,
                netPayable: Math.round(netPayable),
                isFullPayment: isFull
            },
            amountPaid: Math.round(amountToCollect),
            balanceAmount: Math.round(netPayable - amountToCollect)
        }));
    }, [formData.participation.stallNo, formData.participation.rate, availableStalls, formData.paymentPlanType, formData.chosenTdsPercent, settings, events, selectedEventId]);

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
                status: 'pending',
                paymentMode: 'manual',
                amountPaid: 0,
                balanceAmount: formData.financeBreakdown?.netPayable || 0,
            };

            const response = await api.post('/api/exhibitor-registration', finalData);

            if (response.data.success) {
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
                    text: `Manual booking for ${formData.exhibitorName} has been recorded. Confirmation email & WhatsApp will be sent automatically.`,
                    confirmButtonColor: '#23471d'
                }).then(() => {
                    setExhibitorType(null);
                    setFormData({
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
                        primaryCategory: '',
                        subCategory: '',
                        referredBy: 'Direct Website',
                        spokenWith: '',
                        filledBy: 'Admin',
                        status: 'pending',
                        paymentMode: 'manual',
                        paymentPlanType: 'full', paymentPlanLabel: 'Full Payment (100%)',
                        chosenTdsPercent: 0,
                        amountPaid: 0,
                        balanceAmount: 0,
                        financeBreakdown: {
                            grossCost: 0,
                            stallDiscount: { percentage: 0, amount: 0 },
                            subtotal1: 0,
                            fullPaymentDiscount: { percentage: 0, amount: 0 },
                            subtotal2: 0,
                            tdsDeduction: { percentage: 0, amount: 0 },
                            gst: 0,
                            totalAmount: 0,
                            isFullPayment: false
                        }
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Submission failed. Please try again.', 'error');
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
                    stallScheme: stall.plScheme || 'One Side Open',
                    dimension: `${stall.length}x${stall.width}m`
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                participation: { ...prev.participation, stallNo: '', stallFor: '', stallSize: 0, dimension: '', stallScheme: '' }
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

    const handleExhibitorTypeChange = (type) => {
        setExhibitorType(type);
        setFormData(prev => ({
            ...prev,
            country: type === 'domestic' ? 'India' : '',
            state: '',
            city: '',
            participation: {
                ...prev.participation,
                currency: type === 'domestic' ? 'INR' : 'USD'
            }
        }));
    };

    const inputClasses = "rounded-[2px] border border-slate-400 h-8 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-900 font-medium shadow-none outline-none px-3 w-full text-left";
    const labelClasses = "text-[10px] font-bold uppercase tracking-[0.05em] text-slate-800 mb-1 block";
    const sectionHeaderClasses = "text-sm font-bold text-[#d26019] uppercase tracking-[0.05em] border-b border-slate-100 pb-1.5 mb-3";


    return (
        <div className="bg-white shadow-md mt-4 p-4 min-h-screen font-inter animate-fadeIn">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-center pb-3 border-b border-gray-100">
                <div>
                    <h1 className="text-xl font-medium text-slate-900 uppercase tracking-tight leading-none font-inter">MANUAL REGISTRATION</h1>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] mt-0.5">Book A Stand  Admin Panel</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                    <div className="px-3 py-1.5 text-[11px] font-black uppercase bg-slate-100 text-[#23471d] rounded border border-slate-200">
                        {events.find(e => e._id === selectedEventId)?.name || 'NO EVENT SELECTED'}
                    </div>
                    {exhibitorType && (
                        <button type="button" onClick={() => setExhibitorType(null)}
                            className="px-3 py-1.5 text-[11px] font-black uppercase bg-slate-800 text-white rounded border border-slate-700 hover:bg-slate-700 transition-all">
                            BACK
                        </button>
                    )}
                </div>
            </div>

            {/* EVENT SELECTOR */}
            {/* <div className="mt-3 flex flex-col md:flex-row gap-4 items-end bg-slate-50 border border-slate-200 rounded-[2px] px-4 py-3">
                <div className="w-full md:w-80">
                    <label className="text-[10px] font-bold text-[#23471d] uppercase mb-1 block tracking-widest">Select Exhibition Event *</label>
                    <select required value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className={inputClasses}>
                        <option value="">Choose Event</option>
                        {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name} ({new Date(ev.startDate).getFullYear()})</option>)}
                    </select>
                </div>
                <p className="text-[11px] text-slate-400 font-medium pb-1">Selecting an event updates pricing and stall availability below.</p>
            </div> */}

            {/* DOMESTIC / INTERNATIONAL SELECTION */}
            {!exhibitorType ? (
                <div className="mt-6 flex flex-col items-center justify-center text-center p-10 bg-white border border-dashed border-slate-300 rounded-[2px]">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 font-inter uppercase tracking-tight">Select Exhibitor Type</h3>
                    <p className="text-slate-400 text-[12px] mb-8 font-medium">Choose the exhibitor category to begin manual registration.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button type="button" onClick={() => handleExhibitorTypeChange('domestic')}
                            className="group px-10 py-2 bg-white border-2 border-[#23471d] text-[#23471d] rounded hover:bg-[#23471d] hover:text-white transition-all flex items-center gap-3 font-bold text-sm uppercase tracking-widest">
                            Domestic (India)
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button type="button" onClick={() => handleExhibitorTypeChange('international')}
                            className="group px-10 py-2  bg-white border-2 border-[#d26019] text-[#d26019] rounded hover:bg-[#d26019] hover:text-white transition-all flex items-center gap-3 font-bold text-sm uppercase tracking-widest">
                            International
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-5">

                    {/* SUB-HEADER */}
                    <div className="bg-slate-50/50 border border-slate-200 px-4 py-2 rounded-[2px] flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-medium text-slate-900 uppercase tracking-tight font-inter">Manual Exhibitor Booking</h2>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 font-medium">International Health & Wellness Expo</p>
                        </div>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-[2px] border ${exhibitorType === 'domestic' ? 'bg-green-50 text-[#23471d] border-green-200' : 'bg-orange-50 text-[#d26019] border-orange-200'}`}>
                            {exhibitorType === 'domestic' ? 'Domestic  INR' : 'International  USD'}
                        </span>
                    </div>

                    {/* SECTION: STALL SELECTION */}
                    <div className="space-y-3 px-2">
                        <h3 className={sectionHeaderClasses}>Stall Selection</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                                <label className={labelClasses}>Stall Number *</label>
                                <select required value={formData.participation.stallNo} onChange={(e) => handleStallSelect(e.target.value)} className={inputClasses}>
                                    <option value="">-- Choose Available Stall --</option>
                                    {availableStalls.filter(s =>
                                        (typeof s.eventId === 'string' ? s.eventId === selectedEventId : s.eventId?._id === selectedEventId) ||
                                        (typeof s.event === 'string' ? s.event === selectedEventId : s.event?._id === selectedEventId)
                                    ).map(s => (
                                        <option key={s._id} value={s._id}>{s.stallNumber} ({s.area} sqm � {s.plScheme})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Stall Type</label>
                                <select value={formData.participation.stallType} onChange={(e) => handleSelectChange('participation.stallType', e.target.value)} className={inputClasses}>
                                    <option value="Shell Space">Shell Space (Built-up)</option>
                                    <option value="Raw Space">Raw Space (Plot)</option>
                                </select>
                            </div>
                        </div>

                        {/* LIVE RATES */}
                        {selectedEventId && (() => {
                            const currency = exhibitorType === 'domestic' ? 'INR' : 'USD';
                            const filtered = allRates.filter(r => (r.eventId?._id || r.eventId) === selectedEventId && r.currency === currency);
                            return filtered.length > 0 && (
                                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-[2px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Banknote size={12} className="text-[#23471d]" />
                                        Live Market Rates
                                        <span className={`ml-1 px-2 py-0.5 text-[8px] font-black uppercase rounded-[2px]  ${exhibitorType === 'domestic' ? 'bg-green-50 text-[#23471d] border border-green-200' : 'bg-orange-50 text-[#d26019] border border-orange-200'}`}>
                                            {currency}
                                        </span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {filtered.map(rate => (
                                            <div key={rate._id} className="bg-white px-3 py-1.5 border border-slate-200 rounded-[2px] shadow-sm">
                                                <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5 ">{rate.stallType}</p>
                                                <p className="text-[11px] font-black text-[#d26019] font-semibold ">{rate.currency} {rate.ratePerSqm.toLocaleString()}/sqm</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* PAYMENT PLAN & TDS CONTROL */}
                        <div className="p-4 bg-[#f8fafc] border border-slate-200 rounded-[2px] mt-3 space-y-3">

                            {(() => {
                                const currentEvent = events.find(e => e._id === selectedEventId);
                                const plans = currentEvent?.paymentPlans || [];
                                const firstInstallPlan = plans.find(p => Number(p.percentage) < 100);
                                const fullPlan = plans.find(p => Number(p.percentage) === 100 || p.id === 'full');
                                return (
                                    <div>
                                        <label className={labelClasses}>Payment Plan *</label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {/* Full Payment option */}
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    paymentPlanType: fullPlan?.id || 'full',
                                                    paymentPlanLabel: fullPlan?.label || 'Full Payment'
                                                }))}
                                                className={`px-4 py-1.5 text-[11px] font-black uppercase rounded-[2px] border transition-all ${formData.paymentPlanType === 'full' || formData.paymentPlanType === fullPlan?.id
                                                    ? 'bg-[#23471d] text-white border-[#23471d]'
                                                    : 'bg-white text-slate-600 border-slate-300 hover:border-[#23471d]'
                                                    }`}
                                            >
                                                Full Payment {settings?.fullPaymentDiscount > 0 ? `(${settings.fullPaymentDiscount}% discount)` : ''}
                                            </button>
                                            {/* First Installment option only */}
                                            {firstInstallPlan ? (
                                                <button
                                                    key={firstInstallPlan.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        paymentPlanType: firstInstallPlan.id,
                                                        paymentPlanLabel: firstInstallPlan.label
                                                    }))}
                                                    className={`px-4 py-1.5 text-[11px] font-black uppercase rounded-[2px] border transition-all ${formData.paymentPlanType === firstInstallPlan.id
                                                        ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                                                        : 'bg-white text-slate-600 border-slate-300 hover:border-[#1a3a6b]'
                                                        }`}
                                                >
                                                    {firstInstallPlan.label} ({firstInstallPlan.percentage}%)
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentPlanType: 'advance', paymentPlanLabel: 'Advance Payment' }))}
                                                    className={`px-4 py-1.5 text-[11px] font-black uppercase rounded-[2px] border transition-all ${formData.paymentPlanType === 'advance'
                                                        ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                                                        : 'bg-white text-slate-600 border-slate-300 hover:border-[#1a3a6b]'
                                                        }`}
                                                >
                                                    Installment Payment
                                                </button>
                                            )}
                                        </div>
                                        {/* Show selected plan info */}
                                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                                            Selected: <span className="font-black text-slate-700">{formData.paymentPlanLabel}</span>
                                            {formData.financeBreakdown?.isFullPayment && settings?.fullPaymentDiscount > 0 && (
                                                <span className="ml-2 text-[#23471d] font-black">— {settings.fullPaymentDiscount}% discount applied</span>
                                            )}
                                        </p>
                                    </div>
                                );
                            })()}
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <label className={labelClasses}>Apply TDS Deduction *</label>
                                    <div className="w-48 relative mt-1">
                                        <select
                                            value={formData.chosenTdsPercent}
                                            onChange={(e) => setFormData(prev => ({ ...prev, chosenTdsPercent: Number(e.target.value) }))}
                                            className="w-full h-9 rounded-[2px] border border-slate-400 px-3 text-[12px] font-black text-red-600 bg-white focus:border-[#23471d] outline-none appearance-none"
                                        >
                                            <option value={0}>0% TDS</option>
                                            <option value={1}>1% TDS</option>
                                            <option value={2}>2% TDS</option>
                                            <option value={10}>10% TDS</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-3 text-red-600 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                        Total Payable (Net)
                                    </p>
                                    <p className="text-xl font-black text-[#23471d] leading-none">
                                        {formData.participation.currency} {formData.amountPaid?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* COST BREAKDOWN */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-[2px] flex flex-wrap gap-6 items-end">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stall</p>
                                <p className="text-sm font-bold text-slate-900">{formData.participation.stallFor || ''}</p>
                                <p className="text-[11px] text-slate-500">{formData.participation.stallType}  {formData.participation.stallSize} sqm</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Rate</p>
                                <p className="text-sm font-bold text-slate-900">{formData.participation.currency} {Number(formData.participation.rate).toLocaleString()}/sqm</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Amount</p>
                                <p className="text-sm font-bold text-slate-900">{formData.participation.currency} {Math.round(formData.participation.amount).toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST (18%)</p>
                                <p className="text-sm font-bold text-slate-900">{formData.participation.currency} {Math.round(formData.participation.total - formData.participation.amount).toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4 ml-auto">
                                <p className="text-[10px] font-black text-[#23471d] uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                                    Total Payable
                                </p>
                                <p className="text-2xl font-black text-[#23471d]">{formData.participation.currency === 'INR' ? `\u20b9${formData.participation.total?.toLocaleString()}` : `$${formData.participation.total?.toLocaleString()}`}</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: COMPANY INFORMATION */}
                    <div className="space-y-3 px-2">
                        <h3 className={sectionHeaderClasses}>Exhibitor Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                            <div>
                                <label className={labelClasses}>Company Name *</label>
                                <input required type="text" value={formData.exhibitorName} onChange={(e) => handleSelectChange('exhibitorName', e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            <div>
                                <label className={labelClasses}>Type of Business *</label>
                                <select required value={formData.typeOfBusiness} onChange={(e) => handleSelectChange('typeOfBusiness', e.target.value)} className={inputClasses}>
                                    <option value="">Select Here</option>
                                    <option>Private Ltd. Company</option>
                                    <option>Public Ltd. Company</option>
                                    <option>Partnership Company</option>
                                    <option>Limited Liability Partnership (LLP)</option>
                                    <option>One Person Company</option>
                                    <option>Sole Proprietorship</option>
                                    <option>Section 8 Company</option>
                                    <option>Others</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Industry / Sector *</label>
                                <select required value={formData.industrySector} onChange={(e) => handleSelectChange('industrySector', e.target.value)} className={inputClasses}>
                                    <option value="">Select Here</option>
                                    <option>Medical &amp; Healthcare</option>
                                    <option>AYUSH &amp; Traditional Medicine</option>
                                    <option>Wellness, Fitness &amp; Lifestyle</option>
                                    <option>Nutrition, Organic &amp; Health Foods</option>
                                    <option>Beauty, Personal Care &amp; Aesthetic Wellness</option>
                                    <option>Mental Health, Yoga &amp; Spiritual Wellness</option>
                                    <option>Medical Technology, Diagnostics &amp; Devices</option>
                                    <option>Institutions, Government Bodies &amp; Startups</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Website *</label>
                                <input required type="text" value={formData.website} onChange={(e) => handleSelectChange('website', e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Exhibitor Address *</label>
                                <input required type="text" value={formData.address} onChange={(e) => handleSelectChange('address', e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            <div>
                                <label className={labelClasses}>Country *</label>
                                {exhibitorType === 'domestic' ? (
                                    <input readOnly value="India" className={`${inputClasses} bg-slate-50 cursor-not-allowed`} />
                                ) : (
                                    <select required value={formData.country} onChange={(e) => handleSelectChange('country', e.target.value)} className={inputClasses}>
                                        <option value="">Select Here</option>
                                        {countries.filter(c => c.name.toLowerCase() !== 'india').map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className={labelClasses}>{exhibitorType === 'domestic' ? 'State *' : 'State / Province *'}</label>
                                <select required value={formData.state} onChange={(e) => handleSelectChange('state', e.target.value)} disabled={!formData.country} className={inputClasses}>
                                    <option value="">Select Here</option>
                                    {filteredStates.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                            <div>
                                <label className={labelClasses}>City *</label>
                                <select required value={formData.city} onChange={(e) => handleSelectChange('city', e.target.value)} disabled={!formData.state} className={inputClasses}>
                                    <option value="">Select Here</option>
                                    {filteredCities.map((ct, i) => <option key={i} value={ct.name}>{ct.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Pincode *</label>
                                <input required type="text" value={formData.pincode} onChange={(e) => handleSelectChange('pincode', e.target.value)} className={inputClasses} placeholder="Write Here.." inputMode="numeric" />
                            </div>
                            <div>
                                <label className={labelClasses}>Landline No.</label>
                                <input type="text" value={formData.landlineNo} onChange={(e) => handleSelectChange('landlineNo', e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            {/* <div>
                                <label className={labelClasses}>Nature of Business *</label>
                                <select required value={formData.natureOfBusiness} onChange={(e) => handleSelectChange('natureOfBusiness', e.target.value)} className={inputClasses}>
                                    <option value="">Select Here</option>
                                    <option>Agency</option><option>Aggregator</option><option>Association</option><option>College</option>
                                    <option>Dealer</option><option>Digital Media</option><option>Distributor</option><option>Electronic Media</option>
                                    <option>Government Body</option><option>Institution</option><option>Manufacturer</option><option>NGO</option>
                                    <option>Print Media</option><option>Raw material Supplier</option><option>Research Organisation</option>
                                    <option>Retailer</option><option>Service Provider</option><option>University</option><option>Others</option>
                                </select>
                            </div> */}
                        </div>
                    </div>

                    {/* SECTION: CONTACT PERSONS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-2">
                        <div className="space-y-2">
                            <h3 className={sectionHeaderClasses}>First Contact Person Details</h3>
                            <div className="bg-slate-50/40 p-4 border border-slate-200 rounded-[2px] space-y-3">
                                <div className="grid grid-cols-4 gap-3">
                                    <div>
                                        <label className={labelClasses}>Title *</label>
                                        <select value={formData.contact1.title} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, title: e.target.value } }))} className={inputClasses}>
                                            <option>Mr.</option><option>Ms.</option><option>Mrs.</option><option>Dr.</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>First Name *</label>
                                        <input required type="text" value={formData.contact1.firstName} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, firstName: e.target.value } }))} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelClasses}>Last Name *</label>
                                        <input required type="text" value={formData.contact1.lastName} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, lastName: e.target.value } }))} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClasses}>Email *</label>
                                        <input required type="email" value={formData.contact1.email} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, email: e.target.value } }))} className={inputClasses} placeholder="Official Email" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Designation *</label>
                                        <input required type="text" value={formData.contact1.designation} onChange={(e) => setFormData(p => ({ ...p, contact1: { ...p.contact1, designation: e.target.value } }))} className={inputClasses} placeholder="Write Here.." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClasses}>Mobile *</label>
                                        <input
                                            required
                                            type="text"
                                            inputMode={exhibitorType === 'domestic' ? 'numeric' : 'tel'}
                                            maxLength={exhibitorType === 'domestic' ? 10 : undefined}
                                            value={formData.contact1.mobile}
                                            onChange={(e) => {
                                                const val = exhibitorType === 'domestic' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
                                                setFormData(p => ({ ...p, contact1: { ...p.contact1, mobile: val } }));
                                            }}
                                            className={inputClasses}
                                            placeholder={exhibitorType === 'domestic' ? '10-digit number' : 'WhatsApp Number'}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Alternate No. *</label>
                                        <input
                                            required
                                            type="text"
                                            inputMode={exhibitorType === 'domestic' ? 'numeric' : 'tel'}
                                            maxLength={exhibitorType === 'domestic' ? 10 : undefined}
                                            value={formData.contact1.alternateNo}
                                            onChange={(e) => {
                                                const val = exhibitorType === 'domestic' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
                                                setFormData(p => ({ ...p, contact1: { ...p.contact1, alternateNo: val } }));
                                            }}
                                            className={inputClasses}
                                            placeholder={exhibitorType === 'domestic' ? '10-digit number' : 'Write Here..'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className={sectionHeaderClasses}>Exhibitor Category</h3>
                            <div className="bg-slate-50/40 p-4 border border-slate-200 rounded-[2px] space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                                    <div>
                                        <label className={labelClasses}>Primary Category *</label>
                                        <select required value={formData.primaryCategory} onChange={(e) => handleSelectChange('primaryCategory', e.target.value)} className={inputClasses}>
                                            <option value="">Select Primary Category</option>
                                            <option>Medical &amp; Healthcare</option>
                                            <option>AYUSH &amp; Traditional Medicine</option>
                                            <option>Wellness, Fitness &amp; Lifestyle</option>
                                            <option>Nutrition, Organic &amp; Health Foods</option>
                                            <option>Beauty, Personal Care &amp; Aesthetic Wellness</option>
                                            <option>Mental Health, Yoga &amp; Spiritual Wellness</option>
                                            <option>Medical Technology, Diagnostics &amp; Devices</option>
                                            <option>Institutions, Government Bodies &amp; Startups</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Sub-Category</label>
                                        <select value={formData.subCategory} onChange={(e) => handleSelectChange('subCategory', e.target.value)} disabled={!formData.primaryCategory} className={inputClasses}>
                                            <option value="">{formData.primaryCategory ? 'Select Sub-Category' : 'Select Primary Category first'}</option>
                                            {({
                                                'Medical & Healthcare': ['Hospitals & Clinics', 'Pharmaceuticals', 'Medical Services', 'Healthcare Consultants'],
                                                'AYUSH & Traditional Medicine': ['Ayurveda Products', 'Herbal Medicines', 'Panchakarma & Therapies', 'AYUSH Institutions'],
                                                'Wellness, Fitness & Lifestyle': ['Fitness Equipment', 'Wellness Centers', 'Lifestyle Products', 'Preventive Healthcare'],
                                                'Nutrition, Organic & Health Foods': ['Organic Food Products', 'Nutraceuticals', 'Supplements', 'Functional Foods'],
                                                'Beauty, Personal Care & Aesthetic Wellness': ['Skincare', 'Cosmetics', 'Herbal Beauty', 'Aesthetic Clinics'],
                                                'Mental Health, Yoga & Spiritual Wellness': ['Yoga Institutes', 'Meditation Services', 'Mental Health Solutions', 'Spiritual Organizations'],
                                                'Medical Technology, Diagnostics & Devices': ['Diagnostic Equipment', 'Medical Devices', 'Digital Health / HealthTech', 'AI & Software Solutions'],
                                                'Institutions, Government Bodies & Startups': ['Government Bodies', 'Research Institutes', 'Universities', 'Startups']
                                            }[formData.primaryCategory] || []).map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: CRM ATTRIBUTION */}
                    <div className="space-y-3 px-2">
                        <h3 className={sectionHeaderClasses}>CRM Attribution</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                                <label className={labelClasses}>Referral Channel *</label>
                                <select required value={formData.referredBy} onChange={(e) => handleSelectChange('referredBy', e.target.value)} className={inputClasses}>
                                    <option value="">How did you hear about us?</option>
                                    <option value="Direct Website">Direct Website</option>
                                    <option value="Email Marketing">Email Marketing</option>
                                    <option value="Social Media">Social Media</option>
                                    <option value="Search Engine">Search Engine</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Spoken With *</label>
                                <select required value={formData.spokenWith} onChange={(e) => handleSelectChange('spokenWith', e.target.value)} className={inputClasses}>
                                    <option value="">Select Staff Member</option>
                                    {marketingStaff.map(s => <option key={s._id} value={s.username}>{s.username}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* FINANCIAL SETTLEMENT BREAKDOWN */}
                    <div className="px-2">
                        <div className="bg-white border border-slate-200 rounded-[2px] p-5 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#23471d]"></div>

                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-[#23471d]" />
                                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Financial Settlement Breakdown</h3>
                                </div>
                                <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-slate-100 text-slate-500 rounded border border-slate-200 tracking-widest">Calculated Live</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                                {/* Gross Cost */}
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Booking Cost</p>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                        {formData.participation.currency} {formData.financeBreakdown.grossAmount?.toLocaleString()}
                                    </p>
                                </div>

                                {/* Discounts Combined */}
                                <div className="space-y-1 border-l-0 md:border-l border-slate-100 pl-0 md:pl-6">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                        Applied Savings
                                        <span className="text-[8px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-2">SAVED</span>
                                    </p>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-green-600">
                                            -{formData.participation.currency} {((formData.financeBreakdown.stallDiscountAmount || 0) + (formData.financeBreakdown.discountAmount || 0)).toLocaleString()}
                                        </p>
                                        <div className="flex gap-2">
                                            {formData.financeBreakdown.stallDiscountPercent > 0 && (
                                                <span className="text-[8px] font-bold text-slate-400 uppercase leading-none mt-1">
                                                    Stall Disc. {formData.financeBreakdown.stallDiscountPercent}%
                                                </span>
                                            )}
                                            {formData.financeBreakdown.discountPercent > 0 && (
                                                <span className="text-[8px] font-bold text-slate-400 uppercase leading-none mt-1">
                                                    FP Disc. {formData.financeBreakdown.discountPercent}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Taxes & Deductions */}
                                <div className="space-y-1 border-l-0 md:border-l border-slate-100 pl-0 md:pl-6">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Government Taxes & TDS</p>
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900">+{formData.participation.currency} {formData.financeBreakdown.gstAmount?.toLocaleString()}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">GST 18%</p>
                                        </div>
                                        {formData.financeBreakdown.tdsPercent > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black text-red-600">-{formData.participation.currency} {formData.financeBreakdown.tdsAmount?.toLocaleString()}</p>
                                                <p className="text-[8px] font-bold text-red-400 uppercase">TDS {formData.financeBreakdown.tdsPercent}%</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Net Payable */}
                                <div className="space-y-1 border-l-0 md:border-l border-slate-100 pl-0 md:pl-6 text-right">
                                    <p className="text-[9px] font-black text-[#23471d] uppercase tracking-[0.1em] mb-1">Net To Be Collected</p>
                                    <p className="text-3xl font-black text-[#23471d] leading-none mb-1">
                                        {formData.participation.currency} {formData.financeBreakdown.netPayable?.toLocaleString()}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">All Taxes Included</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOOKING SUMMARY */}
                    <div className="px-2 space-y-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-[2px] p-4 flex flex-wrap gap-6 items-end justify-between">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Status</p>
                                <p className="text-sm font-bold text-slate-900">
                                    {formData.financeBreakdown.isFullPayment ? 'Full Booking' : 'Advance Booking'}
                                </p>
                                <p className="text-[11px] text-slate-500">Plan: {formData.paymentPlanLabel}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Today</p>
                                <p className="text-sm font-bold text-[#23471d]">{formData.participation.currency} {formData.amountPaid?.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Later</p>
                                <p className="text-sm font-bold text-red-600">{formData.participation.currency} {formData.balanceAmount?.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4 ml-auto">
                                <p className="text-[10px] font-black text-[#23471d] uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                                    Net Total
                                </p>
                                <p className="text-2xl font-black text-[#23471d]">{formData.participation.currency} {formData.financeBreakdown.netPayable?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 px-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck size={14} className="text-[#23471d]" />
                            Secure Admin Manual Booking
                        </p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => window.location.reload()}
                                className="px-8 py-2 bg-slate-50 border border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all rounded-[2px]">
                                Reset
                            </button>
                            <button type="submit" disabled={isLoading}
                                className="px-10 py-2 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-[2px] shadow-lg flex items-center gap-2 group">
                                {isLoading
                                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    : <><span>Proceed Registration</span><ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" /></>
                                }
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default BookAStand;
