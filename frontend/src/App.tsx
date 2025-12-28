import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import DashboardPage from "./pages/DashboardPage";
import NotesToMcqsPage from "./pages/NotesToMcqsPage";
import AdaptiveQuizPage from "./pages/AdaptiveQuizPage";
import { StudyTipsPage } from "./pages/StudyTipsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { AuroraBackground } from './components/aurora-background';

const queryClient = new QueryClient();

const App = () => (    
            <AuroraBackground>
<QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
        </AuroraBackground>
            );

export default App;
