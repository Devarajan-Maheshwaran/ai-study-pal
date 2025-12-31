// NLP utilities for text processing, MCQ generation, summarization, and study tips
// Simulates local model processing for educational content

// Common English stopwords
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that',
  'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
]);

// Tokenize text into words
export const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
};

// Remove stopwords
export const removeStopwords = (tokens: string[]): string[] => {
  return tokens.filter(token => !STOPWORDS.has(token) && token.length > 2);
};

// Get word frequency
export const getWordFrequency = (tokens: string[]): Map<string, number> => {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  return freq;
};

// Extract key terms (top N most frequent non-stopword terms)
export const extractKeyTerms = (text: string, topN: number = 10): string[] => {
  const tokens = tokenize(text);
  const filtered = removeStopwords(tokens);
  const freq = getWordFrequency(filtered);
  
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
};

// Split text into sentences
export const splitSentences = (text: string): string[] => {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
};

// Score sentence importance based on key terms
const scoreSentence = (sentence: string, keyTerms: Set<string>): number => {
  const tokens = tokenize(sentence);
  const matches = tokens.filter(t => keyTerms.has(t)).length;
  const lengthPenalty = sentence.length > 200 ? 0.8 : 1;
  return (matches / Math.max(tokens.length, 1)) * lengthPenalty;
};

// Extractive summarization
export const summarizeText = (text: string, targetWordCount: number = 50): string => {
  const sentences = splitSentences(text);
  if (sentences.length <= 2) return text;
  
  const keyTerms = new Set(extractKeyTerms(text, 15));
  
  const scoredSentences = sentences.map((sentence, index) => ({
    sentence,
    index,
    score: scoreSentence(sentence, keyTerms) + (index === 0 ? 0.3 : 0),
  }));
  
  scoredSentences.sort((a, b) => b.score - a.score);
  
  const selected: typeof scoredSentences = [];
  let wordCount = 0;
  
  for (const item of scoredSentences) {
    const sentenceWords = item.sentence.split(/\s+/).length;
    if (wordCount + sentenceWords <= targetWordCount * 1.5) {
      selected.push(item);
      wordCount += sentenceWords;
    }
    if (wordCount >= targetWordCount) break;
  }
  
  selected.sort((a, b) => a.index - b.index);
  
  return selected.map(s => s.sentence).join('. ') + '.';
};

// Simple Bag-of-Words representation
export const createBoW = (text: string): Map<string, number> => {
  const tokens = removeStopwords(tokenize(text));
  return getWordFrequency(tokens);
};

// Calculate text complexity (simple heuristic for difficulty)
export const calculateComplexity = (text: string): 'easy' | 'medium' | 'hard' => {
  const tokens = tokenize(text);
  const avgWordLength = tokens.reduce((sum, t) => sum + t.length, 0) / Math.max(tokens.length, 1);
  const uniqueRatio = new Set(tokens).size / Math.max(tokens.length, 1);
  
  const score = avgWordLength * 0.6 + uniqueRatio * 10;
  
  if (score < 5) return 'easy';
  if (score < 7) return 'medium';
  return 'hard';
};

// ============================================================================
// STRUCTURED SUMMARY GENERATION (Local NLP Model Simulation)
// ============================================================================

export interface StructuredSummary {
  keyConcepts: string[];
  definitions: { term: string; definition: string }[];
  formulas: string[];
  revisionTips: string[];
  summary: string;
  processingInfo: {
    sourceType: string;
    wordCount: number;
    processingTime: string;
  };
}

