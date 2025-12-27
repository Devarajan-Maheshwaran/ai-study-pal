import os
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
import joblib
from config import Config

ARTIFACT_DIR = Config.MODEL_DIR
os.makedirs(ARTIFACT_DIR, exist_ok=True)

VEC_PATH = os.path.join(ARTIFACT_DIR, "quiz_vectorizer.joblib")
LR_PATH = os.path.join(ARTIFACT_DIR, "quiz_logreg.joblib")
KM_PATH = os.path.join(ARTIFACT_DIR, "topic_kmeans.joblib")

def train_quiz_models():
    data_path = os.path.join(Config.DATA_DIR, "quiz_questions.csv")
    df = pd.read_csv(data_path)  # columns: question, difficulty(easy/medium), topic
    X_text = df["question"].fillna("")
    y = df["difficulty"].map({"easy": 0, "medium": 1}).fillna(0)

    vectorizer = CountVectorizer(max_features=2000)
    X = vectorizer.fit_transform(X_text)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    clf = LogisticRegression(max_iter=1000)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    # K-means on topics for resource suggestion clusters
    topic_vec = vectorizer.transform(df["question"].fillna(""))
    kmeans = KMeans(n_clusters=5, random_state=42)
    kmeans.fit(topic_vec)

    joblib.dump(vectorizer, VEC_PATH)
    joblib.dump(clf, LR_PATH)
    joblib.dump(kmeans, KM_PATH)

    return acc, f1

def load_vectorizer_and_model():
    import joblib

    vectorizer = joblib.load(VEC_PATH)
    clf = joblib.load(LR_PATH)
    kmeans = joblib.load(KM_PATH)
    return vectorizer, clf, kmeans

def classify_difficulty(questions):
    """
    questions: list of strings
    returns: list of difficulty labels
    """
    from pathlib import Path
    import joblib

    if not Path(VEC_PATH).exists():
        train_quiz_models()
    vectorizer, clf, _ = load_vectorizer_and_model()
    X = vectorizer.transform(questions)
    preds = clf.predict(X)
    labels = ["easy" if p == 0 else "medium" for p in preds]
    return labels
