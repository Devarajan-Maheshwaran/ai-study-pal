"""Quiz ML model — difficulty classifier + MCQ generator.
Upgraded to a highly intelligent Bloom's Taxonomy & readability classifier
combined with a POS and casing aligned distractor generator.
100% offline, zero heavy HuggingFace/cloud dependencies.
"""
import os
import re
import random
import threading
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk

# Download NLTK data asynchronously so it doesn't block cold starts
def _nltk_download():
    for pkg in ["punkt", "stopwords", "averaged_perceptron_tagger", "punkt_tab"]:
        try:
            nltk.download(pkg, quiet=True)
        except Exception:
            pass

threading.Thread(target=_nltk_download, daemon=True).start()

_PREFERRED_POS = {"NN", "NNS", "NNP", "NNPS", "VBG"}

_LATEX_DISPLAY = re.compile(r"\$\$.*?\$\$", re.DOTALL)
_LATEX_INLINE  = re.compile(r"\$[^\$]+?\$")
_EXTRA_WS      = re.compile(r"\s+")
_ASCII_DIAGRAM = re.compile(r"[\u2502\u251c\u2514\u250c\u2510\u2518\u2524\u252c\u2534\u253c\u2500\u2550\u2554\u2557\u255a\u255d\u2560\u2563\u2566\u2569\u256a\u25bc\u25b2\u25c4\u25ba\[\]]+")


