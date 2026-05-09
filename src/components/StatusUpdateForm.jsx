import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { Bell, MessageSquare, Trash2, UserCircle } from 'lucide-react';
import api from '../lib/api';
import { fetchStatusOptions } from '../features/add_by_admin/statusOption/statusOptionSlice';
import { fetchUsers, fetchAdmins } from '../features/auth/userSlice';
import { fetchReviews, createReview, deleteReview } from '../features/crm-exhibator-reviews/crmExhibatorReviewSlice';

const StatusUpdateForm = ({ targetId, currentStatus, onSuccess, updateType = 'msme', applicationData = null }) => {
  const dispatch = useDispatch();
  const [Flip, setFlip] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Status options from Redux
  const { statusOptions } = useSelector((state) => state.statusOptions);

  // Users from Redux
  const { users } = useSelector((state) => state.users);

  // Local Events state
  const [events, setEvents] = useState([]);
  const [isEventLoading, setIsEventLoading] = useState(false);

  // Reviews from Redux
  const { reviews } = useSelector((state) => state.reviews);

  // Filter reviews for this target only
  const filteredReviews = (Array.isArray(reviews) ? reviews : []).filter(
    (rev) => rev?.cmpny_id === targetId
  );

  // Get current logged-in user's name
  let updateBy = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || '';
  try {
    const userObjStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userObjStr) {
      const userObj = JSON.parse(userObjStr);
      if (userObj.name) updateBy = userObj.name;
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
  if (!updateBy) updateBy = 'Admin';

  const [reviewData, setReviewData] = useState({
    cmpny_id: targetId || '',
    evnt_id: '',
    event_name: '',
    status_short: '',
    reminder_dt: '',
    forward_to: '',
    re_msg: '',
    updated_by: updateBy || '',
  });

  useEffect(() => {
    dispatch(fetchStatusOptions());
    dispatch(fetchAdmins());
    dispatch(fetchReviews());
    fetchEvents();
  }, [dispatch, targetId]);

  useEffect(() => {
    if (filteredReviews.length > 0) {
      setIsFormVisible(false);
    } else {
      setIsFormVisible(true);
    }
  }, [filteredReviews.length]);

  const fetchEvents = async () => {
    setIsEventLoading(true);
    try {
      const response = await api.get('/api/events');
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsEventLoading(false);
    }
  };

  const getEventName = (eventId) => {
    const event = (Array.isArray(events) ? events : []).find((e) => e._id === eventId);
    return event ? event.event_fullName || event.name : eventId;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    const keyMap = {
      ClientStatus: 'status_short',
      EventName: 'evnt_id',
      ReminderDateTime: 'reminder_dt',
      ForwardTo: 'forward_to',
      Remark: 're_msg',
    };

    setReviewData((prev) => {
      const updated = { ...prev, [keyMap[id] || id]: value };

      if (id === 'EventName') {
        const selectedEvent = events.find((ev) => ev._id === value);
        updated.event_name = selectedEvent ? selectedEvent.event_fullName || selectedEvent.name : '';
      }

      return updated;
    });
  };

  const handleDelete = async (reviewId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteReview(reviewId)).unwrap();
          Swal.fire('Deleted!', 'Status entry has been deleted.', 'success');
          dispatch(fetchReviews());
        } catch (error) {
          Swal.fire('Error', 'Failed to delete status entry.', 'error');
        }
      }
    });
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    let currentUpdateBy = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || '';
    try {
      const userObjStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userObjStr) {
        const userObj = JSON.parse(userObjStr);
        if (userObj.name) currentUpdateBy = userObj.name;
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
    }
    if (!currentUpdateBy) currentUpdateBy = 'Admin';

    const payloadToSend = {
      ...reviewData,
      cmpny_id: targetId,
      updated_by: currentUpdateBy,
    };

    if (!payloadToSend.cmpny_id) {
      Swal.fire({
        title: 'Error',
        text: 'Target ID is missing.',
        icon: 'error',
        confirmButtonColor: '#23471d',
      });
      return;
    }

    if (!payloadToSend.status_short || !payloadToSend.evnt_id || !payloadToSend.re_msg) {
      Swal.fire({
        title: 'Incomplete Data',
        text: 'Status, Event Name, and Remark are required.',
        icon: 'warning',
        confirmButtonColor: '#23471d',
      });
      return;
    }

    try {
      await dispatch(createReview(payloadToSend)).unwrap();

      // Update specific parent state/status based on type
      if (updateType === 'msme') {
        await api.patch(`/api/msme-pms-scheme/${targetId}/status`, {
          status: payloadToSend.status_short,
          is_lead: true,
        });

        // Insert or Update in companies table with available MSME application data
        if (applicationData) {
          try {
            const companiesRes = await api.get('/api/companies');
            const companiesList = Array.isArray(companiesRes.data?.data)
              ? companiesRes.data.data
              : (Array.isArray(companiesRes.data) ? companiesRes.data : []);

            const existingCompany = companiesList.find(
              (c) =>
                (c.companyName && applicationData.companyName && c.companyName.toLowerCase().trim() === applicationData.companyName.toLowerCase().trim()) ||
                (c.email && applicationData.emailId && c.email.toLowerCase().trim() === applicationData.emailId.toLowerCase().trim())
            );

            if (existingCompany) {
              // Update existing company with all incoming changes
              const firstName = applicationData.contactPerson?.split(' ')[0] || '';
              const surname = applicationData.contactPerson?.split(' ').slice(1).join(' ') || '';

              await api.put(`/api/companies/${existingCompany._id}`, {
                ...existingCompany,
                // companyName: applicationData.companyName || existingCompany.companyName,
                category: applicationData.category || existingCompany.category,
                // udyamNumber: applicationData.udyamNumber || existingCompany.udyamNumber,
                // gstNumber: applicationData.gstNumber || existingCompany.gstNumber,
                companyStatus: payloadToSend.status_short,
                eventName: payloadToSend.event_name || existingCompany.eventName,
                reminder: payloadToSend.reminder_dt || existingCompany.reminder,
                forwardTo: payloadToSend.forward_to || existingCompany.forwardTo,
                contacts: [
                  {
                    firstName: firstName,
                    surname: surname,
                    email: applicationData.emailId || '',
                    mobile: applicationData.mobileNumber || '',
                  },
                ],
                updated_by: payloadToSend.updated_by,
              });
            } else {
              // Create a brand new company record
              const firstName = applicationData.contactPerson?.split(' ')[0] || '';
              const surname = applicationData.contactPerson?.split(' ').slice(1).join(' ') || '';

              const newCompanyData = {
                companyName: applicationData.companyName,
                category: applicationData.category,
                email: applicationData.emailId || '',
                udyamNumber: applicationData.udyamNumber,
                gstNumber: applicationData.gstNumber,
                eventName: payloadToSend.event_name || '',
                reminder: payloadToSend.reminder_dt || '',
                forwardTo: payloadToSend.forward_to || '',
                companyStatus: payloadToSend.status_short,
                contacts: [
                  {
                    firstName: firstName,
                    surname: surname,
                    email: applicationData.emailId || '',
                    mobile: applicationData.mobileNumber || '',
                  },
                ],
                added_by: payloadToSend.updated_by || 'Admin',
                updated_by: payloadToSend.updated_by || 'Admin',
              };

              await api.post('/api/companies', newCompanyData);
            }
          } catch (compErr) {
            console.error('Error synchronizing company record:', compErr);
          }
        }
      } else if (updateType === 'company') {
        await api.put(`/api/companies/${targetId}`, {
          companyStatus: payloadToSend.status_short,
          eventName: payloadToSend.event_name,
        });
      }

      Swal.fire({
        title: 'Success',
        text: 'Status updated successfully!',
        icon: 'success',
        confirmButtonColor: '#23471d',
      });

      dispatch(fetchReviews());
      if (onSuccess) onSuccess();

      // Reset Form fields
      setReviewData({
        cmpny_id: targetId || '',
        evnt_id: '',
        event_name: '',
        status_short: '',
        reminder_dt: '',
        forward_to: '',
        re_msg: '',
        updated_by: currentUpdateBy || '',
      });
    } catch (err) {
      console.error('Submit review error:', err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update status. Please try again.',
        icon: 'error',
        confirmButtonColor: '#23471d',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── STATUS UPDATE FORM ── */}
      {isFormVisible && (
        <div className="bg-white border border-slate-200 rounded shadow-sm p-4 animate-fadeIn">
          <div className="border-b border-slate-100 pb-2 mb-4">
            <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1.5">
              <MessageSquare size={16} className="text-slate-500" /> STATUS UPDATE FORM
            </h3>
          </div>
          <form onSubmit={handleAddReview} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Client Status</label>
                <select
                  id="ClientStatus"
                  value={reviewData.status_short}
                  onChange={(e) => {
                    const value = e.target.value;
                    const hideFor = ['Not Interested'];
                    setFlip(!hideFor.includes(value));
                    handleChange(e);
                  }}
                  className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 outline-none focus:border-[#23471d] bg-white"
                >
                  <option value="">Select Current Status</option>
                  {Array.isArray(statusOptions) &&
                    statusOptions
                      .filter((opt) => opt.status === 'active')
                      .map((opt) => (
                        <option key={opt._id} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Previous Status</label>
                <input
                  type="text"
                  value={currentStatus || '-'}
                  readOnly
                  className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 bg-slate-50 text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-slate-600 mb-1 block">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="EventName"
                  value={reviewData.evnt_id}
                  onChange={handleChange}
                  className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 outline-none focus:border-[#23471d] bg-white"
                >
                  <option value="">Select Event</option>
                  {Array.isArray(events) &&
                    events
                      .filter((e) => e.event_status === 'active' || e.status === 'active')
                      .map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.event_fullName || e.name}
                        </option>
                      ))}
                </select>
              </div>

              {Flip && (
                <>
                  <div>
                    <label className="text-[12px] font-semibold text-slate-600 mb-1 block">
                      Next Reminder <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="ReminderDateTime"
                      value={reviewData.reminder_dt}
                      onChange={handleChange}
                      className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 outline-none focus:border-[#23471d] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-slate-600 mb-1 block">
                      Forward To <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ForwardTo"
                      value={reviewData.forward_to}
                      onChange={handleChange}
                      className="w-full h-9 text-[12px] border border-slate-300 rounded px-2 outline-none focus:border-[#23471d] bg-white"
                    >
                      <option value="">Select User</option>
                      {Array.isArray(users) &&
                        users
                          .filter((u) => u.status === 'Active')
                          .map((u) => (
                            <option key={u._id} value={u.username}>
                              {u.username}
                            </option>
                          ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-grow">
                <label className="text-[12px] font-semibold text-slate-600 mb-1 block">
                  Any Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="Remark"
                  value={reviewData.re_msg}
                  onChange={handleChange}
                  rows={2}
                  className="w-full text-[12px] border border-slate-300 rounded px-3 py-2 outline-none focus:border-[#23471d] resize-none"
                  placeholder="Update Status..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="h-10 px-6 bg-[#3598dc] hover:bg-[#286090] text-white text-[12px] font-bold rounded transition-colors uppercase whitespace-nowrap shadow-sm"
              >
                SAVE
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── COMMUNICATION HISTORY ── */}
      {filteredReviews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
            <MessageSquare size={16} className="text-slate-600" />
            <h3 className="text-[14px] font-bold text-slate-700 uppercase tracking-tight">
              Communication Status History
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredReviews.map((entry, index) => (
              <div key={entry?._id} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                  <UserCircle size={28} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[12px] font-bold text-blue-500 uppercase tracking-tight">
                          {entry?.status_short} FOR {entry?.event_name || getEventName(entry?.evnt_id)}
                        </span>
                        {entry?.reminder_dt && (
                          <span
                            className={`flex items-center gap-1 text-[12px] font-bold text-red-500 uppercase ${index === 0 ? 'cursor-pointer hover:underline' : ''
                              }`}
                            onClick={index === 0 ? () => setIsFormVisible(true) : undefined}
                            title={index === 0 ? 'Click to add new status update' : undefined}
                          >
                            | <Bell size={12} className="fill-red-500" /> CALL THE CLIENT ON{' '}
                            {(() => {
                              const d = new Date(entry.reminder_dt);
                              const day = d.getDate().toString().padStart(2, '0');
                              const month = d.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
                              const year = d.getFullYear().toString().slice(-2);
                              const time = d.toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              });
                              return `${day} ${month} ${year} AT ${time}`;
                            })()}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-slate-600 leading-snug">
                        {entry?.re_msg} By:{' '}
                        <span className="text-blue-400 font-semibold">{entry?.updated_by}</span> On{' '}
                        {entry?.re_updated
                          ? new Date(entry.re_updated).toLocaleDateString('en-IN', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          }) +
                          ' at ' +
                          new Date(entry.re_updated).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })
                          : 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(entry?._id)}
                      className="p-1 text-slate-300 hover:text-red-500 border border-slate-200 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StatusUpdateForm;
