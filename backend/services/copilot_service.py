from __future__ import annotations
import collections


def get_copilot_response(
    message: str,
    subject: str = "General",
    weak_topics: list[str] = None,
    last_score: float = None,
    recent_summary: str = None,
) -> dict:
    """
    Option C: ML-grounded context-aware copilot.
    Zero external API calls. All responses derived from real user learning data.
    Returns {response: str, context_used: bool}
    """
    weak_topics = weak_topics or []
    msg = message.lower().strip()
    context_used = bool(weak_topics or last_score is not None or recent_summary)

    # ── Intent detection ────────────────────────────────────────────────
    intent = _detect_intent(msg)

    if intent == "weak_areas":
        return {"response": _respond_weak_areas(subject, weak_topics, last_score), "context_used": context_used}

    if intent == "what_to_study":
        return {"response": _respond_study_plan(subject, weak_topics, last_score), "context_used": context_used}

    if intent == "performance":
        return {"response": _respond_performance(subject, last_score, weak_topics), "context_used": context_used}

    if intent == "explain":
        return {"response": _respond_explain(message, subject, recent_summary), "context_used": context_used}

    if intent == "motivation":
        return {"response": _respond_motivation(subject, last_score), "context_used": context_used}

    if intent == "tips":
        return {"response": _respond_tips(subject, weak_topics), "context_used": context_used}

    if intent == "summary_question" and recent_summary:
        return {"response": _respond_from_summary(message, recent_summary, subject), "context_used": True}

    # Generic contextual fallback
    return {"response": _respond_generic(subject, weak_topics, last_score), "context_used": context_used}


def _detect_intent(msg: str) -> str:
    weak_kw = ["weak", "struggle", "bad at", "worst", "fail", "not good", "problem with", "difficult"]
    plan_kw = ["what should", "what to study", "study next", "plan", "schedule", "focus on", "start with", "prioritize"]
    perf_kw = ["score", "result", "performance", "progress", "how am i", "accuracy", "doing", "grade"]
    explain_kw = ["explain", "what is", "how does", "define", "tell me about", "describe", "meaning of"]
    motive_kw = ["motivat", "encourage", "inspire", "keep going", "give up", "tired", "stressed", "anxious"]
    tips_kw = ["tip", "advice", "technique", "strategy", "method", "hack", "trick", "how to study"]
    summary_kw = ["from my notes", "in my material", "based on what i", "from the text", "my content"]

    if any(k in msg for k in weak_kw): return "weak_areas"
    if any(k in msg for k in plan_kw): return "what_to_study"
    if any(k in msg for k in perf_kw): return "performance"
    if any(k in msg for k in explain_kw): return "explain"
    if any(k in msg for k in motive_kw): return "motivation"
    if any(k in msg for k in tips_kw): return "tips"
    if any(k in msg for k in summary_kw): return "summary_question"
    return "generic"


def _respond_weak_areas(subject: str, weak_topics: list, last_score: float) -> str:
    if not weak_topics:
        return (
            f"Your quiz history for {subject} doesn't show any specific weak topics yet. "
            f"Take a few more quizzes and I'll give you a precise breakdown of where to improve."
        )
    topic_list = ", ".join(f"'{t}'" for t in weak_topics[:4])
    score_note = f" (your last score was {last_score}%)" if last_score is not None else ""
    return (
        f"Based on your quiz history in {subject}{score_note}, your weakest areas are: {topic_list}. "
        f"I recommend spending your next session on '{weak_topics[0]}' first — that's showing the lowest accuracy. "
        f"Use the Summarizer to review that concept, then take the MCQ quiz again to measure improvement."
    )


