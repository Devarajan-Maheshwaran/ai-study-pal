import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import NotesToMcq from "@/pages/NotesToMcq";
import AdaptiveQuiz from "@/pages/AdaptiveQuiz";
import StudyTools from "@/pages/StudyTools";
import Resources from "@/pages/Resources";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/notes-to-mcqs" component={NotesToMcq} />
      <Route path="/quiz" component={AdaptiveQuiz} />
      <Route path="/study-tips" component={StudyTools} />
      <Route path="/resources" component={Resources} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
