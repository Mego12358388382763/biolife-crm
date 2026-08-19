// Date-range presets for the Performance Dashboard filter. Everything is
// computed from the server's local date; "today" means the calendar day
// the report was submitted under (see todayIso() in reports/daily/page.tsx
// — same convention used consistently everywhere reports are dated).

export type DateRangePreset = "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "last_month" | "custom";

export interface DateRange {
  start: string; // YYYY-MM-DD, inclusive
  end: string; // YYYY-MM-DD, inclusive
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Monday-start week, matching standard business reporting conventions.
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

export function resolveDateRange(preset: DateRangePreset, customStart?: string, customEnd?: string): DateRange {
  const now = new Date();

  switch (preset) {
    case "today":
      return { start: toIso(now), end: toIso(now) };
    case "yesterday": {
      const y = addDays(now, -1);
      return { start: toIso(y), end: toIso(y) };
    }
    case "this_week": {
      const start = startOfWeek(now);
      return { start: toIso(start), end: toIso(now) };
    }
    case "last_week": {
      const start = addDays(startOfWeek(now), -7);
      const end = addDays(start, 6);
      return { start: toIso(start), end: toIso(end) };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toIso(start), end: toIso(now) };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toIso(start), end: toIso(end) };
    }
    case "custom":
      return {
        start: customStart || toIso(now),
        end: customEnd || toIso(now),
      };
    default:
      return { start: toIso(now), end: toIso(now) };
  }
}

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];
