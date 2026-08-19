"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { submitDailyReportAction, type DailyActivityFormState } from "@/app/(app)/reports/actions";
import { safeRate } from "@/lib/reporting";
import { OUTREACH_FIELDS } from "@/lib/validations/daily-activity";

const initialState: DailyActivityFormState = {};

type Counts = Record<string, number>;

const COUNT_FIELDS = [
  "people_contacted",
  ...OUTREACH_FIELDS.map((f) => f.key),
  "positive_call_replies",
  "positive_message_replies",
  "discovery_calls_booked",
  "discovery_calls_held",
  "discovery_calls_no_show",
  "qualified_leads",
  "unqualified_leads",
  "sales_calls_booked",
  "sales_calls_held",
  "deals_closed",
  "deals_lost",
] as const;

interface DailyActivityFormProps {
  teamMemberName: string;
  today: string;
  defaultValues?: Partial<Record<(typeof COUNT_FIELDS)[number], number>> & {
    revenue?: number;
    daily_notes?: string;
    main_objections?: string;
    followups_required?: string;
    problems_blockers?: string;
  };
}

function NumberField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-normal text-muted-foreground">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      />
    </div>
  );
}

export function DailyActivityForm({ teamMemberName, today, defaultValues = {} }: DailyActivityFormProps) {
  const [state, formAction, pending] = useActionState(submitDailyReportAction, initialState);

  const [counts, setCounts] = useState<Counts>(() => {
    const initial: Counts = {};
    for (const key of COUNT_FIELDS) initial[key] = defaultValues[key] ?? 0;
    return initial;
  });

  function setCount(key: string, value: number) {
    setCounts((prev) => ({ ...prev, [key]: value }));
  }

  const rates = useMemo(() => {
    const totalPositive = counts.positive_call_replies + counts.positive_message_replies;
    return {
      totalPositive,
      positiveReplyRate: safeRate(totalPositive, counts.people_contacted),
      bookingRate: safeRate(counts.discovery_calls_booked, totalPositive),
      showUpRate: safeRate(counts.discovery_calls_held, counts.discovery_calls_booked),
      qualificationRate: safeRate(counts.qualified_leads, counts.discovery_calls_held),
      salesShowUpRate: safeRate(counts.sales_calls_held, counts.sales_calls_booked),
      closeRate: safeRate(counts.deals_closed, counts.sales_calls_held),
      outreachToSale: safeRate(counts.deals_closed, counts.people_contacted),
    };
  }, [counts]);

  if (state.success) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-lg font-medium">Report saved for {today}.</p>
          <p className="mt-1 text-muted-foreground">Thanks — you can update it again any time today.</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
            Edit again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input name="report_date" type="date" defaultValue={today} required />
          </div>
          <div className="space-y-1.5">
            <Label>Team Member</Label>
            <Input value={teamMemberName} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Outreach</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <NumberField
            name="people_contacted"
            label="People Contacted"
            value={counts.people_contacted}
            onChange={(v) => setCount("people_contacted", v)}
          />
          {OUTREACH_FIELDS.map((f) => (
            <NumberField
              key={f.key}
              name={f.key}
              label={f.label}
              value={counts[f.key]}
              onChange={(v) => setCount(f.key, v)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <NumberField
              name="positive_call_replies"
              label="Positive Call Replies"
              value={counts.positive_call_replies}
              onChange={(v) => setCount("positive_call_replies", v)}
            />
            <NumberField
              name="positive_message_replies"
              label="Positive Message Replies"
              value={counts.positive_message_replies}
              onChange={(v) => setCount("positive_message_replies", v)}
            />
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">Total Positive Replies: {rates.totalPositive}</Badge>
            <Badge variant="secondary">Positive Reply Rate: {rates.positiveReplyRate}%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Discovery Calls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <NumberField
              name="discovery_calls_booked"
              label="Booked"
              value={counts.discovery_calls_booked}
              onChange={(v) => setCount("discovery_calls_booked", v)}
            />
            <NumberField
              name="discovery_calls_held"
              label="Held"
              value={counts.discovery_calls_held}
              onChange={(v) => setCount("discovery_calls_held", v)}
            />
            <NumberField
              name="discovery_calls_no_show"
              label="No-show / Cancelled"
              value={counts.discovery_calls_no_show}
              onChange={(v) => setCount("discovery_calls_no_show", v)}
            />
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">Booking Rate: {rates.bookingRate}%</Badge>
            <Badge variant="secondary">Show-up Rate: {rates.showUpRate}%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Qualification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <NumberField
              name="qualified_leads"
              label="Qualified Leads"
              value={counts.qualified_leads}
              onChange={(v) => setCount("qualified_leads", v)}
            />
            <NumberField
              name="unqualified_leads"
              label="Unqualified Leads"
              value={counts.unqualified_leads}
              onChange={(v) => setCount("unqualified_leads", v)}
            />
          </div>
          <Badge variant="secondary">Qualification Rate: {rates.qualificationRate}%</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <NumberField
              name="sales_calls_booked"
              label="Sales Calls Booked"
              value={counts.sales_calls_booked}
              onChange={(v) => setCount("sales_calls_booked", v)}
            />
            <NumberField
              name="sales_calls_held"
              label="Sales Calls Held"
              value={counts.sales_calls_held}
              onChange={(v) => setCount("sales_calls_held", v)}
            />
            <NumberField
              name="deals_closed"
              label="Deals Closed"
              value={counts.deals_closed}
              onChange={(v) => setCount("deals_closed", v)}
            />
            <NumberField
              name="deals_lost"
              label="Deals Lost"
              value={counts.deals_lost}
              onChange={(v) => setCount("deals_lost", v)}
            />
            <div className="space-y-1.5">
              <Label htmlFor="revenue" className="text-sm font-normal text-muted-foreground">
                Revenue
              </Label>
              <Input id="revenue" name="revenue" type="number" min={0} step="0.01" defaultValue={defaultValues.revenue ?? 0} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">Sales Show-up Rate: {rates.salesShowUpRate}%</Badge>
            <Badge variant="secondary">Close Rate: {rates.closeRate}%</Badge>
            <Badge variant="secondary">Outreach-to-Sale: {rates.outreachToSale}%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes (optional)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="daily_notes">Daily Notes</Label>
            <Textarea id="daily_notes" name="daily_notes" rows={2} defaultValue={defaultValues.daily_notes} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="main_objections">Main Objections</Label>
            <Textarea id="main_objections" name="main_objections" rows={2} defaultValue={defaultValues.main_objections} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="followups_required">Follow-ups Required</Label>
            <Textarea id="followups_required" name="followups_required" rows={2} defaultValue={defaultValues.followups_required} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="problems_blockers">Problems / Blockers</Label>
            <Textarea id="problems_blockers" name="problems_blockers" rows={2} defaultValue={defaultValues.problems_blockers} />
          </div>
        </CardContent>
      </Card>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Submit Daily Report"}
      </Button>
    </form>
  );
}
