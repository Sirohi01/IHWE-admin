import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw, Presentation, CreditCard, Save, Calendar, Check, Clock, IndianRupee, User, MapPin, Briefcase } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AddDelegatePass = () => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: 'Mr.',
    fullName: '',
    email: '',
    designation: '',
    organization: '',
    mobile: '',
    alternateMobile: '',
    address: '',
    pincode: '',
    country: 'India',
    state: '',
    city: '',
    industrySector: '',
    typeOfBusiness: '',
    paymentMode: 'NEFT',
    paymentRemarks: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  const [dayData, setDayData] = useState([]);
  const [sessionsData, setSessionsData] = useState({});
  const [activeDay, setActiveDay] = useState('');

  const [passesData, setPassesData] = useState([]);
  const [selectedPasses, setSelectedPasses] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API_URL}/delegate-config/public`);
      if (res.data.success) {
        const fetchedDays = res.data.data.days || [];
        setDayData(fetchedDays);
        setPassesData(res.data.data.passes || []);
        if (fetchedDays.length > 0 && !activeDay) {
          setActiveDay(fetchedDays[0]._id);
        }

        const sessionMap = {};
        fetchedDays.forEach((d) => {
          sessionMap[d._id] = d.sessions || [];
        });
        setSessionsData(sessionMap);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pincode') {
      handlePincodeChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePincodeChange = async (val) => {
    setFormData(prev => ({ ...prev, pincode: val }));
    if (val.length === 6) {
      try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${val}`);
        if (res.data && res.data[0].Status === "Success") {
          const postOffice = res.data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
            country: postOffice.Country
          }));
        }
      } catch (err) {
        console.error("Error fetching pincode data:", err);
      }
    }
  };

  const handlePassToggle = (pass) => {
    setSelectedPasses(prev => {
      const isSelected = prev.some(p => p.pass === pass._id);
      if (isSelected) {
        return prev.filter(p => p.pass !== pass._id);
      } else {
        return [...prev, { pass: pass._id, passKey: pass.key, title: pass.title, price: pass.price }];
      }
    });
  };

  const handleSessionToggle = (session, day) => {
    setSelectedSessions((prev) => {
      const exists = prev.find((s) => s.session === session._id);
      if (exists) {
        return prev.filter((s) => s.session !== session._id);
      } else {
        return [...prev, { session: session._id, title: session.title, price: session.price, date: day.date, time: session.time }];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      submitData.append('specialPasses', JSON.stringify(selectedPasses));
      submitData.append('sessions', JSON.stringify(selectedSessions));

      if (profileImage) submitData.append('profileImage', profileImage);
      if (paymentReceipt) submitData.append('paymentReceipt', paymentReceipt);

      const res = await axios.post(`${API_URL}/delegate/admin/create-offline`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccessMsg(`Delegate Registration Created Successfully! Reg No: ${res.data.registration.regNo}`);
        setFormData({
          title: 'Mr.', fullName: '', email: '', designation: '', organization: '',
          mobile: '', alternateMobile: '', address: '', pincode: '', country: 'India',
          state: '', city: '', industrySector: '', typeOfBusiness: '',
          paymentMode: 'NEFT', paymentRemarks: ''
        });
        setSelectedPasses([]);
        setSelectedSessions([]);
        setProfileImage(null);
        setPaymentReceipt(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Something went wrong');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    let sub = 0;
    selectedPasses.forEach(p => sub += p.price);
    selectedSessions.forEach(s => sub += s.price);
    return sub;
  };

  const calculateGst = () => {
    return Math.round(calculateSubtotal() * 0.18);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGst();
  };

  // Common UI styles
  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#143111]/20 focus:border-[#143111]";
  const labelClass = "block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1.5";
  const sectionCardClass = "bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";
  const sectionHeaderClass = "flex items-center gap-3 text-lg font-bold text-[#143111] mb-6 pb-4 border-b border-slate-100/80";

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 min-h-[calc(100vh-110px)] p-4 md:px-6 lg:px-8 font-sans text-slate-800">

      {/* Header */}
      <div className="mb-2 flex flex-col gap-1.5">
        <h1 className="text-2xl text-[#093C5D] font-medium tracking-tight">Add Delegate Pass</h1>
        <p className="text-lg text-slate-500 font-medium max-w-5xl">
          Manually create a delegate registration by choosing the appropriate pass and collecting offline payment proof.
        </p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 text-red-700 border border-red-500/20 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="text-red-500" size={20} />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">

        {/* Delegate Pass Selection - Moved to Top */}
        <div className={`${sectionCardClass} ring-1 ring-[#143111]/5`}>
          <h2 className={sectionHeaderClass}>
            <div className="p-2 bg-[#143111]/10 rounded-lg"><Calendar className="text-[#143111]" size={20} /></div>
            Step 1: Choose Day, Session & Passes
          </h2>

          <div className="w-full">
            {/* Day Cards - Compact */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
              {dayData.map((day, index) => (
                <button
                  type="button"
                  key={day._id}
                  onClick={() => setActiveDay(day._id)}
                  className={`relative flex flex-col p-2 sm:p-2.5 rounded-xl border-2 transition-all text-left ${activeDay === day._id
                    ? "bg-[#143111] border-[#143111] text-white shadow-md scale-[1.02]"
                    : "bg-white border-slate-200 text-slate-400 hover:border-[#143111]/40 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeDay === day._id ? "text-white" : "text-slate-300"}`} />
                    <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-wider">DAY {index + 1}</span>
                  </div>
                  <div className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-tight leading-none mb-0.5 ${activeDay === day._id ? "opacity-90" : "text-slate-600"}`}>{day.date}</div>
                  <div className={`text-[9px] sm:text-[10px] font-semibold uppercase leading-none ${activeDay === day._id ? "opacity-75" : "text-slate-400"}`}>{day.day}</div>
                </button>
              ))}
            </div>

            {/* Divider */}
            {dayData.length > 0 && activeDay && (
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative bg-white px-4 sm:px-6 flex items-center gap-2 text-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#143111] shrink-0" />
                  <span className="text-[10px] sm:text-[13px] font-black text-[#143111] uppercase tracking-[0.15em] leading-tight">
                    DAY {dayData.findIndex(d => d._id === activeDay) + 1} – {dayData.find((d) => d._id === activeDay)?.title}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#143111] shrink-0" />
                </div>
              </div>
            )}

            {/* Sessions List */}
            <div className="space-y-4 mb-8">
              {sessionsData[activeDay]?.map((session) => {
                const currentDay = dayData.find(d => d._id === activeDay);
                const isSelected = selectedSessions.some((s) => s.session === session._id);
                return (
                  <div
                    key={session._id}
                    onClick={() => handleSessionToggle(session, currentDay)}
                    className={`flex flex-col sm:flex-row items-stretch rounded-xl border overflow-hidden transition-all cursor-pointer group ${isSelected ? "border-[#143111] bg-[#143111]/[0.02] shadow-sm" : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
                      }`}
                  >
                    <div className={`w-full sm:w-[70px] p-2 flex flex-row sm:flex-col justify-between sm:justify-center items-center shrink-0 gap-1 transition-colors ${isSelected ? "bg-[#143111] text-white" : "bg-slate-50 text-slate-400 group-hover:bg-[#143111] group-hover:text-white"
                      }`}>
                      <div className="flex sm:flex-col items-center sm:justify-center gap-1">
                        <span className="text-[8px] font-bold opacity-70 uppercase tracking-widest">SESSION</span>
                        <span className="text-[16px] sm:text-[22px] font-black leading-none">{session.number}</span>
                      </div>
                    </div>

                    <div className="flex-1 p-2 sm:p-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-[13px] sm:text-[15px] font-bold text-slate-800 leading-snug mb-1">
                          {session.title}
                        </h3>
                        <div className="flex flex-row items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-600">{session.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[12px] font-black text-emerald-600">{session.price}</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="bg-[#143111] text-white p-1 rounded-full shrink-0 shadow-sm animate-in zoom-in-50 mr-2">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>)
              })}
            </div>

            {/* Passes Selection */}
            {passesData.length > 0 && (
              <div className="pt-2">
                <h3 className="text-[12px] font-black text-[#143111]/70 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                  <CreditCard size={16} /> Available Passes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {passesData.filter(p => p.isActive).map(pass => {
                    const isSelected = selectedPasses.some(p => p.pass === pass._id);
                    return (
                      <div
                        key={pass._id}
                        onClick={() => handlePassToggle(pass)}
                        className={`relative p-3 border-2 rounded-xl cursor-pointer transition-all overflow-hidden flex flex-col justify-center ${isSelected ? 'border-[#143111] bg-[#143111]/[0.03] shadow-sm' : 'border-slate-200 bg-white hover:border-[#143111]/30 hover:bg-slate-50'
                          }`}
                      >
                        {isSelected && <div className="absolute top-0 right-0 w-12 h-12 bg-[#143111] opacity-5 rounded-bl-full" />}
                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-[#143111]' : 'bg-slate-100'}`}>
                            <CreditCard className={isSelected ? "text-white" : "text-slate-400"} size={14} />
                          </div>
                          {isSelected && <div className="bg-[#143111] text-white p-1 rounded-full animate-in zoom-in-50"><Check size={12} strokeWidth={3} /></div>}
                        </div>
                        <h3 className="font-bold text-xs text-slate-800 leading-snug relative z-10 line-clamp-2">{pass.title}</h3>
                        <p className="text-lg font-black mt-1 text-[#143111] relative z-10">₹{pass.price}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dayData.length === 0 && passesData.length === 0 && (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <Presentation className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-sm font-semibold text-slate-500">No passes or sessions available yet.</p>
                <p className="text-xs text-slate-400 mt-1">Please configure them in Delegate Session Config.</p>
              </div>
            )}
          </div>
        </div>

        {/* Basic Details */}
        <div className={sectionCardClass}>
          <h2 className={sectionHeaderClass}>
            <div className="p-2 bg-blue-500/10 rounded-lg"><User className="text-blue-600" size={20} /></div>
            Step 2: Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Title *</label>
              <select name="title" value={formData.title} onChange={handleChange} className={inputClass} required>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} placeholder="John Doe" required />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="john@example.com" required />
            </div>
            <div>
              <label className={labelClass}>Mobile *</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} placeholder="+91 XXXXXXXXXX" required />
            </div>
            <div>
              <label className={labelClass}>Designation *</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} className={inputClass} placeholder="Director" required />
            </div>
            <div>
              <label className={labelClass}>Organization *</label>
              <input type="text" name="organization" value={formData.organization} onChange={handleChange} className={inputClass} placeholder="Company Ltd." required />
            </div>
            <div className="lg:col-span-3 pt-2">
              <label className={labelClass}>Profile Image</label>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-sm">
                  <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer" />
                </div>
                {profileImage && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md flex items-center gap-1.5"><CheckCircle2 size={14} /> Image selected</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className={sectionCardClass}>
          <h2 className={sectionHeaderClass}>
            <div className="p-2 bg-amber-500/10 rounded-lg"><MapPin className="text-amber-600" size={20} /></div>
            Step 3: Address Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Pincode *</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} placeholder="110001" required maxLength={6} />
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="New Delhi" required />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} placeholder="Delhi" required />
            </div>
            <div>
              <label className={labelClass}>Country *</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} className={inputClass} placeholder="India" required />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="123 Street Name" required />
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className={sectionCardClass}>
          <h2 className={sectionHeaderClass}>
            <div className="p-2 bg-purple-500/10 rounded-lg"><Briefcase className="text-purple-600" size={20} /></div>
            Step 4: Business Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Industry Sector *</label>
              <select name="industrySector" value={formData.industrySector} onChange={handleChange} className={inputClass} required>
                <option value="">Select Here</option>
                <option value="Medical & Healthcare">Medical & Healthcare</option>
                <option value="AYUSH & Traditional Medicine">AYUSH & Traditional Medicine</option>
                <option value="Wellness, Fitness & Lifestyle">Wellness, Fitness & Lifestyle</option>
                <option value="Nutrition, Organic & Health Foods">Nutrition, Organic & Health Foods</option>
                <option value="Beauty, Personal Care & Aesthetic Wellness">Beauty, Personal Care & Aesthetic Wellness</option>
                <option value="Mental Health, Yoga & Spiritual Wellness">Mental Health, Yoga & Spiritual Wellness</option>
                <option value="Medical Technology, Diagnostics & Devices">Medical Technology, Diagnostics & Devices</option>
                <option value="Institutions, Government Bodies & Startups">Institutions, Government Bodies & Startups</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Type of Business *</label>
              <select name="typeOfBusiness" value={formData.typeOfBusiness} onChange={handleChange} className={inputClass} required>
                <option value="">Select Here</option>
                <option value="Pvt. Ltd. Company">Pvt. Ltd. Company</option>
                <option value="Pub. Ltd. Company">Pub. Ltd. Company</option>
                <option value="Partnership Company">Partnership Company</option>
                <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                <option value="One Person Company">One Person Company</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Section 8 Company">Section 8 Company</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Proof */}
        <div className={`${sectionCardClass} border-t-4 border-t-emerald-500`}>
          <h2 className={sectionHeaderClass}>
            <div className="p-2 bg-emerald-500/10 rounded-lg"><UploadCloud className="text-emerald-600" size={20} /></div>
            Step 5: Offline Payment Details
          </h2>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className={labelClass}>Payment Method *</label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className={inputClass}>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="CHEQUE">Cheque</option>
                <option value="DEMAND_DRAFT">Demand Draft</option>
                <option value="OTHER_BANK_TRANSFER">Other Bank Transfer</option>
              </select>
            </div>

            <div className="flex-1">
              <label className={labelClass}>Transaction ID / Remarks *</label>
              <input type="text" name="paymentRemarks" value={formData.paymentRemarks} onChange={handleChange} placeholder="e.g. UTR NO. SBIN0000000" className={inputClass} required />
            </div>

            <div className="flex-1">
              <label className={labelClass}>Upload Receipt (Optional)</label>
              <input type="file" onChange={(e) => setPaymentReceipt(e.target.files[0])} accept="image/*,application/pdf" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors cursor-pointer" />
            </div>
          </div>

          <div className="p-6 bg-[#f8fafc] border border-slate-200 rounded-xl">
            <div className="flex justify-end items-center gap-6 mb-2">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Subtotal:</span>
              <span className="font-bold text-lg text-slate-800 w-32 text-right">₹{calculateSubtotal()}</span>
            </div>
            <div className="flex justify-end items-center gap-6 mb-4 pb-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">GST (18%):</span>
              <span className="font-bold text-lg text-slate-800 w-32 text-right">₹{calculateGst()}</span>
            </div>
            <div className="flex justify-end items-center gap-6">
              <span className="text-base font-black text-emerald-700 uppercase tracking-wider">Final Amount Paid:</span>
              <span className="text-2xl font-black text-emerald-700 w-32 text-right">₹{calculateTotal()}</span>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end mb-10">
          <button
            type="submit"
            disabled={loading || (selectedPasses.length === 0 && selectedSessions.length === 0)}
            className="flex items-center gap-2 px-8 py-2.5 bg-[#143111] hover:bg-[#0c1f0a] text-white rounded-lg shadow-md shadow-[#143111]/20 disabled:opacity-50 disabled:shadow-none transition-all font-semibold text-base transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? 'Processing...' : 'Create Offline Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDelegatePass;
