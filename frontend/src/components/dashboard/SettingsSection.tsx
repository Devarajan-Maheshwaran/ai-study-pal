import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Moon, Sun, Bell, Trash2, RotateCcw, BookOpen, Clock, Check } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SettingsSection = () => {
  const { resetAll, getDashboardStats, subjects, setCurrentSubject } = useAppState();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications') !== 'false';
    }
    return true;
  });
  const [dailyReminder, setDailyReminder] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dailyReminder') === 'true';
    }
    return false;
  });
  const [defaultSubject, setDefaultSubject] = useState<string>('');
  const [defaultInputType, setDefaultInputType] = useState<string>(() => {
    return localStorage.getItem('defaultInputType') || 'text';
  });
  const { toast } = useToast();

  const stats = getDashboardStats();

  // Apply theme on mount and changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    toast({ 
      title: 'Theme changed', 
      description: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode` 
    });
  };

  const handleNotificationsToggle = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem('notifications', checked.toString());
    toast({ 
      title: checked ? 'Notifications enabled' : 'Notifications disabled' 
    });
  };

  const handleDailyReminderToggle = (checked: boolean) => {
    setDailyReminder(checked);
    localStorage.setItem('dailyReminder', checked.toString());
    toast({ 
      title: checked ? 'Daily quiz reminder enabled' : 'Daily quiz reminder disabled' 
    });
  };

  const handleDefaultSubjectChange = (subjectId: string) => {
    setDefaultSubject(subjectId);
    if (subjectId) {
      setCurrentSubject(subjectId);
      localStorage.setItem('defaultSubject', subjectId);
    }
    toast({ title: 'Default subject updated' });
  };

  const handleDefaultInputTypeChange = (type: string) => {
    setDefaultInputType(type);
    localStorage.setItem('defaultInputType', type);
    toast({ title: 'Default input type saved' });
  };

  const handleReset = () => {
    resetAll();
    localStorage.removeItem('defaultSubject');
    setDefaultSubject('');
    toast({ 
      title: 'Data cleared', 
      description: 'All study data has been reset' 
    });
  };

  return (
    <Card className="border-2 border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Settings & Personalization
        </CardTitle>
        <CardDescription>
          Customize your study experience and manage your data. Changes apply immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Appearance */}
        <div className="rounded-xl border border-border bg-secondary/20 p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Appearance</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-warning" />
              )}
              <div>
                <Label htmlFor="theme" className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
              </div>
            </div>
            <Switch
              id="theme"
              checked={isDarkMode}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </div>

        {/* Study Preferences */}
        <div className="rounded-xl border border-border bg-secondary/20 p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Study Preferences</h3>
          
          <div className="space-y-4">
            {/* Default Subject */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base">Default Subject</Label>
                  <p className="text-sm text-muted-foreground">Auto-select when you open the app</p>
                </div>
              </div>
              <Select value={defaultSubject || "none"} onValueChange={(val) => handleDefaultSubjectChange(val === "none" ? "" : val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Input Type */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base">Default Material Input</Label>
                  <p className="text-sm text-muted-foreground">Preferred input method for study materials</p>
                </div>
              </div>
              <Select value={defaultInputType} onValueChange={handleDefaultInputTypeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Paste Notes</SelectItem>
                  <SelectItem value="pdf">Upload PDF</SelectItem>
                  <SelectItem value="youtube">YouTube Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-secondary/20 p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notifications" className="text-base">Toast Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show success/error messages</p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationsToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="daily-reminder" className="text-base">Daily Quiz Reminder</Label>
                  <p className="text-sm text-muted-foreground">Remind to practice daily</p>
                </div>
              </div>
              <Switch
                id="daily-reminder"
                checked={dailyReminder}
                onCheckedChange={handleDailyReminderToggle}
              />
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="rounded-xl border border-border bg-secondary/20 p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Your Data</h3>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold text-foreground">{stats.totalSubjects}</p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold text-foreground">{stats.totalNotes}</p>
              <p className="text-sm text-muted-foreground">Notes Saved</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold text-foreground">{stats.totalQuizAttempts}</p>
              <p className="text-sm text-muted-foreground">Quiz Attempts</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold text-foreground">{stats.averageAccuracy}%</p>
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your subjects, 
                  notes, quizzes, and progress data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Yes, clear everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* About */}
        <div className="rounded-xl border border-border bg-secondary/20 p-5">
          <h3 className="font-heading font-semibold text-foreground mb-2">About AI Study Assistant</h3>
          <p className="text-sm text-muted-foreground">
            A frontend-only study companion built for your capstone project. Features include 
            notes ingestion (text, PDF, YouTube), AI-powered summarization using local NLP, 
            MCQ generation, adaptive quizzes, resource discovery, and progress tracking — 
            all running locally in your browser with no backend required.
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-success" />
              Version 1.0.0
            </span>
            <span>React + TypeScript + Tailwind CSS</span>
            <span>Local NLP Processing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsSection;
