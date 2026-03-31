import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCorporateVisitors,
  updateCorporateVisitor,
} from "../../../features/visitor/corporateVisitorSlice";
import { fetchEvents } from "../../../features/crmEvent/crmEventSlice";
import {
  createVisitorReview,
  fetchReviewsByVisitorId,
  clearVisitorReviews,
  deleteVisitorReview,
} from "../../../features/visitor/visitorReviewSlice";
import { FaTrash, FaUser } from "react-icons/fa";
import { showSuccess } from "../../../utils/toastMessage";

const CorporateOverview = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { corporateVisitors, loading } = useSelector(
    (state) => state.corporateVisitors,
  );

  const { events } = useSelector((state) => state.crmEvents);

  const { visitorReviews, loading: reviewLoading } = useSelector(
    (state) => state.visitorReview,
  );

  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const statusOptions = [
    "Data Send",
    "Reminded 1 Sent",
    "Reminded 2 Sent",
    "Reminded 3 Sent",
  ];

  useEffect(() => {
    if (corporateVisitors.length === 0) {
      dispatch(fetchCorporateVisitors());
    }
    dispatch(fetchEvents());
    dispatch(fetchReviewsByVisitorId(id));
    return () => {
      dispatch(clearVisitorReviews());
    };
  }, [dispatch, id, corporateVisitors.length]);

  const visitor = corporateVisitors.find((v) => v._id === id);

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePost = async () => {
    setPostError("");
    setPostSuccess("");
    if (!status) return setPostError("Please select a status.");
    if (!selectedEvent) return setPostError("Please select an event.");
    if (!description.trim()) return setPostError("Please enter a description.");

    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const userName = user.name || sessionStorage.getItem("user_name") || "User";

    const reviewResult = await dispatch(
      createVisitorReview({
        visitor_id: id,
        visitor_status: status,
        visitor_event: selectedEvent,
        visitor_desc: description.trim(),
        added_by: userName,
      }),
    );
    if (createVisitorReview.rejected.match(reviewResult)) {
      return setPostError(reviewResult.payload || "Failed to create review.");
    }

    const updateResult = await dispatch(
      updateCorporateVisitor({
        id,
        data: { status, updated_by: userName },
      }),
    );
    if (updateCorporateVisitor.rejected.match(updateResult)) {
      return setPostError(
        "Review created but failed to update visitor status.",
      );
    }

    dispatch(fetchReviewsByVisitorId(id));
    setStatus("");
    setDescription("");
    setSelectedEvent("");
    setShowForm(false);
    setPostSuccess("Status updated and review posted successfully.");
    setTimeout(() => setPostSuccess(""), 4000);
  };

  const handleDelete = async (reviewId) => {
    await dispatch(deleteVisitorReview(reviewId));
    showSuccess("Review deleted successfully!");
    dispatch(fetchReviewsByVisitorId(id));
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading visitor details...</p>
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Visitor not found.</p>
      </div>
    );
  }

  const fullName =
    `${visitor.firstName || ""} ${visitor.lastName || ""}`.trim();

  const hasReviews = visitorReviews.length > 0;

  return (
    <div
      className="w-full min-h-screen bg-gray-100"
      style={{ marginTop: "30px" }}
    >
      {/* Header */}
      <div className="w-full bg-white shadow-md mb-6">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-xl font-normal text-gray-700 uppercase">
            Corporate Visitor Data
          </h1>
          {visitor.registrationId && (
            <div className="bg-blue-50 border border-blue-200 px-4 py-1 rounded text-sm text-blue-700 font-normal">
              Registration ID:{" "}
              <span className="font-medium">{visitor.registrationId}</span>
            </div>
          )}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-500 hover:underline"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="flex flex-col m-[22px] gap-4">
        {/* Visitor Information Panel */}
        <div className="bg-white rounded-md shadow border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-medium text-gray-700">
              Visitor Information
            </h2>
            <button
              className="p-2 hover:bg-gray-100 rounded"
              title="Print"
              onClick={() => window.print()}
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </button>
          </div>

          <table className="w-full text-sm border-collapse">
            <tbody>
              {/* Row 1 — Registration Id + Visitor Name + Contact No. */}
              <tr className="border-b border-gray-200">
                <td className="font-medium px-3 py-2 text-gray-500 w-[14%] whitespace-nowrap bg-gray-50">
                  Registration Id
                </td>
                <td className="px-3 py-2 text-blue-600 font-medium w-[19%]">
                  {visitor.registrationId || "N/A"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 w-[14%] whitespace-nowrap bg-gray-50">
                  Visitor Name
                </td>
                <td className="px-3 py-2 text-gray-700 w-[19%] font-medium">
                  {fullName || "N/A"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 w-[14%] whitespace-nowrap bg-gray-50">
                  Contact No.
                </td>
                <td className="px-3 py-2 text-gray-700 w-[20%]">
                  {visitor.mobile || "N/A"}
                </td>
              </tr>

              {/* Row 2 — Email + Address + Registration For */}
              <tr className="border-b border-gray-200">
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Email Id
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.email || "N/A"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 bg-gray-50">
                  Address
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {[visitor.city, visitor.state, visitor.country]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Registration For
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.registrationFor || "N/A"}
                </td>
              </tr>

              {/* Row 3 — Company + Website + Company Size */}
              <tr className="border-b border-gray-200">
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Company
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.companyName || "N/A"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 bg-gray-50">
                  Company Website
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.companyWebsite || "N/A"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Company Size
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.companySize || "N/A"}
                </td>
              </tr>

              {/* Row 4 — Designation + Industry/Sector + B2B Meeting */}
              <tr className="border-b border-gray-200">
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Designation
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.designation || "N/A"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 bg-gray-50">
                  Industry/Sector
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.industrySector || "N/A"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  B2B Meeting
                </td>
                <td className="px-3 py-2 text-gray-700 capitalize">
                  {visitor.b2bMeeting || "N/A"}
                </td>
              </tr>

              {/* Row 5 — WhatsApp Updates + Specific Requirement */}
              <tr className="border-b border-gray-200">
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  WhatsApp Updates
                </td>
                <td className="px-3 py-2 text-gray-700 capitalize">
                  {visitor.whatsappUpdates || "N/A"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 bg-gray-50">
                  Specific Requirement
                </td>
                <td colSpan="3" className="px-3 py-2 text-gray-700">
                  {visitor.specificRequirement || "N/A"}
                </td>
              </tr>

              {/* Row 6 — Purpose of Visit */}
              <tr className="border-b border-gray-200">
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Purpose of Visit
                </td>
                <td colSpan="5" className="px-3 py-2 text-gray-700">
                  {[
                    visitor.purposeOfVisit?.exploringBusiness &&
                      "Exploring Business",
                    visitor.purposeOfVisit?.meetingExhibitors &&
                      "Meeting Exhibitors",
                    visitor.purposeOfVisit?.attendingSeminar &&
                      "Attending Seminar",
                    visitor.purposeOfVisit?.networking && "Networking",
                    visitor.purposeOfVisit?.learningTrends && "Learning Trends",
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </td>
              </tr>

              {/* Row 7 — Area of Interest */}
              <tr className="border-b border-gray-200">
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Area of Interest
                </td>
                <td colSpan="5" className="px-3 py-2 text-gray-700">
                  {[
                    visitor.areaOfInterest?.ayushHerbal && "AYUSH & Herbal",
                    visitor.areaOfInterest?.healthWellness &&
                      "Health & Wellness",
                    visitor.areaOfInterest?.organicFarming && "Organic Farming",
                    visitor.areaOfInterest?.fitnessNutrition &&
                      "Fitness & Nutrition",
                    visitor.areaOfInterest?.bioMedicine && "Bio Medicine",
                    visitor.areaOfInterest?.healthTech && "Health Tech",
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </td>
              </tr>

              {/* Row 8 — Subscribe + Created By + Updated By */}
              <tr className="border-b border-gray-200">
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Subscribe
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.subscribe ? "✅ Yes" : "❌ No"}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 bg-gray-50">
                  Created By
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.created_by || "N/A"}
                  {visitor.createdAt
                    ? ` | ${formatDate(visitor.createdAt)}`
                    : ""}
                </td>
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Updated By
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {visitor.updated_by || "N/A"}
                  {visitor.updatedAt
                    ? ` | ${formatDate(visitor.updatedAt)}`
                    : ""}
                </td>
              </tr>

              {/* Row 9 — Current Status */}
              <tr className="border-b border-gray-200">
                <td className="font-medium px-3 py-2 text-gray-500 whitespace-nowrap bg-gray-50">
                  Current Status
                </td>
                <td colSpan="5" className="px-3 py-2">
                  {visitor.status ? (
                    <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                      {visitor.status}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">No status yet</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Status Update Form */}
        {(!hasReviews || showForm) && (
          <div className="bg-white rounded-md shadow border border-gray-200 p-4 text-sm">
            <h2 className="text-base font-medium text-gray-700 mb-3">
              Update Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- Select Status --</option>
                  {statusOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Previous Status
                </label>
                <input
                  type="text"
                  value={visitor.status || ""}
                  className="w-full border border-gray-300 px-2 py-1.5 bg-gray-100 text-sm"
                  disabled
                />
              </div>
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Event <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">---- Select Event -----</option>
                  {events.map((event, i) => (
                    <option key={i} value={event._id}>
                      {event.event_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="font-medium text-gray-700 block mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 px-2 py-1 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Update Status..."
              />
            </div>
            {postError && (
              <p className="text-red-500 text-xs mb-3">{postError}</p>
            )}
            {postSuccess && (
              <p className="text-green-600 text-xs mb-3">{postSuccess}</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={handlePost}
                disabled={reviewLoading}
                className="bg-[#337AB7] hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 font-medium text-sm"
              >
                {reviewLoading ? "Posting..." : "POST"}
              </button>
            </div>
          </div>
        )}

        {/* Status History Panel */}
        <div className="bg-gray-50 rounded-md border border-gray-200 p-3 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-medium text-gray-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              {fullName} Status History
            </h2>
            <div className="flex items-center gap-2">
              {hasReviews && (
                <button
                  onClick={() => setShowForm((prev) => !prev)}
                  className="text-xs bg-[#337AB7] hover:bg-blue-700 text-white px-3 py-1.5 font-medium"
                >
                  {showForm ? "Hide Form ▲" : "+ Update Status"}
                </button>
              )}
              <button
                className="p-2 hover:bg-gray-200 rounded"
                title="Print"
                onClick={() => window.print()}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {reviewLoading ? (
            <p className="text-sm text-gray-400">Loading reviews...</p>
          ) : hasReviews ? (
            <div className="flex flex-col gap-3">
              {visitorReviews.map((review, index) => {
                const eventName =
                  events.find((e) => e._id === review.visitor_event)
                    ?.event_name || review.visitor_event;
                return (
                  <div
                    key={review._id}
                    className="flex items-start hover:bg-gray-200 gap-2 py-1.5 px-2 bg-white border border-gray-200 text-sm"
                  >
                    <FaUser className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                      <p className="font-medium text-xs sm:text-sm">
                        <span className="text-blue-400 uppercase">
                          {review.visitor_status} for {eventName}
                        </span>
                        <span
                          onClick={() => {
                            if (index === 0) setShowForm((prev) => !prev);
                          }}
                          className={`${
                            index === 0
                              ? "text-red-500 cursor-pointer hover:underline"
                              : "text-gray-700"
                          } uppercase`}
                        >
                          {" "}
                          | ▲ Added on{" "}
                          {review.added
                            ? new Date(review.added).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "N/A"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 leading-tight">
                        {review.visitor_desc} | By: {review.added_by} | On:{" "}
                        {new Date(
                          review.updated || review.added,
                        ).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">No status updates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateOverview;