// Extract definitions from text (pattern matching)
const extractDefinitions = (text: string): { term: string; definition: string }[] => {
  const definitions: { term: string; definition: string }[] = [];
  const sentences = splitSentences(text);
  
  // Pattern: "X is Y", "X refers to Y", "X means Y", "X is defined as Y"
  const patterns = [
    /^(\w+(?:\s+\w+)?)\s+is\s+(?:defined as\s+)?(.+)$/i,
    /^(\w+(?:\s+\w+)?)\s+refers to\s+(.+)$/i,
    /^(\w+(?:\s+\w+)?)\s+means\s+(.+)$/i,
    /^(?:the\s+)?(\w+(?:\s+\w+)?)\s*[-:]\s*(.+)$/i,
  ];
  
  for (const sentence of sentences) {
    for (const pattern of patterns) {
      const match = sentence.match(pattern);
      if (match && match[1] && match[2] && match[1].length < 50 && match[2].length > 10) {
        definitions.push({
          term: match[1].charAt(0).toUpperCase() + match[1].slice(1),
          definition: match[2].charAt(0).toUpperCase() + match[2].slice(1),
        });
        break;
      }
    }
  }
  
  return definitions.slice(0, 8);
};

// Extract formulas/steps from text
const extractFormulas = (text: string): string[] => {
  const formulas: string[] = [];
  const sentences = splitSentences(text);
  
  // Look for mathematical expressions, steps, or procedures
  const patterns = [
    /formula[:\s]+(.+)/i,
    /equation[:\s]+(.+)/i,
    /step\s*\d*[:\s]+(.+)/i,
    /calculate[:\s]+(.+)/i,
    /=\s*[^.]+/,
  ];
  
  for (const sentence of sentences) {
    for (const pattern of patterns) {
      if (pattern.test(sentence)) {
        formulas.push(sentence);
        break;
      }
    }
    // Also check for sentences with mathematical symbols
    if (/[+\-*/=<>≤≥∑∫√]/.test(sentence) && sentence.length < 150) {
      if (!formulas.includes(sentence)) {
        formulas.push(sentence);
      }
    }
  }
  
  return formulas.slice(0, 6);
};

// Generate key concepts as bullet points
const generateKeyConcepts = (text: string, keyTerms: string[]): string[] => {
  const sentences = splitSentences(text);
  const concepts: string[] = [];
  const keyTermSet = new Set(keyTerms);
  
  // Find sentences that contain key terms and are explanatory
  for (const sentence of sentences) {
    const tokens = tokenize(sentence);
    const hasKeyTerm = tokens.some(t => keyTermSet.has(t));
    
    if (hasKeyTerm && sentence.length > 30 && sentence.length < 200) {
      concepts.push(sentence);
    }
  }
  
  // Ensure at least some concepts by using key terms directly if needed
  if (concepts.length < 5) {
    keyTerms.slice(0, 5 - concepts.length).forEach(term => {
      concepts.push(`Key concept: ${term.charAt(0).toUpperCase() + term.slice(1)}`);
    });
  }
  
  return concepts.slice(0, 10);
};

// Main structured summary generator
export const generateStructuredSummary = (
  text: string, 
  sourceType: 'text' | 'pdf' | 'youtube',
  subjectName: string = 'General'
): StructuredSummary => {
  const startTime = Date.now();
  const keyTerms = extractKeyTerms(text, 15);
  const summary = summarizeText(text, 80);
  const keyConcepts = generateKeyConcepts(text, keyTerms);
  const definitions = extractDefinitions(text);
  const formulas = extractFormulas(text);
  
  // Generate revision tips based on content analysis
  const revisionTips: string[] = [
    `Focus on key terms: ${keyTerms.slice(0, 3).join(', ')}`,
    `Review definitions for: ${definitions.slice(0, 2).map(d => d.term).join(', ') || keyTerms[0] || 'core concepts'}`,
    `Do 5 practice questions on ${subjectName}`,
    `Summarize main ideas in your own words`,
    `Test yourself before reviewing notes`,
    `Create flashcards for important terms`,
    `Practice explaining concepts aloud`,
    `Connect new concepts to what you already know`,
  ];
  
  if (formulas.length > 0) {
    revisionTips.unshift(`Practice formulas: work through ${formulas.length} equations`);
  }
  
  return {
    keyConcepts,
    definitions,
    formulas,
    revisionTips: revisionTips.slice(0, 8),
    summary,
    processingInfo: {
      sourceType: sourceType === 'pdf' ? 'PDF Document' : sourceType === 'youtube' ? 'YouTube Video' : 'Text Notes',
      wordCount: text.split(/\s+/).length,
      processingTime: `${Date.now() - startTime}ms`,
    },
  };
};

