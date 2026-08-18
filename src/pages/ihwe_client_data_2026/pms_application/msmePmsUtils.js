import { SERVER_URL } from '../../../lib/api';

export const PMS_STAGE_LABELS_FALLBACK = ['Application & Submission', 'Claim Documents', 'Claim & Reimbursement'];

export const safe = (value, fallback = '—') => (value === null || value === undefined || value === '' ? fallback : value);
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const fmtINR = (n) => {
    const v = Number(n);
    if (!v) return '—';
    return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};
export const resolveImageUrl = (url) => (url
    ? (String(url).startsWith('http') ? url : `${SERVER_URL}${String(url).startsWith('/') ? '' : '/'}${url}`)
    : '');

// Registration data (addresses, etc.) is often stored ALL CAPS — this makes
// it readable without touching the underlying stored value.
export const toSentenceCase = (str) => {
    const s = String(str || '').trim().toLowerCase();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
};
