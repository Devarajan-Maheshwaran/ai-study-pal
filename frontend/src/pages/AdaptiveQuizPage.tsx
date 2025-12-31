import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api, QuizResult } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'

const AdaptiveQuizPage = () => {
  const [userId, setUserId] = useState('default_user')
  const [subject, setSubject] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<QuizResult | null>(null)

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: api.getSubjects
  })

  const { data: questions, refetch: refetchQuiz } = useQuery({
    queryKey: ['quiz', userId, subject],
    queryFn: () => api.getAdaptiveQuiz(userId, subject),
    enabled: !!subject
  })

  const submitMutation = useMutation({
    mutationFn: api.submitQuiz,
    onSuccess: (data) => {
      setResults(data)
      setShowResults(true)
    }
  })

  const handleStartQuiz = () => {
    refetchQuiz()
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setResults(null)
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < (questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!questions) return

    const quizAnswers = questions.map(q => ({
      question_id: q.id,
      correct: answers[q.id] === q.answer
    }))

    submitMutation.mutate({
      user_id: userId,
      subject,
      answers: quizAnswers
    })
  }

  const currentQ = questions?.[currentQuestion]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Adaptive Quiz</h1>

      {!showResults && !questions && (
        <Card>
          <CardHeader>
            <CardTitle>Start Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Subject</option>
                  {subjects?.subjects.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleStartQuiz} disabled={!subject}>
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showResults && currentQ && (
        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{currentQ.question}</h3>
              <div className="space-y-2">
                {currentQ.options.map((option, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={`q-${currentQ.id}`}
                      value={option}
                      checked={answers[currentQ.id] === option}
                      onChange={() => handleAnswer(currentQ.id, option)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Difficulty: {currentQ.difficulty}</span>
                <Button onClick={handleNext} disabled={!answers[currentQ.id]}>
                  {currentQuestion < (questions.length - 1) ? 'Next' : 'Submit'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && results && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {results.correct} / {results.total}
                </p>
                <p className="text-lg text-gray-600">
                  Accuracy: {results.accuracy}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Feedback</h4>
                <p>{results.feedback}</p>
              </div>
              <Button onClick={() => setShowResults(false)}>
                Take Another Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdaptiveQuizPage
