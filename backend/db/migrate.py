"""Run once to create all tables.
Usage: python -m backend.db.migrate
"""
from backend.db.database import engine, Base
import backend.db.models  # noqa: F401 — registers all models

def run():
    Base.metadata.create_all(bind=engine)
    print("[migrate] All tables created.")

if __name__ == "__main__":
    run()
