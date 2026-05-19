"""
Bayesian Knowledge Tracing (BKT) — Per-Topic Mastery Estimator
===============================================================
Estimates a student's mastery probability for each topic using a simplified
two-state Hidden Markov Model (the classic BKT formulation).

Model parameters (industry defaults, tunable per subject):
  p_init   — prior probability student already knows the skill before practice
  p_learn  — probability of transitioning from not-knowing to knowing after one opportunity
  p_slip   — probability of answering incorrectly despite knowing (careless error)
  p_guess  — probability of answering correctly without knowing (lucky guess)

Update rule (per quiz attempt on a topic):
  Given observed correctness c ∈ {0, 1} and current mastery estimate p_k:

  Likelihood of observation given known:    P(c | known)
    = (1 - p_slip)  if c == 1
    = p_slip        if c == 0

  Likelihood of observation given unknown:  P(c | unknown)
    = p_guess       if c == 1
    = (1 - p_guess) if c == 0

  Posterior (Bayes update):
    p_k_given_c = p_k * P(c|known) / [p_k * P(c|known) + (1-p_k) * P(c|unknown)]

  Learning transition:
    p_k_new = p_k_given_c + (1 - p_k_given_c) * p_learn

References:
  Corbett & Anderson (1994) — Knowledge tracing: Modeling the acquisition of
  procedural knowledge. User Modeling and User-Adapted Interaction, 4(4), 253-278.

To integrate with the dashboard:
    from services.mastery_service import compute_topic_mastery
    mastery = compute_topic_mastery(attempts)  # list of {topic, correct, total}

To run (no pytest needed, runs as script):
    python backend/services/mastery_service.py
"""

from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# BKT parameters
# ---------------------------------------------------------------------------

@dataclass
class BKTParams:
    p_init:  float = 0.30   # prior mastery
    p_learn: float = 0.20   # learning rate per opportunity
    p_slip:  float = 0.10   # slip (know but wrong)
    p_guess: float = 0.20   # guess (don't know but right)


_DEFAULT_PARAMS = BKTParams()


# ---------------------------------------------------------------------------
# Core BKT update
# ---------------------------------------------------------------------------

def _bkt_update(p_k: float, correct: bool, params: BKTParams) -> float:
    """
    Apply one Bayes update + learning transition.
    Returns updated mastery probability.
    """
    if correct:
        p_obs_known   = 1.0 - params.p_slip
        p_obs_unknown = params.p_guess
    else:
        p_obs_known   = params.p_slip
        p_obs_unknown = 1.0 - params.p_guess

    # Bayes posterior
    numerator   = p_k * p_obs_known
    denominator = numerator + (1.0 - p_k) * p_obs_unknown
    p_k_given_c = numerator / denominator if denominator > 0 else p_k

    # Learning transition
    p_k_new = p_k_given_c + (1.0 - p_k_given_c) * params.p_learn

    return round(min(max(p_k_new, 0.0), 1.0), 4)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def estimate_topic_mastery(
    attempts: list[dict],
    topic: str,
    params: Optional[BKTParams] = None,
) -> dict:
    """
    Estimate mastery for a single topic from a sequence of quiz attempts.

    Args:
        attempts: List of dicts with keys:
                    - 'topic'   (str)
                    - 'correct' (int: questions answered correctly)
                    - 'total'   (int: total questions on that topic)
                  Ordered oldest-first for correct temporal updating.
        topic:    The topic name to compute mastery for.
        params:   Optional BKTParams override.

    Returns:
        {
            "topic":        str,
            "mastery":      float (0-1),
            "label":        "mastered" | "learning" | "struggling",
            "n_attempts":   int,
            "trend":        "improving" | "flat" | "declining"
        }
    """
    if params is None:
        params = _DEFAULT_PARAMS

    topic_attempts = [
        a for a in attempts
        if str(a.get("topic", "")).lower() == topic.lower()
    ]

    p_k = params.p_init
    history = [p_k]

    for attempt in topic_attempts:
        total   = max(1, int(attempt.get("total",   1)))
        correct = min(int(attempt.get("correct", 0)), total)
        # Treat each question as an independent BKT opportunity
        for q in range(total):
            is_correct = q < correct
            p_k = _bkt_update(p_k, is_correct, params)
        history.append(p_k)

    # Mastery label
    if p_k >= 0.80:
        label = "mastered"
    elif p_k >= 0.50:
        label = "learning"
    else:
        label = "struggling"

    # Trend: compare last two windows
    if len(history) >= 3:
        mid   = len(history) // 2
        first_half = sum(history[:mid])  / max(1, mid)
        second_half= sum(history[mid:])  / max(1, len(history) - mid)
        delta = second_half - first_half
        trend = "improving" if delta > 0.05 else ("declining" if delta < -0.05 else "flat")
    else:
        trend = "flat"

    return {
        "topic":      topic,
        "mastery":    round(p_k, 3),
        "label":      label,
        "n_attempts": len(topic_attempts),
        "trend":      trend,
    }


def compute_topic_mastery(
    attempts: list[dict],
    params: Optional[BKTParams] = None,
) -> list[dict]:
    """
    Compute mastery for ALL topics found in the attempts list.

    Returns a list of mastery dicts sorted by mastery ascending
    (lowest mastery first, so the dashboard can highlight weak spots).
    """
    topics = list(dict.fromkeys(
        str(a.get("topic", "General")) for a in attempts
    ))
    results = [estimate_topic_mastery(attempts, t, params) for t in topics]
    return sorted(results, key=lambda x: x["mastery"])


# ---------------------------------------------------------------------------
# Quick smoke test (run as script)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    sample_attempts = [
        {"topic": "Photosynthesis", "correct": 2, "total": 5},
        {"topic": "Photosynthesis", "correct": 4, "total": 5},
        {"topic": "Photosynthesis", "correct": 5, "total": 5},
        {"topic": "Newton Laws",    "correct": 1, "total": 5},
        {"topic": "Newton Laws",    "correct": 2, "total": 5},
        {"topic": "Cell Biology",   "correct": 0, "total": 5},
    ]
    results = compute_topic_mastery(sample_attempts)
    print(f"\n{'Topic':<20} {'Mastery':>8} {'Label':<12} {'Trend':<12} {'Attempts':>8}")
    print("-" * 60)
    for r in results:
        print(f"{r['topic']:<20} {r['mastery']:>8.3f} {r['label']:<12} {r['trend']:<12} {r['n_attempts']:>8}")
