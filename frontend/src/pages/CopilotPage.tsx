import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Loader2, Bot, User, Cpu } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import { useCopilotChat } from '@/hooks/useWorkspace';
import { useWorkspaceDetail } from '@/hooks/useWorkspace';

interface Message { role: 'user' | 'assistant'; text: string; context_used?: boolean; }

const STARTERS = [
  'What should I study next?',
  'What are my weak topics?',
  'How is my performance?',
  'Give me study tips.',
  'Motivate me!',
];

export default function CopilotPage() {
  const { id = '' } = useParams();
  const { data: ws } = useWorkspaceDetail(id);
  const chat = useCopilotChat();

  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    text: `Hi! I'm your StudyForge Copilot${ws ? ` for ${ws.subject}` : ''}. Ask me what to study, how to improve, or anything about your progress.`,
  }]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Update greeting when ws loads
  useEffect(() => {
    if (ws && messages.length === 1) {
      setMessages([{ role: 'assistant', text: `Hi! I'm your StudyForge Copilot for ${ws.subject}. Ask me what to study next, where your weak spots are, or anything about your exam prep.` }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws?.subject]);

  function send(text: string) {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    chat.mutate(
      { message: text, workspace_id: id, subject: ws?.subject ?? 'General' },
      {
        onSuccess: (res) => {
          setMessages(m => [...m, { role: 'assistant', text: res.response, context_used: res.context_used }]);
        },
        onError: (err) => {
          setMessages(m => [...m, { role: 'assistant', text: `Error: ${err.message}` }]);
        },
      },
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded border border-forge-rule">
          <Cpu className="h-3.5 w-3.5 text-ink-faint" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">StudyForge Copilot</p>
          <p className="text-[11px] font-mono text-ink-ghost">Context-aware · No external API · Grounded in your data</p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
              m.role === 'user' ? 'border-ink bg-ink text-paper' : 'border-forge-rule bg-paper'
            }`}>
              {m.role === 'user'
                ? <User className="h-3 w-3" />
                : <Bot className="h-3 w-3 text-ink-faint" />}
            </div>
            <div className={`max-w-[78%] ${ m.role === 'user' ? 'items-end' : 'items-start' } flex flex-col gap-1`}>
              <div className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-ink text-paper rounded-tr-sm'
                  : 'bg-paper border border-forge-rule text-ink rounded-tl-sm'
              }`}>
                {m.text}
              </div>
              {m.role === 'assistant' && m.context_used && (
                <span className="text-[9px] font-mono text-ink-ghost ml-1">context used</span>
              )}
            </div>
          </div>
        ))}
        {chat.isPending && (
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-forge-rule bg-paper">
              <Bot className="h-3 w-3 text-ink-faint" />
            </div>
            <div className="rounded-xl px-3.5 py-2.5 bg-paper border border-forge-rule">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-faint" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starters */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {STARTERS.map(s => (
            <button key={s} type="button" onClick={() => send(s)} className="tag cursor-pointer hover:bg-paper-dark text-xs">{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything about your study progress…"
          className="flex-1 rounded-full border border-forge-rule bg-paper px-4 py-2 text-sm text-ink placeholder-ink-ghost outline-none focus:ring-2 focus:ring-ink/15"
        />
        <button type="submit" disabled={!input.trim() || chat.isPending} className="btn-ink rounded-full px-4">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
