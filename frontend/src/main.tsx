import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries:   { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                border:     '1px solid var(--border-color)',
                color:      'var(--text-primary)',
                fontSize:   '13px',
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
