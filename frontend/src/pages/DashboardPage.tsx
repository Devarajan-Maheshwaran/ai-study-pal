import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  Target,
  TrendingUp,
  Play,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLearningPath, ping, getUserId, LearningPathResponse, NextStep } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [learningPath, setLearningPath] = useState<LearningPathResponse | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pathData, pingData] = await Promise.all([
        getLearningPath(getUserId()),
        ping(),
      ]);
      setLearningPath(pathData);
      setIsHealthy(pingData.status === "healthy" || pingData.status === "ok");
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the backend. Make sure your Flask server is running.",
        variant: "destructive",
      });
      setIsHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartQuiz = () => {
    const quizStep = learningPath?.next_steps.find((step) => step.type === "quiz");
    if (quizStep) {
      navigate("/quiz", { state: quizStep });
    } else {
      navigate("/notes-to-mcqs");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStepIcon = (step: NextStep) => {
    return step.type === "quiz" ? (
      <Target className="h-4 w-4" />
    ) : (
      <BookOpen className="h-4 w-4" />
    );
  };

  const topicStats = learningPath?.topic_stats || {};
  const nextSteps = learningPath?.next_steps || [];
  const quizStep = nextSteps.find((step) => step.type === "quiz");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and continue learning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            {isHealthy === null ? (
              <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
            ) : isHealthy ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <span className="text-sm text-muted-foreground">
              {isHealthy === null ? "Checking..." : isHealthy ? "Backend Online" : "Backend Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Studied</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{Object.keys(topicStats).length}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {Object.values(topicStats).reduce((acc, t) => acc + t.attempts, 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {Object.values(topicStats).reduce((acc, t) => acc + t.correct, 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {Object.keys(topicStats).length > 0
                  ? Math.round(
                      Object.values(topicStats).reduce((acc, t) => acc + t.accuracy, 0) /
                        Object.keys(topicStats).length
                    )
                  : 0}
                %
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Plan */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Today's Plan
            </CardTitle>
            <CardDescription>Your personalized learning path</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : nextSteps.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No recommendations yet.</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => navigate("/notes-to-mcqs")}
                >
                  Start by creating MCQs from your notes
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {nextSteps.slice(0, 4).map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border"
                    >
                      <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary">
                        {getStepIcon(step)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm capitalize">{step.type}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {step.topic}
                        </p>
                        {step.difficulty && (
                          <Badge
                            variant="secondary"
                            className={`mt-1 text-xs ${getDifficultyColor(step.difficulty)}`}
                          >
                            {step.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {quizStep && (
                  <Button className="w-full" onClick={handleStartQuiz}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Recommended Quiz
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Topic Stats Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Topic Performance</CardTitle>
            <CardDescription>Your progress across different topics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : Object.keys(topicStats).length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No quiz data yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete some quizzes to see your performance stats.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead className="text-center">Attempts</TableHead>
                      <TableHead className="text-center">Correct</TableHead>
                      <TableHead>Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(topicStats).map(([topic, stats]) => (
                      <TableRow key={topic}>
                        <TableCell className="font-medium">{topic}</TableCell>
                        <TableCell className="text-center">{stats.attempts}</TableCell>
                        <TableCell className="text-center text-green-600">
                          {stats.correct}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={stats.accuracy} className="h-2 flex-1" />
                            <span className="text-sm font-medium w-12">
                              {Math.round(stats.accuracy)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
