import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, BookOpen, Brain, Target, TrendingUp, Award, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import type { ProgressResponse } from '@/lib/apiClient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const ProgressAnalyticsSection = () => {
  const [stats, setStats] = useState<ProgressResponse>({
    averageAccuracy: 0,
    totalQuizAttempts: 0,
    subjectStats: [],
    knowledge: {},
    exam_predictions: {},
    concept_difficulty: {},
    sessions_this_week: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const data: ProgressResponse = await api.getProgress('default');
        setStats(data);
      } catch {
        // keep defaults
      }
    }
    fetchStats();
  }, []);

  const chartData = stats.subjectStats.map(s => ({
    name: s.subjectName.length > 12 ? s.subjectName.slice(0, 12) + '...' : s.subjectName,
    accuracy: s.accuracy,
    attempts: s.quizAttempts,
  }));

  const COLORS = ['hsl(175,65%,40%)', 'hsl(15,85%,55%)', 'hsl(260,60%,55%)',
                  'hsl(45,90%,50%)', 'hsl(200,70%,50%)', 'hsl(340,70%,55%)'];

  const pieData = stats.subjectStats.map((s, idx) => ({
    name: s.subjectName,
    value: s.quizAttempts || 1,
    color: COLORS[idx % COLORS.length],
  }));

  const masteryScore = Math.min(100, Math.round(
    (stats.averageAccuracy * 0.6) + (Math.min(stats.totalQuizAttempts, 20) * 2)
  ));

  const strongTopics = stats.subjectStats
    .filter(s => s.accuracy >= 80 && s.quizAttempts >= 1)
    .map(s => s.subjectName);

  const weakTopics = stats.subjectStats
    .filter(s => s.accuracy < 50 && s.quizAttempts >= 1)
    .map(s => s.subjectName);

  const totalCorrectAnswers = stats.subjectStats.reduce((sum, s) => sum + s.correctAnswers, 0);
  const sessionsThisWeek = stats.sessions_this_week ?? 0;
  const totalSubjects = stats.subjectStats.length;

  const CircularProgress = ({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    return (
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={value >= 80 ? 'hsl(var(--success))' : value >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
          strokeWidth={strokeWidth} strokeDasharray={circumference}
          strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-500" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          className="rotate-90" fill="currentColor" fontSize={size * 0.18} fontWeight="bold"
          style={{ transform: `rotate(90deg) translate(0, -${size}px)` }}
        >
          {value}%
        </text>
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Progress &amp; Analytics
          </CardTitle>
          <CardDescription>Track your study progress and performance across all subjects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Circular Ring */}
            <div className="flex flex-col items-center gap-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Overall Accuracy</h3>
              <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
                <svg width={120} height={120} className="-rotate-90">
                  <circle cx={60} cy={60} r={50} fill="none" stroke="hsl(var(--border))" strokeWidth={10} />
                  <circle cx={60} cy={60} r={50} fill="none"
                    stroke={stats.averageAccuracy >= 80 ? 'hsl(142,71%,45%)' : stats.averageAccuracy >= 50 ? 'hsl(38,92%,50%)' : 'hsl(0,72%,51%)'}
                    strokeWidth={10}
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - stats.averageAccuracy / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-2xl font-bold ${
                    stats.averageAccuracy >= 80 ? 'text-green-600' :
                    stats.averageAccuracy >= 50 ? 'text-yellow-500' : 'text-red-500'
                  }`}>{stats.averageAccuracy}%</span>
                  <span className="text-xs text-muted-foreground">Accuracy</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Based on {stats.totalQuizAttempts} quiz attempts</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Questions Answered', value: stats.totalQuizAttempts, icon: Brain },
                { label: 'Correct Answers', value: totalCorrectAnswers, icon: CheckCircle },
                { label: 'Sessions This Week', value: sessionsThisWeek, icon: Calendar },
                { label: 'Subjects Studied', value: totalSubjects, icon: BookOpen },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className="border">
                  <CardContent className="pt-3 pb-3 text-center">
                    <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Strong/Weak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" /> Strong Topics
              </h4>
              {strongTopics.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {strongTopics.map(t => (
                    <Badge key={t} className="bg-green-100 text-green-700 text-xs">{t}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Complete more quizzes to identify your strengths</p>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-red-500" /> Needs Improvement
              </h4>
              {weakTopics.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.map(t => (
                    <Badge key={t} className="bg-red-100 text-red-700 text-xs">{t}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Great job! No weak areas identified</p>
              )}
            </div>
          </div>

          {/* Mastery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Award className="h-4 w-4" /> Mastery Score
              </h3>
              <Badge variant="secondary">{masteryScore}%</Badge>
            </div>
            <Progress value={masteryScore} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {masteryScore < 30 ? 'Just getting started! Keep practicing.'
                : masteryScore < 60 ? 'Making progress! Continue your studies.'
                : masteryScore < 80 ? "Great work! You're becoming proficient."
                : "Excellent mastery! You're an expert."}
            </p>
          </div>

          {/* Charts */}
          {stats.subjectStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Accuracy by Subject</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} />
                    <Bar dataKey="accuracy" fill="hsl(175,65%,40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Quiz Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="value" label={({ name }) => name}>
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Attempts']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Complete some quizzes to see your analytics
            </div>
          )}

          {/* Per-subject breakdown */}
          {stats.subjectStats.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Subject Breakdown</h3>
              {stats.subjectStats.map((s, idx) => (
                <div key={s.subjectName} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{s.subjectName}</span>
                      <span className={`text-sm font-bold ${
                        s.accuracy >= 80 ? 'text-green-600' :
                        s.accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'
                      }`}>{s.accuracy}%</span>
                    </div>
                    <Progress value={s.accuracy} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.correctAnswers}/{s.totalQuestions} correct · {s.quizAttempts} attempts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressAnalyticsSection;
