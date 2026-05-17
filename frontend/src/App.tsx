import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import LandingPage from './pages/LandingPage';
import WorkspaceListPage from './pages/WorkspaceListPage';
import WorkspaceLayout from './pages/WorkspaceLayout';
import WorkspaceDashboardPage from './pages/WorkspaceDashboardPage';
import StudyMaterialPage from './pages/StudyMaterialPage';
import QuizArenaPage from './pages/QuizArenaPage';
import FlashcardsPage from './pages/FlashcardsPage';
import CopilotPage from './pages/CopilotPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PlannerPage from './pages/PlannerPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/workspaces" element={<WorkspaceListPage />} />
          <Route path="/workspaces/:id" element={<WorkspaceLayout />}>
            <Route index element={<WorkspaceDashboardPage />} />
            <Route path="material" element={<StudyMaterialPage />} />
            <Route path="quiz" element={<QuizArenaPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
            <Route path="copilot" element={<CopilotPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="planner" element={<PlannerPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
