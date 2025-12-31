// Minimal config for API endpoints and constants

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ROUTES = {
  dashboard: '/',
  notesToMcqs: '/notes-to-mcqs',
  quiz: '/quiz',
  revision: '/revision',
  resources: '/resources',
  settings: '/settings',
};
