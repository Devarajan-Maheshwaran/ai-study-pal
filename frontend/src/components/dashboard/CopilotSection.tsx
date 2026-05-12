import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Loader2, User, Sparkles } from 'lucide-react';
import { askCopilot } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

interface Props {
  subjectName: string;
  weakTopics?: string[];
  lastScore?: number;
  recentSummary?: string;
}

const QUICK_PROMPTS = [
  'What should I study next?',
  'Where am I weakest?',
  'How do I improve my score?',
  'Give me a study tip for today',
];

const CopilotSection = ({ subjectName, weakTopics = [], lastScore, recentSummary }: Props) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: `Hi! I'm your StudyForge Copilot for **${subjectName}**. I can see your quiz history and weak topics. Ask me anything — what to study next, how to improve, or to explain a concept.`,
    ts: Date.now(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: msg, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const res = await askCopilot({
        message: msg,
        subject: subjectName,
        weak_topics: weakTopics,
        last_score: lastScore,
        recent_summary: recentSummary,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.response, ts: Date.now() }]);
    } catch (e: any) {
      toast({ title: 'Copilot error', description: e.message, variant: 'destructive' });
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
        ts: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[520px]">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">StudyForge Copilot</CardTitle>
              <CardDescription className="text-xs">Grounded in your learning data · No external API</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {weakTopics.length > 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                {weakTopics.length} weak topics tracked
              </Badge>
            )}
            {lastScore !== undefined && (
              <Badge variant="secondary" className="text-xs">Last: {lastScore}%</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.ts} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-muted text-foreground rounded-tl-sm'
            }`}>
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </CardContent>

      {/* Quick prompts */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap border-t pt-3">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={isLoading}
            className="text-xs border border-border rounded-full px-3 py-1 hover:bg-muted/60 transition-colors disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex gap-2">
        <Input
          placeholder="Ask anything about your study material..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} size="icon">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
  );
};

export default CopilotSection;
