import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import headerBg from "../assets/exhi.jpg";
import arenaImg from "../assets/hall.jpg";
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
    const { id } = useParams();
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
        if (info) {
            const parsedUser = JSON.parse(info);
            setCurrentUser(parsedUser);
            setFormData(prev => ({ ...prev, spokenWith: parsedUser.fullName || parsedUser.username }));
        }
    }, []);

    const [formData, setFormData] = useState({
        clientId: '',
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
        aadhaarNo: '',
        aboutCompany: '',
        registrantType: 'registered',
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
            stallCategory: '',
            currency: 'INR',
            rate: 0,
            amount: 0,
            gstPercent: 18,
            total: 0,
            dimension: '',
            incrementPercentage: 0
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
            grossAmount: 0,
            stallDiscountPercent: 0,
            stallDiscountAmount: 0,
            subtotal1: 0,
            discountPercent: 0,
            discountAmount: 0,
            subtotal: 0,
            gstAmount: 0,
            tdsPercent: 0,
            tdsAmount: 0,
            netPayable: 0,
            isFullPayment: false
        }
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                api.get('/api/events').then(eRes => {
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
                }).catch(err => console.error("Error fetching events:", err));

                // Fetch stall rates independently
                api.get('/api/stall-rates').then(ratesRes => {
                    if (ratesRes.data.success) setAllRates(ratesRes.data.data);
                }).catch(err => console.error("Error fetching rates:", err));

                // Fetch other data in parallel
                Promise.all([
                    api.get('/api/public/employees'),
                    api.get('/api/crm-countries'),
                    api.get('/api/crm-states'),
                    api.get('/api/crm-cities'),
                    api.get('/api/settings')
                ]).then(([staffRes, countryRes, stateRes, cityRes, settingsRes]) => {
                    if (staffRes.data.success) setMarketingStaff(staffRes.data.data);
                    if (countryRes.data.data) setCountries(countryRes.data.data);
                    if (stateRes.data.data) setStates(stateRes.data.data);
                    if (cityRes.data.data) setCities(cityRes.data.data);
                    if (settingsRes.data.success) setSettings(settingsRes.data.data);
                }).catch(error => {
                    console.error("Error fetching background data:", error);
                });
            } catch (error) {
                console.error("Error in fetchInitialData:", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (id) {
            api.get(`/api/companies/${id}`).then(res => {
                if (res.data) {
                    const comp = res.data;
                    const cCountry = (comp.country || "India").toLowerCase();
                    const isDom = cCountry === "india";
                    setExhibitorType(isDom ? 'domestic' : 'international');

                    setFormData(prev => {
                        const newF = { ...prev };
                        newF.clientId = comp._id || '';
                        newF.exhibitorName = comp.companyName || '';
                        newF.website = comp.website || '';
                        newF.address = comp.address || '';
                        newF.country = comp.country || (isDom ? 'India' : '');
                        newF.state = comp.state || '';
                        newF.city = comp.city || '';
                        newF.pincode = comp.pincode || '';
                        newF.landlineNo = comp.landline || '';
                        newF.gstNo = comp.gstNumber || '';
                        newF.aboutCompany = comp.companyDescription || '';

                        if (comp.contacts && comp.contacts.length > 0) {
                            newF.contact1 = {
                                title: comp.contacts[0].title || 'Mr.',
                                firstName: comp.contacts[0].firstName || '',
                                lastName: comp.contacts[0].surname || '',
                                email: comp.contacts[0].email || '',
                                designation: comp.contacts[0].designation || '',
                                mobile: comp.contacts[0].mobile || '',
                                alternateNo: comp.contacts[0].alternate || ''
                            };
                        }
                        if (comp.contacts && comp.contacts.length > 1) {
                            newF.contact2 = {
                                title: comp.contacts[1].title || 'Mr.',
                                firstName: comp.contacts[1].firstName || '',
                                lastName: comp.contacts[1].surname || '',
                                email: comp.contacts[1].email || '',
                                designation: comp.contacts[1].designation || '',
                                mobile: comp.contacts[1].mobile || '',
                                alternateNo: comp.contacts[1].alternate || ''
                            };
                        }
                        // Default to INR for domestic, USD for international
                        newF.participation = {
                            ...newF.participation,
                            currency: isDom ? 'INR' : 'USD',
                            stallCategory: comp.exhibitorCategory || prev.participation.stallCategory
                        };
                        // CRM Attribution: Use forwardTo, else assigned to (added_by), else fallback
                        const targetUser = comp.forwardTo || comp.added_by;
                        let mappedName = targetUser;
                        if (targetUser && Array.isArray(marketingStaff)) {
                            const staff = marketingStaff.find(s => s.username === targetUser || s.fullName === targetUser);
                            if (staff && staff.fullName) mappedName = staff.fullName;
                        }
                        newF.spokenWith = mappedName || prev.spokenWith;

                        return newF;
                    });
                }
            }).catch(err => console.error("Error fetching client data:", err));
        }
    }, [id]);

    // Ensure spokenWith is mapped to fullName once marketingStaff is loaded
    useEffect(() => {
        if (marketingStaff.length > 0 && formData.spokenWith) {
            const staff = marketingStaff.find(s => s.username === formData.spokenWith);
            if (staff && staff.fullName && staff.fullName !== formData.spokenWith) {
                setFormData(prev => ({ ...prev, spokenWith: staff.fullName }));
            }
        }
    }, [marketingStaff, formData.spokenWith]);

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
                filledByFullName: currentUser?.fullName || currentUser?.username || 'Admin',
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
                        clientId: '',
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
                        aadhaarNo: '',
                        aboutCompany: '',
                        registrantType: 'registered',
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
                            grossAmount: 0,
                            stallDiscountPercent: 0,
                            stallDiscountAmount: 0,
                            subtotal1: 0,
                            discountPercent: 0,
                            discountAmount: 0,
                            subtotal: 0,
                            gstAmount: 0,
                            tdsPercent: 0,
                            tdsAmount: 0,
                            netPayable: 0,
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
                    stallScheme: stall.plScheme ? stall.plScheme.toUpperCase() : 'ONE SIDE OPEN',
                    dimension: `${stall.length}x${stall.width}m`,
                    incrementPercentage: stall.incrementPercentage || 0
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                participation: { ...prev.participation, stallNo: '', stallFor: '', stallSize: 0, dimension: '', stallScheme: '', incrementPercentage: 0 }
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

    const inputClasses = "rounded border border-slate-400 h-7 focus:border-[#23471d] focus:ring-[#23471d]/10 transition-all text-[12px] bg-white placeholder:text-slate-400 text-slate-800 font-medium shadow-none outline-none px-3 w-full text-left";
    const labelClasses = "block text-[10px] font-semibold capitalize tracking-wide text-slate-700 mb-1";
    const sectionHeaderClasses = "text-[13px] font-semibold text-[#1a4d1a] capitalize tracking-wide pb-1.5 mb-2.5 flex items-center gap-2";
    const cardClasses = "bg-white border border-slate-200 rounded-xl p-3.5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]";


    return (
        <div className="bg-[#f8fafc] shadow-md px-4 pt-4 pb-1 min-h-[calc(100vh-90px)] font-inter animate-fadeIn">
            {/* HEADER */}
            {!exhibitorType && (
                <div className="flex flex-col sm:flex-row justify-between items-center pb-3">
                    <div>
                        <h1 className="text-[22px] font-bold text-slate-900 capitalize tracking-tight leading-none font-inter">New Exhibitor Registration</h1>
                        <p className="text-xs text-slate-500 font-medium mt-1 max-w-3xl leading-relaxed">
                            Onboard new exhibitors seamlessly by capturing company information, <br />
                            selecting stall space, managing commercial details, and generating <br /> booking documents—all from a single workspace.
                        </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 mt-3 sm:mt-0 max-w-4xl">
                        <div className="px-3 py-2.5 text-[10.5px] text-slate-600 bg-blue-50/60 border border-blue-200/60 rounded-md leading-relaxed text-left shadow-sm">
                            <span className="font-bold text-blue-800 mb-0.5 block">NOTE : </span>
                            This option should be used when an exhibitor prefers not to register through the official website or requires assistance from the IHWE Sales Team. The sales representative can manually create the exhibitor profile, reserve stall space, generate quotations, issue invoices, and complete the registration process on behalf of the exhibitor.
                        </div>
                    </div>
                </div>
            )}

            {/* EVENT SELECTOR */}
            {/* <div className="mt-3 flex flex-col md:flex-row gap-4 items-end bg-slate-50 border border-slate-200 rounded-[2px] px-4 py-3">
                <div className="w-full md:w-80">
                    <label className="text-[10px] font-bold text-[#23471d] uppercase mb-1 block tracking-widest">Select Exhibition Event <span className="text-red-500">*</span></label>
                    <select required value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className={inputClasses}>
                        <option value="">Choose Event</option>
                        {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name} ({new Date(ev.startDate).getFullYear()})</option>)}
                    </select>
                </div>
                <p className="text-[11px] text-slate-400 font-medium pb-1">Selecting an event updates pricing and stall availability below.</p>
            </div> */}

            {/* DOMESTIC / INTERNATIONAL SELECTION */}
            {!exhibitorType ? (
                <div className="w-full mt-0 flex flex-col gap-1">
                    {/* -- HERO SECTION -- */}
                    <section
                        className="hero-background-registration relative overflow-hidden !aspect-auto md:!aspect-[4/1] !h-auto md:!h-auto py-6 md:py-0 rounded-xl"
                        style={{
                            backgroundImage: "url('/exhibition/bg.png')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'left',
                            backgroundRepeat: 'no-repeat',
                            fontFamily: "'Barlow', sans-serif",
                        }}
                    >
                        <div className="w-full">
                            <div className="w-full">
                                <div className="relative z-10 pt-6 md:pt-8 pb-1 md:pb-2 flex flex-col gap-2 w-full md:w-[60%] lg:w-[55%] bg-black/40 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none backdrop-blur-sm md:backdrop-blur-none px-4 md:px-8">

                                    {/* Register as a Buyer */}
                                    <div className="inline-block mt-4 px-4 py-1 bg-[#a8d060]/15 border border-[#a8d060]/40 rounded-lg text-[#a8d060] text-xs font-bold uppercase tracking-[0.2em] w-fit backdrop-blur-sm shadow-[0_0_20px_rgba(168,208,96,0.2)]">
                                        Exhibition stall booking
                                    </div>

                                    {/* Main Heading */}
                                    <div className="mt-1">
                                        <h1 className="text-3xl md:text-[38px] font-extrabold text-white leading-tight uppercase">
                                            Book Your <br />
                                            Exhibition <span className="text-[#a8d060]">Stand</span>
                                        </h1>
                                    </div>

                                    {/* Description */}
                                    <p className="text-white/80 text-[13px] md:text-sm leading-relaxed max-w-md mt-1">
                                        Showcase your innovations to 8,000+ healthcare Professionals-fill the form and get a customized stall for your brand.
                                    </p>

                                    {/* Stats Row */}
                                    {/* <div className="grid grid-cols-2 md:flex md:items-center mt-3 gap-y-4 gap-x-2 md:gap-3">
                                        {[
                                            {
                                                num: '', label: '8,000+\nHealthcare\nProfessionals',
                                                icon: <img src="/exhibition/b1.png" alt="" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                                            },
                                            {
                                                num: '', label: 'Custom\nStall\nSolutions',
                                                icon: <img src="/exhibition/b2.png" alt="" className="w-10 h-10 md:w-12 md:h-12 object-contain" />,
                                            },
                                            {
                                                num: '', label: 'Maximum\nBrand\nVisibility',
                                                icon: <img src="/exhibition/b3.png" alt="" className="w-10 h-10 md:w-12 md:h-12 object-contain" />,
                                            },
                                            {
                                                num: '', label: 'High-Value\nBusiness\nConnections',
                                                icon: <img src="/exhibition/b4.png" alt="" className="w-10 h-10 md:w-12 md:h-12 object-contain" />,
                                            },
                                        ].map((stat, i, arr) => (
                                            <div key={i} className="flex items-center md:contents">
                                                <div className="flex flex-col items-center text-center px-1 flex-1">
                                                    <div className="mb-1.5">{stat.icon}</div>
                                                    {stat.num && (
                                                        <div className="text-lg md:text-xl font-bold text-[#a8d060] leading-none tracking-tight">
                                                            {stat.num}
                                                        </div>
                                                    )}
                                                    <div className="text-[9px] md:text-[10px] font-semibold text-white uppercase tracking-wider leading-tight opacity-90 whitespace-pre-line max-w-[120px]">
                                                        {stat.label}
                                                    </div>
                                                </div>
                                                {i < arr.length - 1 && (
                                                    <div className="hidden md:block h-16 w-px bg-[#a8d060]/20 shrink-0" />
                                                )}
                                            </div>
                                        ))}
                                    </div> */}

                                    {/* <div className="mt-5">
                                        <button className="flex items-center gap-3 bg-[#4a8f2f] hover:bg-[#3d7a26] text-white px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.03] w-fit">
                                            Book Your Stall Now
                                            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#4a8f2f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                                </svg>
                                            </span>
                                        </button>
                                    </div> */}

                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-white border border-gray-100 rounded-xl shadow-sm px-4 md:px-5 pb-2 md:pb-2 pt-2 md:pt-3 flex flex-col lg:flex-row gap-6 lg:gap-8 -mt-1">

                        {/* Left Side */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-[#1a4d1a] text-[15px] font-semibold leading-snug mb-2">
                                    <span className="text-[#0D530E] text-[17px] font-medium">9th Edition of International Health & Wellness Expo 2026</span> <br />


                                    <span className="text-gray-900 text-[12px] font-medium">(IHWE Global Edition)</span>
                                </h2>
                                <div className="w-8 h-[3px] bg-[#4a8f2f] rounded mb-3" />
                                <p className="text-gray-600 text-[13px] leading-relaxed">
                                    Join IHWE 2026, the premier global platform uniting the healthcare, wellness, and AYUSH industries. Connect with India's most trusted brands, discover innovations, and build meaningful business connections. Register now to be part of a powerful global movement in <span className="text-[#4a8f2f] font-semibold">health & wellness.</span>
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden lg:block w-px bg-gray-200 self-stretch" />
                        <div className="block lg:hidden h-px w-full bg-gray-200 my-2" />

                        {/* Right Side */}
                        <div className="flex-1">
                            <h3 className="text-gray-900 text-[17px] font-medium mb-1">Choose Exhibitor Category</h3>
                            <div className="w-8 h-[3px] bg-[#4a8f2f] rounded mb-3" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                {/* Domestic Exhibitor */}
                                <div
                                    onClick={() => handleExhibitorTypeChange('domestic')}
                                    className={`cursor-pointer transition-all duration-300 rounded-xl px-5 pt-2 pb-4 flex flex-col items-center text-center gap-2 border-2 ${exhibitorType === 'domestic' ? 'bg-[#f0f7e6] border-[#4a8f2f] shadow-lg scale-[1.02]' : 'bg-[#f0f7e6]/50 border-transparent hover:border-[#c8e6a0] hover:bg-[#f0f7e6]'}`}
                                >
                                    <div className="flex items-center justify-center">
                                        <img src="/exhibition/dom.png" alt="Domestic" className="w-18 h-16 object-contain" />
                                    </div>
                                    <div>
                                        <p className="text-gray-800 font-bold text-base mb-1">Domestic Exhibitor</p>
                                        <p className="text-gray-700 text-xs">For exhibitors based in India</p>
                                    </div>
                                    <button
                                        type="button"
                                        className={`flex gap-2 items-center text-white text-xs font-medium uppercase tracking-widest px-5 py-2 rounded-lg transition-colors ${exhibitorType === 'domestic' ? 'bg-[#1a4d1a]' : 'bg-[#23471d] hover:bg-[#1a4d1a]'}`}
                                    >
                                        {exhibitorType === 'domestic' ? 'Selected' : 'Register Now'}
                                        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                                            <svg className={`w-3 h-3 ${exhibitorType === 'domestic' ? 'text-[#1a4d1a]' : 'text-[#23471d]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14M13 6l6 6-6 6" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>

                                {/* International Exhibitor */}
                                <div
                                    onClick={() => handleExhibitorTypeChange('international')}
                                    className={`cursor-pointer transition-all duration-300 rounded-xl px-5 pt-2 pb-4 flex flex-col items-center text-center gap-2 border-2 ${exhibitorType === 'international' ? 'bg-[#fff7f0] border-[#d26019] shadow-lg scale-[1.02]' : 'bg-[#fff7f0]/50 border-transparent hover:border-[#f5d5b0] hover:bg-[#fff7f0]'}`}
                                >
                                    <div className="flex items-center justify-center">
                                        <img src="/exhibition/int.png" alt="International" className="w-18 h-16 object-contain" />
                                    </div>
                                    <div>
                                        <p className="text-gray-800 font-bold text-base mb-1">International Exhibitor</p>
                                        <p className="text-gray-700 text-xs">For exhibitors based outside India</p>
                                    </div>
                                    <button
                                        type="button"
                                        className={`flex items-center gap-2 text-white text-xs font-medium uppercase tracking-widest px-5 py-2 rounded-lg transition-colors ${exhibitorType === 'international' ? 'bg-[#c96a18]' : 'bg-[#e07820] hover:bg-[#c96a18]'}`}
                                    >
                                        {exhibitorType === 'international' ? 'Selected' : 'Register Now'}
                                        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                                            <svg className={`w-3 h-3 ${exhibitorType === 'international' ? 'text-[#c96a18]' : 'text-[#e07820]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14M13 6l6 6-6 6" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>

                            </div>
                        </div>

                    </section>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">

                    {/* SUB-HEADER */}
                    <div
                        className="relative px-4 py-3 sm:py-3.5 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 overflow-hidden"
                        style={{
                            backgroundImage: `linear-gradient(to right, rgba(13, 83, 14, 0.95), rgba(13, 83, 14, 0.8)), url(${headerBg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="relative z-10 w-full text-center sm:text-left">
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight font-inter">
                                {exhibitorType === 'domestic' ? 'Domestic' : 'International'} New Exhibitor Registration
                            </h2>
                            <p className="text-[10px] text-green-100 uppercase tracking-[0.2em] mt-0.5 font-medium">9th Edition of International Health & Wellness Expo</p>
                        </div>
                        <div className="relative z-10 shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
                            <button type="button" onClick={() => setExhibitorType(null)}
                                className="px-5 py-1.5 text-[11px] font-bold uppercase bg-white/10 text-white rounded border border-white/30 hover:bg-white hover:text-black transition-all shadow-sm backdrop-blur-sm">
                                BACK
                            </button>
                        </div>
                    </div>

                    {/* SECTION: COMPANY INFORMATION */}
                    <div className={cardClasses}>
                        <h3 className={sectionHeaderClasses}>Exhibitor Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-4 gap-y-3 -mt-3">
                            <div>
                                <label className={labelClasses}>Company Name <span className="text-red-500">*</span></label>
                                <input required type="text" value={formData.exhibitorName} onChange={(e) => handleSelectChange('exhibitorName', e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            <div>
                                <label className={labelClasses}>Type of Business <span className="text-red-500">*</span></label>
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
                                <label className={labelClasses}>Industry / Sector <span className="text-red-500">*</span></label>
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
                                <label className={labelClasses}>Website <span className="text-red-500">*</span></label>
                                <input required type="text" value={formData.website} onChange={(e) => handleSelectChange('website', e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            <div>
                                <label className={labelClasses}>Exhibitor Address <span className="text-red-500">*</span></label>
                                <input required type="text" value={formData.address} onChange={(e) => handleSelectChange('address', e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            <div>
                                <label className={labelClasses}>Country <span className="text-red-500">*</span></label>
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
                                <label className={labelClasses}>{exhibitorType === 'domestic' ? 'State' : 'State / Province'} <span className="text-red-500">*</span></label>
                                <select required value={formData.state} onChange={(e) => handleSelectChange('state', e.target.value)} disabled={!formData.country} className={inputClasses}>
                                    <option value="">Select Here</option>
                                    {filteredStates.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>City <span className="text-red-500">*</span></label>
                                <select required value={formData.city} onChange={(e) => handleSelectChange('city', e.target.value)} disabled={!formData.state} className={inputClasses}>
                                    <option value="">Select Here</option>
                                    {filteredCities.map((ct, i) => <option key={i} value={ct.name}>{ct.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Pincode <span className="text-red-500">*</span></label>
                                <input required type="text" value={formData.pincode} onChange={(e) => handleSelectChange('pincode', e.target.value)} className={inputClasses} placeholder="Write Here.." inputMode="numeric" />
                            </div>
                            <div>
                                <label className={labelClasses}>Landline / Alternate No.</label>
                                <input type="text" value={formData.landlineNo} onChange={(e) => handleSelectChange('landlineNo', e.target.value)} className={inputClasses} placeholder="Write Here.." />
                            </div>
                            {/* <div>
                                <label className={labelClasses}>Nature of Business <span className="text-red-500">*</span></label>
                                <select required value={formData.natureOfBusiness} onChange={(e) => handleSelectChange('natureOfBusiness', e.target.value)} className={inputClasses}>
                                    <option value="">Select Here</option>
                                    <option>Agency</option><option>Aggregator</option><option>Association</option><option>College</option>
                                    <option>Dealer</option><option>Digital Media</option><option>Distributor</option><option>Electronic Media</option>
                                    <option>Government Body</option><option>Institution</option><option>Manufacturer</option><option>NGO</option>
                                    <option>Print Media</option><option>Raw material Supplier</option><option>Research Organisation</option>
                                    <option>Retailer</option><option>Service Provider</option><option>University</option><option>Others</option>
                                </select>
                            </div> */}

                            {/* About the Company */}
                            <div className="md:col-span-2 flex flex-col h-full">
                                <label className={labelClasses}>About the Company</label>
                                <textarea
                                    value={formData.aboutCompany}
                                    onChange={(e) => handleSelectChange('aboutCompany', e.target.value)}
                                    className={`${inputClasses} flex-1 !h-full py-1.5 resize-y leading-tight`}
                                    placeholder="Write a brief description about the company..."
                                />
                            </div>

                            {/* REGISTRANT TYPE */}
                            <div className="border border-slate-200 rounded-md bg-slate-50/60 px-2 py-1.5 flex flex-col justify-center h-full">
                                <p className="text-[11px] font-semibold text-slate-700 capitalize tracking-wide mb-1.5">Registration Type *</p>
                                <div className="flex flex-col gap-1.5">
                                    <label className="flex items-center gap-1.5 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="registrantType"
                                            value="registered"
                                            checked={formData.registrantType === 'registered'}
                                            onChange={() => setFormData(prev => ({ ...prev, registrantType: 'registered', panNo: '', aadhaarNo: '' }))}
                                            className="accent-[#23471d] w-3 h-3"
                                        />
                                        <span className="text-[9px] font-bold text-slate-800 group-hover:text-[#23471d] transition-colors leading-none flex items-center gap-1">
                                            Registered
                                            <span className="text-[7.5px] font-semibold text-[#23471d] bg-green-50 border border-green-200 px-1 py-px rounded uppercase tracking-wider">GST</span>
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="registrantType"
                                            value="unregistered"
                                            checked={formData.registrantType === 'unregistered'}
                                            onChange={() => setFormData(prev => ({ ...prev, registrantType: 'unregistered', gstNo: '' }))}
                                            className="accent-[#d26019] w-3 h-3"
                                        />
                                        <span className="text-[9px] font-bold text-slate-800 group-hover:text-[#d26019] transition-colors leading-none flex items-center gap-1">
                                            Unregistered
                                            <span className="text-[7.5px] font-semibold text-[#d26019] bg-orange-50 border border-orange-200 px-1 py-px rounded uppercase tracking-wider">PAN+Aadhar</span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* CONDITIONAL FIELDS */}
                            {formData.registrantType === 'registered' ? (
                                <>
                                    <div className="md:col-span-2 flex flex-col gap-0">
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div>
                                                <label className={labelClasses}>GST No. (GSTIN) <span className="text-red-500">*</span></label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.gstNo}
                                                    onChange={(e) => handleSelectChange('gstNo', e.target.value.toUpperCase())}
                                                    className={inputClasses}
                                                    placeholder="e.g. 07AABCU9603R1ZX"
                                                    maxLength={15}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-1.5">
                                            <label className={labelClasses}>Fascia Name <span className="text-red-500">*</span></label>
                                            <input required type="text" value={formData.fasciaName} onChange={(e) => handleSelectChange('fasciaName', e.target.value)} className={inputClasses} placeholder="Name on stall board" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="md:col-span-2 flex flex-col gap-0">
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div>
                                                <label className={labelClasses}>PAN Card No. <span className="text-red-500">*</span></label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.panNo}
                                                    onChange={(e) => handleSelectChange('panNo', e.target.value.toUpperCase())}
                                                    className={inputClasses}
                                                    placeholder="e.g. ABCDE1234F"
                                                    maxLength={10}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Aadhaar Card No. <span className="text-red-500">*</span></label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.aadhaarNo || ''}
                                                    onChange={(e) => handleSelectChange('aadhaarNo', e.target.value.replace(/\D/g, '').slice(0, 12))}
                                                    className={inputClasses}
                                                    placeholder="12-digit Aadhaar number"
                                                    maxLength={12}
                                                    inputMode="numeric"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-1.5">
                                            <label className={labelClasses}>Fascia Name <span className="text-red-500">*</span></label>
                                            <input required type="text" value={formData.fasciaName} onChange={(e) => handleSelectChange('fasciaName', e.target.value)} className={inputClasses} placeholder="Name on stall board" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* SECTION: STALL SELECTION */}
                    <div className={cardClasses}>
                        <h3 className={sectionHeaderClasses}>Exhibition Space Selection</h3>

                        <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch -mt-3">
                            {/* Left Side: Inputs */}
                            <div className="w-full lg:w-[40%] flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Stall Number <span className="text-red-500">*</span></label>
                                        <select required value={formData.participation.stallNo} onChange={(e) => handleStallSelect(e.target.value)} className={`${inputClasses} !text-[9.9px] !px-1.5 tracking-tighter`}>
                                            <option value="">-- Choose Available Stall --</option>
                                            {availableStalls.filter(s =>
                                                (typeof s.eventId === 'string' ? s.eventId === selectedEventId : s.eventId?._id === selectedEventId)
                                            ).map(s => (
                                                <option key={s._id} value={s._id} className="text-[11px]">{s.stallNumber} ({s.area} sqm - {s.plScheme})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Open Sides</label>
                                        <select value={formData.participation.stallScheme || ''} onChange={(e) => handleSelectChange('participation.stallScheme', e.target.value)} className={inputClasses}>
                                            <option value="">Select Open Sides</option>
                                            <option value="ONE SIDE OPEN">One Side Open</option>
                                            <option value="TWO SIDE OPEN">Two Side Open</option>
                                            <option value="THREE SIDE OPEN">Three Side Open</option>
                                            <option value="FOUR SIDE OPEN">Four Side Open</option>
                                        </select>
                                        {formData.participation.incrementPercentage > 0 && (
                                            <p className="text-[8.5px] text-red-500 font-bold mt-1.5 leading-tight tracking-tight whitespace-nowrap">
                                                Note : {formData.participation.incrementPercentage}% PLC applicable on base rate
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Stall Type</label>
                                        <select value={formData.participation.stallType} onChange={(e) => handleSelectChange('participation.stallType', e.target.value)} className={inputClasses}>
                                            <option value="Shell Space">Shell Space (Built-up)</option>
                                            <option value="Raw Space">Raw Space (Plot)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Stall Category</label>
                                        <select value={formData.participation.stallCategory} onChange={(e) => handleSelectChange('participation.stallCategory', e.target.value)} className={inputClasses}>
                                            <option value="">Select Category</option>
                                            <option value="Under MSME PSM Scheme">Under MSME PSM Scheme</option>
                                            <option value="Under General Category">Under General Category</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Side: LIVE RATES */}
                            <div className="w-full lg:w-[32%]">
                                {selectedEventId && (() => {
                                    const currency = exhibitorType === 'domestic' ? 'INR' : 'USD';
                                    const filtered = allRates.filter(r => (r.eventId?._id || r.eventId) === selectedEventId && r.currency === currency);
                                    return filtered.length > 0 && (
                                        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm h-full">
                                            <table className="w-full text-left border-collapse h-full">
                                                <thead>
                                                    <tr className="bg-[#0088cc] text-white">
                                                        <th className="py-1.5 px-2 text-[9px] font-bold uppercase tracking-wider">Stand Type</th>
                                                        <th className="py-1.5 px-2 text-[9px] font-bold uppercase tracking-wider">Cost ({currency} {currency === 'INR' ? '₹' : '$'})</th>
                                                        <th className="py-1.5 px-2 text-[9px] font-bold uppercase tracking-wider text-center">GST</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white">
                                                    {filtered.map((rate, index) => (
                                                        <tr key={rate._id} className={index !== filtered.length - 1 ? 'border-b border-slate-100' : ''}>
                                                            <td className="py-1.5 px-2 flex flex-col justify-center">
                                                                <span className="text-[10px] font-bold text-slate-700 uppercase leading-none">{rate.stallType}</span>
                                                                <span className="text-[8px] text-slate-400 font-medium mt-0.5">(Min. 9 sq m.)</span>
                                                            </td>
                                                            <td className="py-1.5 px-2 align-middle">
                                                                <span className="text-[10px] font-semibold text-[#0088cc]">
                                                                    {currency === 'INR' ? '₹' : '$'} {rate.ratePerSqm.toLocaleString()} / sq m.
                                                                </span>
                                                            </td>
                                                            <td className="py-1.5 px-2 text-center align-middle">
                                                                <span className="inline-block px-2 py-0.5 text-[8px] font-bold text-black bg-orange-50 border border-orange-200 rounded-full">
                                                                    18% GST
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Right Side: Image Banner */}
                            <div className="w-full lg:w-[28%] relative rounded-lg overflow-hidden border border-slate-200 shadow-sm hidden lg:block">
                                <img src={arenaImg} alt="Exhibition Arena" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-3 left-3 right-3">
                                    <h4 className="text-white font-bold text-[11px] uppercase tracking-wide">Exhibition Arena</h4>
                                    <p className="text-white/80 text-[9px] mt-0.5 leading-snug">World-class stalls and networking spaces.</p>
                                </div>
                            </div>
                        </div>



                        {/* PAYMENT PLAN & TDS CONTROL */}
                        <div className="p-4 bg-[#f8fafc] border border-slate-200 rounded-xl mt-3 space-y-3">

                            {(() => {
                                const currentEvent = events.find(e => e._id === selectedEventId);
                                const plans = currentEvent?.paymentPlans || [];
                                const fullPlan = plans.find(p => Number(p.percentage) === 100 || p.id === 'full');
                                // First installment phase (lowest %)
                                const firstInstallPlan = plans
                                    .filter(p => Number(p.percentage) < 100)
                                    .sort((a, b) => Number(a.percentage) - Number(b.percentage))[0];
                                const isFullSelected = formData.paymentPlanType === 'full' || formData.paymentPlanType === fullPlan?.id;
                                return (
                                    <div>
                                        <label className={labelClasses}>Payment Plan <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {/* Full Payment */}
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    paymentPlanType: fullPlan?.id || 'full',
                                                    paymentPlanLabel: fullPlan?.label || 'Full Payment'
                                                }))}
                                                className={`px-4 py-1.5 text-[11px] font-semibold uppercase rounded-[2px] border transition-all ${isFullSelected
                                                    ? 'bg-[#23471d] text-white border-[#23471d]'
                                                    : 'bg-white text-slate-600 border-slate-300 hover:border-[#23471d]'
                                                    }`}
                                            >
                                                Full Payment{settings?.fullPaymentDiscount > 0 ? ` (${settings.fullPaymentDiscount}% discount)` : ''}
                                            </button>
                                            {/* Installment — sets Phase 1 automatically */}
                                            {firstInstallPlan && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        paymentPlanType: firstInstallPlan.id,
                                                        paymentPlanLabel: firstInstallPlan.label
                                                    }))}
                                                    className={`px-4 py-1.5 text-[11px] font-semibold uppercase rounded-[2px] border transition-all ${!isFullSelected
                                                        ? 'bg-[#1a3a6b] text-white border-[#1a3a6b]'
                                                        : 'bg-white text-slate-600 border-slate-300 hover:border-[#1a3a6b]'
                                                        }`}
                                                >
                                                    Installment ({firstInstallPlan.percentage}% Now)
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                                            Selected: <span className="font-semibold text-slate-700">{formData.paymentPlanLabel}</span>
                                            {isFullSelected && settings?.fullPaymentDiscount > 0 && (
                                                <span className="ml-2 text-[#23471d] font-semibold">— {settings.fullPaymentDiscount}% discount applied</span>
                                            )}
                                        </p>
                                    </div>
                                );
                            })()}
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <label className={labelClasses}>Apply TDS Deduction <span className="text-red-500">*</span></label>
                                    <div className="w-48 relative mt-1">
                                        <select
                                            value={formData.chosenTdsPercent}
                                            onChange={(e) => setFormData(prev => ({ ...prev, chosenTdsPercent: Number(e.target.value) }))}
                                            className="w-full h-9 rounded-[2px] border border-slate-400 px-3 text-[12px] font-semibold text-red-600 bg-white focus:border-[#23471d] outline-none appearance-none"
                                        >
                                            <option value={0}>0% TDS</option>
                                            <option value={1}>1% TDS</option>
                                            <option value={2}>2% TDS</option>
                                            {/* <option value={10}>10% TDS</option> */}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-3 text-red-600 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">
                                        Net Payable (After TDS)
                                    </p>
                                    <p className="text-xl font-semibold text-[#23471d] leading-none">
                                        {formData.participation.currency} {formData.financeBreakdown?.netPayable?.toLocaleString() || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* COST BREAKDOWN */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-6 items-end">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Stall</p>
                                <p className="text-sm font-bold text-slate-900">{formData.participation.stallFor || ''}</p>
                                <p className="text-[11px] text-slate-500">{formData.participation.stallType}  {formData.participation.stallSize} sqm</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Base Rate</p>
                                <p className="text-sm font-bold text-slate-900">{formData.participation.currency} {Number(formData.participation.rate).toLocaleString()}/sqm</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Base Amount</p>
                                <p className="text-sm font-bold text-slate-900">{formData.participation.currency} {Math.round(formData.participation.amount).toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">GST (18%)</p>
                                <p className="text-sm font-bold text-slate-900">{formData.participation.currency} {Math.round(formData.participation.total - formData.participation.amount).toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4 ml-auto">
                                <p className="text-[10px] font-semibold text-[#23471d] uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                                    Total Payable
                                </p>
                                <p className="text-2xl font-semibold text-[#23471d]">{formData.participation.currency === 'INR' ? `\u20b9${formData.participation.total?.toLocaleString()}` : `$${formData.participation.total?.toLocaleString()}`}</p>
                            </div>
                        </div>
                    </div>


                    {/* SECTION: CRM ATTRIBUTION */}
                    <div className={cardClasses}>
                        <h3 className={sectionHeaderClasses}>CRM Attribution</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 -mt-3">
                            <div>
                                <label className={labelClasses}>Referral Channel <span className="text-red-500">*</span></label>
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
                                <label className={labelClasses}>Spoken With <span className="text-red-500">*</span></label>
                                <select required value={formData.spokenWith} onChange={(e) => handleSelectChange('spokenWith', e.target.value)} className={inputClasses}>
                                    <option value="">Select Staff Member</option>
                                    {marketingStaff.map(s => <option key={s._id} value={s.fullName || s.username}>{s.fullName || s.username}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* FINANCIAL SETTLEMENT BREAKDOWN */}
                    <div className="px-2">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#23471d]"></div>

                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-[#23471d]" />
                                    <h3 className="text-[11px] font-semibold text-slate-900 uppercase tracking-[0.2em]">Financial Settlement Breakdown</h3>
                                </div>
                                <span className="px-2 py-0.5 text-[8px] font-semibold uppercase bg-slate-100 text-slate-500 rounded border border-slate-200 tracking-widest">Calculated Live</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                                {/* Gross Cost */}
                                <div className="space-y-1">
                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Gross Booking Cost</p>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                        {formData.participation.currency} {formData.financeBreakdown.grossAmount?.toLocaleString()}
                                    </p>
                                </div>

                                {/* Discounts Combined */}
                                <div className="space-y-1 border-l-0 md:border-l border-slate-100 pl-0 md:pl-6">
                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                        Applied Savings
                                        <span className="text-[8px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-2">SAVED</span>
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
                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Government Taxes & TDS</p>
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-900">+{formData.participation.currency} {formData.financeBreakdown.gstAmount?.toLocaleString()}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">GST 18%</p>
                                        </div>
                                        {formData.financeBreakdown.tdsPercent > 0 && (
                                            <div>
                                                <p className="text-[10px] font-semibold text-red-600">-{formData.participation.currency} {formData.financeBreakdown.tdsAmount?.toLocaleString()}</p>
                                                <p className="text-[8px] font-bold text-red-400 uppercase">TDS {formData.financeBreakdown.tdsPercent}%</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Net Payable */}
                                <div className="space-y-1 border-l-0 md:border-l border-slate-100 pl-0 md:pl-6 text-right">
                                    <p className="text-[9px] font-semibold text-[#23471d] uppercase tracking-[0.1em] mb-1">Net To Be Collected</p>
                                    <p className="text-3xl font-semibold text-[#23471d] leading-none mb-1">
                                        {formData.participation.currency} {formData.financeBreakdown.netPayable?.toLocaleString()}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">All Taxes Included</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOOKING SUMMARY */}
                    <div className="px-2 space-y-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-6 items-end justify-between">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Final Status</p>
                                <p className="text-sm font-bold text-slate-900">
                                    {formData.financeBreakdown.isFullPayment ? 'Full Booking' : 'Advance Booking'}
                                </p>
                                <p className="text-[11px] text-slate-500">Plan: {formData.paymentPlanLabel}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Due Today</p>
                                <p className="text-sm font-bold text-[#23471d]">{formData.participation.currency} {formData.amountPaid?.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Balance Later</p>
                                <p className="text-sm font-bold text-red-600">{formData.participation.currency} {formData.balanceAmount?.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4 ml-auto">
                                <p className="text-[10px] font-semibold text-[#23471d] uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                                    Net Total
                                </p>
                                <p className="text-2xl font-semibold text-[#23471d]">{formData.participation.currency} {formData.financeBreakdown.netPayable?.toLocaleString()}</p>
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
                                className="px-8 py-2 bg-slate-50 border border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all rounded-md">
                                Reset
                            </button>
                            <button type="submit" disabled={isLoading}
                                className="px-10 py-2 bg-[#23471d] hover:bg-[#1a3516] text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-md shadow-lg flex items-center gap-2 group">
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
