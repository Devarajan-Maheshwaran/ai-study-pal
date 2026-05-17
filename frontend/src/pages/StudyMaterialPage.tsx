import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, FileText, Youtube, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import EmptyState from '@/components/forge/EmptyState';
import { useWorkspaceDetail, useIngestDocument } from '@/hooks/useWorkspace';
import type { IngestResult } from '@/lib/api';

type SourceType = 'text' | 'pdf' | 'youtube';

export default function StudyMaterialPage() {
  const { id = '' } = useParams();
  const { data: ws, isLoading } = useWorkspaceDetail(id);
  const ingest = useIngestDocument(id);

  const [source, setSource]   = useState<SourceType>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput,  setUrlInput]  = useState('');
  const [title,     setTitle]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [lastResult, setLastResult] = useState<IngestResult | null>(null);

  function handleIngest(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.append('source', source);
    form.append('title', title || `Document ${new Date().toLocaleDateString()}`);
    if (source === 'text')    form.append('content', textInput);
    if (source === 'youtube') form.append('url', urlInput);
    if (source === 'pdf' && fileRef.current?.files?.[0]) {
      form.append('file', fileRef.current.files[0]);
    }
    ingest.mutate(form, {
      onSuccess: (res) => {
        setLastResult(res);
        setTextInput('');
        setUrlInput('');
        setTitle('');
        if (fileRef.current) fileRef.current.value = '';
      },
    });
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Source selector */}
      <PaperCard>
        <p className="section-label mb-4">add study material</p>
        <div className="flex gap-2 mb-4">
          {(['text', 'pdf', 'youtube'] as SourceType[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(s)}
              className={source === s ? 'tag-solid' : 'tag cursor-pointer hover:bg-paper-dark'}
            >
              {s === 'text' ? <FileText className="h-3 w-3" /> : s === 'pdf' ? <Upload className="h-3 w-3" /> : <Youtube className="h-3 w-3" />}
              {s === 'youtube' ? 'YouTube' : s.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleIngest} className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Document title (optional)"
            className="w-full rounded-md border border-forge-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-ghost outline-none focus:ring-2 focus:ring-ink/15"
          />

          {source === 'text' && (
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Paste your notes here (min 20 words)…"
              rows={6}
              className="w-full rounded-md border border-forge-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-ghost outline-none focus:ring-2 focus:ring-ink/15 resize-y"
              required
            />
          )}
          {source === 'pdf' && (
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              required
              className="block text-xs text-ink-faint file:mr-3 file:rounded-full file:border file:border-forge-rule file:bg-paper-subtle file:px-3 file:py-1 file:text-xs file:font-mono"
            />
          )}
          {source === 'youtube' && (
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-md border border-forge-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-ghost outline-none focus:ring-2 focus:ring-ink/15"
              required
            />
          )}

          <button type="submit" disabled={ingest.isPending} className="btn-ink text-xs">
            {ingest.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Ingesting…</> : 'Ingest document'}
          </button>
          {ingest.isError && (
            <p className="text-xs text-status-red flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />{ingest.error?.message}
            </p>
          )}
        </form>
      </PaperCard>

      {/* Last ingest result */}
      {lastResult && (
        <PaperCard className="animate-scale-in relative">
          <button type="button" onClick={() => setLastResult(null)} className="absolute top-3 right-3 text-ink-ghost hover:text-ink">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-status-green" />
            <p className="text-sm font-medium text-ink">Ingested: {lastResult.title}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 text-xs text-ink-faint font-mono mb-3">
            <span>{lastResult.word_count} words</span>
            <span>{lastResult.chunk_count} chunks</span>
            <span>{lastResult.topics.length} topics detected</span>
          </div>
          {lastResult.summary && (
            <div className="mt-2">
              <p className="section-label mb-1">auto-summary</p>
              <p className="text-xs text-ink-faint leading-relaxed">{lastResult.summary}</p>
            </div>
          )}
          {lastResult.tips.length > 0 && (
            <ul className="mt-2 space-y-1">
              {lastResult.tips.map((t, i) => (
                <li key={i} className="text-xs text-ink-faint">• {t}</li>
              ))}
            </ul>
          )}
        </PaperCard>
      )}

      {/* Document list */}
      <PaperCard>
        <p className="section-label mb-4">uploaded sources</p>
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-ink-faint"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</div>
        ) : ws && ws.documents.length > 0 ? (
          <div className="divide-y divide-forge-rule">
            {ws.documents.map(d => (
              <div key={d.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{d.title}</p>
                  <p className="text-[11px] font-mono text-ink-ghost">{d.source_type} · {d.word_count} words · {new Date(d.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title="No sources yet"
            description="Upload a PDF, paste notes, or add a YouTube link. The pipeline extracts text, chunks it, embeds it into ChromaDB, and builds a topic map."
          />
        )}
      </PaperCard>
    </div>
  );
}
