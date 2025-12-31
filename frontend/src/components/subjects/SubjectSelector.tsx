import { useState, useEffect } from 'react';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, BookOpen } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface SubjectSelectorProps {
  currentSubjectId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

const SubjectSelector = ({ currentSubjectId, onSelect, onAdd, onDelete }: SubjectSelectorProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await api.getSubjects();
        setSubjects(res.subjects.map((name: string, idx: number) => ({ id: name, name, color: '#'+((1<<24)*Math.random()|0).toString(16) })));
      } catch (e) {
        /* istanbul ignore next */ void e;
      }
    }
    fetchSubjects();
  }, []);

  const handleAdd = () => {
    if (newSubject.trim()) {
      onAdd(newSubject.trim());
      setNewSubject('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
              currentSubjectId === subject.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            onClick={() => onSelect(subject.id)}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: subject.color }}
            />
            {subject.name}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(subject.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Subject name"
              className="h-9 w-40"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button size="sm" onClick={handleAdd}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Subject
          </Button>
        )}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No subjects yet. Add your first subject to get started!</p>
        </div>
      )}
    </div>
  );
};

export default SubjectSelector;
