import React, { useState } from 'react';
import BuyerRegistration from './BuyerRegistration';
import InternationalBuyerRegistration from './InternationalBuyerRegistration';
import { useNavigate } from 'react-router-dom';

const BuyerRegistrationForm = () => {
    const [buyerType, setBuyerType] = useState(null); // 'domestic' | 'international'
    const navigate = useNavigate();

    if (buyerType === 'domestic') {
        return (
            <div className="relative animate-fadeIn">
                <div className="flex justify-between items-center p-3 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                    <h2 className="text-[16px] font-bold text-[#1a4d1a] tracking-tight ml-2">Domestic Buyer Registration</h2>
                    <div className='flex gap-6'>
                        <button
                            onClick={() => navigate("/buyer-list")}
                            className='bg-[#23471d] text-white px-4 py-1.5 rounded-md'>Buyer Lists</button>
                        <button onClick={() => setBuyerType(null)} className="px-4 py-1.5 text-xs font-bold uppercase bg-[#fff5f5] text-red-500 border border-red-500/50 rounded hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center gap-2">
                            <span>&larr;</span> Back to Selection
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-[#f8fafc] min-h-[calc(100vh-60px)]">
                    <BuyerRegistration />
                </div>
            </div>
        );
    }

    if (buyerType === 'international') {
        return (
            <div className="relative animate-fadeIn">
                <div className="flex justify-between items-center p-3 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                    <h2 className="text-[16px] font-bold text-[#d26019] tracking-tight ml-2">International Buyer Registration</h2>
                    <div className='flex gap-6'>
                        <button
                            onClick={() => navigate("/international-buyer-list")}
                            className='bg-[#d26019] text-white px-4 py-1.5 rounded-md'>Buyer Lists</button>
                        <button onClick={() => setBuyerType(null)} className="px-4 py-1.5 text-xs font-bold uppercase bg-[#fff5f5] text-red-500 border border-red-500/50 rounded hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center gap-2">
                            <span>&larr;</span> Back to Selection
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-[#f8fafc] min-h-[calc(100vh-60px)]">
                    <InternationalBuyerRegistration />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] shadow-md px-4 pt-4 pb-1 min-h-[calc(100vh-90px)] font-inter animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center pb-3">
                <div>
                    <h1 className="text-[22px] font-bold text-slate-900 capitalize tracking-tight leading-none font-inter">New Buyer Registration</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1 max-w-3xl leading-relaxed">
                        Onboard new buyers seamlessly by capturing company information, <br />
                        managing preferences, and generating booking documents—all from a single workspace.
                    </p>
                </div>
                <div className="flex flex-col sm:items-end gap-2 mt-3 sm:mt-0 max-w-4xl">
                    <div className="px-3 py-2.5 text-[10.5px] text-slate-600 bg-blue-50/60 border border-blue-200/60 rounded-md leading-relaxed text-left shadow-sm">
                        <span className="font-bold text-blue-800 mb-0.5 block">NOTE : </span>
                        This option should be used when a buyer prefers not to register through the official website or requires assistance from the IHWE Sales Team.
                    </div>
                </div>
            </div>

            <div className="w-full mt-0 flex flex-col gap-1">
                <section
                    className="hero-background-registration relative overflow-hidden !aspect-auto md:!aspect-[4/1] !h-auto md:!h-auto py-6 md:py-0 rounded-t-lg"
                    style={{
                        backgroundImage: "url('/exhibition/bg.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'left',
                        backgroundRepeat: 'no-repeat',
                        fontFamily: "'Barlow', sans-serif",
                    }}
                >
                    <div className="w-full">
                        <div className="relative z-10 pt-6 md:pt-8 pb-1 md:pb-2 flex flex-col gap-2 w-full md:w-[60%] lg:w-[55%] bg-black/40 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none backdrop-blur-sm md:backdrop-blur-none px-4 md:px-8">

                            <div className="inline-block mt-4 px-4 py-1 bg-[#a8d060]/15 border border-[#a8d060]/40 rounded-lg text-[#a8d060] text-xs font-bold uppercase tracking-[0.2em] w-fit backdrop-blur-sm shadow-[0_0_20px_rgba(168,208,96,0.2)]">
                                Buyer Registration Form
                            </div>

                            <div className="mt-1">
                                <h1 className="text-3xl md:text-[38px] font-extrabold text-white leading-tight uppercase">
                                    Register as a <br />
                                    <span className="text-[#a8d060]">Buyer</span>
                                </h1>
                            </div>

                            <p className="text-white/80 text-[13px] md:text-sm leading-relaxed max-w-md mt-1">
                                Connect with India's most trusted brands, discover innovations, and build meaningful business connections.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-gray-100 rounded-b-lg shadow-sm px-4 md:px-5 pb-2 md:pb-2 pt-2 md:pt-3 flex flex-col lg:flex-row gap-6 lg:gap-8 -mt-1">

                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <h2 className="text-[#1a4d1a] text-[15px] font-semibold leading-snug mb-2">
                                <span className="text-[#0D530E] text-[17px] font-medium">9th Edition of International Health & Wellness Expo 2026</span> <br />
                                <span className="text-gray-900 text-[12px] font-medium">(IHWE Global Edition)</span>
                            </h2>
                            <div className="w-8 h-[3px] bg-[#4a8f2f] rounded mb-3" />
                            <p className="text-gray-600 text-[13px] leading-relaxed">
                                Join IHWE 2026, the premier global platform uniting the healthcare, wellness, and AYUSH industries. Register now to be part of a powerful global movement in <span className="text-[#4a8f2f] font-semibold">health & wellness.</span>
                            </p>
                        </div>
                    </div>

                    <div className="hidden lg:block w-px bg-gray-200 self-stretch" />
                    <div className="block lg:hidden h-px w-full bg-gray-200 my-2" />

                    <div className="flex-1">
                        <h3 className="text-gray-900 text-[17px] font-medium mb-1">Choose Buyer Category</h3>
                        <div className="w-8 h-[3px] bg-[#4a8f2f] rounded mb-3" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Domestic Buyer */}
                            <div
                                onClick={() => setBuyerType('domestic')}
                                className={`cursor-pointer transition-all duration-300 rounded-xl px-5 pt-2 pb-4 flex flex-col items-center text-center gap-2 border-2  ${buyerType === 'domestic' ? 'bg-[#f0f7e6] border-[#4a8f2f] shadow-lg scale-[1.02]' : 'bg-[#f0f7e6]/50 border-[#4a8f2f]/5 hover:border-[#c8e6a0] hover:bg-[#f0f7e6]'}`}
                            >
                                <div className="flex items-center justify-center">
                                    <img loading="lazy" decoding="async" src="/exhibition/dom.png" alt="Domestic" className="w-18 h-16 object-contain" />
                                </div>
                                <div>
                                    <p className="text-gray-800 font-bold text-base mb-1">Domestic Buyer</p>
                                    <p className="text-gray-700 text-xs">For buyers based in India</p>
                                </div>
                                <button
                                    type="button"
                                    className={`flex gap-2 items-center text-white text-xs font-medium uppercase tracking-widest px-5 py-2 rounded-lg transition-colors ${buyerType === 'domestic' ? 'bg-[#1a4d1a]' : 'bg-[#23471d] hover:bg-[#1a4d1a]'}`}
                                >
                                    {buyerType === 'domestic' ? 'Selected' : 'Register Now'}
                                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                                        <svg className={`w-3 h-3 ${buyerType === 'domestic' ? 'text-[#1a4d1a]' : 'text-[#23471d]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M13 6l6 6-6 6" />
                                        </svg>
                                    </span>
                                </button>
                            </div>

                            {/* International Buyer */}
                            <div
                                onClick={() => setBuyerType('international')}
                                className={`cursor-pointer transition-all duration-300 rounded-xl px-5 pt-2 pb-4 flex flex-col items-center text-center gap-2 border-2 ${buyerType === 'international' ? 'bg-[#fff7f0] border-[#d26019] shadow-lg scale-[1.02]' : 'bg-[#fff7f0]/50 border-[#d26019]/5 hover:border-[#f5d5b0] hover:bg-[#fff7f0]'}`}
                            >
                                <div className="flex items-center justify-center">
                                    <img loading="lazy" decoding="async" src="/exhibition/int.png" alt="International" className="w-18 h-16 object-contain" />
                                </div>
                                <div>
                                    <p className="text-gray-800 font-bold text-base mb-1">International Buyer</p>
                                    <p className="text-gray-700 text-xs">For buyers based outside India</p>
                                </div>
                                <button
                                    type="button"
                                    className={`flex items-center gap-2 text-white text-xs font-medium uppercase tracking-widest px-5 py-2 rounded-lg transition-colors ${buyerType === 'international' ? 'bg-[#c96a18]' : 'bg-[#e07820] hover:bg-[#c96a18]'}`}
                                >
                                    {buyerType === 'international' ? 'Selected' : 'Register Now'}
                                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                                        <svg className={`w-3 h-3 ${buyerType === 'international' ? 'text-[#c96a18]' : 'text-[#e07820]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M13 6l6 6-6 6" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BuyerRegistrationForm;