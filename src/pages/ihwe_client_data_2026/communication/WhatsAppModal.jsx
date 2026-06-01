import React, { useState } from "react";
import { Send, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import api from "../../../lib/api";

const WhatsAppModal = ({ company, onClose, onSend }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { success, message }

  const mobile = company?.contacts?.[0]?.mobile?.replace(/\D/g, "");
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userName = user.name || user.username || "Admin";

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      // Send via Opus API through backend
      const res = await api.post("/api/whatsapp", {
        compny_id: company._id,
        phone_no: mobile,
        whtsapp_title: `CRM - ${company.companyName}`,
        whtsapp_desc: message,
        user: userName,
      });

      if (res.data?.success) {
        setResult({ success: true, message: "Message sent successfully!" });
        // Log to communication panel
        await onSend({ type: "whatsapp", re_msg: message });
        setTimeout(() => onClose(), 1500);
      } else {
        setResult({ success: false, message: res.data?.message || "Failed to send" });
      }
    } catch (err) {
      setResult({ success: false, message: err?.response?.data?.message || "Failed to send message" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center gap-2">
            <FaWhatsapp className="text-green-600" size={22} />
            <div>
              <h2 className="text-base font-bold text-gray-800">Send WhatsApp</h2>
              <p className="text-xs text-gray-500">{company?.companyName} • +91 {mobile}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:border-green-500 resize-none text-sm"
              placeholder="Type your WhatsApp message..."
            />
          </div>

          {result && (
            <div className={`p-3 rounded-xl text-sm font-semibold ${result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {result.success ? "✅ " : "❌ "}{result.message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 text-sm flex items-center gap-2 disabled:opacity-60"
            >
              <FaWhatsapp size={16} />
              {sending ? "Sending..." : "Send via WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
