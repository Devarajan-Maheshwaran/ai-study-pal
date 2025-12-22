import { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { useResources } from "@/hooks/use-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Book, Video, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Resources() {
  const [query, setQuery] = useState("");
  const resources = useResources();
  const [items, setItems] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query) return;
    const res = await resources.mutateAsync({ subject: query, topN: 5 });
    setItems(res);
  };

  return (
    <PageContainer title="Learning Resources" description="Curated materials to supplement your studies.">
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            className="pl-12 h-14 rounded-2xl text-lg shadow-sm"
            placeholder="Search for a topic (e.g. Quantum Physics)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            className="absolute right-2 top-2 bottom-2 rounded-xl"
            onClick={handleSearch}
            disabled={resources.isPending}
          >
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <Book className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {item.description}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-bold bg-muted px-2 py-1 rounded text-muted-foreground uppercase">
                {item.subject}
              </span>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:text-primary/80 flex items-center text-sm font-medium"
              >
                Open <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
      
      {items.length === 0 && !resources.isPending && (
        <div className="text-center py-20 opacity-50">
          <Book className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl">Search for a topic to get started</p>
        </div>
      )}
    </PageContainer>
  );
}
