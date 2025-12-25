import React, { useState } from "react";
import { BookOpen, Search, ExternalLink, Loader2, Library } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getResourceSuggestions, Resource } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const ResourcesPage: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [topN, setTopN] = useState(5);
  const [resources, setResources] = useState<Resource[]>([]);
  type YoutubeResult = {
    videoId: string;
    title: string;
    description: string;
    channelTitle: string;
    thumbnail: string;
    url: string;
  };
  const [youtubeResults, setYoutubeResults] = useState<YoutubeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingYoutube, setLoadingYoutube] = useState(false);
  const { toast } = useToast();

  const fetchYoutubeResults = async (query: string) => {
    setLoadingYoutube(true);
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const maxResults = 5;
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        setYoutubeResults(data.items.map((item: { id: { videoId: string }, snippet: { title: string, description: string, channelTitle: string, thumbnails: { medium: { url: string } } } }) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        })));
      } else {
        setYoutubeResults([]);
      }
    } catch (err) {
      setYoutubeResults([]);
    } finally {
      setLoadingYoutube(false);
    }
  };

  const handleGetResources = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject to find resources for.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setYoutubeResults([]);
    try {
      await fetchYoutubeResults(subject.trim());
      const response = await getResourceSuggestions({
        subject: subject.trim(),
        top_n: topN,
      });
      setResources(response.resources);
      if (response.resources.length === 0) {
        toast({
          title: "No Resources Found",
          description: "Try a different subject or broader topic.",
        });
      } else {
        toast({
          title: "Resources Found",
          description: `Found ${response.resources.length} resources for ${response.subject}.`,
        });
      }
    } catch (error) {
      console.error("Failed to get resources:", error);
      toast({
        title: "Search Failed",
        description: "Unable to find resources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGetResources();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground mt-1">
          Discover curated learning resources for any subject
        </p>
      </div>
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Resources
          </CardTitle>
          <CardDescription>
            Enter a subject to get personalized resource recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Machine Learning, World History, Calculus..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topN">Number of Results</Label>
              <Input
                id="topN"
                type="number"
                min={1}
                max={20}
                value={topN}
                onChange={(e) => setTopN(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>
          <Button onClick={handleGetResources} disabled={loading || !subject.trim()}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Get Resources
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      {/* YouTube Results Grid */}
      {youtubeResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">YouTube Videos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {youtubeResults.map((video, idx) => (
              <Card key={video.videoId} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-medium leading-tight">
                      {video.title}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">YouTube</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <img src={video.thumbnail} alt={video.title} className="rounded w-full h-40 object-cover" />
                  <p className="text-sm text-muted-foreground line-clamp-3">{video.description}</p>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Watch on YouTube
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <div className="text-xs text-muted-foreground">Channel: {video.channelTitle}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      {/* Resources Grid */}
      {resources.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Found {resources.length} Resources
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {resources.map((resource, index) => (
              <Card key={index} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-medium leading-tight">
                      {resource.title}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {resource.subject}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {resource.description}
                  </p>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Visit Resource
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      {/* Empty State */}
      {resources.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Library className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Resources Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a subject above and click "Get Resources" to discover curated
              learning materials.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

