import { useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { useSummarize, useStudyTips } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Lightbulb, Loader2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function StudyTools() {
  return (
    <PageContainer title="AI Study Tools" description="Powerful tools to accelerate your learning process.">
      <Tabs defaultValue="summarizer" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="summarizer" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-3 font-medium">
            <FileText className="w-4 h-4 mr-2" /> 
            Text Summarizer
          </TabsTrigger>
          <TabsTrigger value="tips" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-3 font-medium">
            <Lightbulb className="w-4 h-4 mr-2" /> 
            Study Tip Generator
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summarizer">
          <SummarizerTool />
        </TabsContent>
        
        <TabsContent value="tips">
          <StudyTipsTool />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function SummarizerTool() {
  const [text, setText] = useState("");
  const summarize = useSummarize();
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!text) return;
    const res = await summarize.mutateAsync({ text, maxSentences: 3 });
    setResult(res.summary);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Input Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Paste article, chapter content, or long notes here..." 
            className="min-h-[300px] resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button 
            className="w-full mt-4" 
            onClick={handleSummarize}
            disabled={!text || summarize.isPending}
          >
            {summarize.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
            Summarize Text
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-accent/5 border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-accent-foreground">AI Summary</CardTitle>
          {result && (
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="leading-relaxed text-foreground/90">{result}</p>
            </motion.div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-accent/20 rounded-xl">
              Summary will appear here
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudyTipsTool() {
  const [subject, setSubject] = useState("");
  const tips = useStudyTips();
  const [results, setResults] = useState<string[]>([]);

  const handleGetTips = async () => {
    if (!subject) return;
    const res = await tips.mutateAsync({ subject });
    setResults(res.tips);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex gap-4">
        <input 
          className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter a difficult subject (e.g. Organic Chemistry)..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Button 
          size="lg" 
          onClick={handleGetTips}
          disabled={!subject || tips.isPending}
        >
          {tips.isPending ? <Loader2 className="animate-spin" /> : "Get Tips"}
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((tip, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-card rounded-xl border border-border shadow-sm flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
              {idx + 1}
            </div>
            <p className="text-foreground/90 pt-1">{tip}</p>
          </motion.div>
        ))}
        {results.length === 0 && !tips.isPending && (
          <div className="text-center py-12 text-muted-foreground">
            Enter a subject above to get personalized study strategies.
          </div>
        )}
      </div>
    </div>
  );
}
