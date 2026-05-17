import { Outlet, useParams } from 'react-router-dom';
import PageShell from '@/components/forge/PageShell';
import StatusBar from '@/components/forge/StatusBar';
import WorkspaceTab from '@/components/forge/WorkspaceTab';

// Phase 1: static demo metadata.
// Phase 2+: fetch from GET /api/workspaces/:id
const DEMO_META: Record<string, { name: string; subject: string; examDate: string }> = {
  'gate-2027-cse': {
    name: 'GATE 2027 — CSE',
    subject: 'Computer Science & Engineering',
    examDate: 'Feb 2027',
  },
  'thermodynamics-demo': {
    name: 'Engineering Thermodynamics',
    subject: 'Mechanical / Core Engineering',
    examDate: 'Demo workspace',
  },
};

export default function WorkspaceLayout() {
  const { id = '' } = useParams();
  const meta = DEMO_META[id] ?? {
    name: id,
    subject: 'Custom workspace',
    examDate: '—',
  };

  return (
    <PageShell className="">
      <StatusBar
        workspaceName={meta.name}
        subject={meta.subject}
        examDate={meta.examDate}
      />
      <WorkspaceTab />
      <div className="page-wrap py-6">
        <Outlet />
      </div>
    </PageShell>
  );
}
