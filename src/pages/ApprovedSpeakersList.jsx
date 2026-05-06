import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Mic, CheckCircle, UserCheck } from "lucide-react";
import api from "../lib/api";
import Globallytable from "../components/Globallytable";
import { showError } from "../utils/toastMessage";

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const ApprovedSpeakersList = () => {
  const navigate = useNavigate();
  const [speakers, setSpeakers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/speaker');
      if (response.data.success) {
        setSpeakers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching speakers:', error);
      showError('Failed to fetch speakers');
    } finally {
      setIsLoading(false);
    }
  };

  // 📋 Table Columns
  const columns = [
    {
      label: "Approved Speaker Name",
      accessor: "speaker.name",
      render: (value, row) => (
        <Link
          to={`/speaker-registration/${row.id}`}
          className="text-blue-500 hover:underline font-medium"
        >
          {value}
        </Link>
      ),
    },
    { label: "Designation & Organization", accessor: "speaker.designation" },
    { label: "Contact Details", accessor: "contact.details" },
    { label: "Topic", accessor: "session.topic" },
    { label: "Session Type", accessor: "session.type" },
    { label: "Track", accessor: "session.track" },
    { label: "Experience", accessor: "speaker.experience" },
    {
      label: "Status",
      accessor: "status.current",
      render: (value) => (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {value}
        </span>
      )
    },
    {
      label: "Actions",
      accessor: "actions",
      render: (value, row) => (
        <button
          onClick={() => navigate(`/speaker-registration/${row.id}`)}
          className="text-blue-600 hover:text-blue-900 p-1"
          title="View Details"
        >
          <Eye className="w-5 h-5" />
        </button>
      ),
    },
  ];

  // 🧱 Prepare Rows - Filter only Approved speakers
  const approvedSpeakers = speakers.filter(
    (speaker) => speaker.status === "Approved"
  );

  const rows = approvedSpeakers.map((s) => ({
    id: s._id,
    checkbox: true,
    speaker: {
      name: toTitleCase(s.fullName),
      designation: `${toTitleCase(s.designation)} at ${toTitleCase(s.organization)}`,
      experience: s.totalExperience || "-",
    },
    contact: {
      details: `${s.mobile} | ${s.email}`,
    },
    session: {
      topic: s.preferredTopic || "-",
      type: s.sessionType || "-",
      track: s.preferredTrack || "-",
    },
    status: {
      current: s.status,
    },
    actions: "",
  }));

  return (
    <>
      {/* Hero Banner */}
      <div className="relative w-full h-64 overflow-hidden rounded mt-8">
        {/* Background Image */}
        <img
          src="/dashbordBan.png"
          alt="Approved Speakers Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
          <CheckCircle className="w-16 h-16 mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-center">
            Approved Speakers
          </h1>
          <p className="text-lg mt-2 text-center text-white/90">
            View all confirmed speakers for the conference
          </p>
        </div>
      </div>

      <div className="w-full h-auto bg-[#eef1f5]">
        {/* 🔹 Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center py-3 px-6 border-b border-gray-300 bg-white gap-4">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h1 className="text-xl font-semibold text-slate-600 uppercase tracking-tight leading-none text-center lg:text-left">
              APPROVED SPEAKERS | Conference Management Section
            </h1>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-auto">
            <button
              onClick={() => navigate("/speaker-registration-list")}
              className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
            >
              <Mic size={12} /> Speaker Nominations
            </button>
            <button
              onClick={() => navigate("/approved-speakers-list")}
              className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#26a65b] hover:bg-[#1e8449] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
            >
              <CheckCircle size={12} /> Approved Speakers
            </button>
            <button
              onClick={() => navigate("/agenda-management")}
              className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-[#3598dc] hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
            >
              <UserCheck size={12} /> Conference Agenda
            </button>
            <button
              onClick={() => navigate("/rejected-speakers-list")}
              className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase bg-red-500 hover:bg-[#286090] text-white transition-colors flex items-center justify-center gap-1.5 rounded-[2px] shadow-sm whitespace-nowrap"
            >
              <CheckCircle size={12} /> Rejected Speakers
            </button>
          </div>
        </div>

        {/* 🔹 Main Section */}
        <div className="bg-white m-4 p-2 rounded shadow-sm">
          <div className="flex justify-between items-center pr-4">
            <h1 className="text-lg font-medium text-gray-800 px-4">
              APPROVED SPEAKERS
            </h1>
          </div>

          <hr className="opacity-10 my-2" />

          {/* 🔹 Data Table */}
          <div className="text-xs">
            {isLoading ? (
              <div className="text-center text-gray-500 py-4">Loading...</div>
            ) : approvedSpeakers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No approved speakers yet
              </div>
            ) : (
              <Globallytable
                rows={rows}
                colomns={columns}
                style={{ marginTop: "20px" }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ApprovedSpeakersList;
