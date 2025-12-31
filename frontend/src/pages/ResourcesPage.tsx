import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'

const ResourcesPage = () => {
  const [subject, setSubject] = useState('General')
  const [limit, setLimit] = useState(10)

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: api.getSubjects
  })

  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ['resources', subject, limit],
    queryFn: () => api.getResources(subject, limit)
  })

  const resources = resourcesData?.resources || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Study Resources</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Subjects</option>
                {subjects?.subjects.map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading resources...</p>
        ) : resources.length > 0 ? (
          resources.map((resource, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Type: {resource.type}</p>
                <Button
                  onClick={() => window.open(resource.url, '_blank')}
                  className="w-full"
                >
                  View Resource
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No resources found for this subject.</p>
        )}
      </div>
    </div>
  )
}

export default ResourcesPage
