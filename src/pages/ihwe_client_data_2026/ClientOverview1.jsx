import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
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
  MessageCircleMore,
  KanbanSquare,
  X,
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
import { fetchCountries } from "../../features/add_by_admin/country/countrySlice";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import api, { SERVER_URL, aiVerificationSettingsApi } from "../../lib/api";
import CommunicationPanel from "./communication/CommunicationPanel";
import WhatsAppModal from "./communication/WhatsAppModal";
import EmailModal from "./communication/EmailModal";
import CallLogModal from "./communication/CallLogModal";
import SearchableDropdown from "../../components/SearchableDropdown";
const getArrayFromSlice = (sliceState, fallbackKey) => {
  if (Array.isArray(sliceState)) return sliceState;
  if (sliceState && typeof sliceState === "object" && fallbackKey in sliceState && Array.isArray(sliceState[fallbackKey])) {
    return sliceState[fallbackKey];
  }
  return [];
};

const getMediaUrl = (value) => {
  if (!value) return "";
  const normalized = String(value).replace(/\\/g, "/");
  if (normalized.startsWith("blob:") || normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  const uploadsIndex = normalized.indexOf("/uploads/");
  if (uploadsIndex >= 0) return `${SERVER_URL}${normalized.slice(uploadsIndex)}`;
  const relativeUploadsIndex = normalized.indexOf("uploads/");
  if (relativeUploadsIndex >= 0) return `${SERVER_URL}/${normalized.slice(relativeUploadsIndex)}`;
  if (normalized.startsWith("/uploads/")) return `${SERVER_URL}${normalized}`;
  if (normalized.startsWith("uploads/")) return `${SERVER_URL}/${normalized}`;
  return `${SERVER_URL}/${normalized.replace(/^\/+/, "")}`;
};

const SecureImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = React.useState("");

  React.useEffect(() => {
    let objectUrl = "";
    const loadImg = async () => {
      if (!src) {
        setImgSrc("");
        return;
      }
      const mediaUrl = getMediaUrl(src);
      if (!mediaUrl || mediaUrl.startsWith("blob:")) {
        setImgSrc(mediaUrl);
        return;
      }
      try {
        const res = await api.get(mediaUrl, { responseType: "blob" });
        objectUrl = URL.createObjectURL(res.data);
        setImgSrc(objectUrl);
      } catch (err) {
        setImgSrc(mediaUrl);
      }
    };
    loadImg();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!imgSrc) return null;
  return <img loading="lazy" decoding="async" src={imgSrc} alt={alt || ""} className={className} />;
};

const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const ClientOverview1 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id, eventId: routeEventId } = useParams();
  const [searchParams] = useSearchParams();
  const isExhibitor = searchParams.get('source') === 'exhibitor';
  const selectedEventId = routeEventId || searchParams.get('eventId') || "";

  const [events, setEvents] = useState([]);
  const [Flip, setFlip] = useState(false);
  const [businessTypesOptions, setBusinessTypesOptions] = useState([
    "Pvt. Ltd. Company",
    "Pub. Ltd. Company",
    "Partnership Company",
    "Limited Liability Partnership (LLP)",
    "One Person Company",
    "Sole Proprietorship",
    "Section 8 Company",
    "Others"
  ]);

  const [industryOptions, setIndustryOptions] = useState([
    "Medical & Healthcare",
    "AYUSH & Traditional Medicine",
    "Wellness, Fitness & Lifestyle",
    "Nutrition, Organic & Health Foods",
    "Beauty, Personal Care & Aesthetic Wellness",
    "Mental Health, Yoga & Spiritual Wellness",
    "Medical Technology, Diagnostics & Devices",
    "Institutions, Government Bodies & Startups"
  ]);

  React.useEffect(() => {
    api.get("/api/lead-type-of-business?activeOnly=true").then(res => {
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        const names = data.sort((a, b) => (a.order || 0) - (b.order || 0)).map(b => b.name).filter(Boolean);
        if (names.length > 0) setBusinessTypesOptions(names);
      }
    }).catch(e => console.error(e));

    api.get("/api/lead-industry?activeOnly=true").then(res => {
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        const names = data.sort((a, b) => (a.order || 0) - (b.order || 0)).map(b => b.name).filter(Boolean);
        if (names.length > 0) setIndustryOptions(names);
      }
    }).catch(e => console.error(e));
  }, []);


  const { reviews } = useSelector((state) => state.reviews);

  const { statusOptions } = useSelector(
    (state) => state.statusOptions
  );

  const { nextActions } = useSelector((state) => state.nextActions);
  const { users } = useSelector((state) => state.users);

  const countriesState = useSelector((state) => state.countries);
  const countriesArray = getArrayFromSlice(countriesState, "countries")
    .slice()
    .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
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
  const [companyLogoSrc, setCompanyLogoSrc] = useState("");

  const getCrmTargetId = () => (isExhibitor ? company?.clientId : company?._id);
  const getExhibitorTargetId = () => (isExhibitor ? company?._id : null);
  const getReviewTargetId = () => company?.clientId || company?._id || id;

  const fetchCompanyDetails = async () => {
    try {
      if (isExhibitor) {
        try {
          const res = await api.get(`/api/exhibitor-registration/${id}?light=true&t=${Date.now()}`);
          let data = res.data.data || res.data;

          if (data.clientId) {
            try {
              const crmRes = await api.get(`/api/companies/${data.clientId}${selectedEventId ? `?eventId=${selectedEventId}` : ""}`);
              const crmData = crmRes.data;
              data = {
                ...crmData,
                ...data,
                companyLogoUrl: data.companyLogoUrl || crmData.companyLogo,
                _id: data._id
              };

              if (data.contact1 && crmData.contacts && crmData.contacts[0]) {
                const crmContact = crmData.contacts[0];
                data.contact1.firstName = data.contact1.firstName || data.contact1.name || crmContact.firstName || crmContact.name || "";
                data.contact1.lastName = data.contact1.lastName || crmContact.surname || "";
                data.contact1.designation = data.contact1.designation || crmContact.designation || "";
                data.contact1.email = data.contact1.email || crmContact.email || "";
                data.contact1.mobile = data.contact1.mobile || crmContact.mobile || "";
                data.contact1.photoUrl = data.contact1.photoUrl || data.contact1.photo || crmContact.photoUrl || crmContact.photo;
              }
              if (data.contact2 && crmData.contacts && crmData.contacts[1]) {
                data.contact2.photoUrl = data.contact2.photoUrl || data.contact2.photo || crmData.contacts[1].photo;
              }
            } catch (crmErr) {
              console.log("Failed to fetch CRM company for exhibitor", crmErr);
            }
          }
          data.companyDescription = data.companyDescription || data.aboutCompany;
          data.category = data.category || data.industrySector || data.typeOfBusiness;
          data.exhibitorCategory = data.exhibitorCategory || data.participation?.stallCategory;
          data.companyStatus = data.companyStatus || data.status;

          try {
            const resContacts = await api.get(`/api/client-contacts/${data.clientId || id}`);
            data.contacts = resContacts.data?.data || [];
          } catch (e) { console.log(e); }

          setCompany(data);
          return;
        } catch (err) {
          console.log("Error fetching exhibitor, falling back to companies...", err);
        }
      }

      // Default to companies, or fallback from exhibitor
      try {
        const res = await api.get(`/api/companies/${id}${selectedEventId ? `?eventId=${selectedEventId}` : ""}`);
        let data = res.data;
        try {
          const resContacts = await api.get(`/api/client-contacts/${id}`);
          data.contacts = resContacts.data?.data || [];
        } catch (e) { console.log(e); }
        setCompany(data);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 400) {
          console.log("Not found in companies, trying exhibitor-registration...");
          try {
            const res = await api.get(`/api/exhibitor-registration/${id}?light=true&t=${Date.now()}`);
            let data = res.data.data || res.data;
            try {
              const resContacts = await api.get(`/api/client-contacts/${id}`);
              data.contacts = resContacts.data?.data || [];
            } catch (e) { console.log(e); }
            setCompany(data);
          } catch (err2) {
            console.log("Not found in exhibitor-registration, trying referrals...");
            try {
              const resRef = await api.get(`/api/referrals/${id}`);
              let refData = resRef.data.data || resRef.data;
              refData = {
                ...refData,
                companyName: refData.companyName,
                mobileNo: refData.mobileNumber,
                email: refData.emailId,
                industrySector: refData.category,
                aboutCompany: refData.remarks,
                companyStatus: refData.status,
                contacts: [{
                  firstName: refData.contactPerson,
                  mobile: refData.mobileNumber,
                  email: refData.emailId
                }]
              };
              setCompany(refData);
            } catch (err3) {
              console.log("Not found in referrals either.");
              throw err3;
            }
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.log("Error fetching client details:", err);
    }
  };

  const filteredReviews = useMemo(() => {
    const targetId = getReviewTargetId();
    return Array.isArray(reviews)
      ? reviews.filter((rev) => rev?.cmpny_id === targetId)
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
  }, [id]);

  useEffect(() => {
    if (!company) return;
    dispatch(fetchStatusOptions());
    dispatch(fetchNextActions());
    dispatch(fetchAdmins());
    fetchEvents();
  }, [company?._id]);

  useEffect(() => {
    if (company?._id) {
      const targetId = company.clientId || company._id;
      dispatch(fetchReviewById({ id: targetId, limit: 8, eventId: selectedEventId }));

      setReviewData((prev) => ({
        ...prev,
        cmpny_id: targetId,
        evnt_id: selectedEventId || (isExhibitor ? (company.eventId?._id || company.eventId || "") : (company.eventId || "")),
        event_name: company.eventLifecycle?.eventName || (isExhibitor ? (company.eventId?.name || "") : (company.eventName || "")),
        assigned_to: isExhibitor ? (company.spokenWith || "") : (company.forwardTo || ""),
      }));
    }
  }, [company, isExhibitor]);

  useEffect(() => {
    let objectUrl = "";
    const rawLogo = company?.companyLogoUrl || company?.companyLogo;

    const loadLogo = async () => {
      if (!rawLogo) {
        setCompanyLogoSrc("");
        return;
      }

      const mediaUrl = getMediaUrl(rawLogo);
      if (!mediaUrl || mediaUrl.startsWith("blob:")) {
        setCompanyLogoSrc(mediaUrl);
        return;
      }

      try {
        const res = await api.get(mediaUrl, { responseType: "blob" });
        objectUrl = URL.createObjectURL(res.data);
        setCompanyLogoSrc(objectUrl);
      } catch (err) {
        console.log("Logo blob load failed, using direct URL", err);
        setCompanyLogoSrc(mediaUrl);
      }
    };

    loadLogo();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [company?.companyLogoUrl, company?.companyLogo]);

  const fetchEvents = async () => {
    try {
      const res = await api.get(selectedEventId ? "/api/crm-events" : "/api/events");
      const rows = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setEvents(rows);
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
      const targetCrmId = getReviewTargetId();
      const statusToSave = reviewData.status_short || company.companyStatus || "";
      const followUpDate = reviewData.follow_up_date || reviewData.reminder_dt || "";

      const logMessagePrefix = `[Status Update] Changes by ${currentUserName}\n`;
      let finalRemark = reviewData.re_msg || "";

      const changesList = [];
      const currentStatus = company.companyStatus;
      if (statusToSave && statusToSave !== currentStatus) {
        changesList.push(`Status changed from '${currentStatus || "-"}' to '${statusToSave}'`);
      }
      if (reviewData.forward_to) {
        changesList.push(`Next action: ${reviewData.forward_to}`);
      }
      if (followUpDate) {
        changesList.push(`Follow-up scheduled for ${new Date(followUpDate).toLocaleString("en-IN")}`);
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
        cmpny_id: targetCrmId,
        status_short: statusToSave,
        reminder_dt: followUpDate,
        follow_up_date: followUpDate,
        re_msg: finalReMsg,
        updated_by: currentUserName,
      })).unwrap();

      const companyUpdates = {
        companyStatus: statusToSave,
      };
      if (followUpDate) {
        companyUpdates.reminder = followUpDate;
        companyUpdates.followUpDate = followUpDate;
      }
      if (assigneeChanged) {
        companyUpdates.forwardTo = newAssignee;
      }

      const effectiveEventId = selectedEventId || (isExhibitor ? (company.eventId?._id || company.eventId || "") : "");
      if (effectiveEventId) {
        const exhibitorRegId = isExhibitor ? (company?.registrationId ? company._id : (id || null)) : null;
        const regEventId = isExhibitor ? (company?.eventId?._id || company?.eventId || null) : null;
        await api.put(`/api/companies/${targetCrmId}/events/${effectiveEventId}/lifecycle`, {
          status: reviewData.status_short || company.companyStatus,
          ...(assigneeChanged ? { forwardTo: newAssignee } : {}),
          lastRemark: finalReMsg,
          reminder: reviewData.reminder_dt || null,
          followUpDate: reviewData.follow_up_date || null,
          ...(exhibitorRegId ? { exhibitorRegistrationId: exhibitorRegId } : {}),
          ...(regEventId ? { registrationEventId: regEventId } : {}),
        });
      } else {
        await dispatch(updateCompany({ id: targetCrmId, data: companyUpdates })).unwrap();
      }

      if (isExhibitor && assigneeChanged) {
        await api.put(`/api/exhibitor-registration/${company._id}`, { spokenWith: newAssignee });
      }

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      dispatch(fetchReviewById({ id: targetCrmId, eventId: effectiveEventId, limit: 8 }));
      fetchCompanyDetails();

      setReviewData({
        cmpny_id: company?.clientId || company?._id,
        evnt_id: effectiveEventId,
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
    dispatch(fetchReviewById({ id: company?.clientId || company?._id || id, eventId: selectedEventId, limit: 8 }));
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
  const [isSendingRegistration, setIsSendingRegistration] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    companyName: "",
    email: "",
    landline: "",
    website: "",
    companyDescription: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    category: "",
    businessNature: "",
    dataSource: "",
    gstNumber: "",
    panNo: "",
    udyamNumber: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoVerification, setLogoVerification] = useState({ status: "idle", message: "" });
  const [udyamCertFile, setUdyamCertFile] = useState(null);
  const [udyamCertUrl, setUdyamCertUrl] = useState("");
  const [isUploadingUdyamCert, setIsUploadingUdyamCert] = useState(false);

  const handleSendRegistration = async () => {
    const registrationId = company?.exhibitorRegistrationId || company?._id || id;
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Send Registration?",
      text: "This will generate fresh exhibitor login credentials and manually send the registration email and WhatsApp.",
      showCancelButton: true,
      confirmButtonText: "Yes, Send",
      confirmButtonColor: "#124170",
    });
    if (!confirmation.isConfirmed) return;

    try {
      setIsSendingRegistration(true);
      const response = await api.post(`/api/exhibitor-registration/${registrationId}/send-registration`);
      await Swal.fire("Sent!", response.data?.message || "Registration communication sent successfully.", "success");
    } catch (error) {
      await Swal.fire("Not Sent", error.response?.data?.message || "Registration communication failed.", "error");
    } finally {
      setIsSendingRegistration(false);
    }
  };
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (isEditProfileOpen) {
      dispatch(fetchCountries());
    }
  }, [isEditProfileOpen, dispatch]);

  const handleProfilePincodeChange = async (val) => {
    const numericVal = val.replace(/\D/g, "").slice(0, 6);
    setEditProfileData(prev => ({ ...prev, pincode: numericVal }));

    if (numericVal.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${numericVal}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setEditProfileData(prev => ({
            ...prev,
            state: postOffice.State || prev.state,
            city: postOffice.District || prev.city,
            country: "India",
          }));
        }
      } catch (error) {
        console.error("Error fetching pincode details:", error);
      }
    }
  };

  const handleOpenEditProfile = async () => {
    setEditProfileData({
      companyName: isExhibitor ? (company.exhibitorName || "") : (company.companyName || ""),
      landline: company.landlineNo || company.landline || "",
      email: company.officialEmail || company.companyEmail || (isExhibitor ? company.contacts?.[0]?.email : company.email) || "",
      website: company.website || "",
      companyDescription: company.companyDescription || company.aboutCompany || "",
      address: company.address || "",
      country: company.country || "",
      state: company.state || "",
      city: company.city || "",
      pincode: company.pincode || company.pinCode || "",
      category: company.category || company.typeOfBusiness || "",
      businessNature: company.businessNature || company.industrySector || "",
      dataSource: company.dataSource || company.referredBy || "",
      gstNumber: company.gstNumber || company.gstNo || "",
      panNo: company.panNo || "",
      udyamNumber: company.udyamNumber || company.msme?.udyamRegNo || "",
    });
    setLogoFile(null);
    setLogoPreview(company?.companyLogoUrl || company?.companyLogo || "");
    setLogoVerification({ status: "idle", message: "" });
    setUdyamCertFile(null);
    setUdyamCertUrl(company?.msme?.udyamCertificateUrl || company?.udyamCertificateUrl || "");
    setIsEditProfileOpen(true);

    // GST may have only ever been entered directly on a Proforma/Estimate (never saved to the
    // profile). If the profile field is blank, backfill from that client's most recent estimate
    // instead of leaving it empty — never overwrites a value already present on the profile.
    if (!(company.gstNumber || company.gstNo)) {
      const lookupId = getCrmTargetId() || getExhibitorTargetId();
      if (lookupId) {
        try {
          const res = await api.get(`/api/estimates/grouped/${lookupId}`);
          const latestWithGst = (res.data?.data || []).find((est) => est.company_gst_no || est.gst_no);
          const fallbackGst = latestWithGst?.company_gst_no || latestWithGst?.gst_no;
          if (fallbackGst) {
            setEditProfileData((prev) => (prev.gstNumber ? prev : { ...prev, gstNumber: fallbackGst }));
          }
        } catch (err) {
          console.log("No prior estimate GST found for this client", err);
        }
      }
    }
  };

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setEditProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
    setLogoVerification({ status: "scanning", message: "Scanning logo..." });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentName", "Company Logo");
      const response = await aiVerificationSettingsApi.testDocument(formData);
      const result = response?.result;
      const logoRejectMessage = result?.issue === "mismatch"
        ? "Please upload a clear company logo or brand image, not a person/model/photo shoot image."
        : result?.reason?.includes("AI provider's safety system")
          ? "AI could not verify this image confidently. Please upload a clear company logo or brand image."
          : (result?.reason || "This logo was rejected by AI verification.");

      if (!result?.skipped && result?.valid === false) {
        URL.revokeObjectURL(previewUrl);
        setLogoFile(null);
        setLogoPreview(company?.companyLogoUrl || company?.companyLogo || "");
        setLogoVerification({
          status: "invalid",
          message: logoRejectMessage
        });
        e.target.value = "";
        return Swal.fire(
          "Logo Rejected",
          logoRejectMessage,
          "warning"
        );
      }

      setLogoVerification({
        status: result?.skipped ? "idle" : "valid",
        message: result?.skipped ? "" : "AI verified"
      });
    } catch (err) {
      URL.revokeObjectURL(previewUrl);
      setLogoFile(null);
      setLogoPreview(company?.companyLogoUrl || company?.companyLogo || "");
      setLogoVerification({
        status: "invalid",
        message: err.response?.data?.message || "Logo verification failed."
      });
      e.target.value = "";
      Swal.fire(
        "Logo Verification Failed",
        err.response?.data?.message || "Please try another logo image.",
        "warning"
      );
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const requiredValues = [
      editProfileData.companyName,
      editProfileData.email,
      editProfileData.website,
      editProfileData.companyDescription
    ];
    if (requiredValues.some((value) => !String(value || "").trim())) {
      return Swal.fire("Required", "Please fill all company profile fields.", "warning");
    }
    if (!logoPreview && !logoFile) {
      return Swal.fire("Required", "Company Logo is required.", "warning");
    }
    if (logoVerification.status === "scanning") {
      return Swal.fire("Please Wait", "Company Logo is still being scanned.", "info");
    }
    if (logoVerification.status === "invalid") {
      return Swal.fire("Logo Rejected", logoVerification.message || "Please upload a valid company logo.", "warning");
    }
    if (editProfileData.companyDescription.length < 250 || editProfileData.companyDescription.length > 300) {
      return Swal.fire("Invalid About Company", "About Company must contain 250 to 300 characters.", "warning");
    }
    setIsSavingProfile(true);
    try {
      const crmTargetId = getCrmTargetId();
      const exhibitorTargetId = getExhibitorTargetId();
      let photoUrl = company?.companyLogoUrl || company?.companyLogo || "";

      // 1. Upload logo if any. Exhibitor records without a linked CRM company use exhibitor KYC upload.
      if (logoFile) {
        const formData = new FormData();
        formData.append("companyLogo", logoFile);
        try {
          if (crmTargetId) {
            const logoRes = await api.post(`/api/companies/${crmTargetId}/logo`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            photoUrl = logoRes.data.data.companyLogo;
          } else if (exhibitorTargetId) {
            const logoRes = await api.put(`/api/exhibitor-registration/${exhibitorTargetId}/kyc-doc`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            photoUrl = logoRes.data?.data?.companyLogoUrl || photoUrl;
          }
        } catch (logoErr) {
          console.log("Error uploading logo", logoErr);
          const message = logoErr.response?.data?.message || "Company logo could not be uploaded.";
          Swal.fire("Logo Rejected", message, "warning");
          setIsSavingProfile(false);
          return;
        }
      }

      // 1b. Upload Udyam certificate if any. For an exhibitor, run it through the same
      // AI verify-and-extract used by the "Book a Stand" flow, so the extracted fields
      // (enterprise name, category, etc.) get mapped onto the registration too — not
      // just the file link. A CRM-only company (no linked ExhibitorRegistration) has
      // nowhere to map extracted fields into, so it just stores the file.
      let udyamCertUrlToSave = udyamCertUrl;
      let udyamExtractedDetails = null;
      let udyamRegNoFromAi = "";
      if (udyamCertFile) {
        setIsUploadingUdyamCert(true);
        try {
          if (exhibitorTargetId) {
            const certFormData = new FormData();
            certFormData.append("file", udyamCertFile);
            const certRes = await api.post(`/api/msme-pms-scheme/verify-udyam-certificate`, certFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            udyamCertUrlToSave = certRes.data?.data?.fileUrl || udyamCertUrlToSave;
            udyamExtractedDetails = certRes.data?.data?.extractedDetails || null;
            udyamRegNoFromAi = certRes.data?.data?.udyamRegNo || "";
          } else if (crmTargetId) {
            const certFormData = new FormData();
            certFormData.append("udyamCertificate", udyamCertFile);
            const certRes = await api.post(`/api/companies/${crmTargetId}/udyam-certificate`, certFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            udyamCertUrlToSave = certRes.data?.data?.udyamCertificateUrl || udyamCertUrlToSave;
          }
        } catch (certErr) {
          console.log("Error uploading Udyam certificate", certErr);
          const message = certErr.response?.data?.message || "Udyam certificate could not be uploaded.";
          Swal.fire("Certificate Rejected", message, "warning");
          setIsUploadingUdyamCert(false);
          setIsSavingProfile(false);
          return;
        }
        setIsUploadingUdyamCert(false);
      }

      // 2. Prepare CRM company payload
      const crmDataToUpdate = { ...editProfileData, companyLogo: photoUrl, udyamCertificateUrl: udyamCertUrlToSave };

      // 3. Update CRM company
      if (crmTargetId) {
        await dispatch(updateCompany({
          id: crmTargetId,
          data: crmDataToUpdate
        })).unwrap();
      }

      // 4. Update ExhibitorRegistration if applicable
      if (exhibitorTargetId) {
        const exhibitorDataToUpdate = {
          exhibitorName: editProfileData.companyName,
          companyEmail: editProfileData.email,
          landlineNo: editProfileData.landline,
          website: editProfileData.website,
          aboutCompany: editProfileData.companyDescription,
          companyLogoUrl: photoUrl,
          address: editProfileData.address,
          country: editProfileData.country,
          state: editProfileData.state,
          city: editProfileData.city,
          pincode: editProfileData.pincode,
          typeOfBusiness: editProfileData.category,
          industrySector: editProfileData.businessNature,
          gstNo: editProfileData.gstNumber,
          panNo: editProfileData.panNo,
          // Admin-typed Udyam number wins when present; otherwise fall back to what AI
          // just read off the uploaded certificate (matches the MSME PMS convention).
          'msme.udyamRegNo': editProfileData.udyamNumber || udyamRegNoFromAi,
          'msme.udyamCertificateUrl': udyamCertUrlToSave,
        };
        if (udyamExtractedDetails) {
          exhibitorDataToUpdate['msme.udyamExtractedDetails'] = udyamExtractedDetails;
          if (udyamExtractedDetails['Enterprise Name']) exhibitorDataToUpdate['msme.udyamEnterpriseName'] = udyamExtractedDetails['Enterprise Name'];
          if (udyamExtractedDetails['Type of Enterprise (Micro/Small/Medium)']) exhibitorDataToUpdate['msme.udyamEnterpriseSize'] = udyamExtractedDetails['Type of Enterprise (Micro/Small/Medium)'];
          if (udyamExtractedDetails['Major Activity (Manufacturing/Service/Trading)']) exhibitorDataToUpdate['msme.udyamMajorActivity'] = udyamExtractedDetails['Major Activity (Manufacturing/Service/Trading)'];
        }
        await api.put(`/api/exhibitor-registration/${exhibitorTargetId}`, exhibitorDataToUpdate);
      }

      Swal.fire({ icon: "success", title: "Profile Updated", timer: 1500, showConfirmButton: false });
      setIsEditProfileOpen(false);
      fetchCompanyDetails();

      // Determine what changed for the log
      const changes = [];
      const currentName = isExhibitor ? (company.exhibitorName || company.companyName) : company.companyName;
      if (currentName !== editProfileData.companyName) changes.push(`Name changed from '${currentName}' to '${editProfileData.companyName}'`);
      if ((company.landlineNo || company.landline || "") !== editProfileData.landline) changes.push(`Landline updated`);
      if ((company.officialEmail || company.companyEmail || company.email || "") !== editProfileData.email) changes.push(`Company Email updated`);
      if (logoFile) changes.push(`Company Logo updated`);

      if (changes.length > 0) {
        const currentUserName = JSON.parse(localStorage.getItem('user'))?.name || 'User';
        const changesText = changes.join('\n• ');
        const logMessage = `[Profile Update] Changes by ${currentUserName}\n• ${changesText}`;

        // Log to communication panel
        await dispatch(createReview({ cmpny_id: crmTargetId || exhibitorTargetId, type: "log", re_msg: logMessage })).unwrap();
        dispatch(fetchReviewById({ id: company?.clientId || company?._id || id, eventId: selectedEventId, limit: 8 }));
      }
    } catch (err) {
      console.log(err);
      Swal.fire({ icon: "error", title: "Update Failed", text: err?.message || "Could not save profile" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveMsme = async (e) => {
    e.preventDefault();
    setIsSavingMsme(true);
    try {
      // exhibitorCategory only exists on the Company schema (not
      // ExhibitorRegistration) — always save it there, using the linked
      // Company id when viewing via an exhibitor registration.
      const targetCompanyId = isExhibitor ? company.clientId : company._id;
      if (!targetCompanyId) {
        throw new Error('This exhibitor has no linked CRM company to save the category against yet.');
      }
      await dispatch(updateCompany({ id: targetCompanyId, data: msmeData })).unwrap();

      const oldCategory = company.exhibitorCategory || "None";
      const newCategory = msmeData.exhibitorCategory || "None";
      const logMessage = `[Exhibitor Category Update] Changes by ${currentUserName}\n• Category changed from '${oldCategory}' to '${newCategory}'`;

      const targetId = company?.clientId || company?._id;
      // Log to communication panel
      await dispatch(createReview({
        cmpny_id: targetId,
        type: "log",
        re_msg: logMessage,
      })).unwrap();
      dispatch(fetchReviewById({ id: company?.clientId || company?._id || id, eventId: selectedEventId, limit: 8 }));
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
    setContactPhotoPreview(c.photoUrl || c.photo || "");
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSavingContact(true);
    try {
      const crmTargetId = getCrmTargetId();
      const exhibitorTargetId = getExhibitorTargetId();
      let photoUrl = contactPhotoPreview && !contactPhotoPreview.startsWith("blob:")
        ? contactPhotoPreview
        : (company.contacts?.[editingContactIdx]?.photoUrl || company.contacts?.[editingContactIdx]?.photo || "");

      if (contactPhotoFile) {
        const formData = new FormData();
        formData.append("contactPhoto", contactPhotoFile);
        try {
          const res = crmTargetId
            ? await api.post(`/api/companies/${crmTargetId}/contact-photo`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            : await api.post(`/api/exhibitor-registration/${exhibitorTargetId}/contact-photo`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          if (res.data?.photoUrl) photoUrl = res.data.photoUrl;
        } catch (err) {
          console.log(err);
        }
      }

      const updatedContacts = [...(company.contacts || [])];
      let logMessage = "";
      const currentUserName = JSON.parse(localStorage.getItem('user'))?.name || 'User';

      if (editingContactIdx !== null) {
        updatedContacts[editingContactIdx] = { ...contactForm, photo: photoUrl, photoUrl };
        logMessage = `[Contact Update] Changes by ${currentUserName}\nUpdated Contact: ${contactForm.firstName} ${contactForm.surname}`;
      } else {
        updatedContacts.push({ ...contactForm, photo: photoUrl, photoUrl });
        const contactName = `${contactForm.title} ${contactForm.firstName} ${contactForm.surname}`.trim();
        logMessage = `[Contact Added] Changes by ${currentUserName}\nAdded New Contact: ${contactName}\n• Designation: ${contactForm.designation || "-"}\n• Mobile: ${contactForm.mobile}\n• Email: ${contactForm.email}`;
      }

      if (crmTargetId) {
        await dispatch(updateCompany({ id: crmTargetId, data: { contacts: updatedContacts } })).unwrap();
      }

      if (exhibitorTargetId) {
        const mapContact = (c) => c ? {
          title: c.title,
          firstName: c.firstName,
          lastName: c.surname,
          email: c.email,
          designation: c.designation,
          mobile: c.mobile,
          alternateNo: c.alternate,
          photoUrl: c.photoUrl || c.photo
        } : null;

        const payload = { contact1: null, contact2: null };
        if (updatedContacts[0]) payload.contact1 = mapContact(updatedContacts[0]);
        if (updatedContacts[1]) payload.contact2 = mapContact(updatedContacts[1]);
        await api.put(`/api/exhibitor-registration/${exhibitorTargetId}`, payload);
      }

      await dispatch(createReview({ cmpny_id: crmTargetId || exhibitorTargetId, type: "log", re_msg: logMessage })).unwrap();
      dispatch(fetchReviewById({ id: company?.clientId || company?._id || id, eventId: selectedEventId, limit: 8 }));

      Swal.fire({ icon: "success", title: editingContactIdx !== null ? "Contact Updated" : "Contact Added", timer: 1500, showConfirmButton: false });
      setIsContactModalOpen(false);
      fetchCompanyDetails();

    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err?.message || "Could not save contact" });
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleSendEntry = async (data) => {
    try {
      const targetId = getReviewTargetId();
      if (data) {
        await dispatch(createReview({
          cmpny_id: targetId,
          ...data
        })).unwrap();
      }
      dispatch(fetchReviewById({ id: company?.clientId || company?._id, eventId: selectedEventId, limit: 8 }));
    } catch (err) {
      console.log(err);
    }
  };

  const displayEmail =
    company?.officialEmail
    || company?.companyEmail
    || (isExhibitor ? company?.contacts?.[0]?.email : company?.email)
    || "";

  const displayPhone =
    company?.contacts?.[0]?.mobile
    || company?.mobile
    || company?.mobileNo
    || company?.landlineNo
    || company?.landline
    || "";

  if (!company) {
    return (
      <div className="bg-[#f5f7fb] w-full min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-semibold animate-pulse">Loading Client Details...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] px-6 py-4" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* TOP HEADER */}

      <div className="flex items-center justify-between mb-1">

        <div>
          <h1 className="text-[16px] font-bold text-slate-800 flex items-center gap-3">
            CLIENT PROFILE
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
            <span>Dashboard</span>
            <ChevronRight size={12} />
            <span>Client Profile</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          <button onClick={() => navigate(selectedEventId ? `/crm-event/${selectedEventId}/add-client` : "/ihweClientData2026/addNewClients")} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm">
            Add Client
          </button>
          <button onClick={() => navigate("/ihweClientData2026/masterData")} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm">
            Master List
          </button>
          <button onClick={() => navigate(`/msme-pms-application/${company?.clientId || company?._id || id}`)} className="px-2.5 py-1.5 bg-[#124170] text-white rounded-md text-[10px] font-bold hover:bg-[#0A2643] transition-all shadow-sm">
            MSME PMS
          </button>
          {isExhibitor && (
            <button
              onClick={handleSendRegistration}
              disabled={isSendingRegistration}
              className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-md text-[10px] font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1 disabled:opacity-60"
            >
              <Mail size={12} /> {isSendingRegistration ? "Sending..." : "Send Registration"}
            </button>
          )}
          <button onClick={() => setShowWhatsAppModal(true)} className="px-2.5 py-1.5 bg-[#0D530E] text-white rounded-md text-[10px] font-bold hover:bg-[#093a0a] transition-all shadow-sm flex items-center gap-1">
            <FaWhatsapp size={12} /> Send WhatsApp
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}

      <div className="grid grid-cols-1 min-[1300px]:grid-cols-[1fr_360px] gap-1.5 items-stretch" style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* LEFT SECTION */}

        <div className="space-y-1 min-w-0">

          {/* PROFILE CARD */}

          <div className="bg-white rounded-lg p-2.5 overflow-hidden" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>

            <div className="flex flex-wrap gap-4 items-start p-1">

              {/* LOGO */}

              <div className="border border-gray-300 rounded-2xl p-1 flex items-center justify-center w-fit h-fit min-h-[110px] min-w-[130px] flex-shrink-0 overflow-hidden bg-white">
                {(companyLogoSrc || company.companyLogoUrl || company.companyLogo) ? (
                  <img loading="lazy" decoding="async" src={companyLogoSrc || getMediaUrl(company.companyLogoUrl || company.companyLogo)}
                    alt="Logo"
                    className="max-w-[160px] max-h-[130px] w-auto h-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center w-[140px]">
                    <Building2 className="text-gray-300 mx-auto" size={36} />
                    <p className="text-[10px] font-bold text-gray-500 mt-1">Company Logo</p>
                    <p className="text-[11px] text-red-500 mt-1 leading-tight">Add your logo to enhance<br />brand visibility</p>
                  </div>
                )}
              </div>

              {/* COMPANY INFO */}

              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-1 w-full">
                  <h2 className="text-[16px] font-semibold text-[#093C5D] whitespace-nowrap">
                    {toTitleCase(isExhibitor ? company.exhibitorName : company.companyName)}
                  </h2>
                  <button onClick={handleOpenEditProfile} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors flex-shrink-0" title="Edit Profile">
                    <Pencil size={14} />
                  </button>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[#0D530E] text-[10px] font-bold">
                  <span>{isExhibitor ? (company.eventId?.name || "No Event") : (company.eventName || "No Event")}</span>
                  <span className="text-[10px] leading-tight" style={{ color: '#4B1426' }}>
                    {company.previousExhibition?.name
                      ? `Existing Exhibitor | ${company.previousExhibition.name} ${company.previousExhibition.year ? '| ' + company.previousExhibition.year : ''}`
                      : `New Lead${(company.referredBy || company.dataSource) ? ` From ${(company.referredBy || company.dataSource) === 'Referral' && company.referralName
                        ? `Referral (${company.referralName}${company.referralMobile ? ' - ' + company.referralMobile : ''})`
                        : (company.referredBy || company.dataSource) === 'Social Media' && company.socialMediaType
                          ? `Social Media (${company.socialMediaType})`
                          : (company.referredBy || company.dataSource)
                        }` : ''}`
                    }
                  </span>
                </div>

                <div className="mt-2 space-y-1.5">

                  <div className="flex items-center gap-2 text-[11px]">
                    <UserCircle className="text-emerald-600 flex-shrink-0" size={14} />
                    <span className="font-semibold text-[#000000]">
                      {company?.contacts?.[0]?.name
                        ? company.contacts[0].name
                        : company?.contactPerson
                          ? company.contactPerson
                          : company?.contacts?.[0]?.firstName
                            ? `${company.contacts[0].firstName} ${isExhibitor ? (company.contacts[0].lastName || "") : (company.contacts[0].surname || "")}`.trim()
                            : (isExhibitor ? company?.exhibitorName : company?.companyName)}
                    </span>
                    {(company?.designation || company?.contacts?.[0]?.designation) && (
                      <>
                        <span className="text-slate-400 font-bold">/</span>
                        <span className="font-semibold text-[#5E0006]">
                          {company.designation || company?.contacts[0]?.designation}
                        </span>
                      </>
                    )}
                    {displayPhone && (
                      <span className="text-slate-400 font-bold">-</span>
                    )}
                    <a href={`tel:${displayPhone}`} className="text-[#093C5D] hover:underline font-bold">
                      {displayPhone || "-"}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <Mail className="text-purple-600 flex-shrink-0" size={14} />
                    <a href={`mailto:${displayEmail}`} className="text-[#443199] hover:underline font-semibold">
                      {displayEmail || "-"}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <Globe className="text-blue-600 flex-shrink-0" size={14} />
                    <a
                      href={company?.website?.startsWith('http') ? company?.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-700 font-bold"
                    >
                      {company?.website}
                    </a>
                  </div>

                  {(company?.gstNumber || company?.gstNo) && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Receipt className="text-amber-600 flex-shrink-0" size={14} />
                      <span className="font-semibold text-[#0A2947]">{company?.gstNumber || company?.gstNo}</span>
                    </div>
                  )}

                  {(company?.address || company?.city || company?.state || company?.country || company?.pincode) && (
                    <div className="flex items-start gap-2 text-[11px]">
                      <MapPin className="text-rose-600 flex-shrink-0 mt-0.5" size={14} />
                      <div className="font-semibold text-[#0A2947] break-words flex flex-col">
                        {company?.address && <span>{company.address}</span>}
                        {[
                          [company?.city, company?.pincode ? `- ${company.pincode}` : ''].filter(Boolean).join(' '),
                          company?.state,
                          company?.country,
                        ].filter(Boolean).length > 0 && (
                          <span>
                            {[
                              [company?.city, company?.pincode ? `- ${company.pincode}` : ''].filter(Boolean).join(' '),
                              company?.state,
                              company?.country,
                            ].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="border-l-[3px] border-emerald-500 pl-2.5 text-[#15173D] leading-[1.4] text-[10px] font-medium w-[260px] flex-shrink-0">
                <p className="text-[11px] font-semibold text-[#0f172a] tracking-tight mb-1">About Company</p>
                <p className="break-words whitespace-normal font-semibold text-slate-500">
                  {company?.companyDescription || company?.aboutCompany ||
                    <span className="text-slate-500 text-[10px] leading-4">Tell buyers, visitors, and business partners about your company, products, services, and expertise. A well-written company profile helps increase visibility and generate more business opportunities.</span>}
                </p>
              </div>
            </div>
          </div>

          {/* INFO CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1.5">

            <div className="bg-white rounded-lg p-2 flex items-center gap-2.5 min-w-0" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="text-green-600" size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-900 text-[9px] font-semibold whitespace-nowrap uppercase tracking-wider">Industry / Sector</p>
                <h3 className="font-bold text-[10px] mt-0.5 truncate text-[#5E0006]">
                  {company?.category || "-"}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 flex items-center gap-2.5 min-w-0" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-slate-900 text-[9px] font-semibold whitespace-nowrap uppercase tracking-wider">
                  Lead Generation Date
                </p>
                <h3 className="font-bold text-[10px] mt-0.5 truncate text-[#15173D]">
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

            <div className="bg-white rounded-lg p-2 flex items-center gap-2.5 min-w-0" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Shield className="text-green-600" size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-slate-900 text-[9px] font-semibold whitespace-nowrap uppercase tracking-wider">Exhibitor Category</p>
                  <button
                    onClick={() => {
                      setMsmeData({
                        exhibitorCategory: company?.exhibitorCategory || "",
                      });
                      setIsMsmeEditOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                    title="Edit Exhibitor Category"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
                <h3 className="font-bold text-[9.5px] mt-0.5 truncate text-[#0D530E]">
                  {company?.exhibitorCategory || "-"}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 flex items-center gap-2.5 min-w-0" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <KanbanSquare className="text-amber-600" size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-900 text-[9px] font-semibold whitespace-nowrap uppercase tracking-wider">Client Status</p>
                <h3 className="font-bold text-[11px] mt-0.5 truncate text-[#8A3B00]">
                  {company?.eventLifecycle?.status || company?.companyStatus || company?.status || "New Lead"}
                </h3>
              </div>
            </div>

          </div>

          {/* ACTION CARDS */}

          <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1.5">

              {[
                {
                  icon: FileText,
                  title: "Proposals / Broucher",
                  color: "purple-600",
                  onClick: () => navigate(`/client-data/${company?.clientId || company?._id || id}/marketing-materials${selectedEventId ? `?crmEventId=${selectedEventId}` : ""}`),
                  disabled: false,
                },
                // {
                //   icon: Receipt,
                //   title: "Proforma Invoice",
                //   color: "orange-600",
                //   onClick: () => navigate(`/performa-invoice-list/${company?.clientId || company?._id || id}`),
                //   disabled: false,
                // },
                {
                  icon: Folder,
                  title: "Documentation",
                  color: "blue-600",
                  onClick: () => navigate(`/client-documents/${company?.clientId || company?._id || id}`),
                  disabled: false,
                },
                {
                  icon: Wallet,
                  title: "Account",
                  color: "green-600",
                  onClick: () => {
                    const registrationEventId = company?.eventLifecycle?.registrationEventId || "";
                    const acctParams = new URLSearchParams();
                    if (registrationEventId) acctParams.set("eventId", registrationEventId);
                    // CrmEvent this client was opened under (Organic Expo 2026, IHW Expo
                    // 2026, ...) — carried through Account so any Estimate/Invoice created
                    // from here records which event it belongs to.
                    if (selectedEventId) acctParams.set("crmEventId", selectedEventId);
                    const acctQuery = acctParams.toString();
                    navigate(
                      `/dashboard/account/${company?.clientId || company?._id || id}${acctQuery ? `?${acctQuery}` : ""}`
                    );
                  },
                  disabled: false,
                },
                {
                  icon: UserCircle,
                  title: "Contact Details",
                  color: "indigo-600",
                  onClick: () => navigate(`/client-contacts/${company?.clientId || company?._id || id}`),
                  disabled: false,
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
                  className={`h-[40px] rounded-lg border px-3 flex items-center justify-between transition-all ${item.disabled
                    ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-80"
                    : "border-slate-200 cursor-pointer hover:shadow-sm hover:bg-slate-50 group"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.disabled ? "bg-slate-100" : "bg-slate-100 group-hover:bg-white"}`}>
                      <item.icon size={16} className={`text-${item.color}`} />
                    </div>
                    <span className={`text-[10px] font-bold transition-colors ${item.disabled ? "text-slate-400" : "text-[#15173D]"}`}>
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
              <div
                onClick={() => navigate(`/pms-application/${company?.clientId || company?._id || id}`)}
                className="h-[40px] rounded-lg border px-3 flex items-center justify-between transition-all border-slate-200 cursor-pointer hover:shadow-sm hover:bg-slate-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-slate-100 group-hover:bg-white">
                    <KanbanSquare size={16} className="text-teal-500" />
                  </div>
                  <span className="text-[10px] font-bold transition-colors text-[#15173D]">
                    PMS Application
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STATUS UPDATE */}

          <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
            <div className="flex justify-between items-center -mx-2.5 -mt-2.5 mb-3 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
              <h2 className="text-[12px] font-semibold text-[#15173D] tracking-tight uppercase">
                Lead Status Updates
              </h2>
            </div>

            <form onSubmit={handleAddReview} className="px-1 pb-1">

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 items-end">

                <div>
                  <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Status Update</label>
                  <SearchableDropdown
                    id="status_short"
                    options={statusOptions?.map((item) => ({ label: item.name, value: item.name })) || []}
                    value={reviewData.status_short || company.companyStatus || ""}
                    onChange={(e) => setReviewData(prev => ({ ...prev, status_short: e.target ? e.target.value : e }))}
                    placeholder={company?.companyStatus ? `Current: ${company.companyStatus}` : "Select Status"}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Next Action</label>
                  <SearchableDropdown
                    options={nextActions?.filter(n => n.status === 'active').map((n) => ({ label: n.name, value: n.name })) || []}
                    value={reviewData.forward_to}
                    onChange={(e) => setReviewData(prev => ({ ...prev, forward_to: e.target ? e.target.value : e }))}
                    placeholder="Select Next Action"
                    name="ForwardTo"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Forward To</label>
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
                  <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Follow Up Date</label>
                  <input
                    type="datetime-local"
                    value={reviewData.follow_up_date}
                    onChange={(e) => setReviewData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                    className={`w-full h-[32px] rounded border border-slate-200 px-2 outline-none text-[11px] font-semibold text-[#0A2947] focus:border-emerald-500 ${typeof reviewData.status_short === 'string' && reviewData.status_short.toLowerCase() === "not interested" ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                    disabled={typeof reviewData.status_short === 'string' && reviewData.status_short.toLowerCase() === "not interested"}
                  />
                </div>

                <div className="col-span-2 xl:col-span-4 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Remark</label>
                    <textarea
                      id="Remark"
                      value={reviewData.re_msg}
                      onChange={handleChange}
                      className="w-full h-[36px] rounded border border-slate-200 p-2 outline-none resize-none text-[11px] font-semibold text-[#0A2947] focus:border-emerald-500"
                      placeholder="Write your remark here..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-[36px] px-5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 text-[11px] flex-shrink-0 transition-colors shadow-sm cursor-pointer"
                  >
                    Update Status
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* CONTACT DETAILS */}
          <div className="bg-white rounded-lg p-2.5" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
            <div className="flex items-center justify-between -mx-2.5 -mt-2.5 mb-3 px-3 py-2 bg-slate-100 border-b border-slate-200 rounded-t-lg">
              <h2 className="text-[12px] font-semibold text-[#15173D] tracking-tight uppercase">CONTACT DETAILS</h2>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/client-contacts/${company?.clientId || company?._id || id}`)} className="h-6 px-3 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-semibold flex items-center gap-2 shadow-sm cursor-pointer">
                  View All
                </button>
                <button onClick={() => navigate(`/add-team-members/${company?.clientId || company?._id || id}`)} className="h-6 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer">
                  + Add Team Members
                </button>
              </div>
            </div>

            {company.contacts && company.contacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 min-[1100px]:grid-cols-3 gap-1.5 px-1 pb-1">
                {company.contacts.slice(0, 3).map((contact, idx) => (
                  <div key={idx} className="flex flex-row items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 w-full relative pr-6 hover:bg-white hover:border-emerald-200 transition-colors group">
                    <button onClick={() => navigate(`/client-contacts/${company?.clientId || company?._id || id}`)} className="absolute top-1.5 right-1.5 p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-emerald-600 rounded transition-all cursor-pointer">
                      <Pencil size={12} />
                    </button>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-semibold text-sm overflow-hidden border border-indigo-200">
                      {(contact.photoUrl || contact.photo) ? (
                        <SecureImage
                          src={contact.photoUrl || contact.photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (contact.firstName || contact.name) ? (contact.firstName || contact.name).charAt(0).toUpperCase() : "?"
                      )}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[11px] font-semibold text-black truncate">
                        {contact.name || [contact.title, contact.firstName, isExhibitor ? contact.lastName : contact.surname].filter(Boolean).join(" ") || "-"} / <span className="text-[#4B1426]">{contact.designation || "-"}</span>
                      </p>
                      <a href={`tel:${contact.mobile}`} className="flex items-center justify-start gap-1 text-[9px] text-[#093C5D] font-semibold hover:underline">
                        <Phone size={10} className="flex-shrink-0" /> <span className="truncate">{contact.mobile || "-"}{(isExhibitor ? contact.alternateNo : contact.alternate) ? ` / ${isExhibitor ? contact.alternateNo : contact.alternate}` : ""}</span>
                      </a>
                      <a href={`mailto:${contact.email}`} className="flex items-center justify-start gap-1 text-[9px] text-[#443199] font-semibold hover:underline mt-0.5">
                        <Mail size={10} className="flex-shrink-0" />
                        <span className="truncate">{contact.email || "-"}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-semibold text-slate-400 italic px-2">No contact details available.</p>
            )}
          </div>
        </div>

        {/* RIGHT CHAT SECTION */}
        <CommunicationPanel
          company={company}
          reviews={filteredReviews}
          onSendEntry={handleSendEntry}
          onOpenFullHistory={() => {
            const targetId = company.clientId || company._id;
            dispatch(fetchReviewById({ id: targetId, eventId: selectedEventId, limit: 8 }));
          }}
        />
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[1050] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl w-full max-w-6xl overflow-hidden animate-fadeIn text-[#15173D]"
            style={{
              fontFamily: 'Inter, sans-serif',
              boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 bg-slate-100 border-b border-slate-200">
              <h2 className="text-[15px] font-bold text-[#15173D] tracking-tight uppercase">Edit Company Profile</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="editCompanyProfileForm"
                  disabled={isSavingProfile || logoVerification.status === "scanning" || logoVerification.status === "invalid"}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-xs"
                >
                  {isSavingProfile ? "Saving..." : logoVerification.status === "scanning" ? "Scanning..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form id="editCompanyProfileForm" onSubmit={handleSaveProfile} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto bg-slate-50/50">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="bg-white p-5 rounded-md border border-slate-200" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
                <h3 className="text-[13px] font-bold text-[#15173D] uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                  <Building2 size={16} className="text-[#133458]" /> Company Profile & Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Company Name <span className="text-red-500">*</span></label>
                    <input type="text" id="companyName" value={editProfileData.companyName} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Company Logo <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-3">
                      {logoPreview && (
                        <img loading="lazy" decoding="async" src={getMediaUrl(logoPreview)} alt="Logo Preview" className="w-10 h-10 object-contain rounded-sm border border-slate-200 bg-slate-50 p-1" />
                      )}
                      <label className="flex-1 h-10 flex items-center justify-center gap-2 rounded-sm border border-dashed border-slate-300 hover:border-[#15173D] cursor-pointer text-sm font-semibold text-slate-500 hover:text-[#15173D] transition-colors bg-white">
                        <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                        📷 {logoFile ? logoFile.name : "Choose Logo Image"}
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Type of Business</label>
                    <select id="category" value={editProfileData.category} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black">
                      <option value="">Select Here</option>
                      {businessTypesOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  {logoVerification.message && (
                    <div className="md:col-span-3 -mt-1">
                      <p className={`text-sm font-bold ${logoVerification.status === "invalid" ? "text-red-500" : "text-emerald-600"}`}>
                        {logoVerification.message}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Industry / Sector</label>
                    <select id="businessNature" value={editProfileData.businessNature} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black">
                      <option value="">Select Here</option>
                      {industryOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Source</label>
                    <select id="dataSource" value={editProfileData.dataSource} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black">
                      <option value="">Select Here</option>
                      <option>Direct Calling</option>
                      <option>Direct Website</option>
                      <option>Email Marketing</option>
                      <option>Google (GMB / GMV)</option>
                      <option>Referral</option>
                      <option>Social Media</option>
                      <option>WhatsApp Marketing</option>
                      <option>Others</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT INFORMATION */}
              <div className="bg-white p-5 rounded-md border border-slate-200" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
                <h3 className="text-[13px] font-bold text-[#15173D] uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                  <Mail size={16} className="text-[#133458]" /> Contact &amp; Digital Presence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Company Email <span className="text-red-500">*</span></label>
                    <input type="email" id="email" value={editProfileData.email} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Landline</label>
                    <input type="text" id="landline" value={editProfileData.landline} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Website <span className="text-red-500">*</span></label>
                    <input type="text" id="website" value={editProfileData.website} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" required />
                  </div>
                </div>
              </div>

              {/* SECTION 3: STATUTORY & LOCATION */}
              <div className="bg-white p-5 rounded-md border border-slate-200" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
                <h3 className="text-[13px] font-bold text-[#15173D] uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#133458]" /> Statutory Numbers &amp; Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">GST Number</label>
                    <input type="text" id="gstNumber" value={editProfileData.gstNumber} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">PAN Number</label>
                    <input type="text" id="panNo" value={editProfileData.panNo} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Udyam/MSME Number</label>
                    <input type="text" id="udyamNumber" value={editProfileData.udyamNumber} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Udyam Certificate</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setUdyamCertFile(e.target.files?.[0] || null)}
                      className="w-full h-10 px-2.5 py-1.5 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-[13px] font-medium bg-white text-black"
                    />
                    {(udyamCertFile || udyamCertUrl) && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        {udyamCertFile && <span className="text-slate-600 font-medium truncate">{udyamCertFile.name}</span>}
                        {!udyamCertFile && udyamCertUrl && (
                          <a href={getMediaUrl(udyamCertUrl)} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">View current certificate</a>
                        )}
                        {isUploadingUdyamCert && <span className="text-slate-400">Verifying…</span>}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Pincode</label>
                    <input type="text" id="pincode" maxLength={6} value={editProfileData.pincode} onChange={(e) => handleProfilePincodeChange(e.target.value)} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" placeholder="6-digit pincode" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Country</label>
                    <SearchableDropdown
                      name="country"
                      value={editProfileData.country}
                      onChange={(e) => setEditProfileData(prev => ({ ...prev, country: e.target.value, state: "", city: "" }))}
                      placeholder="Select Country"
                      options={countriesArray.map(c => ({ label: c?.name, value: c?.name }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">State</label>
                    <input type="text" id="state" value={editProfileData.state} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" placeholder="Auto-filled from Pincode" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">City</label>
                    <input type="text" id="city" value={editProfileData.city} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" placeholder="Auto-filled from Pincode" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-black mb-1.5">Address</label>
                    <input type="text" id="address" value={editProfileData.address} onChange={handleProfileChange} className="w-full h-10 px-3 rounded-sm border border-slate-300 outline-none focus:border-[#15173D] text-sm font-medium bg-white text-black" />
                  </div>
                </div>
              </div>

              {/* SECTION 4: COMPANY DESCRIPTION */}
              <div className="bg-white p-5 rounded-md border border-slate-200" style={{ boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px' }}>
                <h3 className="text-[13px] font-bold text-[#15173D] uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <FileText size={16} className="text-[#133458]" /> Company Description (About) <span className="text-red-500">*</span>
                </h3>
                <textarea
                  id="companyDescription"
                  value={editProfileData.companyDescription}
                  onChange={(event) => setEditProfileData((current) => ({
                    ...current,
                    companyDescription: event.target.value
                  }))}
                  minLength={250}
                  required
                  rows={5}
                  className={`w-full p-3.5 rounded-sm border outline-none focus:border-[#15173D] resize-none text-sm font-medium bg-white ${(editProfileData.companyDescription.length > 0 && editProfileData.companyDescription.length < 250) || editProfileData.companyDescription.length > 300 ? "border-red-300" : "border-slate-300"}`}
                  placeholder="Enter concise company overview, vision, and core products/services (250–300 characters)..."
                />
                <div className="mt-1.5 text-sm font-bold text-red-600">
                  {editProfileData.companyDescription.length < 250 || editProfileData.companyDescription.length > 300
                    ? `Length must be 250 to 300 characters. (${editProfileData.companyDescription.length}/300)`
                    : `Character requirement met. (${editProfileData.companyDescription.length}/300)`}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MSME EDIT MODAL */}
      {isMsmeEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[1050] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl w-full max-w-md overflow-hidden text-[#15173D]"
            style={{
              fontFamily: 'Inter, sans-serif',
              boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
            }}
          >
            <div className="flex items-center justify-between p-3.5 bg-slate-100 border-b border-slate-200">
              <h2 className="text-[13px] font-bold text-[#15173D] tracking-tight uppercase">Edit Exhibitor Category</h2>
              <button
                onClick={() => setIsMsmeEditOpen(false)}
                className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveMsme} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exhibitor Category</label>
                <select
                  value={msmeData.exhibitorCategory}
                  onChange={(e) => setMsmeData(prev => ({ ...prev, exhibitorCategory: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 outline-none focus:border-[#15173D] text-xs font-medium bg-white"
                >
                  <option value="">Select Category</option>
                  <option value="Under MSME PMS Scheme">Under MSME PMS Scheme</option>
                  <option value="Under General Category">Under General Category</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMsmeEditOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMsme}
                  className="px-3.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-70 shadow-xs"
                >
                  {isSavingMsme ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CONTACT MODAL */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[1050] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl w-full max-w-lg overflow-hidden text-[#15173D]"
            style={{
              fontFamily: 'Inter, sans-serif',
              boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
            }}
          >
            <div className="flex items-center justify-between p-3.5 bg-slate-100 border-b border-slate-200">
              <h2 className="text-[13px] font-bold text-[#15173D] tracking-tight uppercase">{editingContactIdx !== null ? "Edit Contact" : "Add Contact"}</h2>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveContact} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              {/* Photo Upload */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0 text-indigo-600 font-bold text-lg">
                  {contactPhotoPreview ? (
                    <SecureImage src={contactPhotoPreview} alt="" className="w-full h-full object-cover" />
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
