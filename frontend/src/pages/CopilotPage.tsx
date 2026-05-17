import { Bot, Wrench } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';

const AGENT_TOOLS = [
  { name: 'search_workspace_docs',  desc: 'Retrieve chunks from your uploaded notes via vector search.' },
  { name: 'summarize_topic',        desc: 'Run the Text Summarizer model on a given topic.' },
  { name: 'generate_quiz',          desc: 'Trigger the Quiz Difficulty Classifier to produce adaptive questions.' },
  { name: 'get_weak_topics',        desc: 'Pull weak-topic signal from Knowledge Tracing model.' },
  { name: 'update_study_plan',      desc: 'Invoke Study Time Optimizer to regenerate today\'s plan.' },
  { name: 'predict_exam_score',     desc: 'Call the Exam Score Predictor and return readiness estimate.' },
  { name: 'recommend_resources',    desc: 'Resource Recommender returns links aligned to weak concepts.' },
  { name: 'create_flashcards',      desc: 'Generate and schedule flashcards for a topic.' },
];

export default function CopilotPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <PaperCard>
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-5 w-5 text-ink-faint" />
          <p className="section-label">jarvis study copilot</p>
        </div>
        <p className="text-xs text-ink-faint leading-relaxed">
          The copilot is a tool-using agent orchestrated with LangGraph.
          It calls your own ML services — not any external AI API — to answer
          questions grounded in your notes, diagnose weak topics, regenerate
          study plans, and explain quiz feedback. Wired in Phase 4.
        </p>
      </PaperCard>

      {/* Chat shell */}
      <PaperCard flush>
        <div className="flex flex-col h-72">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-8 w-8 text-ink-ghost mx-auto mb-2" />
              <p className="text-xs font-mono text-ink-faint">Copilot chat — Phase 4</p>
              <p className="text-[11px] text-ink-ghost mt-1">
                Will use LangGraph supervisor + your ML service tools
              </p>
            </div>
          </div>
          <div className="rule-x p-3 flex gap-2">
            <input
              disabled
              placeholder="Ask about your notes, quiz results, or study plan..."
              className="flex-1 bg-paper-subtle border border-forge-rule rounded-lg px-3 py-2 text-xs font-mono text-ink placeholder-ink-ghost outline-none opacity-50"
            />
            <button
              disabled
              className="btn-ink text-xs opacity-40 cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </PaperCard>

      {/* Tool manifest */}
      <div>
        <p className="section-label mb-3">agent tool manifest</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {AGENT_TOOLS.map(({ name, desc }) => (
            <div key={name} className="card-paper p-3 flex items-start gap-2">
              <Wrench className="h-3.5 w-3.5 text-ink-ghost shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-mono font-semibold text-ink">{name}()</p>
                <p className="text-[11px] text-ink-faint mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
