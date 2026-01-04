import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getDayName, WEEKDAYS, WEEKENDS, ALL_DAYS } from "@shared/gameplay";
import { cn } from "@/lib/utils";

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Every Day" },
  { value: "weekdays", label: "Weekdays Only" },
  { value: "weekends", label: "Weekends Only" },
  { value: "specific", label: "Specific Days" },
  { value: "custom", label: "Custom Interval" },
];

interface FrequencySelectorProps {
  frequency: string;
  frequencyDays: number[];
  customInterval?: number;
  reminderTime?: string;
  reminderEnabled?: boolean;
  onFrequencyChange: (frequency: string) => void;
  onFrequencyDaysChange: (days: number[]) => void;
  onCustomIntervalChange?: (interval: number) => void;
  onReminderTimeChange?: (time: string) => void;
  onReminderEnabledChange?: (enabled: boolean) => void;
  compact?: boolean;
}

export function FrequencySelector({
  frequency,
  frequencyDays,
  customInterval,
  reminderTime,
  reminderEnabled,
  onFrequencyChange,
  onFrequencyDaysChange,
  onCustomIntervalChange,
  onReminderTimeChange,
  onReminderEnabledChange,
  compact = false,
}: FrequencySelectorProps) {
  const toggleDay = (day: number) => {
    if (frequencyDays.includes(day)) {
      onFrequencyDaysChange(frequencyDays.filter(d => d !== day));
    } else {
      onFrequencyDaysChange([...frequencyDays, day].sort());
    }
  };

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className="space-y-2">
        <Label>Frequency</Label>
        <Select value={frequency} onValueChange={onFrequencyChange}>
          <SelectTrigger data-testid="select-frequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {frequency === "specific" && (
        <div className="space-y-2">
          <Label>Select Days</Label>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map(day => (
              <Button
                key={day}
                type="button"
                size="sm"
                variant={frequencyDays.includes(day) ? "default" : "outline"}
                onClick={() => toggleDay(day)}
                data-testid={`button-day-${day}`}
                className={cn(
                  "min-w-[44px]",
                  frequencyDays.includes(day) && "bg-yellow-500 hover:bg-yellow-600 text-black"
                )}
              >
                {getDayName(day)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {frequency === "custom" && onCustomIntervalChange && (
        <div className="space-y-2">
          <Label>Every X Days</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Every</span>
            <Input
              type="number"
              min={1}
              max={365}
              value={customInterval || 1}
              onChange={(e) => onCustomIntervalChange(parseInt(e.target.value) || 1)}
              className="w-20"
              data-testid="input-custom-interval"
            />
            <span className="text-muted-foreground">days</span>
          </div>
        </div>
      )}

      {onReminderTimeChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Reminder Time</Label>
            {onReminderEnabledChange && (
              <Button
                type="button"
                size="sm"
                variant={reminderEnabled ? "default" : "outline"}
                onClick={() => onReminderEnabledChange(!reminderEnabled)}
                data-testid="button-toggle-reminder"
                className={cn(
                  reminderEnabled && "bg-yellow-500 hover:bg-yellow-600 text-black"
                )}
              >
                {reminderEnabled ? "On" : "Off"}
              </Button>
            )}
          </div>
          <Input
            type="time"
            value={reminderTime || "09:00"}
            onChange={(e) => onReminderTimeChange(e.target.value)}
            disabled={!reminderEnabled}
            className="w-32"
            data-testid="input-reminder-time"
          />
        </div>
      )}
    </div>
  );
}

export function FrequencyBadge({ frequency, frequencyDays }: { frequency: string; frequencyDays: number[] }) {
  const getLabel = () => {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "weekdays":
        return "Weekdays";
      case "weekends":
        return "Weekends";
      case "specific":
        return frequencyDays.map(d => getDayName(d)).join(", ");
      case "custom":
        return "Custom";
      default:
        return "Daily";
    }
  };

  return (
    <span className="text-xs text-muted-foreground">
      {getLabel()}
    </span>
  );
}
