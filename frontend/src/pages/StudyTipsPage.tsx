import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, FileText, Sparkles, Loader2, List, Quote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api, RevisionSummaryRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function StudyTipsPage() {
  const [inputType, setInputType] = useState<'text' | 'file' | 'link'>('text');
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [subject, setSubject] = useState("");
  const [maxSentences, setMaxSentences] = useState(3);
  const [summary, setSummary] = useState("");
  const [tips, setTips] = useState<string[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTips, setLoadingTips] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

// ...existing code...
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const extractContent = async (): Promise<string> => {
    if (inputType === 'text') return text.trim();
    if (inputType === 'link') {
      // Call backend to extract text from link
      const res = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
      });
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items.map((item: { question: string }) => item.question).join(' ');
      }
      return '';
    }
    if (inputType === 'file' && file) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items.map((item: { question: string }) => item.question).join(' ');
      }
      return '';
    }
    return '';
  };

  const handleSummarize = async () => {
    setLoadingSummary(true);
    try {
      let content = text.trim();
      if (inputType !== 'text') {
        content = await extractContent();
      }
      if (!content) {
        toast({
          title: 'No Content',
          description: 'No content found to summarize.',
          variant: 'destructive',
        });
        setLoadingSummary(false);
        return;
      }
      const body = { text: content, subject: subject.trim() || "General", max_sentences: maxSentences };
      const response = await api.revisionSummary(body);
      setSummary(response.summary);
      toast({
        title: 'Summary Generated',
        description: 'Your content has been summarized successfully.',
      });
    } catch (error) {
      console.error('Failed to summarize:', error);
      toast({
        title: 'Summarization Failed',
        description: 'Unable to summarize content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateTips = async () => {
    setLoadingTips(true);
    try {
      let content = text.trim();
      if (inputType !== 'text') {
        content = await extractContent();
      }
      if (!content) {
        toast({
          title: 'No Content',
          description: 'No content found to generate tips.',
          variant: 'destructive',
        });
        setLoadingTips(false);
        return;
      }
      const request: RevisionSummaryRequest = {
        text: content,
        subject: subject.trim() || "General",
        max_sentences: maxSentences,
      };
      const response = await api.revisionSummary(request);
      setTips(response.tips || []);
      toast({
        title: 'Tips Generated',
        description: `Generated ${response.tips?.length || 0} study tips.`,
      });
    } catch (error) {
      console.error('Failed to generate tips:', error);
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate study tips. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingTips(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Tips</h1>
        <p className="text-muted-foreground mt-1">
          Summarize content and get personalized study recommendations
        </p>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Content
          </CardTitle>
          <CardDescription>
            Enter your study material as text, file, or link to get a summary and helpful tips
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <label>
              <input type="radio" checked={inputType === 'text'} onChange={() => setInputType('text')} /> Text
            </label>
            <label>
              <input type="radio" checked={inputType === 'file'} onChange={() => setInputType('file')} /> File (PDF/DOCX)
            </label>
            <label>
              <input type="radio" checked={inputType === 'link'} onChange={() => setInputType('link')} /> Link
            </label>
          </div>
          {inputType === 'text' && (
            <Textarea
              id="text"
              placeholder="Paste your study material, lecture notes, or textbook content here..."
              className="min-h-[200px] resize-y"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
          {inputType === 'file' && (
            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
          )}
          {inputType === 'link' && (
            <Input
              type="url"
              className="w-full"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="Paste a webpage or Google Doc link..."
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                placeholder="e.g., Biology, History, Math..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSentences">Max Summary Sentences</Label>
              <Input
                id="maxSentences"
                type="number"
                min={1}
                max={10}
                value={maxSentences}
                onChange={(e) => setMaxSentences(parseInt(e.target.value) || 3)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={handleSummarize}
              disabled={loadingSummary}
            >
              {loadingSummary ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Quote className="h-4 w-4 mr-2" />
                  Summarize
                </>
              )}
            </Button>
            <Button
              onClick={handleGenerateTips}
              disabled={loadingTips}
            >
              {loadingTips ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Tips...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Study Tips
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/summarize', { state: { text, summary } })}
              disabled={!summary}
            >
              Go to Summarizer
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/generate-quiz', { state: { text } })}
              disabled={!text && !file && !link}
            >
              Go to Quiz Generator
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {(summary || tips.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Summary Card */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Quote className="h-5 w-5 text-primary" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          {tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!summary && tips.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter your study content above and click "Summarize" or "Generate Study Tips"
              to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
