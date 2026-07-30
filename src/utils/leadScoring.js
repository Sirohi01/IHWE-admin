// Canonical sales pipeline — Stage -> Lead Score / Probability / Pipeline
// bucket. Every list page (Master Data, New/Warm/Hot/All Leads) derives its
// "Lead Score" from a company's current `companyStatus` against this table
// instead of a random/fixed placeholder number.
export const LEAD_STAGES = [
  { key: "new_lead", label: "New Lead", description: "New enquiry received", score: 10, probability: 10, pipeline: "Cold" },
  { key: "contacted", label: "Contacted", description: "First call/email completed", score: 25, probability: 20, pipeline: "Warm" },
  { key: "follow_up", label: "Follow-up", description: "Follow-up scheduled", score: 40, probability: 35, pipeline: "Warm" },
  { key: "proposal_sent", label: "Proposal Sent", description: "Quotation/Proposal shared", score: 60, probability: 55, pipeline: "Qualified" },
  { key: "negotiation", label: "Negotiation", description: "Price/Terms discussion", score: 80, probability: 75, pipeline: "Hot" },
  { key: "booking_confirmed", label: "Booking Confirmed", description: "Advance received", score: 90, probability: 90, pipeline: "Very Hot" },
  { key: "payment_pending", label: "Payment Pending", description: "Balance payment pending", score: 95, probability: 98, pipeline: "Almost Won" },
  { key: "completed", label: "Completed", description: "Full payment received", score: 100, probability: 100, pipeline: "Won" },
  { key: "on_hold", label: "On Hold", description: "Client asked to wait", score: 30, probability: null, pipeline: "Hold" },
  { key: "not_interested", label: "Not Interested", description: "Lead closed", score: 0, probability: 0, pipeline: "Lost" },
];

const STAGE_BY_KEY = Object.fromEntries(LEAD_STAGES.map((s) => [s.key, s]));

// Real `companyStatus` values are messy free text ("pi sent", "warm client",
// "Closed - Won", "not interested.", ...) rather than the exact stage labels
// above, so each stage keeps a list of substrings it matches against
// (case-insensitive), checked in this order — most specific/late-pipeline
// stages first, so e.g. "not interested" doesn't get caught by a looser rule.
const MATCHERS = [
  { key: "completed", patterns: ["completed", "full payment", "closed - won", "closed won", "payment received", "won"] },
  { key: "payment_pending", patterns: ["payment pending", "balance payment", "balance due"] },
  { key: "booking_confirmed", patterns: ["booking confirm", "confirmed", "advance received", "advance rec"] },
  { key: "negotiation", patterns: ["negotiat", "hot"] },
  { key: "not_interested", patterns: ["not interest", "not intrested", "not intersted", "closed - lost", "closed lost", "rejected", "lost", "junk"] },
  { key: "on_hold", patterns: ["hold", "wait"] },
  { key: "proposal_sent", patterns: ["proposal", "quotation", "pi sent", "pi raised", "pi genrate", "details sent", "details shared", "share details", "share pi", "send details"] },
  { key: "follow_up", patterns: ["follow", "warm", "interested", "intrested"] },
  { key: "contacted", patterns: ["contact", "call", "picked", "responded"] },
  { key: "new_lead", patterns: ["new lead", "new"] },
];

// Resolve a company's pipeline stage info from its free-text companyStatus.
// Falls back to "New Lead" (the safest, most neutral default) when nothing
// matches, rather than guessing with a random/fixed number.
export const getLeadStageInfo = (companyStatus) => {
  const status = (companyStatus || "").toString().trim().toLowerCase();
  if (status) {
    for (const { key, patterns } of MATCHERS) {
      if (patterns.some((p) => status.includes(p))) return STAGE_BY_KEY[key];
    }
  }
  return STAGE_BY_KEY.new_lead;
};

export const getLeadScore = (companyStatus) => getLeadStageInfo(companyStatus).score;
