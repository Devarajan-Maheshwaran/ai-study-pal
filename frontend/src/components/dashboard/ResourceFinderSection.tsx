import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Loader2, ExternalLink, Search } from 'lucide-react';
import { getResources, Resource } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const TYPE_COLORS: Record<string, string> = {
  course: 'bg-blue-100 text-blue-700',
  video: 'bg-red-100 text-red-700',
  article: 'bg-green-100 text-green-700',
  practice: 'bg-purple-100 text-purple-700',
  tool: 'bg-orange-100 text-orange-700',
};

const ResourceFinderSection = () => {
  const [subject, setSubject] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFind = async () => {
    if (!subject.trim()) return;
    setIsLoading(true);
    try {
      const data = await getResources(subject.trim());
      setResources(data.resources);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Resource Finder
        </CardTitle>
        <CardDescription>Curated learning resources matched to your subject</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-sm mb-1 block">Subject</Label>
            <Input
              placeholder="e.g. Computer Science, Physics, Math..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFind()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleFind} disabled={isLoading || !subject.trim()} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Find
            </Button>
          </div>
        </div>

        {resources.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {resources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 rounded-lg border border-border p-4 hover:border-primary/50 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">{r.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                <Badge className={`text-xs w-fit ${TYPE_COLORS[r.type] || 'bg-gray-100 text-gray-600'}`}>
                  {r.type}
                </Badge>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceFinderSection;
