from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
RES_DIR = DATA_DIR / "resources"
MODELS_DIR = BASE_DIR / "models"

VEC_PATH = MODELS_DIR / "resource_tfidf_vectorizer.joblib"
KMEANS_PATH = MODELS_DIR / "resource_kmeans.joblib"
RES_TBL_PATH = RES_DIR / "resources.parquet"

vectorizer = joblib.load(VEC_PATH)
kmeans = joblib.load(KMEANS_PATH)
resources_df = pd.read_parquet(RES_TBL_PATH)


def suggest_resources(subject: str, top_n: int = 5):
    if not subject.strip():
        return []

    X_query = vectorizer.transform([subject])
    cluster = int(kmeans.predict(X_query)[0])

    mask = resources_df["cluster"] == cluster
    cluster_df = resources_df[mask].copy()

    if cluster_df.empty:
        cluster_df = resources_df.copy()

    X_all = vectorizer.transform(cluster_df["text"])
    center = kmeans.cluster_centers_[cluster].reshape(1, -1)
    sims = (X_all @ center.T).toarray().ravel()

    cluster_df["similarity"] = sims
    cluster_df = cluster_df.sort_values("similarity", ascending=False)

    out = []
    for _, row in cluster_df.head(top_n).iterrows():
        out.append({
            "subject": row["subject"],
            "title": row["title"],
            "url": row["url"],
            "description": row["description"],
        })
    return out
