import { useNavigate } from 'react-router-dom';
import { Brain, BookOpen, BarChart3, Target, Zap, TrendingUp, FileText, Youtube, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Brain, title: 'AI Summarization', desc: 'TF-IDF sentence extraction trained in NLP notebooks condenses any content into concise bullet-point summaries.', color: 'from-violet-500 to-purple-600' },
  { icon: Target, title: 'MCQ Generation', desc: 'NLP-powered question generation from your own notes with automatic difficulty classification (easy/medium/hard).', color: 'from-blue-500 to-cyan-600' },
  { icon: Zap, title: 'Adaptive Quiz Engine', desc: 'Adjusts question difficulty in real-time based on your answers using the trained difficulty classifier model.', color: 'from-amber-500 to-orange-600' },
  { icon: TrendingUp, title: 'Knowledge Tracing', desc: 'BKT-inspired model estimates your learning ability and tracks performance trend across sessions (NB07).', color: 'from-green-500 to-emerald-600' },
  { icon: BarChart3, title: 'Exam Prediction', desc: 'Regression-based model predicts your exam readiness score from quiz history and consistency (NB08).', color: 'from-pink-500 to-rose-600' },
  { icon: BookOpen, title: 'Study Planner', desc: 'Study time optimizer weights your weak topics higher automatically using concept difficulty rankings (NB09/NB10).', color: 'from-indigo-500 to-blue-600' },
];

const inputTypes = [
  { icon: FileText, label: 'Paste Notes', desc: 'Any text' },
  { icon: Upload, label: 'Upload PDF', desc: 'Any document' },
  { icon: Youtube, label: 'YouTube Link', desc: 'Video content' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-violet-500" />
            <span className="font-bold text-lg">AI Study Pal</span>
          </div>
          <Button onClick={() => navigate('/dashboard')} className="bg-violet-600 hover:bg-violet-700 text-white">
            Open Dashboard
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" /> AI Capstone Project &mdash; 10 Trained Models
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Study Smarter with
            <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent"> AI-Powered</span>{' '}
            Intelligence
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Transform any study material into adaptive quizzes, smart summaries, and personalized study plans &mdash; all powered by models trained in Jupyter Notebooks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/dashboard')} className="bg-violet-600 hover:bg-violet-700 text-white px-8">
              Start Studying Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('https://github.com/Devarajan-Maheshwaran/ai-study-pal','_blank')}>
              View on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Input Types */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-muted-foreground mb-6 text-sm uppercase tracking-widest">Works with any content format</p>
          <div className="grid grid-cols-3 gap-4">
            {inputTypes.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur">
                <Icon className="w-7 h-7 text-violet-400" />
                <span className="font-semibold text-sm">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Powered by 10 Trained AI Models</h2>
          <p className="text-center text-muted-foreground mb-14">Each feature maps directly to a trained model from the AI Capstone Notebooks</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-6 rounded-2xl border border-border/60 bg-card/40 hover:bg-card/70 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30">
          <h2 className="text-3xl font-bold mb-4">Ready to study smarter?</h2>
          <p className="text-muted-foreground mb-8">Paste your notes, generate questions, and track your progress &mdash; all in one workspace.</p>
          <Button size="lg" onClick={() => navigate('/dashboard')} className="bg-violet-600 hover:bg-violet-700 text-white px-10">
            Open Dashboard
          </Button>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40">
        Built by Devarajan Maheshwaran &bull; AI Capstone Project &bull; React + Flask + 10 Trained ML Models
      </footer>
    </div>
  );
}
