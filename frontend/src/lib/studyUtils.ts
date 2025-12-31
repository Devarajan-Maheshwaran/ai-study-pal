import { StudyPlan, StudySession } from "@/components/study/StudyPlanDisplay";
import { QuizQuestion } from "@/components/study/QuizSection";

export const generateStudyPlan = (
  subject: string,
  hours: number,
  scenario: string
): StudyPlan => {
  const sessions: StudySession[] = [];
  const hoursPerDay = Math.min(hours, 8);
  const sessionLength = 45; // minutes
  const breakLength = 15;

  let currentHour = 9; // Start at 9 AM

  for (let i = 0; i < Math.ceil((hoursPerDay * 60) / (sessionLength + breakLength)); i++) {
    const isStudySession = i % 2 === 0 || i % 3 !== 0;
    
    if (isStudySession) {
      sessions.push({
        time: `${currentHour}:00 - ${currentHour}:${sessionLength}`,
        activity: getStudyActivity(subject, scenario, i),
        duration: `${sessionLength} min`,
        type: i % 4 === 3 ? "review" : "study",
      });
      currentHour += 1;
    }

    if ((i + 1) % 2 === 0) {
      sessions.push({
        time: `${currentHour - 1}:${sessionLength} - ${currentHour}:00`,
        activity: "Short break - Stretch and hydrate",
        duration: `${breakLength} min`,
        type: "break",
      });
    }
  }

  const tips = getStudyTips(subject, scenario);

  return {
    subject,
    totalHours: hours,
    scenario,
    sessions: sessions.slice(0, 8),
    tips,
  };
};

const getStudyActivity = (subject: string, scenario: string, index: number): string => {
  const activities: Record<string, string[]> = {
    mathematics: [
      "Review key formulas and concepts",
      "Practice problem-solving exercises",
      "Work through example problems",
      "Create summary notes",
    ],
    physics: [
      "Study theoretical concepts",
      "Practice numerical problems",
      "Review diagrams and illustrations",
      "Apply concepts to real-world examples",
    ],
    chemistry: [
      "Memorize chemical formulas",
      "Balance chemical equations",
      "Study reaction mechanisms",
      "Review periodic table trends",
    ],
    biology: [
      "Study biological processes",
      "Create concept maps",
      "Review diagrams and cycles",
      "Practice labeling exercises",
    ],
    "computer science": [
      "Study algorithms and data structures",
      "Practice coding exercises",
      "Review programming concepts",
      "Debug and optimize code",
    ],
    history: [
      "Read primary sources",
      "Create timeline of events",
      "Analyze cause and effect",
      "Review key figures and dates",
    ],
    default: [
      "Active reading and note-taking",
      "Practice exercises",
      "Review and summarize",
      "Self-assessment quiz",
    ],
  };

  const subjectActivities = activities[subject.toLowerCase()] || activities.default;
  return subjectActivities[index % subjectActivities.length];
};

const getStudyTips = (subject: string, scenario: string): string[] => {
  const baseTips = [
    "Take regular breaks to maintain focus",
    "Stay hydrated and have healthy snacks nearby",
    "Review key terms daily for better retention",
  ];

  const scenarioTips: Record<string, string[]> = {
    exam: [
      "Practice past exam questions",
      "Focus on high-weight topics",
      "Get adequate sleep before the exam",
    ],
    homework: [
      "Break tasks into smaller chunks",
      "Start with the most challenging topics",
      "Check your work before submitting",
    ],
    revision: [
      "Use active recall techniques",
      "Create flashcards for key concepts",
      "Teach concepts to someone else",
    ],
    project: [
      "Set clear milestones and deadlines",
      "Research thoroughly before starting",
      "Document your process as you go",
    ],
  };

  return [...baseTips, ...(scenarioTips[scenario] || [])].slice(0, 5);
};

