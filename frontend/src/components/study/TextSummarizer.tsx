import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Sparkles, Copy, Check } from "lucide-react";

interface TextSummarizerProps {
  onSummarize: (text: string) => string;
}

const TextSummarizer = ({ onSummarize }: TextSummarizerProps) => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSummarize = () => {
    if (inputText.trim().length < 50) return;
    
    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      const result = onSummarize(inputText);
      setSummary(result);
      setIsProcessing(false);
    }, 800);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="input-text" className="flex items-center gap-2 text-foreground">
          <FileText className="h-4 w-4 text-primary" />
          Paste your study text
        </Label>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste a paragraph or article you want to summarize (minimum 50 characters)..."
          className="min-h-[150px] rounded-xl border-2 border-border bg-card resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {inputText.length} characters · {inputText.split(/\s+/).filter(Boolean).length} words
        </p>
      </div>

      <Button
        onClick={handleSummarize}
        disabled={inputText.trim().length < 50 || isProcessing}
        variant="hero"
        className="w-full"
      >
        {isProcessing ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Summarizing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Summarize Text
          </>
        )}
      </Button>

      {summary && (
        <div className="animate-slide-up space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Summary
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
            <p className="text-sm leading-relaxed text-foreground">{summary}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Reduced to {summary.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      )}
    </div>
  );
};

export default TextSummarizer;
