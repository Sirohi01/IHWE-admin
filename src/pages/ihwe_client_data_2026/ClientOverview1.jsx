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

import api from "../../lib/api";
import { color } from "framer-motion";

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

  if (!company) return null;

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-6 py-4">

      {/* TOP HEADER */}

      <div className="flex items-center justify-between mb-4">

        <div>
          <h1 className="text-[22px] font-bold text-[#0f172a]">
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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">

        {/* LEFT SECTION */}

        <div className="space-y-3">

          {/* PROFILE CARD */}

          <div className="bg-white rounded-2xl border border-gray-300 p-3 py-6">

            <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_320px] gap-6 items-center">

              {/* LOGO */}

              <div className="border border-gray-300 rounded-2xl p-6 flex items-center justify-center h-[210px]">

                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-2 border-green-500 mx-auto flex items-center justify-center">
                    <Building2 className="text-green-600" size={42} />
                  </div>

                  <h2 className="mt-5 text-3xl font-bold">
                    {company.companyName?.split(" ")[0]}
                  </h2>

                  <p className="text-green-600 font-semibold mt-1">
                    ECO WELLNESS
                  </p>
                </div>
              </div>

              {/* COMPANY INFO */}

              <div>

                <div className="flex items-center gap-3 flex-wrap">

                  <h2 className="text-3xl font-bold text-[#0f172a]">
                    {company.companyName}
                  </h2>

                  <span className="px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                    WARM CLIENT
                  </span>
                </div>

                <div className="flex gap-3 mt-1 text-gray-600 font-medium">
                  <span>Organic Expo 2026</span>
                  <span>|</span>
                  <span>New Client</span>
                </div>

                <div className="mt-2 space-y-2">

                  <div className="flex items-center gap-4 text-[14px]">
                    <Mail className="text-[#4338ca]" size={16} />
                    {company.email}
                  </div>

                  <div className="flex items-center gap-4 text-[14px]">
                    <Phone className="text-[#4338ca]" size={18} />
                    {company.contacts?.[0]?.mobile}
                  </div>

                  <div className="flex items-center gap-4 text-[15px]">
                    <Globe className="text-[#4338ca]" size={18} />
                    {company.website}
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="border-l-[3px] border-gray-300 pl-6 text-gray-700 leading-9 text-[13px]">
                {company.companyDescription ||
                  "Rohit's pure, farm-fresh A2 cow milk is sourced directly from dedicated local dairy farmers. Delivered raw to preserve natural enzymes and subtle pasture sweetness, it provides a highly digestible source of bioavailable calcium, Vitamin B12, and A2 proteins."}
              </div>
            </div>
          </div>

          {/* INFO CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

            <div className="bg-white rounded-2xl border border-gray-300 p-3 flex items-start gap-4">

              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <Building2 className="text-green-600" />
              </div>

              <div>
                <p className="text-gray-500 text-[12px]">Industry</p>
                <h3 className="font-semibold text-[11px] mt-2">
                  {company.businessNature}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 p-3 flex items-start gap-4">

              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Calendar className="text-blue-600" />
              </div>

              <div>
                <p className="text-gray-500 text-[12px]">
                  Lead Generation Date
                </p>

                <h3 className="font-semibold text-[11px] mt-2">
                  24 May 2026
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 p-3 flex items-start gap-4">

              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <Shield className="text-green-600" />
              </div>

              <div>
                <p className="text-gray-500 text-[12px]">
                  MSME Application
                </p>

                <h3 className="font-semibold text-[11px] mt-2">
                  Applied
                </h3>

                <p className="text-green-600 font-semibold text-sm mt-1">
                  General Category
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 p-3 flex items-start gap-4">

              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                <BadgeCheck className="text-orange-500" />
              </div>

              <div>
                <p className="text-gray-500 text-[12px]">
                  Client Status
                </p>

                <h3 className="font-semibold text-[11px] mt-2 text-orange-500">
                  Warm Client
                </h3>
              </div>
            </div>
          </div>

          {/* ACTION CARDS */}

          <div className="bg-white rounded-2xl border border-gray-300 p-3">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

              {[
                {
                  icon: Building2,
                  title: "Company Profile",
                  color:"green-600",
                },
                {
                  icon: User2,
                  title: "Contact Details",
                  color:"blue-600",
                },
                {
                  icon: Receipt,
                  title: "Invoice & Receipts",
                  color:"orange-600",
                },
                {
                  icon: FileText,
                  title: "Proposals",
                  color:"purple-600"
                },
                {
                  icon: Wallet,
                  title: "Payments",
                  color:"green-600"
                },
                {
                  icon: Folder,
                  title: "Notes & Documents",
                  color:"blue-600",
                },
                {
                  icon: FaWhatsapp,
                  title: "WhatsApp Chat",
                  color: "green-600",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="h-[60px] rounded-2xl border border-gray-300 px-3 flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <item.icon size={22} className={`text-${item.color}`} />
                    </div>

                    <span className="text-[11px] text-[#0f172a]">
                      {item.title}
                    </span>
                  </div>

                  <ChevronRight />
                </div>
              ))}
            </div>
          </div>

          {/* STATUS UPDATE */}

          <div className="bg-white rounded-2xl border border-gray-300 p-3">

            <h2 className="text-xl font-black text-[#0f172a] mb-6">
              STATUS UPDATE
            </h2>

            <form onSubmit={handleAddReview}>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                <div>

                  <label className="text-sm font-semibold mb-2 block">
                    Status Update
                  </label>

                  <select
                    id="ClientStatus"
                    value={reviewData.status_short}
                    onChange={(e) => {
                      handleChange(e);
                      setFlip(true);
                    }}
                    className="w-full h-12 rounded-xl border border-[#dbe1ea] px-4 outline-none"
                  >
                    <option value="">Select Status</option>

                    {statusOptions?.map((item) => (
                      <option key={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {Flip && (
                  <>
                    <div>

                      <label className="text-sm font-semibold mb-2 block">
                        Reminder Date & Time
                      </label>

                      <input
                        type="datetime-local"
                        id="ReminderDateTime"
                        value={reviewData.reminder_dt}
                        onChange={handleChange}
                        className="w-full h-12 rounded-xl border border-[#dbe1ea] px-4 outline-none"
                      />
                    </div>

                    <div>

                      <label className="text-sm font-semibold mb-2 block">
                        Next Action
                      </label>

                      <select
                        id="ForwardTo"
                        value={reviewData.forward_to}
                        onChange={handleChange}
                        className="w-full h-12 rounded-xl border border-[#dbe1ea] px-4 outline-none"
                      >
                        <option value="">
                          Select Next Action
                        </option>

                        {users?.map((u) => (
                          <option key={u._id}>
                            {u.username}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div className="xl:col-span-2">

                  <label className="text-sm font-semibold mb-2 block">
                    Remark
                  </label>

                  <textarea
                    id="Remark"
                    value={reviewData.re_msg}
                    onChange={handleChange}
                    className="w-full h-[100px] rounded-xl border border-[#dbe1ea] p-4 outline-none resize-none"
                    placeholder="Write your remark here..."
                  />
                </div>
                 <div className="flex items-end">

                      <button
                        type="submit"
                        className="h-14 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-3"
                      >
                        Update Status
                        <Send size={18} />
                      </button>
                    </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT CHAT SECTION */}

        <div className="bg-white rounded-2xl border border-gray-300 p-4 flex flex-col h-[calc(107vh)]">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl font-bold text-[#0f172a]">
              CHAT & COMMUNICATION
            </h2>

            <button className="w-10 h-10 rounded-xl border flex items-center justify-center">
              -
            </button>
          </div>

          {/* TABS */}

          <div className="flex flex-wrap gap-3 mb-6">

            {["All", "WhatsApp", "Calls", "Emails", "Notes"].map(
              (tab, index) => (
                <button
                  key={index}
                  className={`h-11 px-5 rounded-xl border text-sm font-semibold ${
                    index === 0
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
    </div>
  );
};

export default ClientOverview1;