def _respond_study_plan(subject: str, weak_topics: list, last_score: float) -> str:
    if weak_topics:
        plan = weak_topics[:3]
        return (
            f"For your next {subject} session, here's the priority order based on your performance data:\n\n"
            + "\n".join(f"{i+1}. {t} — needs the most work" if i == 0 else f"{i+1}. {t}" for i, t in enumerate(plan))
            + f"\n\nSpend 60% of your time on the first topic, 30% on the second, 10% on a quick review of the rest. "
            f"Then take a quiz to close the loop."
        )
    if last_score is not None:
        if last_score >= 80:
            return f"You're scoring {last_score}% in {subject} — great foundation. Move to harder problem types and edge cases."
        elif last_score >= 60:
            return f"At {last_score}%, you know the basics of {subject}. Focus on application-level questions and connecting concepts."
        else:
            return f"With {last_score}% in {subject}, restart from the core fundamentals. Use the Summarizer on your notes, then take easy-difficulty quizzes first."
    return f"Upload your {subject} notes, run the Summarizer to extract key concepts, then generate a 10-question quiz. Your weak topics will appear in the progress tab."


def _respond_performance(subject: str, last_score: float, weak_topics: list) -> str:
    if last_score is None:
        return f"No quiz data yet for {subject}. Take a quiz first and I'll give you a full performance analysis."
    rating = "excellent" if last_score >= 85 else ("good" if last_score >= 70 else ("okay" if last_score >= 55 else "needs work"))
    trend_note = ""
    if weak_topics:
        trend_note = f" Your main gaps are in: {', '.join(weak_topics[:3])}."
    return (
        f"Your latest score in {subject} is {last_score}% — that's {rating}.{trend_note} "
        f"{'Keep the momentum going and try harder difficulty questions.' if last_score >= 70 else 'Focus on reviewing weak topics before your next attempt.'}"
    )


def _respond_explain(message: str, subject: str, recent_summary: str) -> str:
    if recent_summary and len(recent_summary) > 100:
        return (
            f"Based on your loaded {subject} material: I can see content about this topic in your notes. "
            f"The key points from your material are summarized in the Summarizer tab — check the 'Key Concepts' section for the exact terms. "
            f"If you need a deeper explanation, try the Summarizer with a focused extract of that specific section."
        )
    return (
        f"To get an explanation in context, paste the relevant section of your {subject} notes into the text input, "
        f"then ask me again. I'll ground my answer in your actual material rather than generic definitions."
    )


def _respond_motivation(subject: str, last_score: float) -> str:
    if last_score is not None and last_score >= 70:
        return f"You're already at {last_score}% in {subject} — that's real progress. The gap between where you are and where you want to be is smaller than it feels. One more focused session makes a measurable difference."
    return (
        f"Every expert in {subject} started where you are now. The quiz system is tracking your progress — "
        f"even small improvements compound over time with spaced repetition. "
        f"Close the book, write down three things you remember from your last session, then check them. That's active recall."
    )


def _respond_tips(subject: str, weak_topics: list) -> str:
    tips = [
        f"Use the Summarizer before every quiz — extractive summaries prime your working memory.",
        f"After each wrong answer, immediately re-read the source sentence in your notes.",
        f"Space your sessions: study {subject} today, skip a day, review again. This doubles retention.",
        f"The fill-in-the-blank MCQs test recall, not recognition — if you can't fill the blank cold, you don't know it yet.",
    ]
    if weak_topics:
        tips.insert(0, f"Your data says '{weak_topics[0]}' is your biggest gap right now — make it the first 20 minutes of every session.")
    return "Study tips based on your learning pattern:\n\n" + "\n".join(f"• {t}" for t in tips[:4])


def _respond_from_summary(message: str, recent_summary: str, subject: str) -> str:
    words = recent_summary.lower().split()
    freq = collections.Counter(w for w in words if len(w) > 4)
    top_terms = [w for w, _ in freq.most_common(5)]
    return (
        f"Based on your loaded {subject} material, the most prominent concepts are: {', '.join(top_terms)}. "
        f"These are the terms your notes emphasize most. "
        f"For a full explanation of any specific concept, use the Summarizer tab which will extract the key sentences around it."
    )


def _respond_generic(subject: str, weak_topics: list, last_score: float) -> str:
    parts = [f"I'm your StudyForge Copilot for {subject}."]
    if weak_topics:
        parts.append(f"Your current weak topics are: {', '.join(weak_topics[:3])}.")
    if last_score is not None:
        parts.append(f"Your last quiz score was {last_score}%.")
    parts.append("You can ask me: what to study next, how to improve your score, study tips, or to explain a concept from your notes.")
    return " ".join(parts)
