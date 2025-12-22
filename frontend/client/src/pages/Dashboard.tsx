import { PageContainer } from "@/components/PageContainer";
import { useLearningPath } from "@/hooks/use-api";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Target,
  Trophy,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Activity,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Dashboard() {
  const { data, isLoading } = useLearningPath();

  if (isLoading) {
    return (
      <PageContainer title="Dashboard" description="Welcome back to your personal learning hub.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
      </PageContainer>
    );
  }

  const stats = data?.topicStats || [];
  const nextSteps = data?.nextSteps || [];

  return (
    <PageContainer 
      title="Dashboard" 
      description="Track your progress and stay on top of your learning goals."
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          title="Topics Mastered" 
          value={stats.filter(s => s.masteryLevel === 'Expert').length}
          icon={<Trophy className="w-6 h-6" />}
          description="Keep pushing for excellence!"
          color="accent"
        />
        <StatsCard 
          title="Avg. Score" 
          value={stats.length > 0 ? `${Math.round(stats.reduce((a, b) => a + b.averageScore, 0) / stats.length)}%` : "0%"}
          icon={<Target className="w-6 h-6" />}
          description="Across all quizzes"
          color="primary"
        />
        <StatsCard 
          title="Total Attempts" 
          value={stats.reduce((a, b) => a + b.attempts, 0)}
          icon={<Activity className="w-6 h-6" />}
          description="Practice makes perfect"
          color="blue"
        />
        <StatsCard 
          title="Active Streak" 
          value="3 Days"
          icon={<Zap className="w-6 h-6" />}
          description="Don't break the chain!"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Learning Path */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Your Learning Path</h2>
              <Link href="/quiz">
                <Button variant="outline" className="gap-2">
                  See All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {nextSteps.length === 0 ? (
                <div className="bg-card p-8 rounded-2xl border border-dashed border-border text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">Start by taking a quiz or generating notes.</p>
                  <Link href="/notes-to-mcqs">
                    <Button>Generate Content</Button>
                  </Link>
                </div>
              ) : (
                nextSteps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {step.type === 'quiz' ? <Brain className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          {step.type}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-md text-accent-dark">
                          {step.difficulty}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{step.topic}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {step.reason || "Recommended based on your recent activity."}
                      </p>
                      <Link href={step.type === 'quiz' ? '/quiz' : '/resources'}>
                        <Button size="sm" className="w-full sm:w-auto">
                          Start {step.type === 'quiz' ? 'Quiz' : 'Review'}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Performance Chart */}
          <section className="bg-card p-6 rounded-2xl border border-border">
            <h2 className="text-xl font-display font-bold mb-6">Topic Mastery</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="topic" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    unit="%"
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="averageScore" radius={[6, 6, 0, 0]} barSize={40}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.averageScore > 80 ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-2xl shadow-lg shadow-primary/20">
            <h3 className="font-display font-bold text-xl mb-2">Daily Goal</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold">2/3</span>
              <span className="mb-1 opacity-80 font-medium">lessons</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-4">
              <div className="bg-white h-full w-[66%] rounded-full" />
            </div>
            <p className="text-sm opacity-90 mb-4">You're doing great! Complete one more lesson to hit your streak.</p>
            <Button variant="secondary" className="w-full text-primary font-bold">Continue Learning</Button>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Upcoming</h3>
            </div>
            <div className="space-y-4">
              {[
                { title: "Calculus Review", time: "Tomorrow, 10:00 AM" },
                { title: "Physics Quiz", time: "Wednesday, 2:00 PM" }
              ].map((event, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
