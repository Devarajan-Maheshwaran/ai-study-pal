import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'

const DashboardPage = () => {
  const [userId, setUserId] = useState('default_user')

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', userId],
    queryFn: () => api.getDashboard(userId),
    enabled: !!userId
  })

  const stats = [
    { title: 'Topics Studied', value: dashboard?.topics_studied || 0 },
    { title: 'Total Attempts', value: dashboard?.total_attempts || 0 },
    { title: 'Correct Answers', value: dashboard?.correct_answers || 0 },
    { title: 'Avg Accuracy', value: `${dashboard?.avg_accuracy || 0}%` }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardTitle>{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance by Subject</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {dashboard?.per_subject?.map((subject) => (
                <div key={subject.subject} className="flex justify-between items-center">
                  <span className="font-medium">{subject.subject}</span>
                  <div className="flex items-center space-x-4">
                    <span>{subject.attempts} attempts</span>
                    <span>{subject.correct} correct</span>
                    <span className="text-green-600">{subject.avg_accuracy}%</span>
                  </div>
                </div>
              )) || <p>No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
