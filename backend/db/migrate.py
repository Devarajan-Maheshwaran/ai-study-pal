"""Create all tables. Run from repo root:
  python -m backend.db.migrate
Or from inside backend/:
  python -c "from db.migrate import run; run()"
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.db.database import engine, Base
import backend.db.models  # noqa

# Also ensure flashcard table exists (defined in routes/flashcards.py)
try:
    from backend.routes.flashcards import Flashcard  # noqa
except Exception:
    pass

def run():
    Base.metadata.create_all(bind=engine)
    print("[migrate] All tables created.")

if __name__ == "__main__":
    run()
