import { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { useUserId, useSetUserId } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Bell, Moon } from "lucide-react";

export default function Settings() {
  const currentUserId = useUserId();
  const setUserId = useSetUserId();
  const [username, setUsername] = useState(currentUserId);
  const { toast } = useToast();

  const handleSave = () => {
    if (username.trim()) {
      setUserId(username);
      toast({
        title: "Settings Saved",
        description: "Your profile has been updated.",
      });
    }
  };

  return (
    <PageContainer title="Settings" description="Manage your preferences and profile.">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Profile
            </CardTitle>
            <CardDescription>
              Manage your identity and learning data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username / ID</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This ID is used to track your learning progress across sessions.
              </p>
            </div>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive a notification at 9 AM daily.</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Study Streak Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when you're about to lose your streak.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce eye strain during late night study sessions.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
