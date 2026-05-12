import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Youtube, Link, AlignLeft, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { parseText, parsePDF, parseYouTube, parseURL, ParseResult } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type InputSource = 'text' | 'pdf' | 'youtube' | null;

interface Props {
  studyContent: string;
  onContentChange: (content: string, source?: InputSource, details?: string) => void;
}

const StudyInputSection = ({ studyContent, onContentChange }: Props) => {
  const [activeInput, setActiveInput] = useState<'text' | 'pdf' | 'youtube' | 'url'>('text');
  const [rawText, setRawText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleText = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    try {
      const result: ParseResult = await parseText(rawText);
      onContentChange(result.text, 'text', `${result.word_count} words`);
      setLoadedSource(`Text — ${result.word_count} words`);
      toast({ title: 'Content loaded', description: `${result.word_count} words extracted.` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const result: ParseResult = await parsePDF(file);
      onContentChange(result.text, 'pdf', file.name);
      setLoadedSource(`PDF: ${file.name} — ${result.word_count} words`);
      toast({ title: 'PDF loaded', description: `${result.word_count} words extracted from ${file.name}.` });
    } catch (e: any) {
      toast({ title: 'PDF Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleYouTube = async () => {
    if (!youtubeUrl.trim()) return;
    setIsLoading(true);
    try {
      const result: ParseResult = await parseYouTube(youtubeUrl);
      onContentChange(result.text, 'youtube', youtubeUrl);
      setLoadedSource(`YouTube — ${result.word_count} words`);
      toast({ title: 'Transcript loaded', description: `${result.word_count} words from YouTube.` });
    } catch (e: any) {
      toast({ title: 'YouTube Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleURL = async () => {
    if (!urlInput.trim()) return;
    setIsLoading(true);
    try {
      const result: ParseResult = await parseURL(urlInput);
      onContentChange(result.text, 'pdf', urlInput);
      setLoadedSource(`URL — ${result.word_count} words`);
      toast({ title: 'URL loaded', description: `${result.word_count} words extracted.` });
    } catch (e: any) {
      toast({ title: 'URL Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const clearContent = () => {
    onContentChange('', null, '');
    setRawText('');
    setYoutubeUrl('');
    setUrlInput('');
    setLoadedSource(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Load Study Material</CardTitle>
            <CardDescription>Paste text, upload a PDF, or link a YouTube video</CardDescription>
          </div>
          {loadedSource && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-green-600 border-green-200 bg-green-50">
                <CheckCircle className="h-3 w-3" />
                {loadedSource}
              </Badge>
              <Button size="sm" variant="ghost" onClick={clearContent} className="text-muted-foreground">Clear</Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeInput} onValueChange={(v) => setActiveInput(v as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="text" className="gap-1.5"><AlignLeft className="h-3.5 w-3.5" />Text</TabsTrigger>
            <TabsTrigger value="pdf" className="gap-1.5"><FileText className="h-3.5 w-3.5" />PDF</TabsTrigger>
            <TabsTrigger value="youtube" className="gap-1.5"><Youtube className="h-3.5 w-3.5" />YouTube</TabsTrigger>
            <TabsTrigger value="url" className="gap-1.5"><Link className="h-3.5 w-3.5" />URL</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <div className="space-y-3">
              <Textarea
                placeholder="Paste your notes, textbook content, lecture notes..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="min-h-[180px] resize-y font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{rawText.split(/\s+/).filter(Boolean).length} words</span>
                <Button onClick={handleText} disabled={isLoading || !rawText.trim()} size="sm">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Load Text
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pdf">
            <div className="space-y-3">
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-10 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload PDF</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePDF} />
            </div>
          </TabsContent>

          <TabsContent value="youtube">
            <div className="space-y-3">
              <Label className="text-sm">YouTube URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleYouTube()}
                />
                <Button onClick={handleYouTube} disabled={isLoading || !youtubeUrl.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Extract'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Extracts the full video transcript (captions must be available).</p>
            </div>
          </TabsContent>

          <TabsContent value="url">
            <div className="space-y-3">
              <Label className="text-sm">Web Page URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleURL()}
                />
                <Button onClick={handleURL} disabled={isLoading || !urlInput.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Extract'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Extracts readable text from any public webpage.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudyInputSection;
