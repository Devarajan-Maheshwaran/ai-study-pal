"""Flashcard generation + SM-2 spaced-repetition review routes.

Phase 5 fix: removed per-request Base.metadata.create_all().
The Flashcard table is now registered in app.py and created once at startup.
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from backend.db.database import SessionLocal, Base
from backend.models.nlp_utils import extract_keywords
import uuid

bp = Blueprint("flashcards", __name__)


class Flashcard(Base):
    __tablename__ = "flashcards"
    id           = Column(String,  primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String,  nullable=False)
    front        = Column(Text,    nullable=False)
    back         = Column(Text,    nullable=False)
    repetitions  = Column(Integer, default=0)
    easiness     = Column(Float,   default=2.5)
    interval     = Column(Integer, default=1)
    next_review  = Column(DateTime, default=datetime.utcnow)
    created_at   = Column(DateTime, default=datetime.utcnow)


def _sm2(easiness: float, repetitions: int, interval: int, quality: int):
    if quality < 3:
        repetitions, interval = 0, 1
    else:
        interval    = 1 if repetitions == 0 else (6 if repetitions == 1 else round(interval * easiness))
        repetitions += 1
    easiness    = max(1.3, easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    next_review = datetime.utcnow() + timedelta(days=interval)
    return easiness, repetitions, interval, next_review


def _cards_from_text(text: str, workspace_id: str) -> list:
    keywords  = extract_keywords(text)
    sentences = [s.strip() for s in text.replace('\n', '. ').split('.') if len(s.strip().split()) > 5]
    cards = []
    for kw in keywords[:15]:
        matching = [s for s in sentences if kw.lower() in s.lower()]
        if matching:
            cards.append(Flashcard(workspace_id=workspace_id, front=f"What is '{kw}'?", back=matching[0][:300]))
    if len(cards) < 5:
        for s in sentences[:10]:
            words = s.split()
            if len(words) >= 6:
                bi         = len(words) // 2
                answer     = words[bi]
                words[bi]  = "______"
                cards.append(Flashcard(workspace_id=workspace_id, front=" ".join(words), back=answer))
    return cards[:20]


@bp.post("/api/flashcards/generate")
def generate_flashcards():
    data         = request.json or {}
    workspace_id = data.get("workspace_id", "")
    text         = (data.get("text") or "").strip()
    if not workspace_id:
        return jsonify({"error": "workspace_id required"}), 400
    if len(text.split()) < 20:
        return jsonify({"error": "text too short"}), 400
    db = SessionLocal()
    try:
        cards = _cards_from_text(text, workspace_id)
        for c in cards: db.add(c)
        db.commit()
        return jsonify({"generated": len(cards), "cards": [_card_dict(c) for c in cards]}), 201
    finally:
        db.close()


@bp.get("/api/flashcards/<ws_id>")
def list_flashcards(ws_id: str):
    db = SessionLocal()
    try:
        cards = db.query(Flashcard).filter_by(workspace_id=ws_id).order_by(Flashcard.next_review).all()
        due   = [c for c in cards if c.next_review <= datetime.utcnow()]
        return jsonify({"cards": [_card_dict(c) for c in cards], "due_count": len(due)})
    finally:
        db.close()


@bp.post("/api/flashcards/<card_id>/review")
def review_flashcard(card_id: str):
    quality = int((request.json or {}).get("quality", 3))
    db = SessionLocal()
    try:
        card = db.query(Flashcard).filter_by(id=card_id).first()
        if not card:
            return jsonify({"error": "Not found"}), 404
        card.easiness, card.repetitions, card.interval, card.next_review = \
            _sm2(card.easiness, card.repetitions, card.interval, quality)
        db.commit()
        return jsonify(_card_dict(card))
    finally:
        db.close()


def _card_dict(c: Flashcard) -> dict:
    return {
        "id":          c.id,
        "front":       c.front,
        "back":        c.back,
        "repetitions": c.repetitions,
        "easiness":    round(c.easiness, 2),
        "interval":    c.interval,
        "next_review": c.next_review.isoformat() if c.next_review else None,
        "due":         c.next_review <= datetime.utcnow() if c.next_review else True,
    }
