import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ReferralLeadsDashboard from "../components/ReferralLeadsDashboard";

// Same "Referral Leads" screen the static IHWE Expo 2026 section uses,
// reused for every dynamic sidebar event — resolves the event's display
// name from :eventId so it can be passed as the `expo` prop.
const CrmEventReferralLeads = () => {
  const { eventId } = useParams();
  const events = useSelector((state) => state.crmEvents?.events) || [];
  const event = events.find((e) => e._id === eventId);
  const expoName = event?.event_fullName || event?.event_name || "";

  return (
    <ReferralLeadsDashboard
      expo={expoName}
      title={`${expoName || "Event"} - Referral Leads`}
      description="Track and manage leads referred by you and earn 10% referral bonus on successful bookings."
    />
  );
};

export default CrmEventReferralLeads;
