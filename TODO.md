yes# Wire React Frontend to Flask Backend

## 1. Backend checklist (one-time)
- [x] Confirm CORS is enabled in app.py (already done)
- [ ] Start backend: cd backend && python app.py
- [ ] Verify http://127.0.0.1:5000/health returns JSON

## 2. Frontend proxy setup (dev mode)
- [ ] Add "proxy": "http://127.0.0.1:5000" to frontend/package.json
- [ ] Restart React dev server after editing

## 3. Create/update API helper
- [ ] Update frontend/src/lib/api.ts to use proxy and match backend endpoints:
  - health: /health
  - subjects: /api/subjects
  - dashboard: /api/dashboard
  - notesToMcqs: /api/notes-to-mcqs
  - adaptiveQuiz: /api/adaptive-quiz
  - submitQuiz: /api/quiz/submit
  - revisionSummary: /api/revision-summary
  - resources: /api/resources
  - studySchedule: /api/study-schedule

## 4. Wire each page to the API
- [ ] DashboardPage: use api.subjects() and api.dashboard(userId)
- [ ] NotesToMcqsPage: use api.notesToMcqs(payload)
- [ ] AdaptiveQuizPage: use api.adaptiveQuiz(userId, subject) and api.submitQuiz(body)
- [ ] StudyTipsPage: use api.revisionSummary(body)
- [ ] ResourcesPage: use api.resources(subject, limit)
- [ ] SettingsPage: use api.studySchedule(subject, hours)

## 5. Quick sanity test
- [ ] Backend: python app.py
- [ ] Frontend: npm start
- [ ] Open React app and test API calls
