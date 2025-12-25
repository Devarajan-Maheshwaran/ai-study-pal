import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Aurora from "@/components/Aurora";
import DashboardPage from "./pages/DashboardPage";
import NotesToMcqsPage from "./pages/NotesToMcqsPage";
import AdaptiveQuizPage from "./pages/AdaptiveQuizPage";
import StudyTipsPage from "./pages/StudyTipsPage";
import ResourcesPage from "./pages/ResourcesPage";
import SettingsPage from "./pages/SettingsPage";
import StudyPlanPage from "./pages/StudyPlanPage";
import QuizGeneratorPage from "./pages/QuizGeneratorPage";
import SummarizerPage from "./pages/SummarizerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Aurora
        colorStops={["#FFFFFF", "#DAA520", "#000000"]}
        blend={0.8}
        amplitude={1.5}
      />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/notes-to-mcqs" element={<NotesToMcqsPage />} />
            <Route path="/quiz" element={<AdaptiveQuizPage />} />
            <Route path="/study-tips" element={<StudyTipsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />
            <Route path="/generate-quiz" element={<QuizGeneratorPage />} />
            <Route path="/summarize" element={<SummarizerPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