export const generateQuiz = (subject: string): QuizQuestion[] => {
  const quizzes: Record<string, QuizQuestion[]> = {
    mathematics: [
      {
        id: 1,
        question: "What is the derivative of x²?",
        options: ["x", "2x", "2x²", "x²"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 2,
        question: "What is the value of π (pi) rounded to 2 decimal places?",
        options: ["3.12", "3.14", "3.16", "3.18"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 3,
        question: "What is the quadratic formula used to solve?",
        options: ["Linear equations", "Quadratic equations", "Cubic equations", "Logarithmic equations"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 4,
        question: "What is the sum of angles in a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 5,
        question: "If f(x) = 3x + 5, what is f(2)?",
        options: ["8", "10", "11", "13"],
        correctAnswer: 2,
        difficulty: "medium",
      },
    ],
    physics: [
      {
        id: 1,
        question: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 2,
        question: "What does E = mc² represent?",
        options: ["Force equation", "Mass-energy equivalence", "Momentum", "Velocity"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 3,
        question: "What is the speed of light in vacuum?",
        options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"],
        correctAnswer: 1,
        difficulty: "medium",
      },
      {
        id: 4,
        question: "Which law states 'For every action, there is an equal and opposite reaction'?",
        options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravitation"],
        correctAnswer: 2,
        difficulty: "easy",
      },
      {
        id: 5,
        question: "What is the acceleration due to gravity on Earth?",
        options: ["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"],
        correctAnswer: 1,
        difficulty: "easy",
      },
    ],
    chemistry: [
      {
        id: 1,
        question: "What is the chemical symbol for Gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correctAnswer: 2,
        difficulty: "easy",
      },
      {
        id: 2,
        question: "How many elements are in the periodic table?",
        options: ["108", "112", "118", "125"],
        correctAnswer: 2,
        difficulty: "medium",
      },
      {
        id: 3,
        question: "What is the pH of pure water?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        difficulty: "easy",
      },
      {
        id: 4,
        question: "What is the molecular formula for water?",
        options: ["HO", "H₂O", "H₂O₂", "OH"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 5,
        question: "Which gas is most abundant in Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
        correctAnswer: 2,
        difficulty: "easy",
      },
    ],
    default: [
      {
        id: 1,
        question: "What is the most effective study technique?",
        options: ["Passive reading", "Active recall", "Highlighting", "Copying notes"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 2,
        question: "How long should a typical study session last?",
        options: ["15 minutes", "25-45 minutes", "2 hours", "4 hours"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 3,
        question: "What is spaced repetition?",
        options: [
          "Studying everything at once",
          "Reviewing material at increasing intervals",
          "Reading the same page repeatedly",
          "Taking frequent breaks",
        ],
        correctAnswer: 1,
        difficulty: "medium",
      },
      {
        id: 4,
        question: "What helps with memory retention?",
        options: ["Sleep deprivation", "Adequate sleep", "Caffeine only", "Skipping meals"],
        correctAnswer: 1,
        difficulty: "easy",
      },
      {
        id: 5,
        question: "Which environment is best for studying?",
        options: ["Noisy cafe", "In bed", "Quiet, well-lit space", "Dark room"],
        correctAnswer: 2,
        difficulty: "easy",
      },
    ],
  };

  return quizzes[subject.toLowerCase()] || quizzes.default;
};

export const summarizeText = (text: string): string => {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const wordCount = text.split(/\s+/).length;

  if (wordCount < 50) {
    return text;
  }

  // Simple extractive summarization - take first and key sentences
  const targetSentences = Math.max(2, Math.ceil(sentences.length * 0.3));
  const selectedSentences = sentences.slice(0, targetSentences);

  return selectedSentences.join(". ").trim() + ".";
};

export const downloadScheduleAsCSV = (plan: StudyPlan) => {
  const headers = ["Time", "Activity", "Duration", "Type"];
  const rows = plan.sessions.map((session) => [
    session.time,
    session.activity,
    session.duration,
    session.type,
  ]);

  const csvContent = [
    `Study Plan for ${plan.subject} - ${plan.scenario}`,
    `Total Hours: ${plan.totalHours}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    "",
    "Tips:",
    ...plan.tips.map((tip) => `"${tip}"`),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `study_plan_${plan.subject}_${Date.now()}.csv`;
  link.click();
};
