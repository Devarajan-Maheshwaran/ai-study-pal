import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, BookOpen, Brain, Target, TrendingUp, Award, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, ProgressResponse } from '@/lib/apiClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProgressAnalyticsSection = () => {
  const [stats, setStats] = useState<ProgressResponse>({
    averageAccuracy: 0,
    totalQuizAttempts: 0,
    subjectStats: [],
  });
  useEffect(() => {
    async function fetchStats() {
      try {
        // TODO: wire up user_id if needed
        const data: ProgressResponse = await api.getProgress('user');
        setStats(data);
      } catch (e) {
        // fallback or error
      }
    }
    fetchStats();
  }, []);

  const chartData = stats.subjectStats.map(s => ({
    name: s.subjectName.length > 12 ? s.subjectName.slice(0, 12) + '...' : s.subjectName,
    accuracy: s.accuracy,
    attempts: s.quizAttempts,
  }));

  const pieData = stats.subjectStats.map((s, idx) => ({
    name: s.subjectName,
    value: s.quizAttempts || 1,
    color: subjects[idx]?.color || `hsl(${idx * 60}, 60%, 50%)`,
  }));

  // Calculate mastery score (simple rule-based)
  const masteryScore = Math.min(100, Math.round(
    (stats.averageAccuracy * 0.6) + 
    (Math.min(stats.totalQuizAttempts, 20) * 2)
  ));

  // Identify strong and weak topics
  const strongTopics = stats.subjectStats
    .filter(s => s.accuracy >= 80 && s.quizAttempts >= 1)
    .map(s => s.subjectName);
  
  const weakTopics = stats.subjectStats
    .filter(s => s.accuracy < 50 && s.quizAttempts >= 1)
    .map(s => s.subjectName);

  // Sessions this week (simplified - just count recent attempts)
  const sessionsThisWeek = Math.min(quizAttempts.length, 7);

  // Circular progress ring component
  const CircularProgress = ({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={value >= 80 ? 'hsl(var(--success))' : value >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`text-2xl font-bold ${
            value >= 80 ? 'text-success' : value >= 50 ? 'text-warning' : 'text-destructive'
          }`}>
            {value}%
          </span>
          <span className="text-xs text-muted-foreground">Accuracy</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2 border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Progress & Analytics
        </CardTitle>
        <CardDescription>
          Track your study progress and performance across all subjects.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Row: Circular Progress + Key Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Circular Progress Ring */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-secondary/20 p-6">
            <CircularProgress value={stats.averageAccuracy} size={140} strokeWidth={12} />
            <h3 className="font-heading font-semibold text-foreground mt-4">Overall Accuracy</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Based on {stats.totalQuizAttempts} quiz attempts
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalQuizAttempts}</p>
                  <p className="text-xs text-muted-foreground">Questions Answered</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-success/5 border border-success/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalCorrectAnswers}</p>
                  <p className="text-xs text-muted-foreground">Correct Answers</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{sessionsThisWeek}</p>
                  <p className="text-xs text-muted-foreground">Sessions This Week</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-warning/5 border border-warning/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                  <BookOpen className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalSubjects}</p>
                  <p className="text-xs text-muted-foreground">Subjects Studied</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strong & Weak Topics */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-success" />
              <h4 className="font-semibold text-sm">Strong Topics</h4>
            </div>
            {strongTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {strongTopics.map(topic => (
                  <Badge key={topic} variant="outline" className="border-success text-success">
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Complete more quizzes to identify your strengths</p>
            )}
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <h4 className="font-semibold text-sm">Needs Improvement</h4>
            </div>
            {weakTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weakTopics.map(topic => (
                  <Badge key={topic} variant="outline" className="border-destructive text-destructive">
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Great job! No weak areas identified</p>
            )}
          </div>
        </div>

        {/* Mastery Progress */}
        <div className="rounded-xl border border-border bg-secondary/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Mastery Score
            </h3>
            <span className="text-sm font-medium text-primary">{masteryScore}%</span>
          </div>
          <Progress value={masteryScore} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {masteryScore < 30 ? 'Just getting started! Keep practicing.' :
             masteryScore < 60 ? 'Making progress! Continue your studies.' :
             masteryScore < 80 ? 'Great work! You\'re becoming proficient.' :
             'Excellent mastery! You\'re an expert.'}
          </p>
        </div>

        {/* Charts */}
        {stats.subjectStats.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Accuracy Chart */}
            <div className="rounded-xl border border-border bg-secondary/20 p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Accuracy by Subject</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={11} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Accuracy']}
                    />
                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="rounded-xl border border-border bg-secondary/20 p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Quiz Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [value, 'Attempts']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Complete some quizzes to see your analytics</p>
          </div>
        )}

        {/* Per-Subject Breakdown */}
        {stats.subjectStats.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-foreground">Subject Breakdown</h3>
            {stats.subjectStats.map((subject) => (
              <div key={subject.subjectId} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: subjects.find(s => s.id === subject.subjectId)?.color }} 
                    />
                    <span className="font-medium text-foreground">{subject.subjectName}</span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    subject.accuracy >= 80 ? 'text-success' : 
                    subject.accuracy >= 50 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {subject.accuracy}%
                  </span>
                </div>
                <Progress value={subject.accuracy} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {subject.correctAnswers}/{subject.totalQuestions} correct • {subject.quizAttempts} quiz attempts
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressAnalyticsSection;
