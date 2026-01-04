import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bell, User, Globe, Shield, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import type { UserProfile } from "@shared/schema";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona Time" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "UTC", label: "UTC" },
];

const PHILOSOPHY_TRADITIONS = [
  { value: "esoteric", label: "Esoteric / Hermetic" },
  { value: "biblical", label: "Biblical" },
  { value: "quranic", label: "Quranic" },
  { value: "metaphysical", label: "Metaphysical" },
  { value: "ancient", label: "Ancient Philosophy" },
];

export default function Settings() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const [formData, setFormData] = useState({
    displayName: "",
    timezone: "America/Chicago",
    philosophyTradition: "esoteric",
    notificationsEnabled: true,
    dailyReminderTime: "09:00",
    weeklyReportEnabled: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        timezone: profile.timezone || "America/Chicago",
        philosophyTradition: profile.philosophyTradition || "esoteric",
        notificationsEnabled: profile.notificationsEnabled ?? true,
        dailyReminderTime: profile.dailyReminderTime || "09:00",
        weeklyReportEnabled: profile.weeklyReportEnabled ?? true,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Your name"
                data-testid="input-display-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Philosophy Tradition</Label>
              <Select
                value={formData.philosophyTradition}
                onValueChange={(val) => setFormData({ ...formData, philosophyTradition: val })}
              >
                <SelectTrigger data-testid="select-philosophy-tradition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHILOSOPHY_TRADITIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Daily quotes will be drawn from this wisdom tradition
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure reminders and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders for habits and goals
                </p>
              </div>
              <Switch
                checked={formData.notificationsEnabled}
                onCheckedChange={(val) => setFormData({ ...formData, notificationsEnabled: val })}
                data-testid="switch-notifications"
              />
            </div>

            <div className="space-y-2">
              <Label>Daily Reminder Time</Label>
              <Input
                type="time"
                value={formData.dailyReminderTime}
                onChange={(e) => setFormData({ ...formData, dailyReminderTime: e.target.value })}
                disabled={!formData.notificationsEnabled}
                className="w-32"
                data-testid="input-reminder-time"
              />
              <p className="text-sm text-muted-foreground">
                Get a daily summary of pending habits
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Progress Report</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of your achievements
                </p>
              </div>
              <Switch
                checked={formData.weeklyReportEnabled}
                onCheckedChange={(val) => setFormData({ ...formData, weeklyReportEnabled: val })}
                disabled={!formData.notificationsEnabled}
                data-testid="switch-weekly-report"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Timezone
            </CardTitle>
            <CardDescription>For accurate daily resets at midnight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Your Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(val) => setFormData({ ...formData, timezone: val })}
              >
                <SelectTrigger data-testid="select-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Habits reset at midnight in your selected timezone
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="min-w-[120px]"
            data-testid="button-save-settings"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
