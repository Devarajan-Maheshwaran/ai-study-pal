import { Component, type ReactNode } from 'react';

interface Props  { children: ReactNode; }
interface State  { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-status-red/30 bg-status-red/5">
          <span className="text-lg">⚠</span>
        </div>
        <div className="text-center max-w-sm">
          <p className="text-sm font-semibold text-ink mb-1">Something went wrong</p>
          <p className="text-xs text-ink-faint font-mono">{this.state.error.message}</p>
        </div>
        <button
          type="button"
          onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
          className="btn-outline text-xs"
        >
          Back to home
        </button>
      </div>
    );
    return this.props.children;
  }
}
