import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { generateMCQs, MCQQuestion } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  studyContent: string;
  inputSource: string | null;
}

const MCQGeneratorSection = ({ studyContent, inputSource }: Props) => {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [numQ, setNumQ] = useState('5');
  const { toast } = useToast();

  const hasContent = studyContent.trim().split(/\s+/).filter(Boolean).length >= 20;

  const handleGenerate = async () => {
    if (!hasContent) return;
    setIsLoading(true);
    setSelected({});
    setRevealed({});
    try {
      const data = await generateMCQs(studyContent, 'General', parseInt(numQ));
      setQuestions(data.questions);
      if (data.count === 0) {
        toast({ title: 'No questions generated', description: 'Try adding more detailed content.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'MCQ Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (qid: string, option: string) => {
    if (revealed[qid]) return;
    setSelected((prev) => ({ ...prev, [qid]: option }));
  };

  const handleReveal = (qid: string) => {
    setRevealed((prev) => ({ ...prev, [qid]: true }));
  };

  const revealAll = () => {
    const all: Record<string, boolean> = {};
    questions.forEach((q) => (all[q.id] = true));
    setRevealed(all);
  };

  const score = questions.filter((q) => revealed[q.id] && selected[q.id] === q.answer).length;
  const attempted = Object.keys(revealed).length;

  const diffColor: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                MCQ Generator
              </CardTitle>
              <CardDescription>NLP fill-in-the-blank questions from your notes</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Questions:</Label>
              <Select value={numQ} onValueChange={setNumQ}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 5, 8, 10, 15].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleGenerate} disabled={isLoading || !hasContent} className="gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Generate
              </Button>
            </div>
          </div>
        </CardHeader>

        {!hasContent && (
          <CardContent>
            <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Load study material first.</AlertDescription></Alert>
          </CardContent>
        )}

        {questions.length > 0 && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{questions.length} questions generated</span>
              <div className="flex gap-2">
                {attempted > 0 && (
                  <Badge variant="outline">{score}/{attempted} correct</Badge>
                )}
                <Button size="sm" variant="outline" onClick={revealAll}>Reveal All</Button>
              </div>
            </div>

            {questions.map((q, idx) => (
              <Card key={q.id} className="border border-border">
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium flex-1">
                      <span className="text-muted-foreground mr-1">Q{idx + 1}.</span>
                      {q.question}
                    </p>
                    <Badge className={`text-xs shrink-0 ${diffColor[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                      {q.difficulty}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const isSelected = selected[q.id] === opt;
                      const isCorrect = opt === q.answer;
                      const show = revealed[q.id];
                      let cls = 'border-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ';
                      if (show && isCorrect) cls += 'border-green-500 bg-green-50 text-green-700';
                      else if (show && isSelected && !isCorrect) cls += 'border-red-400 bg-red-50 text-red-700';
                      else if (isSelected) cls += 'border-primary bg-primary/10';
                      else cls += 'border-border hover:border-primary/50 hover:bg-muted/50';
                      return (
                        <div key={opt} className={cls} onClick={() => handleSelect(q.id, opt)}>
                          <div className="flex items-center gap-2">
                            {show && isCorrect && <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                            {show && isSelected && !isCorrect && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                            <span>{opt}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!revealed[q.id] && (
                    <Button size="sm" variant="outline" onClick={() => handleReveal(q.id)} disabled={!selected[q.id]}>
                      Check Answer
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default MCQGeneratorSection;
