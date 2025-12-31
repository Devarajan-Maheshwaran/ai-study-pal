import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

const RevisionPage = () => {
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: api.getRevisionSummary,
    onSuccess: (data: { summary: string; tips: string[] }) => {
      setSummary(data.summary);
      setTips(data.tips || []);
    }
  });

  const handleSummarize = () => {
    setLoading(true);
    mutation.mutate(
      { text, subject, max_sentences: 5 },
      {
        onSettled: () => setLoading(false)
      }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Revision</h1>
      <Card>
        <CardHeader>
          <CardTitle>Summarize Notes for Revision</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-3 py-2 border rounded"
            />
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your notes here..."
              className="w-full px-3 py-2 border rounded min-h-[120px]"
            />
            <Button onClick={handleSummarize} disabled={loading || !subject || !text}>
              {loading ? 'Summarizing...' : 'Summarize'}
            </Button>
          </div>
        </CardContent>
      </Card>
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">{summary}</div>
            {tips.length > 0 && (
              <ul className="list-disc ml-6 text-green-700">
                {tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RevisionPage;
