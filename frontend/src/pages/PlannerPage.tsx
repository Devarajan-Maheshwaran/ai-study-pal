import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Download, Loader2, AlertCircle } from 'lucide-react';
import PaperCard from '@/components/forge/PaperCard';
import EmptyState from '@/components/forge/EmptyState';
import { usePlannerPreview } from '@/hooks/useWorkspace';
import { useWorkspaceDetail } from '@/hooks/useWorkspace';
import { plannerApi } from '@/lib/api';

export default function PlannerPage() {
  const { id = '' } = useParams();
  const { data: ws } = useWorkspaceDetail(id);
  const preview = usePlannerPreview();

  const [hours, setHours] = useState(4);

  function handleGenerate() {
    preview.mutate({ wsId: id, hours, subject: ws?.subject ?? 'General' });
  }

  const schedule = preview.data?.schedule ?? [];
  const totalMins = schedule.reduce((s, r) => s + r.minutes, 0);
  const BASE_URL  = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

  return (
    <div className="space-y-4 animate-fade-up">
      <PaperCard>
        <p className="section-label mb-4">study planner</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[11px] font-mono text-ink-faint">Daily study hours</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 6, 8].map(h => (
                <button key={h} type="button" onClick={() => setHours(h)}
                  className={hours === h ? 'tag-solid' : 'tag cursor-pointer'}>{h}h</button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={preview.isPending} className="btn-ink text-xs">
            {preview.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</> : <><Calendar className="h-3.5 w-3.5" /> Generate schedule</>}
          </button>
        </div>
        {preview.isError && (
          <p className="text-xs text-status-red mt-3 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />{preview.error?.message}
          </p>
        )}
      </PaperCard>

      {preview.data?.message && (
        <PaperCard>
          <p className="text-xs text-ink-faint flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-status-amber" />{preview.data.message}
          </p>
        </PaperCard>
      )}

      {schedule.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label">generated plan</p>
              <p className="text-xs text-ink-faint mt-0.5">
                {schedule.length} topics · {totalMins} min total · weighted by difficulty
              </p>
            </div>
            <a
              href={`${BASE_URL}/api/planner`}
              download="study_schedule.csv"
              onClick={e => {
                e.preventDefault();
                fetch(`${BASE_URL}/api/planner`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ workspace_id: id, hours, subject: ws?.subject ?? 'General' }),
                }).then(r => r.blob()).then(blob => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'study_schedule.csv'; a.click();
                  URL.revokeObjectURL(url);
                });
              }}
              className="btn-outline text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Download CSV
            </a>
          </div>

          <PaperCard>
            <div className="divide-y divide-forge-rule">
              <div className="grid grid-cols-4 gap-2 pb-2 text-[10px] font-mono text-ink-ghost uppercase tracking-wide">
                <span>Day</span><span>Topic</span><span>Minutes</span><span>Difficulty</span>
              </div>
              {schedule.map((row) => (
                <div key={row.day} className="grid grid-cols-4 gap-2 py-2.5 text-xs">
                  <span className="font-mono text-ink-faint">Day {row.day}</span>
                  <span className="text-ink font-medium col-span-1">{row.topic}</span>
                  <span className="font-mono text-ink-faint">{row.minutes} min</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 rounded-full bg-forge-rule flex-1 overflow-hidden">
                      <div className="h-full bg-ink rounded-full" style={{ width: `${Math.round(row.difficulty * 100)}%` }} />
                    </div>
                    <span className="font-mono text-ink-ghost text-[10px]">{Math.round(row.difficulty * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </PaperCard>
        </>
      )}

      {!preview.data && !preview.isPending && (
        <EmptyState
          icon={<Calendar className="h-7 w-7" />}
          title="No schedule yet"
          description="Hit Generate to build a topic-weighted study plan from your workspace data. Download as CSV to use in any calendar app."
        />
      )}
    </div>
  );
}
