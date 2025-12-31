// Study plan generation utilities

import { StudySession, StudyPlan } from '@/types/study';

const ACTIVITIES: Record<string, string[]> = {
  'aiml fundamentals': [
    'Review machine learning concepts',
    'Practice algorithm implementations',
    'Study neural network architectures',
    'Work through supervised learning examples',
    'Explore unsupervised learning techniques',
  ],
  'python basics': [
    'Practice Python syntax and data types',
    'Work on list and dictionary exercises',
    'Study control flow and functions',
    'Complete coding challenges',
    'Build small projects',
  ],
  mathematics: [
    'Review key formulas and concepts',
    'Practice problem-solving exercises',
    'Work through example problems',
    'Create summary notes',
    'Self-test with practice problems',
  ],
  physics: [
    'Study theoretical concepts',
    'Practice numerical problems',
    'Review diagrams and illustrations',
    'Apply concepts to real-world examples',
    'Solve past exam questions',
  ],
  chemistry: [
    'Memorize chemical formulas',
    'Balance chemical equations',
    'Study reaction mechanisms',
    'Review periodic table trends',
    'Practice stoichiometry problems',
  ],
  biology: [
    'Study biological processes',
    'Create concept maps',
    'Review diagrams and cycles',
    'Practice labeling exercises',
    'Summarize key pathways',
  ],
  science: [
    'Review scientific concepts',
    'Practice experimental analysis',
    'Study diagrams and models',
    'Work through practice problems',
    'Create summary sheets',
  ],
  default: [
    'Active reading and note-taking',
    'Practice exercises',
    'Review and summarize',
    'Self-assessment quiz',
    'Concept mapping',
  ],
};

const SCENARIO_TIPS: Record<string, string[]> = {
  exam: [
    'Practice past exam questions',
    'Focus on high-weight topics',
    'Get adequate sleep before the exam',
    'Review key formulas and definitions',
    'Time yourself on practice tests',
  ],
  homework: [
    'Break tasks into smaller chunks',
    'Start with the most challenging topics',
    'Check your work before submitting',
    'Use textbook examples as guides',
    'Ask for help early if stuck',
  ],
  revision: [
    'Use active recall techniques',
    'Create flashcards for key concepts',
    'Teach concepts to someone else',
    'Summarize each topic in your own words',
    'Focus on weak areas first',
  ],
  project: [
    'Set clear milestones and deadlines',
    'Research thoroughly before starting',
    'Document your process as you go',
    'Break the project into phases',
    'Plan for review and revision time',
  ],
  'general study': [
    'Set specific learning goals',
    'Take regular breaks',
    'Review notes within 24 hours',
    'Practice active learning techniques',
    'Track your progress',
  ],
};

const getActivities = (subject: string): string[] => {
  const normalizedSubject = subject.toLowerCase();
  return ACTIVITIES[normalizedSubject] || ACTIVITIES.default;
};

const getTips = (scenario: string): string[] => {
  const normalizedScenario = scenario.toLowerCase();
  return SCENARIO_TIPS[normalizedScenario] || SCENARIO_TIPS['general study'];
};

export const generateStudyPlan = (
  subject: string,
  hours: number,
  scenario: string,
  subjectId: string
): Omit<StudyPlan, 'id' | 'createdAt'> => {
  const sessions: StudySession[] = [];
  const activities = getActivities(subject);
  const sessionDuration = 45; // minutes
  const breakDuration = 15; // minutes
  const totalMinutes = hours * 60;
  const sessionsNeeded = Math.ceil(totalMinutes / (sessionDuration + breakDuration));
  
  let currentHour = 9; // Start at 9 AM
  let currentMinute = 0;
  
  const formatTime = (h: number, m: number): string => {
    const hour = h > 12 ? h - 12 : h;
    const period = h >= 12 ? 'PM' : 'AM';
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };
  
  for (let i = 0; i < Math.min(sessionsNeeded, 8); i++) {
    // Study session
    const startTime = formatTime(currentHour, currentMinute);
    currentMinute += sessionDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
    const endTime = formatTime(currentHour, currentMinute);
    
    sessions.push({
      time: `${startTime} - ${endTime}`,
      activity: activities[i % activities.length],
      duration: `${sessionDuration} min`,
      type: i % 4 === 3 ? 'review' : 'study',
    });
    
    // Break (except after last session)
    if (i < Math.min(sessionsNeeded, 8) - 1) {
      const breakStart = formatTime(currentHour, currentMinute);
      currentMinute += breakDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
      const breakEnd = formatTime(currentHour, currentMinute);
      
      sessions.push({
        time: `${breakStart} - ${breakEnd}`,
        activity: i % 2 === 0 ? 'Short break - Stretch and hydrate' : 'Break - Walk or rest your eyes',
        duration: `${breakDuration} min`,
        type: 'break',
      });
    }
  }
  
  const tips = [
    'Take regular breaks to maintain focus',
    'Stay hydrated and have healthy snacks nearby',
    ...getTips(scenario).slice(0, 3),
  ];
  
  return {
    subjectId,
    subject,
    totalHours: hours,
    scenario,
    sessions,
    tips: tips.slice(0, 5),
  };
};

export const downloadScheduleAsCSV = (plan: StudyPlan): void => {
  const headers = ['Time', 'Activity', 'Duration', 'Type'];
  const rows = plan.sessions.map(session => [
    session.time,
    session.activity,
    session.duration,
    session.type,
  ]);

  const csvContent = [
    `Study Plan for ${plan.subject} - ${plan.scenario}`,
    `Total Hours: ${plan.totalHours}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    '',
    'Tips:',
    ...plan.tips.map(tip => `"${tip}"`),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `study_plan_${plan.subject.replace(/\s+/g, '_')}_${Date.now()}.csv`;
  link.click();
};
