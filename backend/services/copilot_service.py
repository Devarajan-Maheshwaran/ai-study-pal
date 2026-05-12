from __future__ import annotations
import os
import json


def get_copilot_response(
    message: str,
    subject: str = "General",
    weak_topics: list[str] = None,
    last_score: float = None,
    recent_summary: str = None,
) -> str:
    """
    Context-aware study copilot using Google Gemini.
    Injects real user state into the system prompt.
    Falls back to rule-based responses if API is unavailable.
    """
    weak_topics = weak_topics or []
    context_parts = [f"Subject: {subject}"]

    if weak_topics:
        context_parts.append(f"Weak topics: {', '.join(weak_topics)}")
    if last_score is not None:
        context_parts.append(f"Last quiz score: {round(last_score, 1)}%")
    if recent_summary:
        context_parts.append(f"Recent study material excerpt: {recent_summary[:500]}")

    context_str = "\n".join(context_parts)

    system_prompt = f"""You are StudyForge Copilot — a sharp, context-aware academic assistant.
You are NOT a generic chatbot. You are embedded inside a study platform and have access to the student's real learning data.

Student context:
{context_str}

Your job:
- Answer questions specifically about their study material and subject
- Give targeted advice based on their weak topics and quiz performance
- Be concise, sharp, and actionable — like a tutor who knows the student
- If asked what to study, reference their actual weak topics
- Never give generic motivational fluff; give specific, evidence-based guidance
- Keep responses under 200 words unless a detailed explanation is explicitly requested"""

    api_key = os.environ.get("GEMINI_API_KEY", "")

    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_prompt,
            )
            response = model.generate_content(message)
            return response.text.strip()
        except Exception as e:
            print(f"[COPILOT GEMINI ERROR] {e}")
            return _rule_based_response(message, subject, weak_topics, last_score)
    else:
        return _rule_based_response(message, subject, weak_topics, last_score)


def _rule_based_response(
    message: str,
    subject: str,
    weak_topics: list[str],
    last_score: float,
) -> str:
    """Deterministic fallback when Gemini API is not configured."""
    msg = message.lower()

    if any(w in msg for w in ["weak", "struggle", "bad", "fail", "poor"]):
        if weak_topics:
            return (
                f"Based on your quiz history, your weakest areas in {subject} are: "
                f"{', '.join(weak_topics)}. Focus your next study session on these topics. "
                f"Try re-reading the relevant sections and take the quiz again."
            )
        return f"Keep practicing {subject}. Take more quizzes to identify specific weak areas."

    if any(w in msg for w in ["study", "plan", "schedule", "next", "should"]):
        if weak_topics:
            return (
                f"For {subject}, prioritize: {', '.join(weak_topics[:3])}. "
                f"Spend 60% of your session on weak topics, 40% on review. "
                f"Then take a quiz to measure improvement."
            )
        return f"Upload your {subject} notes, generate a quiz, and track your score over sessions."

    if any(w in msg for w in ["score", "result", "performance", "progress"]):
        if last_score is not None:
            rating = "strong" if last_score >= 75 else ("decent" if last_score >= 55 else "needs work")
            return f"Your last quiz score in {subject} was {last_score}% — that's {rating}. {'Keep it up!' if last_score >= 75 else 'Focus on weak topics and try again.'}"
        return "Take a quiz to get your first performance reading."

    if any(w in msg for w in ["explain", "what is", "how does", "define"]):
        return (
            f"Upload your {subject} notes or paste the relevant text, then ask me to summarize "
            f"or explain a specific concept. I can also generate quiz questions to test your understanding."
        )

    return (
        f"I'm your StudyForge Copilot for {subject}. You can ask me to: explain concepts, "
        f"suggest what to study next, review your performance, or generate a study plan. "
        f"{'Your current weak topics are: ' + ', '.join(weak_topics) + '.' if weak_topics else ''}"
    )
