import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Award, Phone, Mail, Globe,
  CheckCircle, XCircle, Clock, AlertCircle, Send, Trash2,
  FileText, Image, Link as LinkIcon, Download, ExternalLink,
  User, Building2, Calendar, MapPin
} from "lucide-react";
import Swal from "sweetalert2";
import api, { SERVER_URL } from "../lib/api";

const STATUS_COLORS = {
  "Pending":      { bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200",  btn: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  "Under Review": { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    btn: "bg-blue-100 text-blue-700 border-blue-300" },
  "Approved":     { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   btn: "bg-green-100 text-green-700 border-green-300" },
  "Rejected":     { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     btn: "bg-red-100 text-red-700 border-red-300" },
};

const STATUS_ICONS = {
  "Pending":      <Clock className="w-3.5 h-3.5" />,
  "Under Review": <AlertCircle className="w-3.5 h-3.5" />,
  "Approved":     <CheckCircle className="w-3.5 h-3.5" />,
  "Rejected":     <XCircle className="w-3.5 h-3.5" />,
};

const STATUSES = ["Pending", "Under Review", "Approved", "Rejected"];

// ── Helper: get full file URL ──
const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SERVER_URL}${path}`;
};

// ── Helper: normalize external URL ──
const normalizeUrl = (url) => {
  if (!url) return "#";
  const u = url.trim();
  // Already has valid protocol
  if (/^https?:\/\//i.test(u)) return u;
  // Has protocol but malformed (e.g. https;// or https;)
  const cleaned = u.replace(/^https?[^a-z0-9]*/i, '');
  return `https://${cleaned}`;
};

// ── Helper: detect file type ──
const getFileType = (url) => {
  if (!url) return "link";
  const ext = url.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  return "link";
};

// ── File Preview Card ──
const FileCard = ({ label, url, icon }) => {
  if (!url) return null;
  const fullUrl = getFileUrl(url);
  const type = getFileType(url);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Preview area */}
      <div className="bg-slate-50 h-36 flex items-center justify-center relative">
        {type === "image" ? (
          <img src={fullUrl} alt={label} className="w-full h-full object-cover" />
        ) : type === "video" ? (
          <video src={fullUrl} className="w-full h-full object-cover" controls />
        ) : type === "pdf" ? (
          <iframe src={fullUrl} className="w-full h-full" title={label} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            {icon}
            <span className="text-[11px] font-bold uppercase">{type.toUpperCase()}</span>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="p-3 flex items-center justify-between">
        <span className="text-[11.5px] font-bold text-[#0a2e5c]">{label}</span>
        <div className="flex gap-1.5">
          <a href={fullUrl} target="_blank" rel="noreferrer"
            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Open">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href={fullUrl} download
            className="p-1.5 rounded-lg bg-green-50 text-[#008d48] hover:bg-green-100 transition-colors" title="Download">
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

// ── Info Field ──
const Field = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-[13px] font-semibold text-slate-700 leading-snug">{value}</p>
    </div>
  );
};

