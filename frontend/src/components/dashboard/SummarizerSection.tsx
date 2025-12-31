import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Copy, CheckCircle2, Loader2, BookOpen, ListChecks, Calculator, FileText, Clock, AlertCircle } from 'lucide-react';
import { api, SummarizeResponse } from '@/lib/apiClient';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

type InputSource = 'text' | 'pdf' | 'youtube' | null;

interface SummarizerSectionProps {
  studyContent: string;
  inputSource?: InputSource;
  subjectName?: string;
}

const SummarizerSection = ({ studyContent, inputSource = 'text', subjectName = 'General' }: SummarizerSectionProps) => {
  const { getCurrentSubject, addSummary, currentSubjectId, addNote } = useAppState();
  const [result, setResult] = useState<SummarizeResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const currentSubject = getCurrentSubject();
  const effectiveSubjectName = currentSubject?.name || subjectName;

  const handleGenerate = async () => {
    if (!studyContent.trim()) {
      toast({ title: 'No content', description: 'Please add study material first', variant: 'destructive' });
      return;
    }
    if (studyContent.trim().length < 50) {
      toast({ title: 'Content too short', description: 'Please provide at least 50 characters of content', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    try {
      const payload: { subject: string; notes?: string; youtube_url?: string; pdf?: File } = { subject: effectiveSubjectName };
      if (inputSource === 'pdf') {
        // TODO: wire up PDF file from parent/global state if available
      } else if (inputSource === 'youtube') {
        payload.youtube_url = studyContent;
      } else {
        payload.notes = studyContent;
      }
      const response = await api.summarize(payload);
      setResult(response);
      // Save to state if subject selected
      if (currentSubjectId) {
        const note = addNote({
          subjectId: currentSubjectId,
          title: `Notes - ${new Date().toLocaleDateString()}`,
          content: studyContent,
          source: inputSource || 'text',
        });
        addSummary({
          subjectId: currentSubjectId,
          noteId: note.id,
          originalText: studyContent,
          summary: response.summary,
          keyTerms: response.tips.slice(0, 8),
        });
      }
      toast({ title: 'Summary generated', description: 'Your study material has been processed' });
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to summarize', variant: 'destructive' });
    }
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    
    const text = `📚 SMART SUMMARY & REVISION
Subject: ${effectiveSubjectName}
Source: ${result.processingInfo.sourceType}

━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 SUMMARY
${result.summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 KEY CONCEPTS
${result.keyConcepts.map((c, i) => `${i + 1}. ${c}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 IMPORTANT DEFINITIONS
${result.definitions.map(d => `• ${d.term}: ${d.definition}`).join('\n')}

${result.formulas.length > 0 ? `━━━━━━━━━━━━━━━━━━━━━━━━━━
🔢 FORMULAS / STEPS
${result.formulas.map((f, i) => `${i + 1}. ${f}`).join('\n')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ LAST-MINUTE REVISION TIPS
${result.revisionTips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied to clipboard' });
  };

  const hasContent = studyContent.trim().length >= 50;

  return (
    <Card className="border-2 border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Smart Summary & Last-Minute Revision
        </CardTitle>
        <CardDescription>
          Generate structured summaries with key concepts, definitions, formulas, and revision tips.
          <span className="block text-xs mt-1 text-muted-foreground">
            Backend: TF-IDF sentence ranking + keyword extraction + rule-based templating
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate Button */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !hasContent}
            className="gradient-hero text-primary-foreground"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing with local NLP...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate Summary & Tips
              </>
            )}
          </Button>
          {!hasContent && (
            <p className="text-sm text-muted-foreground">Add at least 50 characters of study material above</p>
          )}
        </div>

        {/* Validation Message */}
        {!hasContent && studyContent.length > 0 && (
          <Alert variant="default" className="border-warning/50 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              Content too short ({studyContent.length} characters). Add more material for better results.
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 animate-fade-in">
            {/* Source Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Generated from: {result.processingInfo.sourceType}
                </Badge>
                <Badge variant="outline">
                  Subject: {effectiveSubjectName}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {result.processingInfo.processingTime}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy All'}
              </Button>
            </div>

            {/* Summary Section */}
            <div className="rounded-xl border border-border bg-secondary/30 p-5">
              <h3 className="font-heading font-semibold flex items-center gap-2 text-foreground mb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                Summary
              </h3>
              <p className="text-foreground leading-relaxed">{result.summary}</p>
            </div>

            {/* Key Concepts */}
            <div className="rounded-xl border border-border bg-primary/5 p-5">
              <h3 className="font-heading font-semibold mb-3 text-foreground">🎯 Key Concepts</h3>
              <ul className="space-y-2">
                {result.keyConcepts.slice(0, 10).map((concept, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-foreground">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm">{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Definitions */}
            {result.definitions.length > 0 && (
              <div className="rounded-xl border border-border bg-accent/5 p-5">
                <h3 className="font-heading font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <FileText className="h-4 w-4 text-accent" />
                  Important Definitions
                </h3>
                <div className="space-y-3">
                  {result.definitions.map((def, idx) => (
                    <div key={idx} className="border-l-2 border-accent/50 pl-3">
                      <span className="font-semibold text-foreground">{def.term}:</span>
                      <span className="text-muted-foreground ml-2">{def.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulas/Steps */}
            {result.formulas.length > 0 && (
              <div className="rounded-xl border border-border bg-warning/5 p-5">
                <h3 className="font-heading font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Calculator className="h-4 w-4 text-warning" />
                  Formulas / Steps
                </h3>
                <ol className="space-y-2 list-decimal list-inside">
                  {result.formulas.map((formula, idx) => (
                    <li key={idx} className="text-foreground text-sm font-mono bg-background/50 p-2 rounded">
                      {formula}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Revision Tips */}
            <div className="rounded-xl border border-success/30 bg-success/5 p-5">
              <h3 className="font-heading font-semibold mb-3 flex items-center gap-2 text-foreground">
                <ListChecks className="h-4 w-4 text-success" />
                Last-Minute Revision Tips
              </h3>
              <ul className="space-y-2">
                {result.revisionTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-foreground">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success text-xs font-bold shrink-0">
                      ✓
                    </span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SummarizerSection;
