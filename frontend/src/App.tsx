import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import NotesToMcqsPage from './pages/NotesToMcqsPage';
import AdaptiveQuizPage from './pages/AdaptiveQuizPage';
import RevisionPage from './pages/RevisionPage';
import ResourcesPage from './pages/ResourcesPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient()


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="notes-to-mcqs" element={<NotesToMcqsPage />} />
            <Route path="quiz" element={<AdaptiveQuizPage />} />
            <Route path="revision" element={<RevisionPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App
