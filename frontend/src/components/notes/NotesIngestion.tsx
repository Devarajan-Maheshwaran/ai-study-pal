import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Link, Youtube, Upload, Loader2 } from 'lucide-react';
import { parsePDF } from '@/lib/pdfUtils';
import { fetchYouTubeInfo, youtubeToStudyText, extractYouTubeId } from '@/lib/pdfUtils';
import { toast } from 'sonner';

interface NotesIngestionProps {
  onNotesSubmit: (content: string, source: 'text' | 'pdf' | 'url' | 'youtube', sourceUrl?: string) => void;
  disabled?: boolean;
}

const NotesIngestion = ({ onNotesSubmit, disabled }: NotesIngestionProps) => {
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = () => {
    if (!textContent.trim()) {
      toast.error('Please enter some text');
      return;
    }
    onNotesSubmit(textContent, 'text');
    setTextContent('');
    toast.success('Notes added successfully!');
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsLoading(true);
    try {
      const result = await parsePDF(file);
      onNotesSubmit(result.text, 'pdf');
      toast.success(`PDF parsed: ${result.pageCount} pages`);
    } catch (error) {
      toast.error('Failed to parse PDF');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    // For demo, we'll create sample content since CORS prevents direct fetching
    const sampleContent = `Content from: ${urlInput}\n\nThis is extracted content from the provided URL. In a production environment, this would contain the actual webpage text.`;
    onNotesSubmit(sampleContent, 'url', urlInput);
    setUrlInput('');
    toast.success('URL content added');
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    setIsLoading(true);
    try {
      const info = await fetchYouTubeInfo(youtubeUrl);
      const content = youtubeToStudyText(info);
      onNotesSubmit(content, 'youtube', youtubeUrl);
      toast.success(`YouTube video added: ${info.title}`);
      setYoutubeUrl('');
    } catch (error) {
      toast.error('Failed to fetch YouTube info');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text" className="gap-2"><FileText className="h-4 w-4" />Text</TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2"><Upload className="h-4 w-4" />PDF</TabsTrigger>
          <TabsTrigger value="url" className="gap-2"><Link className="h-4 w-4" />URL</TabsTrigger>
          <TabsTrigger value="youtube" className="gap-2"><Youtube className="h-4 w-4" />YouTube</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Textarea
            placeholder="Paste your study notes here..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="min-h-[200px]"
            disabled={disabled}
          />
          <Button onClick={handleTextSubmit} disabled={disabled || !textContent.trim()}>
            Add Notes
          </Button>
        </TabsContent>

        <TabsContent value="pdf" className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <Label htmlFor="pdf-upload" className="cursor-pointer">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
              <p className="text-sm text-muted-foreground mt-1">PDF files only</p>
            </Label>
            <Input
              id="pdf-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handlePDFUpload}
              disabled={disabled || isLoading}
            />
          </div>
          {isLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Parsing PDF...</div>}
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Input
            placeholder="https://example.com/article"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={disabled}
          />
          <Button onClick={handleUrlSubmit} disabled={disabled || !urlInput.trim()}>
            Fetch Content
          </Button>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-4">
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            disabled={disabled || isLoading}
          />
          <Button onClick={handleYoutubeSubmit} disabled={disabled || !youtubeUrl.trim() || isLoading}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading...</> : 'Add Video'}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesIngestion;
