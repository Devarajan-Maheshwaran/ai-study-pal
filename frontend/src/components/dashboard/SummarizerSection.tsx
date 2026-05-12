import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lightbulb, Loader2, Copy, CheckCheck, BookOpen, Target, AlertCircle } from 'lucide-react';
import { summarize, SummaryResult } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  studyContent: string;
  inputSource: string | null;
  subjectName: string;
}

const SummarizerSection = ({ studyContent, inputSource, subjectName }: Props) => {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const hasContent = studyContent.trim().split(/\s+/).filter(Boolean).length >= 20;

  const handleSummarize = async () => {
    if (!hasContent) return;
    setIsLoading(true);
    try {
      const data = await summarize(studyContent, subjectName);
      setResult(data);
    } catch (e: any) {
      toast({ title: 'Summarization failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                AI Summarizer
              </CardTitle>
              <CardDescription>TF-IDF extractive summarization — your own trained model</CardDescription>
            </div>
            <Button onClick={handleSummarize} disabled={isLoading || !hasContent} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
              {isLoading ? 'Summarizing...' : 'Summarize'}
            </Button>
          </div>
        </CardHeader>
        {!hasContent && (
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Load at least 20 words of study material above first.</AlertDescription>
            </Alert>
          </CardContent>
        )}
        {result && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Summary</h3>
              <Button size="sm" variant="ghost" onClick={handleCopy} className="gap-1.5 text-xs">
                {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm leading-relaxed text-foreground bg-muted/40 rounded-lg p-4">{result.summary}</p>

            <Separator />

            {result.keywords.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> Key Concepts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {result.tips.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Target className="h-4 w-4" /> Study Tips
                </h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SummarizerSection;
