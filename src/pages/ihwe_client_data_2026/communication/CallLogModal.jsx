import React, { useState } from "react";
import { Phone, X } from "lucide-react";
import api from "../../../lib/api";

const CallLogModal = ({ company, onClose, onSave }) => {
  const [form, setForm] = useState({ re_msg: "", call_duration: "" });
  const [saving, setSaving] = useState(false);

  const mobile = company?.contacts?.[0]?.mobile;

  const handleSave = async () => {
    if (!form.re_msg.trim()) return;
    setSaving(true);
    
    try {
      const adminStr = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
      const adminInfo = adminStr ? JSON.parse(adminStr) : {};
      
      const formData = new FormData();
      formData.append("callerId", adminInfo._id || "system");
      formData.append("callerName", adminInfo.fullName || adminInfo.username || "Admin");
      formData.append("companyId", company?.clientId || company?._id || "unknown");
      formData.append("companyName", company?.exhibitorName || company?.companyName || "Client");
      formData.append("clientName", company?.contacts?.[0]?.name || "Client");
      formData.append("mobile", mobile || "0000000000");
      
      const durationNum = parseInt(form.call_duration.toString().replace(/\\D/g, "") || "0");
      formData.append("duration", durationNum * 60);
      formData.append("notes", form.re_msg);
      
      await api.post("/api/calls/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } catch (err) {
      console.error("Error saving call log to dashboard API:", err);
    }
    
    await onSave({ type: "call", re_msg: form.re_msg, call_duration: form.call_duration });
    setSaving(false);
    onClose();
  };

  const handleCall = () => {
    window.open(`tel:${mobile}`, "_self");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-teal-50">
          <div className="flex items-center gap-2">
            <Phone className="text-teal-600" size={20} />
            <div>
              <h2 className="text-base font-bold text-gray-800">Log a Call</h2>
              <p className="text-xs text-gray-500">{company?.companyName} • {mobile}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <button
            onClick={handleCall}
            className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Phone size={16} /> Call Now: {mobile}
          </button>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Call Duration (optional)</label>
            <input
              type="text"
              value={form.call_duration}
              onChange={(e) => setForm((p) => ({ ...p, call_duration: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl border border-gray-300 outline-none focus:border-teal-500 text-sm"
              placeholder="e.g. 5 mins"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Call Notes *</label>
            <textarea
              value={form.re_msg}
              onChange={(e) => setForm((p) => ({ ...p, re_msg: e.target.value }))}
              rows={4}
              className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:border-teal-500 resize-none text-sm"
              placeholder="What was discussed on the call..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.re_msg.trim() || saving}
              className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 text-sm flex items-center gap-2 disabled:opacity-60"
            >
              <Phone size={14} />
              {saving ? "Saving..." : "Save Call Log"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallLogModal;
