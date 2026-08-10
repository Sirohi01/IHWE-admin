import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
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
   CalendarClock,
   Info,
   User,
   Hash,
   Lock
} from "lucide-react";
import namogangelogo from "../assets/namogangelogo1.webp";
import ihwelogo from "../assets/9th_certificate/9thlogo.png";
import firstheader from "../assets/firstheade1.png";

export default function PaymentMail() {
   const { eventId } = useParams();
   const [searchParams] = useSearchParams();
   const clientId = searchParams.get('clientId');

   const [loading, setLoading] = useState(true);
   const [clientData, setClientData] = useState(null);
   const [proformaInvoice, setProformaInvoice] = useState(null);
   const [paymentPlans, setPaymentPlans] = useState([]);
   const [payments, setPayments] = useState([]);
   const [totalReceived, setTotalReceived] = useState(0);

   const [currentInstallment, setCurrentInstallment] = useState(null);
   const [processedPlans, setProcessedPlans] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         if (!clientId || !eventId) return;
         setLoading(true);
         try {
            const clientRes = await api.get(`/api/account-overview/${clientId}`);
            setClientData(clientRes.data?.data || clientRes.data);

            const crmEventRes = await api.get(`/api/crm-events/${eventId}`);
            const regEventId = crmEventRes.data?.registrationEventId || crmEventRes.data?.data?.registrationEventId || crmEventRes.data?.data?.event?._id;
            if (regEventId) {
               const eventRes = await api.get(`/api/events/${regEventId}`);
               setPaymentPlans(eventRes.data?.data?.paymentPlans || []);
            }

            const estRes = await api.get(`/api/estimates/grouped/${clientId}`);
            const estimates = estRes.data?.data || [];
            setProformaInvoice(estimates.length > 0 ? estimates[0] : null);

            const pmtRes = await api.get('/api/payments');
            const allPmts = pmtRes.data?.data || pmtRes.data || [];
            const clientPmts = allPmts.filter(p => String(p.companyId) === String(clientId) || String(p.company_id) === String(clientId) || String(p.account_id) === String(clientId));
            setPayments(clientPmts);

            const received = clientPmts.reduce((sum, p) => sum + (Number(p.amount_text || p.f_amount || p.amount) || 0), 0);
            setTotalReceived(received);
         } catch (err) {
            console.error("Error fetching reminder data", err);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [clientId, eventId]);

   useEffect(() => {
      if (!proformaInvoice || paymentPlans.length === 0) return;

      const totalAmountVal = Number(proformaInvoice.finalAmount || proformaInvoice.total_value || 0);
      let runningReceived = totalReceived;
      let nextDueFound = false;
      let currInstal = null;

      const labels = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH"];
      
      const plans = paymentPlans
         .filter(p => Number(p.percentage) > 0 && Number(p.percentage) <= 100)
         .map((plan, index) => {
            const installmentAmount = (totalAmountVal * Number(plan.percentage)) / 100;
            let status = 'Pending';
            
            if (runningReceived >= installmentAmount - 1) {
               status = 'Paid';
               runningReceived -= installmentAmount;
            } else {
               status = 'Pending';
               if (!nextDueFound) {
                  nextDueFound = true;
                  currInstal = {
                     ...plan,
                     label: labels[index] || "NEXT",
                     dueAmount: installmentAmount - Math.max(0, runningReceived),
                     fullAmount: installmentAmount
                  };
                  runningReceived = 0;
               }
            }
            
            return {
               ...plan,
               index,
               installmentAmount,
               status
            };
         });
         
      setProcessedPlans(plans);
      setCurrentInstallment(currInstal);
   }, [proformaInvoice, paymentPlans, totalReceived]);

   const formatCurrency = (val) => new Intl.NumberFormat('en-IN').format(Math.round(val || 0));

   const totalAmount = proformaInvoice ? formatCurrency(proformaInvoice.finalAmount || proformaInvoice.total_value) : "0";
   const amount = currentInstallment ? formatCurrency(currentInstallment.dueAmount) : "0";
   const receivedAmount = formatCurrency(totalReceived);
   
   const companyName = clientData?.companyInfo?.name || clientData?.companyName || clientData?.exhibitorName || "Client Name";
   const invoiceNo = proformaInvoice?.est_no || "N/A";
   const upiId = "ihwe.collect@kotak";

   if (loading) {
       return <div className="p-8 text-center text-gray-500 font-medium">Loading Reminder Data...</div>;
   }

   return (
      <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
         {/* Action Bar */}
         <div className="w-full max-w-[794px] flex justify-end mb-4 print:hidden">
             <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-bold transition">
                 <Mail size={16} />
                 Send Reminder Email
             </button>
         </div>

         <div className="w-full max-w-[794px] mx-auto bg-white font-sans text-gray-800 shadow-2xl relative my-2 print:my-0 print:shadow-none flex flex-col">
         {/* --- HEADER SECTION --- */}
         <div className="w-full">
            <img src={firstheader} alt="Header" className="w-full h-auto block" />
         </div>

         <div className="px-8 mt-2 flex-grow flex flex-col">
            {/* --- BODY TEXT & REMINDER BOX --- */}
            <div className="flex flex-row justify-between mb-4 w-full">
               <div className="flex-1 pr-4">
                  <h3 className="text-[17px] font-bold text-[#1b3664] mb-1">Dear {companyName},</h3>
                  <h2 className="text-[19px] font-bold text-[#f37021] mb-1">Namo Gange Namaskar!</h2>
                  <p className="text-[13px] text-[#2d3748] mb-3 leading-[1.6] text-justify">
                     Thank you for confirming your participation in the <strong>9th International Health & Wellness Expo 2026 (IHWE – 2026), PRAGATI MAIDAN, NEW DELHI, INDIA</strong>.
                  </p>
                  <p className="text-[13px] text-[#2d3748] leading-[1.6] text-justify">
                     This is a gentle <strong className="text-[#0f8b4d]">{currentInstallment?.label || "NEXT"} REMINDER</strong> that the balance amount against your booking is <strong>pending</strong>. We would be grateful if you could arrange the balance payment at your earliest convenience to help us keep your booking and account records up to date.
                  </p>
               </div>

               <div className="w-[350px] bg-[#f8fbff] rounded-[16px] p-6 relative overflow-hidden shrink-0 border border-[#d6e4f5]">
                  <div className="flex items-start gap-4 mb-4">
                     <div className="w-[64px] h-[64px] rounded-full bg-[#1b3664] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <Bell size={32} className="text-white" fill="currentColor" />
                     </div>
                     <div className="flex flex-col">
                        <h3 className="text-[#1b3664] text-[22px] font-black leading-[1.1] tracking-tight uppercase">{currentInstallment?.label || "NEXT"}</h3>
                        <h3 className="text-[#1b3664] text-[22px] font-black leading-[1.1] tracking-tight">BALANCE PAYMENT</h3>
                        <h3 className="text-[#0f8b4d] text-[22px] font-black leading-[1.1] tracking-tight">REMINDER</h3>
                     </div>
                  </div>

                  <div className="w-full h-px bg-[#b8cce6] mb-4"></div>

                  <p className="text-[16px] text-[#212744] leading-[1.2] font-medium">
                     Your timely payment enables us to serve you better and ensure a smooth experience at the Expo.
                  </p>
               </div>
            </div>

            {/* --- PAYMENT SUMMARY --- */}
            <div className="mb-2 relative mt-4 w-full border border-[#1b3664] rounded-[12px] pt-5 bg-white">
               {/* Overlapping label */}
               <div className="absolute -top-2.5 left-5 bg-[#1b3664] text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wider z-10">
                  PAYMENT SUMMARY
               </div>

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
                        <p className="text-[9px] font-bold text-[#e42e24] mb-0.5 tracking-wider uppercase">DUE INSTALLMENT</p>
                        <p className="text-[14px] font-black text-[#e42e24] tracking-tight leading-none">₹ {amount}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* --- MAIN LOWER SECTION (Table + Payment Options) --- */}
            <div className="flex flex-row gap-2 h-[260px] mt-2 mb-2">
               {/* LEFT: INSTALLMENT TABLE (Approx 45%) */}
               <div className="w-[45%] h-full flex flex-col border border-[#bce4c8] rounded-[8px] overflow-hidden bg-white shadow-sm">
                  <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-[#bce4c8]">
                     <h3 className="text-[11px] font-bold text-[#145a32]">INSTALLMENT PAYMENT SCHEDULE</h3>
                     <span className="bg-[#e9f2eb] text-[#145a32] text-[7.5px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">SELECTED PLAN</span>
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
                        {processedPlans.length > 0 ? (
                           processedPlans.map((plan, i) => (
                              <tr key={i} className="divide-x divide-gray-200">
                                 <td className="py-2.5 px-1">{i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Instalment</td>
                                 <td className="py-2.5 px-1">{plan.date ? new Date(plan.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'As per schedule'}</td>
                                 <td className="py-2.5 px-1 font-bold">{plan.percentage}%</td>
                                 <td className="py-2.5 px-1 font-bold">{formatCurrency(plan.installmentAmount)}</td>
                                 <td className="py-2.5 px-1">
                                    {plan.status === 'Paid' ? (
                                       <span className="inline-flex items-center gap-1 text-[#0f8b4d] font-bold text-[8.5px]">
                                          <CheckCircle2 size={12} strokeWidth={2.5} /> Paid
                                       </span>
                                    ) : (
                                       <span className="inline-flex items-center gap-1 text-[#f37021] font-bold text-[8.5px]">
                                          <div className="w-3 h-3 rounded-full border-[1.5px] border-[#f37021]"></div> Pending
                                       </span>
                                    )}
                                 </td>
                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td colSpan="5" className="py-4 text-gray-500">No payment plans found.</td>
                           </tr>
                        )}
                     </tbody>
                     <tfoot className="bg-white border-t border-[#bce4c8] font-bold text-gray-900 mt-auto">
                        <tr className="divide-x divide-gray-200">
                           <td colSpan="2" className="py-2.5 px-1 text-center pr-12">TOTAL</td>
                           <td className="py-2.5 px-1">100%</td>
                           <td className="py-2.5 px-1">{totalAmount}</td>
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
            <div className="grid grid-cols-[200px_1fr_200px] gap-3 mt-auto pb-6 h-[80px]">
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
      </div>
   );
}
