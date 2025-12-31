import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

const SettingsPage = () => {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || '');

  const handleSave = () => {
    localStorage.setItem('apiUrl', apiUrl);
    alert('Settings saved!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              placeholder="API Base URL"
              className="w-full px-3 py-2 border rounded"
            />
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
