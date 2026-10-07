// A status-update remark must be at least this many characters (after trimming).
export const MIN_REMARK_LENGTH = 50;

export const isRemarkValid = (remark) => String(remark || "").trim().length >= MIN_REMARK_LENGTH;
