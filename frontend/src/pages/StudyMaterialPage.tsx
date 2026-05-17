import { Upload, FileText, Youtube, FolderOpen } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import EmptyState from '@/components/forge/EmptyState';

export default function StudyMaterialPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Upload row */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: FileText, label: 'Paste notes',   sub: 'Plain text → summarize + chunk' },
          { icon: Upload,   label: 'Upload PDF',    sub: 'PyMuPDF extraction pipeline' },
          { icon: Youtube,  label: 'YouTube URL',   sub: 'Transcript loader' },
        ].map(({ icon: Icon, label, sub }) => (
          <button
            key={label}
            type="button"
            disabled
            title="Wired in Phase 2 — document ingestion pipeline"
            className="card-paper p-5 flex flex-col items-center gap-2 text-center opacity-50 cursor-not-allowed"
          >
            <Icon className="h-6 w-6 text-ink-faint" />
            <span className="text-sm font-medium text-ink">{label}</span>
            <span className="text-xs text-ink-faint">{sub}</span>
          </button>
        ))}
      </div>

      {/* Source list */}
      <PaperCard>
        <p className="section-label mb-4">uploaded sources</p>
        <EmptyState
          icon={<FolderOpen className="h-7 w-7" />}
          title="No sources yet"
          description="Upload a PDF, paste notes, or add a YouTube link. The ingestion pipeline will extract text, chunk it, generate embeddings, and auto-create a topic map and first quiz set."
        />
        <p className="mt-4 text-[11px] font-mono text-ink-ghost">
          ✦ Document ingestion pipeline wired in Phase 2 (ChromaDB + Flask backend)
        </p>
      </PaperCard>
    </div>
  );
}
