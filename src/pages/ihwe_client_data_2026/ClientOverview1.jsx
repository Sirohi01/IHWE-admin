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
import { fetchAdmins } from "../../features/auth/userSlice";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import api, { SERVER_URL } from "../../lib/api";
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
    re_msg: "",
  });

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchReviews());
    dispatch(fetchStatusOptions());
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
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err?.message || "Could not save contact" });
    } finally {
      setIsSavingContact(false);
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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">

        {/* LEFT SECTION */}

        <div className="space-y-1">

          {/* PROFILE CARD */}

          <div className="bg-white rounded-2xl border border-gray-300 p-3 py-6">

            <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_320px] gap-6 items-center">

              {/* LOGO */}

              <div className="border border-gray-300 rounded-2xl p-3 flex items-center justify-center h-[130px] w-[160px]">
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

              <div>

                <div className="flex items-center gap-3 w-full">
                  <h2 className="text-2xl font-semibold text-[#0f172a] whitespace-nowrap">
                    {company.companyName}
                  </h2>
                  <button onClick={handleOpenEditProfile} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors flex-shrink-0" title="Edit Profile">
                    <Pencil size={18} />
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
                    <a
                      href={`tel:${company.contacts?.[0]?.mobile}`}
                      className="text-[#4338ca] hover:underline font-medium"
                    >
                      {company.contacts?.[0]?.mobile}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-[13px]">
                    <Mail className="text-[#4338ca] flex-shrink-0" size={16} />
                    <a
                      href={`mailto:${company.email}`}
                      className="text-[#4338ca] hover:underline"
                    >
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

              <div className="border-l-[3px] border-gray-600 pl-6 text-gray-700 leading-5 text-[10px]">
                <p className="text-md font-semibold text-gray-600 uppercase tracking-wider mb-1">About Company</p>
                {company?.companyDescription ||
                  <span className="text-red-600 text-[12px] leading-5">Tell buyers, visitors, and business partners about your company, products, services, and expertise. A well-written company profile helps increase visibility and generate more business opportunities.</span>}
              </div>
            </div>
          </div>

          {/* INFO CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1">

            <div className="bg-white rounded-2xl border border-gray-300 px-3 py-2 flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="text-green-600" />
              </div>

              <div>
                <p className="text-gray-500 text-[12px]">Industry / Sector</p>
                <h3 className="font-semibold text-[11px] mt-1">
                  {company?.category}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 px-3 py-2 flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="text-blue-600" />
              </div>

              <div>
                <p className="text-gray-500 text-[12px]">
                  Lead Generation Date
                </p>

                <h3 className="font-semibold text-[11px] mt-1">
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

            <div className="bg-white rounded-2xl border border-gray-300 px-3 py-2 flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Shield className="text-green-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-[12px]">Exhibitor Category</p>
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
                <h3 className="font-semibold text-[11px] mt-1 text-green-600">
                  {company?.exhibitorCategory || "-"}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 px-3 py-2 flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="text-orange-500" />
              </div>

              <div>
                <p className="text-gray-500 text-[12px]">
                  Client Status
                </p>

                <h3 className="font-semibold text-[11px] mt-1 text-orange-500">
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
                  color: "purple-600"
                },
                {
                  icon: Receipt,
                  title: "Proforma Invoice",
                  color: "orange-600",
                },
                {
                  icon: Folder,
                  title: "Documentation",
                  color: "blue-600",
                },
                {
                  icon: Wallet,
                  title: "Payments",
                  color: "green-600"
                },
                {
                  icon: UserCircle,
                  title: "Contact Details",
                  color: "indigo-600",
                },
                {
                  icon: FaWhatsapp,
                  title: "WhatsApp Chat",
                  color: "green-500",
                },
                {
                  icon: Mail,
                  title: "Email",
                  color: "blue-600",
                },
                {
                  icon: Phone,
                  title: "Call",
                  color: "teal-600",
                },
              ].map((item, index) => (
                <div
                  key={index}
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

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">

                <div>
                  <label className="text-xs font-semibold mb-1 block">Status Update</label>
                  <SearchableDropdown
                    options={statusOptions?.map((item) => ({ label: item.name, value: item.name })) || []}
                    value={reviewData.status_short}
                    onChange={(e) => {
                      setReviewData(prev => ({ ...prev, status_short: e.target.value }));
                      setFlip(true);
                    }}
                    placeholder="Select Status"
                    name="ClientStatus"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Reminder Date & Time</label>
                  <input
                    type="datetime-local"
                    id="ReminderDateTime"
                    value={reviewData.reminder_dt}
                    onChange={handleChange}
                    className="w-full h-10 border border-[#dbe1ea] px-3 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Next Action</label>
                  <SearchableDropdown
                    options={users?.map((u) => ({ label: u.fullName || u.username, value: u.username })) || []}
                    value={reviewData.forward_to}
                    onChange={(e) => setReviewData(prev => ({ ...prev, forward_to: e.target.value }))}
                    placeholder="Select Next Action"
                    name="ForwardTo"
                  />
                </div>

                <div className="xl:col-span-3 flex items-center gap-3">
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#0f172a]">CONTACT DETAILS</h2>
              <button onClick={handleOpenAddContact} className="h-8 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold flex items-center gap-1">
                + Add Contact
              </button>
            </div>

            {company.contacts && company.contacts.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {company.contacts.map((contact, idx) => (
                  <div key={idx} className="flex items-start gap-1 p-3 rounded-xl border border-gray-200 bg-gray-50 w-[260px] relative">
                    <button onClick={() => handleOpenEditContact(idx)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors">
                      <Pencil size={12} />
                    </button>
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-lg overflow-hidden">
                      {contact.photo ? (
                        <img src={contact.photo.startsWith('http') ? contact.photo : `${SERVER_URL}${contact.photo}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        contact.firstName ? contact.firstName.charAt(0).toUpperCase() : "?"
                      )}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-[12px] font-bold text-gray-800 truncate">
                        {[contact.title, contact.firstName, contact.surname].filter(Boolean).join(" ") || "-"}
                      </p>
                      <p className="text-[10px] text-gray-400 mb-1.5">{contact.designation || "-"}</p>
                      <a href={`tel:${contact.mobile}`} className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline">
                        <Phone size={10} /> {contact.mobile || "-"}{contact.alternate ? ` / ${contact.alternate}` : ""}
                      </a>
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-0.5">
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

        <div className="bg-white rounded-2xl border border-gray-300 p-4 flex flex-col h-[calc(86vh)]">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl font-bold text-[#0f172a]">
              CHAT & COMMUNICATION
            </h2>

            <button className="w-10 h-10 rounded-xl border flex items-center justify-center">
              -
            </button>
          </div>

          {/* TABS */}

          <div className="flex flex-nowrap gap-2 mb-4">

            {["All", "WhatsApp", "Calls", "Emails", "Notes"].map(
              (tab, index) => (
                <button
                  key={index}
                  className={`h-8 px-4 rounded-xl border text-xs font-semibold whitespace-nowrap ${index === 0
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white"
                    }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* CHAT LIST */}

          <div className="flex-1 overflow-y-auto pr-2 space-y-5">

            {filteredReviews?.map((item, index) => (
              <div key={index}>

                <div className="text-center text-sm font-semibold text-gray-500 mb-2">
                  26 May 2026
                </div>

                <div className="flex gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MessageCircleMore className="text-green-600" />
                  </div>

                  <div className="flex-1">

                    <div className="bg-[#f6fbf4] rounded-2xl p-2 relative">

                      <p className="text-[12px] leading-8 text-[#0f172a]">
                        {item.re_msg}
                      </p>

                      <div className="flex justify-between items-center mt-2">

                        <span className="text-xs text-gray-400">
                          26 May 2026
                        </span>

                        <span className="text-xs text-gray-400">
                          05:34 PM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MESSAGE BOX */}

          <div className="mt-5">

            <div className="h-14 border rounded-2xl flex items-center px-5">

              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 outline-none bg-transparent"
              />

              <button className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white">
                <Send size={20} />
              </button>
            </div>

            <button className="w-full h-14 border border-green-300 text-green-600 rounded-2xl mt-5 font-semibold">
              View Full Communication History
            </button>
          </div>
        </div>
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
    </div>
  );
};

export default ClientOverview1;