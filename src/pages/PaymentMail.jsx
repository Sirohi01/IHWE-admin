import React from 'react';
import QRCode from "react-qr-code";
import {
   Building2,
   MapPin,
   Phone,
   Mail,
   Globe,
   CheckCircle2,
   ShieldCheck,
   Facebook,
   Instagram,
   Linkedin,
   Youtube,
   Landmark,
   CreditCard,
   Wallet,
   Smartphone,
   Bell,
   Receipt,
   Banknote,
   IndianRupee,
   CalendarClock
} from "lucide-react";
import namogangelogo from "../assets/namogangelogo1.webp";
import ihwelogo from "../assets/9th_certificate/9thlogo.png";


export default function PaymentMail() {
   const amount = "81,820";
   const totalAmount = "1,16,820";
   const receivedAmount = "35,000";
   const upiId = "ihwe.collect@kotak";
   const companyName = "Rohit Kumar";
   const invoiceNo = "PI/26-27/0123";
   const dueDate = "20th August 2026";

   return (
      <div className="w-full max-w-[794px] mx-auto bg-white font-sans text-gray-800 shadow-2xl relative my-2 print:my-0 print:shadow-none flex flex-col">         {/* --- HEADER SECTION --- */}
         <div className="flex flex-row items-center justify-between pt-2 px-6 pb-2 w-full">

            {/* Logo and Vertical Separator */}
            <div className="flex items-center shrink-0">
               <img src={namogangelogo} alt="Namo Gange" className="h-[85px] object-contain shrink-0" />
               <div className="h-[80px] w-px bg-gray-300 mx-6 shrink-0"></div>
            </div>

            {/* Center Text */}
            <div className="flex flex-col items-center text-center shrink-0 flex-1">
               <img src={ihwelogo} alt="IHWE" className="h-[75px] object-contain shrink-0" />
               <p className="text-[12px] font-bold text-[#1b3664] tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                  21 – 23 AUGUST 2026
               </p>
            </div>

            {/* Vertical Separator and Right Side */}
            <div className="flex items-center shrink-0">
               <div className="h-[80px] w-px bg-gray-300 mx-5 shrink-0"></div>
               <div className="text-left flex flex-col justify-center shrink-0 w-[172px]">
                  <p className="text-[10px] font-bold text-[#1b3664] tracking-wider mb-0.5 uppercase whitespace-nowrap">INDIA'S LARGEST</p>
                  <p className="text-[11px] font-black text-[#0f8b4d] mb-0.5 tracking-wide uppercase whitespace-nowrap">HEALTH & WELLNESS</p>
                  <p className="text-[9px] font-bold text-[#1b3664] mb-2 tracking-wide uppercase whitespace-nowrap">EXHIBITION & CONFERENCE</p>
                  <div className="flex items-center justify-between gap-1 w-[172px]">
                     <div className="flex flex-col items-center border border-gray-300 rounded-md p-1 w-[40px] h-[46px] bg-white justify-center shrink-0 shadow-sm">
                        <Building2 size={16} className="text-[#0f8b4d] mb-0.5" strokeWidth={1.5} />
                        <span className="text-[5px] font-bold tracking-tighter text-[#1b3664]">EXHIBITION</span>
                     </div>
                     <div className="flex flex-col items-center border border-gray-300 rounded-md p-1 w-[40px] h-[46px] bg-white justify-center shrink-0 shadow-sm">
                        <Globe size={16} className="text-blue-500 mb-0.5" strokeWidth={1.5} />
                        <span className="text-[5px] font-bold tracking-tighter text-[#1b3664]">CONFERENCE</span>
                     </div>
                     <div className="flex flex-col items-center border border-gray-300 rounded-md p-1 w-[40px] h-[46px] bg-white justify-center shrink-0 shadow-sm">
                        <Building2 size={16} className="text-purple-500 mb-0.5" strokeWidth={1.5} />
                        <span className="text-[5px] font-bold tracking-tighter text-[#1b3664]">BUYER MEET</span>
                     </div>
                     <div className="flex flex-col items-center border border-gray-300 rounded-md p-1 w-[40px] h-[46px] bg-white justify-center shrink-0 shadow-sm">
                        <Globe size={16} className="text-orange-500 mb-0.5" strokeWidth={1.5} />
                        <span className="text-[5px] font-bold tracking-tighter text-[#1b3664]">AWARDS</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 3-Color Divider Strip */}
         <div className="flex h-[5px] w-full mb-2">
            <div className="w-1/3 bg-[#0f8b4d]"></div>
            <div className="w-1/3 bg-[#1b3664]"></div>
            <div className="w-1/3 bg-[#f37021]"></div>
         </div>

         <div className="px-8">

            {/* --- BODY TEXT & REMINDER BOX --- */}
            <div className="flex flex-row justify-between mb-4 w-full">
               <div className="flex-1 pr-4">
                  <h3 className="text-[17px] font-bold text-[#1b3664] mb-1">Dear {companyName},</h3>
                  <h2 className="text-[19px] font-bold text-[#f37021] mb-1">Namo Gange Namaskar!</h2>
                  <p className="text-[13px] text-[#2d3748] mb-3 leading-[1.6] text-justify">
                     Thank you for confirming your participation in the <strong>9th International Health & Wellness Expo 2026 (IHWE – 2026), PRAGATI MAIDAN, NEW DELHI, INDIA</strong>.
                  </p>
                  <p className="text-[13px] text-[#2d3748] leading-[1.6] text-justify">
                     This is a gentle <strong className="text-[#0f8b4d]">FIRST REMINDER</strong> that the balance amount against your booking is <strong>pending</strong>. We would be grateful if you could arrange the balance payment at your earliest convenience to help us keep your booking and account records up to date.
                  </p>
               </div>

               <div className="w-[350px] bg-[#f8fbff] rounded-[16px] p-6 relative overflow-hidden shrink-0 border border-[#d6e4f5]">
                  <div className="flex items-start gap-4 mb-4">
                     <div className="w-[64px] h-[64px] rounded-full bg-[#1b3664] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <Bell size={32} className="text-white" fill="currentColor" />
                     </div>
                     <div className="flex flex-col">
                        <h3 className="text-[#1b3664] text-[22px] font-black leading-[1.1] tracking-tight">FIRST</h3>
                        <h3 className="text-[#1b3664] text-[22px] font-black leading-[1.1] tracking-tight">BALANCE PAYMENT</h3>
                        <h3 className="text-[#0f8b4d] text-[22px] font-black leading-[1.1] tracking-tight">REMINDER</h3>
                     </div>
                  </div>

                  <div className="w-full h-px bg-[#b8cce6] mb-4"></div>

                  <p className="text-[16px] text-[#212744] leading-[1.2] font-medium">
                     Your timely payment enables us to serve you
                     better and ensure a smooth experience
                     at the Expo.
                  </p>

                  {/* Leaves decoration */}
                  <div className="absolute -bottom-4 -right-4 w-[110px] h-[110px] opacity-90 pointer-events-none">
                     <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M60,100 C60,75 90,65 100,55 C95,75 80,95 60,100 Z" fill="#b1d2c1" />
                        <path d="M60,100 C45,80 15,65 5,35 C30,45 50,70 60,100 Z" fill="#c4dfcf" />
                        <path d="M60,100 C55,75 65,45 80,25 C75,55 65,85 60,100 Z" fill="#9ec7b2" />
                     </svg>
                  </div>
               </div>
            </div>

            {/* --- PAYMENT SUMMARY --- */}
            <div className="mb-2 relative mt-4 w-full">
               {/* Overlapping label */}
               <div className="absolute -top-2.5 left-5 bg-[#1b3664] text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wider z-10">
                  PAYMENT SUMMARY
               </div>

               <div className="border border-[#1b3664] rounded-[12px] pt-5 overflow-hidden bg-white">
                  <div className="grid grid-cols-4 divide-x divide-gray-200 px-2 pb-3">

                     <div className="flex items-center gap-2 px-2">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#f0f6ff] flex items-center justify-center text-[#1b3664] border border-blue-100 shrink-0">
                           <Receipt size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-[#1b3664] mb-0.5 tracking-wider uppercase">PROFORMA INVOICE NO.</p>
                           <p className="text-[12px] font-black text-gray-800 tracking-tight leading-none">{invoiceNo}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-2 px-2">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#f0f6ff] flex items-center justify-center text-[#1b3664] border border-blue-100 shrink-0">
                           <Banknote size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-[#1b3664] mb-0.5 tracking-wider uppercase">TOTAL AMOUNT</p>
                           <p className="text-[14px] font-black text-[#1b3664] tracking-tight leading-none">₹ {totalAmount}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-2 px-2">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#e6f4ea] flex items-center justify-center text-[#0f8b4d] border border-green-100 shrink-0">
                           <IndianRupee size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-[#0f8b4d] mb-0.5 tracking-wider uppercase">RECEIVED TILL DATE</p>
                           <p className="text-[14px] font-black text-[#0f8b4d] tracking-tight leading-none">₹ {receivedAmount}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-2 px-2">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#fef2f2] flex items-center justify-center text-[#e42e24] border border-red-100 shrink-0">
                           <IndianRupee size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-[#e42e24] mb-0.5 tracking-wider uppercase">BALANCE PAYABLE</p>
                           <p className="text-[14px] font-black text-[#e42e24] tracking-tight leading-none">₹ {amount}</p>
                        </div>
                     </div>

                  </div>

                  <div className="bg-[#f4f7fc] border-t border-gray-200 flex flex-row items-stretch justify-between h-[34px]">
                     <div className="flex items-center gap-2 px-4 flex-1">
                        <CalendarClock size={14} className="text-[#1b3664]" />
                        <p className="text-[10px] text-gray-700 font-medium">We request you to kindly make the balance payment at your earliest convenience.</p>
                     </div>
                     <div className="bg-[#1b3664] text-white flex items-center justify-center px-5 h-full font-bold text-[11px] border-t-[3px] border-[#1b3664]">
                        <span className="text-yellow-300 mr-2 font-semibold tracking-wider text-[10px] uppercase">PAYMENT DUE DATE:</span> {dueDate}
                     </div>
                  </div>
               </div>
            </div>

            {/* --- PAYMENT OPTIONS --- */}
            <div className="mb-2 relative mt-2 w-full">

               {/* Overlapping thin blue line and pill */}
               <div className="relative w-full mb-4 flex justify-center items-center">
                  <div className="absolute w-full h-px bg-[#1b3664] top-1/2 -translate-y-1/2"></div>
                  <div className="relative bg-[#1b3664] text-white text-[9px] font-bold px-4 py-1.5 rounded-full shadow-md tracking-wider uppercase z-10 whitespace-nowrap">
                     PLEASE USE ANY OF THE FOLLOWING PAYMENT OPTIONS
                  </div>
               </div>

               {/* 3 Equal Cards Container */}
               <div className="grid grid-cols-3 gap-2">

                  {/* Option 1: Bank Transfer */}
                  <div className="border border-[#bce4c8] rounded-[16px] bg-[#f9fdfa] pt-4 px-2 pb-2 relative flex flex-col items-center shadow-sm h-full">
                     <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#0f8b4d] rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm ring-2 ring-white">
                        1
                     </div>
                     <div className="mb-1 bg-[#e6f4ea] p-2 rounded-full">
                        <Landmark size={28} className="text-[#0f8b4d] mx-auto" strokeWidth={1.5} />
                     </div>
                     <h3 className="text-[#0f8b4d] font-black text-[11px] tracking-wide text-center leading-tight mb-0.5">BANK TRANSFER</h3>
                     <p className="text-[8px] text-[#0f8b4d] font-bold text-center mb-2 tracking-wider">NEFT / RTGS / IMPS</p>

                     <div className="w-full space-y-1 mb-2 px-1">
                        <div className="flex items-start gap-1.5">
                           <div className="flex justify-center mt-0.5"><div className="w-4 h-4 rounded-full border border-green-200 flex items-center justify-center bg-white"><Globe size={8} className="text-[#0f8b4d]" /></div></div>
                           <div className="grid grid-cols-[68px_10px_1fr] w-full items-start">
                              <p className="text-[11px] text-gray-700 font-semibold leading-tight">Account Name</p>
                              <p className="text-[11px] font-bold text-gray-900">:</p>
                              <p className="text-[11px] font-bold text-gray-900 leading-tight">Namo Gange Wellness<br />Pvt. Ltd.</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-1.5">
                           <div className="flex justify-center mt-0.5"><div className="w-4 h-4 rounded-full border border-green-200 flex items-center justify-center bg-white"><Landmark size={8} className="text-[#0f8b4d]" /></div></div>
                           <div className="grid grid-cols-[68px_10px_1fr] w-full items-start">
                              <p className="text-[11px] text-gray-700 font-semibold leading-tight">Bank</p>
                              <p className="text-[11px] font-bold text-gray-900">:</p>
                              <p className="text-[11px] font-bold text-gray-900 leading-tight">Kotak Mahindra Bank</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-1.5">
                           <div className="flex justify-center mt-0.5"><div className="w-4 h-4 rounded-full border border-green-200 flex items-center justify-center bg-white"><CreditCard size={8} className="text-[#0f8b4d]" /></div></div>
                           <div className="grid grid-cols-[68px_10px_1fr] w-full items-start">
                              <p className="text-[11px] text-gray-700 font-semibold leading-tight">Account No.</p>
                              <p className="text-[11px] font-bold text-gray-900">:</p>
                              <p className="text-[11px] font-bold text-gray-900 leading-tight">6812013962</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-1.5">
                           <div className="flex justify-center mt-0.5"><div className="w-4 h-4 rounded-full border border-green-200 flex items-center justify-center bg-white"><Wallet size={8} className="text-[#0f8b4d]" /></div></div>
                           <div className="grid grid-cols-[68px_10px_1fr] w-full items-start">
                              <p className="text-[11px] text-gray-700 font-semibold leading-tight">IFSC Code</p>
                              <p className="text-[11px] font-bold text-gray-900">:</p>
                              <p className="text-[11px] font-bold text-gray-900 leading-tight">KKBK0004584</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-1.5">
                           <div className="flex justify-center mt-0.5"><div className="w-4 h-4 rounded-full border border-green-200 flex items-center justify-center bg-white"><ShieldCheck size={8} className="text-[#0f8b4d]" /></div></div>
                           <div className="grid grid-cols-[68px_10px_1fr] w-full items-start">
                              <p className="text-[11px] text-gray-700 font-semibold leading-tight">Account Type</p>
                              <p className="text-[11px] font-bold text-gray-900">:</p>
                              <p className="text-[11px] font-bold text-gray-900 leading-tight">Current Account</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-1.5">
                           <div className="flex justify-center mt-0.5"><div className="w-4 h-4 rounded-full border border-green-200 flex items-center justify-center bg-white"><MapPin size={8} className="text-[#0f8b4d]" /></div></div>
                           <div className="grid grid-cols-[68px_10px_1fr] w-full items-start">
                              <p className="text-[11px] text-gray-700 font-semibold leading-tight">Branch</p>
                              <p className="text-[11px] font-bold text-gray-900">:</p>
                              <p className="text-[11px] font-bold text-gray-900 leading-tight">Connaught Place</p>
                           </div>
                        </div>
                     </div>

                     <div className="mt-auto w-full bg-[#e6f4ea] border border-[#bce4c8] p-1.5 rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#0f8b4d] shrink-0" />
                        <p className="text-[10px] text-gray-800 font-medium leading-snug">Kindly share the UTR / Transaction ID after making the payment.</p>
                     </div>
                  </div>

                  {/* Option 2: UPI */}
                  <div className="border border-blue-200 rounded-[16px] bg-[#f4f8fc] pt-4 px-2 pb-2 relative flex flex-col items-center shadow-sm h-full">
                     <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#1b3664] rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm ring-2 ring-white">
                        2
                     </div>

                     <div className="mb-1 bg-white p-1 rounded-full px-3 flex items-center justify-center shadow-sm border border-blue-100">
                        <div className="flex text-[#1b3664] font-black italic text-[28px] tracking-tighter items-center leading-none">
                           <span>UPI</span>
                           <span className="text-[#f37021] ml-1 text-[20px]">►</span>
                        </div>
                     </div>

                     <h3 className="text-[#1b3664] font-black text-[11px] tracking-wide text-center mb-1">UPI / SCAN & PAY</h3>

                     <p className="text-[10px] text-gray-600 font-bold text-center mb-0.5 uppercase">UPI ID / VPA</p>
                     <div className="border border-blue-200 bg-white px-4 py-0.5 rounded-full mb-1 shadow-sm w-full max-w-[150px]">
                        <p className="text-[#1b3664] font-bold text-[13px] tracking-wide text-center truncate">{upiId}</p>
                     </div>

                     <p className="text-[11px] text-gray-600 text-center mb-1.5 leading-snug px-2 font-medium">
                        Scan the QR Code using<br />any UPI-enabled application.
                     </p>

                     <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-1.5 w-[100px] h-[100px] flex items-center justify-center">
                        <QRCode value={`upi://pay?pa=${upiId}&pn=Namo Gange Wellness Pvt Ltd&cu=INR`} size={86} />
                     </div>

                     <div className="flex items-center justify-center gap-2 mt-auto w-full px-1 border-t border-blue-100 pt-1.5">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-[11px] object-contain" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-[13px] object-contain" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-[9px] object-contain" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/65/BHIM_logo.svg" alt="BHIM" className="h-[11px] object-contain" />
                     </div>
                  </div>

                  {/* Option 3: Online Payment */}
                  <div className="border border-orange-200 rounded-[16px] bg-[#fff9f2] pt-4 px-2 pb-2 relative flex flex-col items-center shadow-sm h-full">
                     <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#f37021] rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm ring-2 ring-white">
                        3
                     </div>

                     <div className="mb-1 bg-[#ffedd5] p-2 rounded-full">
                        <Globe size={28} className="text-[#f37021] mx-auto" strokeWidth={1.5} />
                     </div>

                     <h3 className="text-[#f37021] font-black text-[11px] tracking-wide text-center leading-tight mb-0.5">PAY ONLINE</h3>
                     <p className="text-[7.5px] text-[#1b3664] font-bold text-center mb-2 tracking-wider">SECURE PAYMENT GATEWAY</p>

                     <p className="text-[12px] text-gray-700 text-center mb-2 leading-snug font-medium px-2">
                        You can pay securely using our<br />official online payment link.
                     </p>

                     <button className="w-full max-w-[160px] bg-[#f37021] hover:bg-[#d95c14] text-white font-bold text-[12px] py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-sm mb-2 transition-colors uppercase tracking-wide">
                        <ShieldCheck size={14} />
                        PAY NOW ONLINE
                     </button>

                     <div className="w-full mt-auto">
                        <p className="text-[9px] font-bold text-[#e42e24] tracking-wider text-center border-b border-orange-200 pb-1 mb-1.5 uppercase">SUPPORTED PAYMENT MODES</p>
                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-1 px-1">
                           <div className="flex items-center gap-1">
                              <Smartphone size={12} className="text-[#1b3664]" />
                              <span className="text-[10px] font-medium text-gray-800">UPI</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <Landmark size={12} className="text-[#1b3664]" />
                              <span className="text-[10px] font-medium text-gray-800">Net Banking</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <CreditCard size={12} className="text-[#1b3664]" />
                              <span className="text-[10px] font-medium text-gray-800">Credit Card</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <Wallet size={12} className="text-[#1b3664]" />
                              <span className="text-[10px] font-medium text-gray-800">Wallets</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <CreditCard size={12} className="text-[#1b3664]" />
                              <span className="text-[10px] font-medium text-gray-800">Debit Card</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <Globe size={12} className="text-[#1b3664]" />
                              <span className="text-[10px] font-medium text-gray-800">Other Modes</span>
                           </div>
                        </div>
                     </div>

                     <p className="text-[10px] text-gray-800 text-center mt-2 font-medium leading-snug">
                        This is a secure payment gateway<br />powered by trusted partners.
                     </p>
                  </div>

               </div>
            </div>

            {/* --- IMPORTANT NOTE BANNER --- */}
            <div className="bg-[#f4f7fc] border border-blue-100 rounded-lg px-3 py-2 flex items-start gap-3 mb-2 w-full">
               <div className="w-6 h-6 rounded-full bg-[#1b3664] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <span className="font-serif font-bold italic text-sm leading-none">i</span>
               </div>
               <div>
                  <h4 className="text-[#1b3664] font-bold text-[10px] tracking-wider mb-0.5 uppercase">IMPORTANT NOTE</h4>
                  <p className="text-[11px] text-gray-800 font-medium leading-snug">
                     If you have already made the payment, kindly ignore this reminder
                     and share the UTR / Transaction ID with our Accounts Team for reconciliation.
                  </p>
               </div>
            </div>

            {/* --- FOOTER CONTACT & SECURITY --- */}
            <div className="flex flex-row justify-between border-t border-gray-200 p-2 w-full">
               <div className="flex flex-col">
                  <p className="text-[11px] font-bold text-gray-800 mb-1">Warm Regards,</p>
                  <p className="text-[11px] font-bold text-[#1b3664]">Mohit Tyagi</p>
                  <p className="text-[11px] font-bold text-[#1b3664]">Manager  Department</p>
                  <p className="text-[11px] font-bold text-[#1b3664]">Namo Gange Wellness Pvt. Ltd.</p>
               </div>

               <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                     <Phone size={12} className="text-[#1b3664] shrink-0" />
                     <p className="text-[10px] text-gray-900 font-bold">+91 96549 00525</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <Mail size={12} className="text-[#1b3664] shrink-0" />
                     <p className="text-[10px] text-gray-900 font-bold">accounts@namogangewellness.com</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <Globe size={12} className="text-[#1b3664] shrink-0" />
                     <p className="text-[10px] text-gray-900 font-bold">www.ihwe.in</p>
                  </div>

               </div>

               <div className="bg-[#f0fdf4] border border-green-200 rounded-md h-fit p-1.5 flex items-start gap-1.5 max-w-[170px] shrink-0 shadow-sm">
                  <ShieldCheck size={14} className="text-[#0f8b4d] shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[10px] text-gray-700 leading-[1.2]">
                     <strong className="text-[#0f8b4d] block mb-0.5">OFFICIAL & SECURE</strong>
                     Pay only through our official bank, verified UPI, or payment link.
                  </p>
               </div>
            </div>
         </div>

         {/* --- BOTTOM BANNER --- */}
         <div className="bg-white border-t border-gray-200 px-8 py-2 flex flex-row items-center justify-between w-full mt-auto rounded-b-[16px]">



            {/* Center: Links */}
            <div className="flex flex-row items-start gap-1.5 pl-6 flex-1 text-[12px] text-gray-900 font-medium tracking-wide">

               <span>Healthcare</span><span className="text-gray-700 mx-3 font-medium">|</span>
               <span>Wellness</span><span className="text-gray-700 mx-3 font-medium">|</span>
               <span>Nutrition</span><span className="text-gray-700 mx-3 font-medium">|</span>
               <span>Research</span>


               <span>Events</span><span className="text-gray-700 mx-3 font-medium">|</span>
               <span>Conferences</span><span className="text-gray-700 mx-3 font-medium">|</span>
               <span>Awards</span>
            </div>


            {/* Right: Socials */}
            <div className="flex flex-col items-start shrink-0">
               <p className="text-[9px] font-black mb-1.5 tracking-widest text-[#1b3664]">FOLLOW US</p>
               <div className="flex gap-2.5">
                  <div className="w-[24px] h-[24px] rounded-full bg-[#3b5998] flex items-center justify-center shadow-sm">
                     <Facebook size={12} className="text-white" />
                  </div>
                  <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center shadow-sm">
                     <Instagram size={12} className="text-white" />
                  </div>
                  <div className="w-[24px] h-[24px] rounded-full bg-[#007bb5] flex items-center justify-center shadow-sm">
                     <Linkedin size={12} className="text-white" />
                  </div>
                  <div className="w-[24px] h-[24px] rounded-full bg-[#ff0000] flex items-center justify-center shadow-sm">
                     <Youtube size={12} className="text-white" />
                  </div>
               </div>
            </div>
         </div>

      </div>
   );
}