// ── Section Card ──
const Card = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
      <div className="text-[#008d48]">{icon}</div>
      <h3 className="text-[12px] font-black text-[#0a2e5c] uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const AwardsNominationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/api/awards-nomination/${id}`)
      .then(res => {
        if (res.data.success) {
          setNomination(res.data.data);
          setStatus(res.data.data.status);
          setRemarks(res.data.data.adminRemarks || "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/awards-nomination/${id}/status`, { status, adminRemarks: remarks });
      setNomination(prev => ({ ...prev, status, adminRemarks: remarks }));
      Swal.fire({ icon: "success", title: "Updated & Notified!", text: "WhatsApp sent to applicant.", timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to update." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete this nomination?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/api/awards-nomination/${id}`);
      navigate("/awards-nominations");
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete." });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-[#008d48] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!nomination) return (
    <div className="p-6 text-center text-slate-400 font-bold">Nomination not found.</div>
  );

  const sc = STATUS_COLORS[nomination.status] || STATUS_COLORS["Pending"];
  const hasDocuments = nomination.profileDeckUrl || nomination.certificationsUrl || nomination.imagesUrl || nomination.socialLinks;

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* ── Top Bar ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 pt-5">
          <button onClick={() => navigate("/awards-nominations")}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-[20px] font-black text-[#0a2e5c] leading-tight">{nomination.fullName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Award className="w-3.5 h-3.5 text-[#008d48]" />
              <span className="text-[12px] text-slate-500 font-medium">{nomination.awardCategory}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-7">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border ${sc.btn}`}>
            {STATUS_ICONS[nomination.status]} {nomination.status}
          </span>
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-[11px] font-black hover:bg-red-100 border border-red-100 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT: All Details ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Applicant Details */}
          <Card title="Applicant Details" icon={<User className="w-4 h-4" />}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Applicant Type" value={nomination.applicantType} />
              <Field label="Full Name" value={nomination.fullName} />
              <Field label="Contact Person" value={nomination.contactPersonName} />
              <Field label="Designation" value={nomination.designation} />
              <Field label="Mobile" value={nomination.mobile} />
              <Field label="Email" value={nomination.email} />
              <Field label="Website" value={nomination.website} />
              <Field label="Location" value={[nomination.city, nomination.state, nomination.country].filter(Boolean).join(", ")} />
            </div>
          </Card>

          {/* Award Category */}
          <Card title="Award Category" icon={<Award className="w-4 h-4" />}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${sc.bg} ${sc.border} border`}>
              <Award className={`w-4 h-4 ${sc.text}`} />
              <span className={`text-[14px] font-black ${sc.text}`}>{nomination.awardCategory}</span>
            </div>
          </Card>

          {/* Profile Details */}
          {(nomination.briefProfile || nomination.keyServices) && (
            <Card title="Profile Details" icon={<Building2 className="w-4 h-4" />}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Years of Experience" value={nomination.yearsOfExperience} />
                  <Field label="Team Size" value={nomination.teamSize} />
                </div>
                {nomination.briefProfile && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Brief Profile</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">{nomination.briefProfile}</p>
                  </div>
                )}
                {nomination.keyServices && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Key Services / Products</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">{nomination.keyServices}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Achievements */}
          {nomination.keyAchievements && (
            <Card title="Achievements & Impact" icon={<Award className="w-4 h-4" />}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ["Key Achievements", nomination.keyAchievements],
                    ["Unique Contribution", nomination.uniqueContribution],
                    ["Impact Created", nomination.impactCreated],
                    ["Innovation / Technology Used", nomination.innovationUsed],
                  ].map(([label, val]) => val ? (
                    <div key={label}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-[12.5px] text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">{val}</p>
                    </div>
                  ) : null)}
                </div>
                {nomination.whyDeserve && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Why Deserve This Award</p>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">{nomination.whyDeserve}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Supporting Documents */}
          {hasDocuments && (
            <Card title="Supporting Documents" icon={<FileText className="w-4 h-4" />}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FileCard label="Profile / Company Deck" url={nomination.profileDeckUrl}
                  icon={<FileText className="w-8 h-8" />} />
                <FileCard label="Certifications / Awards" url={nomination.certificationsUrl}
                  icon={<Award className="w-8 h-8" />} />
                <FileCard label="Images / Videos" url={nomination.imagesUrl}
                  icon={<Image className="w-8 h-8" />} />
                {nomination.socialLinks && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-slate-50 h-36 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <LinkIcon className="w-8 h-8" />
                        <span className="text-[10px] font-bold uppercase">Social Link</span>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-[11.5px] font-bold text-[#0a2e5c]">Website / Social</span>
                      <button
                        onClick={() => window.open(normalizeUrl(nomination.socialLinks), '_blank')}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* ── RIGHT: Status + Meta + Contact ── */}
        <div className="space-y-4">

          {/* Status Update */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-[#0a2e5c] px-5 py-3">
              <h3 className="text-white font-black text-[12px] uppercase tracking-widest">Update Status</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map(s => {
                  const c = STATUS_COLORS[s];
                  return (
                    <button key={s} onClick={() => setStatus(s)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-black border transition-all ${
                        status === s ? `${c.btn} ring-2 ring-offset-1 ring-current` : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}>
                      {STATUS_ICONS[s]} {s}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Admin Remarks</label>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                  placeholder="Add internal remarks..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[#008d48] resize-none" />
              </div>

              <button onClick={handleStatusUpdate} disabled={saving}
                className="w-full py-2.5 bg-[#008d48] text-white rounded-lg font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#007a3e] transition-all disabled:opacity-60">
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><Send className="w-3.5 h-3.5" /> Save &amp; Notify via WhatsApp</>
                }
              </button>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Contact</h3>
            <a href={`tel:${nomination.mobile}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-green-50 transition-colors group border border-slate-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#008d48]" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Mobile</p>
                <p className="text-[12.5px] font-bold text-slate-700 group-hover:text-[#008d48]">{nomination.mobile}</p>
              </div>
            </a>
            <a href={`mailto:${nomination.email}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-green-50 transition-colors group border border-slate-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#008d48]" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                <p className="text-[12.5px] font-bold text-slate-700 group-hover:text-[#008d48] truncate">{nomination.email}</p>
              </div>
            </a>
            {nomination.website && (
              <div
                onClick={() => window.open(normalizeUrl(nomination.website), '_blank')}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-green-50 transition-colors group border border-slate-100 cursor-pointer">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-[#008d48]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Website</p>
                  <p className="text-[12.5px] font-bold text-slate-700 group-hover:text-[#008d48] truncate">{nomination.website}</p>
                </div>
              </div>
            )}
          </div>

          {/* Submission Meta */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Submission Info</h3>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Submitted On</p>
                <p className="text-[12.5px] font-semibold text-slate-700">{new Date(nomination.createdAt).toLocaleString("en-IN")}</p>
              </div>
            </div>
            {nomination.updated_by && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Last Updated By</p>
                  <p className="text-[12.5px] font-semibold text-slate-700">{nomination.updated_by}</p>
                </div>
              </div>
            )}
            {nomination.adminRemarks && (
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Admin Remarks</p>
                <p className="text-[12px] text-slate-600 bg-slate-50 rounded-lg p-2.5 leading-relaxed">{nomination.adminRemarks}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AwardsNominationDetail;



