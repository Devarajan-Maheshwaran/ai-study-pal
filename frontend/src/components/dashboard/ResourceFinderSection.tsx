import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, ExternalLink, Youtube, Globe, FileText, Loader2, Sparkles, Clock, User } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/hooks/use-toast';
import { extractKeyTerms } from '@/lib/nlpUtils';

interface ResourceItem {
  id: string;
  title: string;
  url: string;
  type: 'youtube' | 'article' | 'pdf';
  description: string;
  channel?: string;
  duration?: string;
  source?: string;
  pageCount?: number;
}



const ResourceFinderSection = () => {
  const { getCurrentSubject, currentSubjectId, addResource } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('youtube');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const currentSubject = getCurrentSubject();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: 'Enter a search term', variant: 'destructive' });
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const payload = { subject: currentSubject?.name || 'General', notes: searchQuery };
      // TODO: wire up PDF if needed
      const response = await api.getResources(payload);
      setResources(response.resources);
      toast({ title: 'Resources found', description: `Found ${response.resources.length} resources` });
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to fetch resources', variant: 'destructive' });
    }
    setIsSearching(false);
  };

  const handleQuickSearch = (topic: string) => {
    setSearchQuery(topic);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSearch();
    }, 100);
  };

  const totalResults = youtubeResults.length + pdfResults.length + articleResults.length;

  return (
    <Card className="border-2 border-border bg-card shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Resource Finder
        </CardTitle>
        <CardDescription>
          Search for YouTube videos, PDF notes, and articles related to your study topic.
          {currentSubject && <span className="ml-1 text-primary">Subject: {currentSubject.name}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search for study resources (e.g., machine learning, calculus, python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-11"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching} size="lg">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Quick search:</span>
          {['Machine Learning', 'Python', 'Calculus', 'Data Structures', 'Statistics'].map((topic) => (
            <Button
              key={topic}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSearch(topic.toLowerCase())}
            >
              {topic}
            </Button>
          ))}
        </div>

        {/* Info Banner */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            Curated from your subject + current notes, processed by local models before searching.
          </p>
        </div>

        {/* Results Tabs */}
        {hasSearched && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
                {youtubeResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">{youtubeResults.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF Notes
                {pdfResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">{pdfResults.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="article" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Articles
                {articleResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">{articleResults.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* YouTube Tab */}
            <TabsContent value="youtube" className="space-y-3">
              {youtubeResults.length > 0 ? (
                youtubeResults.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-xl border border-border bg-secondary/20 p-4 transition-all hover:border-destructive/50 hover:shadow-card"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
                      <Youtube className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-destructive transition-colors flex items-center gap-2">
                        {resource.title}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{resource.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {resource.channel && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {resource.channel}
                          </span>
                        )}
                        {resource.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {resource.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Youtube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No YouTube videos found for this search</p>
                </div>
              )}
            </TabsContent>

            {/* PDF Tab */}
            <TabsContent value="pdf" className="space-y-3">
              {pdfResults.length > 0 ? (
                pdfResults.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-xl border border-border bg-secondary/20 p-4 transition-all hover:border-warning/50 hover:shadow-card"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 shrink-0">
                      <FileText className="h-6 w-6 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-warning transition-colors flex items-center gap-2">
                        {resource.title}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{resource.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {resource.source && (
                          <span>Source: {resource.source}</span>
                        )}
                        {resource.pageCount && (
                          <span>{resource.pageCount} pages</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No PDF notes found for this search</p>
                </div>
              )}
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="article" className="space-y-3">
              {articleResults.length > 0 ? (
                articleResults.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-xl border border-border bg-secondary/20 p-4 transition-all hover:border-primary/50 hover:shadow-card"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        {resource.title}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{resource.description}</p>
                      {resource.source && (
                        <p className="text-xs text-muted-foreground mt-2">Source: {resource.source}</p>
                      )}
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No articles found for this search</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Search for resources to get started</p>
            <p className="text-sm mt-1">Find YouTube tutorials, PDF notes, and articles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceFinderSection;
