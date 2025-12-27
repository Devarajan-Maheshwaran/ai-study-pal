import os
import pandas as pd
from config import Config

DATA_PATH = os.path.join(Config.DATA_DIR, "resources.csv")

def get_resources_for_subject(subject: str, limit: int = 5):
    """
    resources.csv columns: subject, title, url, type(web/youtube)
    """
    if not os.path.exists(DATA_PATH):
        return []
    df = pd.read_csv(DATA_PATH)
    # simple scenario-based customization: match subject or 'General'
    df_sub = df[(df["subject"].str.lower() == subject.lower()) | (df["subject"] == "General")]
    df_sub = df_sub.head(limit)
    return df_sub.to_dict(orient="records")
