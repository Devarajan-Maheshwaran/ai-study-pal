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
import { StudyTipsPage } from "./pages/StudyTipsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import SettingsPage from "./pages/SettingsPage";
import StudyPlanPage from "./pages/StudyPlanPage";
import QuizGeneratorPage from "./pages/QuizGeneratorPage";
import SummarizerPage from "./pages/SummarizerPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VanillaLoginPage from '@/pages/VanillaLoginPage';
import VanillaSignupPage from '@/pages/VanillaSignupPage';
import VanillaDashboardPage from '@/pages/VanillaDashboardPage';

const queryClient = new QueryClient();

import React from "react";
import { useLocation, Navigate } from "react-router-dom";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem("google_jwt"));
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

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
        <Routes>
           <Route path="/login" element={<LoginPage />} />
           <Route path="/register" element={<RegisterPage />} />
          <Route path="/vanilla-login" element={<VanillaLoginPage />} />
          <Route path="/vanilla-signup" element={<VanillaSignupPage />} />
          <Route path="/vanilla-dashboard" element={<VanillaDashboardPage />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
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
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
