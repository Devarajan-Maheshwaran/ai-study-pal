import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/hooks/useAppState';
import { GraduationCap, FileText, Brain, Lightbulb, BookOpen, BarChart3, Settings, Plus, AlertCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StudyInputSection from '@/components/dashboard/StudyInputSection';
import SummarizerSection from '@/components/dashboard/SummarizerSection';
import MCQGeneratorSection from '@/components/dashboard/MCQGeneratorSection';
import AdaptiveQuizSection from '@/components/dashboard/AdaptiveQuizSection';
import ResourceFinderSection from '@/components/dashboard/ResourceFinderSection';
import ProgressAnalyticsSection from '@/components/dashboard/ProgressAnalyticsSection';
import SettingsSection from '@/components/dashboard/SettingsSection';
import CopilotSection from '@/components/dashboard/CopilotSection';
import { Alert, AlertDescription } from '@/components/ui/alert';

type InputSource = 'text' | 'pdf' | 'youtube' | null;

interface InputStatus {
  source: InputSource;
  details: string;
  wordCount: number;
}

const UnifiedDashboard = () => {
  const { subjects, currentSubjectId, setCurrentSubject, addSubject, getCurrentSubject } = useAppState();
  const [studyContent, setStudyContent] = useState('');
  const [inputStatus, setInputStatus] = useState<InputStatus>({ source: null, details: '', wordCount: 0 });
  const [activeTab, setActiveTab] = useState('summarizer');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  // Persist copilot context from quiz results
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [lastScore, setLastScore] = useState<number | undefined>();

  const currentSubject = getCurrentSubject();

  useEffect(() => {
    if (studyContent) {
      setInputStatus(prev => ({
        ...prev,
        wordCount: studyContent.split(/\s+/).filter(Boolean).length,
      }));
    } else {
      setInputStatus({ source: null, details: '', wordCount: 0 });
    }
  }, [studyContent]);

  const handleContentChange = (content: string, source: InputSource = 'text', details = '') => {
    setStudyContent(content);
    setInputStatus({ source, details, wordCount: content.split(/\s+/).filter(Boolean).length });
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      addSubject(newSubjectName.trim());
      setNewSubjectName('');
      setIsAddingSubject(false);
    }
  };

  const tabs = [
    { id: 'summarizer', label: 'Summarizer', icon: Lightbulb },
    { id: 'mcq', label: 'MCQ', icon: FileText },
    { id: 'quiz', label: 'Adaptive Quiz', icon: Brain },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'copilot', label: 'Copilot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const hasContent = studyContent.trim().length > 0;
  const subjectName = currentSubject?.name || 'General';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">AI Study Pal</h1>
              <p className="text-xs text-muted-foreground">10 trained ML models · No external APIs</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Subject Bar */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Subject</p>
                  <p className="font-heading font-semibold text-foreground">{subjectName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAddingSubject ? (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Subject name"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                      className="h-9 w-40"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleAddSubject}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingSubject(false)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <Select value={currentSubjectId || ''} onValueChange={setCurrentSubject}>
                      <SelectTrigger className="w-[200px] bg-background">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => setIsAddingSubject(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            {inputStatus.source && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <Badge variant="secondary">Source: {inputStatus.source.toUpperCase()}</Badge>
                  {inputStatus.details && <span className="text-muted-foreground text-xs">{inputStatus.details}</span>}
                  <span className="text-muted-foreground">{inputStatus.wordCount} words loaded</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!currentSubjectId && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Add and select a subject to track your progress across sessions.</AlertDescription>
          </Alert>
        )}

        <StudyInputSection studyContent={studyContent} onContentChange={handleContentChange} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full h-auto gap-1.5 bg-transparent p-0 mb-6" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 rounded-xl border-2 border-border bg-card px-3 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all hover:border-primary/40"
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline text-xs font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="summarizer">
            <SummarizerSection studyContent={studyContent} inputSource={inputStatus.source} subjectName={subjectName} />
          </TabsContent>
          <TabsContent value="mcq">
            <MCQGeneratorSection studyContent={studyContent} inputSource={inputStatus.source} />
          </TabsContent>
          <TabsContent value="quiz">
            <AdaptiveQuizSection />
          </TabsContent>
          <TabsContent value="resources">
            <ResourceFinderSection />
          </TabsContent>
          <TabsContent value="progress">
            <ProgressAnalyticsSection />
          </TabsContent>
          <TabsContent value="copilot">
            <CopilotSection
              subjectName={subjectName}
              weakTopics={weakTopics}
              lastScore={lastScore}
              recentSummary={studyContent.slice(0, 500)}
            />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UnifiedDashboard;
