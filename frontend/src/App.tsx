import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import LandingPage            from './pages/LandingPage';
import DocsPage               from './pages/DocsPage';
import AuthPage               from './pages/AuthPage';
import WorkspaceListPage      from './pages/WorkspaceListPage';
import WorkspaceDashboardPage from './pages/WorkspaceDashboardPage';
import StudyMaterialPage      from './pages/StudyMaterialPage';
import QuizArenaPage          from './pages/QuizArenaPage';
import FlashcardsPage         from './pages/FlashcardsPage';
import CopilotPage            from './pages/CopilotPage';
import AnalyticsPage          from './pages/AnalyticsPage';
import PlannerPage            from './pages/PlannerPage';
import NotFound               from './pages/NotFound';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path="/"     element={<LandingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* App routes — with sidebar via AppShell */}
        <Route element={<AppShell />}>
          <Route path="/workspaces" element={<WorkspaceListPage />} />
          <Route path="/workspaces/:id">
            <Route index                    element={<WorkspaceDashboardPage />} />
            <Route path="material"          element={<StudyMaterialPage />} />
            <Route path="quiz"              element={<QuizArenaPage />} />
            <Route path="flashcards"        element={<FlashcardsPage />} />
            <Route path="copilot"           element={<CopilotPage />} />
            <Route path="analytics"         element={<AnalyticsPage />} />
            <Route path="planner"           element={<PlannerPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </QueryClientProvider>
  );
}
