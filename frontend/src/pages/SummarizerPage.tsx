import { useState } from "react";
import { FileText, Loader2, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { summarizeText, SummarizeRequest, SummarizeResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SummarizerPage() {
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<SummarizeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<SummarizeRequest>({
    text: "",
    max_sentences: 2
  });
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!formData.text.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const result = await summarizeText(formData);
      setSummary(result);
      toast({
        title: "Success",
        description: "Text summarized successfully!",
      });
    } catch (error) {
      console.error("Failed to summarize text:", error);
      toast({
        title: "Error",
        description: "Failed to summarize text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary.summary);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Summary copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setFormData({ text: "", max_sentences: 2 });
    setSummary(null);
    setCopied(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Text Summarizer</h1>
          <p className="text-muted-foreground mt-1">
            Summarize long texts into concise, readable summaries using AI
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Input Text
            </CardTitle>
            <CardDescription>
              Paste or type the text you want to summarize
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text to Summarize</Label>
              <Textarea
                id="text"
                placeholder="Enter or paste your text here..."
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={12}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_sentences">Maximum Sentences</Label>
              <Input
                id="max_sentences"
                type="number"
                min="1"
                max="10"
                value={formData.max_sentences}
                onChange={(e) => setFormData({ ...formData, max_sentences: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSummarize}
                disabled={generating || !formData.text.trim()}
                className="flex-1"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Summarize
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              {summary ? "Your summarized text" : "Summary will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {summary.original_length}
                    </div>
                    <div className="text-xs text-muted-foreground">Original Length</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {summary.summary_length}
                    </div>
                    <div className="text-xs text-muted-foreground">Summary Length</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {summary.compression_ratio.toFixed(1)}% compression
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Separator />

                {/* Summary Text */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {summary.summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No summary generated yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter text in the form and click "Summarize" to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
