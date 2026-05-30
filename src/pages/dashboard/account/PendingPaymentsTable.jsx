import { MessageCircle, Phone, Mail, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

export default function PendingPaymentsTable() {
  const pendingData = [
    {
      company: "GreenLife Ayurveda",
      total: "₹ 3,50,000",
      paid: "₹ 1,00,000",
      due: "₹ 2,50,000",
      dueDate: "10 May 2026",
      lastReminder: "08 May 2026",
      status: "Due Today",
      statusColor: "bg-amber-50 border-amber-200 text-amber-700",
      contact: { name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@greenlife.com" }
    },
    {
      company: "Nature's Harmony Pvt. Ltd.",
      total: "₹ 4,20,000",
      paid: "₹ 0",
      due: "₹ 4,20,000",
      dueDate: "05 May 2026",
      lastReminder: "02 May 2026",
      status: "Overdue",
      statusColor: "bg-rose-50 border-rose-200 text-rose-700",
      contact: { name: "Anil Sharma", phone: "9812345678", email: "anil@naturesharmony.com" }
    },
    {
      company: "Wellness World",
      total: "₹ 2,75,000",
      paid: "₹ 1,00,000",
      due: "₹ 1,75,000",
      dueDate: "15 May 2026",
      lastReminder: "12 May 2026",
      status: "Reminder Sent",
      statusColor: "bg-blue-50 border-blue-200 text-blue-700",
      contact: { name: "Suresh Gupta", phone: "9988776655", email: "suresh@wellnessworld.in" }
    },
    {
      company: "Herbal King Exports",
      total: "₹ 5,80,000",
      paid: "₹ 2,30,000",
      due: "₹ 3,50,000",
      dueDate: "20 May 2026",
      lastReminder: "18 May 2026",
      status: "Partially Paid",
      statusColor: "bg-purple-50 border-purple-200 text-purple-700",
      contact: { name: "Vikram Singh", phone: "9776655443", email: "vikram@herbalking.com" }
    },
    {
      company: "Arogya Organics",
      total: "₹ 3,10,000",
      paid: "₹ 0",
      due: "₹ 3,10,000",
      dueDate: "22 May 2026",
      lastReminder: "20 May 2026",
      status: "Overdue",
      statusColor: "bg-rose-50 border-rose-200 text-rose-700",
      contact: { name: "Pankaj Joshi", phone: "9554433221", email: "pankaj@arogya.in" }
    }
  ];

  const handleWhatsApp = (client) => {
    Swal.fire({
      title: "Send WhatsApp Reminder",
      html: `Do you want to send a WhatsApp reminder to <b>${client.company}</b> (${client.contact.name})?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Send",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#095b55"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Sent!", "WhatsApp reminder has been queued and sent.", "success");
      }
    });
  };

  const handleCall = (client) => {
    Swal.fire({
      title: "Initiate Call",
      html: `Calling <b>${client.contact.name}</b> from <b>${client.company}</b><br/>Number: <b>+91 ${client.contact.phone}</b>`,
      icon: "info",
      confirmButtonText: "OK",
      confirmButtonColor: "#095b55"
    });
  };

  const handleEmail = (client) => {
    Swal.fire({
      title: "Send Email Follow-up",
      html: `Send an email invoice follow-up to <b>${client.contact.email}</b>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Send Email",
      confirmButtonColor: "#095b55"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Sent!", "Invoice email follow-up sent successfully.", "success");
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-[12.5px] font-md text-slate-800 tracking-tight">
            Top Pending Payments
          </h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Accounts with pending balances
          </p>
        </div>
        <button
          onClick={() => Swal.fire({ title: "Redirect", text: "Redirecting to all billing & payment logs.", icon: "info", confirmButtonColor: "#095b55" })}
          className="text-emerald-600 hover:text-emerald-700 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-0.5 hover:underline"
        >
          View All <ArrowRight size={10} strokeWidth={2.5} />
        </button>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto flex-1 min-h-[140px]">
        <table className="w-full text-left border-collapse text-[10.5px]">
          <thead>
            <tr className="border-b border-slate-150 text-slate-400 font-black uppercase tracking-wider">
              <th className="py-1.5 px-2">Company / Client</th>
              <th className="py-1.5 px-1">Total</th>
              <th className="py-1.5 px-1">Paid</th>
              <th className="py-1.5 px-1">Due</th>
              <th className="py-1.5 px-1">Due Date</th>
              <th className="py-1.5 px-1">Reminder</th>
              <th className="py-1.5 px-1 text-center">Status</th>
              <th className="py-1.5 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors font-semibold text-slate-700">
                <td className="py-1 px-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-md text-slate-800 leading-tight">
                      {row.company}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">
                      {row.contact.name}
                    </span>
                  </div>
                </td>
                <td className="py-1 px-1 font-md text-slate-800">{row.total}</td>
                <td className="py-1 px-1 text-slate-500">{row.paid}</td>
                <td className="py-1 px-1 text-red-600 font-md">{row.due}</td>
                <td className="py-1 px-1 text-slate-600">{row.dueDate}</td>
                <td className="py-1 px-1 text-slate-500">{row.lastReminder}</td>
                <td className="py-1 px-1 text-center">
                  <span className={`inline-flex px-1.5 py-0.2 rounded-full text-[7.5px] font-black border uppercase tracking-wider ${row.statusColor}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-1 px-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleWhatsApp(row)}
                      className="p-0.5 rounded-full hover:bg-emerald-50 text-emerald-600 border border-transparent hover:border-emerald-100 transition-colors cursor-pointer"
                    >
                      <MessageCircle size={12} fill="currentColor" className="text-emerald-500" />
                    </button>
                    <button
                      onClick={() => handleCall(row)}
                      className="p-0.5 rounded-full hover:bg-blue-50 text-blue-600 border border-transparent hover:border-blue-100 transition-colors cursor-pointer"
                    >
                      <Phone size={12} className="text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleEmail(row)}
                      className="p-0.5 rounded-full hover:bg-purple-50 text-purple-600 border border-transparent hover:border-purple-100 transition-colors cursor-pointer"
                    >
                      <Mail size={12} className="text-purple-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
