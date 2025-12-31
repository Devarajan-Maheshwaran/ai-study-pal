// Motivational feedback generation

interface FeedbackTemplate {
  message: string;
  emoji: string;
}

const FEEDBACK_TEMPLATES: Record<string, FeedbackTemplate[]> = {
  excellent: [
    { message: "Outstanding performance! You're mastering this subject!", emoji: "🌟" },
    { message: "Incredible work! Keep pushing those boundaries!", emoji: "🚀" },
    { message: "You're on fire! Your dedication is paying off!", emoji: "🔥" },
    { message: "Exceptional! You've really got a handle on this!", emoji: "💫" },
  ],
  good: [
    { message: "Great job! You're making solid progress!", emoji: "👏" },
    { message: "Well done! Keep up the momentum!", emoji: "💪" },
    { message: "Nice work! You're getting stronger!", emoji: "⭐" },
    { message: "Good effort! Every step counts!", emoji: "🎯" },
  ],
  moderate: [
    { message: "You're on the right track! Keep practicing!", emoji: "📚" },
    { message: "Good attempt! Review the tricky parts and try again!", emoji: "💡" },
    { message: "Progress takes time. You're learning!", emoji: "🌱" },
    { message: "Keep going! Each attempt makes you stronger!", emoji: "🔄" },
  ],
  needsWork: [
    { message: "Don't give up! Every expert was once a beginner!", emoji: "💭" },
    { message: "Learning is a journey. Take your time!", emoji: "🛤️" },
    { message: "Review the material and try again. You've got this!", emoji: "📖" },
    { message: "Mistakes help us learn. Keep pushing!", emoji: "🌈" },
  ],
};

const SUBJECT_ENCOURAGEMENT: Record<string, string[]> = {
  'aiml fundamentals': [
    "AI concepts take time to sink in - you're doing great!",
    "Machine learning is complex. Your persistence is admirable!",
    "Every neural network expert started where you are!",
  ],
  'python basics': [
    "Python is a fantastic skill to have. Keep coding!",
    "Every line of code is progress. You're becoming a programmer!",
    "Debugging is learning. Keep experimenting!",
  ],
  mathematics: [
    "Math builds on itself. Your practice will compound!",
    "Problem-solving skills are developing with each question!",
    "Numbers are your friends - keep practicing!",
  ],
  physics: [
    "Understanding physics opens up the universe!",
    "Every equation solved is a step toward mastery!",
    "Physics concepts connect to the real world - keep observing!",
  ],
  chemistry: [
    "Chemistry is the study of change - and you're changing for the better!",
    "Each reaction you understand is knowledge gained!",
    "The periodic table is becoming your friend!",
  ],
  biology: [
    "Life sciences are fascinating - keep exploring!",
    "Understanding biology helps you understand yourself!",
    "Every organism you learn about expands your world!",
  ],
  default: [
    "Learning never stops - you're on a great path!",
    "Knowledge compounds. Every session matters!",
    "Your future self will thank you for studying today!",
  ],
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export interface MotivationalFeedback {
  mainMessage: string;
  emoji: string;
  encouragement: string;
  tip: string;
}

export const generateMotivationalFeedback = (
  subject: string,
  score: number,
  totalQuestions: number
): MotivationalFeedback => {
  const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
  
  let category: keyof typeof FEEDBACK_TEMPLATES;
  if (accuracy >= 90) category = 'excellent';
  else if (accuracy >= 70) category = 'good';
  else if (accuracy >= 50) category = 'moderate';
  else category = 'needsWork';
  
  const feedback = getRandomItem(FEEDBACK_TEMPLATES[category]);
  const normalizedSubject = subject.toLowerCase();
  const encouragements = SUBJECT_ENCOURAGEMENT[normalizedSubject] || SUBJECT_ENCOURAGEMENT.default;
  
  const tips = [
    'Take a short break, then review what you missed.',
    'Try explaining the concepts out loud to solidify learning.',
    'Create flashcards for the questions you got wrong.',
    'Watch a video tutorial on the challenging topics.',
    'Practice similar questions to reinforce your knowledge.',
  ];
  
  return {
    mainMessage: feedback.message,
    emoji: feedback.emoji,
    encouragement: getRandomItem(encouragements),
    tip: accuracy < 70 ? getRandomItem(tips) : 'Keep up your excellent study habits!',
  };
};

export const getStreakMessage = (streakDays: number): string => {
  if (streakDays >= 30) return `🏆 Amazing ${streakDays}-day streak! You're unstoppable!`;
  if (streakDays >= 14) return `🔥 ${streakDays}-day streak! You're on fire!`;
  if (streakDays >= 7) return `⭐ ${streakDays}-day streak! Great consistency!`;
  if (streakDays >= 3) return `💪 ${streakDays}-day streak! Keep it going!`;
  return `🌱 Start building your study streak today!`;
};
