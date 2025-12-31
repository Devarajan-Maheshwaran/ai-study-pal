import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, CheckCircle2, Download, Eye, EyeOff, AlertCircle, Plus } from 'lucide-react';
import { api, MCQ } from '@/lib/apiClient';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

type InputSource = 'text' | 'pdf' | 'youtube' | null;

interface MCQGeneratorSectionProps {
  studyContent: string;
  inputSource?: InputSource;
}

const MCQGeneratorSection = ({ studyContent, inputSource = 'text' }: MCQGeneratorSectionProps) => {
  const { currentSubjectId, addQuestions, getCurrentSubject } = useAppState();
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const currentSubject = getCurrentSubject();
  const hasContent = studyContent.trim().length >= 50;

  const handleGenerate = async () => {
    if (!hasContent) {
      toast({ title: 'No content', description: 'Please add study material first', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setRevealedAnswers(new Set());
    
    try {
      const payload = { subject: currentSubject?.name || 'General', num_questions: questionCount };
      if (inputSource === 'pdf') {
        // TODO: wire up PDF file from parent/global state if available
      } else if (inputSource === 'youtube') {
        payload.youtube_url = studyContent;
      } else {
        payload.notes = studyContent;
      }
      const response = await api.generateMCQs(payload);
      setMcqs(response.questions);
      // Save to state if subject selected
      if (currentSubjectId && response.questions.length > 0) {
        addQuestions(response.questions.map(q => ({
          subjectId: currentSubjectId,
          question: q.question,
          options: q.options,
          correctAnswer: q.answer,
          difficulty: q.difficulty,
          topic: q.topic,
        })));
      }
      toast({ title: 'MCQs generated', description: `Generated ${response.questions.length} questions from your ${inputSource || 'text'}` });
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to generate MCQs', variant: 'destructive' });
    }
    setIsGenerating(false);
  };

  const handleGenerateMore = async () => {
    if (!hasContent) return;

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const additional = generateMCQsFromText(studyContent, 10);
    const newMcqs = [...mcqs, ...additional];
    setMcqs(newMcqs);

    if (currentSubjectId && additional.length > 0) {
      addQuestions(additional.map(q => ({
        subjectId: currentSubjectId,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        topic: q.topic,
      })));
    }

    setIsGenerating(false);
    toast({ title: 'More MCQs added', description: `Added ${additional.length} more questions` });
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const revealAll = () => {
    setRevealedAnswers(new Set(mcqs.map((_, i) => i)));
  };

  const hideAll = () => {
    setRevealedAnswers(new Set());
  };

  const exportToText = () => {
    const text = mcqs.map((q, idx) => {
      return `Q${idx + 1}. [${q.difficulty.toUpperCase()}] ${q.question}
${q.options.map((opt, i) => `   ${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}
   Answer: ${String.fromCharCode(65 + q.correctAnswer)}
   Topic: ${q.topic || 'General'}
   Explanation: ${q.explanation || 'N/A'}
`;
    }).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcqs_${currentSubject?.name || 'study'}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'MCQs downloaded as text file' });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/10 text-success border-success/30';
      case 'medium': return 'bg-warning/10 text-warning border-warning/30';
      case 'hard': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-2 border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Notes to MCQs Generator
        </CardTitle>
        <CardDescription>
          Generate multiple-choice questions from your {inputSource || 'study material'} for self-testing.
          <span className="block text-xs mt-1 text-muted-foreground">
            Backend: NLP keyword extraction → LSTM question generator → distractor synthesis
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-32">
            <Label htmlFor="count">Questions</Label>
            <Input
              id="count"
              type="number"
              min={5}
              max={50}
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(5, Math.min(50, parseInt(e.target.value) || 10)))}
            />
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !hasContent}
            className="gradient-hero text-primary-foreground"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate MCQs
              </>
            )}
          </Button>
          {mcqs.length > 0 && (
            <>
              <Button variant="outline" onClick={handleGenerateMore} disabled={isGenerating}>
                <Plus className="mr-2 h-4 w-4" />
                Generate 10 More
              </Button>
              <Button variant="outline" onClick={exportToText}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </div>

        {/* Validation */}
        {!hasContent && (
          <Alert variant="default" className="border-warning/50 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              Add at least 50 characters of study material above to generate MCQs.
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {mcqs.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {mcqs.length} MCQs generated
                </Badge>
                <span className="text-sm text-muted-foreground">
                  from {inputSource?.toUpperCase() || 'TEXT'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={revealAll}>
                  <Eye className="h-4 w-4 mr-1" />
                  Reveal All
                </Button>
                <Button variant="ghost" size="sm" onClick={hideAll}>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide All
                </Button>
              </div>
            </div>

            {/* MCQ Cards */}
            <div className="grid gap-4">
              {mcqs.map((q, idx) => {
                const isRevealed = revealedAnswers.has(idx);
                
                return (
                  <div 
                    key={idx} 
                    className="rounded-xl border border-border bg-secondary/20 p-5 transition-all hover:shadow-md"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <Badge variant="outline" className={getDifficultyColor(q.difficulty)}>
                          {q.difficulty}
                        </Badge>
                        {q.topic && (
                          <Badge variant="secondary" className="font-normal">
                            Topic: {q.topic}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Source: {inputSource?.toUpperCase() || 'TEXT'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Question Text */}
                    <p className="font-medium text-foreground mb-4 text-base">{q.question}</p>
                    
                    {/* Options */}
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((option, optIdx) => {
                        const isCorrect = optIdx === q.correctAnswer;
                        
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                              isRevealed && isCorrect
                                ? 'bg-success/10 border-success/50'
                                : 'bg-background border-border'
                            }`}
                          >
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium shrink-0 ${
                              isRevealed && isCorrect
                                ? 'bg-success text-success-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-sm flex-1">{option}</span>
                            {isRevealed && isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Show/Hide Answer Button */}
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAnswer(idx)}
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide Answer
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Show Answer
                          </>
                        )}
                      </Button>
                      
                      {isRevealed && q.explanation && (
                        <p className="text-sm text-muted-foreground italic flex-1 ml-4">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MCQGeneratorSection;
