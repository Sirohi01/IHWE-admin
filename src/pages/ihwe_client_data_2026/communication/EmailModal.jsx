import React, { useState } from "react";
import { Mail, X, Paperclip, Send } from "lucide-react";
import api from "../../../lib/api";

const EmailModal = ({ company, onClose, onSend, initialSubject = "", initialContent = "", initialAttachments = [] }) => {
  const [form, setForm] = useState({ subject: initialSubject, content: initialContent });
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const email = company?.contacts?.[0]?.email || company?.companyEmail || company?.email;
  const adminStr = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
  const adminInfo = adminStr ? JSON.parse(adminStr) : {};
  const userName = adminInfo.fullName || adminInfo.username || "Admin";
  const userId = adminInfo._id || null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (!form.subject.trim() || !form.content.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("to", email);
      formData.append("subject", form.subject);
      formData.append("content", form.content);
      formData.append("companyName", company?.exhibitorName || company?.companyName || "");
      formData.append("sentBy", userName);
      formData.append("senderId", userId || "");
      formData.append("senderName", userName);
      formData.append("cmpny_id", company?.clientId || company?._id || "");
      if (initialAttachments.length > 0) {
        formData.append("existingAttachments", JSON.stringify(initialAttachments));
      }
      attachments.forEach((file) => formData.append("attachments", file));

      const res = await api.post("/api/crm-email/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setResult({ success: true, message: "Email sent successfully!" });
        await onSend(null);
        setTimeout(() => onClose(), 1500);
      } else {
        setResult({ success: false, message: res.data?.message || "Failed to send" });
      }
    } catch (err) {
      setResult({ success: false, message: err?.response?.data?.message || "Failed to send email" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-2">
            <Mail className="text-blue-600" size={20} />
            <div>
              <h2 className="text-base font-bold text-gray-800">Compose Email</h2>
              <p className="text-xs text-gray-500">{company?.companyName} • {email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">To</label>
            <input type="text" value={email || ""} readOnly className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 text-sm"
              placeholder="Enter email subject..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              rows={6}
              className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 resize-none text-sm"
              placeholder="Write your email content..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Attachments</label>
            <label className="flex items-center gap-2 h-9 px-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer text-xs text-gray-500 hover:text-blue-600 transition-colors w-fit">
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
              <Paperclip size={14} /> Attach Files (PDF, Image, Doc)
            </label>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 text-xs text-blue-700">
                    <Paperclip size={10} />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button onClick={() => removeAttachment(idx)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={!form.subject.trim() || !form.content.trim() || sending}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-60"
            >
              <Send size={14} />
              {sending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
