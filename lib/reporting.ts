// Shared, dependency-free helpers for turning raw activity counts into the
// rates shown across the Daily Activity form and Performance Dashboard.
// Centralized here so "never show NaN/Infinity/divide-by-zero" is enforced
// in exactly one place rather than re-implemented (and potentially
// forgotten) at every call site.

export function safeRate(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  const rate = (numerator / denominator) * 100;
  return Number.isFinite(rate) ? Math.round(rate * 10) / 10 : 0;
}

export interface FunnelStage {
  label: string;
  count: number;
  rateFromPrevious: number | null; // null for the first stage (nothing to convert from)
}

export function buildFunnel(totals: {
  peopleContacted: number;
  positiveReplies: number;
  discoveryBooked: number;
  discoveryHeld: number;
  qualified: number;
  salesCallsHeld: number;
  dealsClosed: number;
}): FunnelStage[] {
  const stages: { label: string; count: number; from: number | null }[] = [
    { label: "People Contacted", count: totals.peopleContacted, from: null },
    { label: "Positive Replies", count: totals.positiveReplies, from: totals.peopleContacted },
    { label: "Discovery Calls Booked", count: totals.discoveryBooked, from: totals.positiveReplies },
    { label: "Discovery Calls Held", count: totals.discoveryHeld, from: totals.discoveryBooked },
    { label: "Qualified Leads", count: totals.qualified, from: totals.discoveryHeld },
    { label: "Sales Calls Held", count: totals.salesCallsHeld, from: totals.qualified },
    { label: "Deals Closed", count: totals.dealsClosed, from: totals.salesCallsHeld },
  ];

  return stages.map((s) => ({
    label: s.label,
    count: s.count,
    rateFromPrevious: s.from === null ? null : safeRate(s.count, s.from),
  }));
}
