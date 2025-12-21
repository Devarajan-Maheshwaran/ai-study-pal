from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
RES_DIR = DATA_DIR / "resources"
MODELS_DIR = BASE_DIR / "backend" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

CSV_PATH = RES_DIR / "resources.csv"
VEC_PATH = MODELS_DIR / "resource_tfidf_vectorizer.joblib"
KMEANS_PATH = MODELS_DIR / "resource_kmeans.joblib"
RES_TBL_PATH = RES_DIR / "resources.parquet"

df = pd.read_csv(CSV_PATH)
df["text"] = df["subject"].fillna("") + " " + df["description"].fillna("")

vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1, 2))
X = vectorizer.fit_transform(df["text"])

k = min(5, X.shape[0])
kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
kmeans.fit(X)

df["cluster"] = kmeans.labels_

joblib.dump(vectorizer, VEC_PATH)
joblib.dump(kmeans, KMEANS_PATH)
df.to_csv(RES_TBL_PATH, index=False)
print("Saved:", VEC_PATH, KMEANS_PATH, RES_TBL_PATH)
 