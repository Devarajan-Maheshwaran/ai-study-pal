import { useState, useEffect } from "react";
import { Settings, User, Save, RefreshCw, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getUserId, setUserId, downloadSchedule } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [userId, setUserIdState] = useState("");
  const [scheduleSubject, setScheduleSubject] = useState("");
  const [scheduleHours, setScheduleHours] = useState(10);
  const [downloading, setDownloading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setUserIdState(getUserId());
  }, []);

  const handleSaveUserId = () => {
    if (!userId.trim()) {
      toast({
        title: "User ID Required",
        description: "Please enter a valid user ID.",
        variant: "destructive",
      });
      return;
    }

    setUserId(userId.trim());
    toast({
      title: "User ID Saved",
      description: "Your user ID has been updated successfully.",
    });
  };

  const handleGenerateNewId = () => {
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserIdState(newId);
    setUserId(newId);
    toast({
      title: "New ID Generated",
      description: "A new user ID has been generated and saved.",
    });
  };

  const handleDownloadSchedule = async () => {
    if (!scheduleSubject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject for the study schedule.",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true);
    try {
      await downloadSchedule(scheduleSubject.trim(), scheduleHours);
      toast({
        title: "Schedule Downloaded",
        description: `Your ${scheduleSubject} study schedule has been downloaded.`,
      });
    } catch (error) {
      console.error("Failed to download schedule:", error);
      toast({
        title: "Download Failed",
        description: "Unable to download schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveUserProfile = () => {
    if (!email.trim() || !name.trim() || !age.trim() || !grade.trim()) {
      toast({
        title: "All Fields Required",
        description: "Please fill in all profile fields.",
        variant: "destructive",
      });
      return;
    }
    // Save to localStorage or backend as needed
    localStorage.setItem("user_profile", JSON.stringify({ email, name, age, grade, userId }));
    toast({
      title: "Profile Saved",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* User ID Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Identity
          </CardTitle>
          <CardDescription>
            Your unique identifier for tracking quiz progress and learning paths
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserIdState(e.target.value)}
              placeholder="Enter your user ID"
            />
            <p className="text-xs text-muted-foreground">
              This ID is stored locally and used to sync your progress with the backend.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSaveUserId}>
              <Save className="h-4 w-4 mr-2" />
              Save User ID
            </Button>
            <Button variant="outline" onClick={handleGenerateNewId}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New ID
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            Basic information for personalized experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
            />
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
            />
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="Enter your age"
              type="number"
            />
            <Label htmlFor="grade">Grade</Label>
            <Input
              id="grade"
              value={grade}
              onChange={e => setGrade(e.target.value)}
              placeholder="Enter your grade"
            />
          </div>
          <Button onClick={handleSaveUserProfile}>
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Study Schedule Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Study Schedule
          </CardTitle>
          <CardDescription>
            Download a personalized CSV study schedule for any subject
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduleSubject">Subject</Label>
              <Input
                id="scheduleSubject"
                value={scheduleSubject}
                onChange={(e) => setScheduleSubject(e.target.value)}
                placeholder="e.g., Biology, Math..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleHours">Study Hours</Label>
              <Input
                id="scheduleHours"
                type="number"
                min={1}
                max={100}
                value={scheduleHours}
                onChange={(e) => setScheduleHours(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>

          <Button
            onClick={handleDownloadSchedule}
            disabled={downloading || !scheduleSubject.trim()}
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Schedule (CSV)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* About Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            About AI Study Pal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              AI Study Pal is your intelligent learning companion that helps you study
              more effectively using AI-powered features.
            </p>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Features:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Generate MCQs from your study notes</li>
                <li>Adaptive quizzes based on your learning path</li>
                <li>AI-powered text summarization</li>
                <li>Personalized study tips</li>
                <li>Curated resource suggestions</li>
                <li>Downloadable study schedules</li>
              </ul>
            </div>
            <Separator />
            <p className="text-xs">
              Backend: Flask API running on localhost:5000
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
