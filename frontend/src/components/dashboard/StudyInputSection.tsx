import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Youtube, Link2, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { parsePDF, fetchYouTubeInfo, youtubeToStudyText, extractYouTubeId } from '@/lib/pdfUtils';
import { useToast } from '@/hooks/use-toast';

type InputSource = 'text' | 'pdf' | 'youtube' | null;

interface StudyInputSectionProps {
  studyContent: string;
  onContentChange: (content: string, source?: InputSource, details?: string) => void;
}

type InputMode = 'text' | 'pdf' | 'youtube';

const StudyInputSection = ({ studyContent, onContentChange }: StudyInputSectionProps) => {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadStatus, setLoadStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [loadedDetails, setLoadedDetails] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleModeChange = (mode: InputMode) => {
    if (mode !== inputMode) {
      // Clear content when switching modes to enforce mutual exclusivity
      onContentChange('', null, '');
      setYoutubeUrl('');
      setLoadStatus({ type: 'idle' });
      setLoadedDetails('');
    }
    setInputMode(mode);
  };

  const handleTextChange = (text: string) => {
    onContentChange(text, 'text', 'Direct input');
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({ title: 'Invalid file', description: 'Please upload a PDF file', variant: 'destructive' });
      setLoadStatus({ type: 'error', message: 'Invalid file type. Please upload a PDF.' });
      return;
    }

    setIsLoading(true);
    setLoadStatus({ type: 'idle' });
    try {
      const parsed = await parsePDF(file);
      const details = `${parsed.pageCount} pages · ${file.name}`;
      setLoadedDetails(details);
      onContentChange(parsed.text, 'pdf', details);
      setLoadStatus({ type: 'success', message: `Extracted ${parsed.pageCount} pages from ${parsed.title}` });
      toast({ title: 'PDF loaded', description: `Extracted ${parsed.pageCount} pages` });
    } catch (error) {
      setLoadStatus({ type: 'error', message: 'Failed to parse PDF. Try another file or paste notes instead.' });
      toast({ title: 'PDF Error', description: 'Failed to parse PDF file', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleYoutubeLoad = async () => {
    if (!youtubeUrl.trim()) return;

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      toast({ title: 'Invalid URL', description: 'Please enter a valid YouTube URL', variant: 'destructive' });
      setLoadStatus({ type: 'error', message: 'Invalid YouTube URL. Please check and try again.' });
      return;
    }

    setIsLoading(true);
    setLoadStatus({ type: 'idle' });
    try {
      const info = await fetchYouTubeInfo(youtubeUrl);
      const studyText = youtubeToStudyText(info);
      const details = info.title;
      setLoadedDetails(details);
      onContentChange(studyText, 'youtube', details);
      setLoadStatus({ type: 'success', message: `Loaded: ${info.title}` });
      toast({ title: 'YouTube loaded', description: `Loaded: ${info.title}` });
    } catch (error) {
      setLoadStatus({ type: 'error', message: 'Failed to load video. Try a different URL.' });
      toast({ title: 'YouTube Error', description: 'Failed to load YouTube video info', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    onContentChange('', null, '');
    setYoutubeUrl('');
    setLoadStatus({ type: 'idle' });
    setLoadedDetails('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const inputModes = [
    { id: 'text' as const, label: 'Paste Notes', icon: FileText, description: 'Direct text input' },
    { id: 'pdf' as const, label: 'Upload PDF', icon: Upload, description: 'PDF documents' },
    { id: 'youtube' as const, label: 'YouTube Link', icon: Youtube, description: 'Video transcripts' },
  ];

  return (
    <Card className="border-2 border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Study Material Input
        </CardTitle>
        <CardDescription>
          Choose one input method below. Only one source can be active at a time — selecting a new method clears previous content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Mode Selector - Radio-style exclusive */}
        <div className="grid grid-cols-3 gap-3">
          {inputModes.map((mode) => {
            const isActive = inputMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                disabled={isLoading}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-primary" />
                )}
                <mode.icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {mode.label}
                </span>
                <span className="text-xs text-muted-foreground">{mode.description}</span>
              </button>
            );
          })}
        </div>

        {/* Active Input Section */}
        <div className="min-h-[200px] rounded-xl border-2 border-dashed border-border p-4">
          {/* Text Input */}
          {inputMode === 'text' && (
            <div className="space-y-2 h-full">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Your Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Paste your study notes here... The more detailed, the better the AI can help you summarize and generate questions.

Tip: Include definitions, key concepts, formulas, and important points for best results."
                className="min-h-[180px] resize-y"
                value={studyContent}
                onChange={(e) => handleTextChange(e.target.value)}
              />
            </div>
          )}

          {/* PDF Upload */}
          {inputMode === 'pdf' && (
            <div className="h-full flex flex-col">
              <div 
                className="flex-1 flex flex-col items-center justify-center cursor-pointer rounded-lg hover:bg-secondary/30 transition-colors min-h-[160px]"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-muted-foreground">Parsing PDF with local processor...</p>
                  </div>
                ) : loadStatus.type === 'success' ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="h-12 w-12 text-success" />
                    <p className="text-success font-medium">PDF loaded successfully!</p>
                    <p className="text-sm text-muted-foreground">{loadedDetails}</p>
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Upload different file
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Click to upload a PDF file</p>
                    <p className="text-xs text-muted-foreground">Supports PDF documents up to 50MB</p>
                    <p className="text-xs text-muted-foreground">
                      Backend: PyPDF2/pdfplumber extracts text, cleans sections
                    </p>
                  </div>
                )}
              </div>
              
              {loadStatus.type === 'error' && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{loadStatus.message}</p>
                </div>
              )}
            </div>
          )}

          {/* YouTube Input */}
          {inputMode === 'youtube' && (
            <div className="space-y-4 h-full">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleYoutubeLoad()}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <Button onClick={handleYoutubeLoad} disabled={isLoading || !youtubeUrl.trim()} size="lg">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                  Load
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Backend: Fetches transcript via API, removes timestamps, merges into continuous text
              </p>

              {loadStatus.type === 'success' && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <p className="text-sm font-medium text-success">Video transcript loaded</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{loadedDetails}</p>
                  <p className="text-sm text-foreground mt-2 line-clamp-3">{studyContent.slice(0, 200)}...</p>
                </div>
              )}
              
              {loadStatus.type === 'error' && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">{loadStatus.message}</p>
                  </div>
                </div>
              )}

              {loadStatus.type === 'idle' && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[100px]">
                  <Youtube className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-sm">Enter a YouTube URL to load video content</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Status Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            {studyContent ? (
              <>
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  {inputMode.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {studyContent.split(/\s+/).filter(Boolean).length} words loaded
                </span>
                {loadedDetails && (
                  <span className="text-sm text-muted-foreground">· {loadedDetails}</span>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No content loaded yet</span>
            )}
          </div>
          {studyContent && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyInputSection;
