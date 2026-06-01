import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  Calendar,
  Shield,
  MessageSquare,
  Bell,
  UserCircle,
  Trash2,
  Pencil,
  ChevronRight,
  Send,
  FileText,
  Receipt,
  Wallet,
  Folder,
  User2,
  BadgeCheck,
  MessageCircleMore,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

import {
  fetchCompanies,
  updateCompany,
} from "../../features/company/companySlice";

import {
  fetchReviews,
  deleteReview,
  createReview,
} from "../../features/crm-exhibator-reviews/crmExhibatorReviewSlice";

import { fetchStatusOptions } from "../../features/add_by_admin/statusOption/statusOptionSlice";
import { fetchNextActions } from "../../features/add_by_admin/nextAction/nextActionSlice";
import { fetchAdmins } from "../../features/auth/userSlice";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import api, { SERVER_URL } from "../../lib/api";
import CommunicationPanel from "./communication/CommunicationPanel";
import WhatsAppModal from "./communication/WhatsAppModal";
import EmailModal from "./communication/EmailModal";
import CallLogModal from "./communication/CallLogModal";
import SearchableDropdown from "../../components/SearchableDropdown";

const ClientOverview1 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const [events, setEvents] = useState([]);
  const [Flip, setFlip] = useState(false);

  const { companies } = useSelector((state) => state.companies);

  const { reviews } = useSelector((state) => state.reviews);

  const { statusOptions } = useSelector(
    (state) => state.statusOptions
  );

  const { nextActions } = useSelector((state) => state.nextActions);
  const { users } = useSelector((state) => state.users);

  const company = useMemo(() => {
    return companies?.find((c) => c._id === id);
  }, [companies, id]);

  const filteredReviews = useMemo(() => {
    return Array.isArray(reviews)
      ? reviews.filter((rev) => rev?.cmpny_id === company?._id)
      : [];
  }, [reviews, company]);

  const [reviewData, setReviewData] = useState({
    cmpny_id: "",
    evnt_id: "",
    event_name: "",
    status_short: "",
    reminder_dt: "",
    forward_to: "",
    assigned_to: "",
    follow_up_date: "",
    re_msg: "",
  });

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchReviews());
    dispatch(fetchStatusOptions());
    dispatch(fetchNextActions());
    dispatch(fetchAdmins());

    fetchEvents();
  }, []);

  useEffect(() => {
    if (company?._id) {
      setReviewData((prev) => ({
        ...prev,
        cmpny_id: company._id,
      }));
    }
  }, [company]);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/api/events");
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    const keyMap = {
      ClientStatus: "status_short",
      EventName: "evnt_id",
      ReminderDateTime: "reminder_dt",
      ForwardTo: "forward_to",
      Remark: "re_msg",
    };

    setReviewData((prev) => ({
      ...prev,
      [keyMap[id]]: value,
    }));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    try {
      await dispatch(createReview(reviewData)).unwrap();

      await dispatch(
        updateCompany({
          id: company._id,
          data: {
            companyStatus: reviewData.status_short,
          },
        })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      dispatch(fetchReviews());

      setReviewData({
        cmpny_id: company._id,
        evnt_id: "",
        event_name: "",
        status_short: "",
        reminder_dt: "",
        forward_to: "",
        assigned_to: "",
        follow_up_date: "",
        re_msg: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    await dispatch(deleteReview(id));
    dispatch(fetchReviews());
  };

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isMsmeEditOpen, setIsMsmeEditOpen] = useState(false);
  const [msmeStatus, setMsmeStatus] = useState("");
  const [msmeData, setMsmeData] = useState({ exhibitorCategory: "" });
  const [isSavingMsme, setIsSavingMsme] = useState(false);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [editingContactIdx, setEditingContactIdx] = useState(null);
  const [contactForm, setContactForm] = useState({ title: "", firstName: "", surname: "", designation: "", email: "", mobile: "", alternate: "" });
  const [contactPhotoFile, setContactPhotoFile] = useState(null);
  const [contactPhotoPreview, setContactPhotoPreview] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    companyName: "",
    email: "",
    mobile: "",
    website: "",
    companyDescription: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleOpenEditProfile = () => {
    setEditProfileData({
      companyName: company?.companyName || "",
      email: company?.email || "",
      mobile: company?.contacts?.[0]?.mobile || "",
      website: company?.website || "",
      companyDescription: company?.companyDescription || "",
    });
    setLogoFile(null);
    setLogoPreview(company?.companyLogo || "");
    setIsEditProfileOpen(true);
  };

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setEditProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const dataToUpdate = { ...editProfileData };
      if (company.contacts?.length > 0) {
        dataToUpdate.contacts = [...company.contacts];
        dataToUpdate.contacts[0] = { ...dataToUpdate.contacts[0], mobile: editProfileData.mobile };
      }

      // 1) If logo file selected, upload it first
      if (logoFile) {
        const formData = new FormData();
        formData.append("companyLogo", logoFile);
        const logoRes = await api.post(`/api/companies/${company._id}/logo`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // logoUrl set in DB by backend; we don't need to pass it in dataToUpdate
      }

      // 2) Update other fields
      await dispatch(updateCompany({
        id: company._id,
        data: dataToUpdate
      })).unwrap();

      Swal.fire({ icon: "success", title: "Profile Updated", timer: 1500, showConfirmButton: false });
      setIsEditProfileOpen(false);
      dispatch(fetchCompanies());
      // Log to communication panel
      dispatch(createReview({ cmpny_id: company._id, type: "log", re_msg: `Company profile updated: ${editProfileData.companyName}` }));
      dispatch(fetchReviews());
    } catch (err) {
      console.log(err);
      Swal.fire({ icon: "error", title: "Update Failed", text: err?.message || "Failed to update profile" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveMsme = async (e) => {
    e.preventDefault();
    setIsSavingMsme(true);
    try {
      await dispatch(updateCompany({ id: company._id, data: msmeData })).unwrap();
      // Log to communication panel
      await dispatch(createReview({
        cmpny_id: company._id,
        type: "log",
        re_msg: `Exhibitor Category updated to: ${msmeData.exhibitorCategory || "-"}`,
      })).unwrap();
      dispatch(fetchReviews());
      Swal.fire({ icon: "success", title: "Exhibitor Category Updated", timer: 1500, showConfirmButton: false });
      setIsMsmeEditOpen(false);
      dispatch(fetchCompanies());
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update Failed", text: err?.message || "Failed to update" });
    } finally {
      setIsSavingMsme(false);
    }
  };

  const handleOpenAddContact = () => {
    setEditingContactIdx(null);
    setContactForm({ title: "", firstName: "", surname: "", designation: "", email: "", mobile: "", alternate: "" });
    setContactPhotoFile(null);
    setContactPhotoPreview("");
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (idx) => {
    const c = company.contacts[idx];
    setEditingContactIdx(idx);
    setContactForm({ title: c.title || "", firstName: c.firstName || "", surname: c.surname || "", designation: c.designation || "", email: c.email || "", mobile: c.mobile || "", alternate: c.alternate || "" });
    setContactPhotoFile(null);
    setContactPhotoPreview(c.photo || "");
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSavingContact(true);
    try {
      let photoUrl = contactPhotoPreview && !contactPhotoPreview.startsWith("blob:") ? contactPhotoPreview : (company.contacts?.[editingContactIdx]?.photo || "");

      // Upload photo if new file selected
      if (contactPhotoFile) {
        const formData = new FormData();
        formData.append("contactPhoto", contactPhotoFile);
        const res = await api.post(`/api/companies/${company._id}/contact-photo`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.photoUrl) photoUrl = res.data.photoUrl;
      }

      const updatedContacts = [...(company.contacts || [])];
      const contactData = { ...contactForm, photo: photoUrl };
      if (editingContactIdx !== null) {
        updatedContacts[editingContactIdx] = { ...updatedContacts[editingContactIdx], ...contactData };
      } else {
        updatedContacts.push(contactData);
      }
      await dispatch(updateCompany({ id: company._id, data: { contacts: updatedContacts } })).unwrap();
      Swal.fire({ icon: "success", title: editingContactIdx !== null ? "Contact Updated" : "Contact Added", timer: 1500, showConfirmButton: false });
      setIsContactModalOpen(false);
      dispatch(fetchCompanies());
      // Log to communication panel
      const contactName = [contactForm.firstName, contactForm.surname].filter(Boolean).join(" ");
      dispatch(createReview({ cmpny_id: company._id, type: "log", re_msg: `Contact ${editingContactIdx !== null ? "updated" : "added"}: ${contactName}` }));
      dispatch(fetchReviews());
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err?.message || "Could not save contact" });
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleSendEntry = async (entryData) => {
    try {
      await dispatch(createReview({
        cmpny_id: company._id,
        ...entryData,
      })).unwrap();
      dispatch(fetchReviews());
    } catch (err) {
      console.log(err);
    }
  };

  if (!company) return null;

  return (
    <div className="bg-[#f5f7fb] px-6 py-4">

      {/* TOP HEADER */}

      <div className="flex items-center justify-between mb-2">

        <div>
          <h1 className="text-[22px] font-md text-[#0f172a]">
            CLIENT PROFILE
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>Dashboard</span>
            <ChevronRight size={14} />
            <span>Client Profile</span>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <button className="h-11 px-5 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold">
            Add Client
          </button>

          <button className="h-11 px-5 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold">
            Master List
          </button>

          <button className="h-11 px-5 rounded-xl border border-violet-300 text-violet-600 bg-white hover:bg-violet-50 text-sm font-semibold">
            Add MSME Details
          </button>

          <button className="h-11 px-5 rounded-xl border border-green-300 text-green-600 bg-white hover:bg-green-50 text-sm font-semibold flex items-center gap-2">
            <FaWhatsapp />
            Send WhatsApp
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}

      <div className="grid grid-cols-1 min-[1300px]:grid-cols-[1fr_360px] gap-3 items-stretch">

        {/* LEFT SECTION */}

        <div className="space-y-1 min-w-0">

          {/* PROFILE CARD */}

          <div className="bg-white rounded-2xl border border-gray-300 p-3 py-4 overflow-hidden">

            <div className="flex flex-wrap gap-4 items-start">

              {/* LOGO */}

              <div className="border border-gray-300 rounded-2xl p-3 flex items-center justify-center h-[130px] w-[160px] flex-shrink-0">
                {company.companyLogo ? (
                  <img
                    src={company.companyLogo.startsWith('http') ? company.companyLogo : `${SERVER_URL}${company.companyLogo}`}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Building2 className="text-gray-300 mx-auto" size={36} />
                    <p className="text-[10px] font-bold text-gray-500 mt-1">Company Logo</p>
                    <p className="text-[11px] text-red-500 mt-1 leading-tight">Add your logo to enhance<br/>brand visibility</p>
                  </div>
                )}
              </div>

              {/* COMPANY INFO */}

              <div className="flex-1 min-w-[200px]">

                <div className="flex items-center gap-3 w-full">
                  <h2 className="text-2xl font-semibold text-[#0f172a] whitespace-nowrap">
                    {company.companyName}
                  </h2>
                  <button onClick={handleOpenEditProfile} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors flex-shrink-0" title="Edit Profile">
                    <Pencil size={16} />
                  </button>
                </div>

                <div className="mt-1 text-gray-600 text-[10px] font-medium">
                  <span>{company.eventName || "No Event"}</span>
                  <span className="whitespace-nowrap"> | {company.clientType || "New Client"}</span>
                </div>

                <div className="mt-2 space-y-2">

                  <div className="flex items-center gap-2 text-[13px]">
                    <UserCircle className="text-[#4338ca] flex-shrink-0" size={16} />
                    <span className="font-medium text-gray-700">
                      {company.contacts?.[0]?.firstName
                        ? `${company.contacts[0].firstName} ${company.contacts[0].surname || ""}`.trim()
                        : company.companyName}
                    </span>
                    <span className="text-gray-400">-</span>
                    <a href={`tel:${company.contacts?.[0]?.mobile}`} className="text-[#4338ca] hover:underline font-medium">
                      {company.contacts?.[0]?.mobile}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-[13px]">
                    <Mail className="text-[#4338ca] flex-shrink-0" size={16} />
                    <a href={`mailto:${company.email}`} className="text-[#4338ca] hover:underline">
                      {company.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-[13px]">
                    <Globe className="text-[#4338ca] flex-shrink-0" size={16} />
                    <a
                      href={company?.website?.startsWith('http') ? company?.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-gray-700"
                    >
                      {company?.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="border-l-[3px] border-gray-600 pl-4 text-gray-700 leading-5 text-[10px] w-[260px] flex-shrink-0">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">About Company</p>
                <p className="break-words whitespace-normal">
                {company?.companyDescription ||
                  <span className="text-red-600 text-[12px] leading-5">Tell buyers, visitors, and business partners about your company, products, services, and expertise. A well-written company profile helps increase visibility and generate more business opportunities.</span>}
                </p>
              </div>
            </div>
          </div>

          {/* INFO CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1">

            <div className="bg-white rounded-2xl border border-gray-300 px-2 py-1.5 flex items-center gap-2 min-w-0">

              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="text-green-600" size={14} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-[10px] whitespace-nowrap">Industry / Sector</p>
                <h3 className="font-semibold text-[10px] mt-0.5 truncate">
                  {company?.category}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 px-2 py-1.5 flex items-center gap-2 min-w-0">

              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="text-blue-600" size={14} />
              </div>

              <div>
                <p className="text-gray-500 text-[10px] whitespace-nowrap">
                  Lead Generation Date
                </p>

                <h3 className="font-semibold text-[10px] mt-0.5 truncate">
                  {company.createdAt
                    ? new Date(company.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "N/A"}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 px-2 py-1.5 flex items-center gap-2 min-w-0">

              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Shield className="text-green-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-[10px] whitespace-nowrap">Exhibitor Category</p>
                  <button
                    onClick={() => {
                      setMsmeData({
                        exhibitorCategory: company?.exhibitorCategory || "",
                      });
                      setIsMsmeEditOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Edit Exhibitor Category"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
                <h3 className="font-semibold text-[10px] mt-0.5 truncate text-green-600">
                  {company?.exhibitorCategory || "-"}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 px-2 py-1.5 flex items-center gap-2 min-w-0">

              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="text-orange-500" size={14} />
              </div>

              <div>
                <p className="text-gray-500 text-[10px] whitespace-nowrap">
                  Client Status
                </p>

                <h3 className="font-semibold text-[10px] mt-0.5 truncate text-orange-500">
                  {company?.companyStatus}
                </h3>
              </div>
            </div>
          </div>

          {/* ACTION CARDS */}

          <div className="bg-white rounded-2xl border border-gray-300 p-3">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1">

              {[
                {
                  icon: FileText,
                  title: "Proposals / Broucher",
                  color: "purple-600",
                  onClick: null,
                },
                {
                  icon: Receipt,
                  title: "Proforma Invoice",
                  color: "orange-600",
                  onClick: null,
                },
                {
                  icon: Folder,
                  title: "Documentation",
                  color: "blue-600",
                  onClick: null,
                },
                {
                  icon: Wallet,
                  title: "Payments",
                  color: "green-600",
                  onClick: null,
                },
                {
                  icon: UserCircle,
                  title: "Contact Details",
                  color: "indigo-600",
                  onClick: null,
                },
                {
                  icon: FaWhatsapp,
                  title: "WhatsApp Chat",
                  color: "green-500",
                  onClick: () => setShowWhatsAppModal(true),
                },
                {
                  icon: Mail,
                  title: "Email",
                  color: "blue-600",
                  onClick: () => setShowEmailModal(true),
                },
                {
                  icon: Phone,
                  title: "Call",
                  color: "teal-600",
                  onClick: () => setShowCallModal(true),
                },
              ].map((item, index) => (
                <div
                  key={index}
                  onClick={item.onClick || undefined}
                  className="h-[40px] rounded-2xl border border-gray-300 px-3 flex items-center justify-between cursor-pointer hover:shadow-md hover:bg-orange-50 hover:border-orange-300 transition-all group"
                >
                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                      <item.icon size={22} className={`text-${item.color}`} />
                    </div>

                    <span className="text-[11px] text-[#0f172a] group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STATUS UPDATE */}

          <div className="bg-white rounded-2xl border border-gray-300 p-3">

            <h2 className="text-xl font-md text-[#0f172a] mb-1">
              Lead Status Updates
            </h2>

            <form onSubmit={handleAddReview}>

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 items-end">

                <div>
                  <label className="text-xs font-semibold mb-1 block">Status Update</label>
                  <SearchableDropdown
                    options={statusOptions?.map((item) => ({ label: item.name, value: item.name })) || []}
                    value={reviewData.status_short}
                    onChange={(e) => setReviewData(prev => ({ ...prev, status_short: e.target.value }))}
                    placeholder="Select Status"
                    name="ClientStatus"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Next Action</label>
                  <SearchableDropdown
                    options={nextActions?.filter(n => n.status === 'active').map((n) => ({ label: n.name, value: n.name })) || []}
                    value={reviewData.forward_to}
                    onChange={(e) => setReviewData(prev => ({ ...prev, forward_to: e.target.value }))}
                    placeholder="Select Next Action"
                    name="ForwardTo"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Forward On</label>
                  <SearchableDropdown
                    options={users?.map((u) => ({ label: u.fullName || u.username, value: u.username })) || []}
                    value={reviewData.assigned_to || company?.forwardTo || ""}
                    onChange={(e) => setReviewData(prev => ({ ...prev, assigned_to: e.target.value }))}
                    placeholder="Select Assigned To"
                    name="AssignedTo"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Follow Up Date</label>
                  <input
                    type="date"
                    value={reviewData.follow_up_date}
                    onChange={(e) => setReviewData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                    className="w-full h-10 border border-[#dbe1ea] px-3 outline-none text-sm"
                  />
                </div>

                <div className="col-span-2 xl:col-span-4 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold mb-1 block">Remark</label>
                    <textarea
                      id="Remark"
                      value={reviewData.re_msg}
                      onChange={handleChange}
                      className="w-full h-[40px] rounded-xl border border-[#dbe1ea] p-3 outline-none resize-none text-sm"
                      placeholder="Write your remark here..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2 text-sm flex-shrink-0"
                  >
                    Update Status
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* CONTACT DETAILS */}
          <div className="bg-white rounded-2xl border border-gray-300 p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-[#0f172a]">CONTACT DETAILS</h2>
              <button onClick={handleOpenAddContact} className="h-10 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center gap-2">
                + Add More Contact
              </button>
            </div>

            {company.contacts && company.contacts.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {company.contacts.map((contact, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50 w-[180px] min-[1400px]:w-[220px] relative">
                    <button onClick={() => handleOpenEditContact(idx)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors">
                      <Pencil size={12} />
                    </button>
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-lg overflow-hidden">
                      {contact.photo ? (
                        <img src={contact.photo.startsWith('http') ? contact.photo : `${SERVER_URL}${contact.photo}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        contact.firstName ? contact.firstName.charAt(0).toUpperCase() : "?"
                      )}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 w-full text-center">
                      <p className="text-[12px] font-bold text-gray-800 truncate">
                        {[contact.title, contact.firstName, contact.surname].filter(Boolean).join(" ") || "-"}
                      </p>
                      <p className="text-[10px] text-gray-400 mb-1.5">{contact.designation || "-"}</p>
                      <a href={`tel:${contact.mobile}`} className="flex items-center justify-center gap-1 text-[11px] text-blue-600 hover:underline">
                        <Phone size={10} /> {contact.mobile || "-"}{contact.alternate ? ` / ${contact.alternate}` : ""}
                      </a>
                      <a href={`mailto:${contact.email}`} className="flex items-center justify-center gap-1 text-[11px] text-blue-600 hover:underline mt-0.5">
                        <Mail size={10} className="flex-shrink-0" />
                        <span className="truncate">{contact.email || "-"}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No contact details available.</p>
            )}
          </div>
        </div>

        {/* RIGHT CHAT SECTION */}
        <CommunicationPanel
          company={company}
          reviews={filteredReviews}
          onSendEntry={handleSendEntry}
        />
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Edit Company Profile</h2>
              <button onClick={() => setIsEditProfileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                  <input type="text" id="companyName" value={editProfileData.companyName} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company Logo</label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <img src={logoPreview.startsWith('blob:') ? logoPreview : `http://localhost:5000${logoPreview}`} alt="Logo Preview" className="w-16 h-16 rounded-xl object-contain border border-gray-200 bg-gray-50" />
                    )}
                    <label className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 cursor-pointer text-sm text-gray-500 hover:text-green-600 transition-colors">
                      <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                      📷 {logoFile ? logoFile.name : "Choose Logo Image"}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" id="email" value={editProfileData.email} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile</label>
                  <input type="text" id="mobile" value={editProfileData.mobile} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Website</label>
                  <input type="text" id="website" value={editProfileData.website} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company Description (About)</label>
                  <textarea id="companyDescription" value={editProfileData.companyDescription} onChange={handleProfileChange} rows={5} className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:border-green-500 resize-none" placeholder="Write about the company..." />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingProfile} className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-70">
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MSME EDIT MODAL */}
      {isMsmeEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Edit Exhibitor Category</h2>
              <button onClick={() => setIsMsmeEditOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                ×
              </button>
            </div>
            <form onSubmit={handleSaveMsme} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Exhibitor Category</label>
                <select
                  value={msmeData.exhibitorCategory}
                  onChange={(e) => setMsmeData(prev => ({ ...prev, exhibitorCategory: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500"
                >
                  <option value="">Select Category</option>
                  <option value="Under PSM Scheme">Under MSME PSM Scheme</option>
                  <option value="Under General Category">Under General Category</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsMsmeEditOpen(false)} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingMsme} className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-70">
                  {isSavingMsme ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CONTACT MODAL */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editingContactIdx !== null ? "Edit Contact" : "Add Contact"}</h2>
              <button onClick={() => setIsContactModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">×</button>
            </div>
            <form onSubmit={handleSaveContact} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              {/* Photo Upload */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0 text-indigo-600 font-bold text-lg">
                  {contactPhotoPreview ? (
                    <img src={contactPhotoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    contactForm.firstName ? contactForm.firstName.charAt(0).toUpperCase() : "?"
                  )}
                </div>
                <label className="flex-1 h-9 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 cursor-pointer text-xs text-gray-500 hover:text-green-600 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setContactPhotoFile(file);
                    setContactPhotoPreview(URL.createObjectURL(file));
                  }} />
                  📷 {contactPhotoFile ? contactPhotoFile.name : "Upload Photo"}
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                  <select value={contactForm.title} onChange={(e) => setContactForm(p => ({ ...p, title: e.target.value }))} className="w-full h-9 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500 text-sm">
                    <option value="">Select</option>
                    <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                  <input type="text" value={contactForm.firstName} onChange={(e) => setContactForm(p => ({ ...p, firstName: e.target.value }))} className="w-full h-9 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Surname</label>
                  <input type="text" value={contactForm.surname} onChange={(e) => setContactForm(p => ({ ...p, surname: e.target.value }))} className="w-full h-9 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                  <input type="text" value={contactForm.designation} onChange={(e) => setContactForm(p => ({ ...p, designation: e.target.value }))} className="w-full h-9 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile</label>
                  <input type="text" value={contactForm.mobile} onChange={(e) => setContactForm(p => ({ ...p, mobile: e.target.value }))} className="w-full h-9 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alternate Mobile</label>
                  <input type="text" value={contactForm.alternate} onChange={(e) => setContactForm(p => ({ ...p, alternate: e.target.value }))} className="w-full h-9 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} className="w-full h-9 px-3 rounded-xl border border-gray-300 outline-none focus:border-green-500 text-sm" required />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={isSavingContact} className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 text-sm disabled:opacity-70">
                  {isSavingContact ? "Saving..." : editingContactIdx !== null ? "Update" : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ACTION CARD MODALS */}
      {showWhatsAppModal && (
        <WhatsAppModal
          company={company}
          onClose={() => setShowWhatsAppModal(false)}
          onSend={handleSendEntry}
        />
      )}
      {showEmailModal && (
        <EmailModal
          company={company}
          onClose={() => setShowEmailModal(false)}
          onSend={handleSendEntry}
        />
      )}
      {showCallModal && (
        <CallLogModal
          company={company}
          onClose={() => setShowCallModal(false)}
          onSave={handleSendEntry}
        />
      )}
    </div>
  );
};

export default ClientOverview1;