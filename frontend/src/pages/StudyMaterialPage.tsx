import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import {
  UploadIcon, BookIcon, CloseIcon, CheckIcon,
} from '@/components/icons';
import { useWorkspaceDetail, useIngestDocument } from '@/hooks/useWorkspace';
import type { IngestResult } from '@/lib/api';

type SourceType = 'text' | 'pdf' | 'youtube';

const sourceOptions: { key: SourceType; label: string }[] = [
  { key: 'text',    label: 'Plain Text' },
  { key: 'pdf',     label: 'PDF Upload' },
  { key: 'youtube', label: 'YouTube URL' },
];

export default function StudyMaterialPage() {
  const { id = '' } = useParams();
  const { data: ws, isLoading } = useWorkspaceDetail(id);
  const ingest = useIngestDocument(id);

  const [source,    setSource]    = useState<SourceType>('text');
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
    <div
      className="min-h-screen px-5 py-8"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="label-section mb-1">Workspace</p>
          <h1 className="font-syne text-2xl font-bold text-[var(--text-primary)]">Study Material</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Upload documents, paste notes, or add a YouTube video. All content is embedded into ChromaDB for AI search.
          </p>
        </motion.div>

        {/* Upload card */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <SpotlightCard className="p-6">
            <p className="font-syne font-semibold text-[var(--text-primary)] mb-4">Add Study Material</p>

            {/* Source selector */}
            <div className="flex gap-2 mb-5">
              {sourceOptions.map(o => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setSource(o.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    source === o.key
                      ? 'bg-[var(--text-primary)] text-[var(--bg)]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleIngest} className="space-y-3">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Document title (optional)"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />

              {source === 'text' && (
                <textarea
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Paste your notes here (minimum 20 words)..."
                  rows={6}
                  required
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              )}
              {source === 'pdf' && (
                <div
                  className="rounded-xl px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer"
                  style={{ border: '1.5px dashed var(--border-color)', background: 'var(--bg)' }}
                  onClick={() => fileRef.current?.click()}
                >
                  <UploadIcon size={22} className="text-[var(--text-faint)]" />
                  <p className="text-sm text-[var(--text-muted)]">
                    {fileRef.current?.files?.[0]?.name ?? 'Click to select a PDF'}
                  </p>
                  <input ref={fileRef} type="file" accept=".pdf" required className="hidden" />
                </div>
              )}
              {source === 'youtube' && (
                <input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              )}

              <button
                type="submit"
                disabled={ingest.isPending}
                className="btn-primary w-full justify-center"
              >
                {ingest.isPending ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                  </svg>
                ) : (
                  <UploadIcon size={16} />
                )}
                {ingest.isPending ? 'Ingesting...' : 'Ingest Document'}
              </button>

              {ingest.isError && (
                <p className="text-xs" style={{ color: '#dc2626' }}>
                  {ingest.error?.message}
                </p>
              )}
            </form>
          </SpotlightCard>
        </motion.div>

        {/* Last ingest result */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <button
                onClick={() => setLastResult(null)}
                className="absolute top-4 right-4 text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"
              >
                <CloseIcon size={16} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <CheckIcon size={16} style={{ color: '#16a34a' }} />
                <p className="font-syne font-semibold text-[var(--text-primary)] text-sm">
                  Ingested: {lastResult.title}
                </p>
              </div>
              <div className="flex gap-4 mb-3">
                {[
                  { label: 'Words',  value: lastResult.word_count.toLocaleString() },
                  { label: 'Chunks', value: lastResult.chunk_count },
                  { label: 'Topics', value: lastResult.topics.length },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="label-section">{stat.label}</p>
                    <p className="font-syne font-bold text-[var(--text-primary)]">{stat.value}</p>
                  </div>
                ))}
              </div>
              {lastResult.summary && (
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {lastResult.summary}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document list */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <p className="font-syne font-semibold text-[var(--text-primary)] mb-4">Uploaded Sources</p>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="skeleton h-12 w-full rounded-xl" />)}
              </div>
            ) : ws && ws.documents.length > 0 ? (
              <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {ws.documents.map(d => (
                  <div key={d.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}
                      >
                        <BookIcon size={14} className="text-[var(--text-muted)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{d.title}</p>
                        <p className="text-xs text-[var(--text-faint)] font-mono">
                          {d.source_type} · {d.word_count} words · {new Date(d.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <UploadIcon size={28} className="text-[var(--text-faint)]" />
                <p className="text-sm text-[var(--text-muted)] max-w-xs">
                  No sources yet. Upload a PDF, paste notes, or add a YouTube link above.
                </p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
