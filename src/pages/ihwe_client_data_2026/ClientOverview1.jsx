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
  updateCompany,
} from "../../features/company/companySlice";

import {
  fetchReviewById,
  deleteReview,
  createReview,
} from "../../features/crm-exhibator-reviews/crmExhibatorReviewSlice";

import { fetchStatusOptions } from "../../features/add_by_admin/statusOption/statusOptionSlice";
import { fetchNextActions } from "../../features/add_by_admin/nextAction/nextActionSlice";
import { fetchAdmins } from "../../features/auth/userSlice";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

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
  const [searchParams] = useSearchParams();
  const isExhibitor = searchParams.get('source') === 'exhibitor';

  const [events, setEvents] = useState([]);
  const [Flip, setFlip] = useState(false);


  const { reviews } = useSelector((state) => state.reviews);

  const { statusOptions } = useSelector(
    (state) => state.statusOptions
  );

  const { nextActions } = useSelector((state) => state.nextActions);
  const { users } = useSelector((state) => state.users);
  const { user: authUser } = useSelector((state) => state.auth || {});

  let currentUserName = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || '';
  try {
    const userObjStr = localStorage.getItem('user') || sessionStorage.getItem('user') || localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo') || localStorage.getItem('admin') || sessionStorage.getItem('admin');
    if (userObjStr) {
      const userObj = JSON.parse(userObjStr);
      if (userObj.name) currentUserName = userObj.name;
      else if (userObj.fullName) currentUserName = userObj.fullName;
      else if (userObj.username) currentUserName = userObj.username;
      else if (userObj.user_name) currentUserName = userObj.user_name;
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }

  // Fallback to authUser
  if (!currentUserName && authUser) {
    currentUserName = authUser.fullName || authUser.name || authUser.username || '';
  }

  if (!currentUserName) currentUserName = 'Admin';

  const [company, setCompany] = useState(null);

  const fetchCompanyDetails = async () => {
    try {
      if (isExhibitor) {
        const res = await api.get(`/api/exhibitor-registration/${id}`);
        const data = res.data.data || res.data;
        const normalizedContacts = [];
        if (data.contact1) normalizedContacts.push(data.contact1);
        if (data.contact2) normalizedContacts.push(data.contact2);

        setCompany({
          ...data,
          contacts: normalizedContacts
        });
      } else {
        const res = await api.get(`/api/companies/${id}`);
        setCompany(res.data);
      }
    } catch (err) {
      console.log("Error fetching client details:", err);
    }
  };

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
    if (id) {
      fetchCompanyDetails();
    }
    dispatch(fetchReviewById(id));
    dispatch(fetchStatusOptions());
    dispatch(fetchNextActions());
    dispatch(fetchAdmins());

    fetchEvents();
  }, [id]);

  useEffect(() => {
    if (company?._id) {
      setReviewData((prev) => ({
        ...prev,
        cmpny_id: company._id,
        evnt_id: isExhibitor ? (company.eventId?._id || "") : (company.eventName || ""),
        event_name: isExhibitor ? (company.eventId?.name || "") : (company.eventName || ""),
        assigned_to: isExhibitor ? (company.spokenWith || "") : (company.forwardTo || ""),
      }));
    }
  }, [company, isExhibitor]);

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
      const previousAssignee = isExhibitor ? (company.spokenWith || "") : (company.forwardTo || "");
      const newAssignee = reviewData.assigned_to || "";
      const assigneeChanged = newAssignee && newAssignee !== previousAssignee;

      const logMessagePrefix = `[Status Update] Changes by ${currentUserName}\n`;
      let finalRemark = reviewData.re_msg || "";

      const changesList = [];
      const currentStatus = isExhibitor ? company.status : company.companyStatus;
      if (reviewData.status_short && reviewData.status_short !== currentStatus) {
        changesList.push(`Status changed from '${currentStatus || "-"}' to '${reviewData.status_short}'`);
      }
      if (assigneeChanged) {
        changesList.push(`Lead forwarded from '${previousAssignee || "Unassigned"}' to '${newAssignee}'`);
      }
      if (finalRemark) {
        changesList.push(`Remark: ${finalRemark}`);
      }

      const changesText = changesList.length > 0 ? changesList.join('\n• ') : "No specific details changed";
      const finalReMsg = `${logMessagePrefix}• ${changesText}`;

      // Create the review entry
      await dispatch(createReview({
        ...reviewData,
        re_msg: finalReMsg,
      })).unwrap();

      if (isExhibitor) {
        const companyUpdates = {
          status: reviewData.status_short || company.status,
        };
        if (assigneeChanged) {
          companyUpdates.spokenWith = newAssignee;
        }
        await api.put(`/api/exhibitor-registration/${company._id}`, companyUpdates);
      } else {
        const companyUpdates = {
          companyStatus: reviewData.status_short || company.companyStatus,
        };
        if (assigneeChanged) {
          companyUpdates.forwardTo = newAssignee;
        }
        await dispatch(updateCompany({ id: company._id, data: companyUpdates })).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      dispatch(fetchReviewById(id));
      fetchCompanyDetails();

      setReviewData({
        cmpny_id: company._id,
        evnt_id: isExhibitor ? (company.eventId?._id || "") : (company.eventName || ""),
        event_name: isExhibitor ? (company.eventId?.name || "") : (company.eventName || ""),
        status_short: "",
        reminder_dt: "",
        forward_to: "",
        assigned_to: newAssignee || previousAssignee,
        follow_up_date: "",
        re_msg: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (reviewId) => {
    await dispatch(deleteReview(reviewId));
    dispatch(fetchReviewById(id));
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
      companyName: isExhibitor ? (company.exhibitorName || "") : (company.companyName || ""),
      mobile: company.contacts?.[0]?.mobile || "",
      email: isExhibitor ? (company.contacts?.[0]?.email || "") : (company.email || ""),
      website: company.website || "",
      companyDescription: company.companyDescription || "",
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
      if (isExhibitor) {
        const dataToUpdate = {
          exhibitorName: editProfileData.companyName,
          website: editProfileData.website,
          companyDescription: editProfileData.companyDescription,
        };
        if (company.contacts?.length > 0) {
          dataToUpdate.contact1 = { ...company.contacts[0], mobile: editProfileData.mobile, email: editProfileData.email };
        }

        if (logoFile) {
          Swal.fire('Notice', 'Logo upload is not yet supported for exhibitor registrations from this page.', 'info');
        }

        await api.put(`/api/exhibitor-registration/${company._id}`, dataToUpdate);
      } else {
        const dataToUpdate = { ...editProfileData };
        if (company.contacts?.length > 0) {
          dataToUpdate.contacts = [...company.contacts];
          dataToUpdate.contacts[0] = { ...dataToUpdate.contacts[0], mobile: editProfileData.mobile };
        }

        if (logoFile) {
          const formData = new FormData();
          formData.append("companyLogo", logoFile);
          const logoRes = await api.post(`/api/companies/${company._id}/logo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        await dispatch(updateCompany({
          id: company._id,
          data: dataToUpdate
        })).unwrap();
      }

      Swal.fire({ icon: "success", title: "Profile Updated", timer: 1500, showConfirmButton: false });
      setIsEditProfileOpen(false);
      fetchCompanyDetails();

      // Determine what changed for the log
      const changes = [];
      const currentName = isExhibitor ? company.exhibitorName : company.companyName;
      if (currentName !== editProfileData.companyName) changes.push(`Name changed from '${currentName}' to '${editProfileData.companyName}'`);

      const currentEmail = isExhibitor ? (company.contacts?.[0]?.email || "") : (company.email || "");
      if (currentEmail !== editProfileData.email) changes.push(`Email changed from '${currentEmail}' to '${editProfileData.email}'`);
      const oldMobile = company.contacts?.[0]?.mobile || "";
      if (oldMobile !== editProfileData.mobile) changes.push(`Mobile changed from '${oldMobile}' to '${editProfileData.mobile}'`);
      if (company.website !== editProfileData.website) changes.push(`Website changed from '${company.website || "-"}' to '${editProfileData.website || "-"}'`);
      if (company.companyDescription !== editProfileData.companyDescription) changes.push(`Description changed from '${company.companyDescription || "-"}' to '${editProfileData.companyDescription || "-"}'`);
      if (logoFile) changes.push(`Company Logo updated`);

      const changesText = changes.length > 0 ? changes.join('\n• ') : "No details modified";
      const logMessage = `[Profile Update] Changes by ${currentUserName}\n• ${changesText}`;

      // Log to communication panel
      dispatch(createReview({ cmpny_id: company._id, type: "log", re_msg: logMessage }));
      dispatch(fetchReviewById(id));
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
      if (isExhibitor) {
        await api.put(`/api/exhibitor-registration/${company._id}`, msmeData);
      } else {
        await dispatch(updateCompany({ id: company._id, data: msmeData })).unwrap();
      }

      const oldCategory = company.exhibitorCategory || "None";
      const newCategory = msmeData.exhibitorCategory || "None";
      const logMessage = `[Exhibitor Category Update] Changes by ${currentUserName}\n• Category changed from '${oldCategory}' to '${newCategory}'`;

      // Log to communication panel
      await dispatch(createReview({
        cmpny_id: company._id,
        type: "log",
        re_msg: logMessage,
      })).unwrap();
      dispatch(fetchReviewById(id));
      Swal.fire({ icon: "success", title: "Exhibitor Category Updated", timer: 1500, showConfirmButton: false });
      setIsMsmeEditOpen(false);
      fetchCompanyDetails();
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
    setContactForm({ title: c.title || "", firstName: c.firstName || "", surname: isExhibitor ? (c.lastName || "") : (c.surname || ""), designation: c.designation || "", email: c.email || "", mobile: c.mobile || "", alternate: isExhibitor ? (c.alternateNo || "") : (c.alternate || "") });
    setContactPhotoFile(null);
    setContactPhotoPreview(c.photo || "");
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSavingContact(true);
    try {
      let photoUrl = contactPhotoPreview && !contactPhotoPreview.startsWith("blob:") ? contactPhotoPreview : (company.contacts?.[editingContactIdx]?.photo || "");

      if (contactPhotoFile) {
        if (isExhibitor) {
          Swal.fire('Notice', 'Contact photo upload is not yet supported for exhibitor registrations from this page.', 'info');
        } else {
          const formData = new FormData();
          formData.append("contactPhoto", contactPhotoFile);
          const res = await api.post(`/api/companies/${company._id}/contact-photo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (res.data?.photoUrl) photoUrl = res.data.photoUrl;
        }
      }

      const updatedContacts = [...(company.contacts || [])];

      let contactData;
      if (isExhibitor) {
        contactData = {
          title: contactForm.title,
          firstName: contactForm.firstName,
          lastName: contactForm.surname,
          email: contactForm.email,
          designation: contactForm.designation,
          mobile: contactForm.mobile,
          alternateNo: contactForm.alternate,
          photo: photoUrl
        };
      } else {
        contactData = { ...contactForm, photo: photoUrl };
      }

      if (editingContactIdx !== null) {
        updatedContacts[editingContactIdx] = { ...updatedContacts[editingContactIdx], ...contactData };
      } else {
        updatedContacts.push(contactData);
      }

      if (isExhibitor) {
        const payload = {};
        if (updatedContacts[0]) payload.contact1 = updatedContacts[0];
        if (updatedContacts[1]) payload.contact2 = updatedContacts[1];
        await api.put(`/api/exhibitor-registration/${company._id}`, payload);
      } else {
        await dispatch(updateCompany({ id: company._id, data: { contacts: updatedContacts } })).unwrap();
      }
      Swal.fire({ icon: "success", title: editingContactIdx !== null ? "Contact Updated" : "Contact Added", timer: 1500, showConfirmButton: false });
      setIsContactModalOpen(false);
      fetchCompanyDetails();

      // Log to communication panel
      const contactName = [contactForm.firstName, contactForm.surname].filter(Boolean).join(" ") || "Unknown Contact";
      let logMessage = "";
      if (editingContactIdx !== null) {
        const oldC = company.contacts[editingContactIdx];
        const changes = [];

        const fieldsToCheck = [
          { key: 'title', label: 'Title' },
          { key: 'firstName', label: 'First Name' },
          { key: 'surname', label: 'Surname' },
          { key: 'designation', label: 'Designation' },
          { key: 'email', label: 'Email' },
          { key: 'mobile', label: 'Mobile' },
          { key: 'alternate', label: 'Alternate Mobile' },
          { key: 'whatsapp', label: 'WhatsApp' },
          { key: 'linkedin', label: 'LinkedIn' }
        ];

        fieldsToCheck.forEach(f => {
          const oldVal = String(oldC[f.key] || "").trim();
          const newVal = String(contactForm[f.key] || "").trim();
          if (oldVal !== newVal) {
            changes.push(`${f.label} changed from '${oldVal || "-"}' to '${newVal || "-"}'`);
          }
        });

        if (contactPhotoFile) changes.push(`Contact Photo updated`);

        const changesText = changes.length > 0 ? changes.join('\n• ') : "Updated without modifying text fields";
        logMessage = `[Contact Update] Changes by ${currentUserName}\nUpdated Contact: ${contactName}\n• ${changesText}`;
      } else {
        logMessage = `[Contact Added] Changes by ${currentUserName}\nAdded New Contact: ${contactName}\n• Designation: ${contactForm.designation || "-"}\n• Mobile: ${contactForm.mobile}\n• Email: ${contactForm.email}`;
      }

      dispatch(createReview({ cmpny_id: company._id, type: "log", re_msg: logMessage }));
      dispatch(fetchReviewById(id));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err?.message || "Could not save contact" });
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleSendEntry = async (data) => {
    try {
      if (data) {
        await dispatch(createReview({
          cmpny_id: company._id,
          ...data
        })).unwrap();
      }
      dispatch(fetchReviewById(id));
    } catch (err) {
      console.log(err);
    }
  };

  if (!company) return null;

  return (
    <div className="bg-[#f5f7fb] px-6 py-4">

      {/* TOP HEADER */}

      <div className="flex items-center justify-between mb-1">

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

        <div className="flex items-center gap-2">

          <button onClick={() => navigate("/ihweClientData2026/addNewClients")} className="h-9 px-5 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold">
            Add Client
          </button>

          <button onClick={() => navigate("/ihweClientData2026/masterData")} className="h-9 px-5 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold">
            Master List
          </button>

          <button disabled className="h-9 px-5 rounded-xl border border-violet-300 text-violet-300 bg-white text-sm font-semibold cursor-not-allowed opacity-70">
            Add MSME Details
          </button>

          <button onClick={() => setShowWhatsAppModal(true)} className="h-9 px-5 rounded-xl border border-green-300 text-green-600 bg-white hover:bg-green-50 text-sm font-semibold flex items-center gap-2">
            <FaWhatsapp />
            Send WhatsApp
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}

      <div className="grid grid-cols-1 min-[1300px]:grid-cols-[1fr_360px] gap-1 items-stretch">

        {/* LEFT SECTION */}

        <div className="space-y-1 min-w-0">

          {/* PROFILE CARD */}

          <div className="bg-white rounded-2xl border border-gray-300 p-3 py-4 overflow-hidden">

            <div className="flex flex-wrap gap-4 items-start">

              {/* LOGO */}

              <div className="border border-gray-300 rounded-2xl p-3 flex items-center justify-center h-[130px] w-[160px] flex-shrink-0">
                {(isExhibitor ? company.companyLogoUrl : company.companyLogo) ? (
                  <img
                    src={(isExhibitor ? company.companyLogoUrl : company.companyLogo).startsWith('http') ? (isExhibitor ? company.companyLogoUrl : company.companyLogo) : `${SERVER_URL}${isExhibitor ? company.companyLogoUrl : company.companyLogo}`}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Building2 className="text-gray-300 mx-auto" size={36} />
                    <p className="text-[10px] font-bold text-gray-500 mt-1">Company Logo</p>
                    <p className="text-[11px] text-red-500 mt-1 leading-tight">Add your logo to enhance<br />brand visibility</p>
                  </div>
                )}
              </div>

              {/* COMPANY INFO */}

              <div className="flex-1 min-w-[200px]">

                <div className="flex items-center gap-1 w-full">
                  <h2 className="text-[14px] font-semibold text-[#0f172a] whitespace-nowrap">
                    {isExhibitor ? company.exhibitorName : company.companyName}
                  </h2>
                  <button onClick={handleOpenEditProfile} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors flex-shrink-0" title="Edit Profile">
                    <Pencil size={16} />
                  </button>
                </div>

                <div className="mt-1 text-gray-600 text-[10px] font-medium">
                  <span>{isExhibitor ? (company.eventId?.name || "No Event") : (company.eventName || "No Event")}</span>
                  <span className="whitespace-nowrap"> | {company.clientType || (isExhibitor ? "Confirmed Exhibitor" : "New Client")}</span>
                </div>

                <div className="mt-2 space-y-2">

                  <div className="flex items-center gap-2 text-[13px]">
                    <UserCircle className="text-[#4338ca] flex-shrink-0" size={16} />
                    <span className="font-medium text-gray-700">
                      {company.contacts?.[0]?.firstName
                        ? `${company?.contacts[0]?.firstName} ${isExhibitor ? (company?.contacts[0]?.lastName || "") : (company?.contacts[0]?.surname || "")}`.trim()
                        : (isExhibitor ? company?.exhibitorName : company?.companyName)}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium text-gray-700">
                      {company?.contacts[0]?.designation}
                    </span>
                    <span className="text-gray-400">-</span>
                    <a href={`tel:${company.contacts?.[0]?.mobile}`} className="text-[#4338ca] hover:underline font-medium">
                      {company.contacts?.[0]?.mobile}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-[13px]">
                    <Mail className="text-[#4338ca] flex-shrink-0" size={16} />
                    <a href={`mailto:${isExhibitor ? company.contacts?.[0]?.email : company.email}`} className="text-[#4338ca] hover:underline">
                      {isExhibitor ? company.contacts?.[0]?.email : company.email}
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
              <div className="border-l-[3px] border-gray-600 pl-2 text-gray-700 leading-5 text-[10px] w-[260px] flex-shrink-0">
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

          <div className="bg-white rounded-sm border border-gray-300 p-2">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1">

              {[
                {
                  icon: FileText,
                  title: "Proposals / Broucher",
                  color: "purple-600",
                  onClick: () => navigate(`/client-data/${id}/marketing-materials`),
                  disabled: false,
                },
                {
                  icon: Receipt,
                  title: "Proforma Invoice",
                  color: "orange-600",
                  onClick: null,
                  disabled: true,
                },
                {
                  icon: Folder,
                  title: "Documentation",
                  color: "blue-600",
                  onClick: () => navigate(`/client-documents/${id}`),
                  disabled: false,
                },
                {
                  icon: Wallet,
                  title: "Payments",
                  color: "green-600",
                  onClick: null,
                  disabled: true,
                },
                {
                  icon: UserCircle,
                  title: "Contact Details",
                  color: "indigo-600",
                  onClick: null,
                  disabled: true,
                },
                {
                  icon: FaWhatsapp,
                  title: "WhatsApp Chat",
                  color: "green-500",
                  onClick: () => setShowWhatsAppModal(true),
                  disabled: false,
                },
                {
                  icon: Mail,
                  title: "Email",
                  color: "blue-600",
                  onClick: () => setShowEmailModal(true),
                  disabled: false,
                },
                {
                  icon: Phone,
                  title: "Call",
                  color: "teal-600",
                  onClick: () => setShowCallModal(true),
                  disabled: false,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  onClick={!item.disabled ? item.onClick || undefined : undefined}
                  className={`h-[40px] rounded-2xl border px-3 flex items-center justify-between transition-all ${item.disabled
                    ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-80"
                    : "border-gray-300 cursor-pointer hover:shadow-md hover:bg-orange-50 hover:border-orange-300 group"
                    }`}
                >
                  <div className="flex items-center gap-4">

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${item.disabled ? "bg-gray-100" : "bg-gray-100 group-hover:bg-orange-100"}`}>
                      <item.icon size={22} className={`text-${item.color}`} />
                    </div>

                    <span className={`text-[11px] transition-colors ${item.disabled ? "text-gray-400" : "text-[#0f172a] group-hover:text-orange-600"}`}>
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
                    id="status_short"
                    options={statusOptions?.map((item) => ({ label: item.name, value: item.name })) || []}
                    value={reviewData.status_short || (isExhibitor ? company.status : company.companyStatus) || ""}
                    onChange={(e) => setReviewData(prev => ({ ...prev, status_short: e.target ? e.target.value : e }))}
                    placeholder={(isExhibitor ? company?.status : company?.companyStatus) ? `Current: ${isExhibitor ? company.status : company.companyStatus}` : "Select Status"}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Next Action</label>
                  <SearchableDropdown
                    options={nextActions?.filter(n => n.status === 'active').map((n) => ({ label: n.name, value: n.name })) || []}
                    value={reviewData.forward_to}
                    onChange={(e) => setReviewData(prev => ({ ...prev, forward_to: e.target ? e.target.value : e }))}
                    placeholder="Select Next Action"
                    name="ForwardTo"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Forward To</label>
                  <SearchableDropdown
                    id="forward_to"
                    options={users?.map((u) => ({ label: u.fullName || u.username, value: u.username })) || []}
                    value={reviewData.assigned_to || (isExhibitor ? company.spokenWith : company.forwardTo) || ""}
                    onChange={(e) => setReviewData(prev => ({ ...prev, assigned_to: e.target ? e.target.value : e }))}
                    placeholder={(isExhibitor ? company?.spokenWith : company?.forwardTo) ? `Current: ${isExhibitor ? company.spokenWith : company.forwardTo}` : "Select Assigned To"}
                    disabled={typeof reviewData.status_short === 'string' && reviewData.status_short.toLowerCase() === "not interested"}
                    name="AssignedTo"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Follow Up Date</label>
                  <input
                    type="datetime-local"
                    value={reviewData.follow_up_date}
                    onChange={(e) => setReviewData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                    className={`w-full h-10 border border-[#dbe1ea] px-3 outline-none text-sm ${typeof reviewData.status_short === 'string' && reviewData.status_short.toLowerCase() === "not interested" ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                    disabled={typeof reviewData.status_short === 'string' && reviewData.status_short.toLowerCase() === "not interested"}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 min-[1100px]:grid-cols-3 gap-1">
                {company.contacts.map((contact, idx) => (
                  <div key={idx} className="flex flex-row items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50 w-full relative pr-6">
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
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[12px] font-bold text-gray-800 truncate">
                        {[contact.title, contact.firstName, isExhibitor ? contact.lastName : contact.surname].filter(Boolean).join(" ") || "-"} / {contact.designation || "-"}
                      </p>
                      <a href={`tel:${contact.mobile}`} className="flex items-center justify-start gap-1 text-[11px] text-blue-600 hover:underline">
                        <Phone size={10} className="flex-shrink-0" /> <span className="truncate">{contact.mobile || "-"}{(isExhibitor ? contact.alternateNo : contact.alternate) ? ` / ${isExhibitor ? contact.alternateNo : contact.alternate}` : ""}</span>
                      </a>
                      <a href={`mailto:${contact.email}`} className="flex items-center justify-start gap-1 text-[11px] text-blue-600 hover:underline mt-0.5">
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