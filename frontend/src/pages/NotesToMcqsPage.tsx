import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, MCQ } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

const NotesToMcqsPage = () => {
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: api.getSubjects
  });

  const mutation = useMutation({
    mutationFn: api.notesToMcqs,
    onSuccess: (data: { questions: MCQ[] }) => setQuestions(data.questions || [])
  });

  const handleGenerate = () => {
    setLoading(true);
    mutation.mutate(
      {
        source_type: 'notes',
        subject,
        notes,
        max_questions: 5
      },
      {
        onSettled: () => setLoading(false)
      }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Notes → MCQs</h1>
      <Card>
        <CardHeader>
          <CardTitle>Generate MCQs from Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="">Select Subject</option>
              {subjects?.subjects?.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Paste your notes here..."
              className="w-full px-3 py-2 border rounded min-h-[120px]"
            />
            <Button onClick={handleGenerate} disabled={loading || !subject || !notes}>
              {loading ? 'Generating...' : 'Generate MCQs'}
            </Button>
          </div>
        </CardContent>
      </Card>
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated MCQs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {questions.map(q => (
                <li key={q.id}>
                  <div className="font-medium mb-2">{q.question}</div>
                  <ul className="list-disc ml-6">
                    {q.options.map(opt => (
                      <li key={opt}>{opt}</li>
                    ))}
                  </ul>
                  <div className="text-green-700 mt-1">Answer: {q.answer}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotesToMcqsPage;
