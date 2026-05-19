/**
 * UnifiedDashboard — legacy prototype, NOT wired into routing.
 *
 * This file is kept for reference only. It depends on dashboard/* section
 * components (StudyInputSection, SummarizerSection, etc.) that have not been
 * implemented in this codebase. Do not import this file from App.tsx or any
 * active page — doing so will cause a build error.
 *
 * The current app uses the workspace-scoped pages under /workspaces/:id instead:
 *   - WorkspaceDashboardPage  → overview
 *   - StudyMaterialPage       → upload
 *   - QuizArenaPage           → quiz
 *   - FlashcardsPage          → flashcards
 *   - CopilotPage             → AI copilot
 *   - AnalyticsPage           → analytics
 *   - PlannerPage             → study planner
 */

export default function UnifiedDashboard() {
  return null;
}
