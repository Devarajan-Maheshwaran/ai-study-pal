// Resource suggestion utilities

import { Resource } from '@/types/study';

interface ResourceTemplate {
  title: string;
  url: string;
  type: 'web' | 'youtube' | 'article';
  description: string;
}

const SUBJECT_RESOURCES: Record<string, ResourceTemplate[]> = {
  'aiml fundamentals': [
    { title: 'Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'web', description: 'Free Google ML course' },
    { title: 'ML for Beginners', url: 'https://www.youtube.com/watch?v=ukzFI9rgwfU', type: 'youtube', description: 'Beginner-friendly ML introduction' },
    { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'web', description: 'Interactive ML tutorials' },
    { title: 'Neural Networks Explained', url: 'https://www.youtube.com/watch?v=aircAruvnKk', type: 'youtube', description: '3Blue1Brown neural network series' },
  ],
  'python basics': [
    { title: 'Python.org Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'web', description: 'Official Python tutorial' },
    { title: 'Learn Python', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', type: 'youtube', description: 'Python for beginners' },
    { title: 'Codecademy Python', url: 'https://www.codecademy.com/learn/learn-python-3', type: 'web', description: 'Interactive Python course' },
    { title: 'Real Python', url: 'https://realpython.com/', type: 'article', description: 'Python tutorials and articles' },
  ],
  mathematics: [
    { title: 'Khan Academy Math', url: 'https://www.khanacademy.org/math', type: 'web', description: 'Comprehensive math courses' },
    { title: 'Math Explained', url: 'https://www.youtube.com/watch?v=pTnEG_WGd2Q', type: 'youtube', description: 'Clear math explanations' },
    { title: 'Wolfram MathWorld', url: 'https://mathworld.wolfram.com/', type: 'web', description: 'Math reference' },
    { title: 'Brilliant.org', url: 'https://brilliant.org/courses/', type: 'web', description: 'Interactive math problems' },
  ],
  physics: [
    { title: 'Physics Classroom', url: 'https://www.physicsclassroom.com/', type: 'web', description: 'Physics tutorials' },
    { title: 'Physics Videos', url: 'https://www.youtube.com/user/minutephysics', type: 'youtube', description: 'MinutePhysics channel' },
    { title: 'Khan Academy Physics', url: 'https://www.khanacademy.org/science/physics', type: 'web', description: 'Free physics courses' },
    { title: 'HyperPhysics', url: 'http://hyperphysics.phy-astr.gsu.edu/', type: 'web', description: 'Physics concept maps' },
  ],
  chemistry: [
    { title: 'Chemistry LibreTexts', url: 'https://chem.libretexts.org/', type: 'web', description: 'Free chemistry textbooks' },
    { title: 'Periodic Videos', url: 'https://www.youtube.com/user/periodicvideos', type: 'youtube', description: 'Element videos' },
    { title: 'Khan Academy Chemistry', url: 'https://www.khanacademy.org/science/chemistry', type: 'web', description: 'Free chemistry courses' },
    { title: 'ChemGuide', url: 'https://www.chemguide.co.uk/', type: 'web', description: 'Chemistry study guides' },
  ],
  biology: [
    { title: 'Biology LibreTexts', url: 'https://bio.libretexts.org/', type: 'web', description: 'Free biology textbooks' },
    { title: 'Crash Course Biology', url: 'https://www.youtube.com/playlist?list=PL3EED4C1D684D3ADF', type: 'youtube', description: 'Engaging biology series' },
    { title: 'Khan Academy Biology', url: 'https://www.khanacademy.org/science/biology', type: 'web', description: 'Free biology courses' },
    { title: 'Nature Education', url: 'https://www.nature.com/scitable/', type: 'article', description: 'Science articles' },
  ],
  science: [
    { title: 'Khan Academy Science', url: 'https://www.khanacademy.org/science', type: 'web', description: 'Free science courses' },
    { title: 'Kurzgesagt', url: 'https://www.youtube.com/user/Kurzgesagt', type: 'youtube', description: 'Science animations' },
    { title: 'Science Daily', url: 'https://www.sciencedaily.com/', type: 'article', description: 'Science news' },
    { title: 'NASA Education', url: 'https://www.nasa.gov/stem', type: 'web', description: 'Space and science resources' },
  ],
  default: [
    { title: 'Khan Academy', url: 'https://www.khanacademy.org/', type: 'web', description: 'Free courses on many subjects' },
    { title: 'Coursera', url: 'https://www.coursera.org/', type: 'web', description: 'University courses online' },
    { title: 'edX', url: 'https://www.edx.org/', type: 'web', description: 'Free online courses' },
    { title: 'YouTube Edu', url: 'https://www.youtube.com/education', type: 'youtube', description: 'Educational videos' },
  ],
};

export const getResourcesForSubject = (subjectName: string, subjectId: string): Resource[] => {
  const normalizedName = subjectName.toLowerCase();
  const templates = SUBJECT_RESOURCES[normalizedName] || SUBJECT_RESOURCES.default;
  
  return templates.map((template, index) => ({
    id: `${subjectId}-${index}`,
    subjectId,
    ...template,
  }));
};

export const searchResources = (query: string): ResourceTemplate[] => {
  const normalizedQuery = query.toLowerCase();
  const allResources = Object.values(SUBJECT_RESOURCES).flat();
  
  return allResources.filter(
    r => 
      r.title.toLowerCase().includes(normalizedQuery) ||
      r.description.toLowerCase().includes(normalizedQuery)
  );
};