// ============================================================================
// MCQ GENERATION (Local Model Simulation)
// ============================================================================

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  explanation?: string;
}

// Generate distractors for a term
const generateDistractors = (term: string, keyTerms: string[], allTerms: string[]): string[] => {
  const distractors: string[] = [];
  
  // First, try similar-length key terms
  const similarTerms = keyTerms.filter(t => 
    t !== term && 
    Math.abs(t.length - term.length) <= 3
  );
  distractors.push(...similarTerms.slice(0, 3));
  
  // Add from all terms if needed
  if (distractors.length < 3) {
    const otherTerms = allTerms.filter(t => 
      t !== term && 
      !distractors.includes(t) &&
      t.length > 2
    );
    distractors.push(...otherTerms.slice(0, 3 - distractors.length));
  }
  
  // Fallback generic distractors
  const generics = ['various', 'multiple', 'different', 'similar', 'related', 'unknown'];
  while (distractors.length < 3) {
    distractors.push(generics[distractors.length]);
  }
  
  return distractors.slice(0, 3);
};

// Generate MCQs from text with improved algorithm
export const generateMCQsFromText = (text: string, count: number = 10): GeneratedQuestion[] => {
  const sentences = splitSentences(text);
  const keyTerms = extractKeyTerms(text, Math.max(count * 2, 20));
  const allTokens = removeStopwords(tokenize(text));
  const questions: GeneratedQuestion[] = [];
  
  // Type 1: Fill-in-the-blank questions
  for (const sentence of sentences) {
    if (questions.length >= count) break;
    
    const tokens = tokenize(sentence);
    const sentenceKeyTerms = tokens.filter(t => keyTerms.includes(t));
    
    if (sentenceKeyTerms.length === 0 || sentence.length < 30) continue;
    
    const targetTerm = sentenceKeyTerms[0];
    const questionText = sentence.replace(
      new RegExp(`\\b${targetTerm}\\b`, 'gi'),
      '_____'
    );
    
    const distractors = generateDistractors(targetTerm, keyTerms, allTokens);
    const correctPosition = Math.floor(Math.random() * 4);
    const options = [...distractors];
    options.splice(correctPosition, 0, targetTerm);
    
    questions.push({
      question: `Complete the sentence: "${questionText}"`,
      options: options.map(o => o.charAt(0).toUpperCase() + o.slice(1)),
      correctAnswer: correctPosition,
      difficulty: calculateComplexity(sentence),
      topic: targetTerm,
      explanation: `The correct answer is "${targetTerm}" because it fits the context of the original statement.`,
    });
  }
  
  // Type 2: True/False style questions (converted to MCQ)
  if (questions.length < count) {
    const conceptSentences = sentences.filter(s => 
      s.length > 40 && 
      s.length < 150 &&
      !questions.some(q => q.question.includes(s.slice(0, 20)))
    );
    
    for (const sentence of conceptSentences.slice(0, Math.ceil(count * 0.3))) {
      if (questions.length >= count) break;
      
      const isTrue = Math.random() > 0.5;
      let questionSentence = sentence;
      
      if (!isTrue) {
        // Modify sentence to make it false
        const words = sentence.split(' ');
        const idx = Math.floor(Math.random() * (words.length - 1)) + 1;
        if (words[idx] && words[idx].length > 2) {
          words[idx] = 'not ' + words[idx];
          questionSentence = words.join(' ');
        }
      }
      
      questions.push({
        question: `Is the following statement correct? "${questionSentence}"`,
        options: ['True', 'False', 'Partially True', 'Cannot be determined'],
        correctAnswer: isTrue ? 0 : 1,
        difficulty: 'easy',
        topic: extractKeyTerms(sentence, 1)[0] || 'General',
        explanation: isTrue 
          ? 'This statement accurately reflects the information from the source material.'
          : 'This statement contains a modification that makes it incorrect.',
      });
    }
  }
  
  // Type 3: Key concept questions
  while (questions.length < count && keyTerms.length > questions.length) {
    const idx = questions.length;
    const term = keyTerms[idx % keyTerms.length];
    const distractors = generateDistractors(term, keyTerms, allTokens);
    
    const correctPosition = Math.floor(Math.random() * 4);
    const options = [...distractors];
    options.splice(correctPosition, 0, term);
    
    const questionTypes = [
      `Which of the following is a key concept from the material?`,
      `Which term is most relevant to the topic discussed?`,
      `Identify the important term mentioned in the text:`,
    ];
    
    questions.push({
      question: questionTypes[idx % questionTypes.length],
      options: options.map(o => o.charAt(0).toUpperCase() + o.slice(1)),
      correctAnswer: correctPosition,
      difficulty: 'easy',
      topic: term,
      explanation: `"${term}" is explicitly mentioned and emphasized in the source material.`,
    });
  }
  
  // Shuffle questions for variety
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  
  return questions.slice(0, count);
};

