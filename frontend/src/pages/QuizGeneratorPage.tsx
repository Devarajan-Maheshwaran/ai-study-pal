import React, { useState } from 'react';

const QuizGeneratorPage: React.FC = () => {
  const [inputType, setInputType] = useState<'text' | 'file' | 'link'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [mcqs, setMcqs] = useState<Array<{ question: string; options: string[]; answer: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMcqs([]);
    try {
      const formData = new FormData();
      formData.append('input_type', inputType);
      if (inputType === 'text') formData.append('text', text);
      if (inputType === 'file' && file) formData.append('file', file);
      if (inputType === 'link') formData.append('link', link);
      // TODO: Update endpoint to handle these inputs
      const res = await fetch('http://localhost:5000/api/generate-mcqs', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMcqs(data.mcqs || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to generate quiz.');
      } else {
        setError('Failed to generate quiz.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">Generate Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <label>
            <input type="radio" checked={inputType === 'text'} onChange={() => setInputType('text')} /> Text
          </label>
          <label>
            <input type="radio" checked={inputType === 'file'} onChange={() => setInputType('file')} /> File (PDF/DOCX)
          </label>
          <label>
            <input type="radio" checked={inputType === 'link'} onChange={() => setInputType('link')} /> Link
          </label>
        </div>
        {inputType === 'text' && (
          <textarea
            className="w-full border rounded p-2"
            rows={6}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your study notes or content here..."
          />
        )}
        {inputType === 'file' && (
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        )}
        {inputType === 'link' && (
          <input
            type="url"
            className="w-full border rounded p-2"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="Paste a webpage or Google Doc link..."
          />
        )}
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>
      {error && <div className="text-red-600">{error}</div>}
      {mcqs.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Generated MCQs</h2>
          {mcqs.map((mcq, idx) => (
            <div key={idx} className="border rounded p-4">
              <div className="font-medium mb-2">Q{idx + 1}: {mcq.question}</div>
              <ul className="list-disc pl-6">
                {mcq.options.map((opt: string, i: number) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizGeneratorPage;
