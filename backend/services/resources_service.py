from __future__ import annotations
import re
from models.nlp_utils import extract_keywords

RESOURCE_DB: list[dict] = [
    {"id": "ml1", "title": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "type": "course", "description": "Google's fast-paced intro to ML with TensorFlow.", "tags": ["machine learning", "supervised", "regression", "classification", "neural network", "gradient descent", "ml"]},
    {"id": "ml2", "title": "StatQuest - Machine Learning (Josh Starmer)", "url": "https://www.youtube.com/c/joshstarmer", "type": "video", "description": "Clearest visual explanations of ML algorithms on YouTube.", "tags": ["machine learning", "statistics", "supervised", "unsupervised", "random forest", "svm", "regression", "classification", "pca", "clustering", "bayes"]},
    {"id": "ml3", "title": "fast.ai - Practical Deep Learning", "url": "https://course.fast.ai", "type": "course", "description": "Top-down practical deep learning using PyTorch.", "tags": ["deep learning", "neural network", "cnn", "computer vision", "nlp", "transformer", "pytorch"]},
    {"id": "ml4", "title": "scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "article", "description": "Official scikit-learn docs with examples for every algorithm.", "tags": ["supervised", "unsupervised", "clustering", "regression", "classification", "svm", "random forest", "pca", "scikit", "sklearn", "machine learning"]},
    {"id": "ml5", "title": "Andrej Karpathy - Neural Networks: Zero to Hero", "url": "https://karpathy.ai/zero-to-hero.html", "type": "video", "description": "Build neural networks from scratch — backprop, GPT, pure Python.", "tags": ["neural network", "backpropagation", "deep learning", "gpt", "language model", "gradient descent"]},
    {"id": "sl1", "title": "MIT 6.036 - Introduction to Machine Learning", "url": "https://ocw.mit.edu/courses/6-036-introduction-to-machine-learning-fall-2020/", "type": "course", "description": "MIT's rigorous intro ML course covering supervised learning theory.", "tags": ["supervised", "classification", "regression", "svm", "decision tree", "loss function", "regularization", "bias variance", "empirical risk"]},
    {"id": "sl2", "title": "3Blue1Brown - Neural Networks", "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", "type": "video", "description": "Visual intuition for neural networks and gradient descent.", "tags": ["neural network", "gradient descent", "backpropagation", "supervised", "deep learning"]},
    {"id": "sl3", "title": "Towards Data Science - Supervised Learning Guide", "url": "https://towardsdatascience.com/supervised-learning-basics-of-classification-and-main-algorithms-c16b06806cd3", "type": "article", "description": "Clear walkthrough of supervised learning algorithms.", "tags": ["supervised", "classification", "regression", "svm", "decision tree", "logistic regression", "random forest", "ensemble", "boosting", "bagging"]},
    {"id": "sl4", "title": "Kaggle - Intro to Machine Learning", "url": "https://www.kaggle.com/learn/intro-to-machine-learning", "type": "practice", "description": "Hands-on supervised learning with decision trees and random forests.", "tags": ["supervised", "decision tree", "random forest", "regression", "classification", "overfitting", "bias variance"]},
    {"id": "ul1", "title": "Stanford CS229 - Unsupervised Learning Notes", "url": "https://cs229.stanford.edu/notes2022fall/main_notes.pdf", "type": "article", "description": "Andrew Ng's Stanford ML notes on unsupervised methods.", "tags": ["unsupervised", "clustering", "pca", "kmeans", "dimensionality reduction", "em algorithm", "gaussian mixture", "autoencoder"]},
    {"id": "ul2", "title": "Scikit-learn Clustering Guide", "url": "https://scikit-learn.org/stable/modules/clustering.html", "type": "article", "description": "Official guide to K-Means, DBSCAN, hierarchical clustering.", "tags": ["clustering", "kmeans", "dbscan", "hierarchical", "unsupervised", "silhouette", "wcss", "density"]},
    {"id": "ul3", "title": "StatQuest - PCA Explained Visually", "url": "https://www.youtube.com/watch?v=FgakZw6K1QQ", "type": "video", "description": "Best visual explanation of Principal Component Analysis.", "tags": ["pca", "dimensionality reduction", "covariance", "eigenvector", "eigenvalue", "unsupervised", "variance", "t-sne"]},
    {"id": "ul4", "title": "Towards Data Science - DBSCAN Clustering", "url": "https://towardsdatascience.com/how-dbscan-works-and-why-should-i-use-it-443271c4ed57", "type": "article", "description": "Intuitive guide to density-based clustering with DBSCAN.", "tags": ["dbscan", "clustering", "density", "noise", "unsupervised", "epsilon", "minpts"]},
    {"id": "rl1", "title": "David Silver - DeepMind RL Course (UCL)", "url": "https://www.davidsilver.uk/teaching/", "type": "course", "description": "The definitive RL course by the AlphaGo lead researcher.", "tags": ["reinforcement learning", "markov", "mdp", "q learning", "policy gradient", "value function", "bellman", "reward", "agent", "environment", "sarsa", "dqn", "exploration exploitation"]},
    {"id": "rl2", "title": "Spinning Up in Deep RL (OpenAI)", "url": "https://spinningup.openai.com/en/latest/", "type": "article", "description": "OpenAI's educational resource for deep RL.", "tags": ["reinforcement learning", "deep rl", "ppo", "sac", "actor critic", "policy gradient", "dqn", "reward", "markov", "mdp"]},
    {"id": "rl3", "title": "Hugging Face Deep RL Course", "url": "https://huggingface.co/learn/deep-rl-course/unit0/introduction", "type": "course", "description": "Free hands-on deep RL course from HuggingFace.", "tags": ["reinforcement learning", "dqn", "ppo", "q learning", "actor critic", "deep learning", "agent", "environment", "reward"]},
    {"id": "rl4", "title": "Lilian Weng - A (Long) Peek into RL", "url": "https://lilianweng.github.io/posts/2018-02-19-rl-overview/", "type": "article", "description": "Comprehensive RL overview: MDP to actor-critic.", "tags": ["reinforcement learning", "mdp", "q learning", "policy gradient", "actor critic", "bellman", "exploration exploitation", "sarsa", "markov"]},
    {"id": "dl1", "title": "Deep Learning Specialization (Coursera - Andrew Ng)", "url": "https://www.coursera.org/specializations/deep-learning", "type": "course", "description": "5-course specialization covering deep learning end to end.", "tags": ["deep learning", "neural network", "cnn", "rnn", "lstm", "optimization", "backpropagation", "batch normalization", "regularization"]},
    {"id": "dl2", "title": "The Deep Learning Book (Goodfellow et al.)", "url": "https://www.deeplearningbook.org", "type": "article", "description": "The canonical deep learning textbook, free online.", "tags": ["deep learning", "neural network", "optimization", "regularization", "cnn", "rnn", "generative", "backpropagation"]},
    {"id": "st1", "title": "Khan Academy - Statistics & Probability", "url": "https://www.khanacademy.org/math/statistics-probability", "type": "video", "description": "Probability, distributions, hypothesis testing from scratch.", "tags": ["statistics", "probability", "distribution", "hypothesis", "variance", "mean", "regression", "bayes", "entropy"]},
    {"id": "st2", "title": "3Blue1Brown - Essence of Linear Algebra", "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", "type": "video", "description": "Visual linear algebra: vectors, matrices, eigenvalues.", "tags": ["linear algebra", "matrix", "vector", "eigenvector", "eigenvalue", "transformation", "pca", "covariance"]},
    {"id": "st3", "title": "MIT OCW - Linear Algebra (Gilbert Strang)", "url": "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", "type": "course", "description": "Classic MIT linear algebra course.", "tags": ["linear algebra", "matrix", "vector", "eigenvalue", "svd", "projection", "covariance"]},
    {"id": "cs1", "title": "CS50 - Harvard Introduction to Computer Science", "url": "https://cs50.harvard.edu/x/", "type": "course", "description": "World's most popular intro CS course.", "tags": ["computer science", "programming", "algorithms", "data structures", "python", "c"]},
    {"id": "cs2", "title": "MIT OCW - Introduction to Algorithms", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", "type": "course", "description": "Rigorous algorithm design and analysis.", "tags": ["algorithms", "data structures", "sorting", "graphs", "dynamic programming", "complexity"]},
    {"id": "pt1", "title": "Kaggle Learn - Free ML Mini-Courses", "url": "https://www.kaggle.com/learn", "type": "practice", "description": "Hands-on ML mini-courses with notebooks.", "tags": ["machine learning", "deep learning", "python", "data science", "supervised", "unsupervised", "reinforcement learning", "neural network", "feature engineering"]},
    {"id": "pt2", "title": "Papers With Code", "url": "https://paperswithcode.com", "type": "article", "description": "SOTA ML papers with open-source implementations.", "tags": ["deep learning", "machine learning", "research", "state of the art", "neural network", "transformer", "reinforcement learning"]},
    {"id": "pt3", "title": "Anki - Spaced Repetition Flashcards", "url": "https://apps.ankiweb.net", "type": "tool", "description": "Best-in-class spaced repetition for memorization.", "tags": ["study", "memorization", "flashcard", "spaced repetition"]},
    {"id": "ph1", "title": "The Feynman Lectures on Physics", "url": "https://www.feynmanlectures.caltech.edu", "type": "article", "description": "Classic physics lectures by Richard Feynman, freely available.", "tags": ["physics", "mechanics", "electromagnetism", "quantum", "thermodynamics"]},
    {"id": "ph2", "title": "Khan Academy - Physics", "url": "https://www.khanacademy.org/science/physics", "type": "video", "description": "Structured physics from mechanics to electromagnetism.", "tags": ["physics", "mechanics", "force", "energy", "waves", "electromagnetism"]},
    {"id": "g1", "title": "Wikipedia", "url": "https://www.wikipedia.org", "type": "article", "description": "Quick reference for any concept.", "tags": []},
    {"id": "g2", "title": "MIT OpenCourseWare", "url": "https://ocw.mit.edu", "type": "course", "description": "Free MIT courses across all disciplines.", "tags": []}
]


def _clean_subject(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", "", text.lower()).strip()


def _score_resource(resource: dict, query_tokens: set) -> int:
    score = 0
    joined = " ".join(query_tokens)
    for tag in resource["tags"]:
        tag_words = set(tag.lower().split())
        overlap = tag_words & query_tokens
        score += len(overlap) * 2
        if tag.lower() in joined:
            score += 3
    return score


def get_resources(subject: str, topics: list = None, accuracy: float = 0.5) -> list[dict]:
    raw_query = subject
    if topics:
        raw_query = raw_query + " " + " ".join(topics)

    query_clean = _clean_subject(raw_query)
    query_tokens = set(query_clean.split())

    if len(subject) > 20:
        try:
            kw = extract_keywords(subject, top_n=10)
            query_tokens.update(w.lower() for w in kw)
        except Exception:
            pass

    scored = []
    for resource in RESOURCE_DB:
        score = _score_resource(resource, query_tokens)
        if score > 0:
            scored.append((score, resource))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = [r for _, r in scored]

    if accuracy >= 0.75:
        type_order = ["article", "practice", "video", "course", "tool"]
    else:
        type_order = ["course", "video", "article", "practice", "tool"]

    results.sort(key=lambda r: (
        -_score_resource(r, query_tokens),
        type_order.index(r["type"]) if r["type"] in type_order else 99
    ))

    if len(results) < 4:
        fallback_ids = {r["id"] for r in results}
        for r in RESOURCE_DB:
            if r["id"] not in fallback_ids and not r["tags"]:
                results.append(r)

    return results[:8]