// Generate study tips based on key terms
export const generateStudyTips = (text: string, subject: string): string[] => {
  const keyTerms = extractKeyTerms(text, 5);
  const tips: string[] = [];
  
  if (keyTerms.length > 0) {
    tips.push(`Review key terms daily: ${keyTerms.slice(0, 3).join(', ')}`);
  }
  
  tips.push(`Practice questions on ${subject} concepts`);
  
  if (keyTerms.length > 2) {
    tips.push(`Create flashcards for: ${keyTerms[1]}, ${keyTerms[2]}`);
  }
  
  tips.push(`Summarize main ideas in your own words`);
  tips.push(`Test yourself before reviewing notes`);
  
  const sentences = splitSentences(text);
  if (sentences.length > 5) {
    tips.push(`Break down the ${sentences.length} concepts into smaller chunks`);
  }
  
  return tips.slice(0, 5);
};

// K-means clustering for topic grouping (simplified)
export const clusterTopics = (terms: string[], k: number = 3): string[][] => {
  if (terms.length <= k) {
    return terms.map(t => [t]);
  }
  
  const sorted = [...terms].sort((a, b) => a.length - b.length);
  const chunkSize = Math.ceil(sorted.length / k);
  const clusters: string[][] = [];
  
  for (let i = 0; i < k; i++) {
    clusters.push(sorted.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  
  return clusters.filter(c => c.length > 0);
};

// Adaptive question selection based on difficulty
export const selectAdaptiveQuestions = (
  questions: GeneratedQuestion[],
  previousAccuracy: number,
  count: number = 10
): GeneratedQuestion[] => {
  let targetDifficulty: 'easy' | 'medium' | 'hard';
  
  if (previousAccuracy < 50) {
    targetDifficulty = 'easy';
  } else if (previousAccuracy < 75) {
    targetDifficulty = 'medium';
  } else {
    targetDifficulty = 'hard';
  }
  
  const targetQuestions = questions.filter(q => q.difficulty === targetDifficulty);
  const otherQuestions = questions.filter(q => q.difficulty !== targetDifficulty);
  
  const selected = [
    ...targetQuestions.slice(0, Math.ceil(count * 0.7)),
    ...otherQuestions.slice(0, Math.floor(count * 0.3)),
  ];
  
  // Shuffle
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }
  
  return selected.slice(0, count);
};

// Get next difficulty based on performance
export const getNextDifficulty = (
  currentDifficulty: 'easy' | 'medium' | 'hard',
  wasCorrect: boolean
): 'easy' | 'medium' | 'hard' => {
  if (wasCorrect) {
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
    return 'hard';
  } else {
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
    return 'easy';
  }
};