def _clean(text: str) -> str:
    text = _LATEX_DISPLAY.sub(" ", text)
    text = _LATEX_INLINE.sub(" ", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    text = _ASCII_DIAGRAM.sub(" ", text)
    text = re.sub(r"[^\w\s.,!?;:'\"()-]", " ", text)
    return _EXTRA_WS.sub(" ", text).strip()


def classify_difficulty(questions: list) -> list:
    """
    Classify questions into 'easy', 'medium', or 'hard' using a hybrid
    syntactic complexity and cognitive depth (Bloom's Taxonomy) scoring model.
    """
    results = []
    for q in questions:
        q_lower = q.lower()
        words = [w for w in re.findall(r'\w+', q) if w.isalpha()]
        if not words:
            results.append("medium")
            continue
        
        # 1. Bloom's Taxonomy cognitive depth indicators
        easy_kws = ["what is", "define", "name", "who", "list", "identify", "select", "where", "when", "state"]
        hard_kws = ["critically", "analyze", "derive", "schrodinger", "godel", "first principles", "contrast", "regularization", "implication", "optimality", "bellman"]
        
        has_hard = any(k in q_lower for k in hard_kws)
        has_easy = any(k in q_lower for k in easy_kws)
        
        # 2. Syntactic & vocabulary complexity metrics
        avg_word_len = sum(len(w) for w in words) / len(words)
        sentence_len = len(words)
        
        # Sophisticated words (character length > 7)
        long_words = sum(1 for w in words if len(w) > 7)
        long_word_ratio = long_words / len(words)
        
        # Simple proxy for syllable count (vowels)
        total_syllables = sum(max(1, len(re.findall(r'[aeiouyAEIOUY]', w))) for w in words)
        syllables_per_word = total_syllables / len(words)
        
        # Calculate cognitive difficulty score
        score = 0
        if sentence_len > 16:
            score += 2
        elif sentence_len > 10:
            score += 1
            
        if avg_word_len > 5.5:
            score += 2
        elif avg_word_len > 4.5:
            score += 1
            
        if long_word_ratio > 0.25:
            score += 2
        elif long_word_ratio > 0.15:
            score += 1
            
        if syllables_per_word > 1.8:
            score += 1
            
        if has_hard:
            score += 3
        if has_easy:
            score -= 2
            
        # Determine classification label
        if score >= 5:
            results.append("hard")
        elif score >= 2:
            results.append("medium")
        else:
            results.append("easy")
    return results


def _extract_key_sentences(text: str, n: int) -> list:
    sentences = [s.strip() for s in sent_tokenize(_clean(text)) if len(s.split()) >= 8 and not re.match(r'^[\W\d\s]+$', s)]
    if not sentences:
        return []
    tfidf = TfidfVectorizer(stop_words="english")
    try:
        scores  = tfidf.fit_transform(sentences).sum(axis=1).A1
        top_idx = scores.argsort()[::-1][:n * 3]
        return [sentences[i] for i in sorted(top_idx)]
    except Exception:
        return sentences[:n * 2]


def _build_pos_pool(sentences: list, stop: set) -> list[tuple[str, str]]:
    pool = []
    for sent in sentences:
        tokens = word_tokenize(sent)
        try:
            tagged = nltk.pos_tag(tokens)
            pool.extend([(w, pos) for w, pos in tagged if pos in _PREFERRED_POS and w.lower() not in stop and len(w) > 3 and w.isalpha()])
        except Exception:
            pool.extend([(w, "NN") for w in tokens if w.lower() not in stop and len(w) > 3 and w.isalpha()])
            
    seen, unique = set(), []
    for w, pos in pool:
        if w.lower() not in seen:
            seen.add(w.lower())
            unique.append((w, pos))
    return unique


def _pick_answer_word(tagged: list, used: set, stop: set):
    candidates = [w for w, pos in tagged if pos in _PREFERRED_POS and w.lower() not in stop and len(w) > 4 and w.isalpha() and w.lower() not in used]
    return sorted(candidates, key=len, reverse=True)[0] if candidates else None


def _make_distractors(correct: str, correct_pos: str, pos_pool: list[tuple[str, str]], n: int = 3) -> list[str]:
    is_numeric = correct.isdigit()
    is_title = correct.istitle()
    
    candidates = []
    
    # 1. Numeric distractors generator
    if is_numeric:
        try:
            val = int(correct)
            step = 5 if val > 100 else 1
            generated = [str(val + step), str(val - step), str(val + 2*step), str(val - 2*step)]
            candidates.extend([g for g in generated if int(g) >= 0])
        except ValueError:
            pass
            
    # 2. Extract similar Part of Speech candidates from the pool
    for w, pos in pos_pool:
        if w.lower() == correct.lower():
            continue
            
        pos_match = False
        if correct_pos.startswith("NNP") and pos.startswith("NNP"):
            pos_match = True
        elif correct_pos.startswith("NN") and pos.startswith("NN"):
            pos_match = True
        elif correct_pos.startswith("VB") and pos.startswith("VB"):
            pos_match = True
        elif correct_pos == pos:
            pos_match = True
            
        if pos_match:
            # Force case alignment
            if is_title and not w.istitle():
                w = w.capitalize()
            candidates.append(w)
            
    # Fallback to general pool if pos alignment matches are too few
    if len(candidates) < n:
        for w, _ in pos_pool:
            if w.lower() != correct.lower() and w not in candidates:
                if is_title:
                    w = w.capitalize()
                candidates.append(w)
                
    random.shuffle(candidates)
    result = []
    for c in candidates:
        if c.lower() not in [r.lower() for r in result]:
            result.append(c)
            if len(result) == n:
                break
                
    fallback = ["None of the above", "All of the above", "Cannot be determined"]
    i = 0
    while len(result) < n:
        result.append(fallback[i % 3])
        i += 1
        
    return result


def generate_mcqs(text: str, num_questions: int = 5) -> list:
    try:
        key_sentences = _extract_key_sentences(text, num_questions)
        if not key_sentences:
            return []
        stop       = set(stopwords.words("english"))
        all_tagged = []
        for sent in key_sentences:
            tokens = word_tokenize(sent)
            try:
                all_tagged.append(nltk.pos_tag(tokens))
            except Exception:
                all_tagged.append([(w, "NN") for w in tokens])
                
        pos_pool      = _build_pos_pool(key_sentences, stop)
        questions: list = []
        used_answers: set = set()
        for i, sentence in enumerate(key_sentences):
            if len(questions) >= num_questions:
                break
            correct = _pick_answer_word(all_tagged[i], used_answers, stop)
            if not correct:
                continue
                
            # Retrieve correct POS tag
            correct_pos = "NN"
            for w, pos in all_tagged[i]:
                if w.lower() == correct.lower():
                    correct_pos = pos
                    break
                    
            used_answers.add(correct.lower())
            blanked       = re.sub(r'\b' + re.escape(correct) + r'\b', "______", sentence, count=1, flags=re.IGNORECASE)
            question_text = f"Fill in the blank: {blanked}"
            options       = [correct] + _make_distractors(correct, correct_pos, pos_pool)
            random.shuffle(options)
            
            topic_words = [w for w, _ in all_tagged[i] if w.lower() not in stop and w.isalpha() and len(w) > 4]
            questions.append({
                "id": f"q_{len(questions)+1}",
                "question": question_text,
                "stem": sentence,
                "options": options,
                "answer": correct,
                "difficulty": classify_difficulty([question_text])[0],
                "topic": topic_words[0].capitalize() if topic_words else "General"
            })
        return questions
    except Exception as e:
        print(f"[MCQ ERROR] {e}")
        return []

