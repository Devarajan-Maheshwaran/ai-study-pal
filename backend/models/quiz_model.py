from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
import pickle
import os
import random
from nltk.tokenize import sent_tokenize, word_tokenize

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'quiz_model.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'vectorizer.pkl')
KMEANS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'kmeans_model.pkl')
TFIDF_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'tfidf_vectorizer.pkl')

def train_quiz_models():
    """Train models for difficulty classification."""
    easy = ["What is 2+2?", "What is the capital of France?", "Define photosynthesis?"]
    medium = ["Explain evolution?", "Describe quantum mechanics?", "What is mitosis?"]
    
    all_texts = easy + medium
    all_labels = [0]*len(easy) + [1]*len(medium)
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    
    vectorizer = CountVectorizer(max_features=100)
    X = vectorizer.fit_transform(all_texts)
    model = LogisticRegression(random_state=42, max_iter=200)
    model.fit(X, all_labels)
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    with open(VECTORIZER_PATH, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    return model, vectorizer

def load_quiz_models():
    """Load or train models."""
    if not os.path.exists(MODEL_PATH):
        return train_quiz_models()
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    return model, vectorizer

def classify_difficulty(questions):
    """Classify difficulty of questions."""
    try:
        model, vectorizer = load_quiz_models()
        X = vectorizer.transform(questions)
        preds = model.predict(X)
        return ["easy" if p == 0 else "medium" for p in preds]
    except:
        return ["easy"] * len(questions)

def train_kmeans_model():
    """Train KMeans for topic clustering using training data."""
    import csv
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'topic_training_data.csv')
    sample_texts = []
    with open(data_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sample_texts.append(row['text'])

    tfidf = TfidfVectorizer(max_features=100, stop_words='english')
    X = tfidf.fit_transform(sample_texts)

    kmeans = KMeans(n_clusters=4, random_state=42)
    kmeans.fit(X)

    KMEANS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'kmeans_model.pkl')
    TFIDF_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'tfidf_vectorizer.pkl')

    with open(KMEANS_PATH, 'wb') as f:
        pickle.dump(kmeans, f)
    with open(TFIDF_PATH, 'wb') as f:
        pickle.dump(tfidf, f)

    return kmeans, tfidf

def load_kmeans_model():
    """Load or train KMeans model."""
    if not os.path.exists(KMEANS_PATH):
        return train_kmeans_model()
    with open(KMEANS_PATH, 'rb') as f:
        kmeans = pickle.load(f)
    with open(TFIDF_PATH, 'rb') as f:
        tfidf = pickle.load(f)
    return kmeans, tfidf

def generate_mcqs(text, num_questions=5):
    """Generate multiple choice questions from text."""
    try:
        sentences = sent_tokenize(text)
        if len(sentences) < 3:
            return []

        # Extract key sentences
        tfidf = TfidfVectorizer(max_features=50, stop_words='english')
        tfidf_matrix = tfidf.fit_transform(sentences)
        scores = tfidf_matrix.sum(axis=1).A1
        top_indices = scores.argsort()[-min(num_questions*2, len(sentences)):][::-1]

        questions = []
        for idx in top_indices[:num_questions]:
            sentence = sentences[idx].strip()
            if len(sentence.split()) < 5:
                continue

            # Simple question generation
            question_text = sentence.replace('.', '?')
            if not question_text.endswith('?'):
                question_text += '?'

            # Generate options (simplified)
            words = word_tokenize(sentence)
            correct_answer = random.choice(words) if words else "Answer"

            # Wrong options
            wrong_options = ["Option A", "Option B", "Option C"]
            options = [correct_answer] + wrong_options[:3]
            random.shuffle(options)

            question = {
                "id": f"q_{len(questions)+1}",
                "question": question_text,
                "options": options,
                "answer": correct_answer,
                "topic": "General"
            }
            questions.append(question)

        return questions

    except Exception as e:
        print(f"Error generating MCQs: {e}")
        return []
