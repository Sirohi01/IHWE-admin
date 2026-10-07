// Follow-up date is mandatory for every status except these.
const FOLLOW_UP_EXEMPT_STATUSES = ["completed", "not interested"];

export const isFollowUpRequired = (status) => {
  const st = String(status || "").trim().toLowerCase();
  return !!st && !FOLLOW_UP_EXEMPT_STATUSES.includes(st);
};
