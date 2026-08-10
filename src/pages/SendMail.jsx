import React from 'react';
import QRCode from "react-qr-code";
import {
  Paperclip,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Landmark,
  CreditCard,
  Wallet,
  FileText,
  Banknote,
  IndianRupee,
  CalendarClock,
  Info,
  Download,
  Users,
  Building2,
  Smartphone,
  Lock,
  User,
  Hash
} from "lucide-react";
import firstheader from "../assets/firstheade1.png";

export default function SendMail() {
  const amount = "81,820";
  const totalAmount = "1,16,820";
  const receivedAmount = "35,000";
  const upiId = "ihwe.collect@kotak";
  const companyName = "Rohit Kumar";
  const invoiceNo = "PI/26-27/0123";
  const dueDate = "20th Aug 2026";

  return (
    <div className="w-[794px] h-[1123px] mx-auto bg-white font-sans text-gray-800 shadow-2xl relative overflow-hidden box-border">
      {/* HEADER IMAGE - Exact reproduction */}
      <img src={firstheader} alt="Header" className="w-full object-cover" />

      {/* BODY CONTENT - Wrapped to match Image 2 margins/padding */}
      <div className="px-[24px] pt-[12px] flex flex-col h-full gap-y-3">

        {/* --- INTRO SECTION --- */}
        <div className="flex flex-row justify-between w-full">
          {/* Left Intro Text */}
          <div className="w-[49%] flex flex-col pt-1">
            <h3 className="text-[14px] font-bold text-[#1b3664] mb-1">Dear {companyName},</h3>
            <h2 className="text-[15px] font-bold text-[#f37021] mb-2">Namo Gange Namaskar!</h2>

            <p className="text-[11px] text-[#2d3748] mb-3 leading-[1.5] text-justify font-medium">
              Thank you for choosing to participate in the <br />
              <strong className="text-gray-900">9th International Health & Wellness Expo 2026 – Global Edition.</strong><br />
              We are delighted to welcome your esteemed organization as part of<br />
              this prestigious industry platform.
            </p>

            <p className="text-[11px] text-[#2d3748] mb-3 leading-[1.5] text-justify font-medium">
              Please find your Proforma Invoice attached for your reference.
            </p>

            <p className="text-[11px] text-[#2d3748] mb-3 leading-[1.5] text-justify font-medium">
              Kindly review the details and make the payment through any of the<br />
              secure payment options provided below to confirm your participation.
            </p>

            <p className="text-[11px] text-[#2d3748] mb-1 leading-[1.5] text-justify font-medium">
              We look forward to welcoming you at Pragati Maidan, New Delhi,<br />
              from 21 – 23 August 2026.
            </p>
          </div>

          {/* Right Cards */}
          <div className="w-[49%] flex flex-col gap-2.5">
            {/* Card 1: Invoice Attached */}
            <div className="border border-[#bce4c8] rounded-[6px] bg-[#f8fdfa] p-3 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full border border-[#a3d5b9] flex items-center justify-center shrink-0 bg-white">
                  <Paperclip size={16} className="text-[#0f8b4d]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#1b3664] leading-tight mb-0.5">PROFORMA INVOICE ATTACHED</p>
                  <p className="text-[9px] text-gray-700 leading-tight">Please find the Proforma Invoice attached<br />with this email for your reference and records.</p>
                </div>
              </div>
              <div className="w-full h-px bg-[#d6e4f5] mb-2"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-7 border border-gray-300 rounded-[3px] bg-white flex flex-col items-center justify-end overflow-hidden shadow-sm relative">
                    <div className="absolute top-0 right-0 w-2 h-2 border-b border-l border-gray-300 bg-gray-100"></div>
                    <span className="bg-[#e42e24] text-white font-bold text-[5px] px-[2px] py-[1px] w-full text-center">PDF</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-900 leading-none mb-0.5">PI-26-27/0123.pdf</p>
                    <p className="text-[8px] text-gray-500 leading-none">(215 KB)</p>
                  </div>
                </div>
                <button className="bg-[#0f8b4d] text-white text-[8px] font-bold px-2 py-1.5 rounded flex items-center gap-1 shadow-sm tracking-wide">
                  <Download size={10} strokeWidth={2.5} />
                  DOWNLOAD INVOICE
                </button>
              </div>
            </div>

            {/* Card 2: Payment Plan */}
            <div className="border border-[#bce4c8] rounded-[6px] bg-[#f8fdfa] p-3 shadow-sm flex items-center justify-between h-[52px]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-[#a3d5b9] flex items-center justify-center shrink-0 bg-white">
                  <CalendarClock size={16} className="text-[#0f8b4d]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#1b3664] leading-tight mb-0.5">PAYMENT PLAN</p>
                  <p className="text-[8.5px] text-gray-600 leading-tight">You have opted for</p>
                  <p className="text-[8.5px] text-[#0f8b4d] font-bold leading-tight">INSTALLMENT PLAN</p>
                </div>
              </div>
              <div className="text-right border-l border-[#d6e4f5] pl-3 h-full flex flex-col justify-center">
                <p className="text-[9px] text-[#1b3664] font-medium leading-tight mb-0.5">Total Amount</p>
                <p className="text-[16px] text-[#1b3664] font-black leading-none">₹ {totalAmount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- PAYMENT SUMMARY --- */}
        <div className="w-full relative mt-1">
          <div className="absolute -top-2 left-4 bg-[#1b3664] text-white text-[8px] font-bold px-3 py-0.5 rounded-[4px] shadow-sm tracking-wider uppercase z-10">
            PAYMENT SUMMARY
          </div>
          <div className="border border-[#b8cce6] rounded-[6px] bg-white flex h-[50px] overflow-hidden shadow-sm pt-2">
            <div className="flex-1 grid grid-cols-4 divide-x divide-[#d6e4f5] px-1 py-1">

              <div className="flex items-center gap-1.5 px-2">
                <FileText size={18} className="text-[#5a6b8c] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <p className="text-[6.5px] font-bold text-[#1b3664] mb-0.5">PROFORMA INVOICE NO.</p>
                  <p className="text-[11px] font-black text-gray-900 leading-none">{invoiceNo}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2">
                <Banknote size={18} className="text-[#5a6b8c] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <p className="text-[6.5px] font-bold text-[#1b3664] mb-0.5">TOTAL INVOICE AMOUNT</p>
                  <p className="text-[11px] font-black text-[#1b3664] leading-none">₹ {totalAmount}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2">
                <IndianRupee size={18} className="text-[#0f8b4d] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <p className="text-[6.5px] font-bold text-[#1b3664] mb-0.5">AMOUNT RECEIVED</p>
                  <p className="text-[11px] font-black text-[#0f8b4d] leading-none">₹ {receivedAmount}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2">
                <div className="w-5 h-5 rounded-full border-[1.5px] border-[#e42e24] flex items-center justify-center shrink-0">
                  <IndianRupee size={10} className="text-[#e42e24]" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[6.5px] font-bold text-[#1b3664] mb-0.5">BALANCE PAYABLE</p>
                  <p className="text-[11px] font-black text-[#e42e24] leading-none">₹ {amount}</p>
                </div>
              </div>

            </div>

            <div className="w-[160px] shrink-0 flex items-stretch border-l border-[#b8cce6] bg-[#f4f8fc]">
              <div className="flex-1 p-1 flex items-center justify-center">
                <p className="text-[6px] text-gray-700 font-medium leading-[1.2] text-center px-1">Kindly make the payment at your earliest convenience to confirm your booking.</p>
              </div>
              <div className="bg-[#1b3664] text-white flex flex-col justify-center items-center px-2 min-w-[70px]">
                <p className="text-[6px] text-white font-bold mb-0.5">PAYMENT REF</p>
                <p className="text-[9px] text-white font-black leading-none">{invoiceNo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN LOWER SECTION (Table + Payment Options) --- */}
        <div className="flex flex-row gap-2 h-[260px] mt-1">

          {/* LEFT: INSTALLMENT TABLE (Approx 45%) */}
          <div className="w-[45%] h-full flex flex-col border border-[#bce4c8] rounded-[8px] overflow-hidden bg-white shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-[#bce4c8]">
              <h3 className="text-[11px] font-bold text-[#145a32]">INSTALLMENT PAYMENT SCHEDULE</h3>
              <span className="bg-[#e9f2eb] text-[#145a32] text-[7.5px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">INSTALLMENT PLAN SELECTED</span>
            </div>

            <table className="w-full text-center text-[9px]">
              <thead className="bg-[#f2f4f2] text-gray-800 border-b border-[#bce4c8]">
                <tr className="divide-x divide-gray-200">
                  <th className="py-2.5 px-1 font-bold">INSTALMENT</th>
                  <th className="py-2.5 px-1 font-bold">DUE DATE</th>
                  <th className="py-2.5 px-1 font-bold">PERCENTAGE</th>
                  <th className="py-2.5 px-1 font-bold">AMOUNT (₹)</th>
                  <th className="py-2.5 px-1 font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800 font-medium">
                <tr className="divide-x divide-gray-200">
                  <td className="py-2.5 px-1">1st Instalment</td>
                  <td className="py-2.5 px-1">At the time of Booking</td>
                  <td className="py-2.5 px-1 font-bold">30%</td>
                  <td className="py-2.5 px-1 font-bold">35,000</td>
                  <td className="py-2.5 px-1">
                    <span className="inline-flex items-center gap-1 text-[#0f8b4d] font-bold text-[8.5px]">
                      <CheckCircle2 size={12} strokeWidth={2.5} /> Paid
                    </span>
                  </td>
                </tr>
                <tr className="divide-x divide-gray-200">
                  <td className="py-2.5 px-1">2nd Instalment</td>
                  <td className="py-2.5 px-1">On or before 15 May 2026</td>
                  <td className="py-2.5 px-1 font-bold">30%</td>
                  <td className="py-2.5 px-1 font-bold">35,000</td>
                  <td className="py-2.5 px-1">
                    <span className="inline-flex items-center gap-1 text-[#f37021] font-bold text-[8.5px]">
                      <div className="w-3 h-3 rounded-full border-[1.5px] border-[#f37021]"></div> Pending
                    </span>
                  </td>
                </tr>
                <tr className="divide-x divide-gray-200">
                  <td className="py-2.5 px-1">3rd Instalment</td>
                  <td className="py-2.5 px-1">On or before 15 June 2026</td>
                  <td className="py-2.5 px-1 font-bold">20%</td>
                  <td className="py-2.5 px-1 font-bold">23,364</td>
                  <td className="py-2.5 px-1">
                    <span className="inline-flex items-center gap-1 text-[#f37021] font-bold text-[8.5px]">
                      <div className="w-3 h-3 rounded-full border-[1.5px] border-[#f37021]"></div> Pending
                    </span>
                  </td>
                </tr>
                <tr className="divide-x divide-gray-200">
                  <td className="py-2.5 px-1">4th Instalment</td>
                  <td className="py-2.5 px-1">On or before 15 July 2026</td>
                  <td className="py-2.5 px-1 font-bold">20%</td>
                  <td className="py-2.5 px-1 font-bold">23,456</td>
                  <td className="py-2.5 px-1">
                    <span className="inline-flex items-center gap-1 text-[#f37021] font-bold text-[8.5px]">
                      <div className="w-3 h-3 rounded-full border-[1.5px] border-[#f37021]"></div> Pending
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-white border-t border-[#bce4c8] font-bold text-gray-900">
                <tr className="divide-x divide-gray-200">
                  <td colSpan="2" className="py-2.5 px-1 text-center pr-12">TOTAL</td>
                  <td className="py-2.5 px-1">100%</td>
                  <td className="py-2.5 px-1">1,16,820</td>
                  <td className="py-2.5 px-1 bg-[#fbfdfc]"></td>
                </tr>
              </tfoot>
            </table>

            <div className="bg-[#f0f9f3] p-1.5 text-center text-[7.5px] text-[#0f8b4d] font-medium shrink-0 mt-auto border-t border-[#bce4c8]">
              Note: Timely payments ensure smooth processing and confirmation of your participation.
            </div>
          </div>

          {/* RIGHT: PAYMENT OPTIONS (Approx 55%) */}
          <div className="w-[55%] h-full relative pt-[10px]">
            {/* The Floating Header */}
            <div className="absolute top-0 w-full flex justify-center z-10">
              <div className="bg-[#1b3664] text-white text-[9px] font-bold px-12 py-1 rounded-[4px] shadow-sm tracking-widest uppercase">
                PLEASE USE ANY OF THE FOLLOWING PAYMENT OPTIONS
              </div>
            </div>

            {/* The 3 Columns Card */}
            <div className="border border-gray-200 rounded-[8px] w-full h-full bg-white shadow-sm flex flex-row pt-4 pb-2 px-1 divide-x divide-gray-200 overflow-hidden">

              {/* 1. BANK TRANSFER */}
              <div className="flex-1 flex flex-col items-center px-1">
                <div className="flex items-center gap-1 mb-1 mt-1">
                  <div className="w-4 h-4 bg-[#0f8b4d] rounded-full flex items-center justify-center text-white font-bold text-[9px]">1</div>
                  <Landmark size={20} className="text-[#0f8b4d]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[#0f8b4d] font-bold text-[9px] text-center leading-none mb-0.5">BANK TRANSFER</h3>
                <p className="text-[7px] text-[#1b3664] font-bold text-center tracking-widest mb-3">NEFT / RTGS / IMPS</p>

                <div className="w-full flex flex-col gap-1.5 flex-1 px-1">
                  <div className="flex items-start gap-1">
                    <User size={9} className="text-[#0f8b4d] mt-[1px] shrink-0" />
                    <div className="grid grid-cols-[38px_4px_1fr] w-full items-start">
                      <p className="text-[6.5px] text-gray-700 font-medium">Account<br />Name</p>
                      <p className="text-[6.5px] font-bold">:</p>
                      <p className="text-[6.5px] font-bold text-gray-900 leading-tight">Namo Gange<br />Wellness Pvt. Ltd.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1">
                    <Landmark size={9} className="text-[#0f8b4d] mt-[1px] shrink-0" />
                    <div className="grid grid-cols-[38px_4px_1fr] w-full items-start">
                      <p className="text-[6.5px] text-gray-700 font-medium">Bank</p>
                      <p className="text-[6.5px] font-bold">:</p>
                      <p className="text-[6.5px] font-bold text-gray-900 leading-tight">Kotak Mahindra Bank</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1">
                    <Hash size={9} className="text-[#0f8b4d] mt-[1px] shrink-0" />
                    <div className="grid grid-cols-[38px_4px_1fr] w-full items-start">
                      <p className="text-[6.5px] text-gray-700 font-medium">Account No.</p>
                      <p className="text-[6.5px] font-bold">:</p>
                      <p className="text-[6.5px] font-bold text-gray-900 leading-tight">6812013962</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1">
                    <CreditCard size={9} className="text-[#0f8b4d] mt-[1px] shrink-0" />
                    <div className="grid grid-cols-[38px_4px_1fr] w-full items-start">
                      <p className="text-[6.5px] text-gray-700 font-medium">IFSC Code</p>
                      <p className="text-[6.5px] font-bold">:</p>
                      <p className="text-[6.5px] font-bold text-gray-900 leading-tight">KKBK0004584</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1">
                    <ShieldCheck size={9} className="text-[#0f8b4d] mt-[1px] shrink-0" />
                    <div className="grid grid-cols-[38px_4px_1fr] w-full items-start">
                      <p className="text-[6.5px] text-gray-700 font-medium">Account<br />Type</p>
                      <p className="text-[6.5px] font-bold">:</p>
                      <p className="text-[6.5px] font-bold text-gray-900 leading-tight mt-[1px]">Current Account</p>
                    </div>
                  </div>
                </div>

                <div className="w-[95%] bg-[#f0f9f3] p-1.5 rounded-[4px] flex items-center gap-1.5 border border-[#bce4c8] mt-2 mb-1">
                  <ShieldCheck size={10} className="text-[#0f8b4d] shrink-0" />
                  <p className="text-[5px] text-[#0f8b4d] leading-[1.2] font-medium">Kindly share the UTR / Transaction<br />ID after making the payment.</p>
                </div>
              </div>

              {/* 2. UPI */}
              <div className="flex-1 flex flex-col items-center px-1">
                <div className="flex items-center gap-1 mb-1 mt-1">
                  <div className="w-4 h-4 bg-[#1b3664] rounded-full flex items-center justify-center text-white font-bold text-[9px]">2</div>
                  <div className="flex items-center gap-[1px]">
                    <span className="text-[#1b3664] font-black text-[20px] italic tracking-tighter leading-none">UPI</span>
                    <div className="flex flex-col gap-[1px] mt-1">
                      <div className="w-1.5 h-1.5 rounded-tl-[2px] bg-[#e42e24]"></div>
                      <div className="w-1.5 h-1.5 rounded-bl-[2px] bg-[#0f8b4d]"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-[#1b3664] font-bold text-[9px] text-center leading-none mb-3">UPI / SCAN & PAY</h3>

                <p className="text-[6px] text-gray-500 mb-0.5 uppercase tracking-wide">UPI ID / VPA</p>
                <div className="border border-blue-200 rounded-full px-3 py-1 w-[85%] text-center mb-1.5 shadow-sm">
                  <p className="text-[9px] font-bold text-[#1b3664]">{upiId}</p>
                </div>

                <p className="text-[6px] text-gray-700 text-center leading-[1.2] mb-1.5 w-[85%]">Scan the QR Code using<br />any UPI-enabled application.</p>

                <div className="p-1 border border-gray-300 rounded-[6px] shadow-sm mb-1 bg-white">
                  <QRCode value={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(companyName)}&cu=INR`} size={58} level="M" />
                </div>

                <div className="flex items-center justify-center gap-2 mt-auto w-full pb-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-[9px] object-contain" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-[12px] object-contain" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-[8px] object-contain" />
                  <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/bhim-upi-icon.svg" alt="BHIM" className="h-[12px] object-contain" />
                </div>
              </div>

              {/* 3. PAY ONLINE */}
              <div className="flex-1 flex flex-col items-center px-1">
                <div className="flex items-center gap-1 mb-1 mt-1">
                  <div className="w-4 h-4 bg-[#f37021] rounded-full flex items-center justify-center text-white font-bold text-[9px]">3</div>
                  <Globe size={20} className="text-[#f37021]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[#f37021] font-bold text-[9px] text-center leading-none mb-1">PAY ONLINE</h3>
                <p className="text-[6px] text-[#1b3664] font-bold text-center tracking-widest leading-none mb-3">SECURE PAYMENT GATEWAY</p>

                <p className="text-[6.5px] text-gray-700 text-center leading-[1.2] mb-2.5 w-[85%]">
                  You can pay securely using our<br />official online payment link.
                </p>

                <button className="bg-[#f37021] text-white w-[85%] py-1.5 rounded-[4px] text-[8px] font-bold flex items-center justify-center gap-1 shadow-sm mb-3 hover:bg-[#d95d16] transition-colors">
                  <Lock size={9} strokeWidth={2.5} /> PAY NOW ONLINE
                </button>

                <div className="w-[90%] border border-orange-200 rounded-[4px] px-1 pb-1 flex flex-col items-center relative pt-2.5">
                  <div className="absolute -top-[5px] bg-white px-1 text-[5px] text-[#f37021] font-bold tracking-widest whitespace-nowrap">SUPPORTED PAYMENT MODES</div>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-1 w-full pl-2">
                    <div className="flex items-center gap-1.5 text-[5.5px] text-[#1b3664] font-semibold"><Smartphone size={7} className="text-[#1b3664]" /> UPI</div>
                    <div className="flex items-center gap-1.5 text-[5.5px] text-[#1b3664] font-semibold"><Building2 size={7} className="text-[#1b3664]" /> Net Banking</div>
                    <div className="flex items-center gap-1.5 text-[5.5px] text-[#1b3664] font-semibold"><CreditCard size={7} className="text-[#1b3664]" /> Credit Card</div>
                    <div className="flex items-center gap-1.5 text-[5.5px] text-[#1b3664] font-semibold"><Wallet size={7} className="text-[#1b3664]" /> Wallets</div>
                    <div className="flex items-center gap-1.5 text-[5.5px] text-[#1b3664] font-semibold"><CreditCard size={7} className="text-[#1b3664]" /> Debit Card</div>
                    <div className="flex items-center gap-1.5 text-[5.5px] text-[#1b3664] font-semibold"><Globe size={7} className="text-[#1b3664]" /> Other Modes</div>
                  </div>
                </div>

                <p className="text-[4.5px] text-gray-500 text-center leading-[1.2] mt-auto pb-1 w-[80%]">
                  This is a secure payment gateway<br />powered by trusted partners.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* --- IMPORTANT NOTE & CONTACT (Footer) --- */}
        <div className="grid grid-cols-[200px_1fr_200px] gap-3 mt-auto pb-2 h-[70px]">
          {/* Left: Important Note */}
          <div className="flex items-start gap-2 h-full bg-[#f8fbff] rounded-[6px] border border-[#d6e4f5] p-2.5 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-[#1b3664] flex items-center justify-center shrink-0">
              <Info size={12} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#1b3664] mb-0.5 tracking-wide">IMPORTANT NOTE</p>
              <p className="text-[6.5px] text-gray-700 leading-[1.3] font-medium">
                Please make payments only through our official bank account, verified UPI/QR Code or official payment link shared in this email.
              </p>
            </div>
          </div>

          {/* Center: Accounts Contact */}
          <div className="flex flex-row items-center justify-between h-full px-2">
            <div className="flex flex-col">
              <p className="text-[7.5px] text-gray-700 mb-0.5">Warm Regards,</p>
              <p className="text-[9.5px] font-bold text-[#1b3664]">Accounts Team</p>
              <p className="text-[8px] font-bold text-gray-800 my-0.5">Namo Gange Wellness Pvt. Ltd.</p>
              <p className="text-[7px] text-gray-600 font-medium">Organiser – 9th International<br />Health & Wellness Expo 2026</p>
            </div>

            <div className="flex flex-col gap-1 pl-4 border-l border-gray-300">
              <div className="flex items-center gap-1.5">
                <Phone size={9} className="text-[#1b3664] shrink-0" />
                <p className="text-[7.5px] text-gray-800 font-medium">+91 96549 00525</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={9} className="text-[#1b3664] shrink-0" />
                <p className="text-[7.5px] text-gray-800 font-medium">accounts@namogangewellness.com</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={9} className="text-[#1b3664] shrink-0" />
                <p className="text-[7.5px] text-gray-800 font-medium">www.ihwe.in</p>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin size={9} className="text-[#1b3664] shrink-0 mt-0.5" />
                <p className="text-[7.5px] text-gray-800 leading-tight font-medium">Pragati Maidan, New Delhi –<br />110001, India</p>
              </div>
            </div>
          </div>

          {/* Right: Official & Secure */}
          <div className="flex items-start gap-2 h-full bg-[#f0f9f3] rounded-[6px] border border-[#bce4c8] p-2.5 shadow-sm">
            <ShieldCheck size={18} className="text-[#0f8b4d] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-[9px] font-bold text-[#0f8b4d] mb-0.5 tracking-wide">OFFICIAL & SECURE</p>
              <p className="text-[6.5px] text-gray-700 leading-[1.3] font-medium">
                Please make payments only through our official bank account, verified UPI/QR Code or official payment link shared in this email.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
