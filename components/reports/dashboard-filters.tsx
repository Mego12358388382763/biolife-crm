import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DATE_RANGE_PRESETS, type DateRangePreset } from "@/lib/date-ranges";

interface DashboardFiltersProps {
  preset: DateRangePreset;
  start: string;
  end: string;
  userId?: string;
  teamMembers: { id: string; full_name: string }[];
  isAdmin: boolean;
}

export function DashboardFilters({ preset, start, end, userId, teamMembers, isAdmin }: DashboardFiltersProps) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Date range</label>
        <Select name="preset" defaultValue={preset}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {preset === "custom" && (
        <>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">From</label>
            <Input type="date" name="start" defaultValue={start} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">To</label>
            <Input type="date" name="end" defaultValue={end} />
          </div>
        </>
      )}
      {isAdmin && (
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">Team member</label>
          <Select name="user" defaultValue={userId ?? "all"}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              {teamMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" variant="secondary">
        Apply
      </Button>
    </form>
  );
}
