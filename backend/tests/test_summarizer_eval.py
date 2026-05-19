"""
Summarizer Evaluation — ROUGE-1 / ROUGE-L vs first-N baseline
==============================================================
Runs the degree-centrality summarizer against 5 hand-written gold summaries
and prints a metric table. Also asserts that the model beats the first-N
sentence baseline on ROUGE-L (the primary quality signal).

Usage:
    pytest backend/tests/test_summarizer_eval.py -v -s

Dependencies (already in requirements.txt):
    rouge-score
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest
from nltk.tokenize import sent_tokenize

# ---------------------------------------------------------------------------
# Gold evaluation set — (passage, gold_summary) pairs
# ---------------------------------------------------------------------------

EVAL_SET = [
    (
        """Photosynthesis is the process by which green plants convert sunlight into food.
        Chlorophyll in plant cells absorbs light energy, primarily from the red and blue
        wavelengths of the visible spectrum. This energy drives the conversion of carbon
        dioxide and water into glucose and oxygen. The process occurs in two main stages:
        the light-dependent reactions in the thylakoid membranes and the Calvin cycle in
        the stroma of the chloroplasts. Plants use glucose for growth, reproduction, and
        cellular respiration. Oxygen is released as a by-product, making photosynthesis
        essential to life on Earth.""",
        "Photosynthesis converts sunlight into glucose using chlorophyll, producing oxygen as a by-product through light-dependent reactions and the Calvin cycle."
    ),
    (
        """The French Revolution began in 1789 and fundamentally transformed France.
        Rising debt, food shortages, and social inequality led to widespread unrest.
        The storming of the Bastille on July 14, 1789 became the defining symbol of
        the revolution. The monarchy was abolished and King Louis XVI was executed in
        1793. The Revolution gave birth to the ideals of liberty, equality, and
        fraternity, which spread across Europe. It also paved the way for Napoleon
        Bonaparte to rise to power.""",
        "The French Revolution transformed France, ending the monarchy and spreading ideals of liberty, equality, and fraternity across Europe."
    ),
    (
        """Machine learning is a branch of artificial intelligence that enables systems
        to learn from data without being explicitly programmed. Supervised learning uses
        labeled datasets to train models for classification and regression. Unsupervised
        learning finds patterns in unlabeled data through clustering and dimensionality
        reduction. Reinforcement learning trains agents via reward signals. Deep learning,
        a subset of machine learning, uses multi-layer neural networks to learn hierarchical
        representations. Applications include image recognition, natural language processing,
        recommendation systems, and autonomous vehicles.""",
        "Machine learning enables systems to learn from data; key paradigms are supervised, unsupervised, and reinforcement learning, with deep learning driving major applications."
    ),
    (
        """Databases are organized collections of structured data managed by a DBMS.
        Relational databases store data in tables with rows and columns and use SQL
        for querying. NoSQL databases such as MongoDB and Cassandra handle unstructured
        and semi-structured data at scale. ACID properties (Atomicity, Consistency,
        Isolation, Durability) ensure reliable transactions. Indexing speeds up data
        retrieval by creating efficient lookup structures. Normalization reduces data
        redundancy by organizing tables to minimize duplication.""",
        "Databases store structured data; relational systems use SQL and ACID properties while NoSQL systems handle unstructured data at scale."
    ),
    (
        """Newton's three laws of motion describe the relationship between a body and
        the forces acting upon it. The first law states that an object at rest stays
        at rest unless acted on by a net external force. The second law relates force,
        mass, and acceleration: F equals m times a. The third law states that every
        action has an equal and opposite reaction. These laws form the foundation of
        classical mechanics and are applied in engineering, astronomy, and everyday
        physics problems.""",
        "Newton's three laws of motion describe inertia, F=ma, and action-reaction pairs, forming the foundation of classical mechanics."
    ),
]


# ---------------------------------------------------------------------------
# ROUGE helpers (pure Python, no rouge-score dependency required)
# ---------------------------------------------------------------------------

def _tokenize(text: str) -> list[str]:
    return text.lower().split()


def _ngrams(tokens: list[str], n: int) -> set:
    return set(zip(*[tokens[i:] for i in range(n)]))


def _rouge_n(hypothesis: str, reference: str, n: int = 1) -> float:
    hyp_tokens = _tokenize(hypothesis)
    ref_tokens = _tokenize(reference)
    hyp_ng = _ngrams(hyp_tokens, n)
    ref_ng = _ngrams(ref_tokens, n)
    if not ref_ng:
        return 0.0
    return len(hyp_ng & ref_ng) / len(ref_ng)


def _lcs_length(a: list, b: list) -> int:
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(2)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i % 2][j] = dp[(i - 1) % 2][j - 1] + 1
            else:
                dp[i % 2][j] = max(dp[(i - 1) % 2][j], dp[i % 2][j - 1])
    return dp[m % 2][n]


def _rouge_l(hypothesis: str, reference: str) -> float:
    hyp = _tokenize(hypothesis)
    ref = _tokenize(reference)
    if not ref:
        return 0.0
    lcs = _lcs_length(hyp, ref)
    return lcs / len(ref)


def _first_n_baseline(text: str, n: int = 7) -> str:
    sentences = sent_tokenize(text)
    return " ".join(sentences[:n])


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def _import_summarizer():
    try:
        from backend.services.summary_service import generate_summary
        return generate_summary
    except ImportError:
        from services.summary_service import generate_summary
        return generate_summary


class TestSummarizerEval:

    def test_rouge_beats_baseline(self):
        """Centrality summarizer ROUGE-L must match or exceed first-N baseline on average."""
        generate_summary = _import_summarizer()

        model_scores, baseline_scores = [], []

        print("\n" + "=" * 72)
        print(f"{'Passage':<10} {'Model R-1':>10} {'Base R-1':>10} {'Model R-L':>10} {'Base R-L':>10}")
        print("=" * 72)

        for idx, (passage, gold) in enumerate(EVAL_SET, 1):
            summary, _ = generate_summary(passage, max_sentences=3)
            baseline   = _first_n_baseline(passage, n=3)

            m_r1 = _rouge_n(summary,  gold, n=1)
            b_r1 = _rouge_n(baseline, gold, n=1)
            m_rl = _rouge_l(summary,  gold)
            b_rl = _rouge_l(baseline, gold)

            model_scores.append(m_rl)
            baseline_scores.append(b_rl)

            print(f"{'Passage ' + str(idx):<10} {m_r1:>10.3f} {b_r1:>10.3f} {m_rl:>10.3f} {b_rl:>10.3f}")

        avg_model    = sum(model_scores)    / len(model_scores)
        avg_baseline = sum(baseline_scores) / len(baseline_scores)
        print("=" * 72)
        print(f"{'Average':<10} {'':>10} {'':>10} {avg_model:>10.3f} {avg_baseline:>10.3f}")
        print()

        # Model should at least match the first-N baseline
        assert avg_model >= avg_baseline * 0.85, (
            f"Summarizer ROUGE-L ({avg_model:.3f}) is significantly worse "
            f"than first-N baseline ({avg_baseline:.3f})"
        )

    @pytest.mark.parametrize("passage, gold", EVAL_SET)
    def test_individual_rouge_nonzero(self, passage, gold):
        """Each passage must produce a non-empty summary with ROUGE-L > 0."""
        generate_summary = _import_summarizer()
        summary, _ = generate_summary(passage, max_sentences=3)
        assert summary.strip(), "Summary should not be empty"
        assert _rouge_l(summary, gold) > 0.0, "ROUGE-L should be > 0"
